/* ============================================================
   Movement I — Midnight. The world is almost empty. A timestamp.
   Two tiny lines. The cat wakes the room up, and as it does, the
   whole week's visual vocabulary quietly returns — a thread, a
   drawn line, a star, a stamp, a wash of colour — before the first
   real photograph of her earns its own held moment.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m1 = (function () {
  "use strict";
  const { el, make, Cat, photoFrame, drawThread, playSequence } = window.FinaleCore;

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
  let seq = null;

  function buildHTML() {
    return `
      <div class="fin-m1" id="fin-m1">
        <div class="fin-grain" aria-hidden="true"></div>
        <div class="fin-haze" aria-hidden="true"></div>

        <div class="fin-m1-mast" id="fin-m1-mast">
          <p class="fin-m1-date" id="fin-m1-date">AUGUST 20</p>
          <p class="fin-m1-time" id="fin-m1-time">00:00</p>
          <p class="fin-m1-place" id="fin-m1-place">ARLINGTON, TEXAS</p>
        </div>

        <div class="fin-m1-lines" id="fin-m1-lines"></div>

        <div class="fin-m1-lights" id="fin-m1-lights">
          <span class="fin-m1-light" id="fin-m1-light-1"></span>
          <span class="fin-m1-light" id="fin-m1-light-2"></span>
        </div>

        <h1 class="fin-m1-amirah" id="fin-m1-amirah" hidden>AMIRAH</h1>
        <p class="fin-m1-21" id="fin-m1-21" hidden>21</p>

        <div class="fin-m1-callbacks" id="fin-m1-callbacks"></div>

        <div class="fin-m1-photo-slot" id="fin-m1-photo-slot" hidden></div>
        <p class="fin-m1-there" id="fin-m1-there" hidden>there you are.</p>
      </div>`;
  }

  /* ---- the room wakes up: a thread, a line, a star, a stamp, colour ---- */
  function worldRemembers(container, done) {
    const host = el("fin-m1-callbacks");
    host.hidden = false;
    const stage = el("fin-m1");

    // Day 2 — a loose red thread the cat pulls, travelling across.
    Cat.moveTo(30, 58, 900);
    after(500, () => {
      Cat.paw();
      const thread = drawThread(host, 15, 60, 85, 55, { duration: 1500, bow: 4 });
      thread.classList.add("fin-callback-thread");
    });

    // Day 3 — an engineering line sketches itself.
    after(1900, () => {
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

    // Day 4 — a star glints, once.
    after(3000, () => {
      const star = make("span", "fin-callback-star", "✦");
      star.style.left = "68%";
      star.style.top = "24%";
      host.appendChild(star);
      requestAnimationFrame(() => star.classList.add("is-in"));
      after(1600, () => star.classList.add("is-fading"));
    });

    // Day 5 — an archival stamp, half a second.
    after(4000, () => {
      const stamp = make("p", "fin-callback-stamp", "SUBJECT: AMIRAH");
      host.appendChild(stamp);
      requestAnimationFrame(() => stamp.classList.add("is-in"));
      after(1200, () => stamp.classList.add("is-fading"));
    });

    // Day 6 — colour leaks into the room.
    after(4900, () => {
      stage.classList.add("is-colored");
    });

    after(6600, done);
  }

  function showFirstPhoto(container, done) {
    const slot = el("fin-m1-photo-slot");
    slot.hidden = false;
    const frame = photoFrame({ role: "portrait", treatment: "print" });
    slot.appendChild(frame);
    requestAnimationFrame(() => slot.classList.add("is-in"));
    after(1400, () => {
      const line = el("fin-m1-there");
      line.hidden = false;
      requestAnimationFrame(() => line.classList.add("is-in"));
    });
    after(4200, done);
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();

      after(1400, () => el("fin-m1-mast").classList.add("is-in"));

      const lineHost = el("fin-m1-lines");
      after(3600, () => {
        seq = playSequence(lineHost, [
          { type: "line", text: "oh." },
          { type: "pause", ms: 500 },
          { type: "line", text: "you're here." },
          { type: "pause", ms: 900 },
        ]);
      });

      after(7200, () => {
        Cat.show();
        Cat.moveTo(50, 62, 1100);
      });
      after(8400, () => {
        Cat.lookOffscreen();
        el("fin-m1-light-1").classList.add("is-in");
      });
      after(9200, () => {
        Cat.paw();
        Cat.stopLooking();
      });
      after(9800, () => el("fin-m1-light-2").classList.add("is-in"));
      after(10600, () => Cat.sit());

      after(11800, () => {
        const a = el("fin-m1-amirah");
        a.hidden = false;
        requestAnimationFrame(() => a.classList.add("is-in"));
      });
      after(13600, () => {
        const n = el("fin-m1-21");
        n.hidden = false;
        requestAnimationFrame(() => n.classList.add("is-in"));
      });

      after(15600, () => {
        el("fin-m1-mast").classList.add("is-fading");
        lineHost.classList.add("is-fading");
        el("fin-m1-amirah").classList.add("is-settled");
        el("fin-m1-21").classList.add("is-settled");
        el("fin-m1-lights").classList.add("is-fading");
        Cat.stand();
        // mast/lines are normal flex-column items (unlike the rest of
        // this scene, which is absolutely positioned) — hard-hide once
        // faded so they stop occupying vertical flex space.
        after(800, () => {
          el("fin-m1-mast").hidden = true;
          lineHost.hidden = true;
        });
        worldRemembers(container, () => {
          showFirstPhoto(container, () => go(2));
        });
      });
    },
    exit() {
      clearTimers();
      if (seq) seq.cancel();
      Cat.reset();
    },
    skip() {
      clearTimers();
      if (seq) seq.cancel();
      Cat.reset();
      Birthday.goToMovement(2);
    },
  };
})();
