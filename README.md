# Locksmith Marketplace Poster — User Guide

**Version 1.1.10 — built for hammadsolomon (Fiverr order FO5234353C085)**

This tool posts your locksmith service listings on Facebook Marketplace
for you, from a small panel that appears on the right side of Facebook
in Chrome. You prepare your listings once, tick the ones you want, press
Start, and the tool fills in the Facebook form and publishes each one —
with different wording, prices and cities each time, so your listings
do not look like copies of each other.

No server, no monthly fee, nothing to install on your computer except a
free Chrome extension. Everything runs in your own browser, on your own
Facebook account.

> **New here?** Start with [Install](#1-install-5-minutes), then
> [First-time setup](#2-first-time-setup-do-these-3-things-first).
> The rest of this guide explains every button and every box, one by
> one, in plain words.

---

## Your requirements — what is covered

You asked for the following on Nov 8, 2026. Here is exactly where each
item stands.

| What you asked for | Covered? | Notes |
|---|---|---|
| Auto-post locksmith listings on Facebook Marketplace | ✅ Yes | Using your Facebook **account** (not a Page), as agreed Nov 9. |
| A dashboard to manage it all | ✅ Yes | The panel on the right side of Facebook: 6 tabs (see below). |
| 20–50 different listings ready in the system | ✅ Yes | The system holds as many as you want. It ships with your 10 examples; use **Duplicate** to grow to 20–50 in minutes. |
| Different titles every time | ✅ Yes | Each listing has several title wordings; one is picked at random for every post. |
| Different descriptions every time | ✅ Yes | Same idea: several description wordings per listing. |
| Different prices | ✅ Yes | Each listing has a base price plus a "vary by" amount (e.g. $120 ± $20, rounded to $5). |
| Different images | ✅ Yes, you supply them | Each listing can hold several photos (uploads from your computer, or image links). The tool cannot invent photos — see [Photos](#photos-adding-pictures-to-a-listing). |
| Different cities / locations | ✅ Yes | All 7 of your cities are built in: Tampa, St. Petersburg, Clearwater, Brandon, Riverview, Plant City, Lakeland. |
| Different services | ✅ Yes | All 40 of your services are built in (14 Automotive, 6 Residential, 20 Commercial — full list at the end of this guide). |
| Different vehicle makes | ✅ Yes | Each listing has a **Vehicle Make** field (Mercedes, Ford, Nissan, … or any make you type). The same service can now vary across makes. |
| Choose which listings to post | ✅ Yes | Tick the boxes on the Listings tab. Only ticked listings run. |
| Choose which Facebook account to use | ✅ Yes, via Chrome profiles | One Chrome profile = one Facebook account. Install the tool in each profile. See [Multiple accounts](#using-more-than-one-facebook-account). |
| Posting schedule | ✅ Yes | Set the wait between posts (e.g. 3–5 minutes), a maximum per run, and optional **posting hours** (e.g. only 9am–9pm). |
| Never post the exact same title/description twice | ✅ Yes | Every published combination is remembered, and the tool picks a fresh one next time. |
| Renew / repost listings later, if possible | ⚠️ Partly | A **Renew** helper clicks Facebook's Renew buttons when Facebook shows them. Facebook only offers Renew on some listings, so this cannot be guaranteed. You can also repost any listing as a brand-new listing with one click (Duplicate). |
| One-time payment, no monthly fees | ✅ Yes | There is no server and no subscription. You pay once; the tool keeps working. |
| Show me the setup | ✅ Yes | Setup is shown to you when the tool is delivered (this guide + a walkthrough). |
| Category "Services / Automotive" | ❌ Not possible | Facebook's item-listing form does **not** offer a "Services" category at all. The closest choices are **Auto parts**, **Miscellaneous**, or **Vehicles**. Pick one per listing (see [Category](#category--condition--availability--product-tags)). This is a Facebook limit, not a tool limit. |
| Contact details / phone number on listings | ⚠️ In the text | There is no separate phone-number box (Facebook's form has none for this either). Write your phone number or "Call or message" wording inside the description text, and it will appear on every listing. |

---

## What you need before you start

1. **Google Chrome** on a computer (Windows or Mac). The tool does not
   work in the Facebook phone app.
2. **The free Tampermonkey extension** for Chrome (installed in the
   steps below).
3. **A Facebook account**, logged in on Chrome, that can post on
   Marketplace.
4. **Photos** of your locksmith work on your computer (2–4 per listing
   is ideal). Facebook requires at least 1 photo per listing.

## 1. Install (5 minutes)

1. Open Chrome and install the **Tampermonkey** extension from the
   Chrome Web Store (search "Tampermonkey", click **Add to Chrome**).
2. Click the Tampermonkey icon (top-right of Chrome) → **Create a new
   script**.
3. Delete everything in the editor, then paste the full contents of
   `locksmith-marketplace-poster.user.js` (the file you received).
4. Press **Ctrl+S** (or File → Save).
5. Open <https://www.facebook.com/marketplace> while logged in. The
   dark **🔑 Locksmith Marketplace Poster** panel appears on the right.
   If it doesn't, refresh the page once and check Tampermonkey shows
   the script as **Enabled**.

## 2. First-time setup: do these 3 things first

### (a) Add photos to each listing

The 10 included listings ship with **no photos on purpose** — no fake
images were invented. Facebook will not publish a listing with no
photo, and the tool will skip publishing (with a clear message) until
photos exist.

Go to **Add / Edit**, open a listing, and use **Choose photos** to pick
2–4 photos from your computer. Repeat for each listing. Full details
under [Photos](#photos-adding-pictures-to-a-listing).

### (b) Set a Category on each listing

Open each listing in **Add / Edit** and choose a **Category** (see the
note above about "Services" not existing on Facebook). A good default
for most locksmith listings is **Auto parts** for car-key work and
**Miscellaneous** for house/commercial work — or set one default for
all listings in **Settings** (see
[Default category](#default-category--condition--availability--product-tags)).
If Category is left blank, the tool warns you in the Console and leaves
Facebook's category untouched — but Facebook usually requires a
category, so set one.

### (c) Do one Fill-only test before auto-publishing

**Auto-publish is OFF by default, on purpose.** The first run should be
a dry run: the tool fills the form and stops, so you can check
everything looks right, without publishing anything. See
[Your first test run](#your-first-test-run-do-this-before-auto-publish).

## The panel at a glance

The panel sits on the right side of every Marketplace page in Chrome.
It has 6 tabs across the top:

| Tab | What it is for |
|---|---|
| **Listings** | Your saved listing templates. Tick the ones to post, preview them, edit, duplicate or delete them. |
| **Queue** | Start and watch a posting run. Shows progress and the countdown to the next post. |
| **Add / Edit** | Create a new listing or change an existing one. Every field is explained below. |
| **Renew** | Renew old listings Facebook offers Renew on, or repost them as new listings. |
| **Settings** | How the tool behaves: auto-publish on/off, timing, posting hours, defaults, backup. |
| **Console** | A live diary of everything the tool does, line by line, plus the next-post countdown. |

At the bottom of the panel there is always a **status bar**: on the
left, the latest diary line; on the right, the countdown
("Queue idle", "Next post in 02:34 (post 2/10)", or "Posting…
(post 2/10)").

- **Hide / show the panel:** click the teal **◀** button on the panel's
  left edge. Click **▶** to bring it back.
- **Resize the panel:** drag its left edge sideways (from 280 to 700
  pixels wide). Your size is remembered. **Double-click** the left
  edge to reset to the normal width.
- The panel works on any Marketplace page. When you press **Start**, it
  takes you to the listing form automatically if you are not there
  already.

---

## Tab 1: Listings

This is your library of listing templates. A template is a reusable
recipe: service + city + price + wordings + photos. One template can
produce many different-looking posts.

### The boxes and buttons at the top

- **Search listings…** — type to filter by name, service or city.
  Example: type `tampa` to see only Tampa listings.
- **Select all** — ticks every listing.
- **Clear** — unticks every listing.
- **Preview variation** — shows exactly what the next post would look
  like (title, price, city, description) for up to 3 ticked listings
  — or for the first listing if none are ticked. Nothing is posted.
  Under each preview it says **"Fresh combination: yes"** (this exact
  wording has not been posted before) or **"no — all variants
  recently used"** (every wording has been used lately; add more
  wordings to the template, or wait).
- **▶ Start queue (N)** — starts a posting run for the N ticked
  listings. A confirmation box appears first, telling you the mode
  (Fill-only or Fill + Publish). See [Tab 2: Queue](#tab-2-queue).
- **"N listing(s) saved…"** — how many templates you have, and a
  reminder that wording is spun fresh for every post.

### Each listing card

- **Tick box + name** — tick to include it in the next run. The name
  (e.g. "Car Lockout — Tampa") is only for you; buyers never see it.
- **NO PHOTOS badge** — this listing has no photos yet. It can be
  filled for review, but it cannot be published until you add photos.
- **Service • Make • City • $Price ±$vary** — the listing's settings
  at a glance. The make only shows if one is set.
- **"N uploaded + M link photo(s)"** — how many photos this listing
  has: uploaded from your computer, plus image links.
- **Title template (first 90 characters)** — a reminder of the
  wording recipe.
- **Edit** — opens the listing in the Add / Edit tab.
- **Duplicate** — makes a copy (named "… (copy)") **including its
  uploaded photos**. This is the fastest way to grow from 10 listings
  to 20–50: duplicate a template, then Edit the copy and change the
  city, service or make.
- **Delete** — asks first, then deletes the template **and its
  uploaded photos**. This cannot be undone — use Export in Settings
  first if you want a backup.

---

## Tab 2: Queue

This tab runs and watches a posting run.

### What you see

- **Mode line** — the current mode (**Fill + Publish (auto)** or
  **Fill-only dry-run (safe)**), the wait between posts (e.g.
  "Interval: 180–300s"), the maximum listings per run, and whether
  posting hours are on or off. Change these in Settings.
- **⏱ Countdown** — ticks every second: how long until the next post,
  and which post it is ("Next post in 02:34 (post 3/10)"), or
  "Posting… (post 3/10)" while a post is being made, or "Queue idle"
  when nothing is running.
- **▶ Start queue (N selected)** — starts a run for the ticked
  listings (same button as on the Listings tab). If you are not on
  the listing form page, the tool goes there first, automatically.
- **■ Stop** — stops the run after the current step. Nothing half-done
  is left behind; you can start again any time.
- **Reset** — clears the current queue (asks first).
- **Open create page** — opens Facebook's "create item" form by hand.
- **Progress: X / Y — RUNNING / paused / finished** — how far the run
  has gone.
- **One block per listing** — its name, its **status**, and the exact
  title/price/city that will be (or was) posted:
  - `pending` — waiting its turn.
  - `posting` — being filled/published right now.
  - `filled` — filled for review in Fill-only mode, not published.
  - `done` — published.
  - `failed` — something went wrong; the note underneath says what
    (e.g. "No photos", "Publish not confirmed").

### What happens when you press Start

1. A confirmation box shows how many listings will run and the mode.
   Press OK.
2. If you are not on Facebook's "create item" form, the tool opens it
   for you.
3. For each listing, in order:
   - It waits a random time within your interval (default 3–5
     minutes) before each post after the first.
   - It fills in the form: photos, title, price, description,
     location, category, condition, availability, product tags.
   - **Fill-only mode (default):** it stops after filling, so you can
     review the form on screen. Nothing is published. The run pauses.
     To continue with the next listing, **untick the one you just
     reviewed** on the Listings tab and press Start again (Start
     always begins from the ticked listings).
   - **Fill + Publish mode:** it clicks **Next** (waiting until
     Facebook enables it), then **Publish**. After a successful
     publish it waits a few seconds, returns to a fresh blank form,
     and waits there until the next listing is due.
4. When the run ends, the Console reports how many succeeded and how
   many failed.

### Rules of a run

- **Keep the tab open.** The run lives in that tab. If you close the
  tab, the run stops. Refreshing the page is safe: the run resumes
  where it left off (including any planned wait).
- **Do not click around Facebook** while a run is filling or
  publishing — the tool is typing into the form.
- **If posting hours are on** and the current time is outside your
  hours, the run waits on the form page and the countdown shows the
  time left until your hours begin.
- **Failed listings** do not block the rest (unless "Stop queue on
  first error" is on in Settings). Fix the problem shown in the
  Console and run them again.

### Your first test run (do this before auto-publish)

1. In **Settings**, confirm **Auto-publish is OFF** (it is OFF by
   default).
2. Tick **one** listing that has photos, on the Listings tab.
3. Press **▶ Start queue**. The form opens and fills. Check the
   **Console** tab: every step is logged.
4. Look at the filled form on screen: title, price, description,
   location, category, photos. If anything is wrong, note the field
   name from the Console and fix the template — do not publish.
5. Only when one listing fills correctly: turn **Auto-publish ON** in
   Settings, press **Save settings**, and run again.

---

## Tab 3: Add / Edit — every field explained

This tab creates a new listing template or edits the one you opened
with **Edit**. The heading says "Add new listing" or "Edit listing".

### Name (for you only)

A label only you see, e.g. `Car Lockout — Brandon`. Use names that
help you find listings later. Required.

### Service

A dropdown of all 40 services, grouped: **Automotive** (14),
**Residential** (6), **Commercial** (20). Pick the service this
listing advertises. The service name can appear in your title and
description automatically via the `{service}` placeholder (see
[Title & description templates](#title--description-templates)).

### City

A dropdown of the 7 cities: Tampa, St. Petersburg, Clearwater,
Brandon, Riverview, Plant City, Lakeland (all FL). The city is typed
into Facebook's Location box and picked from Facebook's suggestions,
and it can appear in your title/description via `{city}`.

### Price ($) and Price vary ± ($)

- **Price** is the base price, e.g. `120`.
- **Price vary** is how much the price may move up or down each time,
  e.g. `20` means the posted price will be somewhere between $100 and
  $140, always rounded to the nearest $5. Set it to `0` for an exact,
  unchanging price.

### Vehicle make (for the {make} placeholder — optional)

A dropdown of 26 vehicle makes (Mercedes, Land Rover, Range Rover,
Nissan, Mazda, Ford, Toyota, Honda, BMW, …) plus a box underneath
where you can **type any other make**. If you type one, it wins over
the dropdown. The make appears in your title/description wherever you
write `{make}` — for example, title `{make} Key Replacement – {city}`
with make `Toyota` becomes "Toyota Key Replacement – Tampa".

Leave it on **"— No specific make —"** for house and commercial
services, where no car make applies. The 5 car-make example listings
already have their make set.

### Title & description templates

These two boxes are the heart of the variation. They are **recipes**,
not fixed text: every post picks fresh wordings from them.

Two tools you can use inside them:

1. **Choice groups** — write options inside `{` `}` separated by `|`:
   `{Car Lockout Service|Car Lockout Help|Locked Out of Your Car}`.
   Each post picks **one** option at random. You can put choice groups
   anywhere, even inside sentences, and you can nest them.
2. **Placeholders** — these are replaced automatically:
   - `{city}` → the short city name, e.g. `Tampa`
   - `{cityFull}` → the full city, e.g. `Tampa, FL`
   - `{service}` → the service name, e.g. `Car Lockout`
   - `{make}` → the vehicle make, e.g. `Toyota` (empty if none set)

Example title template:

```text
{Car Lockout Service|Car Lockout Help|Locked Out of Your Car} – {city}
```

could post as "Car Lockout Help – Tampa" one time and "Locked Out of
Your Car – Tampa" the next.

Example description template:

```text
{Mobile car lockout service in {city}.|Fast mobile car lockout help in {city}.} We can help if your keys are locked inside your vehicle. {Call or message for service.|Message us for fast service.}
```

**Tips:**

- Put your phone number or contact wording inside the description
  template (there is no separate phone box — see the requirements
  table).
- The more options you write in each `{...}` group, the more different
  your posts look. Two or three options per group is a good start.
- Use **Preview variation** on the Listings tab to see a real example
  before posting.

### Category — Condition — Availability — Product tags

- **Category** — a dropdown of the 26 category names Facebook itself
  offers (Tools, Furniture, Household, …, Auto parts, Miscellaneous,
  Vehicles), plus a box underneath to **type the exact Facebook name**
  if you ever need one that is not in the list (typed text wins).
  Leave it on "— Skip category —" only if you want Facebook's
  category left untouched — but Facebook usually requires a category,
  so set one. **There is no "Services" category on Facebook** — see
  the requirements table. A blank category produces a visible warning
  in the Console instead of failing silently.
- **Condition** — New, Used - Like New, Used - Good, Used - Fair,
  plus the same type-your-own box. For services, "New" is the usual
  choice. (These are Facebook's standard names; they have not yet
  been verified live — if Facebook shows different names, type the
  exact name in the box.)
- **Availability** — "List as Single Item" or "List as In Stock"
  (Facebook's own names). Leave it on "Leave Facebook default" to
  keep whatever Facebook pre-selects (Single Item).
- **Product tags** — words that help buyers find the listing, comma
  separated, e.g. `locksmith, car key, Tampa`. Placeholders
  `{city}`/`{service}`/`{make}` work here too. Each tag is entered
  separately on Facebook, and the tool checks the tag actually stuck.

If a listing leaves any of these blank, the matching **default** in
Settings is used instead (see
[Settings](#tab-5-settings--every-setting-explained)). A value on the
listing always wins over the default.

### Photos: adding pictures to a listing

**Upload from your computer (recommended):**

- Click **Choose photos** (the "Photos — upload" box) and select 1 or
  more pictures. Thumbnails appear below. Click the **✕** on a
  thumbnail to remove that photo.
- Uploaded photos are **saved in this Chrome profile** and attached
  automatically on every post of this listing. Keep the originals on
  your computer: if you clear Facebook's site data, the saved copies
  are deleted, and Export does not include them — another profile or
  computer needs its own upload.
- Prefer JPG pictures under ~5 MB each. 2–4 photos per listing is
  ideal.

**…or image URLs (one per line):**

- Paste **direct image links** ending in `.jpg`, `.png` or `.webp`,
  e.g. from your own website or an image host that serves the file
  directly. Google Drive "share" links do **not** work as direct
  images.
- If a photo cannot be downloaded, the Console names the failing URL
  and the listing is skipped for publishing — fix the URL and retry.

You can mix uploads and links on one listing: uploads attach first,
then links fill the remaining photo slots (up to **Max images** in
Settings, default 10). With no photos at all, the tool fills
everything else and stops before Publish with a clear warning — add
photos, or add them by hand on Facebook in Fill-only mode.

### Buttons at the bottom

- **Save changes / Add listing** — saves the template. Name, title
  template and description template are required; the tool tells you
  if one is missing.
- **+ New blank listing** — clears the form for a fresh template.
- **Restore the 10 example listings** — asks first, then **replaces
  ALL of your listings** with the original 10 examples. Your edits
  will be lost. (Uploaded photos stay attached to the examples with
  the same names.)

---

## Tab 4: Renew

Facebook lets you **renew** some older listings so they appear fresh
again — but only sometimes, and sometimes only inside each listing's
"..." menu. This tab is a best-effort helper, not a guarantee.

1. **1. Open Selling page** — opens your Marketplace "Your listings"
   page.
2. **2. Scan this page for Renew buttons** — looks for visible Renew
   controls and reports how many it found in the Console.
3. **3. Renew all found (5s apart)** — asks first, then clicks the
   Renew controls one by one, 5 seconds apart.

**To repost an old listing as a NEW listing instead:** go to the
Listings tab, **Duplicate** its template, change the city or title,
and run it through the queue. That gives a fresh listing with varied
wording — this works for every listing, unlike Renew.

---

## Tab 5: Settings — every setting explained

Press **Save settings** after changing anything here, or the changes
will not stick.

### Auto-publish (Fill + Publish). OFF = Fill-only dry-run.

- **OFF (default, safe):** the tool fills the form and stops after
  each listing, so you can review. Nothing is ever published.
- **ON:** the tool fills the form, clicks **Next**, then **Publish**,
  and moves on to the next listing by itself.

⚠ **Keep OFF until you have watched one listing fill correctly** on
the live form (see [Your first test run](#your-first-test-run-do-this-before-auto-publish)).

### Interval min (sec) / Interval max (sec)

The random wait between posts, in seconds. Default **180–300**
(3–5 minutes). Before each post after the first, the tool waits a
random time inside this range. Longer waits look more human; very
short waits (e.g. 30–60s) increase the risk Facebook flags the
account. The countdown shows the wait.

### Max per run

The most listings one Start will process. Default **10**. If you tick
more listings than this, only the first ones in ticked order run;
run again for the rest. This cap protects a new account from posting
too much at once.

### Max images

The most photos attached to one listing. Default **10**. Uploads
attach first, then links fill the remaining slots, up to this number
(Facebook's own form shows its photo limit).

### Stop queue on first error

- **OFF (default):** if one listing fails, the queue continues with
  the next one.
- **ON:** the queue stops at the first failure so you can look at
  what went wrong.

### Posting hours — only run the queue between these times

- **Tick the box** to switch posting hours on, then set **From** and
  **To** times. Times use **your computer's local time** (e.g. Tampa
  time if that is where the computer is). Default hours are
  **09:00–21:00**, switched off by default.
- **Overnight hours work:** e.g. From `22:00` To `06:00` means
  "only post between 10pm and 6am".
- **Same start and end** (e.g. 09:00–09:00) means "always on".
- **Outside your hours**, the queue waits — on the listing form
  page — and the countdown shows the time left until your hours
  begin. It then continues by itself. A reload during the wait is
  safe: the wait is remembered.
- If the times are ever invalid, the tool simply ignores posting
  hours rather than getting stuck.

### Default category / condition / availability / product tags

These are **fallbacks**: they are used only when a listing leaves
that field blank. A value set on the listing itself always wins.

- **Default category** — dropdown of Facebook's 26 names + a
  type-your-own box (typed text wins). "— Skip category —" means no
  default.
- **Default condition** — same pattern.
- **Default availability** — "List as Single Item" / "List as In
  Stock" / leave Facebook's default.
- **Default product tags** — comma-separated, e.g.
  `locksmith, {service}, {city}`. Placeholders work here too.

### Backup / restore

- **Export listings (JSON)** — puts all your listing templates as
  text into the big box below. **Copy that text and keep it safe**
  (paste it into a file). This is your backup.
- **Import JSON** — paste previously exported text into the box and
  press Import. It **replaces** all current listings with the
  imported ones.
- Export/import covers listing text, prices, cities and image URLs
  only. **Uploaded photos are NOT included** — they stay in the
  browser profile they were uploaded in, and must be uploaded again
  on another profile or computer.

### Multiple Facebook accounts (note at the bottom of Settings)

Use a separate Chrome profile per account (see
[Multiple accounts](#using-more-than-one-facebook-account)). Using a
separate proxy per profile reduces flag risk. No posting volume is
100% safe — start slow (a few listings a day) and watch for Facebook
warnings.

---

## Tab 6: Console — reading the diary

The Console prints **everything the tool does, live, as it happens** —
every fill step, every click, every wait, every warning. If anything
ever looks wrong, this tab tells you what happened and why.

- **Top line** — the next-post countdown (same as the status bar),
  and a **Clear console** button that erases the diary (it does not
  affect listings or the queue).
- **Each diary line** has a time stamp and a colored marker on the
  left:
  - **Grey** — normal information ("Filling form: …", "Attached 2
    photo(s)").
  - **Green** — success ("Published: …", "Queue finished: 8 done").
  - **Amber** — a warning ("Category is blank", "Publish button
    stayed disabled"). Read these: they usually name the exact
    problem and the fix.
  - **Red** — an error ("Refusing to fill: not the item create
    form", "Import failed").
- The diary **scrolls by itself** to show the newest line — unless
  you have scrolled up to read older lines, in which case it leaves
  your place alone.
- The last **200 lines** are kept, including across page refreshes.
- The **status bar** at the very bottom of the panel always shows the
  latest diary line on the left, and the countdown on the right.

**Tip:** if you report a problem, open the Console, copy the last
20–30 lines, and send them along with a screenshot of the Facebook
form. That is usually enough to find the cause.

---

## How the variation works (plain words)

For every post, the tool:

1. Picks **one option** from each `{a|b|c}` choice group in the title
   and description.
2. Fills in `{city}`, `{service}` and `{make}` from the listing.
3. Picks a **price** within your "vary by" range, rounded to $5.
4. Checks the result against **every combination already published**
   from this browser profile. If it was posted before, it tries again
   (up to 25 tries) until it finds a fresh one. Only published
   combinations are remembered — Fill-only dry runs do not count.
5. Posts it, and remembers the combination so it is not repeated.

**What this means for you:** the more options you write in your
templates (and the more cities/services/makes you use), the longer
the tool can keep every post unique. If **Preview variation** starts
saying "Fresh combination: no", add more wording options to that
template.

**Note:** the memory of posted combinations lives in each Chrome
profile separately. Two profiles posting the same templates could
still produce the same wording — vary the templates per profile if
that matters to you.

## Using more than one Facebook account

The tool always posts as **the Facebook account logged in to that
Chrome profile**. To use several accounts on one laptop:

1. In Chrome, click your **profile icon** (top-right) → **Add** →
   **Continue without an account**. Name the new profile.
2. In the new profile window, log in to the second Facebook account.
3. Install Tampermonkey in that profile and add the script the same
   way (see [Install](#1-install-5-minutes)).
4. Repeat for each account. Each profile keeps its own listings,
   photos and posted-combination memory.

**Safety notes:**

- Using several accounts on one laptop is generally workable, but
  Facebook may flag accounts based on activity or login patterns.
  No setup is 100% safe.
- Using a **separate proxy for each Chrome profile** is the safer
  setup, because the accounts then do not share one internet address.
- Start slow on every account — especially a brand-new one (see
  [Facebook safety](#facebook-safety--please-read)).

## A typical session, step by step

1. Open Chrome (the right profile) and go to Facebook Marketplace.
2. On the **Listings** tab, tick the listings you want to post today.
3. Press **Preview variation** and check one or two examples look
   right.
4. Press **▶ Start queue** and confirm. The tool goes to the listing
   form and works through your ticked listings, waiting between posts.
5. Watch the **Console** and the **countdown**. Leave the tab open.
6. When it finishes, check the Console's summary line
   ("Queue finished: 8 done, 0 failed"). Check one or two live
   listings on Facebook.
7. If any failed, read the note under the listing in the Queue tab
   and the Console lines, fix the cause (usually missing photos or a
   blank category), and run those listings again.

## If something goes wrong

| What you see | What it usually means | What to do |
|---|---|---|
| Panel doesn't appear | Tampermonkey is off, or you are not on a Marketplace page | Check Tampermonkey shows the script Enabled; open `facebook.com/marketplace/*`; refresh once. |
| "Field not found: Title / Price / …" in the Console | Facebook changed its form layout | Note the field name from the Console, fill that field by hand for now, and report the field + a screenshot. |
| Photos not attached | Uploaded photos were cleared, or an image link is not a direct file | Check the editor still shows thumbnails (re-upload if site data was cleared). Links must end in `.jpg`/`.png`/`.webp` and download directly. The Console names the failing URL. |
| "Photo storage unavailable" in the Console | This browser/profile blocks the photo store | Image URLs still work; try another Chrome profile for uploads. |
| "No photos" / publish skipped | The listing has no photos at all | Add photos in Add / Edit (see [Photos](#photos-adding-pictures-to-a-listing)). |
| "Category is blank" warning | No category on the listing and no default in Settings | Set a category on the listing or a default in Settings. |
| "Publish button stayed disabled" | Usually missing photos or a required field | Run in Fill-only mode and look at the form: the empty field is the cause. |
| Queue stops after 1 listing | Fill-only mode pauses after each fill, by design | Review the filled form, untick that listing, and press Start again — or turn Auto-publish ON in Settings for continuous runs. |
| "Outside posting hours …" in the Console | Posting hours are on and it is currently outside your hours | Nothing is wrong: the countdown shows the wait until your hours begin, then it continues by itself. Or switch posting hours off in Settings. |
| "Refusing to fill: not the item create form" | The tool landed on a different Facebook page (e.g. the vehicle form) | Press **Open create page** in the Queue tab, or press Start again — the tool navigates to the right form itself. |
| "Renew" finds nothing | Facebook is not offering Renew on those listings right now | Normal. Use Duplicate + queue to repost as a new listing instead. |
| Script asks about a host on first photo download | Tampermonkey asking permission to fetch an image link | Allow it — the script needs to download your linked photos. |

## Facebook safety — please read

- **Start slow.** A few listings a day at first, especially on a
  brand-new account. Build up gradually. Posting a lot, very fast,
  from a new account is the fastest way to get restricted.
- **Warm up a new account first:** use it like a person for a while
  (complete the profile, browse, join a group or two) before running
  the tool on it.
- **Facebook's rules apply.** Marketplace has posting limits and
  content rules, and Facebook can restrict any account. This tool
  works within the normal posting form and pauses between posts like
  a person would, but **no automation can guarantee an account will
  never be flagged**. If Facebook shows a warning or a restriction,
  stop and wait — do not keep posting.
- **Keep the wording honest.** The templates describe real services
  you actually offer, in areas you actually serve.
- **One account per Chrome profile**, and a separate proxy per
  profile if you run several accounts (see above).
- **Never share your Facebook password** with anyone, including in
  support chats. The tool never asks for it — it uses the account
  already logged in to Chrome.

## Updating the script

Tampermonkey does **not** update this script by itself. When you
receive a new version:

1. Tampermonkey icon → click the script name to open it.
2. Select all (Ctrl+A), delete, paste the new version's full contents.
3. Press **Ctrl+S**, then refresh Facebook.

Your listings, photos and settings are kept — they live in the
browser, not in the script file.

## Current status — what is verified, what is not

Honest status as of Nov 14, 2026:

- **Verified live on Facebook:** the panel runs; the form fills;
  **Category selection works** (confirmed Nov 14); Location is filled
  from Facebook's suggestions; photos attach (seen in the listing
  preview twice).
- **Built and lab-tested, not yet verified live:** Product tags,
  Availability, Condition option names, the Next → Publish click
  flow, Renew, the Vehicle Make field, posting hours, the panel
  resize drag, and the Start-navigation fix (v1.1.10: Start pressed
  on the vehicle form previously filled the wrong form — fixed, but
  the fix itself has not been run live yet). These are covered by
  164 automated checks, but a live run is still the real proof —
  which is why the first run should be Fill-only (see above).
- **Known Facebook limits:** no "Services" category exists for item
  listings; Renew only appears on some listings; photo downloads need
  direct image links.

## Appendix A — services included (40)

**Automotive (14):** Automotive Locksmith · Car Lockout · Car Key
Replacement · Key Programming · Key Fob Replacement · Push-to-Start
Key Replacement · Ignition Key Replacement · Ignition Repair · Broken
Key Extraction · Mercedes Key Replacement · Land Rover / Range Rover
Key Replacement · Nissan Key Replacement · Mazda Key Replacement ·
Ford Key Replacement.

**Residential (6):** House Lockout · Rekey Service · Lock Replacement ·
Deadbolt Installation · Mailbox Lock Replacement · Smart Lock
Installation.

**Commercial (20):** Commercial Lockout · Commercial Lock Replacement ·
Commercial Rekey · Master Key Systems · Panic Bar Repair · Panic Bar
Installation · Exit Device Service · Door Closer Repair / Replacement ·
Access Control Installation · Keypad Lock Installation · Electronic
Lock Installation · Storefront Door Lock Repair · Office Lock
Replacement · High-Security Lock Installation · Restricted Key Systems ·
Push Bar / Crash Bar Service · Commercial Door Hardware Repair · Safe
Lockout / Safe Service · File Cabinet Lock Replacement · Commercial Key
Duplication.

**Cities (7):** Tampa · St. Petersburg · Clearwater · Brandon ·
Riverview · Plant City · Lakeland — all FL, plus surrounding areas
(choose the nearest city for surrounding areas).

## Appendix B — version history (short)

- **v1.0.0** — first version: dashboard, 10 example listings,
  variation, queue, Fill-only mode, photo links.
- **v1.1.0** — photo upload from your computer.
- **v1.1.1–v1.1.3** — form-filling fixes from live testing
  (description editor, location suggestions, category dropdowns).
- **v1.1.4** — Category/Condition dropdowns in the panel, human-like
  clicks and pauses.
- **v1.1.5** — Product tags + Availability.
- **v1.1.6** — Next → Publish flow; returns to a fresh form after
  each publish.
- **v1.1.7** — live Console tab + next-post countdown.
- **v1.1.8** — Vehicle Make field + posting-hours scheduling.
- **v1.1.9** — resizable panel; Start navigates to the create form.
- **v1.1.10** — fix: Start on the vehicle form now goes to the item
  form; the fill step refuses to run on the wrong page.

## Files

- `locksmith-marketplace-poster.user.js` — the script (v1.1.10).
  Paste its full contents into Tampermonkey.
- `README.md` — this guide.
