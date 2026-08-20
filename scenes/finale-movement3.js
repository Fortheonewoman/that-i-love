/* ============================================================
   Movement III — 21 Seconds of Amirah. The one deliberately fast,
   chaotic part of Day 8: hard cuts, quick photos and clips, a couple
   of huge word-beats, fireworks still popping, disco still turning.
   Exactly 21 seconds — NOT the majestic carousel (that's later, and
   is the opposite of this on purpose: slow, hero-led, unhurried).

   Beat durations below are relative weights, not literal ms — scale()
   normalizes them to sum to exactly TARGET_MS so this stays "21
   seconds" even if beats are added/removed/reordered later.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m3 = (function () {
  "use strict";
  const { el, make, Cat, photoFrame, videoFrame, pickVideo } = window.FinaleCore;

  let timers = [];
  let fw = null;
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function teardown() {
    if (fw) {
      fw.destroy();
      fw = null;
    }
  }

  const TARGET_MS = 21000;

  // type: "photo" | "video" | "trio" | "word"
  const RAW_BEATS = [
    { type: "word", text: "21.", w: 900, big: true },
    { type: "photo", role: "hero", w: 750 },
    { type: "photo", role: "candid", w: 650 },
    { type: "photo", role: "silly", w: 650 },
    { type: "video", role: "hero", w: 1400 },
    { type: "photo", role: "candid", w: 650 },
    { type: "word", text: "AMIRAH.", w: 900 },
    { type: "photo", role: "hero", w: 750 },
    { type: "trio", w: 900 },
    { type: "photo", role: "silly", w: 650 },
    { type: "video", role: "candid", w: 1400 },
    { type: "photo", role: "candid", w: 650 },
    { type: "photo", role: "hero", w: 750 },
    { type: "photo", role: "silly", w: 650 },
    { type: "photo", role: "candid", w: 650 },
    { type: "photo", role: "hero", w: 750 },
    { type: "photo", role: "candid", w: 650 },
    { type: "photo", role: "silly", w: 650 },
    { type: "trio", w: 900 },
    { type: "photo", role: "candid", w: 650 },
    { type: "photo", role: "hero", w: 650 },
    { type: "photo", role: "candid", w: 650 },
    { type: "photo", role: "silly", w: 650 },
    { type: "word", text: "21.", w: 1500, big: true },
  ];

  function scaledBeats() {
    const total = RAW_BEATS.reduce((s, b) => s + b.w, 0);
    const factor = TARGET_MS / total;
    // Round every beat, then dump any rounding drift onto the last
    // beat so the sequence sums to exactly TARGET_MS, not "close to."
    let used = 0;
    const beats = RAW_BEATS.map((b, i) => {
      const ms = i === RAW_BEATS.length - 1 ? 0 : Math.round(b.w * factor);
      used += ms;
      return Object.assign({}, b, { ms });
    });
    beats[beats.length - 1].ms = TARGET_MS - used;
    return beats;
  }

  function buildHTML() {
    return `
      <div class="fin-m3" id="fin-m3">
        <div class="fin-m3-stage" id="fin-m3-stage"></div>
      </div>`;
  }

  function renderBeat(stage, beat, index) {
    stage.innerHTML = "";
    const item = make("div", "fin-m3-item");
    if (beat.type === "word") {
      const w = make("p", "fin-m3-word" + (beat.big ? " is-color" : ""), beat.text);
      item.appendChild(w);
    } else if (beat.type === "trio") {
      const wrap = make("div", "fin-m2-trio");
      for (let k = 0; k < 3; k++) wrap.appendChild(photoFrame({ role: "candid", index: index + k, treatment: "print" }));
      item.appendChild(wrap);
    } else if (beat.type === "video" && pickVideo(beat.role)) {
      item.appendChild(videoFrame({ role: beat.role, index, treatment: "full" }));
    } else {
      item.appendChild(photoFrame({ role: beat.type === "video" ? "candid" : beat.role, index, treatment: "full" }));
    }
    stage.appendChild(item);
    requestAnimationFrame(() => item.classList.add("is-in"));
    return item;
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      const stage = el("fin-m3-stage");
      const wrap = el("fin-m3");
      fw = window.FinaleCore.Fireworks.mount(wrap);
      Cat.hide();

      const beats = scaledBeats();
      let i = 0;
      function next() {
        if (i >= beats.length) {
          wrap.classList.add("is-ending");
          teardown();
          after(700, () => go(4));
          return;
        }
        const beat = beats[i];
        renderBeat(stage, beat, i);
        if (i % 4 === 0) fw.launch({ x: 0.15 + Math.random() * 0.7, y: 0.25 + Math.random() * 0.3, count: 40 });
        i++;
        after(beat.ms, next);
      }
      next();
    },
    exit() {
      clearTimers();
      teardown();
      Cat.reset();
    },
    skip() {
      clearTimers();
      teardown();
      Cat.reset();
      Birthday.goToMovement(4);
    },
  };
})();
