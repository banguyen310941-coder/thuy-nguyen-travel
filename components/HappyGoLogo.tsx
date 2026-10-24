import type {CSSProperties} from 'react';

type HappyGoLogoProps={compact?:boolean;className?:string;style?:CSSProperties};

/** The supplied brand artwork is rendered intact, never recreated with text or SVG paths. */
export function HappyGoLogo({compact=false,className='',style}:HappyGoLogoProps){
 return <span className={`happygo-logo happygo-original-logo ${compact?'compact':''} ${className}`.trim()} style={{display:'inline-flex',width:compact?170:260,maxWidth:'100%',flexShrink:1,...style}}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src="/brand/happygo-logo-20261024.jpg" width={2048} height={768} alt="HappyGo Travel – Hành trình hạnh phúc - Kết nối yêu thương" style={{display:'block',width:'100%',height:'auto',objectFit:'contain'}}/>
 </span>;
}
