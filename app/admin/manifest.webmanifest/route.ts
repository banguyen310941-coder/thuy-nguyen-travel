import {NextResponse} from 'next/server';

export const dynamic='force-static';

export function GET(){
  return NextResponse.json({
    name:'HappyGo Travel Admin',
    short_name:'HappyGo Admin',
    description:'Ứng dụng quản trị và điều hành HappyGo Travel.',
    start_url:'/admin',
    scope:'/admin',
    display:'standalone',
    background_color:'#ffffff',
    theme_color:'#0d47a1',
    lang:'vi',
    categories:['business','productivity'],
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable'}]
  },{headers:{'Content-Type':'application/manifest+json; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
