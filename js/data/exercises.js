// Kategorier och övningar. Innehållet (tider och svårighetsgrad) är platshållare och bör
// granskas av en sjukgymnast/fysioterapeut innan appen publiceras.
//
// Övning:  { id, category, title, description, difficulty: 1..5, blocks: [...] }
// Block:   { repeat?: n, moments: [{ type, seconds, sounds?, visuals?, images? }] }
// `repeat` upprepar hela blockets moment i ordning n gånger (standard 1).

export const categories = [
  {
    id: 'kom-igang',
    title: 'Kom-igång',
    subtitle: 'Milda övningar för dig som är ny',
    level: 'enkel',
  },
  {
    id: 'basovningar',
    title: 'Basövningar',
    subtitle: 'Bygg styrka och uthållighet',
    level: 'medium',
  },
  {
    id: 'avancerade',
    title: 'Avancerade övningar',
    subtitle: 'För dig som vill utmana dig själv',
    level: 'avancerad',
  },
];

export const exercises = [
  // ── Kom-igång ────────────────────────────────────────────────
  {
    id: 'forsta-knipet',
    category: 'kom-igang',
    title: 'Första knipet',
    description: 'Lär känna bäckenbotten med korta, lugna knip och gott om vila.',
    difficulty: 1,
    blocks: [
      {
        repeat: 6,
        moments: [
          { type: 'uthallighetsknip', seconds: 4 },
          { type: 'vila', seconds: 10 },
        ],
      },
    ],
  },
  {
    id: 'lugn-uthallighet',
    category: 'kom-igang',
    title: 'Lugn uthållighet',
    description: 'Håll knipet lite längre och avsluta med några mjuka snabbknip.',
    difficulty: 1,
    blocks: [
      {
        repeat: 8,
        moments: [
          { type: 'uthallighetsknip', seconds: 5 },
          { type: 'vila', seconds: 6 },
        ],
      },
      {
        repeat: 5,
        moments: [
          { type: 'snabbknip', seconds: 1 },
          { type: 'vila', seconds: 3 },
        ],
      },
    ],
  },
  {
    id: 'knip-och-slapp',
    category: 'kom-igang',
    title: 'Knip och släpp',
    description: 'Träna både kraft och snabbhet, med tydlig vila emellan.',
    difficulty: 2,
    blocks: [
      {
        repeat: 6,
        moments: [
          { type: 'kraftknip', seconds: 5 },
          { type: 'vila', seconds: 10 },
        ],
      },
      {
        repeat: 10,
        moments: [
          { type: 'snabbknip', seconds: 1 },
          { type: 'vila', seconds: 2 },
        ],
      },
    ],
  },

  // ── Basövningar ──────────────────────────────────────────────
  {
    id: 'stabil-bas',
    category: 'basovningar',
    title: 'Stabil bas',
    description: 'Längre uthållighetsknip följt av en serie snabbknip.',
    difficulty: 2,
    blocks: [
      {
        repeat: 6,
        moments: [
          { type: 'uthallighetsknip', seconds: 10 },
          { type: 'vila', seconds: 10 },
        ],
      },
      {
        repeat: 10,
        moments: [
          { type: 'snabbknip', seconds: 2 },
          { type: 'vila', seconds: 2 },
        ],
      },
    ],
  },
  {
    id: 'kraft-och-puls',
    category: 'basovningar',
    title: 'Kraft och puls',
    description: 'Växla mellan kraftknip och snabbknip för att träna hela spännvidden.',
    difficulty: 3,
    blocks: [
      {
        repeat: 6,
        moments: [
          { type: 'kraftknip', seconds: 8 },
          { type: 'vila', seconds: 8 },
        ],
      },
      {
        repeat: 12,
        moments: [
          { type: 'snabbknip', seconds: 2 },
          { type: 'vila', seconds: 2 },
        ],
      },
    ],
  },
  {
    id: 'kraftpasset',
    category: 'basovningar',
    title: 'Kraftpasset',
    description: 'Ett varierat pass: korta kraftknip, ett långt uthållighetsmoment och en snabb avslutning.',
    difficulty: 3,
    blocks: [
      {
        repeat: 8,
        moments: [
          { type: 'kraftknip', seconds: 12 },
          { type: 'vila', seconds: 8 },
        ],
      },
      {
        moments: [
          { type: 'kraftknip', seconds: 30 },
          { type: 'vila', seconds: 20 },
        ],
      },
      {
        moments: [
          { type: 'kraftknip', seconds: 12 },
          { type: 'vila', seconds: 8 },
        ],
      },
      {
        repeat: 12,
        moments: [
          { type: 'snabbknip', seconds: 3 },
          { type: 'vila', seconds: 2 },
        ],
      },
    ],
  },

  // ── Avancerade övningar ──────────────────────────────────────
  {
    id: 'langa-hallet',
    category: 'avancerade',
    title: 'Långa hållet',
    description: 'Krävande uthållighet med långa knip och kort vila.',
    difficulty: 4,
    blocks: [
      {
        repeat: 6,
        moments: [
          { type: 'kraftknip', seconds: 20 },
          { type: 'vila', seconds: 10 },
        ],
      },
      {
        repeat: 2,
        moments: [
          { type: 'uthallighetsknip', seconds: 30 },
          { type: 'vila', seconds: 15 },
        ],
      },
    ],
  },
  {
    id: 'snabb-och-stark',
    category: 'avancerade',
    title: 'Snabb och stark',
    description: 'Hög tempo-serie av snabbknip följt av tunga kraftknip.',
    difficulty: 4,
    blocks: [
      {
        repeat: 20,
        moments: [
          { type: 'snabbknip', seconds: 2 },
          { type: 'vila', seconds: 1 },
        ],
      },
      {
        repeat: 8,
        moments: [
          { type: 'kraftknip', seconds: 10 },
          { type: 'vila', seconds: 5 },
        ],
      },
    ],
  },
  {
    id: 'full-styrka',
    category: 'avancerade',
    title: 'Full styrka',
    description: 'Det tuffaste passet: många kraftknip, ett riktigt långt hold och snabb avslutning.',
    difficulty: 5,
    blocks: [
      {
        repeat: 10,
        moments: [
          { type: 'kraftknip', seconds: 15 },
          { type: 'vila', seconds: 10 },
        ],
      },
      {
        moments: [
          { type: 'kraftknip', seconds: 45 },
          { type: 'vila', seconds: 30 },
        ],
      },
      {
        repeat: 15,
        moments: [
          { type: 'snabbknip', seconds: 3 },
          { type: 'vila', seconds: 2 },
        ],
      },
    ],
  },
];

export const getCategory = (id) => categories.find((c) => c.id === id);
export const getExercise = (id) => exercises.find((e) => e.id === id);
export const getExercisesByCategory = (categoryId) =>
  exercises.filter((e) => e.category === categoryId);
