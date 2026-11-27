# Errors & Solutions

Find the message you see (or the problem) below. If it is not solved, contact {{entity}}: {{email}}{{phoneSep}}. Send a screenshot and your Device Code (Users & Licence).

## Licence and sign-in

### "Activation needs an internet connection"
Creating the Owner account and activating a licence are done online with {{entity}}. Connect the computer to the internet (Wi-Fi, broadband or mobile hotspot) and click the button again. If the internet works and the message continues, the Techmin service may be busy: try again after a few minutes, or contact {{entity}}. After activation, daily work continues offline.

### "Your 45-day full-version trial has ended. VLEBook now works in Basic mode"
The trial is over. Your data is safe and you can still add customers, make up to 10 invoices a day, track pending work and take backups. To use all features again, send your **Device Code** (Users & Licence) and payment to {{entity}} for a licence of 1 month or more. The licence arrives automatically when the computer is online, or paste the licence key you receive and click **Activate Licence**.

### "Your licence ended on …. VLEBook now works in Basic mode" / red strip "VLEBook will change to Basic mode in … day(s)"
Renew with {{entity}}. After payment, keep the computer connected to the internet and reopen VLEBook (or click **Check licence online** in Users & Licence), or paste the new key in Users & Licence. All features return at once.

### "This feature needs a VLEBook licence" / menu items with a FULL tag
In Basic mode, accounts, AEPS, commissions, staff, stock, studio, tools, reports and the vault need the full version. Buy or renew a licence in **Users & Licence**.

### "Basic mode allows 10 invoices a day, and today's limit is reached"
In Basic mode up to 10 invoices can be made each day; cancelled invoices do not count. Continue tomorrow, or buy a licence for unlimited invoices.

### "VLEBook is in Basic mode, so only the Owner can sign in"
Staff logins work only with a trial or paid licence. The Owner can sign in and work; staff can sign in again as soon as the licence is renewed.

### Licence shows "valid for N days" but I paid for more
The number of days counts from today to the end date of the licence, so it goes down every day. A 1-month licence shows about 30 days on its first day and a 2-month licence about 60 days. If the end date in Users & Licence is wrong, contact {{entity}} with your payment reference.

### "The licence key on this computer is for a different computer"
VLEBook keeps working (in the trial or Basic mode), but the licence is not applied. Licences are locked to a computer's Device Code. This happens on a new computer, a new Windows user, another browser, or after browser data was cleared. Send the Device Code shown on the screen to {{entity}} for a key for this computer.

### "This key is not genuine or has been altered" / "This is not a valid VLEBook key"
The key was not copied completely. Copy it again from the start (VLE1.) to the end, or use **Open licence file** with the .vlelic file you received. Do not edit the key.

### "This key was not issued for this copy of VLEBook"
The key was made for a different edition of VLEBook. Ask {{entity}} for a new key.

### "This licence has been cancelled" / "Your VLEBook account has been suspended"
VLEBook is locked in these two cases. Contact {{entity}} support. Your data is safe — use **Download backup of my data**.

### "Your computer date/time looks wrong"
The computer's date was set earlier than before. Correct the date, time and time zone (Windows: Settings → Time & language → *Set time automatically*), then reopen VLEBook.

### "Wrong user name or password"
User names are not case-sensitive; passwords are. Check Caps Lock. After 5 wrong attempts you must wait one minute.

### "Too many wrong attempts. Try again in … seconds"
Wait for the time shown, then try again.

### "This user has been deactivated"
The Owner has turned this account off. Ask the Owner to activate it in Users & Licence.

### Owner forgot the password
On the sign-in screen click **Forgot password?**, enter the user name, the **recovery code** and a new password. Lost the recovery code? Send your Device Code and user name to {{entity}}; you will receive a one-time reset code valid for 48 hours.

### "Your licence allows N user(s)"
Deactivate a user you no longer need, or ask {{entity}} for a plan with more users. The trial allows 3 users.

### "You do not have permission to do this" / screen missing from the menu
Your role does not allow it (for example, Operators cannot cancel bills or open Reports). Ask the Owner.

### Welcome email not received
Check the Spam/Promotions folder for mail from admin@techmincsc.in. The email is sent when the computer is online after setup; if the computer was offline it is sent at the next check-in. The licence is activated in VLEBook automatically in any case (Users & Licence). Ask {{entity}} to resend it if needed.

## Registration and centre details

### "Enter a valid 6-digit PIN code"
The PIN code must have exactly 6 digits and cannot start with 0.

### "Enter the full address of the centre"
Type the building name or number, street and place. District, state and PIN code are entered in their own boxes.

### "The GSTIN is not valid"
A GSTIN has 15 characters, for example 32ABCDE1234F1Z5: 2-digit state code, 10-character PAN, entity number, the letter Z and a check character. Copy it exactly from your GST registration certificate. If the centre has no GST registration, leave the box empty.

### "Enter the Akshaya Centre ID (required for Akshaya centres)"
When the type of centre is *Akshaya Centre*, the Akshaya ID given by Kerala State IT Mission must be filled in. If your centre is not an Akshaya centre, choose the correct type.

