import{localScriptFields as B,wireLocalScript as O,micButton as L}from"./localscript.js";import{getAllRecords as D,getRecord as T,putRecord as _}from"../core/db.js";import{saveCustomerRecord as U,getCustomer360Profile as V,recordCustomerLedgerPayment as j}from"../core/accounting.js";import{restoreScopeDraft as W,clearScopeDraft as z}from"../core/autosave.js";import{uid as G,todayISO as P,formatINR as f,formatDate as E,toPaise as H,esc as s,buildWhatsAppURL as K,exportToCSV as J,exportToExcel as Q,generateSimplePDFBlob as Z,downloadFile as X}from"../core/utils.js";import{formatWhatsAppTemplate as Y,getLang as ee}from"../core/i18n.js";let w="",N=null,k=null;async function $(a,c,v=null){v&&(N=v);const[i,m,x,y]=await Promise.all([D("customers"),D("bills"),D("payments"),T("settings","CENTRE_CONFIG")]),u=i.map(e=>{const d=m.filter(n=>n.customerId===e.id&&n.status!=="CANCELLED"),g=x.filter(n=>n.customerId===e.id),S=d.reduce((n,C)=>n+(C.grandTotalPaise||0),0),A=d.reduce((n,C)=>n+(C.duePaise||0),0),R=g.filter(n=>n.type==="ADVANCE").reduce((n,C)=>n+(C.amountPaise||0),0),I=g.filter(n=>n.type==="ADVANCE_ADJUST").reduce((n,C)=>n+(C.amountPaise||0),0),F=Math.max(0,R-I),q=g.filter(n=>n.type==="PENDING_REFUND").reduce((n,C)=>n+(C.amountPaise||0),0),M=d.length?d[d.length-1].date:e.registrationDate;return{...e,visits:d.length,totalSpentPaise:S,duePaise:A,advancePaise:F,pendingRefundPaise:q,lastVisit:M}}),l=w.trim().toLowerCase(),h=u.filter(e=>!l||e.name.toLowerCase().includes(l)||String(e.mobile||"").includes(l)||String(e.id||"").toLowerCase().includes(l)),o=k?i.find(e=>e.id===k):null,t=N?await V(N):null;a.innerHTML=`
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
        ${t?te(t,y):`
          <div class="card">
            <div class="card-header">
              <div class="card-title">Registered Citizens & Customers (${h.length})</div>
              <input type="search" class="form-control" id="cust-search-input" placeholder="Search by Name, 10-digit Mobile or ID..." value="${s(w)}" style="max-width:290px;">
            </div>
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
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${h.length===0?'<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--color-text-muted);">No matching customers found. Register a customer using the form on the right.</td></tr>':h.map(e=>`
                        <tr>
                          <td>
                            <strong>${s(e.name)}</strong><br>
                            <small style="color:var(--color-text-muted); font-family:var(--font-mono);">${s(e.id)}</small>
                          </td>
                          <td><strong>${s(e.mobile)}</strong></td>
                          <td>${s(e.category)}<br><small style="color:var(--color-text-muted);">${s(e.district||e.state)}</small></td>
                          <td class="num">${f(e.totalSpentPaise)}</td>
                          <td class="num">
                            ${e.duePaise>0?`<span class="badge badge-danger">${f(e.duePaise)}</span>`:'<span class="badge badge-success">₹0.00</span>'}
                          </td>
                          <td class="num">
                            ${e.advancePaise>0?`<span class="badge badge-info">${f(e.advancePaise)}</span>`:"—"}
                          </td>
                          <td>${s(E(e.lastVisit))}</td>
                          <td>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                              <button class="btn btn-xs btn-teal" data-open-360="${s(e.id)}">360° Ledger</button>
                              <button class="btn btn-xs btn-outline" data-edit-cust="${s(e.id)}">Edit</button>
                              <button class="btn btn-xs btn-gold" data-bill-cust="${s(e.id)}">Bill</button>
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
            <div class="card-title">${o?`Edit Customer (${s(o.id)})`:"Register New Customer"}</div>
            ${o?'<button class="btn btn-xs btn-outline" id="cust-cancel-edit">Cancel</button>':""}
          </div>
          <div id="cust-form-feedback"></div>
          <form id="customer-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <input type="hidden" name="id" value="${s(o?.id||"")}">
            <div class="form-group">
              <label class="form-label">Full Name <span class="req">*</span></label>
              <div class="ls-row"><input type="text" class="form-control" name="name" id="cust-name" required placeholder="e.g. Rajesh Kumar Nair" value="${s(o?.name||"")}">${L("cust-name")}</div>
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Mobile Number <span class="req">*</span></label>
                <input type="tel" class="form-control" name="mobile" id="cust-mobile" maxlength="10" required placeholder="10-digit mobile" value="${s(o?.mobile||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">Alternate Mobile</label>
                <input type="tel" class="form-control" name="altMobile" maxlength="10" placeholder="Optional" value="${s(o?.altMobile||"")}">
              </div>
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Customer Category</label>
                <select class="form-control" name="category">
                  ${["General Citizen","Regular Citizen","Farmer / Agri","Student","Business / MSME","Senior Citizen","BPL / Priority"].map(e=>`<option value="${e}" ${o?.category===e?"selected":""}>${e}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-control" name="email" placeholder="citizen@example.in" value="${s(o?.email||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">GSTIN (optional, for business customers)</label>
                <input type="text" class="form-control" name="gstin" maxlength="15" autocomplete="off" spellcheck="false" style="text-transform:uppercase;" placeholder="e.g. 32ABCDE1234F1Z5" value="${s(o?.gstin||"")}">
                <div class="form-hint">Printed on tax invoices so the customer can claim input tax credit.</div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street / Ward / Village Address</label>
              <div class="ls-row"><input type="text" class="form-control" name="address" id="cust-address" placeholder="House No., Ward, Post Office" value="${s(o?.address||"")}">${L("cust-address")}</div>
            </div>
            ${B(o||{},(o?.state||y?.state||"Kerala")==="Kerala"?"ml":"hi")}
            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">District</label>
                <input type="text" class="form-control" name="district" value="${s(o?.district||y?.district||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-control" name="state" value="${s(o?.state||y?.state||"Kerala")}">
              </div>
              <div class="form-group">
                <label class="form-label">PIN Code</label>
                <input type="text" class="form-control" name="pinCode" maxlength="6" value="${s(o?.pinCode||y?.pinCode||"")}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Operator Notes & Document Retention Note</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="Important citizen preferences (never store Aadhaar OTP/PIN here)">${s(o?.notes||"")}</textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">
              ${o?"Update Customer Record":"Save Customer & Open 360° Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;const r=a.querySelector('[data-autosave-scope="customer_form"]');!o&&r&&await W("customer_form",r),O(a,{name:()=>a.querySelector("#cust-name")?.value,address:()=>a.querySelector("#cust-address")?.value});const b=a.querySelector("#cust-mobile"),p=a.querySelector("#cust-form-feedback");b?.addEventListener("input",()=>{const e=b.value.replace(/\D/g,"").slice(-10);if(e.length===10){const d=i.find(g=>g.mobile===e&&g.id!==k);d&&p?(p.innerHTML=`
          <div class="callout warning">
            <div>
              <strong>Existing Customer Found:</strong> ${s(d.name)} (${s(d.id)}) already uses ${s(e)}.
            </div>
            <button type="button" class="btn btn-xs btn-teal" id="jump-existing-cust">Open 360°</button>
          </div>`,p.querySelector("#jump-existing-cust")?.addEventListener("click",()=>{N=d.id,$(a,c)})):p&&(p.innerHTML="")}}),a.querySelector("#cust-search-input")?.addEventListener("input",e=>{w=e.target.value,$(a,c)}),a.querySelector("#customer-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(e.target),g=Object.fromEntries(d.entries());try{const S=await U(g,!!k);await z("customer_form"),k=null,N=S.id,await $(a,c)}catch(S){p&&(p.innerHTML=`<div class="callout danger"><span>${s(S.message)}</span></div>`)}}),a.querySelector("#cust-cancel-edit")?.addEventListener("click",()=>{k=null,$(a,c)}),a.querySelectorAll("[data-open-360]").forEach(e=>{e.addEventListener("click",()=>{N=e.getAttribute("data-open-360"),$(a,c)})}),a.querySelectorAll("[data-edit-cust]").forEach(e=>{e.addEventListener("click",()=>{k=e.getAttribute("data-edit-cust"),$(a,c)})}),a.querySelectorAll("[data-bill-cust]").forEach(e=>{e.addEventListener("click",()=>{const d=e.getAttribute("data-bill-cust");sessionStorage.setItem("vlebook_preselect_customer",d),c("billing")})}),a.querySelector("#cust-new-bill-shortcut")?.addEventListener("click",()=>c("billing")),a.querySelector("#cust-export-csv")?.addEventListener("click",()=>{J(["Customer ID","Name","Mobile","Category","District","State","Total Spend INR","Pending Due INR","Advance INR"],u.map(e=>[e.id,e.name,e.mobile,e.category,e.district,e.state,(e.totalSpentPaise/100).toFixed(2),(e.duePaise/100).toFixed(2),(e.advancePaise/100).toFixed(2)]),`VLEBook_Customers_${P()}.csv`)}),a.querySelector("#cust-export-xls")?.addEventListener("click",()=>{Q("Customers",["Customer ID","Name","Mobile","Category","District","State","Total Spend INR","Pending Due INR","Advance INR"],u.map(e=>[e.id,e.name,e.mobile,e.category,e.district,e.state,e.totalSpentPaise/100,e.duePaise/100,e.advancePaise/100]),`VLEBook_Customers_${P()}.xls`)}),t&&se(a,t,y,c)}function te(a,c){const{customer:v,metrics:i,frequentServices:m,bills:x,timeline:y,applications:u=[]}=a,l=[];(x||[]).filter(t=>t.status!=="CANCELLED").forEach(t=>(t.items||[]).filter(r=>r.kind!=="PRODUCT").forEach(r=>{const b=u.find(p=>p.billId===t.id&&(p.lineId?p.lineId===r.id:p.serviceId===r.serviceId));l.push({date:t.date,service:r.serviceName,invoiceNo:t.invoiceNo,refs:b?{...r,appRefNo:b.appRefNo||r.appRefNo,ackNo:b.ackNo||r.ackNo,trackNo:b.trackNo||r.trackNo}:r,status:b?.status||"",target:b?`app:${b.id}`:`line:${t.id}:${r.id}`})})),u.filter(t=>!t.billId).forEach(t=>l.push({date:t.appDate,service:t.serviceName,invoiceNo:"",refs:t,status:t.status,target:`app:${t.id}`})),l.sort((t,r)=>String(r.date||"").localeCompare(String(t.date||"")));const h=Y(ee(),i.outstandingDuePaise>0?"due_reminder":"followup",{customerName:v.name,centreName:c?.centreName||"VLEBook Centre",dueAmount:f(i.outstandingDuePaise)},c?.whatsappTemplates),o=K(v.mobile,h);return`
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
          <a href="${s(o)}" target="_blank" rel="noopener" class="btn btn-sm btn-success">WhatsApp</a>
        </div>
      </div>

      <!-- 360° Metrics Strip -->
      <div class="grid-kpi" style="grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));">
        <div class="kpi-card navy">
          <div class="kpi-label">Total Business</div>
          <div class="kpi-value">${f(i.totalBilledPaise)}</div>
          <div class="kpi-sub">${i.totalVisits} Total Visits</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">Total Payments</div>
          <div class="kpi-value">${f(i.totalReceiptsPaise)}</div>
          <div class="kpi-sub">Last Visit: ${s(E(i.lastVisitDate))}</div>
        </div>
        <div class="kpi-card danger">
          <div class="kpi-label">Outstanding Due</div>
          <div class="kpi-value">${f(i.outstandingDuePaise)}</div>
          <div class="kpi-sub">Across unpaid/partial bills</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Advance Balance</div>
          <div class="kpi-value">${f(i.availableAdvancePaise)}</div>
          <div class="kpi-sub">Pending Refund: ${f(i.pendingRefundPaise)}</div>
        </div>
        <div class="kpi-card gold">
          <div class="kpi-label">Connected Jobs</div>
          <div class="kpi-value">${i.totalApplications} Apps</div>
          <div class="kpi-sub">${i.totalWorkbenchJobs} Studio Jobs</div>
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
                ${x.filter(t=>t.duePaise>0).map(t=>`<option value="${s(t.id)}">${s(t.invoiceNo)} (Due: ${f(t.duePaise)})</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Amount (₹) <span class="req">*</span></label>
              <input type="number" step="0.01" min="1" class="form-control" name="amount" required value="${i.outstandingDuePaise>0?(i.outstandingDuePaise/100).toFixed(2):""}">
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
              <input type="date" class="form-control" name="dueDate" value="${P()}">
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
          ${m.length===0?'<span class="badge badge-neutral">No billed services yet</span>':m.map(t=>`<span class="badge badge-info">${s(t.name)} ×${t.count} (${f(t.totalPaise)})</span>`).join("")}
        </div>
      </div>

      <!-- Applications & reference numbers -->
      <div class="card-title" style="margin-bottom:8px;">Applications & reference numbers</div>
      <div class="table-wrap" style="margin-bottom:16px;">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Service</th><th>Invoice</th><th>Application No.</th><th>Acknowledgement No.</th><th>Tracking No.</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${l.length?l.map(t=>`<tr><td>${s(E(t.date))}</td><td data-no-i18n>${s(t.service)}</td><td>${s(t.invoiceNo||"—")}</td>
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
            ${y.length===0?'<tr><td colspan="6" style="text-align:center; padding:16px;">No activities recorded for this customer yet.</td></tr>':y.map(t=>`
                  <tr>
                    <td>${s(E(t.date))}</td>
                    <td><span class="badge badge-neutral">${s(t.kind)}</span></td>
                    <td>
                      <strong>${s(t.title)}</strong><br>
                      <small style="color:var(--color-text-muted);">${s(t.subtitle)}</small>
                    </td>
                    <td class="num">${t.debitPaise>0?f(t.debitPaise):"—"}</td>
                    <td class="num" style="color:var(--color-success);">${t.creditPaise>0?f(t.creditPaise):"—"}</td>
                    <td><span class="badge ${t.status==="PAID"||t.status==="Completed"||t.status==="COMPLETED"?"badge-success":"badge-warning"}">${s(t.status)}</span></td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function se(a,c,v,i){a.querySelectorAll("[data-c360-refs]").forEach(u=>u.addEventListener("click",async()=>{const[l,h,o]=u.getAttribute("data-c360-refs").split(":"),{editReferenceNumbers:t}=await import("./pending-work.js");let r,b={},p="";if(l==="app"){const e=(c.applications||[]).find(d=>d.id===h);r={appId:h},b=e||{},p=`${e?.serviceName||""}${e?.invoiceNo?` — Invoice ${e.invoiceNo}`:""}`}else{const e=(c.bills||[]).find(g=>g.id===h),d=(e?.items||[]).find(g=>g.id===o)||{};r={billId:h,lineId:o},b=d,p=`${d.serviceName||""} — Invoice ${e?.invoiceNo||""}`}await t(r,b,p)&&$(a,i,c.customer.id)}));const{customer:m,metrics:x,timeline:y}=c;a.querySelector("#cust-back-dir")?.addEventListener("click",()=>{N=null,$(a,i)}),a.querySelector("#c360-bill-btn")?.addEventListener("click",()=>{sessionStorage.setItem("vlebook_preselect_customer",m.id),i("billing")}),a.querySelector("#c360-workbench-btn")?.addEventListener("click",()=>{sessionStorage.setItem("vlebook_preselect_customer",m.id),i("studio")}),a.querySelector("#c360-ledger-form")?.addEventListener("submit",async u=>{u.preventDefault();const l=new FormData(u.target);await j({customerId:m.id,customerName:m.name,billId:l.get("billId")||null,type:l.get("type"),amountPaise:H(l.get("amount")),mode:l.get("mode"),notes:l.get("notes")}),await $(a,i)}),a.querySelector("#c360-followup-form")?.addEventListener("submit",async u=>{u.preventDefault();const l=new FormData(u.target);await _("followups",{id:G("FLW"),date:P(),dueDate:l.get("dueDate")||P(),customerId:m.id,customerName:m.name,customerMobile:m.mobile,type:l.get("type")||"FOLLOWUP",status:"OPEN",summary:l.get("summary")}),await $(a,i)}),a.querySelector("#c360-statement-pdf")?.addEventListener("click",()=>{const u=Z(`${v?.centreName||"VLEBook Centre"} - Customer 360 Statement`,`Customer: ${m.name} (${m.id}) | Mobile: ${m.mobile} | Date: ${P()}`,["Date","Type","Particulars","Debit (Rs)","Credit (Rs)","Status"],y.map(l=>[l.date,l.kind,l.title.slice(0,28),(l.debitPaise/100).toFixed(2),(l.creditPaise/100).toFixed(2),l.status]),[`Total Billed: Rs.${(x.totalBilledPaise/100).toFixed(2)} | Total Paid: Rs.${(x.totalReceiptsPaise/100).toFixed(2)}`,`Outstanding Due: Rs.${(x.outstandingDuePaise/100).toFixed(2)} | Available Advance: Rs.${(x.availableAdvancePaise/100).toFixed(2)}`]);X(u,`Customer_Statement_${m.id}_${P()}.pdf`,"application/pdf")})}export{$ as renderCustomersModule};
