const __clean=r=>r&&r.redirected?r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})):Promise.resolve(r);
const __pre=(c,F)=>Promise.all(F.map(u=>fetch(u,{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("precache "+u);return __clean(r).then(x=>c.put(u,x))})));
const CACHE="gstr2b-reco-1.2.1-cf1";const FILES=["./", "index.html", "core.css", "app.js", "docs.js", "guide.js", "icon.svg", "manifest.webmanifest", "lib/engine.js", "lib/sample.js", "lib/xlsx.full.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>__pre(c,FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>__clean(c).then(z=>x.put(e.request,z))).catch(()=>{});return res}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html")).then(__clean)))});
