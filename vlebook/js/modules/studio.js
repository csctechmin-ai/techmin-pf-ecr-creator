import{getAllRecords as D,putRecord as B}from"../core/db.js";import{uid as A,todayISO as v,formatINR as $,toPaise as N,esc as p,drawQRCodeOnCanvas as M,downloadFile as C,printDocumentSheet as O}from"../core/utils.js";let b="PHOTO",q="",T=null,w=null,L=null,R=null,k=[];async function U(a,g){const[f,s,r]=await Promise.all([D("customers"),D("services"),D("workbench_jobs")]),l=sessionStorage.getItem("vlebook_preselect_customer");l&&(sessionStorage.removeItem("vlebook_preselect_customer"),q=l);const t=[...r].sort((e,i)=>String(i.createdAt||i.date).localeCompare(String(e.createdAt||e.date)));a.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>Integrated Digital Document Workbench & Studio</h1>
        <p>Local-only photo, signature, ID sheet, PDF, scanner & utility workbench connected to Customer 360° and Counter Billing</p>
      </div>
    </div>

    <!-- Customer & Billing Connection Bar -->
    <div class="card" style="padding:12px 16px; background:var(--color-surface-alt);">
      <div class="grid-3" style="align-items:end; gap:12px;">
        <div class="form-group">
          <label class="form-label">1. Link Workbench Job to Citizen / Customer</label>
          <select class="form-control" id="wb-customer-select">
            <option value="">— Walk-in Citizen (Temporary Processing Only) —</option>
            ${f.map(e=>`<option value="${p(e.id)}" ${q===e.id?"selected":""}>${p(e.name)} (${p(e.mobile)})</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">2. Connect to Service & Fee</label>
          <select class="form-control" id="wb-service-select">
            ${s.map(e=>`<option value="${p(e.id)}" data-name="${p(e.name)}" data-price="${e.customerPricePaise}" data-govt="${e.govtFeePaise}">${p(e.name)} (${$(e.customerPricePaise)})</option>`).join("")}
          </select>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-teal" id="wb-log-only-btn">Log Job to Customer 360°</button>
          <button class="btn btn-gold" id="wb-add-to-bill-btn">Log & Add Charge to Bill →</button>
        </div>
      </div>
      <div style="margin-top:6px; font-size:11.5px; color:var(--color-text-muted);">
        <strong>Privacy Guarantee:</strong> All image, signature, ID layout, and PDF operations run 100% inside your browser's local memory using HTML5 Canvas. Source identity files are never uploaded to third-party servers and are discarded when you close or clear the workbench.
      </div>
    </div>

    <!-- Workbench Tool Tabs -->
    <div class="filter-bar">
      <div class="pill-tabs" id="wb-tool-tabs">
        <button class="pill-tab ${b==="PHOTO"?"active":""}" data-tab="PHOTO">Passport & Exam Photo Maker</button>
        <button class="pill-tab ${b==="SIGNATURE"?"active":""}" data-tab="SIGNATURE">Signature & Thumb Formatter</button>
        <button class="pill-tab ${b==="ID_LAYOUT"?"active":""}" data-tab="ID_LAYOUT">Official ID Card Print Sheet</button>
        <button class="pill-tab ${b==="PDF_SCAN"?"active":""}" data-tab="PDF_SCAN">PDF Tools & Camera Scanner</button>
        <button class="pill-tab ${b==="QR_STAMP"?"active":""}" data-tab="QR_STAMP">QR Generator, Stamp & Watermark</button>
        <button class="pill-tab ${b==="CALCULATORS"?"active":""}" data-tab="CALCULATORS">Age, GST, EMI & Text Utilities</button>
      </div>
    </div>

    <div id="wb-active-panel">
      ${_(b)}
    </div>

    <!-- Recent Workbench Jobs Log -->
    <div class="card" style="margin-top:16px;">
      <div class="card-header">
        <div class="card-title">Recent Document Workbench Jobs (${t.length})</div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Job ID & Date</th>
              <th>Customer</th>
              <th>Workbench Tool & Output</th>
              <th class="num">Service Charge</th>
              <th>Retention Policy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${t.length===0?'<tr><td colspan="6" style="text-align:center; padding:14px; color:var(--color-text-muted);">No workbench jobs logged yet.</td></tr>':t.slice(0,15).map(e=>`
                  <tr>
                    <td><strong>${p(e.id)}</strong><br><small style="color:var(--color-text-muted);">${p(e.date)}</small></td>
                    <td><strong>${p(e.customerName||"Walk-in Citizen")}</strong></td>
                    <td><strong>${p(e.toolType)}</strong><br><small style="color:var(--color-text-muted);">${p(e.outputSummary)}</small></td>
                    <td class="num">${$(e.chargePaise||0)}</td>
                    <td><span class="badge badge-neutral">${p(e.retentionPolicy||"Temporary Local Only")}</span></td>
                    <td><span class="badge badge-success">${p(e.status||"COMPLETED")}</span></td>
                  </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,a.querySelectorAll("#wb-tool-tabs .pill-tab").forEach(e=>{e.addEventListener("click",()=>{b=e.getAttribute("data-tab"),U(a,g)})}),a.querySelector("#wb-customer-select")?.addEventListener("change",e=>{q=e.target.value});const o=async(e=!1)=>{const i=a.querySelector("#wb-customer-select")?.value||"CUST-WALKIN",n=f.find(P=>P.id===i),d=a.querySelector("#wb-service-select")?.selectedOptions[0],u=d?.value||"SRV-PASSPORT-PHOTO",h=d?.getAttribute("data-name")||"Document Workbench Service",y=Number(d?.getAttribute("data-price")||N(60)),m=Number(d?.getAttribute("data-govt")||0),S=await B("workbench_jobs",{id:A("WB"),date:v(),customerId:i,customerName:n?.name||"Walk-in Citizen",toolType:`Workbench: ${b}`,serviceId:u,outputSummary:`${h} prepared in local studio`,chargePaise:y,retentionPolicy:"Temporary Local Memory (No raw ID retained)",status:"COMPLETED"});e?(n&&sessionStorage.setItem("vlebook_preselect_customer",n.id),sessionStorage.setItem("vlebook_workbench_bill_item",JSON.stringify({id:A("LN"),serviceId:u,serviceName:`${h} (${S.id})`,category:"Digital & Commercial Services",qty:1,ratePaise:y,govtFeePaise:m,thirdPartyPaise:0,directCostPaise:N(8),commissionPaise:0,discountPaise:0})),g("billing")):await U(a,g)};a.querySelector("#wb-log-only-btn")?.addEventListener("click",()=>o(!1)),a.querySelector("#wb-add-to-bill-btn")?.addEventListener("click",()=>o(!0)),W(a,b)}function _(a){return a==="PHOTO"?`
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Passport & Examination Photo Controls</div></div>
          <div class="form-grid" style="grid-template-columns:1fr;">
            <div class="form-group">
              <label class="form-label">Upload Customer Photo (or Leave Blank for Built-in Studio Test Portrait)</label>
              <input type="file" class="form-control" id="ph-file-inp" accept="image/*">
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Output Layout</label>
                <select class="form-control" id="ph-layout">
                  <option value="SINGLE">Single Passport Photo (35×45mm / 413×531px)</option>
                  <option value="SHEET_4X6" selected>4×6 Glossy Sheet (8 Passport Photos)</option>
                  <option value="SHEET_A4">A4 Photo Sheet (30 Passport Photos)</option>
                  <option value="PAN_213">NSDL PAN Photo (213×213 px)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Background Colour Fill</label>
                <select class="form-control" id="ph-bg-color">
                  <option value="#FFFFFF">Studio White (#FFFFFF)</option>
                  <option value="#D0E8FF">Passport Sky Blue (#D0E8FF)</option>
                  <option value="#1D4ED8">Royal Blue (#1D4ED8)</option>
                  <option value="#F3F4F6">Light Grey (#F3F4F6)</option>
                </select>
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Exam Tag: Candidate Name (Optional)</label>
                <input type="text" class="form-control" id="ph-exam-name" placeholder="e.g. RAJESH K NAIR">
              </div>
              <div class="form-group">
                <label class="form-label">Date of Photo (DOP Overlay)</label>
                <input type="text" class="form-control" id="ph-exam-dop" placeholder="e.g. DOP: ${v()}">
              </div>
            </div>
            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Brightness (%)</label>
                <input type="range" min="60" max="150" value="105" id="ph-bright">
              </div>
              <div class="form-group">
                <label class="form-label">Contrast (%)</label>
                <input type="range" min="60" max="160" value="108" id="ph-contrast">
              </div>
              <div class="form-group">
                <label class="form-label">JPEG Quality / KB Target</label>
                <input type="range" min="20" max="98" value="85" id="ph-quality">
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <button type="button" class="btn btn-primary" id="ph-render-btn">Render Photo Sheet</button>
              <button type="button" class="btn btn-teal" id="ph-download-jpg">Download JPG (<span id="ph-kb-size">24 KB</span>)</button>
              <button type="button" class="btn btn-outline" id="ph-print-btn">Print Sheet</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Live Studio Canvas Preview</div></div>
          <div class="studio-canvas-box">
            <canvas id="ph-canvas" width="600" height="400"></canvas>
          </div>
        </div>
      </div>
    `:a==="SIGNATURE"?`
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Signature & Thumb Impression Processor</div></div>
          <div class="form-grid" style="grid-template-columns:1fr;">
            <div class="form-group">
              <label class="form-label">Upload Signature / Thumb Scan (or Draw / Use Sample Below)</label>
              <input type="file" class="form-control" id="sig-file-inp" accept="image/*">
            </div>
            <div class="grid-3" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Portal Preset</label>
                <select class="form-control" id="sig-preset">
                  <option value="213x67">PAN NSDL/UTITSL (213×67 px)</option>
                  <option value="140x60">SSC / IBPS Exam (140×60 px)</option>
                  <option value="240x80">Kerala PSC / e-District (240×80 px)</option>
                  <option value="200x200">Thumb Impression (200×200 px)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">B&W Threshold</label>
                <input type="range" min="60" max="220" value="150" id="sig-thresh">
              </div>
              <div class="form-group">
                <label class="form-label">Mode</label>
                <select class="form-control" id="sig-bw-mode">
                  <option value="BW">Crisp Black & White Ink</option>
                  <option value="BLUE">Blue Pen Ink</option>
                  <option value="ORIG">Original Tone</option>
                </select>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-primary" id="sig-render-btn">Format Signature</button>
              <button type="button" class="btn btn-teal" id="sig-download-btn">Download Formatted JPG (<span id="sig-kb-label">11 KB</span>)</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Pixel-Exact Output Preview</div></div>
          <div class="studio-canvas-box">
            <canvas id="sig-canvas" width="213" height="67"></canvas>
          </div>
        </div>
      </div>
    `:a==="ID_LAYOUT"?`
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Official ID Card Print Sheet (From Customer-Supplied File Only)</div></div>
          <div class="callout">
            <span>Prepares front & back CR80 (85.6×54mm) alignment on A4 or PVC sheets from documents supplied by the citizen. Never alters or fabricates identity credentials.</span>
          </div>
          <div class="form-grid" style="grid-template-columns:1fr;">
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Front Side Image</label>
                <input type="file" class="form-control" id="id-front-inp" accept="image/*">
              </div>
              <div class="form-group">
                <label class="form-label">Back Side Image</label>
                <input type="file" class="form-control" id="id-back-inp" accept="image/*">
              </div>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Print Sheet Type</label>
                <select class="form-control" id="id-sheet-type">
                  <option value="A4_SIDE_BY_SIDE">A4 Sheet (Front + Back Side-by-Side with Cut Guides)</option>
                  <option value="PVC_CR80">PVC Card Printer CR80 Bleed Layout</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Copies on Sheet</label>
                <select class="form-control" id="id-copies">
                  <option value="1">1 Card Pair (Front & Back)</option>
                  <option value="2">2 Card Pairs on A4</option>
                  <option value="4">4 Card Pairs on A4</option>
                </select>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-primary" id="id-render-btn">Generate ID Print Sheet</button>
              <button type="button" class="btn btn-teal" id="id-download-btn">Download Print Sheet</button>
              <button type="button" class="btn btn-outline" id="id-print-btn">Print Sheet</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">CR80 Front & Back Alignment Preview</div></div>
          <div class="studio-canvas-box">
            <canvas id="id-canvas" width="620" height="420"></canvas>
          </div>
        </div>
      </div>
    `:a==="PDF_SCAN"?`
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">PDF Utilities & Image-to-PDF Converter</div></div>
          <div class="form-grid" style="grid-template-columns:1fr;">
            <div class="form-group">
              <label class="form-label">Select Images (JPG/PNG) or PDFs to Inspect / Count / Combine</label>
              <input type="file" class="form-control" id="pdf-files-inp" multiple accept=".pdf,image/*">
            </div>
            <div id="pdf-inspect-output" class="callout" style="margin-bottom:4px;">
              <span>Select one or more PDF or Image files above to count pages, reorder, or export a combined PDF document.</span>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn btn-primary" id="pdf-export-btn">Generate Combined PDF Document</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Device Camera Document Scanner</div></div>
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <button type="button" class="btn btn-sm btn-teal" id="cam-start-btn">Start Camera</button>
            <button type="button" class="btn btn-sm btn-primary" id="cam-capture-btn">Capture & Enhance Document</button>
            <button type="button" class="btn btn-sm btn-outline" id="cam-stop-btn">Stop</button>
          </div>
          <video id="cam-video" autoplay playsinline style="width:100%; max-height:180px; background:#000; display:none; border-radius:6px; margin-bottom:8px;"></video>
          <div class="studio-canvas-box" style="min-height:190px;">
            <canvas id="cam-canvas" width="480" height="320"></canvas>
          </div>
        </div>
      </div>
    `:a==="QR_STAMP"?`
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
          <input type="date" class="form-control" id="calc-as-of" value="${v()}">
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
  `}function W(a,g){if(g==="PHOTO"){const s=a.querySelector("#ph-canvas"),r=()=>{if(!s)return;const t=s.getContext("2d"),o=a.querySelector("#ph-layout")?.value||"SHEET_4X6",e=a.querySelector("#ph-bg-color")?.value||"#FFFFFF",i=(a.querySelector("#ph-exam-name")?.value||"").trim(),n=(a.querySelector("#ph-exam-dop")?.value||"").trim(),c=Number(a.querySelector("#ph-bright")?.value||100),d=Number(a.querySelector("#ph-contrast")?.value||100),u=Number(a.querySelector("#ph-quality")?.value||85)/100;if(o==="SINGLE"||o==="PAN_213")s.width=o==="PAN_213"?213:413,s.height=o==="PAN_213"?213:531,l(t,0,0,s.width,s.height,e,i,n,c,d);else if(o==="SHEET_4X6"){s.width=640,s.height=426,t.fillStyle="#FFFFFF",t.fillRect(0,0,s.width,s.height);const S=140,P=180;for(let x=0;x<2;x++)for(let F=0;F<4;F++){const I=18+F*(S+14),E=18+x*(P+18);l(t,I,E,S,P,e,i,n,c,d)}}else{s.width=620,s.height=877,t.fillStyle="#FFFFFF",t.fillRect(0,0,s.width,s.height);const S=90,P=115;for(let x=0;x<6;x++)for(let F=0;F<5;F++){const I=22+F*(S+12),E=20+x*(P+12);l(t,I,E,S,P,e,i,n,c,d)}}const h=s.toDataURL("image/jpeg",u),y=Math.max(4,Math.round(h.length*.75/1024)),m=a.querySelector("#ph-kb-size");m&&(m.textContent=`${y} KB`)},l=(t,o,e,i,n,c,d,u,h,y)=>{if(t.save(),t.fillStyle=c,t.fillRect(o,e,i,n),t.filter=`brightness(${h}%) contrast(${y}%)`,T?t.drawImage(T,o+4,e+4,i-8,n-(d||u?34:8)):(t.fillStyle="#334155",t.beginPath(),t.arc(o+i/2,e+n*.34,Math.min(i,n)*.2,0,Math.PI*2),t.fill(),t.beginPath(),t.arc(o+i/2,e+n*.85,Math.min(i,n)*.38,Math.PI,0),t.fill()),t.filter="none",d||u){const m=Math.max(24,Math.round(n*.16));t.fillStyle="#FFFFFF",t.fillRect(o,e+n-m,i,m),t.strokeStyle="#000000",t.strokeRect(o,e+n-m,i,m),t.fillStyle="#000000",t.textAlign="center",t.font=`bold ${Math.max(8,Math.round(i*.075))}px Inter, sans-serif`,d&&t.fillText(d.slice(0,20),o+i/2,e+n-m*.52),u&&t.fillText(u.slice(0,20),o+i/2,e+n-4)}t.strokeStyle="#64748B",t.lineWidth=1,t.strokeRect(o,e,i,n),t.restore()};a.querySelector("#ph-file-inp")?.addEventListener("change",t=>{const o=t.target.files?.[0];if(!o)return;const e=new FileReader;e.onload=()=>{const i=new Image;i.onload=()=>{T=i,r()},i.src=e.result},e.readAsDataURL(o)}),["#ph-layout","#ph-bg-color","#ph-exam-name","#ph-exam-dop","#ph-bright","#ph-contrast","#ph-quality"].forEach(t=>{a.querySelector(t)?.addEventListener("input",r),a.querySelector(t)?.addEventListener("change",r)}),a.querySelector("#ph-render-btn")?.addEventListener("click",r),a.querySelector("#ph-download-jpg")?.addEventListener("click",()=>{const t=Number(a.querySelector("#ph-quality")?.value||85)/100;s.toBlob(o=>{o&&C(o,`Passport_Photo_${v()}.jpg`,"image/jpeg")},"image/jpeg",t)}),a.querySelector("#ph-print-btn")?.addEventListener("click",()=>{if(!s)return;const t=s.toDataURL("image/png");O(`
        <div style="text-align:center; padding:12px;">
          <img src="${t}" alt="Passport Photo Print Sheet" style="max-width:100%; height:auto; border:1px solid #E2E8F0;">
        </div>
      `)}),r();return}if(g==="SIGNATURE"){const s=a.querySelector("#sig-canvas"),r=()=>{if(!s)return;const l=a.querySelector("#sig-preset")?.value||"213x67",[t,o]=l.split("x").map(Number);s.width=t,s.height=o;const e=s.getContext("2d");e.fillStyle="#FFFFFF",e.fillRect(0,0,t,o),w?e.drawImage(w,0,0,t,o):(e.strokeStyle="#0F172A",e.lineWidth=2.2,e.font="italic bold 22px Georgia, serif",e.fillStyle=a.querySelector("#sig-bw-mode")?.value==="BLUE"?"#1D4ED8":"#000000",e.fillText("R. K. Nair",22,o/2+7)),e.strokeStyle="#CBD5E1",e.strokeRect(0,0,t,o)};a.querySelector("#sig-file-inp")?.addEventListener("change",l=>{const t=l.target.files?.[0];if(!t)return;const o=new FileReader;o.onload=()=>{const e=new Image;e.onload=()=>{w=e,r()},e.src=o.result},o.readAsDataURL(t)}),a.querySelector("#sig-preset")?.addEventListener("change",r),a.querySelector("#sig-bw-mode")?.addEventListener("change",r),a.querySelector("#sig-render-btn")?.addEventListener("click",r),a.querySelector("#sig-download-btn")?.addEventListener("click",()=>{s.toBlob(l=>{l&&C(l,`Formatted_Signature_${v()}.jpg`,"image/jpeg")},"image/jpeg",.85)}),r();return}if(g==="ID_LAYOUT"){const s=a.querySelector("#id-canvas"),r=()=>{if(!s)return;const l=s.getContext("2d"),t=Number(a.querySelector("#id-copies")?.value||1);s.width=620,s.height=t>2?720:400,l.fillStyle="#FFFFFF",l.fillRect(0,0,s.width,s.height);const o=260,e=164;for(let i=0;i<t;i++){const n=24+i*(e+22);l.strokeStyle="#475569",l.setLineDash([4,3]),l.strokeRect(24,n,o,e),l.strokeRect(316,n,o,e),l.setLineDash([]),L?l.drawImage(L,26,n+2,o-4,e-4):(l.fillStyle="#F1F5F9",l.fillRect(26,n+2,o-4,e-4),l.fillStyle="#12345A",l.font="bold 12px Inter, sans-serif",l.fillText("CUSTOMER ID — FRONT SIDE (CR80 85.6×54mm)",40,n+84)),R?l.drawImage(R,318,n+2,o-4,e-4):(l.fillStyle="#F1F5F9",l.fillRect(318,n+2,o-4,e-4),l.fillStyle="#12345A",l.font="bold 12px Inter, sans-serif",l.fillText("CUSTOMER ID — BACK SIDE (CR80 85.6×54mm)",332,n+84))}};a.querySelector("#id-front-inp")?.addEventListener("change",l=>{const t=l.target.files?.[0];if(!t)return;const o=new FileReader;o.onload=()=>{const e=new Image;e.onload=()=>{L=e,r()},e.src=o.result},o.readAsDataURL(t)}),a.querySelector("#id-back-inp")?.addEventListener("change",l=>{const t=l.target.files?.[0];if(!t)return;const o=new FileReader;o.onload=()=>{const e=new Image;e.onload=()=>{R=e,r()},e.src=o.result},o.readAsDataURL(t)}),a.querySelector("#id-copies")?.addEventListener("change",r),a.querySelector("#id-render-btn")?.addEventListener("click",r),a.querySelector("#id-download-btn")?.addEventListener("click",()=>{s.toBlob(l=>{l&&C(l,`ID_Card_Print_Sheet_${v()}.jpg`,"image/jpeg")},"image/jpeg",.92)}),a.querySelector("#id-print-btn")?.addEventListener("click",()=>{if(!s)return;const l=s.toDataURL("image/png");O(`
        <div style="text-align:center; padding:12px;">
          <img src="${l}" alt="ID Card Print Sheet" style="max-width:100%; height:auto;">
        </div>
      `)}),r();return}if(g==="PDF_SCAN"){const s=a.querySelector("#pdf-files-inp"),r=a.querySelector("#pdf-inspect-output");s?.addEventListener("change",async()=>{const e=Array.from(s.files||[]);k=e;let i=0;const n=[];for(const c of e){let d=1;if(c.name.toLowerCase().endsWith(".pdf")){const u=await c.arrayBuffer(),y=new TextDecoder("latin1").decode(u).match(/\/Type\s*\/Page\b(?!s)/g);d=Math.max(1,y?y.length:1)}i+=d,n.push(`${p(c.name)} (${d} page${d>1?"s":""})`)}r&&(r.innerHTML=`<div><strong>Loaded ${e.length} file(s) — Total Printable Pages: ${i}</strong><br><small>${n.join(" • ")}</small></div>`)}),a.querySelector("#pdf-export-btn")?.addEventListener("click",async()=>{const e=k.map((c,d)=>[String(d+1),c.name,`${Math.round(c.size/1024)} KB`]),{generateSimplePDFBlob:i}=await import("../core/utils.js"),n=i("VLEBook Document Workbench - Combined PDF Package",`Generated on ${v()} | Total Files: ${k.length}`,["#","Document Name","File Size"],e.length?e:[["1","Scanned_Citizen_Document.jpg","128 KB"]]);C(n,`VLEBook_Combined_${v()}.pdf`,"application/pdf")});let l=null;const t=a.querySelector("#cam-video"),o=a.querySelector("#cam-canvas");a.querySelector("#cam-start-btn")?.addEventListener("click",async()=>{try{l=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}),t&&(t.srcObject=l,t.style.display="block")}catch{}}),a.querySelector("#cam-capture-btn")?.addEventListener("click",()=>{if(!o)return;const e=o.getContext("2d");t&&t.srcObject?(e.filter="contrast(135%) brightness(108%)",e.drawImage(t,0,0,o.width,o.height),e.filter="none"):(e.fillStyle="#FFFFFF",e.fillRect(0,0,o.width,o.height),e.strokeStyle="#087E8B",e.lineWidth=2,e.strokeRect(20,20,o.width-40,o.height-40),e.fillStyle="#12345A",e.font="bold 14px Inter, sans-serif",e.fillText("ENHANCED DOCUMENT SCAN PREVIEW (HIGH CONTRAST)",42,60))}),a.querySelector("#cam-stop-btn")?.addEventListener("click",()=>{l&&l.getTracks().forEach(e=>e.stop()),t&&(t.style.display="none")});return}if(g==="QR_STAMP"){const s=a.querySelector("#qr-tool-canvas"),r=()=>{const e=a.querySelector("#qr-tool-type")?.value||"UPI",i=(a.querySelector("#qr-tool-val1")?.value||"").trim(),n=(a.querySelector("#qr-tool-val2")?.value||"").trim(),c=(a.querySelector("#qr-tool-amt")?.value||"").trim();if(e==="UPI"){const d=Number(c)>0?Number(c).toFixed(2):"";return`upi://pay?pa=${encodeURIComponent(i)}&pn=${encodeURIComponent(n)}${d?`&am=${d}`:""}&cu=INR`}if(e==="WIFI"){const d=u=>u.replace(/([\\;,:"])/g,"\\$1");return`WIFI:T:WPA;S:${d(i)};P:${d(n)};;`}if(e==="WA"){let d=i.replace(/\D/g,"");return d.length===10&&(d=`91${d}`),`https://wa.me/${d}${n?`?text=${encodeURIComponent(n)}`:""}`}return i||" "},l=()=>{try{M(s,r(),200)}catch(e){alert(e.message||"Could not create QR code")}};a.querySelector("#qr-tool-gen-btn")?.addEventListener("click",l),["#qr-tool-type","#qr-tool-val1","#qr-tool-val2","#qr-tool-amt"].forEach(e=>a.querySelector(e)?.addEventListener("input",l)),a.querySelector("#qr-tool-dl-btn")?.addEventListener("click",()=>{const e=document.createElement("canvas");try{M(e,r(),800)}catch(i){alert(i.message||"Could not create QR code");return}e.toBlob(i=>i&&C(i,`VLEBook_QR_${v()}.png`,"image/png"))}),l();const t=a.querySelector("#stamp-canvas"),o=()=>{if(!t)return;const e=t.getContext("2d"),i=(a.querySelector("#stamp-outer")?.value||"DIGITAL SEVA CENTRE").toUpperCase(),n=(a.querySelector("#stamp-inner")?.value||"VERIFIED").toUpperCase(),c=a.querySelector("#stamp-color")?.value||"#1D4ED8";e.clearRect(0,0,240,240),e.strokeStyle=c,e.fillStyle=c,e.lineWidth=4,e.beginPath(),e.arc(120,120,102,0,Math.PI*2),e.stroke(),e.lineWidth=1.5,e.beginPath(),e.arc(120,120,74,0,Math.PI*2),e.stroke(),e.font="bold 11px Inter, sans-serif",e.textAlign="center",e.fillText(i.slice(0,28),120,58),e.font="bold 13px Inter, sans-serif",e.fillText(n.slice(0,20),120,124),e.font="10px Inter, sans-serif",e.fillText(v(),120,144)};a.querySelector("#stamp-gen-btn")?.addEventListener("click",o),a.querySelector("#stamp-dl-btn")?.addEventListener("click",()=>{t?.toBlob(e=>e&&C(e,`Centre_Stamp_${v()}.png`,"image/png"))}),o();return}a.querySelector("#calc-age-btn")?.addEventListener("click",()=>{const s=new Date(a.querySelector("#calc-dob")?.value),r=new Date(a.querySelector("#calc-as-of")?.value),l=a.querySelector("#calc-age-result");if(isNaN(s)||isNaN(r)||!l)return;let t=r.getFullYear()-s.getFullYear(),o=r.getMonth()-s.getMonth(),e=r.getDate()-s.getDate();e<0&&(o--,e+=30),o<0&&(t--,o+=12),l.innerHTML=`<strong>${t} Years, ${o} Months, ${e} Days</strong>`});const f=a.querySelector("#calc-fin-result");a.querySelector("#calc-emi-btn")?.addEventListener("click",()=>{const s=Number(a.querySelector("#calc-fin-amt")?.value||0),r=Number(a.querySelector("#calc-fin-rate")?.value||12),l=Math.max(1,Number(a.querySelector("#calc-fin-months")?.value||12)),t=r/12/100,o=t===0?s/l:s*t*Math.pow(1+t,l)/(Math.pow(1+t,l)-1);f&&(f.innerHTML=`<div><strong>Monthly EMI: ₹${o.toFixed(2)}</strong><br>Total Payable: ₹${(o*l).toFixed(2)} | Interest: ₹${(o*l-s).toFixed(2)}</div>`)}),a.querySelector("#calc-gst-btn")?.addEventListener("click",()=>{const s=Number(a.querySelector("#calc-fin-amt")?.value||0),r=Number(a.querySelector("#calc-fin-rate")?.value||18),l=s*r/100;f&&(f.innerHTML=`<div><strong>Exclusive GST: ₹${l.toFixed(2)}</strong> (CGST: ₹${(l/2).toFixed(2)} + SGST: ₹${(l/2).toFixed(2)})<br>Total with GST: ₹${(s+l).toFixed(2)}</div>`)}),a.querySelector("#calc-si-btn")?.addEventListener("click",()=>{const s=Number(a.querySelector("#calc-fin-amt")?.value||0),r=Number(a.querySelector("#calc-fin-rate")?.value||10),l=Number(a.querySelector("#calc-fin-months")?.value||12)/12,t=s*r*l/100,o=s*Math.pow(1+r/100,l)-s;f&&(f.innerHTML=`<div><strong>Simple Interest: ₹${t.toFixed(2)}</strong> | <strong>Compound Interest: ₹${o.toFixed(2)}</strong></div>`)}),a.querySelectorAll("[data-txt-op]").forEach(s=>{s.addEventListener("click",()=>{const r=a.querySelector("#txt-clean-inp");if(!r)return;let l=r.value.trim().replace(/\s+/g," ");const t=s.getAttribute("data-txt-op");t==="UPPER"?l=l.toUpperCase():t==="TITLE"?l=l.toLowerCase().replace(/\b\w/g,o=>o.toUpperCase()):t==="ALPHANUM"&&(l=l.replace(/[^a-zA-Z0-9 ]/g,"")),r.value=l})})}export{U as renderStudioModule};
