# CLI MMO Game Design Document

---

## 0. Design North Stars

- **CLI-first MMO**: The terminal is the primary client; TUIs and tools are community-driven and welcome.
- **Player-drawn maps**: The game outputs data; players chart the world themselves (CSV/JSON exports, fog-of-war).
- **Minimal social mechanics**: Factions, alliances, and politics exist socially; mechanical impact is deliberately light.
- **Real-time world, tick resolution**: The world advances continuously but resolves on fixed ticks; all timings map to real minutes/seconds.
- **High-fantasy theme**: “Warcraft-like strategy, played through a terminal.”
- **Single source of truth**: All simulation server-side; clients are thin.

---

## 1. Win / Loss / Seasons

- **Soft win (individual)**: Total ownership of all territories by a single player is the ultimate but near-impossible goal.
- **No alliance win**: Alliances do not win as a block; betrayals and power grabs are emergent play.
- **Global loss**: **The Sovereignty** (NPC faction) seeks total domination; if they conquer the map, everyone loses.
- **Seasons**: 1 week long (Mon 00:01 UTC – Sun 23:59 UTC). Eliminated players respawn as new. Hard reset of territories; persistence only for leaderboard placement, cosmetics, history, and user-level data.

---

## 2. Time Scale & Pacing

- **Tick length**: 5 seconds.
- **Action tiers**:
  - **Info Tier**: status/info actions — 0 ticks.
  - **Order Tier**: issuing orders, sending messages, starting builds/research/claims — 1 tick.
  - **Action Tier**: gather, scout, battle — 2 ticks.
  - **Distance Tier**: 1 tick × hex distance × path difficulty (movement/trade).
  - **Timer Tier**: specified completions (claim ~1500 ticks/5m; small research ~30s; housing ~25 ticks (~2m05s at 5s/tick)).
  
Research timing bands: minor (1–5m), major (30–45m). Early tutorial techs may be shorter (e.g., 30s).

### Fairness & Rate Limits (v0)
- Token bucket per user: 5 rps burst, 60 rpm sustained.
- Action Points per tick (enforced via action tiers).
- Per-front caps: max 3 supply/move actions applied per side per tick.
- Idempotency keys required for write endpoints.

---

## 3. Player Lifecycle

- **First hour**: Tutorial, first expansion, simulated conflict, automation, prep for 3rd hex.
- **First week**: Players should push toward endgame; beyond ~1 month is stagnation.
- **Onboarding**: Tutorial shards graft into fixed new-player entry points. Safety timer: first hex unclaimable for 1.5h (ends if hostile action vs players).

---

## 4. World & Map

- **Fixed size**: Large but finite map. Borders expanded between seasons as playerbase grows.
- **Safe border zones**: New players spawn outside borders; must expand inward to join main map. Players can choose proximity to center (risk vs resources).
- **Topology**: Hand-curated flow with procedural details. Central region = richer resources + Sovereignty.
- **Biomes**: Forest, plains, hills, mountains, rivers; terrain gates certain buildings/research.

---

## 5. Resources & Economy

- **Resources per hex**: Each defines available resource types, amounts, housing cap.
- **Three pillars**: Military, Economy, Morale. Tradeoffs central to gameplay.
- **Automation**: Early scripts possible; full optimization via research.

---

## 6. Expansion & Claims

- **Adjacency required**.
- **Claim window**: ~1500 ticks (5m). Uncontested → assigned. Contested → frozen into front until resolved.
- **Defense**: Power Score determines resistance.

### Claim Resolution Rules

1. **Dispute Trigger**: If 2+ players claim the same territory before the claim window ends, the claim is frozen.
2. **Resolution Paths**:
   - **Withdrawal**: A claimant may cancel their claim at any time.
   - **Disconnection**: If a claimant loses their contiguous path to the disputed hex, their claim is voided.
   - **Elimination**: If a claimant loses their last hex, their claim is voided.
   - **Diplomacy**: Players can negotiate outside the system; resolution still requires a claimant to withdraw.
