import {createCipheriv,createECDH,createHmac,createPrivateKey,randomBytes,sign} from 'crypto';

export type WebPushSubscription={endpoint:string;keys:{p256dh:string;auth:string}};
export type WebPushPayload={title:string;body:string;url?:string;tag?:string};

function b64url(value:Buffer|string){return Buffer.isBuffer(value)?value.toString('base64url'):Buffer.from(value).toString('base64url')}
function decode(value:string){return Buffer.from(String(value||''),'base64url')}
function hmac(key:Buffer,data:Buffer){return createHmac('sha256',key).update(data).digest()}
function expand(prk:Buffer,info:Buffer,length:number){return hmac(prk,Buffer.concat([info,Buffer.from([1])])).subarray(0,length)}
function seed(){const value=(process.env.WEB_PUSH_VAPID_PRIVATE_KEY||'').trim();if(value){const raw=decode(value);if(raw.length!==32)throw new Error('WEB_PUSH_VAPID_PRIVATE_KEY_INVALID');return raw}const base=(process.env.AUTH_SECRET||process.env.ADMIN_API_KEY||'').trim();if(!base)throw new Error('WEB_PUSH_SECRET_REQUIRED');for(let i=0;i<256;i++){const raw=createHmac('sha256',base).update(`happygo:web-push:v1:${i}`).digest();const probe=createECDH('prime256v1');try{probe.setPrivateKey(raw);return raw}catch{}}throw new Error('WEB_PUSH_PRIVATE_KEY_DERIVATION_FAILED')}
function keyPair(){const privateKey=seed(),ecdh=createECDH('prime256v1');ecdh.setPrivateKey(privateKey);const publicKey=ecdh.getPublicKey(undefined,'uncompressed');return{privateKey,publicKey}}

export function webPushPublicKey(){return b64url(keyPair().publicKey)}

function vapidToken(endpoint:string){
 const {privateKey,publicKey}=keyPair(),audience=new URL(endpoint).origin,subject=(process.env.WEB_PUSH_SUBJECT||'mailto:info@happygo.vn').trim();
 const header=b64url(JSON.stringify({typ:'JWT',alg:'ES256'})),payload=b64url(JSON.stringify({aud:audience,exp:Math.floor(Date.now()/1000)+12*60*60,sub:subject}));
 const unsigned=`${header}.${payload}`,x=publicKey.subarray(1,33),y=publicKey.subarray(33,65);
 const key=createPrivateKey({key:{kty:'EC',crv:'P-256',x:b64url(x),y:b64url(y),d:b64url(privateKey)},format:'jwk'} as any);
 const signature=sign('sha256',Buffer.from(unsigned),{key,dsaEncoding:'ieee-p1363'});
 return{token:`${unsigned}.${b64url(signature)}`,publicKey:b64url(publicKey)};
}

function encryptedBody(subscription:WebPushSubscription,payload:WebPushPayload){
 const clientPublic=decode(subscription.keys.p256dh),auth=decode(subscription.keys.auth);if(clientPublic.length!==65||clientPublic[0]!==4)throw new Error('WEB_PUSH_P256DH_INVALID');if(auth.length<8)throw new Error('WEB_PUSH_AUTH_INVALID');
 const sender=createECDH('prime256v1');sender.generateKeys();const senderPublic=sender.getPublicKey(undefined,'uncompressed'),shared=sender.computeSecret(clientPublic);
 const prkKey=hmac(auth,shared),keyInfo=Buffer.concat([Buffer.from('WebPush: info\0'),clientPublic,senderPublic]),ikm=expand(prkKey,keyInfo,32),salt=randomBytes(16),prk=hmac(salt,ikm),cek=expand(prk,Buffer.from('Content-Encoding: aes128gcm\0'),16),nonce=expand(prk,Buffer.from('Content-Encoding: nonce\0'),12);
 const plain=Buffer.concat([Buffer.from(JSON.stringify(payload)),Buffer.from([2])]);if(plain.length>3900)throw new Error('WEB_PUSH_PAYLOAD_TOO_LARGE');
 const cipher=createCipheriv('aes-128-gcm',cek,nonce),encrypted=Buffer.concat([cipher.update(plain),cipher.final()]),tag=cipher.getAuthTag(),header=Buffer.alloc(21);salt.copy(header,0);header.writeUInt32BE(4096,16);header.writeUInt8(senderPublic.length,20);
 return Buffer.concat([header,senderPublic,encrypted,tag]);
}

export async function sendWebPush(subscription:WebPushSubscription,payload:WebPushPayload){
 const endpoint=String(subscription.endpoint||'');if(!endpoint.startsWith('https://'))throw new Error('WEB_PUSH_ENDPOINT_INVALID');const vapid=vapidToken(endpoint),body=encryptedBody(subscription,payload);
 const response=await fetch(endpoint,{method:'POST',headers:{Authorization:`vapid t=${vapid.token}, k=${vapid.publicKey}`,'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',TTL:'86400',Urgency:'high'},body});
 return{ok:response.ok,status:response.status,text:response.ok?'':await response.text().catch(()=>''),expired:response.status===404||response.status===410};
}
