'use strict';

Object.assign(UI, {
  /* ---------- offseason ---------- */
  p_offseason(){
    const O = G.offseason;
    if(!O) return UI.p_dashboard();
    if(O.step==='review') return UI.osReview();
    if(O.step==='contracts') return UI.osContracts();
    if(O.step==='preseason') return UI.osPreseason();
    return UI.osDone();
  },
  osReview(){
    const O = G.offseason;
    const poty = O.awards.poty ? G.players[O.awards.poty] : null;
    const tt = O.awards.topTry ? G.players[O.awards.topTry] : null;
    const roy = O.awards.rookie ? G.players[O.awards.rookie] : null;
    const coy = O.awards.coachYear;
    const toty = O.awards.teamOfYear || [];
    const offers = O.offers.length ? O.offers : (O.offers = generateJobOffers());
    if(O.sacked && !offers.length){ const lad=ladder(); offers.push(lad[lad.length-1].id===G.coach.teamId ? lad[lad.length-2].id : lad[lad.length-1].id); }
    const premier = G.teams[G.finals.premier];
    const awardPlayer = (label, p, detail, empty) => `<div class="card ${p?'click':''}" ${p?`onclick="UI.playerModal(${p.id})"`:''}>
      <div class="navsep" style="margin:0">${label}</div>
      ${p?`<div class="award-player">${playerAvatar(p,54)}<div><div style="font-family:var(--disp); font-size:24px; font-weight:700">${nationalityFlag(p.nationality)} ${esc(p.name)}</div><p style="color:var(--muted); font-size:12px;margin:2px 0 0">${p.repTeam?`${esc(p.repTeam)} · `:''}${detail}</p></div></div>`:`<div style="font-family:var(--disp); font-size:24px; font-weight:700; margin-top:4px">—</div><p style="color:var(--muted); font-size:12px">${empty||''}</p>`}
    </div>`;
    return `<h1 class="page">Season Review — ${G.year}</h1>
    <p class="page-sub">${esc(O.verdict)}</p>
    <div class="grid3">
      <div class="card click" onclick="UI.teamModal(${premier.id})"><div class="navsep" style="margin:0">Premiers</div><div style="font-family:var(--disp); font-size:26px; font-weight:700; margin-top:4px"><span class="team-spine" style="background:${premier.c1}; height:20px"></span>${esc(teamName(premier))}</div></div>
      ${awardPlayer('Player of the Year', poty, poty?`${poty.s.votes} votes · ${esc(teamOf(poty.id))}`:'', '')}
      ${awardPlayer('Rookie of the Year', roy, roy?`${roy.s.g} games · ${(roy.s.rSum/Math.max(1,roy.s.g)).toFixed(1)} avg · ${esc(teamOf(roy.id))}`:'', 'No eligible rookie')}
    </div>
    <div class="grid2" style="margin-top:16px">
      ${awardPlayer('Top tryscorer', tt, tt?`${tt.s.t} tries · ${esc(teamOf(tt.id))}`:'', '')}
      <div class="card"><div class="navsep" style="margin:0">Coach of the Season</div><div style="font-family:var(--disp); font-size:24px; font-weight:700; margin-top:4px">${coy?esc(coy.coach):'—'}</div><p style="color:var(--muted); font-size:12px">${coy?esc(teamName(G.teams[coy.teamId]))+' · finished '+ord(coy.finish)+' from strength rank '+ord(coy.strengthRank):''}</p></div>
    </div>
    <h2 class="sec">Team of the Season</h2>
    <div class="card" style="padding:6px;overflow-x:auto"><table><thead><tr><th class="noclick">Pos</th><th class="noclick">Player</th><th class="noclick">Club</th><th class="noclick num">Avg</th></tr></thead><tbody>
    ${toty.map(x=>{ const p=G.players[x.id]; return `<tr class="click" onclick="UI.playerModal(${x.id})"><td><span class="pos-tag">${x.slot}</span></td><td>${p?`<div class="player-cell">${playerAvatar(p,34)}<div><b>${esc(p.name)}</b><br><span class="pmeta" style="font-size:10px;color:var(--muted)">${nationalityFlag(p.nationality)} ${p.repTeam?esc(p.repTeam):''}</span></div></div>`:'—'}</td><td>${esc(x.team)}</td><td class="num">${x.avg}</td></tr>`; }).join('') || '<tr><td colspan="4" style="color:var(--muted)">No eligible team selected.</td></tr>'}
    </tbody></table></div>
    ${O.retirements.length?`<h2 class="sec">Retirements</h2><div class="card"><p style="font-size:13px; color:var(--muted)">${O.retirements.map(r=>`${esc(r.name)} (${r.team}, ${r.games} games)`).join(' · ')}</p></div>`:''}
    ${offers.length?`<h2 class="sec">${O.sacked?'You need a new job':'Job offers'}</h2>
    <p class="page-sub">${O.sacked?'The following clubs are willing to give you a shot.':'Other boards have noticed your work. Staying put is also an option.'}</p>
    <div class="team-pick">${offers.map(id=>{ const t=G.teams[id];
      return `<div class="tp" onclick="UI.takeJob(${id})"><div class="city">${esc(t.city)}</div><div class="nick">${esc(t.nick)}</div><div class="str">Squad ${Math.round(squadStrength(t))} · tap to accept</div></div>`;}).join('')}</div>`:''}
    <div class="btnrow" style="margin-top:18px">
      ${O.sacked?'':`<button class="btn primary" onclick="G.offseason.step='contracts'; UI.render()">Continue to contracts</button>`}
    </div>`;
  },
  takeJob(id){
    const old = teamName(myTeam());
    G.coach.teamId = id; G.coach.conf = 60; G.coach.seasonsAtClub = 0; G.offseason.sacked = false;
    addNews(`${G.coach.name} leaves ${old} to take over the ${teamName(myTeam())}.`);
    G.offseason.expiring = myTeam().players.filter(pid=>G.players[pid].years<=0);
    G.offseason.step='contracts';
    UI.toast(`Appointed at the ${myTeam().nick}.`);
    UI.render();
  },
  osContracts(){
    const O = G.offseason;
    const t = myTeam();
    const totalSal = teamSalary(t);
    const room = G.config.cap - totalSal;
    O.expiring = O.expiring.filter(id=>t.players.includes(id) && G.players[id]);
    const exp = O.expiring.map(id=>G.players[id]).filter(p=>p.years<=0).sort((a,b)=>b.ovr-a.ovr);
    const fas = O.freeAgents.map(id=>G.players[id]).filter(Boolean).sort((a,b)=>b.ovr-a.ovr).slice(0,30);
    const sl = G.coach.shortlist || [];
    const row = (p, kind) => {
      const starred = sl.includes(p.id) ? `<span style="color:var(--brass);margin-right:4px" title="Shortlisted">★</span>` : '';
      const approached = p.approachTeam===G.coach.teamId ? `<span style="color:var(--green);font-size:11px;margin-left:4px">pre-contract ✓</span>` : '';
      return `<tr><td class="click" onclick="UI.playerModal(${p.id})">${starred}<b>${esc(p.name)}</b> <span class="pos-tag">${p.pos}</span>${approached}</td>
      <td class="num">${p.age}</td><td class="num"><span class="ovr ${ovrCls(p.ovr)}">${p.ovr}</span></td><td class="num">${potHtml(p)}</td><td class="num">${money(demandFor(p, myTeam()))}</td>
      <td><div class="btnrow" style="margin:0"><button class="btn sm primary" onclick="UI.offerModal(${p.id})">${kind==='exp'?'Re-sign':'Sign'}</button>${kind==='exp'?`<button class="btn sm danger" onclick="releasePlayer(myTeam(),${p.id});UI.toast('Released to the open market.');UI.render()">Let go</button>`:''}</div></td></tr>`;
    };
    return `<h1 class="page">Off-Season — Contracts</h1>
    <p class="page-sub">Payroll ${money(totalSal)} · cap ${money(G.config.cap)} · <span style="color:${room<0?'var(--red)':'var(--green)'}">${money(Math.abs(room))} ${room<0?'OVER':'free'}</span> · squad ${t.players.length}</p>
    <h2 class="sec">Your off-contract players</h2>
    <div class="card" style="padding:6px"><table><thead><tr><th class="noclick">Player</th><th class="noclick num">Age</th><th class="noclick num">OVR</th><th class="noclick num">Est. POT</th><th class="noclick num">Demand</th><th class="noclick"></th></tr></thead><tbody>
    ${exp.map(p=>row(p,'exp')).join('')||'<tr><td colspan="6" style="color:var(--muted)">Everyone is signed.</td></tr>'}</tbody></table></div>
    ${sl.length?`<h2 class="sec">Shortlisted players</h2>
    <div class="card" style="padding:6px"><table><thead><tr><th class="noclick">Player</th><th class="noclick num">Age</th><th class="noclick num">OVR</th><th class="noclick num">Est. POT</th><th class="noclick num">Demand</th><th class="noclick"></th></tr></thead><tbody>
    ${sl.map(id=>G.players[id]).filter(p=>p&&!myTeam().players.includes(p.id)).map(p=>row(p,'fa')).join('')||'<tr><td colspan="6" style="color:var(--muted)">All shortlisted players are signed or unavailable.</td></tr>'}
    </tbody></table></div>`:''}
    <h2 class="sec">Free agents</h2>
    <div class="card" style="padding:6px; max-height:380px; overflow-y:auto"><table><thead><tr><th class="noclick">Player</th><th class="noclick num">Age</th><th class="noclick num">OVR</th><th class="noclick num">Est. POT</th><th class="noclick num">Demand</th><th class="noclick"></th></tr></thead><tbody>
    ${fas.map(p=>row(p,'fa')).join('')||'<tr><td colspan="6" style="color:var(--muted)">Market is empty.</td></tr>'}</tbody></table></div>
    <div class="btnrow" style="margin-top:16px"><button class="btn primary" onclick="UI.finishOffseason()">Finalise — unsigned players walk, rivals raid the market</button></div>`;
  },
  offerModal(pid){
    const p = G.players[pid];
    p._att = p._att || 0;
    const demand = demandFor(p, myTeam());
    const promises = normalisePromises(p.promises);
    promises.contractType = p.contractType || 'flat';
    UI._offer = {pid, salary: demand, years: clamp(p.age<=25?3:2,1,3), promises};
    UI.renderOffer(demand);
  },
  renderOffer(demand){
    const o = UI._offer; const p = G.players[o.pid];
    if(p._att>=3){ UI.modal(`<h3>${esc(p.name)}</h3><p style="margin:10px 0">"My client has heard enough. He won't be negotiating further this off-season."</p><div class="btnrow"><button class="btn" onclick="UI.closeModal()">Close</button></div>`); return; }
    const isMine = myTeam().players.includes(o.pid);
    const schedule = contractScheduleFor(o.salary, o.years, o.promises.contractType);
    const firstYear = schedule[0] || o.salary;
    const room = G.config.cap - teamSalary(myTeam()) + (isMine ? currentSalary(p) : 0);
    const chance = contractSignChance(p, o.salary, o.years, myTeam(), o.promises);
    const pct = Math.round(chance.prob*100);
    const promiseBtn = (role,label) => `<button class="btn sm ${o.promises.role===role?'primary':''}" onclick="UI._offer.promises.role='${role}';UI.renderOffer(${demand})">${label}</button>`;
    const typeBtn = (type,label) => `<button class="btn sm ${o.promises.contractType===type?'primary':''}" onclick="UI._offer.promises.contractType='${type}';UI.renderOffer(${demand})">${label}</button>`;
    UI.modal(`<h3>${isMine?'Re-sign':'Sign'} ${esc(p.name)}</h3>
    <p class="page-sub">${POS_NAME[p.pos]} · ${p.age}yo · OVR ${p.ovr} / Est. POT ${potText(p)} (${scoutedPotential(p).confidence} confidence) · agent expects around ${money(demand)} · attempts used ${p._att}/3</p>
    <div class="field"><label>Average salary offer</label>
      <div class="btnrow" style="margin:0; align-items:center">
        <button class="btn sm" onclick="UI._offer.salary=Math.max(85000,UI._offer.salary-25000); UI.renderOffer(${demand})">−25k</button>
        <span style="font-family:var(--disp); font-size:26px; font-weight:700; min-width:110px; text-align:center">${money(o.salary)}</span>
        <button class="btn sm" onclick="UI._offer.salary+=25000; UI.renderOffer(${demand})">+25k</button>
      </div></div>
    <div class="field"><label>Years</label><div class="radio-row">${[1,2,3].map(y=>`<div class="opt ${o.years===y?'sel':''}" onclick="UI._offer.years=${y}; UI.renderOffer(${demand})">${y} year${y>1?'s':''}</div>`).join('')}</div></div>
    <div class="field"><label>Contract structure</label><div class="btnrow" style="margin:0">${typeBtn('flat','Flat')}${typeBtn('front','Front-loaded')}${typeBtn('back','Back-loaded')}</div>
      <p style="color:var(--muted);font-size:11px;margin:6px 0 0">${schedule.map((v,i)=>`Y${i+1}: ${money(v)}`).join(' · ')}</p></div>
    <div class="field"><label>Promises</label><div class="btnrow" style="margin:0">${promiseBtn('none','No role promise')}${promiseBtn('bench','Bench')}${promiseBtn('starter','Starter')}${promiseBtn('superstar','Superstar')}</div>
      <label style="display:flex;gap:8px;align-items:center;margin-top:8px;color:var(--muted);font-size:13px"><input type="checkbox" ${o.promises.captain?'checked':''} onchange="UI._offer.promises.captain=this.checked;UI.renderOffer(${demand})"> Promise captaincy</label></div>
    <div class="sign-meter"><i style="width:${pct}%"></i></div>
    <p style="color:var(--muted); font-size:12px">Estimated signing chance: <b style="color:${pct>=70?'var(--green)':pct<40?'var(--red)':'var(--brass)'}">${pct}%</b> · first-year cap hit ${money(firstYear)} · cap space after deal: ${money(room - firstYear)}</p>
    <div class="btnrow"><button class="btn primary" onclick="UI.submitOffer()">Table the offer</button><button class="btn" onclick="UI.closeModal()">Cancel</button></div>`);
  },
  submitOffer(){
    const o = UI._offer; const p = G.players[o.pid];
    const isMine = myTeam().players.includes(o.pid);
    const firstYear = contractScheduleFor(o.salary, o.years, o.promises.contractType)[0] || o.salary;
    const room = G.config.cap - teamSalary(myTeam()) + (isMine ? currentSalary(p) : 0);
    if(firstYear > room){ UI.toast('That offer busts the salary cap.'); return; }
    p._att = (p._att||0)+1;
    const res = offerContract(p, o.salary, o.years, myTeam(), o.promises);
    if(res.ok){
      if(!isMine){ myTeam().players.push(p.id); G.offseason.freeAgents = G.offseason.freeAgents.filter(id=>id!==p.id); }
      G.offseason.expiring = G.offseason.expiring.filter(id=>id!==p.id);
      addNews(`${p.name} signs with the ${myTeam().nick} on a ${contractTypeLabel(p.contractType).toLowerCase()} deal averaging ${money(contractAvg(p))} for ${o.years} year${o.years>1?'s':''}. Promises: ${promiseSummary(p)}.`);
      UI.toast(`${p.name} signed.`); UI.closeModal(); UI.render();
    } else {
      UI.toast(`${p.name.split(' ')[1]||p.name} knocked it back — wants closer to ${money(res.demand)}.`);
      UI.renderOffer(res.demand);
    }
  },
  finishOffseason(){
    const t = myTeam();
    const over = teamSalary(t) - G.config.cap;
    if(over > 0){ UI.toast(`You're ${money(over)} over the cap — release or let players walk first.`); return; }
    finishContractsPhase();
    for(const id in G.players) delete G.players[id]._att;
    autoPick(myTeam());
    UI.toast('Contracts finalised. Preseason begins.');
    UI.render();
  },
  osPreseason(){
    const ps = G.offseason.preseason || (G.offseason.preseason = createPreseasonPlan());
    const mem = membershipProjection(ps.membershipPrice);
    const sponsorRow = s => {
      const accepted = ps.acceptedSponsorIds.includes(s.id);
      const tag = s.renewal ? `<span style="color:var(--brass);font-size:10px;font-weight:700;margin-left:4px">RENEWAL</span>` : '';
      const note = s.expiryNote ? `<span class="pmeta" style="color:var(--brass)"> · ${esc(s.expiryNote)}</span>` : '';
      return `<tr>
        <td><b>${esc(s.name)}</b>${tag}<br><span class="pmeta">${esc(s.category)} sponsor · ${s.yearsLeft} yr${s.yearsLeft===1?'':'s'}</span>${note}</td>
        <td class="num"><b>${money(s.value)}</b>/yr</td>
        <td>${accepted?'<span style="color:var(--green);font-size:11px">✓ Accepted</span>':`<button class="btn sm ${s.renewal?'':'primary'}" style="${s.renewal?'border-color:var(--brass);color:var(--brass)':''}" onclick="UI.acceptSponsor('${s.id}')">Accept</button>`}</td>
      </tr>`;
    };
    const renewals = ps.sponsorOffers.filter(s=>s.renewal);
    const newOffers = ps.sponsorOffers.filter(s=>!s.renewal);
    const activeSponsorRows = (G.club.sponsorships||[]).filter(s=>s.yearsLeft>1).map(s=>
      `<tr><td><b>${esc(s.name)}</b> <span style="color:var(--green);font-size:10px">active</span><br><span class="pmeta">${esc(s.category)} · ${s.yearsLeft} yr${s.yearsLeft===1?'':'s'} remaining</span></td><td class="num">${money(s.value)}/yr</td><td style="color:var(--muted);font-size:11px">Secured</td></tr>`
    );
    const trialRows = ps.trials.map((tr,i)=>{
      const opp = G.teams[tr.opponent];
      return `<tr><td>Trial ${i+1}</td><td>${esc(opp?opp.nick:'Opponent')}</td><td class="num"><b>${tr.us}-${tr.them}</b></td></tr>`;
    }).join('');
    return `<h1 class="page">Preseason — ${G.year + 1}</h1>
    <p class="page-sub">Set up your commercial base, run camp, and play up to three trial matches before Round 1.</p>
    <div class="grid2">
      <div class="card">
        <h2 class="sec" style="margin-top:0">Memberships</h2>
        <p class="page-sub">Price affects demand. Revenue is paid when the season starts.</p>
        <div class="field"><label>Season ticket price</label>
          <div class="btnrow" style="margin:0;align-items:center">
            <button class="btn sm" onclick="UI.setMembershipPrice(${ps.membershipPrice-20})">-20</button>
            <span style="font-family:var(--disp);font-size:28px;font-weight:700;min-width:90px;text-align:center">${money(mem.price)}</span>
            <button class="btn sm" onclick="UI.setMembershipPrice(${ps.membershipPrice+20})">+20</button>
          </div>
        </div>
        <div class="dash-status good"><div class="dash-label">Projected Members</div><div class="dash-value">${mem.members.toLocaleString()}</div><div class="dash-sub">${money(mem.revenue)} revenue</div></div>
      </div>
      <div class="card">
        <h2 class="sec" style="margin-top:0">Training Camp</h2>
        <p class="page-sub">Camp focus boosts attribute development for players during preseason. Younger players benefit most. Set separate focuses for backs and forwards.</p>
        <div class="field" style="margin-bottom:8px"><label style="font-size:11px;color:var(--muted)">Backs (FB / WG / CE / FE / HB)</label>
          <div class="btnrow" style="margin:0">${['balanced','attack','defence','fitness'].map(f=>`<button class="btn sm ${ps.campFocus===f?'primary':''}" onclick="G.offseason.preseason.campFocus='${f}';UI.render()">${f[0].toUpperCase()+f.slice(1)}</button>`).join('')}</div>
        </div>
        <div class="field"><label style="font-size:11px;color:var(--muted)">Forwards (PR / HK / SR / LK)</label>
          <div class="btnrow" style="margin:0">${['balanced','attack','defence','fitness'].map(f=>`<button class="btn sm ${ (ps.campFocusFwd||'balanced')===f?'primary':''}" onclick="G.offseason.preseason.campFocusFwd='${f}';UI.render()">${f[0].toUpperCase()+f.slice(1)}</button>`).join('')}</div>
        </div>
        <h2 class="sec">Trial Matches</h2>
        <p class="page-sub">Trials do not count on the ladder. Small injury and conditioning risk applies.</p>
        <button class="btn primary" onclick="UI.playTrial()" ${ps.trialsPlayed>=3?'disabled':''}>Play trial (${ps.trialsPlayed}/3)</button>
        <table style="margin-top:8px"><tbody>${trialRows || '<tr><td colspan="3" style="color:var(--muted)">No trials played.</td></tr>'}</tbody></table>
      </div>
    </div>
    <h2 class="sec">Sponsorship Window</h2>
    ${activeSponsorRows.length ? `<div class="card" style="padding:6px;overflow-x:auto;margin-bottom:10px"><p style="font-size:11px;color:var(--muted);margin:4px 8px 6px">Active deals (already secured)</p><table><tbody>${activeSponsorRows.join('')}</tbody></table></div>` : ''}
    ${renewals.length ? `<div class="card" style="padding:6px;overflow-x:auto;margin-bottom:10px;border-color:var(--brass)"><p style="font-size:11px;color:var(--brass);margin:4px 8px 6px">⚠ Expiring this season — renew or let expire</p><table><thead><tr><th class="noclick">Sponsor</th><th class="noclick num">Value</th><th class="noclick"></th></tr></thead><tbody>${renewals.map(sponsorRow).join('')}</tbody></table></div>` : ''}
    <div class="card" style="padding:6px;overflow-x:auto"><p style="font-size:11px;color:var(--muted);margin:4px 8px 6px">New sponsorship opportunities</p><table><thead><tr><th class="noclick">Sponsor</th><th class="noclick num">Value</th><th class="noclick"></th></tr></thead><tbody>${newOffers.map(sponsorRow).join('') || '<tr><td colspan="3" style="color:var(--muted)">No new offers this season.</td></tr>'}</tbody></table></div>
    <div class="btnrow" style="margin-top:16px"><button class="btn primary" onclick="UI.completePreseason()">Start season</button></div>`;
  },
  setMembershipPrice(value){
    const ps = G.offseason && G.offseason.preseason; if(!ps) return;
    ps.membershipPrice = clamp(Math.round(+value || ps.membershipPrice), 80, 500);
    UI.render();
  },
  acceptSponsor(id){
    const res = acceptSponsorOffer(id);
    UI.toast(res.msg);
    UI.render();
  },
  playTrial(){
    const tr = simPreseasonTrial();
    if(tr){ UI.toast(`Trial complete: ${tr.us}-${tr.them}.`); autoPick(myTeam()); }
    else UI.toast('No trial available.');
    UI.render();
  },
  completePreseason(){
    if(!completePreseason()){ UI.toast('Could not complete preseason.'); return; }
    autoPick(myTeam());
    UI.toast(`Season ${G.year} begins.`);
    UI.go('dashboard');
  },
  osDone(){ return UI.p_dashboard(); }
});
