import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const service='lib/server/ambassador-sync.ts',route='app/api/admin/integrations/ambassador/route.ts',rates='app/api/admin/rates/route.ts',ui='components/AdminRateManagerV2.tsx';
must(service,"slug:'ambassador-cruise-i'",'Sync phải có Ambassador Cruise I');
must(service,"slug:'ambassador-signature'",'Sync phải có Ambassador Signature');
must(service,"slug:'ambassador-day-cruise'",'Sync phải có Ambassador Day Cruise');
must(service,"primaryCalendarText(html)",'Parser chỉ được đọc lịch chính, không đọc khối gợi ý chéo');
must(service,"This cruise has no availability on your choosen date",'Parser phải cắt trước recommendation block khi sold out');
must(service,"source:'ambassador'",'Rate tự đồng bộ phải gắn nguồn');
must(service,"inventoryMode:'availability_flag'",'Tồn từ nguồn chỉ được coi là cờ còn chỗ');
must(service,"label like ${'%\"source\":\"ambassador\"%'}",'Sync chỉ upsert dòng tự quản lý của Ambassador');
must(service,"status<>'hidden'",'Sync không được mở lại unit đã ẩn');
must(route,"adminActor(req,'rates')",'Endpoint sync phải yêu cầu quyền lịch giá');
must(route,'readBoundedJson(req,8192)','Endpoint sync phải có bounded JSON');
must(route,'Math.min(14,Math.max(1,Number(body.days)||7))','Khoảng sync phải có trần ngày');
must(route,'AMBASSADOR_USD_VND','Tỷ giá phải cấu hình được');
must(rates,"source:'manual'",'Giá Admin nhập tay phải có marker manual');
must(rates,"case when r.label like '%\"source\":\"ambassador\"%' then 0 else 1 end",'Giá manual phải được xếp sau để ưu tiên public');
must(ui,"/api/admin/integrations/ambassador",'Admin Rate Manager phải có nút sync Ambassador');
must(ui,'Nguồn Ambassador xác nhận còn chỗ · không phải số cabin thực','UI không được diễn giải availability flag thành tồn kho thật');
mustNot(service,'delete from rate_rules','Sync không được xóa lịch giá HappyGo');

if(failures.length){console.error('\nAmbassador sync regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Ambassador sync regression checks passed.');
