/*! MSME Tools - Section 43B(h) Applicability Checker */
(function () {
  "use strict";
  var MT = window.MT, E = window.MSME, h = MT.h, inr = function (p) { return E.fmtINR(p); };
  var fy = (function () { var d = new Date(); return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1; })();
  var COV = { COVERED: ["ok", "Covered"], REVIEW: ["warn", "Review"], NOT_COVERED: ["info", "Not covered"], UNDETERMINED: ["err", "Cannot decide"], NOT_APPLICABLE: ["info", "Before FY 2023-24"] };

  function analyse() {
    var s = MT.settings(), opts = { traders: s.traders, base: s.base43 };
    return MT.invoicesOf().map(function (i) {
      var p = MT.state.parties.get(i.partyId), sup = MT.supplierOf(i);
      return { inv: i, party: p ? p.name : "?", ev: E.eval43BH(MT.compose(i), sup, opts), sup: sup };
    });
  }
  function figures(rows, year) {
    var f = { confirmed: { dis: 0, sameFY: 0, add: 0, earlier: 0, base: 0 }, review: { dis: 0, sameFY: 0, add: 0, earlier: 0, base: 0 }, counts: { COVERED: 0, REVIEW: 0, NOT_COVERED: 0, UNDETERMINED: 0, NOT_APPLICABLE: 0 } };
    rows.forEach(function (x) {
      var ev = x.ev; if (ev.errors.length) { x.err = true; return; }
      f.counts[ev.coverage] = (f.counts[ev.coverage] || 0) + 1;
      if (ev.coverage !== "COVERED" && ev.coverage !== "REVIEW") return;
      var bucket = ev.coverage === "COVERED" ? f.confirmed : f.review, t = ev.totals;
      if (ev.expenseFY === year) {
        var same = t.allowedOnPayment[year] || 0;
        bucket.dis += t.disallowedInExpenseFY; bucket.sameFY += same; bucket.add += t.disallowedInExpenseFY - same; bucket.base += t.baseAmount;
      } else if (ev.expenseFY < year) bucket.earlier += t.allowedOnPayment[year] || 0;
    });
    return f;
  }
  function stat(k, v, cls) { return h("div", { class: "stat " + (cls || "") }, h("div", { class: "k", text: k }), h("div", { class: "v", text: v })); }

  function tabCheck(main) {
    var rows = analyse(), f = figures(rows, fy);
    var years = []; for (var y = E.FIRST_FY_43BH; y <= Math.max(fy, new Date().getFullYear()); y++) years.push(y);
    var sel = h("select", { "aria-label": "Financial year", onchange: function (e) { fy = +e.target.value; MT.render(); } }, years.map(function (y) { return h("option", { value: y, selected: y === fy }, "FY " + E.fyLabel(y)); }));
    var shown = rows.filter(function (x) { return x.ev.errors.length || x.ev.expenseFY === fy || (x.ev.totals && x.ev.totals.allowedOnPayment[fy]); });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Section 43B(h) check - " + MT.company().name }),
      h("div", { class: "toolbar wrap" }, h("label", { text: "Financial year: " }), sel, h("span", { class: "pill info" }, E.lawForFY(fy)), h("span", { class: "grow" }),
        h("button", { class: "btn primary", type: "button", onclick: function () { report(false, rows); } }, "Print / PDF report"),
        h("button", { class: "btn", type: "button", onclick: function () { report(true, rows); } }, "Download report (HTML)"),
        h("button", { class: "btn", type: "button", onclick: function () { csv(shown); } }, "Results as CSV")),
      fy >= 2026 ? h("div", { class: "banner warn" }, "Financial year 2026-27 onwards falls under the Income-tax Act, 2025. The corresponding provision is stated as section 37(2)(g); confirm the section on the official text.") : null,
      h("div", { class: "grid3" },
        stat("Disallowance in this FY (confirmed) ₹", inr(f.confirmed.add), "err"),
        stat("Deduction in this FY for earlier years' payables ₹", inr(f.confirmed.earlier)),
        stat("Possible additional (review items) ₹", inr(f.review.add), "warn"),
        stat("Cannot decide (missing data)", String(f.counts.UNDETERMINED || 0), (f.counts.UNDETERMINED ? "warn" : ""))),
      MT.table([{ label: "Supplier" }, { label: "Invoice" }, { label: "Expense date" }, { label: "Coverage" }, { label: "Last day to pay" }, { label: "Paid in time ₹", n: true }, { label: "Beyond limit ₹", n: true }, { label: "Disallowed in FY ₹", n: true }, { label: "Allowed on payment ₹", n: true }],
        shown.map(function (x) {
          var ev = x.ev;
          if (ev.errors.length) return h("tr", { class: "click", onclick: function () { MT.invoiceForm(x.inv); } }, h("td", { text: x.party }), h("td", { text: x.inv.invoiceNo }), h("td", { colspan: 7 }, ev.errors.map(function (e) { return [MT.errChip(e.code), " " + MT.err(e.code).title + " "]; })));
          var cv = COV[ev.coverage], t = ev.totals;
          var inFY = ev.expenseFY === fy;
          return h("tr", { class: "click", tabindex: "0", onclick: function () { detail(x); }, onkeydown: function (e) { if (e.key === "Enter") detail(x); } },
            h("td", { text: x.party }), h("td", { text: x.inv.invoiceNo }), h("td", { text: E.fmtDMY(ev.expenseDate) }),
            h("td", null, h("span", { class: "pill " + cv[0] }, cv[1]), ev.reasons.map(function (r) { return [" ", MT.errChip(r.code)]; })),
            h("td", { text: ev.dueDate ? E.fmtDMY(ev.dueDate) : "—" }),
            h("td", { class: "n", text: t ? inr(t.paidWithinLimit) : "—" }), h("td", { class: "n", text: t ? inr(t.beyondLimit) : "—" }),
            h("td", { class: "n", text: t && inFY ? inr(t.disallowedInExpenseFY) : "—" }), h("td", { class: "n", text: t ? inr(t.allowedOnPayment[fy] || 0) : "—" }));
        }), { empty: "No invoices for this financial year." }),
      h("p", { class: "muted", text: "Disallowed in FY = payable beyond the section 15 time limit, deductible only when actually paid. 'Allowed on payment' = deduction becoming available in this FY because the payment was made in this FY. Click a row for the working." })));
    classifier(main);
  }
  function detail(x) {
    var ev = x.ev, t = ev.totals;
    var dl = h("dl", { class: "kv" });
    function kv(k, v) { dl.appendChild(h("dt", { text: k })); dl.appendChild(h("dd", { text: v })); }
    kv("Law", ev.law || "—"); kv("Coverage", COV[ev.coverage][1]); kv("Time limit", ev.basis || "—"); kv("Last day to pay", ev.dueDate ? E.fmtDMY(ev.dueDate) : "—");
    if (t) {
      kv("Invoice total", "₹" + inr(t.invoiceTotal)); kv("Base for disallowance", "₹" + inr(t.baseAmount)); kv("Paid on or before last day", "₹" + inr(t.paidWithinLimit)); kv("Payable beyond limit", "₹" + inr(t.beyondLimit));
      kv("Disallowed in FY " + E.fyLabel(ev.expenseFY), "₹" + inr(t.disallowedInExpenseFY));
      Object.keys(t.allowedOnPayment).forEach(function (k) { kv("Allowed on payment in FY " + E.fyLabel(+k), "₹" + inr(t.allowedOnPayment[k])); });
      kv("Still unpaid beyond limit (disallowed)", "₹" + inr(t.stillDisallowedPending));
    }
    MT.modal("Working - " + x.party + " / " + x.inv.invoiceNo, h("div", null, dl, h("p", null, ev.reasons.concat(ev.warnings).map(function (r) { return [MT.errChip(r.code), " " + MT.err(r.code).title + ". "]; }))), [{ label: "Edit invoice", onclick: function () { setTimeout(function () { MT.invoiceForm(x.inv); }, 0); } }, { label: "Close", cls: "primary" }], { wide: true });
  }
  function classifier(main) {
    var inv = h("input", { type: "text", inputmode: "decimal", placeholder: "Investment in plant & machinery, ₹ crore" }),
      tr = h("input", { type: "text", inputmode: "decimal", placeholder: "Turnover, ₹ crore" }), on = h("input", { type: "date", value: MT.today() }), out = h("p", { class: "muted" });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Classification helper (information only)" }),
      h("p", { class: "muted", text: "The Udyam certificate decides the category. This helper applies the limits of S.O. 2119(E) (from 1 July 2020) and S.O. 1364(E) (from 1 April 2025)." }),
      h("div", { class: "form" }, inv, tr, on),
      h("button", { class: "btn", type: "button", style: "margin-top:8px", onclick: function () {
        var a = parseFloat(inv.value), b = parseFloat(tr.value);
        if (!(a >= 0) || !(b >= 0) || !E.parseISO(on.value)) { out.textContent = "Enter investment and turnover in crore (for example 1.5) and a valid date."; return; }
        var r = E.classify(a * 10000000, b * 10000000, on.value);
        out.textContent = r.error ? MT.err(r.error).code + " - " + MT.err(r.error).title : "Category: " + r.category.toUpperCase() + " (limits applied: " + r.source + ").";
      } }, "Classify"), out));
  }
  function build(rows) {
    var c = MT.company(), f = figures(rows, fy), s = MT.settings();
    var body = "<h1>Section 43B(h) review - FY " + E.fyLabel(fy) + "</h1><p class=\"meta\">" + MT.esc(c.name) + " · " + MT.esc(E.lawForFY(fy)) + "</p>";
    body += "<h2>Summary</h2><table><tbody><tr><td>Disallowance for FY " + E.fyLabel(fy) + " (confirmed items)</td><td class=\"n\">₹ " + inr(f.confirmed.add) + "</td></tr><tr><td>of which paid later in the same FY (already allowed)</td><td class=\"n\">₹ " + inr(f.confirmed.sameFY) + "</td></tr><tr><td>Deduction in FY " + E.fyLabel(fy) + " for earlier years' disallowed payables paid this year</td><td class=\"n\">₹ " + inr(f.confirmed.earlier) + "</td></tr><tr><td>Possible additional disallowance - items marked Review</td><td class=\"n\">₹ " + inr(f.review.add) + "</td></tr><tr><td>Invoices that cannot be decided (data missing)</td><td class=\"n\">" + (f.counts.UNDETERMINED || 0) + "</td></tr></tbody></table>";
    body += "<h2>Invoice-wise</h2><table><thead><tr><th>Supplier</th><th>Invoice</th><th>Expense date</th><th>Coverage</th><th>Last day to pay</th><th class=\"n\">Paid in time ₹</th><th class=\"n\">Beyond limit ₹</th><th class=\"n\">Disallowed in FY ₹</th><th class=\"n\">Allowed on payment in FY ₹</th><th>Notes</th></tr></thead><tbody>";
    rows.forEach(function (x) {
      var ev = x.ev;
      if (ev.errors.length) { body += "<tr><td>" + MT.esc(x.party) + "</td><td>" + MT.esc(x.inv.invoiceNo) + "</td><td colspan=\"8\">Not evaluated: " + ev.errors.map(function (e) { return e.code + " " + MT.esc(MT.err(e.code).title); }).join("; ") + "</td></tr>"; return; }
      if (!(ev.expenseFY === fy || (ev.totals && ev.totals.allowedOnPayment[fy]))) return;
      var t = ev.totals;
      body += "<tr><td>" + MT.esc(x.party) + "</td><td>" + MT.esc(x.inv.invoiceNo) + "</td><td>" + E.fmtDMY(ev.expenseDate) + "</td><td>" + COV[ev.coverage][1] + "</td><td>" + (ev.dueDate ? E.fmtDMY(ev.dueDate) : "-") + "</td><td class=\"n\">" + (t ? inr(t.paidWithinLimit) : "-") + "</td><td class=\"n\">" + (t ? inr(t.beyondLimit) : "-") + "</td><td class=\"n\">" + (t && ev.expenseFY === fy ? inr(t.disallowedInExpenseFY) : "-") + "</td><td class=\"n\">" + (t ? inr(t.allowedOnPayment[fy] || 0) : "-") + "</td><td>" + ev.reasons.concat(ev.warnings).map(function (r) { return r.code; }).join(", ") + "</td></tr>";
    });
    body += "</tbody></table>";
    var all = []; rows.forEach(function (x) { all = all.concat(x.ev.reasons || [], x.ev.warnings || []); });
    body += MT.warnList(all);
    body += "<h2>Conventions used</h2><ul><li>Time limit: s.15 MSMED Act - agreed period in writing (max 45 days) or 15 days, counted from the day of acceptance or deemed acceptance.</li><li>Disallowance computed on " + (s.base43 === "total" ? "full invoice value including GST" : "taxable value excluding GST") + ".</li><li>Suppliers engaged in trading: " + (s.traders === "exclude" ? "treated as not covered (position not settled)" : "treated as covered but flagged for review") + ".</li><li>Supplier must be registered (Udyam) on or before the supply date; medium enterprises are outside s.43B(h).</li><li>Rules R-ITA-43BH, R-ITA25-37-2-g and conventions are listed in the Legal source and rule register.</li></ul>";
    return MT.reportDoc("Section 43B(h) review", body);
  }
  function report(download, rows) {
    if (!rows.length) { MT.toast("Nothing to report.", "warn", "MT-RPT-002"); return; }
    try { var html = build(rows); if (download) MT.downloadReport("Section-43BH-review-FY" + E.fyLabel(fy) + ".html", html); else MT.openReport("43B(h) review", html); }
    catch (e) { console.error(e); MT.toast("The report could not be generated.", "error", "MT-RPT-003"); }
  }
  function csv(rows) {
    var ok = rows.filter(function (x) { return !x.ev.errors.length; });
    if (!ok.length) { MT.toast("Nothing to export.", "warn", "MT-RPT-002"); return; }
    var q = function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var lines = [["Supplier", "Invoice", "ExpenseDate", "Coverage", "LastDayToPay", "PaidInTimeRs", "BeyondLimitRs", "DisallowedInExpenseFYRs", "AllowedOnPaymentInSelectedFYRs"].join(",")].concat(ok.map(function (x) { var ev = x.ev, t = ev.totals; return [x.party, x.inv.invoiceNo, ev.expenseDate, ev.coverage, ev.dueDate || "", t ? inr(t.paidWithinLimit).replace(/,/g, "") : "", t ? inr(t.beyondLimit).replace(/,/g, "") : "", t && ev.expenseFY === fy ? inr(t.disallowedInExpenseFY).replace(/,/g, "") : "", t ? inr(t.allowedOnPayment[fy] || 0).replace(/,/g, "") : ""].map(q).join(","); }));
    MT.download("43BH-results-FY" + E.fyLabel(fy) + ".csv", "text/csv;charset=utf-8", "﻿" + lines.join("\r\n"));
  }

  MT.start({
    appId: "section-43bh-checker", appName: "Section 43B(h) Applicability Checker", version: E.VERSION, defaultRole: "buyer",
    tabs: [
      { id: "invoices", label: "Purchases", render: function (m) { MT.tabInvoices(m, {
        cols: [{ label: "43B(h)" }],
        cells: function (i) { var ev = E.eval43BH(MT.compose(i), MT.supplierOf(i), { traders: MT.settings().traders, base: MT.settings().base43 }); var cv = ev.errors.length ? ["err", "Fix data"] : COV[ev.coverage]; return [h("td", null, h("span", { class: "pill " + cv[0] }, cv[1]))]; } }); } },
      { id: "parties", label: "Suppliers", render: MT.tabParties },
      { id: "check", label: "43B(h) Check", render: tabCheck },
      { id: "settings", label: "Settings", render: MT.tabSettings(["traders", "base43"]) },
      { id: "backup", label: "Backup", render: MT.tabBackup },
      { id: "help", label: "Help", render: MT.tabHelp }
    ]
  });
})();
