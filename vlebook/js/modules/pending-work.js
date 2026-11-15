import{getAllRecords as w,getRecord as D,putRecord as h,logAudit as A}from"../core/db.js";import{updateApplicationRefs as I}from"../core/accounting.js";import{getCurrentUser as R}from"../core/auth.js";import{uid as P,todayISO as v,nowISO as N,formatINR as L,toPaise as f,fromPaise as E,esc as a,buildWhatsAppURL as _}from"../core/utils.js";import{formatWhatsAppTemplate as O,getLang as T}from"../core/i18n.js";const $=["New","Documents pending","Ready for submission","Submitted","Under verification","Under processing","Government approval pending","Approved","Ready for delivery","Delivered","Completed","Rejected","Cancelled"];let p="PENDING_ONLY",k="";async function m(s,i){const[r,c,l,d]=await Promise.all([w("pending_work"),w("customers"),w("services"),D("settings","CENTRE_CONFIG")]),u=[...r].sort((e,t)=>String(e.appDate||"").localeCompare(String(t.appDate||""))),n=k.trim().toLowerCase(),g=u.filter(e=>{const t=["Completed","Delivered","Rejected","Cancelled"].includes(e.status);return p==="PENDING_ONLY"&&t||p!=="ALL"&&p!=="PENDING_ONLY"&&e.status!==p?!1:n?String(e.appRefNo||"").toLowerCase().includes(n)||String(e.ackNo||"").toLowerCase().includes(n)||String(e.trackNo||"").toLowerCase().includes(n)||String(e.customerName||"").toLowerCase().includes(n)||String(e.customerMobile||"").includes(n)||String(e.serviceName||"").toLowerCase().includes(n):!0});s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Application & Pending Work Tracker</h1>
        <p>Track government & citizen service applications from initiation to delivery (Oldest Pending First)</p>
      </div>
    </div>

    <div class="callout">
      <div>
        <strong>Manual Status Tracking:</strong> Application statuses reflect your centre's workflow records. VLEBook does not claim automatic real-time scraping of restricted government portals.
      </div>
    </div>

    <div class="grid-sidebar-right">
      <div>
        <div class="card">
          <div class="card-header">
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <select class="form-control" id="pw-status-filter" style="width:210px;">
                <option value="PENDING_ONLY" ${p==="PENDING_ONLY"?"selected":""}>All Active Pending (${r.filter(e=>!["Completed","Delivered","Rejected","Cancelled"].includes(e.status)).length})</option>
                <option value="ALL" ${p==="ALL"?"selected":""}>All Applications (${r.length})</option>
                ${$.map(e=>`<option value="${a(e)}" ${p===e?"selected":""}>Status: ${a(e)}</option>`).join("")}
              </select>
              <input type="search" class="form-control" id="pw-search" placeholder="Search by Ref #, Customer or Service..." value="${a(k)}" style="width:260px;">
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ref # & Dates</th>
                  <th>Customer</th>
                  <th>Service & Staff</th>
                  <th class="num">Fee / Pending</th>
                  <th>Current Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${g.length===0?'<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--color-text-muted);">No matching applications found.</td></tr>':g.map(e=>{const t=O(T(),["Approved","Ready for delivery","Completed"].includes(e.status)?"doc_ready":"app_status",{customerName:e.customerName,centreName:d?.centreName||"VLEBook Centre",serviceName:e.serviceName,appRef:e.appRefNo,status:e.status},d?.whatsappTemplates);return`
                        <tr>
                          <td>
                            <strong style="font-family:var(--font-mono); color:var(--color-navy);">${a(/^REF-\d+$/.test(e.appRefNo||"")?"No application no. yet":e.appRefNo)}</strong><br>
                            ${e.ackNo?`<small>Ack: <strong style="font-family:var(--font-mono);">${a(e.ackNo)}</strong></small><br>`:""}${e.trackNo?`<small>Tracking: <strong style="font-family:var(--font-mono);">${a(e.trackNo)}</strong></small><br>`:""}
                            <button class="btn btn-xs btn-outline" data-edit-refs="${a(e.id)}" title="Record application, acknowledgement or tracking number">Edit numbers</button><br>
                            <small style="color:var(--color-text-muted);">Filed: ${a(e.appDate)} | Exp: ${a(e.expectedDate||"—")}</small>
                          </td>
                          <td>
                            <strong>${a(e.customerName)}</strong><br>
                            <small style="color:var(--color-text-muted);">${a(e.customerMobile||"")}</small>
                          </td>
                          <td>
                            <strong>${a(e.serviceName)}</strong><br>
                            <small style="color:var(--color-text-muted);">Staff: ${a(e.assignedStaff||"Operator")} | History: ${(e.statusHistory||[]).length} steps</small>
                          </td>
                          <td class="num">
                            Col: ${L(e.collectedPaise||0)}<br>
                            <small style="color:${(e.pendingPaise||0)>0?"var(--color-danger)":"var(--color-success)"};">
                              Due: ${L(e.pendingPaise||0)}
                            </small>
                          </td>
                          <td>
                            ${e.status==="Cancelled"?`<span class="badge badge-danger">Cancelled</span><br><small style="color:var(--color-text-muted);">${a(e.cancelRemark||"")}${e.cancelledBy?` — ${a(e.cancelledBy)}`:""}${e.cancelledAt?`, ${a(String(e.cancelledAt).slice(0,10))}`:""}</small>`:`<select class="form-control pw-status-change" data-app-id="${a(e.id)}" style="padding:4px 6px; font-size:12px;">
                              ${$.map(o=>`<option value="${a(o)}" ${e.status===o?"selected":""}>${a(o)}</option>`).join("")}
                            </select>`}
                          </td>
                          <td>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                              ${e.billId?'<span class="badge badge-info">Billed</span>':`<button class="btn btn-xs btn-gold" data-convert-bill="${a(e.id)}">Convert to Bill</button>`}
                              <a href="${a(_(e.customerMobile,t))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WA</a>
                              ${["Cancelled","Completed","Delivered"].includes(e.status)?"":`<button class="btn btn-xs btn-danger" data-cancel-work="${a(e.id)}" title="Cancel this work with a remark">Cancel work</button>`}
                            </div>
                          </td>
                        </tr>`}).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Log New Application -->
      <div>
        <div class="card" data-autosave-scope="pending_work_form">
          <div class="card-header">
            <div class="card-title">Log New Citizen Application</div>
          </div>
          <form id="pw-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <div class="form-group">
              <label class="form-label">Select Registered Customer</label>
              <select class="form-control" name="customerId" id="pw-cust-sel">
                <option value="">— Or Type Customer Below —</option>
                ${c.map(e=>`<option value="${a(e.id)}" data-name="${a(e.name)}" data-mob="${a(e.mobile)}">${a(e.name)} (${a(e.mobile)})</option>`).join("")}
              </select>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Customer Name <span class="req">*</span></label>
                <input type="text" class="form-control" name="customerName" id="pw-cust-name" required>
              </div>
              <div class="form-group">
                <label class="form-label">Mobile <span class="req">*</span></label>
                <input type="tel" class="form-control" name="customerMobile" id="pw-cust-mob" maxlength="10" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Service <span class="req">*</span></label>
              <select class="form-control" name="serviceId" id="pw-srv-sel">
                ${l.map(e=>`<option value="${a(e.id)}" data-name="${a(e.name)}" data-govt="${E(e.govtFeePaise)}" data-chg="${E(e.serviceChargePaise)}">${a(e.name)}</option>`).join("")}
              </select>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Portal Application / Ref # <span class="req">*</span></label>
                <input type="text" class="form-control" name="appRefNo" required maxlength="60" placeholder="e.g. EDIST-2026-8812">
              </div>
              <div class="form-group">
                <label class="form-label">Acknowledgement No.</label>
                <input type="text" class="form-control" name="ackNo" maxlength="60" placeholder="e.g. PAN ack 881234567890123">
              </div>
              <div class="form-group">
                <label class="form-label">Tracking No.</label>
                <input type="text" class="form-control" name="trackNo" maxlength="60" placeholder="e.g. speed post / courier no.">
              </div>
              <div class="form-group">
                <label class="form-label">Current Status</label>
                <select class="form-control" name="status">
                  ${$.map(e=>`<option value="${a(e)}" ${e==="Submitted"?"selected":""}>${a(e)}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Application Date</label>
                <input type="date" class="form-control" name="appDate" value="${v()}">
              </div>
              <div class="form-group">
                <label class="form-label">Expected Completion</label>
                <input type="date" class="form-control" name="expectedDate" value="${v()}">
              </div>
            </div>
            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Govt Fee (₹)</label>
                <input type="number" step="0.01" class="form-control" name="govtFee" value="30">
              </div>
              <div class="form-group">
                <label class="form-label">Service Chg (₹)</label>
                <input type="number" step="0.01" class="form-control" name="serviceCharge" value="60">
              </div>
              <div class="form-group">
                <label class="form-label">Pending (₹)</label>
                <input type="number" step="0.01" class="form-control" name="pendingAmount" value="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Assigned Staff & Notes</label>
              <input type="text" class="form-control" name="notes" placeholder="Certificate receipt attachment ref or operator note">
            </div>
            <button type="submit" class="btn btn-primary">Save Application Record</button>
          </form>
        </div>
      </div>
    </div>
  `,s.querySelector("#pw-status-filter")?.addEventListener("change",e=>{p=e.target.value,m(s,i)}),s.querySelector("#pw-search")?.addEventListener("input",e=>{k=e.target.value,m(s,i)});const x=s.querySelector("#pw-cust-sel");x?.addEventListener("change",()=>{const e=x.selectedOptions[0];e&&e.value&&(s.querySelector("#pw-cust-name").value=e.getAttribute("data-name")||"",s.querySelector("#pw-cust-mob").value=e.getAttribute("data-mob")||"")}),s.querySelectorAll("[data-edit-refs]").forEach(e=>e.addEventListener("click",async()=>{const t=r.find(o=>o.id===e.getAttribute("data-edit-refs"));t&&await M({appId:t.id},t,`${t.serviceName} — ${t.customerName}${t.invoiceNo?` (Invoice ${t.invoiceNo})`:""}`)&&m(s,i)})),s.querySelectorAll(".pw-status-change").forEach(e=>{e.addEventListener("change",async()=>{const t=e.getAttribute("data-app-id"),o=r.find(y=>y.id===t);if(!o)return;if(e.value==="Cancelled"){e.value=o.status,await q(o),await m(s,i);return}const b=Array.isArray(o.statusHistory)?[...o.statusHistory]:[];b.push({status:e.value,timestamp:N(),by:R()?.username||""}),await h("pending_work",{...o,status:e.value,statusHistory:b},{notifyAutosave:!0,audit:!1}),await A("WORK_STATUS_CHANGED","pending_work",o.id,`${o.appRefNo||o.id} (${o.serviceName}, ${o.customerName}): ${o.status} → ${e.value}`,{from:o.status,to:e.value}),await m(s,i)})}),s.querySelectorAll("[data-cancel-work]").forEach(e=>{e.addEventListener("click",async()=>{const t=r.find(o=>o.id===e.getAttribute("data-cancel-work"));t&&await q(t)&&await m(s,i)})}),s.querySelectorAll("[data-convert-bill]").forEach(e=>{e.addEventListener("click",()=>{const t=r.find(o=>o.id===e.getAttribute("data-convert-bill"));t&&(t.customerId&&sessionStorage.setItem("vlebook_preselect_customer",t.customerId),sessionStorage.setItem("vlebook_workbench_bill_item",JSON.stringify({id:P("LN"),serviceId:t.serviceId||"SRV-CUSTOM",serviceName:`${t.serviceName} (${t.appRefNo})`,category:"Government & Citizen Services",qty:1,ratePaise:(t.govtFeePaise||0)+(t.serviceChargePaise||f(60)),govtFeePaise:t.govtFeePaise||0,thirdPartyPaise:0,directCostPaise:f(5),commissionPaise:0,discountPaise:0,createPendingTask:!1})),i("billing"))})}),s.querySelector("#pw-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),b=s.querySelector("#pw-srv-sel")?.selectedOptions[0]?.getAttribute("data-name")||"Citizen Service",y=f(t.get("govtFee")),S=f(t.get("serviceCharge")),C=f(t.get("pendingAmount"));await h("pending_work",{id:P("APP"),customerId:t.get("customerId")||"CUST-WALKIN",customerName:t.get("customerName").trim(),customerMobile:t.get("customerMobile").trim(),serviceId:t.get("serviceId"),serviceName:b,appRefNo:t.get("appRefNo").trim().slice(0,60),ackNo:String(t.get("ackNo")||"").trim().slice(0,60),trackNo:String(t.get("trackNo")||"").trim().slice(0,60),appDate:t.get("appDate")||v(),submissionDate:t.get("appDate")||v(),expectedDate:t.get("expectedDate")||v(),status:t.get("status")||"Submitted",assignedStaff:d?.ownerName||"Operator",govtFeePaise:y,serviceChargePaise:S,collectedPaise:Math.max(0,y+S-C),pendingPaise:C,statusHistory:[{status:t.get("status")||"Submitted",timestamp:N()}],notes:t.get("notes")||""}),await m(s,i)})}function F(s){return new Promise(i=>{const r=document.createElement("div");r.className="modal-backdrop pw-cancel-modal",r.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;",r.innerHTML=`
      <form class="card" style="max-width:480px;width:100%;margin:0;" role="dialog" aria-modal="true" aria-labelledby="pw-cancel-title">
        <div class="card-header"><div class="card-title" id="pw-cancel-title">Cancel work</div></div>
        <p style="margin:0 0 8px;"><strong>${a(s.appRefNo||"")}</strong> — ${a(s.serviceName||"")}, ${a(s.customerName||"")}</p>
        <label class="form-label" for="pw-cancel-remark">Reason for cancelling <span class="req">*</span></label>
        <textarea id="pw-cancel-remark" class="form-control" rows="3" maxlength="300" required placeholder="e.g. Customer withdrew the application / documents not available"></textarea>
        <div class="form-hint">The reason is saved with the work and in the audit log. This cannot be undone.</div>
        <div id="pw-cancel-err" style="color:var(--color-danger);font-size:13px;min-height:18px;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" class="btn btn-teal" data-close>Keep work</button>
          <button type="submit" class="btn btn-danger">Cancel work</button>
        </div>
      </form>`;const c=l=>{r.remove(),i(l)};r.querySelector("[data-close]").addEventListener("click",()=>c(null)),r.addEventListener("keydown",l=>{l.key==="Escape"&&c(null)}),r.querySelector("form").addEventListener("submit",l=>{l.preventDefault();const d=r.querySelector("#pw-cancel-remark").value.trim();if(d.length<5){r.querySelector("#pw-cancel-err").textContent="Please write the reason (at least 5 characters).";return}c(d)}),document.body.appendChild(r),r.querySelector("#pw-cancel-remark").focus()})}async function q(s){const i=await F(s);if(!i)return!1;const r=R()?.username||"",c=N(),l=Array.isArray(s.statusHistory)?[...s.statusHistory]:[];return l.push({status:"Cancelled",timestamp:c,by:r,remark:i}),await h("pending_work",{...s,status:"Cancelled",cancelRemark:i,cancelledAt:c,cancelledBy:r,statusHistory:l},{notifyAutosave:!0,audit:!1}),await A("WORK_CANCELLED","pending_work",s.id,`Cancelled ${s.appRefNo||s.id} (${s.serviceName}, ${s.customerName}). Reason: ${i}`,{previousStatus:s.status,remark:i}),!0}function M(s,i={},r=""){return new Promise(c=>{const l=document.createElement("div");l.className="modal-backdrop pw-refs-modal",l.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;";const d=n=>a(/^REF-\d+$/.test(n||"")?"":n||"");l.innerHTML=`
      <form class="card" style="max-width:480px;width:100%;margin:0;" role="dialog" aria-modal="true" aria-labelledby="pw-refs-title">
        <div class="card-header"><div class="card-title" id="pw-refs-title">Reference numbers</div></div>
        ${r?`<p style="margin:0 0 8px;" data-no-i18n>${a(r)}</p>`:""}
        <label class="form-label" for="pw-ref-app">Application No.</label><input id="pw-ref-app" class="form-control" maxlength="60" value="${d(i.appRefNo)}">
        <label class="form-label" for="pw-ref-ack">Acknowledgement No.</label><input id="pw-ref-ack" class="form-control" maxlength="60" value="${d(i.ackNo)}">
        <label class="form-label" for="pw-ref-trk">Tracking No.</label><input id="pw-ref-trk" class="form-control" maxlength="60" value="${d(i.trackNo)}">
        <div class="form-hint">Saved with the application and on its invoice (a reprint shows them), and written in the audit log.</div>
        <div id="pw-refs-err" style="color:var(--color-danger);font-size:13px;min-height:18px;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;"><button type="button" class="btn btn-outline" data-close>Close</button><button type="submit" class="btn btn-primary">Save numbers</button></div>
      </form>`;const u=n=>{l.remove(),c(n)};l.querySelector("[data-close]").addEventListener("click",()=>u(!1)),l.addEventListener("keydown",n=>n.key==="Escape"&&u(!1)),l.querySelector("form").addEventListener("submit",async n=>{n.preventDefault();try{await I(s,{appRefNo:l.querySelector("#pw-ref-app").value,ackNo:l.querySelector("#pw-ref-ack").value,trackNo:l.querySelector("#pw-ref-trk").value}),u(!0)}catch(g){l.querySelector("#pw-refs-err").textContent=g.message}}),document.body.appendChild(l),l.querySelector("#pw-ref-app").focus()})}export{$ as APPLICATION_STATUSES,M as editReferenceNumbers,m as renderPendingWorkModule};
