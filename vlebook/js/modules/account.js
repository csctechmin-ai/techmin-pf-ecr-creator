import{getRecord as C}from"../core/db.js";import{getAllRecords as A}from"../core/db.js";import{esc as a,formatDate as N}from"../core/utils.js";import{getLicenceState as R,activateLicence as I,refreshRemoteStatus as S}from"../core/licence.js";import{listUsers as T,createUser as U,updateUser as P,setPassword as D,regenerateRecoveryCode as O,getCurrentUser as B,ROLES as m,ROLE_HELP as j}from"../core/auth.js";import{getVendor as q}from"../core/feed.js";import{licenceSummary as w,planName as M,recoveryCodeHTML as V,bindRecoveryCode as G,openChangePasswordDialog as H}from"./gate.js";import{allowNextUnload as _}from"../core/closeguard.js";let u=null,y="";async function $(l){const[s,o,g,b]=await Promise.all([R(),T(),A("staff"),q()]),n=B(),k=o.filter(e=>e.active!==!1).length,d=s.maxUsers||0,c=u?o.find(e=>e.id===u):null,L={ACTIVE:"success",TRIAL:"navy",EXPIRING:"warning",GRACE:"danger",BASIC:"danger"}[s.status]||"danger",x={TRIAL:"Full-version trial",EXPIRING:"Expiring soon",GRACE:"Ended – grace days",BASIC:"Basic mode",ACTIVE:"Active"}[s.status]||"Active",v=String(b.whatsapp||"").replace(/\D/g,""),E=encodeURIComponent(`Hello ${b.name}, please renew my VLEBook licence.
Centre: ${s.centre||""}
Device Code: ${s.deviceCode}`);l.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Users & Licence</h1>
        <p>Your VLEBook subscription, this computer's Device Code, and staff sign-in accounts</p>
      </div>
    </div>
    ${y?`<div class="callout success"><div><strong>${a(y)}</strong></div></div>`:""}
    ${s.testKey?'<div class="callout warning"><div><strong>Test signing key in use.</strong> Before giving VLEBook to customers, create your own key in the Techmin console and replace js/core/licence-pubkey.js.</div></div>':""}

    <div class="grid-kpi">
      <div class="kpi-card ${L}"><div class="kpi-label">Licence Status</div><div class="kpi-value" style="font-size:20px;">${a(x)}</div><div class="kpi-sub">${a(w(s))}</div></div>
      <div class="kpi-card"><div class="kpi-label">Plan</div><div class="kpi-value" style="font-size:20px;">${a(M(s))}</div><div class="kpi-sub">${s.centre?`Licensed to <span data-no-i18n>${a(s.centre)}</span>`:"Not yet licensed"}</div></div>
      <div class="kpi-card"><div class="kpi-label">Licence valid for</div><div class="kpi-value" style="font-size:20px;">${a(s.status==="BASIC"?"0 days":s.daysLeft==null?s.payload?"Lifetime":"—":`${s.daysLeft} day(s)`)}</div><div class="kpi-sub">${s.validTill?`till ${a(N(s.validTill))}`:""}</div></div>
      <div class="kpi-card navy"><div class="kpi-label">Users</div><div class="kpi-value">${k}${d?` / ${d}`:""}</div><div class="kpi-sub">${d?"Active / allowed by plan":"Unlimited users"}</div></div>
    </div>

    ${n?.role==="OWNER"||!n?'<div id="acc-subscribe"></div>':""}

    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header"><div class="card-title">Renew or change licence</div></div>
        <div class="auth-device" style="margin-bottom:10px;">
          <div><small>This computer's Device Code</small><div class="device-code" id="acc-device" data-no-i18n>${a(s.deviceCode)}</div></div>
          <button type="button" class="btn btn-sm btn-outline" id="acc-copy-device">Copy</button>
          ${v?`<a class="btn btn-sm btn-success" target="_blank" rel="noopener" href="https://wa.me/${v.length===10?"91"+v:v}?text=${E}">Ask ${a(b.name)} to renew</a>`:""}
        </div>
        <form id="acc-licence-form" class="auth-form">
          <label class="form-label">New licence key</label>
          <textarea class="form-control" name="key" rows="3" placeholder="Paste the licence key (starts with VLE1.)" data-no-i18n required></textarea>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="submit" class="btn btn-primary">Activate Licence</button>
            <label class="btn btn-outline" style="cursor:pointer;">Open licence file<input type="file" id="acc-licence-file" accept=".vlelic,.txt" hidden></label>
            <button type="button" class="btn btn-outline" id="acc-check-online">Check licence online</button>
          </div>
          <div class="auth-error" id="acc-licence-error"></div>
        </form>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">My account</div></div>
        <p style="margin:0 0 10px;">Signed in as <strong data-no-i18n>${a(n?.displayName||"")}</strong> (<span data-no-i18n>${a(n?.username||"")}</span>) · ${a(m[n?.role]||"")}</p>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-outline btn-sm" id="acc-change-pass">Change my password</button>
          ${n?.role==="OWNER"?'<button type="button" class="btn btn-outline btn-sm" id="acc-new-recovery">Make a new recovery code</button>':""}
        </div>
        <div id="acc-recovery-box" style="margin-top:12px;"></div>
      </div>
    </div>

    <div class="grid-sidebar-right" style="margin-top:16px;">
      <div class="card">
        <div class="card-header"><div class="card-title">Staff sign-in accounts</div><button class="btn btn-sm btn-primary" id="acc-user-new">+ Add User</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Name</th><th>User name</th><th>Role</th><th>Linked staff</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead>
            <tbody>
              ${o.map(e=>`<tr style="${e.active===!1?"opacity:0.55;":""}">
                <td><strong data-no-i18n>${a(e.displayName)}</strong>${e.id===n?.id?" <small>(you)</small>":""}</td>
                <td data-no-i18n>${a(e.username)}</td>
                <td><span class="badge ${e.role==="OWNER"?"badge-success":e.role==="MANAGER"?"badge-info":"badge-neutral"}">${a(m[e.role])}</span></td>
                <td data-no-i18n>${a(g.find(t=>t.id===e.staffId)?.name||"—")}</td>
                <td>${e.active===!1?"Inactive":"Active"}</td>
                <td>${e.lastLoginAt?a(new Date(e.lastLoginAt).toLocaleString()):"—"}</td>
                <td style="white-space:nowrap;"><button class="btn btn-xs btn-outline" data-user-edit="${a(e.id)}">Edit</button> <button class="btn btn-xs btn-outline" data-user-reset="${a(e.id)}">Reset password</button></td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <ul class="tool-help-list" style="margin-top:12px;">
          ${Object.entries(j).map(([e,t])=>`<li><strong>${a(m[e])}:</strong> ${a(t)}</li>`).join("")}
        </ul>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${c?"Edit User":"Add User"}</div></div>
        <form id="acc-user-form" class="auth-form">
          <label class="form-label">Name</label>
          <input class="form-control" name="displayName" required value="${a(c?.displayName||"")}" data-no-i18n>
          <label class="form-label">User name</label>
          <input class="form-control" name="username" required ${c?"disabled":""} value="${a(c?.username||"")}" placeholder="e.g. anjali" data-no-i18n>
          ${c?"":'<label class="form-label">Password</label><input class="form-control" type="password" name="password" required minlength="6" autocomplete="new-password">'}
          <label class="form-label">Role</label>
          <select class="form-control" name="role">${Object.entries(m).map(([e,t])=>`<option value="${e}" ${(c?.role||"OPERATOR")===e?"selected":""}>${a(t)}</option>`).join("")}</select>
          <label class="form-label">Linked staff (for commission)</label>
          <select class="form-control" name="staffId"><option value="">— None —</option>${g.map(e=>`<option value="${a(e.id)}" ${c?.staffId===e.id?"selected":""} data-no-i18n>${a(e.name)}</option>`).join("")}</select>
          ${c?`<label class="auth-check"><input type="checkbox" name="active" ${c.active!==!1?"checked":""}> Active (can sign in)</label>`:""}
          <button type="submit" class="btn btn-primary">${c?"Save Changes":"Add User"}</button>
          <div class="auth-error" id="acc-user-error"></div>
        </form>
      </div>
    </div>`;const h=l.querySelector("#acc-subscribe");if(h){const e=await C("settings","CENTRE_CONFIG")||{};import("./subscribe.js").then(t=>t.renderSubscribe(h,{centre:e,onLicence:()=>setTimeout(()=>$(l),1500)})).catch(()=>{})}const i=e=>l.querySelector(e),r=(e="")=>(y=e,$(l));i("#acc-copy-device").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(s.deviceCode)}catch{}i("#acc-copy-device").textContent="Copied ✓"}),i("#acc-licence-file").addEventListener("change",async e=>{const t=e.target.files?.[0];t&&(i("#acc-licence-form [name=key]").value=(await t.text()).trim())}),i("#acc-licence-form").addEventListener("submit",async e=>{e.preventDefault();try{const t=await I(new FormData(e.target).get("key"));await r(`Licence activated: ${w(t)}. VLEBook will restart in a moment.`),setTimeout(()=>{_(),window.location.reload()},1500)}catch(t){i("#acc-licence-error").textContent=t.message}}),i("#acc-check-online").addEventListener("click",async()=>{const e=await S();await r(e?"Licence checked online.":"Could not reach the internet. Licence will be checked next time you are online.")}),i("#acc-change-pass").addEventListener("click",H),i("#acc-new-recovery")?.addEventListener("click",async()=>{if(!confirm("Make a new recovery code? The old code will stop working."))return;const e=await O(n.id);i("#acc-recovery-box").innerHTML=V(e),G(i("#acc-recovery-box"),e)}),i("#acc-user-new").addEventListener("click",()=>{u=null,r()}),l.querySelectorAll("[data-user-edit]").forEach(e=>e.addEventListener("click",()=>{u=e.getAttribute("data-user-edit"),r()})),l.querySelectorAll("[data-user-reset]").forEach(e=>e.addEventListener("click",async()=>{const t=o.find(f=>f.id===e.getAttribute("data-user-reset")),p=prompt(`New password for ${t.displayName} (at least 6 characters):`);if(p)try{await D(t.id,p,"reset"),await r(`Password reset for ${t.displayName}.`)}catch(f){alert(f.message)}})),i("#acc-user-form").addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target);try{c?(await P(c.id,{displayName:String(t.get("displayName")).trim(),role:t.get("role"),staffId:t.get("staffId")||"",active:t.get("active")==="on"},{maxUsers:d}),await r(`User updated: ${t.get("displayName")}.`)):(await U({displayName:t.get("displayName"),username:t.get("username"),password:t.get("password"),role:t.get("role"),staffId:t.get("staffId")},{maxUsers:d}),await r(`User added: ${t.get("displayName")}.`))}catch(p){i("#acc-user-error").textContent=p.message}})}export{$ as renderAccountModule};
