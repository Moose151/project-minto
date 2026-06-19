# Project Minto — Handover Document

Updated every session.

## Workflow Rules

- **Push to GitHub after every change.** Any time files are modified, added, or the handover is updated, commit and push to `origin main` before ending the session.
- GitHub remote: `https://github.com/Moose151/project-minto.git`
- **No save migration.** There are no persistent saves between test sessions — always start fresh. Do not add save migration code. Remove any that already exists.

## Project Shape

- Plain browser SPA: `index.html`, `styles.css`, global JS files. No build step.
- Global `G` = game state. Global `UI` = all view logic; page modules extend via `Object.assign(UI, {...})`.
- Engine: `src/engine/`. UI: `src/ui/` and `src/ui/pages/`.
- Syntax check (run after every change):

```bash
for f in src/engine/*.js src/ui/*.js src/ui/pages/*.js; do node --check "$f" || exit 1; done
```

Dev server (saves use the API):
```bash
cd api && node server.js
```

---

## File Map

| File | Purpose |
|---|---|
| `src/engine/01-rng.js` | Seeded RNG: `rnd`, `ri`, `rf`, `gauss`, `pick`, `poisson` |
| `src/engine/02-data.js` | All constants: `POS_PROFILE`, `STAFF_ROLES` (incl. medical), `FACILITY_DEFS`, `IDENTITIES` (with stadiums), `SCOUT_REGIONS`, `genScout` |
| `src/engine/03-players.js` | `genPlayer`, `migratePlayerAttrs`, `calcOvr`, `salaryFor`, `demandFor` |
| `src/engine/04-teams.js` | `buildTeam` (incl. headCoach), `genFixtures`, `squadStrength`, `teamSalary` |
| `src/engine/05-game.js` | `startNewGame`, G init (incl. `G.staff`, `G.club`, facilities, `G.scouting`) |
| `src/engine/06-selection.js` | `autoPick`, `validateLineup`, `familiarity`, position fit |
| `src/engine/07-match.js` | `simMatch`, venue uses home stadium, GF uses "Grand Final Stadium", crowd uses forecast/capacity |
| `src/engine/08-progression.js` | Training, dev, morale, injuries (medical staff/facility bonus), facilities helpers, `payCoachWeekly`, `payClubWeekly`, `advanceScouting` |
| `src/engine/09-ladder.js` | `ladder()` |
| `src/engine/10-finals.js` | NRL top-8 finals: QF/EF week 1, Semis week 2, Prelims week 3, GF week 4 |
| `src/engine/11-offseason.js` | Awards (topTry, coachYear, gfScore), contracts, retirements, rookies, board verdict |
| `src/engine/12-save.js` | `migrateSave` (stadium, headCoach, scouting, club, finals migrations), save/load |
| `src/ui/01-core.js` | `UI` object, nav (incl. Scouting, Club Management), advance button text (4-week finals) |
| `src/ui/02-wizard.js` | New game wizard |
| `src/ui/03-match-view.js` | Live match feed renderer |
| `src/ui/04-offseason-view.js` | Offseason review with clickable award cards |
| `src/ui/05-helpers.js` | `ovrHtml`, `potHtml`, `scoutAttrHtml`, `teamRatingPill`, `clubPrestigeBadge`, `playerTierBadge`, `playerAvatar`, `money` |
| `src/ui/pages/dashboard.js` | Status strip (incl. Club Funds), alerts, next match, mini ladder |
| `src/ui/pages/matchday.js` | Match Day: pre-match, lineups, compact odds bar, live feed |
| `src/ui/pages/predictions.js` | Bookie odds (fixed formula), projected ladder, award frontrunners |
| `src/ui/pages/fixtures.js` | Paginated by round; stadium/crowd per match; finals bracket |
| `src/ui/pages/player-modal.js` | Player profile: quality tier, nationality, key attrs, filterable/sortable career history |
| `src/ui/pages/teamsheet.js` | Drag/drop field, effective OVR delta, pick-slot modal, drag-highlight by fit quality |
| `src/ui/pages/staff.js` | Hire/fire assistant coaches + medical physio; filter/search; seasonal market |
| `src/ui/pages/scouting.js` | Scout dispatch, missions countdown, prospect sign/dismiss, scout market |
| `src/ui/pages/club-management.js` | Board standing, revenue/wages breakdown, salary cap overview, facility upgrades |
| `src/ui/pages/history.js` | Expandable year rows: awards, GF score, ladder snapshot, search/filter/sort controls |
| `src/ui/pages/hall-of-fame.js` | Retired-player Hall of Fame with induction cards, search, and sort |
| `src/ui/pages/records.js` | Records page: league career records, single-season records, and club-scoped player records |
| `src/ui/pages/clubs.js` | All-clubs browser; sort by ladder/OVR/name; head coach shown |
| `src/ui/pages/recruitment.js` | Approach limit (3/season), scroll preserved, free agent modal, T&T sign button |
| `src/ui/pages/contracts.js` | Full contract ledger, year/salary filters, early extensions, flat/front/back-loaded deals |
| `src/ui/pages/squad.js` | Squad management: top/dev/trial sections, filter/sort, OVR delta badge |
| `src/ui/pages/training.js` | Individual and team training focus |
| `src/ui/pages/tactics.js` | Match plan, zone tactics, position roles |
| `src/ui/pages/coach.js` | Coach profile, skills, cash, history |
| `src/ui/pages/injuryward.js` | Injury list, medical staff cards, play-hurt toggle |
| `src/ui/pages/ladder.js` | Full ladder; top-8 finals cut-line; team names clickable |
| `src/ui/pages/stats.js` | Stat leaders; position filter buttons; top 25; clickable team names |
| `src/ui/pages/fantasy.js` | Fantasy scoring with position filter and sort selector |