### "The CSC ID can have only letters, numbers, "-" or "/""
Enter the CSC ID exactly as shown in your CSC Digital Seva account, or leave it empty if you are not registered with CSC.

### Settings shows a red message under the centre profile and the change is not saved
The address, PIN code, GSTIN or Akshaya ID entered is not valid. Correct the field named in the message; the change is saved as soon as it is valid.

## Backups

### Backups are not reaching Google Drive, OneDrive or Dropbox
VLEBook saves the files into the folder you chose; the Google Drive, OneDrive or Dropbox app on this computer uploads them. Check that the app is running and signed in, and that the folder you chose is inside the Google Drive / OneDrive / Dropbox folder (Data Ownership & Backup shows the folder name). The audit log shows every save.

### "No VLEBook backup files were found in this folder"
Choose the folder that has files named like *CentreName_14112026_083015_pm.json*. If Google Drive shows files "online only", open the folder once so they are available on this computer.

### Audit log shows "Chain check: an entry was changed or removed outside VLEBook"
An entry in the browser's database or in the audit-log file was edited or deleted by something other than VLEBook. Keep the computer and the backup folder safe, download the audit log (CSV) for your records, and contact {{entity}} if you need help.

### "Choose backup folder" button at the top / Chrome asked to save JSON and TXT files
Automatic backups are saved only to the backup folder you choose, without any download prompts. Until a folder is chosen they are paused, and the **Choose backup folder** button stays at the top. Click it and pick your Google Drive, OneDrive, Dropbox or USB folder. **Back up now** in Data Ownership & Backup still downloads a copy when you ask for one.

### "Backup folder needs permission again" / "📁 Reconnect backup folder"
Chrome asks again for folder access after VLEBook is reopened. Click the button once and choose **Allow** (tick *Allow on every visit* if offered). Choosing *Allow on every visit* makes Chrome remember the permission. Until then automatic backups are paused and are not downloaded; the audit log records each one that was skipped.

### "This browser cannot save to a chosen folder"
Only Google Chrome and Microsoft Edge on a computer support choosing a folder. In other browsers backups go to the Downloads folder.

### "Could not write to the backup folder"
The folder was moved, deleted, renamed, or the USB drive was removed. Choose the folder again in Data Ownership & Backup → Automatic backup.

### Chrome shows "This site is trying to download multiple files"
Click **Allow** once so the JSON and TXT backups can both be saved.

### Automatic backup did not run
Backups run only while VLEBook is open (there is no server). Check that *Automatic backup* is on and that hourly backup or backup times are set. A missed backup runs within a minute after VLEBook is opened.

### "Checksum mismatch" when restoring
The TXT backup file was edited or damaged. Use another backup file. Never edit backup files.

### "Decryption failed: Invalid backup password"
The backup was made with a password. Enter exactly the same password.

### "Backup needed" stays at the top after I clicked Save
*Save Now* saves your current entries; a backup is a separate file. From version 2.10.5, clicking **Backup needed** (or *Save Now* when a backup is due) takes the backup at once — to the backup folder if connected, otherwise to Downloads — and the button disappears. If it does not, check that Chrome is allowed to download files for this site.

## Billing and daily work

### "Add at least one service to the visit before generating the invoice"
Choose a service and click **Add** before generating the bill.

### "A customer with this mobile number already exists"
Search the mobile number and use the existing customer.

### "Not enough stock: only … available"
Record the purchase first in **Stock Inward**, or correct the quantity.

### Malayalam/Hindi text prints as boxes
Use the PDF download, which always prints correctly. For direct printing, add a Malayalam/Hindi font in Windows (Settings → Fonts → *Download fonts for all languages*).

### The cash difference at day closing
Count again with the denomination calculator; check AEPS withdrawals (they reduce cash) and expenses paid in cash. A reason must be entered if a difference remains.

### "A GST bill needs your GSTIN"
A GST (tax) invoice can be issued only by a GST-registered centre. Add the GSTIN in **Settings & Centre Setup**, or choose **Non-GST Bill**.

### GST is not added on a GST bill / GST shows 0
GST is charged on the service charge only, at the service's rate. Check the **GST %** column of the bill line and the service's rate in **Service Management** (*No GST (0%)* means no GST). Government fees are never taxed. Bills saved before version 2.10.5 keep their old amounts — cancel and re-issue if needed.

### "Enter the reason for the stock correction" / "A reason is needed to delete an item"
Stock corrections and deletions are recorded in the audit log, so a short reason is required (for example *Physical count* or *Discontinued*).

### Stock & Inventory shows no items
From version 2.11.0 VLEBook does not add sample items. Add your own items with **+ New Item**.

### "Please write the reason (at least 5 characters)" when cancelling work
Type why the application is cancelled (for example *Customer withdrew*). The reason is saved with the work and in the audit log.

### "Negative stock" alert / "Stock will go negative"
More was sold or used than the stock in VLEBook. Usually a purchase was not entered. Record it in **Stock Inward**, or count the shelf and enter it in **Physical Stock Check**. A bill can still be saved after you confirm.

