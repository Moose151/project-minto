# Project Minto — Handover Document

Updated every session. Lists every requested feature with implementation status.

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
| `src/ui/pages/teamsheet.js` | Drag/drop field, effective OVR delta, pick-slot modal |
| `src/ui/pages/staff.js` | Hire/fire assistant coaches + medical physio; seasonal market |
| `src/ui/pages/scouting.js` | Scout dispatch, missions countdown, prospect sign/dismiss, scout market |
| `src/ui/pages/club-management.js` | Board standing, revenue/wages breakdown, salary cap overview, facility upgrades |
| `src/ui/pages/history.js` | Expandable year rows: awards, GF score, ladder snapshot, search/filter/sort controls |
| `src/ui/pages/hall-of-fame.js` | Retired-player Hall of Fame with induction cards, search, and sort |
| `src/ui/pages/records.js` | Records page: league career records, single-season records, and club-scoped player records |
| `src/ui/pages/clubs.js` | All-clubs browser; sort by ladder/OVR/name; head coach shown |
| `src/ui/pages/recruitment.js` | Approach limit (3/season), scroll preserved, free agent modal |
| `src/ui/pages/contracts.js` | Full contract ledger, year/salary filters, early extensions, flat/front/back-loaded deals |
| `src/ui/pages/squad.js` | Squad management with filter/sort |
| `src/ui/pages/training.js` | Individual and team training focus |
| `src/ui/pages/tactics.js` | Match plan, zone tactics, position roles |
| `src/ui/pages/coach.js` | Coach profile, skills, cash, history |
| `src/ui/pages/injuryward.js` | Injury list, play-hurt toggle |
| `src/ui/pages/ladder.js` | Full ladder; top-8 finals cut-line; team names clickable |
| `src/ui/pages/stats.js` | Stat leaders; position filter buttons; top 25; clickable team names |
| `src/ui/pages/fantasy.js` | Fantasy scoring with position filter and sort selector |

---

## Feature Status

### ✅ Implemented

#### Player System
- Deep individual attributes: Offensive / Defensive / Physical / Mental groups
- Position-weighted OVR (`calcOvr`) with specialist/side adjustments
- **Quality tiers** (8 levels): Park Level (OVR 0) → Colts Grade (45) → First Grade (55) → Top Flight (63) → Star Player (70) → Representative (76) → International (81) → **Immortal (92+, max 3 league-wide)**.
- **Nationality & rep eligibility**: weighted pool (Australia 50%, New Zealand 20%, Tonga 8%, Samoa 7%, Papua New Guinea 5%, England 4%, Fiji 3%, Cook Islands 2%, Lebanon 1%). Country names used throughout (not demonyms). Names are drawn from culturally-appropriate pools per nationality. Player profile shows nationality, rep-team, and state/All Stars chips; squad, recruitment, stat leader, fantasy, offseason award, and team-sheet rows/thumbnails show flag/rep context.
- **Procedural player avatars**: every generated/migrated player stores `p.face`, rendered as a seeded SVG cartoon with nationality-skewed skin tone, age-influenced hair, body/jersey shapes, and team jersey colours.
- Avatars now show on player profile headers, squad rows, recruitment rows, team-sheet field/bench/squad rows, stat leaders, fantasy tables, and offseason award/team-of-season cards.
- **Position key skills highlighted** on player page: attributes weighted ≥0.07 shown with ★ brass highlight.
- Career history, injury history, awards history on player page.
- Player page season history has search and sort controls.
- Clickable player links everywhere (history, awards, offseason review, predictions).
- Scouting confidence: own team = exact, shortlisted = high, others = med/low.
- **Player form/confidence — first slice**: every player now has `p.form` (migrated for old saves), seeded at generation, regressed toward neutral between seasons, and updated after every match from rating, result, tries/assists/field goals/40-20s, errors, and injuries. Form gives modest match-day power/execution effects, influences auto-pick selection, affects cohesion through the selected starters' average form, and appears in squad, player profile, team sheet, contracts, and recruitment.
- **Forced drop-outs — first slice**: kickers can now force drop-outs from repeat-set pressure in `simTerritoryKicks`; tracked as `fdo` in match lines, season stats, player season history, stat leaders, player profile, fantasy scoring (2pts), fantasy table/sort, round-results summaries, and live match feed events. FDOs also add to the player rating formula. Old saves migrate `p.s.fdo = 0`.
- **Expanded career totals — first slice**: `p.career` now stores expanded totals for goals attempted, field goals, try assists, tackles, metres, runs, errors, fantasy points, 40/20s, forced drop-outs, minutes, missed tackles, line breaks, LB assists, kicks, kick metres, infringements, rating sum, and votes. Match sim, field goals, votes, and infringements update them live; old saves backfill from season history where available; player profiles show expanded career totals.
- **Club-by-club player totals — first slice**: every player now has `p.clubStats`, keyed by club/team ID, tracking games and all expanded stat totals for each club they play for. Match sim (via `addLineToStatBucket`/`playerClubStatBucket`), field goals, votes, infringements, and premierships all update club buckets live. Old saves backfill club totals from season history where possible. Player profiles show a Club Career Totals table.
- **Records page — first slice**: added a Records page under Club & Career showing league-wide career records, single-season records from player history, and club-scoped player records. Club scope can be switched between all clubs and an individual club.

#### OVR / POT Display
- Single number for all OVR/POT displays; colour-coded by scouting confidence.
- Individual attribute values also confidence-coloured for opposition players.

#### Team Sheet
- Field-based drag-and-drop layout with NRL-style field styling.
- Sortable squad list; positional fit colours; effective OVR delta.

#### Match Engine
- Try scoring via Poisson distribution; rebalanced formula (max tries 9).
- **Infringements**: full graded system (careless/reckless/intentional); sin bins, send-offs, tribunal bans.
- **Live match feed**: try scorer descriptions, assist text, conversion result, running score, penalty goals, infringement events, half-time score, full-time banner.
- Venue uses home team's named stadium; "Grand Final Stadium" for the GF.
- Weather and crowd now affect match simulation: heavy/light rain, wind, and humidity reduce scoring/kicking efficiency; larger home crowds give a small home-side lift.

#### Fixtures (Rewritten)
- **Paginated by round**: prev/next buttons, dropdown, "Now" button.
- Each match shows home team's **stadium** and crowd attendance (played matches).
- Finals bracket shown above navigation.

#### Finals — NRL Top-8 System (Rewritten)
- Week 1: Qualifying Finals (1v4, 2v3) + Elimination Finals (5v8, 6v7).
- Week 2: Semi Finals. Week 3: Preliminary Finals. Week 4: Grand Final.
- Advance button label updates per week.
- Falls back to top-4 (2-week) for leagues with <8 teams or old saves.

#### Bookie Odds (Fixed)
- Formula: `odds = 1 / (probability × overround)`. Even match = ~$1.85 each. Favourite always under $2.

#### Predictions Page
- Bookie odds, media snippets, round-all-odds table, projected ladder, award frontrunners.

#### Recruitment & Contracts
- Approach limit (max 3/season). Scroll preserved. Free agent modal. Stable signing %.

#### Staff / Assistant Coaches
- 6 roles: Attack, Defence, Fitness, Kicking, Development (youth), **Medical Physio** (accelerates injury recovery).
- Positional coach roles added for FB, WG, CE, FE, HB, PR, HK, SR, and LK.
- Staff ability → salary and training/recovery bonus. Seasonal hire market.
- Staff salaries from **club funds**.
- Positional coaches improve retraining speed for their position and boost relevant key-skill development.

#### Medical Staff
- `'medical'` role in `STAFF_ROLES`. Physio gives per-week chance (`ability/220`) to reduce a player's injury by an extra week.
- Appears in staff market automatically.

#### Club Revenue System
- `G.club = { funds, seasonRevenue, seasonWages }`.
- Weekly: gate (crowd × $28) + broadcast ($75K) added; player + staff wages deducted from club funds.
- Club Funds shown on dashboard.

