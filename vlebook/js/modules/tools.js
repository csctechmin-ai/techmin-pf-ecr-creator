import{esc as M,downloadFile as j,todayISO as le}from"../core/utils.js";import{buildZip as ie}from"../core/zip.js";import{readFileBytes as se,openPdfJs as re,renderPage as ne,pageThumbnails as de,parseRanges as ce,mergeDocuments as pe,splitPdf as ue,organizePdf as me,compressPdf as be,rasterizePdf as ge,pdfToImages as ve,extractTextLayout as fe,pagesToPlainText as he,pdfToDocx as ye,pdfToXlsx as we,imagesToPdf as xe,applyEdits as Se,addPageNumbers as Ee,addWatermark as $e,getPageCount as Y,closePdf as Z}from"../core/pdftools.js";import{loadImageFromFile as W,imageSize as Pe,toCanvas as k,targetDimensions as Te,canvasToBlob as H,compressToTarget as V,rotateCanvas as Q,flipCanvas as ee,cropCanvas as Me,adjustCanvas as U,textToPng as te,formatBytes as F,replaceExt as ae,IMAGE_FORMATS as X}from"../core/imagetools.js";const Ae=[["MERGE","","Merge PDF"],["SPLIT","","Split / Extract Pages"],["ORGANIZE","","Organise Pages"],["COMPRESS","","Compress PDF"],["EDIT","","Edit PDF"],["STAMP","","Watermark & Page Numbers"],["TO_WORD","","PDF to Word"],["TO_EXCEL","","PDF to Excel"],["TO_IMAGES","","PDF to Images / Text"],["FROM_IMAGES","","Images to PDF"],["UNLOCK","","Unlock PDF"]],Ie=[["IMG_BATCH","","Resize, Compress & Convert"],["IMG_EDIT","","Crop, Rotate & Enhance"]];let $="MERGE",c=[],L=!1,D=null,h=[],r=null,g=null;const B=()=>Math.random().toString(36).slice(2,10),K=()=>le(),P=e=>String(e||"document").replace(/\.[^.]+$/,"");function qe(){c=[],D=null,h=[],r?.pdf&&Z(r.pdf),r=null,g=null}async function ke(e){const o=$.startsWith("IMG_");e.innerHTML=`
    <div class="module-header">
      <div class="module-title-group">
        <h1>PDF & Image Tools</h1>
        <p>Merge, split, compress, edit and convert PDFs; resize and compress photos for portals — all offline on this computer</p>
      </div>
    </div>

    <div class="callout success">
      <div><strong>Private by design:</strong> Files are processed inside this browser and are never uploaded. Close the tab or switch tools to clear them from memory.</div>
    </div>

    <div class="tools-nav">
      <div class="tools-nav-group">
        <div class="tools-nav-label">PDF Tools</div>
        <div class="pill-tabs">${Ae.map(([l,a,s])=>`<button class="pill-tab ${$===l?"active":""}" data-tool="${l}">${M(s)}</button>`).join("")}</div>
      </div>
      <div class="tools-nav-group">
        <div class="tools-nav-label">Image Tools</div>
        <div class="pill-tabs">${Ie.map(([l,a,s])=>`<button class="pill-tab ${$===l?"active":""}" data-tool="${l}">${M(s)}</button>`).join("")}</div>
      </div>
    </div>

    <div class="card" id="tool-card">${Fe()}</div>
    <div id="tool-status"></div>
    <div id="tool-results"></div>
  `,e.querySelectorAll("[data-tool]").forEach(l=>l.addEventListener("click",()=>{L||($=l.getAttribute("data-tool"),qe(),ke(e))})),Le(e,o)}function S({accept:e,multiple:o,hint:l}){return`
    <div class="tool-dropzone" id="tool-drop">
      <input type="file" id="tool-file" ${o?"multiple":""} accept="${e}">
      <div class="tool-dropzone-text"><strong>Choose ${o?"files":"a file"}</strong> or drag and drop here</div>
      <div class="form-hint">${M(l)}</div>
    </div>
    <div id="tool-file-list"></div>`}function G(){return`
    <div class="form-group">
      <label class="form-label">PDF Password (only if the PDF is protected)</label>
      <input type="password" class="form-control" id="tool-pdf-pass" autocomplete="off" placeholder="Leave blank if not protected">
    </div>`}function Fe(){switch($){case"MERGE":return`
        <div class="card-header"><div class="card-title">Merge PDF</div></div>
        <p class="form-hint">Combine several PDFs (and JPG/PNG images) into one PDF. Use the arrows to set the order.</p>
        ${S({accept:".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*",multiple:!0,hint:"PDF, JPG, PNG or WEBP"})}
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Merge & Download</button></div>`;case"SPLIT":return`
        <div class="card-header"><div class="card-title">Split / Extract Pages</div></div>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div class="grid-2" style="gap:10px;">
          <div class="form-group">
            <label class="form-label">What to do</label>
            <select class="form-control" id="split-mode">
              <option value="EXTRACT">Extract the pages below into one PDF</option>
              <option value="RANGES">Make a separate PDF for each range</option>
              <option value="EVERY">Split every page into its own PDF</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Pages</label>
            <input type="text" class="form-control" id="split-ranges" placeholder="e.g. 1-3, 5, 8-">
            <span class="form-hint" id="split-pagecount"></span>
          </div>
        </div>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Split & Download</button></div>`;case"ORGANIZE":return`
        <div class="card-header"><div class="card-title">Organise Pages</div></div>
        <p class="form-hint">Reorder, rotate or delete pages, then save a new PDF.</p>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div id="organize-grid" class="tool-thumb-grid"></div>
        <div class="tool-actions">
          <button class="btn btn-outline" id="org-reset" disabled>Reset</button>
          <button class="btn btn-primary" id="tool-run" disabled>Save Organised PDF</button>
        </div>`;case"COMPRESS":return`
        <div class="card-header"><div class="card-title">Compress PDF</div></div>
        ${S({accept:".pdf,application/pdf",multiple:!0,hint:"One or more PDFs"})}
        <div class="grid-3" style="gap:10px;">
          <div class="form-group">
            <label class="form-label">Compression Level</label>
            <select class="form-control" id="cmp-level">
              <option value="LOSSLESS">Light — keep text selectable</option>
              <option value="150" selected>Medium — good for printing (150 dpi)</option>
              <option value="110">Strong — smaller (110 dpi)</option>
              <option value="80">Extreme — smallest for uploads (80 dpi)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Colour</label>
            <select class="form-control" id="cmp-color">
              <option value="COLOR">Keep colour</option>
              <option value="GRAY">Black & white (smaller)</option>
            </select>
          </div>
          ${G()}
        </div>
        <p class="form-hint">Medium, Strong and Extreme turn each page into an image, so text can no longer be selected or copied.</p>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Compress & Download</button></div>`;case"EDIT":return`
        <div class="card-header"><div class="card-title">Edit PDF</div></div>
        <p class="form-hint">Add text (any language), a signature or photo, or white-out an area. Click on the page to place items; drag to move them.</p>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div id="editor-area"></div>`;case"STAMP":return`
        <div class="card-header"><div class="card-title">Watermark & Page Numbers</div></div>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div class="grid-2" style="gap:14px;">
          <div>
            <label style="display:flex; gap:8px; align-items:center; font-weight:600; margin-bottom:8px;"><input type="checkbox" id="wm-on" checked> Add Watermark</label>
            <div class="form-group"><label class="form-label">Watermark Text</label><input type="text" class="form-control" id="wm-text" value="CERTIFIED TRUE COPY"></div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group"><label class="form-label">Opacity (%)</label><input type="number" class="form-control" id="wm-opacity" min="5" max="80" value="18"></div>
              <div class="form-group"><label class="form-label">Colour</label><input type="color" class="form-control" id="wm-color" value="#C0392B"></div>
            </div>
          </div>
          <div>
            <label style="display:flex; gap:8px; align-items:center; font-weight:600; margin-bottom:8px;"><input type="checkbox" id="pn-on" checked> Add Page Numbers</label>
            <div class="form-group">
              <label class="form-label">Position</label>
              <select class="form-control" id="pn-pos">
                <option value="BOTTOM_CENTER">Bottom centre</option>
                <option value="BOTTOM_RIGHT">Bottom right</option>
                <option value="BOTTOM_LEFT">Bottom left</option>
                <option value="TOP_CENTER">Top centre</option>
                <option value="TOP_RIGHT">Top right</option>
              </select>
            </div>
            <div class="grid-2" style="gap:8px;">
              <div class="form-group">
                <label class="form-label">Format</label>
                <select class="form-control" id="pn-format" data-no-i18n>
                  <option value="Page {n} of {total}">Page 1 of 9</option>
                  <option value="{n}">1</option>
                  <option value="{n} / {total}">1 / 9</option>
                  <option value="- {n} -">- 1 -</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Start At</label><input type="number" class="form-control" id="pn-start" min="1" value="1"></div>
            </div>
          </div>
        </div>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Apply & Download</button></div>`;case"TO_WORD":return`
        <div class="card-header"><div class="card-title">PDF to Word (.docx)</div></div>
        <p class="form-hint">Extracts the text of each page into an editable Word document. Works for PDFs that contain real text (not scanned photos).</p>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        ${G()}
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Convert to Word</button></div>`;case"TO_EXCEL":return`
        <div class="card-header"><div class="card-title">PDF to Excel (.xlsx)</div></div>
        <p class="form-hint">Turns tables in the PDF (statements, fee lists, reports) into spreadsheet rows and columns — one sheet per page. Amounts become numbers you can add up.</p>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        ${G()}
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Convert to Excel</button></div>
        <div id="excel-preview"></div>`;case"TO_IMAGES":return`
        <div class="card-header"><div class="card-title">PDF to Images / Text</div></div>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div class="grid-3" style="gap:10px;">
          <div class="form-group">
            <label class="form-label">Image Format</label>
            <select class="form-control" id="img-fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select>
          </div>
          <div class="form-group">
            <label class="form-label">Quality (DPI)</label>
            <select class="form-control" id="img-dpi"><option value="100">100 — screen</option><option value="150" selected>150 — standard</option><option value="200">200 — sharp</option><option value="300">300 — print</option></select>
          </div>
          ${G()}
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="tool-run" disabled>Convert to Images</button>
          <button class="btn btn-outline" id="tool-run-text" disabled>Extract Text (.txt)</button>
        </div>`;case"FROM_IMAGES":return`
        <div class="card-header"><div class="card-title">Images to PDF</div></div>
        ${S({accept:".jpg,.jpeg,.png,.webp,image/*",multiple:!0,hint:"JPG, PNG or WEBP — use the arrows to set page order"})}
        <div class="grid-3" style="gap:10px;">
          <div class="form-group"><label class="form-label">Page Size</label><select class="form-control" id="i2p-size"><option value="A4">A4</option><option value="FIT">Same as image</option></select></div>
          <div class="form-group"><label class="form-label">Orientation</label><select class="form-control" id="i2p-orient"><option value="AUTO">Automatic</option><option value="PORTRAIT">Portrait</option><option value="LANDSCAPE">Landscape</option></select></div>
          <div class="form-group"><label class="form-label">Margin</label><select class="form-control" id="i2p-margin"><option value="0">None</option><option value="18" selected>Small</option><option value="40">Large</option></select></div>
        </div>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Create PDF</button></div>`;case"UNLOCK":return`
        <div class="card-header"><div class="card-title">Unlock PDF</div></div>
        <div class="callout warning"><div>Use only for PDFs you are allowed to open, with the owner's consent (for example a customer's own e-Aadhaar). The password is never stored.</div></div>
        <p class="form-hint">e-Aadhaar password: first 4 letters of the name in CAPITALS + year of birth (e.g. RAJE1985).</p>
        ${S({accept:".pdf,application/pdf",multiple:!1,hint:"One password-protected PDF"})}
        <div class="form-group">
          <label class="form-label">PDF Password</label>
          <input type="password" class="form-control" id="tool-pdf-pass" autocomplete="off" placeholder="Enter the PDF password">
        </div>
        <p class="form-hint">The unlocked copy is rebuilt from page images (200 dpi), so it prints exactly like the original.</p>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Unlock & Download</button></div>`;case"IMG_BATCH":return`
        <div class="card-header"><div class="card-title">Resize, Compress & Convert Images</div></div>
        <p class="form-hint">For exam and government portals: set a size limit in KB and the exact pixel size required.</p>
        ${S({accept:".jpg,.jpeg,.png,.webp,image/*",multiple:!0,hint:"One or more images"})}
        <div class="form-group">
          <label class="form-label">Quick Preset</label>
          <select class="form-control" id="ib-preset">
            <option value="">— Choose a preset (optional) —</option>
            <option value="photo50">Passport photo — max 50 KB, JPG</option>
            <option value="photo20">Exam photo — max 20 KB, JPG</option>
            <option value="sign20">Signature — max 20 KB, JPG</option>
            <option value="pan">PAN photo 213×213 px, JPG</option>
            <option value="doc200">Document scan — max 200 KB, JPG</option>
            <option value="doc500">Document scan — max 500 KB, JPG</option>
          </select>
        </div>
        <div class="grid-3" style="gap:10px;">
          <div class="form-group">
            <label class="form-label">Resize</label>
            <select class="form-control" id="ib-mode">
              <option value="NONE">Keep original size</option>
              <option value="PERCENT">By percentage</option>
              <option value="PIXELS">Exact width / height (px)</option>
              <option value="MAX_SIDE">Longest side (px)</option>
            </select>
          </div>
          <div class="form-group" id="ib-percent-wrap"><label class="form-label">Percent (%)</label><input type="number" class="form-control" id="ib-percent" min="1" max="400" value="50"></div>
          <div class="form-group" id="ib-w-wrap"><label class="form-label">Width (px)</label><input type="number" class="form-control" id="ib-w" min="1" placeholder="auto"></div>
          <div class="form-group" id="ib-h-wrap"><label class="form-label">Height (px)</label><input type="number" class="form-control" id="ib-h" min="1" placeholder="auto"></div>
          <div class="form-group" id="ib-max-wrap"><label class="form-label">Longest Side (px)</label><input type="number" class="form-control" id="ib-max" min="16" value="1600"></div>
          <div class="form-group" id="ib-aspect-wrap"><label class="form-label">Proportions</label><select class="form-control" id="ib-aspect"><option value="KEEP">Keep proportions</option><option value="STRETCH">Stretch to exact size</option></select></div>
        </div>
        <div class="grid-3" style="gap:10px;">
          <div class="form-group">
            <label class="form-label">Output Format</label>
            <select class="form-control" id="ib-format"><option value="SAME">Same as original</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select>
          </div>
          <div class="form-group">
            <label class="form-label">Maximum File Size (KB)</label>
            <input type="number" class="form-control" id="ib-kb" min="1" placeholder="No limit">
          </div>
          <div class="form-group">
            <label class="form-label">Quality (when no KB limit)</label>
            <select class="form-control" id="ib-quality"><option value="0.95">Best</option><option value="0.85" selected>High</option><option value="0.7">Medium</option><option value="0.5">Low</option></select>
          </div>
        </div>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Process Images</button></div>`;case"IMG_EDIT":return`
        <div class="card-header"><div class="card-title">Crop, Rotate & Enhance</div></div>
        ${S({accept:".jpg,.jpeg,.png,.webp,image/*",multiple:!1,hint:"One image"})}
        <div id="imgedit-area"></div>`;default:return""}}function Le(e,o){const l=e.querySelector("#tool-file"),a=e.querySelector("#tool-drop"),s=l?.hasAttribute("multiple"),t=async i=>{const n=Array.from(i||[]);if(n.length){s||(c=[]);for(const b of n)if(c.push({id:B(),name:b.name,type:b.type||De(b.name),size:b.size,file:b,bytes:null}),!s)break;O(e),await oe(e)}};l?.addEventListener("change",()=>t(l.files)),a&&(["dragenter","dragover"].forEach(i=>a.addEventListener(i,n=>{n.preventDefault(),a.classList.add("dragging")})),["dragleave","drop"].forEach(i=>a.addEventListener(i,n=>{n.preventDefault(),a.classList.remove("dragging")})),a.addEventListener("drop",i=>t(i.dataTransfer?.files))),O(e),e.querySelector("#tool-run")?.addEventListener("click",()=>I(e,()=>Ne(e))),e.querySelector("#tool-run-text")?.addEventListener("click",()=>I(e,()=>Re(e))),e.querySelector("#org-reset")?.addEventListener("click",()=>{h=h.map((i,n)=>({index:n,rotate:0,deleted:!1})).sort((i,n)=>i.index-n.index),_(e)}),$==="IMG_BATCH"&&ze(e)}function De(e){return/\.pdf$/i.test(e)?"application/pdf":/\.png$/i.test(e)?"image/png":/\.webp$/i.test(e)?"image/webp":/\.jpe?g$/i.test(e)?"image/jpeg":""}async function w(e){return e.bytes||(e.bytes=await se(e.file)),e.bytes}function O(e){const o=e.querySelector("#tool-file-list"),l=e.querySelector("#tool-run"),a=e.querySelector("#tool-run-text");if(l&&(l.disabled=c.length===0||L),a&&(a.disabled=c.length===0||L),!o)return;if(!c.length){o.innerHTML="";return}const s=c.length>1;o.innerHTML=`
    <table class="data-table tool-file-table">
      <thead><tr><th>#</th><th>File</th><th class="num">Size</th><th></th></tr></thead>
      <tbody>
        ${c.map((t,i)=>`
          <tr>
            <td>${i+1}</td>
            <td data-no-i18n><strong>${M(t.name)}</strong></td>
            <td class="num">${F(t.size)}</td>
            <td style="white-space:nowrap; text-align:right;">
              ${s?`<button class="btn btn-xs btn-outline" data-mv-up="${i}" ${i===0?"disabled":""} title="Move up">↑</button>
              <button class="btn btn-xs btn-outline" data-mv-down="${i}" ${i===c.length-1?"disabled":""} title="Move down">↓</button>`:""}
              <button class="btn btn-xs btn-danger" data-rm="${i}" title="Remove">✕</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`,o.querySelectorAll("[data-mv-up]").forEach(t=>t.addEventListener("click",()=>{const i=Number(t.getAttribute("data-mv-up"));[c[i-1],c[i]]=[c[i],c[i-1]],O(e)})),o.querySelectorAll("[data-mv-down]").forEach(t=>t.addEventListener("click",()=>{const i=Number(t.getAttribute("data-mv-down"));[c[i+1],c[i]]=[c[i],c[i+1]],O(e)})),o.querySelectorAll("[data-rm]").forEach(t=>t.addEventListener("click",async()=>{c.splice(Number(t.getAttribute("data-rm")),1),O(e),await oe(e)}))}async function oe(e){if(Ce(e),$==="SPLIT"&&c[0]&&await I(e,async()=>{const o=await Y(await w(c[0]));c[0].pageCount=o;const l=e.querySelector("#split-pagecount");l&&(l.textContent=`This PDF has ${o} pages.`);const a=e.querySelector("#split-ranges");a&&!a.value&&(a.value=o>1?`1-${Math.min(o,2)}`:"1")},{quiet:!0}),$==="ORGANIZE"&&(D=null,h=[],_(e),c[0]&&await I(e,async o=>{D=await de(await w(c[0]),130,"",(l,a)=>o(`Loading page previews… ${l} / ${a}`)),h=D.map((l,a)=>({index:a,rotate:0,deleted:!1})),_(e)})),$==="EDIT"){r?.pdf&&await Z(r.pdf),r=null;const o=e.querySelector("#editor-area");o&&(o.innerHTML=""),c[0]&&await I(e,async()=>{const l=await re(await w(c[0]));r={pdf:l,pageNo:1,pageCount:l.numPages,scale:1,edits:[],mode:"TEXT",pending:null},A(e),e.querySelector(".pdf-editor-toolbar")?.scrollIntoView({behavior:"smooth",block:"start"})})}if($==="IMG_EDIT"){g=null;const o=e.querySelector("#imgedit-area");o&&(o.innerHTML=""),c[0]&&await I(e,async()=>{const l=await W(c[0].file),a=k(l);g={original:a,current:k(a),crop:null,rotation:0},N(e)})}}function T(e,o,l="info"){const a=e.querySelector("#tool-status");a&&(a.innerHTML=o?`<div class="callout ${l==="error"?"danger":l==="success"?"success":""}" data-kind="${l}"><div>${l==="progress"?'<span class="spinner-dot"></span>':""}${o}</div></div>`:"")}function Ce(e){const o=e.querySelector("#tool-results");o&&(o.innerHTML=""),T(e,"")}async function I(e,o,{quiet:l=!1}={}){if(L)return;L=!0,e.querySelectorAll("#tool-run, #tool-run-text, [data-tool]").forEach(s=>s.disabled=!0);const a=s=>T(e,M(s),"progress");l||a("Working…");try{await o(a),!l&&e.querySelector('#tool-status .callout[data-kind="progress"]')&&T(e,"")}catch(s){console.warn(s);const t=s?.code==="PASSWORD";T(e,`${M(s?.message||String(s))}`,"error"),t&&e.querySelector("#tool-pdf-pass")?.focus()}finally{L=!1,e.querySelectorAll("[data-tool]").forEach(s=>s.disabled=!1),Oe(e)}}function Oe(e){const o=e.querySelector("#tool-run"),l=e.querySelector("#tool-run-text");o&&(o.disabled=c.length===0),l&&(l.disabled=c.length===0)}function x(e,o,l=""){const a=e.querySelector("#tool-results");if(!a)return;const s=o.reduce((t,i)=>t+i.blob.size,0);a.innerHTML=`
    <div class="card">
      <div class="card-header">
        <div class="card-title">Ready — ${o.length} file${o.length===1?"":"s"} (${F(s)})</div>
        ${o.length>1?'<button class="btn btn-sm btn-primary" id="res-zip">Download All (ZIP)</button>':""}
      </div>
      ${l?`<p class="form-hint" style="margin-bottom:10px;">${l}</p>`:""}
      <table class="data-table">
        <thead><tr><th>File</th><th>Details</th><th class="num">Size</th><th></th></tr></thead>
        <tbody>
          ${o.map((t,i)=>`
            <tr>
              <td data-no-i18n><strong>${M(t.name)}</strong></td>
              <td>${t.info||""}</td>
              <td class="num">${F(t.blob.size)}</td>
              <td style="text-align:right;"><button class="btn btn-xs btn-primary" data-res-dl="${i}">Download</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`,a.querySelectorAll("[data-res-dl]").forEach(t=>t.addEventListener("click",()=>{const i=o[Number(t.getAttribute("data-res-dl"))];j(i.blob,i.name,i.blob.type)})),a.querySelector("#res-zip")?.addEventListener("click",async()=>{const t=[];for(const i of o)t.push({name:i.name,data:new Uint8Array(await i.blob.arrayBuffer())});j(new Blob([ie(t)],{type:"application/zip"}),`VLEBook_Tools_${K()}.zip`,"application/zip")}),o.length===1&&j(o[0].blob,o[0].name,o[0].blob.type),T(e,"")}const q=e=>new Blob([e],{type:"application/pdf"}),C=e=>e.querySelector("#tool-pdf-pass")?.value||"";async function Ne(e){if(!c.length)throw new Error("Choose a file first.");const o=a=>T(e,M(a),"progress"),l=c[0];switch($){case"MERGE":{if(c.length<2)throw new Error("Choose at least two files to merge.");const a=[];for(const t of c)a.push({name:t.name,type:t.type,bytes:await w(t)});const s=await pe(a,(t,i)=>o(`Merging… ${t} / ${i}`));x(e,[{name:`Merged_${K()}.pdf`,blob:q(s),info:`${c.length} files combined`}]);break}case"SPLIT":{const a=await w(l),s=l.pageCount||await Y(a),t=e.querySelector("#split-mode").value;let i;t==="EVERY"?i=Array.from({length:s},(b,u)=>[u]):(i=ce(e.querySelector("#split-ranges").value,s),t==="EXTRACT"&&(i=[i.flat()]));const n=await ue(a,i,P(l.name));x(e,n.map((b,u)=>({name:b.name,blob:q(b.bytes),info:`${i[u].length} page(s)`})));break}case"ORGANIZE":{const a=h.filter(t=>!t.deleted);if(!a.length)throw new Error("At least one page must be kept.");const s=await me(await w(l),a);x(e,[{name:`${P(l.name)}_organised.pdf`,blob:q(s),info:`${a.length} page(s)`}]);break}case"COMPRESS":{const a=e.querySelector("#cmp-level").value,s=e.querySelector("#cmp-color").value==="GRAY",t=[];for(let i=0;i<c.length;i++){const n=c[i],b=await w(n),u=a==="LOSSLESS"?{mode:"LOSSLESS"}:{mode:"IMAGE",dpi:Number(a),quality:Number(a)>=150?.7:Number(a)>=110?.6:.5,grayscale:s,password:C(e)};let m=await be(b,u,(p,d)=>o(`${n.name}: page ${p} / ${d}`)),y;m.length>=b.length?(m=b,y="Already well compressed — original kept"):y=`${F(b.length)} → ${F(m.length)} (${Math.round((1-m.length/b.length)*100)}% smaller)`,t.push({name:`${P(n.name)}_compressed.pdf`,blob:q(m),info:y})}x(e,t);break}case"STAMP":{const a=e.querySelector("#wm-on").checked,s=e.querySelector("#pn-on").checked;if(!a&&!s)throw new Error("Choose watermark, page numbers, or both.");let t=await w(l);if(a){const i=e.querySelector("#wm-text").value.trim()||"COPY",n=await te(i,{fontSize:72,bold:!0,color:e.querySelector("#wm-color").value});t=await $e(t,n.bytes,{opacity:Math.min(.8,Math.max(.05,Number(e.querySelector("#wm-opacity").value)/100))})}s&&(t=await Ee(t,{position:e.querySelector("#pn-pos").value,format:e.querySelector("#pn-format").value,startAt:Number(e.querySelector("#pn-start").value)||1})),x(e,[{name:`${P(l.name)}_stamped.pdf`,blob:q(t)}]);break}case"TO_WORD":{const a=await ye(await w(l),P(l.name),C(e),(s,t)=>o(`Reading page ${s} / ${t}`));x(e,[{name:`${P(l.name)}.docx`,blob:new Blob([a.bytes],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),info:`${a.pages} page(s)`}],a.hasText?"":"No text was found — this looks like a scanned PDF. Use “PDF to Images” instead, or retype the content.");break}case"TO_EXCEL":{const a=await w(l),s=await we(a,C(e),(t,i)=>o(`Reading page ${t} / ${i}`));if(x(e,[{name:`${P(l.name)}.xlsx`,blob:new Blob([s.bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),info:`${s.pages} sheet(s)`}],s.hasText?"":"No text was found — this looks like a scanned PDF, so there is nothing to put in the spreadsheet."),s.hasText){const t=s.tables,i=Math.max(0,t.findIndex(u=>u.filter(m=>m.filter(y=>y!=="").length>=2).length>=3)),n=t[i].slice(0,12),b=e.querySelector("#excel-preview");b&&(b.innerHTML=`<div class="form-label" style="margin-top:12px;">Preview — Page ${i+1}</div><div class="table-wrap" data-no-i18n><table class="data-table">${n.map(u=>`<tr>${u.map(m=>`<td>${M(m)}</td>`).join("")}</tr>`).join("")}</table></div>`)}break}case"TO_IMAGES":{const a=e.querySelector("#img-fmt").value,s=await ve(await w(l),{format:a,dpi:Number(e.querySelector("#img-dpi").value),password:C(e)},(t,i)=>o(`Rendering page ${t} / ${i}`));x(e,s.map(t=>({name:`${P(l.name)}_${t.name}`,blob:new Blob([t.bytes],{type:a})})));break}case"FROM_IMAGES":{const a=[];for(const t of c)a.push({name:t.name,type:t.type,bytes:await w(t)});const s=await xe(a,{pageSize:e.querySelector("#i2p-size").value,orientation:e.querySelector("#i2p-orient").value,margin:Number(e.querySelector("#i2p-margin").value)},(t,i)=>o(`Adding image ${t} / ${i}`));x(e,[{name:`Images_${K()}.pdf`,blob:q(s),info:`${c.length} page(s)`}]);break}case"UNLOCK":{const a=C(e);if(!a)throw new Error("Enter the PDF password.");const s=await ge(await w(l),{dpi:200,quality:.9,password:a},(t,i)=>o(`Unlocking page ${t} / ${i}`));x(e,[{name:`${P(l.name)}_unlocked.pdf`,blob:q(s)}]);break}case"IMG_BATCH":await je(e,o);break;default:break}}async function Re(e){if(!c[0])throw new Error("Choose a file first.");const o=await fe(await w(c[0]),C(e),(a,s)=>T(e,`Reading page ${a} / ${s}`,"progress")),l=he(o);x(e,[{name:`${P(c[0].name)}.txt`,blob:new Blob(["\uFEFF"+l],{type:"text/plain;charset=utf-8"}),info:`${o.length} page(s)`}],l.trim()?"":"No text was found — this looks like a scanned PDF.")}function _(e){const o=e.querySelector("#organize-grid"),l=e.querySelector("#tool-run"),a=e.querySelector("#org-reset");if(o){if(!D){o.innerHTML="",a&&(a.disabled=!0);return}a&&(a.disabled=!1),l&&(l.disabled=!1),o.innerHTML=h.map((s,t)=>{const i=D[s.index];return`
      <div class="tool-thumb ${s.deleted?"deleted":""}">
        <div class="tool-thumb-img"><img src="${i.dataUrl}" alt="" style="transform:rotate(${s.rotate}deg);"></div>
        <div class="tool-thumb-label">Page ${s.index+1}${s.deleted?" — removed":""}</div>
        <div class="tool-thumb-btns">
          <button class="btn btn-xs btn-outline" data-org="left" data-pos="${t}" ${t===0?"disabled":""} title="Move left">◀</button>
          <button class="btn btn-xs btn-outline" data-org="rotl" data-pos="${t}" title="Rotate left">⟲</button>
          <button class="btn btn-xs btn-outline" data-org="rotr" data-pos="${t}" title="Rotate right">⟳</button>
          <button class="btn btn-xs ${s.deleted?"btn-success":"btn-danger"}" data-org="del" data-pos="${t}" title="${s.deleted?"Restore":"Delete"}">${s.deleted?"↺":"✕"}</button>
          <button class="btn btn-xs btn-outline" data-org="right" data-pos="${t}" ${t===h.length-1?"disabled":""} title="Move right">▶</button>
        </div>
      </div>`}).join(""),o.querySelectorAll("[data-org]").forEach(s=>s.addEventListener("click",()=>{const t=Number(s.getAttribute("data-pos")),i=s.getAttribute("data-org"),n=h[t];i==="left"&&t>0&&([h[t-1],h[t]]=[h[t],h[t-1]]),i==="right"&&t<h.length-1&&([h[t+1],h[t]]=[h[t],h[t+1]]),i==="rotl"&&(n.rotate=(n.rotate+270)%360),i==="rotr"&&(n.rotate=(n.rotate+90)%360),i==="del"&&(n.deleted=!n.deleted),_(e)}))}}function A(e){const o=e.querySelector("#editor-area");!o||!r||(o.innerHTML=`
    <div class="pdf-editor-toolbar">
      <div class="pill-tabs" style="margin:0;">
        <button class="pill-tab ${r.mode==="TEXT"?"active":""}" data-ed-mode="TEXT">Add Text</button>
        <button class="pill-tab ${r.mode==="IMAGE"?"active":""}" data-ed-mode="IMAGE">Add Signature / Image</button>
        <button class="pill-tab ${r.mode==="WHITEOUT"?"active":""}" data-ed-mode="WHITEOUT">White-out</button>
      </div>
      <div style="display:flex; gap:6px; align-items:center;">
        <button class="btn btn-sm btn-outline" id="ed-prev" ${r.pageNo<=1?"disabled":""}>◀</button>
        <span class="pdf-editor-pageno">Page ${r.pageNo} / ${r.pageCount}</span>
        <button class="btn btn-sm btn-outline" id="ed-next" ${r.pageNo>=r.pageCount?"disabled":""}>▶</button>
      </div>
    </div>
    <div class="grid-3" style="gap:8px; ${r.mode==="TEXT"?"":"display:none;"}" id="ed-text-opts">
      <div class="form-group" style="grid-column: span 1;"><label class="form-label">Text</label><textarea class="form-control" id="ed-text" rows="2" placeholder="Type text, then click on the page"></textarea></div>
      <div class="form-group"><label class="form-label">Size</label><input type="number" class="form-control" id="ed-size" min="6" max="72" value="12"></div>
      <div class="form-group"><label class="form-label">Colour</label><input type="color" class="form-control" id="ed-color" value="#000000"></div>
    </div>
    <div class="grid-2" style="gap:8px; ${r.mode==="IMAGE"?"":"display:none;"}" id="ed-img-opts">
      <div class="form-group"><label class="form-label">Signature / Photo / Stamp Image</label><input type="file" class="form-control" id="ed-img" accept="image/png,image/jpeg,image/webp"></div>
      <div class="form-group"><label class="form-label">Width on Page (pt)</label><input type="number" class="form-control" id="ed-img-w" min="10" max="600" value="140"></div>
    </div>
    <p class="form-hint" id="ed-hint">${r.mode==="WHITEOUT"?"Drag a box over the area to cover it with white.":r.mode==="IMAGE"?"Choose an image, then click on the page where it should go.":"Type your text, then click on the page where it should go."}</p>
    <div class="pdf-editor-stage-wrap"><div class="pdf-editor-stage" id="ed-stage"><canvas id="ed-canvas"></canvas><div class="pdf-editor-layer" id="ed-layer"></div></div></div>
    <div id="ed-list"></div>
    <div class="tool-actions">
      <button class="btn btn-outline" id="ed-clear" ${r.edits.length?"":"disabled"}>Remove All Changes</button>
      <button class="btn btn-primary" id="ed-save" ${r.edits.length?"":"disabled"}>Save Edited PDF</button>
    </div>`,o.querySelectorAll("[data-ed-mode]").forEach(l=>l.addEventListener("click",()=>{r.mode=l.getAttribute("data-ed-mode"),A(e)})),o.querySelector("#ed-prev")?.addEventListener("click",()=>{r.pageNo--,A(e)}),o.querySelector("#ed-next")?.addEventListener("click",()=>{r.pageNo++,A(e)}),o.querySelector("#ed-img")?.addEventListener("change",async l=>{const a=l.target.files?.[0];if(!a)return;const s=await W(a),t=k(s),i=await H(t,"image/png");r.pending={pngBytes:new Uint8Array(await i.arrayBuffer()),dataUrl:t.toDataURL("image/png"),ratio:t.height/t.width}}),o.querySelector("#ed-clear")?.addEventListener("click",()=>{r.edits=[],A(e)}),o.querySelector("#ed-save")?.addEventListener("click",()=>I(e,async()=>{const l=await Se(await w(c[0]),r.edits);x(e,[{name:`${P(c[0].name)}_edited.pdf`,blob:q(l),info:`${r.edits.length} change(s)`}])})),Be(e))}async function Be(e){const o=e.querySelector("#ed-canvas"),l=e.querySelector("#ed-stage"),a=e.querySelector("#ed-layer");if(!o||!r)return;const t=(await r.pdf.getPage(r.pageNo)).getViewport({scale:1}),n=Math.min(860,(e.querySelector(".pdf-editor-stage-wrap")?.clientWidth||860)-4)/t.width,b=Math.min(2,window.devicePixelRatio||1);await ne(r.pdf,r.pageNo,n*b,o),o.style.width=`${t.width*n}px`,o.style.height=`${t.height*n}px`,l.style.width=o.style.width,l.style.height=o.style.height,r.scale=n,r.pageW=t.width,r.pageH=t.height,Ge(e);let u=null,m=null;const y=p=>{const d=a.getBoundingClientRect();return{x:(p.clientX-d.left)/r.scale,y:(p.clientY-d.top)/r.scale}};a.onpointerdown=async p=>{if(p.target!==a)return;const d=y(p);if(r.mode==="WHITEOUT"){u=d,m=document.createElement("div"),m.className="pdf-edit-item whiteout",a.appendChild(m),a.setPointerCapture(p.pointerId);return}if(r.mode==="TEXT"){const v=e.querySelector("#ed-text")?.value||"";if(!v.trim()){T(e,"Type the text first, then click on the page.","error");return}const f=Number(e.querySelector("#ed-size")?.value)||12,E=await te(v,{fontSize:f,color:e.querySelector("#ed-color")?.value||"#000000"});r.edits.push({id:B(),pageIndex:r.pageNo-1,type:"image",kind:"text",label:v,x:d.x,y:d.y-E.height/2,w:E.width,h:E.height,pngBytes:E.bytes,dataUrl:E.dataUrl}),T(e,""),A(e);return}if(r.mode==="IMAGE"){if(!r.pending){T(e,"Choose an image first, then click on the page.","error");return}const v=Number(e.querySelector("#ed-img-w")?.value)||140,f=v*r.pending.ratio;r.edits.push({id:B(),pageIndex:r.pageNo-1,type:"image",kind:"image",label:"Image",x:d.x-v/2,y:d.y-f/2,w:v,h:f,pngBytes:r.pending.pngBytes,dataUrl:r.pending.dataUrl}),T(e,""),A(e)}},a.onpointermove=p=>{if(!u||!m)return;const d=y(p),v=Math.min(d.x,u.x),f=Math.min(d.y,u.y);Object.assign(m.style,{left:`${v*r.scale}px`,top:`${f*r.scale}px`,width:`${Math.abs(d.x-u.x)*r.scale}px`,height:`${Math.abs(d.y-u.y)*r.scale}px`})},a.onpointerup=p=>{if(!u)return;const d=y(p),v=Math.abs(d.x-u.x),f=Math.abs(d.y-u.y);v>3&&f>3&&r.edits.push({id:B(),pageIndex:r.pageNo-1,type:"rect",kind:"whiteout",label:"White-out",color:"#FFFFFF",x:Math.min(d.x,u.x),y:Math.min(d.y,u.y),w:v,h:f}),u=null,m=null,A(e)}}function Ge(e){const o=e.querySelector("#ed-layer"),l=e.querySelector("#ed-list");if(!o||!r)return;const a=r.scale,s=r.edits.filter(t=>t.pageIndex===r.pageNo-1);o.innerHTML=s.map(t=>`<div class="pdf-edit-item ${t.kind==="whiteout"?"whiteout":""}" data-ed-id="${t.id}" style="left:${t.x*a}px; top:${t.y*a}px; width:${t.w*a}px; height:${t.h*a}px;">${t.dataUrl?`<img src="${t.dataUrl}" alt="" draggable="false">`:""}<button class="pdf-edit-del" data-ed-del="${t.id}" title="Remove">✕</button></div>`).join(""),o.querySelectorAll("[data-ed-del]").forEach(t=>t.addEventListener("pointerdown",i=>{i.stopPropagation(),r.edits=r.edits.filter(n=>n.id!==t.getAttribute("data-ed-del")),A(e)})),o.querySelectorAll("[data-ed-id]").forEach(t=>{t.addEventListener("pointerdown",i=>{if(i.target.closest("[data-ed-del]"))return;i.stopPropagation();const n=r.edits.find(u=>u.id===t.getAttribute("data-ed-id")),b={cx:i.clientX,cy:i.clientY,x:n.x,y:n.y};t.setPointerCapture(i.pointerId),t.onpointermove=u=>{n.x=Math.max(0,Math.min(r.pageW-n.w,b.x+(u.clientX-b.cx)/a)),n.y=Math.max(0,Math.min(r.pageH-n.h,b.y+(u.clientY-b.cy)/a)),t.style.left=`${n.x*a}px`,t.style.top=`${n.y*a}px`},t.onpointerup=()=>{t.onpointermove=null,t.onpointerup=null}})}),l&&(l.innerHTML=r.edits.length?`<div class="form-hint" style="margin-top:8px;">${r.edits.length} change(s) on ${new Set(r.edits.map(t=>t.pageIndex)).size} page(s). Click ✕ on an item to remove it.</div>`:"")}const _e={photo50:{mode:"MAX_SIDE",max:600,format:"image/jpeg",kb:50},photo20:{mode:"MAX_SIDE",max:400,format:"image/jpeg",kb:20},sign20:{mode:"MAX_SIDE",max:600,format:"image/jpeg",kb:20},pan:{mode:"PIXELS",w:213,h:213,aspect:"STRETCH",format:"image/jpeg",kb:30},doc200:{mode:"MAX_SIDE",max:1800,format:"image/jpeg",kb:200},doc500:{mode:"MAX_SIDE",max:2400,format:"image/jpeg",kb:500}};function ze(e){const o=a=>e.querySelector(a),l=()=>{const a=o("#ib-mode").value;o("#ib-percent-wrap").style.display=a==="PERCENT"?"":"none",o("#ib-w-wrap").style.display=a==="PIXELS"?"":"none",o("#ib-h-wrap").style.display=a==="PIXELS"?"":"none",o("#ib-aspect-wrap").style.display=a==="PIXELS"?"":"none",o("#ib-max-wrap").style.display=a==="MAX_SIDE"?"":"none"};o("#ib-mode").addEventListener("change",l),o("#ib-preset").addEventListener("change",()=>{const a=_e[o("#ib-preset").value];a&&(o("#ib-mode").value=a.mode,a.max&&(o("#ib-max").value=a.max),a.w&&(o("#ib-w").value=a.w),a.h&&(o("#ib-h").value=a.h),o("#ib-aspect").value=a.aspect||"KEEP",o("#ib-format").value=a.format,o("#ib-kb").value=a.kb||"",l())}),l()}async function je(e,o){const l=u=>e.querySelector(u),a=l("#ib-mode").value,s=l("#ib-format").value,t=Number(l("#ib-kb").value)||0,i=Number(l("#ib-quality").value)||.85,n=[];let b=0;for(const u of c){o(`Processing ${++b} / ${c.length}: ${u.name}`);const m=await W(u.file),{width:y,height:p}=Pe(m),d=a==="NONE"?{width:y,height:p}:Te(y,p,{mode:a,percent:l("#ib-percent").value,width:l("#ib-w").value,height:l("#ib-h").value,keepAspect:l("#ib-aspect").value!=="STRETCH",maxSide:l("#ib-max").value}),v=s==="SAME"?X[u.type]?u.type:"image/jpeg":s,f=k(m,d.width,d.height,v==="image/jpeg"?"#FFFFFF":null);let E,z="";if(t){const R=await V(f,t,v);E=R.blob,R.width!==f.width&&(z=` · reduced to ${R.width}×${R.height} px to fit ${t} KB`),E.size>t*1024&&(z+=" · could not reach the size limit")}else E=await H(f,v,i);n.push({name:ae(u.name,X[v]),blob:E,info:`${y}×${p} → ${f.width}×${f.height} px · ${F(u.size)} → ${F(E.size)}${z}`})}x(e,n)}function N(e){const o=e.querySelector("#imgedit-area");if(!o||!g)return;const l=g.current;o.innerHTML=`
    <div class="grid-sidebar-right" style="align-items:start;">
      <div>
        <div class="img-edit-stage" id="ie-stage"><canvas id="ie-canvas"></canvas><div class="img-crop-box" id="ie-crop" hidden></div></div>
        <p class="form-hint">Drag on the image to select an area to crop. Current size: ${l.width} × ${l.height} px</p>
      </div>
      <div>
        <div class="form-label">Rotate & Flip</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
          <button class="btn btn-sm btn-outline" data-ie="rotl">⟲ Left</button>
          <button class="btn btn-sm btn-outline" data-ie="rotr">⟳ Right</button>
          <button class="btn btn-sm btn-outline" data-ie="fliph">⇋ Flip</button>
          <button class="btn btn-sm btn-outline" data-ie="flipv">⇵ Flip</button>
        </div>
        <div style="display:flex; gap:6px; margin-bottom:12px;">
          <button class="btn btn-sm btn-teal" id="ie-crop-apply" disabled>Crop to Selection</button>
        </div>
        <div class="form-group"><label class="form-label">Brightness</label><input type="range" id="ie-bright" min="-60" max="60" value="0"></div>
        <div class="form-group"><label class="form-label">Contrast</label><input type="range" id="ie-contrast" min="-60" max="80" value="0"></div>
        <div class="form-group">
          <label class="form-label">Effect</label>
          <select class="form-control" id="ie-effect">
            <option value="NONE">None</option>
            <option value="GRAYSCALE">Grayscale</option>
            <option value="BW_SCAN">Black & white document scan</option>
            <option value="SEPIA">Sepia</option>
          </select>
        </div>
        <div class="form-group" id="ie-thr-wrap" style="display:none;"><label class="form-label">B&W Threshold</label><input type="range" id="ie-thr" min="60" max="230" value="160"></div>
        <button class="btn btn-sm btn-teal" id="ie-adjust-apply" style="margin-bottom:14px;">Apply Adjustments</button>
        <div class="grid-2" style="gap:8px;">
          <div class="form-group"><label class="form-label">Save As</label><select class="form-control" id="ie-fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select></div>
          <div class="form-group"><label class="form-label">Max Size (KB)</label><input type="number" class="form-control" id="ie-kb" min="1" placeholder="No limit"></div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-outline" id="ie-reset">Reset</button>
          <button class="btn btn-primary" id="ie-save">Download Image</button>
        </div>
      </div>
    </div>`;const a=o.querySelector("#ie-canvas"),s=o.querySelector("#ie-stage"),t=Math.min(720,s.clientWidth||720),i=Math.min(1,t/l.width,520/l.height);a.width=l.width,a.height=l.height,a.getContext("2d").drawImage(l,0,0),a.style.width=`${l.width*i}px`,a.style.height=`${l.height*i}px`,s.style.width=a.style.width,s.style.height=a.style.height;const n=()=>{const p=document.createElement("canvas");p.width=l.width,p.height=l.height,p.getContext("2d").drawImage(l,0,0),U(p,J(o)),a.getContext("2d").drawImage(p,0,0)};["#ie-bright","#ie-contrast","#ie-thr"].forEach(p=>o.querySelector(p).addEventListener("input",n)),o.querySelector("#ie-effect").addEventListener("change",()=>{o.querySelector("#ie-thr-wrap").style.display=o.querySelector("#ie-effect").value==="BW_SCAN"?"":"none",n()}),o.querySelectorAll("[data-ie]").forEach(p=>p.addEventListener("click",()=>{const d=p.getAttribute("data-ie");d==="rotl"&&(g.current=Q(g.current,270)),d==="rotr"&&(g.current=Q(g.current,90)),d==="fliph"&&(g.current=ee(g.current,!0)),d==="flipv"&&(g.current=ee(g.current,!1)),g.crop=null,N(e)})),o.querySelector("#ie-adjust-apply").addEventListener("click",()=>{const p=k(g.current);U(p,J(o)),g.current=p,N(e)}),o.querySelector("#ie-reset").addEventListener("click",()=>{g.current=k(g.original),g.crop=null,N(e)});const b=o.querySelector("#ie-crop"),u=o.querySelector("#ie-crop-apply");let m=null;const y=p=>{const d=a.getBoundingClientRect();return{x:Math.max(0,Math.min(d.width,p.clientX-d.left)),y:Math.max(0,Math.min(d.height,p.clientY-d.top))}};s.onpointerdown=p=>{m=y(p),s.setPointerCapture(p.pointerId),b.hidden=!1,Object.assign(b.style,{left:`${m.x}px`,top:`${m.y}px`,width:"0px",height:"0px"})},s.onpointermove=p=>{if(!m)return;const d=y(p);Object.assign(b.style,{left:`${Math.min(d.x,m.x)}px`,top:`${Math.min(d.y,m.y)}px`,width:`${Math.abs(d.x-m.x)}px`,height:`${Math.abs(d.y-m.y)}px`})},s.onpointerup=p=>{if(!m)return;const d=y(p),v=Math.abs(d.x-m.x),f=Math.abs(d.y-m.y);v>4&&f>4?(g.crop={x:Math.min(d.x,m.x)/i,y:Math.min(d.y,m.y)/i,w:v/i,h:f/i},u.disabled=!1):(b.hidden=!0,g.crop=null,u.disabled=!0),m=null},u.addEventListener("click",()=>{g.crop&&(g.current=Me(g.current,g.crop),g.crop=null,N(e))}),o.querySelector("#ie-save").addEventListener("click",()=>I(e,async()=>{const p=o.querySelector("#ie-fmt").value,d=Number(o.querySelector("#ie-kb").value)||0,v=k(g.current,null,null,p==="image/jpeg"?"#FFFFFF":null);U(v,J(o));const f=d?await V(v,d,p):{blob:await H(v,p,.92),width:v.width,height:v.height};x(e,[{name:ae(c[0].name.replace(/\.[^.]+$/,"")+"_edited",X[p]),blob:f.blob,info:`${f.width}×${f.height} px`}])}))}function J(e){return{brightness:Number(e.querySelector("#ie-bright")?.value||0),contrast:Number(e.querySelector("#ie-contrast")?.value||0),effect:e.querySelector("#ie-effect")?.value||"NONE",threshold:Number(e.querySelector("#ie-thr")?.value||160)}}export{ke as renderToolsModule};
