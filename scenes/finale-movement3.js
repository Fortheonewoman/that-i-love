/* ============================================================
   Movement III — The Story. The party gets pulled away and the
   real thing starts: the week's own visual vocabulary quietly
   returns, a few real, already-established pieces of who she is
   show up in new staging (not a Day 5 rerun), the site finally asks
   the one question it's never asked her, and — without announcing
   it — starts assembling I LOVE YOU out of everything it's already
   shown her.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m3 = (function () {
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

  const SWATCHES = [
    ["cherry", "#C0142B"],
    ["coral", "#FF6F59"],
    ["hot pink", "#E63E8C"],
    ["blush", "#F0B8C6"],
    ["cobalt", "#3B5BFF"],
    ["butter", "#F3C15F"],
    ["green", "#2F9E5C"],
    ["violet", "#6C63FF"],
  ];

  function buildHTML() {
    return `
      <div class="fin-m3" id="fin-m3">
        <div class="fin-grain" aria-hidden="true"></div>

        <div class="fin-m3-callbacks" id="fin-m3-callbacks"></div>
        <div class="fin-m3-personality" id="fin-m3-personality"></div>

        <div class="fin-m3-color" id="fin-m3-color" hidden>
          <div class="fin-m3-color-talk" id="fin-m3-color-talk"></div>
          <div class="fin-m3-swatches" id="fin-m3-swatches" hidden></div>
          <p class="fin-m3-color-after" id="fin-m3-color-after" hidden></p>
        </div>

        <div class="fin-love-stage" id="fin-love-stage" hidden></div>
      </div>`;
  }

  /* ---- the week's own vocabulary, quietly returning ---- */
  function worldRemembers(container, done) {
    const host = el("fin-m3-callbacks");
    host.hidden = false;
    Cat.show();
    Cat.moveTo(30, 58, 900);
    after(400, () => {
      Cat.paw();
      drawThread(host, 15, 60, 85, 55, { duration: 1500, bow: 4 }).classList.add("fin-callback-thread");
    });
    after(1700, () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "fin-thread fin-callback-blueprint");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      host.appendChild(svg);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M 20 30 L 55 30 L 55 45 L 78 45");
      path.setAttribute("class", "fin-blueprint-path");
      svg.appendChild(path);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len + " " + len;
      path.style.strokeDashoffset = len;
      requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1.1s var(--fin-ease)";
        path.style.strokeDashoffset = "0";
      });
    });
    after(2700, () => {
      const star = make("span", "fin-callback-star", "✦");
      star.style.left = "68%";
      star.style.top = "24%";
      host.appendChild(star);
      requestAnimationFrame(() => star.classList.add("is-in"));
      after(1500, () => star.classList.add("is-fading"));
    });
    after(3600, () => {
      const stamp = make("p", "fin-callback-stamp", "SUBJECT: AMIRAH");
      host.appendChild(stamp);
      requestAnimationFrame(() => stamp.classList.add("is-in"));
      after(1100, () => stamp.classList.add("is-fading"));
    });
    after(4400, () => container.querySelector(".fin-m3").classList.add("is-colored"));
    after(5600, () => {
      host.classList.add("is-fading");
      after(600, () => {
        host.hidden = true;
        done();
      });
    });
  }

  /* ---- a few real, already-established pieces of her — new staging ---- */
  function runPersonality(container, done) {
    const host = el("fin-m3-personality");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));

    const beats = [
      { label: "“sha sha.”", line: "still contaminated. still saying it." },
      { label: "the weird cats", line: "apparently that's permanent now too." },
      // The real thing this line is talking about — hers, from a real
      // job site, not a stand-in. Held a little longer than the other
      // beats so the clip actually has a moment to move.
      { label: "the engineering brain", line: "still needs to know why before it accepts that it does.", video: true, hold: 2800 },
      { label: "the stubbornness", line: "still undefeated." },
    ];
    let i = 0;
    function next() {
      if (i >= beats.length) {
        after(600, () => {
          host.classList.add("is-fading");
          after(700, () => {
            host.hidden = true;
            done();
          });
        });
        return;
      }
      host.innerHTML = "";
      if (beats[i].video && window.FinaleCore.pickVideo("candid")) {
        host.appendChild(window.FinaleCore.videoFrame({ role: "candid", treatment: "circle" }));
      }
      const label = make("p", "fin-personality-label", beats[i].label);
      const line = make("p", "fin-personality-line", beats[i].line);
      host.append(label, line);
      requestAnimationFrame(() => host.classList.add("is-word-in"));
      host.classList.remove("is-word-in");
      void host.offsetWidth;
      host.classList.add("is-word-in");
      i++;
      after(beats[i - 1].hold || 1600, next);
    }
    next();
  }

  /* ---- four years, and the site finally asks ---- */
  function runFavoriteColor(container, done) {
    const wrap = el("fin-m3-color");
    wrap.hidden = false;
    requestAnimationFrame(() => wrap.classList.add("is-in"));
    const talk = el("fin-m3-color-talk");

    playSequence(
      talk,
      [
        { type: "line", text: "Four years." },
        { type: "pause", ms: 900 },
        { type: "line", text: "And somehow I still don't know your favorite color." },
        { type: "pause", ms: 900 },
        { type: "big", text: "We're fixing that right now." },
        { type: "pause", ms: 900 },
      ],
      {
        onDone: () => {
          talk.classList.add("is-fading");
          after(600, showSwatches);
        },
      }
    );

    function showSwatches() {
      talk.hidden = true;
      const grid = el("fin-m3-swatches");
      grid.hidden = false;
      grid.innerHTML =
        SWATCHES.map(([name, hex]) => `<button type="button" class="fin-swatch" data-hex="${hex}" style="--sw:${hex}"><span class="fin-swatch-name">${name}</span></button>`).join("") +
        `<button type="button" class="fin-swatch fin-swatch-other" id="fin-swatch-other"><span class="fin-swatch-name">something else</span></button>` +
        `<input type="color" id="fin-color-input" class="fin-color-input" aria-label="pick a color" />`;
      requestAnimationFrame(() => grid.classList.add("is-in"));

      function choose(hex) {
        document.documentElement.style.setProperty("--fin-chosen", hex);
        try {
          localStorage.setItem("amirachi:favoriteColor", hex);
        } catch {}
        Birthday.ctx.favoriteColor = hex;
        grid.classList.add("is-fading");
        after(600, () => {
          grid.hidden = true;
          const after1 = el("fin-m3-color-after");
          after1.hidden = false;
          after1.style.color = hex;
          playSequence(
            after1,
            [
              { type: "line", text: "finally." },
              { type: "custom", run: (c, next) => {
                  const stamp = make("div", "fin-stamp-recorded", "RECORDED AFTER 4 YEARS");
                  c.appendChild(stamp);
                  requestAnimationFrame(() => stamp.classList.add("is-in"));
                  after(1300, next);
                } },
              { type: "pause", ms: 700 },
            ],
            {
              onDone: () => {
                after1.classList.add("is-fading");
                wrap.classList.add("is-fading");
                after(700, () => {
                  wrap.hidden = true;
                  done();
                });
              },
            }
          );
        });
      }

      grid.querySelectorAll(".fin-swatch:not(.fin-swatch-other)").forEach((btn) => {
        btn.addEventListener("click", () => choose(btn.dataset.hex), { once: true });
      });
      el("fin-swatch-other").addEventListener("click", () => {
        el("fin-color-input").click();
      });
      el("fin-color-input").addEventListener(
        "input",
        (e) => choose(e.target.value),
        { once: true }
      );
    }
  }

  /* ---- I LOVE YOU, quietly assembled from everything already shown ---- */
  function runLoveAssembly(container, done) {
    const stage = el("fin-love-stage");
    stage.hidden = false;
    requestAnimationFrame(() => stage.classList.add("is-in"));

    const word1 = make("p", "fin-love-word", "I");
    stage.appendChild(word1);
    requestAnimationFrame(() => word1.classList.add("is-in"));
    after(1400, () => {
      const word2 = make("p", "fin-love-word", "LOVE");
      word2.id = "fin-love-word2";
      stage.appendChild(word2);
      requestAnimationFrame(() => word2.classList.add("is-in"));
    });
    after(2900, () => {
      const word3 = make("p", "fin-love-word", "YOU");
      stage.appendChild(word3);
      requestAnimationFrame(() => word3.classList.add("is-in"));
    });
    after(4400, () => {
      Cat.show();
      Cat.moveTo(50, 46, 1000);
      const w2 = document.getElementById("fin-love-word2");
      if (w2) w2.classList.add("is-knocked");
    });
    after(5500, () => {
      const sorry = make("p", "fin-love-sorry", "sorry.");
      stage.appendChild(sorry);
      requestAnimationFrame(() => sorry.classList.add("is-in"));
      const w2 = document.getElementById("fin-love-word2");
      if (w2) w2.classList.remove("is-knocked");
    });
    // Still doesn't end here — the story keeps going.
    after(7200, () => {
      stage.classList.add("is-fading");
      after(700, done);
    });
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      worldRemembers(container, () => {
        runPersonality(container, () => {
          runFavoriteColor(container, () => {
            runLoveAssembly(container, () => go(4));
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
      Birthday.goToMovement(4);
    },
  };
})();
