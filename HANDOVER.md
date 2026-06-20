# Project Minto — Handover Document

Updated every session.

## Latest Session Notes

- Records page tabs + dropdown fix — added three tab buttons (Career Records / Single-Season Records / Club Records) at the top of the Records page; only the selected section renders; the team-filter dropdown now appears only on the Club Records tab where it actually applies.
- Season Leaders page added — new `season-leaders.js` page (added to nav between Stat Leaders and Fantasy) shows current-season top-5 per stat in a grid; Positive Stats tab (tries, try assists, tackles, run metres, carries, FDOs, line breaks, minutes, games) and Negative Stats tab (errors, missed tackles, infringements).
- New game pre-season flow — new games now start in the pre-season phase instead of directly at Round 1; `wizPick()` sets `G.year` back one, `G.season=0`, `G.phase='offseason'`, and creates a minimal `G.offseason` with `step:'preseason'`; `completePreseason()` → `startNewSeason()` then increments back to the correct year/season and generates fixtures.

---

Previous session notes:

- Match feed conversion labels — ✓/✗ icons on try events replaced with colour-coded `CONV` / `NO CONV` text in all scoring timelines (live feed, post-match inline, round-results modal).
- Team sheet bench rows fixed — bench slots (14-17) now show a compact meta (pos tag, OVR, condition, fatigue, form, specialist) instead of the full playerMeta which could collapse the name/photo due to overflow from the `white-space:nowrap` fit-pill.
- Team sheet nationality clutter — rep-team label ("Kangaroos", "Kiwis", etc.) removed from all team sheet player rows; only the nationality flag remains.
- Confirm Team List — added a prominent banner + button on the team sheet page to explicitly submit the 19-man squad; banner turns green on submission; Tuesday advance gate now also requires confirmation (not just a valid lineup); bye weeks are exempt.
- Recruitment approach scroll fix — `doApproach` explicitly saves and restores scroll position via `requestAnimationFrame` after rendering, in addition to the existing `render()` scroll logic.
- Recruitment final-year filter — added "Final year only" checkbox to the Browse tab (highlights players on ≤1 year left) and a "Final year" toggle button on the Free Agents tab; resets with Reset Filters.
- Training page filters — added position filter buttons (All / FB / WG / … / LK) and a sort dropdown (youngest / OVR / load / condition / form / potential / name) above the individual training table, with a Reset button when non-default.
- Watch Game full-time siren — full-time now triggers a short SIREN overlay in the match header with win/draw/loss colouring, alongside the existing banner flash and win confetti.
- NRL Standard preset corrected — wizard now advertises and generates 17 NRL clubs with a 27-round regular season, $10.2M cap, and existing top-8 finals.
- Inbox player messages — added direct player-message generation for low morale, youth pathway, and hot-form situations, with cooldowns, player links, and a dedicated Inbox filter.
- Scouting region probabilities — regional scouting now weights positions by local specialities instead of uniform random pools, and region rows show the top likely positions before dispatch.
- AI club facility tracking — every club now carries facility levels; AI facilities affect prestige, stadium capacity, recovery, medical recovery, and development, drift through offseason upgrades/degradation, and are visible on club cards/modals.
- Hall of Fame ceremony UX — inductee cards now include a ceremony modal with legacy score, peak OVR, career totals, honours, final club context, and season review marks new Hall of Fame retirees with a direct inductions link.
- Signing ceremony UX — accepted free-agent deals, train & trial contracts, youth prospect signings, contract upgrades, and extensions now show a polished signing modal with player/team visuals, terms, total value, structure, and quick navigation.
- Scouting position matching — scouts now have positional specialties; targeted scouting chance scales by scout ability and specialty, target buttons show hit chance, and returned prospects note whether the requested position was matched.
- Weather engine depth — match weather now flows into player stat lines: rain/wind/humidity increase individual handling-error risk, reduce kick metres, and make 40/20s/repeat-set kicks harder; conservative bad-weather tactics reduce the coached side's handling penalty.
- Historical match reports widened — every completed fixture on the Fixtures page now has a "Match report" button; the full analysis page renders coached-team matches from coach perspective and neutral AI matches as a final report.
- Multi-day match calendar completed — fixture slots are now unique Thu Night/Fri Night/Sat Afternoon/Sat Twilight/Sat Night/Sun Afternoon/Sun Twilight/Sun Night windows; daily advance simulates only the current day; coached-team matches play on their assigned slot day; rounds close only after the final scheduled game; Calendar now has a round games/results table.
- Coach profile career context — profile now shows current-season W-L-D and career win rate; offseason history stores each season's W-L-D and the coaching history table displays the record.
- Facility board expectations — Club Management board card now shows whether current facility standard meets prestige-tier expectations (Dynasty/Elite → avg Lv 4+, Strong → Lv 3+, Solid → Lv 2+); failing facilities listed by name in red.
- Win confetti animation — CSS confetti (55 particles, 7 colours, 1.8–3.8s fall) fires on full-time win; auto-removed after 4.5s.
- Personality-based contracts — `p.personality` ('money'/'winner'/'loyal'/'ambitious'/'homesick'/'balanced') assigned at player generation; affects salary demand in `demandFor()` and signing probability in `contractSignChance()`; shown on player modal, contract ledger, and signing modal.
- Market position scarcity — `demandFor()` checks how many comparable free agents (same pos, within 8 OVR) are available; scarcity adds +18% (no competitors) or +9% (≤2) demand premium.
- Hall of Fame: rep honour badges (Kangaroos/International/State Rep), dynasty badge for 3+ premierership winners, Club Legend tag and wall panel, club-only filter toggle, career milestone highlights.
- Match Report: half-by-half score breakdown (1H/2H) in scorecard and stats table; possession % and completion % now computed per team and shown in all stat comparison tables.
- Possession and completion in round results modal and inline post-match.
- Mid-week game simulation: `simMatch()` is now idempotent; Thu/Fri AI fixtures simulate on their actual calendar day; calendar stops show game-night label and matchup details; popup modal shows early results.
- Mid-season AI coach sackings: after Round 12, bottom-quartile teams on a 3+ loss run have ~22% chance of sacking per 3-round cycle; generates inbox news.
- Clubs browser: prestige sort, HoF legend count on cards, "NEW" badge for new coaches; team modal lists HoF legends.
- Squad page: "Reset sort" button appears when sort is non-default.

