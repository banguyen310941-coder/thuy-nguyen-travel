'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

export function AffiliateAttributionCapture(){const pathname=usePathname();useEffect(()=>{const params=new URLSearchParams(window.location.search);const code=params.get('ref')||'',villaId=params.get('villa_id')||'';if(!code||!villaId)return;void fetch('/api/affiliate/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,villaId})}).catch(()=>{})},[pathname]);return null}
