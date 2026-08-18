/* ============================================================
   Movement V — After. Everything the finale spent four movements
   building finally gets out of its own way. A held silence, small
   sincere lines, one composed "I LOVE YOU, AMIRAH" screen, then the
   envelope that hands her — quietly, physically — to Day 7.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m5 = (function () {
  "use strict";
  const { el, make, Cat, photoFrame, drawThread, playSequence } = window.FinaleCore;

  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function buildHTML() {
    return `
      <div class="fin-m5" id="fin-m5">
        <div class="fin-grain" aria-hidden="true"></div>

        <div class="fin-m5-freeze" id="fin-m5-freeze"></div>

        <div class="fin-m5-talk" id="fin-m5-talk" hidden></div>

        <div class="fin-m5-recap" id="fin-m5-recap" hidden></div>

        <div class="fin-m5-final" id="fin-m5-final" hidden>
          <div class="fin-m5-final-photo" id="fin-m5-final-photo"></div>
          <p class="fin-m5-final-words" id="fin-m5-final-words">I LOVE YOU,<br/>AMIRAH.</p>
        </div>

        <div class="fin-m5-intimate" id="fin-m5-intimate" hidden></div>

        <div class="fin-m5-envelope-wrap" id="fin-m5-envelope-wrap" hidden>
          <div class="fin-envelope" id="fin-envelope">
            <p class="fin-envelope-for">FOR AMIRAH</p>
            <p class="fin-envelope-num">7</p>
            <span class="fin-envelope-thread" aria-hidden="true"></span>
          </div>
          <p class="fin-m5-envelope-hint" id="fin-m5-envelope-hint">tap the envelope.</p>
        </div>

        <div class="fin-m5-handoff" id="fin-m5-handoff" hidden></div>
      </div>`;
  }

  /* ---- five full seconds of nothing but her ---- */
  function runFreeze(container, done) {
    const host = el("fin-m5-freeze");
    const frame = photoFrame({ role: "hero", treatment: "full" });
    host.appendChild(frame);
    requestAnimationFrame(() => host.classList.add("is-in"));
    after(5200, () => {
      host.classList.add("is-fading");
      after(700, done);
    });
  }

  function runTalk(container, done) {
    // fin-m5-freeze holds a near-viewport-width photo frame — this
    // container is a flex row, so an opacity-only fade would leave
    // it occupying full layout width and silently shove every later
    // stage sideways instead of centering it. Must be hard-hidden,
    // not just faded.
    el("fin-m5-freeze").hidden = true;
    const host = el("fin-m5-talk");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));
    playSequence(
      host,
      [
        { type: "line", text: "hi." },
        { type: "pause", ms: 900 },
        { type: "line", text: "I know this entire thing has been doing too much." },
        {
          type: "custom",
          run(c, next) {
            Cat.show();
            Cat.moveTo(70, 60, 700);
            after(600, () => Cat.lookOffscreen());
            after(900, next);
          },
        },
        { type: "line", text: "I blame the cat." },
        { type: "pause", ms: 800 },
        { type: "line", text: "but I think I was trying to find enough ways to say one thing." },
        { type: "pause", ms: 1200 },
      ],
      {
        onDone: () => {
          host.classList.add("is-fading");
          Cat.stopLooking();
          Cat.hide();
          after(700, done);
        },
      }
    );
  }

  /* ---- a quick flash of the week's small things, then "you." / "I love you." ---- */
  function runRecap(container, done) {
    // Same reasoning as fin-m5-freeze above — runTalk's container
    // must not linger, unhidden, as a same-row flex sibling.
    el("fin-m5-talk").hidden = true;
    const host = el("fin-m5-recap");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));

    const beats = ["a laugh.", "a photograph.", "a red thread.", "a star.", "a piece of paper with her name on it.", "amirah."];
    let i = 0;
    function next() {
      if (i >= beats.length) {
        after(500, () => {
          host.classList.add("is-fading");
          after(600, finalLine);
        });
        return;
      }
      host.textContent = beats[i];
      host.classList.remove("is-word-in");
      void host.offsetWidth;
      host.classList.add("is-word-in");
      i++;
      after(520, next);
    }
    next();

    function finalLine() {
      host.hidden = true;
      const talk = el("fin-m5-talk");
      talk.hidden = false;
      talk.innerHTML = "";
      talk.classList.remove("is-fading");
      requestAnimationFrame(() => talk.classList.add("is-in"));
      playSequence(
        talk,
        [
          { type: "line", text: "you." },
          { type: "pause", ms: 700 },
          { type: "big", text: "I love you." },
          { type: "pause", ms: 1400 },
        ],
        {
          onDone: () => {
            talk.classList.add("is-fading");
            after(700, done);
          },
        }
      );
    }
  }

  /* ---- the composed I LOVE YOU, AMIRAH screen ---- */
  function runFinal(container, done) {
    el("fin-m5-talk").hidden = true;
    const host = el("fin-m5-final");
    host.hidden = false;
    const photoHost = el("fin-m5-final-photo");
    photoHost.appendChild(photoFrame({ role: "hero", treatment: "full" }));
    requestAnimationFrame(() => host.classList.add("is-in"));
    after(3600, () => {
      host.classList.add("is-fading");
      after(700, done);
    });
  }

  /* ---- increasingly intimate lines ---- */
  function runIntimate(container, done) {
    el("fin-m5-final").hidden = true;
    const host = el("fin-m5-intimate");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));
    playSequence(
      host,
      [
        { type: "line", text: "Not the website version of you." },
        { type: "pause", ms: 600 },
        { type: "line", text: "Not the birthday version." },
        { type: "pause", ms: 700 },
        { type: "big", text: "You." },
        { type: "pause", ms: 900 },
        { type: "line", text: "The loud one." },
        { type: "line", text: "The soft one." },
        { type: "line", text: "The stubborn one." },
        { type: "line", text: "The one still becoming." },
        { type: "line", text: "The one I keep noticing." },
        { type: "pause", ms: 900 },
        { type: "big", text: "I love you." },
        { type: "pause", ms: 1600 },
        { type: "line", text: "And tomorrow — or technically now — I still have something to give you." },
        { type: "pause", ms: 1200 },
      ],
      {
        onDone: () => {
          host.classList.add("is-fading");
          after(700, done);
        },
      }
    );
  }

  /* ---- the envelope: cream paper, red thread, a handoff to Day 7 ---- */
  function runEnvelope(container, done) {
    el("fin-m5-intimate").hidden = true;
    const wrap = el("fin-m5-envelope-wrap");
    wrap.hidden = false;
    requestAnimationFrame(() => wrap.classList.add("is-in"));

    Cat.show();
    Cat.moveTo(58, 68, 800);
    after(700, () => Cat.lookOffscreen());
    after(1400, () => {
      Cat.stopLooking();
      Cat.moveTo(48, 62, 700);
    });
    after(2200, () => {
      Cat.paw();
      const hint = el("fin-m5-envelope-hint");
      hint.textContent = "fine.";
      hint.classList.add("is-fine");
      Cat.moveTo(30, 78, 1000);
    });

    let opened = false;
    el("fin-envelope").addEventListener(
      "click",
      () => {
        if (opened) return;
        opened = true;
        el("fin-envelope").classList.add("is-open");
        el("fin-m5-envelope-hint").classList.add("is-fading");
        after(900, done);
      },
      { once: true }
    );
  }

  function runHandoff(container, onDone) {
    el("fin-m5-envelope-wrap").hidden = true;
    const host = el("fin-m5-handoff");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));
    playSequence(
      host,
      [{ type: "big", text: "You really thought I'd go your birthday without writing for you, dude?" }, { type: "pause", ms: 1800 }],
      { onDone }
    );
  }

  return {
    async enter({ container, go, onDone }) {
      container.innerHTML = buildHTML();
      runFreeze(container, () => {
        runTalk(container, () => {
          runRecap(container, () => {
            runFinal(container, () => {
              runIntimate(container, () => {
                runEnvelope(container, () => {
                  runHandoff(container, onDone);
                });
              });
            });
          });
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
