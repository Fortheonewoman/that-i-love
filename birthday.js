/* ============================================================
   birthday.js — the movement director for Day 8. Loads
   scenes/finale-movement1..5.js (each attaches itself to
   window.Movements.mN as {enter, exit, skip}), and moves between
   them.

   Day 8 storyboard (per the Day 8 rebuild — no relation to the old
   5-act "sky/explosion/story/twenty-one/them" structure):
     1. The Balloon      — silence, one balloon, she pops it, fireworks.
     2. The Explosion     — HAPPY BIRTHDAY / AMIRAH / 21, fireworks,
                            confetti, disco, a real photo/video montage.
     3. 21 Seconds         — the one fast, hard-cut montage.
     4. Favorite Color     — the real question, finally asked.
     5. Affirmations       — seven lines, said aloud, one at a time.
   Carousel/final-smile, Obinna's voice, and the final celebration
   are further movements, still being built — see finale-movement5.js
   for where the currently-built experience settles for now.

   Day 8 is the LAST day — nothing here hands off anywhere else once
   the sequence ends. (Day 7's own ending is what hands off INTO Day
   8, via app.js's launchBirthdayFromDay7(); the reverse never
   happens now.)

   Dev shortcut: ?act=3 in the URL jumps straight to movement 3, so a
   single movement can be replayed without stepping through from the
   start every time. (Param kept as "act" for URL stability.)

   Shared state (ctx) lives here so any movement can read/write it —
   e.g. her chosen favorite color, once she's picked it.
   ============================================================ */
const Birthday = (function () {
  "use strict";

  const TOTAL_MOVEMENTS = 7;
  let currentMovement = null;
  let currentN = 0;

  const ctx = {
    favoriteColor: null, // set by Movement IV once she picks; --d8-chosen/--fin-chosen carry it as CSS vars too
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
      // Day 8 is the last day now — nothing to hand off to once the
      // sequence finishes. Reserved for the final movement to mark
      // "Day 8 fully watched" bookkeeping, if that ever matters.
      onDone: () => {},
    });
  }

  // Lets her back out of Day 8 mid-sequence to the day grid, without
  // leaving a stale movement's timers/async chains running behind
  // her — same exit() contract every movement already honors for
  // normal movement-to-movement transitions.
  function stop() {
    if (currentMovement && currentMovement.exit) {
      try {
        currentMovement.exit();
      } catch (err) {
        console.warn("movement exit error:", err);
      }
    }
    currentMovement = null;
    currentN = 0;
    const stage = stageEl();
    if (stage) stage.innerHTML = "";
    const root = document.getElementById("birthday");
    if (root) root.hidden = true;
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

  async function start() {
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
    stop,
    goToMovement,
    ctx,
    get currentMovement() {
      return currentN;
    },
  };
})();
