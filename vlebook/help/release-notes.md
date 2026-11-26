# VLEBook Release Notes

Published by {{entity}}. The version you are using is shown in **Settings** and in the footer of exported reports.

## Version 3.4.0 — 21 November 2026

- **Renewal & Expiry Reminders.** Vehicle insurance, pollution, tax, licences, permits, certificates and subscriptions in one list with overdue / today / 7-day / 30-day cards, a month calendar, filters and CSV. Editable schedules and message templates in English, Malayalam and Hindi. WhatsApp opens with the message ready and you press Send; VLEBook records *prepared*, *opened* and *sent (confirmed by you)*, never "delivered". Consent is required; duplicates are caught; renewals create the next reminder.
- **Original Documents & Privacy.** Register of customers' originals with printed receipt and return acknowledgement, barcode label, overdue and acknowledgement alerts, and a custody history that cannot be edited (Owner corrections with a reason). Consent register per purpose with notices in three languages, retention rules with legal hold, customer requests for a copy or deletion of their data (identity check, JSON / CSV export, deletion log), masked ID numbers.
- **Help & Support tickets.** Raise a ticket to Techmin from VLEBook, with optional screenshots that you preview and black out first; follow replies, confirm or reopen. Only what you type and choose is sent.
- **Print to any printer.** One print dialog everywhere: Windows print dialog, PDF download, or **direct to a printer** with the free **VLEBook Print Bridge** for Windows, which lists the installed printers and the features each driver reports (paper sizes, resolution, colour, two-sided, trays). New *Print & printers* workspace in the Studio prints any PDF or picture and a test page.
- **PVC ID & Print.** Open several files at once and mark any of them Front or Back in any order. Colour & quality settings can apply to front and back together (Auto) or separately, with a manual copy button. Turn the card between landscape and portrait (reflow or rotate). *Print to a printer…* sends 600 DPI front / back pages to the card printer. The *Edit profile* window was redesigned.
- **Sharper PVC cards, no shadow outlines.** A PDF area chosen for a card is now drawn again at 800 DPI instead of being enlarged from the 400 DPI preview; document pictures are no longer sharpened by default, and sharpening (when you ask for it) is limited so it cannot make light or dark outlines; card sheets are saved without JPEG compression; cards sent through the Print Bridge go at the printer's own resolution so the driver does not resample them; pictures are placed on whole pixels. The print dialog explains the card-printer settings that cause blur or a faint second image.
- **Fixed:** a second or third computer of the same centre no longer asks again for the GST registration type already saved on the main computer. Some dialogs in the Studio showed as a plain white box; they now show as normal dialogs.
- **Techmin console:** support ticket queue and a *Feedback* tab that shows the responses to every Techmin tool's feedback form.
- **Card designer:** circle, polygon / star, freehand drawing, date, serial number and watermark items; underline, letter spacing, shrink-to-fit and vertical alignment for text; crop and flip for pictures; Code 128, Code 39, EAN-13 and EAN-8 barcodes with a scan-size check; QR error correction; background picture and security pattern; safe zone; alignment to card or safe zone and distribute; warning when a font has no Malayalam or Hindi letters.
- **Templates and bulk cards:** template categories, search, duplicate and the last 10 versions; row checks for duplicate IDs, empty fields, dates, barcodes and photos, with correction in the table and *Only rows without problems*; an A4 basket for cards of different templates or orientations; the size of every print PDF is checked after it is made.
- **Card printers:** printer profile with back turned 180°, back mirror and manual two-pass two-sided printing (*Print the backs*); a two-page calibration sheet (front and back) with grid, rulers, colour patches and QR.
- **Printing everywhere:** resolution, reverse order, collate, custom scale, the printer's own settings window and printer status in the print window; a print queue with pause, reorder, retry and print again; 1 to 16 pages per sheet, label and receipt sizes and cut marks; Print buttons for invoices, receipts, reports, PDF Tools results, photo sheets, OCR results and scans; consumables with card cost, 1 / 10 / 50 / 100 card price table, usage count and low-stock warnings.
- **Privacy and support:** dashboard alerts for reminders, originals, privacy requests and support replies; retention rules for each document type (for example Aadhaar copies); a customer's data copy as a password-protected PDF with the data files attached inside; Techmin support staff sign in individually and their actions are logged.
- **Fixed:** the counts in the side menu (pending applications, low stock, reminders due, overdue originals) now change as soon as a record changes — for example when an application is marked Completed — without refreshing the page.
- **Print Bridge 1.2.0:** install once with **Install VLEBook Print Bridge.cmd** — it runs in the background with an icon in the notification area (no window), starts with Windows, and VLEBook connects to it automatically without a pairing code (only the VLEBook web address is trusted). Right-click the icon for status, log, Start with Windows and Quit. **Uninstall VLEBook Print Bridge.cmd** removes it.
- **Fixed:** Print Bridge 1.1.1 — the first download (1.1.0) did not start in Windows PowerShell 5.1 and could not take large print jobs; download it again.
- **Fixed:** the calibration sheet for A4 could not be made; alignment to the card edge left a 0.1 mm gap; choosing the same file again in Print & printers did nothing.
- **Known limits:** VLEBook does not add fonts (Malayalam and Hindi use the fonts on the computer); maker-specific card printer features are used through the printer's own settings window; VLEBook data on the computer is protected by Windows sign-in, not by separate encryption.
- **Learning Centre:** the Help screen is now *Learning Centre & Guides*. Lessons for every screen in English, Hindi and Malayalam with real screenshots, search, learning paths with progress, quick checks, guided tours that only point (never click), FAQs, glossary, What's new, and printable manuals (complete manual, quick start, staff training checklist). A **🎓 Learn** button on each screen opens its lesson. All documents are under *Guides & Legal*.
- **Offline start is more reliable:** VLEBook opens without internet even on web hosts that shorten page addresses (for example *about.html* → *about*). Your data, sign-ins and licence are not affected.
- **Sign in from the Features & Plans page:** a **Sign in** button (top right) and a note for existing users. On a computer where VLEBook is not set up, VLEBook now explains that there is no account there yet and points to *Join my centre* and *Restore from backup folder*.
- **Fixed:** printing Help documents could give a blank page after an invoice had been printed.
- **PVC ID & Print — fit documents to the card:** a tick box (on by default) auto-crops an uploaded document to the card's edges and resizes it exactly to the PVC card; untick it to place the whole picture and resize by hand with the new *Resize to card* buttons and Zoom. Hand-marked areas keep the card shape.
- **Open-source licences:** a new page in Help lists every open-source component included in VLEBook, its licence and what it is used for; the Terms link to it.
- **Productivity & Tools** (new menu item, Alt+T): **training mode** with a separate practice copy (sample data, PRACTICE bills, WhatsApp / backups / sync / Techmin switched off, per browser tab, reset); **keyboard shortcuts** (Alt+N, Alt+C, Alt+S, Alt+Q, Alt+P, Alt+A, Ctrl+Enter, Esc, ?) that you can change, with browser / Windows keys refused; **System health** (storage, protected storage, database read / write, data format, last backup, offline, update, errors, backup integrity test, diagnostic report previewed before saving); **Print meter** (printer / copier counter readings with photo, pages used vs billed, roll-over, reset / replacement, corrections with history, missing-reading and unusual-jump warnings, CSV, permissions).
- **Malayalam / Hindi names and addresses:** *Suggest* transliterates an English name or address into Malayalam or Hindi letters (offline, with alternatives; a word list for names, Kerala places and address words) and saves it with the customer as the local-script name / address. **Voice typing** 🎤 in the customer form uses the browser's online speech service, after a notice and with a review step.
- **Techmin notices** can now be sent to some states, districts, app versions, roles or users of certain screens, in Hindi and Malayalam, and can ask each user to confirm *I have read and understood*. Expired notices are hidden.
- Data format 11 (two new tables for the print meter). Learning Centre: six new lessons, glossary words and questions in English, Hindi and Malayalam.
- **Improved: QR, Stamp & Calculators.** The centre stamp is a proper round seal: the centre name curves around the top and the place around the bottom, with the label and date (or a blank line) in the centre; the text sizes itself to fit; the preview updates as you type; 600 × 600 transparent PNG. The age calculator now counts real calendar months (it was approximate before) and shows total days and the next birthday; GST (add or find GST, CGST + SGST or IGST), loan EMI and simple / compound interest show their results as you type; text cleanup shows the result with a Copy button.
- **Learning Centre:** new lesson *QR codes, centre stamp and calculators* (now 42 lessons). The printable manual has a new cover page (contents, lesson / question / glossary counts, guide version 1.1) and prints cleanly as a PDF in English, Hindi or Malayalam.
- **Plans and online payment:** 45-day free trial (1 month + 15 days); Standard ₹249 / Professional ₹299 / Premium ₹399 a month, or 12 months for the price of 11 (+ 18% GST). Buy or renew in Users & Licence with Razorpay; the licence is applied instantly and Techmin's GST tax invoice with receipt is emailed and kept in My invoices. Early renewals start after the current licence.
- **New sign-in screen** with features, real screenshots and plans, and a new *All features & plans* page, which is now the first page for new visitors.
- **Security:** online licences are signed by a separate key on Techmin's server and accepted only within the plan limits; Techmin can stop that key remotely.
- Legal documents updated to version 1.22 (Terms: plans, online payment, tax invoices; Refunds: online payments; Privacy: Razorpay and purchase records).
- Legal documents updated to version 1.21 (Privacy: notice confirmations and voice typing; Disclaimer: training mode, print meter and transliteration).

