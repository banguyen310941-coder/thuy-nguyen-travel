'use client';

import Link from 'next/link';
import {FormEvent,useEffect,useMemo,useState} from 'react';
import {AdminBookings} from '@/components/AdminBookings';
import {AdminBookingOperations} from '@/components/AdminBookingOperations';
import {AdminServiceOperations} from '@/components/AdminServiceOperations';
import {AdminSupplierOrders} from '@/components/AdminSupplierOrders';
import {AdminCustomerVouchers} from '@/components/AdminCustomerVouchers';
import {AdminBackupCenter} from '@/components/AdminBackupCenter';
import {AdminMarketingBudget} from '@/components/AdminMarketingBudget';
import {AdminMarketingSalesFunnel} from '@/components/AdminMarketingSalesFunnel';
import {AdminAccountingWorkspace} from '@/components/AdminAccountingWorkspace';
import {AdminAttendanceWorkspace} from '@/components/AdminAttendanceWorkspace';
import {AdminAttendanceNotifications} from '@/components/AdminAttendanceNotifications';
import {AdminSalesAvailabilityToggle} from '@/components/AdminSalesAvailabilityToggle';
import {AdminSharedDataStatus} from '@/components/AdminSharedDataStatus';
import {AdminTodayWork} from '@/components/AdminTodayWork';
import {AdminInstallApp} from '@/components/AdminInstallApp';
import {AdminPaymentApprovals} from '@/components/AdminPaymentApprovals';
import {AdminFinancialLedger} from '@/components/AdminFinancialLedger';
import {AdminCustomerReceipts} from '@/components/AdminCustomerReceipts';
import {AdminCustomers} from '@/components/AdminCustomers';
import {AdminCustomerRetention} from '@/components/AdminCustomerRetention';
import {AdminCustomerFeedback} from '@/components/AdminCustomerFeedback';
import {AdminSalesDashboard} from '@/components/AdminSalesDashboard';
import {AdminRevenueDashboard} from '@/components/AdminRevenueDashboard';
import {AdminHomepageEditor} from '@/components/AdminHomepageEditor';
import {AdminContentEditor} from '@/components/AdminContentEditor';
import {AdminProductManagerV3} from '@/components/AdminProductManagerV3';
import {AdminTourEditorSimple} from '@/components/AdminTourEditorSimple';
import {AdminDeleteManager} from '@/components/AdminDeleteManager';
import {AdminMediaManager} from '@/components/AdminMediaLibrary';
import {AdminDrivePanel,AdminSeoPanel,AdminSettingsPanel} from '@/components/AdminUtilityPanels';
import {AdminRateManager} from '@/components/AdminRateManager';
import {AdminConnectivityPanel} from '@/components/AdminConnectivityPanel';
import {AdminProductMigration} from '@/components/AdminProductMigration';
import {AdminEmailCampaigns} from '@/components/AdminEmailCampaigns';
import {AdminStaffManager} from '@/components/AdminStaffManager';
import {AdminTeamChat} from '@/components/AdminTeamChat';
import {AdminNetworkWorkspace} from '@/components/AdminNetworkWorkspace';
import {AdminCrmWorkboard} from '@/components/AdminCrmWorkboard';
import {AdminCrmPipeline} from '@/components/AdminCrmPipeline';
import {AdminChatNotifications} from '@/components/AdminChatNotifications';
import {readCurrentStaff,type AdminStaff} from '@/components/AdminSalesAccess';
import {bootstrapAdmin,checkAdminSession,clearAdminSession,loginAdmin} from '@/components/AdminAuth';

