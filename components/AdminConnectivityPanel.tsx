'use client';

import {useCallback,useEffect,useState} from 'react';

type HealthItem={label:string;key:string;event:string;kind:'array'|'object'};
type HealthRow=HealthItem&{count:number;state:'ok'|'empty'|'invalid'};

const ITEMS:HealthItem[]=[
  {label:'Tour du lịch',key:'tn_cms_tours_v3',event:'tn-tours-updated',kind:'array'},
  {label:'Sản phẩm / phòng / cabin',key:'tn_cms_products_v3_units',event:'tn-products-updated',kind:'array'},
  {label:'Bài viết / Cẩm nang',key:'tn_cms_articles_v2',event:'tn-articles-updated',kind:'array'},
  {label:'Đơn đặt dịch vụ',key:'tn_local_bookings_v1',event:'tn-bookings-updated',kind:'array'},
  {label:'Cấu hình trang chủ',key:'tn_homepage_cms_v1',event:'tn-homepage-updated',kind:'object'},
  {label:'Cài đặt website',key:'tn_site_settings_v1',event:'tn-settings-updated',kind:'object'},
];

function inspect(item:HealthItem):HealthRow{
  try{
    const raw=window.localStorage.getItem(item.key);
    if(!raw)return {...item,count:0,state:'empty'};
    const data=JSON.parse(raw);
    if(item.kind==='array')return {...item,count:Array.isArray(data)?data.length:0,state:Array.isArray(data)?'ok':'invalid'};
    const valid=Boolean(data&&typeof data==='object'&&!Array.isArray(data));
    return {...item,count:valid?1:0,state:valid?'ok':'invalid'};
  }catch{return {...item,count:0,state:'invalid'}}
}

export function AdminConnectivityPanel(){
  const [rows,setRows]=useState<HealthRow[]>(()=>ITEMS.map(item=>({...item,count:0,state:'empty'})));
  const [lastRefresh,setLastRefresh]=useState('');
  const load=useCallback(()=>setRows(ITEMS.map(inspect)),[]);
  useEffect(()=>{load();window.addEventListener('storage',load);for(const item of ITEMS)window.addEventListener(item.event,load);return()=>{window.removeEventListener('storage',load);for(const item of ITEMS)window.removeEventListener(item.event,load)}},[load]);
  const healthy=rows.filter(x=>x.state==='ok').length;
  const invalid=rows.filter(x=>x.state==='invalid').length;
  const refreshAll=()=>{for(const item of ITEMS)window.dispatchEvent(new Event(item.event));load();setLastRefresh(new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}))};
  return <section className="admin-panel admin-connectivity-panel"><div className="admin-panel-head"><div><h2>Kiểm tra kết nối dữ liệu</h2><p>Đối chiếu nhanh dữ liệu Admin đang lưu trên trình duyệt và phát tín hiệu cập nhật cho giao diện ngoài.</p></div><button type="button" onClick={refreshAll}>↻ Làm mới kết nối</button></div><div className="admin-connect-summary"><span><b>{healthy}/{rows.length}</b> module có dữ liệu</span><span className={invalid?'bad':'good'}>{invalid?`${invalid} module dữ liệu lỗi`:'Không phát hiện dữ liệu hỏng'}</span>{lastRefresh&&<small>Làm mới lúc {lastRefresh}</small>}</div><div className="admin-connect-grid">{rows.map(row=><article key={row.key} className={`admin-connect-item ${row.state}`}><div><b>{row.label}</b><small>{row.key}</small></div><strong>{row.state==='invalid'?'Lỗi':row.count}</strong><span>{row.state==='ok'?'Đã kết nối':row.state==='empty'?'Chưa có dữ liệu':'JSON không hợp lệ'}</span></article>)}</div><p className="admin-connect-note">Bản GitHub Pages hiện lưu CMS bằng localStorage nên dữ liệu Admin chỉ đồng bộ trong cùng trình duyệt/thiết bị. Khi chuyển hosting, bảng này sẽ được đổi sang kiểm tra API/database chung.</p></section>;
}
