'use client';

import {useMemo,useState} from 'react';
import {AdminMediaPicker} from '@/components/AdminMediaLibrary';

export type UnitPricingBasis='room_night'|'unit_night'|'cabin_night'|'guest'|'package';
export type UnitGuestType='adult'|'child'|'all';
export type UnifiedUnitStatus='available'|'hold'|'soldout'|'hidden';
export type UnifiedUnit={
  id:string;
  code:string;
  name:string;
  bedrooms:string;
  beds:string;
  capacity:string;
  area:string;
  view:string;
  meal:string;
  amenities:string;
  weekdayPrice:string;
  weekendPrice:string;
  holidayPrice:string;
  lowWeekdayPrice?:string;
  lowWeekendPrice?:string;
  highWeekdayPrice?:string;
  highWeekendPrice?:string;
  extraAdult:string;
  extraChild:string;
  images:string;
  status:UnifiedUnitStatus;
  note:string;
  pricingBasis?:UnitPricingBasis;
  guestType?:UnitGuestType;
};
export type UnifiedUnitKind='hotel'|'villa'|'cruise'|'tour'|'generic';

const uid=()=>`u_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
export const blankUnifiedUnit=():UnifiedUnit=>({
  id:uid(),code:'',name:'',bedrooms:'',beds:'',capacity:'',area:'',view:'',meal:'',amenities:'',
  weekdayPrice:'',weekendPrice:'',holidayPrice:'',lowWeekdayPrice:'',lowWeekendPrice:'',highWeekdayPrice:'',highWeekendPrice:'',
  extraAdult:'',extraChild:'',images:'',status:'available',note:'',pricingBasis:undefined,guestType:undefined
});

const hotelPresets:Array<Partial<UnifiedUnit>&{label:string}>=[
  {label:'Standard',name:'Standard',beds:'1 Double / 2 Twin',capacity:'2 người lớn',pricingBasis:'room_night'},
  {label:'Deluxe',name:'Deluxe',beds:'1 King / 2 Twin',capacity:'2 người lớn + 1 trẻ em',pricingBasis:'room_night'},
  {label:'Suite',name:'Suite',beds:'1 King',capacity:'2 người lớn + 1 trẻ em',pricingBasis:'room_night'}
];
const villaPresets:Array<Partial<UnifiedUnit>&{label:string}>=[
  {label:'Villa 2PN',name:'Villa 2 phòng ngủ',bedrooms:'2',capacity:'4 người lớn + 2 trẻ em',pricingBasis:'unit_night'},
  {label:'Villa 3PN',name:'Villa 3 phòng ngủ',bedrooms:'3',capacity:'6 người lớn + 2 trẻ em',pricingBasis:'unit_night'},
  {label:'Villa 4PN',name:'Villa 4 phòng ngủ',bedrooms:'4',capacity:'8 người lớn + 4 trẻ em',pricingBasis:'unit_night'}
];
const presets:Record<UnifiedUnitKind,Array<Partial<UnifiedUnit>&{label:string}>>={
  hotel:hotelPresets,
  villa:villaPresets,
  cruise:[
    {label:'Deluxe Cabin',name:'Deluxe Cabin',capacity:'2 người lớn',pricingBasis:'cabin_night'},
    {label:'Executive Cabin',name:'Executive Cabin',capacity:'2 người lớn + 1 trẻ em',pricingBasis:'cabin_night'},
    {label:'Suite Cabin',name:'Suite Cabin',capacity:'2 người lớn + 1 trẻ em',pricingBasis:'cabin_night'}
  ],
  tour:[
    {label:'Người lớn',name:'Vé người lớn',capacity:'1 khách',pricingBasis:'guest',guestType:'adult'},
    {label:'Trẻ em',name:'Vé trẻ em',capacity:'1 khách',pricingBasis:'guest',guestType:'child'},
    {label:'Tour riêng',name:'Gói tour riêng',capacity:'Theo đoàn',pricingBasis:'package'}
  ],
  generic:[...hotelPresets,...villaPresets]
};

function F({label,children,wide=false}:{label:string;children:React.ReactNode;wide?:boolean}){
  return <label className={wide?'unified-unit-field wide':'unified-unit-field'}><span>{label}</span>{children}</label>;
}
function firstImage(v:string){return String(v||'').split(/\n+/).map(x=>x.trim()).find(Boolean)||''}
function defaultBasis(kind:UnifiedUnitKind):UnitPricingBasis{return kind==='villa'?'unit_night':kind==='cruise'?'cabin_night':kind==='tour'?'guest':'room_night'}
function summaryPrice(u:UnifiedUnit){return u.lowWeekdayPrice||u.weekdayPrice||u.highWeekdayPrice||u.lowWeekendPrice||u.weekendPrice||u.highWeekendPrice||u.holidayPrice||'Chưa có giá'}

function StaySeasonPriceMatrix({unit,setUnit}:{unit:UnifiedUnit;setUnit:(key:keyof UnifiedUnit,value:any)=>void}){
  return <div className="season-price-matrix">
    <div className="season-price-matrix-head"><b>Bảng giá theo mùa</b><small>Trong mỗi mùa, nhập riêng giá trong tuần và cuối tuần. Lịch giá bên dưới chỉ cần xác định khoảng ngày thuộc mùa nào.</small></div>
    <div className="season-price-row low">
      <div><strong>Mùa thấp điểm</strong><small>Khoảng ngày ít khách / mùa thấp điểm</small></div>
      <F label="Trong tuần"><input inputMode="numeric" value={unit.lowWeekdayPrice||''} onChange={e=>setUnit('lowWeekdayPrice',e.target.value)} placeholder="VD: 1.200.000đ"/></F>
      <F label="Cuối tuần (T6–T7)"><input inputMode="numeric" value={unit.lowWeekendPrice||''} onChange={e=>setUnit('lowWeekendPrice',e.target.value)} placeholder="VD: 1.500.000đ"/></F>
    </div>
    <div className="season-price-row regular">
      <div><strong>Mùa thường</strong><small>Mức giá tiêu chuẩn khi không thuộc thấp/cao điểm</small></div>
      <F label="Trong tuần"><input inputMode="numeric" value={unit.weekdayPrice} onChange={e=>setUnit('weekdayPrice',e.target.value)} placeholder="VD: 1.500.000đ"/></F>
      <F label="Cuối tuần (T6–T7)"><input inputMode="numeric" value={unit.weekendPrice} onChange={e=>setUnit('weekendPrice',e.target.value)} placeholder="VD: 1.800.000đ"/></F>
    </div>
    <div className="season-price-row high">
      <div><strong>Mùa cao điểm</strong><small>Hè, mùa du lịch hoặc khoảng cao điểm riêng</small></div>
      <F label="Trong tuần"><input inputMode="numeric" value={unit.highWeekdayPrice||''} onChange={e=>setUnit('highWeekdayPrice',e.target.value)} placeholder="VD: 2.000.000đ"/></F>
      <F label="Cuối tuần (T6–T7)"><input inputMode="numeric" value={unit.highWeekendPrice||''} onChange={e=>setUnit('highWeekendPrice',e.target.value)} placeholder="VD: 2.500.000đ"/></F>
    </div>
    <div className="season-price-row holiday">
      <div><strong>Lễ / Tết</strong><small>Ưu tiên cao nhất khi ngày thuộc kỳ lễ/Tết</small></div>
      <F label="Giá Lễ / Tết"><input inputMode="numeric" value={unit.holidayPrice} onChange={e=>setUnit('holidayPrice',e.target.value)} placeholder="VD: 3.000.000đ"/></F>
      <div className="season-price-help">Nếu một dịp lễ có giá đặc biệt khác mức này, có thể nhập giá ghi đè ở Lịch giá theo ngày.</div>
    </div>
  </div>;
}

export function UnifiedProductUnitsEditor({units,onChange,label='Đơn vị bán & giá',kind='generic'}:{units:UnifiedUnit[];onChange:(units:UnifiedUnit[])=>void;label?:string;kind?:UnifiedUnitKind}){
  const[open,setOpen]=useState<string|null>(null);
  const list=Array.isArray(units)?units:[];
  const options=useMemo(()=>presets[kind]||[],[kind]);
  const noun=kind==='hotel'?'hạng phòng':kind==='villa'?'căn villa':kind==='cruise'?'cabin':kind==='tour'?'gói/vé tour':'đơn vị bán';
  const setUnit=(id:string,k:keyof UnifiedUnit,v:any)=>onChange(list.map(u=>u.id===id?{...u,[k]:v}:u));
  const add=(preset?:Partial<UnifiedUnit>)=>{const u={...blankUnifiedUnit(),pricingBasis:defaultBasis(kind),...(preset||{}),id:uid()};onChange([...list,u]);setOpen(u.id)};
  const duplicate=(u:UnifiedUnit)=>{const x={...u,id:uid(),code:u.code?`${u.code}-COPY`:'',name:`${u.name||noun} - Bản sao`};onChange([...list,x]);setOpen(x.id)};
  const remove=(u:UnifiedUnit)=>{if(!confirm(`Xóa ${u.name||u.code||noun} này?`))return;onChange(list.filter(x=>x.id!==u.id));if(open===u.id)setOpen(null)};
  const isStayKind=kind!=='tour';

  return <div className={`unified-units-editor kind-${kind}`}>
    <div className="unified-unit-head"><div><h3>{label}</h3><p>Mỗi {noun} có mã, ảnh, bảng giá theo mùa, sức chứa và trạng thái bán riêng.</p></div><button type="button" onClick={()=>add()}>+ Thêm {noun}</button></div>
    {options.length>0&&<div className="unified-unit-presets"><span>Thêm nhanh:</span>{options.map(p=><button type="button" key={p.label} onClick={()=>{const {label:_,...data}=p;add(data)}}>+ {p.label}</button>)}</div>}
    {!list.length&&<div className="unified-unit-empty"><b>Chưa có {noun}</b><span>Thêm đơn vị bán để quản lý giá, tồn và booking theo cùng một chuẩn.</span></div>}
    <div className="unified-unit-list">{list.map((u,i)=>{const thumb=firstImage(u.images);return <article key={u.id} className={open===u.id?'open':''}>
      <button type="button" className="unified-unit-summary" onClick={()=>setOpen(open===u.id?null:u.id)}>{thumb?<img className="unified-unit-thumb" src={thumb} alt=""/>:<span>{i+1}</span>}<div><b>{u.name||`Chưa đặt tên ${noun}`}</b><small>{u.code||'Chưa có mã'} · {u.capacity||'Chưa nhập sức chứa'}</small></div><strong>{summaryPrice(u)}</strong><em>{u.status==='available'?'Đang bán':u.status==='hold'?'Tạm giữ':u.status==='soldout'?'Hết':'Ẩn'}</em></button>
      {open===u.id&&<div className="unified-unit-form">
        <div className="unified-unit-block"><h4>1. Thông tin {noun}</h4><div className="unified-unit-grid">
          <F label="Mã"><input value={u.code} onChange={e=>setUnit(u.id,'code',e.target.value)}/></F>
          <F label="Tên"><input value={u.name} onChange={e=>setUnit(u.id,'name',e.target.value)}/></F>
          <F label="Sức chứa"><input value={u.capacity} onChange={e=>setUnit(u.id,'capacity',e.target.value)}/></F>
          {kind!=='tour'&&<><F label="Số phòng ngủ"><input value={u.bedrooms} onChange={e=>setUnit(u.id,'bedrooms',e.target.value)}/></F><F label="Loại giường"><input value={u.beds} onChange={e=>setUnit(u.id,'beds',e.target.value)}/></F><F label="Diện tích"><input value={u.area} onChange={e=>setUnit(u.id,'area',e.target.value)}/></F><F label="View"><input value={u.view} onChange={e=>setUnit(u.id,'view',e.target.value)}/></F><F label="Bữa ăn"><input value={u.meal} onChange={e=>setUnit(u.id,'meal',e.target.value)}/></F></>}
        </div></div>
        <div className="unified-unit-block price"><h4>2. Giá</h4><div className="unified-unit-grid pricing-meta-grid">
          <F label="Cách tính giá"><select value={u.pricingBasis||defaultBasis(kind)} onChange={e=>{const v=e.target.value as UnitPricingBasis;onChange(list.map(x=>x.id===u.id?{...x,pricingBasis:v,guestType:v==='guest'?(x.guestType||'all'):undefined}:x))}}><option value="room_night">Phòng / đêm</option><option value="unit_night">Căn / đêm</option><option value="cabin_night">Cabin / đêm</option><option value="guest">Theo khách</option><option value="package">Theo gói</option></select></F>
          {u.pricingBasis==='guest'||(!u.pricingBasis&&defaultBasis(kind)==='guest')?<F label="Loại khách"><select value={u.guestType||'all'} onChange={e=>setUnit(u.id,'guestType',e.target.value as UnitGuestType)}><option value="all">Tất cả khách</option><option value="adult">Người lớn</option><option value="child">Trẻ em</option></select></F>:null}
        </div>
        {isStayKind?<StaySeasonPriceMatrix unit={u} setUnit={(key,value)=>setUnit(u.id,key,value)}/>:<div className="unified-unit-grid"><F label="Giá cơ bản"><input value={u.weekdayPrice} onChange={e=>setUnit(u.id,'weekdayPrice',e.target.value)}/></F><F label="Giá cuối tuần / cao điểm"><input value={u.weekendPrice} onChange={e=>setUnit(u.id,'weekendPrice',e.target.value)}/></F><F label="Giá lễ/Tết"><input value={u.holidayPrice} onChange={e=>setUnit(u.id,'holidayPrice',e.target.value)}/></F></div>}
        <div className="unified-unit-grid price-extra-grid"><F label="Phụ thu người lớn"><input value={u.extraAdult} onChange={e=>setUnit(u.id,'extraAdult',e.target.value)}/></F><F label="Phụ thu trẻ em"><input value={u.extraChild} onChange={e=>setUnit(u.id,'extraChild',e.target.value)}/></F><F label="Trạng thái"><select value={u.status} onChange={e=>setUnit(u.id,'status',e.target.value as UnifiedUnitStatus)}><option value="available">Còn bán</option><option value="hold">Tạm giữ</option><option value="soldout">Hết</option><option value="hidden">Ẩn</option></select></F></div>
        </div>
        <div className="unified-unit-block media"><h4>3. Ảnh riêng</h4><AdminMediaPicker multiple value={u.images} onChange={v=>setUnit(u.id,'images',v)} label={`Chọn / tải ảnh ${noun}`}/></div>
        <div className="unified-unit-block"><h4>4. Tiện ích & ghi chú</h4><div className="unified-unit-grid"><F label="Bao gồm / tiện ích" wide><textarea rows={3} value={u.amenities} onChange={e=>setUnit(u.id,'amenities',e.target.value)}/></F><F label="Ghi chú nội bộ" wide><textarea rows={3} value={u.note} onChange={e=>setUnit(u.id,'note',e.target.value)}/></F></div></div>
        <div className="unified-unit-actions"><button type="button" onClick={()=>duplicate(u)}>Nhân bản</button><button type="button" className="danger" onClick={()=>remove(u)}>Xóa</button></div>
      </div>}
    </article>})}</div>
  </div>;
}
