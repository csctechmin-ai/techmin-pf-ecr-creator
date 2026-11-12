# Legal Methodology - MSME Document Generator

This document explains how legal rules are turned into calculations. Every rule has an ID in the Legal source and rule register (`LEGAL_SOURCE_REGISTER.md`, also in the Help tab).

## 5. Calculation methodology

This tool drafts documents; it calculates only what a document needs.

- **Sale-of-goods agreement.** Each goods line is *quantity × unit price* in whole paise (quantity up to three decimals, rounded to the nearest paisa). The total price is the sum of the lines. The payment article states the credit period you choose (0 to 45 days, a larger number is refused) from the day of acceptance, the 15-day rule for objections, interest at three times the RBI Bank Rate with monthly rests (section 16) and the reference to the Facilitation Council (section 18).
- **Seller's registration test.** If the seller's Udyam registration date is after the agreement date the tool warns (MT-LEG-017), because supplier status is judged on the date of the contract.
- **Affidavit and declaration.** Text is filled from your entries; paragraph numbers, annexure letters and age are checked.

The three documents follow the layout of the model forms supplied (Model Declaration Form, ODR Affidavit, Draft contract template). Where the model contained a typing slip (for example *do very* in the verification) the corrected wording is used.

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
