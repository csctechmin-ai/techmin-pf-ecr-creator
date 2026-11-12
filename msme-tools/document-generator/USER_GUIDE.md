# User Guide - MSME Document Generator

Prepare the sale-of-goods agreement, the claimant affidavit before the Facilitation Council and the buyer's declaration for a section 18 claim.

## 1. Installation guide

MSME Tools needs no installation file and no account.

**Option A - open from the web (easiest).** Open the address of the tool in Chrome, Edge, Firefox or Safari (a recent version). In Chrome or Edge, click the *Install* icon in the address bar to keep it like an app. After the first visit the tool also works with the internet switched off.

**Option B - run from a folder on your computer.**
1. Copy the whole `msme-tools` folder to your computer.
2. Open a terminal inside the folder and run `python3 -m http.server 8080` (or any static file server).
3. Open `http://localhost:8080/document-generator/` in your browser.

Opening `index.html` directly from the file system (`file://`) also works for entering data, but the browser will not install the offline copy in that mode (code MT-BRW-003).

**Offline use.** Visit the tool once while online. A service worker stores the files in the browser. From then on it opens without internet. Your data is always local.

**Updating.** Reload with Ctrl+F5. Your data is not touched by an update.


## 2. Getting started

1. Press **+ Company** and fill in your business details, including your Udyam number and registration date.
2. Open the **Parties** tab and add the other party with its full address.
3. Open **Create Document**, choose the document (agreement, affidavit or declaration) and the other party, fill in the boxes marked with a star, and press **Preview document**.
4. Print it, or download it as a Word file to place on your letterhead. Press **Save to register** to keep the entries so that the document can be re-opened and edited later.

Watch the status next to the **SAVE** button. It must say *All changes saved* before you close the page.

## 3. Company creation guide

Press **+ Company**. Fill in:

| Box | What to type |
|---|---|
| Business name | Full legal name. |
| In this company I am the | **Supplier** if you sell and are waiting for payment. **Buyer** if you buy from micro or small suppliers. |
| Address, e-mail, phone | Used on notices and reports. |
| My Udyam number, registration date, size category, activity | Needed when you are the supplier. Copy them from your Udyam certificate. |
| Authorised signatory, designation, place | Printed at the end of a notice. |

You can keep many companies. Use the box at the top of the page to switch. Each company has its own parties, invoices and notices. **Delete** removes the company and all its data after a confirmation; take a backup first.

## 4. Data-entry guide

