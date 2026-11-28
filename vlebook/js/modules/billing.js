import{getCurrentUser as _e,can as V}from"../core/auth.js";import{reviewUrlProblem as xe}from"../core/dayclose.js";function ze(i){const l=String(i?.googleReviewUrl||"").trim();if(!i?.googleReviewQrEnabled||!l||xe(l))return"";try{const d=Ae(l,"M"),p=d.size+8;let P="";for(let u=0;u<d.size;u++)for(let S=0;S<d.size;S++)d.modules[u][S]&&(P+=`M${S+4} ${u+4}h1v1h-1z`);const b=Math.min(40,Math.max(15,Number(i.googleReviewQrSizeMm)||22));return`<div style="text-align:center; margin-top:6px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p} ${p}" style="width:${b}mm; height:${b}mm;" role="img" aria-label="QR code to review us on Google" shape-rendering="crispEdges"><rect width="${p}" height="${p}" fill="#fff"/><path d="${P}" fill="#000"/></svg><div style="font-size:10px;">Happy with our service? Scan to review us on Google</div></div>`}catch{return""}}import{logoImgTag as Ue,isValidLogo as je}from"../core/branding.js";import{invoiceModel as Se,invoiceA4HTML as Ve,invoicePDFBlob as He}from"../core/invoicelayout.js";import{getLicenceState as Qe,BASIC_DAILY_BILLS as Ie}from"../core/licence.js";import{getAllRecords as G,getRecord as we,putRecord as Ne,deleteRecord as Ce}from"../core/db.js";import{STATES as Te,ratesInForce as We}from"../core/gst.js";import{gstRegistrationOf as Ye,resolveBillGstMode as Xe,calculateInvoiceLine as Ke,lineGstRate as E,lineRefs as Je,roundToRupeePaise as Ze,createMultiServiceInvoice as et,editInvoice as tt,cancelInvoiceWithReversal as it,peekNextInvoiceNo as at,getCustomer360Profile as st,notifyCrossTabSync as lt}from"../core/accounting.js";import{SERVICE_CATEGORIES as ot}from"./services.js";import{uid as L,todayISO as H,nowISO as nt,formatINR as n,fromPaise as q,toPaise as k,amountInWordsINR as rt,esc as a,buildWhatsAppURL as ct,downloadFile as dt,printDocumentSheet as pt}from"../core/utils.js";import{formatWhatsAppTemplate as ut,getLang as Ee,t as f}from"../core/i18n.js";import{billUpi as ke,upiLine as mt}from"../core/upi.js";import{generateQRMatrix as Ae}from"../core/qrcode.js";let r=[],g=null,C="NONE",y={gstin:"",pos:""};const Re=!0;let Q=null,x=null,W="A4",B=null,te=null,re=!1,T={mobile:"",name:""},A=(()=>{try{return localStorage.getItem("vlebook_last_staff")||""}catch{return""}})();async function D(){await Ne("drafts",{id:"DRAFT_BILLING_VISIT",currentLines:r,selectedCustomerId:g?.id||null,typedCustomer:T,gstMode:C,billGst:y,applyRoundOff:Re,savedAt:nt()})}async function v(i,l){const[d,p,P,b,u,S,Me]=await Promise.all([G("services"),G("customers"),G("bills"),we("settings","CENTRE_CONFIG"),we("drafts","DRAFT_BILLING_VISIT"),G("staff"),G("inventory")]),Be=(await G("accounts")).filter(e=>e.active!==!1),w=Ye(b||{},H());!y.gstin&&g?.gstin&&w.type==="REGULAR"&&(y.gstin=g.gstin);try{C=Xe(b||{},{requested:"",placeOfSupply:y.pos,customerGstin:y.gstin})}catch{C=w.type==="REGULAR"?"INTRA":w.type==="COMPOSITION"?"COMPOSITION":"NONE"}const R=C==="INTRA"||C==="INTER",Oe=R?await We(H()):[],O=[...Me].sort((e,t)=>String(e.name).localeCompare(String(t.name))),Y={};r.filter(e=>e.kind==="PRODUCT").forEach(e=>Y[e.itemId]=(Y[e.itemId]||0)+(Number(e.qty)||0));const F=e=>{const t=O.find(s=>s.id===e);return t?Math.round(((Number(t.currentStock)||0)-(Y[e]||0))*1e3)/1e3:null},_=S.filter(e=>e.active!==!1).sort((e,t)=>e.name.localeCompare(t.name));A&&!_.some(e=>e.id===A)&&(A="");const X=_e();X?.staffId&&X.role==="OPERATOR"&&_.some(e=>e.id===X.staffId)&&(A=X.staffId),!re&&u&&Array.isArray(u.currentLines)&&u.currentLines.length>0&&(r=u.currentLines,u.selectedCustomerId&&(g=p.find(e=>e.id===u.selectedCustomerId)||null),u.typedCustomer&&(T={mobile:"",name:"",...u.typedCustomer}),u.gstMode&&(C=u.gstMode),u.billGst&&(y=u.billGst),re=!0),re=!0;const ce=sessionStorage.getItem("vlebook_preview_bill_id");ce&&(sessionStorage.removeItem("vlebook_preview_bill_id"),Q=ce);const de=sessionStorage.getItem("vlebook_preselect_customer");if(de){sessionStorage.removeItem("vlebook_preselect_customer");const e=p.find(t=>t.id===de);e&&(g=e)}const pe=sessionStorage.getItem("vlebook_workbench_bill_item");if(pe){sessionStorage.removeItem("vlebook_workbench_bill_item");try{const e=JSON.parse(pe);r.push(e)}catch{}}const K=g?await st(g.id):null,ie=K?.metrics?.availableAdvancePaise||0,J=r.map(e=>Ke(e,C)),ue=J.reduce((e,t)=>e+t.lineGovtFeePaise,0),me=J.reduce((e,t)=>e+t.lineServiceChargePaise,0),ve=J.reduce((e,t)=>e+t.totalTaxPaise,0),fe=ue+me+ve,z=Ze(fe),ge=z-fe,Z=[...P].sort((e,t)=>String(t.createdAt||t.date).localeCompare(String(e.createdAt||e.date))),$=Q?P.find(e=>e.id===Q):Z[0];i.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Unified Counter Multi-Service Billing & Invoicing</h1>
        <p>Bill multiple services in one citizen visit, separate government fees from service revenue, and print A4 or Thermal receipts</p>
      </div>
      <div class="module-actions">
        <span class="badge badge-info">Next Invoice: ${a(await at(b))}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Create Multi-Service Counter Invoice</div>
        <div style="display:flex; gap:8px; align-items:center;">
          ${w.type==="UNREGISTERED"?`<span class="badge badge-info" title="${a(f("Your centre is not GST registered, so bills carry no GST. Add your GSTIN in Books & GST → GST profile if you register."))}">${f("Bill (no GST)")}</span>`:w.type==="COMPOSITION"?`<span class="badge badge-warning" title="${a(f("Composition dealer: Bill of Supply, no GST is collected from customers."))}">${f("Bill of Supply (composition)")}</span>`:`<span class="badge badge-success">${f("Tax Invoice")} · ${C==="INTER"?"IGST":"CGST + SGST"}</span>
          <input class="form-control" id="bill-cust-gstin" style="width:175px;" maxlength="15" placeholder="${a(f("Customer GSTIN (optional)"))}" title="${a(f("Give the GSTIN of a registered customer so they can claim input tax credit (B2B)."))}" aria-label="Customer GSTIN" value="${a(y.gstin)}">
          <select class="form-control" id="bill-pos" style="width:190px;" aria-label="Place of supply" title="${a(f("Place of supply. Your own State gives CGST + SGST; another State gives IGST."))}"><option value="">${f("Place of supply")}: ${a(Te[w.stateCode]||w.stateCode)}</option>${Object.entries(Te).filter(([e])=>e!==w.stateCode&&!["97","99"].includes(e)).map(([e,t])=>`<option value="${e}" ${y.pos===e?"selected":""}>${e} ${a(t)}</option>`).join("")}</select>`}
          <span id="bill-gstin-msg" style="font-size:12px; color:#B42318;"></span>
        </div>
      </div>

      <!-- Customer Lookup Strip -->
      <div class="grid-3" style="margin-bottom:14px; background:var(--color-surface-alt); padding:12px; border-radius:var(--radius-sm);">
        <div class="form-group">
          <label class="form-label">Customer Mobile (Auto-Lookup) <span class="req">*</span></label>
          <input type="tel" class="form-control" id="bill-cust-mobile" maxlength="10" placeholder="Enter 10-digit mobile..." value="${a(g?.mobile||T.mobile||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Customer Full Name <span class="req">*</span></label>
          <input type="text" class="form-control" id="bill-cust-name" placeholder="Citizen Full Name" value="${a(g?.name||T.name||"")}">
        </div>
        <div class="form-group">
          <label class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="bill-date" value="${x?a(x.date):H()}" ${x?'disabled title="A revised invoice keeps the date of the original"':""}>
        </div>
      </div>

      ${K?`<div class="callout success" style="margin-bottom:12px;">
              <div>
                <strong>Matched Customer 360°:</strong> ${a(g.name)} (${a(g.id)}) |
                Previous Visits: <strong>${K.metrics.totalVisits}</strong> |
                Pending Due: <strong>${n(K.metrics.outstandingDuePaise)}</strong> |
                Available Advance: <strong>${n(ie)}</strong>
              </div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-clear-cust">Clear</button>
            </div>`:""}

      <!-- Quick Service Picker Bar -->
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-service-select" style="max-width:340px;">
          ${d.filter(e=>e.active!==!1).map(e=>`<option value="${a(e.id)}" ${te===e.id?"selected":""}>${a(e.name)} — ${n(e.customerPricePaise)} (Govt: ${n(e.govtFeePaise)})</option>`).join("")}
        </select>
        <button type="button" class="btn btn-teal" id="bill-add-line-btn">Add Service to Visit</button>
        <button type="button" class="btn btn-outline" id="bill-quick-edit-srv-btn" title="Edit the selected service in the catalogue">Edit Selected Service</button>
        <button type="button" class="btn btn-gold" id="bill-quick-new-srv-btn" title="Create a brand-new service and add to list">Create New Service</button>
        <button type="button" class="btn btn-outline" id="bill-add-five-demo-btn" title="Add 5 common citizen services in one click">5-Service Preset</button>
      </div>
      ${O.length?`<div style="display:flex; gap:8px; align-items:center; margin:-4px 0 12px; flex-wrap:wrap;">
        <select class="form-control" id="bill-add-item-select" style="max-width:420px;">
          ${O.map(e=>`<option value="${a(e.id)}">${a(e.name)} — ${n(e.sellingPricePaise||0)} ${e.priceIncludesGst?"(incl. GST)":"(excl. GST)"} · stock ${a(e.currentStock)} ${a(e.unit||"")}</option>`).join("")}
        </select>
        <button type="button" class="btn btn-outline" id="bill-add-item-btn" title="Sell an item from Stock & Inventory on this bill">Add Item from Stock</button>
      </div>`:""}

      ${B?(()=>{const e=B==="EDIT"?d.find(t=>t.id===te)||d[0]:null;return`
              <div class="card" style="background:var(--color-surface-alt); border:2px solid var(--color-teal); margin-bottom:14px;">
                <div class="card-header" style="padding-bottom:8px; margin-bottom:10px;">
                  <div class="card-title" style="font-size:14px;">
                    ${e?`Edit Present Service: ${a(e.name)}`:"Create New Service & Add to Service List"}
                  </div>
                  <button type="button" class="btn btn-xs btn-outline" id="bill-close-quick-srv">Close</button>
                </div>
                <form id="bill-quick-srv-form" class="grid-3" style="gap:10px; align-items:end;">
                  <input type="hidden" name="id" value="${a(e?.id||"")}">
                  <div class="form-group">
                    <label class="form-label">Service Name <span class="req">*</span></label>
                    <input type="text" class="form-control" name="name" required placeholder="e.g. Color Print / Birth Certificate" value="${a(e?.name||"")}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Category</label>
                    <select class="form-control" name="category">
                      ${ot.map(t=>`<option value="${a(t)}" ${e?.category===t?"selected":""}>${a(t)}</option>`).join("")}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                    <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" required value="${e?q(e.customerPricePaise):"100"}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Govt / Challan Fee (₹)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="govtFee" value="${e?q(e.govtFeePaise):"0"}">
                  </div>
                  ${w.type==="REGULAR"?`<div class="form-group">
                    <label class="form-label">${f("GST on this price")}</label>
                    <select class="form-control" name="gstPricing">
                      <option value="PLUS" ${e?.priceIncludesGst?"":"selected"}>${f("Price + GST (GST added on top)")}</option>
                      <option value="INCL" ${e?.priceIncludesGst?"selected":""}>${f("Price includes GST")}</option>
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
            ${J.map((e,t)=>`
              <tr>
                <td>${t+1}</td>
                <td>
                  <input type="text" class="form-control" data-ln-field="serviceName" data-idx="${t}" value="${a(e.serviceName)}">
                  ${e.kind==="PRODUCT"?`<small style="color:var(--color-text-muted);">Stock item${e.sac?` · HSN ${a(e.sac)}`:""} · price ${e.priceIncludesGst?"includes":"excludes"} GST${F(e.itemId)!==null&&F(e.itemId)<0?` · <strong style="color:var(--color-danger);">Stock will go negative (${a(F(e.itemId))})</strong>`:F(e.itemId)!==null?` · stock after bill ${a(F(e.itemId))}`:""}</small>`:""}
                </td>
                <td>
                  <input type="number" min="${e.kind==="PRODUCT"?"0.001":"1"}" step="${e.kind==="PRODUCT"?"any":"1"}" class="form-control" data-ln-field="qty" data-idx="${t}" value="${e.qty}">
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="rate" data-idx="${t}" value="${q(e.unitRatePaise)}">
                </td>
                <td>
                  ${e.kind==="PRODUCT"?'<span style="color:var(--color-text-muted);">—</span>':`<input type="number" step="0.01" min="0" class="form-control" data-ln-field="govtFee" data-idx="${t}" value="${q(e.unitGovtFeePaise)}">`}
                </td>
                <td>
                  <input type="number" step="0.01" min="0" class="form-control" data-ln-field="discount" data-idx="${t}" value="${q(e.discountPaise)}">
                </td>
                ${R?`<td><select class="form-control" data-ln-field="gstRate" data-idx="${t}" title="GST on the service charge only (never on the government fee)">${!r[t]?.gstExempt&&(e.gstRate===null||e.gstRate===void 0||e.gstRate==="")?'<option value="" selected>Choose</option>':""}${[...new Set([...Oe,...e.gstRate!==""&&e.gstRate!=null?[Number(e.gstRate)]:[]])].sort((s,o)=>s-o).map(s=>`<option value="${s}" ${!r[t]?.gstExempt&&e.gstRate===s?"selected":""}>${s}%</option>`).join("")}<option value="EX" ${r[t]?.gstExempt?"selected":""}>${f("Exempt")}</option></select>
                    <label style="font-size:11px; display:flex; gap:4px; align-items:center; margin-top:2px;" title="${a(f("Tick when the rate you typed already includes GST"))}"><input type="checkbox" data-ln-field="priceIncludesGst" data-idx="${t}" ${r[t]?.priceIncludesGst?"checked":""}> ${f("incl. GST")}</label></td>`:""}
                <td class="num" style="color:var(--color-success); font-weight:600;">${n(e.lineServiceChargePaise)}</td>
                <td class="num"><strong>${n(e.lineTotalPaise)}</strong></td>
                <td>
                  ${e.kind==="PRODUCT"?"—":`<input type="checkbox" data-ln-field="createPendingTask" data-idx="${t}" ${e.createPendingTask?"checked":""} title="Create Application Tracking record">`}
                </td>
                <td>
                  <button type="button" class="btn btn-xs btn-danger" data-remove-ln="${t}">×</button>
                </td>
              </tr>
              ${e.kind==="PRODUCT"?"":`<tr class="ln-refs-row"><td></td><td colspan="${R?10:9}" style="padding-top:0;">
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;"><small style="color:var(--color-text-muted);">Reference numbers (optional, printed on the invoice):</small>
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="appRefNo" data-idx="${t}" value="${a(/^REF-\d+$/.test(e.appRefNo||"")?"":e.appRefNo||"")}" placeholder="Application No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="ackNo" data-idx="${t}" value="${a(e.ackNo||"")}" placeholder="Acknowledgement No.">
                <input type="text" class="form-control" style="max-width:190px; padding:4px 6px; font-size:12px;" maxlength="60" data-ln-field="trackNo" data-idx="${t}" value="${a(e.trackNo||"")}" placeholder="Tracking No.">
                </div>${(e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0)>0?`<div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:4px;"><small style="color:var(--color-text-muted);">Govt / portal fee ${n((e.lineGovtFeePaise||0)+(e.lineThirdPartyPaise||0))} paid from:</small>
                <select class="form-control" style="max-width:200px; padding:4px 6px; font-size:12px;" data-ln-field="feePaidFrom" data-idx="${t}" aria-label="Account the government fee was paid from"><option value="">Not paid to portal yet</option>${Be.map(s=>`<option value="${a(s.id)}" ${r[t]?.feePaidFrom===s.id?"selected":""}>${a(s.name)}</option>`).join("")}</select>
                ${r[t]?.feePaidFrom?`<input type="text" class="form-control" style="max-width:170px; padding:4px 6px; font-size:12px;" maxlength="80" data-ln-field="feeProviderRef" data-idx="${t}" value="${a(r[t].feeProviderRef||"")}" placeholder="Portal transaction ref."><select class="form-control" style="max-width:120px; padding:4px 6px; font-size:12px;" data-ln-field="feeStatus" data-idx="${t}" aria-label="Portal payment status"><option value="SUCCESS">Successful</option><option value="PENDING" ${r[t].feeStatus==="PENDING"?"selected":""}>Pending</option></select><small class="fee-warn" data-fee-warn="${t}" style="color:#B42318;"></small>`:""}
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
              ${_.map(e=>`<option value="${a(e.id)}" ${e.id===A?"selected":""}>${a(e.name)}${e.role?` (${a(e.role)})`:""}</option>`).join("")}
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
              <input type="number" step="0.01" min="0" max="${q(ie)}" class="form-control" id="bill-advance-adj" value="0">
              <span class="form-hint">Available Advance: ${n(ie)}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Amount Paid Now (₹)</label>
              <input type="number" step="0.01" min="0" class="form-control" id="bill-paid-now" value="${q(z).toFixed(2)}">
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
            <strong style="font-family:var(--font-mono); color:var(--color-warning);">${n(ue)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Centre Taxable Service Revenue:</span>
            <strong style="font-family:var(--font-mono); color:var(--color-success);">${n(me)}</strong>
          </div>
          ${R?`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span>${C==="INTRA"?"CGST + SGST":"IGST"} on Service Charge:</span>
                  <strong style="font-family:var(--font-mono);">${n(ve)}</strong>
                </div>`:""}
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; color:var(--color-text-muted);">
            <span title="${a(f("Every bill is rounded to the nearest rupee: 49 paise or less down, 50 paise or more up."))}">${f("Round off (to the nearest rupee)")}</span>
            <span>${ge<0?"−":"+"}${n(Math.abs(ge))}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:2px solid var(--color-border-strong); font-size:17px; font-weight:800;">
            <span>Grand Total Payable:</span>
            <span style="font-family:var(--font-mono); color:var(--color-navy);">${n(z)}</span>
          </div>
          <div style="font-size:11.5px; color:var(--color-text-muted); margin:6px 0 12px;">
            <em>${a(rt(z))}</em>
          </div>
          ${x?`<div class="callout warning" id="bill-edit-box" style="margin-bottom:8px; display:block;">
              <strong>Editing invoice <span data-no-i18n>${a(x.invoiceNo)}</span>.</strong> Saving issues the revised invoice <b data-no-i18n>${a(x.nextNo)}</b> with the same date and cancels the original with a credit note (money, stock and books are reversed and posted again).
              <div class="form-group" style="margin-top:6px;"><label class="form-label" for="bill-edit-reason">Reason for editing <span class="req">*</span></label><input type="text" class="form-control" id="bill-edit-reason" maxlength="150" placeholder="e.g. wrong service selected, customer name corrected"></div>
              <button type="button" class="btn btn-xs btn-outline" id="bill-edit-stop">Stop editing</button>
            </div>`:""}
          <button type="button" class="btn btn-primary" id="bill-submit-btn" style="width:100%; padding:10px; font-size:14px;">
            ${x?"Save revised invoice":"Generate Invoice & Post to Ledger"}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Invoice Register & Print / Thermal Receipt Preview -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Recent Invoices (${Z.length})</div>
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
              ${Z.length===0?'<tr><td colspan="7" style="text-align:center; padding:18px;">No invoices generated yet.</td></tr>':Z.map(e=>`
                    <tr>
                      <td><strong>${a(e.invoiceNo)}</strong><br><small style="color:var(--color-text-muted);">${a(e.date)}</small></td>
                      <td>
                        <a href="#" data-jump-c360="${a(e.customerId)}" style="color:var(--color-teal); font-weight:600;">${a(e.customerName)}</a><br>
                        <small style="color:var(--color-text-muted);">${(e.items||[]).length} services</small>
                      </td>
                      <td class="num">${n(e.grandTotalPaise)}</td>
                      <td class="num" style="color:var(--color-success);">${n(e.paidPaise)}</td>
                      <td class="num" style="color:${e.duePaise>0?"var(--color-danger)":"var(--color-text-muted)"};">${n(e.duePaise)}</td>
                      <td>
                        <span class="badge ${e.status==="PAID"?"badge-success":e.status==="PARTIAL"?"badge-warning":e.status==="CANCELLED"?"badge-neutral":"badge-danger"}">${a(e.status)}</span>
                      </td>
                      <td>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                          <button class="btn btn-xs btn-teal" data-view-bill="${a(e.id)}">View/Print</button>
                          <button class="btn btn-xs btn-outline" data-dup-bill="${a(e.id)}" title="Duplicate items into new bill">Dup</button>
                          ${e.status!=="CANCELLED"&&V("cancel_invoice")?`<button class="btn btn-xs btn-outline" data-edit-bill="${a(e.id)}" title="Edit this invoice: a revised invoice is issued and the original is cancelled with a credit note">Edit</button>`:""}
                          ${e.status!=="CANCELLED"&&(e.duePaise||0)>0&&V("reverse_voucher")?`<button class="btn btn-xs btn-outline" data-credit-note="${a(e.id)}" title="Reduce the service charge on this bill after billing">Credit note</button>`:""}
                          ${(e.govtFeeTotalPaise||0)+(e.thirdPartyTotalPaise||0)>0&&V("view_books")?`<button class="btn btn-xs btn-outline" data-fee-chain="${a(e.id)}" title="Government fee: paid to portal and recovered from customer">Fee chain</button>`:""}
                          ${e.status!=="CANCELLED"&&V("cancel_invoice")?`<button class="btn btn-xs btn-danger" data-cancel-bill="${a(e.id)}" title="Cancel with Credit Note">Cancel</button>`:""}
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
                  <a href="${a(ct($.customerMobile,ut(Ee(),"invoice",{customerName:$.customerName,centreName:b?.centreName||"VLE360 Centre",invoiceNo:$.invoiceNo,totalAmount:n($.grandTotalPaise),paidAmount:n($.paidPaise),dueAmount:n($.duePaise)},b?.whatsappTemplates)+(ke($,b||{})?`

${mt(Ee(),n($.duePaise),b.upiId)}`:"")))}" target="_blank" rel="noopener" class="btn btn-xs btn-success">WhatsApp</a>
                </div>`:""}
        </div>
        <div id="printable-area">
          ${$?De($,b,W):'<p style="padding:20px; color:var(--color-text-muted); text-align:center;">Generate or select an invoice to preview A4 and Thermal layouts.</p>'}
        </div>
      </div>
    </div>
  `;const U=i.querySelector("#bill-cust-mobile"),ae=i.querySelector("#bill-cust-name");U?.addEventListener("input",()=>{const e=U.value.replace(/\D/g,"").slice(-10);if(g||(T.mobile=U.value),e.length===10){const t=p.filter(s=>s.mobile===e);if(t.length===1)g=t[0],v(i,l);else if(t.length>1){let s=i.querySelector("#bill-family-pick");s||(s=document.createElement("div"),s.id="bill-family-pick",s.className="callout info",U.closest(".form-group, div")?.after(s)),s.innerHTML=`<div><strong>This mobile is used by a family:</strong> ${t.map(o=>`<button type="button" class="btn btn-xs btn-outline" data-pickcust="${a(o.id)}"><span data-no-i18n>${a(o.name)}</span>${o.relation?` · ${a(o.relation)}`:""}</button>`).join(" ")}</div>`,s.querySelectorAll("[data-pickcust]").forEach(o=>o.addEventListener("click",()=>{g=t.find(m=>m.id===o.dataset.pickcust),v(i,l)}))}}}),ae?.addEventListener("input",()=>{g||(T.name=ae.value)}),i.querySelector("#bill-clear-cust")?.addEventListener("click",()=>{g=null,T={mobile:"",name:""},v(i,l)}),i.querySelector("#bill-add-line-btn")?.addEventListener("click",()=>{const e=i.querySelector("#bill-add-service-select")?.value,t=d.find(s=>s.id===e)||d[0];t&&(r.push({id:L("LN"),serviceId:t.id,serviceName:t.name,category:t.category,qty:1,ratePaise:t.customerPricePaise,govtFeePaise:t.govtFeePaise,thirdPartyPaise:t.thirdPartyPaise||0,priceIncludesGst:!!t.priceIncludesGst,gstExempt:!!t.gstExempt,commissionPaise:t.commissionPaise||0,discountPaise:0,gstApplicable:E(t)>0,gstRate:E(t),sac:t.sac||"",createPendingTask:t.category==="Government & Citizen Services"}),D().catch(()=>{}),v(i,l))}),i.querySelector("#bill-add-item-btn")?.addEventListener("click",()=>{const e=O.find(t=>t.id===i.querySelector("#bill-add-item-select")?.value);e&&(r.push({id:L("LN"),kind:"PRODUCT",itemId:e.id,unit:e.unit||"",serviceName:e.name,qty:1,ratePaise:Number(e.sellingPricePaise)||0,directCostPaise:Number(e.purchasePricePaise)||0,priceIncludesGst:!!e.priceIncludesGst,gstRate:e.gstRate===void 0||e.gstRate===null||e.gstRate===""?null:Number(e.gstRate),gstApplicable:E(e)>0,sac:e.hsn||"",discountPaise:0}),Number(e.sellingPricePaise)>0||alert("This item has no selling price yet. Type the price in the Rate column, or set it in Stock & Inventory → Items."),D().catch(()=>{}),v(i,l))}),i.querySelector("#bill-quick-edit-srv-btn")?.addEventListener("click",()=>{te=i.querySelector("#bill-add-service-select")?.value||d[0]?.id,B="EDIT",v(i,l)}),i.querySelector("#bill-quick-new-srv-btn")?.addEventListener("click",()=>{B="CREATE",v(i,l)}),i.querySelector("#bill-close-quick-srv")?.addEventListener("click",()=>{B=null,v(i,l)}),i.querySelector("#bill-quick-srv-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),s=!t.get("id"),o=k(t.get("customerPrice")),m=k(t.get("govtFee")),I=s?null:d.find(N=>N.id===t.get("id")),h=await Ne("services",{...I,id:t.get("id")||L("SRV"),name:t.get("name").trim(),category:t.get("category"),state:I?.state||"Kerala / All India",customerPricePaise:o,govtFeePaise:m,thirdPartyPaise:0,serviceChargePaise:Math.max(0,o-m),priceIncludesGst:t.get("gstPricing")?t.get("gstPricing")==="INCL":!!I?.priceIncludesGst,commissionPaise:I?.commissionPaise||0,gstApplicable:E(I||{})>0,gstRate:E(I||{}),sac:I?.sac||"",turnaroundTime:I?.turnaroundTime||"Same Day",checklist:I?.checklist||"",active:!0});te=h.id,B=null,s?r.push({id:L("LN"),serviceId:h.id,serviceName:h.name,category:h.category,qty:1,ratePaise:h.customerPricePaise,govtFeePaise:h.govtFeePaise,thirdPartyPaise:0,priceIncludesGst:!!h.priceIncludesGst,commissionPaise:0,discountPaise:0,gstApplicable:E(h)>0,gstRate:E(h),createPendingTask:h.category==="Government & Citizen Services"}):r.forEach(N=>{N.serviceId===h.id&&(N.serviceName=h.name,N.ratePaise=h.customerPricePaise,N.govtFeePaise=h.govtFeePaise,N.priceIncludesGst=!!h.priceIncludesGst)}),lt("SERVICE_UPDATED",{id:h.id}),await v(i,l)}),i.querySelector("#bill-add-five-demo-btn")?.addEventListener("click",()=>{r=d.slice(0,5).map(e=>({id:L("LN"),serviceId:e.id,serviceName:e.name,category:e.category,qty:e.id==="SRV-PRINT-BW"?10:1,ratePaise:e.customerPricePaise,govtFeePaise:e.govtFeePaise,thirdPartyPaise:e.thirdPartyPaise||0,priceIncludesGst:!!e.priceIncludesGst,gstExempt:!!e.gstExempt,commissionPaise:e.commissionPaise||0,discountPaise:0,gstApplicable:E(e)>0,gstRate:E(e),sac:e.sac||"",createPendingTask:e.category==="Government & Citizen Services"})),v(i,l)}),i.querySelectorAll("[data-ln-field]").forEach(e=>{e.addEventListener("change",async()=>{const t=Number(e.getAttribute("data-idx")),s=e.getAttribute("data-ln-field"),o=r[t];o&&(s==="serviceName"?o.serviceName=e.value:s==="qty"?o.qty=o.kind==="PRODUCT"?Math.max(.001,Math.round((Number(e.value)||1)*1e3)/1e3):Math.max(1,Number(e.value)||1):s==="appRefNo"||s==="ackNo"||s==="trackNo"?o[s]=String(e.value||"").trim().slice(0,60):s==="feePaidFrom"?o.feePaidFrom=e.value||"":s==="feeProviderRef"?o.feeProviderRef=String(e.value||"").trim().slice(0,80):s==="feeStatus"?o.feeStatus=e.value==="PENDING"?"PENDING":"SUCCESS":s==="rate"?o.ratePaise=k(e.value):s==="govtFee"?o.govtFeePaise=k(e.value):s==="discount"?o.discountPaise=k(e.value):s==="gstRate"?(o.gstExempt=e.value==="EX",o.gstRate=e.value===""?null:e.value==="EX"?0:Math.max(0,Number(e.value)||0),o.gstApplicable=o.gstRate>0):s==="priceIncludesGst"?o.priceIncludesGst=e.checked:s==="createPendingTask"&&(o.createPendingTask=e.checked),await D(),v(i,l))})}),i.querySelectorAll("[data-fee-warn]").forEach(async e=>{const t=r[Number(e.getAttribute("data-fee-warn"))];if(t?.feePaidFrom)try{const{walletWarning:s}=await import("../core/wallets.js");e.textContent=await s(t.feePaidFrom,((t.govtFeePaise||0)+(t.thirdPartyPaise||0))*(t.qty||1))}catch{}}),["#bill-cust-gstin","#bill-pos"].forEach(e=>i.querySelector(e)?.addEventListener("change",async t=>{if(e==="#bill-cust-gstin"){const s=String(t.target.value||"").toUpperCase().replace(/[^0-9A-Z]/g,"");if(s){const{gstinProblem:o}=await import("../core/gst.js"),m=o(s);if(m){i.querySelector("#bill-gstin-msg").textContent=m;return}}y.gstin=s,s&&!y.pos&&(y.pos=s.slice(0,2)===w.stateCode?"":s.slice(0,2))}else y.pos=String(t.target.value||"").replace(/\D/g,"").slice(0,2);await D(),v(i,l)})),i.querySelectorAll("[data-remove-ln]").forEach(e=>{e.addEventListener("click",async()=>{const t=Number(e.getAttribute("data-remove-ln"));t>=0&&t<r.length&&(r.splice(t,1),await D(),v(i,l))})});const j=i.querySelector("#bill-paid-now"),se=i.querySelector("#bill-advance-adj"),be=i.querySelector("#bill-due-preview"),le=i.querySelector("#bill-pay-mode");i.querySelector("#bill-staff")?.addEventListener("change",e=>{A=e.target.value;try{localStorage.setItem("vlebook_last_staff",A)}catch{}});const oe=()=>{const e=k(j?.value||0),t=k(se?.value||0),s=Math.max(0,z-e-t);be&&(be.value=n(s))};j?.addEventListener("input",oe),se?.addEventListener("input",oe),le?.addEventListener("change",()=>{le.value==="CREDIT"&&j&&(j.value="0.00",oe())}),i.querySelector("#bill-submit-btn")?.addEventListener("click",async()=>{const e=U?.value.trim()||"",t=ae?.value.trim()||"Walk-in Citizen",s=i.querySelector("#bill-date")?.value||H(),o=le?.value||"CASH",m=o==="CREDIT"?0:k(j?.value||0),I=k(se?.value||0),h=i.querySelector("#bill-notes")?.value||"";if(r.length===0){alert("Add at least one service to the visit before generating the invoice.");return}const N=e.replace(/\D/g,"");if(N&&N.length!==10){alert("Customer mobile must be 10 digits (or leave it blank for a walk-in).");return}if((await Qe()).tier==="BASIC"){const c=H(),ne=M=>{if(M.date)return String(M.date).slice(0,10);const ee=new Date(M.createdAt||0);return Number.isNaN(ee.getTime())?"":`${ee.getFullYear()}-${String(ee.getMonth()+1).padStart(2,"0")}-${String(ee.getDate()).padStart(2,"0")}`};if((await G("bills")).filter(M=>ne(M)===c&&M.status!=="CANCELLED").length>=Ie){alert(`Basic mode allows ${Ie} invoices a day, and today's limit is reached. Buy or renew a licence in Users & Licence to make unlimited invoices.`);return}}const ye=R?r.filter(c=>c.kind==="PRODUCT"&&(c.gstRate===null||c.gstRate===void 0||c.gstRate==="")):[];if(ye.length){alert(`${f("Choose the GST rate for these items in the GST % column (or in Stock & Inventory):")} ${ye.map(c=>c.serviceName).join(", ")}`);return}const he=Object.keys(Y).map(c=>({id:c,left:F(c),name:O.find(ne=>ne.id===c)?.name})).filter(c=>c.left!==null&&c.left<0);if(he.length&&!confirm(`Negative stock alert:
${he.map(c=>`${c.name}: stock after this bill ${c.left}`).join(`
`)}

The software stock is less than the quantity billed. Save the bill anyway? (Record the missing purchase or a physical stock check later.)`))return;const $e=x?(i.querySelector("#bill-edit-reason")?.value||"").trim():"";if(x&&$e.length<5){alert(f("Enter the reason for editing this invoice (at least 5 characters).")),i.querySelector("#bill-edit-reason")?.focus();return}let Pe;try{Pe=await(x?c=>tt(x.id,c,$e):et)({date:s,customerId:g?.id||null,customerName:t,customerMobile:e,gstMode:C,...R&&y.gstin?{customerGstin:y.gstin}:{},...R&&y.pos?{placeOfSupply:y.pos}:{},applyRoundOff:Re,items:r,paidPaise:m,advanceAdjustedPaise:I,paymentMode:o,staffId:A||null,staffName:_.find(c=>c.id===A)?.name||"",notes:h})}catch(c){alert(c.message||"Could not create the invoice.");return}Q=Pe.id,x=null,y={gstin:"",pos:""},r=[],g=null,T={mobile:"",name:""},await Ce("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await v(i,l)}),i.querySelectorAll("[data-view-bill]").forEach(e=>{e.addEventListener("click",()=>{Q=e.getAttribute("data-view-bill"),v(i,l)})}),i.querySelectorAll("[data-dup-bill]").forEach(e=>{e.addEventListener("click",async()=>{const t=P.find(s=>s.id===e.getAttribute("data-dup-bill"));t&&(r=(t.items||[]).map(s=>({...s,id:L("LN"),ratePaise:s.unitRatePaise,govtFeePaise:s.unitGovtFeePaise,thirdPartyPaise:s.unitThirdPartyPaise,directCostPaise:s.unitDirectCostPaise,commissionPaise:s.unitCommissionPaise})),await D(),v(i,l))})}),i.querySelectorAll("[data-edit-bill]").forEach(e=>e.addEventListener("click",async()=>{const t=P.find(m=>m.id===e.getAttribute("data-edit-bill"));if(!t||r.length&&!confirm(f("The bill you are making now will be replaced by the invoice to edit. Continue?")))return;r=(t.items||[]).map(m=>({...m,id:L("LN"),ratePaise:m.unitRatePaise,govtFeePaise:m.unitGovtFeePaise,thirdPartyPaise:m.unitThirdPartyPaise,directCostPaise:m.unitDirectCostPaise,commissionPaise:m.unitCommissionPaise})),g=p.find(m=>m.id===t.customerId)||null,T={mobile:t.customerMobile||"",name:t.customerName||""},y={gstin:t.customerGstin||"",pos:t.placeOfSupply||""};const s=String(t.invoiceNo).replace(/-R\d+$/,"");let o=1;for(;P.some(m=>m.invoiceNo===`${s}-R${o}`);)o++;x={id:t.id,invoiceNo:t.invoiceNo,date:t.date,nextNo:`${s}-R${o}`},await D(),await v(i,l),i.querySelector("#bill-edit-reason")?.scrollIntoView({block:"center"})})),i.querySelector("#bill-edit-stop")?.addEventListener("click",async()=>{x=null,r=[],g=null,T={mobile:"",name:""},y={gstin:"",pos:""},await Ce("drafts","DRAFT_BILLING_VISIT",{notifyAutosave:!1}),await v(i,l)}),i.querySelectorAll("[data-credit-note]").forEach(e=>e.addEventListener("click",async()=>{const{creditNoteDialog:t}=await import("./books-ops.js");t(e.getAttribute("data-credit-note"),()=>v(i,l))})),i.querySelectorAll("[data-fee-chain]").forEach(e=>e.addEventListener("click",async()=>{const{showFeeChain:t}=await import("./books.js");t(e.getAttribute("data-fee-chain")).catch(s=>alert(s.message))})),i.querySelectorAll("[data-cancel-bill]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-cancel-bill");if(!V("cancel_invoice"))return alert("You do not have permission to do this. Please ask the Owner.");await it(t,"Operator issued cancellation & credit note"),await v(i,l)})}),i.querySelectorAll("[data-jump-c360]").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const s=e.getAttribute("data-jump-c360");l("customers",s)})}),i.querySelectorAll("[data-fmt]").forEach(e=>{e.addEventListener("click",()=>{W=e.getAttribute("data-fmt"),v(i,l)})}),i.querySelector("#bill-print-btn")?.addEventListener("click",()=>{$&&pt(De($,b,W))}),i.querySelector("#bill-pdf-btn")?.addEventListener("click",async()=>{if(!$)return;const e=await He(Se($,b||{},{reviewUrl:Fe(b)}));dt(e,`Invoice_${$.invoiceNo}.pdf`,"application/pdf")})}function Ge(i){const l=i?.documentType||(qe(i)?"TAX_INVOICE":"BILL");return l==="TAX_INVOICE"?"TAX INVOICE":l==="BILL_OF_SUPPLY"?"BILL OF SUPPLY":""}function Le(i){return i?.gstMode==="COMPOSITION"?"Composition taxable person, not eligible to collect tax on supplies.":""}function qe(i){return i?.gstMode==="INTRA"||i?.gstMode==="INTER"}function Gt(i){return(i?.items||[]).some(l=>l.sac)}function vt(i){if(!qe(i))return"";const l=(d,p)=>`<div style="display:flex; justify-content:space-between;"><span>${d}:</span><span>${n(p)}</span></div>`;return i.gstMode==="INTER"?l("IGST",i.igstPaise||0):l("CGST",i.cgstPaise||0)+l("SGST",i.sgstPaise||0)}function ft(i,l){const d=ke(i,l||{});if(!d)return"";try{const p=Ae(d.url,"M"),P=p.size+8;let b="";for(let u=0;u<p.size;u++)for(let S=0;S<p.size;S++)p.modules[u][S]&&(b+=`M${S+4} ${u+4}h1v1h-1z`);return`<div style="text-align:center; margin-top:6px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${P} ${P}" style="width:30mm;height:30mm;" role="img" aria-label="UPI QR code" shape-rendering="crispEdges"><rect width="${P}" height="${P}" fill="#fff"/><path d="${b}" fill="#000"/></svg><div style="font-size:10px;"><b>Scan to pay by UPI</b> <b data-no-i18n>${n(d.duePaise)}</b></div><div style="font-size:9px;" data-no-i18n>${a(d.id)}</div></div>`}catch{return""}}function De(i,l,d="A4"){return d==="THERMAL"?`
      <div class="invoice-sheet-thermal">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:6px; margin-bottom:6px;">
          ${Ue(l,"display:block; margin:0 auto 4px; max-height:42px; max-width:60%; filter:grayscale(1);")}
          <strong style="font-size:13px;">${a(l?.centreName||"VLE360 Centre")}</strong><br>
          <span>${a(l?.address||"")}</span><br>
          <span>Mob: ${a(l?.mobile||"")}</span>
          ${i.centreGstin||i.gstMode&&i.gstMode!=="NONE"&&l?.gstin?`<br><span>GSTIN: ${a(i.centreGstin||l.gstin)}</span>`:""}${l?.akshayaId?`<br><span>Akshaya ID: ${a(l.akshayaId)}</span>`:""}${l?.cscId?`<br><span>CSC ID: ${a(l.cscId)}</span>`:""}
        </div>
        <div>
          ${Ge(i)?`<div style="text-align:center; font-weight:700;">${Ge(i)}</div>`:""}${Le(i)?`<div style="text-align:center; font-size:9px;">${Le(i)}</div>`:""}
          ${i.customerGstin?`<div>Cust GSTIN: ${a(i.customerGstin)}</div>`:""}
          <strong>Inv: ${a(i.invoiceNo)}</strong> | Date: ${a(i.date)}<br>
          Cust: ${a(i.customerName)} (${a(i.customerMobile||"")})
        </div>
        <div style="border-top:1px dashed #000; border-bottom:1px dashed #000; margin:6px 0; padding:4px 0;">
          ${(i.items||[]).map(p=>`
            <div style="display:flex; justify-content:space-between;">
              <span>${a(p.serviceName.slice(0,20))} x${p.qty}</span>
              <span>${n(p.lineTotalPaise)}</span>
            </div>${Je(p).map(([P,b])=>`<div style="font-size:10px;">${a(P)}: ${a(b)}</div>`).join("")}`).join("")}
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Govt Fees:</span><span>${n(i.govtFeeTotalPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Service Charges:</span><span>${n(i.serviceChargeTotalPaise)}</span></div>
        ${vt(i)}
        <div style="display:flex; justify-content:space-between;"><span>Round off:</span><span>${Number(i.roundOffPaise||0)<0?"-":"+"}${n(Math.abs(Number(i.roundOffPaise||0)))}</span></div>
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px; margin-top:4px;">
          <span>TOTAL:</span><span>${n(i.grandTotalPaise)}</span>
        </div>
        <div style="display:flex; justify-content:space-between;"><span>Paid (${a(i.paymentMode)}):</span><span>${n(i.paidPaise)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Balance Due:</span><span>${n(i.duePaise)}</span></div>
        ${ft(i,l)}
        ${je(l?.signatureImage)?`<div style="text-align:right; margin-top:8px;"><img src="${l.signatureImage}" alt="Signature" style="max-height:30px; max-width:55%; object-fit:contain; filter:grayscale(1);"><div style="font-size:9px;">Authorised Signatory</div></div>`:""}
        ${ze(l)}
        <div style="text-align:center; margin-top:8px; font-size:10px;">
          ${a(l?.footerNote||"Thank you for visiting!")}
        </div>
      </div>
    `:Ve(Se(i,l||{},{reviewUrl:Fe(l)}))}function Fe(i){const l=String(i?.googleReviewUrl||"").trim();return i?.googleReviewQrEnabled&&l&&!xe(l)?l:""}export{v as renderBillingModule};
