import fs from 'node:fs';

const engine=fs.readFileSync('lib/server/hotel-recommendations.ts','utf8');
const route=fs.readFileSync('app/api/catalog/recommendations/hotels/route.ts','utf8');

const checks=[
 ['engine keeps recommendation logic server-side',engine.includes("from '@/lib/db'")&&!engine.includes("from '@/components/")],
 ['default recommendation scope is hotels only',engine.includes("scope=input.scope==='stay'?'stay':'hotel'")&&engine.includes("scope==='hotel'&&String(row.type)!=='Khách sạn'")],
 ['nearby ranking uses geographic distance',engine.includes('haversineKm')&&engine.includes('distanceScore(candidate.distanceKm)')],
 ['ranking falls back to place similarity',engine.includes('placeSimilarity')&&engine.includes('normalizedPlace')],
 ['ranking considers comparable price',engine.includes('priceSimilarity(candidate.priceVnd,context.price)')],
 ['ranking considers stars and rating',engine.includes('serviceStars')&&engine.includes('candidate.rating')],
 ['current property is excluded',engine.includes("item.id!==reference.id")],
 ['endpoint accepts slug and location context',route.includes("params.get('slug')")&&route.includes("params.get('lat')")&&route.includes("params.get('lng')")&&route.includes("params.get('place')")],
 ['endpoint never caches customer location context',route.includes("'Cache-Control':'private, no-store, max-age=0'")],
 ['endpoint is API-only with no UI rendering',!route.includes('JSX')&&!route.includes('components/'))
];

const failed=checks.filter(([,ok])=>!ok);
if(failed.length){
 console.error('Hotel recommendation regression failed:');
 for(const[name]of failed)console.error(`- ${name}`);
 process.exit(1);
}
console.log(`Hotel recommendation regression passed (${checks.length} checks).`);