#### Scouting System
- `G.scouting = { scouts, missions, prospects }`.
- **Scouting page**: hire/fire scouts; dispatch idle scouts to 13 regions (SEQ, North QLD, NSW/ACT, NSW Country, Victoria/SA, NZ, Samoa, Tonga, Fiji, PNG, England, France, Ireland/Scotland); regions take 2–7 weeks with different position/nationality pools. ✅ **Two-step dispatch UI**: select region → pick target position (Any or specific) → scout carries `mission.targetPos`; `advanceScouting` uses it with 75% bias when generating the returned prospect.
- Scout returns with a young prospect (age 16–19) added to `G.players` with `squad:'dev'`; news item generated.
- **Prospects panel**: sign to dev squad (cap check enforced) or dismiss.
- Scout market refreshes each season; salaries from club funds.

#### AI Coach Names
- All AI teams have `t.headCoach = { name, rep }` generated at game start.
- Head coach name and reputation shown on Clubs page cards and team modal.

#### Club Management Page
- Board sentiment + confidence bar + on-track vs board target indicator.
- Season progress (rounds played vs total).
- Revenue breakdown (gate / broadcast / season totals) and wages breakdown (players / staff / scouts).
- Salary cap bar + cap room remaining.
- Quick links to Staff, Scouting, Contracts, Recruitment pages.

#### Facilities — First Slice
- `G.club.facilities = { stadium, training, gym, medical, academy }`, each level 1-5; new saves start with stadium level 2 and other facilities level 1.
- Old saves migrate facilities via `ensureClubFacilities()`.
- Club Management has a Facilities section with level bars, upgrade costs, and upgrade buttons paid from club funds.
- Stadium level controls home match capacity: level 1-5 = 18k / 26k / 34k / 42k / 52k.
- Match Day projected crowd is stored on the fixture once viewed; the match engine respects that projected weather/crowd when simmed.
- Home crowd generation for the coached club is capped by stadium capacity; gate revenue now tracks exact `G.club.gateRevenue` and broadcast revenue tracks exact `G.club.broadcastRevenue`.
- Training ground and academy modestly improve player development; gym improves weekly conditioning recovery; medical centre improves the extra injury-recovery chance alongside physio staff.

#### Preseason & Commercial Revenue — First Slice
- Offseason contracts now flow into a Preseason screen instead of jumping directly to Round 1.
- Preseason includes membership/season-ticket pricing with projected members and revenue.
- Sponsor window offers major/minor sponsors with value and contract length; only one major sponsor can be accepted.
- Training camp focus (balanced/attack/defence/fitness) gives modest young-player attribute gains when the season starts.
- Up to three preseason trial matches can be played; trials do not affect ladder/season stats but can reduce condition and rarely cause minor injuries.
- Starting the season applies membership and sponsorship revenue to club funds and season revenue.
- Club Management revenue breakdown now includes memberships and sponsorship.
- Home ticket price can be adjusted on Match Day for home fixtures; price affects projected crowd and gate revenue.
- Gate revenue is now only earned on coached-club home games and uses that fixture's ticket price.

#### Club Prestige & Tier Icons — First Slice
- `clubPrestigeScore(t)` and `clubPrestigeTier(t)` added. Score is driven by squad strength, coach reputation, ladder position, recent history, and coached-club facilities.
- Club prestige now affects `contractSignChance()`, with ambitious players more likely to accept higher-prestige clubs.
- Club prestige badges appear in the Clubs page, club modal, recruitment club column, and stat leader club column.
- Player quality tier badges appear in squad rows, recruitment rows, stat leaders, club modal squad rows, and player profile header.

#### History Page (Rewritten)
- Click any year row to expand full detail panel.
- Detail: 3-column grid — Awards (POTY votes, Rookie, top try scorer, Coach of Year), Grand Final score (GF teams + score stored per season), Ladder snapshot with your team highlighted.
- All player/team names clickable in expanded view.
- Search/filter/sort controls: search by team/player/coach/year; sort newest/oldest/best coach finish/premier; filter for my premierships, minor premierships, grand finals, top-4, and bottom-4 seasons.

#### Clubs Page (Rewritten)
- Sort by Ladder / OVR / Name buttons.
- Team cards show head coach name + rep category (Elite/Experienced/Developing/Junior).
- Team modal shows coach name, ladder pos, W-L record.

#### Coach Income & Progression
- Coach salary paid weekly from personal cash. Skills upgradeable on Coach Profile page.
- Coach badges are derived from reputation, wins, premierships, seasons at club, winning record, and attribute milestones; shown on Coach Profile.

#### Stats Page
- Position filter buttons (All / FB / WG / CE / FE / HB / PR / HK / SR / LK).
- Shows top 25. Team names clickable.

#### Ladder Page
- Finals cut-line after position 8 (or 4 for small leagues). Team names clickable.

#### Match Day Page
- Pre-match venue uses home team's actual stadium. Coach vs coach head-to-head shown.

#### Staff & Scout Contract Expiry
- `yearsLeft` decremented each offseason; expired members removed with news item; scout missions cancelled on departure.

#### God Mode — First Slice
- Options page can permanently enable `G.godMode`; this also sets `G.achievementsLocked = true`.
- Top bar shows a red God Mode badge when active.
- Options page allows salary cap editing when God Mode is active.
- Player modal shows an Edit Player button when God Mode is active.
- Player editor supports name, age, primary/secondary position, squad, salary, contract years, nationality, preferred city, height/weight, injury status, suspension weeks, and all attributes; saving recalculates OVR and keeps POT at least OVR.
- Player editor supports randomising the player's procedural face in God Mode.
- Club Management allows club funds and board confidence editing when God Mode is active.
- Clubs modal allows editing any team identity/abbr/stadium/jersey colours in God Mode.
- Clubs modal allows force-releasing any player to free agency in God Mode.
- God Mode can promote/demote players between top/dev squads from club and squad views.

#### Achievements — Starter System
- `G.achievements` stores unlocked achievements; `G.achievementsLocked` blocks unlocks on God Mode saves.
- Achievements page added under Club & Career.
- Achievement cards now have tiered badge styling (bronze/silver/gold), per-achievement badge labels, locked-card treatment, and clearer unlock season/year/round metadata.
- Unlock checks run after regular rounds and season review.
- Implemented starter unlocks: premiers, repeat, dynasty, minor premiers, wooden spoon, perfect season, grand final debut, whitewash, century, shutout, player/rookie of year from your club, Immortal player, 10 seasons, full house, debt free, bottom-to-top, giant killer.
- Achievement unlocks create news items and toast notifications when UI is available.

#### Hall of Fame — First Slice
- `G.hallOfFame` stores retired-player induction snapshots; old saves migrate with an empty list.
- Retiring players are scored for Hall of Fame eligibility using career games, tries, points, premierships, awards, peak OVR, and average rating. Peak OVR 88+, 3+ premierships, or Player of the Year can force induction even if the score is borderline.
- Hall of Fame inductees generate a news item and retain a snapshot with name, position, nationality/rep team, final club, induction year, peak OVR, quality tier, career totals, awards, and recent history.
- Hall of Fame page added under Club & Career with search and sort by legacy score, induction year, peak OVR, games, points, tries, and name.

---

### ❌ Not Yet Implemented (All Requested)

Items marked **[REPEAT]** have been requested in previous sessions and remain outstanding.

