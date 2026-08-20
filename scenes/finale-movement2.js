/* ============================================================
   Movement II — The Explosion. The sky just cleared for her — so
   the whole website detonates: fireworks, a finite (never infinite)
   burst of petals/ribbons/confetti/stars, disco light, and a real
   montage of her — properly preloaded, held long enough to actually
   look at (including the videos, which get real time to play, not a
   flicker), pulling from the full media pool. Then, hard: everything
   gets pulled away into the 21-second montage.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m2 = (function () {
  "use strict";
  const { el, make, Cat, photoFrame, videoFrame, pickVideo } = window.FinaleCore;

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

  let generation = 0;

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
    if (!host) return;
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

  // Real preload confirmation — an item is only ever revealed once
  // its image has fired 'load' or its video has fired 'loadeddata'
  // (or a capped 2.8s fallback, so a slow asset can't stall the
  // whole party). This is what "the images don't even load" was
  // pointing at: beats used to swap on a fixed timer regardless of
  // whether the browser had actually finished decoding anything yet.
  function preloadFrame(kind, role, index) {
    return new Promise((resolve) => {
      let frame, mediaNode;
      if (kind === "video") {
        frame = videoFrame({ role, index, treatment: "full" });
        mediaNode = frame.querySelector("video");
      } else {
        frame = photoFrame({ role, index, treatment: kind === "hero" ? "full" : "print" });
        mediaNode = frame.querySelector("img");
      }
      if (!mediaNode) return resolve(frame); // empty-state fallback, nothing to wait on
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve(frame);
      };
      if (mediaNode.tagName === "VIDEO") {
        mediaNode.addEventListener("loadeddata", finish, { once: true });
      } else {
        mediaNode.addEventListener("load", finish, { once: true });
      }
      mediaNode.addEventListener("error", finish, { once: true });
      setTimeout(finish, 2800);
    });
  }

  // Pulling from the full media pool now, not a fixed handful — real
  // videos get real hold time so they're actually watched, not
  // flickered past like a seventh photo.
  const MOTIF_BEATS = [
    { kind: "hero", hold: 2600 },
    { kind: "trio", hold: 2800 },
    { kind: "candid", hold: 2400 },
    { kind: "video", role: "hero", hold: 3400 },
    { kind: "silly", hold: 2400 },
    { kind: "video", role: "candid", hold: 3200 },
    { kind: "flower", hold: 1800 },
    { kind: "hero", hold: 2600 },
    { kind: "video", role: "silly", hold: 3000 },
    { kind: "trio", hold: 2800 },
    { kind: "candid", hold: 2400 },
    { kind: "video", role: "hero", hold: 3200 },
    { kind: "silly", hold: 2400 },
    { kind: "candid", hold: 2400 },
  ];

  async function runMontage(myGen, done) {
    const stage = el("fin-m2-montage");
    if (!stage) return;
    for (let i = 0; i < MOTIF_BEATS.length; i++) {
      const beat = MOTIF_BEATS[i];
      let frame;
      if (beat.kind === "trio") {
        frame = make("div", "fin-m2-trio");
        const parts = await Promise.all([0, 1, 2].map((k) => preloadFrame("candid", "candid", i + k)));
        parts.forEach((p) => frame.appendChild(p));
      } else if (beat.kind === "flower") {
        frame = make("div", "fin-m2-flower-beat");
      } else if (beat.kind === "video") {
        if (!pickVideoSafe(beat.role)) {
          frame = await preloadFrame("candid", "candid", i);
          frame.classList.add("fin-m2-solo");
        } else {
          frame = await preloadFrame("video", beat.role, i);
          frame.classList.add("fin-m2-solo");
        }
      } else {
        frame = await preloadFrame(beat.kind, beat.kind === "hero" ? "hero" : beat.kind, i);
        frame.classList.add("fin-m2-solo");
      }
      if (myGen !== generation) return;

      stage.innerHTML = "";
      stage.appendChild(frame);
      requestAnimationFrame(() => stage.classList.add("is-in"));
      if (frame.querySelector("video")) {
        const p = frame.querySelector("video").play();
        if (p && p.catch) p.catch(() => {});
      }
      if (i % 3 === 0) fw && fw.launch({ x: 0.15 + Math.random() * 0.7, y: 0.24 + Math.random() * 0.28, count: 36 });
      if (i % 2 === 0) Cat.moveTo(10 + Math.random() * 75, 78 + Math.random() * 12, 600);

      await new Promise((resolve) => after(beat.hold, resolve));
      if (myGen !== generation) return;
      stage.classList.remove("is-in");
      await new Promise((resolve) => after(260, resolve));
      if (myGen !== generation) return;
    }
    done();
  }

  function pickVideoSafe(role) {
    try {
      return pickVideo(role);
    } catch {
      return null;
    }
  }

  return {
    async enter({ container, go }) {
      generation++;
      const myGen = generation;
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m2");
      requestAnimationFrame(() => stage.classList.add("is-in"));

      disco = window.FinaleCore.discoLayer(stage, { beams: 6, glints: 16 });
      fw = window.FinaleCore.Fireworks.mount(stage);

      burstPieces(PIECE_COUNT);
      Cat.show();
      Cat.panic();
      Cat.moveTo(50, 15, 300);

      // A first small volley right as the party opens.
      fw.launch({ x: 0.22, y: 0.28 });
      fw.launch({ x: 0.78, y: 0.32 });

      // HAPPY BIRTHDAY / AMIRAH / 21 — three separate giant beats,
      // one at a time, each settling to a small mark before the next
      // lands. Slower than a flash-cut on purpose — she should
      // actually get to read each one, not watch them blur past.
      after(400, () => {
        el("fin-m2-headline").classList.add("is-in");
        fw.launch({ x: 0.5, y: 0.22, color: "#f3c15f" });
      });
      after(2200, () => {
        el("fin-m2-headline").classList.add("is-settled");
        el("fin-m2-headline-2").classList.add("is-in");
        fw.launch({ x: 0.32, y: 0.3, color: "#ff2e88" });
        fw.launch({ x: 0.68, y: 0.26, color: "#ff2e88" });
      });
      after(4000, () => {
        el("fin-m2-headline-2").classList.add("is-settled");
        el("fin-m2-21").classList.add("is-in");
        fw.launch({ x: 0.5, y: 0.35, color: "#3d7fff", count: 70 });
      });

      after(5800, () => {
        if (myGen !== generation) return;
        el("fin-m2-21").classList.add("is-settled");
        runMontage(myGen, () => {
          if (myGen !== generation) return;
          // A second, smaller confetti + fireworks wave right as the
          // montage ends — keeps the energy from just trailing off.
          burstPieces(30);
          fw.launch({ x: 0.25, y: 0.3 });
          fw.launch({ x: 0.75, y: 0.3 });
          Cat.panic();

          // Hard pull-away: the party gets yanked, not faded politely —
          // straight into the 21-second montage, no pivot line needed.
          after(1400, () => {
            if (myGen !== generation) return;
            el("fin-m2-burst").innerHTML = "";
            el("fin-m2-headline").classList.add("is-gone");
            el("fin-m2-headline-2").classList.add("is-gone");
            el("fin-m2-21").classList.add("is-gone");
            el("fin-m2-montage").classList.add("is-gone");
            stage.classList.add("is-quiet");
            teardownEffects();
            Cat.stand();
            Cat.moveTo(50, 60, 800);
            after(700, () => myGen === generation && go(3));
          });
        });
      });
    },
    exit() {
      generation++;
      clearTimers();
      teardownEffects();
      Cat.reset();
      const burst = el("fin-m2-burst");
      if (burst) burst.innerHTML = "";
    },
    skip() {
      generation++;
      clearTimers();
      teardownEffects();
      Cat.reset();
      Birthday.goToMovement(3);
    },
  };
})();