3. **Resuming Timer**: Once only one claimant remains, the claim timer resumes with **25% of the remaining time shaved off** as a bonus to the survivor.
   - **Anti-abuse**: Multiple claims/withdrawals from the same allied player in rapid succession do not stack reductions. Only one reduction per resolved dispute.
4. **Re-entry**: New claimants may still enter if the timer hasn’t finished. This re-freezes the claim until only one remains again.
5. **Securing Territory**: The last claimant standing when the timer expires gains control of the hex.

---

## 7. Armies & Combat

- **Units**:
  - **Warrior**: 1 DEF, 1 ATK. Versatile, first unlocked. Long upgrade path.
  - **Scout**: 2 DEF, 0 ATK. Defensive, costly early, upgrades reduce cost and improve scouting.
  - **Mage**: 0 DEF, 2 ATK. Expensive glass cannon, morale-related bonuses via upgrades.
- **Troops/Units**: Players train granular units; group them into troops for orders.
- **Supply & upkeep**: Armies cost resources and reduce civilian workforce.
- **Garrisons**: Defensive allocations deter claims.

---

## 8. Social Layer

- **Messaging**: Private mail, faction lists, global thread (moderated).
- **Factions**: Join/leave anytime; membership public. No enforced alliance mechanics.
- **Bounties**: Killing nations adds to attacker’s public bounty (5% of resources lost). Other players may contribute to bounties. Paid out proportionally to eliminators when target is destroyed. Claiming a bounty adds to claimant’s own bounty.

When Nation A fully eliminates Nation B:
- A immediately loots 50% of B’s stored resources.
- 5% of B’s lost resources are converted into a **public bounty on A**.
- Bounties **only exist for players who have fully eliminated another player** (auto-created; cannot be created manually).
- When a bountied player is eliminated, the bounty pays out proportionally to all eliminators (weighted by share of territories taken from the target). Claiming a bounty adds to the claimant’s own bounty.

---

## 9. NPC Territories

- **Starter zones**: Static NPC camps; bulk resource rewards; occasional rare rewards (unique unit, rare resource).
- **Advanced zones**: NPCs roam, raid, and expand.
- **The Sovereignty (center)**: Ruthless, supply-line attacks, expands aggressively. Endgame clock; ramps with server time.

Sovereignty timeline (v0):
- Day 1: Probe (patrols near center, no conquests)
- Day 2–3: Raids within radius R1 (claim NPC tiles)
- Day 4–5: Push outward to radius R2; attack top 10% nations’ supply lines
- Day 6: Coordinated assaults on high-value hexes (bridges/mountain passes)
- Day 7 (final hours): Overwhelming push; if unchecked, server loss condition triggers

---

## 10. Buildings

- **Building Capacity (BC):** Each territory has BC score; buildings cost BC.
- **Stackable**: Most buildings stack (houses, farms, mills, mines). Special buildings limited (Guild Hall, Barracks).
- **Biome alignment**: Efficiency highest when matched with biome. Still buildable off-biome but weaker.

### Examples

- **Houses** (Grasslands efficient): +population cap.
- **Farmstead** (Forest/Grasslands): +food.
- **Lumbermill** (Forest): +wood.
- **Quarry/Mine** (Mountains): +stone/iron.
- **Guild Hall** (special, 1): unlocks unit training.
- **Barracks** (special, 1): warrior DEF bonuses.
- **Watchtower** (stackable, up to 3): scout DEF bonuses, extended vision.

---

## 11. Research Tree (Draft)

- **Military**: Unit trainings, barracks upgrades, advanced conscription.
- **Economy**: Farmstead, Lumbermill, Quarry unlocks, efficiency boosts, logistics.
- **Morale**: Housing, sanitation, law enforcement, festivals/holidays, cultural advances.

---

## 12. Morale System

