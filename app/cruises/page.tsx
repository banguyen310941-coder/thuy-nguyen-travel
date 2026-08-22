export const metadata = { title: 'Du thuyền' };

const cruises = [
  ['Ambassador I – Vịnh Hạ Long','2 ngày 1 đêm'],
  ['Ambassador II – Hạ Long','Trong ngày'],
  ['Ambassador Signature – Lan Hạ','Nghỉ đêm cao cấp'],
];

export default function CruisesPage(){return <><section className="page-hero"><div className="container"><h1>Du thuyền Hạ Long & Lan Hạ</h1><p>Hành trình trong ngày và nghỉ đêm, tập trung trước vào dòng Ambassador.</p></div></section><section className="section"><div className="container experience-grid">{cruises.map(([name,meta])=><article className="experience-card" key={name}><div className="experience-image cruise"/><div><h3>{name}</h3><p>{meta} · Cabin · Nhà hàng · Sundeck</p><a className="primary-button" href="tel:0969973949">Kiểm tra chỗ</a></div></article>)}</div></section></>}
