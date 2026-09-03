"use client";

import { useEffect, useState } from "react";
import type { AdminStaff } from "@/components/AdminSalesAccess";
import {
  ADMIN_API_KEY_STORAGE,
  SHARED_ADMIN_KEYS,
  SHARED_EVENT_KEYS,
  SHARED_STATUS_EVENT,
  isApplyingSharedData,
  queueSharedKeys,
  saveSharedAdminKey,
  syncSharedData,
  type SharedSyncDetail,
} from "@/lib/admin-shared-data";

const initialStatus: SharedSyncDetail = {
  state: "idle",
  message: "Dữ liệu dùng chung chưa được kiểm tra.",
};

export function AdminSharedDataStatus({ staff }: { staff: AdminStaff }) {
  const [status, setStatus] = useState<SharedSyncDetail>(initialStatus);
  const [key, setKey] = useState("");

  useEffect(() => {
    setKey(localStorage.getItem(ADMIN_API_KEY_STORAGE) || "");
    const statusListener = (event: Event) => setStatus((event as CustomEvent<SharedSyncDetail>).detail);
    const listeners = Object.entries(SHARED_EVENT_KEYS).map(([event, keys]) => {
      const listener = () => {
        if (!isApplyingSharedData()) queueSharedKeys(keys, staff.name);
      };
      window.addEventListener(event, listener);
      return [event, listener] as const;
    });
    const refresh = () => { void syncSharedData(SHARED_ADMIN_KEYS, staff.name); };
    const visibility = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener(SHARED_STATUS_EVENT, statusListener);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visibility);
    refresh();
    const timer = window.setInterval(refresh, 45000);
    return () => {
      listeners.forEach(([event, listener]) => window.removeEventListener(event, listener));
      window.removeEventListener(SHARED_STATUS_EVENT, statusListener);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visibility);
      window.clearInterval(timer);
    };
  }, [staff.name]);

  async function saveAndSync() {
    saveSharedAdminKey(key);
    await syncSharedData(SHARED_ADMIN_KEYS, staff.name);
  }

  const badge = status.state === "synced" ? "Đã đồng bộ" : status.state === "syncing" ? "Đang đồng bộ" : status.state === "missing-key" || status.state === "idle" ? "Chưa kết nối" : "Lỗi đồng bộ";

  return (
    <details className="admin-shared-data" data-state={status.state}>
      <summary title={status.message}>
        <i aria-hidden="true" />
        <span>{badge}</span>
      </summary>
      <div className="admin-shared-data-panel">
        <small>DỮ LIỆU DÙNG CHUNG</small>
        <h3>{status.state === "synced" ? "Đã kết nối dữ liệu công ty" : "Kết nối các thiết bị làm việc"}</h3>
        <p>{status.message}</p>
        {status.at ? <time>Gần nhất: {new Date(status.at).toLocaleString("vi-VN")}</time> : null}
        <label>
          Khóa nội bộ
          <input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Nhập ADMIN_API_KEY" autoComplete="off" />
        </label>
        <div>
          <button className="admin-primary" onClick={saveAndSync} disabled={status.state === "syncing"}>Lưu & đồng bộ</button>
          <button onClick={() => void syncSharedData(SHARED_ADMIN_KEYS, staff.name)} disabled={status.state === "syncing" || !key.trim()}>Đồng bộ ngay</button>
        </div>
        <em>Đồng bộ Marketing, CRM, booking, phiếu thu, kế toán và chấm công. Mật khẩu nhân viên không được gửi lên đây.</em>
      </div>
    </details>
  );
}
