import{computeBusinessIntelligence as Z,computeAccountBalances as J}from"../core/accounting.js";import{getAllRecords as h,getRecord as X}from"../core/db.js";import{isValidLogo as tt}from"../core/branding.js";import{formatINR as s,fromPaise as E,resolveDateRange as et,isDateInRange as q,renderCanvasChart as P,esc as d}from"../core/utils.js";import{loadOptionalAcceptanceDataset as st}from"../core/sample-data.js";import{APP_VERSION as O,APP_UPDATED as M}from"../core/utils.js";import{getLang as A}from"../core/i18n.js";import{getCurrentUser as T}from"../core/auth.js";const V=`${O}|${M}`,L=()=>`vlebook_wn_hidden_${T()?.username||""}`;function at(){try{return localStorage.getItem(L())===V}catch{return!1}}function it(){const e=["hi","ml"].includes(A())?A():"en",r=M.split("-").reverse().join("-"),c=`<span class="wn-ver"><span>VLE360</span> <strong data-no-i18n>${O}</strong> · <span>Updated</span> <span data-no-i18n>${r}</span></span>`;return at()?`<div class="dash-wn-mini" id="dash-whatsnew">${c} · <button type="button" class="btn-link" id="wn-show">Show what's new</button></div>`:`<div class="card dash-whatsnew" id="dash-whatsnew">
      <img class="wn-gif" src="help/learn/img/whatsnew-${e}.gif" alt="What's new in VLE360" loading="lazy" width="640" height="360">
      <div class="wn-body">
        ${c}
        <h3>What's new</h3>
        <ul>
          <li>VLEBook is now VLE360 — The Operating System for VLEs (your data stays as it is)</li>
          <li>New: customers send photos and PDFs from their phone by QR, at no extra cost</li>
          <li>UPI QR with the amount due on bills; Dues list with WhatsApp reminders</li>
          <li>Quick size to an exact KB, photo clean-up, passport background and joint photo</li>
          <li>Rate list, family members, expiry and exam-date reminders, new templates</li>
        </ul>
        <div class="wn-actions"><button type="button" class="btn btn-sm btn-primary" id="wn-notes">All release notes</button><button type="button" class="btn btn-sm btn-outline" id="wn-hide">Hide until next update</button></div>
      </div>
    </div>`}const H=()=>`vlebook_seen_rename360_${T()?.username||""}`;async function rt(){try{if(localStorage.getItem(H()))return}catch{return}let e="";try{e=localStorage.getItem("vle360_first_run")||""}catch{}const c=(e?await h("audit_logs"):[]).some(n=>{const o=String(n.timestamp||n.createdAt||"");return o&&Date.parse(o)<Date.parse(e)-6e4});try{localStorage.setItem(H(),new Date().toISOString())}catch{}c&&import("./books-kit.js").then(({modal:n})=>{const o=n("VLEBook is now VLE360",`<div class="rn-360"><img src="icons/vle360-logo.svg" alt="VLE360 — The Operating System for VLEs" width="300" height="72" style="max-width:100%">
      <p><b>Why the name changed</b></p>
      <ul>
        <li>Another company sells a different product called “VLE Book” to centres like yours. A clearly different name avoids mix-ups when you search for help, recommend the software or pay for your plan.</li>
        <li>VLE360 is a name that belongs only to this software and to Techmin.</li>
        <li>“360” because the software now covers the whole centre: billing and books, customers, applications, documents and studio, reminders and partner programmes.</li>
      </ul>
      <p><b>What does not change:</b> your data, your licence and plan price, the web address, your backups, your sign-in and how every screen works. Nothing needs to be done.</p>
      <div style="text-align:right"><button type="button" class="btn btn-primary" id="rn-ok">OK</button></div></div>`);o.el.querySelector("#rn-ok").addEventListener("click",o.close)})}let $="today",U="",W="";async function b(e,r){const c=await X("settings","CENTRE_CONFIG"),{start:n,end:o}=et($,U,W),[y,m,x,G,F]=await Promise.all([Z(n,o),J(),h("bills"),h("pending_work"),h("inventory")]),{stockAlerts:K}=await import("../core/stock.js"),p=K(F,c),j=(p.negative.length?`<div class="callout danger"><div><strong>Negative stock:</strong> ${p.negative.map(t=>`<span data-no-i18n>${d(t.name)}</span> (${d(t.currentStock)} ${d(t.unit||"")})`).join(", ")}. <button class="btn btn-xs btn-outline" data-dash-stock>Open Stock & Inventory</button></div></div>`:"")+(p.checkDue?`<div class="callout warning"><div><strong>Physical stock check due:</strong> ${p.last?`last check ${d(p.last)} (${p.daysSince} days ago)`:"no physical stock check yet"}. <button class="btn btn-xs btn-outline" data-dash-stock="PHYSICAL">Count stock now</button></div></div>`:"");let D="";try{const{can:t,canAccess:u}=await import("../core/auth.js"),C=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date),k=[];if(u("reminders")){const S=(await h("reminders")).filter(v=>v.status==="ACTIVE"),i=S.filter(v=>(v.dueDate||v.expiryDate)<C).length,l=S.filter(v=>(v.dueDate||v.expiryDate)===C).length;(i||l)&&k.push(`<div class="callout warning"><div><strong>Renewal reminders:</strong> ${i} overdue, ${l} due today. <button class="btn btn-xs btn-outline" data-dash-go="reminders">Open reminders</button></div></div>`)}if(u("privacy")){const i=await(await import("../core/privacy.js")).privacyDashboard(C),l=[];i.custody.OVERDUE&&l.push(`${i.custody.OVERDUE} original document(s) overdue for return`),i.custody.MISSING&&l.push(`${i.custody.MISSING} reported missing`),i.custody.HELD_LONG&&l.push(`${i.custody.HELD_LONG} held for a long time`),i.custody.NO_ACK&&l.push(`${i.custody.NO_ACK} receipt(s) not acknowledged`),t("manage_privacy")&&i.retentionDue&&l.push(`${i.retentionDue} record(s) past their retention period`),t("handle_privacy_requests")&&i.openRequests&&l.push(`${i.openRequests} open customer privacy request(s)${i.overdueRequests?` — ${i.overdueRequests} older than 30 days`:""}`),l.length&&k.push(`<div class="callout ${i.custody.OVERDUE||i.custody.MISSING||i.overdueRequests?"danger":"warning"}"><div><strong>Originals & privacy:</strong> ${l.join(" · ")}. <button class="btn btn-xs btn-outline" data-dash-go="privacy">Open</button></div></div>`)}const{kvGet:z}=await import("../core/devicestore.js"),B=Number(await z("supportUpdates")||0);B&&k.push(`<div class="callout info"><div><strong>Techmin support:</strong> ${B} ticket(s) with a new reply. <button class="btn btn-xs btn-outline" data-dash-go="support">Open Help & Support</button></div></div>`),D=k.join("")}catch{}const Y=m.find(t=>t.id==="ACC-CASH")?.currentBalancePaise||0,Q=m.find(t=>t.id==="ACC-BANK")?.currentBalancePaise||0,I=m.find(t=>t.id==="ACC-UPI")?.currentBalancePaise||0,N=(m.find(t=>t.id==="ACC-WALLET")?.currentBalancePaise||0)+(m.find(t=>t.id==="ACC-AEPS")?.currentBalancePaise||0),a=y.totals;e.innerHTML=`
    <div class="module-header">
      ${tt(c?.centreLogo)?`<img class="dash-centre-logo" src="${c.centreLogo}" alt="">`:""}
      <div class="module-title-group" style="flex:1;">
        <h1>${c?.centreName?`<span data-no-i18n>${d(c.centreName)}</span> — `:""}Financial Overview</h1>
        <p>Period: <strong>${d(n)}</strong> to <strong>${d(o)}</strong> • Real-time transaction & profitability metrics</p>
      </div>
      <div class="module-actions">
        ${a.totalCustomers===0?'<button class="btn btn-gold" id="dash-load-demo-btn" title="Load optional realistic acceptance dataset">Load Sample Data</button>':""}
        <button class="btn btn-outline" id="dash-workbench-btn">Document Workbench</button>
        <button class="btn btn-outline" id="dash-counter-close-btn">Counter Reconciliation</button>
        <button class="btn btn-primary" id="dash-new-bill-btn">+ New Counter Invoice</button>
      </div>
    </div>
    ${j}${D}
    ${it()}

    <!-- Clean Period Selector Bar -->
    <div class="filter-bar" style="justify-content:space-between;">
      <div class="pill-tabs" id="dash-period-tabs">
        ${[["today","Today"],["yesterday","Yesterday"],["week","7 Days"],["month","This Month"],["prev_month","Last Month"],["fy","Financial Year"],["all","All Time"],["custom","Custom"]].map(([t,u])=>`<button class="pill-tab ${$===t?"active":""}" data-preset="${t}">${u}</button>`).join("")}
      </div>
      <div style="display:${$==="custom"?"flex":"none"}; gap:8px; align-items:center;" id="dash-custom-dates">
        <input type="date" class="form-control" id="dash-date-from" value="${d(n)}" style="width:140px;">
        <span style="color:var(--color-text-muted);">to</span>
        <input type="date" class="form-control" id="dash-date-to" value="${d(o)}" style="width:140px;">
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
        <div class="metric-strip-val" style="color:var(--color-success);">${s(Y)}</div>
        <div class="metric-strip-sub">Physical counter balance</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Bank, UPI & Wallets</div>
        <div class="metric-strip-val">${s(Q+I+N)}</div>
        <div class="metric-strip-sub">UPI: ${s(I)} • Wallet: ${s(N)}</div>
      </div>
      <div class="metric-strip-item">
        <div class="metric-strip-label">Pending Customer Dues</div>
        <div class="metric-strip-val" style="color:${a.pendingCustomerDuesPaise>0?"var(--color-danger)":"var(--color-text)"};">${s(a.pendingCustomerDuesPaise)}</div>
        <div class="metric-strip-sub">Advances Held: ${s(a.customerAdvancesPaise)}${a.pendingCustomerDuesPaise>0?' · <button type="button" class="btn btn-xs btn-outline" id="dash-open-dues">See dues</button>':""}</div>
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
            ${y.rankings.mostProfitableServices.length===0?'<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--color-text-muted);">No service transactions recorded in this period. Click <strong>+ New Counter Invoice</strong> or <strong>Load Sample Data</strong> above to get started.</td></tr>':y.rankings.mostProfitableServices.map(t=>`
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
  `,e.querySelectorAll("[data-dash-go]").forEach(t=>t.addEventListener("click",()=>r(t.getAttribute("data-dash-go")))),e.querySelectorAll("[data-dash-stock]").forEach(t=>t.addEventListener("click",()=>r("inventory",t.getAttribute("data-dash-stock")||void 0))),e.querySelector("#dash-new-bill-btn")?.addEventListener("click",()=>r("billing")),e.querySelector("#dash-open-dues")?.addEventListener("click",async()=>{(await import("./customers.js")).showDuesNext(),r("customers")}),rt().catch(()=>{}),e.querySelector("#wn-hide")?.addEventListener("click",()=>{try{localStorage.setItem(L(),V)}catch{}b(e,r)}),e.querySelector("#wn-show")?.addEventListener("click",()=>{try{localStorage.removeItem(L())}catch{}b(e,r)}),e.querySelector("#wn-notes")?.addEventListener("click",async()=>{await r("help");const{renderHelpModule:t}=await import("./help.js");t(document.getElementById("workspace-content"),{docId:"release",lang:A()}).catch(()=>{})}),e.querySelector("#dash-counter-close-btn")?.addEventListener("click",()=>r("accounts")),e.querySelector("#dash-workbench-btn")?.addEventListener("click",()=>r("studio")),e.querySelector("#dash-go-reports")?.addEventListener("click",()=>r("reports")),e.querySelector("#dash-load-demo-btn")?.addEventListener("click",async()=>{await st(),await b(e,r)}),e.querySelectorAll("#dash-period-tabs .pill-tab").forEach(t=>{t.addEventListener("click",()=>{$=t.getAttribute("data-preset"),b(e,r)})}),e.querySelector("#dash-apply-custom")?.addEventListener("click",()=>{U=e.querySelector("#dash-date-from")?.value||"",W=e.querySelector("#dash-date-to")?.value||"",b(e,r)});const R=y.rankings.mostProfitableServices.slice(0,6);P(e.querySelector("#chart-service-profit"),{type:"bar",labels:R.map(t=>t.serviceName.slice(0,14)),values:R.map(t=>E(t.serviceContributionPaise))});const g=new Map;x.filter(t=>t.status!=="CANCELLED"&&q(t.date,n,o)).forEach(t=>{const u=t.paymentMode||"CASH";g.set(u,(g.get(u)||0)+E(t.grandTotalPaise))}),P(e.querySelector("#chart-payment-modes"),{type:"doughnut",labels:Array.from(g.keys()),values:Array.from(g.values())});const f=new Map;x.filter(t=>t.status!=="CANCELLED"&&q(t.date,n,o)).forEach(t=>{f.set(t.date,(f.get(t.date)||0)+E(t.grandTotalPaise))});const _=Array.from(f.keys()).sort();P(e.querySelector("#chart-daily-trend"),{type:"line",labels:_.map(t=>t.slice(5)),values:_.map(t=>f.get(t))});const w=new Map;G.forEach(t=>{const u=t.status||"New";w.set(u,(w.get(u)||0)+1)}),P(e.querySelector("#chart-app-status"),{type:"doughnut",labels:Array.from(w.keys()),values:Array.from(w.values())})}export{b as renderDashboardModule};
