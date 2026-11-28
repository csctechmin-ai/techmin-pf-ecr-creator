import{STORES as S,getRecord as P,getStorageDiagnostics as J}from"../core/db.js";import{generateJSONBackupString as X,generateTXTBackupString as K,parseAndValidateBackup as _,restoreValidatedBackup as z}from"../core/backup.js";import{formatDate as D,esc as t,downloadFile as V}from"../core/utils.js";import{putRecord as W}from"../core/db.js";import{can as Y,getCurrentUser as I}from"../core/auth.js";import{getAutoBackupStatus as Q,getAutoBackupConfig as Z,chooseBackupFolder as ee,reconnectBackupFolder as te,forgetBackupFolder as ae,runAutoBackup as oe,backupBaseName as j,BACKUP_PROVIDERS as q,getBackupProvider as se,setBackupProvider as re}from"../core/autobackup.js";import{auditFileName as ne}from"../core/auditlog.js";const G={GDRIVE:"Choose a folder inside your Google Drive, for example “G:\\My Drive\\VLE360 backups”. Google Drive for desktop must be signed in on this computer; it uploads every backup to your Drive automatically.",ONEDRIVE:"Choose a folder inside OneDrive, for example “C:\\Users\\(your name)\\OneDrive\\VLE360 backups”. OneDrive uploads every backup automatically.",DROPBOX:"Choose a folder inside your Dropbox folder, for example “C:\\Users\\(your name)\\Dropbox\\VLE360 backups”. Dropbox uploads every backup automatically.",LOCAL:"Choose a folder on this computer or on a USB / external drive. Keep another copy away from this computer too."};let n=null,g="";async function l(o){const[c,h]=await Promise.all([J(),P("settings","CENTRE_CONFIG")]),k=Array.isArray(h?.backupHistory)?h.backupHistory:[],s=await Q(),x=await se(),F=await ne();let w=null;try{w=await navigator.storage?.persisted?.()??null}catch{}const d=s.state.lastResult,C=e=>e?new Date(e).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—",p=await import("../core/sync.js"),$=await import("../core/devicestore.js"),y=!!await $.kvGet("syncEnabled"),u=p.getSyncStatus(),B=y?await p.listComputers().catch(()=>[]):[],T=y?null:await $.kvGet("syncRemoved"),m=I()?.role==="OWNER",O=!!s.folderName,M=e=>{const a=Math.round((Date.now()-Date.parse(e||0))/6e4);return e?a<2?"just now":a<60?`${a} min ago`:a<1440?`${Math.round(a/60)} h ago`:`${Math.round(a/1440)} day(s) ago`:"—"},H=`
    <div class="card" id="sync-card">
      <div class="card-header"><div class="card-title">Work on more than one computer (shared Google Drive folder)</div>
        <span class="badge ${y?"badge-success":"badge-info"}">${y?`On · this computer is counter ${t(u.counter||await $.kvGet("syncCounter")||"")}`:"Off"}</span></div>
      <p class="form-hint" style="margin-bottom:10px;">Staff can work at the same time on two or more computers. Each computer keeps working offline and shares its bills, payments, customers, stock and settings with the others through the centre's Google Drive backup folder. Google Drive for desktop must be installed and signed in on every computer.</p>
      <p class="form-hint" style="margin-bottom:10px;">Changes reach the other computers in about a minute. Each computer has its own invoice series, for example VLE-A-1001 on counter A and VLE-B-1001 on counter B. Your data goes only to your own Google Drive, never to Techmin.</p>
      ${y?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Counter</th><th>Computer</th><th>Last seen</th><th>Signed in</th><th>Version</th>${m?"<th></th>":""}</tr></thead><tbody>
              ${B.map(e=>`<tr class="${e.inactive?"row-muted":""}" data-dev="${t(e.dev)}"><td><strong>${t(e.counter||"—")}</strong>${e.me?' <span class="badge badge-info">this computer</span>':""}${e.inactive?' <span class="badge badge-warning" title="Not seen for 30 days or more. Not preferred for the next licence.">inactive</span>':""}${e.samePc?.length?` <span class="badge badge-secondary" title="Recognised through the VLE360 Print Bridge">same PC as ${t(e.samePc.join(", "))}</span>`:""}</td><td>${t(e.dev)}</td><td>${t(M(e.lastSeen))}</td><td>${t(e.user||"—")}</td><td>${t(e.version||"")}</td>${m?`<td>${e.me?"":`<button type="button" class="btn btn-sm btn-outline sync-remove" data-dev="${t(e.dev)}" data-counter="${t(e.counter||"")}">Remove</button>`}</td>`:""}</tr>`).join("")||`<tr><td colspan="${m?6:5}">Reconnect the backup folder to see the other computers.</td></tr>`}
            </tbody></table></div>
            ${m&&B.length>1?'<p class="form-hint" style="margin:6px 0 0;">Remove a computer only when it is no longer used (old PC, another browser or profile you do not use). It stops sharing the next time it opens, its counter letter becomes free, and Techmin stops counting it for your licence. Changes made on it that never reached the folder will not come here.</p>':""}
            <p class="form-hint" style="margin:8px 0;"><span>Status:</span> <strong>${t({ok:"Synced",syncing:"Syncing…",paused:"Paused",nofolder:"Folder not connected",error:"Problem",starting:"Starting…",off:"Off"}[u.state]||u.state)}</strong>${u.lastAt?` · last ${t(new Date(u.lastAt).toLocaleTimeString())}`:""}${u.error?` · ${t(u.error)}`:""}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;"><button type="button" class="btn btn-sm btn-primary" id="sync-now">Sync now</button>${m?'<button type="button" class="btn btn-sm btn-outline" id="sync-off">Turn off on this computer</button>':""}</div>`:`${T?`<div class="callout warning" style="margin-bottom:10px;"><div>${t(p.removedMessage(T))}</div></div>`:""}<ol style="margin:0 0 10px 18px;font-size:13.5px;line-height:1.7;">
              <li>On this main computer, connect a Google Drive folder under Automatic backup above.${O?" ✓":""}</li>
              <li>Click Turn on below. Only the Owner can do this, and the internet is needed.</li>
              <li>On each other computer, install Google Drive for desktop with the same Google account, open VLE360 in Chrome or Edge, click "Join my centre (shared Google Drive folder)" on the first screen and choose the same folder.</li>
              <li>Ask Techmin to issue your licence for "Any computer", so every computer gets the full version.</li>
            </ol>
            ${m?`<button type="button" class="btn btn-primary" id="sync-on" ${O?"":'disabled title="Connect your Google Drive backup folder first"'}>Turn on</button>`:'<p class="form-hint">Only the Owner can turn this on.</p>'}`}
      <div class="auth-error" id="sync-msg" role="status"></div>
    </div>`,U=`
    <div class="card" id="auto-backup-card">
      <div class="card-header"><div class="card-title">Automatic backup to Google Drive, OneDrive, Dropbox or a folder</div>
        <label class="switch-label"><input type="checkbox" id="ab-enabled" ${s.cfg.enabled?"checked":""}> On</label></div>
      <div class="grid-2" style="gap:16px;">
        <div>
          <label class="auth-check"><input type="checkbox" id="ab-hourly" ${s.cfg.hourly?"checked":""}> Every hour</label>
          <label class="form-label" style="margin-top:8px;">Also at these times</label>
          <div class="ab-times" id="ab-times">${s.cfg.times.map(e=>`<span class="ab-time" data-no-i18n>${t(e)} <button type="button" data-ab-del="${t(e)}" title="Remove">✕</button></span>`).join("")||'<span class="form-hint">No fixed times.</span>'}</div>
          <div style="display:flex; gap:6px; margin-top:6px;"><input type="time" class="form-control" id="ab-new-time" style="width:140px;"><button type="button" class="btn btn-sm btn-outline" id="ab-add-time">+ Add time</button></div>
          <label class="form-label" style="margin-top:10px;">Save as</label>
          <div style="display:flex; gap:14px;"><label class="auth-check"><input type="checkbox" id="ab-json" ${s.cfg.json?"checked":""}> JSON</label><label class="auth-check"><input type="checkbox" id="ab-txt" ${s.cfg.txt?"checked":""}> TXT</label></div>
          <label class="form-label" style="margin-top:10px;">Delete automatic backups older than</label>
          <select class="form-control" id="ab-retention" style="width:180px;">${[7,15,30,60,90,180,365,0].map(e=>`<option value="${e}" ${s.cfg.retentionDays===e?"selected":""}>${e?`${e} days`:"Never delete"}</option>`).join("")}</select>
        </div>
        <div>
          <label class="form-label">Where should backups be saved?</label>
          <select class="form-control" id="ab-provider" style="max-width:280px;">${Object.entries(q).map(([e,a])=>`<option value="${e}" ${x===e?"selected":""}>${t(a)}</option>`).join("")}</select>
          <p class="form-hint" id="ab-provider-hint" style="margin:6px 0 10px;">${t(G[x])}</p>
          <label class="form-label">Backup folder</label>
          ${s.folderName?`<div class="ab-folder"><strong data-no-i18n>${t(s.folderName)}</strong> ${s.folderPermission==="granted"?'<span class="badge badge-success">Connected</span>':'<span class="badge badge-warning">Needs permission</span>'}</div>
                 <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">${s.folderPermission!=="granted"?'<button type="button" class="btn btn-sm btn-primary" id="ab-reconnect">Reconnect backup folder</button>':""}<button type="button" class="btn btn-sm btn-outline" id="ab-choose">Change folder</button><button type="button" class="btn btn-sm btn-outline" id="ab-forget">Use Downloads instead</button></div>`:`<div class="form-hint">${s.folderSupported?"Not chosen — backups go to your Downloads folder.":"This browser saves backups to the Downloads folder (choosing a folder needs Chrome or Edge)."}</div>
                 ${s.folderSupported?'<button type="button" class="btn btn-sm btn-primary" id="ab-choose" style="margin-top:6px;">Choose backup folder</button>':""}`}
          <p class="form-hint" style="margin-top:8px;">Backups are saved to this folder automatically, without asking each time, and every save is written in the audit log. The audit log is also kept in this folder as <span data-no-i18n>${t(F)}</span>.</p>
          <p class="form-hint">Browser storage protection: <strong>${w===!0?"On":w===!1?"Not granted by the browser":"Not available"}</strong>.</p>
          <label class="form-label" style="margin-top:8px;">File names</label>
          <div class="ab-example" data-no-i18n>${t(s.exampleName)}.json<br>${t(s.exampleName)}.txt</div>
          <div class="ab-status">
            <div>Last automatic backup: <strong>${d?t(C(Date.parse(d.at))):"—"}</strong>${d?` (${d.destination==="FOLDER"?`saved to ${t(q[x])}`:d.destination==="SKIPPED"?"not saved — no backup folder":"saved to Downloads"})`:""}</div>
            <div>Next backup: <strong>${s.cfg.enabled?t(C(s.nextDueAt)):"Automatic backup is off"}</strong></div>
            ${d?.note?`<div class="form-hint" style="color:var(--color-warning);">${t(d.note)}</div>`:""}
          </div>
          <button type="button" class="btn btn-sm btn-success" id="ab-run-now" style="margin-top:8px;">Back up now</button>
          <div class="form-hint" id="ab-msg"></div>
        </div>
      </div>
      <p class="form-hint" style="margin-top:10px;">Automatic backup runs while VLE360 is open. A backup missed while it was closed runs shortly after you open it.</p>
    </div>`;o.innerHTML=`
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
        <strong>Local-First Data Ownership Notice:</strong> All primary business records belong to this browser profile and device inside <code>IndexedDB (${t(c.dbName)})</code>. VLE360 does not send these business records to Techmin or any cloud server (only the centre's registration details are sent to Techmin, as explained in the Privacy Policy). Because clearing browser site data or switching computers can remove browser-local storage, download a JSON or TXT backup regularly.
      </div>
    </div>

    ${U}
    ${H}

    <!-- Database Health & Storage Strip -->
    <div class="grid-kpi">
      <div class="kpi-card navy">
        <div class="kpi-label">Total Database Records</div>
        <div class="kpi-value">${c.totalRecords}</div>
        <div class="kpi-sub">Across ${S.length} IndexedDB Object Stores</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Database Health Check</div>
        <div class="kpi-value">HEALTHY (v${c.schemaVersion})</div>
        <div class="kpi-sub">App Version: ${t(c.appVersion)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Browser Storage Used</div>
        <div class="kpi-value">${(c.usedBytes/1024).toFixed(1)} KB</div>
        <div class="kpi-sub">Quota Available: ~${Math.round(c.quotaBytes/(1024*1024))} MB</div>
      </div>
      <div class="kpi-card gold">
        <div class="kpi-label">Last Successful Backup</div>
        <div class="kpi-value" style="font-size:14px;">${t(D(h?.lastBackupAt,!0))}</div>
        <div class="kpi-sub">${k.length} backups logged in history</div>
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
            <label class="form-label">Select Modules to Include (Default: All ${S.length} Stores)</label>
            <div style="display:flex; gap:8px; flex-wrap:wrap; background:var(--color-surface-alt); padding:10px; border-radius:var(--radius-sm);">
              ${S.map(e=>`
                <label style="font-size:11.5px; display:inline-flex; align-items:center; gap:4px;">
                  <input type="checkbox" class="bkp-store-chk" value="${t(e)}" checked>
                  ${t(e)} (${c.counts[e]||0})
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
                ${k.length===0?'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--color-text-muted);">No manual backups exported yet.</td></tr>':k.map(e=>`
                      <tr>
                        <td>${t(D(e.timestamp,!0))}</td>
                        <td><span class="badge badge-info">${t(e.format)}</span></td>
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

          ${g?`<div class="callout danger"><span><strong>Validation Failed:</strong> ${t(g)}</span></div>`:""}

          ${n?`
              <div class="card" style="background:var(--color-surface-alt); margin-top:8px; margin-bottom:0;">
                <div class="card-title" style="font-size:14px; color:var(--color-success); margin-bottom:8px;">
                  Valid ${t(n.format)} Backup Verified (v${t(n.backupVersion)})
                </div>
                <div style="font-size:12px; margin-bottom:8px;">
                  <div><strong>Centre Profile:</strong> ${t(n.centreProfile?.centreName||"VLE360")} (${t(n.centreProfile?.centreType||"CSC")})</div>
                  <div><strong>Exported At:</strong> ${t(D(n.exportTimestamp,!0))}</div>
                  <div><strong>Total Incoming Records:</strong> ${n.totalIncomingRecords}</div>
                  ${n.format==="TXT"?`<div><strong>SHA-256 Checksum:</strong> <span class="badge ${n.checksumStatus==="VERIFIED"?"badge-success":"badge-warning"}">${n.checksumStatus==="VERIFIED"?"Verified — file is intact":"Not present (older backup)"}</span></div>`:""}
                  <div><strong>Duplicate Record IDs Detected:</strong> <span class="badge ${n.duplicateIdCount>0?"badge-warning":"badge-success"}">${n.duplicateIdCount}</span></div>
                  <div><strong>Duplicate Customer Mobiles Detected:</strong> <span class="badge ${n.duplicateCustomerMobileCount>0?"badge-warning":"badge-success"}">${n.duplicateCustomerMobileCount}</span></div>
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
  `;const L=()=>{const e=Array.from(o.querySelectorAll(".bkp-store-chk:checked")).map(f=>f.value),a=o.querySelector("#bkp-start-date")?.value||"",i=o.querySelector("#bkp-end-date")?.value||"",v=o.querySelector("#bkp-export-pass")?.value||"";return{selectedStores:e,startDate:a,endDate:i,password:v}},b=async e=>{const a=await P("settings","CENTRE_CONFIG"),i={...Z(a),...e};await W("settings",{...a,autoBackup:i},{notifyAutosave:!1,skipChangeTracking:!0}),await l(o)},r=e=>o.querySelector(e);r("#ab-enabled")?.addEventListener("change",e=>b({enabled:e.target.checked})),r("#ab-hourly")?.addEventListener("change",e=>b({hourly:e.target.checked})),r("#ab-json")?.addEventListener("change",e=>b({json:e.target.checked,txt:e.target.checked?s.cfg.txt:!0})),r("#ab-txt")?.addEventListener("change",e=>b({txt:e.target.checked,json:e.target.checked?s.cfg.json:!0})),r("#ab-retention")?.addEventListener("change",e=>b({retentionDays:Number(e.target.value)})),r("#ab-add-time")?.addEventListener("click",()=>{const e=r("#ab-new-time").value;/^\d{2}:\d{2}$/.test(e)&&b({times:[...s.cfg.times,e]})}),o.querySelectorAll("[data-ab-del]").forEach(e=>e.addEventListener("click",()=>b({times:s.cfg.times.filter(a=>a!==e.dataset.abDel)}))),r("#ab-provider")?.addEventListener("change",async e=>{await re(e.target.value);const a=r("#ab-provider-hint");a&&(a.textContent=G[e.target.value]||"")}),r("#ab-choose")?.addEventListener("click",async()=>{try{await ee(),await l(o)}catch(e){e.name!=="AbortError"&&(r("#ab-msg").textContent=e.message)}}),r("#ab-reconnect")?.addEventListener("click",async()=>{await te(),await l(o)}),r("#ab-forget")?.addEventListener("click",async()=>{await ae(),await l(o)}),r("#ab-run-now")?.addEventListener("click",async()=>{const e=await oe({reason:"MANUAL"});await l(o);const a=o.querySelector("#ab-msg");a&&(a.textContent=`Saved ${e.files.join(" and ")} ${e.destination==="FOLDER"?"in "+e.folderName:"to Downloads"}.`)}),r("#sync-on")?.addEventListener("click",async e=>{const a=r("#sync-msg");e.currentTarget.disabled=!0;try{a.textContent="Connecting to Techmin…";const{requireOnline:i,refreshRemoteStatus:v}=await import("../core/licence.js");await i(),a.textContent="Turning on…";const f=await p.enableSync();await v().catch(()=>{}),await l(o);const N=o.querySelector("#sync-msg");N&&(N.textContent=`Turned on. This computer is counter ${f.counter}. Wait about a minute for Google Drive to upload, then click "Join my centre" on the other computers.`)}catch(i){a.textContent=i.message,e.currentTarget.disabled=!1}}),r("#sync-off")?.addEventListener("click",async()=>{confirm("Turn off sharing on this computer? Its data stays here, but changes will no longer reach the other computers.")&&(await p.disableSync(),await l(o))}),o.querySelectorAll(".sync-remove").forEach(e=>e.addEventListener("click",async()=>{const a=r("#sync-msg");if(confirm(`Remove counter ${e.dataset.counter||""} (${e.dataset.dev}) from this centre?

Do this only if that computer or browser is no longer used. It stops sharing the next time it opens and Techmin stops counting it for your licence. You can join it again later.`))try{const i=await p.removeComputer(e.dataset.dev,I()?.displayName||"");await import("../core/licence.js").then(f=>f.refreshRemoteStatus()).catch(()=>{}),await l(o);const v=o.querySelector("#sync-msg");v&&(v.textContent=`Counter ${i.counter} (${i.dev}) removed. Techmin is told at the next check-in (needs the internet).`)}catch(i){a&&(a.textContent=i.message)}})),r("#sync-now")?.addEventListener("click",async e=>{e.currentTarget.disabled=!0,e.currentTarget.textContent="Syncing…",await p.syncNow(),await l(o)}),Y("restore_backup")||o.querySelectorAll("#bkp-restore-merge-btn, #bkp-restore-replace-btn").forEach(e=>e.remove()),o.querySelector("#bkp-export-json-btn")?.addEventListener("click",async()=>{const e=L(),a=await X(e);V(a,`${j(h?.centreName)}.json`,"application/json"),await l(o)}),o.querySelector("#bkp-export-txt-btn")?.addEventListener("click",async()=>{const e=L(),a=await K(e);V(a,`${j(h?.centreName)}.txt`,"text/plain"),await l(o)});const A=o.querySelector("#bkp-import-file"),E=o.querySelector("#bkp-import-textarea");A?.addEventListener("change",async()=>{const e=A.files?.[0];if(!e)return;const a=await e.text();E&&(E.value=a)}),o.querySelector("#bkp-validate-btn")?.addEventListener("click",async()=>{const e=E?.value||"",a=o.querySelector("#bkp-import-pass")?.value||"";try{g="",n=await _(e,a)}catch(i){n=null,g=i.message}await l(o)});const R=async e=>{if(!o.querySelector("#bkp-confirm-restore-chk")?.checked){g="Please check the confirmation box before restoring the backup.",await l(o);return}await z(n,e),n=null,g="",await l(o)};o.querySelector("#bkp-restore-merge-btn")?.addEventListener("click",()=>R("MERGE")),o.querySelector("#bkp-restore-replace-btn")?.addEventListener("click",()=>R("REPLACE"))}export{l as renderBackupModule};
