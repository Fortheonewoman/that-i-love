/* ============================================================
   finale-media.js — the ONLY place that knows which real photos,
   videos, voice, and character art exist for the birthday finale.
   Every movement reads from here; none of them hardcode a filename.

   Real photos start appearing below as Obinna sends them over — sorted
   by hand (not dumped in and not randomized), each one placed under
   the role it actually reads as. Anything not yet used still falls
   back to its own tasteful, media-free treatment if this list is ever
   short on a given role — never a broken image icon, never an ugly
   placeholder box, never invented content.

   Where files go (create the folder, drop files in, then list them
   here — nothing else to touch):
     img/birthday/photos/   — stills. Give real w/h if known, so
                               layout picks the right aspect ratio
                               with no flash of wrong shape.
     video/birthday/        — clips. Keep under ~15MB each for a
                               GitHub Pages-friendly load; a 720p web
                               export is plenty. Mark at most one
                               with role:"laugh" for her laugh's own
                               moment.
     audio/birthday/        — voice.src below is Obinna's real voice
                               note for the embrace — never TTS, never
                               generated, only ever a real recording.
                               A song bed is optional and only used if
                               explicitly supplied and cleared for use
                               (see the note on song below).
     img/characters/        — reference photos for the two illustrated
                               figures in Movement V (Obinna in a suit,
                               Amirah in a gown). Not built yet — needs
                               real reference first, see characters
                               below.

   Shape of a photo/video entry:
     { src, w, h, role }
   role hints: "portrait", "candid", "silly", "hero" (freeze-frame /
   final "I LOVE YOU" image), and for video specifically "laugh".
   ============================================================ */
window.FinaleMedia = {
  photos: [
    { src: "img/birthday/photos/hero-restaurant.jpg", w: 918, h: 1400, role: "hero" },
    { src: "img/birthday/photos/hero-red-gown.jpg", w: 1073, h: 1400, role: "hero" },
    { src: "img/birthday/photos/hero-close-smile.jpg", w: 861, h: 1400, role: "hero" },
    { src: "img/birthday/photos/hero-silhouette.jpg", w: 787, h: 1400, role: "hero" },

    { src: "img/birthday/photos/candid-mirror.jpg", w: 1056, h: 1400, role: "candid" },
    { src: "img/birthday/photos/candid-boat-1.jpg", w: 1056, h: 1400, role: "candid" },
    { src: "img/birthday/photos/candid-boat-2.jpg", w: 1400, h: 1050, role: "candid" },
    { src: "img/birthday/photos/candid-outdoor.jpg", w: 647, h: 1400, role: "candid" },
    { src: "img/birthday/photos/candid-museum.jpg", w: 647, h: 1400, role: "candid" },
    { src: "img/birthday/photos/candid-laugh.jpg", w: 647, h: 1400, role: "candid" },
    { src: "img/birthday/photos/candid-plane.jpg", w: 750, h: 1400, role: "candid" },
    { src: "img/birthday/photos/candid-yellow-shirt.jpg", w: 822, h: 1400, role: "candid" },
    { src: "img/birthday/photos/candid-friend.jpg", w: 1041, h: 1400, role: "candid" },

    { src: "img/birthday/photos/silly-thumbsup.jpg", w: 787, h: 1400, role: "silly" },
    { src: "img/birthday/photos/silly-lobster.jpg", w: 787, h: 1400, role: "silly" },
    { src: "img/birthday/photos/silly-pajama.jpg", w: 787, h: 1400, role: "silly" },
    { src: "img/birthday/photos/silly-wig.jpg", w: 787, h: 1400, role: "silly" },
    { src: "img/birthday/photos/silly-deadpan.jpg", w: 953, h: 1400, role: "silly" },
  ],

  // Only two clips wired to an active moment so far, each picked for
  // a real, specific match rather than dropped in at random — more
  // of what got sent over is still just sitting as raw footage
  // (nothing invented, nothing guessed at), waiting for a beat that
  // actually fits it instead of being force-included here.
  videos: [
    // Her in a hard hat and safety vest on an actual job site — this
    // is the real thing the site's "the engineering brain" line was
    // already talking about. Movement III pairs them directly.
    { src: "video/birthday/candid-engineering.mp4", w: 720, h: 1280, role: "candid" },
    // A literal crown, mid-party lighting — used as a quick beat in
    // Movement II's montage rotation.
    { src: "video/birthday/hero-crown.mp4", w: 480, h: 854, role: "hero" },
  ],

  // Obinna's real voice note, played during the embrace in Movement
  // V. { src: "audio/birthday/voice.mp3" }. Left null until supplied
  // — that beat is skipped entirely (not faked with TTS) when empty.
  voice: null,

  // A song bed for the party movements. Only ever set to something
  // Obinna explicitly supplies or names as a confirmed-legal choice
  // — never picked automatically. { src, moods: {opening, explosion,
  // story, romance, ending} } once real. Left null for now.
  song: null,

  // Reference material for the two illustrated figures used in
  // Movement V's approach/embrace. Not built yet — needs a real
  // reference photo of Obinna first (asked for separately), then
  // Amirah. { obinna: {ref: "img/characters/..."}, amirah: {...} }.
  characters: null,
};
