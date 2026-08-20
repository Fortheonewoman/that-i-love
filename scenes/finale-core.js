/* ============================================================
   finale-core.js — shared machinery for the birthday finale's five
   movements: the cat (one continuous character across all of them,
   living in its own persistent layer so it's never wiped mid-walk
   by a movement change), a photo-frame renderer that degrades
   gracefully when no real photo exists yet, and a couple of small
   visual helpers (thread-drawing, a soft light) reused everywhere
   so the five movements read as one composition instead of five
   separate demos.
   ============================================================ */
window.FinaleCore = (function () {
  "use strict";

  function el(id) {
    return document.getElementById(id);
  }
  function make(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ------------------------------------------------------------
     THE CAT — lives in #finale-cat-layer, which persists across
     every movement (never torn down by movement.exit()). Body
     language only: no speech bubbles, no narration. Every method
     is a physical action — walk, sit, peek, paw, sleep, panic.
     ------------------------------------------------------------ */
  const Cat = (function () {
    let node = null;
    let layer = null;

    function ensure() {
      if (node) return node;
      layer = el("finale-cat-layer");
      node = make("div", "fin-cat", "🐈");
      node.hidden = true;
      layer.appendChild(node);
      return node;
    }

    function show() {
      ensure().hidden = false;
    }
    function hide() {
      if (node) node.hidden = true;
    }

    // Position is in percent of the layer (which covers the full
    // finale viewport), so it reads consistently across movements
    // and screen sizes without each movement doing its own math.
    function moveTo(xPct, yPct, ms) {
      const n = ensure();
      n.hidden = false;
      n.style.transition = `left ${ms || 900}ms var(--fin-ease), top ${ms || 900}ms var(--fin-ease)`;
      n.style.left = xPct + "%";
      n.style.top = yPct + "%";
      n.classList.add("is-walking");
      clearTimeout(n._walkTimer);
      n._walkTimer = setTimeout(() => n.classList.remove("is-walking"), ms || 900);
    }

    function sit() {
      ensure().classList.add("is-sitting");
    }
    function stand() {
      ensure().classList.remove("is-sitting");
    }
    function sleep() {
      ensure().classList.add("is-sleeping");
    }
    function wake() {
      ensure().classList.remove("is-sleeping");
    }
    function paw() {
      const n = ensure();
      n.classList.remove("is-pawing");
      void n.offsetWidth;
      n.classList.add("is-pawing");
    }
    function panic() {
      const n = ensure();
      n.classList.add("is-panicking");
      setTimeout(() => n.classList.remove("is-panicking"), 1400);
    }
    function lookOffscreen() {
      ensure().classList.add("is-looking");
    }
    function stopLooking() {
      ensure().classList.remove("is-looking");
    }
    function reset() {
      if (!node) return;
      node.className = "fin-cat";
      node.hidden = true;
    }

    return { show, hide, moveTo, sit, stand, sleep, wake, paw, panic, lookOffscreen, stopLooking, reset };
  })();

  /* ------------------------------------------------------------
     Photo frame — one consistent renderer for every "show a real
     photo of her" moment across all five movements. If FinaleMedia
     has no entry (or the specific one requested), it renders a
     tasteful photo-free stand-in instead of a broken image or an
     empty box: a soft paper/light composition in the finale's own
     palette, sized the same as a real photo would be. Nothing ever
     looks unfinished.

     opts: { role, treatment, index } — treatment picks the frame
     style ("full" | "print" | "torn" | "circle"); role/index pick
     which media entry to use (see finale-media.js).
     ------------------------------------------------------------ */
  function pickPhoto(role, index) {
    const photos = (window.FinaleMedia && window.FinaleMedia.photos) || [];
    if (!photos.length) return null;
    const byRole = role ? photos.filter((p) => p.role === role) : photos;
    const pool = byRole.length ? byRole : photos;
    return pool[(index || 0) % pool.length];
  }

  function photoFrame(opts) {
    opts = opts || {};
    const treatment = opts.treatment || "print";
    const photo = pickPhoto(opts.role, opts.index);
    const frame = make("div", `fin-photo fin-photo-${treatment}` + (photo ? "" : " fin-photo-empty"));
    if (photo) {
      const img = make("img", "fin-photo-img");
      img.src = photo.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      // "circle" treatment has its own fixed 1:1 aspect-ratio in CSS —
      // overriding it with the source's native ratio would stretch the
      // circle into an oval, so only apply the real ratio otherwise.
      if (photo.w && photo.h && treatment !== "circle") frame.style.aspectRatio = `${photo.w} / ${photo.h}`;
      // A photo that fails to load degrades to the same soft
      // stand-in as "no photo yet" — never a broken-image icon.
      img.addEventListener("error", () => {
        img.remove();
        frame.classList.add("fin-photo-empty");
      });
      frame.appendChild(img);
    } else {
      frame.style.aspectRatio = opts.emptyRatio || "4 / 5";
    }
    return frame;
  }

  /* ------------------------------------------------------------
     Same idea as photoFrame, for the handful of real video clips —
     silent, autoplaying, looping, no controls (these are ambient
     visual beats, not something she has to press play on). Degrades
     the same way: no clip for that role yet → the same soft empty
     stand-in, never a broken player.
     ------------------------------------------------------------ */
  function pickVideo(role, index) {
    const videos = (window.FinaleMedia && window.FinaleMedia.videos) || [];
    if (!videos.length) return null;
    const byRole = role ? videos.filter((v) => v.role === role) : videos;
    const pool = byRole.length ? byRole : videos;
    return pool[(index || 0) % pool.length];
  }

  function videoFrame(opts) {
    opts = opts || {};
    const treatment = opts.treatment || "print";
    const video = pickVideo(opts.role, opts.index);
    const frame = make("div", `fin-photo fin-photo-${treatment}` + (video ? "" : " fin-photo-empty"));
    if (video) {
      const vid = document.createElement("video");
      vid.className = "fin-photo-img";
      vid.src = video.src;
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      if (video.w && video.h && treatment !== "circle") frame.style.aspectRatio = `${video.w} / ${video.h}`;
      vid.addEventListener("error", () => {
        vid.remove();
        frame.classList.add("fin-photo-empty");
      });
      frame.appendChild(vid);
    } else {
      frame.style.aspectRatio = opts.emptyRatio || "4 / 5";
    }
    return frame;
  }

  /* ------------------------------------------------------------
     A thread that draws itself between two points (percent coords
     of its parent), reused for the Day-2 callback and, later, the
     "two pieces of the composition pulled together" merge. Returns
     the <svg> so a caller can restyle/remove it.
     ------------------------------------------------------------ */
  function drawThread(parent, x1, y1, x2, y2, opts) {
    opts = opts || {};
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "fin-thread");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    parent.appendChild(svg);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const mx = (x1 + x2) / 2 + (opts.bow || 0);
    const my = (y1 + y2) / 2 + (opts.bow ? -6 : 0);
    path.setAttribute("d", `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
    path.setAttribute("class", "fin-thread-path");
    svg.appendChild(path);
    const len = path.getTotalLength();
    path.style.strokeDasharray = len + " " + len;
    path.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${opts.duration || 1400}ms var(--fin-ease)`;
      path.style.strokeDashoffset = "0";
    });
    return svg;
  }

  /* ------------------------------------------------------------
     A small "sequencer" shared by all five movements — identical
     contract to the one used on Days 5 and 6, so the same reading-
     time discipline applies here: delay scales with sentence length,
     never a flat number regardless of how much there is to read.
     ------------------------------------------------------------ */
  function readTime(text) {
    const words = (text || "").trim().split(/\s+/).filter(Boolean).length || 1;
    return Math.max(1900, Math.min(5200, 700 + words * 340));
  }

  function playSequence(container, steps, opts) {
    opts = opts || {};
    let cancelled = false;
    let i = 0;
    let advance = null;

    function stepEl(step) {
      if (step.type === "title") return make("p", "fin-seq-title", step.text);
      if (step.type === "big") return make("p", "fin-seq-big", step.text);
      if (step.type === "line") return make("p", "fin-seq-line", step.text);
      if (step.type === "small") return make("p", "fin-seq-small", step.text);
      return null;
    }

    function runNext() {
      if (cancelled) return;
      if (i >= steps.length) {
        if (opts.onDone) opts.onDone();
        return;
      }
      const step = steps[i++];
      if (step.type === "pause") {
        advance = () => {
          advance = null;
          runNext();
        };
        setTimeout(() => advance && advance(), step.ms || 1100);
        return;
      }
      if (step.type === "custom") {
        step.run(container, () => {
          if (!cancelled) runNext();
        });
        return;
      }
      const e = stepEl(step);
      if (e) {
        container.appendChild(e);
        requestAnimationFrame(() => e.classList.add("is-in"));
      }
      const delay = step.ms || readTime(step.text);
      advance = () => {
        advance = null;
        runNext();
      };
      setTimeout(() => advance && advance(), delay);
    }

    runNext();
    return {
      cancel() {
        cancelled = true;
        advance = null;
      },
      skip() {
        if (advance) advance();
      },
    };
  }

  /* ------------------------------------------------------------
     FIREWORKS — a real canvas particle system, not a CSS sprite
     sheet: rockets launch from low on screen, climb with a slight
     drift and gravity, then burst into 40–70 radiating particles
     that fade and fall. This is Day 8's actual recurring signature —
     used liberally across the whole day (the opening explosion, the
     montage, favorite color, the final celebration), never a
     constant background loop.

     Fireworks.mount(container) creates one canvas sized to its
     parent and returns a handle:
       .launch({ x, y, color, count }) — x/y in 0–1 fractions of the
         canvas (y is the BURST height, not the launch point — the
         rocket always launches from the bottom edge).
       .burstAt(xPct, yPct, opts) — an instant burst with no rocket
         climb, for confetti-adjacent flourishes.
       .stop() — clears all particles/rockets, keeps the canvas.
       .destroy() — stops and removes the canvas entirely.
     Auto-pauses its rAF loop when nothing is animating (no idle
     redraw cost between fireworks), and never runs more than one
     loop per canvas no matter how many times launch() is called.
     ------------------------------------------------------------ */
  const Fireworks = (function () {
    function mount(container, opts) {
      opts = opts || {};
      const canvas = document.createElement("canvas");
      canvas.className = "fin-fireworks-canvas";
      container.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      let w = 0,
        h = 0,
        dpr = Math.min(window.devicePixelRatio || 1, 2);

      function resize() {
        const rect = container.getBoundingClientRect();
        w = Math.max(1, rect.width);
        h = Math.max(1, rect.height);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
      if (ro) ro.observe(container);

      let rockets = [];
      let particles = [];
      let rafId = null;
      let destroyed = false;

      const DEFAULT_COLORS = ["#f3c15f", "#ff2e88", "#3d7fff", "#dfe4ee", "#6c3fd6"];

      function spawnBurst(x, y, color, count) {
        const n = count || 55;
        for (let i = 0; i < n; i++) {
          const angle = (Math.PI * 2 * i) / n + Math.random() * 0.3;
          const speed = 1.4 + Math.random() * 2.6;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.008 + Math.random() * 0.012,
            color,
            size: 1.4 + Math.random() * 1.8,
          });
        }
        ensureLoop();
      }

      function launch(launchOpts) {
        launchOpts = launchOpts || {};
        const color = launchOpts.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
        const targetX = (launchOpts.x != null ? launchOpts.x : 0.2 + Math.random() * 0.6) * w;
        const targetY = (launchOpts.y != null ? launchOpts.y : 0.25 + Math.random() * 0.25) * h;
        rockets.push({
          x: targetX + (Math.random() * 40 - 20),
          y: h + 10,
          targetY,
          vy: -(6.5 + Math.random() * 2.5),
          color,
          count: launchOpts.count,
          trail: [],
        });
        ensureLoop();
      }

      function burstAt(xPct, yPct, burstOpts) {
        burstOpts = burstOpts || {};
        spawnBurst(xPct * w, yPct * h, burstOpts.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)], burstOpts.count);
      }

      function ensureLoop() {
        if (rafId == null && !destroyed) rafId = requestAnimationFrame(tick);
      }

      function tick() {
        rafId = null;
        if (destroyed) return;
        ctx.clearRect(0, 0, w, h);

        rockets = rockets.filter((r) => {
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 6) r.trail.shift();
          r.y += r.vy;
          r.vy += 0.06;
          const reached = r.vy >= 0 || r.y <= r.targetY;
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = 0.6;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          r.trail.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
          ctx.stroke();
          ctx.globalAlpha = 1;
          if (reached) {
            spawnBurst(r.x, r.y, r.color, r.count);
            return false;
          }
          return true;
        });

        particles = particles.filter((p) => {
          p.life -= p.decay;
          if (p.life <= 0) return false;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.045;
          p.vx *= 0.985;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });
        ctx.globalAlpha = 1;

        if (rockets.length || particles.length) rafId = requestAnimationFrame(tick);
      }

      function stop() {
        rockets = [];
        particles = [];
        ctx.clearRect(0, 0, w, h);
        if (rafId != null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }

      function destroy() {
        destroyed = true;
        stop();
        if (ro) ro.disconnect();
        canvas.remove();
      }

      return { launch, burstAt, stop, destroy, canvas };
    }

    return { mount };
  })();

  /* ------------------------------------------------------------
     DISCO — a light layer (rotating beams + a small mirror ball +
     twinkling glints), pure CSS/DOM, appended to a container and
     removable as one unit. opts: { beams (default 5), glints
     (default 14), color } — color lets a later scene tint the beams
     toward her chosen favorite color instead of the neutral default.
     ------------------------------------------------------------ */
  function discoLayer(container, opts) {
    opts = opts || {};
    const layer = make("div", "fin-disco-layer");
    const beamCount = opts.beams || 5;
    for (let i = 0; i < beamCount; i++) {
      const beam = make("div", "fin-disco-beam");
      beam.style.setProperty("--beam-color", opts.color || ["#f3c15f", "#ff2e88", "#3d7fff", "#6c3fd6"][i % 4]);
      // Slow, ambient sweeps — this is background atmosphere, not
      // something that should read as spinning or hectic.
      beam.style.setProperty("--beam-dur", 13 + Math.random() * 9 + "s");
      beam.style.setProperty("--beam-delay", -(Math.random() * 10) + "s");
      layer.appendChild(beam);
    }
    if (opts.ball !== false) layer.appendChild(make("div", "fin-disco-ball"));
    const glintCount = opts.glints != null ? opts.glints : 14;
    for (let i = 0; i < glintCount; i++) {
      const glint = make("span", "fin-disco-glint");
      glint.style.left = Math.random() * 100 + "%";
      glint.style.top = Math.random() * 100 + "%";
      glint.style.setProperty("--glint-dur", 3.2 + Math.random() * 3.2 + "s");
      glint.style.setProperty("--glint-delay", -(Math.random() * 5) + "s");
      glint.style.setProperty("--glint-peak", 0.4 + Math.random() * 0.5);
      layer.appendChild(glint);
    }
    container.appendChild(layer);
    return layer;
  }

  return { el, make, Cat, photoFrame, pickPhoto, videoFrame, pickVideo, drawThread, readTime, playSequence, Fireworks, discoLayer };
})();
