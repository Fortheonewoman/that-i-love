/* ============================================================
   Movement IV — Twenty-One. 21 small lights scattered through the
   composition (golden-angle spiral, same trick as Day 4's sky, on
   purpose — this is the same 21, a few scenes older). Most light
   themselves; she can tap a few; the 21st is reserved for the cat
   alone. If she picked a favorite color last movement, the lights
   glow in it instead of the default butter gold.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m4 = (function () {
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
      <div class="fin-m4t" id="fin-m4t">
        <div class="fin-grain" aria-hidden="true"></div>
        <div class="fin-m4t-lights" id="fin-m4t-lights">
          ${LIGHTS.map((l) => `<button type="button" class="fin-m4t-light" id="fin-m4t-${l.id}" style="left:${l.x}%; top:${l.y}%" aria-label="light"></button>`).join("")}
        </div>
        <p class="fin-m4t-count" id="fin-m4t-count" hidden></p>
        <p class="fin-m4t-headline" id="fin-m4t-headline" hidden>HAPPY 21ST, AMIRAH.</p>
      </div>`;
  }

  return {
    async enter({ container, go, ctx }) {
      container.innerHTML = buildHTML();
      const chosen = (ctx && ctx.favoriteColor) || getComputedStyle(document.documentElement).getPropertyValue("--fin-chosen").trim();
      if (chosen) {
        document.getElementById("fin-m4t").style.setProperty("--m4t-light", chosen);
      }
      Cat.show();
      Cat.moveTo(50, 75, 800);

      let lit = 0;
      const countEl = el("fin-m4t-count");
      countEl.hidden = false;
      requestAnimationFrame(() => countEl.classList.add("is-in"));
      function updateCount() {
        countEl.textContent = `${lit} / 21`;
      }
      updateCount();

      function light(id) {
        const btn = el("fin-m4t-" + id);
        if (!btn || btn.classList.contains("is-lit")) return;
        btn.classList.add("is-lit");
        lit++;
        updateCount();
        if (lit === 20) countEl.classList.add("is-holding");
        if (lit >= 21) finish();
      }

      LIGHTS.forEach((l) => {
        if (l.id === LAST_ID) return;
        el("fin-m4t-" + l.id).addEventListener("click", () => light(l.id));
      });

      const autoOrder = LIGHTS.slice(0, 20).sort(() => Math.random() - 0.5);
      autoOrder.forEach((l, i) => after(1200 + i * 460, () => light(l.id)));

      let finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        after(1200, () => {
          const headline = el("fin-m4t-headline");
          headline.hidden = false;
          requestAnimationFrame(() => headline.classList.add("is-in"));
          container.querySelector(".fin-m4t").classList.add("is-celebrating");
        });
        after(4200, () => go(5));
      }

      after(1200 + 20 * 460 + 900, () => {
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
      Birthday.goToMovement(5);
    },
  };
})();
