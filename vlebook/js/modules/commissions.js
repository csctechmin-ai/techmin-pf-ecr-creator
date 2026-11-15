import{getAllRecords as M,putManyAtomic as R}from"../core/db.js";import{uid as f,todayISO as m,formatINR as i,toPaise as v,esc as r}from"../core/utils.js";const O=["CSC e-Governance Services India Ltd","Kerala State IT Mission (Akshaya)","MahaOnline (Aaple Sarkar / Maha e-Seva)","Banking Partner / BC Network","Insurance Partner (PMFBY / LIC / General)","Loan DSA / Financial Services","Other Service Provider"],p=s=>Number(s.tdsPaise||0),u=s=>Math.max(0,(s.earnedPaise||0)-p(s)-(s.receivedPaise||0));async function k(s){const[y,E]=await Promise.all([M("commissions"),M("accounts")]),d=[...y].sort((e,t)=>String(t.date||"").localeCompare(String(e.date||""))),A=d.reduce((e,t)=>e+(t.expectedPaise||0),0),T=d.reduce((e,t)=>e+(t.earnedPaise||0),0),L=d.reduce((e,t)=>e+(t.receivedPaise||0),0),D=d.reduce((e,t)=>e+p(t),0),w=d.reduce((e,t)=>e+u(t),0),c=new Map;d.forEach(e=>{const t=e.partnerName||"General Partner",a=c.get(t)||{partner:t,earnedPaise:0,tdsPaise:0,receivedPaise:0,pendingPaise:0,count:0};a.count+=1,a.earnedPaise+=e.earnedPaise||0,a.receivedPaise+=e.receivedPaise||0,a.tdsPaise+=p(e),a.pendingPaise+=u(e),c.set(t,a)}),s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Commission Management & Partner Reconciliation</h1>
        <p>Track expected, earned, and received commissions across CSC, Akshaya, Banking, Insurance & DSA partners</p>
      </div>
    </div>

    <div class="grid-kpi">
      <div class="kpi-card navy">
        <div class="kpi-label">Commission Earned</div>
        <div class="kpi-value">${i(T)}</div>
        <div class="kpi-sub">Expected per slabs: ${i(A)}</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Commission Received</div>
        <div class="kpi-value">${i(L)}</div>
        <div class="kpi-sub">Credited to Bank / Wallet</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">TDS Deducted by Partners</div>
        <div class="kpi-value">${i(D)}</div>
        <div class="kpi-sub">Tax credit — verify in Form 26AS</div>
      </div>
      <div class="kpi-card warning">
        <div class="kpi-label">Pending Partner Payout</div>
        <div class="kpi-value">${i(w)}</div>
        <div class="kpi-sub">Awaiting payout settlement</div>
      </div>
    </div>

    <div class="grid-sidebar-right">
      <div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">Partner-Wise Reconciliation Summary</div>
          </div>
          <div class="table-wrap" style="margin-bottom:16px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Partner / Source</th>
                  <th class="num">Entries</th>
                  <th class="num">Commission Earned</th>
                  <th class="num">TDS</th>
                  <th class="num">Actual Received</th>
                  <th class="num">Pending Receivable</th>
                </tr>
              </thead>
              <tbody>
                ${c.size===0?'<tr><td colspan="6" style="text-align:center; padding:14px;">No partner commissions logged yet.</td></tr>':Array.from(c.values()).map(e=>`
                      <tr>
                        <td><strong>${r(e.partner)}</strong></td>
                        <td class="num">${e.count}</td>
                        <td class="num">${i(e.earnedPaise)}</td>
                        <td class="num">${i(e.tdsPaise)}</td>
                        <td class="num" style="color:var(--color-success);">${i(e.receivedPaise)}</td>
                        <td class="num" style="color:${e.pendingPaise>0?"var(--color-warning)":"var(--color-text-muted)"}; font-weight:700;">${i(e.pendingPaise)}</td>
                      </tr>`).join("")}
              </tbody>
            </table>
          </div>

          <div class="card-title" style="margin-bottom:10px;">Detailed Commission Ledger</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date & Ref</th>
                  <th>Partner & Service</th>
                  <th class="num">Earned</th>
                  <th class="num">TDS</th>
                  <th class="num">Received</th>
                  <th class="num">Pending</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${d.map(e=>{const t=u(e);return`
                  <tr>
                    <td><strong>${r(e.date)}</strong><br><small style="font-family:var(--font-mono); color:var(--color-text-muted);">${r(e.txRef||e.id)}</small></td>
                    <td><strong>${r(e.partnerName)}</strong><br><small style="color:var(--color-text-muted);">${r(e.serviceName||e.category||"")} (${r(e.slabInfo||"")})</small></td>
                    <td class="num">${i(e.earnedPaise)}</td>
                    <td class="num">${i(p(e))}${e.tdsPercent?`<br><small style="color:var(--color-text-muted);">${r(e.tdsPercent)}%</small>`:""}</td>
                    <td class="num" style="color:var(--color-success);">${i(e.receivedPaise)}</td>
                    <td class="num" style="color:${t>0?"var(--color-danger)":"var(--color-success)"}; font-weight:700;">${i(t)}</td>
                    <td>
                      ${t>0?`<button class="btn btn-xs btn-teal" data-settle-comm="${r(e.id)}">Mark Received</button>`:'<span class="badge badge-success">Settled</span>'}
                    </td>
                  </tr>`}).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div class="card" data-autosave-scope="commission_form">
          <div class="card-header">
            <div class="card-title">Record Partner Commission Entry</div>
          </div>
          <form id="comm-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <div class="form-group">
              <label class="form-label">Partner / Source</label>
              <select class="form-control" name="partnerName">
                ${O.map(e=>`<option value="${r(e)}">${r(e)}</option>`).join("")}
              </select>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Service / Scheme Name <span class="req">*</span></label>
                <input type="text" class="form-control" name="serviceName" required placeholder="e.g. PMFBY Crop Insurance Batch">
              </div>
              <div class="form-group">
                <label class="form-label">Statement / Tx Ref</label>
                <input type="text" class="form-control" name="txRef" placeholder="e.g. PAYOUT-NOV-09">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Expected (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="expected" value="250">
              </div>
              <div class="form-group">
                <label class="form-label">Earned (₹) <span class="req">*</span></label>
                <input type="number" step="0.01" min="0" class="form-control" name="earned" required value="250">
              </div>
              <div class="form-group">
                <label class="form-label">TDS % (Sec 194H)</label>
                <input type="number" step="0.01" min="0" max="100" class="form-control" name="tdsPercent" id="comm-tds" value="2">
                <span class="form-hint" id="comm-net-hint"></span>
              </div>
              <div class="form-group">
                <label class="form-label">Received Now (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="received" id="comm-received" value="245">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Credit Account (If Received)</label>
                <select class="form-control" name="accountId">
                  ${E.map(e=>`<option value="${r(e.id)}" ${e.id==="ACC-WALLET"?"selected":""}>${r(e.name)}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" name="date" value="${m()}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Commission Slab / Remarks</label>
              <input type="text" class="form-control" name="slabInfo" placeholder="e.g. ₹25 × 10 policies">
            </div>
            <button type="submit" class="btn btn-primary">Save Commission Record</button>
          </form>
        </div>
      </div>
    </div>
  `;const h=s.querySelector('#comm-entry-form [name="earned"]'),S=s.querySelector("#comm-tds"),x=s.querySelector("#comm-received"),$=s.querySelector("#comm-net-hint"),g=e=>{const t=v(h?.value||0),a=Math.min(100,Math.max(0,Number(S?.value||0))),o=Math.round(t*a/100);$&&($.textContent=`TDS ${i(o)} · Net payable ${i(t-o)}`),e&&x&&(x.value=((t-o)/100).toFixed(2))};h?.addEventListener("input",()=>g(!0)),S?.addEventListener("input",()=>g(!0)),g(!1),s.querySelectorAll("[data-settle-comm]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-settle-comm"),a=y.find(l=>l.id===t);if(!a)return;const o=u(a);o<=0||(await R([{storeName:"commissions",record:{...a,receivedPaise:(a.receivedPaise||0)+o,pendingPaise:0,paymentDate:m(),status:"RECEIVED"}},{storeName:"transactions",record:{id:f("TXN"),date:m(),type:"COMMISSION",category:`Commission Payout (${a.partnerName})`,accountId:a.accountId||"ACC-WALLET",grossPaise:o,collectedPaise:o,govtFeePaise:0,thirdPartyPaise:0,serviceChargePaise:0,directCostPaise:0,commissionPaise:0,taxPaise:0,paymentMode:"WALLET",reference:a.txRef||a.id,notes:`Settled pending commission for ${a.serviceName}`}}]),await k(s))})}),s.querySelector("#comm-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),a=v(t.get("earned")),o=Math.min(100,Math.max(0,Number(t.get("tdsPercent")||0))),l=Math.round(a*o/100),n=v(t.get("received")),C=Math.max(0,a-l-n),P=t.get("date")||m(),N=t.get("accountId")||"ACC-WALLET",b=f("COM"),I=[{storeName:"commissions",record:{id:b,date:P,partnerName:t.get("partnerName"),serviceName:t.get("serviceName").trim(),txRef:t.get("txRef").trim()||b,expectedPaise:v(t.get("expected")),earnedPaise:a,tdsPercent:o,tdsPaise:l,receivedPaise:n,pendingPaise:C,slabInfo:t.get("slabInfo").trim(),paymentDate:n>0?P:null,accountId:N,status:C===0?"RECEIVED":"PARTIAL"}}];n>0&&I.push({storeName:"transactions",record:{id:f("TXN"),date:P,type:"COMMISSION",category:`Commission Payout (${t.get("partnerName")})`,accountId:N,grossPaise:n,collectedPaise:n,govtFeePaise:0,thirdPartyPaise:0,serviceChargePaise:0,directCostPaise:0,commissionPaise:0,taxPaise:0,paymentMode:"WALLET",reference:t.get("txRef").trim()||b,notes:`Commission received for ${t.get("serviceName")}`}}),await R(I),await k(s)})}export{O as COMMISSION_PARTNERS,k as renderCommissionsModule};
