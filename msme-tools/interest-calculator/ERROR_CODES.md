# Error Code Reference

Every message in MSME Tools carries one of these codes. `Continue?` says whether you can carry on working after the message.

## Input validation

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-INP-001 | Party name missing | Error | No | The buyer or supplier name is empty or too short. | The field was left blank or has fewer than 2 characters. | Type the full legal name of the other party. |
| MT-INP-002 | Invoice number missing | Error | No | Every record needs an invoice or bill number. | The field was left blank. | Enter the invoice number exactly as printed on the invoice. |
| MT-INP-003 | Company name missing | Error | No | A company needs a name of at least 2 characters. | The company name box is empty. | Type the name of your business. |
| MT-INP-004 | Invoice amount invalid | Error | No | The invoice total must be a positive amount in rupees with at most two decimal places. | Letters, a negative number, more than two decimals, or zero was typed. | Enter an amount such as 118000 or 118,000.50. |
| MT-INP-005 | Payment amount invalid | Error | No | Each payment must be a positive amount with at most two decimals. | A payment line is blank, zero, negative or has too many decimals. | Correct or delete the payment line. |
| MT-INP-006 | Credit days invalid | Error | No | Written-agreement credit days must be a whole number of days (0 or more). | The credit days box is blank or contains text. | Enter the number of days agreed in writing, up to 45. |
| MT-INP-007 | Excluded amount invalid | Error | No | The amount excluded from interest cannot be negative or larger than the invoice total. | A wrong figure was typed. | Enter 0 or a figure not above the invoice total. |
| MT-INP-008 | Taxable value invalid | Error | No | Taxable value must be above zero and not more than the invoice total. | Taxable value is blank, zero or larger than the total. | Enter the value before GST, or choose 'Use full invoice value' in settings. |
| MT-INP-009 | Udyam number format looks wrong | Warning | Yes | Udyam numbers look like UDYAM-XX-00-0000000. | A typing mistake or an old Udyog Aadhaar number. | Check the certificate. You may continue, but the notice will print the number as typed. |
| MT-INP-010 | Notice period invalid | Error | No | The payment period in a demand notice must be a whole number of days from 1 to 90. | Blank or out-of-range entry. | Enter a number such as 15. |
| MT-INP-011 | Required document detail missing | Error | No | A detail that the document needs is empty. | A starred (*) box was left blank. | Fill in every box marked with a star. |
| MT-INP-012 | Paragraph, annexure or age entry invalid | Error | No | Paragraph count must be a whole number from 1, annexures must be single capital letters in order (for example A to T) and age must be 18 to 119. | A typing error. | Correct the entry and preview again. |
| MT-INP-013 | Goods line not understood | Error | No | Each line must be: Description | Quantity | Unit price. Quantity must be a positive number and unit price a positive amount in rupees. | A separator '|' is missing, or the quantity or price is not a number. | Example: Steel brackets | 500 | 120.50 |
| MT-INP-014 | Feedback message is empty | Warning | Yes | Write at least a few words about what you want to tell us before sending the feedback. | The message box was left blank or has fewer than 5 characters. | Describe the problem or suggestion. For a problem, include the error code and what you were doing. |

## Date validation

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-DAT-001 | Date of delivery / acceptance missing or invalid | Error | No | The date of actual delivery of goods or rendering of service is required and must be a real calendar date. | The date is blank, written in the wrong order, or does not exist (for example 31 February). | Pick the date from the date box (shown as DD-MM-YYYY). |
| MT-DAT-002 | Date is not a valid calendar date | Error | No | A date field holds something that is not a real date. | Typing error, impossible day or month. | Re-enter the date using the date picker. |
| MT-DAT-003 | Dates are in the wrong order | Error | No | A later event is dated earlier than an earlier event (for example objection removed before it was made). | Dates were swapped. | Correct the dates so they run in the order the events happened. |
| MT-DAT-004 | Calculation date missing or invalid | Error | No | The 'interest up to' date is blank or not a real date. | The date box was cleared. | Choose the date up to which interest is required. |
| MT-DAT-005 | Payment date invalid | Error | No | A payment line has a date that is blank or not a real date. | The date box in the payment row is empty. | Enter a valid date for every payment. |
| MT-DAT-006 | Expense date invalid | Error | No | The date on which the expense was booked (or invoice date) is not valid. | Blank or wrong date. | Enter the booking date or the invoice date. |
| MT-DAT-007 | Invoice date missing or invalid | Error | No | A valid invoice date is required. | Blank or impossible date. | Enter the date printed on the invoice. |
| MT-DAT-008 | Delivery date is more than a year before the invoice date | Warning | Yes | This is unusual and may be a typing error in the year. | A wrong year was typed. | Check both dates. You may continue. |

