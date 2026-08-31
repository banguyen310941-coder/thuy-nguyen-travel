'use client';

import {useEffect,useMemo,useRef,useState} from 'react';

type Department='all'|'marketing'|'resa'|'product'|'sales'|'accounting';
type StaffDepartment=Exclude<Department,'all'>;
type Msg={id:string;staffId:string;name:string;department:Department;text:string;createdAt:string};
type Staff={id:string;name:string;email:string;status:string;role:string;department?:StaffDepartment};
const CHAT='happygo_admin_team_chat_v2';const STAFF='tn_admin_staff_v1';const ME='happygo_admin_current_staff_v1';const ROOM='happygo_admin_chat_room_v1';
const labels:Record<Department,string>={all:'Toàn công ty',marketing:'Marketing',resa:'Resa / Đặt phòng',product:'Sản phẩm',sales:'Kinh doanh',accounting:'Kế toán'};
const departments=Object.keys(labels) as Department[];
function safeJson<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);if(!raw)return fallback;return JSON.parse(raw) as T}catch{return fallback}}
function validDepartment(v:unknown):v is Department{return typeof v==='string'&&departments.includes(v as Department)}
function validStaffDepartment(v:unknown):v is StaffDepartment{return v==='marketing'||v==='resa'||v==='product'||v==='sales'||v==='accounting'}
function normalizeDepartment(s:Partial<Staff>):StaffDepartment{if(validStaffDepartment(s.department))return s.department;if(s.role==='content')return'marketing';if(s.role==='operations')return'resa';if(s.role==='accounting')return'accounting';return'sales'}
function normalizeStaff(raw:unknown):Staff|null{if(!raw||typeof raw!=='object')return null;const s=raw as Partial<Staff>;const id=String(s.id||'').trim(),name=String(s.name||'').trim();if(!id||!name)return null;return{id,name,email:String(s.email||''),status:String(s.status||'active'),role:String(s.role||'sales'),department:normalizeDepartment(s)}}
function normalizeMessage(raw:unknown):Msg|null{if(!raw||typeof raw!=='object')return null;const m=raw as Partial<Msg>;const id=String(m.id||'').trim(),staffId=String(m.staffId||'').trim(),name=String(m.name||'').trim(),text=String(m.text||'').trim();if(!id||!staffId||!name||!text)return null;return{id,staffId,name,department:validDepartment(m.department)?m.department:'all',text,createdAt:String(m.createdAt||new Date().toISOString())}}

