import {NextResponse} from 'next/server';
import {databaseHealth} from '@/lib/db';

export const dynamic='force-dynamic';

export async function GET(){
 const database=await databaseHealth();
 return NextResponse.json(
  {service:'HappyGo Travel API',ok:database.ok,database:{ok:database.ok},timestamp:new Date().toISOString()},
  {status:database.ok?200:503,headers:{'Cache-Control':'no-store, max-age=0','Pragma':'no-cache'}},
 );
}
