export type AffiliateCommissionTier={minOrder:number;maxOrder:number|null;rate:number;label:string};

export const AFFILIATE_COMMISSION_TIERS:AffiliateCommissionTier[]=[
 {minOrder:1,maxOrder:10,rate:35,label:'Đơn 1–10'},
 {minOrder:11,maxOrder:20,rate:40,label:'Đơn 11–20'},
 {minOrder:21,maxOrder:50,rate:45,label:'Đơn 21–50'},
 {minOrder:51,maxOrder:null,rate:50,label:'Từ đơn 51'}
];

export function affiliateCommissionRate(orderNumber:number){
 const order=Math.max(1,Math.floor(Number(orderNumber)||1));
 return AFFILIATE_COMMISSION_TIERS.find(tier=>order>=tier.minOrder&&(tier.maxOrder===null||order<=tier.maxOrder))?.rate||35;
}

export function affiliateCommissionPolicy(closedOrders:number){
 const closed=Math.max(0,Math.floor(Number(closedOrders)||0));
 const nextOrderNumber=closed+1;
 const currentRate=affiliateCommissionRate(nextOrderNumber);
 const currentTier=AFFILIATE_COMMISSION_TIERS.find(tier=>tier.rate===currentRate)||AFFILIATE_COMMISSION_TIERS[0];
 const nextTier=AFFILIATE_COMMISSION_TIERS.find(tier=>tier.minOrder>nextOrderNumber)||null;
 return{
  basis:'profit' as const,
  basisLabel:'Lợi nhuận đơn = giá bán − giá vốn',
  closedOrders:closed,
  nextOrderNumber,
  currentRate,
  currentTier,
  nextTier,
  tiers:AFFILIATE_COMMISSION_TIERS
 };
}
