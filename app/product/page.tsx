import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {CmsProductDetail} from '@/components/CmsProductDetail';

export const metadata:Metadata={title:'Sản phẩm du lịch',robots:{index:false,follow:true}};
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export default async function ProductPage({searchParams}:Props){
 const raw=await searchParams;const slug=Array.isArray(raw.slug)?raw.slug[0]:raw.slug;
 if(slug){const query=new URLSearchParams();for(const [key,value] of Object.entries(raw)){if(key==='slug'||value===undefined)continue;if(Array.isArray(value))value.forEach(item=>query.append(key,item));else query.set(key,value)}const suffix=query.toString()?`?${query.toString()}`:'';redirect(`/product/${encodeURIComponent(slug)}${suffix}`)}
 return <CmsProductDetail/>;
}
