# Release Notes - Section 43B(h) Applicability Checker

## Version 1.0.0 - 12 November 2026

- First release of MSME Tools: Interest Calculator, Section 43B(h) Checker, Delayed Payment Notice Generator and Document Generator (sale-of-goods agreement, MSEFC affidavit, buyer's declaration).
- Fully offline, no server. Data kept in the browser (IndexedDB) with auto save, Save button, JSON backup and restore.
- Integer-paise arithmetic. Interest at three times the RBI Bank Rate with monthly rests; Bank Rate series verified from RBI sources up to 7 October 2026.
- Legal rule register with verification status for every rule. Conventions that the law does not fix are shown and selectable.
- Error code reference with 73 coded messages in 10 categories.
- Automated test suite and independent cross-check against a separate Python decimal implementation.

## Known limitations

- The built-in Bank Rate table is verified up to 12 November 2026.
- Section numbers of the Income-tax Act, 2025 and the text of the MSMED Act were read from secondary reproductions; confirm on the official sites.
- Whether traders are covered, how GST is treated in the interest base, and which Bank Rate applies over a long delay are shown as conventions, not settled law.
- The tool does not file anything, e-mail anything or connect to the RBI, Udyam or GST portals.
- Inter font is not bundled; the system font is used so that the tool has no external dependency.