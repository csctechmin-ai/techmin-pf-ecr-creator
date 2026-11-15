import{can as O}from"../core/auth.js";import{getAllRecords as M,getRecord as q,putRecord as C,deleteRecord as H,logAudit as W}from"../core/db.js";import{uid as Y,todayISO as P,formatINR as y,toPaise as G,fromPaise as A,esc as s,downloadFile as T,generateSimplePDFBlob as V}from"../core/utils.js";import{INWARD_TYPES as Q,OUTWARD_TYPES as z,movementLabel as U,recordStockMovement as D,reverseStockMovement as J,computeStockSummary as j,bookStockOn as K,recordPhysicalStock as X,stockAlerts as Z}from"../core/stock.js";const _=["Goods for Sale","Printing Paper","Photo Paper","PVC Cards","Lamination Sheets","Ink & Toner","Stationery","Mobile Accessories","Computer Accessories","Other Consumables"],B=["Units","Pcs","Sheets","Pouches","Cards","Box","Pack","Ream","Kg","Litre","Metre"];let x="SUMMARY",L=P(),R=null,c={from:P().slice(0,8)+"01",to:P()},S={itemId:"",direction:""},I=null,E="";const d=l=>Number.isInteger(Number(l))?String(l):Number(l).toFixed(3).replace(/0+$/,"");async function w(l,m,a){a&&["SUMMARY","INWARD","OUTWARD","PHYSICAL","LEDGER","ITEMS"].includes(a)&&(x=a);const[t,v,i,f]=await Promise.all([M("inventory"),M("stock_movements"),M("accounts"),q("settings","CENTRE_CONFIG")]),n=Z(t,f),e=[...t].sort((r,p)=>r.name.localeCompare(p.name)),h=t.reduce((r,p)=>r+Math.round((Number(p.currentStock)||0)*(Number(p.purchasePricePaise)||0)),0),o=n.low,u=P().slice(0,8)+"01",$=v.filter(r=>r.date>=u&&!r.reversalOf&&!r.reversedBy),g=$.filter(r=>r.type==="PURCHASE").reduce((r,p)=>r+(p.amountPaise||0),0),k=$.filter(r=>r.type==="SALE"||r.type==="BILLING_SALE").reduce((r,p)=>r+(p.amountPaise||0),0);l.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Stock & Inventory</h1>
        <p>Goods and consumables — record stock inward (purchases) and outward (sales, usage), see balances and stock value</p>
      </div>
    </div>

    ${E?`<div class="callout success"><div><strong>${s(E)}</strong></div></div>`:""}
    ${n.negative.length?`<div class="callout danger"><div><strong>Negative stock alert:</strong> ${n.negative.map(r=>`<span data-no-i18n>${s(r.name)}</span> (${d(r.currentStock)} ${s(r.unit)})`).join(", ")}. More was sold or used than the stock shows. Record the missing purchase (Stock Inward) or do a physical stock check.</div></div>`:""}
    ${n.checkDue?`<div class="callout warning"><div><strong>Physical stock check due:</strong> ${n.last?`the last physical check was on ${s(n.last)} (${n.daysSince} days ago).`:"no physical stock check has been recorded yet."} Count the items on the shelf and enter them. <button class="btn btn-xs btn-gold" data-stk-tab="PHYSICAL">Start physical stock check</button></div></div>`:""}
    ${o.length?`<div class="callout warning"><div><strong>Low Stock Reorder Alert:</strong> ${o.map(r=>`<span data-no-i18n>${s(r.name)}</span> (${d(r.currentStock)} ${s(r.unit)})`).join(", ")}</div></div>`:""}

    <div class="grid-kpi">
      <div class="kpi-card navy"><div class="kpi-label">Total Stock Valuation</div><div class="kpi-value">${y(h)}</div><div class="kpi-sub">At latest purchase cost</div></div>
      <div class="kpi-card ${o.length||n.negative.length?"danger":"success"}"><div class="kpi-label">Low / Negative Stock</div><div class="kpi-value">${o.length} / ${n.negative.length}</div><div class="kpi-sub">At or below reorder level / below zero</div></div>
      <div class="kpi-card"><div class="kpi-label">Purchases This Month</div><div class="kpi-value">${y(g)}</div><div class="kpi-sub">Stock inward value</div></div>
      <div class="kpi-card success"><div class="kpi-label">Sales This Month</div><div class="kpi-value">${y(k)}</div><div class="kpi-sub">Goods sold value</div></div>
    </div>

    <div class="pill-tabs" style="margin-bottom:16px;">
      ${[["SUMMARY","Stock Summary"],["INWARD","Stock Inward"],["OUTWARD","Stock Outward"],["PHYSICAL","Physical Stock Check"],["LEDGER","Movement Ledger"],["ITEMS",`Items (${t.length})`]].map(([r,p])=>`<button class="pill-tab ${x===r?"active":""}" data-stk-tab="${r}">${p}</button>`).join("")}
    </div>

    <div id="stk-body">${x==="SUMMARY"?await at():x==="INWARD"?F("IN",e,i):x==="OUTWARD"?F("OUT",e,i):x==="PHYSICAL"?tt(e,v,n):x==="LEDGER"?st(v,e):ot(e)}</div>
  `,l.querySelectorAll("[data-stk-tab]").forEach(r=>r.addEventListener("click",()=>{x=r.getAttribute("data-stk-tab"),E="",w(l)})),lt(l,e,v),et(l,e,v,f)}function tt(l,m,a){return l.length?`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:8px;"><div class="card-title">Physical stock as on date</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;"><label class="form-label" style="margin:0;">As on</label><input type="date" class="form-control" id="phy-date" value="${s(L)}" max="${P()}" style="width:170px;">
        <label class="form-label" style="margin:0;">Remind me every</label><input type="number" class="form-control" id="phy-every" min="1" max="365" value="${a.every}" style="width:80px;"><span>days</span></div></div>
      <p class="form-hint">Count what is actually on the shelf and type it under <strong>Counted quantity</strong>. Leave an item empty to skip it.
        If the physical count is <strong>less</strong> than the software stock, the shortfall is recorded as <em>Consumption (physical check)</em>.
        If it is <strong>more</strong>, the extra is added as <em>Difference on physical check</em>. Both are written in the movement ledger and the audit log.</p>
      ${R?`<div class="callout success"><div><strong>Physical stock saved as on ${s(R.date)}.</strong> ${R.rows.filter(t=>t.diff).map(t=>`<span data-no-i18n>${s(t.name)}</span>: ${t.diff<0?`consumption ${d(-t.diff)}`:`difference on physical check +${d(t.diff)}`} ${s(t.unit)}`).join("; ")||"No differences — the stock matches."}</div></div>`:""}
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Item</th><th class="num">Software stock as on date</th><th style="width:150px;">Counted quantity</th><th class="num">Difference</th><th>Will be recorded as</th></tr></thead><tbody>
        ${l.map(t=>{const v=K(t,m,L);return`<tr><td><strong data-no-i18n>${s(t.name)}</strong></td><td class="num" data-book="${s(t.id)}">${d(v)} ${s(t.unit)}</td>
            <td><input type="number" class="form-control" min="0" step="any" data-phy="${s(t.id)}" data-bookv="${v}" placeholder="Count"></td>
            <td class="num" data-phy-diff="${s(t.id)}">—</td><td data-phy-as="${s(t.id)}" class="form-hint">—</td></tr>`}).join("")}
      </tbody></table></div>
      <div class="form-group" style="margin-top:10px;"><label class="form-label">Note (optional)</label><input type="text" class="form-control" id="phy-note" maxlength="150" placeholder="e.g. Month-end count by Anil"></div>
      <button class="btn btn-primary" id="phy-save">Save physical stock</button>
    </div>`:'<div class="card"><p class="form-hint" style="padding:12px;">Add stock items first (Items tab), then count them here.</p></div>'}function et(l,m,a,t){const v=i=>l.querySelector(i);v("#phy-date")?.addEventListener("change",i=>{L=i.target.value&&i.target.value<=P()?i.target.value:P(),R=null,w(l)}),v("#phy-every")?.addEventListener("change",async i=>{const f=Math.max(1,Math.min(365,Number(i.target.value)||30)),n=await q("settings","CENTRE_CONFIG")||t||{};await C("settings",{...n,stockCheckEveryDays:f}),w(l)}),l.querySelectorAll("[data-phy]").forEach(i=>i.addEventListener("input",()=>{const f=i.getAttribute("data-phy"),n=Number(i.getAttribute("data-bookv")),e=v(`[data-phy-diff="${f}"]`),h=v(`[data-phy-as="${f}"]`);if(i.value===""){e.textContent="—",h.textContent="—";return}const o=Math.round((Number(i.value)-n)*1e3)/1e3;e.textContent=o>0?`+${d(o)}`:d(o),e.style.color=o<0?"var(--color-danger)":o>0?"var(--color-success)":"",h.textContent=o<0?`Consumption (physical check): ${d(-o)}`:o>0?`Difference on physical check: +${d(o)}`:"Matches — no entry"})),v("#phy-save")?.addEventListener("click",async i=>{const f=[...l.querySelectorAll("[data-phy]")].filter(e=>e.value!=="").map(e=>({itemId:e.getAttribute("data-phy"),counted:Number(e.value)}));if(!f.length)return alert("Enter the physical count of at least one item.");const n=f.filter(e=>Math.abs(e.counted-Number(v(`[data-phy="${e.itemId}"]`).getAttribute("data-bookv")))>5e-4).length;if(confirm(`Save the physical stock as on ${L} for ${f.length} item(s)?
${n} item(s) differ from the software stock and will be adjusted.`)){i.target.disabled=!0;try{const e=await X({date:L,counts:f,note:v("#phy-note")?.value||""});R={date:L,rows:e}}catch(e){alert(e.message)}w(l)}})}async function at(){const l=await j(c.from,c.to),m=l.reduce((a,t)=>({value:a.value+t.valuePaise,sales:a.sales+t.salesPaise,purchases:a.purchases+t.purchasePaise}),{value:0,sales:0,purchases:0});return`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:10px;">
        <div class="card-title">Stock Summary</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="date" class="form-control" id="stk-from" value="${s(c.from)}" style="width:155px;">
          <span>→</span>
          <input type="date" class="form-control" id="stk-to" value="${s(c.to)}" style="width:155px;">
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
                <td><strong data-no-i18n>${s(a.name)}</strong><br><small style="color:var(--color-text-muted);">${s(a.category)} · ${s(a.unit)}</small></td>
                <td class="num">${d(a.opening)}</td>
                <td class="num" style="color:${a.inward?"var(--color-success)":"var(--color-text-muted)"};">${a.inward?"+"+d(a.inward):"0"}</td>
                <td class="num" style="color:${a.outward?"var(--color-danger)":"var(--color-text-muted)"};">${a.outward?"−"+d(a.outward):"0"}</td>
                <td class="num"><strong style="color:${a.closing<=a.reorderLevel?"var(--color-danger)":"inherit"};">${d(a.closing)}</strong></td>
                <td class="num">${y(a.costPaise)}</td>
                <td class="num">${y(a.valuePaise)}</td>
                <td class="num">${y(a.purchasePaise)}</td>
                <td class="num">${y(a.salesPaise)}</td>
              </tr>`).join("")}
          </tbody>
          <tfoot><tr style="font-weight:700;"><td colspan="6">Total</td><td class="num">${y(m.value)}</td><td class="num">${y(m.purchases)}</td><td class="num">${y(m.sales)}</td></tr></tfoot>
        </table>
      </div>
    </div>`}function F(l,m,a){const t=l==="IN",v=t?Q:z;return`
    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header"><div class="card-title">${t?"Stock Inward Entry":"Stock Outward Entry"}</div></div>
        ${m.length===0?'<div class="callout"><div>Add an item first in the <strong>Items</strong> tab.</div></div>':`
        <form id="stk-entry-form" class="form-grid" data-dir="${l}" data-no-draft-restore>
          <div class="form-group">
            <label class="form-label">Entry Type</label>
            <select class="form-control" name="type" id="stk-type">
              ${Object.entries(v).map(([i,f])=>`<option value="${i}">${s(f)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-control" name="date" value="${P()}">
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Item <span class="req">*</span></label>
            <select class="form-control" name="itemId" id="stk-item" required>
              ${m.map(i=>`<option value="${s(i.id)}" data-cost="${A(i.purchasePricePaise||0)}" data-sell="${A(i.sellingPricePaise||0)}" data-stock="${i.currentStock}" data-unit="${s(i.unit)}">${s(i.name)} — ${d(i.currentStock)} ${s(i.unit)}</option>`).join("")}
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
              ${a.map(i=>`<option value="${s(i.id)}">${t?"Paid from":"Received in"}: ${s(i.name)}</option>`).join("")}
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
    </div>`}function st(l,m){const a=l.filter(t=>t.date>=c.from&&t.date<=c.to).filter(t=>!S.itemId||t.itemId===S.itemId).filter(t=>!S.direction||t.direction===S.direction).sort((t,v)=>String(v.date+(v.createdAt||"")).localeCompare(String(t.date+(t.createdAt||""))));return`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:10px;">
        <div class="card-title">Movement Ledger (${a.length})</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="date" class="form-control" id="stk-from" value="${s(c.from)}" style="width:150px;">
          <span>→</span>
          <input type="date" class="form-control" id="stk-to" value="${s(c.to)}" style="width:150px;">
          <select class="form-control" id="stk-led-item" style="width:200px;">
            <option value="">All items</option>
            ${m.map(t=>`<option value="${s(t.id)}" ${S.itemId===t.id?"selected":""}>${s(t.name)}</option>`).join("")}
          </select>
          <select class="form-control" id="stk-led-dir" style="width:130px;">
            <option value="">In & Out</option>
            <option value="IN" ${S.direction==="IN"?"selected":""}>Inward only</option>
            <option value="OUT" ${S.direction==="OUT"?"selected":""}>Outward only</option>
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
                <td>${s(t.date)}</td>
                <td><strong data-no-i18n>${s(t.itemName)}</strong></td>
                <td><span class="badge ${t.direction==="IN"?"badge-success":"badge-warning"}">${t.direction==="IN"?"IN":"OUT"}</span> ${s(U(t.type))}${t.reversedBy?" <small>(reversed)</small>":""}${t.paymentStatus==="CREDIT"?' <small style="color:var(--color-warning);">(credit)</small>':""}</td>
                <td class="num" style="color:${t.direction==="IN"?"var(--color-success)":"var(--color-danger)"};">${t.direction==="IN"?"+":"−"}${d(t.qty)} ${s(t.unit)}</td>
                <td class="num">${y(t.ratePaise)}</td>
                <td class="num">${y(t.amountPaise)}</td>
                <td data-no-i18n>${s(t.partyName||"—")}${t.refNo?`<br><small style="color:var(--color-text-muted);">${s(t.refNo)}</small>`:""}</td>
                <td class="num">${d(t.balanceAfter)}</td>
                <td>${t.reversedBy||t.reversalOf?"":t.source==="BILLING"?'<small style="color:var(--color-text-muted);">Cancel the bill to undo</small>':O("reverse_stock")?`<button class="btn btn-xs btn-danger" data-stk-reverse="${s(t.id)}">Reverse</button>`:""}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`}function ot(l){const m=I?l.find(t=>t.id===I):null,a=m||{category:"Goods for Sale",unit:"Pcs",reorderLevel:5};return`
    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header"><div class="card-title">Item List</div><button class="btn btn-sm btn-primary" id="stk-item-new">+ New Item</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Item</th><th>Category</th><th class="num">In Stock</th><th class="num">Cost</th><th class="num">Selling</th><th class="num">Reorder Lvl</th><th></th></tr></thead>
            <tbody>
              ${l.map(t=>`
                <tr>
                  <td><strong data-no-i18n>${s(t.name)}</strong>${t.supplierName?`<br><small style="color:var(--color-text-muted);" data-no-i18n>${s(t.supplierName)}${t.supplierMobile?` (${s(t.supplierMobile)})`:""}</small>`:""}</td>
                  <td>${s(t.category||"")}</td>
                  <td class="num"><strong>${d(t.currentStock)} ${s(t.unit)}</strong></td>
                  <td class="num">${y(t.purchasePricePaise||0)}</td>
                  <td class="num">${t.sellingPricePaise?y(t.sellingPricePaise):"—"}</td>
                  <td class="num">${d(t.reorderLevel||0)}</td>
                  <td style="white-space:nowrap;"><button class="btn btn-xs btn-outline" data-stk-edit="${s(t.id)}">Edit</button> ${O("reverse_stock")?`<button class="btn btn-xs btn-danger" data-stk-del="${s(t.id)}">Delete</button>`:""}</td>
                </tr>`).join("")}
            </tbody>
          </table>
          ${l.length?"":'<p class="form-hint" style="padding:12px;">No stock items yet. Add your own items with “+ New Item”.</p>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${m?"Edit Item":"Add New Item"}</div></div>
        <form id="stk-item-form" class="form-grid" style="grid-template-columns:1fr 1fr;" data-no-draft-restore>
          <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Item Name <span class="req">*</span></label><input type="text" class="form-control" name="name" required value="${s(a.name||"")}" placeholder="e.g. Pen Drive 32 GB"></div>
          <div class="form-group"><label class="form-label">Category</label><select class="form-control" name="category">${_.map(t=>`<option ${t===a.category?"selected":""}>${s(t)}</option>`).join("")}${a.category&&!_.includes(a.category)?`<option selected>${s(a.category)}</option>`:""}</select></div>
          <div class="form-group"><label class="form-label">Unit</label><select class="form-control" name="unit">${B.map(t=>`<option ${t===a.unit?"selected":""}>${s(t)}</option>`).join("")}${a.unit&&!B.includes(a.unit)?`<option selected>${s(a.unit)}</option>`:""}</select></div>
          <div class="form-group"><label class="form-label">Purchase Cost (₹ / unit)</label><input type="number" class="form-control" name="cost" min="0" step="0.01" value="${A(a.purchasePricePaise||0)}"></div>
          <div class="form-group"><label class="form-label">Selling Price (₹ / unit)</label><input type="number" class="form-control" name="selling" min="0" step="0.01" value="${A(a.sellingPricePaise||0)}"></div>
          <div class="form-group"><label class="form-label">Selling price is</label><select class="form-control" name="priceIncludesGst"><option value="0" ${a.priceIncludesGst?"":"selected"}>Excluding GST (GST added on the bill)</option><option value="1" ${a.priceIncludesGst?"selected":""}>Including GST (GST inside the price)</option></select></div>
          <div class="form-group"><label class="form-label">GST rate (for GST bills)</label><select class="form-control" name="gstRate"><option value="" ${a.gstRate===void 0||a.gstRate===null||a.gstRate===""?"selected":""}>— Not set (choose before selling on a GST bill) —</option>${[0,5,12,18,28].map(t=>`<option value="${t}" ${a.gstRate!==void 0&&a.gstRate!==null&&a.gstRate!==""&&Number(a.gstRate)===t?"selected":""}>${t?`${t}%`:"No GST / exempt (0%)"}</option>`).join("")}</select><div class="form-hint">Set the rate that applies to this product (check with your tax adviser). VLEBook does not assume a rate.</div></div>
          <div class="form-group"><label class="form-label">HSN code (optional)</label><input type="text" class="form-control" name="hsn" maxlength="8" inputmode="numeric" value="${s(a.hsn||"")}" placeholder="e.g. 4802"></div>
          <div class="form-group"><label class="form-label">Reorder Level</label><input type="number" class="form-control" name="reorderLevel" min="0" step="any" value="${s(a.reorderLevel??5)}"></div>
          ${m?"":'<div class="form-group"><label class="form-label">Opening Stock</label><input type="number" class="form-control" name="opening" min="0" step="any" value="0"></div>'}
          <div class="form-group"><label class="form-label">Supplier Name</label><input type="text" class="form-control" name="supplierName" value="${s(a.supplierName||"")}"></div>
          <div class="form-group"><label class="form-label">Supplier Mobile</label><input type="tel" class="form-control" name="supplierMobile" maxlength="10" value="${s(a.supplierMobile||"")}"></div>
          <label class="form-group" style="grid-column:1 / -1; display:flex; gap:8px; align-items:center; flex-direction:row;"><input type="checkbox" name="autoDeduct" ${a.autoDeductPerPrintPage?"checked":""} style="width:auto;"> Deduct 1 from this item for every printed page billed (e.g. A4 paper)</label>
          ${m?`<div class="form-group"><label class="form-label">Correct stock to (${s(m.unit||"")})</label><input type="number" class="form-control" name="newStock" min="0" step="any" value="${d(m.currentStock)}"></div>
          <div class="form-group"><label class="form-label">Reason for stock correction</label><input type="text" class="form-control" name="stockReason" maxlength="150" placeholder="e.g. Physical count on ${P()}"></div>
          <p class="form-hint" style="grid-column:1 / -1;">A stock correction is saved as a Stock adjustment (+/−) entry, so the history and audit log stay complete.</p>`:""}
          <div style="grid-column: 1 / -1;"><button type="submit" class="btn btn-primary">${m?"Save Changes":"Add Item"}</button></div>
        </form>
      </div>
    </div>`}function lt(l,m,a){const t=n=>l.querySelector(n),v=()=>{c={from:t("#stk-from")?.value||c.from,to:t("#stk-to")?.value||c.to},c.from>c.to&&(c={from:c.to,to:c.from}),w(l)};t("#stk-from")?.addEventListener("change",v),t("#stk-to")?.addEventListener("change",v);const i=async n=>{const e=await j(c.from,c.to),h=["Item","Unit","Opening","Inward","Outward","Closing","Cost Rate","Closing Value","Purchases","Sales"],o=e.map(u=>[u.name,u.unit,d(u.opening),d(u.inward),d(u.outward),d(u.closing),y(u.costPaise),y(u.valuePaise),y(u.purchasePaise),y(u.salesPaise)]);if(n==="csv")T("\uFEFF"+[h,...o].map(u=>u.map($=>`"${String($).replace(/"/g,'""')}"`).join(",")).join(`
`),`Stock_Summary_${c.from}_${c.to}.csv`,"text/csv;charset=utf-8");else{const u=e.reduce(($,g)=>$+g.valuePaise,0);T(V("Stock Summary",`${c.from} to ${c.to}`,h,o,[`Total Closing Value: ${y(u)}`]),`Stock_Summary_${c.from}_${c.to}.pdf`,"application/pdf")}};t("#stk-sum-csv")?.addEventListener("click",()=>i("csv")),t("#stk-sum-pdf")?.addEventListener("click",()=>i("pdf"));const f=t("#stk-entry-form");if(f){const n=f.getAttribute("data-dir"),e=t("#stk-item"),h=t("#stk-type"),o=t("#stk-rate"),u=t("#stk-qty"),$=t("#stk-pay-wrap"),g=()=>{const p=e.selectedOptions[0];if(!p)return;const b=Number(p.dataset.sell)||0,N=Number(p.dataset.cost)||0;o.value=(n==="OUT"&&h.value==="SALE"&&b?b:N).toFixed(2),t("#stk-item-hint").textContent=`In stock: ${p.dataset.stock} ${p.dataset.unit}`,k()},k=()=>{const p=(Number(o.value)||0)*(Number(u.value)||0);t("#stk-amount-hint").textContent=`Amount: ${y(Math.round(p*100))}`},r=()=>{const p=h.value==="PURCHASE"||h.value==="SALE";$.style.display=p?"":"none",g()};e.addEventListener("change",g),h.addEventListener("change",r),o.addEventListener("input",k),u.addEventListener("input",k),r(),f.addEventListener("submit",async p=>{p.preventDefault();const b=new FormData(f);try{const N=await D({itemId:b.get("itemId"),direction:n,type:b.get("type"),qty:Number(b.get("qty")),rate:b.get("rate"),date:b.get("date")||P(),partyName:b.get("partyName"),partyMobile:b.get("partyMobile"),refNo:b.get("refNo"),notes:b.get("notes"),accountId:$.style.display==="none"?"":b.get("accountId")});E=`${n==="IN"?"Inward":"Outward"} saved: ${N.itemName} ${n==="IN"?"+":"−"}${d(N.qty)} ${N.unit}. New balance: ${d(N.balanceAfter)} ${N.unit}.`,await w(l)}catch(N){alert(N.message||"Could not save the stock entry.")}})}t("#stk-led-item")?.addEventListener("change",n=>{S.itemId=n.target.value,w(l)}),t("#stk-led-dir")?.addEventListener("change",n=>{S.direction=n.target.value,w(l)}),t("#stk-led-csv")?.addEventListener("click",()=>{const n=a.filter(o=>o.date>=c.from&&o.date<=c.to).filter(o=>!S.itemId||o.itemId===S.itemId).filter(o=>!S.direction||o.direction===S.direction).sort((o,u)=>o.date.localeCompare(u.date)),e=["Date","Item","In/Out","Entry Type","Qty","Unit","Rate","Amount","Party","Reference","Balance","Notes"],h=n.map(o=>[o.date,o.itemName,o.direction,U(o.type),(o.direction==="IN"?"":"-")+d(o.qty),o.unit,A(o.ratePaise).toFixed(2),A(o.amountPaise).toFixed(2),o.partyName,o.refNo,d(o.balanceAfter),o.notes]);T("\uFEFF"+[e,...h].map(o=>o.map(u=>`"${String(u??"").replace(/"/g,'""')}"`).join(",")).join(`
`),`Stock_Ledger_${c.from}_${c.to}.csv`,"text/csv;charset=utf-8")}),l.querySelectorAll("[data-stk-reverse]").forEach(n=>n.addEventListener("click",async()=>{if(confirm("Reverse this stock entry? An opposite entry will be added and any money entry will be undone."))try{await J(n.getAttribute("data-stk-reverse"),"Reversed by operator"),E="Stock entry reversed.",await w(l)}catch(e){alert(e.message||"Could not reverse the entry.")}})),t("#stk-item-new")?.addEventListener("click",()=>{I=null,w(l)}),l.querySelectorAll("[data-stk-edit]").forEach(n=>n.addEventListener("click",()=>{I=n.getAttribute("data-stk-edit"),w(l)})),l.querySelectorAll("[data-stk-del]").forEach(n=>n.addEventListener("click",async()=>{const e=m.find(u=>u.id===n.getAttribute("data-stk-del"));if(!e)return;const h=Number(e.currentStock)||0,o=prompt(`Delete “${e.name}”?${h?`
${d(h)} ${e.unit} still in stock will no longer be counted.`:""}
Past stock entries stay in the history.

Type the reason to delete:`);if(o!==null){if(!o.trim()){alert("A reason is needed to delete an item.");return}await H("inventory",e.id),await W("STOCK_ITEM_DELETED","inventory",e.id,`Deleted stock item ${e.name} (stock ${d(h)} ${e.unit||""}): ${o.trim()}`),I===e.id&&(I=null),E=`Item deleted: ${e.name}.`,await w(l)}})),t("#stk-item-form")?.addEventListener("submit",async n=>{n.preventDefault();const e=new FormData(n.target),h=String(e.get("name")||"").trim();if(!h)return;const o=I?m.find(g=>g.id===I):null;if(m.find(g=>g.name.trim().toLowerCase()===h.toLowerCase()&&g.id!==I)){alert("An item with this name already exists.");return}const $={name:h,category:e.get("category"),unit:e.get("unit")||"Units",purchasePricePaise:G(e.get("cost")||0),sellingPricePaise:G(e.get("selling")||0),reorderLevel:Number(e.get("reorderLevel")||0),supplierName:String(e.get("supplierName")||"").trim(),supplierMobile:String(e.get("supplierMobile")||"").trim(),autoDeductPerPrintPage:e.get("autoDeduct")==="on",priceIncludesGst:e.get("priceIncludesGst")==="1",gstRate:e.get("gstRate")===""||e.get("gstRate")==null?null:Math.max(0,Number(e.get("gstRate"))||0),hsn:String(e.get("hsn")||"").replace(/\D/g,"").slice(0,8)};if($.autoDeductPerPrintPage)for(const g of m.filter(k=>k.autoDeductPerPrintPage&&k.id!==I))await C("inventory",{...g,autoDeductPerPrintPage:!1});if(o){const g=Number(e.get("newStock")),k=Number(o.currentStock)||0,r=Math.round((g-k)*1e3)/1e3,p=String(e.get("stockReason")||"").trim();if(e.get("newStock")!==""&&Number.isFinite(g)&&g>=0&&r!==0&&!p){alert("Enter the reason for the stock correction.");return}if(await C("inventory",{...o,...$}),e.get("newStock")!==""&&Number.isFinite(g)&&g>=0&&r!==0)try{await D({itemId:o.id,direction:r>0?"IN":"OUT",type:r>0?"ADJUST_IN":"ADJUST_OUT",qty:Math.abs(r),notes:`Stock corrected from ${d(k)} to ${d(g)}: ${p}`})}catch(b){alert(b.message);return}E=`Item updated: ${h}.`}else{const g=Y("INV");await C("inventory",{id:g,...$,openingStock:0,currentStock:0,history:[]});const k=Number(e.get("opening")||0);k>0&&await D({itemId:g,direction:"IN",type:"OPENING",qty:k,ratePaise:$.purchasePricePaise,notes:"Opening stock"}),E=`Item added: ${h}.`,I=g}await w(l)})}export{w as renderInventoryModule};
