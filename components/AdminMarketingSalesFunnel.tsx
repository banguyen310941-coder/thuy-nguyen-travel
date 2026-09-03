"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SALES_AVAILABILITY_EVENT,
  isAdminStaff,
  isOwner,
  money,
  readAssignments,
  readCurrentStaff,
  readSalesAvailability,
  salesStaff,
  setSaleReceivingCustomers,
  type AdminStaff,
} from "@/components/AdminSalesAccess";
import {
  buildMarketingSalesFunnel,
  type FunnelBooking,
  type FunnelCustomer,
  type FunnelExpense,
  type FunnelHistory,
  type FunnelProposal,
  type FunnelReceipt,
} from "@/lib/marketing-funnel";

const KEYS = {
  proposals: "happygo_marketing_budget_proposals_v1",
  expenses: "happygo_marketing_expenses_v1",
  customers: "happygo_crm_manual_customers_v1",
  bookings: "tn_local_bookings_v1",
  histories: "happygo_crm_history_v1",
  receipts: "happygo_customer_receipts_v1",
};

const EVENTS = [
  "storage",
  "happygo-marketing-budget-updated",
  "happygo-crm-customers-updated",
  "happygo-crm-assignment",
  "happygo-crm-history-updated",
  "happygo-customer-receipts-updated",
  "tn-bookings-updated",
  "tn-staff-updated",
  "happygo-admin-auth",
  SALES_AVAILABILITY_EVENT,
];

type FunnelState = {
  proposals: FunnelProposal[];
  expenses: FunnelExpense[];
  customers: FunnelCustomer[];
  bookings: FunnelBooking[];
  histories: FunnelHistory[];
  receipts: FunnelReceipt[];
  staff: AdminStaff[];
  current: AdminStaff | null;
  availability: ReturnType<typeof readSalesAvailability>;
};

