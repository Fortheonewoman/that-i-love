/* ============================================================
   Act 8 — the peeper stops running. He turns around: it's Obinna,
   for real, voice and all, over the last of her photos. Then the
   song rises and act 9 begins. Happens regardless of whether she
   ever caught him earlier — nobody can miss this by being bad at
   clicking.

   PLACEHOLDER: audio/voice-note.mp3 and the finale photos aren't in
   yet. If the file 404s, this act falls back to a fixed hold so the
   sequence still flows — swap the real file in later, nothing else
   changes.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act8 = (function () {
  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  let audioEl = null;

  return {
    async enter({ container, go, ctx }) {
      container.innerHTML = `
        <div class="act8-stage">
          <div class="act8-photos"></div>
          <div class="act8-figure" id="act8-figure"></div>
          <p class="act8-caption" id="act8-caption"></p>
        </div>`;

      const figureSlot = container.querySelector("#act8-figure");
      const caption = container.querySelector("#act8-caption");
      const figure = Cast.makeFigure({ name: "obinna", expression: "delighted", colorVar: "var(--accent)", size: 96 });
      figure.classList.add("act8-obinna", ctx.peeperCaughtBeforeAct8 || Cast.hasCaughtPeeper() ? "already-turned" : "turning");
      figureSlot.appendChild(figure);
      requestAnimationFrame(() => figure.classList.add("is-in"));

      Cast.stopPeeper();

      after(400, () => {
        caption.textContent = "it's him.";
        caption.classList.add("is-shown");
      });

      audioEl = new Audio("audio/voice-note.mp3");
      audioEl.preload = "auto";
      let advanced = false;
      const advance = () => {
        if (advanced) return;
        advanced = true;
        go(9);
      };
      audioEl.addEventListener("ended", advance);
      audioEl.addEventListener("error", () => after(4000, advance));
      after(1200, () => {
        audioEl.play().catch(() => after(4000, advance));
      });
      // Safety net regardless of audio outcome — never leave her stuck.
      after(15000, advance);
    },
    exit() {
      clearTimers();
      if (audioEl) {
        audioEl.pause();
        audioEl = null;
      }
    },
    skip() {
      clearTimers();
      if (audioEl) audioEl.pause();
      Birthday.goToAct(9);
    },
  };
})();
