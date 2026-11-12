window.GRDOCS = {
guide: `<h1>User Guide</h1><p class="meta">GSTR-2B Reconciliation &middot; Version 1.0.0 &middot; 12 November 2026 &middot; Techmin Wealth Partners</p>
<p>This tool compares your GSTR-2B (the credit the GST portal shows you) with your purchase books, line by line, and tells you what to fix before you claim input tax credit (ITC) in GSTR-3B.</p>
<h2>Quick start (5 steps)</h2>
<ol>
<li><b>Add a client</b> from the top bar (name, GSTIN). Each client keeps its own saved runs, 17(5) decisions and supplier follow-up.</li>
<li><b>Choose the period</b> on the Upload tab (month, quarter, year or custom dates).</li>
<li><b>Add GSTR-2B</b>: the JSON or Excel from the GST portal. Several months can be added; the same document in two files counts once.</li>
<li><b>Add purchase books</b>: Excel or CSV from Tally, Busy or any register. Check the column mapping, then press <b>Reconcile</b>.</li>
<li>Work through <b>Results</b>, then 17(5), Vendor follow-up and Deadlines. Download Excel, PDF or Word from the Download tab.</li>
</ol>
<p>No file handy? Press <b>Load sample data</b>. The sample companies are invented.</p>
<h2>The statuses</h2>
<table><tr><th>Status</th><th>Meaning</th></tr>
<tr><td>Matched</td><td>Same supplier GSTIN and invoice number (or an obviously equivalent number), amounts agree within your tolerance.</td></tr>
<tr><td>Mismatch</td><td>Paired, but taxable value or tax differs, a different tax head is used (for example IGST in 2B, CGST+SGST in books), or the GSTIN differs by one character. The reason is written against the row.</td></tr>
<tr><td>Probable match</td><td>Same GSTIN, same amount and a date within the window, but a different invoice number; or one document that equals the total of several entries. Confirm before relying on it.</td></tr>
<tr><td>Amended in 2B</td><td>The supplier amended the document (B2BA / CDNRA). Your books still carry the original, or the figures changed.</td></tr>
<tr><td>Not in Books</td><td>In 2B but not recorded by you. Record it, or ask the supplier if it is not yours.</td></tr>
<tr><td>Not in 2B</td><td>Booked by you but not in 2B. Includes duplicate entries and entries with no GSTIN.</td></tr></table>
<h2>The ITC statement</h2>
<p><b>A</b> (ITC as per 2B) &minus; <b>B</b> (in 2B, not in books) + <b>C</b> (in books, not in 2B) + <b>D</b> (difference on paired documents) = <b>E</b> (ITC as per books). The tool checks this equation on every run and warns if it fails. Credit notes carry a negative sign. Documents that 2B marks "ITC not available" are shown on a separate line.</p>
<h2>Matching order</h2>
<ol><li>Same GSTIN and invoice number (ignoring slashes, dashes, case and leading zeros).</li><li>Same GSTIN and the same trailing number (VPM/26-27/0045 and 45), when the tax agrees or the date is close.</li><li>2B amendments matched to the original number in your books.</li><li>GSTIN that differs by one character.</li><li>Same GSTIN, taxable value, tax and date within the window.</li><li>Same PAN, different state GSTIN.</li><li>One document against several entries (up to four) that add up to it.</li></ol>
<h2>Section 17(5)</h2>
<p>The tool flags entries whose supplier name, ledger or HSN/SAC suggests a blocked category. <b>A flag means check this, not that credit is blocked.</b> Mark each entry To review, Blocked or Eligible; use "Always block vendor" or "Always eligible" to remember a decision for a supplier. Only entries marked Blocked are deducted in the statement. Add your own words on the Master edit tab.</p>
<h2>Vendor follow-up</h2>
<p>Lists suppliers with ITC at risk, with the latest date to claim. Draft a message, copy it, and track the status. Statuses stay with the client so you can see next month who has replied.</p>
<h2>Deadlines</h2>
<p><b>Section 16(4):</b> shows the last date (30 November after the financial year) for each booked-but-unsupported document. <b>Rule 37:</b> if your books have a payment-date column, shows invoices paid after 180 days, unpaid past 180 days, or near the limit.</p>
<h2>Your books file</h2>
<p>Needs at least a supplier GSTIN and an invoice number. Better: date, taxable value, CGST, SGST, IGST, supplier name, HSN/SAC, ledger and payment date. Column names are recognised automatically (Tally "Supplier Invoice No.", "Input CGST @9%" and so on). If a column is wrong, use the mapping box; the choice is remembered for that layout. Press Download books template for a ready format.</p>
<h2>Saved runs and backup</h2>
<p>Save a run to keep the documents read from your files. Later, open it or compare it with a new run to see what has been resolved. The Backup tab downloads everything as one file. Browser storage can be cleared by the browser, so keep a backup.</p>
<h2>Feedback and support</h2>
<p>Use <b>Feedback</b> in the top menu to tell Techmin what worked, what did not and what you would like next. Choose the type (suggestion, problem, a legal rule or match that looks wrong, other), add the error code if you saw one, and write your message. The tool has no server, so press <b>Send by e-mail</b> to open your mail program with the message ready (to info@techmincsc.in), or <b>Save as file</b> and attach it to an e-mail. Your invoice data is never added automatically; if a problem needs a file to reproduce it, send a copy with names and GSTINs changed.</p>
<h2>Frequently asked questions</h2>
<p><b>Is my data uploaded anywhere?</b> No. Files are read and matched in your browser. Nothing is sent to Techmin or anyone else.</p>
<p><b>Why is a document &ldquo;Matched&rdquo; but still has a note?</b> Amounts agree, but the note points out something else to act on, such as 2B marking the ITC as not available.</p>
<p><b>Why is a flagged 17(5) entry still counted in E?</b> A flag is only a prompt to review. Only entries you mark Blocked are deducted.</p>
<p><b>The invoice in 2B is for next month. What do I do?</b> Add next month's 2B file too, or leave the 2B period filter off.</p>
<p><b>Can I use it for several clients?</b> Yes. Add each client on the top bar; runs, decisions and supplier follow-up are kept separately.</p>
<p><b>Does it work offline?</b> Yes, after the first visit. Keep a backup because browsers can clear stored data.</p>
<h2>Glossary</h2>
<table><tr><th>Term</th><th>Meaning</th></tr><tr><td>GSTR-2B</td><td>The auto-drafted statement of input tax credit available to you, generated monthly from your suppliers' returns.</td></tr><tr><td>ITC</td><td>Input tax credit: GST paid on purchases that can be set off against GST payable.</td></tr><tr><td>B2B / B2BA</td><td>Invoices from registered suppliers / amendments to them.</td></tr><tr><td>CDNR / CDNRA</td><td>Credit and debit notes / amendments to them.</td></tr><tr><td>Paise</td><td>All money is held in whole paise internally, so totals are exact.</td></tr></table>
<h2>Limits</h2>
<ul><li>Sections other than B2B, credit/debit notes and their amendments (ISD, imports, e-commerce) are not reconciled.</li><li>Rule 37A (supplier's GSTR-3B not filed) needs supplier filing data that is not in the 2B file; it is a reminder in the notes only.</li><li>The legal references are from secondary sources and need checking against the Act.</li><li>Tested on invented data. Please try your real files and send feedback on anything that does not read correctly.</li></ul>`,
release: `<h1>Release Notes</h1><p class="meta">GSTR-2B Reconciliation &middot; Version 1.0.0 &middot; 12 November 2026 &middot; Techmin Wealth Partners</p>
<h2 class="nn">Version 1.0.0 &ndash; 12 November 2026</h2>
<ul><li>First release: GSTR-2B JSON and Excel import (B2B, credit and debit notes, amendments B2BA and CDNRA).</li><li>Books import from Tally, Busy and generic Excel/CSV with automatic column recognition, a change option and remembered layouts.</li><li>Multi-pass matching: exact, number format, amendment, GSTIN typo, probable, same PAN, one-to-many.</li><li>Statuses: Matched, Mismatch, Probable match, Amended in 2B, Not in Books, Not in 2B.</li><li>ITC statement A - B + C + D = E with an automatic balance check; ITC-not-available line.</li><li>Section 17(5) flags with a rule register (provision, effective date, source) and a saved per-bill and per-vendor decision register.</li><li>Vendor ITC-at-risk summary with follow-up status saved across months and editable message template.</li><li>Section 16(4) deadline warnings and the Rule 37 180-day payment check.</li><li>Several clients, saved runs and comparison between runs.</li><li>Excel, PDF (print) and Word reports; option to hide supplier names.</li><li>Backup and restore with checksum; works offline.</li><li>Clean navy and teal appearance, plain menus, and professional User Guide, Error Codes and Release Notes (also as PDF).</li><li>Feedback form that opens your mail program or saves a text file; no data is attached automatically.</li></ul>
<h2 class="nn">Known limits</h2><ul><li>Developed and tested with invented data only. Real Tally, Busy and portal files may need a column to be mapped by hand the first time.</li><li>Legal references have not been verified against the bare Act.</li></ul>`,
privacy: `<h1>Privacy</h1><p class="meta">GSTR-2B Reconciliation &middot; Version 1.0.0</p><p>This tool runs entirely in your browser. The GSTR-2B and books files you choose are read on your computer and are never uploaded to Techmin or anyone else. Clients, saved runs and decisions are stored in this browser's own storage (IndexedDB). Clearing browser data removes them, so use the Backup tab. The Feedback form sends nothing by itself: it opens your mail program or saves a text file, and never attaches your data.</p>`
};
