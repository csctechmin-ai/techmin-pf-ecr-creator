import{getCurrentUser as xe,can as pe}from"../core/auth.js";import{logoImgTag as ue}from"../core/branding.js";import{getLicenceState as $e,BASIC_DAILY_BILLS as ve}from"../core/licence.js";import{getAllRecords as D,getRecord as me,putRecord as ge,deleteRecord as Pe}from"../core/db.js";import{calculateInvoiceLine as Se,lineGstRate as T,createMultiServiceInvoice as Ie,cancelInvoiceWithReversal as Ce,getCustomer360Profile as Ae,notifyCrossTabSync as Te}from"../core/accounting.js";import{SERVICE_CATEGORIES as we}from"./services.js";import{uid as F,todayISO as ee,nowISO as Ne,formatINR as l,fromPaise as I,toPaise as $,amountInWordsINR as te,esc as s,buildWhatsAppURL as Ee,generateSimplePDFBlob as ke,downloadFile as Le,printDocumentSheet as Re}from"../core/utils.js";import{formatWhatsAppTemplate as Ge,getLang as qe,t as De}from"../core/i18n.js";let v=[],m=null,f="NONE",w=!0,j=null,M="A4",N=null,W=null,ae=!1,C={mobile:"",name:""},S=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function H(){await ge("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:v,selectedCustomerId:m?.id||null,typedCustomer:C,gstMode:f,applyRoundOff:w,savedAt:Ne()})}async function p(t,i){const[b,d,E,u,y,ye]=await Promise.all([D("services"),D("customers"),D("bills"),me("settings","CENTRE_CONFIG"),me("drafts","DRAFT_BILLING_VISIT"),D("staff")]),k=ye.filter(e=>e.active!==!1).sort((e,a)=>e.name.localeCompare(a.name));S&&!k.some(e=>e.id===S)&&(S="");const B=xe();B?.staffId&&B.role==="OPERATOR"&&k.some(e=>e.id===B.staffId)&&(S=B.staffId),!ae&&y&&Array.isArray(y.currentLines)&&y.currentLines.length>0&&(v=y.currentLines,y.selectedCustomerId&&(m=d.find(e=>e.id===y.selectedCustomerId)||null),y.typedCustomer&&(C={mobile:"",name:"",...y.typedCustomer}),y.gstMode&&(f=y.gstMode),typeof y.applyRoundOff=="boolean"&&(w=y.applyRoundOff),ae=!0),ae=!0;const ie=sessionStorage.getItem("vlebook_preview_bill_id");ie&&(sessionStorage.removeItem("vlebook_preview_bill_id"),j=ie);const oe=sessionStorage.getItem("vlebook_preselect_customer");if(oe){sessionStorage.removeItem("vlebook_preselect_customer");const e=d.find(a=>a.id===oe);e&&(m=e)}const le=sessionStorage.getItem("vlebook_workbench_bill_item");if(le){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(le);v.push(e)}catch{}}const _=m?await Ae(m.id):null,U=_?.metrics?.availableAdvancePaise||0,O=v.map(e=>Se(e,f)),ne=O.reduce((e,a)=>e+a.lineGovtFeePaise,0),re=O.reduce((e,a)=>e+a.lineServiceChargePaise,0),de=O.reduce((e,a)=>e+a.totalTaxPaise,0),Q=ne+re+de,L=w?Math.round(Q/100)*100:Q,he=L-Q,z=[...E].sort((e,a)=>String(a.createdAt||a.date).localeCompare(String(e.createdAt||e.date))),n=j?E.find(e=>e.id===j):z[0];t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Unified Counter Multi-Service Billing & Invoicing</h1>
        <p>Bill multiple services in one citizen visit, separate government fees from service revenue, and print A4 or Thermal receipts</p>
      </div>
      <div class="module-actions">
        <span class="badge badge-info">Next Invoice: ${s(u?.invoicePrefix||"VLE")}-${u?.nextInvoiceNumber||1001}</span>
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
          <input type="tel" class="form-control" id="bill-cust-mobile" maxlength="10" placeholder="Enter 10-digit mobile..." value="${s(m?.mobile||C.mobile||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Customer Full Name <span class="req">*</span></label>
          <input type="text" class="form-control" id="bill-cust-name" placeholder="Citizen Full Name" value="${s(m?.name||C.name||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="bill-date" value="${ee()}">
        </div>
      </div>

      ${_?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${s(m.name)} (${s(m.id)}) |
                Previous Visits: <strong>${_.metrics.totalVisits}</strong> |
                Pending Due: <strong>${l(_.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${l(U)}</strong>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-clear-cust">Clear</button>
            </div>`:""}

      <!-- Quick Service Picker Bar -->
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-service-select" style="max-width:340px;">
          ${b.filter(e=>e.active!==!1).map(e=>`<option value="${s(e.id)}" ${W===e.id?"selected":""}>${s(e.name)} — ${l(e.customerPricePaise)} (Govt: ${l(e.govtFeePaise)})</option>`).join("")}
        </select>
        <button type="button" class="btn btn-teal" id="bill-add-line-btn">Add Service to Visit</button>
        <button type="button" class="btn btn-outline" id="bill-quick-edit-srv-btn" title="Edit the selected service in the catalogue">Edit Selected Service</button>
        <button type="button" class="btn btn-gold" id="bill-quick-new-srv-btn" title="Create a brand-new service and add to list">Create New Service</button>
        <button type="button" class="btn btn-outline" id="bill-add-five-demo-btn" title="Add 5 common citizen services in one click">5-Service Preset</button>
      </div>

      ${N?(()=>{const e=N==="EDIT"?b.find(a=>a.id===W)||b[0]:null;return`
              <div class="card" style="background:var(--color-surface-alt); border:2px solid var(--color-teal); margin-bottom:14px;">
                <div class="card-header" style="padding-bottom:8px; margin-bottom:10px;">
                  <div class="card-title" style="font-size:14px;">
                    ${e?`Edit Present Service: ${s(e.name)}`:"Create New Service & Add to Service List"}
                  </div>
                  <button type="button" class="btn btn-xs btn-outline" id="bill-close-quick-srv">Close</button>
                </div>
                <form id="bill-quick-srv-form" class="grid-3" style="gap:10px; align-items:end;">
                  <input type="hidden" name="id" value="${s(e?.id||"")}">
                  <div class="form-group">
                    <label class="form-label">Service Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="name" required placeholder="e.g. Color Print / Birth Certificate" value="${s(e?.name||"")}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-control" name="category">
                      ${we.map(a=>`<option value="${s(a)}" ${e?.category===a?"selected":""}>${s(a)}</option>`).join("")}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                    <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" required value="${e?I(e.customerPricePaise):"100"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Govt / Challan Fee (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="govtFee" value="${e?I(e.govtFeePaise):"0"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Direct Cost (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="directCost" value="${e?I(e.directCostPaise||0):"5"}">
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
              ${f!=="NONE"?'<th style="width:90px;">GST %</th>':""}
              <th class="num">Service Rev</th>
              <th class="num">Line Total</th>
              <th>Track App?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${O.map((e,a)=>`
              <tr>
                <td>${a+1}</td>
                <td>
                  <input type="text" class="form-control" data-ln-field="serviceName" data-idx="${a}" value="${s(e.serviceName)}">
                </td>
                <td>
                  <input type="number" min="1" class="form-control" data-ln-field="qty" data-idx="${a}" value="${e.qty}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="rate" data-idx="${a}" value="${I(e.unitRatePaise)}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="govtFee" data-idx="${a}" value="${I(e.unitGovtFeePaise)}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="discount" data-idx="${a}" value="${I(e.discountPaise)}">
                </td>
                ${f!=="NONE"?`<td><select class="form-control" data-ln-field="gstRate" data-idx="${a}" title="GST on the service charge only (never on the government fee)">${[0,5,12,18,28].map(o=>`<option value="${o}" ${e.gstRate===o?"selected":""}>${o}%</option>`).join("")}</select></td>`:""}
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
              ${k.map(e=>`<option value="${s(e.id)}" ${e.id===S?"selected":""}>${s(e.name)}${e.role?` (${s(e.role)})`:""}</option>`).join("")}
            </select>
            ${k.length===0?'<span class="form-hint">Add staff in Staff Commission to track commission per bill.</span>':""}
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
              <input type="number" step="0.01" min="0" max="${I(U)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${l(U)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount Paid Now (₹)</label>
              <input type="number" step="0.01" min="0" class="form-control" id="bill-paid-now" value="${I(L).toFixed(2)}">
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
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${l(ne)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${l(re)}</strong>
          </div>
          ${f!=="NONE"?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${f==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${l(de)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <label><input type="checkbox" id="bill-roundoff-chk" ${w?"checked":""}> Apply Round-off</label>
            <span>${l(he)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${l(L)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${s(te(L))}</em>
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
          <div class="card-title">Recent Invoices (${z.length})</div>
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
              ${z.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':z.map(e=>`
                    <tr>
                      <td><strong>${s(e.invoiceNo)}</strong><br><small style="color:var(--color-text-muted);">${s(e.date)}</small></td>
                      <td>
                        <a href="#" data-jump-c360="${s(e.customerId)}" style="color:var(--color-teal); font-weight:600;">${s(e.customerName)}</a><br>
                        <small style="color:var(--color-text-muted);">${(e.items||[]).length} services</small>
                      </td>
                      <td class="num">${l(e.grandTotalPaise)}</td>
                      <td class="num" style="color:var(--color-success);">${l(e.paidPaise)}</td>
                      <td class="num" style="color:${e.duePaise>0?"var(--color-danger)":"var(--color-text-muted)"};">${l(e.duePaise)}</td>
                      <td>
                        <span class="badge ${e.status==="PAID"?"badge-success":e.status==="PARTIAL"?"badge-warning":e.status==="CANCELLED"?"badge-neutral":"badge-danger"}">${s(e.status)}</span>
                      </td>
                      <td>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                          <button class="btn btn-xs btn-teal" data-view-bill="${s(e.id)}">View/Print</button>
                          <button class="btn btn-xs btn-outline" data-dup-bill="${s(e.id)}" title="Duplicate items into new bill">Dup</button>
                          ${e.status!=="CANCELLED"&&pe("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${s(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
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
                    <button class="pill-tab ${M==="A4"?"active":""}" data-fmt="A4">A4 Invoice</button>
                    <button class="pill-tab ${M==="THERMAL"?"active":""}" data-fmt="THERMAL">80mm Thermal</button>
                  </div>
                  <button class="btn btn-xs btn-primary" id="bill-print-btn">Print</button>
                  <button class="btn btn-xs btn-outline" id="bill-pdf-btn">PDF</button>
                  <a href="${s(Ee(n.customerMobile,Ge(qe(),"invoice",{customerName:n.customerName,centreName:u?.centreName||"VLEBook Centre",invoiceNo:n.invoiceNo,totalAmount:l(n.grandTotalPaise),paidAmount:l(n.paidPaise),dueAmount:l(n.duePaise)},u?.whatsappTemplates)))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${n?be(n,u,M):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const V=t.querySelector("#bill-cust-mobile"),K=t.querySelector("#bill-cust-name");V?.addEventListener("input",()=>{const e=V.value.replace(/\D/g,"").slice(-10);if(m||(C.mobile=V.value),e.length===10){const a=d.find(o=>o.mobile===e);a&&(m=a,p(t,i))}}),K?.addEventListener("input",()=>{m||(C.name=K.value)}),t.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{m=null,C={mobile:"",name:""},p(t,i)}),t.querySelector("#bill-gst-mode")?.addEventListener("change",e=>{f=e.target.value,p(t,i)}),t.querySelector("#bill-roundoff-chk")?.addEventListener("change",e=>{w=e.target.checked,p(t,i)}),t.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=t.querySelector("#bill-add-service-select")?.value,a=b.find(o=>o.id===e)||b[0];a&&(v.push({id:F("LN"),serviceId:a.id,serviceName:a.name,category:a.category,qty:1,ratePaise:a.customerPricePaise,govtFeePaise:a.govtFeePaise,thirdPartyPaise:a.thirdPartyPaise||0,directCostPaise:a.directCostPaise||0,commissionPaise:a.commissionPaise||0,discountPaise:0,gstApplicable:T(a)>0,gstRate:T(a),sac:a.sac||"",createPendingTask:a.category==="Government & Citizen Services"}),H().catch(()=>{}),p(t,i))}),t.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{W=t.querySelector("#bill-add-service-select")?.value||b[0]?.id,N="EDIT",p(t,i)}),t.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{N="CREATE",p(t,i)}),t.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{N=null,p(t,i)}),t.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const a=new FormData(e.target),o=!a.get("id"),c=$(a.get("customerPrice")),A=$(a.get("govtFee")),G=$(a.get("directCost")),h=o?null:b.find(x=>x.id===a.get("id")),r=await ge("services",{...h,id:a.get("id")||F("SRV"),name:a.get("name").trim(),category:a.get("category"),state:h?.state||"Kerala / All India",customerPricePaise:c,govtFeePaise:A,thirdPartyPaise:0,serviceChargePaise:Math.max(0,c-A),directCostPaise:G,commissionPaise:h?.commissionPaise||0,gstApplicable:T(h||{})>0,gstRate:T(h||{}),sac:h?.sac||"",turnaroundTime:h?.turnaroundTime||"Same Day",checklist:h?.checklist||"",active:!0});W=r.id,N=null,o?v.push({id:F("LN"),serviceId:r.id,serviceName:r.name,category:r.category,qty:1,ratePaise:r.customerPricePaise,govtFeePaise:r.govtFeePaise,thirdPartyPaise:0,directCostPaise:r.directCostPaise||0,commissionPaise:0,discountPaise:0,gstApplicable:!1,gstRate:18,createPendingTask:r.category==="Government & Citizen Services"}):v.forEach(x=>{x.serviceId===r.id&&(x.serviceName=r.name,x.ratePaise=r.customerPricePaise,x.govtFeePaise=r.govtFeePaise,x.directCostPaise=r.directCostPaise||0)}),Te("SERVICE_UPDATED",{id:r.id}),await p(t,i)}),t.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{v=b.slice(0,5).map(e=>({id:F("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,directCostPaise:e.directCostPaise||0,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:T(e)>0,gstRate:T(e),sac:e.sac||"",createPendingTask:e.category==="Government & Citizen Services"})),p(t,i)}),t.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const a=Number(e.getAttribute("data-idx")),o=e.getAttribute("data-ln-field"),c=v[a];c&&(o==="serviceName"?c.serviceName=e.value:o==="qty"?c.qty=Math.max(1,Number(e.value)||1):o==="rate"?c.ratePaise=$(e.value):o==="govtFee"?c.govtFeePaise=$(e.value):o==="discount"?c.discountPaise=$(e.value):o==="gstRate"?(c.gstRate=Math.max(0,Number(e.value)||0),c.gstApplicable=c.gstRate>0):o==="createPendingTask"&&(c.createPendingTask=e.checked),await H(),p(t,i))})}),t.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const a=Number(e.getAttribute("data-remove-ln"));a>=0&&a<v.length&&(v.splice(a,1),await H(),p(t,i))})});const R=t.querySelector("#bill-paid-now"),X=t.querySelector("#bill-advance-adj"),ce=t.querySelector("#bill-due-preview"),Y=t.querySelector("#bill-pay-mode");t.querySelector("#bill-staff")?.addEventListener("change",e=>{S=e.target.value;try{localStorage.setItem("vlebook_last_staff",S)}catch{}});const J=()=>{const e=$(R?.value||0),a=$(X?.value||0),o=Math.max(0,L-e-a);ce&&(ce.value=l(o))};R?.addEventListener("input",J),X?.addEventListener("input",J),Y?.addEventListener("change",()=>{Y.value==="CREDIT"&&R&&(R.value="0.00",J())}),t.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=V?.value.trim()||"",a=K?.value.trim()||"Walk-in Citizen",o=t.querySelector("#bill-date")?.value||ee(),c=Y?.value||"CASH",A=c==="CREDIT"?0:$(R?.value||0),G=$(X?.value||0),h=t.querySelector("#bill-notes")?.value||"";if(v.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const r=e.replace(/\D/g,"");if(r&&r.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}if((await $e()).tier==="BASIC"){const q=ee();if((await D("bills")).filter(Z=>(Z.createdAt||Z.date||"").slice(0,10)===q&&Z.status!=="CANCELLED").length>=ve){alert(`Basic mode allows ${ve} invoices a day, and today's limit is reached. Buy or renew a licence in Users & Licence to make unlimited invoices.`);return}}if(f!=="NONE"&&!String(u?.gstin||"").trim()){alert(De('A GST bill needs your GSTIN. Add it in Settings & Centre Setup, or choose "Non-GST Bill".'));return}let g;try{g=await Ie({date:o,customerId:m?.id||null,customerName:a,customerMobile:e,gstMode:f,applyRoundOff:w,items:v,paidPaise:A,advanceAdjustedPaise:G,paymentMode:c,staffId:S||null,staffName:k.find(q=>q.id===S)?.name||"",notes:h})}catch(q){alert(q.message||"Could not create the invoice.");return}j=g.id,v=[],m=null,C={mobile:"",name:""},await Pe("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await p(t,i)}),t.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{j=e.getAttribute("data-view-bill"),p(t,i)})}),t.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=E.find(o=>o.id===e.getAttribute("data-dup-bill"));a&&(v=(a.items||[]).map(o=>({...o,id:F("LN"),ratePaise:o.unitRatePaise,govtFeePaise:o.unitGovtFeePaise,thirdPartyPaise:o.unitThirdPartyPaise,directCostPaise:o.unitDirectCostPaise,commissionPaise:o.unitCommissionPaise})),await H(),p(t,i))})}),t.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-cancel-bill");if(!pe("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await Ce(a,"Operator issued cancellation & credit note"),await p(t,i)})}),t.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",a=>{a.preventDefault();const o=e.getAttribute("data-jump-c360");i("customers",o)})}),t.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{M=e.getAttribute("data-fmt"),p(t,i)})}),t.querySelector("#bill-print-btn")?.addEventListener("click",()=>{n&&Re(be(n,u,M))}),t.querySelector("#bill-pdf-btn")?.addEventListener("click",()=>{if(!n)return;const e=P(n),a=se(n),o=g=>(Number(g||0)/100).toFixed(2),A=[[u?.address,u?.district,u?.state,u?.pinCode].filter(Boolean).join(", "),u?.gstin?`GSTIN: ${u.gstin}`:"",`Invoice ${n.invoiceNo} | Date: ${n.date} | Status: ${n.status}`,`Customer: ${n.customerName} (${n.customerMobile||"N/A"})`,e?`Place of supply: ${u?.state||""}`:""].filter(Boolean).join(" | "),G=["Service",...a?["SAC"]:[],"Qty","Govt Fee",e?"Taxable value":"Service Chg",...e?["GST %"]:[],"GST","Line Total"],h=(n.items||[]).map(g=>[g.serviceName.slice(0,24),...a?[g.sac||""]:[],String(g.qty),o(g.lineGovtFeePaise),o(g.lineServiceChargePaise),...e?[`${Number(g.gstRate||0)}%`]:[],o(g.totalTaxPaise),o(g.lineTotalPaise)]),r=[];e&&(r.push(`Taxable value: Rs.${o(n.serviceChargeTotalPaise)} | `+(n.gstMode==="INTER"?`IGST: Rs.${o(n.igstPaise)}`:`CGST: Rs.${o(n.cgstPaise)} | SGST: Rs.${o(n.sgstPaise)}`)),n.govtFeeTotalPaise>0&&r.push("Government fees are collected as a pure agent and are not taxable; GST is on the centre service charge only.")),n.roundOffPaise&&r.push(`Round off: ${n.roundOffPaise>0?"+":"-"}Rs.${o(Math.abs(n.roundOffPaise))}`),r.push(`Grand Total: Rs.${o(n.grandTotalPaise)} (${te(n.grandTotalPaise)})`),r.push(`Paid: Rs.${o(n.paidPaise)} | Advance Adj: Rs.${o(n.advanceAdjustedPaise||0)} | Balance Due: Rs.${o(n.duePaise)}`);const x=ke(`${u?.centreName||"VLEBook Digital Service Centre"} - ${e?"Tax Invoice":"Invoice"} ${n.invoiceNo}`,A,G,h,r);Le(x,`Invoice_${n.invoiceNo}.pdf`,"application/pdf")})}function P(t){return t?.gstMode==="INTRA"||t?.gstMode==="INTER"}function se(t){return(t?.items||[]).some(i=>i.sac)}function fe(t){if(!P(t))return"";const i=(b,d)=>`<div style="display:flex; justify-content:space-between;"><span>${b}:</span><span>${l(d)}</span></div>`;return t.gstMode==="INTER"?i("IGST",t.igstPaise||0):i("CGST",t.cgstPaise||0)+i("SGST",t.sgstPaise||0)}function be(t,i,b="A4"){return b==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${ue(i,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${s(i?.centreName||"VLEBook Centre")}</strong><br>
          <span>${s(i?.address||"")}</span><br>
          <span>Mob: ${s(i?.mobile||"")}</span>
          ${i?.gstin?`<br><span>GSTIN: ${s(i.gstin)}</span>`:""}${i?.akshayaId?`<br><span>Akshaya ID: ${s(i.akshayaId)}</span>`:""}${i?.cscId?`<br><span>CSC ID: ${s(i.cscId)}</span>`:""}
        </div>
        <div>
          ${P(t)?'<div style="text-align:center; font-weight:700;">TAX INVOICE</div>':""}
          <strong>Inv: ${s(t.invoiceNo)}</strong> | Date: ${s(t.date)}<br>
          Cust: ${s(t.customerName)} (${s(t.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(t.items||[]).map(d=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${s(d.serviceName.slice(0,20))} x${d.qty}</span>
              <span>${l(d.lineTotalPaise)}</span>
            </div>`).join("")}
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Govt Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
        ${fe(t)}
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px; margin-top:4px;">
          <span>TOTAL:</span><span>${l(t.grandTotalPaise)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Paid (${s(t.paymentMode)}):</span><span>${l(t.paidPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Balance Due:</span><span>${l(t.duePaise)}</span></div>
        <div style="text-align:center; margin-top:8px; font-size:10px;">
          ${s(i?.footerNote||"Thank you for visiting!")}
        </div>
      </div>
    `:`
    <div class="invoice-sheet-a4">
      <div style="display:flex; justify-content:space-between; border-bottom:2px solid #12345A; padding-bottom:10px; margin-bottom:12px;">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          ${ue(i,"max-height:64px; max-width:140px; object-fit:contain;")}
          <div>
          <h2 style="color:#12345A; margin:0; font-size:18px;">${s(i?.centreName||"VLEBook Digital Service Centre")}</h2>
          <div>${s(i?.address||"")}, ${s(i?.district||"")}, ${s(i?.state||"")} - ${s(i?.pinCode||"")}</div>
          <div>Phone: ${s(i?.mobile||"")} | Email: ${s(i?.email||"")}</div>
          ${i?.gstin?`<div><strong>GSTIN:</strong> ${s(i.gstin)}</div>`:""}${i?.akshayaId?`<div><strong>Akshaya ID:</strong> ${s(i.akshayaId)}</div>`:""}${i?.cscId?`<div><strong>CSC ID:</strong> ${s(i.cscId)}</div>`:""}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#087E8B;">${P(t)?"TAX INVOICE":"SERVICE INVOICE / RECEIPT"}</div>
          ${P(t)?`<div><strong>Place of supply:</strong> ${s(i?.state||"")}</div>`:""}
          <div><strong>Invoice No:</strong> ${s(t.invoiceNo)}</div>
          <div><strong>Date:</strong> ${s(t.date)}</div>
          <div><strong>Status:</strong> ${s(t.status)}</div>
          ${t.staffName?`<div><strong>Handled by:</strong> ${s(t.staffName)}</div>`:""}
        </div>
      </div>

      <div style="margin-bottom:12px; background:#F8FAFC; padding:8px 12px; border-radius:6px;">
        <strong>Billed To:</strong> ${s(t.customerName)} (${s(t.customerId)}) | <strong>Mobile:</strong> ${s(t.customerMobile||"N/A")}
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:12px;">
        <thead>
          <tr style="background:#EDF2F7; border-bottom:1px solid #CBD5E1;">
            <th style="padding:6px; text-align:left;">#</th>
            <th style="padding:6px; text-align:left;">Service Description</th>
            <th style="padding:6px; text-align:right;">Qty</th>
            <th style="padding:6px; text-align:right;">Govt Fee</th>
            ${se(t)?'<th style="padding:6px; text-align:left;">SAC</th>':""}
            <th style="padding:6px; text-align:right;">${P(t)?"Taxable value (service charge)":"Service Charge"}</th>
            ${P(t)?'<th style="padding:6px; text-align:right;">GST %</th>':""}
            <th style="padding:6px; text-align:right;">GST</th>
            <th style="padding:6px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(t.items||[]).map((d,E)=>`
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:6px;">${E+1}</td>
              <td style="padding:6px;"><strong>${s(d.serviceName)}</strong></td>
              <td style="padding:6px; text-align:right;">${d.qty}</td>
              <td style="padding:6px; text-align:right;">${l(d.lineGovtFeePaise)}</td>
              ${se(t)?`<td style="padding:6px;">${s(d.sac||"")}</td>`:""}
              <td style="padding:6px; text-align:right;">${l(d.lineServiceChargePaise)}</td>
              ${P(t)?`<td style="padding:6px; text-align:right;">${Number(d.gstRate||0)}%</td>`:""}
              <td style="padding:6px; text-align:right;">${l(d.totalTaxPaise)}</td>
              <td style="padding:6px; text-align:right; font-weight:700;">${l(d.lineTotalPaise)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="max-width:55%; font-size:11.5px;">
          <div><strong>Amount in Words:</strong> ${s(te(t.grandTotalPaise))}</div>
          ${P(t)&&t.govtFeeTotalPaise>0?'<div style="margin-top:6px;">Government fees are collected on behalf of the department as a pure agent and are not part of the taxable value; GST is charged only on the centre service charge.</div>':""}
          ${P(t)?'<div style="margin-top:14px; text-align:right;">Authorised signatory</div>':""}
          <div style="margin-top:6px; color:#475569;">${s(i?.footerNote||"")}</div>
        </div>
        <div style="min-width:230px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;"><span>Govt / Statutory Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
          <div style="display:flex; justify-content:space-between;"><span>Centre Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
          ${fe(t)}
          ${t.roundOffPaise?`<div style="display:flex; justify-content:space-between;"><span>Round off:</span><span>${t.roundOffPaise>0?"+":"-"}${l(Math.abs(t.roundOffPaise))}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; border-top:1px solid #12345A; margin-top:4px; padding-top:4px; font-weight:800; font-size:14px;">
            <span>Grand Total:</span><span>${l(t.grandTotalPaise)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#14804A;"><span>Paid (${s(t.paymentMode)}):</span><span>${l(t.paidPaise)}</span></div>
          ${t.advanceAdjustedPaise>0?`<div style="display:flex; justify-content:space-between;"><span>Advance Adjusted:</span><span>${l(t.advanceAdjustedPaise)}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#C92A2A;"><span>Balance Due:</span><span>${l(t.duePaise)}</span></div>
        </div>
      </div>
    </div>
  `}export{p as renderBillingModule};
