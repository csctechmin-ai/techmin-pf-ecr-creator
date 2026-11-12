/*! GSTR-2B Reconciliation engine v1.0.0 - pure logic (no DOM). Money in integer paise. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.GR = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var VERSION = "1.0.3";
  var VERIFIED_ON = "2026-11-12";

  /* ================= dates (ISO strings, day numbers) ================= */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function mkISO(y, m, d) {
    if (y < 1990 || y > 2200 || m < 1 || m > 12 || d < 1) return null;
    var t = new Date(Date.UTC(y, m - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
    return y + "-" + pad(m) + "-" + pad(d);
  }
  function dn(iso) { if (!iso) return null; var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); if (!p) return null; return Math.round(Date.UTC(+p[1], +p[2] - 1, +p[3]) / 86400000); }
  function fromDn(n) { var c = new Date(n * 86400000); return c.getUTCFullYear() + "-" + pad(c.getUTCMonth() + 1) + "-" + pad(c.getUTCDate()); }
  var MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  function parseDate(v) {
    if (v === null || v === undefined || v === "") return null;
    if (v instanceof Date) return isNaN(v) ? null : mkISO(v.getFullYear(), v.getMonth() + 1, v.getDate());
    if (typeof v === "number") { if (v > 20000 && v < 80000) return fromDn(Math.floor(v) - 25569); return null; }
    var s = String(v).trim(), m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s))) return mkISO(+m[1], +m[2], +m[3]);
    if ((m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/.exec(s))) { var y = +m[3]; if (m[3].length === 2) y += 2000; return mkISO(y, +m[2], +m[1]); }
    if ((m = /^(\d{1,2})[-\/ .]([A-Za-z]{3,9})[-\/ .,]*(\d{2,4})/.exec(s))) { var mo = MON[m[2].slice(0, 3).toLowerCase()]; var y2 = +m[3]; if (m[3].length === 2) y2 += 2000; return mo ? mkISO(y2, mo, +m[1]) : null; }
    if (/^\d{5}(\.\d+)?$/.test(s)) return parseDate(parseFloat(s));
    return null;
  }
  function fmtDMY(iso) { var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return p ? p[3] + "-" + p[2] + "-" + p[1] : ""; }
  function fyOf(iso) { var y = +iso.slice(0, 4), m = +iso.slice(5, 7); return m >= 4 ? y : y - 1; }
  function fyLabel(y) { return y + "-" + pad((y + 1) % 100); }

  /* ================= money ================= */
  function toPaise(v) {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return isFinite(v) ? Math.round(v * 100 + (v < 0 ? -1e-7 : 1e-7)) : 0;
    var s = String(v).trim(), neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    if (/cr\s*$/i.test(s)) { s = s.replace(/cr\s*$/i, ""); }
    if (/dr\s*$/i.test(s)) { s = s.replace(/dr\s*$/i, ""); }
    s = s.replace(/[,\s₹]|^rs\.?/gi, "");
    if (s[0] === "-") { neg = !neg; s = s.slice(1); }
    if (!/^\d*\.?\d*$/.test(s) || s === "" || s === ".") return 0;
    var n = Math.round(parseFloat(s) * 100 + 1e-7);
    return neg ? -n : n;
  }
  function inr(p) { // Indian grouping, 2 decimals
    var neg = p < 0; p = Math.abs(p);
    var r = Math.floor(p / 100), f = p % 100;
    var s = String(r), last3 = s.slice(-3), rest = s.slice(0, -3);
    if (rest) last3 = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
    return (neg ? "-" : "") + last3 + "." + pad(f);
  }

  /* ================= GSTIN ================= */
  var CH = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function gstinCheckChar(s14) {
    var sum = 0;
    for (var i = 0; i < 14; i++) {
      var v = CH.indexOf(s14[i]); var f = (i % 2 === 0) ? 1 : 2; var p = v * f;
      sum += Math.floor(p / 36) + (p % 36);
    }
    return CH[(36 - (sum % 36)) % 36];
  }
  function normGstin(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function gstinShape(g) { return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g); }
  function gstinValid(g) { return gstinShape(g) && gstinCheckChar(g.slice(0, 14)) === g[14]; }
  function lev(a, b, max) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      var t = prev; prev = cur; cur = t;
    }
    return prev[b.length];
  }

  /* ================= invoice number normalising ================= */
  function normInv(s) {
    s = String(s === null || s === undefined ? "" : s).toUpperCase();
    return s.replace(/\d+/g, function (d) { return d.replace(/^0+(?=\d)/, ""); }).replace(/[^A-Z0-9]/g, "");
  }
  function tailNum(s) {
    var m = String(s || "").match(/(\d+)\D*$/);
    return m ? m[1].replace(/^0+(?=\d)/, "") : "";
  }

  /* ================= column mapping ================= */
  function nh(s) { return String(s === null || s === undefined ? "" : s).toLowerCase().replace(/[^a-z0-9]/g, ""); }
  var SYN = {
    gstin: ["gstinofsupplier", "suppliergstin", "gstinuin", "gstin", "partygstin", "gstinno", "ctin", "gstno", "gstinofthesupplier", "vendorgstin", "partygstinuin", "gstuin", "gstinofvendor"],
    name: ["tradelegalname", "tradename", "suppliername", "partyname", "nameofsupplier", "legalname", "vendorname", "nameofparty", "particulars", "accountname", "party"],
    inum: ["invoicenumber", "invoiceno", "supplierinvoiceno", "supplierinvoicenumber", "invno", "billno", "billnumber", "documentnumber", "documentno", "noteno", "notenumber", "debitcreditnotenumber", "debitnotenumber", "creditnotenumber", "inum", "suppinvno", "refno", "reference", "voucherrefno", "vchrefno", "supplierinvoice", "vendorinvoiceno", "voucherno", "vouchernumber", "vchno"],
    date: ["invoicedate", "supplierinvoicedate", "billdate", "documentdate", "invdate", "notedate", "date", "voucherdate", "vchdate", "supplierinvdate"],
    taxable: ["taxablevalue", "taxableamount", "assessablevalue", "taxable", "basicamount", "txval", "taxablevaluers", "basicvalue", "netamount", "purchasevalue", "value"],
    igst: ["integratedtax", "igst", "igstamount", "igstamt", "inputigst", "integratedgst"],
    cgst: ["centraltax", "cgst", "cgstamount", "cgstamt", "inputcgst", "centralgst"],
    sgst: ["stateuttax", "statetax", "sgst", "sgstutgst", "utgst", "sgstamount", "sgstamt", "inputsgst", "stategst", "sgstorutgst"],
    cess: ["cess", "cessamount", "inputcess", "cessamt"],
    total: ["invoicevalue", "invoiceamount", "grosstotal", "billamount", "total", "documentvalue", "invoicevaluers", "grossamount", "totalamount", "notevalue", "val"],
    hsn: ["hsnsac", "hsn", "sac", "hsncode", "hsnsaccode", "sachsn"],
    ledger: ["ledger", "ledgername", "expenseledger", "accounthead", "purchaseledger", "glaccount", "gl", "nature", "expense"],
    doctype: ["documenttype", "vouchertype", "notetype", "doctype", "vchtype", "typeofdocument", "invoicetype"],
    paydate: ["paymentdate", "paidon", "dateofpayment", "paiddate", "datepaid"],
    itcavl: ["itcavailability", "itcavailable", "eligibilityofitc", "itcavl", "itcavailabilitystatus"],
    reason: ["reason", "rsn", "reasonforitcnotavailable"],
    pos: ["placeofsupply", "pos"],
    rev: ["supplyattractreversecharge", "reversecharge", "rcm", "rev"],
    rate: ["rate", "taxrate", "ratepercent", "gstrate"]
  };
  var TAXF = { igst: 1, cgst: 1, sgst: 1, cess: 1 };
  var FIELD_ORDER = ["gstin", "inum", "date", "taxable", "total", "igst", "cgst", "sgst", "cess", "name", "hsn", "ledger", "doctype", "paydate", "itcavl", "reason", "pos", "rev", "rate"];
  var FIELD_LABELS = {
    gstin: "Supplier GSTIN", inum: "Invoice / note number", date: "Invoice / note date", taxable: "Taxable value",
    total: "Invoice value", igst: "IGST", cgst: "CGST", sgst: "SGST / UTGST", cess: "Cess", name: "Supplier name", hsn: "HSN / SAC",
    ledger: "Ledger", doctype: "Document type", paydate: "Payment date", itcavl: "ITC available (2B)", reason: "Reason (2B)", pos: "Place of supply", rev: "Reverse charge", rate: "Rate %"
  };
  function autoMap(headers) {
    var H = headers.map(nh), map = {}, used = {};
    var f, i, k;
    for (var fi = 0; fi < FIELD_ORDER.length; fi++) {
      f = FIELD_ORDER[fi]; var syn = SYN[f];
      var best = null;
      for (k = 0; k < syn.length; k++) {
        for (i = 0; i < H.length; i++) if (!used[i] && H[i] === syn[k]) { best = i; break; }
        if (best !== null) break;
      }
      if (best === null) {
        for (k = 0; k < syn.length && best === null; k++) {
          if (syn[k].length < 5) continue;
          for (i = 0; i < H.length; i++) if (!used[i] && H[i].indexOf(syn[k]) === 0) { best = i; break; }
        }
      }
      if (best !== null && !TAXF[f]) { map[f] = best; used[best] = 1; }
      else if (TAXF[f]) {
        var cols = [];
        for (i = 0; i < H.length; i++) {
          if (used[i] || !H[i]) continue;
          var hit = (H[i] === syn[0] || H[i].indexOf(f) >= 0 || (f === "igst" && H[i].indexOf("integrated") >= 0) || (f === "cgst" && H[i].indexOf("central") >= 0) || (f === "sgst" && (H[i].indexOf("stateut") >= 0 || H[i].indexOf("utgst") >= 0)));
          if (hit && !/rate$|ratepercent$|percent$/.test(H[i]) && !(f === "cess" && /(additional|add)/.test(H[i]))) cols.push(i);
        }
        if (cols.length) { map[f] = cols.length === 1 ? cols[0] : cols; cols.forEach(function (c) { used[c] = 1; }); }
        else if (best !== null) { map[f] = best; used[best] = 1; }
      }
    }
    return map;
  }
  function headerScore(row) {
    var m = autoMap(row), s = 0;
    ["gstin", "inum", "date", "taxable", "igst", "cgst", "sgst", "total", "name"].forEach(function (f) { if (m[f] !== undefined) s += (f === "gstin" || f === "inum") ? 3 : 1; });
    return s;
  }
  function findHeaderRow(aoa) {
    var best = -1, bs = 0;
    for (var i = 0; i < Math.min(aoa.length, 25); i++) {
      var r = (aoa[i] || []).map(function (x) { return x === null || x === undefined ? "" : String(x); });
      var s = headerScore(r);
      if (s > bs) { bs = s; best = i; }
    }
    return bs >= 5 ? best : -1;
  }

  /* ================= document model ================= */
  function mkDoc(o) {
    var d = {
      src: o.src, sec: o.sec || "", gstin: normGstin(o.gstin), name: String(o.name || "").trim(), inum: String(o.inum === undefined || o.inum === null ? "" : o.inum).trim(),
      dt: o.dt || null, cls: o.cls || "INV", sign: o.cls === "CN" ? -1 : 1,
      taxable: o.taxable | 0, igst: o.igst | 0, cgst: o.cgst | 0, sgst: o.sgst | 0, cess: o.cess | 0,
      total: o.total | 0, hsn: o.hsn || "", ledger: o.ledger || "", paydate: o.paydate || null,
      itcavl: o.itcavl || "", reason: o.reason || "", rev: o.rev || "", pos: o.pos || "", amended: !!o.amended, oinum: o.oinum || "", odt: o.odt || null,
      supprd: o.supprd || "", row: o.row || 0, file: o.file || "", rawType: o.rawType || ""
    };
    if (o.cls === "CN") { // notes always carry negative effect
      ["taxable", "igst", "cgst", "sgst", "cess", "total"].forEach(function (k) { d[k] = -Math.abs(d[k]); });
    }
    d.tax = d.igst + d.cgst + d.sgst + d.cess;
    d.inumN = normInv(d.inum); d.tail = tailNum(d.inum);
    return d;
  }

  /* ---------- GSTR-2B JSON ---------- */
  function sumItems(x) {
    var out = { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
    var items = x.items || x.itms || null;
    if (items && items.length) {
      items.forEach(function (it) {
        var q = it.itm_det || it;
        out.taxable += toPaise(q.txval); out.igst += toPaise(q.igst); out.cgst += toPaise(q.cgst); out.sgst += toPaise(q.sgst); out.cess += toPaise(q.cess);
      });
    } else {
      out.taxable = toPaise(x.txval); out.igst = toPaise(x.igst); out.cgst = toPaise(x.cgst); out.sgst = toPaise(x.sgst); out.cess = toPaise(x.cess);
    }
    return out;
  }
  function parse2BJson(obj, fileName) {
    var warns = [], docs = [], meta = { gstin: "", period: "", genDate: "" };
    if (typeof obj === "string") { try { obj = JSON.parse(obj); } catch (e) { return { docs: [], meta: meta, warnings: [], error: "MT-GR-001" }; } }
    var env = obj;
    if (env && env.data && env.data.data) env = env.data.data;
    else if (env && env.data && (env.data.docdata || env.data.gstin)) env = env.data;
    if (!env || !env.docdata) return { docs: [], meta: meta, warnings: [], error: "MT-GR-002" };
    meta.gstin = env.gstin || ""; meta.period = env.rtnprd || ""; meta.genDate = env.gendt || "";
    var dd = env.docdata, n = 0;
    function addInv(s, inv, sec, amended) {
      var t = sumItems(inv);
      docs.push(mkDoc({
        src: "2B", sec: sec, gstin: s.ctin, name: s.trdnm, inum: inv.inum, dt: parseDate(inv.dt), cls: "INV", total: toPaise(inv.val),
        taxable: t.taxable, igst: t.igst, cgst: t.cgst, sgst: t.sgst, cess: t.cess, itcavl: inv.itcavl, reason: inv.rsn, rev: inv.rev, pos: inv.pos,
        amended: amended, oinum: inv.oinum, odt: parseDate(inv.oidt), supprd: s.supprd || "", file: fileName, row: ++n, rawType: inv.typ || ""
      }));
    }
    function addNote(s, nt, sec, amended) {
      var t = sumItems(nt); var isC = String(nt.typ || nt.ntty || "").toUpperCase().charAt(0) !== "D";
      docs.push(mkDoc({
        src: "2B", sec: sec, gstin: s.ctin, name: s.trdnm, inum: nt.ntnum, dt: parseDate(nt.dt), cls: isC ? "CN" : "DN", total: toPaise(nt.val),
        taxable: t.taxable, igst: t.igst, cgst: t.cgst, sgst: t.sgst, cess: t.cess, itcavl: nt.itcavl, reason: nt.rsn, rev: nt.rev, pos: nt.pos,
        amended: amended, oinum: nt.ontnum, odt: parseDate(nt.ontdt), supprd: s.supprd || "", file: fileName, row: ++n, rawType: nt.typ || ""
      }));
    }
    (dd.b2b || []).forEach(function (s) { (s.inv || []).forEach(function (i) { addInv(s, i, "B2B", false); }); });
    (dd.b2ba || []).forEach(function (s) { (s.inv || []).forEach(function (i) { addInv(s, i, "B2BA", true); }); });
    (dd.cdnr || []).forEach(function (s) { (s.nt || []).forEach(function (i) { addNote(s, i, "CDNR", false); }); });
    (dd.cdnra || []).forEach(function (s) { (s.nt || []).forEach(function (i) { addNote(s, i, "CDNRA", true); }); });
    ["isd", "isda", "impg", "impgsez", "ecom", "ecoma"].forEach(function (k) {
      if (dd[k] && (Array.isArray(dd[k]) ? dd[k].length : Object.keys(dd[k]).length)) warns.push("Section " + k.toUpperCase() + " is present in the file but is not reconciled against purchase books by this tool.");
    });
    return { docs: docs, meta: meta, warnings: warns };
  }

  /* ---------- tabular (2B Excel portal download, Tally, Busy, any register) ---------- */
  function cellSum(row, spec) {
    if (spec === undefined) return 0;
    if (Array.isArray(spec)) { var t = 0; spec.forEach(function (c) { t += toPaise(row[c]); }); return t; }
    return toPaise(row[spec]);
  }
  function cellStr(row, spec) { if (spec === undefined || Array.isArray(spec)) return ""; var v = row[spec]; return v === null || v === undefined ? "" : String(v).trim(); }
  function classify(typeStr, sheetHint, role) {
    var s = (String(typeStr || "") + " " + (sheetHint || "")).toLowerCase();
    if (/credit|cdn|purchase\s*return|return|cr\.?\s*note|\bcn\b/.test(s) && !/debit/.test(s.replace(/debit\/credit/, ""))) return "CN";
    if (/debit/.test(s)) { return role === "BOOKS" ? "CN" : "DN"; } /* in purchase books a debit note is a purchase return */
    return "INV";
  }
  /* aoa: array of rows (arrays). opts: {src, mapping (override), itemWise, sheetName, fileName, headerRow} */
  function parseTable(aoa, opts) {
    opts = opts || {};
    var hr = opts.headerRow !== undefined && opts.headerRow !== null ? opts.headerRow : findHeaderRow(aoa);
    if (hr < 0) return { docs: [], mapping: {}, headers: [], warnings: [], error: "MT-GR-003", headerRow: -1 };
    var headers = (aoa[hr] || []).map(function (x) { return x === null || x === undefined ? "" : String(x).trim(); });
    // portal files sometimes have a two-line header; if next row has text in tax columns merge
    var map = autoMap(headers);
    if (opts.mapping) for (var k in opts.mapping) { if (opts.mapping[k] === null || opts.mapping[k] === "") delete map[k]; else map[k] = opts.mapping[k]; }
    var warns = [];
    if (map.gstin === undefined) warns.push("No supplier GSTIN column found. All rows will be treated as having no GSTIN.");
    if (map.inum === undefined) return { docs: [], mapping: map, headers: headers, warnings: warns, error: "MT-GR-004", headerRow: hr };
    var docs = [], skipped = 0, i, r;
    for (i = hr + 1; i < aoa.length; i++) {
      r = aoa[i] || [];
      var inum = cellStr(r, map.inum);
      var gstin = normGstin(cellStr(r, map.gstin));
      var nameV = cellStr(r, map.name);
      if (!inum && !gstin) { skipped++; continue; }
      if (/^(grand\s*)?total|^sub\s*total/i.test(nameV) || /^(grand\s*)?total/i.test(inum)) { skipped++; continue; }
      if (!inum) { skipped++; continue; }
      var cls = classify(cellStr(r, map.doctype), opts.sheetName, opts.src);
      var taxable = cellSum(r, map.taxable), igst = cellSum(r, map.igst), cgst = cellSum(r, map.cgst), sgst = cellSum(r, map.sgst), cess = cellSum(r, map.cess);
      var total = map.total !== undefined ? cellSum(r, map.total) : 0;
      if (cls !== "CN" && (taxable < 0 || igst + cgst + sgst < 0) && taxable <= 0 && igst + cgst + sgst + cess <= 0) cls = "CN"; // negative lines are returns
      if (map.taxable === undefined && total) taxable = total - igst - cgst - sgst - cess;
      docs.push(mkDoc({
        src: opts.src || "BOOKS", sec: opts.sheetName || "", gstin: gstin, name: nameV, inum: inum, dt: parseDate(map.date !== undefined ? r[map.date] : null), cls: cls,
        taxable: taxable, igst: igst, cgst: cgst, sgst: sgst, cess: cess, total: total, hsn: cellStr(r, map.hsn), ledger: cellStr(r, map.ledger),
        paydate: map.paydate !== undefined ? parseDate(r[map.paydate]) : null,
        itcavl: (cellStr(r, map.itcavl) || "").slice(0, 1).toUpperCase() === "N" ? "N" : (cellStr(r, map.itcavl) ? "Y" : ""), reason: cellStr(r, map.reason), rev: cellStr(r, map.rev), pos: cellStr(r, map.pos),
        amended: /a$/i.test(opts.sheetName || "") && /b2ba|cdnra/i.test(opts.sheetName || ""), file: opts.fileName || "", row: i + 1, rawType: cellStr(r, map.doctype)
      }));
    }
    if (opts.itemWise || (opts.src === "2B")) docs = mergeLines(docs);
    return { docs: docs, mapping: map, headers: headers, warnings: warns, headerRow: hr, skipped: skipped };
  }
  /* merge rows (lines) of the same document: item-wise registers and portal Excel (one row per rate) */
  function mergeLines(docs) {
    var out = [], idx = {};
    docs.forEach(function (d) {
      var k = d.gstin + "|" + d.inum + "|" + d.cls + "|" + d.dt;
      if (idx[k] !== undefined) {
        var t = out[idx[k]];
        ["taxable", "igst", "cgst", "sgst", "cess"].forEach(function (f) { t[f] += d[f]; });
        t.tax = t.igst + t.cgst + t.sgst + t.cess;
        if (d.total && !t.total) t.total = d.total;
      } else { idx[k] = out.length; out.push(d); }
    });
    return out;
  }
  /* workbook: [{name, aoa}] ; 2B portal workbook has sheets B2B, B2BA, B2B-CDNR, B2B-CDNRA etc. */
  function parse2BWorkbook(sheets, fileName) {
    var docs = [], warns = [], used = [];
    sheets.forEach(function (sh) {
      var nm = String(sh.name || "");
      if (!/b2b|cdn/i.test(nm.replace(/\s/g, ""))) return;
      var res = parseTable(sh.aoa, { src: "2B", sheetName: nm.toLowerCase().indexOf("cdn") >= 0 ? (/a$/i.test(nm) ? "CDNRA" : "CDNR") : (/a$/i.test(nm) ? "B2BA" : "B2B"), fileName: fileName });
      if (res.error) { if (res.error !== "MT-GR-003") warns.push("Sheet " + nm + ": " + res.error); return; }
      used.push(nm);
      var isNote = /cdn/i.test(nm);
      res.docs.forEach(function (d) {
        d.sec = isNote ? (/a$/i.test(nm) ? "CDNRA" : "CDNR") : (/a$/i.test(nm) ? "B2BA" : "B2B");
        d.amended = /a$/i.test(nm.trim());
        if (isNote && d.cls === "INV") { d.cls = /debit|^d$/i.test(d.rawType) ? "DN" : "CN"; if (d.cls === "CN") { ["taxable", "igst", "cgst", "sgst", "cess", "total"].forEach(function (k) { d[k] = -Math.abs(d[k]); }); d.tax = d.igst + d.cgst + d.sgst + d.cess; d.sign = -1; } }
        if (d.itcavl === "" && /^(yes|no|y|n)$/i.test(d.reason)) d.itcavl = "";
        docs.push(d);
      });
      (res.warnings || []).forEach(function (w) { warns.push(nm + ": " + w); });
    });
    if (!used.length) return { docs: [], warnings: warns, error: "MT-GR-002", sheets: used };
    return { docs: docs, warnings: warns, sheets: used };
  }

  /* ================= filters ================= */
  function filterDocs(docs, from, to) {
    var f = dn(from), t = dn(to);
    if (f === null && t === null) return docs.slice();
    return docs.filter(function (d) { var x = dn(d.dt); if (x === null) return true; return (f === null || x >= f) && (t === null || x <= t); });
  }

  /* ================= matching ================= */
  var DEFAULTS = { tol: 100, dateWin: 7, fuzzyGstin: true, groupMatch: true };
  function sumDocs(arr, f) { var t = 0; for (var i = 0; i < arr.length; i++) t += arr[i][f]; return t; }
  function absd(a) { return a < 0 ? -a : a; }
  function reconcile(docs2b, docsBooks, options) {
    var o = {}; for (var k in DEFAULTS) o[k] = DEFAULTS[k]; if (options) for (k in options) if (options[k] !== undefined) o[k] = options[k];
    var tol = o.tol, win = o.dateWin;
    var b2 = docs2b.map(function (d, i) { var c = Object.assign({}, d); c.id = "2-" + i; return c; });
    var bk = docsBooks.map(function (d, i) { var c = Object.assign({}, d); c.id = "B-" + i; return c; });
    /* amendments: an original superseded by a B2BA / CDNRA record is dropped from the live set */
    var byKey = {};
    b2.forEach(function (d) { var key = d.gstin + "|" + d.inumN + "|" + d.cls; (byKey[key] = byKey[key] || []).push(d); });
    b2.forEach(function (d) {
      if (d.amended && d.oinum) {
        var key = d.gstin + "|" + normInv(d.oinum) + "|" + d.cls;
        (byKey[key] || []).forEach(function (x) { if (x !== d && !x.amended) { x.superseded = d.id; } });
      }
    });
    var live2 = b2.filter(function (d) { return !d.superseded; });
    var superseded = b2.filter(function (d) { return d.superseded; });
    var rows = [], p2 = {}, pB = {};
    function pair(a, b, pass, extra) {
      p2[a.id] = pB[b.id] = true;
      var r = { b2: [a], bk: [b], pass: pass, notes: extra || [] };
      rows.push(r);
      return r;
    }
    function freeB() { return bk.filter(function (x) { return !pB[x.id]; }); }
    function free2() { return live2.filter(function (x) { return !p2[x.id]; }); }
    function taxDiffAbs(a, b) { return absd(a.tax - b.tax); }
    function dateGap(a, b) { var x = dn(a.dt), y = dn(b.dt); return (x === null || y === null) ? 9999 : absd(x - y); }
    /* generic pass over key function; pick closest candidate */
    function keyPass(name, keyFn, accept, noteFn) {
      var map = {};
      freeB().forEach(function (b) { var key = keyFn(b); if (key) (map[key] = map[key] || []).push(b); });
      free2().forEach(function (a) {
        var key = keyFn(a); if (!key || !map[key]) return;
        var cands = map[key].filter(function (b) { return !pB[b.id] && accept(a, b); });
        if (!cands.length) return;
        cands.sort(function (x, y) { return taxDiffAbs(a, x) - taxDiffAbs(a, y) || dateGap(a, x) - dateGap(a, y); });
        pair(a, cands[0], name, noteFn ? noteFn(a, cands[0]) : []);
      });
    }
    keyPass("exact", function (d) { return d.gstin && d.inumN ? d.gstin + "|" + d.inumN + "|" + d.cls : ""; }, function () { return true; });
    keyPass("tail", function (d) { return d.gstin && d.tail ? d.gstin + "|" + d.tail + "|" + d.cls : ""; },
      function (a, b) { return taxDiffAbs(a, b) <= tol || (dateGap(a, b) <= win && (a.inumN === a.tail || b.inumN === b.tail)); },
      function (a, b) { return ["Invoice number written differently (2B: " + a.inum + " / books: " + b.inum + ")"]; });
    /* amended 2B doc matched to books by its ORIGINAL invoice number */
    (function () {
      free2().forEach(function (a) {
        if (!a.amended || !a.oinum) return;
        var on = normInv(a.oinum);
        var c = freeB().filter(function (b) { return b.gstin === a.gstin && b.cls === a.cls && (b.inumN === on || (tailNum(a.oinum) && b.tail === tailNum(a.oinum))); });
        if (c.length) { c.sort(function (x, y) { return taxDiffAbs(a, x) - taxDiffAbs(a, y); }); pair(a, c[0], "amended", ["2B carries an amendment of " + a.oinum + " (now " + a.inum + "); books still show the original"]); }
      });
    })();
    if (o.fuzzyGstin) {
      free2().forEach(function (a) {
        if (!a.gstin) return;
        var c = freeB().filter(function (b) {
          if (!b.gstin || b.gstin === a.gstin || b.cls !== a.cls) return false;
          if (lev(a.gstin, b.gstin, 1) > 1) return false;
          return (b.inumN === a.inumN || (a.tail && b.tail === a.tail)) && taxDiffAbs(a, b) <= tol * 2;
        });
        if (c.length) { c.sort(function (x, y) { return taxDiffAbs(a, x) - taxDiffAbs(a, y); }); pair(a, c[0], "gstin", ["GSTIN differs by one character (2B: " + a.gstin + " / books: " + c[0].gstin + ")"]); }
      });
    }
    /* probable: same GSTIN, same amounts, close date, different number */
    (function () {
      var A = free2();
      A.forEach(function (a) {
        if (p2[a.id] || !a.gstin) return;
        var c = freeB().filter(function (b) { return b.gstin === a.gstin && b.cls === a.cls && absd(a.taxable - b.taxable) <= tol && taxDiffAbs(a, b) <= tol && dateGap(a, b) <= win; });
        if (c.length) { c.sort(function (x, y) { return dateGap(a, x) - dateGap(a, y); }); pair(a, c[0], "probable", ["Paired on GSTIN, amount and date; invoice number differs (2B: " + a.inum + " / books: " + c[0].inum + ")"]); }
      });
      free2().forEach(function (a) { /* same PAN, different state registration */
        if (p2[a.id] || !a.gstin) return;
        var c = freeB().filter(function (b) { return b.gstin && b.gstin !== a.gstin && b.gstin.slice(2, 12) === a.gstin.slice(2, 12) && b.cls === a.cls && b.inumN === a.inumN && taxDiffAbs(a, b) <= tol; });
        if (c.length) pair(a, c[0], "probable", ["Same supplier PAN but a different state GSTIN (2B: " + a.gstin + " / books: " + c[0].gstin + ")"]);
      });
    })();
    /* one-to-many in both directions */
    if (o.groupMatch) {
      var guard = 0;
      (function groupPass() {
        var byG = {};
        free2().forEach(function (a) { (byG[a.gstin] = byG[a.gstin] || { a: [], b: [] }).a.push(a); });
        freeB().forEach(function (b) { (byG[b.gstin] = byG[b.gstin] || { a: [], b: [] }).b.push(b); });
        Object.keys(byG).forEach(function (g) {
          if (!g) return;
          var G = byG[g];
          if (G.a.length === 0 || G.b.length === 0) return;
          function trySide(singles, many, singleIsA) {
            singles.forEach(function (s) {
              if (singleIsA ? p2[s.id] : pB[s.id]) return;
              var pool = many.filter(function (m) { return !(singleIsA ? pB[m.id] : p2[m.id]) && m.cls === s.cls; });
              if (pool.length < 2 || pool.length > 14) return;
              var found = null;
              (function rec(start, picked, tx, tt) {
                if (found) return;
                if (picked.length >= 2 && absd(tx - s.taxable) <= tol * picked.length && absd(tt - s.tax) <= tol * picked.length) { found = picked.slice(); return; }
                if (picked.length >= 4) return;
                for (var i = start; i < pool.length; i++) { picked.push(pool[i]); rec(i + 1, picked, tx + pool[i].taxable, tt + pool[i].tax); picked.pop(); if (found) return; }
              })(0, [], 0, 0);
              if (found) {
                if (singleIsA) { p2[s.id] = true; found.forEach(function (m) { pB[m.id] = true; }); rows.push({ b2: [s], bk: found, pass: "group", notes: ["One document in 2B matches " + found.length + " entries in books: " + found.map(function (m) { return m.inum; }).join(", ")] }); }
                else { pB[s.id] = true; found.forEach(function (m) { p2[m.id] = true; }); rows.push({ b2: found, bk: [s], pass: "group", notes: ["One entry in books matches " + found.length + " documents in 2B: " + found.map(function (m) { return m.inum; }).join(", ")] }); }
              }
            });
          }
          trySide(G.a, G.b, true);
          trySide(G.b, G.a, false);
        });
      })();
    }
    /* unmatched */
    free2().forEach(function (a) { rows.push({ b2: [a], bk: [], pass: "", notes: [] }); });
    freeB().forEach(function (b) { rows.push({ b2: [], bk: [b], pass: "", notes: [] }); });

    /* classify rows */
    rows.forEach(function (r, i) {
      r.id = "R" + (i + 1);
      r.tax2 = sumDocs(r.b2, "tax"); r.taxBk = sumDocs(r.bk, "tax");
      r.taxable2 = sumDocs(r.b2, "taxable"); r.taxableBk = sumDocs(r.bk, "taxable");
      var a = r.b2[0], b = r.bk[0];
      r.gstin = (a || b).gstin; r.name = (a && a.name) || (b && b.name) || "";
      r.reasons = r.notes.slice();
      if (!b) {
        r.status = "Not in Books";
        if (a.itcavl === "N") r.reasons.push("2B shows ITC not available" + (a.reason ? " (reason " + a.reason + ")" : "") + " - no entry needed unless eligible later");
        else r.reasons.push("In 2B but not found in purchase books - record it, or ask the supplier if it is not yours");
        if (a.amended) r.reasons.push("This is an amended document (" + a.sec + ")");
      } else if (!a) {
        r.status = "Not in 2B";
        var sameKeyPaired = rows.some(function (x) { return x !== r && x.bk.length && x.bk[0] !== b && x.bk[0].gstin === b.gstin && x.bk[0].inumN === b.inumN && x.bk[0].cls === b.cls && x.b2.length; });
        if (sameKeyPaired) { r.dup = true; r.reasons.push("Duplicate entry in books - the same invoice is already matched to 2B"); }
        else if (!b.gstin) r.reasons.push("No supplier GSTIN in books - unregistered supplier or reverse charge; not expected in 2B");
        else if (!gstinValid(b.gstin)) r.reasons.push("Supplier GSTIN in books is not a valid GSTIN (check for a typing error)");
        else {
          var near2b = live2.filter(function (x) { return x.gstin === b.gstin; });
          if (!near2b.length) r.reasons.push("Supplier has no document at all in this 2B - may not have filed GSTR-1 / IFF yet");
          else r.reasons.push("Supplier appears in 2B but this invoice does not - may be in a later month's 2B or not yet reported");
          if (b.dt) { var ed = dn(b.dt); var lastDay = new Date(ed * 86400000); var eom = Math.round(Date.UTC(lastDay.getUTCFullYear(), lastDay.getUTCMonth() + 1, 0) / 86400000); if (eom - ed <= 7) r.reasons.push("Dated at month end - often appears in the next month's 2B"); }
        }
        if (b.cls === "CN") r.reasons.push("Credit note in books - not in 2B (supplier may not have reported it)");
      } else {
        // paired - compare numbers
        var diffs = [];
        var dT = r.taxableBk - r.taxable2;
        var dI = sumDocs(r.bk, "igst") - sumDocs(r.b2, "igst"), dC = sumDocs(r.bk, "cgst") - sumDocs(r.b2, "cgst"), dS = sumDocs(r.bk, "sgst") - sumDocs(r.b2, "sgst"), dX = sumDocs(r.bk, "cess") - sumDocs(r.b2, "cess");
        r.diff = { taxable: dT, igst: dI, cgst: dC, sgst: dS, cess: dX, tax: r.taxBk - r.tax2 };
        var tolN = tol * Math.max(1, Math.max(r.b2.length, r.bk.length));
        var headsOff = absd(dI) > tolN || absd(dC) > tolN || absd(dS) > tolN || absd(dX) > tolN;
        var totalOff = absd(r.diff.tax) > tolN;
        if (absd(dT) > tolN) diffs.push("Taxable value differs by " + inr(dT));
        if (headsOff && !totalOff) diffs.push("Tax head differs: books IGST " + inr(sumDocs(r.bk, "igst")) + " / CGST " + inr(sumDocs(r.bk, "cgst")) + " / SGST " + inr(sumDocs(r.bk, "sgst")) + " against 2B IGST " + inr(sumDocs(r.b2, "igst")) + " / CGST " + inr(sumDocs(r.b2, "cgst")) + " / SGST " + inr(sumDocs(r.b2, "sgst")) + " - check the place of supply");
        else {
          if (absd(dI) > tolN) diffs.push("IGST differs by " + inr(dI));
          if (absd(dC) > tolN) diffs.push("CGST differs by " + inr(dC));
          if (absd(dS) > tolN) diffs.push("SGST/UTGST differs by " + inr(dS));
          if (absd(dX) > tolN) diffs.push("Cess differs by " + inr(dX));
        }
        if (a.dt && b.dt && dateGap(a, b) > win && r.pass !== "probable") diffs.push("Date differs: 2B " + fmtDMY(a.dt) + " / books " + fmtDMY(b.dt));
        var dateOnly = diffs.length === 1 && /^Date differs/.test(diffs[0]);
        if (r.pass === "amended") r.status = "Amended in 2B";
        else if (r.pass === "probable") r.status = "Probable match";
        else if (r.pass === "gstin") r.status = "Mismatch";
        else if (r.pass === "group") r.status = (diffs.length && !dateOnly) ? "Mismatch" : "Probable match";
        else if (diffs.length && !dateOnly) r.status = "Mismatch";
        else r.status = "Matched";
        if (r.status === "Amended in 2B" && diffs.length) r.reasons = r.reasons.concat(diffs);
        else if (r.status !== "Matched") r.reasons = r.reasons.concat(diffs);
        else if (dateOnly) r.reasons = r.reasons.concat(diffs);
        if (a.itcavl === "N") { r.itcNotAvl = true; r.reasons.push("2B shows ITC not available" + (a.reason ? " (reason " + a.reason + ")" : "") + " - do not claim"); }
        if (r.status === "Probable match" && !r.reasons.length) r.reasons.push("Paired on GSTIN and amount");
      }
      if (a && a.itcavl === "N") r.itcNotAvl = true;
    });
    /* duplicates inside 2B itself */
    // statement
    var st = statement(live2, bk, rows, superseded);
    var gst = {};
    rows.forEach(function (r) { gst[r.status] = gst[r.status] || { n: 0, tax2: 0, taxBk: 0 }; gst[r.status].n++; gst[r.status].tax2 += r.tax2; gst[r.status].taxBk += r.taxBk; });
    return { rows: rows, statement: st, byStatus: gst, superseded: superseded, docs2b: live2, docsBooks: bk, options: o };
  }
  function statement(live2, bk, rows, superseded) {
    var A = 0, B = 0, C = 0, D = 0, E = 0, notAvl = 0, i;
    live2.forEach(function (d) { A += d.tax; if (d.itcavl === "N") notAvl += d.tax; });
    bk.forEach(function (d) { E += d.tax; });
    rows.forEach(function (r) {
      if (!r.bk.length) B += r.tax2;
      else if (!r.b2.length) C += r.taxBk;
      else D += r.taxBk - r.tax2;
    });
    return { A: A, B: B, C: C, D: D, E: E, check: A - B + C + D, ok: (A - B + C + D) === E, notAvl2B: notAvl, eligible2B: A - notAvl, supersededCount: superseded.length };
  }

  /* ================= section 17(5) register ================= */
  var SRC_NOTE = "Secondary sources (ClearTax / Vayana / Busy explainers) - not yet checked against the bare Act. Verify before relying on it.";
  var RULES17 = [
    { id: "17-5-a", clause: "17(5)(a) / (aa)", title: "Motor vehicles, vessels and aircraft", prov: "Section 17(5)(a), (aa) CGST Act, 2017",
      kw: ["motor car", "car service", "car repair", "maruti", "hyundai", "toyota kirloskar", "honda cars", "kia motors", "skoda", "volkswagen", "bmw", "mercedes", "audi ", "car hire", "automobile", "automotive", "aircraft", "helicopter", "yacht", "vessel"], hsn: ["8703", "8802", "8903"],
      allowed: "Allowed when the vehicle is used to supply vehicles, transport passengers, or for training in driving; or when used to supply goods/services of the same kind (aircraft, vessels).", eff: "01-07-2017", conf: "Medium" },
    { id: "17-5-ab", clause: "17(5)(ab)", title: "Insurance, servicing and repair of blocked vehicles", prov: "Section 17(5)(ab) CGST Act, 2017",
      kw: ["motor insurance", "vehicle insurance", "car insurance", "vehicle repair", "vehicle servicing", "vehicle maintenance", "tyre", "garage"], hsn: ["998714", "997139"],
      allowed: "Allowed only where ITC on the vehicle itself is allowed.", eff: "01-07-2017", conf: "Medium" },
    { id: "17-5-b1", clause: "17(5)(b)(i)", title: "Food, beverages, outdoor catering, beauty, health, cosmetic surgery, rentals, life and health insurance", prov: "Section 17(5)(b)(i) CGST Act, 2017",
      kw: ["restaurant", "catering", "canteen", "food", "beverage", "bakery", "sweets", "cafe", "swiggy", "zomato", "hotel", "banquet", "salon", "beauty", "parlour", "spa ", "hospital", "clinic", "dental", "cosmetic", "plastic surgery", "life insurance", "health insurance", "mediclaim", "lic of india", "rent a cab", "cab rental", "car rental"], hsn: ["9963", "996331", "996332", "996334", "996335", "996336", "996337", "996338", "996339", "9997", "999721", "999722", "999723", "9966", "997132", "997133"],
      allowed: "Allowed if the outward supply is of the same category, or if providing the service is mandated by law for the employer (e.g. statutory canteen).", eff: "01-02-2019 (substituted); earlier text from 01-07-2017", conf: "Medium" },
    { id: "17-5-b2", clause: "17(5)(b)(ii)", title: "Membership of a club, health and fitness centre", prov: "Section 17(5)(b)(ii) CGST Act, 2017",
      kw: ["club", "gym", "fitness", "health club", "membership fee", "country club"], hsn: ["999652", "999659"],
      allowed: "No general exception - ITC is blocked even where the membership is a business expense.", eff: "01-07-2017", conf: "Medium" },
    { id: "17-5-b3", clause: "17(5)(b)(iii)", title: "Travel benefits to employees on vacation (leave or home travel)", prov: "Section 17(5)(b)(iii) CGST Act, 2017",
      kw: ["leave travel", "ltc", "home travel", "holiday package", "tour package"], hsn: [],
      allowed: "Blocked for leave/home travel concession. Business travel is not covered by this clause.", eff: "01-07-2017", conf: "Low" },
    { id: "17-5-cd", clause: "17(5)(c) / (d)", title: "Works contract and goods/services for construction of immovable property", prov: "Section 17(5)(c), (d) CGST Act, 2017",
      kw: ["works contract", "civil work", "construction", "contractor", "cement", "tmt", "bricks", "renovation", "interior", "building material", "plumbing", "paint"], hsn: ["9954", "2523", "7214", "6810"],
      allowed: "Not blocked for plant or machinery (as defined in the explanation), or where the works contract is itself used to supply works contract services. Check the current text and case law before deciding.", eff: "01-07-2017; (d) substituted w.e.f. 01-02-2019", conf: "Medium" },
    { id: "17-5-h", clause: "17(5)(h)", title: "Goods lost, stolen, destroyed, written off, gifts and free samples", prov: "Section 17(5)(h) CGST Act, 2017",
      kw: ["gift", "free sample", "samples", "written off", "stolen", "destroyed", "hamper"], hsn: [],
      allowed: "Allowed for goods that are not covered by the clause; gifts and samples to non-employees are blocked.", eff: "01-07-2017", conf: "Low" },
    { id: "17-5-g", clause: "17(5)(g)", title: "Goods or services used for personal consumption", prov: "Section 17(5)(g) CGST Act, 2017",
      kw: ["personal", "household", "residence", "domestic help"], hsn: [],
      allowed: "Not blocked where the item is used for business.", eff: "01-07-2017", conf: "Low" }
  ];
  RULES17.forEach(function (r) { r.sourceNote = SRC_NOTE; r.verified = VERIFIED_ON; });
  function flag17(doc, rules, extra) {
    var out = [], hay = (" " + doc.name + " " + doc.ledger + " ").toLowerCase();
    var hsn = String(doc.hsn || "").replace(/\D/g, "");
    (rules || RULES17).forEach(function (r) {
      var kws = (r.kw || []).concat(extra && extra[r.id] || []);
      var hit = null;
      for (var i = 0; i < kws.length; i++) { var kw = String(kws[i]).toLowerCase().trim(); if (kw && hay.indexOf(kw) >= 0) { hit = "keyword '" + kws[i] + "'"; break; } }
      var hsnHit = false;
      if (hsn) for (var j = 0; j < (r.hsn || []).length; j++) if (hsn.indexOf(r.hsn[j]) === 0) { hsnHit = true; break; }
      if (hit || hsnHit) out.push({ rule: r.id, clause: r.clause, matchedOn: hit && hsnHit ? hit + " and HSN " + hsn : (hit || "HSN/SAC " + hsn), confidence: (hit && hsnHit) ? "High" : (hsnHit ? "High" : r.conf) });
    });
    return out;
  }
  /* decisions: {vendor:{GSTIN:'block'|'eligible'}, bill:{key:'block'|'eligible'}} */
  function billKey(d) { return d.gstin + "|" + d.inumN + "|" + d.cls; }
  function review17(books, decisions, rules, extra) {
    decisions = decisions || {}; var vend = decisions.vendor || {}, bill = decisions.bill || {};
    var items = [], blocked = 0, review = 0, eligible = 0;
    books.forEach(function (d) {
      var fl = flag17(d, rules, extra);
      if (!fl.length && !bill[billKey(d)] && !vend[d.gstin]) return;
      var dec = bill[billKey(d)] || (fl.length ? vend[d.gstin] : "") || (vend[d.gstin] && fl.length === 0 ? "" : "");
      var state = dec === "block" ? "Blocked" : dec === "eligible" ? "Eligible" : fl.length ? "To review" : "";
      if (!state) return;
      items.push({ doc: d, flags: fl, state: state, via: bill[billKey(d)] ? "bill" : (vend[d.gstin] ? "vendor" : "") });
      if (state === "Blocked") blocked += d.tax; else if (state === "Eligible") eligible += d.tax; else review += d.tax;
    });
    return { items: items, blockedTax: blocked, reviewTax: review, eligibleTax: eligible };
  }

  /* ================= deadlines: s.16(4) and Rule 37 ================= */
  function s164Deadline(dtISO) {
    if (!dtISO) return null;
    var fy = fyOf(dtISO);
    return (fy + 1) + "-11-30"; /* 30 November following the end of the financial year (annual return filed earlier shortens it) */
  }
  function deadlines(books, asOf, opts) {
    opts = opts || {}; var a = dn(asOf), out = [];
    books.forEach(function (d) {
      if (d.cls === "CN" || !d.dt) return;
      var dl = s164Deadline(d.dt), left = dn(dl) - a;
      var x = { doc: d, deadline: dl, daysLeft: left, state: left < 0 ? "Passed" : left <= (opts.soonDays || 45) ? "Due soon" : "Open" };
      out.push(x);
    });
    return out;
  }
  function rule37(books, asOf, hasPayCol, days) {
    days = days || 180; var a = dn(asOf), out = [];
    books.forEach(function (d) {
      if (d.cls === "CN" || !d.dt || d.tax <= 0 || d.rev === "Y") return;
      var inv = dn(d.dt), lim = inv + days;
      if (d.paydate) {
        var p = dn(d.paydate);
        if (p > lim) out.push({ doc: d, kind: "Paid late", paidAfter: p - inv, limitDate: fromDn(lim), note: "Paid " + (p - inv) + " days after the invoice. ITC claimed earlier must be reversed with interest and can be re-availed on payment (Rule 37)." });
      } else if (hasPayCol && a > lim) {
        out.push({ doc: d, kind: "Unpaid past limit", paidAfter: null, limitDate: fromDn(lim), note: "No payment date and the 180 days ended on " + fmtDMY(fromDn(lim)) + ". Reverse the ITC with interest unless paid (Rule 37)." });
      } else if (hasPayCol && a > lim - 30) {
        out.push({ doc: d, kind: "Approaching limit", paidAfter: null, limitDate: fromDn(lim), note: "180 days end on " + fmtDMY(fromDn(lim)) + ". Pay the supplier before this date." });
      }
    });
    return out;
  }

  /* ================= vendor summary ================= */
  function vendorSummary(result, asOf) {
    var v = {};
    result.rows.forEach(function (r) {
      var g = r.gstin || "(none)";
      var o = v[g] = v[g] || { gstin: g, name: "", docs: 0, notIn2B: 0, notInBooks: 0, mismatch: 0, atRisk: 0, atRiskDocs: [], nextDeadline: null };
      o.name = o.name || r.name; o.docs++;
      if (r.status === "Not in 2B") { o.notIn2B++; o.atRisk += r.taxBk; o.atRiskDocs.push(r); }
      else if (r.status === "Not in Books") o.notInBooks++;
      else if (r.status === "Mismatch") { o.mismatch++; if (r.taxBk > r.tax2) { o.atRisk += r.taxBk - r.tax2; o.atRiskDocs.push(r); } }
      if ((r.status === "Not in 2B" || r.status === "Mismatch") && r.bk[0] && r.bk[0].dt && r.bk[0].cls !== "CN") {
        var dl = s164Deadline(r.bk[0].dt); if (!o.nextDeadline || dl < o.nextDeadline) o.nextDeadline = dl;
      }
    });
    var arr = Object.keys(v).map(function (k) { return v[k]; }).filter(function (o) { return o.atRisk > 0 || o.notInBooks > 0 || o.mismatch > 0; });
    arr.sort(function (a, b) { return b.atRisk - a.atRisk; });
    return arr;
  }
  var DEFAULT_TEMPLATE = "Dear {{supplier}},\n\nOur purchase records for {{period}} show the following invoices from you (GSTIN {{gstin}}) that do not appear, or do not agree, in our GSTR-2B:\n\n{{list}}\n\nTotal GST involved: Rs {{amount}}.\n\nPlease check whether these were reported in your GSTR-1 / IFF and, if not, file them (or an amendment) so that we can claim the credit before the due date. If any detail in our records is wrong, please tell us.\n\nRegards,\n{{preparedBy}}\n{{client}}";
  function vendorMessage(v, ctx, tpl) {
    var lines = v.atRiskDocs.map(function (r) {
      var b = r.bk[0]; return "- " + (b ? b.inum : r.b2[0].inum) + " dated " + fmtDMY(b ? b.dt : r.b2[0].dt) + ", GST Rs " + inr(r.taxBk) + (r.status === "Mismatch" ? " (2B shows Rs " + inr(r.tax2) + ")" : "");
    });
    return String(tpl || DEFAULT_TEMPLATE)
      .replace(/\{\{supplier\}\}/g, v.name || v.gstin).replace(/\{\{gstin\}\}/g, v.gstin).replace(/\{\{period\}\}/g, ctx.period || "the period")
      .replace(/\{\{list\}\}/g, lines.join("\n")).replace(/\{\{amount\}\}/g, inr(v.atRisk)).replace(/\{\{preparedBy\}\}/g, ctx.preparedBy || "").replace(/\{\{client\}\}/g, ctx.client || "");
  }

  /* ================= errors ================= */
  var ERRORS = {
    "MT-GR-001": { title: "The file is not valid JSON", cause: "The file was edited, is cut short, or is not a GSTR-2B JSON.", action: "Download the GSTR-2B JSON again from the GST portal and upload it without opening it in an editor." },
    "MT-GR-002": { title: "No GSTR-2B data found in the file", cause: "The file is a different return, or the Excel file has no B2B / credit-note sheets.", action: "Use the GSTR-2B download from the portal (JSON, or the Excel with a B2B sheet)." },
    "MT-GR-003": { title: "Could not find a header row", cause: "Fewer than five recognisable column names were found in the first 25 rows.", action: "Check that the sheet has column names such as GSTIN, Invoice No, Date, Taxable Value, CGST, SGST, IGST. You can also use the Change button to map columns by hand." },
    "MT-GR-004": { title: "No invoice number column", cause: "No column was recognised as the invoice or note number.", action: "Open the column mapping and choose the column that holds the supplier's invoice number." },
    "MT-GR-005": { title: "No documents were read", cause: "The sheet was read but every row was empty or a total row.", action: "Pick another sheet, or check the header row." },
    "MT-GR-006": { title: "Date could not be read", cause: "A date cell is text in an unexpected format.", action: "Use dd-mm-yyyy or dd/mm/yyyy. Rows without a date are still reconciled but are skipped by deadline checks." },
    "MT-GR-007": { title: "Statement does not balance", cause: "A + C + D - B should equal the books total. A difference means a programming fault.", action: "Report it with the files you used through the Feedback tab." },
    "MT-GR-008": { title: "Backup file could not be read", cause: "The file is not a backup made by this tool, or has been edited.", action: "Choose a backup downloaded from the Backup tab." }
  };

  return {
    VERSION: VERSION, VERIFIED_ON: VERIFIED_ON, DEFAULTS: DEFAULTS, RULES17: RULES17, ERRORS: ERRORS, FIELD_LABELS: FIELD_LABELS, FIELD_ORDER: FIELD_ORDER, SYN: SYN, DEFAULT_TEMPLATE: DEFAULT_TEMPLATE, SRC_NOTE: SRC_NOTE,
    parseDate: parseDate, fmtDMY: fmtDMY, fyOf: fyOf, fyLabel: fyLabel, dn: dn, fromDn: fromDn, toPaise: toPaise, inr: inr,
    gstinValid: gstinValid, gstinShape: gstinShape, gstinCheckChar: gstinCheckChar, normGstin: normGstin, lev: lev, normInv: normInv, tailNum: tailNum,
    autoMap: autoMap, findHeaderRow: findHeaderRow, parseTable: parseTable, parse2BJson: parse2BJson, parse2BWorkbook: parse2BWorkbook, mergeLines: mergeLines, mkDoc: mkDoc, filterDocs: filterDocs,
    reconcile: reconcile, flag17: flag17, review17: review17, billKey: billKey, s164Deadline: s164Deadline, deadlines: deadlines, rule37: rule37, vendorSummary: vendorSummary, vendorMessage: vendorMessage
  };
});
