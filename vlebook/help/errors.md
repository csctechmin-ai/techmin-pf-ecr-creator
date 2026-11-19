# Errors & Solutions

Find the message you see (or the problem) below. If it is not solved, contact {{entity}}: {{email}}{{phoneSep}}. Send a screenshot and your Device Code (Users & Licence).

## Licence and sign-in

### "Activation needs an internet connection"
Creating the Owner account and activating a licence are done online with {{entity}}. Connect the computer to the internet (Wi-Fi, broadband or mobile hotspot) and click the button again. If the internet works and the message continues, the Techmin service may be busy: try again after a few minutes, or contact {{entity}}. After activation, daily work continues offline.

### "Your 14-day full-version trial has ended. VLEBook now works in Basic mode"
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
They are fetched when the computer is online. Click **Check for new updates** in Techmin Updates.

### "Enter a full web address starting with https:// (or http://)" in the Service Catalogue
Type the complete address, for example *https://edistrict.kerala.gov.in*. Other kinds of links are refused for safety.

### I cannot delete a link in the Techmin tab
The Techmin links (ComplyPro, Finance and Accounting Tools, Techmin Wealth Partners website, IFSC Tracker) are part of VLEBook and cannot be deleted or edited. Links you added yourself can be deleted with ×.

### A catalogue link shows "Invalid link"
The link was saved by an older version without https:// or http://. Delete it and add it again with the full address.

## CV & Resume Builder

### "This feature needs a VLEBook licence" when opening CV & Resume Builder
The CV & Resume Builder is part of the full version (14-day trial or paid licence). It is not available in Basic mode.

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

