import{getAllRecords as p,putRecord as m,deleteRecord as v}from"../core/db.js";import{uid as g,formatINR as f,toPaise as b,esc as a}from"../core/utils.js";const u=["Central Government","Kerala","Maharashtra","Other States","CSC","Akshaya","E-Seva","Centre-Specific"];let r="ALL",i="";async function c(l,s="catalogue"){const o=s==="vault",d=await p("catalogue_links"),n=d.filter(t=>{if(o&&!t.isSoftwareVault&&r==="VAULT_ONLY"||r!=="ALL"&&r!=="VAULT_ONLY"&&t.group!==r)return!1;if(i.trim()){const e=i.toLowerCase();return String(t.title||"").toLowerCase().includes(e)||String(t.url||"").toLowerCase().includes(e)||String(t.checklist||"").toLowerCase().includes(e)}return!0});l.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>${o?"Saved Links & Official Software / Driver Vault":"Government Service Catalogue & Portal Directory"}</h1>
        <p>${o?"Quick-access portal bookmarks and official biometric/DSC utility links":"State-aware directory of Central, Kerala Akshaya, Maharashtra Maha e-Seva & CSC services"}</p>
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
              <button class="pill-tab ${r==="ALL"?"active":""}" data-grp="ALL">All (${d.length})</button>
              <button class="pill-tab ${r==="VAULT_ONLY"?"active":""}" data-grp="VAULT_ONLY">Software Vault</button>
              ${u.map(t=>`<button class="pill-tab ${r===t?"active":""}" data-grp="${a(t)}">${a(t)}</button>`).join("")}
            </div>
            <input type="search" class="form-control" id="cat-search" placeholder="Search portals, services or checklists..." value="${a(i)}" style="max-width:250px;">
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
                ${n.length===0?'<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--color-text-muted);">No matching portal links or catalogue items found.</td></tr>':n.map(t=>`
                      <tr>
                        <td>
                          <strong>${a(t.title)}</strong>
                          ${t.isSoftwareVault?'<span class="badge badge-info" style="margin-left:4px;">Vault Utility</span>':""}<br>
                          <small style="color:var(--color-text-muted);">Processing: ${a(t.processingTime||"Immediate")}</small>
                        </td>
                        <td><strong>${a(t.group)}</strong><br><small style="color:var(--color-text-muted);">${a(t.state||"All India")}</small></td>
                        <td>
                          <small><strong>Docs:</strong> ${a(t.checklist||"N/A")}</small><br>
                          <small style="color:var(--color-text-muted);">${a(t.instructions||"")}</small>
                        </td>
                        <td class="num">${t.customerPricePaise?f(t.customerPricePaise):"—"}</td>
                        <td>
                          <a href="${a(t.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-xs btn-teal">Open Portal ↗</a>
                        </td>
                        <td>
                          <button class="btn btn-xs btn-danger" data-del-cat="${a(t.id)}">×</button>
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
            <div class="card-title">Add Portal Link or Software Reference</div>
          </div>
          <form id="cat-add-form" class="form-grid" style="grid-template-columns:1fr;">
            <div class="form-group">
              <label class="form-label">Service / Utility Title <span class="req">*</span></label>
              <input type="text" class="form-control" name="title" required placeholder="e.g. e-District Kerala / Morpho RD Guide">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Group</label>
                <select class="form-control" name="group">
                  ${u.map(t=>`<option value="${a(t)}">${a(t)}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">State</label>
                <input type="text" class="form-control" name="state" value="All India">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Official URL <span class="req">*</span></label>
              <input type="url" class="form-control" name="url" required placeholder="https://...">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Customer Price Guide (₹)</label>
                <input type="number" step="0.01" min="0" class="form-control" name="price" value="50">
              </div>
              <div class="form-group">
                <label class="form-label">Processing Time</label>
                <input type="text" class="form-control" name="processingTime" value="3-7 Days">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Required Document Checklist</label>
              <input type="text" class="form-control" name="checklist" placeholder="Aadhaar, Ration Card, Photo">
            </div>
            <div class="form-group">
              <label class="form-label">Operator Instructions</label>
              <textarea class="form-control" name="instructions" rows="2" placeholder="Step-by-step instructions (Never store passwords)"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" name="isSoftwareVault" ${o?"checked":""}> Classify under Software & Driver Vault
              </label>
            </div>
            <button type="submit" class="btn btn-primary">Save to Directory</button>
          </form>
        </div>
      </div>
    </div>
  `,l.querySelectorAll("#cat-group-tabs .pill-tab").forEach(t=>{t.addEventListener("click",()=>{r=t.getAttribute("data-grp"),c(l,s)})}),l.querySelector("#cat-search")?.addEventListener("input",t=>{i=t.target.value,c(l,s)}),l.querySelectorAll("[data-del-cat]").forEach(t=>{t.addEventListener("click",async()=>{await v("catalogue_links",t.getAttribute("data-del-cat")),c(l,s)})}),l.querySelector("#cat-add-form")?.addEventListener("submit",async t=>{t.preventDefault();const e=new FormData(t.target);await m("catalogue_links",{id:g("CAT"),title:e.get("title").trim(),group:e.get("group"),state:e.get("state").trim(),url:e.get("url").trim(),customerPricePaise:b(e.get("price")),processingTime:e.get("processingTime").trim(),checklist:e.get("checklist").trim(),instructions:e.get("instructions").trim(),isSoftwareVault:e.get("isSoftwareVault")==="on"}),await c(l,s)})}export{u as CATALOGUE_GROUPS,c as renderCatalogueModule};
