'use client';

import { useRouter } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  return (
    <form className="booking-search" onSubmit={(event) => { event.preventDefault(); router.push('/stay'); }}>
      <label className="search-field search-destination">
        <span>Điểm đến / tên chỗ nghỉ</span>
        <input name="destination" placeholder="Bạn muốn đi đâu?" />
      </label>
      <label className="search-field">
        <span>Ngày nhận phòng</span>
        <input name="checkin" type="date" />
      </label>
      <label className="search-field">
        <span>Ngày trả phòng</span>
        <input name="checkout" type="date" />
      </label>
      <label className="search-field search-guests">
        <span>Khách & phòng</span>
        <select name="guests" defaultValue="2-1">
          <option value="2-1">2 người lớn · 1 phòng</option>
          <option value="2-2">2 người lớn · 2 phòng</option>
          <option value="4-2">4 người lớn · 2 phòng</option>
          <option value="family">Gia đình có trẻ em</option>
        </select>
      </label>
      <button className="search-button" type="submit">TÌM</button>
    </form>
  );
}
