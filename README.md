# Project Minto — Rugby League Manager

A browser-based rugby league management sim. Plain HTML/CSS/JavaScript — **no build step, no dependencies, no server required.**

## Running it

Just open `index.html` in a browser (double-click it, or drag it into a tab).

If you're in VSCodium and want live-reload while editing, install the **Live Server** extension, right-click `index.html` → *Open with Live Server*. (Any static server works; you do **not** need one to play.)

## How it's wired

The scripts are plain `<script>` tags loaded in order by `index.html`. There's no module system, so everything shares one global scope: the engine exposes plain functions and a single game-state object `G`; the UI lives on one global object `UI`. Load order matters — engine first, then the UI core, then the UI page modules that extend it, then the boot file last.

```
minto/
├── index.html              Shell + markup + ordered <script> tags
├── styles.css              All styling (dark "Friday night footy" theme)
├── README.md
└── src/
    ├── engine/             Pure game logic — no DOM, fully testable on its own
    │   ├── 01-rng.js          Seeded RNG + number/format helpers
    │   ├── 02-data.js         Names, club identities, positions, attributes, injuries
    │   ├── 03-players.js      Player generation, overall rating, salary, familiarity
    │   ├── 04-teams.js        Squad building, salary-cap fitting, fixture generation
    │   ├── 05-game.js         Game state `G`, startNewGame, expectations
    │   ├── 06-selection.js    Auto-pick, lineup validation
    │   ├── 07-match.js        Match simulation, per-player stat lines, injuries, votes
    │   ├── 08-progression.js  Weekly recovery, player development, coach record, weekly media
    │   ├── 09-ladder.js       Ladder computation
    │   ├── 10-finals.js       Top-4 finals series
    │   ├── 11-offseason.js    Awards, retirements, contracts, free agency, job offers
    │   └── 12-save.js         Export / import save files (JSON)
    └── ui/                 Everything that touches the DOM
        ├── 01-core.js         The `UI` object: nav, top bar, router, modal, toasts
        ├── 02-wizard.js       New-career setup + club picker
        ├── 03-match-view.js   Advance button + round-result screen
        ├── 04-offseason-view.js  Off-season review + contract negotiation screens
        ├── 05-helpers.js      Small view helpers (rating colour, jersey text contrast)
        ├── 06-boot.js         Kicks off the first render (must load last)
        └── pages/             One file per screen — each extends UI via Object.assign
            ├── dashboard.js
            ├── squad.js          (+ playerRow, sort helpers)
            ├── player-modal.js   shared player detail popup
            ├── teamsheet.js      (+ pickSlot, assignSlot)
            ├── training.js
            ├── fixtures.js
            ├── ladder.js
            ├── stats.js
            ├── fantasy.js
            ├── recruitment.js
            ├── clubs.js          (+ teamModal)
            ├── coach.js
            ├── history.js
            ├── options.js
            └── contracts.js
```

### Adding a new page
1. Create `src/ui/pages/myscreen.js`:
   ```js
   'use strict';
   Object.assign(UI, {
     p_myscreen(){ return `<h1 class="page">My Screen</h1>…`; }
   });
   ```
   Any method named `p_<key>` is reachable as a route via `UI.go('<key>')`.
2. Add a `<script src="src/ui/pages/myscreen.js"></script>` line in `index.html`
   (anywhere after `01-core.js` and before `06-boot.js`).
3. Add a nav entry in `src/ui/01-core.js` → the `items` array in `nav()`:
   `['myscreen','My Screen']`.

That's the whole loop — no build, no imports to update.

### Where to look first
- **Tuning match results** → `src/engine/07-match.js` (try expectation, home advantage, scoring).
- **Player growth / decline** → `src/engine/08-progression.js`.
- **Hidden true potential / scouting ranges** → true potential is `p.pot`, but UI should display `potText(p)` / `potHtml(p)` from `src/ui/05-helpers.js`.
- **Busts, diamonds, Rookie of the Year** → `src/engine/11-offseason.js` handles end-of-season potential reassessment and awards.
- **Detailed player attributes / profile page** → player clicks route through `UI.playerModal(id)` to the full `p_player()` profile in `src/ui/pages/player-modal.js`. Attribute groups and positional OVR weights live in `src/engine/02-data.js`.
- **Tactics, specialists and kicking roles** → `src/ui/pages/tactics.js` lets the coach select captain, goal kicker, primary/secondary kickers, primary/secondary playmakers, position roles, and field-zone plans. Match effects are in `src/engine/07-match.js`.
- **Match Day page** → `src/ui/pages/matchday.js` shows lineups, venue/weather/crowd, coach penalty/field-goal preferences, auto-subs toggle, sim-to-result and watch-feed options.
- **Recruitment / contracts** → `src/ui/pages/recruitment.js` supports mid-season free-agent cover signings and pre-contract approaches. `src/ui/pages/contracts.js` allows current-team re-signing for players in the final year.
- **Coach contract and cash** → coach salary, contract years and cash live on `G.coach`; cash can be spent on attribute upgrades from `src/ui/pages/coach.js`.
- **Dashboard/media stories** → `src/ui/pages/dashboard.js` for display and `src/engine/08-progression.js` for weekly story generation.
- **Adding or changing a screen** → the matching file in `src/ui/pages/` (e.g. `squad.js`).
- **Clubs, names, attributes** → `src/engine/02-data.js`.

## Notes
- Saves are **export-to-file** only (Options page). Nothing is written to the browser automatically, so export before closing if you want to keep a career.
- News stories are stored in `G.news` as typed media cards (`title`, `body`, `type`, `tone`, optional `playerId`/`teamId`). Old text-only saves are migrated automatically.
- Player potential is intentionally uncertain in the UI. Keep `p.pot` as hidden true potential for the engine and display estimated ranges through the scouting helpers. Future staff/scouting attributes should feed into `scoutingAbility()`.
- Player attributes are detailed rugby-league skills grouped as offensive, defensive, physical, and mental. New attributes should be added to `ATTR_GROUPS`, `ATTR_LABEL`, and relevant `POS_PROFILE` weights so they actually affect OVR and simulation.
- Kicking is split into `kickPower`, `kickAccuracy`, `placeKick` (goal kicking), and `fieldGoal`. Fresh team generation deliberately limits strong goal kickers to one or two realistic specialists per squad.
- 40/20s and 20/40s are pooled together as `k4020`. Player stats also track `runs`, goal attempts (`ga`), field goals (`fg`), and fantasy points/rating include runs and 40/20s.
- Teams store tactical settings on `t.roles`, `t.positionRoles`, and `t.zoneTactics`. Auto-pick assigns sensible defaults, but the user can override them from the Tactics page.
- Opposition player OVR should be displayed via `ovrText(p)` / `scoutedOvr(p)`, not exact `p.ovr`, unless the player is on the user's club.
- Player history, injuries, and awards live on each player as `p.history`, `p.injuries`, and `p.awards`. Awards currently include Team of the Week, Team of the Year, Player of the Year, Rookie of the Year, Top Tryscorer, and Premiership.
- UI methods are split across files using `Object.assign(UI, { … })` so each screen is its own readable file while staying one object at runtime.
- The engine has no DOM dependencies, so any `src/engine/*.js` file can be loaded into Node for headless testing.
