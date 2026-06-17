'use strict';

/* ---------- migration ---------- */
function migrateSave(G){
  // extend lineups from 17 to 19 slots
  for(const t of G.teams){
    if(!t.lineup) t.lineup = Array(19).fill(null);
    else if(t.lineup.length < 19){ while(t.lineup.length < 19) t.lineup.push(null); }
    if(t.cohesion === undefined) t.cohesion = 50;
    if(typeof ensureTeamLogo === 'function') ensureTeamLogo(t);
  }
  // ensure all players have squad category, fpts, seasonStartOvr
  for(const id in G.players){
    const p = G.players[id];
    migratePlayerAttrs(p);
    if(!p.squad) p.squad = 'top';
    if(p.s && p.s.fpts === undefined) p.s.fpts = 0;
    if(p.s){
      if(p.s.mins  === undefined) p.s.mins  = 0;
      if(p.s.mt    === undefined) p.s.mt    = 0;
      if(p.s.lb    === undefined) p.s.lb    = 0;
      if(p.s.lba   === undefined) p.s.lba   = 0;
      if(p.s.ks    === undefined) p.s.ks    = 0;
      if(p.s.km    === undefined) p.s.km    = 0;
      if(p.s.inf   === undefined) p.s.inf   = 0;
      if(p.s.fdo   === undefined) p.s.fdo   = 0;
    }
    if(p.seasonStartOvr === undefined) p.seasonStartOvr = p.ovr;
    if(p.seasonStartPot === undefined) p.seasonStartPot = p.pot;
    if(p.seasonStartGames === undefined) p.seasonStartGames = p.career ? Math.max(0, p.career.games - (p.s ? p.s.g : 0)) : 0;
    if(p.scoutBias === undefined) p.scoutBias = ((Number(id) * 37) % 201) - 100;
    if(!p.history) p.history = [];
    if(!p.awards) p.awards = [];
    if(!p.injuries) p.injuries = [];
    ensurePlayerCareerStats(p);
    ensurePlayerClubStats(p);
    if(p.form === undefined) p.form = clamp(Math.round(p.morale == null ? 50 : p.morale), 15, 95);
    if(!Array.isArray(p.contractSchedule)) p.contractSchedule = p.years > 0 ? Array(Math.max(0, p.years || 0)).fill(p.salary || salaryFor(p)) : [];
    if(!p.contractType) p.contractType = 'flat';
    if(p.contractSchedule.length && p.contractSchedule.length !== Math.max(0, p.years || 0)){
      p.contractSchedule = p.contractSchedule.slice(0, Math.max(0, p.years || 0));
      while(p.contractSchedule.length < Math.max(0, p.years || 0)) p.contractSchedule.push(p.salary || salaryFor(p));
    }
    if(p.contractSchedule.length) p.salary = p.contractSchedule[0];
    if(!p.injury) p.playInjured = false;
    if(p.promises) p.promises = normalisePromises(p.promises);
    p.ovr = calcOvr(p);
    p.pot = Math.max(p.pot || p.ovr, p.ovr);
  }
  if(!G.byes) G.byes = (G.fixtures || []).map(() => []);
  if(!G.magicRound) G.magicRound = null;
  if(!G.origin) G.origin = null;
  if(!G.config.leagueName) G.config.leagueName = 'Minto Premiership';
  if(G.club && !G.club.vendors) G.club.vendors = {fb:1, merch:1};
  if(G.club && G.club.vendorRevenue === undefined) G.club.vendorRevenue = 0;
  if(G.club && G.club.magicRoundRevenue === undefined) G.club.magicRoundRevenue = 0;
  if(!G.freeAgents) G.freeAgents = [];
  if(!G.hallOfFame) G.hallOfFame = [];
  if(!G.achievements) G.achievements = [];
  if(G.godMode === undefined) G.godMode = false;
  if(G.achievementsLocked === undefined) G.achievementsLocked = !!G.godMode;
  if(!G.staff) G.staff = [genStaff('attacking', 52), genStaff('defensive', 52), genStaff('fitness', 48)];
  // Migrate old pos_* positional-coach roles → coaching role + posSpecialty
  const posRoleMap = {pos_FB:'attacking',pos_WG:'attacking',pos_CE:'attacking',pos_FE:'attacking',pos_HB:'attacking',pos_PR:'defensive',pos_HK:'attacking',pos_SR:'defensive',pos_LK:'defensive'};
  if(G.staff) G.staff = G.staff.map(s => {
    if(s.role && s.role.startsWith('pos_')){
      const pos = s.role.replace('pos_','');
      const newRole = posRoleMap[s.role] || 'fitness';
      const hasSameRole = G.staff.some(x => x.id !== s.id && x.role === newRole && !x.role.startsWith('pos_'));
      if(hasSameRole) return null;
      return {...s, role: newRole, posSpecialty: pos};
    }
    if(s.role && !s.posSpecialty){
      const roleInfo = STAFF_ROLES.find(r=>r.key===s.role);
      if(roleInfo && roleInfo.canHaveSpecialty) s.posSpecialty = pick(POS);
    }
    return s;
  }).filter(Boolean);
  if(!G.club) G.club = { funds: 1500000, seasonRevenue: 0, seasonWages: 0 };
  if(typeof ensureClubFacilities === 'function') ensureClubFacilities();
  if(!G.club.construction) G.club.construction = {};
  if(!G.scouting) G.scouting = { scouts: [genScout(45)], missions: [], prospects: [] };
  // Ensure AI teams have a head coach name
  for(const t of G.teams){
    if(!t.headCoach) t.headCoach = { name:`${pick(FIRST)} ${pick(LAST)}`, rep: ri(20,55) };
    if(t.headCoach.seasons === undefined) t.headCoach.seasons = 0;
    if(t.headCoach.rep === undefined) t.headCoach.rep = ri(20,55);
  }
  // Migrate old finals format (top4/sf → top8/qf)
  if(G.finals && !G.finals.hasOwnProperty('useTop8')){
    G.finals.useTop8 = false;
    if(!G.finals.qf) G.finals.qf = G.finals.sf;
    if(!G.finals.pf) G.finals.pf = null;
    if(!G.finals.top8) G.finals.top8 = G.finals.top4 || [];
  }
  // Ensure teams have stadium names
  for(const t of G.teams){
    if(!t.stadium){
      const ident = IDENTITIES.find(i => i.city === t.city && i.nick === t.nick);
      t.stadium = ident ? ident.stadium : 'Home Ground';
    }
  }
  // Ensure match det objects have suspensions array (old saves may be missing it)
  for(const rounds of (G.fixtures||[])){
    for(const m of rounds){
      if(m.det && !m.det.suspensions) m.det.suspensions = [];
    }
  }
  // coach: shortlist, attrs
  if(!G.coach.shortlist) G.coach.shortlist = [];
  if(G.coach.salary === undefined) G.coach.salary = 120000;
  if(G.coach.contractYears === undefined) G.coach.contractYears = 2;
  if(G.coach.cash === undefined) G.coach.cash = 60000;
  if(!G.coach.attrs){
    const base = 30 + Math.round(G.coach.rep / 3);
    const jitter = () => clamp(base + Math.round((Math.random()-0.5)*16), 20, 80);
    G.coach.attrs = { development: jitter(), manMgmt: jitter(), fitness: jitter(), tactics: jitter() };
  }
  // media: older saves stored plain text stories only
  G.news = (G.news || []).map(n=>{
    if(typeof n === 'string') return {y:G.year, r:G.round+1, title:'Club News', body:n, txt:n, type:'general', tone:'neutral', tag:'News'};
    if(!n.txt) n.txt = n.body || n.title || '';
    if(!n.body) n.body = n.txt;
    if(!n.title) n.title = n.tag || 'Club News';
    if(!n.type) n.type = 'general';
    if(!n.tone) n.tone = 'neutral';
    if(!n.tag) n.tag = n.type || 'News';
    return n;
  });
}

