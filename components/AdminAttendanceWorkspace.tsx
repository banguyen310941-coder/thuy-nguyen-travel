"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ATTENDANCE_EVENT,
  type AttendanceConfig,
  type AttendanceLocation,
  type AttendanceRecord,
  currentMonthKey,
  dateAtTime,
  datesInMonth,
  defaultAttendanceConfig,
  distanceMeters,
  earlyMinutes,
  formatMinutes,
  lateMinutes,
  localDateKey,
  payableDays,
  readAttendanceConfig,
  readAttendanceRecords,
  saveAttendanceConfig,
  saveAttendanceRecords,
  scheduleForDate,
  workedMinutes,
} from "@/lib/attendance";
import {
  isAccountingStaff,
  isAdminStaff,
  isOwner,
  ownerStaff,
  readCurrentStaff,
  readStaff,
  type AdminStaff,
} from "@/components/AdminSalesAccess";

type Tab = "today" | "report" | "settings";
type CorrectionDraft = {
  staffId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  reason: string;
};

const STAFF_EVENT = "tn-staff-updated";

function recordKey(staffId: string, date: string) {
  return `${staffId}:${date}`;
}

function formatClock(value?: string) {
  return value
    ? new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : "—";
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function locationText(location?: AttendanceLocation) {
  if (!location) return "Không có GPS";
  return `${location.distanceMeters}m · sai số ${Math.round(location.accuracy)}m`;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Thiết bị không hỗ trợ định vị GPS."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

function geolocationMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? Number(error.code) : 0;
  if (code) {
    if (code === 1) return "Bạn chưa cho phép app dùng vị trí.";
    if (code === 2) return "Không lấy được vị trí hiện tại.";
    if (code === 3) return "Định vị quá lâu. Hãy bật GPS và thử lại.";
  }
  return error instanceof Error ? error.message : "Không thể lấy vị trí hiện tại.";
}

export function AdminAttendanceWorkspace() {
  const [tab, setTab] = useState<Tab>("today");
  const [current, setCurrent] = useState<AdminStaff>(() => ({
    id: "",
    name: "",
    role: "guest",
  }));
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [config, setConfig] = useState<AttendanceConfig>(defaultAttendanceConfig);
  const [configDraft, setConfigDraft] = useState<AttendanceConfig>(defaultAttendanceConfig);
  const [month, setMonth] = useState(currentMonthKey());
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [correction, setCorrection] = useState<CorrectionDraft | null>(null);

  useEffect(() => {
    const load = () => {
      const identity = readCurrentStaff();
      const people = readStaff();
      setCurrent(identity);
      setStaff(people);
      setRecords(readAttendanceRecords());
      const nextConfig = readAttendanceConfig();
      setConfig(nextConfig);
      setConfigDraft(nextConfig);
      setSelectedStaffId((value) => value || identity.id);
    };
    load();
    const events = [ATTENDANCE_EVENT, STAFF_EVENT, "happygo-admin-auth", "storage"];
    events.forEach((event) => window.addEventListener(event, load));
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => {
      events.forEach((event) => window.removeEventListener(event, load));
      window.clearInterval(timer);
    };
  }, []);

  const manager = isOwner(current) || isAdminStaff(current) || isAccountingStaff(current);
  const today = localDateKey(now);
  const todaySchedule = scheduleForDate(today, config);
  const restDay = todaySchedule.dayWeight === 0;
  const todayRecord = records.find((item) => recordKey(item.staffId, item.date) === recordKey(current.id, today));
  const companyConfigured = config.latitude !== null && config.longitude !== null;

  const people = useMemo(() => {
    const list = [...staff];
    if (isOwner(current) && !list.some((item) => item.id === current.id)) list.unshift(ownerStaff());
    if (current.id && !list.some((item) => item.id === current.id)) list.unshift(current);
    return list.filter((item) => item.id && item.status !== "inactive");
  }, [current, staff]);

  async function verifiedLocation() {
    if (!config.requireLocation) return undefined;
    if (!companyConfigured) throw new Error("Quản lý chưa thiết lập vị trí công ty nên chưa thể chấm công GPS.");
    const position = await getPosition();
    if (position.coords.accuracy > 200) {
      throw new Error("Tín hiệu GPS chưa đủ chính xác (trên 200m). Hãy ra gần cửa sổ và thử lại.");
    }
    const distance = distanceMeters(
      position.coords.latitude,
      position.coords.longitude,
      config.latitude!,
      config.longitude!,
    );
    const allowance = config.radiusMeters + Math.min(50, position.coords.accuracy);
    if (distance > allowance) {
      throw new Error(`Bạn đang cách công ty khoảng ${distance}m, ngoài bán kính ${config.radiusMeters}m.`);
    }
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      distanceMeters: distance,
    } satisfies AttendanceLocation;
  }

  async function checkIn() {
    if (!current.id || todayRecord) return;
    if (restDay) {
      setMessage("Chủ nhật là ngày nghỉ cả ngày, bạn không cần check-in.");
      return;
    }
    setBusy(true);
    setMessage("Đang xác minh vị trí công ty...");
    try {
      const location = await verifiedLocation();
      const stamp = new Date();
      const schedule = scheduleForDate(today, config);
      const record: AttendanceRecord = {
        id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        staffId: current.id,
        staffName: current.name,
        date: today,
        shiftLabel: schedule.label,
        scheduledStart: schedule.start,
        scheduledEnd: schedule.end,
        breakMinutes: schedule.breakMinutes,
        dayWeight: schedule.dayWeight,
        checkInAt: stamp.toISOString(),
        checkInLocation: location,
      };
      saveAttendanceRecords([record, ...records]);
      setRecords((value) => [record, ...value]);
      setMessage(`Đã check-in lúc ${formatClock(record.checkInAt)}${location ? ` · cách công ty ${location.distanceMeters}m` : ""}.`);
    } catch (error) {
      setMessage(geolocationMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function checkOut() {
    if (!todayRecord || todayRecord.checkOutAt) return;
    setBusy(true);
    setMessage("Đang xác minh vị trí trước khi check-out...");
    try {
      const location = await verifiedLocation();
      const stamp = new Date().toISOString();
      const next = records.map((item) =>
        item.id === todayRecord.id ? { ...item, checkOutAt: stamp, checkOutLocation: location } : item,
      );
      saveAttendanceRecords(next);
      setRecords(next);
      setMessage(`Đã check-out lúc ${formatClock(stamp)}. Bảng công tháng đã cập nhật.`);
    } catch (error) {
      setMessage(geolocationMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function useCurrentLocation() {
    setBusy(true);
    setMessage("Đang lấy tọa độ văn phòng...");
    try {
      const position = await getPosition();
      setConfigDraft((value) => ({
        ...value,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
      setMessage(`Đã lấy vị trí hiện tại · sai số khoảng ${Math.round(position.coords.accuracy)}m. Hãy bấm Lưu cấu hình.`);
    } catch (error) {
      setMessage(geolocationMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function persistConfig() {
    if (configDraft.requireLocation && (configDraft.latitude === null || configDraft.longitude === null)) {
      setMessage("Cần lấy vị trí công ty trước khi bật bắt buộc chấm công GPS.");
      return;
    }
    if (!Number.isFinite(configDraft.radiusMeters) || configDraft.radiusMeters < 30 || configDraft.radiusMeters > 2000) {
      setMessage("Bán kính chấm công cần từ 30m đến 2.000m.");
      return;
    }
    if (
      configDraft.latitude !== null &&
      (!Number.isFinite(configDraft.latitude) || configDraft.latitude < -90 || configDraft.latitude > 90)
    ) {
      setMessage("Vĩ độ công ty không hợp lệ.");
      return;
    }
    if (
      configDraft.longitude !== null &&
      (!Number.isFinite(configDraft.longitude) || configDraft.longitude < -180 || configDraft.longitude > 180)
    ) {
      setMessage("Kinh độ công ty không hợp lệ.");
      return;
    }
    const shifts = [
      [configDraft.weekdayStart, configDraft.weekdayEnd, "ngày thường"],
      [configDraft.saturdayStart, configDraft.saturdayEnd, "thứ Bảy"],
    ];
    const invalidShift = shifts.find(([start, end]) => dateAtTime("2000-01-01", end) <= dateAtTime("2000-01-01", start));
    if (invalidShift) {
      setMessage(`Giờ kết thúc ca ${invalidShift[2]} phải sau giờ bắt đầu.`);
      return;
    }
    const weekdayMinutes =
      (dateAtTime("2000-01-01", configDraft.weekdayEnd).getTime() -
        dateAtTime("2000-01-01", configDraft.weekdayStart).getTime()) /
      60000;
    if (
      !Number.isFinite(configDraft.weekdayBreakMinutes) ||
      configDraft.weekdayBreakMinutes < 0 ||
      configDraft.weekdayBreakMinutes >= weekdayMinutes
    ) {
      setMessage("Thời gian nghỉ giữa ca ngày thường không hợp lệ.");
      return;
    }
    if (!Number.isFinite(configDraft.graceMinutes) || configDraft.graceMinutes < 0 || configDraft.graceMinutes > 60) {
      setMessage("Thời gian miễn trừ đi muộn cần từ 0 đến 60 phút.");
      return;
    }
    saveAttendanceConfig(configDraft);
    setConfig(configDraft);
    setMessage("Đã lưu lịch làm việc và vị trí chấm công cho toàn bộ nhân viên trên thiết bị này.");
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setMessage("Thiết bị này không hỗ trợ thông báo trình duyệt. Nhắc giờ vẫn hiện trong chuông của app.");
      return;
    }
    const permission = await Notification.requestPermission();
    setMessage(
      permission === "granted"
        ? "Đã bật thông báo. App sẽ nhắc check-in/check-out khi đang mở."
        : "Chưa được cấp quyền thông báo. Nhắc giờ vẫn hiện trong chuông của app.",
    );
  }

  const monthDates = useMemo(() => datesInMonth(month), [month]);
  const reportRows = useMemo(() => {
    return people.map((person) => {
      const personRecords = records.filter((item) => item.staffId === person.id && item.date.startsWith(month));
      const planned = monthDates.reduce(
        (sum, date) => sum + scheduleForDate(date, config).dayWeight,
        0,
      );
      const dueDates = monthDates.filter((date) => {
        const schedule = scheduleForDate(date, config);
        if (schedule.dayWeight === 0) return false;
        const end = dateAtTime(date, schedule.end);
        return end <= now;
      });
      const workingRecords = personRecords.filter(
        (record) => scheduleForDate(record.date, config).dayWeight > 0,
      );
      const absent = dueDates.filter(
        (date) => !personRecords.some((record) => record.date === date && record.checkInAt),
      ).length;
      return {
        person,
        records: personRecords,
        planned,
        payable: workingRecords.reduce((sum, record) => sum + payableDays(record), 0),
        worked: personRecords.reduce((sum, record) => sum + workedMinutes(record), 0),
        late: workingRecords.reduce((sum, record) => sum + lateMinutes(record, config.graceMinutes), 0),
        early: workingRecords.reduce((sum, record) => sum + earlyMinutes(record), 0),
        incomplete: workingRecords.filter((record) => !record.checkOutAt).length,
        absent,
      };
    });
  }, [config, month, monthDates, now, people, records]);

  const selectedReport = reportRows.find((item) => item.person.id === selectedStaffId) || reportRows[0];
  const selectedRecords = useMemo(
    () =>
      records
        .filter((item) => item.staffId === selectedReport?.person.id && item.date.startsWith(month))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [month, records, selectedReport?.person.id],
  );

  function exportCsv() {
    const header = [
      "Nhân viên",
      "Phòng ban",
      "Công chuẩn",
      "Công hưởng lương",
      "Giờ làm",
      "Đi muộn (phút)",
      "Về sớm (phút)",
      "Thiếu check-out",
      "Ca vắng",
    ];
    const lines = reportRows.map((item) =>
      [
        item.person.name,
        item.person.department || item.person.role,
        item.planned,
        item.payable.toFixed(2),
        (item.worked / 60).toFixed(2),
        item.late,
        item.early,
        item.incomplete,
        item.absent,
      ]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob(["\ufeff", [header.map(csvCell).join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bang-cong-happygo-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function startCorrection(record?: AttendanceRecord) {
    const personId = record?.staffId || selectedReport?.person.id || current.id;
    const date = record?.date || today;
    if (scheduleForDate(date, config).dayWeight === 0) {
      setMessage("Chủ nhật là ngày nghỉ cả ngày nên không thể tạo hoặc sửa công hưởng lương.");
      return;
    }
    setCorrection({
      staffId: personId,
      date,
      checkIn: record ? formatClock(record.checkInAt) : scheduleForDate(date, config).start,
      checkOut: record?.checkOutAt ? formatClock(record.checkOutAt) : scheduleForDate(date, config).end,
      reason: record?.adjustmentReason || "",
    });
  }

  function saveCorrection() {
    if (!correction || !current.id || correction.reason.trim().length < 5) {
      setMessage("Kế toán cần nhập lý do điều chỉnh ít nhất 5 ký tự.");
      return;
    }
    const person = people.find((item) => item.id === correction.staffId);
    if (!person) return;
    const schedule = scheduleForDate(correction.date, config);
    if (schedule.dayWeight === 0) {
      setMessage("Chủ nhật là ngày nghỉ cả ngày nên không thể ghi nhận công.");
      return;
    }
    const checkIn = dateAtTime(correction.date, correction.checkIn);
    const checkOut = dateAtTime(correction.date, correction.checkOut);
    if (checkOut <= checkIn) {
      setMessage("Giờ check-out phải sau giờ check-in.");
      return;
    }
    const existing = records.find(
      (item) => item.staffId === correction.staffId && item.date === correction.date,
    );
    const adjusted: AttendanceRecord = {
      id: existing?.id || `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      staffId: person.id,
      staffName: person.name,
      date: correction.date,
      shiftLabel: schedule.label,
      scheduledStart: schedule.start,
      scheduledEnd: schedule.end,
      breakMinutes: schedule.breakMinutes,
      dayWeight: schedule.dayWeight,
      checkInAt: checkIn.toISOString(),
      checkOutAt: checkOut.toISOString(),
      checkInLocation: existing?.checkInLocation,
      checkOutLocation: existing?.checkOutLocation,
      note: existing?.note,
      adjustedAt: new Date().toISOString(),
      adjustedBy: current.name,
      adjustmentReason: correction.reason.trim(),
    };
    const next = existing
      ? records.map((item) => (item.id === existing.id ? adjusted : item))
      : [adjusted, ...records];
    saveAttendanceRecords(next);
    setRecords(next);
    setCorrection(null);
    setMessage(`Đã điều chỉnh công cho ${person.name} ngày ${formatDate(correction.date)}.`);
  }

  const liveStatus = restDay
    ? "Ngày nghỉ"
    : !todayRecord
    ? now < dateAtTime(today, todaySchedule.start)
      ? "Chưa đến ca"
      : "Chưa check-in"
    : todayRecord.checkOutAt
      ? "Đã hoàn thành"
      : "Đang làm việc";

  return (
    <section className="admin-panel attendance-workspace">
      <div className="admin-panel-head attendance-head">
        <div>
          <small>NHÂN SỰ · KẾ TOÁN LƯƠNG</small>
          <h2>Chấm công tại công ty</h2>
          <p>Check-in/check-out có xác minh GPS, tự tính công tháng và nhắc giờ ngay trong app.</p>
        </div>
        <div className="attendance-head-actions">
          <button type="button" onClick={enableNotifications}>🔔 Bật nhắc giờ</button>
          {manager && <button type="button" onClick={exportCsv}>Xuất bảng công CSV</button>}
        </div>
      </div>

      <div className="attendance-storage-note">
        <span>●</span>
        <div>
          <b>Chế độ nội bộ trên thiết bị</b>
          <small>Dữ liệu chưa đồng bộ nhiều điện thoại cho đến khi backend tài khoản nhân viên được kết nối.</small>
        </div>
      </div>
      {message && <p className="admin-api-note attendance-message">{message}</p>}

      <div className="attendance-tabs">
        <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>Hôm nay</button>
        <button className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}>{manager ? "Bảng công nhân viên" : "Bảng công của tôi"}</button>
        {manager && <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>Lịch & vị trí công ty</button>}
      </div>

      {tab === "today" && (
        <div className="attendance-today-grid">
          <article className="attendance-punch-card">
            <div className="attendance-live-row">
              <span className={todayRecord?.checkOutAt ? "done" : todayRecord ? "working" : "waiting"}>{liveStatus}</span>
              <small>{now.toLocaleString("vi-VN", { weekday: "long", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</small>
            </div>
            <div className="attendance-clock">{now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
            <h3>{current.name}</h3>
            <p>{todaySchedule.label}{restDay ? "" : ` · ${todaySchedule.start}–${todaySchedule.end}`}</p>
            <div className="attendance-punch-times">
              <span><small>CHECK-IN</small><b>{formatClock(todayRecord?.checkInAt)}</b></span>
              <i>→</i>
              <span><small>CHECK-OUT</small><b>{formatClock(todayRecord?.checkOutAt)}</b></span>
            </div>
            {restDay ? (
              <div className="attendance-complete">✓ Hôm nay nghỉ cả ngày · không cần check-in</div>
            ) : !todayRecord ? (
              <button className="admin-primary attendance-main-action" disabled={busy} onClick={checkIn}>{busy ? "Đang kiểm tra GPS..." : "Check-in tại công ty"}</button>
            ) : !todayRecord.checkOutAt ? (
              <button className="admin-primary attendance-main-action checkout" disabled={busy} onClick={checkOut}>{busy ? "Đang kiểm tra GPS..." : "Check-out trước khi về"}</button>
            ) : (
              <div className="attendance-complete">✓ Đã ghi nhận {payableDays(todayRecord).toFixed(2)} công · {formatMinutes(workedMinutes(todayRecord))}</div>
            )}
            <small className="attendance-gps-copy">{config.requireLocation ? companyConfigured ? `GPS bắt buộc trong bán kính ${config.radiusMeters}m` : "Chưa có tọa độ công ty · cần quản lý thiết lập" : "GPS đang tạm tắt trong cấu hình"}</small>
          </article>

          <div className="attendance-day-details">
            <article>
              <small>CA LÀM HÔM NAY</small>
              <b>{restDay ? "Nghỉ cả ngày" : `${todaySchedule.start} – ${todaySchedule.end}`}</b>
              <span>{restDay ? "0 công · không cần check-in" : `${todaySchedule.dayWeight} công · nghỉ giữa ca ${todaySchedule.breakMinutes} phút`}</span>
            </article>
            <article>
              <small>VỊ TRÍ CHECK-IN</small>
              <b>{locationText(todayRecord?.checkInLocation)}</b>
              <span>{config.companyName} · {config.companyAddress}</span>
            </article>
            <article>
              <small>ĐI MUỘN / VỀ SỚM</small>
              <b>{todayRecord ? `${lateMinutes(todayRecord, config.graceMinutes)}p / ${earlyMinutes(todayRecord)}p` : "— / —"}</b>
              <span>Miễn tính đi muộn {config.graceMinutes} phút</span>
            </article>
            <article className="attendance-week-rule">
              <small>LỊCH MẶC ĐỊNH</small>
              <b>Thứ 2–6: 08:30–17:30</b>
              <span>Thứ 7 làm sáng, nghỉ chiều · Chủ nhật nghỉ cả ngày.</span>
            </article>
          </div>
        </div>
      )}

      {tab === "report" && (
        <div className="attendance-report">
          <div className="attendance-toolbar">
            <label>Tháng<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
            <label>Nhân viên<select value={selectedReport?.person.id || ""} onChange={(event) => setSelectedStaffId(event.target.value)} disabled={!manager}>{reportRows.map((item) => <option key={item.person.id} value={item.person.id}>{item.person.name}</option>)}</select></label>
            {manager && <button className="admin-primary" onClick={() => startCorrection()}>+ Điều chỉnh công</button>}
          </div>

          {manager && (
            <div className="attendance-summary-table-wrap">
              <table className="attendance-summary-table">
                <thead><tr><th>Nhân viên</th><th>Công chuẩn</th><th>Công hưởng lương</th><th>Giờ làm</th><th>Đi muộn</th><th>Về sớm</th><th>Thiếu checkout</th><th>Ca vắng</th></tr></thead>
                <tbody>{reportRows.map((item) => <tr key={item.person.id} className={selectedReport?.person.id === item.person.id ? "selected" : ""} onClick={() => setSelectedStaffId(item.person.id)}><td><b>{item.person.name}</b><small>{item.person.department || item.person.role}</small></td><td>{item.planned}</td><td><strong>{item.payable.toFixed(2)}</strong></td><td>{formatMinutes(item.worked)}</td><td>{item.late}p</td><td>{item.early}p</td><td>{item.incomplete}</td><td>{item.absent}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          {selectedReport && (
            <>
              <div className="attendance-kpis">
                <article><small>CÔNG HƯỞNG LƯƠNG</small><b>{selectedReport.payable.toFixed(2)}</b><span>/ {selectedReport.planned} công chuẩn</span></article>
                <article><small>TỔNG GIỜ LÀM</small><b>{formatMinutes(selectedReport.worked)}</b><span>{selectedReport.records.length} ngày có ghi nhận</span></article>
                <article className={selectedReport.late ? "warn" : "good"}><small>ĐI MUỘN</small><b>{selectedReport.late} phút</b><span>Sau thời gian miễn trừ</span></article>
                <article className={selectedReport.incomplete || selectedReport.absent ? "danger" : "good"}><small>CẦN XỬ LÝ</small><b>{selectedReport.incomplete + selectedReport.absent}</b><span>{selectedReport.incomplete} thiếu checkout · {selectedReport.absent} ca vắng</span></article>
              </div>
              <div className="attendance-detail-table-wrap">
                <table className="attendance-detail-table">
                  <thead><tr><th>Ngày / Ca</th><th>Check-in</th><th>Check-out</th><th>GPS</th><th>Giờ làm</th><th>Công</th><th>Ghi chú</th><th></th></tr></thead>
                  <tbody>{selectedRecords.map((record) => { const recordRestDay = scheduleForDate(record.date, config).dayWeight === 0; return <tr key={record.id}><td><b>{formatDate(record.date)}</b><small>{recordRestDay ? "Chủ nhật · bản ghi cũ" : record.shiftLabel}</small></td><td><b>{formatClock(record.checkInAt)}</b><small>{recordRestDay ? "Ngày nghỉ" : lateMinutes(record, config.graceMinutes) ? `Muộn ${lateMinutes(record, config.graceMinutes)}p` : "Đúng giờ"}</small></td><td><b>{formatClock(record.checkOutAt)}</b><small>{recordRestDay ? "Không tính công" : record.checkOutAt ? earlyMinutes(record) ? `Sớm ${earlyMinutes(record)}p` : "Đủ giờ" : "Thiếu check-out"}</small></td><td><b>{locationText(record.checkInLocation)}</b><small>{locationText(record.checkOutLocation)}</small></td><td>{formatMinutes(workedMinutes(record))}</td><td><strong>{recordRestDay ? "0.00" : payableDays(record).toFixed(2)}</strong></td><td>{record.adjustedBy ? <><b>Điều chỉnh bởi {record.adjustedBy}</b><small>{record.adjustmentReason}</small></> : <small>{record.note || "Tự chấm công"}</small>}</td><td>{manager && !recordRestDay && <button onClick={() => startCorrection(record)}>Sửa</button>}</td></tr>})}{!selectedRecords.length && <tr><td colSpan={8} className="attendance-empty">Chưa có dữ liệu chấm công trong tháng này.</td></tr>}</tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {manager && tab === "settings" && (
        <div className="attendance-settings">
          <div className="attendance-setting-section">
            <div><small>VỊ TRÍ CÔNG TY</small><h3>Giới hạn điểm danh tại văn phòng</h3><p>Quản lý đứng tại công ty, bật GPS rồi lấy vị trí hiện tại làm tâm chấm công.</p></div>
            <div className="attendance-setting-grid">
              <label>Tên địa điểm<input value={configDraft.companyName} onChange={(event) => setConfigDraft({ ...configDraft, companyName: event.target.value })} /></label>
              <label>Địa chỉ công ty<input value={configDraft.companyAddress} onChange={(event) => setConfigDraft({ ...configDraft, companyAddress: event.target.value })} /></label>
              <label>Vĩ độ<input type="number" step="any" value={configDraft.latitude ?? ""} onChange={(event) => setConfigDraft({ ...configDraft, latitude: event.target.value ? Number(event.target.value) : null })} /></label>
              <label>Kinh độ<input type="number" step="any" value={configDraft.longitude ?? ""} onChange={(event) => setConfigDraft({ ...configDraft, longitude: event.target.value ? Number(event.target.value) : null })} /></label>
              <label>Bán kính cho phép (m)<input type="number" min="30" max="2000" value={configDraft.radiusMeters} onChange={(event) => setConfigDraft({ ...configDraft, radiusMeters: Number(event.target.value) })} /></label>
              <label className="attendance-check"><input type="checkbox" checked={configDraft.requireLocation} onChange={(event) => setConfigDraft({ ...configDraft, requireLocation: event.target.checked })} /><span><b>Bắt buộc GPS tại công ty</b><small>Tắt chỉ để kiểm thử trên thiết bị không có GPS.</small></span></label>
            </div>
            <button disabled={busy} onClick={useCurrentLocation}>⌖ Lấy vị trí hiện tại làm công ty</button>
          </div>

          <div className="attendance-setting-section">
            <div><small>LỊCH LÀM VIỆC</small><h3>Ca mặc định toàn công ty</h3><p>Ngày thường nghỉ trưa 60 phút; thứ Bảy nghỉ chiều và Chủ nhật nghỉ cả ngày.</p></div>
            <div className="attendance-shift-grid">
              <article><b>Thứ 2 – Thứ 6</b><div><label>Vào<input type="time" value={configDraft.weekdayStart} onChange={(event) => setConfigDraft({ ...configDraft, weekdayStart: event.target.value })} /></label><label>Ra<input type="time" value={configDraft.weekdayEnd} onChange={(event) => setConfigDraft({ ...configDraft, weekdayEnd: event.target.value })} /></label><label>Nghỉ (phút)<input type="number" value={configDraft.weekdayBreakMinutes} onChange={(event) => setConfigDraft({ ...configDraft, weekdayBreakMinutes: Number(event.target.value) })} /></label></div></article>
              <article><b>Thứ Bảy · ca sáng</b><div><label>Vào<input type="time" value={configDraft.saturdayStart} onChange={(event) => setConfigDraft({ ...configDraft, saturdayStart: event.target.value })} /></label><label>Ra<input type="time" value={configDraft.saturdayEnd} onChange={(event) => setConfigDraft({ ...configDraft, saturdayEnd: event.target.value })} /></label></div><small>Buổi chiều nghỉ.</small></article>
              <article><b>Chủ nhật · nghỉ cả ngày</b><div><span>Không có ca làm việc</span></div><small>Không check-in, không tính ca vắng và không cộng công.</small></article>
              <article><b>Quy tắc đi muộn</b><div><label>Miễn trừ (phút)<input type="number" min="0" max="60" value={configDraft.graceMinutes} onChange={(event) => setConfigDraft({ ...configDraft, graceMinutes: Number(event.target.value) })} /></label></div><small>Sau mốc này mới cộng phút đi muộn.</small></article>
            </div>
          </div>
          <div className="attendance-settings-foot"><span>Lịch mới áp dụng cho lần chấm công tiếp theo; bản ghi cũ giữ nguyên ca tại thời điểm ghi nhận.</span><button className="admin-primary" onClick={persistConfig}>Lưu cấu hình chấm công</button></div>
        </div>
      )}

      {correction && (
        <div className="attendance-modal-backdrop" onClick={() => setCorrection(null)}>
          <div className="attendance-modal" onClick={(event) => event.stopPropagation()}>
            <div><small>ĐIỀU CHỈNH CÓ NHẬT KÝ</small><h3>Sửa bản ghi chấm công</h3></div>
            <label>Nhân viên<select value={correction.staffId} onChange={(event) => setCorrection({ ...correction, staffId: event.target.value })}>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
            <label>Ngày<input type="date" value={correction.date} onChange={(event) => setCorrection({ ...correction, date: event.target.value })} /></label>
            <div className="attendance-modal-times"><label>Check-in<input type="time" value={correction.checkIn} onChange={(event) => setCorrection({ ...correction, checkIn: event.target.value })} /></label><label>Check-out<input type="time" value={correction.checkOut} onChange={(event) => setCorrection({ ...correction, checkOut: event.target.value })} /></label></div>
            <label>Lý do điều chỉnh<textarea rows={3} value={correction.reason} onChange={(event) => setCorrection({ ...correction, reason: event.target.value })} placeholder="Ví dụ: Nhân viên quên check-out, đã xác nhận với quản lý..." /></label>
            <div className="attendance-modal-actions"><button onClick={() => setCorrection(null)}>Hủy</button><button className="admin-primary" onClick={saveCorrection}>Lưu điều chỉnh</button></div>
          </div>
        </div>
      )}

    </section>
  );
}
