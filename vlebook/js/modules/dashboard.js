import{computeBusinessIntelligence as q,computeAccountBalances as T}from"../core/accounting.js";import{getAllRecords as g,getRecord as M}from"../core/db.js";import{isValidLogo as O}from"../core/branding.js";import{formatINR as s,fromPaise as P,resolveDateRange as F,isDateInRange as E,renderCanvasChart as h,esc as i}from"../core/utils.js";import{loadOptionalAcceptanceDataset as W}from"../core/sample-data.js";let y="today",w="",x="";async function C(a,r){const d=await M("settings","CENTRE_CONFIG"),{start:o,end:n}=F(y,w,x),[p,v,k,L,B]=await Promise.all([q(o,n),T(),g("bills"),g("pending_work"),g("inventory")]),{stockAlerts:D}=await import("../core/stock.js"),c=D(B,d),N=(c.negative.length?`<div class="callout danger"><div><strong>Negative stock:</strong> ${c.negative.map(t=>`<span data-no-i18n>${i(t.name)}</span> (${i(t.currentStock)} ${i(t.unit||"")})`).join(", ")}. <button class="btn btn-xs btn-outline" data-dash-stock>Open Stock & Inventory</button></div></div>`:"")+(c.checkDue?`<div class="callout warning"><div><strong>Physical stock check due:</strong> ${c.last?`last check ${i(c.last)} (${c.daysSince} days ago)`:"no physical stock check yet"}. <button class="btn btn-xs btn-outline" data-dash-stock="PHYSICAL">Count stock now</button></div></div>`:""),I=v.find(t=>t.id==="ACC-CASH")?.currentBalancePaise||0,R=v.find(t=>t.id==="ACC-BANK")?.currentBalancePaise||0,$=v.find(t=>t.id==="ACC-UPI")?.currentBalancePaise||0,f=(v.find(t=>t.id==="ACC-WALLET")?.currentBalancePaise||0)+(v.find(t=>t.id==="ACC-AEPS")?.currentBalancePaise||0),e=p.totals;a.innerHTML=`
    <div class="module-header">
      ${O(d?.centreLogo)?`<img class="dash-centre-logo" src="${d.centreLogo}" alt="">`:""}
      <div class="module-title-group" style="flex:1;">
        <h1>${d?.centreName?`<span data-no-i18n>${i(d.centreName)}</span> — `:""}Financial Overview</h1>
        <p>Period: <strong>${i(o)}</strong> to <strong>${i(n)}</strong> • Real-time transaction & profitability metrics</p>
      </div>
      <div class="module-actions">
        ${e.totalCustomers===0?'<button class="btn btn-gold" id="dash-load-demo-btn" title="Load optional realistic acceptance dataset">Load Sample Data</button>':""}
        <button class="btn btn-outline" id="dash-workbench-btn">Document Workbench</button>
        <button class="btn btn-outline" id="dash-counter-close-btn">Counter Reconciliation</button>
        <button class="btn btn-primary" id="dash-new-bill-btn">+ New Counter Invoice</button>
      </div>
    </div>
    ${N}

    <!-- Clean Period Selector Bar -->
    <div class="filter-bar" style="justify-content:space-between;">
      <div class="pill-tabs" id="dash-period-tabs">
        ${[["today","Today"],["yesterday","Yesterday"],["week","7 Days"],["month","This Month"],["prev_month","Last Month"],["fy","Financial Year"],["all","All Time"],["custom","Custom"]].map(([t,l])=>`<button class="pill-tab ${y===t?"active":""}" data-preset="${t}">${l}</button>`).join("")}
      </div>
      <div style="display:${y==="custom"?"flex":"none"}; gap:8px; align-items:center;" id="dash-custom-dates">
        <input type="date" class="form-control" id="dash-date-from" value="${i(o)}" style="width:140px;">
        <span style="color:var(--color-text-muted);">to</span>
        <input type="date" class="form-control" id="dash-date-to" value="${i(n)}" style="width:140px;">
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
        <div class="kpi-sub">After Direct Costs & Earned Commissions</div>
      </div>
    </div>

    <!-- Unified 8-Metric Operational & Balance Strip (Uncluttered) -->
    <div class="metric-strip">
      <div class="metric-strip-item">
        <div class="metric-strip-label">Cash in Hand (Drawer)</div>
        <div class="metric-strip-val" style="color:var(--color-success);">${s(I)}</div>
        <div class="metric-strip-sub">Physical counter balance</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Bank, UPI & Wallets</div>
        <div class="metric-strip-val">${s(R+$+f)}</div>
        <div class="metric-strip-sub">UPI: ${s($)} • Wallet: ${s(f)}</div>
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
        <div class="metric-strip-sub">Direct: ${s(e.directCostsTotalPaise)} • OpEx: ${s(e.commonOperatingExpensesPaise)}</div>
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
              <th class="num">Direct Cost</th>
              <th class="num">Comm. Earned</th>
              <th class="num">Contribution</th>
              <th class="num">Alloc. OpEx</th>
              <th class="num">Est. Net Profit</th>
            </tr>
          </thead>
          <tbody>
            ${p.rankings.mostProfitableServices.length===0?'<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--color-text-muted);">No service transactions recorded in this period. Click <strong>+ New Counter Invoice</strong> or <strong>Load Sample Data</strong> above to get started.</td></tr>':p.rankings.mostProfitableServices.map(t=>`
                  <tr>
                    <td>
                      <strong style="color:var(--color-text);">${i(t.serviceName)}</strong><br>
                      <small style="color:var(--color-text-muted);">${i(t.category)}</small>
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
  `,a.querySelectorAll("[data-dash-stock]").forEach(t=>t.addEventListener("click",()=>r("inventory",t.getAttribute("data-dash-stock")||void 0))),a.querySelector("#dash-new-bill-btn")?.addEventListener("click",()=>r("billing")),a.querySelector("#dash-counter-close-btn")?.addEventListener("click",()=>r("accounts")),a.querySelector("#dash-workbench-btn")?.addEventListener("click",()=>r("studio")),a.querySelector("#dash-go-reports")?.addEventListener("click",()=>r("reports")),a.querySelector("#dash-load-demo-btn")?.addEventListener("click",async()=>{await W(),await C(a,r)}),a.querySelectorAll("#dash-period-tabs .pill-tab").forEach(t=>{t.addEventListener("click",()=>{y=t.getAttribute("data-preset"),C(a,r)})}),a.querySelector("#dash-apply-custom")?.addEventListener("click",()=>{w=a.querySelector("#dash-date-from")?.value||"",x=a.querySelector("#dash-date-to")?.value||"",C(a,r)});const A=p.rankings.mostProfitableServices.slice(0,6);h(a.querySelector("#chart-service-profit"),{type:"bar",labels:A.map(t=>t.serviceName.slice(0,14)),values:A.map(t=>P(t.serviceContributionPaise))});const u=new Map;k.filter(t=>t.status!=="CANCELLED"&&E(t.date,o,n)).forEach(t=>{const l=t.paymentMode||"CASH";u.set(l,(u.get(l)||0)+P(t.grandTotalPaise))}),h(a.querySelector("#chart-payment-modes"),{type:"doughnut",labels:Array.from(u.keys()),values:Array.from(u.values())});const m=new Map;k.filter(t=>t.status!=="CANCELLED"&&E(t.date,o,n)).forEach(t=>{m.set(t.date,(m.get(t.date)||0)+P(t.grandTotalPaise))});const S=Array.from(m.keys()).sort();h(a.querySelector("#chart-daily-trend"),{type:"line",labels:S.map(t=>t.slice(5)),values:S.map(t=>m.get(t))});const b=new Map;L.forEach(t=>{const l=t.status||"New";b.set(l,(b.get(l)||0)+1)}),h(a.querySelector("#chart-app-status"),{type:"doughnut",labels:Array.from(b.keys()),values:Array.from(b.values())})}export{C as renderDashboardModule};
