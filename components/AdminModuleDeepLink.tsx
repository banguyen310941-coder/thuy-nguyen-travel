'use client';

import {useEffect} from 'react';

export function AdminModuleDeepLink(){
  useEffect(()=>{
    const url=new URL(window.location.href);
    if(url.pathname!=='/admin'||url.searchParams.get('module')!=='network')return;
    let stopped=false;
    let attempts=0;
    const open=()=>{
      if(stopped)return;
      attempts+=1;
      const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.admin-sidebar nav button'));
      const target=buttons.find(button=>button.textContent?.includes('Mạng lưới hợp tác'));
      if(target){target.click();return}
      if(attempts<40)window.setTimeout(open,100);
    };
    open();
    return()=>{stopped=true};
  },[]);

  return null;
}