---

## Feature Status

---

### ✅ Features Implemented

#### Player System
- Deep individual attributes across Offensive / Defensive / Physical / Mental groups
- Position-weighted OVR (`calcOvr`) with specialist/side adjustments; colour-coded by quality tier
- Quality tiers: Park Level → Colts → First Grade → Top Flight → Star → Representative → International → Immortal (OVR 92+, max 3 league-wide)
- Nationality & rep eligibility: 9 nationalities with authentic name pools, flag display, rep-team and state chips
- Procedural player avatars: seeded SVG with nationality-skewed skin tone, age hair, team jersey colours
- Player form/confidence (`p.form`): updates after each match, affects matchday power, auto-pick, cohesion
- Forced drop-outs (`fdo`): tracked per player, in live feed, stat leaders, fantasy scoring
- Expanded season stats: mins, missed tackles, line breaks, LB assists, kicks, kick metres, infringements, FDOs, errors, FP
- Career totals and club-by-club totals tracked per player; player modal shows both
- OVR history (`p.ovrHistory`) tracked from new games; sparkline + delta badge on player modal
- Position key skills highlighted on player page (attrs weighted ≥0.07 shown with ★)
- Career history, injury history, awards history on player page

#### Squad & Team Sheet
- Drag-and-drop team sheet: NRL field layout, positional fit colours, effective OVR delta
- Drag highlight: slots colour-coded by fit (green/yellow/orange/red) via CSS data attributes — no re-render required; drag-over white ring on hovered slot
- Drop is blink-free: synchronous `scrollTop` restore in `render()` prevents flash
- Train & Trial squad (`squad:'trial'`): 1-year capped contracts ($75k max), 8-game play limit, upgrade/release UI, T&T badge on team sheet, expires at season end, max 6 T&T players
- Top squad capped at 30; dev squad unrestricted; T&T shown as separate section on squad page
- Season OVR delta badge on squad page (bold +/− below OVR number)
- NRL position ordering (FB → WG → CE → FE → HB → PR → HK → SR → LK) on squad/clubs/team lists

