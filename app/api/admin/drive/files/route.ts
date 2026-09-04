import {NextRequest,NextResponse} from 'next/server';
import {getGoogleDriveAccessToken} from '@/lib/server/google-drive';
import {adminActor} from '@/lib/server/admin-access';

export async function GET(req:NextRequest){
 const actor=await adminActor(req,'settings');if(!actor)return NextResponse.json({error:'Unauthorized'},{status:401});
 const folderId=process.env.GOOGLE_DRIVE_FOLDER_ID||'';
 if(!folderId)return NextResponse.json({error:'GOOGLE_DRIVE_FOLDER_ID chưa được cấu hình.'},{status:503});
 try{
  const token=await getGoogleDriveAccessToken();
  const q=`'${folderId.replace(/'/g,"\\'")}' in parents and trashed=false`;
  const u=new URL('https://www.googleapis.com/drive/v3/files');u.searchParams.set('q',q);u.searchParams.set('fields','files(id,name,mimeType,modifiedTime,webViewLink,size)');u.searchParams.set('orderBy','modifiedTime desc');u.searchParams.set('pageSize','100');
  const r=await fetch(u,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!r.ok)throw new Error(`DRIVE_${r.status}_${await r.text()}`);
  const j=await r.json();return NextResponse.json({ok:true,files:j.files||[]});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Drive connection failed'},{status:502})}
}
