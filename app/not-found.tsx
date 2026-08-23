import Link from 'next/link';
import {SupportCtas} from '@/components/SupportCtas';

export default function NotFound(){return <section className="sub-section white"><div className="container"><div className="article-state not-found-state"><span className="sub-kicker">404 · KHÔNG TÌM THẤY TRANG</span><h1>Trang bạn đang tìm không còn ở đây</h1><p>Đường dẫn có thể đã thay đổi, sản phẩm đã được ẩn hoặc nội dung chưa được xuất bản.</p><div className="article-actions"><Link href="/">Về Trang chủ</Link><Link href="/search">Tìm dịch vụ</Link><Link href="/guide">Cẩm nang du lịch</Link></div><SupportCtas compact/></div></div></section>}
