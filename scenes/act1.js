/* ============================================================
   Act 1 — the clouds. Bright sky, clouds part fast to reveal
   HAPPY BIRTHDAY, holds barely a beat, swipes off. Abrupt is the
   point — original type, original sky, no Simpsons references.
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

      // Parting is quick.
      after(500, () => {
        left.classList.add("is-parted");
        right.classList.add("is-parted");
      });
      // The hold is short.
      after(1300, () => {
        stage.classList.add("is-swiping");
      });
      // Immediate drop into act 2.
      after(1750, () => go(2));
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