### "Physical stock check due"
No physical count has been saved for the number of days set on the Physical Stock Check tab (30 by default). Count the items and click **Save physical stock**, or change the number of days there.

### "The physical check date cannot be in the future" / "Enter the counted quantity of at least one item"
Choose today or a past date, and type a count for at least one item. Items left empty are skipped.

### The physical check made a "Consumption" or "Difference on physical check" entry I did not expect
The count is compared with the software stock **as on the chosen date**. If the date or the count was wrong, use **Reverse** on that entry in the Movement Ledger and enter the count again.

### "This item has no selling price yet"
Type the price in the Rate column of the bill, or set the selling price (and whether it includes GST) in **Stock & Inventory → Items → Edit**.

### GST on an item looks different from what I expected
If the item's price **includes GST**, VLEBook takes the GST out of the price (₹118 at 18% = ₹100 + ₹18 GST). If it **excludes GST**, GST is added on top. Check the setting in Stock & Inventory → Items. On a Non-GST bill no GST is charged.

### Reference numbers are not on an old invoice
Add them with **Edit numbers** in the customer's 360° ledger or in Pending Work, then print the invoice again. "Application or invoice line not found" means the bill was deleted or restored from an older backup.

## Centre logo

### "Use a PNG, JPG or WEBP image for the logo"
Save the logo as PNG, JPG or WEBP (for example with Paint: File → Save as → PNG) and upload again. PDF, SVG and other formats are not accepted.

### "The logo image is larger than 3 MB"
Use a smaller image, or reduce it with **PDF & Image Tools → Resize, Compress & Convert**, then upload.

### The logo looks blurred or has a black or grey box around it
Upload a clearer image at least 300 pixels wide. A logo with a transparent background on PNG gives the cleanest print. On thermal receipts the logo is printed in black and white.

### The logo does not appear on the invoice or PDF
Check that it shows in Settings → Centre logo. Then open the bill again and print or download the PDF. Logos are part of the centre settings and are included in backups.

## Display, speed and storage

### The Help, Terms or Privacy page does not scroll with the mouse wheel
This was fixed in version 2.10.0. Press **Ctrl + Shift + R** to load the latest version.

### VLEBook shows an old version after an update
Press **Ctrl + Shift + R**. If VLEBook is open in more than one tab, close the other tabs.

### "Storage is almost full" / app is slow
Download a backup, then delete old PDF tool results from your Downloads folder. Free some space on drive C:. Close other heavy browser tabs.

### All data is gone
Browser data was cleared, a different browser/Windows user/profile was opened, or the window is in private/incognito mode. Open VLEBook in the usual browser and profile. If the data is really gone, restore your latest backup (Data Ownership & Backup → Restore).

### "Leave site? Changes you made may not be saved"
VLEBook is reminding you that data changed since your last backup. Click **Cancel**, take a backup (or wait for the automatic one), then close.

## Notifications

### No push notifications arrive
Notifications must be turned on in **Techmin Updates → Turn on push notifications** and allowed in Chrome (lock icon in the address bar → Notifications → Allow). Windows must allow notifications for Chrome/Edge (Settings → System → Notifications). Chrome or Edge must be running (Chrome settings → System → *Continue running background apps when Google Chrome is closed*).

### "Notifications are blocked"
Click the lock icon in the address bar → Notifications → Allow, then reload VLEBook.

### Techmin notices or blog posts do not appear
They are fetched when the computer is online. Click **Check for new updates** in Techmin Updates. Blog articles come through the Techmin registry; if the Blog tab still says *No articles yet*, update VLEBook to 3.1.2 or later (Help & Legal → Check for updates) and try again after a minute.

### "Enter a full web address starting with https:// (or http://)" in the Service Catalogue
Type the complete address, for example *https://edistrict.kerala.gov.in*. Other kinds of links are refused for safety.

### I cannot delete a link in the Techmin tab
The Techmin links (ComplyPro, Finance and Accounting Tools, Techmin Wealth Partners website, IFSC Tracker) are part of VLEBook and cannot be deleted or edited. Links you added yourself can be deleted with ×.

### A catalogue link shows "Invalid link"
The link was saved by an older version without https:// or http://. Delete it and add it again with the full address.

## CV & Resume Builder

### "This feature needs a VLEBook licence" when opening CV & Resume Builder
The CV & Resume Builder is part of the full version (45-day trial or paid licence). It is not available in Basic mode.

### The printed CV has no colours or the side panel is white
In the print window open **More settings** and tick **Background graphics**, then print or *Save as PDF* again.

### How do I save the CV as PDF?
Click **Print / Save as PDF**, then choose **Save as PDF** as the printer and click **Save**. The file is named after the customer (for example *CV_Anjali_Nair.pdf*).

### "Some parts are still empty" before printing
VLEBook lists main parts that are not filled (name, phone or e-mail, a qualification, experience or "I am a fresher", key skills). Fill them, or print anyway if the customer agrees.

### The CV went back to "Draft"
The CV was changed after the customer approved it. Show the designs to the customer again and record the approval again.

### "Photo is too large" / "This file is not a photo"
Use a JPG, PNG or WEBP photo up to 8 MB. VLEBook resizes it to passport proportions.

