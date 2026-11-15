import{getAllRecords as k,putRecord as N,deleteRecord as x}from"../core/db.js";import{uid as T,todayISO as P,formatINR as i,toPaise as s,fromPaise as S,esc as o}from"../core/utils.js";import{aepsCashEffect as n}from"../core/accounting.js";const R=["AEPS Withdrawal","Micro-ATM Withdrawal","Cash Deposit","Aadhaar Pay","Domestic Money Transfer","BBPS Bill Payment","AEPS Mini Statement","AEPS Balance Enquiry","Account Opening Assistance"],B={CASH_OUT:"Cash drawer ↓ · AEPS wallet ↑",CASH_IN:"Cash drawer ↑ · AEPS wallet ↓",WALLET_IN:"AEPS wallet ↑ (no cash)",NONE:"No cash movement"};function $(a,u,l=0){const r=Number(u||0);return a==="FIXED"?s(l||10):a==="PERCENT"?s(r*(Number(l)||.4)/100):a==="SLAB"?r<=0?s(2):r<=500?s(2):r<=1e3?s(4.5):r<=2e3?s(9):r<=3e3?s(13):s(15):s(l||0)}async function y(a){const l=[...await k("aeps_records")].sort((e,t)=>String(t.createdAt||t.date).localeCompare(String(e.createdAt||e.date))),r=l.reduce((e,t)=>e+(t.txAmountPaise||0),0),A=l.filter(e=>n(e.txType)==="CASH_OUT").reduce((e,t)=>e+(t.txAmountPaise||0),0),h=l.filter(e=>n(e.txType)==="CASH_IN").reduce((e,t)=>e+(t.txAmountPaise||0),0),C=l.reduce((e,t)=>e+(t.portalCommissionPaise||0),0),E=l.reduce((e,t)=>e+(t.receivedCommissionPaise||0),0);a.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>AEPS, Banking & BC/CSP Kiosk Register</h1>
        <p>Bookkeeping & cash drawer reconciliation for AEPS withdrawals, deposits, DMT & bank settlements</p>
      </div>
    </div>

    <div class="callout warning">
      <div>
        <strong>Security & Privacy Rule:</strong> This is a local bookkeeping and reconciliation module only. Never enter or store customer ATM PINs, OTPs, full 12-digit Aadhaar numbers, or biometric data.
      </div>
    </div>

    <div class="grid-kpi">
      <div class="kpi-card navy">
        <div class="kpi-label">Total Banking Volume</div>
        <div class="kpi-value">${i(r)}</div>
        <div class="kpi-sub">${l.length} Recorded Transactions</div>
      </div>
      <div class="kpi-card danger">
        <div class="kpi-label">Cash Paid to Citizens</div>
        <div class="kpi-value">${i(A)}</div>
        <div class="kpi-sub">AEPS & Micro-ATM Withdrawals</div>
      </div>
      <div class="kpi-card success">
        <div class="kpi-label">Cash Collected in Drawer</div>
        <div class="kpi-value">${i(h)}</div>
        <div class="kpi-sub">Deposits, DMT & BBPS</div>
      </div>
      <div class="kpi-card gold">
        <div class="kpi-label">BC Commission Earned</div>
        <div class="kpi-value">${i(C)}</div>
        <div class="kpi-sub">Actual Received: ${i(E)}</div>
      </div>
    </div>

    <div class="grid-sidebar-right">
      <div>
        <div class="card">
          <div class="card-header">
            <div class="card-title">AEPS & CSP Transaction Register</div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date & RRN</th>
                  <th>Customer Ref</th>
                  <th>Bank & Type</th>
                  <th class="num">Tx Amount</th>
                  <th class="num">Portal Comm</th>
                  <th class="num">Recvd Comm</th>
                  <th>Settlement</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${l.length===0?'<tr><td colspan="8" style="text-align:center; padding:18px; color:var(--color-text-muted);">No AEPS or BC banking transactions logged yet.</td></tr>':l.map(e=>`
                      <tr>
                        <td><strong>${o(e.date)}</strong><br><small style="font-family:var(--font-mono); color:var(--color-text-muted);">${o(e.portalRef||"—")}</small></td>
                        <td><strong>${o(e.customerName)}</strong><br><small style="color:var(--color-text-muted);">${o(e.customerMobile||"")}</small></td>
                        <td><strong>${o(e.bankName)}</strong><br><span class="badge badge-info">${o(e.txType)}</span><br><small style="color:var(--color-text-muted);">${o(B[n(e.txType)])}</small></td>
                        <td class="num"><strong>${i(e.txAmountPaise)}</strong></td>
                        <td class="num" style="color:var(--color-info);">${i(e.portalCommissionPaise)}</td>
                        <td class="num" style="color:var(--color-success);">${i(e.receivedCommissionPaise)}</td>
                        <td><span class="badge ${e.settlementStatus?.includes("Settled")?"badge-success":"badge-warning"}">${o(e.settlementStatus)}</span></td>
                        <td><button class="btn btn-xs btn-danger" data-del-aeps="${o(e.id)}">×</button></td>
                      </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div class="card" data-autosave-scope="aeps_form">
          <div class="card-header">
            <div class="card-title">Log AEPS / BC Transaction</div>
          </div>
          <form id="aeps-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" name="date" value="${P()}">
              </div>
              <div class="form-group">
                <label class="form-label">Transaction Type</label>
                <select class="form-control" name="txType" id="aeps-type">
                  ${R.map(e=>`<option value="${o(e)}">${o(e)}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Customer Name / Ref <span class="req">*</span></label>
                <input type="text" class="form-control" name="customerName" required placeholder="Citizen Name">
              </div>
              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" class="form-control" name="customerMobile" maxlength="10" placeholder="10-digit mobile">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Bank Name <span class="req">*</span></label>
                <input type="text" class="form-control" name="bankName" required placeholder="e.g. SBI / Canara / PNB" value="State Bank of India">
              </div>
              <div class="form-group">
                <label class="form-label">Transaction Amount (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="txAmount" id="aeps-amt" value="2000">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Comm. Rule</label>
                <select class="form-control" name="commissionRule" id="aeps-comm-rule">
                  <option value="SLAB">Slab Rule</option>
                  <option value="PERCENT">% Rule (0.4%)</option>
                  <option value="FIXED">Fixed ₹10</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Portal Comm (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="portalComm" id="aeps-portal-comm" value="9.00">
              </div>
              <div class="form-group">
                <label class="form-label">TDS %</label>
                <input type="number" step="0.01" min="0" max="100" class="form-control" name="tdsPercent" id="aeps-tds" value="2">
              </div>
              <div class="form-group">
                <label class="form-label">Net Recvd (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="recvdComm" id="aeps-recvd-comm" value="8.82">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">RRN / Portal Reference</label>
                <input type="text" class="form-control" name="portalRef" placeholder="e.g. RRN-6315098812">
              </div>
              <div class="form-group">
                <label class="form-label">Settlement Status</label>
                <select class="form-control" name="settlementStatus">
                  <option value="Settled to AEPS Pool">Settled to AEPS Pool</option>
                  <option value="Pending T+1 Bank Settlement">Pending T+1 Bank Settlement</option>
                  <option value="Settled to Bank Account">Settled to Bank Account</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Remarks</label>
              <input type="text" class="form-control" name="remarks" placeholder="Note (Never enter PIN/OTP/Aadhaar)">
            </div>
            <button type="submit" class="btn btn-primary">Record AEPS Transaction</button>
          </form>
        </div>
      </div>
    </div>
  `;const v=a.querySelector("#aeps-amt"),c=a.querySelector("#aeps-comm-rule"),d=a.querySelector("#aeps-portal-comm"),b=a.querySelector("#aeps-recvd-comm"),g=a.querySelector("#aeps-tds"),f=a.querySelector("#aeps-type"),m=()=>{const e=s(d?.value||0),t=Math.min(100,Math.max(0,Number(g?.value||0)));b&&(b.value=S(e-Math.round(e*t/100)).toFixed(2))},p=()=>{if(c?.value!=="MANUAL"){const e=n(f?.value)==="NONE",t=$(c?.value,e?0:v?.value);d&&(d.value=S(t).toFixed(2))}m()};v?.addEventListener("input",p),c?.addEventListener("change",p),f?.addEventListener("change",p),d?.addEventListener("input",m),g?.addEventListener("input",m),a.querySelectorAll("[data-del-aeps]").forEach(e=>{e.addEventListener("click",async()=>{await x("aeps_records",e.getAttribute("data-del-aeps")),y(a)})}),a.querySelector("#aeps-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target);await N("aeps_records",{id:T("AEPS"),date:t.get("date")||P(),customerName:t.get("customerName").trim(),customerMobile:t.get("customerMobile").trim(),bankName:t.get("bankName").trim(),txType:t.get("txType"),txAmountPaise:s(t.get("txAmount")),commissionRule:t.get("commissionRule"),portalCommissionPaise:s(t.get("portalComm")),tdsPercent:Number(t.get("tdsPercent")||0),tdsPaise:Math.max(0,s(t.get("portalComm"))-s(t.get("recvdComm"))),receivedCommissionPaise:s(t.get("recvdComm")),portalRef:t.get("portalRef").trim(),settlementStatus:t.get("settlementStatus"),accountId:"ACC-AEPS",remarks:t.get("remarks").trim()}),await y(a)})}export{R as AEPS_TX_TYPES,$ as computeAEPSCommissionPaise,y as renderAEPSModule};