## Legal eligibility

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-LEG-001 | Supplier size category not known | Warning | Yes | Whether the supplier is micro, small or medium decides whether the Act and s.43B(h) apply. | Category left as 'Not known'. | Open the supplier's Udyam certificate and select the category. |
| MT-LEG-002 | Medium enterprise - statutory interest not available | Error | No | Sections 15 and 16 protect only micro and small enterprises. | The supplier is a medium enterprise. | Statutory interest cannot be calculated. Check the contract for contractual interest instead. |
| MT-LEG-003 | Interest period starts before the Act came into force | Error | No | The MSMED Act payment provisions started on 2 October 2006. | Delivery date is too old. | Check the dates. Claims before that date are outside this application. |
| MT-LEG-004 | Agreed credit period above 45 days reduced to 45 | Warning | Yes | The proviso to section 15 does not allow a written credit period above 45 days. | A longer period appears in the contract. | In calculations the application uses 45 days. When drafting an agreement it refuses a longer period. Keep a note of the contract wording. |
| MT-LEG-005 | Calculation conventions apply | Info | Yes | The Act does not fix day count, rest dates or appropriation order. The application has used the conventions shown in the Settings panel. | Normal notice shown with every statutory calculation. | Review the conventions and keep a copy of the report with the settings noted. |
| MT-LEG-006 | Acceptance pending - written objection not yet removed | Warning | Yes | A written objection within 15 days postpones the day of acceptance until the supplier removes it. | An objection date is entered but no removal date. | Enter the date the supplier removed the objection, or leave the objection blank. |
| MT-LEG-007 | Objection after 15 days ignored | Warning | Yes | Only a written objection made within 15 days of delivery postpones acceptance. | Objection is dated more than 15 days after delivery. | No action needed. The delivery date has been used as the day of acceptance. |
| MT-LEG-008 | Supplier Udyam number missing | Warning | Yes | Without the Udyam registration number, coverage cannot be confirmed. | Number not entered. | Enter the number from the supplier's Udyam certificate. |
| MT-LEG-009 | Udyam registration date missing | Warning | Yes | The date of registration is needed to test whether the supplier was registered when the contract was made. | Date not entered. | Enter the date shown on the Udyam certificate. |
| MT-LEG-010 | Supplier registered after the contract / supply date | Error | No | The Supreme Court held that supplier status is judged on the date of the contract; registration made later helps only for later supplies. | The Udyam registration date is later than the contract (or delivery) date. | Statutory interest and s.43B(h) cannot be treated as applicable to this invoice. Take professional advice. |
| MT-LEG-011 | Supplier is a trader - position not settled | Warning | Yes | Whether suppliers engaged only in trade fall within the MSMED Act protection and s.43B(h) is not settled in the sources read. | Supplier activity is set to 'Trading'. | Default: the invoice is treated as not covered. Change the setting if your adviser takes another view. |
| MT-LEG-012 | Expense is before FY 2023-24 | Info | Yes | Section 43B(h) applies from assessment year 2024-25 (financial year 2023-24). | Expense date is earlier than 1 April 2023. | No disallowance is computed for this invoice. |
| MT-LEG-013 | Medium enterprise - s.43B(h) does not apply | Info | Yes | Section 43B(h) covers only micro and small enterprises. | Supplier category is medium. | No disallowance is computed. |
| MT-LEG-014 | Capital purchase - professional review needed | Warning | Yes | For capital items the deduction is through depreciation, and the interaction with s.43B(h) needs review. | Nature of purchase is 'Capital'. | Ask your tax adviser how to treat this item. |
| MT-LEG-015 | Unpaid beyond the time limit | Info | Yes | Part of this invoice was not paid within the time limit and has not been paid since. | Payments are missing or late. | The amount stays disallowed until it is paid. |
| MT-LEG-016 | No classification limits for this date | Error | No | The helper has limits only from 1 July 2020. | An earlier date was chosen. | Use the Udyam certificate instead. |
| MT-LEG-017 | Seller registered after the agreement date | Warning | Yes | Supplier status is judged on the date of the contract. A seller whose Udyam registration is later than the agreement date may not get the protection of the MSMED Act under this agreement. | The seller's Udyam registration date is after the agreement date. | Check the registration date and the agreement date. Take professional advice before relying on sections 15 and 16. |

