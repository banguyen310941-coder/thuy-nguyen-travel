import { SearchBar } from '@/components/SearchBar';
import { stays } from '@/data/catalog';
import Link from 'next/link';

export const metadata = { title: 'Lưu trú' };

export default function StayPage() {
  return (
    <>
      <section className="page-hero"><div className="container"><h1>Villa, khách sạn & resort</h1><p>Tìm và so sánh lựa chọn theo điểm đến, ngày lưu trú, số khách và ngân sách.</p></div></section>
      <section className="section"><div className="container"><SearchBar /></div></section>
      <section className="section soft-section"><div className="container result-layout">
        <aside className="filter-panel"><h3>Bộ lọc</h3><label>Loại chỗ nghỉ</label><select defaultValue="all"><option value="all">Tất cả</option><option>Villa</option><option>Khách sạn</option><option>Resort</option></select><label>Ngân sách</label><select defaultValue="all"><option value="all">Tất cả mức giá</option><option>Dưới 1.500.000đ</option><option>1.500.000đ – 3.000.000đ</option><option>Trên 3.000.000đ</option></select><label>Hạng sao</label><select defaultValue="all"><option value="all">Tất cả</option><option>5 sao</option><option>4 sao</option><option>3 sao</option></select></aside>
        <div className="result-list">{stays.map((stay) => <article className="result-card" key={stay.slug}><img src={stay.image} alt={stay.name}/><div><small>{stay.type}</small><h3>{stay.name}</h3><p>{stay.location}</p><p>{stay.summary}</p><Link href={`/stay/${stay.slug}`}>Xem tiện ích & chính sách →</Link></div><div className="result-price"><small>Giá theo ngày</small><strong>Liên hệ</strong><Link className="primary-button" href={`/stay/${stay.slug}`}>Xem phòng</Link></div></article>)}</div>
      </div></section>
    </>
  );
}
