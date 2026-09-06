import type {Metadata} from 'next';
import Link from 'next/link';
import {NewsletterUnsubscribe} from '@/components/NewsletterUnsubscribe';

export const metadata:Metadata={title:'Hủy đăng ký email | HappyGo Travel',description:'Hủy đăng ký nhận email ưu đãi và thông tin marketing từ HappyGo Travel.',robots:{index:false,follow:false}};

export default async function UnsubscribePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;const raw=params.email;const email=Array.isArray(raw)?String(raw[0]||''):String(raw||'');
 return <main className="subpage"><section className="sub-section white"><div className="container article-container"><div className="article-content"><span className="sub-kicker">EMAIL MARKETING</span><h1>Hủy đăng ký nhận ưu đãi</h1><p>Nhập hoặc kiểm tra địa chỉ email bên dưới. Sau khi xác nhận, HappyGo Travel sẽ ngừng đưa email này vào các chiến dịch marketing.</p><NewsletterUnsubscribe initialEmail={email}/><p><Link href="/">← Về Trang chủ</Link></p></div></div></section></main>
}