## Version 3.3.0 — 20 November 2026

- **PDF & Image Studio.** The Document Studio and PDF & Image Tools are now one screen with workspaces: PDF Tools, PDF Editor, Image Tools, Photo & Signature, OCR & Scanner, PVC ID & Print, QR / stamp / calculators and Job history. The old *PDF & Image Tools* menu link opens the PDF Tools workspace.
- **New PDF tools:** add / duplicate / crop pages and change page size; headers, footers and stamps; fill and flatten forms; view, edit and remove metadata; AES-256 password protection; secure redaction checked after saving; result preview with page navigation; Sort A–Z; Ctrl + Enter; WebP and page ranges for PDF to images.
- **PDF Editor:** change existing text inside the PDF (when its font allows), shapes, arrows, highlights, real PDF comments, zoom, search, undo / redo, Save As; warning for digitally signed PDFs.
- **Photo & Signature Studio:** an examination database covering Kerala, UPSC, SSC, NTA, banking, railway, defence, other central recruitment, all 28 State PSCs, Union Territories and admissions, each with a verification status and history; guided candidate workflow; exact pixel and KB control with min / max / target; GREEN / AMBER / RED validation; batch processing by file name; passport photo printing on A4 or 4 × 6 inch; custom profiles; export / import.
- **OCR & Scanner:** read text in English, Malayalam and Hindi from photos and scanned PDFs, with confidence highlighting, correction, TXT and searchable PDF; phone photos of pages to a clean PDF.
- **PVC ID & Print:** millimetre card designer with full colour and quality controls, templates, bulk cards from Excel / CSV / JSON, customer ID print sheets with card detection and Aadhaar masking by default, 600 DPI print PDFs, printer profiles, calibration sheet and honest print-job states.
- **iPhone HEIC photos** open in all image tools.
- Fixed: the old studio's "Combined PDF" button now really combines files (moved to PDF Tools); photo sizes now show the real file size instead of an estimate; the built-in test portrait was removed; image limits are never silently exceeded.
- Legal documents updated to version 1.18.

