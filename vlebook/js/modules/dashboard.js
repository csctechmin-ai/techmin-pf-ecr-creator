import{computeBusinessIntelligence as D,computeAccountBalances as L}from"../core/accounting.js";import{getAllRecords as k}from"../core/db.js";import{formatINR as t,fromPaise as h,resolveDateRange as N,isDateInRange as A,renderCanvasChart as m,esc as l}from"../core/utils.js";import{loadOptionalAcceptanceDataset as R}from"../core/sample-data.js";let b="today",S="",E="";async function y(a,i){const{start:d,end:c}=N(b,S,E),[n,o,g,w]=await Promise.all([D(d,c),L(),k("bills"),k("pending_work")]),x=o.find(s=>s.id==="ACC-CASH")?.currentBalancePaise||0,B=o.find(s=>s.id==="ACC-BANK")?.currentBalancePaise||0,P=o.find(s=>s.id==="ACC-UPI")?.currentBalancePaise||0,C=(o.find(s=>s.id==="ACC-WALLET")?.currentBalancePaise||0)+(o.find(s=>s.id==="ACC-AEPS")?.currentBalancePaise||0),e=n.totals;a.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Financial Overview & Centre Intelligence</h1>
        <p>Period: <strong>${l(d)}</strong> to <strong>${l(c)}</strong> • Real-time transaction & profitability metrics</p>
      </div>
      <div class="module-actions">
        ${e.totalCustomers===0?'<button class="btn btn-gold" id="dash-load-demo-btn" title="Load optional realistic acceptance dataset">Load Sample Data</button>':""}
        <button class="btn btn-outline" id="dash-workbench-btn">Document Workbench</button>
        <button class="btn btn-outline" id="dash-counter-close-btn">Counter Reconciliation</button>
        <button class="btn btn-primary" id="dash-new-bill-btn">+ New Counter Invoice</button>
      </div>
    </div>

    <!-- Clean Period Selector Bar -->
    <div class="filter-bar" style="justify-content:space-between;">
      <div class="pill-tabs" id="dash-period-tabs">
        ${[["today","Today"],["yesterday","Yesterday"],["week","7 Days"],["month","This Month"],["prev_month","Last Month"],["fy","Financial Year"],["all","All Time"],["custom","Custom"]].map(([s,r])=>`<button class="pill-tab ${b===s?"active":""}" data-preset="${s}">${r}</button>`).join("")}
      </div>
      <div style="display:${b==="custom"?"flex":"none"}; gap:8px; align-items:center;" id="dash-custom-dates">
        <input type="date" class="form-control" id="dash-date-from" value="${l(d)}" style="width:140px;">
        <span style="color:var(--color-text-muted);">to</span>
        <input type="date" class="form-control" id="dash-date-to" value="${l(c)}" style="width:140px;">
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
        <div class="kpi-value">${t(e.grossCollectionsPaise)}</div>
        <div class="kpi-sub">Govt Challan Pass-through: ${t(e.govtFeesTotalPaise)}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>Centre Service Revenue</span>
          <span class="kpi-dot"></span>
        </div>
        <div class="kpi-value">${t(e.centreServiceChargesPaise)}</div>
        <div class="kpi-sub">Pure operator service charges</div>
      </div>

      <div class="kpi-card success">
        <div class="kpi-label">
          <span>Actual Collections</span>
          <span class="kpi-dot"></span>
        </div>
        <div class="kpi-value">${t(e.actualCollectedPaise)}</div>
        <div class="kpi-sub">Cash, UPI, Bank & Wallet inflows</div>
      </div>

      <div class="kpi-card highlight">
        <div class="kpi-label">
          <span>True Service Contribution</span>
          <span class="badge badge-info">Net Profit: ${t(e.netOperatingProfitPaise)}</span>
        </div>
        <div class="kpi-value" style="color:var(--color-brand);">${t(e.totalServiceContributionPaise)}</div>
        <div class="kpi-sub">After Direct Costs & Earned Commissions</div>
      </div>
    </div>

    <!-- Unified 8-Metric Operational & Balance Strip (Uncluttered) -->
    <div class="metric-strip">
      <div class="metric-strip-item">
        <div class="metric-strip-label">Cash in Hand (Drawer)</div>
        <div class="metric-strip-val" style="color:var(--color-success);">${t(x)}</div>
        <div class="metric-strip-sub">Physical counter balance</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Bank, UPI & Wallets</div>
        <div class="metric-strip-val">${t(B+P+C)}</div>
        <div class="metric-strip-sub">UPI: ${t(P)} • Wallet: ${t(C)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Pending Customer Dues</div>
        <div class="metric-strip-val" style="color:${e.pendingCustomerDuesPaise>0?"var(--color-danger)":"var(--color-text)"};">${t(e.pendingCustomerDuesPaise)}</div>
        <div class="metric-strip-sub">Advances Held: ${t(e.customerAdvancesPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Commissions Earned</div>
        <div class="metric-strip-val">${t(e.commissionEarnedTotalPaise)}</div>
        <div class="metric-strip-sub">Recvd: ${t(e.commissionReceivedTotalPaise)} • Due: ${t(e.commissionPendingTotalPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Total Expenses</div>
        <div class="metric-strip-val">${t(e.totalExpensesPaise)}</div>
        <div class="metric-strip-sub">Direct: ${t(e.directCostsTotalPaise)} • OpEx: ${t(e.commonOperatingExpensesPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Applications Tracker</div>
        <div class="metric-strip-val">${e.pendingApplications} Pending</div>
        <div class="metric-strip-sub">${e.completedApplications} Completed / Approved</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Registered Customers</div>
        <div class="metric-strip-val">${e.totalCustomers} Citizens</div>
        <div class="metric-strip-sub">+${e.newCustomersInPeriod} New • Refunds Due: ${t(e.pendingRefundsPaise)}</div>
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
              <th class="num">Direct Cost</th>
              <th class="num">Comm. Earned</th>
              <th class="num">Contribution</th>
              <th class="num">Alloc. OpEx</th>
              <th class="num">Est. Net Profit</th>
            </tr>
          </thead>
          <tbody>
            ${n.rankings.mostProfitableServices.length===0?'<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--color-text-muted);">No service transactions recorded in this period. Click <strong>+ New Counter Invoice</strong> or <strong>Load Sample Data</strong> above to get started.</td></tr>':n.rankings.mostProfitableServices.map(s=>`
                  <tr>
                    <td>
                      <strong style="color:var(--color-text);">${l(s.serviceName)}</strong><br>
                      <small style="color:var(--color-text-muted);">${l(s.category)}</small>
                    </td>
                    <td class="num">${s.qtyCount}</td>
                    <td class="num">${t(s.customerCollectionPaise)}</td>
                    <td class="num" style="color:var(--color-text-muted);">${t(s.govtFeePaise+s.thirdPartyPaise)}</td>
                    <td class="num">${t(s.serviceChargePaise)}</td>
                    <td class="num" style="color:var(--color-danger);">${t(s.directCostPaise)}</td>
                    <td class="num" style="color:var(--color-brand);">${t(s.commissionEarnedPaise)}</td>
                    <td class="num"><strong>${t(s.serviceContributionPaise)}</strong></td>
                    <td class="num" style="color:var(--color-text-muted);">${t(s.allocatedOpExPaise)}</td>
                    <td class="num" style="color:${s.netOperatingProfitPaise>=0?"var(--color-success)":"var(--color-danger)"}; font-weight:700;">
                      ${t(s.netOperatingProfitPaise)}
                    </td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,a.querySelector("#dash-new-bill-btn")?.addEventListener("click",()=>i("billing")),a.querySelector("#dash-counter-close-btn")?.addEventListener("click",()=>i("accounts")),a.querySelector("#dash-workbench-btn")?.addEventListener("click",()=>i("studio")),a.querySelector("#dash-go-reports")?.addEventListener("click",()=>i("reports")),a.querySelector("#dash-load-demo-btn")?.addEventListener("click",async()=>{await R(),await y(a,i)}),a.querySelectorAll("#dash-period-tabs .pill-tab").forEach(s=>{s.addEventListener("click",()=>{b=s.getAttribute("data-preset"),y(a,i)})}),a.querySelector("#dash-apply-custom")?.addEventListener("click",()=>{S=a.querySelector("#dash-date-from")?.value||"",E=a.querySelector("#dash-date-to")?.value||"",y(a,i)});const f=n.rankings.mostProfitableServices.slice(0,6);m(a.querySelector("#chart-service-profit"),{type:"bar",labels:f.map(s=>s.serviceName.slice(0,14)),values:f.map(s=>h(s.serviceContributionPaise))});const v=new Map;g.filter(s=>s.status!=="CANCELLED"&&A(s.date,d,c)).forEach(s=>{const r=s.paymentMode||"CASH";v.set(r,(v.get(r)||0)+h(s.grandTotalPaise))}),m(a.querySelector("#chart-payment-modes"),{type:"doughnut",labels:Array.from(v.keys()),values:Array.from(v.values())});const p=new Map;g.filter(s=>s.status!=="CANCELLED"&&A(s.date,d,c)).forEach(s=>{p.set(s.date,(p.get(s.date)||0)+h(s.grandTotalPaise))});const $=Array.from(p.keys()).sort();m(a.querySelector("#chart-daily-trend"),{type:"line",labels:$.map(s=>s.slice(5)),values:$.map(s=>p.get(s))});const u=new Map;w.forEach(s=>{const r=s.status||"New";u.set(r,(u.get(r)||0)+1)}),m(a.querySelector("#chart-app-status"),{type:"doughnut",labels:Array.from(u.keys()),values:Array.from(u.values())})}export{y as renderDashboardModule};
