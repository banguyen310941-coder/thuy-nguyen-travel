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
    setMessage('Đã lưu bản xem thử trên máy này. Khi có hosting, nút này sẽ xuất bản cho mọi khách.');
  }

  function reset(){setForm(defaultHomeCms);localStorage.removeItem('tn_cms_homepage');setMessage('Đã khôi phục nội dung mặc định trên máy này.');}

  return <section className="admin-panel cms-home-editor">
    <div className="admin-panel-head"><div><h2>Giao diện trang chủ</h2><p>Chỉnh nội dung trực tiếp như WordPress. Hiện GitHub Pages dùng chế độ xem thử; sau này backend sẽ lưu và xuất bản cho toàn bộ khách.</p></div><a className="cms-preview-link" href="/" target="_blank">Mở trang chủ ↗</a></div>
    <div className="cms-editor-grid">
      <div className="cms-fields">
        <label>Nhãn nhỏ<input value={form.eyebrow} onChange={e=>change('eyebrow',e.target.value)}/></label>
        <label>Tiêu đề chính<textarea rows={2} value={form.title} onChange={e=>change('title',e.target.value)}/></label>
        <label>Mô tả banner<textarea rows={3} value={form.subtitle} onChange={e=>change('subtitle',e.target.value)}/></label>
        <div className="admin-form-row"><label>Dòng ghi chú<input value={form.noteTitle} onChange={e=>change('noteTitle',e.target.value)}/></label><label>Nội dung ghi chú<input value={form.noteText} onChange={e=>change('noteText',e.target.value)}/></label></div>
        <label>Ảnh banner (URL)<input value={form.heroImage} onChange={e=>change('heroImage',e.target.value)}/></label>
        {API_BASE&&<label>Khóa quản trị API<input type="password" value={key} onChange={e=>{setKey(e.target.value);localStorage.setItem('tn_admin_api_key',e.target.value)}} placeholder="ADMIN_API_KEY"/></label>}
        <div className="editor-actions"><button type="button" onClick={reset}>Khôi phục mặc định</button><button className="admin-primary" type="button" onClick={save}>Lưu & xuất bản</button></div>
        {message&&<p className="cms-message">{message}</p>}
      </div>
      <div className="cms-live-preview" style={{backgroundImage:`linear-gradient(90deg,rgba(4,55,105,.68),rgba(4,55,105,.12)),url(${form.heroImage})`}}><div><small>{form.eyebrow}</small><h2>{form.title}</h2><p>{form.subtitle}</p><span>{form.noteTitle} — <b>{form.noteText}</b></span></div></div>
    </div>
  </section>;
}