---

Previous session notes:

- Weather tactical adjustment — on the Match Day pre-match page, if conditions are Heavy Rain or Windy, a "Conditions" card appears with a toggle between "Normal game plan" and "Adapt to conditions"; conservative play reduces try risk (×0.93) but halves the weather penalty on kicking accuracy, making structured goal-kicking football viable in bad weather; the per-team modifier is applied in simMatch so only the coached team is affected by their choice.
- Full-time graphic — the watch game header flashes green (win) / red (loss) / grey (draw) for 900ms when FULL TIME fires; banner text upgraded to "FULL TIME — WIN/DRAW/LOSS".
- More staff recommendations — attack coach flags in-form bench players; defence coach warns of low-morale run-on players; physio warns of high-load injury risk; existing fitness and development coach reports retained. All fire via `generateStaffRecommendations` post-round when appropriate staff are hired.
- Half-time team talk added to Watch Game — feed auto-pauses at half-time and presents 4 choices (Fire Up / Encourage / Tactical / Berate); each choice adds a narrative line to the live feed and adjusts coached players' form heading into next match; Berate has random per-player variance (35% chance of negative effect).
- Match Day pre-match now shows the slot badge (e.g. "Thu Night") next to the round number in the page subtitle.
- Calendar "Next 14 Days" match day cards now include the kick-off slot label in the detail line (e.g. "Home v Storm · Sat Night").
- Corrected HANDOVER: Magic Round, Crowd Vendor System, NRL Standard Mode, State of Origin, offseason dev review, and attribute-level delta tab are all already implemented — moved from ❌ to ✅ or annotated correctly.
- Match report from fixtures — each completed match on the Fixtures page now has a "Match report →" button that sets `G._lastPlayedMatch` and opens the full analysis page; enables historical match replay for any past round.
- Win/loss streak on Dashboard next match widget — shows "4× WIN STREAK" or "2× LOSS STREAK" in green/red when the coached team has 2+ consecutive results; slot badge (e.g. "Sat Night") shown below the matchup.
- Rep status salary premium — `salaryFor()` now applies a multiplier: Kangaroos internationals +14% (OVR 70+), other international rep players +8% (OVR 65+), state reps +6% (OVR 70+); makes rep players command higher market rates.
- Media snippets enriched — Predictions page now includes per-team form streaks ("on a 4-game winning run"), weather context when conditions are Heavy Rain or Windy, and names injured absentees.