## Version 3.2.4 — 19 November 2026

- **Opening balances.** A new *Opening balances* tab in Books & GST lets you add, edit and delete the opening balance of any ledger — cash, bank, UPI and wallet accounts included — as Debit or Credit, with debit and credit totals and the difference shown. Every change is in the audit log.
- **Edit posted vouchers.** Vouchers you entered can now be edited after posting: VLEBook reverses the original on its own date and posts the corrected voucher as *original-R1* (R2 …), with the reason recorded. Automatic entries are still corrected through their bill, receipt or expense; locked periods stay locked.
- Legal documents updated to version 1.17.

## Version 3.2.3 — 19 November 2026

- **Automatic software updates.** VLEBook can now update itself: in Techmin Updates choose *Update automatically when the computer is idle* (default), *Ask me before updating* or *Do not check automatically*. Automatic updates wait until the computer has been idle for 2 minutes with no window or form open, show a 15-second notice with **Later** and **Update now**, and keep your data and any unfinished bill.
- **Emails from Techmin look better.** Messages are laid out professionally (13-point text, even line spacing, headings and lists) with a single greeting, and Techmin previews every email before it is sent.
- Legal documents updated to version 1.16 (automatic updates).

## Version 3.2.2 — 19 November 2026

- Legal documents updated to version 1.15: the Privacy Policy, Terms, Disclaimer and Refund Policy now cover the built-in GST HSN / SAC list (searched on your computer, nothing sent to Techmin; the centre chooses the correct codes). The User Guide and Errors & Solutions are updated too. Each user is asked once to accept the updated documents.

