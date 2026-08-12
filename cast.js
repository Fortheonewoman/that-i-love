/* ============================================================
   cast.js — the coach and the peeper. They run across the whole
   birthday sequence, not just one act.

   Both are built the same way: a real head (a transparent PNG, or
   until that's supplied, a drawn placeholder face so nothing ever
   looks broken) sitting on an animated SVG body made of <path>
   elements. The body is maths, so it's cheap and it's 60fps.

   Head images are expected at:
     img/heads/obinna-neutral.png
     img/heads/obinna-shouting.png
     img/heads/obinna-shy.png
     img/heads/obinna-delighted.png
     img/heads/amirah-*.png  (used in act 9)
   Until those exist, HeadImage() below falls back to a small drawn
   face automatically — swap in real files later and nothing else
   changes.
   ============================================================ */

(function () {
  "use strict";

  function headMarkup(name, expression, size = 72) {
    const src = `img/heads/${name}-${expression}.png`;
    const fallbackId = `head-fallback-${name}-${expression}-${Math.random().toString(36).slice(2)}`;
    // Try the real cutout; if it 404s, swap to a drawn placeholder face
    // instead of showing a broken-image icon.
    return `
      <span class="cast-head" style="width:${size}px;height:${size}px;">
        <img src="${src}" alt="" class="cast-head-img"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <span class="cast-head-fallback" id="${fallbackId}">${name === "amirah" ? "🧡" : "🙂"}</span>
      </span>`;
  }

  function bodyMarkup(colorVar) {
    // A simple, cheap suit-and-limbs figure built from paths so it
    // can bob/run/gesture via CSS transforms on the sub-groups.
    return `
      <svg class="cast-body" viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g class="cast-leg cast-leg-l">
          <path d="M45 100 L38 155 L52 155 L50 100 Z" fill="${colorVar}" />
        </g>
        <g class="cast-leg cast-leg-r">
          <path d="M55 100 L50 155 L64 155 L62 100 Z" fill="${colorVar}" />
        </g>
        <g class="cast-arm cast-arm-l">
          <path d="M42 60 L20 95 L28 100 L48 68 Z" fill="${colorVar}" />
        </g>
        <g class="cast-arm cast-arm-r">
          <path d="M58 60 L80 95 L72 100 L52 68 Z" fill="${colorVar}" />
        </g>
        <path class="cast-torso" d="M35 55 Q50 45 65 55 L68 105 Q50 115 32 105 Z" fill="${colorVar}" />
      </svg>`;
  }

  function makeFigure({ name, expression, colorVar, size }) {
    const el = document.createElement("div");
    el.className = "cast-figure";
    el.innerHTML = `
      <div class="cast-head-slot">${headMarkup(name, expression, size)}</div>
      ${bodyMarkup(colorVar)}
    `;
    return el;
  }

  // ---- The peeper -----------------------------------------------
  // Pops in from a screen edge roughly every 10s, says "i love you",
  // bolts before she can catch him. He's Obinna — she isn't told.
  const EDGES = ["top", "right", "bottom", "left"];
  let peeperTimer = null;
  let peeperAppearances = 0;
  let peeperCaught = false;
  let onCatchCallback = null;

  function spawnPeeper(layer) {
    if (peeperCaught) return;
    peeperAppearances++;
    const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
    const fig = makeFigure({ name: "obinna", expression: "shy", colorVar: "var(--accent)", size: 56 });
    fig.classList.add("peeper", `peeper-${edge}`);

    const lingerLong = peeperAppearances > 5 && Math.random() < 0.35;
    fig.innerHTML += `<span class="peeper-line">i love you</span>`;

    layer.appendChild(fig);
    requestAnimationFrame(() => fig.classList.add("is-in"));

    let caughtThisTime = false;
    fig.addEventListener("click", () => {
      if (!lingerLong || caughtThisTime) return;
      caughtThisTime = true;
      peeperCaught = true;
      fig.classList.add("is-caught");
      if (onCatchCallback) onCatchCallback();
    });

    const stay = lingerLong ? 1600 : 900;
    setTimeout(() => {
      if (caughtThisTime) return;
      fig.classList.remove("is-in");
      fig.classList.add("is-out");
      setTimeout(() => fig.remove(), 500);
    }, stay);
  }

  function startPeeper(layer) {
    if (peeperTimer) return;
    const loop = () => {
      spawnPeeper(layer);
      peeperTimer = setTimeout(loop, 9000 + Math.random() * 2000);
    };
    peeperTimer = setTimeout(loop, 4000);
  }

  function stopPeeper() {
    clearTimeout(peeperTimer);
    peeperTimer = null;
  }

  // ---- The coach --------------------------------------------------
  // Arrives in act 6 and stays for the rest of the site.
  let coachEl = null;

  function ensureCoach(layer) {
    if (coachEl) return coachEl;
    coachEl = makeFigure({ name: "obinna", expression: "shouting", colorVar: "#3a6cff", size: 64 });
    coachEl.className += " coach";
    coachEl.innerHTML += `<span class="coach-line" id="coach-line"></span>`;
    layer.appendChild(coachEl);
    requestAnimationFrame(() => coachEl.classList.add("is-in"));
    return coachEl;
  }

  function coachSay(text) {
    if (!coachEl) return;
    const lineEl = coachEl.querySelector("#coach-line");
    lineEl.textContent = text;
    lineEl.classList.remove("is-shown");
    void lineEl.offsetWidth;
    lineEl.classList.add("is-shown");
  }

  window.Cast = {
    startPeeper,
    stopPeeper,
    onPeeperCatch(cb) {
      onCatchCallback = cb;
    },
    hasCaughtPeeper: () => peeperCaught,
    forceCaughtPeeper: () => {
      peeperCaught = true;
    },
    ensureCoach,
    coachSay,
    makeFigure,
  };
})();
