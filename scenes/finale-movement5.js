/* ============================================================
   Movement V — Affirmations. The old "Them" movement (human
   caricatures, hug, approach) is gone entirely — scrapped per the
   Day 8 rebuild. This is new: the world slows down, disco goes
   gentle, the cat settles, then seven exact affirmation lines, one
   at a time, each with its own small visual response. She's asked
   to say each one aloud herself — a plain confirmation button, never
   microphone recognition.

   The seven lines are locked text — do not reword them.

   Every async continuation checks a generation token before touching
   the DOM — clearTimers() alone doesn't stop an in-flight
   playSequence (it manages its own internal timers), so a stale
   chain from a movement she's already navigated away from could
   otherwise resume later and crash trying to touch elements a fresh
   enter() has since replaced. Caught via a stress test that jumped
   between movements repeatedly (the replay/chapters UI makes that a
   real scenario, not just an adversarial one).
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

  let generation = 0;

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

  function runIntro(myGen, done) {
    const host = el("fin-m5-intro");
    if (!host) return;
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
          if (myGen !== generation) return;
          host.classList.add("is-fading");
          after(600, () => myGen === generation && done());
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

  function runAffirmations(myGen, done) {
    const stage = el("fin-m5-stage");
    const world = el("fin-m5-world");
    if (!stage || !world) return;
    stage.hidden = false;
    let i = 0;

    function next() {
      if (myGen !== generation) return;
      if (i >= AFFIRMATIONS.length) {
        stage.classList.add("is-fading");
        after(700, () => myGen === generation && done());
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
        if (myGen === generation && !btn.disabled) advance();
      });
    }
    next();
  }

  return {
    async enter({ container, go }) {
      generation++;
      const myGen = generation;
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m5");
      requestAnimationFrame(() => stage.classList.add("is-in"));
      Cat.show();
      Cat.moveTo(50, 82, 800);
      after(600, () => Cat.sit());

      runIntro(myGen, () => {
        runAffirmations(myGen, () => go(6));
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
      Cat.reset();
      Birthday.goToMovement(6);
    },
  };
})();
