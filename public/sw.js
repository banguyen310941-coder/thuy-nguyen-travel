const CACHE='happygo-shell-v5';
const SHELL=['/','/admin','/admin/','/manifest.webmanifest','/admin/manifest.webmanifest','/icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  // Production data must never be served from the PWA cache. Catalog, pricing,
  // authentication and admin APIs are dynamic and must always hit the network.
  if(url.pathname.startsWith('/api/')){
    event.respondWith(fetch(req));
    return;
  }

  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(cache=>cache.put(req,copy));
      return res;
    }).catch(async()=>{
      const exact=await caches.match(req);
      if(exact)return exact;
      if(url.pathname.startsWith('/admin'))return (await caches.match('/admin'))||(await caches.match('/admin/'))||(await caches.match('/'));
      return caches.match('/');
    }));
    return;
  }

  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res.ok){
      const copy=res.clone();
      caches.open(CACHE).then(cache=>cache.put(req,copy));
    }
    return res;
  })));
});
