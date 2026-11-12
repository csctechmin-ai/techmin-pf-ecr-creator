# Legal Methodology - Delayed Payment Interest Calculator

This document explains how legal rules are turned into calculations. Every rule has an ID in the Legal source and rule register (`LEGAL_SOURCE_REGISTER.md`, also in the Help tab).

## 5. Calculation methodology

1. **Day of acceptance.** The delivery date. If the buyer objected in writing within 15 days, the day the supplier removed the objection.
2. **Last day for payment.** Acceptance date + agreed days (written agreement, maximum 45) or + 15 days (no agreement). Payment on or before this day attracts no interest.
3. **Interest starts** the next day.
4. **Annual rate** = 3 × RBI Bank Rate. Example: Bank Rate 5.75% gives 17.25%.
5. **Daily interest** = interest-bearing amount × annual rate × 1 ÷ 365 for every day, including the day of payment or the calculation date.
6. **Compounding.** At every monthly rest, the interest accrued so far is added to the amount that bears interest. Rests fall on calendar month-ends (default) or on the monthly anniversary of the first interest day (option).
7. **Rate changes.** By default the Bank Rate in force on each day is used. Option: keep the rate in force on the first day of interest.
8. **Part payments** are applied first to interest and then to principal (default) or the other way round (option). Payments on or before the last day for payment reduce the principal without interest.
9. **Rounding.** Interest is rounded to the nearest paise when it is posted (at a monthly rest, a part payment, a Bank Rate change and the calculation date). All money is held in whole paise.

The ledger for every invoice shows each period, the rate, the interest, the payment and the balances, so each figure can be checked by hand.

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
