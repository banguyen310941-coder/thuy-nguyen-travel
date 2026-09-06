import {spawn} from 'node:child_process';

const host='127.0.0.1';
const port=Number(process.env.ADMIN_PWA_TEST_PORT||4317);
const base=`http://${host}:${port}`;
let logs='';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H',host,'-p',String(port)],{
  env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},
  stdio:['ignore','pipe','pipe'],
});
server.stdout.on('data',chunk=>{logs+=String(chunk)});
server.stderr.on('data',chunk=>{logs+=String(chunk)});

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(){
  for(let i=0;i<60;i++){
    if(server.exitCode!==null)throw new Error(`Next server exited early (${server.exitCode}).\n${logs}`);
    try{const response=await fetch(`${base}/admin`,{redirect:'manual'});if(response.status<500)return response}catch{}
    await sleep(500);
  }
  throw new Error(`Timed out waiting for Next server.\n${logs}`);
}
function manifestLinks(html){
  return [...html.matchAll(/<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(match=>match[1]);
}
function assert(condition,message){if(!condition)throw new Error(message)}

try{
  const adminResponse=await ready();
  assert(adminResponse.status===200,`/admin expected 200, got ${adminResponse.status}`);
  const html=await adminResponse.text();
  const links=manifestLinks(html);
  assert(links.length===1,`/admin must render exactly one manifest link, got ${JSON.stringify(links)}`);
  assert(links[0]==='/admin/manifest.webmanifest',`/admin manifest must be /admin/manifest.webmanifest, got ${links[0]||'none'}`);
  assert(!html.includes('href="/manifest.webmanifest"'),'/admin must not inherit the public manifest');

  const manifestResponse=await fetch(`${base}/admin/manifest.webmanifest`,{cache:'no-store'});
  assert(manifestResponse.status===200,`Admin manifest expected 200, got ${manifestResponse.status}`);
  const manifest=await manifestResponse.json();
  assert(manifest.id==='/admin/',`Admin manifest id must be /admin/, got ${manifest.id}`);
  assert(manifest.start_url==='/admin/?source=pwa',`Admin start_url is wrong: ${manifest.start_url}`);
  assert(manifest.scope==='/admin/',`Admin scope is wrong: ${manifest.scope}`);

  const publicManifest=await fetch(`${base}/manifest.webmanifest`,{cache:'no-store'});
  assert(publicManifest.status===200,`Public manifest route expected 200, got ${publicManifest.status}`);
  const publicJson=await publicManifest.json();
  assert(publicJson.start_url==='/'&&publicJson.scope==='/',`Public manifest route must stay scoped to /, got ${JSON.stringify({start_url:publicJson.start_url,scope:publicJson.scope})}`);

  console.log('Built Admin PWA regression checks passed.');
}finally{
  server.kill('SIGTERM');
  await Promise.race([new Promise(resolve=>server.once('exit',resolve)),sleep(2000)]);
  if(server.exitCode===null)server.kill('SIGKILL');
}
