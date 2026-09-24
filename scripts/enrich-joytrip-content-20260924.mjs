import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = String(process.env.DATABASE_URL || '').trim();
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');

const IMPORT_ID = 'joytrip-content-enrichment-20260924-v2';
const sql = neon(DATABASE_URL);

const parsed = [];
for (let i = 1; i <= 7; i += 1) {
  const rows = JSON.parse(readFileSync(new URL(`../data/joytrip-enrichment/parsed-${i}.json`, import.meta.url), 'utf8'));
  if (Array.isArray(rows)) parsed.push(...rows);
}

const text = (value) => String(value || '').trim();
const norm = (value) => text(value)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const hasArray = (value) => Array.isArray(value) && value.length > 0;
const asObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const sourceKey = (sheet, link) => `${norm(sheet)}||${norm(link)}`;
const nameKey = (name, duration) => `${norm(name)}||${norm(duration)}`;

function cleanSegment(value) {
  let result = text(value).replace(/\r\n?/g, '\n');
  if (!result) return '';
  const cut = result.search(/\n(?:NGÀY KHỞI HÀNH|GIÁ TRỌN GÓI|BẢNG GIÁ|GIÁ TOUR|PHỤ THU PHÒNG ĐƠN)\b/i);
  if (cut > 80) result = result.slice(0, cut).trim();
  const lines = result.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length >= 6 && lines.length % 2 === 0) {
    const half = lines.length / 2;
    if (lines.slice(0, half).join('\n') === lines.slice(half).join('\n')) return lines.slice(0, half).join('\n');
  }
  const compact = [];
  for (const line of lines) if (line !== compact[compact.length - 1]) compact.push(line);
  return compact.join('\n');
}

const cleanDay = (day, index) => ({
  title: cleanSegment(day?.title) || `Ngày ${index + 1}`,
  morning: cleanSegment(day?.morning),
  afternoon: cleanSegment(day?.afternoon),
  evening: cleanSegment(day?.evening),
  meals: cleanSegment(day?.meals),
});
const cleanDays = (days) => (Array.isArray(days) ? days.map(cleanDay).filter((d) => d.morning || d.afternoon || d.evening) : []);
const itineraryText = (days) => days.map((d) => [d.title,d.morning,d.afternoon,d.evening,d.meals ? `Bữa ăn: ${d.meals}` : ''].filter(Boolean).join('\n')).join('\n\n');

const parsedBySlug = new Map();
const parsedBySource = new Map();
const parsedByName = new Map();
for (const item of parsed) {
  const days = cleanDays(item?.days);
  if (!days.length || text(item?.error)) continue;
  const row = { ...item, days };
  const slug = text(item?.matchSlug);
  if (slug && !parsedBySlug.has(slug)) parsedBySlug.set(slug, row);
  const source = sourceKey(item?.sourceSheet, item?.programLink);
  if (source !== '||' && !parsedBySource.has(source)) parsedBySource.set(source, row);
  const nk = nameKey(item?.name, item?.duration);
  if (nk !== '||' && !parsedByName.has(nk)) parsedByName.set(nk, row);
}

