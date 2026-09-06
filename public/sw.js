const CACHE='happygo-shell-v7';
const SHELL=['/','/admin','/admin/','/icon.svg'];

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

  // Manifests define app identity/start_url. Never serve a stale cached manifest,
  // otherwise an Admin icon can keep opening the public homepage after a fix.
  if(url.pathname.endsWith('/manifest.webmanifest')||url.pathname==='/manifest.webmanifest'){
    event.respondWith(fetch(req));
    return;
  }

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
      if(url.pathname.startsWith('/admin')){
        // Never let an installed Admin app silently fall through to the public
        // homepage. The cached admin shell is the only valid offline fallback.
        const admin=(await caches.match('/admin/'))||(await caches.match('/admin'));
        return admin||new Response('HappyGo Admin đang ngoại tuyến. Vui lòng kết nối mạng và mở lại ứng dụng.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      }
      return (await caches.match('/'))||new Response('HappyGo Travel đang ngoại tuyến.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
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
