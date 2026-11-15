import{getRecord as S,putRecord as E,getAllRecords as j,clearAllStores as V,logAudit as F,startFreshClearTransactions as G}from"../core/db.js";import{getCurrentUser as C}from"../core/auth.js";import{getLang as z,DEFAULT_WHATSAPP_TEMPLATES as U}from"../core/i18n.js";import{loadOptionalAcceptanceDataset as Y}from"../core/sample-data.js";import{formatDate as T,esc as i,hashLockPin as K,safeFileName as J,downloadFile as Z,todayISO as Q}from"../core/utils.js";import{applyAppearance as M,currentPalette as _,currentMode as O}from"../core/appearance.js";import{isCloseWarningEnabled as X,setCloseWarningEnabled as ee}from"../core/closeguard.js";import{processLogoFile as te,applyCentreBranding as ae,isValidLogo as L}from"../core/branding.js";import{CENTRE_TYPES as W,isAkshaya as I,checkCentreDetails as se}from"../core/centreinfo.js";async function h(s,l){const[$,r]=await Promise.all([S("settings","CENTRE_CONFIG"),j("audit_logs")]),a=$||{},g=a.enabledModules||{},m=a.whatsappTemplates||U,k=[...r].sort((e,o)=>String(o.timestamp||"").localeCompare(String(e.timestamp||""))).slice(0,200);s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Settings, Centre Setup Wizard & Security</h1>
        <p>Configure your centre identity, invoice numbering, languages, WhatsApp templates, module visibility & PIN lock</p>
      </div>
      <div class="module-actions">
        <button class="btn btn-gold" id="set-load-acceptance-btn">Load Optional Acceptance Test Dataset</button>
        ${C()?.role==="OWNER"||!C()?'<button class="btn btn-warning" id="set-start-fresh-btn" title="Clear all bills, payments and amounts; keep users, customers, services and settings">Start fresh (clear transactions)</button>':""}
        <button class="btn btn-danger" id="set-reset-db-btn">Reset Local Database</button>
      </div>
    </div>

    <div class="grid-2">
      <!-- Centre Profile & Setup Wizard -->
      <div class="card" data-autosave-scope="settings_profile">
        <div class="card-header">
          <div class="card-title">Centre Identity & Invoice Setup</div>
        </div>
        <div class="logo-setting">
          <div class="logo-preview" id="set-logo-preview">${L(a.centreLogo)?`<img src="${a.centreLogo}" alt="Centre logo">`:"No logo"}</div>
          <div style="flex:1; min-width:200px;">
            <div style="font-weight:600;">Centre logo</div>
            <div class="form-hint">Shown at the top of the screen and on the dashboard, and printed on invoices, receipts and PDF reports. PNG, JPG or WEBP, up to 3 MB. A square or wide logo on a white or transparent background works best.</div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <label class="btn btn-sm btn-primary" style="cursor:pointer;">${L(a.centreLogo)?"Change logo":"Upload logo"}<input type="file" id="set-logo-file" accept="image/png,image/jpeg,image/webp" hidden></label>
              ${L(a.centreLogo)?'<button type="button" class="btn btn-sm btn-outline" id="set-logo-remove">Remove logo</button>':""}
            </div>
            <div class="auth-error" id="set-logo-msg"></div>
          </div>
        </div>
        <form id="settings-profile-form" class="form-grid" style="grid-template-columns:1fr;">
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Centre Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="centreName" required value="${i(a.centreName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Centre Type</label>
              <select class="form-control" name="centreType">
                ${W.map(e=>`<option value="${i(e)}" ${a.centreType===e?"selected":""}>${i(e)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Owner / VLE Name</label>
              <input type="text" class="form-control" name="ownerName" value="${i(a.ownerName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Official Mobile Number</label>
              <input type="tel" class="form-control" name="mobile" maxlength="10" value="${i(a.mobile||"")}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Address (building, street, place)</label>
            <textarea class="form-control" name="address" rows="2">${i(a.address||"")}</textarea>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">District</label>
              <input type="text" class="form-control" name="district" value="${i(a.district||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" class="form-control" name="state" value="${i(a.state||"Kerala")}">
            </div>
            <div class="form-group">
              <label class="form-label">PIN Code</label>
              <input type="text" class="form-control" name="pinCode" maxlength="6" value="${i(a.pinCode||"")}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">GSTIN (Optional)</label>
              <input type="text" class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${i(a.gstin||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">CSC ID (Optional)</label>
              <input type="text" class="form-control" name="cscId" maxlength="30" value="${i(a.cscId||"")}">
            </div>
            <div class="form-group" id="settings-akshaya-wrap" ${I(a.centreType)?"":"hidden"}>
              <label class="form-label">Akshaya Centre ID</label>
              <input type="text" class="form-control" name="akshayaId" maxlength="30" value="${i(a.akshayaId||"")}">
            </div>
          </div>
          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Invoice Prefix</label>
              <input type="text" class="form-control" name="invoicePrefix" value="${i(a.invoicePrefix||"VLE")}">
            </div>
            <div class="form-group">
              <label class="form-label">Next Invoice #</label>
              <input type="number" class="form-control" name="nextInvoiceNumber" value="${Number(a.nextInvoiceNumber||1001)}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Financial Year</label>
              <input type="text" class="form-control" name="financialYear" value="${i(a.financialYear||"2026-27")}">
            </div>
            <div class="form-group">
              <label class="form-label">Interface Language</label>
              <select class="form-control" name="language">
                <option value="en" ${a.language==="en"?"selected":""}>English</option>
                <option value="ml" ${a.language==="ml"?"selected":""}>മലയാളം (Malayalam)</option>
                <option value="hi" ${a.language==="hi"?"selected":""}>हिन्दी (Hindi)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Backup Reminder (Days)</label>
              <input type="number" min="1" max="30" class="form-control" name="backupReminderDays" value="${Number(a.backupReminderDays||3)}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Invoice Footer Note</label>
            <input type="text" class="form-control" name="footerNote" value="${i(a.footerNote||"")}">
          </div>

          <button type="submit" class="btn btn-primary">Save Centre Configuration</button>
          <div class="auth-error" id="settings-centre-error" style="margin-top:6px;"></div>
        </form>
      </div>

      <!-- Security, PIN Lock, Module Visibility & WhatsApp Templates -->
      <div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">Appearance</div>
          </div>
          <div class="grid-2" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Colour Theme</label>
              <select class="form-control" id="set-palette">
                <option value="zoho" ${_()==="zoho"?"selected":""}>Zoho Books style</option>
                <option value="erpnext" ${_()==="erpnext"?"selected":""}>ERPNext style</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Night Mode</label>
              <select class="form-control" id="set-night-mode">
                <option value="light" ${O()==="light"?"selected":""}>Off (Day)</option>
                <option value="dark" ${O()==="dark"?"selected":""}>On (Night)</option>
              </select>
            </div>
          </div>
          <span class="form-hint">Applies instantly. Night mode can also be switched with the moon button at the top.</span>
          <label style="display:flex; gap:8px; align-items:center; font-size:13px; margin-top:12px;">
            <input type="checkbox" id="set-close-warning" ${X()?"checked":""}>
            Warn me when closing the tab if data is unsaved or not backed up
          </label>
        </div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">Session Lock PIN & Module Enable/Disable</div>
          </div>
          <div class="callout">
            <span><strong>Security Clarification:</strong> An application PIN on a local-only browser app prevents casual walk-by access when you step away from your desk. It is not equivalent to hardware disk encryption or server-side multi-user authentication; use encrypted backups for sensitive off-device storage.</span>
          </div>
          <form id="settings-security-form" class="form-grid" style="grid-template-columns:1fr;">
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Screen Lock PIN (4–6 digits, optional)</label>
                <input type="password" inputmode="numeric" maxlength="6" autocomplete="new-password" class="form-control" name="lockPin" placeholder="${a.lockPinHash?"PIN is set — type a new PIN to change":"Leave blank for no lock"}">
                ${a.lockPinHash?'<label style="display:flex; gap:6px; align-items:center; font-size:12px; margin-top:4px;"><input type="checkbox" name="removePin"> Remove PIN lock</label>':""}
                <span class="form-hint" id="pin-status-hint">${a.lockPinHash?"PIN active (stored as a secure hash)":"No PIN set"}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Auto-Lock Inactivity (Minutes)</label>
                <input type="number" min="0" max="120" class="form-control" name="inactivityLockMinutes" value="${Number(a.inactivityLockMinutes||0)}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Enable / Disable Sidebar Modules:</label>
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; background:var(--color-surface-alt); padding:10px; border-radius:var(--radius-sm);">
                ${[["customers","Customers & 360°"],["services","Service Management"],["billing","Billing & Invoices"],["accounts","Accounts & Counter"],["pending","Pending Work"],["aeps","AEPS & Banking"],["commissions","Commissions"],["staff","Staff Commission"],["inventory","Inventory"],["studio","Document Workbench"],["cv","CV & Resume Builder"],["tools","PDF & Image Tools"],["catalogue","Govt Catalogue"],["reports","Reports & Profit BI"],["vault","Software Vault"]].map(([e,o])=>`
                  <label style="font-size:12px; display:flex; align-items:center; gap:6px;">
                    <input type="checkbox" name="mod_${e}" ${g[e]!==!1?"checked":""}> ${o}
                  </label>`).join("")}
              </div>
            </div>

            <button type="submit" class="btn btn-teal">Save Security & Module Preferences</button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">WhatsApp Click-to-Chat Templates (English / Hindi / Malayalam)</div>
          </div>
          <form id="settings-wa-form" class="form-grid" style="grid-template-columns:1fr; gap:8px;">
            <div class="form-group">
              <label class="form-label">English Invoice Template</label>
              <input type="text" class="form-control" name="en_invoice" value="${i(m.en?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Hindi Invoice Template (हिन्दी)</label>
              <input type="text" class="form-control" name="hi_invoice" value="${i(m.hi?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Malayalam Invoice Template (മലയാളം)</label>
              <input type="text" class="form-control" name="ml_invoice" value="${i(m.ml?.invoice||"")}">
            </div>
            <button type="submit" class="btn btn-sm btn-outline">Update WhatsApp Templates</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Immutable Financial & System Audit Log -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Audit log — every activity from sign-in onwards (${r.length} entries)</div>
        <button type="button" class="btn btn-sm btn-outline" id="audit-csv-btn">Download full audit log (CSV)</button>
      </div>
      <p class="form-hint" style="margin:0 0 8px;">Every sign-in (including failed attempts) and sign-out, every screen opened, every record added, changed, cancelled or deleted, every bill, payment, print, file download, outside link, backup and setting change is recorded with the user and time. Entries cannot be edited or deleted in VLEBook, and each entry is linked to the one before it so changes can be detected. <span id="audit-chain"></span></p>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <input type="search" class="form-control" id="audit-q" placeholder="Search user, action, screen or text" style="flex:1 1 220px;">
        <select class="form-control" id="audit-user" style="width:160px;"><option value="">All users</option>${[...new Set(r.map(e=>e.userName).filter(Boolean))].sort().map(e=>`<option>${i(e)}</option>`).join("")}</select>
        <select class="form-control" id="audit-act" style="width:200px;"><option value="">All activities</option>${[...new Set(r.map(e=>e.action).filter(Boolean))].sort().map(e=>`<option>${i(e)}</option>`).join("")}</select>
        <input type="date" class="form-control" id="audit-date" style="width:160px;" title="Only this date">
      </div>
      <div class="form-hint" id="audit-count" style="margin:0 0 6px;"></div>
      <div class="table-wrap" style="max-height:420px; overflow-y:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Entity ID</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody id="audit-body">
            ${k.length===0?'<tr><td colspan="6" style="text-align:center; padding:14px;">No audited operations recorded yet.</td></tr>':k.map(e=>`
                  <tr>
                    <td>${i(T(e.timestamp,!0))}</td>
                    <td data-no-i18n>${i(e.userName||"—")}</td>
                    <td><span class="badge badge-info">${i(e.action)}</span></td>
                    <td>${i(e.module)}</td>
                    <td style="font-family:var(--font-mono);">${i(e.entityId)}</td>
                    <td>${i(e.summary)}</td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;let p=null;const N=async(e=!1)=>{const o=s.querySelector("#settings-profile-form");if(!o)return;const t=new FormData(o),n=t.get("language")||"en",f=n!==z(),c=await S("settings","CENTRE_CONFIG")||a,v=se({centreType:t.get("centreType")||c.centreType,address:t.get("address"),district:t.get("district"),state:t.get("state"),pinCode:t.get("pinCode"),gstin:t.get("gstin"),cscId:t.get("cscId"),akshayaId:I(t.get("centreType")||c.centreType)?t.get("akshayaId"):""}),d=s.querySelector("#settings-centre-error");d&&(d.textContent=v.error);const w=v.error?{centreType:c.centreType,address:c.address,district:c.district,state:c.state,pinCode:c.pinCode,gstin:c.gstin,cscId:c.cscId,akshayaId:c.akshayaId}:v.values,b=s.querySelector("#settings-akshaya-wrap");if(b&&(b.hidden=!I(t.get("centreType"))),await E("settings",{...c,id:"CENTRE_CONFIG",centreName:(t.get("centreName")||"").trim()||c.centreName,ownerName:(t.get("ownerName")||"").trim(),mobile:(t.get("mobile")||"").trim(),...w,centreType:w.centreType||c.centreType,invoicePrefix:(t.get("invoicePrefix")||"").trim()||"VLE",nextInvoiceNumber:Number(t.get("nextInvoiceNumber")||1001),financialYear:(t.get("financialYear")||"").trim(),language:n,backupReminderDays:Number(t.get("backupReminderDays")||3),footerNote:(t.get("footerNote")||"").trim()}),f){const{switchLanguage:y}=await import("../app.js");await y(n);return}l&&await l(),e&&await h(s,l)},u=s.querySelector("#settings-profile-form");u?.addEventListener("input",()=>{p&&clearTimeout(p),p=setTimeout(()=>N(!1),380)}),u?.addEventListener("change",()=>{p&&clearTimeout(p),N(!1)});const x=async e=>{const t={...await S("settings","CENTRE_CONFIG")};e?t.centreLogo=e:delete t.centreLogo,await E("settings",t),await ae(t),await h(s,l)};s.querySelector("#set-logo-file")?.addEventListener("change",async e=>{const o=e.target.files?.[0];if(o)try{await x(await te(o))}catch(t){const n=s.querySelector("#set-logo-msg");n&&(n.textContent=t.message)}}),s.querySelector("#set-logo-remove")?.addEventListener("click",async()=>{confirm("Remove the centre logo from the screen, invoices and PDFs?")&&await x(null)}),u?.addEventListener("submit",async e=>{e.preventDefault(),p&&clearTimeout(p),await N(!0)}),s.querySelector("#set-palette")?.addEventListener("change",e=>M({palette:e.target.value})),s.querySelector("#set-night-mode")?.addEventListener("change",e=>M({mode:e.target.value})),s.querySelector("#set-close-warning")?.addEventListener("change",e=>ee(e.target.checked));const P=async(e=!1)=>{const o=s.querySelector("#settings-security-form");if(!o)return;const t=new FormData(o),n={...g,dashboard:!0,backup:!0,settings:!0};["customers","services","billing","accounts","pending","aeps","commissions","staff","inventory","studio","cv","tools","catalogue","reports","vault"].forEach(y=>{n[y]=t.get(`mod_${y}`)==="on"});const f=await S("settings","CENTRE_CONFIG")||a,{lockPin:c,...v}=f;let d=f.lockPinHash||"";const w=String(t.get("lockPin")||"").trim(),b=s.querySelector("#pin-status-hint");if(t.get("removePin")==="on")d="";else if(w){if(!/^\d{4,6}$/.test(w)){b&&(b.textContent="PIN must be 4 to 6 digits. Not saved.");return}d=await K(w);const y=o.querySelector('[name="lockPin"]');y&&(y.value="")}await E("settings",{...v,id:"CENTRE_CONFIG",lockPinHash:d,inactivityLockMinutes:Number(t.get("inactivityLockMinutes")||0),enabledModules:n}),b&&(b.textContent=d?"PIN active (stored as a secure hash)":"No PIN set"),l&&await l(),e&&await h(s,l)},A=s.querySelector("#settings-security-form");A?.addEventListener("change",()=>P(!1)),A?.addEventListener("submit",async e=>{e.preventDefault(),await P(!0)});const q=async(e=!1)=>{const o=s.querySelector("#settings-wa-form");if(!o)return;const t=new FormData(o),n=structuredClone(m);n.en.invoice=t.get("en_invoice"),n.hi.invoice=t.get("hi_invoice"),n.ml.invoice=t.get("ml_invoice");const f=await S("settings","CENTRE_CONFIG")||a;await E("settings",{...f,id:"CENTRE_CONFIG",whatsappTemplates:n}),e&&await h(s,l)},R=s.querySelector("#settings-wa-form");R?.addEventListener("change",()=>q(!1)),R?.addEventListener("submit",async e=>{e.preventDefault(),await q(!0)}),s.querySelector("#set-load-acceptance-btn")?.addEventListener("click",async()=>{await Y(),l&&await l(),await h(s,l)});const H=[...r].sort((e,o)=>String(o.timestamp||"").localeCompare(String(e.timestamp||""))),B=e=>`<tr><td>${i(T(e.timestamp,!0))}</td><td data-no-i18n>${i(e.userName||"—")}</td><td><span class="badge badge-info">${i(e.action)}</span></td><td>${i(e.module)}</td><td style="font-family:var(--font-mono);">${i(e.entityId)}</td><td>${i(e.summary)}</td></tr>`,D=()=>{const e=(s.querySelector("#audit-q")?.value||"").trim().toLowerCase(),o=s.querySelector("#audit-user")?.value||"",t=s.querySelector("#audit-act")?.value||"",n=s.querySelector("#audit-date")?.value||"",f=H.filter(d=>(!o||d.userName===o)&&(!t||d.action===t)&&(!n||String(d.timestamp||"").slice(0,10)===n||T(d.timestamp).includes(n.split("-").reverse().join("-")))&&(!e||[d.userName,d.action,d.module,d.entityId,d.summary].join(" ").toLowerCase().includes(e))),c=s.querySelector("#audit-body");c&&(c.innerHTML=f.slice(0,300).map(B).join("")||'<tr><td colspan="6" style="text-align:center; padding:14px;">No matching entries.</td></tr>');const v=s.querySelector("#audit-count");v&&(v.textContent=`${f.length} matching entries${f.length>300?" — latest 300 shown; download the CSV for all":""}`)};["#audit-q","#audit-user","#audit-act","#audit-date"].forEach(e=>s.querySelector(e)?.addEventListener("input",D)),D(),s.querySelector("#audit-csv-btn")?.addEventListener("click",async()=>{const{auditCSV:e}=await import("../core/auditlog.js"),o=`${J(String(a.centreName||"VLEBook"))}_audit_log_${Q()}.csv`;Z(await e(),o,"text/csv")}),import("../core/auditlog.js").then(async({verifyAuditChain:e})=>{const o=await e(),t=s.querySelector("#audit-chain");t&&(t.innerHTML=o.ok?`<strong style="color:var(--color-success);">Chain check: intact</strong> (${o.chained} linked entries${o.earlier?`, ${o.earlier} earlier entries made before linking`:""}).`:`<strong style="color:var(--color-danger);">Chain check: an entry was changed or removed outside VLEBook</strong> (near entry ${i(String(o.brokenAt?.seq||""))}, ${i(T(o.brokenAt?.timestamp||"",!0))}).`)}),s.querySelector("#set-start-fresh-btn")?.addEventListener("click",()=>ie(s,l)),s.querySelector("#set-reset-db-btn")?.addEventListener("click",async()=>{confirm("Are you sure you want to clear all local business records and restore clean factory defaults? Sign-in accounts and the audit log are kept.")&&(await V(!1),await F("DATA_RESET","settings","","All business records on this computer were cleared (Reset Local Database)"),l&&await l(),await h(s,l))})}function ie(s,l){const $=C();if($&&$.role!=="OWNER")return alert("Only the Owner can start fresh.");const r=document.createElement("div");r.className="modal-backdrop start-fresh-modal",r.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;",r.innerHTML=`<form class="card" style="max-width:600px;width:100%;margin:0;" role="dialog" aria-modal="true" aria-labelledby="sf-title">
      <div class="card-header"><div class="card-title" id="sf-title">Start fresh — clear transactions</div></div>
      <p style="margin:0 0 6px;"><strong>This removes:</strong> all bills and credit notes, payments and receipts, advances, expenses and transfers, day closings, AEPS records, commissions, staff payouts and stock entries. Account opening balances and item stock become <strong>0</strong>, and invoice numbers start again from 1001.</p>
      <p style="margin:0 0 6px;"><strong>This keeps:</strong> users and operators and their passwords, staff, centre settings and logo, customers, services and prices, stock item names and prices, account names, applications, CVs, saved links and the audit log.</p>
      <label style="display:flex;gap:8px;align-items:center;margin:8px 0;"><input type="checkbox" id="sf-backup" checked style="width:auto;"> Save a full backup first (strongly recommended)</label>
      <label class="form-label" for="sf-confirm">Type <strong>START FRESH</strong> to confirm</label>
      <input id="sf-confirm" class="form-control" autocomplete="off" spellcheck="false">
      <div id="sf-err" style="color:var(--color-danger);font-size:13px;min-height:18px;margin-top:4px;"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button type="button" class="btn btn-teal" data-close>Keep my data</button>
        <button type="submit" class="btn btn-danger">Start fresh</button>
      </div></form>`;const a=()=>r.remove();r.querySelector("[data-close]").addEventListener("click",a),r.addEventListener("keydown",g=>g.key==="Escape"&&a()),r.querySelector("form").addEventListener("submit",async g=>{g.preventDefault();const m=r.querySelector("#sf-err");if(r.querySelector("#sf-confirm").value.trim().toUpperCase()!=="START FRESH"){m.textContent="Type START FRESH exactly to confirm.";return}const k=g.submitter||r.querySelector("button[type=submit]");k.disabled=!0;try{if(r.querySelector("#sf-backup").checked){m.style.color="inherit",m.textContent="Saving a backup…";const{runAutoBackup:u}=await import("../core/autobackup.js");await u({reason:"MANUAL"})}m.textContent="Clearing transactions…";const p=await G(),N=Object.values(p).reduce((u,x)=>u+x,0);await F("START_FRESH","settings","",`Started fresh: ${N} transaction records cleared (${Object.entries(p).filter(([,u])=>u).map(([u,x])=>`${u} ${x}`).join(", ")||"none"}); balances and stock set to 0. Users, customers, services and settings kept.`),a(),l&&await l(),await h(s,l),alert("Done. All transactions are cleared and balances are 0. Users, customers, services and settings are unchanged.")}catch(p){m.style.color="var(--color-danger)",m.textContent=`Could not complete: ${p.message}. Nothing was cleared if the backup failed.`,k.disabled=!1}}),document.body.appendChild(r),r.querySelector("#sf-confirm").focus()}export{W as CENTRE_TYPES,h as renderSettingsModule};
