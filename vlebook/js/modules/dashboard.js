import{computeBusinessIntelligence as W,computeAccountBalances as j}from"../core/accounting.js";import{getAllRecords as f,getRecord as V}from"../core/db.js";import{isValidLogo as K}from"../core/branding.js";import{formatINR as s,fromPaise as S,resolveDateRange as Y,isDateInRange as q,renderCanvasChart as $,esc as d}from"../core/utils.js";import{loadOptionalAcceptanceDataset as z}from"../core/sample-data.js";let k="today",B="",O="";async function w(i,c){const v=await V("settings","CENTRE_CONFIG"),{start:u,end:p}=Y(k,B,O),[h,m,E,M,T]=await Promise.all([W(u,p),j(),f("bills"),f("pending_work"),f("inventory")]),{stockAlerts:G}=await import("../core/stock.js"),n=G(T,v),H=(n.negative.length?`<div class="callout danger"><div><strong>Negative stock:</strong> ${n.negative.map(t=>`<span data-no-i18n>${d(t.name)}</span> (${d(t.currentStock)} ${d(t.unit||"")})`).join(", ")}. <button class="btn btn-xs btn-outline" data-dash-stock>Open Stock & Inventory</button></div></div>`:"")+(n.checkDue?`<div class="callout warning"><div><strong>Physical stock check due:</strong> ${n.last?`last check ${d(n.last)} (${n.daysSince} days ago)`:"no physical stock check yet"}. <button class="btn btn-xs btn-outline" data-dash-stock="PHYSICAL">Count stock now</button></div></div>`:"");let x="";try{const{can:t,canAccess:l}=await import("../core/auth.js"),C=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date),P=[];if(l("reminders")){const A=(await f("reminders")).filter(o=>o.status==="ACTIVE"),a=A.filter(o=>(o.dueDate||o.expiryDate)<C).length,r=A.filter(o=>(o.dueDate||o.expiryDate)===C).length;(a||r)&&P.push(`<div class="callout warning"><div><strong>Renewal reminders:</strong> ${a} overdue, ${r} due today. <button class="btn btn-xs btn-outline" data-dash-go="reminders">Open reminders</button></div></div>`)}if(l("privacy")){const a=await(await import("../core/privacy.js")).privacyDashboard(C),r=[];a.custody.OVERDUE&&r.push(`${a.custody.OVERDUE} original document(s) overdue for return`),a.custody.MISSING&&r.push(`${a.custody.MISSING} reported missing`),a.custody.HELD_LONG&&r.push(`${a.custody.HELD_LONG} held for a long time`),a.custody.NO_ACK&&r.push(`${a.custody.NO_ACK} receipt(s) not acknowledged`),t("manage_privacy")&&a.retentionDue&&r.push(`${a.retentionDue} record(s) past their retention period`),t("handle_privacy_requests")&&a.openRequests&&r.push(`${a.openRequests} open customer privacy request(s)${a.overdueRequests?` — ${a.overdueRequests} older than 30 days`:""}`),r.length&&P.push(`<div class="callout ${a.custody.OVERDUE||a.custody.MISSING||a.overdueRequests?"danger":"warning"}"><div><strong>Originals & privacy:</strong> ${r.join(" · ")}. <button class="btn btn-xs btn-outline" data-dash-go="privacy">Open</button></div></div>`)}const{kvGet:F}=await import("../core/devicestore.js"),R=Number(await F("supportUpdates")||0);R&&P.push(`<div class="callout info"><div><strong>Techmin support:</strong> ${R} ticket(s) with a new reply. <button class="btn btn-xs btn-outline" data-dash-go="support">Open Help & Support</button></div></div>`),x=P.join("")}catch{}const _=m.find(t=>t.id==="ACC-CASH")?.currentBalancePaise||0,U=m.find(t=>t.id==="ACC-BANK")?.currentBalancePaise||0,D=m.find(t=>t.id==="ACC-UPI")?.currentBalancePaise||0,L=(m.find(t=>t.id==="ACC-WALLET")?.currentBalancePaise||0)+(m.find(t=>t.id==="ACC-AEPS")?.currentBalancePaise||0),e=h.totals;i.innerHTML=`
    <div class="module-header">
      ${K(v?.centreLogo)?`<img class="dash-centre-logo" src="${v.centreLogo}" alt="">`:""}
      <div class="module-title-group" style="flex:1;">
        <h1>${v?.centreName?`<span data-no-i18n>${d(v.centreName)}</span> — `:""}Financial Overview</h1>
        <p>Period: <strong>${d(u)}</strong> to <strong>${d(p)}</strong> • Real-time transaction & profitability metrics</p>
      </div>
      <div class="module-actions">
        ${e.totalCustomers===0?'<button class="btn btn-gold" id="dash-load-demo-btn" title="Load optional realistic acceptance dataset">Load Sample Data</button>':""}
        <button class="btn btn-outline" id="dash-workbench-btn">Document Workbench</button>
        <button class="btn btn-outline" id="dash-counter-close-btn">Counter Reconciliation</button>
        <button class="btn btn-primary" id="dash-new-bill-btn">+ New Counter Invoice</button>
      </div>
    </div>
    ${H}${x}

    <!-- Clean Period Selector Bar -->
    <div class="filter-bar" style="justify-content:space-between;">
      <div class="pill-tabs" id="dash-period-tabs">
        ${[["today","Today"],["yesterday","Yesterday"],["week","7 Days"],["month","This Month"],["prev_month","Last Month"],["fy","Financial Year"],["all","All Time"],["custom","Custom"]].map(([t,l])=>`<button class="pill-tab ${k===t?"active":""}" data-preset="${t}">${l}</button>`).join("")}
      </div>
      <div style="display:${k==="custom"?"flex":"none"}; gap:8px; align-items:center;" id="dash-custom-dates">
        <input type="date" class="form-control" id="dash-date-from" value="${d(u)}" style="width:140px;">
        <span style="color:var(--color-text-muted);">to</span>
        <input type="date" class="form-control" id="dash-date-to" value="${d(p)}" style="width:140px;">
        <button class="btn btn-sm btn-primary" id="dash-apply-custom">Apply</button>
      </div>
    </div>

    <!-- 4 Primary Executive Financial Cards -->
    <div class="grid-kpi">
      <div class="kpi-card navy">
        <div class="kpi-label">
          <span>Gross Customer Billing</span>
          <span class="kpi-dot"></span>
        </div>
        <div class="kpi-value">${s(e.grossCollectionsPaise)}</div>
        <div class="kpi-sub">Govt Challan Pass-through: ${s(e.govtFeesTotalPaise)}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>Centre Service Revenue</span>
          <span class="kpi-dot"></span>
        </div>
        <div class="kpi-value">${s(e.centreServiceChargesPaise)}</div>
        <div class="kpi-sub">Pure operator service charges</div>
      </div>

      <div class="kpi-card success">
        <div class="kpi-label">
          <span>Actual Collections</span>
          <span class="kpi-dot"></span>
        </div>
        <div class="kpi-value">${s(e.actualCollectedPaise)}</div>
        <div class="kpi-sub">Cash, UPI, Bank & Wallet inflows</div>
      </div>

      <div class="kpi-card highlight">
        <div class="kpi-label">
          <span>True Service Contribution</span>
          <span class="badge badge-info">Net Profit: ${s(e.netOperatingProfitPaise)}</span>
        </div>
        <div class="kpi-value" style="color:var(--color-brand);">${s(e.totalServiceContributionPaise)}</div>
        <div class="kpi-sub">After expenses entered in Accounts, plus commissions</div>
      </div>
    </div>

    <!-- Unified 8-Metric Operational & Balance Strip (Uncluttered) -->
    <div class="metric-strip">
      <div class="metric-strip-item">
        <div class="metric-strip-label">Cash in Hand (Drawer)</div>
        <div class="metric-strip-val" style="color:var(--color-success);">${s(_)}</div>
        <div class="metric-strip-sub">Physical counter balance</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Bank, UPI & Wallets</div>
        <div class="metric-strip-val">${s(U+D+L)}</div>
        <div class="metric-strip-sub">UPI: ${s(D)} • Wallet: ${s(L)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Pending Customer Dues</div>
        <div class="metric-strip-val" style="color:${e.pendingCustomerDuesPaise>0?"var(--color-danger)":"var(--color-text)"};">${s(e.pendingCustomerDuesPaise)}</div>
        <div class="metric-strip-sub">Advances Held: ${s(e.customerAdvancesPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Commissions Earned</div>
        <div class="metric-strip-val">${s(e.commissionEarnedTotalPaise)}</div>
        <div class="metric-strip-sub">Recvd: ${s(e.commissionReceivedTotalPaise)} • Due: ${s(e.commissionPendingTotalPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Total Expenses</div>
        <div class="metric-strip-val">${s(e.totalExpensesPaise)}</div>
        <div class="metric-strip-sub">Purchases: ${s(e.directCostsTotalPaise)} • Other expenses: ${s(e.commonOperatingExpensesPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Applications Tracker</div>
        <div class="metric-strip-val">${e.pendingApplications} Pending</div>
        <div class="metric-strip-sub">${e.completedApplications} Completed / Approved</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Registered Customers</div>
        <div class="metric-strip-val">${e.totalCustomers} Citizens</div>
        <div class="metric-strip-sub">+${e.newCustomersInPeriod} New • Refunds Due: ${s(e.pendingRefundsPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Print Volume</div>
        <div class="metric-strip-val">${e.totalPagesPrinted} Pages</div>
        <div class="metric-strip-sub">Printing services billed in period</div>
      </div>
    </div>

    <!-- Analytics Charts Grid -->
    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Service-Wise True Contribution (INR)</div>
        </div>
        <div class="chart-box"><canvas id="chart-service-profit"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Payment Mode Breakdown</div>
        </div>
        <div class="chart-box"><canvas id="chart-payment-modes"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Daily Billing Trend</div>
        </div>
        <div class="chart-box"><canvas id="chart-daily-trend"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Application Pipeline Status</div>
        </div>
        <div class="chart-box"><canvas id="chart-app-status"></canvas></div>
      </div>
    </div>

    <!-- Service-Wise True Profit Intelligence Table -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Service-Wise Profitability Breakdown</div>
          <small style="color:var(--color-text-muted);">Automatically separates Government Challan fees from your Centre's actual earnings</small>
        </div>
        <button class="btn btn-sm btn-outline" id="dash-go-reports">Full Profit BI Reports →</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th class="num">Qty</th>
              <th class="num">Gross Billed</th>
              <th class="num">Govt / 3rd Party</th>
              <th class="num">Service Revenue</th>
              <th class="num">Linked expenses</th>
              <th class="num">Comm. Earned</th>
              <th class="num">Contribution</th>
              <th class="num">Alloc. OpEx</th>
              <th class="num">Est. Net Profit</th>
            </tr>
          </thead>
          <tbody>
            ${h.rankings.mostProfitableServices.length===0?'<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--color-text-muted);">No service transactions recorded in this period. Click <strong>+ New Counter Invoice</strong> or <strong>Load Sample Data</strong> above to get started.</td></tr>':h.rankings.mostProfitableServices.map(t=>`
                  <tr>
                    <td>
                      <strong style="color:var(--color-text);">${d(t.serviceName)}</strong><br>
                      <small style="color:var(--color-text-muted);">${d(t.category)}</small>
                    </td>
                    <td class="num">${t.qtyCount}</td>
                    <td class="num">${s(t.customerCollectionPaise)}</td>
                    <td class="num" style="color:var(--color-text-muted);">${s(t.govtFeePaise+t.thirdPartyPaise)}</td>
                    <td class="num">${s(t.serviceChargePaise)}</td>
                    <td class="num" style="color:var(--color-danger);">${s(t.directCostPaise)}</td>
                    <td class="num" style="color:var(--color-brand);">${s(t.commissionEarnedPaise)}</td>
                    <td class="num"><strong>${s(t.serviceContributionPaise)}</strong></td>
                    <td class="num" style="color:var(--color-text-muted);">${s(t.allocatedOpExPaise)}</td>
                    <td class="num" style="color:${t.netOperatingProfitPaise>=0?"var(--color-success)":"var(--color-danger)"}; font-weight:700;">
                      ${s(t.netOperatingProfitPaise)}
                    </td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,i.querySelectorAll("[data-dash-go]").forEach(t=>t.addEventListener("click",()=>c(t.getAttribute("data-dash-go")))),i.querySelectorAll("[data-dash-stock]").forEach(t=>t.addEventListener("click",()=>c("inventory",t.getAttribute("data-dash-stock")||void 0))),i.querySelector("#dash-new-bill-btn")?.addEventListener("click",()=>c("billing")),i.querySelector("#dash-counter-close-btn")?.addEventListener("click",()=>c("accounts")),i.querySelector("#dash-workbench-btn")?.addEventListener("click",()=>c("studio")),i.querySelector("#dash-go-reports")?.addEventListener("click",()=>c("reports")),i.querySelector("#dash-load-demo-btn")?.addEventListener("click",async()=>{await z(),await w(i,c)}),i.querySelectorAll("#dash-period-tabs .pill-tab").forEach(t=>{t.addEventListener("click",()=>{k=t.getAttribute("data-preset"),w(i,c)})}),i.querySelector("#dash-apply-custom")?.addEventListener("click",()=>{B=i.querySelector("#dash-date-from")?.value||"",O=i.querySelector("#dash-date-to")?.value||"",w(i,c)});const N=h.rankings.mostProfitableServices.slice(0,6);$(i.querySelector("#chart-service-profit"),{type:"bar",labels:N.map(t=>t.serviceName.slice(0,14)),values:N.map(t=>S(t.serviceContributionPaise))});const b=new Map;E.filter(t=>t.status!=="CANCELLED"&&q(t.date,u,p)).forEach(t=>{const l=t.paymentMode||"CASH";b.set(l,(b.get(l)||0)+S(t.grandTotalPaise))}),$(i.querySelector("#chart-payment-modes"),{type:"doughnut",labels:Array.from(b.keys()),values:Array.from(b.values())});const y=new Map;E.filter(t=>t.status!=="CANCELLED"&&q(t.date,u,p)).forEach(t=>{y.set(t.date,(y.get(t.date)||0)+S(t.grandTotalPaise))});const I=Array.from(y.keys()).sort();$(i.querySelector("#chart-daily-trend"),{type:"line",labels:I.map(t=>t.slice(5)),values:I.map(t=>y.get(t))});const g=new Map;M.forEach(t=>{const l=t.status||"New";g.set(l,(g.get(l)||0)+1)}),$(i.querySelector("#chart-app-status"),{type:"doughnut",labels:Array.from(g.keys()),values:Array.from(g.values())})}export{w as renderDashboardModule};
