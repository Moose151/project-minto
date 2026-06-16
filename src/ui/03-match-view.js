'use strict';

Object.assign(UI, {
  /* ---------- advance ---------- */
  advance(){
    if(!G || G.phase==='offseason') return;
    const issues = lineupIssues(myTeam());
    if(issues.length){
      UI.modal(`<h3>Team Sheet Not Compliant</h3>
        <p class="page-sub">Fix these issues before advancing to the match.</p>
        <div class="card" style="padding:10px">${issues.map(x=>`<div style="padding:4px 0;color:var(--red)">${esc(x)}</div>`).join('')}</div>
        <div class="btnrow"><button class="btn primary" onclick="UI.closeModal();UI.go('teamsheet')">Fix team sheet</button><button class="btn" onclick="UI.closeModal()">Close</button></div>`);
      return;
    }
    const res = advanceRound();
    autoSave();
    UI.render();
    if(res && res.type==='round') UI.showRoundResults(res.round, `Round ${G.round} results`);
    if(res && res.type==='finals') UI.showRoundResults(res.games, res.label);
  },
  showRoundResults(games, title){
    const myM = games.find(m=>m.h===G.coach.teamId || m.a===G.coach.teamId);
    let big = '';
    if(myM){
      const th=G.teams[myM.h], ta=G.teams[myM.a];
      const won = (myM.h===G.coach.teamId? myM.hs>myM.as : myM.as>myM.hs);
      const drew = myM.hs===myM.as;
      const perf = [];
      const det = {...myM.det.h, ...myM.det.a};
      const mine = myM.h===G.coach.teamId ? myM.det.h : myM.det.a;
      const top = Object.entries(mine).map(([id,l])=>({p:G.players[id], l})).filter(x=>x.p).sort((a,b)=>b.l.r-a.l.r).slice(0,3);
      const injs = Object.entries(mine).filter(([id,l])=>l.inj).map(([id,l])=>`${G.players[id].name} (${l.inj}, ${G.players[id].injury?G.players[id].injury.weeks:0} wks)`);
      big = `<div class="vs-big">
        <div class="tm"><div class="jersey jersey-lg" style="background:${th.c1};color:${contrastText(th.c1)}">${esc(th.abbr[0])}</div><div class="nm">${esc(th.nick)}</div><div class="sc ${myM.hs>myM.as?'winner':''}" style="color:${myM.hs>=myM.as?'var(--brass)':'var(--ink)'}">${myM.hs}</div></div>
        <div class="dash">–</div>
        <div class="tm"><div class="jersey jersey-lg" style="background:${ta.c1};color:${contrastText(ta.c1)}">${esc(ta.abbr[0])}</div><div class="nm">${esc(ta.nick)}</div><div class="sc" style="color:${myM.as>=myM.hs?'var(--brass)':'var(--ink)'}">${myM.as}</div></div>
      </div>
      <p style="text-align:center; color:${won?'var(--green)':drew?'var(--muted)':'var(--red)'}; font-weight:600; margin-bottom:10px">${won?'WIN':drew?'DRAW':'LOSS'}</p>
      <h2 class="sec" style="margin-top:6px">Best for the ${esc(myTeam().nick)}</h2>
      ${top.map(x=>`<div style="display:flex; justify-content:space-between; padding:3px 0; font-size:13px"><span>${esc(x.p.name)} <span class="pos-tag">${x.p.pos}</span></span><span class="pmeta">${x.l.t?x.l.t+'T ':''}${x.l.ta?x.l.ta+'TA ':''}${x.l.ga?x.l.gl+'/'+x.l.ga+'G ':x.l.gl?x.l.gl+'G ':''}${x.l.fg?x.l.fg+'FG ':''}${x.l.k4020?x.l.k4020+' 40/20 ':''}${x.l.tk}Tk · rating ${x.l.r.toFixed(1)}</span></div>`).join('')}
      ${injs.length?`<h2 class="sec">Casualty ward</h2><p style="color:var(--red); font-size:13px">${injs.map(esc).join('<br>')}</p>`:''}`;
    }
    const others = games.filter(m=>m!==myM).map(m=>{
      const th=G.teams[m.h], ta=G.teams[m.a];
      return `<div class="score-line">
        <span class="team-spine" style="background:${th.c1}"></span><span class="t ${m.hs>m.as?'winner':''}">${esc(th.nick)}</span><span class="s">${m.hs}</span>
        <span style="color:var(--dim)">v</span>
        <span class="s">${m.as}</span><span class="t ${m.as>m.hs?'winner':''}" style="text-align:right">${esc(ta.nick)}</span><span class="team-spine" style="background:${ta.c1}"></span>
      </div>`;
    }).join('');
    UI.modal(`<h3>${esc(title)}</h3>${big}${others?`<h2 class="sec">Around the grounds</h2><div>${others}</div>`:''}
      <div class="btnrow" style="margin-top:16px"><button class="btn primary" onclick="UI.closeModal()">Continue</button></div>`);
  },
});