## Version 3.2.1 — 19 November 2026

- **GST HSN / SAC list built in.** The HSN / SAC master now has the full GST list of 22,479 codes (HSN codes of 4, 6 and 8 digits for goods and 6-digit SAC codes for services). Search it by code or by words (for example *photocopy*, *paper*, *9985*) and click **Use** — the code and its official description are filled in. Typing a code fills its description too, and a code that is not in the GST list is flagged. The list works offline.

## Version 3.2.0 — 19 November 2026

- **Professional invoice.** The A4 invoice and the PDF download now share one clean, professional layout: centre details and logo, Tax Invoice / Bill of Supply / Invoice with *Original for recipient* and payment status, a *Billed to* box with the customer's GSTIN, invoice number, date, place of supply and reverse charge, a full items table (HSN/SAC, government fee, taxable value, GST rate, CGST + SGST or IGST), a GST rate summary, amount in words, totals and an authorised-signatory block. The PDF looks exactly like the printed page.
- **Compulsory round off.** Every bill is rounded to the nearest rupee — 49 paise or less down, 50 paise or more up (₹10.47 → ₹10, ₹10.50 → ₹11). The option to switch it off was removed.
- **Round Off ledger.** The rounding difference is posted automatically to the *Round Off* ledger, shown as a separate line in Profit & Loss (income when net rounding gained, expense when net rounding given away). Books made earlier rename "Rounding off" to "Round Off" automatically.
- **Authorised signatory's signature.** Upload a photo or scan of the signature once in Settings & Centre Setup (with the signatory's name and designation, if you like). VLEBook removes the paper background, crops and fits it, and prints it above "Authorised Signatory" on every A4 invoice, its PDF and the thermal receipt.
- **HSN / SAC master** (GST-registered centres). Add, edit and delete the HSN codes (goods) and SAC codes (services) your centre uses in Books & GST → GST → *HSN / SAC master*, then choose them in Service Management and Stock & Inventory. Codes are checked (SAC: 6 digits starting with 99; HSN: 4, 6 or 8 digits); a code in use cannot be deleted, and renaming a code updates the services and items that use it. Centres without GST registration do not see this.
- **Edit an issued invoice.** Click **Edit** in the invoice list, change the services, customer or payment, give the reason and save. VLEBook issues a revised invoice with the same date and the number *original-R1* (R2 for a later revision) and cancels the original with a credit note, so money, stock and books stay correct and both invoices remain on record. A GST month already marked as filed cannot be changed this way; use a credit note instead.
- **Blog articles** in Techmin Updates now show only the title, date and a short summary of the article text — no pictures and no page code.
- Legal documents updated to version 1.14 (signature image, editing issued invoices).

## Version 3.1.2 — 19 November 2026

- **Blog articles from complypro.co.in now appear** in Techmin Updates → Blog. Blogger does not let other websites read its feed directly, so the Techmin registry reads the latest posts and passes on only the title, date, short summary, picture and link (as plain text). VLEBook sends no centre data with this request. Posts are kept on the computer so they show offline too.

## Version 3.1.1 — 19 November 2026

- **GST billing change notice.** A centre that saved its GSTIN before version 3.1 is now told, after the update, that every bill is a Tax Invoice (regular) or a Bill of Supply (composition). The Owner, Manager or Accountant confirms the registration in the same window — Regular, Composition (with the rate) or *Not GST registered* (removes the GSTIN, so bills are non-GST again). Until it is confirmed VLEBook asks again at each sign-in; other staff see the notice once. Nothing is sent to Techmin.

## Version 3.1.0 — 19 November 2026

