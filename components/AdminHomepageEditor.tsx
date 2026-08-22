'use client';

import { useEffect, useState } from 'react';
import { defaultHomeCms, type HomeCmsData } from '@/components/HomeCmsHero';

const API_BASE=process.env.NEXT_PUBLIC_API_BASE_URL||'';

export function AdminHomepageEditor(){
  const [form,setForm]=useState<HomeCmsData>(defaultHomeCms);
  const [message,setMessage]=useState('');
  const [key,setKey]=useState('');

  useEffect(()=>{
    const local=localStorage.getItem('tn_cms_homepage');
    if(local){try{setForm({...defaultHomeCms,...JSON.parse(local)})}catch{}}
    setKey(localStorage.getItem('tn_admin_api_key')||'');
    if(API_BASE){fetch(`${API_BASE.replace(/\/$/,'')}/api/site-settings/homepage`).then(r=>r.ok?r.json():null).then(v=>{if(v?.value)setForm({...defaultHomeCms,...v.value})}).catch(()=>{});}
  },[]);

  function change<K extends keyof HomeCmsData>(name:K,value:HomeCmsData[K]){setForm(v=>({...v,[name]:value}));}

  async function save(){
    localStorage.setItem('tn_cms_homepage',JSON.stringify(form));
    if(API_BASE&&key){
      const response=await fetch(`${API_BASE.replace(/\/$/,'')}/api/site-settings/homepage`,{method:'PUT',headers:{'Content-Type':'application/json','x-admin-key':key},body:JSON.stringify({value:form})});
      if(response.ok){setMessage('Đã lưu & xuất bản lên website.');return;}
      setMessage('Đã lưu bản xem thử trên máy này; backend chưa lưu được.');return;
    }
    setMessage('Đã lưu bản xem thử trên máy này. Mở trang chủ để xem thay đổi ngay.');
  }

  function reset(){setForm(defaultHomeCms);localStorage.removeItem('tn_cms_homepage');setMessage('Đã khôi phục nội dung mặc định trên máy này.');}
  const Toggle=({name,label}:{name:keyof HomeCmsData;label:string})=><label className="cms-toggle"><input type="checkbox" checked={Boolean(form[name])} onChange={e=>change(name,e.target.checked as never)}/><span><b>{label}</b><small>{form[name]?'Đang hiển thị':'Đang ẩn'}</small></span></label>;

  return <section className="admin-panel cms-home-editor">
    <div className="admin-panel-head"><div><h2>Giao diện trang chủ</h2><p>Chỉnh từng khối giống WordPress: nội dung, ảnh, tiêu đề và bật/tắt hiển thị.</p></div><a className="cms-preview-link" href="/" target="_blank">Mở trang chủ ↗</a></div>

    <div className="cms-editor-grid">
      <div className="cms-fields">
        <div className="cms-group"><h3>1. Banner chính</h3>
          <label>Nhãn nhỏ<input value={form.eyebrow} onChange={e=>change('eyebrow',e.target.value)}/></label>
          <label>Tiêu đề chính<textarea rows={2} value={form.title} onChange={e=>change('title',e.target.value)}/></label>
          <label>Mô tả banner<textarea rows={3} value={form.subtitle} onChange={e=>change('subtitle',e.target.value)}/></label>
          <div className="admin-form-row"><label>Dòng ghi chú<input value={form.noteTitle} onChange={e=>change('noteTitle',e.target.value)}/></label><label>Nội dung ghi chú<input value={form.noteText} onChange={e=>change('noteText',e.target.value)}/></label></div>
          <label>Ảnh banner (URL)<input value={form.heroImage} onChange={e=>change('heroImage',e.target.value)}/></label>
        </div>

        <div className="cms-group"><h3>2. Dịch vụ nổi bật</h3><Toggle name="servicesEnabled" label="Hiển thị khối dịch vụ"/><label>Tiêu đề<input value={form.servicesTitle} onChange={e=>change('servicesTitle',e.target.value)}/></label><label>Mô tả<input value={form.servicesSubtitle} onChange={e=>change('servicesSubtitle',e.target.value)}/></label></div>

        <div className="cms-group"><h3>3. Điểm đến</h3><Toggle name="destinationsEnabled" label="Hiển thị điểm đến phổ biến"/><label>Tiêu đề<input value={form.destinationsTitle} onChange={e=>change('destinationsTitle',e.target.value)}/></label></div>

        <div className="cms-group"><h3>4. Sản phẩm nổi bật</h3><Toggle name="productsEnabled" label="Hiển thị sản phẩm nổi bật"/><label>Tiêu đề<input value={form.productsTitle} onChange={e=>change('productsTitle',e.target.value)}/></label></div>

        <div className="cms-group"><h3>5. Du thuyền</h3><Toggle name="cruisesEnabled" label="Hiển thị du thuyền nổi bật"/><label>Tiêu đề<input value={form.cruisesTitle} onChange={e=>change('cruisesTitle',e.target.value)}/></label><label>Mô tả<input value={form.cruisesSubtitle} onChange={e=>change('cruisesSubtitle',e.target.value)}/></label></div>

        <div className="cms-group"><h3>6. Tour du lịch</h3><Toggle name="toursEnabled" label="Hiển thị tour hot"/><label>Tiêu đề<input value={form.toursTitle} onChange={e=>change('toursTitle',e.target.value)}/></label></div>

        <div className="cms-group"><h3>7. CTA cuối trang</h3><Toggle name="ctaEnabled" label="Hiển thị khối tư vấn cuối trang"/><label>Nhãn nhỏ<input value={form.ctaEyebrow} onChange={e=>change('ctaEyebrow',e.target.value)}/></label><label>Tiêu đề<input value={form.ctaTitle} onChange={e=>change('ctaTitle',e.target.value)}/></label><label>Mô tả<textarea rows={2} value={form.ctaText} onChange={e=>change('ctaText',e.target.value)}/></label><div className="admin-form-row"><label>Hotline<input value={form.hotline} onChange={e=>change('hotline',e.target.value)}/></label><label>Zalo<input value={form.zalo} onChange={e=>change('zalo',e.target.value)}/></label></div></div>

        {API_BASE&&<label>Khóa quản trị API<input type="password" value={key} onChange={e=>{setKey(e.target.value);localStorage.setItem('tn_admin_api_key',e.target.value)}} placeholder="ADMIN_API_KEY"/></label>}
        <div className="editor-actions"><button type="button" onClick={reset}>Khôi phục mặc định</button><button className="admin-primary" type="button" onClick={save}>Lưu & xuất bản</button></div>
        {message&&<p className="cms-message">{message}</p>}
      </div>

      <div className="cms-preview-stack">
        <div className="cms-live-preview" style={{backgroundImage:`linear-gradient(90deg,rgba(4,55,105,.68),rgba(4,55,105,.12)),url(${form.heroImage})`}}><div><small>{form.eyebrow}</small><h2>{form.title}</h2><p>{form.subtitle}</p><span>{form.noteTitle} — <b>{form.noteText}</b></span></div></div>
        <div className="cms-section-map"><h3>Cấu trúc trang chủ</h3>{[
          ['Banner chính',true],['Dịch vụ nổi bật',form.servicesEnabled],['Điểm đến phổ biến',form.destinationsEnabled],['Sản phẩm nổi bật',form.productsEnabled],['Du thuyền nổi bật',form.cruisesEnabled],['Tour du lịch hot',form.toursEnabled],['CTA cuối trang',form.ctaEnabled]
        ].map(([label,on],i)=><div key={String(label)} className={on?'on':'off'}><b>{i+1}</b><span>{String(label)}</span><em>{on?'Hiển thị':'Ẩn'}</em></div>)}</div>
      </div>
    </div>
  </section>;
}
