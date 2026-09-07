import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};
const mustNot=(path,needle,label)=>{if(read(path).includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)} trong ${path}`)};

const access='lib/server/partner-access.ts';
const login='app/api/partner/auth/login/route.ts';
const register='app/api/partner/auth/register/route.ts';
const admin='app/api/admin/partners/route.ts';

must(access,'floor(extract(epoch from updated_at)*1000)::bigint as session_version','Partner actor phải đọc security version từ partners.updated_at');
must(access,"!['pending','active'].includes(String(partner.status))",'Chỉ Partner pending/active được giữ phiên');
must(access,'if(session.ver!==currentVersion)return null','Partner session version cũ phải bị thu hồi');
must(access,'updatedAtSeconds>session.iat','Legacy Partner session phải bị thu hồi nếu hồ sơ đổi sau lúc phát token');
mustNot(access,"String(partner.status)==='blocked'",'Không được chỉ chặn blocked rồi để rejected tiếp tục dùng portal');

must(login,'floor(extract(epoch from p.updated_at)*1000)::bigint as session_version','Partner login phải lấy security version từ hồ sơ Partner');
must(login,"!['pending','active'].includes(String(row.status))",'Partner rejected/blocked không được đăng nhập');
must(login,"setSessionCookie(response,COOKIE,'partner',String(row.id),String(row.session_version))",'Partner login phải ký security version vào session');

must(register,'as session_version','Partner mới đăng ký phải nhận security version từ row vừa tạo');
must(register,"setSessionCookie(response,COOKIE,'partner',String(result.id),String(result.session_version))",'Partner registration phải tạo versioned session');
must(admin,'update partners set status=${status},updated_at=now()','Admin đổi trạng thái Partner phải bump security version');

if(failures.length){console.error('\nPartner session regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Partner session regression checks passed.');
