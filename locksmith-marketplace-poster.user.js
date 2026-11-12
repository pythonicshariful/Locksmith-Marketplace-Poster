// ==UserScript==
// @name         Locksmith Marketplace Poster (Standalone)
// @namespace    https://locksmith-marketplace-poster.local
// @version      1.1.2
// @description  Standalone Facebook Marketplace auto-listing panel for locksmith services. No server needed: listings, variation, schedule and queue all live in Tampermonkey storage; photos can be uploaded from your computer (stored in the browser) or given as image links. Fill-only dry-run mode included for safe live testing.
// @author       Shariful Islam
// @match        https://www.facebook.com/marketplace/*
// @match        https://www.facebook.com/marketplace
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      *
// @run-at       document-idle
// ==/UserScript==
/*
 * Locksmith Marketplace Poster — STANDALONE v1.1.2
 * -------------------------------------------------
 * Built for hammadsolomon (Fiverr order FO5234353C085, $200 one-time).
 * Requirements covered:
 *  - 20-50 prepared listings, stored locally in the browser (no server).
 *  - Select which listings to post, posting interval / schedule, Fill-only
 *    or Fill + Publish mode.
 *  - Variation: spintax {a|b|c} + {city} / {service} / {make} tokens +
 *    price jitter + already-used combination tracking, so the exact same
 *    title/description is not posted repeatedly.
 *  - Photos: upload from the computer (stored in IndexedDB in this
 *    Chrome profile, reused for every post) and/or image URLs.
 *    Uploaded photos attach first; links fill the remaining slots.
 *  - Renew/repost helper on the Selling page (best-effort — Facebook
 *    changes this UI often; see README).
 *  - Multiple accounts = multiple Chrome profiles, one install per profile.
 *    This script never switches Facebook accounts itself.
 *  - v1.1.0 adds photo upload (IndexedDB). v1.0.0 was links-only.
 *  - v1.1.1 fixes live field-finding after the Nov 12 live test reported
 *    "Field not found: Description" with empty Title/Price: the finder
 *    now also matches contenteditable / Lexical editors, aria-labelledby,
 *    name/id and nearby label text (scored, best match wins), never
 *    matches the script's own panel, expands "More details" before
 *    searching, and logs field diagnostics when a field is missing.
 *  - v1.1.2 fixes location selection from the live DOM the user sent
 *    (ul[role="listbox"] of li[role="option"] rows, first row = the
 *    city): after typing, the script waits for the listbox, clicks the
 *    FIRST suggestion row with a full pointer/mouse sequence, verifies
 *    the listbox closed, and falls back to a plain click, then to
 *    ArrowDown + Enter.
 *
 * LIVE-TEST STATUS: local syntax + logic tests pass. Facebook form
 * selectors have NOT been verified against a live logged-in Marketplace
 * create page in this build. Use Fill-only (dry-run) mode first, check
 * one listing by hand, then enable Fill + Publish. See README.md.
 */
