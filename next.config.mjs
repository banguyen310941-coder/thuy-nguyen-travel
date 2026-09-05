/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      {source:'/stay/:slug',destination:'/luu-tru/:slug',permanent:true},
      {source:'/stay',destination:'/luu-tru',permanent:true},
      {source:'/tours/:slug',destination:'/tour-du-lich/:slug',permanent:true},
      {source:'/tours',destination:'/tour-du-lich',permanent:true},
      {source:'/cruises/:slug',destination:'/du-thuyen/:slug',permanent:true},
      {source:'/cruises',destination:'/du-thuyen',permanent:true},
      {source:'/destinations',destination:'/diem-den',permanent:true},
      {source:'/guide/category/:slug',destination:'/cam-nang/danh-muc/:slug',permanent:true},
      {source:'/guide/read',destination:'/cam-nang/doc',permanent:true},
      {source:'/guide/:slug',destination:'/cam-nang/:slug',permanent:true},
      {source:'/guide',destination:'/cam-nang',permanent:true},
      {source:'/product/:slug',destination:'/san-pham/:slug',permanent:true},
      {source:'/product',destination:'/san-pham',permanent:true},
      {source:'/search',destination:'/tim-kiem',permanent:true},
      {source:'/about',destination:'/gioi-thieu',permanent:true},
      {source:'/contact',destination:'/lien-he',permanent:true},
      {source:'/terms',destination:'/dieu-khoan',permanent:true},
      {source:'/privacy',destination:'/chinh-sach-bao-mat',permanent:true},
      {source:'/payment-guide',destination:'/huong-dan-thanh-toan',permanent:true},
      {source:'/account',destination:'/tai-khoan',permanent:true},
      {source:'/checkout',destination:'/thanh-toan',permanent:true},
    ];
  },
  async rewrites() {
    return [
      {source:'/luu-tru/:slug',destination:'/stay/:slug'},
      {source:'/luu-tru',destination:'/stay'},
      {source:'/tour-du-lich/:slug',destination:'/tours/:slug'},
      {source:'/tour-du-lich',destination:'/tours'},
      {source:'/du-thuyen/:slug',destination:'/cruises/:slug'},
      {source:'/du-thuyen',destination:'/cruises'},
      {source:'/diem-den',destination:'/destinations'},
      {source:'/cam-nang/danh-muc/:slug',destination:'/guide/category/:slug'},
      {source:'/cam-nang/doc',destination:'/guide/read'},
      {source:'/cam-nang/:slug',destination:'/guide/:slug'},
      {source:'/cam-nang',destination:'/guide'},
      {source:'/san-pham/:slug',destination:'/product/:slug'},
      {source:'/san-pham',destination:'/product'},
      {source:'/tim-kiem',destination:'/search'},
      {source:'/gioi-thieu',destination:'/about'},
      {source:'/lien-he',destination:'/contact'},
      {source:'/dieu-khoan',destination:'/terms'},
      {source:'/chinh-sach-bao-mat',destination:'/privacy'},
      {source:'/huong-dan-thanh-toan',destination:'/payment-guide'},
      {source:'/tai-khoan',destination:'/account'},
      {source:'/thanh-toan',destination:'/checkout'},
    ];
  },
};

export default nextConfig;
