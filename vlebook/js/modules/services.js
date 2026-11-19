import{getAllRecords as O,putRecord as A,deleteRecord as U,DEFAULT_SERVICES as V}from"../core/db.js";import{notifyCrossTabSync as G,lineGstRate as D}from"../core/accounting.js";import{uid as j,formatINR as h,toPaise as p,fromPaise as f,esc as i}from"../core/utils.js";let $="ALL",L="",v=null,u="";const b=new Map,q=["Government & Citizen Services","Banking & Financial Services","Insurance & Agriculture","Digital & Commercial Services"];async function d(a){const M=await(await import("../core/gst.js")).ratesInForce().catch(()=>[0,5,12,18,28]),g=await O("services"),s=v?g.find(e=>e.id===v):null,T=Array.from(new Set([...q,...g.map(e=>e.category).filter(Boolean)])),S=L.trim().toLowerCase(),k=g.filter(e=>$!=="ALL"&&e.category!==$?!1:S?String(e.name||"").toLowerCase().includes(S)||String(e.id||"").toLowerCase().includes(S)||String(e.category||"").toLowerCase().includes(S)||String(e.state||"").toLowerCase().includes(S):!0);a.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Service Catalogue & Pricing Management</h1>
        <p>Edit existing service prices, government fees & checklists with instant auto-save, or create new centre services</p>
      </div>
      <div class="module-actions">
        <button class="btn btn-primary" id="srv-focus-create-btn">+ Create New Service</button>
        <button class="btn btn-outline" id="srv-restore-defaults-btn" title="Restore any missing default services without deleting your custom services">Restore Default Catalogue</button>
      </div>
    </div>

    ${u?`<div class="callout success">
            <div><strong>${i(u)}</strong></div>
            <button class="btn btn-xs btn-outline" id="srv-clear-msg">Dismiss</button>
          </div>`:""}

    <div class="grid-sidebar-right">
      <!-- Left Column: Present Service List with Live Auto-Save Inline Editing -->
      <div>
        <div class="card">
          <div class="card-header">
            <div class="pill-tabs" id="srv-cat-tabs">
              <button class="pill-tab ${$==="ALL"?"active":""}" data-cat="ALL">All Services (${g.length})</button>
              ${T.map(e=>`<button class="pill-tab ${$===e?"active":""}" data-cat="${i(e)}">${i(e.split("&")[0].trim())}</button>`).join("")}
            </div>
            <input type="search" class="form-control" id="srv-search-inp" placeholder="Search service name or ID..." value="${i(L)}" style="max-width:240px;">
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
                ${k.length===0?'<tr><td colspan="7" style="text-align:center; padding:22px; color:var(--color-text-muted);">No matching services found. Use the form on the right to create a new service.</td></tr>':k.map(e=>`
                  <tr style="${v===e.id?"background:var(--color-info-bg);":""}">
                    <td>
                      <input type="text" class="form-control inline-srv-name" data-id="${i(e.id)}" value="${i(e.name)}" style="font-weight:600; margin-bottom:4px; padding:4px 8px;">
                      <small style="color:var(--color-text-muted); display:block;">
                        <span style="font-family:var(--font-mono);">${i(e.id)}</span> • ${i(e.category)} • ${i(e.checklist||"Standard checklist")}
                        <span id="inline-saved-${i(e.id)}" style="color:var(--color-success); font-weight:600; margin-left:6px;"></span>
                      </small>
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-price" data-id="${i(e.id)}" value="${f(e.customerPricePaise)}" style="padding:4px 8px; font-weight:600;">
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-govt" data-id="${i(e.id)}" value="${f(e.govtFeePaise)}" style="padding:4px 8px;">
                    </td>
                    <td class="num" id="inline-op-${i(e.id)}" style="color:var(--color-success); font-weight:700;">
                      ${h(e.serviceChargePaise)}
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-comm" data-id="${i(e.id)}" value="${f(e.commissionPaise||0)}" style="padding:4px 8px;">
                    </td>
                    <td>
                      <input type="checkbox" class="inline-srv-active" data-id="${i(e.id)}" ${e.active!==!1?"checked":""} title="Active in Billing">
                    </td>
                    <td>
                      <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button class="btn btn-xs btn-outline" data-inline-save="${i(e.id)}" title="Save inline changes">Save</button>
                        <button class="btn btn-xs btn-outline" data-edit-srv="${i(e.id)}" title="Open in full editor">Edit</button>
                        <button class="btn btn-xs btn-danger" data-del-srv="${i(e.id)}" title="Delete service">×</button>
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
        <div class="card" id="srv-editor-card" style="${s?"border:1.5px solid var(--color-brand);":""}">
          <div class="card-header">
            <div class="card-title">
              ${s?`Edit Service: ${i(s.name)}`:"Create New Service"}
            </div>
            ${s?'<button class="btn btn-xs btn-outline" id="srv-cancel-edit">+ Create New</button>':'<span class="badge badge-info" style="font-size:10.5px;">Draft Auto-Saves</span>'}
          </div>
          <form id="service-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <input type="hidden" name="id" value="${i(s?.id||"")}">
            <div class="form-group">
              <label class="form-label">Service Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="name" id="srv-form-name" required placeholder="e.g. Ration Card Member Addition / Color Print" value="${i(s?.name||"")}">
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" class="form-control" name="category" list="srv-cat-datalist" required value="${i(s?.category||q[0])}">
                <datalist id="srv-cat-datalist">
                  ${T.map(e=>`<option value="${i(e)}"></option>`).join("")}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">State / Jurisdiction</label>
                <input type="text" class="form-control" name="state" value="${i(s?.state||"Kerala / All India")}">
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" id="srv-price" required value="${s?f(s.customerPricePaise):"100"}">
              </div>
              <div class="form-group">
                <label class="form-label">Govt / Challan Fee (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="govtFee" id="srv-govt" value="${s?f(s.govtFeePaise):"20"}">
              </div>
            </div>

            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Operator Charge (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="serviceCharge" id="srv-charge" value="${s?f(s.serviceChargePaise):"80"}">
              </div>
              <div class="form-group">
                <label class="form-label">GST on this price</label>
                <select class="form-control" name="gstPricing" id="srv-gstpricing">
                  <option value="PLUS" ${s?.priceIncludesGst?"":"selected"}>Price + GST (GST added on top)</option>
                  <option value="INCL" ${s?.priceIncludesGst?"selected":""}>Price includes GST</option>
                </select>
                <div class="form-hint" id="srv-gst-preview">Used only on tax invoices (GST-registered regular dealers).</div>
              </div>
              <div class="form-group">
                <label class="form-label">Commission (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="commission" value="${s?f(s.commissionPaise||0):"0"}">
                <div class="form-hint">Only the commission you actually receive for this service, if any. VLEBook does not add any commission rates.</div>
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Turnaround Time</label>
                <input type="text" class="form-control" name="turnaroundTime" placeholder="e.g. Same Day / 3-5 Days" value="${i(s?.turnaroundTime||"Same Day")}">
              </div>
              <div class="form-group">
                <label class="form-label">GST Rate (%)</label>
                <select class="form-control" name="gstRate" id="srv-gstrate">
                  ${[...new Set([...M,...s&&!s.gstExempt?[D(s)]:[]])].sort((e,t)=>e-t).map(e=>`<option value="${e}" ${!s?.gstExempt&&(s?D(s):18)===e?"selected":""}>${e?`${e}% GST`:"Nil rated (0%)"}</option>`).join("")}
                  <option value="EX" ${s?.gstExempt?"selected":""}>Exempt from GST</option>
                </select>
                <div class="form-hint">Used only on GST bills, on the service charge (never on the government fee).</div>
              </div>
              <div class="form-group">
                <label class="form-label">SAC code (optional)</label>
                <input type="text" class="form-control" name="sac" inputmode="numeric" maxlength="8" placeholder="e.g. 9985" value="${i(s?.sac||"")}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Required Document Checklist</label>
              <input type="text" class="form-control" name="checklist" placeholder="Aadhaar, Ration Card, Photo, Tax Receipt" value="${i(s?.checklist||"")}">
            </div>

            <div class="form-group">
              <label class="form-label">Service Description / Notes</label>
              <input type="text" class="form-control" name="description" placeholder="Optional service description" value="${i(s?.description||"")}">
            </div>

            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" name="active" ${s?.active!==!1?"checked":""}> Service is Active in Counter Billing
              </label>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:10px;">
              ${s?"Save Service Changes":"Create & Add Service to Catalogue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,a.querySelector("#srv-clear-msg")?.addEventListener("click",()=>{u="",d(a)}),a.querySelector("#srv-focus-create-btn")?.addEventListener("click",()=>{v=null,u="",d(a).then(()=>{const e=a.querySelector("#srv-form-name");e?.focus(),e?.scrollIntoView({behavior:"smooth",block:"center"})})}),a.querySelector("#srv-restore-defaults-btn")?.addEventListener("click",async()=>{const e=new Set(g.map(r=>r.id));let t=0;for(const r of V)e.has(r.id)||(await A("services",r),t++);u=t>0?`Restored ${t} default service(s) to your catalogue.`:"All default services are already present.",await d(a)});const x=a.querySelector("#srv-price"),C=a.querySelector("#srv-govt"),I=a.querySelector("#srv-charge"),R=()=>{const e=Number(x?.value||0),t=Number(C?.value||0);I&&(I.value=Math.max(0,e-t).toFixed(2))};x?.addEventListener("input",R),C?.addEventListener("input",R);const P=()=>{const e=a.querySelector("#srv-gst-preview"),t=a.querySelector("#srv-gstrate"),r=a.querySelector("#srv-gstpricing")?.value;if(!e||!t)return;const l=Number(x?.value||0),c=Number(C?.value||0),o=Math.max(0,l-c),n=t.value==="EX"?0:Number(t.value||0);if(!n){e.textContent=`No GST on this service: the customer pays ₹${l.toFixed(2)}.`;return}if(r==="INCL"){const y=o*100/(100+n);e.textContent=`Customer pays ₹${l.toFixed(2)} (fee ₹${c.toFixed(2)} + charge ₹${y.toFixed(2)} + GST ₹${(o-y).toFixed(2)}).`}else e.textContent=`Customer pays ₹${(l+o*n/100).toFixed(2)} (fee ₹${c.toFixed(2)} + charge ₹${o.toFixed(2)} + GST ${n}% ₹${(o*n/100).toFixed(2)}).`};[x,C].forEach(e=>e?.addEventListener("input",P)),["#srv-gstrate","#srv-gstpricing"].forEach(e=>a.querySelector(e)?.addEventListener("change",P)),P();const E=async(e,t=!1)=>{const r=g.find(B=>B.id===e);if(!r)return;const l=a.querySelector(`.inline-srv-name[data-id="${e}"]`)?.value.trim()||r.name,c=p(a.querySelector(`.inline-srv-price[data-id="${e}"]`)?.value||0),o=p(a.querySelector(`.inline-srv-govt[data-id="${e}"]`)?.value||0),n=p(a.querySelector(`.inline-srv-comm[data-id="${e}"]`)?.value||0),y=!!a.querySelector(`.inline-srv-active[data-id="${e}"]`)?.checked,m=Math.max(0,c-o);Object.assign(r,{name:l,customerPricePaise:c,govtFeePaise:o,serviceChargePaise:m,commissionPaise:n,active:y}),await A("services",r),G("SERVICE_UPDATED",{id:e});const F=typeof CSS<"u"&&CSS.escape?CSS.escape(e):e,N=a.querySelector(`#inline-op-${F}`);N&&(N.textContent=h(m));const w=a.querySelector(`#inline-saved-${F}`);w&&(w.textContent="✓ Auto-Saved",setTimeout(()=>{w&&(w.textContent="")},2200)),t&&(u=`Saved service "${l}" (${h(c)}).`,await d(a))};a.querySelectorAll(".inline-srv-name, .inline-srv-price, .inline-srv-govt, .inline-srv-comm, .inline-srv-active").forEach(e=>{const t=e.getAttribute("data-id");t&&(e.addEventListener("input",()=>{const r=Number(a.querySelector(`.inline-srv-price[data-id="${t}"]`)?.value||0),l=Number(a.querySelector(`.inline-srv-govt[data-id="${t}"]`)?.value||0),c=typeof CSS<"u"&&CSS.escape?CSS.escape(t):t,o=a.querySelector(`#inline-op-${c}`);o&&(o.textContent=h(p(Math.max(0,r-l)))),b.has(t)&&clearTimeout(b.get(t)),b.set(t,setTimeout(()=>{E(t,!1)},350))}),e.addEventListener("change",()=>{b.has(t)&&clearTimeout(b.get(t)),E(t,!1)}))}),a.querySelectorAll("[data-inline-save]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-inline-save");b.has(t)&&clearTimeout(b.get(t)),await E(t,!0)})}),a.querySelectorAll("#srv-cat-tabs .pill-tab").forEach(e=>{e.addEventListener("click",()=>{$=e.getAttribute("data-cat"),d(a)})}),a.querySelector("#srv-search-inp")?.addEventListener("input",e=>{L=e.target.value,d(a)}),a.querySelectorAll("[data-edit-srv]").forEach(e=>{e.addEventListener("click",()=>{v=e.getAttribute("data-edit-srv"),u="",d(a).then(()=>{a.querySelector("#srv-editor-card")?.scrollIntoView({behavior:"smooth",block:"center"})})})}),a.querySelectorAll("[data-del-srv]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-del-srv"),r=g.find(l=>l.id===t);await U("services",t),v===t&&(v=null),u=`Removed service "${r?.name||t}".`,await d(a)})}),a.querySelector("#srv-cancel-edit")?.addEventListener("click",()=>{v=null,d(a)}),a.querySelector("#service-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),r=p(t.get("customerPrice")),l=p(t.get("govtFee")),c=p(t.get("serviceCharge")),o=t.get("gstRate")==="EX",n=o?0:Number(t.get("gstRate")||0),y=!!t.get("id"),m=await A("services",{id:t.get("id")||j("SRV"),name:t.get("name").trim(),category:t.get("category").trim()||q[0],state:t.get("state").trim(),description:t.get("description")?.trim()||"",customerPricePaise:r,govtFeePaise:l,thirdPartyPaise:0,serviceChargePaise:c>0?c:Math.max(0,r-l),directCostPaise:0,commissionPaise:p(t.get("commission")),gstApplicable:n>0,gstRate:n,gstExempt:o,priceIncludesGst:t.get("gstPricing")==="INCL",sac:String(t.get("sac")||"").replace(/\D/g,"").slice(0,8),turnaroundTime:t.get("turnaroundTime"),checklist:t.get("checklist"),active:t.get("active")==="on"});G("SERVICE_UPDATED",{id:m.id}),v=null,u=y?`Updated service "${m.name}" (${h(m.customerPricePaise)}).`:`Created new service "${m.name}" (${h(m.customerPricePaise)}) and added to your catalogue.`,await d(a)})}export{q as SERVICE_CATEGORIES,d as renderServicesModule};
