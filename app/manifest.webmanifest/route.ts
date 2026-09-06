import {NextResponse} from 'next/server';

export const dynamic='force-static';

export function GET(){
  return NextResponse.json({
    id:'/',
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
  },{headers:{'Content-Type':'application/manifest+json; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
}
