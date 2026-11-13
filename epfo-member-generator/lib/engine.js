/*! Techmin EPFO Member Registration Bulk File Generator - engine v1.0.0 (pure logic, no DOM, no network). */
(function (root) {
  "use strict";
  var VERSION = "1.0.1";
  var DELIM = "#~#";
  /* The 30 output fields, in the exact order of the supplied memberregistrationbulk.txt. Do not reorder. */
  var FIELDS = ["UAN", "prvMemberId", "memberName", "DOB", "DOJ", "Gender", "fatherHusbandName", "relation", "mobileNo", "emailId", "nationality", "epfWages", "qualification", "maritalStatus", "isInternationalWorker", "countryOfOrigin", "passportNumber", "passportValidFrom", "passportValidTill", "isPhisicalHandicap", "locomotive", "hearing", "visual", "BankAccNo", "Ifsc", "NameAsPerBank", "PAN", "NameAsPerPan", "AadhaarNo", "NameAsPerAadhaar"];
  var HEADER = FIELDS.join(DELIM);
  /* Data-entry-only fields (never written to the EPFO file). */
  var EXTRA = ["salutation", "aadhaarConsent"];
  var LABEL = { UAN: "UAN", prvMemberId: "Previous Member ID", memberName: "Member name (as per Aadhaar)", DOB: "Date of birth", DOJ: "Date of joining", Gender: "Gender", fatherHusbandName: "Father's / Husband's name", relation: "Relation", mobileNo: "Mobile number", emailId: "Email ID", nationality: "Nationality", epfWages: "Monthly EPF wages at joining", qualification: "Qualification", maritalStatus: "Marital status", isInternationalWorker: "International worker", countryOfOrigin: "Country of origin", passportNumber: "Passport number", passportValidFrom: "Passport valid from", passportValidTill: "Passport valid till", isPhisicalHandicap: "Differently abled", locomotive: "Locomotive", hearing: "Hearing", visual: "Visual", BankAccNo: "Bank account number", Ifsc: "IFSC", NameAsPerBank: "Name as per bank account", PAN: "PAN", NameAsPerPan: "Name as per PAN", AadhaarNo: "Aadhaar number", NameAsPerAadhaar: "Name as per Aadhaar", salutation: "Salutation", aadhaarConsent: "Aadhaar consent" };
  /* nationality: labels transcribed in source order from the EPFO Nationality dropdown screenshots (labels only were visible). Codes are taken from the same position in the Country of Origin list, which has the identical order, the same 189 entries and the same special codes (193, 765, 766, 767, 192); India = 77 is confirmed by the brief. Verify against the EPFO page. */
  /* Code tables taken from the project brief. Nationality and country lists are NOT complete here: only Indian = 77 is confirmed.
     The full lists must be loaded from the EPFO page (Settings > Load code lists) and are marked "verify" until then. */
  var CODES = {
    salutation: [["1", "Mr."], ["2", "Ms."], ["3", "Mrs."]],
    Gender: [["M", "Male"], ["F", "Female"], ["T", "Transgender"]],
    relation: [["F", "Father"], ["H", "Husband"]],
    maritalStatus: [["M", "MARRIED"], ["U", "UN-MARRIED"], ["W", "WIDOW/WIDOWER"], ["D", "DIVORCEE"]],
    qualification: [["1", "ILLITERATE"], ["3", "NON-MATRIC"], ["4", "MATRIC"], ["5", "SENIOR-SECONDARY"], ["6", "GRADUATE"], ["7", "POST-GRADUATE"], ["8", "DOCTORATE"], ["9", "TECHNICAL (PROFESSIONAL)"]],
    nationality: [["1", "Afghan"], ["2", "Albanian"], ["3", "Algerian"], ["4", "Andorran"], ["5", "Angolan"], ["6", "of Antigua and Barbuda"], ["7", "Argentinian"], ["8", "Armenian"], ["9", "Australian"], ["10", "Austrian"], ["11", "Azerbaijani"], ["12", "Bahamian"], ["13", "Bahraini"], ["14", "Bangladeshi"], ["15", "Barbadian"], ["16", "Belarusian or Belarusan"], ["17", "Belgian"], ["18", "Belizean"], ["19", "Beninese"], ["20", "Bhutanese"], ["21", "Bolivian"], ["22", "Bosnian"], ["23", "Botswanan"], ["24", "Brazilian"], ["25", "Bruneian"], ["26", "Bulgarian"], ["27", "Burkinese"], ["28", "Burundian"], ["29", "Cambodian"], ["30", "Cameroonian"], ["31", "Canadian"], ["32", "Cape Verdean"], ["33", "Central African"], ["34", "Chadian"], ["35", "Chilean"], ["36", "Chinese"], ["37", "Colombian"], ["38", "Comorian"], ["39", "Congolese"], ["40", "Costa Rican"], ["41", "Ivoirian"], ["42", "Croat or Croatian"], ["43", "Cuban"], ["44", "Cypriot"], ["45", "Czech"], ["48", "Danish"], ["49", "Djiboutian"], ["50", "Dominican"], ["51", "Dominican"], ["52", "Ecuadorean"], ["53", "Egyptian"], ["54", "Salvadorean"], ["55", "Equatorial Guinean"], ["56", "Eritrean"], ["57", "Estonian"], ["58", "Ethiopian"], ["59", "Fijian"], ["60", "Finnish"], ["61", "French"], ["62", "Gabonese"], ["63", "Gambian"], ["64", "Georgian"], ["65", "German"], ["66", "Ghanaian"], ["67", "Greek"], ["68", "Grenadian"], ["69", "Guatemalan"], ["70", "Guinean"], ["71", "Guinean"], ["72", "Guyanese"], ["73", "Haitian"], ["74", "Honduran"], ["75", "Hungarian"], ["76", "Icelandic"], ["77", "Indian"], ["78", "Indonesian"], ["79", "Iranian"], ["80", "Iraqi"], ["81", "Irish"], ["82", "Israeli"], ["83", "Italian"], ["84", "Jamaican"], ["85", "Japanese"], ["86", "Jordanian"], ["87", "Kazakh"], ["88", "Kenyan"], ["89", "Kiribati"], ["90", "Kuwaiti"], ["91", "Kyrgyzstani"], ["193", "LAOS"], ["93", "Latvian"], ["94", "Lebanese"], ["95", "Mosotho"], ["96", "Liberian"], ["97", "Libyan"], ["98", "Liechtensteiner"], ["99", "Lithuanian"], ["100", "Luxembourger"], ["101", "Malagasy or Madagascan"], ["102", "Malawian"], ["103", "Malaysian"], ["104", "Maldivian"], ["105", "Malian"], ["106", "Maltese"], ["107", "Marshallese"], ["108", "Mauritanian"], ["109", "Mauritian"], ["110", "Mexican"], ["112", "Monégasque or Monacan"], ["113", "Mongolian"], ["114", "Moroccan"], ["115", "Mozambican"], ["116", "Burmese"], ["117", "Namibian"], ["118", "Nauruan"], ["119", "Nepalese"], ["120", "Dutch"], ["121", "New Zealander"], ["122", "Nicaraguan"], ["123", "Nigerien"], ["124", "Nigerian"], ["125", "Norwegian"], ["126", "Omani"], ["127", "Pakistani"], ["128", "Palauans"], ["129", "Panamanian"], ["130", "Papua New Guinean or Guinean"], ["131", "Paraguayan"], ["132", "Peruvian"], ["133", "Philippine"], ["134", "Polish"], ["135", "Portuguese"], ["136", "Qatari"], ["767", "Quèbècois"], ["137", "Korean"], ["138", "Moldovan"], ["139", "Romanian"], ["140", "Russian"], ["141", "Rwandan"], ["142", "Nevisian"], ["143", "St. Lucian"], ["145", "SAMOAN"], ["146", "Sammarinese"], ["147", "Sao Tomean"], ["148", "Saudi Arabian or Saudi"], ["149", "Senegalese"], ["150", "Serb or Serbian"], ["151", "Seychellois"], ["152", "Sierra Leonian"], ["153", "Singaporean"], ["154", "Slovak"], ["155", "Slovene or Slovenian"], ["156", "Solomon Islander"], ["157", "Somali"], ["158", "South African"], ["159", "Spanish"], ["160", "Sri Lankan"], ["161", "Sudanese"], ["162", "Surinamese"], ["163", "Swazi"], ["164", "Swedish"], ["165", "Swiss"], ["166", "Syrian"], ["766", "Taiwanese"], ["167", "Tajik or Tadjik"], ["168", "Thai"], ["170", "Timorese"], ["171", "Togolese"], ["172", "Tongan"], ["173", "Trinidadian"], ["174", "Tunisian"], ["175", "Turkish"], ["176", "Turkmen or Turkoman"], ["177", "Tuvaluan"], ["178", "Ugandan"], ["179", "Ukrainian"], ["180", "Emirian"], ["765", "Briton"], ["182", "Tanzanian"], ["183", "American"], ["184", "Uruguayan"], ["185", "Uzbek"], ["186", "Vanuatuan"], ["192", "Vanticanien."], ["187", "Venezuelan"], ["188", "Vietnamese"], ["189", "Yemeni"], ["190", "Zambian"], ["191", "Zimbabwean"]],
    countryOfOrigin: [["1", "AFGHANISTAN"], ["2", "ALBANIA"], ["3", "ALGERIA"], ["4", "ANDORRA"], ["5", "ANGOLA"], ["6", "ANTIGUA AND BARBUDA"], ["7", "ARGENTINA"], ["8", "ARMENIA"], ["9", "AUSTRALIA"], ["10", "AUSTRIA"], ["11", "AZERBAIJAN"], ["12", "BAHAMAS"], ["13", "BAHRAIN"], ["14", "BANGLADESH"], ["15", "BARBADOS"], ["16", "BELARUS"], ["17", "BELGIUM"], ["18", "BELIZE"], ["19", "BENIN"], ["20", "BHUTAN"], ["21", "BOLIVIA"], ["22", "BOSNIA AND HERZEGOVINA"], ["23", "BOTSWANA"], ["24", "BRAZIL"], ["25", "BRUNEI DARUSSALAM"], ["26", "BULGARIA"], ["27", "BURKINA FASO"], ["28", "BURUNDI"], ["29", "CAMBODIA"], ["30", "CAMEROON"], ["31", "CANADA"], ["32", "CAPE VERDE"], ["33", "CENTRAL AFRICAN REPUBLIC"], ["34", "CHAD"], ["35", "CHILE"], ["36", "CHINA"], ["37", "COLOMBIA"], ["38", "COMOROS"], ["39", "CONGO"], ["40", "COSTA RICA"], ["41", "COTE D'IVOIRE"], ["42", "CROATIA"], ["43", "CUBA"], ["44", "CYPRUS"], ["45", "CZECH REPUBLIC"], ["48", "DENMARK"], ["49", "DJIBOUTI"], ["50", "DOMINICA"], ["51", "DOMINICAN REPUBLIC"], ["52", "ECUADOR"], ["53", "EGYPT"], ["54", "EL SALVADOR"], ["55", "EQUATORIAL GUINEA"], ["56", "ERITREA"], ["57", "ESTONIA"], ["58", "ETHIOPIA"], ["59", "FIJI"], ["60", "FINLAND"], ["61", "FRANCE"], ["62", "GABON"], ["63", "GAMBIA"], ["64", "GEORGIA"], ["65", "GERMANY"], ["66", "GHANA"], ["67", "GREECE"], ["68", "GRENADA"], ["69", "GUATEMALA"], ["70", "GUINEA"], ["71", "GUINEA BISSAU"], ["72", "GUYANA"], ["73", "HAITI"], ["74", "HONDURAS"], ["75", "HUNGARY"], ["76", "ICELAND"], ["77", "INDIA"], ["78", "INDONESIA"], ["79", "IRAN (ISLAMIC REPUBLIC OF)"], ["80", "IRAQ"], ["81", "IRELAND"], ["82", "ISRAEL"], ["83", "ITALY"], ["84", "JAMAICA"], ["85", "JAPAN"], ["86", "JORDAN"], ["87", "KAZAKHSTAN"], ["88", "KENYA"], ["89", "KIRIBATI"], ["90", "KUWAIT"], ["91", "KYRGYZSTAN"], ["193", "LAOS"], ["93", "LATVIA"], ["94", "LEBANON"], ["95", "LESOTHO"], ["96", "LIBERIA"], ["97", "LIBYAN ARAB JAMAHIRIYA"], ["98", "LIECHTENSTEIN"], ["99", "LITHUANIA"], ["100", "LUXEMBOURG"], ["101", "MADAGASCAR"], ["102", "MALAWI"], ["103", "MALAYSIA"], ["104", "MALDIVES"], ["105", "MALI"], ["106", "MALTA"], ["107", "MARSHALL ISLANDS"], ["108", "MAURITANIA"], ["109", "MAURITIUS"], ["110", "MEXICO"], ["112", "MONACO"], ["113", "MONGOLIA"], ["114", "MOROCCO"], ["115", "MOZAMBIQUE"], ["116", "MYANMAR (BURMA)"], ["117", "NAMIBIA"], ["118", "NAURU"], ["119", "NEPAL"], ["120", "NETHERLANDS"], ["121", "NEW ZEALAND"], ["122", "NICARAGUA"], ["123", "NIGER"], ["124", "NIGERIA"], ["125", "NORWAY"], ["126", "OMAN"], ["127", "PAKISTAN"], ["128", "PALAU"], ["129", "PANAMA"], ["130", "PAPUA NEW GUINEA"], ["131", "PARAGUAY"], ["132", "PERU"], ["133", "PHILIPPINES"], ["134", "POLAND"], ["135", "PORTUGAL"], ["136", "QATAR"], ["767", "QUEBEC"], ["137", "REPUBLIC OF KOREA"], ["138", "REPUBLIC OF MOLDOVA"], ["139", "ROMANIA"], ["140", "RUSSIAN FEDERATION"], ["141", "RWANDA"], ["142", "SAINT KITTS AND NEVIS"], ["143", "SAINT LUCIA"], ["145", "SAMOA"], ["146", "SAN MARINO"], ["147", "SAO TOME AND PRINCIPE"], ["148", "SAUDI ARABIA"], ["149", "SENEGAL"], ["150", "SERBIA AND MONTENEGRO"], ["151", "SEYCHELLES"], ["152", "SIERRA LEONE"], ["153", "SINGAPORE"], ["154", "SLOVAKIA"], ["155", "SLOVENIA"], ["156", "SOLOMON ISLANDS"], ["157", "SOMALIA"], ["158", "SOUTH AFRICA"], ["159", "SPAIN"], ["160", "SRI LANKA"], ["161", "SUDAN"], ["162", "SURINAME"], ["163", "SWAZILAND"], ["164", "SWEDEN"], ["165", "SWITZERLAND"], ["166", "SYRIAN ARAB REPUBLIC"], ["766", "TAIWAN ( REPUBLIC OF CHAINA )"], ["167", "TAJIKISTAN"], ["168", "THAILAND"], ["170", "TIMOR LESTE"], ["171", "TOGO"], ["172", "TONGA"], ["173", "TRINIDAD AND TOBAGO"], ["174", "TUNISIA"], ["175", "TURKEY"], ["176", "TURKMENISTAN"], ["177", "TUVALU"], ["178", "UGANDA"], ["179", "UKRAINE"], ["180", "UNITED ARAB EMIRATES"], ["765", "UNITED KINGDOM"], ["182", "UNITED REPUBLIC OF TANZANIA"], ["183", "UNITED STATES OF AMERICA"], ["184", "URUGUAY"], ["185", "UZBEKISTAN"], ["186", "VANUATU"], ["192", "VATICAN"], ["187", "VENEZUELA"], ["188", "VIET NAM"], ["189", "YEMEN"], ["190", "ZAMBIA"], ["191", "ZIMBABWE"]]
  };
  /* countryOfOrigin: transcribed in source order from the EPFO "Country of Origin" dropdown screenshots supplied by the user (codes and labels as shown; missing numbers are missing in the source and are not filled in). The "X --Select--" placeholder is not a code. */
  /* "portal": the values the EPFO member-registration form posts for its check boxes (International worker = Y, Differently abled = Y, Locomotive/Visual/Hearing = Yes); an unticked box posts nothing, so No is blank. Whether the bulk file uses the same values is not shown by the reference file and must be verified. */
  var YESNO = { "portal": null, "yn": ["Y", "N"], "yesno": ["Yes", "No"], "10": ["1", "0"], "tf": ["True", "False"], "yblank": ["Y", ""] };
  var DEFAULT_CFG = {
    includeHeader: true,           /* the supplied reference file begins with the 30-name header line */
    eol: "\n",                     /* the supplied reference uses LF */
    yesNo: "yesno",               /* not shown by the reference file: portal form values, verify */
    requiredFields: ["memberName", "DOB", "DOJ", "Gender", "fatherHusbandName", "relation", "nationality", "epfWages", "maritalStatus", "AadhaarNo", "NameAsPerAadhaar"],
    requireMobile: false, requireEmail: false, requireBank: false, requirePan: false,
    requireConsent: true, checkAadhaarChecksum: true, checkNameMatch: true, wagesCeilingWarn: 15000
  };
  var QUALITY = ["requireMobile", "requireEmail", "requireBank", "requirePan", "requireConsent", "checkAadhaarChecksum", "checkNameMatch"];

  function s(v) { return v === undefined || v === null ? "" : String(v); }
  function trim(v) { return s(v).replace(/ /g, " ").trim(); }
  function digits(v) { return trim(v).replace(/[\s-]/g, ""); }
  function isYes(v) { var x = trim(v).toLowerCase(); return x === "y" || x === "yes" || x === "1" || x === "true" || x === "t" || x === "x" || x === "✓"; }
  function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = "0" + n; return n; }

  /* ---------- dates: DD/MM/YYYY ---------- */
  function validDate(d, m, y) { var dt = new Date(y, m - 1, d); return y >= 1800 && y <= 2200 && dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d; }
  /* Returns {text, ok}. text is DD/MM/YYYY when it can be read, else the original text. */
  function normDate(v) {
    if (v instanceof Date) { if (isNaN(v)) return { text: "", ok: false }; return { text: pad(v.getDate()) + "/" + pad(v.getMonth() + 1) + "/" + v.getFullYear(), ok: true }; }
    var t = trim(v); if (!t) return { text: "", ok: true };
    var m = t.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/), d, mo, y;
    if (m) { d = +m[1]; mo = +m[2]; y = +m[3]; } else if ((m = t.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/))) { y = +m[1]; mo = +m[2]; d = +m[3]; } else return { text: t, ok: false };
    if (!validDate(d, mo, y)) return { text: t, ok: false };
    return { text: pad(d) + "/" + pad(mo) + "/" + y, ok: true };
  }
  function dateVal(t) { var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t); return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : NaN; }

  /* ---------- Yes/No ---------- */
  var PORTAL_YES = { isInternationalWorker: "Y", isPhisicalHandicap: "Y", locomotive: "Yes", hearing: "Yes", visual: "Yes" };
  function yn(cfg) { return YESNO[(cfg && cfg.yesNo) || "portal"] || YESNO.yn; }
  function toYN(flag, cfg, field) { if (((cfg && cfg.yesNo) || "portal") === "portal") return flag ? (PORTAL_YES[field] || "Y") : ""; var p = yn(cfg); return flag ? p[0] : p[1]; }

  /* ---------- identifiers ---------- */
  var VD = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  var VP = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  function verhoeff(num) { var c = 0, a = String(num).split("").reverse(); for (var i = 0; i < a.length; i++) c = VD[c][VP[i % 8][+a[i]]]; return c === 0; }
  function verhoeffCheckDigit(base) { var c = 0, a = String(base).split("").reverse(); for (var i = 0; i < a.length; i++) c = VD[c][VP[(i + 1) % 8][+a[i]]]; return [0, 4, 3, 2, 1, 5, 6, 7, 8, 9][c]; }
  var RX = { uan: /^\d{12}$/, aadhaar: /^[2-9]\d{11}$/, pan: /^[A-Z]{5}\d{4}[A-Z]$/, ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/, mobile: /^\d{10}$/, email: /^[A-Za-z0-9._%+\-']+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/, name: /^[A-Za-z][A-Za-z .'\-]*$/, acct: /^[0-9A-Za-z]{5,35}$/, passport: /^[A-Za-z0-9]{6,12}$/ };

  /* ---------- record normalisation (never silently alters meaning; only trims, upper-cases codes and reads dates) ---------- */
  function blank() { var r = {}; FIELDS.concat(EXTRA).forEach(function (k) { r[k] = ""; }); r.nationality = "77"; return r; }
  function normalise(raw, cfg) {
    var r = blank(), k;
    for (k in raw) if (Object.prototype.hasOwnProperty.call(raw, k) && (FIELDS.indexOf(k) >= 0 || EXTRA.indexOf(k) >= 0)) r[k] = raw[k] instanceof Date ? raw[k] : s(raw[k]);
    ["DOB", "DOJ", "passportValidFrom", "passportValidTill"].forEach(function (f) { r[f] = normDate(r[f]).text; });
    ["UAN", "prvMemberId", "mobileNo", "BankAccNo", "AadhaarNo"].forEach(function (f) { r[f] = digits(r[f]); });
    if (/^[A-Za-z0-9]+$/.test(digits(r.prvMemberId))) r.prvMemberId = digits(r.prvMemberId);
    ["PAN", "Ifsc", "passportNumber", "Gender", "relation", "maritalStatus"].forEach(function (f) { r[f] = trim(r[f]).replace(/\s+/g, f === "passportNumber" || f === "PAN" || f === "Ifsc" ? "" : " ").toUpperCase(); });
    ["memberName", "fatherHusbandName", "NameAsPerBank", "NameAsPerPan", "NameAsPerAadhaar", "emailId"].forEach(function (f) { r[f] = trim(r[f]).replace(/\s+/g, " "); });
    ["nationality", "qualification", "countryOfOrigin", "salutation"].forEach(function (f) { r[f] = trim(r[f]); });
    r.epfWages = trim(r.epfWages).replace(/,/g, "");
    ["isInternationalWorker", "isPhisicalHandicap", "locomotive", "hearing", "visual", "aadhaarConsent"].forEach(function (f) { r[f] = isYes(r[f]) ? "Y" : ""; });
    /* internal flags are Y/blank; the file writer converts them to the configured Yes/No convention */
    if (!r.isPhisicalHandicap) { r.locomotive = ""; r.hearing = ""; r.visual = ""; }
    return r;
  }

  /* ---------- validation ---------- */
  function issue(f, lvl, code, msg) { return { field: f, level: lvl, code: code, msg: msg }; }
  function validate(rec, cfg, lists) {
    cfg = cfg || DEFAULT_CFG; lists = lists || CODES; if (!lists.countryOfOrigin || !lists.countryOfOrigin.length) lists = { nationality: lists.nationality, countryOfOrigin: CODES.countryOfOrigin }; var out = [], e = function (f, c, m) { out.push(issue(f, "error", c, m)); }, w = function (f, c, m) { out.push(issue(f, "warn", c, m)); };
    var req = cfg.requiredFields || [];
    function need(f) { if (!trim(rec[f])) e(f, "EP-REQ", LABEL[f] + " is required."); return !!trim(rec[f]); }
    req.forEach(function (f) { if (f === "AadhaarNo" || f === "NameAsPerAadhaar") return; need(f); });
    if (req.indexOf("AadhaarNo") >= 0) need("AadhaarNo"); if (req.indexOf("NameAsPerAadhaar") >= 0) need("NameAsPerAadhaar");
    if (cfg.requireMobile) need("mobileNo"); if (cfg.requireEmail) need("emailId"); if (cfg.requirePan) { need("PAN"); need("NameAsPerPan"); }
    if (cfg.requireBank) { need("BankAccNo"); need("Ifsc"); need("NameAsPerBank"); }
    /* dates */
    ["DOB", "DOJ", "passportValidFrom", "passportValidTill"].forEach(function (f) { var v = rec[f]; if (v && !normDate(v).ok) e(f, "EP-DATE", LABEL[f] + " must be a real date in DD/MM/YYYY."); else if (v && !/^\d{2}\/\d{2}\/\d{4}$/.test(v)) e(f, "EP-DATE", LABEL[f] + " must be in DD/MM/YYYY."); });
    var dob = dateVal(rec.DOB), doj = dateVal(rec.DOJ), now = Date.now();
    if (!isNaN(dob) && dob > now) e("DOB", "EP-DSEQ", "Date of birth is in the future.");
    if (!isNaN(doj) && !isNaN(dob) && doj <= dob) e("DOJ", "EP-DSEQ", "Date of joining must be after the date of birth.");
    if (!isNaN(dob) && !isNaN(doj) && doj > dob) { var age = (doj - dob) / 31557600000; if (age < 14) w("DOB", "EP-AGE", "Member is under 14 years at joining. Please check the dates."); if (age > 70) w("DOB", "EP-AGE", "Member is over 70 years at joining. Please check the dates."); }
    if (!isNaN(doj) && doj > now + 366 * 86400000) w("DOJ", "EP-DSEQ", "Date of joining is more than a year ahead.");
    /* names */
    if (rec.memberName) { if (rec.memberName.length > 85) e("memberName", "EP-LEN", "Member name is longer than 85 characters."); else if (!RX.name.test(rec.memberName)) w("memberName", "EP-NAME", "Member name has unusual characters. Use letters, spaces and . ' - only."); }
    if (rec.fatherHusbandName && !RX.name.test(rec.fatherHusbandName)) w("fatherHusbandName", "EP-NAME", "Father's / husband's name has unusual characters.");
    /* code fields */
    function inList(f, tbl, label) { var v = rec[f]; if (!v) return; if (!tbl.some(function (x) { return x[0] === v; })) e(f, "EP-CODE", label + " code \"" + v + "\" is not valid. Allowed: " + tbl.map(function (x) { return x[0] + "=" + x[1]; }).join(", ") + "."); }
    inList("Gender", CODES.Gender, "Gender"); inList("relation", CODES.relation, "Relation"); inList("maritalStatus", CODES.maritalStatus, "Marital status"); inList("qualification", CODES.qualification, "Qualification");
    if (rec.salutation) inList("salutation", CODES.salutation, "Salutation");
    var nat = lists.nationality || CODES.nationality;
    if (rec.nationality) { if (!/^\d+$/.test(rec.nationality)) e("nationality", "EP-CODE", "Nationality must be a numeric EPFO code (India = 77)."); else if (nat.length > 1 && !nat.some(function (x) { return x[0] === rec.nationality; })) e("nationality", "EP-CODE", "Nationality code " + rec.nationality + " is not in the EPFO list.");  }
    if (rec.relation && rec.fatherHusbandName === "") { /* already required */ }
    if (rec.salutation && rec.Gender) { if (rec.salutation === "1" && rec.Gender === "F") w("salutation", "EP-CONS", "Salutation Mr. does not match gender Female."); if ((rec.salutation === "2" || rec.salutation === "3") && rec.Gender === "M") w("salutation", "EP-CONS", "Salutation Ms./Mrs. does not match gender Male."); }
    if (rec.relation === "H" && rec.Gender === "M") w("relation", "EP-CONS", "Relation is Husband but gender is Male.");
    if (rec.maritalStatus === "U" && rec.relation === "H") w("relation", "EP-CONS", "Relation is Husband but marital status is Un-married.");
    /* contact */
    if (rec.mobileNo) { if (!RX.mobile.test(rec.mobileNo)) e("mobileNo", "EP-MOB", "Mobile number must be exactly 10 digits."); else if (!/^[6-9]/.test(rec.mobileNo)) w("mobileNo", "EP-MOB", "Indian mobile numbers normally start with 6, 7, 8 or 9."); }
    if (rec.emailId) { if (rec.emailId.length > 100) e("emailId", "EP-LEN", "Email is longer than 100 characters."); else if (!RX.email.test(rec.emailId)) e("emailId", "EP-MAIL", "Email address is not valid."); }
    /* identifiers */
    if (rec.UAN && !RX.uan.test(rec.UAN)) e("UAN", "EP-UAN", "UAN must be exactly 12 digits.");
    if (rec.prvMemberId && !/^[A-Za-z0-9\/\-]{1,30}$/.test(rec.prvMemberId)) w("prvMemberId", "EP-ID", "Previous member ID has unusual characters.");
    if (rec.epfWages) { if (!/^\d+(\.\d{1,2})?$/.test(rec.epfWages)) e("epfWages", "EP-WAGE", "EPF wages must be a number such as 15000 or 14250.50."); else if (rec.epfWages.length > 8) e("epfWages", "EP-WAGE", "EPF wages can have at most 8 characters on the EPFO form."); else if (+rec.epfWages <= 0) e("epfWages", "EP-WAGE", "EPF wages must be more than zero."); else if (cfg.wagesCeilingWarn && +rec.epfWages > 1000000) w("epfWages", "EP-WAGE", "EPF wages look very high. Please check."); }
    if (rec.AadhaarNo) { if (!/^\d{12}$/.test(rec.AadhaarNo)) e("AadhaarNo", "EP-AADH", "Aadhaar number must be exactly 12 digits."); else if (!RX.aadhaar.test(rec.AadhaarNo)) e("AadhaarNo", "EP-AADH", "Aadhaar number cannot start with 0 or 1."); else if (cfg.checkAadhaarChecksum !== false && !verhoeff(rec.AadhaarNo)) w("AadhaarNo", "EP-AADHCK", "Aadhaar number fails the Verhoeff check digit test. Please re-check the number. (This is a typing check only; the tool does not authenticate Aadhaar.)"); }
    if (rec.PAN && !RX.pan.test(rec.PAN)) e("PAN", "EP-PAN", "PAN must be 5 letters, 4 digits and 1 letter (for example ABCDE1234F).");
    if (rec.Ifsc && !RX.ifsc.test(rec.Ifsc)) e("Ifsc", "EP-IFSC", "IFSC must be 4 letters, the digit 0 and 6 letters or digits (for example SBIN0001234).");
    if (rec.BankAccNo && !RX.acct.test(rec.BankAccNo)) e("BankAccNo", "EP-ACCT", "Bank account number must be 5 to 35 letters or digits.");
    if (rec.BankAccNo && !rec.Ifsc) w("Ifsc", "EP-BANK", "Bank account number is given without IFSC."); if (rec.Ifsc && !rec.BankAccNo) w("BankAccNo", "EP-BANK", "IFSC is given without a bank account number.");
    if (rec.BankAccNo && !rec.NameAsPerBank) w("NameAsPerBank", "EP-BANK", "Name as per bank account is blank.");
    if (rec.PAN && !rec.NameAsPerPan) w("NameAsPerPan", "EP-PAN", "Name as per PAN is blank.");
    /* name consistency */
    if (cfg.checkNameMatch !== false && rec.memberName && rec.NameAsPerAadhaar && rec.memberName.toLowerCase().replace(/[^a-z]/g, "") !== rec.NameAsPerAadhaar.toLowerCase().replace(/[^a-z]/g, "")) w("NameAsPerAadhaar", "EP-NAMEM", "Member name and name as per Aadhaar are different. EPFO expects the Aadhaar name.");
    /* consent */
    if (cfg.requireConsent !== false && rec.AadhaarNo && rec.aadhaarConsent !== "Y") w("aadhaarConsent", "EP-CONSENT", "Aadhaar consent is not confirmed for this member.");
    /* international worker */
    var iw = rec.isInternationalWorker === "Y";
    if (iw) {
      if (!rec.countryOfOrigin) e("countryOfOrigin", "EP-IW", "Country of origin is required for an international worker.");
      else if ((lists.countryOfOrigin || []).length && !lists.countryOfOrigin.some(function (x) { return x[0] === rec.countryOfOrigin; })) e("countryOfOrigin", "EP-CODE", "Country code " + rec.countryOfOrigin + " is not in the EPFO list.");
      else if (!(lists.countryOfOrigin || []).length) w("countryOfOrigin", "EP-VERIFY", "Country list is not loaded; the country code could not be checked. Load the EPFO code list in Settings.");
      if (!rec.passportNumber) e("passportNumber", "EP-IW", "Passport number is required for an international worker."); else if (rec.passportNumber.length > 10) e("passportNumber", "EP-PASS", "Passport number can have at most 10 characters on the EPFO form."); else if (!/^[A-Za-z0-9]{6,10}$/.test(rec.passportNumber)) w("passportNumber", "EP-PASS", "Passport number should be 6 to 10 letters or digits.");
      if (!rec.passportValidFrom) e("passportValidFrom", "EP-IW", "Passport valid-from date is required for an international worker.");
      if (!rec.passportValidTill) e("passportValidTill", "EP-IW", "Passport valid-till date is required for an international worker.");
      var pf = dateVal(rec.passportValidFrom), pt = dateVal(rec.passportValidTill);
      if (!isNaN(pf) && !isNaN(pt) && pt <= pf) e("passportValidTill", "EP-PSEQ", "Passport valid-till date must be after the valid-from date.");
      if (!isNaN(pt) && pt < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) w("passportValidTill", "EP-PSEQ", "Passport valid-till date is in the past. The EPFO form accepts only dates from today onwards.");
      if (!isNaN(pt) && !isNaN(doj) && pt < doj) w("passportValidTill", "EP-PSEQ", "Passport expired before the date of joining.");
    } else {
      ["countryOfOrigin", "passportNumber", "passportValidFrom", "passportValidTill"].forEach(function (f) { if (trim(rec[f])) w(f, "EP-IWOFF", LABEL[f] + " is filled but International worker is not ticked. It will be written to the file as it is."); });
    }
    /* differently abled */
    if (rec.isPhisicalHandicap === "Y" && !(rec.locomotive === "Y" || rec.hearing === "Y" || rec.visual === "Y")) w("isPhisicalHandicap", "EP-DA", "Differently abled is ticked but no disability type (Locomotive, Hearing, Visual) is selected.");
    if (rec.isPhisicalHandicap !== "Y" && (rec.locomotive === "Y" || rec.hearing === "Y" || rec.visual === "Y")) e("isPhisicalHandicap", "EP-DA", "A disability type is selected but Differently abled is not ticked.");
    /* field-delimiter safety: the delimiter must never appear in data */
    FIELDS.forEach(function (f) { if (s(rec[f]).indexOf(DELIM) >= 0 || /[\r\n]/.test(s(rec[f]))) e(f, "EP-DELIM", LABEL[f] + " contains the delimiter #~# or a line break, which would corrupt the file."); });
    return out;
  }
  function statusOf(issues) { var st = "green"; for (var i = 0; i < issues.length; i++) { if (issues[i].level === "error") return "red"; if (issues[i].level === "warn") st = "amber"; } return st; }
  /* duplicate detection over a set of records. Returns {index: [issue]} */
  function duplicates(recs) {
    var out = {}, maps = { UAN: {}, AadhaarNo: {}, BankAccNo: {} };
    recs.forEach(function (r, i) { ["UAN", "AadhaarNo", "BankAccNo"].forEach(function (f) { var v = trim(r[f]); if (v) (maps[f][v] = maps[f][v] || []).push(i); }); });
    Object.keys(maps).forEach(function (f) { Object.keys(maps[f]).forEach(function (v) { var ix = maps[f][v]; if (ix.length > 1) ix.forEach(function (i) { (out[i] = out[i] || []).push(issue(f, f === "BankAccNo" ? "warn" : "error", "EP-DUP", LABEL[f] + " is used by " + ix.length + " records (rows " + ix.map(function (x) { return x + 1; }).join(", ") + ")." )); }); }); });
    var seen = {}; recs.forEach(function (r, i) { var k = [r.memberName, r.DOB, r.DOJ].join("|").toLowerCase(); if (r.memberName && r.DOB) { (seen[k] = seen[k] || []).push(i); } });
    Object.keys(seen).forEach(function (k) { var ix = seen[k]; if (ix.length > 1) ix.forEach(function (i) { (out[i] = out[i] || []).push(issue("memberName", "warn", "EP-DUPN", "Same name, date of birth and date of joining appears in " + ix.length + " records (rows " + ix.map(function (x) { return x + 1; }).join(", ") + ").")); }); });
    return out;
  }

  /* ---------- file writing / reading ---------- */
  function lineOf(rec, cfg) {
    var vals = FIELDS.map(function (f) {
      var v = s(rec[f]);
      if (f === "isInternationalWorker" || f === "isPhisicalHandicap" || f === "locomotive" || f === "hearing" || f === "visual") v = toYN(v === "Y", cfg, f);
      return v;
    });
    return vals.join(DELIM);
  }
  function buildFile(recs, cfg) {
    cfg = Object.assign({}, DEFAULT_CFG, cfg || {}); var eol = cfg.eol === "\r\n" ? "\r\n" : "\n", lines = [];
    if (cfg.includeHeader) lines.push(HEADER);
    recs.forEach(function (r) { var ln = lineOf(r, cfg); if (ln.split(DELIM).length !== FIELDS.length) throw new Error("EP-30: a record does not have exactly 30 fields"); lines.push(ln); });
    return lines.join(eol) + eol;
  }
  /* Read an EPFO 30-field file. Returns {records, rejects:[{line,text,count}], headerSkipped}. */
  function parseEpfoTxt(text) {
    var out = { records: [], rejects: [], headerSkipped: false }, lines = s(text).replace(/^﻿/, "").split(/\r\n|\n|\r/);
    lines.forEach(function (ln, i) {
      if (!ln.trim()) return;
      var p = ln.split(DELIM);
      if (i === 0 || !out.headerSkipped && p[0].trim() === "UAN" && p.length === FIELDS.length && p[1].trim() === "prvMemberId") { if (p[0].trim() === "UAN" && p[1] && p[1].trim() === "prvMemberId") { out.headerSkipped = true; return; } }
      if (p.length !== FIELDS.length) { out.rejects.push({ line: i + 1, text: ln.slice(0, 200), count: p.length }); return; }
      var r = {}; FIELDS.forEach(function (f, k) { r[f] = p[k]; }); r._line = i + 1; out.records.push(r);
    });
    return out;
  }
  /* Convert a record read from a file (Yes/No in the file's own convention) into the internal form. isYes understands Y/Yes/1/True. */
  function fromRaw(raw, cfg) { return normalise(raw, cfg); }

  /* ---------- column mapping for Excel / CSV headings ---------- */
  var ALIAS = {
    UAN: ["uan", "universal account number", "uan number"], prvMemberId: ["prvmemberid", "previous member id", "previous pf account", "pf account number", "memberid", "member id"],
    memberName: ["membername", "name", "employee name", "member name", "name as per aadhaar member"], DOB: ["dob", "date of birth", "birth date", "birthdate"], DOJ: ["doj", "date of joining", "joining date", "date of joining epf"],
    Gender: ["gender", "sex"], fatherHusbandName: ["fatherhusbandname", "father husband name", "father's/husband's name", "father/husband name", "father name", "fathers name", "relation name"],
    relation: ["relation", "relationship", "relation with member"], mobileNo: ["mobileno", "mobile", "mobile number", "mobile no", "phone"], emailId: ["emailid", "email", "email id", "e-mail"],
    nationality: ["nationality", "nationality code"], epfWages: ["epfwages", "epf wages", "wages", "monthly epf wages", "monthly epf wages as on joining", "pf wages"], qualification: ["qualification", "education"],
    maritalStatus: ["maritalstatus", "marital status"], isInternationalWorker: ["isinternationalworker", "international worker", "iw"], countryOfOrigin: ["countryoforigin", "country of origin", "country"],
    passportNumber: ["passportnumber", "passport number", "passport no", "passport"], passportValidFrom: ["passportvalidfrom", "passport valid from", "passport from"], passportValidTill: ["passportvalidtill", "passport valid till", "passport valid upto", "passport expiry", "passport to"],
    isPhisicalHandicap: ["isphisicalhandicap", "differently abled", "physically handicapped", "disabled", "isphysicalhandicap"], locomotive: ["locomotive"], hearing: ["hearing"], visual: ["visual"],
    BankAccNo: ["bankaccno", "bank account number", "bank account no", "account number", "bank ac no"], Ifsc: ["ifsc", "ifsc code"], NameAsPerBank: ["nameasperbank", "name as per bank", "name as per bank account"],
    PAN: ["pan", "pan number", "pan no"], NameAsPerPan: ["nameasperpan", "name as per pan"], AadhaarNo: ["aadhaarno", "aadhaar", "aadhaar number", "aadhar", "aadhar number", "aadhaar no"], NameAsPerAadhaar: ["nameasperaadhaar", "name as per aadhaar", "name as per aadhar"],
    salutation: ["salutation", "title"], aadhaarConsent: ["aadhaarconsent", "aadhaar consent", "consent"]
  };
  function key(h) { return trim(h).toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function autoMap(headers) {
    var map = {}, used = {}; var idx = {};
    Object.keys(ALIAS).forEach(function (f) { ALIAS[f].concat([f]).forEach(function (a) { if (!idx[key(a)]) idx[key(a)] = f; }); });
    headers.forEach(function (h, i) { var f = idx[key(h)]; if (f && !used[f]) { map[i] = f; used[f] = true; } });
    return map;
  }
  function rowsToRecords(rows, headers, map) {
    return rows.map(function (row) { var raw = {}; for (var i in map) if (map[i]) raw[map[i]] = row[i]; return raw; });
  }

  root.EP = { VERSION: VERSION, DELIM: DELIM, FIELDS: FIELDS, HEADER: HEADER, EXTRA: EXTRA, LABEL: LABEL, CODES: CODES, YESNO: YESNO, DEFAULT_CFG: DEFAULT_CFG, QUALITY: QUALITY, ALIAS: ALIAS,
    blank: blank, normalise: normalise, validate: validate, statusOf: statusOf, duplicates: duplicates, lineOf: lineOf, buildFile: buildFile, parseEpfoTxt: parseEpfoTxt, fromRaw: fromRaw,
    normDate: normDate, dateVal: dateVal, verhoeff: verhoeff, verhoeffCheckDigit: verhoeffCheckDigit, isYes: isYes, autoMap: autoMap, rowsToRecords: rowsToRecords, digits: digits, trim: trim };
})(typeof window !== "undefined" ? window : globalThis);