#### UI Overhaul **[REPEAT]**
- **Full UI overhaul from the ground up**: redesign layout, spacing, page hierarchy, component system, typography, colour scheme, and visual language across the whole app.
- Add dark/light theme support with a proper theme toggle, accessible contrast, and consistent status colours.
- Better navigation: clearer grouped nav, hub pages for major areas (Club, Squad, Match Day, Competition, Career), persistent breadcrumbs/back navigation, and obvious return paths from every modal/detail page.
- Make everything sensible clickable/linkable: player names, teams, coaches, stadiums, awards, news stories, Hall of Fame entries, contract statuses, fixtures, stats, and history records should route to useful detail views.
- Preserve UI state more consistently: selected tabs/dropdowns/filters/sorts/searches, scroll position, chosen page sections, and selected records should stay stable when navigating away/back.
- Add richer graphics: custom team logos/crests, better jerseys, player portrait use, match graphics, form/confidence visuals, trophy/award treatments, facility visuals, and stronger empty/loading/error states.
- Improve hub pages: Dashboard, Club Management, Squad, Competition, Career/Coach, Contracts, Scouting, Staff, and History should act as clear command centres rather than tables only.
- Better responsive layout across mobile/desktop, including denser desktop tables and clean mobile cards.
- More separation between position groups on team sheet; more accurate NRL field representation.
- Better Game Day screen and live match view: richer pre-game context, lineups, key matchup cards, tactical notes, live score/timeline, possession/momentum, event filtering, and better post-game transition.

#### Filter & Sort — All Pages **[REPEAT]**
- Squad, Recruitment, Contracts, Stats, Fantasy, and History have it.
- Player profile season-history table has it.
- Still to do: any future reserve/youth/rep stat pages.

#### Assistant Coach Specialisations **[REPEAT]**
- First slice complete: assistant coaches have a primary role (Attack/Defence/Fitness/Kicking/Development) **and** a positional specialization (e.g. "Attack Coach — Halfback Specialist"). Positional specialization replaces old standalone positional-role entries (pos_FB, pos_WG, etc.) which are migrated on load. Medical (Physio) does not have a positional specialty.
- Still to do: coaches improve over time; coaching courses; headhunting by AI clubs; head coach career path.
- **Assistant head-coach pathway implemented**: when an AI club sacks its head coach, high-ability assistants from your staff can be hired away as the replacement. Promotion readiness is based on assistant ability, role fit, and remaining contract length. Promoted assistants leave `G.staff`, become `t.headCoach`, and generate a coaching news item.

#### Coach Reputation & Badges **[REPEAT]**
- First slice complete: badges earned through reputation, wins, premierships, loyalty, winning record, and attribute milestones.
- **AI coach rotation implemented**: each offseason, AI coaches that finish in the bottom 25% of the ladder with ≥2 seasons tenure have a 45% chance of being sacked; bottom-half coaches with ≥4 seasons have a 10% chance. Replacement coaches are generated with fresh names and lower rep. A news item is generated. Surviving coaches gain/lose rep based on finish.
- **Assistant coach promotions implemented**: AI vacancies can now be filled by promoted assistants from your staff instead of only by generated names; the Coach of Year award also uses actual AI head-coach names.
- Reputation → job offers (rival clubs, rep teams, international).

#### Facilities — Remaining **[REPEAT]**
- First upgradeable slice is complete: stadium capacity, training ground, gym, medical centre, and academy are funded/upgraded in Club Management and affect crowds/revenue/training/recovery.
- **Upgrades now take time to complete** ✅: when a facility upgrade is purchased, it enters a "under construction" state. Build durations: stadium 8w, training 5w, gym/medical 3w, academy 5w. `G.club.construction[key] = {targetLevel, completesRound, startsRound}`. `tickConstruction()` called weekly; completion fires a news item. Club Management shows a progress bar + ETA badge and disables the button while building. Stadium capacity drops one tier during construction. Cost deducted upfront.
- Still to do: guest facilities, richer board expectations around facilities, AI club facilities, facility prestige icons, and bigger long-term effects on recruitment/prestige.

#### Club Prestige & Tier Icons **[REPEAT]**
- First slice complete: prestige score/tier is driven by facilities, results, squad strength, coach reputation, and recent history; it affects player willingness to sign.
- First slice complete: club prestige icons shown in club browser/modal, recruitment, and stat leaders.
- First slice complete: player quality tier icons shown in squad, recruitment, stat leaders, club modal, and player modal header.
- **Custom team logos — first slice implemented**: teams now store generated `t.logo` crest data with shape/letters/stripe, old saves migrate via `ensureTeamLogo(t)`, and logos render as inline SVG in Clubs cards/modals, Dashboard next match/mini ladder, full Ladder, Fixtures/finals brackets, Match Day, and live match feed headers. God Mode team editor can edit logo letters, shape, and stripe.
- Still to do: show logos in top/nav/hub redesign, history/news/stat/recruitment rows, save/load metadata, richer generated mascot artwork, uploaded/custom user image support if desired, and stronger brand consistency after the full UI overhaul.
- Still to do: use prestige for lower-league promotion/relegation eligibility once lower leagues exist.
- **Immortal cap now enforced**: Immortal tier raised to OVR 92+ (was 86). When a player's OVR would cross 92 via weekly development, if 3+ Immortals already exist league-wide, the attribute gain is reversed and OVR stays at 91. When a new Immortal is created (slot available), a news item fires. Max 3 Immortals active at any time.

#### Contracts, Salaries & Loyalty **[NEW]**
- **Realistic salary first slice implemented**: `salaryFor(p)` now considers overall, position premiums (spine/key-position loading), career games/experience, age curve, current form, durability/injury risk, recent awards, quality tier, and deterministic player-specific market jitter. `demandFor(p)` inherits this because it builds from `salaryFor(p)`.
- Still to do: representative-status premiums once rep games exist, richer market scarcity by position/available free agents, salary expectation personalities, and UI explanations for why a player demands a certain amount.
- **Full contracts page implemented**: Contracts page is now a full squad ledger showing every player's current salary/cap hit, average salary, total remaining value, years left, structure, schedule, and contract intent. It can filter by position, age, OVR, potential, intent, years remaining, and salary band; it can sort by OVR, current salary, average salary, total value, years, demand, form, and key stats.
- **Loaded contracts implemented**: player contracts can now be flat, front-loaded, or back-loaded using `p.contractSchedule`. `p.salary` remains the current-season cap hit for compatibility. Contract schedules migrate for old saves, advance each season, are used in cap checks, and are shown in the ledger/profile/negotiation UI.
- **Early contract extensions implemented**: Contracts page now includes final-year players plus settled players with 1+ years remaining who are open to early talks. Filters include open/final-year, early extensions, final-year only, at-risk, and all players.
- **Contract intent states implemented**: `contractIntent(p, toTeam)` returns eager to stay, open to talks, wants to test market, wants out, retiring/undecided, under contract, or not now. Intent is based on loyalty, morale, form, ambition, preferred city, club prestige, release requests, age, and years remaining. Players who are not open will refuse early talks.
- **Loyalty first slice expanded**: high-loyalty players at their current club now receive a demand discount and higher signing chance; contracts UI shows loyalty and intent. Still to do: richer poaching resistance, personality-specific salary expectations, and stronger reactions to broken promises or forced moves.

#### Player Form & Confidence **[NEW]**
- **First slice implemented**: `p.form` is the combined form/confidence value. It moves after each match based on rating, result, scoring/assist/kicking moments, errors, and injuries; non-selected players drift toward neutral. New seasons partially regress form toward 50.
- **First slice implemented**: form gives modest match-day boosts/penalties in `lineupPower()`, changes error likelihood and rating slightly, influences auto-pick selection, and affects cohesion through the starters' average form.
- **First slice implemented**: form appears in player profile, squad table/sort, team sheet rows/sort, contracts, and recruitment.
- Still to do: richer triggers for missed tackles/clutch moments/suspension, clearer hot/cold streak news, coach/media reactions, tactical effects under pressure, and stronger integration into future representative selection UI.
- Rep-team selection should consider form/confidence alongside OVR, position fit, eligibility, experience, and reputation, so hot players can force their way into Origin/international squads.
- Still to do: show form/confidence in predictions and any future representative selection UI.

#### Hall of Fame — Remaining **[NEW]**
- First slice complete: retired players with exceptional careers can be inducted automatically and viewed on a Hall of Fame page.
- Still to do: representative honours once rep games exist, club legend/franchise-specific halls, richer retired-player profile pages, Hall of Fame ceremony/offseason UX, and more nuanced era/position balancing.

