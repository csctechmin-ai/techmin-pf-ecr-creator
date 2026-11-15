# Third-Party Software Used by VLEBook

VLEBook bundles the following open-source libraries in `js/vendor/` so the PDF tools work fully offline.
They are loaded only when a PDF tool is used. Full licence texts are included next to each library.

| Library | Version | Licence | Used for | Licence file |
|---|---|---|---|---|
| pdf.js (Mozilla) | 6.2.108 | Apache License 2.0 | Reading PDFs, page previews, text extraction, rendering pages to images | `js/vendor/pdfjs/LICENSE` |
| pdf.js standard fonts (Foxit, Liberation) | bundled with pdf.js | BSD-style (Foxit) / SIL OFL 1.1 (Liberation) | Displaying PDFs that use non-embedded standard fonts | `js/vendor/pdfjs/standard_fonts/LICENSE_FOXIT`, `LICENSE_LIBERATION` |
| pdf.js image decoders (OpenJPEG, JBIG2, QCMS) | bundled with pdf.js | See licence files | Decoding JPEG 2000 / JBIG2 scans and colour profiles | `js/vendor/pdfjs/wasm/LICENSE_*` |
| pdf-lib | 1.17.1 | MIT | Merging, splitting, rotating, editing and creating PDFs | `js/vendor/pdf-lib/LICENSE.md` |

Everything else in VLEBook (including the QR encoder, ZIP writer and Word/Excel writers) is original code.
