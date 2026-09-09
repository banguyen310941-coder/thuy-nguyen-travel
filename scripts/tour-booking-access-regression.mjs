import fs from 'node:fs';

const css=fs.readFileSync('app/tour-booking-access.css','utf8');
const layout=fs.readFileSync('app/layout.tsx','utf8');
const tourRichCss=fs.readFileSync('app/tour-rich.css','utf8');
const productDetailCss=fs.readFileSync('app/product-detail-v2.css','utf8');
const cms=fs.readFileSync('components/CmsTourDetail.tsx','utf8');
const legacy=fs.readFileSync('components/TourDetailClient.tsx','utf8');
const unified=fs.readFileSync('components/UnifiedTourPublicDetail.tsx','utf8');

const checks=[
 ['floating Tour CTA is removed',!layout.includes('TourBookingFloatingAccess')&&!css.includes('tour-mobile-booking-access')],
 ['booking access override is desktop only',css.includes('@media(min-width:901px)')&&!css.includes('@media(max-width')],
 ['desktop Tour booking sidebar has its own scrollbar',css.includes('max-height:calc(100vh - 84px)')&&css.includes('overflow-y:auto')&&css.includes('scrollbar-width:thin')],
 ['desktop rule covers rich and unified Tour layouts',css.includes('.tour-rich-page .tour-booking-sticky')&&css.includes('.product-detail-v2 .pd-body>aside')],
 ['mobile rich Tour behavior remains original',tourRichCss.includes('@media(max-width:900px){.tour-content-layout{grid-template-columns:1fr}.tour-booking-sticky{position:static}')],
 ['mobile unified Tour behavior remains original',productDetailCss.includes('@media(max-width:900px){.pd-summary-grid,.pd-body{grid-template-columns:1fr}.pd-body>aside{position:static}')],
 ['CMS Tour still uses its existing booking form',cms.includes('<TourBookingInquiry')&&cms.includes('tour-booking-sticky')],
 ['legacy Tour still uses its existing booking form',legacy.includes('<TourBookingInquiry')&&legacy.includes('tour-booking-sticky')],
 ['unified Tour keeps booking target',unified.includes('<aside id="booking">')]
];

const failed=checks.filter(([,ok])=>!ok);
if(failed.length){
 console.error('Tour booking access regression failed:');
 for(const[name]of failed)console.error(`- ${name}`);
 process.exit(1);
}
console.log(`Tour booking access regression passed (${checks.length} checks).`);
