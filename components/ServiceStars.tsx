export function ServiceStars({stars,className=''}:{stars?:number|string;className?:string}){
 const raw=Number(stars||0);const value=Number.isFinite(raw)?Math.min(5,Math.max(0,Math.round(raw))):0;
 if(!value)return null;
 return <span className={`service-stars ${className}`.trim()} aria-label={`Hạng ${value} sao`}><span aria-hidden="true">{'★'.repeat(value)}{'☆'.repeat(5-value)}</span><b>{value} sao</b></span>;
}
