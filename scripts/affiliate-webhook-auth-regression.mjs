import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const route=read('app/api/affiliate/booking-completed/route.ts');
const middleware=read('middleware.ts');
const must=(source,needle,label)=>{if(!source.includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)}`)};
const mustNot=(source,needle,label)=>{if(source.includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)}`)};

must(route,'const signed=secretOk(req)','Webhook hoa hồng phải xác thực secret đúng một lần trước khi đọc body');
must(route,"const actor=signed?null:await adminActor(req,'bookings')",'Webhook phải giữ Admin fallback có phân quyền bookings');
must(route,'if(!signed&&!actor)return NextResponse.json','Request không có secret hợp lệ hoặc Admin session phải bị từ chối');
must(route,'requestBodyTooLarge(req,32768)','Webhook phải giới hạn payload sau khi xác thực');
must(route,'const body=await req.json().catch(()=>({}))','Webhook vẫn phải parse JSON an toàn sau auth');
const authIndex=route.indexOf('const signed=secretOk(req)');
const sizeIndex=route.indexOf('requestBodyTooLarge(req,32768)');
const bodyIndex=route.indexOf('const body=await req.json().catch(()=>({}))');
if(authIndex<0||sizeIndex<0||bodyIndex<0||!(authIndex<sizeIndex&&sizeIndex<bodyIndex))failures.push('Thứ tự bắt buộc phải là authenticate → body-size guard → parse JSON');

must(middleware,"'/api/affiliate/booking-completed':'x-affiliate-webhook-secret'",'Middleware phải biết credential header của affiliate webhook');
must(middleware,"'/api/payments/webhook':'x-payment-webhook-secret'",'Payment webhook vẫn phải được nhận diện bằng credential header');
must(middleware,'function signedWebhookCandidate(req:NextRequest)','Origin bypass phải phụ thuộc credential header');
must(middleware,'if(signedWebhookCandidate(req)||SAFE_METHODS.has(req.method)||sameOrigin(req))','Admin fallback không có webhook header phải đi qua same-origin');
mustNot(middleware,'SIGNED_WEBHOOKS.has(req.nextUrl.pathname)','Không được bypass origin chỉ dựa vào pathname webhook');

if(failures.length){console.error('\nAffiliate webhook auth regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Affiliate webhook auth regression checks passed.');
