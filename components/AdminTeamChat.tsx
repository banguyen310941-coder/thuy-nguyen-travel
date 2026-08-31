'use client';

import {useEffect,useMemo,useRef,useState} from 'react';

type Msg={id:string;staffId:string;name:string;text:string;createdAt:string};
type Staff={id:string;name:string;email:string;status:string;role:string};
const CHAT='happygo_admin_team_chat_v1';const STAFF='tn_admin_staff_v1';const ME='happygo_admin_current_staff_v1';
function read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'') as T}catch{return fallback}}

export function AdminTeamChat(){
 const[messages,setMessages]=useState<Msg[]>([]);const[staff,setStaff]=useState<Staff[]>([]);const[me,setMe]=useState('');const[text,setText]=useState('');const end=useRef<HTMLDivElement>(null);
 const load=()=>{setMessages(read<Msg[]>(CHAT,[]));setStaff(read<Staff[]>(STAFF,[]).filter(x=>x.status==='active'));setMe(localStorage.getItem(ME)||'')};
 useEffect(()=>{load();const sync=()=>load();window.addEventListener('storage',sync);window.addEventListener('happygo-team-chat',sync);window.addEventListener('tn-staff-updated',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('happygo-team-chat',sync);window.removeEventListener('tn-staff-updated',sync)}},[]);
 useEffect(()=>end.current?.scrollIntoView({behavior:'smooth'}),[messages.length]);
 const current=useMemo(()=>staff.find(x=>x.id===me),[staff,me]);
 const select=(id:string)=>{localStorage.setItem(ME,id);setMe(id)};
 const send=()=>{const value=text.trim();if(!value||!current)return;const next=[...messages,{id:`msg_${Date.now()}`,staffId:current.id,name:current.name,text:value,createdAt:new Date().toISOString()}].slice(-300);localStorage.setItem(CHAT,JSON.stringify(next));setMessages(next);setText('');window.dispatchEvent(new Event('happygo-team-chat'))};
 return <section className="admin-panel team-chat"><div className="admin-panel-head"><div><h2>💬 HappyGo Team Chat</h2><p>Kênh trao đổi công việc chung dành cho nhân viên trong trang quản trị.</p></div><span className="status-confirmed">{staff.length} nhân viên hoạt động</span></div>
 <div className="team-chat-layout"><aside className="team-chat-people"><b>Đăng nhập với tư cách</b><select value={me} onChange={e=>select(e.target.value)}><option value="">Chọn nhân viên...</option>{staff.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><div className="team-online-list">{staff.map(x=><div key={x.id}><span>●</span><div><b>{x.name}</b><small>{x.role}</small></div></div>)}</div></aside><div className="team-chat-room"><div className="team-chat-feed">{messages.length?messages.map(m=><article key={m.id} className={m.staffId===me?'mine':''}><div><b>{m.name}</b><time>{new Date(m.createdAt).toLocaleString('vi-VN')}</time></div><p>{m.text}</p></article>):<div className="admin-empty-state"><b>Chưa có tin nhắn</b><p>Chọn tài khoản nhân viên và bắt đầu trao đổi công việc.</p></div>}<div ref={end}/></div><div className="team-chat-compose"><textarea rows={2} value={text} disabled={!current} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={current?'Nhập tin nhắn... Enter để gửi':'Chọn nhân viên trước khi chat'}/><button type="button" className="admin-primary" disabled={!current||!text.trim()} onClick={send}>Gửi</button></div></div></div>
 <p className="admin-api-note">Bản GitHub Pages hiện đồng bộ chat giữa các tab trên cùng trình duyệt. Khi backend được đưa lên hosting, module này đã sẵn giao diện để nối tài khoản đăng nhập và chat thời gian thực giữa tất cả thiết bị.</p></section>
}
