/* ============================================================
   Act 1 — the clouds. Bright sky settles in, clouds part to reveal
   HAPPY BIRTHDAY, holds, swipes off into act 2. Original type,
   original sky, no Simpsons references — just the mechanic.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act1 = (function () {
  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function cloudSvg(cls) {
    return `
      <svg class="cloud-panel ${cls}" viewBox="0 0 400 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="800" fill="#7ec8f2"/>
        <g fill="#ffffff">
          <ellipse class="drift drift-a" cx="120" cy="180" rx="140" ry="70"/>
          <ellipse class="drift drift-a" cx="260" cy="150" rx="110" ry="55"/>
          <ellipse class="drift drift-b" cx="100" cy="420" rx="160" ry="80"/>
          <ellipse class="drift drift-b" cx="280" cy="460" rx="120" ry="60"/>
          <ellipse class="drift drift-c" cx="150" cy="680" rx="150" ry="75"/>
          <ellipse class="drift drift-c" cx="300" cy="640" rx="100" ry="50"/>
        </g>
      </svg>`;
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = `
        <div class="act1-stage">
          <div class="cloud-side cloud-left">${cloudSvg("panel-left")}</div>
          <div class="cloud-side cloud-right">${cloudSvg("panel-right")}</div>
          <h1 class="act1-title">HAPPY<br/>BIRTHDAY</h1>
        </div>`;

      const stage = container.querySelector(".act1-stage");
      const left = container.querySelector(".cloud-left");
      const right = container.querySelector(".cloud-right");

      // A beat of just sky and drifting clouds first.
      after(1000, () => {
        left.classList.add("is-parted");
        right.classList.add("is-parted");
      });
      // Parting itself takes ~1.1s (see CSS), then a real hold on
      // the title before it swipes away.
      after(3000, () => {
        stage.classList.add("is-swiping");
      });
      after(3900, () => go(2));
    },
    exit() {
      clearTimers();
    },
    skip() {
      clearTimers();
      Birthday.goToAct(2);
    },
  };
})();
