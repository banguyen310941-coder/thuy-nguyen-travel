import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/lib/db";
import { adminActor, type AdminActor } from "@/lib/server/admin-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ENTITY_TYPE = "admin_shared_state";
const MAX_BODY_SIZE = 3_800_000;
const ALLOWED_KEYS = new Set([
  "tn_local_bookings_v1", "tn_local_customer_status_v1",
  "happygo_marketing_budget_proposals_v1", "happygo_marketing_expenses_v1",
  "happygo_crm_manual_customers_v1", "happygo_crm_sales_assignments_v1", "happygo_crm_auto_assignment_v1", "happygo_crm_sales_availability_v1",
  "happygo_crm_history_v1", "happygo_crm_followups_v1", "happygo_crm_pipeline_v1", "happygo_crm_opportunities_v1",
  "happygo_customer_receipts_v1", "happygo_payment_requests_v1", "happygo_payment_suppliers_v1",
  "happygo_accounting_manual_entries_v1", "happygo_accounting_opening_balances_v1",
  "happygo_supplier_service_orders_v1", "happygo_inventory_reservations_v1", "happygo_customer_vouchers_v1",
  "happygo_booking_confirm_v1", "happygo_booking_confirm_versions_v1", "happygo_booking_operator_history_v1", "happygo_booking_ops_checklist_v1", "happygo_booking_price_history_v1", "happygo_booking_status_history_v1",
  "happygo_attendance_config_v1", "happygo_attendance_records_v1", "happygo_attendance_notifications_v1",
  "tn_cms_products_v3_units", "tn_cms_daily_rates_v1", "tn_cms_tours_v3", "tn_cms_articles_v3", "tn_cms_homepage",
  "happygo_admin_team_chat_v4", "happygo_admin_chat_reads_v4", "happygo_admin_chat_pins_v4", "happygo_admin_chat_groups_v4",
]);

const KEY_PERMISSION: Record<string, string | null> = {
  tn_local_bookings_v1: "bookings",
  tn_local_customer_status_v1: "customers",
  happygo_marketing_budget_proposals_v1: "email",
  happygo_marketing_expenses_v1: "email",
  happygo_crm_manual_customers_v1: "customers",
  happygo_crm_sales_assignments_v1: "customers",
  happygo_crm_auto_assignment_v1: "customers",
  happygo_crm_sales_availability_v1: "customers",
  happygo_crm_history_v1: "customers",
  happygo_crm_followups_v1: "customers",
  happygo_crm_pipeline_v1: "customers",
  happygo_crm_opportunities_v1: "customers",
  happygo_customer_receipts_v1: "receipts",
  happygo_payment_requests_v1: "payments",
  happygo_payment_suppliers_v1: "payments",
  happygo_accounting_manual_entries_v1: "ledger",
  happygo_accounting_opening_balances_v1: "ledger",
  happygo_supplier_service_orders_v1: "bookings",
  happygo_inventory_reservations_v1: "bookings",
  happygo_customer_vouchers_v1: "bookings",
  happygo_booking_confirm_v1: "bookings",
  happygo_booking_confirm_versions_v1: "bookings",
  happygo_booking_operator_history_v1: "bookings",
  happygo_booking_ops_checklist_v1: "bookings",
  happygo_booking_price_history_v1: "bookings",
  happygo_booking_status_history_v1: "bookings",
  happygo_attendance_config_v1: "attendance",
  happygo_attendance_records_v1: "attendance",
  happygo_attendance_notifications_v1: "attendance",
  tn_cms_products_v3_units: "products",
  tn_cms_daily_rates_v1: "rates",
  tn_cms_tours_v3: "tours",
  tn_cms_articles_v3: "content",
  tn_cms_homepage: "settings",
  happygo_admin_team_chat_v4: null,
  happygo_admin_chat_reads_v4: null,
  happygo_admin_chat_pins_v4: null,
  happygo_admin_chat_groups_v4: null,
};

type SharedEnvelope = { value: unknown; updatedAt: string; updatedBy?: string };

function canUse(actor: AdminActor, key: string) {
  if (!ALLOWED_KEYS.has(key)) return false;
  if (actor.role === "owner" || actor.role === "admin" || actor.permissions.includes("*")) return true;
  const permission = KEY_PERMISSION[key];
  return permission === null || Boolean(permission && actor.permissions.includes(permission));
}

function parseEnvelope(value: unknown): SharedEnvelope | null {
  let parsed = value;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return null; }
  }
  if (!parsed || typeof parsed !== "object" || !("value" in parsed)) return null;
  const envelope = parsed as Partial<SharedEnvelope>;
  return { value: envelope.value, updatedAt: String(envelope.updatedAt || ""), updatedBy: envelope.updatedBy ? String(envelope.updatedBy) : undefined };
}

function bookingNumber(code: string) {
  let hash = 2166136261;
  for (let index = 0; index < code.length; index += 1) hash = Math.imul(hash ^ code.charCodeAt(index), 16777619);
  return (hash >>> 0) || 1;
}

function bookingStatus(value: unknown) {
  const status = String(value || "new");
  return ["new", "contacting", "confirmed", "completed", "cancelled"].includes(status) ? status : "new";
}

