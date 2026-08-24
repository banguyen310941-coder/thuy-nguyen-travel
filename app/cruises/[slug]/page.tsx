import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {cruises} from '@/data/catalog';
import {CruiseDetailClient} from '@/components/CruiseDetailClient';

const SITE='https://banguyen310941-coder.github.io/thuy-nguyen-travel';
export function generateStaticParams(){return cruises.map(cruise=>({slug:cruise.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const cruise=cruises.find(item=>item.slug===slug);if(!cruise)return {title:'Du thuyền'};const url=`${SITE}/cruises/${cruise.slug}`;return {title:`${cruise.name} - ${cruise.bay}`,description:cruise.summary,alternates:{canonical:url},openGraph:{title:cruise.name,description:cruise.summary,url,images:[cruise.image],type:'website'}}}
export default async function CruiseDetailPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const cruise=cruises.find(item=>item.slug===slug);if(!cruise)notFound();return <CruiseDetailClient base={cruise}/>}
