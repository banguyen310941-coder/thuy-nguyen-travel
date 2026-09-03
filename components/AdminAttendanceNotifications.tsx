"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ATTENDANCE_EVENT,
  dateAtTime,
  localDateKey,
  readAttendanceConfig,
  readAttendanceNotices,
  readAttendanceRecords,
  saveAttendanceNotices,
  scheduleForDate,
  type AttendanceNotice,
} from "@/lib/attendance";

const SEEN_KEY = "happygo_attendance_notification_seen_v1";

function readSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
}

export function AdminAttendanceNotifications({
  staffId,
  onOpen,
}: {
  staffId: string;
  onOpen: () => void;
}) {
  const [items, setItems] = useState<AttendanceNotice[]>([]);
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const load = () => {
      setItems(readAttendanceNotices());
      setSeen(readSeen());
    };
    load();
    window.addEventListener(ATTENDANCE_EVENT, load);
    window.addEventListener("storage", load);
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => {
      window.removeEventListener(ATTENDANCE_EVENT, load);
      window.removeEventListener("storage", load);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!staffId) return;
    const config = readAttendanceConfig();
    const today = localDateKey(now);
    const schedule = scheduleForDate(today, config);
    const start = dateAtTime(today, schedule.start);
    const end = dateAtTime(today, schedule.end);
    const record = readAttendanceRecords().find(
      (item) => item.staffId === staffId && item.date === today,
    );
    const notices = readAttendanceNotices();
    let created: AttendanceNotice | null = null;
    if (!record && now.getTime() >= start.getTime() - 10 * 60000) {
      const id = `attendance:${staffId}:${today}:checkin`;
      if (!notices.some((item) => item.id === id)) {
        created = {
          id,
          targetStaffId: staffId,
          at: now.toISOString(),
          kind: "checkin",
          title: now < start ? "Sắp đến giờ check-in" : "Bạn chưa check-in",
          text: `${schedule.label} bắt đầu lúc ${schedule.start}. Hãy mở Chấm công khi đã có mặt tại công ty.`,
        };
      }
    } else if (record?.checkInAt && !record.checkOutAt && now.getTime() >= end.getTime() - 10 * 60000) {
      const id = `attendance:${staffId}:${today}:checkout`;
      if (!notices.some((item) => item.id === id)) {
        created = {
          id,
          targetStaffId: staffId,
          at: now.toISOString(),
          kind: "checkout",
          title: now < end ? "Sắp đến giờ check-out" : "Bạn chưa check-out",
          text: `${schedule.label} kết thúc lúc ${schedule.end}. Hãy check-out trước khi rời công ty.`,
        };
      }
    }
    if (!created) return;
    saveAttendanceNotices([created, ...notices]);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(created.title, {
          body: created.text,
          icon: "/thuy-nguyen-travel/icon.svg",
          tag: created.id,
        });
      } catch {
        // In-app reminder remains available when the browser blocks native notifications.
      }
    }
  }, [now, staffId]);

  const relevant = useMemo(
    () => items.filter((item) => item.targetStaffId === staffId).slice(0, 8),
    [items, staffId],
  );
  const unread = relevant.filter((item) => !seen[`${staffId}:${item.id}`]);

  function markSeen(item?: AttendanceNotice) {
    const targets = item ? [item] : relevant;
    const next = { ...seen };
    targets.forEach((notice) => {
      next[`${staffId}:${notice.id}`] = new Date().toISOString();
    });
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    setSeen(next);
  }

  function visit(item: AttendanceNotice) {
    markSeen(item);
    setOpen(false);
    onOpen();
  }

  return (
    <div className="attendance-notify">
      <button
        type="button"
        className="attendance-notify-trigger"
        aria-label="Thông báo chấm công"
        title="Nhắc chấm công"
        onClick={() => setOpen((value) => !value)}
      >
        ⏱
        {unread.length > 0 && <strong>{unread.length}</strong>}
      </button>
      {open && (
        <div className="attendance-notify-panel">
          <div className="attendance-notify-head">
            <div><b>Nhắc chấm công</b><small>{unread.length ? `${unread.length} thông báo chưa xem` : "Không có nhắc giờ mới"}</small></div>
            <button aria-label="Đóng" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="attendance-notify-list">
            {relevant.map((item) => (
              <button key={item.id} className={seen[`${staffId}:${item.id}`] ? "seen" : ""} onClick={() => visit(item)}>
                <span>{item.kind === "checkin" ? "→" : "←"}</span>
                <div><b>{item.title}</b><p>{item.text}</p><small>{new Date(item.at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</small></div>
              </button>
            ))}
            {!relevant.length && <div className="attendance-notify-empty"><span>✓</span><b>Đã đủ lượt vào / ra</b><small>App sẽ nhắc trước giờ bắt đầu và kết thúc ca.</small></div>}
          </div>
          {unread.length > 0 && <button className="attendance-notify-mark" onClick={() => markSeen()}>Đánh dấu đã xem</button>}
        </div>
      )}
    </div>
  );
}
