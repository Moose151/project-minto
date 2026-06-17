'use strict';

/* Inbox — club news and post-match communications */
Object.assign(UI, {
  _inboxFilter: 'all',
  _inboxExpanded: null,

  p_inbox(){
    const CATS = [
      ['all',            'All'],
      ['analysis',       'Match Analysis'],
      ['match',          'Results'],
      ['injury',         'Medical'],
      ['club',           'Club'],
      ['board',          'Board'],
      ['recommendation', 'Staff Reports'],
      ['form',           'Form Alerts'],
      ['scouting',       'Scouting'],
      ['recruitment',    'Recruitment'],
      ['contract',       'Contracts'],
      ['achievement',    'Achievements'],
    ];

    const news = G.news || [];
    const filtered = UI._inboxFilter === 'all'
      ? news
      : news.filter(n => n.type === UI._inboxFilter);

    const toneIcon  = t => t==='good'?'✓':t==='bad'?'!':'·';
    const toneColor = t => t==='good'?'var(--green)':t==='bad'?'var(--red)':'var(--brass)';

    const catCount = k => k === 'all' ? news.length : news.filter(n=>n.type===k).length;

    const catTabs = CATS.map(([k,l]) => {
      const cnt = catCount(k);
      return `<button class="btn sm ${UI._inboxFilter===k?'primary':''}" onclick="UI._inboxFilter='${k}';UI._inboxExpanded=null;UI.render()">${l}${cnt?' <span style="font-size:10px;opacity:.7">('+cnt+')</span>':''}</button>`;
    }).join('');

    const itemHtml = n => {
      const key = n.createdAt || (n.y+'_'+n.r+'_'+(n.title||''));
      const exp = UI._inboxExpanded === key;
      const preview = (n.body || n.txt || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const fullBody = preview;
      const playerLink = n.playerId && G.players[n.playerId]
        ? `<button class="btn sm" style="margin-top:6px" onclick="UI.playerModal(${n.playerId})">View ${G.players[n.playerId].name}</button>`
        : '';
      return `<div class="inbox-item${exp?' expanded':''}" onclick="UI._inboxExpanded=(UI._inboxExpanded===\`${key}\`?null:\`${key}\`);UI.render()">
        <div class="inbox-header">
          <span class="inbox-tone" style="color:${toneColor(n.tone)}">${toneIcon(n.tone)}</span>
          <span class="inbox-title">${esc(n.title||n.tag||'Club News')}</span>
          <span class="inbox-meta">R${n.r||'?'} · ${n.y||G.year}</span>
        </div>
        ${exp
          ? `<div class="inbox-body">${fullBody}${playerLink}</div>`
          : `<div class="inbox-preview">${preview.length > 100 ? preview.slice(0,100)+'…' : preview}</div>`}
      </div>`;
    };

    const unread = news.filter(n=>n.type==='analysis'||n.type==='board'||n.type==='scouting').length;
    const unreadBadge = unread > 0
      ? `<span style="background:var(--red);color:#fff;border-radius:10px;font-size:10px;font-weight:700;padding:1px 6px;margin-left:6px">${unread}</span>`
      : '';

    return `<h1 class="page">Inbox${unreadBadge}</h1>
    <p class="page-sub">Post-match reports, club communications, and staff updates.</p>
    <div class="btnrow" style="flex-wrap:wrap;gap:4px">${catTabs}</div>
    <div style="margin-top:12px">
      ${filtered.length
        ? filtered.map(itemHtml).join('')
        : `<p class="page-sub">No items in this category.</p>`}
    </div>`;
  },
});
