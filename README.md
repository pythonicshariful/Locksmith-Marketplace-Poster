# Locksmith Marketplace Poster — Standalone (Tampermonkey)

**Version 1.1.4 — for hammadsolomon (Fiverr order FO5234353C085)**

A standalone Tampermonkey userscript that fills and posts Facebook Marketplace
listings for locksmith services from a side panel. **No server, no Python, no
Flask.** Listings, settings, queue and variation history all live in
Tampermonkey storage in the browser.

> **Live-test status: CATEGORY STILL NOT SELECTING (Nov 14) — v1.1.4
> ADDS UI DROPDOWNS + VISIBLE SKIP WARNINGS, LIVE BROWSER CHECK STILL
> NEEDED.** The first live run (v1.1.0) reported "Field not found:
> Description" and left Title/Price empty — the finder only looked for
> plain inputs/textareas, while Facebook's Description is a rich-text
> (Lexical) editor. v1.1.1 matches contenteditable editors,
> aria-labelledby, name/id and nearby labels, expands "More details",
> and logs field diagnostics. v1.1.2 fixes location from the live
> listbox DOM: after typing, it clicks the FIRST suggestion row (the
> city itself) with a full pointer/mouse sequence, verifies the
> listbox closed, and falls back to ArrowDown + Enter. v1.1.3 fixes
> Category/Condition from the live combobox + dropdown-dialog DOM: the
> combobox is found via aria-labelledby, the option is matched by its
> first name span (subtitles ignored, headers never clicked), and a
> miss logs every available option name. v1.1.4: Category/Condition
> are now dropdowns in Edit + Settings (26 real Facebook category
> names from the live dialog, custom-name override box), a blank
> Category/Condition now logs a visible warning instead of skipping
> silently, and clicks/pauses are more human-like. A second
> view-source file (Nov 14) again contained NO rendered DOM — only JS
> bundle names — so it cannot settle the selectors; a live browser
> session on the test account is the remaining step. Fixes are
> harness-tested but **not yet re-verified live** — run the Fill-only
> dry-run (Step 3 below) and check the Log tab before auto-publish.

## What it does

- **Dashboard panel** on every Marketplace page (right side, collapsible):
  Listings, Queue, Add/Edit, Renew, Settings, Log.
- **20–50 prepared listings.** Ships with the buyer's own 10 examples as
  templates. Add more in Add/Edit, or Duplicate a template and change the
  city/service.
- **Variation, no exact repeats.** Titles/descriptions use spintax
  `{option A|option B}` plus `{city}`, `{service}`, `{make}` tokens, price
  jitter (±$, rounded to $5), and already-used combination tracking. Use
  **Preview variation** to see a spun example before posting.
- **Queue + schedule.** Tick listings, Start queue, set the interval
  (default 3–5 minutes, randomised). The queue survives page changes —
  keep the tab open. Max per run is capped in Settings (default 10).
- **Two modes.** Fill-only dry-run (default, safe) fills the form and
  pauses so you can review. Fill + Publish clicks Next/Publish and moves
  to the next listing. Change mode in Settings.
- **Photos: upload or links (v1.1.0).** Upload photos from the computer
  in Add/Edit — they are stored in the browser (IndexedDB, this Chrome
  profile only) and reused for every post of that listing. Image URLs
  (one per line) still work too; uploaded photos attach first and links
  fill the remaining slots. Listings with no photos at all fill
  everything else and stop before Publish with a clear warning.
- **Renew helper.** On the Selling page, scan for visible Renew controls
  and renew them one by one (best-effort — see Limits).
- **Backup.** Export/import listings as JSON in Settings.

## 1. Install

1. Chrome → install the **Tampermonkey** extension.
2. Tampermonkey icon → **Create a new script**.
3. Delete the template, paste the full contents of
   `locksmith-marketplace-poster.user.js`, press **Ctrl+S** (File → Save).
4. Open <https://www.facebook.com/marketplace> while logged in. The
   green/teal **Locksmith Marketplace Poster** panel appears on the right.
   If it doesn't, refresh once and check Tampermonkey shows the script
   as Enabled on that page.

## 2. Add photos (important)

