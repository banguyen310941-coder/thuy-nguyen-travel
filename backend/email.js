const resendKey=String(process.env.RESEND_API_KEY||'').trim();
const from=String(process.env.EMAIL_FROM||'Thúy Nguyên Travel <booking@thuynguyentravel.vn>').trim();
const replyTo=String(process.env.EMAIL_REPLY_TO||'').trim();
const brandUrl=String(process.env.PUBLIC_SITE_URL||'https://banguyen310941-coder.github.io/thuy-nguyen-travel').replace(/\/$/,'');
const hotline=String(process.env.BUSINESS_HOTLINE||'0969973949').trim();

const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=(v)=>{if(!v)return 'Theo xác nhận';const d=new Date(`${v}T00:00:00`);return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString('vi-VN')};

function shell({preview,title,body,footer='Thúy Nguyên Travel · Đồng hành cùng mọi hành trình'}){
 return `<!doctype html><html><body style="margin:0;background:#f3f6f8;font-family:Arial,sans-serif;color:#263840"><div style="display:none;max-height:0;overflow:hidden">${esc(preview)}</div><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:28px 12px"><table width="620" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:620px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(23,63,87,.10)"><tr><td style="background:#173f57;padding:24px 30px;color:#fff"><div style="font-size:22px;font-weight:800;letter-spacing:.3px">THÚY NGUYÊN TRAVEL</div><div style="font-size:12px;color:#d8c49c;margin-top:4px">DU LỊCH · NGHỈ DƯỠNG · TRẢI NGHIỆM</div></td></tr><tr><td style="padding:30px"><h1 style="font-size:24px;line-height:1.3;margin:0 0 18px;color:#173f57">${esc(title)}</h1>${body}</td></tr><tr><td style="padding:20px 30px;background:#f7f9fa;color:#6e7f87;font-size:12px;line-height:1.6">${footer}<br>Hotline: ${esc(hotline)} · <a href="${brandUrl}" style="color:#2f6f66">Website Thúy Nguyên Travel</a></td></tr></table></td></tr></table></body></html>`;
}

async function send({to,subject,html,tags=[]}){
 if(!resendKey) return {ok:false,skipped:true,error:'RESEND_API_KEY is not configured'};
 const payload={from,to:Array.isArray(to)?to:[to],subject,html,tags};
 if(replyTo)payload.reply_to=replyTo;
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resendKey}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data?.message||`Email provider error ${response.status}`);
 return {ok:true,id:data?.id||null};
}

export async function sendBookingConfirmation(booking){
 if(!booking?.email)return {ok:false,skipped:true,error:'Booking has no email'};
 const subject=`[${booking.code}] Thúy Nguyên Travel đã nhận yêu cầu của bạn`;
 const details=`<div style="background:#f6f8f9;border-radius:12px;padding:18px;margin:18px 0"><table width="100%" cellpadding="5" style="font-size:14px"><tr><td style="color:#6e7f87">Mã yêu cầu</td><td align="right"><b>${esc(booking.code)}</b></td></tr><tr><td style="color:#6e7f87">Dịch vụ</td><td align="right"><b>${esc(booking.product)}</b></td></tr><tr><td style="color:#6e7f87">Ngày đi</td><td align="right">${date(booking.startDate)}</td></tr>${booking.endDate?`<tr><td style="color:#6e7f87">Ngày kết thúc</td><td align="right">${date(booking.endDate)}</td></tr>`:''}<tr><td style="color:#6e7f87">Số khách</td><td align="right">${Number(booking.adults||1)} người lớn · ${Number(booking.children||0)} trẻ em</td></tr></table></div>`;
 const body=`<p style="font-size:15px;line-height:1.7">Xin chào <b>${esc(booking.customerName)}</b>,</p><p style="font-size:15px;line-height:1.7">Cảm ơn bạn đã gửi yêu cầu tới Thúy Nguyên Travel. Yêu cầu của bạn đã được ghi nhận và đội ngũ tư vấn sẽ kiểm tra tình trạng thực tế, giá tốt nhất và liên hệ để xác nhận.</p>${details}<div style="border-left:4px solid #c9aa72;padding:12px 15px;background:#fffaf1;font-size:13px;line-height:1.6"><b>Lưu ý:</b> Email này xác nhận chúng tôi đã nhận yêu cầu, chưa phải xác nhận dịch vụ cuối cùng và chưa phát sinh thanh toán.</div><p style="margin:24px 0 0"><a href="${brandUrl}" style="display:inline-block;background:#2f6f66;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Xem website Thúy Nguyên Travel</a></p>`;
 return send({to:booking.email,subject,html:shell({preview:`Đã nhận yêu cầu ${booking.code}`,title:'Chúng tôi đã nhận yêu cầu của bạn',body}),tags:[{name:'type',value:'booking-confirmation'}]});
}

export function campaignHtml({title,message,ctaLabel,ctaUrl}){
 const paragraphs=String(message||'').split(/\n+/).filter(Boolean).map(p=>`<p style="font-size:15px;line-height:1.7;margin:0 0 14px">${esc(p)}</p>`).join('');
 const cta=ctaLabel&&ctaUrl?`<p style="margin:24px 0 0"><a href="${esc(ctaUrl)}" style="display:inline-block;background:#2f6f66;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">${esc(ctaLabel)}</a></p>`:'';
 return shell({preview:title,title,body:`${paragraphs}${cta}`,footer:'Bạn nhận email này vì đã từng liên hệ hoặc sử dụng dịch vụ của Thúy Nguyên Travel. Vui lòng chỉ gửi nội dung tiếp thị cho khách đã đồng ý nhận thông tin.'});
}

export async function sendCampaignEmail({to,subject,title,message,ctaLabel,ctaUrl}){
 return send({to,subject,html:campaignHtml({title,message,ctaLabel,ctaUrl}),tags:[{name:'type',value:'customer-campaign'}]});
}
