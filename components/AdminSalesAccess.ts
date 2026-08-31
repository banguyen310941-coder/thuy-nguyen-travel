export type AdminStaffRole='owner'|'admin'|'sales'|'content'|'operations'|'accounting';
export type AdminStaff={id:string;name:string;email?:string;phone?:string;password?:string;role:string;department?:string;status?:string;permissions?:string[]};
export type SalesAssignment={customerKey:string;staffId:string;staffName:string;assignedAt:string};
export const STAFF_KEY='tn_admin_staff_v1';
export const CURRENT_STAFF_KEY='happygo_admin_current_staff_v3';
export const ADMIN_SESSION_KEY='happygo_admin_session_v1';
export const SALES_ASSIGNMENTS_KEY='happygo_crm_sales_assignments_v1';
export const OWNER_ID='happygo_owner';

export function customerKey(phone?:string|null,email?:string|null){const p=String(phone||'').replace(/\D/g,'');if(p)return`phone:${p}`;return`email:${String(email||'').trim().toLowerCase()}`}
export function readStaff():AdminStaff[]{try{const raw=JSON.parse(localStorage.getItem(STAFF_KEY)||'[]');return Array.isArray(raw)?raw.filter((x:any)=>x&&x.id&&x.status!=='inactive'):[]}catch{return[]}}
export function ownerStaff():AdminStaff{return{id:OWNER_ID,name:'Chủ tài khoản HappyGo',role:'owner',department:'sales',status:'active',permissions:['*']}}
export function readCurrentStaff():AdminStaff{try{const session=JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY)||'null');const id=String(session?.staffId||'');if(!id)return{id:'',name:'Chưa đăng nhập',role:'guest',status:'inactive',permissions:[]};if(id===OWNER_ID)return ownerStaff();return readStaff().find(x=>x.id===id)||{id:'',name:'Phiên đăng nhập không hợp lệ',role:'guest',status:'inactive',permissions:[]}}catch{return{id:'',name:'Chưa đăng nhập',role:'guest',status:'inactive',permissions:[]}}}
export function isOwner(staff?:AdminStaff|null){return Boolean(staff&&(staff.id===OWNER_ID||staff.role==='owner'))}
export function readAssignments():Record<string,SalesAssignment>{try{const raw=JSON.parse(localStorage.getItem(SALES_ASSIGNMENTS_KEY)||'{}');return raw&&typeof raw==='object'?raw:{}}catch{return{}}}
export function writeAssignments(next:Record<string,SalesAssignment>){localStorage.setItem(SALES_ASSIGNMENTS_KEY,JSON.stringify(next));window.dispatchEvent(new Event('happygo-crm-assignment'))}
export function canViewCustomer(staff:AdminStaff,key:string,assignments=readAssignments()){return isOwner(staff)||Boolean(staff?.id&&assignments[key]?.staffId===staff.id)}
export function salesStaff(){return readStaff().filter(x=>x.role==='sales'||x.department==='sales')}
export function parseMoney(value:unknown){const s=String(value||'').trim().toLowerCase();if(!s)return 0;let n=Number(s.replace(/[^\d]/g,''))||0;if(/triệu|tr\b/.test(s)&&n<1000000)n*=1000000;return n}
export function bookingRevenue(b:any){if(Number.isFinite(Number(b?.revenue)))return Number(b.revenue);const note=String(b?.note||'');const match=note.match(/TỔNG (?:GIÁ TRỊ \/ )?TẠM TÍNH:\s*([^\n]+)/i)||note.match(/TỔNG[^:\n]*:\s*([^\n]+)/i);return parseMoney(match?.[1]||b?.total||b?.amount||b?.price)}
export function money(v:number){return new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ'}
