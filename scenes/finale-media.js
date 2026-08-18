/* ============================================================
   finale-media.js — the ONLY place that knows which real photos,
   videos, voice, and character art exist for the birthday finale.
   Every movement reads from here; none of them hardcode a filename.

   Empty right now on purpose. Until real files are supplied, every
   movement falls back to its own tasteful, media-free treatment —
   never a broken image icon, never an ugly placeholder box, never
   invented content. The moment entries appear below, the story
   starts using them with no other code changes.

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
  photos: [],
  videos: [],

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
