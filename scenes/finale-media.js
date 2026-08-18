/* ============================================================
   finale-media.js — the ONLY place that knows which real photos,
   videos, and audio exist for the birthday finale. Every movement
   reads from here; none of them hardcode a filename.

   Empty right now on purpose. Until real files are supplied, every
   movement falls back to its own tasteful, photo-free treatment —
   never a broken image icon, never an ugly placeholder box. The
   moment entries appear below, the story starts using them with no
   other code changes.

   Where files go (create the folder, drop files in, then list them
   here — nothing else to touch):
     img/birthday/photos/   — stills. Any reasonable size; give the
                               real dimensions if known so layout can
                               pick sensible crops without a flash of
                               wrong aspect ratio.
     video/birthday/        — clips. Keep under ~15MB each for a
                               GitHub Pages-friendly load; an easy
                               web export at 720p is plenty.
     audio/birthday/        — one song bed for the party (optional),
                               plus the existing audio/voice-note.mp3
                               used elsewhere.

   Shape of an entry:
     { src: "img/birthday/photos/whatever.jpg",
       w: 1600, h: 2000,        // real pixel size, for aspect-ratio
       role: "portrait" }        // a hint, see ROLES below — movement
                                  // code uses this to decide where a
                                  // photo is strong (the one-photo
                                  // "there you are" beat wants a
                                  // "portrait"; the montage wants
                                  // "candid"/"silly"; the freeze-frame
                                  // wants "hero").
   ============================================================ */
window.FinaleMedia = {
  // ROLES a photo can carry (purely descriptive, used to pick the
  // right image for the right beat): "portrait", "candid", "silly",
  // "hero" (the freeze-frame / final "I LOVE YOU" image).
  photos: [],

  // Shape: { src, poster, w, h, role }. role: "laugh" is reserved for
  // the one clip used in THE LAUGH beat — mark at most one that way.
  videos: [],

  // Optional single track for Movement IV's celebration. Left null
  // until supplied; the party works fully without it.
  song: null,
};