### The Word copy looks plain
The Word copy has the text and headings only, for further editing. Use **Print / Save as PDF** for the designed CV.

### Is this the official Europass CV?
The Europass format follows the European CV layout and the CEFR language levels. It is not produced by or connected with the European Union. A customer who must apply on europass.europa.eu can use the official Europass editor there.

### I cancelled an invoice but Accounts / Day Book / counter still show the amount
Bills cancelled in version 2.13.0 or later are reversed in every account automatically. For a bill cancelled in an older version, record the refund in **Customers → ledger → Refund** (or an *Adjustment* in Accounts) for the money still showing. The Day Book lists the original bill and a red **CANCELLED** entry; together they come to zero.

### Where is "Start fresh" and what does it delete?
**Settings → Start fresh** (Owner only). It deletes transactions only — bills, payments, day book, counter closings, AEPS entries, commissions, payouts and stock movements — and sets balances and stock to zero. Users, operators, customers, services, stock items and settings stay. Restore a backup if you started fresh by mistake.

### "Check for new updates" says it could not check
The computer is offline or the server did not answer. Connect to the internet and click again. If it says a new version is available, click **Update now**; your data is not touched.

### A new computer shows the registration screen and no sign-in
This computer has no data yet. Do not create a new Owner account. Click **Join my centre (shared Google Drive folder)** at the top of the screen and choose the same Google Drive folder the main computer uses. If it says the folder is not shared yet, first click **Turn on** in *Data Ownership & Backup → Work on more than one computer* on the main computer and wait a minute.

### Staff cannot sign in on the second computer (only the Owner can)
The second computer is in Basic mode because the licence is locked to the main computer. Ask Techmin to issue the licence for **Any computer**; the second computer receives it when it is next online.

### Bills made on one computer do not appear on the other
Check that Google Drive for desktop is running and signed in with the same Google account on both computers, that the **Sync** button at the top does not say *Sync paused* (click **Reconnect backup folder**), and wait about a minute. Click **Sync now** in *Data Ownership & Backup* to check at once.

### Invoice numbers now have a letter (VLE-A-1001)
When the centre works on more than one computer, each computer has its own series so that two computers never give the same number. Earlier bills keep their numbers.

### "Debits (…) and credits (…) are not equal"
A voucher must balance. Add or correct a line so that the debit total equals the credit total, then post again. You can also **Save as draft** and finish later.

### "This entry comes from a bill, receipt or other document"
Vouchers made by VLEBook follow their documents. To change one, change or cancel the bill, payment or expense itself — the books correct themselves with a reversal.

### "The books are locked up to …"
The date is in a locked period (Books settings → Lock the books, or a closed financial year). The Owner can move the lock date back with a reason, or enter the correction in an open period.

### "The counter for … is already closed" / "… closed. An Owner-authorised correction is needed"
That day is closed. Open **Books & GST → Day close**, choose the day and click **Ask for a correction**. When the Owner approves it, the day is reopened; close it again after correcting.

### "Counted cash differs from expected … Enter the reason"
Give the reason for the shortage or excess (at least 5 characters). Tick *Post the difference* only if the count is final.

### "Provider reference … is already recorded on this account"
The same portal reference was already saved for this account, so it is not saved twice. Check **Wallets & portal fees** — the payment is probably already there.

### The Government fee clearing balance is not zero
The customer has not paid the full bill, the fee was paid to the portal but not yet collected, or the fee was collected but not yet paid to the portal. Click **Chain** to see which. Record the missing receipt or portal payment; only the Owner can write off a fee that will never be recovered.

### "Bill … from … is already entered"
That supplier bill number was entered before. Open Expenses and check; cancel the wrong one if needed.

### GST: "Check before export" shows problems
Each row says the document, the field and what to fix (for example a missing HSN/SAC code, a wrong GSTIN check character, or IGST used on an intra-State bill). Fix the service or bill and download again. The JSON is still made, but the GST portal may reject those rows.

### "Customer GSTIN: … check character"
One character of the GSTIN is mistyped. VLEBook checks only the format and the last (check) character — confirm the registration itself on the GST portal.

### "Only … is still due on this bill" (supplier bill)
You are paying more than is due. Reduce the amount; a part payment is fine.

### "You do not have permission to do this. Please ask the Owner."
Your role does not include that action. The Owner can change it in **Books & GST → Books settings → Who may do what**.

### A sync conflict is listed under Day close
The same bill, payment or other money record was changed on two computers at almost the same time. VLEBook kept this computer's version and held the other one. The Owner clicks **Compare** and chooses which to keep; the choice is shared with every computer.

