/* ============================================================
   birthday.js — the movement director. Loads scenes/finale-movement
   1..5.js (each attaches itself to window.Movements.mN as
   {enter, exit, skip}), and moves between them.

   Two ways in:
     - Naturally, when TimeLock says the birthday has unlocked.
     - Dev shortcut: ?act=3 in the URL jumps straight to movement 3,
       so a single movement can be replayed without stepping through
       from the start every time. (Param kept as "act" for URL
       stability — it now addresses movements, not the old acts.)

   Shared state (ctx) lives here so any movement can read/write it —
   e.g. how many of the 21 lights are lit, whether the "I LOVE YOU"
   letters have already assembled once this run, etc.

   Every movement's enter() receives { container, go, ctx, onDone },
   where onDone is only ever called by movement 5, to hand off to
   Day 7 through app.js.
   ============================================================ */
const Birthday = (function () {
  "use strict";

  const TOTAL_MOVEMENTS = 5;
  let currentMovement = null;
  let currentN = 0;
  let onRequestDay7 = null;

  const ctx = {
    litLights: 0, // Movement III's 21-light count, read by later movements for the Day-4 callback
    caughtCat: false,
  };

  function stageEl() {
    return document.getElementById("movement-stage");
  }
  function progressEl() {
    return document.getElementById("movement-progress");
  }

  function updateProgress() {
    const el = progressEl();
    if (!el) return;
    el.innerHTML = Array.from({ length: TOTAL_MOVEMENTS }, (_, i) => {
      const n = i + 1;
      return `<span class="movement-dot ${n <= currentN ? "is-done" : ""} ${n === currentN ? "is-current" : ""}"></span>`;
    }).join("");
  }

  async function goToMovement(n) {
    if (n < 1 || n > TOTAL_MOVEMENTS) return;
    if (currentMovement && currentMovement.exit) {
      try {
        currentMovement.exit();
      } catch (err) {
        console.warn("movement exit error:", err);
      }
    }
    stageEl().innerHTML = "";
    currentN = n;
    updateProgress();
    document.getElementById("movement-stage").dataset.movement = String(n);

    const mod = window.Movements && window.Movements["m" + n];
    if (!mod) {
      console.warn("movement " + n + " not loaded yet");
      return;
    }
    currentMovement = mod;
    await mod.enter({
      container: stageEl(),
      go: goToMovement,
      ctx,
      onDone: () => {
        if (onRequestDay7) onRequestDay7();
      },
    });
  }

  function skipCurrent() {
    if (currentMovement && currentMovement.skip) {
      currentMovement.skip();
    } else {
      goToMovement(currentN + 1);
    }
  }

  function wireChrome() {
    const skipBtn = document.getElementById("movement-skip");
    if (skipBtn) skipBtn.addEventListener("click", skipCurrent);
  }

  async function start(opts) {
    onRequestDay7 = (opts && opts.onRequestDay7) || null;
    document.getElementById("birthday").hidden = false;
    wireChrome();

    const params = new URLSearchParams(location.search);
    const devMovement = parseInt(params.get("act"), 10);
    if (devMovement >= 1 && devMovement <= TOTAL_MOVEMENTS) {
      await goToMovement(devMovement);
      return;
    }
    await goToMovement(1);
  }

  return {
    start,
    goToMovement,
    ctx,
    get currentMovement() {
      return currentN;
    },
  };
})();
