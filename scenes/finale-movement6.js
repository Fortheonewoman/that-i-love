/* ============================================================
   Movement VI — The Procession. A slow, majestic carousel (the
   OPPOSITE register of Movement III's fast montage — hero-led,
   unhurried, one clear item at a time), always closing on the one
   locked final-smile clip; then "look at you.", then Obinna's real
   voice once the world has already gone calm, then the quiet close
   that hands off to whatever comes after Day 8.

   Every item is confirmed loaded (image 'load' / video 'loadeddata',
   or a capped fallback timeout so nothing can hang forever) BEFORE
   it's revealed — the current item holds a little longer rather than
   ever cutting to something half-rendered.

   This movement's own async chain (preloading, awaited holds, a real
   <audio> element) runs across many real seconds — long enough that
   she could plausibly jump to another movement (replay/chapters) and
   back before it naturally finishes. clearTimers() alone doesn't stop
   an in-flight await or a pending image/video load event, so every
   async continuation below checks a generation token first and bails
   silently if a newer enter() call has since started. Caught (and
   fixed) via a stress test that jumped in and out of this movement
   repeatedly — it used to throw trying to set .hidden on elements
   from a DOM a stale chain had already been wiped out from under.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m6 = (function () {
  "use strict";
  const { el, make, Cat, playSequence } = window.FinaleCore;

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

  function buildHTML() {
    return `
      <div class="fin-m6" id="fin-m6">
        <div class="fin-m6-stage" id="fin-m6-stage"></div>
        <div class="fin-m6-lookatyou" id="fin-m6-lookatyou" hidden></div>
        <div class="fin-m6-voice" id="fin-m6-voice" hidden></div>
        <div class="fin-m6-close" id="fin-m6-close" hidden></div>
      </div>`;
  }

  // Preloads an <img> or <video> off-DOM and resolves once it's
  // actually ready to show — never revealed a beat early. Caps at
  // 3.5s so a slow/broken asset can't stall the whole procession.
  function preload(item) {
    return new Promise((resolve) => {
      const isVideo = /\.(mp4|mov|webm)$/i.test(item.src);
      const node = document.createElement(isVideo ? "video" : "img");
      let done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve(node);
      }
      if (isVideo) {
        node.src = item.src;
        node.muted = true;
        node.playsInline = true;
        node.loop = !item.finalCarouselClip; // the final clip plays once, held, not looped away from her face
        node.addEventListener("loadeddata", finish, { once: true });
        node.addEventListener("error", finish, { once: true });
        node.load();
      } else {
        node.src = item.src;
        node.decoding = "async";
        node.addEventListener("load", finish, { once: true });
        node.addEventListener("error", finish, { once: true });
      }
      if (item.w && item.h) node.style.aspectRatio = `${item.w} / ${item.h}`;
      node.className = "fin-m6-media";
      setTimeout(finish, 3500);
    });
  }

  function buildCarouselList() {
    const photos = (window.FinaleMedia && window.FinaleMedia.photos) || [];
    const videos = (window.FinaleMedia && window.FinaleMedia.videos) || [];
    const heroPhotos = photos.filter((p) => p.role === "hero");
    const candids = photos.filter((p) => p.role === "candid").slice(0, 3);
    const heroVideo = videos.find((v) => v.role === "hero");
    const finalClip = videos.find((v) => v.finalCarouselClip);

    const list = [];
    heroPhotos.forEach((p, i) => list.push(Object.assign({ hold: 6500 + i * 400 }, p)));
    if (heroVideo) list.push(Object.assign({ hold: 6000 }, heroVideo));
    candids.forEach((p, i) => list.push(Object.assign({ hold: 5000 + i * 300 }, p)));
    // The locked final item — always last, always the real clip, held
    // the longest so her smile actually has room to land.
    if (finalClip) list.push(Object.assign({ hold: 10450, isFinal: true }, finalClip));
    return list;
  }

  async function runCarousel(stage, myGen, done) {
    const list = buildCarouselList();
    if (!list.length) return done();
    let current = null;

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const node = await preload(item);
      if (myGen !== generation) return; // this movement moved on while we were loading

      const frame = make("div", "fin-m6-frame" + (item.isFinal ? " is-final" : ""));
      frame.appendChild(node);
      stage.appendChild(frame);
      requestAnimationFrame(() => frame.classList.add("is-in"));
      if (node.tagName === "VIDEO") {
        const p = node.play();
        if (p && p.catch) p.catch(() => {});
      }
      if (current) {
        const prev = current;
        after(500, () => prev.remove());
      }
      current = frame;
      // The final item doesn't get pulled away — it just holds, and
      // runCarousel resolves while it's still on screen.
      if (item.isFinal) {
        after(item.hold, () => {
          if (myGen === generation) done();
        });
        return;
      }
      await new Promise((resolve) => after(item.hold, resolve));
      if (myGen !== generation) return;
      frame.classList.remove("is-in");
      frame.classList.add("is-leaving");
    }
    done();
  }

  function runLookAtYou(myGen, done) {
    const host = el("fin-m6-lookatyou");
    if (!host) return;
    host.hidden = false;
    const line = make("p", "fin-m6-lookatyou-line", "look at you.");
    host.appendChild(line);
    requestAnimationFrame(() => line.classList.add("is-in"));
    after(2600, () => {
      if (myGen !== generation) return;
      line.classList.remove("is-in");
      after(700, () => {
        if (myGen !== generation) return;
        host.hidden = true;
        done();
      });
    });
  }

  function runVoice(myGen, done) {
    const clip = window.FinaleMedia && window.FinaleMedia.voice;
    if (!clip) return done(); // never faked — this beat just doesn't happen without a real file
    const host = el("fin-m6-voice");
    if (!host) return;
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));

    const bar = make("div", "fin-m6-voice-bar");
    const fill = make("div", "fin-m6-voice-fill");
    bar.appendChild(fill);
    host.appendChild(bar);

    const audio = new Audio(clip.src);
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) fill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    });
    // Guarded so "ended" and "error" can never both fire done() —
    // whichever happens first wins, always exactly once.
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (myGen !== generation) return;
      host.classList.remove("is-in");
      after(900, () => {
        if (myGen !== generation) return;
        host.hidden = true;
        done();
      });
    };
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    const p = audio.play();
    if (p && p.catch) p.catch(finish);

    // If she navigates away mid-voice, the audio shouldn't keep
    // playing under whatever she looks at next.
    activeAudio = audio;
  }

  function runClose(myGen, done) {
    const host = el("fin-m6-close");
    if (!host) return;
    host.hidden = false;
    playSequence(
      host,
      [
        { type: "line", text: "Amirah." },
        { type: "pause", ms: 1100 },
        { type: "big", text: "you're 21." },
        { type: "pause", ms: 1300 },
        { type: "title", text: "happy birthday." },
        { type: "pause", ms: 1200 },
      ],
      { onDone: () => myGen === generation && done() }
    );
  }

  let activeAudio = null;
  function stopAudio() {
    if (activeAudio) {
      try {
        activeAudio.pause();
      } catch {}
      activeAudio = null;
    }
  }

  return {
    async enter({ container }) {
      generation++;
      const myGen = generation;
      container.innerHTML = buildHTML();
      const stage = container.querySelector(".fin-m6");
      requestAnimationFrame(() => stage.classList.add("is-in"));
      Cat.hide();

      const carouselStage = el("fin-m6-stage");
      runCarousel(carouselStage, myGen, () => {
        if (myGen !== generation) return;
        carouselStage.classList.add("is-settled");
        runLookAtYou(myGen, () => {
          runVoice(myGen, () => {
            runClose(myGen, () => {
              // Final celebration + love close come next — not built
              // yet in this pass. Holds here, settled.
            });
          });
        });
      });
    },
    exit() {
      generation++; // invalidates every in-flight async continuation above
      clearTimers();
      stopAudio();
      Cat.reset();
    },
    skip() {
      generation++;
      clearTimers();
      stopAudio();
      Cat.reset();
    },
  };
})();
