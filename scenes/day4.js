/* ============================================================
   Day 4 — "The Fourth Day". On the fourth day, the lights were
   placed in the heavens. This one is about HER — she's turning 21,
   and she spends the whole scene arranging a sky without realising
   the last star is her own reflection.

   Reuses the Day 4 celestial visual system (sky, stars, moon, sun,
   cat, tray-to-place, constellation lines) — same CSS as before.
   Story/content only.
   ============================================================ */
window.Day4Scene = (function () {
  "use strict";

  // Ordinary stars — each secretly carries one of her qualities.
  // The label only shows once she's placed it, and never all at once.
  const QUALITY_STARS = [
    { id: "q1", x: 18, y: 34, size: 3, word: "curiosity" },
    { id: "q2", x: 26, y: 30, size: 3, word: "softness" },
    { id: "q3", x: 24, y: 46, size: 3, word: "stubbornness" },
    { id: "q4", x: 32, y: 40, size: 3, word: "brilliance" },
    { id: "q5", x: 10, y: 55, size: 3, word: "kindness" },
    { id: "q6", x: 88, y: 58, size: 3, word: "courage" },
    { id: "q7", x: 70, y: 45, size: 3, word: "the part of you that keeps going" },
  ];
  const FILLER_STARS = [
    { id: "f1", x: 15, y: 18, size: 2 },
    { id: "f2", x: 85, y: 85, size: 2 },
    { id: "f3", x: 61, y: 78, size: 2 },
  ];
  const SUN = { x: 50, y: 12 };
  const MOON = { x: 80, y: 20 };

  // The 21-star constellation — a golden-angle scatter, so it reads
  // as one deliberate shape rather than a grid, generated instead of
  // hand-authored (this is her age, not a hand-drawn glyph).
  const TWENTYONE_CENTER = { x: 48, y: 74 };
  const TWENTYONE = Array.from({ length: 21 }, (_, i) => {
    const angle = i * 137.5 * (Math.PI / 180);
    const radius = 1.6 + i * 0.62;
    // No clamping — the multipliers are chosen so the whole spiral
    // already sits inside a safe area, instead of piling several
    // stars up against a clamped edge.
    return {
      id: "c" + i,
      x: TWENTYONE_CENTER.x + Math.cos(angle) * radius * 1.9,
      y: TWENTYONE_CENTER.y + Math.sin(angle) * radius * 0.85,
    };
  });

  const BECOMING_WORDS = ["learning", "building", "failing", "trying again", "loving", "growing", "becoming"];

  const PLACE_QUEUE = ["sun", "moon", ...QUALITY_STARS.map((s) => s.id), ...FILLER_STARS.map((s) => s.id)];

  let root, onDoneCb;
  let placeIndex = 0;
  let stage = 0;
  let catBounceId = null;
  let mediaStream = null;
  let overlayCloseHandler = null;
  let sceneEl, skyEl, starsLayerEl, threadSvg;
  // Re-entrancy guards — a double-tap on a slow phone (or a stray
  // queued click) must not run a phase's whole timer cascade twice,
  // which would stack duplicate lines/rows on top of each other.
  let mirrorOpening = false;
  let mirrorContinuing = false;

  function el(id) {
    return document.getElementById(id);
  }
  function setStage(n) {
    stage = n;
    if (sceneEl) sceneEl.dataset.stage = String(n);
  }
  function pct(canvas, x, y) {
    return { x: (x / 100) * canvas.clientWidth, y: (y / 100) * canvas.clientHeight };
  }
  function ripple(target) {
    const r = document.createElement("span");
    r.className = "d4-ripple";
    target.appendChild(r);
    setTimeout(() => r.remove(), 1200);
  }

  /* ---- phase 1: sun, moon, quality stars ---- */
  function placeNext() {
    if (placeIndex >= PLACE_QUEUE.length) return;
    const id = PLACE_QUEUE[placeIndex];
    placeIndex++;

    if (id === "sun") {
      el("d4-sun").hidden = false;
      requestAnimationFrame(() => el("d4-sun").classList.add("is-in"));
    } else if (id === "moon") {
      el("d4-moon").hidden = false;
      requestAnimationFrame(() => el("d4-moon").classList.add("is-in"));
      skyEl.classList.add("has-moonlight");
    } else {
      const starEl = document.getElementById("d4-" + id);
      if (!starEl) return;
      starEl.hidden = false;
      requestAnimationFrame(() => starEl.classList.add("is-in"));
      ripple(starEl);
      const meta = QUALITY_STARS.find((s) => s.id === id);
      if (meta) {
        setTimeout(() => {
          const label = document.createElement("p");
          label.className = "d4-const-label d4-quality-label";
          label.style.left = meta.x + "%";
          label.style.top = meta.y - 5 + "%";
          label.textContent = meta.word;
          starsLayerEl.appendChild(label);
          requestAnimationFrame(() => label.classList.add("is-in"));
          setTimeout(() => label.classList.remove("is-in"), 2600);
        }, 500);
      }
    }

    updateTray();

    if (placeIndex >= PLACE_QUEUE.length) {
      el("d4-flowers").hidden = false;
      requestAnimationFrame(() => el("d4-flowers").classList.add("is-in"));
      setTimeout(startCatMischief, 1200);
    }
  }

  function updateTray() {
    const tray = el("d4-tray-btn");
    if (placeIndex >= PLACE_QUEUE.length) {
      tray.hidden = true;
      return;
    }
    const nextId = PLACE_QUEUE[placeIndex];
    tray.querySelector(".d4-tray-icon").textContent = nextId === "sun" ? "☼" : nextId === "moon" ? "☾" : "✦";
  }

  /* ---- the cat: assistant astronomer. mostly visual. ---- */
  function startCatMischief() {
    setStage(2);
    const cat = el("d4-cat");
    cat.hidden = false;
    cat.className = "d4-cat is-onmoon";
    cat.style.left = MOON.x + "%";
    cat.style.top = MOON.y + 6 + "%";

    setTimeout(() => {
      cat.classList.remove("is-onmoon");
      cat.classList.add("is-stealing");
      cat.style.left = "50%";
      cat.style.top = "50%";
      startChase();
    }, 1600);
  }

  function startChase() {
    setStage(3);
    const cat = el("d4-cat");
    cat.classList.remove("is-onmoon");
    cat.classList.add("is-running");
    let bounces = 0;
    catBounceId = setInterval(() => {
      cat.style.left = 10 + Math.random() * 75 + "%";
      cat.style.top = 25 + Math.random() * 55 + "%";
      bounces++;
      if (bounces > 10) {
        clearInterval(catBounceId);
        catchCat();
      }
    }, 550);
    cat.onclick = catchCat;
  }

  function catchCat() {
    if (stage !== 3) return;
    clearInterval(catBounceId);
    const cat = el("d4-cat");
    cat.classList.remove("is-running");
    cat.classList.add("is-caught");
    setTimeout(() => {
      cat.hidden = true;
      revealTwentyOnePrompt();
    }, 900);
  }

  /* ---- phase 2: the 21-star constellation ---- */
  function revealTwentyOnePrompt() {
    setStage(4);
    const tray = el("d4-tray-btn");
    tray.hidden = false;
    tray.querySelector(".d4-tray-icon").textContent = "✦²¹";
    tray.querySelector(".d4-tray-hint").textContent = "a constellation";
    tray.onclick = buildTwentyOne;
  }

  function buildTwentyOne() {
    // Guards the whole 21-star cascade against firing twice — the
    // tray keeps two click handlers (the placeNext listener from
    // render(), plus this one assigned in revealTwentyOnePrompt),
    // so a fast double-tap could otherwise start it twice at once.
    if (stage !== 4) return;
    el("d4-tray-btn").hidden = true;
    setStage(5);
    TWENTYONE.forEach((s, i) => {
      setTimeout(() => {
        const starEl = document.getElementById("d4-" + s.id);
        starEl.hidden = false;
        requestAnimationFrame(() => starEl.classList.add("is-in"));
        if (i % 3 === 0) ripple(starEl);
      }, i * 90);
    });

    setTimeout(() => {
      drawTwentyOneLine();
    }, TWENTYONE.length * 90 + 400);

    setTimeout(() => {
      el("d4-count-big").textContent = "21.";
      el("d4-count-big").hidden = false;
      requestAnimationFrame(() => el("d4-count-big").classList.add("is-in"));
    }, TWENTYONE.length * 90 + 1600);

    setTimeout(() => {
      el("d4-count-sub").hidden = false;
      requestAnimationFrame(() => el("d4-count-sub").classList.add("is-in"));
    }, TWENTYONE.length * 90 + 3200);

    setTimeout(runCelestialCheck, TWENTYONE.length * 90 + 6200);
  }

  function drawTwentyOneLine() {
    threadSvg.setAttribute("viewBox", `0 0 ${skyEl.clientWidth} ${skyEl.clientHeight}`);
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let d = "";
    TWENTYONE.forEach((s, i) => {
      const c = pct(skyEl, s.x, s.y);
      d += (i === 0 ? "M " : "L ") + c.x + " " + c.y + " ";
    });
    p.setAttribute("d", d.trim());
    p.setAttribute("class", "d4-const-line d4-line-21");
    threadSvg.appendChild(p);
    const len = p.getTotalLength();
    p.style.strokeDasharray = len + " " + len;
    p.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      p.style.transition = "stroke-dashoffset 2.4s cubic-bezier(0.22,1,0.36,1)";
      p.style.strokeDashoffset = "0";
    });
  }

  /* ---- phase 3: something is wrong ---- */
  function runCelestialCheck() {
    setStage(6);
    el("d4-count-big").classList.add("is-fading");
    el("d4-count-sub").classList.add("is-fading");

    const rows = ["MOON — PRESENT", "STARS — PRESENT", "CONSTELLATIONS — PRESENT"];
    const list = el("d4-check-list");
    list.hidden = false;
    rows.forEach((text, i) => {
      setTimeout(() => {
        const row = document.createElement("p");
        row.className = "d4-check-row";
        row.textContent = text;
        list.appendChild(row);
        requestAnimationFrame(() => row.classList.add("is-in"));
      }, i * 900);
    });

    setTimeout(() => {
      const row = document.createElement("p");
      row.className = "d4-check-row d4-check-warn";
      row.textContent = "STAR COUNT — 20 / 21";
      list.appendChild(row);
      requestAnimationFrame(() => row.classList.add("is-in"));
    }, rows.length * 900 + 600);

    setTimeout(() => {
      el("d4-missing-line").textContent = "one is missing.";
      el("d4-missing-line").hidden = false;
      requestAnimationFrame(() => el("d4-missing-line").classList.add("is-in"));
      const cat = el("d4-cat");
      cat.hidden = false;
      cat.className = "d4-cat is-searching";
      cat.style.left = "35%";
      cat.style.top = "40%";
    }, rows.length * 900 + 2200);

    setTimeout(() => {
      list.classList.add("is-fading");
      el("d4-missing-line").textContent = "Can't you see it?";
      el("d4-missing-line").classList.remove("is-in");
      requestAnimationFrame(() => el("d4-missing-line").classList.add("is-in"));
    }, rows.length * 900 + 4600);

    setTimeout(() => {
      el("d4-missing-line").classList.remove("is-in");
      setTimeout(() => {
        el("d4-missing-line").textContent = "Look closer.";
        requestAnimationFrame(() => el("d4-missing-line").classList.add("is-in"));
      }, 400);
    }, rows.length * 900 + 7200);

    setTimeout(showCameraPrompt, rows.length * 900 + 9800);
  }

  /* ---- phase 4: the celestial mirror (camera) ---- */
  function showCameraPrompt() {
    setStage(7);
    el("d4-cat").hidden = true;
    // Hard-hide, not just class toggles — these have all cycled
    // through several messages by now and must not linger into the
    // quiet, final moments that follow.
    ["d4-missing-line", "d4-count-big", "d4-count-sub", "d4-check-list"].forEach((id) => {
      const e = el(id);
      e.classList.remove("is-in");
      e.hidden = true;
    });
    const lens = el("d4-lens-prompt");
    lens.hidden = false;
    requestAnimationFrame(() => lens.classList.add("is-in"));
  }

  async function openCelestialMirror() {
    if (mirrorOpening) return;
    mirrorOpening = true;
    el("d4-lens-prompt").classList.remove("is-in");
    setTimeout(() => (el("d4-lens-prompt").hidden = true), 500);

    const mirror = el("d4-mirror");
    mirror.hidden = false;
    requestAnimationFrame(() => mirror.classList.add("is-in"));

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      const video = el("d4-mirror-video");
      video.srcObject = mediaStream;
      video.hidden = false;
      el("d4-mirror-fallback").hidden = true;
      // Never uploaded, never saved, never recorded — this stream
      // only ever feeds a local <video> element. Stopped the moment
      // she leaves this moment (continueFromMirror / overlay close).
      overlayCloseHandler = stopCamera;
      const closeBtn = document.getElementById("day-overlay-close");
      if (closeBtn) closeBtn.addEventListener("click", overlayCloseHandler, { once: true });
    } catch (err) {
      // Camera denied or unavailable — a graceful mirror-like
      // fallback instead of a dead end.
      el("d4-mirror-video").hidden = true;
      el("d4-mirror-fallback").hidden = false;
    }

    setTimeout(() => {
      el("d4-mirror-ring").classList.add("is-in");
    }, 1400);
    setTimeout(() => {
      el("d4-mirror-count").textContent = "21 / 21";
      el("d4-mirror-count").hidden = false;
      requestAnimationFrame(() => el("d4-mirror-count").classList.add("is-in"));
    }, 2800);
    setTimeout(() => {
      el("d4-mirror-line").hidden = false;
      requestAnimationFrame(() => el("d4-mirror-line").classList.add("is-in"));
      const cat = el("d4-cat");
      cat.hidden = false;
      cat.className = "d4-cat is-beside-mirror";
    }, 4600);
    setTimeout(() => {
      el("d4-mirror-continue").hidden = false;
      requestAnimationFrame(() => el("d4-mirror-continue").classList.add("is-in"));
    }, 7200);
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
  }

  function continueFromMirror() {
    if (mirrorContinuing) return;
    mirrorContinuing = true;
    stopCamera();
    const closeBtn = document.getElementById("day-overlay-close");
    if (closeBtn && overlayCloseHandler) closeBtn.removeEventListener("click", overlayCloseHandler);
    el("d4-mirror").classList.remove("is-in");
    el("d4-cat").hidden = true;
    setTimeout(() => {
      el("d4-mirror").hidden = true;
      becomingSection();
    }, 700);
  }

  /* ---- phase 5: twenty-one years of becoming ---- */
  function becomingSection() {
    setStage(8);
    // The last star (the constellation's final point) now glows
    // differently — it's the one that was her all along.
    const lastStar = document.getElementById("d4-" + TWENTYONE[TWENTYONE.length - 1].id);
    if (lastStar) lastStar.classList.add("is-bright");

    const becoming = el("d4-becoming");
    becoming.hidden = false;
    requestAnimationFrame(() => becoming.classList.add("is-in"));

    let wi = 0;
    const wordEl = el("d4-becoming-word");
    wordEl.hidden = false;
    function nextWord() {
      wordEl.classList.remove("is-in");
      setTimeout(() => {
        if (wi >= BECOMING_WORDS.length) return;
        wordEl.textContent = BECOMING_WORDS[wi];
        requestAnimationFrame(() => wordEl.classList.add("is-in"));
        wi++;
        if (wi < BECOMING_WORDS.length) setTimeout(nextWord, 950);
        else setTimeout(afterBecoming, 1500);
      }, 350);
    }
    setTimeout(nextWord, 1400);
  }

  function afterBecoming() {
    el("d4-becoming").classList.add("is-fading");
    setTimeout(() => {
      el("d4-final-lines").hidden = false;
      requestAnimationFrame(() => el("d4-final-lines").classList.add("is-in"));
      setTimeout(() => el("d4-final-line2").classList.add("is-in"), 3200);
    }, 900);
    setTimeout(finalImage, 7500);
  }

  /* ---- phase 6: final image ---- */
  function finalImage() {
    setStage(9);
    el("d4-final-lines").classList.add("is-fading");
    // Same lesson as showCameraPrompt: fully hide the previous
    // section's elements rather than trusting an opacity fade alone
    // not to overlap the next one.
    ["d4-becoming", "d4-final-lines"].forEach((id) => setTimeout(() => (el(id).hidden = true), 900));

    setTimeout(() => {
      const tag = el("d4-final-tag");
      tag.hidden = false;
      requestAnimationFrame(() => tag.classList.add("is-in"));
    }, 1200);

    setTimeout(() => {
      const cat = el("d4-cat");
      cat.hidden = false;
      cat.className = "d4-cat is-sleeping";
      cat.style.left = TWENTYONE_CENTER.x + "%";
      cat.style.top = TWENTYONE_CENTER.y + 10 + "%";
    }, 2600);

    setTimeout(() => {
      el("d4-system-msg").hidden = false;
      requestAnimationFrame(() => el("d4-system-msg").classList.add("is-in"));
    }, 4200);

    setTimeout(() => {
      el("d4-back").hidden = false;
      requestAnimationFrame(() => el("d4-back").classList.add("is-in"));
      if (onDoneCb) onDoneCb();
    }, 5600);
  }

  function starHTML(s) {
    return `<button type="button" class="d4-star" id="d4-${s.id}" style="left:${s.x}%; top:${s.y}%; --size:${s.size}px;" hidden aria-label="star"></button>`;
  }

  function buildHTML() {
    return `
      <div class="d4-scene" id="d4-scene" data-stage="0">
        <div class="d4-opening" id="d4-opening">
          <p class="d4-eyebrow">DAY 4</p>
          <h2 class="d4-open-title" id="d4-open-title">THE FOURTH DAY</h2>
          <p class="d4-open-line" id="d4-open-line1">And God made the lights in the heavens.</p>
          <p class="d4-open-line" id="d4-open-line2">Tonight, you get to finish the sky.</p>
          <button type="button" class="d4-continue" id="d4-continue" hidden>begin</button>
        </div>

        <div class="d4-sky" id="d4-sky" hidden>
          <div class="d4-grain" aria-hidden="true"></div>
          <svg class="d4-thread" id="d4-thread" aria-hidden="true"></svg>
          <div class="d4-stars-layer" id="d4-stars-layer">
            ${QUALITY_STARS.map(starHTML).join("")}
            ${FILLER_STARS.map(starHTML).join("")}
            ${TWENTYONE.map(starHTML).join("")}
            <button type="button" class="d4-sun" id="d4-sun" hidden aria-label="sun">
              <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="14" fill="currentColor"/><g stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="30" y1="2" x2="30" y2="12"/><line x1="30" y1="48" x2="30" y2="58"/>
                <line x1="2" y1="30" x2="12" y2="30"/><line x1="48" y1="30" x2="58" y2="30"/>
                <line x1="9" y1="9" x2="16" y2="16"/><line x1="44" y1="44" x2="51" y2="51"/>
                <line x1="51" y1="9" x2="44" y2="16"/><line x1="16" y1="44" x2="9" y2="51"/>
              </g></svg>
            </button>
            <button type="button" class="d4-moon" id="d4-moon" hidden aria-label="moon">
              <svg viewBox="0 0 60 60" aria-hidden="true"><path d="M38 6 A24 24 0 1 0 38 54 A18 18 0 1 1 38 6Z" fill="currentColor"/></svg>
            </button>
          </div>
          <div class="d4-flowers" id="d4-flowers" hidden aria-hidden="true">
            <svg viewBox="0 0 800 60" preserveAspectRatio="none"><g fill="none" stroke="#3a4a6b" stroke-width="1.5" opacity="0.55">
              <path d="M40 60 Q45 40 55 30"/><path d="M140 60 Q135 38 148 26"/><path d="M260 60 Q255 42 268 30"/>
              <path d="M420 60 Q425 40 438 28"/><path d="M560 60 Q555 40 568 28"/><path d="M700 60 Q705 42 718 30"/>
            </g></svg>
          </div>
          <div class="d4-cat" id="d4-cat" hidden></div>

          <button type="button" class="d4-tray-btn" id="d4-tray-btn">
            <span class="d4-tray-icon">☼</span>
            <span class="d4-tray-hint" id="d4-tray-hint">tap to place</span>
          </button>

          <p class="d4-count-big" id="d4-count-big" hidden></p>
          <p class="d4-count-sub" id="d4-count-sub" hidden>That looks good on you.</p>

          <div class="d4-check-list" id="d4-check-list" hidden></div>
          <p class="d4-missing-line" id="d4-missing-line" hidden></p>

          <div class="d4-lens-prompt" id="d4-lens-prompt" hidden>
            <div class="d4-lens-ring"></div>
            <button type="button" class="d4-lens-btn" id="d4-lens-btn">FIND THE LAST STAR</button>
          </div>

          <div class="d4-mirror" id="d4-mirror" hidden>
            <div class="d4-mirror-ring" id="d4-mirror-ring">
              <video class="d4-mirror-video" id="d4-mirror-video" autoplay playsinline muted hidden></video>
              <div class="d4-mirror-fallback" id="d4-mirror-fallback" hidden>
                <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="38" r="16" fill="currentColor" opacity="0.8"/><path d="M20 90 Q50 58 80 90 Z" fill="currentColor" opacity="0.8"/></svg>
              </div>
            </div>
            <p class="d4-mirror-count" id="d4-mirror-count" hidden></p>
            <p class="d4-mirror-line" id="d4-mirror-line" hidden>there you are.</p>
            <button type="button" class="d4-mirror-continue" id="d4-mirror-continue" hidden>continue</button>
          </div>

          <div class="d4-becoming" id="d4-becoming" hidden>
            <p class="d4-becoming-title">Twenty-one years of becoming.</p>
            <p class="d4-becoming-word" id="d4-becoming-word"></p>
          </div>
          <div class="d4-final-lines" id="d4-final-lines" hidden>
            <p class="d4-line d4-final-line is-in">There are versions of you that haven't even happened yet.</p>
            <p class="d4-line d4-final-line d4-final-line2" id="d4-final-line2">I think that's the best part.</p>
          </div>

          <div class="d4-final-tag" id="d4-final-tag" hidden>
            <p class="d4-final-tag-title">AMIRAH, 21</p>
            <p class="d4-final-tag-sub">still being drawn.</p>
          </div>
          <p class="d4-system-msg" id="d4-system-msg" hidden>FOURTH DAY COMPLETE.</p>
          <button type="button" class="d4-back" id="d4-back" hidden>← back to the seven days</button>
        </div>
      </div>`;
  }

  function render(container, opts) {
    root = container;
    onDoneCb = (opts && opts.onDone) || null;
    stage = 0;
    placeIndex = 0;
    mediaStream = null;
    mirrorOpening = false;
    mirrorContinuing = false;

    root.innerHTML = buildHTML();
    sceneEl = el("d4-scene");
    skyEl = el("d4-sky");
    starsLayerEl = el("d4-stars-layer");
    threadSvg = el("d4-thread");

    const opening = el("d4-opening");
    setTimeout(() => opening.classList.add("is-dusk"), 900);
    setTimeout(() => opening.classList.add("is-midnight"), 1900);
    setTimeout(() => el("d4-open-title").classList.add("is-in"), 2600);
    setTimeout(() => el("d4-open-line1").classList.add("is-in"), 4400);
    setTimeout(() => el("d4-open-line2").classList.add("is-in"), 7000);
    setTimeout(() => (el("d4-continue").hidden = false), 9200);

    el("d4-continue").addEventListener("click", () => {
      opening.classList.add("is-leaving");
      setTimeout(() => {
        opening.hidden = true;
        skyEl.hidden = false;
        setStage(1);
        requestAnimationFrame(() => skyEl.classList.add("is-in"));
      }, 700);
    });

    el("d4-tray-btn").addEventListener("click", () => {
      if (stage === 1) placeNext();
    });
    el("d4-lens-btn").addEventListener("click", openCelestialMirror);
    el("d4-mirror-continue").addEventListener("click", continueFromMirror);
    el("d4-back").addEventListener("click", () => {
      stopCamera();
      const closeBtn = document.getElementById("day-overlay-close");
      if (closeBtn) closeBtn.click();
    });

    updateTray();
  }

  return { render };
})();
