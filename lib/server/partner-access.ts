import type {NextRequest} from 'next/server';
import {db} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

const COOKIE='happygo_partner_auth';

export type PartnerActor={id:string;status:string};

export async function partnerActor(req:NextRequest):Promise<PartnerActor|null>{
  const session=readSession(req,COOKIE,'partner');
  if(!session)return null;
  const sql=db();
  const rows=await sql`select id,status,floor(extract(epoch from updated_at)*1000)::bigint as session_version from partners where id=${session.id} limit 1`;
  const partner=rows[0];
  if(!partner||!['pending','active'].includes(String(partner.status)))return null;
  const currentVersion=String(partner.session_version||'');
  if(session.ver){
    if(session.ver!==currentVersion)return null;
  }else if(session.iat!==undefined){
    const updatedAtSeconds=Math.floor(Number(currentVersion)/1000);
    if(Number.isFinite(updatedAtSeconds)&&updatedAtSeconds>session.iat)return null;
  }
  return{id:String(partner.id),status:String(partner.status)};
}
