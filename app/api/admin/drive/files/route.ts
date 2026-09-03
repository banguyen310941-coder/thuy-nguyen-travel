import {NextRequest,NextResponse} from 'next/server';

function authorized(req:NextRequest){const expected=process.env.ADMIN_API_KEY||'';return Boolean(expected)&&(req.headers.get('x-admin-key')||'')===expected}
async function accessToken(){
 const clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET,refreshToken=process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
 if(!clientId||!clientSecret||!refreshToken)throw new Error('GOOGLE_DRIVE_OAUTH_NOT_CONFIGURED');
 const body=new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:'refresh_token'});
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store'});
 if(!r.ok)throw new Error(`GOOGLE_TOKEN_${r.status}_${await r.text()}`);
 const j=await r.json();return String(j.access_token||'');
}
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:'Unauthorized'},{status:401});
 const folderId=process.env.GOOGLE_DRIVE_FOLDER_ID||'';
 if(!folderId)return NextResponse.json({error:'GOOGLE_DRIVE_FOLDER_ID chưa được cấu hình.'},{status:503});
 try{
  const token=await accessToken();
  const q=`'${folderId.replace(/'/g,"\\'")}' in parents and trashed=false`;
  const u=new URL('https://www.googleapis.com/drive/v3/files');u.searchParams.set('q',q);u.searchParams.set('fields','files(id,name,mimeType,modifiedTime,webViewLink,size)');u.searchParams.set('orderBy','modifiedTime desc');u.searchParams.set('pageSize','100');
  const r=await fetch(u,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(!r.ok)throw new Error(`DRIVE_${r.status}_${await r.text()}`);
  const j=await r.json();return NextResponse.json({ok:true,folderId,files:j.files||[]});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Drive connection failed'},{status:502})}
}
