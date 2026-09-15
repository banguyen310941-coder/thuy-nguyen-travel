import Link from 'next/link';
import {SearchBar} from '@/components/SearchBar';
import {StayCatalog,type CmsProduct,type PublicCatalogQuery} from '@/components/StayCatalog';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';
import {PublicServiceNav} from '@/components/PublicServiceNav';
import {getSiteUrl} from '@/lib/site-url';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import {destinationSlug,getSeoDestination} from '@/data/seo-destinations';

type StayKind='all'|'villa'|'hotel';

const configs:Record<StayKind,{kicker:string;title:string;description:string;breadcrumb:string;path:string;schemaName:string;cta:string}>={
 all:{kicker:'LƯU TRÚ TOÀN QUỐC',title:'Villa, Resort & Khách sạn',description:'Tìm nơi lưu trú phù hợp theo điểm đến, sức chứa, tiện ích và ngân sách. Giá và tình trạng phòng/căn được kiểm tra theo ngày ở.',breadcrumb:'Lưu trú',path:'/luu-tru',schemaName:'Villa, Resort & Khách sạn toàn quốc',cta:'Tư vấn lưu trú'},
 villa:{kicker:'VILLA & RESORT TOÀN QUỐC',title:'Villa & Resort',description:'Khám phá villa nguyên căn và resort nghỉ dưỡng theo điểm đến, sức chứa, tiện ích và ngân sách. Xem đúng căn, đúng chính sách và kiểm tra lịch trước khi đặt.',breadcrumb:'Villa & Resort',path:'/villa-resort',schemaName:'Villa & Resort toàn quốc',cta:'Tư vấn Villa & Resort'},
 hotel:{kicker:'KHÁCH SẠN TOÀN QUỐC',title:'Khách sạn',description:'Tìm khách sạn theo điểm đến, hạng phòng, số khách và nhu cầu chuyến đi. Giá phòng và chính sách được hiển thị rõ để bạn dễ so sánh.',breadcrumb:'Khách sạn',path:'/khach-san',schemaName:'Khách sạn toàn quốc',cta:'Tư vấn khách sạn'},
};

export async function StayLandingPage({kind='all',query={}}:{kind?:StayKind;query?:PublicCatalogQuery}){
 const cfg=configs[kind],base=getSiteUrl(),rawDestination=Array.isArray(query.q)?String(query.q[0]||''):String(query.q||''),destination=getSeoDestination(rawDestination)?.name||rawDestination,destinationKey=destinationSlug(destination),publicPath=destinationKey&&kind!=='all'?`/diem-den/${destinationKey}/${kind==='villa'?'villa-resort':'khach-san'}`:cfg.path,canonical=`${base}${publicPath}`,effectiveQuery=destination?{...query,q:destination}:query;
 const state=await getPublicSiteState();
 const initialCms=Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units as CmsProduct[]:[];
 const schema=[
  {'@context':'https://schema.org','@type':'CollectionPage',name:cfg.schemaName,url:canonical,description:cfg.description},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:cfg.breadcrumb,item:canonical}]},
 ];
 const initialType=kind==='all'?'all':kind;
 return <div className="subpage"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / {cfg.breadcrumb}</div><div className="sub-hero-grid"><div><span className="sub-kicker">{destination?`LƯU TRÚ ${destination.toUpperCase()}`:cfg.kicker}</span><h1>{destination?`${cfg.title} tại ${destination}`:cfg.title}</h1><p>{destination?`Danh sách ${cfg.breadcrumb.toLowerCase()} phù hợp tại ${destination}. ${cfg.description}`:cfg.description}</p></div><ContactCtaGroup callLabel={cfg.cta}/></div></div></section><PublicServiceNav active={kind==='villa'?'villa':kind==='hotel'?'hotel':'stay'} destination={destination}/><section className="sub-section white"><div className="container"><SearchBar/></div></section><section className="sub-section"><div className="container"><StayCatalog initialType={initialType} initialCms={initialCms} query={effectiveQuery}/><div className="sub-cta"><div><h2>Cần kiểm tra phòng nhanh?</h2><p>Gửi ngày ở, số khách và điểm đến để HappyGo Travel kiểm tra phương án phù hợp.</p></div><ContactCtaGroup mode="footer" zaloLabel="Chat Zalo"/></div></div></section></div>
}
