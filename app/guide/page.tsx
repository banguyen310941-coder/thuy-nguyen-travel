import type {Metadata} from 'next';
import Link from 'next/link';
import {GuideCmsList} from '@/components/GuideCmsList';
import {ContactQuickLink} from '@/components/ContactQuickLink';
import {guidePosts} from '@/data/guides';
import {guideCategories} from '@/data/guideCategories';
import {guideImage} from '@/lib/guideCloudinary';

const canonical='https://happygo.vn/cam-nang';
export const metadata:Metadata={title:'Cẩm nang du lịch | Kinh nghiệm & hướng dẫn',description:'Cẩm nang du lịch HappyGo Travel với kinh nghiệm thực tế về điểm đến, tour, villa & resort, khách sạn, du thuyền và cách chuẩn bị chuyến đi.',alternates:{canonical},openGraph:{title:'Cẩm nang du lịch | HappyGo Travel',description:'Kinh nghiệm thực tế, hướng dẫn chọn dịch vụ và gợi ý hành trình cho chuyến đi thuận tiện hơn.',url:canonical,type:'website'},twitter:{card:'summary_large_image',title:'Cẩm nang du lịch | HappyGo Travel',description:'Kinh nghiệm điểm đến, lưu trú, tour và du thuyền từ HappyGo Travel.'}};

function count(terms:string[]){return guidePosts.filter(p=>{const hay=`${p.category} ${p.title} ${p.excerpt} ${p.keywords.join(' ')}`.toLowerCase();return terms.some(t=>hay.includes(t.toLowerCase()))}).length}
const topCategories=guideCategories.filter(category=>['villa-resort','du-thuyen','nha-trang','phan-thiet','tour-trung-quoc'].includes(category.slug));

export default function GuidePage(){
 const schema=[
  {'@context':'https://schema.org','@type':'Blog',name:'Cẩm nang du lịch HappyGo Travel',url:canonical,description:'Kinh nghiệm du lịch, điểm đến, tour, lưu trú và du thuyền',publisher:{'@type':'TravelAgency',name:'HappyGo Travel',url:'https://happygo.vn'}},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:'https://happygo.vn'},{'@type':'ListItem',position:2,name:'Cẩm nang du lịch',item:canonical}]},
 ];
 return <div className="subpage guide-portal"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  <section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Cẩm nang</div><div className="sub-hero-grid"><div><span className="sub-kicker">CẨM NANG DU LỊCH</span><h1>Cẩm nang du lịch</h1><p>Kinh nghiệm thực tế về điểm đến, lưu trú, tour và du thuyền; giúp bạn chọn dịch vụ phù hợp, chuẩn bị chuyến đi rõ ràng và tránh những chi phí không cần thiết.</p></div><ContactQuickLink className="solid" label="Nhận tư vấn chuyến đi"/></div></div></section>
  <nav className="sub-nav" aria-label="Chủ đề cẩm nang"><div className="container sub-nav-inner"><Link className="active" href="/cam-nang">Tất cả bài viết</Link>{topCategories.map(category=><Link key={category.slug} href={`/cam-nang/danh-muc/${category.slug}`}>{category.name}</Link>)}</div></nav>
  <section className="guide-portal-main"><div className="container guide-layout"><aside className="guide-sidebar"><div className="guide-side-card"><h3>Chủ đề cẩm nang</h3><Link className="active" href="/cam-nang"><span>Tất cả bài viết</span><b>{guidePosts.length}</b></Link>{guideCategories.map(category=><Link href={`/cam-nang/danh-muc/${category.slug}`} key={category.slug}><span>{category.name}</span><b>{count(category.terms)}</b></Link>)}</div><div className="guide-side-card featured"><h3>Bài viết nổi bật</h3>{guidePosts.slice(0,4).map(p=><Link href={`/cam-nang/${p.slug}`} key={p.slug}><img src={guideImage(p.image)} alt={p.title}/><div><b>{p.title}</b><small>{p.date}</small></div></Link>)}</div><ContactQuickLink className="guide-side-cta" label="Tư vấn chuyến đi"/></aside><main className="guide-content"><div className="guide-section-head"><div><small>KINH NGHIỆM & GỢI Ý</small><h2>Bài viết cẩm nang mới</h2><p>Nội dung tập trung vào thông tin thực tế người đi du lịch cần trước khi đặt dịch vụ và khởi hành.</p></div><span>{guidePosts.length} bài viết</span></div><div className="guide-card-grid">{guidePosts.map(p=><article className="guide-pro-card" key={p.slug}><Link href={`/cam-nang/${p.slug}`} className="guide-pro-image" style={{backgroundImage:`url(${guideImage(p.image)})`}} aria-label={p.title}><span>{p.category}</span></Link><div className="guide-pro-meta"><small>HappyGo Travel</small><small>{p.date}</small><small>{p.readTime}</small></div><div className="guide-pro-body"><h3><Link href={`/cam-nang/${p.slug}`}>{p.title}</Link></h3><p>{p.excerpt}</p><Link className="guide-read" href={`/cam-nang/${p.slug}`}>Đọc bài viết →</Link></div></article>)}</div><GuideCmsList/></main></div></section>
 </div>
}
