import {mkdir,writeFile} from 'node:fs/promises';

const BASE='https://joytripvn.com';
const OUT='data/imports/joytrip-products.json';
const REPORT='data/imports/joytrip-discovery-report.json';
const USER_AGENT='HappyGoTravel-CatalogImporter/1.0 (+https://happygo-travel.vercel.app)';
const PRODUCT_PATH=/(?:^|\/)(tour|du-thuyen|du-thuyen-ha-long|cruise|khach-san|hotel|resort|villa)(?:\/|$)/i;
const CATEGORY_PATH=/(?:^|\/)(diem-den-tour|cang-khoi-hanh|diem-den)(?:\/|$)|\/khach-san-2\/?$/i;
const PRODUCT_WORD=/(tour|du\s*thuyền|du-thuyen|cruise|khách\s*sạn|khach-san|hotel|villa|resort)/i;
const seenFetch=new Map();
const errors=[];
const discovered=new Map();
const customTypes=[];

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const decode=s=>String(s||'')
 .replace(/<[^>]*>/g,' ')
 .replace(/&nbsp;|&#160;/gi,' ')
 .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
 .replace(/&ndash;/gi,'–').replace(/&mdash;/gi,'—')
 .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
 .replace(/\s+/g,' ').trim();
const slugFromUrl=url=>new URL(url).pathname.split('/').filter(Boolean).at(-1)||'';
const numberFromMoney=s=>Number(String(s||'').replace(/\D/g,''))||0;
const isSameHost=url=>{try{return new URL(url).hostname==='joytripvn.com'}catch{return false}};
const absolute=(href,base=BASE)=>{try{return new URL(href,base).toString().split('#')[0]}catch{return''}};

async function get(url,{accept='text/html,application/xhtml+xml'}={}){
 if(seenFetch.has(url))return seenFetch.get(url);
 const promise=(async()=>{
  for(let attempt=1;attempt<=3;attempt++){
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),20000);
   try{
    const response=await fetch(url,{headers:{'user-agent':USER_AGENT,accept},redirect:'follow',signal:controller.signal});
    clearTimeout(timer);
    if(response.ok)return response;
    if(attempt===3)throw new Error(`HTTP ${response.status}`);
   }catch(error){
    clearTimeout(timer);
    if(attempt===3)throw error;
   }
   await sleep(700*attempt);
  }
 })();
 seenFetch.set(url,promise);
 try{return await promise}catch(error){seenFetch.delete(url);throw error}
}
async function text(url){const response=await get(url);return await response.text()}
async function json(url){const response=await get(url,{accept:'application/json,text/plain,*/*'});return {response,data:await response.json()}}

