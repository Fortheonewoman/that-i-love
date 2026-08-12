/* ============================================================
   Act 4 — wrapped. Spotify-Wrapped format: one idea per card, huge
   type, tap to advance, each card a different colour from the
   seven-day palette, progress dots.

   PLACEHOLDER TEXT: the real cards (the year, the inside jokes, the
   numbers) get swapped in once that content exists — just replace
   the `text` strings in CARDS below, nothing else changes.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act4 = (function () {
  const CARDS = [
    { text: "This year, with you —", color: "#C0142B" },
    { text: "[a number worth bragging about]", color: "#FF6F59" },
    { text: "[an inside joke goes here]", color: "#E8A33D" },
    { text: "[another one]", color: "#A8447E" },
    { text: "[something only the two of you would get]", color: "#2FA89C" },
    { text: "[one more]", color: "#6C63FF" },
    { text: "happy birthday, Amirachi", color: "#E63E8C", final: true },
  ];

  let idx = 0;
  let clickHandler = null;

  function render(container, go) {
    const card = CARDS[idx];
    container.innerHTML = `
      <div class="act4-stage" style="--card-color:${card.color}">
        <div class="act4-progress">
          ${CARDS.map((_, i) => `<span class="act4-dot ${i <= idx ? "is-done" : ""}"></span>`).join("")}
        </div>
        <div class="act4-card">
          <p class="act4-text">${card.text}</p>
        </div>
        ${card.final ? "" : `<p class="act4-tap-hint">tap to continue</p>`}
      </div>`;

    clickHandler = () => {
      if (idx < CARDS.length - 1) {
        idx++;
        render(container, go);
      } else {
        go(5);
      }
    };
    container.querySelector(".act4-stage").addEventListener("click", clickHandler);
  }

  return {
    async enter({ container, go }) {
      idx = 0;
      render(container, go);
    },
    exit() {},
    skip() {
      Birthday.goToAct(5);
    },
  };
})();
