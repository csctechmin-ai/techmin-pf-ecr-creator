import{getAllRecords as U,putRecord as A,deleteRecord as V,DEFAULT_SERVICES as j}from"../core/db.js";import{notifyCrossTabSync as G,lineGstRate as D}from"../core/accounting.js";import{hsnContext as _,hsnFieldHTML as H,wireHsnField as X}from"./hsn-field.js";import{uid as z,formatINR as y,toPaise as p,fromPaise as f,esc as i}from"../core/utils.js";let $="ALL",L="",v=null,u="";const b=new Map,q=["Government & Citizen Services","Banking & Financial Services","Insurance & Agriculture","Digital & Commercial Services"];async function n(s){const M=await(await import("../core/gst.js")).ratesInForce().catch(()=>[0,5,12,18,28]),B=await _(),g=await U("services"),a=v?g.find(e=>e.id===v):null,T=Array.from(new Set([...q,...g.map(e=>e.category).filter(Boolean)])),S=L.trim().toLowerCase(),k=g.filter(e=>$!=="ALL"&&e.category!==$?!1:S?String(e.name||"").toLowerCase().includes(S)||String(e.id||"").toLowerCase().includes(S)||String(e.category||"").toLowerCase().includes(S)||String(e.state||"").toLowerCase().includes(S):!0);s.innerHTML=`
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
                      ${y(e.serviceChargePaise)}
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
        <div class="card" id="srv-editor-card" style="${a?"border:1.5px solid var(--color-brand);":""}">
          <div class="card-header">
            <div class="card-title">
              ${a?`Edit Service: ${i(a.name)}`:"Create New Service"}
            </div>
            ${a?'<button class="btn btn-xs btn-outline" id="srv-cancel-edit">+ Create New</button>':'<span class="badge badge-info" style="font-size:10.5px;">Draft Auto-Saves</span>'}
          </div>
          <form id="service-entry-form" class="form-grid" style="grid-template-columns:1fr;">
            <input type="hidden" name="id" value="${i(a?.id||"")}">
            <div class="form-group">
              <label class="form-label">Service Name <span class="req">*</span></label>
              <input type="text" class="form-control" name="name" id="srv-form-name" required placeholder="e.g. Ration Card Member Addition / Color Print" value="${i(a?.name||"")}">
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" class="form-control" name="category" list="srv-cat-datalist" required value="${i(a?.category||q[0])}">
                <datalist id="srv-cat-datalist">
                  ${T.map(e=>`<option value="${i(e)}"></option>`).join("")}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">State / Jurisdiction</label>
                <input type="text" class="form-control" name="state" value="${i(a?.state||"Kerala / All India")}">
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Customer Price (₹) <span class="req">*</span></label>
                <input type="number" step="0.01" min="0" class="form-control" name="customerPrice" id="srv-price" required value="${a?f(a.customerPricePaise):"100"}">
              </div>
              <div class="form-group">
                <label class="form-label">Govt / Challan Fee (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="govtFee" id="srv-govt" value="${a?f(a.govtFeePaise):"20"}">
              </div>
            </div>

            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Operator Charge (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="serviceCharge" id="srv-charge" value="${a?f(a.serviceChargePaise):"80"}">
              </div>
              <div class="form-group">
                <label class="form-label">GST on this price</label>
                <select class="form-control" name="gstPricing" id="srv-gstpricing">
                  <option value="PLUS" ${a?.priceIncludesGst?"":"selected"}>Price + GST (GST added on top)</option>
                  <option value="INCL" ${a?.priceIncludesGst?"selected":""}>Price includes GST</option>
                </select>
                <div class="form-hint" id="srv-gst-preview">Used only on tax invoices (GST-registered regular dealers).</div>
              </div>
              <div class="form-group">
                <label class="form-label">Commission (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="commission" value="${a?f(a.commissionPaise||0):"0"}">
                <div class="form-hint">Only the commission you actually receive for this service, if any. VLEBook does not add any commission rates.</div>
              </div>
            </div>

            <div class="grid-2" style="gap:10px;">
              <div class="form-group">
                <label class="form-label">Turnaround Time</label>
                <input type="text" class="form-control" name="turnaroundTime" placeholder="e.g. Same Day / 3-5 Days" value="${i(a?.turnaroundTime||"Same Day")}">
              </div>
              <div class="form-group">
                <label class="form-label">GST Rate (%)</label>
                <select class="form-control" name="gstRate" id="srv-gstrate">
                  ${[...new Set([...M,...a&&!a.gstExempt?[D(a)]:[]])].sort((e,t)=>e-t).map(e=>`<option value="${e}" ${!a?.gstExempt&&(a?D(a):18)===e?"selected":""}>${e?`${e}% GST`:"Nil rated (0%)"}</option>`).join("")}
                  <option value="EX" ${a?.gstExempt?"selected":""}>Exempt from GST</option>
                </select>
                <div class="form-hint">Used only on GST bills, on the service charge (never on the government fee).</div>
              </div>
              ${H(B,{name:"sac",value:a?.sac||"",kind:"SAC"})}
            </div>

            <div class="form-group">
              <label class="form-label">Required Document Checklist</label>
              <input type="text" class="form-control" name="checklist" placeholder="Aadhaar, Ration Card, Photo, Tax Receipt" value="${i(a?.checklist||"")}">
            </div>

            <div class="form-group">
              <label class="form-label">Service Description / Notes</label>
              <input type="text" class="form-control" name="description" placeholder="Optional service description" value="${i(a?.description||"")}">
            </div>

            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" name="active" ${a?.active!==!1?"checked":""}> Service is Active in Counter Billing
              </label>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; padding:10px;">
              ${a?"Save Service Changes":"Create & Add Service to Catalogue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,X(s,()=>n(s)),s.querySelector("#srv-clear-msg")?.addEventListener("click",()=>{u="",n(s)}),s.querySelector("#srv-focus-create-btn")?.addEventListener("click",()=>{v=null,u="",n(s).then(()=>{const e=s.querySelector("#srv-form-name");e?.focus(),e?.scrollIntoView({behavior:"smooth",block:"center"})})}),s.querySelector("#srv-restore-defaults-btn")?.addEventListener("click",async()=>{const e=new Set(g.map(r=>r.id));let t=0;for(const r of j)e.has(r.id)||(await A("services",r),t++);u=t>0?`Restored ${t} default service(s) to your catalogue.`:"All default services are already present.",await n(s)});const x=s.querySelector("#srv-price"),C=s.querySelector("#srv-govt"),F=s.querySelector("#srv-charge"),I=()=>{const e=Number(x?.value||0),t=Number(C?.value||0);F&&(F.value=Math.max(0,e-t).toFixed(2))};x?.addEventListener("input",I),C?.addEventListener("input",I);const P=()=>{const e=s.querySelector("#srv-gst-preview"),t=s.querySelector("#srv-gstrate"),r=s.querySelector("#srv-gstpricing")?.value;if(!e||!t)return;const l=Number(x?.value||0),c=Number(C?.value||0),o=Math.max(0,l-c),d=t.value==="EX"?0:Number(t.value||0);if(!d){e.textContent=`No GST on this service: the customer pays ₹${l.toFixed(2)}.`;return}if(r==="INCL"){const h=o*100/(100+d);e.textContent=`Customer pays ₹${l.toFixed(2)} (fee ₹${c.toFixed(2)} + charge ₹${h.toFixed(2)} + GST ₹${(o-h).toFixed(2)}).`}else e.textContent=`Customer pays ₹${(l+o*d/100).toFixed(2)} (fee ₹${c.toFixed(2)} + charge ₹${o.toFixed(2)} + GST ${d}% ₹${(o*d/100).toFixed(2)}).`};[x,C].forEach(e=>e?.addEventListener("input",P)),["#srv-gstrate","#srv-gstpricing"].forEach(e=>s.querySelector(e)?.addEventListener("change",P)),P();const E=async(e,t=!1)=>{const r=g.find(O=>O.id===e);if(!r)return;const l=s.querySelector(`.inline-srv-name[data-id="${e}"]`)?.value.trim()||r.name,c=p(s.querySelector(`.inline-srv-price[data-id="${e}"]`)?.value||0),o=p(s.querySelector(`.inline-srv-govt[data-id="${e}"]`)?.value||0),d=p(s.querySelector(`.inline-srv-comm[data-id="${e}"]`)?.value||0),h=!!s.querySelector(`.inline-srv-active[data-id="${e}"]`)?.checked,m=Math.max(0,c-o);Object.assign(r,{name:l,customerPricePaise:c,govtFeePaise:o,serviceChargePaise:m,commissionPaise:d,active:h}),await A("services",r),G("SERVICE_UPDATED",{id:e});const R=typeof CSS<"u"&&CSS.escape?CSS.escape(e):e,N=s.querySelector(`#inline-op-${R}`);N&&(N.textContent=y(m));const w=s.querySelector(`#inline-saved-${R}`);w&&(w.textContent="✓ Auto-Saved",setTimeout(()=>{w&&(w.textContent="")},2200)),t&&(u=`Saved service "${l}" (${y(c)}).`,await n(s))};s.querySelectorAll(".inline-srv-name, .inline-srv-price, .inline-srv-govt, .inline-srv-comm, .inline-srv-active").forEach(e=>{const t=e.getAttribute("data-id");t&&(e.addEventListener("input",()=>{const r=Number(s.querySelector(`.inline-srv-price[data-id="${t}"]`)?.value||0),l=Number(s.querySelector(`.inline-srv-govt[data-id="${t}"]`)?.value||0),c=typeof CSS<"u"&&CSS.escape?CSS.escape(t):t,o=s.querySelector(`#inline-op-${c}`);o&&(o.textContent=y(p(Math.max(0,r-l)))),b.has(t)&&clearTimeout(b.get(t)),b.set(t,setTimeout(()=>{E(t,!1)},350))}),e.addEventListener("change",()=>{b.has(t)&&clearTimeout(b.get(t)),E(t,!1)}))}),s.querySelectorAll("[data-inline-save]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-inline-save");b.has(t)&&clearTimeout(b.get(t)),await E(t,!0)})}),s.querySelectorAll("#srv-cat-tabs .pill-tab").forEach(e=>{e.addEventListener("click",()=>{$=e.getAttribute("data-cat"),n(s)})}),s.querySelector("#srv-search-inp")?.addEventListener("input",e=>{L=e.target.value,n(s)}),s.querySelectorAll("[data-edit-srv]").forEach(e=>{e.addEventListener("click",()=>{v=e.getAttribute("data-edit-srv"),u="",n(s).then(()=>{s.querySelector("#srv-editor-card")?.scrollIntoView({behavior:"smooth",block:"center"})})})}),s.querySelectorAll("[data-del-srv]").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-del-srv"),r=g.find(l=>l.id===t);await V("services",t),v===t&&(v=null),u=`Removed service "${r?.name||t}".`,await n(s)})}),s.querySelector("#srv-cancel-edit")?.addEventListener("click",()=>{v=null,n(s)}),s.querySelector("#service-entry-form")?.addEventListener("submit",async e=>{e.preventDefault();const t=new FormData(e.target),r=p(t.get("customerPrice")),l=p(t.get("govtFee")),c=p(t.get("serviceCharge")),o=t.get("gstRate")==="EX",d=o?0:Number(t.get("gstRate")||0),h=!!t.get("id"),m=await A("services",{id:t.get("id")||z("SRV"),name:t.get("name").trim(),category:t.get("category").trim()||q[0],state:t.get("state").trim(),description:t.get("description")?.trim()||"",customerPricePaise:r,govtFeePaise:l,thirdPartyPaise:0,serviceChargePaise:c>0?c:Math.max(0,r-l),directCostPaise:0,commissionPaise:p(t.get("commission")),gstApplicable:d>0,gstRate:d,gstExempt:o,priceIncludesGst:t.get("gstPricing")==="INCL",sac:String(t.get("sac")||"").replace(/\D/g,"").slice(0,8),turnaroundTime:t.get("turnaroundTime"),checklist:t.get("checklist"),active:t.get("active")==="on"});G("SERVICE_UPDATED",{id:m.id}),v=null,u=h?`Updated service "${m.name}" (${y(m.customerPricePaise)}).`:`Created new service "${m.name}" (${y(m.customerPricePaise)}) and added to your catalogue.`,await n(s)})}export{q as SERVICE_CATEGORIES,n as renderServicesModule};
