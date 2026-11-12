# Locksmith Marketplace Poster — Standalone (Tampermonkey)

**Version 1.1.0 — for hammadsolomon (Fiverr order FO5234353C085)**

A standalone Tampermonkey userscript that fills and posts Facebook Marketplace
listings for locksmith services from a side panel. **No server, no Python, no
Flask.** Listings, settings, queue and variation history all live in
Tampermonkey storage in the browser.

> **Live-test status: LOCAL TESTS PASS, LIVE CHECK PENDING.** Syntax,
> spintax/variation, price, dedup and panel-render tests all pass locally
> (see "What was tested" below). The Facebook form selectors have **not**
> yet been verified against a live logged-in Marketplace create page.
> Always run the Fill-only dry-run first (Step 3 below) with your own
> account before turning on auto-publish or sending this to the client.

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

- `node --check` — syntax OK (1,251 lines, ~68 KB).
- Logic harness (19 checks, all pass): 10 seed listings, 40 services,
  7 cities, spintax variation (15 unique title/description combos in
  40 renders of one template), token replacement, price within range
  and rounded to $5, used-combination avoidance, safe defaults
  (auto-publish OFF, interval 180–300s), plus photo-resolution soft
  failure without IndexedDB (empty result, no throw).
- Fake-IndexedDB harness (7 checks, all pass): store 2 photos, non-image
  filtered out, read-back with names, resolve to File objects with
  names/types preserved.
- Panel smoke test (fake DOM): script boots without errors, listings
  render with names, NO PHOTOS badges, uploaded/link counts and queue
  button after the async photo-count refresh.
- **Not tested:** live logged-in Facebook Marketplace create/selling
  pages, real photo upload/attach on Facebook, real photo download
  from a live host, real Publish, real Renew. Those need Shariful's
  own-account live test (Step 3 above). Photo copy/delete on
  Duplicate/Delete share the tested IndexedDB patterns but were not
  individually harness-tested.

## Files

- `locksmith-marketplace-poster.user.js` — the script (v1.1.0).
- `README.md` — this file.
