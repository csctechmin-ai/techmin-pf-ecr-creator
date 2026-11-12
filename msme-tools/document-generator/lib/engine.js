/*! MSME Tools engine v1.0.0 - pure logic (no DOM). Money in integer paise, rates in hundredths of a percent. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MSME = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var VERSION = "1.0.0";
  var VERIFIED_ON = "2026-11-12";

  /* ---------- Dates (ISO YYYY-MM-DD, day numbers since 1970-01-01, UTC only) ---------- */
  function parseISO(s) {
    if (typeof s !== "string") return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (y < 1990 || y > 2200 || mo < 1 || mo > 12 || d < 1) return null;
    var t = Date.UTC(y, mo - 1, d);
    var c = new Date(t);
    if (c.getUTCFullYear() !== y || c.getUTCMonth() !== mo - 1 || c.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d, dn: Math.round(t / 86400000) };
  }
  function dn(iso) { var p = parseISO(iso); return p ? p.dn : null; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fromDn(n) {
    var c = new Date(n * 86400000);
    return c.getUTCFullYear() + "-" + pad(c.getUTCMonth() + 1) + "-" + pad(c.getUTCDate());
  }
  function addDays(iso, k) { return fromDn(dn(iso) + k); }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function endOfMonthDn(n) {
    var c = new Date(n * 86400000);
    return Math.round(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + 1, 0) / 86400000);
  }
  /* add k months to ISO date keeping day-of-month, clamped to month length */
  function addMonthsDn(iso, k) {
    var p = parseISO(iso);
    var tot = p.y * 12 + (p.m - 1) + k;
    var y = Math.floor(tot / 12), m = (tot % 12) + 1;
    var d = Math.min(p.d, daysInMonth(y, m));
    return Math.round(Date.UTC(y, m - 1, d) / 86400000);
  }
  function fmtDMY(iso) {
    var p = parseISO(iso);
    return p ? pad(p.d) + "-" + pad(p.m) + "-" + p.y : "";
  }
  /* Indian financial year start year for a date: 2024-04-01..2025-03-31 -> 2024 */
  function fyStart(iso) { var p = parseISO(iso); return p.m >= 4 ? p.y : p.y - 1; }
  function fyLabel(startYear) { return startYear + "-" + String((startYear + 1) % 100).padStart(2, "0"); }

  /* ---------- Money (integer paise) ---------- */
  var MAX_PAISE = 99999999999999; // 9,99,99,99,99,999.99 rupees ceiling for sanity
  function parseRupees(s) {
    if (typeof s === "number") s = String(s);
    if (typeof s !== "string") return null;
    s = s.replace(/[,\s₹]/g, "").replace(/^rs\.?/i, "");
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
    var parts = s.split(".");
    var p = parseInt(parts[0], 10) * 100 + (parts[1] ? parseInt((parts[1] + "0").slice(0, 2), 10) : 0);
    if (!isFinite(p) || p > MAX_PAISE) return null;
    return p;
  }
  function fmtINR(paise, withSymbol) {
    var neg = paise < 0; if (neg) paise = -paise;
    var r = Math.floor(paise / 100), q = paise % 100;
    var s = String(r), out;
    if (s.length > 3) {
      var last3 = s.slice(-3), rest = s.slice(0, -3);
      out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
    } else out = s;
    return (neg ? "-" : "") + (withSymbol ? "₹" : "") + out + "." + pad(q);
  }
  function fmtPct(h) { return (h / 100).toFixed(2) + "%"; }
  function roundDiv(n, d) { // BigInt round half up, non-negative
    return (n * 2n + d) / (d * 2n);
  }

  /* ---------- RBI Bank Rate master (hundredths of percent) ---------- */
  var RBI_PRESS = "RBI press release / MPC resolution";
  var RATES = [
    ["2003-03-03", 625, "RBI Handbook of Statistics, Table 44 (https://www.rbi.org.in/scripts/PublicationsView.aspx?id=19035)"],
    ["2003-04-29", 600, "RBI Handbook of Statistics, Table 44"],
    ["2012-02-13", 950, "RBI Handbook of Statistics, Table 44"],
    ["2012-04-17", 900, "RBI Handbook of Statistics, Table 44"],
    ["2013-01-29", 875, "RBI Handbook of Statistics, Table 44"],
    ["2013-03-19", 850, "RBI Handbook of Statistics, Table 44"],
    ["2013-05-03", 825, "RBI Handbook of Statistics, Table 44"],
    ["2013-07-15", 1025, "RBI Handbook of Statistics, Table 44"],
    ["2013-09-20", 950, "RBI Handbook of Statistics, Table 44"],
    ["2013-10-07", 900, "RBI Handbook of Statistics, Table 44"],
    ["2013-10-29", 875, "RBI Handbook of Statistics, Table 44"],
    ["2014-01-28", 900, "RBI Handbook of Statistics, Table 44"],
    ["2015-01-15", 875, "RBI Handbook of Statistics, Table 44"],
    ["2015-03-04", 850, "RBI Handbook of Statistics, Table 44"],
    ["2015-06-02", 825, "RBI Handbook of Statistics, Table 44"],
    ["2015-09-29", 775, "RBI Handbook of Statistics, Table 44"],
    ["2016-04-05", 700, "RBI Handbook of Statistics, Table 44"],
    ["2016-10-04", 675, "RBI Handbook of Statistics, Table 44"],
    ["2017-04-06", 650, "RBI Handbook of Statistics, Table 44"],
    ["2017-08-02", 625, "RBI Handbook of Statistics, Table 44"],
    ["2018-06-06", 650, "RBI Handbook of Statistics, Table 44"],
    ["2018-08-01", 675, "RBI Handbook of Statistics, Table 44"],
    ["2019-02-07", 650, "RBI Handbook of Statistics, Table 44"],
    ["2019-04-04", 625, "RBI Handbook of Statistics, Table 44"],
    ["2019-06-06", 600, "RBI Handbook of Statistics, Table 44"],
    ["2019-08-07", 565, "RBI Handbook of Statistics, Table 44"],
    ["2019-10-04", 540, RBI_PRESS + " 4 Oct 2019 (prid 48319)"],
    ["2020-03-27", 465, RBI_PRESS + " 27 Mar 2020 (prid 49659)"],
    ["2020-05-22", 425, RBI_PRESS + " 22 May 2020"],
    ["2022-05-04", 465, RBI_PRESS + " 4 May 2022 (prid 53651)"],
    ["2022-06-08", 515, RBI_PRESS + " 8 Jun 2022 (prid 53832)"],
    ["2022-08-05", 565, RBI_PRESS + " 5 Aug 2022 (prid 54148)"],
    ["2022-09-30", 615, RBI_PRESS + " 30 Sep 2022 (prid 54465)"],
    ["2022-12-07", 650, RBI_PRESS + " 7 Dec 2022 (prid 54817)"],
    ["2023-02-08", 675, RBI_PRESS + " 8 Feb 2023 (prid 55178)"],
    ["2025-02-07", 650, RBI_PRESS + " 7 Feb 2025 (prid 59692)"],
    ["2025-04-09", 625, RBI_PRESS + " 9 Apr 2025 (prid 60176)"],
    ["2025-06-06", 575, RBI_PRESS + " 6 Jun 2025 (prid 60605)"],
    ["2025-12-05", 550, RBI_PRESS + " 5 Dec 2025 (prid 61749)"],
    ["2026-10-07", 575, RBI_PRESS + " 7 Oct 2026 (prid 63742)"]
  ].map(function (r, i) {
    return { id: "BR" + String(i + 1).padStart(3, "0"), from: r[0], bank: r[1], source: r[2], status: "verified", verifiedOn: VERIFIED_ON, custom: false };
  });
  var RATE_VERIFIED_THROUGH = VERIFIED_ON; // rate table known complete up to this date
  var ACT_START = "2006-10-02"; // MSMED Act ss.15-24 in force (S.O. 1154(E) dated 18-07-2006)

  function sortedRates(extra) {
    var all = RATES.concat((extra || []).filter(function (r) { return r && parseISO(r.from) && typeof r.bank === "number"; }));
    all.sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : 0; });
    return all;
  }
  /* rate row in force on ISO date (last row with from <= date) */
  function rateOn(iso, extra) {
    var t = sortedRates(extra), best = null;
    for (var i = 0; i < t.length; i++) { if (t[i].from <= iso) best = t[i]; else break; }
    return best;
  }

  /* ---------- Acceptance, due date ---------- */
  function resolveTerms(inv) {
    var out = { errors: [], warnings: [] };
    var del = dn(inv.deliveryDate);
    if (del === null) { out.errors.push({ code: "MT-DAT-001", field: "deliveryDate" }); return out; }
    var acc = del;
    if (inv.objectionDate) {
      var od = dn(inv.objectionDate);
      if (od === null) { out.errors.push({ code: "MT-DAT-002", field: "objectionDate" }); return out; }
      if (od < del) { out.errors.push({ code: "MT-DAT-003", field: "objectionDate" }); return out; }
      if (od - del <= 15) {
        var rd = dn(inv.objectionRemovedDate);
        if (!inv.objectionRemovedDate) { out.pendingAcceptance = true; out.warnings.push({ code: "MT-LEG-006", field: "objectionRemovedDate" }); return out; }
        if (rd === null) { out.errors.push({ code: "MT-DAT-002", field: "objectionRemovedDate" }); return out; }
        if (rd < od) { out.errors.push({ code: "MT-DAT-003", field: "objectionRemovedDate" }); return out; }
        acc = rd;
      } else {
        out.warnings.push({ code: "MT-LEG-007", field: "objectionDate" });
      }
    }
    var days = 15, basis = "no written agreement: 15 days (s.2(b), s.15)";
    if (inv.agreement) {
      var cd = parseInt(inv.creditDays, 10);
      if (!(cd >= 0)) { out.errors.push({ code: "MT-INP-006", field: "creditDays" }); return out; }
      if (cd > 45) { out.warnings.push({ code: "MT-LEG-004", field: "creditDays" }); cd = 45; }
      days = cd; basis = "written agreement: " + cd + " days (proviso to s.15, max 45)";
    }
    out.acceptanceDn = acc; out.creditDays = days; out.basis = basis;
    out.dueDn = acc + days;          // last day on which payment can be made in time
    out.interestStartDn = acc + days + 1;
    return out;
  }

  /* ---------- Interest engine ---------- */
  var DEFAULTS = { rateBasis: "periodwise", restBasis: "calendar", appropriation: "interest-first" };

  function calcInterest(inv, asOfISO, opts, extraRates) {
    opts = Object.assign({}, DEFAULTS, opts || {});
    var res = { ok: false, errors: [], warnings: [], rows: [], opts: opts };
    var terms = resolveTerms(inv);
    res.errors = res.errors.concat(terms.errors); res.warnings = res.warnings.concat(terms.warnings);
    if (terms.errors.length) return res;
    var total = parseInt(inv.totalPaise, 10);
    if (!(total > 0)) { res.errors.push({ code: "MT-INP-004", field: "totalPaise" }); return res; }
    var asOf = dn(asOfISO);
    if (asOf === null) { res.errors.push({ code: "MT-DAT-004", field: "asOf" }); return res; }
    var excl = parseInt(inv.excludedPaise, 10) || 0;
    if (excl < 0 || excl > total) { res.errors.push({ code: "MT-INP-007", field: "excludedPaise" }); return res; }
    var pays = (inv.payments || []).map(function (p, i) { return { id: p.id || i, dn: dn(p.date), paise: parseInt(p.paise, 10), note: p.note || "", date: p.date }; });
    for (var i = 0; i < pays.length; i++) {
      if (pays[i].dn === null) { res.errors.push({ code: "MT-DAT-005", field: "payments" }); return res; }
      if (!(pays[i].paise > 0)) { res.errors.push({ code: "MT-INP-005", field: "payments" }); return res; }
    }
    pays.sort(function (a, b) { return a.dn - b.dn; });
    pays = pays.filter(function (p) { return p.dn <= asOf; }); // payments after the calculation date are not part of this calculation
    res.acceptanceDate = fromDn(terms.acceptanceDn);
    res.dueDate = fromDn(terms.dueDn);
    res.interestStartDate = fromDn(terms.interestStartDn);
    res.creditDays = terms.creditDays; res.basis = terms.basis;
    if (terms.pendingAcceptance) { res.ok = true; res.pending = true; res.totals = zeroTotals(total, pays); return res; }
    res.warnings.push({ code: "MT-LEG-005" });
    if (terms.dueDn + 1 < dn(ACT_START)) { res.errors.push({ code: "MT-LEG-003", field: "deliveryDate" }); return res; }
    if (asOf > dn(RATE_VERIFIED_THROUGH)) {
      var lastRow = sortedRates(extraRates).slice(-1)[0];
      if (!lastRow || lastRow.status === "verified") res.warnings.push({ code: "MT-RAT-002", field: "asOf" });
      res.provisional = true;
    }
    var usesUnverified = false;
    var D = 3650000n; // 10000 * 365 : rate hundredths-of-percent * days / D
    var P = BigInt(total), C = 0n, A = 0n, accr = 0n; // principal, capitalised interest, pending accrued interest (paise), exact accrual numerator
    var exclB = BigInt(excl);
    var totInt = 0n, intPaid = 0n, prinPaid = 0n;
    var cur = terms.dueDn;
    var payIdx = 0;
    // apply payments on/before due date (no interest runs)
    var preRows = [];
    while (payIdx < pays.length && pays[payIdx].dn <= cur) {
      var pp = BigInt(pays[payIdx].paise);
      var applied = pp > P ? P : pp;
      P -= applied; prinPaid += applied;
      if (pp > applied) res.warnings.push({ code: "MT-CAL-003", field: "payments" });
      preRows.push({ date: pays[payIdx].date, event: "Payment within due date (no interest)", days: 0, rate: 0, base: 0, interest: 0, payment: Number(pp), toInterest: 0, toPrincipal: Number(applied), principal: Number(P), interestBal: 0, note: pays[payIdx].note });
      payIdx++;
    }
    res.rows = preRows;
    var startRate = rateOn(fromDn(terms.interestStartDn), extraRates);
    if (!startRate) { res.errors.push({ code: "MT-RAT-001", field: "interestStart" }); return res; }
    // rate change boundaries (rate effective from r applies to day r)
    var rateTable = sortedRates(extraRates);
    var nextRestAnchor = fromDn(terms.interestStartDn);
    var restCount = 0;
    function nextRestDn(from) { // first rest end date >= from+1
      if (opts.restBasis === "calendar") return endOfMonthDn(from + 1);
      var k = 1, d;
      do { d = addMonthsDn(nextRestAnchor, k) - 1; k++; } while (d <= from);
      return d;
    }
    function rateAt(dayNum) {
      var row = opts.rateBasis === "fixed" ? startRate : rateOn(fromDn(dayNum), extraRates);
      if (row.status !== "verified") usesUnverified = true;
      return row;
    }
    var lastRealised = cur;
    var guard = 0;
    var finalEnd = asOf;
    while (cur < finalEnd) {
      if (++guard > 20000) { res.errors.push({ code: "MT-CAL-002" }); return res; }
      var base = P > exclB ? P - exclB : 0n; // principal bearing interest
      var interestBearing = base + C;
      if (interestBearing === 0n && A === 0n && payIdx >= pays.length) { cur = finalEnd; break; }
      var rt = rateAt(cur + 1);
      var cands = [finalEnd];
      if (payIdx < pays.length) cands.push(pays[payIdx].dn);
      cands.push(nextRestDn(cur));
      if (opts.rateBasis !== "fixed") {
        for (var r = 0; r < rateTable.length; r++) { var rdn = dn(rateTable[r].from); if (rdn - 1 > cur) { cands.push(rdn - 1); break; } }
      }
      var nxt = Math.min.apply(null, cands);
      var days = nxt - cur;
      var annual = BigInt(rt.bank * 3);
      accr += interestBearing * annual * BigInt(days);
      var evt = [], isRest = false;
      // realise accrual into pending interest
      var realised = roundDiv(accr, D); accr = 0n; A += realised; totInt += realised;
      var rowBase = interestBearing;
      cur = nxt;
      var payTotal = 0n, toI = 0n, toP = 0n, payNotes = [];
      while (payIdx < pays.length && pays[payIdx].dn === cur) {
        var pa = BigInt(pays[payIdx].paise); payTotal += pa; if (pays[payIdx].note) payNotes.push(pays[payIdx].note);
        var rem = pa;
        var order = opts.appropriation === "principal-first" ? ["P", "C", "A"] : ["C", "A", "P"];
        for (var o = 0; o < order.length && rem > 0n; o++) {
          if (order[o] === "P") { var t = rem > P ? P : rem; P -= t; rem -= t; toP += t; prinPaid += t; }
          else if (order[o] === "C") { var t2 = rem > C ? C : rem; C -= t2; rem -= t2; toI += t2; intPaid += t2; }
          else { var t3 = rem > A ? A : rem; A -= t3; rem -= t3; toI += t3; intPaid += t3; }
        }
        if (rem > 0n) res.warnings.push({ code: "MT-CAL-003", field: "payments" });
        evt.push("Payment");
        payIdx++;
      }
      var restDue = (opts.restBasis === "calendar") ? (cur === endOfMonthDn(cur)) : isAnniversaryRest(nextRestAnchor, cur);
      if (restDue && A > 0n) { C += A; A = 0n; isRest = true; evt.push("Monthly rest (interest capitalised)"); }
      if (cur === finalEnd && !payTotal) evt.unshift("Calculation date");
      else if (!evt.length) evt.push("Rate change");
      res.rows.push({ date: fromDn(cur), event: evt.join(" + "), days: days, rate: rt.bank * 3, base: Number(rowBase), interest: Number(realised), payment: Number(payTotal), toInterest: Number(toI), toPrincipal: Number(toP), principal: Number(P), interestBal: Number(C + A), rest: isRest, note: payNotes.join("; ") });
    }
    if (usesUnverified) { res.warnings.push({ code: "MT-RAT-003" }); res.provisional = true; }
    res.ok = true;
    res.totals = {
      invoiceTotal: total,
      principalPaid: Number(prinPaid),
      principalOutstanding: Number(P),
      interestAccrued: Number(totInt),
      interestPaid: Number(intPaid),
      interestOutstanding: Number(C + A),
      totalOutstanding: Number(P + C + A),
      paidTotal: pays.reduce(function (s, p) { return s + p.paise; }, 0),
      delayDays: Math.max(0, Math.min(asOf, lastPaidOrAsOf(pays, P, asOf)) - terms.dueDn)
    };
    if (res.totals.principalOutstanding === 0 && pays.length) res.settled = true;
    return res;
  }
  function lastPaidOrAsOf(pays, P, asOf) { return P === 0n && pays.length ? pays[pays.length - 1].dn : asOf; }
  function isAnniversaryRest(anchor, dayNum) {
    for (var k = 1; k < 2400; k++) { var d = addMonthsDn(anchor, k) - 1; if (d === dayNum) return true; if (d > dayNum) return false; }
    return false;
  }
  function zeroTotals(total, pays) {
    var paid = pays.reduce(function (s, p) { return s + p.paise; }, 0);
    return { invoiceTotal: total, principalPaid: 0, principalOutstanding: total, interestAccrued: 0, interestPaid: 0, interestOutstanding: 0, totalOutstanding: total, paidTotal: paid, delayDays: 0 };
  }

  /* ---------- Eligibility for statutory interest (s.16) ---------- */
  function sectionEligibility(inv, sup) {
    // sup: { category:'micro'|'small'|'medium'|'unknown', udyamNo, udyamDate, activity:'manufacturing'|'services'|'trading' }
    var issues = [], level = "ELIGIBLE";
    function add(code, lvl) { issues.push({ code: code }); if (lvl === "NOT" || (lvl === "REVIEW" && level === "ELIGIBLE")) level = lvl === "NOT" ? "NOT_ELIGIBLE" : "REVIEW"; }
    if (!sup || !sup.category || sup.category === "unknown") add("MT-LEG-001", "REVIEW");
    else if (sup.category === "medium") add("MT-LEG-002", "NOT");
    if (!sup || !sup.udyamNo) add("MT-LEG-008", "REVIEW");
    var reg = sup && dn(sup.udyamDate);
    var contract = dn(inv.contractDate) !== null ? dn(inv.contractDate) : dn(inv.deliveryDate);
    if (!sup || !sup.udyamDate) add("MT-LEG-009", "REVIEW");
    else if (reg === null) add("MT-DAT-002", "REVIEW");
    else if (contract !== null && reg > contract) add("MT-LEG-010", "NOT");
    if (sup && sup.activity === "trading") add("MT-LEG-011", "REVIEW");
    if (level === "NOT" ) level = "NOT_ELIGIBLE";
    return { level: level, issues: issues };
  }

  /* ---------- Section 43B(h) evaluation ---------- */
  var FIRST_FY_43BH = 2023; // FY 2023-24 (AY 2024-25) - Finance Act 2023, effective 1 April 2024
  function lawForFY(fy) { return fy >= 2026 ? "Income-tax Act, 2025 - section 37(2)(g)" : "Income-tax Act, 1961 - section 43B(h)"; }

  function eval43BH(inv, sup, opts) {
    opts = Object.assign({ traders: "exclude", base: "taxable" }, opts || {});
    var r = { errors: [], warnings: [], coverage: "UNDETERMINED", reasons: [] };
    var terms = resolveTerms(inv);
    r.errors = terms.errors.slice(); r.warnings = terms.warnings.slice();
    if (terms.errors.length) return r;
    var expDate = inv.expenseDate || inv.invoiceDate;
    var ed = dn(expDate);
    if (ed === null) { r.errors.push({ code: "MT-DAT-006", field: "expenseDate" }); return r; }
    r.expenseDate = expDate; r.expenseFY = fyStart(expDate);
    if (r.expenseFY < FIRST_FY_43BH) { r.coverage = "NOT_APPLICABLE"; r.reasons.push({ code: "MT-LEG-012" }); return r; }
    r.law = lawForFY(r.expenseFY);
    if (terms.pendingAcceptance) { r.coverage = "UNDETERMINED"; r.reasons.push({ code: "MT-LEG-006" }); return r; }
    var total = parseInt(inv.totalPaise, 10), taxable = parseInt(inv.taxablePaise, 10);
    if (!(total > 0)) { r.errors.push({ code: "MT-INP-004", field: "totalPaise" }); return r; }
    if (!(taxable > 0) || taxable > total) { if (opts.base === "taxable") { r.errors.push({ code: "MT-INP-008", field: "taxablePaise" }); return r; } taxable = total; }
    r.dueDate = fromDn(terms.dueDn); r.creditDays = terms.creditDays; r.basis = terms.basis;
    // coverage tests
    var cat = sup && sup.category;
    if (!cat || cat === "unknown") { r.coverage = "UNDETERMINED"; r.reasons.push({ code: "MT-LEG-001" }); return r; }
    if (cat === "medium") { r.coverage = "NOT_COVERED"; r.reasons.push({ code: "MT-LEG-013" }); return r; }
    if (!sup.udyamNo) { r.coverage = "UNDETERMINED"; r.reasons.push({ code: "MT-LEG-008" }); return r; }
    var reg = dn(sup.udyamDate);
    if (!sup.udyamDate || reg === null) { r.coverage = "UNDETERMINED"; r.reasons.push({ code: "MT-LEG-009" }); return r; }
    var supplyDn = dn(inv.deliveryDate);
    if (reg > supplyDn) { r.coverage = "NOT_COVERED"; r.reasons.push({ code: "MT-LEG-010" }); return r; }
    var cov = "COVERED";
    if (sup.activity === "trading") {
      if (opts.traders === "exclude") { r.coverage = "NOT_COVERED"; r.reasons.push({ code: "MT-LEG-011" }); return r; }
      cov = "REVIEW"; r.reasons.push({ code: "MT-LEG-011" });
    }
    if (inv.nature === "capital") { cov = cov === "COVERED" ? "REVIEW" : cov; r.reasons.push({ code: "MT-LEG-014" }); }
    r.coverage = cov;
    // payment analysis
    var pays = (inv.payments || []).map(function (p) { return { dn: dn(p.date), paise: parseInt(p.paise, 10), date: p.date }; });
    for (var i = 0; i < pays.length; i++) { if (pays[i].dn === null) { r.errors.push({ code: "MT-DAT-005", field: "payments" }); r.coverage = "UNDETERMINED"; return r; } }
    pays.sort(function (a, b) { return a.dn - b.dn; });
    var within = 0, after = [], remaining = total;
    pays.forEach(function (p) {
      var amt = Math.min(p.paise, remaining); remaining -= amt;
      if (p.dn <= terms.dueDn) within += amt; else if (amt > 0) after.push({ date: p.date, paise: amt, fy: fyStart(p.date) });
    });
    var beyond = total - within;
    // proportional base
    var baseAmt = opts.base === "total" ? total : taxable;
    var disallowed = Number(roundDiv(BigInt(baseAmt) * BigInt(beyond), BigInt(total)));
    var allowedLater = {};
    var assigned = 0;
    after.forEach(function (a, idx) {
      var part = Number(roundDiv(BigInt(baseAmt) * BigInt(a.paise), BigInt(total)));
      if (assigned + part > disallowed) part = disallowed - assigned;
      assigned += part; allowedLater[a.fy] = (allowedLater[a.fy] || 0) + part;
    });
    r.totals = { invoiceTotal: total, baseAmount: baseAmt, paidWithinLimit: within, beyondLimit: beyond, disallowedInExpenseFY: disallowed, allowedOnPayment: allowedLater, stillDisallowedPending: disallowed - assigned };
    r.dueDateFY = fyStart(fromDn(terms.dueDn));
    if (beyond > 0 && !after.length) r.warnings.push({ code: "MT-LEG-015" });
    return r;
  }

  /* ---------- Validation of an invoice record ---------- */
  function validateInvoice(inv) {
    var e = [];
    function chk(cond, code, field) { if (!cond) e.push({ code: code, field: field }); }
    chk(inv.partyName && inv.partyName.trim().length >= 2, "MT-INP-001", "partyName");
    chk(inv.invoiceNo && String(inv.invoiceNo).trim().length > 0, "MT-INP-002", "invoiceNo");
    chk(dn(inv.invoiceDate) !== null, "MT-DAT-007", "invoiceDate");
    chk(dn(inv.deliveryDate) !== null, "MT-DAT-001", "deliveryDate");
    if (inv.contractDate) chk(dn(inv.contractDate) !== null, "MT-DAT-002", "contractDate");
    chk(parseInt(inv.totalPaise, 10) > 0, "MT-INP-004", "totalPaise");
    if (inv.taxablePaise !== undefined && inv.taxablePaise !== "" && inv.taxablePaise !== null) chk(parseInt(inv.taxablePaise, 10) > 0 && parseInt(inv.taxablePaise, 10) <= parseInt(inv.totalPaise, 10), "MT-INP-008", "taxablePaise");
    if (inv.agreement) chk(parseInt(inv.creditDays, 10) >= 0, "MT-INP-006", "creditDays");
    if (dn(inv.invoiceDate) !== null && dn(inv.deliveryDate) !== null && dn(inv.deliveryDate) < dn(inv.invoiceDate) - 365) e.push({ code: "MT-DAT-008", field: "deliveryDate", warn: true });
    (inv.payments || []).forEach(function (p) {
      chk(dn(p.date) !== null, "MT-DAT-005", "payments");
      chk(parseInt(p.paise, 10) > 0, "MT-INP-005", "payments");
    });
    return e;
  }
  function dupKey(inv) {
    return [inv.companyId, String(inv.partyName || "").trim().toLowerCase(), String(inv.invoiceNo || "").trim().toLowerCase(), inv.invoiceDate].join("|");
  }

  /* ---------- Classification helper (informational) ---------- */
  var CLASS_LIMITS = [
    { id: "C2020", from: "2020-07-01", to: "2025-03-31", micro: [100000000, 500000000], small: [1000000000, 5000000000], medium: [5000000000, 25000000000], src: "S.O. 2119(E) dated 26-06-2020 (Ministry of MSME)" },
    { id: "C2025", from: "2025-04-01", to: null, micro: [250000000, 1000000000], small: [2500000000, 10000000000], medium: [12500000000, 50000000000], src: "S.O. 1364(E) dated 21-03-2025 (Ministry of MSME)" }
  ]; // [investment, turnover] in rupees*100? (values are in rupees: 1 crore = 10000000) -> stored as rupees below
  function classify(invRupees, turnRupees, onISO) {
    var set = null;
    for (var i = 0; i < CLASS_LIMITS.length; i++) { var s = CLASS_LIMITS[i]; if (s.from <= onISO && (!s.to || onISO <= s.to)) set = s; }
    if (!set) return { error: "MT-LEG-016" };
    var lim = {};
    ["micro", "small", "medium"].forEach(function (k) { lim[k] = [set[k][0] / 10, set[k][1] / 10]; });
    var cat = "large";
    if (invRupees <= lim.micro[0] && turnRupees <= lim.micro[1]) cat = "micro";
    else if (invRupees <= lim.small[0] && turnRupees <= lim.small[1]) cat = "small";
    else if (invRupees <= lim.medium[0] && turnRupees <= lim.medium[1]) cat = "medium";
    return { category: cat, set: set.id, source: set.src, limits: lim };
  }

  /* ---------- checksum (FNV-1a 32 bit, hex) for backup integrity ---------- */
  function checksum(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return ("00000000" + h.toString(16)).slice(-8);
  }

  return {
    VERSION: VERSION, VERIFIED_ON: VERIFIED_ON, RATES: RATES, RATE_VERIFIED_THROUGH: RATE_VERIFIED_THROUGH, ACT_START: ACT_START,
    parseISO: parseISO, dn: dn, fromDn: fromDn, addDays: addDays, isLeap: isLeap, daysInMonth: daysInMonth, endOfMonthDn: endOfMonthDn, addMonthsDn: addMonthsDn,
    fmtDMY: fmtDMY, fyStart: fyStart, fyLabel: fyLabel, parseRupees: parseRupees, fmtINR: fmtINR, fmtPct: fmtPct, MAX_PAISE: MAX_PAISE,
    sortedRates: sortedRates, rateOn: rateOn, resolveTerms: resolveTerms, calcInterest: calcInterest, DEFAULTS: DEFAULTS,
    sectionEligibility: sectionEligibility, eval43BH: eval43BH, lawForFY: lawForFY, FIRST_FY_43BH: FIRST_FY_43BH,
    validateInvoice: validateInvoice, dupKey: dupKey, classify: classify, CLASS_LIMITS: CLASS_LIMITS, checksum: checksum
  };
});
