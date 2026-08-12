/* ============================================================
   birthday.js — the act director. Loads scenes/act1.js..act9.js
   (each attaches itself to window.Acts.actN as {enter, exit, skip}),
   and moves between them.

   Two ways in:
     - Naturally, when TimeLock says the birthday has unlocked.
     - Dev shortcut: ?act=5 in the URL jumps straight there, so a
       single act can be replayed without stepping through from
       act 1 every time.

   Shared state (her chosen colour, whether she's caught the peeper,
   the names list) lives in `Birthday.ctx` so any act can read/set it.
   ============================================================ */

const Birthday = (function () {
  "use strict";

  const TOTAL_ACTS = 9;
  let currentAct = null;
  let currentN = 0;

  const ctx = {
    chosenColor: null,
    favouriteFood: null,
    stateAnswer: null,
    peeperCaughtBeforeAct8: false,
    names: ["Yasmin", "Femi"], // more can be appended here as they arrive
  };

  function stageEl() {
    return document.getElementById("act-stage");
  }
  function progressEl() {
    return document.getElementById("act-progress");
  }

  function updateProgress() {
    const el = progressEl();
    if (!el) return;
    el.innerHTML = Array.from({ length: TOTAL_ACTS }, (_, i) => {
      const n = i + 1;
      return `<span class="act-dot ${n <= currentN ? "is-done" : ""} ${n === currentN ? "is-current" : ""}"></span>`;
    }).join("");
  }

  async function goToAct(n) {
    if (n < 1 || n > TOTAL_ACTS) return;
    if (currentAct && currentAct.exit) {
      try {
        currentAct.exit();
      } catch (err) {
        console.warn("act exit error:", err);
      }
    }
    stageEl().innerHTML = "";
    currentN = n;
    updateProgress();

    const mod = window.Acts && window.Acts["act" + n];
    if (!mod) {
      console.warn("act" + n + " not loaded yet");
      return;
    }
    currentAct = mod;
    await mod.enter({ container: stageEl(), go: goToAct, ctx });
  }

  function skipCurrent() {
    if (currentAct && currentAct.skip) {
      currentAct.skip();
    } else {
      goToAct(currentN + 1);
    }
  }

  function wireChrome() {
    const skipBtn = document.getElementById("act-skip");
    if (skipBtn) skipBtn.addEventListener("click", skipCurrent);
  }

  async function start() {
    document.getElementById("birthday").hidden = false;
    wireChrome();

    const params = new URLSearchParams(location.search);
    const devAct = parseInt(params.get("act"), 10);
    if (devAct >= 1 && devAct <= TOTAL_ACTS) {
      await goToAct(devAct);
      return;
    }
    await goToAct(1);
  }

  return { start, goToAct, ctx, get currentAct() { return currentN; } };
})();
