'use client';

import {useState} from 'react';

type Props={src?:string;fallback?:string;alt?:string;className?:string};
const DEFAULT='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85';

export function SafeImage({src,fallback=DEFAULT,alt='',className}:Props){
 const [current,setCurrent]=useState(src||fallback);
 return <img src={current} alt={alt} className={className} onError={()=>{if(current!==fallback)setCurrent(fallback)}}/>;
}

export function safeBackground(primary?:string,fallback=DEFAULT){return primary||fallback}
