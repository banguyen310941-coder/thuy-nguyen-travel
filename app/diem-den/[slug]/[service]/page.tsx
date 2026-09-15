import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getSeoDestination} from '@/data/seo-destinations';
import VillaResortPage,{generateMetadata as villaMetadata} from '@/app/villa-resort/page';
import HotelPage,{generateMetadata as hotelMetadata} from '@/app/khach-san/page';
import CruisesPage,{generateMetadata as cruiseMetadata} from '@/app/cruises/page';
import ToursPage,{generateMetadata as tourMetadata} from '@/app/tours/page';

const SERVICES=new Set(['villa-resort','khach-san','du-thuyen','tour-du-lich']);
type Params={slug:string;service:string};
type Props={params:Promise<Params>};
const queryFor=(name:string)=>Promise.resolve({q:name} as Record<string,string|string[]|undefined>);

export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug,service}=await params,item=getSeoDestination(slug);if(!item||!SERVICES.has(service))return{};const searchParams=queryFor(item.name);
 if(service==='villa-resort')return villaMetadata({searchParams});
 if(service==='khach-san')return hotelMetadata({searchParams});
 if(service==='du-thuyen')return cruiseMetadata({searchParams});
 return tourMetadata({searchParams});
}

export default async function DestinationServicePage({params}:Props){
 const {slug,service}=await params,item=getSeoDestination(slug);if(!item||!SERVICES.has(service))notFound();const searchParams=queryFor(item.name);
 if(service==='villa-resort')return <VillaResortPage searchParams={searchParams}/>;
 if(service==='khach-san')return <HotelPage searchParams={searchParams}/>;
 if(service==='du-thuyen')return <CruisesPage searchParams={searchParams}/>;
 return <ToursPage searchParams={searchParams}/>;
}
