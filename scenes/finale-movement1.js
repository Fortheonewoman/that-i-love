/* ============================================================
   Movement I — The Balloon. No music, anywhere. The rhythm here is
   built entirely from stillness, motion, and one huge beat:

     midnight lands → silence → one balloon rises → she taps it →
     it pops (her interaction, never automatic) → a split-second of
     black → BOOM → the whole thing detonates into Movement II.

   Same darkness Day 7's countdown ended on — this isn't a hard cut
   to a new document, it's the next thing that happens in that same
   sky. The balloon itself is hand-drawn SVG (glossy body, highlight,
   knot, string) — never an emoji, never clip-art.
   ============================================================ */
window.Movements = window.Movements || {};
window.Movements.m1 = (function () {
  "use strict";
  const { el, make, Cat } = window.FinaleCore;

  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  // Neutral celebratory red — she hasn't told us her favorite color
  // yet (that's Movement III), so this is a composition choice, not
  // a guess at personal meaning. Later balloons/confetti/light in
  // this same session can inherit her real answer once she gives it.
  const BALLOON_COLOR = "#C81E3A";
  const BALLOON_HILITE = "#F3E3E6";

  function balloonSvg() {
    return `
      <svg class="fin-balloon-svg" viewBox="0 0 160 220" aria-hidden="true">
        <path class="fin-balloon-string" d="M80,196 C70,206 90,214 80,220"/>
        <path d="M80,168 L70,182 L90,182 Z" fill="${BALLOON_COLOR}"/>
        <ellipse cx="80" cy="92" rx="66" ry="82" fill="${BALLOON_COLOR}"/>
        <ellipse cx="56" cy="58" rx="20" ry="28" fill="${BALLOON_HILITE}" opacity="0.55"/>
        <ellipse cx="48" cy="48" rx="8" ry="12" fill="#fff" opacity="0.7"/>
      </svg>`;
  }

  function buildHTML() {
    return `
      <div class="fin-m1" id="fin-m1">
        <div class="fin-m1-stars" aria-hidden="true"></div>
        <div class="fin-balloon-wrap" id="fin-balloon-wrap">
          ${balloonSvg()}
          <p class="fin-balloon-pop-label" id="fin-balloon-pop-label">pop</p>
        </div>
        <div class="fin-blackout" id="fin-blackout"></div>
        <p class="fin-boom-giant" id="fin-boom-giant">BOOM</p>
      </div>`;
  }

  function buildStars(target, count) {
    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * 100).toFixed(2);
      const y = (Math.random() * 100).toFixed(2);
      shadows.push(`${x}vw ${y}vh 0 1px rgba(255,255,255,${(0.35 + Math.random() * 0.5).toFixed(2)})`);
    }
    target.style.boxShadow = shadows.join(",");
  }

  function fragmentBurst(host) {
    const colors = [BALLOON_COLOR, BALLOON_HILITE, "#fff"];
    for (let i = 0; i < 16; i++) {
      const frag = make("span", "fin-balloon-frag");
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 60 + Math.random() * 90;
      frag.style.setProperty("--fx", Math.cos(angle) * dist + "px");
      frag.style.setProperty("--fy", Math.sin(angle) * dist + "px");
      frag.style.setProperty("--frot", Math.random() * 360 + "deg");
      frag.style.setProperty("--dur", 500 + Math.random() * 300 + "ms");
      frag.style.width = frag.style.height = 3 + Math.random() * 5 + "px";
      frag.style.left = "50%";
      frag.style.top = "45%";
      frag.style.background = colors[i % colors.length];
      host.appendChild(frag);
      setTimeout(() => frag.remove(), 900);
    }
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      buildStars(container.querySelector(".fin-m1-stars"), 90);

      const wrap = el("fin-balloon-wrap");
      const popLabel = el("fin-balloon-pop-label");
      const blackout = el("fin-blackout");
      const boomEl = el("fin-boom-giant");

      let popped = false;
      let catPeeked = false;

      // Silence first — nothing moves for a beat. Then the balloon
      // rises on its own, gently, and starts bobbing once it settles.
      after(650, () => {
        wrap.classList.add("is-risen");
      });
      after(3900, () => {
        wrap.classList.add("is-bobbing");
        popLabel.classList.add("is-in");
      });

      // If she doesn't tap right away, the cat wanders over and
      // peeks — pure company, it never touches the balloon.
      after(9000, () => {
        if (popped || catPeeked) return;
        catPeeked = true;
        Cat.show();
        Cat.moveTo(68, 66, 1400);
        after(1500, () => Cat.sit());
        after(2600, () => Cat.paw());
      });

      function onPop() {
        if (popped) return;
        popped = true;
        wrap.removeEventListener("click", onPop);
        wrap.removeEventListener("touchend", onPop);
        Cat.hide();

        wrap.classList.add("is-popping");
        popLabel.classList.remove("is-in");
        after(140, () => {
          wrap.classList.add("is-gone");
          fragmentBurst(container.querySelector(".fin-m1"));
        });
        // Split-second of black.
        after(260, () => blackout.classList.add("is-in"));
        // Then the giant BOOM, fast.
        after(420, () => {
          blackout.classList.remove("is-in");
          boomEl.classList.add("is-in");
        });
        after(780, () => boomEl.classList.add("is-breaking"));
        after(1050, () => go(2));
      }
      wrap.addEventListener("click", onPop);
      wrap.addEventListener("touchend", (e) => {
        e.preventDefault();
        onPop();
      });
    },
    exit() {
      clearTimers();
      Cat.reset();
    },
    skip() {
      clearTimers();
      Cat.reset();
      Birthday.goToMovement(2);
    },
  };
})();