(function () {
'use strict';

/* ============================== CONFIG ============================== */

const CREATE_ITEM_URL = 'https://www.facebook.com/marketplace/create/item';
const SELLING_URL = 'https://www.facebook.com/marketplace/you/selling';
const STORE = {
  listings: 'lmp_listings_v1',
  settings: 'lmp_settings_v1',
  queue: 'lmp_queue_v1',
  used: 'lmp_used_v1',
  log: 'lmp_log_v1'
};

const CITIES = [
  'Tampa, FL', 'St. Petersburg, FL', 'Clearwater, FL', 'Brandon, FL',
  'Riverview, FL', 'Plant City, FL', 'Lakeland, FL'
];

const SERVICES = {
  Automotive: [
    'Automotive Locksmith', 'Car Lockout', 'Car Key Replacement',
    'Key Programming', 'Key Fob Replacement', 'Push-to-Start Key Replacement',
    'Ignition Key Replacement', 'Ignition Repair', 'Broken Key Extraction',
    'Mercedes Key Replacement', 'Land Rover / Range Rover Key Replacement',
    'Nissan Key Replacement', 'Mazda Key Replacement', 'Ford Key Replacement'
  ],
  Residential: [
    'House Lockout', 'Rekey Service', 'Lock Replacement',
    'Deadbolt Installation', 'Mailbox Lock Replacement', 'Smart Lock Installation'
  ],
  Commercial: [
    'Commercial Lockout', 'Commercial Lock Replacement', 'Commercial Rekey',
    'Master Key Systems', 'Panic Bar Repair', 'Panic Bar Installation',
    'Exit Device Service', 'Door Closer Repair / Replacement',
    'Access Control Installation', 'Keypad Lock Installation',
    'Electronic Lock Installation', 'Storefront Door Lock Repair',
    'Office Lock Replacement', 'High-Security Lock Installation',
    'Restricted Key Systems', 'Push Bar / Crash Bar Service',
    'Commercial Door Hardware Repair', 'Safe Lockout / Safe Service',
    'File Cabinet Lock Replacement', 'Commercial Key Duplication'
  ]
};
const ALL_SERVICES = Object.values(SERVICES).flat();

const DEFAULT_SETTINGS = {
  intervalMinSec: 180,
  intervalMaxSec: 300,
  autoPublish: false, // SAFE DEFAULT: Fill-only. Turn on only after a live dry-run.
  typingMsMin: 25,
  typingMsMax: 80,
  maxImages: 10,
  maxPerRun: 10,
  stopOnError: false,
  categoryDefault: '',
  conditionDefault: ''
};

/* Seed listings: the buyer's own 10 examples (Nov 8), turned into
 * spintax templates. Images are intentionally EMPTY — the buyer must
 * add real image URLs (or add photos by hand in Fill-only mode).
 * Facebook requires at least 1 photo; a listing with no images will
 * fill everything else and stop before Publish with a clear warning. */
function seedListings() {
  const base = (id, name, service, city, price, priceVary, title, desc) => ({
    id, name, service, city, price, priceVary,
    titleTemplate: title, descriptionTemplate: desc,
    category: '', condition: '', images: [], enabled: true, createdAt: Date.now()
  });
  return [
    base('seed-01', 'Car Lockout — Tampa', 'Car Lockout', 'Tampa, FL', 60, 10,
      '{Car Lockout Service|Car Lockout Help|Locked Out of Your Car} – {city}',
      '{Mobile car lockout service in {city}.|Fast mobile car lockout help in {city}.} We can help if your keys are locked inside your vehicle. {Call or message for service.|Message us for fast service.|Call or message for availability.}'),
    base('seed-02', 'House Lockout — St. Petersburg', 'House Lockout', 'St. Petersburg, FL', 70, 10,
      '{House Lockout Service|House Lockout Help|Locked Out of Your House} – {city}',
      '{Mobile locksmith service for house and apartment lockouts in {city}.|House and apartment lockout service in {city}.} {Call or message for availability.|Message us for availability.}'),
    base('seed-03', 'Car Key Replacement — Clearwater', 'Car Key Replacement', 'Clearwater, FL', 120, 20,
      '{Car Key Replacement|Car Key Replacement & Programming} – {city}',
      '{Mobile car key replacement and programming for many vehicle makes and models in {city}.|Car key replacement and programming in {city} for many makes and models.} Message with your car year, make, and model for pricing.'),
    base('seed-04', 'Mercedes Key — Tampa', 'Mercedes Key Replacement', 'Tampa, FL', 120, 20,
      '{Mercedes Key Replacement|Mercedes Car Key Replacement} – {city}',
      '{Mobile Mercedes key replacement and programming service in {city}.|Mercedes key replacement and programming in {city}.} Message with the year and model of your Mercedes for availability and pricing.'),
    base('seed-05', 'Land Rover / Range Rover Keys — Tampa', 'Land Rover / Range Rover Key Replacement', 'Tampa, FL', 120, 20,
      '{Land Rover & Range Rover Key Replacement|Range Rover Key Replacement} – {city}',
      '{Mobile key replacement and programming for many Land Rover and Range Rover models in {city}.|Key replacement and programming for Land Rover and Range Rover in {city}.} Send the vehicle year and model for availability.'),
    base('seed-06', 'Nissan Keys — Tampa', 'Nissan Key Replacement', 'Tampa, FL', 100, 20,
      '{Nissan Key Replacement & Programming|Nissan Car Keys} – {city}',
      '{Replacement and programming for Nissan keys, smart keys, push-to-start keys, and remotes in {city}.|Nissan key, smart key and remote programming in {city}.} Message with the year and model.'),
    base('seed-07', 'Mazda Keys — Tampa', 'Mazda Key Replacement', 'Tampa, FL', 100, 20,
      '{Mazda Key Replacement|Mazda Car Key Replacement} – {city}',
      '{Mobile Mazda car key replacement and programming for many models in {city}.|Mazda key replacement and programming in {city}.} Send the vehicle year and model for pricing.'),
    base('seed-08', 'Ford Keys — Tampa', 'Ford Key Replacement', 'Tampa, FL', 100, 20,
      '{Ford Key Replacement & Programming|Ford Car Keys} – {city}',
      '{Mobile Ford key replacement, smart key programming, remote programming, and lost-key service for many Ford vehicles in {city}.|Ford key replacement and programming in {city}.} Message with the year and model.'),
    base('seed-09', 'Commercial Lock Change — Tampa', 'Commercial Lock Replacement', 'Tampa, FL', 90, 20,
      '{Commercial Lock Replacement|Commercial Lock Change} – {city}',
      '{Commercial locksmith service for offices, stores, warehouses, and other businesses in {city}.|Lock replacement and security upgrades for businesses in {city}.} Message for availability.'),
    base('seed-10', 'Panic Bar Service — Tampa', 'Panic Bar Repair', 'Tampa, FL', 110, 20,
      '{Panic Bar Repair & Installation|Panic Bar / Exit Device Service} – {city}',
      '{Commercial panic bar and exit device repair, replacement, and installation for businesses and commercial properties in {city}.|Panic bar and exit device service in {city}.} Message for availability.')
  ];
}

/* ============================== STORAGE ============================= */

function storeGet(key, fallback) {
  try {
    const v = (typeof GM_getValue === 'function') ? GM_getValue(key, undefined) : undefined;
    if (v === undefined || v === null) return fallback;
    return (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) ? JSON.parse(v) : v;
  } catch (e) { return fallback; }
}
function storeSet(key, value) {
  try {
    if (typeof GM_setValue === 'function') GM_setValue(key, JSON.stringify(value));
  } catch (e) { /* storage unavailable — panel still works for this page load */ }
}
function loadListings() {
  const list = storeGet(STORE.listings, null);
  if (Array.isArray(list) && list.length) return list;
  const seed = seedListings();
  storeSet(STORE.listings, seed);
  return seed;
}
function saveListings(list) { storeSet(STORE.listings, list); }
function loadSettings() { return Object.assign({}, DEFAULT_SETTINGS, storeGet(STORE.settings, {})); }
function saveSettings(s) { storeSet(STORE.settings, s); }
function loadQueue() { return storeGet(STORE.queue, { running: false, items: [], index: 0, startedAt: 0 }); }
function saveQueue(q) { storeSet(STORE.queue, q); }
function loadUsed() { const u = storeGet(STORE.used, []); return Array.isArray(u) ? u : []; }
function saveUsed(u) { storeSet(STORE.used, u.slice(-500)); }

/* ============================== UTILS =============================== */

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDelay(min, max) { return sleep(randInt(min, max)); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function uid() { return 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return 'h' + h.toString(36);
}
function nowTime() { return new Date().toLocaleTimeString(); }

/* ============================== LOG ================================= */

let logEl = null;
function addLog(msg, kind) {
  const line = { t: nowTime(), msg: String(msg), kind: kind || 'info' };
  const log = storeGet(STORE.log, []);
  log.push(line);
  storeSet(STORE.log, log.slice(-100));
  if (logEl) {
    const div = document.createElement('div');
    div.className = 'lmp-logline lmp-' + line.kind;
    div.textContent = '[' + line.t + '] ' + line.msg;
    if (typeof logEl.prepend === 'function') logEl.prepend(div);
    else logEl.appendChild(div);
  }
  const statusEl = document.getElementById('lmp-status-text');
  if (statusEl) statusEl.textContent = line.msg;
}

/* ==================== SPINTAX + VARIATION =========================== */
/* Supports {option1|option2} (may appear many times, innermost-first
 * so nested groups also spin) and tokens {city}, {service}, {make}.
 * renderListing() resolves tokens BEFORE spinning, because templates
 * nest tokens inside spintax options. */

function spinText(text) {
  if (!text) return '';
  let out = String(text);
  let guard = 0;
  while (out.includes('{') && out.includes('|') && out.includes('}') && guard < 50) {
    guard++;
    const next = out.replace(/\{([^{}]*)\}/g, (m, inner) => {
      if (!inner.includes('|')) return m;
      const opts = inner.split('|');
      return opts[randInt(0, opts.length - 1)];
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

function applyTokens(text, listing) {
  const cityShort = String(listing.city || '').split(',')[0].trim();
  const make = (listing.service || '').replace(/ Key Replacement.*$/i, '')
    .replace(/.*\b(Mercedes|Land Rover|Range Rover|Nissan|Mazda|Ford)\b.*/i, '$1');
  return String(text || '')
    .replace(/\{city\}/gi, cityShort)
    .replace(/\{cityFull\}/gi, listing.city || '')
    .replace(/\{service\}/gi, listing.service || '')
    .replace(/\{make\}/gi, make || '');
}

function pickPrice(listing) {
  const base = Number(listing.price) || 0;
  const vary = Number(listing.priceVary) || 0;
  if (!base) return '';
  if (!vary) return String(base);
  const lo = Math.max(1, base - vary), hi = base + vary;
  const p = randInt(lo, hi);
  return String(Math.round(p / 5) * 5 || p);
}

/* Render one listing into a concrete title/description/price, avoiding
 * combinations already used (tracked by hash). Returns the rendered
 * object; `fresh` is false only if every attempt collided. */
function renderListing(listing, usedHashes) {
  let best = null;
  for (let attempt = 0; attempt < 25; attempt++) {
    // Tokens FIRST: templates nest {city}/{service} inside spintax
    // options ("{... in {city}.|...}"), and the spinner only matches
    // brace groups with no nested braces. Resolving tokens first
    // makes the outer spintax groups matchable.
    const title = spinText(applyTokens(listing.titleTemplate, listing)).trim();
    const desc = spinText(applyTokens(listing.descriptionTemplate, listing)).trim();
    const price = pickPrice(listing);
    const key = hashStr(title + '\n' + desc + '\n' + price + '\n' + (listing.city || ''));
    const cand = { title, description: desc, price, key, city: listing.city || '' };
    if (!usedHashes.includes(key)) return Object.assign(cand, { fresh: true });
    best = cand;
  }
  return Object.assign(best, { fresh: false });
}

function markUsed(key) {
  const used = loadUsed();
  if (!used.includes(key)) { used.push(key); saveUsed(used); }
}

/* ================= PHOTO STORE (IndexedDB) ========================== */
/* Uploaded photos live in IndexedDB under the facebook.com origin, one
 * record per photo, keyed by listing. GM storage is NOT used for image
 * bytes (too small and slow for photos). Photos stay in this Chrome
 * profile only; clearing Facebook site data deletes them; Export JSON
 * does not include them. Every function fails soft (empty result + one
 * log line) when IndexedDB is unavailable, so URL-only listings keep
 * working exactly as in v1.0.0. */

const PHOTO_DB = 'lmp-photos-v1';
const PHOTO_STORE = 'photos';
let photoDbPromise = null;
let photoStoreWarned = false;
let photoCounts = {};
let photoCountsLoaded = false;
let pendingUploadFiles = [];

function photoStoreAvailable() {
  try { return typeof window !== 'undefined' && !!window.indexedDB; } catch (e) { return false; }
}
function openPhotoDb() {
  if (!photoStoreAvailable()) return Promise.reject(new Error('IndexedDB unavailable'));
  if (photoDbPromise) return photoDbPromise;
  photoDbPromise = new Promise((resolve, reject) => {
    let req;
    try { req = window.indexedDB.open(PHOTO_DB, 1); } catch (e) { photoDbPromise = null; return reject(e); }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const store = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        store.createIndex('byListing', 'listingId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { photoDbPromise = null; reject(req.error || new Error('IndexedDB open failed')); };
  });
  return photoDbPromise;
}
function warnPhotoStoreOnce(err) {
  if (photoStoreWarned) return;
  photoStoreWarned = true;
  addLog('Photo storage unavailable (' + (err && err.message ? err.message : 'IndexedDB blocked') + ') — image URLs still work.', 'warn');
}
function isImageFile(f) {
  if (!f) return false;
  if (/^image\//.test(f.type || '')) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(f.name || '');
}
function storePhotos(listingId, files) {
  const list = Array.from(files || []).filter(isImageFile);
  if (!list.length) return Promise.resolve(0);
  return openPhotoDb().then(db => new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction(PHOTO_STORE, 'readwrite'); } catch (e) { return reject(e); }
    const store = tx.objectStore(PHOTO_STORE);
    list.forEach(f => {
      try {
        store.put({ id: listingId + '/' + uid(), listingId, name: f.name || 'photo',
          type: f.type || 'image/jpeg', size: f.size || 0, blob: f, addedAt: Date.now() });
      } catch (e) { /* one bad file must not abort the rest; tx error below reports it */ }
    });
    tx.oncomplete = () => resolve(list.length);
    tx.onerror = () => reject(tx.error || new Error('Photo save failed'));
    tx.onabort = () => reject(tx.error || new Error('Photo save aborted'));
  })).catch(e => { warnPhotoStoreOnce(e); return 0; });
}
function getStoredPhotos(listingId) {
  return openPhotoDb().then(db => new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction(PHOTO_STORE, 'readonly'); } catch (e) { return reject(e); }
    const req = tx.objectStore(PHOTO_STORE).index('byListing').getAll(listingId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error || new Error('Photo read failed'));
  })).catch(e => { warnPhotoStoreOnce(e); return []; });
}
function deleteStoredPhoto(photoId) {
  return openPhotoDb().then(db => new Promise((resolve, reject) => {
    let tx;
    try { tx = db.transaction(PHOTO_STORE, 'readwrite'); } catch (e) { return reject(e); }
    tx.objectStore(PHOTO_STORE).delete(photoId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Photo delete failed'));
  })).catch(e => { warnPhotoStoreOnce(e); return false; });
}
function deleteListingPhotos(listingId) {
  return getStoredPhotos(listingId).then(rows => {
    if (!rows.length) return 0;
    return openPhotoDb().then(db => new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(PHOTO_STORE, 'readwrite'); } catch (e) { return reject(e); }
      const store = tx.objectStore(PHOTO_STORE);
      rows.forEach(r => store.delete(r.id));
      tx.oncomplete = () => resolve(rows.length);
      tx.onerror = () => reject(tx.error || new Error('Photo delete failed'));
    }));
  }).catch(e => { warnPhotoStoreOnce(e); return 0; });
}
function copyListingPhotos(srcId, dstId) {
  return getStoredPhotos(srcId).then(rows => {
    if (!rows.length) return 0;
    return openPhotoDb().then(db => new Promise((resolve, reject) => {
      let tx;
      try { tx = db.transaction(PHOTO_STORE, 'readwrite'); } catch (e) { return reject(e); }
      const store = tx.objectStore(PHOTO_STORE);
      rows.forEach(r => store.put({ id: dstId + '/' + uid(), listingId: dstId,
        name: r.name, type: r.type, size: r.size, blob: r.blob, addedAt: Date.now() }));
      tx.oncomplete = () => resolve(rows.length);
      tx.onerror = () => reject(tx.error || new Error('Photo copy failed'));
    }));
  }).catch(e => { warnPhotoStoreOnce(e); return 0; });
}
async function refreshPhotoCounts() {
  try {
    const listings = loadListings();
    const counts = {};
    for (const l of listings) counts[l.id] = (await getStoredPhotos(l.id)).length;
    photoCounts = counts; photoCountsLoaded = true;
    if (currentTab === 'listings' && panelEl()) renderPanel();
  } catch (e) { /* counts are cosmetic; the queue resolves photos directly */ }
}
/* Resolve every photo for a listing into File objects: uploaded photos
 * first (in stored order), then image-URL downloads up to maxImages. */
async function resolveListingPhotoFiles(listing, settings) {
  const files = [];
  let fromUploads = 0, fromUrls = 0;
  const stored = await getStoredPhotos(listing.id);
  for (const row of stored.slice(0, settings.maxImages)) {
    try {
      files.push(new File([row.blob], row.name || 'photo.jpg', { type: row.type || 'image/jpeg' }));
      fromUploads++;
    } catch (e) { /* unreadable stored photo — skip it */ }
  }
  const urls = (listing.images || []).filter(Boolean)
    .slice(0, Math.max(0, settings.maxImages - files.length));
  for (let i = 0; i < urls.length; i++) {
    addLog('Downloading photo ' + (i + 1) + '/' + urls.length + '…');
    const file = await fetchImageAsFile(urls[i], files.length);
    if (file) { files.push(file); fromUrls++; }
    else addLog('Could not download photo: ' + urls[i], 'warn');
    await randDelay(300, 700);
  }
  return { files, fromUploads, fromUrls,
    totalSources: stored.length + (listing.images || []).filter(Boolean).length };
}
async function loadEditorThumbs() {
  const box = document.getElementById('lmp-thumbs');
  if (!box || !editingId) return;
  const rows = await getStoredPhotos(editingId);
  if (document.getElementById('lmp-thumbs') !== box) return; // editor re-rendered meanwhile
  if (!rows.length) {
    box.innerHTML = '<p class="lmp-note" style="margin:0">No uploaded photos yet for this listing.</p>';
    return;
  }
  box.innerHTML = '';
  rows.forEach(row => {
    const wrap = document.createElement('span');
    wrap.className = 'lmp-thumb';
    const img = document.createElement('img');
    img.alt = row.name || 'photo';
    try { img.src = URL.createObjectURL(row.blob); } catch (e) { /* leave broken icon; name still shows in title */ }
    img.title = row.name || 'photo';
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = '✕'; btn.title = 'Remove this photo';
    btn.addEventListener('click', async () => {
      try { if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); } catch (e) {}
      await deleteStoredPhoto(row.id);
      await refreshPhotoCounts();
      loadEditorThumbs();
    });
    wrap.appendChild(img); wrap.appendChild(btn);
    box.appendChild(wrap);
  });
}
function renderPendingUploads() {
  const box = document.getElementById('lmp-pending');
  if (!box) return;
  if (!pendingUploadFiles.length) { box.innerHTML = ''; return; }
  box.innerHTML = '<p class="lmp-note" style="margin:6px 0">New photos to save (' + pendingUploadFiles.length + '): ' +
    pendingUploadFiles.map(f => esc(f.name)).join(', ') + ' — press Save to store them.</p>';
}

