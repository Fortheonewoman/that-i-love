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
      <path class="arrow-swirl" d="M10 30 q10 -16 20 0 q10 16 20 0" fill="none" stroke="currentColor" stroke-width="3"/>
      <line class="arrow-line" x1="50" y1="30" x2="150" y2="30" stroke="currentColor" stroke-width="3"/>
      <path class="arrow-head" d="M150 30 L130 18 L136 30 L130 42 Z" fill="currentColor"/>
    </svg>`,
};

// A small hand-drawn-style sprig used to flank a poem/body of text —
// currentColor so it always matches whatever accent is live. Two
// vines reaching toward a little five-petal bloom in the middle.
// A title like "O + A" gets a real design treatment — a monogram
// badge with a ring, instead of just sitting there as plain text.
// Any other title still renders as a normal heading.
function renderTitle(title) {
  const match = /^(.{1,3}) \+ (.{1,3})$/.exec((title || "").trim());
  if (!match) return `<h2 class="day-overlay-title">${title ?? ""}</h2>`;
  const [, left, right] = match;
  return `
    <div class="title-monogram" role="heading" aria-level="2" aria-label="${title}">
      <svg class="monogram-ring" viewBox="0 0 220 220" aria-hidden="true">
        <circle cx="110" cy="110" r="102" fill="none" stroke="currentColor" stroke-width="1.25" opacity="0.55"/>
        <circle cx="110" cy="110" r="90" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      </svg>
      <span class="monogram-letters">
        <span class="monogram-letter">${left}</span>
        <span class="monogram-plus">+</span>
        <span class="monogram-letter">${right}</span>
      </span>
    </div>`;
}

const FLORAL_FLOURISH = `
  <svg class="floral-flourish" viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 22 C50 14 84 26 108 20" stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.55"/>
    <path d="M132 20 C156 26 190 14 234 22" stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.55"/>
    <g transform="translate(120,19)" opacity="0.85">
      <circle cx="0" cy="0" r="2.6" fill="currentColor"/>
      <circle cx="-7" cy="-4" r="3.6" fill="currentColor" opacity="0.6"/>
      <circle cx="7" cy="-4" r="3.6" fill="currentColor" opacity="0.6"/>
      <circle cx="-7" cy="4" r="3.6" fill="currentColor" opacity="0.6"/>
      <circle cx="7" cy="4" r="3.6" fill="currentColor" opacity="0.6"/>
    </g>
  </svg>`;

/* ============================================================
   The seven-day palette. Each day "wears" its own colour the
   moment it's opened — set as the --accent CSS variable on the
   root element, and reverted to the default when she closes it.
   ============================================================ */
const DAY_PALETTE = {
  day1: "#C81E3A", // rich red — roses are red
  day2: "#FF6F5E", // coral
  day3: "#F2B705", // butter yellow
  day4: "#9B6FD4", // lilac
  day5: "#2E9E6B", // fresh green
  day6: "#3B5BFF", // electric blue
  day7: "#FF3D7A", // hot pink
};
const DEFAULT_ACCENT = "#FF6F5E";

/* ============================================================
   Site chrome: the day-card grid, the opened-day stamps, the
   birthday countdown, and the full-screen reveal overlay. Reads
   time exclusively through window.TimeLock — never the device
   clock, same rule as everything else in this file.
   ============================================================ */
function wireMute() {
  const btn = document.getElementById("mute-btn");
  if (!btn) return;
  let muted = false;
  btn.addEventListener("click", () => {
    muted = !muted;
    btn.textContent = muted ? "🔇" : "🔊";
    document.querySelectorAll("audio").forEach((a) => (a.muted = muted));
  });
}

const MOVEMENT_NAMES = ["the sky", "the explosion", "the story", "twenty-one", "them"];

function wireReplayControls() {
  const startBtn = document.getElementById("replay-start");
  const skipBtn = document.getElementById("replay-skip");
  const jumpEl = document.getElementById("replay-jump");
  if (!startBtn) return;
  startBtn.addEventListener("click", () => Birthday.goToMovement(1));
  skipBtn.addEventListener("click", () => {
    if (jumpEl.hidden) {
      jumpEl.innerHTML = MOVEMENT_NAMES.map((name, i) => `<button type="button" data-jump="${i + 1}">${i + 1}. ${name}</button>`).join("");
      jumpEl.querySelectorAll("[data-jump]").forEach((b) => {
        b.addEventListener("click", () => Birthday.goToMovement(parseInt(b.dataset.jump, 10)));
      });
    }
    jumpEl.hidden = !jumpEl.hidden;
  });
}

(async function runSite() {
  const appEl = document.getElementById("app");
  const lockedOutEl = document.getElementById("locked-out");
  if (!appEl) return; // not this page

  const ok = await window.TimeLock.init();
  if (!ok) {
    lockedOutEl.hidden = false;
    return;
  }

  // The birthday finale is fully responsive — no device gate. She may
  // well open this at midnight on her phone.
  const params = new URLSearchParams(location.search);
  const devAct = parseInt(params.get("act"), 10);
  const birthdayUnlocked = window.TimeLock.unlocks().find((u) => u.id === "birthday").unlocked;
  const wantsBirthdaySequence = devAct >= 1 || birthdayUnlocked;

  // NOTE: launching the birthday sequence happens further down, after
  // openDay/overlayContentEl/etc. are declared — goToDay7() (the
  // finale's handoff to Day 7) calls openDay(), so those consts must
  // already be initialized before the finale can start. A `const`
  // that's still in its temporal dead zone throws if a callback
  // reaches it before its own declaration line has run; returning
  // early from this function (as this branch used to, right here)
  // meant that line never ran at all for this call.
  appEl.hidden = wantsBirthdaySequence;

  const stampsEl = document.getElementById("stamps");
  const gridEl = document.getElementById("day-grid");
  const cornerCountdownEl = document.getElementById("corner-countdown");
  const cornerDigitsEl = document.getElementById("corner-countdown-digits");
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

    // Days 2 and 3 are bespoke interactive scenes, not the generic
    // title/photo/poem template the other days use.
    const bespokeScene = { day2: window.Day2Scene, day3: window.Day3Scene, day4: window.Day4Scene, day5: window.Day5Scene, day6: window.Day6Scene }[id];
    if (bespokeScene) {
      overlayContentEl.className = "day-overlay-content"; // drop floral-decor — these draw their own world
      bespokeScene.render(overlayContentEl, {
        onDone: () => {
          markOpened(id);
          renderGrid();
        },
      });
      markOpened(id);
      renderGrid();
      return;
    }
    overlayContentEl.className = "day-overlay-content floral-decor";

    try {
      const data = await ContentVault.loadDay(id);
      const visual = data.visual && DAY_VISUALS[data.visual] ? DAY_VISUALS[data.visual]() : "";

      const tilts = [-3, 2.5, -1.5, 3]; // gentle alternating tilt, scrapbook-soft not chaotic
      const lifts = [0, 2.2, -1.4, 1.6]; // rem — staggered vertically, not a clean row
      const photosHtml = (data.photos || [])
        .map(
          (p, i) => `
        <figure class="day-photo ${i === 0 ? "day-photo-hero" : "day-photo-scrap"}" style="--tilt:${tilts[i % tilts.length]}deg; --lift:${lifts[i % lifts.length]}rem; --delay:${0.5 + i * 0.5}s">
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

      const poemLines = (data.body || "")
        .split("\n")
        .map((line, i) => `<span class="poem-line" style="--delay:${2.8 + i * 0.6}s">${line}</span>`)
        .join("");
      const bodyHtml = data.body
        ? `
        <div class="poem-block">
          ${FLORAL_FLOURISH}
          <p class="day-overlay-body poem-text">${poemLines}</p>
          ${FLORAL_FLOURISH}
        </div>`
        : "";

      overlayContentEl.innerHTML = `
        ${renderTitle(data.title)}
        ${visual}
        ${photosHtml ? `<div class="day-photos">${photosHtml}</div>` : ""}
        ${bodyHtml}
        ${prevBtn}
      `;
      overlayContentEl.classList.remove("is-in");
      requestAnimationFrame(() => requestAnimationFrame(() => overlayContentEl.classList.add("is-in")));

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

  // The finale's last act: hand her straight to Day 7. Leaves the
  // birthday sequence behind entirely and opens the letter directly,
  // through the same door every other day uses — no separate path.
  function goToDay7() {
    document.getElementById("birthday").hidden = true;
    appEl.hidden = false;
    openDay("day7");
  }

  function shake(el) {
    el.classList.remove("is-shaking");
    void el.offsetWidth; // restart the animation if it's already running
    el.classList.add("is-shaking");
  }

  // Day cards are built ONCE and updated in place on every tick —
  // not torn down and recreated — so a card with its own transient
  // state (Day 7's little chase game, below) doesn't lose that state
  // every second.
  const dayCardEls = {};
  function ensureDayCards() {
    if (Object.keys(dayCardEls).length) return;
    DAY_IDS.forEach((id, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "day-card";
      card.dataset.day = id;
      // Each day wears its own colour even while locked — a preview
      // wash, not the full accent yet — so the row reads as seven
      // distinct chapters, not seven identical grey boxes.
      card.style.setProperty("--day-color", DAY_PALETTE[id] || DEFAULT_ACCENT);
      // The face is a separate inner wrapper so Day 7's "rolling"
      // wobble (an animation on transform) never fights with the
      // outer card's own transform, which handles dodge position.
      const label = id === "day7" ? "Birthday" : `Day ${i + 1}`;
      card.innerHTML = `<span class="day-card-face">
        <span class="day-card-number">${label}</span>
        <span class="day-card-hint"></span>
      </span>`;
      card.addEventListener("click", () => {
        if (card.classList.contains("is-locked")) shake(card);
        else openDay(id);
      });
      gridEl.appendChild(card);
      dayCardEls[id] = card;
    });
    wireDay7Chase(dayCardEls.day7);
  }

  function renderGrid() {
    ensureDayCards();
    const unlocks = window.TimeLock.unlocks();
    const opened = openedDays();

    stampsEl.innerHTML = DAY_IDS.map((id, i) => {
      const isOpen = !!opened[id];
      const color = DAY_PALETTE[id] || DEFAULT_ACCENT;
      return `<span class="stamp ${isOpen ? "is-filled" : ""}" style="--day-color:${color}">${i + 1}</span>`;
    }).join("");

    DAY_IDS.forEach((id) => {
      const u = unlocks.find((x) => x.id === id);
      const card = dayCardEls[id];
      const hintEl = card.querySelector(".day-card-hint");

      card.classList.remove("is-locked", "is-unlocked", "is-opened");
      if (u.unlocked) {
        card.classList.add(opened[id] ? "is-opened" : "is-unlocked");
        hintEl.textContent = opened[id] ? "tap to reopen" : "tap to open";
      } else {
        card.classList.add("is-locked");
        // Day 7 just says "tap to open" always — no ticking countdown
        // on the birthday slot. Tapping it early still shakes it (the
        // lock itself doesn't change, only what's displayed).
        if (id === "day7") {
          hintEl.textContent = "tap to open";
        } else {
          hintEl.textContent = window.TimeLock.formatDuration(u.msRemaining);
        }
      }
    });
  }

  // ---- Day 7's little chase game ------------------------------
  // A gentle nod to the birthday's own chase-the-button gag: while
  // Day 7 is still locked, hovering near it makes it playful — it
  // turns green and dodges the cursor. The label ("Birthday" / "tap
  // to open") never changes, only the colour and position do. Five
  // seconds without her chasing it and it calms back down on its own.
  function wireDay7Chase(card) {
    if (!card) return;
    let excited = false;
    let calmTimer = null;
    let returnCleanupTimer = null;
    let offsetX = 0;
    let offsetY = 0;

    function applyOffset() {
      card.style.setProperty("--dodge-x", offsetX + "px");
      card.style.setProperty("--dodge-y", offsetY + "px");
    }

    // Settling isn't a snap back — it drifts home slowly (1.5s, eased),
    // softening out of "ball" back into a card as it goes.
    function calmDown() {
      excited = false;
      card.classList.add("is-returning");
      card.classList.remove("is-excited");
      offsetX = 0;
      offsetY = 0;
      applyOffset();
      clearTimeout(returnCleanupTimer);
      returnCleanupTimer = setTimeout(() => card.classList.remove("is-returning"), 1500);
    }

    function scheduleCalm() {
      clearTimeout(calmTimer);
      calmTimer = setTimeout(calmDown, 5000);
    }

    function excite() {
      if (!card.classList.contains("is-locked")) return;
      if (!excited) {
        excited = true;
        card.classList.add("is-excited");
      }
      scheduleCalm();
    }

    // The cursor must never actually touch it. It reacts well before
    // contact, and if she somehow gets close anyway, it takes a much
    // bigger startled leap rather than a normal dodge.
    function dodgeFrom(clientX, clientY, distNow) {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      let dx = cx - clientX;
      let dy = cy - clientY;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const cornered = distNow < 70;
      const jump = cornered ? 100 + Math.random() * 50 : 65 + Math.random() * 35;
      const MAX = cornered ? 170 : 140;
      offsetX = Math.max(-MAX, Math.min(MAX, offsetX + dx * jump));
      offsetY = Math.max(-MAX, Math.min(MAX, offsetY + dy * jump));
      applyOffset();
    }

    card.addEventListener("mouseenter", () => {
      if (!card.classList.contains("is-locked")) return;
      excite();
    });

    document.addEventListener("mousemove", (e) => {
      if (!excited || !card.classList.contains("is-locked")) return;
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      // Reacts at a distance comfortably wider than the card itself,
      // so it's already moving away long before the cursor arrives.
      if (dist < 170) {
        dodgeFrom(e.clientX, e.clientY, dist);
        scheduleCalm();
      }
    });
  }

  // DD : HH : MM : SS — the small corner widget's format, distinct
  // from formatDuration()'s "5d 12h 34m 56s" used everywhere else.
  function formatCountdownDigits(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [days, hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(" : ");
  }

  function renderCountdown() {
    const unlocks = window.TimeLock.unlocks();
    const birthday = unlocks.find((u) => u.id === "birthday");
    const remaining = birthday.unlocked ? "it's her birthday" : window.TimeLock.formatDuration(birthday.msRemaining);
    // Same countdown, shown inside the day overlay too, so it's visible
    // no matter which screen she's looking at.
    overlayCountdownEl.textContent = birthday.unlocked ? remaining : remaining + " until her birthday";

    if (birthday.unlocked) {
      cornerCountdownEl.hidden = true;
      return;
    }
    cornerCountdownEl.hidden = false;
    cornerDigitsEl.textContent = formatCountdownDigits(birthday.msRemaining);
  }

  let birthdayLaunched = false;
  function tick() {
    renderGrid();
    renderCountdown();

    // The instant server time hits the birthday, the sky opens —
    // even if she's just sitting on the day-grid when it happens.
    // Fully responsive, so no device check here either.
    const birthday = window.TimeLock.unlocks().find((u) => u.id === "birthday");
    if (birthday.unlocked && !birthdayLaunched) {
      birthdayLaunched = true;
      launchBirthdayFromDayGrid();
    }
  }

  // The countdown hitting zero isn't a hard cut to a new document —
  // the page itself folds away first (a beat of held stillness, then
  // the light/paper transform in CSS) before Day 8 actually begins.
  function launchBirthdayFromDayGrid() {
    overlayEl.hidden = true;
    cornerCountdownEl.classList.add("is-holding");
    document.querySelector(".hero").classList.add("is-transforming");
    setTimeout(() => {
      appEl.hidden = true;
      wireMute();
      wireReplayControls();
      Birthday.start({ onRequestDay7: () => goToDay7() });
    }, 1600);
  }

  // Dev shortcut (?act=N) or already-past-unlock-on-load: launch
  // straight into the finale instead of the day-grid. The natural
  // mid-session unlock (sitting on the day-grid when the clock hits
  // it) is handled inside tick() below, the same way.
  if (wantsBirthdaySequence) {
    wireMute();
    wireReplayControls();
    await Birthday.start({ onRequestDay7: () => goToDay7() });
    return;
  }

  // Obinna's pre-birthday writeup — real content only, never invented.
  // Silently does nothing if content/writeup.json doesn't exist yet.
  (async () => {
    try {
      const res = await fetch("content/writeup.json", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const slot = document.getElementById("pre-birthday-writeup");
      if (!data || !data.lines || !data.lines.length || !slot) return;
      slot.innerHTML = data.lines.map((line) => `<p class="pre-birthday-writeup-line">${line}</p>`).join("");
      slot.hidden = false;
    } catch (err) {
      console.warn("no pre-birthday writeup yet:", err);
    }
  })();

  tick();
  setInterval(tick, 1000);

  // Dev convenience only — doesn't touch the lock. ?preview=day1
  // just pops that day's real card open on load so it can be
  // checked without waiting for the actual unlock time.
  const previewId = new URLSearchParams(location.search).get("preview");
  if (previewId && DAY_IDS.includes(previewId)) {
    openDay(previewId);
  }
})();
