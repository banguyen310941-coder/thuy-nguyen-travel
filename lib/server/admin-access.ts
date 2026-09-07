import type {NextRequest} from 'next/server';
import {db} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

export type AdminActor={id:string;name:string;email:string;phone:string;role:string;department:string;status:string;permissions:string[];createdAt:string};
export async function adminActor(req:NextRequest,permission?:string):Promise<AdminActor|null>{
 const session=readSession(req,'happygo_admin_auth','admin');
 if(!session)return null;
 const sql=db();
 const rows=await sql`select id,name,email,phone,role,department,status,permissions,created_at,floor(extract(epoch from updated_at)*1000)::bigint as session_version from staff where id=${session.id} and status='active' limit 1`;
 const row=rows[0];if(!row)return null;
 const currentVersion=String(row.session_version||'');
 if(session.ver){
  if(session.ver!==currentVersion)return null;
 }else if(session.iat!==undefined){
  const updatedAtSeconds=Math.floor(Number(currentVersion)/1000);
  if(Number.isFinite(updatedAtSeconds)&&updatedAtSeconds>session.iat)return null;
 }
 const permissions=Array.isArray(row.permissions)?row.permissions.map(String):[];
 const elevated=row.role==='owner'||row.role==='admin'||permissions.includes('*');
 if(permission&&!elevated&&!permissions.includes(permission))return null;
 return{id:String(row.id),name:String(row.name),email:String(row.email),phone:String(row.phone||''),role:String(row.role),department:String(row.department||''),status:String(row.status),permissions,createdAt:String(row.created_at)};
}
