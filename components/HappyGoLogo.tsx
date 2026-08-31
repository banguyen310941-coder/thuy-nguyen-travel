import type {CSSProperties} from 'react';

type HappyGoLogoProps={compact?:boolean;className?:string;style?:CSSProperties};

export function HappyGoLogo({compact=false,className='',style}:HappyGoLogoProps){
 const wrap:CSSProperties={display:'inline-flex',alignItems:'center',gap:compact?6:10,minWidth:0,...style};
 const mark:CSSProperties={width:compact?34:58,height:compact?34:58,flex:'0 0 auto',display:'block'};
 const type:CSSProperties={display:'flex',flexDirection:'column',minWidth:0,lineHeight:1};
 const word:CSSProperties={display:'flex',alignItems:'baseline',whiteSpace:'nowrap',fontFamily:'Arial,Helvetica,sans-serif',fontSize:compact?15:27,letterSpacing:compact?'-.7px':'-1.4px'};
 const travel:CSSProperties={marginTop:compact?2:4,color:'#0d47a1',fontSize:compact?6:10,fontWeight:900,letterSpacing:compact?2.6:5,paddingLeft:2};
 return <span className={`happygo-logo ${compact?'compact':''} ${className}`.trim()} style={wrap} aria-label="HappyGo Travel">
  <svg className="happygo-logo-mark" style={mark} viewBox="0 0 96 96" role="img" aria-hidden="true">
   <defs><linearGradient id={compact?'hgOrangeCompact':'hgOrange'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8a00"/><stop offset="1" stopColor="#ff5a00"/></linearGradient></defs>
   <path d="M79 19A37 37 0 1 0 83 67" fill="none" stroke={`url(#${compact?'hgOrangeCompact':'hgOrange'})`} strokeWidth="8" strokeLinecap="round"/>
   <path d="M18 62c13-13 28-13 42-4 7 4 13 5 20 2-7 11-17 17-29 18-13 1-24-5-33-16Z" fill="#0d47a1"/>
   <path d="M23 68c13-6 26-5 38 2-9 8-20 11-31 7-3-1-5-4-7-9Z" fill="#ff6500"/>
   <path d="M29 49c4-10 10-16 19-18-4 4-6 7-7 12 6-6 12-8 20-7-7 3-11 7-13 13-3-2-5-3-8-3-4 0-7 1-11 3Z" fill="#0d47a1"/>
   <path d="M49 24 72 13l4 2-11 11 13 4 3 4-20-2-9 9-4-1 5-11-8-3 4-2Z" fill="#0d47a1"/>
  </svg>
  <span className="happygo-logo-type" style={type}><span className="happygo-word" style={word}><b style={{color:'#0d47a1',fontWeight:900}}>Happy</b><b className="go" style={{color:'#ff6500',fontWeight:900}}>Go</b></span><span className="happygo-travel" style={travel}>TRAVEL</span>{!compact&&<small style={{marginTop:6,color:'#55718b',fontSize:9,fontStyle:'italic',letterSpacing:'.15px',whiteSpace:'nowrap'}}>Hành trình hạnh phúc · Kết nối yêu thương</small>}</span>
 </span>;
}
