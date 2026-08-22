'use client';

import {useEffect,useMemo,useState} from 'react';

type MediaItem={id:string;url:string;title:string;type:'image'|'video';createdAt:string};
type SeoSettings={siteTitle:string;description:string;keywords:string;ogImage:string;organizationName:string;canonicalBase:string};
type SiteSettings={brand:string;hotline:string;email:string;zalo:string};

const mediaKey='tn_cms_media_v1';
const seoKey='tn_cms_seo_v1';
const siteKey='tn_cms_site_settings_v1';
const defaultSeo:SeoSettings={siteTitle:'Thúy Nguyên Travel',description:'Đặt villa, khách sạn, resort, tour và du thuyền toàn quốc.',keywords:'du lịch, tour, villa, khách sạn, resort, du thuyền',ogImage:'',organizationName:'Thúy Nguyên Travel',canonicalBase:'https://banguyen310941-coder.github.io/thuy-nguyen-travel'};
const defaultSite:SiteSettings={brand:'Thúy Nguyên Travel',hotline:'0969973949',email:'info@thuynguyentravel.com',zalo:'0969973949'};

export function AdminMediaPanel(){
 const [items,setItems]=useState<MediaItem[]>([]);const [url,setUrl]=useState('');const [title,setTitle]=useState('');const [type,setType]=useState<'image'|'video'>('image');const [msg,setMsg]=useState('');
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem(mediaKey)||'[]'))}catch{}},[]);
 const save=(next:MediaItem[])=>{setItems(next);localStorage.setItem(mediaKey,JSON.stringify(next))};
 const add=()=>{const value=url.trim();if(!/^https?:\/\//i.test(value)){setMsg('Vui lòng nhập URL ảnh/video bắt đầu bằng http:// hoặc https://');return}const item:MediaItem={id:`media_${Date.now()}`,url:value,title:title.trim()||'Media chưa đặt tên',type,createdAt:new Date().toLocaleString('vi-VN')};save([item,...items]);setUrl('');setTitle('');setMsg('Đã thêm Media vào thư viện.')};
 const remove=(id:string)=>{if(!confirm('Xóa Media này khỏi thư viện?'))return;save(items.filter(x=>x.id!==id))};
 return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Thư viện Media</h2><p>Lưu URL ảnh/video dùng lại cho sản phẩm, bài viết và banner. Khi có hosting sẽ nâng cấp thành upload file thật.</p></div><span>{items.length} mục</span></div><div className="utility-form-grid"><label>Tên Media<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ảnh Oceanami mặt biển"/></label><label>Loại<select value={type} onChange={e=>setType(e.target.value as 'image'|'video')}><option value="image">Ảnh</option><option value="video">Video</option></select></label><label className="wide">URL Media<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."/></label><button type="button" className="admin-primary" onClick={add}>+ Thêm vào thư viện</button></div>{msg&&<p className="cms-message">{msg}</p>}<div className="media-admin-grid">{items.map(item=><article key={item.id}>{item.type==='image'?<img src={item.url} alt={item.title}/>:<div className="media-video-placeholder">▶ VIDEO</div>}<div><b>{item.title}</b><small>{item.createdAt}</small><input readOnly value={item.url}/><div className="pm-actions"><button type="button" onClick={()=>navigator.clipboard?.writeText(item.url)}>Sao chép URL</button><button type="button" className="danger-action" onClick={()=>remove(item.id)}>Xóa</button></div></div></article>)}{!items.length&&<div className="unit-empty">Chưa có Media. Dán URL ảnh/video vào form phía trên để thêm.</div>}</div></section>;
}

export function AdminSeoPanel(){
 const [form,setForm]=useState<SeoSettings>(defaultSeo);const [msg,setMsg]=useState('');
 useEffect(()=>{try{const raw=localStorage.getItem(seoKey);if(raw)setForm({...defaultSeo,...JSON.parse(raw)})}catch{}},[]);
 const set=<K extends keyof SeoSettings>(k:K,v:SeoSettings[K])=>setForm(f=>({...f,[k]:v}));
 const score=useMemo(()=>{let s=0;if(form.siteTitle.length>=20&&form.siteTitle.length<=60)s+=25;if(form.description.length>=100&&form.description.length<=170)s+=30;if(form.keywords.trim())s+=10;if(form.organizationName.trim())s+=10;if(form.canonicalBase.startsWith('http'))s+=15;if(form.ogImage.startsWith('http'))s+=10;return s},[form]);
 const save=()=>{localStorage.setItem(seoKey,JSON.stringify(form));setMsg('Đã lưu cấu hình SEO trên trình duyệt này. Metadata tĩnh hiện vẫn được build từ code; khi có backend/domain riêng sẽ xuất cấu hình này ra toàn website.')};
 return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Cấu hình SEO toàn website</h2><p>Thiết lập mặc định cho title, description, Open Graph và thông tin thương hiệu.</p></div><strong className={score>=70?'seo-good':''}>{score}/100</strong></div><div className="utility-form-grid"><label className="wide">Tên website / Title mặc định<input value={form.siteTitle} onChange={e=>set('siteTitle',e.target.value)}/></label><label className="wide">Meta description<textarea rows={4} value={form.description} onChange={e=>set('description',e.target.value)}/></label><label className="wide">Từ khóa gợi ý<input value={form.keywords} onChange={e=>set('keywords',e.target.value)}/></label><label>Tên tổ chức<input value={form.organizationName} onChange={e=>set('organizationName',e.target.value)}/></label><label>Canonical base URL<input value={form.canonicalBase} onChange={e=>set('canonicalBase',e.target.value)}/></label><label className="wide">Ảnh Open Graph mặc định<input value={form.ogImage} onChange={e=>set('ogImage',e.target.value)} placeholder="https://.../og-image.jpg"/></label></div><div className="seo-admin-checks"><span className={form.siteTitle.length>=20&&form.siteTitle.length<=60?'ok':''}>Title 20–60 ký tự</span><span className={form.description.length>=100&&form.description.length<=170?'ok':''}>Description 100–170 ký tự</span><span className={form.canonicalBase.startsWith('http')?'ok':''}>Canonical hợp lệ</span><span className={form.ogImage.startsWith('http')?'ok':''}>Có ảnh chia sẻ</span></div><button type="button" className="admin-primary" onClick={save}>Lưu cấu hình SEO</button>{msg&&<p className="cms-message">{msg}</p>}</section>;
}

export function AdminSettingsPanel(){
 const [form,setForm]=useState<SiteSettings>(defaultSite);const [msg,setMsg]=useState('');
 useEffect(()=>{try{const raw=localStorage.getItem(siteKey);if(raw)setForm({...defaultSite,...JSON.parse(raw)})}catch{}},[]);
 const set=<K extends keyof SiteSettings>(k:K,v:SiteSettings[K])=>setForm(f=>({...f,[k]:v}));
 const save=()=>{localStorage.setItem(siteKey,JSON.stringify(form));window.dispatchEvent(new Event('tn-site-settings-updated'));setMsg('Đã lưu cài đặt website trên trình duyệt này.')};
 return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Cài đặt hệ thống</h2><p>Thông tin thương hiệu và liên hệ dùng chung trên website.</p></div></div><div className="utility-form-grid"><label>Tên thương hiệu<input value={form.brand} onChange={e=>set('brand',e.target.value)}/></label><label>Hotline<input value={form.hotline} onChange={e=>set('hotline',e.target.value.replace(/\D/g,''))}/></label><label>Email<input type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></label><label>Zalo<input value={form.zalo} onChange={e=>set('zalo',e.target.value.replace(/\D/g,''))}/></label></div><button type="button" className="admin-primary" onClick={save}>Lưu cài đặt</button>{msg&&<p className="cms-message">{msg}</p>}</section>;
}

export function AdminDrivePanel(){return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Google Drive → Website</h2><p>Luồng dự kiến: đọc tài liệu/bảng giá/ảnh trong Drive → tạo bản nháp → duyệt trong Admin → xuất bản.</p></div><em className="pm-status draft">Chờ backend</em></div><div className="drive-drop"><b>Chưa bật kết nối Drive trên GitHub Pages</b><span>Google Drive cần OAuth và backend an toàn để không lộ quyền truy cập. Module này sẽ được kích hoạt khi chuyển website sang hosting riêng.</span></div></section>}
