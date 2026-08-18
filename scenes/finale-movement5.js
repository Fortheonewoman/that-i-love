/* ============================================================
   Movement V — Them. The approach, five full silent seconds of
   just looking, the embrace, Obinna's real voice (only if supplied
   — otherwise this beat is skipped entirely, never faked), one last
   glorious-but-shorter burst, the quiet "I love you," and the
   envelope that hands her to Day 7.

   NOTE on the characters: real full-body illustrated caricatures of
   Obinna (suit) and Amirah (gown) need reference photos that don't
   exist in this repo yet — see finale-media.js's `characters` slot.
   Until they're supplied, "them" is represented honestly as two
   warm silhouettes/light-shapes, not literal figures — the beats
   (the approach, the stare, the embrace) are all fully built and
   will read the same once the real illustrations drop in; only the
   art asset itself upgrades later, no story/timing changes needed.
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

        <div class="fin-approach" id="fin-approach" hidden>
          <div class="fin-figure fin-figure-him" id="fin-figure-him"></div>
          <div class="fin-figure fin-figure-her" id="fin-figure-her"></div>
        </div>

        <div class="fin-embrace" id="fin-embrace" hidden></div>

        <div class="fin-voice" id="fin-voice" hidden></div>

        <div class="fin-m5-burst" id="fin-m5-burst"></div>

        <div class="fin-m5-final" id="fin-m5-final" hidden>
          <div class="fin-m5-final-photo" id="fin-m5-final-photo"></div>
          <p class="fin-m5-final-words" id="fin-m5-final-words">I LOVE YOU,<br/>AMIRAH.</p>
        </div>

        <div class="fin-m5-close" id="fin-m5-close" hidden></div>

        <div class="fin-m5-envelope-wrap" id="fin-m5-envelope-wrap" hidden>
          <div class="fin-envelope" id="fin-envelope">
            <p class="fin-envelope-for">AMIRAH</p>
            <p class="fin-envelope-num">7</p>
            <span class="fin-envelope-thread" aria-hidden="true"></span>
            <span class="fin-envelope-flower" aria-hidden="true">✿</span>
          </div>
          <p class="fin-m5-envelope-hint" id="fin-m5-envelope-hint">tap the envelope.</p>
        </div>

        <div class="fin-m5-handoff" id="fin-m5-handoff" hidden></div>
      </div>`;
  }

  function chosenColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--fin-chosen").trim() || "#FF6F59";
  }

  /* ---- the approach: distance closing, the cat carrying thread between them ---- */
  function runApproach(container, done) {
    const wrap = el("fin-approach");
    wrap.hidden = false;
    requestAnimationFrame(() => wrap.classList.add("is-in"));
    el("fin-figure-her").style.setProperty("--her-color", chosenColor());

    Cat.show();
    Cat.moveTo(15, 70, 600);
    after(600, () => {
      drawThread(wrap, 20, 55, 80, 55, { duration: 1800, bow: -6 }).classList.add("fin-approach-thread");
    });
    after(900, () => Cat.moveTo(85, 70, 1800));

    after(2800, () => {
      el("fin-figure-him").classList.add("is-approaching");
      el("fin-figure-her").classList.add("is-approaching");
    });

    after(5200, () => {
      wrap.classList.add("is-close");
      Cat.moveTo(50, 78, 700);
      Cat.sit();
    });

    // His suit was black. Right as they close the distance, it quietly
    // picks up her chosen color instead — the one thing in the whole
    // night that's visibly, deliberately about her.
    after(5600, () => {
      el("fin-figure-him").style.setProperty("--her-color", chosenColor());
      el("fin-figure-him").classList.add("is-matching");
    });
    after(6200, () => {
      const joke = make("p", "fin-approach-joke", "i totally didn't change my suit color because of you.");
      wrap.appendChild(joke);
      requestAnimationFrame(() => joke.classList.add("is-in"));
      after(2000, () => joke.classList.add("is-fading"));
    });

    // Five full silent seconds. No text. No cat gag. Nothing.
    after(9000, () => {
      wrap.classList.add("is-still");
    });
    after(14000, done);
  }

  /* ---- the embrace ---- */
  function runEmbrace(container, done) {
    el("fin-approach").hidden = true;
    const host = el("fin-embrace");
    host.hidden = false;
    host.style.setProperty("--her-color", chosenColor());
    host.innerHTML = `<div class="fin-embrace-glow" id="fin-embrace-glow"></div>`;
    requestAnimationFrame(() => host.classList.add("is-in"));
    Cat.stand();
    Cat.moveTo(50, 82, 900);
    after(900, () => Cat.sit());
    after(1400, () => host.classList.add("is-embracing"));
    after(2600, () => host.classList.add("is-warm"));
    after(3600, () => runVoice(container, done));
  }

  /* ---- Obinna's real voice — only if supplied, never faked, never skipped silently without reason ---- */
  function runVoice(container, done) {
    const clip = window.FinaleMedia && window.FinaleMedia.voice;
    if (!clip) return done(); // nothing to fake — the embrace just holds and moves on

    const host = el("fin-voice");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));
    const audio = new Audio(clip.src);
    audio.addEventListener("ended", () => {
      host.classList.add("is-fading");
      after(700, done);
    });
    audio.addEventListener("error", () => after(500, done));
    audio.play().catch(() => after(500, done));
  }

  /* ---- one last burst, shorter than the opening ---- */
  function runFinalBurst(container, done) {
    el("fin-embrace").hidden = true;
    const host = el("fin-m5-burst");
    const count = 34;
    for (let i = 0; i < count; i++) {
      const shapes = ["petal", "ribbon", "paper", "star"];
      const piece = make("span", `fin-piece fin-piece-${shapes[i % shapes.length]}`);
      piece.style.left = Math.random() * 100 + "%";
      piece.style.setProperty("--delay", Math.random() * 900 + "ms");
      piece.style.setProperty("--drift", Math.random() * 60 - 30 + "px");
      piece.style.setProperty("--dur", 2600 + Math.random() * 1600 + "ms");
      piece.style.setProperty("--rot", Math.random() * 480 - 240 + "deg");
      host.appendChild(piece);
      setTimeout(() => piece.remove(), 4800);
    }
    Cat.panic();
    after(3200, done);
  }

  /* ---- quiet: her, everywhere, then I LOVE YOU ---- */
  function runFinal(container, done) {
    const host = el("fin-m5-final");
    host.hidden = false;
    host.style.setProperty("--her-color", chosenColor());
    const photoHost = el("fin-m5-final-photo");
    photoHost.appendChild(photoFrame({ role: "hero", treatment: "full" }));
    requestAnimationFrame(() => host.classList.add("is-in"));
    after(3800, () => {
      host.classList.add("is-fading");
      after(700, done);
    });
  }

  function runClose(container, done) {
    el("fin-m5-final").hidden = true;
    const host = el("fin-m5-close");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));
    playSequence(
      host,
      [
        { type: "big", text: "Happy 21st, Amirah." },
        { type: "pause", ms: 800 },
        { type: "line", text: "I love you." },
        { type: "pause", ms: 1400 },
      ],
      {
        onDone: () => {
          host.classList.add("is-fading");
          after(700, done);
        },
      }
    );
  }

  /* ---- the envelope: cream paper, red thread, her color, a handoff to Day 7 ---- */
  function runEnvelope(container, done) {
    el("fin-m5-close").hidden = true;
    const wrap = el("fin-m5-envelope-wrap");
    wrap.hidden = false;
    document.getElementById("fin-envelope").style.setProperty("--her-color", chosenColor());
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
      runApproach(container, () => {
        runEmbrace(container, () => {
          runFinalBurst(container, () => {
            runFinal(container, () => {
              runClose(container, () => {
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
