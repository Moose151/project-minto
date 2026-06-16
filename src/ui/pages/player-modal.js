'use strict';

/* Player profile page — every player click routes here */
Object.assign(UI, {
  _playerHistSort: 'newest',
  _playerHistSearch: '',

  playerModal(id){
    if(!G.players[id]) return;
    UI._playerId = +id;
    UI.closeModal();
    UI.go('player');
  },

  p_player(){
    const p = G.players[UI._playerId];
    if(!p) return `<h1 class="page">Player Not Found</h1><p class="page-sub">That player is no longer in the database.</p>`;
    const t = G.teams.find(t=>t.players.includes(p.id));
    const isMyTeam = t && t.id === G.coach.teamId;
    const onShortlist = (G.coach.shortlist||[]).includes(p.id);
    const canApproach = !isMyTeam && G.phase==='regular' && p.years<=1 && !p.approachTeam;
    const alreadyApproached = p.approachTeam === G.coach.teamId;
    const ovrGain = (p.seasonStartOvr != null) ? p.ovr - p.seasonStartOvr : 0;
    const statAvg = p.s.g ? (p.s.rSum/p.s.g).toFixed(1) : '-';

    // Quality tier
    const displayOvr = isMyTeam ? p.ovr : scoutedOvr(p).mid;
    const tier = playerTier(displayOvr);

    // Position-key attributes (weight >= 0.07 in POS_PROFILE)
    const posProf = POS_PROFILE[p.pos] || {};
    const keyAttrs = new Set(
      Object.entries(posProf)
        .filter(([,v]) => v[1] >= 0.07)
        .map(([k]) => k)
    );

    // Attribute block with highlights for positionally-important attrs
    const attrBlock = (title, keys) => {
      const rows = keys.map(a => {
        const val = p.attrs[a];
        const dispVal = isMyTeam ? String(val) : scoutAttrHtml(p, a, val);
        const isKey = keyAttrs.has(a);
        return `<div style="${isKey ? 'background:rgba(210,165,62,.08);border-radius:5px;padding:2px 4px;margin:-2px -4px 2px;' : ''}">
          <div class="attr">
            <span style="${isKey ? 'color:var(--brass);font-weight:600' : ''}">${ATTR_LABEL[a]}${isKey ? ' ★' : ''}</span>
            <b style="${isKey ? 'color:var(--brass)' : ''}">${dispVal}</b>
          </div>
          <div class="bar"><i style="width:${val}%"></i></div>
        </div>`;
      }).join('');
      return `<div class="card"><h2 class="sec" style="margin-top:0">${esc(title)}</h2><div class="attr-grid">${rows}</div></div>`;
    };

    const awards = (p.awards || []).slice(0,24).map(a=>`<tr><td>${a.year}</td><td><b>${esc(a.award)}</b></td><td>${esc(a.detail||'')}</td></tr>`).join('');
    const injuries = (p.injuries || []).slice(0,16).map(i=>`<tr><td>${i.y}</td><td>Rd ${i.r}</td><td><span class="inj">${esc(i.n)}</span></td><td class="num">${i.weeks}w</td></tr>`).join('');
    const histQuery = (UI._playerHistSearch || '').trim().toLowerCase();
    const histVal = h => {
      if(UI._playerHistSort === 'oldest') return h.year;
      if(UI._playerHistSort === 'ovr') return -(h.ovr || 0);
      if(UI._playerHistSort === 'games') return -(h.g || 0);
      if(UI._playerHistSort === 'rating') return -(Number(h.avg) || 0);
      if(UI._playerHistSort === 'tries') return -(h.t || 0);
      return -(h.year || 0);
    };
    const historyRows = (p.history || [])
      .filter(h=>!histQuery || `${h.year} ${h.team} ${h.pos}`.toLowerCase().includes(histQuery))
      .sort((a,b)=>histVal(a)-histVal(b));
    const history = historyRows.map(h=>`<tr><td>${h.year}</td><td>${esc(h.team)}</td><td>${h.age}</td><td><span class="pos-tag">${h.pos}</span></td><td class="num">${h.ovr}</td><td class="num">${h.g}</td><td class="num">${h.t}</td><td class="num">${h.runs||0}</td><td class="num">${h.ta}</td><td class="num">${h.gl}/${h.ga||0}</td><td class="num">${h.fg||0}</td><td class="num">${h.tk}</td><td class="num">${h.m}</td><td class="num">${h.k4020||0}</td><td class="num">${h.fpts}</td><td class="num">${h.avg||'-'}</td><td class="num">${h.votes}</td></tr>`).join('');

    const natLine = playerRepLine(p);

    return `<div class="player-title"><div>${playerAvatar(p,76)}</div><div><h1 class="page">${playerTierBadge(p)} ${esc(p.name)}</h1>
    <p class="page-sub">${POS_NAME[p.pos]} (${p.pos}/${p.pos2}) · ${esc(specialistLabel(p))}${p.side&&p.side!=='either'?` ${p.side}`:''} · ${esc(p.style)} · ${p.age}yo · ${p.hgt}cm ${p.wgt}kg · ${t?esc(teamName(t)):'Free agent'}</p>
    ${natLine}</div></div>
    <div class="player-hero">
      <div class="player-score">
        <span class="lbl">${isMyTeam?'OVR':'Est. OVR'}</span>
        ${ovrHtml(p)}
        ${isMyTeam&&ovrGain?`<em style="color:${ovrGain>0?'var(--green)':'var(--red)'}">${ovrGain>0?'+':''}${ovrGain} this season</em>`:'<em style="font-size:10px;color:var(--dim)">${isMyTeam?\'\':`${scoutedOvr(p).confidence} conf.`}</em>'}
      </div>
      <div class="player-score">
        <span class="lbl">Est. POT</span>
        <b>${potHtml(p)}</b>
        <em>${scoutedPotential(p).confidence} confidence</em>
      </div>
      <div class="player-score"><span class="lbl">Condition</span><b>${Math.round(p.cond)}%</b><em>${p.injury?esc(p.injury.n)+' · '+p.injury.weeks+'w':'Available'}</em></div>
      <div class="player-score"><span class="lbl">Form</span><b>${formHtml(p)}</b><em>week-to-week confidence</em></div>
      <div class="player-score"><span class="lbl">Morale</span><b>${Math.round(p.morale)}%</b><em>${p.squad==='dev'?'Dev squad':'Top squad'}</em></div>
      <div class="player-score"><span class="lbl">Contract</span><b>${money(currentSalary(p))}</b><em>${contractTypeLabel(p.contractType)} · ${Math.max(0,p.years)} yr${Math.max(0,p.years)===1?'':'s'} left</em></div>
      <div class="player-score">
        <span class="lbl">Quality</span>
        <b style="color:${tier.color};font-family:var(--disp);font-size:15px">${tier.label}</b>
        <em style="font-size:10px;color:var(--dim)">${p.suspended&&p.suspended.weeks>0?`<span style="color:var(--red)">Suspended ${p.suspended.weeks}w</span>`:p.injury?'Injured':''}</em>
      </div>
    </div>
    <div class="btnrow">
      <button class="btn" onclick="history.back()">Back</button>
      ${G.godMode?`<button class="btn danger" onclick="UI.playerEditModal(${p.id})">Edit Player</button>`:''}
      ${!isMyTeam?`<button class="btn${onShortlist?' primary':''}" onclick="UI.toggleShortlist(${p.id})">${onShortlist?'★ Shortlisted':'☆ Shortlist'}</button>`:''}
      ${canApproach?`<button class="btn primary" onclick="UI.approachPlayer(${p.id})">Approach pre-contract</button>`:''}
      ${alreadyApproached?`<span style="font-size:12px;color:var(--green);align-self:center">✓ Pre-contract approach made</span>`:''}
    </div>
    <p style="color:var(--muted);font-size:11px;margin:-6px 0 12px">★ = key attribute for ${POS_NAME[p.pos]}. ${!isMyTeam ? `Values shown at ${scoutedOvr(p).confidence.toLowerCase()} scouting confidence.` : ''}</p>
    <div class="grid3">
      <div class="card"><h2 class="sec" style="margin-top:0">This season</h2>
        <p class="bigline">${p.s.g} games · ${p.s.mins||0} mins · avg rating ${statAvg}</p>
        <p class="page-sub">${p.s.t} tries · ${p.s.ta} try assists · ${p.s.lb||0} line breaks · ${p.s.lba||0} LB assists</p>
        <p class="page-sub">${p.s.tk} tackles · ${p.s.mt||0} missed · ${p.s.runs||0} carries · ${p.s.m}m</p>
        <p class="page-sub">${p.s.ks||0} kicks · ${p.s.km||0}m · ${p.s.k4020||0} 40/20 · ${p.s.err} errors · ${p.s.inf||0} infringements</p>
        <p class="page-sub">${p.s.gl}/${p.s.ga||0} goals · ${p.s.fg||0} FG · ${p.s.fpts||0} FP · ${p.s.votes} votes</p>
      </div>
      <div class="card"><h2 class="sec" style="margin-top:0">Career</h2><p class="bigline">${p.career.games} games · ${p.career.tries} tries · ${p.career.points} pts</p><p class="page-sub">${p.career.seasons} seasons · ${p.career.goals} goals · ${p.career.premierships} premierships</p></div>
      <div class="card"><h2 class="sec" style="margin-top:0">Profile</h2><p class="bigline">${ATTR_LABEL.professionalism}: ${p.attrs.professionalism}</p><p class="page-sub">Form ${formText(p)} · Ambition ${p.ambition} · Loyalty ${p.loyalty} · Durability ${p.attrs.injury} · Training ${INDIVIDUAL_TRAINING[p.training||'balanced']}</p></div>
    </div>
    <div class="player-attrs">
      ${attrBlock('Offensive', ATTR_GROUPS.offensive)}
      ${attrBlock('Defensive', ATTR_GROUPS.defensive)}
      ${attrBlock('Physical', ATTR_GROUPS.physical)}
      ${attrBlock('Mental', ATTR_GROUPS.mental)}
    </div>
    <div class="grid2" style="margin-top:16px">
      <div class="card" style="padding:6px;overflow-x:auto"><h2 class="sec" style="margin:8px 10px">Awards</h2><table><thead><tr><th class="noclick">Year</th><th class="noclick">Award</th><th class="noclick">Detail</th></tr></thead><tbody>${awards||'<tr><td colspan="3" style="color:var(--muted)">No awards yet.</td></tr>'}</tbody></table></div>
      <div class="card" style="padding:6px;overflow-x:auto"><h2 class="sec" style="margin:8px 10px">Injury History</h2><table><thead><tr><th class="noclick">Year</th><th class="noclick">Round</th><th class="noclick">Injury</th><th class="noclick num">Time</th></tr></thead><tbody>${injuries||'<tr><td colspan="4" style="color:var(--muted)">No recorded injuries.</td></tr>'}</tbody></table></div>
    </div>
    <div class="card" style="padding:6px;overflow-x:auto;margin-top:16px"><h2 class="sec" style="margin:8px 10px">Season History</h2>
      <div class="history-controls player-history-controls">
        <div class="field"><label>Search seasons</label><input type="search" value="${esc(UI._playerHistSearch||'')}" placeholder="Year, club, position..." oninput="UI._playerHistSearch=this.value;UI.render()"></div>
        <div class="field"><label>Sort</label><select onchange="UI._playerHistSort=this.value;UI.render()">
          ${[
            ['newest','Newest first'],['oldest','Oldest first'],['ovr','Best OVR'],['games','Most games'],['rating','Best avg rating'],['tries','Most tries']
          ].map(([v,l])=>`<option value="${v}" ${UI._playerHistSort===v?'selected':''}>${l}</option>`).join('')}
        </select></div>
        <button class="btn sm" onclick="UI._playerHistSearch='';UI._playerHistSort='newest';UI.render()">Clear</button>
      </div>
      <table><thead><tr><th class="noclick">Year</th><th class="noclick">Club</th><th class="noclick">Age</th><th class="noclick">Pos</th><th class="noclick num">OVR</th><th class="noclick num">G</th><th class="noclick num">T</th><th class="noclick num">Runs</th><th class="noclick num">TA</th><th class="noclick num">Goals</th><th class="noclick num">FG</th><th class="noclick num">Tk</th><th class="noclick num">Mtrs</th><th class="noclick num">40/20</th><th class="noclick num">FP</th><th class="noclick num">Avg</th><th class="noclick num">Votes</th></tr></thead><tbody>${history||'<tr><td colspan="17" style="color:var(--muted)">Completed seasons will appear here.</td></tr>'}</tbody></table>
    </div>`;
  },

  toggleShortlist(id){
    const sl = G.coach.shortlist || (G.coach.shortlist=[]);
    const idx = sl.indexOf(id);
    if(idx>=0){ sl.splice(idx,1); UI.toast('Removed from shortlist.'); }
    else{ sl.push(id); UI.toast('Added to shortlist.'); }
    UI.render();
  },

  approachPlayer(id){ UI.doApproach(id); },  // delegates to recruitment.js which enforces limit

  playerEditModal(id){
    if(!G.godMode){ UI.toast('God Mode is not enabled.'); return; }
    const p = G.players[id]; if(!p) return;
    const attrInputs = ATTRS.map(a=>`<div class="field" style="margin-bottom:8px"><label>${ATTR_LABEL[a]}</label><input id="edit_attr_${a}" type="number" min="1" max="99" value="${p.attrs[a]}"></div>`).join('');
    UI.modal(`<h3>Edit Player</h3>
      <p class="page-sub">${esc(p.name)} · changes apply immediately and recalculate OVR.</p>
      <div class="grid2">
        <div>
          <div class="field"><label>Name</label><input id="edit_name" type="text" value="${esc(p.name)}"></div>
          <div class="field"><label>Age</label><input id="edit_age" type="number" min="16" max="45" value="${p.age}"></div>
          <div class="field"><label>Primary position</label><select id="edit_pos">${POS.map(pos=>`<option value="${pos}" ${p.pos===pos?'selected':''}>${pos}</option>`).join('')}</select></div>
          <div class="field"><label>Secondary position</label><select id="edit_pos2">${POS.map(pos=>`<option value="${pos}" ${p.pos2===pos?'selected':''}>${pos}</option>`).join('')}</select></div>
          <div class="field"><label>Squad</label><select id="edit_squad"><option value="top" ${(p.squad||'top')==='top'?'selected':''}>Top</option><option value="dev" ${p.squad==='dev'?'selected':''}>Development</option></select></div>
          <div class="field"><label>Salary</label><input id="edit_salary" type="number" min="0" step="5000" value="${p.salary}"></div>
          <div class="field"><label>Contract years</label><input id="edit_years" type="number" min="0" max="8" value="${p.years}"></div>
          <div class="field"><label>Nationality</label><select id="edit_nat">${NATIONALITY_POOL.map(n=>`<option value="${esc(n.country)}" ${p.nationality===n.country?'selected':''}>${nationalityFlag(n.country)} ${esc(n.country)}</option>`).join('')}</select></div>
          <div class="field"><label>Preferred city</label><select id="edit_prefCity">${IDENTITIES.map(i=>`<option value="${esc(i.city)}" ${p.prefCity===i.city?'selected':''}>${esc(i.city)}</option>`).join('')}</select></div>
          <div class="grid2" style="gap:8px"><div class="field"><label>Height cm</label><input id="edit_hgt" type="number" min="150" max="230" value="${p.hgt||180}"></div><div class="field"><label>Weight kg</label><input id="edit_wgt" type="number" min="60" max="150" value="${p.wgt||95}"></div></div>
          <div class="field"><label>Injury</label><select id="edit_injury"><option value="" ${!p.injury?'selected':''}>No injury</option>${INJURIES.map(i=>`<option value="${esc(i.n)}" ${p.injury&&p.injury.n===i.n?'selected':''}>${esc(i.n)}</option>`).join('')}</select></div>
          <div class="field"><label>Injury weeks</label><input id="edit_injuryWeeks" type="number" min="0" max="40" value="${p.injury?p.injury.weeks:0}"></div>
          <div class="field"><label>Suspension weeks</label><input id="edit_suspWeeks" type="number" min="0" max="20" value="${p.suspended&&p.suspended.weeks>0?p.suspended.weeks:0}"></div>
        </div>
        <div style="max-height:520px;overflow-y:auto;padding-right:4px">${attrInputs}</div>
      </div>
      <div class="btnrow"><button class="btn primary" onclick="UI.savePlayerEdit(${p.id})">Save changes</button><button class="btn" onclick="UI.randomisePlayerFace(${p.id})">Randomise face</button><button class="btn" onclick="UI.closeModal()">Cancel</button></div>`);
  },
  savePlayerEdit(id){
    if(!G.godMode) return;
    const p = G.players[id]; if(!p) return;
    const val = key => document.getElementById(key).value;
    p.name = val('edit_name').trim() || p.name;
    p.age = clamp(+val('edit_age') || p.age, 16, 45);
    p.pos = val('edit_pos');
    p.pos2 = val('edit_pos2');
    p.squad = val('edit_squad');
    setPlayerContract(p, Math.max(0, Math.round((+val('edit_salary') || 0)/5000)*5000), clamp(+val('edit_years') || 0, 0, 8), p.contractType || 'flat');
    p.prefCity = val('edit_prefCity');
    p.hgt = clamp(+val('edit_hgt') || p.hgt || 180, 150, 230);
    p.wgt = clamp(+val('edit_wgt') || p.wgt || 95, 60, 150);
    const nat = NATIONALITY_POOL.find(n=>n.country===val('edit_nat'));
    if(nat){
      p.nationality = nat.country;
      p.repTeam = nat.repTeam;
      p.stateRep = nat.stateReps ? (p.stateRep && nat.stateReps.includes(p.stateRep) ? p.stateRep : nat.stateReps[0]) : null;
    }
    const injName = val('edit_injury');
    const injWeeks = clamp(+val('edit_injuryWeeks') || 0, 0, 40);
    if(injName && injWeeks > 0){
      p.injury = {n:injName, weeks:injWeeks};
      p.playInjured = false;
    } else {
      p.injury = null;
      p.playInjured = false;
    }
    const suspWeeks = clamp(+val('edit_suspWeeks') || 0, 0, 20);
    p.suspended = suspWeeks > 0 ? {weeks:suspWeeks, reason:'God Mode'} : null;
    for(const a of ATTRS){
      const el = document.getElementById(`edit_attr_${a}`);
      p.attrs[a] = clamp(+el.value || p.attrs[a], 1, 99);
    }
    p.ovr = calcOvr(p);
    p.pot = Math.max(p.pot || p.ovr, p.ovr);
    UI.toast(`${p.name} updated.`);
    UI.closeModal();
    UI.render();
  },
  randomisePlayerFace(id){
    if(!G.godMode) return;
    const p = G.players[id]; if(!p) return;
    p.faceSalt = (p.faceSalt || 0) + 1 + Math.floor(Math.random()*9999);
    p.face = genPlayerFace(p);
    UI.toast(`${p.name}'s face randomised.`);
    UI.playerEditModal(id);
  },
});
