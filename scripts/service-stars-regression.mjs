import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const contains=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};

contains('app/layout.tsx',"import './service-stars.css';",'Layout phải nạp style hạng sao dịch vụ');
contains('components/ServiceStars.tsx','Hạng ${value} sao','Hạng sao public phải có nhãn accessibility rõ ràng');
contains('components/ServiceStars.tsx',"'★'.repeat(value)",'Hạng sao public phải hiển thị biểu tượng sao');
contains('components/StayCatalog.tsx','serviceStars?:number','Catalog lưu trú phải đọc serviceStars từ CMS');
contains('components/StayCatalog.tsx','<ServiceStars stars={p.serviceStars}/>','Card khách sạn CMS phải hiển thị hạng sao');
contains('components/StayCatalog.tsx','serviceStars:edit.serviceStars','Card lưu trú tĩnh đã được CMS cập nhật phải giữ hạng sao');
contains('components/HomeCmsSections.tsx','<ServiceStars stars={item.serviceStars}/>','Trang chủ phải hiển thị hạng sao cho sản phẩm CMS');
contains('components/CmsProductDetail.tsx','serviceStars:p.serviceStars','Chi tiết sản phẩm đối tác phải giữ hạng sao');
contains('components/UnifiedStayPublicDetail.tsx','<ServiceStars stars={product.serviceStars}/>','Chi tiết khách sạn phải hiển thị hạng sao');

if(failures.length){
 console.error('\nService stars regression FAILED:\n');
 for(const failure of failures)console.error(`- ${failure}`);
 process.exit(1);
}
console.log('Service stars regression passed.');
