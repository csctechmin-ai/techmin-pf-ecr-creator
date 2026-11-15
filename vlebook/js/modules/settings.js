import{getRecord as y,putRecord as w,getAllRecords as B,clearAllStores as V,logAudit as G}from"../core/db.js";import{getLang as H,DEFAULT_WHATSAPP_TEMPLATES as j}from"../core/i18n.js";import{loadOptionalAcceptanceDataset as z}from"../core/sample-data.js";import{formatDate as x,esc as s,hashLockPin as Y,safeFileName as U,downloadFile as J}from"../core/utils.js";import{applyAppearance as D,currentPalette as R,currentMode as M}from"../core/appearance.js";import{isCloseWarningEnabled as K,setCloseWarningEnabled as Z}from"../core/closeguard.js";import{processLogoFile as Q,applyCentreBranding as X,isValidLogo as $}from"../core/branding.js";import{CENTRE_TYPES as _,isAkshaya as E,checkCentreDetails as ee}from"../core/centreinfo.js";async function f(i,c){const[F,b]=await Promise.all([y("settings","CENTRE_CONFIG"),B("audit_logs")]),a=F||{},I=a.enabledModules||{},h=a.whatsappTemplates||j,S=[...b].sort((e,o)=>String(o.timestamp||"").localeCompare(String(e.timestamp||""))).slice(0,200);i.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Settings, Centre Setup Wizard & Security</h1>
        <p>Configure your centre identity, invoice numbering, languages, WhatsApp templates, module visibility & PIN lock</p>
      </div>
      <div class="module-actions">
        <button class="btn btn-gold" id="set-load-acceptance-btn">Load Optional Acceptance Test Dataset</button>
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
          <div class="logo-preview" id="set-logo-preview">${$(a.centreLogo)?`<img src="${a.centreLogo}" alt="Centre logo">`:"No logo"}</div>
          <div style="flex:1; min-width:200px;">
            <div style="font-weight:600;">Centre logo</div>
            <div class="form-hint">Shown at the top of the screen and on the dashboard, and printed on invoices, receipts and PDF reports. PNG, JPG or WEBP, up to 3 MB. A square or wide logo on a white or transparent background works best.</div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <label class="btn btn-sm btn-primary" style="cursor:pointer;">${$(a.centreLogo)?"Change logo":"Upload logo"}<input type="file" id="set-logo-file" accept="image/png,image/jpeg,image/webp" hidden></label>
              ${$(a.centreLogo)?'<button type="button" class="btn btn-sm btn-outline" id="set-logo-remove">Remove logo</button>':""}
            </div>
            <div class="auth-error" id="set-logo-msg"></div>
          </div>
        </div>
        <form id="settings-profile-form" class="form-grid" style="grid-template-columns:1fr;">
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Centre Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="centreName" required value="${s(a.centreName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Centre Type</label>
              <select class="form-control" name="centreType">
                ${_.map(e=>`<option value="${s(e)}" ${a.centreType===e?"selected":""}>${s(e)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Owner / VLE Name</label>
              <input type="text" class="form-control" name="ownerName" value="${s(a.ownerName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Official Mobile Number</label>
              <input type="tel" class="form-control" name="mobile" maxlength="10" value="${s(a.mobile||"")}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Address (building, street, place)</label>
            <textarea class="form-control" name="address" rows="2">${s(a.address||"")}</textarea>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">District</label>
              <input type="text" class="form-control" name="district" value="${s(a.district||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" class="form-control" name="state" value="${s(a.state||"Kerala")}">
            </div>
            <div class="form-group">
              <label class="form-label">PIN Code</label>
              <input type="text" class="form-control" name="pinCode" maxlength="6" value="${s(a.pinCode||"")}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">GSTIN (Optional)</label>
              <input type="text" class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${s(a.gstin||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">CSC ID (Optional)</label>
              <input type="text" class="form-control" name="cscId" maxlength="30" value="${s(a.cscId||"")}">
            </div>
            <div class="form-group" id="settings-akshaya-wrap" ${E(a.centreType)?"":"hidden"}>
              <label class="form-label">Akshaya Centre ID</label>
              <input type="text" class="form-control" name="akshayaId" maxlength="30" value="${s(a.akshayaId||"")}">
            </div>
          </div>
          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Invoice Prefix</label>
              <input type="text" class="form-control" name="invoicePrefix" value="${s(a.invoicePrefix||"VLE")}">
            </div>
            <div class="form-group">
              <label class="form-label">Next Invoice #</label>
              <input type="number" class="form-control" name="nextInvoiceNumber" value="${Number(a.nextInvoiceNumber||1001)}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Financial Year</label>
              <input type="text" class="form-control" name="financialYear" value="${s(a.financialYear||"2026-27")}">
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
            <input type="text" class="form-control" name="footerNote" value="${s(a.footerNote||"")}">
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
                <option value="zoho" ${R()==="zoho"?"selected":""}>Zoho Books style</option>
                <option value="erpnext" ${R()==="erpnext"?"selected":""}>ERPNext style</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Night Mode</label>
              <select class="form-control" id="set-night-mode">
                <option value="light" ${M()==="light"?"selected":""}>Off (Day)</option>
                <option value="dark" ${M()==="dark"?"selected":""}>On (Night)</option>
              </select>
            </div>
          </div>
          <span class="form-hint">Applies instantly. Night mode can also be switched with the moon button at the top.</span>
          <label style="display:flex; gap:8px; align-items:center; font-size:13px; margin-top:12px;">
            <input type="checkbox" id="set-close-warning" ${K()?"checked":""}>
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
                    <input type="checkbox" name="mod_${e}" ${I[e]!==!1?"checked":""}> ${o}
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
              <input type="text" class="form-control" name="en_invoice" value="${s(h.en?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Hindi Invoice Template (हिन्दी)</label>
              <input type="text" class="form-control" name="hi_invoice" value="${s(h.hi?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Malayalam Invoice Template (മലയാളം)</label>
              <input type="text" class="form-control" name="ml_invoice" value="${s(h.ml?.invoice||"")}">
            </div>
            <button type="submit" class="btn btn-sm btn-outline">Update WhatsApp Templates</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Immutable Financial & System Audit Log -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Audit log — every activity from sign-in onwards (${b.length} entries)</div>
        <button type="button" class="btn btn-sm btn-outline" id="audit-csv-btn">Download full audit log (CSV)</button>
      </div>
      <p class="form-hint" style="margin:0 0 8px;">Every sign-in (including failed attempts) and sign-out, every screen opened, every record added, changed, cancelled or deleted, every bill, payment, print, file download, outside link, backup and setting change is recorded with the user and time. Entries cannot be edited or deleted in VLEBook, and each entry is linked to the one before it so changes can be detected. <span id="audit-chain"></span></p>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <input type="search" class="form-control" id="audit-q" placeholder="Search user, action, screen or text" style="flex:1 1 220px;">
        <select class="form-control" id="audit-user" style="width:160px;"><option value="">All users</option>${[...new Set(b.map(e=>e.userName).filter(Boolean))].sort().map(e=>`<option>${s(e)}</option>`).join("")}</select>
        <select class="form-control" id="audit-act" style="width:200px;"><option value="">All activities</option>${[...new Set(b.map(e=>e.action).filter(Boolean))].sort().map(e=>`<option>${s(e)}</option>`).join("")}</select>
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
            ${S.length===0?'<tr><td colspan="6" style="text-align:center; padding:14px;">No audited operations recorded yet.</td></tr>':S.map(e=>`
                  <tr>
                    <td>${s(x(e.timestamp,!0))}</td>
                    <td data-no-i18n>${s(e.userName||"—")}</td>
                    <td><span class="badge badge-info">${s(e.action)}</span></td>
                    <td>${s(e.module)}</td>
                    <td style="font-family:var(--font-mono);">${s(e.entityId)}</td>
                    <td>${s(e.summary)}</td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;let p=null;const k=async(e=!1)=>{const o=i.querySelector("#settings-profile-form");if(!o)return;const t=new FormData(o),l=t.get("language")||"en",d=l!==H(),r=await y("settings","CENTRE_CONFIG")||a,m=ee({centreType:t.get("centreType")||r.centreType,address:t.get("address"),district:t.get("district"),state:t.get("state"),pinCode:t.get("pinCode"),gstin:t.get("gstin"),cscId:t.get("cscId"),akshayaId:E(t.get("centreType")||r.centreType)?t.get("akshayaId"):""}),n=i.querySelector("#settings-centre-error");n&&(n.textContent=m.error);const g=m.error?{centreType:r.centreType,address:r.address,district:r.district,state:r.state,pinCode:r.pinCode,gstin:r.gstin,cscId:r.cscId,akshayaId:r.akshayaId}:m.values,u=i.querySelector("#settings-akshaya-wrap");if(u&&(u.hidden=!E(t.get("centreType"))),await w("settings",{...r,id:"CENTRE_CONFIG",centreName:(t.get("centreName")||"").trim()||r.centreName,ownerName:(t.get("ownerName")||"").trim(),mobile:(t.get("mobile")||"").trim(),...g,centreType:g.centreType||r.centreType,invoicePrefix:(t.get("invoicePrefix")||"").trim()||"VLE",nextInvoiceNumber:Number(t.get("nextInvoiceNumber")||1001),financialYear:(t.get("financialYear")||"").trim(),language:l,backupReminderDays:Number(t.get("backupReminderDays")||3),footerNote:(t.get("footerNote")||"").trim()}),d){const{switchLanguage:v}=await import("../app.js");await v(l);return}c&&await c(),e&&await f(i,c)},N=i.querySelector("#settings-profile-form");N?.addEventListener("input",()=>{p&&clearTimeout(p),p=setTimeout(()=>k(!1),380)}),N?.addEventListener("change",()=>{p&&clearTimeout(p),k(!1)});const L=async e=>{const t={...await y("settings","CENTRE_CONFIG")};e?t.centreLogo=e:delete t.centreLogo,await w("settings",t),await X(t),await f(i,c)};i.querySelector("#set-logo-file")?.addEventListener("change",async e=>{const o=e.target.files?.[0];if(o)try{await L(await Q(o))}catch(t){const l=i.querySelector("#set-logo-msg");l&&(l.textContent=t.message)}}),i.querySelector("#set-logo-remove")?.addEventListener("click",async()=>{confirm("Remove the centre logo from the screen, invoices and PDFs?")&&await L(null)}),N?.addEventListener("submit",async e=>{e.preventDefault(),p&&clearTimeout(p),await k(!0)}),i.querySelector("#set-palette")?.addEventListener("change",e=>D({palette:e.target.value})),i.querySelector("#set-night-mode")?.addEventListener("change",e=>D({mode:e.target.value})),i.querySelector("#set-close-warning")?.addEventListener("change",e=>Z(e.target.checked));const C=async(e=!1)=>{const o=i.querySelector("#settings-security-form");if(!o)return;const t=new FormData(o),l={...I,dashboard:!0,backup:!0,settings:!0};["customers","services","billing","accounts","pending","aeps","commissions","staff","inventory","studio","cv","tools","catalogue","reports","vault"].forEach(v=>{l[v]=t.get(`mod_${v}`)==="on"});const d=await y("settings","CENTRE_CONFIG")||a,{lockPin:r,...m}=d;let n=d.lockPinHash||"";const g=String(t.get("lockPin")||"").trim(),u=i.querySelector("#pin-status-hint");if(t.get("removePin")==="on")n="";else if(g){if(!/^\d{4,6}$/.test(g)){u&&(u.textContent="PIN must be 4 to 6 digits. Not saved.");return}n=await Y(g);const v=o.querySelector('[name="lockPin"]');v&&(v.value="")}await w("settings",{...m,id:"CENTRE_CONFIG",lockPinHash:n,inactivityLockMinutes:Number(t.get("inactivityLockMinutes")||0),enabledModules:l}),u&&(u.textContent=n?"PIN active (stored as a secure hash)":"No PIN set"),c&&await c(),e&&await f(i,c)},T=i.querySelector("#settings-security-form");T?.addEventListener("change",()=>C(!1)),T?.addEventListener("submit",async e=>{e.preventDefault(),await C(!0)});const P=async(e=!1)=>{const o=i.querySelector("#settings-wa-form");if(!o)return;const t=new FormData(o),l=structuredClone(h);l.en.invoice=t.get("en_invoice"),l.hi.invoice=t.get("hi_invoice"),l.ml.invoice=t.get("ml_invoice");const d=await y("settings","CENTRE_CONFIG")||a;await w("settings",{...d,id:"CENTRE_CONFIG",whatsappTemplates:l}),e&&await f(i,c)},A=i.querySelector("#settings-wa-form");A?.addEventListener("change",()=>P(!1)),A?.addEventListener("submit",async e=>{e.preventDefault(),await P(!0)}),i.querySelector("#set-load-acceptance-btn")?.addEventListener("click",async()=>{await z(),c&&await c(),await f(i,c)});const O=[...b].sort((e,o)=>String(o.timestamp||"").localeCompare(String(e.timestamp||""))),W=e=>`<tr><td>${s(x(e.timestamp,!0))}</td><td data-no-i18n>${s(e.userName||"—")}</td><td><span class="badge badge-info">${s(e.action)}</span></td><td>${s(e.module)}</td><td style="font-family:var(--font-mono);">${s(e.entityId)}</td><td>${s(e.summary)}</td></tr>`,q=()=>{const e=(i.querySelector("#audit-q")?.value||"").trim().toLowerCase(),o=i.querySelector("#audit-user")?.value||"",t=i.querySelector("#audit-act")?.value||"",l=i.querySelector("#audit-date")?.value||"",d=O.filter(n=>(!o||n.userName===o)&&(!t||n.action===t)&&(!l||String(n.timestamp||"").slice(0,10)===l||x(n.timestamp).includes(l.split("-").reverse().join("-")))&&(!e||[n.userName,n.action,n.module,n.entityId,n.summary].join(" ").toLowerCase().includes(e))),r=i.querySelector("#audit-body");r&&(r.innerHTML=d.slice(0,300).map(W).join("")||'<tr><td colspan="6" style="text-align:center; padding:14px;">No matching entries.</td></tr>');const m=i.querySelector("#audit-count");m&&(m.textContent=`${d.length} matching entries${d.length>300?" — latest 300 shown; download the CSV for all":""}`)};["#audit-q","#audit-user","#audit-act","#audit-date"].forEach(e=>i.querySelector(e)?.addEventListener("input",q)),q(),i.querySelector("#audit-csv-btn")?.addEventListener("click",async()=>{const{auditCSV:e}=await import("../core/auditlog.js"),o=`${U(String(a.centreName||"VLEBook"))}_audit_log_${new Date().toISOString().slice(0,10)}.csv`;J(await e(),o,"text/csv")}),import("../core/auditlog.js").then(async({verifyAuditChain:e})=>{const o=await e(),t=i.querySelector("#audit-chain");t&&(t.innerHTML=o.ok?`<strong style="color:var(--color-success);">Chain check: intact</strong> (${o.chained} linked entries${o.earlier?`, ${o.earlier} earlier entries made before linking`:""}).`:`<strong style="color:var(--color-danger);">Chain check: an entry was changed or removed outside VLEBook</strong> (near entry ${s(String(o.brokenAt?.seq||""))}, ${s(x(o.brokenAt?.timestamp||"",!0))}).`)}),i.querySelector("#set-reset-db-btn")?.addEventListener("click",async()=>{confirm("Are you sure you want to clear all local business records and restore clean factory defaults? Sign-in accounts and the audit log are kept.")&&(await V(!1),await G("DATA_RESET","settings","","All business records on this computer were cleared (Reset Local Database)"),c&&await c(),await f(i,c))})}export{_ as CENTRE_TYPES,f as renderSettingsModule};
