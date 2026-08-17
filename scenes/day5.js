/* ============================================================
   Day 5 — "The Amirah Index". Not the love letter (that's Day 7).
   This one is the site quietly admitting it's been paying attention
   for four years: a private archive of 21 drawers built entirely
   around her — her habits, contradictions, growth, humor, softness,
   stubbornness — that keeps trying to file her under one word and
   keeps failing, on purpose, until the only card left just says
   AMIRAH.

   Stages: 0 opening (labels that aren't enough) → 1 the 21-drawer
   wall → 2 word storm → 3 the archive admits defeat → 4 the blank
   card / AMIRAH → 5 final payoff.
   ============================================================ */
window.Day5Scene = (function () {
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
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let root, onDoneCb;
  let sceneEl;
  let stage = 0;
  const openedDrawers = new Set();
  let strainShown = false;
  let advanceSequence = null; // lets a click skip the current wait

  function setStage(n) {
    stage = n;
    if (sceneEl) sceneEl.dataset.stage = String(n);
  }

  // Reading time scaled to how much there actually is to read — a flat
  // delay regardless of sentence length meant a one-word line and a full
  // sentence got the same window, so longer lines flew by too fast.
  function readTime(text) {
    const words = (text || "").trim().split(/\s+/).filter(Boolean).length || 1;
    return Math.max(1900, Math.min(5200, 700 + words * 340));
  }

  /* ------------------------------------------------------------
     A tiny "sequencer": plays an array of steps into a container,
     one at a time, each staying up for a readable beat before the
     next one appears (unless she taps to skip ahead). Steps can be
     plain text lines, ink stamps, pauses, or a custom function for
     the handful of set-pieces (video face, color analysis, etc.)
     that need real logic instead of just text.
     ------------------------------------------------------------ */
  function playSequence(container, steps, opts) {
    opts = opts || {};
    let cancelled = false;
    let i = 0;

    function stepEl(step) {
      if (step.type === "title") return make("p", "d5-seq-title", step.text);
      if (step.type === "big") return make("p", "d5-seq-big", step.text);
      if (step.type === "line") return make("p", "d5-seq-line", step.text);
      if (step.type === "small") return make("p", "d5-seq-small", step.text);
      if (step.type === "stamp") return make("div", "d5-stamp" + (step.warn ? " d5-stamp-warn" : ""), step.text);
      if (step.type === "divider") return make("div", "d5-seq-divider");
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
        }, step.ms || 1100);
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
        if (step.clearBefore) {
          // some sequences replace rather than accumulate
        }
      }
      const delay = step.ms || (step.type === "stamp" ? 1600 : readTime(step.text));
      advanceSequence = () => {
        advanceSequence = null;
        runNext();
      };
      setTimeout(() => {
        if (advanceSequence) advanceSequence();
      }, delay);
    }

    runNext();
    return {
      cancel() {
        cancelled = true;
        advanceSequence = null;
      },
    };
  }

  /* ============================================================
     STAGE 0 — the opening. Archival labels, then four attempts at
     describing her that all get stamped INSUFFICIENT, ending on
     her actual name sitting alone.
     ============================================================ */
  function runOpening() {
    const tagsEl = el("d5-tags");
    const tags = ["SUBJECT: AMIRAH", "AGE: 21", "CLASSIFICATION: ongoing"];
    tags.forEach((t, i) => {
      setTimeout(() => {
        const tag = make("span", "d5-tag", t);
        tagsEl.appendChild(tag);
        requestAnimationFrame(() => tag.classList.add("is-in"));
      }, 600 + i * 500);
    });

    setTimeout(() => {
      el("d5-open-line1").classList.add("is-in");
    }, 2400);

    setTimeout(runFailedLabels, 4200);
  }

  function runFailedLabels() {
    const host = el("d5-fail-stage");
    const rounds = [
      { word: "PRETTY", after: "You give life to ordinary things." },
      { word: "KIND", after: "There are little things you do that stay in my head for months." },
      { word: "IMPORTANT", after: "Your absence can make an ordinary day feel different." },
    ];

    const steps = [];
    rounds.forEach((r) => {
      steps.push({
        type: "custom",
        run(container, next) {
          container.innerHTML = "";
          const word = make("p", "d5-fail-word", r.word);
          container.appendChild(word);
          requestAnimationFrame(() => word.classList.add("is-in"));
          setTimeout(() => {
            const stamp = make("div", "d5-stamp d5-stamp-warn", "INSUFFICIENT.");
            container.appendChild(stamp);
            requestAnimationFrame(() => stamp.classList.add("is-in"));
            setTimeout(next, 1500);
          }, 900);
        },
      });
      steps.push({ type: "line", ms: 2600 });
      steps[steps.length - 1].text = r.after;
    });

    // MY GIRLFRIEND — pauses, gets rejected too, then "my Amirah."
    steps.push({
      type: "custom",
      run(container, next) {
        container.innerHTML = "";
        const word = make("p", "d5-fail-word", "MY GIRLFRIEND");
        container.appendChild(word);
        requestAnimationFrame(() => word.classList.add("is-in"));
        setTimeout(() => {
          const stamp = make("div", "d5-stamp d5-stamp-warn", "INSUFFICIENT.");
          container.appendChild(stamp);
          requestAnimationFrame(() => stamp.classList.add("is-in"));
          setTimeout(() => {
            container.innerHTML = "";
            const name = make("p", "d5-fail-word d5-fail-name", "MY AMIRAH");
            container.appendChild(name);
            requestAnimationFrame(() => name.classList.add("is-in"));
            setTimeout(next, 2600);
          }, 1500);
        }, 1300);
      },
    });

    playSequence(host, steps, {
      onDone: () => {
        setTimeout(() => (el("d5-continue").hidden = false), 400);
        requestAnimationFrame(() => requestAnimationFrame(() => el("d5-continue").classList.add("is-in")));
      },
    });
  }

  /* ============================================================
     THE 21 DRAWERS — content model. Most are a short sequence of
     lines; a handful are bespoke set-pieces (custom step). `anim`
     picks how the drawer panel arrives (not all identical).
     ============================================================ */
  const ANIMS = ["slide", "unfold", "peel", "flip", "expand", "spill", "trace"];

  function lines(...arr) {
    return arr.map((t) => ({ type: "line", text: t }));
  }

  const DRAWERS = [
    {
      label: "THINGS I\nNOTICE",
      big: true,
      steps: null,
      custom: renderThingsINotice,
    },
    {
      label: "THINGS I DON'T SAY\nTHANK YOU FOR ENOUGH",
      steps: [
        { type: "title", text: "THINGS I DON'T SAY THANK YOU FOR ENOUGH" },
        {
          type: "custom",
          run(container, next) {
            const items = [
              "your effort",
              "your honesty",
              "the transparency you've grown into",
              "how much closer you've let me get",
              "the moments you understand me without making me explain everything",
              "the softness you don't always notice in yourself",
              "the ways you've changed",
              "the ways you're still changing",
              "the fact that you keep trying",
            ];
            let i = 0;
            const wrap = make("div", "d5-tag-list");
            container.appendChild(wrap);
            function drop() {
              if (i >= items.length) return setTimeout(next, 900);
              const chip = make("p", "d5-tag-chip", items[i]);
              wrap.appendChild(chip);
              requestAnimationFrame(() => chip.classList.add("is-in"));
              i++;
              const t = setTimeout(drop, 850);
              advanceSequence = () => {
                clearTimeout(t);
                advanceSequence = null;
                drop();
              };
            }
            drop();
          },
        },
      ],
    },
    {
      label: "THINGS YOU DON'T\nKNOW I REMEMBER",
      steps: [
        { type: "title", text: "THINGS YOU DON'T KNOW I REMEMBER" },
        ...lines(
          "The exact tone you use right before you're about to be extra.",
          "How you changed my name on ig to Amirah's property, and I couldn't change it for 21 days.",
          "How you never said I love you back to me.",
          "How you didn't tell me you were going back to meet your mom after our cinema stuff — I still think it's a lie.",
          "How you told me a few days before you travelled, that you were travelling.",
          "How you used to turn on generator lol.",
          "Your smirk when you get caught in a lie.",
          "How you used to code python. na so you take turn snake."
        ),
      ],
    },
    {
      label: "SOFTNESS",
      steps: [
        { type: "title", text: "SOFTNESS" },
        ...lines(
          "The version of you that shows up right after the tough one leaves.",
          "How careful you get with things you've decided are yours to protect.",
          "You'll deny this file exists."
        ),
      ],
    },
    {
      label: "STUBBORNNESS",
      steps: [
        { type: "title", text: "STUBBORNNESS" },
        ...lines(
          "You will lose an argument and still not agree that you lost.",
          "“I'm not mad” has never once been true.",
          "Once you've decided something, gravity has to ask permission."
        ),
      ],
    },
    {
      label: "THINGS YOU'VE\nGROWN INTO",
      steps: [
        { type: "title", text: "THINGS YOU'VE GROWN INTO" },
        ...lines(
          "Saying what you actually mean, out loud, on the first try.",
          "Your ability to say sorry.",
          "Being proud of things you used to shrink from.",
          "Telling people you have a boyfriend. (I got my eyes on u.)"
        ),
      ],
    },
    {
      label: "THINGS YOU'RE\nSTILL BECOMING",
      steps: [
        { type: "title", text: "THINGS YOU'RE STILL BECOMING" },
        ...lines(
          "Someone who can accept help.",
          "Someone who believes the good things people say about her.",
          "Someone who rests without calling it falling behind.",
          "Whoever you're building — on your own schedule."
        ),
      ],
    },
    {
      label: "THE WAY\nYOU THINK",
      steps: [
        { type: "title", text: "THE WAY YOU THINK" },
        ...lines(
          "You solve problems sideways. Never the way anyone expects.",
          "Logical about everything except yourself.",
          "You'll plan 800 days ahead and still panic 3 days out.",
          "Loopholes and consequences."
        ),
      ],
    },
    {
      label: "THINGS I HOPE\nYOU GET TO HAVE",
      steps: [
        { type: "title", text: "THINGS I HOPE YOU GET TO HAVE" },
        ...lines(
          "Mornings that don't start with a to-do list.",
          "Work that asks for your brain, not your whole nervous system.",
          "People in your corner who never make you shrink to fit in.",
          "A lot of mullah. And a ton of sex from me, inshallah.",
          "Your dream car.",
          "A ton of new healthy hobbies that suck your attention.",
          "You deserve them all, and more, my love."
        ),
      ],
    },
    {
      label: "DAYS YOU DON'T\nFEEL LIKE YOURSELF",
      steps: [
        { type: "title", text: "DAYS YOU DON'T FEEL LIKE YOURSELF" },
        ...lines(
          "Long work days you wanna do nothing but scroll.",
          "You're still you, underneath the bad one.",
          "Nothing go do you sha. Nor worry."
        ),
      ],
    },
    {
      label: "SMALL THINGS THAT\nBECAME IMPORTANT",
      steps: [
        { type: "title", text: "SMALL THINGS THAT BECAME IMPORTANT" },
        ...lines(
          "Summer, every year.",
          "The weekend.",
          "Writing random stuff.",
          "Screen share.",
          "“are we okay?”",
          "Wear socks.",
          "Snapchat and Paired..."
        ),
      ],
    },
    {
      label: "THINGS I STILL DON'T\nKNOW HOW TO SAY",
      steps: [
        { type: "title", text: "THINGS I STILL DON'T KNOW HOW TO SAY" },
        ...lines("Some of this doesn't fit on an index card.", "na day 7 I go talk all these ones, brotherly."),
      ],
    },
    {
      label: "HANDLE\nWITH CARE",
      steps: [
        { type: "title", text: "HANDLE WITH CARE" },
        { type: "big", text: "You are painfully lovable." },
        { type: "pause", ms: 900 },
        { type: "line", text: "There are things I can replace." },
        { type: "pause", ms: 700 },
        { type: "line", text: "Your soul isn't one of them." },
      ],
    },
    {
      label: "ORDINARY OBJECTS,\nAFTER AMIRAH",
      custom: renderOrdinaryObjects,
    },
    {
      label: "THE\nHAIR FILE",
      custom: renderHairFile,
    },
    {
      label: "IMPERFECT.",
      steps: [
        { type: "title", text: "IMPERFECT." },
        { type: "pause", ms: 1200 },
        { type: "big", text: "Exactly." },
        { type: "line", text: "I don't love an edited version of you." },
        { type: "line", text: "You get to be unfinished." },
      ],
    },
    {
      label: "COLOR\nANALYSIS",
      custom: renderColorAnalysis,
    },
    {
      label: "SPIRIT ANIMAL\nANALYSIS",
      custom: renderSpiritAnimal,
    },
    {
      label: "HER\nFUTURE",
      steps: [
        { type: "title", text: "HER FUTURE" },
        { type: "big", text: "I want you to win because you're you." },
        { type: "pause", ms: 1000 },
        ...lines(
          "I want you to build things.",
          "I want you to surprise yourself.",
          "I want you to have stupidly peaceful mornings.",
          "I want you to laugh when I'm nowhere around to hear it.",
          "I want you to have reasons to smile that have nothing to do with me.",
          "I want you to become things neither of us knows to predict yet."
        ),
      ],
    },
    {
      label: "21",
      steps: [
        { type: "title", text: "21 YEARS" },
        {
          type: "custom",
          run(container, next) {
            const words = ["unfinished", "surprising", "learning", "building", "failing", "trying again", "laughing", "changing", "becoming"];
            const wrap = make("div", "d5-tag-list d5-tag-list-center");
            container.appendChild(wrap);
            words.forEach((w, i) => {
              setTimeout(() => {
                const chip = make("p", "d5-tag-chip", w);
                wrap.appendChild(chip);
                requestAnimationFrame(() => chip.classList.add("is-in"));
              }, i * 260);
            });
            setTimeout(next, words.length * 260 + 900);
          },
        },
        { type: "big", text: "Twenty-one is not a finished version of you." },
        { type: "pause", ms: 900 },
        { type: "line", text: "Thank God." },
      ],
    },
    {
      label: "UNCLASSIFIED",
      custom: renderUnclassified,
    },
  ];

  /* ---- bespoke set-pieces ---- */

  function renderThingsINotice(container, done) {
    container.innerHTML = "";
    const head = make("p", "d5-seq-title", "THINGS I NOTICE");
    container.appendChild(head);
    requestAnimationFrame(() => head.classList.add("is-in"));

    const stage = make("div", "d5-notice-stage");
    container.appendChild(stage);
    const nav = make("div", "d5-notice-nav");
    const prevBtn = make("button", "d5-notice-prev", "‹");
    const dots = make("div", "d5-notice-dots");
    const nextBtn = make("button", "d5-notice-next", "›");
    prevBtn.type = "button";
    nextBtn.type = "button";
    nav.append(prevBtn, dots, nextBtn);
    container.appendChild(nav);

    const cards = [renderVideoFace, renderShaSha, renderWickedGirl, renderLingoTheft, renderMusicVsReality, renderCargoPants, renderEngineeringMethod, renderDreamCar, renderShortObservations];

    dots.innerHTML = cards.map(() => `<span class="d5-notice-dot"></span>`).join("");
    const dotEls = Array.from(dots.children);

    let idx = 0;
    function show(n) {
      idx = (n + cards.length) % cards.length;
      stage.innerHTML = "";
      stage.classList.remove("is-in");
      const card = make("div", "d5-notice-card");
      stage.appendChild(card);
      cards[idx](card);
      requestAnimationFrame(() => stage.classList.add("is-in"));
      dotEls.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    }
    prevBtn.addEventListener("click", () => show(idx - 1));
    nextBtn.addEventListener("click", () => show(idx + 1));
    show(0);
    // Doesn't auto-close — this exhibit is the point, let her linger
    // and flip through at her own pace. done() only fires if she
    // never opened this drawer's steps flow at all, so nothing else
    // is waiting on it.
  }

  function renderVideoFace(card) {
    card.innerHTML = `
      <p class="d5-notice-label">THE VIDEO FACE</p>
      <div class="d5-face" id="d5-face-anim">
        <div class="d5-face-head">
          <span class="d5-face-mouth"></span>
        </div>
      </div>
      <p class="d5-notice-line">That little head movement before the pout when you make videos.</p>
      <div class="d5-stamp d5-stamp-in">OBSERVED REPEATEDLY.</div>
      <p class="d5-notice-annotation">you really thought I didn't notice this.</p>
    `;
    const face = card.querySelector("#d5-face-anim");
    let raf;
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
            raf = setTimeout(loop, 1400);
          }, 700);
        }, 400);
      }, 500);
    }
    loop();
  }

  function renderShaSha(card) {
    card.innerHTML = `
      <p class="d5-notice-label">SHA SHA</p>
      <p class="d5-notice-stat">STORIES ANALYZED: <b>TOO MANY</b></p>
      <p class="d5-notice-stat">"sha sha" OCCURRENCES: <b>CONCERNING</b></p>
      <p class="d5-notice-line">"sha sha" in every story.</p>
      <p class="d5-notice-line d5-notice-line-delay">You've influenced me. I say it now.</p>
      <div class="d5-stamp d5-stamp-warn d5-stamp-in">CONTAMINATION CONFIRMED.</div>
    `;
  }

  function renderWickedGirl(card) {
    card.innerHTML = `
      <p class="d5-notice-label">THE WICKED GIRL FILE</p>
      <p class="d5-notice-stat">WICKED GIRL CONTENT: <b>EXTENSIVE</b></p>
      <p class="d5-notice-stat">LOYALTY RECORD: <b>4 YEARS</b></p>
      <div class="d5-stamp d5-stamp-big d5-stamp-in">CASE DISMISSED.</div>
      <div class="d5-paw-stamp" aria-hidden="true">🐾</div>
      <p class="d5-notice-annotation">FILE CONTAMINATED BY CAT.</p>
    `;
  }

  function renderLingoTheft(card) {
    card.innerHTML = `
      <p class="d5-notice-label">INTELLECTUAL PROPERTY INVESTIGATION</p>
      <div class="d5-theft">
        <span class="d5-theft-word d5-theft-from">my lingo</span>
        <span class="d5-theft-arrow">→</span>
        <span class="d5-theft-word d5-theft-to">hers now</span>
        <span class="d5-theft-cat" aria-hidden="true">🐈</span>
      </div>
      <p class="d5-notice-line">You steal a disturbing amount of my lingo.</p>
      <p class="d5-notice-annotation">the archivist cat watches this happen and does absolutely nothing.</p>
      <div class="d5-stamp d5-stamp-warn d5-stamp-in">SUSPECT SHOWS NO REMORSE.</div>
    `;
  }

  function renderMusicVsReality(card) {
    card.innerHTML = `
      <p class="d5-notice-label">MUSIC VS REALITY</p>
      <div class="d5-waveform" id="d5-waveform">
        ${Array.from({ length: 9 }, (_, i) => `<span style="--i:${i}"></span>`).join("")}
      </div>
      <p class="d5-notice-stat">LISTENING HABITS: <b>MAXIMUM ENERGY</b></p>
      <p class="d5-notice-stat d5-notice-stat-delay">PERSONAL MAINTENANCE SCHEDULE:</p>
      <p class="d5-notice-line d5-notice-line-delay2">and then you'll go and bathe twice a week.</p>
      <p class="d5-notice-annotation d5-notice-annotation-delay">priorities.</p>
    `;
    setTimeout(() => card.querySelector("#d5-waveform").classList.add("is-still"), 2200);
  }

  function renderCargoPants(card) {
    card.innerHTML = `
      <p class="d5-notice-label">FIRST WEEK AT WORK</p>
      <p class="d5-notice-stat">INCIDENT: <b>CARGO PANTS</b></p>
      <div class="d5-stamp d5-stamp-in">SHE THOUGHT IT WAS A JOKE.</div>
      <div class="d5-stamp d5-stamp-warn d5-stamp-in d5-stamp-delay">IT WAS NOT.</div>
    `;
  }

  function renderEngineeringMethod(card) {
    card.innerHTML = `
      <p class="d5-notice-label">ENGINEERING PROBLEM-SOLVING METHOD</p>
      <div class="d5-flow">
        <span>PROBLEM APPEARS</span>
        <span class="d5-flow-arrow">↓</span>
        <span>cry / yell</span>
        <span class="d5-flow-arrow">↓</span>
        <span>complain</span>
        <span class="d5-flow-arrow">↓</span>
        <span class="d5-flow-strong">actually solve the problem</span>
        <span class="d5-flow-arrow">↓</span>
        <span>act like this was obviously the plan</span>
      </div>
      <p class="d5-notice-annotation">ENGINEERING PROCESS: AMIRAH EDITION</p>
    `;
  }

  function renderDreamCar(card) {
    card.innerHTML = `
      <p class="d5-notice-label">DREAM CAR</p>
      <p class="d5-notice-stat">CURRENT STATUS: <b>unaffordable</b></p>
      <p class="d5-notice-handwritten">"no shit, Obinna."</p>
      <div class="d5-stamp d5-stamp-in">STATUS: TEMPORARY.</div>
    `;
  }

  function renderShortObservations(card) {
    card.innerHTML = `
      <p class="d5-notice-label">SHORT OBSERVATIONS</p>
      <p class="d5-notice-quote">"Your face gives you away before your mouth does."</p>
      <p class="d5-notice-quote">"There is always a pre-complaint before the actual solution."</p>
      <p class="d5-notice-quote">"Apparently my brain has allocated permanent storage to Amirah nonsense."</p>
    `;
  }

  function renderOrdinaryObjects(container, done) {
    container.innerHTML = "";
    const head = make("p", "d5-seq-title", "ORDINARY OBJECTS, AFTER AMIRAH");
    container.appendChild(head);
    requestAnimationFrame(() => head.classList.add("is-in"));
    const wrap = make("div", "d5-obj-wrap");
    container.appendChild(wrap);
    const objects = ["a Tuesday", "a notification", "a song", "a stupid screenshot", "a random sentence", "a color", "a streetlight", "something I saw for two seconds"];
    let i = 0;
    function drop() {
      if (i >= objects.length) {
        setTimeout(() => {
          const big = make("p", "d5-seq-big", "You give life to ordinary things.");
          container.appendChild(big);
          requestAnimationFrame(() => big.classList.add("is-in"));
        }, 700);
        return;
      }
      const chip = make("span", "d5-obj d5-obj-" + i, objects[i]);
      wrap.appendChild(chip);
      requestAnimationFrame(() => chip.classList.add("is-in"));
      i++;
      const t = setTimeout(drop, 750);
      advanceSequence = () => {
        clearTimeout(t);
        advanceSequence = null;
        drop();
      };
    }
    drop();
  }

  function renderHairFile(container) {
    container.innerHTML = `
      <p class="d5-seq-title is-in">THE HAIR FILE</p>
      <div class="d5-hair-card">
        <div class="d5-hair-end d5-hair-then">
          <p class="d5-hair-desc">brown. long. ridiculously beautiful.</p>
          <p class="d5-hair-line">I knew you there.</p>
        </div>
        <div class="d5-hair-thread" id="d5-hair-thread"></div>
        <div class="d5-hair-end d5-hair-later">
          <p class="d5-hair-desc">grey. someday.</p>
          <p class="d5-hair-line">I intend to know you there too.</p>
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      const els = container.querySelectorAll(".d5-hair-then, .d5-hair-thread, .d5-hair-later");
      els.forEach((e, i) => setTimeout(() => e.classList.add("is-in"), i * 500));
    });
  }

  function renderColorAnalysis(container, done) {
    container.innerHTML = `
      <p class="d5-seq-title is-in">COLOR ANALYSIS</p>
      <div class="d5-color-stage" id="d5-color-stage">
        <p class="d5-color-word" id="d5-color-word"></p>
      </div>
    `;
    const stage = container.querySelector("#d5-color-stage");
    const wordEl = container.querySelector("#d5-color-word");
    const colors = [
      ["blue", "#3B5BFF"],
      ["pink", "#F0B8C6"],
      ["yellow", "#F3C15F"],
      ["red", "#8C1F2B"],
      ["green", "#2E9E6B"],
      ["violet", "#7B5FBE"],
    ];
    let i = 0;
    function cycle() {
      if (i >= colors.length) {
        stage.style.background = "";
        wordEl.textContent = "ERROR: ONE COLOR INSUFFICIENT";
        wordEl.className = "d5-color-word d5-color-error";
        setTimeout(() => {
          stage.classList.add("is-burst");
          setTimeout(() => {
            const line = make("p", "d5-seq-big", "You are annoyingly difficult to make monochrome.");
            container.appendChild(line);
            requestAnimationFrame(() => line.classList.add("is-in"));
            const small = make("p", "d5-seq-small", "good.");
            container.appendChild(small);
            requestAnimationFrame(() => small.classList.add("is-in"));
          }, 900);
        }, 900);
        return;
      }
      const [name, hex] = colors[i];
      wordEl.textContent = name;
      wordEl.className = "d5-color-word is-in";
      stage.style.background = `radial-gradient(circle at 50% 40%, ${hex}55, transparent 70%)`;
      i++;
      setTimeout(cycle, 620);
    }
    cycle();
  }

  function renderSpiritAnimal(container, done) {
    container.innerHTML = `
      <p class="d5-seq-title is-in">SPIRIT ANIMAL ANALYSIS</p>
      <p class="d5-notice-stat is-in">Processing…</p>
      <div class="d5-spirit-stage" id="d5-spirit-stage"></div>
    `;
    const stage = container.querySelector("#d5-spirit-stage");
    const rounds = [
      { label: "CAT?", cat: true },
      { label: "FOX?", cat: false },
      { label: "BUTTERFLY?", cat: false },
    ];
    let i = 0;
    function next() {
      if (i >= rounds.length) {
        setTimeout(() => {
          stage.innerHTML = "";
          const word = make("p", "d5-fail-word d5-spirit-final", "UNICORN.");
          stage.appendChild(word);
          requestAnimationFrame(() => word.classList.add("is-in"));
          stage.classList.add("is-iridescent");
          setTimeout(() => {
            const small = make("p", "d5-seq-small is-in", "obviously.");
            stage.appendChild(small);
          }, 900);
        }, 900);
        return;
      }
      const r = rounds[i++];
      stage.innerHTML = "";
      const word = make("p", "d5-fail-word", r.label);
      stage.appendChild(word);
      requestAnimationFrame(() => word.classList.add("is-in"));
      if (r.cat) {
        const catEl = make("span", "d5-spirit-cat", "🐈");
        stage.appendChild(catEl);
        setTimeout(() => catEl.classList.add("is-offended"), 500);
      }
      setTimeout(() => {
        const stamp = make("div", "d5-stamp d5-stamp-warn d5-stamp-in", "Rejected.");
        stage.appendChild(stamp);
        setTimeout(next, 1000);
      }, 800);
    }
    next();
  }

  function renderUnclassified(container) {
    container.innerHTML = `
      <p class="d5-seq-title is-in">UNCLASSIFIED</p>
      <p class="d5-seq-line is-in">Filed here because it didn't fit anywhere else.</p>
      <p class="d5-seq-line is-in">She still calls it "sha sha." The archive has given up trying to translate it.</p>
      <div class="d5-unclass-cat" id="d5-unclass-cat">🐈</div>
      <p class="d5-notice-annotation is-in" id="d5-unclass-line">the archivist refuses to vacate this drawer.</p>
    `;
    const cat = container.querySelector("#d5-unclass-cat");
    cat.addEventListener("click", () => {
      cat.classList.add("is-nudged");
      container.querySelector("#d5-unclass-line").textContent = "still hasn't moved.";
      setTimeout(() => cat.classList.remove("is-nudged"), 500);
    });
  }

  /* ============================================================
     Building and opening the 21-drawer wall.
     ============================================================ */
  function buildWall() {
    const wall = el("d5-wall");
    wall.innerHTML = "";
    DRAWERS.forEach((d, i) => {
      const btn = make("button", "d5-drawer d5-drawer-c" + (i % 5));
      btn.type = "button";
      btn.dataset.i = String(i);
      btn.innerHTML = `<span class="d5-drawer-num">${i + 1}</span><span class="d5-drawer-label">${d.label.replace(/\n/g, "<br>")}</span><span class="d5-drawer-handle"></span>`;
      btn.addEventListener("click", () => openDrawer(i));
      wall.appendChild(btn);
      if (i === 16) {
        // Drawer 17 (index 16): the archivist is asleep in here.
        const sleepingCat = make("span", "d5-drawer-cat", "🐈");
        btn.appendChild(sleepingCat);
      }
    });
  }

  function openDrawer(i) {
    const d = DRAWERS[i];
    const scrim = el("d5-panel-scrim");
    const panel = el("d5-panel");
    const body = el("d5-panel-body");
    body.innerHTML = "";
    panel.className = "d5-panel";
    panel.classList.add("d5-anim-" + ANIMS[i % ANIMS.length]);
    if (d.big) panel.classList.add("d5-panel-big");
    scrim.hidden = false;
    requestAnimationFrame(() => {
      scrim.classList.add("is-in");
      requestAnimationFrame(() => panel.classList.add("is-in"));
    });

    if (!openedDrawers.has(i)) {
      openedDrawers.add(i);
      el("d5-wall").children[i].classList.add("is-opened");
      maybeShowStrain();
    }

    if (d.custom) {
      d.custom(body, () => {});
    } else {
      playSequence(body, d.steps, {});
    }
  }

  function closeDrawer() {
    const scrim = el("d5-panel-scrim");
    const panel = el("d5-panel");
    panel.classList.remove("is-in");
    scrim.classList.remove("is-in");
    advanceSequence = null;
    setTimeout(() => (scrim.hidden = true), 400);
  }

  function maybeShowStrain() {
    if (strainShown) return;
    if (openedDrawers.size < 6) return;
    strainShown = true;
    const strain = el("d5-strain");
    strain.hidden = false;
    requestAnimationFrame(() => strain.classList.add("is-in"));
  }

  /* ============================================================
     STAGE 2 — word storm. The archive starts losing its grip on
     its own classifications.
     ============================================================ */
  function startWordStorm() {
    setStage(2);
    const host = el("d5-storm");
    host.hidden = false;
    host.innerHTML = "";
    const words = [
      "engineer", "student", "daughter", "dreamer", "soft", "stubborn", "brilliant", "imperfect",
      "colorful", "curious", "restless", "deliberate", "growing", "trying", "learning", "laughing",
      "becoming", "transparent", "dedicated", "resilient", "complicated", "lovable", "unrepeatable",
      "21", "Amirah",
    ];
    const styles = ["flash", "stamp", "handwritten", "crossed"];
    words.forEach((w, i) => {
      setTimeout(() => {
        const s = styles[Math.floor(Math.random() * styles.length)];
        const span = make("span", "d5-storm-word d5-storm-" + s, w);
        span.style.left = 8 + Math.random() * 80 + "%";
        span.style.top = 8 + Math.random() * 78 + "%";
        span.style.setProperty("--rot", Math.random() * 16 - 8 + "deg");
        host.appendChild(span);
        requestAnimationFrame(() => span.classList.add("is-in"));
        setTimeout(() => span.classList.add("is-fading"), 1800 + Math.random() * 600);
        setTimeout(() => span.remove(), 2600);
      }, i * 180);
    });
    setTimeout(startFailure, words.length * 180 + 2600);
  }

  /* ============================================================
     STAGE 3 — the archive admits it can't file her.
     ============================================================ */
  function startFailure() {
    setStage(3);
    el("d5-storm").hidden = true;
    const host = el("d5-failure");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));

    // A stray card gets nocked to the floor — the archivist's doing.
    const knocked = make("div", "d5-knocked-card");
    host.appendChild(knocked);
    setTimeout(() => knocked.classList.add("is-fallen"), 500);

    setTimeout(() => el("d5-failure-title").classList.add("is-in"), 900);
    setTimeout(() => el("d5-failure-reason").classList.add("is-in"), 1800);

    const pairs = [
      ["soft", "stubborn"],
      ["certain", "still learning"],
      ["imperfect", "deeply lovable"],
      ["engineer", "dreamer"],
      ["21", "nowhere near finished"],
    ];
    const wrap = el("d5-contradictions");
    pairs.forEach((p, i) => {
      setTimeout(() => {
        const row = make("p", "d5-contra", `${p[0]} <span class="d5-contra-slash">/</span> ${p[1]}`);
        wrap.appendChild(row);
        requestAnimationFrame(() => row.classList.add("is-in"));
      }, 2800 + i * 700);
    });

    setTimeout(startFinal, 2800 + pairs.length * 700 + 1800);
  }

  /* ============================================================
     STAGE 4 — everything clears. One card. Her name.
     ============================================================ */
  function typewriter(el2, text, cb) {
    let i = 0;
    el2.textContent = "";
    const caret = make("span", "d5-caret");
    el2.appendChild(document.createTextNode(""));
    function tick() {
      if (i >= text.length) {
        el2.appendChild(caret);
        if (cb) setTimeout(cb, 700);
        return;
      }
      el2.textContent = text.slice(0, i + 1);
      i++;
      setTimeout(tick, 130);
    }
    tick();
  }

  function startFinal() {
    setStage(4);
    el("d5-failure").hidden = true;
    const host = el("d5-final");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));

    setTimeout(() => {
      typewriter(el("d5-typed"), "AMIRAH", () => {
        const linesHost = el("d5-final-lines");
        const seq = [
          { type: "pause", ms: 900 },
          { type: "line", text: "Maybe that's the problem." },
          { type: "pause", ms: 500 },
          { type: "line", text: "I kept trying to find better words for you." },
          { type: "pause", ms: 700 },
          { type: "line", text: "not just pretty. → someone who gives life to ordinary things." },
          { type: "line", text: "not just kind. → someone whose smallest actions stay with me." },
          { type: "line", text: "not just important. → someone who changed the texture of ordinary days." },
          { type: "line", text: "not just my girlfriend." },
          { type: "pause", ms: 1000 },
        ];
        playSequence(linesHost, seq, {
          onDone: () => {
            el("d5-final-card").classList.add("is-fading");
            setTimeout(() => {
              const big = el("d5-final-big");
              big.hidden = false;
              requestAnimationFrame(() => big.classList.add("is-in"));
              setTimeout(startPayoff, 4200);
            }, 700);
          },
        });
      });
    }, 900);
  }

  /* ============================================================
     STAGE 5 — the archive returns, warm and open.
     ============================================================ */
  function startPayoff() {
    setStage(5);
    el("d5-final").hidden = true;
    const host = el("d5-payoff");
    host.hidden = false;
    requestAnimationFrame(() => host.classList.add("is-in"));

    const wallEl = el("d5-payoff-wall");
    wallEl.innerHTML = "";
    for (let i = 0; i < 21; i++) {
      wallEl.appendChild(make("span", "d5-payoff-drawer"));
    }
    requestAnimationFrame(() => wallEl.classList.add("is-in"));

    setTimeout(() => el("d5-cat").classList.add("is-in"), 900);
    setTimeout(() => el("d5-payoff-line1").classList.add("is-in"), 1800);
    setTimeout(() => el("d5-payoff-line2").classList.add("is-in"), 3600);
    setTimeout(() => el("d5-status").classList.add("is-in"), 5000);
    setTimeout(() => {
      const stamp = el("d5-stamp-keepopen");
      stamp.classList.add("is-in");
    }, 5800);
    setTimeout(() => {
      el("d5-back").hidden = false;
      requestAnimationFrame(() => el("d5-back").classList.add("is-in"));
      if (onDoneCb) onDoneCb();
    }, 7000);
  }

  /* ============================================================
     Markup + wiring
     ============================================================ */
  function buildHTML() {
    return `
      <div class="d5-scene" id="d5-scene" data-stage="0">

        <div class="d5-opening" id="d5-opening">
          <p class="d5-eyebrow">DAY 5</p>
          <h2 class="d5-open-title">THE AMIRAH INDEX</h2>
          <div class="d5-tag-row" id="d5-tags"></div>
          <p class="d5-open-line" id="d5-open-line1">I don't know if I have ever explained you properly.</p>
          <div class="d5-fail-stage" id="d5-fail-stage"></div>
          <button type="button" class="d5-continue" id="d5-continue" hidden>open the archive</button>
        </div>

        <div class="d5-archive" id="d5-archive" hidden>
          <p class="d5-archive-kicker">THE AMIRAH INDEX</p>
          <p class="d5-archive-sub">21 drawers. open a few.</p>
          <div class="d5-wall" id="d5-wall"></div>
          <div class="d5-strain" id="d5-strain" hidden>
            <p class="d5-strain-line">the archive is starting to strain.</p>
            <button type="button" class="d5-strain-btn" id="d5-strain-btn">let it try.</button>
          </div>
        </div>

        <div class="d5-panel-scrim" id="d5-panel-scrim" hidden>
          <div class="d5-panel" id="d5-panel">
            <button type="button" class="d5-panel-close" id="d5-panel-close" aria-label="close">×</button>
            <div class="d5-panel-body" id="d5-panel-body"></div>
          </div>
        </div>

        <div class="d5-storm" id="d5-storm" hidden></div>

        <div class="d5-failure" id="d5-failure" hidden>
          <p class="d5-failure-title" id="d5-failure-title">CLASSIFICATION FAILED</p>
          <p class="d5-failure-reason" id="d5-failure-reason">REASON: SUBJECT EXCEEDS AVAILABLE CATEGORIES</p>
          <div class="d5-contradictions" id="d5-contradictions"></div>
        </div>

        <div class="d5-final" id="d5-final" hidden>
          <div class="d5-index-card" id="d5-final-card">
            <p class="d5-typed" id="d5-typed"></p>
          </div>
          <div class="d5-final-lines" id="d5-final-lines"></div>
          <p class="d5-final-big" id="d5-final-big" hidden>Amirah.</p>
        </div>

        <div class="d5-payoff" id="d5-payoff" hidden>
          <div class="d5-payoff-wall" id="d5-payoff-wall"></div>
          <div class="d5-cat" id="d5-cat">🐈</div>
          <p class="d5-payoff-line1" id="d5-payoff-line1">Twenty-one years, and you're still becoming someone nobody has finished meeting yet.</p>
          <p class="d5-payoff-line2" id="d5-payoff-line2">I see you, and I love you.</p>
          <p class="d5-status" id="d5-status">FILE STATUS: STILL BECOMING</p>
          <div class="d5-stamp d5-stamp-keepopen" id="d5-stamp-keepopen">KEEP OPEN.</div>
          <button type="button" class="d5-back" id="d5-back" hidden>← back to the seven days</button>
        </div>

      </div>`;
  }

  function render(container, opts) {
    root = container;
    onDoneCb = (opts && opts.onDone) || null;
    stage = 0;
    openedDrawers.clear();
    strainShown = false;
    advanceSequence = null;

    root.innerHTML = buildHTML();
    sceneEl = el("d5-scene");

    buildWall();
    runOpening();

    el("d5-continue").addEventListener("click", () => {
      const opening = el("d5-opening");
      opening.classList.add("is-leaving");
      setTimeout(() => {
        opening.hidden = true;
        setStage(1);
        const archive = el("d5-archive");
        archive.hidden = false;
        requestAnimationFrame(() => archive.classList.add("is-in"));
      }, 600);
    });

    el("d5-panel-close").addEventListener("click", closeDrawer);
    el("d5-panel-scrim").addEventListener("click", (e) => {
      if (e.target === el("d5-panel-scrim")) closeDrawer();
    });
    // Tapping inside a drawer's content skips its current wait —
    // lets her move at her own pace instead of only mine.
    el("d5-panel-body").addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      if (advanceSequence) advanceSequence();
    });

    el("d5-strain-btn").addEventListener("click", () => {
      el("d5-strain").classList.add("is-leaving");
      closeDrawer();
      const archive = el("d5-archive");
      setTimeout(() => {
        archive.classList.add("is-leaving");
        setTimeout(() => {
          archive.hidden = true;
          startWordStorm();
        }, 700);
      }, 300);
    });

    el("d5-back").addEventListener("click", () => {
      const closeBtn = document.getElementById("day-overlay-close");
      if (closeBtn) closeBtn.click();
    });
  }

  return { render };
})();
