/* ============================================================
   Movement I — The Sky. Individual hand-painted-style cartoon
   clouds drift, pass behind each other, and clear off in their own
   time (never a symmetric two-panel gate). The cat balances on one,
   nearly loses it, recovers. When the sky is clear: the fuse is lit
   for Movement II's explosion.
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

  // Each cloud: a cluster of overlapping circles (the classic
  // "chunky cumulus" silhouette), a size, a depth (near/mid/far —
  // controls scale, blur, speed and z-order), a start position, and
  // which way + how far it exits.
  const CLOUDS = [
    { id: "c0", depth: "near", x: 8, y: 18, scale: 1.5, exitX: -60, exitY: -10, delay: 0 },
    { id: "c1", depth: "mid", x: 78, y: 10, scale: 1.1, exitX: 40, exitY: -30, delay: 300 },
    { id: "c2", depth: "far", x: 40, y: 8, scale: 0.7, exitX: 10, exitY: -50, delay: 600 },
    { id: "c3", depth: "mid", x: 90, y: 55, scale: 1.2, exitX: 55, exitY: 20, delay: 200 },
    { id: "c4", depth: "near", x: -5, y: 62, scale: 1.6, exitX: -50, exitY: 25, delay: 900 },
    { id: "c5", depth: "far", x: 60, y: 30, scale: 0.6, exitX: 25, exitY: -35, delay: 1200 },
    { id: "c6", depth: "mid", x: 20, y: 75, scale: 1.0, exitX: -35, exitY: 35, delay: 700 },
    { id: "c7", depth: "near", x: 55, y: 85, scale: 1.4, exitX: 20, exitY: 45, delay: 1500 },
    { id: "c8", depth: "far", x: 5, y: 40, scale: 0.65, exitX: -25, exitY: -20, delay: 1000 },
  ];

  function cloudSvg(cloud) {
    // A chunky irregular cumulus silhouette built from overlapping
    // circles — soft hand-painted feel, blue-grey underside, not a
    // realistic/gradient/foggy cloud.
    return `
      <svg class="fin-cloud" viewBox="0 0 220 120" style="--scale:${cloud.scale}" aria-hidden="true">
        <ellipse cx="110" cy="90" rx="90" ry="18" fill="#B9CFE0" opacity="0.55"/>
        <g fill="#FFFFFF">
          <circle cx="55" cy="70" r="38"/>
          <circle cx="95" cy="48" r="46"/>
          <circle cx="140" cy="55" r="42"/>
          <circle cx="175" cy="72" r="32"/>
          <circle cx="115" cy="80" r="40"/>
          <circle cx="70" cy="85" r="30"/>
        </g>
        <g fill="#E7EFF6">
          <circle cx="60" cy="90" r="20"/>
          <circle cx="120" cy="92" r="26"/>
          <circle cx="165" cy="88" r="18"/>
        </g>
      </svg>`;
  }

  function buildHTML() {
    return `
      <div class="fin-m1" id="fin-m1">
        <div class="fin-sky" id="fin-sky">
          ${CLOUDS.map(
            (c) => `
            <div class="fin-cloud-wrap fin-cloud-${c.depth}" id="fin-${c.id}" style="left:${c.x}%; top:${c.y}%;">
              ${cloudSvg(c)}
            </div>`
          ).join("")}
        </div>
      </div>`;
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = buildHTML();
      const sky = el("fin-sky");

      // A settled beat of just sky and drifting clouds first — this
      // is the fuse, not instant chaos.
      after(600, () => {
        Cat.show();
        Cat.moveTo(8, 20, 0);
        Cat.sit();
      });
      after(1800, () => Cat.paw()); // wobble as its cloud drifts under it
      after(2600, () => Cat.moveTo(40, 10, 900)); // recovers, hops to another cloud
      after(3600, () => Cat.sit());

      // Each cloud independently exits on its own schedule — never
      // symmetric, never "two halves."
      CLOUDS.forEach((c) => {
        after(2200 + c.delay, () => {
          const node = el("fin-" + c.id);
          if (!node) return;
          node.style.setProperty("--exit-x", c.exitX + "vw");
          node.style.setProperty("--exit-y", c.exitY + "vh");
          node.classList.add("is-leaving");
        });
      });

      after(4600, () => {
        Cat.moveTo(85, 15, 1400); // last cloud out — cat rides it off too
        Cat.stand();
      });

      after(5600, () => go(2));
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
