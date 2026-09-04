'use client';

import Link from 'next/link';
import {FormEvent,useEffect,useState} from 'react';
import {HappyGoLogo} from '@/components/HappyGoLogo';
import {PartnerProductionPortal} from '@/components/PartnerProductionPortal';

type Mode='login'|'register';

type LoginForm={email:string;password:string};
type RegisterForm={companyName:string;contactName:string;phone:string;email:string;password:string;confirm:string};

export function PartnerEntryPage(){
  const[checking,setChecking]=useState(true);
  const[authenticated,setAuthenticated]=useState(false);
  const[mode,setMode]=useState<Mode>('login');
  const[busy,setBusy]=useState(false);
  const[message,setMessage]=useState('');
  const[login,setLogin]=useState<LoginForm>({email:'',password:''});
  const[register,setRegister]=useState<RegisterForm>({companyName:'',contactName:'',phone:'',email:'',password:'',confirm:''});

  useEffect(()=>{
    let active=true;
    fetch('/api/partner/me',{cache:'no-store'})
      .then(r=>{if(active)setAuthenticated(r.ok)})
      .catch(()=>{if(active)setMessage('Không kiểm tra được phiên đăng nhập. Bạn vẫn có thể thử đăng nhập lại.')})
      .finally(()=>{if(active)setChecking(false)});
    return()=>{active=false};
  },[]);

  async function submit(endpoint:string,payload:unknown){
    setBusy(true);setMessage('');
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){setMessage(data.error||'Không thể xử lý yêu cầu. Vui lòng thử lại.');return}
      setAuthenticated(true);
    }catch{
      setMessage('Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.');
    }finally{setBusy(false)}
  }

  async function doLogin(e:FormEvent){e.preventDefault();await submit('/api/partner/auth/login',login)}
  async function doRegister(e:FormEvent){
    e.preventDefault();
    if(register.password!==register.confirm){setMessage('Mật khẩu xác nhận chưa khớp.');return}
    await submit('/api/partner/auth/register',{companyName:register.companyName,contactName:register.contactName,phone:register.phone,email:register.email,password:register.password});
  }

  if(authenticated)return <PartnerProductionPortal/>;

  return <main className="partner-entry-shell">
    <header className="partner-entry-topbar">
      <Link href="/" className="partner-entry-brand" aria-label="Về website HappyGo Travel"><HappyGoLogo compact/><span>CỔNG ĐỐI TÁC</span></Link>
      <div className="partner-entry-top-actions"><a href="mailto:info@happygo.vn">info@happygo.vn</a><a href="tel:0969973949">0969 973 949</a><Link href="/">Về website</Link></div>
    </header>

    <div className="partner-entry-grid">
      <section className="partner-entry-intro">
        <span className="partner-entry-kicker">HỢP TÁC CÙNG HAPPYGO TRAVEL</span>
        <h1>Đưa dịch vụ của bạn lên HappyGo, quản lý tập trung trên một cổng duy nhất.</h1>
        <p>Phù hợp cho khách sạn, villa, resort, du thuyền và đơn vị tour muốn quản lý hồ sơ, sản phẩm, bảng giá và trao đổi với HappyGo.</p>

        <div className="partner-entry-benefits">
          <article><b>01</b><div><strong>Gửi sản phẩm để duyệt</strong><span>Tạo sản phẩm, cập nhật nội dung và theo dõi trạng thái duyệt ngay trong tài khoản.</span></div></article>
          <article><b>02</b><div><strong>Quản lý giá & tình trạng</strong><span>Lưu bảng giá theo sản phẩm, đồng bộ dữ liệu dùng chung trên mọi thiết bị.</span></div></article>
          <article><b>03</b><div><strong>Kết nối trực tiếp với HappyGo</strong><span>Hồ sơ và sản phẩm đi thẳng tới Quản trị; chỉ dữ liệu đã duyệt mới xuất hiện trên website.</span></div></article>
        </div>

        <div className="partner-entry-flow" aria-label="Quy trình hợp tác">
          <span><i>1</i>Đăng ký</span><em>→</em><span><i>2</i>HappyGo duyệt</span><em>→</em><span><i>3</i>Đăng sản phẩm</span>
        </div>
      </section>

      <aside className="partner-entry-card">
        <div className="partner-entry-card-head">
          <small>HAPPYGO PARTNER</small>
          <h2>{mode==='login'?'Đăng nhập cổng đối tác':'Đăng ký đối tác mới'}</h2>
          <p>{mode==='login'?'Dùng email doanh nghiệp đã đăng ký với HappyGo.':'Tạo tài khoản để bắt đầu gửi hồ sơ và sản phẩm.'}</p>
        </div>

        <div className="partner-entry-tabs" role="tablist" aria-label="Đăng nhập hoặc đăng ký">
          <button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setMessage('')}}>Đăng nhập</button>
          <button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setMessage('')}}>Đăng ký đối tác</button>
        </div>

        {checking?<div className="partner-entry-checking"><span/><b>Đang kiểm tra phiên đăng nhập...</b></div>:mode==='login'?<form className="partner-entry-form" onSubmit={doLogin}>
          <label>Email đăng nhập<input type="email" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} placeholder="ten@doanhnghiep.vn" autoComplete="email" required/></label>
          <label>Mật khẩu<input type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Nhập mật khẩu" autoComplete="current-password" required/></label>
          {message&&<div className="partner-entry-message" role="alert">{message}</div>}
          <button className="partner-entry-primary" disabled={busy}>{busy?'Đang đăng nhập...':'Đăng nhập cổng đối tác'}</button>
          <p className="partner-entry-switch">Chưa có tài khoản? <button type="button" onClick={()=>{setMode('register');setMessage('')}}>Đăng ký đối tác</button></p>
        </form>:<form className="partner-entry-form" onSubmit={doRegister}>
          <div className="partner-entry-row">
            <label>Tên doanh nghiệp<input value={register.companyName} onChange={e=>setRegister({...register,companyName:e.target.value})} placeholder="Tên đơn vị / thương hiệu" autoComplete="organization" required/></label>
            <label>Người liên hệ<input value={register.contactName} onChange={e=>setRegister({...register,contactName:e.target.value})} placeholder="Họ và tên" autoComplete="name" required/></label>
          </div>
          <div className="partner-entry-row">
            <label>Số điện thoại<input value={register.phone} onChange={e=>setRegister({...register,phone:e.target.value})} placeholder="09xx xxx xxx" autoComplete="tel" required/></label>
            <label>Email<input type="email" value={register.email} onChange={e=>setRegister({...register,email:e.target.value})} placeholder="ten@doanhnghiep.vn" autoComplete="email" required/></label>
          </div>
          <div className="partner-entry-row">
            <label>Mật khẩu<input type="password" minLength={8} value={register.password} onChange={e=>setRegister({...register,password:e.target.value})} placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" required/></label>
            <label>Xác nhận mật khẩu<input type="password" minLength={8} value={register.confirm} onChange={e=>setRegister({...register,confirm:e.target.value})} placeholder="Nhập lại mật khẩu" autoComplete="new-password" required/></label>
          </div>
          {message&&<div className="partner-entry-message" role="alert">{message}</div>}
          <button className="partner-entry-primary" disabled={busy}>{busy?'Đang tạo tài khoản...':'Tạo tài khoản đối tác'}</button>
          <p className="partner-entry-register-note">Sau khi đăng ký, hồ sơ sẽ ở trạng thái <b>Chờ HappyGo duyệt</b>. Bạn có thể tiếp tục hoàn thiện hồ sơ và chuẩn bị sản phẩm trong cổng đối tác.</p>
          <p className="partner-entry-switch">Đã có tài khoản? <button type="button" onClick={()=>{setMode('login');setMessage('')}}>Đăng nhập</button></p>
        </form>}

        <footer className="partner-entry-support"><span>Cần hỗ trợ đăng nhập hoặc đăng ký?</span><div><a href="tel:0969973949">☎ 0969 973 949</a><a href="mailto:info@happygo.vn">✉ info@happygo.vn</a></div></footer>
      </aside>
    </div>

    <div className="partner-entry-foot">HappyGo Partner · Phiên đăng nhập bảo mật trên server · Dữ liệu đồng bộ production</div>
  </main>;
}
