'use client';

import {useEffect,useState} from 'react';

const ADMIN_TARGET_KEY='happygo_pwa_target';
const ADMIN_TARGET_COOKIE='happygo_admin_pwa=admin';

function standaloneMode(){
  return window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);
}

function storedTarget(){
  try{return window.localStorage.getItem(ADMIN_TARGET_KEY)}catch{return null}
}

function cookieAdminTarget(){
  return document.cookie.split(';').some(item=>item.trim()===ADMIN_TARGET_COOKIE);
}

function rememberAdmin(){
  try{window.localStorage.setItem(ADMIN_TARGET_KEY,'admin')}catch{}
  document.cookie='happygo_admin_pwa=admin; Max-Age=31536000; Path=/; SameSite=Lax; Secure';
}

export function LegacyAdminPwaRedirect(){
  const[showChoice,setShowChoice]=useState(false);

  useEffect(()=>{
    if(!standaloneMode()||window.location.pathname!=='/')return;
    let cancelled=false;
    const openAdmin=()=>{
      if(cancelled)return;
      rememberAdmin();
      window.location.replace('/admin/?source=pwa&legacy=1');
    };

    const target=storedTarget();
    if(target==='admin'||cookieAdminTarget()){
      openAdmin();
      return()=>{cancelled=true};
    }
    if(target==='public')return()=>{cancelled=true};

    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    void fetch('/api/admin/auth/me',{credentials:'include',cache:'no-store'})
      .then(response=>response.ok?response.json():null)
      .then(data=>{
        if(cancelled)return;
        if(data?.ok&&data?.staff?.id)openAdmin();
        else if(ios)setShowChoice(true);
      })
      .catch(()=>{if(!cancelled&&ios)setShowChoice(true)});

    return()=>{cancelled=true};
  },[]);

  if(!showChoice)return null;
  const chooseAdmin=()=>{
    rememberAdmin();
    window.location.replace('/admin/?source=pwa&legacy=1');
  };
  const choosePublic=()=>{
    try{window.localStorage.setItem(ADMIN_TARGET_KEY,'public')}catch{}
    setShowChoice(false);
  };

  return <div role="dialog" aria-modal="true" aria-label="Chọn chế độ ứng dụng HappyGo" style={{position:'fixed',inset:0,zIndex:2147483647,background:'rgba(4,31,63,.72)',display:'grid',placeItems:'center',padding:20}}>
    <div style={{width:'min(92vw,420px)',background:'#fff',borderRadius:24,padding:24,boxShadow:'0 24px 70px rgba(0,0,0,.28)',textAlign:'center'}}>
      <div style={{width:58,height:58,borderRadius:18,margin:'0 auto 12px',display:'grid',placeItems:'center',background:'#0d47a1',color:'#fff',fontWeight:900,fontSize:22}}>HG</div>
      <small style={{fontWeight:800,letterSpacing:1,color:'#5d7693'}}>HAPPYGO TRAVEL</small>
      <h2 style={{margin:'8px 0 10px',fontSize:24,color:'#073b78'}}>Bạn muốn mở ứng dụng nào?</h2>
      <p style={{margin:'0 0 18px',color:'#60758c',lineHeight:1.5}}>Biểu tượng này được tạo từ phiên bản cũ trên iPhone. Chọn một lần, HappyGo sẽ ghi nhớ cho những lần mở sau.</p>
      <button onClick={chooseAdmin} style={{width:'100%',border:0,borderRadius:14,padding:'14px 16px',background:'#0d47a1',color:'#fff',fontWeight:800,fontSize:16}}>Mở Quản trị</button>
      <button onClick={choosePublic} style={{width:'100%',border:'1px solid #d8e2ec',borderRadius:14,padding:'13px 16px',background:'#fff',color:'#21466f',fontWeight:700,fontSize:15,marginTop:10}}>Tiếp tục Du lịch</button>
    </div>
  </div>;
}