## Calculation

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-CAL-001 | Calculation could not be completed | Error | No | An unexpected condition stopped the calculation. | Unusual combination of dates or amounts. | Check the invoice entries and try again. If this persists, export a backup and contact support with this code. |
| MT-CAL-002 | Calculation period too long | Error | No | The interest period is longer than the safety limit of the calculator. | A very old date, or a typing error in the year. | Check the dates. Periods up to about 50 years are supported. |
| MT-CAL-003 | Payments exceed amount due | Warning | Yes | The payments are more than the principal and interest outstanding on that date. | Over-payment or advance payment. | The surplus is ignored in the calculation. Check the payment entries. |

## RBI rate data

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-RAT-001 | No Bank Rate found for the date | Error | No | The rate master has no rate in force on the interest start date. | Date is earlier than the first rate row (03-03-2003). | Check the dates. |
| MT-RAT-002 | Calculation date is after the verified rate data | Warning | Yes | The built-in Bank Rate table was verified up to 12-11-2026. The RBI may have changed the rate since. | You chose a later date, or the rate master is out of date. | Check the RBI site, add any new rate in Rate Master, and re-run. Results are marked PROVISIONAL meanwhile. |
| MT-RAT-003 | Unverified rate used | Warning | Yes | A rate entered by the user (not verified by the application) was used. | A custom rate row is in force during the period. | Verify the rate against the RBI press release and keep the reference. The result is marked PROVISIONAL. |
| MT-RAT-004 | Rate entry invalid | Error | No | A new rate needs a valid effective date and a Bank Rate between 0.01 and 30.00 per cent. | A typing error. | Re-enter using the format 5.75. |
| MT-RAT-005 | Rate already exists for that date | Error | No | A rate with the same effective date is already in the master. | Duplicate entry. | Change the date or delete the older custom entry. |

## Database

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-DBS-001 | Browser storage (IndexedDB) not available | Error | No | This browser cannot store data locally, so work cannot be saved. | Private browsing, blocked site data or an old browser. | Use a normal window of Chrome, Edge or Firefox, allow site data, then reload. Export files to keep work. |
| MT-DBS-002 | Database could not be opened | Error | No | The browser refused to open the local database. | Storage blocked, disk full, or the profile is damaged. | Close other tabs of this tool, free disk space, reload. Restore from a JSON backup if the data is missing. |
| MT-DBS-003 | Save failed | Error | Yes | The database did not confirm the save. Your latest changes are NOT stored. | Disk full, storage quota exceeded, or browser storage cleared. | Download a JSON backup now, free space, then press Save again. |
| MT-DBS-004 | Saved data could not be read | Error | No | The database opened but reading the records failed. | A damaged browser profile or interrupted write. | Reload. If it persists, restore the last JSON backup. |
| MT-DBS-005 | Save was cancelled by the browser | Error | Yes | The save transaction was aborted before it completed. | Another tab changed the database, or storage was reset. | Press Save again. Use only one tab of this tool at a time. |
| MT-DBS-006 | Another tab is blocking an update | Warning | Yes | A newer version of the database cannot be opened while another tab is open. | The tool is open in two tabs or windows. | Close the other tabs and reload. |
| MT-DBS-007 | Record not found | Error | Yes | The record you opened no longer exists. | It was deleted in another tab or by a restore. | Reload the list. |

