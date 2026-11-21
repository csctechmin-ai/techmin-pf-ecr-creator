# Open-source licences

VLEBook is published by {{entity}}. Most of VLEBook is original code written for VLEBook. A few open-source components are included so that PDF, OCR and photo tools work fully offline on your computer. Each is used under its own licence, shown below. These components run only on your computer; nothing is uploaded.

## Components included in VLEBook

| Component | Licence | Used for |
|---|---|---|
| pdf.js (Mozilla) 6.2.108 | Apache License 2.0 | Opening PDFs, page previews, text from PDFs |
| pdf.js standard fonts (Foxit, Liberation) | BSD-style (Foxit), SIL Open Font Licence 1.1 (Liberation) | Showing PDFs that use standard fonts |
| pdf.js image decoders (OpenJPEG, JBIG2, QCMS) | Their own permissive licences | Decoding some scanned-PDF image types |
| pdf-lib 1.17.1 | MIT | Merging, splitting, editing and creating PDFs |
| Tesseract OCR (tesseract.js-core 7.0.0) with its image libraries | Apache License 2.0; image libraries under permissive licences | Reading text from images and scanned pages (OCR) |
| Tesseract language data: English, Malayalam, Hindi | Apache License 2.0 | OCR language models |
| libheif with libde265 (JavaScript build) | GNU LGPL version 3.0 | Opening iPhone HEIC / HEIF photos |

## About libheif (LGPL 3.0)

The HEIC photo decoder is licensed under the GNU Lesser General Public License version 3.0. VLEBook uses it unmodified, in its own separate file that is loaded only when a HEIC photo is opened, so it can be replaced by any compatible build. Its source code is available at [github.com/strukturag/libheif](https://github.com/strukturag/libheif) and [github.com/strukturag/libde265](https://github.com/strukturag/libde265). The full licence texts (LGPL 3.0 and GPL 3.0) are supplied with VLEBook next to the file.

## Licence texts

The full licence text of every component is supplied with VLEBook in the folder of that component (`js/vendor/…`), and the complete list is in the file *THIRD_PARTY_NOTICES.md* published with VLEBook.

## VLEBook's own code

Everything else in VLEBook (billing, accounts, reminders, card designer, QR and barcode makers, ZIP, Word and Excel writers, PDF password protection, redaction, photo and signature sizing and the other features) is original code owned by {{entity}}. Other open-source projects were studied for ideas only; no code was copied from them. VLEBook does not load code, fonts or data from other websites.

Questions about licences: {{email}}.
