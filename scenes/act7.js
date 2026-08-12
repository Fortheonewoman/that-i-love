/* ============================================================
   Act 7 — three questions. The point isn't the question, it's that
   the site was already built around her answer. Free-text, always
   generously matched — an answer we don't recognise still gets a
   warm reply and moves on. Never a retry loop.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act7 = (function () {
  const COLOR_WORDS = {
    red: "#C0142B", pink: "#E63E8C", magenta: "#E63E8C", rose: "#C0142B",
    blue: "#3a6cff", navy: "#2233aa", teal: "#2FA89C", turquoise: "#2FA89C",
    green: "#2f9e5c", purple: "#7b3fe4", violet: "#6C63FF", indigo: "#6C63FF",
    orange: "#E8A33D", gold: "#E8A33D", yellow: "#e8c93d", coral: "#FF6F59",
    black: "#333333", white: "#e9e9e9",
  };
  function colorFromAnswer(text) {
    const t = text.toLowerCase();
    for (const word in COLOR_WORDS) {
      if (t.includes(word)) return COLOR_WORDS[word];
    }
    return "#E63E8C"; // charming default if we don't recognise the word
  }

  const QUESTIONS = [
    {
      key: "chosenColor",
      prompt: "what's your favourite colour?",
      after(container, answer, ctx) {
        const hex = colorFromAnswer(answer);
        ctx.chosenColor = hex;
        document.documentElement.style.setProperty("--accent", hex);
        return "I know. That's why day four was that colour.";
      },
    },
    {
      key: "favouriteFood",
      prompt: "what's your favourite food?",
      after(container, answer, ctx) {
        ctx.favouriteFood = answer;
        return `noted. ${answer} is being talked about for the rest of the night.`;
      },
    },
    {
      key: "stateAnswer",
      prompt: "which state are you in, right now?",
      after(container, answer, ctx) {
        ctx.stateAnswer = answer;
        return "DISTANCE"; // signal to render the distance visual instead of text
      },
    },
  ];

  let idx = 0;

  function renderDistance(container, go) {
    container.innerHTML = `
      <div class="act7-stage act7-distance">
        <div class="act7-distance-row">
          <span class="act7-city">Lagos</span>
          <span class="act7-distance-number" id="act7-distance-number">8,419 mi</span>
          <span class="act7-city">${QUESTIONS[2].answerText || "Arlington"}</span>
        </div>
      </div>`;
    const numEl = container.querySelector("#act7-distance-number");
    const start = 8419;
    const duration = 1800;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(start * (1 - eased));
      numEl.textContent = val === 0 ? "together" : val.toLocaleString() + " mi";
      if (t < 1) requestAnimationFrame(step);
      else setTimeout(() => go(8), 900);
    }
    requestAnimationFrame(step);
  }

  function renderQuestion(container, go, ctx) {
    const q = QUESTIONS[idx];
    container.innerHTML = `
      <div class="act7-stage">
        <h2 class="act7-prompt">${q.prompt}</h2>
        <form class="act7-form" id="act7-form" autocomplete="off">
          <input type="text" class="act7-input" id="act7-input" placeholder="type your answer…" />
          <button type="submit" class="act7-submit">→</button>
        </form>
        <p class="act7-reply" id="act7-reply"></p>
      </div>`;
    const input = container.querySelector("#act7-input");
    const form = container.querySelector("#act7-form");
    const replyEl = container.querySelector("#act7-reply");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const answer = input.value.trim() || "…";
      q.answerText = answer;
      const reply = q.after(container, answer, ctx);
      if (reply === "DISTANCE") {
        renderDistance(container, go);
        return;
      }
      replyEl.textContent = reply;
      form.querySelector("button").disabled = true;
      input.disabled = true;
      setTimeout(() => {
        idx++;
        if (idx < QUESTIONS.length) renderQuestion(container, go, ctx);
      }, 1400);
    });
  }

  return {
    async enter({ container, go, ctx }) {
      idx = 0;
      renderQuestion(container, go, ctx);
    },
    exit() {},
    skip() {
      Birthday.goToAct(8);
    },
  };
})();
