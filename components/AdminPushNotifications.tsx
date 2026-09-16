'use client';

import {useEffect,useState} from 'react';
import {readCurrentStaff} from '@/components/AdminSalesAccess';

type PushState='hidden'|'ready'|'blocked'|'unsupported'|'active'|'error'|'checking';
const KEY_STORE='happygo_admin_push_vapid_v1';

function notificationApi(){
 try{
  const api=typeof window!=='undefined'?window.Notification:undefined;
  return api&&typeof api.requestPermission==='function'?api:null;
 }catch{return null}
}
function pushSupported(){
 try{return typeof navigator!=='undefined'&&'serviceWorker'in navigator&&typeof window!=='undefined'&&'PushManager'in window&&Boolean(notificationApi())}catch{return false}
}
function applicationKey(value:string){
 const padded=value+'='.repeat((4-value.length%4)%4),raw=atob(padded.replace(/-/g,'+').replace(/_/g,'/')),out=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
 return out;
}
async function saveSubscription(registration:ServiceWorkerRegistration,publicKey:string){
 if(!registration.pushManager)throw new Error('Thiết bị chưa hỗ trợ PushManager.');
 let subscription=await registration.pushManager.getSubscription();
 let previous='';try{previous=localStorage.getItem(KEY_STORE)||''}catch{}
 if(subscription&&previous&&previous!==publicKey){await subscription.unsubscribe().catch(()=>false);subscription=null}
 if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:applicationKey(publicKey)});
 const response=await fetch('/api/admin/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe',subscription:subscription.toJSON()})});
 if(!response.ok)throw new Error((await response.json().catch(()=>({})))?.error||'Không lưu được thiết bị nhận thông báo.');
 try{localStorage.setItem(KEY_STORE,publicKey)}catch{}
}

export function AdminPushNotifications(){
 const[state,setState]=useState<PushState>('hidden');const[msg,setMsg]=useState('');
 useEffect(()=>{
  const check=()=>{
   try{
    const staff=readCurrentStaff();if(!staff.id){setState('hidden');return}
    if(!pushSupported()){setState('unsupported');return}
    const api=notificationApi();if(!api){setState('unsupported');return}
    if(api.permission==='denied'){setState('blocked');return}
    // Không tự chạm PushManager/service worker lúc khởi động. Safari iOS/PWA cũ
    // có thể ném exception khi restore phiên; chỉ đăng ký sau thao tác người dùng.
    setState(api.permission==='granted'?'ready':'ready');
   }catch{setState('unsupported')}
  };
  check();['happygo-admin-auth','tn-staff-updated'].forEach(event=>window.addEventListener(event,check));
  return()=>['happygo-admin-auth','tn-staff-updated'].forEach(event=>window.removeEventListener(event,check));
 },[]);
 async function enable(){
  setState('checking');setMsg('');
  try{
   if(!pushSupported()){setState('unsupported');return}
   const api=notificationApi();if(!api){setState('unsupported');return}
   const permission=api.permission==='granted'?'granted':await api.requestPermission();
   if(permission!=='granted'){setState(permission==='denied'?'blocked':'ready');return}
   const keyResponse=await fetch('/api/admin/push',{cache:'no-store'});const data=await keyResponse.json().catch(()=>({}));
   if(!keyResponse.ok||!data.publicKey)throw new Error(data.error||'Không lấy được khóa thông báo.');
   const registration=await navigator.serviceWorker.ready;await saveSubscription(registration,String(data.publicKey));setState('active');
   await fetch('/api/admin/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'test'})}).catch(()=>null);
  }catch(error){setState('error');setMsg(error instanceof Error?error.message:'Không bật được thông báo.')}
 }
 if(state==='hidden'||state==='active')return null;
 return <aside className={`admin-push-prompt ${state==='blocked'||state==='error'?'bad':''}`} role="status"><span className="admin-push-icon">🔔</span><div><b>{state==='unsupported'?'Thiết bị chưa sẵn sàng cho thông báo nền':state==='blocked'?'Thông báo HappyGo đang bị chặn':'Bật thông báo khách mới'}</b><small>{state==='unsupported'?'Trên iPhone, hãy mở HappyGo Admin từ biểu tượng Màn hình chính và dùng iOS hỗ trợ Web Push.':state==='blocked'?'Mở Cài đặt → Thông báo → HappyGo/Safari và cho phép thông báo.':msg||'Nhận booking và khách CRM mới ngay cả khi ứng dụng đang chạy nền.'}</small></div>{state!=='unsupported'&&state!=='blocked'&&<button type="button" onClick={()=>void enable()} disabled={state==='checking'}>{state==='checking'?'Đang bật...':'Bật ngay'}</button>}</aside>
}
