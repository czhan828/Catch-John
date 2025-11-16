/// Level definitions (progressive difficulty + secret boss at the end)
window.LEVELS = [
  {
    id: 1,
    name: "Level 1 — Easy",
    timeSeconds: 60,
    baseSpeedMultiplier: 0.9,
    teleportChanceBase: 0.0015,
    teleportChanceAggression: 0.012,
    lastPhasePercent: 0.35
  },
  {
    id: 2,
    name: "Level 2 — Normal",
    timeSeconds: 75,
    baseSpeedMultiplier: 1.1,
    teleportChanceBase: 0.0025,
    teleportChanceAggression: 0.018,
    lastPhasePercent: 0.32
  },
  {
    id: 3,
    name: "Level 3 — Hard",
    timeSeconds: 90,
    baseSpeedMultiplier: 1.4,
    teleportChanceBase: 0.0035,
    teleportChanceAggression: 0.025,
    lastPhasePercent: 0.30
  },
  {
    id: 4,
    name: "Level 4 — Very Hard",
    timeSeconds: 105,
    baseSpeedMultiplier: 1.8,
    teleportChanceBase: 0.0045,
    teleportChanceAggression: 0.035,
    lastPhasePercent: 0.28
  },
  {
    id: 5,
    name: "Level 5 — Insane",
    timeSeconds: 120,
    baseSpeedMultiplier: 2.2,
    teleportChanceBase: 0.006,
    teleportChanceAggression: 0.05,
    lastPhasePercent: 0.25
  },
  {
    id: 6,
    name: "Level 6 — Final Test",
    timeSeconds: 140,
    baseSpeedMultiplier: 2.8,
    teleportChanceBase: 0.008,
    teleportChanceAggression: 0.07,
    lastPhasePercent: 0.22
  },
  // Secret boss level — hidden until unlocked (secret: true)
  {
    id: 7,
    name: "Secret — Boss: JOHN PORK",
    timeSeconds: 180,
    baseSpeedMultiplier: 3.5,
    teleportChanceBase: 0.01,
    teleportChanceAggression: 0.09,
    lastPhasePercent: 0.18,
    secret: true,
    // Boss-specific fields:
    health: 5,               // requires 5 hits to defeat
    hurtFlashMs: 120         // quick visual feedback on hit
  }
];