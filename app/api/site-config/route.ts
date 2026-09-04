import {NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';

function parseValue(value:unknown){if(!value)return null;if(typeof value==='string'){try{return JSON.parse(value)}catch{return null}}return value}

export async function GET(){
 if(!hasDatabase())return NextResponse.json({ok:true,site:null,seo:null});
 try{const sql=db();const rows=await sql`select distinct on (entity_id) entity_id,after_data,created_at from audit_logs where entity_type='site_config' order by entity_id,created_at desc,id desc`;const result:{site:unknown;seo:unknown}={site:null,seo:null};for(const row of rows){const id=String(row.entity_id);if(id!=='site'&&id!=='seo')continue;const raw=row.after_data as any;result[id]=parseValue(raw?.value??raw)}return NextResponse.json({ok:true,...result},{headers:{'Cache-Control':'public, max-age=30, s-maxage=60, stale-while-revalidate=120'}})}catch(error){console.error('public_site_config_failed',error);return NextResponse.json({ok:true,site:null,seo:null})}
}
