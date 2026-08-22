'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo,useState } from 'react';
import { cruises } from '@/data/catalog';

export function CruiseCatalog(){
  const params=useSearchParams();
  const q=(params.get('q')||'').toLowerCase();
  const durationParam=(params.get('duration')||'').toLowerCase();
  const [bay,setBay]=useState('all');
  const filtered=useMemo(()=>cruises.filter(item=>{
    const matchQ=!q||`${item.name} ${item.bay} ${item.duration} ${item.summary}`.toLowerCase().includes(q);
    const d=item.duration.toLowerCase();
    const matchDuration=!durationParam||(durationParam==='day'&&(/trong ngày|tiếng/.test(d)))||(durationParam==='2n1d'&&(/2 ngày 1 đêm|2n1đ|2n1d/.test(d)))||(durationParam==='3n2d'&&(/3 ngày 2 đêm|3n2đ|3n2d/.test(d)));
    const matchBay=bay==='all'||(bay==='halong'&&item.bay.toLowerCase().includes('hạ long'))||(bay==='lanha'&&item.bay.toLowerCase().includes('lan hạ'));
    return matchQ&&matchDuration&&matchBay;
  }),[q,durationParam,bay]);
  return <><div className="sub-toolbar"><div><b>{filtered.length} hành trình phù hợp</b><br/><span>{q?`Vịnh/từ khóa: ${params.get('q')}`:'Trong ngày · 2N1Đ · Nghỉ đêm'}{durationParam?` · Thời lượng đã chọn`:''}</span></div><div className="sub-filter-row"><button type="button" className={`sub-chip ${bay==='all'?'active':''}`} onClick={()=>setBay('all')}>Tất cả</button><button type="button" className={`sub-chip ${bay==='halong'?'active':''}`} onClick={()=>setBay('halong')}>Hạ Long</button><button type="button" className={`sub-chip ${bay==='lanha'?'active':''}`} onClick={()=>setBay('lanha')}>Lan Hạ</button></div></div><div className="catalog-grid">{filtered.map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.bay} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p>{item.priceFrom&&<p><b style={{color:'#f15a24'}}>Từ {item.priceFrom}</b></p>}<div className="catalog-actions"><Link className="main" href={`/cruises/${item.slug}`}>Xem chi tiết</Link><a className="secondary" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>)}</div>{!filtered.length&&<div className="empty-results"><b>Chưa tìm thấy du thuyền phù hợp</b><p>Thử đổi vịnh, thời lượng hoặc ngày đi.</p></div>}</>
}
