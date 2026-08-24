import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {tours} from '@/data/catalog';
import {TourDetailClient} from '@/components/TourDetailClient';

const SITE='https://banguyen310941-coder.github.io/thuy-nguyen-travel';
export function generateStaticParams(){return tours.map(t=>({slug:t.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const tour=tours.find(t=>t.slug===slug);if(!tour)return {title:'Tour du lịch'};const url=`${SITE}/tours/${tour.slug}`;return {title:tour.seoTitle||`${tour.name} - ${tour.duration}`,description:tour.seoDescription||tour.summary,alternates:{canonical:url},openGraph:{title:tour.name,description:tour.summary,url,images:[tour.image],type:'website'}}}

export default async function TourDetailPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const tour=tours.find(t=>t.slug===slug);if(!tour)notFound();return <TourDetailClient base={tour}/>}
