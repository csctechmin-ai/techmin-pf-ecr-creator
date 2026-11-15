import{getRecord as g,putRecord as v}from"../core/db.js";import{esc as r}from"../core/utils.js";import{getLicenceState as E,activateLicence as O,verifyResetToken as R,refreshRemoteStatus as S,PLAN_LABELS as A}from"../core/licence.js";import{hasAnyUser as I,setupOwner as P,login as x,resumeSession as _,recoverWithCode as U,findUser as F,setPassword as V,changeOwnPassword as B,getCurrentUser as G}from"../core/auth.js";import{getVendor as $}from"../core/feed.js";import{runAutoBackup as M}from"../core/autobackup.js";import{LEGAL as H}from"../core/helpdocs.js";import{setLang as Y,getLang as W}from"../core/i18n.js";let d=null;function w(){return d||(d=document.createElement("div"),d.id="auth-gate",d.className="auth-gate",document.body.appendChild(d)),document.body.classList.add("gated"),d}function L(){document.body.classList.remove("gated"),d?.remove(),d=null}function K(){const e=W();return`<select class="form-control auth-lang" id="gate-lang" data-no-i18n>
    <option value="en" ${e==="en"?"selected":""}>English</option>
    <option value="hi" ${e==="hi"?"selected":""}>हिन्दी</option>
    <option value="ml" ${e==="ml"?"selected":""}>മലയാളം</option>
  </select>`}function b(e,{wide:a=!1}={}){return`
    <div class="auth-card ${a?"wide":""}">
      <div class="auth-brand">
        <div class="brand-emblem">VB</div>
        <div><div class="auth-title">VLEBook</div><div class="auth-sub">CSC • Akshaya • E-Seva OS</div></div>
        ${K()}
      </div>
      ${e}
    </div>`}function C(e,a){e.querySelector("#gate-lang")?.addEventListener("change",async t=>{Y(t.target.value);const n=await g("settings","CENTRE_CONFIG");n&&await v("settings",{...n,language:t.target.value},{notifyAutosave:!1,skipChangeTracking:!0}),a()})}function q(e){const a=String(e.whatsapp||"").replace(/\D/g,""),t=[e.phone?`Phone: <a href="tel:${r(e.phone)}">${r(e.phone)}</a>`:"",a?`<a href="https://wa.me/${a.length===10?"91"+a:a}" target="_blank" rel="noopener">WhatsApp</a>`:"",e.email?`Email: <a href="mailto:${r(e.email)}">${r(e.email)}</a>`:"",e.website?`<a href="${r(e.website)}" target="_blank" rel="noopener">${r(e.website.replace(/^https?:\/\//,"").replace(/\/$/,""))}</a>`:""].filter(Boolean);return`<div class="auth-contact"><strong>${r(e.name||"Techmin")} support</strong>${t.length?`<div>${t.join(" &nbsp;·&nbsp; ")}</div>`:""}</div>`}function N(e){return e.status==="TRIAL"?`Free trial · ${e.daysLeft} day(s) left`:e.payload?`${A[e.plan]||e.plan||""} licence · ${e.validTill?`valid till ${e.validTill}`:"lifetime"}`:e.message}function j(e){return`
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
    </form>`}function J(e,a){e.querySelector("#gate-copy-device")?.addEventListener("click",async()=>{const t=e.querySelector("#gate-device").textContent.trim();try{await navigator.clipboard.writeText(t)}catch{}e.querySelector("#gate-copy-device").textContent="Copied ✓"}),e.querySelector("#gate-licence-file")?.addEventListener("change",async t=>{const n=t.target.files?.[0];n&&(e.querySelector("#gate-licence-form [name=key]").value=(await n.text()).trim())}),e.querySelector("#gate-licence-form")?.addEventListener("submit",async t=>{t.preventDefault();const n=e.querySelector("#gate-licence-error");n.textContent="";try{await O(new FormData(t.target).get("key")),await a()}catch(o){n.textContent=o.message}})}async function k(e,a){const t=w(),n=await $(),o={TRIAL_ENDED:"Free trial ended",EXPIRED:"Licence expired",REVOKED:"Licence cancelled",WRONG_DEVICE:"Licence is for another computer",CLOCK:"Check your computer date & time",NOT_STARTED:"Licence not started yet",INVALID:"Licence problem"}[e.status]||"Licence required";t.innerHTML=b(`<h2 class="auth-h">${r(o)}</h2>
     <div class="callout warning"><div>${r(e.message)}</div></div>
     ${e.status==="CLOCK"?"":j(e)}
     <div class="auth-divider"></div>
     <p class="auth-hint"><strong>Your data is safe on this computer.</strong> You can still download a complete backup (JSON + TXT).</p>
     <button type="button" class="btn btn-outline" id="gate-backup-btn">Download backup of my data</button>
     <div class="auth-error" id="gate-backup-msg" style="color:var(--color-success);"></div>
     ${q(n)}`,{wide:!0}),C(t,()=>k(e,a)),J(t,()=>ee().then(a)),t.querySelector("#gate-backup-btn")?.addEventListener("click",async()=>{const u=await M({reason:"MANUAL",forceDownload:!0});t.querySelector("#gate-backup-msg").textContent=`Saved: ${u.files.join(", ")}`})}const X=new Set(["JanSeva & Akshaya Digital Kendra","Centre Administrator","Ernakulam / Pune","9876543210","desk@vlebook.local"]),f=e=>e&&!X.has(String(e))?e:"";async function T(e,a){const t=w(),n=await g("settings","CENTRE_CONFIG"),o=n?{...n,centreName:f(n.centreName),ownerName:f(n.ownerName),mobile:f(n.mobile),email:f(n.email),district:f(n.district)}:null;t.innerHTML=b(`<h2 class="auth-h">Welcome! Create the Owner account</h2>
     <p class="auth-hint"><span>${r(N(e))}</span>. <span>The Owner can add staff logins later in</span> <strong>Users & Licence</strong>.</p>
     <form id="gate-owner-form" class="auth-form">
       <label class="form-label">Centre name</label>
       <input class="form-control" name="centreName" required value="${r(o?.centreName||"")}" data-no-i18n>
       <label class="form-label">Your name</label>
       <input class="form-control" name="displayName" required autocomplete="name" value="${r(o?.ownerName||"")}">
       <div class="auth-row">
         <div><label class="form-label">Mobile number</label><input class="form-control" name="mobile" type="tel" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" required value="${r(o?.mobile||"")}"></div>
         <div><label class="form-label">Email</label><input class="form-control" name="email" type="email" required autocomplete="email" value="${r(o?.email||"")}"><span class="form-hint">Your sign-in details and licence are sent here.</span></div>
       </div>
       <div class="auth-row">
         <div><label class="form-label">District</label><input class="form-control" name="district" value="${r(o?.district||"")}"></div>
         <div><label class="form-label">State</label><input class="form-control" name="state" value="${r(o?.state||"")}"></div>
       </div>
       <label class="form-label">User name (for signing in)</label>
       <input class="form-control" name="username" required autocomplete="username" placeholder="e.g. owner" data-no-i18n>
       <label class="form-label">Password</label>
       <input class="form-control" type="password" name="password" required minlength="6" autocomplete="new-password">
       <label class="form-label">Confirm password</label>
       <input class="form-control" type="password" name="confirm" required minlength="6" autocomplete="new-password">
       <label class="auth-check"><input type="checkbox" name="agree" required><span><span>I have read and agree to the</span> <a href="help.html?doc=terms" target="_blank" rel="noopener">Terms &amp; Conditions</a> <span>and</span> <a href="help.html?doc=privacy" target="_blank" rel="noopener">Privacy Policy</a>.<br><span>I understand that my centre's registration details (not my business data) are shared with Techmin for licensing and support.</span></span></label>
       <button type="submit" class="btn btn-primary">Create Owner Account</button>
       <div class="auth-error" id="gate-owner-error"></div>
     </form>`),C(t,()=>T(e,a)),t.querySelector("#gate-owner-form").addEventListener("submit",async u=>{u.preventDefault();const s=new FormData(u.target),c=t.querySelector("#gate-owner-error");if(c.textContent="",s.get("password")!==s.get("confirm")){c.textContent="The two passwords do not match.";return}try{const i=await g("settings","CENTRE_CONFIG"),p=String(s.get("centreName")||"").trim(),l=D=>String(s.get(D)||"").trim();i&&await v("settings",{...i,centreName:p||i.centreName,ownerName:l("displayName"),mobile:l("mobile"),email:l("email"),district:l("district"),state:l("state")||i.state},{notifyAutosave:!1});const{recoveryCode:m,user:y}=await P({displayName:s.get("displayName"),username:s.get("username"),password:s.get("password")});await v("users",{...y,termsAcceptedAt:new Date().toISOString(),termsVersion:H.version},{notifyAutosave:!1}),await x(s.get("username"),s.get("password")),S().catch(()=>{}),Z(m,a)}catch(i){c.textContent=i.message}})}function z(e){return`
    <div class="recovery-code" id="gate-recovery-code" data-no-i18n>${r(e)}</div>
    <p class="auth-hint">If you forget your password, this code lets you set a new one. <strong>Write it down or download it and keep it safe.</strong> It is shown only once.</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-download">Download code</button>
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-copy">Copy</button>
    </div>`}function Q(e,a){e.querySelector("#gate-recovery-download")?.addEventListener("click",async()=>{const t=await g("settings","CENTRE_CONFIG"),n=G(),o=`VLEBook Owner recovery code
Centre: ${t?.centreName||""}
User name: ${n?.username||""}
Recovery code: ${a}
Created: ${new Date().toLocaleString()}

Keep this safe. Use it on the sign-in screen → Forgot password.`,u=new Blob([o],{type:"text/plain"}),s=document.createElement("a");s.href=URL.createObjectURL(u),s.download="VLEBook_Recovery_Code.txt",s.click(),setTimeout(()=>URL.revokeObjectURL(s.href),500)}),e.querySelector("#gate-recovery-copy")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a)}catch{}})}function Z(e,a){const t=w();t.innerHTML=b(`<h2 class="auth-h">Your Owner recovery code</h2>
     ${z(e)}
     <label class="auth-check"><input type="checkbox" id="gate-recovery-ok"> I have saved this recovery code</label>
     <button type="button" class="btn btn-primary" id="gate-recovery-continue" disabled>Continue to VLEBook</button>`),Q(t,e);const n=t.querySelector("#gate-recovery-ok"),o=t.querySelector("#gate-recovery-continue");n.addEventListener("change",()=>o.disabled=!n.checked),o.addEventListener("click",()=>{L(),a()})}async function h(e,a,t="login"){const n=w(),o=await g("settings","CENTRE_CONFIG"),u=await $(),s=e.status==="ACTIVE"||e.status==="TRIAL"?`<div class="auth-licence ok">${r(N(e))}</div>`:`<div class="callout warning"><div>${r(e.message)}</div></div>`;t==="login"?(n.innerHTML=b(`<div class="auth-centre" data-no-i18n>${r(o?.centreName||"")}</div>
       ${s}
       <form id="gate-login-form" class="auth-form">
         <label class="form-label">User name</label>
         <input class="form-control" name="username" required autocomplete="username" autofocus data-no-i18n>
         <label class="form-label">Password</label>
         <input class="form-control" type="password" name="password" required autocomplete="current-password">
         <button type="submit" class="btn btn-primary">Sign In</button>
         <div class="auth-error" id="gate-login-error"></div>
       </form>
       <button type="button" class="btn-link" id="gate-forgot">Forgot password?</button>`),n.querySelector("#gate-login-form").addEventListener("submit",async c=>{c.preventDefault();const i=new FormData(c.target);try{await x(i.get("username"),i.get("password")),L(),a()}catch(p){n.querySelector("#gate-login-error").textContent=p.message}}),n.querySelector("#gate-forgot").addEventListener("click",()=>h(e,a,"forgot"))):(n.innerHTML=b(`<h2 class="auth-h">Reset your password</h2>
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
       ${q(u)}`),n.querySelector("#gate-back").addEventListener("click",()=>h(e,a,"login")),n.querySelector("#gate-reset-form").addEventListener("submit",async c=>{c.preventDefault();const i=new FormData(c.target),p=n.querySelector("#gate-reset-error");p.textContent="";const l=String(i.get("code")||"").trim();try{if(l.startsWith("VLE1.")){const m=await F(i.get("username"));if(!m)throw new Error("No user with this user name.");const{markUsed:y}=await R(l,m.username);await V(m.id,String(i.get("password")),"reset_by_techmin"),await y()}else await U(i.get("username"),l,String(i.get("password")));alert("Password changed. Please sign in with the new password."),h(e,a,"login")}catch(m){p.textContent=m.message}})),C(n,()=>h(e,a,t))}function ee(){return new Promise(async e=>{const a=await E();if(!a.allowed)return k(a,e);if(!await I())return T(a,e);if(await _())return L(),e();h(a,e)})}async function le({ping:e=!1}={}){e&&await S().catch(()=>{});const a=await E();return!a.allowed&&!d&&await new Promise(t=>k(a,()=>t(window.location.reload()))),a}function de(){const e=document.createElement("div");e.className="modal-backdrop open",e.innerHTML=`
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
    </div>`,document.body.appendChild(e),e.querySelector("[data-close]").addEventListener("click",()=>e.remove()),e.querySelector("#chg-pass-form").addEventListener("submit",async a=>{a.preventDefault();const t=new FormData(a.target),n=e.querySelector("#chg-pass-error");if(t.get("new")!==t.get("confirm")){n.textContent="The two passwords do not match.";return}try{await B(t.get("old"),t.get("new")),e.remove(),alert("Password changed.")}catch(o){n.textContent=o.message}})}export{Q as bindRecoveryCode,L as closeGate,N as licenceSummary,de as openChangePasswordDialog,le as recheckLicence,z as recoveryCodeHTML,ee as runGate};
