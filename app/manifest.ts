import type {MetadataRoute} from 'next';

export const dynamic='force-static';

export default function manifest():MetadataRoute.Manifest{
  return {
    name:'HappyGo Travel',
    short_name:'HappyGo',
    description:'HappyGo Travel - tour, khách sạn, villa, resort và du thuyền toàn quốc.',
    start_url:'/',
    scope:'/',
    display:'standalone',
    background_color:'#ffffff',
    theme_color:'#0d47a1',
    lang:'vi',
    categories:['travel','tourism','booking'],
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable'}],
  };
}
