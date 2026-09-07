import {readFileSync} from 'node:fs';

const failures=[];
const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};

must('components/CruiseCatalog.tsx',"const cardHitStyle={position:'absolute' as const,inset:0,zIndex:1}",'Card du thuyền phải có vùng click phủ toàn bộ');
must('components/CruiseCatalog.tsx','aria-label={`Xem chi tiết ${item.name}`}','Card du thuyền CMS/static phải có link phủ card có nhãn');
must('components/CruiseCatalog.tsx','const href=`/san-pham/${encodeURIComponent(item.slug)}`','Du thuyền CMS phải đi tới trang sản phẩm canonical');
must('components/CruiseCatalog.tsx','style={cardActionsStyle}','Các nút hành động phải nổi trên vùng click phủ card');
must('components/PartnerCategoryCards.tsx',"const cardHitStyle={position:'absolute' as const,inset:0,zIndex:1}",'Card du thuyền đối tác phải có vùng click phủ toàn bộ');
must('components/PartnerCategoryCards.tsx','aria-label={`Xem chi tiết ${p.name}`}','Card đối tác phải có link phủ card có nhãn');
must('components/PartnerCategoryCards.tsx','const detailHref=(p:PartnerPublicProduct)=>`/san-pham/${encodeURIComponent(p.slug)}`','Card đối tác phải mở trang chi tiết theo slug');

if(failures.length){console.error('\nCruise navigation regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Cruise navigation regression checks passed.');
