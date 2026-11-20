import{getAllRecords as h,putRecord as k}from"../core/db.js";import{uid as A,todayISO as f,formatINR as D,toPaise as M,esc as v,drawQRCodeOnCanvas as $,downloadFile as w}from"../core/utils.js";const P=[["HOME","Studio home"],["PDF","PDF Tools"],["EDITOR","PDF Editor"],["IMAGE","Image Tools"],["PHOTO","Photo & Signature"],["OCR","OCR & Scanner"],["PVC","PVC ID & Print"],["UTIL","QR, Stamp & Calculators"],["HISTORY","Job history"]];let u="HOME",y="QR_STAMP",E="";function F(t,s=null){P.some(([m])=>m===t)&&(u=t),s&&(S=s)}let S=null;async function C(t,s){const[m,o,i]=await Promise.all([h("customers"),h("services"),h("workbench_jobs")]),l=sessionStorage.getItem("vlebook_preselect_customer");l&&(sessionStorage.removeItem("vlebook_preselect_customer"),E=l);const r=[...i].sort((a,p)=>String(p.createdAt||p.date).localeCompare(String(a.createdAt||a.date)));t.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>PDF & Image Studio</h1>
        <p>PDF tools and editor, image tools, government photo & signature sizes, OCR, document scanner and PVC ID printing — all on this computer, nothing uploaded</p>
      </div>
    </div>
    <div class="studio-nav" role="tablist">${P.map(([a,p])=>`<button class="studio-ws ${u===a?"active":""}" data-ws="${a}" role="tab">${v(p)}</button>`).join("")}</div>

    <div class="card studio-jobbar">
      <div class="studio-inline">
        <label class="form-label" style="margin:0">Customer</label>
        <select class="form-control" id="wb-customer-select" style="max-width:260px">
          <option value="">— Walk-in (no record) —</option>
          ${m.map(a=>`<option value="${v(a.id)}" ${E===a.id?"selected":""}>${v(a.name)} (${v(a.mobile||"")})</option>`).join("")}
        </select>
        <label class="form-label" style="margin:0">Service</label>
        <select class="form-control" id="wb-service-select" style="max-width:260px">
          ${o.map(a=>`<option value="${v(a.id)}" data-name="${v(a.name)}" data-price="${a.customerPricePaise}" data-govt="${a.govtFeePaise}">${v(a.name)} (${D(a.customerPricePaise)})</option>`).join("")}
        </select>
        <button class="btn btn-sm btn-teal" id="wb-log-only-btn">Log job</button>
        <button class="btn btn-sm btn-gold" id="wb-add-to-bill-btn">Log & add to bill →</button>
      </div>
      <div class="form-hint">Files are processed in this browser and not stored. Customer documents are not kept in the job log — only what was done.</div>
    </div>

    <div id="wb-active-panel" class="studio-panel"></div>`,t.querySelectorAll("[data-ws]").forEach(a=>a.addEventListener("click",()=>{u=a.dataset.ws,C(t,s)})),t.querySelector("#wb-customer-select")?.addEventListener("change",a=>E=a.target.value);const n=async(a=!1)=>{const p=t.querySelector("#wb-customer-select")?.value||"CUST-WALKIN",d=m.find(g=>g.id===p),b=t.querySelector("#wb-service-select")?.selectedOptions[0],I=b?.value||"",x=b?.getAttribute("data-name")||"Document service",T=Number(b?.getAttribute("data-price")||M(0)),L=Number(b?.getAttribute("data-govt")||0),R=await k("workbench_jobs",{id:A("WB"),date:f(),createdAt:new Date().toISOString(),customerId:p,customerName:d?.name||"Walk-in Citizen",toolType:`Studio: ${P.find(([g])=>g===u)?.[1]||u}`,serviceId:I,outputSummary:`${x} prepared in the studio`,chargePaise:T,retentionPolicy:"Files not stored",status:"COMPLETED"});if(a)d&&sessionStorage.setItem("vlebook_preselect_customer",d.id),sessionStorage.setItem("vlebook_workbench_bill_item",JSON.stringify({id:A("LN"),serviceId:I,serviceName:`${x} (${R.id})`,category:"Digital & Commercial Services",qty:1,ratePaise:T,govtFeePaise:L,thirdPartyPaise:0,commissionPaise:0,discountPaise:0})),s("billing");else{const g=t.querySelector("#wb-log-only-btn");g.textContent=`Logged ${R.id}`,setTimeout(()=>g.textContent="Log job",2500)}};t.querySelector("#wb-log-only-btn")?.addEventListener("click",()=>n(!1)),t.querySelector("#wb-add-to-bill-btn")?.addEventListener("click",()=>n(!0));const e=t.querySelector("#wb-active-panel"),c={customerId:()=>t.querySelector("#wb-customer-select")?.value||"CUST-WALKIN",customerName:()=>m.find(a=>a.id===t.querySelector("#wb-customer-select")?.value)?.name||"Walk-in Citizen"};if(u==="HOME")O(e,r,t,s);else if(u==="PDF"||u==="EDITOR"||u==="IMAGE"){const a=await import("./tools.js");u==="EDITOR"&&a.setActiveTool("EDIT"),S&&(a.setActiveTool(S),S=null),await a.renderToolsModule(e,s,{embedded:!0,group:u==="IMAGE"?"IMAGE":"PDF"})}else u==="PHOTO"?(await import("./studio-photo.js")).renderPhotoWorkspace(e,c):u==="OCR"?(await import("./studio-ocr.js")).renderOcrWorkspace(e,c):u==="PVC"?(await import("./studio-pvc.js")).renderPvcWorkspace(e,c):u==="UTIL"?(e.innerHTML=`<div class="pill-tabs" id="wb-util-tabs"><button class="pill-tab ${y==="QR_STAMP"?"active":""}" data-ut="QR_STAMP">QR codes & centre stamp</button><button class="pill-tab ${y==="CALCULATORS"?"active":""}" data-ut="CALCULATORS">Age, GST, EMI & text utilities</button></div><div id="wb-util">${Q(y)}</div>`,e.querySelectorAll("[data-ut]").forEach(a=>a.addEventListener("click",()=>{y=a.dataset.ut,C(t,s)})),G(e,y)):u==="HISTORY"&&U(e,r)}function O(t,s,m,o){const i=(e,c)=>{F(e,c),C(m,o)},l=[["PDF","MERGE","Merge PDFs","Join PDFs and photos into one file"],["PDF","COMPRESS","Compress PDF","Make a PDF small enough to upload"],["EDITOR","EDIT","Edit PDF","Change text, add signature, shapes, comments"],["PDF","PROTECT","Password-protect","AES-256 password on a PDF"],["PDF","REDACT","Redact","Remove numbers or names for real"],["PDF","FROM_IMAGES","Photos to PDF","Phone photos into one PDF"],["PHOTO",null,"Exam photo & signature","Exact pixels and KB for portals"],["IMAGE","IMG_BATCH","Resize & compress images","Many images at once"],["OCR",null,"Read text (OCR)","English, Malayalam, Hindi"],["OCR",null,"Scan documents","Camera pages to a clean PDF"],["PVC",null,"PVC ID cards","Design, bulk print, calibrate"],["UTIL",null,"QR & stamp","UPI QR and centre stamp"]],r=s.filter(e=>e.status==="COMPLETED").length,n=s.filter(e=>["PREPARED","PRINT_DIALOG_OPENED","QUEUED"].includes(e.status)).length;t.innerHTML=`
    <div class="kpi-row" style="margin-bottom:12px">
      <div class="kpi-card"><div class="kpi-label">Jobs logged</div><div class="kpi-value">${s.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Completed</div><div class="kpi-value">${r}</div></div>
      <div class="kpi-card"><div class="kpi-label">Print jobs waiting for your confirmation</div><div class="kpi-value">${n}</div></div>
      <div class="kpi-card"><div class="kpi-label">Files stored</div><div class="kpi-value">0</div><div class="form-hint">Nothing is kept after you close the tab</div></div>
    </div>
    <div class="studio-tiles">${l.map(([e,c,a,p],d)=>`<button class="studio-tile" data-tile="${d}"><strong>${v(a)}</strong><span>${v(p)}</span></button>`).join("")}</div>
    <div class="card" style="margin-top:12px"><div class="card-title">Recent jobs</div>${q(s.slice(0,8))}</div>`,t.querySelectorAll("[data-tile]").forEach(e=>e.addEventListener("click",()=>i(...l[Number(e.dataset.tile)].slice(0,2))))}const N={COMPLETED:"Completed",PREPARED:"Prepared",PRINT_DIALOG_OPENED:"Print window opened",FAILED:"Failed",CANCELLED:"Cancelled",QUEUED:"Queued"};function q(t){return t.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Job & date</th><th>Customer</th><th>Tool & output</th><th class="num">Charge</th><th>Status</th></tr></thead><tbody>${t.map(s=>`<tr><td><strong>${v(s.id)}</strong><br><small>${v(s.date)}</small></td><td>${v(s.customerName||"Walk-in Citizen")}</td><td><strong>${v(s.toolType)}</strong><br><small data-no-i18n>${v(s.outputSummary||"")}</small></td><td class="num">${D(s.chargePaise||0)}</td><td><span class="badge ${s.status==="COMPLETED"?"badge-success":s.status==="FAILED"?"badge-danger":"badge-neutral"}">${v(N[s.status]||s.status||"Completed")}</span></td></tr>`).join("")}</tbody></table></div>`:'<div class="form-hint">No jobs logged yet.</div>'}function U(t,s){t.innerHTML=`<div class="card"><div class="card-title">Job history (${s.length})</div><div class="form-hint">Only the job details are kept — never the customer's files.</div>${q(s.slice(0,200))}</div>`}function Q(t){return t==="QR_STAMP"?`
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
          <div class="form-grid" style="grid-template-columns:1fr;">
            <div class="form-group">
              <label class="form-label">Outer Ring Text</label>
              <input type="text" class="form-control" id="stamp-outer" value="JANSEVA & AKSHAYA DIGITAL KENDRA">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Center Label</label>
                <input type="text" class="form-control" id="stamp-inner" value="VERIFIED / ASSISTED">
              </div>
              <div class="form-group">
                <label class="form-label">Ink Colour</label>
                <select class="form-control" id="stamp-color">
                  <option value="#1D4ED8">Official Royal Blue</option>
                  <option value="#12345A">Deep Navy</option>
                  <option value="#B91C1C">Seal Crimson</option>
                  <option value="#14804A">Verified Green</option>
                </select>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-primary" id="stamp-gen-btn">Render Stamp</button>
              <button type="button" class="btn btn-teal" id="stamp-dl-btn">Download Transparent PNG</button>
            </div>
            <div class="studio-canvas-box" style="min-height:200px;">
              <canvas id="stamp-canvas" width="240" height="240"></canvas>
            </div>
          </div>
        </div>
      </div>
    `:`
    <div class="grid-3">
      <div class="card">
        <div class="card-header"><div class="card-title">Exam & Pension Age Calculator</div></div>
        <div class="form-group">
          <label class="form-label">Date of Birth</label>
          <input type="date" class="form-control" id="calc-dob" value="2001-05-15">
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label class="form-label">Age As On Cutoff Date</label>
          <input type="date" class="form-control" id="calc-as-of" value="${f()}">
        </div>
        <button type="button" class="btn btn-sm btn-primary" id="calc-age-btn" style="margin-top:10px; width:100%;">Calculate Exact Age</button>
        <div id="calc-age-result" class="callout success" style="margin-top:10px;">
          <strong>25 Years, 5 Months, 27 Days</strong>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">GST, EMI & Interest Calculator</div></div>
        <div class="grid-2" style="gap:8px;">
          <div class="form-group">
            <label class="form-label">Principal / Base (₹)</label>
            <input type="number" class="form-control" id="calc-fin-amt" value="50000">
          </div>
          <div class="form-group">
            <label class="form-label">Rate (% p.a. or GST%)</label>
            <input type="number" step="0.1" class="form-control" id="calc-fin-rate" value="12">
          </div>
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label class="form-label">Tenure (Months)</label>
          <input type="number" class="form-control" id="calc-fin-months" value="24">
        </div>
        <div style="display:flex; gap:6px; margin-top:10px;">
          <button type="button" class="btn btn-xs btn-teal" id="calc-emi-btn">Loan EMI</button>
          <button type="button" class="btn btn-xs btn-primary" id="calc-gst-btn">GST Split</button>
          <button type="button" class="btn btn-xs btn-outline" id="calc-si-btn">Simple/Comp Int.</button>
        </div>
        <div id="calc-fin-result" class="callout" style="margin-top:10px;">
          Click a button above to compute EMI, GST split, or interest.
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Portal Form Text Cleanup Utility</div></div>
        <div class="form-group">
          <label class="form-label">Paste Citizen Name / Address Text</label>
          <textarea class="form-control" id="txt-clean-inp" rows="3" placeholder="  rajesh   kumar   nair , house #42  ">  rajesh   kumar   nair  </textarea>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <button type="button" class="btn btn-xs btn-primary" data-txt-op="UPPER">UPPERCASE</button>
          <button type="button" class="btn btn-xs btn-teal" data-txt-op="TITLE">Title Case</button>
          <button type="button" class="btn btn-xs btn-outline" data-txt-op="ALPHANUM">Remove Special Chars</button>
        </div>
      </div>
    </div>
  `}function G(t,s){if(s==="QR_STAMP"){const o=t.querySelector("#qr-tool-canvas"),i=()=>{const e=t.querySelector("#qr-tool-type")?.value||"UPI",c=(t.querySelector("#qr-tool-val1")?.value||"").trim(),a=(t.querySelector("#qr-tool-val2")?.value||"").trim(),p=(t.querySelector("#qr-tool-amt")?.value||"").trim();if(e==="UPI"){const d=Number(p)>0?Number(p).toFixed(2):"";return`upi://pay?pa=${encodeURIComponent(c)}&pn=${encodeURIComponent(a)}${d?`&am=${d}`:""}&cu=INR`}if(e==="WIFI"){const d=b=>b.replace(/([\\;,:"])/g,"\\$1");return`WIFI:T:WPA;S:${d(c)};P:${d(a)};;`}if(e==="WA"){let d=c.replace(/\D/g,"");return d.length===10&&(d=`91${d}`),`https://wa.me/${d}${a?`?text=${encodeURIComponent(a)}`:""}`}return c||" "},l=()=>{try{$(o,i(),200)}catch(e){alert(e.message||"Could not create QR code")}};t.querySelector("#qr-tool-gen-btn")?.addEventListener("click",l),["#qr-tool-type","#qr-tool-val1","#qr-tool-val2","#qr-tool-amt"].forEach(e=>t.querySelector(e)?.addEventListener("input",l)),t.querySelector("#qr-tool-dl-btn")?.addEventListener("click",()=>{const e=document.createElement("canvas");try{$(e,i(),800)}catch(c){alert(c.message||"Could not create QR code");return}e.toBlob(c=>c&&w(c,`VLEBook_QR_${f()}.png`,"image/png"))}),l();const r=t.querySelector("#stamp-canvas"),n=()=>{if(!r)return;const e=r.getContext("2d"),c=(t.querySelector("#stamp-outer")?.value||"DIGITAL SEVA CENTRE").toUpperCase(),a=(t.querySelector("#stamp-inner")?.value||"VERIFIED").toUpperCase(),p=t.querySelector("#stamp-color")?.value||"#1D4ED8";e.clearRect(0,0,240,240),e.strokeStyle=p,e.fillStyle=p,e.lineWidth=4,e.beginPath(),e.arc(120,120,102,0,Math.PI*2),e.stroke(),e.lineWidth=1.5,e.beginPath(),e.arc(120,120,74,0,Math.PI*2),e.stroke(),e.font="bold 11px Inter, sans-serif",e.textAlign="center",e.fillText(c.slice(0,28),120,58),e.font="bold 13px Inter, sans-serif",e.fillText(a.slice(0,20),120,124),e.font="10px Inter, sans-serif",e.fillText(f(),120,144)};t.querySelector("#stamp-gen-btn")?.addEventListener("click",n),t.querySelector("#stamp-dl-btn")?.addEventListener("click",()=>{r?.toBlob(e=>e&&w(e,`Centre_Stamp_${f()}.png`,"image/png"))}),n();return}t.querySelector("#calc-age-btn")?.addEventListener("click",()=>{const o=new Date(t.querySelector("#calc-dob")?.value),i=new Date(t.querySelector("#calc-as-of")?.value),l=t.querySelector("#calc-age-result");if(isNaN(o)||isNaN(i)||!l)return;let r=i.getFullYear()-o.getFullYear(),n=i.getMonth()-o.getMonth(),e=i.getDate()-o.getDate();e<0&&(n--,e+=30),n<0&&(r--,n+=12),l.innerHTML=`<strong>${r} Years, ${n} Months, ${e} Days</strong>`});const m=t.querySelector("#calc-fin-result");t.querySelector("#calc-emi-btn")?.addEventListener("click",()=>{const o=Number(t.querySelector("#calc-fin-amt")?.value||0),i=Number(t.querySelector("#calc-fin-rate")?.value||12),l=Math.max(1,Number(t.querySelector("#calc-fin-months")?.value||12)),r=i/12/100,n=r===0?o/l:o*r*Math.pow(1+r,l)/(Math.pow(1+r,l)-1);m&&(m.innerHTML=`<div><strong>Monthly EMI: ₹${n.toFixed(2)}</strong><br>Total Payable: ₹${(n*l).toFixed(2)} | Interest: ₹${(n*l-o).toFixed(2)}</div>`)}),t.querySelector("#calc-gst-btn")?.addEventListener("click",()=>{const o=Number(t.querySelector("#calc-fin-amt")?.value||0),i=Number(t.querySelector("#calc-fin-rate")?.value||18),l=o*i/100;m&&(m.innerHTML=`<div><strong>Exclusive GST: ₹${l.toFixed(2)}</strong> (CGST: ₹${(l/2).toFixed(2)} + SGST: ₹${(l/2).toFixed(2)})<br>Total with GST: ₹${(o+l).toFixed(2)}</div>`)}),t.querySelector("#calc-si-btn")?.addEventListener("click",()=>{const o=Number(t.querySelector("#calc-fin-amt")?.value||0),i=Number(t.querySelector("#calc-fin-rate")?.value||10),l=Number(t.querySelector("#calc-fin-months")?.value||12)/12,r=o*i*l/100,n=o*Math.pow(1+i/100,l)-o;m&&(m.innerHTML=`<div><strong>Simple Interest: ₹${r.toFixed(2)}</strong> | <strong>Compound Interest: ₹${n.toFixed(2)}</strong></div>`)}),t.querySelectorAll("[data-txt-op]").forEach(o=>{o.addEventListener("click",()=>{const i=t.querySelector("#txt-clean-inp");if(!i)return;let l=i.value.trim().replace(/\s+/g," ");const r=o.getAttribute("data-txt-op");r==="UPPER"?l=l.toUpperCase():r==="TITLE"?l=l.toLowerCase().replace(/\b\w/g,n=>n.toUpperCase()):r==="ALPHANUM"&&(l=l.replace(/[^a-zA-Z0-9 ]/g,"")),i.value=l})})}export{F as openStudio,C as renderStudioModule};
