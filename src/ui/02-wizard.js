'use strict';

Object.assign(UI, {
  /* ---------- wizard ---------- */
  wizCfg:{nTeams:12, cap:9500000, coachName:''},
  wizWorld:null,
  wizard(){
    return `<div id="wizard-wrap">
      <div class="hero-mark">Project <span>Minto</span></div>
      <div class="hero-tag">Rugby league management. Fictional world, generated players, your coaching career.</div>
      <div class="card">
        <div class="field"><label>Coach name</label><input type="text" id="wzName" placeholder="e.g. Dan Carmody" value="${esc(UI.wizCfg.coachName)}"></div>
        <div class="field"><label>League size</label>
          <div class="radio-row">${[8,10,12,14,16].map(n=>`<div class="opt ${UI.wizCfg.nTeams===n?'sel':''}" onclick="UI.wizSet('nTeams',${n})">${n} clubs</div>`).join('')}</div></div>
        <div class="field"><label>Salary cap</label>
          <div class="radio-row">${[[8000000,'$8.0m'],[9500000,'$9.5m'],[11000000,'$11.0m']].map(([v,l])=>`<div class="opt ${UI.wizCfg.cap===v?'sel':''}" onclick="UI.wizSet('cap',${v})">${l}</div>`).join('')}</div></div>
        <button class="btn primary" onclick="UI.wizGenerate()">Generate league</button>
      </div>
      ${UI.wizWorld ? `<h2 class="sec">Choose your club</h2>
      <p class="page-sub">Squad strength shown below. A weaker club means lower expectations — and more room to build a reputation.</p>
      <div class="team-pick">${G.teams.map(t=>{
        const s = Math.round(squadStrength(t));
        const tier = s>=64?'Premiership contender':s>=60?'Finals hopeful':s>=57?'Mid-table':'Rebuilding';
        return `<div class="tp" onclick="UI.wizPick(${t.id})">
          <div class="jersey" style="background:${t.c1}; color:${contrastText(t.c1)}; float:right">${esc(t.abbr[0])}</div>
          <div class="city">${esc(t.city)}</div><div class="nick">${esc(t.nick)}</div>
          <div class="str">Squad ${s} · ${tier}</div></div>`;
      }).join('')}</div>` : ''}
    </div>`;
  },
  wizSet(k,v){ UI.wizCfg[k]=v; UI.wizCfg.coachName = document.getElementById('wzName').value; UI.render(); },
  wizGenerate(){
    UI.wizCfg.coachName = document.getElementById('wzName').value.trim() || 'Coach Carmody';
    startNewGame({nTeams:UI.wizCfg.nTeams, cap:UI.wizCfg.cap, coachName:UI.wizCfg.coachName, teamId:null});
    UI.wizWorld = true;
    UI.render();
  },
  wizPick(id){
    G.coach.teamId = id;
    G.coach.expect = setExpectation();
    addNews(`Season ${G.year}: ${G.coach.name} appointed head coach of the ${teamName(myTeam())}. Board expectation: ${G.coach.expect.label}.`);
    UI.wizWorld = null;
    UI.toast(`Welcome to the ${myTeam().nick}.`);
    UI.go('dashboard');
  },
});
