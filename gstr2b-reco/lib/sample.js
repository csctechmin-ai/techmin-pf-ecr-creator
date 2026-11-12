/* Synthetic sample data (invented companies, valid-format GSTINs). Used by "Load sample data" and by the automated tests. */
(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(require("./engine.js")); else root.GRSAMPLE = factory(root.GR); })(typeof self !== "undefined" ? self : this, function (GR) {
  function mk(state, pan, e) { var s = state + pan + e + "Z"; return s + GR.gstinCheckChar(s); }
  var S = { alpha: mk("27", "ABCDE1234F", "1"), beta: mk("29", "PQRST5678K", "1"), gamma: mk("07", "LMNOP4321Q", "1"), delta: mk("27", "KLMNO9876P", "1"), taj: mk("27", "TAJHO1111H", "1"), motor: mk("27", "MOTCA2222C", "1"), gym: mk("27", "FITCL3333G", "1"), eps: mk("24", "EPSIL4444E", "1"), zeta: mk("27", "ZETAB5555Z", "1"), client: mk("27", "SAMPL0000S", "1") };
  var NAMES = {}; NAMES[S.alpha] = "Alpha Traders"; NAMES[S.beta] = "Beta Components Pvt Ltd"; NAMES[S.gamma] = "Gamma Logistics"; NAMES[S.delta] = "Delta Stationers"; NAMES[S.taj] = "Taj Banquets and Catering"; NAMES[S.motor] = "Motorcare Auto Service"; NAMES[S.gym] = "FitClub Health Club"; NAMES[S.eps] = "Epsilon Packaging"; NAMES[S.zeta] = "Zeta Tools";
  function gj(g) { return g; }
  function it(tx, rate, inter) { var t = Math.round(tx * rate) / 100; return inter ? { num: 1, rt: rate, txval: tx, igst: t, cgst: 0, sgst: 0, cess: 0 } : { num: 1, rt: rate, txval: tx, igst: 0, cgst: t / 2, sgst: t / 2, cess: 0 }; }
  function inv(num, dt, tx, rate, inter, extra) { var i = it(tx, rate, inter); var o = { inum: num, typ: "R", dt: dt, val: tx + i.igst + i.cgst + i.sgst, pos: "27", rev: "N", itcavl: "Y", items: [i] }; for (var k in extra || {}) o[k] = extra[k]; return o; }
  function json2b() {
    return { data: { data: { gstin: S.client, rtnprd: "042025", version: "1.0", gendt: "14-05-2025", docdata: {
      b2b: [
        { ctin: S.alpha, trdnm: NAMES[S.alpha], supfildt: "11-05-2025", supprd: "042025", inv: [inv("A-001", "05-04-2025", 10000, 18, false), inv("VPM/26-27/0045", "08-04-2025", 25000, 18, false), inv("A-099", "10-04-2025", 4000, 18, false)] },
        { ctin: S.beta, trdnm: NAMES[S.beta], supfildt: "10-05-2025", supprd: "042025", inv: [inv("B-100", "09-04-2025", 50000, 18, true), inv("B-101", "12-04-2025", 12000, 18, true, { itcavl: "N", rsn: "P" }), inv("B-102", "15-04-2025", 8000, 18, false)] },
        { ctin: S.gamma, trdnm: NAMES[S.gamma], supfildt: "12-05-2025", supprd: "042025", inv: [inv("G-77", "20-04-2025", 7500, 18, false), inv("G-78", "28-04-2025", 3000, 18, false)] },
        { ctin: S.taj, trdnm: NAMES[S.taj], supfildt: "11-05-2025", supprd: "042025", inv: [inv("T-1", "18-04-2025", 20000, 18, false)] },
        { ctin: S.motor, trdnm: NAMES[S.motor], supfildt: "11-05-2025", supprd: "042025", inv: [inv("MC-5", "22-04-2025", 15000, 18, false)] },
        { ctin: S.zeta, trdnm: NAMES[S.zeta], supfildt: "11-05-2025", supprd: "042025", inv: [inv("Z-9", "25-04-2025", 6000, 18, false)] }
      ],
      cdnr: [{ ctin: S.delta, trdnm: NAMES[S.delta], supprd: "042025", nt: [{ ntnum: "CN-7", typ: "C", dt: "20-04-2025", val: 1180, itcavl: "Y", items: [it(1000, 18, false)] }] }],
      b2ba: [{ ctin: S.eps, trdnm: NAMES[S.eps], supprd: "042025", inv: [inv("E-10A", "08-04-2025", 2000, 18, true, { oinum: "E-10", oidt: "08-04-2025" })] }],
      isd: [{ ctin: S.alpha, x: 1 }]
    } } } };
  }
  var HDR = ["Date", "Particulars", "Voucher Type", "Voucher No.", "Supplier Invoice No.", "Supplier Invoice Date", "GSTIN/UIN", "Ledger", "HSN/SAC", "Gross Total", "Taxable Value", "Input CGST", "Input SGST", "Input IGST", "Payment Date"];
  function brow(date, name, v, inum, idate, g, ledger, hsn, tx, rate, inter, pay) { var t = Math.round(tx * rate) / 100; return [date, name, /^DN/.test(v) ? "Debit Note" : "Purchase", v, inum, idate, g, ledger, hsn, tx + t, tx, inter ? 0 : t / 2, inter ? 0 : t / 2, inter ? t : 0, pay || ""]; }
  function booksAoa() {
    var r = [["Sample Company Pvt Ltd"], ["Purchase Register for 1-Apr-25 to 30-Apr-25"], HDR];
    r.push(brow("05-04-2025", NAMES[S.alpha], "P/1", "A-001", "05-04-2025", S.alpha, "Purchases", "8473", 10000, 18, false, "20-04-2025"));
    r.push(brow("08-04-2025", NAMES[S.alpha], "P/2", "45", "08-04-2025", S.alpha, "Purchases", "8473", 25000, 18, false, "30-04-2025"));
    r.push(brow("11-04-2025", NAMES[S.beta], "P/3", "B-100", "09-04-2025", S.beta, "Purchases", "8536", 50000, 18, true, ""));
    r.push(brow("13-04-2025", NAMES[S.beta], "P/4", "B-101", "12-04-2025", S.beta, "Purchases", "8536", 12000, 18, true, ""));
    var bad = S.gamma.slice(0, 5) + (S.gamma[5] === "X" ? "Y" : "X") + S.gamma.slice(6);
    r.push(brow("21-04-2025", NAMES[S.gamma], "P/5", "G-77", "20-04-2025", bad, "Freight", "9965", 7500, 18, false, ""));
    r.push(brow("28-04-2025", NAMES[S.gamma], "P/6", "G-78", "28-04-2025", S.gamma, "Freight", "9965", 3500, 18, false, ""));
    r.push(brow("16-04-2025", NAMES[S.beta], "P/7", "B-102", "15-04-2025", S.beta, "Purchases", "8536", 8000, 18, true, ""));
    r.push(brow("18-04-2025", NAMES[S.taj], "P/8", "T-1", "18-04-2025", S.taj, "Staff Welfare - Catering", "996334", 20000, 18, false, ""));
    r.push(brow("22-04-2025", NAMES[S.motor], "P/9", "MC-5", "22-04-2025", S.motor, "Vehicle Repairs", "9987", 15000, 18, false, ""));
    r.push(brow("23-04-2025", NAMES[S.gym], "P/10", "FC-3", "23-04-2025", S.gym, "Staff Welfare", "999652", 9000, 18, false, ""));
    r.push(brow("25-04-2025", NAMES[S.zeta], "P/11", "Z-9", "25-04-2025", S.zeta, "Purchases", "8205", 6000, 18, false, ""));
    r.push(brow("25-04-2025", NAMES[S.zeta], "P/12", "Z-9", "25-04-2025", S.zeta, "Purchases", "8205", 6000, 18, false, ""));
    r.push(brow("20-04-2025", NAMES[S.delta], "DN/1", "CN-7", "20-04-2025", S.delta, "Purchase Returns", "4820", 1000, 18, false, ""));
    r.push(brow("08-04-2025", NAMES[S.eps], "P/13", "E-10", "08-04-2025", S.eps, "Packing Material", "4819", 2500, 18, true, ""));
    r.push(brow("29-04-2025", NAMES[S.alpha], "P/14", "A-150", "29-04-2025", S.alpha, "Purchases", "8473", 18000, 18, false, ""));
    r.push(brow("30-04-2025", "Local Kirana (unregistered)", "P/15", "K-1", "30-04-2025", "", "Purchases", "", 800, 0, false, ""));
    r.push(["Grand Total", "", "", "", "", "", "", "", 0, 0, 0, 0, 0, ""]);
    return r;
  }
  return { S: S, NAMES: NAMES, json2b: json2b, booksAoa: booksAoa, HDR: HDR };
});
