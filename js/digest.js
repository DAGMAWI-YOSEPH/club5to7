/* digest.js · public reader */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  const list = document.querySelector('#issue-list');
  const article = document.querySelector('#article');

  const all = await db.list('digest_issues', { sortBy: 'number', desc: true });
  const published = all.filter(i => i.status === 'published');

  if (!published.length) {
    article.innerHTML = `<p class="muted">No issues yet.</p>`;
    return;
  }

  list.innerHTML = `<h4>The Archive</h4>` + published.map((i, idx) => `
    <button class="issue ${idx === 0 ? 'on' : ''}" data-id="${i.id}">
      <div class="num">Issue №${String(i.number).padStart(2, '0')}</div>
      <div class="t">${escapeHtml(i.title)}</div>
      <div class="d">${formatDate(i.published_at)}</div>
    </button>
  `).join('');

  function paint(issue) {
    article.innerHTML = `
      <div class="masthead">
        <span class="name">The Club5to7 Digest</span>
        <span>Issue №${String(issue.number).padStart(2, '0')} · ${formatDate(issue.published_at)}</span>
      </div>
      <div class="issue-meta">FILED UNDER · ${escapeHtml(issue.dek ? 'Editorial' : 'Notes')}</div>
      <h1>${escapeHtml(issue.title)}</h1>
      ${issue.dek ? `<p class="dek">${escapeHtml(issue.dek)}</p>` : ''}
      <div class="byline">
        <span>BY ${escapeHtml((issue.author || 'The Editors').toUpperCase())}</span>
        <span>·</span>
        <span>${Math.max(1, Math.round((issue.body_html || '').replace(/<[^>]+>/g,'').split(/\s+/).length / 220))} min read</span>
      </div>
      <div class="body">${issue.body_html || ''}</div>
      <div class="end">
        <span class="stamp">— END OF ISSUE №${String(issue.number).padStart(2,'0')} —</span>
        <span>NEXT ISSUE IN ~14 DAYS</span>
      </div>
    `;
  }

  list.querySelectorAll('.issue').forEach(btn => btn.addEventListener('click', () => {
    list.querySelectorAll('.issue').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    const issue = published.find(i => i.id === btn.dataset.id);
    if (issue) paint(issue);
  }));

  paint(published[0]);
})();