/* ============================ DOM HELPERS =========================== */
/* Facebook uses React. Setting .value alone does not update React
 * state, so inputs are set through the native setter + input/change
 * events, with human-like typing for the main text fields. Selectors
 * are label/aria-based (not class names) so minor Facebook redesigns
 * are less likely to break the fill. If a field cannot be found, the
 * step logs a clear warning instead of failing silently. */

function waitFor(fn, timeoutMs, intervalMs) {
  const deadline = Date.now() + (timeoutMs || 10000);
  return new Promise(resolve => {
    (function poll() {
      let found = null;
      try { found = fn(); } catch (e) { found = null; }
      if (found) return resolve(found);
      if (Date.now() > deadline) return resolve(null);
      setTimeout(poll, intervalMs || 300);
    })();
  });
}
function visible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect ? el.getBoundingClientRect() : { width: 0, height: 0 };
  const st = el.ownerDocument && el.ownerDocument.defaultView
    ? el.ownerDocument.defaultView.getComputedStyle(el) : null;
  return r.width > 0 && r.height > 0 && (!st || (st.display !== 'none' && st.visibility !== 'hidden'));
}
function allText(el) { return (el.textContent || '').trim().replace(/\s+/g, ' '); }

function inPanel(el) {
  try { return !!(el && el.closest && el.closest('#lmp-panel, #lmp-toggle')); } catch (e) { return false; }
}

function setReactValue(el, value) {
  let proto = null;
  try {
    proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  } catch (e) { proto = null; }
  const desc = proto ? Object.getOwnPropertyDescriptor(proto, 'value') : null;
  if (desc && desc.set) desc.set.call(el, value); else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/* Fill a contenteditable (Lexical) editor: React/Lexical state only
 * updates when text goes through the editing pipeline, so plain
 * textContent assignment is not enough. insertText via execCommand is
 * the path Chrome + Lexical both honour. Falls back to textContent +
 * input events when execCommand is unavailable. */
async function setEditableText(el, text, settings) {
  try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
  await randDelay(150, 400);
  el.focus();
  try { el.click(); } catch (e) {}
  await randDelay(80, 200);
  const doc = el.ownerDocument || document;
  let usedExec = false;
  try {
    if (doc.execCommand) {
      doc.execCommand('selectAll', false, null);
      doc.execCommand('delete', false, null);
      // Insert in word-ish chunks so the editor sees realistic edits.
      const chunks = String(text).match(/[^ ]+ ?/g) || [String(text)];
      for (const chunk of chunks) {
        if (!doc.execCommand('insertText', false, chunk)) break;
        usedExec = true;
        await randDelay(settings.typingMsMin, settings.typingMsMax + 60);
      }
    }
  } catch (e) { usedExec = false; }
  if (!usedExec) {
    try { el.textContent = text; } catch (e) {}
    try { el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })); } catch (e) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  el.dispatchEvent(new Event('blur', { bubbles: true }));
  return (el.textContent || '').includes(String(text).slice(0, 20));
}

async function humanType(el, text, settings) {
  if (el.isContentEditable) {
    const ok = await setEditableText(el, text, settings);
    if (!ok) addLog('Editable field may not have updated — check it on screen.', 'warn');
    return ok;
  }
  try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
  await randDelay(150, 400);
  el.focus();
  try { el.click(); } catch (e) {}
  await randDelay(80, 200);
  setReactValue(el, '');
  await randDelay(60, 150);
  const min = settings.typingMsMin, max = settings.typingMsMax;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    try { el.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true })); } catch (e) {}
    setReactValue(el, text.slice(0, i + 1));
    try { el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true })); } catch (e) {}
    await randDelay(ch === ' ' ? min + 40 : min, max + (ch === ' ' ? 90 : 0));
  }
  el.dispatchEvent(new Event('blur', { bubbles: true }));
  if (String(el.value || '') !== String(text)) {
    // One full-value retry: some Facebook inputs drop per-keystroke sets.
    setReactValue(el, text);
    await sleep(300);
  }
  if (String(el.value || '') !== String(text)) {
    addLog('Field value did not stick after typing — check it on screen.', 'warn');
    return false;
  }
  return true;
}

/* Resolve every human-readable name an element may carry: aria-label,
 * aria-labelledby targets, placeholder, name, title, label[for], and
 * data-testid. Returns lowercase parts for scoring. */
