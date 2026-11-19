import{getAllRecords as k,putRecord as x,deleteRecord as L}from"../core/db.js";import{safeHttpUrl as $,uid as T,formatINR as C,toPaise as A,esc as l}from"../core/utils.js";const m=["Central Government","Kerala","Maharashtra","Other States","CSC","Akshaya","E-Seva","Centre-Specific"],c="Techmin",b=[{id:"TM-COMPLYPRO",title:"ComplyPro",url:"https://www.complypro.co.in/",instructions:"Compliance services and updates from Techmin"},{id:"TM-TOOLS",title:"Finance and Accounting Tools",url:"https://tools.complypro.co.in/",instructions:"Online GST, PF, ESIC, payroll, income tax and accounting tools"},{id:"TM-TECHMIN",title:"Techmin Wealth Partners Website",url:"https://www.techmincsc.in/",instructions:"Techmin Wealth Partners — publisher of VLEBook"},{id:"TM-IFSC",title:"IFSC Tracker",url:"https://www.ifsctracker.in/",instructions:"Find bank branch IFSC and MICR codes"},{id:"TM-WHATSAPP",title:"VLEBook users WhatsApp group",url:"https://chat.whatsapp.com/Ld1LCqpqt7IH8id8xH4092",instructions:"Join the VLEBook community on WhatsApp for updates, tips and help"}].map(e=>({...e,group:c,state:"All India",category:"Techmin",processingTime:"Immediate",checklist:"",customerPricePaise:0,fixed:!0})),P="https://chat.whatsapp.com/Ld1LCqpqt7IH8id8xH4092";function E(e=""){return`<a class="btn btn-whatsapp ${e}" href="${P}" target="_blank" rel="noopener noreferrer" title="Opens WhatsApp to join the VLEBook users group"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg> Join VLEBook WhatsApp group</a>`}function V(e){s=e}function v(e){return $(e)}let s="ALL",i=null,f="";async function M(e,o){return s=c,d(e,"catalogue",o)}async function d(e,o="catalogue"){const h=o==="vault",g=(await k("catalogue_links")).filter(t=>t.group!==c&&!String(t.id||"").startsWith("TM-")),y=[...b,...g],u=i?g.find(t=>t.id===i):null;i&&!u&&(i=null);const r=u||{group:m[0],state:"All India",customerPricePaise:0,processingTime:"",isSoftwareVault:h},S=y.filter(t=>{if(h&&!t.isSoftwareVault&&s==="VAULT_ONLY"||s!=="ALL"&&s!=="VAULT_ONLY"&&t.group!==s)return!1;if(f.trim()){const a=f.toLowerCase();return String(t.title||"").toLowerCase().includes(a)||String(t.url||"").toLowerCase().includes(a)||String(t.checklist||"").toLowerCase().includes(a)}return!0});e.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>${h?"Saved Links & Official Software / Driver Vault":"Government Service Catalogue & Portal Directory"}</h1>
        <p>${h?"Quick-access portal bookmarks and official biometric/DSC utility links":"State-aware directory of Central, Kerala Akshaya, Maharashtra Maha e-Seva & CSC services"}</p>
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
              <button class="pill-tab ${s==="ALL"?"active":""}" data-grp="ALL">All (${y.length})</button>
              <button class="pill-tab ${s===c?"active":""}" data-grp="${c}">Techmin</button>
              <button class="pill-tab ${s==="VAULT_ONLY"?"active":""}" data-grp="VAULT_ONLY">Software Vault</button>
              ${m.map(t=>`<button class="pill-tab ${s===t?"active":""}" data-grp="${l(t)}">${l(t)}</button>`).join("")}
            </div>
            <input type="search" class="form-control" id="cat-search" placeholder="Search portals, services or checklists..." value="${l(f)}" style="max-width:250px;">
          </div>
          ${s===c?`<div class="callout success" style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;"><span>Websites of Techmin Wealth Partners, publisher of VLEBook. These links are built in and cannot be edited or deleted.</span>${E()}</div>`:""}

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
                          <strong>${l(t.title)}</strong>
                          ${t.isSoftwareVault?'<span class="badge badge-info" style="margin-left:4px;">Vault Utility</span>':""}${t.fixed?'<span class="badge badge-success" style="margin-left:4px;">Techmin</span>':""}<br>
                          <small style="color:var(--color-text-muted);">Processing: ${l(t.processingTime||"Immediate")}</small>
                        </td>
                        <td><strong>${l(t.group)}</strong><br><small style="color:var(--color-text-muted);">${l(t.state||"All India")}</small></td>
                        <td>
                          <small><strong>Docs:</strong> ${l(t.checklist||"N/A")}</small><br>
                          <small style="color:var(--color-text-muted);">${l(t.instructions||"")}</small>
                        </td>
                        <td class="num">${t.customerPricePaise?C(t.customerPricePaise):"—"}</td>
                        <td>
                          ${v(t.url)?`<a href="${l(v(t.url))}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-teal">${t.fixed?"Open website ↗":"Open Portal ↗"}</a>`:'<small style="color:var(--color-danger);">Invalid link</small>'}
                        </td>
                        <td>
                          ${t.fixed?'<small style="color:var(--color-text-muted);" title="Built-in Techmin website">Built in</small>':`<span style="white-space:nowrap;"><button class="btn btn-xs btn-outline" data-edit-cat="${l(t.id)}" title="Edit this link">Edit</button> <button class="btn btn-xs btn-danger" data-del-cat="${l(t.id)}" title="Delete this link">Delete</button></span>`}
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
            <div class="card-title">${u?"Edit Portal Link":"Add Portal Link or Software Reference"}</div>
            ${u?'<button type="button" class="btn btn-sm btn-outline" id="cat-cancel-edit">Cancel edit</button>':""}
          </div>
          <form id="cat-add-form" class="form-grid" style="grid-template-columns:1fr;" data-no-draft-restore>
            <div class="form-group">
              <label class="form-label">Service / Utility Title <span class="req">*</span></label>
              <input type="text" class="form-control" name="title" required maxlength="150" placeholder="e.g. e-District Kerala / Morpho RD Guide" value="${l(r.title||"")}">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Group</label>
                <select class="form-control" name="group">
                  ${m.map(t=>`<option value="${l(t)}" ${r.group===t?"selected":""}>${l(t)}</option>`).join("")}${r.group&&!m.includes(r.group)?`<option selected>${l(r.group)}</option>`:""}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-control" name="state" maxlength="60" value="${l(r.state||"All India")}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Official URL <span class="req">*</span></label>
              <input type="url" class="form-control" name="url" required maxlength="500" placeholder="https://..." value="${l(r.url||"")}">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Customer Price Guide (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="price" value="${u?(Number(r.customerPricePaise||0)/100).toFixed(2):""}" placeholder="Your own fee">
              </div>
              <div class="form-group">
                <label class="form-label">Processing Time</label>
                <input type="text" class="form-control" name="processingTime" maxlength="60" value="${l(r.processingTime||"")}" placeholder="e.g. 3-7 Days">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Required Document Checklist</label>
              <input type="text" class="form-control" name="checklist" maxlength="300" placeholder="Aadhaar, Ration Card, Photo" value="${l(r.checklist||"")}">
            </div>
            <div class="form-group">
              <label class="form-label">Operator Instructions</label>
              <textarea class="form-control" name="instructions" rows="2" maxlength="1000" placeholder="Step-by-step instructions (Never store passwords)">${l(r.instructions||"")}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" name="isSoftwareVault" ${r.isSoftwareVault?"checked":""}> Classify under Software & Driver Vault
              </label>
            </div>
            <button type="submit" class="btn btn-primary">${u?"Save Changes":"Save to Directory"}</button>
          </form>
        </div>
      </div>
    </div>
  `,e.querySelectorAll("#cat-group-tabs .pill-tab").forEach(t=>{t.addEventListener("click",()=>{s=t.getAttribute("data-grp"),d(e,o)})}),e.querySelector("#cat-search")?.addEventListener("input",t=>{f=t.target.value,d(e,o)}),e.querySelectorAll("[data-edit-cat]").forEach(t=>{t.addEventListener("click",()=>{const a=t.getAttribute("data-edit-cat");b.some(p=>p.id===a)||(i=a,d(e,o),e.querySelector("#cat-add-form [name=title]")?.focus())})}),e.querySelector("#cat-cancel-edit")?.addEventListener("click",()=>{i=null,d(e,o)}),e.querySelectorAll("[data-del-cat]").forEach(t=>{t.addEventListener("click",async()=>{const a=t.getAttribute("data-del-cat");if(b.some(n=>n.id===a))return;const p=g.find(n=>n.id===a);confirm(`Delete “${p?.title||"this link"}” from the directory?`)&&(await L("catalogue_links",a),i===a&&(i=null),d(e,o))})}),e.querySelector("#cat-add-form")?.addEventListener("submit",async t=>{t.preventDefault();const a=new FormData(t.target);if(!v(a.get("url"))){alert("Enter a full web address starting with https:// (or http://).");return}const p=String(a.get("title")||"").trim();if(!p)return;const n=i?g.find(w=>w.id===i):null;await x("catalogue_links",{...n||{},id:n?n.id:T("CAT"),title:p,group:a.get("group")===c?m[0]:a.get("group"),state:a.get("state").trim(),url:a.get("url").trim(),customerPricePaise:A(a.get("price")),processingTime:a.get("processingTime").trim(),checklist:a.get("checklist").trim(),instructions:a.get("instructions").trim(),isSoftwareVault:a.get("isSoftwareVault")==="on"}),i=null,await d(e,o)})}export{m as CATALOGUE_GROUPS,c as TECHMIN_GROUP,b as TECHMIN_LINKS,P as WHATSAPP_GROUP_URL,d as renderCatalogueModule,M as renderTechminModule,v as safeUrl,V as setCatalogueGroup,E as whatsappButton};