- **GST follows your registration.** Not registered → VLEBook makes only non-GST bills. **Regular** GST dealer → every bill is a **Tax Invoice** (the non-GST option is no longer shown); CGST + SGST or IGST is chosen automatically from the place of supply or the customer's GSTIN. **Composition** dealer → **Bill of Supply** with the composition declaration; no GST is collected from customers. Add the GSTIN and choose Regular or Composition when you register, or later in **Books & GST → GST profile**.
- **Customer GSTIN** (optional) on the bill and in the customer record, printed on the tax invoice so a registered customer can claim input tax credit. A wrong GSTIN check character is shown at once.
- **Price + GST or price including GST** for each service (Service Management) and on each bill line, with a live "customer pays" preview. Services can also be marked **Exempt** or nil-rated.
- **GST rates** can be added, edited and deleted (with valid-from / valid-to dates) in GST profile. A rate still used by a service cannot be deleted.
- **GST returns help:** GSTR-3B table and JSON, CMP-08 quarterly figures for composition dealers, **Mark as filed** (locks GST documents in that period; the Owner can reopen with a reason) and **Record GST / TDS / composition tax payment** (challan).
- **Credit notes** for part of a bill (wrong rate, discount after billing) and **debit notes** to suppliers, both in the books and in the GST tables.
- **TDS on supplier payments** (rent, contractor, professional fees …) with section and rate under the Income-tax Act, 2025, the TDS register and TDS payment.
- **Bank reconciliation** line by line, **accountant review** marks and questions on vouchers, **Export to Tally (XML)**, and new reports: TDS, tax payments, credit/debit notes, top customers, accountant review.
- **No separate "direct cost" per service.** Paper, ink and other purchases are entered once as expenses, so profit is no longer reduced twice. Profit reports now use your actual expenses.
- **Sign-in record:** each sign-in and sign-out (user, time, computer, IP address and approximate city) is sent to Techmin for licence security and support, and which Techmin notices were seen. No business data is sent. See the updated Privacy Policy.
- **Join the VLEBook WhatsApp group** button in Techmin Updates, Help and the Techmin tab of the Service Catalogue. The separate Techmin menu was removed — its links are in the Techmin tab of the catalogue.
- Legal documents updated to version 1.12.

## Version 3.0.0 — 19 November 2026

- New: **Books & GST** — full double-entry accounts for the centre, kept automatically. Every bill, receipt, refund, cancellation, expense, transfer, AEPS entry, commission and portal payment is posted to the books by VLEBook; nothing has to be entered twice. Chart of accounts with ledgers and groups, vouchers (journal, payment, receipt, contra, sales, purchase, credit and debit notes), ledger statements, **Trial Balance, Profit & Loss, Balance Sheet and Cash Flow**, cash book, bank book, day book, registers, receivables, payables and more — 22 books and reports with search, sort, Excel, CSV and print.
- New: **Government fees are never your income.** When you pay a government fee (for example ₹50 for a community certificate) to a portal from your own cash, current account, UPI or wallet, VLEBook keeps it in **Government fee clearing**, against the customer and the application, until the customer pays it back. Only your service charge is income. A part payment never closes it; a cancelled application keeps any unrecovered fee visible. **Fee chain** shows the whole story for one application: bill → paid to the portal → received from the customer → books.
- New: on the bill, choose for each service **where the government fee was paid from** (wallet, current account, UPI or cash — it can differ every time), with the portal reference and status. **Record portal payment** is also in Pending Work and in Books & GST.
- New: **Wallets & portal fees** — wallet balances, minimum-balance warnings, estimated transactions left, pending / failed / disputed payments, refunds from the portal, duplicate-reference check and **wallet reconciliation** with differences kept open until resolved.
- New: **GST returns help** — GST profile with GSTIN check, sales register, B2B, B2C large and small, credit notes, HSN/SAC summary (B2B and B2C), rate-wise summary, nil and exempt, documents issued, cancelled documents and a 3B-style tax summary; **Excel workbook**, **GSTR-1 JSON** and an **error report** that lists every row to fix. Customer GSTIN and place of supply can be entered on GST bills. VLEBook prepares; you or your accountant file on the GST portal.
- New: **Expenses and supplier bills** with input GST, approval, part payments and supplier outstanding; **recurring expenses** (weekly, monthly, quarterly, yearly) that create drafts on the due date for you to confirm — never posted on their own.
- New: **Day close** in Books & GST: expected cash worked out from every entry, denomination count, a reason required for any difference, and the day is locked. Changes to a closed day need a **correction approved by the Owner** with before/after values; everything is in the audit log.
- New: **Books settings** — lock the books up to a date, close a financial year (1 April – 31 March), choose how part payments are split (government fee first by default), treat provider charges as pass-through or income, **permissions for each role** (new **Accountant** role) and an optional **Google review QR code** on receipts using your own review link.
- New: when the same financial record is changed on two computers at the same time, VLEBook no longer keeps only the later change: the other version is held as a **sync conflict** for the Owner to decide.
- Your earlier bills and payments are converted into the books when you click **Review and convert** — nothing existing is changed. Old government fees can be marked as already paid to the portal.