const filePath = (filename) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1800`;
const commons = (filename) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`;
const visual = (file, label, source = commons(file), image = filePath(file)) => ({ image, source, label });
const GREAT_WALL = {image:'https://images.unsplash.com/photo-1506788655179-95753451e1a6?auto=format&fit=crop&w=1800&q=88',source:'https://unsplash.com/photos/great-wall-of-china-9H_Q4kcAtf0',label:'Vạn Lý Trường Thành, Trung Quốc'};
const VISUALS = [
  { keys: ['dai ly','le giang','shangrila','shangri la','con minh','van nam','yunnan'], ...visual('Old Town of Lijiang.jpg', 'Lệ Giang, Vân Nam, Trung Quốc') },
  { keys: ['thuong hai','hang chau','o tran','to chau','boc vien','nam kinh','vo tich'], ...visual('Shanghai Skyline 2025.jpg', 'Thượng Hải, Trung Quốc') },
  { keys: ['bac kinh','van ly truong thanh'], ...GREAT_WALL },
  { keys: ['tan cuong','urumqi','kanas','hemu','yining','sayram','dushanzi'], ...GREAT_WALL, label: 'Tân Cương, Trung Quốc' },
  { keys: ['tay an','lac duong','khai phong','thieu lam'], ...visual('Terracotta army.jpg', 'Tây An, Trung Quốc') },
  { keys: ['lhasa','tibet','tay tang','shigatse'], ...visual('Potala PALACE.jpg', 'Lhasa, Tây Tạng') },
  { keys: ['dai loan','dai bac','taipei','cao hung','dai trung'], ...visual('晚霞下的台北101.jpg', 'Đài Bắc, Đài Loan') },
  { keys: ['han quoc','seoul','nami','everland','lotte','busan'], ...visual('Gyeongbokgung - Seoul, South Korea (50601272061).jpg', 'Seoul, Hàn Quốc') },
  { keys: ['nhat ban','tokyo','kyoto','osaka','fuji','hokkaido','nagoya'], ...visual('Tokyo Skyline.jpg', 'Tokyo, Nhật Bản') },
  { keys: ['singapore'], ...visual('Singapore-marina-bay.jpg', 'Singapore') },
  { keys: ['malaysia','kuala lumpur','malacca'], ...visual('Kuala-lumpur-petronas-towers.jpg', 'Kuala Lumpur, Malaysia') },
  { keys: ['thai lan','bangkok','chiang mai','chiang rai','pattaya'], ...visual('Bangkok Wat Arun Ratchawararam 1.jpg', 'Bangkok, Thái Lan') },
  { keys: ['indonesia','bali'], ...visual('Bali-tanah-lot.jpg', 'Bali, Indonesia') },
  { keys: ['tho nhi ky','istanbul','cappadocia'], ...visual('Hagia Sophia Istanbul.JPG', 'Istanbul, Thổ Nhĩ Kỳ') },
  { keys: ['nga','moscow','saint petersburg','st petersburg'], ...visual('Moscow - Red Square in May 2026.jpg', 'Moscow, Nga') },
  { keys: ['ai cap','cairo','giza','luxor','bahariya'], ...visual('The Giza Pyramids.jpg', 'Giza, Ai Cập') },
  { keys: ['nam phi','cape town','johannesburg'], ...visual('Cape Town Table Mountain.jpg', 'Cape Town, Nam Phi') },
];
const FALLBACK_BY_SHEET = new Map([
  ['dai loan', visual('晚霞下的台北101.jpg', 'Đài Bắc, Đài Loan')],
  ['han quoc', visual('Gyeongbokgung - Seoul, South Korea (50601272061).jpg', 'Seoul, Hàn Quốc')],
  ['nhat ban', visual('Tokyo Skyline.jpg', 'Tokyo, Nhật Bản')],
  ['nga tho', visual('Hagia Sophia Istanbul.JPG', 'Istanbul, Thổ Nhĩ Kỳ')],
  ['nam phi', visual('Cape Town Table Mountain.jpg', 'Cape Town, Nam Phi')],
  ['lkh trung quoc 2026', visual('Shanghai Skyline 2025.jpg', 'Trung Quốc')],
  ['tour doc la', GREAT_WALL],
  ['dna', visual('Singapore-marina-bay.jpg', 'Đông Nam Á')],
]);
function pickVisual(record, data = {}) {
  const haystack = norm([record?.name,record?.route,record?.category,record?.sourceSheet,data?.route,data?.category,data?.joytripSourceSheet].filter(Boolean).join(' '));
  const found = VISUALS.find((item) => item.keys.some((key) => haystack.includes(norm(key))));
  if (found) return { image: found.image, source: found.source, label: found.label };
  return FALLBACK_BY_SHEET.get(norm(record?.sourceSheet || data?.joytripSourceSheet || data?.sourceSheet)) || null;
}
function findParsed(slug, name, data) {
  const exactSlug = parsedBySlug.get(text(slug));
  if (exactSlug) return exactSlug;
  const source = sourceKey(data?.joytripSourceSheet || data?.sourceSheet,data?.joytripProgramLink || data?.sourceProgramLink || data?.programLink);
  if (source !== '||' && parsedBySource.has(source)) return parsedBySource.get(source);
  const nk = nameKey(name, data?.duration);
  return nk !== '||' ? parsedByName.get(nk) || null : null;
}
function fillData(slug, name, raw) {
  const data = { ...asObject(raw) };
  const parsedItem = findParsed(slug, name, data);
  let changed=false,itineraryAdded=false,imageAdded=false;
  if (parsedItem) {
    if (!hasArray(data.days)) { data.days=parsedItem.days; changed=true; itineraryAdded=true; }
    if (!text(data.itinerary)) { data.itinerary=itineraryText(parsedItem.days); changed=true; itineraryAdded=true; }
    if (!text(data.sourceProgramUrl) && text(parsedItem.sourceUrl)) { data.sourceProgramUrl=text(parsedItem.sourceUrl); changed=true; }
    if (!text(data.joytripSourceUrl) && text(parsedItem.sourceUrl)) { data.joytripSourceUrl=text(parsedItem.sourceUrl); changed=true; }
  }
  const sourceForVisual = parsedItem || {name,route:data.route,category:data.category,sourceSheet:data.joytripSourceSheet || data.sourceSheet};
  const chosen=pickVisual(sourceForVisual,data);
  if (chosen && !text(data.cover)) { data.cover=chosen.image; changed=true; imageAdded=true; }
  if (chosen && !text(data.gallery) && !hasArray(data.gallery)) { data.gallery=chosen.image; changed=true; }
  if (chosen && !text(data.imageSourcePage)) { data.imageSourcePage=chosen.source; changed=true; }
  if (chosen && !text(data.imageAlt)) { data.imageAlt=`${name} – ${chosen.label}`; changed=true; }
  return {data,changed,itineraryAdded,imageAdded,parsed:Boolean(parsedItem),visual:Boolean(chosen)};
}

