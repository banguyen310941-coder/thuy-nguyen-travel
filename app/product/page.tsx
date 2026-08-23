import type {Metadata} from 'next';
import {CmsProductDetail} from '@/components/CmsProductDetail';

export const metadata:Metadata={title:'Sản phẩm du lịch',robots:{index:false,follow:true}};
export default function ProductPage(){return <CmsProductDetail/>}
