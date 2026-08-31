import type {AdminStaff} from '@/components/AdminSalesAccess';
import {OWNER_ID,ownerStaff,readStaff} from '@/components/AdminSalesAccess';

export const ADMIN_SESSION_KEY='happygo_admin_session_v1';
export const OWNER_LOGIN_KEY='happygo_owner_login_v1';
export const DEFAULT_OWNER_EMAIL='admin@happygo.vn';
export const DEFAULT_OWNER_PASSWORD='HappyGo@2026';
export type AdminSession={staffId:string;loginAt:string};

const norm=(v:string)=>String(v||'').trim().toLowerCase();
export function readAdminSession():AdminSession|null{try{const x=JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)||'null');return x&&x.staffId?x:null}catch{return null}}
export function writeAdminSession(staffId:string){sessionStorage.setItem(ADMIN_SESSION_KEY,JSON.stringify({staffId,loginAt:new Date().toISOString()}));window.dispatchEvent(new Event('happygo-admin-auth'))}
export function clearAdminSession(){sessionStorage.removeItem(ADMIN_SESSION_KEY);window.dispatchEvent(new Event('happygo-admin-auth'))}
export function ownerCredentials(){try{const x=JSON.parse(localStorage.getItem(OWNER_LOGIN_KEY)||'null');return {email:String(x?.email||DEFAULT_OWNER_EMAIL),password:String(x?.password||DEFAULT_OWNER_PASSWORD)}}catch{return{email:DEFAULT_OWNER_EMAIL,password:DEFAULT_OWNER_PASSWORD}}}
export function currentAuthenticatedStaff():AdminStaff|null{const s=readAdminSession();if(!s)return null;if(s.staffId===OWNER_ID)return ownerStaff();return readStaff().find(x=>x.id===s.staffId&&x.status!=='inactive')||null}
export function loginAdmin(email:string,password:string):{ok:boolean;staff?:AdminStaff;message:string}{const e=norm(email);const p=String(password||'');const owner=ownerCredentials();if(e===norm(owner.email)&&p===owner.password){writeAdminSession(OWNER_ID);return{ok:true,staff:ownerStaff(),message:'Đăng nhập thành công.'}}const staff=readStaff().find(x=>norm(String(x.email||''))===e&&x.status!=='inactive') as (AdminStaff&{password?:string})|undefined;if(!staff)return{ok:false,message:'Email hoặc mật khẩu không đúng.'};if(!staff.password)return{ok:false,message:'Tài khoản chưa được chủ tài khoản thiết lập mật khẩu.'};if(staff.password!==p)return{ok:false,message:'Email hoặc mật khẩu không đúng.'};writeAdminSession(staff.id);return{ok:true,staff,message:'Đăng nhập thành công.'}}
