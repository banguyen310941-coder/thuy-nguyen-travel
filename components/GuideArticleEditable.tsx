'use client';

import Link from 'next/link';
import {ContactQuickLink} from '@/components/ContactQuickLink';
import {SafeImage} from '@/components/SafeImage';
import {guideMedia} from '@/lib/guideCloudinary';

type GuideImage={src:string;alt:string;credit?:string};
type StaticPost={slug:string;title:string;category:string;excerpt:string;image:string;coverAlt:string;gallery:GuideImage[];date:string;readTime:string;content:{heading:string;paragraphs:string[]}[];faq:{q:string;a:string}[]};
const happyGoText=(value:string)=>value.replace(/Thúy Nguyên Travel/gi,'HappyGo Travel').replace(/THÚY NGUYÊN TRAVEL/g,'HAPPYGO TRAVEL').replace(/Thúy Nguyên/gi,'HappyGo');
const anchor=(value:string)=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function destinationLink(post:StaticPost){const text=`${post.category} ${post.title}`.toLowerCase();if(text.includes('sầm sơn'))return{href:'/diem-den/sam-son',label:'Du lịch Sầm Sơn'};if(text.includes('long hải'))return{href:'/diem-den/long-hai',label:'Du lịch Long Hải'};if(text.includes('vũng tàu'))return{href:'/diem-den/vung-tau',label:'Du lịch Vũng Tàu'};if(text.includes('hạ long'))return{href:'/diem-den/ha-long',label:'Du lịch Hạ Long'};return null}

export function GuideArticleEditable({post}:{post:StaticPost}){
 const title=happyGoText(post.title),category=happyGoText(post.category),excerpt=happyGoText(post.excerpt),date=post.date;
 const cover=guideMedia(post.image,post.coverAlt);const destination=destinationLink(post);
 const imageSlots=new Map<number,GuideImage[]>();
 post.gallery.forEach((item,index)=>{const slot=Math.min(post.content.length-1,Math.max(0,Math.round(((index+1)*post.content.length)/(post.gallery.length+1))-1));imageSlots.set(slot,[...(imageSlots.get(slot)||[]),item])});
 return <article className="public-article seo-static-article seo-guide-v2">
  <header className="seo-guide-head"><div className="article-meta"><span>{category}</span><span>{date}</span><span>{post.readTime}</span></div><h1>{title}</h1><p className="article-lead">{excerpt}</p></header>
  <figure className="seo-guide-cover-wrap"><SafeImage className="article-cover seo-guide-cover" src={cover.src} alt={cover.alt||post.coverAlt} loading="eager" fetchPriority="high"/><figcaption>{cover.alt||post.coverAlt}</figcaption></figure>
  <div className="seo-guide-shell">
   <aside className="seo-guide-toc"><strong>Nội dung bài viết</strong>{post.content.map((s,i)=><a key={s.heading} href={`#${anchor(s.heading)}`}>{i+1}. {s.heading.replace(/^\d+\.\s*/, '')}</a>)}<a href="#cau-hoi-thuong-gap">Câu hỏi thường gặp</a></aside>
   <div className="article-content seo-guide-content"><p className="seo-guide-summary"><strong>Tóm tắt:</strong> {excerpt}</p>{post.content.map((s,sectionIndex)=>{const inline=imageSlots.get(sectionIndex)||[];return <section id={anchor(s.heading)} key={s.heading}><h2>{happyGoText(s.heading)}</h2>{s.paragraphs.map((x,i)=><p key={i}>{happyGoText(x)}</p>)}{inline.map((item,index)=>{const media=guideMedia(item.src,item.alt,item.credit);return <figure className="seo-guide-inline-image" key={`${item.src}-${index}`}><SafeImage src={media.src} alt={media.alt||item.alt}/><figcaption><strong>{media.alt||item.alt}</strong>{media.credit?<span> · {media.credit}</span>:null}</figcaption></figure>})}</section>})}</div>
  </div>
  <section id="cau-hoi-thuong-gap" className="article-faq seo-guide-faq"><h2>Câu hỏi thường gặp</h2>{post.faq.map(item=><div key={item.q}><h3>{item.q}</h3><p>{item.a}</p></div>)}</section>
  <div className="article-actions seo-guide-actions"><Link href="/luu-tru">Xem villa & lưu trú</Link>{destination&&<Link href={destination.href}>{destination.label}</Link>}<ContactQuickLink label="Nhận tư vấn villa"/></div>
 </article>
}