#### Recruitment & Contracts
- Approach limit (3/season), free agent offer modal, stable signing %
- Full contracts ledger: salary, cap hit, schedule, total value, years, intent, promise summary
- Flat/front/back-loaded contract structures with year-by-year schedules
- Early contract extensions for open/final-year players; contract intent states
- Player release payouts deducted from `G.club.funds`; payout shown on Contracts page
- T&T recruitment: T&T button on free agent rows; no payout on release
- Promises system: guaranteed game time, finals selection, development pathway; breach checks each round/finals

#### Staff & Scouting
- 6 assistant coach roles + positional specialisations; ability → salary/training/recovery bonus
- Medical physio: weekly extra recovery chance (ability/220); shown in Injury Ward with treated players
- Staff salaries from club funds; payout on fire; contract expiry badges; extend button
- Staff page: coloured type badges (COACH/MEDICAL/SCOUT), filter bar (All/Coaches/Medical/Scouts), name search, hire market type column
- Injury Ward: Medical Staff section shows all physios, treated players, combined weekly bonus
- Scouting: 13 regions, 2-step dispatch (region → target position), prospect sign/dismiss, market refreshes each season
- AI head-coach rotation (sacking/promotion from assistants); Coach of Year uses real AI names

#### Club & Finance
- Club funds: gate + broadcast revenue weekly; player/staff/scout wages deducted
- Facilities: stadium/training/gym/medical/academy (level 1–5); upgrades have build time with ETA and progress bar; cost upfront; stadium capacity drops during construction; degradation chance each season
- Club Management page: board sentiment bar, revenue/wages breakdown, salary cap bar, facility section
- Club prestige score/tier: affects player signing willingness; shown in clubs browser, recruitment, stat leaders
- Custom team logos generated per team (SVG shield/round/diamond/hex with inner border/drop shadow)
- God Mode: player editor, team editor, salary cap edit, club funds edit, force-release, promote/demote, injury/suspension override, face randomise

#### Pre-Season & Revenue
- Pre-season phase between contracts and Round 1: training camp focus, 1–3 trial matches, sponsor window, membership pricing
- Sponsor window: major/minor sponsors with value/length; renewal/expiry detection; renewal offers at +2–15% uplift
- Membership pricing + revenue applied at season start; shown in Club Management breakdown
- Home ticket price adjustable on match day; prestige-sensitive price drag (elite clubs lose fewer fans above avg)
- League avg ticket price comparison + win-streak crowd boost (+800 fans per win, up to +4000)

#### Achievements & Career History
- 20 achievements with tiered badge system (bronze/silver/gold); unlock checks post-round and post-season; news + toast on unlock
- Hall of Fame: retiring players scored for eligibility; snapshot stored; searchable/sortable page
- History page: expandable year rows, awards/GF score/ladder snapshot, search/filter/sort
- Records page: league career records, single-season records, club-scoped player records
- Coach income + progression: weekly salary from personal cash; skill upgrades; reputation badges; contract extension

#### Match Engine & Match Day
- Try scoring via Poisson distribution; rebalanced formula (max tries 9)
- Infringements: graded system (careless/reckless/intentional); sin bins, send-offs, tribunal bans
- Bookie odds fixed formula (`1/(p×margin)`); predictions page with media snippets, projected ladder, award frontrunners
- Venue uses home team's named stadium; "Grand Final Stadium" for GF; weather/crowd affects sim
- Injury-minute stored per player (`injMin`): live feed caps events to before injury minute
- Pre-match page: venue, coach vs coach head-to-head, compact odds bar
- Live match feed: try events, conversions, penalties, infringement events, half-time score, full-time banner
- Score hidden until full-time (`–:–` placeholders until FT event fires)
- Full-screen watch game page: live score header, both-team lineups sidebar, speed controls, inline post-match
- Post-match summary: scoring timeline, top performers grid (top 5 coached / top 3 opp), team stats comparison table
- Finals: NRL top-8 McIntyre system (QF/EF → Semis → Prelims → GF); advance button label updates per week