#### Player Profile — Nationality & Rep Teams
- Complete first slice: player modal, squad, recruitment, stat leaders, fantasy, offseason award cards, Team of the Season rows, and team-sheet thumbnails/rows show flag/rep/state context where space allows.

#### Full Pre-Season & Offseason Experience
- First slice complete: pre-season phase exists between contracts and Round 1.
- First slice complete: training camp focus, 1-3 trial matches, sponsor signing window, membership pricing/revenue.
- Still to do: position-group camp allocation, richer trial team selection/combination effects, media season preview, and development projection screen.

#### Revenue System — Tickets, Memberships & Sponsorship
- First slice complete: gate and broadcast revenue are tracked separately, stadium capacity caps coached-club home crowds, home ticket price affects projected crowd and gate revenue, memberships are priced in preseason, sponsorship deals are signed in preseason, and sponsorship/membership income appears in Club Management.
- **Sponsor renewal/expiry UX now implemented**: `generateSponsorOffers()` detects sponsors with `yearsLeft === 1` and prepends renewal offers (same company, +2–15% value uplift, marked `renewal:true`). Preseason shows three tiers: active secured deals, expiring deals needing renewal (amber border, warning), and new opportunities. `acceptSponsorOffer` removes the old expiring deal when a renewal is accepted.
- **Facility degradation now implemented**: each season at `startNewSeason`, each facility above level 1 has a 12–27% chance of degrading by 1 level. A news item reports which facilities degraded.
- Still to do: richer sponsor categories/competition, long-term sponsor effects, board pressure around facilities.

#### Player Avatars — Enhancements Remaining
- First slice complete: `p.face` is generated/migrated, stable by player ID, and rendered with pure inline SVG.
- First slice complete: avatars appear on player profile, squad, recruitment, team sheet, stat leaders, fantasy tables, offseason award cards, and Team of the Season rows.
- First slice complete: jersey colours match current team colours; free agents fall back to a neutral kit.
- First slice complete: God Mode player editor can randomise a player's face.
- Still to do: richer face parts (more noses, facial hair, ears, eyebrows, scars/headgear), more body-build variation from strength/speed/weight, and optional larger portrait cards for media/news stories.
- Still to do: make avatar colour/shape tuning less rough once the UI overhaul settles, especially for very small team-sheet thumbnails.

#### Player Editor (God Mode gated)
- Mostly complete: button is visible in God Mode and editor supports name, age, positions, squad, all attributes, salary, contract years, nationality, preferred city, height/weight, injury status, and suspension weeks.
- Face randomise is complete.
- Still to do: reserve squad if/when reserve squads are added.

#### God Mode
- First slice complete: toggle in Options page, permanent `G.godMode = true`, `G.achievementsLocked = true`, confirmation dialog, and top-bar badge.
- **What God Mode unlocks:**
  - Player editor (all attributes, salary, age, position) — first slice complete
  - Player face randomise — complete
  - Team editor: rename team name, city, abbreviation; change jersey colours — complete
  - Edit salary cap (`G.config.cap`) directly in Options — complete
  - Edit club funds (`G.club.funds`) directly in Club Management — complete
  - Force-release any player from any club (not just your own) — complete
  - Promote/demote any player between dev / top / reserve squad at any team — top/dev complete; reserve pending if reserve squads are added
  - Set any player's injury status — complete
  - Add/remove suspensions manually — complete
  - Override board confidence directly — complete
- **Without God Mode**, the only editable fields anywhere are: your own player names (cosmetic rename — already possible in player modal).

#### Achievements — Full Starter Set
- All 20 achievements implemented and triggering.
- `comeback` now works: `simMatch` writes an approximate `det.htScore` via random halftime try split; `checkAchievements` unlocks if we were 20+ down at half and won.
- `scouting_star` now works: `signProspect` tags `p.fromScouting = true`; checked each round for any squad player with that flag and OVR 80+.
- Visual badge system complete: tiered bronze/silver/gold cards, locked treatment.

| Key | Name | Condition | Status |
|---|---|---|---|
| `premiers` | Premiers | Win the premiership | ✅ |
| `repeat` | Back-to-Back | Two consecutive premierships | ✅ |
| `dynasty` | Dynasty | Three or more consecutive | ✅ |
| `minor` | Minor Premiers | Finish 1st in regular season | ✅ |
| `wooden_spoon` | Wooden Spoon | Finish last | ✅ |
| `perfect_season` | Undefeated | Win every regular season game | ✅ |
| `grand_final_debut` | Grand Final Debut | GF in first season | ✅ |
| `comeback` | Great Escape | Win from 20+ down at half-time | ✅ |
| `whitewash` | Whitewash | Win by 50+ | ✅ |
| `century` | Century | Score 100+ | ✅ |
| `shutout` | Clean Sheet | Win without conceding | ✅ |
| `poty_winner` | Coach's Player | Your player wins POTY | ✅ |
| `rookie_winner` | Early Bloomer | Your player wins Rookie of Year | ✅ |
| `immortal_player` | Immortal | Immortal-tier player in squad | ✅ |
| `10_seasons` | Veteran Manager | Complete 10 seasons | ✅ |
| `scouting_star` | Diamond Scout | Scouted prospect reaches OVR 80+ | ✅ |
| `full_house` | Sold Out | 40,000+ home crowd | ✅ |
| `debt_free` | In the Black | $5M+ club funds | ✅ |
| `bottom_to_top` | From the Ashes | Premiers after bottom-4 finish | ✅ |
| `upset` | Giant Killer | Beat a team 20+ OVR above you | ✅ |

#### Promises Rework — Implemented
- Three new promise types added alongside existing `role` and `captain`:
  - **Guaranteed game time** (`minutes`): player expects ≥55% appearances; checked weekly after Round 8. Boosts signing chance; diluted if squad already has 4+ such promises.
  - **Finals selection** (`finals`): player expects to be picked if team qualifies for finals. Bigger bonus for veterans (age 30+).
  - **Development pathway** (`pathway`): for players ≤22 — must appear in ≥35% of games after Round 10. Strong signing bonus for young players.
- `normalisePromises` extended; `promiseSummary` shows all active types; `auditContractPromises` checks minutes and pathway each round.
- Contract offer modal shows new promise checkboxes with plain-English explanations and warnings.
- **`finals` breach check now implemented**: `startFinals()` in `10-finals.js` checks the player's team's lineup when finals begin. If a promised player isn't in the 17, morale drops 10, `promiseConcern` +3, and a news item fires. Persistent release-request logic applies.
- **Promise summary on squad page**: each player row in Squad shows active promise obligations under their name/rep line (warm brass colour, clipboard icon), so the coach can see at a glance who has outstanding commitments.

#### Nationality Labels & Ethnicity-Appropriate Names ✅ COMPLETE
- **Nationality labels**: stored as country names ("Australia", "New Zealand", "Tonga", "Samoa", "Papua New Guinea", "England", "Fiji", "Cook Islands", "Lebanon") in `NATIONALITY_POOL`, `SCOUT_REGIONS`, `skinByNat`, and `nationalityFlag`.
- **Ethnicity-appropriate name pools**: `NAME_POOLS` added in `02-data.js` with authentic first/last name arrays for all 9 nationalities. `genPlayer` now picks nationality first, then draws the player name from the matching pool. Scouting prospects also get their name regenerated after nationality override.
- **Migration**: `migratePlayer` converts old demonym strings (e.g. "Australian" → "Australia") automatically on load. `nationalityFlag` retains fallback demonym keys for old saves not yet migrated.

#### Scouting — More Locations & Targeted Position Search **[NEW]**
- Add more scouting regions beyond the current 7 (e.g. South Sydney, NSW Country sub-regions, Polynesia, France/Europe, Americas, Japan/Korea).
- Allow coaches to target a specific position when dispatching a scout — the mission prioritises prospects of that position within the region's position pool.
- Show the target position on in-progress mission rows and in the prospect reveal.
- Still to do: scout skill in matching specific positions, position-specific confidence ratings, region/position combination probabilities, and richer prospect backstory text.

