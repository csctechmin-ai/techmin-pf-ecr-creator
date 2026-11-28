import{validUpiId as Y}from"../core/upi.js";import{getRecord as w,putRecord as S,getAllRecords as K,clearAllStores as J,logAudit as C,startFreshClearTransactions as Q}from"../core/db.js";import{getCurrentUser as L}from"../core/auth.js";import{getLang as Z,DEFAULT_WHATSAPP_TEMPLATES as X}from"../core/i18n.js";import{loadOptionalAcceptanceDataset as ee}from"../core/sample-data.js";import{formatDate as $,esc as o,hashLockPin as te,safeFileName as ae,downloadFile as se,todayISO as ie}from"../core/utils.js";import{applyAppearance as G,currentPalette as B,currentMode as U}from"../core/appearance.js";import{isCloseWarningEnabled as oe,setCloseWarningEnabled as re}from"../core/closeguard.js";import{processLogoFile as ne,processSignatureFile as le,applyCentreBranding as ce,isValidLogo as N}from"../core/branding.js";import{CENTRE_TYPES as W,isAkshaya as P,checkCentreDetails as de}from"../core/centreinfo.js";async function y(s,l){const[T,c]=await Promise.all([w("settings","CENTRE_CONFIG"),K("audit_logs")]),t=T||{},b=t.enabledModules||{},u=t.whatsappTemplates||X,E=[...c].sort((e,i)=>String(i.timestamp||"").localeCompare(String(e.timestamp||""))).slice(0,200);s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Settings, Centre Setup Wizard & Security</h1>
        <p>Configure your centre identity, invoice numbering, languages, WhatsApp templates, module visibility & PIN lock</p>
      </div>
      <div class="module-actions">
        <button class="btn btn-gold" id="set-load-acceptance-btn">Load Optional Acceptance Test Dataset</button>
        ${L()?.role==="OWNER"||!L()?'<button class="btn btn-warning" id="set-start-fresh-btn" title="Clear all bills, payments and amounts; keep users, customers, services and settings">Start fresh (clear transactions)</button>':""}
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
          <div class="logo-preview" id="set-logo-preview">${N(t.centreLogo)?`<img src="${t.centreLogo}" alt="Centre logo">`:"No logo"}</div>
          <div style="flex:1; min-width:200px;">
            <div style="font-weight:600;">Centre logo</div>
            <div class="form-hint">Shown at the top of the screen and on the dashboard, and printed on invoices, receipts and PDF reports. PNG, JPG or WEBP, up to 3 MB. A square or wide logo on a white or transparent background works best.</div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <label class="btn btn-sm btn-primary" style="cursor:pointer;">${N(t.centreLogo)?"Change logo":"Upload logo"}<input type="file" id="set-logo-file" accept="image/png,image/jpeg,image/webp" hidden></label>
              ${N(t.centreLogo)?'<button type="button" class="btn btn-sm btn-outline" id="set-logo-remove">Remove logo</button>':""}
            </div>
            <div class="auth-error" id="set-logo-msg"></div>
          </div>
        </div>
        <div class="logo-setting">
          <div class="logo-preview sign-preview" id="set-sign-preview" style="background:#fff;">${N(t.signatureImage)?`<img src="${t.signatureImage}" alt="Authorised signatory's signature">`:"No signature"}</div>
          <div style="flex:1; min-width:200px;">
            <div style="font-weight:600;">Authorised signatory's signature</div>
            <div class="form-hint">Printed above "Authorised Signatory" on every A4 invoice, its PDF and the thermal receipt. Sign in dark ink on white paper and upload a clear photo or scan (PNG, JPG or WEBP, up to 3 MB): VLE360 removes the paper background and fits the signature automatically. It stays on this computer and in your backups only.</div>
            <div class="form-group" style="margin-top:8px; max-width:320px;"><label class="form-label" for="set-sign-name">Signatory name and designation (optional)</label><input type="text" class="form-control" id="set-sign-name" maxlength="60" placeholder="e.g. Vinod N K, Proprietor" value="${o(t.signatoryName||"")}"></div>
            <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
              <label class="btn btn-sm btn-primary" style="cursor:pointer;">${N(t.signatureImage)?"Change signature":"Upload signature"}<input type="file" id="set-sign-file" accept="image/png,image/jpeg,image/webp" hidden></label>
              ${N(t.signatureImage)?'<button type="button" class="btn btn-sm btn-outline" id="set-sign-remove">Remove signature</button>':""}
            </div>
            <div class="auth-error" id="set-sign-msg"></div>
          </div>
        </div>
        <form id="settings-profile-form" class="form-grid" style="grid-template-columns:1fr;">
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Centre Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="centreName" required value="${o(t.centreName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Centre Type</label>
              <select class="form-control" name="centreType">
                ${W.map(e=>`<option value="${o(e)}" ${t.centreType===e?"selected":""}>${o(e)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Owner / VLE Name</label>
              <input type="text" class="form-control" name="ownerName" value="${o(t.ownerName||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Official Mobile Number</label>
              <input type="tel" class="form-control" name="mobile" maxlength="10" value="${o(t.mobile||"")}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Address (building, street, place)</label>
            <textarea class="form-control" name="address" rows="2">${o(t.address||"")}</textarea>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">District</label>
              <input type="text" class="form-control" name="district" value="${o(t.district||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" class="form-control" name="state" value="${o(t.state||"Kerala")}">
            </div>
            <div class="form-group">
              <label class="form-label">PIN Code</label>
              <input type="text" class="form-control" name="pinCode" maxlength="6" value="${o(t.pinCode||"")}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">GSTIN (Optional)</label>
              <input type="text" class="form-control" name="gstin" maxlength="15" style="text-transform:uppercase" value="${o(t.gstin||"")}">
              <div class="form-hint">${t.gstin?`${t.gstRegistrationType==="COMPOSITION"?"Composition — Bill of Supply":"Regular — Tax Invoice"}. `:"No GSTIN: non-GST bills only. "}Registration type, rates and returns: Books &amp; GST → GST.</div>
            </div>
            <div class="form-group">
              <label class="form-label">CSC ID (Optional)</label>
              <input type="text" class="form-control" name="cscId" maxlength="30" value="${o(t.cscId||"")}">
            </div>
            <div class="form-group" id="settings-akshaya-wrap" ${P(t.centreType)?"":"hidden"}>
              <label class="form-label">Akshaya Centre ID</label>
              <input type="text" class="form-control" name="akshayaId" maxlength="30" value="${o(t.akshayaId||"")}">
            </div>
          </div>
          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Invoice Prefix</label>
              <input type="text" class="form-control" name="invoicePrefix" value="${o(t.invoicePrefix||"VLE")}">
            </div>
            <div class="form-group">
              <label class="form-label">Next Invoice #</label>
              <input type="number" class="form-control" name="nextInvoiceNumber" value="${Number(t.nextInvoiceNumber||1001)}">
            </div>
          </div>

          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Financial Year</label>
              <input type="text" class="form-control" name="financialYear" value="${o(t.financialYear||"2026-27")}">
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
            <input type="text" class="form-control" name="footerNote" value="${o(t.footerNote||"")}">
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="set-upi">Centre's UPI ID (for "scan to pay" on bills)</label>
              <input type="text" class="form-control" id="set-upi" name="upiId" maxlength="100" placeholder="for example centre@okaxis" value="${o(t.upiId||"")}" data-no-i18n-placeholder>
              <div class="form-hint">Customers pay straight into this account. VLE360 never handles the money — check payments in your bank or UPI app.</div>
            </div>
            <div class="form-group">
              <label class="form-label"><input type="checkbox" name="upiOnBills" ${t.upiOnBills===!1?"":"checked"}> Show a UPI QR with the balance due on bills, receipts and WhatsApp bills</label>
            </div>
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
                <option value="zoho" ${B()==="zoho"?"selected":""}>Zoho Books style</option>
                <option value="erpnext" ${B()==="erpnext"?"selected":""}>ERPNext style</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Night Mode</label>
              <select class="form-control" id="set-night-mode">
                <option value="light" ${U()==="light"?"selected":""}>Off (Day)</option>
                <option value="dark" ${U()==="dark"?"selected":""}>On (Night)</option>
              </select>
            </div>
          </div>
          <span class="form-hint">Applies instantly. Night mode can also be switched with the moon button at the top.</span>
          <label style="display:flex; gap:8px; align-items:center; font-size:13px; margin-top:12px;">
            <input type="checkbox" id="set-close-warning" ${oe()?"checked":""}>
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
                ${[["customers","Customers & 360°"],["services","Service Management"],["billing","Billing & Invoices"],["accounts","Accounts & Counter"],["pending","Pending Work"],["aeps","AEPS & Banking"],["commissions","Commissions"],["staff","Staff Commission"],["inventory","Inventory"],["reminders","Renewal Reminders"],["privacy","Original Documents & Privacy"],["studio","PDF & Image Studio"],["cv","CV & Resume Builder"],["docstudio","Document Studio"],["faircent","Faircent Sub DSA"],["catalogue","Govt Catalogue"],["reports","Reports & Profit BI"],["vault","Software Vault"]].map(([e,i])=>`
                  <label style="font-size:12px; display:flex; align-items:center; gap:6px;">
                    <input type="checkbox" name="mod_${e}" ${b[e]!==!1?"checked":""}> ${i}
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
              <input type="text" class="form-control" name="en_invoice" value="${o(u.en?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Hindi Invoice Template (हिन्दी)</label>
              <input type="text" class="form-control" name="hi_invoice" value="${o(u.hi?.invoice||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Malayalam Invoice Template (മലയാളം)</label>
              <input type="text" class="form-control" name="ml_invoice" value="${o(u.ml?.invoice||"")}">
            </div>
            <button type="submit" class="btn btn-sm btn-outline">Update WhatsApp Templates</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Immutable Financial & System Audit Log -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Audit log — every activity from sign-in onwards (${c.length} entries)</div>
        <button type="button" class="btn btn-sm btn-outline" id="audit-csv-btn">Download full audit log (CSV)</button>
      </div>
      <p class="form-hint" style="margin:0 0 8px;">Every sign-in (including failed attempts) and sign-out, every screen opened, every record added, changed, cancelled or deleted, every bill, payment, print, file download, outside link, backup and setting change is recorded with the user and time. Entries cannot be edited or deleted in VLE360, and each entry is linked to the one before it so changes can be detected. <span id="audit-chain"></span></p>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <input type="search" class="form-control" id="audit-q" placeholder="Search user, action, screen or text" style="flex:1 1 220px;">
        <select class="form-control" id="audit-user" style="width:160px;"><option value="">All users</option>${[...new Set(c.map(e=>e.userName).filter(Boolean))].sort().map(e=>`<option>${o(e)}</option>`).join("")}</select>
        <select class="form-control" id="audit-act" style="width:200px;"><option value="">All activities</option>${[...new Set(c.map(e=>e.action).filter(Boolean))].sort().map(e=>`<option>${o(e)}</option>`).join("")}</select>
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
            ${E.length===0?'<tr><td colspan="6" style="text-align:center; padding:14px;">No audited operations recorded yet.</td></tr>':E.map(e=>`
                  <tr>
                    <td>${o($(e.timestamp,!0))}</td>
                    <td data-no-i18n>${o(e.userName||"—")}</td>
                    <td><span class="badge badge-info">${o(e.action)}</span></td>
                    <td>${o(e.module)}</td>
                    <td style="font-family:var(--font-mono);">${o(e.entityId)}</td>
                    <td>${o(e.summary)}</td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;let p=null;const I=async(e=!1)=>{const i=s.querySelector("#settings-profile-form");if(!i)return;const a=new FormData(i),n=a.get("language")||"en",g=n!==Z(),r=await w("settings","CENTRE_CONFIG")||t,f=de({centreType:a.get("centreType")||r.centreType,address:a.get("address"),district:a.get("district"),state:a.get("state"),pinCode:a.get("pinCode"),gstin:a.get("gstin"),cscId:a.get("cscId"),akshayaId:P(a.get("centreType")||r.centreType)?a.get("akshayaId"):""}),d=s.querySelector("#settings-centre-error"),h=String(a.get("upiId")||"").trim(),x=h&&!Y(h);d&&(d.textContent=[f.error,x?"The UPI ID looks wrong — it is like name@bank (for example centre@okaxis). It is not saved until corrected.":""].filter(Boolean).join(" "));const v=f.error?{centreType:r.centreType,address:r.address,district:r.district,state:r.state,pinCode:r.pinCode,gstin:r.gstin,cscId:r.cscId,akshayaId:r.akshayaId}:f.values,M=s.querySelector("#settings-akshaya-wrap");if(M&&(M.hidden=!P(a.get("centreType"))),await S("settings",{...r,id:"CENTRE_CONFIG",centreName:(a.get("centreName")||"").trim()||r.centreName,ownerName:(a.get("ownerName")||"").trim(),mobile:(a.get("mobile")||"").trim(),...v,...v.gstin?{gstStateCode:v.gstin.slice(0,2),gstRegistrationType:r.gstin&&r.gstRegistrationType&&r.gstRegistrationType!=="UNREGISTERED"?r.gstRegistrationType:"REGULAR"}:{gstRegistrationType:"UNREGISTERED"},centreType:v.centreType||r.centreType,invoicePrefix:(a.get("invoicePrefix")||"").trim()||"VLE",nextInvoiceNumber:Number(a.get("nextInvoiceNumber")||1001),financialYear:(a.get("financialYear")||"").trim(),language:n,backupReminderDays:Number(a.get("backupReminderDays")||3),footerNote:(a.get("footerNote")||"").trim(),upiId:x?r.upiId||"":h,upiOnBills:a.get("upiOnBills")==="on"}),g){const{switchLanguage:z}=await import("../app.js");await z(n);return}l&&await l(),e&&await y(s,l)},m=s.querySelector("#settings-profile-form");m?.addEventListener("input",()=>{p&&clearTimeout(p),p=setTimeout(()=>I(!1),380)}),m?.addEventListener("change",()=>{p&&clearTimeout(p),I(!1)});const k=async e=>{const a={...await w("settings","CENTRE_CONFIG")};a.centreLogo=e||"",await S("settings",a),await ce(a),await y(s,l)};s.querySelector("#set-logo-file")?.addEventListener("change",async e=>{const i=e.target.files?.[0];if(i)try{await k(await ne(i))}catch(a){const n=s.querySelector("#set-logo-msg");n&&(n.textContent=a.message)}}),s.querySelector("#set-logo-remove")?.addEventListener("click",async()=>{confirm("Remove the centre logo from the screen, invoices and PDFs?")&&await k(null)});const R=async(e,i)=>{const a=await w("settings","CENTRE_CONFIG");await S("settings",{...a,...e}),await C("SIGNATURE_UPDATED","settings","CENTRE_CONFIG",i),await y(s,l)};s.querySelector("#set-sign-file")?.addEventListener("change",async e=>{const i=e.target.files?.[0];if(i)try{await R({signatureImage:await le(i)},"Authorised signatory signature uploaded")}catch(a){const n=s.querySelector("#set-sign-msg");n&&(n.textContent=a.message)}}),s.querySelector("#set-sign-remove")?.addEventListener("click",async()=>{confirm("Remove the signature from invoices?")&&await R({signatureImage:""},"Authorised signatory signature removed")}),s.querySelector("#set-sign-name")?.addEventListener("change",async e=>{const i=await w("settings","CENTRE_CONFIG");await S("settings",{...i,signatoryName:String(e.target.value||"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,60)})}),m?.addEventListener("submit",async e=>{e.preventDefault(),p&&clearTimeout(p),await I(!0)}),s.querySelector("#set-palette")?.addEventListener("change",e=>G({palette:e.target.value})),s.querySelector("#set-night-mode")?.addEventListener("change",e=>G({mode:e.target.value})),s.querySelector("#set-close-warning")?.addEventListener("change",e=>re(e.target.checked));let A=Promise.resolve();const q=(e=!1)=>A=A.then(()=>H(e)).catch(()=>{}),H=async(e=!1)=>{const i=s.querySelector("#settings-security-form");if(!i)return;const a=new FormData(i),n={...b,dashboard:!0,backup:!0,settings:!0};["customers","services","billing","accounts","pending","aeps","commissions","staff","inventory","reminders","privacy","studio","cv","docstudio","faircent","tools","catalogue","reports","vault"].forEach(v=>{n[v]=a.get(`mod_${v}`)==="on"});const g=await w("settings","CENTRE_CONFIG")||t,{lockPin:r,...f}=g;let d=g.lockPinHash||"";const h=String(a.get("lockPin")||"").trim(),x=s.querySelector("#pin-status-hint");if(a.get("removePin")==="on")d="";else if(h){if(!/^\d{4,6}$/.test(h)){x&&(x.textContent="PIN must be 4 to 6 digits. Not saved.");return}d=await te(h);const v=i.querySelector('[name="lockPin"]');v&&(v.value="")}await S("settings",{...f,id:"CENTRE_CONFIG",lockPinHash:d,inactivityLockMinutes:Number(a.get("inactivityLockMinutes")||0),enabledModules:n}),x&&(x.textContent=d?"PIN active (stored as a secure hash)":"No PIN set"),l&&await l(),e&&await y(s,l)},D=s.querySelector("#settings-security-form");D?.addEventListener("change",()=>q(!1)),D?.addEventListener("submit",async e=>{e.preventDefault(),await q(!0)});const F=async(e=!1)=>{const i=s.querySelector("#settings-wa-form");if(!i)return;const a=new FormData(i),n=structuredClone(u);n.en.invoice=a.get("en_invoice"),n.hi.invoice=a.get("hi_invoice"),n.ml.invoice=a.get("ml_invoice");const g=await w("settings","CENTRE_CONFIG")||t;await S("settings",{...g,id:"CENTRE_CONFIG",whatsappTemplates:n}),e&&await y(s,l)},O=s.querySelector("#settings-wa-form");O?.addEventListener("change",()=>F(!1)),O?.addEventListener("submit",async e=>{e.preventDefault(),await F(!0)}),s.querySelector("#set-load-acceptance-btn")?.addEventListener("click",async()=>{await ee(),l&&await l(),await y(s,l)});const V=[...c].sort((e,i)=>String(i.timestamp||"").localeCompare(String(e.timestamp||""))),j=e=>`<tr><td>${o($(e.timestamp,!0))}</td><td data-no-i18n>${o(e.userName||"—")}</td><td><span class="badge badge-info">${o(e.action)}</span></td><td>${o(e.module)}</td><td style="font-family:var(--font-mono);">${o(e.entityId)}</td><td>${o(e.summary)}</td></tr>`,_=()=>{const e=(s.querySelector("#audit-q")?.value||"").trim().toLowerCase(),i=s.querySelector("#audit-user")?.value||"",a=s.querySelector("#audit-act")?.value||"",n=s.querySelector("#audit-date")?.value||"",g=V.filter(d=>(!i||d.userName===i)&&(!a||d.action===a)&&(!n||String(d.timestamp||"").slice(0,10)===n||$(d.timestamp).includes(n.split("-").reverse().join("-")))&&(!e||[d.userName,d.action,d.module,d.entityId,d.summary].join(" ").toLowerCase().includes(e))),r=s.querySelector("#audit-body");r&&(r.innerHTML=g.slice(0,300).map(j).join("")||'<tr><td colspan="6" style="text-align:center; padding:14px;">No matching entries.</td></tr>');const f=s.querySelector("#audit-count");f&&(f.textContent=`${g.length} matching entries${g.length>300?" — latest 300 shown; download the CSV for all":""}`)};["#audit-q","#audit-user","#audit-act","#audit-date"].forEach(e=>s.querySelector(e)?.addEventListener("input",_)),_(),s.querySelector("#audit-csv-btn")?.addEventListener("click",async()=>{const{auditCSV:e}=await import("../core/auditlog.js"),i=`${ae(String(t.centreName||"VLE360"))}_audit_log_${ie()}.csv`;se(await e(),i,"text/csv")}),import("../core/auditlog.js").then(async({verifyAuditChain:e})=>{const i=await e(),a=s.querySelector("#audit-chain");a&&(a.innerHTML=i.ok?`<strong style="color:var(--color-success);">Chain check: intact</strong> (${i.chained} linked entries${i.earlier?`, ${i.earlier} earlier entries made before linking`:""}).`:`<strong style="color:var(--color-danger);">Chain check: an entry was changed or removed outside VLE360</strong> (near entry ${o(String(i.brokenAt?.seq||""))}, ${o($(i.brokenAt?.timestamp||"",!0))}).`)}),s.querySelector("#set-start-fresh-btn")?.addEventListener("click",()=>pe(s,l)),s.querySelector("#set-reset-db-btn")?.addEventListener("click",async()=>{confirm("Are you sure you want to clear all local business records and restore clean factory defaults? Sign-in accounts and the audit log are kept.")&&(await J(!1),await C("DATA_RESET","settings","","All business records on this computer were cleared (Reset Local Database)"),l&&await l(),await y(s,l))})}function pe(s,l){const T=L();if(T&&T.role!=="OWNER")return alert("Only the Owner can start fresh.");const c=document.createElement("div");c.className="modal-backdrop start-fresh-modal",c.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;",c.innerHTML=`<form class="card" style="max-width:600px;width:100%;margin:0;" role="dialog" aria-modal="true" aria-labelledby="sf-title">
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
      </div></form>`;const t=()=>c.remove();c.querySelector("[data-close]").addEventListener("click",t),c.addEventListener("keydown",b=>b.key==="Escape"&&t()),c.querySelector("form").addEventListener("submit",async b=>{b.preventDefault();const u=c.querySelector("#sf-err");if(c.querySelector("#sf-confirm").value.trim().toUpperCase()!=="START FRESH"){u.textContent="Type START FRESH exactly to confirm.";return}const E=b.submitter||c.querySelector("button[type=submit]");E.disabled=!0;try{if(c.querySelector("#sf-backup").checked){u.style.color="inherit",u.textContent="Saving a backup…";const{runAutoBackup:m}=await import("../core/autobackup.js");await m({reason:"MANUAL"})}u.textContent="Clearing transactions…";const p=await Q(),I=Object.values(p).reduce((m,k)=>m+k,0);await C("START_FRESH","settings","",`Started fresh: ${I} transaction records cleared (${Object.entries(p).filter(([,m])=>m).map(([m,k])=>`${m} ${k}`).join(", ")||"none"}); balances and stock set to 0. Users, customers, services and settings kept.`),t(),l&&await l(),await y(s,l),alert("Done. All transactions are cleared and balances are 0. Users, customers, services and settings are unchanged.")}catch(p){u.style.color="var(--color-danger)",u.textContent=`Could not complete: ${p.message}. Nothing was cleared if the backup failed.`,E.disabled=!1}}),document.body.appendChild(c),c.querySelector("#sf-confirm").focus()}export{W as CENTRE_TYPES,y as renderSettingsModule};
