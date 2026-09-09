import fs from 'node:fs';

const access=fs.readFileSync('components/TourBookingFloatingAccess.tsx','utf8');
const css=fs.readFileSync('app/tour-booking-access.css','utf8');
const layout=fs.readFileSync('app/layout.tsx','utf8');
const cms=fs.readFileSync('components/CmsTourDetail.tsx','utf8');
const legacy=fs.readFileSync('components/TourDetailClient.tsx','utf8');
const unified=fs.readFileSync('components/UnifiedTourPublicDetail.tsx','utf8');

const checks=[
 ['floating access is mounted globally',layout.includes('<TourBookingFloatingAccess/>')&&layout.includes("import './tour-booking-access.css'")],
 ['mobile CTA targets existing booking form',access.includes("TARGET_SELECTOR='.tour-rich-page .tour-booking-sticky, .product-detail-v2 #booking'")&&access.includes("scrollIntoView({behavior:'smooth',block:'start'})")],
 ['mobile CTA is fixed and mobile-only',css.includes('.tour-mobile-booking-access{display:none}')&&css.includes('position:fixed')&&css.includes('@media(max-width:960px)')],
 ['rich Tour booking moves before long content on mobile',css.includes('.tour-rich-page .tour-content-layout>main{order:2}')&&css.includes('.tour-rich-page .tour-content-layout>.tour-booking-sticky{order:1')],
 ['unified Tour booking moves before long content on mobile',css.includes('.product-detail-v2 .pd-body>main{order:2}')&&css.includes('.product-detail-v2 .pd-body>#booking{order:1')],
 ['CMS Tour still uses its existing booking form',cms.includes('<TourBookingInquiry')&&cms.includes('tour-booking-sticky')],
 ['legacy Tour still uses its existing booking form',legacy.includes('<TourBookingInquiry')&&legacy.includes('tour-booking-sticky')],
 ['unified Tour keeps booking target',unified.includes('<aside id="booking">')],
 ['quick access does not submit bookings itself',!access.includes('/api/bookings')&&!access.includes('<form')]
];

const failed=checks.filter(([,ok])=>!ok);
if(failed.length){
 console.error('Tour booking access regression failed:');
 for(const[name]of failed)console.error(`- ${name}`);
 process.exit(1);
}
console.log(`Tour booking access regression passed (${checks.length} checks).`);
