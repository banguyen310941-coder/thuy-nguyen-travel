'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { tours } from '@/data/catalog';

export function TourCatalog(){
  const params=useSearchParams();
  const q=(params.get('q')||'').toLowerCase();
  const filtered=tours.filter(item=>!q||`${item.name} ${item.route} ${item.category} ${item.summary}`.toLowerCase().includes(q));
  return <><div className="sub-toolbar"><div><b>{filtered.length} hành trình phù hợp</b><br/><span>{q?`Từ khóa: ${params.get('q')}`:'Tour gia đình · Tour đoàn · Tour ghép'}</span></div><div className="sub-filter-row"><span className="sub-chip active">Tất cả</span><span className="sub-chip">Trung Quốc</span><span className="sub-chip">Trong nước</span></div></div><div className="catalog-grid">{filtered.map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>📍 {item.route}</p><p>{item.summary}</p><div className="catalog-actions"><Link className="main" href={`/tours/${item.slug}`}>Xem chi tiết</Link><a className="secondary" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>)}</div>{!filtered.length&&<div className="empty-results"><b>Chưa tìm thấy tour phù hợp</b><p>Thử đổi điểm đến hoặc liên hệ hotline để được thiết kế tour riêng.</p></div>}</>
}
