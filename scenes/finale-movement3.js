/* ============================================================
   Movement III — Twenty-One. 21 small lights scattered through the
   composition (golden-angle spiral, same trick as Day 4's sky, on
   purpose — this is the same 21, older by three days). Most light
   themselves; she can tap a few to help; the 21st is reserved for
   the cat alone, same as it always was.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m3 = (function () {
  "use strict";
  const { el, make, Cat } = window.FinaleCore;

  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  const CENTER = { x: 50, y: 48 };
  const LIGHTS = Array.from({ length: 21 }, (_, i) => {
    const angle = i * 137.5 * (Math.PI / 180);
    const radius = 1.4 + i * 0.58;
    return {
      id: "l" + i,
      x: CENTER.x + Math.cos(angle) * radius * 2.0,
      y: CENTER.y + Math.sin(angle) * radius * 1.05,
    };
  });
  const LAST_ID = LIGHTS[LIGHTS.length - 1].id;

  function buildHTML() {
    return `
      <div class="fin-m3" id="fin-m3">
        <div class="fin-grain" aria-hidden="true"></div>
        <div class="fin-m3-lights" id="fin-m3-lights">
          ${LIGHTS.map((l) => `<button type="button" class="fin-m3-light" id="fin-m3-${l.id}" style="left:${l.x}%; top:${l.y}%" aria-label="light"></button>`).join("")}
        </div>
        <p class="fin-m3-count" id="fin-m3-count" hidden></p>
        <p class="fin-m3-headline" id="fin-m3-headline" hidden>HAPPY 21ST, AMIRAH.</p>
      </div>`;
  }

  return {
    async enter({ container, go, ctx }) {
      container.innerHTML = buildHTML();
      Cat.show();
      Cat.moveTo(50, 75, 800);

      let lit = 0;
      const countEl = el("fin-m3-count");
      countEl.hidden = false;
      requestAnimationFrame(() => countEl.classList.add("is-in"));

      function updateCount() {
        countEl.textContent = `${lit} / 21`;
      }
      updateCount();

      function light(id) {
        const btn = el("fin-m3-" + id);
        if (!btn || btn.classList.contains("is-lit")) return;
        btn.classList.add("is-lit");
        lit++;
        updateCount();
        if (lit === 20) {
          countEl.classList.add("is-holding");
        }
        if (lit >= 21) finish();
      }

      // She can tap any light herself — capped so 21 always waits
      // for the cat specifically, never a stray tap.
      LIGHTS.forEach((l) => {
        if (l.id === LAST_ID) return;
        const btn = el("fin-m3-" + l.id);
        btn.addEventListener("click", () => light(l.id));
      });

      // Most of them light themselves, staggered — she never has to
      // click all 21 to see this finish.
      const autoOrder = LIGHTS.slice(0, 20).sort(() => Math.random() - 0.5);
      autoOrder.forEach((l, i) => {
        after(1200 + i * 480, () => light(l.id));
      });

      let finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        after(1200, () => {
          const headline = el("fin-m3-headline");
          headline.hidden = false;
          requestAnimationFrame(() => headline.classList.add("is-in"));
          container.querySelector(".fin-m3").classList.add("is-celebrating");
        });
        after(4200, () => go(4));
      }

      // Once every auto light has landed, give the cat a beat, then
      // let it find the last one on its own.
      after(1200 + 20 * 480 + 900, () => {
        if (lit >= 21) return;
        const lastLight = LIGHTS[LIGHTS.length - 1];
        Cat.moveTo(lastLight.x, lastLight.y - 6, 900);
        after(1000, () => {
          Cat.paw();
          light(LAST_ID);
        });
      });
    },
    exit() {
      clearTimers();
      Cat.reset();
    },
    skip() {
      clearTimers();
      Cat.reset();
      Birthday.goToMovement(4);
    },
  };
})();
