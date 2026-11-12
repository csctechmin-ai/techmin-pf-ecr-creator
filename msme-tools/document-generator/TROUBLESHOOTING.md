# Troubleshooting - MSME Document Generator

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