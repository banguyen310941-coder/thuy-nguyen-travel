import type {NextRequest} from 'next/server';
import {db} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

export type AdminActor={id:string;name:string;email:string;role:string;permissions:string[]};
export async function adminActor(req:NextRequest,permission?:string):Promise<AdminActor|null>{
  const session=readSession(req,'happygo_admin_auth','admin');
  if(!session)return null;
  const sql=db();
  const rows=await sql`select id,name,email,role,status,permissions from staff where id=${session.id} and status='active' limit 1`;
  const row=rows[0];if(!row)return null;
  const permissions=Array.isArray(row.permissions)?row.permissions.map(String):[];
  const elevated=row.role==='owner'||row.role==='admin'||permissions.includes('*');
  if(permission&&!elevated&&!permissions.includes(permission))return null;
  return{id:String(row.id),name:String(row.name),email:String(row.email),role:String(row.role),permissions};
}
