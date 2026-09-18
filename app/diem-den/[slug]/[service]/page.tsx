import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import {getSeoDestination} from '@/data/seo-destinations';
import VillaPage,{generateMetadata as villaMetadata} from '@/app/villa/page';
import HotelResortPage,{generateMetadata as hotelMetadata} from '@/app/khach-san-resort/page';
import CruisesPage,{generateMetadata as cruiseMetadata} from '@/app/cruises/page';
import ToursPage,{generateMetadata as tourMetadata} from '@/app/tours/page';

const SERVICES=new Set(['villa','villa-resort','khach-san-resort','khach-san','du-thuyen','tour-du-lich']);
type Params={slug:string;service:string};
type Props={params:Promise<Params>};
const queryFor=(name:string)=>Promise.resolve({q:name} as Record<string,string|string[]|undefined>);

export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug,service}=await params,item=getSeoDestination(slug);if(!item||!SERVICES.has(service))return{};const searchParams=queryFor(item.name);
 if(service==='villa'||service==='villa-resort')return villaMetadata({searchParams});
 if(service==='khach-san-resort'||service==='khach-san')return hotelMetadata({searchParams});
 if(service==='du-thuyen')return cruiseMetadata({searchParams});
 return tourMetadata({searchParams});
}

export default async function DestinationServicePage({params}:Props){
 const {slug,service}=await params,item=getSeoDestination(slug);if(!item||!SERVICES.has(service))notFound();
 if(service==='villa-resort')redirect(`/diem-den/${slug}/villa`);
 if(service==='khach-san')redirect(`/diem-den/${slug}/khach-san-resort`);
 const searchParams=queryFor(item.name);
 if(service==='villa')return <VillaPage searchParams={searchParams}/>;
 if(service==='khach-san-resort')return <HotelResortPage searchParams={searchParams}/>;
 if(service==='du-thuyen')return <CruisesPage searchParams={searchParams}/>;
 return <ToursPage searchParams={searchParams}/>;
}
