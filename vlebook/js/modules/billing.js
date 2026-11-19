import{getCurrentUser as Be,can as oe}from"../core/auth.js";import{generateQRMatrix as Me}from"../core/qrcode.js";import{reviewUrlProblem as je}from"../core/dayclose.js";function Ce(t){const o=String(t?.googleReviewUrl||"").trim();if(!t?.googleReviewQrEnabled||!o||je(o))return"";try{const f=Me(o,"M"),r=f.size+8;let S="";for(let u=0;u<f.size;u++)for(let D=0;D<f.size;D++)f.modules[u][D]&&(S+=`M${D+4} ${u+4}h1v1h-1z`);const m=Math.min(40,Math.max(15,Number(t.googleReviewQrSizeMm)||22));return`<div style="text-align:center; margin-top:6px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r} ${r}" style="width:${m}mm; height:${m}mm;" role="img" aria-label="QR code to review us on Google" shape-rendering="crispEdges"><rect width="${r}" height="${r}" fill="#fff"/><path d="${S}" fill="#000"/></svg><div style="font-size:10px;">Happy with our service? Scan to review us on Google</div></div>`}catch{return""}}import{logoImgTag as Ne}from"../core/branding.js";import{getLicenceState as _e,BASIC_DAILY_BILLS as Ae}from"../core/licence.js";import{getAllRecords as G,getRecord as Ee,putRecord as Re,deleteRecord as ze}from"../core/db.js";import{STATES as ge,ratesInForce as Ue}from"../core/gst.js";import{gstRegistrationOf as Ve,resolveBillGstMode as He,calculateInvoiceLine as We,lineGstRate as C,lineRefs as ke,lineRefsText as Qe,createMultiServiceInvoice as Ye,cancelInvoiceWithReversal as Xe,peekNextInvoiceNo as Ke,getCustomer360Profile as Je,notifyCrossTabSync as Ze}from"../core/accounting.js";import{SERVICE_CATEGORIES as et}from"./services.js";import{uid as O,todayISO as W,nowISO as tt,formatINR as n,fromPaise as L,toPaise as N,amountInWordsINR as fe,esc as s,buildWhatsAppURL as at,generateSimplePDFBlob as st,downloadFile as it,printDocumentSheet as ot}from"../core/utils.js";import{formatWhatsAppTemplate as lt,getLang as nt,t as x}from"../core/i18n.js";let c=[],h=null,T="NONE",$={gstin:"",pos:""},B=!0,Q=null,Y="A4",M=null,le=null,ye=!1,k={mobile:"",name:""},A=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function j(){await Re("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:c,selectedCustomerId:h?.id||null,typedCustomer:k,gstMode:T,billGst:$,applyRoundOff:B,savedAt:tt()})}async function g(t,o){const[f,r,S,m,u,D,De]=await Promise.all([G("services"),G("customers"),G("bills"),Ee("settings","CENTRE_CONFIG"),Ee("drafts","DRAFT_BILLING_VISIT"),G("staff"),G("inventory")]),Fe=(await G("accounts")).filter(e=>e.active!==!1),I=Ve(m||{},W());!$.gstin&&h?.gstin&&I.type==="REGULAR"&&($.gstin=h.gstin);try{T=He(m||{},{requested:"",placeOfSupply:$.pos,customerGstin:$.gstin})}catch{T=I.type==="REGULAR"?"INTRA":I.type==="COMPOSITION"?"COMPOSITION":"NONE"}const R=T==="INTRA"||T==="INTER",qe=R?await Ue(W()):[],_=[...De].sort((e,a)=>String(e.name).localeCompare(String(a.name))),K={};c.filter(e=>e.kind==="PRODUCT").forEach(e=>K[e.itemId]=(K[e.itemId]||0)+(Number(e.qty)||0));const F=e=>{const a=_.find(i=>i.id===e);return a?Math.round(((Number(a.currentStock)||0)-(K[e]||0))*1e3)/1e3:null},z=D.filter(e=>e.active!==!1).sort((e,a)=>e.name.localeCompare(a.name));A&&!z.some(e=>e.id===A)&&(A="");const J=Be();J?.staffId&&J.role==="OPERATOR"&&z.some(e=>e.id===J.staffId)&&(A=J.staffId),!ye&&u&&Array.isArray(u.currentLines)&&u.currentLines.length>0&&(c=u.currentLines,u.selectedCustomerId&&(h=r.find(e=>e.id===u.selectedCustomerId)||null),u.typedCustomer&&(k={mobile:"",name:"",...u.typedCustomer}),u.gstMode&&(T=u.gstMode),u.billGst&&($=u.billGst),typeof u.applyRoundOff=="boolean"&&(B=u.applyRoundOff),ye=!0),ye=!0;const he=sessionStorage.getItem("vlebook_preview_bill_id");he&&(sessionStorage.removeItem("vlebook_preview_bill_id"),Q=he);const $e=sessionStorage.getItem("vlebook_preselect_customer");if($e){sessionStorage.removeItem("vlebook_preselect_customer");const e=r.find(a=>a.id===$e);e&&(h=e)}const xe=sessionStorage.getItem("vlebook_workbench_bill_item");if(xe){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(xe);c.push(e)}catch{}}const Z=h?await Je(h.id):null,re=Z?.metrics?.availableAdvancePaise||0,ee=c.map(e=>We(e,T)),Pe=ee.reduce((e,a)=>e+a.lineGovtFeePaise,0),Se=ee.reduce((e,a)=>e+a.lineServiceChargePaise,0),Ie=ee.reduce((e,a)=>e+a.totalTaxPaise,0),de=Pe+Se+Ie,U=B?Math.round(de/100)*100:de,Oe=U-de,te=[...S].sort((e,a)=>String(a.createdAt||a.date).localeCompare(String(e.createdAt||e.date))),l=Q?S.find(e=>e.id===Q):te[0];t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Unified Counter Multi-Service Billing & Invoicing</h1>
        <p>Bill multiple services in one citizen visit, separate government fees from service revenue, and print A4 or Thermal receipts</p>
      </div>
      <div class="module-actions">
        <span class="badge badge-info">Next Invoice: ${s(await Ke(m))}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Create Multi-Service Counter Invoice</div>
        <div style="display:flex; gap:8px; align-items:center;">
          ${I.type==="UNREGISTERED"?`<span class="badge badge-info" title="${s(x("Your centre is not GST registered, so bills carry no GST. Add your GSTIN in Books & GST → GST profile if you register."))}">${x("Bill (no GST)")}</span>`:I.type==="COMPOSITION"?`<span class="badge badge-warning" title="${s(x("Composition dealer: Bill of Supply, no GST is collected from customers."))}">${x("Bill of Supply (composition)")}</span>`:`<span class="badge badge-success">${x("Tax Invoice")} · ${T==="INTER"?"IGST":"CGST + SGST"}</span>
          <input class="form-control" id="bill-cust-gstin" style="width:175px;" maxlength="15" placeholder="${s(x("Customer GSTIN (optional)"))}" title="${s(x("Give the GSTIN of a registered customer so they can claim input tax credit (B2B)."))}" aria-label="Customer GSTIN" value="${s($.gstin)}">
          <select class="form-control" id="bill-pos" style="width:190px;" aria-label="Place of supply" title="${s(x("Place of supply. Your own State gives CGST + SGST; another State gives IGST."))}"><option value="">${x("Place of supply")}: ${s(ge[I.stateCode]||I.stateCode)}</option>${Object.entries(ge).filter(([e])=>e!==I.stateCode&&!["97","99"].includes(e)).map(([e,a])=>`<option value="${e}" ${$.pos===e?"selected":""}>${e} ${s(a)}</option>`).join("")}</select>`}
          <span id="bill-gstin-msg" style="font-size:12px; color:#B42318;"></span>
        </div>
      </div>

      <!-- Customer Lookup Strip -->
      <div class="grid-3" style="margin-bottom:14px; background:var(--color-surface-alt); padding:12px; border-radius:var(--radius-sm);">
        <div class="form-group">
          <label class="form-label">Customer Mobile (Auto-Lookup) <span class="req">*</span></label>
          <input type="tel" class="form-control" id="bill-cust-mobile" maxlength="10" placeholder="Enter 10-digit mobile..." value="${s(h?.mobile||k.mobile||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Customer Full Name <span class="req">*</span></label>
          <input type="text" class="form-control" id="bill-cust-name" placeholder="Citizen Full Name" value="${s(h?.name||k.name||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="bill-date" value="${W()}">
        </div>
      </div>

      ${Z?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${s(h.name)} (${s(h.id)}) |
                Previous Visits: <strong>${Z.metrics.totalVisits}</strong> |
                Pending Due: <strong>${n(Z.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${n(re)}</strong>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-clear-cust">Clear</button>
            </div>`:""}

      <!-- Quick Service Picker Bar -->
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-service-select" style="max-width:340px;">
          ${f.filter(e=>e.active!==!1).map(e=>`<option value="${s(e.id)}" ${le===e.id?"selected":""}>${s(e.name)} — ${n(e.customerPricePaise)} (Govt: ${n(e.govtFeePaise)})</option>`).join("")}
        </select>
        <button type="button" class="btn btn-teal" id="bill-add-line-btn">Add Service to Visit</button>
        <button type="button" class="btn btn-outline" id="bill-quick-edit-srv-btn" title="Edit the selected service in the catalogue">Edit Selected Service</button>
        <button type="button" class="btn btn-gold" id="bill-quick-new-srv-btn" title="Create a brand-new service and add to list">Create New Service</button>
        <button type="button" class="btn btn-outline" id="bill-add-five-demo-btn" title="Add 5 common citizen services in one click">5-Service Preset</button>
      </div>
      ${_.length?`<div style="display:flex; gap:8px; align-items:center; margin:-4px 0 12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-item-select" style="max-width:420px;">
          ${_.map(e=>`<option value="${s(e.id)}">${s(e.name)} — ${n(e.sellingPricePaise||0)} ${e.priceIncludesGst?"(incl. GST)":"(excl. GST)"} · stock ${s(e.currentStock)} ${s(e.unit||"")}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-outline" id="bill-add-item-btn" title="Sell an item from Stock & Inventory on this bill">Add Item from Stock</button>
      </div>`:""}

      ${M?(()=>{const e=M==="EDIT"?f.find(a=>a.id===le)||f[0]:null;return`
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
                      ${et.map(a=>`<option value="${s(a)}" ${e?.category===a?"selected":""}>${s(a)}</option>`).join("")}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                    <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" required value="${e?L(e.customerPricePaise):"100"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Govt / Challan Fee (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="govtFee" value="${e?L(e.govtFeePaise):"0"}">
                  </div>
                  ${I.type==="REGULAR"?`<div class="form-group">
                    <label class="form-label">${x("GST on this price")}</label>
                    <select class="form-control" name="gstPricing">
                      <option value="PLUS" ${e?.priceIncludesGst?"":"selected"}>${x("Price + GST (GST added on top)")}</option>
                      <option value="INCL" ${e?.priceIncludesGst?"selected":""}>${x("Price includes GST")}</option>
                    </select>
                  </div>`:""}
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
              ${R?'<th style="width:110px;">GST %</th>':""}
              <th class="num">Service Rev</th>
              <th class="num">Line Total</th>
              <th>Track App?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${ee.map((e,a)=>`
              <tr>
                <td>${a+1}</td>
                <td>
                  <input type="text" class="form-control" data-ln-field="serviceName" data-idx="${a}" value="${s(e.serviceName)}">
                  ${e.kind==="PRODUCT"?`<small style="color:var(--color-text-muted);">Stock item${e.sac?` · HSN ${s(e.sac)}`:""} · price ${e.priceIncludesGst?"includes":"excludes"} GST${F(e.itemId)!==null&&F(e.itemId)<0?` · <strong style="color:var(--color-danger);">Stock will go negative (${s(F(e.itemId))})</strong>`:F(e.itemId)!==null?` · stock after bill ${s(F(e.itemId))}`:""}</small>`:""}
                </td>
                <td>
                  <input type="number" min="${e.kind==="PRODUCT"?"0.001":"1"}" step="${e.kind==="PRODUCT"?"any":"1"}" class="form-control" data-ln-field="qty" data-idx="${a}" value="${e.qty}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="rate" data-idx="${a}" value="${L(e.unitRatePaise)}">
                </td>
                <td>
                  ${e.kind==="PRODUCT"?'<span style="color:var(--color-text-muted);">—</span>':`<input type="number" step="0.01" min="0" class="form-control" data-ln-field="govtFee" data-idx="${a}" value="${L(e.unitGovtFeePaise)}">`}
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="discount" data-idx="${a}" value="${L(e.discountPaise)}">
                </td>
                ${R?`<td><select class="form-control" data-ln-field="gstRate" data-idx="${a}" title="GST on the service charge only (never on the government fee)">${!c[a]?.gstExempt&&(e.gstRate===null||e.gstRate===void 0||e.gstRate==="")?'<option value="" selected>Choose</option>':""}${[...new Set([...qe,...e.gstRate!==""&&e.gstRate!=null?[Number(e.gstRate)]:[]])].sort((i,d)=>i-d).map(i=>`<option value="${i}" ${!c[a]?.gstExempt&&e.gstRate===i?"selected":""}>${i}%</option>`).join("")}<option value="EX" ${c[a]?.gstExempt?"selected":""}>${x("Exempt")}</option></select>
                    <label style="font-size:11px; display:flex; gap:4px; align-items:center; margin-top:2px;" title="${s(x("Tick when the rate you typed already includes GST"))}"><input type="checkbox" data-ln-field="priceIncludesGst" data-idx="${a}" ${c[a]?.priceIncludesGst?"checked":""}> ${x("incl. GST")}</label></td>`:""}
                <td class="num" style="color:var(--color-success); font-weight:600;">${n(e.lineServiceChargePaise)}</td>
                <td class="num"><strong>${n(e.lineTotalPaise)}</strong></td>
                <td>
                  ${e.kind==="PRODUCT"?"—":`<input type="checkbox" data-ln-field="createPendingTask" data-idx="${a}" ${e.createPendingTask?"checked":""} title="Create Application Tracking record">`}
                </td>
                <td>
                  <button type="button" class="btn btn-xs btn-danger" data-remove-ln="${a}">×</button>
                </td>
              </tr>
              ${e.kind==="PRODUCT"?"":`<tr class="ln-refs-row"><td></td><td colspan="${R?10:9}" style="padding-top:0;">
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;"><small style="color:var(--color-text-muted);">Reference numbers (optional, printed on the invoice):</small>
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="appRefNo" data-idx="${a}" value="${s(/^REF-\d+$/.test(e.appRefNo||"")?"":e.appRefNo||"")}" placeholder="Application No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="ackNo" data-idx="${a}" value="${s(e.ackNo||"")}" placeholder="Acknowledgement No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="trackNo" data-idx="${a}" value="${s(e.trackNo||"")}" placeholder="Tracking No.">
                </div>${(e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0)>0?`<div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:4px;"><small style="color:var(--color-text-muted);">Govt / portal fee ${n((e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0))} paid from:</small>
                <select class="form-control" style="max-width:200px; padding:4px 6px; font-size:12px;" data-ln-field="feePaidFrom" data-idx="${a}" aria-label="Account the government fee was paid from"><option value="">Not paid to portal yet</option>${Fe.map(i=>`<option value="${s(i.id)}" ${c[a]?.feePaidFrom===i.id?"selected":""}>${s(i.name)}</option>`).join("")}</select>
                ${c[a]?.feePaidFrom?`<input type="text" class="form-control" style="max-width:170px; padding:4px 6px; font-size:12px;" maxlength="80" data-ln-field="feeProviderRef" data-idx="${a}" value="${s(c[a].feeProviderRef||"")}" placeholder="Portal transaction ref."><select class="form-control" style="max-width:120px; padding:4px 6px; font-size:12px;" data-ln-field="feeStatus" data-idx="${a}" aria-label="Portal payment status"><option value="SUCCESS">Successful</option><option value="PENDING" ${c[a].feeStatus==="PENDING"?"selected":""}>Pending</option></select><small class="fee-warn" data-fee-warn="${a}" style="color:#B42318;"></small>`:""}
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
              ${z.map(e=>`<option value="${s(e.id)}" ${e.id===A?"selected":""}>${s(e.name)}${e.role?` (${s(e.role)})`:""}</option>`).join("")}
            </select>
            ${z.length===0?'<span class="form-hint">Add staff in Staff Commission to track commission per bill.</span>':""}
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
              <input type="number" step="0.01" min="0" max="${L(re)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${n(re)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount Paid Now (₹)</label>
              <input type="number" step="0.01" min="0" class="form-control" id="bill-paid-now" value="${L(U).toFixed(2)}">
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
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${n(Pe)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${n(Se)}</strong>
          </div>
          ${R?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${T==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${n(Ie)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <label><input type="checkbox" id="bill-roundoff-chk" ${B?"checked":""}> Apply Round-off</label>
            <span>${n(Oe)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${n(U)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${s(fe(U))}</em>
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
          <div class="card-title">Recent Invoices (${te.length})</div>
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
              ${te.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':te.map(e=>`
                    <tr>
                      <td><strong>${s(e.invoiceNo)}</strong><br><small style="color:var(--color-text-muted);">${s(e.date)}</small></td>
                      <td>
                        <a href="#" data-jump-c360="${s(e.customerId)}" style="color:var(--color-teal); font-weight:600;">${s(e.customerName)}</a><br>
                        <small style="color:var(--color-text-muted);">${(e.items||[]).length} services</small>
                      </td>
                      <td class="num">${n(e.grandTotalPaise)}</td>
                      <td class="num" style="color:var(--color-success);">${n(e.paidPaise)}</td>
                      <td class="num" style="color:${e.duePaise>0?"var(--color-danger)":"var(--color-text-muted)"};">${n(e.duePaise)}</td>
                      <td>
                        <span class="badge ${e.status==="PAID"?"badge-success":e.status==="PARTIAL"?"badge-warning":e.status==="CANCELLED"?"badge-neutral":"badge-danger"}">${s(e.status)}</span>
                      </td>
                      <td>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                          <button class="btn btn-xs btn-teal" data-view-bill="${s(e.id)}">View/Print</button>
                          <button class="btn btn-xs btn-outline" data-dup-bill="${s(e.id)}" title="Duplicate items into new bill">Dup</button>
                          ${e.status!=="CANCELLED"&&(e.duePaise||0)>0&&oe("reverse_voucher")?`<button class="btn btn-xs btn-outline" data-credit-note="${s(e.id)}" title="Reduce the service charge on this bill after billing">Credit note</button>`:""}
                          ${(e.govtFeeTotalPaise||0)+(e.thirdPartyTotalPaise||0)>0&&oe("view_books")?`<button class="btn btn-xs btn-outline" data-fee-chain="${s(e.id)}" title="Government fee: paid to portal and recovered from customer">Fee chain</button>`:""}
                          ${e.status!=="CANCELLED"&&oe("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${s(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
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
          ${l?`<div style="display:flex; gap:6px; flex-wrap:wrap;">
                  <div class="pill-tabs">
                    <button class="pill-tab ${Y==="A4"?"active":""}" data-fmt="A4">A4 Invoice</button>
                    <button class="pill-tab ${Y==="THERMAL"?"active":""}" data-fmt="THERMAL">80mm Thermal</button>
                  </div>
                  <button class="btn btn-xs btn-primary" id="bill-print-btn">Print</button>
                  <button class="btn btn-xs btn-outline" id="bill-pdf-btn">PDF</button>
                  <a href="${s(at(l.customerMobile,lt(nt(),"invoice",{customerName:l.customerName,centreName:m?.centreName||"VLEBook Centre",invoiceNo:l.invoiceNo,totalAmount:n(l.grandTotalPaise),paidAmount:n(l.paidPaise),dueAmount:n(l.duePaise)},m?.whatsappTemplates)))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${l?Le(l,m,Y):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const ae=t.querySelector("#bill-cust-mobile"),ce=t.querySelector("#bill-cust-name");ae?.addEventListener("input",()=>{const e=ae.value.replace(/\D/g,"").slice(-10);if(h||(k.mobile=ae.value),e.length===10){const a=r.find(i=>i.mobile===e);a&&(h=a,g(t,o))}}),ce?.addEventListener("input",()=>{h||(k.name=ce.value)}),t.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{h=null,k={mobile:"",name:""},g(t,o)}),t.querySelector("#bill-roundoff-chk")?.addEventListener("change",e=>{B=e.target.checked,g(t,o)}),t.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=t.querySelector("#bill-add-service-select")?.value,a=f.find(i=>i.id===e)||f[0];a&&(c.push({id:O("LN"),serviceId:a.id,serviceName:a.name,category:a.category,qty:1,ratePaise:a.customerPricePaise,govtFeePaise:a.govtFeePaise,thirdPartyPaise:a.thirdPartyPaise||0,priceIncludesGst:!!a.priceIncludesGst,gstExempt:!!a.gstExempt,commissionPaise:a.commissionPaise||0,discountPaise:0,gstApplicable:C(a)>0,gstRate:C(a),sac:a.sac||"",createPendingTask:a.category==="Government & Citizen Services"}),j().catch(()=>{}),g(t,o))}),t.querySelector("#bill-add-item-btn")?.addEventListener("click",()=>{const e=_.find(a=>a.id===t.querySelector("#bill-add-item-select")?.value);e&&(c.push({id:O("LN"),kind:"PRODUCT",itemId:e.id,unit:e.unit||"",serviceName:e.name,qty:1,ratePaise:Number(e.sellingPricePaise)||0,directCostPaise:Number(e.purchasePricePaise)||0,priceIncludesGst:!!e.priceIncludesGst,gstRate:e.gstRate===void 0||e.gstRate===null||e.gstRate===""?null:Number(e.gstRate),gstApplicable:C(e)>0,sac:e.hsn||"",discountPaise:0}),Number(e.sellingPricePaise)>0||alert("This item has no selling price yet. Type the price in the Rate column, or set it in Stock & Inventory → Items."),j().catch(()=>{}),g(t,o))}),t.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{le=t.querySelector("#bill-add-service-select")?.value||f[0]?.id,M="EDIT",g(t,o)}),t.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{M="CREATE",g(t,o)}),t.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{M=null,g(t,o)}),t.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const a=new FormData(e.target),i=!a.get("id"),d=N(a.get("customerPrice")),w=N(a.get("govtFee")),P=i?null:f.find(y=>y.id===a.get("id")),v=await Re("services",{...P,id:a.get("id")||O("SRV"),name:a.get("name").trim(),category:a.get("category"),state:P?.state||"Kerala / All India",customerPricePaise:d,govtFeePaise:w,thirdPartyPaise:0,serviceChargePaise:Math.max(0,d-w),priceIncludesGst:a.get("gstPricing")?a.get("gstPricing")==="INCL":!!P?.priceIncludesGst,commissionPaise:P?.commissionPaise||0,gstApplicable:C(P||{})>0,gstRate:C(P||{}),sac:P?.sac||"",turnaroundTime:P?.turnaroundTime||"Same Day",checklist:P?.checklist||"",active:!0});le=v.id,M=null,i?c.push({id:O("LN"),serviceId:v.id,serviceName:v.name,category:v.category,qty:1,ratePaise:v.customerPricePaise,govtFeePaise:v.govtFeePaise,thirdPartyPaise:0,priceIncludesGst:!!v.priceIncludesGst,commissionPaise:0,discountPaise:0,gstApplicable:C(v)>0,gstRate:C(v),createPendingTask:v.category==="Government & Citizen Services"}):c.forEach(y=>{y.serviceId===v.id&&(y.serviceName=v.name,y.ratePaise=v.customerPricePaise,y.govtFeePaise=v.govtFeePaise,y.priceIncludesGst=!!v.priceIncludesGst)}),Ze("SERVICE_UPDATED",{id:v.id}),await g(t,o)}),t.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{c=f.slice(0,5).map(e=>({id:O("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,priceIncludesGst:!!e.priceIncludesGst,gstExempt:!!e.gstExempt,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:C(e)>0,gstRate:C(e),sac:e.sac||"",createPendingTask:e.category==="Government & Citizen Services"})),g(t,o)}),t.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const a=Number(e.getAttribute("data-idx")),i=e.getAttribute("data-ln-field"),d=c[a];d&&(i==="serviceName"?d.serviceName=e.value:i==="qty"?d.qty=d.kind==="PRODUCT"?Math.max(.001,Math.round((Number(e.value)||1)*1e3)/1e3):Math.max(1,Number(e.value)||1):i==="appRefNo"||i==="ackNo"||i==="trackNo"?d[i]=String(e.value||"").trim().slice(0,60):i==="feePaidFrom"?d.feePaidFrom=e.value||"":i==="feeProviderRef"?d.feeProviderRef=String(e.value||"").trim().slice(0,80):i==="feeStatus"?d.feeStatus=e.value==="PENDING"?"PENDING":"SUCCESS":i==="rate"?d.ratePaise=N(e.value):i==="govtFee"?d.govtFeePaise=N(e.value):i==="discount"?d.discountPaise=N(e.value):i==="gstRate"?(d.gstExempt=e.value==="EX",d.gstRate=e.value===""?null:e.value==="EX"?0:Math.max(0,Number(e.value)||0),d.gstApplicable=d.gstRate>0):i==="priceIncludesGst"?d.priceIncludesGst=e.checked:i==="createPendingTask"&&(d.createPendingTask=e.checked),await j(),g(t,o))})}),t.querySelectorAll("[data-fee-warn]").forEach(async e=>{const a=c[Number(e.getAttribute("data-fee-warn"))];if(a?.feePaidFrom)try{const{walletWarning:i}=await import("../core/wallets.js");e.textContent=await i(a.feePaidFrom,((a.govtFeePaise||0)+(a.thirdPartyPaise||0))*(a.qty||1))}catch{}}),["#bill-cust-gstin","#bill-pos"].forEach(e=>t.querySelector(e)?.addEventListener("change",async a=>{if(e==="#bill-cust-gstin"){const i=String(a.target.value||"").toUpperCase().replace(/[^0-9A-Z]/g,"");if(i){const{gstinProblem:d}=await import("../core/gst.js"),w=d(i);if(w){t.querySelector("#bill-gstin-msg").textContent=w;return}}$.gstin=i,i&&!$.pos&&($.pos=i.slice(0,2)===I.stateCode?"":i.slice(0,2))}else $.pos=String(a.target.value||"").replace(/\D/g,"").slice(0,2);await j(),g(t,o)})),t.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const a=Number(e.getAttribute("data-remove-ln"));a>=0&&a<c.length&&(c.splice(a,1),await j(),g(t,o))})});const V=t.querySelector("#bill-paid-now"),pe=t.querySelector("#bill-advance-adj"),Te=t.querySelector("#bill-due-preview"),ue=t.querySelector("#bill-pay-mode");t.querySelector("#bill-staff")?.addEventListener("change",e=>{A=e.target.value;try{localStorage.setItem("vlebook_last_staff",A)}catch{}});const me=()=>{const e=N(V?.value||0),a=N(pe?.value||0),i=Math.max(0,U-e-a);Te&&(Te.value=n(i))};V?.addEventListener("input",me),pe?.addEventListener("input",me),ue?.addEventListener("change",()=>{ue.value==="CREDIT"&&V&&(V.value="0.00",me())}),t.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=ae?.value.trim()||"",a=ce?.value.trim()||"Walk-in Citizen",i=t.querySelector("#bill-date")?.value||W(),d=ue?.value||"CASH",w=d==="CREDIT"?0:N(V?.value||0),P=N(pe?.value||0),v=t.querySelector("#bill-notes")?.value||"";if(c.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const y=e.replace(/\D/g,"");if(y&&y.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}if((await _e()).tier==="BASIC"){const p=W(),ve=q=>{if(q.date)return String(q.date).slice(0,10);const ie=new Date(q.createdAt||0);return Number.isNaN(ie.getTime())?"":`${ie.getFullYear()}-${String(ie.getMonth()+1).padStart(2,"0")}-${String(ie.getDate()).padStart(2,"0")}`};if((await G("bills")).filter(q=>ve(q)===p&&q.status!=="CANCELLED").length>=Ae){alert(`Basic mode allows ${Ae} invoices a day, and today's limit is reached. Buy or renew a licence in Users & Licence to make unlimited invoices.`);return}}const b=R?c.filter(p=>p.kind==="PRODUCT"&&(p.gstRate===null||p.gstRate===void 0||p.gstRate==="")):[];if(b.length){alert(`${x("Choose the GST rate for these items in the GST % column (or in Stock & Inventory):")} ${b.map(p=>p.serviceName).join(", ")}`);return}const se=Object.keys(K).map(p=>({id:p,left:F(p),name:_.find(ve=>ve.id===p)?.name})).filter(p=>p.left!==null&&p.left<0);if(se.length&&!confirm(`Negative stock alert:
${se.map(p=>`${p.name}: stock after this bill ${p.left}`).join(`
`)}

The software stock is less than the quantity billed. Save the bill anyway? (Record the missing purchase or a physical stock check later.)`))return;let H;try{H=await Ye({date:i,customerId:h?.id||null,customerName:a,customerMobile:e,gstMode:T,...R&&$.gstin?{customerGstin:$.gstin}:{},...R&&$.pos?{placeOfSupply:$.pos}:{},applyRoundOff:B,items:c,paidPaise:w,advanceAdjustedPaise:P,paymentMode:d,staffId:A||null,staffName:z.find(p=>p.id===A)?.name||"",notes:v})}catch(p){alert(p.message||"Could not create the invoice.");return}Q=H.id,$={gstin:"",pos:""},c=[],h=null,k={mobile:"",name:""},await ze("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await g(t,o)}),t.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{Q=e.getAttribute("data-view-bill"),g(t,o)})}),t.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=S.find(i=>i.id===e.getAttribute("data-dup-bill"));a&&(c=(a.items||[]).map(i=>({...i,id:O("LN"),ratePaise:i.unitRatePaise,govtFeePaise:i.unitGovtFeePaise,thirdPartyPaise:i.unitThirdPartyPaise,directCostPaise:i.unitDirectCostPaise,commissionPaise:i.unitCommissionPaise})),await j(),g(t,o))})}),t.querySelectorAll("[data-credit-note]").forEach(e=>e.addEventListener("click",async()=>{const{creditNoteDialog:a}=await import("./books-ops.js");a(e.getAttribute("data-credit-note"),()=>g(t,o))})),t.querySelectorAll("[data-fee-chain]").forEach(e=>e.addEventListener("click",async()=>{const{showFeeChain:a}=await import("./books.js");a(e.getAttribute("data-fee-chain")).catch(i=>alert(i.message))})),t.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-cancel-bill");if(!oe("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await Xe(a,"Operator issued cancellation & credit note"),await g(t,o)})}),t.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",a=>{a.preventDefault();const i=e.getAttribute("data-jump-c360");o("customers",i)})}),t.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{Y=e.getAttribute("data-fmt"),g(t,o)})}),t.querySelector("#bill-print-btn")?.addEventListener("click",()=>{l&&ot(Le(l,m,Y))}),t.querySelector("#bill-pdf-btn")?.addEventListener("click",()=>{if(!l)return;const e=E(l),a=be(l),i=b=>(Number(b||0)/100).toFixed(2),w=[[m?.address,m?.district,m?.state,m?.pinCode].filter(Boolean).join(", "),l.centreGstin?`GSTIN: ${l.centreGstin}`:"",`Invoice ${l.invoiceNo} | Date: ${l.date} | Status: ${l.status}`,`Customer: ${l.customerName} (${l.customerMobile||"N/A"})`,e?`Place of supply: ${m?.state||""}`:""].filter(Boolean).join(" | "),P=["Service / item",...a?["HSN/SAC"]:[],"Qty","Govt Fee",e?"Taxable value":"Service Chg",...e?["GST %"]:[],"GST","Line Total"],v=(l.items||[]).map(b=>[b.serviceName.slice(0,24),...a?[b.sac||""]:[],String(b.qty),i(b.lineGovtFeePaise),i(b.lineServiceChargePaise),...e?[`${Number(b.gstRate||0)}%`]:[],i(b.totalTaxPaise),i(b.lineTotalPaise)]),y=[];(l.items||[]).forEach((b,se)=>{const H=Qe(b);H&&y.push(`${se+1}. ${b.serviceName}: ${H}`)}),e&&(y.push(`Taxable value: Rs.${i(l.serviceChargeTotalPaise)} | `+(l.gstMode==="INTER"?`IGST: Rs.${i(l.igstPaise)}`:`CGST: Rs.${i(l.cgstPaise)} | SGST: Rs.${i(l.sgstPaise)}`)),l.govtFeeTotalPaise>0&&y.push("Government fees are collected as a pure agent and are not taxable; GST is on the centre service charges and items sold only.")),l.roundOffPaise&&y.push(`Round off: ${l.roundOffPaise>0?"+":"-"}Rs.${i(Math.abs(l.roundOffPaise))}`),y.push(`Grand Total: Rs.${i(l.grandTotalPaise)} (${fe(l.grandTotalPaise)})`),y.push(`Paid: Rs.${i(l.paidPaise)} | Advance Adj: Rs.${i(l.advanceAdjustedPaise||0)} | Balance Due: Rs.${i(l.duePaise)}`);const we=st(`${m?.centreName||"VLEBook Digital Service Centre"} - ${X(l)?X(l).toLowerCase().replace(/(^|\s)\w/g,b=>b.toUpperCase()):"Invoice"} ${l.invoiceNo}`,w,P,v,y);it(we,`Invoice_${l.invoiceNo}.pdf`,"application/pdf")})}function X(t){const o=t?.documentType||(E(t)?"TAX_INVOICE":"BILL");return o==="TAX_INVOICE"?"TAX INVOICE":o==="BILL_OF_SUPPLY"?"BILL OF SUPPLY":""}function ne(t){return t?.gstMode==="COMPOSITION"?"Composition taxable person, not eligible to collect tax on supplies.":""}function E(t){return t?.gstMode==="INTRA"||t?.gstMode==="INTER"}function be(t){return(t?.items||[]).some(o=>o.sac)}function Ge(t){if(!E(t))return"";const o=(f,r)=>`<div style="display:flex; justify-content:space-between;"><span>${f}:</span><span>${n(r)}</span></div>`;return t.gstMode==="INTER"?o("IGST",t.igstPaise||0):o("CGST",t.cgstPaise||0)+o("SGST",t.sgstPaise||0)}function Le(t,o,f="A4"){return f==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${Ne(o,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${s(o?.centreName||"VLEBook Centre")}</strong><br>
          <span>${s(o?.address||"")}</span><br>
          <span>Mob: ${s(o?.mobile||"")}</span>
          ${t.centreGstin||t.gstMode&&t.gstMode!=="NONE"&&o?.gstin?`<br><span>GSTIN: ${s(t.centreGstin||o.gstin)}</span>`:""}${o?.akshayaId?`<br><span>Akshaya ID: ${s(o.akshayaId)}</span>`:""}${o?.cscId?`<br><span>CSC ID: ${s(o.cscId)}</span>`:""}
        </div>
        <div>
          ${X(t)?`<div style="text-align:center; font-weight:700;">${X(t)}</div>`:""}${ne(t)?`<div style="text-align:center; font-size:9px;">${ne(t)}</div>`:""}
          ${t.customerGstin?`<div>Cust GSTIN: ${s(t.customerGstin)}</div>`:""}
          <strong>Inv: ${s(t.invoiceNo)}</strong> | Date: ${s(t.date)}<br>
          Cust: ${s(t.customerName)} (${s(t.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(t.items||[]).map(r=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${s(r.serviceName.slice(0,20))} x${r.qty}</span>
              <span>${n(r.lineTotalPaise)}</span>
            </div>${ke(r).map(([S,m])=>`<div style="font-size:10px;">${s(S)}: ${s(m)}</div>`).join("")}`).join("")}
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Govt Fees:</span><span>${n(t.govtFeeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Service Charges:</span><span>${n(t.serviceChargeTotalPaise)}</span></div>
        ${Ge(t)}
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px; margin-top:4px;">
          <span>TOTAL:</span><span>${n(t.grandTotalPaise)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Paid (${s(t.paymentMode)}):</span><span>${n(t.paidPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Balance Due:</span><span>${n(t.duePaise)}</span></div>
        ${Ce(o)}
        <div style="text-align:center; margin-top:8px; font-size:10px;">
          ${s(o?.footerNote||"Thank you for visiting!")}
        </div>
      </div>
    `:`
    <div class="invoice-sheet-a4">
      <div style="display:flex; justify-content:space-between; border-bottom:2px solid #12345A; padding-bottom:10px; margin-bottom:12px;">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          ${Ne(o,"max-height:64px; max-width:140px; object-fit:contain;")}
          <div>
          <h2 style="color:#12345A; margin:0; font-size:18px;">${s(o?.centreName||"VLEBook Digital Service Centre")}</h2>
          <div>${s(o?.address||"")}, ${s(o?.district||"")}, ${s(o?.state||"")} - ${s(o?.pinCode||"")}</div>
          <div>Phone: ${s(o?.mobile||"")} | Email: ${s(o?.email||"")}</div>
          ${t.centreGstin||t.gstMode&&t.gstMode!=="NONE"&&o?.gstin?`<div><strong>GSTIN:</strong> ${s(t.centreGstin||o.gstin)}</div>`:""}${o?.akshayaId?`<div><strong>Akshaya ID:</strong> ${s(o.akshayaId)}</div>`:""}${o?.cscId?`<div><strong>CSC ID:</strong> ${s(o.cscId)}</div>`:""}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#087E8B;">${X(t)||"SERVICE INVOICE / RECEIPT"}</div>
          ${ne(t)?`<div style="font-size:11px;">${ne(t)}</div>`:""}
          ${E(t)?`<div><strong>Place of supply:</strong> ${s(t.placeOfSupply?`${t.placeOfSupply} ${ge[t.placeOfSupply]||""}`:o?.state||"")}</div>`:""}
          ${t.customerGstin?`<div><strong>Customer GSTIN:</strong> ${s(t.customerGstin)}</div>`:""}
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
            ${be(t)?'<th style="padding:6px; text-align:left;">HSN/SAC</th>':""}
            <th style="padding:6px; text-align:right;">${E(t)?"Taxable value":"Service Charge"}</th>
            ${E(t)?'<th style="padding:6px; text-align:right;">GST %</th>':""}
            <th style="padding:6px; text-align:right;">GST</th>
            <th style="padding:6px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(t.items||[]).map((r,S)=>`
            <tr style="border-bottom:1px solid #E2E8F0;">
              <td style="padding:6px;">${S+1}</td>
              <td style="padding:6px;"><strong>${s(r.serviceName)}</strong>${r.kind==="PRODUCT"&&r.unit?` <span style="color:#555;">(${s(r.unit)})</span>`:""}${ke(r).map(([m,u])=>`<div style="font-size:11px; color:#333;">${s(m)}: <strong>${s(u)}</strong></div>`).join("")}</td>
              <td style="padding:6px; text-align:right;">${r.qty}</td>
              <td style="padding:6px; text-align:right;">${n(r.lineGovtFeePaise)}</td>
              ${be(t)?`<td style="padding:6px;">${s(r.sac||"")}</td>`:""}
              <td style="padding:6px; text-align:right;">${n(r.lineServiceChargePaise)}</td>
              ${E(t)?`<td style="padding:6px; text-align:right;">${Number(r.gstRate||0)}%</td>`:""}
              <td style="padding:6px; text-align:right;">${n(r.totalTaxPaise)}</td>
              <td style="padding:6px; text-align:right; font-weight:700;">${n(r.lineTotalPaise)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="max-width:55%; font-size:11.5px;">
          <div><strong>Amount in Words:</strong> ${s(fe(t.grandTotalPaise))}</div>
          ${E(t)&&t.govtFeeTotalPaise>0?'<div style="margin-top:6px;">Government fees are collected on behalf of the department as a pure agent and are not part of the taxable value; GST is charged only on the centre service charges and items sold.</div>':""}
          ${E(t)?'<div style="margin-top:14px; text-align:right;">Authorised signatory</div>':""}
          <div style="margin-top:6px; color:#475569;">${s(o?.footerNote||"")}</div>
          ${Ce(o)}
        </div>
        <div style="min-width:230px; font-size:12px;">
          <div style="display:flex; justify-content:space-between;"><span>Govt / Statutory Fees:</span><span>${n(t.govtFeeTotalPaise)}</span></div>
          <div style="display:flex; justify-content:space-between;"><span>Centre Service Charges:</span><span>${n(t.serviceChargeTotalPaise)}</span></div>
          ${Ge(t)}
          ${t.roundOffPaise?`<div style="display:flex; justify-content:space-between;"><span>Round off:</span><span>${t.roundOffPaise>0?"+":"-"}${n(Math.abs(t.roundOffPaise))}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; border-top:1px solid #12345A; margin-top:4px; padding-top:4px; font-weight:800; font-size:14px;">
            <span>Grand Total:</span><span>${n(t.grandTotalPaise)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:#14804A;"><span>Paid (${s(t.paymentMode)}):</span><span>${n(t.paidPaise)}</span></div>
          ${t.advanceAdjustedPaise>0?`<div style="display:flex; justify-content:space-between;"><span>Advance Adjusted:</span><span>${n(t.advanceAdjustedPaise)}</span></div>`:""}
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#C92A2A;"><span>Balance Due:</span><span>${n(t.duePaise)}</span></div>
        </div>
      </div>
    </div>
  `}export{g as renderBillingModule};
