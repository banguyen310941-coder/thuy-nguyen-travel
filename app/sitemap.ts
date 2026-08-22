import type { MetadataRoute } from 'next';
import { stays, tours, cruises } from '@/data/catalog';

export const dynamic = 'force-static';

const base = 'https://banguyen310941-coder.github.io/thuy-nguyen-travel';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/stay', '/tours', '/cruises', '/destinations', '/guide'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  const stayPages = stays.map((stay) => ({ url: `${base}/stay/${stay.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 }));
  const tourPages = tours.map((tour) => ({ url: `${base}/tours/${tour.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 }));
  const cruisePages = cruises.map((cruise) => ({ url: `${base}/cruises/${cruise.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 }));
  return [...staticPages, ...stayPages, ...tourPages, ...cruisePages];
}
