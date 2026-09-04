import type {Metadata} from 'next';
import {PartnerEntryPage} from '@/components/PartnerEntryPage';

export const metadata:Metadata={
  title:'Cổng đối tác',
  description:'Cổng đối tác HappyGo Travel dành cho doanh nghiệp quản lý hồ sơ, sản phẩm, giá và tình trạng hợp tác.',
  robots:{index:false,follow:false,nocache:true},
};

export default function PartnerPage(){
  return <PartnerEntryPage/>;
}
