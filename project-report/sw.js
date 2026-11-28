const __clean=r=>r&&r.redirected?r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})):Promise.resolve(r);
const __pre=(c,F)=>Promise.all(F.map(u=>fetch(u,{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("precache "+u);return __clean(r).then(x=>c.put(u,x))})));
const V='prg-v2-cf2';const FILES=['./','index.html','app.js','app.css','config.js','manifest.json','icon.svg','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>__pre(c,FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>__clean(c).then(z=>x.put(e.request,z)));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html')).then(__clean)))});