## Version 2.14.0 — 16 November 2026

- New: **Work on more than one computer.** Staff can work at the same time on two or more computers of the same centre. Each computer keeps working offline and shares bills, payments, customers, services, stock, applications, users and settings with the others through the centre's own **Google Drive backup folder** (Google Drive for desktop on every computer). Changes reach the other computers in about a minute. Turn it on in **Data Ownership & Backup → Work on more than one computer** (Owner).
- New: **Join my centre** on the first screen of a new computer. Choose the same Google Drive folder: the centre's users, customers, services and accounts are loaded, and staff sign in with their own user name and password. The new computer is added to the same centre with Techmin; it is not registered as a new centre.
- New: each computer has its **own invoice series** (for example VLE-A-1001 on counter A and VLE-B-1001 on counter B), so two computers never give the same number. Stock sold on different computers adds up correctly, and centre settings changed on different computers are merged.
- New: a **Sync** indicator at the top shows the counter letter and when data was last shared; click it to see every computer of the centre. *Start fresh* on one computer clears transactions on all computers.
- Licences: Techmin can issue a licence for **Any computer**, so every computer of the centre gets the full version.
- Fixed: in the Techmin registry a newly registered centre could be listed twice in the console.

## Version 2.13.0 — 16 November 2026

- New: **Techmin** tab in Government Service Catalogue & Portal Directory with ComplyPro, Finance and Accounting Tools, the Techmin Wealth Partners website and IFSC Tracker. These links are built in and cannot be edited or deleted.
- Security: only web addresses starting with https:// or http:// can be saved and opened in the catalogue; links in Techmin notices, blog posts and support details are checked the same way before they are shown.
- New: **Edit** for your own links in Government Service Catalogue & Portal Directory (title, group, state, address, fee guide, processing time, checklist and instructions), and **Delete** now asks for confirmation. Changes are written in the audit log.
- New: **Techmin** menu on the left with the same four websites, available in every mode including Basic mode.
- Fixed: a **cancelled invoice** no longer leaves a balance in Accounts, the Day Book or the Smart Counter. Money is returned from every account it came into (also payments collected later on the bill), the advance used is returned to the customer, and its commission and linked applications are cancelled. The Day Book now shows the actual money moved, with cancelled entries in red.
- New: **Start fresh** in Settings (Owner only) — clears transactions, payments and balances to zero while keeping users, operators, customers, services, stock items and settings. Offers a backup first and asks you to type START FRESH.
- Fixed: **↻ Check for new updates** now shows that it is checking, tells you whether VLEBook is up to date or a new version is available (with *Update now*), and refreshes notices and blog articles.
- Fixed: dates now follow the computer's local (Indian) time, so bills made just after midnight count for the new day.

## Version 2.12.0 — 15 November 2026

- New: **Physical Stock Check** in Stock & Inventory. Enter the stock counted on the shelf as on a date; a shortfall is booked as *Consumption (physical check)* and an excess as *Difference on physical check*. A reminder appears when a check is due (every 30 days by default).
- New: **Sell stock items on invoices** — pens, paper, pen drives or any item in Stock & Inventory. Each item has a selling price **including or excluding GST**, a GST rate and an HSN code; on a GST bill GST is charged on the item's full value. Stock decreases with the quantity sold and comes back if the bill is cancelled.
- New: **Negative stock alert** on the bill line, before saving, on the dashboard and in Stock & Inventory.
- New: **Application No., Acknowledgement No. and Tracking No.** for each service on a bill. They print on the invoice (A4, thermal and PDF), appear in the customer's 360° ledger (*Applications & reference numbers*) and in Pending Work, and can be added later with *Edit numbers*. Every change is written in the audit log.
- Changed: invoices show an **HSN/SAC** column when codes are set.
- Changed: an item's GST rate is never assumed — choose it for each product; a GST bill is not saved while an item has no rate.
- Changed: **Service Catalogue & Pricing** no longer comes with any commission amounts. Enter only the commission you actually receive; commissions pre-filled by older versions on the starter services are cleared if you never changed them.
- New: **What's new after every update.** The first time each user opens a new version, VLEBook shows what changed since they last used it, in their language. It works offline and is recorded in the audit log; the full list stays in Help & Legal → Release Notes.