- **Drain model**: Always depleting. Military/Economy focus accelerates drain. Morale investments slow drain.
- **Bands**:
  - **Normal (100–60%)**: Baseline, no penalties.
  - **60–40%**: Light penalties.
  - **40–20%**: Severe penalties.
  - **20–1%**: Coup likelihood range. Lower → higher risk each tick.
  - **0%**: Coup. If below 5% → elimination. Otherwise temporary loss of control/defections.
- **Boosts**: Can exceed 100% (up to 110%) briefly at high cost.
- **Design goal**: A maintenance stat — players must decide how much morale to risk for economy/military gains.

Provisional modifiers:
- 60–40%: −10% production, −5% combat effectiveness
- 40–20%: −30% production, −20% combat effectiveness
- Boost state (100–110%): +10% production and combat for up to 60 ticks; expensive to trigger

---

## 13. Power Score Rules (v1)

- **Units**: Flat ATK/DEF values per unit type; modified by research.
- **Research**: Flat boosts applied per unit per level.
- **Buildings**: Provide flat bonuses at stationed thresholds.
- **Morale**: Applies flat bonuses/penalties.
- **Supply**: Shortfall applies penalties and caps units.
- **Terrain**: Flat bonuses to defenders (e.g., archers in hills, scouts in forests).

### Formulas

- **Territory Defense PS** = DEF(units+research) + building bonuses + morale + supply/terrain.
- **Allocated Attack PS** = ATK(units+research) + relevant modifiers.
- **RPS advantage**: Warrior > Mage > Scout > Warrior (applies in combat resolution, not PS calc).

Example building thresholds:
- Barracks (1 per territory): +5 DEF at ≥5 Warriors; +2 at ≥10; +3 at ≥20 (total +10).
- Watchtower (up to 3): +2 DEF at ≥2 Scouts per tower; extends local vision.

---

## 14. Cosmetics

- CLI-flair (prompt symbols), ASCII banners, leaderboard titles.
- Achievements unlock cosmetics, but only backers (Patreon/Ko-Fi) can display them.
- End-of-season leaderboards posted externally (e.g., GitHub, itch.io).

---

## 15. Versioning

- Semantic versioning (v1, v1.1, etc.). Breaking changes allowed but announced in advance. No guarantee of backward compatibility beyond notice.

---

## 16. Risks

- **Tedious early game** → ensure 2nd hex in 5–10m, juicy logs.
- **Stagnation** → Sovereignty escalation, season resets.
- **Griefing** → bounty self-regulation, minimal moderation.
- **Tooling arms race** → rate limits, action points.
- **TUI vs CLI** → embrace TUIs, keep outputs first-class.

---

## 17. Minimum Viable Command Set (v0)

**Design goal:** Short verbs, delightful output, JSON/CSV on demand. All write ops accept an optional `--idempotency <key>`.

### Session & Help

- `game login` → device-code flow. On success, show ASCII splash + Ko-Fi/Patreon/Discord CTA if not linked.
- `game help [cmd]` → concise help with 2–3 examples per command.

**Global flags:**  
`--json` (machine-readable), `--csv` (for map/report lists), `--quiet` (suppress banner), `--tick` (print server tick/time in headers).

### Status & World Awareness

- `game report` → one-screen dashboard: nation summary, morale band, stockpiles, open claims, fronts, unread mail count, research/build queues, last 5 log lines.
- `game scan [--radius N] [--center q,r] [--csv|--json]` → visible hexes with owner, biome, BC, resource hints.
- `game note q,r "..."` / `game notes [--csv]` → attach personal notes; exportable.

### Economy & Building

- `game gather <resource> [--hex q,r] [--n UNITS]` → Action-tier; defaults to best eligible hex if none specified.
- `game build <building> [--hex q,r]` → Order-tier start; Timer-tier complete (BC & biome rules apply).
- `game research <tech>` → Order-tier start; Timer-tier complete.
- `game queue` → shows active/recent builds & research with ETAs (ticks + wall time).

### Military & Conflict