### The Google review QR does not appear on receipts
Switch it on in **Books settings → Google review QR on receipts** with your own link from Google Business Profile (it must start with https:// and be a Google review link).

### "Your centre is not GST registered, so only a non-GST bill can be made"
Add your GSTIN in **Books & GST → GST → GST profile** (choose Regular or Composition and the date registration starts). Bills then follow your registration.

### "A composition dealer cannot collect GST"
A composition dealer issues a Bill of Supply without GST. If you have moved to regular registration, change it in GST profile with the date it starts.

### "Place of supply … is another State: IGST applies" / "is your own State: CGST + SGST apply"
The place of supply decides the tax. Leave it on your own State for local customers; choose the customer's State (or type their GSTIN) for customers from another State.

### "GSTR-1 / GSTR-3B / CMP-08 for … is marked as filed"
That return period is locked. Use a date in an open period, or ask the Owner to **Reopen** it in Books & GST → GST (a reason is recorded).

### "… % is used by … service(s) or item(s)"
A GST rate still used by a service or stock item cannot be deleted. Change those services first, or give the rate an end date instead.

### "A credit note can be at most …" / "Only … is still due on this bill"
A credit note reduces only the service charge and GST still due. For a bill already paid, cancel it (VLEBook makes the credit note and refund) and make a new bill.

### "TDS must be less than the amount paid" / "Choose a TDS section from the list"
Check the amount and the TDS section. TDS applies only above the yearly limits and depends on who pays; ask your accountant if unsure.

### "Challan … is already recorded"
That challan number was saved before; it is not saved twice.

### The sign-in record shows a different city
The city is looked up from the internet connection's IP address and often shows the internet provider's city. It is approximate.

### VLEBook keeps asking me to confirm the GST registration
Your centre's GSTIN was saved before version 3.1 and the registration type has not been confirmed yet. The Owner, Manager or Accountant chooses Regular, Composition or *Not GST registered* in that window and clicks **Confirm**; it is then not asked again. *Remind me later* asks again at the next sign-in. Staff without that permission see the notice only once.

### I cannot switch off the round off on a bill
From version 3.2 every bill is rounded to the nearest rupee (49 paise or less down, 50 paise or more up). The difference goes to the Round Off ledger in your books, so cash, bills and Profit & Loss always agree.

### "No signature was found in this image"
Sign in dark ink on plain white paper, then take a clear, well-lit photo or scan from straight above and upload it again. A very light or blurred photo cannot be used.

### "An HSN / SAC code has digits only" / "A SAC (services) code has 6 digits and starts with 99" / "An HSN (goods) code has 4, 6 or 8 digits"
Type the code without spaces or letters. Services use a 6-digit SAC such as 998599; goods use an HSN of 4, 6 or 8 digits such as 4802.

### "… is used by … service(s) or item(s). Change them first." (HSN / SAC master)
The code is still chosen for a service or stock item. Choose another code for them (or edit the code instead of deleting it), then delete.

### "Enter the reason for editing this invoice"
Editing an issued invoice needs a reason of at least 5 characters; it is printed on the revised invoice's record and written in the audit log.

### "This invoice is cancelled and cannot be edited"
A cancelled invoice — including one replaced by a revised invoice — cannot be edited. Edit the latest revision (the -R number) instead.

### Editing an invoice says the GST period is marked as filed
The original invoice's month is already filed, so it cannot be replaced. Issue a credit note (or a new invoice) in the current month.

### "… is not in the GST HSN / SAC list"
The code you typed is not in the GST list built into VLEBook. Search the list by words and click **Use**, or check the code with your tax adviser. You can still save it; it is marked *Not in list*.

### "The GST HSN / SAC list could not be opened"
The list is part of VLEBook and is downloaded with the update. Open Help & Legal → **Check for updates**, reload VLEBook once while online, then try again. Your own HSN / SAC master is not affected.

### VLEBook reloaded by itself / showed "Updating VLEBook to …"
Automatic updates are on (Techmin Updates → *Software updates on this computer*). VLEBook updates only after 2 minutes without use and with no window open, and keeps your data and any unfinished bill. Click **Later** to postpone, or choose *Ask me before updating* or *Do not check automatically*.

### The update notice keeps coming back
Click **Update now** once, or choose *Do not check automatically* and use **↻ Check for new updates** when convenient. If the computer is offline, updates wait until it is online.

### "A financial year is already closed, so opening balances can no longer be changed"
Opening balances belong to the start of your books. After a year is closed, correct the balance with a journal voucher dated in the open year.

### "Enter the amount without a minus sign and choose Debit or Credit"
Type the opening amount as a plain number and pick Debit (assets, expenses, money owed to you) or Credit (capital, loans, money you owe).

### "The opening debits and credits differ by …"
The opening balances do not agree. Check each one (for example capital, bank, customers and suppliers) until debits equal credits; until then the difference shows as *Difference in opening balances*.

### "Give the reason for changing this voucher" / "Only a posted voucher can be edited this way"
Editing a posted voucher needs a reason of at least 5 characters. A reversed voucher cannot be edited again — edit its latest corrected version (the -R number).

### "This entry comes from a bill, receipt or other document"
Automatic entries follow their documents. Edit or cancel the invoice, receipt or expense instead, and the books update by themselves.

### "This file type is not supported (the file contents were checked, not just its name)"
VLEBook checks what a file really is. Renaming a file does not change it — save it again as PDF, JPG, PNG, WebP or HEIC.

### "Even at the lowest quality this image is larger than … KB" / "over the … KB maximum"
The picture has too much detail for the size limit at that pixel size. Crop closer, use a plainer background, or check whether the portal allows a larger size. VLEBook will not quietly make a file bigger than the limit.

### "… below the … KB minimum. VLEBook does not add meaningless data"
The image is too small or too plain to reach the minimum size. Use a sharper, more detailed photo or scan, or check the required pixel size.

### "Official specification not verified"
The exam profile has no confirmed sizes. Type the width, height and KB limits from the official notification, or save a custom profile.

### RED / AMBER / GREEN results
RED: a size, format or limit is not met — the message says exactly which. AMBER: the sizes are met but the exam profile is not officially verified, or a manual check is needed. GREEN does not guarantee acceptance by the authority.

### "This text is not stored as one editable piece" / "fonts are embedded as partial subsets"
The PDF's own text cannot be changed safely here. Use *Text box over page* instead, or ask for the original document.

### "Verification failed: some redacted text could still be found"
Nothing was saved. Draw the redaction boxes a little larger, covering the whole words, and try again.

### "This HEIC photo could not be opened"
Some iPhone photos use newer formats. On the phone, share the photo as JPG (Settings → Camera → Formats → Most Compatible) and use that.

### "I cannot find OCR, Read text or Edit PDF"
These tools were removed in version 3.5.1. To turn paper into a PDF use **PDF & Image Studio → Document scanner**; to hide parts of a PDF use **PDF Tools → Redact (secure)**. Your saved data is not affected.

### Cards print in the wrong place or size
Print at *Actual size / 100%* with "Fit to page" off. Print the calibration sheet, measure the 100 mm lines and the corner marks, and enter the numbers in the printer profile.

## Version 3.4 — reminders, originals & privacy, support, printing

### "The customer has not agreed to reminders. Record consent first."
VLEBook prepares a reminder message only when consent is recorded. Ask the customer, then tick the consent box in the reminder or record it in **Originals & Privacy → Consent**. If the customer withdrew consent, reminders stay stopped until new consent is recorded.

### "A reminder for this … already exists"
The same customer, category, vehicle / document number and expiry date is already in the list. Open the existing reminder, or choose to save another one on purpose.

### WhatsApp did not open, or opened without the message
WhatsApp Desktop or WhatsApp Web must be installed or signed in on this computer. Check that the customer's mobile has 10 digits. VLEBook cannot press Send for you and cannot see whether a message was delivered; mark it sent only after you have sent it.

### "Custody history does NOT verify from entry …" in Originals & Privacy
An entry of the custody history was changed or removed outside VLEBook (for example by restoring an old backup over newer data). Restore the latest backup; if that is not possible, the Owner records a correction with the reason. Earlier entries are never edited.

### "Check the requester's identity before preparing an export"
Open the privacy request and use **Check identity** (in person with ID, call to the registered mobile, or authorised person with letter and ID). Only then can the copy of the data be prepared.

### "Choose a password of at least 8 characters for the protected PDF"
A customer's data export as a password-protected PDF needs a password of 8 or more characters. VLEBook fills in a strong one that you can change; tell it to the customer separately (in person or by phone), never in the same message as the file. The PDF opens in any PDF reader with that password; the data files are inside it as attachments (paper-clip panel).

### "Only the Owner can carry out a deletion"
Deleting a customer's data is limited to the Owner and needs DELETE typed to confirm. Invoices and accounts are kept as tax law requires and are shown as *kept*, with the reason.

### A support ticket cannot be sent / "This computer is not registered with Techmin yet"
Tickets need an internet connection and a computer registered with Techmin. Connect to the internet, open **Users & Licence → Check licence online** once, then send again; the text stays as a draft on this computer meanwhile. If you see "The screenshot is still too large after shrinking", crop it to the important part.

### The Print Bridge window shows red "Unexpected token" or "Missing argument" errors and closes
Print Bridge 1.1.0 (downloaded on 21 November 2026) could not start in Windows PowerShell. Delete the old folder, download the Print Bridge again from **Print & printers** (version 1.2.0 or later), extract `VLEBook-Print-Bridge-1.2.0.zip` and double-click **Install VLEBook Print Bridge.cmd** in the folder **VLEBook Print Bridge 1.2.0**. Point at the Print Bridge icon in the notification area to see its version; VLEBook warns in Print & printers when an older Bridge is running.

### "The VLEBook Print Bridge is not running on this computer" / printers are not listed
Install the Bridge once with **Install VLEBook Print Bridge.cmd** (from the ZIP in **Print & printers**). It then runs in the background with an icon in the notification area and starts with Windows. If the icon is missing, open the Start menu → **VLEBook Print Bridge**. If Chrome or Edge asks to allow access to devices on your local network, choose Allow, then click **Check again** in VLEBook. Without the Bridge you can still print with the Windows print dialog or download the PDF.

### Installer: "An older version of the VLEBook Print Bridge … was found"
The installer found a Bridge already on this computer. Press **Y** to uninstall the old version and install the new one (printer connection settings are kept), or **N** to keep the old one — nothing is changed. If it says a **newer** version is installed, keep it unless Techmin support asked you to go back. If the window closes with an error, run **Uninstall VLEBook Print Bridge.cmd** from the old folder, then install again.

### VLEBook asks for a pairing code
VLEBook connects to Print Bridge 1.2 by itself. A code is asked only when an older Bridge is running (VLEBook then shows "A newer Print Bridge is available" — install the new one) or when VLEBook is opened from another address. In that case click **Connect with a code** and type the 6-digit code shown in the Print Bridge notification (bottom right of the screen); it is valid for 3 minutes.

### The Print Bridge icon is not in the notification area
Click ^ next to the clock — Windows often keeps new icons in the hidden-icons area; you can drag it onto the taskbar. If it is not there, start **VLEBook Print Bridge** from the Start menu. To see what happened, right-click the icon → **Show log**, or run **Start VLEBook Print Bridge (window).cmd** from %LOCALAPPDATA%\VLEBook Print Bridge to see messages in a window.

### The print shows "Sent to Windows" but nothing came out
*Sent to Windows* means the Windows print queue accepted the job; it does not prove the page or card was printed. Use **Printer status** and **Check Windows queue** in the print window: an offline printer, paper or ribbon out, or a paused queue are shown when the driver reports them. Then mark the job **It did not print** so the record is correct.

### An option (two-sided, colour, tray, resolution) is missing in the print window
VLEBook offers only what the printer's driver reports to Windows. Open **Printer's own settings…** to use the maker's own features (for example ribbon type, K panel, overlay, magnetic encoding), or update the printer driver from the maker's website.

### The backs of PVC cards print upside down or mirrored
In **Edit profile** set *Back side* to **Turned 180°**, and only if your printer needs it (manual two-pass printing) set *Back mirror*. Print the two-sided calibration sheet to check before printing real cards.

### Manual two-sided printing: the backs do not match the fronts
After the fronts come out, put the printed cards back in the order and direction your printer's manual shows, then click **Print the backs**. Use the calibration sheet's back page to set the back shift in the printer profile.

### "Narrowest bar is … mm — too thin" / "The last digit should be … (check digit)"
Make the barcode wider or shorten the text so that the narrowest bar is at least about 0.19 mm and at least 2 printer dots. For EAN-13 type 12 digits and VLEBook adds the check digit, or type all 13 digits with the correct check digit.

### Malayalam or Hindi text on a card shows boxes
The card designer warns when the chosen font has no letters for that language on this computer. Choose **Nirmala UI** (built into Windows 10 and 11) or another installed Malayalam / Hindi font for that text box.

### Some rows are not selected for printing in bulk cards
The row check marks rows with a duplicate ID, an empty required field, a wrong date, a barcode that cannot be made or a photo file that was not added. Correct the value in the table (no need to import again) or remove the row; **Only rows without problems** selects the rest.

### The card cost shows ₹0 or looks wrong
Add the ribbon, cards and other consumables in **Print & printers → Consumables & card cost** with their cost and the number of prints or cards per pack. The cost is an estimate from what you entered.



### PVC cards look blurred or have a faint shadow / second image
Since 3.4.0 VLEBook prints PDF areas at full resolution and does not add sharpening halos. If cards are still soft: (1) choose the card area again from the PDF (pictures placed before 3.4.0 keep the old lower resolution); (2) set *Sharpness* to 0 in Colour & quality; (3) print at *Actual size / 100%*, never "Fit"; (4) in the card printer's own settings print black text and barcodes with the **black (K / resin) panel**, choose the ribbon type that is loaded, and run the printer's cleaning card — black printed as colour (YMC) and a dirty print head or roller are the usual causes of a faint second image.

### The card picture is cut in the wrong place, or the whole page appears on the card
With **Auto-crop & resize to the PVC card** ticked, VLEBook looks for a card-shaped area in the file. If it chose the wrong area: click the file and choose another area found (each shows a match %), or drag to mark the card yourself — **Keep the PVC card shape** keeps the right width : height. If no card was found (a message says so), the whole picture is placed: use **Resize to card → Auto-crop to the card edges**, or **Zoom** and *From left* / *From top* under Crop. To place the whole picture on purpose, untick Auto.

### The Learning Centre says it could not be opened, or a tour says a part is not visible
The Learning Centre is saved for offline use the first time it is opened with the internet; connect once and open it again. A guided tour points at parts of the real screen: if a part is not shown (it needs the full version, another role or another tab), the tour explains the step and you can press Next. Esc ends a tour at any time. Printed manuals: in the print window choose *Save as PDF* or your printer, *Portrait*, *A4*.

### Training mode: "… is switched off in training mode"
WhatsApp, backups to your folder, restore, sync and contact with Techmin do nothing while practising, so nothing real can be sent or changed. Click **Exit training** in the amber band to go back to your real data. If the band is not shown you are on real data.

### A keyboard shortcut does nothing or is refused
Billing shortcuts (Alt+S, Alt+Q, Alt+P, Alt+A, Ctrl+Enter) work only on the Billing screen. *?* does not work while the cursor is in a text box. Keys kept by the browser or Windows (Ctrl+W, Ctrl+T, Alt+F4 …) and keys already used for another action are refused; choose another, or *Reset to the original keys*.

### System health shows a warning or a problem
*Last backup*: take a backup now in Data Ownership & Backup. *Protected storage*: click *Ask to protect storage*; if the browser refuses, install VLEBook as an app and use it daily. *Data format* asks to finish an upgrade: close other VLEBook tabs and reload. *Database read / write* fails: take a backup, close other tabs, reload, run the checks again, then raise a support ticket and attach the diagnostic report if you wish.

### Print meter: billed pages are 0, or the difference looks wrong
Link the right print services to the counter (*Change this printer*). Readings are end-of-day readings: bills dated after the earlier reading up to the later reading are counted. A reading lower than the one before is treated as a counter roll-over — if it was a typing mistake, use **Correct**; if the technician reset the counter, record a *Counter was reset* reading with the old counter's last value.

### Malayalam / Hindi suggestion is wrong, or 🎤 is missing / refused
Suggestions are transliteration and can be wrong for unusual names: tap the nearest one and correct it. 🎤 appears only in browsers with voice typing (Chrome, Edge) and needs the internet. If the microphone was refused, click the lock icon in the address bar → Microphone → Allow, then try again.

### Online payment: money was taken but the licence did not arrive, or "Online payment is not available right now"
Open Users & Licence and click **Check my payment**: VLEBook asks Techmin, which checks the order with Razorpay and issues the licence and invoice if the payment is complete. If no payment is found, nothing was charged; if money left your account for a failed payment, Razorpay normally returns it in 5–7 working days. "Not available right now" means online sales are paused: contact Techmin to renew. "The GSTIN is not valid": check the 15 characters, or leave it empty if you are not registered.

### No sign-in box — only "Create the Owner account" or the Features & Plans page
This computer or browser has no VLEBook account yet; user names and passwords are kept where the centre was set up. Use **Sign in to my centre**: type your user name and password and choose the folder that contains *VLEBook-sync* or your backup files (not *VLEBook-sync* itself). If the backups are password-protected, use **Restore from backup folder** instead. Use the same Chrome profile as before — another browser or profile counts as another computer. Do not create a new Owner account for an existing centre.

### "The user name or password does not match this centre"
Type the same user name and password you use on the main computer (passwords are case-sensitive). Check that the folder is your centre's folder. If the Owner password is lost, use the recovery code on the main computer.

### "The Owner removed this computer from the centre" / "Another browser on this same computer now works as this counter"
This computer or browser stopped sharing because the Owner removed it, or because a newer browser on the same PC took over its counter (Print Bridge 1.3). Use the other browser, or join again: Data Ownership & Backup → Work on more than one computer, or **Sign in to my centre** on the first screen.

## Version 3.6 — Google Forms

### "This app isn't verified" or "Access blocked: … has not completed the Google verification process"
Google shows this while Techmin's app is waiting for Google's approval. During testing only the Gmail accounts Techmin has added as test users can connect. Contact Techmin support with the Gmail ID you want to use.

### "The browser blocked the Google sign-in window"
Allow pop-ups for tools.complypro.co.in (the icon at the right of the address bar), then click Connect again.

### "The Google window was closed before signing in"
Click Connect and finish signing in in the Google window.

### "Some Google permissions were not ticked" / "Google permission was not given"
In the Google window, tick every box (see and manage the forms VLEBook makes, see their responses, the files VLEBook creates, your e-mail address). Click Reconnect and tick all of them.

### "You signed in with a different Google account"
Nothing was changed. Click Connect again and choose the Gmail account shown (or the one tagged in Gmail accounts).

### "The Google connection has expired" / account shows Not connected
The connection lasts while VLEBook is open. Click Connect / Reconnect in Gmail accounts. Saved forms and responses are kept.

### "Your current plan allows one Gmail account" / "allows 2 forms"
On the free trial and in Basic mode, one Gmail account and 2 forms are allowed. Delete a form (Remove / delete → Delete the Google Form) or buy a paid plan.

### "Only the Owner can add or change the Gmail accounts"
Ask the Owner to sign in and add the Gmail account. Other users can still create forms and see responses with accounts the Owner added.

### "Google refused this action for this account (permission denied)" / "This form belongs to a different Gmail account"
Connect the Gmail account that owns the form (shown in My forms). A form made in another account cannot be managed from this one.

### "Google could not find this form"
It was deleted or moved in Google Forms, or belongs to another account. Responses already saved in VLEBook are kept; remove it from the list if it is no longer needed.

### "This Google account's organisation does not allow forms to be published to everyone"
Work or school Google accounts may block public forms. Ask that account's administrator, or use a personal Gmail account.

### "Google is limiting requests right now (quota)"
VLEBook tries again by itself. Wait a minute and click Refresh responses.

### "The form was created in Google, but its questions could not be added"
Open it with Edit in Google to check, or delete it (Remove / delete) and create it again.

### New responses do not appear
Click Refresh responses. VLEBook also checks every 5 minutes while the Google Forms screen is open; there are no instant alerts. The Gmail account that owns the form must be connected.

### "The Google Forms service is not available for this app (API_DISABLED)"
A setting at Techmin's side. Contact Techmin support.
