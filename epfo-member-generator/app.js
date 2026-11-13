/*! Techmin EPFO Member Registration Bulk File Generator - UI. Runs entirely in the browser; nothing is uploaded. */
(function () {
  "use strict";
  var EP = window.EP, VERSION = EP.VERSION;
  var FEEDBACK_URL = "__FEEDBACK_URL__";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LAZY = {};
  function lazy(src) { return LAZY[src] || (LAZY[src] = new Promise(function (ok, no) { var e = document.createElement("script"); e.src = src; e.onload = ok; e.onerror = function () { delete LAZY[src]; no(new Error("load")); }; document.head.appendChild(e); })); }
  function needX(fn) { return function () { var a = arguments, t = this; if (window.XLSX) return fn.apply(t, a); lazy("lib/xlsx.full.min.js").then(function () { fn.apply(t, a); }, function () { toast("The Excel library could not be loaded. Reload the page and try again.", "error", "EP-LIB-001"); }); }; }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k]; if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v; else if (k === "text") el.textContent = v; else if (k === "html") el.innerHTML = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v; else if (v === true) el.setAttribute(k, ""); else el.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) c.forEach(function (x) { add(el, x); }); else if (c.nodeType) el.appendChild(c); else el.appendChild(document.createTextNode(String(c))); }
  function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }
  function btn(label, fn, cls, extra) { return h("button", Object.assign({ class: "btn" + (cls ? " " + cls : ""), type: "button", onclick: fn }, extra || {}), label); }
  function pad2(n) { return ("0" + n).slice(-2); }
  function localStamp() { var d = new Date(); return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()); }
  function nowText() { return new Date().toLocaleString("en-IN"); }
  function yieldUI() { return new Promise(function (r) { setTimeout(r, 0); }); }

  /* ================= state and storage ================= */
  var DB = null, saveState = "init", pending = 0, draftTimer = null;
  var S = { members: new Map(), kv: {}, val: null, page: "dashboard", ready: false, editId: null, draft: null, focusField: null, imp: null,
    reg: { q: "", status: "", iw: "", da: "", sort: "name", dir: 1, page: 1, size: 25, sel: new Set() }, genScope: "all", vq: { level: "", q: "" } };
  var SETTINGS_DEFAULT = { includeHeader: true, crlf: false, yesNo: "yesno", defaultNationality: "77", defaultQualification: "", fileBase: "EPFO_Member_Registration_Bulk", autosave: true, requiredFields: EP.DEFAULT_CFG.requiredFields.slice(), requireMobile: false, requireEmail: false, requireBank: false, requirePan: false, requireConsent: true, checkAadhaarChecksum: true, checkNameMatch: true, confirmedYesNo: false };
  function settings() { return Object.assign({}, SETTINGS_DEFAULT, S.kv.settings || {}); }
  function cfg() { var s = settings(); return Object.assign({}, EP.DEFAULT_CFG, { includeHeader: s.includeHeader, eol: s.crlf ? "\r\n" : "\n", yesNo: s.yesNo, requiredFields: s.requiredFields, requireMobile: s.requireMobile, requireEmail: s.requireEmail, requireBank: s.requireBank, requirePan: s.requirePan, requireConsent: s.requireConsent, checkAadhaarChecksum: s.checkAadhaarChecksum, checkNameMatch: s.checkNameMatch }); }
  function lists() { var l = S.kv.codeLists || {}; return { nationality: l.nationality && l.nationality.length ? l.nationality : EP.CODES.nationality, countryOfOrigin: l.countryOfOrigin && l.countryOfOrigin.length ? l.countryOfOrigin : EP.CODES.countryOfOrigin }; }
  function setStatus(st, msg) {
    saveState = st; var d = $("#savedot"), t = $("#savestatus");
    if (d) d.className = "dot " + st;
    var txt = { init: "Starting…", clean: "Nothing to save yet", dirty: "Unsaved changes", saving: "Saving…", saved: "Saved successfully", failed: "Save failed - storage error" }[st];
    if (t) t.textContent = msg || txt;
    var ls = $("#lastsaved"); if (ls && S.kv.lastSaved) ls.textContent = "Last saved " + new Date(S.kv.lastSaved).toLocaleString("en-IN");
  }
  function openDB() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej({ code: "EP-DB-001" });
      var rq = indexedDB.open("techmin-epfo-member-generator", 1);
      rq.onupgradeneeded = function () { var d = rq.result; d.createObjectStore("members", { keyPath: "id" }); d.createObjectStore("kv", { keyPath: "key" }); };
      rq.onsuccess = function () { DB = rq.result; res(); };
      rq.onerror = rq.onblocked = function () { rej({ code: "EP-DB-002" }); };
    });
  }
  function tx(stores, mode, fn) {
    return new Promise(function (res, rej) {
      var t = DB.transaction(stores, mode), out;
      t.oncomplete = function () { res(out); }; t.onerror = t.onabort = function () { rej(t.error || { code: "EP-DB-003" }); };
      out = fn(t);
    });
  }
  function readAll(store) { return new Promise(function (res, rej) { var rq = DB.transaction(store, "readonly").objectStore(store).getAll(); rq.onsuccess = function () { res(rq.result); }; rq.onerror = function () { rej(rq.error); }; }); }
  function done(ok) { if (ok) { S.kv.lastSaved = Date.now(); if (--pending <= 0) { pending = 0; setStatus("saved"); } } else { pending = Math.max(0, pending - 1); setStatus("failed"); toast("Could not save to this browser's storage. Download a backup now.", "error", "EP-DB-003"); } }
  function persistKV(key, value) { S.kv[key] = value; if (!DB) return Promise.resolve(); pending++; setStatus("saving"); return tx("kv", "readwrite", function (t) { t.objectStore("kv").put({ key: key, value: value }); }).then(function () { done(true); }, function () { done(false); }); }
  function persistMember(m) { m.updated = Date.now(); S.members.set(m.id, m); S.val = null; if (!DB) return Promise.resolve(); pending++; setStatus("saving"); return tx("members", "readwrite", function (t) { t.objectStore("members").put(m); }).then(function () { return persistKV("lastSavedAt", Date.now()); }).then(function () { done(true); }, function () { done(false); }); }
  function persistMany(arr, deleteIds) {
    arr.forEach(function (m) { S.members.set(m.id, m); }); (deleteIds || []).forEach(function (id) { S.members.delete(id); }); S.val = null;
    if (!DB) return Promise.resolve(); pending++; setStatus("saving");
    return tx("members", "readwrite", function (t) { var st = t.objectStore("members"); arr.forEach(function (m) { st.put(m); }); (deleteIds || []).forEach(function (id) { st.delete(id); }); }).then(function () { done(true); }, function () { done(false); });
  }
  function clearMembers() { S.members.clear(); S.val = null; pending++; setStatus("saving"); return tx("members", "readwrite", function (t) { t.objectStore("members").clear(); }).then(function () { done(true); }, function () { done(false); }); }
  function snapshotPrev() { var arr = Array.from(S.members.values()); return persistKV("prevSnapshot", { at: Date.now(), count: arr.length, members: arr }); }
  function newMember(d) { var m = { id: uid(), created: Date.now(), updated: Date.now(), d: EP.normalise(d || {}) }; return m; }

  /* validation cache */
  function V() {
    if (S.val) return S.val;
    var c = cfg(), l = lists(), ids = Array.from(S.members.keys()), recs = ids.map(function (id) { return S.members.get(id).d; }), dups = EP.duplicates(recs), val = new Map();
    ids.forEach(function (id, i) { var is = EP.validate(recs[i], c, l).concat(dups[i] || []); val.set(id, { issues: is, status: EP.statusOf(is) }); });
    S.val = val; return val;
  }
  function counts() {
    var v = V(), c = { total: S.members.size, green: 0, amber: 0, red: 0, iw: 0, da: 0 };
    S.members.forEach(function (m, id) { c[v.get(id).status]++; if (m.d.isInternationalWorker === "Y") c.iw++; if (m.d.isPhisicalHandicap === "Y") c.da++; });
    return c;
  }
  function mask(v, keep) { v = String(v || ""); if (!v) return ""; if (v.length <= keep) return v; return v.slice(0, -keep).replace(/[0-9A-Za-z]/g, "•") + v.slice(-keep); }
  function maskAadhaar(v) { v = String(v || ""); if (v.length !== 12) return mask(v, 4); return "XXXX XXXX " + v.slice(8); }

  /* ================= toast, modal, download ================= */
  function toast(msg, kind, code) {
    var box = $("#toasts"); if (!box) return;
    var t = h("div", { class: "toast " + (kind || "info"), role: "status" }, h("span", { text: msg }), code ? h("button", { class: "chip error", type: "button", onclick: function () { openDoc("errors", code); } }, code) : null, h("button", { class: "x", "aria-label": "Dismiss", type: "button", onclick: function () { t.remove(); } }, "×"));
    box.appendChild(t); setTimeout(function () { if (t.parentNode) t.remove(); }, kind === "error" ? 12000 : 5000);
  }
  function modal(title, body, buttons, opts) {
    var back = h("div", { class: "modal-back" }), prev = document.activeElement;
    function close() { back.remove(); if (prev && prev.focus) try { prev.focus(); } catch (e) {} }
    var foot = h("div", { class: "modal-foot" }, (buttons || [{ label: "Close" }]).map(function (b) { return h("button", { class: "btn" + (b.cls ? " " + b.cls : ""), type: "button", onclick: function () { var r = b.onclick ? b.onclick(close) : undefined; if (r !== false && !b.keep) close(); } }, b.label); }));
    var m = h("div", { class: "modal" + (opts && opts.wide ? " wide" : ""), role: "dialog", "aria-modal": "true", "aria-label": title }, h("div", { class: "modal-head" }, h("h2", { text: title }), h("button", { class: "x", "aria-label": "Close", type: "button", onclick: close }, "×")), h("div", { class: "modal-body" }, body), foot);
    back.appendChild(m); back.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); }); back.addEventListener("click", function (e) { if (e.target === back) close(); });
    document.body.appendChild(back); var f = m.querySelector("input,select,textarea,.modal-foot .btn"); if (f) f.focus(); return close;
  }
  function confirmBox(title, text, okLabel, onOk, danger) { modal(title, h("p", { text: text }), [{ label: "Cancel" }, { label: okLabel, cls: danger ? "danger" : "primary", onclick: function () { onOk(); } }]); }
  function download(name, mime, data) { var blob = data instanceof Blob ? data : new Blob([data], { type: mime }), a = h("a", { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800); }
  function readFile(file, asText) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; asText ? r.readAsText(file) : r.readAsArrayBuffer(file); }); }
  function guard(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { toast("Something went wrong: " + (e && e.message ? e.message : e), "error", "EP-APP-001"); } }; }

  /* ================= navigation ================= */
  var PAGES = [["dashboard", "Dashboard"], ["add", "Add Member"], ["register", "Member Register"], ["excel", "Excel Import"], ["json", "JSON Import"], ["txt", "TXT Import"], ["validation", "Validation Centre"], ["generate", "Generate EPFO TXT"], ["templates", "Templates"], ["backup", "Backup & Restore"], ["settings", "Settings"], ["help", "Help & Instructions"]];
  function go(page, opts) { opts = opts || {}; if (page === "add") { S.editId = opts.id || null; S.focusField = opts.field || null; if (!opts.keepDraft) { if (S.draft && S.draft.editId !== S.editId) S.draft = null; } } S.page = page; render(); window.scrollTo(0, 0); }
  function pageFn(p) { return { dashboard: pageDashboard, add: pageAdd, register: pageRegister, excel: pageExcel, json: pageJson, txt: pageTxt, validation: pageValidation, generate: pageGenerate, templates: pageTemplates, backup: pageBackup, settings: pageSettings, help: pageHelp }[p]; }
  function statPill(st) { return h("span", { class: "pill " + (st === "green" ? "ok" : st === "amber" ? "warn" : "err"), text: st === "green" ? "Valid" : st === "amber" ? "Warning" : "Error" }); }
  function notice(kind, html) { return h("div", { class: "banner " + kind, html: html }); }
  function epfoNotice() { return h("div", { class: "banner warn", role: "note" }, h("strong", { text: "IMPORTANT EPFO INSTRUCTION" }), h("p", { style: "margin:6px 0 0", text: "As per the supplied EPFO portal notice, UAN generation through the member registration module is restricted except for International Workers and citizens of Nepal and Bhutan. Other new employees should be guided to generate UAN through face authentication using the UMANG mobile application." }), h("p", { class: "small", style: "margin:6px 0 0", text: "Member registration cases must be completed within the stated 60-day period. KYC seeded must be digitally approved within the stated 60-day period. DSC/eSign is not required in cases of verified Aadhaar, as indicated in the supplied reference. This software prepares registration data files only. It does not submit registrations to EPFO or approve member KYC." })); }
  var PRIVACY = "Your employee data remains on your device. Techmin HR Solutions does not receive, upload or store your employee registration information on its servers. All processing and file generation take place locally in your browser.";
  var DISCLAIMER = "This application is an independent data preparation utility developed by Techmin HR Solutions. It is not an official EPFO application and does not directly submit data to EPFO. Users must verify the generated file and applicable EPFO requirements before uploading.";

  /* ================= dashboard ================= */
  function pageDashboard(main) {
    var c = counts();
    main.appendChild(h("h2", { text: "Dashboard" }));
    main.appendChild(h("div", { class: "grid3" }, [["Total Members", c.total, ""], ["Valid Records", c.green, ""], ["Records with Errors", c.red, c.red ? "err" : ""], ["Records with Warnings", c.amber, c.amber ? "warn" : ""], ["International Workers", c.iw, ""], ["Differently Abled Members", c.da, ""]].map(function (x) { return h("div", { class: "stat " + x[2] }, h("div", { class: "k", text: x[0] }), h("div", { class: "v", text: String(x[1]) })); })));
    main.appendChild(epfoNotice());
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "What would you like to do?" }), h("div", { class: "toolbar" }, btn("Add a member", function () { go("add"); }, "primary"), btn("Import from Excel", function () { go("excel"); }), btn("Import from JSON", function () { go("json"); }), btn("Import EPFO TXT", function () { go("txt"); }), btn("Check records", function () { go("validation"); }), btn("Generate EPFO TXT", function () { go("generate"); }, "gold"))));
    if (!c.total) main.appendChild(h("div", { class: "card" }, h("h2", { text: "Getting started" }), h("p", { text: "No members yet. Add a member, import an Excel, JSON or TXT file, or try the sample data of 100 invented employees from Templates." }), btn("Load sample data", function () { go("templates"); })));
    main.appendChild(h("div", { class: "banner ok" }, h("strong", { text: "Privacy. " }), PRIVACY));
  }

  /* ================= member form ================= */
  function defaultRecord() { var r = EP.blank(), s = settings(); r.nationality = s.defaultNationality || "77"; r.qualification = s.defaultQualification || ""; return r; }
  function codeOptions(tbl, withBlank) { var o = []; if (withBlank !== false) o.push(h("option", { value: "", text: "Select" })); tbl.forEach(function (x) { o.push(h("option", { value: x[0], text: x[1] + " – " + x[0] })); }); return o; }
  function scheduleDraft() { setStatus("dirty"); clearTimeout(draftTimer); if (settings().autosave === false) return; draftTimer = setTimeout(function () { if (S.draft) persistKV("draft", S.draft); }, 600); }
  function pageAdd(main) {
    var m = S.editId ? S.members.get(S.editId) : null;
    if (S.editId && !m) { S.editId = null; }
    var restored = false, F;
    if (S.draft && S.draft.editId === S.editId) { F = S.draft.d; restored = !!S.draft.dirty; } else { F = m ? Object.assign({}, m.d) : defaultRecord(); S.draft = { editId: S.editId, d: F, dirty: false }; }
    var touched = {}, submitted = false, inputs = {}, errEls = {}, secs = {};
    main.appendChild(h("h2", { text: m ? "Edit member" : "Add member" }));
    if (restored) main.appendChild(h("div", { class: "banner ok", text: "Your unfinished entry was restored from this browser's auto-save." }));
    main.appendChild(epfoNotice());
    function refresh() {
      var rec = EP.normalise(F), is = EP.validate(rec, cfg(), lists()), by = {}; if (radioYes.checked && !rec.UAN) is.push({ field: "UAN", level: "error", code: "EP-PUAN", msg: "Enter the member's UAN, because previous employment / UAN is set to Yes." });
      is.forEach(function (i) { if (submitted || touched[i.field]) (by[i.field] = by[i.field] || []).push(i); });
      Object.keys(errEls).forEach(function (f) { var el = errEls[f], arr = by[f] || []; el.innerHTML = ""; arr.forEach(function (i) { el.appendChild(h("div", { class: i.level === "error" ? "ferr" : "small", style: i.level === "warn" ? "color:var(--warn)" : "", text: (i.level === "warn" ? "Warning: " : "") + i.msg })); }); var w = el.parentNode; if (w) w.classList.toggle("bad", arr.some(function (i) { return i.level === "error"; })); });
    }
    function changed(f, v) { F[f] = v; S.draft.dirty = true; if (f === "isInternationalWorker") sync(); if (f === "isPhisicalHandicap") { if (v !== "Y") { F.locomotive = F.hearing = F.visual = ""; ["locomotive", "hearing", "visual"].forEach(function (k) { if (inputs[k]) inputs[k].checked = false; }); } sync(); } if (f === "prevEmp") sync(); scheduleDraft(); refresh(); }
    function wrap(f, input, o) { o = o || {}; inputs[f] = input; var er = h("div", { "aria-live": "polite" }); errEls[f] = er; return h("div", { class: "fld" + (o.wide ? " wide" : "") + (o.chk ? " chk" : ""), id: "fld_" + f }, o.chk ? null : h("label", { for: "f_" + f, text: EP.LABEL[f] + (o.req ? " *" : "") }), input, o.help ? h("small", { text: o.help }) : null, er); }
    function txt(f, o) { o = o || {}; var i = h("input", { id: "f_" + f, type: "text", maxlength: o.max || "100", autocomplete: "off", value: F[f] || "", placeholder: o.ph || "", inputmode: o.mode || null, onblur: function () { touched[f] = true; refresh(); } }); i.addEventListener("input", function () { changed(f, i.value); }); return wrap(f, i, o); }
    function dateF(f, o) { o = o || {}; o.ph = "DD/MM/YYYY"; o.max = 10; o.help = o.help || "Format DD/MM/YYYY"; var w = txt(f, o), i = inputs[f]; i.addEventListener("blur", function () { var n = EP.normDate(i.value); if (n.ok && n.text !== i.value) { i.value = n.text; changed(f, n.text); } }); return w; }
    function sel(f, tbl, o) { o = o || {}; var i = h("select", { id: "f_" + f, onblur: function () { touched[f] = true; refresh(); } }, codeOptions(tbl)); i.value = F[f] || ""; if (i.value !== (F[f] || "") && F[f]) { i.appendChild(h("option", { value: F[f], text: F[f] + " (not in list)" })); i.value = F[f]; } i.addEventListener("change", function () { touched[f] = true; changed(f, i.value); }); return wrap(f, i, o); }
    function codeField(f, tbl, o) { if (tbl.length > 1) return sel(f, tbl, o); o = o || {}; o.help = (o.help ? o.help + " " : "") + "Only the codes confirmed in the brief are built in" + (f === "nationality" ? " (India = 77)" : "") + ". Type the numeric EPFO code, or load the full list in Settings."; o.mode = "numeric"; return txt(f, Object.assign({ max: 4 }, o)); }
    function chk(f, label, extra) { var i = h("input", { id: "f_" + f, type: "checkbox" }); i.checked = F[f] === "Y"; i.addEventListener("change", function () { touched[f] = true; changed(f, i.checked ? "Y" : ""); }); return wrap(f, i, { chk: true }), h("div", { class: "fld chk wide", id: "fld_" + f }, h("label", null, i, " " + label), errEls[f]); }
    var L = lists();
    /* A. previous employment */
    var prevOn = !!(F.prvMemberId || F.UAN);
    var radioNo = h("input", { type: "radio", name: "prev", id: "prev_no", checked: !prevOn }), radioYes = h("input", { type: "radio", name: "prev", id: "prev_yes", checked: prevOn });
    function setPrev(y) { F._prev = y; if (!y) { F.UAN = ""; F.prvMemberId = ""; ["UAN", "prvMemberId"].forEach(function (k) { if (inputs[k]) inputs[k].value = ""; }); S.draft.dirty = true; scheduleDraft(); } sync(); refresh(); }
    radioNo.addEventListener("change", function () { setPrev(false); }); radioYes.addEventListener("change", function () { setPrev(true); });
    var uanW = txt("UAN", { max: 12, mode: "numeric", req: true, help: "12 digits. Leading zeroes are kept." }), prvW = txt("prvMemberId", { max: 30, help: "Previous member ID, if known. Kept as text." });
    var prevFields = h("div", { class: "form" }, uanW, prvW);
    var secA = h("section", { class: "card" }, h("h2", { text: "A. Previous employment / UAN" }), h("p", { class: "small", text: "Does the member already have a UAN or a previous EPF member ID?" }), h("div", { class: "toolbar" }, h("label", null, radioNo, " No (new member)"), h("label", null, radioYes, " Yes")), prevFields, h("p", { class: "small muted", text: "Choose Yes when the member already has a UAN; then the UAN is required. The EPFO bulk file always keeps its 30 fields." }));
    /* B. personal */
    var nameRow = txt("memberName", { req: true, max: 85, help: "As per Aadhaar. Up to 85 characters." });
    var secB = h("section", { class: "card" }, h("h2", { text: "B. Personal details" }), h("div", { class: "form" },
      sel("salutation", EP.CODES.salutation, { req: true, help: "Asked on the EPFO form. It is not written to the bulk file." }), nameRow,
      dateF("DOB", { req: true }), sel("Gender", EP.CODES.Gender, { req: true }), codeField("nationality", L.nationality, { req: true }),
      txt("fatherHusbandName", { req: true, max: 85 }), sel("relation", EP.CODES.relation, { req: true }), sel("maritalStatus", EP.CODES.maritalStatus, { req: true }),
      txt("mobileNo", { max: 10, mode: "numeric", help: "10 digits" }), txt("emailId", { max: 100 }), sel("qualification", EP.CODES.qualification, {})));
    /* C. employment */
    var secC = h("section", { class: "card" }, h("h2", { text: "C. Employment details" }), h("div", { class: "form" }, dateF("DOJ", { req: true }), txt("epfWages", { req: true, max: 8, mode: "decimal", help: "Actual EPF wages applicable. Gross salary is never substituted." })));
    /* D. international */
    var iwBox = chk("isInternationalWorker", "International worker");
    var iwFields = h("div", { class: "form" }, codeField("countryOfOrigin", L.countryOfOrigin, { help: "Country code as in the EPFO list." }), txt("passportNumber", { max: 10 }), dateF("passportValidFrom"), dateF("passportValidTill"));
    var secD = h("section", { class: "card" }, h("h2", { text: "D. International worker details" }), iwBox, iwFields, h("p", { class: "small muted", text: "A foreign national is not automatically an international worker. Tick the box only after you have decided it applies." }));
    /* E. disability */
    var daBox = chk("isPhisicalHandicap", "Differently abled");
    var daFields = h("div", { class: "toolbar" }, chk("locomotive", "Locomotive"), chk("hearing", "Hearing"), chk("visual", "Visual"));
    var secE = h("section", { class: "card" }, h("h2", { text: "E. Differently abled details" }), daBox, daFields);
    /* F. KYC */
    var consent = chk("aadhaarConsent", "I have taken the consent of the member for sharing his/her aadhaar to EPFO for the purpose of establishing his/her identity for registration and various benefits under EPF & MP Act and its schemes. Aadhaar holder is aware that information provided by him/her will be used for authenticating identity through Aadhaar Authentication system for the purpose stated above and no other purpose.");
    var copyBtn = btn("Copy member name", function () { F.NameAsPerAadhaar = F.memberName; inputs.NameAsPerAadhaar.value = F.memberName || ""; changed("NameAsPerAadhaar", F.memberName || ""); }, "small");
    var secF = h("section", { class: "card" }, h("h2", { text: "F. KYC details" }),
      h("h3", { text: "Aadhaar" }), h("div", { class: "form" }, txt("AadhaarNo", { req: true, max: 12, mode: "numeric", help: "12 digits. Format and check digit are tested only; the tool never authenticates Aadhaar." }), h("div", null, txt("NameAsPerAadhaar", { req: true, max: 85 }), copyBtn), consent),
      h("h3", { text: "PAN" }), h("div", { class: "form" }, txt("PAN", { max: 10, help: "Example ABCDE1234F" }), txt("NameAsPerPan", { max: 85 })),
      h("h3", { text: "Bank account" }), h("div", { class: "form" }, txt("BankAccNo", { max: 35, help: "Kept as text. Leading zeroes are kept." }), txt("Ifsc", { max: 11, help: "Example SBIN0001234" }), txt("NameAsPerBank", { max: 85 })),
      h("p", { class: "small muted", text: "Passport details are entered in section D. Never type passwords here. No KYC detail leaves this browser." }));
    function sync() {
      var iw = F.isPhisicalHandicap, on = F.isInternationalWorker === "Y"; iwFields.style.display = on ? "" : "none"; if (!on) { /* hidden fields keep their value so that nothing is lost silently */ }
      daFields.style.display = F.isPhisicalHandicap === "Y" ? "" : "none";
      var py = radioYes.checked; prevFields.style.display = py ? "" : "none";
    }
    [secA, secB, secC, secD, secE, secF].forEach(function (s) { main.appendChild(s); });
    function save(again) {
      submitted = true; var rec = EP.normalise(F), is = EP.validate(rec, cfg(), lists()); if (radioYes.checked && !rec.UAN) is.push({ field: "UAN", level: "error", code: "EP-PUAN", msg: "Enter the UAN." }); var errs = is.filter(function (i) { return i.level === "error"; });
      refresh();
      if (!rec.memberName) { toast("Enter at least the member name to save.", "error"); var el = $("#f_memberName"); if (el) el.focus(); return; }
      var mm = m || newMember(); mm.d = rec;
      persistMember(mm).then(function () { S.draft = null; persistKV("draft", null); toast(errs.length ? "Saved with " + errs.length + " error(s) to fix before generating the file." : "Member saved.", errs.length ? "warn" : "ok"); if (again) { S.editId = null; render(); window.scrollTo(0, 0); } else go("register"); });
    }
    main.appendChild(h("div", { class: "toolbar" }, btn(m ? "Save changes" : "Save member", function () { save(false); }, "primary"), m ? null : btn("Save and add another", function () { save(true); }), btn("Cancel", function () { S.draft = null; persistKV("draft", null); go("register"); }), btn("Check this record", function () { submitted = true; refresh(); toast("Checked. Errors and warnings are shown beside each field.", "info"); })));
    sync(); refresh();
    if (S.focusField) { var fe = $("#f_" + S.focusField); if (fe) { fe.scrollIntoView({ block: "center" }); fe.focus(); touched[S.focusField] = true; refresh(); } S.focusField = null; }
  }

  /* ================= member register ================= */
  function dateKey(t) { var v = EP.dateVal(t); return isNaN(v) ? 0 : v; }
  function viewMember(m) {
    var d = m.d, v = V().get(m.id), rows = [];
    EP.FIELDS.concat(EP.EXTRA).forEach(function (f) { var val = d[f]; if (f === "AadhaarNo") val = maskAadhaar(val); else if (f === "BankAccNo") val = mask(val, 4); else if (/^(isInternationalWorker|isPhisicalHandicap|locomotive|hearing|visual|aadhaarConsent)$/.test(f)) val = val === "Y" ? "Yes" : "No"; rows.push(h("tr", null, h("th", { text: EP.LABEL[f] }), h("td", { text: val || "" }))); });
    var is = v.issues.map(function (i) { return h("li", null, h("span", { class: "pill " + (i.level === "error" ? "err" : "warn"), text: i.level === "error" ? "Error" : "Warning" }), " " + EP.LABEL[i.field] + ": " + i.msg); });
    modal("Member details", h("div", null, h("table", { class: "grid" }, h("tbody", null, rows)), h("h3", { text: "Checks" }), is.length ? h("ul", null, is) : h("p", { text: "No errors or warnings." })), [{ label: "Close" }, { label: "Edit", cls: "primary", onclick: function () { go("add", { id: m.id }); } }], { wide: true });
  }
  function pageRegister(main) {
    var R = S.reg, v = V(), all = Array.from(S.members.values());
    main.appendChild(h("h2", { text: "Member Register" }));
    var q = R.q.trim().toLowerCase(), qd = q.replace(/\D/g, "");
    var list = all.filter(function (m) {
      var st = v.get(m.id).status, d = m.d;
      if (R.status && st !== R.status) return false; if (R.iw === "Y" && d.isInternationalWorker !== "Y") return false; if (R.iw === "N" && d.isInternationalWorker === "Y") return false;
      if (R.da === "Y" && d.isPhisicalHandicap !== "Y") return false; if (R.da === "N" && d.isPhisicalHandicap === "Y") return false;
      if (q && !(d.memberName.toLowerCase().indexOf(q) >= 0 || (qd && (d.UAN.indexOf(qd) >= 0 || d.AadhaarNo.indexOf(qd) >= 0)))) return false; return true;
    });
    list.sort(function (a, b) { var x, y; if (R.sort === "doj") { x = dateKey(a.d.DOJ); y = dateKey(b.d.DOJ); } else { x = a.d.memberName.toLowerCase(); y = b.d.memberName.toLowerCase(); } return (x < y ? -1 : x > y ? 1 : 0) * R.dir; });
    var pages = Math.max(1, Math.ceil(list.length / R.size)); if (R.page > pages) R.page = pages;
    var slice = list.slice((R.page - 1) * R.size, R.page * R.size);
    function reset() { R.page = 1; render(); }
    var search = h("input", { type: "search", id: "reg_q", placeholder: "Search name, UAN or Aadhaar", value: R.q, "aria-label": "Search" }); search.addEventListener("input", function () { R.q = search.value; R.page = 1; clearTimeout(search._t); search._t = setTimeout(function () { render(); var s = $("#reg_q"); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }, 250); });
    function selF(id, key, opts) { var s = h("select", { id: id, "aria-label": id }, opts.map(function (o) { return h("option", { value: o[0], text: o[1] }); })); s.value = R[key]; s.addEventListener("change", function () { R[key] = s.value; reset(); }); return s; }
    main.appendChild(h("div", { class: "toolbar" }, search, selF("reg_status", "status", [["", "All statuses"], ["green", "Valid"], ["amber", "Warning"], ["red", "Error"]]), selF("reg_iw", "iw", [["", "International worker: any"], ["Y", "International workers"], ["N", "Not international"]]), selF("reg_da", "da", [["", "Differently abled: any"], ["Y", "Differently abled"], ["N", "Not differently abled"]]),
      selF("reg_sort", "sort", [["name", "Sort by name"], ["doj", "Sort by date of joining"]]), btn(R.dir === 1 ? "A→Z / old→new" : "Z→A / new→old", function () { R.dir = -R.dir; render(); }, "small"), h("span", { class: "grow" }), btn("Add member", function () { go("add"); }, "primary"), btn("Delete selected (" + R.sel.size + ")", function () { if (!R.sel.size) return toast("Tick the records to delete first.", "info"); confirmBox("Delete selected members", "Delete " + R.sel.size + " selected member(s)? This cannot be undone. Export a backup first if unsure.", "Delete", function () { snapshotPrev().then(function () { return persistMany([], Array.from(R.sel)); }).then(function () { R.sel.clear(); toast("Deleted. You can use Restore Previous Data in Backup & Restore.", "ok"); render(); }); }, true); }, "danger")));
    if (!all.length) { main.appendChild(h("div", { class: "empty" }, h("h2", { text: "No members yet" }), h("p", { text: "Add a member or import a file." }), btn("Add member", function () { go("add"); }, "primary"))); return; }
    var allChk = h("input", { type: "checkbox", "aria-label": "Select this page" }); allChk.checked = slice.length && slice.every(function (m) { return R.sel.has(m.id); }); allChk.addEventListener("change", function () { slice.forEach(function (m) { allChk.checked ? R.sel.add(m.id) : R.sel.delete(m.id); }); render(); });
    var body = slice.map(function (m, i) {
      var d = m.d, st = v.get(m.id).status, c = h("input", { type: "checkbox", "aria-label": "Select " + d.memberName }); c.checked = R.sel.has(m.id); c.addEventListener("change", function () { c.checked ? R.sel.add(m.id) : R.sel.delete(m.id); var b = $("button.danger"); });
      return h("tr", null, h("td", null, c), h("td", { class: "n", text: String((R.page - 1) * R.size + i + 1) }), h("td", { text: d.memberName }), h("td", { class: "mono", text: d.UAN }), h("td", { class: "mono", text: d.prvMemberId }), h("td", { text: d.DOB }), h("td", { text: d.DOJ }), h("td", { text: d.Gender }), h("td", { class: "n", text: d.epfWages }),
        h("td", { text: d.AadhaarNo ? maskAadhaar(d.AadhaarNo) : "Missing" }), h("td", { text: d.PAN ? d.PAN.slice(0, 2) + "••••••" + d.PAN.slice(-2) : "—" }), h("td", null, statPill(st)),
        h("td", { class: "nw" }, btn("View", function () { viewMember(m); }, "small"), " ", btn("Edit", function () { go("add", { id: m.id }); }, "small"), " ", btn("Duplicate", function () { var c2 = newMember(Object.assign({}, m.d)); persistMember(c2).then(function () { toast("Duplicate created. Change its identifiers; duplicate UAN or Aadhaar is flagged until then.", "ok"); render(); }); }, "small"), " ", btn("Delete", function () { confirmBox("Delete member", "Delete " + (d.memberName || "this member") + "? This cannot be undone.", "Delete", function () { persistMany([], [m.id]).then(function () { R.sel.delete(m.id); toast("Member deleted.", "ok"); render(); }); }, true); }, "small danger")));
    });
    main.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, h("th", null, allChk), ["Sl. No.", "Member Name", "UAN", "Previous Member ID", "Date of Birth", "Date of Joining", "Gender", "EPF Wages", "Aadhaar", "PAN", "Validation Status", "Actions"].map(function (t) { return h("th", { text: t }); }))), h("tbody", null, body))));
    main.appendChild(h("div", { class: "toolbar" }, h("span", { text: list.length + " of " + all.length + " members" }), h("span", { class: "grow" }), btn("Previous", function () { R.page--; render(); }, "small", R.page <= 1 ? { disabled: true } : {}), h("span", { text: "Page " + R.page + " of " + pages }), btn("Next", function () { R.page++; render(); }, "small", R.page >= pages ? { disabled: true } : {}), selF("reg_size", "size", [["10", "10 per page"], ["25", "25 per page"], ["50", "50 per page"], ["100", "100 per page"]])));
    var sz = $("#reg_size"); if (sz) { sz.value = String(R.size); sz.onchange = function () { R.size = +sz.value; R.page = 1; render(); }; }
  }

  /* ================= imports (shared preview) ================= */
  function existingKeys() { var u = {}, a = {}; S.members.forEach(function (m) { if (m.d.UAN) u[m.d.UAN] = 1; if (m.d.AadhaarNo) a[m.d.AadhaarNo] = 1; }); return { u: u, a: a }; }
  /* raws: array of raw field objects. meta: {source, unmapped:[], rejects:[], extra:[]} */
  function stageImport(raws, meta) {
    var c = cfg(), l = lists(), recs = [], k = 0, ex = existingKeys();
    return new Promise(function (resolve) {
      function chunk() {
        var end = Math.min(raws.length, k + 400);
        for (; k < end; k++) recs.push(EP.normalise(raws[k]));
        if (k < raws.length) { var p = $("#impprog"); if (p) p.textContent = "Reading " + k + " of " + raws.length + "…"; return setTimeout(chunk, 0); }
        var dups = EP.duplicates(recs), items = recs.map(function (r, i) {
          var is = EP.validate(r, c, l).concat(dups[i] || []);
          if (r.UAN && ex.u[r.UAN]) is.push({ field: "UAN", level: "error", code: "EP-DUPX", msg: "This UAN is already in the register." });
          if (r.AadhaarNo && ex.a[r.AadhaarNo]) is.push({ field: "AadhaarNo", level: "error", code: "EP-DUPX", msg: "This Aadhaar number is already in the register." });
          return { rec: r, issues: is, status: EP.statusOf(is), row: i + 1 };
        });
        resolve({ items: items, meta: meta || {}, skipErr: true });
      }
      chunk();
    });
  }
  function importErrorReport(items, meta) {
    var rows = [["Row", "Member name", "Level", "Field", "Message"]];
    (meta.rejects || []).forEach(function (r) { rows.push([r.line, "", "Rejected", "", "Line has " + r.count + " fields instead of 30: " + r.text]); });
    items.forEach(function (it) { it.issues.forEach(function (i) { rows.push([it.row, it.rec.memberName, i.level === "error" ? "Error" : "Warning", EP.LABEL[i.field] || i.field, i.msg]); }); });
    return rows;
  }
  var saveSheet = needX(function saveSheet0(name, rows, fname) { var ws = XLSX.utils.aoa_to_sheet(rows), wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, name); var out = XLSX.write(wb, { bookType: "xlsx", type: "array" }); download(fname, "application/octet-stream", new Blob([out])); });
  function renderPreview(box) {
    var I = S.imp; box.innerHTML = ""; if (!I || !I.items) return;
    var it = I.items, g = it.filter(function (x) { return x.status === "green"; }).length, a = it.filter(function (x) { return x.status === "amber"; }).length, r = it.filter(function (x) { return x.status === "red"; }).length, rej = (I.meta.rejects || []).length;
    box.appendChild(h("div", { class: "grid3" }, [["Records read", it.length, ""], ["Valid", g, ""], ["Warnings", a, a ? "warn" : ""], ["Errors", r, r ? "err" : ""], ["Rejected lines", rej, rej ? "err" : ""]].map(function (x) { return h("div", { class: "stat " + x[2] }, h("div", { class: "k", text: x[0] }), h("div", { class: "v", text: String(x[1]) })); })));
    if (I.meta.unmapped && I.meta.unmapped.length) box.appendChild(notice("warn", "<strong>Columns not imported:</strong> " + esc(I.meta.unmapped.join(", ")) + ". Map them above if they matter; nothing is dropped silently."));
    if (I.meta.unknownKeys && I.meta.unknownKeys.length) box.appendChild(notice("warn", "<strong>Unrecognised fields in the file:</strong> " + esc(I.meta.unknownKeys.join(", ")) + ". They were not imported."));
    var rows = it.slice(0, 200).map(function (x) { var first = x.issues[0]; return h("tr", null, h("td", { class: "n", text: String(x.row) }), h("td", { text: x.rec.memberName }), h("td", { class: "mono", text: x.rec.UAN }), h("td", { text: x.rec.DOB }), h("td", { text: x.rec.DOJ }), h("td", { class: "n", text: x.rec.epfWages }), h("td", null, statPill(x.status)), h("td", { class: "small", text: first ? first.msg + (x.issues.length > 1 ? " (+" + (x.issues.length - 1) + " more)" : "") : "" })); });
    box.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, ["Row", "Name", "UAN", "DOB", "DOJ", "EPF wages", "Status", "First message"].map(function (t) { return h("th", { text: t }); }))), h("tbody", null, rows))));
    if (it.length > 200) box.appendChild(h("p", { class: "small muted", text: "Showing the first 200 of " + it.length + " rows. Download the report for all messages." }));
    var skip = h("input", { type: "checkbox", id: "imp_skip" }); skip.checked = I.skipErr; skip.addEventListener("change", function () { I.skipErr = skip.checked; });
    var nGood = it.length - (I.skipErr ? r : 0);
    box.appendChild(h("div", { class: "card" }, h("label", null, skip, " Do not import records with errors (recommended). Records with warnings are imported."), h("div", { class: "toolbar" }, btn("Import into register", function () { doImport(); }, "primary"), btn("Download error report", function () { saveSheet("Import report", importErrorReport(it, I.meta), "EPFO_Import_Error_Report_" + localStamp() + ".xlsx"); }), btn("Cancel", function () { S.imp = null; render(); }))));
  }
  function doImport() {
    var I = S.imp; if (!I) return; var take = I.items.filter(function (x) { return !(I.skipErr && x.status === "red"); }), skipped = I.items.length - take.length;
    if (!take.length) return toast("Nothing to import: every record has an error. Fix the file or untick the skip option.", "error");
    var ms = take.map(function (x) { return { id: uid(), created: Date.now(), updated: Date.now(), d: x.rec }; });
    snapshotPrev().then(function () { return persistMany(ms); }).then(function () { S.imp = null; toast("Imported " + ms.length + " member(s)" + (skipped ? "; skipped " + skipped + " with errors" : "") + ". Saved automatically.", "ok"); go("register"); });
  }
  function dropArea(label, accept, onFile) {
    var inp = h("input", { type: "file", accept: accept, id: "imp_file", "aria-label": label }); inp.addEventListener("change", function () { if (inp.files && inp.files[0]) onFile(inp.files[0]); inp.value = ""; });
    return h("div", { class: "card" }, h("div", { class: "fld" }, h("label", { for: "imp_file", text: label }), inp), h("div", { id: "impprog", class: "small muted", "aria-live": "polite" }));
  }
  function startStage(raws, meta, box) { var p = $("#impprog"); if (p) p.textContent = "Checking " + raws.length + " record(s)…"; stageImport(raws, meta).then(function (st) { S.imp = Object.assign({ kind: S.page }, st); if (p) p.textContent = ""; renderPreview(box); }); }

  /* ---- Excel ---- */
  function cellText(c) {
    if (c === undefined || c === null) return "";
    if (c instanceof Date) return c; return String(c);
  }
  function pageExcel(main) {
    main.appendChild(h("h2", { text: "Excel Import" })); main.appendChild(h("p", { text: "Import .xlsx, .xls or .csv. The file is read in this browser; nothing is uploaded. Download the template in Templates for the exact columns." }));
    var box = h("div", { id: "impbox" }), mapBox = h("div", null);
    main.appendChild(dropArea("Choose an Excel or CSV file", ".xlsx,.xls,.csv", function (file) {
      readFile(file, false).then(function (buf) { return window.XLSX ? buf : lazy("lib/xlsx.full.min.js").then(function () { return buf; }); }).then(function (buf) {
        var wb = XLSX.read(buf, { type: "array", cellDates: true, raw: false, dateNF: "dd/mm/yyyy" }), ws = wb.Sheets[wb.SheetNames[0]];
        var aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "", blankrows: false });
        if (aoa.length < 2) return toast("The first sheet has no data rows.", "error", "EP-IMP-001");
        var headers = aoa[0].map(function (x) { return String(x); }), rows = aoa.slice(1).filter(function (r) { return r.some(function (c) { return String(c).trim() !== ""; }); });
        var numLost = 0; rows.forEach(function (r) { r.forEach(function (c, i) { if (typeof c === "number") { var f = EP.autoMap(headers)[i]; if (f === "BankAccNo" || f === "prvMemberId" || f === "UAN") numLost++; } }); });
        var map = EP.autoMap(headers);
        function stage() {
          var raws = rows.map(function (row) { var o = {}; for (var i in map) if (map[i]) o[map[i]] = cellText(row[i]); return o; });
          var unm = headers.filter(function (hd, i) { return !map[i] && String(hd).trim(); });
          startStage(raws, { source: file.name, unmapped: unm }, box);
        }
        mapBox.innerHTML = "";
        var opts = [h("option", { value: "", text: "— do not import —" })].concat(EP.FIELDS.concat(EP.EXTRA).map(function (f) { return h("option", { value: f, text: EP.LABEL[f] + " (" + f + ")" }); }));
        var trs = headers.map(function (hd, i) { var s = h("select", { "aria-label": "Field for column " + hd }, opts.map(function (o) { return o.cloneNode(true); })); s.value = map[i] || ""; s.addEventListener("change", function () { if (s.value) Object.keys(map).forEach(function (k) { if (map[k] === s.value && +k !== i) delete map[k]; }); if (s.value) map[i] = s.value; else delete map[i]; mapBox.querySelectorAll("select").forEach(function (x, j) { x.value = map[j] || ""; }); }); return h("tr", null, h("td", { text: hd || "(blank heading)" }), h("td", { class: "small", text: String(rows[0] && rows[0][i] !== undefined ? (rows[0][i] instanceof Date ? "(date)" : rows[0][i]) : "").slice(0, 30) }), h("td", null, s)); });
        mapBox.appendChild(h("div", { class: "card" }, h("h2", { text: "Column mapping" }), h("p", { class: "small muted", text: rows.length + " data row(s) in " + file.name + ". Check each heading, change it if needed, then press Preview." }), numLost ? notice("warn", "Some UAN, member ID or bank account cells are stored as numbers in Excel, so leading zeroes may already be lost. Format those columns as Text in Excel and import again if zeroes matter.") : null, h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, h("th", { text: "Heading in file" }), h("th", { text: "First value" }), h("th", { text: "Imports into" }))), h("tbody", null, trs))), h("div", { class: "toolbar" }, btn("Preview and check", stage, "primary"))));
        box.innerHTML = ""; stage();
      }).catch(function () { toast("The file could not be read as a spreadsheet.", "error", "EP-IMP-002"); });
    }));
    main.appendChild(mapBox); main.appendChild(box); if (S.imp && S.imp.kind === "excel") renderPreview(box);
  }

  /* ---- JSON ---- */
  function pageJson(main) {
    main.appendChild(h("h2", { text: "JSON Import" })); main.appendChild(h("p", { text: "Import a JSON file with the structure shown in the template (format EPFO_MEMBER_REGISTRATION). A plain list of members is also accepted." }));
    var box = h("div", { id: "impbox" });
    main.appendChild(dropArea("Choose a JSON file", ".json,application/json", function (file) {
      readFile(file, true).then(function (t) {
        var j; try { j = JSON.parse(t.replace(/^﻿/, "")); } catch (e) { return toast("This is not valid JSON: " + e.message, "error", "EP-IMP-003"); }
        var arr = Array.isArray(j) ? j : (j && Array.isArray(j.members) ? j.members : null);
        if (!arr) return toast("The JSON must contain a \"members\" list.", "error", "EP-IMP-004");
        if (!Array.isArray(j) && j.format && j.format !== "EPFO_MEMBER_REGISTRATION") toast("File format is \"" + j.format + "\", expected EPFO_MEMBER_REGISTRATION. Importing anyway; please check the preview.", "warn");
        var unk = {}; arr.forEach(function (o) { if (o && typeof o === "object") Object.keys(o).forEach(function (k) { if (EP.FIELDS.indexOf(k) < 0 && EP.EXTRA.indexOf(k) < 0) unk[k] = 1; }); });
        var raws = arr.filter(function (o) { return o && typeof o === "object"; }).map(function (o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k] === null || o[k] === undefined ? "" : (typeof o[k] === "object" ? "" : String(o[k])); }); return r; });
        startStage(raws, { source: file.name, unknownKeys: Object.keys(unk) }, box);
      }).catch(function () { toast("The file could not be read.", "error", "EP-IMP-003"); });
    }));
    main.appendChild(box); if (S.imp && S.imp.kind === "json") renderPreview(box);
  }

  /* ---- TXT ---- */
  function pageTxt(main) {
    main.appendChild(h("h2", { text: "TXT Import" })); main.appendChild(h("p", { text: "Import an EPFO 30-field TXT file with the #~# delimiter. The header line is skipped, blank fields keep their place, and lines with the wrong number of fields are rejected and listed." }));
    var box = h("div", { id: "impbox" });
    main.appendChild(dropArea("Choose an EPFO .txt file", ".txt,text/plain", function (file) {
      readFile(file, true).then(function (t) {
        var p = EP.parseEpfoTxt(t);
        if (!p.records.length && !p.rejects.length) return toast("No member lines found in this file.", "error", "EP-IMP-005");
        startStage(p.records, { source: file.name, rejects: p.rejects }, box);
      }).catch(function () { toast("The file could not be read.", "error", "EP-IMP-005"); });
    }));
    main.appendChild(box); if (S.imp && S.imp.kind === "txt") renderPreview(box);
  }

  /* ================= validation centre ================= */
  function allIssues() { var v = V(), out = []; S.members.forEach(function (m, id) { v.get(id).issues.forEach(function (i) { out.push({ id: id, name: m.d.memberName, uan: m.d.UAN, i: i }); }); }); return out; }
  function pageValidation(main) {
    var c = counts(), is = allIssues(), Q = S.vq;
    main.appendChild(h("h2", { text: "Validation Centre" }));
    main.appendChild(h("div", { class: "grid3" }, [["Members checked", c.total, ""], ["GREEN: valid", c.green, ""], ["AMBER: warning", c.amber, c.amber ? "warn" : ""], ["RED: error", c.red, c.red ? "err" : ""]].map(function (x) { return h("div", { class: "stat " + x[2] }, h("div", { class: "k", text: x[0] }), h("div", { class: "v", text: String(x[1]) })); })));
    main.appendChild(h("p", { class: "small muted", text: "Errors block file generation. Warnings are data-quality prompts: you can generate with them after confirming. Required fields and optional quality checks can be changed in Settings." }));
    var shown = is.filter(function (x) { return (!Q.level || x.i.level === Q.level) && (!Q.q || (x.name + " " + x.i.msg + " " + x.i.code).toLowerCase().indexOf(Q.q.toLowerCase()) >= 0); });
    var s = h("select", { "aria-label": "Level" }, [["", "Errors and warnings"], ["error", "Errors only"], ["warn", "Warnings only"]].map(function (o) { return h("option", { value: o[0], text: o[1] }); })); s.value = Q.level; s.addEventListener("change", function () { Q.level = s.value; render(); });
    var q = h("input", { type: "search", placeholder: "Filter by name or message", value: Q.q, "aria-label": "Filter" }); q.addEventListener("change", function () { Q.q = q.value; render(); });
    main.appendChild(h("div", { class: "toolbar" }, s, q, h("span", { class: "grow" }), btn("Download validation report", function () { saveSheet("Validation", validationRows(), "EPFO_Validation_Report_" + localStamp() + ".xlsx"); }), btn("Check again", function () { S.val = null; render(); toast("Checked again.", "ok"); }, "primary")));
    if (!is.length) { main.appendChild(h("div", { class: "banner ok", text: c.total ? "All " + c.total + " records are valid." : "No members to check yet." })); return; }
    var rows = shown.slice(0, 500).map(function (x) { return h("tr", { class: "click" }, h("td", null, h("span", { class: "pill " + (x.i.level === "error" ? "err" : "warn"), text: x.i.level === "error" ? "Error" : "Warning" })), h("td", { text: x.name || "(no name)" }), h("td", { text: EP.LABEL[x.i.field] || x.i.field }), h("td", { text: x.i.msg }), h("td", { class: "small", text: x.i.code }), h("td", null, btn("Open", function () { go("add", { id: x.id, field: x.i.field }); }, "small"))); });
    main.appendChild(h("div", { class: "tablewrap" }, h("table", { class: "grid" }, h("thead", null, h("tr", null, ["Level", "Member", "Field", "Message", "Rule", ""].map(function (t) { return h("th", { text: t }); }))), h("tbody", null, rows))));
    if (shown.length > 500) main.appendChild(h("p", { class: "small muted", text: "Showing the first 500 of " + shown.length + ". Download the report for all." }));
  }
  function validationRows() { var r = [["Member", "UAN", "Level", "Field", "Message", "Rule"]]; allIssues().forEach(function (x) { r.push([x.name, x.uan, x.i.level === "error" ? "Error" : "Warning", EP.LABEL[x.i.field] || x.i.field, x.i.msg, x.i.code]); }); return r; }

  /* ================= generate ================= */
  function exportSet() { var v = V(), all = Array.from(S.members.values()); if (S.genScope === "valid") return all.filter(function (m) { return v.get(m.id).status === "green"; }); if (S.genScope === "selected") return all.filter(function (m) { return S.reg.sel.has(m.id); }); return all; }
  function fileName() { return settings().fileBase.replace(/[^A-Za-z0-9_.-]/g, "_") + "_" + localStamp() + ".txt"; }
  function pageGenerate(main) {
    var c = counts(), set = exportSet(), v = V(), errs = set.filter(function (m) { return v.get(m.id).status === "red"; }), warns = set.filter(function (m) { return v.get(m.id).status === "amber"; });
    main.appendChild(h("h2", { text: "Generate EPFO TXT" }));
    main.appendChild(h("div", { class: "grid3" }, [["Total employee records", c.total, ""], ["Valid records", c.green, ""], ["Records with warnings", c.amber, c.amber ? "warn" : ""], ["Records with errors", c.red, c.red ? "err" : ""], ["Records selected for export", set.length, ""]].map(function (x) { return h("div", { class: "stat " + x[2] }, h("div", { class: "k", text: x[0] }), h("div", { class: "v", text: String(x[1]) })); })));
    var sc = h("select", { id: "gen_scope", "aria-label": "Records to export" }, [["all", "All records"], ["valid", "Valid records only (green)"], ["selected", "Records ticked in the Member Register"]].map(function (o) { return h("option", { value: o[0], text: o[1] }); })); sc.value = S.genScope; sc.addEventListener("change", function () { S.genScope = sc.value; render(); });
    main.appendChild(h("div", { class: "card" }, h("div", { class: "fld" }, h("label", { for: "gen_scope", text: "Records to export" }), sc), h("p", { class: "small muted", text: "File name: " + fileName() + ". Encoding: UTF-8. Each record has exactly 30 fields separated by #~#. " + (settings().includeHeader ? "The first line is the 30-name header line, as in the EPFO reference file." : "The header line is switched off in Settings.") })));
    var s = settings(), yn = EP.YESNO[s.yesNo];
    var how = s.yesNo === "portal" ? "<b>Y</b> for International worker and Differently abled, <b>Yes</b> for Locomotive, Hearing and Visual, and a blank for No (the values the EPFO registration form posts)" : "<b>" + esc(yn[0]) + "</b> for Yes and <b>" + (yn[1] === "" ? "a blank" : esc(yn[1])) + "</b> for No";
    if (s.yesNo === "portal" && !s.confirmedYesNo) main.appendChild(notice("warn", "<strong>Please verify before uploading.</strong> The EPFO reference file does not show how Yes/No fields are written in the bulk file. This tool writes " + how + ". Check a file accepted by the portal and change the setting if needed."));
    if (errs.length) main.appendChild(h("div", { class: "banner err" }, h("strong", { text: errs.length + " record(s) have errors, so the file cannot be generated yet. " }), "Fix them in the Validation Centre, or export only the valid ones.", h("div", { class: "toolbar" }, btn("Open Validation Centre", function () { go("validation"); }), btn("Export valid records only", function () { S.genScope = "valid"; render(); }, "primary"))));
    if (!errs.length && warns.length) main.appendChild(notice("warn", "<strong>" + warns.length + " record(s) have warnings.</strong> You can still generate the file after confirming."));
    var block = !set.length || errs.length, tools = h("div", { class: "toolbar" });
    tools.appendChild(btn("Generate TXT preview", function () { previewTxt(set); }, "primary", set.length ? {} : { disabled: true }));
    tools.appendChild(btn("Download TXT", function () { downloadTxt(set, warns.length); }, "gold", block ? { disabled: true } : {}));
    tools.appendChild(btn("Download Excel", function () { downloadXlsx(set); }, "", set.length ? {} : { disabled: true }));
    tools.appendChild(btn("Download JSON", function () { download("EPFO_Members_" + localStamp() + ".json", "application/json", JSON.stringify(jsonDoc(set), null, 2)); }, "", set.length ? {} : { disabled: true }));
    tools.appendChild(btn("Download Validation Report", function () { saveSheet("Validation", validationRows(), "EPFO_Validation_Report_" + localStamp() + ".xlsx"); }, "", c.total ? {} : { disabled: true }));
    main.appendChild(tools);
    main.appendChild(epfoNotice());
  }
  function previewTxt(set) {
    var txt; try { txt = EP.buildFile(set.map(function (m) { return m.d; }), cfg()); } catch (e) { return toast("Could not build the file: " + e.message, "error", "EP-GEN-001"); }
    var lines = txt.split(/\r?\n/).filter(function (l) { return l !== ""; }), bad = lines.filter(function (l) { return l.split(EP.DELIM).length !== 30; }).length;
    modal("TXT preview", h("div", null, h("p", { text: lines.length + " line(s) including the header" + (settings().includeHeader ? "" : " (header off)") + ". Lines with other than 30 fields: " + bad + ". Showing the first 15 lines." }), h("pre", { style: "white-space:pre;overflow:auto;max-height:50vh;font-size:12px;background:var(--bg2);padding:8px;border-radius:6px", id: "txtprev", text: lines.slice(0, 15).join("\n") })), [{ label: "Close" }], { wide: true });
  }
  function downloadTxt(set, nWarn) {
    function go2() { var txt; try { txt = EP.buildFile(set.map(function (m) { return m.d; }), cfg()); } catch (e) { return toast("Could not build the file: " + e.message, "error", "EP-GEN-001"); } download(fileName(), "text/plain;charset=utf-8", txt); toast("Downloaded " + fileName() + " with " + set.length + " member(s).", "ok"); }
    if (nWarn) confirmBox("Generate with warnings?", nWarn + " record(s) have warnings. Generate the file anyway?", "Generate", go2); else go2();
  }
  function jsonDoc(set) { return { application: "Techmin HR Solutions", format: "EPFO_MEMBER_REGISTRATION", version: "1.0", members: set.map(function (m) { var o = {}; EP.FIELDS.concat(EP.EXTRA).forEach(function (f) { o[f] = m.d[f]; }); return o; }) }; }
  var downloadXlsx = needX(function downloadXlsx0(set) { var head = EP.FIELDS.concat(EP.EXTRA), rows = [head]; set.forEach(function (m) { rows.push(head.map(function (f) { return m.d[f]; })); }); var ws = XLSX.utils.aoa_to_sheet(rows); textCols(ws, head, rows.length); var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Members"); download("EPFO_Members_" + localStamp() + ".xlsx", "application/octet-stream", new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })])); });
  function textCols(ws, head, nrows) { head.forEach(function (f, c) { for (var r = 1; r < nrows; r++) { var a = XLSX.utils.encode_cell({ r: r, c: c }), cell = ws[a]; if (cell) { cell.t = "s"; cell.z = "@"; cell.v = String(cell.v); } } }); }

  /* ================= templates and sample ================= */
  var NAMES_M = ["Rahul", "Arun", "Vijay", "Suresh", "Anil", "Manoj", "Sanjay", "Ramesh", "Deepak", "Prakash"], NAMES_F = ["Priya", "Anita", "Sunita", "Lakshmi", "Meera", "Divya", "Asha", "Neha", "Kavita", "Revathi"], SUR = ["Nair", "Menon", "Kumar", "Pillai", "Sharma", "Verma", "Das", "Iyer", "Khan", "Joseph"];
  function sampleRecords(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var f = i % 3 === 1, first = (f ? NAMES_F : NAMES_M)[i % 10], sur = SUR[(i * 7) % 10], name = (first + " " + sur).toUpperCase(), dd = pad2(1 + (i * 3) % 28), mm = pad2(1 + (i * 5) % 12), yr = 1975 + (i * 7) % 28, dj = pad2(1 + (i * 11) % 28), mj = pad2(1 + (i * 3) % 12);
      var base = String(200000000000 + i * 7919 + 100000).slice(0, 11), aad = base + EP.verhoeffCheckDigit(base);
      var r = { UAN: "", prvMemberId: "", memberName: name, DOB: dd + "/" + mm + "/" + yr, DOJ: dj + "/" + mj + "/2026", Gender: f ? "F" : "M", fatherHusbandName: (NAMES_M[(i + 3) % 10] + " " + sur).toUpperCase(), relation: "F", mobileNo: "9" + String(100000000 + i * 12345).slice(0, 9), emailId: "", nationality: "77", epfWages: String(12000 + (i % 7) * 1000), qualification: String([4, 5, 6, 7][i % 4]), maritalStatus: i % 2 ? "M" : "U", isInternationalWorker: "", countryOfOrigin: "", passportNumber: "", passportValidFrom: "", passportValidTill: "", isPhisicalHandicap: "", locomotive: "", hearing: "", visual: "", BankAccNo: "0" + String(10000000000 + i * 31337), Ifsc: "SBIN0001234", NameAsPerBank: name, PAN: "", NameAsPerPan: "", AadhaarNo: aad, NameAsPerAadhaar: name, salutation: f ? "2" : "1", aadhaarConsent: "Y" };
      if (i % 25 === 4) { r.isPhisicalHandicap = "Y"; r.locomotive = "Y"; }
      if (i % 40 === 9) { r.isInternationalWorker = "Y"; r.countryOfOrigin = "119"; r.passportNumber = "N" + String(1000000 + i); r.passportValidFrom = "01/01/2024"; r.passportValidTill = "31/12/2033"; r.nationality = "119"; }
      out.push(r);
    }
    return out;
  }
  function templateXlsx() {
    var head = EP.FIELDS.concat(EP.EXTRA), wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet([head]);
    var idCols = ["UAN", "prvMemberId", "mobileNo", "BankAccNo", "AadhaarNo", "DOB", "DOJ", "passportValidFrom", "passportValidTill", "PAN", "Ifsc", "passportNumber"];
    head.forEach(function (f, c) { if (idCols.indexOf(f) >= 0) for (var r = 1; r <= 1000; r++) ws[XLSX.utils.encode_cell({ r: r, c: c })] = { t: "s", v: "", z: "@" }; });
    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 1000, c: head.length - 1 } }); ws["!cols"] = head.map(function (f) { return { wch: Math.max(14, f.length + 2) }; });
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    var ex = sampleRecords(2), exRows = [head].concat(ex.map(function (r) { return head.map(function (f) { return r[f]; }); })), ws2 = XLSX.utils.aoa_to_sheet(exRows); textCols(ws2, head, exRows.length); XLSX.utils.book_append_sheet(wb, ws2, "Example (invented)");
    var ins = [["Techmin HR Solutions - EPFO Member Registration import template"], [""], ["Fill the Members sheet, one member per row. Do not change the column headings."], ["The first 30 columns are the EPFO output fields in the EPFO order. The last two columns (salutation, aadhaarConsent) are data-entry-only and are never written to the EPFO file."], ["Dates: DD/MM/YYYY. UAN, member ID, mobile, bank account, Aadhaar, PAN and IFSC are text cells so that leading zeroes are kept."], ["Yes/No columns (isInternationalWorker, isPhisicalHandicap, locomotive, hearing, visual): type Y or leave blank."], ["Codes: see the Codes sheet. Example rows use invented data only."]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ins), "Instructions");
    var codes = [["Field", "Code", "Meaning"]]; ["salutation", "Gender", "relation", "maritalStatus", "qualification", "nationality", "countryOfOrigin"].forEach(function (f) { EP.CODES[f].forEach(function (x) { codes.push([f, x[0], x[1]]); }); });
    var wsC = XLSX.utils.aoa_to_sheet(codes); textCols(wsC, ["a", "b", "c"], codes.length); XLSX.utils.book_append_sheet(wb, wsC, "Codes");
    return new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]);
  }
  function jsonTemplate() { var o = {}; EP.FIELDS.concat(EP.EXTRA).forEach(function (f) { o[f] = ""; }); o.nationality = "77"; return { application: "Techmin HR Solutions", format: "EPFO_MEMBER_REGISTRATION", version: "1.0", members: [o] }; }
  function pageTemplates(main) {
    main.appendChild(h("h2", { text: "Templates and sample data" }));
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Import templates" }), h("p", { text: "Use these to prepare data for import. The Excel template has the 30 EPFO columns first, then two data-entry-only columns." }), h("div", { class: "toolbar" }, btn("Excel template (.xlsx)", needX(function () { download("employee_import_template.xlsx", "application/octet-stream", templateXlsx()); }), "primary"), btn("JSON template", function () { download("employee_import_template.json", "application/json", JSON.stringify(jsonTemplate(), null, 2)); }), btn("TXT template", function () { download("employee_import_template.txt", "text/plain;charset=utf-8", EP.HEADER + "\n"); }))));
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Sample employees (invented)" }), h("p", { text: "100 invented employees with made-up Aadhaar numbers, for trying the tool. Do not upload them to EPFO." }), h("div", { class: "toolbar" }, btn("Download sample JSON", function () { var set = sampleRecords(100).map(function (r) { return { d: EP.normalise(r) }; }); download("sample_members.json", "application/json", JSON.stringify(jsonDoc(set), null, 2)); }), btn("Download sample TXT", function () { download("sample_members.txt", "text/plain;charset=utf-8", EP.buildFile(sampleRecords(100).map(function (r) { return EP.normalise(r); }), cfg())); }), btn("Load sample into register", function () { confirmBox("Load sample data", "Add 100 invented members to your register? You can delete them later.", "Add sample", function () { var ms = sampleRecords(100).map(function (r) { return newMember(r); }); snapshotPrev().then(function () { return persistMany(ms); }).then(function () { toast("Sample data added.", "ok"); go("register"); }); }); }, "gold"))));
  }

  /* ================= backup and restore ================= */
  function backupDoc() { return { application: "Techmin HR Solutions", format: "TECHMIN_EPFO_BACKUP", version: VERSION, timestamp: new Date().toISOString(), settings: S.kv.settings || {}, codeLists: S.kv.codeLists || null, members: Array.from(S.members.values()) }; }
  function b64(buf) { var s = "", b = new Uint8Array(buf); for (var i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return btoa(s); }
  function unb64(t) { var s = atob(t), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function deriveKey(pw, salt, iter) { var enc = new TextEncoder(); return crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]).then(function (k) { return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: iter, hash: "SHA-256" }, k, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]); }); }
  function encryptBackup(pw) { var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 200000; return deriveKey(pw, salt, iter).then(function (k) { return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k, new TextEncoder().encode(JSON.stringify(backupDoc()))); }).then(function (ct) { return { application: "Techmin HR Solutions", format: "TECHMIN_EPFO_BACKUP_ENCRYPTED", version: VERSION, kdf: "PBKDF2-SHA256", iterations: iter, cipher: "AES-GCM-256", salt: b64(salt), iv: b64(iv), data: b64(ct) }; }); }
  function decryptBackup(o, pw) { return deriveKey(pw, unb64(o.salt), o.iterations).then(function (k) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(o.iv) }, k, unb64(o.data)); }).then(function (pt) { return JSON.parse(new TextDecoder().decode(pt)); }); }
  function applyBackup(doc) {
    var n = (doc.members || []).length;
    var ask = h("div", null, h("p", { text: "This backup holds " + n + " member record(s), made on " + (doc.timestamp ? new Date(doc.timestamp).toLocaleString("en-IN") : "an unknown date") + ". You currently have " + S.members.size + "." }), h("p", { class: "small muted", text: "Replace removes your current records first (a copy is kept for Restore Previous Data). Merge adds the backup's records and keeps yours." }));
    modal("Restore backup", ask, [{ label: "Cancel" }, { label: "Merge", onclick: function () { run(false); } }, { label: "Replace", cls: "danger", onclick: function () { run(true); } }]);
    function run(replace) {
      var ms = (doc.members || []).filter(function (m) { return m && m.d; }).map(function (m) { return { id: replace && m.id ? m.id : uid(), created: m.created || Date.now(), updated: Date.now(), d: EP.normalise(m.d) }; });
      snapshotPrev().then(function () { return replace ? clearMembers() : null; }).then(function () { return persistMany(ms); }).then(function () { if (doc.settings && replace) return persistKV("settings", doc.settings); }).then(function () { if (doc.codeLists) return persistKV("codeLists", doc.codeLists); }).then(function () { toast("Restored " + ms.length + " member(s).", "ok"); go("register"); });
    }
  }
  function pageBackup(main) {
    main.appendChild(h("h2", { text: "Backup & Restore" }));
    main.appendChild(h("p", { text: "Your data lives only in this browser. Browser data can be cleared, so keep a backup file." }));
    var prev = S.kv.prevSnapshot;
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Backup" }), h("div", { class: "toolbar" }, btn("Export Complete Backup", function () { download("Techmin_EPFO_Backup_" + localStamp() + ".json", "application/json", JSON.stringify(backupDoc(), null, 2)); toast("Backup downloaded.", "ok"); }, "primary"), btn("Export Encrypted Backup", function () {
      var p1 = h("input", { type: "password", id: "bp1", autocomplete: "new-password" }), p2 = h("input", { type: "password", id: "bp2", autocomplete: "new-password" }), er = h("div", { class: "ferr" });
      modal("Encrypted backup", h("div", { class: "form" }, h("div", { class: "fld wide" }, er), h("div", { class: "fld" }, h("label", { for: "bp1", text: "Password" }), p1), h("div", { class: "fld" }, h("label", { for: "bp2", text: "Repeat password" }), p2), h("p", { class: "small muted wide", text: "The password is never stored. If you lose it, the backup cannot be opened." })), [{ label: "Cancel" }, { label: "Encrypt and download", cls: "primary", keep: true, onclick: function (close) { if (p1.value.length < 8) { er.textContent = "Use at least 8 characters."; return false; } if (p1.value !== p2.value) { er.textContent = "The two passwords are different."; return false; } if (!(window.crypto && crypto.subtle)) { er.textContent = "This browser cannot encrypt here (needs a secure page)."; return false; } encryptBackup(p1.value).then(function (o) { download("Techmin_EPFO_Backup_" + localStamp() + ".enc.json", "application/json", JSON.stringify(o)); toast("Encrypted backup downloaded.", "ok"); close(); }, function () { er.textContent = "Encryption failed."; }); return false; } }]);
    }))));
    var inp = h("input", { type: "file", accept: ".json,application/json", id: "bk_file" }); inp.addEventListener("change", function () {
      var f = inp.files && inp.files[0]; if (!f) return; inp.value = "";
      readFile(f, true).then(function (t) {
        var o; try { o = JSON.parse(t); } catch (e) { return toast("This file is not valid JSON.", "error", "EP-BKP-001"); }
        if (o.format === "TECHMIN_EPFO_BACKUP_ENCRYPTED") { var pw = h("input", { type: "password", id: "bkpw" }), er = h("div", { class: "ferr" }); modal("Encrypted backup", h("div", { class: "form" }, h("div", { class: "fld wide" }, er), h("div", { class: "fld wide" }, h("label", { for: "bkpw", text: "Password" }), pw)), [{ label: "Cancel" }, { label: "Open", cls: "primary", keep: true, onclick: function (close) { decryptBackup(o, pw.value).then(function (doc) { close(); applyBackup(doc); }, function () { er.textContent = "Wrong password or damaged file."; }); return false; } }]); return; }
        if (o.format !== "TECHMIN_EPFO_BACKUP" || !Array.isArray(o.members)) return toast("This is not a Techmin EPFO backup file.", "error", "EP-BKP-002");
        applyBackup(o);
      });
    });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Restore" }), h("div", { class: "fld" }, h("label", { for: "bk_file", text: "Import Backup (.json)" }), inp), h("div", { class: "toolbar" }, btn("Restore Previous Data", function () { if (!prev) return toast("There is no earlier copy yet. One is kept before every import, restore or deletion.", "info"); confirmBox("Restore previous data", "Restore the copy made on " + new Date(prev.at).toLocaleString("en-IN") + " with " + prev.count + " member(s)? Your current records will be replaced.", "Restore", function () { clearMembers().then(function () { return persistMany(prev.members); }).then(function () { toast("Previous data restored.", "ok"); go("register"); }); }); }, "", prev ? {} : { title: "No earlier copy yet" }), h("span", { class: "small muted", text: prev ? "Earlier copy: " + prev.count + " member(s), " + new Date(prev.at).toLocaleString("en-IN") : "No earlier copy yet." }))));
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Clear all data" }), h("p", { text: "Deletes every member record from this browser. Settings are kept." }), btn("Clear All Data", function () { confirmBox("Clear all data", "Delete all " + S.members.size + " member records from this browser? A copy is kept for Restore Previous Data until you clear site data. Download a backup first if unsure.", "Clear all", function () { snapshotPrev().then(clearMembers).then(function () { S.draft = null; persistKV("draft", null); toast("All member records cleared.", "ok"); render(); }); }, true); }, "danger", S.members.size ? {} : { disabled: true })));
  }

  /* ================= settings ================= */
  function pageSettings(main) {
    var s = settings();
    function save(k, v) { var n = Object.assign({}, settings()); n[k] = v; persistKV("settings", n); S.val = null; }
    function chk(k, label, help) { var i = h("input", { type: "checkbox", id: "st_" + k }); i.checked = !!s[k]; i.addEventListener("change", function () { save(k, i.checked); toast("Setting saved.", "ok"); }); return h("div", { class: "fld chk wide" }, h("label", null, i, " " + label), help ? h("small", { text: help }) : null); }
    function sel(k, label, opts, help) { var i = h("select", { id: "st_" + k }, opts.map(function (o) { return h("option", { value: o[0], text: o[1] }); })); i.value = String(s[k]); i.addEventListener("change", function () { save(k, i.value); toast("Setting saved.", "ok"); }); return h("div", { class: "fld" }, h("label", { for: "st_" + k, text: label }), i, help ? h("small", { text: help }) : null); }
    function inp(k, label, help) { var i = h("input", { id: "st_" + k, value: s[k], maxlength: "60" }); i.addEventListener("change", function () { save(k, i.value.trim()); toast("Setting saved.", "ok"); }); return h("div", { class: "fld" }, h("label", { for: "st_" + k, text: label }), i, help ? h("small", { text: help }) : null); }
    main.appendChild(h("h2", { text: "Settings" }));
    var th = h("select", { id: "st_theme" }, [["light", "Light"], ["dark", "Dark"]].map(function (o) { return h("option", { value: o[0], text: o[1] }); })); th.value = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; th.addEventListener("change", function () { document.documentElement.setAttribute("data-theme", th.value); try { localStorage.setItem("ep-theme", th.value); } catch (e) {} });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Appearance and defaults" }), h("div", { class: "form" }, h("div", { class: "fld" }, h("label", { for: "st_theme", text: "Theme" }), th), h("div", { class: "fld" }, h("label", { text: "Date format" }), h("input", { value: "DD/MM/YYYY", disabled: true }), h("small", { text: "Fixed: the EPFO file uses DD/MM/YYYY." })), sel("defaultNationality", "Default nationality", EP.CODES.nationality.map(function (x) { return [x[0], x[1] + " – " + x[0]]; })), sel("defaultQualification", "Default qualification", [["", "None"]].concat(EP.CODES.qualification.map(function (x) { return [x[0], x[1]]; }))), inp("fileBase", "Default export file name", "The date (YYYYMMDD) and .txt are added automatically."))));
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "File format" }), h("div", { class: "form" }, chk("includeHeader", "Start the file with the 30-name header line", "The supplied EPFO reference file begins with this line."), sel("crlf", "Line ending", [["false", "LF (as in the reference file)"], ["true", "CRLF (Windows)"]], "Encoding is UTF-8."), sel("yesNo", "Yes / No values for International worker, Differently abled, Locomotive, Hearing, Visual", [["portal", "Portal form values: Y, Y, Yes, Yes, Yes; blank for No"], ["yn", "Y / N"], ["yesno", "Yes / No"], ["10", "1 / 0"], ["tf", "True / False"], ["yblank", "Y / blank"]], "Not shown by the reference file. Verify against a file the EPFO portal accepted."), chk("confirmedYesNo", "I have verified these Yes / No values", "Hides the verification notice on the Generate page."))));
    var reqBox = h("div", { class: "toolbar" }, EP.FIELDS.concat(["salutation"]).filter(function (f) { return f !== "UAN" && f !== "prvMemberId"; }).map(function (f) { var i = h("input", { type: "checkbox" }); i.checked = s.requiredFields.indexOf(f) >= 0; i.addEventListener("change", function () { var a = settings().requiredFields.slice(), k = a.indexOf(f); if (i.checked && k < 0) a.push(f); if (!i.checked && k >= 0) a.splice(k, 1); save("requiredFields", a); }); return h("label", { style: "margin-right:14px" }, i, " " + EP.LABEL[f]); }));
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Validation preferences" }), h("p", { class: "small muted", text: "Ticked fields are reported as errors when blank. The defaults follow the fields marked * on the EPFO registration form. Fields that are only required when a box is ticked (international worker, differently abled) are always checked." }), reqBox, h("div", { class: "form", style: "margin-top:10px" }, chk("requireMobile", "Require mobile number (quality check)"), chk("requireEmail", "Require email (quality check)"), chk("requirePan", "Require PAN and name as per PAN (quality check)"), chk("requireBank", "Require bank account, IFSC and name (quality check)"), chk("requireConsent", "Warn when Aadhaar consent is not ticked"), chk("checkAadhaarChecksum", "Warn when the Aadhaar number fails the check-digit test"), chk("checkNameMatch", "Warn when member name and name as per Aadhaar differ"))));
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Auto-save and storage" }), h("div", { class: "form" }, chk("autosave", "Auto-save the unfinished member form while typing", "Records are always saved to this browser when you save, import or delete."), h("div", { class: "fld wide" }, h("label", { text: "Browser storage used" }), h("div", { id: "st_usage", text: "Checking…" }))), h("div", { class: "toolbar" }, btn("Clear application data", function () { confirmBox("Clear application data", "Delete all members, settings and backups kept in this browser? This cannot be undone. Download a backup first if unsure.", "Delete everything", function () { clearMembers().then(function () { return tx("kv", "readwrite", function (t) { t.objectStore("kv").clear(); }); }).then(function () { S.kv = {}; S.draft = null; toast("All application data cleared.", "ok"); render(); }); }, true); }, "danger"))));
    if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { var el = $("#st_usage"); if (el) el.textContent = "About " + (e.usage / 1048576).toFixed(2) + " MB used of about " + Math.round(e.quota / 1048576) + " MB available to this site. " + S.members.size + " member record(s)."; }); else { var el = $("#st_usage"); if (el) el.textContent = S.members.size + " member record(s). The browser does not report storage size."; }
    var sx = $("#st_crlf"); if (sx) sx.value = String(!!s.crlf), sx.onchange = function () { save("crlf", sx.value === "true"); toast("Setting saved.", "ok"); };
  }

  /* ================= help ================= */
  function openDoc(which, anchor) {
    if (!window.EPDOCS) return lazy("docs.js").then(function () { openDoc(which, anchor); }, function () { toast("The guide could not be loaded.", "error", "EP-LIB-002"); });
    var pages = [["guide", "User guide"], ["errors", "Error codes"], ["rules", "Rules and sources"], ["release", "Release notes"], ["privacy", "Privacy"]];
    var body = h("div", null), cur = which;
    function paint() { body.innerHTML = ""; body.appendChild(h("div", { class: "docnav" }, pages.map(function (p) { return h("button", { class: "btn small" + (p[0] === cur ? " primary" : ""), type: "button", onclick: function () { cur = p[0]; paint(); } }, p[1]); }))); var d = h("div", { class: "doc", id: "docbody", html: (window.EPDOCS || {})[cur] || "<p>Not available.</p>" }); body.appendChild(d); if (anchor) { var el = d.querySelector("#" + anchor); if (el) el.scrollIntoView(); } }
    paint(); modal("Help", body, [{ label: "Close" }], { wide: true });
  }
  function pageHelp(main) {
    main.appendChild(h("h2", { text: "Help & Instructions" }));
    main.appendChild(h("div", { class: "toolbar" }, [["guide", "User guide"], ["errors", "Error codes"], ["rules", "Rules and sources"], ["release", "Release notes"], ["privacy", "Privacy"]].map(function (p) { return btn(p[1], function () { openDoc(p[0]); }, p[0] === "guide" ? "primary" : ""); })));
    var steps = [
      ["How to add employees individually", "Open Add Member, fill sections A to F and press Save member. Fields marked * are required by the EPFO form. Errors and warnings show beside each field."],
      ["How to import Excel data", "Download the Excel template from Templates, fill it, then use Excel Import. Check the column mapping and the preview, then press Import into register."],
      ["How to import JSON", "Use the JSON template. Choose the file in JSON Import, check the preview and import."],
      ["How to import TXT", "Choose an EPFO 30-field #~# file in TXT Import. The header line is skipped. Lines with the wrong number of fields are rejected and listed."],
      ["How auto-save works", "Records are saved to this browser (IndexedDB) the moment you save, import or delete. The unfinished member form is saved while you type. The indicator at the top shows Saving, Saved, Unsaved changes or Save failed."],
      ["How to save manually", "Press the gold SAVE button at the top at any time. It writes everything again and shows the time."],
      ["How to generate the EPFO TXT file", "Open Generate EPFO TXT. Fix errors, choose the records, press Generate TXT preview and then Download TXT. The file is EPFO_Member_Registration_Bulk_YYYYMMDD.txt."],
      ["How to download a backup", "Open Backup & Restore and press Export Complete Backup, or Export Encrypted Backup for a password-protected file."],
      ["How to restore previous data", "Use Import Backup, or Restore Previous Data to return to the copy kept before the last import, restore or deletion."],
      ["EPFO UAN generation instructions", "UAN generation through the member registration module is restricted except for International Workers and citizens of Nepal and Bhutan. Other new employees should generate their UAN through face authentication in the UMANG mobile application."],
      ["Important data validation requirements", "Aadhaar number is mandatory, 12 digits. Dates are DD/MM/YYYY. Name up to 85 characters, mobile 10 digits, email up to 100, EPF wages up to 8 characters, passport number up to 10. Keep UAN, member ID, bank account and Aadhaar as text so leading zeroes are kept."],
      ["Individual registration and bulk TXT", "On the EPFO portal one member is registered at a time through the form. The bulk TXT file carries many members in one file with the 30 fields in a fixed order, separated by #~#. This tool prepares that file; it does not submit it."]
    ];
    main.appendChild(h("div", { class: "card" }, steps.map(function (x, i) { return h("div", null, h("h3", { text: (i + 1) + ". " + x[0] }), h("p", { text: x[1] })); })));
    main.appendChild(epfoNotice()); main.appendChild(h("div", { class: "banner ok" }, h("strong", { text: "Privacy. " }), PRIVACY)); main.appendChild(h("div", { class: "banner warn" }, h("strong", { text: "Disclaimer. " }), DISCLAIMER));
  }

  /* ================= shell ================= */
  function saveAll() {
    if (!DB) return toast("This browser cannot store data.", "error", "EP-DB-001");
    pending++; setStatus("saving");
    tx(["members", "kv"], "readwrite", function (t) { var ms = t.objectStore("members"), ks = t.objectStore("kv"); S.members.forEach(function (m) { ms.put(m); }); Object.keys(S.kv).forEach(function (k) { if (k !== "lastSaved") ks.put({ key: k, value: S.kv[k] }); }); if (S.draft) ks.put({ key: "draft", value: S.draft }); S.kv.lastSaved = Date.now(); ks.put({ key: "lastSaved", value: S.kv.lastSaved }); }).then(function () { done(true); toast("All data saved in this browser (" + S.members.size + " member record(s)).", "ok"); }, function () { done(false); });
  }
  function shell() {
    document.body.innerHTML = "";
    document.body.appendChild(h("a", { class: "skip", href: "#main" }, "Skip to content"));
    document.body.appendChild(h("header", { class: "top" },
      h("div", { class: "row1" }, h("div", { class: "brand" }, h("img", { class: "tlogo", src: "logo.png", alt: "Techmin HR Solutions", width: "190", height: "38" }), h("div", null, h("strong", { text: "TECHMIN HR SOLUTIONS" }), h("span", { class: "app", text: "EPFO Member Registration Bulk File Generator" }), h("span", { class: "ver", text: " v" + VERSION }))),
        h("div", { class: "savebox" }, h("span", { id: "savedot", class: "dot init" }), h("span", { id: "savestatus", "aria-live": "polite" }, "Starting…"), h("span", { id: "lastsaved", class: "small" }), btn("SAVE", function () { saveAll(); }, "gold", { id: "savebtn", title: "Save everything in this browser" }), btn("Settings", function () { go("settings"); }, "small", { id: "settingsbtn" }))),
      h("nav", { class: "row2", "aria-label": "Help links" }, [["Help / User Guide", "guide"], ["Error Codes", "errors"], ["Release Notes", "release"], ["Privacy", "privacy"]].map(function (x) { return h("button", { class: "link", type: "button", onclick: function () { openDoc(x[1]); } }, x[0]); }), h("button", { class: "link", type: "button", id: "fbbtn", onclick: function () { if (/^https:/.test(FEEDBACK_URL)) { window.open(FEEDBACK_URL, "_blank", "noopener"); toast("The Techmin feedback form opened in a new tab.", "ok"); } else toast("The feedback form is not linked yet.", "info"); } }, "Feedback"), h("a", { class: "link", href: "../" }, "All ComplyPro tools"))));
    document.body.appendChild(h("div", { id: "banners", class: "banners" }));
    document.body.appendChild(h("nav", { id: "tabs", class: "tabs", role: "tablist", "aria-label": "Sections" }));
    document.body.appendChild(h("main", { id: "main", tabindex: "-1" }));
    document.body.appendChild(h("footer", { class: "foot" }, h("p", { text: PRIVACY }), h("p", { text: DISCLAIMER }), h("p", { text: "EPFO Member Registration Bulk File Generator v" + VERSION + " · Works offline · Free · Techmin HR Solutions, Aluva, Kerala" })));
    document.body.appendChild(h("div", { id: "toasts", class: "toasts", "aria-live": "polite" }));
  }
  function render() {
    var nav = $("#tabs"); nav.innerHTML = "";
    PAGES.forEach(function (t) { if (t[0] === "settings") return; nav.appendChild(h("button", { class: "tab" + (S.page === t[0] ? " on" : ""), type: "button", role: "tab", "data-tab": t[0], "aria-selected": S.page === t[0] ? "true" : "false", onclick: function () { go(t[0]); } }, t[1])); });
    var main = $("#main"); main.innerHTML = ""; var f = pageFn(S.page) || pageDashboard;
    try { f(main); } catch (e) { main.appendChild(h("div", { class: "banner err", text: "This page could not be shown: " + e.message })); if (window.console) console.error(e.message); }
    var b = $("#banners"); b.innerHTML = ""; if (saveState === "failed") b.appendChild(h("div", { class: "banner err", text: "Saving to this browser failed. Download a backup now." }));
    if (S.ready && saveState === "init") setStatus("clean");
  }
  function fatal(code) { var m = { "EP-DB-001": ["This browser cannot store data", "IndexedDB is not available (private window or restricted browser).", "Open the tool in a normal browser window."], "EP-DB-002": ["Storage could not be opened", "The browser blocked or failed to open its database.", "Close other tabs of this tool and reload, or check that the browser allows site data."] }[code] || ["Cannot start", "", ""]; document.body.innerHTML = ""; document.body.appendChild(h("div", { class: "fatal" }, h("h1", { text: "EPFO Member Registration Bulk File Generator cannot start" }), h("p", null, h("strong", { text: code + " - " + m[0] })), h("p", { text: m[1] }), h("p", { text: "What to do: " + m[2] }))); }
  function start() {
    try { var th = localStorage.getItem("ep-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}
    shell();
    openDB().then(function () { return Promise.all([readAll("members"), readAll("kv")]); }).then(function (all) {
      all[0].forEach(function (m) { S.members.set(m.id, m); }); all[1].forEach(function (x) { S.kv[x.key] = x.value; });
      if (S.kv.draft && S.kv.draft.d) { S.draft = S.kv.draft; S.draft.dirty = true; if (S.draft.editId && !S.members.has(S.draft.editId)) S.draft = null; }
      S.ready = true; setStatus(S.members.size ? "saved" : "clean", S.members.size ? "Loaded " + S.members.size + " saved member(s)" : null); render();
      if (S.draft) toast("An unfinished member entry was found. Open Add Member to continue it.", "info");
      document.documentElement.setAttribute("data-ready", "1");
      if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(function () {});
    }).catch(function (e) { fatal((e && e.code) || "EP-DB-002"); });
  }
  window.EPAPP = { S: S, go: go, render: render, V: V, sampleRecords: sampleRecords };
  start();
})();
