import { notFound } from 'next/navigation';
import { stays } from '@/data/catalog';

export function generateStaticParams() { return stays.map((stay) => ({ slug: stay.slug })); }

export default async function StayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stay = stays.find((item) => item.slug === slug);
  if (!stay) notFound();
  return (
    <>
      <section className="page-hero"><div className="container"><p>{stay.location}</p><h1>{stay.name}</h1><p>{stay.summary}</p></div></section>
      <section className="section"><div className="container"><div className="offer-grid"><div><img src={stay.image} alt={stay.name} style={{width:'100%',borderRadius:12,maxHeight:480,objectFit:'cover'}}/></div><aside className="filter-panel"><h3>Kiểm tra phòng</h3><p>Điểm đánh giá: <b>{stay.rating}/10</b></p><label>Ngày nhận phòng</label><input type="date" style={{width:'100%',padding:10}}/><label>Ngày trả phòng</label><input type="date" style={{width:'100%',padding:10}}/><a className="primary-button" href="tel:0969973949" style={{marginTop:14}}>Gọi kiểm tra phòng</a></aside></div><div className="section"><h2>Tiện ích & chính sách</h2><p>Thông tin hạng phòng, tiện ích, chính sách hoàn hủy, phụ thu và giá theo ngày sẽ được quản lý từ CMS ở giai đoạn backend.</p></div></div></section>
    </>
  );
}