---

Previous session notes:

- Fixed minor sponsors missing from Club Management — added a dedicated "Sponsorship" section showing all active major/minor deals with value and years remaining.
- Fixed WG/CE overlap on team sheet pitch — increased vertical separation to 14% gaps (WG y:83, CE y:69) and pushed WG further to flanks (x:91/9); also respaced FB/FE/HB rows throughout.
- Fixed OVR delta badge reliability — added `seasonStartOvr` guard in `submitFreeAgentOffer` and `_confirmTrialSign` so mid-season signings always have the field set.
- Enhanced Dashboard next match widget — coached team now shows league position and W-L record alongside opponent's, making the two sides symmetric.
- Added Full Match Analysis page (`match-report.js`) — stores last played match in `G._lastPlayedMatch`; post-match inline summary gains "Full Analysis →" button linking to a dedicated full-page report with complete player stats tables for both teams, scoring sequence, and match stats comparison.
- Added Reset Filters buttons — Contracts (resets all 8 filter controls), Stats (position reset when active), Fantasy (position + sort reset when non-default), Staff (type filter + search reset when active). Free Agents already had one.
- Bye round points — ladder now awards 2 competition points for completed bye rounds (NRL standard); form history shows a gold square "B" dot; ladder page shows "BYE" tag next to teams on the current/recent bye round.
- OVR Progression recalibrated — switched from single binary weekly roll to Poisson-distributed gains per week with ~6x higher expected rates; gains are biased 72% toward position key attributes (POS_PROFILE weight ≥ 0.07) so each gain meaningfully moves OVR; added `positionKeyAttrs()` helper; offseason dev pass gains cap raised from 3 to 6 with matching rates. Target: 20yo on full game time gains 2–5 OVR per season.
- Multi-day round scheduling — `genFixtures` assigns each game a `{day, time, label}` slot (Thu Night → Sun Night); no two games share a slot; fixtures page sorts games by slot order and displays the slot label + weather; `simMatch` uses `slot.time` to adjust weather pool and apply a time-of-day try modifier (night −3%, afternoon +3%); slot stored in `det`; Dashboard shows a "Round N Results" panel with all completed-round scores sorted by kick-off slot.
- Added item to HANDOVER add/fix section: match scheduling (multi-day, time-of-day conditions, no simultaneous games, round results view).

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
| `src/engine/09-calendar.js` | Daily calendar helpers, date labels, auto-stops, daily recovery/load injury risk |
| `src/engine/09-ladder.js` | `ladder()` |
| `src/engine/10-finals.js` | NRL top-8 finals: QF/EF week 1, Semis week 2, Prelims week 3, GF week 4 |
| `src/engine/11-offseason.js` | Awards (topTry, coachYear, gfScore), contracts, retirements, rookies, board verdict, roster-cap helpers |
| `src/engine/12-save.js` | `migrateSave` (stadium, headCoach, scouting, club, finals migrations), save/load |
| `src/ui/01-core.js` | `UI` object, nav (incl. Scouting, Club Management), advance button text (4-week finals) |
| `src/ui/02-wizard.js` | New game wizard |
| `src/ui/03-match-view.js` | Live match feed renderer |
| `src/ui/04-offseason-view.js` | Offseason review with clickable award cards |
| `src/ui/05-helpers.js` | `ovrHtml`, `potHtml`, `scoutAttrHtml`, `teamRatingPill`, `clubPrestigeBadge`, `playerTierBadge`, `playerAvatar`, `money` |
| `src/ui/pages/dashboard.js` | Status strip (incl. Club Funds), alerts, next match, mini ladder |
| `src/ui/pages/matchday.js` | Match Day: pre-match, lineups, compact odds bar, live feed |
| `src/ui/pages/match-report.js` | Full match analysis page: scoring sequence, both-team player stats tables, match stats comparison |
| `src/ui/pages/predictions.js` | Bookie odds (fixed formula), projected ladder, award frontrunners |
| `src/ui/pages/calendar.js` | Daily calendar: current date, deadlines, travel, match day, recovery, fatigue watch |
| `src/ui/pages/fixtures.js` | Paginated by round; stadium/crowd per match; finals bracket |
| `src/ui/pages/player-modal.js` | Player profile: quality tier, nationality, key attrs, filterable/sortable career history |
| `src/ui/pages/teamsheet.js` | Drag/drop field, effective OVR delta, pick-slot modal, drag-highlight by fit quality |
| `src/ui/pages/staff.js` | Hire/fire assistant coaches + medical physio; filter/search; seasonal market |
| `src/ui/pages/scouting.js` | Scout dispatch, missions countdown, prospect sign/dismiss, scout market |
| `src/ui/pages/club-management.js` | Board standing, revenue/wages breakdown, salary cap overview, facility upgrades |
| `src/ui/pages/history.js` | Expandable year rows: awards, GF score, ladder snapshot, search/filter/sort controls |
| `src/ui/pages/hall-of-fame.js` | Retired-player Hall of Fame with induction cards, search, and sort |
| `src/ui/pages/records.js` | Records page: tab buttons switch Career/Season/Club views; Club tab has team dropdown filter |
| `src/ui/pages/season-leaders.js` | Season Leaders: positive stats tab (tries, TA, tackles, metres, carries, FDO, LB, mins, games) and negative stats tab (errors, MT, infringements); top 5 per stat |
| `src/ui/pages/clubs.js` | All-clubs browser; sort by ladder/OVR/name; head coach shown |
| `src/ui/pages/recruitment.js` | Approach limit (3/season), scroll preserved, free agent modal, T&T sign button, free agent filters/sort |
| `src/ui/pages/contracts.js` | Full contract ledger, year/salary filters, early extensions, flat/front/back-loaded deals |
| `src/ui/pages/squad.js` | Squad management: main/youth/trial sections, filter/sort, OVR delta badge |
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
- Main squad (`squad:'top'`) hard-capped at 30 players; only main-squad salaries count against salary cap
- Youth squad (`squad:'dev'`) capped at 12 players, under-21 only, salary-cap exempt; once promoted to main squad a player can never return to youth
- Train & Trial squad (`squad:'trial'`): max 5 players, 1-year contracts capped at $150k, 6-game play limit, salary-cap exempt, upgrade/release UI, T&T badge on team sheet, expires at season end
- T&T breakout hook: small chance after match appearances for fringe players to gain potential/attributes
- Season OVR delta badge on squad page (bold +/− below OVR number)
- NRL position ordering (FB → WG → CE → FE → HB → PR → HK → SR → LK) on squad/clubs/team lists