#### Representative & International Games **[REPEAT]**
- Queensland / NSW State of Origin during season break.
- Pacific Tests / World Cup / Test series / international windows.
- Player eligibility already stored (nationality, repTeam, stateRep fields).
- Add rep-team squads, selection rules, fixtures, match sim, injuries/condition impact, awards, and career/season history for rep appearances.
- Add coach nationality, state eligibility, and preferred rep teams to coach creation. These should control which State of Origin and national jobs the coach can be offered.
- Top-league coaches only should receive rep-team job offers. Rep jobs should be based on reputation, form, achievements, and eligibility; a coach can manage their club plus one state/national rep role at the same time.
- Add a top navigation/team-context switcher so the user can switch between normal club management and any active representative team job.
- Apply the same framework to national teams: eligible coaches can be offered country jobs, manage squads/selection/tactics, and play international fixtures while retaining their club job.

#### Lower Leagues & Expansion **[REPEAT]**
- Second-tier competition; promotion/relegation; club merger/dissolution.

#### Advanced Match Engine
- Step-based possession (sets of 6).
- Stamina-aware substitutions. Position-based fatigue.
- Interactive penalty/field goal choice during live watch mode.
- First slice complete: weather and crowd effects influence scoring/kicking/home advantage.

#### Match Engine — Rugby League Logic Depth **[NEW]**
- Add true tackle-count logic: track tackles 0-5 during each set and have AI choose hit-ups, shifts, kicks, field goals, or other play types based on tackle count, field position, score, weather, and team tactics.
- Live match view should show the game clock, field position, possession team, and current tackle count.
- Each play should update field position, tackle count, possession, fatigue, ruck speed, errors, scoring chances, and event feed output.
- Add goal-line drop-outs: if a player is tackled in their own in-goal or grounds/plants the ball in their own in-goal, restart with a drop-out.
- Add forced drop-outs as a team/player stat and generate them from strong attacking kicks, repeat-set pressure, and defensive in-goal outcomes. ✅ First slice implemented through repeat-set kicking pressure; defensive in-goal outcomes should deepen once the set-by-set engine exists.
- Add 20m taps: if a team kicks the ball dead, the opposition receives a 20m tap and a 7-tackle set (display as "p-6" or equivalent set-start state).
- Late-game decision logic: teams losing with little time remaining become more erratic/aggressive, taking higher-risk plays, short kick-offs, short drop-outs, early shifts, and attacking kicks when appropriate.
- Field-goal logic: teams leading by 6 with little time left should seek a field goal to create a two-possession lead; this should also affect penalty-goal decisions when leading by 6-10.
- Add scrums after dropped balls/knock-ons, with the feeding team winning roughly 98% of feeds.
- Add richer kick restart logic, including short kick-offs and short drop-outs for trailing teams or strategic late-game situations.
- Model ruck speed as a major match factor. High ruck speed plus possession should tire opponents faster and create attacking momentum.
- Add "win the wrestle" contests at the tackle/ruck: attacker strength/stamina/body type can increase ruck speed, defender strength/stamina/tackling/marker defence can slow it down.
- Ruck speed should affect defensive fatigue, retreat distance, line speed, penalties/six-agains if added later, completion rate, and attacking play success.

#### Team Sheet Layout & Display — First Slice Complete **[NEW]**
- ✅ Colour-name text labels removed from pitch cards (green/orange etc.) — fit quality shown by card outline only.
- ✅ OVR displayed with proper colour coding (elite/good/avg/poor) in pitch sub-text.
- ✅ Player positions spread wider (WGs at x:18/82, CEs at x:32/68, PRs at x:32/68) for a more symmetrical NRL formation.
- ✅ Stat strip shows cohesion and condition with mini progress bars for quick visual read.
- ✅ Avatar now centred in card with jersey number badge; empty slots show jersey only.
- ✅ Pitch uses 2:3 aspect ratio, alternating grass stripe background, better goal post SVGs, in-goal zones shown.
- Still to do: wider spacing improvements on very narrow screens, smoother cohesion line rendering, more accurate in-goal zone shading.

#### Team Logos — First Slice Improved **[NEW]**
- ✅ Richer SVG shapes (shield/round/diamond/hex) with inner border ring, drop shadow filter, better clipping, improved stripe variants, larger letter text.
- Still to do: fully custom mascot artwork, more shape variety (arch, pointed crest), custom user-uploaded logo support.

#### Player Avatars — Needs Rethink **[NEW — BROKEN]**
- The current procedural SVG approach is producing poor results — overly complex paths that don't render recognisably at the small sizes used throughout the UI (26–42px display).
- The latest session attempted to add more detail (ears, eyebrows, nose, dreadlocks, ponytail, mohawk) but the result is actually worse than the previous version at small sizes.
- **Fundamental problem**: Procedural SVG cartoon faces have a hard ceiling at small display sizes. More paths ≠ better-looking avatars.
- **Possible alternative approaches to consider**:
  1. **Pixel art sprite sheets**: A small set of base player sprites (maybe 10–12 variations) coloured with team jerseys at render time. Consistent style, works at any size, can be made by a pixel artist or AI image tool. Sprites stored as base64 data URIs in a JS file.
  2. **Pre-generated AI portraits**: Use an AI image generator to produce a grid of 50–100 generic NRL-player-style portraits in a consistent style; pick one per player by seeded index. Store as compressed base64 JPEGs. Very small file size if done at 64×64.
  3. **Simplified bold SVG** (current approach refined): Go back to basics — very large eyes, thick strokes, only 5–6 elements total. A simple cartoon works far better at small sizes than a complex one. Think sticker / emoji art style rather than portrait.
  4. **Canvas-based rendering**: Use `<canvas>` instead of SVG for more rendering control and GPU acceleration, especially for a larger portrait card.
- **Recommended next step**: Revert avatar to a clean simple version (approach 3) and separately design a larger "portrait card" format for the player profile page only.
- Nationality-weighted hair styles (mohawk, dreadlocks, ponytail) are in `genPlayerFace` in `03-players.js` — these should be preserved regardless of rendering approach.
- `genPlayerFace` now also stores `facialHair` boolean (seeded per player, age 22+).

#### Team Sheet — Larger Player Cards ✅ IMPLEMENTED
- Card width increased from 118px → 124px.
- Player name font: 13px → 14px (bold).
- OVR number: `ovr-xs` 14px → 17px (dominant visual element on card, colour-coded by tier).
- Position label: 10px → 11px, slightly more readable.
- Responsive breakpoint adjusted: mobile (≤620px) now 88px wide cards instead of 84px.

#### Team List Player Ordering — NRL Standard ✅
- `NRL_POS_ORDER = ['FB','WG','CE','FE','HB','PR','HK','SR','LK']` added to `05-helpers.js` with `nrlPosIdx(p)` and `nrlSort(a, b)` helpers.
- Squad page defaults to NRL position sort (`sortKey:'pos'`, `sortDir:1`); position column header click uses `nrlSort` instead of alphabetical.
- Clubs team modal sorts by `nrlSort` instead of OVR.
- Still to do: match day lineup, bench rows in team sheet, post-match stats tables.

#### NRL Standard League Mode **[NEW]**
- New game wizard should offer an "NRL Standard" preset: 17 teams (matching current NRL clubs), accurate round count (27 regular season rounds), correct finals format (top-8 NRL McIntyre system).
- Currently the game generates random team names/rosters; NRL mode should use actual NRL team names, cities, abbreviations, and traditional colours (or close approximations).
- Round schedule should match the NRL structure: games per round, double-header rounds, Origin round scheduling.
- Future: real club stadiums with real capacities, match scheduling by day-of-week (Thursday night, Friday night, Saturday, Sunday afternoon/evening).

