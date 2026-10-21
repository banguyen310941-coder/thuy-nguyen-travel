/** Normalize CMS dates for JSON-LD without inventing a publication time. */
export function schemaDate(value: string | null | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  const local = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  const iso = /^(\d{4})-(\d{2})-(\d{2})(.*)$/.exec(raw);
  if (!local && !iso) return undefined;
  const year = Number(local ? local[3] : iso![1]);
  const month = Number(local ? local[2] : iso![2]);
  const day = Number(local ? local[1] : iso![3]);
  const calendar = new Date(0);
  calendar.setUTCFullYear(year, month - 1, day);
  if (year < 1 || calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return undefined;
  const date = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const time = iso?.[4];
  if (!time) return date;
  // datetime-local fields in the HappyGo CMS use Vietnam local time.
  const match = /^T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,3})?)?(Z|[+-](?:0\d|1[0-4]):[0-5]\d)?$/.exec(time);
  if (!match || (match[5]?.slice(1, 3) === '14' && !match[5].endsWith(':00'))) return undefined;
  const timestamp = `${date}${time}${match[5] ? '' : '+07:00'}`;
  return Number.isFinite(Date.parse(timestamp)) ? timestamp : undefined;
}