#### Recruitment & Contracts
- Approach limit (3/season), free agent offer modal, stable signing %
- Free Agents tab: sortable columns, typed min/max filters, salary under/over filter, affordable-only toggle, age/OVR threshold toggle, reset filters
- Full contracts ledger: salary, cap hit, schedule, total value, years, intent, promise summary
- Flat/front/back-loaded contract structures with year-by-year schedules
- Early contract extensions for open/final-year players; contract intent states
- Player release payouts deducted from `G.club.funds`; payout shown on Contracts page
- T&T recruitment: T&T button on free agent rows; no payout on release
- Offseason free-agent market includes a T&T button, so aged-out youth can be offered main-squad terms, train & trial terms, or left on the market
- Scouting prospects sign into youth squad only if under 21 and youth room is available; youth wages are cap-exempt
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
- Currency display selector: AUD or Pounds; values are display-only and do not rebalance economics
- Club Management commercial controls: typed home ticket price and season member price with live projections
- Facilities: stadium/training/gym/medical/academy (level 1–5); upgrades have build time with ETA and progress bar; cost upfront; stadium capacity drops during construction; degradation chance each season
- Club Management page: board sentiment bar, revenue/wages breakdown, salary cap bar, facility section
- Club prestige score/tier: affects player signing willingness; shown in clubs browser, recruitment, stat leaders
- Custom team logos generated per team (SVG shield/round/diamond/hex with inner border/drop shadow)
- God Mode: player editor, team editor, salary cap edit, club funds edit, force-release, promote/demote, injury/suspension override, face randomise

