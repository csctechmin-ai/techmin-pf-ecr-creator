import{getAllRecords as h,getRecord as C,putRecord as $,logAudit as R}from"../core/db.js";import{updateApplicationRefs as _}from"../core/accounting.js";import{getCurrentUser as E,can as L}from"../core/auth.js";import{uid as P,todayISO as g,nowISO as x,formatINR as I,toPaise as N,fromPaise as q,esc as a,buildWhatsAppURL as F}from"../core/utils.js";import{formatWhatsAppTemplate as T,getLang as O}from"../core/i18n.js";const k=["New","Documents pending","Ready for submission","Submitted","Under verification","Under processing","Government approval pending","Approved","Ready for delivery","Delivered","Completed","Rejected","Cancelled"];let u="PENDING_ONLY",S="";async function f(s,i){const[l,p,o,m]=await Promise.all([h("pending_work"),h("customers"),h("services"),C("settings","CENTRE_CONFIG")]),v=[...l].sort((e,t)=>String(e.appDate||"").localeCompare(String(t.appDate||""))),n=S.trim().toLowerCase(),b=v.filter(e=>{const t=["Completed","Delivered","Rejected","Cancelled"].includes(e.status);return u==="PENDING_ONLY"&&t||u!=="ALL"&&u!=="PENDING_ONLY"&&e.status!==u?!1:n?String(e.appRefNo||"").toLowerCase().includes(n)||String(e.ackNo||"").toLowerCase().includes(n)||String(e.trackNo||"").toLowerCase().includes(n)||String(e.customerName||"").toLowerCase().includes(n)||String(e.customerMobile||"").includes(n)||String(e.serviceName||"").toLowerCase().includes(n):!0});s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Application & Pending Work Tracker</h1>
        <p>Track government & citizen service applications from initiation to delivery (Oldest Pending First)</p>
      </div>
    </div>

    <div class="callout">
      <div>
        <strong>Manual Status Tracking:</strong> Application statuses reflect your centre's workflow records. VLE360 does not claim automatic real-time scraping of restricted government portals.
      </div>
    </div>

    <div class="grid-sidebar-right">
      <div>
        <div class="card">
          <div class="card-header">
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <select class="form-control" id="pw-status-filter" style="width:210px;">
                <option value="PENDING_ONLY" ${u==="PENDING_ONLY"?"selected":""}>All Active Pending (${l.filter(e=>!["Completed","Delivered","Rejected","Cancelled"].includes(e.status)).length})</option>
                <option value="ALL" ${u==="ALL"?"selected":""}>All Applications (${l.length})</option>
                ${k.map(e=>`<option value="${a(e)}" ${u===e?"selected":""}>Status: ${a(e)}</option>`).join("")}
              </select>
              <input type="search" class="form-control" id="pw-search" placeholder="Search by Ref #, Customer or Service..." value="${a(S)}" style="width:260px;">
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
                ${b.length===0?'<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--color-text-muted);">No matching applications found.</td></tr>':b.map(e=>{const t=T(O(),["Approved","Ready for delivery","Completed"].includes(e.status)?"doc_ready":"app_status",{customerName:e.customerName,centreName:m?.centreName||"VLE360 Centre",serviceName:e.serviceName,appRef:e.appRefNo,status:e.status},m?.whatsappTemplates);return`
                        <tr>
                          <td>
                            <strong style="font-family:var(--font-mono); color:var(--color-navy);">${a(/^REF-\d+$/.test(e.appRefNo||"")?"No application no. yet":e.appRefNo)}</strong><br>
                            ${e.ackNo?`<small>Ack: <strong style="font-family:var(--font-mono);">${a(e.ackNo)}</strong></small><br>`:""}${e.trackNo?`<small>Tracking: <strong style="font-family:var(--font-mono);">${a(e.trackNo)}</strong></small><br>`:""}
                            <button class="btn btn-xs btn-outline" data-edit-refs="${a(e.id)}" title="Record application, acknowledgement or tracking number">Edit numbers</button>
                            <button class="btn btn-xs btn-outline" data-exam-date="${a(e.id)}" title="Remind the customer of the last date, fee date, admit card or exam date">Exam / job date</button><br>
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
                            Col: ${I(e.collectedPaise||0)}<br>
                            <small style="color:${(e.pendingPaise||0)>0?"var(--color-danger)":"var(--color-success)"};">
                              Due: ${I(e.pendingPaise||0)}
                            </small>
                          </td>
                          <td>
                            ${e.status==="Cancelled"?`<span class="badge badge-danger">Cancelled</span><br><small style="color:var(--color-text-muted);">${a(e.cancelRemark||"")}${e.cancelledBy?` — ${a(e.cancelledBy)}`:""}${e.cancelledAt?`, ${a(String(e.cancelledAt).slice(0,10))}`:""}</small>`:`<select class="form-control pw-status-change" data-app-id="${a(e.id)}" style="padding:4px 6px; font-size:12px;">
                              ${k.map(r=>`<option value="${a(r)}" ${e.status===r?"selected":""}>${a(r)}</option>`).join("")}
                            </select>`}
                          </td>
                          <td>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                              ${e.billId?`<span class="badge badge-info">Billed</span>${L("view_books")?` <button class="btn btn-xs btn-outline" data-fee-chain="${a(e.billId)}|${a(e.lineId||"")}" title="Government fee: paid to portal, recovered from customer">Fee chain</button>`:""}${L("record_provider_payment")?` <button class="btn btn-xs btn-outline" data-portal-pay="${a(e.billId)}|${a(e.lineId||"")}" title="Record the fee paid to the portal for this application">Record portal payment</button>`:""}`:`<button class="btn btn-xs btn-gold" data-convert-bill="${a(e.id)}">Convert to Bill</button>`}
                              <a href="${a(F(e.customerMobile,t))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WA</a>
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
                ${p.map(e=>`<option value="${a(e.id)}" data-name="${a(e.name)}" data-mob="${a(e.mobile)}">${a(e.name)} (${a(e.mobile)})</option>`).join("")}
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
                ${o.map(e=>`<option value="${a(e.id)}" data-name="${a(e.name)}" data-govt="${q(e.govtFeePaise)}" data-chg="${q(e.serviceChargePaise)}">${a(e.name)}</option>`).join("")}
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
                  ${k.map(e=>`<option value="${a(e)}" ${e==="Submitted"?"selected":""}>${a(e)}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Application Date</label>
                <input type="date" class="form-control" name="appDate" value="${g()}">
              </div>
              <div class="form-group">
                <label class="form-label">Expected Completion</label>
                <input type="date" class="form-control" name="expectedDate" value="${g()}">
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
  `,s.querySelector("#pw-status-filter")?.addEventListener("change",e=>{u=e.target.value,f(s,i)}),s.querySelector("#pw-search")?.addEventListener("input",e=>{S=e.target.value,f(s,i)});const A=s.querySelector("#pw-cust-sel");A?.addEventListener("change",()=>{const e=A.selectedOptions[0];e&&e.value&&(s.querySelector("#pw-cust-name").value=e.getAttribute("data-name")||"",s.querySelector("#pw-cust-mob").value=e.getAttribute("data-mob")||"")}),s.querySelectorAll("[data-fee-chain]").forEach(e=>e.addEventListener("click",async()=>{const[t,r]=e.getAttribute("data-fee-chain").split("|"),{showFeeChain:c}=await import("./books.js");c(t,r||null).catch(d=>alert(d.message))})),s.querySelectorAll("[data-portal-pay]").forEach(e=>e.addEventListener("click",async()=>{const[t,r]=e.getAttribute("data-portal-pay").split("|"),c=await C("bills",t),d=(c?.items||[]).find(w=>w.id===r)||{},{recordPortalPaymentDialog:y}=await import("./books-ops.js");y({billId:t,lineId:r,feeType:"GOVT",amountPaise:d.lineGovtFeePaise||0,customerId:c?.customerId,customerName:c?.customerName,appRef:d.appRefNo||"",serviceName:d.serviceName},()=>{})})),s.querySelectorAll("[data-exam-date]").forEach(e=>e.addEventListener("click",async()=>{const t=(await h("pending_work")).find(d=>d.id===e.getAttribute("data-exam-date"));if(!t)return;const{addReminderFor:r}=await import("./reminders.js"),c=/^REF-\d+$/.test(t.appRefNo||"")?"":t.appRefNo||"";r({customerId:t.customerId||"",customerName:t.customerName||"",mobile:t.customerMobile||"",category:"EXAM",itemRef:[t.serviceName,c].filter(Boolean).join(" · ").slice(0,80),notes:"Last date / fee date / admit card / exam date — write which one"})})),s.querySelectorAll("[data-edit-refs]").forEach(e=>e.addEventListener("click",async()=>{const t=l.find(r=>r.id===e.getAttribute("data-edit-refs"));t&&await j({appId:t.id},t,`${t.serviceName} — ${t.customerName}${t.invoiceNo?` (Invoice ${t.invoiceNo})`:""}`)&&f(s,i)})),s.querySelectorAll(".pw-status-change").forEach(e=>{e.addEventListener("change",async()=>{const t=e.getAttribute("data-app-id"),r=l.find(d=>d.id===t);if(!r)return;if(e.value==="Cancelled"){e.value=r.status,await D(r),await f(s,i);return}const c=Array.isArray(r.statusHistory)?[...r.statusHistory]:[];c.push({status:e.value,timestamp:x(),by:E()?.username||""}),await $("pending_work",{...r,status:e.value,statusHistory:c},{notifyAutosave:!0,audit:!1}),await R("WORK_STATUS_CHANGED","pending_work",r.id,`${r.appRefNo||r.id} (${r.serviceName}, ${r.customerName}): ${r.status} → ${e.value}`,{from:r.status,to:e.value}),await f(s,i)})}),s.querySelectorAll("[data-cancel-work]").forEach(e=>{e.addEventListener("click",async()=>{const t=l.find(r=>r.id===e.getAttribute("data-cancel-work"));t&&await D(t)&&await f(s,i)})}),s.querySelectorAll("[data-convert-bill]").forEach(e=>{e.addEventListener("click",()=>{const t=l.find(r=>r.id===e.getAttribute("data-convert-bill"));t&&(t.customerId&&sessionStorage.setItem("vlebook_preselect_customer",t.customerId),sessionStorage.setItem("vlebook_workbench_bill_item",JSON.stringify({id:P("LN"),serviceId:t.serviceId||"SRV-CUSTOM",serviceName:`${t.serviceName} (${t.appRefNo})`,category:"Government & Citizen Services",qty:1,ratePaise:(t.govtFeePaise||0)+(t.serviceChargePaise||N(60)),govtFeePaise:t.govtFeePaise||0,thirdPartyPaise:0,commissionPaise:0,discountPaise:0,createPendingTask:!1})),i("billing"))})}),s.querySelector("#pw-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),c=s.querySelector("#pw-srv-sel")?.selectedOptions[0]?.getAttribute("data-name")||"Citizen Service",d=N(t.get("govtFee")),y=N(t.get("serviceCharge")),w=N(t.get("pendingAmount"));await $("pending_work",{id:P("APP"),customerId:t.get("customerId")||"CUST-WALKIN",customerName:t.get("customerName").trim(),customerMobile:t.get("customerMobile").trim(),serviceId:t.get("serviceId"),serviceName:c,appRefNo:t.get("appRefNo").trim().slice(0,60),ackNo:String(t.get("ackNo")||"").trim().slice(0,60),trackNo:String(t.get("trackNo")||"").trim().slice(0,60),appDate:t.get("appDate")||g(),submissionDate:t.get("appDate")||g(),expectedDate:t.get("expectedDate")||g(),status:t.get("status")||"Submitted",assignedStaff:m?.ownerName||"Operator",govtFeePaise:d,serviceChargePaise:y,collectedPaise:Math.max(0,d+y-w),pendingPaise:w,statusHistory:[{status:t.get("status")||"Submitted",timestamp:x()}],notes:t.get("notes")||""}),await f(s,i)})}function M(s){return new Promise(i=>{const l=document.createElement("div");l.className="modal-backdrop pw-cancel-modal",l.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;",l.innerHTML=`
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
      </form>`;const p=o=>{l.remove(),i(o)};l.querySelector("[data-close]").addEventListener("click",()=>p(null)),l.addEventListener("keydown",o=>{o.key==="Escape"&&p(null)}),l.querySelector("form").addEventListener("submit",o=>{o.preventDefault();const m=l.querySelector("#pw-cancel-remark").value.trim();if(m.length<5){l.querySelector("#pw-cancel-err").textContent="Please write the reason (at least 5 characters).";return}p(m)}),document.body.appendChild(l),l.querySelector("#pw-cancel-remark").focus()})}async function D(s){const i=await M(s);if(!i)return!1;const l=E()?.username||"",p=x(),o=Array.isArray(s.statusHistory)?[...s.statusHistory]:[];return o.push({status:"Cancelled",timestamp:p,by:l,remark:i}),await $("pending_work",{...s,status:"Cancelled",cancelRemark:i,cancelledAt:p,cancelledBy:l,statusHistory:o},{notifyAutosave:!0,audit:!1}),await R("WORK_CANCELLED","pending_work",s.id,`Cancelled ${s.appRefNo||s.id} (${s.serviceName}, ${s.customerName}). Reason: ${i}`,{previousStatus:s.status,remark:i}),!0}function j(s,i={},l=""){return new Promise(p=>{const o=document.createElement("div");o.className="modal-backdrop pw-refs-modal",o.style.cssText="position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;";const m=n=>a(/^REF-\d+$/.test(n||"")?"":n||"");o.innerHTML=`
      <form class="card" style="max-width:480px;width:100%;margin:0;" role="dialog" aria-modal="true" aria-labelledby="pw-refs-title">
        <div class="card-header"><div class="card-title" id="pw-refs-title">Reference numbers</div></div>
        ${l?`<p style="margin:0 0 8px;" data-no-i18n>${a(l)}</p>`:""}
        <label class="form-label" for="pw-ref-app">Application No.</label><input id="pw-ref-app" class="form-control" maxlength="60" value="${m(i.appRefNo)}">
        <label class="form-label" for="pw-ref-ack">Acknowledgement No.</label><input id="pw-ref-ack" class="form-control" maxlength="60" value="${m(i.ackNo)}">
        <label class="form-label" for="pw-ref-trk">Tracking No.</label><input id="pw-ref-trk" class="form-control" maxlength="60" value="${m(i.trackNo)}">
        <div class="form-hint">Saved with the application and on its invoice (a reprint shows them), and written in the audit log.</div>
        <div id="pw-refs-err" style="color:var(--color-danger);font-size:13px;min-height:18px;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;"><button type="button" class="btn btn-outline" data-close>Close</button><button type="submit" class="btn btn-primary">Save numbers</button></div>
      </form>`;const v=n=>{o.remove(),p(n)};o.querySelector("[data-close]").addEventListener("click",()=>v(!1)),o.addEventListener("keydown",n=>n.key==="Escape"&&v(!1)),o.querySelector("form").addEventListener("submit",async n=>{n.preventDefault();try{await _(s,{appRefNo:o.querySelector("#pw-ref-app").value,ackNo:o.querySelector("#pw-ref-ack").value,trackNo:o.querySelector("#pw-ref-trk").value}),v(!0)}catch(b){o.querySelector("#pw-refs-err").textContent=b.message}}),document.body.appendChild(o),o.querySelector("#pw-ref-app").focus()})}export{k as APPLICATION_STATUSES,j as editReferenceNumbers,f as renderPendingWorkModule};
