import{getCurrentUser as ke,can as be}from"../core/auth.js";import{logoImgTag as ye}from"../core/branding.js";import{getLicenceState as we,BASIC_DAILY_BILLS as he}from"../core/licence.js";import{getAllRecords as R,getRecord as $e,putRecord as xe,deleteRecord as Re}from"../core/db.js";import{calculateInvoiceLine as Ee,lineGstRate as A,lineRefs as Pe,lineRefsText as Le,createMultiServiceInvoice as Ge,cancelInvoiceWithReversal as De,getCustomer360Profile as qe,notifyCrossTabSync as Fe}from"../core/accounting.js";import{SERVICE_CATEGORIES as je}from"./services.js";import{uid as E,todayISO as oe,nowISO as Oe,formatINR as l,fromPaise as C,toPaise as P,amountInWordsINR as le,esc as i,buildWhatsAppURL as Me,generateSimplePDFBlob as Be,downloadFile as _e,printDocumentSheet as ze}from"../core/utils.js";import{formatWhatsAppTemplate as Ve,getLang as Ue,t as Se}from"../core/i18n.js";let m=[],f=null,b="NONE",L=!0,B=null,_="A4",G=null,Y=null,ne=!1,N={mobile:"",name:""},I=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function z(){await xe("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:m,selectedCustomerId:f?.id||null,typedCustomer:N,gstMode:b,applyRoundOff:L,savedAt:Oe()})}async function v(t,s){const[h,d,T,p,y,Ne,Te]=await Promise.all([R("services"),R("customers"),R("bills"),$e("settings","CENTRE_CONFIG"),$e("drafts","DRAFT_BILLING_VISIT"),R("staff"),R("inventory")]),D=[...Te].sort((e,a)=>String(e.name).localeCompare(String(a.name))),V={};m.filter(e=>e.kind==="PRODUCT").forEach(e=>V[e.itemId]=(V[e.itemId]||0)+(Number(e.qty)||0));const k=e=>{const a=D.find(o=>o.id===e);return a?Math.round(((Number(a.currentStock)||0)-(V[e]||0))*1e3)/1e3:null},q=Ne.filter(e=>e.active!==!1).sort((e,a)=>e.name.localeCompare(a.name));I&&!q.some(e=>e.id===I)&&(I="");const U=ke();U?.staffId&&U.role==="OPERATOR"&&q.some(e=>e.id===U.staffId)&&(I=U.staffId),!ne&&y&&Array.isArray(y.currentLines)&&y.currentLines.length>0&&(m=y.currentLines,y.selectedCustomerId&&(f=d.find(e=>e.id===y.selectedCustomerId)||null),y.typedCustomer&&(N={mobile:"",name:"",...y.typedCustomer}),y.gstMode&&(b=y.gstMode),typeof y.applyRoundOff=="boolean"&&(L=y.applyRoundOff),ne=!0),ne=!0;const de=sessionStorage.getItem("vlebook_preview_bill_id");de&&(sessionStorage.removeItem("vlebook_preview_bill_id"),B=de);const ce=sessionStorage.getItem("vlebook_preselect_customer");if(ce){sessionStorage.removeItem("vlebook_preselect_customer");const e=d.find(a=>a.id===ce);e&&(f=e)}const pe=sessionStorage.getItem("vlebook_workbench_bill_item");if(pe){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(pe);m.push(e)}catch{}}const H=f?await qe(f.id):null,J=H?.metrics?.availableAdvancePaise||0,W=m.map(e=>Ee(e,b)),ue=W.reduce((e,a)=>e+a.lineGovtFeePaise,0),me=W.reduce((e,a)=>e+a.lineServiceChargePaise,0),ve=W.reduce((e,a)=>e+a.totalTaxPaise,0),Z=ue+me+ve,F=L?Math.round(Z/100)*100:Z,Ae=F-Z,Q=[...T].sort((e,a)=>String(a.createdAt||a.date).localeCompare(String(e.createdAt||e.date))),n=B?T.find(e=>e.id===B):Q[0];t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Unified Counter Multi-Service Billing & Invoicing</h1>
        <p>Bill multiple services in one citizen visit, separate government fees from service revenue, and print A4 or Thermal receipts</p>
      </div>
      <div class="module-actions">
        <span class="badge badge-info">Next Invoice: ${i(p?.invoicePrefix||"VLE")}-${p?.nextInvoiceNumber||1001}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Create Multi-Service Counter Invoice</div>
        <div style="display:flex; gap:8px; align-items:center;">
          <label class="form-label" style="margin:0;">Tax Mode:</label>
          <select class="form-control" id="bill-gst-mode" style="width:190px;">
            <option value="NONE" ${b==="NONE"?"selected":""}>Non-GST Bill</option>
            <option value="INTRA" ${b==="INTRA"?"selected":""}>GST Intra-State (CGST+SGST)</option>
            <option value="INTER" ${b==="INTER"?"selected":""}>GST Inter-State (IGST)</option>
          </select>
        </div>
      </div>

      <!-- Customer Lookup Strip -->
      <div class="grid-3" style="margin-bottom:14px; background:var(--color-surface-alt); padding:12px; border-radius:var(--radius-sm);">
        <div class="form-group">
          <label class="form-label">Customer Mobile (Auto-Lookup) <span class="req">*</span></label>
          <input type="tel" class="form-control" id="bill-cust-mobile" maxlength="10" placeholder="Enter 10-digit mobile..." value="${i(f?.mobile||N.mobile||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Customer Full Name <span class="req">*</span></label>
          <input type="text" class="form-control" id="bill-cust-name" placeholder="Citizen Full Name" value="${i(f?.name||N.name||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="bill-date" value="${oe()}">
        </div>
      </div>

      ${H?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${i(f.name)} (${i(f.id)}) |
                Previous Visits: <strong>${H.metrics.totalVisits}</strong> |
                Pending Due: <strong>${l(H.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${l(J)}</strong>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-clear-cust">Clear</button>
            </div>`:""}

      <!-- Quick Service Picker Bar -->
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-service-select" style="max-width:340px;">
          ${h.filter(e=>e.active!==!1).map(e=>`<option value="${i(e.id)}" ${Y===e.id?"selected":""}>${i(e.name)} — ${l(e.customerPricePaise)} (Govt: ${l(e.govtFeePaise)})</option>`).join("")}
        </select>
        <button type="button" class="btn btn-teal" id="bill-add-line-btn">Add Service to Visit</button>
        <button type="button" class="btn btn-outline" id="bill-quick-edit-srv-btn" title="Edit the selected service in the catalogue">Edit Selected Service</button>
        <button type="button" class="btn btn-gold" id="bill-quick-new-srv-btn" title="Create a brand-new service and add to list">Create New Service</button>
        <button type="button" class="btn btn-outline" id="bill-add-five-demo-btn" title="Add 5 common citizen services in one click">5-Service Preset</button>
      </div>
      ${D.length?`<div style="display:flex; gap:8px; align-items:center; margin:-4px 0 12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-item-select" style="max-width:420px;">
          ${D.map(e=>`<option value="${i(e.id)}">${i(e.name)} — ${l(e.sellingPricePaise||0)} ${e.priceIncludesGst?"(incl. GST)":"(excl. GST)"} · stock ${i(e.currentStock)} ${i(e.unit||"")}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-outline" id="bill-add-item-btn" title="Sell an item from Stock & Inventory on this bill">Add Item from Stock</button>
      </div>`:""}

      ${G?(()=>{const e=G==="EDIT"?h.find(a=>a.id===Y)||h[0]:null;return`
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
                      ${je.map(a=>`<option value="${i(a)}" ${e?.category===a?"selected":""}>${i(a)}</option>`).join("")}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                    <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" required value="${e?C(e.customerPricePaise):"100"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Govt / Challan Fee (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="govtFee" value="${e?C(e.govtFeePaise):"0"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Direct Cost (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="directCost" value="${e?C(e.directCostPaise||0):"5"}">
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
              ${b!=="NONE"?'<th style="width:90px;">GST %</th>':""}
              <th class="num">Service Rev</th>
              <th class="num">Line Total</th>
              <th>Track App?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${W.map((e,a)=>`
              <tr>
                <td>${a+1}</td>
                <td>
                  <input type="text" class="form-control" data-ln-field="serviceName" data-idx="${a}" value="${i(e.serviceName)}">
                  ${e.kind==="PRODUCT"?`<small style="color:var(--color-text-muted);">Stock item${e.sac?` · HSN ${i(e.sac)}`:""} · price ${e.priceIncludesGst?"includes":"excludes"} GST${k(e.itemId)!==null&&k(e.itemId)<0?` · <strong style="color:var(--color-danger);">Stock will go negative (${i(k(e.itemId))})</strong>`:k(e.itemId)!==null?` · stock after bill ${i(k(e.itemId))}`:""}</small>`:""}
                </td>
                <td>
                  <input type="number" min="${e.kind==="PRODUCT"?"0.001":"1"}" step="${e.kind==="PRODUCT"?"any":"1"}" class="form-control" data-ln-field="qty" data-idx="${a}" value="${e.qty}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="rate" data-idx="${a}" value="${C(e.unitRatePaise)}">
                </td>
                <td>
                  ${e.kind==="PRODUCT"?'<span style="color:var(--color-text-muted);">—</span>':`<input type="number" step="0.01" min="0" class="form-control" data-ln-field="govtFee" data-idx="${a}" value="${C(e.unitGovtFeePaise)}">`}
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="discount" data-idx="${a}" value="${C(e.discountPaise)}">
                </td>
                ${b!=="NONE"?`<td><select class="form-control" data-ln-field="gstRate" data-idx="${a}" title="GST on the service charge only (never on the government fee)">${e.gstRate===null||e.gstRate===void 0||e.gstRate===""?'<option value="" selected>Choose</option>':""}${[0,5,12,18,28].map(o=>`<option value="${o}" ${e.gstRate===o?"selected":""}>${o}%</option>`).join("")}</select></td>`:""}
                <td class="num" style="color:var(--color-success); font-weight:600;">${l(e.lineServiceChargePaise)}</td>
                <td class="num"><strong>${l(e.lineTotalPaise)}</strong></td>
                <td>
                  ${e.kind==="PRODUCT"?"—":`<input type="checkbox" data-ln-field="createPendingTask" data-idx="${a}" ${e.createPendingTask?"checked":""} title="Create Application Tracking record">`}
                </td>
                <td>
                  <button type="button" class="btn btn-xs btn-danger" data-remove-ln="${a}">×</button>
                </td>
              </tr>
              ${e.kind==="PRODUCT"?"":`<tr class="ln-refs-row"><td></td><td colspan="${b!=="NONE"?10:9}" style="padding-top:0;">
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;"><small style="color:var(--color-text-muted);">Reference numbers (optional, printed on the invoice):</small>
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="appRefNo" data-idx="${a}" value="${i(/^REF-\d+$/.test(e.appRefNo||"")?"":e.appRefNo||"")}" placeholder="Application No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="ackNo" data-idx="${a}" value="${i(e.ackNo||"")}" placeholder="Acknowledgement No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="trackNo" data-idx="${a}" value="${i(e.trackNo||"")}" placeholder="Tracking No.">
                </div></td></tr>`}`).join("")}
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
              ${q.map(e=>`<option value="${i(e.id)}" ${e.id===I?"selected":""}>${i(e.name)}${e.role?` (${i(e.role)})`:""}</option>`).join("")}
            </select>
            ${q.length===0?'<span class="form-hint">Add staff in Staff Commission to track commission per bill.</span>':""}
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
              <input type="number" step="0.01" min="0" max="${C(J)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${l(J)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount Paid Now (₹)</label>
              <input type="number" step="0.01" min="0" class="form-control" id="bill-paid-now" value="${C(F).toFixed(2)}">
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
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${l(ue)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${l(me)}</strong>
          </div>
          ${b!=="NONE"?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${b==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${l(ve)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <label><input type="checkbox" id="bill-roundoff-chk" ${L?"checked":""}> Apply Round-off</label>
            <span>${l(Ae)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${l(F)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${i(le(F))}</em>
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
          <div class="card-title">Recent Invoices (${Q.length})</div>
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
              ${Q.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':Q.map(e=>`
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
                          ${e.status!=="CANCELLED"&&be("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${i(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
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
                    <button class="pill-tab ${_==="A4"?"active":""}" data-fmt="A4">A4 Invoice</button>
                    <button class="pill-tab ${_==="THERMAL"?"active":""}" data-fmt="THERMAL">80mm Thermal</button>
                  </div>
                  <button class="btn btn-xs btn-primary" id="bill-print-btn">Print</button>
                  <button class="btn btn-xs btn-outline" id="bill-pdf-btn">PDF</button>
                  <a href="${i(Me(n.customerMobile,Ve(Ue(),"invoice",{customerName:n.customerName,centreName:p?.centreName||"VLEBook Centre",invoiceNo:n.invoiceNo,totalAmount:l(n.grandTotalPaise),paidAmount:l(n.paidPaise),dueAmount:l(n.duePaise)},p?.whatsappTemplates)))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${n?Ce(n,p,_):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const K=t.querySelector("#bill-cust-mobile"),ee=t.querySelector("#bill-cust-name");K?.addEventListener("input",()=>{const e=K.value.replace(/\D/g,"").slice(-10);if(f||(N.mobile=K.value),e.length===10){const a=d.find(o=>o.mobile===e);a&&(f=a,v(t,s))}}),ee?.addEventListener("input",()=>{f||(N.name=ee.value)}),t.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{f=null,N={mobile:"",name:""},v(t,s)}),t.querySelector("#bill-gst-mode")?.addEventListener("change",e=>{b=e.target.value,v(t,s)}),t.querySelector("#bill-roundoff-chk")?.addEventListener("change",e=>{L=e.target.checked,v(t,s)}),t.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=t.querySelector("#bill-add-service-select")?.value,a=h.find(o=>o.id===e)||h[0];a&&(m.push({id:E("LN"),serviceId:a.id,serviceName:a.name,category:a.category,qty:1,ratePaise:a.customerPricePaise,govtFeePaise:a.govtFeePaise,thirdPartyPaise:a.thirdPartyPaise||0,directCostPaise:a.directCostPaise||0,commissionPaise:a.commissionPaise||0,discountPaise:0,gstApplicable:A(a)>0,gstRate:A(a),sac:a.sac||"",createPendingTask:a.category==="Government & Citizen Services"}),z().catch(()=>{}),v(t,s))}),t.querySelector("#bill-add-item-btn")?.addEventListener("click",()=>{const e=D.find(a=>a.id===t.querySelector("#bill-add-item-select")?.value);e&&(m.push({id:E("LN"),kind:"PRODUCT",itemId:e.id,unit:e.unit||"",serviceName:e.name,qty:1,ratePaise:Number(e.sellingPricePaise)||0,directCostPaise:Number(e.purchasePricePaise)||0,priceIncludesGst:!!e.priceIncludesGst,gstRate:e.gstRate===void 0||e.gstRate===null||e.gstRate===""?null:Number(e.gstRate),gstApplicable:A(e)>0,sac:e.hsn||"",discountPaise:0}),Number(e.sellingPricePaise)>0||alert("This item has no selling price yet. Type the price in the Rate column, or set it in Stock & Inventory → Items."),z().catch(()=>{}),v(t,s))}),t.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{Y=t.querySelector("#bill-add-service-select")?.value||h[0]?.id,G="EDIT",v(t,s)}),t.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{G="CREATE",v(t,s)}),t.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{G=null,v(t,s)}),t.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const a=new FormData(e.target),o=!a.get("id"),u=P(a.get("customerPrice")),w=P(a.get("govtFee")),O=P(a.get("directCost")),$=o?null:h.find(x=>x.id===a.get("id")),r=await xe("services",{...$,id:a.get("id")||E("SRV"),name:a.get("name").trim(),category:a.get("category"),state:$?.state||"Kerala / All India",customerPricePaise:u,govtFeePaise:w,thirdPartyPaise:0,serviceChargePaise:Math.max(0,u-w),directCostPaise:O,commissionPaise:$?.commissionPaise||0,gstApplicable:A($||{})>0,gstRate:A($||{}),sac:$?.sac||"",turnaroundTime:$?.turnaroundTime||"Same Day",checklist:$?.checklist||"",active:!0});Y=r.id,G=null,o?m.push({id:E("LN"),serviceId:r.id,serviceName:r.name,category:r.category,qty:1,ratePaise:r.customerPricePaise,govtFeePaise:r.govtFeePaise,thirdPartyPaise:0,directCostPaise:r.directCostPaise||0,commissionPaise:0,discountPaise:0,gstApplicable:!1,gstRate:18,createPendingTask:r.category==="Government & Citizen Services"}):m.forEach(x=>{x.serviceId===r.id&&(x.serviceName=r.name,x.ratePaise=r.customerPricePaise,x.govtFeePaise=r.govtFeePaise,x.directCostPaise=r.directCostPaise||0)}),Fe("SERVICE_UPDATED",{id:r.id}),await v(t,s)}),t.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{m=h.slice(0,5).map(e=>({id:E("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,directCostPaise:e.directCostPaise||0,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:A(e)>0,gstRate:A(e),sac:e.sac||"",createPendingTask:e.category==="Government & Citizen Services"})),v(t,s)}),t.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const a=Number(e.getAttribute("data-idx")),o=e.getAttribute("data-ln-field"),u=m[a];u&&(o==="serviceName"?u.serviceName=e.value:o==="qty"?u.qty=u.kind==="PRODUCT"?Math.max(.001,Math.round((Number(e.value)||1)*1e3)/1e3):Math.max(1,Number(e.value)||1):o==="appRefNo"||o==="ackNo"||o==="trackNo"?u[o]=String(e.value||"").trim().slice(0,60):o==="rate"?u.ratePaise=P(e.value):o==="govtFee"?u.govtFeePaise=P(e.value):o==="discount"?u.discountPaise=P(e.value):o==="gstRate"?(u.gstRate=e.value===""?null:Math.max(0,Number(e.value)||0),u.gstApplicable=u.gstRate>0):o==="createPendingTask"&&(u.createPendingTask=e.checked),await z(),v(t,s))})}),t.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const a=Number(e.getAttribute("data-remove-ln"));a>=0&&a<m.length&&(m.splice(a,1),await z(),v(t,s))})});const j=t.querySelector("#bill-paid-now"),te=t.querySelector("#bill-advance-adj"),ge=t.querySelector("#bill-due-preview"),ae=t.querySelector("#bill-pay-mode");t.querySelector("#bill-staff")?.addEventListener("change",e=>{I=e.target.value;try{localStorage.setItem("vlebook_last_staff",I)}catch{}});const ie=()=>{const e=P(j?.value||0),a=P(te?.value||0),o=Math.max(0,F-e-a);ge&&(ge.value=l(o))};j?.addEventListener("input",ie),te?.addEventListener("input",ie),ae?.addEventListener("change",()=>{ae.value==="CREDIT"&&j&&(j.value="0.00",ie())}),t.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=K?.value.trim()||"",a=ee?.value.trim()||"Walk-in Citizen",o=t.querySelector("#bill-date")?.value||oe(),u=ae?.value||"CASH",w=u==="CREDIT"?0:P(j?.value||0),O=P(te?.value||0),$=t.querySelector("#bill-notes")?.value||"";if(m.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const r=e.replace(/\D/g,"");if(r&&r.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}if((await we()).tier==="BASIC"){const c=oe();if((await R("bills")).filter(se=>(se.createdAt||se.date||"").slice(0,10)===c&&se.status!=="CANCELLED").length>=he){alert(`Basic mode allows ${he} invoices a day, and today's limit is reached. Buy or renew a licence in Users & Licence to make unlimited invoices.`);return}}if(b!=="NONE"&&!String(p?.gstin||"").trim()){alert(Se('A GST bill needs your GSTIN. Add it in Settings & Centre Setup, or choose "Non-GST Bill".'));return}const g=b!=="NONE"?m.filter(c=>c.kind==="PRODUCT"&&(c.gstRate===null||c.gstRate===void 0||c.gstRate==="")):[];if(g.length){alert(`${Se("Choose the GST rate for these items in the GST % column (or in Stock & Inventory):")} ${g.map(c=>c.serviceName).join(", ")}`);return}const X=Object.keys(V).map(c=>({id:c,left:k(c),name:D.find(fe=>fe.id===c)?.name})).filter(c=>c.left!==null&&c.left<0);if(X.length&&!confirm(`Negative stock alert:
${X.map(c=>`${c.name}: stock after this bill ${c.left}`).join(`
`)}

The software stock is less than the quantity billed. Save the bill anyway? (Record the missing purchase or a physical stock check later.)`))return;let M;try{M=await Ge({date:o,customerId:f?.id||null,customerName:a,customerMobile:e,gstMode:b,applyRoundOff:L,items:m,paidPaise:w,advanceAdjustedPaise:O,paymentMode:u,staffId:I||null,staffName:q.find(c=>c.id===I)?.name||"",notes:$})}catch(c){alert(c.message||"Could not create the invoice.");return}B=M.id,m=[],f=null,N={mobile:"",name:""},await Re("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await v(t,s)}),t.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{B=e.getAttribute("data-view-bill"),v(t,s)})}),t.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=T.find(o=>o.id===e.getAttribute("data-dup-bill"));a&&(m=(a.items||[]).map(o=>({...o,id:E("LN"),ratePaise:o.unitRatePaise,govtFeePaise:o.unitGovtFeePaise,thirdPartyPaise:o.unitThirdPartyPaise,directCostPaise:o.unitDirectCostPaise,commissionPaise:o.unitCommissionPaise})),await z(),v(t,s))})}),t.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-cancel-bill");if(!be("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await De(a,"Operator issued cancellation & credit note"),await v(t,s)})}),t.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",a=>{a.preventDefault();const o=e.getAttribute("data-jump-c360");s("customers",o)})}),t.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{_=e.getAttribute("data-fmt"),v(t,s)})}),t.querySelector("#bill-print-btn")?.addEventListener("click",()=>{n&&ze(Ce(n,p,_))}),t.querySelector("#bill-pdf-btn")?.addEventListener("click",()=>{if(!n)return;const e=S(n),a=re(n),o=g=>(Number(g||0)/100).toFixed(2),w=[[p?.address,p?.district,p?.state,p?.pinCode].filter(Boolean).join(", "),p?.gstin?`GSTIN: ${p.gstin}`:"",`Invoice ${n.invoiceNo} | Date: ${n.date} | Status: ${n.status}`,`Customer: ${n.customerName} (${n.customerMobile||"N/A"})`,e?`Place of supply: ${p?.state||""}`:""].filter(Boolean).join(" | "),O=["Service / item",...a?["HSN/SAC"]:[],"Qty","Govt Fee",e?"Taxable value":"Service Chg",...e?["GST %"]:[],"GST","Line Total"],$=(n.items||[]).map(g=>[g.serviceName.slice(0,24),...a?[g.sac||""]:[],String(g.qty),o(g.lineGovtFeePaise),o(g.lineServiceChargePaise),...e?[`${Number(g.gstRate||0)}%`]:[],o(g.totalTaxPaise),o(g.lineTotalPaise)]),r=[];(n.items||[]).forEach((g,X)=>{const M=Le(g);M&&r.push(`${X+1}. ${g.serviceName}: ${M}`)}),e&&(r.push(`Taxable value: Rs.${o(n.serviceChargeTotalPaise)} | `+(n.gstMode==="INTER"?`IGST: Rs.${o(n.igstPaise)}`:`CGST: Rs.${o(n.cgstPaise)} | SGST: Rs.${o(n.sgstPaise)}`)),n.govtFeeTotalPaise>0&&r.push("Government fees are collected as a pure agent and are not taxable; GST is on the centre service charges and items sold only.")),n.roundOffPaise&&r.push(`Round off: ${n.roundOffPaise>0?"+":"-"}Rs.${o(Math.abs(n.roundOffPaise))}`),r.push(`Grand Total: Rs.${o(n.grandTotalPaise)} (${le(n.grandTotalPaise)})`),r.push(`Paid: Rs.${o(n.paidPaise)} | Advance Adj: Rs.${o(n.advanceAdjustedPaise||0)} | Balance Due: Rs.${o(n.duePaise)}`);const x=Be(`${p?.centreName||"VLEBook Digital Service Centre"} - ${e?"Tax Invoice":"Invoice"} ${n.invoiceNo}`,w,O,$,r);_e(x,`Invoice_${n.invoiceNo}.pdf`,"application/pdf")})}function S(t){return t?.gstMode==="INTRA"||t?.gstMode==="INTER"}function re(t){return(t?.items||[]).some(s=>s.sac)}function Ie(t){if(!S(t))return"";const s=(h,d)=>`<div style="display:flex; justify-content:space-between;"><span>${h}:</span><span>${l(d)}</span></div>`;return t.gstMode==="INTER"?s("IGST",t.igstPaise||0):s("CGST",t.cgstPaise||0)+s("SGST",t.sgstPaise||0)}function Ce(t,s,h="A4"){return h==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${ye(s,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${i(s?.centreName||"VLEBook Centre")}</strong><br>
          <span>${i(s?.address||"")}</span><br>
          <span>Mob: ${i(s?.mobile||"")}</span>
          ${s?.gstin?`<br><span>GSTIN: ${i(s.gstin)}</span>`:""}${s?.akshayaId?`<br><span>Akshaya ID: ${i(s.akshayaId)}</span>`:""}${s?.cscId?`<br><span>CSC ID: ${i(s.cscId)}</span>`:""}
        </div>
        <div>
          ${S(t)?'<div style="text-align:center; font-weight:700;">TAX INVOICE</div>':""}
          <strong>Inv: ${i(t.invoiceNo)}</strong> | Date: ${i(t.date)}<br>
          Cust: ${i(t.customerName)} (${i(t.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(t.items||[]).map(d=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${i(d.serviceName.slice(0,20))} x${d.qty}</span>
              <span>${l(d.lineTotalPaise)}</span>
            </div>${Pe(d).map(([T,p])=>`<div style="font-size:10px;">${i(T)}: ${i(p)}</div>`).join("")}`).join("")}
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Govt Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
        ${Ie(t)}
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
          ${ye(s,"max-height:64px; max-width:140px; object-fit:contain;")}
          <div>
          <h2 style="color:#12345A; margin:0; font-size:18px;">${i(s?.centreName||"VLEBook Digital Service Centre")}</h2>
          <div>${i(s?.address||"")}, ${i(s?.district||"")}, ${i(s?.state||"")} - ${i(s?.pinCode||"")}</div>
          <div>Phone: ${i(s?.mobile||"")} | Email: ${i(s?.email||"")}</div>
          ${s?.gstin?`<div><strong>GSTIN:</strong> ${i(s.gstin)}</div>`:""}${s?.akshayaId?`<div><strong>Akshaya ID:</strong> ${i(s.akshayaId)}</div>`:""}${s?.cscId?`<div><strong>CSC ID:</strong> ${i(s.cscId)}</div>`:""}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#087E8B;">${S(t)?"TAX INVOICE":"SERVICE INVOICE / RECEIPT"}</div>
          ${S(t)?`<div><strong>Place of supply:</strong> ${i(s?.state||"")}</div>`:""}
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
            ${re(t)?'<th style="padding:6px; text-align:left;">HSN/SAC</th>':""}
            <th style="padding:6px; text-align:right;">${S(t)?"Taxable value":"Service Charge"}</th>
            ${S(t)?'<th style="padding:6px; text-align:right;">GST %</th>':""}
            <th style="padding:6px; text-align:right;">GST</th>
            <th style="padding:6px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(t.items||[]).map((d,T)=>`
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:6px;">${T+1}</td>
              <td style="padding:6px;"><strong>${i(d.serviceName)}</strong>${d.kind==="PRODUCT"&&d.unit?` <span style="color:#555;">(${i(d.unit)})</span>`:""}${Pe(d).map(([p,y])=>`<div style="font-size:11px; color:#333;">${i(p)}: <strong>${i(y)}</strong></div>`).join("")}</td>
              <td style="padding:6px; text-align:right;">${d.qty}</td>
              <td style="padding:6px; text-align:right;">${l(d.lineGovtFeePaise)}</td>
              ${re(t)?`<td style="padding:6px;">${i(d.sac||"")}</td>`:""}
              <td style="padding:6px; text-align:right;">${l(d.lineServiceChargePaise)}</td>
              ${S(t)?`<td style="padding:6px; text-align:right;">${Number(d.gstRate||0)}%</td>`:""}
              <td style="padding:6px; text-align:right;">${l(d.totalTaxPaise)}</td>
              <td style="padding:6px; text-align:right; font-weight:700;">${l(d.lineTotalPaise)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="max-width:55%; font-size:11.5px;">
          <div><strong>Amount in Words:</strong> ${i(le(t.grandTotalPaise))}</div>
          ${S(t)&&t.govtFeeTotalPaise>0?'<div style="margin-top:6px;">Government fees are collected on behalf of the department as a pure agent and are not part of the taxable value; GST is charged only on the centre service charges and items sold.</div>':""}
          ${S(t)?'<div style="margin-top:14px; text-align:right;">Authorised signatory</div>':""}
          <div style="margin-top:6px; color:#475569;">${i(s?.footerNote||"")}</div>
        </div>
        <div style="min-width:230px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;"><span>Govt / Statutory Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
          <div style="display:flex; justify-content:space-between;"><span>Centre Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
          ${Ie(t)}
          ${t.roundOffPaise?`<div style="display:flex; justify-content:space-between;"><span>Round off:</span><span>${t.roundOffPaise>0?"+":"-"}${l(Math.abs(t.roundOffPaise))}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; border-top:1px solid #12345A; margin-top:4px; padding-top:4px; font-weight:800; font-size:14px;">
            <span>Grand Total:</span><span>${l(t.grandTotalPaise)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#14804A;"><span>Paid (${i(t.paymentMode)}):</span><span>${l(t.paidPaise)}</span></div>
          ${t.advanceAdjustedPaise>0?`<div style="display:flex; justify-content:space-between;"><span>Advance Adjusted:</span><span>${l(t.advanceAdjustedPaise)}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#C92A2A;"><span>Balance Due:</span><span>${l(t.duePaise)}</span></div>
        </div>
      </div>
    </div>
  `}export{v as renderBillingModule};
