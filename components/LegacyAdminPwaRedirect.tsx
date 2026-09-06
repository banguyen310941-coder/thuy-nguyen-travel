'use client';

import {useEffect} from 'react';

const ADMIN_TARGET_KEY='happygo_pwa_target';
const ADMIN_TARGET_COOKIE='happygo_admin_pwa=admin';

function standaloneMode(){
  return window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);
}

function storedAdminTarget(){
  try{return window.localStorage.getItem(ADMIN_TARGET_KEY)==='admin'}catch{return false}
}

function cookieAdminTarget(){
  return document.cookie.split(';').some(item=>item.trim()===ADMIN_TARGET_COOKIE);
}

export function LegacyAdminPwaRedirect(){
  useEffect(()=>{
    if(!standaloneMode()||window.location.pathname!=='/')return;
    let cancelled=false;
    const openAdmin=()=>{
      if(cancelled)return;
      try{window.localStorage.setItem(ADMIN_TARGET_KEY,'admin')}catch{}
      window.location.replace('/admin/?source=pwa&legacy=1');
    };

    // New Admin installs carry this explicit target marker. It also lets an
    // older iPhone Home Screen icon self-heal after the user has opened Admin.
    if(storedAdminTarget()||cookieAdminTarget()){
      openAdmin();
      return()=>{cancelled=true};
    }

    // Never redirect a normal public PWA user. Only migrate a legacy icon when
    // the Home Screen web app already has a valid authenticated Admin session.
    void fetch('/api/admin/auth/me',{credentials:'include',cache:'no-store'})
      .then(response=>response.ok?response.json():null)
      .then(data=>{if(data?.ok&&data?.staff?.id)openAdmin()})
      .catch(()=>{});

    return()=>{cancelled=true};
  },[]);
  return null;
}
