import{getAllRecords as k,putRecord as Y}from"../core/db.js";import{uid as G,todayISO as q,formatINR as Q,toPaise as J,esc as S,drawQRCodeOnCanvas as W,downloadFile as _}from"../core/utils.js";const F=[["HOME","Studio home"],["PDF","PDF Tools"],["IMAGE","Image Tools"],["PHOTO","Photo & Signature"],["SCAN","Document scanner"],["PVC","PVC ID & Print"],["PRINT","Print & printers"],["UTIL","QR, Stamp & Calculators"],["HISTORY","Job history"]];let P="HOME",$="QR_STAMP",U="";function K(t,n=null){t==="OCR"&&(t="SCAN"),F.some(([d])=>d===t)&&(P=t),n&&(L=n)}let L=null;async function O(t,n){const[d,f,T]=await Promise.all([k("customers"),k("services"),k("workbench_jobs")]),v=sessionStorage.getItem("vlebook_preselect_customer");v&&(sessionStorage.removeItem("vlebook_preselect_customer"),U=v);const l=[...T].sort((e,a)=>String(a.createdAt||a.date).localeCompare(String(e.createdAt||e.date)));t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>PDF & Image Studio</h1>
        <p>PDF tools, image tools, government photo & signature sizes, document scanner and PVC ID printing — all on this computer, nothing uploaded</p>
      </div>
    </div>
    <div class="studio-nav" role="tablist">${F.map(([e,a])=>`<button class="studio-ws ${P===e?"active":""}" data-ws="${e}" role="tab">${S(a)}</button>`).join("")}</div>

    <div class="card studio-jobbar">
      <div class="studio-inline">
        <label class="form-label" style="margin:0">Customer</label>
        <select class="form-control" id="wb-customer-select" style="max-width:260px">
          <option value="">— Walk-in (no record) —</option>
          ${d.map(e=>`<option value="${S(e.id)}" ${U===e.id?"selected":""}>${S(e.name)} (${S(e.mobile||"")})</option>`).join("")}
        </select>
        <label class="form-label" style="margin:0">Service</label>
        <select class="form-control" id="wb-service-select" style="max-width:260px">
          ${f.map(e=>`<option value="${S(e.id)}" data-name="${S(e.name)}" data-price="${e.customerPricePaise}" data-govt="${e.govtFeePaise}">${S(e.name)} (${Q(e.customerPricePaise)})</option>`).join("")}
        </select>
        <button class="btn btn-sm btn-teal" id="wb-log-only-btn">Log job</button>
        <button class="btn btn-sm btn-gold" id="wb-add-to-bill-btn">Log & add to bill →</button>
      </div>
      <div class="form-hint">Files are processed in this browser and not stored. Customer documents are not kept in the job log — only what was done.</div>
    </div>

    <div id="wb-active-panel" class="studio-panel"></div>`,t.querySelectorAll("[data-ws]").forEach(e=>e.addEventListener("click",()=>{P=e.dataset.ws,O(t,n)})),t.querySelector("#wb-customer-select")?.addEventListener("change",e=>U=e.target.value);const c=async(e=!1)=>{const a=t.querySelector("#wb-customer-select")?.value||"CUST-WALKIN",r=d.find(g=>g.id===a),u=t.querySelector("#wb-service-select")?.selectedOptions[0],i=u?.value||"",p=u?.getAttribute("data-name")||"Document service",h=Number(u?.getAttribute("data-price")||J(0)),E=Number(u?.getAttribute("data-govt")||0),b=await Y("workbench_jobs",{id:G("WB"),date:q(),createdAt:new Date().toISOString(),customerId:a,customerName:r?.name||"Walk-in Citizen",toolType:`Studio: ${F.find(([g])=>g===P)?.[1]||P}`,serviceId:i,outputSummary:`${p} prepared in the studio`,chargePaise:h,retentionPolicy:"Files not stored",status:"COMPLETED"});if(e)r&&sessionStorage.setItem("vlebook_preselect_customer",r.id),sessionStorage.setItem("vlebook_workbench_bill_item",JSON.stringify({id:G("LN"),serviceId:i,serviceName:`${p} (${b.id})`,category:"Digital & Commercial Services",qty:1,ratePaise:h,govtFeePaise:E,thirdPartyPaise:0,commissionPaise:0,discountPaise:0})),n("billing");else{const g=t.querySelector("#wb-log-only-btn");g.textContent=`Logged ${b.id}`,setTimeout(()=>g.textContent="Log job",2500)}};t.querySelector("#wb-log-only-btn")?.addEventListener("click",()=>c(!1)),t.querySelector("#wb-add-to-bill-btn")?.addEventListener("click",()=>c(!0));const s=t.querySelector("#wb-active-panel"),o={customerId:()=>t.querySelector("#wb-customer-select")?.value||"CUST-WALKIN",customerName:()=>d.find(e=>e.id===t.querySelector("#wb-customer-select")?.value)?.name||"Walk-in Citizen"};if(P==="HOME")z(s,l,t,n);else if(P==="PDF"||P==="IMAGE"){const e=await import("./tools.js");L&&(e.setActiveTool(L),L=null),await e.renderToolsModule(s,n,{embedded:!0,group:P==="IMAGE"?"IMAGE":"PDF"})}else P==="PHOTO"?(await import("./studio-photo.js")).renderPhotoWorkspace(s,o):P==="SCAN"?(await import("./studio-scan.js")).renderScanWorkspace(s,o):P==="PVC"?(await import("./studio-pvc.js")).renderPvcWorkspace(s,o):P==="PRINT"?(await import("./printdialog.js")).renderPrintWorkspace(s):P==="UTIL"?(s.innerHTML=`<div class="pill-tabs" id="wb-util-tabs"><button class="pill-tab ${$==="QR_STAMP"?"active":""}" data-ut="QR_STAMP">QR codes & centre stamp</button><button class="pill-tab ${$==="CALCULATORS"?"active":""}" data-ut="CALCULATORS">Age, GST, EMI & text utilities</button></div><div id="wb-util">${tt($)}</div>`,s.querySelectorAll("[data-ut]").forEach(e=>e.addEventListener("click",()=>{$=e.dataset.ut,O(t,n)})),et(s,$)):P==="HISTORY"&&Z(s,l)}function z(t,n,d,f){const T=(s,o)=>{K(s,o),O(d,f)},v=[["PDF","MERGE","Merge PDFs","Join PDFs and photos into one file"],["PDF","COMPRESS","Compress PDF","Make a PDF small enough to upload"],["PDF","PROTECT","Password-protect","AES-256 password on a PDF"],["PDF","REDACT","Redact","Remove numbers or names for real"],["PDF","FROM_IMAGES","Photos to PDF","Phone photos into one PDF"],["PHOTO",null,"Exam photo & signature","Exact pixels and KB for portals"],["IMAGE","IMG_BATCH","Resize & compress images","Many images at once"],["SCAN",null,"Scan documents","Camera pages to a clean PDF"],["PVC",null,"PVC ID cards","Design, bulk print, calibrate"],["PRINT",null,"Print & printers","Any PDF or photo to any installed printer"],["UTIL",null,"QR & stamp","UPI QR and centre stamp"]],l=n.filter(s=>s.status==="COMPLETED").length,c=n.filter(s=>["PREPARED","PRINT_DIALOG_OPENED","QUEUED"].includes(s.status)).length;t.innerHTML=`
    <div class="kpi-row" style="margin-bottom:12px">
      <div class="kpi-card"><div class="kpi-label">Jobs logged</div><div class="kpi-value">${n.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Completed</div><div class="kpi-value">${l}</div></div>
      <div class="kpi-card"><div class="kpi-label">Print jobs waiting for your confirmation</div><div class="kpi-value">${c}</div></div>
      <div class="kpi-card"><div class="kpi-label">Files stored</div><div class="kpi-value">0</div><div class="form-hint">Nothing is kept after you close the tab</div></div>
    </div>
    <div class="studio-tiles">${v.map(([s,o,e,a],r)=>`<button class="studio-tile" data-tile="${r}"><strong>${S(e)}</strong><span>${S(a)}</span></button>`).join("")}</div>
    <div class="card" style="margin-top:12px"><div class="card-title">Recent jobs</div>${H(n.slice(0,8))}</div>`,t.querySelectorAll("[data-tile]").forEach(s=>s.addEventListener("click",()=>T(...v[Number(s.dataset.tile)].slice(0,2))))}const X={COMPLETED:"Completed",PREPARED:"Prepared",PRINT_DIALOG_OPENED:"Print window opened",FAILED:"Failed",CANCELLED:"Cancelled",QUEUED:"Queued"};function H(t){return t.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Job & date</th><th>Customer</th><th>Tool & output</th><th class="num">Charge</th><th>Status</th></tr></thead><tbody>${t.map(n=>`<tr><td><strong>${S(n.id)}</strong><br><small>${S(n.date)}</small></td><td>${S(n.customerName||"Walk-in Citizen")}</td><td><strong>${S(n.toolType)}</strong><br><small data-no-i18n>${S(n.outputSummary||"")}</small></td><td class="num">${Q(n.chargePaise||0)}</td><td><span class="badge ${n.status==="COMPLETED"?"badge-success":n.status==="FAILED"?"badge-danger":"badge-neutral"}">${S(X[n.status]||n.status||"Completed")}</span></td></tr>`).join("")}</tbody></table></div>`:'<div class="form-hint">No jobs logged yet.</div>'}function Z(t,n){t.innerHTML=`<div class="card"><div class="card-title">Job history (${n.length})</div><div class="form-hint">Only the job details are kept — never the customer's files.</div>${H(n.slice(0,200))}</div>`}function tt(t){return t==="QR_STAMP"?`
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">UPI QR, Wi-Fi QR & Custom QR Generator</div></div>
          <div class="form-grid" style="grid-template-columns:1fr;">
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">QR Type</label>
                <select class="form-control" id="qr-tool-type">
                  <option value="UPI">UPI Merchant Payment QR</option>
                  <option value="WIFI">Wi-Fi Auto-Connect QR</option>
                  <option value="WA">WhatsApp Click-to-Chat QR</option>
                  <option value="TEXT">Custom URL / Text QR</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Primary Value (UPI ID / SSID / URL)</label>
                <input type="text" class="form-control" id="qr-tool-val1" value="janseva@upi">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Secondary Value (Payee Name / Wi-Fi Pass / Amount)</label>
                <input type="text" class="form-control" id="qr-tool-val2" value="JanSeva Digital Kendra">
              </div>
              <div class="form-group">
                <label class="form-label">Optional Amount (₹)</label>
                <input type="number" step="0.01" class="form-control" id="qr-tool-amt" placeholder="Optional fixed INR">
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-primary" id="qr-tool-gen-btn">Generate QR</button>
              <button type="button" class="btn btn-teal" id="qr-tool-dl-btn">Download PNG</button>
            </div>
            <div class="studio-canvas-box" style="min-height:200px;">
              <canvas id="qr-tool-canvas" width="200" height="200"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Official Centre Stamp & Watermark Maker</div></div>
          <div class="stamp-layout">
            <div class="stamp-form">
              <div class="form-group"><label class="form-label">Centre name (around the top)</label>
                <input type="text" class="form-control" id="stamp-outer" maxlength="60" value="JANSEVA &amp; AKSHAYA DIGITAL KENDRA"></div>
              <div class="form-group"><label class="form-label">Place / ID (around the bottom, optional)</label>
                <input type="text" class="form-control" id="stamp-bottom" maxlength="40" value="ALUVA • KERALA"></div>
              <div class="form-group"><label class="form-label">Centre label</label>
                <input type="text" class="form-control" id="stamp-inner" maxlength="40" value="VERIFIED / ASSISTED"></div>
              <div class="grid-2" style="gap:10px">
                <div class="form-group"><label class="form-label">Ink colour</label>
                  <select class="form-control" id="stamp-color">
                    <option value="#1D3FAF">Royal blue</option>
                    <option value="#12345A">Deep navy</option>
                    <option value="#B91C1C">Seal crimson</option>
                    <option value="#14804A">Verified green</option>
                    <option value="#5B21B6">Violet</option>
                  </select></div>
                <div class="form-group"><label class="form-label">Date in the centre</label>
                  <select class="form-control" id="stamp-date"><option value="today">Today (DD-MM-YYYY)</option><option value="blank">Blank line to write</option><option value="none">No date</option></select></div>
              </div>
              <div class="stamp-actions">
                <button type="button" class="btn btn-primary" id="stamp-dl-btn">Download PNG (transparent)</button>
                <span class="form-hint">The preview updates as you type. 600 × 600 pixels, prints sharp up to about 5 cm.</span>
              </div>
            </div>
            <div class="stamp-preview"><canvas id="stamp-canvas" width="600" height="600" aria-label="Stamp preview"></canvas></div>
          </div>
        </div>
      </div>
    `:`
    <div class="util-grid">
      <div class="card util-card">
        <div class="util-head"><span class="util-ic" aria-hidden="true">🎂</span><div><div class="card-title">Age calculator</div><div class="form-hint">For exam, job and pension cut-off dates</div></div></div>
        <div class="grid-2" style="gap:10px">
          <div class="form-group"><label class="form-label">Date of birth</label><input type="date" class="form-control" id="calc-dob" value="2001-05-15"></div>
          <div class="form-group"><label class="form-label">Age as on</label><input type="date" class="form-control" id="calc-as-of" value="${q()}"></div>
        </div>
        <div id="calc-age-result" class="util-result" aria-live="polite"></div>
      </div>

      <div class="card util-card">
        <div class="util-head"><span class="util-ic" aria-hidden="true">₹</span><div><div class="card-title">GST, EMI &amp; interest</div><div class="form-hint">Results update as you type</div></div></div>
        <div class="seg" role="tablist">
          <button type="button" class="seg-btn active" data-fin="GST">GST</button>
          <button type="button" class="seg-btn" data-fin="EMI">Loan EMI</button>
          <button type="button" class="seg-btn" data-fin="INT">Interest</button>
        </div>
        <div class="form-group"><label class="form-label" id="calc-amt-label">Amount (₹)</label><input type="number" min="0" step="0.01" class="form-control" id="calc-fin-amt" value="50000" inputmode="decimal"></div>
        <div class="grid-2" style="gap:10px">
          <div class="form-group" data-show="GST"><label class="form-label">GST rate</label><select class="form-control" id="calc-gst-rate"><option>0</option><option>3</option><option>5</option><option>12</option><option selected>18</option><option>28</option></select></div>
          <div class="form-group" data-show="GST"><label class="form-label">Amount is</label><select class="form-control" id="calc-gst-mode"><option value="ADD">Before GST (add GST)</option><option value="INCL">Including GST (find GST)</option></select></div>
          <div class="form-group" data-show="GST"><label class="form-label">Supply</label><select class="form-control" id="calc-gst-place"><option value="INTRA">Within the State (CGST + SGST)</option><option value="INTER">Other State (IGST)</option></select></div>
          <div class="form-group" data-show="EMI INT" hidden><label class="form-label">Interest rate (% a year)</label><input type="number" min="0" step="0.01" class="form-control" id="calc-fin-rate" value="12"></div>
          <div class="form-group" data-show="EMI INT" hidden><label class="form-label">Period (months)</label><input type="number" min="1" step="1" class="form-control" id="calc-fin-months" value="24"></div>
          <div class="form-group" data-show="INT" hidden><label class="form-label">Compounding</label><select class="form-control" id="calc-comp"><option value="1">Yearly</option><option value="4" selected>Quarterly</option><option value="12">Monthly</option></select></div>
        </div>
        <div id="calc-fin-result" class="util-result" aria-live="polite"></div>
      </div>

      <div class="card util-card">
        <div class="util-head"><span class="util-ic" aria-hidden="true">Aa</span><div><div class="card-title">Text cleanup for portal forms</div><div class="form-hint">Fixes spacing and case of names and addresses</div></div></div>
        <div class="form-group"><label class="form-label">Paste name or address</label>
          <textarea class="form-control" id="txt-clean-inp" rows="3" placeholder="e.g.   rajesh   kumar   nair , house #42">  rajesh   kumar   nair  </textarea></div>
        <div class="chip-row">
          <button type="button" class="btn btn-sm btn-outline" data-txt-op="UPPER">UPPERCASE</button>
          <button type="button" class="btn btn-sm btn-outline" data-txt-op="TITLE">Title Case</button>
          <button type="button" class="btn btn-sm btn-outline" data-txt-op="SPACES">Fix spaces only</button>
          <button type="button" class="btn btn-sm btn-outline" data-txt-op="ALPHANUM">Remove special characters</button>
        </div>
        <div class="util-result util-text"><div class="form-hint">Result</div><div id="txt-clean-out" class="util-out"></div><button type="button" class="btn btn-sm btn-primary" id="txt-clean-copy">Copy</button></div>
      </div>
    </div>
  `}function et(t,n){if(n==="QR_STAMP"){const o=t.querySelector("#qr-tool-canvas"),e=()=>{const i=t.querySelector("#qr-tool-type")?.value||"UPI",p=(t.querySelector("#qr-tool-val1")?.value||"").trim(),h=(t.querySelector("#qr-tool-val2")?.value||"").trim(),E=(t.querySelector("#qr-tool-amt")?.value||"").trim();if(i==="UPI"){const b=Number(E)>0?Number(E).toFixed(2):"";return`upi://pay?pa=${encodeURIComponent(p)}&pn=${encodeURIComponent(h)}${b?`&am=${b}`:""}&cu=INR`}if(i==="WIFI"){const b=g=>g.replace(/([\\;,:"])/g,"\\$1");return`WIFI:T:WPA;S:${b(p)};P:${b(h)};;`}if(i==="WA"){let b=p.replace(/\D/g,"");return b.length===10&&(b=`91${b}`),`https://wa.me/${b}${h?`?text=${encodeURIComponent(h)}`:""}`}return p||" "},a=()=>{try{W(o,e(),200)}catch(i){alert(i.message||"Could not create QR code")}};t.querySelector("#qr-tool-gen-btn")?.addEventListener("click",a),["#qr-tool-type","#qr-tool-val1","#qr-tool-val2","#qr-tool-amt"].forEach(i=>t.querySelector(i)?.addEventListener("input",a)),t.querySelector("#qr-tool-dl-btn")?.addEventListener("click",()=>{const i=document.createElement("canvas");try{W(i,e(),800)}catch(p){alert(p.message||"Could not create QR code");return}i.toBlob(p=>p&&_(p,`VLEBook_QR_${q()}.png`,"image/png"))}),a();const r=t.querySelector("#stamp-canvas"),u=()=>{r&&lt(r,{top:(t.querySelector("#stamp-outer")?.value||"DIGITAL SEVA CENTRE").trim().toUpperCase(),bottom:(t.querySelector("#stamp-bottom")?.value||"").trim().toUpperCase(),label:(t.querySelector("#stamp-inner")?.value||"").trim().toUpperCase(),color:t.querySelector("#stamp-color")?.value||"#1D3FAF",date:t.querySelector("#stamp-date")?.value||"today"})};["#stamp-outer","#stamp-bottom","#stamp-inner","#stamp-color","#stamp-date"].forEach(i=>t.querySelector(i)?.addEventListener("input",u)),t.querySelector("#stamp-dl-btn")?.addEventListener("click",()=>{r?.toBlob(i=>i&&_(i,`Centre_Stamp_${q()}.png`,"image/png"))}),u();return}const d=o=>"₹"+Number(o||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}),f=o=>`<table class="util-table">${o.map(([e,a,r])=>`<tr class="${r?"strong":""}"><td>${e}</td><td>${a}</td></tr>`).join("")}</table>`,T=()=>{const o=t.querySelector("#calc-age-result"),e=t.querySelector("#calc-dob")?.value,a=t.querySelector("#calc-as-of")?.value;if(!o)return;const r=at(e,a);if(!r)return o.innerHTML='<div class="form-hint">Enter both dates. The "as on" date must be after the date of birth.</div>';o.innerHTML=`<div class="util-big">${r.y} <small>years</small> ${r.m} <small>months</small> ${r.d} <small>days</small></div>`+f([["Total days",r.total.toLocaleString("en-IN")],["Next birthday in",`${r.next} day(s)`]])};["#calc-dob","#calc-as-of"].forEach(o=>t.querySelector(o)?.addEventListener("input",T)),T();let v="GST";const l=()=>{const o=t.querySelector("#calc-fin-result");if(!o)return;const e=Math.max(0,Number(t.querySelector("#calc-fin-amt")?.value||0));if(v==="GST"){const a=Number(t.querySelector("#calc-gst-rate")?.value||0),r=t.querySelector("#calc-gst-mode")?.value==="INCL",u=t.querySelector("#calc-gst-place")?.value!=="INTER",i=r?e/(1+a/100):e,p=Math.round(i*a)/100,h=Math.round(p*50)/100;o.innerHTML=f([["Taxable value",d(i)],...u?[[`CGST @ ${a/2}%`,d(h)],[`SGST @ ${a/2}%`,d(p-h)]]:[[`IGST @ ${a}%`,d(p)]],["Total GST",d(p)],["Total amount",d(i+p),!0]])}else if(v==="EMI"){const a=Number(t.querySelector("#calc-fin-rate")?.value||0),r=Math.max(1,Math.round(Number(t.querySelector("#calc-fin-months")?.value||1))),u=a/1200,i=u===0?e/r:e*u*Math.pow(1+u,r)/(Math.pow(1+u,r)-1);o.innerHTML=f([["Monthly EMI",d(i),!0],["Total interest",d(i*r-e)],["Total payable",d(i*r)],["Number of EMIs",String(r)]])}else{const a=Number(t.querySelector("#calc-fin-rate")?.value||0),r=Math.max(0,Number(t.querySelector("#calc-fin-months")?.value||0))/12,u=Number(t.querySelector("#calc-comp")?.value||1),i=e*a*r/100,p=e*Math.pow(1+a/100/u,u*r)-e;o.innerHTML=f([["Simple interest",d(i)],["Amount (simple)",d(e+i)],["Compound interest",d(p)],["Amount (compound)",d(e+p),!0]])}};t.querySelectorAll("[data-fin]").forEach(o=>o.addEventListener("click",()=>{v=o.dataset.fin,t.querySelectorAll("[data-fin]").forEach(a=>a.classList.toggle("active",a===o)),t.querySelectorAll("[data-show]").forEach(a=>a.hidden=!a.dataset.show.split(" ").includes(v));const e=t.querySelector("#calc-amt-label");e&&(e.textContent=v==="GST"?"Amount (₹)":v==="EMI"?"Loan amount (₹)":"Principal (₹)"),l()})),["#calc-fin-amt","#calc-gst-rate","#calc-gst-mode","#calc-gst-place","#calc-fin-rate","#calc-fin-months","#calc-comp"].forEach(o=>t.querySelector(o)?.addEventListener("input",l)),l();const c=t.querySelector("#txt-clean-out"),s=o=>{const e=t.querySelector("#txt-clean-inp");if(!e||!c)return;let a=e.value.trim().replace(/\s+/g," ").replace(/\s+([,.;:])/g,"$1");o==="UPPER"?a=a.toUpperCase():o==="TITLE"?a=a.toLowerCase().replace(/(^|[\s(\/-])(\p{L})/gu,(r,u,i)=>u+i.toUpperCase()):o==="ALPHANUM"&&(a=a.replace(/[^\p{L}\p{M}\p{N} ,./-]/gu,"").replace(/\s+/g," ").trim()),c.textContent=a};t.querySelectorAll("[data-txt-op]").forEach(o=>o.addEventListener("click",()=>s(o.getAttribute("data-txt-op")))),t.querySelector("#txt-clean-inp")?.addEventListener("input",()=>s("SPACES")),t.querySelector("#txt-clean-copy")?.addEventListener("click",async o=>{try{await navigator.clipboard.writeText(c?.textContent||""),o.target.textContent="Copied ✓",setTimeout(()=>o.target.textContent="Copy",1500)}catch{}}),s("SPACES")}function at(t,n){if(!t||!n)return null;const[d,f,T]=t.split("-").map(Number),[v,l,c]=n.split("-").map(Number),s=Date.UTC(d,f-1,T),o=Date.UTC(v,l-1,c);if(!(o>=s))return null;const e=h=>{const E=d+Math.floor((f-1+h)/12),b=(f-1+h)%12,g=new Date(Date.UTC(E,b+1,0)).getUTCDate();return Date.UTC(E,b,Math.min(T,g))};let a=(v-d)*12+(l-f);for(;a>0&&e(a)>o;)a--;const r=Math.round((o-e(a))/864e5),u=Math.floor(a/12),i=a%12;let p=Date.UTC(v,f-1,T);return p<=o&&(p=Date.UTC(v+1,f-1,T)),{y:u,m:i,d:r,total:Math.round((o-s)/864e5),next:Math.round((p-o)/864e5)}}function lt(t,{top:n="",bottom:d="",label:f="",color:T="#1D3FAF",date:v="today"}={}){const l=t.getContext("2d"),c=t.width,s=c/2;l.clearRect(0,0,c,c),l.strokeStyle=l.fillStyle=T;const o=c*.47,e=c*.445,a=c*.31,r=(m,y)=>{l.lineWidth=y,l.beginPath(),l.arc(s,s,m,0,Math.PI*2),l.stroke()};r(o,c*.016),r(e,c*.004),r(a,c*.006);const u=(e+a)/2,i=(m,y=700)=>`${y} ${m}px "Segoe UI", Inter, Arial, sans-serif`,p=(m,y,I)=>{if(!m)return 0;let M=c*.068;const x=.06;let D;for(;l.font=i(M),D=[...m].reduce((R,j)=>R+l.measureText(j).width,0)*(1+x)/u,!(D<=y||M<c*.03);)M-=1;l.textAlign="center",l.textBaseline="middle";let w=(I?-Math.PI/2:Math.PI/2)+(I?-D/2:D/2);for(const N of m){const R=l.measureText(N).width*(1+x)/u;w+=I?R/2:-R/2,l.save(),l.translate(s+u*Math.cos(w),s+u*Math.sin(w)),l.rotate(I?w+Math.PI/2:w-Math.PI/2),l.fillText(N,0,0),l.restore(),w+=I?R/2:-R/2}return D},h=p(n,d?Math.PI*1.22:Math.PI*1.7,!0),E=p(d,Math.PI*.62,!1);if(d&&n){const m=(Math.PI/2+E/2+(-Math.PI/2-h/2)+Math.PI*2)/2;l.font=i(c*.05);for(const y of[m,Math.PI-m])l.fillText("★",s+u*Math.cos(y),s+u*Math.sin(y))}else n&&(l.font=i(c*.05),l.fillText("★",s,s+u));l.textAlign="center",l.textBaseline="middle";const b=f.split(/\s+/).filter(Boolean);let g=[f];if(f.length>14&&b.length>1){let m=[f,""],y=1/0;for(let I=1;I<b.length;I++){const M=b.slice(0,I).join(" "),x=b.slice(I).join(" ");Math.abs(M.length-x.length)<y&&(y=Math.abs(M.length-x.length),m=[M,x])}/^[/&-]/.test(m[1])&&(m=[m[0]+" "+m[1].slice(0,1),m[1].slice(1).trim()]),g=m}let C=c*.075;for(l.font=i(C,800);g.some(m=>l.measureText(m).width>a*1.7)&&C>c*.03;)l.font=i(--C,800);const V=v==="none"?0:c*.075,B=g.length*C*1.15+V;let A=s-B/2+C*.6;for(const m of g)l.fillText(m,s,A),A+=C*1.15;if(v!=="none"){l.lineWidth=c*.004;const m=a*.75;l.beginPath(),l.moveTo(s-m,A-C*.45),l.lineTo(s+m,A-C*.45),l.stroke(),l.font=i(c*.05,600);const y=new Date,I=`${String(y.getDate()).padStart(2,"0")}-${String(y.getMonth()+1).padStart(2,"0")}-${y.getFullYear()}`;v==="today"?l.fillText(I,s,A+c*.02):(l.beginPath(),l.moveTo(s-m*.8,A+c*.045),l.lineTo(s+m*.8,A+c*.045),l.stroke())}}export{lt as drawSeal,at as exactAge,K as openStudio,O as renderStudioModule};
