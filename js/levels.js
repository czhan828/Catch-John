// Level definitions (progressive difficulty).
// Increase baseSpeedMultiplier and teleport chances to make John faster and harder.
// Edit or add entries to tune difficulty progression.

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
    baseSpeedMultiplier: 2.4,
    teleportChanceBase: 0.006,
    teleportChanceAggression: 0.05,
    lastPhasePercent: 0.25
  }
];