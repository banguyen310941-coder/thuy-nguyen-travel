import { HomeCmsHero } from '@/components/HomeCmsHero';
import { HomeCmsSections } from '@/components/HomeCmsSections';
import './home.css';

export const metadata = {
  title: 'Du lịch trọn gói - Nghỉ dưỡng đẳng cấp',
  description: 'HappyGo Travel - Tour, Villa, Resort, Khách sạn và Du thuyền toàn quốc. Hành trình hạnh phúc, kết nối yêu thương.'
};

export default function HomePage() {
  return <><HomeCmsHero/><HomeCmsSections/></>;
}
