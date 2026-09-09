import fs from 'node:fs';

const source=fs.readFileSync('lib/server/public-site-state.ts','utf8');
const failures=[];
const expect=(label,ok)=>{if(!ok)failures.push(label)};

expect('Public tour fields must keep structured itinerary days',source.includes("'days'"));
expect('Public tour fields must keep child pricing',source.includes("'childPrice'")&&source.includes("'singleCharge'"));
expect('Relational tour mapping must preserve departures',source.includes('departures:publicText(item.departures)'));
expect('Relational tour mapping must preserve airline and transport',source.includes("airline:item.airline||''")&&source.includes('transport:publicText(item.transport)'));
expect('Relational tour mapping must preserve highlights and itinerary days',source.includes('highlights:publicText(item.highlights)')&&source.includes('days:Array.isArray(item.days)?item.days:[]'));
expect('Relational tour mapping must preserve inclusions and policies',source.includes('included:publicText(item.included)')&&source.includes('excluded:publicText(item.excluded)')&&source.includes('policies:publicText(item.policies)'));
expect('Relational tour mapping must preserve SEO fields',source.includes("seoTitle:item.seoTitle||''")&&source.includes("seoDescription:item.seoDescription||''"));
expect('Private source metadata must remain outside the public whitelist',!source.match(/PUBLIC_PRODUCT_FIELDS=[^;]*(sourceUrl|sourceSite|sourceObservedPriceVnd)/));

if(failures.length){
 console.error('Relational tour publishing regression failed:');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}
console.log('Relational tour publishing regression passed.');
