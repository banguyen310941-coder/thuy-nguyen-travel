'use client';

import {useMemo,useState} from 'react';
import {extractCoordinates,googleMapsEmbedUrl,productCoordinates,productLocationIssues} from '@/lib/product-location';

type Props={form:any;setField:(key:string,value:any)=>void;kind:'stay'|'cruise'};

export function ProductLocationFields({form,setField,kind}:Props){
 const[mapInput,setMapInput]=useState('');
 const[message,setMessage]=useState('');
 const location=useMemo(()=>({place:form.place,address:form.address,boarding:form.boarding,pickup:form.pickup,latitude:form.latitude,longitude:form.longitude}),[form.place,form.address,form.boarding,form.pickup,form.latitude,form.longitude]);
 const embed=googleMapsEmbedUrl(location),coordinates=productCoordinates(location),issues=productLocationIssues(location);
 const applyMapInput=()=>{const parsed=extractCoordinates(mapInput);if(!parsed){setMessage('Chưa đọc được tọa độ. Hãy dán “20.9712, 107.0448” hoặc link Google Maps có dạng @20.9712,107.0448.');return}setField('latitude',parsed.latitude);setField('longitude',parsed.longitude);setMessage('Đã ghim tọa độ chính xác trên bản đồ.')};
 const useCurrent=()=>{if(!navigator.geolocation){setMessage('Trình duyệt này không hỗ trợ lấy vị trí hiện tại.');return}setMessage('Đang lấy vị trí hiện tại…');navigator.geolocation.getCurrentPosition(position=>{setField('latitude',Number(position.coords.latitude.toFixed(7)));setField('longitude',Number(position.coords.longitude.toFixed(7)));setMessage('Đã dùng vị trí hiện tại làm ghim bản đồ.')},()=>setMessage('Không lấy được vị trí. Hãy cho phép truy cập vị trí hoặc nhập tọa độ thủ công.'),{enableHighAccuracy:true,timeout:12000,maximumAge:60000})};
 return <section className="pm-section product-location-editor"><div className="product-flow-heading"><div><small>VỊ TRÍ CHÍNH XÁC · DÙNG CHO BẢN ĐỒ & TÌM GẦN ĐÂY</small><h3>2. Vị trí trên bản đồ *</h3><p>Nhập khu vực, địa chỉ và ghim chính xác như luồng đặt phòng. Sản phẩm mới sẽ không thể đăng nếu chưa có đủ vị trí.</p></div><span className={`product-flow-badge ${issues.length?'location-missing':'location-ready'}`}>{issues.length?`Thiếu ${issues.length} mục`:'✓ Đủ vị trí'}</span></div>
  <div className="pm-grid product-location-grid">
   <label className="pm-field"><span>Khu vực / điểm đến *</span><input value={String(form.place||'')} onChange={e=>setField('place',e.target.value)} placeholder={kind==='cruise'?'VD: Vịnh Hạ Long, Quảng Ninh':'VD: Sầm Sơn, Thanh Hóa'}/><small>Dùng để nhóm các sản phẩm cùng khu vực khi khách tìm kiếm.</small></label>
   <label className="pm-field"><span>{kind==='cruise'?'Bến / điểm lên tàu *':'Địa chỉ chi tiết *'}</span><input value={String(kind==='cruise'?(form.boarding||form.pickup||''):form.address||'')} onChange={e=>{if(kind==='cruise'){setField('boarding',e.target.value);setField('pickup',e.target.value)}else setField('address',e.target.value)}} placeholder={kind==='cruise'?'VD: Cảng tàu khách quốc tế Hạ Long, Bãi Cháy':'Số nhà, đường, phường/xã, tỉnh/thành'}/></label>
   <label className="pm-field"><span>Vĩ độ (Latitude) *</span><input inputMode="decimal" value={form.latitude??''} onChange={e=>setField('latitude',e.target.value)} placeholder="20.971245"/></label>
   <label className="pm-field"><span>Kinh độ (Longitude) *</span><input inputMode="decimal" value={form.longitude??''} onChange={e=>setField('longitude',e.target.value)} placeholder="107.044812"/></label>
   <label className="pm-field wide"><span>Dán tọa độ hoặc link Google Maps</span><div className="product-map-paste"><input value={mapInput} onChange={e=>setMapInput(e.target.value)} placeholder="20.971245, 107.044812 hoặc https://www.google.com/maps/.../@20.971245,107.044812,..."/><button type="button" onClick={applyMapInput}>Ghim từ Maps</button><button type="button" onClick={useCurrent}>Vị trí hiện tại</button></div><small>Không cần API Google Places. Có thể dán link Maps đầy đủ hoặc cặp tọa độ.</small></label>
  </div>
  {message&&<p className="product-location-message" role="status">{message}</p>}
  {embed?<div className="admin-product-map-preview"><iframe title="Xem trước vị trí sản phẩm" src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/><div><b>{coordinates?'✓ Ghim chính xác':'Xem trước theo địa chỉ'}</b><span>{String(kind==='cruise'?(form.boarding||form.pickup||form.place||''):form.address||form.place||'')}</span></div></div>:<div className="admin-location-empty">Nhập địa chỉ để xem trước bản đồ. Trước khi đăng cần thêm tọa độ chính xác.</div>}
  {issues.length?<p className="pm-section-note strong">Còn thiếu để xuất bản: {issues.join(' · ')}.</p>:<p className="pm-section-note strong">Vị trí đã sẵn sàng để hiển thị bản đồ và xếp sản phẩm gần nhau.</p>}
 </section>;
}
