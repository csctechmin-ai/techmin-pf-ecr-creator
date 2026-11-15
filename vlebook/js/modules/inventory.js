import{can as T}from"../core/auth.js";import{getAllRecords as L,putRecord as R,deleteRecord as B,logAudit as F}from"../core/db.js";import{uid as G,todayISO as x,formatINR as v,toPaise as D,fromPaise as E,esc as o,downloadFile as M,generateSimplePDFBlob as H}from"../core/utils.js";import{INWARD_TYPES as V,OUTWARD_TYPES as W,movementLabel as O,recordStockMovement as C,reverseStockMovement as Y,computeStockSummary as U}from"../core/stock.js";const q=["Goods for Sale","Printing Paper","Photo Paper","PVC Cards","Lamination Sheets","Ink & Toner","Stationery","Mobile Accessories","Computer Accessories","Other Consumables"],j=["Units","Pcs","Sheets","Pouches","Cards","Box","Pack","Ream","Kg","Litre","Metre"];let A="SUMMARY",i={from:x().slice(0,8)+"01",to:x()},h={itemId:"",direction:""},w=null,N="";const c=l=>Number.isInteger(Number(l))?String(l):Number(l).toFixed(3).replace(/0+$/,"");async function S(l){const[d,a,t]=await Promise.all([L("inventory"),L("stock_movements"),L("accounts")]),f=[...d].sort((e,u)=>e.name.localeCompare(u.name)),g=d.reduce((e,u)=>e+Math.round((Number(u.currentStock)||0)*(Number(u.purchasePricePaise)||0)),0),k=d.filter(e=>Number(e.currentStock||0)<=Number(e.reorderLevel||0)),n=x().slice(0,8)+"01",r=a.filter(e=>e.date>=n&&!e.reversalOf&&!e.reversedBy),p=r.filter(e=>e.type==="PURCHASE").reduce((e,u)=>e+(u.amountPaise||0),0),s=r.filter(e=>e.type==="SALE").reduce((e,u)=>e+(u.amountPaise||0),0);l.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Stock & Inventory</h1>
        <p>Goods and consumables — record stock inward (purchases) and outward (sales, usage), see balances and stock value</p>
      </div>
    </div>

    ${N?`<div class="callout success"><div><strong>${o(N)}</strong></div></div>`:""}
    ${k.length?`<div class="callout warning"><div><strong>Low Stock Reorder Alert:</strong> ${k.map(e=>`<span data-no-i18n>${o(e.name)}</span> (${c(e.currentStock)} ${o(e.unit)})`).join(", ")}</div></div>`:""}

    <div class="grid-kpi">
      <div class="kpi-card navy"><div class="kpi-label">Total Stock Valuation</div><div class="kpi-value">${v(g)}</div><div class="kpi-sub">At latest purchase cost</div></div>
      <div class="kpi-card ${k.length?"danger":"success"}"><div class="kpi-label">Low-Stock Items</div><div class="kpi-value">${k.length}</div><div class="kpi-sub">At or below reorder level</div></div>
      <div class="kpi-card"><div class="kpi-label">Purchases This Month</div><div class="kpi-value">${v(p)}</div><div class="kpi-sub">Stock inward value</div></div>
      <div class="kpi-card success"><div class="kpi-label">Sales This Month</div><div class="kpi-value">${v(s)}</div><div class="kpi-sub">Goods sold value</div></div>
    </div>

    <div class="pill-tabs" style="margin-bottom:16px;">
      ${[["SUMMARY","Stock Summary"],["INWARD","Stock Inward"],["OUTWARD","Stock Outward"],["LEDGER","Movement Ledger"],["ITEMS",`Items (${d.length})`]].map(([e,u])=>`<button class="pill-tab ${A===e?"active":""}" data-stk-tab="${e}">${u}</button>`).join("")}
    </div>

    <div id="stk-body">${A==="SUMMARY"?await Q():A==="INWARD"?_("IN",f,t):A==="OUTWARD"?_("OUT",f,t):A==="LEDGER"?J(a,f):K(f)}</div>
  `,l.querySelectorAll("[data-stk-tab]").forEach(e=>e.addEventListener("click",()=>{A=e.getAttribute("data-stk-tab"),N="",S(l)})),z(l,f,a)}async function Q(){const l=await U(i.from,i.to),d=l.reduce((a,t)=>({value:a.value+t.valuePaise,sales:a.sales+t.salesPaise,purchases:a.purchases+t.purchasePaise}),{value:0,sales:0,purchases:0});return`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:10px;">
        <div class="card-title">Stock Summary</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="date" class="form-control" id="stk-from" value="${o(i.from)}" style="width:155px;">
          <span>→</span>
          <input type="date" class="form-control" id="stk-to" value="${o(i.to)}" style="width:155px;">
          <button class="btn btn-sm btn-outline" id="stk-sum-csv">Export CSV</button>
          <button class="btn btn-sm btn-outline" id="stk-sum-pdf">Export PDF</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Item</th><th class="num">Opening</th><th class="num">Inward</th><th class="num">Outward</th><th class="num">Closing</th><th class="num">Cost Rate</th><th class="num">Closing Value</th><th class="num">Purchases</th><th class="num">Sales</th></tr></thead>
          <tbody>
            ${l.length===0?'<tr><td colspan="9" style="text-align:center; padding:16px; color:var(--color-text-muted);">No items yet. Add items in the Items tab.</td></tr>':l.map(a=>`
              <tr>
                <td><strong data-no-i18n>${o(a.name)}</strong><br><small style="color:var(--color-text-muted);">${o(a.category)} · ${o(a.unit)}</small></td>
                <td class="num">${c(a.opening)}</td>
                <td class="num" style="color:${a.inward?"var(--color-success)":"var(--color-text-muted)"};">${a.inward?"+"+c(a.inward):"0"}</td>
                <td class="num" style="color:${a.outward?"var(--color-danger)":"var(--color-text-muted)"};">${a.outward?"−"+c(a.outward):"0"}</td>
                <td class="num"><strong style="color:${a.closing<=a.reorderLevel?"var(--color-danger)":"inherit"};">${c(a.closing)}</strong></td>
                <td class="num">${v(a.costPaise)}</td>
                <td class="num">${v(a.valuePaise)}</td>
                <td class="num">${v(a.purchasePaise)}</td>
                <td class="num">${v(a.salesPaise)}</td>
              </tr>`).join("")}
          </tbody>
          <tfoot><tr style="font-weight:700;"><td colspan="6">Total</td><td class="num">${v(d.value)}</td><td class="num">${v(d.purchases)}</td><td class="num">${v(d.sales)}</td></tr></tfoot>
        </table>
      </div>
    </div>`}function _(l,d,a){const t=l==="IN",f=t?V:W;return`
    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header"><div class="card-title">${t?"Stock Inward Entry":"Stock Outward Entry"}</div></div>
        ${d.length===0?'<div class="callout"><div>Add an item first in the <strong>Items</strong> tab.</div></div>':`
        <form id="stk-entry-form" class="form-grid" data-dir="${l}" data-no-draft-restore>
          <div class="form-group">
            <label class="form-label">Entry Type</label>
            <select class="form-control" name="type" id="stk-type">
              ${Object.entries(f).map(([g,k])=>`<option value="${g}">${o(k)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-control" name="date" value="${x()}">
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Item <span class="req">*</span></label>
            <select class="form-control" name="itemId" id="stk-item" required>
              ${d.map(g=>`<option value="${o(g.id)}" data-cost="${E(g.purchasePricePaise||0)}" data-sell="${E(g.sellingPricePaise||0)}" data-stock="${g.currentStock}" data-unit="${o(g.unit)}">${o(g.name)} — ${c(g.currentStock)} ${o(g.unit)}</option>`).join("")}
            </select>
            <span class="form-hint" id="stk-item-hint"></span>
          </div>
          <div class="form-group">
            <label class="form-label">Quantity <span class="req">*</span></label>
            <input type="number" class="form-control" name="qty" id="stk-qty" min="0.001" step="any" required value="1">
          </div>
          <div class="form-group">
            <label class="form-label">Rate (₹ per unit)</label>
            <input type="number" class="form-control" name="rate" id="stk-rate" min="0" step="0.01">
            <span class="form-hint" id="stk-amount-hint"></span>
          </div>
          <div class="form-group">
            <label class="form-label" id="stk-party-label">${t?"Supplier Name":"Customer / Party Name"}</label>
            <input type="text" class="form-control" name="partyName" id="stk-party">
          </div>
          <div class="form-group">
            <label class="form-label">Mobile</label>
            <input type="tel" class="form-control" name="partyMobile" maxlength="10">
          </div>
          <div class="form-group">
            <label class="form-label">${t?"Supplier Bill / Invoice No":"Bill / Reference No"}</label>
            <input type="text" class="form-control" name="refNo">
          </div>
          <div class="form-group" id="stk-pay-wrap">
            <label class="form-label">${t?"Payment":"Money Received"}</label>
            <select class="form-control" name="accountId">
              <option value="">${t?"Not paid now (credit / already recorded)":"Not received now (credit / already billed)"}</option>
              ${a.map(g=>`<option value="${o(g.id)}">${t?"Paid from":"Received in"}: ${o(g.name)}</option>`).join("")}
            </select>
            <span class="form-hint">${t?"Choosing an account posts a “Stock Purchase” expense in the Day Book.":"Choosing an account posts a “Goods Sale” income in the Day Book."}</span>
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Notes</label>
            <input type="text" class="form-control" name="notes" placeholder="Optional">
          </div>
          <div style="grid-column: 1 / -1;">
            <button type="submit" class="btn btn-primary">${t?"Save Inward Entry":"Save Outward Entry"}</button>
          </div>
        </form>`}
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">How it works</div></div>
        <ul class="tool-help-list">
          ${t?`<li><strong>Purchase from supplier</strong> adds stock and updates the item's cost rate.</li>
                 <li><strong>Return from customer</strong> and <strong>adjustment (+)</strong> add stock without money.</li>
                 <li><strong>Opening stock</strong> sets up quantities you already had.</li>`:`<li><strong>Sale to customer</strong> reduces stock; choose an account to record the money received.</li>
                 <li><strong>Used in service</strong>, <strong>damaged</strong>, <strong>return to supplier</strong> and <strong>adjustment (−)</strong> reduce stock without money.</li>
                 <li>Stock cannot go below zero.</li>`}
          <li>Made a mistake? Use <strong>Reverse</strong> in the Movement Ledger — the original entry stays for audit.</li>
        </ul>
      </div>
    </div>`}function J(l,d){const a=l.filter(t=>t.date>=i.from&&t.date<=i.to).filter(t=>!h.itemId||t.itemId===h.itemId).filter(t=>!h.direction||t.direction===h.direction).sort((t,f)=>String(f.date+(f.createdAt||"")).localeCompare(String(t.date+(t.createdAt||""))));return`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:10px;">
        <div class="card-title">Movement Ledger (${a.length})</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="date" class="form-control" id="stk-from" value="${o(i.from)}" style="width:150px;">
          <span>→</span>
          <input type="date" class="form-control" id="stk-to" value="${o(i.to)}" style="width:150px;">
          <select class="form-control" id="stk-led-item" style="width:200px;">
            <option value="">All items</option>
            ${d.map(t=>`<option value="${o(t.id)}" ${h.itemId===t.id?"selected":""}>${o(t.name)}</option>`).join("")}
          </select>
          <select class="form-control" id="stk-led-dir" style="width:130px;">
            <option value="">In & Out</option>
            <option value="IN" ${h.direction==="IN"?"selected":""}>Inward only</option>
            <option value="OUT" ${h.direction==="OUT"?"selected":""}>Outward only</option>
          </select>
          <button class="btn btn-sm btn-outline" id="stk-led-csv">Export CSV</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Item</th><th>Entry Type</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th><th>Party / Ref</th><th class="num">Balance</th><th></th></tr></thead>
          <tbody>
            ${a.length===0?'<tr><td colspan="9" style="text-align:center; padding:16px; color:var(--color-text-muted);">No stock entries in this period.</td></tr>':a.map(t=>`
              <tr style="${t.reversedBy?"opacity:0.55;":""}">
                <td>${o(t.date)}</td>
                <td><strong data-no-i18n>${o(t.itemName)}</strong></td>
                <td><span class="badge ${t.direction==="IN"?"badge-success":"badge-warning"}">${t.direction==="IN"?"IN":"OUT"}</span> ${o(O(t.type))}${t.reversedBy?" <small>(reversed)</small>":""}${t.paymentStatus==="CREDIT"?' <small style="color:var(--color-warning);">(credit)</small>':""}</td>
                <td class="num" style="color:${t.direction==="IN"?"var(--color-success)":"var(--color-danger)"};">${t.direction==="IN"?"+":"−"}${c(t.qty)} ${o(t.unit)}</td>
                <td class="num">${v(t.ratePaise)}</td>
                <td class="num">${v(t.amountPaise)}</td>
                <td data-no-i18n>${o(t.partyName||"—")}${t.refNo?`<br><small style="color:var(--color-text-muted);">${o(t.refNo)}</small>`:""}</td>
                <td class="num">${c(t.balanceAfter)}</td>
                <td>${t.reversedBy||t.reversalOf?"":t.source==="BILLING"?'<small style="color:var(--color-text-muted);">Cancel the bill to undo</small>':T("reverse_stock")?`<button class="btn btn-xs btn-danger" data-stk-reverse="${o(t.id)}">Reverse</button>`:""}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`}function K(l){const d=w?l.find(t=>t.id===w):null,a=d||{category:"Goods for Sale",unit:"Pcs",reorderLevel:5};return`
    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header"><div class="card-title">Item List</div><button class="btn btn-sm btn-primary" id="stk-item-new">+ New Item</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Item</th><th>Category</th><th class="num">In Stock</th><th class="num">Cost</th><th class="num">Selling</th><th class="num">Reorder Lvl</th><th></th></tr></thead>
            <tbody>
              ${l.map(t=>`
                <tr>
                  <td><strong data-no-i18n>${o(t.name)}</strong>${t.supplierName?`<br><small style="color:var(--color-text-muted);" data-no-i18n>${o(t.supplierName)}${t.supplierMobile?` (${o(t.supplierMobile)})`:""}</small>`:""}</td>
                  <td>${o(t.category||"")}</td>
                  <td class="num"><strong>${c(t.currentStock)} ${o(t.unit)}</strong></td>
                  <td class="num">${v(t.purchasePricePaise||0)}</td>
                  <td class="num">${t.sellingPricePaise?v(t.sellingPricePaise):"—"}</td>
                  <td class="num">${c(t.reorderLevel||0)}</td>
                  <td style="white-space:nowrap;"><button class="btn btn-xs btn-outline" data-stk-edit="${o(t.id)}">Edit</button> ${T("reverse_stock")?`<button class="btn btn-xs btn-danger" data-stk-del="${o(t.id)}">Delete</button>`:""}</td>
                </tr>`).join("")}
            </tbody>
          </table>
          ${l.length?"":'<p class="form-hint" style="padding:12px;">No stock items yet. Add your own items with “+ New Item”.</p>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${d?"Edit Item":"Add New Item"}</div></div>
        <form id="stk-item-form" class="form-grid" style="grid-template-columns:1fr 1fr;" data-no-draft-restore>
          <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Item Name <span class="req">*</span></label><input type="text" class="form-control" name="name" required value="${o(a.name||"")}" placeholder="e.g. Pen Drive 32 GB"></div>
          <div class="form-group"><label class="form-label">Category</label><select class="form-control" name="category">${q.map(t=>`<option ${t===a.category?"selected":""}>${o(t)}</option>`).join("")}${a.category&&!q.includes(a.category)?`<option selected>${o(a.category)}</option>`:""}</select></div>
          <div class="form-group"><label class="form-label">Unit</label><select class="form-control" name="unit">${j.map(t=>`<option ${t===a.unit?"selected":""}>${o(t)}</option>`).join("")}${a.unit&&!j.includes(a.unit)?`<option selected>${o(a.unit)}</option>`:""}</select></div>
          <div class="form-group"><label class="form-label">Purchase Cost (₹ / unit)</label><input type="number" class="form-control" name="cost" min="0" step="0.01" value="${E(a.purchasePricePaise||0)}"></div>
          <div class="form-group"><label class="form-label">Selling Price (₹ / unit)</label><input type="number" class="form-control" name="selling" min="0" step="0.01" value="${E(a.sellingPricePaise||0)}"></div>
          <div class="form-group"><label class="form-label">Reorder Level</label><input type="number" class="form-control" name="reorderLevel" min="0" step="any" value="${o(a.reorderLevel??5)}"></div>
          ${d?"":'<div class="form-group"><label class="form-label">Opening Stock</label><input type="number" class="form-control" name="opening" min="0" step="any" value="0"></div>'}
          <div class="form-group"><label class="form-label">Supplier Name</label><input type="text" class="form-control" name="supplierName" value="${o(a.supplierName||"")}"></div>
          <div class="form-group"><label class="form-label">Supplier Mobile</label><input type="tel" class="form-control" name="supplierMobile" maxlength="10" value="${o(a.supplierMobile||"")}"></div>
          <label class="form-group" style="grid-column:1 / -1; display:flex; gap:8px; align-items:center; flex-direction:row;"><input type="checkbox" name="autoDeduct" ${a.autoDeductPerPrintPage?"checked":""} style="width:auto;"> Deduct 1 from this item for every printed page billed (e.g. A4 paper)</label>
          ${d?`<div class="form-group"><label class="form-label">Correct stock to (${o(d.unit||"")})</label><input type="number" class="form-control" name="newStock" min="0" step="any" value="${c(d.currentStock)}"></div>
          <div class="form-group"><label class="form-label">Reason for stock correction</label><input type="text" class="form-control" name="stockReason" maxlength="150" placeholder="e.g. Physical count on ${x()}"></div>
          <p class="form-hint" style="grid-column:1 / -1;">A stock correction is saved as a Stock adjustment (+/−) entry, so the history and audit log stay complete.</p>`:""}
          <div style="grid-column: 1 / -1;"><button type="submit" class="btn btn-primary">${d?"Save Changes":"Add Item"}</button></div>
        </form>
      </div>
    </div>`}function z(l,d,a){const t=n=>l.querySelector(n),f=()=>{i={from:t("#stk-from")?.value||i.from,to:t("#stk-to")?.value||i.to},i.from>i.to&&(i={from:i.to,to:i.from}),S(l)};t("#stk-from")?.addEventListener("change",f),t("#stk-to")?.addEventListener("change",f);const g=async n=>{const r=await U(i.from,i.to),p=["Item","Unit","Opening","Inward","Outward","Closing","Cost Rate","Closing Value","Purchases","Sales"],s=r.map(e=>[e.name,e.unit,c(e.opening),c(e.inward),c(e.outward),c(e.closing),v(e.costPaise),v(e.valuePaise),v(e.purchasePaise),v(e.salesPaise)]);if(n==="csv")M("\uFEFF"+[p,...s].map(e=>e.map(u=>`"${String(u).replace(/"/g,'""')}"`).join(",")).join(`
`),`Stock_Summary_${i.from}_${i.to}.csv`,"text/csv;charset=utf-8");else{const e=r.reduce((u,m)=>u+m.valuePaise,0);M(H("Stock Summary",`${i.from} to ${i.to}`,p,s,[`Total Closing Value: ${v(e)}`]),`Stock_Summary_${i.from}_${i.to}.pdf`,"application/pdf")}};t("#stk-sum-csv")?.addEventListener("click",()=>g("csv")),t("#stk-sum-pdf")?.addEventListener("click",()=>g("pdf"));const k=t("#stk-entry-form");if(k){const n=k.getAttribute("data-dir"),r=t("#stk-item"),p=t("#stk-type"),s=t("#stk-rate"),e=t("#stk-qty"),u=t("#stk-pay-wrap"),m=()=>{const b=r.selectedOptions[0];if(!b)return;const y=Number(b.dataset.sell)||0,P=Number(b.dataset.cost)||0;s.value=(n==="OUT"&&p.value==="SALE"&&y?y:P).toFixed(2),t("#stk-item-hint").textContent=`In stock: ${b.dataset.stock} ${b.dataset.unit}`,$()},$=()=>{const b=(Number(s.value)||0)*(Number(e.value)||0);t("#stk-amount-hint").textContent=`Amount: ${v(Math.round(b*100))}`},I=()=>{const b=p.value==="PURCHASE"||p.value==="SALE";u.style.display=b?"":"none",m()};r.addEventListener("change",m),p.addEventListener("change",I),s.addEventListener("input",$),e.addEventListener("input",$),I(),k.addEventListener("submit",async b=>{b.preventDefault();const y=new FormData(k);try{const P=await C({itemId:y.get("itemId"),direction:n,type:y.get("type"),qty:Number(y.get("qty")),rate:y.get("rate"),date:y.get("date")||x(),partyName:y.get("partyName"),partyMobile:y.get("partyMobile"),refNo:y.get("refNo"),notes:y.get("notes"),accountId:u.style.display==="none"?"":y.get("accountId")});N=`${n==="IN"?"Inward":"Outward"} saved: ${P.itemName} ${n==="IN"?"+":"−"}${c(P.qty)} ${P.unit}. New balance: ${c(P.balanceAfter)} ${P.unit}.`,await S(l)}catch(P){alert(P.message||"Could not save the stock entry.")}})}t("#stk-led-item")?.addEventListener("change",n=>{h.itemId=n.target.value,S(l)}),t("#stk-led-dir")?.addEventListener("change",n=>{h.direction=n.target.value,S(l)}),t("#stk-led-csv")?.addEventListener("click",()=>{const n=a.filter(s=>s.date>=i.from&&s.date<=i.to).filter(s=>!h.itemId||s.itemId===h.itemId).filter(s=>!h.direction||s.direction===h.direction).sort((s,e)=>s.date.localeCompare(e.date)),r=["Date","Item","In/Out","Entry Type","Qty","Unit","Rate","Amount","Party","Reference","Balance","Notes"],p=n.map(s=>[s.date,s.itemName,s.direction,O(s.type),(s.direction==="IN"?"":"-")+c(s.qty),s.unit,E(s.ratePaise).toFixed(2),E(s.amountPaise).toFixed(2),s.partyName,s.refNo,c(s.balanceAfter),s.notes]);M("\uFEFF"+[r,...p].map(s=>s.map(e=>`"${String(e??"").replace(/"/g,'""')}"`).join(",")).join(`
`),`Stock_Ledger_${i.from}_${i.to}.csv`,"text/csv;charset=utf-8")}),l.querySelectorAll("[data-stk-reverse]").forEach(n=>n.addEventListener("click",async()=>{if(confirm("Reverse this stock entry? An opposite entry will be added and any money entry will be undone."))try{await Y(n.getAttribute("data-stk-reverse"),"Reversed by operator"),N="Stock entry reversed.",await S(l)}catch(r){alert(r.message||"Could not reverse the entry.")}})),t("#stk-item-new")?.addEventListener("click",()=>{w=null,S(l)}),l.querySelectorAll("[data-stk-edit]").forEach(n=>n.addEventListener("click",()=>{w=n.getAttribute("data-stk-edit"),S(l)})),l.querySelectorAll("[data-stk-del]").forEach(n=>n.addEventListener("click",async()=>{const r=d.find(e=>e.id===n.getAttribute("data-stk-del"));if(!r)return;const p=Number(r.currentStock)||0,s=prompt(`Delete “${r.name}”?${p?`
${c(p)} ${r.unit} still in stock will no longer be counted.`:""}
Past stock entries stay in the history.

