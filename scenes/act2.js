/* ============================================================
   Act 2 — the flood. Her photos arrive from all edges, overlapping,
   each landing with a slight rotation, in a rhythm (not all at
   once). Then "you are soooo beautiful" comes up over them.

   PLACEHOLDER: no real photos yet, so this renders tinted cards
   instead. Once img/flood/ has real files, swap PLACEHOLDER_COUNT
   below for a real filename list — nothing else about the timing
   or layout needs to change.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act2 = (function () {
  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  const PLACEHOLDER_COUNT = 14;

  return {
    async enter({ container, go }) {
      container.innerHTML = `
        <div class="act2-stage floral-decor">
          <div class="flood-field" id="flood-field"></div>
          <h1 class="act2-title" id="act2-title">you are soooo beautiful</h1>
        </div>`;

      const field = container.querySelector("#flood-field");
      const title = container.querySelector("#act2-title");
      const edges = ["from-top", "from-right", "from-bottom", "from-left"];

      for (let i = 0; i < PLACEHOLDER_COUNT; i++) {
        after(220 * i, () => {
          const card = document.createElement("div");
          card.className = `flood-card ${edges[i % edges.length]}`;
          const rot = Math.round((Math.random() - 0.5) * 30);
          const x = 10 + Math.random() * 80;
          const y = 10 + Math.random() * 80;
          card.style.setProperty("--rot", rot + "deg");
          card.style.left = x + "%";
          card.style.top = y + "%";
          card.innerHTML = `<div class="flood-card-inner"></div>`;
          field.appendChild(card);
          requestAnimationFrame(() => card.classList.add("is-landed"));
        });
      }

      // A pause, then the line.
      after(220 * PLACEHOLDER_COUNT + 900, () => {
        title.classList.add("is-shown");
      });
      after(220 * PLACEHOLDER_COUNT + 3600, () => go(3));

      container.addEventListener("click", () => go(3));
    },
    exit() {
      clearTimers();
    },
    skip() {
      clearTimers();
      Birthday.goToAct(3);
    },
  };
})();
