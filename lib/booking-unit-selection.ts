export type BookingUnitReference={id?:string;code?:string;name?:string};
export type BookingUnitSelection={unitId?:string;unit?:string};

const clean=(value:unknown)=>String(value||'').trim().toLocaleLowerCase('vi-VN');

export function bookingUnitLabel(code?:string,name?:string){return [String(code||'').trim(),String(name||'').trim()].filter(Boolean).join(' · ')}

export function unitMatchesBookingSelection(selection:BookingUnitSelection,unit:BookingUnitReference){
 const selectedId=String(selection.unitId||'').trim();
 if(selectedId)return String(unit.id||'').trim()===selectedId;
 const label=clean(selection.unit);
 if(!label)return false;
 const code=clean(unit.code),name=clean(unit.name);
 if(code&&label===code)return true;
 if(name&&label===name)return true;
 if(code&&name&&(label===`${code} · ${name}`||label===`${code} - ${name}`||label===`${code} – ${name}`))return true;
 return false;
}

export function findBookingUnit<T extends BookingUnitReference>(units:T[]|undefined,selection:BookingUnitSelection):T|null{
 const list=Array.isArray(units)?units:[];
 if(selection.unitId)return list.find(unit=>String(unit.id||'')===String(selection.unitId))||null;
 return list.find(unit=>unitMatchesBookingSelection(selection,unit))||null;
}
