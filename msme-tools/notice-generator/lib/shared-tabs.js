/*! MSME Tools shared tabs and report builders v1.0.0 */
(function () {
  "use strict";
  var MT = window.MT, E = window.MSME, D = window.MSMEDATA, h = MT.h, esc = MT.esc;
  var inr = function (p) { return E.fmtINR(p); };
  var today = function () { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  MT.today = today;

  MT.SETTING_DEFS = {
    rateBasis: { label: "Bank Rate applied", options: [["periodwise", "Rate in force on each day (default)"], ["fixed", "Rate in force on the first day of interest"]], help: "Courts may take either view. See rule R-CONV-RATE." },
    restBasis: { label: "Monthly rests fall on", options: [["calendar", "Calendar month-end (default)"], ["anniversary", "Monthly anniversary of the first interest day"]], help: "Rule R-CONV-REST." },
    appropriation: { label: "Part payments go first to", options: [["interest-first", "Interest, then principal (default)"], ["principal-first", "Principal, then interest"]], help: "Rule R-CONV-APPROP." },
    traders: { label: "Suppliers engaged in trading", options: [["exclude", "Treat as NOT covered (default, with warning)"], ["include", "Treat as covered, flagged for review"]], help: "Rule R-CONV-TRADER - position not settled." },
    base43: { label: "Section 43B(h) disallowance computed on", options: [["taxable", "Taxable value, excluding GST (default)"], ["total", "Full invoice value including GST"]], help: "Rule R-CONV-43BH-BASE." },
    noticeDays: { label: "Days allowed in demand notice", text: true, help: "Whole number, 1 to 90 (default 15)." }
  };
  MT.tabSettings = function (keys) {
    return function (main) {
      var c = MT.company(), s = MT.settings();
      var form = h("div", { class: "form" }, h("div", { class: "fld wide" }, h("div", { class: "ferr", id: "e_formtop" })));
      keys.forEach(function (k) {
        var d = MT.SETTING_DEFS[k];
        form.appendChild(MT.field({ key: k, label: d.label, type: d.text ? "text" : "select", options: d.options, help: d.help }, s[k]));
      });
      main.appendChild(h("div", { class: "card" }, h("h2", { text: "Calculation settings for " + c.name }),
        h("p", { class: "muted", text: "The law does not fix these points. Choose deliberately and keep the choice with your records; every report prints the settings used." }), form,
        h("button", { class: "btn primary", type: "button", onclick: function () {
          var v = MT.readForm(form, keys.map(function (k) { return { key: k }; }));
          if (keys.indexOf("noticeDays") >= 0 && !/^\d{1,2}$/.test(v.noticeDays) || (v.noticeDays && (+v.noticeDays < 1 || +v.noticeDays > 90))) { MT.showErrors(form, [{ code: "MT-INP-010", field: "noticeDays" }]); return; }
          var o = Object.assign({}, c, { settings: Object.assign({}, c.settings, v) });
          MT.put("companies", o); MT.render(); MT.toast("Settings saved.", "ok");
        } }, "Save settings"),
        h("p", { class: "muted" }, "Rule references: ", h("button", { class: "link", style: "color:var(--teal)", type: "button", onclick: function () { MT.openDoc("sources"); } }, "Legal source and rule register"))));
    };
  };

  /* ---------- report fragments ---------- */
  MT.settingsBlock = function () {
    var s = MT.settings(), name = function (k) { var d = MT.SETTING_DEFS[k]; var o = d.options.find(function (x) { return x[0] === s[k]; }); return o ? o[1] : s[k]; };
    return "<h2>Conventions used</h2><ul><li>Bank Rate applied: " + esc(name("rateBasis")) + "</li><li>Monthly rests: " + esc(name("restBasis")) + "</li><li>Part payments: " + esc(name("appropriation")) + "</li><li>Day count: Actual/365, from the day after the last day for payment up to and including the date of payment or calculation date.</li><li>Interest rate: three times the RBI Bank Rate (s.16 MSMED Act, 2006); Bank Rate table verified up to " + E.fmtDMY(E.RATE_VERIFIED_THROUGH) + ".</li></ul>";
  };
  MT.warnList = function (arr) {
    var seen = {}, out = [];
    arr.forEach(function (w) { if (!seen[w.code]) { seen[w.code] = 1; var e = MT.err(w.code); out.push("<li><strong>" + w.code + "</strong> " + esc(e.title) + " - " + esc(e.explanation) + "</li>"); } });
    return out.length ? "<div class=\"warn\"><strong>Notes and warnings</strong><ul>" + out.join("") + "</ul></div>" : "";
  };
  MT.ledgerHTML = function (inv, r) {
    if (!r.rows.length) return "<p>No interest has accrued.</p>";
    return "<table><thead><tr><th>Date</th><th>Event</th><th class=\"n\">Days</th><th class=\"n\">Rate p.a.</th><th class=\"n\">Interest-bearing ₹</th><th class=\"n\">Interest for period ₹</th><th class=\"n\">Payment ₹</th><th class=\"n\">To interest ₹</th><th class=\"n\">To principal ₹</th><th class=\"n\">Principal balance ₹</th><th class=\"n\">Interest balance ₹</th></tr></thead><tbody>" +
      r.rows.map(function (x) { return "<tr><td>" + E.fmtDMY(x.date) + "</td><td>" + esc(x.event) + (x.note ? " (" + esc(x.note) + ")" : "") + "</td><td class=\"n\">" + x.days + "</td><td class=\"n\">" + (x.rate ? E.fmtPct(x.rate) : "-") + "</td><td class=\"n\">" + inr(x.base) + "</td><td class=\"n\">" + inr(x.interest) + "</td><td class=\"n\">" + (x.payment ? inr(x.payment) : "") + "</td><td class=\"n\">" + (x.toInterest ? inr(x.toInterest) : "") + "</td><td class=\"n\">" + (x.toPrincipal ? inr(x.toPrincipal) : "") + "</td><td class=\"n\">" + inr(x.principal) + "</td><td class=\"n\">" + inr(x.interestBal) + "</td></tr>"; }).join("") + "</tbody></table>";
  };
  /* results: array of {inv, party, r} */
  MT.interestReportHTML = function (results, asOf, title) {
    var c = MT.company(), tot = { due: 0, interest: 0, prin: 0, paidI: 0 }, allWarn = [], prov = false;
    results.forEach(function (x) { if (x.r.ok && x.r.totals) { tot.prin += x.r.totals.principalOutstanding; tot.interest += x.r.totals.interestOutstanding; tot.paidI += x.r.totals.interestPaid; } allWarn = allWarn.concat(x.r.warnings || []); if (x.r.provisional) prov = true; });
    var body = "<h1>" + esc(title || "Delayed payment interest statement") + "</h1><p class=\"meta\">" + esc(c.name) + " · Interest calculated up to <strong>" + E.fmtDMY(asOf) + "</strong> · Section 16, MSMED Act, 2006</p>";
    if (prov) body += "<div class=\"prov\">PROVISIONAL - a Bank Rate after the verified table (" + E.fmtDMY(E.RATE_VERIFIED_THROUGH) + ") or an unverified rate was used. Verify with the RBI before relying on this statement.</div>";
    body += "<h2>Summary</h2><table><thead><tr><th>" + (c.role === "buyer" ? "Supplier" : "Buyer") + "</th><th>Invoice</th><th>Delivery</th><th>Last day to pay</th><th class=\"n\">Invoice ₹</th><th class=\"n\">Paid ₹</th><th class=\"n\">Principal due ₹</th><th class=\"n\">Interest paid ₹</th><th class=\"n\">Interest due ₹</th><th class=\"n\">Total due ₹</th></tr></thead><tbody>" +
      results.map(function (x) {
        if (!x.r.ok) return "<tr><td>" + esc(x.party) + "</td><td>" + esc(x.inv.invoiceNo) + "</td><td colspan=\"8\">Not calculated: " + x.r.errors.map(function (e) { return e.code + " " + esc(MT.err(e.code).title); }).join("; ") + "</td></tr>";
        var t = x.r.totals;
        return "<tr><td>" + esc(x.party) + "</td><td>" + esc(x.inv.invoiceNo) + "</td><td>" + E.fmtDMY(x.inv.deliveryDate) + "</td><td>" + E.fmtDMY(x.r.dueDate) + "</td><td class=\"n\">" + inr(t.invoiceTotal) + "</td><td class=\"n\">" + inr(t.paidTotal) + "</td><td class=\"n\">" + inr(t.principalOutstanding) + "</td><td class=\"n\">" + inr(t.interestPaid) + "</td><td class=\"n\">" + inr(t.interestOutstanding) + "</td><td class=\"n\">" + inr(t.totalOutstanding) + "</td></tr>";
      }).join("") + "<tr><th colspan=\"6\">Total</th><th class=\"n\">" + inr(tot.prin) + "</th><th class=\"n\">" + inr(tot.paidI) + "</th><th class=\"n\">" + inr(tot.interest) + "</th><th class=\"n\">" + inr(tot.prin + tot.interest) + "</th></tr></tbody></table>";
    body += MT.warnList(allWarn) + MT.settingsBlock();
    body += "<p class=\"meta\">Section 23: interest payable or paid under the Act is not deductible by the buyer in computing income under the Income-tax Act (rule R-MSMED-23). For buyers whose accounts are audited, section 22 requires disclosure of unpaid principal and interest; the figures above are the inputs.</p>";
    results.forEach(function (x) { if (x.r.ok) body += "<div class=\"pagebreak\"></div><h2>Ledger - " + esc(x.party) + ", invoice " + esc(x.inv.invoiceNo) + "</h2><p class=\"meta\">Acceptance " + E.fmtDMY(x.r.acceptanceDate) + " · " + esc(x.r.basis) + " · last day to pay " + E.fmtDMY(x.r.dueDate) + " · interest from " + E.fmtDMY(x.r.interestStartDate) + "</p>" + MT.ledgerHTML(x.inv, x.r); });
    return MT.reportDoc("Interest statement - " + c.name, body);
  };
  MT.runAll = function (asOf, filterFn) {
    return MT.invoicesOf().filter(filterFn || function () { return true; }).map(function (i) {
      var p = MT.state.parties.get(i.partyId);
      return { inv: i, party: p ? p.name : "?", r: MT.calc(i, asOf) };
    });
  };
})();
