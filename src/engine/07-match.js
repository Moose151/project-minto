'use strict';

/* ---------- match simulation ---------- */
function lineupPower(t){
  let atk=0, def=0, kick=0, n=0;
  if(!t.roles) assignDefaultTeamRoles(t);
  const cap = G.players[t.roles && t.roles.captain];
  const capMod = cap ? 0.985 + (roleScore(cap,'captain')/100)*0.03 : 1;
  t.lineup.forEach((id,i)=>{
    const p = G.players[id]; if(!p) return;
    const fam = familiarity(p, SLOTS[i].pos) * slotSpecialistFit(p, i);
    const cond = 0.75 + 0.25*p.cond/100;
    const mor = 0.92 + 0.16*p.morale/100;
    const form = 0.965 + 0.07*((p.form == null ? 50 : p.form)/100);
    const weight = i<13 ? 1 : i<17 ? 0.45 : 0;
    const posRole = t.positionRoles && t.positionRoles[String(i)];
    const roleMod = positionRoleFit(p, SLOTS[i].pos, posRole);
    const a = (p.attrs.playmaking*.18 + p.attrs.ballRunning*.18 + p.attrs.finishing*.13 + p.attrs.shortPass*.12 + p.attrs.longPass*.08 + p.attrs.vision*.10 + p.attrs.decisionMaking*.10 + p.attrs.ballSecurity*.06 + p.attrs.speed*.05);
    const d = (p.attrs.tackling*.25 + p.attrs.defRead*.22 + p.attrs.markerDef*.13 + p.attrs.lastDitch*.13 + p.attrs.workRate*.12 + p.attrs.strength*.08 + p.attrs.bigHit*.07);
    atk += a*fam*cond*mor*form*weight*roleMod.a; def += d*fam*cond*mor*form*weight*roleMod.d;
    kick = Math.max(kick, (p.attrs.kickPower*.45 + p.attrs.kickAccuracy*.35 + p.attrs.fieldGoal*.12 + p.attrs.placeKick*.08)*fam);
    n += weight;
  });
  if(n===0) return {atk:50, def:50, kick:50};
  const planMod = {attacking:{a:1.07,d:.94}, balanced:{a:1,d:1}, grinding:{a:.93,d:1.07}}[t.plan||'balanced'];
  const cohMod = 0.97 + 0.06*((t.cohesion||50)/100);
  const tacMod = (t.id===G.coach.teamId && G.coach.attrs) ? (1 + 0.03*(G.coach.attrs.tactics/100)) : 1;
  const zone = zoneTacticsMod(t);
  return { atk: (atk/n)*planMod.a*cohMod*tacMod*capMod*zone.a, def: (def/n)*planMod.d*cohMod*tacMod*capMod*zone.d, kick: kick*zone.k };
}
function positionRoleFit(p, pos, role){
  if(!role || role==='balanced') return {a:1,d:1};
  const A = p.attrs;
  const score = {
    attacking:(A.playmaking+A.ballRunning+A.finishing+A.vision)/400,
    defensive:(A.tackling+A.defRead+A.lastDitch+A.composure)/400,
    controlled:(A.shortPass+A.kickAccuracy+A.decisionMaking+A.composure)/400,
    opportunist:(A.acceleration+A.playmaking+A.vision+A.ballRunning)/400,
    yardage:(A.strength+A.ballRunning+A.ballSecurity+A.workRate)/400,
    finisher:(A.finishing+A.speed+A.acceleration+A.catching)/400,
    strike:(A.ballRunning+A.finishing+A.speed+A.strength)/400,
    enforcer:(A.bigHit+A.strength+A.tackling+A.workRate)/400,
    edgeRunner:(A.ballRunning+A.finishing+A.speed+A.strength)/400,
    workhorse:(A.workRate+A.stamina+A.tackling+A.markerDef)/400,
    ballPlaying:(A.shortPass+A.playmaking+A.vision+A.decisionMaking)/400,
  }[role] || .55;
  const bump = (score-.55)*0.08;
  const attackRoles = ['attacking','opportunist','yardage','finisher','strike','edgeRunner','ballPlaying'];
  const defRoles = ['defensive','controlled','enforcer','workhorse'];
  return {a:1 + (attackRoles.includes(role)?bump:bump*.35), d:1 + (defRoles.includes(role)?bump:bump*.25)};
}
function zoneTacticsMod(t){
  const z = t.zoneTactics || {};
  const vals = Object.values(z);
  let a=1,d=1,k=1;
  for(const v of vals){
    if(v==='safe'){ a*=0.992; d*=1.006; k*=1.006; }
    if(v==='expansive'){ a*=1.008; d*=0.994; k*=0.997; }
  }
  return {a,d,k};
}
function simMatch(m, isFinal){
  const th = G.teams[m.h], ta = G.teams[m.a];
  if(!validateLineup(th)) autoPick(th);
  if(!validateLineup(ta)) autoPick(ta);
  const isMagicRound = !isFinal && G.magicRound && G.magicRound.round === G.round;
  const mrHost = isMagicRound ? G.teams.find(t => t.id === G.magicRound.hostTeamId) : null;
  const venue = isFinal ? 'Grand Final Stadium'
    : isMagicRound ? (G.magicRound.venue || (mrHost ? mrHost.city + ' Magic Round' : 'Magic Round'))
    : (th.stadium || pick(STADIUM_NAMES));
  const weather = m.projWeather || pick(WEATHER);
  const crowd = m.projCrowd || matchCrowd(isMagicRound ? mrHost || th : th, isFinal);
  const ticketPrice = th.id===G.coach.teamId && G.club ? (G.club.ticketPrice || 28) : 28;
  const weatherTryMod = weather==='Heavy rain' ? .84 : weather==='Light rain' ? .92 : weather==='Windy' ? .95 : weather==='Humid' ? .96 : 1;
  const weatherKickMod = weather==='Heavy rain' ? .88 : weather==='Light rain' ? .93 : weather==='Windy' ? .90 : weather==='Humid' ? .97 : 1;
  const crowdHomeMod = (isFinal || isMagicRound) ? 1 : clamp(0.985 + crowd / 1200000, .985, 1.035);
  th._prevLineup = th.lineup.slice(0,13);
  ta._prevLineup = ta.lineup.slice(0,13);
  const ph = lineupPower(th), pa = lineupPower(ta);
  const hAdj = isMagicRound ? 1 : 1.035;
  // Cap the dominance ratio to prevent runaway blowouts; exponent 1.65 vs old 2.6
  const ratH = Math.min((ph.atk*hAdj)/pa.def, 1.65);
  const ratA = Math.min(pa.atk/(ph.def*hAdj), 1.65);
  const expH = clamp(2.85 * Math.pow(ratH, 1.65) * rf(.87,1.13) * weatherTryMod * crowdHomeMod, 0.7, 9);
  const expA = clamp(2.85 * Math.pow(ratA, 1.65) * rf(.87,1.13) * weatherTryMod / Math.sqrt(crowdHomeMod), 0.7, 9);
  let triesH = poisson(expH), triesA = poisson(expA);
  if(isFinal && triesH===triesA && rnd()<.5) (rnd()<.5? triesH++ : triesA++);
  // Approximate half-time split for comeback detection (roughly 40-60% of tries in first half)
  const htSplitH = ri(0, triesH), htSplitA = ri(0, triesA);
  const htGoalH = triesH > 0 ? Math.round((htSplitH / triesH) * (triesH * 0.65)) : 0;
  const htGoalA = triesA > 0 ? Math.round((htSplitA / triesA) * (triesA * 0.65)) : 0;
  const htScore = {h: htSplitH*4 + htGoalH*2, a: htSplitA*4 + htGoalA*2};
  const det = {h:{}, a:{}, events:[], suspensions:[], venue, weather, crowd, ticketPrice, weatherTryMod, weatherKickMod, htScore};
  const goalsH = simTeamStats(th, triesH, det.h, ph.kick * weatherKickMod);
  const goalsA = simTeamStats(ta, triesA, det.a, pa.kick * weatherKickMod);
  // Infringements (after stats so they don't affect scoring math)
  genInfringements(th, det);
  genInfringements(ta, det);
  let hs = triesH*4 + goalsH*2, as = triesA*4 + goalsA*2;
  if(Math.abs(hs-as)<=1 && rnd()<.5){ if(rnd()<.5 && th.matchPrefs?.fieldGoal!==false){ hs+=1; awardFieldGoal(th, det.h, det.events); } else if(ta.matchPrefs?.fieldGoal!==false){ as+=1; awardFieldGoal(ta, det.a, det.events); } }
  if(isFinal && hs===as){ if(rnd()<.5 && th.matchPrefs?.fieldGoal!==false){ hs+=1; awardFieldGoal(th, det.h, det.events); } else if(ta.matchPrefs?.fieldGoal!==false){ as+=1; awardFieldGoal(ta, det.a, det.events); } }
  m.played = true; m.hs = hs; m.as = as; m.det = det;
  awardVotes(th, ta, det);
  postMatch(th, hs, as, det.h); postMatch(ta, as, hs, det.a);
  applyTribunalBans(det);
  return m;
}
function simTeamStats(t, tries, out, kickSkill){
  const players = t.lineup.slice(0,17).map((id,i)=>({p:G.players[id], slot:i})).filter(x=>x.p);
  if(!t.roles) assignDefaultTeamRoles(t);
  const tryW = {FB:1.4, WG:2.1, CE:1.5, FE:.9, HB:.8, PR:.45, HK:.6, SR:.95, LK:.7, BE:.4};
  let goals = 0;
  const kicker = rolePlayer(t, 'goalKicker', players.map(x=>x.p), 'goalKicker');
  simTerritoryKicks(t, players, out);
  for(let i=0;i<tries;i++){
    const pool = players.map(x=>({x, w: (tryW[SLOTS[x.slot].pos]||.5) * (x.p.attrs.finishing+x.p.attrs.ballRunning+x.p.attrs.speed+x.p.attrs.acceleration)/240 }));
    const total = pool.reduce((s,e)=>s+e.w,0);
    let r = rnd()*total, scorer = pool[0].x;
    for(const e of pool){ r -= e.w; if(r<=0){ scorer = e.x; break; } }
    out[scorer.p.id] = out[scorer.p.id] || mkLine(); out[scorer.p.id].t++;
    // Assist — save reference for try event
    let assistEntry = null;
    if(rnd()<.62){
      const aPool = players.filter(x=>x.p.id!==scorer.p.id && ['FE','HB','HK','FB'].includes(x.p.pos));
      if(aPool.length){
        assistEntry = aPool.sort((a,b)=>(b.p.attrs.vision+b.p.attrs.shortPass+b.p.attrs.playmaking)-(a.p.attrs.vision+a.p.attrs.shortPass+a.p.attrs.playmaking))[Math.floor(rnd()*Math.min(3,aPool.length))];
        out[assistEntry.p.id] = out[assistEntry.p.id] || mkLine(); out[assistEntry.p.id].ta++;
      }
    }
    // Conversion
    let converted = false;
    if(kicker){
      const line = out[kicker.id]=out[kicker.id]||mkLine();
      line.ga++;
      if(rnd() < (.48 + (kicker.attrs.placeKick*.7+kicker.attrs.composure*.3)/230)){ goals++; line.gl++; converted=true; }
    }
    // Track try event for live feed
    out._tryEvents = out._tryEvents || [];
    out._tryEvents.push({
      scorerId: scorer.p.id,
      assistId: assistEntry ? assistEntry.p.id : null,
      kickerId: kicker ? kicker.id : null,
      min: ri(2, 78),
      converted,
    });
  }
  // Penalty goals — track per-goal for feed
  if(kicker){
    const pref = t.matchPrefs && t.matchPrefs.penalty || 'auto';
    const penLambda = pref==='penaltyGoal' ? (tries===0 ? 1.55 : .75) : pref==='tap' ? .08 : pref==='kickTouch' ? .18 : (tries===0 ? 1.0 : .35);
    const pens = poisson(penLambda);
    if(pens){
      const line=out[kicker.id]=out[kicker.id]||mkLine();
      line.ga += pens;
      out._penGoalEvents = out._penGoalEvents || [];
      for(let i=0;i<pens;i++){
        const made = rnd() < (.62 + (kicker.attrs.placeKick*.7+kicker.attrs.composure*.3)/260);
        if(made){ goals++; line.gl++; }
        out._penGoalEvents.push({kickerId: kicker.id, min: ri(5, 78), made});
      }
    }
  }
  // Tackles, metres, errors, minutes, rating
  for(const x of players){
    const line = out[x.p.id] = out[x.p.id] || mkLine();
    const grp = POS_GROUP[x.p.pos];
    const mins = x.slot<13 ? (grp==='fwd' && x.p.pos==='PR' ? ri(45,62) : ri(68,80)) : ri(18,42);
    line.min = mins;
    const runBase = {fwd:13, hk:7, half:6, back:12}[grp];
    line.runs = Math.max(0, Math.round(runBase * mins/80 * (x.p.attrs.workRate+x.p.attrs.ballRunning+x.p.attrs.stamina)/195 * rf(.65,1.35)));
    const tkBase = {fwd:36, hk:40, half:22, back:14}[grp];
    line.tk = Math.max(0, Math.round(tkBase * mins/80 * (x.p.attrs.tackling+x.p.attrs.markerDef+x.p.attrs.workRate)/195 * rf(.7,1.3)));
    const mBase = {fwd:130, hk:80, half:70, back:140}[grp];
    line.m = Math.max(0, Math.round(mBase * mins/80 * (x.p.attrs.strength+x.p.attrs.speed+x.p.attrs.ballRunning)/195 * rf(.65,1.4)));
    const formAdj = ((x.p.form == null ? 50 : x.p.form) - 50) / 100;
    const errChance = (1 - (x.p.attrs.ballSecurity*.55+x.p.attrs.catching*.25+x.p.attrs.composure*.20)/130) * clamp(1 - formAdj*.55, .72, 1.28);
    line.err = rnd() < errChance ? ri(1,2) : 0;
    // Missed tackles
    const mtRate = clamp((90 - (x.p.attrs.tackling*0.55 + x.p.attrs.markerDef*0.35 + x.p.attrs.workRate*0.10)) / 120, 0.04, 0.35);
    line.mt = Math.max(0, Math.round(line.tk * mtRate * rf(0.5, 1.5)));
    // Line breaks
    const lbSkill = (x.p.attrs.speed*0.35 + x.p.attrs.acceleration*0.30 + x.p.attrs.stepSkill*0.35);
    const lbRate = clamp((lbSkill - 48) / 500, 0.003, 0.10);
    line.lb = Math.max(0, Math.round(line.runs * lbRate * rf(0.4, 1.8)));
    // Line break assists (playmakers)
    if(['FE','HB','HK','FB'].includes(x.p.pos)){
      const lbaBase = {HB:2.2, FE:1.8, HK:1.5, FB:0.8}[x.p.pos] || 0.8;
      const lbaSkill = (x.p.attrs.vision + x.p.attrs.shortPass + x.p.attrs.playmaking) / 195;
      line.lba = Math.max(0, Math.round(lbaBase * lbaSkill * rf(0.3, 1.8)));
    }
    // Kicks and kick metres
    const isPrimaryKicker = kicker && kicker.id === x.p.id;
    const ksBase = {half: isPrimaryKicker ? 22 : 14, hk: 4, back: 2, fwd: 1}[grp] || 1;
    line.ks = Math.max(0, Math.round(ksBase * rf(0.6, 1.4)));
    const avgKickM = clamp(30 + (x.p.attrs.kickPower*0.25 + x.p.attrs.kickAccuracy*0.15), 30, 70);
    line.km = Math.max(0, Math.round(line.ks * avgKickM * rf(0.8, 1.2)));
    line.r = clamp(5 + line.t*1.6 + line.ta*1.1 + line.gl*.25 + line.fg*.35 + line.tk/14 + line.m/65 + line.runs/18 + line.k4020*.45 + (line.fdo||0)*.35 - line.err*.8 + (x.p.attrs.lastDitch-55)/90 + formAdj*.55 + gauss(0,.7), 1, 10);
    line.fp = line.t*4 + line.ta*2 + line.gl*2 + line.fg*2 + line.k4020*3 + (line.fdo||0)*2 + Math.floor(line.tk/10) + Math.floor(line.m/25) + Math.floor(line.runs/8) - line.err*2;
    const s = x.p.s; s.g++; s.t+=line.t; s.runs+=(line.runs||0); s.gl+=line.gl; s.ga+=(line.ga||0); s.fg+=(line.fg||0); s.ta+=line.ta; s.tk+=line.tk; s.m+=line.m; s.err+=line.err; s.k4020+=(line.k4020||0); s.fdo=(s.fdo||0)+(line.fdo||0); s.rSum+=line.r; s.fpts+=(line.fp||0); s.mins=(s.mins||0)+mins; s.mt=(s.mt||0)+line.mt; s.lb=(s.lb||0)+line.lb; s.lba=(s.lba||0)+line.lba; s.ks=(s.ks||0)+line.ks; s.km=(s.km||0)+line.km;
    if(x.p.squad === 'trial') x.p.trialGames = (x.p.trialGames || 0) + 1;
    ensurePlayerCareerStats(x.p);
    x.p.career.games++;
    x.p.career.tries += line.t;
    x.p.career.goals += line.gl;
    x.p.career.points += line.t*4 + line.gl*2 + (line.fg||0);
    x.p.career.ga += line.ga || 0;
    x.p.career.fg += line.fg || 0;
    x.p.career.ta += line.ta || 0;
    x.p.career.tk += line.tk || 0;
    x.p.career.m += line.m || 0;
    x.p.career.runs += line.runs || 0;
    x.p.career.err += line.err || 0;
    x.p.career.fpts += line.fp || 0;
    x.p.career.k4020 += line.k4020 || 0;
    x.p.career.fdo += line.fdo || 0;
    x.p.career.mins += mins;
    x.p.career.mt += line.mt || 0;
    x.p.career.lb += line.lb || 0;
    x.p.career.lba += line.lba || 0;
    x.p.career.ks += line.ks || 0;
    x.p.career.km += line.km || 0;
    x.p.career.rSum += line.r || 0;
    addLineToStatBucket(playerClubStatBucket(x.p, t), line);
    x.p.cond = clamp(x.p.cond - (26 - x.p.attrs.stamina/6) * mins/80, 20, 100);
    const carrying = x.p.injury && x.p.playInjured;
    const injChance = .035 * (1 + (100 - x.p.attrs.injury)/70) * (x.p.cond<55 ? 1.5 : 1) * (carrying ? 3.2 : 1);
    if(rnd() < injChance){
      const inj = pick(INJURIES);
      x.p.injury = {n:inj.n, weeks: ri(inj.w[0], inj.w[1])};
      x.p.playInjured = false;
      x.p.injuries = x.p.injuries || [];
      x.p.injuries.unshift({y:G.year, r:G.round+1, n:inj.n, weeks:x.p.injury.weeks});
      if(x.p.injury.weeks >= 4) x.p.attrs.injury = clamp(x.p.attrs.injury - ri(1,3), 20, 99);
      line.inj = inj.n;
      line.injMin = ri(10, 72);
    }
  }
  return goals;
}
function awardFieldGoal(t, out, events){
  const active = t.lineup.slice(0,17).map(id=>G.players[id]).filter(Boolean);
  const kicker = rolePlayer(t, 'primaryKicker', active, 'kicker') || rolePlayer(t, 'secondaryKicker', active, 'kicker');
  if(!kicker) return;
  out[kicker.id] = out[kicker.id] || mkLine();
  out[kicker.id].fg++;
  out[kicker.id].fp = (out[kicker.id].fp || 0) + 2;
  out[kicker.id].r = clamp((out[kicker.id].r || 5) + .35, 1, 10);
  if(events) events.push({min:ri(68,80), team:t.id, pts:1, txt:`${kicker.name} snaps a field goal for ${t.nick}!`});
  if(kicker.s){
    kicker.s.fg = (kicker.s.fg||0) + 1;
    kicker.s.fpts = (kicker.s.fpts||0) + 2;
    kicker.s.rSum = (kicker.s.rSum||0) + .35;
  }
  ensurePlayerCareerStats(kicker);
  kicker.career.points += 1;
  kicker.career.fg += 1;
  kicker.career.fpts += 2;
  kicker.career.rSum += .35;
  const clubBucket = playerClubStatBucket(kicker, t);
  clubBucket.points += 1;
  clubBucket.fg += 1;
  clubBucket.fpts += 2;
  clubBucket.rSum += .35;
}
function rolePlayer(t, key, pool, scoreRole){
  pool = pool || t.lineup.slice(0,17).map(id=>G.players[id]).filter(Boolean);
  const wanted = G.players[t.roles && t.roles[key]];
  if(wanted && pool.some(p=>p.id===wanted.id) && (!wanted.injury || wanted.playInjured)) return wanted;
  return pool.filter(p=>!p.injury || p.playInjured).sort((a,b)=>roleScore(b,scoreRole)-roleScore(a,scoreRole))[0] || null;
}
function simTerritoryKicks(t, players, out){
  const pool = players.map(x=>x.p);
  const primary = rolePlayer(t, 'primaryKicker', pool, 'kicker');
  const secondary = rolePlayer(t, 'secondaryKicker', pool.filter(p=>!primary || p.id!==primary.id), 'kicker');
  for(const k of [primary, secondary].filter(Boolean)){
    const skill = k.attrs.kickPower*.45 + k.attrs.kickAccuracy*.35 + k.attrs.decisionMaking*.12 + k.attrs.composure*.08;
    const attempts = k===primary ? 1.2 : .45;
    if(rnd() < attempts * clamp((skill-62)/260, .005, .055)){
      out[k.id]=out[k.id]||mkLine(); out[k.id].k4020++;
    }
    if(rnd() < attempts * clamp((skill-68)/420, .002, .028)){
      out[k.id]=out[k.id]||mkLine(); out[k.id].k4020++;
    }
    const repeatSetPressure = attempts * clamp((skill-58)/150, .015, .24);
    if(rnd() < repeatSetPressure){
      out[k.id]=out[k.id]||mkLine();
      out[k.id].fdo++;
    }
  }
}
function mkLine(){ return {t:0,gl:0,ga:0,fg:0,ta:0,tk:0,m:0,runs:0,err:0,min:0,r:0,fp:0,k4020:0,fdo:0,mt:0,lb:0,lba:0,ks:0,km:0}; }
function awardVotes(th, ta, det){
  const all = [];
  for(const id in det.h) if(det.h[id] && det.h[id].r) all.push({id:+id, r:det.h[id].r});
  for(const id in det.a) if(det.a[id] && det.a[id].r) all.push({id:+id, r:det.a[id].r});
  all.sort((a,b)=>b.r-a.r);
  [3,2,1].forEach((v,i)=>{
    if(!all[i]) return;
    const p = G.players[all[i].id];
    p.s.votes += v;
    ensurePlayerCareerStats(p);
    p.career.votes += v;
    const t = G.teams.find(t=>t.players.includes(p.id));
    if(t) playerClubStatBucket(p, t).votes += v;
  });
}
function postMatch(t, pf, pa, lines){
  const won = pf>pa;
  const mmBonus = (t.id===G.coach.teamId && G.coach.attrs) ? Math.round(G.coach.attrs.manMgmt/50) : 0;
  for(const id of t.players){ const p = G.players[id];
    const inTeam = t.lineup.includes(id);
    const delta = inTeam ? (won ? ri(2,5)+mmBonus : -(ri(2,5)-Math.min(mmBonus,2))) : -1;
    p.morale = clamp(p.morale + delta, 5, 99);
    updatePlayerForm(p, lines && lines[id], won, inTeam);
  }
  if(t._prevLineup){
    const curr = t.lineup.slice(0,13);
    let matches = 0;
    for(let i=0;i<13;i++) if(curr[i] && curr[i]===t._prevLineup[i]) matches++;
    const starters = curr.map(id=>G.players[id]).filter(Boolean);
    const avgForm = starters.length ? starters.reduce((s,p)=>s+(p.form == null ? 50 : p.form),0) / starters.length : 50;
    const delta = Math.round((matches/13)*5 - 1.5 + clamp((avgForm - 50) / 24, -2, 2));
    t.cohesion = clamp((t.cohesion||50) + delta, 0, 100);
    delete t._prevLineup;
  }
}
function updatePlayerForm(p, line, won, inTeam){
  if(!p) return;
  if(p.form == null) p.form = 50;
  let delta = 0;
  if(line && line.r){
    delta += line.r >= 8.2 ? 5 : line.r >= 7.2 ? 3 : line.r >= 6.4 ? 1 : line.r < 4.6 ? -5 : line.r < 5.4 ? -3 : -1;
    delta += won ? 1 : -1;
    if(line.t || line.ta || line.fg || line.k4020 || line.fdo) delta += 1;
    if(line.err >= 2) delta -= 1;
    if(line.inj) delta -= 3;
  } else if(inTeam){
    delta += won ? 1 : -2;
  } else {
    delta += p.form > 52 ? -1 : p.form < 48 ? 1 : 0;
  }
  p.form = clamp(Math.round(p.form + delta), 15, 95);
}

