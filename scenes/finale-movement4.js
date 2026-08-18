/* ============================================================
   Movement IV — The Party. The one place the whole finale is
   allowed to lose its composure — but on a budget: a fixed, finite
   burst of petals/ribbon/paper pieces that clean themselves up,
   never an infinite spawner. The cat panics and runs. Then it cuts,
   hard, into Movement V's silence.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m4 = (function () {
  "use strict";
  const { el, make, Cat, photoFrame } = window.FinaleCore;

  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  const SHAPES = ["petal", "ribbon", "paper", "star"];
  const PIECE_COUNT = 46; // finite — see the brief: no infinite spawner

  function buildHTML() {
    return `
      <div class="fin-m4" id="fin-m4">
        <div class="fin-m4-burst" id="fin-m4-burst"></div>
        <div class="fin-m4-photos" id="fin-m4-photos"></div>
        <h1 class="fin-m4-word fin-m4-word-a" id="fin-m4-word-a">TWENTY-ONE</h1>
        <h1 class="fin-m4-word fin-m4-word-b" id="fin-m4-word-b">Amirachi.</h1>
      </div>`;
  }

  function burstPieces() {
    const host = el("fin-m4-burst");
    for (let i = 0; i < PIECE_COUNT; i++) {
      const shape = SHAPES[i % SHAPES.length];
      const piece = make("span", `fin-piece fin-piece-${shape}`);
      piece.style.left = Math.random() * 100 + "%";
      piece.style.setProperty("--delay", Math.random() * 900 + "ms");
      piece.style.setProperty("--drift", (Math.random() * 60 - 30) + "px");
      piece.style.setProperty("--dur", 2600 + Math.random() * 1800 + "ms");
      piece.style.setProperty("--rot", Math.random() * 540 - 270 + "deg");
      host.appendChild(piece);
      // Each piece removes itself once its own fall animation ends —
      // the layer never accumulates or keeps spawning after this.
      setTimeout(() => piece.remove(), 5200);
    }
  }

  function scatterPhotos() {
    const host = el("fin-m4-photos");
    const positions = [
      { x: 10, y: 18, r: -8 },
      { x: 78, y: 14, r: 6 },
      { x: 16, y: 68, r: 5 },
      { x: 82, y: 66, r: -6 },
    ];
    positions.forEach((p, i) => {
      after(200 + i * 220, () => {
        const frame = photoFrame({ role: "silly", index: i, treatment: "torn" });
        frame.classList.add("fin-m4-swing");
        frame.style.left = p.x + "%";
        frame.style.top = p.y + "%";
        frame.style.setProperty("--r", p.r + "deg");
        host.appendChild(frame);
        requestAnimationFrame(() => frame.classList.add("is-in"));
      });
    });
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m4");
      requestAnimationFrame(() => stage.classList.add("is-in"));

      burstPieces();
      scatterPhotos();

      after(200, () => Cat.panic());
      after(300, () => Cat.moveTo(85, 85, 1600));

      after(600, () => el("fin-m4-word-a").classList.add("is-in"));
      after(2200, () => {
        el("fin-m4-word-a").classList.add("is-leaving");
        el("fin-m4-word-b").classList.add("is-in");
      });

      // The party is loud on purpose, then it's cut — hard, not a
      // fade — straight into Movement V's stillness.
      after(4600, () => go(5));
    },
    exit() {
      clearTimers();
      Cat.reset();
      const burst = el("fin-m4-burst");
      if (burst) burst.innerHTML = "";
    },
    skip() {
      clearTimers();
      Cat.reset();
      Birthday.goToMovement(5);
    },
  };
})();
