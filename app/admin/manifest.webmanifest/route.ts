import {NextResponse} from 'next/server';

export const dynamic='force-static';

export function GET(){
  return NextResponse.json({
    id:'/admin/',
    name:'HappyGo Travel Admin',
    short_name:'HappyGo Admin',
    description:'Ứng dụng quản trị và điều hành HappyGo Travel.',
    start_url:'/admin/?source=pwa',
    scope:'/admin/',
    display:'standalone',
    display_override:['standalone','minimal-ui'],
    background_color:'#ffffff',
    theme_color:'#0d47a1',
    lang:'vi',
    categories:['business','productivity'],
    prefer_related_applications:false,
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
  },{headers:{'Content-Type':'application/manifest+json; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
}
