/* ============================================================
   Movement IV — Favorite Color. Real, not a bit: after four years
   Obinna genuinely doesn't know her favorite color. The cat notices
   a strange light, chases it, touches it — everything freezes — then
   the site finally asks. An immersive dark room of floating color
   panes, not swatch buttons; "something else" opens a real color
   picker as the specific-choice escape hatch. She must actually
   choose — nothing here is prefilled or auto-selected.

   Persists to localStorage + Birthday.ctx.favoriteColor + the
   --d8-chosen CSS var (read by every later movement/replay). If a
   color is already stored (a previous run, or a replay), this
   movement does not ask again — it reaffirms briefly and moves on,
   per the brief's own replay requirement.

   Every async continuation checks a generation token before touching
   the DOM — see finale-movement5.js's header for why (playSequence
   manages its own internal timers, so clearTimers() alone can't stop
   a stale chain from a movement she's already left).
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m4 = (function () {
  "use strict";
  const { el, make, Cat, playSequence } = window.FinaleCore;

  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  let generation = 0;

  const PANES = [
    ["warm gold", "#f3c15f"],
    ["rich red", "#c0142b"],
    ["hot pink", "#e63e8c"],
    ["deep cobalt", "#3b5bff"],
    ["violet", "#6c3fd6"],
    ["fresh green", "#2f9e5c"],
    ["blush", "#f0b8c6"],
    ["pearl silver", "#dfe4ee"],
  ];

  function storedColor() {
    try {
      return localStorage.getItem("amirachi:favoriteColor");
    } catch {
      return null;
    }
  }

  function applyColor(hex) {
    document.documentElement.style.setProperty("--d8-chosen", hex);
    document.documentElement.style.setProperty("--fin-chosen", hex);
    try {
      localStorage.setItem("amirachi:favoriteColor", hex);
    } catch {}
    Birthday.ctx.favoriteColor = hex;
  }

  function runAlreadyKnown(myGen, hex, done) {
    applyColor(hex);
    const after1 = el("fin-m4-after");
    if (!after1) return;
    after1.hidden = false;
    after1.style.setProperty("--d8-chosen", hex);
    requestAnimationFrame(() => after1.classList.add("is-in"));
    const p = make("p", "fin-m4-finally", "still that color, right?");
    after1.appendChild(p);
    after(2200, () => {
      if (myGen !== generation) return;
      after1.classList.add("is-fading");
      after(700, () => myGen === generation && done());
    });
  }

  function runCatDiscovery(myGen, done) {
    Cat.show();
    Cat.moveTo(20, 70, 900);
    after(1000, () => myGen === generation && Cat.lookOffscreen());
    after(1800, () => {
      if (myGen !== generation) return;
      Cat.stopLooking();
      Cat.moveTo(62, 45, 1300);
    });
    after(3200, () => myGen === generation && Cat.paw());
    after(3900, () => myGen === generation && done());
  }

  function runAsk(myGen, done) {
    const talk = el("fin-m4-talk");
    if (!talk) return;
    playSequence(
      talk,
      [
        { type: "line", text: "wait." },
        { type: "pause", ms: 1000 },
        { type: "line", text: "four years." },
        { type: "pause", ms: 1000 },
        { type: "line", text: "and somehow i still don't know this." },
        { type: "pause", ms: 1100 },
        { type: "big", text: "what's your favorite color?" },
        { type: "pause", ms: 900 },
      ],
      {
        onDone: () => {
          if (myGen !== generation) return;
          talk.classList.add("is-fading");
          after(600, () => {
            if (myGen !== generation) return;
            talk.hidden = true;
            done();
          });
        },
      }
    );
  }

  function runRoom(myGen, done) {
    const room = el("fin-m4-room");
    if (!room) return;
    room.hidden = false;
    room.innerHTML =
      PANES.map(
        ([name, hex], i) =>
          `<button type="button" class="fin-m4-pane" data-hex="${hex}" style="--pc:${hex}; --tilt:${(i % 2 === 0 ? -1 : 1) * (3 + (i % 3))}deg" aria-label="${name}"></button>`
      ).join("") +
      `<button type="button" class="fin-m4-pane fin-m4-pane-other" id="fin-m4-other" aria-label="something else"></button>` +
      `<input type="color" id="fin-m4-color-input" class="fin-m4-color-input" aria-label="pick a specific color" />`;
    requestAnimationFrame(() => room.classList.add("is-in"));

    function choose(hex) {
      if (myGen !== generation) return;
      const chosen = room.querySelector(`[data-hex="${hex}"]`);
      if (chosen) chosen.classList.add("is-chosen");
      Cat.sit();
      room.classList.add("is-fading");
      after(650, () => {
        if (myGen !== generation) return;
        room.hidden = true;
        applyColor(hex);
        done(hex);
      });
    }

    room.querySelectorAll(".fin-m4-pane:not(.fin-m4-pane-other)").forEach((btn) => {
      btn.addEventListener("click", () => choose(btn.dataset.hex), { once: true });
    });
    el("fin-m4-other").addEventListener("click", () => el("fin-m4-color-input").click());
    el("fin-m4-color-input").addEventListener("input", (e) => choose(e.target.value), { once: true });
  }

  function runFinally(myGen, hex, done) {
    const after1 = el("fin-m4-after");
    if (!after1) return;
    after1.hidden = false;
    after1.style.setProperty("--d8-chosen", hex);
    requestAnimationFrame(() => after1.classList.add("is-in"));
    const finally1 = make("p", "fin-m4-finally", "finally.");
    after1.appendChild(finally1);
    after(1300, () => {
      if (myGen !== generation) return;
      const late = make("p", "fin-m4-late", "four years late.");
      after1.appendChild(late);
      requestAnimationFrame(() => late.classList.add("is-in"));
    });
    after(3000, () => {
      if (myGen !== generation) return;
      after1.classList.add("is-fading");
      after(700, () => myGen === generation && done());
    });
  }

  return {
    async enter({ container, go }) {
      generation++;
      const myGen = generation;
      container.innerHTML = `
        <div class="fin-m4" id="fin-m4">
          <div class="fin-m4-cat-beat" id="fin-m4-cat-beat"></div>
          <div class="fin-m4-talk" id="fin-m4-talk"></div>
          <div class="fin-m4-room" id="fin-m4-room" hidden></div>
          <div class="fin-m4-after" id="fin-m4-after" hidden></div>
        </div>`;
      const existing = storedColor();
      if (existing) {
        runAlreadyKnown(myGen, existing, () => go(5));
        return;
      }
      runCatDiscovery(myGen, () => {
        runAsk(myGen, () => {
          runRoom(myGen, (hex) => {
            runFinally(myGen, hex, () => go(5));
          });
        });
      });
    },
    exit() {
      generation++;
      clearTimers();
      Cat.reset();
    },
    skip() {
      generation++;
      clearTimers();
      // Skipping does NOT invent an answer — "she must actually
      // choose" is absolute. If nothing's stored yet, Birthday.ctx
      // .favoriteColor simply stays null and every later movement's
      // --d8-chosen keeps resolving to the neutral default already
      // baked into the palette (var(--d8-gold)), same as the balloon.
      Cat.reset();
      Birthday.goToMovement(5);
    },
  };
})();
