import{planCardsHTML as j}from"./subscribe.js";import{TRIAL_DAYS as H}from"../core/plans.js";import{inr as Y}from"../core/plans.js";import{getRecord as k,putRecord as $,logAudit as W}from"../core/db.js";import{safeHttpUrl as N,esc as r}from"../core/utils.js";import{getLicenceState as O,activateLicence as J,verifyResetToken as K,refreshRemoteStatus as C,requireOnline as L,PLAN_LABELS as z}from"../core/licence.js";import{CENTRE_TYPES as X,isAkshaya as R,checkCentreDetails as Q}from"../core/centreinfo.js";import{hasAnyUser as Z,setupOwner as ee,login as D,logout as P,resumeSession as te,recoverWithCode as ae,findUser as ne,setPassword as oe,changeOwnPassword as re,getCurrentUser as se}from"../core/auth.js";import{getVendor as B}from"../core/feed.js";import{runAutoBackup as ie}from"../core/autobackup.js";import{LEGAL as ce}from"../core/helpdocs.js";import{setLang as le,getLang as de}from"../core/i18n.js";let b=null;function T(){return b||(b=document.createElement("div"),b.id="auth-gate",b.className="auth-gate",document.body.classList.remove("booting"),document.body.appendChild(b)),document.body.classList.add("gated"),b}function x(){document.body.classList.remove("gated"),b?.remove(),b=null}function ue(){const e=de();return`<select class="form-control auth-lang" id="gate-lang" data-no-i18n>
    <option value="en" ${e==="en"?"selected":""}>English</option>
    <option value="hi" ${e==="hi"?"selected":""}>हिन्दी</option>
    <option value="ml" ${e==="ml"?"selected":""}>മലയാളം</option>
  </select>`}function me(){const e=[["🧾","Billing & GST","Multi-service bills with government fee kept apart, GST tax invoices, credit notes, GSTR-1 / 3B help"],["📒","Books kept for you","Double-entry books, day close, cash and bank books, wallets, P&L and balance sheet"],["🖨️","PDF, photo & PVC studio","PDF tools, exam photo / signature sizes, OCR in Malayalam / Hindi, PVC ID cards"],["🔔","Reminders & originals","Insurance, pollution and licence renewals on WhatsApp; original-document custody"],["🎓","Learn in your language","Lessons, guided tours and manuals in English, हिन्दी and മലയാളം; training mode"],["🔒","Your data stays with you","Works offline on your computer; automatic backups to your own Drive or folder"]],n=[["billing","Billing"],["books","Books & GST"],["studio","PDF & Image Studio"]];return`<aside class="auth-showcase" aria-label="About VLEBook">
    <div class="sc-ribbon">${H}-day free trial · then from ${Y(249)}/month + GST</div>
    <h2>Office software for CSC, Akshaya &amp; e-Seva centres</h2>
    <p class="sc-lead">Bill faster, keep accounts right, and give customers proper GST invoices — on your own computer, even without internet.</p>
    <ul class="sc-features">${e.map(([t,a,s])=>`<li><span class="sc-ic" aria-hidden="true">${t}</span><div><b>${a}</b><span>${s}</span></div></li>`).join("")}</ul>
    <div class="sc-shots">${n.map(([t,a])=>`<figure><img src="help/learn/img/${t}.jpg" alt="VLEBook ${a} screen (sample data)" loading="lazy"><figcaption>${a}</figcaption></figure>`).join("")}</div>
    <h3>Plans <small>(yearly: 12 months for the price of 11)</small></h3>
    ${j({cycle:"Y",compact:!0})}
    <p class="sc-foot">Prices + 18% GST. Pay monthly or yearly by UPI, card or net banking (Razorpay); the licence is applied instantly and Techmin's GST tax invoice is emailed. <a href="about.html" target="_blank" rel="noopener">All features &amp; plans ↗</a></p>
  </aside>`}function v(e,{wide:n=!1,show:t=!1}={}){return t?`<div class="auth-layout">${v(e,{wide:n})}${me()}</div>`:`
    <div class="auth-card ${n?"wide":""}">
      <div class="auth-brand">
        <img src="icons/vlebook-logo${document.documentElement.getAttribute("data-theme")==="dark"?"-dark":""}.svg" alt="VLEBook" class="auth-logo">
        <span class="early-badge" title="VLEBook is in early access: features may change and some errors may remain. Keep regular backups.">Early access</span>
        ${ue()}
      </div>
      ${e}
    </div>`}function I(e,n){e.querySelector("#gate-lang")?.addEventListener("change",async t=>{le(t.target.value);const a=await k("settings","CENTRE_CONFIG");a&&await $("settings",{...a,language:t.target.value},{notifyAutosave:!1,skipChangeTracking:!0}),n()})}function A(e){const n=String(e.whatsapp||"").replace(/\D/g,""),t=[e.phone?`Phone: <a href="tel:${r(e.phone)}">${r(e.phone)}</a>`:"",n?`<a href="https://wa.me/${n.length===10?"91"+n:n}" target="_blank" rel="noopener">WhatsApp</a>`:"",e.email?`Email: <a href="mailto:${r(e.email)}">${r(e.email)}</a>`:"",N(e.website)?`<a href="${r(N(e.website))}" target="_blank" rel="noopener">${r(e.website.replace(/^https?:\/\//,"").replace(/\/$/,""))}</a>`:""].filter(Boolean);return`<div class="auth-contact"><strong>${r(e.name||"Techmin")} support</strong>${t.length?`<div>${t.join(" &nbsp;·&nbsp; ")}</div>`:""}</div>`}function V(e){return e.plan==="MONTHS"&&e.months?`${e.months}-month licence`:e.plan==="BASIC"?"Basic mode":`${z[e.plan]||e.plan||""} licence`}function G(e){return e.status==="TRIAL"?`Full-version trial · ${e.daysLeft} day(s) left`:e.status==="BASIC"?"Basic mode (trial or licence ended)":e.payload?e.validTill?`${V(e)} · valid for ${e.daysLeft} day(s), till ${e.validTill.split("-").reverse().join("-")}`:`${V(e)} · lifetime`:e.message}function pe(e){return`
    <div class="auth-device">
      <div><small>Your Device Code</small><div class="device-code" id="gate-device" data-no-i18n>${r(e.deviceCode)}</div></div>
      <button type="button" class="btn btn-sm btn-outline" id="gate-copy-device">Copy</button>
    </div>
    <p class="auth-hint">Send this Device Code to Techmin with your payment. You will receive a licence key for this computer.</p>
    <form id="gate-licence-form" class="auth-form">
      <label class="form-label">Licence key</label>
      <textarea class="form-control" name="key" rows="3" placeholder="Paste the licence key (starts with VLE1.)" data-no-i18n required></textarea>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button type="submit" class="btn btn-primary">Activate Licence</button>
        <label class="btn btn-outline" style="cursor:pointer;">Open licence file<input type="file" id="gate-licence-file" accept=".vlelic,.txt" hidden></label>
      </div>
      <div class="auth-error" id="gate-licence-error"></div>
    </form>`}function ge(e,n){e.querySelector("#gate-copy-device")?.addEventListener("click",async()=>{const t=e.querySelector("#gate-device").textContent.trim();try{await navigator.clipboard.writeText(t)}catch{}e.querySelector("#gate-copy-device").textContent="Copied ✓"}),e.querySelector("#gate-licence-file")?.addEventListener("change",async t=>{const a=t.target.files?.[0];a&&(e.querySelector("#gate-licence-form [name=key]").value=(await a.text()).trim())}),e.querySelector("#gate-licence-form")?.addEventListener("submit",async t=>{t.preventDefault();const a=e.querySelector("#gate-licence-error");a.textContent="";try{await J(new FormData(t.target).get("key")),await n()}catch(s){a.textContent=s.message}})}async function q(e,n){const t=T(),a=await B(),s={REVOKED:"Licence cancelled",SUSPENDED:"Account suspended",WRONG_DEVICE:"Licence is for another computer",CLOCK:"Check your computer date & time",NOT_STARTED:"Licence not started yet",INVALID:"Licence problem"}[e.status]||"Licence required";t.innerHTML=v(`<h2 class="auth-h">${r(s)}</h2>
     <div class="callout warning"><div>${r(e.message)}</div></div>
     ${e.status==="CLOCK"?"":pe(e)}
     <div class="auth-divider"></div>
     <p class="auth-hint"><strong>Your data is safe on this computer.</strong> You can still download a complete backup (JSON + TXT).</p>
     <button type="button" class="btn btn-outline" id="gate-backup-btn">Download backup of my data</button>
     <div class="auth-error" id="gate-backup-msg" style="color:var(--color-success);"></div>
     ${A(a)}`,{wide:!0}),I(t,()=>q(e,n)),ge(t,()=>we().then(n)),t.querySelector("#gate-backup-btn")?.addEventListener("click",async()=>{const f=await ie({reason:"MANUAL",forceDownload:!0});t.querySelector("#gate-backup-msg").textContent=`Saved: ${f.files.join(", ")}`})}const he=new Set(["JanSeva & Akshaya Digital Kendra","Centre Administrator","Main Market Road, Near Taluk Office","Ernakulam / Pune","682001","9876543210","desk@vlebook.local","CSC"]),w=e=>e&&!he.has(String(e))?e:"";async function _(e,n){try{const o=location.hostname;if(!(new URLSearchParams(location.search).has("start")||new URLSearchParams(location.search).has("signin")||sessionStorage.getItem("vlebook_seen_about"))&&o!=="127.0.0.1"&&o!=="localhost")return sessionStorage.setItem("vlebook_seen_about","1"),location.replace("about.html"),new Promise(()=>{});sessionStorage.setItem("vlebook_seen_about","1")}catch{}const t=T(),a=await k("settings","CENTRE_CONFIG"),s=a?{...a,centreName:w(a.centreName),ownerName:w(a.ownerName),mobile:w(a.mobile),email:w(a.email),district:w(a.district),address:w(a.address),pinCode:w(a.pinCode),centreType:w(a.centreType)}:null,f=typeof window.showDirectoryPicker=="function",p=new URLSearchParams(location.search).has("signin");t.innerHTML=v(`${f?`<div class="auth-centre-signin ${p?"":"is-collapsed"}" id="gate-signin-help">
       <strong>Sign in to my centre</strong>
       <p class="auth-hint">There is no VLEBook account on this computer yet. If your centre already uses VLEBook, enter your user name and password, then choose your centre's folder (the folder that contains VLEBook-sync, or your backup files). VLEBook checks them against your centre's own data on this computer, brings the centre here and signs you in. Nothing is sent to Techmin for this check.</p>
       <form id="gate-centre-signin" class="auth-form" autocomplete="on">
         <label class="form-label">User name</label>
         <input class="form-control" name="username" required autocomplete="username" data-no-i18n>
         <label class="form-label">Password</label>
         <input class="form-control" type="password" name="password" required autocomplete="current-password">
         <button type="submit" class="btn btn-primary">Choose the centre folder and sign in</button>
         <div class="auth-error" id="gate-centre-signin-msg" role="status"></div>
       </form>
       <button type="button" class="btn-link" id="gate-goto-restore">The backups are password-protected? Use Restore from backup folder</button>
     </div>
     ${p?"":'<button type="button" class="btn btn-outline auth-signin-open" id="gate-signin-open">I already have a user name — Sign in to my centre</button>'}`:p?'<div class="callout warning"><div>There is no VLEBook account on this computer yet. Open VLEBook in Chrome or Edge on a computer to sign in to an existing centre.</div></div>':""}
    ${f?`<div class="auth-join" id="gate-join-box">
       <strong>Does your centre already use VLEBook on another computer?</strong>
       <p class="auth-hint">Join it here: choose the same Google Drive folder that the main computer uses for backups. The centre's users, customers, services and accounts come to this computer, and staff sign in with their own user name and password. Internet is needed.</p>
       <button type="button" class="btn btn-primary" id="gate-join-folder">Join my centre (shared Google Drive folder)</button>
       <div class="auth-error" id="gate-join-msg" role="status"></div>
     </div>
     <div class="auth-or"><span>or set up a new centre</span></div>`:""}
     <h2 class="auth-h">Welcome! Create the Owner account</h2>
     <p class="auth-hint"><span>${r(G(e))}</span>. <span>The Owner can add staff logins later in</span> <strong>Users & Licence</strong>.</p>
     <p class="auth-hint"><span>Setting up the account needs an internet connection, because the centre is activated with Techmin. After that, daily work continues offline.</span></p>
     <form id="gate-owner-form" class="auth-form">
       <label class="form-label">Centre name</label>
       <input class="form-control" name="centreName" required value="${r(s?.centreName||"")}" data-no-i18n>
       <label class="form-label">Your name</label>
       <input class="form-control" name="displayName" required autocomplete="name" value="${r(s?.ownerName||"")}">
       <div class="auth-row">
         <div><label class="form-label">Mobile number</label><input class="form-control" name="mobile" type="tel" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" required value="${r(s?.mobile||"")}"></div>
         <div><label class="form-label">Email</label><input class="form-control" name="email" type="email" required autocomplete="email" value="${r(s?.email||"")}"><span class="form-hint">Your sign-in details and licence are sent here.</span></div>
       </div>
       <label class="form-label">Type of centre</label>
       <select class="form-control" name="centreType" required>
         <option value="">Select…</option>
         ${X.map(o=>`<option value="${r(o)}" ${s?.centreType===o?"selected":""}>${r(o)}</option>`).join("")}
       </select>
       <div class="auth-row">
         <div class="gate-csc"><label class="form-label">CSC ID <span class="form-hint-inline">(if registered with CSC)</span></label><input class="form-control" name="cscId" maxlength="30" value="${r(s?.cscId||"")}" data-no-i18n></div>
         <div class="gate-akshaya" hidden><label class="form-label">Akshaya Centre ID <span class="req">*</span></label><input class="form-control" name="akshayaId" maxlength="30" value="${r(s?.akshayaId||"")}" data-no-i18n></div>
       </div>
       <label class="form-label">Full address (building, street, place)</label>
       <textarea class="form-control" name="address" rows="2" required minlength="5">${r(s?.address||"")}</textarea>
       <div class="auth-row auth-row-3">
         <div><label class="form-label">District</label><input class="form-control" name="district" required value="${r(s?.district||"")}"></div>
         <div><label class="form-label">State</label><input class="form-control" name="state" required value="${r(s?.state||"")}"></div>
         <div><label class="form-label">PIN code</label><input class="form-control" name="pinCode" required inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" value="${r(s?.pinCode||"")}"></div>
       </div>
       <div class="auth-row">
         <div><label class="form-label">GSTIN <span class="form-hint-inline">(optional – only if the centre has GST registration)</span></label>
         <input class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${r(s?.gstin||"")}" data-no-i18n></div>
         <div><label class="form-label">GST type</label>
         <select class="form-control" name="gstRegType"><option value="REGULAR" ${s?.gstRegistrationType==="COMPOSITION"?"":"selected"}>Regular (Tax Invoice)</option><option value="COMPOSITION" ${s?.gstRegistrationType==="COMPOSITION"?"selected":""}>Composition (Bill of Supply)</option></select></div>
       </div>
       <p class="auth-hint">No GSTIN → VLEBook makes only non-GST bills. You can add or change this later in Books &amp; GST → GST profile.</p>
       <label class="form-label">User name (for signing in)</label>
       <input class="form-control" name="username" required autocomplete="username" placeholder="e.g. owner" data-no-i18n>
       <label class="form-label">Password</label>
       <input class="form-control" type="password" name="password" required minlength="6" autocomplete="new-password">
       <label class="form-label">Confirm password</label>
       <input class="form-control" type="password" name="confirm" required minlength="6" autocomplete="new-password">
       <label class="auth-check"><input type="checkbox" name="agree" required><span><span>I have read and agree to the</span> <a href="help.html?doc=terms" target="_blank" rel="noopener">Terms &amp; Conditions</a>, <a href="help.html?doc=privacy" target="_blank" rel="noopener">Privacy Policy</a>, <a href="help.html?doc=refunds" target="_blank" rel="noopener">Refund Policy</a> <span>and</span> <a href="help.html?doc=disclaimer" target="_blank" rel="noopener">Disclaimer</a>.<br><span>I understand that my centre's registration details (not my business data) are shared with Techmin for licensing and support.</span><br><span>I understand that my business data is kept only on my computer and in my own backups. Techmin does not keep a copy and cannot recover it.</span></span></label>
       <button type="submit" class="btn btn-primary">Create Owner Account</button>
       <div class="auth-error" id="gate-owner-error"></div>
     </form>
     ${typeof window.showDirectoryPicker=="function"?`<div class="auth-restore">
       <strong>Used VLEBook before on this or another computer?</strong>
       <p class="auth-hint"><span>Restore your centre from your backup folder (Google Drive, OneDrive, Dropbox or USB). The latest backup and the full audit log are brought back. Internet is needed.</span></p>
       <button type="button" class="btn btn-outline" id="gate-restore-folder">Restore from backup folder</button>
       <div class="auth-error" id="gate-restore-msg"></div>
     </div>`:""}`,{wide:!0,show:!0}),I(t,()=>_(e,n)),t.querySelector("#gate-join-folder")?.addEventListener("click",async o=>{const i=t.querySelector("#gate-join-msg"),l=o.currentTarget;try{const c=await window.showDirectoryPicker({id:"vlebook-backups",mode:"readwrite"});l.disabled=!0,i.textContent="Connecting to Techmin…",await L(),i.textContent="Reading the centre data from the shared folder…";const{joinCentre:g}=await import("../core/sync.js"),d=await g(c);i.textContent="Adding this computer to your centre with Techmin…",await C().catch(()=>{});const{kvGet:u}=await import("../core/devicestore.js"),h=await u("syncJoinPending");i.textContent=h?`Joined ${d.centreName} as counter ${d.counter}. Techmin could not confirm this computer yet: open VLEBook on the main computer while it is online, then reopen VLEBook here. VLEBook will restart now.`:`Joined ${d.centreName} as counter ${d.counter} (${d.records} records). Staff can now sign in on this computer. VLEBook will restart now.`,setTimeout(()=>window.location.reload(),h?6e3:2e3)}catch(c){if(l.disabled=!1,c?.name==="AbortError"){i.textContent="";return}i.textContent=c.message}}),t.querySelector("#gate-signin-open")?.addEventListener("click",o=>{t.querySelector("#gate-signin-help")?.classList.remove("is-collapsed"),o.currentTarget.remove(),t.querySelector("#gate-centre-signin [name=username]")?.focus()}),t.querySelector("#gate-centre-signin")?.addEventListener("submit",async o=>{o.preventDefault();const i=o.currentTarget,l=t.querySelector("#gate-centre-signin-msg"),c=i.querySelector("button[type=submit]"),g=new FormData(i);try{const d=await window.showDirectoryPicker({id:"vlebook-backups",mode:"readwrite"});c.disabled=!0,l.textContent="Connecting to Techmin…",await L();const{signInToCentre:u}=await import("../core/centresignin.js"),h=await u(d,g.get("username"),g.get("password"),E=>l.textContent=E);await C().catch(()=>{}),l.textContent=h.kind==="sync"?`Signed in to ${h.centreName} on this computer (counter ${h.counter}). VLEBook will restart now.`:`Signed in to ${h.centreName} (restored from ${h.file}). VLEBook will restart now.`,setTimeout(()=>window.location.reload(),1800)}catch(d){if(c.disabled=!1,d?.name==="AbortError"){l.textContent="";return}l.textContent=d.message}}),t.querySelector("#gate-goto-restore")?.addEventListener("click",()=>{const o=t.querySelector("#gate-restore-folder");o?.scrollIntoView({behavior:"smooth",block:"center"}),o?.focus()}),t.querySelector("#gate-restore-folder")?.addEventListener("click",async()=>{const o=t.querySelector("#gate-restore-msg");try{const i=await window.showDirectoryPicker({id:"vlebook-backups",mode:"readwrite"});o.textContent="Connecting to Techmin…",await L(),o.textContent="Looking for the latest backup…";const{restoreLatestFromFolder:l}=await import("../core/folderrestore.js"),c=await l(i);o.textContent=`Restored ${c.file} (${c.records} records, ${c.auditImported} audit entries). VLEBook will restart now.`,setTimeout(()=>window.location.reload(),1500)}catch(i){if(i?.name==="AbortError")return;o.textContent=i.message}});const y=t.querySelector('select[name="centreType"]'),m=()=>{const o=R(y.value);t.querySelector(".gate-akshaya").hidden=!o,t.querySelector('input[name="akshayaId"]').required=o};y.addEventListener("change",m),m(),t.querySelector("#gate-owner-form").addEventListener("submit",async o=>{o.preventDefault();const i=new FormData(o.target),l=t.querySelector("#gate-owner-error");if(l.textContent="",i.get("password")!==i.get("confirm")){l.textContent="The two passwords do not match.";return}const c=u=>String(i.get(u)||"").trim(),g=Q({centreType:c("centreType"),address:c("address"),district:c("district"),state:c("state"),pinCode:c("pinCode"),gstin:c("gstin"),cscId:c("cscId"),akshayaId:R(c("centreType"))?c("akshayaId"):""});if(g.error){l.textContent=g.error;return}const d=o.target.querySelector("button[type=submit]");try{d&&(d.disabled=!0),l.textContent="Connecting to Techmin to activate your account…",await L(),l.textContent=""}catch(u){l.textContent=u.message,d&&(d.disabled=!1);return}d&&(d.disabled=!1);try{const u=await k("settings","CENTRE_CONFIG"),h=String(i.get("centreName")||"").trim(),E=g.values.gstin?{gstRegistrationType:c("gstRegType")==="COMPOSITION"?"COMPOSITION":"REGULAR",gstStateCode:g.values.gstin.slice(0,2),...c("gstRegType")==="COMPOSITION"?{gstCompositionRatePct:6}:{},gstModeConfirmedAt:new Date().toISOString()}:{gstRegistrationType:"UNREGISTERED"};u&&await $("settings",{...u,...g.values,...E,centreName:h||u.centreName,ownerName:c("displayName"),mobile:c("mobile"),email:c("email")},{notifyAutosave:!1});const{recoveryCode:U,user:F}=await ee({displayName:i.get("displayName"),username:i.get("username"),password:i.get("password")});await $("users",{...F,termsAcceptedAt:new Date().toISOString(),termsVersion:ce.version},{notifyAutosave:!1}),await D(i.get("username"),i.get("password")),import("../core/autobackup.js").then(M=>M.resetAutoBackupClock()).catch(()=>{}),C().catch(()=>{}),ye(U,n)}catch(u){l.textContent=u.message}})}function be(e){return`
    <div class="recovery-code" id="gate-recovery-code" data-no-i18n>${r(e)}</div>
    <p class="auth-hint">If you forget your password, this code lets you set a new one. <strong>Write it down or download it and keep it safe.</strong> It is shown only once.</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-download">Download code</button>
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-copy">Copy</button>
    </div>`}function fe(e,n){e.querySelector("#gate-recovery-download")?.addEventListener("click",async()=>{const t=await k("settings","CENTRE_CONFIG"),a=se(),s=`VLEBook Owner recovery code
Centre: ${t?.centreName||""}
User name: ${a?.username||""}
Recovery code: ${n}
Created: ${new Date().toLocaleString()}

Keep this safe. Use it on the sign-in screen → Forgot password.`,f=new Blob([s],{type:"text/plain"}),p=document.createElement("a");p.href=URL.createObjectURL(f),p.download="VLEBook_Recovery_Code.txt",p.click(),setTimeout(()=>URL.revokeObjectURL(p.href),500)}),e.querySelector("#gate-recovery-copy")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(n)}catch{}})}function ye(e,n){const t=T();t.innerHTML=v(`<h2 class="auth-h">Your Owner recovery code</h2>
     ${be(e)}
     <label class="auth-check"><input type="checkbox" id="gate-recovery-ok"> I have saved this recovery code</label>
     <button type="button" class="btn btn-primary" id="gate-recovery-continue" disabled>Continue to VLEBook</button>`),fe(t,e);const a=t.querySelector("#gate-recovery-ok"),s=t.querySelector("#gate-recovery-continue");a.addEventListener("change",()=>s.disabled=!a.checked),s.addEventListener("click",()=>{x(),n()})}async function S(e,n,t="login"){const a=T(),s=await k("settings","CENTRE_CONFIG"),f=await B(),p=e.status==="ACTIVE"||e.status==="TRIAL"?`<div class="auth-licence ok">${r(G(e))}</div>`:e.status==="BASIC"?`<div class="callout warning"><div><span>${r(e.message)}</span> <span>Only the Owner can sign in.</span></div></div>`:`<div class="callout warning"><div>${r(e.message)}</div></div>`;t==="login"?(a.innerHTML=v(`<div class="auth-centre" data-no-i18n>${r(s?.centreName||"")}</div>
       ${p}
       <form id="gate-login-form" class="auth-form">
         <label class="form-label">User name</label>
         <input class="form-control" name="username" required autocomplete="username" autofocus data-no-i18n>
         <label class="form-label">Password</label>
         <input class="form-control" type="password" name="password" required autocomplete="current-password">
         <button type="submit" class="btn btn-primary">Sign In</button>
         <div class="auth-error" id="gate-login-error"></div>
       </form>
       <p class="auth-hint auth-signin-notice">For licence security and support, Techmin records each sign-in: user name, role, sign-in and sign-out time, this computer's code, its IP address and approximate city, and the browser. No customer or business data is sent. See the Privacy Policy (Help &amp; Legal).</p>
       <button type="button" class="btn-link" id="gate-forgot">Forgot password?</button>`,{show:!0}),a.querySelector("#gate-login-form").addEventListener("submit",async y=>{y.preventDefault();const m=new FormData(y.target);try{const o=await D(m.get("username"),m.get("password"));if(e.tier==="BASIC"&&o.role!=="OWNER")throw await W("LOGIN_REFUSED","account",o.id,`${o.username} could not sign in: Basic mode allows only the Owner`),await P(),new Error("VLEBook is in Basic mode, so only the Owner can sign in. Ask the Owner to renew the licence.");x(),n()}catch(o){a.querySelector("#gate-login-error").textContent=o.message}}),a.querySelector("#gate-forgot").addEventListener("click",()=>S(e,n,"forgot"))):(a.innerHTML=v(`<h2 class="auth-h">Reset your password</h2>
       <p class="auth-hint"><strong>Staff:</strong> ask the Owner to reset your password in Users & Licence.<br><strong>Owner:</strong> use your recovery code, or a reset code from Techmin support (send them your Device Code: <span data-no-i18n>${r(e.deviceCode)}</span>).</p>
       <form id="gate-reset-form" class="auth-form">
         <label class="form-label">User name</label>
         <input class="form-control" name="username" required data-no-i18n>
         <label class="form-label">Recovery code or Techmin reset code</label>
         <textarea class="form-control" name="code" rows="2" required data-no-i18n></textarea>
         <label class="form-label">New password</label>
         <input class="form-control" type="password" name="password" required minlength="6" autocomplete="new-password">
         <button type="submit" class="btn btn-primary">Set New Password</button>
         <div class="auth-error" id="gate-reset-error"></div>
       </form>
       <button type="button" class="btn-link" id="gate-back">← Back to sign in</button>
       ${A(f)}`),a.querySelector("#gate-back").addEventListener("click",()=>S(e,n,"login")),a.querySelector("#gate-reset-form").addEventListener("submit",async y=>{y.preventDefault();const m=new FormData(y.target),o=a.querySelector("#gate-reset-error");o.textContent="";const i=String(m.get("code")||"").trim();try{if(i.startsWith("VLE1.")){const l=await ne(m.get("username"));if(!l)throw new Error("No user with this user name.");const{markUsed:c}=await K(i,l.username);await oe(l.id,String(m.get("password")),"reset_by_techmin"),await c()}else await ae(m.get("username"),i,String(m.get("password")));alert("Password changed. Please sign in with the new password."),S(e,n,"login")}catch(l){o.textContent=l.message}})),I(a,()=>S(e,n,t))}function we(){return new Promise(async e=>{const n=await O();if(!n.allowed)return q(n,e);if(!await Z())return _(n,e);const t=await te();if(t&&!(n.tier==="BASIC"&&t.role!=="OWNER"))return x(),e();t&&await P(),S(n,e)})}async function Oe({ping:e=!1}={}){e&&await C().catch(()=>{});const n=await O();return!n.allowed&&!b&&await new Promise(t=>q(n,()=>t(window.location.reload()))),n}function Re(){const e=document.createElement("div");e.className="modal-backdrop open",e.innerHTML=`
    <div class="modal-dialog" style="max-width:400px;">
      <div class="modal-header"><h3>Change my password</h3><button type="button" class="btn btn-sm btn-outline" data-close>✕</button></div>
      <div class="modal-body">
        <form class="auth-form" id="chg-pass-form">
          <label class="form-label">Current password</label><input class="form-control" type="password" name="old" required autocomplete="current-password">
          <label class="form-label">New password</label><input class="form-control" type="password" name="new" required minlength="6" autocomplete="new-password">
          <label class="form-label">Confirm new password</label><input class="form-control" type="password" name="confirm" required minlength="6" autocomplete="new-password">
          <button type="submit" class="btn btn-primary">Change Password</button>
          <div class="auth-error" id="chg-pass-error"></div>
        </form>
      </div>
    </div>`,document.body.appendChild(e),e.querySelector("[data-close]").addEventListener("click",()=>e.remove()),e.querySelector("#chg-pass-form").addEventListener("submit",async n=>{n.preventDefault();const t=new FormData(n.target),a=e.querySelector("#chg-pass-error");if(t.get("new")!==t.get("confirm")){a.textContent="The two passwords do not match.";return}try{await re(t.get("old"),t.get("new")),e.remove(),alert("Password changed.")}catch(s){a.textContent=s.message}})}export{fe as bindRecoveryCode,x as closeGate,G as licenceSummary,Re as openChangePasswordDialog,V as planName,Oe as recheckLicence,be as recoveryCodeHTML,we as runGate};
