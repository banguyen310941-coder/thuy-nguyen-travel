export type Stay = {
  slug: string;
  name: string;
  location: string;
  type: 'Villa' | 'Khách sạn' | 'Resort';
  image: string;
  rating: number;
  summary: string;
};

export const stays: Stay[] = [
  {
    slug: 'oceanami-villas-beach-club',
    name: 'Oceanami Villas & Beach Club',
    location: 'Phước Hải, Bà Rịa - Vũng Tàu',
    type: 'Villa',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/6d/33/35/oceanami-villas-beach.jpg?w=900&h=600&s=1',
    rating: 8.8,
    summary: 'Villa nghỉ dưỡng gần biển, phù hợp gia đình và nhóm bạn.'
  },
  {
    slug: 'novaworld-phan-thiet',
    name: 'NovaWorld Phan Thiết',
    location: 'Phan Thiết, Bình Thuận',
    type: 'Villa',
    image: 'https://www.novaland.com.vn/Data/Sites/1/media/tin-tuc/2024/0719/1/0717-2-2.jpg',
    rating: 9.0,
    summary: 'Villa nhiều phòng ngủ trong quần thể nghỉ dưỡng ven biển.'
  },
  {
    slug: 'vinpearl-resort-nha-trang',
    name: 'Vinpearl Resort Nha Trang',
    location: 'Nha Trang, Khánh Hòa',
    type: 'Resort',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
    rating: 8.9,
    summary: 'Resort 5 sao phù hợp gia đình, nghỉ dưỡng biển và kỳ nghỉ dài ngày.'
  },
  {
    slug: 'flc-sam-son',
    name: 'FLC Sầm Sơn',
    location: 'Sầm Sơn, Thanh Hóa',
    type: 'Resort',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
    rating: 8.6,
    summary: 'Khu nghỉ dưỡng biển dành cho khách lẻ, gia đình và đoàn.'
  }
];

export const destinations = [
  ['Phan Thiết', 'Villa · Resort · Tour', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=85'],
  ['Hạ Long', 'Du thuyền · Khách sạn', 'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=900&q=85'],
  ['Phú Quốc', 'Resort · Nghỉ dưỡng biển', 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?auto=format&fit=crop&w=900&q=85'],
  ['Sapa', 'Tour · Khách sạn', 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=900&q=85'],
];