## Version 2.11.0 — 15 November 2026

- New: **CV & Resume Builder** (full version). A step-by-step questionnaire (personal details, job goal, experience, education, skills, languages, certificates and more) with a live preview. Seven designs — Classic, Modern sidebar, Professional, Executive, Minimal, Job-portal (ATS) friendly and a **CV in the Europass format** with the CEFR language grid — in six colours. Show the designs to the customer, record the customer's approval, then print / save as PDF or download a Word copy. The CV contains only what is typed; the optional summary is built only from the answers.
- New: **Cancel work** in Application & Pending Work Tracker needs a reason; the reason, user and time are kept with the work and in the audit log.
- New: the **audit log records every activity from sign-in onwards** — screens opened, every record added, changed, cancelled or deleted, prints, file downloads, outside links, backups and restores — with search by user, activity, screen and date.
- New: **Stock & Inventory** — edit an item and correct its stock (saved as a stock adjustment with a reason), delete an item with a reason, and choose which item is deducted per printed page.
- Changed: Stock & Inventory starts empty — no sample items. Unused sample items from older versions are removed automatically.
- Changed: the CV & Resume Builder is part of the full version (14-day trial or paid licence); it is not available in Basic mode.

## Version 2.10.5 — 15 November 2026

- Fixed: **GST bills** did not charge GST because the default services were stored without GST. A GST bill now charges each service's GST rate on the service charge only (never on the government fee). Each bill line has a **GST %** column; services have a *No GST (0%)* option and an optional SAC code.
- New: GST bills print as **TAX INVOICE** with the centre GSTIN, place of supply, taxable value, CGST/SGST or IGST and round off (A4, thermal and PDF). A GST bill cannot be saved until the GSTIN is entered in Settings.
- Fixed: the **Backup needed** button stayed after clicking *Save Now*. Clicking *Backup needed*, or *Save Now* when a backup is due, now takes the backup at once, and the button clears in every open VLEBook tab.

## Version 2.10.4 — 15 November 2026

- Fixed: the first-time setup could stop with "Activation needs an internet connection" while the Techmin registry was being updated, even though the computer was online.

## Version 2.10.3 — 15 November 2026

- Fixed: when VLEBook opened for the first time, the main screen briefly showed sample details before the registration screen. A start-up screen is now shown until sign-in or registration is ready.
- Fixed: Chrome asked to save JSON and TXT backup files during registration. Automatic backups now start only after someone signs in, the backup clock starts fresh for a new centre, and scheduled backups are saved only to the chosen backup folder, never as download prompts. Without a folder, a **Choose backup folder** button reminds you.

## Version 2.10.2 — 15 November 2026

- **Automatic backup to Google Drive, OneDrive or Dropbox:** choose the service and a folder inside it; every backup is saved there automatically without asking, and the service's own app uploads it to your account.
- **Audit log for every sign-in:** successful and failed sign-ins, sign-outs, backups, restores and data resets are recorded with user, date and time. Entries are linked by a hash so changes can be detected, cannot be deleted in VLEBook, survive a data reset, and are copied to the backup folder. Download the full log as CSV in Settings.
- **Restore from backup folder** on the first screen brings back the latest backup and the full audit log after the browser's data was cleared, or on a new computer.
- VLEBook asks the browser to protect its storage from automatic clean-up.
- Documents updated in all three languages: Techmin keeps no copy of business data and gives no data assurance; GST invoice for every licence payment (Techmin Wealth Partners is registered under GST).

## Version 2.10.1 — 15 November 2026

