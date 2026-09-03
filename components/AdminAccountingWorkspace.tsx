'use client';

import {useEffect,useMemo,useState} from 'react';
import {hasPermission,isAccountingStaff,isAdminStaff,isOwner,money,readCurrentStaff,type AdminStaff} from '@/components/AdminSalesAccess';

type EntryType='income'|'expense';
type FundId='cash'|'bank'|'wallet';
type SourceId='receipt'|'supplier'|'marketing'|'manual';
type Tab='overview'|'ledger'|'settings';

type ManualEntry={
  id:string;voucherNo:string;type:EntryType;date:string;category:string;description:string;
  counterparty:string;fund:FundId;amount:number;documentRef:string;note:string;
  createdById:string;createdByName:string;createdAt:string;voidedAt?:string;voidedBy?:string;voidReason?:string;
};
type Receipt={id:string;receiptNo?:string;bookingCode:string;customerName:string;amount:number;receivedAt:string;method:string;transactionRef:string;note:string;createdByName:string;createdAt:string};
type Payment={id:string;bookingCode:string;supplierName:string;amount:number;purpose:string;status:string;paidAmount?:number;paidAt?:string;paymentMethod?:string;transactionRef?:string;accountingNote?:string;paidBy?:string;createdAt:string};
type MarketingExpense={id:string;campaign:string;date:string;category:string;channel:string;vendor:string;amount:number;documentRef:string;note:string;createdByName:string;createdAt:string};
type OpeningBalances={cash:number;bank:number;wallet:number;updatedAt?:string;updatedBy?:string};
type LedgerRow={id:string;voucherNo:string;type:EntryType;date:string;category:string;description:string;counterparty:string;fund:FundId;amount:number;documentRef:string;note:string;source:SourceId;createdBy:string;createdAt:string;manualId?:string};
type Draft={type:EntryType;date:string;category:string;description:string;counterparty:string;fund:FundId;amount:string;documentRef:string;note:string};

const MANUAL_KEY='happygo_accounting_manual_entries_v1';
const BALANCE_KEY='happygo_accounting_opening_balances_v1';
const RECEIPTS_KEY='happygo_customer_receipts_v1';
const PAYMENTS_KEY='happygo_payment_requests_v1';
const MARKETING_KEY='happygo_marketing_expenses_v1';
const EVENT='happygo-accounting-updated';
const fundLabel:Record<FundId,string>={cash:'Tiền mặt',bank:'Tài khoản ngân hàng',wallet:'Ví điện tử'};
const sourceLabel:Record<SourceId,string>={receipt:'Phiếu thu khách',supplier:'Thanh toán NCC',marketing:'Chi phí Marketing',manual:'Kế toán ghi tay'};
const incomeCategories=['Thu khác','Bổ sung vốn','Hoàn ứng','Thu hồi công nợ','Lãi tiền gửi'];
const expenseCategories=['Chi văn phòng','Lương & phụ cấp','Thuế & phí','Đi lại & công tác','Hoàn tiền khách','Tạm ứng','Chi phí khác'];

