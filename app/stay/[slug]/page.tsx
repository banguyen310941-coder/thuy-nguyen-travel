import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {stays} from '@/data/catalog';
import {StayDetailClient} from '@/components/StayDetailClient';

const SITE='https://banguyen310941-coder.github.io/thuy-nguyen-travel';
export function generateStaticParams(){return stays.map(stay=>({slug:stay.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const stay=stays.find(item=>item.slug===slug);if(!stay)return {title:'Lưu trú'};const url=`${SITE}/stay/${stay.slug}`;return {title:stay.seoTitle||`${stay.name} - ${stay.location}`,description:stay.seoDescription||stay.summary,alternates:{canonical:url},openGraph:{title:stay.name,description:stay.summary,url,images:[stay.image],type:'website'}}}

export default async function StayDetailPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const stay=stays.find(item=>item.slug===slug);if(!stay)notFound();return <StayDetailClient base={stay}/>}
