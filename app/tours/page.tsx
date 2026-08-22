import { tours } from '@/data/catalog';

export const metadata = {
  title: 'Tour trong nước & Tour Trung Quốc',
  description: 'Tour trong nước và tour Trung Quốc cùng Thúy Nguyên Travel. Tư vấn lịch khởi hành, khách đoàn và tour gia đình.'
};

export default function ToursPage(){
  return <>
    <section className="page-hero"><div className="container"><p className="eyebrow dark">TOUR DU LỊCH</p><h1>Tour trong nước & Trung Quốc</h1><p>Chọn theo điểm đến, thời lượng và loại hành trình. Giá và lịch khởi hành được xác nhận theo từng thời điểm.</p></div></section>
    <section className="section"><div className="container"><div className="catalog-toolbar"><div><b>{tours.length} hành trình khởi tạo</b><span>Tour gia đình · Tour đoàn · Tour ghép</span></div><a className="primary-button" href="tel:0969973949">Tư vấn tour đoàn</a></div><div className="experience-grid">{tours.map((item)=><article className="experience-card tour-card" key={item.slug}><div className="experience-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p className="route-line">📍 {item.route}</p><p>{item.summary}</p><div className="card-actions"><a className="primary-button" href="tel:0969973949">Nhận lịch khởi hành</a><a className="text-link" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>)}</div></div></section>
  </>
}
