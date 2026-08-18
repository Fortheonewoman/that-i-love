/* ============================================================
   Movement II — The World Remembers Her. A curated montage (real
   photos/video when supplied, a graceful motif rhythm when not),
   her laugh getting its own silent moment, a small illustrated
   Obinna, and — quietly, almost unnoticed — five letters hidden
   inside the composition that later assemble into I LOVE YOU.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m2 = (function () {
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
      <div class="fin-m2" id="fin-m2">
        <div class="fin-grain" aria-hidden="true"></div>
        <div class="fin-m2-montage" id="fin-m2-montage"></div>

        <div class="fin-m2-obinna" id="fin-m2-obinna" hidden>
          <img class="fin-m2-obinna-img" id="fin-m2-obinna-img" alt="" />
          <div class="fin-m2-obinna-fallback" id="fin-m2-obinna-fallback"></div>
        </div>

        <div class="fin-m2-merge" id="fin-m2-merge" hidden></div>

        <div class="fin-love-stage" id="fin-love-stage" hidden></div>
      </div>`;
  }

  /* ---- the choreographed montage: photos, or a motif rhythm ---- */
  const MOTIF_BEATS = ["portrait", "trio", "candid", "hero", "paper", "detail", "flower", "portrait"];

  function runMontage(container, done) {
    const stage = el("fin-m2-montage");
    let i = 0;
    const total = 8;

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
      } else if (kind === "paper") {
        stage.appendChild(make("div", "fin-m2-paper-beat"));
      } else {
        const frame = photoFrame({ role: kind === "hero" ? "hero" : "candid", index: i, treatment: kind === "hero" ? "full" : "print" });
        frame.classList.add("fin-m2-solo");
        stage.appendChild(frame);
      }
      requestAnimationFrame(() => stage.classList.add("is-in"));

      // The cat drops in on roughly every third beat — living inside
      // the montage, not narrating it.
      if (i % 3 === 1) {
        Cat.moveTo(15 + Math.random() * 70, 70 + Math.random() * 15, 700);
      }

      i++;
      const t = setTimeout(() => {
        stage.classList.remove("is-in");
        setTimeout(beat, 260);
      }, 780);
      timers.push(t);
    }
    beat();
  }

  /* ---- her laugh — only if a real clip is marked for it ---- */
  function runLaugh(container, done) {
    const laugh = (window.FinaleMedia.videos || []).find((v) => v.role === "laugh");
    if (!laugh) return done(); // nothing to skip past — the montage just continues

    const stage = el("fin-m2-montage");
    stage.innerHTML = "";
    const prompt = make("div", "fin-laugh-prompt", `<span class="fin-laugh-env">✉</span>`);
    stage.appendChild(prompt);
    requestAnimationFrame(() => stage.classList.add("is-in"));

    prompt.addEventListener(
      "click",
      () => {
        stage.innerHTML = "";
        const video = make("video", "fin-laugh-video");
        video.src = laugh.src;
        if (laugh.poster) video.poster = laugh.poster;
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        stage.appendChild(video);
        // Sound eases in — she's already interacted, so this is a
        // real user gesture unlocking audio, not an autoplay guess.
        setTimeout(() => {
          video.muted = false;
          video.volume = 0;
          const fade = setInterval(() => {
            video.volume = Math.min(1, video.volume + 0.1);
            if (video.volume >= 1) clearInterval(fade);
          }, 80);
        }, 300);
        video.addEventListener("ended", () => {
          stage.innerHTML = "";
          const lines = make("div", "fin-laugh-lines");
          stage.appendChild(lines);
          playSequence(lines, [
            { type: "line", text: "yeah." },
            { type: "pause", ms: 500 },
            { type: "line", text: "that." },
            { type: "pause", ms: 1200 },
          ], { onDone: done });
        });
      },
      { once: true }
    );
  }

  /* ---- a small, real, illustrated Obinna — head cutout only, no cartoon body ---- */
  function runObinna(container, done) {
    const wrap = el("fin-m2-obinna");
    const img = el("fin-m2-obinna-img");
    wrap.hidden = false;
    img.src = "img/heads/obinna-delighted.png";
    img.addEventListener("error", () => wrap.classList.add("is-fallback"), { once: true });
    requestAnimationFrame(() => wrap.classList.add("is-in"));

    Cat.moveTo(38, 55, 800);
    after(700, () => Cat.lookOffscreen());
    after(1600, () => Cat.stopLooking());
    after(1700, () => Cat.moveTo(62, 55, 1200));
    after(3100, () => done());
  }

  /* ---- the abstract merge — no literal hug ---- */
  function runMerge(container, done) {
    const merge = el("fin-m2-merge");
    merge.hidden = false;
    merge.innerHTML = `<span class="fin-merge-light fin-merge-a"></span><span class="fin-merge-light fin-merge-b"></span>`;
    requestAnimationFrame(() => merge.classList.add("is-in"));
    const thread = drawThread(merge, 22, 50, 78, 50, { duration: 1200 });
    Cat.moveTo(45, 50, 1400);
    after(1400, () => {
      thread.classList.add("is-shrinking");
      merge.classList.add("is-merging");
    });
    after(2600, () => merge.classList.add("is-merged"));
    after(3600, done);
  }

  /* ---- I LOVE YOU, assembled from what was already there ---- */
  function runLoveAssembly(container, done) {
    el("fin-m2-obinna").hidden = true;
    el("fin-m2-merge").hidden = true;
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

    // The cat walks straight through LOVE, knocks it crooked, apologises.
    after(4400, () => {
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
    after(7500, done);
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      Cat.show();
      runMontage(container, () => {
        runLaugh(container, () => {
          runObinna(container, () => {
            runMerge(container, () => {
              runLoveAssembly(container, () => go(3));
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
      Birthday.goToMovement(3);
    },
  };
})();
