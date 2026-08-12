/* ============================================================
   app.js — the time lock, the countdown, and the day-unlock state.

   THE ONE RULE THAT MATTERS: this file never reads the device
   clock. No `Date.now()`, no `new Date()` with no args. The only
   two sources of "now" allowed are:

     1. The `Date` response header from a HEAD request to this
        site's own URL (GitHub's server clock).
     2. A public time API, as a second opinion if #1 fails.

   If both fail, everything stays locked. We do not guess.

   Once we have ONE good reading from the network, we keep time
   moving between readings with `performance.now()` — a stopwatch
   that measures elapsed milliseconds since the page loaded. It is
   NOT the device clock: changing the system date/time does not
   touch it. So "server time + elapsed stopwatch time" is safe
   even if she changes her phone clock mid-session. We just
   re-check the server every few minutes to correct for drift and
   to notice if the connection dies.
   ============================================================ */

(function () {
  "use strict";

  // ---- Fixed unlock moments (UTC epoch milliseconds) ----------
  // Arlington, TX is on CDT (UTC-5) throughout August 2026, so a
  // midnight unlock there is 05:00 UTC. These are precomputed —
  // no timezone maths happens at runtime, ever.
  const UNLOCKS = [
    { id: "day1", label: "Day 1", epoch: Date.UTC(2026, 7, 13, 5, 0, 0) },
    { id: "day2", label: "Day 2", epoch: Date.UTC(2026, 7, 14, 5, 0, 0) },
    { id: "day3", label: "Day 3", epoch: Date.UTC(2026, 7, 15, 5, 0, 0) },
    { id: "day4", label: "Day 4", epoch: Date.UTC(2026, 7, 16, 5, 0, 0) },
    { id: "day5", label: "Day 5", epoch: Date.UTC(2026, 7, 17, 5, 0, 0) },
    { id: "day6", label: "Day 6", epoch: Date.UTC(2026, 7, 18, 5, 0, 0) },
    { id: "day7", label: "Day 7", epoch: Date.UTC(2026, 7, 19, 5, 0, 0) },
    { id: "birthday", label: "Birthday", epoch: Date.UTC(2026, 7, 20, 5, 0, 0) },
  ];
  // NOTE: Date.UTC() above builds a fixed millisecond number at
  // script-parse time from literal integers. It does not consult
  // the device clock — it's arithmetic on constants, same as
  // writing the number 1786935600000 directly.

  const SECOND_OPINION_URL = "https://worldtimeapi.org/api/timezone/Etc/UTC";
  const REVALIDATE_MS = 5 * 60 * 1000; // re-check server time every 5 min

  /** @type {{serverMs: number, perfMs: number, source: string} | null} */
  let anchor = null;
  let lockedForever = false;

  async function fetchOriginTime() {
    const res = await fetch(location.href, {
      method: "HEAD",
      cache: "no-store",
    });
    const dateHeader = res.headers.get("date");
    if (!dateHeader) throw new Error("no Date header from origin");
    const ms = Date.parse(dateHeader);
    if (Number.isNaN(ms)) throw new Error("unparseable Date header");
    return { serverMs: ms, source: "origin" };
  }

  async function fetchSecondOpinionTime() {
    const res = await fetch(SECOND_OPINION_URL, { cache: "no-store" });
    const json = await res.json();
    if (!json || typeof json.unixtime !== "number") {
      throw new Error("unexpected time API response");
    }
    return { serverMs: json.unixtime * 1000, source: "worldtimeapi" };
  }

  async function establishAnchor() {
    const perfBefore = performance.now();
    try {
      const { serverMs, source } = await fetchOriginTime();
      anchor = { serverMs, perfMs: perfBefore, source };
      return true;
    } catch (err) {
      console.warn("origin time check failed, trying second opinion:", err);
    }
    try {
      const { serverMs, source } = await fetchSecondOpinionTime();
      anchor = { serverMs, perfMs: perfBefore, source };
      return true;
    } catch (err) {
      console.warn("second-opinion time check also failed:", err);
    }
    return false;
  }

  /** Current trusted time, in UTC epoch ms. Returns null if we have
   *  no trusted anchor yet (caller must stay locked). */
  function trustedNowMs() {
    if (!anchor) return null;
    return anchor.serverMs + (performance.now() - anchor.perfMs);
  }

  function unlockStateFor(nowMs) {
    return UNLOCKS.map((u) => ({
      ...u,
      unlocked: nowMs !== null && nowMs >= u.epoch,
      msRemaining: u.epoch - (nowMs ?? u.epoch),
    }));
  }

  function formatDuration(ms) {
    if (ms <= 0) return "unlocked";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days) parts.push(days + "d");
    parts.push(String(hours).padStart(2, "0") + "h");
    parts.push(String(minutes).padStart(2, "0") + "m");
    parts.push(String(seconds).padStart(2, "0") + "s");
    return parts.join(" ");
  }

  // ---- Public API used by the rest of the site -----------------
  // Everything else (day cards, act 1's countdown-shatter, etc.)
  // should read time through this object, never through Date.now().
  window.TimeLock = {
    /** Resolves once we've either got a trusted time or given up. */
    async init() {
      const ok = await establishAnchor();
      if (!ok) {
        lockedForever = true;
      } else {
        // Revalidate periodically to correct drift / catch outages.
        setInterval(async () => {
          const stillOk = await establishAnchor();
          if (!stillOk) {
            console.warn("lost time source on revalidation; keeping last good anchor");
          }
        }, REVALIDATE_MS);
      }
      return ok;
    },
    isLockedForever() {
      return lockedForever;
    },
    hasTrustedTime() {
      return anchor !== null;
    },
    now: trustedNowMs,
    unlocks: () => unlockStateFor(trustedNowMs()),
    formatDuration,
  };
})();

