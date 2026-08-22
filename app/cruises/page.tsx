import { cruises } from '@/data/catalog';

export const metadata = {
  title: 'Du thuyền Hạ Long & Lan Hạ',
  description: 'Đặt Ambassador Cruise Hạ Long và Lan Hạ cùng Thúy Nguyên Travel. Hành trình trong ngày, 2N1Đ và nghỉ đêm.'
};

export default function CruisesPage(){
  return <>
    <section className="page-hero"><div className="container"><p className="eyebrow dark">AMBASSADOR CRUISE</p><h1>Du thuyền Hạ Long & Lan Hạ</h1><p>Hành trình trong ngày và nghỉ đêm. Thông tin giá tham khảo sẽ được xác nhận lại theo ngày đi và hạng cabin.</p></div></section>
    <section className="section"><div className="container"><div className="experience-grid">{cruises.map((item)=><article className="experience-card cruise-card" key={item.slug}><div className="experience-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.bay} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p>{item.priceFrom && <div className="cruise-price"><span>Giá tham khảo từ</span><b>{item.priceFrom}</b></div>}<div className="card-actions"><a className="primary-button" href="tel:0969973949">Kiểm tra cabin</a><a className="text-link" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>)}</div></div></section>
  </>
}
