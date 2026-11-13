/*! GSTR-2B Reconciliation - UI. Runs entirely in the browser; nothing is uploaded. */
(function () {
  "use strict";
  var GR = window.GR, SM = window.GRSAMPLE, DOCS = window.GRDOCS || {}, VERSION = GR.VERSION;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v; else if (k === "text") el.textContent = v; else if (k === "html") el.innerHTML = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v; else if (v === true) el.setAttribute(k, ""); else el.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) c.forEach(function (x) { add(el, x); }); else if (c.nodeType) el.appendChild(c); else el.appendChild(document.createTextNode(String(c))); }
  function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  var inr = GR.inr;
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  /* ================= storage ================= */
  var DB = null, S = {
    clients: new Map(), runs: new Map(), kv: {}, clientId: null, tab: "upload", ready: false,
    period: { fy: 2025, kind: "Month", sub: "04", from: "2025-04-01", to: "2025-04-30", filterBooks: true, filter2b: false },
    files2b: [], books: null, itemWise: false, result: null, booksParse: null, filters: { status: "", q: "", limit: 300 }, asOf: today(), warnings: [], notices: []
  };
  var saveState = "init", saveTimer = null, pending = 0;
  function setStatus(st, msg) {
    saveState = st; var d = $("#savedot"), t = $("#savestatus");
    if (d) d.className = "dot " + st;
    var txt = { init: "Starting…", clean: "Nothing to save", dirty: "Changes not saved yet", saving: "Saving…", saved: "Saved " + new Date().toLocaleTimeString("en-IN"), failed: "NOT saved - storage error" }[st];
    if (t) t.textContent = msg || txt;
  }
  function openDB() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej({ code: "MT-DBS-001" });
      var rq = indexedDB.open("gstr2b-reco", 1);
      rq.onupgradeneeded = function () { var d = rq.result; ["clients", "runs"].forEach(function (s) { d.createObjectStore(s, { keyPath: "id" }); }); d.createObjectStore("kv", { keyPath: "key" }); };
      rq.onsuccess = function () { DB = rq.result; res(); };
      rq.onerror = function () { rej({ code: "MT-DBS-002" }); };
      rq.onblocked = function () { rej({ code: "MT-DBS-002" }); };
    });
  }
  function tx(store, mode, fn) {
    return new Promise(function (res, rej) {
      var t = DB.transaction(store, mode), out;
      t.oncomplete = function () { res(out); }; t.onerror = t.onabort = function () { rej(t.error || { code: "MT-DBS-003" }); };
      out = fn(t);
    });
  }
  function readAll(store) { return new Promise(function (res, rej) { var t = DB.transaction(store, "readonly"), rq = t.objectStore(store).getAll(); rq.onsuccess = function () { res(rq.result); }; rq.onerror = function () { rej(rq.error); }; }); }
  function persist(store, obj) {
    pending++; setStatus("saving");
    return tx(store, "readwrite", function (t) { t.objectStore(store).put(obj); }).then(function () { if (--pending === 0) setStatus("saved"); }, function (e) { pending--; setStatus("failed"); toast("Could not save to this browser's storage.", "error", "MT-DBS-003"); });
  }
  function unpersist(store, key) {
    pending++; setStatus("saving");
    return tx(store, "readwrite", function (t) { t.objectStore(store).delete(key); }).then(function () { if (--pending === 0) setStatus("saved"); }, function () { pending--; setStatus("failed"); });
  }
  function setKV(key, value) { S.kv[key] = value; return persist("kv", { key: key, value: value }); }
  function kv(key, dflt) { return S.kv[key] === undefined ? dflt : S.kv[key]; }
  var SETTINGS_DEFAULT = { title: "GSTR-2B vs Purchase Books - ITC Reconciliation", preparedBy: "", tolRs: 1, win: 7, hideNames: false, extra17: {}, template: GR.DEFAULT_TEMPLATE, clauses: "Section 16(2)(aa) read with Rule 36(4): input tax credit may be availed only to the extent it appears in the recipient's GSTR-2B.\nSection 16(4): credit for an invoice or debit note of a financial year cannot be taken after 30 November following the end of that year (or the date of filing the annual return, if earlier).\nRule 37: where the supplier is not paid within 180 days of the invoice date, the credit taken must be reversed with interest and may be re-availed on payment.\nRule 37A: where the supplier has not filed GSTR-3B for the period, credit taken is to be reversed as the Rule provides.\nSection 17(5): flagged items are for review only. Whether credit is blocked depends on use and on the exceptions in the Act." };
  function settings() { var s = Object.assign({}, SETTINGS_DEFAULT, kv("settings", {})); return s; }
  function client() { return S.clients.get(S.clientId) || null; }
  function decisions() { return kv("dec:" + S.clientId, { vendor: {}, bill: {} }); }
  function follow() { return kv("fol:" + S.clientId, {}); }

  /* ================= toast / modal ================= */
  function toast(msg, kind, code) {
    var box = $("#toasts"); if (!box) return;
    var t = h("div", { class: "toast " + (kind || "info"), role: "status" }, h("span", { text: msg }), code ? errChip(code) : null, h("button", { class: "x", "aria-label": "Dismiss", type: "button", onclick: function () { t.remove(); } }, "×"));
    box.appendChild(t); setTimeout(function () { if (t.parentNode) t.remove(); }, kind === "error" ? 12000 : 5000);
  }
  function errInfo(code) { var e = GR.ERRORS[code]; return e || { title: code, cause: "", action: "" }; }
  function errChip(code) { var e = errInfo(code); return h("button", { class: "chip error", type: "button", title: e.title + ". " + e.action, onclick: function () { openDoc("errors", code); } }, code); }
  function modal(title, body, buttons, opts) {
    var back = h("div", { class: "modal-back" }), prev = document.activeElement;
    function close() { back.remove(); if (prev && prev.focus) try { prev.focus(); } catch (e) {} }
    var foot = h("div", { class: "modal-foot" }, (buttons || [{ label: "Close" }]).map(function (b) {
      return h("button", { class: "btn" + (b.cls ? " " + b.cls : ""), type: "button", onclick: function () { var r = b.onclick ? b.onclick(close) : undefined; if (r !== false && !b.keep) close(); } }, b.label);
    }));
    var m = h("div", { class: "modal" + (opts && opts.wide ? " wide" : ""), role: "dialog", "aria-modal": "true", "aria-label": title }, h("div", { class: "modal-head" }, h("h2", { text: title }), h("button", { class: "x", "aria-label": "Close", type: "button", onclick: close }, "×")), h("div", { class: "modal-body" }, body), foot);
    back.appendChild(m); back.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); }); back.addEventListener("click", function (e) { if (e.target === back) close(); });
    document.body.appendChild(back); var f = m.querySelector("input,select,textarea,.modal-foot .btn"); if (f) f.focus(); return close;
  }
  function download(name, mime, data) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime }), a = h("a", { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  /* ================= client handling ================= */
  function clientForm(c) {
    var name = h("input", { id: "cf_name", value: c ? c.name : "", maxlength: "120" }), gs = h("input", { id: "cf_gstin", value: c ? c.gstin : "", maxlength: "15", style: "text-transform:uppercase" }), err = h("div", { class: "ferr", id: "cf_err" });
    var body = h("div", { class: "form" }, h("div", { class: "fld" }, h("label", { for: "cf_name" }, "Client name"), name), h("div", { class: "fld" }, h("label", { for: "cf_gstin" }, "Client GSTIN"), gs, h("small", { text: "Optional. Used in report headings." })), h("div", { class: "fld wide" }, err));
    modal(c ? "Edit client" : "Add client", body, [{ label: "Cancel" }, { label: "Save", cls: "primary", keep: true, onclick: function (close) {
      var n = name.value.trim(), g = GR.normGstin(gs.value);
      if (n.length < 2) { err.textContent = "Enter the client name (at least 2 characters)."; return false; }
      if (g && !GR.gstinValid(g)) { err.textContent = "That GSTIN does not pass the GSTIN check. Re-check it, or clear the box."; return false; }
      var o = c ? Object.assign({}, c, { name: n, gstin: g }) : { id: uid(), name: n, gstin: g, created: Date.now() };
      S.clients.set(o.id, o); S.clientId = o.id; persist("clients", o); try { localStorage.setItem("gr-client", o.id); } catch (e) {}
      close(); render();
    } }]);
  }
  function deleteClient() {
    var c = client(); if (!c) return;
    modal("Delete client", h("p", { text: "Delete " + c.name + " with all its saved runs and decisions? This cannot be undone. Download a backup first if unsure." }), [{ label: "Keep" }, { label: "Delete", cls: "danger", onclick: function () {
      S.runs.forEach(function (r, id) { if (r.clientId === c.id) { S.runs.delete(id); unpersist("runs", id); } });
      S.clients.delete(c.id); unpersist("clients", c.id); ["dec:", "fol:", "draft:"].forEach(function (p) { delete S.kv[p + c.id]; unpersist("kv", p + c.id); });
      S.clientId = Array.from(S.clients.keys())[0] || null; render();
    } }]);
  }

  /* ================= period ================= */
  function setPeriod(p) {
    Object.assign(S.period, p || {});
    var P = S.period, fy = +P.fy;
    if (P.kind === "Month") { var m = +P.sub, y = m >= 4 ? fy : fy + 1, last = new Date(Date.UTC(y, m, 0)).getUTCDate(); P.from = y + "-" + ("0" + m).slice(-2) + "-01"; P.to = y + "-" + ("0" + m).slice(-2) + "-" + last; }
    else if (P.kind === "Quarter") { var q = +P.sub; var sm = [4, 7, 10, 1][q - 1], em = sm + 2, ys = sm >= 4 ? fy : fy + 1; var last2 = new Date(Date.UTC(ys, em, 0)).getUTCDate(); P.from = ys + "-" + ("0" + sm).slice(-2) + "-01"; P.to = ys + "-" + ("0" + em).slice(-2) + "-" + last2; }
    else if (P.kind === "Year") { P.from = fy + "-04-01"; P.to = (fy + 1) + "-03-31"; }
  }
  var MONTHS = [["04", "April"], ["05", "May"], ["06", "June"], ["07", "July"], ["08", "August"], ["09", "September"], ["10", "October"], ["11", "November"], ["12", "December"], ["01", "January"], ["02", "February"], ["03", "March"]];
  function periodLabel() {
    var P = S.period;
    if (P.kind === "Month") { var mn = MONTHS.filter(function (x) { return x[0] === P.sub; })[0][1]; return mn + " " + (+P.sub >= 4 ? P.fy : +P.fy + 1); }
    if (P.kind === "Quarter") return "Q" + P.sub + " FY " + GR.fyLabel(+P.fy);
    if (P.kind === "Year") return "FY " + GR.fyLabel(+P.fy);
    return GR.fmtDMY(P.from) + " to " + GR.fmtDMY(P.to);
  }

  /* ================= reading files ================= */
  function readBuf(file) { if (file.buf) return Promise.resolve(file.buf); return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = function () { rej(); }; fr.readAsArrayBuffer(file); }); }

  /* .zip files from the GST portal: read the files inside (stored or deflate) without any library */
  function inflateRaw(data) { var ds = new DecompressionStream("deflate-raw"); return new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer(); }
  function unzipAll(buf) {
    var u = new Uint8Array(buf), dv = new DataView(buf), i = u.length - 22;
    while (i >= 0 && dv.getUint32(i, true) !== 0x06054b50) i--;
    if (i < 0) return Promise.reject(new Error("zip"));
    var n = dv.getUint16(i + 10, true), off = dv.getUint32(i + 16, true), ents = [], k;
    for (k = 0; k < n; k++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      var nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true);
      ents.push({ method: dv.getUint16(off + 10, true), csize: dv.getUint32(off + 20, true), lho: dv.getUint32(off + 42, true), name: new TextDecoder("utf-8").decode(u.subarray(off + 46, off + 46 + nl)) });
      off += 46 + nl + el + cl;
    }
    ents = ents.filter(function (e) { return /\.(xlsx|xls|csv|json)$/i.test(e.name) && !/\/$/.test(e.name); });
    return Promise.all(ents.map(function (e) {
      var ln = dv.getUint16(e.lho + 26, true), le = dv.getUint16(e.lho + 28, true), st = e.lho + 30 + ln + le, d = u.subarray(st, st + e.csize);
      var p = e.method === 0 ? Promise.resolve(d.slice().buffer) : inflateRaw(d);
      return p.then(function (b) { return { name: e.name.split("/").pop(), size: b.byteLength, buf: b }; });
    }));
  }
  function expand(file) {
    if (!/\.zip$/i.test(file.name)) return Promise.resolve([file]);
    return readBuf(file).then(unzipAll).then(function (list) {
      if (!list.length) { toast(file.name + " has no Excel, CSV or JSON file inside.", "error", "MT-GR-011"); return []; }
      return list;
    }, function () { toast(file.name + " could not be opened as a zip file.", "error", "MT-GR-011"); return []; });
  }
  function eachFile(file, fn) { return expand(file).then(function (list) { return list.reduce(function (p, it) { return p.then(function () { return fn(it); }); }, Promise.resolve()); }); }
  function workbookSheets(buf) {
    var wb = XLSX.read(buf, { type: "array", cellDates: false });
    return wb.SheetNames.map(function (n) { return { name: n, aoa: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: "", blankrows: false }) }; });
  }
  function add2B(file0) { return eachFile(file0, add2B1); }
  function add2B1(file) {
    if (file.size > 40 * 1024 * 1024) { toast("File is larger than 40 MB.", "error", "MT-GR-009"); return Promise.resolve(); }
    return readBuf(file).then(function (buf) {
      var res;
      if (/\.json$/i.test(file.name)) res = GR.parse2BJson(new TextDecoder("utf-8").decode(buf), file.name);
      else res = GR.parse2BWorkbook(workbookSheets(buf), file.name);
      if (res.error) { toast("Could not read " + file.name + ": " + errInfo(res.error).title, "error", res.error); return; }
      S.files2b = S.files2b.filter(function (f) { return f.name !== file.name; });
      S.files2b.push({ name: file.name, docs: res.docs, meta: res.meta || {}, warnings: res.warnings || [] });
      toast(file.name + ": " + res.docs.length + " documents read from " + (res.kind === "2A" || (res.docs[0] && res.docs[0].src === "2A") ? "GSTR-2A" : "GSTR-2B") + ".", "ok"); render();
    }, function () { toast("The file could not be read.", "error", "MT-GR-002"); });
  }
  function fingerprint(headers) { var s = headers.map(function (x) { return String(x).toLowerCase().replace(/[^a-z0-9]/g, ""); }).join("|"), x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); }
  function addBooks(file0) { return eachFile(file0, addBooks1); }
  function addBooks1(file) {
    if (file.size > 40 * 1024 * 1024) { toast("File is larger than 40 MB.", "error", "MT-GR-009"); return Promise.resolve(); }
    return readBuf(file).then(function (buf) {
      var sheets = workbookSheets(buf);
      S.books = { name: file.name, sheets: sheets, sheetIdx: 0, override: {} };
      var best = 0, bs = -1; sheets.forEach(function (sh, i) { var hr = GR.findHeaderRow(sh.aoa); var s = hr >= 0 ? sh.aoa.length : -1; if (s > bs) { bs = s; best = i; } });
      S.books.sheetIdx = best; reparseBooks(); render();
    }, function () { toast("The file could not be read.", "error", "MT-GR-002"); });
  }
  function reparseBooks() {
    var B = S.books; if (!B) { S.booksParse = null; return; }
    var sh = B.sheets[B.sheetIdx], aoa = sh.aoa, hr = GR.findHeaderRow(aoa);
    var remembered = {};
    if (hr >= 0) { var fp = fingerprint(aoa[hr]); B.fp = fp; remembered = kv("lay:" + fp, {}); }
    var ov = Object.assign({}, remembered, B.override);
    S.booksParse = GR.parseTable(aoa, { src: "BOOKS", mapping: ov, itemWise: S.itemWise, fileName: B.name, sheetName: sh.name });
  }

  /* ================= running ================= */
  function dedupe2B(docs) {
    var seen = {}, out = [], dup = 0;
    docs.forEach(function (d) { var k = [d.sec, d.gstin, d.inumN, d.cls, d.dt, d.tax, d.taxable].join("|"); if (seen[k]) { dup++; return; } seen[k] = 1; out.push(d); });
    return { docs: out, dup: dup };
  }
  function runRecon(silent) {
    if (silent !== true) silent = false;
    var st = settings(), warns = [];
    if (!S.files2b.length) { toast("Add at least one GSTR-2B file first.", "warn", "MT-GR-002"); return; }
    if (!S.booksParse || S.booksParse.error || !S.booksParse.docs.length) { toast("Add your purchase books file first.", "warn", S.booksParse && S.booksParse.error ? S.booksParse.error : "MT-GR-005"); return; }
    var all2b = []; S.files2b.forEach(function (f) { all2b = all2b.concat(f.docs); f.warnings.forEach(function (w) { warns.push(f.name + ": " + w); }); });
    var dd = dedupe2B(all2b); if (dd.dup) warns.push(dd.dup + " identical GSTR-2B document(s) appeared in more than one file and were counted once.");
    var P = S.period, b2 = dd.docs, bk = S.booksParse.docs;
    if (P.filter2b) b2 = GR.filterDocs(b2, P.from, P.to);
    if (P.filterBooks) bk = GR.filterDocs(bk, P.from, P.to);
    var nodate = bk.filter(function (d) { return !d.dt; }).length; if (nodate) warns.push(nodate + " books entries have no readable date; they are reconciled but skipped by the deadline checks.");
    (S.booksParse.warnings || []).forEach(function (w) { warns.push("Books: " + w); });
    if (S.booksParse && S.booksParse.mapping.paydate === undefined) warns.push("No payment-date column in books, so the Rule 37 180-day check is off. Add a column such as 'Payment Date' to turn it on.");
    S.result = GR.reconcile(b2, bk, { tol: Math.round(st.tolRs * 100), dateWin: st.win });
    S.hasPayCol = S.booksParse.mapping.paydate !== undefined;
    S.warnings = warns; S.filters = { status: "", q: "", limit: 300 };
    if (S.booksParse && S.books && S.books.fp) { var keep = {}; Object.keys(S.books.override || {}).forEach(function (k) { keep[k] = S.books.override[k]; }); if (Object.keys(keep).length) setKV("lay:" + S.books.fp, Object.assign({}, kv("lay:" + S.books.fp, {}), keep)); }
    if (!S.result.statement.ok) toast("The reconciliation statement does not balance.", "error", "MT-GR-007");
    if (!silent) S.tab = "results"; render();
  }
  function loadSample() {
    S.files2b = []; var r = GR.parse2BJson(SM.json2b(), "Sample_GSTR2B_042025.json");
    S.files2b.push({ name: "Sample_GSTR2B_042025.json", docs: r.docs, meta: r.meta, warnings: r.warnings });
    S.books = { name: "Sample_Purchase_Register.xlsx (built-in)", sheets: [{ name: "Purchase Register", aoa: SM.booksAoa() }], sheetIdx: 0, override: {} };
    setPeriod({ fy: 2025, kind: "Month", sub: "04" }); reparseBooks();
    toast("Sample data loaded. The companies are invented.", "ok"); render();
  }
  function templateXlsx() {
    var ws = XLSX.utils.aoa_to_sheet([["Date", "Supplier Name", "Supplier GSTIN", "Invoice No", "Invoice Date", "Document Type", "Taxable Value", "IGST", "CGST", "SGST", "Cess", "Invoice Value", "HSN/SAC", "Ledger", "Payment Date"], ["05-04-2025", "Alpha Traders", SM.S.alpha, "A-001", "05-04-2025", "Invoice", 10000, 0, 900, 900, 0, 11800, "8473", "Purchases", "20-04-2025"]]);
    ws["!cols"] = [14, 28, 18, 14, 14, 14, 14, 10, 10, 10, 8, 14, 10, 20, 14].map(function (w) { return { wch: w }; });
    var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Purchases");
    download("Books_template_GSTR2B_Reco.xlsx", "application/octet-stream", new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]));
  }

  /* ================= UI pieces ================= */
  function btn(label, fn, cls, extra) { return h("button", Object.assign({ class: "btn" + (cls ? " " + cls : ""), type: "button", onclick: fn }, extra || {}), label); }
  function sel(options, value, onchange, id) {
    var s = h("select", { id: id, onchange: function (e) { onchange(e.target.value); } }, options.map(function (o) { return h("option", { value: o[0], selected: String(o[0]) === String(value) }, o[1]); })); return s;
  }
  function statusPill(s, label) { var c = { "Matched": "ok", "Mismatch": "err", "Probable match": "warn", "Not in Books": "err", "Not in 2B": "err", "Amended in 2B": "warn" }[s] || ""; return h("span", { class: "pill " + c, text: label || s }); }
  function stat(k, v, cls) { return h("div", { class: "stat " + (cls || "") }, h("div", { class: "k", text: k }), h("div", { class: "v", text: v })); }
  function pName(n) { return settings().hideNames ? "(hidden)" : n; }

  /* ---------- Upload tab ---------- */
  function tabUpload(main) {
    var P = S.period;
    main.appendChild(h("h2", { text: "Upload and reconcile" }));
    if (S.result) main.appendChild(h("div", { class: "banner" }, h("strong", { text: "Results are ready. " }), "Your last reconciliation (" + periodLabel() + ") is still loaded. ", btn("Open results", function () { S.tab = "results"; render(); }, "small primary", { id: "openres" })));
    var fys = []; for (var y = 2022; y <= 2027; y++) fys.push([y, "FY " + GR.fyLabel(y)]);
    var subSel = null;
    if (P.kind === "Month") subSel = sel(MONTHS, P.sub, function (v) { setPeriod({ sub: v }); render(); }, "p_sub");
    else if (P.kind === "Quarter") subSel = sel([["1", "Q1 (Apr-Jun)"], ["2", "Q2 (Jul-Sep)"], ["3", "Q3 (Oct-Dec)"], ["4", "Q4 (Jan-Mar)"]], P.sub, function (v) { setPeriod({ sub: v }); render(); }, "p_sub");
    main.appendChild(h("div", { class: "card" }, h("h3", { text: "1. Period" }),
      h("div", { class: "toolbar" },
        h("label", { class: "sr", for: "p_fy" }, "Financial year"), sel(fys, P.fy, function (v) { setPeriod({ fy: +v }); render(); }, "p_fy"),
        h("label", { class: "sr", for: "p_kind" }, "Period type"), sel([["Month", "Monthly"], ["Quarter", "Quarterly"], ["Year", "Full year"], ["Custom", "Custom dates"]], P.kind, function (v) { if (v === "Quarter") P.sub = "1"; if (v === "Month") P.sub = "04"; setPeriod({ kind: v }); render(); }, "p_kind"), subSel,
        P.kind === "Custom" ? [h("input", { type: "date", id: "p_from", value: P.from, "aria-label": "From date", onchange: function (e) { P.from = e.target.value; } }), h("input", { type: "date", id: "p_to", value: P.to, "aria-label": "To date", onchange: function (e) { P.to = e.target.value; } })] : h("span", { class: "small", text: GR.fmtDMY(P.from) + " to " + GR.fmtDMY(P.to) })),
      h("div", { class: "toolbar" },
        h("label", null, h("input", { type: "checkbox", id: "p_fb", checked: P.filterBooks, onchange: function (e) { P.filterBooks = e.target.checked; } }), " Keep only books entries dated in this period"),
        h("label", null, h("input", { type: "checkbox", id: "p_f2", checked: P.filter2b, onchange: function (e) { P.filter2b = e.target.checked; } }), " Keep only 2B documents dated in this period")),
      h("p", { class: "small", text: "Tip: a document dated in the last days of a month often appears in the next month's 2B. Leave the 2B filter off and add the next month's 2B file as well to catch those." })));
    // 2B
    var list = S.files2b.length ? h("ul", { class: "files" }, S.files2b.map(function (f) {
      return h("li", null, h("strong", { text: f.name }), " - " + f.docs.length + " documents" + (f.meta && f.meta.period ? ", return period " + f.meta.period : "") + " ", btn("Remove", function () { S.files2b = S.files2b.filter(function (x) { return x !== f; }); S.result = null; render(); }, "small"), f.warnings.map(function (w) { return h("div", { class: "small warnline", text: w }); }));
    })) : h("p", { class: "small", text: "No GSTR-2B file added yet." });
    main.appendChild(h("div", { class: "card" }, h("h3", { text: "2. GSTR-2B or GSTR-2A from the GST portal" }), h("p", { class: "small", text: "JSON, Excel or the .zip exactly as downloaded from the portal (GSTR-2B, or GSTR-2A when 2B is not available). Add more than one file to cover several months; the same document in two files is counted once." }),
      h("input", { type: "file", id: "f2b", accept: ".json,.xlsx,.xls,.csv,.zip", multiple: true, "aria-label": "GSTR-2B or GSTR-2A files", onchange: function (e) { var fs = Array.prototype.slice.call(e.target.files); fs.reduce(function (p, f) { return p.then(function () { return add2B(f); }); }, Promise.resolve()); } }), list));
    // books
    var B = S.books, bookCard = h("div", { class: "card" }, h("h3", { text: "3. Purchase books" }),
      h("p", { class: "small", text: "Excel or CSV from Tally, Busy, or any register with a supplier GSTIN, invoice number, date and tax columns. The column names are recognised automatically; you can change any of them below, and the choice is remembered for this layout." }),
      h("input", { type: "file", id: "fbooks", accept: ".xlsx,.xls,.csv,.zip", "aria-label": "Purchase books file", onchange: function (e) { if (e.target.files[0]) addBooks(e.target.files[0]); } }),
      h("div", { class: "toolbar" }, h("label", null, h("input", { type: "checkbox", id: "itemwise", checked: S.itemWise, onchange: function (e) { S.itemWise = e.target.checked; reparseBooks(); render(); } }), " Item-wise register (add up the lines of one invoice)"), btn("Download books template", templateXlsx, "small")));
    if (B) {
      bookCard.appendChild(h("p", null, h("strong", { text: B.name }), B.sheets.length > 1 ? [" - sheet ", sel(B.sheets.map(function (s, i) { return [i, s.name]; }), B.sheetIdx, function (v) { B.sheetIdx = +v; B.override = {}; reparseBooks(); render(); }, "bsheet")] : ""));
      var bp = S.booksParse;
      if (bp && bp.error) bookCard.appendChild(h("div", { class: "banner err" }, errInfo(bp.error).title + ". " + errInfo(bp.error).action + " ", errChip(bp.error)));
      if (bp && !bp.error) {
        bookCard.appendChild(h("p", { class: "small", text: bp.docs.length + " entries read (header on row " + (bp.headerRow + 1) + ", " + bp.skipped + " blank or total rows skipped)." }));
        var rows = GR.FIELD_ORDER.filter(function (f) { return f !== "rate" && f !== "itcavl" && f !== "reason" && f !== "pos" && f !== "rev"; }).map(function (f) {
          var cur = bp.mapping[f], multi = Array.isArray(cur);
          var opts = [["", "- not in file -"]].concat(bp.headers.map(function (x, i) { return [i, (x || "(blank)") + "  [col " + (i + 1) + "]"]; }));
          if (multi) opts.unshift(["multi", "Sum of " + cur.length + " columns: " + cur.map(function (c) { return bp.headers[c]; }).join(" + ")]);
          var s = sel(opts, multi ? "multi" : (cur === undefined ? "" : cur), function (v) { if (v === "multi") return; B.override[f] = v === "" ? null : +v; reparseBooks(); render(); }, "map_" + f);
          return h("tr", null, h("td", { text: GR.FIELD_LABELS[f] + ((f === "gstin" || f === "inum") ? " *" : "") }), h("td", null, s));
        });
        bookCard.appendChild(h("details", { class: "mapbox", open: !!bp.warnings.length }, h("summary", { text: "Column mapping (" + Object.keys(bp.mapping).length + " columns recognised) - change if needed" }), h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, h("th", { text: "Field" }), h("th", { text: "Column in your file" }))), h("tbody", null, rows)))));
        bp.warnings.forEach(function (w) { bookCard.appendChild(h("div", { class: "banner warn", text: w })); });
        var pv = bp.docs.slice(0, 5);
        bookCard.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, ["GSTIN", "Supplier", "Invoice no", "Date", "Type", "Taxable", "Tax"].map(function (x, i) { return h("th", { class: i > 4 ? "n" : "", text: x }); }))), h("tbody", null, pv.map(function (d) { return h("tr", null, h("td", { text: d.gstin }), h("td", { text: pName(d.name) }), h("td", { text: d.inum }), h("td", { class: "nw", text: GR.fmtDMY(d.dt) }), h("td", { text: d.cls }), h("td", { class: "n", text: inr(d.taxable) }), h("td", { class: "n", text: inr(d.tax) })); })))));
      }
    }
    main.appendChild(bookCard);
    main.appendChild(h("div", { class: "toolbar" }, btn("Reconcile", runRecon, "primary gold", { id: "runbtn" }), btn("Load sample data", loadSample, "", { id: "samplebtn" }), btn("Start fresh", clearSession, "", { id: "freshbtn" }), h("span", { class: "small", text: autoOn() ? "Auto-save is on: your files, period and results are kept in this browser until you press Start fresh. Matching settings are in Master edit." : "Auto-save is off: files and results are lost when you close or refresh this page." })));
  }

  /* ---------- Results ---------- */
  var STATUSES = ["Matched", "Mismatch", "Probable match", "Amended in 2B", "Not in Books", "Not in 2B"];
  function reviewNow() { var R = S.result; return GR.review17(R.docsBooks, decisions(), null, settings().extra17); }
  function needResult(main) { if (S.result) return false; main.appendChild(h("div", { class: "empty" }, h("h2", { text: "No reconciliation yet" }), h("p", { text: "Add the GSTR-2B and your purchase books on the Upload tab and press Reconcile." }), btn("Go to Upload", function () { S.tab = "upload"; render(); }, "primary"))); return true; }
  function stmtTable(R) {
    var st = R.statement, rv = reviewNow(), blocked = rv.blockedTax;
    function r(l, v, cls, note) { return h("tr", { class: cls || "" }, h("td", { text: l }), h("td", { class: "n", text: inr(v) }), h("td", { class: "small", text: note || "" })); }
    return h("div", { class: "tablewrap" }, h("table", { class: "grid stmt", id: "stmt" }, h("thead", null, h("tr", null, h("th", { text: "ITC reconciliation statement (GST, all heads)" }), h("th", { class: "n", text: "Rs" }), h("th", { text: "" }))),
      h("tbody", null,
        r("A. ITC as per GSTR-2B", st.A, "", "All live 2B documents, credit notes deducted"),
        r("B. Less: in 2B, not in books", -st.B, "", "Not yet recorded by you"),
        r("C. Add: in books, not in 2B", st.C, "", "Claimed in books but not reflected in 2B"),
        r("D. Add / (less): difference on matched and mismatched", st.D, "", "Books minus 2B on paired documents"),
        r("E. ITC as per books", st.E, "total", st.ok ? "A - B + C + D = E  (balanced)" : "DOES NOT BALANCE"),
        r("Of A: 2B marks ITC not available", st.notAvl2B, "sub", "Do not claim unless the reason lapses"),
        r("ITC in 2B available to claim (A less the line above)", st.eligible2B, "sub", ""),
        r("Of E: marked blocked under section 17(5)", blocked, "sub", "Your decisions on the 17(5) tab; flags alone are not counted")
      )));
  }
  function tabResults(main) {
    if (needResult(main)) return;
    var R = S.result, f = S.filters;
    main.appendChild(h("h2", { text: "Results - " + periodLabel() }));
    if (S.warnings.length) main.appendChild(h("div", { class: "banner warn" }, h("strong", { text: "Please note: " }), h("ul", null, S.warnings.map(function (w) { return h("li", { text: w }); }))));
    main.appendChild(h("div", { class: "card" }, stmtTable(R)));
    var chips = [h("button", { class: "btn small" + (f.status === "" ? " primary" : ""), type: "button", onclick: function () { f.status = ""; f.limit = 300; render(); } }, "All (" + R.rows.length + ")")];
    STATUSES.forEach(function (s) { var g = R.byStatus[s]; if (!g) return; chips.push(h("button", { class: "btn small" + (f.status === s ? " primary" : ""), type: "button", "data-status": s, onclick: function () { f.status = s; f.limit = 300; render(); } }, s + " (" + g.n + ")")); });
    var q = h("input", { type: "search", id: "srch", placeholder: "Search supplier, GSTIN or invoice no", value: f.q, "aria-label": "Search", oninput: function (e) { f.q = e.target.value; f.limit = 300; clearTimeout(q._t); q._t = setTimeout(function () { renderRows(); }, 200); } });
    main.appendChild(h("div", { class: "grid3" }, STATUSES.filter(function (s) { return R.byStatus[s]; }).map(function (s) { var g = R.byStatus[s]; return stat(s, g.n + " | " + inr(s === "Not in Books" ? g.tax2 : g.taxBk), s === "Matched" ? "" : (s === "Probable match" || s === "Amended in 2B" ? "warn" : "err")); })));
    main.appendChild(h("div", { class: "toolbar" }, chips, q));
    var holder = h("div", { id: "rowsbox" }); main.appendChild(holder);
    function renderRows() {
      var rows = R.rows.filter(function (r) {
        if (f.status && r.status !== f.status) return false;
        if (f.q) { var s = f.q.toLowerCase(), hay = (r.name + " " + r.gstin + " " + r.b2.concat(r.bk).map(function (d) { return d.inum; }).join(" ")).toLowerCase(); if (hay.indexOf(s) < 0) return false; }
        return true;
      });
      holder.innerHTML = "";
      var shown = rows.slice(0, f.limit);
      holder.appendChild(h("p", { class: "small", id: "rowcount", text: rows.length + " row(s)" + (rows.length > shown.length ? ", showing the first " + shown.length : "") }));
      holder.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid", id: "restable" }, h("thead", null, h("tr", null, ["Status", "Supplier", "Doc no. (2B | books)", "Date", "Tax per 2B", "Tax per books", "Difference", "What to check"].map(function (x, i) { return h("th", { class: (i >= 4 && i <= 6) ? "n" : "", text: x }); }))),
        h("tbody", null, shown.map(function (r) {
          var a = r.b2[0], b = r.bk[0], d = r.taxBk - r.tax2;
          return h("tr", { class: "click", tabindex: "0", onclick: function () { rowDetail(r); }, onkeydown: function (e) { if (e.key === "Enter") rowDetail(r); } },
            h("td", null, statusPill(r.status)), h("td", null, h("div", { text: pName(r.name) || "-" }), h("div", { class: "small mono", text: r.gstin || "no GSTIN" })),
            h("td", null, (a ? a.inum : "-") + (r.b2.length > 1 ? " +" + (r.b2.length - 1) : "") + "  |  " + (b ? b.inum : "-") + (r.bk.length > 1 ? " +" + (r.bk.length - 1) : "")),
            h("td", { class: "nw", text: GR.fmtDMY((b || a).dt) }), h("td", { class: "n", text: a ? inr(r.tax2) : "-" }), h("td", { class: "n", text: b ? inr(r.taxBk) : "-" }),
            h("td", { class: "n", text: a && b ? inr(d) : (a ? inr(-r.tax2) : inr(r.taxBk)) }), h("td", { class: "small", text: r.reasons.join("; ") }));
        })))));
      if (rows.length > shown.length) holder.appendChild(btn("Show 300 more", function () { f.limit += 300; renderRows(); }));
    }
    renderRows();
  }
  function rowDetail(r) {
    var fields = [["Supplier", function (d) { return pName(d.name); }], ["GSTIN", function (d) { return d.gstin; }], ["Document no.", function (d) { return d.inum; }], ["Date", function (d) { return GR.fmtDMY(d.dt); }], ["Type", function (d) { return d.cls + (d.sec ? " (" + d.sec + ")" : ""); }], ["Taxable", function (d) { return inr(d.taxable); }], ["IGST", function (d) { return inr(d.igst); }], ["CGST", function (d) { return inr(d.cgst); }], ["SGST/UTGST", function (d) { return inr(d.sgst); }], ["Cess", function (d) { return inr(d.cess); }], ["Total tax", function (d) { return inr(d.tax); }], ["ITC available (2B)", function (d) { return d.itcavl || "-"; }], ["HSN / ledger", function (d) { return (d.hsn || "-") + " / " + (d.ledger || "-"); }]];
    function col(docs) { return docs.length ? docs.map(function (d) { return h("div", null, fields.map(function (fl) { return h("div", { class: "dl" }, h("span", { class: "k", text: fl[0] }), h("span", { text: fl[1](d) })); })); }) : h("p", { class: "small", text: "Not present" }); }
    var rv = GR.flag17(r.bk[0] || r.b2[0], null, settings().extra17);
    modal(r.status + " - " + (r.bk[0] || r.b2[0]).inum, h("div", null,
      h("div", { class: "two" }, h("div", null, h("h3", { text: "GSTR-2B" }), col(r.b2)), h("div", null, h("h3", { text: "Your books" }), col(r.bk))),
      h("h3", { text: "What to check" }), r.reasons.length ? h("ul", null, r.reasons.map(function (x) { return h("li", { text: x }); })) : h("p", { text: "Nothing - values agree within the tolerance." }),
      rv.length ? h("p", { class: "small", text: "Section 17(5) flag: " + rv.map(function (x) { return x.clause + " (" + x.matchedOn + ")"; }).join("; ") + ". This means check it, not that it is blocked." }) : null), [{ label: "Close" }], { wide: true });
  }

  /* ---------- 17(5) ---------- */
  function setBillDecision(doc, v) { var d = JSON.parse(JSON.stringify(decisions())); d.bill = d.bill || {}; d.vendor = d.vendor || {}; if (v) d.bill[GR.billKey(doc)] = v; else delete d.bill[GR.billKey(doc)]; setKV("dec:" + S.clientId, d); render(); }
  function setVendorDecision(g, v) { var d = JSON.parse(JSON.stringify(decisions())); d.bill = d.bill || {}; d.vendor = d.vendor || {}; if (v) d.vendor[g] = v; else delete d.vendor[g]; setKV("dec:" + S.clientId, d); render(); }
  function tab175(main) {
    if (needResult(main)) return;
    var R = S.result, rv = reviewNow();
    main.appendChild(h("h2", { text: "Section 17(5) review" }));
    main.appendChild(h("div", { class: "banner" }, "A flag means this entry may fall under a blocked category, so please check it. It is not a finding that credit is blocked: use, purpose and the exceptions decide. Only entries you mark Blocked are deducted in the statement. Source notes: " + GR.SRC_NOTE));
    main.appendChild(h("div", { class: "grid3" }, stat("Flagged entries", String(rv.items.length)), stat("To review", inr(rv.reviewTax), rv.reviewTax ? "warn" : ""), stat("Marked blocked", inr(rv.blockedTax), rv.blockedTax ? "err" : ""), stat("Marked eligible", inr(rv.eligibleTax))));
    if (!rv.items.length) main.appendChild(h("div", { class: "empty" }, h("p", { text: "No entries matched the 17(5) keyword and HSN rules. You can add your own words on the Master edit tab." })));
    var groups = {};
    rv.items.forEach(function (it) { var c = it.flags.length ? it.flags[0].clause : "Your decision"; (groups[c] = groups[c] || []).push(it); });
    Object.keys(groups).forEach(function (c) {
      var rule = GR.RULES17.filter(function (x) { return x.clause === c; })[0];
      var items = groups[c];
      main.appendChild(h("div", { class: "card" }, h("h3", { text: c + (rule ? " - " + rule.title : "") }), rule ? h("p", { class: "small" }, h("strong", { text: "When ITC is still allowed: " }), rule.allowed) : null,
        h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, ["Supplier", "Invoice", "Date", "GST", "Why flagged", "Decision", "Vendor"].map(function (x, i) { return h("th", { class: i === 3 ? "n" : "", text: x }); }))),
          h("tbody", null, items.map(function (it) {
            var d = it.doc, cur = decisions().bill[GR.billKey(d)] || "";
            return h("tr", null, h("td", null, h("div", { text: pName(d.name) }), h("div", { class: "small mono", text: d.gstin })), h("td", { text: d.inum }), h("td", { class: "nw", text: GR.fmtDMY(d.dt) }), h("td", { class: "n", text: inr(d.tax) }),
              h("td", { class: "small", text: it.flags.map(function (x) { return x.matchedOn + " (" + x.confidence + ")"; }).join("; ") || "your decision" }),
              h("td", null, sel([["", "To review"], ["block", "Blocked"], ["eligible", "Eligible"]], cur, function (v) { setBillDecision(d, v); }, "dec_" + GR.billKey(d).replace(/\W/g, "_"))),
              h("td", null, btn(decisions().vendor[d.gstin] === "block" ? "Vendor: always blocked" : "Always block vendor", function () { setVendorDecision(d.gstin, decisions().vendor[d.gstin] === "block" ? "" : "block"); }, "small"), " ", btn(decisions().vendor[d.gstin] === "eligible" ? "Vendor: always eligible" : "Always eligible", function () { setVendorDecision(d.gstin, decisions().vendor[d.gstin] === "eligible" ? "" : "eligible"); }, "small")));
          }))))));
    });
    var rr = GR.RULES17.map(function (r) { return h("tr", null, h("td", { text: r.clause }), h("td", { text: r.title }), h("td", { text: r.eff }), h("td", { text: r.conf }), h("td", { class: "small", text: r.sourceNote + " Last checked " + GR.fmtDMY(r.verified) + "." })); });
    main.appendChild(h("details", { class: "card" }, h("summary", { text: "Rule register - provisions, effective dates and sources" }), h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, ["Clause", "Provision", "Effective", "Confidence", "Source"].map(function (x) { return h("th", { text: x }); }))), h("tbody", null, rr)))));
  }

  /* ---------- Vendors ---------- */
  var FSTAT = ["Not contacted", "Message sent", "Supplier replied", "Fixed in 2B", "Will not fix"];
  function tabVendors(main) {
    if (needResult(main)) return;
    var R = S.result, vs = GR.vendorSummary(R, S.asOf), fol = follow(), st = settings();
    main.appendChild(h("h2", { text: "Vendor follow-up" }));
    main.appendChild(h("p", { class: "small", text: "ITC at risk is the tax you have booked that 2B does not support: invoices missing from 2B, plus the excess where your books show more than 2B. The follow-up status is saved for this client and stays when you reconcile the next month." }));
    var tot = vs.reduce(function (a, v) { return a + v.atRisk; }, 0);
    main.appendChild(h("div", { class: "grid3" }, stat("Suppliers to chase", String(vs.filter(function (v) { return v.atRisk > 0; }).length)), stat("ITC at risk", inr(tot), tot ? "err" : ""), stat("Fixed or replied", String(vs.filter(function (v) { var s = (fol[v.gstin] || {}).status; return s === "Fixed in 2B" || s === "Supplier replied"; }).length))));
    if (!vs.length) { main.appendChild(h("div", { class: "empty" }, h("p", { text: "Nothing to chase - every document is matched." }))); return; }
    main.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid", id: "vtable" }, h("thead", null, h("tr", null, ["Supplier", "Not in 2B", "Mismatch", "In 2B only", "ITC at risk", "Latest date to claim", "Follow-up", "Note", ""].map(function (x, i) { return h("th", { class: i >= 1 && i <= 4 ? "n" : "", text: x }); }))),
      h("tbody", null, vs.map(function (v) {
        var f = fol[v.gstin] || { status: "Not contacted", note: "" };
        function save(patch) { var all = JSON.parse(JSON.stringify(follow())); all[v.gstin] = Object.assign({ status: "Not contacted", note: "" }, all[v.gstin] || {}, patch, { updated: today() }); setKV("fol:" + S.clientId, all); }
        return h("tr", null, h("td", null, h("div", { text: pName(v.name) || "-" }), h("div", { class: "small mono", text: v.gstin })), h("td", { class: "n", text: v.notIn2B }), h("td", { class: "n", text: v.mismatch }), h("td", { class: "n", text: v.notInBooks }), h("td", { class: "n", text: inr(v.atRisk) }), h("td", { text: v.nextDeadline ? GR.fmtDMY(v.nextDeadline) : "-" }),
          h("td", null, sel(FSTAT.map(function (x) { return [x, x]; }), f.status, function (val) { save({ status: val }); }, "fs_" + v.gstin), f.updated ? h("div", { class: "small", text: "Updated " + GR.fmtDMY(f.updated) }) : null),
          h("td", null, h("input", { value: f.note || "", maxlength: "200", "aria-label": "Note for " + v.gstin, onchange: function (e) { save({ note: e.target.value }); } })),
          h("td", null, v.atRisk > 0 ? btn("Draft message", function () { vendorDraft(v); }, "small") : ""));
      })))));
  }
  function vendorDraft(v) {
    var st = settings(), c = client() || {}, msg = GR.vendorMessage(v, { period: periodLabel(), client: c.name || "", preparedBy: st.preparedBy }, st.template);
    var ta = h("textarea", { rows: "14", id: "msgbox", style: "width:100%" }); ta.value = msg;
    modal("Message to " + pName(v.name || v.gstin), h("div", null, h("p", { class: "small", text: "Edit as needed, then copy. The template can be changed in Master edit." }), ta), [{ label: "Close" }, { label: "Copy", cls: "primary", keep: true, onclick: function () { ta.select(); var done = function () { toast("Message copied.", "ok"); }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(done, function () { try { document.execCommand("copy"); done(); } catch (e) { toast("Select the text and copy it with Ctrl+C.", "warn"); } }); else { try { document.execCommand("copy"); done(); } catch (e) { toast("Select the text and copy it with Ctrl+C.", "warn"); } } return false; } }], { wide: true });
  }

  /* ---------- Deadlines ---------- */
  function atRiskDocs(R) { var out = []; R.rows.forEach(function (r) { if (r.bk.length && (r.status === "Not in 2B" || (r.status === "Mismatch" && r.taxBk > r.tax2))) r.bk.forEach(function (d) { out.push({ doc: d, row: r }); }); }); return out; }
  function tabDeadlines(main) {
    if (needResult(main)) return;
    var R = S.result;
    main.appendChild(h("h2", { text: "Deadlines - section 16(4) and Rule 37" }));
    main.appendChild(h("div", { class: "toolbar" }, h("label", { for: "asof", text: "Check as on" }), h("input", { type: "date", id: "asof", value: S.asOf, onchange: function (e) { if (e.target.value) { S.asOf = e.target.value; render(); } } })));
    main.appendChild(h("div", { class: "banner" }, "Section 16(4): credit for a financial year's invoices and notes cannot be taken after 30 November following that year (earlier if the annual return is filed earlier). Dates below use 30 November; confirm against the Act. " + GR.SRC_NOTE));
    var risk = atRiskDocs(R), dl = GR.deadlines(risk.map(function (x) { return x.doc; }), S.asOf, { soonDays: 45 });
    var passed = dl.filter(function (x) { return x.state === "Passed"; }), soon = dl.filter(function (x) { return x.state === "Due soon"; });
    var sum = function (a) { return a.reduce(function (t, x) { return t + x.doc.tax; }, 0); };
    main.appendChild(h("div", { class: "grid3" }, stat("Past the 16(4) date", inr(sum(passed)) + " (" + passed.length + ")", passed.length ? "err" : ""), stat("Due within 45 days", inr(sum(soon)) + " (" + soon.length + ")", soon.length ? "warn" : ""), stat("Open", String(dl.length - passed.length - soon.length))));
    if (dl.length) {
      dl.sort(function (a, b) { return a.daysLeft - b.daysLeft; });
      main.appendChild(h("div", { class: "card" }, h("h3", { text: "ITC at risk: booked but not supported by 2B" }), h("div", { class: "tablewrap" }, h("table", { class: "grid", id: "dltable" }, h("thead", null, h("tr", null, ["State", "Supplier", "Invoice", "Invoice date", "GST", "Last date (16(4))", "Days left"].map(function (x, i) { return h("th", { class: i >= 4 ? "n" : "", text: x }); }))),
        h("tbody", null, dl.slice(0, 500).map(function (x) { return h("tr", null, h("td", null, h("span", { class: "pill " + (x.state === "Passed" ? "err" : x.state === "Due soon" ? "warn" : "ok"), text: x.state })), h("td", { text: pName(x.doc.name) }), h("td", { class: "nw", text: x.doc.inum }), h("td", { class: "nw", text: GR.fmtDMY(x.doc.dt) }), h("td", { class: "n", text: inr(x.doc.tax) }), h("td", { class: "n", text: GR.fmtDMY(x.deadline) }), h("td", { class: "n", text: x.daysLeft })); }))))));
    } else main.appendChild(h("div", { class: "empty" }, h("p", { text: "No booked-but-unsupported documents with a readable date." })));
    var r37 = GR.rule37(R.docsBooks, S.asOf, !!S.hasPayCol);
    main.appendChild(h("div", { class: "card" }, h("h3", { text: "Rule 37 - 180 days to pay the supplier" }),
      !S.hasPayCol ? h("p", { class: "small", text: "Your books file has no payment-date column, so this check is off. Add a column named 'Payment Date' (blank if unpaid) and upload again." }) : null,
      r37.length ? h("div", { class: "tablewrap" }, h("table", { class: "grid", id: "r37table" }, h("thead", null, h("tr", null, ["Finding", "Supplier", "Invoice", "Invoice date", "GST", "180th day", "What to do"].map(function (x, i) { return h("th", { class: i === 4 ? "n" : "", text: x }); }))), h("tbody", null, r37.map(function (x) { return h("tr", null, h("td", null, h("span", { class: "pill " + (x.kind === "Approaching limit" ? "warn" : "err"), text: x.kind })), h("td", { text: pName(x.doc.name) }), h("td", { class: "nw", text: x.doc.inum }), h("td", { class: "nw", text: GR.fmtDMY(x.doc.dt) }), h("td", { class: "n", text: inr(x.doc.tax) }), h("td", { class: "nw", text: GR.fmtDMY(x.limitDate) }), h("td", { class: "small", text: x.note })); })))) : (S.hasPayCol ? h("p", { text: "No entries are past or near the 180-day limit." }) : null)));
  }

  /* ---------- Reports ---------- */
  function reportModel() {
    var R = S.result, st = settings(), c = client() || {}, rv = reviewNow(), vs = GR.vendorSummary(R, S.asOf), hide = st.hideNames;
    function nm(x) { return hide ? "(hidden)" : x; }
    function line(r) { var a = r.b2[0], b = r.bk[0]; return [r.status, nm(r.name), hide ? r.gstin.slice(0, 2) + "XXXXXXXXXX" + r.gstin.slice(12) : r.gstin, a ? a.inum : "", b ? b.inum : "", GR.fmtDMY((b || a).dt), a ? r.tax2 : null, b ? r.taxBk : null, a && b ? r.taxBk - r.tax2 : null, r.reasons.join("; ")]; }
    return { title: st.title, client: c.name || "", gstin: c.gstin || "", period: periodLabel(), prepared: st.preparedBy, st: R.statement, blocked: rv.blockedTax, review: rv.reviewTax, byStatus: R.byStatus, rows: R.rows.map(line), rv: rv, vs: vs, nm: nm, clauses: st.clauses, asOf: S.asOf, deadlines: GR.deadlines(atRiskDocs(R).map(function (x) { return x.doc; }), S.asOf, { soonDays: 45 }), r37: GR.rule37(R.docsBooks, S.asOf, !!S.hasPayCol) };
  }
  var HEAD = ["Status", "Supplier", "GSTIN", "Doc no (2B)", "Doc no (books)", "Date", "Tax per 2B", "Tax per books", "Difference", "What to check"];
  function rupee(p) { return p === null || p === undefined ? "" : p / 100; }
  function exportXlsx() {
    var m = reportModel(), wb = XLSX.utils.book_new();
    function sheet(name, aoa, widths) { var ws = XLSX.utils.aoa_to_sheet(aoa); ws["!cols"] = (widths || []).map(function (w) { return { wch: w }; }); Object.keys(ws).forEach(function (k) { if (k[0] !== "!" && ws[k].t === "n") ws[k].z = "#,##0.00"; }); XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)); }
    var st = m.st;
    sheet("Summary", [[m.title], ["Client", m.client], ["GSTIN", m.gstin], ["Period", m.period], ["Prepared by", m.prepared], [""], ["ITC reconciliation statement", "Rs"], ["A. ITC as per GSTR-2B", st.A / 100], ["B. Less: in 2B, not in books", -st.B / 100], ["C. Add: in books, not in 2B", st.C / 100], ["D. Add/(less): difference on matched and mismatched", st.D / 100], ["E. ITC as per books", st.E / 100], ["Check A-B+C+D", st.check / 100], ["Of A: 2B marks ITC not available", st.notAvl2B / 100], ["Of E: marked blocked under 17(5)", m.blocked / 100], ["Of E: flagged under 17(5), still to review", m.review / 100], [""], ["Status", "Count", "Tax per 2B", "Tax per books"]].concat(STATUSES.filter(function (s) { return m.byStatus[s]; }).map(function (s) { return [s, m.byStatus[s].n, m.byStatus[s].tax2 / 100, m.byStatus[s].taxBk / 100]; })).concat([[""], ["Notes"]]).concat(m.clauses.split("\n").map(function (x) { return [x]; })), [52, 20, 18, 18]);
    STATUSES.forEach(function (s) { var rows = m.rows.filter(function (r) { return r[0] === s; }); if (!rows.length) return; sheet(s, [HEAD].concat(rows.map(function (r) { var o = r.slice(); o[6] = rupee(o[6]); o[7] = rupee(o[7]); o[8] = rupee(o[8]); return o; })), [14, 28, 18, 16, 16, 12, 14, 14, 14, 70]); });
    sheet("17(5) review", [["Clause", "Supplier", "GSTIN", "Invoice", "Date", "GST", "Why flagged", "Decision"]].concat(m.rv.items.map(function (it) { return [it.flags.map(function (x) { return x.clause; }).join(", "), m.nm(it.doc.name), it.doc.gstin, it.doc.inum, GR.fmtDMY(it.doc.dt), it.doc.tax / 100, it.flags.map(function (x) { return x.matchedOn; }).join("; "), it.state]; })), [16, 28, 18, 16, 12, 14, 40, 12]);
    var fol = follow();
    sheet("Vendor follow-up", [["Supplier", "GSTIN", "Not in 2B", "Mismatch", "In 2B only", "ITC at risk", "Latest date to claim", "Status", "Note"]].concat(m.vs.map(function (v) { var f = fol[v.gstin] || {}; return [m.nm(v.name), v.gstin, v.notIn2B, v.mismatch, v.notInBooks, v.atRisk / 100, v.nextDeadline ? GR.fmtDMY(v.nextDeadline) : "", f.status || "Not contacted", f.note || ""]; })), [28, 18, 10, 10, 10, 14, 16, 16, 40]);
    sheet("Deadlines", [["State", "Supplier", "Invoice", "Invoice date", "GST", "Last date 16(4)", "Days left"]].concat(m.deadlines.map(function (x) { return [x.state, m.nm(x.doc.name), x.doc.inum, GR.fmtDMY(x.doc.dt), x.doc.tax / 100, GR.fmtDMY(x.deadline), x.daysLeft]; })), [10, 28, 16, 12, 14, 14, 10]);
    download("GSTR2B_Reconciliation_" + (m.client || "client").replace(/\W+/g, "_") + "_" + m.period.replace(/\W+/g, "_") + ".xlsx", "application/octet-stream", new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]));
  }
  function reportHTML(m, forWord) {
    function t(rows, head, nums) { return "<table><thead><tr>" + head.map(function (x, i) { return "<th" + (nums && nums.indexOf(i) >= 0 ? " class=n" : "") + ">" + esc(x) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (nums && nums.indexOf(i) >= 0 ? " class=n" : "") + ">" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>"; }
    var st = m.st, body = (window.GR_LOGO && !forWord ? "<img src=\"" + window.GR_LOGO + "\" style=\"height:36px\" alt=\"Techmin Wealth Partners\">" : "") + "<h1>" + esc(m.title) + "</h1><p><b>Client:</b> " + esc(m.client) + " &nbsp; <b>GSTIN:</b> " + esc(m.gstin) + " &nbsp; <b>Period:</b> " + esc(m.period) + (m.prepared ? " &nbsp; <b>Prepared by:</b> " + esc(m.prepared) : "") + "</p>";
    body += "<h2>ITC reconciliation statement</h2>" + t([["A. ITC as per GSTR-2B", inr(st.A)], ["B. Less: in 2B, not in books", inr(-st.B)], ["C. Add: in books, not in 2B", inr(st.C)], ["D. Add / (less): difference on matched and mismatched", inr(st.D)], ["E. ITC as per books", inr(st.E)], ["Of A: 2B marks ITC not available", inr(st.notAvl2B)], ["Of E: marked blocked under section 17(5)", inr(m.blocked)], ["Of E: flagged under 17(5), still to review", inr(m.review)]], ["Item", "Rs"], [1]);
    body += "<h2>Summary by status</h2>" + t(STATUSES.filter(function (s) { return m.byStatus[s]; }).map(function (s) { return [s, m.byStatus[s].n, inr(m.byStatus[s].tax2), inr(m.byStatus[s].taxBk)]; }), ["Status", "Documents", "Tax per 2B", "Tax per books"], [1, 2, 3]);
    var issues = m.rows.filter(function (r) { return r[0] !== "Matched"; });
    body += "<h2>Items to act on (" + issues.length + ")</h2>" + t(issues.slice(0, forWord ? 400 : 1500).map(function (r) { return [r[0], r[1], r[3] + " | " + r[4], r[5], r[6] === null ? "" : inr(r[6]), r[7] === null ? "" : inr(r[7]), r[9]]; }), ["Status", "Supplier", "Doc no (2B | books)", "Date", "2B", "Books", "What to check"], [4, 5]);
    if (m.rv.items.length) body += "<h2>Section 17(5) items</h2><p>Flags are for review; only items marked Blocked are deducted.</p>" + t(m.rv.items.map(function (it) { return [it.flags.map(function (x) { return x.clause; }).join(", "), m.nm(it.doc.name), it.doc.inum, inr(it.doc.tax), it.state]; }), ["Clause", "Supplier", "Invoice", "GST", "Decision"], [3]);
    if (m.vs.length) body += "<h2>ITC at risk by supplier</h2>" + t(m.vs.slice(0, 200).map(function (v) { return [m.nm(v.name), v.gstin, inr(v.atRisk), v.nextDeadline ? GR.fmtDMY(v.nextDeadline) : ""]; }), ["Supplier", "GSTIN", "ITC at risk", "Latest date to claim"], [2]);
    body += "<h2>Notes</h2><ul>" + m.clauses.split("\n").map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    var css = "body{font:11pt Calibri,Arial,sans-serif;color:#111;margin:18px}h1{font-size:17pt;color:#06484B}h2{font-size:13pt;color:#06484B;border-bottom:2px solid #D9A93F;padding-bottom:2px}table{border-collapse:collapse;width:100%;font-size:9pt;margin:6px 0}th,td{border:1px solid #999;padding:3px 5px;vertical-align:top}th{background:#E3EAE5}.n{text-align:right}.foot{font-size:8pt;color:#555;margin-top:18px}@page{size:A4 landscape;margin:12mm}@media print{.noprint{display:none}}";
    return "<!doctype html><html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:w=\"urn:schemas-microsoft-com:office:word\"><head><meta charset=\"utf-8\"><title>" + esc(m.title) + "</title><style>" + css + "</style></head><body>" + (forWord ? "" : "<div class=\"noprint\"><button onclick=\"window.print()\">Print / Save as PDF</button></div>") + body + "<div class=\"foot\">Generated by GSTR-2B Reconciliation v" + VERSION + " (Techmin Wealth Partners) on " + new Date().toLocaleString("en-IN") + ". Calculated in the user's browser; no data was sent anywhere. Working aid only - not legal or tax advice. Test data and legal references need professional review.</div></body></html>";
  }
  function exportPDF() {
    var w = null; try { w = window.open("", "_blank"); } catch (e) {}
    if (!w) { toast("Pop-up blocked. Use 'Word report' or allow pop-ups.", "warn", "MT-GR-010"); return; }
    w.document.open(); w.document.write(reportHTML(reportModel(), false)); w.document.close();
  }
  function exportWord() { var m = reportModel(); download("GSTR2B_Reconciliation_" + (m.client || "client").replace(/\W+/g, "_") + ".doc", "application/msword", "﻿" + reportHTML(m, true)); }
  function tabReports(main) {
    if (needResult(main)) return;
    main.appendChild(h("h2", { text: "Download reports" }));
    main.appendChild(h("div", { class: "card" }, h("p", { text: "Excel has one sheet per status, plus the statement, 17(5) review, vendor follow-up and deadlines. The PDF opens a print page (landscape A4) - choose Save as PDF. The Word file opens in Word for editing." }),
      h("label", null, h("input", { type: "checkbox", id: "hidenames", checked: settings().hideNames, onchange: function (e) { setKV("settings", Object.assign({}, kv("settings", {}), { hideNames: e.target.checked })); render(); } }), " Hide supplier names in screen and downloads (GSTIN stays, partly masked in the sheets)"),
      h("div", { class: "toolbar" }, btn("Excel workbook", exportXlsx, "primary", { id: "dl_xlsx" }), btn("PDF (print)", exportPDF, "", { id: "dl_pdf" }), btn("Word report", exportWord, "", { id: "dl_doc" }))));
  }

  /* ---------- History ---------- */
  function summaryOf(R) { var s = {}; STATUSES.forEach(function (k) { if (R.byStatus[k]) s[k] = R.byStatus[k].n; }); return s; }
  function saveRun() {
    var R = S.result; if (!R) return; var c = client();
    var lbl = h("input", { id: "runlabel", value: (c ? c.name : "") + " " + periodLabel(), maxlength: "120" });
    modal("Save this run", h("div", { class: "form" }, h("div", { class: "fld wide" }, h("label", { for: "runlabel", text: "Name" }), lbl)), [{ label: "Cancel" }, { label: "Save", cls: "primary", onclick: function () {
      var strip = function (d) { var o = Object.assign({}, d); delete o.id; delete o.superseded; return o; };
      var run = { id: uid(), clientId: S.clientId, label: lbl.value.trim() || periodLabel(), created: Date.now(), period: JSON.parse(JSON.stringify(S.period)), periodLabel: periodLabel(), statement: R.statement, counts: summaryOf(R), docs2b: S.result.docs2b.concat(S.result.superseded).map(strip), docsBooks: R.docsBooks.map(strip), hasPayCol: !!S.hasPayCol, files: S.files2b.map(function (f) { return f.name; }), booksName: S.books ? S.books.name : "" };
      S.runs.set(run.id, run); persist("runs", run).then(function () { toast("Run saved.", "ok"); render(); });
    } }]);
  }
  function loadRun(run) {
    var st = settings(); var fix = function (d) { return GR.mkDoc(Object.assign({}, d, { cls: d.cls })); };
    var b2 = run.docs2b.map(function (d) { var o = Object.assign({}, d); return o; }), bk = run.docsBooks.map(function (d) { return Object.assign({}, d); });
    S.period = JSON.parse(JSON.stringify(run.period));
    S.result = GR.reconcile(b2, bk, { tol: Math.round(st.tolRs * 100), dateWin: st.win }); S.hasPayCol = run.hasPayCol; S.warnings = ["Loaded from saved run '" + run.label + "'. The original files are not stored, only the documents read from them."]; S.tab = "results"; render();
  }
  function compareRun(run) {
    var R = S.result; if (!R) { toast("Run the current reconciliation first, then compare.", "warn"); return; }
    var old = GR.reconcile(run.docs2b, run.docsBooks, { tol: Math.round(settings().tolRs * 100), dateWin: settings().win });
    function key(r) { var d = r.bk[0] || r.b2[0]; return d.gstin + "|" + d.inumN + "|" + d.cls; }
    var cur = {}; R.rows.forEach(function (r) { cur[key(r)] = r; });
    var resolved = [], still = [];
    old.rows.forEach(function (r) { if (r.status === "Matched") return; var n = cur[key(r)]; if (!n) resolved.push([r, null]); else if (n.status === "Matched" || n.status === "Probable match") resolved.push([r, n]); else still.push([r, n]); });
    var oldK = {}; old.rows.forEach(function (r) { oldK[key(r)] = 1; });
    var fresh = R.rows.filter(function (r) { return r.status !== "Matched" && !oldK[key(r)]; });
    function li(r, t) { var d = r.bk[0] || r.b2[0]; return h("li", { text: pName(r.name) + " " + d.inum + " - was " + r.status + (t ? ", now " + t.status : ", no longer in the data") }); }
    modal("Compared with '" + run.label + "'", h("div", null, h("p", { text: resolved.length + " earlier open item(s) are now resolved; " + still.length + " are still open; " + fresh.length + " are new." }), h("h3", { text: "Resolved" }), h("ul", null, resolved.slice(0, 100).map(function (x) { return li(x[0], x[1]); })), h("h3", { text: "Still open" }), h("ul", null, still.slice(0, 100).map(function (x) { return li(x[0], x[1]); })), h("h3", { text: "New" }), h("ul", null, fresh.slice(0, 100).map(function (r) { return h("li", { text: pName(r.name) + " " + (r.bk[0] || r.b2[0]).inum + " - " + r.status }); }))), [{ label: "Close" }], { wide: true });
  }
  function tabHistory(main) {
    main.appendChild(h("h2", { text: "Saved runs" }));
    main.appendChild(h("div", { class: "toolbar" }, btn("Save current run", saveRun, "primary", { id: "saverun", disabled: !S.result })));
    var runs = Array.from(S.runs.values()).filter(function (r) { return r.clientId === S.clientId; }).sort(function (a, b) { return b.created - a.created; });
    if (!runs.length) { main.appendChild(h("div", { class: "empty" }, h("p", { text: "No saved runs for this client yet. Save a run to compare later months against it." }))); return; }
    main.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid", id: "runtable" }, h("thead", null, h("tr", null, ["Name", "Period", "Saved on", "Open items", "A: ITC per 2B", "E: ITC per books", ""].map(function (x, i) { return h("th", { class: i >= 4 && i <= 5 ? "n" : "", text: x }); }))),
      h("tbody", null, runs.map(function (r) { var open = Object.keys(r.counts).reduce(function (t, k) { return t + (k === "Matched" ? 0 : r.counts[k]); }, 0); return h("tr", null, h("td", { text: r.label }), h("td", { text: r.periodLabel }), h("td", { text: new Date(r.created).toLocaleDateString("en-IN") }), h("td", { text: String(open) }), h("td", { class: "n", text: inr(r.statement.A) }), h("td", { class: "n", text: inr(r.statement.E) }), h("td", null, btn("Open", function () { loadRun(r); }, "small"), " ", btn("Compare", function () { compareRun(r); }, "small"), " ", btn("Delete", function () { modal("Delete run", h("p", { text: "Delete '" + r.label + "'?" }), [{ label: "Keep" }, { label: "Delete", cls: "danger", onclick: function () { S.runs.delete(r.id); unpersist("runs", r.id); render(); } }]); }, "small danger"))); })))));
  }

  /* ---------- Master edit ---------- */
  function tabMaster(main) {
    var st = settings(), c = client() || {};
    main.appendChild(h("h2", { text: "Master edit" }));
    var f = {
      title: h("input", { id: "m_title", value: st.title, maxlength: "140" }), prep: h("input", { id: "m_prep", value: st.preparedBy, maxlength: "100" }),
      tol: h("input", { id: "m_tol", type: "number", min: "0", max: "100", step: "0.5", value: st.tolRs }), win: h("input", { id: "m_win", type: "number", min: "0", max: "60", step: "1", value: st.win }),
      hide: h("input", { id: "m_hide", type: "checkbox", checked: st.hideNames }), clauses: h("textarea", { id: "m_clauses", rows: "8" }), tpl: h("textarea", { id: "m_tpl", rows: "10" })
    };
    f.clauses.value = st.clauses; f.tpl.value = st.template;
    var extra = {}; GR.RULES17.forEach(function (r) { extra[r.id] = h("textarea", { rows: "2", "aria-label": "Extra words for " + r.clause, value: "" }); extra[r.id].value = (st.extra17[r.id] || []).join(", "); });
    main.appendChild(h("div", { class: "card" }, h("div", { class: "form" },
      h("div", { class: "fld wide" }, h("label", { for: "m_title", text: "Report title" }), f.title),
      h("div", { class: "fld" }, h("label", { text: "Client (change on the top bar)" }), h("input", { value: (c.name || "") + (c.gstin ? " - " + c.gstin : ""), disabled: true })),
      h("div", { class: "fld" }, h("label", { for: "m_prep", text: "Prepared by" }), f.prep),
      h("div", { class: "fld" }, h("label", { for: "m_tol", text: "Amount tolerance (Rs)" }), f.tol, h("small", { text: "Differences up to this amount, per tax head, count as matched." })),
      h("div", { class: "fld" }, h("label", { for: "m_win", text: "Date window (days)" }), f.win, h("small", { text: "Used for 'probable' matches and for date differences." })),
      h("div", { class: "fld chk wide" }, h("label", null, f.hide, " Hide supplier names on screen and in downloads")),
      h("div", { class: "fld wide" }, h("label", { for: "m_clauses", text: "Report notes (one per line)" }), f.clauses),
      h("div", { class: "fld wide" }, h("label", { for: "m_tpl", text: "Vendor message template" }), f.tpl, h("small", { text: "Words in double braces are filled in: {{supplier}} {{gstin}} {{period}} {{list}} {{amount}} {{preparedBy}} {{client}}" }))),
      h("h3", { text: "Your own 17(5) words" }), h("p", { class: "small", text: "Comma-separated words added to the built-in list. They are matched against supplier name and ledger name." }),
      h("div", { class: "form" }, GR.RULES17.map(function (r) { return h("div", { class: "fld" }, h("label", { text: r.clause + " " + r.title }), extra[r.id]); })),
      h("div", { class: "toolbar" }, btn("Save master settings", function () {
        var e17 = {}; GR.RULES17.forEach(function (r) { var w = extra[r.id].value.split(",").map(function (x) { return x.trim(); }).filter(Boolean); if (w.length) e17[r.id] = w; });
        var tol = parseFloat(f.tol.value), win = parseInt(f.win.value, 10);
        if (!isFinite(tol) || tol < 0 || tol > 100) { toast("Tolerance must be between 0 and 100 rupees.", "error", "MT-GR-011"); return; }
        if (!isFinite(win) || win < 0 || win > 60) { toast("Date window must be between 0 and 60 days.", "error", "MT-GR-011"); return; }
        setKV("settings", { title: f.title.value.trim() || SETTINGS_DEFAULT.title, preparedBy: f.prep.value.trim(), tolRs: tol, win: win, hideNames: f.hide.checked, clauses: f.clauses.value, template: f.tpl.value, extra17: e17 }).then(function () { toast("Settings saved. Run the reconciliation again to apply the new tolerance.", "ok"); });
      }, "primary", { id: "m_save" }), btn("Restore defaults", function () { setKV("settings", {}); render(); }, ""))));
  }

  /* ---------- Backup ---------- */
  function fnv(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); }
  function backupData() { var data = { clients: Array.from(S.clients.values()), runs: Array.from(S.runs.values()), kv: Object.keys(S.kv).filter(function (k) { return k.indexOf("draft:") !== 0; }).map(function (k) { return { key: k, value: S.kv[k] }; }) }; var body = JSON.stringify(data); return JSON.stringify({ schema: 1, app: "gstr2b-reco", version: VERSION, created: new Date().toISOString(), checksum: fnv(body), data: data }); }
  function tabBackup(main) {
    main.appendChild(h("h2", { text: "Backup and restore" }));
    main.appendChild(h("div", { class: "card" }, h("p", { text: "Everything is stored in this browser only. Download a backup regularly, especially before clearing browser data or changing computer." }),
      h("div", { class: "toolbar" }, btn("Download backup", function () { download("GSTR2B-Reco-backup-" + today() + ".json", "application/json", backupData()); toast("Backup downloaded.", "ok"); }, "primary", { id: "bk_dl" }),
        h("input", { type: "file", id: "bk_file", accept: ".json", "aria-label": "Backup file", onchange: function (e) {
          var file = e.target.files[0]; if (!file) return; var fr = new FileReader();
          fr.onload = function () {
            try {
              var o = JSON.parse(fr.result); if (o.app !== "gstr2b-reco" || o.schema !== 1 || fnv(JSON.stringify(o.data)) !== o.checksum) throw 1;
              modal("Restore backup", h("p", { text: "This adds " + o.data.clients.length + " client(s) and " + o.data.runs.length + " saved run(s) from the backup. Items with the same id are replaced; nothing else is removed." }), [{ label: "Cancel" }, { label: "Restore", cls: "primary", onclick: function () {
                o.data.clients.forEach(function (c) { S.clients.set(c.id, c); persist("clients", c); }); o.data.runs.forEach(function (r) { S.runs.set(r.id, r); persist("runs", r); }); o.data.kv.forEach(function (x) { setKV(x.key, x.value); });
                if (!S.clientId) S.clientId = Array.from(S.clients.keys())[0] || null; toast("Backup restored.", "ok"); render();
              } }]);
            } catch (x) { toast("That is not a valid backup file.", "error", "MT-GR-008"); }
          }; fr.readAsText(file);
        } }))));
  }

  /* ---------- Help / docs ---------- */
  function openDoc(which, anchor) {
    var pages = [["guide", "User guide"], ["errors", "Error codes"], ["rules", "Rules and sources"], ["release", "Release notes"], ["privacy", "Privacy"]];
    var body = h("div", null), cur = which;
    function paint() {
      body.innerHTML = ""; body.appendChild(h("div", { class: "docnav" }, pages.map(function (p) { return h("button", { class: "btn small" + (p[0] === cur ? " primary" : ""), type: "button", onclick: function () { cur = p[0]; paint(); } }, p[1]); })));
      var d = h("div", { class: "doc", id: "docbody" });
      if (cur === "errors") d.innerHTML = errorsHTML(); else if (cur === "rules") d.innerHTML = rulesHTML(); else d.innerHTML = DOCS[cur] || "<p>Not available.</p>";
      d.querySelectorAll("tr[id]").forEach(function (r) { r.style.scrollMarginTop = "8px"; });
      body.appendChild(d);
      if (anchor && cur === "errors") { var el = d.querySelector("#" + anchor); if (el) el.scrollIntoView(); }
    }
    paint(); modal("Help", body, [{ label: "Close" }], { wide: true });
  }
  function errorsHTML() {
    var keys = Object.keys(GR.ERRORS).concat(["MT-GR-009", "MT-GR-010", "MT-GR-011", "MT-DBS-001", "MT-DBS-002", "MT-DBS-003"]);
    var o = DOCMETA("Error Codes and Resolutions") + "<p>Every message that carries a code is listed below with its meaning, likely cause and the action to take. Click a code in any message to come to its entry.</p><table><thead><tr><th>Code</th><th>Meaning</th><th>Possible cause</th><th>Action</th></tr></thead><tbody>";
    keys.forEach(function (k) { var e = GR.ERRORS[k] || EXTRA_ERR[k]; if (!e) return; o += "<tr id=\"" + k + "\"><td class=\"cd\">" + k + "</td><td>" + esc(e.title) + "</td><td>" + esc(e.cause) + "</td><td>" + esc(e.action) + "</td></tr>"; });
    return o + "</tbody></table>";
  }
  function DOCMETA(t) { return "<h1>" + esc(t) + "</h1><p class=\"meta\">GSTR-2B Reconciliation &middot; Version " + VERSION + " &middot; 12 November 2026 &middot; Techmin Wealth Partners</p>"; }
  var EXTRA_ERR = {
    "MT-GR-009": { title: "File is too large", cause: "The file is over 40 MB.", action: "Split the period into smaller files (for example one month each) and add them one by one." },
    "MT-GR-010": { title: "Pop-up blocked", cause: "The browser blocked the print window.", action: "Allow pop-ups for this page, or use the Word report." },
    "MT-GR-011": { title: "Setting out of range", cause: "Tolerance must be 0 to 100 rupees and the date window 0 to 60 days.", action: "Enter a value inside the range." },
    "MT-DBS-001": { title: "This browser cannot store data", cause: "IndexedDB is not available (private window or restricted browser).", action: "Open the tool in a normal browser window. You can still reconcile and download reports, but nothing is saved." },
    "MT-DBS-002": { title: "Storage could not be opened", cause: "The browser refused to open its database.", action: "Close other tabs of this tool and reload. If it persists, free up browser storage." },
    "MT-DBS-003": { title: "Could not save", cause: "The browser storage is full or blocked.", action: "Download a backup now, free some space, then retry." }
  };
  function rulesHTML() { var o = DOCMETA("Rules and Sources") + "<p><b>Important:</b> " + esc(GR.SRC_NOTE) + " Last checked " + GR.fmtDMY(GR.VERIFIED_ON) + ".</p>"; o += "<h2>Provisions used</h2><ul><li>Section 16(2)(aa) with Rule 36(4) CGST Rules - credit only as in GSTR-2B.</li><li>Section 16(4) CGST Act - 30 November following the financial year, or the annual return date if earlier.</li><li>Rule 37 CGST Rules - 180 days to pay the supplier.</li><li>Rule 37A CGST Rules - reversal where the supplier has not filed GSTR-3B.</li><li>Section 17(5) CGST Act - blocked credits (table below).</li></ul><h2>Section 17(5) register</h2><table><tr><th>Clause</th><th>Subject</th><th>Provision</th><th>Effective</th><th>Words and HSN used</th><th>When credit is still allowed</th></tr>"; GR.RULES17.forEach(function (r) { o += "<tr><td>" + esc(r.clause) + "</td><td>" + esc(r.title) + "</td><td>" + esc(r.prov) + "</td><td>" + esc(r.eff) + "</td><td>" + esc(r.kw.join(", ")) + (r.hsn.length ? "; HSN " + esc(r.hsn.join(", ")) : "") + "</td><td>" + esc(r.allowed) + "</td></tr>"; }); return o + "</table>"; }


  /* ================= auto-save of the working session ================= */
  var asTimer = null;
  function autoOn() { return kv("autosave", true) !== false; }
  function snapshot() {
    if (!S.clientId || (!S.files2b.length && !S.books)) return null;
    return { at: Date.now(), period: S.period, itemWise: S.itemWise, ran: !!S.result, asOf: S.asOf, files2b: S.files2b, books: S.books };
  }
  var lastSig = "";
  function sig() { return JSON.stringify([S.clientId, S.period, S.itemWise, !!S.result, S.asOf, S.files2b.map(function (f) { return f.name + ":" + f.docs.length; }), S.books ? [S.books.name, S.books.sheetIdx, S.books.override] : null]); }
  function flushAutosave() {
    clearTimeout(asTimer);
    if (!autoOn() || !S.clientId) return;
    var snap = snapshot(), key = "draft:" + S.clientId;
    if (snap) { lastSig = sig(); setKV(key, snap); }
  }
  function scheduleAutosave() {
    if (!autoOn() || !S.ready || !S.clientId) return;
    if (sig() === lastSig) return;
    clearTimeout(asTimer);
    setStatus("dirty", "Auto-save pending…");
    asTimer = setTimeout(function () {
      var snap = snapshot(), key = "draft:" + S.clientId; lastSig = sig();
      if (!snap) { if (S.kv[key]) { delete S.kv[key]; unpersist("kv", key); } else setStatus("clean"); return; }
      setKV(key, snap);
    }, 900);
  }
  function restoreSession() {
    S.files2b = []; S.books = null; S.booksParse = null; S.result = null;
    var d = autoOn() && S.clientId ? kv("draft:" + S.clientId, null) : null;
    if (!d) return false;
    S.period = d.period; S.itemWise = !!d.itemWise; S.files2b = d.files2b || []; S.books = d.books || null; if (d.asOf) S.asOf = d.asOf;
    S.tab = "upload";
    if (S.books) reparseBooks();
    if (d.ran && S.files2b.length && S.booksParse && !S.booksParse.error) { runRecon(true); }
    S.restoredAt = d.at; return true;
  }
  function clearSession() {
    S.files2b = []; S.books = null; S.booksParse = null; S.result = null; S.warnings = [];
    var key = "draft:" + S.clientId; if (S.kv[key]) { delete S.kv[key]; unpersist("kv", key); }
    render();
  }

  /* ================= shell ================= */

  /* ================= Sales register vs GSTR-1 ================= */
  var G1 = { files: [], sales: null, salesParse: null, result: null, f: { status: "", q: "", limit: 300 }, warns: [], range: null };
  var G1LAB = { "Not in 2B": "Not in GSTR-1", "Not in Books": "Not in sales register", "Amended in 2B": "Amended in GSTR-1" };
  function g1lab(x) { return G1LAB[x] || x; }
  function g1text(t) { return String(t).replace(/\b2B\b/g, "GSTR-1").replace(/\bbooks\b/g, "sales register"); }
  function bestSheet(sheets) { var best = 0, bs = -1; sheets.forEach(function (sh, i) { var hr = GR.findHeaderRow(sh.aoa); var n = hr >= 0 ? sh.aoa.length : -1; if (n > bs) { bs = n; best = i; } }); return sheets[best]; }
  function addGstr1(file0) { return eachFile(file0, addGstr11); }
  function addGstr11(file) {
    if (file.size > 40 * 1024 * 1024) { toast("File is larger than 40 MB.", "error", "MT-GR-009"); return Promise.resolve(); }
    return readBuf(file).then(function (buf) {
      var res;
      if (/\.json$/i.test(file.name)) res = GR.parseReturnJson(new TextDecoder("utf-8").decode(buf), file.name, "GSTR1");
      else { var sh = bestSheet(workbookSheets(buf)); res = sh ? GR.parseTable(sh.aoa, { src: "G1", mapping: {}, itemWise: false, fileName: file.name, sheetName: sh.name }) : { error: "MT-GR-010" }; }
      if (res.error) { toast("Could not read " + file.name + ": " + errInfo(res.error).title, "error", res.error); return; }
      G1.files = G1.files.filter(function (x) { return x.name !== file.name; });
      G1.files.push({ name: file.name, docs: res.docs, warnings: res.warnings || [] });
      G1.result = null; toast(file.name + ": " + res.docs.length + " GSTR-1 documents read.", "ok"); render();
    }, function () { toast("The file could not be read.", "error", "MT-GR-002"); });
  }
  function addSalesBooks(file0) { return eachFile(file0, addSalesBooks1); }
  function addSalesBooks1(file) {
    if (file.size > 40 * 1024 * 1024) { toast("File is larger than 40 MB.", "error", "MT-GR-009"); return Promise.resolve(); }
    return readBuf(file).then(function (buf) {
      var sh = bestSheet(workbookSheets(buf)); if (!sh) { toast("No sheet found in the file.", "error", "MT-GR-003"); return; }
      var res = GR.parseTable(sh.aoa, { src: "BOOKS", mapping: {}, itemWise: false, fileName: file.name, sheetName: sh.name });
      if (res.error) { toast("Could not read " + file.name + ": " + errInfo(res.error).title, "error", res.error); return; }
      G1.sales = { name: file.name }; G1.salesParse = res; G1.result = null; toast(file.name + ": " + res.docs.length + " sales entries read.", "ok"); render();
    }, function () { toast("The file could not be read.", "error", "MT-GR-002"); });
  }
  function runG1() {
    if (!G1.files.length) { toast("Add a GSTR-1 file first.", "warn", "MT-GR-010"); return; }
    if (!G1.salesParse || !G1.salesParse.docs.length) { toast("Add your sales register first.", "warn", "MT-GR-005"); return; }
    var st = settings(), warns = [], all = [];
    G1.files.forEach(function (f) { all = all.concat(f.docs); f.warnings.forEach(function (w) { warns.push(f.name + ": " + w); }); });
    var dd = dedupe2B(all); if (dd.dup) warns.push(dd.dup + " identical GSTR-1 document(s) appeared in more than one file and were counted once.");
    var sales = G1.salesParse.docs, dts = dd.docs.map(function (d) { return d.dt; }).filter(Boolean).sort();
    var scope = document.getElementById("g1scope");
    if (dts.length && (!scope || scope.checked)) {
      var from = dts[0].slice(0, 8) + "01", e = dts[dts.length - 1], y = +e.slice(0, 4), m = +e.slice(5, 7), last = new Date(Date.UTC(y, m, 0)).getUTCDate(), to = e.slice(0, 8) + ("0" + last).slice(-2);
      var before = sales.length; sales = GR.filterDocs(sales, from, to); G1.range = GR.fmtDMY(from) + " to " + GR.fmtDMY(to);
      if (before !== sales.length) warns.push((before - sales.length) + " sales entries dated outside " + G1.range + " (the span of the GSTR-1 documents) were left out of the comparison.");
    } else G1.range = null;
    (G1.salesParse.warnings || []).forEach(function (w) { warns.push("Sales register: " + w); });
    G1.result = GR.reconcile(dd.docs, sales, { tol: Math.round(st.tolRs * 100), dateWin: st.win });
    G1.warns = warns; G1.f = { status: "", q: "", limit: 300 }; render();
  }
  function g1Customers(R) {
    var m = {};
    R.rows.forEach(function (r) {
      var d = r.b2[0] || r.bk[0], k = r.gstin || "-"; var o = m[k] = m[k] || { gstin: k === "-" ? "" : k, name: d ? d.name : "", n: 0, ok: 0, mm: 0, nog1: 0, nobk: 0, diff: 0 };
      if (!o.name && d && d.name) o.name = d.name;
      o.n++; if (r.status === "Matched" || r.status === "Probable match") o.ok++; else if (r.status === "Mismatch") o.mm++; else if (r.status === "Not in 2B") o.nog1++; else if (r.status === "Not in Books") o.nobk++;
      o.diff += r.taxBk - r.tax2;
    });
    return Object.keys(m).map(function (k) { return m[k]; }).filter(function (o) { return o.mm || o.nog1 || o.nobk; }).sort(function (a, b) { return Math.abs(b.diff) - Math.abs(a.diff); });
  }
  function exportG1() {
    var R = G1.result; if (!R) return;
    var wb = XLSX.utils.book_new();
    function sheet(name, aoa, w) { var ws = XLSX.utils.aoa_to_sheet(aoa); ws["!cols"] = (w || []).map(function (x) { return { wch: x }; }); XLSX.utils.book_append_sheet(wb, ws, name); }
    var sm = [["Sales register vs GSTR-1 reconciliation"], ["Client", (client() ? client().name : "")], ["GSTR-1 files", G1.files.map(function (f) { return f.name; }).join("; ")], ["Sales register", G1.sales ? G1.sales.name : ""], ["Compared period", G1.range || "All entries"], [], ["Status", "Documents", "Tax per GSTR-1 (Rs)", "Tax per sales register (Rs)"]];
    Object.keys(R.byStatus).forEach(function (k) { var g = R.byStatus[k]; sm.push([g1lab(k), g.n, g.tax2 / 100, g.taxBk / 100]); });
    sheet("Summary", sm, [34, 12, 22, 26]);
    var cu = [["Customer", "GSTIN", "Documents", "Matched", "Mismatch", "Not in GSTR-1", "Not in sales register", "Tax difference (sales - GSTR-1) Rs"]];
    g1Customers(R).forEach(function (o) { cu.push([o.name, o.gstin, o.n, o.ok, o.mm, o.nog1, o.nobk, o.diff / 100]); });
    sheet("Customer-wise", cu, [34, 18, 10, 10, 10, 14, 18, 30]);
    var iv = [["Status", "Customer", "GSTIN", "Invoice (GSTR-1)", "Invoice (sales register)", "Date", "Taxable per GSTR-1", "Taxable per sales", "Tax per GSTR-1", "Tax per sales", "Difference", "What to check"]];
    R.rows.forEach(function (r) { var a = r.b2[0], b = r.bk[0]; iv.push([g1lab(r.status), (a || b).name, r.gstin, a ? a.inum : "", b ? b.inum : "", GR.fmtDMY((b || a).dt), a ? sumD(r.b2, "taxable") / 100 : "", b ? sumD(r.bk, "taxable") / 100 : "", r.tax2 / 100, r.taxBk / 100, (r.taxBk - r.tax2) / 100, g1text(r.reasons.join("; "))]); });
    sheet("Invoice-wise", iv, [18, 30, 18, 18, 18, 12, 16, 16, 14, 14, 14, 60]);
    var out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    download("Sales_vs_GSTR1_" + today() + ".xlsx", "application/octet-stream", new Blob([out]));
  }
  function sumD(a, f) { var t = 0; a.forEach(function (d) { t += d[f]; }); return t; }
  function tabSales(main) {
    main.appendChild(h("h2", { text: "Sales register vs GSTR-1" }));
    main.appendChild(h("p", { class: "small", text: "Check what you sold against what you reported in GSTR-1, before you file or amend. Missing invoices, wrong tax amounts and wrong GSTINs show up here. Your files stay in this browser." }));
    var f1 = h("input", { type: "file", id: "fg1", accept: ".json,.xlsx,.xls,.csv,.zip", multiple: true, "aria-label": "GSTR-1 files", onchange: function (e) { var fs = Array.prototype.slice.call(e.target.files), i = 0; (function next() { if (i < fs.length) addGstr1(fs[i++]).then(next); })(); } });
    var f2 = h("input", { type: "file", id: "fsales", accept: ".xlsx,.xls,.csv,.zip", "aria-label": "Sales register file", onchange: function (e) { if (e.target.files[0]) addSalesBooks(e.target.files[0]); } });
    main.appendChild(h("div", { class: "grid2" },
      h("div", { class: "card" }, h("h3", { text: "1. GSTR-1" }), h("p", { class: "small", text: "GSTR-1 JSON from the GST portal (B2B, credit/debit notes and B2CL are matched invoice by invoice). One file per month; add several for a longer period. A GSTR-1 Excel file also works." }), f1,
        h("ul", { id: "g1files" }, G1.files.map(function (f) { return h("li", null, f.name + " - " + f.docs.length + " documents ", btn("Remove", function () { G1.files = G1.files.filter(function (x) { return x !== f; }); G1.result = null; render(); }, "small")); }))),
      h("div", { class: "card" }, h("h3", { text: "2. Sales register" }), h("p", { class: "small", text: "Excel or CSV from Tally, Busy or any software, with customer GSTIN, invoice number, date, taxable value and tax columns. The columns are recognised automatically." }), f2,
        G1.sales ? h("p", { id: "g1sales", text: G1.sales.name + " - " + G1.salesParse.docs.length + " entries" }) : h("p", { class: "small", text: "No sales register added yet." }))));
    main.appendChild(h("div", { class: "toolbar" }, h("label", null, h("input", { type: "checkbox", id: "g1scope", checked: true }), " Compare only the sales entries inside the GSTR-1 period (recommended)"), btn("Compare sales with GSTR-1", runG1, "primary gold", { id: "g1run" })));
    var R = G1.result; if (!R) return;
    var f = G1.f;
    if (G1.warns.length) main.appendChild(h("div", { class: "banner warn" }, h("strong", { text: "Please note: " }), h("ul", null, G1.warns.map(function (w) { return h("li", { text: w }); }))));
    main.appendChild(h("div", { class: "grid3", id: "g1stats" }, STATUSES.filter(function (x) { return R.byStatus[x]; }).map(function (x) { var g = R.byStatus[x]; return stat(g1lab(x), g.n + " | " + inr(x === "Not in Books" ? g.tax2 : g.taxBk), x === "Matched" ? "" : (x === "Probable match" || x === "Amended in 2B" ? "warn" : "err")); })));
    var cust = g1Customers(R);
    if (cust.length) main.appendChild(h("div", { class: "card" }, h("h3", { text: "Customers to look at (largest tax difference first)" }), h("div", { class: "tablewrap" }, h("table", { class: "grid", id: "g1cust" }, h("thead", null, h("tr", null, ["Customer", "GSTIN", "Docs", "Mismatch", "Not in GSTR-1", "Not in sales register", "Tax difference"].map(function (x, i) { return h("th", { class: i >= 2 ? "n" : "", text: x }); }))),
      h("tbody", null, cust.slice(0, 50).map(function (o) { return h("tr", { class: "click", tabindex: "0", onclick: function () { f.q = o.gstin || o.name; f.status = ""; render(); }, onkeydown: function (e) { if (e.key === "Enter") { f.q = o.gstin || o.name; render(); } } }, h("td", { text: pName(o.name) || "-" }), h("td", { class: "mono small", text: o.gstin || "no GSTIN" }), h("td", { class: "n", text: o.n }), h("td", { class: "n", text: o.mm }), h("td", { class: "n", text: o.nog1 }), h("td", { class: "n", text: o.nobk }), h("td", { class: "n", text: inr(o.diff) })); }))))));
    var chips = [h("button", { class: "btn small" + (f.status === "" ? " primary" : ""), type: "button", onclick: function () { f.status = ""; f.limit = 300; render(); } }, "All (" + R.rows.length + ")")];
    STATUSES.forEach(function (x) { var g = R.byStatus[x]; if (!g) return; chips.push(h("button", { class: "btn small" + (f.status === x ? " primary" : ""), type: "button", "data-status": x, onclick: function () { f.status = x; f.limit = 300; render(); } }, g1lab(x) + " (" + g.n + ")")); });
    var q = h("input", { type: "search", id: "g1q", placeholder: "Search customer, GSTIN or invoice no", value: f.q, "aria-label": "Search", oninput: function (e) { f.q = e.target.value; f.limit = 300; clearTimeout(q._t); q._t = setTimeout(rows, 200); } });
    main.appendChild(h("div", { class: "toolbar" }, chips, q, btn("Download Excel", exportG1, "", { id: "g1xlsx" })));
    var holder = h("div", { id: "g1rows" }); main.appendChild(holder);
    function rows() {
      var list = R.rows.filter(function (r) { if (f.status && r.status !== f.status) return false; if (f.q) { var hay = ((r.name || "") + " " + r.gstin + " " + r.b2.concat(r.bk).map(function (d) { return d.inum; }).join(" ")).toLowerCase(); if (hay.indexOf(f.q.toLowerCase()) < 0) return false; } return true; });
      holder.innerHTML = ""; var shown = list.slice(0, f.limit);
      holder.appendChild(h("p", { class: "small", id: "g1count", text: list.length + " row(s)" + (list.length > shown.length ? ", showing the first " + shown.length : "") }));
      holder.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid", id: "g1table" }, h("thead", null, h("tr", null, ["Status", "Customer", "Invoice (GSTR-1 | sales)", "Date", "Tax per GSTR-1", "Tax per sales", "Difference", "What to check"].map(function (x, i) { return h("th", { class: (i >= 4 && i <= 6) ? "n" : "", text: x }); }))),
        h("tbody", null, shown.map(function (r) { var a = r.b2[0], b = r.bk[0], d = r.taxBk - r.tax2;
          return h("tr", null, h("td", null, statusPill(r.status, g1lab(r.status))), h("td", null, h("div", { text: pName((a || b).name) || "-" }), h("div", { class: "small mono", text: r.gstin || "no GSTIN" })),
            h("td", { text: (a ? a.inum : "-") + "  |  " + (b ? b.inum : "-") }), h("td", { class: "nw", text: GR.fmtDMY((b || a).dt) }), h("td", { class: "n", text: a ? inr(r.tax2) : "-" }), h("td", { class: "n", text: b ? inr(r.taxBk) : "-" }), h("td", { class: "n", text: a && b ? inr(d) : (a ? inr(-r.tax2) : inr(r.taxBk)) }), h("td", { class: "small", text: g1text(r.reasons.join("; ")) })); })))));
      if (list.length > shown.length) holder.appendChild(btn("Show 300 more", function () { f.limit += 300; rows(); }));
    }
    rows();
  }
  var TABS = [["upload", "Upload", tabUpload], ["results", "Results", tabResults], ["s175", "17(5) review", tab175], ["vendors", "Vendor follow-up", tabVendors], ["sales", "Sales vs GSTR-1", tabSales], ["deadlines", "Deadlines", tabDeadlines], ["reports", "Download", tabReports], ["history", "Saved runs", tabHistory], ["master", "Master edit", tabMaster], ["backup", "Backup", tabBackup]];
  function feedbackForm() {
    var kind = h("select", { id: "fb_kind" }, [["Suggestion", "Suggestion or new feature"], ["Problem", "Something is not working"], ["Legal", "A legal rule or match looks wrong"], ["Other", "Other"]].map(function (o) { return h("option", { value: o[0], text: o[1] }); }));
    var code = h("input", { id: "fb_code", maxlength: "20", placeholder: "e.g. MT-GR-003" }), name = h("input", { id: "fb_name", maxlength: "80" }), contact = h("input", { id: "fb_contact", maxlength: "80" }), msg = h("textarea", { id: "fb_msg", rows: "6" }), err = h("div", { class: "ferr" });
    function text() { return ["GSTR-2B Reconciliation feedback", "Version: " + VERSION, "Type: " + kind.value, "Error code: " + (code.value || "-"), "Name: " + (name.value || "-"), "Contact: " + (contact.value || "-"), "Browser: " + navigator.userAgent, "Date: " + new Date().toLocaleString("en-IN"), "", msg.value].join("\n"); }
    function ok() { if (msg.value.trim().length < 5) { err.textContent = "Please write a few words about your feedback (at least 5 characters)."; return false; } return true; }
    modal("Give feedback to Techmin", h("div", { class: "form" }, h("div", { class: "fld wide" }, err), h("div", { class: "fld wide" }, h("label", { for: "fb_kind", text: "What is this about?" }), kind), h("div", { class: "fld" }, h("label", { for: "fb_code", text: "Error code (if any)" }), code), h("div", { class: "fld" }, h("label", { for: "fb_name", text: "Your name (optional)" }), name), h("div", { class: "fld wide" }, h("label", { for: "fb_contact", text: "E-mail or phone for a reply (optional)" }), contact), h("div", { class: "fld wide" }, h("label", { for: "fb_msg", text: "Your message" }), msg, h("small", { text: "Do not type passwords. Your invoice data is never added automatically. Press Open feedback form to send it through the Techmin Google Form (needs internet). If you are offline, fill this page and use Save as file, then e-mail the file to info@techmincsc.in." }))),
      [{ label: "Cancel" }, { label: "Save as file", keep: true, onclick: function () { if (!ok()) return false; download("GSTR2B-Reco-feedback.txt", "text/plain;charset=utf-8", text()); toast("Saved. Attach it to an e-mail to info@techmincsc.in.", "ok"); return false; } }, { label: "Open feedback form", cls: "primary", keep: true, onclick: function (close) { window.open("https://docs.google.com/forms/d/e/1FAIpQLSf1lMZOQm6WtFvmR8RrpS4e2qsafQ3D9LWyldGkcmGKRoaY1g/viewform", "_blank", "noopener"); toast("The Techmin feedback form opened in a new tab.", "ok"); close(); } }], { wide: true });
  }
  function shell() {
    document.body.innerHTML = "";
    document.body.appendChild(h("a", { class: "skip", href: "#main" }, "Skip to content"));
    document.body.appendChild(h("header", { class: "top" },
      h("div", { class: "row1" }, h("div", { class: "brand" }, window.GR_LOGO ? h("img", { class: "tlogo", src: window.GR_LOGO, alt: "Techmin Wealth Partners" }) : h("span", { class: "logo" }, "T"), h("div", null, h("strong", { text: "GSTR-2B Reconciliation" }), h("span", { class: "app", text: "ComplyPro tools by Techmin" }), h("span", { class: "ver", text: "v" + VERSION }))),
        h("div", { class: "co" }, h("label", { class: "sr", for: "clientsel" }, "Client"), h("select", { id: "clientsel", onchange: function (e) { flushAutosave(); S.clientId = e.target.value; restoreSession(); lastSig = sig(); try { localStorage.setItem("gr-client", S.clientId); } catch (x) {} render(); } }), btn("+ Client", function () { clientForm(null); }, "small", { id: "addclient" }), btn("Edit", function () { clientForm(client()); }, "small", { id: "editclient" }), btn("Delete", deleteClient, "small danger", { id: "delclient" })),
        h("div", { class: "savebox" }, h("span", { id: "savedot", class: "dot init" }), h("span", { id: "savestatus", "aria-live": "polite" }, "Starting…"), h("label", { class: "autosw", title: "Keep your files, period and results in this browser so they are still here after a refresh or restart" }, h("input", { type: "checkbox", id: "autosave", onchange: function (e) { setKV("autosave", e.target.checked); if (e.target.checked) scheduleAutosave(); else { var k = "draft:" + S.clientId; if (S.kv[k]) { delete S.kv[k]; unpersist("kv", k); } setStatus("saved", "Auto-save off"); } } }), " Auto-save"), btn("SAVE", function () { if (pending === 0 && saveState !== "failed") { setStatus("saved", "Everything is already saved " + new Date().toLocaleTimeString("en-IN")); toast("All changes are saved in this browser.", "ok"); } else toast("Saving is still in progress.", "warn"); }, "gold", { id: "savebtn" }))),
      h("nav", { class: "row2", "aria-label": "Help links" }, [["Help / User Guide", "guide"], ["Error Codes", "errors"], ["Rules and sources", "rules"], ["Release Notes", "release"], ["Privacy", "privacy"]].map(function (x) { return h("button", { class: "link", type: "button", onclick: function () { openDoc(x[1]); } }, x[0]); }), h("button", { class: "link", type: "button", onclick: feedbackForm }, "Feedback"), h("a", { class: "link", href: "../" }, "All ComplyPro tools"), h("button", { class: "link", type: "button", onclick: function () { var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-theme", cur); try { localStorage.setItem("mt-theme", cur); } catch (e) {} } }, "Dark / Light"))));
    document.body.appendChild(h("div", { id: "banners", class: "banners" }));
    document.body.appendChild(h("nav", { id: "tabs", class: "tabs", role: "tablist" }));
    document.body.appendChild(h("main", { id: "main", tabindex: "-1" }));
    document.body.appendChild(h("footer", { class: "foot" }, "GSTR-2B Reconciliation v" + VERSION + " · Works offline · Your files are read in this browser and never uploaded · Demonstration data is invented · A working aid, not legal or tax advice."));
    document.body.appendChild(h("div", { id: "toasts", class: "toasts", "aria-live": "polite" }));
  }
  function render() {
    var sel = $("#clientsel");
    if (sel) { sel.innerHTML = ""; if (!S.clients.size) sel.appendChild(h("option", { value: "", text: "No client yet" })); S.clients.forEach(function (c) { sel.appendChild(h("option", { value: c.id, text: c.name, selected: c.id === S.clientId })); }); }
    ["editclient", "delclient"].forEach(function (id) { var b = $("#" + id); if (b) b.disabled = !client(); });
    var nav = $("#tabs"); nav.innerHTML = "";
    TABS.forEach(function (t) { nav.appendChild(h("button", { class: "tab" + (S.tab === t[0] ? " on" : ""), type: "button", role: "tab", "data-tab": t[0], "aria-selected": S.tab === t[0] ? "true" : "false", onclick: function () { S.tab = t[0]; render(); } }, t[1])); });
    var main = $("#main"); var sy = window.scrollY; main.innerHTML = "";
    if (!client() && S.tab !== "backup") { main.appendChild(h("div", { class: "empty" }, h("h2", { text: "Welcome to GSTR-2B Reconciliation" }), h("p", { text: "Start by adding the client you are reconciling for. Everything stays in this browser." }), btn("Add client", function () { clientForm(null); }, "primary", { id: "welcomeadd" }), " ", btn("Try with sample data", function () { var c = { id: uid(), name: "Sample Company Pvt Ltd", gstin: SM.S.client, created: Date.now() }; S.clients.set(c.id, c); S.clientId = c.id; persist("clients", c); loadSample(); }, ""))); return; }
    (TABS.filter(function (t) { return t[0] === S.tab; })[0] || TABS[0])[2](main);
    window.scrollTo(0, S.tab === "results" ? sy : 0);
    var cb = $("#autosave"); if (cb) cb.checked = autoOn();
    scheduleAutosave();
  }
  function fatal(code) {
    document.body.innerHTML = ""; var e = errInfo(code) || {}; var x = EXTRA_ERR[code] || e;
    document.body.appendChild(h("div", { class: "fatal" }, h("h1", { text: "GSTR-2B Reconciliation cannot start" }), h("p", null, h("strong", { text: code + " - " + x.title })), h("p", { text: x.cause }), h("p", { text: "What to do: " + x.action })));
  }
  function start() {
    try { var th = localStorage.getItem("mt-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
    if (typeof XLSX === "undefined") return fatal("MT-DBS-002");
    shell();
    openDB().then(function () { return Promise.all([readAll("clients"), readAll("runs"), readAll("kv")]); }).then(function (all) {
      all[0].forEach(function (c) { S.clients.set(c.id, c); }); all[1].forEach(function (r) { S.runs.set(r.id, r); }); all[2].forEach(function (x) { S.kv[x.key] = x.value; });
      var saved = null; try { saved = localStorage.getItem("gr-client"); } catch (e) {}
      S.clientId = S.clients.has(saved) ? saved : (Array.from(S.clients.keys())[0] || null);
      S.ready = true; setStatus("clean"); var back = restoreSession(); lastSig = sig(); render(); if (back) toast("Your last session was restored (auto-saved " + new Date(S.restoredAt).toLocaleString("en-IN") + ").", "ok"); document.documentElement.setAttribute("data-ready", "1");
      if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(function () {});
    }).catch(function (e) { fatal((e && e.code) || "MT-DBS-002"); });
  }
  window.GRAPP = { errorsHTML: errorsHTML, rulesHTML: rulesHTML, S: S, render: render, runRecon: runRecon };
  start();
})();
