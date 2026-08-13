/* ============================================================
   Day 2 — "Things That Turn Into You". A bespoke interactive
   collection, not the generic day template. Random objects,
   scattered like a real desk/scrapbook, that quietly turn out to
   be connected by a single red thread — and by her.

   Real content (screenshots, track names, the photo) is TBD —
   this file uses clearly-labelled placeholders for those. The
   copy that Obinna wrote out in full (the little texts, the gift
   card line, the J. Cole line, the final payoff) is treated as
   final and used verbatim.
   ============================================================ */
window.Day2Scene = (function () {
  "use strict";

  const LITTLE_TEXTS = [
    "saw this. thought of you. annoying.",
    "you've ruined this color for everyone else.",
    "kept it because it felt like you.",
    "this makes absolutely no sense without you in my head.",
    "another completely unrelated thing you somehow own now.",
  ];
  const SCREENSHOT_CAPTIONS = [
    "kept this.",
    "obviously screenshotted.",
    "there was no reason to save this. I saved it anyway.",
  ];

  // Position + rotation are in percent-of-canvas / degrees. Hand
  // placed, not a grid.
  const ITEMS = [
    { id: "giftcard", kind: "absence", x: 12, y: 20, rot: -3 },
    { id: "screenshots", kind: "stack", x: 72, y: 16, rot: 4 },
    { id: "cole", kind: "music", x: 46, y: 54, rot: -2 },
    { id: "note1", kind: "note", x: 22, y: 62, rot: -7, text: LITTLE_TEXTS[0] },
    { id: "receipt1", kind: "receipt", x: 83, y: 58, rot: 5, text: LITTLE_TEXTS[1] },
    { id: "envelope1", kind: "envelope", x: 9, y: 82, rot: 2, text: LITTLE_TEXTS[2] },
    { id: "tag1", kind: "tag", x: 62, y: 84, rot: -3, text: LITTLE_TEXTS[3] },
    { id: "scrap1", kind: "scrap", x: 36, y: 32, rot: 9, text: LITTLE_TEXTS[4] },
    { id: "photo1", kind: "photo", x: 88, y: 36, rot: 4 },
    { id: "swatch", kind: "swatch", x: 56, y: 22, rot: -5 },
  ];

  let activatedOrder = [];
  let root = null;
  let canvasEl = null;
  let pathEl = null;
  let threadSvg = null;
  let onDoneCb = null;
  let idleTimer = null;
  let reorganized = false;

  // The SVG's viewBox is kept in sync with the canvas's real pixel
  // size (see syncThreadViewBox), so these are real, undistorted
  // pixel coordinates — not a stretched 0-100 space, which is what
  // made the line render as a broken/dashed streak before.
  function syncThreadViewBox() {
    const w = canvasEl.clientWidth || 800;
    const h = canvasEl.clientHeight || 600;
    threadSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }

  function rebuildThread(points) {
    if (points.length < 2) {
      pathEl.setAttribute("d", "");
      return;
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const mx = (prev.x + cur.x) / 2 + (i % 2 === 0 ? 22 : -22);
      const my = (prev.y + cur.y) / 2 + (i % 2 === 0 ? -22 : 22);
      d += i === 1 ? ` Q ${mx} ${my} ${cur.x} ${cur.y}` : ` T ${cur.x} ${cur.y}`;
    }
    pathEl.setAttribute("d", d);
    const len = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${len} ${len}`;
    pathEl.style.strokeDashoffset = String(len);
    requestAnimationFrame(() => {
      pathEl.style.transition = "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)";
      pathEl.style.strokeDashoffset = "0";
    });
  }

  function currentPositions() {
    return ITEMS.map((item) => {
      const el = document.getElementById(`d2-${item.id}`);
      if (!el) return { id: item.id, x: 0, y: 0 };
      return { id: item.id, x: el.offsetLeft, y: el.offsetTop };
    });
  }

  function activate(id) {
    if (activatedOrder.includes(id)) return;
    activatedOrder.push(id);
    clearTimeout(idleTimer);

    const pts = activatedOrder
      .map((aid) => currentPositions().find((p) => p.id === aid))
      .filter(Boolean);
    rebuildThread(pts);

    const nudge = document.getElementById("d2-nudge");
    if (nudge) nudge.hidden = true;

    if (activatedOrder.length >= ITEMS.length) {
      setTimeout(reorganizeAndClose, 1400);
    } else if (activatedOrder.length >= 3) {
      idleTimer = setTimeout(() => {
        if (nudge) nudge.hidden = false;
      }, 6000);
    }
  }

  function gatherRest() {
    const remaining = ITEMS.filter((it) => !activatedOrder.includes(it.id));
    remaining.forEach((it, i) => {
      setTimeout(() => {
        const el = document.getElementById(`d2-${it.id}`);
        if (el) el.dispatchEvent(new Event("d2activate"));
      }, i * 280);
    });
  }

  function reorganizeAndClose() {
    if (reorganized) return;
    reorganized = true;
    const nudge = document.getElementById("d2-nudge");
    if (nudge) nudge.hidden = true;

    // An abstract spiral, not a heart — golden-angle placement reads
    // as deliberate and organic rather than a shape traced over.
    const cx = 50, cy = 46;
    const settled = ITEMS.map((item, i) => {
      const angle = i * 137.5 * (Math.PI / 180);
      const radius = 5 + i * 3.4;
      return {
        id: item.id,
        x: Math.max(8, Math.min(92, cx + Math.cos(angle) * radius)),
        y: Math.max(10, Math.min(88, cy + Math.sin(angle) * radius * 0.72)),
      };
    });

    settled.forEach((p) => {
      const el = document.getElementById(`d2-${p.id}`);
      if (!el) return;
      el.style.left = p.x + "%";
      el.style.top = p.y + "%";
      el.classList.add("is-settling");
    });
    // Positions above are set synchronously, so offsetLeft/Top already
    // reflect the new targets even though the visual glide takes 2s —
    // the thread can safely tighten onto them right away.
    rebuildThread(currentPositions().filter((p) => activatedOrder.includes(p.id)));

    setTimeout(() => {
      canvasEl.classList.add("is-fading");
      setTimeout(showFinale, 1400);
    }, 2200);
  }

  function showFinale() {
    // Collapse the canvas's layout space too, not just its opacity —
    // otherwise the finale sits centred in the leftover empty space
    // below it instead of centred in the viewport.
    canvasEl.hidden = true;
    const finale = document.getElementById("d2-finale");
    if (finale) {
      finale.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => finale.classList.add("is-in")));
    }
    if (onDoneCb) onDoneCb();
  }

  function itemMarkup(item) {
    switch (item.kind) {
      case "absence":
        return `
          <div class="d2-absence-outline">
            <span class="d2-absence-label">IBADAN → currently holding evidence</span>
          </div>
          <p class="d2-reveal-text">all the gift cards are in Ibadan.</p>`;
      case "stack":
        return `
          <div class="d2-shot d2-shot-1"><span class="d2-shot-caption">${SCREENSHOT_CAPTIONS[0]}</span></div>
          <div class="d2-shot d2-shot-2"><span class="d2-shot-caption">${SCREENSHOT_CAPTIONS[1]}</span></div>
          <div class="d2-shot d2-shot-3"><span class="d2-shot-caption">${SCREENSHOT_CAPTIONS[2]}</span></div>
          <p class="d2-tap-hint">tap</p>`;
      case "music":
        return `
          <div class="d2-vinyl"></div>
          <div class="d2-sleeve"></div>
          <div class="d2-cole-reveal">
            <p class="d2-cole-title">ALL THE J. COLE LOVE SONGS</p>
            <p class="d2-cole-sub">apparently these belong to you now</p>
          </div>`;
      case "note":
        return `<div class="d2-note-paper"><span class="d2-note-text">${item.text}</span></div>`;
      case "receipt":
        return `<div class="d2-receipt-body"><span class="d2-receipt-text">${item.text}</span></div>`;
      case "envelope":
        return `
          <div class="d2-envelope-flap"></div>
          <div class="d2-envelope-body"></div>
          <span class="d2-envelope-text">${item.text}</span>`;
      case "tag":
        return `<div class="d2-tag-string"></div><div class="d2-tag-body"><span>${item.text}</span></div>`;
      case "scrap":
        return `<div class="d2-scrap-paper"><span>${item.text}</span></div>`;
      case "photo":
        return `
          <div class="d2-photo-placeholder">
            <span class="d2-photo-plus">＋</span>
          </div>
          <p class="d2-reveal-text">a picture I took because I knew she'd like it</p>`;
      case "swatch":
        return `
          <div class="d2-swatch-card"></div>
          <p class="d2-reveal-text">a colour that's hers now</p>`;
      default:
        return "";
    }
  }

  function wireItem(item) {
    const el = document.getElementById(`d2-${item.id}`);
    if (!el) return;
    el.dataset.ox = item.x;
    el.dataset.oy = item.y;

    const doActivate = () => {
      el.classList.add("is-activated");
      activate(item.id);
    };

    if (item.kind === "stack") {
      el.addEventListener("click", () => {
        if (el.classList.contains("is-activated")) return;
        doActivate();
      });
    } else {
      el.addEventListener("click", doActivate);
    }
    el.addEventListener("d2activate", doActivate);
  }

  function buildSceneHTML() {
    const items = ITEMS.map(
      (item) => `
      <button type="button" class="d2-item d2-item-${item.kind}" id="d2-${item.id}"
        style="left:${item.x}%; top:${item.y}%; --rot:${item.rot}deg;">
        ${itemMarkup(item)}
      </button>`
    ).join("");

    return `
      <div class="d2-scene" id="d2-scene">
        <div class="d2-opening" id="d2-opening">
          <p class="d2-eyebrow">DAY 2</p>
          <h2 class="d2-title">Things That Turn Into You</h2>
          <p class="d2-line">At some point, completely normal things started reminding me of you.</p>
          <button type="button" class="d2-continue" id="d2-continue">begin</button>
        </div>

        <div class="d2-canvas" id="d2-canvas" hidden>
          <svg class="d2-thread" id="d2-thread-svg" aria-hidden="true">
            <path id="d2-thread-path" fill="none" stroke="#C0142B" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          ${items}
          <p class="d2-nudge" id="d2-nudge" hidden>
            still a few things here <button type="button" id="d2-gather">gather them →</button>
          </p>
        </div>

        <div class="d2-finale" id="d2-finale" hidden>
          <p class="d2-finale-text">I didn't have pictures of us.<br/>So I made something out of every piece of you I had.</p>
          <button type="button" class="d2-finale-back" id="d2-finale-back">← back to the seven days</button>
        </div>
      </div>`;
  }

  function render(container, opts) {
    root = container;
    onDoneCb = (opts && opts.onDone) || null;
    activatedOrder = [];
    reorganized = false;
    clearTimeout(idleTimer);

    root.innerHTML = buildSceneHTML();
    canvasEl = document.getElementById("d2-canvas");
    pathEl = document.getElementById("d2-thread-path");
    threadSvg = document.getElementById("d2-thread-svg");

    document.getElementById("d2-continue").addEventListener("click", () => {
      document.getElementById("d2-opening").classList.add("is-leaving");
      setTimeout(() => {
        document.getElementById("d2-opening").hidden = true;
        canvasEl.hidden = false;
        syncThreadViewBox();
        requestAnimationFrame(() => canvasEl.classList.add("is-in"));
      }, 500);
    });

    document.getElementById("d2-gather").addEventListener("click", gatherRest);

    document.getElementById("d2-finale-back").addEventListener("click", () => {
      const closeBtn = document.getElementById("day-overlay-close");
      if (closeBtn) closeBtn.click();
    });

    ITEMS.forEach(wireItem);
  }

  return { render };
})();
