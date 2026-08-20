/* ============================================================
   Movement V — Affirmations. The old "Them" movement (human
   caricatures, hug, approach) is gone entirely — scrapped per the
   Day 8 rebuild. This is new: the world slows down, disco goes
   gentle, the cat settles, then seven exact affirmation lines, one
   at a time, each with its own small visual response. She's asked
   to say each one aloud herself — a plain confirmation button, never
   microphone recognition.

   The seven lines are locked text — do not reword them.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m5 = (function () {
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

  const AFFIRMATIONS = [
    "I am beautiful.",
    "I am calm.",
    "I am intentional.",
    "I am allowed to grow.",
    "I deserve peace.",
    "I trust myself.",
    "I am loved.",
  ];

  function buildHTML() {
    return `
      <div class="fin-m5" id="fin-m5">
        <div class="fin-m5-world" id="fin-m5-world"></div>
        <div class="fin-m5-intro" id="fin-m5-intro"></div>
        <div class="fin-m5-stage" id="fin-m5-stage" hidden></div>
      </div>`;
  }

  function runIntro(done) {
    const host = el("fin-m5-intro");
    window.FinaleCore.playSequence(
      host,
      [
        { type: "title", text: "birthday affirmation" },
        { type: "pause", ms: 800 },
        { type: "big", text: "repeat after me." },
        { type: "pause", ms: 1100 },
      ],
      {
        onDone: () => {
          host.classList.add("is-fading");
          after(600, done);
        },
      }
    );
  }

  // Each affirmation's own visual response, layered into #fin-m5-world.
  function worldResponse(world, index) {
    world.innerHTML = "";
    if (index === 0) {
      // I am beautiful — her photos arrive around the text.
      const positions = [
        [18, 22, -6],
        [76, 18, 5],
        [22, 74, 4],
        [78, 72, -5],
      ];
      positions.forEach(([x, y, rot], i) => {
        const frame = photoFrame({ role: "hero", index: i, treatment: "print" });
        frame.classList.add("fin-m5-orbit-photo");
        frame.style.left = x + "%";
        frame.style.top = y + "%";
        frame.style.setProperty("--rot", rot + "deg");
        frame.style.setProperty("--d", 200 + i * 140 + "ms");
        world.appendChild(frame);
      });
    } else if (index === 1) {
      // I am calm — everything that's still moving slows way down.
      world.classList.add("is-calm");
    } else if (index === 2) {
      // I am intentional — a few points of light align into a row.
      for (let i = 0; i < 5; i++) {
        const dot = make("span", "fin-m5-align-dot");
        dot.style.setProperty("--i", i);
        world.appendChild(dot);
      }
      requestAnimationFrame(() => world.classList.add("is-aligned"));
    } else if (index === 3) {
      // I am allowed to grow — a soft light-structure expands.
      const bloom = make("div", "fin-m5-bloom");
      world.appendChild(bloom);
      requestAnimationFrame(() => bloom.classList.add("is-growing"));
    } else if (index === 4) {
      // I deserve peace — visual noise disappears entirely.
      world.classList.add("is-empty");
    } else if (index === 5) {
      // I trust myself — one centered light gets stronger.
      const core = make("div", "fin-m5-core");
      world.appendChild(core);
      requestAnimationFrame(() => core.classList.add("is-strong"));
    } else if (index === 6) {
      // I am loved — the whole space fills with her color. No
      // attribution beneath it — this one belongs to her alone.
      world.classList.add("is-loved");
    }
  }

  function runAffirmations(done) {
    const stage = el("fin-m5-stage");
    const world = el("fin-m5-world");
    stage.hidden = false;
    let i = 0;

    function next() {
      if (i >= AFFIRMATIONS.length) {
        stage.classList.add("is-fading");
        after(700, done);
        return;
      }
      stage.innerHTML = "";
      worldResponse(world, i);
      const line = make("p", "fin-m5-affirmation", AFFIRMATIONS[i]);
      const btn = make("button", "fin-m5-said", "i said it.");
      btn.type = "button";
      stage.append(line, btn);
      requestAnimationFrame(() => stage.classList.add("is-in"));
      stage.classList.remove("is-in");
      void stage.offsetWidth;
      stage.classList.add("is-in");

      const advance = () => {
        btn.disabled = true;
        stage.classList.remove("is-in");
        i++;
        after(500, next);
      };
      btn.addEventListener("click", advance, { once: true });
      // A generous, unhurried auto-advance if she doesn't tap — this
      // is a moment to sit in, not a form to fill out, but it still
      // shouldn't be able to stall the experience forever.
      after(6500, () => {
        if (!btn.disabled) advance();
      });
    }
    next();
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m5");
      requestAnimationFrame(() => stage.classList.add("is-in"));
      Cat.show();
      Cat.moveTo(50, 82, 800);
      after(600, () => Cat.sit());

      runIntro(() => {
        runAffirmations(() => {
          // Carousel/final smile/voice/final explosion come next —
          // not built yet in this pass. Hold here, settled, rather
          // than advancing into a movement that doesn't exist.
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
    },
  };
})();
