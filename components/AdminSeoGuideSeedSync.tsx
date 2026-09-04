'use client';

import {useEffect} from 'react';
import {guidePosts} from '@/data/guides';

type Article={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content:string;seoTitle:string;seoDescription:string;status:'draft'|'published'|'scheduled';publishAt:string;date:string};
const KEY='tn_cms_articles_v4';
const esc=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const toHtml=(post:(typeof guidePosts)[number])=>[
 ...post.content.flatMap(section=>[`<h2>${esc(section.heading)}</h2>`,...section.paragraphs.map(p=>`<p>${esc(p)}</p>`)]),
 '<h2>Hình ảnh minh họa</h2>',
 ...post.gallery.map(item=>`<figure><img src="${item.src}" alt="${esc(item.alt)}" style="max-width:100%;height:auto;border-radius:14px" loading="lazy"/><figcaption>${esc(item.alt)}${item.credit?` · ${esc(item.credit)}`:''}</figcaption></figure>`),
 '<h2>Câu hỏi thường gặp</h2>',
 ...post.faq.flatMap(item=>[`<h3>${esc(item.q)}</h3>`,`<p>${esc(item.a)}</p>`])
].join('\n');
const mapGuide=(post:(typeof guidePosts)[number]):Article=>({id:`seo_${post.slug}`,title:post.title,slug:post.slug,category:post.category,excerpt:post.excerpt,cover:post.image,content:toHtml(post),seoTitle:post.title,seoDescription:post.excerpt,status:'published',publishAt:'',date:post.date});
export function AdminSeoGuideSeedSync(){useEffect(()=>{try{const current=JSON.parse(localStorage.getItem(KEY)||'[]') as Article[];const byId=new Map(current.map(x=>[x.id,x]));let changed=false;for(const post of guidePosts){const seed=mapGuide(post);if(!byId.has(seed.id)){byId.set(seed.id,seed);changed=true}}if(changed||!current.length){const merged=Array.from(byId.values());localStorage.setItem(KEY,JSON.stringify(merged));window.dispatchEvent(new Event('tn-articles-updated'))}}catch{}},[]);return null}