#### Pre-Season & Revenue
- Pre-season phase between contracts and Round 1: training camp focus, 1–3 trial matches, sponsor window, membership pricing
- Sponsor window: major/minor sponsors with value/length; renewal/expiry detection; renewal offers at +2–15% uplift
- Membership pricing + revenue applied at season start; shown in Club Management breakdown
- Home ticket price managed in Club Management; Match Day shows read-only price/gate context; prestige-sensitive price drag (elite clubs lose fewer fans above avg)
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
- Half-time team talk (Watch Game): feed auto-pauses at HT; 4 options (Fire Up / Encourage / Tactical / Berate); narrative added to feed; coached players' form adjusted heading into next match; Berate has per-player random variance

#### Bye Rounds (First Slice)
- Odd-team fixtures use phantom bye slot; `G.byes[]` per round
- Dashboard, Match Day, Fixtures, Topbar all show bye state; +8 condition boost for coached team

#### Daily Calendar & Fatigue
- Season runs day-by-day from Monday; topbar shows current date and the advance button moves one day at a time
- Match days follow actual fixture slots across Thu night, Fri night, Sat afternoon/twilight/night, and Sun afternoon/twilight/night; bye weekends advance through the calendar without team-sheet validation
- Auto-stop routing: Monday training review, Tuesday team-list deadline, away travel day, assigned match slot, other round games, Sunday recovery and judiciary review
- Calendar page shows next 14 days, match/bye context, other games/results for the current round, travel, recovery, deadlines, injury count, and load watch
- Match minutes/workload add player load; daily recovery reduces load and improves condition; overloaded or low-condition players have extra injury risk
- Monday training review gate requires `Mark review complete`; Tuesday team-list gate blocks advancing until the 19-man squad is compliant
- Sunday recovery/judiciary gate requires `Mark review complete` in Injury Ward before advancing to Monday
- Team Sheet shows selected-player fatigue risk and player-row fatigue warnings; Training page includes load-management advice and a review-complete control

#### Inbox & News
- Inbox page: category filter tabs, item counts, expand/collapse, post-match analysis news item, player quick-link

#### Player Development & Stats
- Age-banded weekly OVR growth (16–17: 38% → 28+: 2.5%), veteran mental growth, physical/technical decline from 29+
- Offseason development pass: Poisson gains + decline for all players; news summary of biggest movers (±2 OVR)
- Stat leaders page: position filter, top 25, all expanded stat categories including FDO, LB, LBA, MT
- Season Leaders page: positive/negative stat tabs; top 5 per stat in grid cards

---

### 🔧 Features Implemented — Needs Improvement

