'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ContactQuickLink} from '@/components/ContactQuickLink';

type GuideImage={src:string;alt:string;credit?:string};
type StaticPost={slug:string;title:string;category:string;excerpt:string;image:string;gallery:GuideImage[];date:string;readTime:string;content:{heading:string;paragraphs:string[]}[];faq:{q:string;a:string}[]};
type CmsArticle={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content:string;status:string;date:string};
const CONTENT_KEY='tn_cms_articles_v4';
const happyGoText=(value:string)=>value.replace(/Thúy Nguyên Travel/gi,'HappyGo Travel').replace(/THÚY NGUYÊN TRAVEL/g,'HAPPYGO TRAVEL').replace(/Thúy Nguyên/gi,'HappyGo');

export function GuideArticleEditable({post}:{post:StaticPost}){
 const [cms,setCms]=useState<CmsArticle|null>(null);
 useEffect(()=>{const load=()=>{try{const items=JSON.parse(localStorage.getItem(CONTENT_KEY)||'[]') as CmsArticle[];setCms(items.find(x=>x.id===`seo_${post.slug}`&&x.status==='published')||null)}catch{setCms(null)}};load();window.addEventListener('tn-articles-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-articles-updated',load);window.removeEventListener('storage',load)}},[post.slug]);
 const title=happyGoText(cms?.title||post.title),category=happyGoText(cms?.category||post.category),excerpt=happyGoText(cms?.excerpt||post.excerpt),image=cms?.cover||post.image,date=cms?.date||post.date,cmsContent=cms?.content?happyGoText(cms.content):'';
 return <article className="public-article seo-static-article">
  <header><div className="article-meta"><span>{category}</span><span>{date}</span><span>{post.readTime}</span></div><h1>{title}</h1><p className="article-lead">{excerpt}</p></header>
  <img className="article-cover" src={image} alt={title}/>
  <div className="article-content">{cmsContent?<div dangerouslySetInnerHTML={{__html:cmsContent}}/>:<><p><strong>Tóm tắt:</strong> {excerpt}</p>{post.content.map(s=><section key={s.heading}><h2>{happyGoText(s.heading)}</h2>{s.paragraphs.map((x,i)=><p key={i}>{happyGoText(x)}</p>)}</section>)}</>}</div>
  <section className="article-photo-story" aria-label="Ảnh minh họa bài viết"><h2>Hình ảnh minh họa</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>{post.gallery.map((item,index)=><figure key={`${item.src}-${index}`} style={{margin:0}}><img src={item.src} alt={item.alt} loading="lazy" style={{width:'100%',height:220,objectFit:'cover',borderRadius:16,display:'block'}}/>{item.credit&&<figcaption style={{fontSize:12,opacity:.7,marginTop:6}}>{item.alt} · {item.credit}</figcaption>}</figure>)}</div></section>
  <section className="article-faq"><h2>Câu hỏi thường gặp</h2>{post.faq.map(item=><div key={item.q}><h3>{item.q}</h3><p>{item.a}</p></div>)}</section>
  <div className="article-actions"><Link href="/stay">Xem lưu trú</Link><Link href="/cruises">Xem du thuyền</Link><ContactQuickLink label="Nhận tư vấn"/></div>
 </article>
}
