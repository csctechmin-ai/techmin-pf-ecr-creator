# MSME Tools

Four independent, offline, browser-based tools for delayed payments to micro and small enterprises (version 1.0.0):

- **Delayed Payment Interest Calculator** - `interest-calculator/` - Compound interest at three times the RBI Bank Rate with monthly rests, as required by section 16 of the MSMED Act, 2006.
- **Section 43B(h) Applicability Checker** - `section-43bh-checker/` - Find which payables to micro and small enterprises are disallowed until actually paid under section 43B(h).
- **MSME Document Generator** - `document-generator/` - Prepare the sale-of-goods agreement, the claimant affidavit before the Facilitation Council and the buyer's declaration for a section 18 claim.
- **Delayed Payment Notice Generator** - `notice-generator/` - Prepare a demand notice for overdue MSME dues, with the interest working attached.

See `INSTALL.md` to run them, `LEGAL_SOURCE_REGISTER.md` for the legal basis and `TEST_REPORT.md` for the test results.

**Limitations and professional review.** MSME Tools is a working aid. It applies the rules listed in the Legal source and rule register as understood on 12 November 2026. It does not give legal, tax or accounting advice. Several points are not settled by the statute or by the sources read (which Bank Rate applies over a long delay, the order in which part payments are appropriated, whether GST forms part of the interest base, whether suppliers who only trade are covered). The application shows each such point as a *convention*, lets you choose, and prints your choice on every report. Before sending a notice, filing a return, signing an audit report or making a claim before the Facilitation Council, have the result checked by a chartered accountant or an advocate. The built-in RBI Bank Rate table is verified up to 12 November 2026; later changes must be added by you in the Rate Master and are marked provisional until verified.
