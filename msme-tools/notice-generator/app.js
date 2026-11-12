/*! MSME Tools - Delayed Payment Notice Generator */
(function () {
  "use strict";
  var MT = window.MT, E = window.MSME, h = MT.h, esc = MT.esc, inr = function (p) { return E.fmtINR(p); };
  var sel = { partyId: "", ids: new Set(), date: MT.today(), days: "" };

  function eligibility(i) { return E.sectionEligibility(MT.compose(i), MT.supplierOf(i)); }
  function noticeNo() {
    var yr = new Date().getFullYear(), n = Array.from(MT.state.notices.values()).filter(function (x) { return x.companyId === MT.state.companyId && String(x.no).indexOf("/" + yr + "/") > 0; }).length + 1;
    return "NTC/" + yr + "/" + String(n).padStart(3, "0");
  }

  function tabNotice(main) {
    var c = MT.company();
    if (c.role !== "supplier") { main.appendChild(h("div", { class: "card" }, h("div", { class: "banner warn" }, "A delayed payment notice is sent by the supplier. This company is set up as a buyer - edit the company and change the role to Supplier."))); return; }
    var parties = MT.partiesOf();
    var days = sel.days || MT.settings().noticeDays;
    var partySel = h("select", { "aria-label": "Buyer", onchange: function (e) { sel.partyId = e.target.value; sel.ids = new Set(); MT.render(); } }, [h("option", { value: "" }, "- select buyer -")].concat(parties.map(function (p) { return h("option", { value: p.id, selected: p.id === sel.partyId }, p.name); })));
    var card = h("div", { class: "card" }, h("h2", { text: "Create delayed payment notice" }),
      h("div", { class: "toolbar wrap" }, h("label", { text: "Buyer: " }), partySel,
        h("label", { text: "Notice date: " }), h("input", { type: "date", value: sel.date, style: "width:auto", onchange: function (e) { if (!E.parseISO(e.target.value)) { MT.toast("Choose a valid date.", "error", "MT-DAT-004"); return; } sel.date = e.target.value; MT.render(); } }),
        h("label", { text: "Days allowed: " }), h("input", { type: "number", min: 1, max: 90, value: days, style: "width:80px", onchange: function (e) { sel.days = e.target.value; } })));
    if (sel.partyId) {
      var list = MT.invoicesOf().filter(function (i) { return i.partyId === sel.partyId; });
      var rows = list.map(function (i) {
        var r = MT.calc(i, sel.date), el = eligibility(i), out = r.ok && r.totals ? r.totals.totalOutstanding : 0;
        var blocked = !r.ok || el.level === "NOT_ELIGIBLE" || out === 0 || r.pending;
        var cb = h("input", { type: "checkbox", disabled: blocked, checked: sel.ids.has(i.id) && !blocked, "aria-label": "Include invoice " + i.invoiceNo, onchange: function (e) { if (e.target.checked) sel.ids.add(i.id); else sel.ids.delete(i.id); } });
        return h("tr", null, h("td", null, cb), h("td", { text: i.invoiceNo }), h("td", { text: E.fmtDMY(i.deliveryDate) }),
          h("td", { text: r.ok ? E.fmtDMY(r.dueDate) : "—" }), h("td", { class: "n", text: r.ok && r.totals ? inr(r.totals.principalOutstanding) : "—" }), h("td", { class: "n", text: r.ok && r.totals ? inr(r.totals.interestOutstanding) : "—" }),
          h("td", null, !r.ok ? r.errors.map(function (e) { return [MT.errChip(e.code), " "]; }) : out === 0 ? h("span", { class: "pill ok" }, "Nothing due") : r.pending ? h("span", { class: "pill info" }, "Acceptance pending") : el.level === "NOT_ELIGIBLE" ? [h("span", { class: "pill err" }, "Not eligible "), el.issues.map(function (x) { return [MT.errChip(x.code), " "]; })] : el.level === "REVIEW" ? [h("span", { class: "pill warn" }, "Review "), el.issues.map(function (x) { return [MT.errChip(x.code), " "]; })] : h("span", { class: "pill ok" }, "Eligible")));
      });
      card.appendChild(MT.table([{ label: "Include" }, { label: "Invoice" }, { label: "Delivery" }, { label: "Last day to pay" }, { label: "Principal due ₹", n: true }, { label: "Interest due ₹", n: true }, { label: "Eligibility" }], rows, { empty: "No invoices for this buyer." }));
      card.appendChild(h("div", { class: "toolbar" }, h("button", { class: "btn primary", type: "button", onclick: function () { generate(false); } }, "Preview notice"),
        h("span", { class: "muted", text: "Invoices marked 'Not eligible' cannot be included. Items marked 'Review' are included with a warning." })));
    }
    main.appendChild(card);
  }

  function generate() {
    var c = MT.company(), party = MT.state.parties.get(sel.partyId), days = parseInt(sel.days || MT.settings().noticeDays, 10);
    if (!(days >= 1 && days <= 90)) { MT.toast("Enter days between 1 and 90.", "error", "MT-INP-010"); return; }
    var items = Array.from(sel.ids).map(function (id) { return MT.state.invoices.get(id); }).filter(Boolean);
    if (!items.length) { MT.toast("Tick at least one invoice.", "warn", "MT-RPT-002"); return; }
    var res = items.map(function (i) { return { inv: i, party: party.name, r: MT.calc(i, sel.date), el: eligibility(i) }; });
    var bad = res.filter(function (x) { return !x.r.ok || x.el.level === "NOT_ELIGIBLE"; });
    if (bad.length) { MT.toast("Some selected invoices cannot be included.", "error", (bad[0].r.errors[0] || bad[0].el.issues[0] || {}).code || "MT-CAL-001"); return; }
    var no = noticeNo();
    var doc = buildNotice(c, party, res, sel.date, days, no);
    var tot = res.reduce(function (s, x) { return s + x.r.totals.totalOutstanding; }, 0);
    var preview = h("div", { class: "tablewrap", style: "padding:10px;background:#fff;color:#222", html: doc.body });
    MT.modal("Notice preview - " + no, h("div", null, doc.warn ? h("div", { class: "banner warn", html: doc.warn }) : null, preview), [
      { label: "Close" },
      { label: "Save to register", keep: true, onclick: function () { saveRecord(no, party, res, tot, days); MT.toast("Notice saved to the register.", "ok"); return false; } },
      { label: "Download Word (.doc)", onclick: function () { MT.download("Notice-" + no.replace(/\//g, "-") + ".doc", "application/msword", wordDoc(doc.body)); return false; }, keep: true },
      { label: "Download text (.txt)", onclick: function () { MT.download("Notice-" + no.replace(/\//g, "-") + ".txt", "text/plain;charset=utf-8", plain(doc.body)); return false; }, keep: true },
      { label: "Print / PDF", cls: "primary", keep: true, onclick: function () { MT.openReport("Notice", MT.reportDoc("Notice " + no, doc.body)); return false; } }
    ], { wide: true });
  }
  function saveRecord(no, party, res, tot, days) {
    var rec = { id: MT.uid(), companyId: MT.state.companyId, no: no, date: sel.date, partyId: party.id, partyName: party.name, days: days, invoiceIds: res.map(function (x) { return x.inv.id; }), invoiceNos: res.map(function (x) { return x.inv.invoiceNo; }), totalPaise: tot, createdAt: new Date().toISOString() };
    MT.put("notices", rec, true);
  }
  function buildNotice(c, p, res, date, days, no) {
    var prov = res.some(function (x) { return x.r.provisional; });
    var review = res.some(function (x) { return x.el.level === "REVIEW"; });
    var warn = (prov ? "<strong>PROVISIONAL</strong> - interest uses a Bank Rate after the verified table or an unverified rate (MT-RAT-002/003). Verify before sending. " : "") + (review ? "Some invoices need review of the supplier's registration details (see eligibility codes). " : "");
    var tPrin = 0, tInt = 0;
    res.forEach(function (x) { tPrin += x.r.totals.principalOutstanding; tInt += x.r.totals.interestOutstanding; });
    var rows = res.map(function (x, i) {
      var t = x.r.totals;
      return "<tr><td>" + (i + 1) + "</td><td>" + esc(x.inv.invoiceNo) + " dt. " + E.fmtDMY(x.inv.invoiceDate) + "</td><td>" + E.fmtDMY(x.inv.deliveryDate) + "</td><td>" + E.fmtDMY(x.r.dueDate) + "</td><td class=\"n\">" + inr(t.invoiceTotal) + "</td><td class=\"n\">" + inr(t.principalOutstanding) + "</td><td class=\"n\">" + inr(t.interestOutstanding) + "</td><td class=\"n\">" + inr(t.totalOutstanding) + "</td></tr>";
    }).join("");
    var rate = E.rateOn(date, MT.rates());
    var last = E.fmtDMY(E.addDays(date, days));
    var body = "<div style=\"text-align:center\"><strong>" + esc(c.name) + "</strong><br>" + esc(c.address || "").replace(/\n/g, "<br>") + (c.email ? "<br>E-mail: " + esc(c.email) : "") + (c.phone ? " · Phone: " + esc(c.phone) : "") + "</div>" +
      "<p>Notice No.: <strong>" + esc(no) + "</strong><br>Date: " + E.fmtDMY(date) + (c.place ? "<br>Place: " + esc(c.place) : "") + "</p>" +
      "<p><strong>To,</strong><br>" + esc(p.name) + "<br>" + esc(p.address || "").replace(/\n/g, "<br>") + (p.email ? "<br>E-mail: " + esc(p.email) : "") + "</p>" +
      "<p><strong>Subject: Notice for payment of outstanding dues with interest under sections 15, 16 and 17 of the Micro, Small and Medium Enterprises Development Act, 2006.</strong></p>" +
      "<p>Sir/Madam,</p>" +
      "<p>1. We are a " + esc(c.category && c.category !== "unknown" ? c.category : "micro/small") + " enterprise registered under the Act" + (c.udyamNo ? " (Udyam Registration No. " + esc(c.udyamNo) + (c.udyamDate ? " dated " + E.fmtDMY(c.udyamDate) : "") + ")" : "") + ". We supplied goods/services to you as listed below, which you accepted:</p>" +
      "<table><thead><tr><th>#</th><th>Invoice</th><th>Delivery / acceptance</th><th>Last day for payment</th><th class=\"n\">Invoice ₹</th><th class=\"n\">Principal due ₹</th><th class=\"n\">Interest to " + E.fmtDMY(date) + " ₹</th><th class=\"n\">Total ₹</th></tr></thead><tbody>" + rows +
      "<tr><th colspan=\"5\">Total</th><th class=\"n\">" + inr(tPrin) + "</th><th class=\"n\">" + inr(tInt) + "</th><th class=\"n\">" + inr(tPrin + tInt) + "</th></tr></tbody></table>" +
      "<p>2. Under section 15 of the Act, payment was due on or before the date agreed in writing (not exceeding 45 days from acceptance) or, where there is no written agreement, before the appointed day, i.e. within 15 days of acceptance. The last day for payment for each invoice is shown above. You have not paid the amounts shown.</p>" +
      "<p>3. Under section 16, a buyer who fails to pay is liable to pay compound interest with monthly rests at three times the Bank Rate notified by the Reserve Bank of India, notwithstanding any agreement between the parties or any law in force (section 24). The Bank Rate in force on " + E.fmtDMY(date) + " is " + E.fmtPct(rate.bank) + ", so interest runs at " + E.fmtPct(rate.bank * 3) + " per annum. Interest has been worked out as set out in the annexure and continues to accrue until payment.</p>" +
      "<p>4. You are called upon to pay <strong>₹ " + inr(tPrin + tInt) + "</strong> (principal ₹ " + inr(tPrin) + " and interest ₹ " + inr(tInt) + " up to " + E.fmtDMY(date) + "), together with further interest from " + E.fmtDMY(E.addDays(date, 1)) + " until payment, within <strong>" + days + " days</strong> of receipt of this notice (on or before " + last + ").</p>" +
      "<p>5. If you fail to do so, we shall refer the dispute to the Micro and Small Enterprises Facilitation Council under section 18 of the Act and take such other legal steps as may be advised, at your risk as to cost and consequences. Please note that, as per section 19, an application to set aside an award of the Council is entertained only on deposit of 75% of the awarded amount, and that you are required by section 22 to disclose unpaid amounts and interest in your annual statement of accounts if your accounts are audited.</p>" +
      "<p>6. This notice is without prejudice to our other rights and remedies.</p>" +
      "<p>Yours faithfully,<br><br><br>" + esc(c.signatory || "Authorised signatory") + "<br>" + esc(c.designation || "") + "<br>For " + esc(c.name) + "</p>" +
      "<h3>Annexure - interest working</h3>" + res.map(function (x) { return "<p><strong>Invoice " + esc(x.inv.invoiceNo) + "</strong> - acceptance " + E.fmtDMY(x.r.acceptanceDate) + "; " + esc(x.r.basis) + "; interest from " + E.fmtDMY(x.r.interestStartDate) + ".</p>" + MT.ledgerHTML(x.inv, x.r); }).join("") +
      MT.settingsBlock() +
      "<p style=\"font-size:11px\"><em>Draft prepared with MSME Tools. Have it reviewed by an advocate or chartered accountant before dispatch; it is not legal advice.</em></p>";
    return { body: body, warn: warn };
  }
  function wordDoc(body) {
    return "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Notice</title><style>body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #666;padding:3px;font-size:9pt}.n{text-align:right}</style></head><body>" + body + "</body></html>";
  }
  function plain(body) {
    var d = document.createElement("div"); d.innerHTML = body.replace(/<\/(p|tr|h3|div)>/g, "\n").replace(/<br\s*\/?>/g, "\n").replace(/<\/t[dh]>/g, " | ");
    return d.textContent.replace(/\n{3,}/g, "\n\n");
  }

  function tabRegister(main) {
    var list = Array.from(MT.state.notices.values()).filter(function (n) { return n.companyId === MT.state.companyId; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Notice register" }),
      MT.table([{ label: "Notice no." }, { label: "Date" }, { label: "Buyer" }, { label: "Invoices" }, { label: "Amount ₹", n: true }, { label: "" }], list.map(function (n) {
        return h("tr", null, h("td", { text: n.no }), h("td", { text: E.fmtDMY(n.date) }), h("td", { text: n.partyName }), h("td", { text: n.invoiceNos.join(", ") }), h("td", { class: "n", text: inr(n.totalPaise) }),
          h("td", null, h("button", { class: "btn small", type: "button", onclick: function () {
            sel.partyId = n.partyId; sel.ids = new Set(n.invoiceIds.filter(function (id) { return MT.state.invoices.has(id); })); sel.date = n.date; sel.days = n.days; MT.setTab("notice");
          } }, "Re-open"), " ", h("button", { class: "btn small danger", type: "button", onclick: function () { MT.confirm("Delete register entry?", "Delete notice " + n.no + " from the register? The notice itself is not affected.", "Delete", "danger").then(function (ok) { if (ok) { MT.drop("notices", n.id); MT.render(); } }); } }, "Delete")));
      }), { empty: "No notices saved yet." }),
      h("p", { class: "muted", text: "Re-open recalculates with the saved date, so the figures are exactly reproducible as long as the invoice data is unchanged." })));
  }

  MT.start({
    appId: "notice-generator", appName: "Delayed Payment Notice Generator", version: E.VERSION, defaultRole: "supplier",
    tabs: [
      { id: "invoices", label: "Invoices", render: function (m) { MT.tabInvoices(m); } },
      { id: "parties", label: "Buyers", render: MT.tabParties },
      { id: "notice", label: "Create Notice", render: tabNotice },
      { id: "register", label: "Notice Register", render: tabRegister },
      { id: "rates", label: "Rate Master", render: MT.tabRates },
      { id: "settings", label: "Settings", render: MT.tabSettings(["rateBasis", "restBasis", "appropriation", "noticeDays"]) },
      { id: "backup", label: "Backup", render: MT.tabBackup },
      { id: "help", label: "Help", render: MT.tabHelp }
    ]
  });
})();
