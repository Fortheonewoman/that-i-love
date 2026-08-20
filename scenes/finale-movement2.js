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

  // Module-scoped (not local to enter()) so exit()/skip() can always
  // tear these down, even if she leaves before the natural cleanup
  // beat at the end of enter()'s own timeline runs.
  let fw = null;
  let disco = null;
  function teardownEffects() {
    if (fw) {
      fw.destroy();
      fw = null;
    }
    if (disco) {
      disco.remove();
      disco = null;
    }
  }

  const SHAPES = ["petal", "ribbon", "paper", "star"];
  const PIECE_COUNT = 70;

  function buildHTML() {
    return `
      <div class="fin-m2" id="fin-m2">
        <div class="fin-m2-burst" id="fin-m2-burst"></div>
        <h1 class="fin-m2-headline" id="fin-m2-headline">HAPPY BIRTHDAY</h1>
        <h1 class="fin-m2-headline fin-m2-headline-2" id="fin-m2-headline-2">AMIRAH</h1>
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

  // One real beat of motion in the middle of the still photos — the
  // crown clip, held noticeably longer than a photo beat so it actually
  // reads as moving instead of flickering past like a seventh photo.
  const MOTIF_BEATS = ["portrait", "trio", "candid", "hero", "flower", "video", "candid"];

  function runMontage(container, done) {
    const stage = el("fin-m2-montage");
    let i = 0;
    const total = MOTIF_BEATS.length;
    function beat() {
      if (i >= total) return done();
      stage.innerHTML = "";
      const kind = MOTIF_BEATS[i % MOTIF_BEATS.length];
      let holdMs = 520;
      if (kind === "trio") {
        const wrap = make("div", "fin-m2-trio");
        for (let k = 0; k < 3; k++) wrap.appendChild(photoFrame({ role: "candid", index: i + k, treatment: "print" }));
        stage.appendChild(wrap);
      } else if (kind === "flower") {
        stage.appendChild(make("div", "fin-m2-flower-beat"));
      } else if (kind === "video" && window.FinaleCore.pickVideo("hero")) {
        const frame = window.FinaleCore.videoFrame({ role: "hero", index: i, treatment: "full" });
        frame.classList.add("fin-m2-solo");
        stage.appendChild(frame);
        holdMs = 1500;
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
        // This inner timeout must be tracked too, not just the outer
        // one — otherwise it survives clearTimers() on exit/skip and
        // fires beat() again against a DOM that's already gone (this
        // was a real crash: el("fin-m2-burst") returning null once
        // the movement had moved on).
        const t2 = setTimeout(beat, 180);
        timers.push(t2);
      }, holdMs);
      timers.push(t);
    }
    beat();
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m2");
      requestAnimationFrame(() => stage.classList.add("is-in"));

      disco = window.FinaleCore.discoLayer(stage, { beams: 6, glints: 16 });
      fw = window.FinaleCore.Fireworks.mount(stage);

      burstPieces(PIECE_COUNT);
      Cat.show();
      Cat.panic();
      Cat.moveTo(50, 15, 300);

      // A first small volley right as the party opens, before the
      // bigger launches land under the headlines.
      fw.launch({ x: 0.22, y: 0.28 });
      fw.launch({ x: 0.78, y: 0.32 });

      // HAPPY BIRTHDAY / AMIRAH / 21 — three separate giant beats,
      // one at a time (this is what the balloon's BOOM breaks apart
      // into), each settling to a small mark before the next lands.
      after(150, () => {
        el("fin-m2-headline").classList.add("is-in");
        fw.launch({ x: 0.5, y: 0.22, color: "#f3c15f" });
      });
      after(900, () => {
        el("fin-m2-headline").classList.add("is-settled");
        el("fin-m2-headline-2").classList.add("is-in");
        fw.launch({ x: 0.32, y: 0.3, color: "#ff2e88" });
        fw.launch({ x: 0.68, y: 0.26, color: "#ff2e88" });
      });
      after(1650, () => {
        el("fin-m2-headline-2").classList.add("is-settled");
        el("fin-m2-21").classList.add("is-in");
        fw.launch({ x: 0.5, y: 0.35, color: "#3d7fff", count: 70 });
      });

      after(2500, () => {
        el("fin-m2-21").classList.add("is-settled");
        window.FinaleCore.boomStamp(stage, { corner: "br" });
        runMontage(container, () => {
          // A second, smaller confetti + fireworks wave right as the
          // montage ends — keeps the energy from just trailing off.
          burstPieces(30);
          fw.launch({ x: 0.25, y: 0.3 });
          fw.launch({ x: 0.75, y: 0.3 });
          Cat.panic();
        });
      });

      // Hard pull-away: the party gets yanked, not faded politely —
      // straight into the 21-second montage, no pivot line needed.
      after(8600, () => {
        el("fin-m2-burst").innerHTML = "";
        el("fin-m2-headline").classList.add("is-gone");
        el("fin-m2-headline-2").classList.add("is-gone");
        el("fin-m2-21").classList.add("is-gone");
        el("fin-m2-montage").classList.add("is-gone");
        stage.classList.add("is-quiet");
        teardownEffects();
        Cat.stand();
        Cat.moveTo(50, 60, 800);
        after(700, () => go(3));
      });
    },
    exit() {
      clearTimers();
      teardownEffects();
      Cat.reset();
      const burst = el("fin-m2-burst");
      if (burst) burst.innerHTML = "";
    },
    skip() {
      clearTimers();
      teardownEffects();
      Cat.reset();
      Birthday.goToMovement(3);
    },
  };
})();
