/*! MSME Tools core v1.0.0 - shared UI, storage, autosave, backup. Runs entirely in the browser. */
(function () {
  "use strict";
  var E = window.MSME, D = window.MSMEDATA;
  var MT = (window.MT = { state: {}, cfg: null });
  var STORES = ["companies", "parties", "invoices", "notices"];

  /* ---------- tiny DOM helper ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { add(el, x); });
    else if (c.nodeType) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  MT.h = h; MT.$ = $; MT.uid = uid; MT.esc = esc;

  /* ---------- errors ---------- */
  function errText(code) { var e = D.byCode[code]; return e ? e.title : code; }
  MT.err = function (code) { return D.byCode[code] || { code: code, title: code, explanation: "", cause: "", action: "", severity: "Error", canContinue: "No" }; };
  function errChip(code) {
    var e = MT.err(code);
    return h("button", { class: "chip " + e.severity.toLowerCase(), type: "button", title: e.explanation + " Action: " + e.action, onclick: function () { showError(code); } }, code);
  }
  MT.errChip = errChip;
  function showError(code) {
    var e = MT.err(code);
    modal(code + " - " + e.title, h("div", { class: "errdetail" },
      row("Severity", e.severity), row("Category", e.category), row("Can you continue?", e.canContinue),
      row("What it means", e.explanation), row("Possible cause", e.cause), row("What to do", e.action)),
      [{ label: "Close" }]);
    function row(k, v) { return h("p", null, h("strong", { text: k + ": " }), v); }
  }
  MT.showError = showError;

  /* ---------- toast & modal ---------- */
  function toast(msg, kind, code) {
    var box = $("#toasts");
    var t = h("div", { class: "toast " + (kind || "info"), role: "status" }, h("span", { text: msg }), code ? errChip(code) : null,
      h("button", { class: "x", "aria-label": "Dismiss", type: "button", onclick: function () { t.remove(); } }, "×"));
    box.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, kind === "error" ? 12000 : 5000);
  }
  MT.toast = toast;
  var modalStack = [];
  function modal(title, body, buttons, opts) {
    opts = opts || {};
    var back = h("div", { class: "modal-back" });
    var box = h("div", { class: "modal" + (opts.wide ? " wide" : ""), role: "dialog", "aria-modal": "true", "aria-label": title });
    var close = function () { back.remove(); modalStack.pop(); if (opts.onclose) opts.onclose(); };
    var head = h("div", { class: "modal-head" }, h("h2", { text: title }), h("button", { class: "x", type: "button", "aria-label": "Close", onclick: close }, "×"));
    var foot = h("div", { class: "modal-foot" });
    (buttons || []).forEach(function (b) {
      foot.appendChild(h("button", { type: "button", class: "btn " + (b.cls || ""), onclick: function () {
        var r = b.onclick ? b.onclick(close) : undefined;
        if (r !== false && !b.keep) close();
      } }, b.label));
    });
    box.appendChild(head); box.appendChild(h("div", { class: "modal-body" }, body)); box.appendChild(foot);
    back.appendChild(box); document.body.appendChild(back); modalStack.push(close);
    var f = box.querySelector("input,select,textarea,button.btn"); if (f && !opts.nofocus) f.focus();
    return { close: close, box: box };
  }
  MT.modal = modal;
  MT.confirm = function (title, msg, okLabel, cls) {
    return new Promise(function (res) {
      var done = false;
      modal(title, h("p", { text: msg }), [
        { label: "Cancel", onclick: function () { done = true; res(false); } },
        { label: okLabel || "Confirm", cls: cls || "primary", onclick: function () { done = true; res(true); } }
      ], { onclose: function () { if (!done) res(false); } });
    });
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalStack.length) modalStack[modalStack.length - 1]();
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) { e.preventDefault(); MT.saveNow(true); }
  });

  /* ---------- database ---------- */
  var db = null, dbName = null;
  function openDB(name) {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej({ code: "MT-DBS-001" });
      var r;
      try { r = indexedDB.open(name, 1); } catch (e) { return rej({ code: "MT-DBS-001", e: e }); }
      r.onupgradeneeded = function () {
        var d = r.result;
        STORES.forEach(function (s) { var st = d.createObjectStore(s, { keyPath: "id" }); if (s !== "companies") st.createIndex("companyId", "companyId"); });
        d.createObjectStore("kv", { keyPath: "key" });
      };
      r.onsuccess = function () { db = r.result; db.onversionchange = function () { db.close(); toast("Another tab needs this database. Reload the page.", "warn", "MT-DBS-006"); }; res(db); };
      r.onerror = function () { rej({ code: "MT-DBS-002", e: r.error }); };
      r.onblocked = function () { rej({ code: "MT-DBS-006" }); };
    });
  }
  function readAll(store) {
    return new Promise(function (res, rej) {
      var tx = db.transaction(store, "readonly"), q = tx.objectStore(store).getAll();
      q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej({ code: "MT-DBS-004", e: q.error }); };
    });
  }
  MT._test = { failSave: false };

  /* ---------- state, dirty tracking, autosave ---------- */
  var S = MT.state = { companies: new Map(), parties: new Map(), invoices: new Map(), notices: new Map(), kv: {}, companyId: null };
  var dirty = {}, deleted = {};
  STORES.concat(["kv"]).forEach(function (s) { dirty[s] = new Set(); deleted[s] = new Set(); });
  var saveTimer = null, chain = Promise.resolve(), saving = false, ready = false, loadFailed = false, lastSaved = null, status = "init";
  var DEBOUNCE = 800;

  function setStatus(st, extra) {
    status = st; MT.status = st;
    var el = $("#savestatus"), dot = $("#savedot");
    if (!el) return;
    var txt = { init: "Starting…", clean: "Auto save on", saving: "Saving…", saved: "All changes saved" + (lastSaved ? " · " + lastSaved.toLocaleTimeString("en-IN") : ""), dirty: "Unsaved changes", failed: "Save failed" }[st] || st;
    el.textContent = txt; dot.className = "dot " + st;
    var b = $("#savebtn"); if (b) b.classList.toggle("attn", st === "dirty" || st === "failed");
    document.title = (st === "dirty" || st === "failed" ? "● " : "") + MT.cfg.appName + " | MSME Tools";
  }
  MT.setStatus = setStatus;
  function touch(store, id, immediate) {
    if (loadFailed) { toast("Saved data could not be loaded, so saving is switched off to protect it.", "error", "MT-DBS-004"); return; }
    dirty[store].add(id); deleted[store].delete(id);
    setStatus("dirty");
    if (immediate) MT.saveNow(); else { clearTimeout(saveTimer); saveTimer = setTimeout(function () { MT.saveNow(); }, DEBOUNCE); }
  }
  function drop(store, id) {
    deleted[store].add(id); dirty[store].delete(id);
    if (store !== "kv") S[store].delete(id);
    setStatus("dirty"); MT.saveNow();
  }
  MT.touch = touch; MT.drop = drop;
  MT.put = function (store, obj, immediate) { obj.updatedAt = new Date().toISOString(); S[store].set(obj.id, obj); touch(store, obj.id, immediate); };
  MT.setKV = function (key, value, immediate) { S.kv[key] = value; touch("kv", key, immediate); };

  MT.saveNow = function (manual) {
    clearTimeout(saveTimer);
    chain = chain.then(function () { return doSave(manual); });
    return chain;
  };
  function nothingDirty() { return STORES.concat(["kv"]).every(function (s) { return !dirty[s].size && !deleted[s].size; }); }
  function doSave(manual) {
    if (!ready || loadFailed) return Promise.resolve();
    if (nothingDirty()) {
      if (manual) { lastSaved = lastSaved || new Date(); setStatus("saved"); toast("All changes saved successfully.", "ok"); }
      return Promise.resolve();
    }
    var snapD = {}, snapX = {};
    STORES.concat(["kv"]).forEach(function (s) { snapD[s] = Array.from(dirty[s]); snapX[s] = Array.from(deleted[s]); dirty[s].clear(); deleted[s].clear(); });
    saving = true; setStatus("saving");
    return new Promise(function (resolve) {
      var failed = false;
      function fail(code, e) {
        if (failed) return; failed = true; saving = false;
        STORES.concat(["kv"]).forEach(function (s) { snapD[s].forEach(function (id) { dirty[s].add(id); }); snapX[s].forEach(function (id) { deleted[s].add(id); }); });
        setStatus("failed"); toast("Your latest changes are NOT saved. Download a backup and try Save again.", "error", code); console.error(e); resolve();
      }
      try {
        if (MT._test.failSave) throw new Error("simulated failure");
        var names = STORES.concat(["kv"]), tx = db.transaction(names, "readwrite");
        STORES.forEach(function (s) {
          var os = tx.objectStore(s);
          snapD[s].forEach(function (id) { var o = S[s].get(id); if (o) os.put(JSON.parse(JSON.stringify(o))); });
          snapX[s].forEach(function (id) { os.delete(id); });
        });
        var kv = tx.objectStore("kv");
        snapD.kv.forEach(function (k) { if (k in S.kv) kv.put({ key: k, value: JSON.parse(JSON.stringify(S.kv[k])) }); });
        snapX.kv.forEach(function (k) { kv.delete(k); });
        tx.oncomplete = function () {
          saving = false; lastSaved = new Date();
          if (nothingDirty()) { setStatus("saved"); if (manual) toast("All changes saved successfully.", "ok"); }
          else { setStatus("dirty"); clearTimeout(saveTimer); saveTimer = setTimeout(function () { MT.saveNow(); }, 200); }
          resolve();
        };
        tx.onabort = function () { fail("MT-DBS-005", tx.error); };
        tx.onerror = function () { fail("MT-DBS-003", tx.error); };
      } catch (e) { fail("MT-DBS-003", e); }
    });
  }
  window.addEventListener("beforeunload", function (e) { if (status === "dirty" || status === "saving" || status === "failed") { MT.saveNow(); e.preventDefault(); e.returnValue = ""; } });
  document.addEventListener("visibilitychange", function () { if (document.hidden && status === "dirty") MT.saveNow(); });

  /* ---------- selectors ---------- */
  MT.company = function () { return S.companies.get(S.companyId) || null; };
  MT.partiesOf = function (cid) { return Array.from(S.parties.values()).filter(function (p) { return p.companyId === (cid || S.companyId); }).sort(function (a, b) { return a.name.localeCompare(b.name); }); };
  MT.invoicesOf = function (cid) { return Array.from(S.invoices.values()).filter(function (p) { return p.companyId === (cid || S.companyId); }).sort(function (a, b) { return a.invoiceDate < b.invoiceDate ? -1 : a.invoiceDate > b.invoiceDate ? 1 : 0; }); };
  MT.settings = function () { var c = MT.company(); return Object.assign({ rateBasis: "periodwise", restBasis: "calendar", appropriation: "interest-first", traders: "exclude", base43: "taxable", noticeDays: 15 }, c && c.settings); };
  MT.supplierOf = function (inv) {
    var c = MT.company(), p = S.parties.get(inv.partyId);
    var src = c && c.role === "buyer" ? p : c;
    if (!src) return null;
    return { name: src.name, category: src.category, udyamNo: src.udyamNo, udyamDate: src.udyamDate, activity: src.activity };
  };
  MT.compose = function (inv) {
    var p = S.parties.get(inv.partyId);
    return Object.assign({}, inv, { partyName: p ? p.name : "" });
  };
  MT.rates = function () { return S.kv.customRates || []; };
  MT.interestOpts = function () { var s = MT.settings(); return { rateBasis: s.rateBasis, restBasis: s.restBasis, appropriation: s.appropriation }; };
  MT.calc = function (inv, asOf) { return E.calcInterest(MT.compose(inv), asOf, MT.interestOpts(), MT.rates()); };

  /* ---------- form helper ---------- */
  function field(def, val) {
    var id = "f_" + def.key, el;
    if (def.type === "select") {
      el = h("select", { id: id, name: def.key }, def.options.map(function (o) { return h("option", { value: o[0], selected: String(val) === String(o[0]) }, o[1]); }));
    } else if (def.type === "textarea") el = h("textarea", { id: id, name: def.key, rows: def.rows || 2 });
    else if (def.type === "checkbox") { el = h("input", { id: id, name: def.key, type: "checkbox" }); el.checked = !!val; }
    else el = h("input", { id: id, name: def.key, type: def.type === "money" ? "text" : (def.type || "text"), inputmode: def.type === "money" ? "decimal" : null, placeholder: def.ph || null, autocomplete: "off", maxlength: def.max || null });
    if (def.type === "textarea" || (def.type !== "select" && def.type !== "checkbox")) el.value = val === undefined || val === null ? "" : val;
    var wrap = h("div", { class: "fld" + (def.wide ? " wide" : "") + (def.type === "checkbox" ? " chk" : "") },
      def.type === "checkbox" ? h("label", { for: id }, el, " " + def.label) : [h("label", { for: id }, def.label + (def.req ? " *" : "")), el],
      def.help ? h("small", { text: def.help }) : null, h("div", { class: "ferr", id: "e_" + def.key }));
    return wrap;
  }
  MT.field = field;
  function readForm(root, defs) {
    var o = {};
    defs.forEach(function (d) {
      var el = root.querySelector("[name='" + d.key + "']"); if (!el) return;
      o[d.key] = d.type === "checkbox" ? el.checked : el.value.trim();
    });
    return o;
  }
  MT.readForm = readForm;
  MT.showErrors = function (root, list) {
    root.querySelectorAll(".ferr").forEach(function (e) { e.textContent = ""; e.parentNode.classList.remove("bad"); });
    var first = null;
    list.forEach(function (er) {
      var box = root.querySelector("#e_" + er.field) || root.querySelector("#e_formtop");
      if (box) { box.parentNode.classList.add("bad"); box.appendChild(h("span", null, errText(er.code) + " ", errChip(er.code))); if (!first) first = box; }
    });
    if (first && first.scrollIntoView) first.scrollIntoView({ block: "center" });
  };

  /* ---------- companies ---------- */
  var COMPANY_FIELDS = [
    { key: "name", label: "Business name", req: true, wide: true, max: 120 },
    { key: "role", label: "In this company I am the", type: "select", options: [["supplier", "Supplier (micro/small enterprise that supplies goods or services)"], ["buyer", "Buyer (I buy from micro/small suppliers)"]], wide: true },
    { key: "address", label: "Address", type: "textarea", wide: true },
    { key: "email", label: "E-mail" }, { key: "phone", label: "Phone" },
    { key: "pan", label: "PAN (optional)" }, { key: "gstin", label: "GSTIN (optional)" },
    { key: "udyamNo", label: "My Udyam number (if supplier)", ph: "UDYAM-XX-00-0000000" },
    { key: "udyamDate", label: "My Udyam registration date", type: "date" },
    { key: "category", label: "My size category", type: "select", options: [["unknown", "Not known"], ["micro", "Micro"], ["small", "Small"], ["medium", "Medium"]] },
    { key: "activity", label: "My activity", type: "select", options: [["manufacturing", "Manufacturing"], ["services", "Services"], ["trading", "Trading"]] },
    { key: "signatory", label: "Authorised signatory name" }, { key: "designation", label: "Designation" }, { key: "place", label: "Place (for notices)" }
  ];
  MT.companyForm = function (c, onDone) {
    var vals = Object.assign({ role: MT.cfg.defaultRole, category: "unknown", activity: "manufacturing" }, c || {});
    var form = h("div", { class: "form" }, h("div", { class: "fld wide" }, h("div", { class: "ferr", id: "e_formtop" })), COMPANY_FIELDS.map(function (d) { return field(d, vals[d.key]); }));
    modal(c ? "Edit company" : "Add company", form, [
      { label: "Cancel" },
      { label: "Save company", cls: "primary", keep: true, onclick: function (close) {
        var v = readForm(form, COMPANY_FIELDS), errs = [];
        if (!v.name || v.name.length < 2) errs.push({ code: "MT-INP-003", field: "name" });
        if (v.udyamNo && !/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/i.test(v.udyamNo)) { toast("Udyam number format looks unusual - check it.", "warn", "MT-INP-009"); }
        if (v.udyamDate && !E.parseISO(v.udyamDate)) errs.push({ code: "MT-DAT-002", field: "udyamDate" });
        if (errs.length) { MT.showErrors(form, errs); return false; }
        var o = Object.assign({}, c || { id: uid(), createdAt: new Date().toISOString(), settings: {} }, v);
        MT.put("companies", o, true);
        S.companyId = o.id; try { localStorage.setItem("mt-company-" + MT.cfg.appId, o.id); } catch (e) {}
        close(); if (onDone) onDone(o); MT.render();
      } }
    ], { wide: true });
  };
  MT.deleteCompany = function () {
    var c = MT.company(); if (!c) return;
    var n = MT.invoicesOf().length;
    MT.confirm("Delete company?", "This permanently deletes '" + c.name + "' with its " + n + " invoice(s), parties and notices from this browser. Take a JSON backup first if unsure. This cannot be undone.", "Delete permanently", "danger").then(function (ok) {
      if (!ok) return;
      MT.invoicesOf().forEach(function (i) { drop("invoices", i.id); });
      MT.partiesOf().forEach(function (p) { drop("parties", p.id); });
      Array.from(S.notices.values()).filter(function (x) { return x.companyId === c.id; }).forEach(function (x) { drop("notices", x.id); });
      drop("companies", c.id);
      var rest = Array.from(S.companies.values()); S.companyId = rest.length ? rest[0].id : null;
      MT.render(); toast("Company deleted.", "ok");
    });
  };

  /* ---------- parties ---------- */
  var PARTY_FIELDS = [
    { key: "name", label: "Name of party", req: true, wide: true, max: 120 },
    { key: "address", label: "Address", type: "textarea", wide: true },
    { key: "email", label: "E-mail" }, { key: "gstin", label: "GSTIN (optional)" },
    { key: "udyamNo", label: "Udyam number", ph: "UDYAM-XX-00-0000000" }, { key: "udyamDate", label: "Udyam registration date", type: "date" },
    { key: "category", label: "Size category", type: "select", options: [["unknown", "Not known"], ["micro", "Micro"], ["small", "Small"], ["medium", "Medium"]] },
    { key: "activity", label: "Activity", type: "select", options: [["manufacturing", "Manufacturing"], ["services", "Services"], ["trading", "Trading"]] }
  ];
  MT.partyForm = function (p, onDone) {
    var vals = Object.assign({ category: "unknown", activity: "manufacturing" }, p || {});
    var form = h("div", { class: "form" }, h("div", { class: "fld wide" }, h("div", { class: "ferr", id: "e_formtop" })), PARTY_FIELDS.map(function (d) { return field(d, vals[d.key]); }));
    var company = MT.company();
    var hint = company && company.role === "buyer" ? "This party is a SUPPLIER. Fill Udyam details from the supplier's certificate." : "This party is the BUYER who owes you money.";
    modal(p ? "Edit party" : "Add party", h("div", null, h("p", { class: "muted", text: hint }), form), [
      { label: "Cancel" },
      { label: "Save party", cls: "primary", keep: true, onclick: function (close) {
        var v = readForm(form, PARTY_FIELDS), errs = [];
        if (!v.name || v.name.length < 2) errs.push({ code: "MT-INP-001", field: "name" });
        if (v.udyamNo && !/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/i.test(v.udyamNo)) toast("Udyam number format looks unusual - check it.", "warn", "MT-INP-009");
        if (v.udyamDate && !E.parseISO(v.udyamDate)) errs.push({ code: "MT-DAT-002", field: "udyamDate" });
        if (errs.length) { MT.showErrors(form, errs); return false; }
        var o = Object.assign({}, p || { id: uid(), companyId: S.companyId, createdAt: new Date().toISOString() }, v);
        MT.put("parties", o, true); close(); if (onDone) onDone(o); MT.render();
      } }
    ], { wide: true });
  };

  /* ---------- invoice form ---------- */
  var INV_FIELDS = function () {
    var ps = MT.partiesOf();
    return [
      { key: "partyId", label: MT.company() && MT.company().role === "buyer" ? "Supplier" : "Buyer", type: "select", req: true, options: [["", "- select -"]].concat(ps.map(function (p) { return [p.id, p.name]; })), wide: true },
      { key: "invoiceNo", label: "Invoice number", req: true }, { key: "invoiceDate", label: "Invoice date", type: "date", req: true },
      { key: "contractDate", label: "Date of contract / purchase order", type: "date", help: "Used to test whether the supplier was registered when the contract was made." },
      { key: "deliveryDate", label: "Date of delivery / service rendered", type: "date", req: true, help: "Day of acceptance (s.2(b))." },
      { key: "objectionDate", label: "Written objection by buyer (date, if any)", type: "date", help: "Only an objection made within 15 days of delivery counts." },
      { key: "objectionRemovedDate", label: "Date supplier removed the objection", type: "date" },
      { key: "agreement", label: "Payment period agreed in writing", type: "checkbox" },
      { key: "creditDays", label: "Agreed credit days (maximum 45)", type: "number", help: "Used only if a written agreement exists. Otherwise 15 days apply." },
      { key: "totalAmount", label: "Invoice total incl. GST (₹)", type: "money", req: true },
      { key: "taxableAmount", label: "Taxable value excl. GST (₹)", type: "money", help: "Used by the s.43B(h) Checker." },
      { key: "excludedAmount", label: "Amount excluded from interest (₹)", type: "money", help: "Optional, for example GST that your adviser excludes." },
      { key: "expenseDate", label: "Date expense booked (s.43B(h))", type: "date", help: "If blank, the invoice date is used." },
      { key: "nature", label: "Nature of purchase", type: "select", options: [["revenue", "Revenue expense / services"], ["stock", "Stock-in-trade / raw material"], ["capital", "Capital item"]] },
      { key: "notes", label: "Notes", type: "textarea", wide: true }
    ];
  };
  var paise2in = function (p) { return p === undefined || p === null || p === "" ? "" : (p / 100).toFixed(2); };
  MT.invoiceForm = function (inv, draftVals) {
    if (!MT.partiesOf().length) { toast("Add a party first (Parties tab).", "warn"); return; }
    var defs = INV_FIELDS();
    var vals = draftVals || (inv ? Object.assign({}, inv, { totalAmount: paise2in(inv.totalPaise), taxableAmount: paise2in(inv.taxablePaise), excludedAmount: paise2in(inv.excludedPaise) }) : { nature: "revenue", agreement: false });
    var form = h("div", { class: "form" }, h("div", { class: "fld wide" }, h("div", { class: "ferr", id: "e_formtop" })), defs.map(function (d) { return field(d, vals[d.key]); }));
    var payBox = h("div", { class: "fld wide" }, h("label", { text: "Payments received / made" }), h("div", { id: "paylist" }), h("button", { class: "btn small", type: "button", onclick: function () { addPay(); draftSave(); } }, "+ Add payment"), h("div", { class: "ferr", id: "e_payments" }));
    form.insertBefore(payBox, form.lastChild);
    function addPay(p) {
      var r = h("div", { class: "payrow" },
        h("input", { type: "date", "aria-label": "Payment date", value: p ? p.date : "", "data-k": "date" }),
        h("input", { type: "text", inputmode: "decimal", "aria-label": "Amount", placeholder: "Amount ₹", value: p ? paise2in(p.paise) : "", "data-k": "amt" }),
        h("input", { type: "text", "aria-label": "Note", placeholder: "Reference / note", value: p ? p.note || "" : "", "data-k": "note" }),
        h("button", { class: "btn small danger", type: "button", "aria-label": "Remove payment", onclick: function () { r.remove(); draftSave(); } }, "×"));
      $("#paylist", form).appendChild(r);
    }
    (vals.payments || []).forEach(addPay);
    function collect() {
      var v = readForm(form, defs);
      v.payments = Array.from(form.querySelectorAll(".payrow")).map(function (r) {
        return { date: r.querySelector("[data-k=date]").value, amtRaw: r.querySelector("[data-k=amt]").value, note: r.querySelector("[data-k=note]").value };
      });
      return v;
    }
    var dt = null;
    function draftSave() {
      clearTimeout(dt);
      dt = setTimeout(function () {
        var v = collect();
        if (!db) return;
        try { var tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").put({ key: "draft", value: { kind: "invoice", id: inv ? inv.id : null, companyId: S.companyId, savedAt: new Date().toISOString(), values: v } }); } catch (e) {}
      }, 500);
    }
    form.addEventListener("input", draftSave); form.addEventListener("change", draftSave);
    function clearDraft() { clearTimeout(dt); try { var tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").delete("draft"); } catch (e) {} delete S.kv.draft; }
    modal(inv ? "Edit invoice" : "Add invoice", form, [
      { label: "Cancel", onclick: function () { clearDraft(); } },
      inv ? { label: "Delete", cls: "danger", onclick: function () { clearDraft(); MT.confirm("Delete invoice?", "Delete invoice " + inv.invoiceNo + " permanently from this browser?", "Delete", "danger").then(function (ok) { if (ok) { drop("invoices", inv.id); MT.render(); toast("Invoice deleted.", "ok"); } }); } } : null,
      { label: "Save invoice", cls: "primary", keep: true, onclick: function (close) {
        var v = collect(), errs = [];
        var total = E.parseRupees(v.totalAmount);
        var taxable = v.taxableAmount === "" ? null : E.parseRupees(v.taxableAmount);
        var excl = v.excludedAmount === "" ? 0 : E.parseRupees(v.excludedAmount);
        var pays = [];
        v.payments.forEach(function (p) {
          if (!p.date && !p.amtRaw) return;
          var a = E.parseRupees(p.amtRaw);
          pays.push({ id: uid(), date: p.date, paise: a === null ? 0 : a, note: p.note });
        });
        var o = Object.assign({}, inv || { id: uid(), companyId: S.companyId, createdAt: new Date().toISOString() }, {
          partyId: v.partyId, invoiceNo: v.invoiceNo, invoiceDate: v.invoiceDate, contractDate: v.contractDate, deliveryDate: v.deliveryDate,
          objectionDate: v.objectionDate, objectionRemovedDate: v.objectionRemovedDate, agreement: v.agreement, creditDays: v.agreement ? v.creditDays : "",
          totalPaise: total === null ? 0 : total, taxablePaise: taxable === null ? (v.taxableAmount === "" ? total : 0) : taxable, excludedPaise: excl === null ? -1 : excl,
          expenseDate: v.expenseDate, nature: v.nature, notes: v.notes, payments: pays
        });
        errs = E.validateInvoice(MT.compose(o));
        if (!v.partyId) errs.unshift({ code: "MT-INP-001", field: "partyId" });
        if (v.totalAmount && total === null) errs.push({ code: "MT-INP-004", field: "totalAmount" });
        errs = errs.map(function (e) { var f = e.field; if (f === "totalPaise") f = "totalAmount"; if (f === "taxablePaise") f = "taxableAmount"; if (f === "excludedPaise") f = "excludedAmount"; return Object.assign({}, e, { field: f }); });
        if (o.excludedPaise < 0 || o.excludedPaise > o.totalPaise) errs.push({ code: "MT-INP-007", field: "excludedAmount" });
        if (o.agreement && o.creditDays > 45) toast("Credit days above 45 will be limited to 45.", "warn", "MT-LEG-004");
        var hard = errs.filter(function (e) { return !e.warn; });
        if (hard.length) { MT.showErrors(form, hard); return false; }
        var dup = Array.from(S.invoices.values()).find(function (x) { return x.id !== o.id && E.dupKey(MT.compose(x)) === E.dupKey(MT.compose(o)); });
        if (dup && !window.confirm("An invoice with the same party, number and date already exists. Save anyway?")) return false;
        MT.put("invoices", o, true); clearDraft(); close(); MT.render(); toast("Invoice saved.", "ok");
      } }
    ].filter(Boolean), { wide: true, onclose: function () {} });
    return form;
  };
  MT.recoverDraft = function () {
    var d = S.kv.draft; if (!d || d.kind !== "invoice") return;
    var banner = h("div", { class: "banner warn" }, "An unfinished invoice entry was found. ", errChip("MT-BKP-003"), " ",
      h("button", { class: "btn small primary", type: "button", onclick: function () {
        var v = d.values; v.payments = (v.payments || []).map(function (p) { return { date: p.date, paise: E.parseRupees(p.amtRaw) || 0, note: p.note }; });
        banner.remove(); MT.invoiceForm(d.id ? S.invoices.get(d.id) : null, v);
      } }, "Recover entry"), " ",
      h("button", { class: "btn small", type: "button", onclick: function () { banner.remove(); try { db.transaction("kv", "readwrite").objectStore("kv").delete("draft"); } catch (e) {} delete S.kv.draft; } }, "Discard"));
    $("#banners").appendChild(banner);
  };

  /* ---------- CSV / TXT / JSON ---------- */
  var ROW_KEYS = ["partyName", "invoiceNo", "invoiceDate", "contractDate", "deliveryDate", "objectionDate", "objectionRemovedDate", "agreement", "creditDays", "totalAmount", "taxableAmount", "excludedAmount", "expenseDate", "nature", "payments", "partyUdyamNo", "partyUdyamDate", "partyCategory", "partyActivity", "notes"];
  MT.ROW_KEYS = ROW_KEYS;
  function invToRow(i) {
    var p = S.parties.get(i.partyId) || {};
    return { partyName: p.name || "", invoiceNo: i.invoiceNo, invoiceDate: i.invoiceDate, contractDate: i.contractDate || "", deliveryDate: i.deliveryDate, objectionDate: i.objectionDate || "", objectionRemovedDate: i.objectionRemovedDate || "", agreement: i.agreement ? "Y" : "N", creditDays: i.creditDays === undefined ? "" : i.creditDays, totalAmount: paise2in(i.totalPaise), taxableAmount: paise2in(i.taxablePaise), excludedAmount: paise2in(i.excludedPaise || 0), expenseDate: i.expenseDate || "", nature: i.nature || "revenue", payments: (i.payments || []).map(function (x) { return x.date + ":" + paise2in(x.paise) + (x.note ? ":" + x.note.replace(/[|:]/g, " ") : ""); }).join("|"), partyUdyamNo: p.udyamNo || "", partyUdyamDate: p.udyamDate || "", partyCategory: p.category || "", partyActivity: p.activity || "", notes: i.notes || "" };
  }
  function csvCell(v) { v = String(v === undefined || v === null ? "" : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function toCSV(rows) { return [ROW_KEYS.join(",")].concat(rows.map(function (r) { return ROW_KEYS.map(function (k) { return csvCell(r[k]); }).join(","); })).join("\r\n"); }
  function parseCSV(text) {
    var rows = [], row = [], cur = "", q = false, i = 0;
    text = text.replace(/^﻿/, "");
    for (; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.length > 1 || row[0] !== "") rows.push(row); row = []; }
      else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  function toTXT(rows) {
    return "MSMETOOLS-TXT 1\n# Edit only the values after '='. One [INVOICE] block per invoice. Dates YYYY-MM-DD or DD-MM-YYYY. payments=date:amount:note|date:amount\n" +
      rows.map(function (r) { return "\n[INVOICE]\n" + ROW_KEYS.map(function (k) { return k + "=" + String(r[k] === undefined ? "" : r[k]).replace(/\r?\n/g, " "); }).join("\n"); }).join("\n") + "\n";
  }
  function parseTXT(text) {
    var lines = text.replace(/^﻿/, "").split(/\r?\n/);
    if (!/^MSMETOOLS-TXT\s+1\s*$/.test(lines[0] || "")) return null;
    var rows = [], cur = null;
    lines.slice(1).forEach(function (l) {
      if (/^\s*#/.test(l) || !l.trim()) return;
      if (/^\[INVOICE\]\s*$/.test(l)) { cur = {}; rows.push(cur); return; }
      var m = /^([A-Za-z]+)=(.*)$/.exec(l);
      if (m && cur && ROW_KEYS.indexOf(m[1]) >= 0) cur[m[1]] = m[2];
    });
    return rows;
  }
  function normDate(s) {
    s = (s || "").trim(); if (!s) return "";
    var m = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.exec(s);
    return m ? m[3] + "-" + m[2] + "-" + m[1] : s;
  }
  function importRows(rows) {
    var added = 0, dups = 0, errors = [], cid = S.companyId;
    var existing = new Set(MT.invoicesOf().map(function (x) { return E.dupKey(MT.compose(x)); }));
    rows.forEach(function (r, idx) {
      var line = idx + 1, codes = [];
      var total = E.parseRupees(r.totalAmount), taxable = r.taxableAmount ? E.parseRupees(r.taxableAmount) : total, excl = r.excludedAmount ? E.parseRupees(r.excludedAmount) : 0;
      var pays = [];
      (r.payments || "").split("|").filter(Boolean).forEach(function (s) {
        var p = s.split(":"); var a = E.parseRupees(p[1]);
        pays.push({ id: uid(), date: normDate(p[0]), paise: a === null ? 0 : a, note: p.slice(2).join(":") });
      });
      var o = { id: uid(), companyId: cid, partyId: null, invoiceNo: (r.invoiceNo || "").trim(), invoiceDate: normDate(r.invoiceDate), contractDate: normDate(r.contractDate), deliveryDate: normDate(r.deliveryDate), objectionDate: normDate(r.objectionDate), objectionRemovedDate: normDate(r.objectionRemovedDate), agreement: /^(y|yes|true|1)$/i.test((r.agreement || "").trim()), creditDays: r.creditDays ? parseInt(r.creditDays, 10) : "", totalPaise: total === null ? 0 : total, taxablePaise: taxable === null ? 0 : taxable, excludedPaise: excl === null ? -1 : excl, expenseDate: normDate(r.expenseDate), nature: ["revenue", "stock", "capital"].indexOf(r.nature) >= 0 ? r.nature : "revenue", notes: r.notes || "", payments: pays, createdAt: new Date().toISOString() };
      var view = Object.assign({}, o, { partyName: (r.partyName || "").trim() });
      var errs = E.validateInvoice(view).filter(function (e) { return !e.warn; });
      if (o.excludedPaise < 0 || o.excludedPaise > o.totalPaise) errs.push({ code: "MT-INP-007" });
      if (errs.length) { errors.push({ row: line, codes: errs.map(function (e) { return e.code; }) }); return; }
      var key = E.dupKey(view);
      if (existing.has(key)) { dups++; return; }
      var party = Array.from(S.parties.values()).find(function (p) { return p.companyId === cid && p.name.trim().toLowerCase() === view.partyName.toLowerCase(); });
      if (!party) {
        party = { id: uid(), companyId: cid, name: view.partyName, address: "", email: "", gstin: "", udyamNo: r.partyUdyamNo || "", udyamDate: normDate(r.partyUdyamDate), category: ["micro", "small", "medium"].indexOf(r.partyCategory) >= 0 ? r.partyCategory : "unknown", activity: ["manufacturing", "services", "trading"].indexOf(r.partyActivity) >= 0 ? r.partyActivity : "manufacturing", createdAt: new Date().toISOString() };
        MT.put("parties", party);
      }
      o.partyId = party.id; MT.put("invoices", o); existing.add(key); added++;
    });
    MT.saveNow();
    return { added: added, dups: dups, errors: errors };
  }
  function download(name, mime, content) {
    try {
      var blob = new Blob([content], { type: mime }), a = h("a", { href: URL.createObjectURL(blob), download: name });
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) { toast("The file could not be created.", "error", "MT-IMP-010"); }
  }
  MT.download = download;
  function readFile(file, cb) {
    if (file.size > 20 * 1024 * 1024) { toast("File is larger than 20 MB.", "error", "MT-IMP-009"); return; }
    var fr = new FileReader(); fr.onload = function () { cb(String(fr.result)); }; fr.onerror = function () { toast("The file could not be read.", "error", "MT-IMP-001"); }; fr.readAsText(file);
  }
  function reportImport(res) {
    var msgs = [h("p", { text: res.added + " invoice(s) imported." })];
    if (res.dups) msgs.push(h("p", null, res.dups + " duplicate(s) skipped. ", errChip("MT-IMP-008")));
    if (res.errors.length) msgs.push(h("div", null, h("p", null, res.errors.length + " row(s) were skipped. ", errChip("MT-IMP-006")), h("ul", null, res.errors.slice(0, 50).map(function (e) { return h("li", null, "Row " + e.row + ": ", e.codes.map(function (c) { return [errChip(c), " "]; })); }))));
    modal("Import result", h("div", null, msgs), [{ label: "Close" }]); MT.render();
  }
  MT.importCSV = function (file) {
    readFile(file, function (text) {
      var rows = parseCSV(text);
      if (!rows.length || rows[0].map(function (x) { return x.trim(); }).join(",") !== ROW_KEYS.join(",")) { toast("CSV headings do not match the template.", "error", "MT-IMP-005"); return; }
      reportImport(importRows(rows.slice(1).map(function (r) { var o = {}; ROW_KEYS.forEach(function (k, i) { o[k] = r[i] === undefined ? "" : r[i]; }); return o; })));
    });
  };
  MT.importTXT = function (file) {
    readFile(file, function (text) {
      var rows = parseTXT(text);
      if (!rows) { toast("This text file is not in the expected structure.", "error", "MT-IMP-007"); return; }
      reportImport(importRows(rows));
    });
  };
  MT.exportCSV = function () {
    var rows = MT.invoicesOf().map(invToRow); if (!rows.length) { toast("No invoices to export.", "warn", "MT-RPT-002"); return; }
    download("msme-invoices-" + new Date().toISOString().slice(0, 10) + ".csv", "text/csv;charset=utf-8", "﻿" + toCSV(rows));
  };
  MT.exportTemplate = function () { download("msme-invoice-template.csv", "text/csv;charset=utf-8", "﻿" + toCSV([{ partyName: "Example Buyer Pvt Ltd", invoiceNo: "INV-001", invoiceDate: "2026-01-10", deliveryDate: "2026-01-10", agreement: "N", totalAmount: "118000.00", taxableAmount: "100000.00", nature: "revenue", payments: "2026-03-20:50000.00:NEFT" }])); };
  MT.exportTXT = function () {
    var rows = MT.invoicesOf().map(invToRow); if (!rows.length) { toast("No invoices to export.", "warn", "MT-RPT-002"); return; }
    download("msme-invoices-" + new Date().toISOString().slice(0, 10) + ".txt", "text/plain;charset=utf-8", toTXT(rows));
  };
  MT.snapshotData = function () {
    return { companies: Array.from(S.companies.values()), parties: Array.from(S.parties.values()), invoices: Array.from(S.invoices.values()), notices: Array.from(S.notices.values()), customRates: S.kv.customRates || [] };
  };
  MT.exportJSON = function () {
    var data = MT.snapshotData(), s = JSON.stringify(data);
    var pkg = { format: "msme-tools-backup", schema: 1, app: MT.cfg.appId, appVersion: MT.cfg.version, exportedAt: new Date().toISOString(), counts: { companies: data.companies.length, invoices: data.invoices.length }, checksum: E.checksum(s), data: data };
    download("MSME-Tools-" + MT.cfg.appId + "-backup-" + new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16) + ".json", "application/json", JSON.stringify(pkg));
    MT.setKV("lastBackup", new Date().toISOString()); toast("Backup downloaded. Keep it in a safe place outside the browser.", "ok");
  };
  MT.validateBackup = function (text) {
    var pkg;
    try { pkg = JSON.parse(text); } catch (e) { return { code: "MT-IMP-001" }; }
    if (!pkg || pkg.format !== "msme-tools-backup" || !pkg.data) return { code: "MT-IMP-002" };
    if (pkg.schema > 1) return { code: "MT-IMP-004" };
    if (E.checksum(JSON.stringify(pkg.data)) !== pkg.checksum) return { code: "MT-IMP-003" };
    var d = pkg.data;
    if (!Array.isArray(d.companies) || !Array.isArray(d.invoices) || !Array.isArray(d.parties)) return { code: "MT-IMP-002" };
    return { pkg: pkg };
  };
  MT.restoreJSON = function (file) {
    readFile(file, function (text) {
      var v = MT.validateBackup(text);
      if (v.code) { toast("Nothing was imported.", "error", v.code); return; }
      var d = v.pkg.data;
      modal("Restore backup", h("div", null,
        h("p", { text: "Backup of '" + v.pkg.app + "' exported " + new Date(v.pkg.exportedAt).toLocaleString("en-IN") + " contains " + d.companies.length + " company(ies), " + d.parties.length + " parties and " + d.invoices.length + " invoices." }),
        h("p", { text: "Merge adds records that are not already here (same id) and keeps everything else. Replace removes all current data first; your current data is kept as an undo copy." })),
        [{ label: "Cancel" },
         { label: "Merge", cls: "primary", onclick: function () { applyRestore(d, "merge"); } },
         { label: "Replace all", cls: "danger", onclick: function () { applyRestore(d, "replace"); } }]);
    });
  };
  function applyRestore(d, mode) {
    var undo = JSON.stringify(MT.snapshotData());
    try {
      if (mode === "replace") { STORES.forEach(function (s) { Array.from(S[s].keys()).forEach(function (id) { deleted[s].add(id); }); S[s].clear(); dirty[s].clear(); }); }
      var n = 0;
      ["companies", "parties", "invoices", "notices"].forEach(function (s) { (d[s] || []).forEach(function (o) { if (mode === "merge" && S[s].has(o.id)) return; S[s].set(o.id, o); touch(s, o.id); n++; }); });
      if (d.customRates && (mode === "replace" || !S.kv.customRates)) S.kv.customRates = d.customRates; touch("kv", "customRates");
      S.kv.undoRestore = undo; touch("kv", "undoRestore");
      if (!S.companies.has(S.companyId)) S.companyId = Array.from(S.companies.keys())[0] || null;
      MT.saveNow().then(function () { MT.render(); toast("Backup restored (" + n + " records).", "ok"); });
    } catch (e) { toast("Restore failed; existing data kept.", "error", "MT-BKP-001"); console.error(e); }
  }
  MT.undoRestore = function () {
    var u = S.kv.undoRestore; if (!u) { toast("No undo copy available.", "warn", "MT-BKP-002"); return; }
    MT.confirm("Undo last restore?", "Your data will return to how it was before the last restore.", "Undo restore").then(function (ok) {
      if (!ok) return;
      STORES.forEach(function (s) { Array.from(S[s].keys()).forEach(function (id) { deleted[s].add(id); }); S[s].clear(); });
      var d = JSON.parse(u);
      ["companies", "parties", "invoices", "notices"].forEach(function (s) { (d[s] || []).forEach(function (o) { S[s].set(o.id, o); touch(s, o.id); }); });
      S.kv.customRates = d.customRates || []; touch("kv", "customRates");
      delete S.kv.undoRestore; drop("kv", "undoRestore");
      S.companyId = Array.from(S.companies.keys())[0] || null; MT.saveNow().then(function () { MT.render(); toast("Restore undone.", "ok"); });
    });
  };

  /* ---------- reports ---------- */
  var REPORT_CSS = "body{font:13px/1.45 Inter,Arial,sans-serif;color:#243447;margin:24px}h1{color:#12345A;font-size:20px;margin:0 0 4px}h2{color:#087E8B;font-size:15px;margin:18px 0 6px}table{border-collapse:collapse;width:100%;margin:6px 0 12px}th,td{border:1px solid #c8d1dc;padding:4px 6px;text-align:left;vertical-align:top}th{background:#eef2f7}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}.meta{color:#5a6b7d}.warn{background:#fff7dd;border:1px solid #f4c542;padding:6px 8px;margin:6px 0}.prov{background:#ffe5e5;border:1px solid #d33;padding:6px 8px;margin:6px 0;font-weight:600}.foot{margin-top:18px;font-size:11px;color:#5a6b7d;border-top:1px solid #c8d1dc;padding-top:6px}.pagebreak{page-break-before:always}@media print{.noprint{display:none}body{margin:12mm}}";
  MT.reportDoc = function (title, body) {
    return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>" + esc(title) + "</title><style>" + REPORT_CSS + "</style></head><body><div class=\"noprint\"><button onclick=\"window.print()\">Print / Save as PDF</button></div>" + (window.MT_LOGO ? "<img src=\"" + window.MT_LOGO + "\" alt=\"Techmin Wealth Partners\" style=\"height:38px;margin-bottom:8px\">" : "") + body + "<div class=\"foot\">Generated by MSME Tools " + esc(MT.cfg.appName) + " v" + esc(MT.cfg.version) + " on " + new Date().toLocaleString("en-IN") + ". Calculated on the user's own computer; no data was sent anywhere. This report is a working aid and not legal or tax advice - have it reviewed by a qualified professional.</div></body></html>";
  };
  MT.openReport = function (title, html) {
    var w = null;
    try { w = window.open("", "_blank"); } catch (e) {}
    if (!w) { toast("Pop-up blocked. Use 'Download report (HTML)'.", "warn", "MT-RPT-001"); return false; }
    w.document.open(); w.document.write(html); w.document.close(); return true;
  };
  MT.downloadReport = function (name, html) { download(name, "text/html;charset=utf-8", html); };

  /* ---------- tabs / shell ---------- */
  var activeTab = null;
  MT.render = function () {
    renderHeader();
    var c = MT.company();
    var tabs = MT.cfg.tabs;
    var nav = $("#tabs"); nav.innerHTML = "";
    tabs.forEach(function (t) {
      nav.appendChild(h("button", { class: "tab" + (activeTab === t.id ? " on" : ""), type: "button", role: "tab", "aria-selected": activeTab === t.id ? "true" : "false", onclick: function () { activeTab = t.id; try { localStorage.setItem("mt-tab-" + MT.cfg.appId, t.id); } catch (e) {} MT.render(); } }, t.label));
    });
    var main = $("#main"); main.innerHTML = "";
    if (!c && activeTab !== "backup" && activeTab !== "help") {
      main.appendChild(h("div", { class: "empty" }, h("h2", { text: "Welcome to " + MT.cfg.appName }),
        h("p", { text: "Start by adding your company. Everything you enter stays in this browser." }),
        h("button", { class: "btn primary", type: "button", onclick: function () { MT.companyForm(null); } }, "Add my company")));
      return;
    }
    var t = tabs.find(function (x) { return x.id === activeTab; }) || tabs[0];
    t.render(main, { company: c, h: h });
  };
  function renderHeader() {
    var sel = $("#companysel"); if (!sel) return;
    sel.innerHTML = "";
    var cs = Array.from(S.companies.values()).sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (!cs.length) sel.appendChild(h("option", { value: "" }, "No company yet"));
    cs.forEach(function (c) { sel.appendChild(h("option", { value: c.id, selected: c.id === S.companyId }, c.name)); });
    $("#editco").disabled = !MT.company(); $("#delco").disabled = !MT.company();
  }

  /* shared tab builders */
  function table(cols, rows, opts) {
    opts = opts || {};
    var t = h("table", { class: "grid" }, h("thead", null, h("tr", null, cols.map(function (c) { return h("th", { class: c.n ? "n" : "" }, c.label); }))),
      h("tbody", null, rows.length ? rows : [h("tr", null, h("td", { colspan: cols.length, class: "muted" }, opts.empty || "Nothing to show yet."))]));
    return h("div", { class: "tablewrap" }, t);
  }
  MT.table = table;
  MT.tabInvoices = function (main, extra) {
    extra = extra || {};
    var inv = MT.invoicesOf(), q = (MT._q || "").toLowerCase();
    var list = inv.filter(function (i) { var p = S.parties.get(i.partyId); return !q || (i.invoiceNo + " " + (p ? p.name : "")).toLowerCase().indexOf(q) >= 0; });
    var bar = h("div", { class: "toolbar" },
      h("button", { class: "btn primary", type: "button", onclick: function () { MT.invoiceForm(null); } }, "+ Add invoice"),
      h("input", { type: "search", placeholder: "Search invoice or party", "aria-label": "Search", value: MT._q || "", oninput: function (e) { MT._q = e.target.value; var pos = e.target.selectionStart; MT.render(); var n = $("input[type=search]"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } }),
      h("span", { class: "grow" }),
      extra.toolbar || null);
    var cols = [{ label: MT.company().role === "buyer" ? "Supplier" : "Buyer" }, { label: "Invoice" }, { label: "Invoice date" }, { label: "Delivery" }, { label: "Total ₹", n: true }, { label: "Paid ₹", n: true }, { label: "Last day to pay" }].concat(extra.cols || []);
    var rows = list.map(function (i) {
      var p = S.parties.get(i.partyId), terms = E.resolveTerms(i), paid = (i.payments || []).reduce(function (s, x) { return s + (x.paise || 0); }, 0);
      var cells = [h("td", { text: p ? p.name : "?" }), h("td", { text: i.invoiceNo }), h("td", { text: E.fmtDMY(i.invoiceDate) }), h("td", { text: E.fmtDMY(i.deliveryDate) }), h("td", { class: "n", text: E.fmtINR(i.totalPaise) }), h("td", { class: "n", text: E.fmtINR(paid) }),
        h("td", { text: terms.errors.length ? "—" : terms.pendingAcceptance ? "Acceptance pending" : E.fmtDMY(E.fromDn(terms.dueDn)) })];
      if (extra.cells) cells = cells.concat(extra.cells(i));
      return h("tr", { class: "click", tabindex: "0", onclick: function () { MT.invoiceForm(i); }, onkeydown: function (e) { if (e.key === "Enter") MT.invoiceForm(i); } }, cells);
    });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Invoices" }), bar, table(cols, rows, { empty: "No invoices yet. Add one, or import a CSV / TXT file from the Backup tab." }),
      h("p", { class: "muted", text: list.length + " of " + inv.length + " invoice(s). Click a row to edit." })));
  };
  MT.tabParties = function (main) {
    var rows = MT.partiesOf().map(function (p) {
      var n = MT.invoicesOf().filter(function (i) { return i.partyId === p.id; }).length;
      return h("tr", { class: "click", tabindex: "0", onclick: function () { MT.partyForm(p); }, onkeydown: function (e) { if (e.key === "Enter") MT.partyForm(p); } },
        h("td", { text: p.name }), h("td", { text: p.udyamNo || "—" }), h("td", { text: p.udyamDate ? E.fmtDMY(p.udyamDate) : "—" }), h("td", { text: p.category }), h("td", { text: p.activity }), h("td", { class: "n", text: n }));
    });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Parties" }),
      h("div", { class: "toolbar" }, h("button", { class: "btn primary", type: "button", onclick: function () { MT.partyForm(null); } }, "+ Add party")),
      table([{ label: "Name" }, { label: "Udyam no." }, { label: "Registered on" }, { label: "Category" }, { label: "Activity" }, { label: "Invoices", n: true }], rows, { empty: "No parties yet." }),
      h("button", { class: "btn small danger", type: "button", style: "margin-top:8px", onclick: function () {
        var unused = MT.partiesOf().filter(function (p) { return !MT.invoicesOf().some(function (i) { return i.partyId === p.id; }); });
        if (!unused.length) { toast("Every party is used by an invoice.", "info"); return; }
        MT.confirm("Delete unused parties?", unused.length + " party(ies) without invoices will be deleted.", "Delete", "danger").then(function (ok) { if (ok) { unused.forEach(function (p) { drop("parties", p.id); }); MT.render(); } });
      } }, "Delete parties without invoices")));
  };
  MT.tabRates = function (main) {
    var all = E.sortedRates(MT.rates()).slice().reverse();
    var rows = all.map(function (r) {
      return h("tr", null, h("td", { text: E.fmtDMY(r.from) }), h("td", { class: "n", text: E.fmtPct(r.bank) }), h("td", { class: "n", text: E.fmtPct(r.bank * 3) }), h("td", null, h("span", { class: "pill " + (r.status === "verified" ? "ok" : "warn") }, r.status === "verified" ? "Verified" : "Unverified")), h("td", { class: "small", text: r.source }),
        h("td", null, r.custom ? h("button", { class: "btn small danger", type: "button", onclick: function () { S.kv.customRates = MT.rates().filter(function (x) { return x.id !== r.id; }); touch("kv", "customRates", true); MT.render(); } }, "Delete") : ""));
    });
    var form = h("div", { class: "form" }, h("div", { class: "fld wide" }, h("div", { class: "ferr", id: "e_formtop" })), field({ key: "from", label: "Effective from", type: "date" }), field({ key: "bank", label: "Bank Rate % (e.g. 5.75)", type: "text" }), field({ key: "source", label: "Source / press release reference", wide: true }));
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "RBI Bank Rate master" }),
      h("p", null, "Interest under s.16 = 3 × Bank Rate. Built-in rates are verified up to ", h("strong", { text: E.fmtDMY(E.RATE_VERIFIED_THROUGH) }), ". If RBI changes the rate after this date, add it below; calculations that depend on it are marked PROVISIONAL until you verify it."),
      table([{ label: "Effective from" }, { label: "Bank Rate", n: true }, { label: "Interest rate (3×)", n: true }, { label: "Status" }, { label: "Source" }, { label: "" }], rows),
      h("h3", { text: "Add a newly announced rate" }), form,
      h("button", { class: "btn primary", type: "button", onclick: function () {
        var v = readForm(form, [{ key: "from" }, { key: "bank" }, { key: "source" }]), errs = [];
        var b = /^\d{1,2}(\.\d{1,2})?$/.test(v.bank) ? Math.round(parseFloat(v.bank) * 100) : null;
        if (!E.parseISO(v.from) || b === null || b < 1 || b > 3000) errs.push({ code: "MT-RAT-004", field: "from" });
        else if (E.sortedRates(MT.rates()).some(function (r) { return r.from === v.from; })) errs.push({ code: "MT-RAT-005", field: "from" });
        if (errs.length) { MT.showErrors(form, errs); return; }
        var cr = MT.rates().concat([{ id: "CR" + uid(), from: v.from, bank: b, source: v.source || "User entered", status: "unverified", custom: true }]);
        S.kv.customRates = cr; touch("kv", "customRates", true); MT.render(); toast("Rate added and marked UNVERIFIED.", "warn", "MT-RAT-003");
      } }, "Add rate (unverified)")));
  };
  MT.tabBackup = function (main) {
    var last = S.kv.lastBackup, age = last ? Math.floor((Date.now() - new Date(last)) / 86400000) : null;
    var fileIn = function (accept, handler) { var i = h("input", { type: "file", accept: accept, style: "display:none", onchange: function (e) { if (e.target.files[0]) handler(e.target.files[0]); e.target.value = ""; } }); document.body.appendChild(i); i.click(); setTimeout(function () { i.remove(); }, 60000); };
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Backup and restore" }),
      h("div", { class: "banner " + (last && age <= 30 ? "ok" : "warn") }, last ? "Last backup: " + new Date(last).toLocaleString("en-IN") + (age > 30 ? " - more than 30 days ago. " : ". ") : "No backup taken yet. ", (!last || age > 30) ? errChip(last ? "MT-BKP-004" : "MT-BKP-002") : null),
      h("p", { text: "Your data lives only in this browser. A browser reset, profile deletion or device failure can erase it. Download a JSON backup regularly and keep a copy outside this computer." }),
      h("div", { class: "toolbar wrap" },
        h("button", { class: "btn primary", type: "button", onclick: MT.exportJSON }, "Download JSON backup"),
        h("button", { class: "btn", type: "button", onclick: function () { fileIn(".json,application/json", MT.restoreJSON); } }, "Restore from JSON backup"),
        h("button", { class: "btn", type: "button", onclick: MT.undoRestore }, "Undo last restore")),
      h("h3", { text: "Invoices as CSV or TXT (current company)" }),
      h("div", { class: "toolbar wrap" },
        h("button", { class: "btn", type: "button", onclick: MT.exportCSV }, "Export CSV"),
        h("button", { class: "btn", type: "button", onclick: MT.exportTemplate }, "Download CSV template"),
        h("button", { class: "btn", type: "button", onclick: function () { fileIn(".csv,text/csv", MT.importCSV); } }, "Import CSV"),
        h("button", { class: "btn", type: "button", onclick: MT.exportTXT }, "Export TXT"),
        h("button", { class: "btn", type: "button", onclick: function () { fileIn(".txt,text/plain", MT.importTXT); } }, "Import TXT")),
      h("p", { class: "muted", text: "Imports check every row, skip duplicates (same party, invoice number and date) and list rows with problems. Nothing is uploaded anywhere." })));
  };
  MT.tabHelp = function (main) {
    var items = [["guide", "User guide"], ["legal", "Legal methodology"], ["troubleshooting", "Troubleshooting"], ["faq", "Frequently asked questions"], ["privacy", "Privacy and data storage"], ["release", "Release notes"], ["tests", "Test cases and report"], ["errors", "Error code reference"], ["sources", "Legal source and rule register"]];
    var view = h("div", { class: "doc", id: "docview" });
    var nav = h("div", { class: "docnav" }, items.map(function (it) { return h("button", { class: "btn small", type: "button", onclick: function () { showDoc(it[0]); } }, it[1]); }));
    function showDoc(k) { view.innerHTML = MT.docHTML(k); view.scrollTop = 0; }
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Help" }), nav, view)); showDoc(MT._doc || "guide");
  };
  MT.docHTML = function (k) {
    var docs = window.MTDOCS || {};
    if (k === "errors") {
      var cats = {}; D.ERRORS.forEach(function (e) { (cats[e.category] = cats[e.category] || []).push(e); });
      return "<h1>Error code reference</h1><p>Every message in this tool carries a code. Click a red, amber or blue code chip anywhere to read the same details.</p>" + Object.keys(cats).map(function (c) {
        return "<h2>" + esc(c) + "</h2><table class=\"grid\"><thead><tr><th>Code</th><th>Title</th><th>Severity</th><th>Continue?</th><th>What it means</th><th>Possible cause</th><th>What to do</th></tr></thead><tbody>" + cats[c].map(function (e) { return "<tr id=\"" + e.code + "\"><td><strong>" + e.code + "</strong></td><td>" + esc(e.title) + "</td><td>" + e.severity + "</td><td>" + e.canContinue + "</td><td>" + esc(e.explanation) + "</td><td>" + esc(e.cause) + "</td><td>" + esc(e.action) + "</td></tr>"; }).join("") + "</tbody></table>";
      }).join("");
    }
    if (k === "sources") {
      return "<h1>Legal source and rule register</h1><p>Status meaning: <strong>official</strong> = read on the official website; <strong>secondary</strong> = official text reproduced or reported elsewhere, to be re-checked; <strong>convention</strong> = a calculation choice that the law does not fix. Verification date: " + E.fmtDMY(D.VERIFIED_ON) + ".</p><h2>Sources</h2><table class=\"grid\"><thead><tr><th>ID</th><th>Source</th><th>Held by</th><th>Status</th><th>Note</th></tr></thead><tbody>" +
        D.SOURCES.map(function (s) { return "<tr><td>" + s.id + "</td><td>" + esc(s.title) + "<br><small>" + esc(s.url) + "</small></td><td>" + esc(s.holder) + "</td><td>" + s.status + "</td><td>" + esc(s.note) + "</td></tr>"; }).join("") +
        "</tbody></table><h2>Rules</h2><table class=\"grid\"><thead><tr><th>Rule ID</th><th>Description</th><th>Provision</th><th>From</th><th>To</th><th>Source</th><th>Verified</th><th>Version</th><th>Status</th><th>Implementation</th></tr></thead><tbody>" +
        D.RULES.map(function (r) { return "<tr><td>" + r.id + "</td><td>" + esc(r.desc) + "</td><td>" + esc(r.prov) + "</td><td>" + (r.from ? E.fmtDMY(r.from) : "—") + "</td><td>" + (r.to ? E.fmtDMY(r.to) : "open") + "</td><td>" + esc(r.src || "—") + "</td><td>" + E.fmtDMY(r.verified) + "</td><td>" + r.ver + "</td><td>" + r.status + "</td><td>" + esc(r.impl) + "</td></tr>"; }).join("") + "</tbody></table>";
    }
    if (k === "release") {
      return "<h1>Release notes</h1>" + D.RELEASE.map(function (r) { return "<h2>Version " + r.v + " - " + r.date + "</h2><ul>" + r.notes.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>"; }).join("");
    }
    return docs[k] || "<p>Document not available.</p>";
  };
  MT.openDoc = function (k) { MT._doc = k; MT.setTab("help"); };
  MT.setTab = function (id) { activeTab = id; try { localStorage.setItem("mt-tab-" + MT.cfg.appId, id); } catch (e) {} MT.render(); };

  /* ---------- boot ---------- */
  function shell() {
    var cfg = MT.cfg;
    document.body.innerHTML = "";
    document.body.appendChild(h("a", { class: "skip", href: "#main" }, "Skip to content"));
    var head = h("header", { class: "top" },
      h("div", { class: "row1" },
        h("div", { class: "brand" }, (window.MT_LOGO ? h("img", { class: "tlogo", src: window.MT_LOGO, alt: "Techmin Wealth Partners" }) : h("span", { class: "logo", "aria-hidden": "true" }, "M")), h("div", null, h("strong", { text: "MSME Tools" }), h("span", { class: "app", text: cfg.appName }), h("span", { class: "ver", text: "v" + cfg.version }))),
        h("div", { class: "co" },
          h("label", { class: "sr", for: "companysel" }, "Company"), h("select", { id: "companysel", onchange: function (e) { S.companyId = e.target.value; try { localStorage.setItem("mt-company-" + cfg.appId, S.companyId); } catch (x) {} MT.render(); } }),
          h("button", { class: "btn small", type: "button", onclick: function () { MT.companyForm(null); } }, "+ Company"),
          h("button", { class: "btn small", id: "editco", type: "button", onclick: function () { MT.companyForm(MT.company()); } }, "Edit"),
          h("button", { class: "btn small danger", id: "delco", type: "button", onclick: MT.deleteCompany }, "Delete")),
        h("div", { class: "savebox" }, h("span", { id: "savedot", class: "dot init" }), h("span", { id: "savestatus", "aria-live": "polite" }, "Starting…"), h("button", { id: "savebtn", class: "btn gold", type: "button", onclick: function () { MT.saveNow(true); } }, "SAVE"))),
      h("nav", { class: "row2", "aria-label": "Help links" },
        h("button", { class: "link", type: "button", onclick: function () { MT.openDoc("guide"); } }, "Help / User Guide"),
        h("button", { class: "link", type: "button", onclick: function () { MT.openDoc("errors"); } }, "Error Codes"),
        h("button", { class: "link", type: "button", onclick: function () { MT.openDoc("release"); } }, "Release Notes"),
        h("button", { class: "link", type: "button", onclick: function () { MT.openDoc("privacy"); } }, "Privacy"),
        h("a", { class: "link", href: "../" }, "All MSME Tools"),
        h("button", { class: "link", type: "button", id: "themebtn", onclick: toggleTheme }, "Dark / Light")));
    document.body.appendChild(head);
    document.body.appendChild(h("div", { id: "banners", class: "banners" }));
    document.body.appendChild(h("nav", { id: "tabs", class: "tabs", role: "tablist" }));
    document.body.appendChild(h("main", { id: "main", tabindex: "-1" }));
    document.body.appendChild(h("footer", { class: "foot" }, "MSME Tools " + cfg.appName + " v" + cfg.version + " · Works offline · Your data stays in this browser and is never sent to Techmin or anyone else · A working aid, not legal or tax advice - confirm important positions with a qualified professional."));
    document.body.appendChild(h("div", { id: "toasts", class: "toasts", "aria-live": "polite" }));
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur); try { localStorage.setItem("mt-theme", cur); } catch (e) {}
  }
  function fatal(code) {
    var e = MT.err(code);
    document.body.innerHTML = "";
    document.body.appendChild(h("div", { class: "fatal" }, h("h1", { text: "MSME Tools cannot start" }), h("p", null, h("strong", { text: code + " - " + e.title })), h("p", { text: e.explanation }), h("p", { text: "What to do: " + e.action })));
  }
  MT.start = function (cfg) {
    MT.cfg = cfg;
    try { var th = localStorage.getItem("mt-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
    if (typeof BigInt === "undefined" || !window.indexedDB) { return fatal(window.indexedDB ? "MT-BRW-001" : "MT-DBS-001"); }
    shell();
    window.addEventListener("error", function (ev) { console.error(ev.error || ev.message); });
    openDB("msme-tools-" + cfg.appId).then(function () {
      return Promise.all(STORES.concat(["kv"]).map(readAll));
    }).then(function (all) {
      STORES.forEach(function (s, i) { all[i].forEach(function (o) { S[s].set(o.id, o); }); });
      all[4].forEach(function (r) { S.kv[r.key] = r.value; });
      var saved = null; try { saved = localStorage.getItem("mt-company-" + cfg.appId); } catch (e) {}
      S.companyId = S.companies.has(saved) ? saved : (Array.from(S.companies.keys())[0] || null);
      activeTab = null; try { activeTab = localStorage.getItem("mt-tab-" + cfg.appId); } catch (e) {}
      if (!cfg.tabs.some(function (t) { return t.id === activeTab; })) activeTab = cfg.tabs[0].id;
      ready = true; setStatus("clean"); MT.render(); MT.recoverDraft();
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(function (ok) { if (!ok) console.info("MT-BRW-002 persistent storage not granted"); });
      if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(function () { console.info("MT-BRW-003"); });
      document.documentElement.setAttribute("data-ready", "1");
    }).catch(function (e) {
      var code = (e && e.code) || "MT-DBS-002"; console.error(e);
      if (code === "MT-DBS-004") { loadFailed = true; ready = true; setStatus("failed"); toast("Saved data could not be read.", "error", code); }
      else fatal(code);
    });
  };
  MT.parts = { toTXT: toTXT, parseTXT: parseTXT, toCSV: toCSV, parseCSV: parseCSV, importRows: importRows };
})();