/* ---------- infringements ---------- */
function genInfringements(t, det){
  const players = t.lineup.slice(0,17).map(id=>G.players[id]).filter(Boolean);
  for(const p of players){
    const discip = p.attrs && p.attrs.discipline != null ? p.attrs.discipline : 55;
    // Lower discipline = more infractions. Average player ~15% chance of named event per game.
    const baseChance = clamp((90 - discip) / 600, 0.008, 0.22);
    if(rnd() > baseChance) continue;
    const min = ri(3, 78);
    const isMinor = rnd() < 0.62;
    if(p.s) p.s.inf = (p.s.inf||0) + 1;
    ensurePlayerCareerStats(p);
    p.career.inf += 1;
    playerClubStatBucket(p, t).inf += 1;
    if(isMinor){
      const inf = pick(INFRINGEMENT_MINOR);
      det.events.push({min, txt:`Penalty — ${p.name} (${t.nick}) penalised for ${inf.label.toLowerCase()}.`});
      continue;
    }
    // Graded infringement
    const inf = pick(INFRINGEMENT_GRADED);
    const gradeRoll = rnd();
    const grade = gradeRoll < 0.55 ? 1 : gradeRoll < 0.87 ? 2 : 3;
    const reckless = rnd() < 0.27;
    let card = 'none';
    if(grade===1 && reckless) card='sinBin';
    if(grade===2) card='sinBin';
    if(grade===3) card = reckless ? 'sendOff' : 'sinBin';
    if(inf.hipDropBonus && grade>=2) card = (grade===3 || reckless) ? 'sendOff' : 'sinBin';
    const gradeText = `Grade ${grade} ${reckless?'(reckless)':'(careless)'}`;
    const cardText = card==='sinBin' ? ' — SIN BINNED' : card==='sendOff' ? ' — SENT OFF' : '';
    det.events.push({min, txt:`${card==='sendOff'?'🟥':card==='sinBin'?'🟨':'⚠️'} ${p.name} (${t.nick}) — ${gradeText} ${inf.label}${cardText}.`});
    // Tribunal
    let banWeeks = 0;
    if(grade===1 && !reckless) banWeeks = rnd()<0.3 ? 1 : 0;
    else if(grade===1) banWeeks = ri(1,2);
    else if(grade===2 && !reckless) banWeeks = ri(1,3);
    else if(grade===2) banWeeks = ri(2,4);
    else if(grade===3 && !reckless) banWeeks = ri(3,6);
    else banWeeks = ri(5,10);
    if(inf.hipDropBonus) banWeeks += ri(1,2);
    if(card==='sendOff') banWeeks = Math.max(banWeeks, 2);
    if(banWeeks > 0){
      det.suspensions.push({pid: p.id, weeks: banWeeks, reason: `${gradeText} ${inf.label}`});
      det.events.push({min: min+1, txt:`📋 ${p.name} cited — ${inf.label}. Tribunal: ${banWeeks} week${banWeeks===1?'':'s'} expected.`});
    }
  }
}
function applyTribunalBans(det){
  if(!det.suspensions || !det.suspensions.length) return;
  for(const s of det.suspensions){
    const p = G.players[s.pid]; if(!p) continue;
    if(p.suspended && p.suspended.weeks >= s.weeks) continue;
    p.suspended = {weeks: s.weeks, reason: s.reason};
    const isMine = myTeam() && myTeam().players.includes(p.id);
    addNews(`${p.name} cited for ${s.reason} — suspended for ${s.weeks} week${s.weeks===1?'':'s'}.`, {
      title:'Tribunal Outcome', type:'discipline', tone:'bad',
      playerId:s.pid, tag:'Discipline',
      teamId: isMine ? G.coach.teamId : undefined,
    });
  }
}
