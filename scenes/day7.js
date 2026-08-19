/* ============================================================
   Day 7 — the letter. Full rebuild (v2).

   THE LETTER IS THE POINT. Everything below exists to get out of
   its way: a real fullscreen takeover (mounted at #day7-root, a
   sibling of #app/#day-overlay/#birthday — NOT the cream day-overlay
   card system), a love-gate she actually has to answer before it
   starts, a crawl paced from the real word count instead of a guess,
   and a completion check that watches the actual last block's
   position instead of a timer.

   Text itself lives in content/day7-letter.js (window.Day7Letter) —
   the one canonical source, loaded before this file. This file never
   contains letter text of its own.

   Two phases:
     PHASE ONE  — .d7-intro:  warm ivory. AND GOD RESTED. → the
                  love-gate (real text input, normalized comparison,
                  no bypass).
     PHASE TWO  — .d7-galaxy: full-bleed deep space. The crawl, then
                  (only once the real last line has actually passed
                  through) the trusted countdown — or, if trusted
                  time already says the birthday started while she
                  was reading, a direct handoff into Day 8 instead.
   ============================================================ */
window.Day7Scene = (function () {
  "use strict";

  function el(id) {
    return document.getElementById(id);
  }
  function make(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function normalizeAnswer(s) {
    return (s || "")
      .toLowerCase()
      .replace(/[.,!?'"’‘“”]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const LETTER = window.Day7Letter || [];

  // Paced from the letter's real word count, not a guessed constant —
  // ~160 words/minute, deliberately slower than normal silent reading
  // because this is scrolling, tilted, emotional text she shouldn't
  // have to speed-read. Short/isolated lines and the four lines
  // Obinna bolded himself get EXTRA margin in the layout (see
  // buildCrawlHTML) so they linger longer at this same constant
  // scroll speed — pacing comes from the composition, not from
  // varying the speed itself.
  const TARGET_WPM = 160;
  const totalWords = LETTER.reduce((sum, b) => sum + b.lines.join(" ").split(/\s+/).filter(Boolean).length, 0);
  const PRODUCTION_CRAWL_SECONDS = Math.max(60, Math.round((totalWords / TARGET_WPM) * 60));
  // Dev-only override for testing state transitions without sitting
  // through the real ~9min crawl — window.__DAY7_DEV_FAST__ must be
  // set before the crawl phase starts; never true in production.
  function crawlSeconds() {
    return window.__DAY7_DEV_FAST__ ? 4 : PRODUCTION_CRAWL_SECONDS;
  }

  // Dev-time integrity check, not a UI feature: the rendered block
  // count must equal the source block count, and the required marker
  // lines must all be present, in order. Runs once, logs only —
  // never blocks rendering, but a mismatch here means the canonical
  // letter file was hand-edited wrong.
  (function verifyLetterIntegrity() {
    const markers = [
      "How can I go a birthday without writing for you?",
      "I can not go wrong with you.",
      "OSHE AMIRAH.",
      "Olorun, o ṣe.",
      "Happy birthday, Amirah.",
      "Now go and wait for your birthday, guy.",
    ];
    const flat = LETTER.map((b) => b.lines.join(" ")).join(" \n ");
    const missing = markers.filter((m) => !flat.includes(m));
    const lastBlock = LETTER[LETTER.length - 1];
    const endsCorrectly = lastBlock && lastBlock.lines[lastBlock.lines.length - 1] === "Now go and wait for your birthday, guy.";
    if (missing.length || !endsCorrectly) {
      console.error("[Day7Scene] letter integrity check FAILED — missing markers:", missing, "endsCorrectly:", endsCorrectly);
    } else {
      console.info(`[Day7Scene] letter OK — ${LETTER.length} blocks, ${totalWords} words, ~${Math.round(PRODUCTION_CRAWL_SECONDS / 60)}min crawl.`);
    }
  })();

  let timers = [];
  let rafId = null;
  function after(ms, fn) {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function buildCrawlHTML() {
    let html = `<p class="d7-crawl-title">ALL I WRITE IS YOU</p>`;
    LETTER.forEach((block) => {
      const isShort = block.lines.length === 1 && block.lines[0].length <= 24;
      const cls = ["d7-block"];
      if (block.emphasis) cls.push("d7-block-emphasis");
      else if (isShort) cls.push("d7-block-short");
      const lines = block.lines.map((l) => `<p class="d7-line">${l}</p>`).join("");
      html += `<div class="${cls.join(" ")}">${lines}</div>`;
    });
    return html;
  }

  function formatDigits(ms) {
    if (ms <= 0) return { d: "00", h: "00", m: "00", s: "00" };
    const totalSec = Math.floor(ms / 1000);
    const p = (n) => String(n).padStart(2, "0");
    return {
      d: p(Math.floor(totalSec / 86400)),
      h: p(Math.floor((totalSec % 86400) / 3600)),
      m: p(Math.floor((totalSec % 3600) / 60)),
      s: p(totalSec % 60),
    };
  }

  function render(container, opts) {
    clearTimers();
    const onDoneCb = (opts && opts.onDone) || null;
    const onExitCb = (opts && opts.onExit) || null;
    const onBirthdayReadyCb = (opts && opts.onBirthdayReady) || null;

    container.innerHTML = `
      <div class="d7-intro" id="d7-intro">
        <button type="button" class="d7-exit" id="d7-intro-exit" aria-label="close">×</button>
        <div class="d7-intro-cat" aria-hidden="true">🐈</div>
        <p class="d7-intro-eyebrow" id="d7-intro-eyebrow">the birthday eve</p>
        <p class="d7-intro-daylabel" id="d7-intro-daylabel">day 7</p>
        <p class="d7-intro-rest" id="d7-intro-rest">AND GOD RESTED.</p>
        <p class="d7-intro-loveline" id="d7-intro-loveline" hidden>i love you Amirah</p>
        <p class="d7-intro-ask" id="d7-intro-ask" hidden>what do you say?</p>
        <form class="d7-intro-form" id="d7-intro-form" hidden autocomplete="off">
          <input type="text" class="d7-intro-input" id="d7-intro-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="what do you say?" />
        </form>
        <p class="d7-intro-response" id="d7-intro-response" aria-live="polite"></p>
      </div>
      <div class="d7-galaxy" id="d7-galaxy" hidden>
        <button type="button" class="d7-exit" id="d7-galaxy-exit" aria-label="close">×</button>
        <div class="d7-stars-far" aria-hidden="true"></div>
        <div class="d7-stars-near" aria-hidden="true"></div>
        <button type="button" class="d7-skip" id="d7-skip">skip</button>
        <div class="d7-crawl-stage" id="d7-crawl-stage">
          <div class="d7-crawl-tilt">
            <div class="d7-crawl" id="d7-crawl">${buildCrawlHTML()}</div>
          </div>
        </div>
        <div class="d7-countdown" id="d7-countdown" hidden>
          <p class="d7-countdown-label">Birthday in:</p>
          <p class="d7-countdown-digits" id="d7-countdown-digits">00 : 00 : 00 : 00</p>
          <div class="d7-countdown-units">
            <span class="d7-countdown-unit">days</span>
            <span class="d7-countdown-unit">hrs</span>
            <span class="d7-countdown-unit">min</span>
            <span class="d7-countdown-unit">sec</span>
          </div>
          <p class="d7-countdown-sub">see you at midnight.</p>
        </div>
      </div>`;

    buildStars(container.querySelector(".d7-stars-far"), 100, 1);
    buildStars(container.querySelector(".d7-stars-near"), 50, 2);

    function handleExit() {
      clearTimers();
      if (onExitCb) onExitCb();
    }
    el("d7-intro-exit").addEventListener("click", handleExit);
    el("d7-galaxy-exit").addEventListener("click", handleExit);

    runIntro({ onDone: onDoneCb, onBirthdayReady: onBirthdayReadyCb });
  }

  function buildStars(target, count, sizePx) {
    if (!target) return;
    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * 100).toFixed(2);
      const y = (Math.random() * 100).toFixed(2);
      shadows.push(`${x}vw ${y}vh 0 ${sizePx}px rgba(255,255,255,${(0.35 + Math.random() * 0.5).toFixed(2)})`);
    }
    target.style.boxShadow = shadows.join(",");
  }

  /* ---------------- PHASE ONE: the love-gate ---------------- */
  function runIntro({ onDone, onBirthdayReady }) {
    const eyebrow = el("d7-intro-eyebrow");
    const daylabel = el("d7-intro-daylabel");
    const rest = el("d7-intro-rest");
    const loveline = el("d7-intro-loveline");
    const ask = el("d7-intro-ask");
    const form = el("d7-intro-form");
    const input = el("d7-intro-input");
    const response = el("d7-intro-response");
    const introEl = el("d7-intro");

    after(500, () => eyebrow.classList.add("is-in"));
    after(1300, () => daylabel.classList.add("is-in"));
    after(2400, () => rest.classList.add("is-in"));
    after(5200, () => {
      rest.classList.add("is-fading");
      after(900, () => {
        rest.hidden = true;
        loveline.hidden = false;
        requestAnimationFrame(() => loveline.classList.add("is-in"));
      });
    });
    after(7200, () => {
      ask.hidden = false;
      requestAnimationFrame(() => ask.classList.add("is-in"));
    });
    after(8400, () => {
      form.hidden = false;
      requestAnimationFrame(() => {
        form.classList.add("is-in");
        input.focus();
      });
    });

    let wrongCount = 0;
    function onSubmit(e) {
      e.preventDefault();
      const val = normalizeAnswer(input.value);
      if (val === "i love you too") {
        form.removeEventListener("submit", onSubmit);
        succeed();
        return;
      }
      wrongCount++;
      input.value = "";
      input.focus();
      response.textContent = wrongCount === 1 ? "Amirah." : "you know the answer 😭";
      response.classList.remove("is-in");
      void response.offsetWidth;
      response.classList.add("is-in");
      after(2200, () => response.classList.remove("is-in"));
    }
    form.addEventListener("submit", onSubmit);
    // Belt-and-suspenders: a single-text-field form submits on Enter
    // natively in every real browser with no JS needed, but this
    // guarantees it regardless — Enter always resolves to exactly one
    // onSubmit call, never a page reload, never silently doing nothing.
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        if (form.requestSubmit) form.requestSubmit();
        else onSubmit(new Event("submit", { cancelable: true }));
      }
    });

    function succeed() {
      form.classList.add("is-gone");
      loveline.classList.remove("is-in");
      ask.classList.remove("is-in");
      after(900, () => {
        const yeah = make("p", "d7-intro-yeah", "yeah.");
        introEl.appendChild(yeah);
        requestAnimationFrame(() => yeah.classList.add("is-in"));
        after(1900, () => {
          yeah.classList.remove("is-in");
          after(700, () => {
            const come = make("p", "d7-intro-comehere", "come here.");
            introEl.appendChild(come);
            requestAnimationFrame(() => come.classList.add("is-in"));
            after(2200, () => {
              enterGalaxy({ onDone, onBirthdayReady });
            });
          });
        });
      });
    }
  }

  /* ---------------- PHASE TWO: the galaxy + crawl ---------------- */
  function enterGalaxy({ onDone, onBirthdayReady }) {
    const introEl = el("d7-intro");
    const galaxyEl = el("d7-galaxy");
    introEl.classList.add("is-leaving");
    after(950, () => {
      introEl.hidden = true;
      galaxyEl.hidden = false;
      requestAnimationFrame(() => galaxyEl.classList.add("is-in"));
      if (onDone) onDone();
      startCrawl({ onBirthdayReady });
    });
  }

  function startCrawl({ onBirthdayReady }) {
    const stageEl = el("d7-crawl-stage");
    const crawlEl = el("d7-crawl");
    const skipBtn = el("d7-skip");

    skipBtn.addEventListener("click", () => {
      if (skipBtn.dataset.busy) return;
      skipBtn.dataset.busy = "1";
      skipBtn.textContent = "be patient.";
      after(1700, () => {
        skipBtn.textContent = "skip";
        delete skipBtn.dataset.busy;
      });
    });

    requestAnimationFrame(() => {
      const contentH = crawlEl.getBoundingClientRect().height;
      const viewportH = stageEl.getBoundingClientRect().height;
      const totalDistance = contentH + viewportH * 1.25;
      const pxPerMs = totalDistance / (crawlSeconds() * 1000);

      const blockEls = crawlEl.querySelectorAll(".d7-block");
      const lastBlockEl = blockEls[blockEls.length - 1] || crawlEl;

      // Starts already most of the way into view (not sitting fully
      // below the fold) — the title should be visibly moving the
      // instant the galaxy appears, not after a long empty runway
      // she has no way to know is coming. Purely automatic: no wheel,
      // no touch-scroll, nothing to interpret or accidentally fast-
      // forward through — this is the one thing on Day 7 that plays
      // itself, start to finish, with zero input.
      let y = viewportH * 0.32;
      let lastT = performance.now();
      let finished = false;

      function applyY() {
        crawlEl.style.transform = `translateX(-50%) translateY(${y}px)`;
      }
      applyY();

      function frame(t) {
        const dt = t - lastT;
        lastT = t;
        if (!finished) {
          y -= pxPerMs * dt;
          applyY();
        }
        // Completion is observed from the real last block's own
        // position, not a computed/guessed duration — it must have
        // fully passed above the readable stage before we're done.
        if (!finished) {
          const rect = lastBlockEl.getBoundingClientRect();
          const stageTop = stageEl.getBoundingClientRect().top;
          if (rect.bottom < stageTop) {
            finished = true;
            onCrawlComplete({ onBirthdayReady });
            return;
          }
        }
        if (!finished) rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);
    });
  }

  function onCrawlComplete({ onBirthdayReady }) {
    // Silence — the sky holds empty. No countdown, no timer, nothing.
    after(4200, () => {
      const galaxyEl = el("d7-galaxy");
      const star = make("div", "d7-falling-star");
      galaxyEl.appendChild(star);
      after(2500, () => {
        star.remove();
        // Midnight case: if trusted time already says the birthday
        // started while she was reading, skip the countdown entirely
        // and hand off straight into Day 8 instead of showing a
        // countdown to a moment that already happened.
        const entry = window.TimeLock.unlocks().find((u) => u.id === "birthday");
        if (entry && entry.unlocked) {
          clearTimers();
          if (onBirthdayReady) onBirthdayReady();
          return;
        }
        showCountdown({ onBirthdayReady });
      });
    });
  }

  function showCountdown({ onBirthdayReady }) {
    const countdownEl = el("d7-countdown");
    const digitsEl = el("d7-countdown-digits");
    countdownEl.hidden = false;
    requestAnimationFrame(() => countdownEl.classList.add("is-in"));

    function tick() {
      const galaxyEl = el("d7-galaxy");
      if (!galaxyEl || galaxyEl.hidden) return; // scene was exited
      const entry = window.TimeLock.unlocks().find((u) => u.id === "birthday");
      if (entry && entry.unlocked) {
        clearTimers();
        if (onBirthdayReady) onBirthdayReady();
        return;
      }
      const d = formatDigits(entry.msRemaining);
      digitsEl.textContent = `${d.d} : ${d.h} : ${d.m} : ${d.s}`;
      after(1000, tick);
    }
    tick();
  }

  function exit() {
    clearTimers();
  }

  return { render, exit };
})();
