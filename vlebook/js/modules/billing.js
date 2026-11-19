import{getCurrentUser as Me,can as z}from"../core/auth.js";import{generateQRMatrix as Be}from"../core/qrcode.js";import{reviewUrlProblem as Se}from"../core/dayclose.js";function Oe(a){const l=String(a?.googleReviewUrl||"").trim();if(!a?.googleReviewQrEnabled||!l||Se(l))return"";try{const f=Be(l,"M"),y=f.size+8;let x="";for(let b=0;b<f.size;b++)for(let D=0;D<f.size;D++)f.modules[b][D]&&(x+=`M${D+4} ${b+4}h1v1h-1z`);const h=Math.min(40,Math.max(15,Number(a.googleReviewQrSizeMm)||22));return`<div style="text-align:center; margin-top:6px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${y} ${y}" style="width:${h}mm; height:${h}mm;" role="img" aria-label="QR code to review us on Google" shape-rendering="crispEdges"><rect width="${y}" height="${y}" fill="#fff"/><path d="${x}" fill="#000"/></svg><div style="font-size:10px;">Happy with our service? Scan to review us on Google</div></div>`}catch{return""}}import{logoImgTag as _e,isValidLogo as je}from"../core/branding.js";import{invoiceModel as xe,invoiceA4HTML as Ue,invoicePDFBlob as ze}from"../core/invoicelayout.js";import{getLicenceState as Ve,BASIC_DAILY_BILLS as Ie}from"../core/licence.js";import{getAllRecords as R,getRecord as we,putRecord as Ne,deleteRecord as Ce}from"../core/db.js";import{STATES as Te,ratesInForce as He}from"../core/gst.js";import{gstRegistrationOf as We,resolveBillGstMode as Qe,calculateInvoiceLine as Ye,lineGstRate as T,lineRefs as Xe,roundToRupeePaise as Ke,createMultiServiceInvoice as Je,editInvoice as Ze,cancelInvoiceWithReversal as et,peekNextInvoiceNo as tt,getCustomer360Profile as at,notifyCrossTabSync as it}from"../core/accounting.js";import{SERVICE_CATEGORIES as st}from"./services.js";import{uid as G,todayISO as V,nowISO as lt,formatINR as r,fromPaise as L,toPaise as E,amountInWordsINR as ot,esc as i,buildWhatsAppURL as nt,downloadFile as rt,printDocumentSheet as ct}from"../core/utils.js";import{formatWhatsAppTemplate as dt,getLang as pt,t as p}from"../core/i18n.js";let n=[],m=null,N="NONE",v={gstin:"",pos:""};const Ee=!0;let H=null,P=null,W="A4",B=null,te=null,re=!1,C={mobile:"",name:""},A=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function q(){await Ne("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:n,selectedCustomerId:m?.id||null,typedCustomer:C,gstMode:N,billGst:v,applyRoundOff:Ee,savedAt:lt()})}async function u(a,l){const[f,y,x,h,b,D,qe]=await Promise.all([R("services"),R("customers"),R("bills"),we("settings","CENTRE_CONFIG"),we("drafts","DRAFT_BILLING_VISIT"),R("staff"),R("inventory")]),De=(await R("accounts")).filter(e=>e.active!==!1),I=We(h||{},V());!v.gstin&&m?.gstin&&I.type==="REGULAR"&&(v.gstin=m.gstin);try{N=Qe(h||{},{requested:"",placeOfSupply:v.pos,customerGstin:v.gstin})}catch{N=I.type==="REGULAR"?"INTRA":I.type==="COMPOSITION"?"COMPOSITION":"NONE"}const k=N==="INTRA"||N==="INTER",Fe=k?await He(V()):[],O=[...qe].sort((e,t)=>String(e.name).localeCompare(String(t.name))),Q={};n.filter(e=>e.kind==="PRODUCT").forEach(e=>Q[e.itemId]=(Q[e.itemId]||0)+(Number(e.qty)||0));const F=e=>{const t=O.find(s=>s.id===e);return t?Math.round(((Number(t.currentStock)||0)-(Q[e]||0))*1e3)/1e3:null},_=D.filter(e=>e.active!==!1).sort((e,t)=>e.name.localeCompare(t.name));A&&!_.some(e=>e.id===A)&&(A="");const Y=Me();Y?.staffId&&Y.role==="OPERATOR"&&_.some(e=>e.id===Y.staffId)&&(A=Y.staffId),!re&&b&&Array.isArray(b.currentLines)&&b.currentLines.length>0&&(n=b.currentLines,b.selectedCustomerId&&(m=y.find(e=>e.id===b.selectedCustomerId)||null),b.typedCustomer&&(C={mobile:"",name:"",...b.typedCustomer}),b.gstMode&&(N=b.gstMode),b.billGst&&(v=b.billGst),re=!0),re=!0;const ce=sessionStorage.getItem("vlebook_preview_bill_id");ce&&(sessionStorage.removeItem("vlebook_preview_bill_id"),H=ce);const de=sessionStorage.getItem("vlebook_preselect_customer");if(de){sessionStorage.removeItem("vlebook_preselect_customer");const e=y.find(t=>t.id===de);e&&(m=e)}const pe=sessionStorage.getItem("vlebook_workbench_bill_item");if(pe){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(pe);n.push(e)}catch{}}const X=m?await at(m.id):null,ae=X?.metrics?.availableAdvancePaise||0,K=n.map(e=>Ye(e,N)),ue=K.reduce((e,t)=>e+t.lineGovtFeePaise,0),me=K.reduce((e,t)=>e+t.lineServiceChargePaise,0),ve=K.reduce((e,t)=>e+t.totalTaxPaise,0),fe=ue+me+ve,j=Ke(fe),ge=j-fe,J=[...x].sort((e,t)=>String(t.createdAt||t.date).localeCompare(String(e.createdAt||e.date))),$=H?x.find(e=>e.id===H):J[0];a.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Unified Counter Multi-Service Billing & Invoicing</h1>
        <p>Bill multiple services in one citizen visit, separate government fees from service revenue, and print A4 or Thermal receipts</p>
      </div>
      <div class="module-actions">
        <span class="badge badge-info">Next Invoice: ${i(await tt(h))}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Create Multi-Service Counter Invoice</div>
        <div style="display:flex; gap:8px; align-items:center;">
          ${I.type==="UNREGISTERED"?`<span class="badge badge-info" title="${i(p("Your centre is not GST registered, so bills carry no GST. Add your GSTIN in Books & GST → GST profile if you register."))}">${p("Bill (no GST)")}</span>`:I.type==="COMPOSITION"?`<span class="badge badge-warning" title="${i(p("Composition dealer: Bill of Supply, no GST is collected from customers."))}">${p("Bill of Supply (composition)")}</span>`:`<span class="badge badge-success">${p("Tax Invoice")} · ${N==="INTER"?"IGST":"CGST + SGST"}</span>
          <input class="form-control" id="bill-cust-gstin" style="width:175px;" maxlength="15" placeholder="${i(p("Customer GSTIN (optional)"))}" title="${i(p("Give the GSTIN of a registered customer so they can claim input tax credit (B2B)."))}" aria-label="Customer GSTIN" value="${i(v.gstin)}">
          <select class="form-control" id="bill-pos" style="width:190px;" aria-label="Place of supply" title="${i(p("Place of supply. Your own State gives CGST + SGST; another State gives IGST."))}"><option value="">${p("Place of supply")}: ${i(Te[I.stateCode]||I.stateCode)}</option>${Object.entries(Te).filter(([e])=>e!==I.stateCode&&!["97","99"].includes(e)).map(([e,t])=>`<option value="${e}" ${v.pos===e?"selected":""}>${e} ${i(t)}</option>`).join("")}</select>`}
          <span id="bill-gstin-msg" style="font-size:12px; color:#B42318;"></span>
        </div>
      </div>

      <!-- Customer Lookup Strip -->
      <div class="grid-3" style="margin-bottom:14px; background:var(--color-surface-alt); padding:12px; border-radius:var(--radius-sm);">
        <div class="form-group">
          <label class="form-label">Customer Mobile (Auto-Lookup) <span class="req">*</span></label>
          <input type="tel" class="form-control" id="bill-cust-mobile" maxlength="10" placeholder="Enter 10-digit mobile..." value="${i(m?.mobile||C.mobile||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Customer Full Name <span class="req">*</span></label>
          <input type="text" class="form-control" id="bill-cust-name" placeholder="Citizen Full Name" value="${i(m?.name||C.name||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="bill-date" value="${P?i(P.date):V()}" ${P?'disabled title="A revised invoice keeps the date of the original"':""}>
        </div>
      </div>

      ${X?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${i(m.name)} (${i(m.id)}) |
                Previous Visits: <strong>${X.metrics.totalVisits}</strong> |
                Pending Due: <strong>${r(X.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${r(ae)}</strong>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-clear-cust">Clear</button>
            </div>`:""}

      <!-- Quick Service Picker Bar -->
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-service-select" style="max-width:340px;">
          ${f.filter(e=>e.active!==!1).map(e=>`<option value="${i(e.id)}" ${te===e.id?"selected":""}>${i(e.name)} — ${r(e.customerPricePaise)} (Govt: ${r(e.govtFeePaise)})</option>`).join("")}
        </select>
        <button type="button" class="btn btn-teal" id="bill-add-line-btn">Add Service to Visit</button>
        <button type="button" class="btn btn-outline" id="bill-quick-edit-srv-btn" title="Edit the selected service in the catalogue">Edit Selected Service</button>
        <button type="button" class="btn btn-gold" id="bill-quick-new-srv-btn" title="Create a brand-new service and add to list">Create New Service</button>
        <button type="button" class="btn btn-outline" id="bill-add-five-demo-btn" title="Add 5 common citizen services in one click">5-Service Preset</button>
      </div>
      ${O.length?`<div style="display:flex; gap:8px; align-items:center; margin:-4px 0 12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-item-select" style="max-width:420px;">
          ${O.map(e=>`<option value="${i(e.id)}">${i(e.name)} — ${r(e.sellingPricePaise||0)} ${e.priceIncludesGst?"(incl. GST)":"(excl. GST)"} · stock ${i(e.currentStock)} ${i(e.unit||"")}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-outline" id="bill-add-item-btn" title="Sell an item from Stock & Inventory on this bill">Add Item from Stock</button>
      </div>`:""}

      ${B?(()=>{const e=B==="EDIT"?f.find(t=>t.id===te)||f[0]:null;return`
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
                      ${st.map(t=>`<option value="${i(t)}" ${e?.category===t?"selected":""}>${i(t)}</option>`).join("")}
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
                    <label class="form-label">${p("GST on this price")}</label>
                    <select class="form-control" name="gstPricing">
                      <option value="PLUS" ${e?.priceIncludesGst?"":"selected"}>${p("Price + GST (GST added on top)")}</option>
                      <option value="INCL" ${e?.priceIncludesGst?"selected":""}>${p("Price includes GST")}</option>
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
              ${k?'<th style="width:110px;">GST %</th>':""}
              <th class="num">Service Rev</th>
              <th class="num">Line Total</th>
              <th>Track App?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${K.map((e,t)=>`
              <tr>
                <td>${t+1}</td>
                <td>
                  <input type="text" class="form-control" data-ln-field="serviceName" data-idx="${t}" value="${i(e.serviceName)}">
                  ${e.kind==="PRODUCT"?`<small style="color:var(--color-text-muted);">Stock item${e.sac?` · HSN ${i(e.sac)}`:""} · price ${e.priceIncludesGst?"includes":"excludes"} GST${F(e.itemId)!==null&&F(e.itemId)<0?` · <strong style="color:var(--color-danger);">Stock will go negative (${i(F(e.itemId))})</strong>`:F(e.itemId)!==null?` · stock after bill ${i(F(e.itemId))}`:""}</small>`:""}
                </td>
                <td>
                  <input type="number" min="${e.kind==="PRODUCT"?"0.001":"1"}" step="${e.kind==="PRODUCT"?"any":"1"}" class="form-control" data-ln-field="qty" data-idx="${t}" value="${e.qty}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="rate" data-idx="${t}" value="${L(e.unitRatePaise)}">
                </td>
                <td>
                  ${e.kind==="PRODUCT"?'<span style="color:var(--color-text-muted);">—</span>':`<input type="number" step="0.01" min="0" class="form-control" data-ln-field="govtFee" data-idx="${t}" value="${L(e.unitGovtFeePaise)}">`}
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="discount" data-idx="${t}" value="${L(e.discountPaise)}">
                </td>
                ${k?`<td><select class="form-control" data-ln-field="gstRate" data-idx="${t}" title="GST on the service charge only (never on the government fee)">${!n[t]?.gstExempt&&(e.gstRate===null||e.gstRate===void 0||e.gstRate==="")?'<option value="" selected>Choose</option>':""}${[...new Set([...Fe,...e.gstRate!==""&&e.gstRate!=null?[Number(e.gstRate)]:[]])].sort((s,o)=>s-o).map(s=>`<option value="${s}" ${!n[t]?.gstExempt&&e.gstRate===s?"selected":""}>${s}%</option>`).join("")}<option value="EX" ${n[t]?.gstExempt?"selected":""}>${p("Exempt")}</option></select>
                    <label style="font-size:11px; display:flex; gap:4px; align-items:center; margin-top:2px;" title="${i(p("Tick when the rate you typed already includes GST"))}"><input type="checkbox" data-ln-field="priceIncludesGst" data-idx="${t}" ${n[t]?.priceIncludesGst?"checked":""}> ${p("incl. GST")}</label></td>`:""}
                <td class="num" style="color:var(--color-success); font-weight:600;">${r(e.lineServiceChargePaise)}</td>
                <td class="num"><strong>${r(e.lineTotalPaise)}</strong></td>
                <td>
                  ${e.kind==="PRODUCT"?"—":`<input type="checkbox" data-ln-field="createPendingTask" data-idx="${t}" ${e.createPendingTask?"checked":""} title="Create Application Tracking record">`}
                </td>
                <td>
                  <button type="button" class="btn btn-xs btn-danger" data-remove-ln="${t}">×</button>
                </td>
              </tr>
              ${e.kind==="PRODUCT"?"":`<tr class="ln-refs-row"><td></td><td colspan="${k?10:9}" style="padding-top:0;">
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;"><small style="color:var(--color-text-muted);">Reference numbers (optional, printed on the invoice):</small>
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="appRefNo" data-idx="${t}" value="${i(/^REF-\d+$/.test(e.appRefNo||"")?"":e.appRefNo||"")}" placeholder="Application No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="ackNo" data-idx="${t}" value="${i(e.ackNo||"")}" placeholder="Acknowledgement No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="trackNo" data-idx="${t}" value="${i(e.trackNo||"")}" placeholder="Tracking No.">
                </div>${(e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0)>0?`<div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:4px;"><small style="color:var(--color-text-muted);">Govt / portal fee ${r((e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0))} paid from:</small>
                <select class="form-control" style="max-width:200px; padding:4px 6px; font-size:12px;" data-ln-field="feePaidFrom" data-idx="${t}" aria-label="Account the government fee was paid from"><option value="">Not paid to portal yet</option>${De.map(s=>`<option value="${i(s.id)}" ${n[t]?.feePaidFrom===s.id?"selected":""}>${i(s.name)}</option>`).join("")}</select>
                ${n[t]?.feePaidFrom?`<input type="text" class="form-control" style="max-width:170px; padding:4px 6px; font-size:12px;" maxlength="80" data-ln-field="feeProviderRef" data-idx="${t}" value="${i(n[t].feeProviderRef||"")}" placeholder="Portal transaction ref."><select class="form-control" style="max-width:120px; padding:4px 6px; font-size:12px;" data-ln-field="feeStatus" data-idx="${t}" aria-label="Portal payment status"><option value="SUCCESS">Successful</option><option value="PENDING" ${n[t].feeStatus==="PENDING"?"selected":""}>Pending</option></select><small class="fee-warn" data-fee-warn="${t}" style="color:#B42318;"></small>`:""}
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
              ${_.map(e=>`<option value="${i(e.id)}" ${e.id===A?"selected":""}>${i(e.name)}${e.role?` (${i(e.role)})`:""}</option>`).join("")}
            </select>
            ${_.length===0?'<span class="form-hint">Add staff in Staff Commission to track commission per bill.</span>':""}
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
              <input type="number" step="0.01" min="0" max="${L(ae)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${r(ae)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount Paid Now (₹)</label>
              <input type="number" step="0.01" min="0" class="form-control" id="bill-paid-now" value="${L(j).toFixed(2)}">
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
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${r(ue)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${r(me)}</strong>
          </div>
          ${k?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${N==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${r(ve)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <span title="${i(p("Every bill is rounded to the nearest rupee: 49 paise or less down, 50 paise or more up."))}">${p("Round off (to the nearest rupee)")}</span>
            <span>${ge<0?"−":"+"}${r(Math.abs(ge))}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${r(j)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${i(ot(j))}</em>
          </div>
          ${P?`<div class="callout warning" id="bill-edit-box" style="margin-bottom:8px; display:block;">
              <strong>Editing invoice <span data-no-i18n>${i(P.invoiceNo)}</span>.</strong> Saving issues the revised invoice <b data-no-i18n>${i(P.nextNo)}</b> with the same date and cancels the original with a credit note (money, stock and books are reversed and posted again).
              <div class="form-group" style="margin-top:6px;"><label class="form-label" for="bill-edit-reason">Reason for editing <span class="req">*</span></label><input type="text" class="form-control" id="bill-edit-reason" maxlength="150" placeholder="e.g. wrong service selected, customer name corrected"></div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-edit-stop">Stop editing</button>
            </div>`:""}
          <button type="button" class="btn btn-primary" id="bill-submit-btn" style="width:100%; padding:10px; font-size:14px;">
            ${P?"Save revised invoice":"Generate Invoice & Post to Ledger"}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Invoice Register & Print / Thermal Receipt Preview -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Recent Invoices (${J.length})</div>
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
              ${J.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':J.map(e=>`
                    <tr>
                      <td><strong>${i(e.invoiceNo)}</strong><br><small style="color:var(--color-text-muted);">${i(e.date)}</small></td>
                      <td>
                        <a href="#" data-jump-c360="${i(e.customerId)}" style="color:var(--color-teal); font-weight:600;">${i(e.customerName)}</a><br>
                        <small style="color:var(--color-text-muted);">${(e.items||[]).length} services</small>
                      </td>
                      <td class="num">${r(e.grandTotalPaise)}</td>
                      <td class="num" style="color:var(--color-success);">${r(e.paidPaise)}</td>
                      <td class="num" style="color:${e.duePaise>0?"var(--color-danger)":"var(--color-text-muted)"};">${r(e.duePaise)}</td>
                      <td>
                        <span class="badge ${e.status==="PAID"?"badge-success":e.status==="PARTIAL"?"badge-warning":e.status==="CANCELLED"?"badge-neutral":"badge-danger"}">${i(e.status)}</span>
                      </td>
                      <td>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                          <button class="btn btn-xs btn-teal" data-view-bill="${i(e.id)}">View/Print</button>
                          <button class="btn btn-xs btn-outline" data-dup-bill="${i(e.id)}" title="Duplicate items into new bill">Dup</button>
                          ${e.status!=="CANCELLED"&&z("cancel_invoice")?`<button class="btn btn-xs btn-outline" data-edit-bill="${i(e.id)}" title="Edit this invoice: a revised invoice is issued and the original is cancelled with a credit note">Edit</button>`:""}
                          ${e.status!=="CANCELLED"&&(e.duePaise||0)>0&&z("reverse_voucher")?`<button class="btn btn-xs btn-outline" data-credit-note="${i(e.id)}" title="Reduce the service charge on this bill after billing">Credit note</button>`:""}
                          ${(e.govtFeeTotalPaise||0)+(e.thirdPartyTotalPaise||0)>0&&z("view_books")?`<button class="btn btn-xs btn-outline" data-fee-chain="${i(e.id)}" title="Government fee: paid to portal and recovered from customer">Fee chain</button>`:""}
                          ${e.status!=="CANCELLED"&&z("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${i(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
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
          ${$?`<div style="display:flex; gap:6px; flex-wrap:wrap;">
                  <div class="pill-tabs">
                    <button class="pill-tab ${W==="A4"?"active":""}" data-fmt="A4">A4 Invoice</button>
                    <button class="pill-tab ${W==="THERMAL"?"active":""}" data-fmt="THERMAL">80mm Thermal</button>
                  </div>
                  <button class="btn btn-xs btn-primary" id="bill-print-btn">Print</button>
                  <button class="btn btn-xs btn-outline" id="bill-pdf-btn">PDF</button>
                  <a href="${i(nt($.customerMobile,dt(pt(),"invoice",{customerName:$.customerName,centreName:h?.centreName||"VLEBook Centre",invoiceNo:$.invoiceNo,totalAmount:r($.grandTotalPaise),paidAmount:r($.paidPaise),dueAmount:r($.duePaise)},h?.whatsappTemplates)))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${$?Ge($,h,W):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const Z=a.querySelector("#bill-cust-mobile"),ie=a.querySelector("#bill-cust-name");Z?.addEventListener("input",()=>{const e=Z.value.replace(/\D/g,"").slice(-10);if(m||(C.mobile=Z.value),e.length===10){const t=y.find(s=>s.mobile===e);t&&(m=t,u(a,l))}}),ie?.addEventListener("input",()=>{m||(C.name=ie.value)}),a.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{m=null,C={mobile:"",name:""},u(a,l)}),a.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=a.querySelector("#bill-add-service-select")?.value,t=f.find(s=>s.id===e)||f[0];t&&(n.push({id:G("LN"),serviceId:t.id,serviceName:t.name,category:t.category,qty:1,ratePaise:t.customerPricePaise,govtFeePaise:t.govtFeePaise,thirdPartyPaise:t.thirdPartyPaise||0,priceIncludesGst:!!t.priceIncludesGst,gstExempt:!!t.gstExempt,commissionPaise:t.commissionPaise||0,discountPaise:0,gstApplicable:T(t)>0,gstRate:T(t),sac:t.sac||"",createPendingTask:t.category==="Government & Citizen Services"}),q().catch(()=>{}),u(a,l))}),a.querySelector("#bill-add-item-btn")?.addEventListener("click",()=>{const e=O.find(t=>t.id===a.querySelector("#bill-add-item-select")?.value);e&&(n.push({id:G("LN"),kind:"PRODUCT",itemId:e.id,unit:e.unit||"",serviceName:e.name,qty:1,ratePaise:Number(e.sellingPricePaise)||0,directCostPaise:Number(e.purchasePricePaise)||0,priceIncludesGst:!!e.priceIncludesGst,gstRate:e.gstRate===void 0||e.gstRate===null||e.gstRate===""?null:Number(e.gstRate),gstApplicable:T(e)>0,sac:e.hsn||"",discountPaise:0}),Number(e.sellingPricePaise)>0||alert("This item has no selling price yet. Type the price in the Rate column, or set it in Stock & Inventory → Items."),q().catch(()=>{}),u(a,l))}),a.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{te=a.querySelector("#bill-add-service-select")?.value||f[0]?.id,B="EDIT",u(a,l)}),a.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{B="CREATE",u(a,l)}),a.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{B=null,u(a,l)}),a.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),s=!t.get("id"),o=E(t.get("customerPrice")),d=E(t.get("govtFee")),S=s?null:f.find(w=>w.id===t.get("id")),g=await Ne("services",{...S,id:t.get("id")||G("SRV"),name:t.get("name").trim(),category:t.get("category"),state:S?.state||"Kerala / All India",customerPricePaise:o,govtFeePaise:d,thirdPartyPaise:0,serviceChargePaise:Math.max(0,o-d),priceIncludesGst:t.get("gstPricing")?t.get("gstPricing")==="INCL":!!S?.priceIncludesGst,commissionPaise:S?.commissionPaise||0,gstApplicable:T(S||{})>0,gstRate:T(S||{}),sac:S?.sac||"",turnaroundTime:S?.turnaroundTime||"Same Day",checklist:S?.checklist||"",active:!0});te=g.id,B=null,s?n.push({id:G("LN"),serviceId:g.id,serviceName:g.name,category:g.category,qty:1,ratePaise:g.customerPricePaise,govtFeePaise:g.govtFeePaise,thirdPartyPaise:0,priceIncludesGst:!!g.priceIncludesGst,commissionPaise:0,discountPaise:0,gstApplicable:T(g)>0,gstRate:T(g),createPendingTask:g.category==="Government & Citizen Services"}):n.forEach(w=>{w.serviceId===g.id&&(w.serviceName=g.name,w.ratePaise=g.customerPricePaise,w.govtFeePaise=g.govtFeePaise,w.priceIncludesGst=!!g.priceIncludesGst)}),it("SERVICE_UPDATED",{id:g.id}),await u(a,l)}),a.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{n=f.slice(0,5).map(e=>({id:G("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,priceIncludesGst:!!e.priceIncludesGst,gstExempt:!!e.gstExempt,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:T(e)>0,gstRate:T(e),sac:e.sac||"",createPendingTask:e.category==="Government & Citizen Services"})),u(a,l)}),a.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const t=Number(e.getAttribute("data-idx")),s=e.getAttribute("data-ln-field"),o=n[t];o&&(s==="serviceName"?o.serviceName=e.value:s==="qty"?o.qty=o.kind==="PRODUCT"?Math.max(.001,Math.round((Number(e.value)||1)*1e3)/1e3):Math.max(1,Number(e.value)||1):s==="appRefNo"||s==="ackNo"||s==="trackNo"?o[s]=String(e.value||"").trim().slice(0,60):s==="feePaidFrom"?o.feePaidFrom=e.value||"":s==="feeProviderRef"?o.feeProviderRef=String(e.value||"").trim().slice(0,80):s==="feeStatus"?o.feeStatus=e.value==="PENDING"?"PENDING":"SUCCESS":s==="rate"?o.ratePaise=E(e.value):s==="govtFee"?o.govtFeePaise=E(e.value):s==="discount"?o.discountPaise=E(e.value):s==="gstRate"?(o.gstExempt=e.value==="EX",o.gstRate=e.value===""?null:e.value==="EX"?0:Math.max(0,Number(e.value)||0),o.gstApplicable=o.gstRate>0):s==="priceIncludesGst"?o.priceIncludesGst=e.checked:s==="createPendingTask"&&(o.createPendingTask=e.checked),await q(),u(a,l))})}),a.querySelectorAll("[data-fee-warn]").forEach(async e=>{const t=n[Number(e.getAttribute("data-fee-warn"))];if(t?.feePaidFrom)try{const{walletWarning:s}=await import("../core/wallets.js");e.textContent=await s(t.feePaidFrom,((t.govtFeePaise||0)+(t.thirdPartyPaise||0))*(t.qty||1))}catch{}}),["#bill-cust-gstin","#bill-pos"].forEach(e=>a.querySelector(e)?.addEventListener("change",async t=>{if(e==="#bill-cust-gstin"){const s=String(t.target.value||"").toUpperCase().replace(/[^0-9A-Z]/g,"");if(s){const{gstinProblem:o}=await import("../core/gst.js"),d=o(s);if(d){a.querySelector("#bill-gstin-msg").textContent=d;return}}v.gstin=s,s&&!v.pos&&(v.pos=s.slice(0,2)===I.stateCode?"":s.slice(0,2))}else v.pos=String(t.target.value||"").replace(/\D/g,"").slice(0,2);await q(),u(a,l)})),a.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const t=Number(e.getAttribute("data-remove-ln"));t>=0&&t<n.length&&(n.splice(t,1),await q(),u(a,l))})});const U=a.querySelector("#bill-paid-now"),se=a.querySelector("#bill-advance-adj"),be=a.querySelector("#bill-due-preview"),le=a.querySelector("#bill-pay-mode");a.querySelector("#bill-staff")?.addEventListener("change",e=>{A=e.target.value;try{localStorage.setItem("vlebook_last_staff",A)}catch{}});const oe=()=>{const e=E(U?.value||0),t=E(se?.value||0),s=Math.max(0,j-e-t);be&&(be.value=r(s))};U?.addEventListener("input",oe),se?.addEventListener("input",oe),le?.addEventListener("change",()=>{le.value==="CREDIT"&&U&&(U.value="0.00",oe())}),a.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=Z?.value.trim()||"",t=ie?.value.trim()||"Walk-in Citizen",s=a.querySelector("#bill-date")?.value||V(),o=le?.value||"CASH",d=o==="CREDIT"?0:E(U?.value||0),S=E(se?.value||0),g=a.querySelector("#bill-notes")?.value||"";if(n.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const w=e.replace(/\D/g,"");if(w&&w.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}if((await Ve()).tier==="BASIC"){const c=V(),ne=M=>{if(M.date)return String(M.date).slice(0,10);const ee=new Date(M.createdAt||0);return Number.isNaN(ee.getTime())?"":`${ee.getFullYear()}-${String(ee.getMonth()+1).padStart(2,"0")}-${String(ee.getDate()).padStart(2,"0")}`};if((await R("bills")).filter(M=>ne(M)===c&&M.status!=="CANCELLED").length>=Ie){alert(`Basic mode allows ${Ie} invoices a day, and today's limit is reached. Buy or renew a licence in Users & Licence to make unlimited invoices.`);return}}const ye=k?n.filter(c=>c.kind==="PRODUCT"&&(c.gstRate===null||c.gstRate===void 0||c.gstRate==="")):[];if(ye.length){alert(`${p("Choose the GST rate for these items in the GST % column (or in Stock & Inventory):")} ${ye.map(c=>c.serviceName).join(", ")}`);return}const he=Object.keys(Q).map(c=>({id:c,left:F(c),name:O.find(ne=>ne.id===c)?.name})).filter(c=>c.left!==null&&c.left<0);if(he.length&&!confirm(`Negative stock alert:
${he.map(c=>`${c.name}: stock after this bill ${c.left}`).join(`
`)}

The software stock is less than the quantity billed. Save the bill anyway? (Record the missing purchase or a physical stock check later.)`))return;const $e=P?(a.querySelector("#bill-edit-reason")?.value||"").trim():"";if(P&&$e.length<5){alert(p("Enter the reason for editing this invoice (at least 5 characters).")),a.querySelector("#bill-edit-reason")?.focus();return}let Pe;try{Pe=await(P?c=>Ze(P.id,c,$e):Je)({date:s,customerId:m?.id||null,customerName:t,customerMobile:e,gstMode:N,...k&&v.gstin?{customerGstin:v.gstin}:{},...k&&v.pos?{placeOfSupply:v.pos}:{},applyRoundOff:Ee,items:n,paidPaise:d,advanceAdjustedPaise:S,paymentMode:o,staffId:A||null,staffName:_.find(c=>c.id===A)?.name||"",notes:g})}catch(c){alert(c.message||"Could not create the invoice.");return}H=Pe.id,P=null,v={gstin:"",pos:""},n=[],m=null,C={mobile:"",name:""},await Ce("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await u(a,l)}),a.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{H=e.getAttribute("data-view-bill"),u(a,l)})}),a.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const t=x.find(s=>s.id===e.getAttribute("data-dup-bill"));t&&(n=(t.items||[]).map(s=>({...s,id:G("LN"),ratePaise:s.unitRatePaise,govtFeePaise:s.unitGovtFeePaise,thirdPartyPaise:s.unitThirdPartyPaise,directCostPaise:s.unitDirectCostPaise,commissionPaise:s.unitCommissionPaise})),await q(),u(a,l))})}),a.querySelectorAll("[data-edit-bill]").forEach(e=>e.addEventListener("click",async()=>{const t=x.find(d=>d.id===e.getAttribute("data-edit-bill"));if(!t||n.length&&!confirm(p("The bill you are making now will be replaced by the invoice to edit. Continue?")))return;n=(t.items||[]).map(d=>({...d,id:G("LN"),ratePaise:d.unitRatePaise,govtFeePaise:d.unitGovtFeePaise,thirdPartyPaise:d.unitThirdPartyPaise,directCostPaise:d.unitDirectCostPaise,commissionPaise:d.unitCommissionPaise})),m=y.find(d=>d.id===t.customerId)||null,C={mobile:t.customerMobile||"",name:t.customerName||""},v={gstin:t.customerGstin||"",pos:t.placeOfSupply||""};const s=String(t.invoiceNo).replace(/-R\d+$/,"");let o=1;for(;x.some(d=>d.invoiceNo===`${s}-R${o}`);)o++;P={id:t.id,invoiceNo:t.invoiceNo,date:t.date,nextNo:`${s}-R${o}`},await q(),await u(a,l),a.querySelector("#bill-edit-reason")?.scrollIntoView({block:"center"})})),a.querySelector("#bill-edit-stop")?.addEventListener("click",async()=>{P=null,n=[],m=null,C={mobile:"",name:""},v={gstin:"",pos:""},await Ce("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await u(a,l)}),a.querySelectorAll("[data-credit-note]").forEach(e=>e.addEventListener("click",async()=>{const{creditNoteDialog:t}=await import("./books-ops.js");t(e.getAttribute("data-credit-note"),()=>u(a,l))})),a.querySelectorAll("[data-fee-chain]").forEach(e=>e.addEventListener("click",async()=>{const{showFeeChain:t}=await import("./books.js");t(e.getAttribute("data-fee-chain")).catch(s=>alert(s.message))})),a.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-cancel-bill");if(!z("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await et(t,"Operator issued cancellation & credit note"),await u(a,l)})}),a.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const s=e.getAttribute("data-jump-c360");l("customers",s)})}),a.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{W=e.getAttribute("data-fmt"),u(a,l)})}),a.querySelector("#bill-print-btn")?.addEventListener("click",()=>{$&&ct(Ge($,h,W))}),a.querySelector("#bill-pdf-btn")?.addEventListener("click",async()=>{if(!$)return;const e=await ze(xe($,h||{},{reviewUrl:Le(h)}));rt(e,`Invoice_${$.invoiceNo}.pdf`,"application/pdf")})}function Ae(a){const l=a?.documentType||(Re(a)?"TAX_INVOICE":"BILL");return l==="TAX_INVOICE"?"TAX INVOICE":l==="BILL_OF_SUPPLY"?"BILL OF SUPPLY":""}function ke(a){return a?.gstMode==="COMPOSITION"?"Composition taxable person, not eligible to collect tax on supplies.":""}function Re(a){return a?.gstMode==="INTRA"||a?.gstMode==="INTER"}function Et(a){return(a?.items||[]).some(l=>l.sac)}function ut(a){if(!Re(a))return"";const l=(f,y)=>`<div style="display:flex; justify-content:space-between;"><span>${f}:</span><span>${r(y)}</span></div>`;return a.gstMode==="INTER"?l("IGST",a.igstPaise||0):l("CGST",a.cgstPaise||0)+l("SGST",a.sgstPaise||0)}function Ge(a,l,f="A4"){return f==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${_e(l,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${i(l?.centreName||"VLEBook Centre")}</strong><br>
          <span>${i(l?.address||"")}</span><br>
          <span>Mob: ${i(l?.mobile||"")}</span>
          ${a.centreGstin||a.gstMode&&a.gstMode!=="NONE"&&l?.gstin?`<br><span>GSTIN: ${i(a.centreGstin||l.gstin)}</span>`:""}${l?.akshayaId?`<br><span>Akshaya ID: ${i(l.akshayaId)}</span>`:""}${l?.cscId?`<br><span>CSC ID: ${i(l.cscId)}</span>`:""}
        </div>
        <div>
          ${Ae(a)?`<div style="text-align:center; font-weight:700;">${Ae(a)}</div>`:""}${ke(a)?`<div style="text-align:center; font-size:9px;">${ke(a)}</div>`:""}
          ${a.customerGstin?`<div>Cust GSTIN: ${i(a.customerGstin)}</div>`:""}
          <strong>Inv: ${i(a.invoiceNo)}</strong> | Date: ${i(a.date)}<br>
          Cust: ${i(a.customerName)} (${i(a.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(a.items||[]).map(y=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${i(y.serviceName.slice(0,20))} x${y.qty}</span>
              <span>${r(y.lineTotalPaise)}</span>
            </div>${Xe(y).map(([x,h])=>`<div style="font-size:10px;">${i(x)}: ${i(h)}</div>`).join("")}`).join("")}
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Govt Fees:</span><span>${r(a.govtFeeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Service Charges:</span><span>${r(a.serviceChargeTotalPaise)}</span></div>
        ${ut(a)}
        <div style="display:flex; justify-content:space-between;"><span>Round off:</span><span>${Number(a.roundOffPaise||0)<0?"-":"+"}${r(Math.abs(Number(a.roundOffPaise||0)))}</span></div>
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px; margin-top:4px;">
          <span>TOTAL:</span><span>${r(a.grandTotalPaise)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Paid (${i(a.paymentMode)}):</span><span>${r(a.paidPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Balance Due:</span><span>${r(a.duePaise)}</span></div>
        ${je(l?.signatureImage)?`<div style="text-align:right; margin-top:8px;"><img src="${l.signatureImage}" alt="Signature" style="max-height:30px; max-width:55%; object-fit:contain; filter:grayscale(1);"><div style="font-size:9px;">Authorised Signatory</div></div>`:""}
        ${Oe(l)}
        <div style="text-align:center; margin-top:8px; font-size:10px;">
          ${i(l?.footerNote||"Thank you for visiting!")}
        </div>
      </div>
    `:Ue(xe(a,l||{},{reviewUrl:Le(l)}))}function Le(a){const l=String(a?.googleReviewUrl||"").trim();return a?.googleReviewQrEnabled&&l&&!Se(l)?l:""}export{u as renderBillingModule};
