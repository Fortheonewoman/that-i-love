/* ============================================================
   Day 3 — "The Distance Machine". A bespoke interactive scene, not
   the generic day template (same pattern as Day 2 in day2.js).

   No photos. The whole thing is built from who she is (engineer,
   cat person) and what the two of them have actually done (4 years,
   3 of them long-distance) — a blueprint that starts as graphite
   and cream and slowly gets invaded by colour as the "machine"
   comes together.
   ============================================================ */
window.Day3Scene = (function () {
  "use strict";

  const ATTEMPTS = [
    { label: "EXTENSION CABLE v2", reach: 42 },
    { label: "LONG DISTANCE PATCH", reach: 58 },
    { label: "PLEASE WORK THIS TIME", reach: 71 },
    { label: "ENGINEERING APPROACH: questionable", reach: 81 },
  ];
  const CHECKS = ["messages", "calls", "annoying each other remotely", "missing each other", "showing up anyway"];
  const DISTANCE_KM = "8,419";

  let root, onDoneCb;
  let stage = 0; // 0 opening, 1 cable, 2 cat, 3 chase, 4 connected, 5 turn, 6 ending
  let attemptIndex = 0;
  let catReturns = 0;
  let dragging = false;
  let dragStartX = 0;
  let plugEl, cableEl, sceneEl, catEl;

  function setStage(n) {
    stage = n;
    if (sceneEl) sceneEl.dataset.stage = String(n);
  }

  function el(id) {
    return document.getElementById(id);
  }

  /* ---- Phase 1: the cable that's always too short ---- */
  function wireCable() {
    plugEl = el("d3-plug");
    cableEl = el("d3-cable");
    const track = el("d3-track");

    function trackRect() {
      return track.getBoundingClientRect();
    }

    function setReachPercent(pct) {
      plugEl.style.left = pct + "%";
      cableEl.setAttribute("x2", pct + "%");
    }

    function attemptOutcome() {
      const attempt = ATTEMPTS[Math.min(attemptIndex, ATTEMPTS.length - 1)];
      setReachPercent(attempt.reach);
      const ticket = document.createElement("div");
      ticket.className = "d3-ticket";
      ticket.style.setProperty("--i", String(attemptIndex));
      ticket.textContent = attempt.label;
      el("d3-tickets").appendChild(ticket);
      requestAnimationFrame(() => ticket.classList.add("is-in"));
      attemptIndex++;
      setTimeout(() => setReachPercent(14), 550); // springs back short, every time
      if (attemptIndex >= ATTEMPTS.length) {
        setTimeout(startCatPhase, 1400);
      }
    }

    function onPointerDown(e) {
      if (stage !== 1) return;
      dragging = true;
      dragStartX = e.clientX ?? (e.touches && e.touches[0].clientX);
      plugEl.classList.add("is-dragging");
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const x = e.clientX ?? (e.touches && e.touches[0].clientX);
      const r = trackRect();
      const pct = Math.max(14, Math.min(92, ((x - r.left) / r.width) * 100));
      plugEl.style.left = pct + "%";
      cableEl.setAttribute("x2", pct + "%");
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      plugEl.classList.remove("is-dragging");
      attemptOutcome();
    }

    // mousedown→mouseup already covers a plain click/tap (no
    // movement needed to count as a pull attempt) — a separate
    // "click" listener here would double-fire, since mouseup+click
    // both dispatch for the same physical click.
    plugEl.addEventListener("mousedown", onPointerDown);
    plugEl.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("touchmove", onPointerMove, { passive: true });
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("touchend", onPointerUp);
  }

  /* ---- Phase 2/3: the assistant engineer ---- */
  function startCatPhase() {
    setStage(2);
    el("d3-status").textContent = "assistant engineer has arrived.";
    catEl = el("d3-cat");
    catEl.hidden = false;
    catEl.className = "d3-cat is-sitting";
    catEl.style.left = "48%";
    catReturns = 0;
    catEl.onclick = shooCat;
  }

  function shooCat() {
    if (stage === 2) {
      catEl.classList.remove("is-sitting");
      catEl.classList.add("is-leaving");
      catReturns++;
      setTimeout(() => {
        if (catReturns < 2) {
          catEl.classList.remove("is-leaving");
          catEl.style.left = 40 + Math.random() * 16 + "%";
          void catEl.offsetWidth;
          catEl.classList.add("is-sitting");
          el("d3-status").textContent = "it came back.";
        } else {
          startChase();
        }
      }, 900);
    } else if (stage === 3) {
      catchCat();
    }
  }

  function startChase() {
    setStage(3);
    el("d3-status").textContent = "the cat has taken a component and run off with it.";
    catEl.classList.remove("is-leaving", "is-sitting");
    catEl.classList.add("is-running");
    catEl.innerHTML = catEl.innerHTML + `<span class="d3-cat-loot">⚙︎</span>`;
    let bounces = 0;
    const bounce = setInterval(() => {
      catEl.style.left = 10 + Math.random() * 70 + "%";
      catEl.style.top = 20 + Math.random() * 55 + "%";
      bounces++;
      if (bounces > 14) {
        clearInterval(bounce);
        catchCat();
      }
    }, 650);
    catEl.dataset.bounceId = bounce;
  }

  function catchCat() {
    if (stage !== 3) return;
    clearInterval(catEl.dataset.bounceId);
    catEl.classList.remove("is-running");
    catEl.classList.add("is-caught");
    setTimeout(completeConnection, 900);
  }

  /* ---- Phase 4: connected + diagnostics ---- */
  function completeConnection() {
    setStage(4);
    catEl.hidden = true;
    plugEl.style.left = "86%";
    // SVG elements don't reliably reflect the `.hidden` IDL property
    // back onto the content attribute the way HTML elements do — use
    // setAttribute/removeAttribute directly for these two lines.
    cableEl.setAttribute("hidden", ""); // the dashed attempt-cable steps aside for the real, lit-up one
    el("d3-cable-final").removeAttribute("hidden");
    el("d3-status").textContent = "";
    el("d3-diagnostics").hidden = false;
    el("d3-diag-title").textContent = "CONNECTION TESTING…";

    const list = el("d3-diag-list");
    CHECKS.forEach((check, i) => {
      setTimeout(() => {
        const row = document.createElement("div");
        row.className = "d3-diag-row";
        row.innerHTML = `<span>${check}</span><span class="d3-diag-check">✓</span>`;
        list.appendChild(row);
        requestAnimationFrame(() => row.classList.add("is-in"));
      }, 500 + i * 550);
    });

    setTimeout(() => {
      el("d3-stat").hidden = false;
      requestAnimationFrame(() => el("d3-stat").classList.add("is-in"));
    }, 500 + CHECKS.length * 550 + 700);

    setTimeout(emotionalTurn, 500 + CHECKS.length * 550 + 3600);
  }

  /* ---- Phase 5: the turn ---- */
  function emotionalTurn() {
    setStage(5);
    const turn = el("d3-turn");
    turn.hidden = false;
    requestAnimationFrame(() => turn.classList.add("is-in"));
    el("d3-turn-number").textContent = DISTANCE_KM + " km";

    setTimeout(() => {
      el("d3-turn-number").classList.add("is-glitching");
      setTimeout(() => {
        el("d3-turn-number").classList.remove("is-glitching");
        el("d3-turn-number").textContent = "ERROR";
        el("d3-turn-number").classList.add("is-error");
      }, 500);
    }, 1800);

    setTimeout(() => showLine("line1"), 3200);
    setTimeout(() => showLine("line2"), 6200);
    setTimeout(() => showLine("line3"), 9600);
    setTimeout(ending, 13400);
  }
  function showLine(id) {
    const l = el("d3-" + id);
    if (l) l.classList.add("is-in");
  }

  /* ---- Phase 6: the two ends move together ---- */
  function ending() {
    setStage(6);
    el("d3-turn").classList.add("is-collapsing");
    setTimeout(() => {
      el("d3-turn").hidden = true;
      const end = el("d3-end");
      end.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => end.classList.add("is-in")));
      setTimeout(() => {
        el("d3-end-reading").textContent = "0 km — pending.";
        el("d3-end-houses").classList.add("is-close");
      }, 1200);
      setTimeout(() => {
        const stamp = el("d3-stamp");
        stamp.hidden = false;
        requestAnimationFrame(() => stamp.classList.add("is-in"));
      }, 3400);
      setTimeout(() => {
        el("d3-back").hidden = false;
        requestAnimationFrame(() => el("d3-back").classList.add("is-in"));
        if (onDoneCb) onDoneCb();
      }, 4600);
    }, 900);
  }

  function buildHTML() {
    return `
      <div class="d3-scene" id="d3-scene" data-stage="0">
        <div class="d3-opening" id="d3-opening">
          <p class="d3-eyebrow">DAY 3</p>
          <h2 class="d3-title">The Distance Machine</h2>
          <p class="d3-status-line">PROJECT STATUS: somehow still operational</p>
          <div class="d3-card">
            <div class="d3-card-row"><span>Runtime</span><span>4 years</span></div>
            <div class="d3-card-row"><span>Remote operation</span><span>3 years</span></div>
            <div class="d3-card-row"><span>Primary engineer</span><span>Amirachi</span></div>
            <div class="d3-card-row"><span>Known defect</span><span>an unreasonable amount of distance</span></div>
            <div class="d3-card-row"><span>Objective</span><span>0 km</span></div>
          </div>
          <button type="button" class="d3-continue" id="d3-continue">begin</button>
        </div>

        <div class="d3-blueprint" id="d3-blueprint" hidden>
          <p class="d3-status" id="d3-status">drag the connector toward Arlington.</p>

          <div class="d3-track" id="d3-track">
            <div class="d3-house d3-house-a">
              <svg viewBox="0 0 60 50" aria-hidden="true"><path d="M30 4 L56 24 L50 24 L50 46 L10 46 L10 24 L4 24 Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>
              <span>LAGOS</span>
            </div>
            <div class="d3-house d3-house-b">
              <svg viewBox="0 0 60 50" aria-hidden="true"><path d="M30 4 L56 24 L50 24 L50 46 L10 46 L10 24 L4 24 Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>
              <span>ARLINGTON</span>
            </div>

            <svg class="d3-wire-svg" aria-hidden="true">
              <defs>
                <linearGradient id="d3-wire-gradient" gradientUnits="userSpaceOnUse" x1="14%" y1="0" x2="86%" y2="0">
                  <stop offset="0%" stop-color="#FF6F5E"/>
                  <stop offset="35%" stop-color="#FFD65C"/>
                  <stop offset="65%" stop-color="#2E9E6B"/>
                  <stop offset="100%" stop-color="#3B5BFF"/>
                </linearGradient>
              </defs>
              <line id="d3-cable" x1="14%" y1="50%" x2="14%" y2="50%" />
              <line id="d3-cable-final" x1="14%" y1="50%" x2="86%" y2="50%" hidden />
            </svg>
            <button type="button" class="d3-plug" id="d3-plug" style="left:14%" aria-label="pull the connector"></button>

            <div class="d3-tickets" id="d3-tickets"></div>
            <div class="d3-cat" id="d3-cat" hidden><span class="d3-cat-emoji">🐈</span></div>
          </div>

          <div class="d3-diagnostics" id="d3-diagnostics" hidden>
            <p class="d3-diag-title" id="d3-diag-title"></p>
            <div class="d3-diag-list" id="d3-diag-list"></div>
          </div>
          <div class="d3-stat" id="d3-stat" hidden>
            <p class="d3-stat-big">4 YEARS OF CONTINUOUS OPERATION</p>
            <p class="d3-stat-small">3 of them from far away</p>
          </div>
        </div>

        <div class="d3-turn" id="d3-turn" hidden>
          <p class="d3-turn-label">DISTANCE REMAINING</p>
          <p class="d3-turn-number" id="d3-turn-number"></p>
          <p class="d3-turn-line" id="d3-line1">distance is a terrible measurement for this.</p>
          <p class="d3-turn-line" id="d3-line2">You became part of my everyday life from somewhere I couldn't even reach.</p>
          <p class="d3-turn-line d3-turn-line-final" id="d3-line3">We built something real without getting to share the same place.</p>
        </div>

        <div class="d3-end" id="d3-end" hidden>
          <div class="d3-end-houses" id="d3-end-houses">
            <span class="d3-end-dot"></span>
            <span class="d3-end-line"></span>
            <span class="d3-end-dot"></span>
          </div>
          <p class="d3-end-reading" id="d3-end-reading">calculating…</p>
          <div class="d3-stamp" id="d3-stamp" hidden>APPROVED FOR<br/>CONTINUED CONSTRUCTION</div>
          <button type="button" class="d3-back" id="d3-back" hidden>← back to the seven days</button>
        </div>
      </div>`;
  }

  function render(container, opts) {
    root = container;
    onDoneCb = (opts && opts.onDone) || null;
    stage = 0;
    attemptIndex = 0;
    catReturns = 0;
    dragging = false;

    root.innerHTML = buildHTML();
    sceneEl = el("d3-scene");

    el("d3-continue").addEventListener("click", () => {
      el("d3-opening").classList.add("is-leaving");
      setTimeout(() => {
        el("d3-opening").hidden = true;
        el("d3-blueprint").hidden = false;
        setStage(1);
        requestAnimationFrame(() => el("d3-blueprint").classList.add("is-in"));
      }, 500);
    });

    el("d3-back").addEventListener("click", () => {
      const closeBtn = document.getElementById("day-overlay-close");
      if (closeBtn) closeBtn.click();
    });

    wireCable();
  }

  return { render };
})();
