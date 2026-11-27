import{computeBusinessIntelligence as z,computeAccountBalances as Q}from"../core/accounting.js";import{getAllRecords as w,getRecord as Z}from"../core/db.js";import{isValidLogo as J}from"../core/branding.js";import{formatINR as s,fromPaise as A,resolveDateRange as X,isDateInRange as O,renderCanvasChart as $,esc as l}from"../core/utils.js";import{loadOptionalAcceptanceDataset as tt}from"../core/sample-data.js";import{APP_VERSION as M,APP_UPDATED as _}from"../core/utils.js";import{getLang as E}from"../core/i18n.js";import{getCurrentUser as et}from"../core/auth.js";const H=`${M}|${_}`,L=()=>`vlebook_wn_hidden_${et()?.username||""}`;function st(){try{return localStorage.getItem(L())===H}catch{return!1}}function at(){const e=["hi","ml"].includes(E())?E():"en",r=_.split("-").reverse().join("-"),d=`<span class="wn-ver"><span>VLEBook</span> <strong data-no-i18n>${M}</strong> · <span>Updated</span> <span data-no-i18n>${r}</span></span>`;return st()?`<div class="dash-wn-mini" id="dash-whatsnew">${d} · <button type="button" class="btn-link" id="wn-show">Show what's new</button></div>`:`<div class="card dash-whatsnew" id="dash-whatsnew">
      <img class="wn-gif" src="help/learn/img/whatsnew-${e}.gif" alt="What's new in VLEBook" loading="lazy" width="640" height="360">
      <div class="wn-body">
        ${d}
        <h3>What's new</h3>
        <ul>
          <li>New: Google Forms — real Google Forms in your own Gmail account</li>
          <li>30 ready-made templates in English, Hindi and Malayalam</li>
          <li>Publish and share by link, WhatsApp or e-mail</li>
          <li>See, search and export the responses inside VLEBook</li>
          <li>Learning Centre: 48 lessons in English, Hindi and Malayalam</li>
        </ul>
        <div class="wn-actions"><button type="button" class="btn btn-sm btn-primary" id="wn-notes">All release notes</button><button type="button" class="btn btn-sm btn-outline" id="wn-hide">Hide until next update</button></div>
      </div>
    </div>`}let k="today",T="",G="";async function h(e,r){const d=await Z("settings","CENTRE_CONFIG"),{start:u,end:p}=X(k,T,G),[b,m,x,U,W]=await Promise.all([z(u,p),Q(),w("bills"),w("pending_work"),w("inventory")]),{stockAlerts:F}=await import("../core/stock.js"),v=F(W,d),V=(v.negative.length?`<div class="callout danger"><div><strong>Negative stock:</strong> ${v.negative.map(t=>`<span data-no-i18n>${l(t.name)}</span> (${l(t.currentStock)} ${l(t.unit||"")})`).join(", ")}. <button class="btn btn-xs btn-outline" data-dash-stock>Open Stock & Inventory</button></div></div>`:"")+(v.checkDue?`<div class="callout warning"><div><strong>Physical stock check due:</strong> ${v.last?`last check ${l(v.last)} (${v.daysSince} days ago)`:"no physical stock check yet"}. <button class="btn btn-xs btn-outline" data-dash-stock="PHYSICAL">Count stock now</button></div></div>`:"");let D="";try{const{can:t,canAccess:o}=await import("../core/auth.js"),C=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date),P=[];if(o("reminders")){const S=(await w("reminders")).filter(c=>c.status==="ACTIVE"),i=S.filter(c=>(c.dueDate||c.expiryDate)<C).length,n=S.filter(c=>(c.dueDate||c.expiryDate)===C).length;(i||n)&&P.push(`<div class="callout warning"><div><strong>Renewal reminders:</strong> ${i} overdue, ${n} due today. <button class="btn btn-xs btn-outline" data-dash-go="reminders">Open reminders</button></div></div>`)}if(o("privacy")){const i=await(await import("../core/privacy.js")).privacyDashboard(C),n=[];i.custody.OVERDUE&&n.push(`${i.custody.OVERDUE} original document(s) overdue for return`),i.custody.MISSING&&n.push(`${i.custody.MISSING} reported missing`),i.custody.HELD_LONG&&n.push(`${i.custody.HELD_LONG} held for a long time`),i.custody.NO_ACK&&n.push(`${i.custody.NO_ACK} receipt(s) not acknowledged`),t("manage_privacy")&&i.retentionDue&&n.push(`${i.retentionDue} record(s) past their retention period`),t("handle_privacy_requests")&&i.openRequests&&n.push(`${i.openRequests} open customer privacy request(s)${i.overdueRequests?` — ${i.overdueRequests} older than 30 days`:""}`),n.length&&P.push(`<div class="callout ${i.custody.OVERDUE||i.custody.MISSING||i.overdueRequests?"danger":"warning"}"><div><strong>Originals & privacy:</strong> ${n.join(" · ")}. <button class="btn btn-xs btn-outline" data-dash-go="privacy">Open</button></div></div>`)}const{kvGet:Y}=await import("../core/devicestore.js"),q=Number(await Y("supportUpdates")||0);q&&P.push(`<div class="callout info"><div><strong>Techmin support:</strong> ${q} ticket(s) with a new reply. <button class="btn btn-xs btn-outline" data-dash-go="support">Open Help & Support</button></div></div>`),D=P.join("")}catch{}const j=m.find(t=>t.id==="ACC-CASH")?.currentBalancePaise||0,K=m.find(t=>t.id==="ACC-BANK")?.currentBalancePaise||0,N=m.find(t=>t.id==="ACC-UPI")?.currentBalancePaise||0,I=(m.find(t=>t.id==="ACC-WALLET")?.currentBalancePaise||0)+(m.find(t=>t.id==="ACC-AEPS")?.currentBalancePaise||0),a=b.totals;e.innerHTML=`
    <div class="module-header">
      ${J(d?.centreLogo)?`<img class="dash-centre-logo" src="${d.centreLogo}" alt="">`:""}
      <div class="module-title-group" style="flex:1;">
        <h1>${d?.centreName?`<span data-no-i18n>${l(d.centreName)}</span> — `:""}Financial Overview</h1>
        <p>Period: <strong>${l(u)}</strong> to <strong>${l(p)}</strong> • Real-time transaction & profitability metrics</p>
      </div>
      <div class="module-actions">
        ${a.totalCustomers===0?'<button class="btn btn-gold" id="dash-load-demo-btn" title="Load optional realistic acceptance dataset">Load Sample Data</button>':""}
        <button class="btn btn-outline" id="dash-workbench-btn">Document Workbench</button>
        <button class="btn btn-outline" id="dash-counter-close-btn">Counter Reconciliation</button>
        <button class="btn btn-primary" id="dash-new-bill-btn">+ New Counter Invoice</button>
      </div>
    </div>
    ${V}${D}
    ${at()}

    <!-- Clean Period Selector Bar -->
    <div class="filter-bar" style="justify-content:space-between;">
      <div class="pill-tabs" id="dash-period-tabs">
        ${[["today","Today"],["yesterday","Yesterday"],["week","7 Days"],["month","This Month"],["prev_month","Last Month"],["fy","Financial Year"],["all","All Time"],["custom","Custom"]].map(([t,o])=>`<button class="pill-tab ${k===t?"active":""}" data-preset="${t}">${o}</button>`).join("")}
      </div>
      <div style="display:${k==="custom"?"flex":"none"}; gap:8px; align-items:center;" id="dash-custom-dates">
        <input type="date" class="form-control" id="dash-date-from" value="${l(u)}" style="width:140px;">
        <span style="color:var(--color-text-muted);">to</span>
        <input type="date" class="form-control" id="dash-date-to" value="${l(p)}" style="width:140px;">
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
        <div class="kpi-value">${s(a.grossCollectionsPaise)}</div>
        <div class="kpi-sub">Govt Challan Pass-through: ${s(a.govtFeesTotalPaise)}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>Centre Service Revenue</span>
          <span class="kpi-dot"></span>
        </div>
        <div class="kpi-value">${s(a.centreServiceChargesPaise)}</div>
        <div class="kpi-sub">Pure operator service charges</div>
      </div>

      <div class="kpi-card success">
        <div class="kpi-label">
          <span>Actual Collections</span>
          <span class="kpi-dot"></span>
        </div>
        <div class="kpi-value">${s(a.actualCollectedPaise)}</div>
        <div class="kpi-sub">Cash, UPI, Bank & Wallet inflows</div>
      </div>

      <div class="kpi-card highlight">
        <div class="kpi-label">
          <span>True Service Contribution</span>
          <span class="badge badge-info">Net Profit: ${s(a.netOperatingProfitPaise)}</span>
        </div>
        <div class="kpi-value" style="color:var(--color-brand);">${s(a.totalServiceContributionPaise)}</div>
        <div class="kpi-sub">After expenses entered in Accounts, plus commissions</div>
      </div>
    </div>

    <!-- Unified 8-Metric Operational & Balance Strip (Uncluttered) -->
    <div class="metric-strip">
      <div class="metric-strip-item">
        <div class="metric-strip-label">Cash in Hand (Drawer)</div>
        <div class="metric-strip-val" style="color:var(--color-success);">${s(j)}</div>
        <div class="metric-strip-sub">Physical counter balance</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Bank, UPI & Wallets</div>
        <div class="metric-strip-val">${s(K+N+I)}</div>
        <div class="metric-strip-sub">UPI: ${s(N)} • Wallet: ${s(I)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Pending Customer Dues</div>
        <div class="metric-strip-val" style="color:${a.pendingCustomerDuesPaise>0?"var(--color-danger)":"var(--color-text)"};">${s(a.pendingCustomerDuesPaise)}</div>
        <div class="metric-strip-sub">Advances Held: ${s(a.customerAdvancesPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Commissions Earned</div>
        <div class="metric-strip-val">${s(a.commissionEarnedTotalPaise)}</div>
        <div class="metric-strip-sub">Recvd: ${s(a.commissionReceivedTotalPaise)} • Due: ${s(a.commissionPendingTotalPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Total Expenses</div>
        <div class="metric-strip-val">${s(a.totalExpensesPaise)}</div>
        <div class="metric-strip-sub">Purchases: ${s(a.directCostsTotalPaise)} • Other expenses: ${s(a.commonOperatingExpensesPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Applications Tracker</div>
        <div class="metric-strip-val">${a.pendingApplications} Pending</div>
        <div class="metric-strip-sub">${a.completedApplications} Completed / Approved</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Registered Customers</div>
        <div class="metric-strip-val">${a.totalCustomers} Citizens</div>
        <div class="metric-strip-sub">+${a.newCustomersInPeriod} New • Refunds Due: ${s(a.pendingRefundsPaise)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Print Volume</div>
        <div class="metric-strip-val">${a.totalPagesPrinted} Pages</div>
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
            ${b.rankings.mostProfitableServices.length===0?'<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--color-text-muted);">No service transactions recorded in this period. Click <strong>+ New Counter Invoice</strong> or <strong>Load Sample Data</strong> above to get started.</td></tr>':b.rankings.mostProfitableServices.map(t=>`
                  <tr>
                    <td>
                      <strong style="color:var(--color-text);">${l(t.serviceName)}</strong><br>
                      <small style="color:var(--color-text-muted);">${l(t.category)}</small>
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
  `,e.querySelectorAll("[data-dash-go]").forEach(t=>t.addEventListener("click",()=>r(t.getAttribute("data-dash-go")))),e.querySelectorAll("[data-dash-stock]").forEach(t=>t.addEventListener("click",()=>r("inventory",t.getAttribute("data-dash-stock")||void 0))),e.querySelector("#dash-new-bill-btn")?.addEventListener("click",()=>r("billing")),e.querySelector("#wn-hide")?.addEventListener("click",()=>{try{localStorage.setItem(L(),H)}catch{}h(e,r)}),e.querySelector("#wn-show")?.addEventListener("click",()=>{try{localStorage.removeItem(L())}catch{}h(e,r)}),e.querySelector("#wn-notes")?.addEventListener("click",async()=>{await r("help");const{renderHelpModule:t}=await import("./help.js");t(document.getElementById("workspace-content"),{docId:"release",lang:E()}).catch(()=>{})}),e.querySelector("#dash-counter-close-btn")?.addEventListener("click",()=>r("accounts")),e.querySelector("#dash-workbench-btn")?.addEventListener("click",()=>r("studio")),e.querySelector("#dash-go-reports")?.addEventListener("click",()=>r("reports")),e.querySelector("#dash-load-demo-btn")?.addEventListener("click",async()=>{await tt(),await h(e,r)}),e.querySelectorAll("#dash-period-tabs .pill-tab").forEach(t=>{t.addEventListener("click",()=>{k=t.getAttribute("data-preset"),h(e,r)})}),e.querySelector("#dash-apply-custom")?.addEventListener("click",()=>{T=e.querySelector("#dash-date-from")?.value||"",G=e.querySelector("#dash-date-to")?.value||"",h(e,r)});const B=b.rankings.mostProfitableServices.slice(0,6);$(e.querySelector("#chart-service-profit"),{type:"bar",labels:B.map(t=>t.serviceName.slice(0,14)),values:B.map(t=>A(t.serviceContributionPaise))});const y=new Map;x.filter(t=>t.status!=="CANCELLED"&&O(t.date,u,p)).forEach(t=>{const o=t.paymentMode||"CASH";y.set(o,(y.get(o)||0)+A(t.grandTotalPaise))}),$(e.querySelector("#chart-payment-modes"),{type:"doughnut",labels:Array.from(y.keys()),values:Array.from(y.values())});const g=new Map;x.filter(t=>t.status!=="CANCELLED"&&O(t.date,u,p)).forEach(t=>{g.set(t.date,(g.get(t.date)||0)+A(t.grandTotalPaise))});const R=Array.from(g.keys()).sort();$(e.querySelector("#chart-daily-trend"),{type:"line",labels:R.map(t=>t.slice(5)),values:R.map(t=>g.get(t))});const f=new Map;U.forEach(t=>{const o=t.status||"New";f.set(o,(f.get(o)||0)+1)}),$(e.querySelector("#chart-app-status"),{type:"doughnut",labels:Array.from(f.keys()),values:Array.from(f.values())})}export{h as renderDashboardModule};