function fieldLabelText(el) {
  const parts = { aria: '', labelledby: '', ph: '', name: '', testid: '', forLabel: '' };
  try { parts.aria = (el.getAttribute('aria-label') || '').toLowerCase().trim(); } catch (e) {}
  try {
    const lb = el.getAttribute('aria-labelledby') || '';
    if (lb) {
      parts.labelledby = lb.split(/\s+/).map(id => {
        try { const t = document.getElementById(id); return t ? allText(t) : ''; } catch (e) { return ''; }
      }).join(' ').toLowerCase().trim();
    }
  } catch (e) {}
  try { parts.ph = (el.getAttribute('placeholder') || '').toLowerCase().trim(); } catch (e) {}
  try { parts.name = ((el.name || '') + ' ' + (el.id || '')).toLowerCase().trim(); } catch (e) {}
  try { parts.testid = (el.getAttribute('data-testid') || '').toLowerCase().trim(); } catch (e) {}
  try {
    if (el.id) {
      const lab = document.querySelector('label[for="' + el.id.replace(/"/g, '\\"') + '"]');
      if (lab) parts.forLabel = allText(lab).toLowerCase();
    }
  } catch (e) {}
  return parts;
}
/* Text of the nearest visible label-like element within 3 ancestors:
 * covers Facebook's floating/adjacent labels with no aria wiring. */
function nearbyLabelText(el) {
  try {
    let node = el;
    for (let depth = 0; depth < 3 && node; depth++) {
      node = node.parentElement;
      if (!node) break;
      const kids = node.querySelectorAll('label, span');
      for (const k of kids) {
        if (k === el || k.contains(el)) continue;
        const t = allText(k).toLowerCase();
        if (t && t.length <= 40) return t;
      }
    }
  } catch (e) {}
  return '';
}
function candidateFields() {
  const els = Array.from(document.querySelectorAll(
    'input, textarea, [contenteditable="true"], [role="textbox"]'));
  return els.filter(el => {
    if (inPanel(el) || !visible(el)) return false;
    if (el.tagName === 'INPUT') {
      const t = (el.type || '').toLowerCase();
      if (['hidden', 'file', 'checkbox', 'radio', 'submit', 'button', 'range', 'color'].includes(t)) return false;
    }
    return true;
  });
}
function scoreField(el, labels, preferEditable) {
  const parts = fieldLabelText(el);
  const near = nearbyLabelText(el);
  let best = 0;
  for (const label of labels) {
    const want = label.toLowerCase();
    let s = 0;
    if (parts.aria === want) s = Math.max(s, 100);
    if (parts.ph === want) s = Math.max(s, 90);
    if (parts.labelledby === want || parts.forLabel === want) s = Math.max(s, 85);
    if (near === want) s = Math.max(s, 80);
    if (parts.aria.includes(want) || parts.ph.includes(want)) s = Math.max(s, 45);
    if (parts.labelledby.includes(want) || parts.forLabel.includes(want) || near.includes(want)) s = Math.max(s, 40);
    if (parts.testid.includes(want.replace(/\s+/g, ''))) s = Math.max(s, 40);
    if (parts.name.includes(want)) s = Math.max(s, 30);
    best = Math.max(best, s);
  }
  if (best > 0) {
    const editable = !!(el.isContentEditable || el.tagName === 'TEXTAREA');
    if (preferEditable && editable) best += 20;
    if (!preferEditable && el.tagName === 'INPUT') best += 10;
    // Deprioritise the top search box and anything in a header/nav.
    try { if (el.closest('header, nav, [role="banner"], [role="navigation"]')) best -= 50; } catch (e) {}
  }
  return best;
}
function findInputByLabels(labels) {
  const preferEditable = labels.some(l => /description/i.test(l));
  let bestEl = null, bestScore = 0;
  for (const el of candidateFields()) {
    const s = scoreField(el, labels, preferEditable);
    if (s > bestScore) { bestScore = s; bestEl = el; }
  }
  return bestScore > 0 ? bestEl : null;
}
/* One bounded diagnostic dump per fill: what editable fields the page
 * actually has, so a "not found" can be fixed from the Log alone.
 * Values are never logged — only structure (tag/role/labels). */
function logFieldDiagnostics() {
  try {
    const cands = candidateFields();
    addLog('Form diagnostics: ' + cands.length + ' editable field(s) visible.');
    cands.slice(0, 12).forEach((el, i) => {
      const p = fieldLabelText(el);
      const desc = (el.tagName || '').toLowerCase() +
        (el.type ? '/' + el.type : '') +
        (el.isContentEditable ? '/editable' : '') +
        ' aria="' + p.aria + '" ph="' + p.ph + '" lb="' + p.labelledby + '" near="' + nearbyLabelText(el) + '"';
      addLog('  #' + (i + 1) + ' ' + desc);
      try { console.log('[LMP field #' + (i + 1) + ']', el, desc); } catch (e) {}
    });
  } catch (e) { addLog('Form diagnostics failed: ' + e.message, 'warn'); }
}
async function expandMoreDetails() {
  try {
    const els = Array.from(document.querySelectorAll('[role="button"], button, div, span'));
    for (const el of els) {
      if (inPanel(el) || !visible(el)) continue;
      if (allText(el).toLowerCase() !== 'more details') continue;
      const expanded = el.getAttribute('aria-expanded');
      if (expanded === 'true') return;
      el.click();
      await sleep(900);
      addLog('Expanded "More details".');
      return;
    }
  } catch (e) { /* optional step; fill continues without it */ }
}

async function fillTextField(labels, value, settings, fieldName) {
  const el = await waitFor(() => findInputByLabels(labels), 12000);
  if (!el) {
    addLog('Field not found: ' + fieldName + ' — left for manual entry. See diagnostics in Log.', 'warn');
    return false;
  }
  await humanType(el, value, settings);
  addLog('Filled: ' + fieldName);
  return true;
}

async function selectFromDropdown(labels, optionText, fieldName) {
  if (!optionText) return true; // optional field, nothing to select
  const trigger = await waitFor(() => {
    const cands = Array.from(document.querySelectorAll('[role="combobox"], [role="button"], label, div'));
    for (const el of cands) {
      if (inPanel(el) || !visible(el)) continue;
      const t = allText(el).toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      if (labels.some(l => t === l.toLowerCase() || aria === l.toLowerCase() ||
          t.startsWith(l.toLowerCase() + ' ') || aria.startsWith(l.toLowerCase()))) return el;
    }
    return null;
  }, 8000);
  if (!trigger) { addLog('Dropdown not found: ' + fieldName + ' — left for manual selection.', 'warn'); return false; }
  try { trigger.scrollIntoView({ block: 'center' }); } catch (e) {}
  trigger.click();
  await randDelay(700, 1300);
  // Type into the dropdown search box if one appeared.
  const search = findInputByLabels(['search', 'category', 'condition']);
  if (search && visible(search)) { await humanType(search, optionText, loadSettings()); await randDelay(700, 1200); }
  const option = await waitFor(() => {
    const opts = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], li, div[role="button"]'))
      .filter(o => !inPanel(o));
    const want = optionText.toLowerCase().trim();
    return opts.find(o => visible(o) && allText(o).toLowerCase() === want) ||
      opts.find(o => visible(o) && allText(o).toLowerCase().includes(want)) || null;
  }, 6000);
  if (!option) {
    addLog('Option "' + optionText + '" not found for ' + fieldName + ' — left for manual selection.', 'warn');
    document.body.click(); await sleep(300); return false;
  }
  option.click();
  await randDelay(500, 900);
  addLog('Selected ' + fieldName + ': ' + optionText);
  return true;
}

/* Location suggestions: a ul[role="listbox"] whose rows are
 * li[role="option"], each nesting a second role="option" div (the row
 * Facebook's typeahead listens on). First row = the city itself
 * ("Tampa, Florida" / City), later rows are neighbourhoods/places. */
function locationListbox() {
  const boxes = Array.from(document.querySelectorAll('[role="listbox"]'))
    .filter(b => !inPanel(b) && visible(b));
  return boxes[0] || null;
}
function firstLocationOption() {
  const box = locationListbox();
  if (!box) return null;
  const items = Array.from(box.querySelectorAll('li[role="option"]')).filter(o => visible(o));
  if (items.length) return items[0];
  const any = Array.from(box.querySelectorAll('[role="option"]')).filter(o => visible(o));
  return any[0] || null;
}
function optionTitle(opt) {
  try {
    const span = opt.querySelector('span[dir="auto"]');
    if (span) return allText(span);
  } catch (e) {}
  return allText(opt).slice(0, 60);
}
async function clickOptionRow(opt) {
  let target = opt;
  try {
    const inner = opt.querySelector('[role="option"]');
    if (inner && inner !== opt) target = inner;
  } catch (e) {}
  const PE = (typeof PointerEvent !== 'undefined') ? PointerEvent : MouseEvent;
  const ME = (typeof MouseEvent !== 'undefined') ? MouseEvent : Event;
  let rect = { left: 0, top: 0, width: 0, height: 0 };
  try { rect = target.getBoundingClientRect() || rect; } catch (e) {}
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
  const seq = [['pointerdown', PE], ['mousedown', ME], ['pointerup', PE], ['mouseup', ME], ['click', ME]];
  for (const pair of seq) {
    try {
      target.dispatchEvent(new pair[1](pair[0], { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 }));
    } catch (e) {
      try { target.dispatchEvent(new Event(pair[0], { bubbles: true })); } catch (e2) {}
    }
    await sleep(60);
  }
  return target;
}
async function setLocation(cityText, settings) {
  if (!cityText) return true;
  const el = await waitFor(() => findInputByLabels(['location', 'item location', 'where are you located']), 10000);
  if (!el) { addLog('Location field not found — left for manual entry.', 'warn'); return false; }
  await humanType(el, cityText, settings);
  await randDelay(1200, 2000);
  const cityShort = cityText.split(',')[0].trim().toLowerCase();
  const first = await waitFor(() => firstLocationOption(), 8000);
  if (first) {
    const title = optionTitle(first);
    addLog('Location suggestions open — clicking first: ' + title);
    await clickOptionRow(first);
    await sleep(1200);
    const val = String(el.value || el.textContent || '').toLowerCase();
    if (!locationListbox() || val.includes(cityShort)) {
      addLog('Location set: ' + title + ' (for ' + cityText + ')');
      return true;
    }
    try { first.click(); } catch (e) {}
    await sleep(1000);
    if (!locationListbox()) {
      addLog('Location set: ' + title + ' (for ' + cityText + ')');
      return true;
    }
    addLog('Location suggestion click did not take — trying keyboard select.', 'warn');
  } else {
    addLog('No location suggestions appeared for: ' + cityText, 'warn');
  }
  try { el.focus(); } catch (e) {}
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
  await sleep(400);
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  await sleep(800);
  const val2 = String(el.value || el.textContent || '').toLowerCase();
  if (val2.includes(cityShort) || !locationListbox()) {
    addLog('Location set via keyboard: ' + cityText);
    return true;
  }
  addLog('Location typed, no suggestion confirmed: ' + cityText + ' — check it on screen.', 'warn');
  return true;
}

/* ---- Photos: fetch image URLs -> File objects -> hidden file input. ---- */

function fetchImageAsFile(url, index) {
  return new Promise(resolve => {
    const done = blob => {
      if (!blob) return resolve(null);
      const ext = (url.split('.').pop() || 'jpg').split('?')[0].slice(0, 4) || 'jpg';
      resolve(new File([blob], 'photo-' + (index + 1) + '.' + ext, { type: blob.type || 'image/jpeg' }));
    };
    try {
      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({
          method: 'GET', url, responseType: 'blob',
          onload: r => done(r.response), onerror: () => done(null), ontimeout: () => done(null), timeout: 20000
        });
      } else {
        fetch(url).then(r => r.blob()).then(done).catch(() => done(null));
      }
    } catch (e) { done(null); }
  });
}

