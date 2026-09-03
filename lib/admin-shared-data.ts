"use client";

export const ADMIN_API_KEY_STORAGE = "tn_admin_api_key";
export const SHARED_PENDING_STORAGE = "happygo_admin_shared_pending_v1";
export const SHARED_STATUS_EVENT = "happygo-admin-shared-status";
const SHARED_BOOTSTRAP_STORAGE = "happygo_admin_shared_bootstrapped_v1";

export const SHARED_ADMIN_KEYS = [
  "tn_local_bookings_v1",
  "tn_local_customer_status_v1",
  "happygo_marketing_budget_proposals_v1",
  "happygo_marketing_expenses_v1",
  "happygo_crm_manual_customers_v1",
  "happygo_crm_sales_assignments_v1",
  "happygo_crm_auto_assignment_v1",
  "happygo_crm_sales_availability_v1",
  "happygo_crm_history_v1",
  "happygo_crm_followups_v1",
  "happygo_crm_pipeline_v1",
  "happygo_crm_opportunities_v1",
  "happygo_customer_receipts_v1",
  "happygo_payment_requests_v1",
  "happygo_payment_suppliers_v1",
  "happygo_accounting_manual_entries_v1",
  "happygo_accounting_opening_balances_v1",
  "happygo_supplier_service_orders_v1",
  "happygo_inventory_reservations_v1",
  "happygo_booking_confirm_v1",
  "happygo_booking_confirm_versions_v1",
  "happygo_booking_operator_history_v1",
  "happygo_booking_ops_checklist_v1",
  "happygo_booking_price_history_v1",
  "happygo_booking_status_history_v1",
  "happygo_attendance_config_v1",
  "happygo_attendance_records_v1",
  "happygo_attendance_notifications_v1",
] as const;

export type SharedAdminKey = (typeof SHARED_ADMIN_KEYS)[number];
export type SharedSyncState = "idle" | "missing-key" | "syncing" | "synced" | "error";
export type SharedSyncDetail = { state: SharedSyncState; message: string; at?: string };