#### Bye Rounds (First Slice)
- Odd-team fixtures use phantom bye slot; `G.byes[]` per round
- Dashboard, Match Day, Fixtures, Topbar all show bye state; +8 condition boost for coached team

#### Inbox & News
- Inbox page: category filter tabs, item counts, expand/collapse, post-match analysis news item, player quick-link

#### Player Development & Stats
- Age-banded weekly OVR growth (16–17: 38% → 28+: 2.5%), veteran mental growth, physical/technical decline from 29+
- Offseason development pass: Poisson gains + decline for all players; news summary of biggest movers (±2 OVR)
- Stat leaders page: position filter, top 25, all expanded stat categories including FDO, LB, LBA, MT

---

### 🔧 Features Implemented — Needs Improvement

#### OVR Progression — Too Slow
- Full season played with only 2 players improving by +1 OVR across the entire squad (main + youth).
- Growth rates, professionalism multiplier, gamesProxy, devMod, and offseason pass all need recalibration.
- Target: a 20yo on full game time in a well-run club should gain 2–5 OVR in a good season; veterans should visibly decline from 31+; poor facilities/form should noticeably reduce gains.

#### Contract Demands — Position Weighting Too Flat
- Spine positions (HB, FE, HK) should demand significantly more than wingers/centres at equivalent OVR/age/potential.
- A 21yo 75OVR 85POT halfback should cost meaningfully more than the same player at WG/CE.
- `demandFor` needs a position weight multiplier: spine (HB, FE, HK) ~1.35–1.5×, key forwards (LK, SR) ~1.15–1.25×, WG/CE at base rate.
- The weighting should still vary by age, OVR, and potential — position just provides the starting premium.

#### Post-Match Analysis — Needs Full Page
- Currently shown as a popup/inline section. Should be a full dedicated page (or modal with a "Full Analysis →" deep-link).
- Full page: both complete 17-player team lists with individual stats per player (T/TA/Goals/FG/Runs/Tackles/MT/LB/Errors/Rating), complete match data (score by half, possession, territory, completion rate, all team stats), scoring timeline, key moments, match context (venue/weather/crowd).

#### Sponsorship — Cap Not Enforced + Minor Sponsors Not Showing
- Currently possible to sign all available sponsors with no limit. Should cap at 1 major + 2 minor active deals at any time.
- Only major sponsors appear under "Sponsorship Window" in Club Management — minor active deals are not shown.
- Sponsor window should show: remaining slots (e.g. "0/1 major · 1/2 minor"), all active deals (major and minor), expiring deals, and new offers.

#### Membership Price — Broken Update + No Text Input
- +/-$20 button click is not updating the displayed membership price.
- Projected members count is not updating when price changes (only expected revenue updates).
- $20k minimum increment is unrealistic — need a text input field to type any value directly.
- All three outputs (displayed price, projected members, expected revenue) must update together on every change.

#### Infringements — Almost Always 0-0
- Most simulated games show 0 infringements from both teams. Real NRL averages ~4–8 penalties per team per game.
- `genInfringements` needs frequency recalibration; infringement events should appear regularly in the live match feed.

#### Player Match Ratings — Almost Always 10
- Nearly every player receives a 10/10 rating each game regardless of performance.
- Rating formula needs rebalancing: average game should produce 6–7, good game 7–8, standout 9, exceptional 10; poor games 3–5.

#### WG/CE Overlap on Squad Field View — Still Occurring
- Despite the y-position fix (WG y:82, CE y:71), wingers and centres are still overlapping on the squad page team sheet field view.
- Requires further vertical/horizontal position adjustment or card dimension reduction.

#### Bye Rounds — Incomplete
- Ladder does not show bye round indicator; byes do not award 2 competition points (NRL standard gives 2 pts for a bye).
- Ladder should credit 2 pts to teams on bye each round; ladder page should indicate recent/current bye rounds.
- Still needed: forced even-team-count byes, Origin round bye blocks, better multi-bye distribution per season.

