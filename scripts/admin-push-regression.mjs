import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};

must('public/sw.js',"self.addEventListener('push'",'Service worker phải nhận Web Push nền');
must('public/sw.js',"self.registration.showNotification",'Service worker phải hiện notification hệ thống');
must('public/sw.js',"self.addEventListener('notificationclick'",'Notification phải mở lại HappyGo Admin');
must('components/AdminPushNotifications.tsx','Notification.requestPermission()','Admin phải xin quyền notification từ thao tác người dùng');
must('components/AdminPushNotifications.tsx','registration.pushManager.subscribe','Admin phải đăng ký PushManager');
must('components/AdminPushNotifications.tsx',"/api/admin/push",'Subscription phải lưu server-side');
must('app/admin/layout.tsx','<AdminPushNotifications/>','Admin layout phải mount trình bật push');
must('app/api/admin/push/route.ts','webPushPublicKey()','Push API phải cấp VAPID public key');
must('app/api/admin/push/route.ts','admin_push_subscriptions','Push API phải lưu thiết bị vào database');
must('app/api/bookings/route.ts','notifyNewBooking(sql','Booking website mới phải phát push');
must('app/api/admin/crm/route.ts','notifyCrmAssignment(sql','Khách CRM được giao phải phát push');
must('app/api/admin/bookings/route.ts','notifyBookingAssignment(sql','Booking phân lại Sale phải phát push');
must('components/AdminNotificationSoundMonitor.tsx','tone(ctx,start,880,.30,.12)','Chuông foreground phải lớn hơn bản cũ');
must('db/admin-push.sql','CREATE TABLE IF NOT EXISTS admin_push_subscriptions','Phải có migration lưu push subscription');

if(failures.length){console.error('\nAdmin push regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Admin push regression checks passed.');
