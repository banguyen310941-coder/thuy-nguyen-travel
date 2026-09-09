import fs from 'node:fs';

const files=[
  'components/UnifiedStayPublicDetail.tsx',
  'components/UnifiedCruisePublicDetail.tsx',
];
const failures=[];

for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  const mapIndex=source.lastIndexOf('<ProductLocationMap');
  const reviewIndex=source.indexOf('<CustomerReviews');
  const policyIndex=source.lastIndexOf('id="policy"');
  if(mapIndex<0)failures.push(`${file}: thiếu ProductLocationMap`);
  if(reviewIndex<0)failures.push(`${file}: thiếu CustomerReviews`);
  if(policyIndex<0)failures.push(`${file}: thiếu khối policy`);
  if(!(policyIndex<mapIndex&&mapIndex<reviewIndex))failures.push(`${file}: bản đồ phải nằm sau chính sách và ngay trước khu đánh giá`);
}

if(failures.length){
  console.error('Product location placement regression failed:');
  for(const failure of failures)console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Product location placement regression passed.');