#### OVR Progression — Recalibrated (monitor for balance)
- Growth switched from binary weekly roll to Poisson-distributed gains (~6x higher expected rate). Target of 2–5 OVR per season for a 20yo on full game time should now be achievable.
- If the league feels it's progressing too fast, reduce `growExpected` values in `developPlayer` and `applyOffseasonDevelopment` (08-progression.js / 11-offseason.js).

#### Match Scheduling — Multi-Day Rounds (substantially complete)
- `genFixtures` assigns a unique slot (Thu Night → Sun Night, with Sat/Sun twilight as needed) to each game; no two share a slot.
- Fixtures page sorts games by slot order and shows the slot label + post-match weather.
- Match Day pre-match page shows the slot badge (e.g. "Sat Night") next to the round number.
- Calendar's "Next 14 Days" shows the slot label on the match day card and matchup detail for all game days.
- Calendar has a "Round Games" table showing all fixtures in slot order with upcoming/result status.
- `simMatch` applies afternoon/twilight/night try modifiers and adjusted weather pool; guard prevents re-simulation.
- All regular-season matches, including the coached team's match, simulate on their actual calendar day; popup shows early non-coached results; calendar stop shows matchup detail.
- Weekly payments, development, media, scouting and achievements now fire only when the whole round is complete.
- Dashboard shows a "Round N Results" panel after each round sorted by slot.

#### Bye Rounds — Partially Incomplete
- Ladder awards 2 pts for completed bye rounds; form history shows "B" dot; ladder page shows "BYE" tag. ✅
- Still needed: forced even-team-count byes, Origin round bye blocks, better multi-bye distribution per season.

#### Post-Match, Inbox, Avatars, Scouting, Facilities, Contracts — Partial
- Post-match: possession/completion % now computed and shown in all stat tables ✅; half-by-half breakdown ✅; historical full match reports are available from every completed fixture ✅.
- Inbox: action buttons implemented ✅; read/unread state ✅; player messages ✅; richer scout items ✅.
- Player avatars: current procedural SVG too complex at small sizes — consider simplified bold cartoon, pixel sprites, or canvas approach.
- Scouting: prospect backstory ✅; scout position-matching skill ✅; richer region probabilities ✅.
- Facilities: board expectations ✅; AI club facility tracking ✅.
- Contracts: rep-status premiums ✅; personality-based demand ✅; market scarcity by position ✅; ceremony UX for signings ✅.
- Hall of Fame: rep honour badges ✅; club legend wall ✅; richer ceremony UX ✅.
- Development insights: attribute-level delta tab on player modal ✅; offseason development review screen ✅.

---

### ❌ Features to be Implemented

#### Match View — Pause & Full-Time Graphic
- Half-time team talk is implemented (auto-pause + 4 options + form effect). ✅
- Pause button during the live second half so subs can be made mid-game (requires in-game sub system).
- Full-time: clear animated moment (siren graphic, score banner pulse, confetti for wins) so it's immediately obvious the match is over before the post-match screen appears. ✅

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
- State of Origin (QLD/NSW) is implemented (engine: `generateOriginSchedule`, `simOriginIfDue`; dashboard shows series scores and upcoming fixtures; inbox has Origin category). ✅
- Pacific Tests, Test series, international windows still to add.
- Coach rep-job offers, dual-role management, international fixtures not yet done.

#### NRL Standard League Mode
- New game wizard "NRL Standard" preset: 17 real NRL clubs, real names/colours/stadiums, 27-round season, correct finals format. ✅

#### Magic Round ✅ (already implemented)
- Engine: `G.magicRound` assigned in `05-game.js` and refreshed in `11-offseason.js`; `simMatch` uses magic round venue; host club earns $1.5M windfall via `payClubWeekly`; fixtures/matchday pages show Magic Round banner. Moving to ✅ section.

#### Crowd Vendor System ✅ (already implemented)
- Engine: `vendorRevenuePerHead()` in `08-progression.js`; F&B (L1–5: $3–$14/head) and Merch (L1–5: $1.5–$8/head) constants defined; revenue added to `payClubWeekly`. UI: `upgradeVendor()` in `club-management.js` with upgrade cards showing level, cost, and per-head yield. Moving to ✅ section.

