/* ============================================================
   Act 9 — the hug. No dialogue, no type on screen. They walk in
   from opposite edges, stop, hold five full seconds of nothing but
   the song, she drops her helmet, they close the gap and hug, the
   screen bleeds crimson around their silhouette, and confetti starts
   falling — forever, through the replay, never turning off again.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act9 = (function () {
  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function startConfettiForever() {
    const layer = document.getElementById("confetti-layer");
    if (!layer || layer.dataset.running) return;
    layer.dataset.running = "1";
    layer.hidden = false;
    function drop() {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.textContent = "🧡";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.animationDuration = 3.5 + Math.random() * 2.5 + "s";
      piece.style.fontSize = 12 + Math.random() * 14 + "px";
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 6500);
    }
    const spawner = setInterval(drop, 180);
    layer.dataset.spawnerId = spawner;
  }

  function showReplayControls() {
    const el = document.getElementById("replay-controls");
    if (el) el.hidden = false;
  }

  return {
    async enter({ container, go, ctx }) {
      const skipChrome = document.getElementById("act-skip");
      if (skipChrome) skipChrome.hidden = true; // the 5s stillness gets no skip prompt

      container.innerHTML = `
        <div class="act9-stage" id="act9-stage">
          <div class="act9-red" id="act9-red"></div>
          <div class="act9-figures" id="act9-figures">
            <div class="act9-figure act9-her" id="act9-her"></div>
            <div class="act9-figure act9-him" id="act9-him"></div>
          </div>
          <div class="act9-helmet" id="act9-helmet"></div>
        </div>`;

      const herSlot = container.querySelector("#act9-her");
      const himSlot = container.querySelector("#act9-him");
      const stage = container.querySelector("#act9-stage");
      const helmet = container.querySelector("#act9-helmet");

      const her = Cast.makeFigure({ name: "amirah", expression: "neutral", colorVar: "var(--accent)", size: 84 });
      const him = Cast.makeFigure({ name: "obinna", expression: "delighted", colorVar: "var(--accent)", size: 84 });
      her.classList.add("walk-in-left");
      him.classList.add("walk-in-right");
      herSlot.appendChild(her);
      himSlot.appendChild(him);

      requestAnimationFrame(() => {
        her.classList.add("is-in");
        him.classList.add("is-in");
      });

      // They finish walking in around t=1.9s. Then — nothing. Five
      // full seconds of just standing there, just the song. Only
      // after that does the helmet drop.
      after(6900, () => {
        helmet.classList.add("is-visible");
      });
      after(7300, () => {
        helmet.classList.add("is-falling");
      });
      after(8000, () => {
        helmet.classList.add("has-landed");
      });

      after(8300, () => {
        her.classList.add("is-hugging");
        him.classList.add("is-hugging");
        stage.classList.add("is-embracing");
      });

      after(10200, () => {
        container.querySelector("#act9-red").classList.add("is-bleeding");
      });

      after(15000, () => {
        startConfettiForever();
        showReplayControls();
      });
    },
    exit() {
      clearTimers();
      const skipChrome = document.getElementById("act-skip");
      if (skipChrome) skipChrome.hidden = false;
    },
    skip() {
      clearTimers();
      startConfettiForever();
      showReplayControls();
      const red = document.getElementById("act9-red");
      if (red) red.classList.add("is-bleeding");
    },
  };
})();
