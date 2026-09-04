"use client";

import { useEffect, useState } from "react";
import type { AdminStaff } from "@/components/AdminSalesAccess";
import {
  SHARED_ADMIN_KEYS,
  SHARED_EVENT_KEYS,
  SHARED_STATUS_EVENT,
  isApplyingSharedData,
  queueSharedKeys,
  scanSharedChanges,
  syncSharedData,
  type SharedSyncDetail,
} from "@/lib/admin-shared-data";

const initialStatus: SharedSyncDetail = {
  state: "idle",
  message: "Đang kiểm tra dữ liệu production dùng chung.",
};

export function AdminSharedDataStatus({ staff }: { staff: AdminStaff }) {
  const [status, setStatus] = useState<SharedSyncDetail>(initialStatus);

  useEffect(() => {
    try { localStorage.removeItem("tn_admin_api_key"); } catch {}
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
    const refreshTimer = window.setInterval(refresh, 30000);
    const scanTimer = window.setInterval(() => scanSharedChanges(staff.name), 2500);
    return () => {
      listeners.forEach(([event, listener]) => window.removeEventListener(event, listener));
      window.removeEventListener(SHARED_STATUS_EVENT, statusListener);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visibility);
      window.clearInterval(refreshTimer);
      window.clearInterval(scanTimer);
    };
  }, [staff.name]);

  const badge = status.state === "synced" ? "Đã đồng bộ" : status.state === "syncing" ? "Đang đồng bộ" : status.state === "error" ? "Lỗi đồng bộ" : "Đang kết nối";

  return (
    <details className="admin-shared-data" data-state={status.state}>
      <summary title={status.message}>
        <i aria-hidden="true" />
        <span>{badge}</span>
      </summary>
      <div className="admin-shared-data-panel">
        <small>DỮ LIỆU PRODUCTION DÙNG CHUNG</small>
        <h3>{status.state === "synced" ? "Đã kết nối dữ liệu công ty" : "Đang kết nối các thiết bị làm việc"}</h3>
        <p>{status.message}</p>
        {status.at ? <time>Gần nhất: {new Date(status.at).toLocaleString("vi-VN")}</time> : null}
        <div>
          <button className="admin-primary" onClick={() => void syncSharedData(SHARED_ADMIN_KEYS, staff.name)} disabled={status.state === "syncing"}>Đồng bộ ngay</button>
        </div>
        <em>Dùng phiên đăng nhập HttpOnly hiện tại; không còn nhập hoặc lưu ADMIN_API_KEY trên trình duyệt. CRM, Điều hành, NCC, Voucher, CMS, lịch giá, chấm công và chat được đồng bộ giữa các thiết bị theo quyền tài khoản.</em>
      </div>
    </details>
  );
}
