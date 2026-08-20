/* ============================================================
   finale-media.js — the ONLY place that knows which real photos,
   videos, and voice recording exist for the Day 8 birthday finale.
   Every movement reads from here; none of them hardcode a filename.

   Real photos/videos are sorted by hand (not dumped in and not
   randomized), each one placed under the role it actually reads as.
   Anything not yet used still falls back to its own tasteful,
   media-free treatment if this list is ever short on a given role —
   never a broken image icon, never an ugly placeholder box, never
   invented content.

   No music system — per the Day 8 rebuild, there is none, and none
   should be added. The only audio here is real media audio (used
   sparingly, one human source at a time) and Obinna's own voice.

   Where files go (create the folder, drop files in, then list them
   here — nothing else to touch):
     img/birthday/photos/   — stills.
     video/birthday/        — clips, kept web-sized.
     audio/birthday/        — voice.src is Obinna's real voice note,
                               never TTS, never generated.

   Shape of a photo/video entry:
     { src, w, h, role }
   role hints: "hero", "candid", "silly", "final-smile" (the one clip
   locked as the carousel's closing item — see finalCarouselClip
   below).
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

  videos: [
    // Her in a hard hat and safety vest on an actual job site — this
    // is the real thing the site's "the engineering brain" line was
    // already talking about. Movement III (montage) pairs them.
    { src: "video/birthday/candid-engineering.mp4", w: 720, h: 1280, role: "candid" },
    // A literal crown, mid-party lighting — used in Movement II's
    // opening explosion and Movement III's montage rotation.
    { src: "video/birthday/hero-crown.mp4", w: 480, h: 854, role: "hero" },
    // LOCKED as the carousel's final item — a real screen recording
    // of Obinna zooming into her face in a photo, cropped down to
    // just that: no app chrome, no crop-tool UI, just the zoom
    // settling on her smile. Nothing else may close the carousel.
    { src: "video/birthday/final-smile.mp4", w: 720, h: 1418, role: "final-smile", finalCarouselClip: true },
  ],

  // Obinna's real voice note, played after the carousel's final smile
  // has had room to breathe. Never TTS, never generated — only ever
  // a real recording. That beat is skipped entirely (not faked) if
  // this is null.
  voice: { src: "audio/birthday/voice.m4a" },
};
