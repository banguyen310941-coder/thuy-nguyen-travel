export type ProductLocationLike={
 place?:unknown;
 address?:unknown;
 boarding?:unknown;
 pickup?:unknown;
 latitude?:unknown;
 longitude?:unknown;
};

export type Coordinates={latitude:number;longitude:number};

export function coordinateNumber(value:unknown):number|null{
 if(value===null||value===undefined||value==='')return null;
 const parsed=typeof value==='number'?value:Number(String(value).trim().replace(',','.'));
 return Number.isFinite(parsed)?parsed:null;
}

export function validCoordinates(latitude:unknown,longitude:unknown):boolean{
 const lat=coordinateNumber(latitude),lng=coordinateNumber(longitude);
 return lat!==null&&lng!==null&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180;
}

export function productCoordinates(product:ProductLocationLike):Coordinates|null{
 const latitude=coordinateNumber(product.latitude),longitude=coordinateNumber(product.longitude);
 return validCoordinates(latitude,longitude)?{latitude:latitude as number,longitude:longitude as number}:null;
}

export function productLocationDetail(product:ProductLocationLike):string{
 return String(product.address||product.boarding||product.pickup||'').trim();
}

export function productLocationLabel(product:ProductLocationLike):string{
 return productLocationDetail(product)||String(product.place||'').trim();
}

export function productLocationIssues(product:ProductLocationLike):string[]{
 const issues:string[]=[];
 if(!String(product.place||'').trim())issues.push('Khu vực / điểm đến');
 if(!productLocationDetail(product))issues.push('Địa chỉ / bến khởi hành');
 if(!validCoordinates(product.latitude,product.longitude))issues.push('Tọa độ bản đồ chính xác');
 return issues;
}

export function distanceKm(a:Coordinates,b:Coordinates):number{
 const radius=6371;
 const rad=(value:number)=>value*Math.PI/180;
 const dLat=rad(b.latitude-a.latitude),dLng=rad(b.longitude-a.longitude);
 const lat1=rad(a.latitude),lat2=rad(b.latitude);
 const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
 return 2*radius*Math.asin(Math.min(1,Math.sqrt(h)));
}

export function distanceBetween(a:ProductLocationLike,b:ProductLocationLike):number|null{
 const first=productCoordinates(a),second=productCoordinates(b);
 return first&&second?distanceKm(first,second):null;
}

export function mapsQuery(product:ProductLocationLike):string{
 const coordinates=productCoordinates(product);
 if(coordinates)return `${coordinates.latitude},${coordinates.longitude}`;
 return productLocationLabel(product)||String(product.place||'').trim();
}

export function googleMapsUrl(product:ProductLocationLike):string{
 const query=mapsQuery(product);
 return query?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`:'';
}

export function googleMapsEmbedUrl(product:ProductLocationLike):string{
 const query=mapsQuery(product);
 return query?`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`:'';
}

export function extractCoordinates(value:string):Coordinates|null{
 const raw=String(value||'').trim();
 if(!raw)return null;
 const patterns=[
  /@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/,
  /(?:query|q|destination)=(-?\d{1,2}(?:\.\d+)?)(?:%2C|,)(-?\d{1,3}(?:\.\d+)?)/i,
  /^\s*(-?\d{1,2}(?:[.,]\d+)?)\s*[,;]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/,
 ];
 for(const pattern of patterns){
  const match=raw.match(pattern);
  if(!match)continue;
  const latitude=Number(match[1].replace(',','.')),longitude=Number(match[2].replace(',','.'));
  if(validCoordinates(latitude,longitude))return{latitude,longitude};
 }
 return null;
}

export function normalizePlace(value:unknown):string{
 return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
}

export function samePlace(a:unknown,b:unknown):boolean{
 const first=normalizePlace(a),second=normalizePlace(b);
 if(!first||!second)return false;
 return first===second||first.includes(second)||second.includes(first);
}
