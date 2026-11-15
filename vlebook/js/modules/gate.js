import{getRecord as f,putRecord as v}from"../core/db.js";import{esc as r}from"../core/utils.js";import{getLicenceState as L,activateLicence as _,verifyResetToken as B,refreshRemoteStatus as E,PLAN_LABELS as U}from"../core/licence.js";import{CENTRE_TYPES as F,isAkshaya as $,checkCentreDetails as V}from"../core/centreinfo.js";import{hasAnyUser as G,setupOwner as M,login as x,logout as q,resumeSession as H,recoverWithCode as W,findUser as Y,setPassword as j,changeOwnPassword as K,getCurrentUser as J}from"../core/auth.js";import{getVendor as T}from"../core/feed.js";import{runAutoBackup as X}from"../core/autobackup.js";import{LEGAL as z}from"../core/helpdocs.js";import{setLang as Q,getLang as Z}from"../core/i18n.js";let p=null;function w(){return p||(p=document.createElement("div"),p.id="auth-gate",p.className="auth-gate",document.body.appendChild(p)),document.body.classList.add("gated"),p}function C(){document.body.classList.remove("gated"),p?.remove(),p=null}function ee(){const e=Z();return`<select class="form-control auth-lang" id="gate-lang" data-no-i18n>
    <option value="en" ${e==="en"?"selected":""}>English</option>
    <option value="hi" ${e==="hi"?"selected":""}>हिन्दी</option>
    <option value="ml" ${e==="ml"?"selected":""}>മലയാളം</option>
  </select>`}function h(e,{wide:a=!1}={}){return`
    <div class="auth-card ${a?"wide":""}">
      <div class="auth-brand">
        <img src="icons/vlebook-logo${document.documentElement.getAttribute("data-theme")==="dark"?"-dark":""}.svg" alt="VLEBook" class="auth-logo">
        ${ee()}
      </div>
      ${e}
    </div>`}function k(e,a){e.querySelector("#gate-lang")?.addEventListener("change",async t=>{Q(t.target.value);const n=await f("settings","CENTRE_CONFIG");n&&await v("settings",{...n,language:t.target.value},{notifyAutosave:!1,skipChangeTracking:!0}),a()})}function N(e){const a=String(e.whatsapp||"").replace(/\D/g,""),t=[e.phone?`Phone: <a href="tel:${r(e.phone)}">${r(e.phone)}</a>`:"",a?`<a href="https://wa.me/${a.length===10?"91"+a:a}" target="_blank" rel="noopener">WhatsApp</a>`:"",e.email?`Email: <a href="mailto:${r(e.email)}">${r(e.email)}</a>`:"",e.website?`<a href="${r(e.website)}" target="_blank" rel="noopener">${r(e.website.replace(/^https?:\/\//,"").replace(/\/$/,""))}</a>`:""].filter(Boolean);return`<div class="auth-contact"><strong>${r(e.name||"Techmin")} support</strong>${t.length?`<div>${t.join(" &nbsp;·&nbsp; ")}</div>`:""}</div>`}function I(e){return e.plan==="MONTHS"&&e.months?`${e.months}-month licence`:e.plan==="BASIC"?"Basic mode":`${U[e.plan]||e.plan||""} licence`}function D(e){return e.status==="TRIAL"?`Full-version trial · ${e.daysLeft} day(s) left`:e.status==="BASIC"?"Basic mode (trial or licence ended)":e.payload?e.validTill?`${I(e)} · valid for ${e.daysLeft} day(s), till ${e.validTill.split("-").reverse().join("-")}`:`${I(e)} · lifetime`:e.message}function te(e){return`
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
    </form>`}function ae(e,a){e.querySelector("#gate-copy-device")?.addEventListener("click",async()=>{const t=e.querySelector("#gate-device").textContent.trim();try{await navigator.clipboard.writeText(t)}catch{}e.querySelector("#gate-copy-device").textContent="Copied ✓"}),e.querySelector("#gate-licence-file")?.addEventListener("change",async t=>{const n=t.target.files?.[0];n&&(e.querySelector("#gate-licence-form [name=key]").value=(await n.text()).trim())}),e.querySelector("#gate-licence-form")?.addEventListener("submit",async t=>{t.preventDefault();const n=e.querySelector("#gate-licence-error");n.textContent="";try{await _(new FormData(t.target).get("key")),await a()}catch(o){n.textContent=o.message}})}async function S(e,a){const t=w(),n=await T(),o={REVOKED:"Licence cancelled",SUSPENDED:"Account suspended",WRONG_DEVICE:"Licence is for another computer",CLOCK:"Check your computer date & time",NOT_STARTED:"Licence not started yet",INVALID:"Licence problem"}[e.status]||"Licence required";t.innerHTML=h(`<h2 class="auth-h">${r(o)}</h2>
     <div class="callout warning"><div>${r(e.message)}</div></div>
     ${e.status==="CLOCK"?"":te(e)}
     <div class="auth-divider"></div>
     <p class="auth-hint"><strong>Your data is safe on this computer.</strong> You can still download a complete backup (JSON + TXT).</p>
     <button type="button" class="btn btn-outline" id="gate-backup-btn">Download backup of my data</button>
     <div class="auth-error" id="gate-backup-msg" style="color:var(--color-success);"></div>
     ${N(n)}`,{wide:!0}),k(t,()=>S(e,a)),ae(t,()=>ie().then(a)),t.querySelector("#gate-backup-btn")?.addEventListener("click",async()=>{const g=await X({reason:"MANUAL",forceDownload:!0});t.querySelector("#gate-backup-msg").textContent=`Saved: ${g.files.join(", ")}`})}const ne=new Set(["JanSeva & Akshaya Digital Kendra","Centre Administrator","Main Market Road, Near Taluk Office","Ernakulam / Pune","682001","9876543210","desk@vlebook.local","CSC"]),b=e=>e&&!ne.has(String(e))?e:"";async function O(e,a){const t=w(),n=await f("settings","CENTRE_CONFIG"),o=n?{...n,centreName:b(n.centreName),ownerName:b(n.ownerName),mobile:b(n.mobile),email:b(n.email),district:b(n.district),address:b(n.address),pinCode:b(n.pinCode),centreType:b(n.centreType)}:null;t.innerHTML=h(`<h2 class="auth-h">Welcome! Create the Owner account</h2>
     <p class="auth-hint"><span>${r(D(e))}</span>. <span>The Owner can add staff logins later in</span> <strong>Users & Licence</strong>.</p>
     <form id="gate-owner-form" class="auth-form">
       <label class="form-label">Centre name</label>
       <input class="form-control" name="centreName" required value="${r(o?.centreName||"")}" data-no-i18n>
       <label class="form-label">Your name</label>
       <input class="form-control" name="displayName" required autocomplete="name" value="${r(o?.ownerName||"")}">
       <div class="auth-row">
         <div><label class="form-label">Mobile number</label><input class="form-control" name="mobile" type="tel" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" required value="${r(o?.mobile||"")}"></div>
         <div><label class="form-label">Email</label><input class="form-control" name="email" type="email" required autocomplete="email" value="${r(o?.email||"")}"><span class="form-hint">Your sign-in details and licence are sent here.</span></div>
       </div>
       <label class="form-label">Type of centre</label>
       <select class="form-control" name="centreType" required>
         <option value="">Select…</option>
         ${F.map(l=>`<option value="${r(l)}" ${o?.centreType===l?"selected":""}>${r(l)}</option>`).join("")}
       </select>
       <div class="auth-row">
         <div class="gate-csc"><label class="form-label">CSC ID <span class="form-hint-inline">(if registered with CSC)</span></label><input class="form-control" name="cscId" maxlength="30" value="${r(o?.cscId||"")}" data-no-i18n></div>
         <div class="gate-akshaya" hidden><label class="form-label">Akshaya Centre ID <span class="req">*</span></label><input class="form-control" name="akshayaId" maxlength="30" value="${r(o?.akshayaId||"")}" data-no-i18n></div>
       </div>
       <label class="form-label">Full address (building, street, place)</label>
       <textarea class="form-control" name="address" rows="2" required minlength="5">${r(o?.address||"")}</textarea>
       <div class="auth-row auth-row-3">
         <div><label class="form-label">District</label><input class="form-control" name="district" required value="${r(o?.district||"")}"></div>
         <div><label class="form-label">State</label><input class="form-control" name="state" required value="${r(o?.state||"")}"></div>
         <div><label class="form-label">PIN code</label><input class="form-control" name="pinCode" required inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" value="${r(o?.pinCode||"")}"></div>
       </div>
       <label class="form-label">GSTIN <span class="form-hint-inline">(optional – only if the centre has GST registration)</span></label>
       <input class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${r(o?.gstin||"")}" data-no-i18n>
       <label class="form-label">User name (for signing in)</label>
       <input class="form-control" name="username" required autocomplete="username" placeholder="e.g. owner" data-no-i18n>
       <label class="form-label">Password</label>
       <input class="form-control" type="password" name="password" required minlength="6" autocomplete="new-password">
       <label class="form-label">Confirm password</label>
       <input class="form-control" type="password" name="confirm" required minlength="6" autocomplete="new-password">
       <label class="auth-check"><input type="checkbox" name="agree" required><span><span>I have read and agree to the</span> <a href="help.html?doc=terms" target="_blank" rel="noopener">Terms &amp; Conditions</a>, <a href="help.html?doc=privacy" target="_blank" rel="noopener">Privacy Policy</a>, <a href="help.html?doc=refunds" target="_blank" rel="noopener">Refund Policy</a> <span>and</span> <a href="help.html?doc=disclaimer" target="_blank" rel="noopener">Disclaimer</a>.<br><span>I understand that my centre's registration details (not my business data) are shared with Techmin for licensing and support.</span></span></label>
       <button type="submit" class="btn btn-primary">Create Owner Account</button>
       <div class="auth-error" id="gate-owner-error"></div>
     </form>`),k(t,()=>O(e,a));const g=t.querySelector('select[name="centreType"]'),d=()=>{const l=$(g.value);t.querySelector(".gate-akshaya").hidden=!l,t.querySelector('input[name="akshayaId"]').required=l};g.addEventListener("change",d),d(),t.querySelector("#gate-owner-form").addEventListener("submit",async l=>{l.preventDefault();const s=new FormData(l.target),c=t.querySelector("#gate-owner-error");if(c.textContent="",s.get("password")!==s.get("confirm")){c.textContent="The two passwords do not match.";return}const i=m=>String(s.get(m)||"").trim(),u=V({centreType:i("centreType"),address:i("address"),district:i("district"),state:i("state"),pinCode:i("pinCode"),gstin:i("gstin"),cscId:i("cscId"),akshayaId:$(i("centreType"))?i("akshayaId"):""});if(u.error){c.textContent=u.error;return}try{const m=await f("settings","CENTRE_CONFIG"),R=String(s.get("centreName")||"").trim();m&&await v("settings",{...m,...u.values,centreName:R||m.centreName,ownerName:i("displayName"),mobile:i("mobile"),email:i("email")},{notifyAutosave:!1});const{recoveryCode:A,user:P}=await M({displayName:s.get("displayName"),username:s.get("username"),password:s.get("password")});await v("users",{...P,termsAcceptedAt:new Date().toISOString(),termsVersion:z.version},{notifyAutosave:!1}),await x(s.get("username"),s.get("password")),E().catch(()=>{}),se(A,a)}catch(m){c.textContent=m.message}})}function re(e){return`
    <div class="recovery-code" id="gate-recovery-code" data-no-i18n>${r(e)}</div>
    <p class="auth-hint">If you forget your password, this code lets you set a new one. <strong>Write it down or download it and keep it safe.</strong> It is shown only once.</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-download">Download code</button>
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-copy">Copy</button>
    </div>`}function oe(e,a){e.querySelector("#gate-recovery-download")?.addEventListener("click",async()=>{const t=await f("settings","CENTRE_CONFIG"),n=J(),o=`VLEBook Owner recovery code
Centre: ${t?.centreName||""}
User name: ${n?.username||""}
Recovery code: ${a}
Created: ${new Date().toLocaleString()}

Keep this safe. Use it on the sign-in screen → Forgot password.`,g=new Blob([o],{type:"text/plain"}),d=document.createElement("a");d.href=URL.createObjectURL(g),d.download="VLEBook_Recovery_Code.txt",d.click(),setTimeout(()=>URL.revokeObjectURL(d.href),500)}),e.querySelector("#gate-recovery-copy")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a)}catch{}})}function se(e,a){const t=w();t.innerHTML=h(`<h2 class="auth-h">Your Owner recovery code</h2>
     ${re(e)}
     <label class="auth-check"><input type="checkbox" id="gate-recovery-ok"> I have saved this recovery code</label>
     <button type="button" class="btn btn-primary" id="gate-recovery-continue" disabled>Continue to VLEBook</button>`),oe(t,e);const n=t.querySelector("#gate-recovery-ok"),o=t.querySelector("#gate-recovery-continue");n.addEventListener("change",()=>o.disabled=!n.checked),o.addEventListener("click",()=>{C(),a()})}async function y(e,a,t="login"){const n=w(),o=await f("settings","CENTRE_CONFIG"),g=await T(),d=e.status==="ACTIVE"||e.status==="TRIAL"?`<div class="auth-licence ok">${r(D(e))}</div>`:e.status==="BASIC"?`<div class="callout warning"><div><span>${r(e.message)}</span> <span>Only the Owner can sign in.</span></div></div>`:`<div class="callout warning"><div>${r(e.message)}</div></div>`;t==="login"?(n.innerHTML=h(`<div class="auth-centre" data-no-i18n>${r(o?.centreName||"")}</div>
       ${d}
       <form id="gate-login-form" class="auth-form">
         <label class="form-label">User name</label>
         <input class="form-control" name="username" required autocomplete="username" autofocus data-no-i18n>
         <label class="form-label">Password</label>
         <input class="form-control" type="password" name="password" required autocomplete="current-password">
         <button type="submit" class="btn btn-primary">Sign In</button>
         <div class="auth-error" id="gate-login-error"></div>
       </form>
       <button type="button" class="btn-link" id="gate-forgot">Forgot password?</button>`),n.querySelector("#gate-login-form").addEventListener("submit",async l=>{l.preventDefault();const s=new FormData(l.target);try{const c=await x(s.get("username"),s.get("password"));if(e.tier==="BASIC"&&c.role!=="OWNER")throw await q(),new Error("VLEBook is in Basic mode, so only the Owner can sign in. Ask the Owner to renew the licence.");C(),a()}catch(c){n.querySelector("#gate-login-error").textContent=c.message}}),n.querySelector("#gate-forgot").addEventListener("click",()=>y(e,a,"forgot"))):(n.innerHTML=h(`<h2 class="auth-h">Reset your password</h2>
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
       ${N(g)}`),n.querySelector("#gate-back").addEventListener("click",()=>y(e,a,"login")),n.querySelector("#gate-reset-form").addEventListener("submit",async l=>{l.preventDefault();const s=new FormData(l.target),c=n.querySelector("#gate-reset-error");c.textContent="";const i=String(s.get("code")||"").trim();try{if(i.startsWith("VLE1.")){const u=await Y(s.get("username"));if(!u)throw new Error("No user with this user name.");const{markUsed:m}=await B(i,u.username);await j(u.id,String(s.get("password")),"reset_by_techmin"),await m()}else await W(s.get("username"),i,String(s.get("password")));alert("Password changed. Please sign in with the new password."),y(e,a,"login")}catch(u){c.textContent=u.message}})),k(n,()=>y(e,a,t))}function ie(){return new Promise(async e=>{const a=await L();if(!a.allowed)return S(a,e);if(!await G())return O(a,e);const t=await H();if(t&&!(a.tier==="BASIC"&&t.role!=="OWNER"))return C(),e();t&&await q(),y(a,e)})}async function he({ping:e=!1}={}){e&&await E().catch(()=>{});const a=await L();return!a.allowed&&!p&&await new Promise(t=>S(a,()=>t(window.location.reload()))),a}function ye(){const e=document.createElement("div");e.className="modal-backdrop open",e.innerHTML=`
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
    </div>`,document.body.appendChild(e),e.querySelector("[data-close]").addEventListener("click",()=>e.remove()),e.querySelector("#chg-pass-form").addEventListener("submit",async a=>{a.preventDefault();const t=new FormData(a.target),n=e.querySelector("#chg-pass-error");if(t.get("new")!==t.get("confirm")){n.textContent="The two passwords do not match.";return}try{await K(t.get("old"),t.get("new")),e.remove(),alert("Password changed.")}catch(o){n.textContent=o.message}})}export{oe as bindRecoveryCode,C as closeGate,D as licenceSummary,ye as openChangePasswordDialog,I as planName,he as recheckLicence,re as recoveryCodeHTML,ie as runGate};
