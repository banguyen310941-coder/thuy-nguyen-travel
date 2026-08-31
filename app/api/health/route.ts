import {NextResponse} from 'next/server';import {databaseHealth} from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){const database=await databaseHealth();return NextResponse.json({service:'HappyGo Travel API',ok:database.ok,runtime:'nextjs-server',environment:process.env.VERCEL_ENV||process.env.NODE_ENV,database,timestamp:new Date().toISOString()},{status:database.ok?200:503})}