async function uploadPhotos(listing, settings) {
  const resolved = await resolveListingPhotoFiles(listing, settings);
  if (!resolved.totalSources) {
    addLog('No photos for this listing — upload photos or add image URLs, or add photos by hand before publishing.', 'warn');
    return { uploaded: 0, total: 0, fromUploads: 0, fromUrls: 0 };
  }
  if (!resolved.files.length) {
    addLog('Photos could not be prepared (stored photos unreadable / image links failed).', 'warn');
    return { uploaded: 0, total: resolved.totalSources, fromUploads: 0, fromUrls: 0 };
  }
  const input = await waitFor(() => {
    const ins = Array.from(document.querySelectorAll('input[type="file"]'));
    return ins.find(i => (i.getAttribute('accept') || '').includes('image')) || ins[0] || null;
  }, 10000);
  if (!input) {
    addLog('Photo upload input not found — add photos by hand.', 'warn');
    return { uploaded: 0, total: resolved.totalSources, fromUploads: resolved.fromUploads, fromUrls: resolved.fromUrls };
  }
  const dt = new DataTransfer();
  resolved.files.forEach(f => dt.items.add(f));
  input.files = dt.files;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  addLog('Attached ' + resolved.files.length + ' photo(s) (' + resolved.fromUploads + ' uploaded, ' + resolved.fromUrls + ' from links). Waiting for Facebook upload…');
  await sleep(2500 + resolved.files.length * 800);
  return { uploaded: resolved.files.length, total: resolved.totalSources,
    fromUploads: resolved.fromUploads, fromUrls: resolved.fromUrls };
}

function findButtonByText(texts) {
  // Exclude the script's own panel: its tabs include "Renew", which must
  // never be mistaken for a Facebook Renew/Publish control.
  const btns = Array.from(document.querySelectorAll('[role="button"], button, a'))
    .filter(b => !inPanel(b));
  for (const t of texts) {
    const want = t.toLowerCase();
    const hit = btns.find(b => visible(b) && (allText(b).toLowerCase() === want ||
      (b.getAttribute('aria-label') || '').toLowerCase() === want));
    if (hit) return hit;
  }
  return null;
}
async function clickButtonWhenEnabled(texts, timeoutMs, label) {
  const btn = await waitFor(() => findButtonByText(texts), timeoutMs || 15000);
  if (!btn) { addLog(label + ' button not found.', 'warn'); return false; }
  const deadline = Date.now() + (timeoutMs || 15000);
  while (Date.now() < deadline) {
    const disabled = btn.disabled || btn.getAttribute('aria-disabled') === 'true';
    if (!disabled) { btn.click(); return true; }
    await sleep(800);
  }
  addLog(label + ' button stayed disabled (Facebook may be waiting on photos/required fields).', 'warn');
  return false;
}

/* ===================== FILL + PUBLISH + QUEUE ======================= */