**Dates** are chosen with the date box (the browser shows it in your computer's regional format, for example DD-MM-YYYY in India); reports always print DD-MM-YYYY. A date that does not exist (for example 31 February) is refused with a code.

**Amounts** are typed in rupees with at most two decimals, for example `118000` or `1,18,000.50`. The tool stores every amount as whole paise, so there are no rounding drifts.

**Invoice boxes.**

| Box | Meaning |
|---|---|
| Invoice date | Date printed on the invoice. |
| Date of contract / purchase order | Optional. Used to test whether the supplier was already registered when the contract was made. |
| Date of delivery / service rendered | Day of acceptance. The time limit counts from this date. |
| Written objection (date) | Only if the buyer objected in writing within 15 days of delivery. Then the time limit counts from the day the supplier removed the objection. |
| Payment period agreed in writing, credit days | Tick only if the written agreement exists. Maximum 45 days; a larger number is cut to 45. Without a written agreement the limit is 15 days. |
| Invoice total, taxable value | Total including GST, and value before GST. |
| Amount excluded from interest | Optional. Use it if your adviser excludes GST or another part from the interest base. |
| Date expense booked, nature of purchase | Used for section 43B(h). |
| Payments | One line per payment: date, amount and a reference. Add as many as needed. |

If you close the page while an invoice is half typed, the tool offers to **recover the unfinished entry** the next time you open it.

Duplicate protection: the tool warns when the same party, invoice number and date already exist.

## 5. Calculation methodology

This tool drafts documents; it calculates only what a document needs.

- **Sale-of-goods agreement.** Each goods line is *quantity × unit price* in whole paise (quantity up to three decimals, rounded to the nearest paisa). The total price is the sum of the lines. The payment article states the credit period you choose (0 to 45 days, a larger number is refused) from the day of acceptance, the 15-day rule for objections, interest at three times the RBI Bank Rate with monthly rests (section 16) and the reference to the Facilitation Council (section 18).
- **Seller's registration test.** If the seller's Udyam registration date is after the agreement date the tool warns (MT-LEG-017), because supplier status is judged on the date of the contract.
- **Affidavit and declaration.** Text is filled from your entries; paragraph numbers, annexure letters and age are checked.

The three documents follow the layout of the model forms supplied (Model Declaration Form, ODR Affidavit, Draft contract template). Where the model contained a typing slip (for example *do very* in the verification) the corrected wording is used.

## 6. Legal provisions explained

| Provision | Plain meaning |
|---|---|
| MSMED Act, 2006, s.2(b) | The *appointed day* is the day after 15 days from the day of acceptance. A written objection within 15 days moves the day of acceptance to the day the supplier removes the objection. |
| s.15 | The buyer must pay by the date agreed in writing (never more than 45 days after acceptance) or, with no written agreement, within 15 days. |
| s.16 | If the buyer does not pay, it owes compound interest with monthly rests at three times the RBI Bank Rate, whatever the contract says. |
| s.17 | The buyer must pay the price and the interest. |
| s.18 | The supplier or the buyer can refer the dispute to the Micro and Small Enterprises Facilitation Council, which must decide within 90 days. |
| s.19 | To challenge a Council award the buyer must first deposit 75% of the awarded amount. |
| s.22 | A buyer whose accounts are audited must disclose unpaid principal and interest in its annual statement. |
| s.23 | Interest paid or payable under the Act cannot be claimed as a deduction in computing income. |
| s.24 | Sections 15 to 23 override other laws. |
| Income-tax Act, 1961, s.43B(h) | A sum payable to a micro or small enterprise after the s.15 time limit is deductible only in the year it is actually paid. First year: 2023-24. |
| Income-tax Act, 2025, s.37(2)(g) | The corresponding rule from tax year 2026-27. |
| Supreme Court, Gujarat State Civil Supplies v Mahakali Foods (2022) | The supplier must be a registered micro or small enterprise on the date of the contract. Registration made later helps only for later supplies. |

Every rule above is stored with an ID, effective dates, the official source, the verification date and a status (*official*, *secondary* or *convention*) in the **Legal source and rule register** (Help tab). The full text of the Act was read from a reproduction of the Gazette text and the RBI rates from RBI pages; the register says which.

## 7. Report-generation guide

After **Preview document** you can **Print / PDF**, **Download Word (.doc)** (open in Word, add your letterhead, adjust the wording) and **Save to register**. The register keeps every entry you typed so you can **Re-open** and edit. If the browser blocks the print window (code MT-RPT-001), allow pop-ups.

Every document is a **draft for review by an advocate** before it is signed, sworn or filed. Affidavits must be sworn before a Notary Public or Oath Commissioner as the Council requires.

## 8. JSON backup and restore guide

Your data is stored only inside this browser. Browser resets, clearing site data, deleting the browser profile or a computer failure can erase it. **Take a JSON backup regularly** and keep a copy outside the computer (pen drive or mail it to yourself).

- **Backup:** Backup tab → *Download JSON backup*. The file holds all companies, parties, invoices, notices and custom rates, with an integrity checksum.
- **Restore:** Backup tab → *Restore from JSON backup*. The tool checks that the file is valid JSON, is a backup of MSME Tools, is not from a newer version and passes the checksum. Nothing is changed if any check fails. Then choose **Merge** (adds records that are missing) or **Replace all** (clears current data first).
- **Undo:** *Undo last restore* returns to the data as it was before the last restore.
- A banner reminds you if the last backup is more than 30 days old.

## 9. TXT and CSV import / export guide

The Backup tab can export and import the invoices of the current company as **CSV** (opens in Excel) or **TXT** (plain text).

- Press *Download CSV template* for the headings and one example row.
- **TXT** starts with the line `MSMETOOLS-TXT 1`. Each invoice is a block that starts with `[INVOICE]`, followed by `key=value` lines. Dates may be `YYYY-MM-DD` or `DD-MM-YYYY`. Payments are written `date:amount:note` and separated by `|`.
- On import every row is checked. Rows with problems are skipped and listed with codes. Rows that duplicate an existing invoice (same party, invoice number and date) are skipped, so importing the same file twice does not create copies. Missing parties are created automatically.

## 10. Error code reference

Every message carries a code such as `MT-DAT-005`. Click the code anywhere in the tool to read its explanation, cause and corrective action. The full list, with severity and whether you can continue, is in the Help tab (*Error code reference*) and in `ERROR_CODES.md`.

## 11. Troubleshooting guide

| Problem | What to do |
|---|---|
| The page shows *MSME Tools cannot start* with MT-DBS-001 | Use a normal (not private) browser window, allow site data, update the browser, reload. |
| Status shows *Save failed* (MT-DBS-003) | Your latest changes are not stored. Press *Download JSON backup* at once, free disk space, then press SAVE. |
| *Another tab needs this database* (MT-DBS-006) | Close other tabs of the tool and reload. Use one tab at a time. |
| Data seems missing after a browser clean-up | Restore your latest JSON backup (Backup tab). Browser clean-up can delete site data. |
| An invoice shows red codes in the list | Click it (or *Fix*) and correct the field named by the code. |
| Interest is marked PROVISIONAL | The calculation date is after 12 Nov 2026 or an unverified rate is used. Check the RBI site and add the rate in Rate Master. |
| Report window does not open | Allow pop-ups, or use *Download report (HTML)*. |
| Import skipped rows | Read the list of row numbers and codes; correct the file; import again. |
| Offline copy not working | Open the tool once online from an http(s) address; do not use `file://`. |

## 12. Frequently asked questions

**Does my data go to Techmin?** No. There is no server. All calculations and storage happen in your browser.

**Can I use it without internet?** Yes, after the first visit.

**Why is the interest rate three times the Bank Rate?** Section 16 of the MSMED Act fixes it.

**Is the contract rate ignored?** Yes. Section 16 applies notwithstanding any agreement, and section 24 gives the Act priority.

**What if the supplier registered on Udyam after the contract?** The Supreme Court held that supplier status is judged on the date of the contract, so the tool blocks the statutory claim for that invoice (MT-LEG-010).

**Why do you ask for the Udyam registration date?** To test the point above.

**Does section 43B(h) apply to medium enterprises?** No.

**What about traders?** The position is not settled in the sources read. The tool treats them as not covered by default with a warning; you can change the setting.

**Why does the tool ask me to choose conventions?** Because the Act does not say how to count days, when the monthly rests fall, or how part payments are applied. Your choice is printed on each report.

**A new RBI rate was announced after 12 Nov 2026. What do I do?** Add it in Rate Master. Results that depend on it are marked PROVISIONAL until you verify it.

**Where is the menu?** The sections of each tool are listed in the left-hand menu (a scrolling bar at the top on a phone). The links under the app name open Help, Error Codes, Release Notes, Privacy and Feedback.

**Can I undo a deletion?** Deletions are permanent. Take a backup first.

## 13. Privacy and data-storage guide

- Everything you type stays in **your browser's IndexedDB** on this computer. Light settings such as colour theme and the last company opened are kept in LocalStorage.
- The tool has **no server, no account, no tracking, no analytics and no third-party scripts**. The page's security policy only allows files from its own folder. No data about you or your invoices is sent to Techmin or anyone else.
- Calculations are done by your own computer. Reports are built on your computer and printed or saved by you.
- Browser storage can be lost through browser resets, clearing site data, deleting the profile or device failure. **Regular JSON backups are essential.**
- Anyone who uses the same browser profile can open the tool and see the data. Use a separate profile or log-out of the computer account if the computer is shared.
- To remove all data: delete the company inside the tool, or clear site data for the address in the browser settings.

## 14. Sending feedback

Press **Feedback** in the links under the app name. Choose what the message is about, add the error code if you saw one, write your message and press **Send by e-mail**. Your mail program opens with the message ready; press Send there. If no mail program opens, press **Save as file** and attach the text file to an e-mail to info@techmincsc.in.

- Nothing is sent automatically. The tool has no server, and your invoices, parties and company data are never added to the message.
- The message carries the tool name and version, the date and your browser name so that we can reproduce a problem. You can read exactly what will be sent in the saved text file.
- For a wrong legal rule or calculation, say which rule, which invoice dates and amounts you used, and what you expected. Anonymise names before sending.

## 15. **Limitations and professional review.** MSME Tools is a working aid. It applies the rules listed in the Legal source and rule register as understood on 12 November 2026. It does not give legal, tax or accounting advice. Several points are not settled by the statute or by the sources read (which Bank Rate applies over a long delay, the order in which part payments are appropriated, whether GST forms part of the interest base, whether suppliers who only trade are covered). The application shows each such point as a *convention*, lets you choose, and prints your choice on every report. Before sending a notice, filing a return, signing an audit report or making a claim before the Facilitation Council, have the result checked by a chartered accountant or an advocate. The built-in RBI Bank Rate table is verified up to 12 November 2026; later changes must be added by you in the Rate Master and are marked provisional until verified.