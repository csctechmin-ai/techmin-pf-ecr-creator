import{getAllRecords as G,getRecord as V,putRecord as L,deleteRecord as j,DEFAULT_SERVICES as _}from"../core/db.js";import{notifyCrossTabSync as D,lineGstRate as M}from"../core/accounting.js";import{hsnContext as H,hsnFieldHTML as X,wireHsnField as z}from"./hsn-field.js";import{uid as J,formatINR as h,toPaise as p,fromPaise as b,esc as a}from"../core/utils.js";let $="ALL",A="",v=null,u="";const f=new Map,q=["Government & Citizen Services","Banking & Financial Services","Insurance & Agriculture","Digital & Commercial Services"];async function c(s){const O=await(await import("../core/gst.js")).ratesInForce().catch(()=>[0,5,12,18,28]),B=await H(),g=await G("services"),i=v?g.find(e=>e.id===v):null,T=Array.from(new Set([...q,...g.map(e=>e.category).filter(Boolean)])),S=A.trim().toLowerCase(),R=g.filter(e=>$!=="ALL"&&e.category!==$?!1:S?String(e.name||"").toLowerCase().includes(S)||String(e.id||"").toLowerCase().includes(S)||String(e.category||"").toLowerCase().includes(S)||String(e.state||"").toLowerCase().includes(S):!0);s.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Service Catalogue & Pricing Management</h1>
        <p>Edit existing service prices, government fees & checklists with instant auto-save, or create new centre services</p>
      </div>
      <div class="module-actions">
        <button class="btn btn-primary" id="srv-focus-create-btn">+ Create New Service</button>
        <button class="btn btn-outline" id="srv-rate-list-btn" title="Print or share your price list">Rate list</button>
        <button class="btn btn-outline" id="srv-restore-defaults-btn" title="Restore any missing default services without deleting your custom services">Restore Default Catalogue</button>
      </div>
    </div>

    ${u?`<div class="callout success">
            <div><strong>${a(u)}</strong></div>
            <button class="btn btn-xs btn-outline" id="srv-clear-msg">Dismiss</button>
          </div>`:""}

    <div class="grid-sidebar-right">
      <!-- Left Column: Present Service List with Live Auto-Save Inline Editing -->
      <div>
        <div class="card">
          <div class="card-header">
            <div class="pill-tabs" id="srv-cat-tabs">
              <button class="pill-tab ${$==="ALL"?"active":""}" data-cat="ALL">All Services (${g.length})</button>
              ${T.map(e=>`<button class="pill-tab ${$===e?"active":""}" data-cat="${a(e)}">${a(e.split("&")[0].trim())}</button>`).join("")}
            </div>
            <input type="search" class="form-control" id="srv-search-inp" placeholder="Search service name or ID..." value="${a(A)}" style="max-width:240px;">
          </div>

          <div class="callout" style="margin-bottom:14px; padding:9px 14px;">
            <span><strong>Auto-Save Active:</strong> Changes to any service's Name, Customer Price, Govt Fee, Commission, or Active status below are saved automatically to your local database as you type.</span>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Service Name & Checklist</th>
                  <th style="width:110px;">Price (₹)</th>
                  <th style="width:105px;">Govt Fee (₹)</th>
                  <th class="num">Operator Chg</th>
                  <th style="width:95px;">Comm. (₹)</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${R.length===0?'<tr><td colspan="7" style="text-align:center; padding:22px; color:var(--color-text-muted);">No matching services found. Use the form on the right to create a new service.</td></tr>':R.map(e=>`
                  <tr style="${v===e.id?"background:var(--color-info-bg);":""}">
                    <td>
                      <input type="text" class="form-control inline-srv-name" data-id="${a(e.id)}" value="${a(e.name)}" style="font-weight:600; margin-bottom:4px; padding:4px 8px;">
                      <small style="color:var(--color-text-muted); display:block;">
                        <span style="font-family:var(--font-mono);">${a(e.id)}</span> • ${a(e.category)} • ${a(e.checklist||"Standard checklist")}
                        <span id="inline-saved-${a(e.id)}" style="color:var(--color-success); font-weight:600; margin-left:6px;"></span>
                      </small>
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-price" data-id="${a(e.id)}" value="${b(e.customerPricePaise)}" style="padding:4px 8px; font-weight:600;">
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-govt" data-id="${a(e.id)}" value="${b(e.govtFeePaise)}" style="padding:4px 8px;">
                    </td>
                    <td class="num" id="inline-op-${a(e.id)}" style="color:var(--color-success); font-weight:700;">
                      ${h(e.serviceChargePaise)}
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-comm" data-id="${a(e.id)}" value="${b(e.commissionPaise||0)}" style="padding:4px 8px;">
                    </td>
                    <td>
                      <input type="checkbox" class="inline-srv-active" data-id="${a(e.id)}" ${e.active!==!1?"checked":""} title="Active in Billing">
                    </td>
                    <td>
                      <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button class="btn btn-xs btn-outline" data-inline-save="${a(e.id)}" title="Save inline changes">Save</button>
                        <button class="btn btn-xs btn-outline" data-edit-srv="${a(e.id)}" title="Open in full editor">Edit</button>
                        <button class="btn btn-xs btn-danger" data-del-srv="${a(e.id)}" title="Delete service">×</button>
                      </div>
                    </td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Create New Service / Full Edit Selected Service Form -->
      <div>
        <div class="card" id="srv-editor-card" style="${i?"border:1.5px solid var(--color-brand);":""}">
          <div class="card-header">
            <div class="card-title">
              ${i?`Edit Service: ${a(i.name)}`:"Create New Service"}
            </div>
            ${i?'<button class="btn btn-xs btn-outline" id="srv-cancel-edit">+ Create New</button>':'<span class="badge badge-info" style="font-size:10.5px;">Draft Auto-Saves</span>'}
          </div>
          <form id="service-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <input type="hidden" name="id" value="${a(i?.id||"")}">
            <div class="form-group">
              <label class="form-label">Service Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="name" id="srv-form-name" required placeholder="e.g. Ration Card Member Addition / Color Print" value="${a(i?.name||"")}">
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" class="form-control" name="category" list="srv-cat-datalist" required value="${a(i?.category||q[0])}">
                <datalist id="srv-cat-datalist">
                  ${T.map(e=>`<option value="${a(e)}"></option>`).join("")}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">State / Jurisdiction</label>
                <input type="text" class="form-control" name="state" value="${a(i?.state||"Kerala / All India")}">
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" id="srv-price" required value="${i?b(i.customerPricePaise):"100"}">
              </div>
              <div class="form-group">
                <label class="form-label">Govt / Challan Fee (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="govtFee" id="srv-govt" value="${i?b(i.govtFeePaise):"20"}">
              </div>
            </div>

            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Operator Charge (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="serviceCharge" id="srv-charge" value="${i?b(i.serviceChargePaise):"80"}">
              </div>
              <div class="form-group">
                <label class="form-label">GST on this price</label>
                <select class="form-control" name="gstPricing" id="srv-gstpricing">
                  <option value="PLUS" ${i?.priceIncludesGst?"":"selected"}>Price + GST (GST added on top)</option>
                  <option value="INCL" ${i?.priceIncludesGst?"selected":""}>Price includes GST</option>
                </select>
                <div class="form-hint" id="srv-gst-preview">Used only on tax invoices (GST-registered regular dealers).</div>
              </div>
              <div class="form-group">
                <label class="form-label">Commission (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="commission" value="${i?b(i.commissionPaise||0):"0"}">
                <div class="form-hint">Only the commission you actually receive for this service, if any. VLE360 does not add any commission rates.</div>
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Turnaround Time</label>
                <input type="text" class="form-control" name="turnaroundTime" placeholder="e.g. Same Day / 3-5 Days" value="${a(i?.turnaroundTime||"Same Day")}">
              </div>
              <div class="form-group">
                <label class="form-label">GST Rate (%)</label>
                <select class="form-control" name="gstRate" id="srv-gstrate">
                  ${[...new Set([...O,...i&&!i.gstExempt?[M(i)]:[]])].sort((e,t)=>e-t).map(e=>`<option value="${e}" ${!i?.gstExempt&&(i?M(i):18)===e?"selected":""}>${e?`${e}% GST`:"Nil rated (0%)"}</option>`).join("")}
                  <option value="EX" ${i?.gstExempt?"selected":""}>Exempt from GST</option>
                </select>
                <div class="form-hint">Used only on GST bills, on the service charge (never on the government fee).</div>
              </div>
              ${X(B,{name:"sac",value:i?.sac||"",kind:"SAC"})}
            </div>

            <div class="form-group">
              <label class="form-label">Required Document Checklist</label>
              <input type="text" class="form-control" name="checklist" placeholder="Aadhaar, Ration Card, Photo, Tax Receipt" value="${a(i?.checklist||"")}">
            </div>

            <div class="form-group">
              <label class="form-label">Service Description / Notes</label>
              <input type="text" class="form-control" name="description" placeholder="Optional service description" value="${a(i?.description||"")}">
            </div>

            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" name="active" ${i?.active!==!1?"checked":""}> Service is Active in Counter Billing
              </label>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:10px;">
              ${i?"Save Service Changes":"Create & Add Service to Catalogue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,z(s,()=>c(s)),s.querySelector("#srv-clear-msg")?.addEventListener("click",()=>{u="",c(s)}),s.querySelector("#srv-rate-list-btn")?.addEventListener("click",async()=>{const[{openRateList:e},t]=await Promise.all([import("./ratelist.js"),V("settings","CENTRE_CONFIG")]);e(await G("services"),t||{})}),s.querySelector("#srv-focus-create-btn")?.addEventListener("click",()=>{v=null,u="",c(s).then(()=>{const e=s.querySelector("#srv-form-name");e?.focus(),e?.scrollIntoView({behavior:"smooth",block:"center"})})}),s.querySelector("#srv-restore-defaults-btn")?.addEventListener("click",async()=>{const e=new Set(g.map(r=>r.id));let t=0;for(const r of _)e.has(r.id)||(await L("services",r),t++);u=t>0?`Restored ${t} default service(s) to your catalogue.`:"All default services are already present.",await c(s)});const x=s.querySelector("#srv-price"),C=s.querySelector("#srv-govt"),k=s.querySelector("#srv-charge"),F=()=>{const e=Number(x?.value||0),t=Number(C?.value||0);k&&(k.value=Math.max(0,e-t).toFixed(2))};x?.addEventListener("input",F),C?.addEventListener("input",F);const E=()=>{const e=s.querySelector("#srv-gst-preview"),t=s.querySelector("#srv-gstrate"),r=s.querySelector("#srv-gstpricing")?.value;if(!e||!t)return;const l=Number(x?.value||0),n=Number(C?.value||0),o=Math.max(0,l-n),d=t.value==="EX"?0:Number(t.value||0);if(!d){e.textContent=`No GST on this service: the customer pays ₹${l.toFixed(2)}.`;return}if(r==="INCL"){const y=o*100/(100+d);e.textContent=`Customer pays ₹${l.toFixed(2)} (fee ₹${n.toFixed(2)} + charge ₹${y.toFixed(2)} + GST ₹${(o-y).toFixed(2)}).`}else e.textContent=`Customer pays ₹${(l+o*d/100).toFixed(2)} (fee ₹${n.toFixed(2)} + charge ₹${o.toFixed(2)} + GST ${d}% ₹${(o*d/100).toFixed(2)}).`};[x,C].forEach(e=>e?.addEventListener("input",E)),["#srv-gstrate","#srv-gstpricing"].forEach(e=>s.querySelector(e)?.addEventListener("change",E)),E();const P=async(e,t=!1)=>{const r=g.find(U=>U.id===e);if(!r)return;const l=s.querySelector(`.inline-srv-name[data-id="${e}"]`)?.value.trim()||r.name,n=p(s.querySelector(`.inline-srv-price[data-id="${e}"]`)?.value||0),o=p(s.querySelector(`.inline-srv-govt[data-id="${e}"]`)?.value||0),d=p(s.querySelector(`.inline-srv-comm[data-id="${e}"]`)?.value||0),y=!!s.querySelector(`.inline-srv-active[data-id="${e}"]`)?.checked,m=Math.max(0,n-o);Object.assign(r,{name:l,customerPricePaise:n,govtFeePaise:o,serviceChargePaise:m,commissionPaise:d,active:y}),await L("services",r),D("SERVICE_UPDATED",{id:e});const I=typeof CSS<"u"&&CSS.escape?CSS.escape(e):e,N=s.querySelector(`#inline-op-${I}`);N&&(N.textContent=h(m));const w=s.querySelector(`#inline-saved-${I}`);w&&(w.textContent="✓ Auto-Saved",setTimeout(()=>{w&&(w.textContent="")},2200)),t&&(u=`Saved service "${l}" (${h(n)}).`,await c(s))};s.querySelectorAll(".inline-srv-name, .inline-srv-price, .inline-srv-govt, .inline-srv-comm, .inline-srv-active").forEach(e=>{const t=e.getAttribute("data-id");t&&(e.addEventListener("input",()=>{const r=Number(s.querySelector(`.inline-srv-price[data-id="${t}"]`)?.value||0),l=Number(s.querySelector(`.inline-srv-govt[data-id="${t}"]`)?.value||0),n=typeof CSS<"u"&&CSS.escape?CSS.escape(t):t,o=s.querySelector(`#inline-op-${n}`);o&&(o.textContent=h(p(Math.max(0,r-l)))),f.has(t)&&clearTimeout(f.get(t)),f.set(t,setTimeout(()=>{P(t,!1)},350))}),e.addEventListener("change",()=>{f.has(t)&&clearTimeout(f.get(t)),P(t,!1)}))}),s.querySelectorAll("[data-inline-save]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-inline-save");f.has(t)&&clearTimeout(f.get(t)),await P(t,!0)})}),s.querySelectorAll("#srv-cat-tabs .pill-tab").forEach(e=>{e.addEventListener("click",()=>{$=e.getAttribute("data-cat"),c(s)})}),s.querySelector("#srv-search-inp")?.addEventListener("input",e=>{A=e.target.value,c(s)}),s.querySelectorAll("[data-edit-srv]").forEach(e=>{e.addEventListener("click",()=>{v=e.getAttribute("data-edit-srv"),u="",c(s).then(()=>{s.querySelector("#srv-editor-card")?.scrollIntoView({behavior:"smooth",block:"center"})})})}),s.querySelectorAll("[data-del-srv]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-del-srv"),r=g.find(l=>l.id===t);await j("services",t),v===t&&(v=null),u=`Removed service "${r?.name||t}".`,await c(s)})}),s.querySelector("#srv-cancel-edit")?.addEventListener("click",()=>{v=null,c(s)}),s.querySelector("#service-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),r=p(t.get("customerPrice")),l=p(t.get("govtFee")),n=p(t.get("serviceCharge")),o=t.get("gstRate")==="EX",d=o?0:Number(t.get("gstRate")||0),y=!!t.get("id"),m=await L("services",{id:t.get("id")||J("SRV"),name:t.get("name").trim(),category:t.get("category").trim()||q[0],state:t.get("state").trim(),description:t.get("description")?.trim()||"",customerPricePaise:r,govtFeePaise:l,thirdPartyPaise:0,serviceChargePaise:n>0?n:Math.max(0,r-l),directCostPaise:0,commissionPaise:p(t.get("commission")),gstApplicable:d>0,gstRate:d,gstExempt:o,priceIncludesGst:t.get("gstPricing")==="INCL",sac:String(t.get("sac")||"").replace(/\D/g,"").slice(0,8),turnaroundTime:t.get("turnaroundTime"),checklist:t.get("checklist"),active:t.get("active")==="on"});D("SERVICE_UPDATED",{id:m.id}),v=null,u=y?`Updated service "${m.name}" (${h(m.customerPricePaise)}).`:`Created new service "${m.name}" (${h(m.customerPricePaise)}) and added to your catalogue.`,await c(s)})}export{q as SERVICE_CATEGORIES,c as renderServicesModule};