/* ============================================================
   Content decryption. Each day's real content lives encrypted at
   content/dayN.enc — fetched and decrypted only after TimeLock says
   that day is actually unlocked. View-source shows nothing but a
   scrambled binary blob.

   File layout: [12-byte IV][ciphertext + 16-byte auth tag] — exactly
   what SubtleCrypto's AES-GCM decrypt() expects as one blob.

   Known limit (accepted, see build brief): anyone can pull this key
   out of the JS with dev tools. That's fine — the key isn't the
   thing being protected, the *clock* is. This stops her phone's
   clock from lying to the page; it was never meant to stop someone
   determined to read the source.
   ============================================================ */
const ContentVault = (function () {
  const KEY_HEX = "19b0ae7903a6031bea3a99fc5cc8f56cc2ccddee9f8d7bc313204b0afbaf9e54";

  let keyPromise = null;
  function getKey() {
    if (!keyPromise) {
      const bytes = new Uint8Array(KEY_HEX.match(/../g).map((b) => parseInt(b, 16)));
      keyPromise = crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["decrypt"]);
    }
    return keyPromise;
  }

  const cache = new Map();
  async function loadDay(id) {
    if (cache.has(id)) return cache.get(id);
    const promise = (async () => {
      const res = await fetch(`content/${id}.enc`, { cache: "no-store" });
      if (!res.ok) throw new Error(`content/${id}.enc missing (${res.status})`);
      const buf = new Uint8Array(await res.arrayBuffer());
      const iv = buf.slice(0, 12);
      const data = buf.slice(12);
      const key = await getKey();
      const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
      return JSON.parse(new TextDecoder().decode(plainBuf));
    })();
    cache.set(id, promise);
    return promise;
  }

  return { loadDay };
})();

/* ============================================================
   Little inline-SVG "visuals" a day's payload can ask for by name,
   e.g. { "visual": "cupid-arrow" }. New days can add new names here
   without touching the reveal/overlay logic below.
   ============================================================ */
const DAY_VISUALS = {
  "cupid-arrow": () => `
    <svg class="day-visual cupid-arrow" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="10" y1="30" x2="150" y2="30" stroke="currentColor" stroke-width="3"/>
      <path d="M150 30 L130 18 L136 30 L130 42 Z" fill="currentColor"/>
      <path d="M10 30 q10 -16 20 0 q10 16 20 0" fill="none" stroke="currentColor" stroke-width="3"/>
    </svg>`,
};

/* ============================================================
   The seven-day palette. Each day "wears" its own colour the
   moment it's opened — set as the --accent CSS variable on the
   root element, and reverted to the default when she closes it.

   Day 4 is a placeholder for now: act 7 of the birthday sequence
   has her pick her favourite colour and the site tells her "that's
   why day four was that colour" — so day4's real value here has to
   become her actual favourite once we know it, not before.
   ============================================================ */
const DAY_PALETTE = {
  day1: "#C0142B", // deep rose red — roses are red
  day2: "#FF6F59", // coral
  day3: "#E8A33D", // amber gold
  day4: "#A8447E", // placeholder — replace with her favourite colour later
  day5: "#2FA89C", // teal
  day6: "#6C63FF", // indigo
  day7: "#E63E8C", // magenta pink
};
const DEFAULT_ACCENT = "#ff5c8a";

/* ============================================================
   Site chrome: the day-card grid, the opened-day stamps, the
   birthday countdown, and the full-screen reveal overlay. Reads
   time exclusively through window.TimeLock — never the device
   clock, same rule as everything else in this file.
   ============================================================ */
