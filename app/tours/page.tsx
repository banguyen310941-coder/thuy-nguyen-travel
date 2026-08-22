import Link from 'next/link';

export const metadata = { title: 'Tour du lịch' };

const tours = [
  ['Bắc Kinh – Vạn Lý Trường Thành','Tour Trung Quốc','https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=85'],
  ['Thượng Hải – Hàng Châu – Ô Trấn','Tour Trung Quốc','https://images.unsplash.com/photo-1537531383496-f4749b8032cf?auto=format&fit=crop&w=1000&q=85'],
  ['Đà Nẵng – Hội An – Bà Nà','Tour trong nước','https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85'],
];

export default function ToursPage(){return <><section className="page-hero"><div className="container"><h1>Tour trong nước & quốc tế</h1><p>Tour gia đình, đoàn riêng, tour Trung Quốc và các tuyến nội địa nổi bật.</p></div></section><section className="section"><div className="container experience-grid">{tours.map(([name,type,image])=><article className="experience-card" key={name}><div className="experience-image" style={{backgroundImage:`url(${image})`}}/><div><small>{type}</small><h3>{name}</h3><p>Lịch khởi hành và giá được cập nhật theo từng thời điểm.</p><a className="primary-button" href="tel:0969973949">Nhận tư vấn</a></div></article>)}</div></section></>}
