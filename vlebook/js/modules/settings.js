import{getRecord as b,putRecord as h,getAllRecords as q,clearAllStores as _}from"../core/db.js";import{getLang as O,DEFAULT_WHATSAPP_TEMPLATES as W}from"../core/i18n.js";import{loadOptionalAcceptanceDataset as G}from"../core/sample-data.js";import{formatDate as H,esc as l,hashLockPin as B}from"../core/utils.js";import{applyAppearance as S,currentPalette as A,currentMode as D}from"../core/appearance.js";import{isCloseWarningEnabled as z,setCloseWarningEnabled as V}from"../core/closeguard.js";import{processLogoFile as Y,applyCentreBranding as j,isValidLogo as k}from"../core/branding.js";import{CENTRE_TYPES as F,isAkshaya as I,checkCentreDetails as U}from"../core/centreinfo.js";async function g(s,o){const[M,R]=await Promise.all([b("settings","CENTRE_CONFIG"),q("audit_logs")]),a=M||{},E=a.enabledModules||{},y=a.whatsappTemplates||W,x=[...R].sort((e,i)=>String(i.timestamp||"").localeCompare(String(e.timestamp||""))).slice(0,35);s.innerHTML=`
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
          <div class="logo-preview" id="set-logo-preview">${k(a.centreLogo)?`<img src="${a.centreLogo}" alt="Centre logo">`:"No logo"}</div>
          <div style="flex:1; min-width:200px;">
            <div style="font-weight:600;">Centre logo</div>
            <div class="form-hint">Shown at the top of the screen and on the dashboard, and printed on invoices, receipts and PDF reports. PNG, JPG or WEBP, up to 3 MB. A square or wide logo on a white or transparent background works best.</div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <label class="btn btn-sm btn-primary" style="cursor:pointer;">${k(a.centreLogo)?"Change logo":"Upload logo"}<input type="file" id="set-logo-file" accept="image/png,image/jpeg,image/webp" hidden></label>
              ${k(a.centreLogo)?'<button type="button" class="btn btn-sm btn-outline" id="set-logo-remove">Remove logo</button>':""}
            </div>
            <div class="auth-error" id="set-logo-msg"></div>
          </div>
        </div>
        <form id="settings-profile-form" class="form-grid" style="grid-template-columns:1fr;">
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Centre Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="centreName" required value="${l(a.centreName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Centre Type</label>
              <select class="form-control" name="centreType">
                ${F.map(e=>`<option value="${l(e)}" ${a.centreType===e?"selected":""}>${l(e)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Owner / VLE Name</label>
              <input type="text" class="form-control" name="ownerName" value="${l(a.ownerName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Official Mobile Number</label>
              <input type="tel" class="form-control" name="mobile" maxlength="10" value="${l(a.mobile||"")}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Address (building, street, place)</label>
            <textarea class="form-control" name="address" rows="2">${l(a.address||"")}</textarea>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">District</label>
              <input type="text" class="form-control" name="district" value="${l(a.district||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" class="form-control" name="state" value="${l(a.state||"Kerala")}">
            </div>
            <div class="form-group">
              <label class="form-label">PIN Code</label>
              <input type="text" class="form-control" name="pinCode" maxlength="6" value="${l(a.pinCode||"")}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">GSTIN (Optional)</label>
              <input type="text" class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${l(a.gstin||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">CSC ID (Optional)</label>
              <input type="text" class="form-control" name="cscId" maxlength="30" value="${l(a.cscId||"")}">
            </div>
            <div class="form-group" id="settings-akshaya-wrap" ${I(a.centreType)?"":"hidden"}>
              <label class="form-label">Akshaya Centre ID</label>
              <input type="text" class="form-control" name="akshayaId" maxlength="30" value="${l(a.akshayaId||"")}">
            </div>
          </div>
          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Invoice Prefix</label>
              <input type="text" class="form-control" name="invoicePrefix" value="${l(a.invoicePrefix||"VLE")}">
            </div>
            <div class="form-group">
              <label class="form-label">Next Invoice #</label>
              <input type="number" class="form-control" name="nextInvoiceNumber" value="${Number(a.nextInvoiceNumber||1001)}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Financial Year</label>
              <input type="text" class="form-control" name="financialYear" value="${l(a.financialYear||"2026-27")}">
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
            <input type="text" class="form-control" name="footerNote" value="${l(a.footerNote||"")}">
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
                <option value="zoho" ${A()==="zoho"?"selected":""}>Zoho Books style</option>
                <option value="erpnext" ${A()==="erpnext"?"selected":""}>ERPNext style</option>
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
            <input type="checkbox" id="set-close-warning" ${z()?"checked":""}>
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
                ${[["customers","Customers & 360°"],["services","Service Management"],["billing","Billing & Invoices"],["accounts","Accounts & Counter"],["pending","Pending Work"],["aeps","AEPS & Banking"],["commissions","Commissions"],["staff","Staff Commission"],["inventory","Inventory"],["studio","Document Workbench"],["tools","PDF & Image Tools"],["catalogue","Govt Catalogue"],["reports","Reports & Profit BI"],["vault","Software Vault"]].map(([e,i])=>`
                  <label style="font-size:12px; display:flex; align-items:center; gap:6px;">
                    <input type="checkbox" name="mod_${e}" ${E[e]!==!1?"checked":""}> ${i}
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
              <input type="text" class="form-control" name="en_invoice" value="${l(y.en?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Hindi Invoice Template (हिन्दी)</label>
              <input type="text" class="form-control" name="hi_invoice" value="${l(y.hi?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Malayalam Invoice Template (മലയാളം)</label>
              <input type="text" class="form-control" name="ml_invoice" value="${l(y.ml?.invoice||"")}">
            </div>
            <button type="submit" class="btn btn-sm btn-outline">Update WhatsApp Templates</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Immutable Financial & System Audit Log -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Financial & Operational Audit Trail (${x.length} recent events)</div>
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
            ${x.length===0?'<tr><td colspan="5" style="text-align:center; padding:14px;">No audited operations recorded yet.</td></tr>':x.map(e=>`
                  <tr>
                    <td>${l(H(e.timestamp,!0))}</td>
                    <td><span class="badge badge-info">${l(e.action)}</span></td>
                    <td>${l(e.module)}</td>
                    <td style="font-family:var(--font-mono);">${l(e.entityId)}</td>
                    <td>${l(e.summary)}</td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;let c=null;const w=async(e=!1)=>{const i=s.querySelector("#settings-profile-form");if(!i)return;const t=new FormData(i),r=t.get("language")||"en",u=r!==O(),n=await b("settings","CENTRE_CONFIG")||a,f=U({centreType:t.get("centreType")||n.centreType,address:t.get("address"),district:t.get("district"),state:t.get("state"),pinCode:t.get("pinCode"),gstin:t.get("gstin"),cscId:t.get("cscId"),akshayaId:I(t.get("centreType")||n.centreType)?t.get("akshayaId"):""}),d=s.querySelector("#settings-centre-error");d&&(d.textContent=f.error);const v=f.error?{centreType:n.centreType,address:n.address,district:n.district,state:n.state,pinCode:n.pinCode,gstin:n.gstin,cscId:n.cscId,akshayaId:n.akshayaId}:f.values,m=s.querySelector("#settings-akshaya-wrap");if(m&&(m.hidden=!I(t.get("centreType"))),await h("settings",{...n,id:"CENTRE_CONFIG",centreName:(t.get("centreName")||"").trim()||n.centreName,ownerName:(t.get("ownerName")||"").trim(),mobile:(t.get("mobile")||"").trim(),...v,centreType:v.centreType||n.centreType,invoicePrefix:(t.get("invoicePrefix")||"").trim()||"VLE",nextInvoiceNumber:Number(t.get("nextInvoiceNumber")||1001),financialYear:(t.get("financialYear")||"").trim(),language:r,backupReminderDays:Number(t.get("backupReminderDays")||3),footerNote:(t.get("footerNote")||"").trim()}),u){const{switchLanguage:p}=await import("../app.js");await p(r);return}o&&await o(),e&&await g(s,o)},N=s.querySelector("#settings-profile-form");N?.addEventListener("input",()=>{c&&clearTimeout(c),c=setTimeout(()=>w(!1),380)}),N?.addEventListener("change",()=>{c&&clearTimeout(c),w(!1)});const P=async e=>{const t={...await b("settings","CENTRE_CONFIG")};e?t.centreLogo=e:delete t.centreLogo,await h("settings",t),await j(t),await g(s,o)};s.querySelector("#set-logo-file")?.addEventListener("change",async e=>{const i=e.target.files?.[0];if(i)try{await P(await Y(i))}catch(t){const r=s.querySelector("#set-logo-msg");r&&(r.textContent=t.message)}}),s.querySelector("#set-logo-remove")?.addEventListener("click",async()=>{confirm("Remove the centre logo from the screen, invoices and PDFs?")&&await P(null)}),N?.addEventListener("submit",async e=>{e.preventDefault(),c&&clearTimeout(c),await w(!0)}),s.querySelector("#set-palette")?.addEventListener("change",e=>S({palette:e.target.value})),s.querySelector("#set-night-mode")?.addEventListener("change",e=>S({mode:e.target.value})),s.querySelector("#set-close-warning")?.addEventListener("change",e=>V(e.target.checked));const $=async(e=!1)=>{const i=s.querySelector("#settings-security-form");if(!i)return;const t=new FormData(i),r={...E,dashboard:!0,backup:!0,settings:!0};["customers","services","billing","accounts","pending","aeps","commissions","staff","inventory","studio","tools","catalogue","reports","vault"].forEach(p=>{r[p]=t.get(`mod_${p}`)==="on"});const u=await b("settings","CENTRE_CONFIG")||a,{lockPin:n,...f}=u;let d=u.lockPinHash||"";const v=String(t.get("lockPin")||"").trim(),m=s.querySelector("#pin-status-hint");if(t.get("removePin")==="on")d="";else if(v){if(!/^\d{4,6}$/.test(v)){m&&(m.textContent="PIN must be 4 to 6 digits. Not saved.");return}d=await B(v);const p=i.querySelector('[name="lockPin"]');p&&(p.value="")}await h("settings",{...f,id:"CENTRE_CONFIG",lockPinHash:d,inactivityLockMinutes:Number(t.get("inactivityLockMinutes")||0),enabledModules:r}),m&&(m.textContent=d?"PIN active (stored as a secure hash)":"No PIN set"),o&&await o(),e&&await g(s,o)},L=s.querySelector("#settings-security-form");L?.addEventListener("change",()=>$(!1)),L?.addEventListener("submit",async e=>{e.preventDefault(),await $(!0)});const T=async(e=!1)=>{const i=s.querySelector("#settings-wa-form");if(!i)return;const t=new FormData(i),r=structuredClone(y);r.en.invoice=t.get("en_invoice"),r.hi.invoice=t.get("hi_invoice"),r.ml.invoice=t.get("ml_invoice");const u=await b("settings","CENTRE_CONFIG")||a;await h("settings",{...u,id:"CENTRE_CONFIG",whatsappTemplates:r}),e&&await g(s,o)},C=s.querySelector("#settings-wa-form");C?.addEventListener("change",()=>T(!1)),C?.addEventListener("submit",async e=>{e.preventDefault(),await T(!0)}),s.querySelector("#set-load-acceptance-btn")?.addEventListener("click",async()=>{await G(),o&&await o(),await g(s,o)}),s.querySelector("#set-reset-db-btn")?.addEventListener("click",async()=>{confirm("Are you sure you want to clear all local database records and restore clean factory defaults?")&&(await _(!1),o&&await o(),await g(s,o))})}export{F as CENTRE_TYPES,g as renderSettingsModule};
