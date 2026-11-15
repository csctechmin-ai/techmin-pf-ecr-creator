import{getAllRecords as I,getRecord as H,putRecord as T}from"../core/db.js";import{todayISO as P,formatINR as i,toPaise as k,fromPaise as N,esc as s,downloadFile as M,generateSimplePDFBlob as O}from"../core/utils.js";import{computeStaffCommissionSummary as Y,saveStaffMember as j,payStaffCommission as V,reverseStaffPayout as X,monthRange as _}from"../core/staff.js";let b="DAILY",y=P(),x=P().slice(0,7),h=null,A=null,u=null,g="";const q=(e,d)=>e.find(n=>n.id===d)?.name||d;async function f(e){const[d,n,c,l,o]=await Promise.all([I("staff"),I("accounts"),I("services"),I("staff_payouts"),H("settings","CENTRE_CONFIG")]),a=b==="DAILY",v=b==="MONTHLY";let $=null;if(a&&($=await Y(y,y,"DAILY")),v){const t=_(x);$=await Y(t.from,t.to,"MONTHLY")}const p=h?d.find(t=>t.id===h):null;e.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Staff Commission</h1>
        <p>Commission earned by each staff member on the bills they handle, with daily and monthly payable</p>
      </div>
    </div>

    ${g?`<div class="callout success"><div><strong>${s(g)}</strong></div></div>`:""}

    <div class="pill-tabs" style="margin-bottom:16px;">
      <button class="pill-tab ${a?"active":""}" data-staff-tab="DAILY">Daily Payable</button>
      <button class="pill-tab ${v?"active":""}" data-staff-tab="MONTHLY">Monthly Payable</button>
      <button class="pill-tab ${b==="STAFF"?"active":""}" data-staff-tab="STAFF">Staff & Rates (${d.length})</button>
      <button class="pill-tab ${b==="HISTORY"?"active":""}" data-staff-tab="HISTORY">Payout History</button>
    </div>

    ${a||v?B($,n):""}
    ${b==="STAFF"?K(d,p,n,c):""}
    ${b==="HISTORY"?G(l,n):""}
  `,e.querySelectorAll("[data-staff-tab]").forEach(t=>t.addEventListener("click",()=>{b=t.getAttribute("data-staff-tab"),A=null,u=null,g="",f(e)})),e.querySelector("#staff-day")?.addEventListener("change",t=>{y=t.target.value||P(),u=null,f(e)}),e.querySelector("#staff-month")?.addEventListener("change",t=>{x=t.target.value||P().slice(0,7),u=null,f(e)}),e.querySelectorAll("[data-staff-detail]").forEach(t=>t.addEventListener("click",()=>{const r=t.getAttribute("data-staff-detail");A=A===r?null:r,f(e)})),e.querySelectorAll("[data-staff-pay]").forEach(t=>t.addEventListener("click",()=>{u=t.getAttribute("data-staff-pay"),f(e)})),e.querySelector("#staff-pay-cancel")?.addEventListener("click",()=>{u=null,f(e)}),e.querySelector("#staff-pay-form")?.addEventListener("submit",async t=>{t.preventDefault();const r=new FormData(t.target),m=$?.rows.find(E=>E.staffId===u),S=k(r.get("amount"));if(!(m&&S>m.payablePaise&&!confirm(`Amount is more than the payable ${i(m.payablePaise)}. Pay anyway?`)))try{await V({staffId:u,periodType:a?"DAILY":"MONTHLY",periodKey:a?y:x,amountPaise:S,accountId:r.get("accountId"),date:r.get("date")||P(),notes:String(r.get("notes")||"").trim()}),g=`Paid ${i(S)} to ${m?.name||"staff"}. Expense posted to ${q(n,r.get("accountId"))}.`,u=null,await f(e)}catch(E){alert(E.message||"Could not record the payout.")}});const C=()=>($?.rows||[]).map(t=>[t.name,t.cycle==="DAILY"?"Daily":"Monthly",String(t.billsCount),i(t.serviceRevenuePaise),i(t.earnedPaise),i(t.paidPaise),i(t.payablePaise)]),D=["Staff","Settlement","Bills","Service Revenue","Commission Earned","Paid","Payable"],w=a?y:x;e.querySelector("#staff-export-csv")?.addEventListener("click",()=>{const t=[D,...C()].map(r=>r.map(m=>`"${String(m).replace(/"/g,'""')}"`).join(","));M("\uFEFF"+t.join(`
