import{getRecord as y,putRecord as S,logAudit as M}from"../core/db.js";import{safeHttpUrl as N,esc as r}from"../core/utils.js";import{getLicenceState as q,activateLicence as j,verifyResetToken as H,refreshRemoteStatus as L,requireOnline as T,PLAN_LABELS as Y}from"../core/licence.js";import{CENTRE_TYPES as W,isAkshaya as I,checkCentreDetails as J}from"../core/centreinfo.js";import{hasAnyUser as K,setupOwner as X,login as O,logout as R,resumeSession as z,recoverWithCode as Q,findUser as Z,setPassword as ee,changeOwnPassword as te,getCurrentUser as ae}from"../core/auth.js";import{getVendor as D}from"../core/feed.js";import{runAutoBackup as ne}from"../core/autobackup.js";import{LEGAL as oe}from"../core/helpdocs.js";import{setLang as re,getLang as se}from"../core/i18n.js";let g=null;function C(){return g||(g=document.createElement("div"),g.id="auth-gate",g.className="auth-gate",document.body.classList.remove("booting"),document.body.appendChild(g)),document.body.classList.add("gated"),g}function E(){document.body.classList.remove("gated"),g?.remove(),g=null}function ie(){const e=se();return`<select class="form-control auth-lang" id="gate-lang" data-no-i18n>
    <option value="en" ${e==="en"?"selected":""}>English</option>
    <option value="hi" ${e==="hi"?"selected":""}>हिन्दी</option>
    <option value="ml" ${e==="ml"?"selected":""}>മലയാളം</option>
  </select>`}function w(e,{wide:a=!1}={}){return`
    <div class="auth-card ${a?"wide":""}">
      <div class="auth-brand">
        <img src="icons/vlebook-logo${document.documentElement.getAttribute("data-theme")==="dark"?"-dark":""}.svg" alt="VLEBook" class="auth-logo">
        <span class="early-badge" title="VLEBook is in early access: features may change and some errors may remain. Keep regular backups.">Early access</span>
        ${ie()}
      </div>
      ${e}
    </div>`}function x(e,a){e.querySelector("#gate-lang")?.addEventListener("change",async t=>{re(t.target.value);const n=await y("settings","CENTRE_CONFIG");n&&await S("settings",{...n,language:t.target.value},{notifyAutosave:!1,skipChangeTracking:!0}),a()})}function P(e){const a=String(e.whatsapp||"").replace(/\D/g,""),t=[e.phone?`Phone: <a href="tel:${r(e.phone)}">${r(e.phone)}</a>`:"",a?`<a href="https://wa.me/${a.length===10?"91"+a:a}" target="_blank" rel="noopener">WhatsApp</a>`:"",e.email?`Email: <a href="mailto:${r(e.email)}">${r(e.email)}</a>`:"",N(e.website)?`<a href="${r(N(e.website))}" target="_blank" rel="noopener">${r(e.website.replace(/^https?:\/\//,"").replace(/\/$/,""))}</a>`:""].filter(Boolean);return`<div class="auth-contact"><strong>${r(e.name||"Techmin")} support</strong>${t.length?`<div>${t.join(" &nbsp;·&nbsp; ")}</div>`:""}</div>`}function A(e){return e.plan==="MONTHS"&&e.months?`${e.months}-month licence`:e.plan==="BASIC"?"Basic mode":`${Y[e.plan]||e.plan||""} licence`}function B(e){return e.status==="TRIAL"?`Full-version trial · ${e.daysLeft} day(s) left`:e.status==="BASIC"?"Basic mode (trial or licence ended)":e.payload?e.validTill?`${A(e)} · valid for ${e.daysLeft} day(s), till ${e.validTill.split("-").reverse().join("-")}`:`${A(e)} · lifetime`:e.message}function ce(e){return`
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
    </form>`}function le(e,a){e.querySelector("#gate-copy-device")?.addEventListener("click",async()=>{const t=e.querySelector("#gate-device").textContent.trim();try{await navigator.clipboard.writeText(t)}catch{}e.querySelector("#gate-copy-device").textContent="Copied ✓"}),e.querySelector("#gate-licence-file")?.addEventListener("change",async t=>{const n=t.target.files?.[0];n&&(e.querySelector("#gate-licence-form [name=key]").value=(await n.text()).trim())}),e.querySelector("#gate-licence-form")?.addEventListener("submit",async t=>{t.preventDefault();const n=e.querySelector("#gate-licence-error");n.textContent="";try{await j(new FormData(t.target).get("key")),await a()}catch(i){n.textContent=i.message}})}async function $(e,a){const t=C(),n=await D(),i={REVOKED:"Licence cancelled",SUSPENDED:"Account suspended",WRONG_DEVICE:"Licence is for another computer",CLOCK:"Check your computer date & time",NOT_STARTED:"Licence not started yet",INVALID:"Licence problem"}[e.status]||"Licence required";t.innerHTML=w(`<h2 class="auth-h">${r(i)}</h2>
     <div class="callout warning"><div>${r(e.message)}</div></div>
     ${e.status==="CLOCK"?"":ce(e)}
     <div class="auth-divider"></div>
     <p class="auth-hint"><strong>Your data is safe on this computer.</strong> You can still download a complete backup (JSON + TXT).</p>
     <button type="button" class="btn btn-outline" id="gate-backup-btn">Download backup of my data</button>
     <div class="auth-error" id="gate-backup-msg" style="color:var(--color-success);"></div>
     ${P(n)}`,{wide:!0}),x(t,()=>$(e,a)),le(t,()=>ge().then(a)),t.querySelector("#gate-backup-btn")?.addEventListener("click",async()=>{const f=await ne({reason:"MANUAL",forceDownload:!0});t.querySelector("#gate-backup-msg").textContent=`Saved: ${f.files.join(", ")}`})}const de=new Set(["JanSeva & Akshaya Digital Kendra","Centre Administrator","Main Market Road, Near Taluk Office","Ernakulam / Pune","682001","9876543210","desk@vlebook.local","CSC"]),b=e=>e&&!de.has(String(e))?e:"";async function G(e,a){const t=C(),n=await y("settings","CENTRE_CONFIG"),i=n?{...n,centreName:b(n.centreName),ownerName:b(n.ownerName),mobile:b(n.mobile),email:b(n.email),district:b(n.district),address:b(n.address),pinCode:b(n.pinCode),centreType:b(n.centreType)}:null,f=typeof window.showDirectoryPicker=="function";t.innerHTML=w(`${f?`<div class="auth-join" id="gate-join-box">
       <strong>Does your centre already use VLEBook on another computer?</strong>
       <p class="auth-hint">Join it here: choose the same Google Drive folder that the main computer uses for backups. The centre's users, customers, services and accounts come to this computer, and staff sign in with their own user name and password. Internet is needed.</p>
       <button type="button" class="btn btn-primary" id="gate-join-folder">Join my centre (shared Google Drive folder)</button>
       <div class="auth-error" id="gate-join-msg" role="status"></div>
     </div>
     <div class="auth-or"><span>or set up a new centre</span></div>`:""}
     <h2 class="auth-h">Welcome! Create the Owner account</h2>
     <p class="auth-hint"><span>${r(B(e))}</span>. <span>The Owner can add staff logins later in</span> <strong>Users & Licence</strong>.</p>
     <p class="auth-hint"><span>Setting up the account needs an internet connection, because the centre is activated with Techmin. After that, daily work continues offline.</span></p>
     <form id="gate-owner-form" class="auth-form">
       <label class="form-label">Centre name</label>
       <input class="form-control" name="centreName" required value="${r(i?.centreName||"")}" data-no-i18n>
       <label class="form-label">Your name</label>
       <input class="form-control" name="displayName" required autocomplete="name" value="${r(i?.ownerName||"")}">
       <div class="auth-row">
         <div><label class="form-label">Mobile number</label><input class="form-control" name="mobile" type="tel" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" required value="${r(i?.mobile||"")}"></div>
         <div><label class="form-label">Email</label><input class="form-control" name="email" type="email" required autocomplete="email" value="${r(i?.email||"")}"><span class="form-hint">Your sign-in details and licence are sent here.</span></div>
       </div>
       <label class="form-label">Type of centre</label>
       <select class="form-control" name="centreType" required>
         <option value="">Select…</option>
         ${W.map(c=>`<option value="${r(c)}" ${i?.centreType===c?"selected":""}>${r(c)}</option>`).join("")}
       </select>
       <div class="auth-row">
         <div class="gate-csc"><label class="form-label">CSC ID <span class="form-hint-inline">(if registered with CSC)</span></label><input class="form-control" name="cscId" maxlength="30" value="${r(i?.cscId||"")}" data-no-i18n></div>
         <div class="gate-akshaya" hidden><label class="form-label">Akshaya Centre ID <span class="req">*</span></label><input class="form-control" name="akshayaId" maxlength="30" value="${r(i?.akshayaId||"")}" data-no-i18n></div>
       </div>
       <label class="form-label">Full address (building, street, place)</label>
       <textarea class="form-control" name="address" rows="2" required minlength="5">${r(i?.address||"")}</textarea>
       <div class="auth-row auth-row-3">
         <div><label class="form-label">District</label><input class="form-control" name="district" required value="${r(i?.district||"")}"></div>
         <div><label class="form-label">State</label><input class="form-control" name="state" required value="${r(i?.state||"")}"></div>
         <div><label class="form-label">PIN code</label><input class="form-control" name="pinCode" required inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" value="${r(i?.pinCode||"")}"></div>
       </div>
       <div class="auth-row">
         <div><label class="form-label">GSTIN <span class="form-hint-inline">(optional – only if the centre has GST registration)</span></label>
         <input class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${r(i?.gstin||"")}" data-no-i18n></div>
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
     </div>`:""}`),x(t,()=>G(e,a)),t.querySelector("#gate-join-folder")?.addEventListener("click",async c=>{const o=t.querySelector("#gate-join-msg"),l=c.currentTarget;try{const s=await window.showDirectoryPicker({id:"vlebook-backups",mode:"readwrite"});l.disabled=!0,o.textContent="Connecting to Techmin…",await T(),o.textContent="Reading the centre data from the shared folder…";const{joinCentre:p}=await import("../core/sync.js"),d=await p(s);o.textContent="Adding this computer to your centre with Techmin…",await L().catch(()=>{});const{kvGet:u}=await import("../core/devicestore.js"),k=await u("syncJoinPending");o.textContent=k?`Joined ${d.centreName} as counter ${d.counter}. Techmin could not confirm this computer yet: open VLEBook on the main computer while it is online, then reopen VLEBook here. VLEBook will restart now.`:`Joined ${d.centreName} as counter ${d.counter} (${d.records} records). Staff can now sign in on this computer. VLEBook will restart now.`,setTimeout(()=>window.location.reload(),k?6e3:2e3)}catch(s){if(l.disabled=!1,s?.name==="AbortError"){o.textContent="";return}o.textContent=s.message}}),t.querySelector("#gate-restore-folder")?.addEventListener("click",async()=>{const c=t.querySelector("#gate-restore-msg");try{const o=await window.showDirectoryPicker({id:"vlebook-backups",mode:"readwrite"});c.textContent="Connecting to Techmin…",await T(),c.textContent="Looking for the latest backup…";const{restoreLatestFromFolder:l}=await import("../core/folderrestore.js"),s=await l(o);c.textContent=`Restored ${s.file} (${s.records} records, ${s.auditImported} audit entries). VLEBook will restart now.`,setTimeout(()=>window.location.reload(),1500)}catch(o){if(o?.name==="AbortError")return;c.textContent=o.message}});const m=t.querySelector('select[name="centreType"]'),h=()=>{const c=I(m.value);t.querySelector(".gate-akshaya").hidden=!c,t.querySelector('input[name="akshayaId"]').required=c};m.addEventListener("change",h),h(),t.querySelector("#gate-owner-form").addEventListener("submit",async c=>{c.preventDefault();const o=new FormData(c.target),l=t.querySelector("#gate-owner-error");if(l.textContent="",o.get("password")!==o.get("confirm")){l.textContent="The two passwords do not match.";return}const s=u=>String(o.get(u)||"").trim(),p=J({centreType:s("centreType"),address:s("address"),district:s("district"),state:s("state"),pinCode:s("pinCode"),gstin:s("gstin"),cscId:s("cscId"),akshayaId:I(s("centreType"))?s("akshayaId"):""});if(p.error){l.textContent=p.error;return}const d=c.target.querySelector("button[type=submit]");try{d&&(d.disabled=!0),l.textContent="Connecting to Techmin to activate your account…",await T(),l.textContent=""}catch(u){l.textContent=u.message,d&&(d.disabled=!1);return}d&&(d.disabled=!1);try{const u=await y("settings","CENTRE_CONFIG"),k=String(o.get("centreName")||"").trim(),U=p.values.gstin?{gstRegistrationType:s("gstRegType")==="COMPOSITION"?"COMPOSITION":"REGULAR",gstStateCode:p.values.gstin.slice(0,2),...s("gstRegType")==="COMPOSITION"?{gstCompositionRatePct:6}:{}}:{gstRegistrationType:"UNREGISTERED"};u&&await S("settings",{...u,...p.values,...U,centreName:k||u.centreName,ownerName:s("displayName"),mobile:s("mobile"),email:s("email")},{notifyAutosave:!1});const{recoveryCode:V,user:_}=await X({displayName:o.get("displayName"),username:o.get("username"),password:o.get("password")});await S("users",{..._,termsAcceptedAt:new Date().toISOString(),termsVersion:oe.version},{notifyAutosave:!1}),await O(o.get("username"),o.get("password")),import("../core/autobackup.js").then(F=>F.resetAutoBackupClock()).catch(()=>{}),L().catch(()=>{}),pe(V,a)}catch(u){l.textContent=u.message}})}function ue(e){return`
    <div class="recovery-code" id="gate-recovery-code" data-no-i18n>${r(e)}</div>
    <p class="auth-hint">If you forget your password, this code lets you set a new one. <strong>Write it down or download it and keep it safe.</strong> It is shown only once.</p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-download">Download code</button>
      <button type="button" class="btn btn-outline btn-sm" id="gate-recovery-copy">Copy</button>
    </div>`}function me(e,a){e.querySelector("#gate-recovery-download")?.addEventListener("click",async()=>{const t=await y("settings","CENTRE_CONFIG"),n=ae(),i=`VLEBook Owner recovery code
Centre: ${t?.centreName||""}
User name: ${n?.username||""}
Recovery code: ${a}
Created: ${new Date().toLocaleString()}

Keep this safe. Use it on the sign-in screen → Forgot password.`,f=new Blob([i],{type:"text/plain"}),m=document.createElement("a");m.href=URL.createObjectURL(f),m.download="VLEBook_Recovery_Code.txt",m.click(),setTimeout(()=>URL.revokeObjectURL(m.href),500)}),e.querySelector("#gate-recovery-copy")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(a)}catch{}})}function pe(e,a){const t=C();t.innerHTML=w(`<h2 class="auth-h">Your Owner recovery code</h2>
     ${ue(e)}
     <label class="auth-check"><input type="checkbox" id="gate-recovery-ok"> I have saved this recovery code</label>
     <button type="button" class="btn btn-primary" id="gate-recovery-continue" disabled>Continue to VLEBook</button>`),me(t,e);const n=t.querySelector("#gate-recovery-ok"),i=t.querySelector("#gate-recovery-continue");n.addEventListener("change",()=>i.disabled=!n.checked),i.addEventListener("click",()=>{E(),a()})}async function v(e,a,t="login"){const n=C(),i=await y("settings","CENTRE_CONFIG"),f=await D(),m=e.status==="ACTIVE"||e.status==="TRIAL"?`<div class="auth-licence ok">${r(B(e))}</div>`:e.status==="BASIC"?`<div class="callout warning"><div><span>${r(e.message)}</span> <span>Only the Owner can sign in.</span></div></div>`:`<div class="callout warning"><div>${r(e.message)}</div></div>`;t==="login"?(n.innerHTML=w(`<div class="auth-centre" data-no-i18n>${r(i?.centreName||"")}</div>
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
       <button type="button" class="btn-link" id="gate-forgot">Forgot password?</button>`),n.querySelector("#gate-login-form").addEventListener("submit",async h=>{h.preventDefault();const c=new FormData(h.target);try{const o=await O(c.get("username"),c.get("password"));if(e.tier==="BASIC"&&o.role!=="OWNER")throw await M("LOGIN_REFUSED","account",o.id,`${o.username} could not sign in: Basic mode allows only the Owner`),await R(),new Error("VLEBook is in Basic mode, so only the Owner can sign in. Ask the Owner to renew the licence.");E(),a()}catch(o){n.querySelector("#gate-login-error").textContent=o.message}}),n.querySelector("#gate-forgot").addEventListener("click",()=>v(e,a,"forgot"))):(n.innerHTML=w(`<h2 class="auth-h">Reset your password</h2>
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
       ${P(f)}`),n.querySelector("#gate-back").addEventListener("click",()=>v(e,a,"login")),n.querySelector("#gate-reset-form").addEventListener("submit",async h=>{h.preventDefault();const c=new FormData(h.target),o=n.querySelector("#gate-reset-error");o.textContent="";const l=String(c.get("code")||"").trim();try{if(l.startsWith("VLE1.")){const s=await Z(c.get("username"));if(!s)throw new Error("No user with this user name.");const{markUsed:p}=await H(l,s.username);await ee(s.id,String(c.get("password")),"reset_by_techmin"),await p()}else await Q(c.get("username"),l,String(c.get("password")));alert("Password changed. Please sign in with the new password."),v(e,a,"login")}catch(s){o.textContent=s.message}})),x(n,()=>v(e,a,t))}function ge(){return new Promise(async e=>{const a=await q();if(!a.allowed)return $(a,e);if(!await K())return G(a,e);const t=await z();if(t&&!(a.tier==="BASIC"&&t.role!=="OWNER"))return E(),e();t&&await R(),v(a,e)})}async function Le({ping:e=!1}={}){e&&await L().catch(()=>{});const a=await q();return!a.allowed&&!g&&await new Promise(t=>$(a,()=>t(window.location.reload()))),a}function Te(){const e=document.createElement("div");e.className="modal-backdrop open",e.innerHTML=`
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
    </div>`,document.body.appendChild(e),e.querySelector("[data-close]").addEventListener("click",()=>e.remove()),e.querySelector("#chg-pass-form").addEventListener("submit",async a=>{a.preventDefault();const t=new FormData(a.target),n=e.querySelector("#chg-pass-error");if(t.get("new")!==t.get("confirm")){n.textContent="The two passwords do not match.";return}try{await te(t.get("old"),t.get("new")),e.remove(),alert("Password changed.")}catch(i){n.textContent=i.message}})}export{me as bindRecoveryCode,E as closeGate,B as licenceSummary,Te as openChangePasswordDialog,A as planName,Le as recheckLicence,ue as recoveryCodeHTML,ge as runGate};
