/*! MSME Tools - MSME Document Generator: sale-of-goods agreement, MSEFC affidavit, buyer's declaration */
(function () {
  "use strict";
  var MT = window.MT, E = window.MSME, h = MT.h, esc = MT.esc, inr = function (p) { return E.fmtINR(p); };
  var cur = { type: "agreement", partyId: "", values: null, editId: null };

  var DOCS = {
    agreement: { label: "Agreement for the sale of goods", help: "Supply contract between a micro/small seller and a buyer. Includes a payment clause that follows sections 15 and 16 of the MSMED Act." },
    affidavit: { label: "Affidavit before the MSEFC (claim petition)", help: "Affidavit of the claimant/petitioner supporting the claim petition filed under section 18." },
    declaration: { label: "Buyer's declaration (statement of defence)", help: "Declaration by the respondent/buyer supporting its statement of defence in the section 18 claim petition." }
  };
  var dl = function (s) { return s ? E.fmtDMY(s) : "__________"; };
  var blank = function (s, n) { return s && String(s).trim() ? esc(String(s).trim()).replace(/\n/g, "<br>") : "_".repeat(n || 12); };

  function fieldsFor(type) {
    if (type === "agreement") return [
      { key: "date", label: "Date of agreement", type: "date", req: true, help: "Statutory supplier status is judged on this date (Mahakali Foods)." },
      { key: "sellerBusiness", label: "Seller is a manufacturer of / provider of", req: true, wide: true },
      { key: "buyerBusiness", label: "Buyer is in the business of", req: true, wide: true },
      { key: "definitions", label: "Definitions - one per line as: Term = meaning", type: "textarea", rows: 3, wide: true },
      { key: "goods", label: "Goods - one per line as: Description | Quantity | Unit price ₹", type: "textarea", rows: 4, req: true, wide: true, help: "Example: Steel brackets | 500 | 120.50" },
      { key: "creditDays", label: "Payment period agreed (days from acceptance, maximum 45)", type: "number", req: true, help: "Section 15 proviso: a written agreement can never exceed 45 days." },
      { key: "shipment", label: "Shipment and delivery", type: "textarea", wide: true, rows: 2 },
      { key: "lateDelivery", label: "Late delivery", type: "textarea", wide: true, rows: 2 },
      { key: "title", label: "Title", type: "textarea", wide: true, rows: 2 },
      { key: "risk", label: "Risk of loss", type: "textarea", wide: true, rows: 2 },
      { key: "packaging", label: "Packaging and labelling", type: "textarea", wide: true, rows: 2 },
      { key: "inspection", label: "Inspection and acceptance", type: "textarea", wide: true, rows: 2, help: "Say when goods are treated as accepted; this fixes the day of acceptance." },
      { key: "warranty", label: "Product warranties", type: "textarea", wide: true, rows: 2 },
      { key: "termination", label: "Termination", type: "textarea", wide: true, rows: 2 },
      { key: "law", label: "Governing law and place of courts", type: "textarea", wide: true, rows: 2 },
      { key: "w1", label: "Seller's signatory" }, { key: "w1d", label: "Seller's signatory designation" },
      { key: "wit1", label: "Seller's witness 1" }, { key: "wit2", label: "Seller's witness 2" },
      { key: "w2", label: "Buyer's signatory" }, { key: "w2d", label: "Buyer's signatory designation" },
      { key: "wit3", label: "Buyer's witness 1" }, { key: "wit4", label: "Buyer's witness 2" }
    ];
    if (type === "affidavit") return [
      { key: "council", label: "Council (jurisdictional MSEFC)", req: true, wide: true, ph: "Micro and Small Enterprises Facilitation Council, ..." },
      { key: "location", label: "Location of Council", req: true },
      { key: "caseNo", label: "MSEFC case number", req: true, ph: "10/2011" },
      { key: "andOrs", label: "Respondent includes 'and others'", type: "checkbox" },
      { key: "deponent", label: "Deponent's name", req: true }, { key: "age", label: "Age (years)", req: true },
      { key: "relation", label: "Relationship", type: "select", options: [["son", "son of"], ["daughter", "daughter of"], ["wife", "wife of"]] },
      { key: "father", label: "Name of father / husband", req: true }, { key: "late", label: "Father/husband is deceased ('late')", type: "checkbox" },
      { key: "residence", label: "Residence of deponent", type: "textarea", wide: true, req: true },
      { key: "paraN", label: "Claim petition paragraphs 1 to (n): n =", req: true, type: "number" },
      { key: "annFrom", label: "Annexures from (letter)", req: true, ph: "A" }, { key: "annTo", label: "Annexures to (letter)", req: true, ph: "T" },
      { key: "date", label: "Date of verification", type: "date", req: true }, { key: "place", label: "Place of verification", req: true }
    ];
    return [
      { key: "signatory", label: "Name of respondent/buyer's authorised signatory", req: true }, { key: "designation", label: "Designation" },
      { key: "place", label: "Place" }, { key: "date", label: "Date", type: "date" }
    ];
  }
  function defaults(type, c, p) {
    var o = {};
    if (type === "agreement") Object.assign(o, { shipment: "", lateDelivery: "", title: "", risk: "", packaging: "", inspection: "", warranty: "", termination: "The contract can be terminated at the option of the Seller, pursuant to which the issues would remain for determination.", law: "This Agreement is governed by the laws of India. The courts at ____________ have jurisdiction, subject to the Micro and Small Enterprises Facilitation Council's powers under section 18 of the MSMED Act, 2006.", creditDays: "30", w1: c.signatory || "", w1d: c.designation || "" });
    if (type === "affidavit") Object.assign(o, { relation: "son", andOrs: true, annFrom: "A", annTo: "T", place: c.place || "" });
    if (type === "declaration") Object.assign(o, { signatory: c.signatory || "", designation: c.designation || "", place: c.place || "" });
    return o;
  }

  /* ----- builders: return {html, errors[], warnings[]} ----- */
  function party(c, p, role) { // role of company
    return role === "supplier" ? { seller: c, buyer: p } : { seller: p, buyer: c };
  }
  function parseGoods(text) {
    var lines = (text || "").split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean), out = [], bad = [], total = 0;
    lines.forEach(function (l, i) {
      var a = l.split("|").map(function (x) { return x.trim(); });
      var qty = /^\d+(\.\d{1,3})?$/.test(a[1] || "") ? parseFloat(a[1]) : null, unit = E.parseRupees(a[2] || "");
      if (!a[0] || qty === null || qty <= 0 || unit === null || unit <= 0) { bad.push(i + 1); return; }
      var qthou = Math.round(qty * 1000), lineT = Number((BigInt(unit) * BigInt(qthou) + 500n) / 1000n);
      total += lineT; out.push({ d: a[0], q: a[1], u: unit, t: lineT });
    });
    return { rows: out, bad: bad, total: total };
  }
  function build(type, v, c, p) {
    var r = { errors: [], warnings: [] }, req = fieldsFor(type).filter(function (f) { return f.req; });
    req.forEach(function (f) { if (!String(v[f.key] === undefined ? "" : v[f.key]).trim()) r.errors.push({ code: "MT-INP-011", field: f.key }); });
    ["date"].forEach(function (k) { if (v[k] && !E.parseISO(v[k])) r.errors.push({ code: "MT-DAT-002", field: k }); });
    if (type === "agreement") {
      var cd = v.creditDays === "" ? NaN : Number(v.creditDays);
      if (!(Number.isInteger(cd) && cd >= 0)) r.errors.push({ code: "MT-INP-006", field: "creditDays" });
      else if (cd > 45) { r.errors.push({ code: "MT-LEG-004", field: "creditDays", hard: true }); }
      var g = parseGoods(v.goods); if (g.bad.length) r.errors.push({ code: "MT-INP-013", field: "goods" });
      if (!r.errors.length) { var pr = party(c, p, c.role), s = pr.seller, b = pr.buyer;
        if (s.category === "medium") r.warnings.push({ code: "MT-LEG-002" });
        if (!s.udyamNo || !s.udyamDate) r.warnings.push({ code: !s.udyamNo ? "MT-LEG-008" : "MT-LEG-009" });
        else if (E.dn(s.udyamDate) !== null && E.dn(v.date) !== null && E.dn(s.udyamDate) > E.dn(v.date)) r.warnings.push({ code: "MT-LEG-017" });
        r.html = agreement(v, s, b, g, cd); }
    } else if (type === "affidavit") {
      var n = Number(v.paraN); if (!(Number.isInteger(n) && n >= 1)) r.errors.push({ code: "MT-INP-012", field: "paraN" });
      var af = (v.annFrom || "").toUpperCase(), at = (v.annTo || "").toUpperCase();
      if (!/^[A-Z]$/.test(af) || !/^[A-Z]$/.test(at) || af > at) r.errors.push({ code: "MT-INP-012", field: "annFrom" });
      var age = Number(v.age); if (!(Number.isInteger(age) && age >= 18 && age < 120)) r.errors.push({ code: "MT-INP-012", field: "age" });
      if (!r.errors.length) r.html = affidavit(v, c, p, n, af, at, age);
    } else if (!r.errors.length) r.html = declaration(v, c, p);
    return r;
  }
  function agreement(v, s, b, g, cd) {
    var a = [], n = 0, art = function (t, body) { n++; a.push("<h3 class=\"art\">ARTICLE " + n + "<br>" + t + "</h3>" + body); };
    var nm = function (x) { return "<strong>" + esc(x.name) + "</strong>" + (x.address ? ", " + esc(x.address).replace(/\n/g, ", ") : ""); };
    var defs = (v.definitions || "").split(/\r?\n/).filter(function (x) { return x.trim(); }).map(function (x) { var i = x.indexOf("="); return i > 0 ? "<p>“" + esc(x.slice(0, i).trim()) + "” means " + esc(x.slice(i + 1).trim()) + "</p>" : "<p>" + esc(x) + "</p>"; }).join("") || "<p>__________________</p>";
    var rows = g.rows.map(function (x, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(x.d) + "</td><td class=\"n\">" + esc(x.q) + "</td><td class=\"n\">" + inr(x.u) + "</td><td class=\"n\">" + inr(x.t) + "</td></tr>"; }).join("");
    var txt = function (t) { return t && t.trim() ? "<p>" + esc(t.trim()).replace(/\n/g, "<br>") + "</p>" : "<p>__________________</p>"; };
    var h1 = "<h1>AGREEMENT FOR THE SALE OF GOODS</h1><p>THIS AGREEMENT made on this <strong>" + E.fmtDMY(v.date) + "</strong>, between " + nm(s) + (s.udyamNo ? " (Udyam Registration No. " + esc(s.udyamNo) + (s.udyamDate ? " dated " + E.fmtDMY(s.udyamDate) : "") + ")" : "") + " (hereinafter referred to as the SELLER, which expression shall, unless it be repugnant to the context or meaning thereof, be deemed to mean and include its successors and assigns) of the ONE PART and " + nm(b) + " (hereinafter referred to as the BUYER, which expression shall, unless it be repugnant to the context or meaning thereof, be deemed to mean and include its successors and assigns) of the OTHER PART.</p>";
    var rec = "<h3 class=\"art\">RECITALS</h3><p>WHEREAS the Seller is a manufacturer of / provider of " + esc(v.sellerBusiness) + ".</p><p>WHEREAS the Buyer is in the business of " + esc(v.buyerBusiness) + ".</p><p>WHEREAS the Buyer desires to purchase from the Seller, and the Seller desires to sell to the Buyer, the Goods.</p><p>NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties hereto agree as follows:</p>";
    art("DEFINITIONS", defs);
    art("PRICE OF GOODS", "<p>The Seller agrees to sell and the Buyer agrees to purchase the following goods:</p><table><thead><tr><th>#</th><th>Description</th><th class=\"n\">Quantity</th><th class=\"n\">Unit price ₹</th><th class=\"n\">Total price ₹</th></tr></thead><tbody>" + rows + "<tr><th colspan=\"4\">Total price of the purchase (exclusive of taxes unless stated)</th><th class=\"n\">" + inr(g.total) + "</th></tr></tbody></table>");
    art("PAYMENT TERMS AND INTEREST", "<p>(a) The Buyer shall pay the price of each consignment within <strong>" + cd + " days</strong> from the day of acceptance or deemed acceptance of the Goods, such period being agreed in writing and not exceeding forty-five days, in accordance with section 15 of the Micro, Small and Medium Enterprises Development Act, 2006 (the \"Act\").</p><p>(b) The day of acceptance is the day of actual delivery of the Goods. If the Buyer objects in writing within fifteen days of delivery, the day of acceptance is the day on which the Seller removes the objection; otherwise the Goods are deemed accepted on the day of actual delivery.</p><p>(c) If the Buyer fails to pay as required, the Buyer shall be liable to pay compound interest with monthly rests at three times the Bank Rate notified by the Reserve Bank of India, as provided in section 16 of the Act, notwithstanding anything contained in this Agreement.</p><p>(d) Any dispute regarding amounts due may be referred to the Micro and Small Enterprises Facilitation Council under section 18 of the Act.</p>");
    art("SHIPMENT AND DELIVERY", "<p><strong>Shipment and Delivery.</strong></p>" + txt(v.shipment) + "<p><strong>Late Delivery.</strong></p>" + txt(v.lateDelivery) + "<p><strong>Title.</strong></p>" + txt(v.title) + "<p><strong>Risk of Loss.</strong></p>" + txt(v.risk) + "<p><strong>Packaging and Labeling.</strong></p>" + txt(v.packaging) + "<p><strong>Inspection.</strong></p>" + txt(v.inspection));
    art("PRODUCT WARRANTIES", txt(v.warranty)); art("TERMINATION", txt(v.termination)); art("GOVERNING LAW", txt(v.law));
    art("PRESENT AGREEMENT SUPERSEDES ALL OTHER AGREEMENTS", "<p>This Agreement supersedes all other agreements, written or oral, between the parties on the same subject.</p>");
    var sig = "<p>SIGNED, SEALED AND DELIVERED by the within named Seller by the hands of its authorised representative<br><br>" + blank(v.w1, 20) + (v.w1d ? ", " + esc(v.w1d) : "") + "<br>in the presence of " + blank(v.wit1, 14) + " and " + blank(v.wit2, 14) + "</p><p>SIGNED, SEALED AND DELIVERED by the within named Buyer by the hands of its authorised representative<br><br>" + blank(v.w2, 20) + (v.w2d ? ", " + esc(v.w2d) : "") + "<br>in the presence of " + blank(v.wit3, 14) + " and " + blank(v.wit4, 14) + "</p>";
    return h1 + rec + a.join("") + "<div class=\"sig\">" + sig + "</div>";
  }
  function relText(v) { return { son: "son of", daughter: "daughter of", wife: "wife of" }[v.relation] || "son of"; }
  function affidavit(v, c, p, n, af, at, age) {
    var res = esc(p.name) + (v.andOrs ? " &amp; ORS." : "");
    return "<h1>AFFIDAVIT</h1><p class=\"c\"><strong>BEFORE THE " + esc(v.council).toUpperCase() + " AT " + esc(v.location).toUpperCase() + "</strong></p><p class=\"c\">MSEFC Case No. " + esc(v.caseNo) + "</p>" +
      "<table class=\"plain\"><tr><td><strong>" + esc(c.name) + "</strong></td><td class=\"r\">… PETITIONER</td></tr><tr><td colspan=\"2\" class=\"c\">VERSUS</td></tr><tr><td><strong>" + res + "</strong></td><td class=\"r\">… RESPONDENT</td></tr></table>" +
      "<p>Affidavit of <strong>" + esc(v.deponent) + "</strong>, aged about " + age + " years, " + relText(v) + " " + (v.late ? "late " : "") + "Shri " + esc(v.father) + ", resident of " + esc(v.residence).replace(/\n/g, ", ") + ".</p>" +
      "<p>I, the deponent above-named, do hereby solemnly affirm and state on oath as under:</p><ol>" +
      "<li>That I am the Petitioner in the aforesaid Claim Petition and am conversant with the full facts of the case.</li>" +
      "<li>That the deponent has read the Claim Petition and annexures, the contents of which he/she has fully understood.</li>" +
      "<li>That the contents of paragraphs 1 to " + n + " of the Claim Petition are true to the own knowledge and belief of the deponent.</li>" +
      "<li>That annexures " + af + " to " + at + " to the Claim Petition have been compared and are certified to be true copies of their originals.</li></ol>" +
      "<p class=\"r\"><strong>DEPONENT</strong></p><h3>Verification</h3><p>I, the above-named deponent, do hereby verify that the contents of paragraphs 1 to 4 of this affidavit are true to my own knowledge. No part of it is false and nothing material has been concealed.</p>" +
      "<p>Verified at <strong>" + esc(v.place) + "</strong>, on this <strong>" + E.fmtDMY(v.date) + "</strong>.</p><p class=\"r\"><strong>DEPONENT</strong><br>(Signature)</p>" +
      "<p class=\"note\">To be signed before a Notary Public / Oath Commissioner as required by the Council.</p>";
  }
  function declaration(v, c, p) {
    return "<h1>DECLARATION</h1><p class=\"c\"><strong>CLAIM PETITION UNDER SECTION 18 OF THE MSMED ACT, 2006</strong></p>" +
      "<table class=\"plain\"><tr><td><strong>" + esc(c.role === "supplier" ? c.name : p.name) + "</strong></td><td class=\"r\">… CLAIMANT / SUPPLIER</td></tr><tr><td colspan=\"2\" class=\"c\">VERSUS</td></tr><tr><td><strong>" + esc(c.role === "supplier" ? p.name : c.name) + "</strong></td><td class=\"r\">… RESPONDENT / BUYER</td></tr></table>" +
      "<h3 class=\"c\">DECLARATION</h3><p>I, <strong>" + esc(v.signatory) + "</strong>" + (v.designation ? ", " + esc(v.designation) : "") + ", the Respondent/Buyer above-named, do hereby solemnly declare as under:</p><ol>" +
      "<li>That I am the Respondent/Buyer in the aforesaid Claim Petition and am conversant with the full facts of the case.</li>" +
      "<li>That I have read and understood the contents of the Statement of Defence and annexures.</li>" +
      "<li>That the contents of the Statement of Defence are true to my own knowledge and belief.</li></ol>" +
      "<p class=\"r\"><strong>RESPONDENT / BUYER</strong><br>(Signature)</p>" + (v.place || v.date ? "<p>Place: " + esc(v.place || "") + " &nbsp; Date: " + (v.date ? E.fmtDMY(v.date) : "") + "</p>" : "");
  }
  var CSS = "<style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.5}h1{text-align:center;font-size:16pt}h3.art{text-align:center;font-size:12pt;margin:18px 0 6px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #444;padding:3px 6px}table.plain td{border:0}.n{text-align:right}.c{text-align:center}.r{text-align:right}.note{font-size:10pt;font-style:italic}.sig{margin-top:30px}</style>";

  /* ----- UI ----- */
  function tabCreate(main) {
    var c = MT.company(), parties = MT.partiesOf();
    var typeSel = h("select", { "aria-label": "Document type", onchange: function (e) { cur.type = e.target.value; cur.values = null; cur.editId = null; MT.render(); } }, Object.keys(DOCS).map(function (k) { return h("option", { value: k, selected: k === cur.type }, DOCS[k].label); }));
    var partySel = h("select", { "aria-label": "Other party", onchange: function (e) { cur.partyId = e.target.value; cur.values = null; MT.render(); } }, [h("option", { value: "" }, "- select " + (c.role === "supplier" ? "buyer" : "supplier") + " -")].concat(parties.map(function (p) { return h("option", { value: p.id, selected: p.id === cur.partyId }, p.name); })));
    var card = h("div", { class: "card" }, h("h2", { text: "Create a document" }), h("div", { class: "toolbar wrap" }, h("label", { text: "Document: " }), typeSel, h("label", { text: "Other party: " }), partySel), h("p", { class: "muted", text: DOCS[cur.type].help }));
    var p = MT.state.parties.get(cur.partyId);
    if (p) {
      var defs = fieldsFor(cur.type), vals = cur.values || Object.assign({}, defaults(cur.type, c, p));
      var form = h("div", { class: "form" }, h("div", { class: "fld wide" }, h("div", { class: "ferr", id: "e_formtop" })), defs.map(function (d) { return MT.field(d, vals[d.key]); }));
      card.appendChild(form);
      card.appendChild(h("div", { class: "toolbar" }, h("button", { class: "btn primary", type: "button", onclick: function () { generate(form, defs, c, p, false); } }, "Preview document"),
        h("button", { class: "btn", type: "button", onclick: function () { generate(form, defs, c, p, true); } }, "Preview and save to register")));
    } else card.appendChild(h("p", { class: "muted", text: "Choose the other party to continue. Add parties in the Parties tab." }));
    main.appendChild(card);
  }
  function generate(form, defs, c, p, save) {
    var v = MT.readForm(form, defs); cur.values = v;
    var r = build(cur.type, v, c, p);
    var hard = r.errors.map(function (e) { return e; });
    if (hard.length) { MT.showErrors(form, hard); return; }
    MT.showErrors(form, []);
    var body = r.html, notes = r.warnings.map(function (w) { return [MT.errChip(w.code), " " + MT.err(w.code).title + ". "]; });
    var name = DOCS[cur.type].label;
    function rec() {
      var no = cur.type.slice(0, 3).toUpperCase() + "/" + new Date().getFullYear() + "/" + String(Array.from(MT.state.notices.values()).filter(function (x) { return x.companyId === MT.state.companyId && x.docType === cur.type; }).length + 1).padStart(3, "0");
      MT.put("notices", { id: MT.uid(), companyId: MT.state.companyId, docType: cur.type, no: no, date: v.date || MT.today(), partyId: p.id, partyName: p.name, title: name, values: v, invoiceNos: [], totalPaise: 0, createdAt: new Date().toISOString() }, true);
      MT.toast("Saved to register as " + no + ".", "ok");
    }
    MT.modal(name, h("div", null, h("div", { class: "banner warn" }, "Draft for review by an advocate before signing or filing. ", notes), h("div", { class: "tablewrap", style: "padding:14px;background:#fff;color:#111", html: CSS + body })), [
      { label: "Close" },
      { label: "Save to register", keep: true, onclick: function () { rec(); return false; } },
      { label: "Download Word (.doc)", keep: true, onclick: function () { MT.download(cur.type + "-" + MT.today() + ".doc", "application/msword", "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" + esc(name) + "</title>" + CSS + "</head><body>" + body + "</body></html>"); return false; } },
      { label: "Print / PDF", cls: "primary", keep: true, onclick: function () { MT.openReport(name, MT.reportDoc(name, CSS + body)); return false; } }
    ], { wide: true });
    if (save) rec();
  }
  function tabRegister(main) {
    var list = Array.from(MT.state.notices.values()).filter(function (n) { return n.companyId === MT.state.companyId; }).sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
    main.appendChild(h("div", { class: "card" }, h("h2", { text: "Document register" }),
      MT.table([{ label: "Ref." }, { label: "Document" }, { label: "Other party" }, { label: "Date" }, { label: "" }], list.map(function (n) {
        return h("tr", null, h("td", { text: n.no }), h("td", { text: n.title || "Notice" }), h("td", { text: n.partyName }), h("td", { text: E.fmtDMY(n.date) }),
          h("td", null, n.values ? h("button", { class: "btn small", type: "button", onclick: function () { cur.type = n.docType; cur.partyId = n.partyId; cur.values = n.values; MT.setTab("create"); } }, "Re-open") : "", " ",
            h("button", { class: "btn small danger", type: "button", onclick: function () { MT.confirm("Delete register entry?", "Delete " + n.no + " from the register?", "Delete", "danger").then(function (ok) { if (ok) { MT.drop("notices", n.id); MT.render(); } }); } }, "Delete")));
      }), { empty: "Nothing saved yet." })));
  }

  MT.start({
    appId: "document-generator", appName: "MSME Document Generator", version: E.VERSION, defaultRole: "supplier",
    tabs: [
      { id: "parties", label: "Parties", render: MT.tabParties },
      { id: "create", label: "Create Document", render: tabCreate },
      { id: "register", label: "Document Register", render: tabRegister },
      { id: "backup", label: "Backup", render: MT.tabBackup },
      { id: "help", label: "Help", render: MT.tabHelp }
    ]
  });
})();
