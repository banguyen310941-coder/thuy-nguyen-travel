'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { tours } from '@/data/catalog';

type CmsTour = {
  id: string;
  name: string;
  slug: string;
  cover?: string;
  category: string;
  duration: string;
  departure: string;
  route: string;
  summary: string;
  status: string;
  salePrice: string;
  price: string;
  departures: string;
  gallery: string;
};

export function TourCatalog() {
  const params = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const departure = (params.get('departure') || '').toLowerCase();
  const date = params.get('date') || '';
  const selectedDay = date ? date.split('-').reverse().slice(0, 2).join('/') : '';
  const categoryParam = (params.get('category') || 'all').toLowerCase();
  const [category, setCategory] = useState(['china', 'domestic'].includes(categoryParam) ? categoryParam : 'all');
  const [cms, setCms] = useState<CmsTour[]>([]);

  useEffect(() => {
    setCategory(['china', 'domestic'].includes(categoryParam) ? categoryParam : 'all');
  }, [categoryParam]);

  useEffect(() => {
    const load = () => {
      try {
        setCms(JSON.parse(localStorage.getItem('tn_cms_tours_v3') || '[]') as CmsTour[]);
      } catch {
        setCms([]);
      }
    };
    load();
    window.addEventListener('tn-tours-updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('tn-tours-updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  const staticSlugs = useMemo(() => new Set(tours.map((item) => item.slug)), []);

  const mergedStatic = useMemo(
    () =>
      tours.flatMap((item) => {
        const cmsItem = cms.find((entry) => entry.slug === item.slug);
        if (cmsItem && cmsItem.status !== 'published') return [];
        return [
          {
            ...item,
            name: cmsItem?.name || item.name,
            category: (cmsItem?.category || item.category) as typeof item.category,
            duration: cmsItem?.duration || item.duration,
            departureFrom: cmsItem?.departure || item.departureFrom,
            route: cmsItem?.route || item.route,
            summary: cmsItem?.summary || item.summary,
            image: cmsItem?.cover || item.image,
            priceFrom: cmsItem?.salePrice || cmsItem?.price || item.priceFrom,
            departureDates: cmsItem?.departures
              ? cmsItem.departures.split(/\n+/).map((value) => value.trim()).filter(Boolean)
              : item.departureDates,
          },
        ];
      }),
    [cms],
  );

  const filtered = useMemo(
    () =>
      mergedStatic.filter((item) => {
        const matchQ = !q || `${item.name} ${item.route} ${item.category} ${item.summary}`.toLowerCase().includes(q);
        const matchDeparture = !departure || (item.departureFrom || '').toLowerCase().includes(departure);
        const matchCategory =
          category === 'all' ||
          (category === 'china' && item.category === 'Tour Trung Quốc') ||
          (category === 'domestic' && item.category === 'Tour trong nước');
        const dates = item.departureDates || [];
        const matchDate = !selectedDay || !dates.length || dates.some((value) => value.startsWith(selectedDay));
        return matchQ && matchDeparture && matchCategory && matchDate;
      }),
    [mergedStatic, q, departure, category, selectedDay],
  );

  const cmsOnly = useMemo(
    () =>
      cms
        .filter((item) => item.status === 'published' && !staticSlugs.has(item.slug))
        .filter((item) => {
          const matchQ = !q || `${item.name} ${item.route} ${item.category} ${item.summary}`.toLowerCase().includes(q);
          const matchDeparture = !departure || (item.departure || '').toLowerCase().includes(departure);
          const matchCategory =
            category === 'all' ||
            (category === 'china' && item.category === 'Tour Trung Quốc') ||
            (category === 'domestic' && item.category === 'Tour trong nước');
          const dates = (item.departures || '').split(/\n+/).map((value) => value.trim()).filter(Boolean);
          const matchDate = !selectedDay || !dates.length || dates.some((value) => value.startsWith(selectedDay));
          return matchQ && matchDeparture && matchCategory && matchDate;
        }),
    [cms, q, departure, category, selectedDay, staticSlugs],
  );

  const total = filtered.length + cmsOnly.length;

  return (
    <>
      <div className="sub-toolbar">
        <div>
          <b>{total} hành trình phù hợp</b><br />
          <span>
            {q ? `Điểm đến/từ khóa: ${params.get('q')}` : 'Tour gia đình · Tour đoàn · Tour ghép'}
            {departure ? ` · Khởi hành: ${params.get('departure')}` : ''}
            {date ? ` · Ngày đi: ${date.split('-').reverse().join('/')}` : ''}
          </span>
        </div>
        <div className="sub-filter-row">
          <button type="button" className={`sub-chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>Tất cả</button>
          <button type="button" className={`sub-chip ${category === 'china' ? 'active' : ''}`} onClick={() => setCategory('china')}>Trung Quốc</button>
          <button type="button" className={`sub-chip ${category === 'domestic' ? 'active' : ''}`} onClick={() => setCategory('domestic')}>Trong nước</button>
        </div>
      </div>

      <div className="catalog-grid">
        {filtered.map((item) => (
          <article className="catalog-card" key={item.slug}>
            <div className="catalog-image" style={{ backgroundImage: `url(${item.image})` }} />
            <div className="catalog-body">
              <small>{item.category} · {item.duration}</small>
              <h3>{item.name}</h3>
              <p>📍 {item.route}</p>
              <p>{item.summary}</p>
              <p><b style={{ color: '#f15a24' }}>Từ {item.priceFrom || 'Liên hệ'}</b></p>
              <div className="catalog-actions"><Link className="main" href={`/tours/${item.slug}`}>Xem chi tiết</Link></div>
            </div>
          </article>
        ))}

        {cmsOnly.map((item) => {
          const dates = (item.departures || '').split(/\n+/).filter(Boolean);
          const image = item.cover || (item.gallery || '').split(/\n+/).find(Boolean) || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=85';
          return (
            <article className="catalog-card cms-public-card" key={item.id}>
              <div className="catalog-image" style={{ backgroundImage: `url(${image})` }} />
              <div className="catalog-body">
                <small>{item.category} · {item.duration || 'Đang cập nhật'}</small>
                <h3>{item.name}</h3>
                <p>📍 {item.route || 'Lịch trình đang cập nhật'}</p>
                <p>{item.summary || 'Tour được xuất bản từ hệ thống quản trị.'}</p>
                {item.departure && <p><b>Khởi hành:</b> {item.departure}</p>}
                {dates.length > 0 && <p><b>Lịch gần nhất:</b> {dates.slice(0, 3).join(' · ')}</p>}
                <p><b style={{ color: '#f15a24' }}>Từ {item.salePrice || item.price || 'Liên hệ'}</b></p>
                <div className="catalog-actions"><Link className="main" href={`/tour-product?slug=${encodeURIComponent(item.slug)}`}>Xem chi tiết</Link></div>
              </div>
            </article>
          );
        })}
      </div>

      {!total && <div className="empty-results"><b>Chưa tìm thấy tour đúng ngày đã chọn</b><p>Thử đổi ngày khởi hành, điểm đến hoặc nhóm tour.</p></div>}
    </>
  );
}
