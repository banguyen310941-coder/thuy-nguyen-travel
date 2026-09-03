import {NextRequest,NextResponse} from 'next/server';
import {getGoogleDriveAccessToken} from '@/lib/server/google-drive';

function authorized(req:NextRequest){const expected=process.env.ADMIN_API_KEY||'';return Boolean(expected)&&(req.headers.get('x-admin-key')||'')===expected}

export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
 const id=req.nextUrl.searchParams.get('id')||'';if(!id)return NextResponse.json({error:'Missing file id'},{status:400});
 try{
  const token=await getGoogleDriveAccessToken();
  const metaRes=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,webViewLink`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!metaRes.ok)throw new Error(`DRIVE_META_${metaRes.status}`);const meta=await metaRes.json();
  let url='';let kind='text';
  if(meta.mimeType==='application/vnd.google-apps.document')url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=text/plain`;
  else if(meta.mimeType==='application/vnd.google-apps.spreadsheet'){url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=text/csv`;kind='csv'}
  else if(meta.mimeType==='application/vnd.google-apps.presentation'){url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=text/plain`;kind='text'}
  else if(String(meta.mimeType||'').startsWith('text/'))url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`;
  else return NextResponse.json({ok:true,meta,kind:'binary',content:'',message:'File này không hỗ trợ xem trước dạng text. Mở bằng webViewLink để kiểm tra.'});
  const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!r.ok)throw new Error(`DRIVE_CONTENT_${r.status}_${await r.text()}`);const content=await r.text();return NextResponse.json({ok:true,meta,kind,content:content.slice(0,200000)});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Drive read failed'},{status:502})}
}
