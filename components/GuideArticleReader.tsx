'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {useSiteSettings} from '@/components/useSiteSettings';

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
 const [article,setArticle]=useState<Article|null|undefined>(undefined);const settings=useSiteSettings();
 useEffect(()=>{const load=()=>{try{const slug=new URLSearchParams(window.location.search).get('slug')||'';const items=JSON.parse(localStorage.getItem('tn_cms_articles_v3')||'[]') as Article[];setArticle(items.find(x=>x.slug===slug&&x.status==='published')||null)}catch{setArticle(null)}};load();window.addEventListener('tn-articles-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-articles-updated',load);window.removeEventListener('storage',load)}},[]);
 useEffect(()=>{if(!article)return;document.title=article.seoTitle||article.title;const desc=article.seoDescription||article.excerpt;if(desc){let meta=document.head.querySelector('meta[name="description"]') as HTMLMetaElement|null;if(!meta){meta=document.createElement('meta');meta.name='description';document.head.appendChild(meta)}meta.content=desc}const canonical=`${window.location.origin}${window.location.pathname}?slug=${encodeURIComponent(article.slug)}`;let link=document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}link.href=canonical;if(article.cover){let og=document.head.querySelector('meta[property="og:image"]') as HTMLMetaElement|null;if(!og){og=document.createElement('meta');og.setAttribute('property','og:image');document.head.appendChild(og)}og.content=article.cover}},[article]);
 const safeHtml=useMemo(()=>sanitizeEditorHtml(article?.content||''),[article?.content]);
 if(article===undefined)return <div className="article-state">Đang tải bài viết...</div>;
 if(!article)return <div className="article-state"><h2>Không tìm thấy bài viết</h2><p>Bài có thể đang ở bản nháp, đã bị xóa hoặc chưa được xuất bản trên thiết bị này.</p><Link href="/guide">← Quay lại Cẩm nang</Link></div>;
 const phone=settings.hotline.replace(/\D/g,'');const zalo=settings.zalo.replace(/\D/g,'')||phone;
 return <article className="public-article"><div className="article-meta"><span>{article.category||'Cẩm nang du lịch'}</span><span>{article.date||''}</span></div><h1>{article.title}</h1>{article.excerpt&&<p className="article-lead">{article.excerpt}</p>}{article.cover&&<img className="article-cover" src={article.cover} alt={article.title}/>}<div className="article-content">{safeHtml?<div dangerouslySetInnerHTML={{__html:safeHtml}}/>:<p>Nội dung bài viết đang được cập nhật.</p>}</div><div className="article-actions"><a href={`tel:${phone}`}>☎ Gọi tư vấn</a><a href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer">Zalo</a><Link href="/guide">Xem thêm Cẩm nang</Link></div></article>;
}