#### Bye Rounds — NRL Structure ✅ FIRST SLICE IMPLEMENTED
- **Fixture generator updated** (`genFixtures` in `04-teams.js`): odd team counts (9, 11, 13, 15, 17…) now automatically generate bye rounds using a phantom bye slot (-1) in the circle algorithm. Each team gets 2 byes in a full double-round-robin season (once per half).
- **`G.byes` array**: stores `[teamId]` (or `[]`) per round; set at game start; old saves migrate with empty arrays.
- **Fixtures page**: bye rounds show a highlighted "YOUR TEAM HAS A BYE THIS ROUND" banner; all teams on bye listed at the bottom; round dropdown shows `(BYE)` label.
- **Dashboard**: bye rounds show a large "BYE" display with rest week context and advance button instead of next-match widget.
- **Match Day**: bye rounds show a full-page bye screen with advance/fixtures/training buttons.
- **Topbar**: shows `Round X · BYE` and advance button says "Advance (Bye)".
- **Condition boost**: coached team players get +8 condition on bye weeks (in addition to normal weekly recovery).
- Still to do: forced even-team-count byes (for 16-team leagues), Origin round bye blocks, bye scheduling tuning for multi-bye-per-team distribution.

#### Magic Round **[NEW]**
- One round per season where every team plays at the same neutral venue over 3 days (modelled on NRL Magic Round at Suncorp Stadium).
- Clubs can "bid" to host Magic Round: bid is influenced by `clubPrestigeScore`, stadium capacity, and a random factor.
- Hosting club receives a large revenue windfall (crowd bonus × 3 home games worth of gate, plus a flat broadcast/event bonus e.g. $1–2M).
- All other teams play as if at a neutral ground (no home advantage for any side).
- Magic Round fixtures page should have special styling showing the venue and multi-game schedule.
- Board/news announcement when a club wins the hosting bid preseason.

#### Crowd Vendor System **[NEW]**
- Introduce food/drink and merchandise vendor revenue as a separate income stream from gate revenue.
- Vendors are facility-like upgrades in Club Management (F&B Level 1–5, Merch Level 1–5). Each level increases per-head spend.
- Crowd spend per head: base $12 F&B + $8 merch at level 1, scaling to ~$28 F&B + $18 merch at level 5.
- Manager can set prices via sliders or tick "auto-price to league average" which samples other clubs' levels each season.
- Price multiplier applies to per-head spend: higher prices = more revenue per head but reduced crowd attendance (price sensitivity).
- Show vendor revenue separately in Club Management revenue breakdown.
- Prestige and facility quality affect per-head spend cap (premium clubs can charge more).

#### Ticket Pricing — Comparison vs League & Prestige Effects ✅ FIRST SLICE IMPLEMENTED
- **League avg comparison**: `leagueTicketInfo()` in `08-progression.js` computes a notional ticket price for each AI team based on their squad strength (proxy for pricing power) and returns league avg, rank from cheapest, and rank from most expensive.
- **Matchday ticket controls** now show: league average price, ranking label ("3rd most expensive in the league", "Below average — 2nd cheapest", etc.), and a prestige note ("Premium club: fans tolerate higher prices" vs "Fans are price-sensitive at this prestige level").
- **Prestige-sensitive price drag**: `matchCrowd()` now uses `clubPrestigeScore` to compute a price sensitivity factor. Dynasty/Elite clubs (prestige 72+) lose far fewer fans when pricing above avg (sensitivity ~0.5–0.7); Rebuild/Developing clubs (prestige <40) lose attendance steeply above avg (sensitivity ~1.5–1.8).
- **Win streak crowd boost**: `recentWinStreak(teamId)` counts consecutive wins from recent fixtures; each win adds ~800 fans up to 5 wins (+4000 max crowd boost for a 5-game winning streak), applies to all teams.
- Still to do: rivalry/derby multiplier, round importance (finals) multiplier, day-of-week multiplier, prestige-capped price ceiling, preseason ticket pricing comparison, crowd vendor revenue stream.

#### Art Quality — Possible Approaches **[NOTE]**
- Current art (player avatars, team logos, the pitch field) all look extremely poor. This is a known limitation of procedural SVG.
- **Considered alternatives**:
  1. **Pixel art sprite sheets** (most practical for this style of game): a set of hand-crafted or AI-generated pixel sprites, colour-swapped at runtime using SVG `filter` or Canvas compositing. Would give a consistent, appealing aesthetic.
  2. **Canvas-based renderer**: replace SVG avatars with `<canvas>` draws — more rendering control, GPU acceleration, can do anti-aliasing and image compositing, supports actual image assets.
  3. **Pre-generated AI portraits**: Generate 50–100 base portraits via Stable Diffusion (or similar), store compressed, index by player seed. Very small storage cost per portrait at 64×64.
  4. **SVG filter effects**: SVG supports `<feTurbulence>`, `<feDisplacementMap>`, `<feBlend>` etc. — could give grass texture, embossed logos, and better portraits without leaving SVG.
  5. **Convert to app with bundled assets**: Moving to Electron/Tauri or a React app would allow importing actual image files (PNG/WebP/SVG) from the file system rather than base64-encoding everything.
- **Recommended path**: For the field, use SVG filters for turf texture. For logos, add more shape variety and gradient fills. For avatars, switch to a pixel-art sprite approach or bold cartoon (option 3 above from avatar section). For a serious long-term improvement, consider step 5 (app conversion).

#### Contract Payouts on Release / Sacking ✅ IMPLEMENTED
- **Players**: Every row on the Contracts page has a "Negotiate" button (replacing separate cut/negotiate columns). Opens `manageContractModal` — a full contract management screen showing: this-season salary, avg/yr, total value, year-by-year schedule, market demand, intent/form/loyalty/morale, promise summary, and a colour-coded payout section (green if free release requested, red with amount if payout required, neutral if contract expires this season). From the modal the user can "Negotiate contract" (opens the existing offer screen if player is open) or "Release player" (shows payout cost in label). Release deducts payout from `G.club.funds` and generates a finance news item.
- **Staff**: Fire confirmation shows payout; deducted from `G.club.funds` (see Staff section above).
- **Coach**: Extension implemented; sacking payout still to do.
- Still to do: display total outstanding payout liability in Club Management; board pressure if payout causes funds to go negative; coach sacking deducts from funds.

#### Staff Screen — Hire Button Layout Bug ✅ FIXED
- Staff card header now uses `flex-shrink:0` on the button column and `min-width:0;flex:1` on the text column so buttons never overlap name/role text.
- Market table button column has `white-space:nowrap`; boosts column has `overflow:hidden;text-overflow:ellipsis` to prevent runover into the hire button.

#### Assistant Coach Salary & Contract Management ✅ IMPLEMENTED
- Staff cards show salary, years remaining, and a computed release payout (remaining years × salary). Payout is shown in the card footer and on the Fire button label.
- Fire confirmation modal shows payout amount; payout is deducted from `G.club.funds` and generates a finance news item.
- Staff in their final year show a red "CONTRACT EXPIRING" badge.
- Extend button appears on expiring staff: opens a modal showing current vs demand salary (ability-weighted multiplier 1.05–1.23), with 1/2/3-year length choice. Updates `s.yearsLeft` and `s.salary`.
- Still to do: richer demand negotiation (counter-offers, market comparison), staff requesting their own release waiving the payout, board pressure around retaining key staff.

#### Scouts & Medical Staff on Staff Page — Contract Payout on Release **[NEW]**
- Scouts (from `G.scouting.scouts`) and Medical/Physio staff (role `'medical'` in `G.staff`) should be visible on the Staff page alongside assistant coaches, so all contracted personnel are managed in one place.
- Currently scouts are only shown on the Scouting page with no contract detail; medical staff appear on the Staff page but may not have full payout logic.
- **Scouts on Staff page**: each scout card should show name, ability, salary, years remaining, active mission count, and a "Release" button. Releasing a scout mid-contract must deduct a payout (remaining years × salary) from `G.club.funds`, cancel any active missions, and generate a finance news item — identical behaviour to firing an assistant coach.
- **Medical staff on Staff page**: confirm the Fire button deducts the correct payout (remaining years × salary) from `G.club.funds`. If not already implemented, apply the same payout logic as assistant coaches.
- Scouts and medical staff should also show CONTRACT EXPIRING badges and Extend buttons on the same terms as assistant coaches.
- The Scouting page can retain its scout dispatch/mission UI but should not duplicate the full contract management that now lives on the Staff page (or link across clearly).

