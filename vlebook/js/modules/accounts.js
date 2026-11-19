import{getAllRecords as b,putRecord as I}from"../core/db.js";import{DENOMINATIONS as R,computeAccountBalances as B,computeDailyCounterSummary as O,calculateDenominationTotalPaise as h,saveDailyCounterClosing as j,recordAccountTransaction as L,txCashEffectPaise as C}from"../core/accounting.js";import{todayISO as k,formatINR as o,fromPaise as c,toPaise as p,esc as s,generateSimplePDFBlob as M,downloadFile as q}from"../core/utils.js";const U=["Rent","Electricity","Internet & Broadband","Staff Salary","Stationery","Printing Paper","Ink & Toner","Printer & PC Maintenance","Travel & Courier","Banking & Portal Charges","Software & Subscriptions","Other Expenses"];let d=k(),r={500:0,200:0,100:0,50:0,20:0,10:0,5:0,2:0,1:0};async function f(n){const[u,D,a,N,T]=await Promise.all([B(),b("transactions"),O(d),b("services"),b("bills")]),w=new Set(T.filter(e=>e.status==="CANCELLED").map(e=>e.id));a.existingClosing?.denominations&&(r={...r,...a.existingClosing.denominations});const x=h(r),m=x-a.expectedCashPaise,$=[...D].sort((e,t)=>String(t.createdAt||t.date).localeCompare(String(e.createdAt||e.date)));n.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Accounts, Day Book & Smart Counter Reconciliation</h1>
        <p>Multi-account balances, expense & transfer ledger, and physical denomination counter closing</p>
      </div>
      <div class="module-actions">
        <input type="date" class="form-control" id="acc-counter-date" value="${s(d)}" style="width:155px;">
        <button class="btn btn-outline" id="acc-export-closing-pdf">Download Counter Closing PDF</button>
      </div>
    </div>

    <!-- Account Balances Strip -->
    <div class="grid-kpi">
      ${u.map(e=>`
        <div class="kpi-card ${e.id==="ACC-CASH"?"success":e.id==="ACC-BANK"?"navy":"gold"}">
          <div class="kpi-label">${s(e.name)}</div>
          <div class="kpi-value">${o(e.currentBalancePaise)}</div>
          <div class="kpi-sub">
            Opening: ${o(e.openingPaise)}
            <button class="btn btn-xs btn-outline" data-edit-open="${s(e.id)}" style="margin-left:4px; padding:0 5px;">Set Opening</button>
          </div>
        </div>`).join("")}
    </div>

    <div class="grid-2">
      <!-- Smart Counter & Daily Denomination Reconciliation -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Smart Counter & Daily Cash Reconciliation (${s(d)})</div>
          ${a.existingClosing?.locked?'<span class="badge badge-warning">Day Locked</span>':'<span class="badge badge-info">Open for Reconciliation</span>'}
        </div>

        <div class="grid-2" style="gap:12px; margin-bottom:14px; font-size:12.5px; background:var(--color-surface-alt); padding:12px; border-radius:var(--radius-sm);">
          <div>
            <div style="display:flex; justify-content:space-between;"><span>Opening Cash:</span><strong>${o(a.openingCashPaise)}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--color-success);"><span>+ Cash Receipts & Advances:</span><strong>${o(a.cashReceiptsPaise+a.cashAdvancesPaise)}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--color-success);"><span>+ AEPS Cash Deposits / DMT:</span><strong>${o(a.aepsCashInPaise)}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--color-success);"><span>+ Cash Transfers In:</span><strong>${o(a.cashTransfersInPaise)}</strong></div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; color:var(--color-danger);"><span>- Cash Expenses:</span><strong>${o(a.cashExpensesPaise)}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--color-danger);"><span>- Cash Refunds:</span><strong>${o(a.cashRefundsPaise)}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--color-danger);"><span>- AEPS Cash Withdrawals:</span><strong>${o(a.aepsCashOutPaise)}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--color-danger);"><span>- Cash Transfers Out:</span><strong>${o(a.cashTransfersOutPaise)}</strong></div>
          </div>
        </div>

        <!-- Indian Currency Denomination Table -->
        <div class="table-wrap" style="margin-bottom:12px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Note / Coin</th>
                <th style="width:120px;">Physical Count</th>
                <th class="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${R.map(e=>`
                <tr>
                  <td><strong>₹${e}</strong></td>
                  <td>
                    <input type="number" min="0" class="form-control denom-input" data-denom="${e}" value="${Number(r[e]||0)}" style="padding:4px 8px;">
                  </td>
                  <td class="num" id="denom-sub-${e}">${o(p(e*Number(r[e]||0)))}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <div class="card" style="background:var(--color-surface-alt); margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:13px;">
            <span>System Expected Closing Cash:</span>
            <strong id="expected-cash-val">${o(a.expectedCashPaise)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:14px; margin-top:4px;">
            <span>Physical Denomination Total:</span>
            <strong id="physical-cash-val" style="color:var(--color-teal);">${o(x)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:14px; margin-top:4px; padding-top:6px; border-top:1px solid var(--color-border);">
            <span>Reconciliation Difference:</span>
            <strong id="diff-cash-val" style="color:${m===0?"var(--color-success)":"var(--color-danger)"};">
              ${m===0?"₹0.00 (Matched)":`${m>0?"+":""}${o(m)}`}
            </strong>
          </div>
        </div>

        <form id="counter-close-form" class="form-grid" style="grid-template-columns:1fr;">
          <div class="grid-3" style="gap:8px;">
            <div class="form-group">
              <label class="form-label">Actual Bank Bal (₹)</label>
              <input type="number" step="0.01" class="form-control" name="actualBank" value="${c(a.existingClosing?.actualBankPaise??a.expectedBankPaise)}">
            </div>
            <div class="form-group">
              <label class="form-label">Actual UPI Bal (₹)</label>
              <input type="number" step="0.01" class="form-control" name="actualUpi" value="${c(a.existingClosing?.actualUpiPaise??a.expectedUpiPaise)}">
            </div>
            <div class="form-group">
              <label class="form-label">Actual Wallet Bal (₹)</label>
              <input type="number" step="0.01" class="form-control" name="actualWallet" value="${c(a.existingClosing?.actualWalletPaise??a.expectedWalletPaise)}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Discrepancy Explanation / Closing Remarks</label>
            <input type="text" class="form-control" name="discrepancyNote" placeholder="Reason for any cash difference or counter closing verification note" value="${s(a.existingClosing?.discrepancyNote||"")}">
          </div>
          <div style="display:flex; gap:14px; flex-wrap:wrap; font-size:12px;">
            <label><input type="checkbox" name="postAuthorizedAdjustment"> Post Authorized Adjustment Entry for Cash Difference</label>
            <label><input type="checkbox" name="lockDay" checked> Lock Day After Closing</label>
            ${a.existingClosing?.locked?'<label style="color:var(--color-warning); font-weight:700;"><input type="checkbox" name="authorizeUnlock"> Authorize Unlock of Past Closed Day</label>':""}
          </div>
          <div id="counter-close-feedback"></div>
          <button type="submit" class="btn btn-primary">Save Daily Counter Closing & Reconciliation</button>
        </form>
      </div>

      <!-- Right Column: Record Expense, Income or Transfer + Day Book Ledger -->
      <div>
        <div class="card" data-autosave-scope="account_tx_form">
          <div class="card-header">
            <div class="card-title">Record Expense, Income or Inter-Account Transfer</div>
          </div>
          <form id="account-tx-form" class="form-grid" style="grid-template-columns:1fr;">
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Transaction Type</label>
                <select class="form-control" name="type" id="tx-type-select">
                  <option value="EXPENSE">Expense Outflow</option>
                  <option value="INCOME">Miscellaneous Income</option>
                  <option value="TRANSFER">Cash / Bank Transfer</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" name="date" value="${s(d)}">
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-control" name="category">
                  ${U.map(e=>`<option value="${s(e)}">${s(e)}</option>`).join("")}
                  <option value="Counter Cash Deposit to Bank">Counter Cash Deposit to Bank</option>
                  <option value="Wallet Top-up Transfer">Wallet Top-up Transfer</option>
                  <option value="Other Income">Other Income</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Cost Classification</label>
                <select class="form-control" name="expenseType">
                  <option value="OPERATING">Common Operating Expense (OpEx)</option>
                  <option value="DIRECT">Direct Service Cost</option>
                </select>
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">From / Primary Account</label>
                <select class="form-control" name="accountId">
                  ${u.map(e=>`<option value="${s(e.id)}">${s(e.name)}</option>`).join("")}
                </select>
              </div>
              <div class="form-group" id="tx-to-acc-wrap" style="display:none;">
                <label class="form-label">Transfer To Account</label>
                <select class="form-control" name="toAccountId">
                  ${u.map(e=>`<option value="${s(e.id)}" ${e.id==="ACC-BANK"?"selected":""}>${s(e.name)}</option>`).join("")}
                </select>
              </div>
              <div class="form-group" id="tx-srv-link-wrap">
                <label class="form-label">Link to a service (optional)</label>
                <select class="form-control" name="serviceId">
                  <option value="">— Unallocated / Common —</option>
                  ${N.map(e=>`<option value="${s(e.id)}">${s(e.name)}</option>`).join("")}
                </select>
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Amount (₹) <span class="req">*</span></label>
                <input type="number" step="0.01" min="1" class="form-control" name="amount" required placeholder="0.00">
              </div>
              <div class="form-group">
                <label class="form-label">Payment Mode</label>
                <select class="form-control" name="paymentMode">
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="WALLET">Wallet</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Particulars / Voucher Note</label>
              <input type="text" class="form-control" name="notes" placeholder="e.g. Purchased 5 reams A4 paper / Paid broadband bill">
            </div>

            <button type="submit" class="btn btn-teal">Record Transaction in Day Book</button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Unified Day Book Transactions (${$.length})</div>
          </div>
          <div class="table-wrap" style="max-height:360px; overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Particulars</th>
                  <th>Account</th>
                  <th class="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${$.slice(0,50).map(e=>`
                  <tr>
                    <td>${s(e.date)}</td>
                    <td><span class="badge ${e.type==="EXPENSE"||e.type==="REFUND"||e.type==="REVERSAL"?"badge-danger":e.type==="TRANSFER"?"badge-info":"badge-success"}">${e.type==="REVERSAL"?"CANCELLED":s(e.type)}</span>${w.has(e.billId)&&e.type==="INCOME"?' <span class="badge badge-warning">Cancelled</span>':""}</td>
                    <td><strong>${s(e.category)}</strong><br><small style="color:var(--color-text-muted);">${s(e.notes||e.reference||"")}</small></td>
                    <td>${s(e.accountId)}${e.toAccountId?` → ${s(e.toAccountId)}`:""}</td>
                    <td class="num" style="font-weight:700; color:${C(e)<0?"var(--color-danger)":"var(--color-success)"};" title="${e.type==="INCOME"&&Number(e.grossPaise||0)!==Number(e.collectedPaise??e.grossPaise??0)?`Bill total ${s(o(e.grossPaise||0))}`:""}">
                      ${C(e)<0?"−":""}${o(Math.abs(C(e)))}
                    </td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,n.querySelector("#acc-counter-date")?.addEventListener("change",e=>{d=e.target.value||k(),f(n)}),n.querySelectorAll("[data-edit-open]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-edit-open"),l=u.find(v=>v.id===t);if(!l)return;const i=prompt(`Enter Opening Balance (INR) for ${l.name}:`,String(c(l.openingPaise)));i!==null&&!isNaN(Number(i))&&(await I("accounts",{id:l.id,name:l.name,type:l.type,bankName:l.bankName,accountNo:l.accountNo,openingBalancePaise:p(i)}),await f(n))})}),n.querySelectorAll(".denom-input").forEach(e=>{e.addEventListener("input",()=>{const t=Number(e.getAttribute("data-denom")),l=Math.max(0,Math.floor(Number(e.value)||0));r[t]=l;const i=n.querySelector(`#denom-sub-${t}`);i&&(i.textContent=o(p(t*l)));const v=h(r),g=v-a.expectedCashPaise,S=n.querySelector("#physical-cash-val"),y=n.querySelector("#diff-cash-val");S&&(S.textContent=o(v)),y&&(y.textContent=g===0?"₹0.00 (Matched)":`${g>0?"+":""}${o(g)}`,y.style.color=g===0?"var(--color-success)":"var(--color-danger)")})}),n.querySelector("#counter-close-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),l=n.querySelector("#counter-close-feedback");try{await j({date:d,denominations:r,actualBankPaise:p(t.get("actualBank")),actualUpiPaise:p(t.get("actualUpi")),actualWalletPaise:p(t.get("actualWallet")),discrepancyNote:t.get("discrepancyNote"),postAuthorizedAdjustment:t.get("postAuthorizedAdjustment")==="on",lockDay:t.get("lockDay")==="on",authorizeUnlock:t.get("authorizeUnlock")==="on"}),await f(n)}catch(i){l&&(l.innerHTML=`<div class="callout danger"><span>${s(i.message)}</span></div>`)}});const P=n.querySelector("#tx-type-select"),A=n.querySelector("#tx-to-acc-wrap"),E=n.querySelector("#tx-srv-link-wrap");P?.addEventListener("change",()=>{const e=P.value==="TRANSFER";A&&(A.style.display=e?"flex":"none"),E&&(E.style.display=e?"none":"flex")}),n.querySelector("#account-tx-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target);await L({date:t.get("date")||d,type:t.get("type"),category:t.get("category"),expenseType:t.get("expenseType"),accountId:t.get("accountId"),toAccountId:t.get("type")==="TRANSFER"?t.get("toAccountId"):null,serviceId:t.get("serviceId")||null,amountPaise:p(t.get("amount")),paymentMode:t.get("paymentMode"),notes:t.get("notes")}),await f(n)}),n.querySelector("#acc-export-closing-pdf")?.addEventListener("click",()=>{const e=h(r),t=e-a.expectedCashPaise,l=M(`VLEBook Smart Counter Closing Report - ${d}`,`Opening Cash: Rs.${c(a.openingCashPaise)} | Expected Closing: Rs.${c(a.expectedCashPaise)} | Physical Count: Rs.${c(e)}`,["Denomination","Note/Coin Count","Amount (Rs)"],R.map(i=>[`Rs.${i}`,String(r[i]||0),String(i*Number(r[i]||0))]),[`Cash Receipts: Rs.${c(a.cashReceiptsPaise)} | Cash Expenses: Rs.${c(a.cashExpensesPaise)}`,`AEPS Cash In: Rs.${c(a.aepsCashInPaise)} | AEPS Cash Out: Rs.${c(a.aepsCashOutPaise)}`,`Reconciliation Difference: Rs.${c(t)} | Note: ${a.existingClosing?.discrepancyNote||"Verified"}`]);q(l,`Counter_Closing_${d}.pdf`,"application/pdf")})}export{U as EXPENSE_CATEGORIES,f as renderAccountsModule};
