import type {NextRequest} from 'next/server';
import {db} from '@/lib/db';
import {readSession} from '@/lib/server/portal-auth';

const COOKIE='happygo_partner_auth';

export type PartnerActor={id:string;status:string};

export async function partnerActor(req:NextRequest):Promise<PartnerActor|null>{
  const session=readSession(req,COOKIE,'partner');
  if(!session)return null;
  const sql=db();
  const rows=await sql`select id,status from partners where id=${session.id} limit 1`;
  const partner=rows[0];
  if(!partner||String(partner.status)==='blocked')return null;
  return{id:String(partner.id),status:String(partner.status)};
}
