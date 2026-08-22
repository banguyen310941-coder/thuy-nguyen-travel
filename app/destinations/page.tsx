import { destinations } from '@/data/catalog';

export const metadata = { title: 'Điểm đến' };

export default function DestinationsPage(){return <><section className="page-hero"><div className="container"><h1>Điểm đến nổi bật</h1><p>Khám phá các điểm nghỉ dưỡng và hành trình được yêu thích trên toàn quốc.</p></div></section><section className="section"><div className="container destination-grid">{destinations.map(([name,meta,image])=><article className="destination-card" key={name}><div className="destination-image" style={{backgroundImage:`url(${image})`}}/><div><h3>{name}</h3><p>{meta}</p></div></article>)}</div></section></>}
