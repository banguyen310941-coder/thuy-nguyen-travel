import { HomeCmsHero } from '@/components/HomeCmsHero';
import { HomeCmsSections } from '@/components/HomeCmsSections';
import './home.css';

export const metadata = {
  title: 'Du lịch trọn gói - Nghỉ dưỡng đẳng cấp',
  description: 'Thúy Nguyên Travel - Tour, Villa, Resort, Khách sạn và Du thuyền toàn quốc. Tư vấn hành trình, lưu trú và dịch vụ du lịch theo nhu cầu.'
};

export default function HomePage() {
  return <><HomeCmsHero/><HomeCmsSections/></>;
}
