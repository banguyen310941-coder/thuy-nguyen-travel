"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminStaff } from "@/components/AdminSalesAccess";
import {
  SHARED_ADMIN_KEYS,
  SHARED_EVENT_KEYS,
  SHARED_STATUS_EVENT,
  isApplyingSharedData,
  queueSharedKeys,
  syncSharedData,
  type SharedAdminKey,
  type SharedSyncDetail,
} from "@/lib/admin-shared-data";

const SERVER_OWNED_CACHE_KEYS = new Set<SharedAdminKey>([
  "tn_cms_products_v3_units",
  "tn_cms_daily_rates_v1",
  "tn_cms_tours_v3",
  "tn_cms_articles_v3",
  "tn_cms_homepage",
]);

const initialStatus: SharedSyncDetail = {
  state: "idle",
  message: "Đang kiểm tra dữ liệu production dùng chung.",
};

export function AdminSharedDataStatus({ staff }: { staff: AdminStaff }) {
  const [status, setStatus] = useState<SharedSyncDetail>(initialStatus);
  const legacyKeys = useMemo(() => SHARED_ADMIN_KEYS.filter((key) => !SERVER_OWNED_CACHE_KEYS.has(key)), []);

  useEffect(() => {
    try { localStorage.removeItem("tn_admin_api_key"); } catch {}
    const statusListener = (event: Event) => setStatus((event as CustomEvent<SharedSyncDetail>).detail);
    const listeners = Object.entries(SHARED_EVENT_KEYS).flatMap(([event, keys]) => {
      const writable = keys.filter((key) => !SERVER_OWNED_CACHE_KEYS.has(key));
      if (!writable.length) return [];
      const listener = () => {
        if (!isApplyingSharedData()) queueSharedKeys(writable, staff.name);
      };
      window.addEventListener(event, listener);
      return [[event, listener] as const];
    });
    const refresh = () => { void syncSharedData(legacyKeys, staff.name); };
    const visibility = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener(SHARED_STATUS_EVENT, statusListener);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visibility);
    refresh();
    const refreshTimer = window.setInterval(refresh, 30000);
    return () => {
      listeners.forEach(([event, listener]) => window.removeEventListener(event, listener));
      window.removeEventListener(SHARED_STATUS_EVENT, statusListener);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visibility);
      window.clearInterval(refreshTimer);
    };
  }, [legacyKeys, staff.name]);

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
          <button className="admin-primary" onClick={() => void syncSharedData(legacyKeys, staff.name)} disabled={status.state === "syncing"}>Đồng bộ ngay</button>
        </div>
        <em>Dùng phiên đăng nhập HttpOnly hiện tại. Chấm công, chat và các vùng vận hành chuyển tiếp được đồng bộ theo quyền tài khoản; Sản phẩm, lịch giá, Tour, Bài viết và Trang chủ đã dùng API production riêng nên không còn ghi ngược qua hàng đợi legacy.</em>
      </div>
    </details>
  );
}
