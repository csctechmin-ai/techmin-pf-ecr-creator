# Security

## What these tools do
All tools run entirely in the browser. No employee or payroll data is sent to a server by the tools.

## Protections built in (version 1.2.0)
- Content Security Policy (meta tag): scripts only from this site and cdnjs.cloudflare.com; no connections to other hosts; no plug-ins; no framing of forms; `base` tag blocked.
- Clickjacking guard: the page breaks out of any frame.
- Referrer policy and `nosniff` hints.
- Links that open a new tab use `rel="noopener noreferrer"`.
- Uploads are limited in size and rows; backup files are checked and unsafe keys (`__proto__`, `constructor`, `prototype`) are removed when restored; only known fields are kept.
- CSV exports prefix cells that start with `=`, `+`, `-` or `@` so spreadsheets treat them as text.
- User text is HTML-escaped before display.

## What a static site cannot do
GitHub Pages cannot send HTTP response headers (HSTS, X-Frame-Options, a strict header CSP) and cannot absorb a network-level (DDoS) attack. For those, place the domain behind a CDN or proxy such as Cloudflare and enable: Always use HTTPS, HSTS, bot and rate limiting, and a WAF. Add a header CSP there as well.

## Known limitation
The Excel library is loaded from cdnjs.cloudflare.com without a Subresource Integrity hash. Pin one when the file bytes can be verified.

## Reporting
Use the contact in `.well-known/security.txt`.