/* ---------- API-based save / load ---------- */

async function listSaves(){
  try{
    const r = await fetch('/api/saves');
    if(!r.ok) return [];
    return await r.json();
  }catch{ return []; }
}

async function saveToSlot(slot){
  const meta = {
    savedAt: new Date().toISOString(),
    season:  G.season,
    round:   G.round,
    phase:   G.phase,
    year:    G.year,
    coach:   G.coach.name,
    club:    myTeam().nick,
  };
  try{
    const r = await fetch(`/api/saves/${slot}`, {
      method:  'PUT',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({minto:1, pid:_pid, G, meta}),
    });
    return r.ok;
  }catch{ return false; }
}

async function loadFromSlot(slot){
  try{
    const r = await fetch(`/api/saves/${slot}`);
    if(!r.ok) return false;
    const d = await r.json();
    if(!d.minto || !d.G) return false;
    G = d.G; _pid = d.pid || 99999;
    migrateSave(G);
    return true;
  }catch{ return false; }
}

async function deleteSave(slot){
  try{
    const r = await fetch(`/api/saves/${slot}`, {method:'DELETE'});
    return r.ok;
  }catch{ return false; }
}

async function autoSave(){
  if(!G) return;
  await saveToSlot('autosave');
}

/* ---------- file export / import (manual backup) ---------- */

function exportSave(){
  const blob = new Blob([JSON.stringify({minto:1, pid:_pid, G})], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `minto-save-${G.year}-r${G.round+1}.json`;
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
}

function importSave(file){
  const fr = new FileReader();
  fr.onload = () => {
    try{
      const d = JSON.parse(fr.result);
      if(!d.minto || !d.G) throw new Error('bad file');
      G = d.G; _pid = d.pid || 99999;
      migrateSave(G);
      UI.toast('Save loaded.');
      UI.go('dashboard');
    }catch(e){ UI.toast('Could not read that save file.'); }
  };
  fr.readAsText(file);
}

/* ================================================================
   UI
   ================================================================ */