const modules=[
 ['▦','Tổng quan'],['☑','Điều hành Sale'],['🧳','Điều hành dịch vụ'],['🧾','Phiếu thu khách'],['💳','Duyệt & thanh toán'],['📒','Sổ công nợ'],['₫','Kế toán thu chi'],['⏱','Chấm công'],['📈','Doanh thu & Sale'],['💬','Chat nội bộ'],['◎','Khách hàng / CRM'],['🤝','Mạng lưới hợp tác'],['▣','Đơn đặt dịch vụ'],['🎟','Voucher khách hàng'],['♟','Nhân viên & phân quyền'],['✉','Email & Marketing'],['₫','Marketing & ngân sách'],['▤','Sản phẩm'],['▦','Lịch giá & tồn phòng'],['✈','Tour du lịch'],['⌂','Villa & Resort'],['▥','Khách sạn'],['≋','Du thuyền'],['✎','Bài viết / Cẩm nang'],['▧','Media (Ảnh/Video)'],['⌂','Giao diện (Trang chủ)'],['⌕','Cấu hình SEO'],['⇩','Google Drive'],['↧','Sao lưu dữ liệu'],['♲','Thùng rác / Xóa dữ liệu'],['⚙','Cài đặt'],
] as const;
const permission:Record<string,string>={'Điều hành Sale':'customers','Điều hành dịch vụ':'bookings','Phiếu thu khách':'receipts','Duyệt & thanh toán':'payments','Sổ công nợ':'ledger','Kế toán thu chi':'ledger','Chấm công':'attendance','Doanh thu & Sale':'revenue','Khách hàng / CRM':'customers','Mạng lưới hợp tác':'partners','Đơn đặt dịch vụ':'bookings','Voucher khách hàng':'bookings','Nhân viên & phân quyền':'staff','Email & Marketing':'email','Marketing & ngân sách':'email','Sản phẩm':'products','Lịch giá & tồn phòng':'rates','Tour du lịch':'tours','Villa & Resort':'stays','Khách sạn':'stays','Du thuyền':'cruises','Bài viết / Cẩm nang':'content','Media (Ảnh/Video)':'media','Giao diện (Trang chủ)':'settings','Cấu hình SEO':'settings','Google Drive':'settings','Cài đặt':'settings'};
const ownerOnly=['Sao lưu dữ liệu','Thùng rác / Xóa dữ liệu'];
const mobilePrimary=['Tổng quan','Chấm công','Điều hành Sale','Chat nội bộ'];

