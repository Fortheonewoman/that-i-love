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
        <defs>
          <linearGradient id="sky-${cls}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a9d8f5"/>
            <stop offset="100%" stop-color="#6fb8e8"/>
          </linearGradient>
          <filter id="soft-${cls}" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>
        <rect width="400" height="800" fill="url(#sky-${cls})"/>
        <g fill="#ffffff" filter="url(#soft-${cls})" opacity="0.96">
          <ellipse class="drift drift-a" cx="120" cy="180" rx="140" ry="68"/>
          <ellipse class="drift drift-a" cx="260" cy="152" rx="108" ry="52"/>
          <ellipse class="drift drift-b" cx="100" cy="420" rx="158" ry="76"/>
          <ellipse class="drift drift-b" cx="280" cy="458" rx="118" ry="56"/>
          <ellipse class="drift drift-c" cx="150" cy="680" rx="148" ry="70"/>
          <ellipse class="drift drift-c" cx="300" cy="642" rx="98" ry="46"/>
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
