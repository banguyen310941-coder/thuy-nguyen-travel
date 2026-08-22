import { HomeCmsHero } from '@/components/HomeCmsHero';
import { HomeCmsSections } from '@/components/HomeCmsSections';
import './home.css';

export const metadata = {
  title: 'Du lịch trọn gói - Nghỉ dưỡng đẳng cấp',
  description: 'Thúy Nguyên Travel - Tour, Villa, Resort, Khách sạn và Du thuyền toàn quốc. Hotline 0969 973 949.'
};

export default function HomePage() {
  return <><HomeCmsHero/><HomeCmsSections/></>;
}
