import {randomBytes} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {hashPassword} from '@/lib/server/portal-auth';

const emailOk=(value:string)=>/^\S+@\S+\.\S+$/.test(value);
const phoneOk=(value:string)=>/^[0-9+().\s-]{8,20}$/.test(value);
const codeOf=()=>`CTV${randomBytes(4).toString('hex').toUpperCase()}`;

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});
 const body=await req.json().catch(()=>({}));
 const name=String(body.name||'').trim().slice(0,120);
 const email=String(body.email||'').trim().toLowerCase().slice(0,180);
 const phone=String(body.phone||'').trim().slice(0,30);
 const zalo=String(body.zalo||'').trim().slice(0,80);
 const password=String(body.password||'');
 const accepted=body.acceptedPolicy===true;
 if(name.length<2||!emailOk(email)||!phoneOk(phone))return NextResponse.json({error:'Vui lòng nhập đầy đủ họ tên, email và số điện thoại hợp lệ.'},{status:400});
 if(password.length<8)return NextResponse.json({error:'Mật khẩu cần tối thiểu 8 ký tự.'},{status:400});
 if(!accepted)return NextResponse.json({error:'Bạn cần đồng ý chính sách CTV trước khi đăng ký.'},{status:400});
 const sql=db();
 try{
  const exists=await sql`select id from staff where lower(email)=lower(${email}) limit 1`;
  if(exists.length)return NextResponse.json({error:'Email này đã được sử dụng trên hệ thống HappyGo.'},{status:409});
  let saved:any=null;
  for(let attempt=0;attempt<4&&!saved;attempt++){
   const referralCode=codeOf();
   try{
    const rows=await sql`with new_staff as (
      insert into staff(name,email,phone,password_hash,role,department,status,permissions)
      values(${name},${email},${phone},${hashPassword(password)},'affiliate','affiliate','inactive','["affiliate"]'::jsonb)
      returning id
     )
     insert into affiliates(user_id,referral_code,phone,zalo,commission_rate,status)
     select id,${referralCode},${phone},${zalo||null},5,'pending' from new_staff
     returning id,user_id,referral_code,created_at`;
    saved=rows[0]||null;
   }catch(error:any){
    if(!String(error?.message||'').includes('affiliates_referral_code_key'))throw error;
   }
  }
  if(!saved)throw new Error('AFFILIATE_CODE_ALLOCATION_FAILED');
  return NextResponse.json({ok:true,application:{id:String(saved.id),referralCode:String(saved.referral_code),status:'pending',createdAt:String(saved.created_at)},message:'Đăng ký thành công. HappyGo sẽ duyệt tài khoản trước khi bạn có thể đăng nhập.'},{status:201});
 }catch(error:any){
  console.error('affiliate_register_failed',error);
  const text=String(error?.message||'');
  if(text.includes('staff_email_key'))return NextResponse.json({error:'Email này đã được sử dụng trên hệ thống HappyGo.'},{status:409});
  return NextResponse.json({error:'Không thể tạo hồ sơ CTV lúc này.'},{status:500});
 }
}
