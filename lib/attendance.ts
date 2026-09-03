export const ATTENDANCE_RECORDS_KEY = "happygo_attendance_records_v1";
export const ATTENDANCE_CONFIG_KEY = "happygo_attendance_config_v1";
export const ATTENDANCE_NOTICES_KEY = "happygo_attendance_notifications_v1";
export const ATTENDANCE_EVENT = "happygo-attendance-updated";

export type AttendanceLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  distanceMeters: number;
};

export type AttendanceRecord = {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  shiftLabel: string;
  scheduledStart: string;
  scheduledEnd: string;
  breakMinutes: number;
  dayWeight: number;
  checkInAt: string;
  checkOutAt?: string;
  checkInLocation?: AttendanceLocation;
  checkOutLocation?: AttendanceLocation;
  note?: string;
  adjustedAt?: string;
  adjustedBy?: string;
  adjustmentReason?: string;
};

export type AttendanceConfig = {
  companyName: string;
  companyAddress: string;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  requireLocation: boolean;
  graceMinutes: number;
  weekdayStart: string;
  weekdayEnd: string;
  weekdayBreakMinutes: number;
  saturdayStart: string;
  saturdayEnd: string;
};

export type AttendanceNotice = {
  id: string;
  targetStaffId: string;
  title: string;
  text: string;
  at: string;
  kind: "checkin" | "checkout";
};

export type AttendanceSchedule = {
  label: string;
  start: string;
  end: string;
  breakMinutes: number;
  dayWeight: number;
};

export const defaultAttendanceConfig: AttendanceConfig = {
  companyName: "Văn phòng HappyGo Travel",
  companyAddress: "Chưa thiết lập địa chỉ công ty",
  latitude: null,
  longitude: null,
  radiusMeters: 150,
  requireLocation: true,
  graceMinutes: 5,
  weekdayStart: "08:30",
  weekdayEnd: "17:30",
  weekdayBreakMinutes: 60,
  saturdayStart: "08:30",
  saturdayEnd: "12:00",
};

function parse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = JSON.parse(localStorage.getItem(key) || "");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function readAttendanceConfig(): AttendanceConfig {
  return { ...defaultAttendanceConfig, ...parse(ATTENDANCE_CONFIG_KEY, {}) };
}

export function readAttendanceRecords(): AttendanceRecord[] {
  const value = parse<AttendanceRecord[]>(ATTENDANCE_RECORDS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function readAttendanceNotices(): AttendanceNotice[] {
  const value = parse<AttendanceNotice[]>(ATTENDANCE_NOTICES_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function saveAttendanceConfig(value: AttendanceConfig) {
  localStorage.setItem(ATTENDANCE_CONFIG_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(ATTENDANCE_EVENT));
}

export function saveAttendanceRecords(value: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_RECORDS_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(ATTENDANCE_EVENT));
}

export function saveAttendanceNotices(value: AttendanceNotice[]) {
  localStorage.setItem(ATTENDANCE_NOTICES_KEY, JSON.stringify(value.slice(0, 500)));
  window.dispatchEvent(new Event(ATTENDANCE_EVENT));
}

export function localDateKey(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentMonthKey(value = new Date()) {
  return localDateKey(value).slice(0, 7);
}

export function dateAtTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function scheduleForDate(date: string, config: AttendanceConfig): AttendanceSchedule {
  const [year, month, day] = date.split("-").map(Number);
  const weekDay = new Date(year, month - 1, day).getDay();
  if (weekDay === 6) {
    return {
      label: "Thứ Bảy · ca sáng",
      start: config.saturdayStart,
      end: config.saturdayEnd,
      breakMinutes: 0,
      dayWeight: 0.5,
    };
  }
  if (weekDay === 0) {
    return {
      label: "Chủ nhật · nghỉ cả ngày",
      start: "00:00",
      end: "00:00",
      breakMinutes: 0,
      dayWeight: 0,
    };
  }
  return {
    label: "Ngày thường · cả ngày",
    start: config.weekdayStart,
    end: config.weekdayEnd,
    breakMinutes: config.weekdayBreakMinutes,
    dayWeight: 1,
  };
}

export function plannedMinutes(schedule: AttendanceSchedule) {
  return Math.max(
    1,
    Math.round(
      (dateAtTime("2000-01-01", schedule.end).getTime() -
        dateAtTime("2000-01-01", schedule.start).getTime()) /
        60000 -
        schedule.breakMinutes,
    ),
  );
}

export function workedMinutes(record: AttendanceRecord) {
  if (!record.checkOutAt) return 0;
  const elapsed = Math.round(
    (new Date(record.checkOutAt).getTime() - new Date(record.checkInAt).getTime()) / 60000,
  );
  const breakDeduction = elapsed >= 360 ? record.breakMinutes : 0;
  return Math.max(
    0,
    elapsed - breakDeduction,
  );
}

export function lateMinutes(record: AttendanceRecord, graceMinutes: number) {
  return Math.max(
    0,
    Math.round(
      (new Date(record.checkInAt).getTime() -
        dateAtTime(record.date, record.scheduledStart).getTime()) /
        60000 -
        graceMinutes,
    ),
  );
}

export function earlyMinutes(record: AttendanceRecord) {
  if (!record.checkOutAt) return 0;
  return Math.max(
    0,
    Math.round(
      (dateAtTime(record.date, record.scheduledEnd).getTime() -
        new Date(record.checkOutAt).getTime()) /
        60000,
    ),
  );
}

export function payableDays(record: AttendanceRecord) {
  if (!record.checkOutAt) return 0;
  const schedule: AttendanceSchedule = {
    label: record.shiftLabel,
    start: record.scheduledStart,
    end: record.scheduledEnd,
    breakMinutes: record.breakMinutes,
    dayWeight: record.dayWeight,
  };
  const ratio = Math.min(1, workedMinutes(record) / plannedMinutes(schedule));
  return Math.round(ratio * record.dayWeight * 100) / 100;
}

export function distanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(deltaLongitude / 2) ** 2;
  return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function datesInMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) =>
    `${year}-${String(monthNumber).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
  );
}

export function formatMinutes(value: number) {
  const minutes = Math.max(0, Math.round(value));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}p`;
}
