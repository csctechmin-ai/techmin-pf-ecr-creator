const CACHE="gstr2b-reco-1.1.0";const FILES=["./", "index.html", "core.css", "app.js", "docs.js", "guide.js", "icon.svg", "manifest.webmanifest", "lib/engine.js", "lib/sample.js", "lib/xlsx.full.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});return res}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))});
