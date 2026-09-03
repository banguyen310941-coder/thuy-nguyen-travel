import {NextResponse} from 'next/server';
import {clearSessionCookie} from '@/lib/server/portal-auth';

export async function POST(){
  const response=NextResponse.json({ok:true});
  clearSessionCookie(response,'happygo_partner_auth');
  return response;
}
