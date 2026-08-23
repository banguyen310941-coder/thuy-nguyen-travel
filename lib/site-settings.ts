export type SiteSettings={brand:string;hotline:string;email:string;zalo:string};

export const DEFAULT_SITE_SETTINGS:SiteSettings={
  brand:'Thúy Nguyên Travel',
  hotline:'0969 973 949',
  email:'info@thuynguyentravel.com',
  zalo:'0969973949'
};

export const SITE_SETTINGS_KEY='tn_site_settings_v1';

export function loadSiteSettings():SiteSettings{
  if(typeof window==='undefined')return DEFAULT_SITE_SETTINGS;
  try{
    const raw=window.localStorage.getItem(SITE_SETTINGS_KEY);
    if(!raw)return DEFAULT_SITE_SETTINGS;
    return {...DEFAULT_SITE_SETTINGS,...JSON.parse(raw)};
  }catch{return DEFAULT_SITE_SETTINGS}
}

export function saveSiteSettings(value:SiteSettings){
  if(typeof window==='undefined')return;
  window.localStorage.setItem(SITE_SETTINGS_KEY,JSON.stringify(value));
  window.dispatchEvent(new Event('tn-site-settings'));
}
