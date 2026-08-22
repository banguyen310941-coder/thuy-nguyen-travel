'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchBar() {
  const router = useRouter();
  const [service, setService] = useState('stay');

  return (
    <form className="booking-search booking-search-pro" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const destination = String(form.get('destination') || '').trim();
      const target = service === 'tour' ? '/tours' : service === 'cruise' ? '/cruises' : '/stay';
      router.push(destination ? `${target}?q=${encodeURIComponent(destination)}` : target);
    }}>
      <label className="search-field service-field">
        <span>Dịch vụ</span>
        <select value={service} onChange={(e) => setService(e.target.value)}>
          <option value="stay">Lưu trú</option>
          <option value="tour">Tour du lịch</option>
          <option value="cruise">Du thuyền</option>
        </select>
      </label>
      <label className="search-field search-destination">
        <span>Điểm đến / tên sản phẩm</span>
        <input name="destination" autoComplete="off" placeholder="Phan Thiết, Hạ Long, Oceanami..." />
      </label>
      <label className="search-field">
        <span>{service === 'stay' ? 'Ngày nhận phòng' : 'Ngày đi'}</span>
        <input name="checkin" type="date" />
      </label>
      <label className="search-field date-end">
        <span>{service === 'stay' ? 'Ngày trả phòng' : 'Ngày về'}</span>
        <input name="checkout" type="date" />
      </label>
      <label className="search-field search-guests">
        <span>Khách & phòng</span>
        <select name="guests" defaultValue="2-1">
          <option value="2-1">2 người lớn · 1 phòng</option>
          <option value="2-2">2 người lớn · 2 phòng</option>
          <option value="4-2">4 người lớn · 2 phòng</option>
          <option value="family">Gia đình có trẻ em</option>
          <option value="group">Đoàn từ 10 khách</option>
        </select>
      </label>
      <button className="search-button" type="submit">TÌM KIẾM</button>
    </form>
  );
}
