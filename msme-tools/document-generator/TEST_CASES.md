# Test Cases and Results - MSME Document Generator

Run on 2026-11-12. Result: **185 passed, 0 failed** of 185.

| ID | Area | Case | Expected | Result |
|---|---|---|---|---|
| E001 | Dates | 2024-02-29 is a valid date (leap year) | valid | PASS |
| E002 | Dates | 2025-02-29 is rejected (not a leap year) | rejected | PASS |
| E003 | Dates | 2100-02-29 rejected (century not leap) | rejected | PASS |
| E004 | Dates | 2000-02-29 valid (400-year rule) | valid | PASS |
| E005 | Dates | 31 April rejected | rejected | PASS |
| E006 | Dates | Month 13 and day 00 rejected | rejected | PASS |
| E007 | Dates | Wrong format 10-01-2026 rejected | rejected | PASS |
| E008 | Dates | fmtDMY 2026-01-05 -> 05-01-2026 | 05-01-2026 | PASS |
| E009 | Dates | addDays across leap day: 2024-02-28 + 2 = 2024-03-01 | 2024-03-01 | PASS |
| E010 | Dates | addDays across non-leap: 2025-02-28 + 1 = 2025-03-01 | 2025-03-01 | PASS |
| E011 | Dates | addMonths clamps: 31 Jan + 1 month = 28 Feb 2025 | 2025-02-28 | PASS |
| E012 | Dates | addMonths clamps in leap year: 31 Jan + 1 month = 29 Feb 2024 | 2024-02-29 | PASS |
| E013 | Dates | Financial-year boundary: 31-03-2025 is FY 2024-25, 01-04-2025 is FY 2025-26 | 2024 / 2025 | PASS |
| E014 | Dates | FY label 2099-00 rollover: 2099 -> 2099-00 | 2099-00 | PASS |
| E015 | Money | parseRupees 118000 -> 11800000 paise | 11800000 | PASS |
| E016 | Money | parseRupees "1,18,000.50" -> 11800050 | 11800050 | PASS |
| E017 | Money | parseRupees "0.1" -> 10 and "0.05" -> 5 (no float error) | 10 / 5 | PASS |
| E018 | Money | parseRupees rejects 3 decimals, negatives, letters, empty | null | PASS |
| E019 | Money | parseRupees rejects above ceiling | null | PASS |
| E020 | Money | fmtINR Indian grouping: 123456789005 paise -> 1,23,45,67,890.05 | 1,23,45,67,890.05 | PASS |
| E021 | Money | fmtINR small and negative: 5 paise, -123456 | 0.05 / -1,234.56 | PASS |
| E022 | Money | fmtINR 999.99 and 1,000.00 | 999.99 / 1,000.00 | PASS |
| E023 | Money | 0.1 + 0.2 style sums are exact in paise | 0.30 | PASS |
| E024 | Rates | Bank Rate on 2006-10-02 is 6.00% (no change 2003-2012) | 600 | PASS |
| E025 | Rates | Bank Rate 2012-02-13 is 9.50% (aligned to MSF) | 950 | PASS |
| E026 | Rates | Bank Rate peak 10.25% on 2013-07-15 | 1025 | PASS |
| E027 | Rates | Bank Rate 2020-05-22 is 4.25%, 2022-05-04 is 4.65% | 425 / 465 | PASS |
| E028 | Rates | Bank Rate 2026-10-06 is 5.50% and 2026-10-07 is 5.75% | 550 / 575 | PASS |
| E029 | Rates | Rate table is strictly increasing by date and every row verified | sorted | PASS |
| E030 | Rates | Bank Rate = repo + 0.25 for post-2019 rows (cross-check) | true | PASS |
| E031 | Rates | Custom (unverified) rate after table is used and marks result provisional | provisional | PASS |
| E032 | Rates | Calculation date beyond verified table raises MT-RAT-002 and provisional | warn | PASS |
| E033 | Due date | No agreement: delivery 10-01-2026 -> last day 25-01-2026, interest from 26-01-2026 | 2026-01-25 | PASS |
| E034 | Due date | Written agreement 30 days: last day 09-02-2026 | 2026-02-09 | PASS |
| E035 | Due date | Written agreement 45 days (maximum) accepted: 24-02-2026 | 2026-02-24 | PASS |
| E036 | Due date | Agreement 60 days capped at 45 with MT-LEG-004 | 2026-02-24 + warning | PASS |
| E037 | Due date | Agreement 0 days: due on delivery date | 2026-01-10 | PASS |
| E038 | Due date | Credit days flag off ignores credit days (15 days) | 2026-01-25 | PASS |
| E039 | Due date | Objection within 15 days, removed 20-01 -> acceptance 20-01, last day 04-02 | 2026-02-04 | PASS |
| E040 | Due date | Objection on day 15 counts (25-01), on day 16 ignored with MT-LEG-007 | ok | PASS |
| E041 | Due date | Objection not removed -> acceptance pending, no interest, MT-LEG-006 | pending | PASS |
| E042 | Due date | Objection before delivery -> MT-DAT-003 | error | PASS |
| E043 | Due date | Objection removal before objection -> MT-DAT-003 | error | PASS |
| E044 | Due date | Month-end delivery 31-01-2025 -> last day 15-02-2025 | 2025-02-15 | PASS |
| E045 | Due date | Delivery 20-12-2025 across year-end -> last day 04-01-2026 | 2026-01-04 | PASS |
| E046 | Due date | Delivery 16-02-2024 (leap) -> last day 02-03-2024 | 2024-03-02 | PASS |
| E047 | Due date | Delivery 14-02-2025 (non-leap) -> last day 01-03-2025 | 2025-03-01 | PASS |
| E048 | Interest | Payment on the last day -> no interest | 0 | PASS |
| E049 | Interest | Payment one day late -> exactly 1 day: 100000*16.5%/365 = 45.21 | 4521 | PASS |
| E050 | Interest | Hand calc: Rs 1,00,000, 15 days late at 16.50% (anniversary rests) = 678.08 | 67808 | PASS |
| E051 | Interest | Hand calc with calendar month-end rest: 271.23 for 6 days (26-31 Jan), then 407.95 for 9 days on the compounded amount | 27123 + 40795 = 67918 | PASS |
| E052 | Interest | Leap year: Rs 2,00,000, 29 days (Feb 2024) at 20.25% = 3217.81 | 321781 | PASS |
| E053 | Interest | Rate change + month-end: Rs 1,00,000 from 01-02-2025 to 28-02-2025 = 332.88 (20.25% x6d) + 1175.34 (19.50% x22d) | 150822 | PASS |
| E054 | Interest | Fixed-rate option keeps the first-day rate (20.25%) across the Feb-2025 cut | fixed 20.25% | PASS |
| E055 | Interest | Rate shown is 3 x Bank Rate (5.75% -> 17.25%) | 1725 | PASS |
| E056 | Interest | Interest outstanding with no payment equals accrued; principal unchanged |  | PASS |
| E057 | Interest | Calculation date before interest start -> zero interest | 0 | PASS |
| E058 | Interest | Calculation date equals last day -> zero interest | 0 | PASS |
| E059 | Interest | Compounding: interest bearing amount grows by capitalised interest at month-end | C>0 | PASS |
| E060 | Interest | Anniversary rests fall on 25th/26th: first rest on 25-02-2026 | 2026-02-25 | PASS |
| E061 | Interest | Anniversary rests from 31st start day clamp (start 31-01 -> rest 27-02 not 28-02) |  | PASS |
| E062 | Interest | Financial-year-end: interest crossing 31 March compounds at month-end and continues |  | PASS |
| E063 | Interest | Daily division is by 365 even in a leap year (Dec 2023->Mar 2024 span) | 365 | PASS |
| E064 | Payments | Part payments interest-first: payment 100 applied to interest before principal | principal unchanged | PASS |
| E065 | Payments | Part payments principal-first reduces principal | principal reduced | PASS |
| E066 | Payments | Payment before delivery (advance) reduces principal, no interest on it |  | PASS |
| E067 | Payments | Multiple part payments sum correctly (paidTotal) |  | PASS |
| E068 | Payments | Conservation: paid = principal paid + interest paid; invoice = principal paid + principal outstanding |  | PASS |
| E069 | Payments | Conservation: interest accrued = interest paid + interest outstanding |  | PASS |
| E070 | Payments | Overpayment gives MT-CAL-003 and surplus ignored | warn | PASS |
| E071 | Payments | Payment after the calculation date is ignored | ignored | PASS |
| E072 | Payments | Settled in full flag and zero outstanding when fully paid with interest | settled | PASS |
| E073 | Payments | Amount excluded from interest (GST) lowers interest base | less interest | PASS |
| E074 | Payments | Excluded amount equal to total -> no interest | 0 | PASS |
| E075 | Validation | Missing delivery date -> MT-DAT-001 | error | PASS |
| E076 | Validation | Invalid delivery date (30 Feb) -> MT-DAT-001 | error | PASS |
| E077 | Validation | Zero invoice total -> MT-INP-004 | error | PASS |
| E078 | Validation | Invalid calculation date -> MT-DAT-004 | error | PASS |
| E079 | Validation | Invalid payment date -> MT-DAT-005 | error | PASS |
| E080 | Validation | Zero payment -> MT-INP-005 | error | PASS |
| E081 | Validation | Agreement without credit days -> MT-INP-006 | error | PASS |
| E082 | Validation | Excluded amount above total -> MT-INP-007 | error | PASS |
| E083 | Validation | Delivery before Act in force (2006-10-02) -> MT-LEG-003 | error | PASS |
| E084 | Validation | Delivery on 2006-09-01 (last day 16-09-2006) still blocked | error | PASS |
| E085 | Validation | Delivery on 2006-10-01 (due 16-10-2006) is allowed | ok | PASS |
| E086 | Validation | validateInvoice flags missing party, number, dates, total | codes | PASS |
| E087 | Validation | validateInvoice accepts a complete record | none | PASS |
| E088 | Validation | Duplicate key ignores case and spaces | same | PASS |
| E089 | Eligibility | Micro, registered before contract -> ELIGIBLE | ELIGIBLE | PASS |
| E090 | Eligibility | Medium -> NOT_ELIGIBLE MT-LEG-002 | NOT | PASS |
| E091 | Eligibility | Registered after contract date (Mahakali) -> NOT_ELIGIBLE MT-LEG-010 | NOT | PASS |
| E092 | Eligibility | Registered on the contract date -> eligible | ELIGIBLE | PASS |
| E093 | Eligibility | No contract date falls back to delivery date | NOT | PASS |
| E094 | Eligibility | Unknown category / missing Udyam data -> REVIEW | REVIEW | PASS |
| E095 | Eligibility | Trader -> REVIEW with MT-LEG-011 | REVIEW | PASS |
| E096 | 43B(h) | Paid within 45 days (30-04-2026) -> no disallowance | 0 | PASS |
| E097 | 43B(h) | Paid one day late (01-05-2026) -> full taxable value disallowed in FY 2025-26 | 10000000 | PASS |
| E098 | 43B(h) | Unpaid -> disallowed and pending | pending | PASS |
| E099 | 43B(h) | Part paid in time, balance late: proportional disallowance | 5000000 | PASS |
| E100 | 43B(h) | Option: disallowance on total invoice value (incl. GST) | 11800000 | PASS |
| E101 | 43B(h) | No written agreement uses 15 days: delivery 16-03-2026 -> 31-03-2026 | 2026-03-31 | PASS |
| E102 | 43B(h) | Medium supplier -> NOT_COVERED |  | PASS |
| E103 | 43B(h) | Unknown category -> UNDETERMINED |  | PASS |
| E104 | 43B(h) | Udyam number missing -> UNDETERMINED MT-LEG-008 |  | PASS |
| E105 | 43B(h) | Registered after supply -> NOT_COVERED MT-LEG-010 |  | PASS |
| E106 | 43B(h) | Trader default excluded; include option -> REVIEW |  | PASS |
| E107 | 43B(h) | Capital item -> REVIEW MT-LEG-014 |  | PASS |
| E108 | 43B(h) | Expense before 01-04-2023 -> NOT_APPLICABLE; 31-03-2023 vs 01-04-2023 boundary |  | PASS |
| E109 | 43B(h) | Expense booked date overrides invoice date for FY | FY 2026 | PASS |
| E110 | 43B(h) | Law label: FY 2025-26 -> Income-tax Act 1961 s.43B(h); FY 2026-27 -> Income-tax Act 2025 s.37(2)(g) |  | PASS |
| E111 | 43B(h) | Taxable value above total -> MT-INP-008 |  | PASS |
| E112 | 43B(h) | Invalid payment date -> MT-DAT-005 |  | PASS |
| E113 | 43B(h) | Allocation across financial years: late payments in two different FYs |  | PASS |
| E114 | 43B(h) | Sum of allocations never exceeds disallowance (rounding safe) |  | PASS |
| E115 | Classification | 2020 limits: Rs 0.9 cr / Rs 4 cr -> micro; Rs 1.5 cr -> small |  | PASS |
| E116 | Classification | 2025 limits: Rs 2 cr / Rs 9 cr -> micro (was small before) |  | PASS |
| E117 | Classification | Boundary: exactly Rs 25 cr / Rs 100 cr (2025) -> small; above -> medium |  | PASS |
| E118 | Classification | Above medium -> large; date before 2020 -> MT-LEG-016 |  | PASS |
| E119 | Backup | Checksum is deterministic and sensitive to change |  | PASS |
| E120 | Registry | Every code used in source files exists in the error catalogue |  | PASS |
| E121 | Registry | Every error has code, title, explanation, cause, action, severity, continue flag, category |  | PASS |
| E122 | Registry | All 10 required error categories present |  | PASS |
| E123 | Registry | Every rule has id, description, provision, from/to, source, verification date, version, implementation note |  | PASS |
| E124 | Registry | Every rule source id exists in the source register |  | PASS |
| E125 | Oracle | 400 seeded random invoices (agreement, objections, part payments, all option combinations) match an independent Python Fraction/day-by-day implementation to the paisa | 0 mismatches | PASS |
| U001 | Save | Status starts "Auto save on"; after adding a company the database confirms and status shows All changes saved with time | saved | PASS |
| U002 | Save | Permanently visible SAVE button shows "All changes saved successfully." toast and stays visible when scrolling | toast | PASS |
| U003 | Save | Autosave is debounced: status passes through Unsaved changes and ends saved without pressing Save | autosave | PASS |
| U004 | Save | Never shows saved before the transaction completes: during a slowed write the status is Saving…/Unsaved, not saved | honest status | PASS |
| U005 | Save | Simulated save failure: status "Save failed", toast carries MT-DBS-003, work stays in memory; recovery on next Save | failed then saved | PASS |
| U006 | Database | Real IndexedDB write error (put throws): Save failed + MT-DBS-003, no false "saved" | failed | PASS |
| U007 | Database | IndexedDB unavailable: friendly fatal page with MT-DBS-001 (no crash) | fatal page | PASS |
| U008 | Database | Database open fails: MT-DBS-002 page | fatal page | PASS |
| U009 | Database | Read failure: MT-DBS-004, saving switched off to protect data | protected | PASS |
| U010 | Persistence | Data survives reload; auto-saved company, party and invoice come back | persisted | PASS |
| U011 | Persistence | Closing the page right after typing (beforeunload flush): data is kept | flushed | PASS |
| U012 | Persistence | Companies are isolated: invoices of one company never appear in another | isolated | PASS |
| U013 | Persistence | Unfinished invoice entry is recovered after the page is closed (MT-BKP-003) | recovered | PASS |
| U014 | Validation | Invalid date and missing fields are blocked with codes (MT-INP-002, MT-INP-004, MT-DAT-001) | blocked | PASS |
| U015 | Validation | Amount with 3 decimals rejected (MT-INP-004) | blocked | PASS |
| U016 | Validation | Duplicate invoice (same party, number, date) asks before saving a second copy | warned | PASS |
| U017 | Backup | JSON backup downloads with format marker, checksum and all data | downloaded | PASS |
| U018 | Backup | Restore (Replace all) into a fresh browser brings back company, party, invoice and payments | restored | PASS |
| U019 | Backup | Restore (Merge) twice does not duplicate records | no duplicates | PASS |
| U020 | Backup | Undo last restore returns data to the state before restore | undone | PASS |
| U021 | Backup | Corrupted (truncated) JSON refused with MT-IMP-001, nothing imported | refused | PASS |
| U022 | Backup | Not a backup file (valid JSON, wrong format) refused with MT-IMP-002 | refused | PASS |
| U023 | Backup | Edited backup fails the integrity checksum: MT-IMP-003 | refused | PASS |
| U024 | Backup | Backup from a newer schema refused: MT-IMP-004 | refused | PASS |
| U025 | Backup | Empty file refused (MT-IMP-001) | refused | PASS |
| U026 | Import | CSV import: valid row imported (DD-MM-YYYY dates, commas, payments, quoted notes); invalid date row skipped with codes | 1 imported, 1 skipped | PASS |
| U027 | Import | Duplicate import: importing the same CSV twice creates no duplicates (MT-IMP-008) | duplicates skipped | PASS |
| U028 | Import | CSV with wrong headings refused (MT-IMP-005) | refused | PASS |
| U029 | Import | TXT round trip: export TXT then import it into a second company restores the invoice and payments | round trip | PASS |
| U030 | Import | Invalid TXT (no header) refused: MT-IMP-007 | refused | PASS |
| U031 | Import | TXT with a block missing required values lists the row with codes (MT-IMP-006) and imports the others | partial | PASS |
| U032 | Interest app | Interest tab shows hand-checked figures (Rs 1,00,000, delivered 10-01-2026, paid 09-02-2026, interest to payment date 678.08 with anniversary rests) | 678.08 | PASS |
| U033 | Report | Report opens in a new window with summary, conventions, ledger, section 23 note and disclaimer | report | PASS |
| U034 | Report | Downloaded HTML report and CSV results are produced | downloads | PASS |
| U035 | Report | Popup blocked: MT-RPT-001 shown, no crash | warned | PASS |
| U036 | Report | Empty company: report refused with MT-RPT-002 | warned | PASS |
| U037 | Rate Master | Rate master lists verified rows; adding a new unverified rate marks results PROVISIONAL; duplicate date refused (MT-RAT-005); invalid rate refused (MT-RAT-004) | provisional | PASS |
| U038 | 43B(h) app | Checker: purchase paid 1 day late shows disallowance 1,00,000 for FY 2025-26 and ₹0 for a purchase paid in time | disallowance | PASS |
| U039 | 43B(h) app | Checker: medium supplier and supplier registered after supply are NOT covered; missing Udyam data -> Cannot decide | coverage | PASS |
| U040 | 43B(h) app | Checker report opens with FY summary, conventions and disclaimer | report | PASS |
| U041 | Notice app | Notice generated for an eligible invoice: contains buyer, 3x rate, MSEFC s.18, amount; saved to register; re-opened | notice | PASS |
| U042 | Notice app | Notice blocked for invoice of a supplier registered after the contract (MT-LEG-010); checkbox disabled | blocked | PASS |
| U043 | Notice app | Buyer-role company cannot create a notice (explanatory message) | message | PASS |
| U044 | Help | Help links open guide, error codes, release notes, privacy; error table lists every code; code chips open detail | help | PASS |
| U045 | Help | Help sections: legal methodology, troubleshooting, FAQ, tests, legal source register all render | sections | PASS |
| U046 | UX | Header always shows app name, version, SAVE, status, Help, Error Codes, Release Notes, Privacy | header | PASS |
| U047 | UX | Error chip opens the explanation modal with severity and corrective action | modal | PASS |
| U048 | UX | Mobile 390px: no horizontal page scroll on invoices and help; SAVE reachable | responsive | PASS |
| U049 | UX | Dark theme toggle persists across reload | theme | PASS |
| U050 | UX | Keyboard: Ctrl+S saves; Escape closes a dialog | keys | PASS |
| U051 | Security | Content-Security-Policy present; page makes no network requests outside its own origin | offline-safe | PASS |
| U052 | Offline | After first visit the app loads with the network switched off (service worker) | offline | PASS |
| U053 | Browser | Each app opens without script errors | no errors | PASS |
| U054 | Document app | Agreement: preview has parties, Udyam no., goods total 62,501.13 (60,250.00 + 2,251.13), payment article with 30 days, 3x Bank Rate, s.18; template articles present | agreement | PASS |
| U055 | Document app | Agreement: credit period 60 days refused (MT-LEG-004); bad goods line refused (MT-INP-013); missing required fields (MT-INP-011) | refused | PASS |
| U056 | Document app | Agreement: seller registered after the agreement date raises warning MT-LEG-017 (draft still produced) | warning | PASS |
| U057 | Document app | Affidavit: text follows the model (paragraphs 1 to n, annexures A to T, case no.), verification corrected to "do hereby verify" | affidavit | PASS |
| U058 | Document app | Affidavit: annexures out of order (T to A), age 10 and paragraph 0 refused (MT-INP-012) | refused | PASS |
| U059 | Document app | Buyer declaration: model text with claimant and respondent names, three numbered paragraphs | declaration | PASS |
| U060 | Document app | Save to register, then Re-open restores the typed values; Word download produced; print window opens | register | PASS |