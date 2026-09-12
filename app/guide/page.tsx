import type {Metadata} from 'next';
import Link from 'next/link';
import {UnifiedGuideGrid,type GuideFeedItem} from '@/components/UnifiedGuideGrid';
import {GuideLiveResultCount,GuideSidebarCounts,type GuideCountItem} from '@/components/GuideLiveCounts';
import type {PublicGuideArticle} from '@/components/usePublicGuideArticles';
import {ContactQuickLink} from '@/components/ContactQuickLink';
import {SafeImage} from '@/components/SafeImage';
import {guidePosts} from '@/data/guides';
import {guideCategories} from '@/data/guideCategories';
import {guideImage} from '@/lib/guideCloudinary';
import {getSiteUrl} from '@/lib/site-url';
import {getPublicSiteState} from '@/lib/server/public-site-state';

export const revalidate=60;

const path='/cam-nang';
export function generateMetadata():Metadata{const canonical=`${getSiteUrl()}${path}`;return{title:'Cẩm nang du lịch | Kinh nghiệm & hướng dẫn',description:'Cẩm nang du lịch HappyGo Travel với kinh nghiệm thực tế về điểm đến, tour, villa & resort, khách sạn, du thuyền và cách chuẩn bị chuyến đi.',alternates:{canonical},openGraph:{title:'Cẩm nang du lịch | HappyGo Travel',description:'Kinh nghiệm thực tế, hướng dẫn chọn dịch vụ và gợi ý hành trình cho chuyến đi thuận tiện hơn.',url:canonical,type:'website'},twitter:{card:'summary_large_image',title:'Cẩm nang du lịch | HappyGo Travel',description:'Kinh nghiệm điểm đến, lưu trú, tour và du thuyền từ HappyGo Travel.'}}}

const staticItems:GuideFeedItem[]=guidePosts.map(p=>({slug:p.slug,title:p.title,category:p.category,excerpt:p.excerpt,cover:guideImage(p.image),date:p.date,readTime:p.readTime,keywords:p.keywords.join(' ')}));
const staticCountItems:GuideCountItem[]=guidePosts.map(p=>({slug:p.slug,title:p.title,category:p.category,excerpt:p.excerpt,keywords:p.keywords.join(' ')}));
const topCategories=guideCategories.filter(category=>['villa-resort','du-thuyen','nha-trang','phan-thiet','tour-trung-quoc'].includes(category.slug));

export default async function GuidePage(){
 const base=getSiteUrl(),canonical=`${base}${path}`,state=await getPublicSiteState(),initialArticles=Array.isArray(state.tn_cms_articles_v3)?state.tn_cms_articles_v3 as PublicGuideArticle[]:[];
 const schema=[
  {'@context':'https://schema.org','@type':'Blog',name:'Cẩm nang du lịch HappyGo Travel',url:canonical,description:'Kinh nghiệm du lịch, điểm đến, tour, lưu trú và du thuyền',publisher:{'@type':'TravelAgency',name:'HappyGo Travel',url:base}},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:'Cẩm nang du lịch',item:canonical}]},
 ];
 return <div className="subpage guide-portal"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  <section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Cẩm nang</div><div className="sub-hero-grid"><div><span className="sub-kicker">CẨM NANG DU LỊCH</span><h1>Cẩm nang du lịch</h1><p>Kinh nghiệm thực tế về điểm đến, lưu trú, tour và du thuyền; giúp bạn chọn dịch vụ phù hợp, chuẩn bị chuyến đi rõ ràng và tránh những chi phí không cần thiết.</p></div><ContactQuickLink className="solid" label="Nhận tư vấn chuyến đi"/></div></div></section>
  <nav className="sub-nav" aria-label="Chủ đề cẩm nang"><div className="container sub-nav-inner"><Link className="active" href="/cam-nang">Tất cả bài viết</Link>{topCategories.map(category=><Link key={category.slug} href={`/cam-nang/danh-muc/${category.slug}`}>{category.name}</Link>)}</div></nav>
  <section className="guide-portal-main"><div className="container guide-layout"><aside className="guide-sidebar"><div className="guide-side-card"><h3>Chủ đề cẩm nang</h3><GuideSidebarCounts initialArticles={initialArticles} staticItems={staticCountItems} categories={guideCategories}/></div><div className="guide-side-card featured"><h3>Bài viết nổi bật</h3>{guidePosts.slice(0,4).map(p=><Link href={`/cam-nang/${p.slug}`} key={p.slug}><SafeImage src={guideImage(p.image)} alt={p.title}/><div><b>{p.title}</b><small>{p.date}</small></div></Link>)}</div><ContactQuickLink className="guide-side-cta" label="Tư vấn chuyến đi"/></aside><main className="guide-content"><div className="guide-section-head"><div><small>KINH NGHIỆM & GỢI Ý</small><h2>Bài viết cẩm nang mới</h2><p>Kinh nghiệm, lịch trình và hướng dẫn mới nhất từ HappyGo Travel.</p></div><GuideLiveResultCount initialArticles={initialArticles} staticItems={staticCountItems}/></div><UnifiedGuideGrid staticItems={staticItems} initialArticles={initialArticles}/></main></div></section>
 </div>
}