Facebook requires at least 1 photo per listing, and the 10 seed listings
ship with **no photos on purpose** — no fake images or URLs were invented.

**Recommended — upload:** Edit a listing → **Choose photos** → select
2–4 photos from the computer → **Save**. Thumbnails appear in the editor
(✕ removes one). The photos stay saved in this Chrome profile and are
attached automatically on every post. Keep the originals on the
computer: clearing Facebook site data deletes the saved copies, and
Export JSON does not include uploaded photos, so another profile or
computer needs its own upload. Prefer JPGs under ~5 MB each.

**Alternative — links:** Edit → Image URLs, one per line, paste **direct
image links** ending in `.jpg` / `.png` / `.webp`, e.g. from your own
website or an image host that serves the file directly. Google Drive
"share" links do **not** work as direct images. If a photo cannot be
downloaded, the Log says so and the listing is skipped for publishing —
fix the URL and retry. You can mix uploads and links on one listing.

Without any photos, use Fill-only mode and add photos by hand on
Facebook before publishing.

## 3. First live test (do this before auto-publish)

1. Settings → confirm **Auto-publish is OFF** (it is OFF by default).
2. Listings → tick **one** listing → **Preview variation** → check the
   spun title/description look right.
3. **Start queue** → the create page opens and fills. Check: title,
   price, description, location suggestion, photos.
4. If a field is wrong or missing, read the Log — it names the field.
   Fix the template/category text, or fill that field by hand.
5. Only when one listing fills correctly: Settings → turn **Auto-publish
   ON**, start with 2–3 listings, watch the whole run, then scale up.

## 4. Daily use

- **Post:** Listings → tick → Start queue. Watch the Queue tab for
  done/failed and the note on each item.
- **New city for a service:** Duplicate the listing, change City (and
  name), save, queue it. Variation keeps the text from repeating exactly.
- **Repost later:** Duplicate the template with a different city/title
  and queue it as a fresh listing, or use the Renew tab on the Selling
  page for listings Facebook allows to renew.
- **Multiple accounts:** one Chrome profile per Facebook account, install
  the script in each profile. A separate proxy per profile reduces flag
  risk. This script never switches accounts itself.

## Limits — read before promising anything

- **Not verified live yet.** Facebook changes its create-page layout
  regularly. Label/aria-based selectors are used (not class names), but
  a layout change can still break a field. The script logs the field
  name instead of failing silently.
- **Renew is best-effort.** Facebook shows Renew only for some listings,
  sometimes only inside each listing's "..." menu. If no Renew controls
  are found, the panel says so. Verify one renew by hand first.
- **Category/Condition are optional and best-effort.** Leave them blank
  to skip, or type the exact category name as Facebook shows it on your
  account. If the option isn't found, the field is left for manual
  selection and the run continues.
- **No safety guarantee.** Start slow (a few listings/day), warm up new
  accounts, and stop immediately on any Facebook warning, checkpoint or
  restriction. No posting volume is 100% safe.
- **Uploaded photos live in one browser profile only.** They do not
  sync, are not in Export JSON, and disappear if Facebook site data is
  cleared. Keep the original files.
- **Linked images depend on the host.** Some hosts block cross-site
  downloads; the Log will show which photo failed. Use a host that
  serves direct files, upload the photo instead, or add photos by hand.

## If a field still won't fill — send diagnostics, not view-source

View-source (`view-source:`) does **not** contain the rendered form —
Facebook builds it with JavaScript, so that file is useless for fixing
selectors. Instead, do one of these on the create page:

