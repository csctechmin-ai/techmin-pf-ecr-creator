import{getAllRecords as G,putRecord as x,deleteRecord as M,DEFAULT_SERVICES as B}from"../core/db.js";import{notifyCrossTabSync as N,lineGstRate as O}from"../core/accounting.js";import{uid as V,formatINR as f,toPaise as c,fromPaise as m,esc as i}from"../core/utils.js";let h="ALL",w="",n=null,d="";const b=new Map,P=["Government & Citizen Services","Banking & Financial Services","Insurance & Agriculture","Digital & Commercial Services"];async function l(a){const p=await G("services"),s=n?p.find(e=>e.id===n):null,E=Array.from(new Set([...P,...p.map(e=>e.category).filter(Boolean)])),y=w.trim().toLowerCase(),A=p.filter(e=>h!=="ALL"&&e.category!==h?!1:y?String(e.name||"").toLowerCase().includes(y)||String(e.id||"").toLowerCase().includes(y)||String(e.category||"").toLowerCase().includes(y)||String(e.state||"").toLowerCase().includes(y):!0);a.innerHTML=`
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

    ${d?`<div class="callout success">
            <div><strong>${i(d)}</strong></div>
            <button class="btn btn-xs btn-outline" id="srv-clear-msg">Dismiss</button>
          </div>`:""}

    <div class="grid-sidebar-right">
      <!-- Left Column: Present Service List with Live Auto-Save Inline Editing -->
      <div>
        <div class="card">
          <div class="card-header">
            <div class="pill-tabs" id="srv-cat-tabs">
              <button class="pill-tab ${h==="ALL"?"active":""}" data-cat="ALL">All Services (${p.length})</button>
              ${E.map(e=>`<button class="pill-tab ${h===e?"active":""}" data-cat="${i(e)}">${i(e.split("&")[0].trim())}</button>`).join("")}
            </div>
            <input type="search" class="form-control" id="srv-search-inp" placeholder="Search service name or ID..." value="${i(w)}" style="max-width:240px;">
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
                ${A.length===0?'<tr><td colspan="7" style="text-align:center; padding:22px; color:var(--color-text-muted);">No matching services found. Use the form on the right to create a new service.</td></tr>':A.map(e=>`
                  <tr style="${n===e.id?"background:var(--color-info-bg);":""}">
                    <td>
                      <input type="text" class="form-control inline-srv-name" data-id="${i(e.id)}" value="${i(e.name)}" style="font-weight:600; margin-bottom:4px; padding:4px 8px;">
                      <small style="color:var(--color-text-muted); display:block;">
                        <span style="font-family:var(--font-mono);">${i(e.id)}</span> • ${i(e.category)} • ${i(e.checklist||"Standard checklist")}
                        <span id="inline-saved-${i(e.id)}" style="color:var(--color-success); font-weight:600; margin-left:6px;"></span>
                      </small>
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-price" data-id="${i(e.id)}" value="${m(e.customerPricePaise)}" style="padding:4px 8px; font-weight:600;">
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-govt" data-id="${i(e.id)}" value="${m(e.govtFeePaise)}" style="padding:4px 8px;">
                    </td>
                    <td class="num" id="inline-op-${i(e.id)}" style="color:var(--color-success); font-weight:700;">
                      ${f(e.serviceChargePaise)}
                    </td>
                    <td>
                      <input type="number" step="0.01" min="0" class="form-control inline-srv-comm" data-id="${i(e.id)}" value="${m(e.commissionPaise||0)}" style="padding:4px 8px;">
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
                <input type="text" class="form-control" name="category" list="srv-cat-datalist" required value="${i(s?.category||P[0])}">
                <datalist id="srv-cat-datalist">
                  ${E.map(e=>`<option value="${i(e)}"></option>`).join("")}
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
                <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" id="srv-price" required value="${s?m(s.customerPricePaise):"100"}">
              </div>
              <div class="form-group">
                <label class="form-label">Govt / Challan Fee (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="govtFee" id="srv-govt" value="${s?m(s.govtFeePaise):"20"}">
              </div>
            </div>

            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Operator Charge (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="serviceCharge" id="srv-charge" value="${s?m(s.serviceChargePaise):"80"}">
              </div>
              <div class="form-group">
                <label class="form-label">Direct Cost (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="directCost" value="${s?m(s.directCostPaise||0):"5"}">
              </div>
              <div class="form-group">
                <label class="form-label">Commission (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="commission" value="${s?m(s.commissionPaise||0):"0"}">
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
                <select class="form-control" name="gstRate">
                  ${[0,5,12,18,28].map(e=>`<option value="${e}" ${(s?O(s):18)===e?"selected":""}>${e?`${e}% GST`:"No GST (0%)"}</option>`).join("")}
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
  `,a.querySelector("#srv-clear-msg")?.addEventListener("click",()=>{d="",l(a)}),a.querySelector("#srv-focus-create-btn")?.addEventListener("click",()=>{n=null,d="",l(a).then(()=>{const e=a.querySelector("#srv-form-name");e?.focus(),e?.scrollIntoView({behavior:"smooth",block:"center"})})}),a.querySelector("#srv-restore-defaults-btn")?.addEventListener("click",async()=>{const e=new Set(p.map(r=>r.id));let t=0;for(const r of B)e.has(r.id)||(await x("services",r),t++);d=t>0?`Restored ${t} default service(s) to your catalogue.`:"All default services are already present.",await l(a)});const q=a.querySelector("#srv-price"),L=a.querySelector("#srv-govt"),k=a.querySelector("#srv-charge"),R=()=>{const e=Number(q?.value||0),t=Number(L?.value||0);k&&(k.value=Math.max(0,e-t).toFixed(2))};q?.addEventListener("input",R),L?.addEventListener("input",R);const $=async(e,t=!1)=>{const r=p.find(F=>F.id===e);if(!r)return;const o=a.querySelector(`.inline-srv-name[data-id="${e}"]`)?.value.trim()||r.name,v=c(a.querySelector(`.inline-srv-price[data-id="${e}"]`)?.value||0),u=c(a.querySelector(`.inline-srv-govt[data-id="${e}"]`)?.value||0),C=c(a.querySelector(`.inline-srv-comm[data-id="${e}"]`)?.value||0),g=!!a.querySelector(`.inline-srv-active[data-id="${e}"]`)?.checked,T=Math.max(0,v-u);Object.assign(r,{name:o,customerPricePaise:v,govtFeePaise:u,serviceChargePaise:T,commissionPaise:C,active:g}),await x("services",r),N("SERVICE_UPDATED",{id:e});const I=typeof CSS<"u"&&CSS.escape?CSS.escape(e):e,D=a.querySelector(`#inline-op-${I}`);D&&(D.textContent=f(T));const S=a.querySelector(`#inline-saved-${I}`);S&&(S.textContent="✓ Auto-Saved",setTimeout(()=>{S&&(S.textContent="")},2200)),t&&(d=`Saved service "${o}" (${f(v)}).`,await l(a))};a.querySelectorAll(".inline-srv-name, .inline-srv-price, .inline-srv-govt, .inline-srv-comm, .inline-srv-active").forEach(e=>{const t=e.getAttribute("data-id");t&&(e.addEventListener("input",()=>{const r=Number(a.querySelector(`.inline-srv-price[data-id="${t}"]`)?.value||0),o=Number(a.querySelector(`.inline-srv-govt[data-id="${t}"]`)?.value||0),v=typeof CSS<"u"&&CSS.escape?CSS.escape(t):t,u=a.querySelector(`#inline-op-${v}`);u&&(u.textContent=f(c(Math.max(0,r-o)))),b.has(t)&&clearTimeout(b.get(t)),b.set(t,setTimeout(()=>{$(t,!1)},350))}),e.addEventListener("change",()=>{b.has(t)&&clearTimeout(b.get(t)),$(t,!1)}))}),a.querySelectorAll("[data-inline-save]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-inline-save");b.has(t)&&clearTimeout(b.get(t)),await $(t,!0)})}),a.querySelectorAll("#srv-cat-tabs .pill-tab").forEach(e=>{e.addEventListener("click",()=>{h=e.getAttribute("data-cat"),l(a)})}),a.querySelector("#srv-search-inp")?.addEventListener("input",e=>{w=e.target.value,l(a)}),a.querySelectorAll("[data-edit-srv]").forEach(e=>{e.addEventListener("click",()=>{n=e.getAttribute("data-edit-srv"),d="",l(a).then(()=>{a.querySelector("#srv-editor-card")?.scrollIntoView({behavior:"smooth",block:"center"})})})}),a.querySelectorAll("[data-del-srv]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-del-srv"),r=p.find(o=>o.id===t);await M("services",t),n===t&&(n=null),d=`Removed service "${r?.name||t}".`,await l(a)})}),a.querySelector("#srv-cancel-edit")?.addEventListener("click",()=>{n=null,l(a)}),a.querySelector("#service-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),r=c(t.get("customerPrice")),o=c(t.get("govtFee")),v=c(t.get("serviceCharge")),u=Number(t.get("gstRate")||0),C=!!t.get("id"),g=await x("services",{id:t.get("id")||V("SRV"),name:t.get("name").trim(),category:t.get("category").trim()||P[0],state:t.get("state").trim(),description:t.get("description")?.trim()||"",customerPricePaise:r,govtFeePaise:o,thirdPartyPaise:0,serviceChargePaise:v>0?v:Math.max(0,r-o),directCostPaise:c(t.get("directCost")),commissionPaise:c(t.get("commission")),gstApplicable:u>0,gstRate:u,sac:String(t.get("sac")||"").replace(/\D/g,"").slice(0,8),turnaroundTime:t.get("turnaroundTime"),checklist:t.get("checklist"),active:t.get("active")==="on"});N("SERVICE_UPDATED",{id:g.id}),n=null,d=C?`Updated service "${g.name}" (${f(g.customerPricePaise)}).`:`Created new service "${g.name}" (${f(g.customerPricePaise)}) and added to your catalogue.`,await l(a)})}export{P as SERVICE_CATEGORIES,l as renderServicesModule};