(async function runSite() {
  const appEl = document.getElementById("app");
  const lockedOutEl = document.getElementById("locked-out");
  if (!appEl) return; // not this page

  const ok = await window.TimeLock.init();
  if (!ok) {
    lockedOutEl.hidden = false;
    return;
  }
  appEl.hidden = false;

  const stampsEl = document.getElementById("stamps");
  const gridEl = document.getElementById("day-grid");
  const countdownEl = document.getElementById("birthday-countdown");
  const overlayEl = document.getElementById("day-overlay");
  const overlayContentEl = document.getElementById("day-overlay-content");
  const overlayCloseEl = document.getElementById("day-overlay-close");
  const overlayCountdownEl = document.getElementById("overlay-countdown");

  const DAY_IDS = ["day1", "day2", "day3", "day4", "day5", "day6", "day7"];

  function openedDays() {
    try {
      return JSON.parse(localStorage.getItem("amirachi:opened") || "{}");
    } catch {
      return {};
    }
  }
  function markOpened(id) {
    const opened = openedDays();
    opened[id] = true;
    localStorage.setItem("amirachi:opened", JSON.stringify(opened));
  }

  async function openDay(id) {
    overlayContentEl.innerHTML = `<p class="dev-note">opening…</p>`;
    overlayEl.hidden = false;
    document.documentElement.style.setProperty("--accent", DAY_PALETTE[id] || DEFAULT_ACCENT);

    try {
      const data = await ContentVault.loadDay(id);
      const visual = data.visual && DAY_VISUALS[data.visual] ? DAY_VISUALS[data.visual]() : "";

      const photosHtml = (data.photos || [])
        .map(
          (p) => `
        <figure class="day-photo">
          <img src="${p.src}" alt="${p.caption ?? ""}" loading="lazy" />
          ${p.caption ? `<figcaption>${p.caption}</figcaption>` : ""}
        </figure>`
        )
        .join("");

      const dayIndex = DAY_IDS.indexOf(id);
      const prevId = dayIndex > 0 ? DAY_IDS[dayIndex - 1] : null;
      const prevBtn = prevId
        ? `<button type="button" class="day-overlay-prev" data-prev="${prevId}">← Day ${dayIndex}</button>`
        : "";

      overlayContentEl.innerHTML = `
        <h2 class="day-overlay-title">${data.title ?? ""}</h2>
        ${visual}
        ${photosHtml ? `<div class="day-photos">${photosHtml}</div>` : ""}
        ${data.body ? `<p class="day-overlay-body">${data.body}</p>` : ""}
        ${prevBtn}
      `;

      const prevEl = overlayContentEl.querySelector("[data-prev]");
      if (prevEl) prevEl.addEventListener("click", () => openDay(prevEl.dataset.prev));

      markOpened(id);
      renderGrid();
    } catch (err) {
      console.warn(`couldn't open ${id}:`, err);
      overlayContentEl.innerHTML = `<p class="dev-note">Couldn't load this one — try again in a moment.</p>`;
    }
  }

  overlayCloseEl.addEventListener("click", () => {
    overlayEl.hidden = true;
    document.documentElement.style.setProperty("--accent", DEFAULT_ACCENT);
  });

  function shake(el) {
    el.classList.remove("is-shaking");
    void el.offsetWidth; // restart the animation if it's already running
    el.classList.add("is-shaking");
  }

  function renderGrid() {
    const unlocks = window.TimeLock.unlocks();
    const opened = openedDays();

    stampsEl.innerHTML = DAY_IDS.map((id, i) => {
      const isOpen = !!opened[id];
      return `<span class="stamp ${isOpen ? "is-filled" : ""}">${i + 1}</span>`;
    }).join("");

    gridEl.innerHTML = "";
    DAY_IDS.forEach((id, i) => {
      const u = unlocks.find((x) => x.id === id);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "day-card";
      card.dataset.day = id;

      if (u.unlocked) {
        card.classList.add(opened[id] ? "is-opened" : "is-unlocked");
        card.innerHTML = `<span class="day-card-number">Day ${i + 1}</span>
          <span class="day-card-hint">${opened[id] ? "tap to reopen" : "tap to open"}</span>`;
        card.addEventListener("click", () => openDay(id));
      } else {
        card.classList.add("is-locked");
        card.innerHTML = `<span class="day-card-number">Day ${i + 1}</span>
          <span class="day-card-hint">${window.TimeLock.formatDuration(u.msRemaining)}</span>`;
        card.addEventListener("click", () => shake(card));
      }
      gridEl.appendChild(card);
    });
  }

  function renderCountdown() {
    const unlocks = window.TimeLock.unlocks();
    const birthday = unlocks.find((u) => u.id === "birthday");
    const remaining = birthday.unlocked ? "it's her birthday" : window.TimeLock.formatDuration(birthday.msRemaining);
    countdownEl.textContent = birthday.unlocked ? remaining : remaining + " until Amirachi's birthday";
    // Same countdown, shown inside the day overlay too, so it's visible
    // no matter which screen she's looking at.
    overlayCountdownEl.textContent = birthday.unlocked ? remaining : remaining + " until her birthday";
  }

  function tick() {
    renderGrid();
    renderCountdown();
  }

  tick();
  setInterval(tick, 1000);
})();
