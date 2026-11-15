import{getAllRecords as S,getRecord as M,putRecord as B}from"../core/db.js";import{saveCustomerRecord as _,getCustomer360Profile as O,recordCustomerLedgerPayment as T}from"../core/accounting.js";import{restoreScopeDraft as U,clearScopeDraft as V}from"../core/autosave.js";import{uid as W,todayISO as x,formatINR as p,formatDate as k,toPaise as j,esc as t,buildWhatsAppURL as z,exportToCSV as H,exportToExcel as G,generateSimplePDFBlob as J,downloadFile as K}from"../core/utils.js";import{formatWhatsAppTemplate as Q,getLang as X}from"../core/i18n.js";let E="",$=null,C=null;async function g(s,c,u=null){u&&($=u);const[l,r,f,b]=await Promise.all([S("customers"),S("bills"),S("payments"),M("settings","CENTRE_CONFIG")]),m=l.map(e=>{const n=r.filter(o=>o.customerId===e.id&&o.status!=="CANCELLED"),y=f.filter(o=>o.customerId===e.id),P=n.reduce((o,v)=>o+(v.grandTotalPaise||0),0),A=n.reduce((o,v)=>o+(v.duePaise||0),0),N=y.filter(o=>o.type==="ADVANCE").reduce((o,v)=>o+(v.amountPaise||0),0),R=y.filter(o=>o.type==="ADVANCE_ADJUST").reduce((o,v)=>o+(v.amountPaise||0),0),I=Math.max(0,N-R),F=y.filter(o=>o.type==="PENDING_REFUND").reduce((o,v)=>o+(v.amountPaise||0),0),q=n.length?n[n.length-1].date:e.registrationDate;return{...e,visits:n.length,totalSpentPaise:P,duePaise:A,advancePaise:I,pendingRefundPaise:F,lastVisit:q}}),i=E.trim().toLowerCase(),a=m.filter(e=>!i||e.name.toLowerCase().includes(i)||String(e.mobile||"").includes(i)||String(e.id||"").toLowerCase().includes(i)),d=C?l.find(e=>e.id===C):null,D=$?await O($):null;s.innerHTML=`
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
        ${D?Y(D,b):`
          <div class="card">
            <div class="card-header">
              <div class="card-title">Registered Citizens & Customers (${a.length})</div>
              <input type="search" class="form-control" id="cust-search-input" placeholder="Search by Name, 10-digit Mobile or ID..." value="${t(E)}" style="max-width:290px;">
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
                  ${a.length===0?'<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--color-text-muted);">No matching customers found. Register a customer using the form on the right.</td></tr>':a.map(e=>`
                        <tr>
                          <td>
                            <strong>${t(e.name)}</strong><br>
                            <small style="color:var(--color-text-muted); font-family:var(--font-mono);">${t(e.id)}</small>
                          </td>
                          <td><strong>${t(e.mobile)}</strong></td>
                          <td>${t(e.category)}<br><small style="color:var(--color-text-muted);">${t(e.district||e.state)}</small></td>
                          <td class="num">${p(e.totalSpentPaise)}</td>
                          <td class="num">
                            ${e.duePaise>0?`<span class="badge badge-danger">${p(e.duePaise)}</span>`:'<span class="badge badge-success">₹0.00</span>'}
                          </td>
                          <td class="num">
                            ${e.advancePaise>0?`<span class="badge badge-info">${p(e.advancePaise)}</span>`:"—"}
                          </td>
                          <td>${t(k(e.lastVisit))}</td>
                          <td>
                            <div style="display:flex; gap:4px; flex-wrap:wrap;">
                              <button class="btn btn-xs btn-teal" data-open-360="${t(e.id)}">360° Ledger</button>
                              <button class="btn btn-xs btn-outline" data-edit-cust="${t(e.id)}">Edit</button>
                              <button class="btn btn-xs btn-gold" data-bill-cust="${t(e.id)}">Bill</button>
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
            <div class="card-title">${d?`Edit Customer (${t(d.id)})`:"Register New Customer"}</div>
            ${d?'<button class="btn btn-xs btn-outline" id="cust-cancel-edit">Cancel</button>':""}
          </div>
          <div id="cust-form-feedback"></div>
          <form id="customer-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <input type="hidden" name="id" value="${t(d?.id||"")}">
            <div class="form-group">
              <label class="form-label">Full Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="name" id="cust-name" required placeholder="e.g. Rajesh Kumar Nair" value="${t(d?.name||"")}">
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Mobile Number <span class="req">*</span></label>
                <input type="tel" class="form-control" name="mobile" id="cust-mobile" maxlength="10" required placeholder="10-digit mobile" value="${t(d?.mobile||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">Alternate Mobile</label>
                <input type="tel" class="form-control" name="altMobile" maxlength="10" placeholder="Optional" value="${t(d?.altMobile||"")}">
              </div>
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Customer Category</label>
                <select class="form-control" name="category">
                  ${["General Citizen","Regular Citizen","Farmer / Agri","Student","Business / MSME","Senior Citizen","BPL / Priority"].map(e=>`<option value="${e}" ${d?.category===e?"selected":""}>${e}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-control" name="email" placeholder="citizen@example.in" value="${t(d?.email||"")}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street / Ward / Village Address</label>
              <input type="text" class="form-control" name="address" placeholder="House No., Ward, Post Office" value="${t(d?.address||"")}">
            </div>
            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">District</label>
                <input type="text" class="form-control" name="district" value="${t(d?.district||b?.district||"")}">
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-control" name="state" value="${t(d?.state||b?.state||"Kerala")}">
              </div>
              <div class="form-group">
                <label class="form-label">PIN Code</label>
                <input type="text" class="form-control" name="pinCode" maxlength="6" value="${t(d?.pinCode||b?.pinCode||"")}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Operator Notes & Document Retention Note</label>
              <textarea class="form-control" name="notes" rows="2" placeholder="Important citizen preferences (never store Aadhaar OTP/PIN here)">${t(d?.notes||"")}</textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">
              ${d?"Update Customer Record":"Save Customer & Open 360° Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;const L=s.querySelector('[data-autosave-scope="customer_form"]');!d&&L&&await U("customer_form",L);const w=s.querySelector("#cust-mobile"),h=s.querySelector("#cust-form-feedback");w?.addEventListener("input",()=>{const e=w.value.replace(/\D/g,"").slice(-10);if(e.length===10){const n=l.find(y=>y.mobile===e&&y.id!==C);n&&h?(h.innerHTML=`
          <div class="callout warning">
            <div>
              <strong>Existing Customer Found:</strong> ${t(n.name)} (${t(n.id)}) already uses ${t(e)}.
            </div>
            <button type="button" class="btn btn-xs btn-teal" id="jump-existing-cust">Open 360°</button>
          </div>`,h.querySelector("#jump-existing-cust")?.addEventListener("click",()=>{$=n.id,g(s,c)})):h&&(h.innerHTML="")}}),s.querySelector("#cust-search-input")?.addEventListener("input",e=>{E=e.target.value,g(s,c)}),s.querySelector("#customer-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const n=new FormData(e.target),y=Object.fromEntries(n.entries());try{const P=await _(y,!!C);await V("customer_form"),C=null,$=P.id,await g(s,c)}catch(P){h&&(h.innerHTML=`<div class="callout danger"><span>${t(P.message)}</span></div>`)}}),s.querySelector("#cust-cancel-edit")?.addEventListener("click",()=>{C=null,g(s,c)}),s.querySelectorAll("[data-open-360]").forEach(e=>{e.addEventListener("click",()=>{$=e.getAttribute("data-open-360"),g(s,c)})}),s.querySelectorAll("[data-edit-cust]").forEach(e=>{e.addEventListener("click",()=>{C=e.getAttribute("data-edit-cust"),g(s,c)})}),s.querySelectorAll("[data-bill-cust]").forEach(e=>{e.addEventListener("click",()=>{const n=e.getAttribute("data-bill-cust");sessionStorage.setItem("vlebook_preselect_customer",n),c("billing")})}),s.querySelector("#cust-new-bill-shortcut")?.addEventListener("click",()=>c("billing")),s.querySelector("#cust-export-csv")?.addEventListener("click",()=>{H(["Customer ID","Name","Mobile","Category","District","State","Total Spend INR","Pending Due INR","Advance INR"],m.map(e=>[e.id,e.name,e.mobile,e.category,e.district,e.state,(e.totalSpentPaise/100).toFixed(2),(e.duePaise/100).toFixed(2),(e.advancePaise/100).toFixed(2)]),`VLEBook_Customers_${x()}.csv`)}),s.querySelector("#cust-export-xls")?.addEventListener("click",()=>{G("Customers",["Customer ID","Name","Mobile","Category","District","State","Total Spend INR","Pending Due INR","Advance INR"],m.map(e=>[e.id,e.name,e.mobile,e.category,e.district,e.state,e.totalSpentPaise/100,e.duePaise/100,e.advancePaise/100]),`VLEBook_Customers_${x()}.xls`)}),D&&Z(s,D,b,c)}function Y(s,c){const{customer:u,metrics:l,frequentServices:r,bills:f,timeline:b}=s,m=Q(X(),l.outstandingDuePaise>0?"due_reminder":"followup",{customerName:u.name,centreName:c?.centreName||"VLEBook Centre",dueAmount:p(l.outstandingDuePaise)},c?.whatsappTemplates),i=z(u.mobile,m);return`
    <div class="card">
      <div class="card-header">
        <div>
          <button class="btn btn-xs btn-outline" id="cust-back-dir" style="margin-bottom:6px;">← Back to Customer Directory</button>
          <div class="card-title">Customer 360° Intelligence: ${t(u.name)} <span class="badge badge-info">${t(u.id)}</span></div>
          <small style="color:var(--color-text-muted);">${t(u.mobile)} | ${t(u.address||"")} ${t(u.district||"")}, ${t(u.state||"")} | Category: ${t(u.category)}</small>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-gold" id="c360-bill-btn">New Bill for Customer</button>
          <button class="btn btn-sm btn-teal" id="c360-workbench-btn">Open in Document Workbench</button>
          <button class="btn btn-sm btn-outline" id="c360-statement-pdf">Download Statement PDF</button>
          <a href="${t(i)}" target="_blank" rel="noopener" class="btn btn-sm btn-success">WhatsApp</a>
        </div>
      </div>

      <!-- 360° Metrics Strip -->
      <div class="grid-kpi" style="grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));">
        <div class="kpi-card navy">
          <div class="kpi-label">Total Business</div>
          <div class="kpi-value">${p(l.totalBilledPaise)}</div>
          <div class="kpi-sub">${l.totalVisits} Total Visits</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">Total Payments</div>
          <div class="kpi-value">${p(l.totalReceiptsPaise)}</div>
          <div class="kpi-sub">Last Visit: ${t(k(l.lastVisitDate))}</div>
        </div>
        <div class="kpi-card danger">
          <div class="kpi-label">Outstanding Due</div>
          <div class="kpi-value">${p(l.outstandingDuePaise)}</div>
          <div class="kpi-sub">Across unpaid/partial bills</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Advance Balance</div>
          <div class="kpi-value">${p(l.availableAdvancePaise)}</div>
          <div class="kpi-sub">Pending Refund: ${p(l.pendingRefundPaise)}</div>
        </div>
        <div class="kpi-card gold">
          <div class="kpi-label">Connected Jobs</div>
          <div class="kpi-value">${l.totalApplications} Apps</div>
          <div class="kpi-sub">${l.totalWorkbenchJobs} Studio Jobs</div>
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
                ${f.filter(a=>a.duePaise>0).map(a=>`<option value="${t(a.id)}">${t(a.invoiceNo)} (Due: ${p(a.duePaise)})</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Amount (₹) <span class="req">*</span></label>
              <input type="number" step="0.01" min="1" class="form-control" name="amount" required value="${l.outstandingDuePaise>0?(l.outstandingDuePaise/100).toFixed(2):""}">
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
              <input type="date" class="form-control" name="dueDate" value="${x()}">
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
          ${r.length===0?'<span class="badge badge-neutral">No billed services yet</span>':r.map(a=>`<span class="badge badge-info">${t(a.name)} ×${a.count} (${p(a.totalPaise)})</span>`).join("")}
        </div>
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
            ${b.length===0?'<tr><td colspan="6" style="text-align:center; padding:16px;">No activities recorded for this customer yet.</td></tr>':b.map(a=>`
                  <tr>
                    <td>${t(k(a.date))}</td>
                    <td><span class="badge badge-neutral">${t(a.kind)}</span></td>
                    <td>
                      <strong>${t(a.title)}</strong><br>
                      <small style="color:var(--color-text-muted);">${t(a.subtitle)}</small>
                    </td>
                    <td class="num">${a.debitPaise>0?p(a.debitPaise):"—"}</td>
                    <td class="num" style="color:var(--color-success);">${a.creditPaise>0?p(a.creditPaise):"—"}</td>
                    <td><span class="badge ${a.status==="PAID"||a.status==="Completed"||a.status==="COMPLETED"?"badge-success":"badge-warning"}">${t(a.status)}</span></td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Z(s,c,u,l){const{customer:r,metrics:f,timeline:b}=c;s.querySelector("#cust-back-dir")?.addEventListener("click",()=>{$=null,g(s,l)}),s.querySelector("#c360-bill-btn")?.addEventListener("click",()=>{sessionStorage.setItem("vlebook_preselect_customer",r.id),l("billing")}),s.querySelector("#c360-workbench-btn")?.addEventListener("click",()=>{sessionStorage.setItem("vlebook_preselect_customer",r.id),l("studio")}),s.querySelector("#c360-ledger-form")?.addEventListener("submit",async m=>{m.preventDefault();const i=new FormData(m.target);await T({customerId:r.id,customerName:r.name,billId:i.get("billId")||null,type:i.get("type"),amountPaise:j(i.get("amount")),mode:i.get("mode"),notes:i.get("notes")}),await g(s,l)}),s.querySelector("#c360-followup-form")?.addEventListener("submit",async m=>{m.preventDefault();const i=new FormData(m.target);await B("followups",{id:W("FLW"),date:x(),dueDate:i.get("dueDate")||x(),customerId:r.id,customerName:r.name,customerMobile:r.mobile,type:i.get("type")||"FOLLOWUP",status:"OPEN",summary:i.get("summary")}),await g(s,l)}),s.querySelector("#c360-statement-pdf")?.addEventListener("click",()=>{const m=J(`${u?.centreName||"VLEBook Centre"} - Customer 360 Statement`,`Customer: ${r.name} (${r.id}) | Mobile: ${r.mobile} | Date: ${x()}`,["Date","Type","Particulars","Debit (Rs)","Credit (Rs)","Status"],b.map(i=>[i.date,i.kind,i.title.slice(0,28),(i.debitPaise/100).toFixed(2),(i.creditPaise/100).toFixed(2),i.status]),[`Total Billed: Rs.${(f.totalBilledPaise/100).toFixed(2)} | Total Paid: Rs.${(f.totalReceiptsPaise/100).toFixed(2)}`,`Outstanding Due: Rs.${(f.outstandingDuePaise/100).toFixed(2)} | Available Advance: Rs.${(f.availableAdvancePaise/100).toFixed(2)}`]);K(m,`Customer_Statement_${r.id}_${x()}.pdf`,"application/pdf")})}export{g as renderCustomersModule};
