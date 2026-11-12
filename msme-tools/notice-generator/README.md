# Delayed Payment Notice Generator

Part of **MSME Tools** by Techmin / ComplyPro. Prepare a demand notice for overdue MSME dues, with the interest working attached.

- Works fully **offline** in the browser. No server, no account, no tracking.
- Data is stored in your browser (IndexedDB) with auto save, a permanent SAVE button, JSON backup and restore, CSV and TXT import/export.
- All money is calculated in whole paise (no floating point).
- Version 1.0.1. Rule and rate data verified on 2026-11-12.

## Files

| File | Purpose |
|---|---|
| `index.html` | Open this in the browser |
| `app.js`, `core.css`, `lib/` | Application code (engine, rules and errors, shared UI) |
| `docs.js` | Built-in help |
| `manifest.webmanifest`, `sw.js`, `icon.svg` | Offline installation |
| `USER_GUIDE.md`, `LEGAL_METHODOLOGY.md`, `ERROR_CODES.md`, `TROUBLESHOOTING.md`, `RELEASE_NOTES.md`, `TEST_CASES.md`, `PRIVACY.md` | Documentation |

## Run locally

```
cd msme-tools
python3 -m http.server 8080
# open http://localhost:8080/notice-generator/
```

**Limitations and professional review.** MSME Tools is a working aid. It applies the rules listed in the Legal source and rule register as understood on 12 November 2026. It does not give legal, tax or accounting advice. Several points are not settled by the statute or by the sources read (which Bank Rate applies over a long delay, the order in which part payments are appropriated, whether GST forms part of the interest base, whether suppliers who only trade are covered). The application shows each such point as a *convention*, lets you choose, and prints your choice on every report. Before sending a notice, filing a return, signing an audit report or making a claim before the Facilitation Council, have the result checked by a chartered accountant or an advocate. The built-in RBI Bank Rate table is verified up to 12 November 2026; later changes must be added by you in the Rate Master and are marked provisional until verified.
