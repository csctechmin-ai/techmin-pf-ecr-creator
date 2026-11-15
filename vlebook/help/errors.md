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
