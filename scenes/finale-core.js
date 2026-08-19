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
     BOOM — Day 8's recurring signature. The huge version (the
     detonation itself) is hand-built where it's used; this is only
     the SMALL, subtle recurring mark — a corner stamp, a transition
     flicker — that gets sprinkled through the rest of the day so it
     reads as a maker's mark, never a logo plastered over every frame.
     opts: { corner: "br"|"bl"|"tr"|"tl" (default "br"), holdMs, color }
     Appends itself, fades in, fades out and removes itself. Caller
     doesn't need to clean up.
     ------------------------------------------------------------ */
  function boomStamp(parent, opts) {
    opts = opts || {};
    const corner = opts.corner || "br";
    const stamp = make("span", `fin-boom-stamp fin-boom-${corner}`, "BOOM.");
    if (opts.color) stamp.style.color = opts.color;
    parent.appendChild(stamp);
    requestAnimationFrame(() => stamp.classList.add("is-in"));
    setTimeout(() => {
      stamp.classList.remove("is-in");
      setTimeout(() => stamp.remove(), 700);
    }, opts.holdMs || 1600);
    return stamp;
  }

  return { el, make, Cat, photoFrame, pickPhoto, videoFrame, pickVideo, drawThread, readTime, playSequence, boomStamp };
})();
