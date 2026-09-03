import {createSign} from 'crypto';

function base64Url(input:string|Buffer){
  return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}

async function serviceAccountAccessToken(){
  const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey=process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if(!email||!rawKey)return '';

  const now=Math.floor(Date.now()/1000);
  const header=base64Url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  const payload=base64Url(JSON.stringify({
    iss:email,
    scope:'https://www.googleapis.com/auth/drive.readonly',
    aud:'https://oauth2.googleapis.com/token',
    iat:now,
    exp:now+3600,
  }));
  const unsigned=`${header}.${payload}`;
  const signer=createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const privateKey=rawKey.replace(/\\n/g,'\n');
  const signature=base64Url(signer.sign(privateKey));
  const assertion=`${unsigned}.${signature}`;

  const body=new URLSearchParams({
    grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  const response=await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body,
    cache:'no-store',
  });
  if(!response.ok)throw new Error(`GOOGLE_SERVICE_ACCOUNT_TOKEN_${response.status}_${await response.text()}`);
  const json=await response.json();
  return String(json.access_token||'');
}

async function refreshTokenAccessToken(){
  const clientId=process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret=process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken=process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();
  if(!clientId||!clientSecret||!refreshToken)return '';

  const body=new URLSearchParams({
    client_id:clientId,
    client_secret:clientSecret,
    refresh_token:refreshToken,
    grant_type:'refresh_token',
  });
  const response=await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body,
    cache:'no-store',
  });
  if(!response.ok)throw new Error(`GOOGLE_TOKEN_${response.status}_${await response.text()}`);
  const json=await response.json();
  return String(json.access_token||'');
}

export function isGoogleDriveConfigured(){
  const folder=Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID?.trim());
  const serviceAccount=Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()&&process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim());
  const oauth=Boolean(process.env.GOOGLE_CLIENT_ID?.trim()&&process.env.GOOGLE_CLIENT_SECRET?.trim()&&process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim());
  return folder&&(serviceAccount||oauth);
}

export async function getGoogleDriveAccessToken(){
  const serviceToken=await serviceAccountAccessToken();
  if(serviceToken)return serviceToken;
  const oauthToken=await refreshTokenAccessToken();
  if(oauthToken)return oauthToken;
  throw new Error('GOOGLE_DRIVE_AUTH_NOT_CONFIGURED');
}