Type the reason to delete:`);if(s!==null){if(!s.trim()){alert("A reason is needed to delete an item.");return}await B("inventory",r.id),await F("STOCK_ITEM_DELETED","inventory",r.id,`Deleted stock item ${r.name} (stock ${c(p)} ${r.unit||""}): ${s.trim()}`),w===r.id&&(w=null),N=`Item deleted: ${r.name}.`,await S(l)}})),t("#stk-item-form")?.addEventListener("submit",async n=>{n.preventDefault();const r=new FormData(n.target),p=String(r.get("name")||"").trim();if(!p)return;const s=w?d.find(m=>m.id===w):null;if(d.find(m=>m.name.trim().toLowerCase()===p.toLowerCase()&&m.id!==w)){alert("An item with this name already exists.");return}const u={name:p,category:r.get("category"),unit:r.get("unit")||"Units",purchasePricePaise:D(r.get("cost")||0),sellingPricePaise:D(r.get("selling")||0),reorderLevel:Number(r.get("reorderLevel")||0),supplierName:String(r.get("supplierName")||"").trim(),supplierMobile:String(r.get("supplierMobile")||"").trim(),autoDeductPerPrintPage:r.get("autoDeduct")==="on"};if(u.autoDeductPerPrintPage)for(const m of d.filter($=>$.autoDeductPerPrintPage&&$.id!==w))await R("inventory",{...m,autoDeductPerPrintPage:!1});if(s){const m=Number(r.get("newStock")),$=Number(s.currentStock)||0,I=Math.round((m-$)*1e3)/1e3,b=String(r.get("stockReason")||"").trim();if(r.get("newStock")!==""&&Number.isFinite(m)&&m>=0&&I!==0&&!b){alert("Enter the reason for the stock correction.");return}if(await R("inventory",{...s,...u}),r.get("newStock")!==""&&Number.isFinite(m)&&m>=0&&I!==0)try{await C({itemId:s.id,direction:I>0?"IN":"OUT",type:I>0?"ADJUST_IN":"ADJUST_OUT",qty:Math.abs(I),notes:`Stock corrected from ${c($)} to ${c(m)}: ${b}`})}catch(y){alert(y.message);return}N=`Item updated: ${p}.`}else{const m=G("INV");await R("inventory",{id:m,...u,openingStock:0,currentStock:0,history:[]});const $=Number(r.get("opening")||0);$>0&&await C({itemId:m,direction:"IN",type:"OPENING",qty:$,ratePaise:u.purchasePricePaise,notes:"Opening stock"}),N=`Item added: ${p}.`,w=m}await S(l)})}export{S as renderInventoryModule};