const already=await sql`select 1 from audit_logs where entity_type='system_import' and entity_id=${IMPORT_ID} limit 1`;
if (already.length) { console.log(`[joytrip-content] ${IMPORT_ID} already applied`); process.exit(0); }
let relationalUpdated=0,relationalItineraries=0,relationalImages=0,relationalUnmatchedItinerary=0,relationalNoVisual=0;
const products=await sql`select id, slug, name, data from products where partner_id is null and type='Tour'`;
for (const row of products) {
  const before=asObject(row.data),result=fillData(row.slug,row.name,before);
  if (!result.parsed && !hasArray(before.days) && !text(before.itinerary)) relationalUnmatchedItinerary+=1;
  if (!result.visual && !text(before.cover)) relationalNoVisual+=1;
  if (!result.changed) continue;
  await sql`update products set data=${JSON.stringify(result.data)}::jsonb, updated_at=now() where id=${row.id}`;
  relationalUpdated+=1;
  if (result.itineraryAdded) relationalItineraries+=1;
  if (result.imageAdded) relationalImages+=1;
}
function unwrapEnvelope(value) {
  let parsedValue=value;
  if (typeof parsedValue==='string') { try { parsedValue=JSON.parse(parsedValue); } catch { return null; } }
  return parsedValue && typeof parsedValue==='object' && 'value' in parsedValue ? parsedValue : null;
}
let sharedUpdated=0,sharedItineraries=0,sharedImages=0;
const sharedRows=await sql`select after_data from audit_logs where entity_type='admin_shared_state' and entity_id='tn_cms_tours_v3' order by created_at desc, id desc limit 1`;
const sharedEnvelope=unwrapEnvelope(sharedRows[0]?.after_data);
if (sharedEnvelope && Array.isArray(sharedEnvelope.value)) {
  const next=sharedEnvelope.value.map((tour)=>{
    const before=asObject(tour),result=fillData(before.slug,before.name,before);
    if (!result.changed) return before;
    sharedUpdated+=1;
    if (result.itineraryAdded) sharedItineraries+=1;
    if (result.imageAdded) sharedImages+=1;
    return result.data;
  });
  if (sharedUpdated) {
    const updatedAt=new Date().toISOString();
    await sql`insert into audit_logs(action, entity_type, entity_id, before_data, after_data) values('joytrip.content_enrichment','admin_shared_state','tn_cms_tours_v3',${JSON.stringify(sharedEnvelope)}::jsonb,${JSON.stringify({value:next,updatedAt,updatedBy:'JOYTRIP enrichment 2026-09-24'})}::jsonb)`;
  }
}
const report={importId:IMPORT_ID,parsedRows:parsed.length,parsedUsable:parsedBySource.size,relationalTours:products.length,relationalUpdated,relationalItineraries,relationalImages,relationalUnmatchedItinerary,relationalNoVisual,sharedUpdated,sharedItineraries,sharedImages,completedAt:new Date().toISOString()};
await sql`insert into audit_logs(action, entity_type, entity_id, after_data) values('joytrip.content_enrichment.complete','system_import',${IMPORT_ID},${JSON.stringify(report)}::jsonb)`;
console.log('[joytrip-content] complete',JSON.stringify(report));
