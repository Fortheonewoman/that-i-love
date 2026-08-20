/* ============================================================
   Movement VII — The Final Celebration + Love. Day 8's last act.
   Shorter than the opening explosion but more personal — the site
   now knows her favorite color, and everything here uses it:
   fireworks, confetti accents, the glow behind the "screenshot
   moment" composition. Then it actually stops (fireworks distant,
   confetti settled, cat still, one hero image remaining) before
   "I love you." gets to stand alone, and Obinna's own exact closing
   lines end the day.

   Same generation-token safety pattern as Movements IV/V/VI.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m7 = (function () {
  "use strict";
  const { el, make, Cat, photoFrame, playSequence, boomStamp } = window.FinaleCore;

  let timers = [];
  function after(ms, fn) {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  let generation = 0;
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

  function chosenColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--d8-chosen").trim() || "#f3c15f";
  }

  const SHAPES = ["petal", "ribbon", "paper", "star"];
  function burstPieces(host, count) {
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

  function buildHTML() {
    return `
      <div class="fin-m7" id="fin-m7">
        <div class="fin-m7-burst" id="fin-m7-burst"></div>
        <div class="fin-m7-composition" id="fin-m7-composition" hidden>
          <p class="fin-m7-big21" id="fin-m7-big21">21</p>
          <div class="fin-m7-media" id="fin-m7-media"></div>
          <h1 class="fin-m7-happybday" id="fin-m7-happybday">HAPPY BIRTHDAY, AMIRAH.</h1>
        </div>
        <div class="fin-m7-close" id="fin-m7-close" hidden></div>
      </div>`;
  }

  function runExplosion(myGen, stage, done) {
    const color = chosenColor();
    disco = window.FinaleCore.discoLayer(stage, { beams: 5, glints: 14, color });
    fw = window.FinaleCore.Fireworks.mount(stage);
    Cat.show();
    Cat.panic();
    Cat.moveTo(50, 20, 400);

    fw.launch({ x: 0.25, y: 0.28, color });
    fw.launch({ x: 0.75, y: 0.3, color });
    after(500, () => fw.launch({ x: 0.5, y: 0.22, color: "#f3c15f", count: 70 }));
    after(1000, () => burstPieces(el("fin-m7-burst"), 60));
    after(1000, () => {
      if (myGen !== generation) return;
      boomStamp(stage, { corner: "tl", color });
    });
    after(2200, () => myGen === generation && done());
  }

  function runComposition(myGen, done) {
    const comp = el("fin-m7-composition");
    if (!comp) return;
    comp.hidden = false;
    requestAnimationFrame(() => comp.classList.add("is-in"));

    const mediaHost = el("fin-m7-media");
    const hero = photoFrame({ role: "hero", index: 2, treatment: "full" });
    hero.classList.add("fin-m7-hero-media");
    mediaHost.appendChild(hero);
    [0, 1].forEach((i) => {
      const support = photoFrame({ role: "candid", index: i, treatment: "print" });
      support.classList.add("fin-m7-support-media", "fin-m7-support-" + i);
      mediaHost.appendChild(support);
    });

    after(4600, () => myGen === generation && done());
  }

  function runSettle(myGen, stage, done) {
    if (fw) fw.stop();
    el("fin-m7-burst").innerHTML = "";
    stage.classList.add("is-settling");
    Cat.stand();
    Cat.sit();
    // Everything about the composition fades except the one hero
    // image — the big translucent 21, the support photos, and the
    // headline all go, per "the final hero image remains."
    const big21 = el("fin-m7-big21");
    const headline = el("fin-m7-happybday");
    const supports = document.querySelectorAll(".fin-m7-support-media");
    if (big21) big21.classList.add("is-gone");
    if (headline) headline.classList.add("is-gone");
    supports.forEach((s) => s.classList.add("is-gone"));
    after(1800, () => {
      if (myGen !== generation) return;
      teardownEffects();
      done();
    });
  }

  function runLoveClose(myGen, stage, done) {
    const host = el("fin-m7-close");
    if (!host) return;
    host.hidden = false;
    stage.classList.add("is-closing");
    playSequence(
      host,
      [
        { type: "big", text: "I love you." },
        { type: "pause", ms: 1600 },
        { type: "title", text: "Happy Birthday Amirah Wale-Lasisi" },
        { type: "pause", ms: 1300 },
        { type: "line", text: "Welcome to 21, the best one yet." },
        { type: "pause", ms: 1400 },
      ],
      {
        onDone: () => {
          if (myGen !== generation) return;
          after(500, () => {
            if (myGen !== generation) return;
            boomStamp(host, { corner: "br", holdMs: 2200 });
          });
          done();
        },
      }
    );
  }

  return {
    async enter({ container }) {
      generation++;
      const myGen = generation;
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m7");
      requestAnimationFrame(() => stage.classList.add("is-in"));

      runExplosion(myGen, stage, () => {
        runComposition(myGen, () => {
          runSettle(myGen, stage, () => {
            runLoveClose(myGen, stage, () => {
              // Day 8 — and the whole site — ends here.
            });
          });
        });
      });
    },
    exit() {
      generation++;
      clearTimers();
      teardownEffects();
      Cat.reset();
      const burst = el("fin-m7-burst");
      if (burst) burst.innerHTML = "";
    },
    skip() {
      generation++;
      clearTimers();
      teardownEffects();
      Cat.reset();
    },
  };
})();