export const SHARED_EVENT_KEYS: Record<string, readonly SharedAdminKey[]> = {
  "tn-bookings-updated": ["tn_local_bookings_v1", "happygo_booking_confirm_v1"],
  "happygo-crm-customers-updated": ["happygo_crm_manual_customers_v1", "tn_local_customer_status_v1"],
  "happygo-crm-assignment": ["happygo_crm_sales_assignments_v1"],
  "happygo-crm-auto-assignment": ["happygo_crm_auto_assignment_v1", "happygo_crm_sales_assignments_v1"],
  "happygo-sales-availability-updated": ["happygo_crm_sales_availability_v1"],
  "happygo-crm-history-updated": ["happygo_crm_history_v1"],
  "happygo-crm-followups-updated": ["happygo_crm_followups_v1"],
  "happygo-crm-pipeline-updated": ["happygo_crm_pipeline_v1"],
  "happygo-crm-opportunity-updated": ["happygo_crm_opportunities_v1"],
  "happygo-customer-receipts-updated": ["happygo_customer_receipts_v1"],
  "happygo-payment-updated": ["happygo_payment_requests_v1", "happygo_payment_suppliers_v1"],
  "happygo-accounting-updated": ["happygo_accounting_manual_entries_v1", "happygo_accounting_opening_balances_v1"],
  "happygo-marketing-budget-updated": ["happygo_marketing_budget_proposals_v1", "happygo_marketing_expenses_v1"],
  "happygo-supplier-orders-updated": ["happygo_supplier_service_orders_v1"],
  "tn-inventory-updated": ["happygo_inventory_reservations_v1"],
  "happygo-booking-confirm-version-updated": ["happygo_booking_confirm_v1", "happygo_booking_confirm_versions_v1"],
  "happygo-booking-confirm-updated": ["happygo_booking_confirm_v1"],
  "happygo-booking-operator-history-updated": ["happygo_booking_operator_history_v1"],
  "happygo-booking-ops-updated": ["happygo_booking_ops_checklist_v1"],
  "happygo-booking-price-history-updated": ["happygo_booking_price_history_v1"],
  "happygo-booking-status-history-updated": ["happygo_booking_status_history_v1"],
  "happygo-attendance-updated": ["happygo_attendance_config_v1", "happygo_attendance_records_v1", "happygo_attendance_notifications_v1"],
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
let applyingRemote = false;
let flushTimer: number | undefined;
let syncInFlight: Promise<boolean> | null = null;
const queued = new Set<SharedAdminKey>();

function notify(detail: SharedSyncDetail) {
  window.dispatchEvent(new CustomEvent<SharedSyncDetail>(SHARED_STATUS_EVENT, { detail }));
}

function readPending() {
  try {
    const value = JSON.parse(localStorage.getItem(SHARED_PENDING_STORAGE) || "[]");
    return new Set<SharedAdminKey>((Array.isArray(value) ? value : []).filter((key): key is SharedAdminKey => SHARED_ADMIN_KEYS.includes(key)));
  } catch {
    return new Set<SharedAdminKey>();
  }
}

function savePending(keys: Set<SharedAdminKey>) {
  localStorage.setItem(SHARED_PENDING_STORAGE, JSON.stringify([...keys]));
}

function localValue(key: SharedAdminKey) {
  const raw = localStorage.getItem(key);
  if (raw === null) return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

function meaningful(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== "";
}

function mergeBookings(remote: unknown, local: unknown) {
  if (!Array.isArray(remote) || !Array.isArray(local)) return remote;
  const merged = new Map<string, unknown>();
  remote.forEach((item: any) => merged.set(String(item?.code || item?.id || Math.random()), item));
  local.forEach((item: any) => merged.set(String(item?.code || item?.id || Math.random()), item));
  return [...merged.values()].sort((a: any, b: any) => +new Date(b?.created_at || 0) - +new Date(a?.created_at || 0));
}

function adminKey() {
  return localStorage.getItem(ADMIN_API_KEY_STORAGE)?.trim() || "";
}

function eventNamesFor(keys: readonly SharedAdminKey[]) {
  const wanted = new Set(keys);
  return Object.entries(SHARED_EVENT_KEYS)
    .filter(([, mapped]) => mapped.some((key) => wanted.has(key)))
    .map(([event]) => event);
}

type RemoteRecord = { value: unknown; updatedAt?: string; updatedBy?: string };

function applyRemote(records: Partial<Record<SharedAdminKey, RemoteRecord>>) {
  const changed: SharedAdminKey[] = [];
  applyingRemote = true;
  try {
    for (const key of SHARED_ADMIN_KEYS) {
      if (!(key in records)) continue;
      const value = records[key]?.value;
      const serialized = JSON.stringify(value ?? null);
      if (localStorage.getItem(key) !== serialized) {
        localStorage.setItem(key, serialized);
        changed.push(key);
      }
    }
  } finally {
    applyingRemote = false;
  }
  eventNamesFor(changed).forEach((event) => window.dispatchEvent(new Event(event)));
  if (changed.length) window.dispatchEvent(new Event("storage"));
}

async function request(path: string, init?: RequestInit) {
  const key = adminKey();
  if (!key) throw new Error("MISSING_KEY");
  return fetch(`${API_BASE}/api/admin/shared-data${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", "x-admin-key": key, ...(init?.headers || {}) },
  });
}

export function hasSharedAdminKey() {
  return Boolean(adminKey());
}

export function saveSharedAdminKey(value: string) {
  const key = value.trim();
  if (key) localStorage.setItem(ADMIN_API_KEY_STORAGE, key);
  else localStorage.removeItem(ADMIN_API_KEY_STORAGE);
}

export function isApplyingSharedData() {
  return applyingRemote;
}

export async function pushSharedKeys(keys: readonly SharedAdminKey[], updatedBy = "Nhân viên HappyGo") {
  const unique = [...new Set(keys)];
  const pending = readPending();
  unique.forEach((key) => pending.add(key));
  savePending(pending);
  if (!adminKey()) {
    notify({ state: "missing-key", message: "Cần nhập khóa đồng bộ nội bộ." });
    return false;
  }
  const records = unique.flatMap((key) => {
    const value = localValue(key);
    return value === undefined ? [] : [{ key, value }];
  });
  if (!records.length) {
    unique.forEach((key) => pending.delete(key));
    savePending(pending);
    return true;
  }
  notify({ state: "syncing", message: "Đang lưu dữ liệu dùng chung..." });
  try {
    const response = await request("", { method: "PUT", body: JSON.stringify({ records, updatedBy }) });
    if (!response.ok) throw new Error(response.status === 401 ? "INVALID_KEY" : `HTTP_${response.status}`);
    unique.forEach((key) => pending.delete(key));
    savePending(pending);
    const at = new Date().toISOString();
    notify({ state: "synced", message: "Dữ liệu đã lưu dùng chung.", at });
    return true;
  } catch (error) {
    const invalid = error instanceof Error && error.message === "INVALID_KEY";
    notify({ state: "error", message: invalid ? "Khóa đồng bộ không đúng." : "Chưa thể lưu lên máy chủ; dữ liệu vẫn an toàn trên thiết bị này." });
    return false;
  }
}

export function queueSharedKeys(keys: readonly SharedAdminKey[], updatedBy?: string) {
  if (applyingRemote) return;
  const pending = readPending();
  keys.forEach((key) => { queued.add(key); pending.add(key); });
  savePending(pending);
  if (flushTimer) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    const next = [...queued];
    queued.clear();
    void pushSharedKeys(next, updatedBy);
  }, 450);
}

async function runSharedSync(keys: readonly SharedAdminKey[], updatedBy: string) {
  const unique = [...new Set(keys)];
  if (!adminKey()) {
    notify({ state: "missing-key", message: "Nhập khóa nội bộ để dùng dữ liệu chung giữa các thiết bị." });
    return false;
  }
  notify({ state: "syncing", message: "Đang đồng bộ dữ liệu công ty..." });
  const pending = readPending();
  const pendingKeys = unique.filter((key) => pending.has(key) || queued.has(key));
  if (pendingKeys.length && !(await pushSharedKeys(pendingKeys, updatedBy))) return false;
  try {
    const query = encodeURIComponent(unique.join(","));
    const response = await request(`?keys=${query}`);
    if (!response.ok) throw new Error(response.status === 401 ? "INVALID_KEY" : `HTTP_${response.status}`);
    const data = await response.json() as { records?: Partial<Record<SharedAdminKey, RemoteRecord>> };
    const records = data.records || {};
    const bootstrapped = localStorage.getItem(SHARED_BOOTSTRAP_STORAGE) === "1";
    let mergedLegacyBookings = false;
    if (!bootstrapped && records.tn_local_bookings_v1 && meaningful(localValue("tn_local_bookings_v1"))) {
      records.tn_local_bookings_v1 = {
        ...records.tn_local_bookings_v1,
        value: mergeBookings(records.tn_local_bookings_v1.value, localValue("tn_local_bookings_v1")),
      };
      mergedLegacyBookings = true;
    }
    applyRemote(records);
    const initial = unique.filter((key) => (!(key in records) && meaningful(localValue(key))) || (mergedLegacyBookings && key === "tn_local_bookings_v1"));
    if (initial.length && !(await pushSharedKeys(initial, updatedBy))) return false;
    localStorage.setItem(SHARED_BOOTSTRAP_STORAGE, "1");
    const at = new Date().toISOString();
    notify({ state: "synced", message: "Đang dùng dữ liệu chung của công ty.", at });
    return true;
  } catch (error) {
    const invalid = error instanceof Error && error.message === "INVALID_KEY";
    notify({ state: "error", message: invalid ? "Khóa đồng bộ không đúng." : "Không kết nối được dữ liệu chung; đang dùng bản trên thiết bị." });
    return false;
  }
}

export function syncSharedData(keys: readonly SharedAdminKey[] = SHARED_ADMIN_KEYS, updatedBy = "Nhân viên HappyGo") {
  if (syncInFlight) return syncInFlight;
  syncInFlight = runSharedSync(keys, updatedBy).finally(() => { syncInFlight = null; });
  return syncInFlight;
}