function isCreatePage() { return /\/marketplace\/create\//.test(location.pathname); }
function isSellingPage() { return /\/marketplace\/you\/selling/.test(location.pathname); }

async function fillListingForm(listing, rendered, settings) {
  addLog('Filling form: ' + rendered.title);
  await expandMoreDetails();
  logFieldDiagnostics();
  // Photos first — Facebook validates the form as uploads finish.
  const photos = await uploadPhotos(listing, settings);
  await fillTextField(['title', 'listing title'], rendered.title, settings, 'Title');
  if (rendered.price) await fillTextField(['price'], rendered.price, settings, 'Price');
  const category = listing.category || settings.categoryDefault;
  if (category) await selectFromDropdown(['category'], category, 'Category');
  const condition = listing.condition || settings.conditionDefault;
  if (condition) await selectFromDropdown(['condition', 'item condition'], condition, 'Condition');
  await fillTextField(['description', 'item description'], rendered.description, settings, 'Description');
  await setLocation(rendered.city, settings);
  return { photos };
}

function looksPublished() {
  const url = location.href;
  if (/\/marketplace\/item\//.test(url) || /\/you\/selling/.test(url)) return true;
  const body = (document.body.textContent || '').toLowerCase();
  return body.includes('your listing has been published') ||
    body.includes('listing published') || body.includes('your listing is live');
}

async function publishCurrentListing(settings) {
  // Some flows show Next before Publish.
  const nextBtn = findButtonByText(['Next']);
  if (nextBtn) {
    nextBtn.click();
    addLog('Clicked Next — waiting for review step…');
    await sleep(2500);
  }
  const clicked = await clickButtonWhenEnabled(['Publish', 'Post', 'Share'], 20000, 'Publish');
  if (!clicked) return false;
  addLog('Clicked Publish — waiting for confirmation…');
  const ok = await waitFor(() => (looksPublished() ? true : null), 25000, 1000);
  if (ok) { addLog('Published (confirmation seen).', 'ok'); return true; }
  addLog('No publish confirmation seen within 25s — check the page by hand.', 'warn');
  return false;
}

let queueTimer = null;
function stopQueueTimer() { if (queueTimer) { clearTimeout(queueTimer); queueTimer = null; } }

async function runQueueStep() {
  const q = loadQueue();
  if (!q.running) return;
  const settings = loadSettings();
  if (q.index >= q.items.length) {
    q.running = false; saveQueue(q);
    addLog('Queue finished: ' + q.items.filter(i => i.status === 'done').length + ' done, ' +
      q.items.filter(i => i.status === 'failed').length + ' failed.', 'ok');
    renderPanel(); return;
  }
  const item = q.items[q.index];
  const listings = loadListings();
  const listing = listings.find(l => l.id === item.listingId);
  if (!listing) {
    item.status = 'failed'; item.note = 'Listing deleted'; q.index++; saveQueue(q);
    return scheduleNextStep(2000);
  }
  if (!isCreatePage()) {
    addLog('Opening create page for: ' + listing.name);
    saveQueue(q);
    location.href = CREATE_ITEM_URL;
    return; // boot() on the new page resumes the queue.
  }
  item.status = 'posting'; saveQueue(q); renderPanel();
  await sleep(2000);
  const rendered = item.rendered || renderListing(listing, loadUsed());
  item.rendered = rendered;
  const fill = await fillListingForm(listing, rendered, settings);
  if (settings.autoPublish) {
    if (fill.photos.total > 0 && fill.photos.uploaded === 0) {
      item.status = 'failed'; item.note = 'Photos could not be attached';
      addLog('Publish skipped: no photos attached. Fix the uploaded photos / image URLs and retry this listing.', 'warn');
    } else if (fill.photos.total === 0) {
      item.status = 'failed'; item.note = 'No photos — upload photos or add image URLs first';
      addLog('Publish skipped: this listing has no photos. Upload photos in Edit, add image URLs, or post it by hand.', 'warn');
    } else {
      const ok = await publishCurrentListing(settings);
      item.status = ok ? 'done' : 'failed';
      item.note = ok ? ('Published: ' + rendered.title) : 'Publish not confirmed';
      if (ok) markUsed(rendered.key);
    }
  } else {
    item.status = 'filled';
    item.note = 'Filled only (dry-run) — review on screen, publish by hand if happy.';
    addLog('Dry-run: form filled, NOT published. Review it, then use Next in Queue to continue.', 'ok');
    // In Fill-only mode, pause the queue so the user can inspect.
    q.running = false; q.index++; saveQueue(q); renderPanel(); return;
  }
  q.index++; saveQueue(q);
  if (item.status === 'failed' && settings.stopOnError) {
    q.running = false; saveQueue(q);
    addLog('Queue stopped on error (Stop on error is ON).', 'warn'); renderPanel(); return;
  }
  const waitMs = randInt(settings.intervalMinSec, settings.intervalMaxSec) * 1000;
  addLog('Next listing in ' + Math.round(waitMs / 1000) + 's…');
  scheduleNextStep(waitMs);
}

function scheduleNextStep(waitMs) {
  stopQueueTimer();
  queueTimer = setTimeout(() => { runQueueStep(); }, waitMs);
  renderPanel();
}

function startQueue(selectedIds) {
  const listings = loadListings();
  const used = loadUsed();
  const items = selectedIds.slice(0, loadSettings().maxPerRun).map(id => {
    const listing = listings.find(l => l.id === id);
    return { listingId: id, status: 'pending', note: '', rendered: listing ? renderListing(listing, used) : null };
  }).filter(i => i.rendered);
  if (!items.length) { addLog('Select at least one listing first.', 'warn'); return; }
  const q = { running: true, items, index: 0, startedAt: Date.now() };
  saveQueue(q);
  addLog('Queue started: ' + items.length + ' listing(s), mode: ' +
    (loadSettings().autoPublish ? 'Fill + Publish' : 'Fill-only (dry-run)'));
  runQueueStep();
}
function stopQueue() {
  const q = loadQueue(); q.running = false; saveQueue(q); stopQueueTimer();
  addLog('Queue stopped.'); renderPanel();
}
function resetQueue() { saveQueue({ running: false, items: [], index: 0, startedAt: 0 }); renderPanel(); }

/* ============================ RENEW ================================= */
/* Best-effort helper. On the Selling page it looks for visible "Renew"
/ "Renew listing" controls. Facebook changes this UI often and some
 * accounts show Renew only inside a "..." menu per listing — if no
 * Renew controls are found, the panel says so plainly instead of
 * pretending it worked. Always verify one renew by hand first. */

function scanRenewables() {
  const found = [];
  const els = Array.from(document.querySelectorAll('[role="button"], button, a, [role="menuitem"]'));
  els.forEach((el, i) => {
    const t = allText(el).toLowerCase();
    if (inPanel(el) || !visible(el)) return;
    if (t === 'renew' || t === 'renew listing' || t.includes('renew listing')) {
      const card = el.closest('div');
      found.push({ index: i, label: allText(el), el });
    }
  });
  return found;
}
async function renewAllFound(delaySec) {
  if (!isSellingPage()) { addLog('Open the Selling page first (button below does this).', 'warn'); return; }
  const items = scanRenewables();
  if (!items.length) {
    addLog('No Renew buttons found on this page. Facebook may hide Renew inside each listing\'s "..." menu — renew one by hand to see the flow.', 'warn');
    return;
  }
  addLog('Found ' + items.length + ' Renew control(s). Renewing one by one…');
  for (const item of items) {
    try {
      item.el.click();
      addLog('Clicked Renew: ' + item.label);
      await sleep(2000);
      // Confirm dialog, if Facebook shows one.
      const confirm = findButtonByText(['Renew', 'Confirm', 'Yes']);
      if (confirm && confirm !== item.el) { confirm.click(); addLog('Confirmed renew dialog.'); }
      await sleep((delaySec || 5) * 1000);
    } catch (e) { addLog('Renew click failed: ' + e.message, 'warn'); }
  }
  addLog('Renew pass finished — check the Selling page to confirm.', 'ok');
}

/* ============================ PANEL UI ============================== */

const PANEL_CSS = `
#lmp-panel{position:fixed;top:0;right:0;width:430px;max-width:94vw;height:100vh;background:#101828;color:#e6e9ef;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;z-index:999999;box-shadow:-4px 0 24px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden}
#lmp-panel.lmp-collapsed{transform:translateX(390px)}
#lmp-toggle{position:fixed;top:50%;right:430px;transform:translateY(-50%);width:32px;height:64px;background:#0e9384;border:none;border-radius:8px 0 0 8px;color:#fff;cursor:pointer;z-index:999999;font-size:15px}
#lmp-panel.lmp-collapsed + #lmp-toggle, #lmp-toggle.lmp-collapsed{right:40px}
#lmp-head{background:linear-gradient(135deg,#0e9384,#1849a9);padding:12px 14px}
#lmp-head h1{margin:0;font-size:16px;color:#fff}
#lmp-head p{margin:4px 0 0;font-size:11px;color:#d6f5ef}
.lmp-tabs{display:flex;gap:4px;padding:8px;background:#1d2939}
.lmp-tab{flex:1;padding:7px 2px;background:#344054;border:none;border-radius:6px;color:#e6e9ef;font-size:12px;cursor:pointer}
.lmp-tab.lmp-active{background:#0e9384;font-weight:700}
#lmp-body{flex:1;overflow-y:auto;padding:10px}
#lmp-status{padding:9px 12px;background:#1d2939;border-top:1px solid #344054;font-size:12px;min-height:34px}
.lmp-card{background:#1d2939;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid transparent}
.lmp-card.lmp-selected{border-color:#0e9384}
.lmp-card h3{margin:0 0 4px;font-size:13px}
.lmp-card p{margin:2px 0;font-size:11px;color:#98a2b3}
.lmp-price{color:#32d583;font-weight:700}
.lmp-badge{display:inline-block;background:#7a2e0e;color:#ffd9b0;padding:1px 7px;border-radius:10px;font-size:10px;margin-left:6px}
.lmp-btn{padding:8px 12px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;background:#0e9384;color:#fff;margin:3px 3px 3px 0}
.lmp-btn.lmp-secondary{background:#344054}
.lmp-btn.lmp-danger{background:#b42318}
.lmp-btn.lmp-wide{width:100%;margin-top:8px}
.lmp-btn:disabled{opacity:.5;cursor:not-allowed}
.lmp-input,.lmp-select,.lmp-textarea{width:100%;box-sizing:border-box;padding:8px;background:#101828;border:1px solid #344054;border-radius:6px;color:#e6e9ef;font-size:13px;margin:3px 0 8px}
.lmp-textarea{min-height:70px;resize:vertical}
.lmp-label{font-size:11px;color:#98a2b3;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
.lmp-row{display:flex;gap:8px}.lmp-row>div{flex:1}
#lmp-log{font-size:11px}
.lmp-logline{padding:3px 6px;border-bottom:1px solid #1d2939;white-space:pre-wrap;word-break:break-word}
.lmp-warn{color:#fdb022}.lmp-ok{color:#32d583}.lmp-error{color:#f97066}
.lmp-note{font-size:11px;color:#98a2b3;background:#1d2939;border-radius:6px;padding:8px;margin:8px 0}
.lmp-preview{background:#101828;border:1px dashed #344054;border-radius:6px;padding:8px;font-size:12px;white-space:pre-wrap;margin:6px 0}
#lmp-thumbs{margin:6px 0}
.lmp-thumb{display:inline-block;position:relative;margin:0 8px 8px 0;vertical-align:top}
.lmp-thumb img{width:76px;height:56px;object-fit:cover;border-radius:6px;display:block;border:1px solid #344054}
.lmp-thumb button{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border:none;border-radius:50%;background:#b42318;color:#fff;font-size:11px;line-height:1;cursor:pointer;padding:0}
`;

let currentTab = 'listings';
let selectedIds = new Set();
let editingId = null;
let searchText = '';

function panelEl() { return document.getElementById('lmp-panel'); }

function buildPanel() {
  if (panelEl()) return;
  if (typeof GM_addStyle === 'function') { try { GM_addStyle(PANEL_CSS); } catch (e) {} }
  else { const st = document.createElement('style'); st.textContent = PANEL_CSS; document.head.appendChild(st); }
  const panel = document.createElement('div');
  panel.id = 'lmp-panel';
  panel.innerHTML =
    '<div id="lmp-head"><h1>🔑 Locksmith Marketplace Poster</h1>' +
    '<p>Standalone v1.1.2 &nbsp;•&nbsp; No server &nbsp;•&nbsp; Account: this Chrome profile\'s logged-in Facebook account</p></div>' +
    '<div class="lmp-tabs">' +
    '<button class="lmp-tab" data-tab="listings">Listings</button>' +
    '<button class="lmp-tab" data-tab="queue">Queue</button>' +
    '<button class="lmp-tab" data-tab="edit">Add / Edit</button>' +
    '<button class="lmp-tab" data-tab="renew">Renew</button>' +
    '<button class="lmp-tab" data-tab="settings">Settings</button>' +
    '<button class="lmp-tab" data-tab="log">Log</button></div>' +
    '<div id="lmp-body"></div>' +
    '<div id="lmp-status"><span id="lmp-status-text">Ready.</span></div>';
  document.body.appendChild(panel);
  const toggle = document.createElement('button');
  toggle.id = 'lmp-toggle'; toggle.textContent = '◀'; toggle.title = 'Show / hide panel';
  toggle.addEventListener('click', () => {
    panel.classList.toggle('lmp-collapsed');
    toggle.classList.toggle('lmp-collapsed');
    toggle.textContent = panel.classList.contains('lmp-collapsed') ? '▶' : '◀';
  });
  document.body.appendChild(toggle);
  panel.querySelectorAll('.lmp-tab').forEach(b => b.addEventListener('click', () => { if (b.dataset.tab !== 'edit') pendingUploadFiles = []; currentTab = b.dataset.tab; renderPanel(); }));
  logEl = null;
  renderPanel();
}

function renderPanel() {
  const panel = panelEl(); if (!panel) return;
  panel.querySelectorAll('.lmp-tab').forEach(b => b.classList.toggle('lmp-active', b.dataset.tab === currentTab));
  const body = document.getElementById('lmp-body');
  if (currentTab === 'listings') body.innerHTML = listingsHtml();
  else if (currentTab === 'queue') body.innerHTML = queueHtml();
  else if (currentTab === 'edit') body.innerHTML = editorHtml();
  else if (currentTab === 'renew') body.innerHTML = renewHtml();
  else if (currentTab === 'settings') body.innerHTML = settingsHtml();
  else body.innerHTML = logHtml();
  wirePanel(body);
}

function listingsHtml() {
  const listings = loadListings();
  const q = searchText.toLowerCase();
  const shown = listings.filter(l => !q || (l.name + ' ' + l.service + ' ' + l.city).toLowerCase().includes(q));
  let h = '<input id="lmp-search" class="lmp-input" placeholder="Search listings…" value="' + esc(searchText) + '">';
  h += '<div><button class="lmp-btn lmp-secondary" data-act="select-all">Select all</button>' +
    '<button class="lmp-btn lmp-secondary" data-act="select-none">Clear</button>' +
    '<button class="lmp-btn" data-act="preview">Preview variation</button>' +
    '<button class="lmp-btn" data-act="start-queue">▶ Start queue (' + selectedIds.size + ')</button></div>';
  h += '<p class="lmp-note">' + listings.length + ' listing(s) saved. Tick the ones to post. ' +
    'Titles/descriptions are spun fresh for every post — use Preview to see an example.</p><div id="lmp-preview"></div>';
  shown.forEach(l => {
    const sel = selectedIds.has(l.id);
    const linkCount = (l.images || []).length;
    const uploadedCount = photoCountsLoaded ? (photoCounts[l.id] || 0) : 0;
    const noImg = linkCount === 0 && photoCountsLoaded && uploadedCount === 0;
    h += '<div class="lmp-card' + (sel ? ' lmp-selected' : '') + '">' +
      '<label><input type="checkbox" data-check="' + esc(l.id) + '"' + (sel ? ' checked' : '') + '> ' +
      '<h3 style="display:inline">' + esc(l.name) + (noImg ? '<span class="lmp-badge">NO PHOTOS</span>' : '') + '</h3></label>' +
      '<p>' + esc(l.service) + ' • ' + esc(l.city) + ' • <span class="lmp-price">$' + esc(l.price) +
      (l.priceVary ? ' ±$' + esc(l.priceVary) : '') + '</span> • ' + uploadedCount + ' uploaded + ' + linkCount + ' link photo(s)</p>' +
      '<p>' + esc((l.titleTemplate || '').slice(0, 90)) + '</p>' +
      '<button class="lmp-btn lmp-secondary" data-edit="' + esc(l.id) + '">Edit</button>' +
      '<button class="lmp-btn lmp-secondary" data-dup="' + esc(l.id) + '">Duplicate</button>' +
      '<button class="lmp-btn lmp-danger" data-del="' + esc(l.id) + '">Delete</button></div>';
  });
  if (!shown.length) h += '<p class="lmp-note">No listings match.</p>';
  return h;
}

function queueHtml() {
  const q = loadQueue();
  const s = loadSettings();
  let h = '<p class="lmp-note">Mode: <b>' + (s.autoPublish ? 'Fill + Publish (auto)' : 'Fill-only dry-run (safe)') +
    '</b> — change it in Settings. Interval: ' + s.intervalMinSec + '–' + s.intervalMaxSec + 's between posts. ' +
    'Max per run: ' + s.maxPerRun + '. The queue survives page changes; keep this tab open.</p>';
  h += '<div><button class="lmp-btn" data-act="start-queue">▶ Start queue (' + selectedIds.size + ' selected)</button>' +
    '<button class="lmp-btn lmp-danger" data-act="stop-queue">■ Stop</button>' +
    '<button class="lmp-btn lmp-secondary" data-act="reset-queue">Reset</button>' +
    '<button class="lmp-btn lmp-secondary" data-act="goto-create">Open create page</button></div>';
  if (!q.items.length) return h + '<p class="lmp-note">Queue is empty. Select listings on the Listings tab, then Start queue.</p>';
  h += '<p>Progress: ' + q.index + ' / ' + q.items.length + ' — ' + (q.running ? '<b>RUNNING</b>' : 'paused / finished') + '</p>';
  const listings = loadListings();
  q.items.forEach((item, i) => {
    const l = listings.find(x => x.id === item.listingId);
    h += '<div class="lmp-card"><h3>' + (i + 1) + '. ' + esc(l ? l.name : item.listingId) + '</h3>' +
      '<p>Status: <b>' + esc(item.status) + '</b>' + (item.note ? ' — ' + esc(item.note) : '') + '</p>' +
      (item.rendered ? '<div class="lmp-preview">' + esc(item.rendered.title) + '\n$' + esc(item.rendered.price) + ' • ' + esc(item.rendered.city) + '</div>' : '') + '</div>';
  });
  return h;
}

function editorHtml() {
  const listings = loadListings();
  const l = editingId ? listings.find(x => x.id === editingId) : null;
  const v = l || { name: '', service: ALL_SERVICES[0], city: CITIES[0], price: 60, priceVary: 10, titleTemplate: '', descriptionTemplate: '', category: '', condition: '', images: [] };
  const serviceOpts = Object.keys(SERVICES).map(g =>
    '<optgroup label="' + esc(g) + '">' + SERVICES[g].map(s =>
      '<option' + (s === v.service ? ' selected' : '') + '>' + esc(s) + '</option>').join('') + '</optgroup>').join('');
  const cityOpts = CITIES.map(c => '<option' + (c === v.city ? ' selected' : '') + '>' + esc(c) + '</option>').join('');
  let h = '<h3 style="margin:4px 0 10px">' + (l ? 'Edit listing' : 'Add new listing') + '</h3>';
  h += '<div class="lmp-label">Name (for you only)</div><input id="f-name" class="lmp-input" value="' + esc(v.name) + '" placeholder="e.g. Car Lockout — Brandon">';
  h += '<div class="lmp-row"><div><div class="lmp-label">Service</div><select id="f-service" class="lmp-select">' + serviceOpts + '</select></div>' +
    '<div><div class="lmp-label">City</div><select id="f-city" class="lmp-select">' + cityOpts + '</select></div></div>';
  h += '<div class="lmp-row"><div><div class="lmp-label">Price ($)</div><input id="f-price" class="lmp-input" type="number" value="' + esc(v.price) + '"></div>' +
    '<div><div class="lmp-label">Price vary ± ($)</div><input id="f-vary" class="lmp-input" type="number" value="' + esc(v.priceVary) + '"></div></div>';
  h += '<div class="lmp-label">Title template — use {a|b} + {city} {service}</div><textarea id="f-title" class="lmp-textarea">' + esc(v.titleTemplate) + '</textarea>';
  h += '<div class="lmp-label">Description template — use {a|b} + {city} {service}</div><textarea id="f-desc" class="lmp-textarea" style="min-height:110px">' + esc(v.descriptionTemplate) + '</textarea>';
  h += '<div class="lmp-row"><div><div class="lmp-label">Category (exact FB name, optional)</div><input id="f-cat" class="lmp-input" value="' + esc(v.category) + '" placeholder="Leave blank to skip"></div>' +
    '<div><div class="lmp-label">Condition (optional)</div><input id="f-cond" class="lmp-input" value="' + esc(v.condition) + '" placeholder="Leave blank to skip"></div></div>';
  h += '<div class="lmp-label">Photos — upload from this computer (recommended)</div>';
  h += '<input id="f-upload" class="lmp-input" type="file" accept="image/*" multiple>';
  h += '<div id="lmp-pending"></div><div id="lmp-thumbs"></div>';
  h += '<div class="lmp-label">…or image URLs — one per line (direct .jpg/.png links)</div><textarea id="f-images" class="lmp-textarea" placeholder="https://example.com/photo1.jpg">' + esc((v.images || []).join('\n')) + '</textarea>';
  h += '<p class="lmp-note">Uploaded photos are saved in this browser profile and reused for every post of this listing. You can use uploads, links, or both (uploads attach first). Facebook needs at least 1 photo per listing. Export JSON does not include uploaded photos.</p>';
  h += '<button class="lmp-btn lmp-wide" data-act="save-listing">' + (l ? 'Save changes' : 'Add listing') + '</button>';
  h += '<button class="lmp-btn lmp-secondary lmp-wide" data-act="new-listing">+ New blank listing</button>';
  h += '<button class="lmp-btn lmp-secondary lmp-wide" data-act="reset-seed">Restore the 10 example listings</button>';
  return h;
}

function renewHtml() {
  return '<h3 style="margin:4px 0 10px">Renew / repost</h3>' +
    '<p class="lmp-note">Best-effort helper. Facebook shows Renew only for some listings, sometimes inside each listing\'s "..." menu. ' +
    'This scans the Selling page for visible Renew controls and clicks them one by one. Verify one renew by hand first.</p>' +
    '<button class="lmp-btn lmp-wide" data-act="goto-selling">1. Open Selling page</button>' +
    '<button class="lmp-btn lmp-wide" data-act="scan-renew">2. Scan this page for Renew buttons</button>' +
    '<button class="lmp-btn lmp-wide" data-act="renew-all">3. Renew all found (5s apart)</button>' +
    '<p class="lmp-note">To repost an old listing as a NEW listing instead: duplicate its template on the Listings tab, change the city/title, and run it through the queue. That gives a fresh listing with varied text.</p>';
}

function settingsHtml() {
  const s = loadSettings();
  let h = '<h3 style="margin:4px 0 10px">Settings</h3>';
  h += '<label><input type="checkbox" id="s-autopub"' + (s.autoPublish ? ' checked' : '') + '> <b>Auto-publish</b> (Fill + Publish). OFF = Fill-only dry-run.</label>';
  h += '<p class="lmp-note">⚠ Keep OFF until you have watched one listing fill correctly on the live create page.</p>';
  h += '<div class="lmp-row"><div><div class="lmp-label">Interval min (sec)</div><input id="s-min" class="lmp-input" type="number" value="' + s.intervalMinSec + '"></div>' +
    '<div><div class="lmp-label">Interval max (sec)</div><input id="s-max" class="lmp-input" type="number" value="' + s.intervalMaxSec + '"></div></div>';
  h += '<div class="lmp-row"><div><div class="lmp-label">Max per run</div><input id="s-maxrun" class="lmp-input" type="number" value="' + s.maxPerRun + '"></div>' +
    '<div><div class="lmp-label">Max images</div><input id="s-maximg" class="lmp-input" type="number" value="' + s.maxImages + '"></div></div>';
  h += '<label><input type="checkbox" id="s-stoperr"' + (s.stopOnError ? ' checked' : '') + '> Stop queue on first error</label><br><br>';
  h += '<div class="lmp-label">Default category (optional)</div><input id="s-cat" class="lmp-input" value="' + esc(s.categoryDefault) + '">';
  h += '<div class="lmp-label">Default condition (optional)</div><input id="s-cond" class="lmp-input" value="' + esc(s.conditionDefault) + '">';
  h += '<button class="lmp-btn lmp-wide" data-act="save-settings">Save settings</button>';
  h += '<h3 style="margin:16px 0 6px">Backup / restore</h3>';
  h += '<button class="lmp-btn lmp-secondary" data-act="export">Export listings (JSON)</button>' +
    '<button class="lmp-btn lmp-secondary" data-act="import">Import JSON</button>';
  h += '<textarea id="s-io" class="lmp-textarea" style="min-height:100px" placeholder="Export output / import JSON goes here"></textarea>';
  h += '<p class="lmp-note">Export / import covers listing text, prices, cities and image URLs only — uploaded photos stay in this browser profile and must be uploaded again on another profile or computer.</p>';
  h += '<p class="lmp-note">Multiple Facebook accounts: use a separate Chrome profile per account, install this script in each profile, and keep each profile\'s listings separate. Using a separate proxy per profile reduces flag risk. No posting volume is 100% safe — start slow (a few listings/day) and watch for Facebook warnings.</p>';
  return h;
}

function logHtml() {
  const log = storeGet(STORE.log, []).slice().reverse();
  let h = '<button class="lmp-btn lmp-secondary" data-act="clear-log">Clear log</button><div id="lmp-log">';
  log.forEach(line => { h += '<div class="lmp-logline lmp-' + esc(line.kind) + '">[' + esc(line.t) + '] ' + esc(line.msg) + '</div>'; });
  return h + '</div>';
}

/* ============================ WIRING ================================ */

function wirePanel(body) {
  logEl = document.getElementById('lmp-log');
  const search = document.getElementById('lmp-search');
  if (search) search.addEventListener('input', () => { searchText = search.value; renderPanel(); const s2 = document.getElementById('lmp-search'); if (s2) { s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); } });
  body.querySelectorAll('[data-check]').forEach(cb => cb.addEventListener('change', () => {
    if (cb.checked) selectedIds.add(cb.dataset.check); else selectedIds.delete(cb.dataset.check);
    renderPanel();
  }));
  body.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => { pendingUploadFiles = []; editingId = b.dataset.edit; currentTab = 'edit'; renderPanel(); }));
  body.querySelectorAll('[data-dup]').forEach(b => b.addEventListener('click', () => {
    const listings = loadListings();
    const src = listings.find(l => l.id === b.dataset.dup);
    if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = uid(); copy.name = src.name + ' (copy)';
    listings.push(copy); saveListings(listings);
    copyListingPhotos(src.id, copy.id).then(n => {
      if (n) addLog('Duplicated: ' + src.name + ' (copied ' + n + ' uploaded photo(s)).');
      else addLog('Duplicated: ' + src.name);
      refreshPhotoCounts();
    });
    renderPanel();
  }));
  body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    if (!confirm('Delete this listing template? Its uploaded photos will be deleted too.')) return;
    const delId = b.dataset.del;
    saveListings(loadListings().filter(l => l.id !== delId));
    selectedIds.delete(delId);
    deleteListingPhotos(delId).then(() => refreshPhotoCounts());
    addLog('Deleted listing.'); renderPanel();
  }));
  body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => handleAction(b.dataset.act, body)));
  // Editor photo controls (only present on the Add/Edit tab).
  const uploadInput = document.getElementById('f-upload');
  if (uploadInput) uploadInput.addEventListener('change', () => {
    const pickedAll = Array.from(uploadInput.files || []);
    const picked = pickedAll.filter(isImageFile);
    if (picked.length < pickedAll.length) addLog((pickedAll.length - picked.length) + ' non-image file(s) skipped.', 'warn');
    const big = picked.filter(f => f.size > 5 * 1024 * 1024);
    if (big.length) addLog(big.length + ' photo(s) over 5 MB — they will still save, but attaching may be slow. Smaller JPGs are better.', 'warn');
    pendingUploadFiles = pendingUploadFiles.concat(picked);
    renderPendingUploads();
  });
  renderPendingUploads();
  if (currentTab === 'edit' && editingId) loadEditorThumbs();
}

