# VLEBook Release Notes

Published by {{entity}}. The version you are using is shown in **Settings** and in the footer of exported reports.

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
