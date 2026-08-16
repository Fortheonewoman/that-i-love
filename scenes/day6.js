/* ============================================================
   Day 6 — "Please Don't Become Easier To Explain". Not the love
   letter (that's Day 7), not another archive (that was Day 5).
   This one is a warm room being packed for her 21st — and slowly
   refusing to pack her down into something neat. Every "KEEP." is
   sincere; the pivot ("KEEP EVERYTHING." → crossed out → "CHANGE.")
   is the whole point: grow, just don't disappear doing it.

   Stages: 0 opening → 1 the packing rack (12 KEEP items) → 2 the
   catch (KEEP EVERYTHING → CHANGE) → 3 let her change → 4 keep
   wanting things that aren't me → 5 the hair → 6 keep your soul →
   7 twenty-one tomorrow → 8 the final room.
   ============================================================ */
window.Day6Scene = (function () {
  "use strict";

  function el(id) {
    return document.getElementById(id);
  }
  function make(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  let root, onDoneCb;
  let sceneEl;
  let stage = 0;
  const openedItems = new Set();
  let packStrainShown = false;
  let advanceSequence = null;

  function setStage(n) {
    stage = n;
    if (sceneEl) sceneEl.dataset.stage = String(n);
  }

  // A bare requestAnimationFrame gating a whole stage's visibility is
  // fragile — if that one frame gets dropped (backgrounded tab, a heavy
  // burst of DOM work right when it's scheduled), the stage silently
  // stays at opacity:0 forever with correct content underneath and no
  // error. A redundant setTimeout fallback costs nothing (adding an
  // already-present class is a no-op) and guarantees it shows regardless.
  function revealIn(el) {
    requestAnimationFrame(() => el.classList.add("is-in"));
    setTimeout(() => el.classList.add("is-in"), 80);
  }

  /* ------------------------------------------------------------
     Same small sequencer pattern as Day 5 — plays steps one at a
     time at a readable pace, but a tap anywhere in the active
     container skips the current wait.
     ------------------------------------------------------------ */
  function playSequence(container, steps, opts) {
    opts = opts || {};
    let cancelled = false;
    let i = 0;

    function stepEl(step) {
      if (step.type === "title") return make("p", "d6-seq-title", step.text);
      if (step.type === "big") return make("p", "d6-seq-big", step.text);
      if (step.type === "line") return make("p", "d6-seq-line", step.text);
      if (step.type === "small") return make("p", "d6-seq-small", step.text);
      if (step.type === "stamp") return make("div", "d6-stamp" + (step.warn ? " d6-stamp-warn" : ""), step.text);
      return null;
    }

    function runNext() {
      if (cancelled) return;
      if (i >= steps.length) {
        if (opts.onDone) opts.onDone();
        return;
      }
      const step = steps[i++];

      if (step.type === "pause") {
        advanceSequence = () => {
          advanceSequence = null;
          runNext();
        };
        setTimeout(() => {
          if (advanceSequence) advanceSequence();
        }, step.ms || 800);
        return;
      }
      if (step.type === "custom") {
        step.run(container, () => {
          if (!cancelled) runNext();
        });
        return;
      }

      const e = stepEl(step);
      if (e) {
        container.appendChild(e);
        requestAnimationFrame(() => e.classList.add("is-in"));
      }
      const delay = step.ms || (step.type === "big" ? 2000 : step.type === "stamp" ? 1400 : 1600);
      advanceSequence = () => {
        advanceSequence = null;
        runNext();
      };
      setTimeout(() => {
        if (advanceSequence) advanceSequence();
      }, delay);
    }

    runNext();
    return { cancel: () => (cancelled = true) };
  }

  function lines(...arr) {
    return arr.map((t) => ({ type: "line", text: t }));
  }

  /* ============================================================
     STAGE 0 — opening
     ============================================================ */
  function runOpening() {
    setTimeout(() => el("d6-open-title").classList.add("is-in"), 700);
    setTimeout(() => el("d6-open-sub").classList.add("is-in"), 1900);
    const lineHost = el("d6-open-lines");
    const seq = [
      { type: "pause", ms: 1100 },
      { type: "line", text: "You're about to be 21." },
      { type: "pause", ms: 700 },
      { type: "line", text: "Everybody talks about the person you're becoming." },
      { type: "pause", ms: 700 },
      { type: "line", text: "I've been thinking about the things I hope you don't become without." },
      { type: "pause", ms: 900 },
    ];
    setTimeout(() => {
      playSequence(lineHost, seq, {
        onDone: () => {
          el("d6-continue").hidden = false;
          requestAnimationFrame(() => requestAnimationFrame(() => el("d6-continue").classList.add("is-in")));
        },
      });
    }, 3000);
  }

  /* ============================================================
     THE 12 "KEEP" ITEMS
     ============================================================ */
  const ANIMS = ["swing", "fold", "stamp", "pull", "untie", "drop"];

  const ITEMS = [
    { label: "THE VIDEO FACE", custom: renderVideoFace },
    { label: "“SHA SHA”", custom: renderShaSha },
    { label: "STEALING MY LINGO", custom: renderLingoTheft },
    { label: "THE MUSIC", custom: renderMusic },
    { label: "THE WEIRD CATS", custom: renderWeirdCats },
    { label: "CARGO PANTS", custom: renderCargoPants },
    { label: "PROBLEM-SOLVING", custom: renderProblemSolving },
    { label: "THE DREAM CAR", custom: renderDreamCar },
    { label: "THE COLOR", custom: renderColor },
    { label: "THE SOFTNESS", custom: renderSoftness },
    { label: "BEING AN ENGINEER", custom: renderEngineer },
    { label: "BEING DIFFICULT", custom: renderDifficult },
  ];

  function renderVideoFace(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP THE VIDEO FACE</p>
      <div class="d6-face" id="d6-face-anim"><div class="d6-face-head"><span class="d6-face-mouth"></span></div></div>
      <p class="d6-item-line">Keep that little head movement followed by the pout when you make videos.</p>
      <p class="d6-item-note">yes, I notice it.</p>
      <div class="d6-stamp d6-stamp-in">KEEP.</div>
    `;
    const face = container.querySelector("#d6-face-anim");
    function loop() {
      face.classList.add("is-tilt");
      setTimeout(() => {
        face.classList.remove("is-tilt");
        face.classList.add("is-pause");
        setTimeout(() => {
          face.classList.remove("is-pause");
          face.classList.add("is-pout");
          setTimeout(() => {
            face.classList.remove("is-pout");
            setTimeout(loop, 1300);
          }, 650);
        }, 380);
      }, 480);
    }
    loop();
  }

  function renderShaSha(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP “SHA SHA”</p>
      <div class="d6-shasha-stage" id="d6-shasha-stage"></div>
      <p class="d6-item-line">Keep saying “sha sha” until the English language formally gives up.</p>
      <p class="d6-item-line d6-item-line-delay">You've influenced me. I say it now.</p>
      <p class="d6-item-note">LINGUISTIC DAMAGE: PERMANENT</p>
      <div class="d6-stamp d6-stamp-in">KEEP.</div>
    `;
    const stage = container.querySelector("#d6-shasha-stage");
    const counts = [1, 3, 7];
    counts.forEach((n, i) => {
      setTimeout(() => {
        stage.innerHTML = "";
        for (let k = 0; k < n; k++) {
          const w = make("span", "d6-shasha-word", "sha sha");
          w.style.setProperty("--r", Math.random() * 16 - 8 + "deg");
          w.style.setProperty("--d", i * 40 + "ms");
          stage.appendChild(w);
        }
      }, i * 500);
    });
  }

  function renderLingoTheft(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP STEALING MY LINGO</p>
      <div class="d6-lingo-board">
        <div class="d6-lingo-side"><p class="d6-lingo-name">OBINNA</p><div class="d6-lingo-words" id="d6-lingo-from"></div></div>
        <div class="d6-lingo-cat">🐈</div>
        <div class="d6-lingo-side"><p class="d6-lingo-name">AMIRAH</p><div class="d6-lingo-words" id="d6-lingo-to"></div></div>
      </div>
      <p class="d6-item-line">Keep stealing my lingo.</p>
      <p class="d6-item-line d6-item-line-delay">You already say half of it like you invented it.</p>
      <p class="d6-item-note">thief.</p>
      <p class="d6-item-note">the cat does nothing about this, as usual.</p>
      <div class="d6-stamp d6-stamp-in">KEEP.</div>
    `;
    const words = ["actually,", "listen —", "say less", "no cap"];
    const from = container.querySelector("#d6-lingo-from");
    const to = container.querySelector("#d6-lingo-to");
    words.forEach((w, i) => {
      const chip = make("span", "d6-lingo-chip", w);
      from.appendChild(chip);
      setTimeout(() => {
        chip.classList.add("is-crossing");
        setTimeout(() => {
          from.removeChild(chip);
          const landed = make("span", "d6-lingo-chip d6-lingo-chip-landed", w);
          to.appendChild(landed);
          requestAnimationFrame(() => landed.classList.add("is-in"));
        }, 650);
      }, 600 + i * 700);
    });
  }

  function renderMusic(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP THE MUSIC</p>
      <div class="d6-music-stage" id="d6-music-stage">
        <div class="d6-music-waveform">${Array.from({ length: 11 }, (_, i) => `<span style="--i:${i}"></span>`).join("")}</div>
        <p class="d6-music-word" id="d6-music-word">MUSIC</p>
      </div>
      <p class="d6-item-line">Keep listening to music like you're preparing to fight the entire day.</p>
      <p class="d6-item-note">energy level: unnecessarily high</p>
      <div class="d6-stamp d6-stamp-in">KEEP.</div>
    `;
    const stage = container.querySelector("#d6-music-stage");
    stage.classList.add("is-peak");
    setTimeout(() => stage.classList.add("is-still"), 1900);
  }

  function renderWeirdCats(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP THE WEIRD CATS</p>
      <div class="d6-parade">
        <span class="d6-parade-cat d6-cat-tail">🐈</span>
        <span class="d6-parade-cat d6-cat-upside">🐈</span>
        <span class="d6-parade-cat d6-cat-backward">🐈</span>
        <span class="d6-parade-box">📦<span class="d6-cat-in-box">🐈</span></span>
      </div>
      <div class="d6-main-cat" id="d6-main-cat-offended">🐈</div>
      <p class="d6-item-line">Keep the weird cats.</p>
      <p class="d6-item-line d6-item-line-delay">Apparently this is part of the package now.</p>
      <div class="d6-stamp d6-stamp-in">KEEP.</div>
    `;
    // Element captured once, right after insertion, and reused inside the
    // setTimeout — not re-queried later. If she closes this drawer and opens
    // another before this fires, container.innerHTML has already been
    // replaced by the new item; re-querying at that point would return null
    // and crash. A captured (now-detached) reference just no-ops safely.
    const offendedCat = container.querySelector("#d6-main-cat-offended");
    setTimeout(() => offendedCat.classList.add("is-offended"), 700);
  }

  function renderCargoPants(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">CARGO PANTS</p>
      <div class="d6-rack">
        <div class="d6-rack-line"></div>
        <span class="d6-rack-item">👔</span>
        <span class="d6-rack-item">🧥</span>
        <span class="d6-rack-item">👗</span>
        <span class="d6-rack-item d6-rack-cargo" id="d6-cargo-drop">👖</span>
      </div>
      <p class="d6-item-note">WORKPLACE EVIDENCE</p>
      <p class="d6-item-line">Keep the cargo pants.</p>
      <p class="d6-item-line d6-item-line-delay">You thought it was a joke in your first week.</p>
      <p class="d6-item-line d6-item-line-delay2">Look at you now.</p>
      <p class="d6-item-note">character development.</p>
      <div class="d6-stamp d6-stamp-in">KEEP.</div>
    `;
    const cargoDrop = container.querySelector("#d6-cargo-drop");
    setTimeout(() => cargoDrop.classList.add("is-dropped"), 500);
  }

  function renderProblemSolving(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">AMIRAH PROBLEM-SOLVING</p>
      <div class="d6-knot">🧶</div>
      <p class="d6-approach-a" id="d6-approach-a">APPROACH A — calmly assess</p>
      <div class="d6-method" id="d6-method" hidden>
        <p class="d6-method-title">AMIRAH METHOD</p>
        <p class="d6-method-step">1. cry / yell</p>
        <p class="d6-method-step">2. complain properly</p>
        <p class="d6-method-step">3. actually fix it</p>
        <p class="d6-method-step">4. behave like this was always the plan</p>
      </div>
      <p class="d6-item-line" id="d6-ps-line1" hidden>Keep figuring it out eventually.</p>
      <p class="d6-item-line" id="d6-ps-line2" hidden>Your process is just… theatrical.</p>
      <div class="d6-stamp" id="d6-ps-stamp1" hidden>EFFECTIVE.</div>
      <div class="d6-stamp d6-stamp-warn" id="d6-ps-stamp2" hidden>KEEP.</div>
    `;
    // All elements captured once here — see the note in renderWeirdCats —
    // since this function's own timers stretch out to 5.6s, well past a
    // plausible "closed this and opened the next item already" window.
    const approachA = container.querySelector("#d6-approach-a");
    const method = container.querySelector("#d6-method");
    const line1 = container.querySelector("#d6-ps-line1");
    const line2 = container.querySelector("#d6-ps-line2");
    const stamp1 = container.querySelector("#d6-ps-stamp1");
    const stamp2 = container.querySelector("#d6-ps-stamp2");
    setTimeout(() => approachA.classList.add("is-crossed"), 600);
    setTimeout(() => {
      method.hidden = false;
      requestAnimationFrame(() => method.classList.add("is-in"));
    }, 1400);
    setTimeout(() => {
      line1.hidden = false;
      line1.classList.add("is-in");
    }, 2600);
    setTimeout(() => {
      line2.hidden = false;
      line2.classList.add("is-in");
    }, 3600);
    setTimeout(() => {
      stamp1.hidden = false;
      stamp1.classList.add("is-in");
    }, 4600);
    setTimeout(() => {
      stamp2.hidden = false;
      stamp2.classList.add("is-in");
    }, 5600);
  }

  function renderDreamCar(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">DREAM CAR</p>
      <div class="d6-car-glass"><span class="d6-car">🚗</span></div>
      <p class="d6-item-note">CURRENT STATUS: cannot afford it yet</p>
      <p class="d6-item-handwritten">“no shit, Obinna.”</p>
      <p class="d6-item-note">STATUS: TEMPORARY</p>
      <div class="d6-stamp d6-stamp-in">KEEP WANTING IT.</div>
    `;
  }

  function renderColor(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP THE COLOR</p>
      <div class="d6-color-room" id="d6-color-room">
        <p class="d6-color-msg" id="d6-color-msg">ADULT MODE</p>
        <p class="d6-color-msg2" id="d6-color-msg2">NEUTRAL PALETTE RECOMMENDED</p>
      </div>
      <p class="d6-item-line" id="d6-color-error" hidden>ERROR: SUBJECT REFUSES MONOCHROME</p>
      <p class="d6-item-line" id="d6-color-l1" hidden>Please remain difficult to make monochrome.</p>
      <p class="d6-item-line" id="d6-color-l2" hidden>There are enough people who learned how to become less themselves just to fit properly somewhere.</p>
      <div class="d6-stamp" id="d6-color-stamp" hidden>KEEP THE COLOR.</div>
    `;
    // Captured once — see the note in renderWeirdCats. This one's timers
    // reach 5.8s, the longest chain of any item.
    const room = container.querySelector("#d6-color-room");
    const errorLine = container.querySelector("#d6-color-error");
    const l1 = container.querySelector("#d6-color-l1");
    const l2 = container.querySelector("#d6-color-l2");
    const stamp = container.querySelector("#d6-color-stamp");
    room.classList.add("is-drained");
    setTimeout(() => {
      room.classList.remove("is-drained");
      room.classList.add("is-leaking");
    }, 1600);
    setTimeout(() => {
      room.classList.add("is-refusing");
      errorLine.hidden = false;
      errorLine.classList.add("is-in");
    }, 2600);
    setTimeout(() => {
      l1.hidden = false;
      l1.classList.add("is-in");
    }, 3600);
    setTimeout(() => {
      l2.hidden = false;
      l2.classList.add("is-in");
    }, 4600);
    setTimeout(() => {
      stamp.hidden = false;
      stamp.classList.add("is-in");
    }, 5800);
  }

  function renderSoftness(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP THE SOFTNESS</p>
      <div class="d6-softness-stage">
        <p class="d6-softness-word">SOFTNESS</p>
        <div class="d6-softness-cat" id="d6-softness-cat">🐈</div>
      </div>
      <p class="d6-item-note" id="d6-softness-hint">the cat is sitting on this. move it.</p>
      <div class="d6-softness-reveal" id="d6-softness-reveal" hidden>
        <p class="d6-item-line">Keep this.</p>
        <p class="d6-item-line d6-item-line-delay">Even the parts of your softness that inconvenience you sometimes.</p>
        <p class="d6-item-line d6-item-line-delay2">Not everything gentle needs to be trained out of you.</p>
        <div class="d6-stamp d6-stamp-in">KEEP.</div>
      </div>
    `;
    const cat = container.querySelector("#d6-softness-cat");
    cat.addEventListener(
      "click",
      () => {
        cat.classList.add("is-moved");
        container.querySelector("#d6-softness-hint").classList.add("is-fading");
        const reveal = container.querySelector("#d6-softness-reveal");
        setTimeout(() => {
          reveal.hidden = false;
          requestAnimationFrame(() => reveal.classList.add("is-in"));
        }, 500);
      },
      { once: true }
    );
  }

  function renderEngineer(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP BEING AN ENGINEER</p>
      <div class="d6-gear-stage" id="d6-gear-stage">
        <span class="d6-gear-obj">💡</span>
        <div class="d6-gear-inside" id="d6-gear-inside">⚙️ 🔩 ⚡</div>
      </div>
      <p class="d6-item-line">Keep wanting to know why something works instead of just accepting that it does.</p>
      <p class="d6-item-line d6-item-line-delay">Keep touching things until they make sense.</p>
      <p class="d6-item-note">results may vary.</p>
      <div class="d6-stamp d6-stamp-in">KEEP.</div>
    `;
    const gearStage = container.querySelector("#d6-gear-stage");
    setTimeout(() => gearStage.classList.add("is-open"), 700);
  }

  function renderDifficult(container, done) {
    container.innerHTML = `
      <p class="d6-item-eyebrow">KEEP BEING DIFFICULT SOMETIMES</p>
      <div class="d6-warning-label">⚠ HANDLE WITH PATIENCE</div>
      <p class="d6-item-line">Keep being stubborn enough to have your own mind.</p>
      <p class="d6-item-line d6-item-line-delay">Maybe reduce it by like 4%.</p>
      <p class="d6-item-note">for everybody's safety.</p>
      <div class="d6-stamp d6-stamp-in">KEEP MOST OF IT.</div>
    `;
  }

  /* ============================================================
     Building and opening the packing rack
     ============================================================ */
  function buildRack() {
    const rack = el("d6-rack-line-host");
    rack.innerHTML = "";
    ITEMS.forEach((it, i) => {
      const tag = make("button", "d6-tag");
      tag.type = "button";
      tag.dataset.i = String(i);
      tag.innerHTML = `<span class="d6-tag-string"></span><span class="d6-tag-body">${it.label}</span>`;
      tag.addEventListener("click", () => openItem(i));
      rack.appendChild(tag);
    });
  }

  function openItem(i) {
    const it = ITEMS[i];
    const scrim = el("d6-panel-scrim");
    const panel = el("d6-panel");
    const body = el("d6-panel-body");
    body.innerHTML = "";
    panel.className = "d6-panel d6-anim-" + ANIMS[i % ANIMS.length];
    scrim.hidden = false;
    requestAnimationFrame(() => {
      scrim.classList.add("is-in");
      requestAnimationFrame(() => panel.classList.add("is-in"));
    });

    if (!openedItems.has(i)) {
      openedItems.add(i);
      el("d6-rack-line-host").children[i].classList.add("is-opened");
      maybeShowPackStrain();
    }
    it.custom(body, () => {});
  }

  function closeItem() {
    const scrim = el("d6-panel-scrim");
    const panel = el("d6-panel");
    panel.classList.remove("is-in");
    scrim.classList.remove("is-in");
    advanceSequence = null;
    setTimeout(() => (scrim.hidden = true), 400);
  }

  function maybeShowPackStrain() {
    if (packStrainShown) return;
    if (openedItems.size < 6) return;
    packStrainShown = true;
    const el2 = el("d6-pack-continue");
    el2.hidden = false;
    requestAnimationFrame(() => el2.classList.add("is-in"));
  }

  /* ============================================================
     STAGE 2 — the catch: KEEP EVERYTHING → crossed out → CHANGE.
     ============================================================ */
  function startCatch() {
    setStage(2);
    el("d6-rack-stage").hidden = true;
    const host = el("d6-catch");
    host.hidden = false;
    revealIn(host);

    setTimeout(() => el("d6-keep-everything").classList.add("is-in"), 1000);
    setTimeout(() => el("d6-keep-everything").classList.add("is-crossed"), 2600);
    setTimeout(() => el("d6-actually-no").classList.add("is-in"), 3600);
    setTimeout(() => el("d6-change-word").classList.add("is-in"), 5000);
    setTimeout(startLetHerChange, 7200);
  }

  /* ============================================================
     STAGE 3 — let her change
     ============================================================ */
  function startLetHerChange() {
    setStage(3);
    el("d6-catch").hidden = true;
    const host = el("d6-transform");
    host.hidden = false;
    revealIn(host);

    const growHost = el("d6-grow-words");
    const growWords = [
      "change your mind.",
      "outgrow things.",
      "drop habits that stop serving you.",
      "learn.",
      "be wrong.",
      "try again.",
      "be embarrassed by old versions of yourself.",
      "surprise yourself.",
      "start over where you need to.",
    ];
    // These replace each other one at a time, not accumulate — a custom
    // step so each word clears the last before the next fades in, instead
    // of playSequence's default (append and keep growing the list).
    let gi = 0;
    function nextGrowWord(next) {
      if (gi >= growWords.length) return next();
      growHost.innerHTML = "";
      const p = make("p", "d6-seq-line", growWords[gi]);
      growHost.appendChild(p);
      requestAnimationFrame(() => p.classList.add("is-in"));
      gi++;
      const t = setTimeout(() => nextGrowWord(next), 900);
      advanceSequence = () => {
        clearTimeout(t);
        advanceSequence = null;
        nextGrowWord(next);
      };
    }
    playSequence(growHost, [{ type: "custom", run: (c, next) => nextGrowWord(next) }], {
      onDone: () => {
        const linesHost = el("d6-change-lines");
        const seq2 = [
          { type: "pause", ms: 700 },
          { type: "big", text: "I've already watched change look beautiful on you." },
          { type: "pause", ms: 600 },
          { type: "line", text: "I've watched you become more open." },
          { type: "line", text: "More transparent." },
          { type: "line", text: "More deliberate." },
          { type: "line", text: "More willing to let yourself be understood." },
          { type: "pause", ms: 900 },
          { type: "big", text: "Change." },
          { type: "pause", ms: 700 },
          { type: "line", text: "Just don't confuse changing with disappearing." },
          { type: "pause", ms: 1200 },
        ];
        playSequence(linesHost, seq2, { onDone: startWantingThings });
      },
    });
  }

  /* ============================================================
     STAGE 4 — keep wanting things that aren't me
     ============================================================ */
  function startWantingThings() {
    setStage(4);
    el("d6-transform").hidden = true;
    const host = el("d6-wanting");
    host.hidden = false;
    revealIn(host);

    setTimeout(() => el("d6-wanting-title").classList.add("is-in"), 500);
    setTimeout(() => el("d6-wanting-line1").classList.add("is-in"), 1900);

    const objects = [
      "your work", "your money", "your peace", "your people", "weird cats", "places you haven't seen",
      "things you build", "things with your name on them", "quiet mornings", "ridiculously loud music",
      "something expensive you bought without checking your account five times first", "reasons to smile when I'm nowhere around",
    ];
    const wrap = el("d6-wanting-objects");
    objects.forEach((o, i) => {
      setTimeout(() => {
        const chip = make("span", "d6-want-obj", o);
        wrap.appendChild(chip);
        requestAnimationFrame(() => chip.classList.add("is-in"));
      }, 3000 + i * 380);
    });
    setTimeout(() => el("d6-wanting-line2").classList.add("is-in"), 3000 + objects.length * 380 + 800);
    setTimeout(startHair, 3000 + objects.length * 380 + 4000);
  }

  /* ============================================================
     STAGE 5 — the hair
     ============================================================ */
  function startHair() {
    setStage(5);
    el("d6-wanting").hidden = true;
    const host = el("d6-hair");
    host.hidden = false;
    revealIn(host);

    setTimeout(() => el("d6-hair-then").classList.add("is-in"), 700);
    setTimeout(() => el("d6-hair-thread").classList.add("is-in"), 1600);
    setTimeout(() => el("d6-hair-later").classList.add("is-in"), 2600);
    setTimeout(startSoul, 5200);
  }

  /* ============================================================
     STAGE 6 — keep your soul
     ============================================================ */
  function startSoul() {
    setStage(6);
    el("d6-hair").hidden = true;
    const host = el("d6-soul");
    host.hidden = false;
    revealIn(host);

    const orb = el("d6-soul-orb");
    setTimeout(() => orb.classList.add("is-shrinking"), 600);
    setTimeout(() => orb.classList.remove("is-shrinking"), 1500);
    setTimeout(() => el("d6-soul-label").classList.add("is-in"), 1800);
    const seq = [
      { type: "pause", ms: 900 },
      { type: "big", text: "You are so lovable." },
      { type: "pause", ms: 700 },
      { type: "line", text: "And there are parts of you I hope life never convinces you to throw away." },
      { type: "pause", ms: 500 },
      { type: "line", text: "Your soul is not clutter." },
      { type: "pause", ms: 1400 },
    ];
    setTimeout(() => playSequence(el("d6-soul-lines"), seq, { onDone: startTwentyOne }), 2600);
  }

  /* ============================================================
     STAGE 7 — 21 tomorrow
     ============================================================ */
  function startTwentyOne() {
    setStage(7);
    el("d6-soul").hidden = true;
    const host = el("d6-twentyone");
    host.hidden = false;
    revealIn(host);

    setTimeout(() => el("d6-t21-pending").classList.add("is-in"), 500);
    setTimeout(() => el("d6-t21-number").classList.add("is-in"), 1600);

    const checklist = [
      ["more grown?", "maybe."],
      ["finished?", "no."],
      ["supposed to know everything now?", "absolutely not."],
      ["still allowed to be weird?", "yes."],
      ["still becoming?", "obviously."],
    ];
    const wrap = el("d6-t21-checklist");
    checklist.forEach((pair, i) => {
      setTimeout(() => {
        const row = make("p", "d6-t21-row", `<span class="d6-t21-q">${pair[0]}</span> <span class="d6-t21-a">${pair[1]}</span>`);
        wrap.appendChild(row);
        requestAnimationFrame(() => row.classList.add("is-in"));
      }, 2600 + i * 750);
    });
    const seq = [
      { type: "pause", ms: 2600 + checklist.length * 750 + 600 },
      { type: "big", text: "Twenty-one is not a completed version of you." },
      { type: "pause", ms: 900 },
      { type: "line", text: "Thank God." },
      { type: "pause", ms: 1300 },
    ];
    playSequence(el("d6-t21-lines"), seq, { onDone: startFinalRoom });
  }

  /* ============================================================
     STAGE 8 — the final room
     ============================================================ */
  function startFinalRoom() {
    setStage(8);
    el("d6-twentyone").hidden = true;
    const host = el("d6-finalroom");
    host.hidden = false;
    revealIn(host);

    // the lived-in room: motifs from across the day, art-directed chaos
    setTimeout(() => host.classList.add("is-lived-in"), 600);

    const labels = ["engineer.", "student.", "stubborn.", "soft.", "21.", "girlfriend."];
    const labelHost = el("d6-final-labels");
    labels.forEach((l, i) => {
      const tag = make("span", "d6-final-label", l);
      labelHost.appendChild(tag);
    });
    requestAnimationFrame(() => labelHost.classList.add("is-in"));

    setTimeout(() => {
      Array.from(labelHost.children).forEach((tag, i) => {
        setTimeout(() => tag.classList.add("is-removed"), i * 400);
      });
    }, 2200);

    setTimeout(() => {
      const amirah = el("d6-final-amirah");
      amirah.hidden = false;
      requestAnimationFrame(() => amirah.classList.add("is-in"));
    }, 2200 + labels.length * 400 + 500);

    const seq = [
      { type: "pause", ms: 2200 + labels.length * 400 + 2200 },
      { type: "line", text: "Grow as much as you need to." },
      { type: "pause", ms: 600 },
      { type: "line", text: "Change as much as you need to." },
      { type: "pause", ms: 700 },
      { type: "line", text: "Just don't disappear inside the growing." },
      { type: "pause", ms: 1100 },
      { type: "line", text: "There are things about you worth carrying forward exactly because they are yours." },
      { type: "pause", ms: 1000 },
    ];
    playSequence(el("d6-final-lines"), seq, {
      onDone: () => {
        const big = el("d6-final-big");
        big.hidden = false;
        requestAnimationFrame(() => big.classList.add("is-in"));
        setTimeout(runFinalCat, 3200);
      },
    });
  }

  function runFinalCat() {
    const cat = el("d6-final-cat");
    cat.hidden = false;
    requestAnimationFrame(() => cat.classList.add("is-walking"));
    setTimeout(() => {
      cat.classList.remove("is-walking");
      cat.classList.add("is-sitting");
      const note = el("d6-final-cat-note");
      note.hidden = false;
      requestAnimationFrame(() => note.classList.add("is-in"));
    }, 2600);
    setTimeout(() => {
      el("d6-back").hidden = false;
      requestAnimationFrame(() => el("d6-back").classList.add("is-in"));
      if (onDoneCb) onDoneCb();
    }, 4200);
  }

  /* ============================================================
     Markup + wiring
     ============================================================ */
  function buildHTML() {
    return `
      <div class="d6-scene" id="d6-scene" data-stage="0">
        <svg class="d6-curtain d6-curtain-left" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 Q30 200 0 400 L0 0 Z" fill="currentColor" opacity="0.5"/>
        </svg>
        <svg class="d6-curtain d6-curtain-right" viewBox="0 0 100 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M100 0 Q70 200 100 400 L100 0 Z" fill="currentColor" opacity="0.5"/>
        </svg>
        <div class="d6-sunlight" aria-hidden="true"></div>

        <div class="d6-opening" id="d6-opening">
          <p class="d6-eyebrow">DAY 6</p>
          <h2 class="d6-open-title" id="d6-open-title">PLEASE DON'T BECOME<br>EASIER TO EXPLAIN</h2>
          <p class="d6-open-sub" id="d6-open-sub"></p>
          <div class="d6-open-lines" id="d6-open-lines"></div>
          <button type="button" class="d6-continue" id="d6-continue" hidden>begin packing</button>
        </div>

        <div class="d6-rack-stage" id="d6-rack-stage" hidden>
          <p class="d6-rack-kicker">ITEMS TO CARRY INTO 21</p>
          <p class="d6-rack-sub">tap a tag. see what stays.</p>
          <div class="d6-rack-line-host" id="d6-rack-line-host"></div>
          <div class="d6-pack-continue" id="d6-pack-continue" hidden>
            <p class="d6-pack-continue-line">the suitcase is almost full.</p>
            <button type="button" class="d6-pack-continue-btn" id="d6-pack-continue-btn">close it.</button>
          </div>
        </div>

        <div class="d6-panel-scrim" id="d6-panel-scrim" hidden>
          <div class="d6-panel" id="d6-panel">
            <button type="button" class="d6-panel-close" id="d6-panel-close" aria-label="close">×</button>
            <div class="d6-panel-body" id="d6-panel-body"></div>
          </div>
        </div>

        <div class="d6-catch" id="d6-catch" hidden>
          <p class="d6-keep-everything" id="d6-keep-everything">KEEP EVERYTHING.</p>
          <p class="d6-actually-no" id="d6-actually-no">Actually, no.</p>
          <p class="d6-change-word" id="d6-change-word">CHANGE.</p>
        </div>

        <div class="d6-transform" id="d6-transform" hidden>
          <div class="d6-grow-words" id="d6-grow-words"></div>
          <div class="d6-change-lines" id="d6-change-lines"></div>
        </div>

        <div class="d6-wanting" id="d6-wanting" hidden>
          <p class="d6-wanting-title" id="d6-wanting-title">KEEP WANTING THINGS THAT AREN'T ME.</p>
          <p class="d6-wanting-line" id="d6-wanting-line1">I hope you have entire beautiful parts of your life that I had nothing to do with.</p>
          <div class="d6-wanting-objects" id="d6-wanting-objects"></div>
          <p class="d6-wanting-line d6-wanting-line-final" id="d6-wanting-line2">I want Amirah to have a good life even in rooms where Obinna isn't standing.</p>
        </div>

        <div class="d6-hair" id="d6-hair" hidden>
          <div class="d6-hair-then" id="d6-hair-then">
            <p class="d6-hair-desc">brown. long.</p>
            <p class="d6-hair-line">I knew you with that ridiculously beautiful long brown hair.</p>
          </div>
          <div class="d6-hair-thread" id="d6-hair-thread"></div>
          <div class="d6-hair-later" id="d6-hair-later">
            <p class="d6-hair-desc">silver. someday.</p>
            <p class="d6-hair-line">I intend to know you there too.</p>
          </div>
        </div>

        <div class="d6-soul" id="d6-soul" hidden>
          <div class="d6-soul-orb" id="d6-soul-orb"></div>
          <p class="d6-soul-label" id="d6-soul-label">UNPACKABLE</p>
          <div class="d6-soul-lines" id="d6-soul-lines"></div>
        </div>

        <div class="d6-twentyone" id="d6-twentyone" hidden>
          <p class="d6-t21-kicker">21 TOMORROW</p>
          <p class="d6-t21-pending" id="d6-t21-pending">AGE UPDATE PENDING</p>
          <p class="d6-t21-number" id="d6-t21-number">21</p>
          <div class="d6-t21-checklist" id="d6-t21-checklist"></div>
          <div class="d6-t21-lines" id="d6-t21-lines"></div>
        </div>

        <div class="d6-finalroom" id="d6-finalroom" hidden>
          <div class="d6-final-motifs" aria-hidden="true">
            <span class="d6-motif" style="--x:8%; --y:14%">👖</span>
            <span class="d6-motif" style="--x:82%; --y:10%">🎵</span>
            <span class="d6-motif" style="--x:14%; --y:70%">⚙️</span>
            <span class="d6-motif" style="--x:78%; --y:66%">🐈</span>
            <span class="d6-motif" style="--x:50%; --y:8%">🔑</span>
            <span class="d6-motif" style="--x:88%; --y:40%">🌷</span>
            <span class="d6-motif" style="--x:6%; --y:42%">sha sha</span>
          </div>
          <div class="d6-final-labels" id="d6-final-labels"></div>
          <p class="d6-final-amirah" id="d6-final-amirah" hidden>AMIRAH</p>
          <div class="d6-final-lines" id="d6-final-lines"></div>
          <p class="d6-final-big" id="d6-final-big" hidden>PLEASE DON'T BECOME EASIER TO EXPLAIN.</p>
          <div class="d6-final-cat" id="d6-final-cat" hidden>🐈</div>
          <p class="d6-final-cat-note" id="d6-final-cat-note" hidden>“I was getting used to the difficulty.”</p>
          <button type="button" class="d6-back" id="d6-back" hidden>← back to the seven days</button>
        </div>
      </div>`;
  }

  function render(container, opts) {
    root = container;
    onDoneCb = (opts && opts.onDone) || null;
    stage = 0;
    openedItems.clear();
    packStrainShown = false;
    advanceSequence = null;

    root.innerHTML = buildHTML();
    sceneEl = el("d6-scene");

    buildRack();
    runOpening();

    el("d6-continue").addEventListener("click", () => {
      const opening = el("d6-opening");
      opening.classList.add("is-leaving");
      setTimeout(() => {
        opening.hidden = true;
        setStage(1);
        const rack = el("d6-rack-stage");
        rack.hidden = false;
        requestAnimationFrame(() => rack.classList.add("is-in"));
      }, 600);
    });

    el("d6-panel-close").addEventListener("click", closeItem);
    el("d6-panel-scrim").addEventListener("click", (e) => {
      if (e.target === el("d6-panel-scrim")) closeItem();
    });
    el("d6-panel-body").addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      if (advanceSequence) advanceSequence();
    });

    el("d6-pack-continue-btn").addEventListener("click", startCatch);

    el("d6-back").addEventListener("click", () => {
      const closeBtn = document.getElementById("day-overlay-close");
      if (closeBtn) closeBtn.click();
    });
  }

  return { render };
})();
