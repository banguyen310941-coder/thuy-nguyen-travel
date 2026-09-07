import {NextRequest,NextResponse} from 'next/server';
import {getGoogleDriveAccessToken} from '@/lib/server/google-drive';
import {adminActor} from '@/lib/server/admin-access';

const DRIVE_ID=/^[A-Za-z0-9_-]{10,200}$/;

export async function GET(req:NextRequest){
 const actor=await adminActor(req,'settings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const folderId=process.env.GOOGLE_DRIVE_FOLDER_ID||'';if(!folderId)return NextResponse.json({error:'GOOGLE_DRIVE_FOLDER_ID chưa được cấu hình.'},{status:503});
 const id=req.nextUrl.searchParams.get('id')||'';if(!DRIVE_ID.test(id))return NextResponse.json({error:'File Google Drive không hợp lệ.'},{status:400});
 try{
  const token=await getGoogleDriveAccessToken();
  const metaRes=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,webViewLink,parents,trashed`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!metaRes.ok)throw new Error(`DRIVE_META_${metaRes.status}`);const meta=await metaRes.json();
  if(meta.trashed||!Array.isArray(meta.parents)||!meta.parents.includes(folderId))return NextResponse.json({error:'File không thuộc thư mục HappyGo được phép.'},{status:404});
  let url='';let kind='text';
  if(meta.mimeType==='application/vnd.google-apps.document')url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=text/plain`;
  else if(meta.mimeType==='application/vnd.google-apps.spreadsheet'){url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=text/csv`;kind='csv'}
  else if(meta.mimeType==='application/vnd.google-apps.presentation'){url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}/export?mimeType=text/plain`;kind='text'}
  else if(String(meta.mimeType||'').startsWith('text/'))url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`;
  else return NextResponse.json({ok:true,meta,kind:'binary',content:'',message:'File này không hỗ trợ xem trước dạng text. Mở bằng webViewLink để kiểm tra.'},{headers:{'Cache-Control':'no-store, max-age=0'}});
  const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!r.ok)throw new Error(`DRIVE_CONTENT_${r.status}`);const content=await r.text();return NextResponse.json({ok:true,meta,kind,content:content.slice(0,200000)},{headers:{'Cache-Control':'no-store, max-age=0'}});
 }catch(error){console.error('admin_drive_file_failed',error);return NextResponse.json({error:'Không đọc được file Google Drive.'},{status:502})}
}
