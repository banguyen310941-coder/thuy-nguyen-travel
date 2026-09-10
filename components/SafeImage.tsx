'use client';

import {useEffect,useMemo,useState,type CSSProperties} from 'react';

type Props={src?:string;fallback?:string;alt?:string;className?:string;loading?:'lazy'|'eager';fetchPriority?:'high'|'low'|'auto';style?:CSSProperties};
export const TRAVEL_FALLBACKS={
 default:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
 hotel:'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
 villa:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
 cruise:'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
 tour:'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85',
 destination:'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85'
} as const;

export function travelFallback(kind?:string){const k=(kind||'').toLowerCase();if(k.includes('villa')||k.includes('resort'))return TRAVEL_FALLBACKS.villa;if(k.includes('khách')||k.includes('hotel'))return TRAVEL_FALLBACKS.hotel;if(k.includes('thuyền')||k.includes('cruise'))return TRAVEL_FALLBACKS.cruise;if(k.includes('tour'))return TRAVEL_FALLBACKS.tour;if(k.includes('điểm')||k.includes('destination'))return TRAVEL_FALLBACKS.destination;return TRAVEL_FALLBACKS.default}

function normalizeVisualSrc(src:string|undefined,backup:string){const s=String(src||'').trim();if(!s)return backup;if(s.includes('photo-1580974928064-f0aeef70895a'))return TRAVEL_FALLBACKS.default;if(s.includes('photo-1566847438217-76e82d383f84'))return TRAVEL_FALLBACKS.cruise;if(s.includes('dynamic-media-cdn.tripadvisor.com'))return TRAVEL_FALLBACKS.villa;return s}

export function SafeImage({src,fallback,alt='',className,loading='lazy',fetchPriority='auto',style}:Props){
 const backup=useMemo(()=>fallback||TRAVEL_FALLBACKS.default,[fallback]);
 const normalized=useMemo(()=>normalizeVisualSrc(src,backup),[src,backup]);
 const [current,setCurrent]=useState(normalized);
 useEffect(()=>setCurrent(normalized),[normalized]);
 // CMS/partner media can come from arbitrary approved external hosts at runtime.
 // Keep one native image boundary so fallback-on-error works without a brittle Next.js remote-host allowlist.
 // eslint-disable-next-line @next/next/no-img-element
 return <img src={current} alt={alt} className={className} loading={loading} fetchPriority={fetchPriority} decoding="async" style={style} onError={()=>{if(current!==backup)setCurrent(backup)}}/>;
}

export function SafeBackground({src,fallback,children,className,ariaLabel}:{src?:string;fallback?:string;children?:React.ReactNode;className?:string;ariaLabel?:string}){
 const backup=fallback||TRAVEL_FALLBACKS.default;
 return <div className={className} style={{position:'relative',overflow:'hidden',isolation:'isolate'}}><SafeImage src={src} fallback={backup} alt={ariaLabel||''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',zIndex:-1}}/>{children}</div>
}

export function safeBackground(primary?:string,fallback=TRAVEL_FALLBACKS.default){return normalizeVisualSrc(primary,fallback)}
