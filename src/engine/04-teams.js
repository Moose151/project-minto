'use strict';

/* ---------- team & league generation ---------- */
const SQUAD_TEMPLATE = ['FB','FB','WG','WG','WG','WG','CE','CE','CE','CE','FE','FE','HB','HB','HK','HK','PR','PR','PR','PR','PR','SR','SR','SR','SR','LK','LK','HK'];
const MATCH_SLOTS = [
  {day:'Thursday', time:'night',     label:'Thu Night',       hour:19, order:0},
  {day:'Friday',   time:'night',     label:'Fri Night',       hour:20, order:1},
  {day:'Saturday', time:'afternoon', label:'Sat Afternoon',   hour:15, order:2},
  {day:'Saturday', time:'twilight',  label:'Sat Twilight',    hour:17, order:3},
  {day:'Saturday', time:'night',     label:'Sat Night',       hour:19, order:4},
  {day:'Sunday',   time:'afternoon', label:'Sun Afternoon',   hour:14, order:5},
  {day:'Sunday',   time:'twilight',  label:'Sun Twilight',    hour:16, order:6},
  {day:'Sunday',   time:'night',     label:'Sun Night',       hour:18, order:7},
];

function matchSlotOrder(m){
  if(m && m.slot && m.slot.order != null) return m.slot.order;
  const key = m && m.slot ? `${m.slot.day}-${m.slot.time}` : 'Saturday-afternoon';
  const legacy = {'Thursday-night':0,'Friday-night':1,'Friday-afternoon':1,'Saturday-afternoon':2,'Saturday-twilight':3,'Saturday-night':4,'Sunday-afternoon':5,'Sunday-twilight':6,'Sunday-night':7};
  return legacy[key] == null ? 2 : legacy[key];
}
function sortMatchesBySlot(matches){
  return (matches || []).slice().sort((a,b)=>matchSlotOrder(a)-matchSlotOrder(b));
}
function fitCap(G, t){ // scale salaries so top squad fits under cap
  let total = teamSalary(t);
  const target = G.config.cap * rf(.88,.99);
  if(total > target){ const f = target/total; for(const id of t.players){ const p=G.players[id]; if(!salaryCountsForCap(p)) continue; p.salary = Math.max(85000, Math.round(p.salary*f/5000)*5000); if(p.contractSchedule && p.contractSchedule.length) p.contractSchedule = p.contractSchedule.map(v=>Math.max(85000, Math.round(v*f/5000)*5000)); } }
}
function genFixtures(teamIds, targetRounds){
  // double round robin, circle method; odd team count → one bye per round
  const ids = shuffle(teamIds);
  const n = ids.length;
  const hasNaturalBye = n % 2 !== 0;
  const workIds = hasNaturalBye ? [...ids, -1] : ids; // -1 = bye slot
  const m = workIds.length; // always even
  const arr = workIds.slice();
  const rounds = [];
  const byesByRound = [];

  for(let r = 0; r < m - 1; r++){
    const games = [];
    const byeTeams = [];
    for(let i = 0; i < m/2; i++){
      const a = arr[i], b = arr[m-1-i];
      if(a === -1){ byeTeams.push(b); }
      else if(b === -1){ byeTeams.push(a); }
      else { games.push(r%2===0 ? {h:a, a:b} : {h:b, a:a}); }
    }
    rounds.push(games);
    byesByRound.push(byeTeams);
    arr.splice(1, 0, arr.pop());
  }

  const secondHalf = rounds.map(g => g.map(mm => ({h:mm.a, a:mm.h})));
  let allRounds = [...rounds, ...secondHalf];
  let allByes = [...byesByRound, ...byesByRound];
  if(targetRounds && targetRounds > 0 && targetRounds < allRounds.length){
    allRounds = allRounds.slice(0, targetRounds);
    allByes = allByes.slice(0, targetRounds);
  }

  // Assign day/time slots — no two games simultaneous; spread across Thu-Sun.
  // Turnaround fairness: teams coming off a late (Sun twilight/night) game last round are
  // pushed to later slots this round so they aren't handed the short Thursday turnaround.
  let prevLateTeams = new Set();
  const assignedRounds = allRounds.map(games => {
    const slots = MATCH_SLOTS.slice(0, Math.max(games.length, 1));
    const scored = games.map(g => ({
      g,
      late: (prevLateTeams.has(g.h) ? 1 : 0) + (prevLateTeams.has(g.a) ? 1 : 0),
      jitter: rnd(),
    }));
    // Low turnaround-pressure games take the earliest slots; high-pressure games get later slots.
    scored.sort((x, y) => (x.late - y.late) || (x.jitter - y.jitter));
    const assigned = scored.map((s, i) => ({...s.g, played:false, hs:0, as:0, det:null, slot: slots[i] || MATCH_SLOTS[i % MATCH_SLOTS.length]}));
    prevLateTeams = new Set();
    for(const mm of assigned){
      if(mm.slot && mm.slot.order >= 6){ prevLateTeams.add(mm.h); prevLateTeams.add(mm.a); }
    }
    return assigned;
  });

  return {
    rounds: assignedRounds,
    byes: allByes,
  };
}