#### Watch Game — Speed Selector Resets Feed
- Changing watch speed during a live match triggers `UI.render()`, restarting the feed from the beginning.
- Fix: update `UI._watchSpeed` and toggle button active-state in-place without a full re-render.

#### Post-Match, Inbox, Avatars, Scouting, Facilities, Contracts — Partial
- Post-match: save full match reports per fixture for historical reopening; possession/completion rate; half-by-half breakdown.
- Inbox: assistant coach recommendations, scout report items, player messages, read/unread state, direct action links.
- Player avatars: current procedural SVG too complex at small sizes — consider simplified bold cartoon, pixel sprites, or canvas approach.
- Scouting: scout position-matching skill, richer region probabilities, prospect backstory.
- Facilities: AI club facility tracking, guest facilities, facility prestige icons, board expectations.
- Contracts: rep-status premiums, market scarcity by position, personality-based salary expectations.
- Hall of Fame: rep honours, club legend halls, richer retired-player profiles, ceremony UX.
- Development insights: attribute-level delta tab on player modal, offseason development review screen.

---

### ❌ Features to be Implemented

#### Match View — Pause, Half-Time Team Talk & Full-Time Graphic
- Pause button during live match so subs can be made mid-game.
- Auto-stop at half-time: show a "Half-Time Team Talk" screen with options (Fire Up / Encourage / Berate / Tactical).
- Players respond positively or negatively based on personality (professionalism, leadership, morale); response modifies morale heading into the second half — same framework as pre-game and post-game motivational options.
- Full-time: clear animated moment (siren graphic, score banner pulse, confetti for wins) so it's immediately obvious the match is over before the post-match screen appears.

#### Free Agents Page — Sort, Filter & Affordable Toggle
- Current page is a simple scroll list; needs to be fully interactive.
- Column-header sort: name, age, OVR, position, salary, potential.
- Filter controls: min/max age, minimum OVR, position filter, salary range (under/over a typed value).
- "Show affordable" toggle: filters list to players whose demand fits within the coached team's remaining cap space.
- Configurable thresholds: e.g. age >21 AND OVR >75 combined filter.
- Reset Filters button.

#### Match View — In-Game Substitutions
- Pause/sub screen should allow the coach to make substitutions during the match from the bench.
- Subs should be tracked and reflected in the post-match report and player stats.

#### Match Engine — Rugby League Logic Depth
- True tackle-count (0–5), set-by-set possession, field position tracking.
- In-game substitutions tracked by the engine (not just UI).
- HIA/concussion logic: Cat 1 (out for match + next game), Cat 2 (15 min assessment, can return if cleared).
- Ruck speed as a match factor affecting fatigue, line speed, and completion rate.
- Late-game decision logic for trailing teams; field goal seeking when leading by 6; scrum after knock-ons; 20m taps; short kick-offs.
- Live match feed: tackle count, field position, possession indicator, substitution events.

#### Representative & International Games
- State of Origin (QLD/NSW), Pacific Tests, Test series, international windows.
- Player eligibility already stored; needs rep squads, fixtures, match sim, injuries/condition impact, awards, career rep history.
- Coach eligibility/nationality, rep job offers based on reputation, club + rep dual-role management.

#### NRL Standard League Mode
- New game wizard "NRL Standard" preset: 17 real NRL clubs, real names/colours/stadiums, 27-round season, correct finals format.

#### Magic Round
- One round per season at a neutral venue over 3 days; all teams play; host club bids based on prestige/capacity; host receives revenue windfall; no home advantage for any team.

#### Crowd Vendor System
- F&B and merchandise vendor revenue: facility-like upgrades (level 1–5), per-head spend scaling, price slider, shown in Club Management breakdown.

#### Daily Calendar & Fatigue Management
- Day-by-day simulation; current date in topbar; auto-stop for decisions (judiciary, training review, squad selection by Tuesday).
- Building fatigue across matches; injury risk for fatigued/overloaded players; Calendar view showing matches, deadlines, travel, recovery days.

