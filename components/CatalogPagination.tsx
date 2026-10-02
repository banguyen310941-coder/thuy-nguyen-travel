'use client';

type Props={page:number;totalPages:number;onPageChange:(page:number)=>void;label?:string};

export function CatalogPagination({page,totalPages,onPageChange,label='Phân trang'}:Props){
 if(totalPages<=1)return null;
 const pages=Array.from({length:totalPages},(_,index)=>index+1);
 return <nav aria-label={label} style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,flexWrap:'wrap',marginTop:28}}>
  <button type="button" onClick={()=>onPageChange(Math.max(1,page-1))} disabled={page<=1} style={{minWidth:42,height:42,border:'1px solid #d8dee8',borderRadius:10,background:'#fff',cursor:page<=1?'not-allowed':'pointer',opacity:page<=1?.45:1}}>‹</button>
  {pages.map(value=><button type="button" key={value} onClick={()=>onPageChange(value)} aria-current={value===page?'page':undefined} style={{minWidth:42,height:42,padding:'0 12px',border:value===page?'1px solid #f15a24':'1px solid #d8dee8',borderRadius:10,background:value===page?'#f15a24':'#fff',color:value===page?'#fff':'inherit',fontWeight:700,cursor:'pointer'}}>{value}</button>)}
  <button type="button" onClick={()=>onPageChange(Math.min(totalPages,page+1))} disabled={page>=totalPages} style={{minWidth:42,height:42,border:'1px solid #d8dee8',borderRadius:10,background:'#fff',cursor:page>=totalPages?'not-allowed':'pointer',opacity:page>=totalPages?.45:1}}>›</button>
 </nav>;
}
