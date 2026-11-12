# Installation and offline use

## 1. Installation guide

MSME Tools needs no installation file and no account.

**Option A - open from the web (easiest).** Open the address of the tool in Chrome, Edge, Firefox or Safari (a recent version). In Chrome or Edge, click the *Install* icon in the address bar to keep it like an app. After the first visit the tool also works with the internet switched off.

**Option B - run from a folder on your computer.**
1. Copy the whole `msme-tools` folder to your computer.
2. Open a terminal inside the folder and run `python3 -m http.server 8080` (or any static file server).
3. Open `http://localhost:8080/<tool-folder>/` in your browser.

Opening `index.html` directly from the file system (`file://`) also works for entering data, but the browser will not install the offline copy in that mode (code MT-BRW-003).

**Offline use.** Visit the tool once while online. A service worker stores the files in the browser. From then on it opens without internet. Your data is always local.

**Updating.** Reload with Ctrl+F5. Your data is not touched by an update.

Each tool is a separate folder with its own data store; installing one does not affect the others.
