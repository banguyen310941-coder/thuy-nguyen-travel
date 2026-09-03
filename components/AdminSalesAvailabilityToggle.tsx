"use client";

import { useEffect, useState } from "react";
import {
  SALES_AVAILABILITY_EVENT,
  isSaleReceivingCustomers,
  isSalesStaff,
  setSaleReceivingCustomers,
  type AdminStaff,
} from "@/components/AdminSalesAccess";

export function AdminSalesAvailabilityToggle({ staff }: { staff: AdminStaff }) {
  const [receiving, setReceiving] = useState(true);

  useEffect(() => {
    const load = () => setReceiving(isSaleReceivingCustomers(staff.id));
    load();
    window.addEventListener(SALES_AVAILABILITY_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(SALES_AVAILABILITY_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [staff.id]);

  if (!isSalesStaff(staff)) return null;

  function toggle() {
    const next = !receiving;
    setSaleReceivingCustomers(staff.id, next, staff.name);
    setReceiving(next);
  }

  return (
    <button
      type="button"
      className={`sales-availability-toggle ${receiving ? "is-on" : "is-off"}`}
      aria-pressed={receiving}
      aria-label={receiving ? "Tắt nhận khách mới" : "Bật nhận khách mới"}
      title={receiving ? "Nhấn để tạm ngưng nhận khách mới" : "Nhấn để tiếp tục nhận khách mới"}
      onClick={toggle}
    >
      <span className="sales-availability-dot" aria-hidden="true" />
      <span className="sales-availability-copy">
        <b>{receiving ? "Đang nhận khách" : "Tạm ngưng nhận khách"}</b>
        <small>{receiving ? "Có trong vòng chia khách" : "Không nhận khách mới"}</small>
      </span>
    </button>
  );
}
