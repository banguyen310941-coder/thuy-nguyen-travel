import type {AdminStaff} from '@/components/AdminSalesAccess';
import {readStaff,STAFF_KEY} from '@/components/AdminSalesAccess';

export const ADMIN_SESSION_KEY='happygo_admin_session_v1';
export type AdminSession={staffId:string;loginAt:string};
export type AdminAuthResult={ok:boolean;staff?:AdminStaff;message:string;needsBootstrap?:boolean};

export function readAdminSession():AdminSession|null{try{const x=JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)||'null');return x&&x.staffId?x:null}catch{return null}}
export function writeAdminSession(staff:AdminStaff){
  const current=readStaff().filter(x=>x.id!==staff.id);
  localStorage.setItem(STAFF_KEY,JSON.stringify([{...staff,password:undefined},...current].map(({password:_password,...item})=>item)));
  sessionStorage.setItem(ADMIN_SESSION_KEY,JSON.stringify({staffId:staff.id,loginAt:new Date().toISOString()}));
  window.dispatchEvent(new Event('tn-staff-updated'));
  window.dispatchEvent(new Event('happygo-admin-auth'));
}
export function clearAdminSession(){sessionStorage.removeItem(ADMIN_SESSION_KEY);void fetch('/api/admin/auth/logout',{method:'POST'}).catch(()=>{});window.dispatchEvent(new Event('happygo-admin-auth'))}
export function currentAuthenticatedStaff():AdminStaff|null{const s=readAdminSession();if(!s)return null;return readStaff().find(x=>x.id===s.staffId&&x.status!=='inactive'&&x.status!=='locked')||null}

export async function checkAdminSession():Promise<AdminAuthResult>{
  try{const r=await fetch('/api/admin/auth/me',{cache:'no-store'});if(r.ok){const data=await r.json();if(data.staff){writeAdminSession(data.staff);return{ok:true,staff:data.staff,message:'Phiên đăng nhập hợp lệ.'}}}sessionStorage.removeItem(ADMIN_SESSION_KEY);const status=await fetch('/api/admin/auth/status',{cache:'no-store'}).then(x=>x.json()).catch(()=>({}));return{ok:false,message:'Chưa đăng nhập.',needsBootstrap:Boolean(status?.needsBootstrap)}}catch{return{ok:false,message:'Không kết nối được hệ thống đăng nhập.'}}
}

export async function loginAdmin(email:string,password:string):Promise<AdminAuthResult>{
  try{const r=await fetch('/api/admin/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const data=await r.json().catch(()=>({}));if(!r.ok)return{ok:false,message:data.error||'Email hoặc mật khẩu không đúng.'};writeAdminSession(data.staff);return{ok:true,staff:data.staff,message:'Đăng nhập thành công.'}}catch{return{ok:false,message:'Không kết nối được hệ thống đăng nhập.'}}
}

export async function bootstrapAdmin(input:{adminKey:string;name:string;email:string;password:string}):Promise<AdminAuthResult>{
  try{const r=await fetch('/api/admin/auth/bootstrap',{method:'POST',headers:{'Content-Type':'application/json','x-admin-key':input.adminKey},body:JSON.stringify({name:input.name,email:input.email,password:input.password})});const data=await r.json().catch(()=>({}));if(!r.ok)return{ok:false,message:data.error||'Không thể kích hoạt quản trị production.'};writeAdminSession(data.staff);return{ok:true,staff:data.staff,message:'Đã kích hoạt Chủ tài khoản production.'}}catch{return{ok:false,message:'Không kết nối được hệ thống kích hoạt.'}}
}
