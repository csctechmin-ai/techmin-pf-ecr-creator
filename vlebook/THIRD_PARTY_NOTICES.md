# Third-Party Software Used by VLE360

VLE360 bundles the following open-source libraries in `js/vendor/` so the PDF tools work fully offline.
They are loaded only when a PDF tool is used. Full licence texts are included next to each library.

| Library | Version | Licence | Used for | Licence file |
|---|---|---|---|---|
| pdf.js (Mozilla) | 6.2.108 | Apache License 2.0 | Reading PDFs, page previews, text extraction, rendering pages to images | `js/vendor/pdfjs/LICENSE` |
| pdf.js standard fonts (Foxit, Liberation) | bundled with pdf.js | BSD-style (Foxit) / SIL OFL 1.1 (Liberation) | Displaying PDFs that use non-embedded standard fonts | `js/vendor/pdfjs/standard_fonts/LICENSE_FOXIT`, `LICENSE_LIBERATION` |
| pdf.js image decoders (OpenJPEG, JBIG2, QCMS) | bundled with pdf.js | See licence files | Decoding JPEG 2000 / JBIG2 scans and colour profiles | `js/vendor/pdfjs/wasm/LICENSE_*` |
| pdf-lib | 1.17.1 | MIT | Merging, splitting, rotating, editing and creating PDFs | `js/vendor/pdf-lib/LICENSE.md` |
| libheif (JavaScript build, includes libde265) | as distributed in heic2any 0.0.4 (commit 3428539) — used unmodified as a separate, replaceable file | GNU LGPL v3.0 | Opening iPhone HEIC/HEIF photos | `js/vendor/libheif/LICENSE-LGPL-3.0.txt`, `LICENSE-GPL-3.0.txt`, `README.txt` (source links) |

Everything else in VLE360 is original code, written independently: the QR encoder, Code 128 barcode, ZIP writer and reader, Word/Excel writers, AES-256 PDF password protection, secure redaction, card designer, image adjustments, photo/signature size engine and the HEIC worker script. (The Tesseract OCR engine and its language data were included up to version 3.5.0 and were removed in 3.5.1.)

The HEIC engine is loaded only when that tool is used, from VLE360's own site (no CDN), and is cached on the computer so it works offline afterwards. It processes files on the computer; nothing is uploaded. The libheif file is LGPL-licensed: it is kept unmodified in its own file so it can be replaced, and its source code is available at https://github.com/strukturag/libheif and https://github.com/strukturag/libde265.

Reference projects studied for features only (no code copied): Stirling-PDF, BentoPDF, PDF Arranger, OCRmyPDF, qpdf, pdfcpu, Cropper.js, Fabric.js, Squoosh, browser-image-compression, ScanTailor, ImageMagick.
