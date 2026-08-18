/* ============================================================
   Day 7 — the letter. Not the generic title/photo/poem template
   every other non-illustrated day uses: this is the one real, long,
   handwritten thing the whole week has been walking toward, so it
   gets its own bespoke treatment.

   His exact words, verbatim, one line per line — no line invented,
   none reordered, none softened, no explanation tacked onto a line
   that already lands on its own. It ends on the line it's supposed
   to end on and nothing follows it.

   A slow star-wars-style crawl: the text drifts up and away into a
   starfield at a deliberately unhurried pace (this is the one thing
   on the whole site that should NOT feel rushed), but she can always
   scroll or drag it herself if she wants to move faster or re-read a
   line — the auto-drift just yields to her for a few seconds and
   picks back up from wherever she left it.

   When the last line has scrolled fully away, the sky holds empty
   for a moment, then the site's own trusted countdown — same
   window.TimeLock everything else on this site reads, never a
   separate weaker clock — fades in to walk her the rest of the way
   to her actual birthday.

   This is birthday eve (Day 7 unlocks midnight Arlington, Aug 19).
   The birthday itself belongs to Day 8 — nothing here says it.
   ============================================================ */
window.Day7Scene = (function () {
  "use strict";

  // Exact text. Preserved line-for-line — the line breaks are the
  // rhythm, not just wrapping, so each entry is its own line, never
  // reflowed into a paragraph.
  const LINES = [
    "ALL I WRITE IS YOU",
    "How can I go a birthday without writing for you?",
    "How can I go silent when all I write is you?",
    "And it is by design that we gon always have issues,",
    "cos two people becoming one",
    "will always have some things to undo.",
    "But who was there beside me",
    "in all the things I've been through?",
    "Who saw the good,",
    "who saw the ugly,",
    "who saw me confused,",
    "and somehow still saw me?",
    "You.",
    "And I know love isn't perfect.",
    "I know sometimes it's heavy.",
    "Sometimes it's distance.",
    "Sometimes it's patience.",
    "Sometimes it's two people saying the right thing",
    "at the wrong time.",
    "But genuine is genuine.",
    "And I'll always know the difference.",
    "Oshe Oluwa.",
    "Because when I really think about us,",
    "God was doing too much behind the scenes.",
    "Different places.",
    "Different people.",
    "Different situations.",
    "He kept arranging scenario after scenario,",
    "like He had already made the meeting foolproof.",
    "Like,",
    "“No matter what these two idiots do,",
    "they will still somehow meet.”",
    "And then we did.",
    "And somehow,",
    "you became somebody I can't imagine",
    "not having met.",
    "Oshe Amirah.",
    "I look at you in awe.",
    "Amirah mi.",
    "Abike mi.",
    "Eniobanke.",
    "Iwuri mi.",
    "My Yorubaddie.",
    "Ofu ayam.",
    "Nnem oma.",
    "Iyamomo.",
    "See what you've done to me.",
    "I'm mixing languages just to find enough ways",
    "to call you mine.",
    "I'll preach your word to all my sisters",
    "after we close the distance.",
    "A lot of things to be with you.",
    "We could pick,",
    "we could choose.",
    "A lot of places to go.",
    "A lot of things we haven't done.",
    "A lot of memories still waiting",
    "for somebody to make them.",
    "Cos one thing I know is true—",
    "I can never go wrong with you.",
    "And that's not me saying",
    "we'll never get it wrong.",
    "It's me saying",
    "even when we do,",
    "I still want to get it right with you.",
    "That's different.",
    "Where my white can color you,",
    "and your light can color me.",
    "A life that feels like ours.",
    "Not perfect.",
    "Just real.",
    "I'll have my eyes on you,",
    "yours on me as it should.",
    "A forum gi naya.",
    "And it's unconditional.",
    "Real proof that God is good.",
    "The destiny we choose.",
    "Cos we started from the bottom",
    "and the top still in view.",
    "The plans I have for you—",
    "and these are just a few.",
    "I want to see you win.",
    "Not just in money.",
    "I want to see you win in peace.",
    "In purpose.",
    "In faith.",
    "In the things nobody claps for.",
    "I want to see you become",
    "more you,",
    "not more what everybody expects.",
    "Because the only thing permanent is change.",
    "And if you're going to change anyway,",
    "change into somebody",
    "your younger self would be proud to name.",
    "I pray you do.",
    "I pray you get manna,",
    "no more dollar déjà vu.",
    "I pray your money comes clean",
    "and stays plenty.",
    "I pray your mind gets quieter,",
    "your heart gets lighter,",
    "and the things that used to shake you",
    "don't shake you like they used to.",
    "I pray you become calmer.",
    "No more carrying every problem",
    "like you were born to fight the whole world.",
    "I pray you love God",
    "the way God loves you.",
    "And if you see God in me,",
    "love me and trust me to the core.",
    "Not because I'm perfect.",
    "You know I'm not.",
    "But because I'm trying.",
    "And I'll keep trying.",
    "I pray your life stays aligned with God.",
    "You'll never be lined in chalk.",
    "And if your mind becomes a storm,",
    "I pray it always finds its way back to shore.",
    "I pray for your family.",
    "I pray for your dreams.",
    "I pray for the things you don't tell me about.",
    "The silent ones.",
    "The ones you smile through.",
    "The ones that make you say",
    "“I'm fine”",
    "when you're really not.",
    "Because someone was crying.",
    "And maybe nobody knew.",
    "But God did.",
    "And I pray He remembers every tear",
    "you never let anybody see.",
    "I pray your joy becomes louder",
    "than the things that hurt you.",
    "I pray your laughter comes easy.",
    "I pray you never lose your softness",
    "just because the world wasn't always soft with you.",
    "And I pray that when life gets confusing,",
    "you never forget who you are.",
    "Because I know who you are.",
    "At least,",
    "I'm lucky enough to know some of her.",
    "And I'm still learning the rest.",
    "That's the beautiful part.",
    "So change.",
    "Grow.",
    "Live.",
    "Surprise yourself.",
    "Just don't ever think",
    "you have to stop being you",
    "to become better.",
    "And I'll be here,",
    "watching you do it.",
    "Oshe idagba.",
    "I'll surely write.",
    "I'll surely write when you're older.",
    "I'll surely write when your life looks nothing",
    "like it does today.",
    "I'll surely write when the things we prayed for",
    "are sitting right in front of us.",
    "I'll surely write till your hair outgrows mine.",
    "And if I run out of paper,",
    "I'll find another page.",
    "If I run out of pages,",
    "I'll find another way.",
    "Because my heart's job is to pump,",
    "but you make it smile.",
    "And that's a serious thing.",
    "So serious",
    "that I still don't know",
    "how to write it properly.",
    "Maybe that's why I keep writing.",
    "Not because I have nothing else to say,",
    "but because every time I think",
    "I've said enough,",
    "I remember you,",
    "and suddenly enough",
    "doesn't feel like enough.",
    "I could write about your smile.",
    "Your stubbornness.",
    "Your little attitude.",
    "The way you can make me laugh",
    "without even trying.",
    "The way you can annoy me",
    "and still somehow be my favorite person",
    "to talk to five minutes later.",
    "I could write about the little things",
    "you probably don't even know I notice.",
    "But I'd rather keep some of those",
    "between me and God.",
    "Some things don't need an audience.",
    "Some things are just mine",
    "to be grateful for.",
    "And I'm grateful.",
    "Privileged, actually.",
    "Privileged that I get to know you.",
    "Privileged that I get to love you.",
    "Privileged that somehow,",
    "out of all the scenarios God could've arranged,",
    "He arranged one",
    "where I met you.",
    "Oshe Oluwa.",
    "Oshe Amirah.",
    "Oshe idagba.",
    "Thank you God for grace.",
    "For the girl.",
    "For the woman.",
    "For the heart.",
    "For the madness.",
    "For the prayers.",
    "For every version of you",
    "I've had the privilege to meet.",
    "And for every version",
    "I haven't met yet.",
    "May God keep you.",
    "May He guide you.",
    "May He bless you beyond what you ask for.",
    "May He give you peace that money can't buy,",
    "wisdom that age can't teach,",
    "and joy that nobody can destroy.",
    "And when the story gets long,",
    "when the years start adding up,",
    "when we're looking back at everything",
    "we once thought was impossible,",
    "I hope we remember this version of us.",
    "The one still figuring it out.",
    "The one still praying.",
    "The one still dreaming.",
    "The one still writing.",
    "And if you ever ask me",
    "why I wrote so much for your birthday,",
    "I'll tell you the truth.",
    "Because how could I go a birthday",
    "without writing for you?",
    "How could I go silent",
    "when all I write is you?",
    "And if one thing remains true",
    "through every change,",
    "every season,",
    "every view—",
    "I can never go wrong with you.",
    "Not because everything with you",
    "will always go right.",
    "But because loving you",
    "has never required me",
    "to pretend we're perfect.",
    "I know the person I'm choosing.",
    "The soft parts.",
    "The stubborn parts.",
    "The changing parts.",
    "The parts still figuring themselves out.",
    "And somehow,",
    "after all the words,",
    "all the prayers,",
    "all the distance,",
    "all the things we've had to understand,",
    "I still end up here.",
    "Writing you.",
    "Thinking you.",
    "Praying for you.",
    "Thanking God for you.",
    "And loving you.",
    "From now",
    "till burial.",
    "Not as the ending.",
    "Life is too long for me to act like",
    "I've already written ours.",
    "There's still too much left.",
    "Too much you haven't become.",
    "Too much I haven't learned.",
    "Too many versions of Amirah",
    "I haven't had the privilege to meet yet.",
    "So I'll surely write.",
    "Again.",
    "And again.",
    "And when another birthday comes,",
    "I'll probably still be here,",
    "trying to explain something",
    "that refuses to fit properly inside words.",
    "Because how can I go a birthday",
    "without writing for you?",
    "When all I write",
    "is you.",
    "Now go and wait for your birthday, guy.",
  ];

  // ~7 minutes for the full unassisted drift — deliberately slower
  // than normal reading speed for 1,382 words of scrolling, tilted
  // text (harder to read than flat text, and this one deserves the
  // extra time) but not so long it's impractical; she can always
  // scroll it herself if she wants to move at her own pace.
  const CRAWL_SECONDS = 420;

  function el(id) {
    return document.getElementById(id);
  }

  let tickInterval = null;
  let rafId = null;

  function buildStars(target, count, sizePx) {
    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * 100).toFixed(2);
      const y = (Math.random() * 100).toFixed(2);
      shadows.push(`${x}vw ${y}vh 0 ${sizePx}px rgba(255,255,255,${(0.35 + Math.random() * 0.5).toFixed(2)})`);
    }
    target.style.boxShadow = shadows.join(",");
  }

  function formatDigits(ms) {
    if (ms <= 0) return "00 : 00 : 00 : 00";
    const totalSec = Math.floor(ms / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d)} : ${p(h)} : ${p(m)} : ${p(s)}`;
  }

  function render(container, opts) {
    if (tickInterval) clearInterval(tickInterval);
    if (rafId) cancelAnimationFrame(rafId);
    const onDoneCb = (opts && opts.onDone) || null;

    container.innerHTML = `
      <div class="d7-scene" id="d7-scene">
        <div class="d7-stars-far" aria-hidden="true"></div>
        <div class="d7-stars-near" aria-hidden="true"></div>
        <div class="d7-vanish-glow" aria-hidden="true"></div>
        <div class="d7-crawl-stage" id="d7-crawl-stage">
          <div class="d7-crawl-tilt">
            <div class="d7-crawl" id="d7-crawl">
              ${LINES.map((l) => `<p class="d7-line">${l}</p>`).join("")}
            </div>
          </div>
        </div>
        <div class="d7-countdown" id="d7-countdown" hidden>
          <p class="d7-countdown-label">Birthday in:</p>
          <p class="d7-countdown-digits" id="d7-countdown-digits">— : — : — : —</p>
        </div>
      </div>`;

    buildStars(container.querySelector(".d7-stars-far"), 90, 1);
    buildStars(container.querySelector(".d7-stars-near"), 46, 2);

    const stageEl = el("d7-crawl-stage");
    const crawlEl = el("d7-crawl");
    const countdownEl = el("d7-countdown");
    const digitsEl = el("d7-countdown-digits");

    // Let layout settle so crawlEl has its real rendered height (it
    // holds all 1,382 words) before computing scroll distance.
    requestAnimationFrame(() => {
      const contentH = crawlEl.getBoundingClientRect().height;
      const viewportH = stageEl.getBoundingClientRect().height;
      const totalDistance = contentH + viewportH * 1.3;
      const pxPerMs = totalDistance / (CRAWL_SECONDS * 1000);

      let y = viewportH; // starts just below the stage, fully hidden
      let lastT = performance.now();
      let manualUntil = 0;
      let finished = false;

      function applyY() {
        crawlEl.style.transform = `translateX(-50%) translateY(${y}px)`;
      }
      applyY();

      function onManualDelta(deltaPx) {
        y -= deltaPx;
        manualUntil = performance.now() + 2600;
        applyY();
      }
      stageEl.addEventListener(
        "wheel",
        (e) => {
          onManualDelta(e.deltaY * 0.6);
          e.preventDefault();
        },
        { passive: false }
      );
      let touchY = null;
      stageEl.addEventListener(
        "touchstart",
        (e) => {
          touchY = e.touches[0].clientY;
        },
        { passive: true }
      );
      stageEl.addEventListener(
        "touchmove",
        (e) => {
          if (touchY == null) return;
          const ny = e.touches[0].clientY;
          onManualDelta(-(ny - touchY) * 1.4);
          touchY = ny;
        },
        { passive: true }
      );

      function frame(t) {
        const dt = t - lastT;
        lastT = t;
        if (!finished && t > manualUntil) {
          y -= pxPerMs * dt;
          applyY();
        }
        if (!finished && y <= -(contentH + viewportH * 0.2)) {
          finished = true;
          crawlEl.classList.add("is-gone");
          setTimeout(showCountdown, 2200);
          return;
        }
        if (!finished) rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);
    });

    function showCountdown() {
      countdownEl.hidden = false;
      requestAnimationFrame(() => countdownEl.classList.add("is-in"));
      tick();
      tickInterval = setInterval(tick, 1000);
      if (onDoneCb) onDoneCb();
    }

    function tick() {
      const overlayEl = document.getElementById("day-overlay");
      if (!overlayEl || overlayEl.hidden) {
        if (tickInterval) clearInterval(tickInterval);
        tickInterval = null;
        return;
      }
      const entry = window.TimeLock.unlocks().find((u) => u.id === "birthday");
      digitsEl.textContent = entry.unlocked ? "she's here" : formatDigits(entry.msRemaining);
    }
  }

  return { render };
})();
