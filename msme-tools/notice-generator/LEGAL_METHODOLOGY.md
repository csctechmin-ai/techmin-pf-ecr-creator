# Legal Methodology - Delayed Payment Notice Generator

This document explains how legal rules are turned into calculations. Every rule has an ID in the Legal source and rule register (`LEGAL_SOURCE_REGISTER.md`, also in the Help tab).

## 5. Calculation methodology

The notice uses the same interest engine as the Interest Calculator:

1. Day of acceptance and last day for payment as in the MSMED Act, section 15 (15 days, or the written agreement up to 45 days).
2. Interest from the next day at **3 × RBI Bank Rate** with monthly rests, up to and including the notice date.
3. Part payments are applied to interest first (default) or principal first (option).
4. The notice demands principal and interest up to the notice date, with further interest until payment, within the number of days you choose (default 15).

An annexure with the day-by-day working is attached to every notice. The conventions used are printed under the working.

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