1. **Easiest:** open the panel's **Log** tab after a Fill-only run and
   screenshot the "Form diagnostics" lines (they list every visible
   field's tag/labels — no values are logged).
2. **Most precise:** press F12 → Console → paste the snippet below
   (Chrome may ask you to type `allow pasting` first). It copies a
   field list to your clipboard — no field values, no tokens, structure
   only. Paste the result back.

```js
(function(){
  const out=[];
  document.querySelectorAll('input,textarea,[contenteditable="true"],[role="textbox"],[role="combobox"]').forEach(el=>{
    if(el.closest('#lmp-panel'))return;
    const r=el.getBoundingClientRect();
    out.push({tag:el.tagName.toLowerCase(),type:el.type||'',role:el.getAttribute('role')||'',aria:el.getAttribute('aria-label')||'',labelledby:el.getAttribute('aria-labelledby')||'',ph:el.getAttribute('placeholder')||'',testid:el.getAttribute('data-testid')||'',ce:el.isContentEditable,vis:r.width>0&&r.height>0,hasVal:!!(el.value||el.textContent||'').trim()});
  });
  console.table(out); copy(JSON.stringify(out,null,1));
  console.log('Copied '+out.length+' fields. Paste into chat.');
})();
```

## Troubleshooting

| Symptom | Check |
|---|---|
| Panel doesn't appear | Tampermonkey enabled? On `facebook.com/marketplace/*`? Refresh. |
| "Field not found: Title/Price/…" | Facebook layout changed. Note the field name from the Log; fill by hand for now and report the field + a screenshot. |
| Photos not attached | Uploaded photos: check the editor still shows thumbnails (site data may have been cleared — re-upload). Links: image URL must be a direct file link and downloadable. Check Log for the failing URL. |
| "Photo storage unavailable" in Log | IndexedDB is blocked in this browser/profile. Image URLs still work; try another Chrome profile for uploads. |
| Publish button stayed disabled | Usually missing photos or a required field. Fill-only mode shows what's missing. |
| Queue stops after 1 listing | Fill-only mode pauses after each fill by design. Turn on Auto-publish in Settings for continuous runs. |
| Script asks about a host on first photo download | Tampermonkey `@connect *` covers image hosts; allow the request if Tampermonkey prompts. |

## What was tested (Nov 12, 2026)

- `node --check` — syntax OK (1,677 lines, ~87 KB).
- Logic harness (19 checks, all pass): 10 seed listings, 40 services,
  7 cities, 26 FB categories + 4 conditions, dropdown option builder
  (blank first, custom value preserved), spintax variation, token
  replacement, price within range and rounded to $5,
  used-combination avoidance, safe defaults (auto-publish OFF,
  interval 180–300s), plus photo-resolution soft failure without
  IndexedDB (empty result, no throw).
- Fake-IndexedDB harness (7 checks, all pass): store 2 photos, non-image
  filtered out, read-back with names, resolve to File objects with
  names/types preserved.
- Fill harness (10 checks, all pass): scored finder picks Title by
  placeholder, Price via aria-labelledby, Description as the
  contenteditable editor; panel/header fields excluded; input typing
  sets + verifies value; editable path inserts via execCommand.
- Location harness (7 checks, all pass, fake DOM built from the live
  listbox HTML): first suggestion row ("Tampa, Florida" / City) gets
  the full pointer/mouse sequence, second row untouched, listbox
  closes, input value becomes the selected place; no-listbox case
  falls back to ArrowDown + Enter.
- Dropdown harness (11 checks, all pass, fake DOM built from the live
  combobox/dialog HTML): combobox found via aria-labelledby; "Household"
  matched by its first name span despite the "Shipping available"
  subtitle; header rows never clicked; missing option logs the full
  available list; already-selected value skips clicking. Harnesses
  live in `tests/` locally (not shipped in the repo); the panel-smoke
  and fake-IndexedDB harnesses below passed on code unchanged since
  their last run.
- Panel smoke test (fake DOM): script boots without errors, listings
  render with names, NO PHOTOS badges, uploaded/link counts and queue
  button after the async photo-count refresh.
- **Live:** v1.1.0 first live test Nov 12 FAILED on fields (Description
  not found, Title/Price empty; photo preview did appear, suggesting
  attach worked). Nov 14: category still not selecting (cause
  unverified — blank category skipping silently is one candidate;
  v1.1.4 makes the skip visible). v1.1.1–v1.1.4 fixes are
  harness-tested only — live re-verification of fill, location
  selection, category selection, attach, Publish and Renew is still
  open (Step 3 above, or a live browser session on the test account).
  Condition option names are the standard Facebook names, unverified
  live. Photo copy/delete on Duplicate/Delete share the tested
  IndexedDB patterns but were not individually harness-tested.

## Files

- `locksmith-marketplace-poster.user.js` — the script (v1.1.4).
- `README.md` — this file.
