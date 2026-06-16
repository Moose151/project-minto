'use strict';

/* Match Day — pre-match info, lineups, coaching preferences and match feed */
Object.assign(UI, {
  _watchSpeed: 2,
  _matchMode: 'result',

  p_matchday(){
    const t = myTeam();
    const m = G.phase==='regular' && G.fixtures[G.round] ? G.fixtures[G.round].find(m=>m.h===t.id||m.a===t.id) : null;
    if(!m) return `<h1 class="page">Match Day</h1><p class="page-sub">No regular-season match is currently available.</p>`;
    const h = G.teams[m.h], a = G.teams[m.a];
    const stadium = h.stadium || pick(STADIUM_NAMES);
    if(!m.projWeather) m.projWeather = pick(WEATHER);
    if(!m.projCrowd) m.projCrowd = matchCrowd(h, false);
    const homeGame = m.h === G.coach.teamId;
    const ticketPrice = G.club ? (G.club.ticketPrice || 28) : 28;
    const venue = `${esc(stadium)} · ${esc(m.projWeather)} · projected crowd ${m.projCrowd.toLocaleString()}${homeGame?` · tickets ${money(ticketPrice)}`:''}`;
    const label = v => String(v).replace(/([A-Z])/g,' $1').replace(/^./, c=>c.toUpperCase());
    const row = (team, i) => {
      const p = G.players[team.lineup[i]];
      return `<tr><td>#${SLOTS[i].n}</td><td>${SLOTS[i].pos}</td><td>${p?`<b>${esc(p.name)}</b>`:'-'}</td><td class="num">${p?p.ovr:'-'}</td><td class="num">${p?Math.round(p.cond):'-'}%</td><td class="num">${p?`${p.s.g}g ${p.s.t}T ${p.s.runs||0}R`:''}</td></tr>`;
    };
    const prefs = t.matchPrefs || (t.matchPrefs={autoSubs:true, penalty:'auto', fieldGoal:true});
    const watchControls = UI._matchMode==='watch' ? `<div class="card" style="margin-top:16px"><h2 class="sec" style="margin-top:0">Watch controls</h2>
      <div class="grid3">
        <div class="field"><label>Penalty preference</label><select onchange="myTeam().matchPrefs.penalty=this.value;UI.render()">
          ${['auto','kickTouch','tap','penaltyGoal'].map(v=>`<option value="${v}" ${prefs.penalty===v?'selected':''}>${label(v)}</option>`).join('')}
        </select></div>
        <div class="field"><label>Watch speed</label><select onchange="UI._watchSpeed=+this.value;UI.render()">${[1,2,4,8].map(v=>`<option value="${v}" ${UI._watchSpeed===v?'selected':''}>${v}x</option>`).join('')}</select></div>
        <div class="field"><label>Automation</label>
          <label style="display:block;color:var(--muted);font-size:12px"><input type="checkbox" ${prefs.autoSubs?'checked':''} onchange="myTeam().matchPrefs.autoSubs=this.checked"> Auto substitutions</label>
          <label style="display:block;color:var(--muted);font-size:12px"><input type="checkbox" ${prefs.fieldGoal?'checked':''} onchange="myTeam().matchPrefs.fieldGoal=this.checked"> Attempt field goals inside 45m</label>
        </div>
      </div>
    </div>` : '';
    const ticketControls = homeGame && !m.played ? `<div class="card" style="margin-top:12px">
      <h2 class="sec" style="margin-top:0">Home Tickets</h2>
      <p class="page-sub">Price affects projected crowd and gate revenue. Lower prices usually lift attendance; higher prices risk empty seats.</p>
      <div class="btnrow" style="align-items:center">
        <button class="btn sm" onclick="UI.setTicketPrice(${ticketPrice-5})">-5</button>
        <span style="font-family:var(--disp);font-size:28px;font-weight:700;min-width:80px;text-align:center">${money(ticketPrice)}</span>
        <button class="btn sm" onclick="UI.setTicketPrice(${ticketPrice+5})">+5</button>
        <span style="font-size:12px;color:var(--muted)">Projected gate: ${money(m.projCrowd * ticketPrice)}</span>
      </div>
    </div>` : '';
    const o = UI._matchOdds(m);
    const favTeam = o.favoured==='h' ? h : a;
    const oddsBar = `<div style="display:flex;gap:12px;align-items:center;margin:8px 0 4px;flex-wrap:wrap">
      <span style="color:var(--muted);font-size:12px">Bookie odds:</span>
      <span style="font-weight:700;color:${o.favoured==='h'?'var(--brass)':'var(--muted)'}">${esc(h.nick)} ${UI._oddsStr(o.oddsH)}</span>
      <span style="color:var(--dim)">·</span>
      <span style="font-weight:700;color:${o.favoured==='a'?'var(--brass)':'var(--muted)'}">${esc(a.nick)} ${UI._oddsStr(o.oddsA)}</span>
      <span style="color:var(--dim);font-size:11px">(${esc(favTeam.nick)} favoured · ${Math.round((o.favoured==='h'?o.pH:o.pA)*100)}% implied)</span>
      <button class="btn sm" onclick="UI.go('predictions')" style="margin-left:auto">Full predictions →</button>
    </div>`;
    const myCoach = G.coach.name;
    const oppTeam = t.id===h.id ? a : h;
    const oppCoach = oppTeam.headCoach ? oppTeam.headCoach.name : 'Unknown coach';
    const coachLine = `<p style="font-size:12px;color:var(--muted);margin:2px 0 8px"><b>${esc(myCoach)}</b> vs <b>${esc(oppCoach)}</b>${oppTeam.headCoach?` (rep ${oppTeam.headCoach.rep})`:''}  · ${esc(venue)}</p>`;
    return `<h1 class="page">Match Day</h1>
    <p class="page-sub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">Round ${G.round+1} · ${teamLogo(h,28)} ${esc(teamName(h))} v ${teamLogo(a,28)} ${esc(teamName(a))}</p>
    ${coachLine}
    ${oddsBar}
    <div class="btnrow"><button class="btn ${UI._matchMode==='result'?'primary':''}" onclick="UI._matchMode='result';UI.render()">Sim result</button><button class="btn ${UI._matchMode==='watch'?'primary':''}" onclick="UI._matchMode='watch';UI.render()">Watch game</button><button class="btn" onclick="UI.go('teamsheet')">Adjust team sheet</button></div>
    <div class="grid2">
      <div class="card"><h2 class="sec" style="margin-top:0">${esc(h.nick)} lineup</h2><table><tbody>${Array.from({length:17},(_,i)=>row(h,i)).join('')}</tbody></table></div>
      <div class="card"><h2 class="sec" style="margin-top:0">${esc(a.nick)} lineup</h2><table><tbody>${Array.from({length:17},(_,i)=>row(a,i)).join('')}</tbody></table></div>
    </div>
    ${ticketControls}
    ${watchControls}
    <div class="btnrow" style="margin-top:16px"><button class="btn primary" onclick="UI.playMatchDay(UI._matchMode==='watch')">${UI._matchMode==='watch'?'Kick off':'Sim to result'}</button></div>`;
  },

  setTicketPrice(value){
    if(!G.club) return;
    G.club.ticketPrice = clamp(Math.round(+value || 28), 10, 120);
    const t = myTeam();
    const m = G.phase==='regular' && G.fixtures[G.round] ? G.fixtures[G.round].find(m=>m.h===t.id||m.a===t.id) : null;
    if(m && m.h === t.id && !m.played){
      m.projCrowd = matchCrowd(G.teams[m.h], false);
    }
    UI.render();
  },

  playMatchDay(watch){
    const res = advanceRound();
    autoSave();
    UI.render();
    if(!res || res.type!=='round') return;
    if(watch) UI.showMatchFeed(res.round, `Live feed · Round ${G.round}`);
    else UI.showRoundResults(res.round, `Round ${G.round} results`);
  },

  showMatchFeed(games, title){
    const myM = games.find(m=>m.h===G.coach.teamId || m.a===G.coach.teamId);
    if(!myM) return UI.showRoundResults(games, title);
    const events = UI._buildFeed(myM);
    const h = G.teams[myM.h], a = G.teams[myM.a];
    const won = (myM.h===G.coach.teamId? myM.hs>myM.as : myM.as>myM.hs);
    const drew = myM.hs===myM.as;
    UI.modal(`<h3>${esc(title)}</h3>
      <p class="page-sub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">${teamLogo(h,28)} ${esc(h.nick)} <b>${myM.hs}</b> – <b>${myM.as}</b> ${teamLogo(a,28)} ${esc(a.nick)} · ${esc(myM.det.venue||'Stadium')} · ${esc(myM.det.weather||'')} · ${(myM.det.crowd||0).toLocaleString()}</p>
      <p style="text-align:center;color:${won?'var(--green)':drew?'var(--muted)':'var(--red)'};font-weight:700;font-size:16px;margin-bottom:8px">${won?'WIN':drew?'DRAW':'LOSS'}</p>
      <div id="liveFeedBox" style="max-height:400px;overflow-y:auto;font-size:13px"></div>
      <div class="btnrow" style="margin-top:12px">
        <button class="btn primary" onclick="UI.closeModal();UI.showRoundResults(G.fixtures[G.round-1],'Round ${G.round} results')">Full results</button>
        <button class="btn" onclick="UI.closeModal()">Close</button>
      </div>`);
    UI._revealFeed(events, 0);
  },

  _revealFeed(events, i){
    const box = document.getElementById('liveFeedBox');
    if(!box || i>=events.length) return;
    const e = events[i];
    const isScore = e.txt && (e.txt.startsWith('TRY') || e.txt.includes('HALF TIME') || e.txt.startsWith('FULL TIME') || e.txt.includes('slots a penalty goal'));
    const isSinBin = e.txt && (e.txt.includes('SIN BINNED') || e.txt.includes('SENT OFF'));
    const color = isScore ? 'color:var(--brass)' : isSinBin ? 'color:var(--red)' : '';
    box.innerHTML += `<div style="padding:5px 0;border-bottom:1px solid var(--line);display:flex;gap:8px;align-items:baseline">
      <span style="color:var(--dim);font-size:11px;min-width:28px;flex-shrink:0">${e.min}'</span>
      <span style="${color}">${esc(e.txt)}</span>
    </div>`;
    box.scrollTop = box.scrollHeight;
    setTimeout(()=>UI._revealFeed(events, i+1), Math.max(80, 800/(UI._watchSpeed||2)));
  },

  _buildFeed(m){
    const h = G.teams[m.h], a = G.teams[m.a];

    const TRY_DESC = {
      FB:['weaves through to score','chips over and catches it himself','sprints clear on the full back'],
      WG:['dives over in the corner','finishes brilliantly','plants it down in-goal'],
      CE:['powers through','steps inside to score','bulldozes over the line'],
      FE:['catches them napping','produces something special','beats the last defender'],
      HB:['darts away from dummy half','slips through the gap','wrong-foots the defence to score'],
      PR:['crashes over from close range','powers through three defenders','rumbles over the line'],
      HK:['darts from dummy half to score','snipes through from short range','catches the defence off guard'],
      SR:['barges over','charges over the line','takes the direct option to score'],
      LK:['leads from the front to score','charges over','shows his class to dot down'],
      BE:['finishes the move off','gets the reward for hard work','crashes over'],
    };
    const tryDesc = pos => pick(TRY_DESC[pos] || TRY_DESC.BE);
    const ASSIST_VERBS = ['provides the scoring pass for','fires the ball to','puts','threads a perfect ball to'];

    // Collect all try events sorted by time
    const tryEvs = [
      ...(m.det.h._tryEvents||[]).map(ev=>({...ev, side:'h'})),
      ...(m.det.a._tryEvents||[]).map(ev=>({...ev, side:'a'})),
    ].sort((x,y)=>x.min-y.min);

    // Collect all penalty goal events
    const penEvs = [
      ...(m.det.h._penGoalEvents||[]).map(ev=>({...ev, side:'h'})),
      ...(m.det.a._penGoalEvents||[]).map(ev=>({...ev, side:'a'})),
    ].sort((x,y)=>x.min-y.min);

    const all = [];
    all.push({min:0, txt:`Kick off at ${m.det.venue||'the stadium'}. ${m.det.weather||'Clear'} conditions, crowd of ${(m.det.crowd||15000).toLocaleString()}.`});

    // Build try/conversion events with running score
    let sH=0, sA=0;
    for(const ev of tryEvs){
      const team = ev.side==='h' ? h : a;
      const scorer = G.players[ev.scorerId]; if(!scorer) continue;
      const assist = ev.assistId ? G.players[ev.assistId] : null;
      const kicker = ev.kickerId ? G.players[ev.kickerId] : null;
      if(ev.side==='h'){ sH += 4+(ev.converted?2:0); } else { sA += 4+(ev.converted?2:0); }
      const assistTxt = assist ? ` ${pick(ASSIST_VERBS)} ${assist.name},` : '';
      const convTxt = ev.converted
        ? (kicker && kicker.id!==scorer.id ? ` ${kicker.name} converts.` : ' Conversion good.')
        : ' Conversion missed.';
      all.push({min:ev.min, txt:`TRY — ${team.nick}:${assistTxt} ${scorer.name} ${tryDesc(scorer.pos)}.${convTxt} (${sH}–${sA})`});
    }

    // Penalty goal events with running score
    for(const ev of penEvs){
      const team = ev.side==='h' ? h : a;
      const kicker = G.players[ev.kickerId]; if(!kicker) continue;
      if(ev.made){
        if(ev.side==='h') sH+=2; else sA+=2;
        all.push({min:ev.min, txt:`${kicker.name} (${team.nick}) slots a penalty goal. (${sH}–${sA})`});
      } else {
        all.push({min:ev.min, txt:`${kicker.name} (${team.nick}) misses the penalty attempt.`});
      }
    }

    // Field goals, infringements and other det.events
    for(const ev of (m.det.events||[])){
      all.push(ev);
    }

    // Injuries and 40/20s from per-player lines
    for(const [side, team] of [[m.det.h,h],[m.det.a,a]]){
      for(const [id,l] of Object.entries(side)){
        const p = G.players[+id]; if(!p || typeof l!=='object' || !l || Array.isArray(l)) continue;
        if(l.inj) all.push({min:ri(10,75), txt:`Injury: ${p.name} (${team.nick}) leaves the field with ${l.inj}.`});
        if(l.k4020) for(let i=0;i<l.k4020;i++) all.push({min:ri(8,72), txt:`${p.name} (${team.nick}) finds touch with a pinpoint 40/20 kick!`});
      }
    }

    all.sort((x,y)=>x.min-y.min);

    // Insert half-time marker
    let htH=0, htA=0;
    for(const ev of tryEvs.filter(e=>e.min<=40)){ if(ev.side==='h') htH+=4+(ev.converted?2:0); else htA+=4+(ev.converted?2:0); }
    for(const ev of penEvs.filter(e=>e.min<=40 && e.made)){ if(ev.side==='h') htH+=2; else htA+=2; }
    const htIdx = all.findIndex(e=>e.min>40);
    if(htIdx>=0) all.splice(htIdx,0,{min:40, txt:`⏸ HALF TIME — ${h.nick} ${htH}–${htA} ${a.nick}`});
    else all.push({min:40, txt:`⏸ HALF TIME — ${h.nick} ${htH}–${htA} ${a.nick}`});

    all.push({min:80, txt:`FULL TIME — ${h.nick} ${m.hs}–${m.as} ${a.nick}`});
    return all;
  },
});