const emptyState: FunnelState = {
  proposals: [],
  expenses: [],
  customers: [],
  bookings: [],
  histories: [],
  receipts: [],
  staff: [],
  current: null,
  availability: {},
};

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function read<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function AdminMarketingSalesFunnel() {
  const [state, setState] = useState<FunnelState>(emptyState);
  const [month, setMonth] = useState(currentMonth());
  const [campaign, setCampaign] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = () => {
      setState({
        proposals: read(KEYS.proposals, []),
        expenses: read(KEYS.expenses, []),
        customers: read(KEYS.customers, []),
        bookings: read(KEYS.bookings, []),
        histories: read(KEYS.histories, []),
        receipts: read(KEYS.receipts, []),
        staff: salesStaff(),
        current: readCurrentStaff(),
        availability: readSalesAvailability(),
      });
    };
    load();
    EVENTS.forEach((event) => window.addEventListener(event, load));
    return () => EVENTS.forEach((event) => window.removeEventListener(event, load));
  }, []);

  const data = useMemo(
    () =>
      buildMarketingSalesFunnel(
        {
          proposals: state.proposals,
          expenses: state.expenses,
          customers: state.customers,
          bookings: state.bookings,
          histories: state.histories,
          receipts: state.receipts,
          assignments: readAssignments(),
          staff: state.staff,
          availability: state.availability,
        },
        month,
        campaign,
      ),
    [campaign, month, state],
  );
  const canManage = Boolean(state.current && (isOwner(state.current) || isAdminStaff(state.current)));

  function toggleSale(staffId: string, staffName: string, receiving: boolean) {
    if (!canManage || !state.current) return;
    if (
      receiving &&
      !confirm(
        `Tạm dừng chia lead mới cho ${staffName}? Các khách đã giao vẫn được giữ nguyên.`,
      )
    ) return;
    setSaleReceivingCustomers(staffId, !receiving, state.current.name);
    setMessage(
      receiving
        ? `Đã dừng chia lead mới cho ${staffName}.`
        : `Đã bật lại nhận lead cho ${staffName}.`,
    );
  }

  return (
    <section className="admin-panel marketing-sales-funnel">
      <div className="admin-panel-head funnel-head">
        <div>
          <small>MARKETING → SALE → KẾ TOÁN</small>
          <h2>Báo cáo phễu quảng cáo & năng suất Sale</h2>
          <p>Đối chiếu chi phí Ads với cohort lead phát sinh trong tháng, lịch sử tiếp cận và đơn đã có phiếu thu cọc.</p>
        </div>
        <div className="funnel-filters">
          <label>
            Tháng
            <input
              type="month"
              value={month}
              onChange={(event) => {
                setMonth(event.target.value);
                setCampaign("all");
              }}
            />
          </label>
          <label>
            Chiến dịch
            <select value={campaign} onChange={(event) => setCampaign(event.target.value)}>
              <option value="all">Tất cả chiến dịch</option>
              {data.campaigns.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      {message ? <p className="admin-api-note funnel-message">{message}</p> : null}

      <div className="funnel-flow" aria-label="Phễu quảng cáo đến đơn chốt cọc">
        <article>
          <span>1</span>
          <small>TIỀN ADS ĐÃ CHI</small>
          <b>{money(data.adSpend)}</b>
          <p>{data.totalMarketingSpend !== data.adSpend ? `${money(data.totalMarketingSpend)} tổng chi Marketing` : "Theo chi phí đã ghi nhận"}</p>
        </article>
        <i aria-hidden="true">→</i>
        <article>
          <span>2</span>
          <small>LEAD MANG VỀ</small>
          <b>{data.leads}</b>
          <p>{data.costPerLead ? `${money(data.costPerLead)} / lead` : "Chưa tính được CPL"}</p>
        </article>
        <i aria-hidden="true">→</i>
        <article>
          <span>3</span>
          <small>SALE ĐÃ TIẾP CẬN</small>
          <b>{data.contacted}</b>
          <p>{data.contactRate}% số lead được tiếp cận</p>
        </article>
        <i aria-hidden="true">→</i>
        <article className="funnel-deposit-stage">
          <span>4</span>
          <small>ĐƠN CHỐT CỌC</small>
          <b>{data.deposits}</b>
          <p>{data.conversionRate}% chuyển đổi · {data.costPerDeposit ? `${money(data.costPerDeposit)} / đơn` : "chưa có CPL chốt"}</p>
        </article>
      </div>

      <div className="funnel-data-health">
        <span className={data.unattributedLeads ? "warning" : "good"}>
          <b>{data.unattributedLeads}</b> lead chưa gắn chiến dịch
        </span>
        <span className={data.unassignedLeads ? "danger" : "good"}>
          <b>{data.unassignedLeads}</b> lead chưa phân Sale
        </span>
        <p>Lead chỉ vào phễu khi “Nguồn / chiến dịch” trong CRM khớp với chiến dịch Marketing.</p>
      </div>

      <div className="funnel-section-head">
        <div><small>HIỆU SUẤT THEO NGƯỜI NHẬN LEAD</small><h3>Năng suất từng Sale</h3></div>
        <p>Từ 5 lead mới bắt đầu đánh giá; chốt từ 15% là tốt, dưới 8% hoặc tiếp cận dưới 60% là kém.</p>
      </div>
      <div className="funnel-table-wrap">
        <table className="funnel-table">
          <thead>
            <tr><th>Sale</th><th>Lead nhận</th><th>Đã tiếp cận</th><th>Tỷ lệ tiếp cận</th><th>Đơn cọc</th><th>Tỷ lệ chốt</th><th>Đánh giá</th><th>Chia lead</th></tr>
          </thead>
          <tbody>
            {data.saleRows.map((row) => (
              <tr key={row.staffId} className={`funnel-sale-${row.assessment}`}>
                <td><b>{row.staffName}</b><small>{row.receivingCustomers ? "Đang nhận khách mới" : "Đã tạm ngưng"}</small></td>
                <td><strong>{row.received}</strong></td>
                <td>{row.contacted}</td>
                <td>{row.contactRate}%</td>
                <td>{row.deposits}</td>
                <td><strong>{row.conversionRate}%</strong></td>
                <td><span className={`funnel-assessment ${row.assessment}`}>{row.assessmentLabel}</span></td>
                <td>
                  {canManage && row.assessment === "poor" && row.receivingCustomers ? (
                    <button className="funnel-pause" onClick={() => toggleSale(row.staffId, row.staffName, true)}>Dừng chia lead</button>
                  ) : canManage && !row.receivingCustomers ? (
                    <button className="funnel-resume" onClick={() => toggleSale(row.staffId, row.staffName, false)}>Bật nhận lead</button>
                  ) : (
                    <small>{row.receivingCustomers ? "Đang bật" : "Đang tắt"}</small>
                  )}
                </td>
              </tr>
            ))}
            {!data.saleRows.length ? <tr><td colSpan={8} className="funnel-empty">Chưa có nhân viên Sale để lập báo cáo.</td></tr> : null}
          </tbody>
        </table>
      </div>
      {!data.campaigns.length ? (
        <div className="funnel-empty-card"><b>Chưa có chiến dịch trong tháng {month}</b><span>Hãy tạo và duyệt đề xuất Marketing, ghi chi phí rồi chọn chiến dịch đó khi nhập lead vào CRM.</span></div>
      ) : data.leads === 0 ? (
        <div className="funnel-empty-card"><b>Chiến dịch chưa có lead được quy nguồn</b><span>Trong CRM, chọn đúng “Nguồn / chiến dịch” khi nhập khách để số liệu tự chạy vào phễu.</span></div>
      ) : null}
    </section>
  );
}
