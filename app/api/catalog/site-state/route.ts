import {NextResponse} from 'next/server';
import {getPublicSiteState} from '@/lib/server/public-site-state';

export const dynamic='force-dynamic';
export const runtime='nodejs';

export async function GET(){
 const state=await getPublicSiteState();
 return NextResponse.json({ok:true,state},{headers:{'Cache-Control':'public, max-age=10, s-maxage=30, stale-while-revalidate=60'}});
}
