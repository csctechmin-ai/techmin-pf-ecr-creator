import{safeHttpUrl as d,esc as t,formatDate as T}from"../core/utils.js";import{getUpdates as v,refreshFeed as C,markRead as E}from"../core/feed.js";import{getLicenceState as N}from"../core/licence.js";import{getCurrentUser as S}from"../core/auth.js";import{renderRichText as b}from"../core/richtext.js";import{pushState as I,enablePush as O,disablePush as U}from"../core/push.js";import{checkAppUpdate as A,applyAppUpdate as q}from"../core/appupdate.js";import{logAudit as P}from"../core/db.js";let m=null,l="NOTICES";const x={info:["ℹ️","Information","badge-info"],important:["","Important","badge-danger"],warning:["","Warning","badge-warning"],offer:["","Offer","badge-success"],update:["🆕","Software update","badge-info"]};async function g(){const s=await N();return{cid:s.payload?.cid||"",plan:s.plan||"TRIAL",userId:S()?.id||"anon"}}async function h(s,i){const r=await g(),a=await v(r),n=a.notices.filter(e=>!e.read).length,w=a.posts.filter(e=>!e.read).length,c=await I().catch(()=>({supported:!1}));s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Techmin Updates</h1>
        <p>Notices, offers and software news from ${t(a.vendor.name)}, and articles from our blog</p>
      </div>
      <div class="module-actions"><button class="btn btn-outline btn-sm" id="news-refresh">↻ Check for new updates</button></div>
    </div>
    ${c.supported?c.subscribed&&c.permission==="granted"?`<div class="callout success push-callout"><div><strong>Push notifications are on.</strong> Messages from ${t(a.vendor.name)} appear on this computer even when VLEBook is closed (while Chrome/Edge runs in the background).</div><button class="btn btn-sm btn-outline" id="push-off">Turn off</button></div>`:`<div class="callout push-callout"><div><strong>Get important messages instantly.</strong> Turn on push notifications to receive notices from ${t(a.vendor.name)} even when VLEBook is closed.${c.permission==="denied"?" <br><small>Notifications are blocked: click the lock icon in the address bar → Notifications → Allow, then reload.</small>":""}</div><button class="btn btn-sm btn-primary" id="push-on">Turn on push notifications</button></div>`:""}
    ${m||""}
    <div class="auth-error" id="push-msg"></div>
    <div class="pill-tabs" style="margin-bottom:16px;">
      <button class="pill-tab ${l==="NOTICES"?"active":""}" data-news-tab="NOTICES">Notices${n?` (${n})`:""}</button>
      <button class="pill-tab ${l==="BLOG"?"active":""}" data-news-tab="BLOG">Blog${w?` (${w})`:""}</button>
    </div>
    <div id="news-body">
      ${l==="NOTICES"?a.notices.length?a.notices.map(e=>{const[p,o,f]=x[e.level]||x.info;return`<div class="card news-card ${e.read?"":"unread"}" data-notice="${t(e.id)}">
                    <div class="news-head"><span class="badge ${f}">${p} ${t(o)}</span>${e.date?`<small>${t(T(e.date))}</small>`:""}${e.read?"":'<span class="news-new">NEW</span>'}</div>
                    <h3 data-no-i18n>${t(e.title)}</h3>
                    <div class="news-body" data-no-i18n>${b(e.message)}</div>
                    ${d(e.link)?`<a class="btn btn-sm btn-primary" href="${t(d(e.link))}" target="_blank" rel="noopener noreferrer" data-no-i18n>${t(e.linkText)} ↗</a>`:""}
                  </div>`}).join(""):`<div class="card"><p style="margin:0; color:var(--color-text-muted);">No notices right now.${a.fetchedAt?"":" Connect to the internet to receive notices from Techmin."}</p></div>`:a.posts.length?`<div class="news-grid">${a.posts.map(e=>`<a class="card news-post ${e.read?"":"unread"}" ${d(e.link)?`href="${t(d(e.link))}" target="_blank" rel="noopener noreferrer"`:""} data-post="${t(e.id)}">
                    ${e.image?`<img src="${t(e.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:""}
                    <div class="news-post-body">
                      <small>${t(e.date?T(e.date):"")}</small>
                      <h3 data-no-i18n>${t(e.title)}</h3>
                      <p data-no-i18n>${t(e.summary)}</p>
                      ${e.body?`<div class="news-body" data-no-i18n>${b(e.body)}</div>`:""}
                      ${e.link?'<span class="news-read-more">Read full article ↗</span>':""}
                    </div>
                  </a>`).join("")}</div>`:'<div class="card"><p style="margin:0; color:var(--color-text-muted);">No articles yet. Connect to the internet to load the latest posts.</p></div>'}
    </div>`,s.querySelectorAll("[data-news-tab]").forEach(e=>e.addEventListener("click",()=>{l=e.getAttribute("data-news-tab"),h(s,i)})),s.querySelector("#news-refresh").addEventListener("click",async e=>{const p=e.currentTarget;p.disabled=!0,p.textContent="Checking…";const[o,f]=await Promise.all([A(),C().catch(()=>({}))]),y=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),k=f?.lastCheck||{},L=typeof navigator>"u"||navigator.onLine!==!1;let u;o.ok&&o.newer?u=`<div class="callout warning" id="news-check-result" style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;"><div><strong>New version ${t(o.latest)} is available.</strong> You are on ${t(o.current)}. Your data stays on this computer; updating only loads the new program files.</div><button class="btn btn-sm btn-primary" id="news-apply-update">Update now</button></div>`:o.ok?u=`<div class="callout success" id="news-check-result"><strong>VLEBook is up to date</strong> (version ${t(o.current)}). ${k.noticesOk||k.blogOk?"Notices and blog refreshed":"Notices could not be fetched just now"} · checked at ${t(y)}.</div>`:u=`<div class="callout danger" id="news-check-result"><strong>Could not check for updates.</strong> ${L?"The update server did not respond. Try again in a minute.":"This computer is offline. Connect to the internet and try again."} (You are on version ${t(o.current)}; checked at ${t(y)}.)</div>`,m=u;try{await P("UPDATE_CHECK","news","",o.ok?`Checked for updates: on ${o.current}, latest ${o.latest}${o.newer?" (update available)":""}`:`Update check failed (on ${o.current})`)}catch{}await h(s,i),m=null,i?.()}),s.querySelector("#news-apply-update")?.addEventListener("click",async e=>{e.currentTarget.disabled=!0,e.currentTarget.textContent="Updating…",await q()}),s.querySelector("#push-on")?.addEventListener("click",async()=>{try{await O(),await h(s,i)}catch(e){s.querySelector("#push-msg").textContent=e.message}}),s.querySelector("#push-off")?.addEventListener("click",async()=>{await U().catch(()=>{}),await h(s,i)});const $=l==="NOTICES"?a.notices.filter(e=>!e.read).map(e=>e.id):a.posts.filter(e=>!e.read).map(e=>e.id);$.length&&(await E(r.userId,$),i?.())}async function Y(){const s=await g(),i=await v(s),r=i.notices.filter(n=>!n.read&&(n.popup||n.level==="important"));if(!r.length)return;const a=document.createElement("div");a.className="modal-backdrop open",a.id="news-popup",a.innerHTML=`
    <div class="modal-dialog" style="max-width:520px;">
      <div class="modal-header"><h3>Message from ${t(i.vendor.name)}</h3></div>
      <div class="modal-body">
        ${r.map(n=>`<div class="news-popup-item"><h4 data-no-i18n>${t(n.title)}</h4><div class="news-body" data-no-i18n>${b(n.message)}</div>${d(n.link)?`<a class="btn btn-sm btn-outline" href="${t(d(n.link))}" target="_blank" rel="noopener noreferrer" data-no-i18n>${t(n.linkText)} ↗</a>`:""}</div>`).join("")}
        <button type="button" class="btn btn-primary" id="news-popup-ok" style="margin-top:12px;">OK, got it</button>
      </div>
    </div>`,document.body.appendChild(a),a.querySelector("#news-popup-ok").addEventListener("click",async()=>{await E(s.userId,r.map(n=>n.id)),a.remove()})}async function K(){return(await v(await g())).unread}export{h as renderNewsModule,Y as showImportantPopup,K as unreadUpdatesCount};
