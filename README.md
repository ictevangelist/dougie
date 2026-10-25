# Dougie's Revision

Unlisted revision site at https://dougie.ictevangelist.com (also works at https://ictevangelist.github.io/dougie/). Plain HTML, CSS and JavaScript, no build step. Every page is the same small HTML shell; `assets/site.js` reads the address and renders the page from the data files.

- `assets/site.css`: the one stylesheet (design tokens on `:root`).
- `assets/site.js`: the shared components (header, timeline, Done ticks, confidence rating, copy buttons, progress summary) and the page router.
- `data/subjects.js`: the list of subjects (live or coming soon).
- `data/<subject>.js`: one file per subject: units, reports and sessions.

## Add a session
Add one object to `sessions` in `data/<subject>.js` (date, title, start, end, breaks, slots). Its page, `/<subject>/sessions/<date>/`, works straight away through `404.html`. To give it its own folder as well, copy any `index.html` shell to `<subject>/sessions/<date>/index.html`.

## Add a subject
Add an entry to `data/subjects.js`, create `data/<slug>.js`, and copy `index.html` to `<slug>/index.html`. Set `status` to `live` when it is ready.

## Keep it unlisted
Every page has `<meta name="robots" content="noindex, nofollow">`, `robots.txt` disallows everything, there is no sitemap, and nothing links here from ictevangelist.com. No analytics or third-party scripts apart from Google Fonts. Progress is saved in the browser's localStorage only.

## After changing assets or data
Bump the version so browsers fetch the new files: run `V=$(cat assets/site.css assets/site.js data/*.js | md5sum | cut -c1-8)` and replace the `window.DR_V = "..."` value in every `index.html` and `404.html` with it.
