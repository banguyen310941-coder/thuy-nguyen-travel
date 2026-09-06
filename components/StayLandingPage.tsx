import Link from 'next/link';
import {SearchBar} from '@/components/SearchBar';
import {StayCatalog,type CmsProduct,type PublicCatalogQuery} from '@/components/StayCatalog';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';
import {getSiteUrl} from '@/lib/site-url';
import {getPublicSiteState} from '@/lib/server/public-site-state';

type StayKind='all'|'villa'|'hotel';

const configs:Record<StayKind,{kicker:string;title:string;description:string;breadcrumb:string;path:string;schemaName:string;cta:string}>={
 all:{kicker:'LƯU TRÚ TOÀN QUỐC',title:'Villa, Resort & Khách sạn',description:'Tìm nơi lưu trú phù hợp theo điểm đến, sức chứa, tiện ích và ngân sách. Giá và tình trạng phòng/căn được kiểm tra theo ngày ở.',breadcrumb:'Lưu trú',path:'/luu-tru',schemaName:'Villa, Resort & Khách sạn toàn quốc',cta:'Tư vấn lưu trú'},
 villa:{kicker:'VILLA & RESORT TOÀN QUỐC',title:'Villa & Resort',description:'Khám phá villa nguyên căn và resort nghỉ dưỡng theo điểm đến, sức chứa, tiện ích và ngân sách. Xem đúng căn, đúng chính sách và kiểm tra lịch trước khi đặt.',breadcrumb:'Villa & Resort',path:'/villa-resort',schemaName:'Villa & Resort toàn quốc',cta:'Tư vấn Villa & Resort'},
 hotel:{kicker:'KHÁCH SẠN TOÀN QUỐC',title:'Khách sạn',description:'Tìm khách sạn theo điểm đến, hạng phòng, số khách và nhu cầu chuyến đi. Giá phòng và chính sách được hiển thị rõ để bạn dễ so sánh.',breadcrumb:'Khách sạn',path:'/khach-san',schemaName:'Khách sạn toàn quốc',cta:'Tư vấn khách sạn'},
};

export async function StayLandingPage({kind='all',query={}}:{kind?:StayKind;query?:PublicCatalogQuery}){
 const cfg=configs[kind],base=getSiteUrl(),canonical=`${base}${cfg.path}`;
 const state=await getPublicSiteState();
 const initialCms=Array.isArray(state.tn_cms_products_v3_units)?state.tn_cms_products_v3_units as CmsProduct[]:[];
 const schema=[
  {'@context':'https://schema.org','@type':'CollectionPage',name:cfg.schemaName,url:canonical,description:cfg.description},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:cfg.breadcrumb,item:canonical}]},
 ];
 const initialType=kind==='all'?'all':kind;
 return <div className="subpage"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / {cfg.breadcrumb}</div><div className="sub-hero-grid"><div><span className="sub-kicker">{cfg.kicker}</span><h1>{cfg.title}</h1><p>{cfg.description}</p></div><ContactCtaGroup callLabel={cfg.cta}/></div></div></section><nav className="sub-nav" aria-label="Danh mục lưu trú"><div className="container sub-nav-inner"><Link className={kind==='all'?'active':undefined} href="/luu-tru">Tất cả lưu trú</Link><Link className={kind==='villa'?'active':undefined} href="/villa-resort">Villa & Resort</Link><Link className={kind==='hotel'?'active':undefined} href="/khach-san">Khách sạn</Link><Link href="/diem-den">Điểm đến</Link><Link href="/cam-nang">Cẩm nang</Link></div></nav><section className="sub-section white"><div className="container"><SearchBar/></div></section><section className="sub-section"><div className="container"><StayCatalog initialType={initialType} initialCms={initialCms} query={query}/><div className="sub-cta"><div><h2>Cần kiểm tra phòng nhanh?</h2><p>Gửi ngày ở, số khách và điểm đến để HappyGo Travel kiểm tra phương án phù hợp.</p></div><ContactCtaGroup mode="footer" zaloLabel="Chat Zalo"/></div></div></section></div>
}
