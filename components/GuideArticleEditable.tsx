'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ContactQuickLink} from '@/components/ContactQuickLink';

type GuideImage={src:string;alt:string;credit?:string};
type StaticPost={slug:string;title:string;category:string;excerpt:string;image:string;gallery:GuideImage[];date:string;readTime:string;content:{heading:string;paragraphs:string[]}[];faq:{q:string;a:string}[]};
type CmsArticle={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content:string;status:string;date:string};
const CONTENT_KEY='tn_cms_articles_v4';
const happyGoText=(value:string)=>value.replace(/Thúy Nguyên Travel/gi,'HappyGo Travel').replace(/THÚY NGUYÊN TRAVEL/g,'HAPPYGO TRAVEL').replace(/Thúy Nguyên/gi,'HappyGo');
const anchor=(value:string)=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function GuideArticleEditable({post}:{post:StaticPost}){
 const [cms,setCms]=useState<CmsArticle|null>(null);
 useEffect(()=>{const load=()=>{try{const items=JSON.parse(localStorage.getItem(CONTENT_KEY)||'[]') as CmsArticle[];setCms(items.find(x=>x.id===`seo_${post.slug}`&&x.status==='published')||null)}catch{setCms(null)}};load();window.addEventListener('tn-articles-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-articles-updated',load);window.removeEventListener('storage',load)}},[post.slug]);
 const title=happyGoText(cms?.title||post.title),category=happyGoText(cms?.category||post.category),excerpt=happyGoText(cms?.excerpt||post.excerpt),image=cms?.cover||post.image,date=cms?.date||post.date;
 return <article className="public-article seo-static-article seo-guide-v2">
  <header className="seo-guide-head"><div className="article-meta"><span>{category}</span><span>{date}</span><span>{post.readTime}</span></div><h1>{title}</h1><p className="article-lead">{excerpt}</p></header>
  <img className="article-cover seo-guide-cover" src={image} alt={title}/>
  <div className="seo-guide-shell">
   <aside className="seo-guide-toc"><strong>Nội dung bài viết</strong>{post.content.map((s,i)=><a key={s.heading} href={`#${anchor(s.heading)}`}>{i+1}. {s.heading.replace(/^\d+\.\s*/, '')}</a>)}<a href="#album-anh">Album hình ảnh</a><a href="#cau-hoi-thuong-gap">Câu hỏi thường gặp</a></aside>
   <div className="article-content seo-guide-content"><p className="seo-guide-summary"><strong>Tóm tắt:</strong> {excerpt}</p>{post.content.map(s=><section id={anchor(s.heading)} key={s.heading}><h2>{happyGoText(s.heading)}</h2>{s.paragraphs.map((x,i)=><p key={i}>{happyGoText(x)}</p>)}</section>)}</div>
  </div>
  <section id="album-anh" className="article-photo-story seo-guide-album" aria-label="Album hình ảnh bài viết"><div className="seo-guide-section-title"><small>ALBUM HÌNH ẢNH</small><h2>Hình ảnh tham khảo theo chủ đề</h2><p>Mỗi bài có tối thiểu 5 ảnh, có mô tả alt để hỗ trợ SEO hình ảnh và giúp người đọc theo dõi dễ hơn.</p></div><div className="seo-guide-album-grid">{post.gallery.map((item,index)=><figure key={`${item.src}-${index}`}><img src={item.src} alt={item.alt} loading="lazy"/><figcaption>{item.alt}{item.credit?` · ${item.credit}`:''}</figcaption></figure>)}</div></section>
  <section id="cau-hoi-thuong-gap" className="article-faq seo-guide-faq"><h2>Câu hỏi thường gặp</h2>{post.faq.map(item=><div key={item.q}><h3>{item.q}</h3><p>{item.a}</p></div>)}</section>
  <div className="article-actions seo-guide-actions"><Link href="/stay">Xem villa & lưu trú</Link><ContactQuickLink label="Nhận tư vấn villa"/></div>
 </article>
}
