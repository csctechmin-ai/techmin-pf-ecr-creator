import{STORES as g,getRecord as w,getStorageDiagnostics as C}from"../core/db.js";import{generateJSONBackupString as A,generateTXTBackupString as L,parseAndValidateBackup as T,restoreValidatedBackup as N}from"../core/backup.js";import{formatDate as f,esc as s,downloadFile as $}from"../core/utils.js";import{putRecord as R}from"../core/db.js";import{can as O}from"../core/auth.js";import{getAutoBackupStatus as P,getAutoBackupConfig as V,chooseBackupFolder as j,reconnectBackupFolder as q,forgetBackupFolder as I,runAutoBackup as F,backupBaseName as E}from"../core/autobackup.js";let r=null,p="";async function l(t){const[d,b]=await Promise.all([C(),w("settings","CENTRE_CONFIG")]),v=Array.isArray(b?.backupHistory)?b.backupHistory:[],a=await P(),n=a.state.lastResult,y=e=>e?new Date(e).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—",S=`
    <div class="card" id="auto-backup-card">
      <div class="card-header"><div class="card-title">Automatic backup to this PC</div>
        <label class="switch-label"><input type="checkbox" id="ab-enabled" ${a.cfg.enabled?"checked":""}> On</label></div>
      <div class="grid-2" style="gap:16px;">
        <div>
          <label class="auth-check"><input type="checkbox" id="ab-hourly" ${a.cfg.hourly?"checked":""}> Every hour</label>
          <label class="form-label" style="margin-top:8px;">Also at these times</label>
          <div class="ab-times" id="ab-times">${a.cfg.times.map(e=>`<span class="ab-time" data-no-i18n>${s(e)} <button type="button" data-ab-del="${s(e)}" title="Remove">✕</button></span>`).join("")||'<span class="form-hint">No fixed times.</span>'}</div>
          <div style="display:flex; gap:6px; margin-top:6px;"><input type="time" class="form-control" id="ab-new-time" style="width:140px;"><button type="button" class="btn btn-sm btn-outline" id="ab-add-time">+ Add time</button></div>
          <label class="form-label" style="margin-top:10px;">Save as</label>
          <div style="display:flex; gap:14px;"><label class="auth-check"><input type="checkbox" id="ab-json" ${a.cfg.json?"checked":""}> JSON</label><label class="auth-check"><input type="checkbox" id="ab-txt" ${a.cfg.txt?"checked":""}> TXT</label></div>
          <label class="form-label" style="margin-top:10px;">Delete automatic backups older than</label>
          <select class="form-control" id="ab-retention" style="width:180px;">${[7,15,30,60,90,180,365,0].map(e=>`<option value="${e}" ${a.cfg.retentionDays===e?"selected":""}>${e?`${e} days`:"Never delete"}</option>`).join("")}</select>
        </div>
        <div>
          <label class="form-label">Backup folder</label>
          ${a.folderName?`<div class="ab-folder"><strong data-no-i18n>${s(a.folderName)}</strong> ${a.folderPermission==="granted"?'<span class="badge badge-success">Connected</span>':'<span class="badge badge-warning">Needs permission</span>'}</div>
                 <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">${a.folderPermission!=="granted"?'<button type="button" class="btn btn-sm btn-primary" id="ab-reconnect">Reconnect backup folder</button>':""}<button type="button" class="btn btn-sm btn-outline" id="ab-choose">Change folder</button><button type="button" class="btn btn-sm btn-outline" id="ab-forget">Use Downloads instead</button></div>`:`<div class="form-hint">${a.folderSupported?"Not chosen — backups go to your Downloads folder.":"This browser saves backups to the Downloads folder (choosing a folder needs Chrome or Edge)."}</div>
                 ${a.folderSupported?'<button type="button" class="btn btn-sm btn-primary" id="ab-choose" style="margin-top:6px;">Choose backup folder</button>':""}`}
          <p class="form-hint" style="margin-top:8px;">Tip: choose a folder on a pen drive / external disk, or one synced by Google Drive or OneDrive.</p>
          <label class="form-label" style="margin-top:8px;">File names</label>
          <div class="ab-example" data-no-i18n>${s(a.exampleName)}.json<br>${s(a.exampleName)}.txt</div>
          <div class="ab-status">
            <div>Last automatic backup: <strong>${n?s(y(Date.parse(n.at))):"—"}</strong>${n?` (${n.destination==="FOLDER"?"saved to folder":"saved to Downloads"})`:""}</div>
            <div>Next backup: <strong>${a.cfg.enabled?s(y(a.nextDueAt)):"Automatic backup is off"}</strong></div>
            ${n?.note?`<div class="form-hint" style="color:var(--color-warning);">${s(n.note)}</div>`:""}
          </div>
          <button type="button" class="btn btn-sm btn-success" id="ab-run-now" style="margin-top:8px;">Back up now</button>
          <div class="form-hint" id="ab-msg"></div>
        </div>
      </div>
      <p class="form-hint" style="margin-top:10px;">Automatic backup runs while VLEBook is open. A backup missed while it was closed runs shortly after you open it.</p>
    </div>`;t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Data Ownership, Backup & Offline Recovery Centre</h1>
        <p>Your data stays under your control: export, encrypt, validate, preview and restore the data stored on this computer</p>
      </div>
      <div class="module-actions">
      </div>
    </div>

    <div class="callout">
      <div>
        <strong>Local-First Data Ownership Notice:</strong> All primary business records belong to this browser profile and device inside <code>IndexedDB (${s(d.dbName)})</code>. VLEBook does not send these business records to Techmin or any cloud server (only the centre's registration details are sent to Techmin, as explained in the Privacy Policy). Because clearing browser site data or switching computers can remove browser-local storage, download a JSON or TXT backup regularly.
      </div>
    </div>

    ${S}

    <!-- Database Health & Storage Strip -->
    <div class="grid-kpi">
      <div class="kpi-card navy">
        <div class="kpi-label">Total Database Records</div>
        <div class="kpi-value">${d.totalRecords}</div>
        <div class="kpi-sub">Across ${g.length} IndexedDB Object Stores</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Database Health Check</div>
        <div class="kpi-value">HEALTHY (v${d.schemaVersion})</div>
        <div class="kpi-sub">App Version: ${s(d.appVersion)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Browser Storage Used</div>
        <div class="kpi-value">${(d.usedBytes/1024).toFixed(1)} KB</div>
        <div class="kpi-sub">Quota Available: ~${Math.round(d.quotaBytes/(1024*1024))} MB</div>
      </div>
      <div class="kpi-card gold">
        <div class="kpi-label">Last Successful Backup</div>
        <div class="kpi-value" style="font-size:14px;">${s(f(b?.lastBackupAt,!0))}</div>
        <div class="kpi-sub">${v.length} backups logged in history</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Left Column: Export Complete / Selective / Date-Range Backup -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Export Complete, Module-Selective or Encrypted Backup</div>
        </div>

        <div class="form-grid" style="grid-template-columns:1fr;">
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Optional Date Range From</label>
              <input type="date" class="form-control" id="bkp-start-date">
            </div>
            <div class="form-group">
              <label class="form-label">Optional Date Range To</label>
              <input type="date" class="form-control" id="bkp-end-date">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Optional AES-GCM-256 Encryption Password (WebCrypto PBKDF2)</label>
            <input type="password" class="form-control" id="bkp-export-pass" placeholder="Leave blank for plain portable JSON/TXT, or enter password to encrypt">
            <span class="form-hint">When a password is provided, payload records are genuinely encrypted using 256-bit AES-GCM before export.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Select Modules to Include (Default: All ${g.length} Stores)</label>
            <div style="display:flex; gap:8px; flex-wrap:wrap; background:var(--color-surface-alt); padding:10px; border-radius:var(--radius-sm);">
              ${g.map(e=>`
                <label style="font-size:11.5px; display:inline-flex; align-items:center; gap:4px;">
                  <input type="checkbox" class="bkp-store-chk" value="${s(e)}" checked>
                  ${s(e)} (${d.counts[e]||0})
                </label>`).join("")}
            </div>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:6px;">
            <button type="button" class="btn btn-primary" id="bkp-export-json-btn">Export Complete JSON Backup</button>
            <button type="button" class="btn btn-teal" id="bkp-export-txt-btn">Export Structured TXT Backup (VLEBOOK_BACKUP)</button>
          </div>
        </div>

        <!-- Backup History Table -->
        <div style="margin-top:18px;">
          <div class="card-title" style="font-size:13.5px; margin-bottom:8px;">Local Backup History</div>
          <div class="table-wrap" style="max-height:210px; overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Format</th>
                  <th class="num">Records</th>
                  <th>Encryption</th>
                </tr>
              </thead>
              <tbody>
                ${v.length===0?'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--color-text-muted);">No manual backups exported yet.</td></tr>':v.map(e=>`
                      <tr>
                        <td>${s(f(e.timestamp,!0))}</td>
                        <td><span class="badge badge-info">${s(e.format)}</span></td>
                        <td class="num">${e.totalRecords}</td>
                        <td>${e.encrypted?"AES-GCM-256":"Plain Portable"}</td>
                      </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Validate, Preview & Restore JSON / TXT Backup -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Validate, Preview & Restore Backup (JSON or TXT)</div>
        </div>

        <div class="form-grid" style="grid-template-columns:1fr;">
          <div class="form-group">
            <label class="form-label">1. Upload Backup File (<code>.json</code> or <code>.txt</code>)</label>
            <input type="file" class="form-control" id="bkp-import-file" accept=".json,.txt">
          </div>

          <div class="form-group">
            <label class="form-label">Or Paste Backup Content Directly for Validation</label>
            <textarea class="form-control" id="bkp-import-textarea" rows="4" placeholder="Paste JSON or VLEBOOK_BACKUP TXT payload here..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Decryption Password (If Backup is Encrypted)</label>
            <input type="password" class="form-control" id="bkp-import-pass" placeholder="Enter password if backup was encrypted">
          </div>

          <button type="button" class="btn btn-outline" id="bkp-validate-btn">Validate Structure, Detect Duplicates & Preview</button>

          ${p?`<div class="callout danger"><span><strong>Validation Failed:</strong> ${s(p)}</span></div>`:""}

          ${r?`
              <div class="card" style="background:var(--color-surface-alt); margin-top:8px; margin-bottom:0;">
                <div class="card-title" style="font-size:14px; color:var(--color-success); margin-bottom:8px;">
                  Valid ${s(r.format)} Backup Verified (v${s(r.backupVersion)})
                </div>
                <div style="font-size:12px; margin-bottom:8px;">
                  <div><strong>Centre Profile:</strong> ${s(r.centreProfile?.centreName||"VLEBook")} (${s(r.centreProfile?.centreType||"CSC")})</div>
                  <div><strong>Exported At:</strong> ${s(f(r.exportTimestamp,!0))}</div>
                  <div><strong>Total Incoming Records:</strong> ${r.totalIncomingRecords}</div>
                  ${r.format==="TXT"?`<div><strong>SHA-256 Checksum:</strong> <span class="badge ${r.checksumStatus==="VERIFIED"?"badge-success":"badge-warning"}">${r.checksumStatus==="VERIFIED"?"Verified — file is intact":"Not present (older backup)"}</span></div>`:""}
                  <div><strong>Duplicate Record IDs Detected:</strong> <span class="badge ${r.duplicateIdCount>0?"badge-warning":"badge-success"}">${r.duplicateIdCount}</span></div>
                  <div><strong>Duplicate Customer Mobiles Detected:</strong> <span class="badge ${r.duplicateCustomerMobileCount>0?"badge-warning":"badge-success"}">${r.duplicateCustomerMobileCount}</span></div>
                </div>

                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label"> explicit Confirmation Required:</label>
                  <label style="font-size:12px;">
                    <input type="checkbox" id="bkp-confirm-restore-chk">
                    I have reviewed the backup preview above and confirm restoring these records.
                  </label>
                </div>

                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button type="button" class="btn btn-teal" id="bkp-restore-merge-btn">Merge Backup into Existing Data</button>
                  <button type="button" class="btn btn-danger" id="bkp-restore-replace-btn">Replace Existing Local Database</button>
                </div>
              </div>`:""}
        </div>
      </div>
    </div>
  `;const k=()=>{const e=Array.from(t.querySelectorAll(".bkp-store-chk:checked")).map(D=>D.value),o=t.querySelector("#bkp-start-date")?.value||"",u=t.querySelector("#bkp-end-date")?.value||"",B=t.querySelector("#bkp-export-pass")?.value||"";return{selectedStores:e,startDate:o,endDate:u,password:B}},c=async e=>{const o=await w("settings","CENTRE_CONFIG"),u={...V(o),...e};await R("settings",{...o,autoBackup:u},{notifyAutosave:!1,skipChangeTracking:!0}),await l(t)},i=e=>t.querySelector(e);i("#ab-enabled")?.addEventListener("change",e=>c({enabled:e.target.checked})),i("#ab-hourly")?.addEventListener("change",e=>c({hourly:e.target.checked})),i("#ab-json")?.addEventListener("change",e=>c({json:e.target.checked,txt:e.target.checked?a.cfg.txt:!0})),i("#ab-txt")?.addEventListener("change",e=>c({txt:e.target.checked,json:e.target.checked?a.cfg.json:!0})),i("#ab-retention")?.addEventListener("change",e=>c({retentionDays:Number(e.target.value)})),i("#ab-add-time")?.addEventListener("click",()=>{const e=i("#ab-new-time").value;/^\d{2}:\d{2}$/.test(e)&&c({times:[...a.cfg.times,e]})}),t.querySelectorAll("[data-ab-del]").forEach(e=>e.addEventListener("click",()=>c({times:a.cfg.times.filter(o=>o!==e.dataset.abDel)}))),i("#ab-choose")?.addEventListener("click",async()=>{try{await j(),await l(t)}catch(e){e.name!=="AbortError"&&(i("#ab-msg").textContent=e.message)}}),i("#ab-reconnect")?.addEventListener("click",async()=>{await q(),await l(t)}),i("#ab-forget")?.addEventListener("click",async()=>{await I(),await l(t)}),i("#ab-run-now")?.addEventListener("click",async()=>{const e=await F({reason:"MANUAL"});await l(t);const o=t.querySelector("#ab-msg");o&&(o.textContent=`Saved ${e.files.join(" and ")} ${e.destination==="FOLDER"?"in "+e.folderName:"to Downloads"}.`)}),O("restore_backup")||t.querySelectorAll("#bkp-restore-merge-btn, #bkp-restore-replace-btn").forEach(e=>e.remove()),t.querySelector("#bkp-export-json-btn")?.addEventListener("click",async()=>{const e=k(),o=await A(e);$(o,`${E(b?.centreName)}.json`,"application/json"),await l(t)}),t.querySelector("#bkp-export-txt-btn")?.addEventListener("click",async()=>{const e=k(),o=await L(e);$(o,`${E(b?.centreName)}.txt`,"text/plain"),await l(t)});const h=t.querySelector("#bkp-import-file"),m=t.querySelector("#bkp-import-textarea");h?.addEventListener("change",async()=>{const e=h.files?.[0];if(!e)return;const o=await e.text();m&&(m.value=o)}),t.querySelector("#bkp-validate-btn")?.addEventListener("click",async()=>{const e=m?.value||"",o=t.querySelector("#bkp-import-pass")?.value||"";try{p="",r=await T(e,o)}catch(u){r=null,p=u.message}await l(t)});const x=async e=>{if(!t.querySelector("#bkp-confirm-restore-chk")?.checked){p="Please check the confirmation box before restoring the backup.",await l(t);return}await N(r,e),r=null,p="",await l(t)};t.querySelector("#bkp-restore-merge-btn")?.addEventListener("click",()=>x("MERGE")),t.querySelector("#bkp-restore-replace-btn")?.addEventListener("click",()=>x("REPLACE"))}export{l as renderBackupModule};
