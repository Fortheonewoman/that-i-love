/* ============================================================
   Movement II — The Explosion. The sky just cleared for her — so
   the whole website detonates. Huge typography, a finite (never
   infinite) burst of petals/ribbons/confetti/stars, a fast-cut
   montage, the cat panicking. Then, hard: everything gets pulled
   away, and a quiet line starts the real story.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m2 = (function () {
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
  const PIECE_COUNT = 70;

  function buildHTML() {
    return `
      <div class="fin-m2" id="fin-m2">
        <div class="fin-m2-burst" id="fin-m2-burst"></div>
        <h1 class="fin-m2-headline" id="fin-m2-headline">HAPPY BIRTHDAY<br/>AMIRAH!!!</h1>
        <div class="fin-m2-montage" id="fin-m2-montage"></div>
        <p class="fin-m2-21" id="fin-m2-21">21</p>
        <div class="fin-m2-after" id="fin-m2-after" hidden></div>
      </div>`;
  }

  function burstPieces(count) {
    const host = el("fin-m2-burst");
    for (let i = 0; i < count; i++) {
      const shape = SHAPES[i % SHAPES.length];
      const piece = make("span", `fin-piece fin-piece-${shape}`);
      piece.style.left = Math.random() * 100 + "%";
      piece.style.setProperty("--delay", Math.random() * 1400 + "ms");
      piece.style.setProperty("--drift", Math.random() * 70 - 35 + "px");
      piece.style.setProperty("--dur", 2800 + Math.random() * 2200 + "ms");
      piece.style.setProperty("--rot", Math.random() * 540 - 270 + "deg");
      host.appendChild(piece);
      setTimeout(() => piece.remove(), 5600);
    }
  }

  const MOTIF_BEATS = ["portrait", "trio", "candid", "hero", "flower", "candid"];

  function runMontage(container, done) {
    const stage = el("fin-m2-montage");
    let i = 0;
    const total = 6;
    function beat() {
      if (i >= total) return done();
      stage.innerHTML = "";
      const kind = MOTIF_BEATS[i % MOTIF_BEATS.length];
      if (kind === "trio") {
        const wrap = make("div", "fin-m2-trio");
        for (let k = 0; k < 3; k++) wrap.appendChild(photoFrame({ role: "candid", index: i + k, treatment: "print" }));
        stage.appendChild(wrap);
      } else if (kind === "flower") {
        stage.appendChild(make("div", "fin-m2-flower-beat"));
      } else {
        const frame = photoFrame({ role: kind === "hero" ? "hero" : "candid", index: i, treatment: kind === "hero" ? "full" : "print" });
        frame.classList.add("fin-m2-solo");
        stage.appendChild(frame);
      }
      requestAnimationFrame(() => stage.classList.add("is-in"));
      if (i % 2 === 0) Cat.moveTo(10 + Math.random() * 75, 78 + Math.random() * 12, 500);
      i++;
      const t = setTimeout(() => {
        stage.classList.remove("is-in");
        setTimeout(beat, 180);
      }, 520);
      timers.push(t);
    }
    beat();
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m2");
      requestAnimationFrame(() => stage.classList.add("is-in"));

      burstPieces(PIECE_COUNT);
      Cat.show();
      Cat.panic();
      Cat.moveTo(50, 15, 300);

      after(150, () => el("fin-m2-headline").classList.add("is-in"));
      after(900, () => el("fin-m2-21").classList.add("is-in"));

      after(1700, () => {
        el("fin-m2-headline").classList.add("is-settled");
        el("fin-m2-21").classList.add("is-settled");
        runMontage(container, () => {
          // A second, smaller confetti wave right as the montage ends —
          // keeps the energy from just trailing off.
          burstPieces(30);
          Cat.panic();
        });
      });

      // Hard pull-away: the party gets yanked, not faded politely.
      after(8600, () => {
        el("fin-m2-burst").innerHTML = "";
        el("fin-m2-headline").classList.add("is-gone");
        el("fin-m2-21").classList.add("is-gone");
        el("fin-m2-montage").classList.add("is-gone");
        stage.classList.add("is-quiet");
        Cat.stand();
        Cat.moveTo(50, 60, 800);

        const after1 = el("fin-m2-after");
        after1.hidden = false;
        window.FinaleCore.playSequence(
          after1,
          [
            { type: "line", text: "okay." },
            { type: "pause", ms: 900 },
            { type: "line", text: "now that we've got that out of the way…" },
            { type: "pause", ms: 1400 },
          ],
          { onDone: () => go(3) }
        );
      });
    },
    exit() {
      clearTimers();
      Cat.reset();
      const burst = el("fin-m2-burst");
      if (burst) burst.innerHTML = "";
    },
    skip() {
      clearTimers();
      Cat.reset();
      Birthday.goToMovement(3);
    },
  };
})();
