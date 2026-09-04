import {NextResponse} from 'next/server';
import {clearSessionCookie} from '@/lib/server/portal-auth';
import {AFFILIATE_SESSION_COOKIE} from '@/lib/server/affiliate';

export async function POST(){const response=NextResponse.json({ok:true});clearSessionCookie(response,AFFILIATE_SESSION_COOKIE);return response}
