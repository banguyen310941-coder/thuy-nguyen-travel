'use client';

import {useEffect,useMemo,useRef,useState} from 'react';

type Department='all'|'marketing'|'resa'|'product'|'sales'|'accounting';
type StaffDepartment=Exclude<Department,'all'>;
type Msg={id:string;staffId:string;name:string;department:Department;text:string;createdAt:string};
type Staff={id:string;name:string;email:string;status:string;role:string;department:StaffDepartment};

const CHAT='happygo_admin_team_chat_v3';
const STAFF='tn_admin_staff_v1';
const ME='happygo_admin_current_staff_v3';
const ROOM='happygo_admin_chat_room_v3';
const labels:Record<Department,string>={all:'Toàn công ty',marketing:'Marketing',resa:'Resa / Đặt phòng',product:'Sản phẩm',sales:'Kinh doanh',accounting:'Kế toán'};
const rooms:Department[]=['all','marketing','resa','product','sales','accounting'];

function staffDept(role:string,department:unknown):StaffDepartment{
 if(department==='marketing'||department==='resa'||department==='product'||department==='sales'||department==='accounting')return department;
 if(role==='content')return'marketing';if(role==='operations')return'resa';if(role==='accounting')return'accounting';return'sales';
}
function loadStaff():Staff[]{
 try{const parsed=JSON.parse(localStorage.getItem(STAFF)||'[]');if(!Array.isArray(parsed))return[];return parsed.map((x:any)=>({id:String(x?.id||''),name:String(x?.name||''),email:String(x?.email||''),status:String(x?.status||'active'),role:String(x?.role||'sales'),department:staffDept(String(x?.role||'sales'),x?.department)})).filter((x:Staff)=>x.id&&x.name&&x.status==='active')}catch{return[]}
}
function loadMessages():Msg[]{
 try{const parsed=JSON.parse(localStorage.getItem(CHAT)||'[]');if(!Array.isArray(parsed))return[];return parsed.filter((x:any)=>x&&typeof x==='object').map((x:any)=>({id:String(x.id||''),staffId:String(x.staffId||''),name:String(x.name||''),department:rooms.includes(x.department)?x.department:'all',text:String(x.text||''),createdAt:String(x.createdAt||new Date().toISOString())})).filter((x:Msg)=>x.id&&x.staffId&&x.name&&x.text)}catch{return[]}
}

export function AdminTeamChat(){
 const[staff,setStaff]=useState<Staff[]>([]);const[messages,setMessages]=useState<Msg[]>([]);const[me,setMe]=useState('');const[room,setRoom]=useState<Department>('all');const[text,setText]=useState('');const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{const refresh=()=>{const s=loadStaff();setStaff(s);setMessages(loadMessages());const saved=localStorage.getItem(ME)||'';setMe(s.some(x=>x.id===saved)?saved:'');const r=localStorage.getItem(ROOM) as Department|null;setRoom(r&&rooms.includes(r)?r:'all')};refresh();window.addEventListener('storage',refresh);window.addEventListener('tn-staff-updated',refresh);window.addEventListener('happygo-team-chat-v3',refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('tn-staff-updated',refresh);window.removeEventListener('happygo-team-chat-v3',refresh)}},[]);
 useEffect(()=>{try{end.current?.scrollIntoView({block:'end'})}catch{}},[messages.length,room]);
 const current=staff.find(x=>x.id===me);
 const visibleStaff=useMemo(()=>room==='all'?staff:staff.filter(x=>x.department===room),[staff,room]);
 const visibleMessages=useMemo(()=>messages.filter(x=>x.department===room),[messages,room]);
 const counts=useMemo(()=>({all:staff.length,marketing:staff.filter(x=>x.department==='marketing').length,resa:staff.filter(x=>x.department==='resa').length,product:staff.filter(x=>x.department==='product').length,sales:staff.filter(x=>x.department==='sales').length,accounting:staff.filter(x=>x.department==='accounting').length}),[staff]);
 function pickStaff(id:string){setMe(id);try{id?localStorage.setItem(ME,id):localStorage.removeItem(ME)}catch{}}
 function pickRoom(r:Department){setRoom(r);try{localStorage.setItem(ROOM,r)}catch{}}
 function send(){const value=text.trim();if(!current||!value)return;const msg:Msg={id:`msg_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,staffId:current.id,name:current.name,department:room,text:value,createdAt:new Date().toISOString()};const next=[...messages,msg].slice(-500);setMessages(next);setText('');try{localStorage.setItem(CHAT,JSON.stringify(next));window.dispatchEvent(new Event('happygo-team-chat-v3'))}catch{}}
 function resetChat(){if(!confirm('Xóa lịch sử chat trên trình duyệt này và tạo lại dữ liệu chat sạch?'))return;try{localStorage.removeItem(CHAT);localStorage.removeItem(ME);localStorage.removeItem(ROOM)}catch{}setMessages([]);setMe('');setRoom('all')}
 return <section className="admin-panel team-chat"><div className="admin-panel-head"><div><h2>💬 HappyGo Team Chat</h2><p>Trao đổi theo toàn công ty hoặc từng phòng ban.</p></div><div style={{display:'flex',gap:8,alignItems:'center'}}><span className="status-confirmed">{staff.length} nhân viên hoạt động</span><button type="button" className="admin-secondary" onClick={resetChat}>Reset chat</button></div></div>
 <div className="team-chat-departments">{rooms.map(r=><button key={r} type="button" onClick={()=>pickRoom(r)} className={room===r?'active':''}><b>{labels[r]}</b><span>{counts[r]}</span></button>)}</div>
 <div className="team-chat-layout"><aside className="team-chat-people"><b>Đăng nhập với tư cách</b><select value={me} onChange={e=>pickStaff(e.target.value)}><option value="">Chọn nhân viên...</option>{staff.map(x=><option key={x.id} value={x.id}>{x.name} · {labels[x.department]}</option>)}</select><div className="team-chat-room-title"><small>PHÒNG CHAT</small><b>{labels[room]}</b></div><div className="team-online-list">{visibleStaff.map(x=><div key={x.id}><span>●</span><div><b>{x.name}</b><small>{labels[x.department]} · {x.role}</small></div></div>)}</div></aside><div className="team-chat-room"><div className="team-chat-feed"><div className="team-chat-feed-head"><div><small>KÊNH</small><b>#{labels[room]}</b></div><span>{visibleStaff.length} thành viên</span></div>{visibleMessages.length?visibleMessages.map(m=><article key={m.id} className={m.staffId===me?'mine':''}><div><b>{m.name}</b><time>{new Date(m.createdAt).toLocaleString('vi-VN')}</time></div><p>{m.text}</p></article>):<div className="admin-empty-state"><b>Chưa có tin nhắn trong {labels[room]}</b><p>Chọn nhân viên rồi nhập tin nhắn để bắt đầu.</p></div>}<div ref={end}/></div><div className="team-chat-compose"><textarea rows={2} value={text} disabled={!current} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={current?`Nhắn vào #${labels[room]}...`:'Chọn nhân viên trước khi chat'}/><button type="button" className="admin-primary" disabled={!current||!text.trim()} onClick={send}>Gửi</button></div></div></div>
 <p className="admin-api-note">Team Chat V3 dùng vùng dữ liệu mới để tránh lỗi dữ liệu chat cũ. Trên GitHub Pages, chat hiện chỉ đồng bộ trong cùng trình duyệt.</p></section>
}
