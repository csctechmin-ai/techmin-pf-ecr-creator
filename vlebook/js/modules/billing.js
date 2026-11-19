import{getCurrentUser as Ge,can as de}from"../core/auth.js";import{generateQRMatrix as Le}from"../core/qrcode.js";import{reviewUrlProblem as De}from"../core/dayclose.js";function xe(t){const o=String(t?.googleReviewUrl||"").trim();if(!t?.googleReviewQrEnabled||!o||De(o))return"";try{const f=Le(o,"M"),r=f.size+8;let P="";for(let v=0;v<f.size;v++)for(let E=0;E<f.size;E++)f.modules[v][E]&&(P+=`M${E+4} ${v+4}h1v1h-1z`);const m=Math.min(40,Math.max(15,Number(t.googleReviewQrSizeMm)||22));return`<div style="text-align:center; margin-top:6px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r} ${r}" style="width:${m}mm; height:${m}mm;" role="img" aria-label="QR code to review us on Google" shape-rendering="crispEdges"><rect width="${r}" height="${r}" fill="#fff"/><path d="${P}" fill="#000"/></svg><div style="font-size:10px;">Happy with our service? Scan to review us on Google</div></div>`}catch{return""}}import{logoImgTag as Pe}from"../core/branding.js";import{getLicenceState as Fe,BASIC_DAILY_BILLS as Se}from"../core/licence.js";import{getAllRecords as A,getRecord as Ne,putRecord as we,deleteRecord as qe}from"../core/db.js";import{calculateInvoiceLine as Me,lineGstRate as k,lineRefs as Ie,lineRefsText as je,createMultiServiceInvoice as Oe,cancelInvoiceWithReversal as Be,peekNextInvoiceNo as _e,getCustomer360Profile as ze,notifyCrossTabSync as Ue}from"../core/accounting.js";import{SERVICE_CATEGORIES as Ve}from"./services.js";import{uid as D,todayISO as ce,nowISO as He,formatINR as l,fromPaise as C,toPaise as N,amountInWordsINR as pe,esc as i,buildWhatsAppURL as We,generateSimplePDFBlob as Qe,downloadFile as Ye,printDocumentSheet as Ke}from"../core/utils.js";import{formatWhatsAppTemplate as Xe,getLang as Je,t as Ce}from"../core/i18n.js";let c=[],h=null,g="NONE",x={gstin:"",pos:""},F=!0,V=null,H="A4",q=null,te=null,ue=!1,T={mobile:"",name:""},I=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function M(){await we("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:c,selectedCustomerId:h?.id||null,typedCustomer:T,gstMode:g,billGst:x,applyRoundOff:F,savedAt:He()})}async function y(t,o){const[f,r,P,m,v,E,ke]=await Promise.all([A("services"),A("customers"),A("bills"),Ne("settings","CENTRE_CONFIG"),Ne("drafts","DRAFT_BILLING_VISIT"),A("staff"),A("inventory")]),Ee=(await A("accounts")).filter(e=>e.active!==!1),j=[...ke].sort((e,a)=>String(e.name).localeCompare(String(a.name))),W={};c.filter(e=>e.kind==="PRODUCT").forEach(e=>W[e.itemId]=(W[e.itemId]||0)+(Number(e.qty)||0));const R=e=>{const a=j.find(s=>s.id===e);return a?Math.round(((Number(a.currentStock)||0)-(W[e]||0))*1e3)/1e3:null},O=E.filter(e=>e.active!==!1).sort((e,a)=>e.name.localeCompare(a.name));I&&!O.some(e=>e.id===I)&&(I="");const Q=Ge();Q?.staffId&&Q.role==="OPERATOR"&&O.some(e=>e.id===Q.staffId)&&(I=Q.staffId),!ue&&v&&Array.isArray(v.currentLines)&&v.currentLines.length>0&&(c=v.currentLines,v.selectedCustomerId&&(h=r.find(e=>e.id===v.selectedCustomerId)||null),v.typedCustomer&&(T={mobile:"",name:"",...v.typedCustomer}),v.gstMode&&(g=v.gstMode),v.billGst&&(x=v.billGst),typeof v.applyRoundOff=="boolean"&&(F=v.applyRoundOff),ue=!0),ue=!0;const ve=sessionStorage.getItem("vlebook_preview_bill_id");ve&&(sessionStorage.removeItem("vlebook_preview_bill_id"),V=ve);const fe=sessionStorage.getItem("vlebook_preselect_customer");if(fe){sessionStorage.removeItem("vlebook_preselect_customer");const e=r.find(a=>a.id===fe);e&&(h=e)}const ge=sessionStorage.getItem("vlebook_workbench_bill_item");if(ge){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(ge);c.push(e)}catch{}}const Y=h?await ze(h.id):null,ae=Y?.metrics?.availableAdvancePaise||0,K=c.map(e=>Me(e,g)),ye=K.reduce((e,a)=>e+a.lineGovtFeePaise,0),be=K.reduce((e,a)=>e+a.lineServiceChargePaise,0),he=K.reduce((e,a)=>e+a.totalTaxPaise,0),ie=ye+be+he,B=F?Math.round(ie/100)*100:ie,Re=B-ie,X=[...P].sort((e,a)=>String(a.createdAt||a.date).localeCompare(String(e.createdAt||e.date))),n=V?P.find(e=>e.id===V):X[0];t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Unified Counter Multi-Service Billing & Invoicing</h1>
        <p>Bill multiple services in one citizen visit, separate government fees from service revenue, and print A4 or Thermal receipts</p>
      </div>
      <div class="module-actions">
        <span class="badge badge-info">Next Invoice: ${i(await _e(m))}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Create Multi-Service Counter Invoice</div>
        <div style="display:flex; gap:8px; align-items:center;">
          <label class="form-label" style="margin:0;">Tax Mode:</label>
          <select class="form-control" id="bill-gst-mode" style="width:190px;">
            <option value="NONE" ${g==="NONE"?"selected":""}>Non-GST Bill</option>
            <option value="INTRA" ${g==="INTRA"?"selected":""}>GST Intra-State (CGST+SGST)</option>
            <option value="INTER" ${g==="INTER"?"selected":""}>GST Inter-State (IGST)</option>
          </select>
          ${g!=="NONE"?`<input class="form-control" id="bill-cust-gstin" style="width:170px;" maxlength="15" placeholder="Customer GSTIN (B2B)" aria-label="Customer GSTIN" value="${i(x.gstin)}"><input class="form-control" id="bill-pos" style="width:80px;" maxlength="2" inputmode="numeric" placeholder="State code" title="Place of supply (2-digit state code). Leave empty for your own State." aria-label="Place of supply state code" value="${i(x.pos)}">`:""}
        </div>
      </div>

      <!-- Customer Lookup Strip -->
      <div class="grid-3" style="margin-bottom:14px; background:var(--color-surface-alt); padding:12px; border-radius:var(--radius-sm);">
        <div class="form-group">
          <label class="form-label">Customer Mobile (Auto-Lookup) <span class="req">*</span></label>
          <input type="tel" class="form-control" id="bill-cust-mobile" maxlength="10" placeholder="Enter 10-digit mobile..." value="${i(h?.mobile||T.mobile||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Customer Full Name <span class="req">*</span></label>
          <input type="text" class="form-control" id="bill-cust-name" placeholder="Citizen Full Name" value="${i(h?.name||T.name||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="bill-date" value="${ce()}">
        </div>
      </div>

      ${Y?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${i(h.name)} (${i(h.id)}) |
                Previous Visits: <strong>${Y.metrics.totalVisits}</strong> |
                Pending Due: <strong>${l(Y.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${l(ae)}</strong>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-clear-cust">Clear</button>
            </div>`:""}

      <!-- Quick Service Picker Bar -->
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-service-select" style="max-width:340px;">
          ${f.filter(e=>e.active!==!1).map(e=>`<option value="${i(e.id)}" ${te===e.id?"selected":""}>${i(e.name)} — ${l(e.customerPricePaise)} (Govt: ${l(e.govtFeePaise)})</option>`).join("")}
        </select>
        <button type="button" class="btn btn-teal" id="bill-add-line-btn">Add Service to Visit</button>
        <button type="button" class="btn btn-outline" id="bill-quick-edit-srv-btn" title="Edit the selected service in the catalogue">Edit Selected Service</button>
        <button type="button" class="btn btn-gold" id="bill-quick-new-srv-btn" title="Create a brand-new service and add to list">Create New Service</button>
        <button type="button" class="btn btn-outline" id="bill-add-five-demo-btn" title="Add 5 common citizen services in one click">5-Service Preset</button>
      </div>
      ${j.length?`<div style="display:flex; gap:8px; align-items:center; margin:-4px 0 12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-item-select" style="max-width:420px;">
          ${j.map(e=>`<option value="${i(e.id)}">${i(e.name)} — ${l(e.sellingPricePaise||0)} ${e.priceIncludesGst?"(incl. GST)":"(excl. GST)"} · stock ${i(e.currentStock)} ${i(e.unit||"")}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-outline" id="bill-add-item-btn" title="Sell an item from Stock & Inventory on this bill">Add Item from Stock</button>
      </div>`:""}

      ${q?(()=>{const e=q==="EDIT"?f.find(a=>a.id===te)||f[0]:null;return`
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
                      ${Ve.map(a=>`<option value="${i(a)}" ${e?.category===a?"selected":""}>${i(a)}</option>`).join("")}
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
              ${g!=="NONE"?'<th style="width:90px;">GST %</th>':""}
              <th class="num">Service Rev</th>
              <th class="num">Line Total</th>
              <th>Track App?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${K.map((e,a)=>`
              <tr>
                <td>${a+1}</td>
                <td>
                  <input type="text" class="form-control" data-ln-field="serviceName" data-idx="${a}" value="${i(e.serviceName)}">
                  ${e.kind==="PRODUCT"?`<small style="color:var(--color-text-muted);">Stock item${e.sac?` · HSN ${i(e.sac)}`:""} · price ${e.priceIncludesGst?"includes":"excludes"} GST${R(e.itemId)!==null&&R(e.itemId)<0?` · <strong style="color:var(--color-danger);">Stock will go negative (${i(R(e.itemId))})</strong>`:R(e.itemId)!==null?` · stock after bill ${i(R(e.itemId))}`:""}</small>`:""}
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
                ${g!=="NONE"?`<td><select class="form-control" data-ln-field="gstRate" data-idx="${a}" title="GST on the service charge only (never on the government fee)">${e.gstRate===null||e.gstRate===void 0||e.gstRate===""?'<option value="" selected>Choose</option>':""}${[0,5,12,18,28].map(s=>`<option value="${s}" ${e.gstRate===s?"selected":""}>${s}%</option>`).join("")}</select></td>`:""}
                <td class="num" style="color:var(--color-success); font-weight:600;">${l(e.lineServiceChargePaise)}</td>
                <td class="num"><strong>${l(e.lineTotalPaise)}</strong></td>
                <td>
                  ${e.kind==="PRODUCT"?"—":`<input type="checkbox" data-ln-field="createPendingTask" data-idx="${a}" ${e.createPendingTask?"checked":""} title="Create Application Tracking record">`}
                </td>
                <td>
                  <button type="button" class="btn btn-xs btn-danger" data-remove-ln="${a}">×</button>
                </td>
              </tr>
              ${e.kind==="PRODUCT"?"":`<tr class="ln-refs-row"><td></td><td colspan="${g!=="NONE"?10:9}" style="padding-top:0;">
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;"><small style="color:var(--color-text-muted);">Reference numbers (optional, printed on the invoice):</small>
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="appRefNo" data-idx="${a}" value="${i(/^REF-\d+$/.test(e.appRefNo||"")?"":e.appRefNo||"")}" placeholder="Application No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="ackNo" data-idx="${a}" value="${i(e.ackNo||"")}" placeholder="Acknowledgement No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="trackNo" data-idx="${a}" value="${i(e.trackNo||"")}" placeholder="Tracking No.">
                </div>${(e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0)>0?`<div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:4px;"><small style="color:var(--color-text-muted);">Govt / portal fee ${l((e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0))} paid from:</small>
                <select class="form-control" style="max-width:200px; padding:4px 6px; font-size:12px;" data-ln-field="feePaidFrom" data-idx="${a}" aria-label="Account the government fee was paid from"><option value="">Not paid to portal yet</option>${Ee.map(s=>`<option value="${i(s.id)}" ${c[a]?.feePaidFrom===s.id?"selected":""}>${i(s.name)}</option>`).join("")}</select>
                ${c[a]?.feePaidFrom?`<input type="text" class="form-control" style="max-width:170px; padding:4px 6px; font-size:12px;" maxlength="80" data-ln-field="feeProviderRef" data-idx="${a}" value="${i(c[a].feeProviderRef||"")}" placeholder="Portal transaction ref."><select class="form-control" style="max-width:120px; padding:4px 6px; font-size:12px;" data-ln-field="feeStatus" data-idx="${a}" aria-label="Portal payment status"><option value="SUCCESS">Successful</option><option value="PENDING" ${c[a].feeStatus==="PENDING"?"selected":""}>Pending</option></select><small class="fee-warn" data-fee-warn="${a}" style="color:#B42318;"></small>`:""}
                </div>`:""}</td></tr>`}`).join("")}
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
              ${O.map(e=>`<option value="${i(e.id)}" ${e.id===I?"selected":""}>${i(e.name)}${e.role?` (${i(e.role)})`:""}</option>`).join("")}
            </select>
            ${O.length===0?'<span class="form-hint">Add staff in Staff Commission to track commission per bill.</span>':""}
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
              <input type="number" step="0.01" min="0" max="${C(ae)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${l(ae)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount Paid Now (₹)</label>
              <input type="number" step="0.01" min="0" class="form-control" id="bill-paid-now" value="${C(B).toFixed(2)}">
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
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${l(ye)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${l(be)}</strong>
          </div>
          ${g!=="NONE"?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${g==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${l(he)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <label><input type="checkbox" id="bill-roundoff-chk" ${F?"checked":""}> Apply Round-off</label>
            <span>${l(Re)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${l(B)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${i(pe(B))}</em>
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
          <div class="card-title">Recent Invoices (${X.length})</div>
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
              ${X.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':X.map(e=>`
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
                          ${(e.govtFeeTotalPaise||0)+(e.thirdPartyTotalPaise||0)>0&&de("view_books")?`<button class="btn btn-xs btn-outline" data-fee-chain="${i(e.id)}" title="Government fee: paid to portal and recovered from customer">Fee chain</button>`:""}
                          ${e.status!=="CANCELLED"&&de("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${i(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
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
                    <button class="pill-tab ${H==="A4"?"active":""}" data-fmt="A4">A4 Invoice</button>
                    <button class="pill-tab ${H==="THERMAL"?"active":""}" data-fmt="THERMAL">80mm Thermal</button>
                  </div>
                  <button class="btn btn-xs btn-primary" id="bill-print-btn">Print</button>
                  <button class="btn btn-xs btn-outline" id="bill-pdf-btn">PDF</button>
                  <a href="${i(We(n.customerMobile,Xe(Je(),"invoice",{customerName:n.customerName,centreName:m?.centreName||"VLEBook Centre",invoiceNo:n.invoiceNo,totalAmount:l(n.grandTotalPaise),paidAmount:l(n.paidPaise),dueAmount:l(n.duePaise)},m?.whatsappTemplates)))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${n?Ae(n,m,H):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const J=t.querySelector("#bill-cust-mobile"),se=t.querySelector("#bill-cust-name");J?.addEventListener("input",()=>{const e=J.value.replace(/\D/g,"").slice(-10);if(h||(T.mobile=J.value),e.length===10){const a=r.find(s=>s.mobile===e);a&&(h=a,y(t,o))}}),se?.addEventListener("input",()=>{h||(T.name=se.value)}),t.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{h=null,T={mobile:"",name:""},y(t,o)}),t.querySelector("#bill-gst-mode")?.addEventListener("change",e=>{g=e.target.value,y(t,o)}),t.querySelector("#bill-roundoff-chk")?.addEventListener("change",e=>{F=e.target.checked,y(t,o)}),t.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=t.querySelector("#bill-add-service-select")?.value,a=f.find(s=>s.id===e)||f[0];a&&(c.push({id:D("LN"),serviceId:a.id,serviceName:a.name,category:a.category,qty:1,ratePaise:a.customerPricePaise,govtFeePaise:a.govtFeePaise,thirdPartyPaise:a.thirdPartyPaise||0,directCostPaise:a.directCostPaise||0,commissionPaise:a.commissionPaise||0,discountPaise:0,gstApplicable:k(a)>0,gstRate:k(a),sac:a.sac||"",createPendingTask:a.category==="Government & Citizen Services"}),M().catch(()=>{}),y(t,o))}),t.querySelector("#bill-add-item-btn")?.addEventListener("click",()=>{const e=j.find(a=>a.id===t.querySelector("#bill-add-item-select")?.value);e&&(c.push({id:D("LN"),kind:"PRODUCT",itemId:e.id,unit:e.unit||"",serviceName:e.name,qty:1,ratePaise:Number(e.sellingPricePaise)||0,directCostPaise:Number(e.purchasePricePaise)||0,priceIncludesGst:!!e.priceIncludesGst,gstRate:e.gstRate===void 0||e.gstRate===null||e.gstRate===""?null:Number(e.gstRate),gstApplicable:k(e)>0,sac:e.hsn||"",discountPaise:0}),Number(e.sellingPricePaise)>0||alert("This item has no selling price yet. Type the price in the Rate column, or set it in Stock & Inventory → Items."),M().catch(()=>{}),y(t,o))}),t.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{te=t.querySelector("#bill-add-service-select")?.value||f[0]?.id,q="EDIT",y(t,o)}),t.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{q="CREATE",y(t,o)}),t.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{q=null,y(t,o)}),t.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const a=new FormData(e.target),s=!a.get("id"),p=N(a.get("customerPrice")),G=N(a.get("govtFee")),z=N(a.get("directCost")),$=s?null:f.find(S=>S.id===a.get("id")),d=await we("services",{...$,id:a.get("id")||D("SRV"),name:a.get("name").trim(),category:a.get("category"),state:$?.state||"Kerala / All India",customerPricePaise:p,govtFeePaise:G,thirdPartyPaise:0,serviceChargePaise:Math.max(0,p-G),directCostPaise:z,commissionPaise:$?.commissionPaise||0,gstApplicable:k($||{})>0,gstRate:k($||{}),sac:$?.sac||"",turnaroundTime:$?.turnaroundTime||"Same Day",checklist:$?.checklist||"",active:!0});te=d.id,q=null,s?c.push({id:D("LN"),serviceId:d.id,serviceName:d.name,category:d.category,qty:1,ratePaise:d.customerPricePaise,govtFeePaise:d.govtFeePaise,thirdPartyPaise:0,directCostPaise:d.directCostPaise||0,commissionPaise:0,discountPaise:0,gstApplicable:!1,gstRate:18,createPendingTask:d.category==="Government & Citizen Services"}):c.forEach(S=>{S.serviceId===d.id&&(S.serviceName=d.name,S.ratePaise=d.customerPricePaise,S.govtFeePaise=d.govtFeePaise,S.directCostPaise=d.directCostPaise||0)}),Ue("SERVICE_UPDATED",{id:d.id}),await y(t,o)}),t.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{c=f.slice(0,5).map(e=>({id:D("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,directCostPaise:e.directCostPaise||0,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:k(e)>0,gstRate:k(e),sac:e.sac||"",createPendingTask:e.category==="Government & Citizen Services"})),y(t,o)}),t.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const a=Number(e.getAttribute("data-idx")),s=e.getAttribute("data-ln-field"),p=c[a];p&&(s==="serviceName"?p.serviceName=e.value:s==="qty"?p.qty=p.kind==="PRODUCT"?Math.max(.001,Math.round((Number(e.value)||1)*1e3)/1e3):Math.max(1,Number(e.value)||1):s==="appRefNo"||s==="ackNo"||s==="trackNo"?p[s]=String(e.value||"").trim().slice(0,60):s==="feePaidFrom"?p.feePaidFrom=e.value||"":s==="feeProviderRef"?p.feeProviderRef=String(e.value||"").trim().slice(0,80):s==="feeStatus"?p.feeStatus=e.value==="PENDING"?"PENDING":"SUCCESS":s==="rate"?p.ratePaise=N(e.value):s==="govtFee"?p.govtFeePaise=N(e.value):s==="discount"?p.discountPaise=N(e.value):s==="gstRate"?(p.gstRate=e.value===""?null:Math.max(0,Number(e.value)||0),p.gstApplicable=p.gstRate>0):s==="createPendingTask"&&(p.createPendingTask=e.checked),await M(),y(t,o))})}),t.querySelectorAll("[data-fee-warn]").forEach(async e=>{const a=c[Number(e.getAttribute("data-fee-warn"))];if(a?.feePaidFrom)try{const{walletWarning:s}=await import("../core/wallets.js");e.textContent=await s(a.feePaidFrom,((a.govtFeePaise||0)+(a.thirdPartyPaise||0))*(a.qty||1))}catch{}}),["#bill-cust-gstin","#bill-pos"].forEach(e=>t.querySelector(e)?.addEventListener("change",async a=>{e==="#bill-cust-gstin"?x.gstin=String(a.target.value||"").toUpperCase().replace(/[^0-9A-Z]/g,""):x.pos=String(a.target.value||"").replace(/\D/g,"").slice(0,2),await M()})),t.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const a=Number(e.getAttribute("data-remove-ln"));a>=0&&a<c.length&&(c.splice(a,1),await M(),y(t,o))})});const _=t.querySelector("#bill-paid-now"),oe=t.querySelector("#bill-advance-adj"),$e=t.querySelector("#bill-due-preview"),le=t.querySelector("#bill-pay-mode");t.querySelector("#bill-staff")?.addEventListener("change",e=>{I=e.target.value;try{localStorage.setItem("vlebook_last_staff",I)}catch{}});const ne=()=>{const e=N(_?.value||0),a=N(oe?.value||0),s=Math.max(0,B-e-a);$e&&($e.value=l(s))};_?.addEventListener("input",ne),oe?.addEventListener("input",ne),le?.addEventListener("change",()=>{le.value==="CREDIT"&&_&&(_.value="0.00",ne())}),t.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=J?.value.trim()||"",a=se?.value.trim()||"Walk-in Citizen",s=t.querySelector("#bill-date")?.value||ce(),p=le?.value||"CASH",G=p==="CREDIT"?0:N(_?.value||0),z=N(oe?.value||0),$=t.querySelector("#bill-notes")?.value||"";if(c.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const d=e.replace(/\D/g,"");if(d&&d.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}if((await Fe()).tier==="BASIC"){const u=ce(),re=L=>{if(L.date)return String(L.date).slice(0,10);const ee=new Date(L.createdAt||0);return Number.isNaN(ee.getTime())?"":`${ee.getFullYear()}-${String(ee.getMonth()+1).padStart(2,"0")}-${String(ee.getDate()).padStart(2,"0")}`};if((await A("bills")).filter(L=>re(L)===u&&L.status!=="CANCELLED").length>=Se){alert(`Basic mode allows ${Se} invoices a day, and today's limit is reached. Buy or renew a licence in Users & Licence to make unlimited invoices.`);return}}if(g!=="NONE"&&!String(m?.gstin||"").trim()){alert(Ce('A GST bill needs your GSTIN. Add it in Settings & Centre Setup, or choose "Non-GST Bill".'));return}const b=g!=="NONE"?c.filter(u=>u.kind==="PRODUCT"&&(u.gstRate===null||u.gstRate===void 0||u.gstRate==="")):[];if(b.length){alert(`${Ce("Choose the GST rate for these items in the GST % column (or in Stock & Inventory):")} ${b.map(u=>u.serviceName).join(", ")}`);return}const Z=Object.keys(W).map(u=>({id:u,left:R(u),name:j.find(re=>re.id===u)?.name})).filter(u=>u.left!==null&&u.left<0);if(Z.length&&!confirm(`Negative stock alert:
${Z.map(u=>`${u.name}: stock after this bill ${u.left}`).join(`
`)}

The software stock is less than the quantity billed. Save the bill anyway? (Record the missing purchase or a physical stock check later.)`))return;let U;try{U=await Oe({date:s,customerId:h?.id||null,customerName:a,customerMobile:e,gstMode:g,...g!=="NONE"&&x.gstin?{customerGstin:x.gstin}:{},...g!=="NONE"&&x.pos?{placeOfSupply:x.pos}:{},applyRoundOff:F,items:c,paidPaise:G,advanceAdjustedPaise:z,paymentMode:p,staffId:I||null,staffName:O.find(u=>u.id===I)?.name||"",notes:$})}catch(u){alert(u.message||"Could not create the invoice.");return}V=U.id,x={gstin:"",pos:""},c=[],h=null,T={mobile:"",name:""},await qe("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await y(t,o)}),t.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{V=e.getAttribute("data-view-bill"),y(t,o)})}),t.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=P.find(s=>s.id===e.getAttribute("data-dup-bill"));a&&(c=(a.items||[]).map(s=>({...s,id:D("LN"),ratePaise:s.unitRatePaise,govtFeePaise:s.unitGovtFeePaise,thirdPartyPaise:s.unitThirdPartyPaise,directCostPaise:s.unitDirectCostPaise,commissionPaise:s.unitCommissionPaise})),await M(),y(t,o))})}),t.querySelectorAll("[data-fee-chain]").forEach(e=>e.addEventListener("click",async()=>{const{showFeeChain:a}=await import("./books.js");a(e.getAttribute("data-fee-chain")).catch(s=>alert(s.message))})),t.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-cancel-bill");if(!de("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await Be(a,"Operator issued cancellation & credit note"),await y(t,o)})}),t.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",a=>{a.preventDefault();const s=e.getAttribute("data-jump-c360");o("customers",s)})}),t.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{H=e.getAttribute("data-fmt"),y(t,o)})}),t.querySelector("#bill-print-btn")?.addEventListener("click",()=>{n&&Ke(Ae(n,m,H))}),t.querySelector("#bill-pdf-btn")?.addEventListener("click",()=>{if(!n)return;const e=w(n),a=me(n),s=b=>(Number(b||0)/100).toFixed(2),G=[[m?.address,m?.district,m?.state,m?.pinCode].filter(Boolean).join(", "),m?.gstin?`GSTIN: ${m.gstin}`:"",`Invoice ${n.invoiceNo} | Date: ${n.date} | Status: ${n.status}`,`Customer: ${n.customerName} (${n.customerMobile||"N/A"})`,e?`Place of supply: ${m?.state||""}`:""].filter(Boolean).join(" | "),z=["Service / item",...a?["HSN/SAC"]:[],"Qty","Govt Fee",e?"Taxable value":"Service Chg",...e?["GST %"]:[],"GST","Line Total"],$=(n.items||[]).map(b=>[b.serviceName.slice(0,24),...a?[b.sac||""]:[],String(b.qty),s(b.lineGovtFeePaise),s(b.lineServiceChargePaise),...e?[`${Number(b.gstRate||0)}%`]:[],s(b.totalTaxPaise),s(b.lineTotalPaise)]),d=[];(n.items||[]).forEach((b,Z)=>{const U=je(b);U&&d.push(`${Z+1}. ${b.serviceName}: ${U}`)}),e&&(d.push(`Taxable value: Rs.${s(n.serviceChargeTotalPaise)} | `+(n.gstMode==="INTER"?`IGST: Rs.${s(n.igstPaise)}`:`CGST: Rs.${s(n.cgstPaise)} | SGST: Rs.${s(n.sgstPaise)}`)),n.govtFeeTotalPaise>0&&d.push("Government fees are collected as a pure agent and are not taxable; GST is on the centre service charges and items sold only.")),n.roundOffPaise&&d.push(`Round off: ${n.roundOffPaise>0?"+":"-"}Rs.${s(Math.abs(n.roundOffPaise))}`),d.push(`Grand Total: Rs.${s(n.grandTotalPaise)} (${pe(n.grandTotalPaise)})`),d.push(`Paid: Rs.${s(n.paidPaise)} | Advance Adj: Rs.${s(n.advanceAdjustedPaise||0)} | Balance Due: Rs.${s(n.duePaise)}`);const S=Qe(`${m?.centreName||"VLEBook Digital Service Centre"} - ${e?"Tax Invoice":"Invoice"} ${n.invoiceNo}`,G,z,$,d);Ye(S,`Invoice_${n.invoiceNo}.pdf`,"application/pdf")})}function w(t){return t?.gstMode==="INTRA"||t?.gstMode==="INTER"}function me(t){return(t?.items||[]).some(o=>o.sac)}function Te(t){if(!w(t))return"";const o=(f,r)=>`<div style="display:flex; justify-content:space-between;"><span>${f}:</span><span>${l(r)}</span></div>`;return t.gstMode==="INTER"?o("IGST",t.igstPaise||0):o("CGST",t.cgstPaise||0)+o("SGST",t.sgstPaise||0)}function Ae(t,o,f="A4"){return f==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${Pe(o,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${i(o?.centreName||"VLEBook Centre")}</strong><br>
          <span>${i(o?.address||"")}</span><br>
          <span>Mob: ${i(o?.mobile||"")}</span>
          ${o?.gstin?`<br><span>GSTIN: ${i(o.gstin)}</span>`:""}${o?.akshayaId?`<br><span>Akshaya ID: ${i(o.akshayaId)}</span>`:""}${o?.cscId?`<br><span>CSC ID: ${i(o.cscId)}</span>`:""}
        </div>
        <div>
          ${w(t)?'<div style="text-align:center; font-weight:700;">TAX INVOICE</div>':""}
          <strong>Inv: ${i(t.invoiceNo)}</strong> | Date: ${i(t.date)}<br>
          Cust: ${i(t.customerName)} (${i(t.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(t.items||[]).map(r=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${i(r.serviceName.slice(0,20))} x${r.qty}</span>
              <span>${l(r.lineTotalPaise)}</span>
            </div>${Ie(r).map(([P,m])=>`<div style="font-size:10px;">${i(P)}: ${i(m)}</div>`).join("")}`).join("")}
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Govt Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
        ${Te(t)}
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px; margin-top:4px;">
          <span>TOTAL:</span><span>${l(t.grandTotalPaise)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Paid (${i(t.paymentMode)}):</span><span>${l(t.paidPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Balance Due:</span><span>${l(t.duePaise)}</span></div>
        ${xe(o)}
        <div style="text-align:center; margin-top:8px; font-size:10px;">
          ${i(o?.footerNote||"Thank you for visiting!")}
        </div>
      </div>
    `:`
    <div class="invoice-sheet-a4">
      <div style="display:flex; justify-content:space-between; border-bottom:2px solid #12345A; padding-bottom:10px; margin-bottom:12px;">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          ${Pe(o,"max-height:64px; max-width:140px; object-fit:contain;")}
          <div>
          <h2 style="color:#12345A; margin:0; font-size:18px;">${i(o?.centreName||"VLEBook Digital Service Centre")}</h2>
          <div>${i(o?.address||"")}, ${i(o?.district||"")}, ${i(o?.state||"")} - ${i(o?.pinCode||"")}</div>
          <div>Phone: ${i(o?.mobile||"")} | Email: ${i(o?.email||"")}</div>
          ${o?.gstin?`<div><strong>GSTIN:</strong> ${i(o.gstin)}</div>`:""}${o?.akshayaId?`<div><strong>Akshaya ID:</strong> ${i(o.akshayaId)}</div>`:""}${o?.cscId?`<div><strong>CSC ID:</strong> ${i(o.cscId)}</div>`:""}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#087E8B;">${w(t)?"TAX INVOICE":"SERVICE INVOICE / RECEIPT"}</div>
          ${w(t)?`<div><strong>Place of supply:</strong> ${i(o?.state||"")}</div>`:""}
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
            ${me(t)?'<th style="padding:6px; text-align:left;">HSN/SAC</th>':""}
            <th style="padding:6px; text-align:right;">${w(t)?"Taxable value":"Service Charge"}</th>
            ${w(t)?'<th style="padding:6px; text-align:right;">GST %</th>':""}
            <th style="padding:6px; text-align:right;">GST</th>
            <th style="padding:6px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(t.items||[]).map((r,P)=>`
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:6px;">${P+1}</td>
              <td style="padding:6px;"><strong>${i(r.serviceName)}</strong>${r.kind==="PRODUCT"&&r.unit?` <span style="color:#555;">(${i(r.unit)})</span>`:""}${Ie(r).map(([m,v])=>`<div style="font-size:11px; color:#333;">${i(m)}: <strong>${i(v)}</strong></div>`).join("")}</td>
              <td style="padding:6px; text-align:right;">${r.qty}</td>
              <td style="padding:6px; text-align:right;">${l(r.lineGovtFeePaise)}</td>
              ${me(t)?`<td style="padding:6px;">${i(r.sac||"")}</td>`:""}
              <td style="padding:6px; text-align:right;">${l(r.lineServiceChargePaise)}</td>
              ${w(t)?`<td style="padding:6px; text-align:right;">${Number(r.gstRate||0)}%</td>`:""}
              <td style="padding:6px; text-align:right;">${l(r.totalTaxPaise)}</td>
              <td style="padding:6px; text-align:right; font-weight:700;">${l(r.lineTotalPaise)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="max-width:55%; font-size:11.5px;">
          <div><strong>Amount in Words:</strong> ${i(pe(t.grandTotalPaise))}</div>
          ${w(t)&&t.govtFeeTotalPaise>0?'<div style="margin-top:6px;">Government fees are collected on behalf of the department as a pure agent and are not part of the taxable value; GST is charged only on the centre service charges and items sold.</div>':""}
          ${w(t)?'<div style="margin-top:14px; text-align:right;">Authorised signatory</div>':""}
          <div style="margin-top:6px; color:#475569;">${i(o?.footerNote||"")}</div>
          ${xe(o)}
        </div>
        <div style="min-width:230px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;"><span>Govt / Statutory Fees:</span><span>${l(t.govtFeeTotalPaise)}</span></div>
          <div style="display:flex; justify-content:space-between;"><span>Centre Service Charges:</span><span>${l(t.serviceChargeTotalPaise)}</span></div>
          ${Te(t)}
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
  `}export{y as renderBillingModule};
