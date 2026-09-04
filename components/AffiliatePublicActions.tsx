'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function AffiliatePublicActions(){
 const pathname=usePathname();
 if(pathname!=='/affiliate')return null;
 return <Link className="affiliate-register-shortcut" href="/affiliate/register">+ Đăng ký CTV mới</Link>;
}
