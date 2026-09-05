'use client';

import Link from 'next/link';

type Scope='admin'|'affiliate'|'partner';

const labels:Record<Scope,string>={
  admin:'QUẢN TRỊ HAPPYGO',
  affiliate:'CỘNG TÁC VIÊN HAPPYGO',
  partner:'ĐỐI TÁC HAPPYGO',
};

export function PortalWorkspaceBar({scope,status='Production',onRefresh}:{scope:Scope;status?:string;onRefresh?:()=>void}){
  return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',padding:'10px 16px',background:'#073b78',color:'#fff',fontSize:12}}>
    <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
      <b>{labels[scope]}</b>
      <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 9px',borderRadius:999,background:'rgba(255,255,255,.12)'}}><i style={{width:7,height:7,borderRadius:'50%',background:'#43d17a',display:'inline-block'}}/>{status}</span>
    </div>
    <nav style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}} aria-label="Điều hướng vận hành HappyGo">
      {scope!=='admin'&&<Link style={{color:'#fff'}} href="/">Website</Link>}
      {scope==='admin'&&<><Link style={{color:'#fff'}} href="/admin">Trung tâm Admin</Link><Link style={{color:'#fff'}} href="/admin?module=network&tab=affiliates">Mạng lưới hợp tác</Link></>}
      {scope==='affiliate'&&<><Link style={{color:'#fff'}} href="/affiliate/dashboard">Dashboard CTV</Link><a style={{color:'#fff'}} href="tel:0969973949">Hỗ trợ 0969 973 949</a></>}
      {scope==='partner'&&<><Link style={{color:'#fff'}} href="/partner">Cổng đối tác</Link><a style={{color:'#fff'}} href="tel:0969973949">Hỗ trợ 0969 973 949</a></>}
      {onRefresh&&<button type="button" onClick={onRefresh} style={{border:'1px solid rgba(255,255,255,.35)',background:'transparent',color:'#fff',borderRadius:6,padding:'5px 9px',cursor:'pointer'}}>↻ Làm mới dữ liệu</button>}
    </nav>
  </div>;
}
