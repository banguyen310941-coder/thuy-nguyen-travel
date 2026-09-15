'use client';

import {useEffect,useState} from 'react';
import {readCurrentStaff} from '@/components/AdminSalesAccess';

type PushState='hidden'|'checking'|'ready'|'blocked'|'unsupported'|'active'|'error';
const KEY_STORE='happygo_admin_push_vapid_v1';

function applicationKey(value:string){
 const padded=value+'='.repeat((4-value.length%4)%4),raw=atob(padded.replace(/-/g,'+').replace(/_/g,'/')),out=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
 return out;
}

async function saveSubscription(registration:ServiceWorkerRegistration,publicKey:string){
 let subscription=await registration.pushManager.getSubscription();
 const previous=localStorage.getItem(KEY_STORE)||'';
 if(subscription&&previous&&previous!==publicKey){await subscription.unsubscribe().catch(()=>false);subscription=null}
 if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:applicationKey(publicKey)});
 const response=await fetch('/api/admin/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:subscription.toJSON()})});
 if(!response.ok)throw new Error((await response.json().catch(()=>({})))?.error||'Không lưu được thiết bị nhận thông báo.');
 localStorage.setItem(KEY_STORE,publicKey);
}

export function AdminPushNotifications(){
 const[state,setState]=useState<PushState>('hidden');const[msg,setMsg]=useState('');
 useEffect(()=>{
  let live=true;
  const sync=async()=>{
   const staff=readCurrentStaff();if(!staff.id){if(live)setState('hidden');return}
   if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){if(live)setState('unsupported');return}
   if(Notification.permission==='denied'){if(live)setState('blocked');return}
   if(Notification.permission!=='granted'){if(live)setState('ready');return}
   if(live)setState('checking');
   try{const keyResponse=await fetch('/api/admin/push',{cache:'no-store'});if(!keyResponse.ok)throw new Error('Không lấy được khóa thông báo.');const data=await keyResponse.json();const registration=await navigator.serviceWorker.ready;await saveSubscription(registration,String(data.publicKey||''));if(live)setState('active')}catch(error){if(live){setState('error');setMsg(error instanceof Error?error.message:'Không bật được thông báo.')}}
  };
  const run=()=>void sync();run();['happygo-admin-auth','tn-staff-updated'].forEach(event=>window.addEventListener(event,run));
  return()=>{live=false;['happygo-admin-auth','tn-staff-updated'].forEach(event=>window.removeEventListener(event,run))}
 },[]);
 async function enable(){
  setState('checking');setMsg('');
  try{
   if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){setState('unsupported');return}
   const permission=await Notification.requestPermission();if(permission!=='granted'){setState(permission==='denied'?'blocked':'ready');return}
   const keyResponse=await fetch('/api/admin/push',{cache:'no-store'});const data=await keyResponse.json().catch(()=>({}));if(!keyResponse.ok||!data.publicKey)throw new Error(data.error||'Không lấy được khóa thông báo.');
   const registration=await navigator.serviceWorker.ready;await saveSubscription(registration,String(data.publicKey));setState('active');
   await fetch('/api/admin/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'test'})}).catch(()=>null);
  }catch(error){setState('error');setMsg(error instanceof Error?error.message:'Không bật được thông báo.')}
 }
 if(state==='hidden'||state==='active')return null;
 return <aside className={`admin-push-prompt ${state==='blocked'||state==='error'?'bad':''}`} role="status"><span className="admin-push-icon">🔔</span><div><b>{state==='unsupported'?'Điện thoại chưa hỗ trợ thông báo nền':state==='blocked'?'Thông báo HappyGo đang bị chặn':'Bật thông báo khách mới'}</b><small>{state==='unsupported'?'Nếu dùng iPhone, hãy thêm HappyGo Admin vào Màn hình chính rồi mở app từ biểu tượng.':state==='blocked'?'Mở cài đặt thông báo của trình duyệt/HappyGo và cho phép Notification.':msg||'Nhận booking và khách CRM mới ngay cả khi đang ở màn hình khác.'}</small></div>{state!=='unsupported'&&state!=='blocked'&&<button type="button" onClick={()=>void enable()} disabled={state==='checking'}>{state==='checking'?'Đang bật...':'Bật ngay'}</button>}</aside>
}
