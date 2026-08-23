import type {Metadata} from 'next';
import {CmsTourDetail} from '@/components/CmsTourDetail';

export const metadata:Metadata={title:'Tour du lịch',robots:{index:false,follow:true}};
export default function TourProductPage(){return <CmsTourDetail/>}
