import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const failures=[];
const must=(path,needle,label)=>{if(!read(path).includes(needle))failures.push(`${label}: thiếu ${JSON.stringify(needle)} trong ${path}`)};

must('app/admin/layout.tsx','<AdminNotificationSoundMonitor/>','Admin layout phải mount chuông thông báo dùng chung');
must('components/AdminNotificationSoundMonitor.tsx',"const WORK_ROOT='.admin-chat-notify .admin-bell'",'Chuông phải theo dõi trung tâm việc mới');
must('components/AdminNotificationSoundMonitor.tsx',"const ATTENDANCE_ROOT='.attendance-notify .attendance-notify-trigger'",'Chuông phải theo dõi nhắc chấm công');
must('components/AdminNotificationSoundMonitor.tsx','new MutationObserver(scheduleScan)','Chuông phải phản ứng ngay khi badge thông báo thay đổi');
must('components/AdminNotificationSoundMonitor.tsx','if(!state.ready||state.root!==root)','Lần tải đầu chỉ tạo baseline, không được kêu lại thông báo cũ');
must('components/AdminNotificationSoundMonitor.tsx','if(count>state.count)shouldRing=true','Chỉ tăng số thông báo mới mới kích hoạt chuông');
must('components/AdminNotificationSoundMonitor.tsx','window.AudioContext','Chuông phải dùng Web Audio nội bộ, không phụ thuộc file âm thanh ngoài');
must('components/AdminNotificationSoundMonitor.tsx','tone(ctx,start,880','Chuông phải có nhịp âm thanh rõ ràng');
must('components/AdminNotificationSoundMonitor.tsx','now-lastPlayedAt<900','Thông báo dồn dập phải được chống kêu lặp');
must('components/AdminNotificationSoundMonitor.tsx',"window.addEventListener('pointerdown',unlock",'Audio phải được mở khóa sau tương tác người dùng theo chính sách trình duyệt');
must('components/AdminNotificationSoundMonitor.tsx',"'tn-bookings-updated'",'Booking mới phải kích hoạt quét thông báo');
must('components/AdminNotificationSoundMonitor.tsx',"'happygo-attendance-updated'",'Nhắc chấm công mới phải kích hoạt quét thông báo');

if(failures.length){console.error('\nAdmin notification sound regression FAILED:\n');for(const failure of failures)console.error(`- ${failure}`);process.exit(1)}
console.log('Admin notification sound regression checks passed.');
