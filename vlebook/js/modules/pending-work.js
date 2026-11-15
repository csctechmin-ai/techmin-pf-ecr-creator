import{getAllRecords as b,getRecord as I,putRecord as y,logAudit as A}from"../core/db.js";import{getCurrentUser as k}from"../core/auth.js";import{uid as P,todayISO as u,nowISO as w,formatINR as L,toPaise as v,fromPaise as R,esc as s,buildWhatsAppURL as q}from"../core/utils.js";import{formatWhatsAppTemplate as _,getLang as O}from"../core/i18n.js";const h=["New","Documents pending","Ready for submission","Submitted","Under verification","Under processing","Government approval pending","Approved","Ready for delivery","Delivered","Completed","Rejected","Cancelled"];let c="PENDING_ONLY",$="";async function p(a,o){const[l,n,i,d]=await Promise.all([b("pending_work"),b("customers"),b("services"),I("settings","CENTRE_CONFIG")]),E=[...l].sort((e,t)=>String(e.appDate||"").localeCompare(String(t.appDate||""))),m=$.trim().toLowerCase(),N=E.filter(e=>{const t=["Completed","Delivered","Rejected","Cancelled"].includes(e.status);return c==="PENDING_ONLY"&&t||c!=="ALL"&&c!=="PENDING_ONLY"&&e.status!==c?!1:m?String(e.appRefNo||"").toLowerCase().includes(m)||String(e.customerName||"").toLowerCase().includes(m)||String(e.customerMobile||"").includes(m)||String(e.serviceName||"").toLowerCase().includes(m):!0});a.innerHTML=`
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
                <option value="PENDING_ONLY" ${c==="PENDING_ONLY"?"selected":""}>All Active Pending (${l.filter(e=>!["Completed","Delivered","Rejected","Cancelled"].includes(e.status)).length})</option>
                <option value="ALL" ${c==="ALL"?"selected":""}>All Applications (${l.length})</option>
                ${h.map(e=>`<option value="${s(e)}" ${c===e?"selected":""}>Status: ${s(e)}</option>`).join("")}
              </select>
              <input type="search" class="form-control" id="pw-search" placeholder="Search by Ref #, Customer or Service..." value="${s($)}" style="width:260px;">
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
                ${N.length===0?'<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--color-text-muted);">No matching applications found.</td></tr>':N.map(e=>{const t=_(O(),["Approved","Ready for delivery","Completed"].includes(e.status)?"doc_ready":"app_status",{customerName:e.customerName,centreName:d?.centreName||"VLEBook Centre",serviceName:e.serviceName,appRef:e.appRefNo,status:e.status},d?.whatsappTemplates);return`
                        <tr>
                          <td>
                            <strong style="font-family:var(--font-mono); color:var(--color-navy);">${s(e.appRefNo)}</strong><br>
                            <small style="color:var(--color-text-muted);">Filed: ${s(e.appDate)} | Exp: ${s(e.expectedDate||"—")}</small>
                          </td>
                          <td>
                            <strong>${s(e.customerName)}</strong><br>
                            <small style="color:var(--color-text-muted);">${s(e.customerMobile||"")}</small>
                          </td>
                          <td>
                            <strong>${s(e.serviceName)}</strong><br>
                            <small style="color:var(--color-text-muted);">Staff: ${s(e.assignedStaff||"Operator")} | History: ${(e.statusHistory||[]).length} steps</small>
                          </td>
                          <td class="num">
                            Col: ${L(e.collectedPaise||0)}<br>
                            <small style="color:${(e.pendingPaise||0)>0?"var(--color-danger)":"var(--color-success)"};">
                              Due: ${L(e.pendingPaise||0)}
                            </small>
                          </td>
                          <td>
                            ${e.status==="Cancelled"?`<span class="badge badge-danger">Cancelled</span><br><small style="color:var(--color-text-muted);">${s(e.cancelRemark||"")}${e.cancelledBy?` — ${s(e.cancelledBy)}`:""}${e.cancelledAt?`, ${s(String(e.cancelledAt).slice(0,10))}`:""}</small>`:`<select class="form-control pw-status-change" data-app-id="${s(e.id)}" style="padding:4px 6px; font-size:12px;">
                              ${h.map(r=>`<option value="${s(r)}" ${e.status===r?"selected":""}>${s(r)}</option>`).join("")}
                            </select>`}
                          </td>
                          <td>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                              ${e.billId?'<span class="badge badge-info">Billed</span>':`<button class="btn btn-xs btn-gold" data-convert-bill="${s(e.id)}">Convert to Bill</button>`}
                              <a href="${s(q(e.customerMobile,t))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WA</a>
                              ${["Cancelled","Completed","Delivered"].includes(e.status)?"":`<button class="btn btn-xs btn-danger" data-cancel-work="${s(e.id)}" title="Cancel this work with a remark">Cancel work</button>`}
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
                ${n.map(e=>`<option value="${s(e.id)}" data-name="${s(e.name)}" data-mob="${s(e.mobile)}">${s(e.name)} (${s(e.mobile)})</option>`).join("")}
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
                ${i.map(e=>`<option value="${s(e.id)}" data-name="${s(e.name)}" data-govt="${R(e.govtFeePaise)}" data-chg="${R(e.serviceChargePaise)}">${s(e.name)}</option>`).join("")}
              </select>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Portal Application / Ref # <span class="req">*</span></label>
                <input type="text" class="form-control" name="appRefNo" required placeholder="e.g. EDIST-2026-8812">
              </div>
              <div class="form-group">
                <label class="form-label">Current Status</label>
                <select class="form-control" name="status">
                  ${h.map(e=>`<option value="${s(e)}" ${e==="Submitted"?"selected":""}>${s(e)}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Application Date</label>
                <input type="date" class="form-control" name="appDate" value="${u()}">
              </div>
              <div class="form-group">
                <label class="form-label">Expected Completion</label>
                <input type="date" class="form-control" name="expectedDate" value="${u()}">
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
  `,a.querySelector("#pw-status-filter")?.addEventListener("change",e=>{c=e.target.value,p(a,o)}),a.querySelector("#pw-search")?.addEventListener("input",e=>{$=e.target.value,p(a,o)});const S=a.querySelector("#pw-cust-sel");S?.addEventListener("change",()=>{const e=S.selectedOptions[0];e&&e.value&&(a.querySelector("#pw-cust-name").value=e.getAttribute("data-name")||"",a.querySelector("#pw-cust-mob").value=e.getAttribute("data-mob")||"")}),a.querySelectorAll(".pw-status-change").forEach(e=>{e.addEventListener("change",async()=>{const t=e.getAttribute("data-app-id"),r=l.find(f=>f.id===t);if(!r)return;if(e.value==="Cancelled"){e.value=r.status,await D(r),await p(a,o);return}const g=Array.isArray(r.statusHistory)?[...r.statusHistory]:[];g.push({status:e.value,timestamp:w(),by:k()?.username||""}),await y("pending_work",{...r,status:e.value,statusHistory:g},{notifyAutosave:!0,audit:!1}),await A("WORK_STATUS_CHANGED","pending_work",r.id,`${r.appRefNo||r.id} (${r.serviceName}, ${r.customerName}): ${r.status} → ${e.value}`,{from:r.status,to:e.value}),await p(a,o)})}),a.querySelectorAll("[data-cancel-work]").forEach(e=>{e.addEventListener("click",async()=>{const t=l.find(r=>r.id===e.getAttribute("data-cancel-work"));t&&await D(t)&&await p(a,o)})}),a.querySelectorAll("[data-convert-bill]").forEach(e=>{e.addEventListener("click",()=>{const t=l.find(r=>r.id===e.getAttribute("data-convert-bill"));t&&(t.customerId&&sessionStorage.setItem("vlebook_preselect_customer",t.customerId),sessionStorage.setItem("vlebook_workbench_bill_item",JSON.stringify({id:P("LN"),serviceId:t.serviceId||"SRV-CUSTOM",serviceName:`${t.serviceName} (${t.appRefNo})`,category:"Government & Citizen Services",qty:1,ratePaise:(t.govtFeePaise||0)+(t.serviceChargePaise||v(60)),govtFeePaise:t.govtFeePaise||0,thirdPartyPaise:0,directCostPaise:v(5),commissionPaise:0,discountPaise:0,createPendingTask:!1})),o("billing"))})}),a.querySelector("#pw-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),g=a.querySelector("#pw-srv-sel")?.selectedOptions[0]?.getAttribute("data-name")||"Citizen Service",f=v(t.get("govtFee")),C=v(t.get("serviceCharge")),x=v(t.get("pendingAmount"));await y("pending_work",{id:P("APP"),customerId:t.get("customerId")||"CUST-WALKIN",customerName:t.get("customerName").trim(),customerMobile:t.get("customerMobile").trim(),serviceId:t.get("serviceId"),serviceName:g,appRefNo:t.get("appRefNo").trim(),appDate:t.get("appDate")||u(),submissionDate:t.get("appDate")||u(),expectedDate:t.get("expectedDate")||u(),status:t.get("status")||"Submitted",assignedStaff:d?.ownerName||"Operator",govtFeePaise:f,serviceChargePaise:C,collectedPaise:Math.max(0,f+C-x),pendingPaise:x,statusHistory:[{status:t.get("status")||"Submitted",timestamp:w()}],notes:t.get("notes")||""}),await p(a,o)})}function T(a){return new Promise(o=>{const l=document.createElement("div");l.className="modal-backdrop pw-cancel-modal",l.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;",l.innerHTML=`
      <form class="card" style="max-width:480px;width:100%;margin:0;" role="dialog" aria-modal="true" aria-labelledby="pw-cancel-title">
        <div class="card-header"><div class="card-title" id="pw-cancel-title">Cancel work</div></div>
        <p style="margin:0 0 8px;"><strong>${s(a.appRefNo||"")}</strong> — ${s(a.serviceName||"")}, ${s(a.customerName||"")}</p>
        <label class="form-label" for="pw-cancel-remark">Reason for cancelling <span class="req">*</span></label>
        <textarea id="pw-cancel-remark" class="form-control" rows="3" maxlength="300" required placeholder="e.g. Customer withdrew the application / documents not available"></textarea>
        <div class="form-hint">The reason is saved with the work and in the audit log. This cannot be undone.</div>
        <div id="pw-cancel-err" style="color:var(--color-danger);font-size:13px;min-height:18px;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" class="btn btn-teal" data-close>Keep work</button>
          <button type="submit" class="btn btn-danger">Cancel work</button>
        </div>
      </form>`;const n=i=>{l.remove(),o(i)};l.querySelector("[data-close]").addEventListener("click",()=>n(null)),l.addEventListener("keydown",i=>{i.key==="Escape"&&n(null)}),l.querySelector("form").addEventListener("submit",i=>{i.preventDefault();const d=l.querySelector("#pw-cancel-remark").value.trim();if(d.length<5){l.querySelector("#pw-cancel-err").textContent="Please write the reason (at least 5 characters).";return}n(d)}),document.body.appendChild(l),l.querySelector("#pw-cancel-remark").focus()})}async function D(a){const o=await T(a);if(!o)return!1;const l=k()?.username||"",n=w(),i=Array.isArray(a.statusHistory)?[...a.statusHistory]:[];return i.push({status:"Cancelled",timestamp:n,by:l,remark:o}),await y("pending_work",{...a,status:"Cancelled",cancelRemark:o,cancelledAt:n,cancelledBy:l,statusHistory:i},{notifyAutosave:!0,audit:!1}),await A("WORK_CANCELLED","pending_work",a.id,`Cancelled ${a.appRefNo||a.id} (${a.serviceName}, ${a.customerName}). Reason: ${o}`,{previousStatus:a.status,remark:o}),!0}export{h as APPLICATION_STATUSES,p as renderPendingWorkModule};
