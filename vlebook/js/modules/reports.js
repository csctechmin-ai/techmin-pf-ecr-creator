import{computeBusinessIntelligence as R}from"../core/accounting.js";import{getAllRecords as S,getRecord as y,putRecord as $}from"../core/db.js";import{todayISO as x,resolveDateRange as A,isDateInRange as f,formatINR as t,fromPaise as N,esc as v,exportToCSV as O,exportToExcel as I,generateSimplePDFBlob as k,downloadFile as E}from"../core/utils.js";let P="SERVICE_PROFIT",h="month",L="",w="";async function C(r){const{start:o,end:n}=A(h,L,w),[l,c,g,e,b,m]=await Promise.all([R(o,n),y("settings","CENTRE_CONFIG"),S("bills"),S("customers"),S("payments"),S("commissions")]),a=T(P,l,g.filter(i=>i.status!=="CANCELLED"&&f(i.date,o,n)),e,b,m.filter(i=>f(i.date,o,n))),u=l.totals;r.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Business Intelligence, Real Profit Engine & Financial Reports</h1>
        <p>Centralized financial & operational statements (${v(o)} to ${v(n)})</p>
      </div>
      <div class="module-actions">
        <button class="btn btn-sm btn-primary" id="rep-exp-pdf">Export PDF</button>
        <button class="btn btn-sm btn-teal" id="rep-exp-xls">Export Excel</button>
        <button class="btn btn-sm btn-outline" id="rep-exp-csv">Export CSV</button>
        <button class="btn btn-sm btn-outline" id="rep-exp-json">{ } JSON</button>
        <button class="btn btn-sm btn-outline" id="rep-exp-txt">TXT</button>
      </div>
    </div>

    <!-- Filter & Expense Allocation Rule Bar -->
    <div class="card" style="padding:12px 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div class="pill-tabs" id="rep-date-tabs">
          ${[["today","Today"],["week","This Week"],["month","This Month"],["fy","Financial Year"],["all","All Time"]].map(([i,s])=>`<button class="pill-tab ${h===i?"active":""}" data-preset="${i}">${s}</button>`).join("")}
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <label class="form-label" style="margin:0;">OpEx Allocation Rule:</label>
          <select class="form-control" id="rep-alloc-method" style="width:210px;">
            <option value="REVENUE_SHARE" ${c?.expenseAllocationMethod==="REVENUE_SHARE"?"selected":""}>Proportional to Service Revenue</option>
            <option value="TX_COUNT" ${c?.expenseAllocationMethod==="TX_COUNT"?"selected":""}>Proportional to Transaction Count</option>
            <option value="EQUAL" ${c?.expenseAllocationMethod==="EQUAL"?"selected":""}>Equal Split Across Active Services</option>
          </select>
        </div>
      </div>

      <div class="pill-tabs" id="rep-type-tabs" style="margin-top:10px;">
        ${[["SERVICE_PROFIT","Service-Wise Real Profit BI"],["PNL","Profit & Loss Statement"],["CUSTOMER_DUES","Customer Dues, Advances & Refunds"],["COMMISSIONS","Partner Commission Reconciliation"],["GST_SUMMARY","GST Sales Summary"]].map(([i,s])=>`<button class="pill-tab ${P===i?"active":""}" data-rpt="${i}">${s}</button>`).join("")}
      </div>
    </div>

    <!-- BI Highlights Strip -->
    <div class="grid-kpi">
      <div class="kpi-card navy">
        <div class="kpi-label">Most Profitable Service</div>
        <div class="kpi-value" style="font-size:15px;">${v(l.rankings.mostProfitableServices[0]?.serviceName||"—")}</div>
        <div class="kpi-sub">Contribution: ${t(l.rankings.mostProfitableServices[0]?.serviceContributionPaise||0)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Highest Volume Service</div>
        <div class="kpi-value" style="font-size:15px;">${v(l.rankings.highestVolumeServices[0]?.serviceName||"—")}</div>
        <div class="kpi-sub">${l.rankings.highestVolumeServices[0]?.qtyCount||0} units delivered</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Total Service Contribution</div>
        <div class="kpi-value">${t(u.totalServiceContributionPaise)}</div>
        <div class="kpi-sub">Before Common OpEx (${t(u.commonOperatingExpensesPaise)})</div>
      </div>
      <div class="kpi-card gold">
        <div class="kpi-label">Net Operating Profit</div>
        <div class="kpi-value">${t(u.netOperatingProfitPaise)}</div>
        <div class="kpi-sub">True Bottom-Line Earnings</div>
      </div>
    </div>

    <!-- Active Report Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">${v(a.title)}</div>
        <span class="badge badge-info">${a.rows.length} rows</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              ${a.headers.map(i=>`<th>${v(i)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${a.rows.length===0?`<tr><td colspan="${a.headers.length}" style="text-align:center; padding:18px; color:var(--color-text-muted);">No records found for this report in the selected period.</td></tr>`:a.rows.map(i=>`
                  <tr>
                    ${i.map(s=>`<td>${v(s)}</td>`).join("")}
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,r.querySelectorAll("#rep-date-tabs .pill-tab").forEach(i=>{i.addEventListener("click",()=>{h=i.getAttribute("data-preset"),C(r)})}),r.querySelectorAll("#rep-type-tabs .pill-tab").forEach(i=>{i.addEventListener("click",()=>{P=i.getAttribute("data-rpt"),C(r)})}),r.querySelector("#rep-alloc-method")?.addEventListener("change",async i=>{await $("settings",{...c,expenseAllocationMethod:i.target.value}),await C(r)});const p=`VLEBook_${P}_${x()}`;r.querySelector("#rep-exp-csv")?.addEventListener("click",()=>{O(a.headers,a.rows,`${p}.csv`)}),r.querySelector("#rep-exp-xls")?.addEventListener("click",()=>{I(P,a.headers,a.rows,`${p}.xls`)}),r.querySelector("#rep-exp-pdf")?.addEventListener("click",()=>{const i=k(a.title,`Period: ${o} to ${n} | Generated: ${x()}`,a.headers,a.rows,[`Net Operating Profit: Rs.${N(u.netOperatingProfitPaise).toFixed(2)}`]);E(i,`${p}.pdf`,"application/pdf")}),r.querySelector("#rep-exp-json")?.addEventListener("click",()=>{E(JSON.stringify({report:a.title,period:{start:o,end:n},headers:a.headers,rows:a.rows},null,2),`${p}.json`,"application/json")}),r.querySelector("#rep-exp-txt")?.addEventListener("click",()=>{const i=[a.title,`Period: ${o} to ${n}`,"-".repeat(80),a.headers.join(" | "),"-".repeat(80),...a.rows.map(s=>s.join(" | "))].join(`
`);E(i,`${p}.txt`,"text/plain")})}function T(r,o,n,l,c,g){if(r==="SERVICE_PROFIT")return{title:"Service-Wise Real Profit & Contribution Analysis",headers:["Service Name","Qty","Customer Collection","Less Govt Fee","Centre Service Charge","Less linked expenses","Add Comm. Earned","Service Contribution","Less Alloc. OpEx","Net Operating Profit","Margin %"],rows:o.rankings.mostProfitableServices.map(e=>[e.serviceName,String(e.qtyCount),t(e.customerCollectionPaise),t(e.govtFeePaise+e.thirdPartyPaise),t(e.serviceChargePaise),t(e.directCostPaise),t(e.commissionEarnedPaise),t(e.serviceContributionPaise),t(e.allocatedOpExPaise),t(e.netOperatingProfitPaise),`${e.marginPercent}%`])};if(r==="PNL"){const e=o.totals;return{title:"True Profit & Loss Statement (Separating Govt Pass-Through Collections)",headers:["Accounting Line Item","Category","Amount (INR)","Notes"],rows:[["1. Gross Customer Collections (Billed)","Inflow",t(e.grossCollectionsPaise),"Includes Govt Challan & Taxes"],["2. Less: Government & Statutory Challan Fees","Pass-Through",t(e.govtFeesTotalPaise),"Not Centre Revenue"],["3. Less: Third-Party Portal Charges","Pass-Through",t(e.thirdPartyTotalPaise),"Pass-through cost"],["4. Equals: Centre Net Service Charges","Core Revenue",t(e.centreServiceChargesPaise),"Taxable Operator Earnings"],["5. Add: Partner & AEPS Commissions Earned","Commission Income",t(e.commissionEarnedTotalPaise),`Received: ${t(e.commissionReceivedTotalPaise)}`],["6. Less: Purchases & direct expenses","Expenses",t(e.directCostsTotalPaise),"Paper, toner, PVC etc. as entered in Accounts (no separate per-service cost)"],["7. Equals: Total Service Contribution (Gross Profit)","Contribution",t(e.totalServiceContributionPaise),"4 + 5 - 6"],["8. Less: Common Operating Expenses (OpEx)","Operating Expense",t(e.commonOperatingExpensesPaise),"Rent, broadband, electricity, salary"],["9. Equals: Estimated Net Operating Profit","Net Bottom-Line",t(e.netOperatingProfitPaise),"7 - 8"]]}}return r==="CUSTOMER_DUES"?{title:"Customer Outstanding Dues, Advances & Pending Refunds Report",headers:["Customer ID","Customer Name","Mobile","Total Billed","Outstanding Due","Available Advance","Pending Refund"],rows:l.map(e=>{const b=n.filter(s=>s.customerId===e.id),m=c.filter(s=>s.customerId===e.id),a=b.reduce((s,d)=>s+(d.grandTotalPaise||0),0),u=b.reduce((s,d)=>s+(d.duePaise||0),0),p=Math.max(0,m.filter(s=>s.type==="ADVANCE").reduce((s,d)=>s+(d.amountPaise||0),0)-m.filter(s=>s.type==="ADVANCE_ADJUST").reduce((s,d)=>s+(d.amountPaise||0),0)),i=m.filter(s=>s.type==="PENDING_REFUND").reduce((s,d)=>s+(d.amountPaise||0),0);return[e.id,e.name,e.mobile,t(a),t(u),t(p),t(i)]})}:r==="COMMISSIONS"?{title:"Commission Earned vs Received Partner Reconciliation",headers:["Date","Partner","Service / Batch","Reference","Expected","Earned","Received","Pending"],rows:g.map(e=>[e.date,e.partnerName,e.serviceName||e.category||"",e.txRef||e.id,t(e.expectedPaise||0),t(e.earnedPaise||0),t(e.receivedPaise||0),t(Math.max(0,(e.earnedPaise||0)-(e.receivedPaise||0)))])}:r==="GST_SUMMARY"?{title:"GST Sales & Taxable Service Charge Summary",headers:["Invoice No","Date","Customer","Taxable Service Charge","CGST","SGST","IGST","Total Invoice"],rows:n.map(e=>[e.invoiceNo,e.date,e.customerName,t(e.serviceChargeTotalPaise),t(e.cgstPaise||0),t(e.sgstPaise||0),t(e.igstPaise||0),t(e.grandTotalPaise)])}:T("SERVICE_PROFIT",o,n,l,c,g)}export{C as renderReportsModule};
