/*! MSME Tools - Interest Calculator */
(function () {
  "use strict";
  var MT = window.MT, E = window.MSME, h = MT.h, inr = function (p) { return E.fmtINR(p); };
  var asOf = MT.today();

  function tabInterest(main) {
    var c = MT.company();
    var results = MT.runAll(asOf);
    var t = { prin: 0, intr: 0, paidI: 0, n: 0, late: 0 }, prov = false;
    results.forEach(function (x) {
      if (x.r.ok && x.r.totals) { t.prin += x.r.totals.principalOutstanding; t.intr += x.r.totals.interestOutstanding; t.paidI += x.r.totals.interestPaid; t.n++; if (x.r.totals.interestAccrued > 0) t.late++; }
      if (x.r.provisional) prov = true;
    });
    var asIn = h("input", { type: "date", value: asOf, "aria-label": "Interest up to", onchange: function (e) { if (!E.parseISO(e.target.value)) { MT.toast("Choose a valid calculation date.", "error", "MT-DAT-004"); return; } asOf = e.target.value; MT.render(); } });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Interest under section 16, MSMED Act" }),
      h("div", { class: "toolbar wrap" }, h("label", { for: "asof", text: "Interest up to (date): " }), asIn,
        h("span", { class: "grow" }),
        h("button", { class: "btn primary", type: "button", onclick: function () { report(false); } }, "Print / PDF report"),
        h("button", { class: "btn", type: "button", onclick: function () { report(true); } }, "Download report (HTML)"),
        h("button", { class: "btn", type: "button", onclick: csv }, "Results as CSV")),
      prov ? h("div", { class: "banner warn" }, "PROVISIONAL result: ", MT.errChip("MT-RAT-002"), " The calculation date is after the verified RBI Bank Rate table, or an unverified rate is used.") : null,
      h("div", { class: "grid3" },
        stat("Invoices calculated", t.n + " (" + t.late + " with interest)"),
        stat("Principal outstanding ₹", inr(t.prin)), stat("Interest outstanding ₹", inr(t.intr), "warn"), stat("Total outstanding ₹", inr(t.prin + t.intr), "err"), stat("Interest already paid ₹", inr(t.paidI))),
      MT.table([{ label: c.role === "buyer" ? "Supplier" : "Buyer" }, { label: "Invoice" }, { label: "Last day to pay" }, { label: "Days late", n: true }, { label: "Principal due ₹", n: true }, { label: "Interest due ₹", n: true }, { label: "Total due ₹", n: true }, { label: "Status" }, { label: "" }],
        results.map(function (x) {
          if (!x.r.ok) return h("tr", null, h("td", { text: x.party }), h("td", { text: x.inv.invoiceNo }), h("td", { colspan: 6 }, x.r.errors.map(function (e) { return [MT.errChip(e.code), " " + MT.err(e.code).title + " "]; })), h("td", null, h("button", { class: "btn small", type: "button", onclick: function () { MT.invoiceForm(x.inv); } }, "Fix")));
          var tt = x.r.totals;
          var elig = E.sectionEligibility(MT.compose(x.inv), MT.supplierOf(x.inv));
          var pill = x.r.pending ? h("span", { class: "pill info" }, "Acceptance pending") : elig.level === "NOT_ELIGIBLE" ? h("span", { class: "pill err" }, "Not eligible") : elig.level === "REVIEW" ? h("span", { class: "pill warn" }, "Review") : tt.totalOutstanding === 0 ? h("span", { class: "pill ok" }, "Settled") : tt.interestAccrued > 0 ? h("span", { class: "pill warn" }, "Interest running") : h("span", { class: "pill ok" }, "In time");
          return h("tr", { class: "click", tabindex: "0", onclick: function () { detail(x); }, onkeydown: function (e) { if (e.key === "Enter") detail(x); } },
            h("td", { text: x.party }), h("td", { text: x.inv.invoiceNo }), h("td", { text: E.fmtDMY(x.r.dueDate) }), h("td", { class: "n", text: tt.delayDays }), h("td", { class: "n", text: inr(tt.principalOutstanding) }), h("td", { class: "n", text: inr(tt.interestOutstanding) }), h("td", { class: "n", text: inr(tt.totalOutstanding) }), h("td", null, pill, elig.issues.map(function (i) { return [" ", MT.errChip(i.code)]; })), h("td", null, "›"));
        }), { empty: "No invoices yet. Add them in the Invoices tab." }),
      h("p", { class: "muted", text: "Click a row to see the day-by-day ledger. Conventions (rate basis, monthly rests, appropriation) are in Settings." })));
  }
  function stat(k, v, cls) { return h("div", { class: "stat " + (cls || "") }, h("div", { class: "k", text: k }), h("div", { class: "v", text: v })); }
  function detail(x) {
    var body = h("div", { html: MT.ledgerHTML(x.inv, x.r).replace(/<table>/, "<table class=\"grid\">") });
    var info = h("p", { class: "muted", text: "Acceptance " + E.fmtDMY(x.r.acceptanceDate) + " · " + x.r.basis + " · last day to pay " + E.fmtDMY(x.r.dueDate) + " · interest from " + E.fmtDMY(x.r.interestStartDate) });
    var w = x.r.warnings.map(function (e) { return [MT.errChip(e.code), " "]; });
    MT.modal("Ledger - " + x.party + " / " + x.inv.invoiceNo, h("div", null, info, h("p", null, w), h("div", { class: "tablewrap" }, body)), [{ label: "Edit invoice", onclick: function () { setTimeout(function () { MT.invoiceForm(x.inv); }, 0); } }, { label: "Close", cls: "primary" }], { wide: true });
  }
  function report(download) {
    var res = MT.runAll(asOf).filter(function (x) { return x.r.ok || x.r.errors.length; });
    if (!res.length) { MT.toast("Nothing to report.", "warn", "MT-RPT-002"); return; }
    try {
      var html = MT.interestReportHTML(res, asOf, "Delayed payment interest statement");
      if (download) MT.downloadReport("Interest-statement-" + asOf + ".html", html); else MT.openReport("Interest statement", html);
    } catch (e) { console.error(e); MT.toast("The report could not be generated.", "error", "MT-RPT-003"); }
  }
  function csv() {
    var res = MT.runAll(asOf).filter(function (x) { return x.r.ok; });
    if (!res.length) { MT.toast("Nothing to export.", "warn", "MT-RPT-002"); return; }
    var q = function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var head = ["Party", "Invoice", "Delivery", "LastDayToPay", "InterestFrom", "InvoiceRs", "PaidRs", "PrincipalDueRs", "InterestPaidRs", "InterestDueRs", "TotalDueRs"];
    var lines = [head.join(",")].concat(res.map(function (x) { var t = x.r.totals; return [x.party, x.inv.invoiceNo, x.inv.deliveryDate, x.r.dueDate, x.r.interestStartDate, inr(t.invoiceTotal).replace(/,/g, ""), inr(t.paidTotal).replace(/,/g, ""), inr(t.principalOutstanding).replace(/,/g, ""), inr(t.interestPaid).replace(/,/g, ""), inr(t.interestOutstanding).replace(/,/g, ""), inr(t.totalOutstanding).replace(/,/g, "")].map(q).join(","); }));
    MT.download("interest-results-" + asOf + ".csv", "text/csv;charset=utf-8", "﻿" + lines.join("\r\n"));
  }

  MT.start({
    appId: "interest-calculator", appName: "Delayed Payment Interest Calculator", version: E.VERSION, defaultRole: "supplier",
    tabs: [
      { id: "invoices", label: "Invoices", render: function (m) { MT.tabInvoices(m); } },
      { id: "parties", label: "Parties", render: MT.tabParties },
      { id: "interest", label: "Interest", render: tabInterest },
      { id: "rates", label: "Rate Master", render: MT.tabRates },
      { id: "settings", label: "Settings", render: MT.tabSettings(["rateBasis", "restBasis", "appropriation"]) },
      { id: "backup", label: "Backup", render: MT.tabBackup },
      { id: "help", label: "Help", render: MT.tabHelp }
    ]
  });
})();