function currentMonth(){return new Date().toISOString().slice(0,7)}
function today(){return new Date().toISOString().slice(0,10)}
function blankDraft():Draft{return{type:'income',date:today(),category:incomeCategories[0],description:'',counterparty:'',fund:'bank',amount:'',documentRef:'',note:''}}
function read<T>(key:string,fallback:T):T{try{const value=JSON.parse(localStorage.getItem(key)||'');return value??fallback}catch{return fallback}}
function write<T>(key:string,value:T){localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event(EVENT))}
function parseAmount(value:unknown){const parsed=Number(String(value??'').replace(/[^\d]/g,''));return Number.isFinite(parsed)?parsed:0}
function dateOnly(value?:string){return String(value||today()).slice(0,10)}
function formatDate(value:string){const parsed=new Date(`${value}T00:00:00`);return Number.isNaN(+parsed)?value:parsed.toLocaleDateString('vi-VN')}
function inferFund(method?:string):FundId{const text=String(method||'').toLowerCase();if(text.includes('tiền mặt'))return'cash';if(text.includes('ví')||text.includes('momo')||text.includes('zalopay'))return'wallet';return'bank'}
function voucherNo(type:EntryType){const now=new Date(),stamp=`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;return`${type==='income'?'PT':'PC'}-${stamp}-${String(Date.now()).slice(-5)}`}
function escapeHtml(value:unknown){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char))}
function signed(row:LedgerRow){return row.type==='income'?row.amount:-row.amount}

export function AdminAccountingWorkspace(){
  const[staff,setStaff]=useState<AdminStaff|null>(null);
  const[manualEntries,setManualEntries]=useState<ManualEntry[]>([]);
  const[receipts,setReceipts]=useState<Receipt[]>([]);
  const[payments,setPayments]=useState<Payment[]>([]);
  const[marketing,setMarketing]=useState<MarketingExpense[]>([]);
  const[balances,setBalances]=useState<OpeningBalances>({cash:0,bank:0,wallet:0});
  const[balanceDraft,setBalanceDraft]=useState({cash:'0',bank:'0',wallet:'0'});
  const[month,setMonth]=useState(currentMonth());
  const[tab,setTab]=useState<Tab>('overview');
  const[entryOpen,setEntryOpen]=useState(false);
  const[draft,setDraft]=useState<Draft>(blankDraft());
  const[query,setQuery]=useState('');
  const[typeFilter,setTypeFilter]=useState<'all'|EntryType>('all');
  const[fundFilter,setFundFilter]=useState<'all'|FundId>('all');
  const[sourceFilter,setSourceFilter]=useState<'all'|SourceId>('all');
  const[message,setMessage]=useState('');

  const load=()=>{
    const nextBalances=read<OpeningBalances>(BALANCE_KEY,{cash:0,bank:0,wallet:0});
    setStaff(readCurrentStaff());
    setManualEntries(read(MANUAL_KEY,[]));
    setReceipts(read(RECEIPTS_KEY,[]));
    setPayments(read(PAYMENTS_KEY,[]));
    setMarketing(read(MARKETING_KEY,[]));
    setBalances(nextBalances);
    setBalanceDraft({cash:String(nextBalances.cash||0),bank:String(nextBalances.bank||0),wallet:String(nextBalances.wallet||0)});
  };

  useEffect(()=>{
    load();
    const events=['storage',EVENT,'happygo-customer-receipts-updated','happygo-payment-updated','happygo-marketing-budget-updated','happygo-admin-auth','tn-staff-updated'];
    events.forEach(event=>window.addEventListener(event,load));
    return()=>events.forEach(event=>window.removeEventListener(event,load));
  },[]);

  const canAccess=Boolean(staff&&(isOwner(staff)||isAdminStaff(staff)||(isAccountingStaff(staff)&&hasPermission(staff,'ledger'))));

  const rows=useMemo<LedgerRow[]>(()=>{
    const receiptRows=receipts.map((item):LedgerRow=>{
      const correction=Number(item.amount||0)<0;
      return{id:`receipt:${item.id}`,voucherNo:item.receiptNo||item.bookingCode,type:'income',date:dateOnly(item.receivedAt||item.createdAt),category:correction?'Điều chỉnh giảm thu':'Thu tiền khách',description:correction?`Điều chỉnh phiếu thu ${item.bookingCode}`:`Thu tiền booking ${item.bookingCode}`,counterparty:item.customerName||'Khách hàng',fund:inferFund(item.method),amount:Number(item.amount||0),documentRef:item.transactionRef||'',note:item.note||'',source:'receipt',createdBy:item.createdByName||'Hệ thống',createdAt:item.createdAt||item.receivedAt};
    });
    const paymentRows=payments.filter(item=>item.status==='paid').map((item):LedgerRow=>({id:`supplier:${item.id}`,voucherNo:`PC-${item.bookingCode||item.id}`,type:'expense',date:dateOnly(item.paidAt||item.createdAt),category:'Thanh toán nhà cung cấp',description:item.purpose||`Chi phí booking ${item.bookingCode}`,counterparty:item.supplierName||'Nhà cung cấp',fund:inferFund(item.paymentMethod),amount:Math.abs(Number(item.paidAmount||item.amount||0)),documentRef:item.transactionRef||'',note:item.accountingNote||'',source:'supplier',createdBy:item.paidBy||'Kế toán',createdAt:item.paidAt||item.createdAt}));
    const marketingRows=marketing.map((item):LedgerRow=>({id:`marketing:${item.id}`,voucherNo:`MKT-${item.id.slice(-6)}`,type:'expense',date:dateOnly(item.date||item.createdAt),category:item.category||'Chi phí Marketing',description:`Marketing: ${item.campaign}`,counterparty:item.vendor||'Nhà cung cấp',fund:'bank',amount:Math.abs(Number(item.amount||0)),documentRef:item.documentRef||'',note:item.note||`${item.channel||''}`,source:'marketing',createdBy:item.createdByName||'Marketing',createdAt:item.createdAt||item.date}));
    const manualRows=manualEntries.filter(item=>!item.voidedAt).map((item):LedgerRow=>({id:`manual:${item.id}`,voucherNo:item.voucherNo,type:item.type,date:item.date,category:item.category,description:item.description,counterparty:item.counterparty,fund:item.fund,amount:item.amount,documentRef:item.documentRef,note:item.note,source:'manual',createdBy:item.createdByName,createdAt:item.createdAt,manualId:item.id}));
    return[...receiptRows,...paymentRows,...marketingRows,...manualRows].filter(item=>item.amount!==0).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));
  },[receipts,payments,marketing,manualEntries]);

  const monthRows=useMemo(()=>rows.filter(item=>item.date.slice(0,7)===month),[rows,month]);
  const filteredRows=useMemo(()=>monthRows.filter(item=>{
    const needle=query.trim().toLowerCase();
    if(typeFilter!=='all'&&item.type!==typeFilter)return false;
    if(fundFilter!=='all'&&item.fund!==fundFilter)return false;
    if(sourceFilter!=='all'&&item.source!==sourceFilter)return false;
    return!needle||`${item.voucherNo} ${item.description} ${item.counterparty} ${item.category} ${item.documentRef}`.toLowerCase().includes(needle);
  }),[monthRows,query,typeFilter,fundFilter,sourceFilter]);

  const totals=useMemo(()=>{
    const opening=balances.cash+balances.bank+balances.wallet+rows.filter(item=>item.date.slice(0,7)<month).reduce((sum,item)=>sum+signed(item),0);
    const income=monthRows.filter(item=>item.type==='income').reduce((sum,item)=>sum+item.amount,0);
    const expense=monthRows.filter(item=>item.type==='expense').reduce((sum,item)=>sum+item.amount,0);
    return{opening,income,expense,net:income-expense,closing:opening+income-expense};
  },[rows,monthRows,month,balances]);

  const fundTotals=useMemo(()=>(Object.keys(fundLabel)as FundId[]).map(fund=>{
    const opening=balances[fund]+rows.filter(item=>item.fund===fund&&item.date.slice(0,7)<month).reduce((sum,item)=>sum+signed(item),0);
    const income=monthRows.filter(item=>item.fund===fund&&item.type==='income').reduce((sum,item)=>sum+item.amount,0);
    const expense=monthRows.filter(item=>item.fund===fund&&item.type==='expense').reduce((sum,item)=>sum+item.amount,0);
    return{fund,opening,income,expense,closing:opening+income-expense};
  }),[rows,monthRows,month,balances]);

  const expenseBreakdown=useMemo(()=>{
    const total=Math.max(1,totals.expense),grouped=new Map<string,number>();
    monthRows.filter(item=>item.type==='expense').forEach(item=>grouped.set(item.category,(grouped.get(item.category)||0)+item.amount));
    return[...grouped.entries()].map(([category,amount])=>({category,amount,percent:Math.round(amount*100/total)})).sort((a,b)=>b.amount-a.amount);
  },[monthRows,totals.expense]);

  function changeType(type:EntryType){setDraft(current=>({...current,type,category:(type==='income'?incomeCategories:expenseCategories)[0]}))}

  function saveEntry(){
    if(!staff||!canAccess)return alert('Tài khoản không có quyền ghi sổ kế toán.');
    const amount=parseAmount(draft.amount);
    if(!draft.date||!draft.description.trim()||!draft.counterparty.trim()||amount<=0)return alert('Vui lòng nhập ngày, nội dung, đối tượng và số tiền.');
    const entry:ManualEntry={id:`acc_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,voucherNo:voucherNo(draft.type),type:draft.type,date:draft.date,category:draft.category,description:draft.description.trim(),counterparty:draft.counterparty.trim(),fund:draft.fund,amount,documentRef:draft.documentRef.trim(),note:draft.note.trim(),createdById:staff.id,createdByName:staff.name,createdAt:new Date().toISOString()};
    const next=[entry,...manualEntries];
    write(MANUAL_KEY,next);setManualEntries(next);setMonth(entry.date.slice(0,7));setDraft(blankDraft());setEntryOpen(false);setTab('ledger');setMessage(`Đã ghi ${entry.voucherNo} · ${money(amount)}.`);
  }

  function voidEntry(id:string){
    if(!staff||!canAccess)return;
    const entry=manualEntries.find(item=>item.id===id);
    if(!entry||entry.voidedAt)return;
    const reason=prompt(`Lý do hủy chứng từ ${entry.voucherNo}`,'');
    if(reason===null||!reason.trim())return alert('Cần nhập lý do hủy chứng từ.');
    if(!confirm(`Hủy ${entry.voucherNo} · ${money(entry.amount)}? Chứng từ vẫn được lưu trong lịch sử.`))return;
    const next=manualEntries.map(item=>item.id===id?{...item,voidedAt:new Date().toISOString(),voidedBy:staff.name,voidReason:reason.trim()}:item);
    write(MANUAL_KEY,next);setManualEntries(next);setMessage(`Đã hủy ${entry.voucherNo}; dữ liệu gốc vẫn được giữ để kiểm tra.`);
  }

  function saveBalances(){
    if(!staff||!canAccess)return;
    const next:OpeningBalances={cash:parseAmount(balanceDraft.cash),bank:parseAmount(balanceDraft.bank),wallet:parseAmount(balanceDraft.wallet),updatedAt:new Date().toISOString(),updatedBy:staff.name};
    if(!confirm(`Lưu số dư khởi tạo tổng cộng ${money(next.cash+next.bank+next.wallet)}?`))return;
    write(BALANCE_KEY,next);setBalances(next);setMessage('Đã cập nhật số dư khởi tạo của các quỹ.');
  }

  function exportCsv(){
    const lines=[['Ngày','Số chứng từ','Loại','Hạng mục','Nội dung','Đối tượng','Quỹ','Thu','Chi','Tham chiếu','Nguồn'],...filteredRows.map(item=>[item.date,item.voucherNo,item.type==='income'?'Thu':'Chi',item.category,item.description,item.counterparty,fundLabel[item.fund],item.type==='income'?String(item.amount):'',item.type==='expense'?String(item.amount):'',item.documentRef,sourceLabel[item.source]])];
    const csv='\uFEFF'+lines.map(line=>line.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(',')).join('\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');
    link.href=url;link.download=`so-thu-chi-${month}.csv`;link.click();URL.revokeObjectURL(url);
  }

  function printReport(){
    const detail=monthRows.map(item=>`<tr><td>${escapeHtml(formatDate(item.date))}</td><td>${escapeHtml(item.voucherNo)}</td><td>${escapeHtml(item.description)}</td><td>${escapeHtml(fundLabel[item.fund])}</td><td class="number">${item.type==='income'?escapeHtml(money(item.amount)):'—'}</td><td class="number">${item.type==='expense'?escapeHtml(money(item.amount)):'—'}</td></tr>`).join('');
    const popup=window.open('','_blank','width=1000,height=800');if(!popup)return alert('Vui lòng cho phép cửa sổ pop-up để in báo cáo.');
    popup.opener=null;popup.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo thu chi ${escapeHtml(month)}</title><style>@page{size:A4 landscape;margin:13mm}body{font:12px Arial;color:#17324d}header{display:flex;justify-content:space-between;border-bottom:3px solid #0d67ac;padding-bottom:12px}h1{font-size:21px;margin:20px 0 5px}.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin:16px 0}.kpis div{border:1px solid #dce6ed;padding:9px}.kpis small,.kpis b{display:block}.kpis b{margin-top:5px;font-size:14px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #dce6ed;padding:7px;text-align:left}th{background:#f3f7fa}.number{text-align:right}.foot{margin-top:24px;display:flex;justify-content:space-between}</style></head><body><header><b>HAPPYGO TRAVEL</b><span>Phòng Kế toán</span></header><h1>BÁO CÁO THU – CHI</h1><b>Tháng ${escapeHtml(month)}</b><div class="kpis"><div><small>Số dư đầu kỳ</small><b>${escapeHtml(money(totals.opening))}</b></div><div><small>Tổng thu</small><b>${escapeHtml(money(totals.income))}</b></div><div><small>Tổng chi</small><b>${escapeHtml(money(totals.expense))}</b></div><div><small>Thu – chi</small><b>${escapeHtml(money(totals.net))}</b></div><div><small>Số dư cuối kỳ</small><b>${escapeHtml(money(totals.closing))}</b></div></div><table><thead><tr><th>Ngày</th><th>Chứng từ</th><th>Nội dung</th><th>Quỹ</th><th>Thu</th><th>Chi</th></tr></thead><tbody>${detail||'<tr><td colspan="6">Chưa có phát sinh</td></tr>'}</tbody></table><div class="foot"><span>Lập lúc ${escapeHtml(new Date().toLocaleString('vi-VN'))}</span><b>Người lập: ${escapeHtml(staff?.name||'')}</b></div><script>window.onload=()=>window.print()<\/script></body></html>`);popup.document.close();
  }

  if(!canAccess)return <section className="admin-panel"><div className="admin-empty-state"><b>Không có quyền truy cập sổ Kế toán</b><span>Quyền này dành cho Chủ tài khoản, Quản trị viên hoặc nhân viên Kế toán được cấp quyền Sổ công nợ.</span></div></section>;

  const maxExpense=Math.max(...expenseBreakdown.map(item=>item.amount),1);

  return <section className="admin-panel accounting-workspace">
    <div className="admin-panel-head accounting-head">
      <div><small>KẾ TOÁN NỘI BỘ</small><h2>Sổ thu chi & dòng tiền</h2><p>Tự tổng hợp phiếu thu khách, thanh toán nhà cung cấp, chi phí Marketing và chứng từ kế toán ghi thêm.</p></div>
      <div className="accounting-head-actions"><label>Tháng<input type="month" value={month} onChange={event=>setMonth(event.target.value)}/></label><button onClick={printReport}>In báo cáo</button><button className="admin-primary" onClick={()=>{setDraft({...blankDraft(),date:month===currentMonth()?today():`${month}-01`});setEntryOpen(true)}}>+ Ghi thu / chi</button></div>
    </div>
    {message&&<p className="admin-api-note accounting-message">{message}</p>}
    <div className="accounting-kpis">
      <article><small>SỐ DƯ ĐẦU KỲ</small><b>{money(totals.opening)}</b><span>Trước tháng {month}</span></article>
      <article className="income"><small>TỔNG THU SAU ĐIỀU CHỈNH</small><b>{money(totals.income)}</b><span>{monthRows.filter(item=>item.type==='income').length} giao dịch</span></article>
      <article className="expense"><small>TỔNG CHI</small><b>− {money(totals.expense)}</b><span>{monthRows.filter(item=>item.type==='expense').length} giao dịch</span></article>
      <article className={totals.net<0?'danger':'good'}><small>THU – CHI TRONG THÁNG</small><b>{totals.net>=0?'+ ':''}{money(totals.net)}</b><span>{totals.net>=0?'Dòng tiền dương':'Dòng tiền âm'}</span></article>
      <article className={totals.closing<0?'danger':'closing'}><small>SỐ DƯ CUỐI KỲ</small><b>{money(totals.closing)}</b><span>Đầu kỳ + Thu − Chi</span></article>
    </div>
    <div className="accounting-tabs"><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Tổng quan</button><button className={tab==='ledger'?'active':''} onClick={()=>setTab('ledger')}>Sổ giao dịch ({monthRows.length})</button><button className={tab==='settings'?'active':''} onClick={()=>setTab('settings')}>Số dư khởi tạo</button></div>

    {entryOpen&&<div className="accounting-entry-form">
      <div className="accounting-form-title"><div><small>CHỨNG TỪ NỘI BỘ</small><h3>Ghi nhận khoản thu hoặc chi</h3></div><button aria-label="Đóng" onClick={()=>setEntryOpen(false)}>×</button></div>
      <div className="tour-editor-grid">
        <label>Loại giao dịch<select value={draft.type} onChange={event=>changeType(event.target.value as EntryType)}><option value="income">Phiếu thu</option><option value="expense">Phiếu chi</option></select></label>
        <label>Ngày hạch toán<input type="date" value={draft.date} onChange={event=>setDraft({...draft,date:event.target.value})}/></label>
        <label>Hạng mục<select value={draft.category} onChange={event=>setDraft({...draft,category:event.target.value})}>{(draft.type==='income'?incomeCategories:expenseCategories).map(item=><option key={item}>{item}</option>)}</select></label>
        <label>Quỹ tiền<select value={draft.fund} onChange={event=>setDraft({...draft,fund:event.target.value as FundId})}>{Object.entries(fundLabel).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        <label className="span-2">Nội dung giao dịch<input value={draft.description} onChange={event=>setDraft({...draft,description:event.target.value})} placeholder="VD: Thu hoàn ứng công tác"/></label>
        <label>Người nộp / Người nhận<input value={draft.counterparty} onChange={event=>setDraft({...draft,counterparty:event.target.value})}/></label>
        <label>Số tiền<input inputMode="numeric" value={draft.amount} onChange={event=>setDraft({...draft,amount:event.target.value})} placeholder="VD: 5.000.000"/></label>
        <label>Số hóa đơn / tham chiếu<input value={draft.documentRef} onChange={event=>setDraft({...draft,documentRef:event.target.value})}/></label>
        <label>Ghi chú<input value={draft.note} onChange={event=>setDraft({...draft,note:event.target.value})}/></label>
        <div className="span-2 editor-actions"><button onClick={()=>setEntryOpen(false)}>Hủy</button><button className="admin-primary" onClick={saveEntry}>Lưu chứng từ</button></div>
      </div>
    </div>}

    {tab==='overview'&&<div className="accounting-overview-grid">
      <section className="accounting-card"><div className="accounting-card-head"><div><small>SỐ DƯ THEO QUỸ</small><b>Cuối tháng {month}</b></div><strong>{money(totals.closing)}</strong></div><div className="accounting-funds">{fundTotals.map(item=><article key={item.fund}><div><span className={`fund-icon ${item.fund}`}>{item.fund==='cash'?'₫':item.fund==='bank'?'▥':'◈'}</span><div><b>{fundLabel[item.fund]}</b><small>Đầu kỳ {money(item.opening)}</small></div></div><strong>{money(item.closing)}</strong><p><span>Thu {money(item.income)}</span><span>Chi −{money(item.expense)}</span></p></article>)}</div></section>
      <section className="accounting-card"><div className="accounting-card-head"><div><small>CƠ CẤU CHI PHÍ</small><b>Theo hạng mục trong tháng</b></div><strong>{money(totals.expense)}</strong></div><div className="accounting-breakdown">{expenseBreakdown.map(item=><article key={item.category}><div><b>{item.category}</b><span>{money(item.amount)} · {item.percent}%</span></div><p><i style={{width:`${Math.max(4,item.amount*100/maxExpense)}%`}}></i></p></article>)}{!expenseBreakdown.length&&<div className="admin-empty-state"><b>Chưa có chi phí trong tháng</b></div>}</div></section>
      <section className="accounting-card accounting-recent"><div className="accounting-card-head"><div><small>GIAO DỊCH GẦN NHẤT</small><b>{Math.min(monthRows.length,6)} phát sinh mới</b></div><button onClick={()=>setTab('ledger')}>Xem toàn bộ</button></div><div className="accounting-mini-ledger">{monthRows.slice(0,6).map(item=>{const decrease=item.type==='expense'||item.amount<0;return <article key={item.id}><span className={decrease?'expense':'income'}>{decrease?'↑':'↓'}</span><div><b>{item.description}</b><small>{formatDate(item.date)} · {item.voucherNo} · {fundLabel[item.fund]}</small></div><strong className={decrease?'expense':'income'}>{decrease?'−':'+'} {money(Math.abs(item.amount))}</strong></article>})}{!monthRows.length&&<div className="admin-empty-state"><b>Chưa có phát sinh trong tháng</b><span>Ghi chứng từ mới hoặc hoàn tất phiếu thu/chi để số liệu tự cập nhật.</span></div>}</div></section>
    </div>}

    {tab==='ledger'&&<>
      <div className="accounting-toolbar"><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm chứng từ, nội dung, đối tượng, tham chiếu..."/><select value={typeFilter} onChange={event=>setTypeFilter(event.target.value as 'all'|EntryType)}><option value="all">Tất cả thu chi</option><option value="income">Chỉ khoản thu</option><option value="expense">Chỉ khoản chi</option></select><select value={fundFilter} onChange={event=>setFundFilter(event.target.value as 'all'|FundId)}><option value="all">Tất cả quỹ</option>{Object.entries(fundLabel).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select><select value={sourceFilter} onChange={event=>setSourceFilter(event.target.value as 'all'|SourceId)}><option value="all">Tất cả nguồn</option>{Object.entries(sourceLabel).map(([id,label])=><option value={id} key={id}>{label}</option>)}</select><button onClick={exportCsv}>Xuất CSV</button></div>
      <div className="accounting-table-wrap"><table className="accounting-table"><thead><tr><th>Ngày / Chứng từ</th><th>Nội dung</th><th>Đối tượng</th><th>Quỹ / Nguồn</th><th>Thu</th><th>Chi</th><th></th></tr></thead><tbody>{filteredRows.map(item=><tr key={item.id}><td><b>{formatDate(item.date)}</b><small>{item.voucherNo}{item.documentRef?` · ${item.documentRef}`:''}</small></td><td><b>{item.description}</b><small>{item.category}{item.note?` · ${item.note}`:''}</small></td><td><b>{item.counterparty}</b><small>Ghi bởi {item.createdBy}</small></td><td><b>{fundLabel[item.fund]}</b><small>{sourceLabel[item.source]}</small></td><td className="income-cell">{item.type==='income'?money(item.amount):'—'}</td><td className="expense-cell">{item.type==='expense'?money(item.amount):'—'}</td><td>{item.manualId&&<button className="danger-action" onClick={()=>voidEntry(item.manualId!)}>Hủy</button>}</td></tr>)}{!filteredRows.length&&<tr><td colSpan={7} className="accounting-empty">Không có giao dịch phù hợp.</td></tr>}</tbody></table></div>
      <div className="accounting-ledger-total"><span>Đang hiển thị <b>{filteredRows.length}</b> giao dịch</span><span>Tổng thu <b className="income-text">{money(filteredRows.filter(item=>item.type==='income').reduce((sum,item)=>sum+item.amount,0))}</b></span><span>Tổng chi <b className="expense-text">{money(filteredRows.filter(item=>item.type==='expense').reduce((sum,item)=>sum+item.amount,0))}</b></span></div>
    </>}

    {tab==='settings'&&<div className="accounting-settings"><div><small>THIẾT LẬP MỘT LẦN</small><h3>Số dư khởi tạo trước khi dùng hệ thống</h3><p>Nhập số tiền thực tế đang có ở từng quỹ trước giao dịch đầu tiên. Hệ thống dùng số này để tính số dư đầu và cuối mỗi tháng.</p></div><div className="accounting-balance-grid"><label>Tiền mặt<input inputMode="numeric" value={balanceDraft.cash} onChange={event=>setBalanceDraft({...balanceDraft,cash:event.target.value})}/></label><label>Tài khoản ngân hàng<input inputMode="numeric" value={balanceDraft.bank} onChange={event=>setBalanceDraft({...balanceDraft,bank:event.target.value})}/></label><label>Ví điện tử<input inputMode="numeric" value={balanceDraft.wallet} onChange={event=>setBalanceDraft({...balanceDraft,wallet:event.target.value})}/></label></div><div className="accounting-settings-foot"><span>{balances.updatedAt?`Cập nhật gần nhất bởi ${balances.updatedBy} · ${new Date(balances.updatedAt).toLocaleString('vi-VN')}`:'Chưa thiết lập số dư khởi tạo'}</span><button className="admin-primary" onClick={saveBalances}>Lưu số dư khởi tạo</button></div><div className="accounting-void-history"><div><small>CHỨNG TỪ ĐÃ HỦY</small><b>{manualEntries.filter(item=>item.voidedAt).length} chứng từ được giữ lại</b></div>{manualEntries.filter(item=>item.voidedAt).slice(0,10).map(item=><article key={item.id}><div><b>{item.voucherNo} · {item.description}</b><span>{money(item.amount)} · {item.counterparty}</span></div><div><b>{item.voidedBy}</b><span>{item.voidReason} · {item.voidedAt?new Date(item.voidedAt).toLocaleString('vi-VN'):''}</span></div></article>)}</div></div>}
  </section>;
}