#### Coach Contract Negotiation & Extension ✅ IMPLEMENTED
- Coach Profile contract card shows years remaining (singular/plural) and a "Negotiate Extension" button when `contractYears <= 1`.
- Extension modal shows current salary vs board offer (rep-based scaling: 60k base up to ~400k at max rep), with 1/2/3-year length choice.
- Accepting updates `c.contractYears` and `c.salary`.
- Still to do: board approval/rejection logic based on financial headroom and board confidence, sacking payout from club funds, AI club coaching payout tracking.

#### App Conversion — Architecture Discussion **[NOTE — FUTURE PLAN]**
- **Decision**: App conversion will happen as a **full rebuild in an appropriate engine** once the HTML game is in a complete state and the feature list is exhausted. There is no intermediate Electron wrapper step — it will be a clean rebuild.
- This means all current development continues in the plain HTML/JS/CSS format. When the time comes, the game engine logic (`01-rng.js` through `12-save.js`) can be ported directly as it is pure JS with no DOM dependencies — only the UI layer needs rebuilding.
- Engine choice for the full rebuild: to be decided. Options include a web framework (React + Vite, suitable for web + Electron + Capacitor/mobile), or a dedicated game engine (Godot with GDScript/C#, Unity with C#, or a custom Electron shell around a rebuilt React frontend). The right choice depends on target platform (desktop, mobile, web) and desired art quality.
- **No action required now** — this note exists to record the decision and avoid incremental wrapper work that would be thrown away.

#### Player Stats — Additional Tracked Fields ✅
- New stats added to `p.s`, `resetSeasonStats`, `mkLine`, and `migrateSave`:
  - `mins` — minutes played (accumulated from `line.min` per game)
  - `mt` — missed tackles (simulated from tackle count × miss rate based on tackling/markerDef)
  - `lb` — line breaks (simulated from carry count × break rate based on speed/accel/step)
  - `lba` — line break assists (playmakers only: HB/FE/HK/FB, based on vision/shortPass/playmaking)
  - `ks` — general kicks (halves ~14-29/game, forwards ~1-2/game)
  - `km` — kick metres (ks × avg distance based on kickPower/kickAccuracy)
  - `inf` — infringements (incremented in `genInfringements` when any penalty is generated)
- `errors` (`err`) was already per-player; try involvements derivable as `t + ta`.
- Stat leaders page expanded with all new categories plus LB assists, missed tackles.
- Player modal "This season" card updated to show all new stats across 5 lines.
- Old saves: migration in `12-save.js` sets all new fields to 0 if missing.
- Still to do: fantasy scoring adjustments for new stats; per-80-min rate columns in stat leaders.
- Forced drop-outs are now tracked as `fdo`; still to do: team-level aggregate display and richer attribution from the future set-by-set engine.
- Games played, expanded career totals, and separate club totals per player are now tracked. Still to do: representative-team totals and richer club split pages/records.
- Career total stats first slice implemented: `p.career` now stores expanded totals for the main stat fields, match sim updates them live, old saves migrate missing fields, and player profiles show expanded career totals. Still to do: dedicated career-total tables and club/rep splits.
- Records page first slice implemented for league-wide player career records, single-season records, and club-scoped player records. Still to do: persistent retired-player archives, richer team/club records, record notifications, and historical record holders after players retire/delete.

#### Development, Aging & Career Arcs **[NEW — FIRST SLICE COMPLETE]**
- **Age-banded weekly growth implemented** in `developPlayer` (`08-progression.js`): 16–17: 38%, 18–19: 30%, 20–21: 23%, 22–23: 16%, 24–25: 9%, 26–27: 5.5%, 28–30: 2.5%. Chance is then multiplied by professionalism, game time (gamesProxy), morale, injury status, and devMod (coaching/facility).
- **Veteran mental growth implemented**: players aged 28–36 have a weekly chance (scaling from 3.6% to 6%) to improve a mental attribute (composure, leadership, vision, decisionMaking, discipline, professionalism, workRate), capped at 92. Not applied during injuries.
- **Physical decline implemented** with age bands: starts at 29 (1.2%/week), accelerates at 31, 33, and 36+. High professionalism (≥75) slows decline by 18%.
- **Technical skill decline implemented** from age 35+: chance rises with each year. Affects ball skills, tackling, and game-awareness attributes.
- **Offseason development pass implemented** (`applyOffseasonDevelopment` in `11-offseason.js`): called at the start of each offseason, simulates ~8 weeks of training using Poisson-distributed gains (capped at 3 per player), plus veteran mental growth (2 chances) and physical/technical decline (~2 weeks' worth). Generates a news summary listing the coached club's biggest improvers (≥+2 OVR) and decliners (≤−2 OVR). Immortal cap is enforced during offseason gains.
- `PHYSICAL_ATTRS`, `TECHNICAL_ATTRS`, and `MENTAL_ATTRS` defined as constants in `08-progression.js` and reused in offseason.
- Still to do: show OVR history graphs, offseason development review screen with breakout prospects and veteran decline summary, position-group camp allocation in preseason, development projection screen.

#### Daily Calendar, Deadlines & Fatigue Management **[NEW]**
- Change time progression from week-by-week to day-by-day simulation.
- Show the current date prominently in the top bar/header.
- Let the user choose how many days to simulate at a time rather than only advancing a full week.
- Simulation should automatically stop when a user decision is required.
- Stop for judiciary decisions, including whether to accept or refute a charge.
- Stop for training schedule review: set team training focus, set training intensity, bulk-select players, and individually reduce/alter training for fatigued players.
- Require match-day squad confirmation by Tuesday afternoon.
- Add building fatigue across matches and training. Players may still be fatigued from the previous game; low-fitness players should have increased injury risk if selected or trained too hard.
- Add a Calendar view showing upcoming matches, training days, judiciary/training/team-selection deadlines, travel, recovery days, and other important events.

#### Weather Events & Tactical Adjustment **[NEW]**
- Expand weather events beyond the current first slice and make weather a stronger tactical factor.
- Weather should affect errors, handling, completion rate, kick metres, kick accuracy, goal kicking, injuries/fatigue, and crowd attendance where appropriate.
- Coaches should be able to adjust tactics on the fly to suit conditions, choosing more expansive play or a safer/territory-focused approach.
- AI coaches should also adapt tactics to weather, match situation, squad strengths, and fatigue.

#### Inbox & Staff Communication ✅ FIRST SLICE IMPLEMENTED
- **Inbox page** added under nav (between Dashboard and Squad): reads from `G.news`, category filter tabs (All, Match Analysis, Results, Medical, Club, Board, Scouting, Recruitment, Contracts, Achievements), item counts per tab, expand/collapse individual items.
- **Post-match analysis news item**: `generateWeeklyMedia` now generates a second, richer `type:'analysis'` item after every coached-team match, with standout performers (name, rating, tries), opponent standout, and team stats summary (tackles, errors, runs).
- **Inbox page** in offseason allowlist; nav shows "Inbox" between Dashboard and Squad; items sorted newest-first.
- **Player quick-link**: expanded inbox items with a `playerId` show a "View [player]" button.
- Still to do: assistant coach recommendation items, scout report items, player message items (contract concerns/morale/release requests), read/unread state, direct action links from inbox to relevant pages.

#### Offseason Training Boosts & Growth Visuals **[NEW]**
- Players should gain or lose meaningful OVR through offseason training, aging, development, injuries, morale, potential, facilities, and coaching.
- Offseason growth should feel more substantial than ordinary week-to-week changes, especially for young players.
- Show player growth/decline with graphs, including OVR history and key attribute changes over time.
- Add offseason development review screens summarising biggest improvers, biggest decliners, breakout prospects, veteran declines, and training-camp effects.

#### Post-Match Analysis & Match Reports **[NEW — FIRST SLICE COMPLETE]**
- **Scoring timeline implemented** in `03-match-view.js`: try events (scorer, assist, conversion result, running score), penalty goal events, and field goal events are sorted by minute and rendered as a colour-coded timeline with minute badge, score after each event, and team attribution. Tries green-bordered for coached team, red for opposition.
- **Both-team player performance grids implemented**: top 5 performers for coached team and top 3 for opposition are shown side-by-side with clickable player links, key stats (T/TA/Goals/FG/40-20/FDO), and rating.
- **Team match stats comparison table implemented**: tries, goals (made/attempted), field goals, tackles, missed tackles, run metres, 40/20s, forced drop-outs, errors, and infringements — with green highlight on the better side per category (lower is better for errors/missed tackles/infringements).
- **Match context header**: venue, weather, crowd, and half-time score shown in a single summary line below the result banner.
- **Injuries and citations** listed at the bottom of the post-match card.
- **`injMin` stored per player in match lines** (`07-match.js`): each injured player now has a stored `injMin` (minute they left the field). Live match feed in `matchday.js` uses this to suppress try/40-20/FDO events occurring after a player's injury minute. Injury events use the stored minute rather than a random value.
- Still to do: save full match report objects with fixtures for historical reopening, sorting/filtering in the post-match player stats table, possession/completion rate/territory team stats, richer half-by-half scoring breakdown, and deep-link from every name in the report.

#### Dashboard — Team Attack / Defence Ratings ✅ IMPLEMENTED
- Attack and Defence rating pills added to the Dashboard status strip via `teamRatings(t)` (already used for opponent pills in the next-match widget).
- Colour-coded green/red/neutral consistent with OVR scale. Opponent ATT/DEF still shown in the next-match widget for comparison.

#### Dashboard — My Team OVR / ATK / DEF in Next Match Widget **[NEW]**
- The "Next match" widget already shows OVR, ATT, and DEF pills for the opponent. The coached team should show the same three pills (OVR, ATK, DEF) directly beneath or beside their own logo/name, so the coach can compare both sides at a glance without leaving the dashboard.
- Pills should use the same `teamRatingPill` helper with exact values (coached team is always high-confidence) and the same colour coding.

#### Player Development Insights ✅ FIRST SLICE IMPLEMENTED — Remaining **[NEW]**
- `p.ovrHistory = [{year, ovr}]` initialised in `genPlayer` and appended in `startNewSeason` (capped at 20 entries). No migration — new games only.
- Player modal has a **Development** section showing: SVG OVR sparkline, "+N OVR this season" badge, and current vs last season stats comparison table.
- Squad page and Contracts page OVR column show `+X`/`-X` season delta badge.
- **Still to do — Development tab (high priority):**
  - The OVR change badge is not actually visible yet on any screen in testing — verify the `seasonStartOvr` is being set correctly and the badge renders. Fix if broken.
  - Replace the "Development" card below the stats cards with a proper **Development tab** on the player info screen (alongside "This season", "Career", etc.).
  - The tab should list every attribute group (Offensive / Defensive / Physical / Mental) and show each individual attribute's current value alongside its value at season start, with a `+X` / `−X` delta and a coloured arrow. Requires snapshotting `p.seasonStartAttrs = {...p.attrs}` at the start of each new season in `startNewSeason`.
  - Show overall OVR change prominently at the top of the tab (large number, green/red colour).
  - Squad page OVR delta badge must be clearly visible — confirm it renders, increase size/contrast if needed.
  - Surface biggest improvers (≥+2 OVR) and decliners (≤−2 OVR) in the Offseason development review screen.

#### Watch Game — Hide Result Until Full Time ✅ IMPLEMENTED
- Modal header now shows `– : –` placeholders and a "Kick off…" banner instead of the final score.
- `_revealFeed` updates the score and WIN/LOSS banner only when the FULL TIME event fires; the "Full results" button is also hidden until that point.
- This fix applies to both the legacy modal path and the new full-screen watch page.

#### Watch Game — Speed Selector Resets Feed **[BUG]**
- Changing the watch speed during a live match (via the speed buttons: 1x / 2x / 4x / 8x) currently triggers `UI.render()`, which re-renders the page from scratch and restarts the feed from the beginning.
- Fix: the speed buttons should update `UI._watchSpeed` and re-render the page HTML **without** restarting the feed. Options: (a) write the speed selector directly to the DOM without a full render; (b) preserve `_revealFeedPage` timer state and resume from the current event index after re-render; (c) use `onclick` that only updates `UI._watchSpeed` and rebinds the button styles without calling `UI.render()`.
- The simplest fix is to update the button active state in-place (toggle a CSS class on the speed buttons) rather than triggering a full page re-render.

#### Watch Game — Full-Screen Dedicated Window ✅ FIRST SLICE IMPLEMENTED
- `playMatchDay(watch=true)` now stores round results in `UI._watchGameRound` and navigates to `UI.go('watchgame')` instead of opening a modal.
- `p_watchgame` renders a full-page layout: large live score header (team logos, `–:–` placeholders, venue/weather/crowd line), lineups sidebar (both teams, all 17 slots, pos + OVR), live event feed panel with speed controls, and a hidden post-match section.
- `_revealFeedPage` drives the animation: updates score header at FULL TIME, reveals WIN/LOSS banner and post-match summary inline using `_buildMatchReportHtml`.
- `_buildMatchReportHtml` is extracted as a shared helper (used by watchgame; `showRoundResults` modal still uses its own inline version).
- `watchgame` added to the offseason page allowlist.
- Still to do: live possession/tackle stats updating mid-feed, collapsible lineup panel on mobile, better visual polish (animations, in-goal zone graphic), keyboard shortcut to skip to full-time.

#### Match Engine — On-Field Tracking, Substitutions & HIA **[NEW]**
- **Injury-minute bug fixed**: `l.injMin` is now stored on each player's match line (random minute between 10–72). The live match feed in `matchday.js` uses an `injMins` lookup map to cap try minutes, 40/20 minutes, and FDO minutes to before the player's injury minute, and injury event itself uses the stored minute. This prevents "player scores after leaving the field" events.
- Remaining: the match engine still doesn't track who is on-field vs off-field minute-by-minute for the full event pool. The injury fix above prevents the worst visible bugs but the stat allocations (tackles, runs, metres) for benched/injured players are still generated at full-game length.
- Match engine must track who is on-field/off-field minute-by-minute, including starters, bench, named reserves, injuries, sin bins, send-offs, HIA assessments, and tactical substitutions.
- Substitutions need to be implemented in the sim engine, not only the UI: bench players should enter, replaced players should leave, injured players should be unavailable for later events, and event selection pools must only include players currently on the field.
- Live match feed should show substitutions for both teams, including minute, player off, player on, reason (tactical, fatigue, injury, HIA, sin bin return), and remaining interchange context if tracked.
- Player stat allocation must respect minutes actually played: tries, assists, goals, kicks, 40/20s, tackles, runs, run metres, errors, injuries, and infringements should only be generated while the player is on field.
- HIA/concussion needs category logic:
  - Category 1 HIA: player is ruled out for the rest of the match and the following game.
  - Category 2 HIA: player leaves for assessment and can return after 15 match minutes if cleared.
- HIA status should appear in live feed, injury ward, team sheet availability, post-match report, and player injury history.

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
| `++(_staffId||0)` syntax error in `02-data.js` | Changed to `++_staffId` |
| Player scores/kicks after leaving injured | `injMin` stored per player line in `simTeamStats`; live feed caps try/40-20/FDO events to before that minute |
