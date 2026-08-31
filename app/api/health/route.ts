import {NextResponse} from 'next/server';import {databaseStatus} from '@/lib/server/database';
export const dynamic='force-dynamic';
export async function GET(){const db=databaseStatus();return NextResponse.json({ok:true,service:'HappyGo Travel',runtime:'nextjs-server',database:db.provider,databaseConfigured:db.configured,productionReady:db.configured,timestamp:new Date().toISOString()},{status:db.configured?200:503})}
