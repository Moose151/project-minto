'use strict';

/* ---------- team & league generation ---------- */
const SQUAD_TEMPLATE = ['FB','FB','WG','WG','WG','WG','CE','CE','CE','CE','FE','FE','HB','HB','HK','HK','PR','PR','PR','PR','PR','SR','SR','SR','SR','LK','LK','HK'];
function fitCap(G, t){ // scale salaries so top squad fits under cap
  let total = teamSalary(t);
  const target = G.config.cap * rf(.88,.99);
  if(total > target){ const f = target/total; for(const id of t.players){ const p=G.players[id]; if(!salaryCountsForCap(p)) continue; p.salary = Math.max(85000, Math.round(p.salary*f/5000)*5000); if(p.contractSchedule && p.contractSchedule.length) p.contractSchedule = p.contractSchedule.map(v=>Math.max(85000, Math.round(v*f/5000)*5000)); } }
}
function genFixtures(teamIds){
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
  const allRounds = [...rounds, ...secondHalf];
  const allByes = [...byesByRound, ...byesByRound];

  return {
    rounds: allRounds.map(g => g.map(mm => ({...mm, played:false, hs:0, as:0, det:null}))),
    byes: allByes,
  };
}
