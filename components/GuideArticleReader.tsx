'use client';

import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';

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
 const [article,setArticle]=useState<Article|null|undefined>(undefined);
 useEffect(()=>{try{const slug=new URLSearchParams(window.location.search).get('slug')||'';const items=JSON.parse(localStorage.getItem('tn_cms_articles_v3')||'[]') as Article[];setArticle(items.find(x=>x.slug===slug&&x.status==='published')||null)}catch{setArticle(null)}},[]);
 const safeHtml=useMemo(()=>sanitizeEditorHtml(article?.content||''),[article?.content]);
 if(article===undefined)return <div className="article-state">Đang tải bài viết...</div>;
 if(!article)return <div className="article-state"><h2>Không tìm thấy bài viết</h2><p>Bài có thể đang ở bản nháp, đã bị xóa hoặc chưa được xuất bản trên thiết bị này.</p><Link href="/guide">← Quay lại Cẩm nang</Link></div>;
 return <article className="public-article"><div className="article-meta"><span>{article.category||'Cẩm nang du lịch'}</span><span>{article.date||''}</span></div><h1>{article.title}</h1>{article.excerpt&&<p className="article-lead">{article.excerpt}</p>}{article.cover&&<img className="article-cover" src={article.cover} alt={article.title}/>}<div className="article-content">{safeHtml?<div dangerouslySetInnerHTML={{__html:safeHtml}}/>:<p>Nội dung bài viết đang được cập nhật.</p>}</div><div className="article-actions"><a href="tel:0969973949">☎ Gọi tư vấn</a><a href="https://zalo.me/0969973949">Zalo</a><Link href="/guide">Xem thêm Cẩm nang</Link></div></article>;
}
