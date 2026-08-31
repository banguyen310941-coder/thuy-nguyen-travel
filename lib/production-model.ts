export type MoneyVnd=number;
export type StaffRole='owner'|'admin'|'sales'|'content'|'operations'|'accounting';
export type BookingStatus='new'|'contacting'|'quoted'|'deposit_pending'|'deposited'|'confirmed'|'completed'|'lost'|'cancelled';
export type CrmStage='new'|'assigned'|'contacted'|'quoted'|'deposit_pending'|'deposited'|'confirmed'|'completed'|'lost';

export type BookingMoneySnapshot={sellingTotalVnd:MoneyVnd;costTotalVnd:number|null;currency:'VND';costSource:'product_net'|'partner_net'|'manual'|'missing'};
export function grossProfitVnd(x:BookingMoneySnapshot){return x.costTotalVnd==null?null:x.sellingTotalVnd-x.costTotalVnd}
export function grossMarginPercent(x:BookingMoneySnapshot){const p=grossProfitVnd(x);return p==null||x.sellingTotalVnd<=0?null:Math.round(p/x.sellingTotalVnd*10000)/100}
export function needsManualCost(x:BookingMoneySnapshot){return x.costTotalVnd==null||x.costSource==='missing'}

// Production invariant: booking prices are snapshots. Never recompute historical
// revenue/cost from a product's current price after the booking is created.
// Negative gross profit is valid accounting data and must never be clamped to zero.
export function snapshotBookingMoney(selling:number,net?:number|null,source:BookingMoneySnapshot['costSource']='missing'):BookingMoneySnapshot{return{sellingTotalVnd:Math.max(0,Math.round(selling||0)),costTotalVnd:net==null?null:Math.max(0,Math.round(net)),currency:'VND',costSource:net==null?'missing':source}}
