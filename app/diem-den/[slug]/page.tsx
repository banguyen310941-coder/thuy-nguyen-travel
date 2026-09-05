import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {guidePosts} from '@/data/guides';
import {getSeoDestination,seoDestinations} from '@/data/seo-destinations';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';
import {guideImage} from '@/lib/guideCloudinary';
import {getSiteUrl} from '@/lib/site-url';

export function generateStaticParams(){return seoDestinations.map(item=>({slug:item.slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const item=getSeoDestination(slug);if(!item)return{};const base=getSiteUrl();const canonical=`${base}/diem-den/${item.slug}`;
 return {title:item.title,description:item.description,keywords:item.keywords,alternates:{canonical},openGraph:{title:item.title,description:item.description,url:canonical,type:'website',locale:'vi_VN',siteName:'HappyGo Travel'},twitter:{card:'summary_large_image',title:item.title,description:item.description}};
}

export default async function DestinationSeoPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const item=getSeoDestination(slug);if(!item)notFound();const base=getSiteUrl();const url=`${base}/diem-den/${item.slug}`;const guides=guidePosts.filter(post=>item.guideSlugs.includes(post.slug));
 const schema=[
  {'@context':'https://schema.org','@type':'TouristDestination','name':item.name,'description':item.description,'url':url,'touristType':['Gia đình','Nhóm bạn','Khách nghỉ dưỡng']},
  {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Trang chủ','item':base},{'@type':'ListItem','position':2,'name':'Điểm đến','item':`${base}/diem-den`},{'@type':'ListItem','position':3,'name':item.name,'item':url}]},
  {'@context':'https://schema.org','@type':'FAQPage','mainEntity':item.faq.map(f=>({'@type':'Question','name':f.q,'acceptedAnswer':{'@type':'Answer','text':f.a}}))}
 ];
 return <main className="subpage"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / <Link href="/diem-den">Điểm đến</Link> / {item.name}</div><div className="sub-hero-grid"><div><span className="sub-kicker">DU LỊCH {item.name.toUpperCase()}</span><h1>{item.title}</h1><p>{item.intro}</p></div><ContactCtaGroup callLabel={`Tư vấn ${item.name}`}/></div></div></section><nav className="sub-nav"><div className="container sub-nav-inner"><Link href="/diem-den">Điểm đến khác</Link>{item.services.map(s=><Link key={s.href} href={s.href}>{s.label}</Link>)}<Link href="/cam-nang">Cẩm nang du lịch</Link></div></nav><section className="sub-section white"><div className="container article-container"><div className="article-content">{item.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}<section><h2>Dịch vụ phù hợp tại {item.name}</h2><p>Chọn đúng nhóm dịch vụ để xem sản phẩm, lịch giá và thông tin chi tiết theo nhu cầu.</p><div className="article-actions">{item.services.map(s=><Link key={s.href} href={s.href}>{s.label}</Link>)}</div></section>{guides.length>0&&<section><h2>Cẩm nang {item.name}</h2><div className="guide-grid">{guides.map(post=><Link className="guide-card" href={`/cam-nang/${post.slug}`} key={post.slug}><div className="guide-image" style={{backgroundImage:`url(${guideImage(post.image)})`}}/><div className="guide-body"><small>{post.category} · {post.readTime}</small><h3>{post.title}</h3><p>{post.excerpt}</p><b>Đọc cẩm nang →</b></div></Link>)}</div></section>}<section className="article-faq"><h2>Câu hỏi thường gặp về {item.name}</h2>{item.faq.map(f=><div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}</section></div><div className="sub-cta"><div><h2>Cần tư vấn chuyến đi {item.name}?</h2><p>Gửi ngày đi, số khách và nhu cầu để HappyGo Travel kiểm tra phương án phù hợp.</p></div><ContactCtaGroup mode="footer" callLabel="Gọi tư vấn" zaloLabel="Chat Zalo"/></div></div></section></main>;
}
