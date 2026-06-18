# Project Minto — Rugby League Manager

> A browser-based rugby league management simulation. No build step, no server, no dependencies — just open a file and play.

Project Minto is a single-player career manager where you take charge of a rugby league club, select your lineup, simulate matches, manage player contracts, develop your squad through an off-season, and compete for the premiership.

---

## Running the game

Open `index.html` in any modern browser — double-click it, drag it into a tab, or use a local file server.

That is all. No install, no build, no npm.

If you want live-reload while editing, use the **Live Server** extension in VS Code (or any equivalent static server): right-click `index.html` → *Open with Live Server*. A static server is not required to play.

---

## Saving

Saves are **export-to-file only** via the Options page. Nothing is written to the browser automatically — export your save before closing if you want to continue a career later. Import a `.json` save file from the same page to resume.

---

## Features

- Full 16-team competition with fixtures, ladder, and a top-4 finals series
- Player generation with detailed rugby-league attributes (offensive, defensive, physical, mental)
- Positional overall ratings and hidden true potential
- Squad management: contracts, salary cap, free agency, and recruitment
- Team sheet and lineup selection with auto-pick
- Tactics page: captain, goal kicker, kicking roles, playmakers, position roles, and zone plans
- Match day: live match feed or sim-to-result, weather and crowd, coach preferences, auto-subs
- Per-player match stat lines (tries, assists, tackles, errors, runs, field goals, fantasy points)
- Weekly player development, form, injuries, and recovery
- Media stories and dashboard news feed
- Off-season: awards, retirements, contract negotiations, and job offers
- Coach contract, coach cash, and attribute upgrades
- Fantasy points and player ratings
- Leaderboard stats: tryscorers, top performers, team stats
- Player history, injury records, and career awards
- Export and import save files (JSON)

---

## Project structure

```
minto/
├── index.html              Shell markup and ordered <script> tags
├── styles.css              All styling (dark "Friday night footy" theme)
└── src/
    ├── engine/             Pure game logic — no DOM, testable standalone
    │   ├── 01-rng.js          Seeded RNG and number/format helpers
    │   ├── 02-data.js         Names, clubs, positions, attributes, injuries
    │   ├── 03-players.js      Player generation, overall rating, salary, familiarity
    │   ├── 04-teams.js        Squad building, salary-cap fitting, fixture generation
    │   ├── 05-game.js         Game state (G), startNewGame, expectations
    │   ├── 06-selection.js    Auto-pick and lineup validation
    │   ├── 07-match.js        Match simulation, stat lines, injuries, votes
    │   ├── 08-progression.js  Weekly recovery, player development, coach record, media
    │   ├── 09-ladder.js       Ladder computation
    │   ├── 10-finals.js       Top-4 finals series
    │   ├── 11-offseason.js    Awards, retirements, contracts, free agency, job offers
    │   └── 12-save.js         Export / import save files (JSON)
    └── ui/                 Everything that touches the DOM
        ├── 01-core.js         UI object: nav, top bar, router, modal, toasts
        ├── 02-wizard.js       New career setup and club picker
        ├── 03-match-view.js   Advance button and round-result screen
        ├── 04-offseason-view.js  Off-season review and contract negotiation screens
        ├── 05-helpers.js      View helpers (rating colour, jersey contrast)
        ├── 06-boot.js         First render — must load last
        └── pages/             One file per screen
            ├── dashboard.js
            ├── squad.js
            ├── player-modal.js
            ├── teamsheet.js
            ├── training.js
            ├── fixtures.js
            ├── ladder.js
            ├── stats.js
            ├── fantasy.js
            ├── recruitment.js
            ├── clubs.js
            ├── coach.js
            ├── history.js
            ├── options.js
            └── contracts.js
```

### How it is wired

Scripts are loaded as plain `<script>` tags in `index.html` — no module system. Everything shares one global scope: the engine exposes functions and the game state object `G`; the UI lives on a single global object `UI`. Load order matters — engine first, then UI core, then the UI page modules, then the boot file last.

---

## Adding a screen

1. Create `src/ui/pages/myscreen.js`:
   ```js
   'use strict';
   Object.assign(UI, {
     p_myscreen() { return `<h1 class="page">My Screen</h1>`; }
   });
   ```
   Any method named `p_<key>` is reachable as a route via `UI.go('<key>')`.

2. Add a `<script src="src/ui/pages/myscreen.js"></script>` tag in `index.html` after `01-core.js` and before `06-boot.js`.

3. Add a nav entry in `src/ui/01-core.js` → the `items` array in `nav()`: `['myscreen', 'My Screen']`.

No build step, no imports to update.

---

## Where to look for common changes

| Change | File |
|---|---|
| Match result tuning (home advantage, scoring) | `src/engine/07-match.js` |
| Player growth and decline | `src/engine/08-progression.js` |
| Scouting and potential display | `src/ui/05-helpers.js` (`potText`, `potHtml`) |
| Awards, retirements, potential reassessment | `src/engine/11-offseason.js` |
| Player attributes, positions, OVR weights | `src/engine/02-data.js` |
| Tactics and kicking roles | `src/ui/pages/tactics.js` + `src/engine/07-match.js` |
| Match day page | `src/ui/pages/matchday.js` |
| Recruitment and contracts | `src/ui/pages/recruitment.js`, `src/ui/pages/contracts.js` |
| Coach salary, cash, upgrades | `src/ui/pages/coach.js` |
| Dashboard and media stories | `src/ui/pages/dashboard.js` + `src/engine/08-progression.js` |
| Any other screen | The matching file in `src/ui/pages/` |

---

## Notes for contributors

- Player potential (`p.pot`) is the hidden engine value. The UI should always display the estimated range via `potText(p)` / `potHtml(p)` from `src/ui/05-helpers.js` — never expose `p.pot` directly to the user.
- Opposition player ratings should display via `ovrText(p)` / `scoutedOvr(p)`, not `p.ovr`, unless the player is on the user's club.
- Kicking is split into `kickPower`, `kickAccuracy`, `placeKick` (goal kicking), and `fieldGoal`. Fresh squads are generated with only one or two realistic goal-kicking specialists.
- 40/20s and 20/40s are pooled as `k4020`. Player stats also track `runs`, goal attempts (`ga`), field goals (`fg`), and fantasy points.
- News stories are stored in `G.news` as typed media cards (`title`, `body`, `type`, `tone`, optional `playerId`/`teamId`). Old text-only saves are migrated automatically on load.
- New player attributes should be added to `ATTR_GROUPS`, `ATTR_LABEL`, and relevant `POS_PROFILE` weights in `src/engine/02-data.js` so they affect overall ratings and match simulation.
- Tactical settings live on `t.roles`, `t.positionRoles`, and `t.zoneTactics`. Auto-pick assigns sensible defaults; the user can override from the Tactics page.
- Player history, injuries, and awards live on each player as `p.history`, `p.injuries`, and `p.awards`.
- The engine has no DOM dependencies — any `src/engine/*.js` file can be loaded into Node for headless testing.
