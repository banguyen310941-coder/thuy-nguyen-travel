import {readFileSync} from 'node:fs';

const path='app/api/payments/webhook/route.ts';
const source=readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const must=(needle,label)=>{if(!source.includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)}`)};
const mustNot=(needle,label)=>{if(source.includes(needle))failures.push(`${label}: không được chứa ${JSON.stringify(needle)}`)};

must('requestBodyTooLarge(req,32768)','Webhook thanh toán phải giới hạn kích thước payload sau khi xác thực secret');
must('function samePayment(payment:any,bookingId:string,amount:number)','Webhook phải có một phép kiểm thống nhất cho booking + amount');
must('if(existing&&!samePayment(existing,bookingId,amount))','Webhook phải từ chối reference đã tồn tại với payload khác ở fast path');
must('payment=rows[0]||(await sql`select * from payments where provider=${provider} and provider_reference=${providerRef} limit 1`)[0]','Webhook phải resolve payment persisted sau insert conflict');
must('if(!samePayment(payment,bookingId,amount))','Webhook phải kiểm tra lại payment sau race/conflict trước khi ghi kế toán');
must('resolvedAmount=Number(payment.amount_vnd||0)','Sổ kế toán phải lấy số tiền từ payment persisted');
must('resolvedPaidAt=new Date(String(payment.paid_at||paidAt.toISOString()))','Sổ kế toán phải lấy ngày thanh toán từ payment persisted');
must("${resolvedPaidAt.toISOString().slice(0,10)}",'Ngày chứng từ phải dùng ngày payment đã resolve');
must('${resolvedAmount},${providerRef}','Số tiền chứng từ phải dùng amount payment đã resolve');
must('amount:resolvedAmount','Audit log phải ghi amount đã resolve từ database');
mustNot("${paidAt.toISOString().slice(0,10)},'Thu tiền khách'",'Kế toán không được tiếp tục tin ngày từ payload sau conflict');
mustNot("${amount},${providerRef},'Tự động từ payment webhook'",'Kế toán không được tiếp tục tin amount từ payload sau conflict');

if(failures.length){console.error('\nPayment webhook race regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Payment webhook race regression checks passed.');