`),`Staff_Commission_${w}.csv`,"text/csv;charset=utf-8")}),e.querySelector("#staff-export-pdf")?.addEventListener("click",()=>{const t=$.totals,r=O(`${o?.centreName||"VLEBook"} - Staff Commission ${a?"Daily":"Monthly"} Statement`,`Period: ${w}`,D,C(),[`Total Commission Earned: ${i(t.earnedPaise)}`,`Total Paid: ${i(t.paidPaise)}`,`Total Payable: ${i(t.payablePaise)}`]);M(r,`Staff_Commission_${w}.pdf`,"application/pdf")});const L=e.querySelector("#staff-form"),R=e.querySelector("#staff-mode"),F=()=>{const t=R?.value!=="FIXED";e.querySelector("#staff-percent-wrap")?.style.setProperty("display",t?"":"none"),e.querySelector("#staff-fixed-wrap")?.style.setProperty("display",t?"none":"")};R?.addEventListener("change",F),F(),L?.addEventListener("submit",async t=>{t.preventDefault();const r=new FormData(L);try{const m=await j({id:h||void 0,name:r.get("name"),mobile:r.get("mobile"),role:r.get("role"),cycle:r.get("cycle"),mode:r.get("mode"),percent:r.get("percent"),fixed:r.get("fixed"),payoutAccountId:r.get("payoutAccountId"),active:r.get("active")==="on"});g=`${h?"Updated":"Added"} staff member ${m.name}.`,h=m.id,await f(e)}catch(m){alert(m.message||"Could not save staff member.")}}),e.querySelector("#staff-new-btn")?.addEventListener("click",()=>{h=null,g="",f(e)}),e.querySelectorAll("[data-staff-edit]").forEach(t=>t.addEventListener("click",()=>{h=t.getAttribute("data-staff-edit"),g="",f(e)})),e.querySelector("#ovr-add-btn")?.addEventListener("click",async()=>{if(!p)return;const t=e.querySelector("#ovr-service")?.value,r=e.querySelector("#ovr-mode")?.value||"PERCENT",m=Number(e.querySelector("#ovr-value")?.value||0);if(!t)return;const S=(p.overrides||[]).filter(E=>E.serviceId!==t);S.push(r==="FIXED"?{serviceId:t,mode:r,valuePaise:k(m)}:{serviceId:t,mode:r,percent:Math.min(100,Math.max(0,m))}),await T("staff",{...p,overrides:S}),await f(e)}),e.querySelectorAll("[data-ovr-remove]").forEach(t=>t.addEventListener("click",async()=>{if(!p)return;const r=t.getAttribute("data-ovr-remove");await T("staff",{...p,overrides:(p.overrides||[]).filter(m=>m.serviceId!==r)}),await f(e)})),e.querySelectorAll("[data-payout-reverse]").forEach(t=>t.addEventListener("click",async()=>{confirm("Reverse this payout? Its expense entry will be removed and the amount becomes payable again.")&&(await X(t.getAttribute("data-payout-reverse"),"Reversed by operator"),await f(e))}))}function B(e,d){const n=e.periodType==="DAILY",c=e.totals,l=e.rows.find(o=>o.staffId===u);return`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:10px;">
        <div class="card-title">${n?"Daily Commission Payable":"Monthly Commission Payable"}</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          ${n?`<input type="date" class="form-control" id="staff-day" value="${s(y)}" style="width:170px;">`:`<input type="month" class="form-control" id="staff-month" value="${s(x)}" style="width:170px;">`}
          <button type="button" class="btn btn-sm btn-outline" id="staff-export-csv">Export CSV</button>
          <button type="button" class="btn btn-sm btn-outline" id="staff-export-pdf">Export PDF</button>
        </div>
      </div>

      <div class="grid-kpi" style="margin-bottom:14px;">
        <div class="kpi-card"><div class="kpi-label">Bills Handled</div><div class="kpi-value">${c.billsCount}</div><div class="kpi-sub">Service revenue ${i(c.serviceRevenuePaise)}</div></div>
        <div class="kpi-card navy"><div class="kpi-label">Commission Earned</div><div class="kpi-value">${i(c.earnedPaise)}</div><div class="kpi-sub">${n?"For this day":"For this month"}</div></div>
        <div class="kpi-card success"><div class="kpi-label">Commission Paid</div><div class="kpi-value">${i(c.paidPaise)}</div><div class="kpi-sub">Posted as expense</div></div>
        <div class="kpi-card warning"><div class="kpi-label">Commission Payable</div><div class="kpi-value">${i(c.payablePaise)}</div><div class="kpi-sub">Still to be paid</div></div>
      </div>

      ${e.rows.length===0?'<div class="callout"><div>No staff added yet. Open <strong>Staff & Rates</strong> to add your staff and their commission rates, then choose the staff member under <strong>Handled by</strong> when billing.</div></div>':`
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Settlement</th>
              <th class="num">Bills</th>
              <th class="num">Service Revenue</th>
              <th class="num">Commission Earned</th>
              <th class="num">Paid</th>
              <th class="num">Payable</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${e.rows.map(o=>{const a=n&&o.cycle==="MONTHLY",v=o.payablePaise>0&&!a;return`
              <tr>
                <td><strong>${s(o.name)}</strong>${o.role?`<br><small style="color:var(--color-text-muted);">${s(o.role)}</small>`:""}</td>
                <td><span class="badge ${o.cycle==="DAILY"?"badge-info":"badge-success"}">${o.cycle==="DAILY"?"Daily":"Monthly"}</span></td>
                <td class="num">${o.billsCount}</td>
                <td class="num">${i(o.serviceRevenuePaise)}</td>
                <td class="num"><strong>${i(o.earnedPaise)}</strong></td>
                <td class="num" style="color:var(--color-success);">${i(o.paidPaise)}</td>
                <td class="num" style="font-weight:700; color:${o.payablePaise>0?"var(--color-warning)":"var(--color-text-muted)"};">
                  ${a?'<small style="font-weight:500;">Settled monthly</small>':i(o.payablePaise)}
                  ${o.overpaidPaise>0?`<br><small style="color:var(--color-danger);">Advance ${i(o.overpaidPaise)}</small>`:""}
                </td>
                <td style="white-space:nowrap;">
                  <button class="btn btn-xs btn-outline" data-staff-detail="${s(o.staffId)}">${A===o.staffId?"Hide":"Details"}</button>
                  ${v?`<button class="btn btn-xs btn-primary" data-staff-pay="${s(o.staffId)}">Pay</button>`:""}
                </td>
              </tr>
              ${A===o.staffId?U(o):""}`}).join("")}
          </tbody>
          <tfoot>
            <tr style="font-weight:700;">
              <td colspan="2">Total</td>
              <td class="num">${c.billsCount}</td>
              <td class="num">${i(c.serviceRevenuePaise)}</td>
              <td class="num">${i(c.earnedPaise)}</td>
              <td class="num">${i(c.paidPaise)}</td>
              <td class="num">${i(c.payablePaise)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>`}
    </div>

    ${l?`
    <div class="card">
      <div class="card-header"><div class="card-title">Pay Staff: ${s(l.name)} — ${n?s(y):s(x)}</div></div>
      <form id="staff-pay-form" class="form-grid">
        <div class="form-group">
          <label class="form-label">Amount (₹)</label>
          <input type="number" step="0.01" min="0.01" class="form-control" name="amount" required value="${N(l.payablePaise).toFixed(2)}">
        </div>
        <div class="form-group">
          <label class="form-label">Paid From</label>
          <select class="form-control" name="accountId">
            ${d.map(o=>`<option value="${s(o.id)}" ${o.id==="ACC-CASH"?"selected":""}>${s(o.name)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Payment Date</label>
          <input type="date" class="form-control" name="date" value="${P()}">
        </div>
        <div class="form-group">
          <label class="form-label">Note</label>
          <input type="text" class="form-control" name="notes" placeholder="Optional">
        </div>
        <div style="display:flex; gap:8px; align-items:end;">
          <button type="submit" class="btn btn-primary">Confirm Payment</button>
          <button type="button" class="btn btn-outline" id="staff-pay-cancel">Cancel</button>
        </div>
      </form>
    </div>`:""}
  `}function U(e){return`
    <tr>
      <td colspan="8" style="background:var(--color-surface-alt);">
        <table class="data-table" style="margin:0;">
          <thead><tr><th>Date</th><th>Invoice</th><th>Customer</th><th>Services</th><th class="num">Service Revenue</th><th class="num">Commission</th></tr></thead>
          <tbody>
            ${e.bills.length===0?'<tr><td colspan="6" style="text-align:center; color:var(--color-text-muted);">No bills in this period.</td></tr>':e.bills.map(d=>`
              <tr>
                <td>${s(d.date)}</td>
                <td><strong>${s(d.invoiceNo)}</strong></td>
                <td>${s(d.customerName)}</td>
                <td>${s((d.items||[]).map(n=>n.serviceName).join(", "))}</td>
                <td class="num">${i((d.items||[]).reduce((n,c)=>n+(Number(c.lineServiceChargePaise)||0),0))}</td>
                <td class="num"><strong>${i(d.staffCommissionPaise||0)}</strong></td>
              </tr>`).join("")}
            ${e.payouts.length?e.payouts.map(d=>`<tr><td>${s(d.date)}</td><td colspan="4">Payout (${d.periodType==="DAILY"?"Daily":"Monthly"} ${s(d.periodKey)})${d.notes?` — ${s(d.notes)}`:""}</td><td class="num" style="color:var(--color-success);">−${i(d.amountPaise)}</td></tr>`).join(""):""}
          </tbody>
        </table>
      </td>
    </tr>`}function K(e,d,n,c){const l=d||{cycle:"MONTHLY",mode:"PERCENT",percent:10,fixedPaise:0,active:!0,payoutAccountId:"ACC-CASH"},o=a=>c.find(v=>v.id===a)?.name||a;return`
    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Staff Members</div>
          <button type="button" class="btn btn-sm btn-primary" id="staff-new-btn">+ Add Staff</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Role</th><th>Commission Rule</th><th>Settlement</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${e.length===0?'<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--color-text-muted);">No staff added yet.</td></tr>':[...e].sort((a,v)=>a.name.localeCompare(v.name)).map(a=>`
              <tr>
                <td><strong>${s(a.name)}</strong>${a.mobile?`<br><small style="color:var(--color-text-muted);">${s(a.mobile)}</small>`:""}</td>
                <td>${s(a.role||"—")}</td>
                <td>${a.mode==="FIXED"?`${i(a.fixedPaise)} per service`:`${s(a.percent)}% of service charge`}${(a.overrides||[]).length?`<br><small style="color:var(--color-text-muted);">+${a.overrides.length} service-specific rates</small>`:""}</td>
                <td><span class="badge ${a.cycle==="DAILY"?"badge-info":"badge-success"}">${a.cycle==="DAILY"?"Daily":"Monthly"}</span></td>
                <td><span class="badge ${a.active!==!1?"badge-success":"badge-warning"}">${a.active!==!1?"Active":"Inactive"}</span></td>
                <td><button class="btn btn-xs btn-outline" data-staff-edit="${s(a.id)}">Edit</button></td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="card" data-autosave-scope="staff_form">
          <div class="card-header"><div class="card-title">${d?`Edit Staff: ${s(d.name)}`:"Add Staff Member"}</div></div>
          <form id="staff-form" class="form-grid" style="grid-template-columns:1fr;" data-no-draft-restore>
            <div class="form-group">
              <label class="form-label">Full Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="name" required value="${s(l.name||"")}" placeholder="Staff name">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" class="form-control" name="mobile" maxlength="10" value="${s(l.mobile||"")}" placeholder="10-digit mobile">
              </div>
              <div class="form-group">
                <label class="form-label">Role</label>
                <input type="text" class="form-control" name="role" value="${s(l.role||"")}" placeholder="e.g. Counter Operator">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Commission Type</label>
                <select class="form-control" name="mode" id="staff-mode">
                  <option value="PERCENT" ${l.mode!=="FIXED"?"selected":""}>% of service charge</option>
                  <option value="FIXED" ${l.mode==="FIXED"?"selected":""}>Fixed ₹ per service</option>
                </select>
              </div>
              <div class="form-group" id="staff-percent-wrap">
                <label class="form-label">Commission %</label>
                <input type="number" step="0.01" min="0" max="100" class="form-control" name="percent" value="${s(l.percent??10)}">
              </div>
              <div class="form-group" id="staff-fixed-wrap">
                <label class="form-label">Amount per Service (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="fixed" value="${N(l.fixedPaise||0).toFixed(2)}">
              </div>
            </div>
            <span class="form-hint">% is calculated on the centre's service charge only — government fees and GST are excluded.</span>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Settlement</label>
                <select class="form-control" name="cycle">
                  <option value="DAILY" ${l.cycle==="DAILY"?"selected":""}>Daily</option>
                  <option value="MONTHLY" ${l.cycle!=="DAILY"?"selected":""}>Monthly</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Usually Paid From</label>
                <select class="form-control" name="payoutAccountId">
                  ${n.map(a=>`<option value="${s(a.id)}" ${a.id===(l.payoutAccountId||"ACC-CASH")?"selected":""}>${s(a.name)}</option>`).join("")}
                </select>
              </div>
            </div>
            <label style="display:flex; gap:8px; align-items:center; font-size:13px;">
              <input type="checkbox" name="active" ${l.active!==!1?"checked":""}> Active
            </label>
            <button type="submit" class="btn btn-primary">${d?"Save Changes":"Add Staff Member"}</button>
          </form>
        </div>

        ${d?`
        <div class="card">
          <div class="card-header"><div class="card-title">Service-Specific Rates</div></div>
          <p class="form-hint" style="margin-bottom:8px;">Use a different rate for particular services. Other services use the default rule above.</p>
          <div class="grid-3" style="gap:6px; align-items:end;">
            <div class="form-group">
              <label class="form-label">Service</label>
              <select class="form-control" id="ovr-service">
                ${c.filter(a=>a.active!==!1).sort((a,v)=>a.name.localeCompare(v.name)).map(a=>`<option value="${s(a.id)}">${s(a.name)}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-control" id="ovr-mode">
                <option value="PERCENT">% of service charge</option>
                <option value="FIXED">Fixed ₹ per service</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Value</label>
              <input type="number" step="0.01" min="0" class="form-control" id="ovr-value" value="0">
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-teal" id="ovr-add-btn" style="margin-top:8px;">Add / Update Rate</button>
          <div class="table-wrap" style="margin-top:10px;">
            <table class="data-table">
              <thead><tr><th>Service</th><th>Rate</th><th></th></tr></thead>
              <tbody>
                ${(d.overrides||[]).length===0?'<tr><td colspan="3" style="text-align:center; color:var(--color-text-muted);">No service-specific rates.</td></tr>':d.overrides.map(a=>`<tr><td>${s(o(a.serviceId))}</td><td>${a.mode==="FIXED"?`${i(a.valuePaise)} per service`:`${s(a.percent)}% of service charge`}</td><td><button class="btn btn-xs btn-danger" data-ovr-remove="${s(a.serviceId)}">Remove</button></td></tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>`:""}
      </div>
    </div>
  `}function G(e,d){const n=[...e].sort((l,o)=>String(o.date+o.createdAt).localeCompare(String(l.date+l.createdAt))),c=n.filter(l=>l.status!=="REVERSED").reduce((l,o)=>l+(o.amountPaise||0),0);return`
    <div class="card">
      <div class="card-header"><div class="card-title">Payout History (${n.length}) — Total Paid: ${i(c)}</div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Paid On</th><th>Staff</th><th>For Period</th><th>Paid From</th><th class="num">Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${n.length===0?'<tr><td colspan="7" style="text-align:center; padding:16px; color:var(--color-text-muted);">No payouts recorded yet.</td></tr>':n.map(l=>`
              <tr>
                <td>${s(l.date)}</td>
                <td><strong>${s(l.staffName)}</strong>${l.notes?`<br><small style="color:var(--color-text-muted);">${s(l.notes)}</small>`:""}</td>
                <td>${l.periodType==="DAILY"?"Daily":"Monthly"} · ${s(l.periodKey)}</td>
                <td>${s(q(d,l.accountId))}</td>
                <td class="num"><strong>${i(l.amountPaise)}</strong></td>
                <td><span class="badge ${l.status==="REVERSED"?"badge-warning":"badge-success"}">${l.status==="REVERSED"?"Reversed":"Paid"}</span></td>
                <td>${l.status==="REVERSED"?"":`<button class="btn btn-xs btn-danger" data-payout-reverse="${s(l.id)}">Reverse</button>`}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}export{f as renderStaffModule};