function addUrl(url,meta={}){
 if(!url||!isSameHost(url))return;
 const parsed=new URL(url);parsed.search='';parsed.hash='';
 const clean=parsed.toString();
 if(!PRODUCT_PATH.test(parsed.pathname))return;
 if(/\/(?:category|tag|author|page)\//i.test(parsed.pathname))return;
 const current=discovered.get(clean)||{};
 discovered.set(clean,{...current,...meta,url:clean});
}

async function discoverRest(){
 try{
  const {data:types}=await json(`${BASE}/wp-json/wp/v2/types`);
  for(const [slug,info] of Object.entries(types||{})){
   const restBase=info?.rest_base||slug;
   const label=[slug,restBase,info?.name,info?.description].filter(Boolean).join(' ');
   if(!PRODUCT_WORD.test(label))continue;
   customTypes.push({slug,restBase,name:info?.name||slug});
   let page=1,totalPages=1;
   do{
    const url=`${BASE}/wp-json/wp/v2/${encodeURIComponent(restBase)}?per_page=100&page=${page}&_fields=link,slug,title,modified,status`;
    try{
     const {response,data}=await json(url);
     totalPages=Math.max(1,Number(response.headers.get('x-wp-totalpages')||1));
     if(Array.isArray(data))for(const item of data){if(item?.link)addUrl(item.link,{sourceType:slug,sourceModified:item.modified||'',restSlug:item.slug||''})}
    }catch(error){errors.push({stage:'rest-items',url,message:String(error)});break}
    page++;
    await sleep(250);
   }while(page<=totalPages&&page<=50);
  }
 }catch(error){errors.push({stage:'rest-types',url:`${BASE}/wp-json/wp/v2/types`,message:String(error)})}
}

function xmlLocs(xml){return [...String(xml||'').matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(m=>decode(m[1])).filter(Boolean)}
async function discoverSitemaps(){
 const queue=[`${BASE}/wp-sitemap.xml`,`${BASE}/sitemap_index.xml`,`${BASE}/sitemap.xml`];
 const visited=new Set();
 while(queue.length&&visited.size<120){
  const url=queue.shift();if(visited.has(url))continue;visited.add(url);
  try{
   const body=await text(url);
   for(const loc of xmlLocs(body)){
    const next=absolute(loc,url);if(!next||!isSameHost(next))continue;
    if(/\.xml(?:\?|$)/i.test(next)){if(!visited.has(next))queue.push(next);continue}
    addUrl(next,{sourceType:'sitemap'});
   }
  }catch(error){errors.push({stage:'sitemap',url,message:String(error)})}
  await sleep(200);
 }
 return visited.size;
}

function hrefs(html,base){return [...String(html||'').matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map(m=>absolute(m[1],base)).filter(Boolean)}
async function discoverCategoryPages(){
 const queue=[
  `${BASE}/diem-den-tour/trung-quoc/`,`${BASE}/diem-den-tour/tour-nuoc-ngoai/`,`${BASE}/diem-den-tour/tour-trong-nuoc/`,
  `${BASE}/cang-khoi-hanh/du-thuyen-ha-long/`,`${BASE}/khach-san-2/`
 ];
 const visited=new Set();
 while(queue.length&&visited.size<350){
  const url=queue.shift();if(!url||visited.has(url)||!isSameHost(url))continue;visited.add(url);
  try{
   const body=await text(url);
   for(const link of hrefs(body,url)){
    const path=new URL(link).pathname;
    if(PRODUCT_PATH.test(path))addUrl(link,{sourceType:'category'});
    else if(CATEGORY_PATH.test(path)&&!visited.has(link)&&!/[?&](?:s|search)=/i.test(link))queue.push(link);
    else if(/\/page\/\d+\/?$/i.test(path)&&CATEGORY_PATH.test(url))queue.push(link);
   }
  }catch(error){errors.push({stage:'category',url,message:String(error)})}
  await sleep(250);
 }
 return visited.size;
}

function textContent(html){return decode(String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/p>|<\/li>|<\/div>|<\/h\d>/gi,'\n'))}
function titleFromHtml(html,url){
 const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
 const og=html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]||html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];
 const title=decode(h1||og||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||slugFromUrl(url));
 return title.replace(/\s*[-–—]\s*Joytrip.*$/i,'').trim();
}
function pricesNearLabel(textValue){
 const text=String(textValue||'');
 const idx=text.toLowerCase().indexOf('giá từ');
 const chunk=idx>=0?text.slice(idx,idx+180):text.slice(0,4000);
 let values=[...chunk.matchAll(/([0-9]{1,3}(?:[.,][0-9]{3}){1,3})\s*(?:đ|vnđ|vnd)/gi)].map(m=>numberFromMoney(m[1])).filter(v=>v>=300000&&v<=300000000);
 if(!values.length)values=[...text.slice(0,12000).matchAll(/([0-9]{1,3}(?:[.,][0-9]{3}){1,3})\s*(?:đ|vnđ|vnd)/gi)].map(m=>numberFromMoney(m[1])).filter(v=>v>=300000&&v<=300000000);
 return [...new Set(values)].slice(0,6);
}
function durationFromText(text){return (text.match(/\b\d{1,2}\s*ngày\s*\d{1,2}\s*đêm\b/i)?.[0]||text.match(/\b\d{1,2}N\d{1,2}[ĐD]\b/i)?.[0]||'').replace(/N/i,' ngày ').replace(/[ĐD]\b/i,' đêm').replace(/\s+/g,' ').trim()}
function departureFromText(text){return decode(text.match(/Khởi\s*hành(?:\s*từ)?\s*[:：]?\s*([^\n|]{2,80})/i)?.[1]||'').replace(/(?:Tháng|Thứ|Giá từ).*$/i,'').trim().slice(0,80)}
function classify(url,sourceType=''){
 const path=new URL(url).pathname.toLowerCase();
 if(path.includes('/du-thuyen/')||/cruise|du.?thuyen/i.test(sourceType))return'Du thuyền';
 if(path.includes('/khach-san/')||path.includes('/hotel/')||/khach.?san|hotel/i.test(sourceType))return'Khách sạn';
 if(path.includes('/villa/')||path.includes('/resort/')||/villa|resort/i.test(sourceType))return'Villa & Resort';
 return'Tour';
}
function originalSummary({name,type,duration,departure}){
 const parts=[`${type} ${name}`];
 if(duration)parts.push(`thời lượng ${duration}`);
 if(departure)parts.push(`khởi hành từ ${departure}`);
 return `${parts.join(', ')}. Dữ liệu hành trình và mức giá tham khảo được đối chiếu từ nguồn công khai JoyTrip; HappyGo sẽ xác nhận lại lịch khởi hành, tình trạng dịch vụ và giá bán trước khi mở bán.`;
}

