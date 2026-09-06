'use client';

import {FormEvent,useState} from 'react';

export function NewsletterUnsubscribe({initialEmail=''}:{initialEmail?:string}){
 const[email,setEmail]=useState(initialEmail);const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');const[ok,setOk]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;const value=email.trim();if(!value)return;setBusy(true);setMsg('');setOk(false);try{const response=await fetch('/api/newsletter',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:value})});const json=await response.json().catch(()=>({}));if(!response.ok)throw new Error(json.error||'Chưa thể hủy đăng ký.');setOk(true);setMsg('✓ Đã hủy đăng ký email marketing cho địa chỉ này.')}catch(error){setMsg(error instanceof Error?error.message:'Chưa thể hủy đăng ký.')}finally{setBusy(false)}}
 return <form onSubmit={submit} className="newsletter-unsubscribe-form"><label>Email<input type="email" required maxLength={254} value={email} onChange={e=>{setEmail(e.target.value);setMsg('');setOk(false)}} placeholder="email@vidu.com"/></label><button type="submit" className="admin-primary" disabled={busy}>{busy?'Đang xử lý...':'Hủy đăng ký'}</button>{msg&&<p role="status" aria-live="polite" className={ok?'cms-message':'admin-api-note'}>{msg}</p>}</form>
}
