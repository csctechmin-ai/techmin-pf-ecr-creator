import{planCardsHTML as M}from"./subscribe.js";import{TRIAL_DAYS as j}from"../core/plans.js";import{inr as H}from"../core/plans.js";import{getRecord as w,putRecord as S,logAudit as Y}from"../core/db.js";import{safeHttpUrl as I,esc as s}from"../core/utils.js";import{getLicenceState as N,activateLicence as W,verifyResetToken as J,refreshRemoteStatus as T,requireOnline as L,PLAN_LABELS as K}from"../core/licence.js";import{CENTRE_TYPES as z,isAkshaya as q,checkCentreDetails as X}from"../core/centreinfo.js";import{hasAnyUser as Q,setupOwner as Z,login as O,logout as R,resumeSession as ee,recoverWithCode as te,findUser as ae,setPassword as ne,changeOwnPassword as oe,getCurrentUser as re}from"../core/auth.js";import{getVendor as D}from"../core/feed.js";import{runAutoBackup as se}from"../core/autobackup.js";import{LEGAL as ie}from"../core/helpdocs.js";import{setLang as ce,getLang as le}from"../core/i18n.js";let g=null;function C(){return g||(g=document.createElement("div"),g.id="auth-gate",g.className="auth-gate",document.body.classList.remove("booting"),document.body.appendChild(g)),document.body.classList.add("gated"),g}function E(){document.body.classList.remove("gated"),g?.remove(),g=null}function de(){const e=le();return`<select class="form-control auth-lang" id="gate-lang" data-no-i18n>
    <option value="en" ${e==="en"?"selected":""}>English</option>
    <option value="hi" ${e==="hi"?"selected":""}>हिन्दी</option>
    <option value="ml" ${e==="ml"?"selected":""}>മലയാളം</option>
  </select>`}function ue(){const e=[["🧾","Billing & GST","Multi-service bills with government fee kept apart, GST tax invoices, credit notes, GSTR-1 / 3B help"],["📒","Books kept for you","Double-entry books, day close, cash and bank books, wallets, P&L and balance sheet"],["🖨️","PDF, photo & PVC studio","PDF tools, exam photo / signature sizes, OCR in Malayalam / Hindi, PVC ID cards"],["🔔","Reminders & originals","Insurance, pollution and licence renewals on WhatsApp; original-document custody"],["🎓","Learn in your language","Lessons, guided tours and manuals in English, हिन्दी and മലയാളം; training mode"],["🔒","Your data stays with you","Works offline on your computer; automatic backups to your own Drive or folder"]],n=[["billing","Billing"],["books","Books & GST"],["studio","PDF & Image Studio"]];return`<aside class="auth-showcase" aria-label="About VLEBook">
    <div class="sc-ribbon">${j}-day free trial · then from ${H(249)}/month + GST</div>
    <h2>Office software for CSC, Akshaya &amp; e-Seva centres</h2>
    <p class="sc-lead">Bill faster, keep accounts right, and give customers proper GST invoices — on your own computer, even without internet.</p>
    <ul class="sc-features">${e.map(([t,a,i])=>`<li><span class="sc-ic" aria-hidden="true">${t}</span><div><b>${a}</b><span>${i}</span></div></li>`).join("")}</ul>
    <div class="sc-shots">${n.map(([t,a])=>`<figure><img src="help/learn/img/${t}.jpg" alt="VLEBook ${a} screen (sample data)" loading="lazy"><figcaption>${a}</figcaption></figure>`).join("")}</div>
    <h3>Plans <small>(yearly: 12 months for the price of 11)</small></h3>
    ${M({cycle:"Y",compact:!0})}
    <p class="sc-foot">Prices + 18% GST. Pay monthly or yearly by UPI, card or net banking (Razorpay); the licence is applied instantly and Techmin's GST tax invoice is emailed. <a href="about.html" target="_blank" rel="noopener">All features &amp; plans ↗</a></p>
  </aside>`}function y(e,{wide:n=!1,show:t=!1}={}){return t?`<div class="auth-layout">${y(e,{wide:n})}${ue()}</div>`:`
    <div class="auth-card ${n?"wide":""}">
      <div class="auth-brand">
        <img src="icons/vlebook-logo${document.documentElement.getAttribute("data-theme")==="dark"?"-dark":""}.svg" alt="VLEBook" class="auth-logo">
        <span class="early-badge" title="VLEBook is in early access: features may change and some errors may remain. Keep regular backups.">Early access</span>
        ${de()}
      </div>
      ${e}
    </div>`}function $(e,n){e.querySelector("#gate-lang")?.addEventListener("change",async t=>{ce(t.target.value);const a=await w("settings","CENTRE_CONFIG");a&&await S("settings",{...a,language:t.target.value},{notifyAutosave:!1,skipChangeTracking:!0}),n()})}function P(e){const n=String(e.whatsapp||"").replace(/\D/g,""),t=[e.phone?`Phone: <a href="tel:${s(e.phone)}">${s(e.phone)}</a>`:"",n?`<a href="https://wa.me/${n.length===10?"91"+n:n}" target="_blank" rel="noopener">WhatsApp</a>`:"",e.email?`Email: <a href="mailto:${s(e.email)}">${s(e.email)}</a>`:"",I(e.website)?`<a href="${s(I(e.website))}" target="_blank" rel="noopener">${s(e.website.replace(/^https?:\/\//,"").replace(/\/$/,""))}</a>`:""].filter(Boolean);return`<div class="auth-contact"><strong>${s(e.name||"Techmin")} support</strong>${t.length?`<div>${t.join(" &nbsp;·&nbsp; ")}</div>`:""}</div>`}function A(e){return e.plan==="MONTHS"&&e.months?`${e.months}-month licence`:e.plan==="BASIC"?"Basic mode":`${K[e.plan]||e.plan||""} licence`}function B(e){return e.status==="TRIAL"?`Full-version trial · ${e.daysLeft} day(s) left`:e.status==="BASIC"?"Basic mode (trial or licence ended)":e.payload?e.validTill?`${A(e)} · valid for ${e.daysLeft} day(s), till ${e.validTill.split("-").reverse().join("-")}`:`${A(e)} · lifetime`:e.message}function me(e){return`
    <div class="auth-device">
      <div><small>Your Device Code</small><div class="device-code" id="gate-device" data-no-i18n>${s(e.deviceCode)}</div></div>
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
    </form>`}function pe(e,n){e.querySelector("#gate-copy-device")?.addEventListener("click",async()=>{const t=e.querySelector("#gate-device").textContent.trim();try{await navigator.clipboard.writeText(t)}catch{}e.querySelector("#gate-copy-device").textContent="Copied ✓"}),e.querySelector("#gate-licence-file")?.addEventListener("change",async t=>{const a=t.target.files?.[0];a&&(e.querySelector("#gate-licence-form [name=key]").value=(await a.text()).trim())}),e.querySelector("#gate-licence-form")?.addEventListener("submit",async t=>{t.preventDefault();const a=e.querySelector("#gate-licence-error");a.textContent="";try{await W(new FormData(t.target).get("key")),await n()}catch(i){a.textContent=i.message}})}async function x(e,n){const t=C(),a=await D(),i={REVOKED:"Licence cancelled",SUSPENDED:"Account suspended",WRONG_DEVICE:"Licence is for another computer",CLOCK:"Check your computer date & time",NOT_STARTED:"Licence not started yet",INVALID:"Licence problem"}[e.status]||"Licence required";t.innerHTML=y(`<h2 class="auth-h">${s(i)}</h2>
     <div class="callout warning"><div>${s(e.message)}</div></div>
     ${e.status==="CLOCK"?"":me(e)}
     <div class="auth-divider"></div>
     <p class="auth-hint"><strong>Your data is safe on this computer.</strong> You can still download a complete backup (JSON + TXT).</p>
     <button type="button" class="btn btn-outline" id="gate-backup-btn">Download backup of my data</button>
     <div class="auth-error" id="gate-backup-msg" style="color:var(--color-success);"></div>
     ${P(a)}`,{wide:!0}),$(t,()=>x(e,n)),pe(t,()=>ye().then(n)),t.querySelector("#gate-backup-btn")?.addEventListener("click",async()=>{const f=await se({reason:"MANUAL",forceDownload:!0});t.querySelector("#gate-backup-msg").textContent=`Saved: ${f.files.join(", ")}`})}const ge=new Set(["JanSeva & Akshaya Digital Kendra","Centre Administrator","Main Market Road, Near Taluk Office","Ernakulam / Pune","682001","9876543210","desk@vlebook.local","CSC"]),b=e=>e&&!ge.has(String(e))?e:"";async function G(e,n){try{const r=location.hostname;if(!(new URLSearchParams(location.search).has("start")||sessionStorage.getItem("vlebook_seen_about"))&&r!=="127.0.0.1"&&r!=="localhost")return sessionStorage.setItem("vlebook_seen_about","1"),location.replace("about.html"),new Promise(()=>{});sessionStorage.setItem("vlebook_seen_about","1")}catch{}const t=C(),a=await w("settings","CENTRE_CONFIG"),i=a?{...a,centreName:b(a.centreName),ownerName:b(a.ownerName),mobile:b(a.mobile),email:b(a.email),district:b(a.district),address:b(a.address),pinCode:b(a.pinCode),centreType:b(a.centreType)}:null,f=typeof window.showDirectoryPicker=="function";t.innerHTML=y(`${f?`<div class="auth-join" id="gate-join-box">
       <strong>Does your centre already use VLEBook on another computer?</strong>
       <p class="auth-hint">Join it here: choose the same Google Drive folder that the main computer uses for backups. The centre's users, customers, services and accounts come to this computer, and staff sign in with their own user name and password. Internet is needed.</p>
       <button type="button" class="btn btn-primary" id="gate-join-folder">Join my centre (shared Google Drive folder)</button>
       <div class="auth-error" id="gate-join-msg" role="status"></div>
     </div>
     <div class="auth-or"><span>or set up a new centre</span></div>`:""}
     <h2 class="auth-h">Welcome! Create the Owner account</h2>
     <p class="auth-hint"><span>${s(B(e))}</span>. <span>The Owner can add staff logins later in</span> <strong>Users & Licence</strong>.</p>
     <p class="auth-hint"><span>Setting up the account needs an internet connection, because the centre is activated with Techmin. After that, daily work continues offline.</span></p>
     <form id="gate-owner-form" class="auth-form">
       <label class="form-label">Centre name</label>
       <input class="form-control" name="centreName" required value="${s(i?.centreName||"")}" data-no-i18n>
       <label class="form-label">Your name</label>
       <input class="form-control" name="displayName" required autocomplete="name" value="${s(i?.ownerName||"")}">
       <div class="auth-row">
         <div><label class="form-label">Mobile number</label><input class="form-control" name="mobile" type="tel" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" required value="${s(i?.mobile||"")}"></div>
         <div><label class="form-label">Email</label><input class="form-control" name="email" type="email" required autocomplete="email" value="${s(i?.email||"")}"><span class="form-hint">Your sign-in details and licence are sent here.</span></div>
       </div>
       <label class="form-label">Type of centre</label>
       <select class="form-control" name="centreType" required>
         <option value="">Select…</option>
         ${z.map(r=>`<option value="${s(r)}" ${i?.centreType===r?"selected":""}>${s(r)}</option>`).join("")}
       </select>
       <div class="auth-row">
         <div class="gate-csc"><label class="form-label">CSC ID <span class="form-hint-inline">(if registered with CSC)</span></label><input class="form-control" name="cscId" maxlength="30" value="${s(i?.cscId||"")}" data-no-i18n></div>
         <div class="gate-akshaya" hidden><label class="form-label">Akshaya Centre ID <span class="req">*</span></label><input class="form-control" name="akshayaId" maxlength="30" value="${s(i?.akshayaId||"")}" data-no-i18n></div>
       </div>
       <label class="form-label">Full address (building, street, place)</label>
       <textarea class="form-control" name="address" rows="2" required minlength="5">${s(i?.address||"")}</textarea>
       <div class="auth-row auth-row-3">
         <div><label class="form-label">District</label><input class="form-control" name="district" required value="${s(i?.district||"")}"></div>
         <div><label class="form-label">State</label><input class="form-control" name="state" required value="${s(i?.state||"")}"></div>
         <div><label class="form-label">PIN code</label><input class="form-control" name="pinCode" required inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" value="${s(i?.pinCode||"")}"></div>
       </div>
       <div class="auth-row">
         <div><label class="form-label">GSTIN <span class="form-hint-inline">(optional – only if the centre has GST registration)</span></label>
         <input class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${s(i?.gstin||"")}" data-no-i18n></div>
         <div><label class="form-label">GST type</label>
         <select class="form-control" name="gstRegType"><option value="REGULAR" ${i?.gstRegistrationType==="COMPOSITION"?"":"selected"}>Regular (Tax Invoice)</option><option value="COMPOSITION" ${i?.gstRegistrationType==="COMPOSITION"?"selected":""}>Composition (Bill of Supply)</option></select></div>
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
     </div>`:""}`,{wide:!0,show:!0}),$(t,()=>G(e,n)),t.querySelector("#gate-join-folder")?.addEventListener("click",async r=>{const o=t.querySelector("#gate-join-msg"),l=r.currentTarget;try{const c=await window.showDirectoryPicker({id:"vlebook-backups",mode:"readwrite"});l.disabled=!0,o.textContent="Connecting to Techmin…",await L(),o.textContent="Reading the centre data from the shared folder…";const{joinCentre:p}=await import("../core/sync.js"),d=await p(c);o.textContent="Adding this computer to your centre with Techmin…",await T().catch(()=>{});const{kvGet:u}=await import("../core/devicestore.js"),k=await u("syncJoinPending");o.textContent=k?`Joined ${d.centreName} as counter ${d.counter}. Techmin could not confirm this computer yet: open VLEBook on the main computer while it is online, then reopen VLEBook here. VLEBook will restart now.`:`Joined ${d.centreName} as counter ${d.counter} (${d.records} records). Staff can now sign in on this computer. VLEBook will restart now.`,setTimeout(()=>window.location.reload(),k?6e3:2e3)}catch(c){if(l.disabled=!1,c?.name==="AbortError"){o.textContent="";return}o.textContent=c.message}}),t.querySelector("#gate-restore-folder")?.addEventListener("click",async()=>{const r=t.querySelector("#gate-restore-msg");try{const o=await window.showDirectoryPicker({id:"vlebook-backups",mode:"readwrite"});r.textContent="Connecting to Techmin…",await L(),r.textContent="Looking for the latest backup…";const{restoreLatestFromFolder:l}=await import("../core/folderrestore.js"),c=await l(o);r.textContent=`Restored ${c.file} (${c.records} records, ${c.auditImported} audit entries). VLEBook will restart now.`,setTimeout(()=>window.location.reload(),1500)}catch(o){if(o?.name==="AbortError")return;r.textContent=o.message}});const m=t.querySelector('select[name="centreType"]'),h=()=>{const r=q(m.value);t.querySelector(".gate-akshaya").hidden=!r,t.querySelector('input[name="akshayaId"]').required=r};m.addEventListener("change",h),h(),t.querySelector("#gate-owner-form").addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(r.target),l=t.querySelector("#gate-owner-error");if(l.textContent="",o.get("password")!==o.get("confirm")){l.textContent="The two passwords do not match.";return}const c=u=>String(o.get(u)||"").trim(),p=X({centreType:c("centreType"),address:c("address"),district:c("district"),state:c("state"),pinCode:c("pinCode"),gstin:c("gstin"),cscId:c("cscId"),akshayaId:q(c("centreType"))?c("akshayaId"):""});if(p.error){l.textContent=p.error;return}const d=r.target.querySelector("button[type=submit]");try{d&&(d.disabled=!0),l.textContent="Connecting to Techmin to activate your account…",await L(),l.textContent=""}catch(u){l.textContent=u.message,d&&(d.disabled=!1);return}d&&(d.disabled=!1);try{const u=await w("settings","CENTRE_CONFIG"),k=String(o.get("centreName")||"").trim(),_=p.values.gstin?{gstRegistrationType:c("gstRegType")==="COMPOSITION"?"COMPOSITION":"REGULAR",gstStateCode:p.values.gstin.slice(0,2),...c("gstRegType")==="COMPOSITION"?{gstCompositionRatePct:6}:{},gstModeConfirmedAt:new Date().toISOString()}:{gstRegistrationType:"UNREGISTERED"};u&&await S("settings",{...u,...p.values,..._,centreName:k||u.centreName,ownerName:c("displayName"),mobile:c("mobile"),email:c("email")},{notifyAutosave:!1});const{recoveryCode:U,user:V}=await Z({displayName:o.get("displayName"),username:o.get("username"),password:o.get("password")});await S("users",{...V,termsAcceptedAt:new Date().toISOString(),termsVersion:ie.version},{notifyAutosave:!1}),await O(o.get("username"),o.get("password")),import("../core/autobackup.js").then(F=>F.resetAutoBackupClock()).catch(()=>{}),T().catch(()=>{}),fe(U,n)}catch(u){l.textContent=u.message}})}function he(e){return`
    <div class="recovery-code" id="gate-recovery-code" data-no-i18n>${s(e)}</div>
    <p class="auth-hint">If you forget your password, this code lets you set a new one. <strong>Write it down or download it and keep it safe.</strong> It is shown only once.</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-download">Download code</button>
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-copy">Copy</button>
    </div>`}function be(e,n){e.querySelector("#gate-recovery-download")?.addEventListener("click",async()=>{const t=await w("settings","CENTRE_CONFIG"),a=re(),i=`VLEBook Owner recovery code
Centre: ${t?.centreName||""}
User name: ${a?.username||""}
Recovery code: ${n}
Created: ${new Date().toLocaleString()}

Keep this safe. Use it on the sign-in screen → Forgot password.`,f=new Blob([i],{type:"text/plain"}),m=document.createElement("a");m.href=URL.createObjectURL(f),m.download="VLEBook_Recovery_Code.txt",m.click(),setTimeout(()=>URL.revokeObjectURL(m.href),500)}),e.querySelector("#gate-recovery-copy")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(n)}catch{}})}function fe(e,n){const t=C();t.innerHTML=y(`<h2 class="auth-h">Your Owner recovery code</h2>
     ${he(e)}
     <label class="auth-check"><input type="checkbox" id="gate-recovery-ok"> I have saved this recovery code</label>
     <button type="button" class="btn btn-primary" id="gate-recovery-continue" disabled>Continue to VLEBook</button>`),be(t,e);const a=t.querySelector("#gate-recovery-ok"),i=t.querySelector("#gate-recovery-continue");a.addEventListener("change",()=>i.disabled=!a.checked),i.addEventListener("click",()=>{E(),n()})}async function v(e,n,t="login"){const a=C(),i=await w("settings","CENTRE_CONFIG"),f=await D(),m=e.status==="ACTIVE"||e.status==="TRIAL"?`<div class="auth-licence ok">${s(B(e))}</div>`:e.status==="BASIC"?`<div class="callout warning"><div><span>${s(e.message)}</span> <span>Only the Owner can sign in.</span></div></div>`:`<div class="callout warning"><div>${s(e.message)}</div></div>`;t==="login"?(a.innerHTML=y(`<div class="auth-centre" data-no-i18n>${s(i?.centreName||"")}</div>
       ${m}
       <form id="gate-login-form" class="auth-form">
         <label class="form-label">User name</label>
         <input class="form-control" name="username" required autocomplete="username" autofocus data-no-i18n>
         <label class="form-label">Password</label>
         <input class="form-control" type="password" name="password" required autocomplete="current-password">
         <button type="submit" class="btn btn-primary">Sign In</button>
         <div class="auth-error" id="gate-login-error"></div>
       </form>
       <p class="auth-hint auth-signin-notice">For licence security and support, Techmin records each sign-in: user name, role, sign-in and sign-out time, this computer's code, its IP address and approximate city, and the browser. No customer or business data is sent. See the Privacy Policy (Help &amp; Legal).</p>
       <button type="button" class="btn-link" id="gate-forgot">Forgot password?</button>`,{show:!0}),a.querySelector("#gate-login-form").addEventListener("submit",async h=>{h.preventDefault();const r=new FormData(h.target);try{const o=await O(r.get("username"),r.get("password"));if(e.tier==="BASIC"&&o.role!=="OWNER")throw await Y("LOGIN_REFUSED","account",o.id,`${o.username} could not sign in: Basic mode allows only the Owner`),await R(),new Error("VLEBook is in Basic mode, so only the Owner can sign in. Ask the Owner to renew the licence.");E(),n()}catch(o){a.querySelector("#gate-login-error").textContent=o.message}}),a.querySelector("#gate-forgot").addEventListener("click",()=>v(e,n,"forgot"))):(a.innerHTML=y(`<h2 class="auth-h">Reset your password</h2>
       <p class="auth-hint"><strong>Staff:</strong> ask the Owner to reset your password in Users & Licence.<br><strong>Owner:</strong> use your recovery code, or a reset code from Techmin support (send them your Device Code: <span data-no-i18n>${s(e.deviceCode)}</span>).</p>
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
       ${P(f)}`),a.querySelector("#gate-back").addEventListener("click",()=>v(e,n,"login")),a.querySelector("#gate-reset-form").addEventListener("submit",async h=>{h.preventDefault();const r=new FormData(h.target),o=a.querySelector("#gate-reset-error");o.textContent="";const l=String(r.get("code")||"").trim();try{if(l.startsWith("VLE1.")){const c=await ae(r.get("username"));if(!c)throw new Error("No user with this user name.");const{markUsed:p}=await J(l,c.username);await ne(c.id,String(r.get("password")),"reset_by_techmin"),await p()}else await te(r.get("username"),l,String(r.get("password")));alert("Password changed. Please sign in with the new password."),v(e,n,"login")}catch(c){o.textContent=c.message}})),$(a,()=>v(e,n,t))}function ye(){return new Promise(async e=>{const n=await N();if(!n.allowed)return x(n,e);if(!await Q())return G(n,e);const t=await ee();if(t&&!(n.tier==="BASIC"&&t.role!=="OWNER"))return E(),e();t&&await R(),v(n,e)})}async function qe({ping:e=!1}={}){e&&await T().catch(()=>{});const n=await N();return!n.allowed&&!g&&await new Promise(t=>x(n,()=>t(window.location.reload()))),n}function Oe(){const e=document.createElement("div");e.className="modal-backdrop open",e.innerHTML=`
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
    </div>`,document.body.appendChild(e),e.querySelector("[data-close]").addEventListener("click",()=>e.remove()),e.querySelector("#chg-pass-form").addEventListener("submit",async n=>{n.preventDefault();const t=new FormData(n.target),a=e.querySelector("#chg-pass-error");if(t.get("new")!==t.get("confirm")){a.textContent="The two passwords do not match.";return}try{await oe(t.get("old"),t.get("new")),e.remove(),alert("Password changed.")}catch(i){a.textContent=i.message}})}export{be as bindRecoveryCode,E as closeGate,B as licenceSummary,Oe as openChangePasswordDialog,A as planName,qe as recheckLicence,he as recoveryCodeHTML,ye as runGate};