function handleAction(act, body) {
  if (act === 'select-all') { loadListings().forEach(l => selectedIds.add(l.id)); renderPanel(); }
  else if (act === 'select-none') { selectedIds.clear(); renderPanel(); }
  else if (act === 'preview') {
    const listings = loadListings();
    const used = loadUsed();
    const prev = document.getElementById('lmp-preview');
    const ids = selectedIds.size ? Array.from(selectedIds) : listings.slice(0, 1).map(l => l.id);
    let h = '';
    ids.slice(0, 3).forEach(id => {
      const l = listings.find(x => x.id === id); if (!l) return;
      const r = renderListing(l, used);
      h += '<div class="lmp-preview"><b>' + esc(r.title) + '</b>\n$' + esc(r.price) + ' • ' + esc(r.city) +
        '\n\n' + esc(r.description) + '\n\n<i>Fresh combination: ' + (r.fresh ? 'yes' : 'no — all variants recently used') + '</i></div>';
    });
    if (prev) prev.innerHTML = h || '<p class="lmp-note">Select a listing first.</p>';
  }
  else if (act === 'start-queue') {
    if (!selectedIds.size) { addLog('Select at least one listing first.', 'warn'); return; }
    if (!confirm('Start queue for ' + selectedIds.size + ' listing(s)? Mode: ' + (loadSettings().autoPublish ? 'Fill + Publish' : 'Fill-only dry-run') + '. Keep this tab open.')) return;
    currentTab = 'queue'; startQueue(Array.from(selectedIds));
  }
  else if (act === 'stop-queue') stopQueue();
  else if (act === 'reset-queue') { if (confirm('Reset the queue?')) resetQueue(); }
  else if (act === 'goto-create') location.href = CREATE_ITEM_URL;
  else if (act === 'goto-selling') location.href = SELLING_URL;
  else if (act === 'scan-renew') {
    const found = scanRenewables();
    addLog(found.length ? ('Found ' + found.length + ' Renew control(s) on this page.') : 'No Renew controls found on this page.', found.length ? 'ok' : 'warn');
  }
  else if (act === 'renew-all') { if (confirm('Renew all Renew controls found on this page, 5s apart?')) renewAllFound(5); }
  else if (act === 'save-listing') {
    const name = document.getElementById('f-name').value.trim();
    const title = document.getElementById('f-title').value.trim();
    const desc = document.getElementById('f-desc').value.trim();
    if (!name || !title || !desc) { alert('Name, title template and description template are required.'); return; }
    const images = document.getElementById('f-images').value.split('\n').map(s => s.trim()).filter(Boolean);
    const listings = loadListings();
    const data = {
      name, service: document.getElementById('f-service').value,
      city: document.getElementById('f-city').value,
      price: Number(document.getElementById('f-price').value) || 0,
      priceVary: Number(document.getElementById('f-vary').value) || 0,
      titleTemplate: title, descriptionTemplate: desc,
      category: document.getElementById('f-cat').value.trim(),
      condition: document.getElementById('f-cond').value.trim(),
      images, enabled: true
    };
    const wasEdit = !!editingId;
    let targetId = editingId;
    if (targetId) {
      const i = listings.findIndex(l => l.id === targetId);
      if (i >= 0) listings[i] = Object.assign(listings[i], data);
    } else {
      targetId = uid();
      listings.push(Object.assign({ id: targetId, createdAt: Date.now() }, data));
    }
    saveListings(listings);
    const pending = pendingUploadFiles.slice();
    pendingUploadFiles = [];
    const finish = () => {
      addLog((wasEdit ? 'Saved: ' : 'Added: ') + name);
      editingId = null; currentTab = 'listings'; refreshPhotoCounts(); renderPanel();
    };
    if (pending.length) {
      addLog('Saving ' + pending.length + ' photo(s)…');
      storePhotos(targetId, pending).then(n => {
        if (n) addLog('Saved ' + n + ' photo(s) for this listing.', 'ok');
        else addLog('Photos could not be saved (photo storage unavailable) — listing saved without them.', 'warn');
        finish();
      }).catch(e => { addLog('Photo save failed: ' + e.message, 'warn'); finish(); });
    } else finish();
  }
  else if (act === 'new-listing') { pendingUploadFiles = []; editingId = null; renderPanel(); }
  else if (act === 'reset-seed') {
    if (!confirm('Replace ALL listings with the 10 original examples? Your edits will be lost. Uploaded photos stay attached to the example listings with the same names.')) return;
    pendingUploadFiles = [];
    saveListings(seedListings()); selectedIds.clear();
    addLog('Restored the 10 example listings.'); currentTab = 'listings'; refreshPhotoCounts(); renderPanel();
  }
  else if (act === 'save-settings') {
    const s = loadSettings();
    s.autoPublish = document.getElementById('s-autopub').checked;
    s.intervalMinSec = Math.max(30, Number(document.getElementById('s-min').value) || 180);
    s.intervalMaxSec = Math.max(s.intervalMinSec, Number(document.getElementById('s-max').value) || 300);
    s.maxPerRun = Math.max(1, Number(document.getElementById('s-maxrun').value) || 10);
    s.maxImages = Math.max(1, Math.min(20, Number(document.getElementById('s-maximg').value) || 10));
    s.stopOnError = document.getElementById('s-stoperr').checked;
    s.categoryDefault = document.getElementById('s-cat').value.trim();
    s.conditionDefault = document.getElementById('s-cond').value.trim();
    saveSettings(s); addLog('Settings saved. Auto-publish: ' + (s.autoPublish ? 'ON' : 'OFF')); renderPanel();
  }
  else if (act === 'export') {
    const io = document.getElementById('s-io');
    if (io) io.value = JSON.stringify(loadListings(), null, 2);
    addLog('Listings exported to the box below — copy and keep it safe.');
  }
  else if (act === 'import') {
    const io = document.getElementById('s-io');
    try {
      const parsed = JSON.parse(io.value);
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('expected a JSON array of listings');
      saveListings(parsed); addLog('Imported ' + parsed.length + ' listing(s).', 'ok');
      currentTab = 'listings'; renderPanel();
    } catch (e) { addLog('Import failed: ' + e.message, 'error'); alert('Import failed: ' + e.message); }
  }
  else if (act === 'clear-log') { storeSet(STORE.log, []); renderPanel(); }
}

/* ============================== BOOT ================================ */

function boot() {
  // Never run inside iframes.
  try { if (window.top !== window.self) return; } catch (e) { return; }
  buildPanel();
  refreshPhotoCounts();
  addLog('Locksmith Poster ready (standalone v1.1.2). ' +
    (loadSettings().autoPublish ? 'Mode: Fill + Publish.' : 'Mode: Fill-only dry-run — safe to test.'));
  const q = loadQueue();
  if (q.running && q.items.length && q.index < q.items.length) {
    addLog('Resuming queue: item ' + (q.index + 1) + ' / ' + q.items.length + '…');
    setTimeout(() => { runQueueStep(); }, 2500);
  }
}

// Debug/test handle (read-only helpers + state). Harmless in production.
try {
  window.LMP = {
    version: '1.1.2', spinText, applyTokens, renderListing, pickPrice,
    seedListings, loadListings, loadSettings, CITIES, ALL_SERVICES,
    photoStoreAvailable, resolveListingPhotoFiles, getStoredPhotos, storePhotos,
    findInputByLabels, humanType, setEditableText, logFieldDiagnostics, setLocation
  };
} catch (e) {}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
