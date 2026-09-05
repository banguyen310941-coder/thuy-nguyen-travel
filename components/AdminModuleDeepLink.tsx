'use client';

import {useEffect} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';

export function AdminModuleDeepLink(){
  const pathname=usePathname();
  const search=useSearchParams();

  useEffect(()=>{
    if(pathname!=='/admin'||search.get('module')!=='network')return;
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
  },[pathname,search]);

  return null;
}
