'use client';

import {useEffect} from 'react';
import {guidePosts} from '@/data/guides';

type Article={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;content:string;seoTitle:string;seoDescription:string;status:'draft'|'published'|'scheduled';publishAt:string;date:string};
const KEY='tn_cms_articles_v3';
const toHtml=(post:(typeof guidePosts)[number])=>post.content.map(section=>`<h2>${section.heading}</h2>${section.paragraphs.map(p=>`<p>${p}</p>`).join('')}`).join('\n');
const mapGuide=(post:(typeof guidePosts)[number]):Article=>({id:`seo_${post.slug}`,title:post.title,slug:post.slug,category:post.category,excerpt:post.excerpt,cover:post.image,content:toHtml(post),seoTitle:post.title,seoDescription:post.excerpt,status:'published',publishAt:'',date:post.date});
export function AdminSeoGuideSeedSync(){useEffect(()=>{try{const current=JSON.parse(localStorage.getItem(KEY)||'[]') as Article[];const byId=new Map(current.map(x=>[x.id,x]));let changed=false;for(const post of guidePosts){const seed=mapGuide(post);if(!byId.has(seed.id)){byId.set(seed.id,seed);changed=true}}if(changed||!current.length){const merged=Array.from(byId.values());localStorage.setItem(KEY,JSON.stringify(merged));window.dispatchEvent(new Event('tn-articles-updated'))}}catch{}},[]);return null}
