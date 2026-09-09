'use client';

import {useEffect} from 'react';

const PRICE_SELECTOR=[
 '.mock-price',
 '.mock-price-label',
 '.mock-tour-card b',
 '.catalog-body b',
 '.booking-price small',
 '.booking-price strong',
 '.daily-price small',
 '.daily-price b',
 '.pd-price-card small',
 '.pd-price-card strong',
 '.tour-price-box small',
 '.tour-price-box strong',
 '.tour-booking-price span',
 '.tour-booking-price strong',
 '.tour-price-table strong',
 '.live-units strong',
 '.unit-price',
 '.rate-price'
].join(',');

function cleanPriceText(value:string){
 return value
  .replace(/^\s*từ\s+(?=(?:\d|liên\s*hệ))/iu,'')
  .replace(/^\s*giá\s+bán\s+từ\s*$/iu,'Giá bán')
  .replace(/^\s*giá\s+đề\s+xuất\s+từ\s*$/iu,'Giá đề xuất')
  .replace(/^\s*giá\s+tham\s+khảo\s+từ\s*$/iu,'Giá tham khảo')
  .replace(/^\s*giá\s+tour\s+từ\s*$/iu,'Giá tour')
  .replace(/^\s*giá\s+từ\s*$/iu,'Giá');
}

function normalizeElement(element:Element){
 for(const node of Array.from(element.childNodes)){
  if(node.nodeType!==Node.TEXT_NODE||!node.textContent)continue;
  const next=cleanPriceText(node.textContent);
  if(next!==node.textContent)node.textContent=next;
 }
}

function normalizePublicPrices(root:ParentNode=document){
 root.querySelectorAll(PRICE_SELECTOR).forEach(normalizeElement);
}

export function PublicPriceNormalizer(){
 useEffect(()=>{
  normalizePublicPrices();
  const observer=new MutationObserver(records=>{
   for(const record of records){
    if(record.type==='characterData'){
     const parent=record.target.parentElement;
     if(parent?.matches(PRICE_SELECTOR))normalizeElement(parent);
     continue;
    }
    for(const node of Array.from(record.addedNodes)){
     if(!(node instanceof Element))continue;
     if(node.matches(PRICE_SELECTOR))normalizeElement(node);
     normalizePublicPrices(node);
    }
   }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  return()=>observer.disconnect();
 },[]);
 return null;
}
