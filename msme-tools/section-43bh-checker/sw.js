const __clean=r=>r&&r.redirected?r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})):Promise.resolve(r);
const __pre=(c,F)=>Promise.all(F.map(u=>fetch(u,{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("precache "+u);return __clean(r).then(x=>c.put(u,x))})));
const CACHE="msme-tools-section-43bh-checker-1.0.1-cf1";
const FILES=["./", "index.html", "core.css", "app.js", "docs.js", "icon.svg", "manifest.webmanifest", "lib/engine.js", "lib/data.js", "lib/core.js", "lib/shared-tabs.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>__pre(c,FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(r=>r?__clean(r):fetch(e.request)))});
