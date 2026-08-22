export type Stay = {
  slug: string;
  name: string;
  location: string;
  type: 'Villa' | 'Khách sạn' | 'Resort';
  image: string;
  gallery?: string[];
  rating: number;
  summary: string;
  highlights: string[];
  rooms?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export type Tour = {
  slug: string;
  name: string;
  category: 'Tour Trung Quốc' | 'Tour trong nước';
  duration: string;
  route: string;
  image: string;
  summary: string;
};

export type Cruise = {
  slug: string;
  name: string;
  bay: string;
  duration: string;
  image: string;
  priceFrom?: string;
  summary: string;
};

export const stays: Stay[] = [
  {
    slug: 'oceanami-villas-beach-club',
    name: 'Oceanami Villas & Beach Club',
    location: 'Quốc lộ 44A, Phước Hải, Đất Đỏ, Bà Rịa - Vũng Tàu',
    type: 'Villa',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/6d/33/35/oceanami-villas-beach.jpg?w=1200&h=800&s=1',
    gallery: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/6d/33/35/oceanami-villas-beach.jpg?w=1200&h=800&s=1',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85'
    ],
    rating: 8.8,
    summary: 'Khu nghỉ dưỡng 5 sao tại Phước Hải với hệ thống villa, hồ bơi, khu vui chơi và các hoạt động giải trí dành cho gia đình, nhóm bạn và khách đoàn.',
    highlights: ['Khu nghỉ dưỡng 5 sao', 'Hồ bơi', 'Khu vui chơi trẻ em', 'Trung tâm thể hình', 'Hoạt động giải trí'],
    rooms: ['Villa 3 phòng ngủ', 'Villa 4 phòng ngủ', 'Villa 4 phòng ngủ Beach Front'],
    seoTitle: 'Oceanami Villas & Beach Club - Đặt villa Phước Hải',
    seoDescription: 'Đặt Oceanami Villas & Beach Club tại Phước Hải cùng Thúy Nguyên Travel. Tư vấn villa, hạng phòng, tiện ích và giá theo ngày.'
  },
  {
    slug: 'novaworld-phan-thiet',
    name: 'NovaWorld Phan Thiết',
    location: 'Phan Thiết, Bình Thuận',
    type: 'Villa',
    image: 'https://www.novaland.com.vn/Data/Sites/1/media/tin-tuc/2024/0719/1/0717-2-2.jpg',
    gallery: [
      'https://www.novaland.com.vn/Data/Sites/1/media/tin-tuc/2024/0719/1/0717-2-2.jpg',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85'
    ],
    rating: 9.0,
    summary: 'Villa nghỉ dưỡng trong quần thể NovaWorld Phan Thiết, phù hợp nhóm gia đình và kỳ nghỉ nhiều thế hệ.',
    highlights: ['Villa nhiều phòng ngủ', 'Không gian gia đình', 'Khu vui chơi', 'Gần biển', 'Phù hợp nhóm đông'],
    rooms: ['Villa 2 phòng ngủ', 'Villa 3 phòng ngủ', 'Villa 4 phòng ngủ'],
    seoTitle: 'NovaWorld Phan Thiết Villa - Đặt villa nghỉ dưỡng',
    seoDescription: 'Tư vấn và đặt villa NovaWorld Phan Thiết theo ngày, số khách và số phòng ngủ cùng Thúy Nguyên Travel.'
  },
  {
    slug: 'vinpearl-resort-nha-trang',
    name: 'Vinpearl Resort Nha Trang',
    location: 'Hòn Tre, Nha Trang, Khánh Hòa',
    type: 'Resort',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
    rating: 8.9,
    summary: 'Resort nghỉ dưỡng biển dành cho gia đình, cặp đôi và khách nghỉ dài ngày tại Nha Trang.',
    highlights: ['Resort biển', 'Hồ bơi', 'Gia đình', 'Nghỉ dưỡng 5 sao', 'Nha Trang'],
    rooms: ['Deluxe', 'Grand Deluxe', 'Villa gia đình']
  },
  {
    slug: 'vinpearl-resort-spa-phu-quoc',
    name: 'Vinpearl Resort & Spa Phú Quốc',
    location: 'Bãi Dài, Phú Quốc, Kiên Giang',
    type: 'Resort',
    image: 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?auto=format&fit=crop&w=1200&q=85',
    rating: 9.0,
    summary: 'Lựa chọn nghỉ dưỡng tại Bãi Dài, phù hợp kỳ nghỉ biển, gia đình và khách nhóm.',
    highlights: ['Bãi Dài', 'Hồ bơi', 'Spa', 'Gia đình', 'Nghỉ dưỡng biển']
  },
  {
    slug: 'flc-sam-son',
    name: 'FLC Sầm Sơn',
    location: 'Sầm Sơn, Thanh Hóa',
    type: 'Resort',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
    rating: 8.6,
    summary: 'Khu nghỉ dưỡng biển phù hợp khách lẻ, gia đình, hội nhóm và khách đoàn.',
    highlights: ['Gần biển', 'Hồ bơi', 'Khách đoàn', 'Gia đình', 'Sầm Sơn']
  },
  {
    slug: 'flc-quy-nhon',
    name: 'FLC Quy Nhơn',
    location: 'Quy Nhơn, Bình Định',
    type: 'Resort',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=85',
    rating: 8.7,
    summary: 'Resort biển tại Quy Nhơn dành cho nghỉ dưỡng gia đình, nhóm bạn và khách đoàn.',
    highlights: ['Biển Quy Nhơn', 'Resort', 'Gia đình', 'Khách đoàn', 'Nghỉ dưỡng']
  }
];

