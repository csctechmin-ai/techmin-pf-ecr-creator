import{esc as a,formatDate as v}from"../core/utils.js";import{getUpdates as c,refreshFeed as y,markRead as f}from"../core/feed.js";import{getLicenceState as k}from"../core/licence.js";import{getCurrentUser as E}from"../core/auth.js";import{renderRichText as p}from"../core/richtext.js";import{pushState as x,enablePush as T,disablePush as L}from"../core/push.js";let r="NOTICES";const h={info:["ℹ️","Information","badge-info"],important:["","Important","badge-danger"],warning:["","Warning","badge-warning"],offer:["","Offer","badge-success"],update:["🆕","Software update","badge-info"]};async function u(){const s=await k();return{cid:s.payload?.cid||"",plan:s.plan||"TRIAL",userId:E()?.id||"anon"}}async function l(s,o){const i=await u(),t=await c(i),n=t.notices.filter(e=>!e.read).length,m=t.posts.filter(e=>!e.read).length,d=await x().catch(()=>({supported:!1}));s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Techmin Updates</h1>
        <p>Notices, offers and software news from ${a(t.vendor.name)}, and articles from our blog</p>
      </div>
      <div class="module-actions"><button class="btn btn-outline btn-sm" id="news-refresh">↻ Check for new updates</button></div>
    </div>
    ${d.supported?d.subscribed&&d.permission==="granted"?`<div class="callout success push-callout"><div><strong>Push notifications are on.</strong> Messages from ${a(t.vendor.name)} appear on this computer even when VLEBook is closed (while Chrome/Edge runs in the background).</div><button class="btn btn-sm btn-outline" id="push-off">Turn off</button></div>`:`<div class="callout push-callout"><div><strong>Get important messages instantly.</strong> Turn on push notifications to receive notices from ${a(t.vendor.name)} even when VLEBook is closed.${d.permission==="denied"?" <br><small>Notifications are blocked: click the lock icon in the address bar → Notifications → Allow, then reload.</small>":""}</div><button class="btn btn-sm btn-primary" id="push-on">Turn on push notifications</button></div>`:""}
    <div class="auth-error" id="push-msg"></div>
    <div class="pill-tabs" style="margin-bottom:16px;">
      <button class="pill-tab ${r==="NOTICES"?"active":""}" data-news-tab="NOTICES">Notices${n?` (${n})`:""}</button>
      <button class="pill-tab ${r==="BLOG"?"active":""}" data-news-tab="BLOG">Blog${m?` (${m})`:""}</button>
    </div>
    <div id="news-body">
      ${r==="NOTICES"?t.notices.length?t.notices.map(e=>{const[w,g,$]=h[e.level]||h.info;return`<div class="card news-card ${e.read?"":"unread"}" data-notice="${a(e.id)}">
                    <div class="news-head"><span class="badge ${$}">${w} ${a(g)}</span>${e.date?`<small>${a(v(e.date))}</small>`:""}${e.read?"":'<span class="news-new">NEW</span>'}</div>
                    <h3 data-no-i18n>${a(e.title)}</h3>
                    <div class="news-body" data-no-i18n>${p(e.message)}</div>
                    ${e.link?`<a class="btn btn-sm btn-primary" href="${a(e.link)}" target="_blank" rel="noopener noreferrer" data-no-i18n>${a(e.linkText)} ↗</a>`:""}
                  </div>`}).join(""):`<div class="card"><p style="margin:0; color:var(--color-text-muted);">No notices right now.${t.fetchedAt?"":" Connect to the internet to receive notices from Techmin."}</p></div>`:t.posts.length?`<div class="news-grid">${t.posts.map(e=>`<a class="card news-post ${e.read?"":"unread"}" ${e.link?`href="${a(e.link)}" target="_blank" rel="noopener noreferrer"`:""} data-post="${a(e.id)}">
                    ${e.image?`<img src="${a(e.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:""}
                    <div class="news-post-body">
                      <small>${a(e.date?v(e.date):"")}</small>
                      <h3 data-no-i18n>${a(e.title)}</h3>
                      <p data-no-i18n>${a(e.summary)}</p>
                      ${e.body?`<div class="news-body" data-no-i18n>${p(e.body)}</div>`:""}
                      ${e.link?'<span class="news-read-more">Read full article ↗</span>':""}
                    </div>
                  </a>`).join("")}</div>`:'<div class="card"><p style="margin:0; color:var(--color-text-muted);">No articles yet. Connect to the internet to load the latest posts.</p></div>'}
    </div>`,s.querySelectorAll("[data-news-tab]").forEach(e=>e.addEventListener("click",()=>{r=e.getAttribute("data-news-tab"),l(s,o)})),s.querySelector("#news-refresh").addEventListener("click",async()=>{await y(),await l(s,o),o?.()}),s.querySelector("#push-on")?.addEventListener("click",async()=>{try{await T(),await l(s,o)}catch(e){s.querySelector("#push-msg").textContent=e.message}}),s.querySelector("#push-off")?.addEventListener("click",async()=>{await L().catch(()=>{}),await l(s,o)});const b=r==="NOTICES"?t.notices.filter(e=>!e.read).map(e=>e.id):t.posts.filter(e=>!e.read).map(e=>e.id);b.length&&(await f(i.userId,b),o?.())}async function A(){const s=await u(),o=await c(s),i=o.notices.filter(n=>!n.read&&(n.popup||n.level==="important"));if(!i.length)return;const t=document.createElement("div");t.className="modal-backdrop open",t.id="news-popup",t.innerHTML=`
    <div class="modal-dialog" style="max-width:520px;">
      <div class="modal-header"><h3>Message from ${a(o.vendor.name)}</h3></div>
      <div class="modal-body">
        ${i.map(n=>`<div class="news-popup-item"><h4 data-no-i18n>${a(n.title)}</h4><div class="news-body" data-no-i18n>${p(n.message)}</div>${n.link?`<a class="btn btn-sm btn-outline" href="${a(n.link)}" target="_blank" rel="noopener noreferrer" data-no-i18n>${a(n.linkText)} ↗</a>`:""}</div>`).join("")}
        <button type="button" class="btn btn-primary" id="news-popup-ok" style="margin-top:12px;">OK, got it</button>
      </div>
    </div>`,document.body.appendChild(t),t.querySelector("#news-popup-ok").addEventListener("click",async()=>{await f(s.userId,i.map(n=>n.id)),t.remove()})}async function B(){return(await c(await u())).unread}export{l as renderNewsModule,A as showImportantPopup,B as unreadUpdatesCount};