export default function AdminPage(){
 const[active,setActive]=useState('Tổng quan');
 const[current,setCurrent]=useState<AdminStaff|null>(null);
 const[ready,setReady]=useState(false);
 const[needsBootstrap,setNeedsBootstrap]=useState(false);
 const[email,setEmail]=useState('');
 const[password,setPassword]=useState('');
 const[confirm,setConfirm]=useState('');
 const[adminKey,setAdminKey]=useState('');
 const[ownerName,setOwnerName]=useState('Chủ tài khoản HappyGo');
 const[msg,setMsg]=useState('');
 const[authBusy,setAuthBusy]=useState(false);
 const[mobileMore,setMobileMore]=useState(false);

 useEffect(()=>{
   let alive=true;
   const boot=async()=>{const result=await checkAdminSession();if(!alive)return;if(result.ok&&result.staff)setCurrent(result.staff);else{setCurrent(null);setNeedsBootstrap(Boolean(result.needsBootstrap))}setReady(true)};
   void boot();
   const refresh=()=>{const staff=readCurrentStaff();setCurrent(staff.id?staff:null)};
   window.addEventListener('happygo-admin-auth',refresh);window.addEventListener('tn-staff-updated',refresh);
   return()=>{alive=false;window.removeEventListener('happygo-admin-auth',refresh);window.removeEventListener('tn-staff-updated',refresh)};
 },[]);

 useEffect(()=>{
   if(!current?.id)return;
   const syncFromUrl=()=>{
     const params=new URLSearchParams(window.location.search);
     const networkRequested=params.get('module')==='network';
     const canOpenNetwork=current.role==='owner'||Boolean(current.permissions?.includes('partners')||current.permissions?.includes('affiliates'));
     if(networkRequested&&canOpenNetwork)setActive('Mạng lưới hợp tác');
   };
   syncFromUrl();
   window.addEventListener('popstate',syncFromUrl);
   return()=>window.removeEventListener('popstate',syncFromUrl);
 },[current]);

 async function submitLogin(e:FormEvent){e.preventDefault();setAuthBusy(true);setMsg('');const result=await loginAdmin(email,password);setAuthBusy(false);setMsg(result.message);if(result.ok&&result.staff)setCurrent(result.staff)}
 async function submitBootstrap(e:FormEvent){e.preventDefault();if(password!==confirm)return setMsg('Mật khẩu xác nhận chưa khớp.');setAuthBusy(true);setMsg('');const result=await bootstrapAdmin({adminKey,name:ownerName,email,password});setAuthBusy(false);setMsg(result.message);if(result.ok&&result.staff){setCurrent(result.staff);setNeedsBootstrap(false)}}

 if(!ready)return <main className="admin-login-page admin-production-login"><div className="admin-login-card"><div className="admin-login-logo">HG</div><b>HAPPYGO TRAVEL</b><p>Đang kiểm tra phiên quản trị production...</p></div></main>;
 if(!current?.id){
   return <main className="admin-login-page admin-production-login"><div className="admin-login-branding"><small>HAPPYGO TRAVEL</small><h1>Trung tâm điều hành thống nhất</h1><p>Quản trị, đối tác, booking và dữ liệu vận hành được đưa dần về cùng hệ thống production.</p><div className="admin-login-features"><span>✓ Phiên đăng nhập HttpOnly</span><span>✓ Mật khẩu mã hóa trên server</span><span>✓ Phân quyền theo nhân viên</span></div><Link href="/">← Về website HappyGo</Link></div>{needsBootstrap?<form className="admin-login-card" onSubmit={submitBootstrap}><div className="admin-login-logo">HG</div><small>KÍCH HOẠT QUẢN TRỊ PRODUCTION</small><h1>Tạo Chủ tài khoản</h1><p>Chỉ thực hiện một lần. ADMIN_API_KEY dùng để chứng minh bạn là chủ hệ thống và không được lưu vào hồ sơ nhân viên.</p><label>Khóa nội bộ ADMIN_API_KEY<input type="password" value={adminKey} onChange={e=>setAdminKey(e.target.value)} required autoComplete="off"/></label><label>Tên hiển thị<input value={ownerName} onChange={e=>setOwnerName(e.target.value)} required/></label><label>Email quản trị<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" placeholder="info@happygo.vn"/></label><label>Mật khẩu mới<input type="password" minLength={10} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="new-password"/></label><label>Xác nhận mật khẩu<input type="password" minLength={10} value={confirm} onChange={e=>setConfirm(e.target.value)} required autoComplete="new-password"/></label>{msg&&<div className="admin-login-message">{msg}</div>}<button className="admin-primary" disabled={authBusy}>{authBusy?'Đang kích hoạt...':'Kích hoạt Chủ tài khoản'}</button><small className="admin-login-security">Mật khẩu mới không được đưa vào GitHub hoặc localStorage.</small></form>:<form className="admin-login-card" onSubmit={submitLogin}><div className="admin-login-logo">HG</div><small>HAPPYGO TRAVEL · QUẢN TRỊ</small><h1>Đăng nhập nhân viên</h1><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label><label>Mật khẩu<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>{msg&&<div className="admin-login-message">{msg}</div>}<button className="admin-primary" disabled={authBusy}>{authBusy?'Đang xác thực...':'Đăng nhập'}</button><Link href="/">← Về website</Link></form>}</main>;
 }

 const owner=current.role==='owner';
 const networkAccess=Boolean(current.permissions?.includes('partners')||current.permissions?.includes('affiliates'));
 const allowed=(name:string)=>owner||name==='Tổng quan'||name==='Chat nội bộ'||name==='Chấm công'||(name==='Mạng lưới hợp tác'&&networkAccess)||(!ownerOnly.includes(name)&&Boolean(permission[name]&&current.permissions?.includes(permission[name])));
 const visible=modules.filter(([,name])=>allowed(name));
 const go=(name:string)=>{
  if(!allowed(name))return;
  setActive(name);setMobileMore(false);
  const url=new URL(window.location.href);
  if(name==='Mạng lưới hợp tác'){
   url.searchParams.set('module','network');
   if(!url.searchParams.get('tab'))url.searchParams.set('tab','overview');
  }else{
   url.searchParams.delete('module');
   url.searchParams.delete('tab');
  }
  window.history.replaceState(null,'',url);
  window.scrollTo({top:0,behavior:'smooth'});
 };
 const primary=mobilePrimary.map(name=>visible.find(([,n])=>n===name)).filter(Boolean) as (typeof modules)[number][];
 const more=visible.filter(([,name])=>!mobilePrimary.includes(name));
 const moduleCount=visible.length;

 const content=()=>{
  if(active==='Tổng quan')return <><div className="admin-welcome production"><div><small>TỔNG QUAN ĐIỀU HÀNH</small><h2>{owner?'Trung tâm điều hành HappyGo Travel':`Xin chào ${current.name}`}</h2><p>Tài khoản đang dùng đăng nhập production. Các module được hiển thị theo quyền nghiệp vụ.</p></div><div className="admin-production-badge"><i/>Production secure</div></div><AdminTodayWork open={m=>allowed(m)&&go(m)}/>{allowed('Đơn đặt dịch vụ')&&<><AdminSalesDashboard openBookings={()=>go('Đơn đặt dịch vụ')} openCustomers={()=>go('Khách hàng / CRM')}/><AdminBookingOperations openBookings={()=>go('Đơn đặt dịch vụ')}/></>}{allowed('Điều hành Sale')&&<AdminCrmWorkboard openBookings={()=>go('Đơn đặt dịch vụ')} openCustomers={()=>go('Khách hàng / CRM')}/>} {owner&&<AdminConnectivityPanel/>}</>;
  if(active==='Điều hành Sale')return <><AdminCrmWorkboard openBookings={()=>go('Đơn đặt dịch vụ')} openCustomers={()=>go('Khách hàng / CRM')}/><AdminCrmPipeline openCustomers={()=>go('Khách hàng / CRM')}/><AdminCustomerRetention/></>;
  if(active==='Điều hành dịch vụ')return <><AdminServiceOperations/><AdminSupplierOrders/></>;
  if(active==='Phiếu thu khách')return <AdminCustomerReceipts/>;
  if(active==='Duyệt & thanh toán')return <AdminPaymentApprovals/>;
  if(active==='Sổ công nợ')return <AdminFinancialLedger/>;
  if(active==='Kế toán thu chi')return <AdminAccountingWorkspace/>;
  if(active==='Chấm công')return <AdminAttendanceWorkspace/>;
  if(active==='Doanh thu & Sale')return <AdminRevenueDashboard/>;
  if(active==='Chat nội bộ')return <AdminTeamChat/>;
  if(active==='Khách hàng / CRM')return <><AdminCustomers/><AdminCustomerRetention/><AdminCustomerFeedback/></>;
  if(active==='Mạng lưới hợp tác')return <AdminNetworkWorkspace/>;
  if(active==='Đơn đặt dịch vụ')return <><AdminSupplierOrders/><AdminBookingOperations openBookings={()=>{}}/><AdminBookings/></>;
  if(active==='Voucher khách hàng')return <AdminCustomerVouchers/>;
  if(active==='Nhân viên & phân quyền')return <AdminStaffManager/>;
  if(active==='Email & Marketing')return <AdminEmailCampaigns/>;
  if(active==='Marketing & ngân sách')return <><AdminMarketingBudget/><AdminMarketingSalesFunnel/></>;
  if(active==='Lịch giá & tồn phòng')return <AdminRateManager/>;
  if(active==='Bài viết / Cẩm nang')return <AdminContentEditor/>;
  if(active==='Tour du lịch')return <AdminTourEditorSimple/>;
  if(active==='Sản phẩm')return <AdminProductManagerV3 type="Sản phẩm"/>;
  if(['Villa & Resort','Khách sạn','Du thuyền'].includes(active))return <AdminProductManagerV3 type={active as 'Villa & Resort'|'Khách sạn'|'Du thuyền'}/>;
  if(active==='Giao diện (Trang chủ)')return <AdminHomepageEditor/>;
  if(active==='Thùng rác / Xóa dữ liệu'&&owner)return <AdminDeleteManager/>;
  if(active==='Media (Ảnh/Video)')return <AdminMediaManager/>;
  if(active==='Cấu hình SEO')return <AdminSeoPanel/>;
  if(active==='Google Drive')return <AdminDrivePanel/>;
  if(active==='Sao lưu dữ liệu'&&owner)return <AdminBackupCenter/>;
  if(active==='Cài đặt')return <AdminSettingsPanel/>;
  return <div className="admin-empty-state">Module này chưa khả dụng với tài khoản hiện tại.</div>;
 };

 return <div className="admin-app admin-production-shell"><AdminProductMigration/><aside className="admin-sidebar"><div className="admin-brand"><span>HG</span><div><b>HAPPYGO</b><small>TRAVEL ADMIN</small></div></div><div className="admin-sidebar-user"><small>PRODUCTION</small><b>{current.name}</b><span>{owner?'Chủ tài khoản':current.department||current.role}</span></div><nav>{visible.map(([icon,name])=><button key={name} className={active===name?'active':''} onClick={()=>go(name)}><i>{icon}</i><span>{name}</span></button>)}</nav><Link className="admin-back" href="/">← Xem website</Link></aside><nav className="admin-mobile-nav">{primary.map(([icon,name])=><button key={name} className={active===name&&!mobileMore?'active':''} onClick={()=>go(name)}><i>{icon}</i><span>{name==='Điều hành Sale'?'Sale':name==='Chat nội bộ'?'Chat':name}</span></button>)}<button className={mobileMore||!mobilePrimary.includes(active)?'active':''} onClick={()=>setMobileMore(true)}><i>☰</i><span>Thêm</span></button></nav>{mobileMore&&<div className="admin-mobile-more-overlay" onClick={()=>setMobileMore(false)}><section className="admin-mobile-more" onClick={e=>e.stopPropagation()}><div className="admin-mobile-more-head"><div><small>HAPPYGO TRAVEL</small><h3>Chức năng khác</h3></div><button onClick={()=>setMobileMore(false)}>×</button></div><div className="admin-mobile-more-grid">{more.map(([icon,name])=><button key={name} className={active===name?'active':''} onClick={()=>go(name)}><i>{icon}</i><span>{name}</span></button>)}</div><div className="admin-mobile-account"><div><b>{current.name}</b><small>{owner?'Chủ tài khoản':current.department||current.role}</small></div><button onClick={()=>{clearAdminSession();setCurrent(null);setMobileMore(false)}}>Đăng xuất</button></div></section></div>}<main className="admin-main"><header className="admin-top"><div><small>HAPPYGO TRAVEL / QUẢN TRỊ PRODUCTION</small><h1>{active}</h1><span className="admin-module-count">{moduleCount} module được cấp quyền</span></div><div className="admin-top-actions"><AdminSharedDataStatus staff={current}/><AdminSalesAvailabilityToggle staff={current}/><AdminInstallApp/><AdminChatNotifications staffId={current.id} isOwner={owner} onOpen={m=>allowed(m)&&go(m)}/><AdminAttendanceNotifications staffId={current.id} onOpen={()=>go('Chấm công')}/><div className="admin-identity"><small>ĐANG ĐĂNG NHẬP</small><b>{current.name}</b><span>{owner?'Chủ tài khoản':current.department||current.role}</span></div><button onClick={()=>{clearAdminSession();setCurrent(null)}}>Đăng xuất</button></div></header>{allowed(active)?content():null}</main></div>;
}