async function scrapeProduct(meta){
 const {url}=meta;
 try{
  const html=await text(url);const plain=textContent(html);const name=titleFromHtml(html,url);
  if(!name||name.length<4)return null;
  const priceValues=pricesNearLabel(plain);const salePriceVnd=priceValues.length?Math.min(...priceValues):0;const listPriceVnd=priceValues.length?Math.max(...priceValues):salePriceVnd;
  const duration=durationFromText(plain);const departure=departureFromText(plain);const type=classify(url,meta.sourceType||'');
  return {
   source:'JoyTrip',sourceUrl:url,sourceType:meta.sourceType||'',sourceModified:meta.sourceModified||'',fetchedAt:new Date().toISOString(),
   name,sourceSlug:meta.restSlug||slugFromUrl(url),type,duration,departure,listPriceVnd,salePriceVnd,
   summary:originalSummary({name,type,duration,departure}),
   importStatus:'needs-review',copyrightNote:'Chỉ nhập dữ liệu thực tế/ngắn; không sao chép bài mô tả dài hoặc hình ảnh từ nguồn.'
  };
 }catch(error){errors.push({stage:'product',url,message:String(error)});return null}
}

async function main(){
 await mkdir('data/imports',{recursive:true});
 const sitemapCount=await discoverSitemaps();
 await discoverRest();
 const categoryCount=await discoverCategoryPages();
 const metas=[...discovered.values()].sort((a,b)=>a.url.localeCompare(b.url));
 console.log(`Discovered ${metas.length} candidate product URLs from JoyTrip.`);
 const products=[];
 for(let i=0;i<metas.length;i+=4){
  const batch=metas.slice(i,i+4);const rows=await Promise.all(batch.map(scrapeProduct));products.push(...rows.filter(Boolean));
  console.log(`Fetched ${Math.min(i+batch.length,metas.length)}/${metas.length}`);await sleep(250);
 }
 const unique=[...new Map(products.map(item=>[item.sourceUrl,item])).values()].sort((a,b)=>a.type.localeCompare(b.type,'vi')||a.name.localeCompare(b.name,'vi'));
 const byType=unique.reduce((acc,item)=>{acc[item.type]=(acc[item.type]||0)+1;return acc},{});
 await writeFile(OUT,JSON.stringify({source:BASE,generatedAt:new Date().toISOString(),count:unique.length,byType,products:unique},null,2)+'\n','utf8');
 await writeFile(REPORT,JSON.stringify({source:BASE,generatedAt:new Date().toISOString(),sitemapDocuments:sitemapCount,categoryPages:categoryCount,customTypes,candidates:metas.length,products:unique.length,byType,errors},null,2)+'\n','utf8');
 console.log(JSON.stringify({products:unique.length,byType,errors:errors.length},null,2));
}

await main();
