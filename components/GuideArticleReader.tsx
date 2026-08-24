'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';

type Article={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content:string;seoTitle:string;seoDescription:string;status:string;date:string};

function sanitizeEditorHtml(value:string){
 return value
  .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,'')
  .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi,'')
  .replace(/<embed[^>]*>/gi,'')
  .replace(/\son\w+\s*=\s*(["']).*?\1/gi,'')
  .replace(/javascript:/gi,'');
}

export function GuideArticleReader(){
 const settings=useSiteSettings();
 const [article,setArticle]=useState<Article|null|undefined>(undefined);
 useEffect(()=>{const load=()=>{try{const slug=new URLSearchParams(window.location.search).get('slug')||'';const items=JSON.parse(localStorage.getItem('tn_cms_articles_v3')||'[]') as Article[];setArticle(items.find(x=>x.slug===slug&&x.status==='published')||null)}catch{setArticle(null)}};load();window.addEventListener('tn-articles-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-articles-updated',load);window.removeEventListener('storage',load)}},[]);
 useEffect(()=>{if(!article)return;if(article.seoTitle)document.title=article.seoTitle;const desc=article.seoDescription||article.excerpt;if(desc){let meta=document.head.querySelector('meta[name="description"]') as HTMLMetaElement|null;if(!meta){meta=document.createElement('meta');meta.name='description';document.head.appendChild(meta)}meta.content=desc}},[article]);
 const safeHtml=useMemo(()=>sanitizeEditorHtml(article?.content||''),[article?.content]);
 const internalLinks=useMemo(()=>{const text=`${article?.category||''} ${article?.title||''} ${article?.excerpt||''} ${article?.content||''}`.toLowerCase();const links:{href:string;label:string}[]=[];if(/du thuyền|cabin|hạ long|lan hạ/.test(text))links.push({href:'/cruises',label:'Xem du thuyền phù hợp'});if(/villa|resort|khách sạn|phòng|lưu trú/.test(text))links.push({href:'/stay',label:'Xem lưu trú phù hợp'});if(/tour|trung quốc|nhật bản|hàn quốc|châu âu|mỹ|úc|ấn độ|maldives/.test(text))links.push({href:'/tours',label:'Xem tour phù hợp'});return links.slice(0,3)},[article]);
 if(article===undefined)return <div className="article-state">Đang tải bài viết...</div>;
 if(!article)return <div className="article-state"><h2>Không tìm thấy bài viết</h2><p>Bài có thể đang ở bản nháp, đã bị xóa hoặc chưa được xuất bản trên thiết bị này.</p><Link href="/guide">← Quay lại Cẩm nang</Link></div>;
 const phone=settings.hotline.replace(/\D/g,'');const zalo=settings.zalo.replace(/\D/g,'')||phone;
 return <article className="public-article"><div className="article-meta"><span>{article.category||'Cẩm nang du lịch'}</span><span>{article.date||''}</span></div><h1>{article.title}</h1>{article.excerpt&&<p className="article-lead">{article.excerpt}</p>}{article.cover&&<img className="article-cover" src={article.cover} alt={article.title}/>}<div className="article-content">{safeHtml?<div dangerouslySetInnerHTML={{__html:safeHtml}}/>:<p>Nội dung bài viết đang được cập nhật.</p>}</div>{internalLinks.length>0&&<div className="article-internal-links"><b>Gợi ý dịch vụ liên quan</b><div>{internalLinks.map(link=><Link key={link.href} href={link.href}>{link.label} →</Link>)}</div></div>}<div className="article-actions"><a href={`tel:${phone}`}>☎ Gọi {formatPhone(settings.hotline)}</a><a href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer">Zalo</a><Link href="/guide">Xem thêm Cẩm nang</Link></div></article>;
}
