import{getAllRecords as g,getRecord as D,putRecord as $}from"../core/db.js";import{uid as w,todayISO as n,nowISO as P,formatINR as C,toPaise as d,fromPaise as A,esc as s,buildWhatsAppURL as I}from"../core/utils.js";import{formatWhatsAppTemplate as E,getLang as _}from"../core/i18n.js";const f=["New","Documents pending","Ready for submission","Submitted","Under verification","Under processing","Government approval pending","Approved","Ready for delivery","Delivered","Completed","Rejected","Cancelled"];let l="PENDING_ONLY",b="";async function u(a,o){const[i,x,L,v]=await Promise.all([g("pending_work"),g("customers"),g("services"),D("settings","CENTRE_CONFIG")]),R=[...i].sort((e,t)=>String(e.appDate||"").localeCompare(String(t.appDate||""))),c=b.trim().toLowerCase(),y=R.filter(e=>{const t=["Completed","Delivered","Rejected","Cancelled"].includes(e.status);return l==="PENDING_ONLY"&&t||l!=="ALL"&&l!=="PENDING_ONLY"&&e.status!==l?!1:c?String(e.appRefNo||"").toLowerCase().includes(c)||String(e.customerName||"").toLowerCase().includes(c)||String(e.customerMobile||"").includes(c)||String(e.serviceName||"").toLowerCase().includes(c):!0});a.innerHTML=`
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
                <option value="PENDING_ONLY" ${l==="PENDING_ONLY"?"selected":""}>All Active Pending (${i.filter(e=>!["Completed","Delivered","Rejected","Cancelled"].includes(e.status)).length})</option>
                <option value="ALL" ${l==="ALL"?"selected":""}>All Applications (${i.length})</option>
                ${f.map(e=>`<option value="${s(e)}" ${l===e?"selected":""}>Status: ${s(e)}</option>`).join("")}
              </select>
              <input type="search" class="form-control" id="pw-search" placeholder="Search by Ref #, Customer or Service..." value="${s(b)}" style="width:260px;">
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
                ${y.length===0?'<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--color-text-muted);">No matching applications found.</td></tr>':y.map(e=>{const t=E(_(),["Approved","Ready for delivery","Completed"].includes(e.status)?"doc_ready":"app_status",{customerName:e.customerName,centreName:v?.centreName||"VLEBook Centre",serviceName:e.serviceName,appRef:e.appRefNo,status:e.status},v?.whatsappTemplates);return`
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
                            Col: ${C(e.collectedPaise||0)}<br>
                            <small style="color:${(e.pendingPaise||0)>0?"var(--color-danger)":"var(--color-success)"};">
                              Due: ${C(e.pendingPaise||0)}
                            </small>
                          </td>
                          <td>
                            <select class="form-control pw-status-change" data-app-id="${s(e.id)}" style="padding:4px 6px; font-size:12px;">
                              ${f.map(r=>`<option value="${s(r)}" ${e.status===r?"selected":""}>${s(r)}</option>`).join("")}
                            </select>
                          </td>
                          <td>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                              ${e.billId?'<span class="badge badge-info">Billed</span>':`<button class="btn btn-xs btn-gold" data-convert-bill="${s(e.id)}">Convert to Bill</button>`}
                              <a href="${s(I(e.customerMobile,t))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WA</a>
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
                ${x.map(e=>`<option value="${s(e.id)}" data-name="${s(e.name)}" data-mob="${s(e.mobile)}">${s(e.name)} (${s(e.mobile)})</option>`).join("")}
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
                ${L.map(e=>`<option value="${s(e.id)}" data-name="${s(e.name)}" data-govt="${A(e.govtFeePaise)}" data-chg="${A(e.serviceChargePaise)}">${s(e.name)}</option>`).join("")}
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
                  ${f.map(e=>`<option value="${s(e)}" ${e==="Submitted"?"selected":""}>${s(e)}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Application Date</label>
                <input type="date" class="form-control" name="appDate" value="${n()}">
              </div>
              <div class="form-group">
                <label class="form-label">Expected Completion</label>
                <input type="date" class="form-control" name="expectedDate" value="${n()}">
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
  `,a.querySelector("#pw-status-filter")?.addEventListener("change",e=>{l=e.target.value,u(a,o)}),a.querySelector("#pw-search")?.addEventListener("input",e=>{b=e.target.value,u(a,o)});const h=a.querySelector("#pw-cust-sel");h?.addEventListener("change",()=>{const e=h.selectedOptions[0];e&&e.value&&(a.querySelector("#pw-cust-name").value=e.getAttribute("data-name")||"",a.querySelector("#pw-cust-mob").value=e.getAttribute("data-mob")||"")}),a.querySelectorAll(".pw-status-change").forEach(e=>{e.addEventListener("change",async()=>{const t=e.getAttribute("data-app-id"),r=i.find(m=>m.id===t);if(!r)return;const p=Array.isArray(r.statusHistory)?[...r.statusHistory]:[];p.push({status:e.value,timestamp:P()}),await $("pending_work",{...r,status:e.value,statusHistory:p}),await u(a,o)})}),a.querySelectorAll("[data-convert-bill]").forEach(e=>{e.addEventListener("click",()=>{const t=i.find(r=>r.id===e.getAttribute("data-convert-bill"));t&&(t.customerId&&sessionStorage.setItem("vlebook_preselect_customer",t.customerId),sessionStorage.setItem("vlebook_workbench_bill_item",JSON.stringify({id:w("LN"),serviceId:t.serviceId||"SRV-CUSTOM",serviceName:`${t.serviceName} (${t.appRefNo})`,category:"Government & Citizen Services",qty:1,ratePaise:(t.govtFeePaise||0)+(t.serviceChargePaise||d(60)),govtFeePaise:t.govtFeePaise||0,thirdPartyPaise:0,directCostPaise:d(5),commissionPaise:0,discountPaise:0,createPendingTask:!1})),o("billing"))})}),a.querySelector("#pw-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),p=a.querySelector("#pw-srv-sel")?.selectedOptions[0]?.getAttribute("data-name")||"Citizen Service",m=d(t.get("govtFee")),N=d(t.get("serviceCharge")),S=d(t.get("pendingAmount"));await $("pending_work",{id:w("APP"),customerId:t.get("customerId")||"CUST-WALKIN",customerName:t.get("customerName").trim(),customerMobile:t.get("customerMobile").trim(),serviceId:t.get("serviceId"),serviceName:p,appRefNo:t.get("appRefNo").trim(),appDate:t.get("appDate")||n(),submissionDate:t.get("appDate")||n(),expectedDate:t.get("expectedDate")||n(),status:t.get("status")||"Submitted",assignedStaff:v?.ownerName||"Operator",govtFeePaise:m,serviceChargePaise:N,collectedPaise:Math.max(0,m+N-S),pendingPaise:S,statusHistory:[{status:t.get("status")||"Submitted",timestamp:P()}],notes:t.get("notes")||""}),await u(a,o)})}export{f as APPLICATION_STATUSES,u as renderPendingWorkModule};
