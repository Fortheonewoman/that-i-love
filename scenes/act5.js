/* ============================================================
   Act 5 — the password. "Do you want to continue?" then a password
   field. Answer: i love obinna (matched very forgivingly — see
   normalize()). She always gets through eventually; the ladder of
   hints below just gets her there faster. Wrong guesses are never
   scolded, only charmed. Escalation every ~5s, per the ADHD-aware
   pacing rule — nothing sits idle longer than that.
   ============================================================ */
window.Acts = window.Acts || {};
window.Acts.act5 = (function () {
  const ANSWER = "iloveobinna";
  const CHARMED_REPLIES = [
    "close — but not quite the password to my heart",
    "cute guess. still no.",
    "not it, but I like where your head's at",
    "nope. try aiming it at someone specific 👀",
  ];

  let timers = [];
  function after(ms, fn) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function normalize(s) {
    return s.toLowerCase().replace(/[^a-z]/g, "");
  }

  return {
    async enter({ container, go }) {
      container.innerHTML = `
        <div class="act5-stage floral-decor">
          <div class="act5-watermark" id="act5-watermark" aria-hidden="true">OBINNA</div>
          <h1 class="act5-question">Do you want to continue?</h1>
          <p class="act5-hint" id="act5-hint"></p>
          <form class="act5-form" id="act5-form" autocomplete="off">
            <input type="password" id="act5-input" class="act5-input" placeholder="type here…" />
            <button type="submit" class="act5-submit">continue</button>
          </form>
          <p class="act5-reply" id="act5-reply"></p>
          <button type="button" class="act5-anyway" id="act5-anyway" hidden>let me in anyway</button>
        </div>`;

      const input = container.querySelector("#act5-input");
      const form = container.querySelector("#act5-form");
      const hintEl = container.querySelector("#act5-hint");
      const replyEl = container.querySelector("#act5-reply");
      const watermarkEl = container.querySelector("#act5-watermark");
      const anywayBtn = container.querySelector("#act5-anyway");

      let solved = false;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (solved) return;
        if (normalize(input.value) === ANSWER) {
          solved = true;
          replyEl.textContent = "there she is.";
          after(700, () => go(6));
        } else {
          replyEl.textContent = CHARMED_REPLIES[Math.floor(Math.random() * CHARMED_REPLIES.length)];
        }
      });

      anywayBtn.addEventListener("click", () => {
        if (solved) return;
        solved = true;
        go(6);
      });

      // ---- escalating hint ladder, ~5s apart ----
      after(5000, () => {
        input.placeholder = "starts with 'i love'…";
      });
      after(10000, () => {
        hintEl.textContent = "three words. the last one is a name.";
      });
      after(15000, () => {
        watermarkEl.classList.add("is-shown");
      });
      after(20000, () => {
        if (solved || input.value) return;
        const full = "i love obinna";
        let i = 0;
        const typer = setInterval(() => {
          if (solved) return clearInterval(typer);
          input.value = full.slice(0, ++i);
          if (i >= full.length) clearInterval(typer);
        }, 90);
        timers.push(typer);
      });
      after(25000, () => {
        if (!solved) anywayBtn.hidden = false;
      });
    },
    exit() {
      clearTimers();
    },
    skip() {
      clearTimers();
      Birthday.goToAct(6);
    },
  };
})();
