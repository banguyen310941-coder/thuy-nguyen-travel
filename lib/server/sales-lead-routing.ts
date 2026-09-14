export type SalesLeadKind='tour'|'stay'|'other';

export const TOUR_LEAD_PERMISSION='receive_tour_leads';
export const STAY_LEAD_PERMISSION='receive_stay_leads';

type SaleLike={id?:unknown;name?:unknown;permissions?:unknown};

function permissionsOf(sale:SaleLike):string[]{
 return Array.isArray(sale.permissions)?sale.permissions.map(String):[];
}

export function salesLeadKind(value:unknown):SalesLeadKind{
 const text=String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
 if(text==='tour'||text.includes('tour'))return'tour';
 if(text==='stay'||text.includes('villa')||text.includes('resort')||text.includes('khach san')||text.includes('hotel')||text.includes('luu tru')||text.includes('phong'))return'stay';
 return'other';
}

export function leadPermission(kind:SalesLeadKind):string|null{
 if(kind==='tour')return TOUR_LEAD_PERMISSION;
 if(kind==='stay')return STAY_LEAD_PERMISSION;
 return null;
}

export function filterSalesForLead<T extends SaleLike>(sales:T[],kind:SalesLeadKind):T[]{
 const permission=leadPermission(kind);
 if(!permission)return sales;
 return sales.filter(sale=>permissionsOf(sale).includes(permission));
}

export function saleCanReceiveLead(sale:SaleLike,kind:SalesLeadKind,allSales:SaleLike[]=[sale]):boolean{
 return filterSalesForLead(allSales,kind).some(item=>String(item.id||'')===String(sale.id||''));
}

export function salesLeadLabel(kind:SalesLeadKind):string{
 return kind==='tour'?'Tour':kind==='stay'?'Villa / Khách sạn':'khách hàng';
}