async function databaseBookings(sql: ReturnType<typeof db>) {
  const rows = await sql`
    select b.code,b.status,b.source,b.start_date,b.end_date,b.adults,b.children,b.rooms,
      b.customer_name_snapshot,b.phone_snapshot,b.email_snapshot,b.note,b.admin_note,
      b.selling_total_vnd,b.cost_total_vnd,b.sales_staff_id,b.sales_staff_name_snapshot,b.sales_assigned_at,b.created_at,
      item.product_name_snapshot,item.unit_name_snapshot,item.data_snapshot
    from bookings b
    left join lateral (
      select product_name_snapshot,unit_name_snapshot,data_snapshot from booking_items where booking_id=b.id order by id limit 1
    ) item on true
    order by b.created_at desc limit 1000
  `;
  return rows.map((row) => ({
    id: bookingNumber(String(row.code)), code: String(row.code), kind: String((row.data_snapshot as {kind?: unknown} | null)?.kind || "Dịch vụ"),
    product: String(row.product_name_snapshot || "Dịch vụ HappyGo") + (row.unit_name_snapshot ? ` · ${row.unit_name_snapshot}` : ""),
    customer_name: String(row.customer_name_snapshot || "Khách hàng"), phone: String(row.phone_snapshot || ""), email: row.email_snapshot ? String(row.email_snapshot) : "",
    start_date: row.start_date ? String(row.start_date).slice(0, 10) : null, end_date: row.end_date ? String(row.end_date).slice(0, 10) : null,
    adults: Number(row.adults || 1), children: Number(row.children || 0), rooms: Number(row.rooms || 1), note: String(row.note || ""),
    status: bookingStatus(row.status), admin_note: String(row.admin_note || ""), created_at: new Date(String(row.created_at)).toISOString(), source: String(row.source || "website"),
    salesStaffId: row.sales_staff_id ? String(row.sales_staff_id) : undefined, salesStaffName: row.sales_staff_name_snapshot ? String(row.sales_staff_name_snapshot) : undefined,
    salesAssignedAt: row.sales_assigned_at ? new Date(String(row.sales_assigned_at)).toISOString() : undefined,
    revenue: Number(row.selling_total_vnd || 0), costPrice: row.cost_total_vnd == null ? undefined : Number(row.cost_total_vnd),
  }));
}

async function latestRecords(sql: ReturnType<typeof db>, requested: Set<string>) {
  const rows = await sql`
    select distinct on (entity_id) entity_id,after_data,created_at
    from audit_logs where entity_type=${ENTITY_TYPE}
    order by entity_id,created_at desc,id desc
  `;
  const records: Record<string, SharedEnvelope> = {};
  for (const row of rows) {
    const key = String(row.entity_id);
    if (!requested.has(key) || !ALLOWED_KEYS.has(key)) continue;
    const envelope = parseEnvelope(row.after_data);
    if (envelope) records[key] = envelope;
  }
  if (requested.has("tn_local_bookings_v1")) {
    try {
      const relational = await databaseBookings(sql);
      const snapshot = Array.isArray(records.tn_local_bookings_v1?.value) ? records.tn_local_bookings_v1.value as Array<Record<string, unknown>> : [];
      const merged = new Map<string, Record<string, unknown>>();
      snapshot.forEach((item) => merged.set(String(item.code || item.id), item));
      relational.forEach((item) => {
        const code = String(item.code);
        merged.set(code, { ...(merged.get(code) || {}), ...item });
      });
      if (relational.length || snapshot.length) {
        records.tn_local_bookings_v1 = {
          value: [...merged.values()].sort((a, b) => +new Date(String(b.created_at || 0)) - +new Date(String(a.created_at || 0))),
          updatedAt: records.tn_local_bookings_v1?.updatedAt || new Date().toISOString(),
          updatedBy: records.tn_local_bookings_v1?.updatedBy || "Website HappyGo",
        };
      }
    } catch (error) {
      console.error("shared_booking_merge_failed", error);
    }
  }
  return records;
}

function unavailable() {
  return NextResponse.json({ error: "Dữ liệu dùng chung chưa được cấu hình." }, { status: 503 });
}

export async function GET(request: NextRequest) {
  if (!hasDatabase()) return unavailable();
  const actor = await adminActor(request);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = request.nextUrl.searchParams.get("keys") || "";
  const requestedRaw = (raw ? raw.split(",") : [...ALLOWED_KEYS]).filter((key) => ALLOWED_KEYS.has(key));
  const requested = new Set(requestedRaw.filter((key) => canUse(actor, key)));
  try {
    const records = await latestRecords(db(), requested);
    return NextResponse.json({ ok: true, records }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("shared_data_read_failed", error);
    return unavailable();
  }
}

export async function PUT(request: NextRequest) {
  if (!hasDatabase()) return unavailable();
  const actor = await adminActor(request);
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await request.text();
  if (raw.length > MAX_BODY_SIZE) return NextResponse.json({ error: "Gói dữ liệu quá lớn." }, { status: 413 });
  let body: { records?: Array<{ key?: unknown; value?: unknown }> } = {};
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  const input = Array.isArray(body.records) ? body.records : [];
  if (!input.length || input.length > ALLOWED_KEYS.size) return NextResponse.json({ error: "Danh sách dữ liệu không hợp lệ." }, { status: 400 });
  const records = input.map((record) => ({ key: String(record.key || ""), value: record.value }));
  if (records.some((record) => !canUse(actor, record.key))) return NextResponse.json({ error: "Có vùng dữ liệu không được phép." }, { status: 403 });
  const updatedAt = new Date().toISOString();
  try {
    const sql = db();
    await Promise.all(records.map((record) => sql`
      insert into audit_logs(action,entity_type,entity_id,staff_id,after_data)
      values('shared_state.save',${ENTITY_TYPE},${record.key},${actor.id},${JSON.stringify({ value: record.value, updatedAt, updatedBy: actor.name })}::jsonb)
    `));
    return NextResponse.json({ ok: true, updatedAt, saved: records.map((record) => record.key) });
  } catch (error) {
    console.error("shared_data_write_failed", error);
    return unavailable();
  }
}