#### Weather Events & Tactical Adjustment
- Richer weather effects on errors, handling, kick accuracy, injuries, and crowd; in-game tactical adjustment to conditions by coach and AI.

#### Lower Leagues & Expansion
- Second-tier competition, promotion/relegation, club merger/dissolution.

---

### 💡 QoL Improvements

- **Reset Filters button**: every page with active filter controls should include a "Reset Filters" button that clears all filters/searches at once. Affected pages: Recruitment, Contracts, Squad, Stats, Fantasy, History, Free Agents, Staff.
- **Membership price text input**: allow typing a value directly rather than only +/-$20 increments.
- **Bye round ladder points**: award 2 competition points for bye rounds on the full ladder (NRL standard). Ladder page should show a "BYE" indicator alongside affected teams for the current/recent round.
- **My team OVR/ATK/DEF in next match widget**: show coached team's OVR, ATK, DEF pills alongside the opponent's pills on the Dashboard "Next match" widget for at-a-glance comparison.
- **Sponsor active deal visibility**: minor active sponsors should appear alongside major sponsors in the Club Management "Sponsorship" section with remaining contract years.
- **Sponsor slot indicators**: sponsor window should show remaining capacity (e.g. "0/1 major · 1/2 minor available") so the coach knows before clicking through.
- **Post-match full page link**: post-match summary should have a "Full Analysis →" button linking to a detailed standalone page.

---

### 🐛 Known Bugs

| Bug | Page / Area | Details |
|---|---|---|
| Infringements mostly 0-0 | Match Engine | `genInfringements` producing near-zero penalties — needs recalibration to ~4–8 per team per game |
| Player ratings mostly 10 | Match Engine | Rating formula producing near-maximum for almost all players — needs rebalancing across 3–10 range |
| Membership +/-$20 button broken | Preseason | Clicking +/-$20 does not update displayed price; projected members also not updating (only revenue updates) |
| Minor sponsors missing from Club Management | Club Management | Only major active sponsors appear — minor deals not shown in Sponsorship section |
| No sponsor signing cap | Preseason | Can sign all sponsors without limit — should enforce 1 major + 2 minor max |
| WG/CE still overlapping on squad field view | Squad page | Wingers and centres still overlap despite previous y-position fix — needs further adjustment |
| Watch game speed resets feed | Watch Game | Changing speed mid-match triggers full re-render and restarts feed from event 0 |
| OVR delta badge may not render | Squad / Player modal | `seasonStartOvr` may not be set for all players; verify badge renders consistently |

---

## Key Bugs Fixed (Reference)

| Bug | Fix |
|---|---|
| Signing % re-rolled every render | `demand` cached in `UI._contractOffer.demand` on modal open |
| Captain promise reduced own signing % | Check excludes `x.id !== p.id` in captain count |
| Try cap at 6 | Changed clamp max to 9 |
| Recruitment scroll-to-top | `requestAnimationFrame(() => m.scrollTop = prevTop)` |
| Free agent auto-signed without modal | `signFreeAgent()` now opens full offer modal |
| Bookie odds both over $2 | Formula changed: `1/(p*margin)` not `(1/p)*margin` |
| Finals seeding wrong (1v2, 3v4) | Fixed to NRL: 1v4, 2v3, 5v8, 6v7 |
| Predictions page → dashboard | Added `predictions.js` to `index.html` script order |
| Staff salary from coach personal cash | Staff wages now from `G.club.funds` via `payClubWeekly` |
| `++(_staffId\|\|0)` syntax error in `02-data.js` | Changed to `++_staffId` |
| Player scores/kicks after leaving injured | `injMin` stored per player line; live feed caps events to before that minute |
| Drag-and-drop scroll blink on team sheet | Synchronous `m.scrollTop = prevTop` in `render()` before browser paint |
| T&T salary cap check double-counted player | `submitFreeAgentOffer` subtracts existing T&T salary before cap check on upgrade |
