import {NextRequest,NextResponse} from 'next/server';
import {getGoogleDriveAccessToken} from '@/lib/server/google-drive';

export const dynamic='force-dynamic';
export const runtime='nodejs';

const DRIVE_ID=/^[A-Za-z0-9_-]{10,100}$/;

export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!DRIVE_ID.test(id||''))return NextResponse.json({error:'Invalid image id'},{status:400});
  try{
    const token=await getGoogleDriveAccessToken();
    const source=new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`);
    source.searchParams.set('alt','media');
    const headers:Record<string,string>={Authorization:`Bearer ${token}`};
    const range=req.headers.get('range');
    if(range)headers.Range=range;
    const response=await fetch(source,{headers,cache:'no-store'});
    if(!response.ok)return NextResponse.json({error:'Image not found'},{status:response.status===404?404:502});
    const contentType=response.headers.get('content-type')||'';
    if(!contentType.toLowerCase().startsWith('image/'))return NextResponse.json({error:'File is not an image'},{status:415});
    const outHeaders=new Headers();
    outHeaders.set('Content-Type',contentType);
    outHeaders.set('Content-Disposition','inline');
    outHeaders.set('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    const length=response.headers.get('content-length');if(length)outHeaders.set('Content-Length',length);
    const etag=response.headers.get('etag');if(etag)outHeaders.set('ETag',etag);
    const contentRange=response.headers.get('content-range');if(contentRange)outHeaders.set('Content-Range',contentRange);
    const acceptRanges=response.headers.get('accept-ranges');if(acceptRanges)outHeaders.set('Accept-Ranges',acceptRanges);
    return new NextResponse(response.body,{status:response.status,headers:outHeaders});
  }catch(error){
    console.error('public_drive_image_failed',id,error);
    return NextResponse.json({error:'Image unavailable'},{status:502});
  }
}
