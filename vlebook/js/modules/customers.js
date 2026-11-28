import{localScriptFields as G,wireLocalScript as H,micButton as M}from"./localscript.js";import{getAllRecords as R,getRecord as K,putRecord as J}from"../core/db.js";import{saveCustomerRecord as Q,getCustomer360Profile as Z,recordCustomerLedgerPayment as X}from"../core/accounting.js";import{restoreScopeDraft as Y,clearScopeDraft as ee}from"../core/autosave.js";import{uid as te,todayISO as C,formatINR as b,formatDate as I,toPaise as se,esc as s,buildWhatsAppURL as O,exportToCSV as ae,exportToExcel as le,generateSimplePDFBlob as ie,downloadFile as oe}from"../core/utils.js";import{formatWhatsAppTemplate as B,getLang as F}from"../core/i18n.js";import{validUpiId as re,upiLine as de}from"../core/upi.js";let q="",N=null,k=null,y=!1;function ye(){y=!0,N=null}async function h(a,n,v=null){v&&(N=v);const[o,f,x,m]=await Promise.all([R("customers"),R("bills"),R("payments"),K("settings","CENTRE_CONFIG")]),c=o.map(e=>{const d=f.filter(r=>r.customerId===e.id&&r.status!=="CANCELLED"),$=x.filter(r=>r.customerId===e.id),A=d.reduce((r,P)=>r+(P.grandTotalPaise||0),0),_=d.reduce((r,P)=>r+(P.duePaise||0),0),T=$.filter(r=>r.type==="ADVANCE").reduce((r,P)=>r+(P.amountPaise||0),0),U=$.filter(r=>r.type==="ADVANCE_ADJUST").reduce((r,P)=>r+(P.amountPaise||0),0),V=Math.max(0,T-U),W=$.filter(r=>r.type==="PENDING_REFUND").reduce((r,P)=>r+(P.amountPaise||0),0),j=d.length?d[d.length-1].date:e.registrationDate,z=d.filter(r=>(r.duePaise||0)>0).map(r=>String(r.date||"")).sort()[0]||"";return{...e,visits:d.length,totalSpentPaise:A,duePaise:_,advancePaise:V,pendingRefundPaise:W,lastVisit:j,oldestDue:z}}),i=q.trim().toLowerCase(),g=c.filter(e=>(!y||e.duePaise>0)&&(!i||e.name.toLowerCase().includes(i)||String(e.mobile||"").includes(i)||String(e.id||"").toLowerCase().includes(i)));y&&g.sort((e,d)=>d.duePaise-e.duePaise);const E=c.reduce((e,d)=>e+Math.max(0,d.duePaise),0),L=c.filter(e=>e.duePaise>0).length,t=e=>e?Math.max(0,Math.round((Date.parse(C())-Date.parse(e))/864e5)):0,u=e=>{const d=B(F(),"due_reminder",{customerName:e.name,centreName:m?.centreName||"VLE360 Centre",dueAmount:b(e.duePaise)},m?.whatsappTemplates),$=m?.upiId&&m?.upiOnBills!==!1&&re(m.upiId)?`

${de(F(),b(e.duePaise),m.upiId)}`:"";return O(e.mobile,d+$)},l=k?o.find(e=>e.id===k):null,p=N?await Z(N):null;a.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Customer CRM & 360° Unified Ledger</h1>
        <p>Central citizen intelligence connecting visits, multi-service bills, dues, advances, studio jobs & applications</p>
      </div>
      <div class="module-actions">
        <button class="btn btn-outline" id="cust-export-csv">Export CSV</button>
        <button class="btn btn-outline" id="cust-export-xls">Export Excel</button>
        <button class="btn btn-teal" id="cust-new-bill-shortcut">Go to Counter Billing</button>
      </div>
    </div>

    <div class="grid-sidebar-right">
      <!-- Left Column: Customer Directory or Customer 360° View -->
      <div>
        ${p?ne(p,m):`
          <div class="card">
            <div class="card-header">
              <div class="card-title">${y?`Dues — customers who owe money (${g.length})`:`Registered Citizens & Customers (${g.length})`}</div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <button type="button" class="btn btn-sm ${y?"btn-primary":"btn-outline"}" id="cust-dues-toggle" aria-pressed="${y}">Dues: <span data-no-i18n>${b(E)}</span> (${L})</button>
                <input type="search" class="form-control" id="cust-search-input" placeholder="Search by Name, 10-digit Mobile or ID..." value="${s(q)}" style="max-width:290px;">
              </div>
            </div>
            ${y?`<div class="form-hint" style="margin:0 0 8px;">Largest dues first. “WhatsApp” opens a ready reminder${m?.upiId?" with your UPI ID":""}; you check and press Send. Record the payment in the customer's 360° Ledger when it arrives.</div>`:""}
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Customer ID & Name</th>
                    <th>Mobile</th>
                    <th>Category / Location</th>
                    <th class="num">Total Spend</th>
                    <th class="num">Pending Due</th>
                    <th class="num">Advance</th>
                    <th>${y?"Oldest unpaid bill":"Last Visit"}</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${g.length===0?'<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--color-text-muted);">No matching customers found. Register a customer using the form on the right.</td></tr>':g.map(e=>`
                        <tr>
                          <td>
                            <strong>${s(e.name)}</strong><br>
                            <small style="color:var(--color-text-muted); font-family:var(--font-mono);">${s(e.id)}</small>
                          </td>
                          <td><strong>${s(e.mobile)}</strong></td>
                          <td>${s(e.category)}<br><small style="color:var(--color-text-muted);">${s(e.district||e.state)}</small></td>
                          <td class="num">${b(e.totalSpentPaise)}</td>
                          <td class="num">
                            ${e.duePaise>0?`<span class="badge badge-danger">${b(e.duePaise)}</span>`:'<span class="badge badge-success">₹0.00</span>'}
                          </td>
                          <td class="num">
                            ${e.advancePaise>0?`<span class="badge badge-info">${b(e.advancePaise)}</span>`:"—"}
                          </td>
                          <td>${y?`${s(I(e.oldestDue))}<br><small style="color:var(--color-text-muted);">${t(e.oldestDue)} days</small>`:s(I(e.lastVisit))}</td>
                          <td>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                              <button class="btn btn-xs btn-teal" data-open-360="${s(e.id)}">360° Ledger</button>
                              <button class="btn btn-xs btn-outline" data-edit-cust="${s(e.id)}">Edit</button>
                              <button class="btn btn-xs btn-gold" data-bill-cust="${s(e.id)}">Bill</button>
                              ${y&&e.mobile?`<a class="btn btn-xs btn-success" href="${s(u(e))}" target="_blank" rel="noopener">WhatsApp</a>`:""}
                            </div>
                          </td>
                        </tr>`).join("")}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </div>

      <!-- Right Column: Add / Edit Customer Form (with Autosave & Duplicate Mobile Check) -->
      <div>
        <div class="card" data-autosave-scope="customer_form">
          <div class="card-header">
            <div class="card-title">${l?`Edit Customer (${s(l.id)})`:"Register New Customer"}</div>
            ${l?'<button class="btn btn-xs btn-outline" id="cust-cancel-edit">Cancel</button>':""}
          </div>
          <div id="cust-form-feedback"></div>
          <form id="customer-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <input type="hidden" name="id" value="${s(l?.id||"")}">
            <div class="form-group">
              <label class="form-label">Full Name <span class="req">*</span></label>
              <div class="ls-row"><input type="text" class="form-control" name="name" id="cust-name" required placeholder="e.g. Rajesh Kumar Nair" value="${s(l?.name||"")}">${M("cust-name")}</div>
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Mobile Number <span class="req">*</span></label>
                <input type="tel" class="form-control" name="mobile" id="cust-mobile" maxlength="10" required placeholder="10-digit mobile" value="${s(l?.mobile||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">Alternate Mobile</label>
                <input type="tel" class="form-control" name="altMobile" maxlength="10" placeholder="Optional" value="${s(l?.altMobile||"")}">
              </div>
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Customer Category</label>
                <select class="form-control" name="category">
                  ${["General Citizen","Regular Citizen","Farmer / Agri","Student","Business / MSME","Senior Citizen","BPL / Priority"].map(e=>`<option value="${e}" ${l?.category===e?"selected":""}>${e}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-control" name="email" placeholder="citizen@example.in" value="${s(l?.email||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">GSTIN (optional, for business customers)</label>
                <input type="text" class="form-control" name="gstin" maxlength="15" autocomplete="off" spellcheck="false" style="text-transform:uppercase;" placeholder="e.g. 32ABCDE1234F1Z5" value="${s(l?.gstin||"")}">
                <div class="form-hint">Printed on tax invoices so the customer can claim input tax credit.</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street / Ward / Village Address</label>
              <div class="ls-row"><input type="text" class="form-control" name="address" id="cust-address" placeholder="House No., Ward, Post Office" value="${s(l?.address||"")}">${M("cust-address")}</div>
            </div>
            ${G(l||{},(l?.state||m?.state||"Kerala")==="Kerala"?"ml":"hi")}
            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">District</label>
                <input type="text" class="form-control" name="district" value="${s(l?.district||m?.district||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-control" name="state" value="${s(l?.state||m?.state||"Kerala")}">
              </div>
              <div class="form-group">
                <label class="form-label">PIN Code</label>
                <input type="text" class="form-control" name="pinCode" maxlength="6" value="${s(l?.pinCode||m?.pinCode||"")}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Operator Notes & Document Retention Note</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="Important citizen preferences (never store Aadhaar OTP/PIN here)">${s(l?.notes||"")}</textarea>
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label" for="cust-family">Family of (head's mobile or customer ID)</label>
                <input type="text" class="form-control" name="familyOf" id="cust-family" maxlength="40" placeholder="Leave empty for the head of the family" value="${s(l?.familyId&&l.familyId!==l.id?l.familyId:"")}">
                <div class="form-hint">A family member may use the head's mobile number.</div>
              </div>
              <div class="form-group">
                <label class="form-label" for="cust-relation">Relation to the head</label>
                <select class="form-control" name="relation" id="cust-relation">${["","Spouse","Son","Daughter","Father","Mother","Brother","Sister","Grandchild","Other"].map(e=>`<option value="${e}" ${l?.relation===e?"selected":""}>${e||"—"}</option>`).join("")}</select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">
              ${l?"Update Customer Record":"Save Customer & Open 360° Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;const S=a.querySelector('[data-autosave-scope="customer_form"]');!l&&S&&await Y("customer_form",S),H(a,{name:()=>a.querySelector("#cust-name")?.value,address:()=>a.querySelector("#cust-address")?.value});const w=a.querySelector("#cust-mobile"),D=a.querySelector("#cust-form-feedback");w?.addEventListener("input",()=>{const e=w.value.replace(/\D/g,"").slice(-10);if(e.length===10){const d=o.find($=>$.mobile===e&&$.id!==k);d&&D?(D.innerHTML=`
          <div class="callout warning">
            <div>
              <strong>Existing Customer Found:</strong> ${s(d.name)} (${s(d.id)}) already uses ${s(e)}.
            </div>
            <button type="button" class="btn btn-xs btn-teal" id="jump-existing-cust">Open 360°</button>
          </div>`,D.querySelector("#jump-existing-cust")?.addEventListener("click",()=>{N=d.id,h(a,n)})):D&&(D.innerHTML="")}}),a.querySelector("#cust-dues-toggle")?.addEventListener("click",()=>{y=!y,h(a,n)}),a.querySelector("#cust-search-input")?.addEventListener("input",e=>{q=e.target.value,h(a,n)}),a.querySelector("#customer-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(e.target),$=Object.fromEntries(d.entries());try{const A=await Q($,!!k);await ee("customer_form"),k=null,N=A.id,await h(a,n)}catch(A){D&&(D.innerHTML=`<div class="callout danger"><span>${s(A.message)}</span></div>`)}}),a.querySelector("#cust-cancel-edit")?.addEventListener("click",()=>{k=null,h(a,n)}),a.querySelectorAll("[data-open-360]").forEach(e=>{e.addEventListener("click",()=>{N=e.getAttribute("data-open-360"),h(a,n)})}),a.querySelectorAll("[data-edit-cust]").forEach(e=>{e.addEventListener("click",()=>{k=e.getAttribute("data-edit-cust"),h(a,n)})}),a.querySelectorAll("[data-bill-cust]").forEach(e=>{e.addEventListener("click",()=>{const d=e.getAttribute("data-bill-cust");sessionStorage.setItem("vlebook_preselect_customer",d),n("billing")})}),a.querySelector("#cust-new-bill-shortcut")?.addEventListener("click",()=>n("billing")),a.querySelector("#cust-export-csv")?.addEventListener("click",()=>{ae(["Customer ID","Name","Mobile","Category","District","State","Total Spend INR","Pending Due INR","Advance INR"],c.map(e=>[e.id,e.name,e.mobile,e.category,e.district,e.state,(e.totalSpentPaise/100).toFixed(2),(e.duePaise/100).toFixed(2),(e.advancePaise/100).toFixed(2)]),`VLEBook_Customers_${C()}.csv`)}),a.querySelector("#cust-export-xls")?.addEventListener("click",()=>{le("Customers",["Customer ID","Name","Mobile","Category","District","State","Total Spend INR","Pending Due INR","Advance INR"],c.map(e=>[e.id,e.name,e.mobile,e.category,e.district,e.state,e.totalSpentPaise/100,e.duePaise/100,e.advancePaise/100]),`VLEBook_Customers_${C()}.xls`)}),p&&ce(a,p,m,n)}function ne(a,n){const{customer:v,metrics:o,frequentServices:f,bills:x,timeline:m,applications:c=[],family:i=[]}=a,g=[];(x||[]).filter(t=>t.status!=="CANCELLED").forEach(t=>(t.items||[]).filter(u=>u.kind!=="PRODUCT").forEach(u=>{const l=c.find(p=>p.billId===t.id&&(p.lineId?p.lineId===u.id:p.serviceId===u.serviceId));g.push({date:t.date,service:u.serviceName,invoiceNo:t.invoiceNo,refs:l?{...u,appRefNo:l.appRefNo||u.appRefNo,ackNo:l.ackNo||u.ackNo,trackNo:l.trackNo||u.trackNo}:u,status:l?.status||"",target:l?`app:${l.id}`:`line:${t.id}:${u.id}`})})),c.filter(t=>!t.billId).forEach(t=>g.push({date:t.appDate,service:t.serviceName,invoiceNo:"",refs:t,status:t.status,target:`app:${t.id}`})),g.sort((t,u)=>String(u.date||"").localeCompare(String(t.date||"")));const E=B(F(),o.outstandingDuePaise>0?"due_reminder":"followup",{customerName:v.name,centreName:n?.centreName||"VLE360 Centre",dueAmount:b(o.outstandingDuePaise)},n?.whatsappTemplates),L=O(v.mobile,E);return`
    <div class="card">
      <div class="card-header">
        <div>
          <button class="btn btn-xs btn-outline" id="cust-back-dir" style="margin-bottom:6px;">← Back to Customer Directory</button>
          <div class="card-title">Customer 360° Intelligence: ${s(v.name)} <span class="badge badge-info">${s(v.id)}</span></div>
          <small style="color:var(--color-text-muted);">${s(v.mobile)} | ${s(v.address||"")} ${s(v.district||"")}, ${s(v.state||"")} | Category: ${s(v.category)}</small>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-gold" id="c360-bill-btn">New Bill for Customer</button>
          <button class="btn btn-sm btn-teal" id="c360-workbench-btn">Open in Document Workbench</button>
          <button class="btn btn-sm btn-outline" id="c360-statement-pdf">Download Statement PDF</button>
          <a href="${s(L)}" target="_blank" rel="noopener" class="btn btn-sm btn-success">WhatsApp</a>
          <button class="btn btn-sm btn-outline" id="c360-reminder-btn" title="Remind this customer before a document or policy expires">+ Expiry reminder</button>
        </div>
      </div>

      ${i.length?`<div class="callout info" style="margin:6px 0 10px;"><div><strong>Family${v.relation?` (${s(v.relation)})`:""}:</strong> ${i.map(t=>`<button type="button" class="btn btn-xs btn-outline" data-open-360="${s(t.id)}"><span data-no-i18n>${s(t.name)}</span>${t.relation?` · ${s(t.relation)}`:""}${t.duePaise>0?` · <b>due ${b(t.duePaise)}</b>`:""}${t.openApps?` · ${t.openApps} open`:""}</button>`).join(" ")}</div></div>`:""}
            <!-- 360° Metrics Strip -->
      <div class="grid-kpi" style="grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));">
        <div class="kpi-card navy">
          <div class="kpi-label">Total Business</div>
          <div class="kpi-value">${b(o.totalBilledPaise)}</div>
          <div class="kpi-sub">${o.totalVisits} Total Visits</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">Total Payments</div>
          <div class="kpi-value">${b(o.totalReceiptsPaise)}</div>
          <div class="kpi-sub">Last Visit: ${s(I(o.lastVisitDate))}</div>
        </div>
        <div class="kpi-card danger">
          <div class="kpi-label">Outstanding Due</div>
          <div class="kpi-value">${b(o.outstandingDuePaise)}</div>
          <div class="kpi-sub">Across unpaid/partial bills</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Advance Balance</div>
          <div class="kpi-value">${b(o.availableAdvancePaise)}</div>
          <div class="kpi-sub">Pending Refund: ${b(o.pendingRefundPaise)}</div>
        </div>
        <div class="kpi-card gold">
          <div class="kpi-label">Connected Jobs</div>
          <div class="kpi-value">${o.totalApplications} Apps</div>
          <div class="kpi-sub">${o.totalWorkbenchJobs} Studio Jobs</div>
        </div>
      </div>

      <!-- Quick Ledger Entry & Follow-up Bar -->
      <div class="grid-2" style="margin-bottom:16px;">
        <form id="c360-ledger-form" class="card" style="margin-bottom:0; background:var(--color-surface-alt);">
          <div class="card-title" style="margin-bottom:10px; font-size:13.5px;">Record Customer Receipt / Advance / Refund</div>
          <div class="grid-2" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Entry Type</label>
              <select class="form-control" name="type" id="c360-pay-type">
                <option value="RECEIPT">Receive Pending Due</option>
                <option value="ADVANCE">Receive Customer Advance</option>
                <option value="REFUND">Pay Customer Refund</option>
                <option value="PENDING_REFUND">Log Pending Refund</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Link to Invoice (Optional)</label>
              <select class="form-control" name="billId">
                <option value="">— General Ledger —</option>
                ${x.filter(t=>t.duePaise>0).map(t=>`<option value="${s(t.id)}">${s(t.invoiceNo)} (Due: ${b(t.duePaise)})</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Amount (₹) <span class="req">*</span></label>
              <input type="number" step="0.01" min="1" class="form-control" name="amount" required value="${o.outstandingDuePaise>0?(o.outstandingDuePaise/100).toFixed(2):""}">
            </div>
            <div class="form-group">
              <label class="form-label">Payment Mode</label>
              <select class="form-control" name="mode">
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK">Bank Transfer</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-top:8px;">
            <input type="text" class="form-control" name="notes" placeholder="Receipt remark / transaction reference">
          </div>
          <button type="submit" class="btn btn-sm btn-teal" style="margin-top:8px;">Post to Unified Ledger</button>
        </form>

        <form id="c360-followup-form" class="card" style="margin-bottom:0; background:var(--color-surface-alt);">
          <div class="card-title" style="margin-bottom:10px; font-size:13.5px;">Log Follow-Up, Reminder or Complaint</div>
          <div class="grid-2" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Record Type</label>
              <select class="form-control" name="type">
                <option value="FOLLOWUP">Follow-Up Reminder</option>
                <option value="COMPLAINT">Service Complaint</option>
                <option value="NOTE">Customer Note</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Due / Follow-Up Date</label>
              <input type="date" class="form-control" name="dueDate" value="${C()}">
            </div>
          </div>
          <div class="form-group" style="margin-top:8px;">
            <label class="form-label">Summary <span class="req">*</span></label>
            <input type="text" class="form-control" name="summary" required placeholder="e.g. Call customer when Income Certificate is approved">
          </div>
          <button type="submit" class="btn btn-sm btn-primary" style="margin-top:8px;">Add to Customer Timeline</button>
        </form>
      </div>

      <!-- Most Frequently Used Services -->
      <div style="margin-bottom:14px;">
        <strong style="font-size:12px; color:var(--color-text-muted); text-transform:uppercase;">Most Frequently Used Services:</strong>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
          ${f.length===0?'<span class="badge badge-neutral">No billed services yet</span>':f.map(t=>`<span class="badge badge-info">${s(t.name)} ×${t.count} (${b(t.totalPaise)})</span>`).join("")}
        </div>
      </div>

      <!-- Applications & reference numbers -->
      <div class="card-title" style="margin-bottom:8px;">Applications & reference numbers</div>
      <div class="table-wrap" style="margin-bottom:16px;">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Service</th><th>Invoice</th><th>Application No.</th><th>Acknowledgement No.</th><th>Tracking No.</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${g.length?g.map(t=>`<tr><td>${s(I(t.date))}</td><td data-no-i18n>${s(t.service)}</td><td>${s(t.invoiceNo||"—")}</td>
                  <td style="font-family:var(--font-mono);">${s(/^REF-\d+$/.test(t.refs.appRefNo||"")?"":t.refs.appRefNo||"")||"—"}</td>
                  <td style="font-family:var(--font-mono);">${s(t.refs.ackNo||"")||"—"}</td>
                  <td style="font-family:var(--font-mono);">${s(t.refs.trackNo||"")||"—"}</td>
                  <td>${t.status?`<span class="badge badge-info">${s(t.status)}</span>`:"—"}</td>
                  <td><button class="btn btn-xs btn-outline" data-c360-refs="${s(t.target)}">Edit numbers</button></td></tr>`).join(""):'<tr><td colspan="8" style="text-align:center; padding:12px;">No services or applications yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Chronological 360° Activity & Ledger Timeline -->
      <div class="card-title" style="margin-bottom:8px;">Chronological 360° Activity & Unified Financial Statement</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Activity / Particulars</th>
              <th class="num">Billed / Debit</th>
              <th class="num">Paid / Credit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${m.length===0?'<tr><td colspan="6" style="text-align:center; padding:16px;">No activities recorded for this customer yet.</td></tr>':m.map(t=>`
                  <tr>
                    <td>${s(I(t.date))}</td>
                    <td><span class="badge badge-neutral">${s(t.kind)}</span></td>
                    <td>
                      <strong>${s(t.title)}</strong><br>
                      <small style="color:var(--color-text-muted);">${s(t.subtitle)}</small>
                    </td>
                    <td class="num">${t.debitPaise>0?b(t.debitPaise):"—"}</td>
                    <td class="num" style="color:var(--color-success);">${t.creditPaise>0?b(t.creditPaise):"—"}</td>
                    <td><span class="badge ${t.status==="PAID"||t.status==="Completed"||t.status==="COMPLETED"?"badge-success":"badge-warning"}">${s(t.status)}</span></td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function ce(a,n,v,o){a.querySelector("#c360-reminder-btn")?.addEventListener("click",async()=>{const{addReminderFor:c}=await import("./reminders.js");c({customerId:n.customer.id,customerName:n.customer.name,mobile:n.customer.mobile})}),a.querySelectorAll("[data-c360-refs]").forEach(c=>c.addEventListener("click",async()=>{const[i,g,E]=c.getAttribute("data-c360-refs").split(":"),{editReferenceNumbers:L}=await import("./pending-work.js");let t,u={},l="";if(i==="app"){const p=(n.applications||[]).find(S=>S.id===g);t={appId:g},u=p||{},l=`${p?.serviceName||""}${p?.invoiceNo?` — Invoice ${p.invoiceNo}`:""}`}else{const p=(n.bills||[]).find(w=>w.id===g),S=(p?.items||[]).find(w=>w.id===E)||{};t={billId:g,lineId:E},u=S,l=`${S.serviceName||""} — Invoice ${p?.invoiceNo||""}`}await L(t,u,l)&&h(a,o,n.customer.id)}));const{customer:f,metrics:x,timeline:m}=n;a.querySelector("#cust-back-dir")?.addEventListener("click",()=>{N=null,h(a,o)}),a.querySelector("#c360-bill-btn")?.addEventListener("click",()=>{sessionStorage.setItem("vlebook_preselect_customer",f.id),o("billing")}),a.querySelector("#c360-workbench-btn")?.addEventListener("click",()=>{sessionStorage.setItem("vlebook_preselect_customer",f.id),o("studio")}),a.querySelector("#c360-ledger-form")?.addEventListener("submit",async c=>{c.preventDefault();const i=new FormData(c.target);await X({customerId:f.id,customerName:f.name,billId:i.get("billId")||null,type:i.get("type"),amountPaise:se(i.get("amount")),mode:i.get("mode"),notes:i.get("notes")}),await h(a,o)}),a.querySelector("#c360-followup-form")?.addEventListener("submit",async c=>{c.preventDefault();const i=new FormData(c.target);await J("followups",{id:te("FLW"),date:C(),dueDate:i.get("dueDate")||C(),customerId:f.id,customerName:f.name,customerMobile:f.mobile,type:i.get("type")||"FOLLOWUP",status:"OPEN",summary:i.get("summary")}),await h(a,o)}),a.querySelector("#c360-statement-pdf")?.addEventListener("click",()=>{const c=ie(`${v?.centreName||"VLE360 Centre"} - Customer 360 Statement`,`Customer: ${f.name} (${f.id}) | Mobile: ${f.mobile} | Date: ${C()}`,["Date","Type","Particulars","Debit (Rs)","Credit (Rs)","Status"],m.map(i=>[i.date,i.kind,i.title.slice(0,28),(i.debitPaise/100).toFixed(2),(i.creditPaise/100).toFixed(2),i.status]),[`Total Billed: Rs.${(x.totalBilledPaise/100).toFixed(2)} | Total Paid: Rs.${(x.totalReceiptsPaise/100).toFixed(2)}`,`Outstanding Due: Rs.${(x.outstandingDuePaise/100).toFixed(2)} | Available Advance: Rs.${(x.availableAdvancePaise/100).toFixed(2)}`]);oe(c,`Customer_Statement_${f.id}_${C()}.pdf`,"application/pdf")})}export{h as renderCustomersModule,ye as showDuesNext};