## Import / export

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-IMP-001 | File is not valid JSON | Error | No | The file could not be read as a backup. Nothing was imported. | The file is damaged, cut short, or is not a backup file. | Pick the original backup file. Do not edit it in a text editor. |
| MT-IMP-002 | Not a backup from this tool | Error | No | The file does not carry the MSME Tools backup marker or belongs to a different tool. | A wrong file was chosen. | Choose a file exported from this tool's Backup tab. |
| MT-IMP-003 | Backup failed its integrity check | Error | No | The checksum stored in the file does not match its contents. Nothing was imported. | The file was changed or damaged after export. | Use another copy of the backup. |
| MT-IMP-004 | Backup is from a newer version | Error | No | The file was made by a newer version of this tool and cannot be read safely. | Version mismatch. | Update the application (reload with Ctrl+F5) and try again. |
| MT-IMP-005 | CSV headings not recognised | Error | No | The first row of the CSV must match the template headings. | A different CSV layout was chosen. | Export a CSV from this tool and use it as the template. |
| MT-IMP-006 | Some rows were skipped | Warning | Yes | One or more rows failed validation and were not imported. The list shows the row numbers and reasons. | Missing or invalid values. | Correct the file and import those rows again. |
| MT-IMP-007 | TXT file is not in the expected structure | Error | No | The text file must begin with the MSMETOOLS-TXT header and use [INVOICE] blocks. | A different text file was chosen or the structure was edited. | Export a TXT file from this tool and edit only the values. |
| MT-IMP-008 | Duplicate invoices skipped | Info | Yes | Invoices with the same party, invoice number and date already exist and were not added again. | Importing the same file twice. | No action needed. |
| MT-IMP-009 | File too large | Error | No | Files above 20 MB are refused to protect the browser. | Wrong file chosen. | Split the data into several files. |
| MT-IMP-010 | Export could not be created | Error | Yes | The browser could not build the download file. | Out of memory or download blocked. | Allow downloads from this site and try again. |

## Report generation

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-RPT-001 | Report window was blocked | Warning | Yes | The browser blocked the pop-up used for printing. | Pop-ups are blocked. | Allow pop-ups for this site, or use 'Download report (HTML)'. |
| MT-RPT-002 | Nothing to report | Warning | Yes | There are no invoices that can be calculated. | The list is empty or every invoice has errors. | Add invoices or fix the errors listed. |
| MT-RPT-003 | Report could not be generated | Error | Yes | Building the report failed. | An invoice contains data the report cannot show. | Open each invoice, correct red fields, and retry. |

## Browser compatibility

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-BRW-001 | Browser too old | Error | No | This tool needs BigInt and IndexedDB support. | An old browser. | Update Chrome, Edge, Firefox or Safari to a recent version. |
| MT-BRW-002 | Persistent storage not granted | Info | Yes | The browser may clear local data when disk space is low. | Browser policy. | Take a JSON backup regularly. |
| MT-BRW-003 | Offline installation not available | Warning | Yes | The service worker could not be registered, so offline use after install may not work. | File opened from disk (file://) or unsupported browser. | Serve the folder from a local web server or use the hosted copy once online. |

## Backup recovery

| Code | Title | Severity | Continue? | Explanation | Possible cause | Corrective action |
|---|---|---|---|---|---|---|
| MT-BKP-001 | Restore failed and was rolled back | Error | Yes | The restore could not be completed. Your existing data was kept. | Damaged file or a database error. | Try another backup copy. |
| MT-BKP-002 | No backup has been taken | Info | Yes | You have not downloaded a JSON backup yet. | First use. | Open the Backup tab and download a backup. |
| MT-BKP-003 | Unfinished entry recovered | Warning | Yes | An entry that was being typed when the page closed has been found. | The page was closed or crashed before saving. | Review the recovered entry and save or discard it. |
| MT-BKP-004 | Backup is more than 30 days old | Warning | Yes | Browser data can be lost. A fresh backup is advised. | No recent backup. | Download a JSON backup now. |
