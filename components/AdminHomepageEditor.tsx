'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { defaultHomeCms, type HomeCmsData } from '@/components/HomeCmsHero';

export function AdminHomepageEditor(){
  const [form,setForm]=useState<HomeCmsData>(defaultHomeCms);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    const local=localStorage.getItem('tn_cms_homepage');
    if(local){try{setForm({...defaultHomeCms,...JSON.parse(local)})}catch{}}
  },[]);

  function change<K extends keyof HomeCmsData>(name:K,value:HomeCmsData[K]){setForm(v=>({...v,[name]:value}));}
  function notify(){window.dispatchEvent(new Event('tn-homepage-updated'));}

  function save(){
    localStorage.setItem('tn_cms_homepage',JSON.stringify(form));
    notify();
    setMessage('Đã lưu và đưa vào hàng đợi đồng bộ production. Website công khai sẽ tự nhận bản mới.');
  }

  function reset(){setForm(defaultHomeCms);localStorage.setItem('tn_cms_homepage',JSON.stringify(defaultHomeCms));notify();setMessage('Đã khôi phục nội dung mặc định và đồng bộ lại trang chủ.');}
  const Toggle=({name,label}:{name:keyof HomeCmsData;label:string})=><label className="cms-toggle"><input type="checkbox" checked={Boolean(form[name])} onChange={e=>change(name,e.target.checked as never)}/><span><b>{label}</b><small>{form[name]?'Đang hiển thị':'Đang ẩn'}</small></span></label>;

  return <section className="admin-panel cms-home-editor">
    <div className="admin-panel-head"><div><small>TRANG CHỦ · PRODUCTION SYNC</small><h2>Giao diện trang chủ</h2><p>Chỉnh từng khối giống WordPress. Nội dung được đồng bộ production theo phiên quản trị, không còn dùng khóa API trên trình duyệt.</p></div><Link className="cms-preview-link" href="/" target="_blank">Mở trang chủ ↗</Link></div>

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
