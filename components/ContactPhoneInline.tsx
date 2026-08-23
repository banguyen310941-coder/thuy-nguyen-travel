'use client';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';
export function ContactPhoneInline(){const s=useSiteSettings();return <span>☎ {formatPhone(s.hotline)}</span>}
