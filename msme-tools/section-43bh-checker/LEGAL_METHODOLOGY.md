# Legal Methodology - Section 43B(h) Applicability Checker

This document explains how legal rules are turned into calculations. Every rule has an ID in the Legal source and rule register (`LEGAL_SOURCE_REGISTER.md`, also in the Help tab).

## 5. Calculation methodology

1. **Is the supplier covered?** The supplier must be a **micro or small** enterprise (not medium) with an **Udyam number** and a **registration date on or before the supply date**. Suppliers engaged only in trading are treated as *not covered* by default, with a warning, because the position is not settled; you can change this in Settings.
2. **Time limit.** Day of acceptance + agreed days (written agreement, maximum 45) or + 15 days.
3. **Paid in time.** Payments dated on or before the last day for payment, up to the invoice total.
4. **Beyond the limit.** Invoice total − paid in time.
5. **Disallowance in the year of the expense.** The beyond-limit part of the taxable value (or of the full value if you choose that in Settings), worked out in proportion.
6. **Allowed on payment.** Each payment made after the last day is allowed in the financial year in which it is made.
7. **Net effect for a year.** Disallowance of that year's expenses, less the part paid later in the same year, plus the deduction for earlier years' amounts paid this year.

Section 43B(h) applies to expenses of **financial year 2023-24 onwards**. Years up to 2025-26 fall under the Income-tax Act, 1961, section 43B(h). From 2026-27 the Income-tax Act, 2025 applies and the corresponding provision is stated as section 37(2)(g).

## Order of authority used

1. India Code and the Gazette of India; 2. Ministry of MSME; 3. Ministry of Finance; 4. Income Tax Department and CBDT; 5. Reserve Bank of India; 6. High Court and Supreme Court judgments.

In this build the RBI pages were read directly. The MSMED Act text, the Income-tax provisions and the case law were read from reproductions and reports (listed with their status as *secondary*), because India Code and the Income Tax Department pages could not be opened from the build environment. Nothing was taken from memory without being marked as a convention.

## Where the law is uncertain

The tool shows a warning and lets you choose, never silently decides:

- Which Bank Rate applies over a long period (rule R-CONV-RATE; a Delhi High Court decision is reported to be under appeal).
- When monthly rests fall (R-CONV-REST).
- Appropriation of part payments (R-CONV-APPROP).
- Whether GST is part of the interest base (R-CONV-BASE) and of the s.43B(h) disallowance (R-CONV-43BH-BASE).
- Whether suppliers engaged in trade are covered (R-CONV-TRADER).
- Whether the Mahakali test (registration at the date of the contract) applies to s.43B(h); the tool applies it by analogy and flags it.

**Limitations and professional review.** MSME Tools is a working aid. It applies the rules listed in the Legal source and rule register as understood on 12 November 2026. It does not give legal, tax or accounting advice. Several points are not settled by the statute or by the sources read (which Bank Rate applies over a long delay, the order in which part payments are appropriated, whether GST forms part of the interest base, whether suppliers who only trade are covered). The application shows each such point as a *convention*, lets you choose, and prints your choice on every report. Before sending a notice, filing a return, signing an audit report or making a claim before the Facilitation Council, have the result checked by a chartered accountant or an advocate. The built-in RBI Bank Rate table is verified up to 12 November 2026; later changes must be added by you in the Rate Master and are marked provisional until verified.
