import Link from 'next/link';
import type { Stay } from '@/data/catalog';

export function PropertyCard({ stay }: { stay: Stay }) {
  const price = stay.type === 'Villa' ? '3.900.000đ/đêm' : stay.name.includes('Vinpearl') ? '2.500.000đ/đêm' : '2.200.000đ/đêm';
  return (
    <article className="property-card mock-product-card">
      <Link href={`/stay/${stay.slug}`} className="property-image mock-product-image" style={{ backgroundImage: `url(${stay.image})` }} aria-label={stay.name}>
        <span className="mock-badge">{stay.type}</span>
        <span className="mock-heart">♡</span>
      </Link>
      <div className="property-body mock-product-body">
        <Link href={`/stay/${stay.slug}`}><h3>{stay.name}</h3></Link>
        <p className="property-location">{stay.location}</p>
        <div className="mock-stars">★★★★★ <span>{stay.rating}/10</span></div>
        <div className="mock-price-label">Giá tham khảo</div>
        <div className="mock-price">Từ {price}</div>
        <Link className="mock-detail-btn" href={`/stay/${stay.slug}`}>Xem chi tiết</Link>
      </div>
    </article>
  );
}
