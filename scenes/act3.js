/* ============================================================
   Act 3 — the names. "My Amirah" held alone, then the other names
   cascade (read from Birthday.ctx.names, so more can be added
   without touching this file), tempo increasing, type scaling with
   the pace. Ends on "Amirachi", held still.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act3 = (function () {
  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  return {
    async enter({ container, go, ctx }) {
      container.innerHTML = `
        <div class="act3-stage">
          <h1 class="act3-name" id="act3-name">My Amirah</h1>
        </div>`;
      const nameEl = container.querySelector("#act3-name");

      const cascade = [...ctx.names, "Amirachi"];
      let t = 900; // hold "My Amirah" first

      cascade.forEach((name, i) => {
        const isLast = i === cascade.length - 1;
        after(t, () => {
          nameEl.textContent = name;
          nameEl.classList.remove("is-pop");
          void nameEl.offsetWidth;
          nameEl.classList.add("is-pop");
          if (isLast) nameEl.classList.add("is-final");
        });
        // tempo increases: each gap a bit shorter than the last
        const gap = Math.max(160, 420 - i * 60);
        t += gap;
      });

      after(t + 1400, () => go(4));
      container.addEventListener("click", () => go(4));
    },
    exit() {
      clearTimers();
    },
    skip() {
      clearTimers();
      Birthday.goToAct(4);
    },
  };
})();