export function AdminTeamChat(){
 const[messages,setMessages]=useState<Msg[]>([]);const[staff,setStaff]=useState<Staff[]>([]);const[me,setMe]=useState('');const[room,setRoom]=useState<Department>('all');const[text,setText]=useState('');const end=useRef<HTMLDivElement>(null);
 const load=()=>{try{const rawStaff=safeJson<unknown[]>(STAFF,[]);const nextStaff=(Array.isArray(rawStaff)?rawStaff:[]).map(normalizeStaff).filter((x):x is Staff=>Boolean(x)).filter(x=>x.status==='active');const rawMessages=safeJson<unknown[]>(CHAT,[]);const nextMessages=(Array.isArray(rawMessages)?rawMessages:[]).map(normalizeMessage).filter((x):x is Msg=>Boolean(x));setStaff(nextStaff);setMessages(nextMessages);const savedMe=localStorage.getItem(ME)||'';setMe(nextStaff.some(x=>x.id===savedMe)?savedMe:'');const savedRoom=localStorage.getItem(ROOM);setRoom(validDepartment(savedRoom)?savedRoom:'all')}catch{setStaff([]);setMessages([]);setMe('');setRoom('all')}};
 useEffect(()=>{load();const sync=()=>load();window.addEventListener('storage',sync);window.addEventListener('happygo-team-chat',sync);window.addEventListener('tn-staff-updated',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('happygo-team-chat',sync);window.removeEventListener('tn-staff-updated',sync)}},[]);
 useEffect(()=>end.current?.scrollIntoView({behavior:'smooth'}),[messages.length,room]);
 const current=useMemo(()=>staff.find(x=>x.id===me),[staff,me]);
 const visibleStaff=useMemo(()=>room==='all'?staff:staff.filter(x=>x.department===room),[staff,room]);
 const visibleMessages=useMemo(()=>messages.filter(m=>m.department===room),[messages,room]);
 const counts=useMemo(()=>departments.reduce((a,k)=>({...a,[k]:k==='all'?staff.length:staff.filter(x=>x.department===k).length}),{} as Record<Department,number>),[staff]);
 const select=(id:string)=>{try{if(id)localStorage.setItem(ME,id);else localStorage.removeItem(ME)}catch{}setMe(id)};
 const chooseRoom=(value:Department)=>{try{localStorage.setItem(ROOM,value)}catch{}setRoom(value)};
 const send=()=>{const value=text.trim();if(!value||!current)return;const message:Msg={id:`msg_${Date.now()}`,staffId:current.id,name:current.name,department:room,text:value,createdAt:new Date().toISOString()};const next:Msg[]=[...messages,message].slice(-1000);try{localStorage.setItem(CHAT,JSON.stringify(next))}catch{}setMessages(next);setText('');window.dispatchEvent(new Event('happygo-team-chat'))};
 return <section className="admin-panel team-chat"><div className="admin-panel-head"><div><h2>💬 HappyGo Team Chat</h2><p>Trao đổi toàn công ty hoặc theo từng phòng ban.</p></div><span className="status-confirmed">{staff.length} nhân viên hoạt động</span></div>
 <div className="team-chat-departments">{departments.map(id=><button type="button" key={id} onClick={()=>chooseRoom(id)} className={room===id?'active':''}><b>{labels[id]}</b><span>{counts[id]||0}</span></button>)}</div>
 <div className="team-chat-layout"><aside className="team-chat-people"><b>Đăng nhập với tư cách</b><select value={me} onChange={e=>select(e.target.value)}><option value="">Chọn nhân viên...</option>{staff.map(x=><option key={x.id} value={x.id}>{x.name} · {labels[x.department||'sales']}</option>)}</select><div className="team-chat-room-title"><small>PHÒNG CHAT</small><b>{labels[room]}</b></div><div className="team-online-list">{visibleStaff.map(x=><div key={x.id}><span>●</span><div><b>{x.name}</b><small>{labels[x.department||'sales']} · {x.role}</small></div></div>)}</div></aside><div className="team-chat-room"><div className="team-chat-feed"><div className="team-chat-feed-head"><div><small>KÊNH</small><b>#{labels[room]}</b></div><span>{visibleStaff.length} thành viên</span></div>{visibleMessages.length?visibleMessages.map(m=><article key={m.id} className={m.staffId===me?'mine':''}><div><b>{m.name}</b><time>{new Date(m.createdAt).toLocaleString('vi-VN')}</time></div><p>{m.text}</p></article>):<div className="admin-empty-state"><b>Chưa có tin nhắn trong {labels[room]}</b><p>Chọn tài khoản nhân viên và bắt đầu trao đổi công việc.</p></div>}<div ref={end}/></div><div className="team-chat-compose"><textarea rows={2} value={text} disabled={!current} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={current?`Nhắn vào #${labels[room]}... Enter để gửi`:'Chọn nhân viên trước khi chat'}/><button type="button" className="admin-primary" disabled={!current||!text.trim()} onClick={send}>Gửi</button></div></div></div>
 <p className="admin-api-note">Dữ liệu nhân viên cũ được tự chuẩn hóa khi mở chat. Hiện GitHub Pages chỉ đồng bộ trên cùng trình duyệt; khi backend được deploy có thể nối realtime giữa nhiều thiết bị.</p></section>
}
