import Link from 'next/link';
import type { Stay } from '@/data/catalog';

export function PropertyCard({ stay }: { stay: Stay }) {
  return (
    <article className="property-card">
      <Link href={`/stay/${stay.slug}`} className="property-image" style={{ backgroundImage: `url(${stay.image})` }} aria-label={stay.name} />
      <div className="property-body">
        <div className="property-type">{stay.type}</div>
        <Link href={`/stay/${stay.slug}`}><h3>{stay.name}</h3></Link>
        <p className="property-location">{stay.location}</p>
        <p className="property-summary">{stay.summary}</p>
        <div className="property-footer">
          <div className="rating"><b>{stay.rating}</b><span>Rất tốt</span></div>
          <div className="property-price">Liên hệ giá theo ngày</div>
        </div>
      </div>
    </article>
  );
}
