import{esc as h,downloadFile as Y,todayISO as Z}from"../core/utils.js";import{buildZip as Ee}from"../core/zip.js";import{insertBlankPages as Pe,insertPdf as Te,duplicatePages as ke,cropPages as Me,changePageSize as Ae,PAGE_SIZES_MM as ce,addHeaderFooter as Fe,addStamp as Ce,STAMPS as Ie,readMetadata as De,writeMetadata as qe,removeMetadata as Le,listFormFields as Oe,fillForm as Ne,flattenPdf as Re,protectPdf as Ge,redactPdf as Be,replaceTextNative as He,hasDigitalSignature as _e,addTextNotes as ze,searchPdfText as je}from"../core/pdfextra.js";import{inspectFile as pe}from"../core/fileintake.js";import{readFileBytes as We,openPdfJs as ue,renderPage as me,pageThumbnails as Ue,parseRanges as Q,mergeDocuments as Xe,splitPdf as Ke,organizePdf as Ve,compressPdf as Je,rasterizePdf as Ye,pdfToImages as Ze,extractTextLayout as Qe,pagesToPlainText as et,pdfToDocx as tt,pdfToXlsx as at,imagesToPdf as ot,applyEdits as lt,addPageNumbers as it,addWatermark as st,getPageCount as X,closePdf as ee}from"../core/pdftools.js";import{loadImageFromFile as nt,imageSize as rt,toCanvas as N,targetDimensions as dt,canvasToBlob as z,compressToTarget as be,rotateCanvas as ge,flipCanvas as fe,cropCanvas as ct,adjustCanvas as te,textToPng as ve,formatBytes as q,replaceExt as he,IMAGE_FORMATS as ae,loadAnyImage as ye,gifFrames as pt}from"../core/imagetools.js";const we=[["MERGE","","Merge PDF"],["SPLIT","","Split / Extract Pages"],["ORGANIZE","","Organise Pages"],["COMPRESS","","Compress PDF"],["EDIT","","Edit PDF"],["STAMP","","Watermark & Page Numbers"],["TO_WORD","","PDF to Word"],["TO_EXCEL","","PDF to Excel"],["TO_IMAGES","","PDF to Images / Text"],["FROM_IMAGES","","Images to PDF"],["PAGES","","Add, Duplicate & Crop Pages"],["LABELS","","Headers, Footers & Stamps"],["FORMS","","Fill & Flatten Forms"],["META","","Properties & Metadata"],["PROTECT","","Password-protect PDF"],["UNLOCK","","Unlock PDF"],["REDACT","","Redact (secure)"]],xe=[["IMG_BATCH","","Resize, Compress & Convert"],["IMG_EDIT","","Crop, Rotate & Enhance"],["IMG_GIF","","GIF Frames"]];let w="MERGE",b=[],R=!1,H=null,T=[],n=null,y=null;const L=()=>Math.random().toString(36).slice(2,10),oe=()=>Z(),P=e=>String(e||"document").replace(/\.[^.]+$/,"");function K(){b=[],H=null,T=[],n?.pdf&&ee(n.pdf),n=null,y=null}let O={embedded:!1,group:null},le=null,$e=!1;function Lt(e){[...we,...xe].some(([o])=>o===e)&&!R&&(w=e,K())}async function ut(e,o,s=O){O={embedded:!!s.embedded,group:s.group||null},O.group==="PDF"&&w.startsWith("IMG_")&&(w="MERGE",K()),O.group==="IMAGE"&&!w.startsWith("IMG_")&&(w="IMG_BATCH",K());const t=w.startsWith("IMG_"),i=O.group!=="IMAGE",a=O.group!=="PDF";e.innerHTML=`
    ${O.embedded?"":`<div class="module-header">
      <div class="module-title-group">
        <h1>PDF & Image Tools</h1>
        <p>Merge, split, compress, edit and convert PDFs; resize and compress photos for portals — all offline on this computer</p>
      </div>
    </div>
    <div class="callout success">
      <div><strong>Private by design:</strong> Files are processed inside this browser and are never uploaded. Close the tab or switch tools to clear them from memory.</div>
    </div>`}

    <div class="tools-nav">
      ${i?`<div class="tools-nav-group">
        <div class="tools-nav-label">PDF Tools</div>
        <div class="pill-tabs">${we.map(([l,r,d])=>`<button class="pill-tab ${w===l?"active":""}" data-tool="${l}">${h(d)}</button>`).join("")}</div>
      </div>`:""}
      ${a?`<div class="tools-nav-group">
        <div class="tools-nav-label">Image Tools</div>
        <div class="pill-tabs">${xe.map(([l,r,d])=>`<button class="pill-tab ${w===l?"active":""}" data-tool="${l}">${h(d)}</button>`).join("")}</div>
      </div>`:""}
    </div>

    <div class="card" id="tool-card">${mt()}</div>
    <div id="tool-status"></div>
    <div id="tool-results"></div>
  `,e.querySelectorAll("[data-tool]").forEach(l=>l.addEventListener("click",()=>{R||(w=l.getAttribute("data-tool"),K(),ut(e,o,O))})),bt(e,t),le=e,$e||($e=!0,document.addEventListener("keydown",l=>{if(!((l.ctrlKey||l.metaKey)&&l.key==="Enter")||!le?.isConnected)return;const r=le.querySelector("#tool-run");r&&!r.disabled&&r.offsetParent&&(l.preventDefault(),r.click())}))}function E({accept:e,multiple:o,hint:s}){return`
    <div class="tool-dropzone" id="tool-drop">
      <input type="file" id="tool-file" ${o?"multiple":""} accept="${e}">
      <div class="tool-dropzone-text"><strong>Choose ${o?"files":"a file"}</strong> or drag and drop here</div>
      <div class="form-hint">${h(s)}</div>
    </div>
    <div id="tool-file-list"></div>`}function V(){return`
    <div class="form-group">
      <label class="form-label">PDF Password (only if the PDF is protected)</label>
      <input type="password" class="form-control" id="tool-pdf-pass" autocomplete="off" placeholder="Leave blank if not protected">
    </div>`}function mt(){switch(w){case"MERGE":return`
        <div class="card-header"><div class="card-title">Merge PDF</div></div>
        <p class="form-hint">Combine several PDFs (and JPG/PNG images) into one PDF. Use the arrows to set the order.</p>
        ${E({accept:".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*",multiple:!0,hint:"PDF, JPG, PNG or WEBP"})}
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Merge & Download</button></div>`;case"SPLIT":return`
        <div class="card-header"><div class="card-title">Split / Extract Pages</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
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
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div id="organize-grid" class="tool-thumb-grid"></div>
        <div class="tool-actions">
          <button class="btn btn-outline" id="org-reset" disabled>Reset</button>
          <button class="btn btn-primary" id="tool-run" disabled>Save Organised PDF</button>
        </div>`;case"COMPRESS":return`
        <div class="card-header"><div class="card-title">Compress PDF</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!0,hint:"One or more PDFs"})}
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
          ${V()}
        </div>
        <p class="form-hint">Medium, Strong and Extreme turn each page into an image, so text can no longer be selected or copied.</p>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Compress & Download</button></div>`;case"EDIT":return`
        <div class="card-header"><div class="card-title">Edit PDF</div></div>
        <p class="form-hint">Change existing text (when the PDF allows it), add text boxes in any language, signature or photo images, shapes, highlights and comments. Click on the page to place items; drag to move them. The original file is never changed — you save a new copy.</p>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div id="editor-area"></div>`;case"STAMP":return`
        <div class="card-header"><div class="card-title">Watermark & Page Numbers</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div class="grid-2" style="gap:14px;">
          <div>
            <label style="display:flex; gap:8px; align-items:center; font-weight:600; margin-bottom:8px;"><input type="checkbox" id="wm-on" checked> Add Watermark</label>
            <div class="form-group"><label class="form-label">Watermark Text</label><input type="text" class="form-control" id="wm-text" value="COPY"></div>
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
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        ${V()}
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Convert to Word</button></div>`;case"TO_EXCEL":return`
        <div class="card-header"><div class="card-title">PDF to Excel (.xlsx)</div></div>
        <p class="form-hint">Turns tables in the PDF (statements, fee lists, reports) into spreadsheet rows and columns — one sheet per page. Amounts become numbers you can add up.</p>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        ${V()}
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Convert to Excel</button></div>
        <div id="excel-preview"></div>`;case"TO_IMAGES":return`
        <div class="card-header"><div class="card-title">PDF to Images / Text</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div class="grid-3" style="gap:10px;">
          <div class="form-group">
            <label class="form-label">Image Format</label>
            <select class="form-control" id="img-fmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>
          </div>
          <div class="form-group">
            <label class="form-label">Pages (blank = all)</label>
            <input type="text" class="form-control" id="img-pages" placeholder="e.g. 1-3, 5">
          </div>
          <div class="form-group">
            <label class="form-label">Quality (DPI)</label>
            <select class="form-control" id="img-dpi"><option value="100">100 — screen</option><option value="150" selected>150 — standard</option><option value="200">200 — sharp</option><option value="300">300 — print</option></select>
          </div>
          ${V()}
        </div>
        <div class="tool-actions">
          <button class="btn btn-primary" id="tool-run" disabled>Convert to Images</button>
          <button class="btn btn-outline" id="tool-run-text" disabled>Extract Text (.txt)</button>
        </div>`;case"FROM_IMAGES":return`
        <div class="card-header"><div class="card-title">Images to PDF</div></div>
        ${E({accept:".jpg,.jpeg,.png,.webp,image/*",multiple:!0,hint:"JPG, PNG or WEBP — use the arrows to set page order"})}
        <div class="grid-3" style="gap:10px;">
          <div class="form-group"><label class="form-label">Page Size</label><select class="form-control" id="i2p-size"><option value="A4">A4</option><option value="FIT">Same as image</option></select></div>
          <div class="form-group"><label class="form-label">Orientation</label><select class="form-control" id="i2p-orient"><option value="AUTO">Automatic</option><option value="PORTRAIT">Portrait</option><option value="LANDSCAPE">Landscape</option></select></div>
          <div class="form-group"><label class="form-label">Margin</label><select class="form-control" id="i2p-margin"><option value="0">None</option><option value="18" selected>Small</option><option value="40">Large</option></select></div>
        </div>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Create PDF</button></div>`;case"UNLOCK":return`
        <div class="card-header"><div class="card-title">Unlock PDF</div></div>
        <div class="callout warning"><div>Use only for PDFs you are allowed to open, with the owner's consent (for example a customer's own e-Aadhaar). The password is never stored.</div></div>
        <p class="form-hint">e-Aadhaar password: first 4 letters of the name in CAPITALS + year of birth (e.g. RAJE1985).</p>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One password-protected PDF"})}
        <div class="form-group">
          <label class="form-label">PDF Password</label>
          <input type="password" class="form-control" id="tool-pdf-pass" autocomplete="off" placeholder="Enter the PDF password">
        </div>
        <p class="form-hint">The unlocked copy is rebuilt from page images (200 dpi), so it prints exactly like the original.</p>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Unlock & Download</button></div>`;case"IMG_BATCH":return`
        <div class="card-header"><div class="card-title">Resize, Compress & Convert Images</div></div>
        <p class="form-hint">General resizing. For exam and government portal photos and signatures (presets, name/date, checks) use the <strong>Photo & Signature</strong> workspace.</p>
        ${E({accept:".jpg,.jpeg,.png,.webp,image/*",multiple:!0,hint:"One or more images"})}
        <div class="form-group">
          <label class="form-label">Quick Preset</label>
          <select class="form-control" id="ib-preset">
            <option value="">— Choose a preset (optional) —</option>
            <option value="photo50">Passport photo — max 50 KB, JPG</option>
            <option value="photo20">Exam photo — max 20 KB, JPG</option>
            <option value="sign20">Signature — max 20 KB, JPG</option>
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
        ${E({accept:".jpg,.jpeg,.png,.webp,.heic,.heif,image/*",multiple:!1,hint:"One image (JPG, PNG, WebP or HEIC)"})}
        <div id="imgedit-area"></div>`;case"IMG_GIF":return`
        <div class="card-header"><div class="card-title">GIF Frames</div></div>
        <p class="form-hint">Saves every frame of an animated GIF as a PNG picture.</p>
        ${E({accept:".gif,image/gif",multiple:!1,hint:"One GIF"})}
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Extract Frames</button></div>`;case"PAGES":return`
        <div class="card-header"><div class="card-title">Add, Duplicate & Crop Pages</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div class="grid-3" style="gap:10px;">
          <div class="form-group"><label class="form-label">What to do</label>
            <select class="form-control" id="pg-op">
              <option value="BLANK">Add blank page(s)</option>
              <option value="INSERT">Insert pages from another PDF</option>
              <option value="DUP">Duplicate page(s)</option>
              <option value="CROP">Crop margins</option>
              <option value="SIZE">Change page size</option>
            </select></div>
          <div class="form-group" data-pg="BLANK INSERT"><label class="form-label">After page (0 = at the start)</label><input type="number" class="form-control" id="pg-after" min="0" value="1"></div>
          <div class="form-group" data-pg="BLANK"><label class="form-label">How many</label><input type="number" class="form-control" id="pg-count" min="1" max="50" value="1"></div>
          <div class="form-group" data-pg="INSERT"><label class="form-label">PDF to insert</label><input type="file" class="form-control" id="pg-other" accept=".pdf,application/pdf"></div>
          <div class="form-group" data-pg="DUP CROP"><label class="form-label">Pages (blank = all for crop)</label><input type="text" class="form-control" id="pg-pages" placeholder="e.g. 1, 3-4"></div>
          <div class="form-group" data-pg="CROP"><label class="form-label">Crop top / right / bottom / left (mm)</label><input type="text" class="form-control" id="pg-crop" value="10, 10, 10, 10"></div>
          <div class="form-group" data-pg="SIZE"><label class="form-label">New size</label><select class="form-control" id="pg-size">${Object.keys(ce).map(e=>`<option>${e}</option>`).join("")}</select></div>
          <div class="form-group" data-pg="SIZE"><label class="form-label">Orientation</label><select class="form-control" id="pg-orient"><option value="AUTO">Automatic</option><option value="PORTRAIT">Portrait</option><option value="LANDSCAPE">Landscape</option></select></div>
        </div>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Apply & Download</button></div>`;case"LABELS":return`
        <div class="card-header"><div class="card-title">Headers, Footers & Stamps</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!0,hint:"One or more PDFs"})}
        <div class="grid-2" style="gap:14px;">
          <div>
            <div class="form-group"><label class="form-label">Header (any language; {n} page, {total} pages, {date})</label><input class="form-control" id="lb-header" placeholder="e.g. Akshaya Centre Aluva"></div>
            <div class="form-group"><label class="form-label">Footer</label><input class="form-control" id="lb-footer" placeholder="e.g. Page {n} of {total}"></div>
            <div class="grid-2" style="gap:8px;"><div class="form-group"><label class="form-label">Align</label><select class="form-control" id="lb-align"><option value="center">Centre</option><option value="left">Left</option><option value="right">Right</option></select></div><div class="form-group"><label class="form-label">Size (pt)</label><input type="number" class="form-control" id="lb-size" min="6" max="24" value="9"></div></div>
          </div>
          <div>
            <div class="form-group"><label class="form-label">Stamp</label><select class="form-control" id="lb-stamp"><option value="">— No stamp —</option>${Object.keys(Ie).map(e=>`<option>${e}</option>`).join("")}<option value="CUSTOM">Custom text…</option></select></div>
            <div class="form-group"><label class="form-label">Custom stamp text</label><input class="form-control" id="lb-stamp-text" placeholder="e.g. VERIFIED BY VLE"></div>
            <div class="form-group"><label class="form-label">Second line (date / label)</label><input class="form-control" id="lb-sub" placeholder="e.g. ${Z()}"></div>
            <div class="grid-2" style="gap:8px;"><div class="form-group"><label class="form-label">Position</label><select class="form-control" id="lb-pos"><option value="TOP_RIGHT">Top right</option><option value="TOP_LEFT">Top left</option><option value="CENTER">Centre</option><option value="BOTTOM_RIGHT">Bottom right</option><option value="BOTTOM_LEFT">Bottom left</option></select></div><div class="form-group"><label class="form-label">On pages</label><input class="form-control" id="lb-pages" placeholder="blank = all"></div></div>
          </div>
        </div>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Apply & Download</button></div>`;case"FORMS":return`
        <div class="card-header"><div class="card-title">Fill & Flatten Forms</div></div>
        <p class="form-hint">Fill the boxes of a fillable PDF form, then optionally flatten it so the answers become part of the page. XFA (dynamic) forms are not supported.</p>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One fillable PDF"})}
        <div id="form-fields"></div>
        <label style="display:flex;gap:8px;align-items:center;margin:8px 0;"><input type="checkbox" id="form-flatten"> Flatten (answers can no longer be changed)</label>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Save Filled PDF</button></div>`;case"META":return`
        <div class="card-header"><div class="card-title">Properties & Metadata</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div id="meta-area"></div>
        <div class="tool-actions"><button class="btn btn-outline" id="tool-run-text" disabled>Remove All Metadata</button><button class="btn btn-primary" id="tool-run" disabled>Save Properties</button></div>`;case"PROTECT":return`
        <div class="card-header"><div class="card-title">Password-protect PDF (AES-256)</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!0,hint:"One or more PDFs"})}
        <div class="grid-2" style="gap:10px;">
          <div class="form-group"><label class="form-label">Password to open</label><input type="password" class="form-control" id="pr-user" autocomplete="new-password"></div>
          <div class="form-group"><label class="form-label">Repeat password</label><input type="password" class="form-control" id="pr-user2" autocomplete="new-password"></div>
          <div class="form-group"><label class="form-label">Owner password (optional, for changing permissions)</label><input type="password" class="form-control" id="pr-owner" autocomplete="new-password"></div>
          <div class="form-group"><label class="form-label">Allow</label>
            <div class="studio-toolrow"><label><input type="checkbox" id="pr-print" checked> Printing</label><label><input type="checkbox" id="pr-copy"> Copying text</label><label><input type="checkbox" id="pr-mod"> Editing</label><label><input type="checkbox" id="pr-fill" checked> Filling forms</label></div></div>
        </div>
        <p class="form-hint">Uses AES-256 (the PDF 2.0 standard), which Adobe Reader, Chrome, Edge and phones open. VLEBook never stores the password — keep it safe; a lost password cannot be recovered.</p>
        <div class="tool-actions"><button class="btn btn-primary" id="tool-run" disabled>Protect & Download</button></div>`;case"REDACT":return`
        <div class="card-header"><div class="card-title">Redact (secure)</div></div>
        <div class="callout warning"><div>Redaction is permanent in the new file. Each page you mark is rebuilt as a picture with the marked areas painted over, so the hidden words cannot be copied, searched or recovered. Text elsewhere on those pages also stops being selectable. Other pages are unchanged. The original file stays as it is.</div></div>
        ${E({accept:".pdf,application/pdf",multiple:!1,hint:"One PDF"})}
        <div id="editor-area"></div>`;default:return""}}function bt(e,o){const s=e.querySelector("#tool-file"),t=e.querySelector("#tool-drop"),i=s?.hasAttribute("multiple"),a=async l=>{const r=Array.from(l||[]);if(!r.length)return;i||(b=[]);const d=[];for(const c of r){const p=await pe(c,o?["image","heic"]:["pdf","image","heic"]);if(!p.ok){d.push(`${c.name}: ${p.error}`);continue}if(b.push({id:L(),name:p.name,type:p.mime,kind:p.kind,size:c.size,file:c,bytes:p.bytes}),!i)break}G(e),b.length&&await ie(e),d.length&&A(e,d.map(h).join("<br>"),"error")};if(s?.addEventListener("change",()=>a(s.files)),t&&(["dragenter","dragover"].forEach(l=>t.addEventListener(l,r=>{r.preventDefault(),t.classList.add("dragging")})),["dragleave","drop"].forEach(l=>t.addEventListener(l,r=>{r.preventDefault(),t.classList.remove("dragging")})),t.addEventListener("drop",l=>a(l.dataTransfer?.files))),G(e),e.querySelector("#tool-run")?.addEventListener("click",()=>F(e,()=>ht(e))),w==="TO_IMAGES"&&e.querySelector("#tool-run-text")?.addEventListener("click",()=>F(e,()=>yt(e))),e.querySelector("#org-reset")?.addEventListener("click",()=>{T=T.map((l,r)=>({index:r,rotate:0,deleted:!1})).sort((l,r)=>l.index-r.index),J(e)}),w==="IMG_BATCH"&&Pt(e),w==="PAGES"){const l=()=>{const r=e.querySelector("#pg-op").value;e.querySelectorAll("[data-pg]").forEach(d=>d.style.display=d.dataset.pg.split(" ").includes(r)?"":"none")};e.querySelector("#pg-op").addEventListener("change",l),l()}e.querySelector("#tool-run-text")&&w==="META"&&e.querySelector("#tool-run-text").addEventListener("click",()=>F(e,async()=>{const l=await Le(await x(b[0]));$(e,[{name:`${P(b[0].name)}_clean.pdf`,blob:M(l),info:"Title, author, dates and XMP metadata removed"}])}))}function Ot(e){return/\.pdf$/i.test(e)?"application/pdf":/\.png$/i.test(e)?"image/png":/\.webp$/i.test(e)?"image/webp":/\.jpe?g$/i.test(e)?"image/jpeg":""}async function x(e){return e.bytes||(e.bytes=await We(e.file)),e.bytes}function G(e){const o=e.querySelector("#tool-file-list"),s=e.querySelector("#tool-run"),t=e.querySelector("#tool-run-text");if(s&&(s.disabled=b.length===0||R),t&&(t.disabled=b.length===0||R),!o)return;if(!b.length){o.innerHTML="";return}const i=b.length>1;o.innerHTML=`
    ${i?'<div style="text-align:right;margin:4px 0;"><button class="btn btn-xs btn-outline" id="files-sort">Sort A–Z</button> <button class="btn btn-xs btn-outline" id="files-clear">Clear</button></div>':""}
    <table class="data-table tool-file-table">
      <thead><tr><th>#</th><th>File</th><th class="num">Size</th><th></th></tr></thead>
      <tbody>
        ${b.map((a,l)=>`
          <tr>
            <td>${l+1}</td>
            <td data-no-i18n><strong>${h(a.name)}</strong></td>
            <td class="num">${q(a.size)}</td>
            <td style="white-space:nowrap; text-align:right;">
              ${i?`<button class="btn btn-xs btn-outline" data-mv-up="${l}" ${l===0?"disabled":""} title="Move up">↑</button>
              <button class="btn btn-xs btn-outline" data-mv-down="${l}" ${l===b.length-1?"disabled":""} title="Move down">↓</button>`:""}
              <button class="btn btn-xs btn-danger" data-rm="${l}" title="Remove">✕</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`,o.querySelector("#files-sort")?.addEventListener("click",()=>{b.sort((a,l)=>a.name.localeCompare(l.name,void 0,{numeric:!0,sensitivity:"base"})),G(e)}),o.querySelector("#files-clear")?.addEventListener("click",async()=>{b=[],G(e),await ie(e)}),o.querySelectorAll("[data-mv-up]").forEach(a=>a.addEventListener("click",()=>{const l=Number(a.getAttribute("data-mv-up"));[b[l-1],b[l]]=[b[l],b[l-1]],G(e)})),o.querySelectorAll("[data-mv-down]").forEach(a=>a.addEventListener("click",()=>{const l=Number(a.getAttribute("data-mv-down"));[b[l+1],b[l]]=[b[l],b[l+1]],G(e)})),o.querySelectorAll("[data-rm]").forEach(a=>a.addEventListener("click",async()=>{b.splice(Number(a.getAttribute("data-rm")),1),G(e),await ie(e)}))}async function ie(e){if(gt(e),w==="SPLIT"&&b[0]&&await F(e,async()=>{const o=await X(await x(b[0]));b[0].pageCount=o;const s=e.querySelector("#split-pagecount");s&&(s.textContent=`This PDF has ${o} pages.`);const t=e.querySelector("#split-ranges");t&&!t.value&&(t.value=o>1?`1-${Math.min(o,2)}`:"1")},{quiet:!0}),w==="ORGANIZE"&&(H=null,T=[],J(e),b[0]&&await F(e,async o=>{H=await Ue(await x(b[0]),130,"",(s,t)=>o(`Loading page previews… ${s} / ${t}`)),T=H.map((s,t)=>({index:t,rotate:0,deleted:!1})),J(e)})),w==="FORMS"){const o=e.querySelector("#form-fields");o&&(o.innerHTML=""),b[0]&&await F(e,async()=>{const s=await Oe(await x(b[0]));b[0].fields=s,o.innerHTML=s.length?`<table class="data-table compact"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>${s.map((t,i)=>{const a=h(t.name);let l="";return t.type==="TextField"?l=`<input class="form-control" data-ff="${i}" value="${h(t.value||"")}" ${t.readOnly?"disabled":""}>`:t.type==="CheckBox"?l=`<input type="checkbox" data-ff="${i}" ${t.value?"checked":""}>`:t.options?l=`<select class="form-control" data-ff="${i}"><option value=""></option>${t.options.map(r=>`<option ${r===t.value?"selected":""}>${h(r)}</option>`).join("")}</select>`:l=`<small>${h(t.type)} (not editable here)</small>`,`<tr><td data-no-i18n>${a}</td><td>${l}</td></tr>`}).join("")}</tbody></table>`:'<div class="callout warning"><div>This PDF has no fillable fields. Use Edit PDF to place text on it instead.</div></div>'})}if(w==="META"){const o=e.querySelector("#meta-area");o&&(o.innerHTML=""),b[0]&&await F(e,async()=>{const s=await De(await x(b[0])),t=(a,l)=>`<div class="form-group"><label class="form-label">${l}</label><input class="form-control" data-meta="${a}" value="${h(s[a]||"")}"></div>`;o.innerHTML=`<div class="grid-3" style="gap:10px;">${t("title","Title")}${t("author","Author")}${t("subject","Subject")}${t("keywords","Keywords (comma separated)")}${t("creator","Created with")}${t("producer","Producer")}</div>
          <table class="data-table compact"><tbody><tr><td>Pages</td><td>${s.pages}</td></tr><tr><td>First page size</td><td>${s.firstPageMm[0]} × ${s.firstPageMm[1]} mm</td></tr><tr><td>Created</td><td>${h(s.created||"—")}</td></tr><tr><td>Modified</td><td>${h(s.modified||"—")}</td></tr><tr><td>XMP metadata</td><td>${s.hasXmp?"Yes":"No"}</td></tr><tr><td>Form fields</td><td>${s.hasForm?"Yes":"No"}</td></tr><tr><td>File size</td><td>${q(b[0].size)}</td></tr></tbody></table>`;const i=e.querySelector("#tool-run-text");i&&(i.disabled=!1)})}if(w==="EDIT"||w==="REDACT"){n?.pdf&&await ee(n.pdf),n=null;const o=e.querySelector("#editor-area");o&&(o.innerHTML=""),b[0]&&await F(e,async()=>{const s=await ue(await x(b[0]));n={pdf:s,pageNo:1,pageCount:s.numPages,scale:1,zoom:1,edits:[],undo:[],redo:[],mode:w==="REDACT"?"REDACT":"TEXT",pending:null,signed:await _e(await x(b[0])),textItems:[]},k(e),e.querySelector(".pdf-editor-toolbar")?.scrollIntoView({behavior:"smooth",block:"start"})})}if(w==="IMG_EDIT"){y=null;const o=e.querySelector("#imgedit-area");o&&(o.innerHTML=""),b[0]&&await F(e,async()=>{const s=await ye(b[0].file,b[0].kind),t=N(s);y={original:t,current:N(t),crop:null,rotation:0},j(e)})}}function A(e,o,s="info"){const t=e.querySelector("#tool-status");t&&(t.innerHTML=o?`<div class="callout ${s==="error"?"danger":s==="success"?"success":""}" data-kind="${s}"><div>${s==="progress"?'<span class="spinner-dot"></span>':""}${o}</div></div>`:"")}function gt(e){const o=e.querySelector("#tool-results");o&&(o.innerHTML=""),A(e,"")}async function F(e,o,{quiet:s=!1}={}){if(R)return;R=!0,e.querySelectorAll("#tool-run, #tool-run-text, [data-tool]").forEach(i=>i.disabled=!0);const t=i=>A(e,h(i),"progress");s||t("Working…");try{await o(t),!s&&e.querySelector('#tool-status .callout[data-kind="progress"]')&&A(e,"")}catch(i){console.warn(i);const a=i?.code==="PASSWORD";A(e,`${h(i?.message||String(i))}`,"error"),a&&e.querySelector("#tool-pdf-pass")?.focus()}finally{R=!1,e.querySelectorAll("[data-tool]").forEach(i=>i.disabled=!1),ft(e)}}function ft(e){const o=e.querySelector("#tool-run"),s=e.querySelector("#tool-run-text");o&&(o.disabled=b.length===0),s&&(s.disabled=b.length===0)}function $(e,o,s=""){const t=e.querySelector("#tool-results");if(!t)return;const i=o.reduce((a,l)=>a+l.blob.size,0);t.innerHTML=`
    <div class="card">
      <div class="card-header">
        <div class="card-title">Ready — ${o.length} file${o.length===1?"":"s"} (${q(i)})</div>
        ${o.length>1?'<button class="btn btn-sm btn-primary" id="res-zip">Download All (ZIP)</button>':""}
      </div>
      ${s?`<p class="form-hint" style="margin-bottom:10px;">${s}</p>`:""}
      <table class="data-table">
        <thead><tr><th>File</th><th>Details</th><th class="num">Size</th><th></th></tr></thead>
        <tbody>
          ${o.map((a,l)=>`
            <tr>
              <td data-no-i18n><strong>${h(a.name)}</strong></td>
              <td>${a.info||""}</td>
              <td class="num">${q(a.blob.size)}</td>
              <td style="text-align:right;white-space:nowrap;">${a.blob.type==="application/pdf"?`<button class="btn btn-xs btn-outline" data-res-pv="${l}">Preview</button> `:""}<button class="btn btn-xs btn-primary" data-res-dl="${l}">Download</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`,t.querySelectorAll("[data-res-dl]").forEach(a=>a.addEventListener("click",()=>{const l=o[Number(a.getAttribute("data-res-dl"))];Y(l.blob,l.name,l.blob.type)})),t.querySelectorAll("[data-res-pv]").forEach(a=>a.addEventListener("click",()=>vt(o[Number(a.dataset.resPv)]))),t.querySelector("#res-zip")?.addEventListener("click",async()=>{const a=[];for(const l of o)a.push({name:l.name,data:new Uint8Array(await l.blob.arrayBuffer())});Y(new Blob([Ee(a)],{type:"application/zip"}),`VLEBook_Tools_${oe()}.zip`,"application/zip")}),o.length===1&&Y(o[0].blob,o[0].name,o[0].blob.type),A(e,"")}const M=e=>new Blob([e],{type:"application/pdf"});async function vt(e){const o=new Uint8Array(await e.blob.arrayBuffer());let s;try{s=await ue(o)}catch(l){const r=l.code==="PASSWORD",d=document.createElement("div");d.className="modal-backdrop open",d.innerHTML=`<div class="modal" style="max-width:420px"><div class="modal-body">${r?"This file is password protected — open it after downloading to check the password.":h(l.message)}</div><div class="modal-footer"><button class="btn btn-primary">OK</button></div></div>`,document.body.appendChild(d),d.querySelector("button").onclick=()=>d.remove();return}const t=document.createElement("div");t.className="modal-backdrop open tool-preview",t.innerHTML=`<div class="modal" style="max-width:900px;width:95vw"><div class="modal-header"><h3 data-no-i18n>${h(e.name)}</h3></div>
    <div class="modal-body" style="text-align:center;max-height:75vh;overflow:auto;background:#EEF1F5"><canvas id="pv-c" style="box-shadow:0 1px 6px rgba(0,0,0,.25);max-width:100%"></canvas></div>
    <div class="modal-footer"><button class="btn btn-outline" data-pv="prev">◀</button><span id="pv-n"></span><button class="btn btn-outline" data-pv="next">▶</button><button class="btn btn-primary" data-pv="close">Close</button></div></div>`,document.body.appendChild(t);let i=1;const a=async()=>{const r=(await s.getPage(i)).getViewport({scale:1});await me(s,i,Math.min(2,840/r.width)*Math.min(2,window.devicePixelRatio||1),t.querySelector("#pv-c")),t.querySelector("#pv-c").style.width=`${Math.min(840,r.width*2)}px`,t.querySelector("#pv-n").textContent=`Page ${i} / ${s.numPages}`,t.querySelector('[data-pv="prev"]').disabled=i<=1,t.querySelector('[data-pv="next"]').disabled=i>=s.numPages};t.querySelector('[data-pv="prev"]').onclick=()=>(i--,a()),t.querySelector('[data-pv="next"]').onclick=()=>(i++,a()),t.querySelector('[data-pv="close"]').onclick=async()=>{t.remove(),await ee(s)},a()}const _=e=>e.querySelector("#tool-pdf-pass")?.value||"";async function ht(e){if(!b.length)throw new Error("Choose a file first.");const o=t=>A(e,h(t),"progress"),s=b[0];switch(w){case"MERGE":{if(b.length<2)throw new Error("Choose at least two files to merge.");const t=[];for(const a of b)t.push({name:a.name,type:a.type,bytes:await x(a)});const i=await Xe(t,(a,l)=>o(`Merging… ${a} / ${l}`));$(e,[{name:`Merged_${oe()}.pdf`,blob:M(i),info:`${b.length} files combined`}]);break}case"SPLIT":{const t=await x(s),i=s.pageCount||await X(t),a=e.querySelector("#split-mode").value;let l;a==="EVERY"?l=Array.from({length:i},(d,c)=>[c]):(l=Q(e.querySelector("#split-ranges").value,i),a==="EXTRACT"&&(l=[l.flat()]));const r=await Ke(t,l,P(s.name));$(e,r.map((d,c)=>({name:d.name,blob:M(d.bytes),info:`${l[c].length} page(s)`})));break}case"ORGANIZE":{const t=T.filter(a=>!a.deleted);if(!t.length)throw new Error("At least one page must be kept.");const i=await Ve(await x(s),t);$(e,[{name:`${P(s.name)}_organised.pdf`,blob:M(i),info:`${t.length} page(s)`}]);break}case"COMPRESS":{const t=e.querySelector("#cmp-level").value,i=e.querySelector("#cmp-color").value==="GRAY",a=[];for(let l=0;l<b.length;l++){const r=b[l],d=await x(r),c=t==="LOSSLESS"?{mode:"LOSSLESS"}:{mode:"IMAGE",dpi:Number(t),quality:Number(t)>=150?.7:Number(t)>=110?.6:.5,grayscale:i,password:_(e)};let p=await Je(d,c,(m,g)=>o(`${r.name}: page ${m} / ${g}`)),u;p.length>=d.length?(p=d,u="Already well compressed — original kept"):u=`${q(d.length)} → ${q(p.length)} (${Math.round((1-p.length/d.length)*100)}% smaller)`,a.push({name:`${P(r.name)}_compressed.pdf`,blob:M(p),info:u})}$(e,a);break}case"STAMP":{const t=e.querySelector("#wm-on").checked,i=e.querySelector("#pn-on").checked;if(!t&&!i)throw new Error("Choose watermark, page numbers, or both.");let a=await x(s);if(t){const l=e.querySelector("#wm-text").value.trim()||"COPY",r=await ve(l,{fontSize:72,bold:!0,color:e.querySelector("#wm-color").value});a=await st(a,r.bytes,{opacity:Math.min(.8,Math.max(.05,Number(e.querySelector("#wm-opacity").value)/100))})}i&&(a=await it(a,{position:e.querySelector("#pn-pos").value,format:e.querySelector("#pn-format").value,startAt:Number(e.querySelector("#pn-start").value)||1})),$(e,[{name:`${P(s.name)}_stamped.pdf`,blob:M(a)}]);break}case"TO_WORD":{const t=await tt(await x(s),P(s.name),_(e),(i,a)=>o(`Reading page ${i} / ${a}`));$(e,[{name:`${P(s.name)}.docx`,blob:new Blob([t.bytes],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),info:`${t.pages} page(s)`}],t.hasText?"":"No text was found — this looks like a scanned PDF. Use “PDF to Images” instead, or retype the content.");break}case"TO_EXCEL":{const t=await x(s),i=await at(t,_(e),(a,l)=>o(`Reading page ${a} / ${l}`));if($(e,[{name:`${P(s.name)}.xlsx`,blob:new Blob([i.bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),info:`${i.pages} sheet(s)`}],i.hasText?"":"No text was found — this looks like a scanned PDF, so there is nothing to put in the spreadsheet."),i.hasText){const a=i.tables,l=Math.max(0,a.findIndex(c=>c.filter(p=>p.filter(u=>u!=="").length>=2).length>=3)),r=a[l].slice(0,12),d=e.querySelector("#excel-preview");d&&(d.innerHTML=`<div class="form-label" style="margin-top:12px;">Preview — Page ${l+1}</div><div class="table-wrap" data-no-i18n><table class="data-table">${r.map(c=>`<tr>${c.map(p=>`<td>${h(p)}</td>`).join("")}</tr>`).join("")}</table></div>`)}break}case"TO_IMAGES":{const t=e.querySelector("#img-fmt").value,i=e.querySelector("#img-pages")?.value.trim(),l=await Ze(await x(s),{format:t,dpi:Number(e.querySelector("#img-dpi").value),password:_(e),pages:i||""},(r,d)=>o(`Rendering page ${r} / ${d}`));$(e,l.map(r=>({name:`${P(s.name)}_${r.name}`,blob:new Blob([r.bytes],{type:t})})));break}case"FROM_IMAGES":{const t=[];for(const a of b)t.push({name:a.name,type:a.type,bytes:await x(a)});const i=await ot(t,{pageSize:e.querySelector("#i2p-size").value,orientation:e.querySelector("#i2p-orient").value,margin:Number(e.querySelector("#i2p-margin").value)},(a,l)=>o(`Adding image ${a} / ${l}`));$(e,[{name:`Images_${oe()}.pdf`,blob:M(i),info:`${b.length} page(s)`}]);break}case"UNLOCK":{const t=_(e);if(!t)throw new Error("Enter the PDF password.");const i=await Ye(await x(s),{dpi:200,quality:.9,password:t},(a,l)=>o(`Unlocking page ${a} / ${l}`));$(e,[{name:`${P(s.name)}_unlocked.pdf`,blob:M(i)}]);break}case"IMG_BATCH":await Tt(e,o);break;case"IMG_GIF":{const t=await pt(await x(s)),i=[];for(const[a,l]of t.entries())i.push({name:`${P(s.name)}_frame_${String(a+1).padStart(3,"0")}.png`,blob:await z(l,"image/png"),info:`${l.width}×${l.height}`});$(e,i,`${t.length} frame(s)`);break}case"PAGES":{const t=u=>e.querySelector(u),i=await x(s),a=await X(i),l=t("#pg-op").value;let r,d="";const c=Math.max(0,Math.min(a,Number(t("#pg-after").value)||0)),p=t("#pg-pages").value.trim()?[...new Set(Q(t("#pg-pages").value,a).flat())]:null;if(l==="BLANK"){const u=Math.max(1,Math.min(50,Number(t("#pg-count").value)||1));r=await Pe(i,{after:c,count:u}),d=`${u} blank page(s) after page ${c}`}else if(l==="INSERT"){const u=t("#pg-other").files?.[0];if(!u)throw new Error("Choose the PDF to insert.");const m=await pe(u,["pdf"]);if(!m.ok)throw new Error(m.error);r=await Te(i,m.bytes,{after:c}),d=`${m.name} inserted after page ${c}`}else if(l==="DUP"){if(!p)throw new Error("Enter the pages to duplicate.");r=await ke(i,p),d=`${p.length} page(s) duplicated`}else if(l==="CROP"){const[u,m,g,f]=t("#pg-crop").value.split(/[,\s]+/).map(Number);if([u,m,g,f].some(v=>!(v>=0)||v>100))throw new Error("Enter four numbers in mm, e.g. 10, 10, 10, 10.");r=await Me(i,{top:u,right:m,bottom:g,left:f},p),d=`Cropped ${u}/${m}/${g}/${f} mm`}else{const u=t("#pg-size").value;r=await Ae(i,ce[u],{orientation:t("#pg-orient").value}),d=`All pages fitted to ${u}`}$(e,[{name:`${P(s.name)}_pages.pdf`,blob:M(r),info:d}]);break}case"LABELS":{const t=d=>e.querySelector(d),i=t("#lb-header").value.trim(),a=t("#lb-footer").value.trim();let l=t("#lb-stamp").value;if(l==="CUSTOM"&&(l=t("#lb-stamp-text").value.trim()),!i&&!a&&!l)throw new Error("Enter a header, a footer or choose a stamp.");const r=[];for(const d of b){let c=await x(d);const p=await X(c);if((i||a)&&(c=await Fe(c,{header:i,footer:a,size:Number(t("#lb-size").value)||9,align:t("#lb-align").value,dateText:Z()})),l){const u=t("#lb-pages").value.trim()?[...new Set(Q(t("#lb-pages").value,p).flat())]:null;c=await Ce(c,{label:l.toUpperCase(),subline:t("#lb-sub").value.trim(),position:t("#lb-pos").value,pages:u})}r.push({name:`${P(d.name)}_labelled.pdf`,blob:M(c)})}$(e,r);break}case"FORMS":{const t=s.fields||[],i={};e.querySelectorAll("[data-ff]").forEach(r=>{const d=t[Number(r.dataset.ff)];i[d.name]=r.type==="checkbox"?r.checked:r.value});const a=e.querySelector("#form-flatten").checked,l=t.length?await Ne(await x(s),i,{flatten:a}):await Re(await x(s));$(e,[{name:`${P(s.name)}_${a?"flattened":"filled"}.pdf`,blob:M(l),info:`${Object.keys(i).length} field(s)${a?" · flattened":""}`}]);break}case"META":{const t={};e.querySelectorAll("[data-meta]").forEach(a=>t[a.dataset.meta]=a.value.trim());const i=await qe(await x(s),t);$(e,[{name:`${P(s.name)}_properties.pdf`,blob:M(i),info:"Properties saved"}]);break}case"PROTECT":{const t=l=>e.querySelector(l),i=t("#pr-user").value;if(i.length<4)throw new Error("Use a password of at least 4 characters.");if(i!==t("#pr-user2").value)throw new Error("The two passwords do not match.");const a=[];for(const l of b){o(`Protecting ${l.name}…`);const r=await Ge(await x(l),{userPassword:i,ownerPassword:t("#pr-owner").value,allow:{print:t("#pr-print").checked,copy:t("#pr-copy").checked,modify:t("#pr-mod").checked,fillForms:t("#pr-fill").checked,annotate:t("#pr-mod").checked}});a.push({name:`${P(l.name)}_protected.pdf`,blob:M(r),info:"AES-256 password"})}t("#pr-user").value=t("#pr-user2").value=t("#pr-owner").value="",$(e,a,"Open the file once to check the password works before sending it.");break}default:break}}async function yt(e){if(!b[0])throw new Error("Choose a file first.");const o=await Qe(await x(b[0]),_(e),(t,i)=>A(e,`Reading page ${t} / ${i}`,"progress")),s=et(o);$(e,[{name:`${P(b[0].name)}.txt`,blob:new Blob(["\uFEFF"+s],{type:"text/plain;charset=utf-8"}),info:`${o.length} page(s)`}],s.trim()?"":"No text was found — this looks like a scanned PDF.")}function J(e){const o=e.querySelector("#organize-grid"),s=e.querySelector("#tool-run"),t=e.querySelector("#org-reset");if(o){if(!H){o.innerHTML="",t&&(t.disabled=!0);return}t&&(t.disabled=!1),s&&(s.disabled=!1),o.innerHTML=T.map((i,a)=>{const l=H[i.index];return`
      <div class="tool-thumb ${i.deleted?"deleted":""}">
        <div class="tool-thumb-img"><img src="${l.dataUrl}" alt="" style="transform:rotate(${i.rotate}deg);"></div>
        <div class="tool-thumb-label">Page ${i.index+1}${i.deleted?" — removed":""}</div>
        <div class="tool-thumb-btns">
          <button class="btn btn-xs btn-outline" data-org="left" data-pos="${a}" ${a===0?"disabled":""} title="Move left">◀</button>
          <button class="btn btn-xs btn-outline" data-org="rotl" data-pos="${a}" title="Rotate left">⟲</button>
          <button class="btn btn-xs btn-outline" data-org="rotr" data-pos="${a}" title="Rotate right">⟳</button>
          <button class="btn btn-xs ${i.deleted?"btn-success":"btn-danger"}" data-org="del" data-pos="${a}" title="${i.deleted?"Restore":"Delete"}">${i.deleted?"↺":"✕"}</button>
          <button class="btn btn-xs btn-outline" data-org="right" data-pos="${a}" ${a===T.length-1?"disabled":""} title="Move right">▶</button>
        </div>
      </div>`}).join(""),o.querySelectorAll("[data-org]").forEach(i=>i.addEventListener("click",()=>{const a=Number(i.getAttribute("data-pos")),l=i.getAttribute("data-org"),r=T[a];l==="left"&&a>0&&([T[a-1],T[a]]=[T[a],T[a-1]]),l==="right"&&a<T.length-1&&([T[a+1],T[a]]=[T[a],T[a+1]]),l==="rotl"&&(r.rotate=(r.rotate+270)%360),l==="rotr"&&(r.rotate=(r.rotate+90)%360),l==="del"&&(r.deleted=!r.deleted),J(e)}))}}function se(e){const{pngBytes:o,...s}=e;return{...s,png:o?Array.from(o):null}}function Se(e){return JSON.parse(e||"[]").map(o=>({...o,pngBytes:o.png?new Uint8Array(o.png):void 0,png:void 0}))}function B(){n.undo.push(JSON.stringify(n.edits.map(se))),n.undo.length>40&&n.undo.shift(),n.redo=[]}async function wt(e,o,s,t,i,a={dx:1,dy:1}){const r=document.createElement("canvas");r.width=Math.max(2,Math.round(o*4)),r.height=Math.max(2,Math.round(s*4));const d=r.getContext("2d");d.strokeStyle=t,d.fillStyle=t,d.lineWidth=i*4,d.lineCap="round";const c=i*4/2;if(e==="highlight")d.globalAlpha=.35,d.fillStyle="#FFE14D",d.fillRect(0,0,r.width,r.height);else if(e==="box")d.strokeRect(c,c,r.width-2*c,r.height-2*c);else if(e==="fill")d.fillRect(0,0,r.width,r.height);else if(e==="ellipse")d.beginPath(),d.ellipse(r.width/2,r.height/2,Math.max(1,r.width/2-c),Math.max(1,r.height/2-c),0,0,Math.PI*2),d.stroke();else{const u=a.dx>0?c:r.width-c,m=a.dy>0?c:r.height-c,g=r.width-u,f=r.height-m;if(d.beginPath(),d.moveTo(u,m),d.lineTo(g,f),d.stroke(),e==="arrow"){const v=Math.atan2(f-m,g-u),S=Math.max(12,i*4*5);d.beginPath(),d.moveTo(g,f),d.lineTo(g-S*Math.cos(v-.45),f-S*Math.sin(v-.45)),d.lineTo(g-S*Math.cos(v+.45),f-S*Math.sin(v+.45)),d.closePath(),d.fill()}}const p=await z(r,"image/png");return{bytes:new Uint8Array(await p.arrayBuffer()),dataUrl:r.toDataURL("image/png")}}function k(e){const o=e.querySelector("#editor-area");if(!o||!n)return;const s=w==="REDACT"?[["REDACT","Mark areas to redact"]]:[["NATIVE","Change existing text"],["TEXT","Text box over page"],["IMAGE","Signature / image"],["SHAPE","Shapes & arrows"],["HIGHLIGHT","Highlight"],["NOTE","Comment"],["WHITEOUT","Cover box (not redaction)"]];o.innerHTML=`
    ${n.signed?'<div class="callout warning"><div><strong>This PDF is digitally signed.</strong> Any change makes its digital signature invalid. A signature picture added here is not a digital signature (DSC).</div></div>':""}
    <div class="pdf-editor-toolbar">
      <div class="pill-tabs" style="margin:0;">${s.map(([t,i])=>`<button class="pill-tab ${n.mode===t?"active":""}" data-ed-mode="${t}">${h(i)}</button>`).join("")}</div>
      <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
        <button class="btn btn-sm btn-outline" id="ed-undo" ${n.undo.length?"":"disabled"} title="Undo">↶</button>
        <button class="btn btn-sm btn-outline" id="ed-redo" ${n.redo.length?"":"disabled"} title="Redo">↷</button>
        <button class="btn btn-sm btn-outline" id="ed-zout" title="Zoom out">−</button><span>${Math.round(n.zoom*100)}%</span><button class="btn btn-sm btn-outline" id="ed-zin" title="Zoom in">+</button>
        <input class="form-control" id="ed-find" placeholder="Search text" style="width:130px" value="${h(n.find||"")}"><span class="form-hint" id="ed-find-res">${h(n.findRes||"")}</span>
        <button class="btn btn-sm btn-outline" id="ed-prev" ${n.pageNo<=1?"disabled":""}>◀</button>
        <span class="pdf-editor-pageno">Page ${n.pageNo} / ${n.pageCount}</span>
        <button class="btn btn-sm btn-outline" id="ed-next" ${n.pageNo>=n.pageCount?"disabled":""}>▶</button>
      </div>
    </div>
    <div class="studio-toolrow" style="${n.mode==="SHAPE"?"":"display:none;"}">
      <select class="form-control" id="ed-shape" style="width:auto">${[["box","Box"],["fill","Filled box"],["ellipse","Circle / ellipse"],["arrow","Arrow"],["line","Line"]].map(([t,i])=>`<option value="${t}" ${n.shape===t?"selected":""}>${i}</option>`).join("")}</select>
      <input type="color" id="ed-shape-c" value="${h(n.shapeColour||"#C0392B")}"> <label>Thickness <input type="number" id="ed-shape-w" min="1" max="12" value="${n.shapeWidth||2}" style="width:56px"></label>
    </div>
    <div class="grid-2" style="gap:8px; ${n.mode==="NOTE"?"":"display:none;"}"><div class="form-group"><label class="form-label">Comment text</label><input class="form-control" id="ed-note" placeholder="Type, then click on the page"></div></div>
    <div id="ed-native" style="${n.mode==="NATIVE"?"":"display:none;"}"></div>
    <div class="grid-3" style="gap:8px; ${n.mode==="TEXT"?"":"display:none;"}" id="ed-text-opts">
      <div class="form-group" style="grid-column: span 1;"><label class="form-label">Text</label><textarea class="form-control" id="ed-text" rows="2" placeholder="Type text, then click on the page"></textarea></div>
      <div class="form-group"><label class="form-label">Size</label><input type="number" class="form-control" id="ed-size" min="6" max="72" value="12"></div>
      <div class="form-group"><label class="form-label">Colour</label><input type="color" class="form-control" id="ed-color" value="#000000"></div>
    </div>
    <div class="grid-2" style="gap:8px; ${n.mode==="IMAGE"?"":"display:none;"}" id="ed-img-opts">
      <div class="form-group"><label class="form-label">Signature / Photo / Stamp Image</label><input type="file" class="form-control" id="ed-img" accept="image/png,image/jpeg,image/webp"></div>
      <div class="form-group"><label class="form-label">Width on Page (pt)</label><input type="number" class="form-control" id="ed-img-w" min="10" max="600" value="140"></div>
    </div>
    <p class="form-hint" id="ed-hint">${{WHITEOUT:"Drag a box to cover an area with white. This only hides it on screen and in print — the words underneath stay in the file. To remove information for real, use Redact (secure).",IMAGE:"Choose an image, then click on the page where it should go. A signature picture is not a digital signature.",NATIVE:"Click a piece of text on the page to change it inside the PDF (works when the PDF uses standard or fully included fonts; otherwise VLEBook will tell you and you can use a text box instead).",SHAPE:"Drag on the page to draw the shape.",HIGHLIGHT:"Drag over text to highlight it.",NOTE:"Type a comment, then click where it belongs. It is saved as a real PDF comment (sticky note).",REDACT:"Drag boxes over everything that must be removed, on every page. Then click Redact & Download.",TEXT:"Type your text, then click on the page. This places a new text box on top of the page; it does not change the PDF’s own text."}[n.mode]||""}</p>
    <div class="pdf-editor-stage-wrap"><div class="pdf-editor-stage" id="ed-stage"><canvas id="ed-canvas"></canvas><div class="pdf-editor-layer" id="ed-layer"></div></div></div>
    <div id="ed-list"></div>
    <div class="tool-actions">
      <button class="btn btn-outline" id="ed-clear" ${n.edits.length?"":"disabled"}>Remove All Changes</button>
      <button class="btn btn-primary" id="ed-save" ${n.edits.length?"":"disabled"}>${w==="REDACT"?"Redact & Download":"Save As New PDF"}</button>
    </div>`,o.querySelectorAll("[data-ed-mode]").forEach(t=>t.addEventListener("click",()=>{n.mode=t.getAttribute("data-ed-mode"),k(e)})),o.querySelector("#ed-prev")?.addEventListener("click",()=>{n.pageNo--,k(e)}),o.querySelector("#ed-next")?.addEventListener("click",()=>{n.pageNo++,k(e)}),o.querySelector("#ed-img")?.addEventListener("change",async t=>{const i=t.target.files?.[0];if(!i)return;const a=await nt(i),l=N(a),r=await z(l,"image/png");n.pending={pngBytes:new Uint8Array(await r.arrayBuffer()),dataUrl:l.toDataURL("image/png"),ratio:l.height/l.width}}),o.querySelector("#ed-clear")?.addEventListener("click",()=>{B(),n.edits=[],k(e)}),o.querySelector("#ed-undo")?.addEventListener("click",()=>{n.redo.push(JSON.stringify(n.edits.map(se))),n.edits=Se(n.undo.pop()),k(e)}),o.querySelector("#ed-redo")?.addEventListener("click",()=>{n.undo.push(JSON.stringify(n.edits.map(se))),n.edits=Se(n.redo.pop()),k(e)}),o.querySelector("#ed-zin")?.addEventListener("click",()=>{n.zoom=Math.min(3,n.zoom+.25),k(e)}),o.querySelector("#ed-zout")?.addEventListener("click",()=>{n.zoom=Math.max(.5,n.zoom-.25),k(e)}),o.querySelector("#ed-find")?.addEventListener("keydown",async t=>{if(t.key!=="Enter")return;n.find=t.target.value;const i=await je(n.pdf,n.find);n.findRes=i.length?`Found on page(s) ${i.map(a=>a.page).join(", ")}`:"Not found",i.length&&(n.pageNo=i.find(a=>a.page>=n.pageNo)?.page||i[0].page),k(e)}),["#ed-shape","#ed-shape-c","#ed-shape-w"].forEach(t=>o.querySelector(t)?.addEventListener("change",()=>{n.shape=o.querySelector("#ed-shape").value,n.shapeColour=o.querySelector("#ed-shape-c").value,n.shapeWidth=Number(o.querySelector("#ed-shape-w").value)||2})),o.querySelector("#ed-save")?.addEventListener("click",()=>F(e,async t=>{let i=await x(b[0]);if(w==="REDACT"){const c=n.edits.filter(u=>u.kind==="redact").map(u=>({pageIndex:u.pageIndex,x:u.x,y:u.y,w:u.w,h:u.h})),p=await Be(i,c,{dpi:200},(u,m)=>t(`Redacting page ${u} / ${m}…`));$(e,[{name:`${P(b[0].name)}_redacted.pdf`,blob:M(p.bytes),info:`Verified: ${p.report.map(u=>`page ${u.page} — ${u.wordsRemoved} text piece(s) removed`).join("; ")}`}],"Checked after saving: the redacted text cannot be found or copied in the new file.");return}const a=[],l=[];let r=0;for(const c of n.edits.filter(p=>p.kind==="native"))try{i=(await He(i,c.pageIndex,c.old,c.newText)).bytes,r++}catch(p){l.push(`“${c.old}”: ${p.message}`)}for(const c of n.edits.filter(p=>p.kind==="note"))a.push({pageIndex:c.pageIndex,x:c.x,y:c.y,text:c.label});const d=n.edits.filter(c=>c.kind!=="native"&&c.kind!=="note");if(d.length&&(i=await lt(i,d)),a.length&&(i=await ze(i,a)),l.length&&!d.length&&!a.length&&!r)throw new Error(l.join(" "));$(e,[{name:`${P(b[0].name)}_edited.pdf`,blob:M(i),info:`${r} text change(s) inside the PDF · ${d.length} item(s) placed on top · ${a.length} comment(s)`}],l.length?`Not changed (use a text box instead): ${l.map(h).join(" ")}`:"")})),xt(e)}async function xt(e){const o=e.querySelector("#ed-canvas"),s=e.querySelector("#ed-stage"),t=e.querySelector("#ed-layer");if(!o||!n)return;const i=await n.pdf.getPage(n.pageNo),a=i.getViewport({scale:1}),r=Math.min(860,(e.querySelector(".pdf-editor-stage-wrap")?.clientWidth||860)-4)/a.width*(n.zoom||1),d=Math.min(2,window.devicePixelRatio||1);await me(n.pdf,n.pageNo,r*d,o),o.style.width=`${a.width*r}px`,o.style.height=`${a.height*r}px`,s.style.width=o.style.width,s.style.height=o.style.height,n.scale=r,n.pageW=a.width,n.pageH=a.height,St(e),n.mode==="NATIVE"&&await $t(e,i,a);let c=null,p=null;const u=m=>{const g=t.getBoundingClientRect();return{x:(m.clientX-g.left)/n.scale,y:(m.clientY-g.top)/n.scale}};t.onpointerdown=async m=>{if(m.target!==t)return;const g=u(m);if(["WHITEOUT","REDACT","SHAPE","HIGHLIGHT"].includes(n.mode)){c=g,p=document.createElement("div"),p.className=`pdf-edit-item ${n.mode==="REDACT"?"redact":"whiteout"}`,t.appendChild(p),t.setPointerCapture(m.pointerId);return}if(n.mode==="TEXT"){const f=e.querySelector("#ed-text")?.value||"";if(!f.trim()){A(e,"Type the text first, then click on the page.","error");return}const v=Number(e.querySelector("#ed-size")?.value)||12,S=await ve(f,{fontSize:v,color:e.querySelector("#ed-color")?.value||"#000000"});B(),n.edits.push({id:L(),pageIndex:n.pageNo-1,type:"image",kind:"text",label:f,x:g.x,y:g.y-S.height/2,w:S.width,h:S.height,pngBytes:S.bytes,dataUrl:S.dataUrl}),A(e,""),k(e);return}if(n.mode==="IMAGE"){if(!n.pending){A(e,"Choose an image first, then click on the page.","error");return}const f=Number(e.querySelector("#ed-img-w")?.value)||140,v=f*n.pending.ratio;B(),n.edits.push({id:L(),pageIndex:n.pageNo-1,type:"image",kind:"image",label:"Image",x:g.x-f/2,y:g.y-v/2,w:f,h:v,pngBytes:n.pending.pngBytes,dataUrl:n.pending.dataUrl}),A(e,""),k(e);return}if(n.mode==="NOTE"){const f=e.querySelector("#ed-note")?.value.trim();if(!f){A(e,"Type the comment first, then click on the page.","error");return}B(),n.edits.push({id:L(),pageIndex:n.pageNo-1,type:"note",kind:"note",label:f,x:g.x,y:g.y,w:18,h:18}),A(e,""),k(e)}},t.onpointermove=m=>{if(!c||!p)return;const g=u(m),f=Math.min(g.x,c.x),v=Math.min(g.y,c.y);Object.assign(p.style,{left:`${f*n.scale}px`,top:`${v*n.scale}px`,width:`${Math.abs(g.x-c.x)*n.scale}px`,height:`${Math.abs(g.y-c.y)*n.scale}px`})},t.onpointerup=m=>{if(!c)return;const g=u(m),f=Math.abs(g.x-c.x),v=Math.abs(g.y-c.y),S=c;c=null,p=null;const C=Math.min(g.x,S.x),I=Math.min(g.y,S.y),W=n.mode==="SHAPE"&&["arrow","line"].includes(n.shape||"box");if(f>3&&v>3||W&&Math.hypot(f,v)>6)if(B(),n.mode==="WHITEOUT")n.edits.push({id:L(),pageIndex:n.pageNo-1,type:"rect",kind:"whiteout",label:"Cover box",color:"#FFFFFF",x:C,y:I,w:f,h:v});else if(n.mode==="REDACT")n.edits.push({id:L(),pageIndex:n.pageNo-1,type:"rect",kind:"redact",label:"Redact",color:"#000000",x:C,y:I,w:f,h:v});else{const D=n.mode==="HIGHLIGHT"?"highlight":n.shape||"box",U=Math.max(f,4),re=Math.max(v,4);(async()=>{const de=await wt(D,U,re,n.shapeColour||"#C0392B",n.shapeWidth||2,{dx:g.x>=S.x?1:-1,dy:g.y>=S.y?1:-1});n.edits.push({id:L(),pageIndex:n.pageNo-1,type:"image",kind:"shape",label:D,x:C,y:I,w:U,h:re,pngBytes:de.bytes,dataUrl:de.dataUrl}),k(e)})();return}k(e)}}async function $t(e,o,s){const t=e.querySelector("#ed-layer"),i=n.scale,a=await o.getTextContent(),l=o.getViewport({scale:1}),r=[];for(const d of a.items){if(!d.str?.trim())continue;const[c,p]=l.convertToViewportPoint(d.transform[4],d.transform[5]),u=d.height||Math.hypot(d.transform[2],d.transform[3])||10;r.push({str:d.str,x:c,y:p-u,w:d.width||d.str.length*u*.5,h:u})}for(const[d,c]of r.entries()){const p=document.createElement("div");p.className="pdf-text-hit",p.dataset.hit=d,p.title=c.str,Object.assign(p.style,{left:`${c.x*i}px`,top:`${c.y*i}px`,width:`${c.w*i}px`,height:`${c.h*i}px`}),t.appendChild(p)}t.querySelectorAll(".pdf-text-hit").forEach(d=>d.addEventListener("pointerdown",c=>{c.stopPropagation();const p=r[Number(d.dataset.hit)],u=e.querySelector("#ed-native");u.innerHTML=`<div class="grid-2" style="gap:8px"><div class="form-group"><label class="form-label">Text now</label><input class="form-control" value="${h(p.str)}" disabled data-no-i18n></div>
        <div class="form-group"><label class="form-label">Change to</label><input class="form-control" id="ed-native-new" value="${h(p.str)}"></div></div>
        <button class="btn btn-sm btn-primary" id="ed-native-ok">Apply change</button> <span class="form-hint">Checked when you save. If this PDF's font cannot take the new letters, VLEBook tells you and nothing is changed.</span>`,u.querySelector("#ed-native-new").focus(),u.querySelector("#ed-native-ok").addEventListener("click",()=>{const m=u.querySelector("#ed-native-new").value;m!==p.str&&(B(),n.edits.push({id:L(),pageIndex:n.pageNo-1,type:"native",kind:"native",label:`${p.str} → ${m}`,old:p.str,newText:m,x:p.x,y:p.y,w:p.w,h:p.h}),k(e))})}))}function St(e){const o=e.querySelector("#ed-layer"),s=e.querySelector("#ed-list");if(!o||!n)return;const t=n.scale,i=n.edits.filter(a=>a.pageIndex===n.pageNo-1);o.innerHTML=i.map(a=>`<div class="pdf-edit-item ${a.kind==="whiteout"?"whiteout":""} ${a.kind==="redact"?"redact":""} ${a.kind==="native"?"native":""} ${a.kind==="note"?"note":""}" data-ed-id="${a.id}" title="${h(a.label||"")}" style="left:${a.x*t}px; top:${a.y*t}px; width:${a.w*t}px; height:${a.h*t}px;">${a.dataUrl?`<img src="${a.dataUrl}" alt="" draggable="false">`:a.kind==="note"?"💬":a.kind==="native"?`<span class="native-new">${h(a.newText)}</span>`:""}<button class="pdf-edit-del" data-ed-del="${a.id}" title="Remove">✕</button></div>`).join(""),o.querySelectorAll("[data-ed-del]").forEach(a=>a.addEventListener("pointerdown",l=>{l.stopPropagation(),B(),n.edits=n.edits.filter(r=>r.id!==a.getAttribute("data-ed-del")),k(e)})),o.querySelectorAll("[data-ed-id]").forEach(a=>{a.addEventListener("pointerdown",l=>{if(l.target.closest("[data-ed-del]"))return;l.stopPropagation();const r=n.edits.find(c=>c.id===a.getAttribute("data-ed-id")),d={cx:l.clientX,cy:l.clientY,x:r.x,y:r.y};a.setPointerCapture(l.pointerId),a.onpointermove=c=>{r.x=Math.max(0,Math.min(n.pageW-r.w,d.x+(c.clientX-d.cx)/t)),r.y=Math.max(0,Math.min(n.pageH-r.h,d.y+(c.clientY-d.cy)/t)),a.style.left=`${r.x*t}px`,a.style.top=`${r.y*t}px`},a.onpointerup=()=>{a.onpointermove=null,a.onpointerup=null}})}),s&&(s.innerHTML=n.edits.length?`<div class="form-hint" style="margin-top:8px;">${n.edits.length} change(s) on ${new Set(n.edits.map(a=>a.pageIndex)).size} page(s). Click ✕ on an item to remove it.</div>`:"")}const Et={photo50:{mode:"MAX_SIDE",max:600,format:"image/jpeg",kb:50},photo20:{mode:"MAX_SIDE",max:400,format:"image/jpeg",kb:20},sign20:{mode:"MAX_SIDE",max:600,format:"image/jpeg",kb:20},pan:{mode:"PIXELS",w:213,h:213,aspect:"STRETCH",format:"image/jpeg",kb:30},doc200:{mode:"MAX_SIDE",max:1800,format:"image/jpeg",kb:200},doc500:{mode:"MAX_SIDE",max:2400,format:"image/jpeg",kb:500}};function Pt(e){const o=t=>e.querySelector(t),s=()=>{const t=o("#ib-mode").value;o("#ib-percent-wrap").style.display=t==="PERCENT"?"":"none",o("#ib-w-wrap").style.display=t==="PIXELS"?"":"none",o("#ib-h-wrap").style.display=t==="PIXELS"?"":"none",o("#ib-aspect-wrap").style.display=t==="PIXELS"?"":"none",o("#ib-max-wrap").style.display=t==="MAX_SIDE"?"":"none"};o("#ib-mode").addEventListener("change",s),o("#ib-preset").addEventListener("change",()=>{const t=Et[o("#ib-preset").value];t&&(o("#ib-mode").value=t.mode,t.max&&(o("#ib-max").value=t.max),t.w&&(o("#ib-w").value=t.w),t.h&&(o("#ib-h").value=t.h),o("#ib-aspect").value=t.aspect||"KEEP",o("#ib-format").value=t.format,o("#ib-kb").value=t.kb||"",s())}),s()}async function Tt(e,o){const s=u=>e.querySelector(u),t=s("#ib-mode").value,i=s("#ib-format").value,a=Number(s("#ib-kb").value)||0,l=Number(s("#ib-quality").value)||.85,r=[],d=[];let c=0;const p=t==="PIXELS"&&s("#ib-aspect").value==="STRETCH";for(const u of b){o(`Processing ${++c} / ${b.length}: ${u.name}`);const m=await ye(u.file,u.kind),{width:g,height:f}=rt(m),v=t==="NONE"?{width:g,height:f}:dt(g,f,{mode:t,percent:s("#ib-percent").value,width:s("#ib-w").value,height:s("#ib-h").value,keepAspect:s("#ib-aspect").value!=="STRETCH",maxSide:s("#ib-max").value}),S=i==="SAME"?ae[u.type]?u.type:"image/jpeg":i,C=N(m,v.width,v.height,S==="image/jpeg"?"#FFFFFF":null);let I,W="";if(a){let D;try{D=await be(C,a,S,{fixedSize:p,strict:!0})}catch(U){d.push(`${u.name}: ${U.message}`);continue}I=D.blob,D.width!==C.width&&(W=` · reduced to ${D.width}×${D.height} px to fit ${a} KB`)}else I=await z(C,S,l);r.push({name:he(u.name,ae[S]),blob:I,info:`${g}×${f} → ${C.width}×${C.height} px · ${q(u.size)} → ${q(I.size)} (${I.size.toLocaleString("en-IN")} bytes)${W}${u.type==="image/jpeg"&&S!==u.type?" · camera details (EXIF) removed":""}`})}if(!r.length)throw new Error(d.join(" · ")||"Nothing was processed.");$(e,r,d.length?`Not saved (limit could not be met): ${d.map(h).join(" · ")}`:"")}function j(e){const o=e.querySelector("#imgedit-area");if(!o||!y)return;const s=y.current;o.innerHTML=`
    <div class="grid-sidebar-right" style="align-items:start;">
      <div>
        <div class="img-edit-stage" id="ie-stage"><canvas id="ie-canvas"></canvas><div class="img-crop-box" id="ie-crop" hidden></div></div>
        <p class="form-hint">Drag on the image to select an area to crop. Current size: ${s.width} × ${s.height} px</p>
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
    </div>`;const t=o.querySelector("#ie-canvas"),i=o.querySelector("#ie-stage"),a=Math.min(720,i.clientWidth||720),l=Math.min(1,a/s.width,520/s.height);t.width=s.width,t.height=s.height,t.getContext("2d").drawImage(s,0,0),t.style.width=`${s.width*l}px`,t.style.height=`${s.height*l}px`,i.style.width=t.style.width,i.style.height=t.style.height;const r=()=>{const m=document.createElement("canvas");m.width=s.width,m.height=s.height,m.getContext("2d").drawImage(s,0,0),te(m,ne(o)),t.getContext("2d").drawImage(m,0,0)};["#ie-bright","#ie-contrast","#ie-thr"].forEach(m=>o.querySelector(m).addEventListener("input",r)),o.querySelector("#ie-effect").addEventListener("change",()=>{o.querySelector("#ie-thr-wrap").style.display=o.querySelector("#ie-effect").value==="BW_SCAN"?"":"none",r()}),o.querySelectorAll("[data-ie]").forEach(m=>m.addEventListener("click",()=>{const g=m.getAttribute("data-ie");g==="rotl"&&(y.current=ge(y.current,270)),g==="rotr"&&(y.current=ge(y.current,90)),g==="fliph"&&(y.current=fe(y.current,!0)),g==="flipv"&&(y.current=fe(y.current,!1)),y.crop=null,j(e)})),o.querySelector("#ie-adjust-apply").addEventListener("click",()=>{const m=N(y.current);te(m,ne(o)),y.current=m,j(e)}),o.querySelector("#ie-reset").addEventListener("click",()=>{y.current=N(y.original),y.crop=null,j(e)});const d=o.querySelector("#ie-crop"),c=o.querySelector("#ie-crop-apply");let p=null;const u=m=>{const g=t.getBoundingClientRect();return{x:Math.max(0,Math.min(g.width,m.clientX-g.left)),y:Math.max(0,Math.min(g.height,m.clientY-g.top))}};i.onpointerdown=m=>{p=u(m),i.setPointerCapture(m.pointerId),d.hidden=!1,Object.assign(d.style,{left:`${p.x}px`,top:`${p.y}px`,width:"0px",height:"0px"})},i.onpointermove=m=>{if(!p)return;const g=u(m);Object.assign(d.style,{left:`${Math.min(g.x,p.x)}px`,top:`${Math.min(g.y,p.y)}px`,width:`${Math.abs(g.x-p.x)}px`,height:`${Math.abs(g.y-p.y)}px`})},i.onpointerup=m=>{if(!p)return;const g=u(m),f=Math.abs(g.x-p.x),v=Math.abs(g.y-p.y);f>4&&v>4?(y.crop={x:Math.min(g.x,p.x)/l,y:Math.min(g.y,p.y)/l,w:f/l,h:v/l},c.disabled=!1):(d.hidden=!0,y.crop=null,c.disabled=!0),p=null},c.addEventListener("click",()=>{y.crop&&(y.current=ct(y.current,y.crop),y.crop=null,j(e))}),o.querySelector("#ie-save").addEventListener("click",()=>F(e,async()=>{const m=o.querySelector("#ie-fmt").value,g=Number(o.querySelector("#ie-kb").value)||0,f=N(y.current,null,null,m==="image/jpeg"?"#FFFFFF":null);te(f,ne(o));const v=g?await be(f,g,m):{blob:await z(f,m,.92),width:f.width,height:f.height};$(e,[{name:he(b[0].name.replace(/\.[^.]+$/,"")+"_edited",ae[m]),blob:v.blob,info:`${v.width}×${v.height} px`}])}))}function ne(e){return{brightness:Number(e.querySelector("#ie-bright")?.value||0),contrast:Number(e.querySelector("#ie-contrast")?.value||0),effect:e.querySelector("#ie-effect")?.value||"NONE",threshold:Number(e.querySelector("#ie-thr")?.value||160)}}export{ut as renderToolsModule,Lt as setActiveTool};
