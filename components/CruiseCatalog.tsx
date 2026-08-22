'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cruises } from '@/data/catalog';

export function CruiseCatalog(){
  const params=useSearchParams();
  const q=(params.get('q')||'').toLowerCase();
  const filtered=cruises.filter(item=>!q||`${item.name} ${item.bay} ${item.duration} ${item.summary}`.toLowerCase().includes(q));
  return <><div className="sub-toolbar"><div><b>{filtered.length} hành trình phù hợp</b><br/><span>{q?`Từ khóa: ${params.get('q')}`:'Trong ngày · 2N1Đ · Nghỉ đêm'}</span></div><div className="sub-filter-row"><span className="sub-chip active">Tất cả</span><span className="sub-chip">Hạ Long</span><span className="sub-chip">Lan Hạ</span></div></div><div className="catalog-grid">{filtered.map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.bay} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p>{item.priceFrom&&<p><b style={{color:'#f15a24'}}>Từ {item.priceFrom}</b></p>}<div className="catalog-actions"><Link className="main" href={`/cruises/${item.slug}`}>Xem chi tiết</Link><a className="secondary" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>)}</div>{!filtered.length&&<div className="empty-results"><b>Chưa tìm thấy du thuyền phù hợp</b><p>Thử tìm Hạ Long, Lan Hạ hoặc liên hệ hotline để kiểm tra cabin.</p></div>}</>
}
