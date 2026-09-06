'use client';
import {useEffect,useState} from 'react';

type InstallPrompt=Event&{
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:'accepted'|'dismissed'}>;
};

const ADMIN_TARGET_KEY='happygo_pwa_target';

function markAdminTarget(){
 try{window.localStorage.setItem(ADMIN_TARGET_KEY,'admin')}catch{}
 document.cookie='happygo_admin_pwa=admin; Max-Age=31536000; Path=/; SameSite=Lax; Secure';
}

export function AdminInstallApp(){
 const[prompt,setPrompt]=useState<InstallPrompt|null>(null),[installed,setInstalled]=useState(false),[ios,setIos]=useState(false),[show,setShow]=useState(false);
 useEffect(()=>{
  markAdminTarget();
  const standalone=window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);
  setInstalled(standalone);
  setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
  const handler=(e:Event)=>{e.preventDefault();setPrompt(e as InstallPrompt)};
  const done=()=>{setInstalled(true);setPrompt(null);setShow(false)};
  window.addEventListener('beforeinstallprompt',handler);
  window.addEventListener('appinstalled',done);
  return()=>{
   window.removeEventListener('beforeinstallprompt',handler);
   window.removeEventListener('appinstalled',done);
  };
 },[]);
 if(installed)return null;
 async function install(){
  markAdminTarget();
  if(prompt){
   await prompt.prompt();
   const choice=await prompt.userChoice;
   if(choice.outcome==='accepted')setPrompt(null);
   return;
  }
  setShow(true);
 }
 return <>
  <button type="button" className="admin-install-trigger" onClick={install} title="Cài HappyGo Admin lên điện thoại">⬇ <span>Cài ứng dụng</span></button>
  {show&&<div className="admin-install-overlay" onClick={()=>setShow(false)}><div className="admin-install-sheet" onClick={e=>e.stopPropagation()}>
   <button className="admin-install-close" onClick={()=>setShow(false)}>×</button>
   <div className="admin-install-logo">HG</div><small>HAPPYGO TRAVEL ADMIN</small><h3>Cài ứng dụng quản trị HappyGo</h3>
   {ios?<p>Trên iPhone/iPad: mở trang <b>/admin</b> bằng Safari → bấm <b>Chia sẻ</b> → chọn <b>Thêm vào Màn hình chính</b> → giữ bật <b>Mở dưới dạng ứng dụng web</b> → bấm <b>Thêm</b>.</p>:<p>Trên Android/Chrome: tại trang <b>/admin</b>, mở menu <b>⋮</b> → chọn <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b> → xác nhận.</p>}
   <div className="admin-install-tip">Ứng dụng Admin lấy manifest trực tiếp từ HTML của <b>/admin</b> và luôn mở lại khu vực quản trị. HappyGo cũng ghi dấu mục tiêu Admin vào phiên cài đặt để iPhone không tái dùng đường dẫn Trang chủ của biểu tượng cũ.</div>
   <button className="admin-primary" onClick={()=>setShow(false)}>Đã hiểu</button>
  </div></div>}
 </>;
}
