import{getCurrentUser as ge,can as re}from"../core/auth.js";import{logoImgTag as de}from"../core/branding.js";import{getLicenceState as fe,BASIC_DAILY_BILLS as ce}from"../core/licence.js";import{getAllRecords as N,getRecord as pe,putRecord as ve,deleteRecord as ye}from"../core/db.js";import{calculateInvoiceLine as he,createMultiServiceInvoice as xe,cancelInvoiceWithReversal as Pe,getCustomer360Profile as $e,notifyCrossTabSync as Se}from"../core/accounting.js";import{SERVICE_CATEGORIES as Ce}from"./services.js";import{uid as L,todayISO as J,nowISO as Ie,formatINR as l,fromPaise as P,toPaise as g,amountInWordsINR as X,esc as i,buildWhatsAppURL as Ae,generateSimplePDFBlob as we,downloadFile as Te,printDocumentSheet as Ee}from"../core/utils.js";import{formatWhatsAppTemplate as ke,getLang as Ne}from"../core/i18n.js";let c=[],p=null,f="NONE",C=!0,R=null,F="A4",I=null,M=null,Z=!1,$={mobile:"",name:""},h=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function z(){await ve("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:c,selectedCustomerId:p?.id||null,typedCustomer:$,gstMode:f,applyRoundOff:C,savedAt:Ie()})}async function d(t,s){const[b,v,A,S,m,me]=await Promise.all([N("services"),N("customers"),N("bills"),pe("settings","CENTRE_CONFIG"),pe("drafts","DRAFT_BILLING_VISIT"),N("staff")]),w=me.filter(e=>e.active!==!1).sort((e,a)=>e.name.localeCompare(a.name));h&&!w.some(e=>e.id===h)&&(h="");const q=ge();q?.staffId&&q.role==="OPERATOR"&&w.some(e=>e.id===q.staffId)&&(h=q.staffId),!Z&&m&&Array.isArray(m.currentLines)&&m.currentLines.length>0&&(c=m.currentLines,m.selectedCustomerId&&(p=v.find(e=>e.id===m.selectedCustomerId)||null),m.typedCustomer&&($={mobile:"",name:"",...m.typedCustomer}),m.gstMode&&(f=m.gstMode),typeof m.applyRoundOff=="boolean"&&(C=m.applyRoundOff),Z=!0),Z=!0;const ee=sessionStorage.getItem("vlebook_preview_bill_id");ee&&(sessionStorage.removeItem("vlebook_preview_bill_id"),R=ee);const te=sessionStorage.getItem("vlebook_preselect_customer");if(te){sessionStorage.removeItem("vlebook_preselect_customer");const e=v.find(a=>a.id===te);e&&(p=e)}const ae=sessionStorage.getItem("vlebook_workbench_bill_item");if(ae){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(ae);c.push(e)}catch{}}const D=p?await $e(p.id):null,O=D?.metrics?.availableAdvancePaise||0,G=c.map(e=>he(e,f)),ie=G.reduce((e,a)=>e+a.lineGovtFeePaise,0),se=G.reduce((e,a)=>e+a.lineServiceChargePaise,0),le=G.reduce((e,a)=>e+a.totalTaxPaise,0),V=ie+se+le,T=C?Math.round(V/100)*100:V,be=T-V,j=[...A].sort((e,a)=>String(a.createdAt||a.date).localeCompare(String(e.createdAt||e.date))),n=R?A.find(e=>e.id===R):j[0];t.innerHTML=`
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
            <option value="NONE" ${f==="NONE"?"selected":""}>Non-GST Bill</option>
            <option value="INTRA" ${f==="INTRA"?"selected":""}>GST Intra-State (CGST+SGST)</option>
            <option value="INTER" ${f==="INTER"?"selected":""}>GST Inter-State (IGST)</option>
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
          <input type="date" class="form-control" id="bill-date" value="${J()}">
        </div>
      </div>

      ${D?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${i(p.name)} (${i(p.id)}) |
                Previous Visits: <strong>${D.metrics.totalVisits}</strong> |
                Pending Due: <strong>${l(D.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${l(O)}</strong>
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

      ${I?(()=>{const e=I==="EDIT"?b.find(a=>a.id===M)||b[0]:null;return`
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
                      ${Ce.map(a=>`<option value="${i(a)}" ${e?.category===a?"selected":""}>${i(a)}</option>`).join("")}
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
            ${G.map((e,a)=>`
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
              ${w.map(e=>`<option value="${i(e.id)}" ${e.id===h?"selected":""}>${i(e.name)}${e.role?` (${i(e.role)})`:""}</option>`).join("")}
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
              <input type="number" step="0.01" min="0" max="${P(O)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${l(O)}</span>
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
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${l(ie)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${l(se)}</strong>
          </div>
          ${f!=="NONE"?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${f==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${l(le)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <label><input type="checkbox" id="bill-roundoff-chk" ${C?"checked":""}> Apply Round-off</label>
            <span>${l(be)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${l(T)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${i(X(T))}</em>
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
          <div class="card-title">Recent Invoices (${j.length})</div>
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
              ${j.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':j.map(e=>`
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
                          ${e.status!=="CANCELLED"&&re("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${i(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
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
                    <button class="pill-tab ${F==="A4"?"active":""}" data-fmt="A4">A4 Invoice</button>
                    <button class="pill-tab ${F==="THERMAL"?"active":""}" data-fmt="THERMAL">80mm Thermal</button>
                  </div>
                  <button class="btn btn-xs btn-primary" id="bill-print-btn">Print</button>
                  <button class="btn btn-xs btn-outline" id="bill-pdf-btn">PDF</button>
                  <a href="${i(Ae(n.customerMobile,ke(Ne(),"invoice",{customerName:n.customerName,centreName:S?.centreName||"VLEBook Centre",invoiceNo:n.invoiceNo,totalAmount:l(n.grandTotalPaise),paidAmount:l(n.paidPaise),dueAmount:l(n.duePaise)},S?.whatsappTemplates)))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${n?ue(n,S,F):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const _=t.querySelector("#bill-cust-mobile"),W=t.querySelector("#bill-cust-name");_?.addEventListener("input",()=>{const e=_.value.replace(/\D/g,"").slice(-10);if(p||($.mobile=_.value),e.length===10){const a=v.find(o=>o.mobile===e);a&&(p=a,d(t,s))}}),W?.addEventListener("input",()=>{p||($.name=W.value)}),t.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{p=null,$={mobile:"",name:""},d(t,s)}),t.querySelector("#bill-gst-mode")?.addEventListener("change",e=>{f=e.target.value,d(t,s)}),t.querySelector("#bill-roundoff-chk")?.addEventListener("change",e=>{C=e.target.checked,d(t,s)}),t.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=t.querySelector("#bill-add-service-select")?.value,a=b.find(o=>o.id===e)||b[0];a&&(c.push({id:L("LN"),serviceId:a.id,serviceName:a.name,category:a.category,qty:1,ratePaise:a.customerPricePaise,govtFeePaise:a.govtFeePaise,thirdPartyPaise:a.thirdPartyPaise||0,directCostPaise:a.directCostPaise||0,commissionPaise:a.commissionPaise||0,discountPaise:0,gstApplicable:a.gstApplicable,gstRate:a.gstRate||18,createPendingTask:a.category==="Government & Citizen Services"}),z().catch(()=>{}),d(t,s))}),t.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{M=t.querySelector("#bill-add-service-select")?.value||b[0]?.id,I="EDIT",d(t,s)}),t.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{I="CREATE",d(t,s)}),t.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{I=null,d(t,s)}),t.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const a=new FormData(e.target),o=!a.get("id"),u=g(a.get("customerPrice")),B=g(a.get("govtFee")),K=g(a.get("directCost")),y=o?null:b.find(x=>x.id===a.get("id")),r=await ve("services",{...y,id:a.get("id")||L("SRV"),name:a.get("name").trim(),category:a.get("category"),state:y?.state||"Kerala / All India",customerPricePaise:u,govtFeePaise:B,thirdPartyPaise:0,serviceChargePaise:Math.max(0,u-B),directCostPaise:K,commissionPaise:y?.commissionPaise||0,gstApplicable:y?.gstApplicable||!1,gstRate:y?.gstRate||18,turnaroundTime:y?.turnaroundTime||"Same Day",checklist:y?.checklist||"",active:!0});M=r.id,I=null,o?c.push({id:L("LN"),serviceId:r.id,serviceName:r.name,category:r.category,qty:1,ratePaise:r.customerPricePaise,govtFeePaise:r.govtFeePaise,thirdPartyPaise:0,directCostPaise:r.directCostPaise||0,commissionPaise:0,discountPaise:0,gstApplicable:!1,gstRate:18,createPendingTask:r.category==="Government & Citizen Services"}):c.forEach(x=>{x.serviceId===r.id&&(x.serviceName=r.name,x.ratePaise=r.customerPricePaise,x.govtFeePaise=r.govtFeePaise,x.directCostPaise=r.directCostPaise||0)}),Se("SERVICE_UPDATED",{id:r.id}),await d(t,s)}),t.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{c=b.slice(0,5).map(e=>({id:L("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,directCostPaise:e.directCostPaise||0,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:e.gstApplicable,gstRate:e.gstRate||18,createPendingTask:e.category==="Government & Citizen Services"})),d(t,s)}),t.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const a=Number(e.getAttribute("data-idx")),o=e.getAttribute("data-ln-field"),u=c[a];u&&(o==="serviceName"?u.serviceName=e.value:o==="qty"?u.qty=Math.max(1,Number(e.value)||1):o==="rate"?u.ratePaise=g(e.value):o==="govtFee"?u.govtFeePaise=g(e.value):o==="discount"?u.discountPaise=g(e.value):o==="createPendingTask"&&(u.createPendingTask=e.checked),await z(),d(t,s))})}),t.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const a=Number(e.getAttribute("data-remove-ln"));a>=0&&a<c.length&&(c.splice(a,1),await z(),d(t,s))})});const E=t.querySelector("#bill-paid-now"),H=t.querySelector("#bill-advance-adj"),oe=t.querySelector("#bill-due-preview"),U=t.querySelector("#bill-pay-mode");t.querySelector("#bill-staff")?.addEventListener("change",e=>{h=e.target.value;try{localStorage.setItem("vlebook_last_staff",h)}catch{}});const Q=()=>{const e=g(E?.value||0),a=g(H?.value||0),o=Math.max(0,T-e-a);oe&&(oe.value=l(o))};E?.addEventListener("input",Q),H?.addEventListener("input",Q),U?.addEventListener("change",()=>{U.value==="CREDIT"&&E&&(E.value="0.00",Q())}),t.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=_?.value.trim()||"",a=W?.value.trim()||"Walk-in Citizen",o=t.querySelector("#bill-date")?.value||J(),u=U?.value||"CASH",B=u==="CREDIT"?0:g(E?.value||0),K=g(H?.value||0),y=t.querySelector("#bill-notes")?.value||"";if(c.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const r=e.replace(/\D/g,"");if(r&&r.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}if((await fe()).tier==="BASIC"){const k=J();if((await N("bills")).filter(Y=>(Y.createdAt||Y.date||"").slice(0,10)===k&&Y.status!=="CANCELLED").length>=ce){alert(`Basic mode allows ${ce} invoices a day, and today's limit is reached. Buy or renew a licence in Users & Licence to make unlimited invoices.`);return}}let ne;try{ne=await xe({date:o,customerId:p?.id||null,customerName:a,customerMobile:e,gstMode:f,applyRoundOff:C,items:c,paidPaise:B,advanceAdjustedPaise:K,paymentMode:u,staffId:h||null,staffName:w.find(k=>k.id===h)?.name||"",notes:y})}catch(k){alert(k.message||"Could not create the invoice.");return}R=ne.id,c=[],p=null,$={mobile:"",name:""},await ye("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await d(t,s)}),t.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{R=e.getAttribute("data-view-bill"),d(t,s)})}),t.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=A.find(o=>o.id===e.getAttribute("data-dup-bill"));a&&(c=(a.items||[]).map(o=>({...o,id:L("LN"),ratePaise:o.unitRatePaise,govtFeePaise:o.unitGovtFeePaise,thirdPartyPaise:o.unitThirdPartyPaise,directCostPaise:o.unitDirectCostPaise,commissionPaise:o.unitCommissionPaise})),await z(),d(t,s))})}),t.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-cancel-bill");if(!re("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await Pe(a,"Operator issued cancellation & credit note"),await d(t,s)})}),t.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",a=>{a.preventDefault();const o=e.getAttribute("data-jump-c360");s("customers",o)})}),t.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{F=e.getAttribute("data-fmt"),d(t,s)})}),t.querySelector("#bill-print-btn")?.addEventListener("click",()=>{n&&Ee(ue(n,S,F))}),t.querySelector("#bill-pdf-btn")?.addEventListener("click",()=>{if(!n)return;const e=we(`${S?.centreName||"VLEBook Digital Service Centre"} - Invoice ${n.invoiceNo}`,`Customer: ${n.customerName} (${n.customerMobile||"N/A"}) | Date: ${n.date} | Status: ${n.status}`,["Service","Qty","Govt Fee","Service Chg","Tax","Line Total"],(n.items||[]).map(a=>[a.serviceName.slice(0,24),String(a.qty),(a.lineGovtFeePaise/100).toFixed(2),(a.lineServiceChargePaise/100).toFixed(2),(a.totalTaxPaise/100).toFixed(2),(a.lineTotalPaise/100).toFixed(2)]),[`Grand Total: Rs.${(n.grandTotalPaise/100).toFixed(2)} (${X(n.grandTotalPaise)})`,`Paid: Rs.${(n.paidPaise/100).toFixed(2)} | Advance Adj: Rs.${((n.advanceAdjustedPaise||0)/100).toFixed(2)} | Balance Due: Rs.${(n.duePaise/100).toFixed(2)}`]);Te(e,`Invoice_${n.invoiceNo}.pdf`,"application/pdf")})}function ue(t,s,b="A4"){return b==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${de(s,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${i(s?.centreName||"VLEBook Centre")}</strong><br>
          <span>${i(s?.address||"")}</span><br>
          <span>Mob: ${i(s?.mobile||"")}</span>
          ${s?.gstin?`<br><span>GSTIN: ${i(s.gstin)}</span>`:""}${s?.akshayaId?`<br><span>Akshaya ID: ${i(s.akshayaId)}</span>`:""}${s?.cscId?`<br><span>CSC ID: ${i(s.cscId)}</span>`:""}
        </div>
        <div>
          <strong>Inv: ${i(t.invoiceNo)}</strong> | Date: ${i(t.date)}<br>
          Cust: ${i(t.customerName)} (${i(t.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(t.items||[]).map(v=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${i(v.serviceName.slice(0,20))} x${v.qty}</span>
              <span>${l(v.lineTotalPaise)}</span>
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
          ${de(s,"max-height:64px; max-width:140px; object-fit:contain;")}
          <div>
          <h2 style="color:#12345A; margin:0; font-size:18px;">${i(s?.centreName||"VLEBook Digital Service Centre")}</h2>
          <div>${i(s?.address||"")}, ${i(s?.district||"")}, ${i(s?.state||"")} - ${i(s?.pinCode||"")}</div>
          <div>Phone: ${i(s?.mobile||"")} | Email: ${i(s?.email||"")}</div>
          ${s?.gstin?`<div><strong>GSTIN:</strong> ${i(s.gstin)}</div>`:""}${s?.akshayaId?`<div><strong>Akshaya ID:</strong> ${i(s.akshayaId)}</div>`:""}${s?.cscId?`<div><strong>CSC ID:</strong> ${i(s.cscId)}</div>`:""}
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
          ${(t.items||[]).map((v,A)=>`
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:6px;">${A+1}</td>
              <td style="padding:6px;"><strong>${i(v.serviceName)}</strong></td>
              <td style="padding:6px; text-align:right;">${v.qty}</td>
              <td style="padding:6px; text-align:right;">${l(v.lineGovtFeePaise)}</td>
              <td style="padding:6px; text-align:right;">${l(v.lineServiceChargePaise)}</td>
              <td style="padding:6px; text-align:right;">${l(v.totalTaxPaise)}</td>
              <td style="padding:6px; text-align:right; font-weight:700;">${l(v.lineTotalPaise)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="max-width:55%; font-size:11.5px;">
          <div><strong>Amount in Words:</strong> ${i(X(t.grandTotalPaise))}</div>
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
