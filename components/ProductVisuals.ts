export const PRODUCT_VISUALS:Record<string,string>={
'oceanami-villas-beach-club':'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
'novaworld-phan-thiet':'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
'vinpearl-resort-nha-trang':'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85',
'vinpearl-resort-spa-phu-quoc':'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
'flc-sam-son':'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=85',
'flc-quy-nhon':'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=85',
'ambassador-i-ha-long-2n1d':'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85',
'ambassador-ii-ha-long-day':'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=85',
'ambassador-signature-lan-ha':'https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?auto=format&fit=crop&w=1400&q=85',
'bac-kinh-van-ly-truong-thanh':'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1400&q=85',
'thuong-hai-hang-chau-o-tran':'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?auto=format&fit=crop&w=1400&q=85',
'da-nang-hoi-an-ba-na':'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=85',
'phu-quoc-4n3d':'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85'
};

export function productVisual(slug:string,original?:string){return PRODUCT_VISUALS[slug]||original||''}
