import {NextRequest,NextResponse} from 'next/server';
import {hasDatabase} from '@/lib/db';
import {affiliateActor} from '@/lib/server/affiliate';

export async function GET(req:NextRequest){if(!hasDatabase())return NextResponse.json({error:'Database chưa sẵn sàng.'},{status:503});try{const actor=await affiliateActor(req);if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({ok:true,affiliate:actor},{headers:{'Cache-Control':'no-store'}})}catch(error){console.error('affiliate_me_failed',error);return NextResponse.json({error:'Không đọc được phiên CTV.'},{status:500})}}