- `game train <unit> [--count N] [--hex q,r]` → trains into local pool at hex with a Guild Hall; upkeep shown.
- `game troop create <name> [--units "warrior:10,scout:5"]` → convenience grouping for orders.
- `game move <troop|unit> --from q1,r1 --to q2,r2` → Distance-tier with path difficulty shown.
- `game claim q,r` → open a 5-minute claim window; shows countdown; becomes disputed if contested.
- `game front status [--at q,r]` → shows PS both sides, supply, recent ticks.
- `game withdraw q,r` → withdraw your claim.
- `game supply --to q,r [--wood N] [--stone N] [--food N] [--ether N]`
  Apply resources to sustain a front at hex (q,r); per-front caps apply.

### Social & Mail

- `game mail send --to <player|faction> "message"` → delayed mail; Order-tier send.
- `game mail inbox` / `game mail read <id>` → Info-tier.

### Data & Batch

- `game export --what <report|scan|notes> [--csv|--json]`
- `game batch < file.json` → submit multiple ops in one request (mimics shell piping without parsing).

### Output Feel

```
╔══════════════╗
║  HEXWORLD    ║  Season 34 • Tick 128 • UTC 12:03:15
╚══════════════╝
Welcome back, Skibby. Consider supporting development → ko-fi.com/…
[Report] Nation: Emberfold • Morale: High (72%) • Stock: W245 S180 I22 F320 G19 E7
Open Claims: 1 (13,-3) • Fronts: 0 • Unread Mail: 2

Progress lines:

[Tick 128] Build started: Lumbermill @ (12,-3) • ETA 25 ticks (2m05s)
```

---

## 18. Core Data Structures (PoC Schema Sketch)

Keep fields minimal; expand later. IDs = UUID/ULID. Timestamps UTC; ticks are integers.

```yaml
Nation {
  id, name, ownerPlayerId,
  morale: { pct, drainRate },
  stockpile: { wood, stone, iron, food, gold, ether },
  tech: { levels... },
  territories: [hexId],
  troops: [troopId],
  mailbox: [mailId],
  bounty: { onMe, byMe }
}

Hex/Territory {
  id, q, r, biome, bcMax, bcUsed,
  resourceScores: { wood, stone, iron, food, gold, ether },
  buildings: [buildingId],
  ownerNationId | null,
  visionAt,
  notes: [noteId]
}

Building {
  id, type, hexId, bcCost, startedTick, completeTick
}

UnitPool (per Hex) {
  hexId, counts: { warrior, scout, mage }, upkeepPerTick
}

Troop {
  id, name, nationId,
  composition: { warrior, scout, mage },
  locationHexId,
  orders: [move|attack|garrison],
  supplyLink: nationId
}

Claim {
  hexId,
  window: { openedTick, baseDurationTicks, remainingTicks },
  claimants: [nationId],
  disputed: boolean,
  lastReductionApplied: boolean
}

Front {
  hexId,
  attackers: [nationId],
  defenders: [nationId],
  ps: { atk: number, def: number },
  supply: { attackers: number, defenders: number },
  lastTicks: [events]
}

Mail {
  id, from, to, sentAtTick, deliverAtTick, subject, body
}

EventLog {
  tick, nationId | null, type, details
} // append-only for audit & replays

TickMeta {
  tick, serverTime, seasonId
}
```

**Derived/Helpers**

- `PowerScore.calc(hexId)` → stationed units (+research) + building thresholds + morale + supply + terrain.
- `Path.find(q1,r1 → q2,r2)` → returns hex list + difficulty scalar.

---

## 19. Immediate Next Steps

- Implement skeleton server with a 5-second tick worker and append-only event log.
- Stub endpoints for v0 commands (read vs write tiers).
- Build CLI shell with login, report, scan, gather, build, claim flows and the ASCII splash.
- Seed a small fixed map (e.g., 50×50) with biomes, BC, and starter NPC camps.
- Add minimal combat to support claim disputes (PS calc + RPS in resolution).