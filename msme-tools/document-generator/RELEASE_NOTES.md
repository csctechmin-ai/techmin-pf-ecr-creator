# Release Notes - MSME Document Generator

## Version 1.0.1 - 12 November 2026

- Feedback now opens the Techmin Google feedback form for MSME Tools in a new tab instead of opening your e-mail program. Save as file is kept for offline use.
- No change to calculations, rules or saved data.

## Version 1.0.0 - 12 November 2026

- First release of MSME Tools: Interest Calculator, Section 43B(h) Checker, Delayed Payment Notice Generator and Document Generator (sale-of-goods agreement, MSEFC affidavit, buyer's declaration).
- Fully offline, no server. Data kept in the browser (IndexedDB) with auto save, Save button, JSON backup and restore.
- Integer-paise arithmetic. Interest at three times the RBI Bank Rate with monthly rests; Bank Rate series verified from RBI sources up to 7 October 2026.
- Legal rule register with verification status for every rule. Conventions that the law does not fix are shown and selectable.
- Error code reference with 74 coded messages in 10 categories.
- Automated test suite and independent cross-check against a separate Python decimal implementation.
- Techmin Wealth Partners identity: logo in every header and printed report, a left-hand menu and a new statutory-ledger design with light and dark themes.
- Feedback form in the header (Feedback). It prepares an e-mail to Techmin or saves a text file; nothing is sent automatically.

## Known limitations

- The built-in Bank Rate table is verified up to 12 November 2026.
- Section numbers of the Income-tax Act, 2025 and the text of the MSMED Act were read from secondary reproductions; confirm on the official sites.
- Whether traders are covered, how GST is treated in the interest base, and which Bank Rate applies over a long delay are shown as conventions, not settled law.
- The tool does not file anything, e-mail anything or connect to the RBI, Udyam or GST portals.
- Inter font is not bundled; the system font is used so that the tool has no external dependency.