export const cruises: Cruise[] = [
  {
    slug: 'ambassador-i-ha-long-2n1d',
    name: 'Ambassador I - Vịnh Hạ Long',
    bay: 'Vịnh Hạ Long',
    duration: '2 ngày 1 đêm',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5e?auto=format&fit=crop&w=1200&q=85',
    priceFrom: '4.500.000đ/khách',
    summary: 'Du thuyền ngủ đêm trên Vịnh Hạ Long, khởi hành hằng ngày theo lịch của hãng.'
  },
  {
    slug: 'ambassador-ii-ha-long-day',
    name: 'Ambassador II - Vịnh Hạ Long',
    bay: 'Vịnh Hạ Long',
    duration: 'Hành trình 8 tiếng',
    image: 'https://images.unsplash.com/photo-1566847438217-76e82d383f84?auto=format&fit=crop&w=1200&q=85',
    summary: 'Hành trình du thuyền trong ngày trên Vịnh Hạ Long với trải nghiệm cao cấp.'
  },
  {
    slug: 'ambassador-signature-lan-ha',
    name: 'Ambassador Signature - Vịnh Lan Hạ',
    bay: 'Vịnh Lan Hạ',
    duration: '2 ngày 1 đêm',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    priceFrom: '4.500.000đ/khách',
    summary: 'Du thuyền ngủ đêm khám phá Vịnh Lan Hạ, phù hợp cặp đôi, gia đình và nhóm nhỏ.'
  }
];

export const tours: Tour[] = [
  { slug:'bac-kinh-van-ly-truong-thanh', name:'Bắc Kinh - Vạn Lý Trường Thành', category:'Tour Trung Quốc', duration:'5N4Đ', route:'Hà Nội - Bắc Kinh - Vạn Lý Trường Thành', image:'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=85', summary:'Hành trình khám phá thủ đô Bắc Kinh, các công trình biểu tượng và Vạn Lý Trường Thành.' },
  { slug:'thuong-hai-hang-chau-o-tran', name:'Thượng Hải - Hàng Châu - Ô Trấn', category:'Tour Trung Quốc', duration:'6N5Đ', route:'Thượng Hải - Hàng Châu - Ô Trấn', image:'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?auto=format&fit=crop&w=1200&q=85', summary:'Tour kết hợp đô thị hiện đại, cảnh quan Giang Nam và cổ trấn nổi tiếng.' },
  { slug:'da-nang-hoi-an-ba-na', name:'Đà Nẵng - Hội An - Bà Nà', category:'Tour trong nước', duration:'4N3Đ', route:'Đà Nẵng - Hội An - Bà Nà', image:'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85', summary:'Tour miền Trung kết hợp biển, phố cổ Hội An và khu du lịch Bà Nà.' },
  { slug:'phu-quoc-4n3d', name:'Phú Quốc nghỉ dưỡng 4N3Đ', category:'Tour trong nước', duration:'4N3Đ', route:'Phú Quốc', image:'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?auto=format&fit=crop&w=1200&q=85', summary:'Kỳ nghỉ biển tại Phú Quốc với lựa chọn khách sạn hoặc resort theo ngân sách.' },
  { slug:'sapa-fansipan', name:'Sapa - Fansipan', category:'Tour trong nước', duration:'3N2Đ', route:'Hà Nội - Sapa - Fansipan', image:'https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=1200&q=85', summary:'Khám phá Sapa, cảnh quan Tây Bắc và trải nghiệm Fansipan.' }
];

export const destinations = [
  ['Phan Thiết', 'Villa · Resort · Tour', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=85'],
  ['Hạ Long', 'Du thuyền · Khách sạn', 'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=900&q=85'],
  ['Phú Quốc', 'Resort · Nghỉ dưỡng biển', 'https://images.unsplash.com/photo-1580974928064-f0aeef70895a?auto=format&fit=crop&w=900&q=85'],
  ['Sapa', 'Tour · Khách sạn', 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=900&q=85'],
  ['Nha Trang', 'Vinpearl · Resort · Tour', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85'],
  ['Sầm Sơn', 'FLC · Resort · Biển', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=85']
] as const;
