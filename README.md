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
Bump the version so browsers fetch the new files: run `V=$(cat assets/site.css assets/site.js data/*.js | md5sum | cut -c1-8)` and replace the `window.DR_V = "..."` value in every `index.html` and `404.html` with it (including the session folders).

## Dougie's Wheel of Fortune

The wheel on the hub lands on a unit and asks a question from that subject's `quiz` list in its data file (unit, question, right answer, three wrong answers; the options are shuffled on screen). A right answer adds 5p to the money jar the first time that question is answered correctly; a wrong answer costs nothing. Saved in localStorage under `dougie-revision:wheel`.

## Flexible sessions and practice slots

There are no timers anywhere (Mark, 26 Oct). Every session is worked through in order: the current slot is the first one not yet finished, and each slot's minutes are shown only as a rough guide. A session with `id` and `flexible: true` has no date; dated sessions just show their date. Its page is /<subject>/sessions/<id>/; copy any session folder's index.html there. Practice slots (`type: "practice"`) point at an entry in the subject's `activities`: `trace` (expected rows given), `truth` (worked out from the expression), `sort` (bubble, insertion or merge, worked out from the list), `binary` (worked out from the list and target) and `python` (runs in the browser with Pyodide in assets/py-worker.js and checks the tests).

## Sign-in

`DR.firebase` in data/subjects.js holds the Firebase web config (project dougie-revision). Every page opens on a Google sign-in screen, and Firestore rules decide which accounts can read and write the one progress record. Set it to `null` to go back to progress on this device only.
