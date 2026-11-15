import{getRecord as b,putRecord as w,getAllRecords as D,clearAllStores as M}from"../core/db.js";import{getLang as _,DEFAULT_WHATSAPP_TEMPLATES as R}from"../core/i18n.js";import{loadOptionalAcceptanceDataset as F}from"../core/sample-data.js";import{formatDate as q,esc as s,hashLockPin as O}from"../core/utils.js";import{applyAppearance as C,currentPalette as T,currentMode as L}from"../core/appearance.js";import{isCloseWarningEnabled as W,setCloseWarningEnabled as H}from"../core/closeguard.js";const G=["CSC (Common Service Centre)","Akshaya Centre (Kerala)","E-Seva Centre","Maha e-Seva Kendra (Maharashtra)","Jan Seva Kendra","Cyber Cafe & Digital Desk","Photocopy & Printing Centre","Other Digital Business"];async function m(l,i){const[S,A]=await Promise.all([b("settings","CENTRE_CONFIG"),D("audit_logs")]),t=S||{},k=t.enabledModules||{},p=t.whatsappTemplates||R,g=[...A].sort((e,o)=>String(o.timestamp||"").localeCompare(String(e.timestamp||""))).slice(0,35);l.innerHTML=`
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
        <form id="settings-profile-form" class="form-grid" style="grid-template-columns:1fr;">
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Centre Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="centreName" required value="${s(t.centreName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Centre Type</label>
              <select class="form-control" name="centreType">
                ${G.map(e=>`<option value="${s(e)}" ${t.centreType===e?"selected":""}>${s(e)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Owner / VLE Name</label>
              <input type="text" class="form-control" name="ownerName" value="${s(t.ownerName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Official Mobile Number</label>
              <input type="tel" class="form-control" name="mobile" maxlength="10" value="${s(t.mobile||"")}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Street / Market Address</label>
            <input type="text" class="form-control" name="address" value="${s(t.address||"")}">
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">District</label>
              <input type="text" class="form-control" name="district" value="${s(t.district||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" class="form-control" name="state" value="${s(t.state||"Kerala")}">
            </div>
            <div class="form-group">
              <label class="form-label">PIN Code</label>
              <input type="text" class="form-control" name="pinCode" maxlength="6" value="${s(t.pinCode||"")}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">GSTIN (Optional)</label>
              <input type="text" class="form-control" name="gstin" value="${s(t.gstin||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Invoice Prefix</label>
              <input type="text" class="form-control" name="invoicePrefix" value="${s(t.invoicePrefix||"VLE")}">
            </div>
            <div class="form-group">
              <label class="form-label">Next Invoice #</label>
              <input type="number" class="form-control" name="nextInvoiceNumber" value="${Number(t.nextInvoiceNumber||1001)}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Financial Year</label>
              <input type="text" class="form-control" name="financialYear" value="${s(t.financialYear||"2026-27")}">
            </div>
            <div class="form-group">
              <label class="form-label">Interface Language</label>
              <select class="form-control" name="language">
                <option value="en" ${t.language==="en"?"selected":""}>English</option>
                <option value="ml" ${t.language==="ml"?"selected":""}>മലയാളം (Malayalam)</option>
                <option value="hi" ${t.language==="hi"?"selected":""}>हिन्दी (Hindi)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Backup Reminder (Days)</label>
              <input type="number" min="1" max="30" class="form-control" name="backupReminderDays" value="${Number(t.backupReminderDays||3)}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Invoice Footer Note</label>
            <input type="text" class="form-control" name="footerNote" value="${s(t.footerNote||"")}">
          </div>

          <button type="submit" class="btn btn-primary">Save Centre Configuration</button>
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
                <option value="zoho" ${T()==="zoho"?"selected":""}>Zoho Books style</option>
                <option value="erpnext" ${T()==="erpnext"?"selected":""}>ERPNext style</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Night Mode</label>
              <select class="form-control" id="set-night-mode">
                <option value="light" ${L()==="light"?"selected":""}>Off (Day)</option>
                <option value="dark" ${L()==="dark"?"selected":""}>On (Night)</option>
              </select>
            </div>
          </div>
          <span class="form-hint">Applies instantly. Night mode can also be switched with the moon button at the top.</span>
          <label style="display:flex; gap:8px; align-items:center; font-size:13px; margin-top:12px;">
            <input type="checkbox" id="set-close-warning" ${W()?"checked":""}>
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
                <input type="password" inputmode="numeric" maxlength="6" autocomplete="new-password" class="form-control" name="lockPin" placeholder="${t.lockPinHash?"PIN is set — type a new PIN to change":"Leave blank for no lock"}">
                ${t.lockPinHash?'<label style="display:flex; gap:6px; align-items:center; font-size:12px; margin-top:4px;"><input type="checkbox" name="removePin"> Remove PIN lock</label>':""}
                <span class="form-hint" id="pin-status-hint">${t.lockPinHash?"PIN active (stored as a secure hash)":"No PIN set"}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Auto-Lock Inactivity (Minutes)</label>
                <input type="number" min="0" max="120" class="form-control" name="inactivityLockMinutes" value="${Number(t.inactivityLockMinutes||0)}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Enable / Disable Sidebar Modules:</label>
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; background:var(--color-surface-alt); padding:10px; border-radius:var(--radius-sm);">
                ${[["customers","Customers & 360°"],["services","Service Management"],["billing","Billing & Invoices"],["accounts","Accounts & Counter"],["pending","Pending Work"],["aeps","AEPS & Banking"],["commissions","Commissions"],["staff","Staff Commission"],["inventory","Inventory"],["studio","Document Workbench"],["tools","PDF & Image Tools"],["catalogue","Govt Catalogue"],["reports","Reports & Profit BI"],["vault","Software Vault"]].map(([e,o])=>`
                  <label style="font-size:12px; display:flex; align-items:center; gap:6px;">
                    <input type="checkbox" name="mod_${e}" ${k[e]!==!1?"checked":""}> ${o}
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
              <input type="text" class="form-control" name="en_invoice" value="${s(p.en?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Hindi Invoice Template (हिन्दी)</label>
              <input type="text" class="form-control" name="hi_invoice" value="${s(p.hi?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Malayalam Invoice Template (മലയാളം)</label>
              <input type="text" class="form-control" name="ml_invoice" value="${s(p.ml?.invoice||"")}">
            </div>
            <button type="submit" class="btn btn-sm btn-outline">Update WhatsApp Templates</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Immutable Financial & System Audit Log -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Financial & Operational Audit Trail (${g.length} recent events)</div>
      </div>
      <div class="table-wrap" style="max-height:260px; overflow-y:auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Module</th>
              <th>Entity ID</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            ${g.length===0?'<tr><td colspan="5" style="text-align:center; padding:14px;">No audited operations recorded yet.</td></tr>':g.map(e=>`
                  <tr>
                    <td>${s(q(e.timestamp,!0))}</td>
                    <td><span class="badge badge-info">${s(e.action)}</span></td>
                    <td>${s(e.module)}</td>
                    <td style="font-family:var(--font-mono);">${s(e.entityId)}</td>
                    <td>${s(e.summary)}</td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;let n=null;const y=async(e=!1)=>{const o=l.querySelector("#settings-profile-form");if(!o)return;const a=new FormData(o),r=a.get("language")||"en",c=r!==_(),u=await b("settings","CENTRE_CONFIG")||t;if(await w("settings",{...u,id:"CENTRE_CONFIG",centreName:(a.get("centreName")||"").trim()||u.centreName,centreType:a.get("centreType")||u.centreType,ownerName:(a.get("ownerName")||"").trim(),mobile:(a.get("mobile")||"").trim(),address:(a.get("address")||"").trim(),district:(a.get("district")||"").trim(),state:(a.get("state")||"").trim(),pinCode:(a.get("pinCode")||"").trim(),gstin:(a.get("gstin")||"").trim(),invoicePrefix:(a.get("invoicePrefix")||"").trim()||"VLE",nextInvoiceNumber:Number(a.get("nextInvoiceNumber")||1001),financialYear:(a.get("financialYear")||"").trim(),language:r,backupReminderDays:Number(a.get("backupReminderDays")||3),footerNote:(a.get("footerNote")||"").trim()}),c){const{switchLanguage:x}=await import("../app.js");await x(r);return}i&&await i(),e&&await m(l,i)},h=l.querySelector("#settings-profile-form");h?.addEventListener("input",()=>{n&&clearTimeout(n),n=setTimeout(()=>y(!1),380)}),h?.addEventListener("change",()=>{n&&clearTimeout(n),y(!1)}),h?.addEventListener("submit",async e=>{e.preventDefault(),n&&clearTimeout(n),await y(!0)}),l.querySelector("#set-palette")?.addEventListener("change",e=>C({palette:e.target.value})),l.querySelector("#set-night-mode")?.addEventListener("change",e=>C({mode:e.target.value})),l.querySelector("#set-close-warning")?.addEventListener("change",e=>H(e.target.checked));const E=async(e=!1)=>{const o=l.querySelector("#settings-security-form");if(!o)return;const a=new FormData(o),r={...k,dashboard:!0,backup:!0,settings:!0};["customers","services","billing","accounts","pending","aeps","commissions","staff","inventory","studio","tools","catalogue","reports","vault"].forEach(d=>{r[d]=a.get(`mod_${d}`)==="on"});const c=await b("settings","CENTRE_CONFIG")||t,{lockPin:u,...x}=c;let v=c.lockPinHash||"";const N=String(a.get("lockPin")||"").trim(),f=l.querySelector("#pin-status-hint");if(a.get("removePin")==="on")v="";else if(N){if(!/^\d{4,6}$/.test(N)){f&&(f.textContent="PIN must be 4 to 6 digits. Not saved.");return}v=await O(N);const d=o.querySelector('[name="lockPin"]');d&&(d.value="")}await w("settings",{...x,id:"CENTRE_CONFIG",lockPinHash:v,inactivityLockMinutes:Number(a.get("inactivityLockMinutes")||0),enabledModules:r}),f&&(f.textContent=v?"PIN active (stored as a secure hash)":"No PIN set"),i&&await i(),e&&await m(l,i)},P=l.querySelector("#settings-security-form");P?.addEventListener("change",()=>E(!1)),P?.addEventListener("submit",async e=>{e.preventDefault(),await E(!0)});const I=async(e=!1)=>{const o=l.querySelector("#settings-wa-form");if(!o)return;const a=new FormData(o),r=structuredClone(p);r.en.invoice=a.get("en_invoice"),r.hi.invoice=a.get("hi_invoice"),r.ml.invoice=a.get("ml_invoice");const c=await b("settings","CENTRE_CONFIG")||t;await w("settings",{...c,id:"CENTRE_CONFIG",whatsappTemplates:r}),e&&await m(l,i)},$=l.querySelector("#settings-wa-form");$?.addEventListener("change",()=>I(!1)),$?.addEventListener("submit",async e=>{e.preventDefault(),await I(!0)}),l.querySelector("#set-load-acceptance-btn")?.addEventListener("click",async()=>{await F(),i&&await i(),await m(l,i)}),l.querySelector("#set-reset-db-btn")?.addEventListener("click",async()=>{confirm("Are you sure you want to clear all local database records and restore clean factory defaults?")&&(await M(!1),i&&await i(),await m(l,i))})}export{G as CENTRE_TYPES,m as renderSettingsModule};
