'use strict';

/* ---------- player generation ---------- */
let _pid = 1;
function genPlayerName(nationality){
  const pool = NAME_POOLS[nationality] || NAME_POOLS['Australia'];
  return pick(pool.first) + ' ' + pick(pool.last);
}
function genPlayer(pos, age, quality){ // quality ~ league tier centre, e.g. 60
  // Pick nationality first so name pool can match
  let natR = rnd()*100, natTotal=0;
  let nationality = NATIONALITY_POOL[NATIONALITY_POOL.length-1].country;
  let repTeam     = NATIONALITY_POOL[NATIONALITY_POOL.length-1].repTeam;
  let stateRep    = null;
  for(const n of NATIONALITY_POOL){ natTotal += n.weight; if(natR < natTotal){ nationality=n.country; repTeam=n.repTeam; stateRep=n.stateReps?pick(n.stateReps):null; break; } }
  const prof = POS_PROFILE[pos];
  const base = clamp(gauss(quality, 9), 30, 92);
  const p = { id:_pid++, name: genPlayerName(nationality), age, pos, attrs:{}, };
  for(const a of ATTRS){
    const off = prof[a] ? prof[a][0] : 0;
    p.attrs[a] = Math.round(clamp(gauss(base + off, 7), 20, 99));
  }
  // age curve applied to current ability
  const ageMod = age<=20 ? -(21-age)*2.4 : age>=31 ? -(age-30)*1.8 : 0;
  if(ageMod){ for(const a of ATTRS) p.attrs[a] = Math.round(clamp(p.attrs[a]+ageMod, 20, 99)); }
  // secondary position
  const sec = {FB:['WG','CE'],WG:['CE','FB'],CE:['WG','SR'],FE:['HB','FB'],HB:['FE','HK'],PR:['SR','LK'],HK:['LK','HB'],SR:['PR','LK'],LK:['SR','HK']};
  p.pos2 = pick(sec[pos]);
  const specialist = defaultSpecialist(pos);
  p.spec = specialist.spec;
  p.side = specialist.side;
  p.training = 'balanced';
  p.retrainPos = null;
  p.retrainSpec = null;
  p.style = pick(STYLE_BY_POS[pos]);
  p.hgt = Math.round({back:184,half:178,fwd:192,hk:180}[POS_GROUP[pos]] + gauss(0,4));
  p.wgt = Math.round({back:94,half:86,fwd:108,hk:92}[POS_GROUP[pos]] + gauss(0,5));
  p.injProne = ri(1,20); p.prof = ri(20,99); p.ambition = ri(20,99); p.loyalty = ri(20,99); p.prefCity = pick(IDENTITIES).city;
  shapeSpecialistAttributes(p);
  p.ovr = calcOvr(p);
  const headroom = age<=19 ? ri(6,24) : age<=22 ? ri(4,16) : age<=25 ? ri(2,9) : ri(0,3);
  p.pot = clamp(p.ovr + headroom, p.ovr, 97);
  p.scoutBias = ri(-100, 100);
  p.seasonStartOvr = p.ovr;
  p.seasonStartPot = p.pot;
  p.seasonStartGames = 0;
  p.morale = ri(55,80); p.form = ri(48,62); p.cond = 100; p.injury = null;
  p.salary = salaryFor(p); p.years = ri(1,3); p.contractType = 'flat'; p.contractSchedule = Array(p.years).fill(p.salary);
  p.career = {seasons:0, games:0, tries:0, goals:0, points:0, premierships:0};
  p.history = [];
  p.awards = [];
  p.injuries = [];
  // Nationality (already determined above)
  p.nationality = nationality;
  p.repTeam = repTeam;
  p.stateRep = stateRep;
  p.face = genPlayerFace(p);
  resetSeasonStats(p);
  return p;
}
function facePick(seed, arr){
  return arr[Math.abs(seed) % arr.length];
}
function faceSeed(p, salt){
  let x = ((Number(p.id || 1) + Number(p.faceSalt || 0)) * 1103515245 + salt * 12345) >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return Math.abs(x);
}
function genPlayerFace(p){
  const skinByNat = {
    'Australia':       ['#F0C7A8','#D8A37D','#C58B65','#8F5B3E'],
    'New Zealand':     ['#D5A074','#A96F4C','#7C4B35','#E5B98D'],
    'Tonga':           ['#8A563D','#6E402F','#A86B4C'],
    'Samoa':           ['#8A563D','#6E402F','#A86B4C'],
    'Papua New Guinea':['#6C3F2D','#593323','#7A4933'],
    'England':         ['#F2C9AF','#E7B996','#D9A37F'],
    'Fiji':            ['#7A4933','#8F5B3E','#6E402F'],
    'Cook Islands':    ['#8A563D','#A86B4C','#6E402F'],
    'Lebanon':         ['#D6A27B','#BF805B','#E1B28D'],
  };
  const s0 = faceSeed(p, 1), s1 = faceSeed(p, 2), s2 = faceSeed(p, 3), s3 = faceSeed(p, 4);
  const hairColours = p.age >= 32 ? ['#2C211B','#5D514B','#A9A29B'] : ['#1D1714','#3A271E','#5A3826','#7A4A24','#C49A55','#D8D0C5'];
  const hairStyles = ['short','crop','fade','curly','bald','mohawk','dreadlocks','ponytail'];
  // Weight hair styles toward culturally common choices per nationality
  const natHairWeights = {
    'Papua New Guinea': ['curly','curly','dreadlocks','short','crop'],
    'Fiji':             ['curly','dreadlocks','dreadlocks','short','crop'],
    'Samoa':            ['short','fade','crop','curly','mohawk'],
    'Tonga':            ['short','fade','crop','curly','mohawk'],
    'Cook Islands':     ['short','curly','fade','dreadlocks'],
    'New Zealand':      ['short','fade','crop','curly','ponytail','dreadlocks'],
    'England':          ['short','crop','fade','bald','short'],
    'Lebanon':          ['short','crop','curly','fade'],
  };
  const weightedStyles = natHairWeights[p.nationality] || hairStyles;
  return {
    skin: facePick(s0, skinByNat[p.nationality] || skinByNat['Australia']),
    hair: facePick(s1, hairColours),
    hairStyle: facePick(s2, weightedStyles),
    headShape: facePick(s3, ['round','round','square','long']),
    eyeShape: facePick(faceSeed(p, 5), ['calm','calm','sharp','wide']),
    mouthShape: facePick(faceSeed(p, 6), ['neutral','smile','stern']),
    bodyShape: p.wgt >= 105 ? 'power' : p.attrs && p.attrs.speed >= 75 ? 'lean' : 'standard',
    facialHair: faceSeed(p, 7) > 0.45 && (p.age || 24) >= 22,
  };
}
function shapeSpecialistAttributes(p){
  const spine = ['HB','FE','HK','FB'].includes(p.pos);
  const half = ['HB','FE'].includes(p.pos);
  const ageExp = clamp((p.age-20)*2.1, 0, 24);
  p.attrs.leadership = clamp(Math.round(p.attrs.leadership*.72 + p.attrs.composure*.12 + p.attrs.decisionMaking*.10 + ageExp + gauss(0,4)), 20, 99);
  p.attrs.professionalism = clamp(Math.round((p.attrs.professionalism || p.prof || 55)*.75 + ageExp*.25 + gauss(0,3)), 20, 99);
  if(!spine){
    p.attrs.kickPower = clamp(Math.round(p.attrs.kickPower*.55 + gauss(0,4)), 20, 58);
    p.attrs.kickAccuracy = clamp(Math.round(p.attrs.kickAccuracy*.55 + gauss(0,4)), 20, 55);
    p.attrs.fieldGoal = clamp(Math.round(p.attrs.fieldGoal*.45 + gauss(0,3)), 20, 45);
  }
  if(half){
    p.attrs.kickPower = clamp(Math.round(p.attrs.kickPower + ri(4,12)), 45, 95);
    p.attrs.kickAccuracy = clamp(Math.round(p.attrs.kickAccuracy + ri(4,12)), 45, 95);
    p.attrs.fieldGoal = clamp(Math.round(p.attrs.fieldGoal + ri(4,12)), 42, 94);
  }
  const goalChance = half ? .32 : p.pos==='FB' ? .18 : p.pos==='CE' || p.pos==='WG' ? .04 : .01;
  if(rnd() < goalChance){
    p.attrs.placeKick = clamp(Math.round((p.attrs.placeKick + p.attrs.composure + p.attrs.kickAccuracy)/3 + ri(10,24)), 50, 96);
  } else {
    p.attrs.placeKick = clamp(Math.round(p.attrs.placeKick*.45 + gauss(0,3)), 20, spine ? 58 : 46);
  }
}
function calcOvr(p){
  const prof = POS_PROFILE[p.pos]; let s=0, w=0;
  for(const a in prof){ s += p.attrs[a]*prof[a][1]; w += prof[a][1]; }
  return Math.round(s/w);
}
function familiarity(p, pos){
  if(pos==='BE') return POS_GROUP[p.pos]==='fwd'||POS_GROUP[p.pos]==='hk' ? 1 : .97;
  if(p.pos===pos) return 1;
  if(p.pos2===pos) return .92;
  if(POS_GROUP[p.pos]===POS_GROUP[pos]) return .85;
  return .68;
}
function defaultSpecialist(pos){
  if(pos==='WG') return rnd()<.5 ? {spec:'leftWing', side:'left'} : {spec:'rightWing', side:'right'};
  if(pos==='CE') return rnd()<.5 ? {spec:'leftCentre', side:'left'} : {spec:'rightCentre', side:'right'};
  if(pos==='SR') return rnd()<.5 ? {spec:'leftEdge', side:'left'} : {spec:'rightEdge', side:'right'};
  return {spec:pick(SPECIALIST_BY_POS[pos] || ['balanced']), side:'either'};
}
function slotSide(slotIdx){
  return SLOT_SIDE[slotIdx] || 'middle';
}
function specialistLabel(p){
  if(!p) return '';
  return SPECIALIST_LABEL[p.spec] || p.spec || 'Balanced';
}
function slotSpecialistFit(p, slotIdx){
  if(!p || slotIdx >= 13) return 1;
  const pos = SLOTS[slotIdx].pos;
  const fit = positionFitLevel(p, slotIdx);
  if(fit.level === 'red') return 0.72;
  if(fit.level === 'orange') return 0.86;
  if(fit.level === 'yellow') return 0.94;
  const side = slotSide(slotIdx);
  if(['WG','CE','SR'].includes(pos)){
    if(p.side === 'either' || side === 'middle') return 1;
    return p.side === side ? 1.035 : 0.925;
  }
  const spec = p.spec || '';
  const role = spec.toLowerCase();
  if(pos==='PR' && role==='mobile') return 1.01;
  if(pos==='PR' && role==='strong') return 1.01;
  if(['HB','FE'].includes(pos) && ['running','passing','organiser'].includes(spec)) return 1.015;
  if(pos==='HK' && ['running','passing','defensive'].includes(spec)) return 1.01;
  return 1;
}
function realisticRetrainPositions(p){
  if(!p) return [];
  return (REALISTIC_RETRAIN[p.pos] || []).filter(pos=>pos !== p.pos && pos !== p.pos2);
}
function positionFitLevel(p, slotIdx){
  if(!p) return {level:'red', label:'Empty'};
  if(slotIdx >= 13 || SLOTS[slotIdx].pos === 'BE'){
    if(POS_GROUP[p.pos] === 'fwd' || POS_GROUP[p.pos] === 'hk') return {level:'green', label:'Bench forward/utility'};
    return {level:'yellow', label:'Back on bench'};
  }
  const target = SLOTS[slotIdx].pos;
  const side = slotSide(slotIdx);
  if(p.pos === target){
    const wrongSide = ['WG','CE','SR'].includes(target) && p.side && p.side !== 'either' && side !== 'middle' && p.side !== side;
    return wrongSide ? {level:'yellow', label:'Preferred position, wrong side'} : {level:'green', label:'Preferred position'};
  }
  if((p.pos === 'FE' && target === 'HB') || (p.pos === 'HB' && target === 'FE')){
    return {level:'yellow', label:'Similar halves role'};
  }
  if(p.pos2 === target || (REALISTIC_RETRAIN[p.pos] || []).includes(target)){
    return {level:'orange', label:'Can cover position'};
  }
  return {level:'red', label:'Bad position fit'};
}
function salaryFor(p){
  const ovr = p.ovr || calcOvr(p);
  const base = 70000 + Math.pow(Math.max(0, ovr-40)/52, 2.45) * 1260000;
  const posMod = {
    HB:1.14, FE:1.11, FB:1.08, HK:1.06,
    PR:1.04, LK:1.02, SR:1.00, CE:.99, WG:.97
  }[p.pos] || 1;
  const games = p.career ? (p.career.games || 0) : 0;
  const expMod = games >= 180 ? 1.12 : games >= 100 ? 1.08 : games >= 50 ? 1.04 : games < 12 && p.age <= 21 ? .86 : 1;
  const ageMod = p.age<=19 ? .70 : p.age<=21 ? .78 : p.age<=23 ? .90 : p.age>=33 ? (ovr>=74 ? .92 : .78) : p.age>=31 ? .92 : 1;
  const formMod = clamp(0.96 + ((p.form == null ? 50 : p.form)-50)/260, .88, 1.10);
  const durabilityMod = p.attrs && p.attrs.injury < 42 ? .90 : p.attrs && p.attrs.injury < 55 ? .96 : 1;
  const awardText = (p.awards || []).slice(0,8).map(a=>String(a.award || '')).join(' ');
  const awardMod = /Player of the Year|Team of the Year/i.test(awardText) ? 1.12
    : /Rookie of the Year|Top Tryscorer/i.test(awardText) ? 1.06 : 1;
  const tierMod = ovr >= 92 ? 1.20 : ovr >= 81 ? 1.12 : ovr >= 76 ? 1.08 : ovr >= 70 ? 1.04 : 1;
  // Deterministic jitter from player ID — no RNG so demand stays stable across renders
  const jitter = 0.9 + (((Number(p.id) * 31) % 100) / 455);
  return Math.round(clamp(base*posMod*expMod*ageMod*formMod*durabilityMod*awardMod*tierMod*jitter, 85000, 1600000)/5000)*5000;
}
function resetSeasonStats(p){ p.s = {g:0,t:0,runs:0,gl:0,ga:0,fg:0,ta:0,tk:0,m:0,err:0,votes:0,rSum:0,fpts:0,k4020:0,mins:0,mt:0,lb:0,lba:0,ks:0,km:0,inf:0}; }
function attrAvg(p, keys, fallback){
  const vals = keys.map(k=>p.attrs && p.attrs[k]).filter(v=>v != null);
  return Math.round(vals.length ? vals.reduce((s,v)=>s+v,0)/vals.length : fallback);
}
function migratePlayerAttrs(p){
  if(!p.attrs) p.attrs = {};
  const old = p.attrs;
  const base = attrAvg(p, Object.keys(old), 55);
  const from = (keys, fallback) => clamp(attrAvg({attrs:old}, keys, fallback == null ? base : fallback), 20, 99);
  const mapped = {
    shortPass: from(['shortPass','passing'], base),
    longPass: from(['longPass','passing','vision'], base),
    kickAccuracy: from(['kickAccuracy','shortKick','kicking'], base),
    kickPower: from(['kickPower','longKick','kicking'], base),
    placeKick: from(['placeKick','kicking','composure'], base),
    fieldGoal: from(['fieldGoal','kicking','composure'], base),
    playmaking: from(['playmaking','attack','vision','passing'], base),
    ballRunning: from(['ballRunning','attack','speed','strength'], base),
    finishing: from(['finishing','attack','speed','composure'], base),
    ballSecurity: from(['ballSecurity','handling','composure'], base),
    tackling: from(['tackling'], base),
    defRead: from(['defRead','defence','vision'], base),
    bigHit: from(['bigHit','strength','tackling'], base),
    lastDitch: from(['lastDitch','defence','workRate','composure'], base),
    markerDef: from(['markerDef','defence','workRate','tackling'], base),
    speed: from(['speed'], base),
    stamina: from(['stamina'], base),
    acceleration: from(['acceleration','speed','agility'], base),
    catching: from(['catching','handling'], base),
    injury: from(['injury'], old.injProne != null ? 105 - old.injProne*3 : base),
    strength: from(['strength'], base),
    agility: from(['agility'], base),
    composure: from(['composure'], base),
    leadership: from(['leadership'], base),
    vision: from(['vision'], base),
    decisionMaking: from(['decisionMaking','vision','composure'], base),
    workRate: from(['workRate'], base),
    discipline: from(['discipline'], base),
    professionalism: from(['professionalism'], p.prof || base),
  };
  for(const a of ATTRS) p.attrs[a] = clamp(mapped[a] == null ? base : mapped[a], 20, 99);
  if(!p.spec){
    const specialist = defaultSpecialist(p.pos || 'LK');
    p.spec = specialist.spec;
    p.side = specialist.side;
  }
  if(!p.side) p.side = ['leftWing','leftCentre','leftEdge'].includes(p.spec) ? 'left' : ['rightWing','rightCentre','rightEdge'].includes(p.spec) ? 'right' : 'either';
  if(!p.training) p.training = 'balanced';
  // migrate old demonym nationality strings to country names
  const DEMONYM_FIX = {'Australian':'Australia','New Zealander':'New Zealand','Tongan':'Tonga','Samoan':'Samoa','Papua New Guinean':'Papua New Guinea','English':'England','Fijian':'Fiji','Cook Islander':'Cook Islands','Lebanese':'Lebanon'};
  if(p.nationality && DEMONYM_FIX[p.nationality]) p.nationality = DEMONYM_FIX[p.nationality];
  // nationality migration — deterministic from player ID so saves are consistent
  if(!p.nationality){
    const seed = Number(p.id || 1) % 100;
    let natT=0, nat=NATIONALITY_POOL[NATIONALITY_POOL.length-1];
    for(const n of NATIONALITY_POOL){ natT+=n.weight; if(seed<natT){nat=n;break;} }
    p.nationality = nat.country;
    p.repTeam = nat.repTeam;
    p.stateRep = nat.stateReps ? nat.stateReps[Number(p.id||1) % nat.stateReps.length] : null;
  }
  if(!p.face) p.face = genPlayerFace(p);
}
