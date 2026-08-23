'use client';

import {useEffect,useState} from 'react';

const QUOTA_MESSAGE='Bộ nhớ demo trên trình duyệt đã đầy. Dữ liệu bạn đang nhập vẫn còn trên màn hình nhưng chưa được lưu. Hãy xóa bớt ảnh trong Media hoặc chuyển website sang hosting để dùng lưu trữ server.';

function isQuotaError(error:unknown){
  const e=error as {name?:string;code?:number;message?:string}|null;
  const text=`${e?.name||''} ${e?.message||''}`.toLowerCase();
  return e?.name==='QuotaExceededError'||e?.name==='NS_ERROR_DOM_QUOTA_REACHED'||e?.code===22||e?.code===1014||text.includes('quota')||text.includes('storage');
}

export function AdminStorageGuard(){
  const [message,setMessage]=useState('');
  useEffect(()=>{
    const original=Storage.prototype.setItem;
    const wrapped=function(this:Storage,key:string,value:string){
      try{return original.call(this,key,value)}catch(error){
        if(isQuotaError(error)){
          window.dispatchEvent(new CustomEvent('tn-storage-error',{detail:{message:QUOTA_MESSAGE,key}}));
        }
        throw error;
      }
    };
    Storage.prototype.setItem=wrapped;
    const onStorageError=(event:Event)=>{
      const detail=(event as CustomEvent<{message?:string}>).detail;
      setMessage(detail?.message||QUOTA_MESSAGE);
    };
    const onError=(event:ErrorEvent)=>{if(isQuotaError(event.error))setMessage(QUOTA_MESSAGE)};
    const onRejection=(event:PromiseRejectionEvent)=>{if(isQuotaError(event.reason))setMessage(QUOTA_MESSAGE)};
    window.addEventListener('tn-storage-error',onStorageError as EventListener);
    window.addEventListener('error',onError);
    window.addEventListener('unhandledrejection',onRejection);
    return()=>{
      if(Storage.prototype.setItem===wrapped)Storage.prototype.setItem=original;
      window.removeEventListener('tn-storage-error',onStorageError as EventListener);
      window.removeEventListener('error',onError);
      window.removeEventListener('unhandledrejection',onRejection);
    };
  },[]);
  if(!message)return null;
  return <div className="admin-storage-alert" role="alert"><div><b>⚠ Chưa lưu được dữ liệu</b><p>{message}</p></div><button type="button" onClick={()=>setMessage('')} aria-label="Đóng cảnh báo">×</button></div>;
}
