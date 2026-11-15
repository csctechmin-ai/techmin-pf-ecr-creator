import{can as B}from"../core/auth.js";import{getAllRecords as E,putRecord as M}from"../core/db.js";import{uid as _,todayISO as L,formatINR as u,toPaise as C,fromPaise as N,esc as s,downloadFile as A,generateSimplePDFBlob as G}from"../core/utils.js";import{INWARD_TYPES as F,OUTWARD_TYPES as H,movementLabel as O,recordStockMovement as T,reverseStockMovement as V,computeStockSummary as q}from"../core/stock.js";const D=["Goods for Sale","Printing Paper","Photo Paper","PVC Cards","Lamination Sheets","Ink & Toner","Stationery","Mobile Accessories","Computer Accessories","Other Consumables"],U=["Units","Pcs","Sheets","Pouches","Cards","Box","Pack","Ream","Kg","Litre","Metre"];let x="SUMMARY",l={from:L().slice(0,8)+"01",to:L()},f={itemId:"",direction:""},w=null,I="";const p=r=>Number.isInteger(Number(r))?String(r):Number(r).toFixed(3).replace(/0+$/,"");async function S(r){const[i,a,t]=await Promise.all([E("inventory"),E("stock_movements"),E("accounts")]),g=[...i].sort((e,c)=>e.name.localeCompare(c.name)),m=i.reduce((e,c)=>e+Math.round((Number(c.currentStock)||0)*(Number(c.purchasePricePaise)||0)),0),h=i.filter(e=>Number(e.currentStock||0)<=Number(e.reorderLevel||0)),n=L().slice(0,8)+"01",d=a.filter(e=>e.date>=n&&!e.reversalOf&&!e.reversedBy),v=d.filter(e=>e.type==="PURCHASE").reduce((e,c)=>e+(c.amountPaise||0),0),o=d.filter(e=>e.type==="SALE").reduce((e,c)=>e+(c.amountPaise||0),0);r.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Stock & Inventory</h1>
        <p>Goods and consumables — record stock inward (purchases) and outward (sales, usage), see balances and stock value</p>
      </div>
    </div>

    ${I?`<div class="callout success"><div><strong>${s(I)}</strong></div></div>`:""}
    ${h.length?`<div class="callout warning"><div><strong>Low Stock Reorder Alert:</strong> ${h.map(e=>`<span data-no-i18n>${s(e.name)}</span> (${p(e.currentStock)} ${s(e.unit)})`).join(", ")}</div></div>`:""}

    <div class="grid-kpi">
      <div class="kpi-card navy"><div class="kpi-label">Total Stock Valuation</div><div class="kpi-value">${u(m)}</div><div class="kpi-sub">At latest purchase cost</div></div>
      <div class="kpi-card ${h.length?"danger":"success"}"><div class="kpi-label">Low-Stock Items</div><div class="kpi-value">${h.length}</div><div class="kpi-sub">At or below reorder level</div></div>
      <div class="kpi-card"><div class="kpi-label">Purchases This Month</div><div class="kpi-value">${u(v)}</div><div class="kpi-sub">Stock inward value</div></div>
      <div class="kpi-card success"><div class="kpi-label">Sales This Month</div><div class="kpi-value">${u(o)}</div><div class="kpi-sub">Goods sold value</div></div>
    </div>

    <div class="pill-tabs" style="margin-bottom:16px;">
      ${[["SUMMARY","Stock Summary"],["INWARD","Stock Inward"],["OUTWARD","Stock Outward"],["LEDGER","Movement Ledger"],["ITEMS",`Items (${i.length})`]].map(([e,c])=>`<button class="pill-tab ${x===e?"active":""}" data-stk-tab="${e}">${c}</button>`).join("")}
    </div>

    <div id="stk-body">${x==="SUMMARY"?await W():x==="INWARD"?j("IN",g,t):x==="OUTWARD"?j("OUT",g,t):x==="LEDGER"?Y(a,g):Q(g)}</div>
  `,r.querySelectorAll("[data-stk-tab]").forEach(e=>e.addEventListener("click",()=>{x=e.getAttribute("data-stk-tab"),I="",S(r)})),z(r,g,a)}async function W(){const r=await q(l.from,l.to),i=r.reduce((a,t)=>({value:a.value+t.valuePaise,sales:a.sales+t.salesPaise,purchases:a.purchases+t.purchasePaise}),{value:0,sales:0,purchases:0});return`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:10px;">
        <div class="card-title">Stock Summary</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="date" class="form-control" id="stk-from" value="${s(l.from)}" style="width:155px;">
          <span>→</span>
          <input type="date" class="form-control" id="stk-to" value="${s(l.to)}" style="width:155px;">
          <button class="btn btn-sm btn-outline" id="stk-sum-csv">Export CSV</button>
          <button class="btn btn-sm btn-outline" id="stk-sum-pdf">Export PDF</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Item</th><th class="num">Opening</th><th class="num">Inward</th><th class="num">Outward</th><th class="num">Closing</th><th class="num">Cost Rate</th><th class="num">Closing Value</th><th class="num">Purchases</th><th class="num">Sales</th></tr></thead>
          <tbody>
            ${r.length===0?'<tr><td colspan="9" style="text-align:center; padding:16px; color:var(--color-text-muted);">No items yet. Add items in the Items tab.</td></tr>':r.map(a=>`
              <tr>
                <td><strong data-no-i18n>${s(a.name)}</strong><br><small style="color:var(--color-text-muted);">${s(a.category)} · ${s(a.unit)}</small></td>
                <td class="num">${p(a.opening)}</td>
                <td class="num" style="color:${a.inward?"var(--color-success)":"var(--color-text-muted)"};">${a.inward?"+"+p(a.inward):"0"}</td>
                <td class="num" style="color:${a.outward?"var(--color-danger)":"var(--color-text-muted)"};">${a.outward?"−"+p(a.outward):"0"}</td>
                <td class="num"><strong style="color:${a.closing<=a.reorderLevel?"var(--color-danger)":"inherit"};">${p(a.closing)}</strong></td>
                <td class="num">${u(a.costPaise)}</td>
                <td class="num">${u(a.valuePaise)}</td>
                <td class="num">${u(a.purchasePaise)}</td>
                <td class="num">${u(a.salesPaise)}</td>
              </tr>`).join("")}
          </tbody>
          <tfoot><tr style="font-weight:700;"><td colspan="6">Total</td><td class="num">${u(i.value)}</td><td class="num">${u(i.purchases)}</td><td class="num">${u(i.sales)}</td></tr></tfoot>
        </table>
      </div>
    </div>`}function j(r,i,a){const t=r==="IN",g=t?F:H;return`
    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header"><div class="card-title">${t?"Stock Inward Entry":"Stock Outward Entry"}</div></div>
        ${i.length===0?'<div class="callout"><div>Add an item first in the <strong>Items</strong> tab.</div></div>':`
        <form id="stk-entry-form" class="form-grid" data-dir="${r}" data-no-draft-restore>
          <div class="form-group">
            <label class="form-label">Entry Type</label>
            <select class="form-control" name="type" id="stk-type">
              ${Object.entries(g).map(([m,h])=>`<option value="${m}">${s(h)}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-control" name="date" value="${L()}">
          </div>
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">Item <span class="req">*</span></label>
            <select class="form-control" name="itemId" id="stk-item" required>
              ${i.map(m=>`<option value="${s(m.id)}" data-cost="${N(m.purchasePricePaise||0)}" data-sell="${N(m.sellingPricePaise||0)}" data-stock="${m.currentStock}" data-unit="${s(m.unit)}">${s(m.name)} — ${p(m.currentStock)} ${s(m.unit)}</option>`).join("")}
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
              ${a.map(m=>`<option value="${s(m.id)}">${t?"Paid from":"Received in"}: ${s(m.name)}</option>`).join("")}
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
    </div>`}function Y(r,i){const a=r.filter(t=>t.date>=l.from&&t.date<=l.to).filter(t=>!f.itemId||t.itemId===f.itemId).filter(t=>!f.direction||t.direction===f.direction).sort((t,g)=>String(g.date+(g.createdAt||"")).localeCompare(String(t.date+(t.createdAt||""))));return`
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap; gap:10px;">
        <div class="card-title">Movement Ledger (${a.length})</div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="date" class="form-control" id="stk-from" value="${s(l.from)}" style="width:150px;">
          <span>→</span>
          <input type="date" class="form-control" id="stk-to" value="${s(l.to)}" style="width:150px;">
          <select class="form-control" id="stk-led-item" style="width:200px;">
            <option value="">All items</option>
            ${i.map(t=>`<option value="${s(t.id)}" ${f.itemId===t.id?"selected":""}>${s(t.name)}</option>`).join("")}
          </select>
          <select class="form-control" id="stk-led-dir" style="width:130px;">
            <option value="">In & Out</option>
            <option value="IN" ${f.direction==="IN"?"selected":""}>Inward only</option>
            <option value="OUT" ${f.direction==="OUT"?"selected":""}>Outward only</option>
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
                <td><span class="badge ${t.direction==="IN"?"badge-success":"badge-warning"}">${t.direction==="IN"?"IN":"OUT"}</span> ${s(O(t.type))}${t.reversedBy?" <small>(reversed)</small>":""}${t.paymentStatus==="CREDIT"?' <small style="color:var(--color-warning);">(credit)</small>':""}</td>
                <td class="num" style="color:${t.direction==="IN"?"var(--color-success)":"var(--color-danger)"};">${t.direction==="IN"?"+":"−"}${p(t.qty)} ${s(t.unit)}</td>
                <td class="num">${u(t.ratePaise)}</td>
                <td class="num">${u(t.amountPaise)}</td>
                <td data-no-i18n>${s(t.partyName||"—")}${t.refNo?`<br><small style="color:var(--color-text-muted);">${s(t.refNo)}</small>`:""}</td>
                <td class="num">${p(t.balanceAfter)}</td>
                <td>${t.reversedBy||t.reversalOf?"":t.source==="BILLING"?'<small style="color:var(--color-text-muted);">Cancel the bill to undo</small>':B("reverse_stock")?`<button class="btn btn-xs btn-danger" data-stk-reverse="${s(t.id)}">Reverse</button>`:""}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`}function Q(r){const i=w?r.find(t=>t.id===w):null,a=i||{category:"Goods for Sale",unit:"Pcs",reorderLevel:5};return`
    <div class="grid-sidebar-right">
      <div class="card">
        <div class="card-header"><div class="card-title">Item List</div><button class="btn btn-sm btn-primary" id="stk-item-new">+ New Item</button></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Item</th><th>Category</th><th class="num">In Stock</th><th class="num">Cost</th><th class="num">Selling</th><th class="num">Reorder Lvl</th><th></th></tr></thead>
            <tbody>
              ${r.map(t=>`
                <tr>
                  <td><strong data-no-i18n>${s(t.name)}</strong>${t.supplierName?`<br><small style="color:var(--color-text-muted);" data-no-i18n>${s(t.supplierName)}${t.supplierMobile?` (${s(t.supplierMobile)})`:""}</small>`:""}</td>
                  <td>${s(t.category||"")}</td>
                  <td class="num"><strong>${p(t.currentStock)} ${s(t.unit)}</strong></td>
                  <td class="num">${u(t.purchasePricePaise||0)}</td>
                  <td class="num">${t.sellingPricePaise?u(t.sellingPricePaise):"—"}</td>
                  <td class="num">${p(t.reorderLevel||0)}</td>
                  <td><button class="btn btn-xs btn-outline" data-stk-edit="${s(t.id)}">Edit</button></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">${i?"Edit Item":"Add New Item"}</div></div>
        <form id="stk-item-form" class="form-grid" style="grid-template-columns:1fr 1fr;" data-no-draft-restore>
          <div class="form-group" style="grid-column: 1 / -1;"><label class="form-label">Item Name <span class="req">*</span></label><input type="text" class="form-control" name="name" required value="${s(a.name||"")}" placeholder="e.g. Pen Drive 32 GB"></div>
          <div class="form-group"><label class="form-label">Category</label><select class="form-control" name="category">${D.map(t=>`<option ${t===a.category?"selected":""}>${s(t)}</option>`).join("")}${a.category&&!D.includes(a.category)?`<option selected>${s(a.category)}</option>`:""}</select></div>
          <div class="form-group"><label class="form-label">Unit</label><select class="form-control" name="unit">${U.map(t=>`<option ${t===a.unit?"selected":""}>${s(t)}</option>`).join("")}${a.unit&&!U.includes(a.unit)?`<option selected>${s(a.unit)}</option>`:""}</select></div>
          <div class="form-group"><label class="form-label">Purchase Cost (₹ / unit)</label><input type="number" class="form-control" name="cost" min="0" step="0.01" value="${N(a.purchasePricePaise||0)}"></div>
          <div class="form-group"><label class="form-label">Selling Price (₹ / unit)</label><input type="number" class="form-control" name="selling" min="0" step="0.01" value="${N(a.sellingPricePaise||0)}"></div>
          <div class="form-group"><label class="form-label">Reorder Level</label><input type="number" class="form-control" name="reorderLevel" min="0" step="any" value="${s(a.reorderLevel??5)}"></div>
          ${i?"":'<div class="form-group"><label class="form-label">Opening Stock</label><input type="number" class="form-control" name="opening" min="0" step="any" value="0"></div>'}
          <div class="form-group"><label class="form-label">Supplier Name</label><input type="text" class="form-control" name="supplierName" value="${s(a.supplierName||"")}"></div>
          <div class="form-group"><label class="form-label">Supplier Mobile</label><input type="tel" class="form-control" name="supplierMobile" maxlength="10" value="${s(a.supplierMobile||"")}"></div>
          ${i?'<p class="form-hint" style="grid-column:1 / -1;">To change the quantity, use Stock Inward / Outward so every change is recorded.</p>':""}
          <div style="grid-column: 1 / -1;"><button type="submit" class="btn btn-primary">${i?"Save Changes":"Add Item"}</button></div>
        </form>
      </div>
    </div>`}function z(r,i,a){const t=n=>r.querySelector(n),g=()=>{l={from:t("#stk-from")?.value||l.from,to:t("#stk-to")?.value||l.to},l.from>l.to&&(l={from:l.to,to:l.from}),S(r)};t("#stk-from")?.addEventListener("change",g),t("#stk-to")?.addEventListener("change",g);const m=async n=>{const d=await q(l.from,l.to),v=["Item","Unit","Opening","Inward","Outward","Closing","Cost Rate","Closing Value","Purchases","Sales"],o=d.map(e=>[e.name,e.unit,p(e.opening),p(e.inward),p(e.outward),p(e.closing),u(e.costPaise),u(e.valuePaise),u(e.purchasePaise),u(e.salesPaise)]);if(n==="csv")A("\uFEFF"+[v,...o].map(e=>e.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join(`
`),`Stock_Summary_${l.from}_${l.to}.csv`,"text/csv;charset=utf-8");else{const e=d.reduce((c,y)=>c+y.valuePaise,0);A(G("Stock Summary",`${l.from} to ${l.to}`,v,o,[`Total Closing Value: ${u(e)}`]),`Stock_Summary_${l.from}_${l.to}.pdf`,"application/pdf")}};t("#stk-sum-csv")?.addEventListener("click",()=>m("csv")),t("#stk-sum-pdf")?.addEventListener("click",()=>m("pdf"));const h=t("#stk-entry-form");if(h){const n=h.getAttribute("data-dir"),d=t("#stk-item"),v=t("#stk-type"),o=t("#stk-rate"),e=t("#stk-qty"),c=t("#stk-pay-wrap"),y=()=>{const $=d.selectedOptions[0];if(!$)return;const b=Number($.dataset.sell)||0,k=Number($.dataset.cost)||0;o.value=(n==="OUT"&&v.value==="SALE"&&b?b:k).toFixed(2),t("#stk-item-hint").textContent=`In stock: ${$.dataset.stock} ${$.dataset.unit}`,P()},P=()=>{const $=(Number(o.value)||0)*(Number(e.value)||0);t("#stk-amount-hint").textContent=`Amount: ${u(Math.round($*100))}`},R=()=>{const $=v.value==="PURCHASE"||v.value==="SALE";c.style.display=$?"":"none",y()};d.addEventListener("change",y),v.addEventListener("change",R),o.addEventListener("input",P),e.addEventListener("input",P),R(),h.addEventListener("submit",async $=>{$.preventDefault();const b=new FormData(h);try{const k=await T({itemId:b.get("itemId"),direction:n,type:b.get("type"),qty:Number(b.get("qty")),rate:b.get("rate"),date:b.get("date")||L(),partyName:b.get("partyName"),partyMobile:b.get("partyMobile"),refNo:b.get("refNo"),notes:b.get("notes"),accountId:c.style.display==="none"?"":b.get("accountId")});I=`${n==="IN"?"Inward":"Outward"} saved: ${k.itemName} ${n==="IN"?"+":"−"}${p(k.qty)} ${k.unit}. New balance: ${p(k.balanceAfter)} ${k.unit}.`,await S(r)}catch(k){alert(k.message||"Could not save the stock entry.")}})}t("#stk-led-item")?.addEventListener("change",n=>{f.itemId=n.target.value,S(r)}),t("#stk-led-dir")?.addEventListener("change",n=>{f.direction=n.target.value,S(r)}),t("#stk-led-csv")?.addEventListener("click",()=>{const n=a.filter(o=>o.date>=l.from&&o.date<=l.to).filter(o=>!f.itemId||o.itemId===f.itemId).filter(o=>!f.direction||o.direction===f.direction).sort((o,e)=>o.date.localeCompare(e.date)),d=["Date","Item","In/Out","Entry Type","Qty","Unit","Rate","Amount","Party","Reference","Balance","Notes"],v=n.map(o=>[o.date,o.itemName,o.direction,O(o.type),(o.direction==="IN"?"":"-")+p(o.qty),o.unit,N(o.ratePaise).toFixed(2),N(o.amountPaise).toFixed(2),o.partyName,o.refNo,p(o.balanceAfter),o.notes]);A("\uFEFF"+[d,...v].map(o=>o.map(e=>`"${String(e??"").replace(/"/g,'""')}"`).join(",")).join(`
`),`Stock_Ledger_${l.from}_${l.to}.csv`,"text/csv;charset=utf-8")}),r.querySelectorAll("[data-stk-reverse]").forEach(n=>n.addEventListener("click",async()=>{if(confirm("Reverse this stock entry? An opposite entry will be added and any money entry will be undone."))try{await V(n.getAttribute("data-stk-reverse"),"Reversed by operator"),I="Stock entry reversed.",await S(r)}catch(d){alert(d.message||"Could not reverse the entry.")}})),t("#stk-item-new")?.addEventListener("click",()=>{w=null,S(r)}),r.querySelectorAll("[data-stk-edit]").forEach(n=>n.addEventListener("click",()=>{w=n.getAttribute("data-stk-edit"),S(r)})),t("#stk-item-form")?.addEventListener("submit",async n=>{n.preventDefault();const d=new FormData(n.target),v=String(d.get("name")||"").trim();if(!v)return;const o=w?i.find(y=>y.id===w):null;if(i.find(y=>y.name.trim().toLowerCase()===v.toLowerCase()&&y.id!==w)){alert("An item with this name already exists.");return}const c={name:v,category:d.get("category"),unit:d.get("unit")||"Units",purchasePricePaise:C(d.get("cost")||0),sellingPricePaise:C(d.get("selling")||0),reorderLevel:Number(d.get("reorderLevel")||0),supplierName:String(d.get("supplierName")||"").trim(),supplierMobile:String(d.get("supplierMobile")||"").trim()};if(o)await M("inventory",{...o,...c}),I=`Item updated: ${v}.`;else{const y=_("INV");await M("inventory",{id:y,...c,openingStock:0,currentStock:0,autoDeductPerPrintPage:!1,history:[]});const P=Number(d.get("opening")||0);P>0&&await T({itemId:y,direction:"IN",type:"OPENING",qty:P,ratePaise:c.purchasePricePaise,notes:"Opening stock"}),I=`Item added: ${v}.`,w=y}await S(r)})}export{S as renderInventoryModule};
