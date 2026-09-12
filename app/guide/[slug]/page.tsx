import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {guidePosts,getGuide} from '@/data/guides';
import {GuideArticleEditable} from '@/components/GuideArticleEditable';
import {GuideArticleReader} from '@/components/GuideArticleReader';
import type {PublicGuideArticle} from '@/components/usePublicGuideArticles';
import {PublicServiceNav} from '@/components/PublicServiceNav';
import {guideImage,guideMedia} from '@/lib/guideCloudinary';
import {getPublishedGuideSeo} from '@/lib/public-guide-seo';
import {getPublicSiteState} from '@/lib/server/public-site-state';
import {getSiteUrl} from '@/lib/site-url';

export const revalidate=60;

export function generateStaticParams(){return guidePosts.map(post=>({slug:post.slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params,cms=await getPublishedGuideSeo(slug),base=getSiteUrl(),url=`${base}/cam-nang/${encodeURIComponent(slug)}`;
 if(cms){const title=cms.seoTitle||cms.title,description=cms.seoDescription||cms.excerpt;return{title,description,alternates:{canonical:url},robots:{index:true,follow:true},openGraph:{title,description,url,type:'article',images:cms.cover?[{url:cms.cover,alt:cms.title}]:undefined},twitter:{card:'summary_large_image',title,description,images:cms.cover?[cms.cover]:undefined}}}
 const post=getGuide(slug);if(!post)return {};
 const media=[guideMedia(post.image,post.coverAlt),...post.gallery.map(item=>guideMedia(item.src,item.alt,item.credit))];
 return {title:post.title,description:post.excerpt,keywords:post.keywords,alternates:{canonical:url},openGraph:{title:post.title,description:post.excerpt,url,type:'article',images:media.map(item=>({url:item.src,alt:item.alt||post.title})),siteName:'HappyGo Travel'},twitter:{card:'summary_large_image',title:post.title,description:post.excerpt,images:[media[0].src]}};
}

export default async function GuideArticle({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,cms=await getPublishedGuideSeo(slug),base=getSiteUrl(),url=`${base}/cam-nang/${encodeURIComponent(slug)}`;
 if(cms){const state=await getPublicSiteState(),articles=Array.isArray(state.tn_cms_articles_v3)?state.tn_cms_articles_v3 as PublicGuideArticle[]:[],initialArticles=articles.filter(article=>article.slug===slug);const schema=[{'@context':'https://schema.org','@type':'Article',headline:cms.title,description:cms.excerpt,image:cms.cover?[cms.cover]:undefined,datePublished:cms.date||undefined,dateModified:cms.updatedAt||cms.date||undefined,mainEntityOfPage:url,inLanguage:'vi-VN',author:{'@type':'Organization',name:'HappyGo Travel',url:base},publisher:{'@type':'TravelAgency',name:'HappyGo Travel',url:base}},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:'Cẩm nang',item:`${base}/cam-nang`},{'@type':'ListItem',position:3,name:cms.title,item:url}]}];return <div className="subpage"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><section className="sub-hero compact"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / <Link href="/cam-nang">Cẩm nang</Link> / {cms.category}</div><div className="sub-hero-grid"><div><span className="sub-kicker">CẨM NANG HAPPYGO TRAVEL</span><h1>{cms.title}</h1>{cms.excerpt&&<p>{cms.excerpt}</p>}</div></div></div></section><PublicServiceNav active="guide"/><section className="sub-section white"><div className="container article-container"><GuideArticleReader slug={slug} initialArticles={initialArticles}/></div></section></div>}
 const post=getGuide(slug);if(!post)notFound();
 const allImages=[guideImage(post.image),...post.gallery.map(item=>guideImage(item.src))];
 const schema=[
  {'@context':'https://schema.org','@type':'Article',headline:post.title,description:post.excerpt,image:allImages,datePublished:'2026-09-05',dateModified:'2026-09-05',mainEntityOfPage:{'@type':'WebPage','@id':url},inLanguage:'vi-VN',author:{'@type':'Organization',name:'HappyGo Travel',url:base},publisher:{'@type':'TravelAgency',name:'HappyGo Travel',url:base,telephone:'+84969973949'}},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:'Cẩm nang',item:`${base}/cam-nang`},{'@type':'ListItem',position:3,name:post.title,item:url}]},
  {'@context':'https://schema.org','@type':'FAQPage',mainEntity:post.faq.map(item=>({'@type':'Question',name:item.q,acceptedAnswer:{'@type':'Answer',text:item.a}}))}
 ];
 return <main className="subpage seo-article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><div className="container article-container"><nav className="article-breadcrumb" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>›</span><Link href="/cam-nang">Cẩm nang</Link><span>›</span><b>{post.category}</b></nav><GuideArticleEditable post={post}/><aside className="related-guides" aria-label="Bài viết liên quan"><h2>Bài viết liên quan</h2><div className="guide-grid">{guidePosts.filter(item=>item.slug!==post.slug).sort((a,b)=>Number(b.category===post.category)-Number(a.category===post.category)).slice(0,3).map(item=><Link className="guide-card" href={`/cam-nang/${item.slug}`} key={item.slug}><div className="guide-image" style={{backgroundImage:`url(${guideImage(item.image)})`}}/><div className="guide-body"><small>{item.category}</small><h3>{item.title}</h3><p>{item.excerpt}</p><b>Đọc bài →</b></div></Link>)}</div></aside></div></main>
}
