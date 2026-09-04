import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {guidePosts,getGuide} from '@/data/guides';
import {GuideArticleEditable} from '@/components/GuideArticleEditable';
import {getSiteUrl} from '@/lib/site-url';

export function generateStaticParams(){return guidePosts.map(post=>({slug:post.slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params,post=getGuide(slug);if(!post)return {};
 const base=getSiteUrl(),url=`${base}/guide/${post.slug}`,images=[post.image,...post.gallery.map(item=>item.src)];
 return {title:post.title,description:post.excerpt,keywords:post.keywords,alternates:{canonical:url},openGraph:{title:post.title,description:post.excerpt,url,type:'article',images:images.map((src,index)=>({url:src,alt:index===0?post.title:post.gallery[index-1]?.alt||post.title})),siteName:'HappyGo Travel'},twitter:{card:'summary_large_image',title:post.title,description:post.excerpt,images:[post.image]}};
}

export default async function GuideArticle({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,post=getGuide(slug);if(!post)notFound();
 const base=getSiteUrl(),url=`${base}/guide/${post.slug}`,allImages=[post.image,...post.gallery.map(item=>item.src)];
 const schema=[
  {'@context':'https://schema.org','@type':'Article',headline:post.title,description:post.excerpt,image:allImages,datePublished:'2026-09-05',dateModified:'2026-09-05',mainEntityOfPage:{'@type':'WebPage','@id':url},inLanguage:'vi-VN',author:{'@type':'Organization',name:'HappyGo Travel',url:base},publisher:{'@type':'TravelAgency',name:'HappyGo Travel',url:base,telephone:'+84969973949'}},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Trang chủ',item:base},{'@type':'ListItem',position:2,name:'Cẩm nang',item:`${base}/guide`},{'@type':'ListItem',position:3,name:post.title,item:url}]},
  {'@context':'https://schema.org','@type':'FAQPage',mainEntity:post.faq.map(item=>({'@type':'Question',name:item.q,acceptedAnswer:{'@type':'Answer',text:item.a}}))}
 ];
 return <main className="subpage seo-article-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><div className="container article-container"><nav className="article-breadcrumb" aria-label="Breadcrumb"><Link href="/">Trang chủ</Link><span>›</span><Link href="/guide">Cẩm nang</Link><span>›</span><b>{post.category}</b></nav><GuideArticleEditable post={post}/><aside className="related-guides" aria-label="Bài viết liên quan"><h2>Bài viết liên quan</h2><div className="guide-grid">{guidePosts.filter(item=>item.slug!==post.slug).sort((a,b)=>Number(b.category===post.category)-Number(a.category===post.category)).slice(0,3).map(item=><Link className="guide-card" href={`/guide/${item.slug}`} key={item.slug}><div className="guide-image" style={{backgroundImage:`url(${item.image})`}}/><div className="guide-body"><small>{item.category}</small><h3>{item.title}</h3><p>{item.excerpt}</p><b>Đọc bài →</b></div></Link>)}</div></aside></div></main>
}
