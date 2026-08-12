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
   Bare test-page wiring below. This block is what proves the
   lock out on GitHub Pages before anything else gets built on
   top of it. It renders unlock status + a live countdown to the
   birthday, refreshed every second from TimeLock, never from the
   device clock.
   ============================================================ */
(async function runTestPage() {
  const root = document.getElementById("lock-test");
  if (!root) return; // this page isn't the bare test page

  root.textContent = "Checking the time…";

  const ok = await window.TimeLock.init();

  if (!ok) {
    root.innerHTML = `<p class="locked-message">Connect to the internet to open this.</p>`;
    return;
  }

  const sourceNote = document.createElement("p");
  sourceNote.className = "dev-note";
  root.before(sourceNote);

  const list = document.createElement("div");
  list.className = "unlock-list";
  root.innerHTML = "";
  root.appendChild(list);

  function render() {
    const nowMs = window.TimeLock.now();
    sourceNote.textContent =
      "Trusted time: " + new Date(nowMs).toUTCString() + " (never read from this device's clock)";

    const rows = window.TimeLock.unlocks();
    list.innerHTML = rows
      .map((u) => {
        const status = u.unlocked
          ? "UNLOCKED"
          : window.TimeLock.formatDuration(u.msRemaining) + " remaining";
        return `<div class="unlock-row ${u.unlocked ? "is-unlocked" : ""}">
          <span class="unlock-label">${u.label}</span>
          <span class="unlock-status">${status}</span>
        </div>`;
      })
      .join("");
  }

  render();
  setInterval(render, 1000);
})();
