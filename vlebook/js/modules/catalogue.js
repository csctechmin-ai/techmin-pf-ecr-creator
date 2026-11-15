import{getAllRecords as k,putRecord as w,deleteRecord as x}from"../core/db.js";import{safeHttpUrl as T,uid as L,formatINR as C,toPaise as P,esc as e}from"../core/utils.js";const p=["Central Government","Kerala","Maharashtra","Other States","CSC","Akshaya","E-Seva","Centre-Specific"],m="Techmin",f=[{id:"TM-COMPLYPRO",title:"ComplyPro",url:"https://www.complypro.co.in/",instructions:"Compliance services and updates from Techmin"},{id:"TM-TOOLS",title:"Finance and Accounting Tools",url:"https://tools.complypro.co.in/",instructions:"Online GST, PF, ESIC, payroll, income tax and accounting tools"},{id:"TM-TECHMIN",title:"Techmin Wealth Partners Website",url:"https://www.techmincsc.in/",instructions:"Techmin Wealth Partners — publisher of VLEBook"},{id:"TM-IFSC",title:"IFSC Tracker",url:"https://www.ifsctracker.in/",instructions:"Find bank branch IFSC and MICR codes"}].map(l=>({...l,group:m,state:"All India",category:"Techmin",processingTime:"Immediate",checklist:"",customerPricePaise:0,fixed:!0}));function v(l){return T(l)}let o="ALL",i=null,b="";async function O(l){l.innerHTML=`
    <div class="module-header"><div class="module-title-group"><h1>Techmin</h1><p>Websites of Techmin Wealth Partners, publisher of VLEBook</p></div></div>
    <div class="grid-2" style="gap:14px;">${f.map(r=>`<div class="card" style="margin:0;"><div class="card-title" style="margin-bottom:6px;">${e(r.title)}</div>
        <p style="margin:0 0 10px; color:var(--color-text-muted);">${e(r.instructions)}</p>
        <a class="btn btn-teal" href="${e(v(r.url))}" target="_blank" rel="noopener noreferrer">Open ${e(new URL(r.url).hostname.replace(/^www\./,""))} ↗</a></div>`).join("")}</div>
    <p class="form-hint" style="margin-top:12px;">These links are part of VLEBook and cannot be edited or deleted. They also appear in the Techmin tab of the Government Service Catalogue.</p>`}async function u(l,r="catalogue"){const g=r==="vault",h=(await k("catalogue_links")).filter(t=>t.group!==m&&!String(t.id||"").startsWith("TM-")),y=[...f,...h],c=i?h.find(t=>t.id===i):null;i&&!c&&(i=null);const s=c||{group:p[0],state:"All India",customerPricePaise:0,processingTime:"",isSoftwareVault:g},S=y.filter(t=>{if(g&&!t.isSoftwareVault&&o==="VAULT_ONLY"||o!=="ALL"&&o!=="VAULT_ONLY"&&t.group!==o)return!1;if(b.trim()){const a=b.toLowerCase();return String(t.title||"").toLowerCase().includes(a)||String(t.url||"").toLowerCase().includes(a)||String(t.checklist||"").toLowerCase().includes(a)}return!0});l.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>${g?"Saved Links & Official Software / Driver Vault":"Government Service Catalogue & Portal Directory"}</h1>
        <p>${g?"Quick-access portal bookmarks and official biometric/DSC utility links":"State-aware directory of Central, Kerala Akshaya, Maharashtra Maha e-Seva & CSC services"}</p>
      </div>
    </div>

    <div class="callout">
      <div>
        <strong>Security & Compliance Policy:</strong> Do not store portal passwords or citizen login credentials here. For biometric RD services and DSC drivers, always link to official OEM / government portals rather than unauthorized third-party installers.
      </div>
    </div>

    <div class="grid-sidebar-right">
      <div>
        <div class="card">
          <div class="card-header">
            <div class="pill-tabs" id="cat-group-tabs">
              <button class="pill-tab ${o==="ALL"?"active":""}" data-grp="ALL">All (${y.length})</button>
              <button class="pill-tab ${o===m?"active":""}" data-grp="${m}">Techmin</button>
              <button class="pill-tab ${o==="VAULT_ONLY"?"active":""}" data-grp="VAULT_ONLY">Software Vault</button>
              ${p.map(t=>`<button class="pill-tab ${o===t?"active":""}" data-grp="${e(t)}">${e(t)}</button>`).join("")}
            </div>
            <input type="search" class="form-control" id="cat-search" placeholder="Search portals, services or checklists..." value="${e(b)}" style="max-width:250px;">
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Portal / Service Title</th>
                  <th>Group / State</th>
                  <th>Required Checklist & Instructions</th>
                  <th class="num">Fee Guide</th>
                  <th>Official Link</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${S.length===0?'<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--color-text-muted);">No matching portal links or catalogue items found.</td></tr>':S.map(t=>`
                      <tr>
                        <td>
                          <strong>${e(t.title)}</strong>
                          ${t.isSoftwareVault?'<span class="badge badge-info" style="margin-left:4px;">Vault Utility</span>':""}${t.fixed?'<span class="badge badge-success" style="margin-left:4px;">Techmin</span>':""}<br>
                          <small style="color:var(--color-text-muted);">Processing: ${e(t.processingTime||"Immediate")}</small>
                        </td>
                        <td><strong>${e(t.group)}</strong><br><small style="color:var(--color-text-muted);">${e(t.state||"All India")}</small></td>
                        <td>
                          <small><strong>Docs:</strong> ${e(t.checklist||"N/A")}</small><br>
                          <small style="color:var(--color-text-muted);">${e(t.instructions||"")}</small>
                        </td>
                        <td class="num">${t.customerPricePaise?C(t.customerPricePaise):"—"}</td>
                        <td>
                          ${v(t.url)?`<a href="${e(v(t.url))}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-teal">${t.fixed?"Open website ↗":"Open Portal ↗"}</a>`:'<small style="color:var(--color-danger);">Invalid link</small>'}
                        </td>
                        <td>
                          ${t.fixed?'<small style="color:var(--color-text-muted);" title="Built-in Techmin website">Built in</small>':`<span style="white-space:nowrap;"><button class="btn btn-xs btn-outline" data-edit-cat="${e(t.id)}" title="Edit this link">Edit</button> <button class="btn btn-xs btn-danger" data-del-cat="${e(t.id)}" title="Delete this link">Delete</button></span>`}
                        </td>
                      </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div class="card" data-autosave-scope="catalogue_form">
          <div class="card-header">
            <div class="card-title">${c?"Edit Portal Link":"Add Portal Link or Software Reference"}</div>
            ${c?'<button type="button" class="btn btn-sm btn-outline" id="cat-cancel-edit">Cancel edit</button>':""}
          </div>
          <form id="cat-add-form" class="form-grid" style="grid-template-columns:1fr;" data-no-draft-restore>
            <div class="form-group">
              <label class="form-label">Service / Utility Title <span class="req">*</span></label>
              <input type="text" class="form-control" name="title" required maxlength="150" placeholder="e.g. e-District Kerala / Morpho RD Guide" value="${e(s.title||"")}">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Group</label>
                <select class="form-control" name="group">
                  ${p.map(t=>`<option value="${e(t)}" ${s.group===t?"selected":""}>${e(t)}</option>`).join("")}${s.group&&!p.includes(s.group)?`<option selected>${e(s.group)}</option>`:""}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-control" name="state" maxlength="60" value="${e(s.state||"All India")}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Official URL <span class="req">*</span></label>
              <input type="url" class="form-control" name="url" required maxlength="500" placeholder="https://..." value="${e(s.url||"")}">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Customer Price Guide (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="price" value="${c?(Number(s.customerPricePaise||0)/100).toFixed(2):""}" placeholder="Your own fee">
              </div>
              <div class="form-group">
                <label class="form-label">Processing Time</label>
                <input type="text" class="form-control" name="processingTime" maxlength="60" value="${e(s.processingTime||"")}" placeholder="e.g. 3-7 Days">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Required Document Checklist</label>
              <input type="text" class="form-control" name="checklist" maxlength="300" placeholder="Aadhaar, Ration Card, Photo" value="${e(s.checklist||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Operator Instructions</label>
              <textarea class="form-control" name="instructions" rows="2" maxlength="1000" placeholder="Step-by-step instructions (Never store passwords)">${e(s.instructions||"")}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" name="isSoftwareVault" ${s.isSoftwareVault?"checked":""}> Classify under Software & Driver Vault
              </label>
            </div>
            <button type="submit" class="btn btn-primary">${c?"Save Changes":"Save to Directory"}</button>
          </form>
        </div>
      </div>
    </div>
  `,l.querySelectorAll("#cat-group-tabs .pill-tab").forEach(t=>{t.addEventListener("click",()=>{o=t.getAttribute("data-grp"),u(l,r)})}),l.querySelector("#cat-search")?.addEventListener("input",t=>{b=t.target.value,u(l,r)}),l.querySelectorAll("[data-edit-cat]").forEach(t=>{t.addEventListener("click",()=>{const a=t.getAttribute("data-edit-cat");f.some(d=>d.id===a)||(i=a,u(l,r),l.querySelector("#cat-add-form [name=title]")?.focus())})}),l.querySelector("#cat-cancel-edit")?.addEventListener("click",()=>{i=null,u(l,r)}),l.querySelectorAll("[data-del-cat]").forEach(t=>{t.addEventListener("click",async()=>{const a=t.getAttribute("data-del-cat");if(f.some(n=>n.id===a))return;const d=h.find(n=>n.id===a);confirm(`Delete “${d?.title||"this link"}” from the directory?`)&&(await x("catalogue_links",a),i===a&&(i=null),u(l,r))})}),l.querySelector("#cat-add-form")?.addEventListener("submit",async t=>{t.preventDefault();const a=new FormData(t.target);if(!v(a.get("url"))){alert("Enter a full web address starting with https:// (or http://).");return}const d=String(a.get("title")||"").trim();if(!d)return;const n=i?h.find($=>$.id===i):null;await w("catalogue_links",{...n||{},id:n?n.id:L("CAT"),title:d,group:a.get("group")===m?p[0]:a.get("group"),state:a.get("state").trim(),url:a.get("url").trim(),customerPricePaise:P(a.get("price")),processingTime:a.get("processingTime").trim(),checklist:a.get("checklist").trim(),instructions:a.get("instructions").trim(),isSoftwareVault:a.get("isSoftwareVault")==="on"}),i=null,await u(l,r)})}export{p as CATALOGUE_GROUPS,m as TECHMIN_GROUP,f as TECHMIN_LINKS,u as renderCatalogueModule,O as renderTechminModule,v as safeUrl};