#### Weather Events & Tactical Adjustment
- Weather affects try rates, crowd, kicking, and player-level handling errors/kick metres/territory-kick outcomes. Richer in-game tactical response to changing conditions still to add.

#### Lower Leagues & Expansion
- Second-tier competition, promotion/relegation, club merger/dissolution.

#### Staff Market — Periodic Refresh
- The available-for-hire coach/staff list should refresh periodically during the season with new candidates.
- Cap the pool at 10–12 coaches maximum; if a candidate hasn't been hired after a few months, drop them from the pool to make room for fresh names.

#### AI Club — Coaching Changes
- AI clubs should hire and fire coaches during the season based on on-field performance (e.g. poor run of form) and club financial health.
- Fire decisions should mirror the mid-season AI sacking logic already in place; hiring should pull from the same staff market pool.

#### Club Management — Ticket & Membership Price Comparison
- On the Club Management page, show how the coached club's home ticket price and season membership price compare to the league average and the highest/lowest prices set by other clubs.

#### Match Scheduling — Authentic NRL Week Structure
- Typical NRL round: 1 game Thursday, 2 Friday (5pm + 7pm), 3 Saturday (2pm + 5pm + 7pm), 2 Sunday (4pm + 6pm), 1 bye.
- Some rounds may vary (e.g. 3 Sunday, 2 Tuesday for Magic Round or holiday rounds) but the standard above should be the default.
- Slot times should be reflected in the existing slot-label system (Thu Night, Fri Afternoon/Night, Sat Afternoon/Twilight/Night, Sun Afternoon/Night).

#### Draw Generation — Season Variety & Turnaround Fairness
- Each season should generate a different draw where every team plays every other team once at home and once away (or as close as the round count allows).
- Scheduling should consider turnaround time: a team that plays the last game on Sunday (e.g. 6pm) should not be assigned the first game of the following Thursday (5pm) if avoidable, though clashes may occasionally occur.

---

### 💡 QoL Improvements

All items from the prior session were implemented. Items to consider for a future session:
- **Squad page sort reset**: squad page uses column-click sorting but has no reset-to-default button; low priority since sorts are per-column.
- **History page**: already had a "Clear" button — consider aligning its style with other Reset buttons.

---

### 🐛 Known Bugs

No open bugs at this time.

---

## Key Bugs Fixed (Reference)

| Bug | Fix |
|---|---|
| Minor sponsors not shown in Club Management | Added dedicated Sponsorship section to club-management.js showing all active deals |
| WG/CE overlap on team sheet pitch | Increased y-gap to 14% (WG y:83, CE y:69) and pushed WG flanks to x:91/9 |
| OVR delta badge missing for mid-season signings | `seasonStartOvr` now set in `submitFreeAgentOffer` and `_confirmTrialSign` |
| Match feed ✓/✗ mystery icons | Replaced with colour-coded `CONV` / `NO CONV` text in all scoring timelines |
| Bench player name/photo missing | Bench slots (14-17) now use compact meta; removed `white-space:nowrap` fit-pill overflow that collapsed pname |
| Team sheet rep-team label clutter | Removed `p.repTeam` text from team sheet rows; nationality flag only |
| Team list confirmation missing | Added explicit Confirm button + Tuesday gate requires `t.teamSubmitted === G.round` |
| Recruitment approach scroll | `doApproach` now explicitly saves/restores `m.scrollTop` via `requestAnimationFrame` |
| Recruitment final-year filter | "Final year only" checkbox in Browse; "Final year" toggle in Free Agents tab |
| Training no filter/sort | Added position filter buttons + sort dropdown (OVR/load/cond/form/pot/name) |
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
| Money helper forced `$0k`/`k` display | `money()` now uses selected currency symbol and full locale-formatted values |
| Old T&T limits/cap accounting | T&T now max 5 players, 6 games, $150k salary cap, and excluded from salary-cap payroll |