- VLEBook is now marked **Early access** on the sign-in screen, in the menu and in the welcome email.
- **Activation online:** creating the Owner account and activating a licence now need an internet connection to {{entity}}. All other work continues offline.
- Clearer wording: no claims that VLEBook is a "complete" or "guaranteed" system; the default watermark in PDF tools is now "COPY".
- Help & Legal updated in English, Hindi and Malayalam: early access, internet and offline use, total price shown before payment, grievance timelines (acknowledgement within 48 hours, resolution within one month), the Digital Personal Data Protection Rules, 2025, and seller details.

## Version 2.10.0 — 15 November 2026

- **14-day full-version trial** for every new centre: all features, up to 3 users.
- **Paid licences by the month:** {{entity}} issues licences for 1 month or more. VLEBook shows **"Licence valid for N days"** (till the end date) at the top of the screen and in Users & Licence, counting down each day.
- **Basic mode** instead of a lock: when the trial or a licence ends (after 3 grace days), VLEBook keeps working for minimal tasks — customers, up to 10 invoices a day, pending work, dashboard, service catalogue, backup and restore. Only the Owner can sign in. Other screens show a FULL tag and open again as soon as a licence is activated.
- **New registration details:** type of centre, full address with PIN code (required), GSTIN (optional, validated), CSC ID (optional) and Akshaya Centre ID (required for Akshaya centres). These can also be edited in Settings and are printed on invoices.
- **Help & Legal in three languages:** every document — User Guide, Errors & Solutions, Release Notes, Terms & Conditions, Privacy Policy, Refund Policy and Disclaimer — is now available in English, Hindi and Malayalam.
- Fixed: the Help, Terms and Privacy pages at tools.complypro.co.in/vlebook/help.html now scroll with the mouse wheel.

## Version 2.9.0 — 15 November 2026

- **VLEBook logo** in the app, the sign-in screen and the browser tab.
- **Centre logo:** upload your centre's logo in **Settings & Centre Setup → Centre logo**. It appears at the top of the screen and on the dashboard, and is printed on A4 and thermal invoices, receipts and every PDF report.
- **New documents** in Help & Legal: Release Notes, Disclaimer and Refund Policy. User Guide, Errors & Solutions, Terms & Conditions and Privacy Policy updated.
- VLEBook is now published at **tools.complypro.co.in/vlebook/** along with the other ComplyPro tools.

## Version 2.8.0 — 15 November 2026

- **Sign-in and roles:** Owner, Manager and Operator accounts with a one-time Owner recovery code.
- **Licences without a server:** 14-day trial, licences signed by {{entity}} and delivered automatically, expiry warning, 3-day grace period, cancellation and suspension. A free launch licence is given to new centres during the launch period.
- **Registration and welcome emails:** sent from admin@techmincsc.in with the user name, Centre ID, Device Code and licence key. Passwords are never emailed.
- **Techmin Updates:** notices from {{entity}} (important ones pop up) and articles from the ComplyPro blog; optional push notifications in Chrome and Edge.
- **Automatic backup:** every hour and/or at times you choose, as JSON and TXT files named `CentreName_ddmmyyyy_hhmmss_am`, into a folder you choose.
- **Help & Legal:** User Guide, Errors & Solutions, Terms & Conditions and Privacy Policy.
- Professional look: decorative symbols removed; user initials in the header.

## Version 2.7.0

- **Stock & Inventory:** inward (purchases, returns, opening stock) and outward (sales, use in service, damage) entries, stock summary with valuation, movement ledger with reversal, reorder alerts. Paper used in billing is deducted automatically and returned when a bill is cancelled.
- Source-code download removed from the app.

## Version 2.6.0

- **PDF & Image Tools:** merge, split, organise, compress, edit, watermark and page numbers, PDF to Word, Excel, images or text, images to PDF, unlock; photo resize, compress, crop and enhance. Files are processed on your computer and never uploaded.

## Version 2.5.0

- **Staff commission** payable daily and monthly.
- **Languages:** English, Hindi and Malayalam across all screens, including billing.
- **Appearance:** Zoho Books and ERPNext style colours with Night mode.
- **Close warning:** VLEBook reminds you to save and back up before closing the tab.

## Known limits

- VLEBook runs in your browser and keeps data on your computer. Use automatic backup and keep a copy outside the computer.
- Automatic backup and push notifications work while the browser is running.
- Choosing a backup folder needs Google Chrome or Microsoft Edge on a computer.
- If the Hindi or Malayalam version of a document differs from the English version, the English version prevails.
