export const metadata = { title: 'Cẩm nang du lịch' };

const posts = [
  ['Kinh nghiệm chọn villa cho gia đình','Phan Thiết','https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1000&q=85'],
  ['Nên đi du thuyền 1 ngày hay ngủ đêm?','Hạ Long','https://images.unsplash.com/photo-1544551763-46a013bb70d5e?auto=format&fit=crop&w=1000&q=85'],
  ['5 điểm đến biển phù hợp gia đình','Nghỉ dưỡng','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85'],
];

export default function GuidePage(){return <><section className="page-hero"><div className="container"><h1>Cẩm nang du lịch</h1><p>Nội dung SEO về đặt phòng, chọn tour, du thuyền và kinh nghiệm điểm đến.</p></div></section><section className="section"><div className="container experience-grid">{posts.map(([title,category,image])=><article className="experience-card" key={title}><div className="experience-image" style={{backgroundImage:`url(${image})`}}/><div><small>{category}</small><h3>{title}</h3><p>Nội dung bài viết sẽ được quản lý trong CMS và có trình soạn thảo dạng Word.</p></div></article>)}</div></section></>}
