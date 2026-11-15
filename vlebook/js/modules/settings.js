import{getRecord as p,putRecord as b,getAllRecords as F,clearAllStores as R}from"../core/db.js";import{getLang as _,DEFAULT_WHATSAPP_TEMPLATES as q}from"../core/i18n.js";import{loadOptionalAcceptanceDataset as O}from"../core/sample-data.js";import{formatDate as W,esc as i,hashLockPin as G}from"../core/utils.js";import{applyAppearance as S,currentPalette as T,currentMode as D}from"../core/appearance.js";import{isCloseWarningEnabled as H,setCloseWarningEnabled as B}from"../core/closeguard.js";import{processLogoFile as z,applyCentreBranding as V,isValidLogo as E}from"../core/branding.js";const Y=["CSC (Common Service Centre)","Akshaya Centre (Kerala)","E-Seva Centre","Maha e-Seva Kendra (Maharashtra)","Jan Seva Kendra","Cyber Cafe & Digital Desk","Photocopy & Printing Centre","Other Digital Business"];async function d(s,o){const[A,M]=await Promise.all([p("settings","CENTRE_CONFIG"),F("audit_logs")]),a=A||{},P=a.enabledModules||{},u=a.whatsappTemplates||q,y=[...M].sort((e,l)=>String(l.timestamp||"").localeCompare(String(e.timestamp||""))).slice(0,35);s.innerHTML=`
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
          <div class="logo-preview" id="set-logo-preview">${E(a.centreLogo)?`<img src="${a.centreLogo}" alt="Centre logo">`:"No logo"}</div>
          <div style="flex:1; min-width:200px;">
            <div style="font-weight:600;">Centre logo</div>
            <div class="form-hint">Shown at the top of the screen and on the dashboard, and printed on invoices, receipts and PDF reports. PNG, JPG or WEBP, up to 3 MB. A square or wide logo on a white or transparent background works best.</div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <label class="btn btn-sm btn-primary" style="cursor:pointer;">${E(a.centreLogo)?"Change logo":"Upload logo"}<input type="file" id="set-logo-file" accept="image/png,image/jpeg,image/webp" hidden></label>
              ${E(a.centreLogo)?'<button type="button" class="btn btn-sm btn-outline" id="set-logo-remove">Remove logo</button>':""}
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
                ${Y.map(e=>`<option value="${i(e)}" ${a.centreType===e?"selected":""}>${i(e)}</option>`).join("")}
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
            <label class="form-label">Street / Market Address</label>
            <input type="text" class="form-control" name="address" value="${i(a.address||"")}">
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
              <input type="text" class="form-control" name="gstin" value="${i(a.gstin||"")}">
            </div>
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
                <option value="light" ${D()==="light"?"selected":""}>Off (Day)</option>
                <option value="dark" ${D()==="dark"?"selected":""}>On (Night)</option>
              </select>
            </div>
          </div>
          <span class="form-hint">Applies instantly. Night mode can also be switched with the moon button at the top.</span>
          <label style="display:flex; gap:8px; align-items:center; font-size:13px; margin-top:12px;">
            <input type="checkbox" id="set-close-warning" ${H()?"checked":""}>
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
                ${[["customers","Customers & 360°"],["services","Service Management"],["billing","Billing & Invoices"],["accounts","Accounts & Counter"],["pending","Pending Work"],["aeps","AEPS & Banking"],["commissions","Commissions"],["staff","Staff Commission"],["inventory","Inventory"],["studio","Document Workbench"],["tools","PDF & Image Tools"],["catalogue","Govt Catalogue"],["reports","Reports & Profit BI"],["vault","Software Vault"]].map(([e,l])=>`
                  <label style="font-size:12px; display:flex; align-items:center; gap:6px;">
                    <input type="checkbox" name="mod_${e}" ${P[e]!==!1?"checked":""}> ${l}
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
              <input type="text" class="form-control" name="en_invoice" value="${i(u.en?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Hindi Invoice Template (हिन्दी)</label>
              <input type="text" class="form-control" name="hi_invoice" value="${i(u.hi?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Malayalam Invoice Template (മലയാളം)</label>
              <input type="text" class="form-control" name="ml_invoice" value="${i(u.ml?.invoice||"")}">
            </div>
            <button type="submit" class="btn btn-sm btn-outline">Update WhatsApp Templates</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Immutable Financial & System Audit Log -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Financial & Operational Audit Trail (${y.length} recent events)</div>
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
            ${y.length===0?'<tr><td colspan="5" style="text-align:center; padding:14px;">No audited operations recorded yet.</td></tr>':y.map(e=>`
                  <tr>
                    <td>${i(W(e.timestamp,!0))}</td>
                    <td><span class="badge badge-info">${i(e.action)}</span></td>
                    <td>${i(e.module)}</td>
                    <td style="font-family:var(--font-mono);">${i(e.entityId)}</td>
                    <td>${i(e.summary)}</td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;let n=null;const h=async(e=!1)=>{const l=s.querySelector("#settings-profile-form");if(!l)return;const t=new FormData(l),r=t.get("language")||"en",c=r!==_(),v=await p("settings","CENTRE_CONFIG")||a;if(await b("settings",{...v,id:"CENTRE_CONFIG",centreName:(t.get("centreName")||"").trim()||v.centreName,centreType:t.get("centreType")||v.centreType,ownerName:(t.get("ownerName")||"").trim(),mobile:(t.get("mobile")||"").trim(),address:(t.get("address")||"").trim(),district:(t.get("district")||"").trim(),state:(t.get("state")||"").trim(),pinCode:(t.get("pinCode")||"").trim(),gstin:(t.get("gstin")||"").trim(),invoicePrefix:(t.get("invoicePrefix")||"").trim()||"VLE",nextInvoiceNumber:Number(t.get("nextInvoiceNumber")||1001),financialYear:(t.get("financialYear")||"").trim(),language:r,backupReminderDays:Number(t.get("backupReminderDays")||3),footerNote:(t.get("footerNote")||"").trim()}),c){const{switchLanguage:x}=await import("../app.js");await x(r);return}o&&await o(),e&&await d(s,o)},w=s.querySelector("#settings-profile-form");w?.addEventListener("input",()=>{n&&clearTimeout(n),n=setTimeout(()=>h(!1),380)}),w?.addEventListener("change",()=>{n&&clearTimeout(n),h(!1)});const k=async e=>{const t={...await p("settings","CENTRE_CONFIG")};e?t.centreLogo=e:delete t.centreLogo,await b("settings",t),await V(t),await d(s,o)};s.querySelector("#set-logo-file")?.addEventListener("change",async e=>{const l=e.target.files?.[0];if(l)try{await k(await z(l))}catch(t){const r=s.querySelector("#set-logo-msg");r&&(r.textContent=t.message)}}),s.querySelector("#set-logo-remove")?.addEventListener("click",async()=>{confirm("Remove the centre logo from the screen, invoices and PDFs?")&&await k(null)}),w?.addEventListener("submit",async e=>{e.preventDefault(),n&&clearTimeout(n),await h(!0)}),s.querySelector("#set-palette")?.addEventListener("change",e=>S({palette:e.target.value})),s.querySelector("#set-night-mode")?.addEventListener("change",e=>S({mode:e.target.value})),s.querySelector("#set-close-warning")?.addEventListener("change",e=>B(e.target.checked));const L=async(e=!1)=>{const l=s.querySelector("#settings-security-form");if(!l)return;const t=new FormData(l),r={...P,dashboard:!0,backup:!0,settings:!0};["customers","services","billing","accounts","pending","aeps","commissions","staff","inventory","studio","tools","catalogue","reports","vault"].forEach(m=>{r[m]=t.get(`mod_${m}`)==="on"});const c=await p("settings","CENTRE_CONFIG")||a,{lockPin:v,...x}=c;let g=c.lockPinHash||"";const N=String(t.get("lockPin")||"").trim(),f=s.querySelector("#pin-status-hint");if(t.get("removePin")==="on")g="";else if(N){if(!/^\d{4,6}$/.test(N)){f&&(f.textContent="PIN must be 4 to 6 digits. Not saved.");return}g=await G(N);const m=l.querySelector('[name="lockPin"]');m&&(m.value="")}await b("settings",{...x,id:"CENTRE_CONFIG",lockPinHash:g,inactivityLockMinutes:Number(t.get("inactivityLockMinutes")||0),enabledModules:r}),f&&(f.textContent=g?"PIN active (stored as a secure hash)":"No PIN set"),o&&await o(),e&&await d(s,o)},C=s.querySelector("#settings-security-form");C?.addEventListener("change",()=>L(!1)),C?.addEventListener("submit",async e=>{e.preventDefault(),await L(!0)});const $=async(e=!1)=>{const l=s.querySelector("#settings-wa-form");if(!l)return;const t=new FormData(l),r=structuredClone(u);r.en.invoice=t.get("en_invoice"),r.hi.invoice=t.get("hi_invoice"),r.ml.invoice=t.get("ml_invoice");const c=await p("settings","CENTRE_CONFIG")||a;await b("settings",{...c,id:"CENTRE_CONFIG",whatsappTemplates:r}),e&&await d(s,o)},I=s.querySelector("#settings-wa-form");I?.addEventListener("change",()=>$(!1)),I?.addEventListener("submit",async e=>{e.preventDefault(),await $(!0)}),s.querySelector("#set-load-acceptance-btn")?.addEventListener("click",async()=>{await O(),o&&await o(),await d(s,o)}),s.querySelector("#set-reset-db-btn")?.addEventListener("click",async()=>{confirm("Are you sure you want to clear all local database records and restore clean factory defaults?")&&(await R(!1),o&&await o(),await d(s,o))})}export{Y as CENTRE_TYPES,d as renderSettingsModule};
