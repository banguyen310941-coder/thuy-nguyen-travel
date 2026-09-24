import {timingSafeEqual} from 'crypto';
import {NextRequest,NextResponse} from 'next/server';
import {db,hasDatabase} from '@/lib/db';
import {GUIDE_ARTICLE_STATE_KEY,guidePublishIssues,guideWordCount} from '@/lib/guide-publishing-standard';
import {readBoundedJson,requestBodyTooLarge} from '@/lib/server/public-abuse';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const ENTITY='admin_shared_state';
const MAX_BODY=4_194_304;

function safeEqual(a:string,b:string){
 const aa=Buffer.from(a),bb=Buffer.from(b);
 return aa.length===bb.length&&timingSafeEqual(aa,bb);
}
function array(value:unknown):any[]{return Array.isArray(value)?value:[]}
function unwrap(raw:unknown){let value=raw;if(typeof value==='string'){try{value=JSON.parse(value)}catch{return[]}}if(value&&typeof value==='object'&&'value' in value)return array((value as any).value);return array(value)}
function slugOf(row:any){return String(row?.slug||'').trim()}
function validUrl(value:unknown){const s=String(value||'').trim();return s.startsWith('/')||/^https:\/\//i.test(s)}
function imageCount(html:unknown){return (String(html||'').match(/<img\b/gi)||[]).length}

async function serviceActor(){
 const id=String(process.env.SEO_PUBLISHER_ACTOR_ID||'').trim();
 if(!id)return null;
 const rows=await db()`select id,name,status from staff where id=${id} and status='active' limit 1`;
 const row=rows[0];return row?{id:String(row.id),name:String(row.name)}:null;
}
async function baseline(){
 const rows=await db()`with hist as (
  select id,created_at,case when jsonb_typeof(after_data)='object' and jsonb_typeof(after_data->'value')='array' then after_data->'value' when jsonb_typeof(after_data)='array' then after_data else '[]'::jsonb end items
  from audit_logs where entity_type=${ENTITY} and entity_id=${GUIDE_ARTICLE_STATE_KEY}
 ), expanded as (
  select h.id,h.created_at,x.item from hist h cross join lateral jsonb_array_elements(h.items) x(item)
  where coalesce(x.item->>'slug','')<>''
 ), ranked as (
  select item,row_number() over(partition by item->>'slug' order by created_at desc,id desc) rn from expanded
 ) select item from ranked where rn=1`;
 return rows.map((row:any)=>row.item).filter(Boolean);
}
async function latest(){
 const rows=await db()`select after_data from audit_logs where entity_type=${ENTITY} and entity_id=${GUIDE_ARTICLE_STATE_KEY} order by created_at desc,id desc limit 1`;
 return rows[0]?unwrap(rows[0].after_data):[];
}

export async function POST(req:NextRequest){
 if(!hasDatabase())return NextResponse.json({error:'Database unavailable'},{status:503});
 if(requestBodyTooLarge(req,MAX_BODY))return NextResponse.json({error:'Payload too large'},{status:413});
 const configured=String(process.env.SEO_PUBLISHER_TOKEN||'');
 const supplied=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
 if(!configured||!supplied||!safeEqual(configured,supplied))return NextResponse.json({error:'Unauthorized'},{status:401});
 const actor=await serviceActor();if(!actor)return NextResponse.json({error:'Publisher actor unavailable'},{status:503});
 const parsed=await readBoundedJson(req,MAX_BODY);if(parsed.tooLarge)return NextResponse.json({error:'Payload too large'},{status:413});
 const item=(parsed.body as any)?.item;
 if(!item||typeof item!=='object')return NextResponse.json({error:'Invalid article'},{status:400});
 const slug=slugOf(item),id=String(item.id||'').trim().slice(0,180);
 if(!slug||!id||String(item.status||'')!=='published')return NextResponse.json({error:'Published article id/slug required'},{status:400});
 const issues=guidePublishIssues(item);
 const words=guideWordCount(item.content);
 const images=imageCount(item.content);
 if(words<2000||words>3000)issues.push('Nội dung phải có 2.000–3.000 từ.');
 if(images<5)issues.push('Nội dung phải có ít nhất 5 ảnh.');
 if(!validUrl(item.cover))issues.push('Ảnh cover không hợp lệ.');
 if(issues.length)return NextResponse.json({error:'Article failed publishing checks',issues,words,images},{status:422});

 const before=await baseline();
 const beforeSlugs=before.map(slugOf).filter(Boolean);
 if(new Set(beforeSlugs).size!==beforeSlugs.length)return NextResponse.json({error:'Baseline contains duplicate slugs'},{status:409});
 if(before.some((row:any)=>!String(row?.content||'').trim()||!validUrl(row?.cover)))return NextResponse.json({error:'Baseline contains incomplete article data'},{status:409});
 if(beforeSlugs.includes(slug))return NextResponse.json({error:'Slug already exists'},{status:409});

 const next=[item,...before];
 const nextSlugs=next.map(slugOf);
 if(new Set(nextSlugs).size!==nextSlugs.length||nextSlugs.length!==beforeSlugs.length+1)return NextResponse.json({error:'Unsafe slug count'},{status:409});
 const updatedAt=new Date().toISOString(),envelope={value:next,updatedAt,updatedBy:actor.name};
 await db()`insert into audit_logs(actor_staff_id,action,entity_type,entity_id,before_data,after_data) values(${actor.id},${'cms.articles.save'},${ENTITY},${GUIDE_ARTICLE_STATE_KEY},${JSON.stringify(before)}::jsonb,${JSON.stringify(envelope)}::jsonb)`;

 const after=await latest(),afterSlugs=after.map(slugOf).filter(Boolean),afterSet=new Set(afterSlugs);
 const missing=beforeSlugs.filter(s=>!afterSet.has(s));
 const saved=after.find((row:any)=>slugOf(row)===slug);
 const postIssues=saved?guidePublishIssues(saved):['Bài mới không tồn tại sau khi ghi.'];
 if(afterSet.size!==beforeSlugs.length+1||afterSet.size!==afterSlugs.length||missing.length||!saved||postIssues.length||guideWordCount(saved?.content)<2000||guideWordCount(saved?.content)>3000||imageCount(saved?.content)<5){
  console.error('seo_publisher_postwrite_verification_failed',{slug,missing,afterCount:afterSet.size,expected:beforeSlugs.length+1,postIssues});
  return NextResponse.json({error:'Post-write verification failed',slug,missing,postIssues},{status:500});
 }
 return NextResponse.json({ok:true,slug,url:`/cam-nang/${encodeURIComponent(slug)}`,baselineCount:beforeSlugs.length,totalCount:afterSet.size,words:guideWordCount(saved.content),images:imageCount(saved.content),updatedAt});
}
