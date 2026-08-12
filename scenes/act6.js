/* ============================================================
   Act 6 — the chase, then the coach. The continue button dodges
   the cursor for ~5s (not 20 — chase phase is short on purpose),
   then the coach arrives and it flips into a mash-to-break target:
   every click cracks it more, 8-12 hits and it shatters into act 7.
   No way to fail this — if she stalls, the coach escalates and the
   button starts self-destructing on its own so nobody gets stuck.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act6 = (function () {
  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = `
        <div class="act6-stage" id="act6-stage">
          <p class="act6-caption">do you want to continue?</p>
          <button type="button" class="act6-button" id="act6-button">continue</button>
        </div>`;

      const stage = container.querySelector("#act6-stage");
      const btn = container.querySelector("#act6-button");
      // Persistent layer — the coach lives here so he survives past
      // this act's container getting wiped on the next scene change.
      const castLayer = document.getElementById("birthday-cast-layer");

      let phase = "chase";
      const hitsNeeded = 8 + Math.floor(Math.random() * 5); // 8-12
      let hits = 0;
      let lastClickAt = performance.now(); // UI-local pacing only — not a lock decision, fine to use here

      function place(x, y) {
        const r = stage.getBoundingClientRect();
        const bw = btn.offsetWidth || 140;
        const bh = btn.offsetHeight || 56;
        const cx = Math.min(Math.max(x, bw / 2 + 8), r.width - bw / 2 - 8);
        const cy = Math.min(Math.max(y, bh / 2 + 8), r.height - bh / 2 - 8);
        btn.style.left = cx + "px";
        btn.style.top = cy + "px";
      }
      place(stage.clientWidth / 2, stage.clientHeight / 2);

      function dodge(cursorX, cursorY) {
        const r = stage.getBoundingClientRect();
        const bx = btn.offsetLeft;
        const by = btn.offsetTop;
        let dx = bx - (cursorX - r.left);
        let dy = by - (cursorY - r.top);
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const jump = 140 + Math.random() * 80;
        place(bx + dx * jump + (Math.random() - 0.5) * 60, by + dy * jump + (Math.random() - 0.5) * 60);
      }

      function onMouseMove(e) {
        if (phase !== "chase") return;
        const r = stage.getBoundingClientRect();
        const bx = r.left + btn.offsetLeft;
        const by = r.top + btn.offsetTop;
        const dist = Math.hypot(e.clientX - bx, e.clientY - by);
        if (dist < 130) dodge(e.clientX, e.clientY);
      }
      stage.addEventListener("mousemove", onMouseMove);

      function shake(strength) {
        const root = document.getElementById("birthday");
        root.classList.remove("is-shaking", "is-shaking-hard");
        void root.offsetWidth;
        root.classList.add(strength >= 0.6 ? "is-shaking-hard" : "is-shaking");
        after(400, () => root.classList.remove("is-shaking", "is-shaking-hard"));
      }

      function enterSmashPhase() {
        phase = "smash";
        stage.removeEventListener("mousemove", onMouseMove);
        place(stage.clientWidth / 2, stage.clientHeight / 2);
        btn.classList.add("is-smashable");
        Cast.ensureCoach(castLayer);
        Cast.coachSay("HIT IT. HIT IT. KEEP HITTING IT.");
      }

      function registerHit() {
        hits++;
        lastClickAt = performance.now();
        const frac = hits / hitsNeeded;
        btn.classList.remove("is-crack-1", "is-crack-2", "is-crack-3");
        if (frac > 0.75) btn.classList.add("is-crack-3");
        else if (frac > 0.4) btn.classList.add("is-crack-2");
        else btn.classList.add("is-crack-1");
        shake(frac);

        const lines = ["THERE YOU GO", "AGAIN", "IT'S WORKING", "DON'T STOP", "ALMOST"];
        Cast.coachSay(lines[Math.floor(Math.random() * lines.length)]);

        if (hits >= hitsNeeded) {
          shatter();
        } else {
          place(
            stage.clientWidth / 2 + (Math.random() - 0.5) * 80,
            stage.clientHeight / 2 + (Math.random() - 0.5) * 60
          );
        }
      }

      function shatter() {
        btn.classList.add("is-shattered");
        Cast.coachSay("YOU DID IT.");
        shake(1);
        after(700, () => go(7));
      }

      btn.addEventListener("click", () => {
        if (phase === "chase") {
          // A lucky click during the chase still counts — straight to the coach.
          enterSmashPhase();
        } else if (phase === "smash" && !btn.classList.contains("is-shattered")) {
          registerHit();
        }
      });

      after(5000, () => {
        if (phase === "chase") enterSmashPhase();
      });

      // If she stalls mid-smash, the coach gets outraged and the
      // button helps itself along so nobody's ever stuck.
      const stallCheck = setInterval(() => {
        if (phase !== "smash" || btn.classList.contains("is-shattered")) return;
        if (performance.now() - lastClickAt > 5000) {
          Cast.coachSay("OH COME ON. HIT IT.");
          registerHit(); // guilt-assist
        }
      }, 5000);
      timers.push(stallCheck);
    },
    exit() {
      clearTimers();
    },
    skip() {
      clearTimers();
      Birthday.goToAct(7);
    },
  };
})();
