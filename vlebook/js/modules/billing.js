import{getCurrentUser as ve,can as le}from"../core/auth.js";import{logoImgTag as oe}from"../core/branding.js";import{getAllRecords as _,getRecord as ne,putRecord as re,deleteRecord as me}from"../core/db.js";import{calculateInvoiceLine as be,createMultiServiceInvoice as ge,cancelInvoiceWithReversal as fe,getCustomer360Profile as ye,notifyCrossTabSync as he}from"../core/accounting.js";import{SERVICE_CATEGORIES as xe}from"./services.js";import{uid as N,todayISO as de,nowISO as Pe,formatINR as l,fromPaise as P,toPaise as f,amountInWordsINR as J,esc as i,buildWhatsAppURL as $e,generateSimplePDFBlob as Se,downloadFile as Ce,printDocumentSheet as Ae}from"../core/utils.js";import{formatWhatsAppTemplate as Ie,getLang as we}from"../core/i18n.js";let c=[],p=null,y="NONE",C=!0,k=null,L="A4",A=null,M=null,Y=!1,$={mobile:"",name:""},x=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function B(){await re("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:c,selectedCustomerId:p?.id||null,typedCustomer:$,gstMode:y,applyRoundOff:C,savedAt:Pe()})}async function d(t,s){const[b,u,I,S,m,pe]=await Promise.all([_("services"),_("customers"),_("bills"),ne("settings","CENTRE_CONFIG"),ne("drafts","DRAFT_BILLING_VISIT"),_("staff")]),w=pe.filter(e=>e.active!==!1).sort((e,a)=>e.name.localeCompare(a.name));x&&!w.some(e=>e.id===x)&&(x="");const R=ve();R?.staffId&&R.role==="OPERATOR"&&w.some(e=>e.id===R.staffId)&&(x=R.staffId),!Y&&m&&Array.isArray(m.currentLines)&&m.currentLines.length>0&&(c=m.currentLines,m.selectedCustomerId&&(p=u.find(e=>e.id===m.selectedCustomerId)||null),m.typedCustomer&&($={mobile:"",name:"",...m.typedCustomer}),m.gstMode&&(y=m.gstMode),typeof m.applyRoundOff=="boolean"&&(C=m.applyRoundOff),Y=!0),Y=!0;const X=sessionStorage.getItem("vlebook_preview_bill_id");X&&(sessionStorage.removeItem("vlebook_preview_bill_id"),k=X);const Z=sessionStorage.getItem("vlebook_preselect_customer");if(Z){sessionStorage.removeItem("vlebook_preselect_customer");const e=u.find(a=>a.id===Z);e&&(p=e)}const ee=sessionStorage.getItem("vlebook_workbench_bill_item");if(ee){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(ee);c.push(e)}catch{}}const F=p?await ye(p.id):null,z=F?.metrics?.availableAdvancePaise||0,q=c.map(e=>be(e,y)),te=q.reduce((e,a)=>e+a.lineGovtFeePaise,0),ae=q.reduce((e,a)=>e+a.lineServiceChargePaise,0),ie=q.reduce((e,a)=>e+a.totalTaxPaise,0),O=te+ae+ie,T=C?Math.round(O/100)*100:O,ue=T-O,D=[...I].sort((e,a)=>String(a.createdAt||a.date).localeCompare(String(e.createdAt||e.date))),n=k?I.find(e=>e.id===k):D[0];t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Unified Counter Multi-Service Billing & Invoicing</h1>
        <p>Bill multiple services in one citizen visit, separate government fees from service revenue, and print A4 or Thermal receipts</p>
      </div>
      <div class="module-actions">
        <span class="badge badge-info">Next Invoice: ${i(S?.invoicePrefix||"VLE")}-${S?.nextInvoiceNumber||1001}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Create Multi-Service Counter Invoice</div>
        <div style="display:flex; gap:8px; align-items:center;">
          <label class="form-label" style="margin:0;">Tax Mode:</label>
          <select class="form-control" id="bill-gst-mode" style="width:190px;">
            <option value="NONE" ${y==="NONE"?"selected":""}>Non-GST Bill</option>
            <option value="INTRA" ${y==="INTRA"?"selected":""}>GST Intra-State (CGST+SGST)</option>
            <option value="INTER" ${y==="INTER"?"selected":""}>GST Inter-State (IGST)</option>
          </select>
        </div>
      </div>

      <!-- Customer Lookup Strip -->
      <div class="grid-3" style="margin-bottom:14px; background:var(--color-surface-alt); padding:12px; border-radius:var(--radius-sm);">
        <div class="form-group">
          <label class="form-label">Customer Mobile (Auto-Lookup) <span class="req">*</span></label>
          <input type="tel" class="form-control" id="bill-cust-mobile" maxlength="10" placeholder="Enter 10-digit mobile..." value="${i(p?.mobile||$.mobile||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Customer Full Name <span class="req">*</span></label>
          <input type="text" class="form-control" id="bill-cust-name" placeholder="Citizen Full Name" value="${i(p?.name||$.name||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="bill-date" value="${de()}">
        </div>
      </div>

      ${F?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${i(p.name)} (${i(p.id)}) |
                Previous Visits: <strong>${F.metrics.totalVisits}</strong> |
                Pending Due: <strong>${l(F.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${l(z)}</strong>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-clear-cust">Clear</button>
            </div>`:""}

      <!-- Quick Service Picker Bar -->
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-service-select" style="max-width:340px;">
          ${b.filter(e=>e.active!==!1).map(e=>`<option value="${i(e.id)}" ${M===e.id?"selected":""}>${i(e.name)} — ${l(e.customerPricePaise)} (Govt: ${l(e.govtFeePaise)})</option>`).join("")}
        </select>
        <button type="button" class="btn btn-teal" id="bill-add-line-btn">Add Service to Visit</button>
        <button type="button" class="btn btn-outline" id="bill-quick-edit-srv-btn" title="Edit the selected service in the catalogue">Edit Selected Service</button>
        <button type="button" class="btn btn-gold" id="bill-quick-new-srv-btn" title="Create a brand-new service and add to list">Create New Service</button>
        <button type="button" class="btn btn-outline" id="bill-add-five-demo-btn" title="Add 5 common citizen services in one click">5-Service Preset</button>
      </div>

      ${A?(()=>{const e=A==="EDIT"?b.find(a=>a.id===M)||b[0]:null;return`
              <div class="card" style="background:var(--color-surface-alt); border:2px solid var(--color-teal); margin-bottom:14px;">
                <div class="card-header" style="padding-bottom:8px; margin-bottom:10px;">
                  <div class="card-title" style="font-size:14px;">
                    ${e?`Edit Present Service: ${i(e.name)}`:"Create New Service & Add to Service List"}
                  </div>
                  <button type="button" class="btn btn-xs btn-outline" id="bill-close-quick-srv">Close</button>
                </div>
                <form id="bill-quick-srv-form" class="grid-3" style="gap:10px; align-items:end;">
                  <input type="hidden" name="id" value="${i(e?.id||"")}">
                  <div class="form-group">
                    <label class="form-label">Service Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="name" required placeholder="e.g. Color Print / Birth Certificate" value="${i(e?.name||"")}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-control" name="category">
                      ${xe.map(a=>`<option value="${i(a)}" ${e?.category===a?"selected":""}>${i(a)}</option>`).join("")}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                    <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" required value="${e?P(e.customerPricePaise):"100"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Govt / Challan Fee (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="govtFee" value="${e?P(e.govtFeePaise):"0"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Direct Cost (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="directCost" value="${e?P(e.directCostPaise||0):"5"}">
                  </div>
                  <div>
                    <button type="submit" class="btn btn-primary" style="width:100%;">
                      ${e?"Save Service Changes":"Create Service & Add to Bill"}
                    </button>
                  </div>
                </form>
              </div>`})():""}

      <!-- Multi-Service Line Items Table -->
      <div class="table-wrap" style="margin-bottom:14px;">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Service Particulars</th>
              <th style="width:75px;">Qty</th>
              <th style="width:105px;">Rate (₹)</th>
              <th style="width:105px;">Govt Fee (₹)</th>
              <th style="width:95px;">Discount (₹)</th>
              <th class="num">Service Rev</th>
              <th class="num">Line Total</th>
              <th>Track App?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${q.map((e,a)=>`
              <tr>
                <td>${a+1}</td>
                <td>
                  <input type="text" class="form-control" data-ln-field="serviceName" data-idx="${a}" value="${i(e.serviceName)}">
                </td>
                <td>
                  <input type="number" min="1" class="form-control" data-ln-field="qty" data-idx="${a}" value="${e.qty}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="rate" data-idx="${a}" value="${P(e.unitRatePaise)}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="govtFee" data-idx="${a}" value="${P(e.unitGovtFeePaise)}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="discount" data-idx="${a}" value="${P(e.discountPaise)}">
                </td>
                <td class="num" style="color:var(--color-success); font-weight:600;">${l(e.lineServiceChargePaise)}</td>
                <td class="num"><strong>${l(e.lineTotalPaise)}</strong></td>
                <td>
                  <input type="checkbox" data-ln-field="createPendingTask" data-idx="${a}" ${e.createPendingTask?"checked":""} title="Create Application Tracking record">
                </td>
                <td>
                  <button type="button" class="btn btn-xs btn-danger" data-remove-ln="${a}">×</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>

      <!-- Invoice Totals & Payment Settlement Bar -->
      <div class="grid-2" style="align-items:start;">
        <div class="card" style="background:var(--color-surface-alt); margin-bottom:0;">
          <div class="card-title" style="font-size:13.5px; margin-bottom:10px;">Payment Allocation & Settlement</div>
          <div class="form-group" style="margin-bottom:10px;">
            <label class="form-label">Handled by (Staff)</label>
            <select class="form-control" id="bill-staff">
              <option value="">— Owner / No staff commission —</option>
              ${w.map(e=>`<option value="${i(e.id)}" ${e.id===x?"selected":""}>${i(e.name)}${e.role?` (${i(e.role)})`:""}</option>`).join("")}
            </select>
            ${w.length===0?'<span class="form-hint">Add staff in Staff Commission to track commission per bill.</span>':""}
          </div>
          <div class="grid-2" style="gap:10px;">
            <div class="form-group">
              <label class="form-label">Payment Mode</label>
              <select class="form-control" id="bill-pay-mode">
                <option value="CASH">Cash</option>
                <option value="UPI">UPI QR</option>
                <option value="BANK">Bank Transfer / NEFT</option>
                <option value="CARD">Card / POS</option>
                <option value="WALLET">CSC / Portal Wallet</option>
                <option value="AEPS">AEPS Settlement</option>
                <option value="CREDIT">Full Credit (Unpaid)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Adjust Customer Advance (₹)</label>
              <input type="number" step="0.01" min="0" max="${P(z)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${l(z)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount Paid Now (₹)</label>
              <input type="number" step="0.01" min="0" class="form-control" id="bill-paid-now" value="${P(T).toFixed(2)}">
              <span class="form-hint">Enter lower amount for partial payment / credit due</span>
            </div>
            <div class="form-group">
              <label class="form-label">Balance Due (₹)</label>
              <input type="text" class="form-control" id="bill-due-preview" readonly value="₹0.00" style="font-weight:700; color:var(--color-danger);">
            </div>
          </div>
          <div class="form-group" style="margin-top:8px;">
            <input type="text" class="form-control" id="bill-notes" placeholder="Optional invoice remark / application references">
          </div>
        </div>

        <div class="card" style="background:var(--color-surface-alt); margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Government / Challan Pass-through:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${l(te)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${l(ae)}</strong>
          </div>
          ${y!=="NONE"?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${y==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${l(ie)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <label><input type="checkbox" id="bill-roundoff-chk" ${C?"checked":""}> Apply Round-off</label>
            <span>${l(ue)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${l(T)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${i(J(T))}</em>
          </div>
          <button type="button" class="btn btn-primary" id="bill-submit-btn" style="width:100%; padding:10px; font-size:14px;">
            Generate Invoice & Post to Ledger
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Invoice Register & Print / Thermal Receipt Preview -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Recent Invoices (${D.length})</div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th class="num">Total</th>
                <th class="num">Paid</th>
                <th class="num">Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${D.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':D.map(e=>`
                    <tr>
                      <td><strong>${i(e.invoiceNo)}</strong><br><small style="color:var(--color-text-muted);">${i(e.date)}</small></td>
                      <td>
                        <a href="#" data-jump-c360="${i(e.customerId)}" style="color:var(--color-teal); font-weight:600;">${i(e.customerName)}</a><br>
                        <small style="color:var(--color-text-muted);">${(e.items||[]).length} services</small>
                      </td>
                      <td class="num">${l(e.grandTotalPaise)}</td>
                      <td class="num" style="color:var(--color-success);">${l(e.paidPaise)}</td>
                      <td class="num" style="color:${e.duePaise>0?"var(--color-danger)":"var(--color-text-muted)"};">${l(e.duePaise)}</td>
                      <td>
                        <span class="badge ${e.status==="PAID"?"badge-success":e.status==="PARTIAL"?"badge-warning":e.status==="CANCELLED"?"badge-neutral":"badge-danger"}">${i(e.status)}</span>
                      </td>
                      <td>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                          <button class="btn btn-xs btn-teal" data-view-bill="${i(e.id)}">View/Print</button>
                          <button class="btn btn-xs btn-outline" data-dup-bill="${i(e.id)}" title="Duplicate items into new bill">Dup</button>
                          ${e.status!=="CANCELLED"&&le("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${i(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
                        </div>
                      </td>
                    </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Invoice & Thermal Receipt Preview</div>
          ${n?`<div style="display:flex; gap:6px; flex-wrap:wrap;">
                  <div class="pill-tabs">
                    <button class="pill-tab ${L==="A4"?"active":""}" data-fmt="A4">A4 Invoice</button>
                    <button class="pill-tab ${L==="THERMAL"?"active":""}" data-fmt="THERMAL">80mm Thermal</button>
                  </div>
                  <button class="btn btn-xs btn-primary" id="bill-print-btn">Print</button>
                  <button class="btn btn-xs btn-outline" id="bill-pdf-btn">PDF</button>
                  <a href="${i($e(n.customerMobile,Ie(we(),"invoice",{customerName:n.customerName,centreName:S?.centreName||"VLEBook Centre",invoiceNo:n.invoiceNo,totalAmount:l(n.grandTotalPaise),paidAmount:l(n.paidPaise),dueAmount:l(n.duePaise)},S?.whatsappTemplates)))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${n?ce(n,S,L):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const G=t.querySelector("#bill-cust-mobile"),V=t.querySelector("#bill-cust-name");G?.addEventListener("input",()=>{const e=G.value.replace(/\D/g,"").slice(-10);if(p||($.mobile=G.value),e.length===10){const a=u.find(o=>o.mobile===e);a&&(p=a,d(t,s))}}),V?.addEventListener("input",()=>{p||($.name=V.value)}),t.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{p=null,$={mobile:"",name:""},d(t,s)}),t.querySelector("#bill-gst-mode")?.addEventListener("change",e=>{y=e.target.value,d(t,s)}),t.querySelector("#bill-roundoff-chk")?.addEventListener("change",e=>{C=e.target.checked,d(t,s)}),t.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=t.querySelector("#bill-add-service-select")?.value,a=b.find(o=>o.id===e)||b[0];a&&(c.push({id:N("LN"),serviceId:a.id,serviceName:a.name,category:a.category,qty:1,ratePaise:a.customerPricePaise,govtFeePaise:a.govtFeePaise,thirdPartyPaise:a.thirdPartyPaise||0,directCostPaise:a.directCostPaise||0,commissionPaise:a.commissionPaise||0,discountPaise:0,gstApplicable:a.gstApplicable,gstRate:a.gstRate||18,createPendingTask:a.category==="Government & Citizen Services"}),B().catch(()=>{}),d(t,s))}),t.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{M=t.querySelector("#bill-add-service-select")?.value||b[0]?.id,A="EDIT",d(t,s)}),t.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{A="CREATE",d(t,s)}),t.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{A=null,d(t,s)}),t.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const a=new FormData(e.target),o=!a.get("id"),v=f(a.get("customerPrice")),j=f(a.get("govtFee")),Q=f(a.get("directCost")),h=o?null:b.find(g=>g.id===a.get("id")),r=await re("services",{...h,id:a.get("id")||N("SRV"),name:a.get("name").trim(),category:a.get("category"),state:h?.state||"Kerala / All India",customerPricePaise:v,govtFeePaise:j,thirdPartyPaise:0,serviceChargePaise:Math.max(0,v-j),directCostPaise:Q,commissionPaise:h?.commissionPaise||0,gstApplicable:h?.gstApplicable||!1,gstRate:h?.gstRate||18,turnaroundTime:h?.turnaroundTime||"Same Day",checklist:h?.checklist||"",active:!0});M=r.id,A=null,o?c.push({id:N("LN"),serviceId:r.id,serviceName:r.name,category:r.category,qty:1,ratePaise:r.customerPricePaise,govtFeePaise:r.govtFeePaise,thirdPartyPaise:0,directCostPaise:r.directCostPaise||0,commissionPaise:0,discountPaise:0,gstApplicable:!1,gstRate:18,createPendingTask:r.category==="Government & Citizen Services"}):c.forEach(g=>{g.serviceId===r.id&&(g.serviceName=r.name,g.ratePaise=r.customerPricePaise,g.govtFeePaise=r.govtFeePaise,g.directCostPaise=r.directCostPaise||0)}),he("SERVICE_UPDATED",{id:r.id}),await d(t,s)}),t.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{c=b.slice(0,5).map(e=>({id:N("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,directCostPaise:e.directCostPaise||0,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:e.gstApplicable,gstRate:e.gstRate||18,createPendingTask:e.category==="Government & Citizen Services"})),d(t,s)}),t.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const a=Number(e.getAttribute("data-idx")),o=e.getAttribute("data-ln-field"),v=c[a];v&&(o==="serviceName"?v.serviceName=e.value:o==="qty"?v.qty=Math.max(1,Number(e.value)||1):o==="rate"?v.ratePaise=f(e.value):o==="govtFee"?v.govtFeePaise=f(e.value):o==="discount"?v.discountPaise=f(e.value):o==="createPendingTask"&&(v.createPendingTask=e.checked),await B(),d(t,s))})}),t.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const a=Number(e.getAttribute("data-remove-ln"));a>=0&&a<c.length&&(c.splice(a,1),await B(),d(t,s))})});const E=t.querySelector("#bill-paid-now"),W=t.querySelector("#bill-advance-adj"),se=t.querySelector("#bill-due-preview"),H=t.querySelector("#bill-pay-mode");t.querySelector("#bill-staff")?.addEventListener("change",e=>{x=e.target.value;try{localStorage.setItem("vlebook_last_staff",x)}catch{}});const U=()=>{const e=f(E?.value||0),a=f(W?.value||0),o=Math.max(0,T-e-a);se&&(se.value=l(o))};E?.addEventListener("input",U),W?.addEventListener("input",U),H?.addEventListener("change",()=>{H.value==="CREDIT"&&E&&(E.value="0.00",U())}),t.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=G?.value.trim()||"",a=V?.value.trim()||"Walk-in Citizen",o=t.querySelector("#bill-date")?.value||de(),v=H?.value||"CASH",j=v==="CREDIT"?0:f(E?.value||0),Q=f(W?.value||0),h=t.querySelector("#bill-notes")?.value||"";if(c.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const r=e.replace(/\D/g,"");if(r&&r.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}let g;try{g=await ge({date:o,customerId:p?.id||null,customerName:a,customerMobile:e,gstMode:y,applyRoundOff:C,items:c,paidPaise:j,advanceAdjustedPaise:Q,paymentMode:v,staffId:x||null,staffName:w.find(K=>K.id===x)?.name||"",notes:h})}catch(K){alert(K.message||"Could not create the invoice.");return}k=g.id,c=[],p=null,$={mobile:"",name:""},await me("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await d(t,s)}),t.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{k=e.getAttribute("data-view-bill"),d(t,s)})}),t.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=I.find(o=>o.id===e.getAttribute("data-dup-bill"));a&&(c=(a.items||[]).map(o=>({...o,id:N("LN"),ratePaise:o.unitRatePaise,govtFeePaise:o.unitGovtFeePaise,thirdPartyPaise:o.unitThirdPartyPaise,directCostPaise:o.unitDirectCostPaise,commissionPaise:o.unitCommissionPaise})),await B(),d(t,s))})}),t.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-cancel-bill");if(!le("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await fe(a,"Operator issued cancellation & credit note"),await d(t,s)})}),t.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",a=>{a.preventDefault();const o=e.getAttribute("data-jump-c360");s("customers",o)})}),t.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{L=e.getAttribute("data-fmt"),d(t,s)})}),t.querySelector("#bill-print-btn")?.addEventListener("click",()=>{n&&Ae(ce(n,S,L))}),t.querySelector("#bill-pdf-btn")?.addEventListener("click",()=>{if(!n)return;const e=Se(`${S?.centreName||"VLEBook Digital Service Centre"} - Invoice ${n.invoiceNo}`,`Customer: ${n.customerName} (${n.customerMobile||"N/A"}) | Date: ${n.date} | Status: ${n.status}`,["Service","Qty","Govt Fee","Service Chg","Tax","Line Total"],(n.items||[]).map(a=>[a.serviceName.slice(0,24),String(a.qty),(a.lineGovtFeePaise/100).toFixed(2),(a.lineServiceChargePaise/100).toFixed(2),(a.totalTaxPaise/100).toFixed(2),(a.lineTotalPaise/100).toFixed(2)]),[`Grand Total: Rs.${(n.grandTotalPaise/100).toFixed(2)} (${J(n.grandTotalPaise)})`,`Paid: Rs.${(n.paidPaise/100).toFixed(2)} | Advance Adj: Rs.${((n.advanceAdjustedPaise||0)/100).toFixed(2)} | Balance Due: Rs.${(n.duePaise/100).toFixed(2)}`]);Ce(e,`Invoice_${n.invoiceNo}.pdf`,"application/pdf")})}function ce(t,s,b="A4"){return b==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${oe(s,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${i(s?.centreName||"VLEBook Centre")}</strong><br>
          <span>${i(s?.address||"")}</span><br>
          <span>Mob: ${i(s?.mobile||"")}</span>
          ${s?.gstin?`<br><span>GSTIN: ${i(s.gstin)}</span>`:""}
        </div>
        <div>
          <strong>Inv: ${i(t.invoiceNo)}</strong> | Date: ${i(t.date)}<br>
          Cust: ${i(t.customerName)} (${i(t.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(t.items||[]).map(u=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${i(u.serviceName.slice(0,20))} x${u.qty}</span>
              <span>${l(u.lineTotalPaise)}</span>
            </div>`).join("")}
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Govt Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px; margin-top:4px;">
          <span>TOTAL:</span><span>${l(t.grandTotalPaise)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Paid (${i(t.paymentMode)}):</span><span>${l(t.paidPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Balance Due:</span><span>${l(t.duePaise)}</span></div>
        <div style="text-align:center; margin-top:8px; font-size:10px;">
          ${i(s?.footerNote||"Thank you for visiting!")}
        </div>
      </div>
    `:`
    <div class="invoice-sheet-a4">
      <div style="display:flex; justify-content:space-between; border-bottom:2px solid #12345A; padding-bottom:10px; margin-bottom:12px;">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          ${oe(s,"max-height:64px; max-width:140px; object-fit:contain;")}
          <div>
          <h2 style="color:#12345A; margin:0; font-size:18px;">${i(s?.centreName||"VLEBook Digital Service Centre")}</h2>
          <div>${i(s?.address||"")}, ${i(s?.district||"")}, ${i(s?.state||"")} - ${i(s?.pinCode||"")}</div>
          <div>Phone: ${i(s?.mobile||"")} | Email: ${i(s?.email||"")}</div>
          ${s?.gstin?`<div><strong>GSTIN:</strong> ${i(s.gstin)}</div>`:""}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#087E8B;">SERVICE INVOICE / RECEIPT</div>
          <div><strong>Invoice No:</strong> ${i(t.invoiceNo)}</div>
          <div><strong>Date:</strong> ${i(t.date)}</div>
          <div><strong>Status:</strong> ${i(t.status)}</div>
          ${t.staffName?`<div><strong>Handled by:</strong> ${i(t.staffName)}</div>`:""}
        </div>
      </div>

      <div style="margin-bottom:12px; background:#F8FAFC; padding:8px 12px; border-radius:6px;">
        <strong>Billed To:</strong> ${i(t.customerName)} (${i(t.customerId)}) | <strong>Mobile:</strong> ${i(t.customerMobile||"N/A")}
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:12px;">
        <thead>
          <tr style="background:#EDF2F7; border-bottom:1px solid #CBD5E1;">
            <th style="padding:6px; text-align:left;">#</th>
            <th style="padding:6px; text-align:left;">Service Description</th>
            <th style="padding:6px; text-align:right;">Qty</th>
            <th style="padding:6px; text-align:right;">Govt Fee</th>
            <th style="padding:6px; text-align:right;">Service Charge</th>
            <th style="padding:6px; text-align:right;">GST</th>
            <th style="padding:6px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(t.items||[]).map((u,I)=>`
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:6px;">${I+1}</td>
              <td style="padding:6px;"><strong>${i(u.serviceName)}</strong></td>
              <td style="padding:6px; text-align:right;">${u.qty}</td>
              <td style="padding:6px; text-align:right;">${l(u.lineGovtFeePaise)}</td>
              <td style="padding:6px; text-align:right;">${l(u.lineServiceChargePaise)}</td>
              <td style="padding:6px; text-align:right;">${l(u.totalTaxPaise)}</td>
              <td style="padding:6px; text-align:right; font-weight:700;">${l(u.lineTotalPaise)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="max-width:55%; font-size:11.5px;">
          <div><strong>Amount in Words:</strong> ${i(J(t.grandTotalPaise))}</div>
          <div style="margin-top:6px; color:#475569;">${i(s?.footerNote||"")}</div>
        </div>
        <div style="min-width:230px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;"><span>Govt / Statutory Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
          <div style="display:flex; justify-content:space-between;"><span>Centre Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
          ${t.totalTaxPaise>0?`<div style="display:flex; justify-content:space-between;"><span>GST (CGST/SGST/IGST):</span><span>${l(t.totalTaxPaise)}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; border-top:1px solid #12345A; margin-top:4px; padding-top:4px; font-weight:800; font-size:14px;">
            <span>Grand Total:</span><span>${l(t.grandTotalPaise)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#14804A;"><span>Paid (${i(t.paymentMode)}):</span><span>${l(t.paidPaise)}</span></div>
          ${t.advanceAdjustedPaise>0?`<div style="display:flex; justify-content:space-between;"><span>Advance Adjusted:</span><span>${l(t.advanceAdjustedPaise)}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#C92A2A;"><span>Balance Due:</span><span>${l(t.duePaise)}</span></div>
        </div>
      </div>
    </div>
  `}export{d as renderBillingModule};
