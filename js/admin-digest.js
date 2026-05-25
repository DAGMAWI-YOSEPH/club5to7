/* admin-digest.js · WYSIWYG editor for biweekly digest */

(function () {
  let activeId = null;
  let quill = null;

  async function render(sec, headTpl) {
    const issues = await db.list('digest_issues', { sortBy: 'number', desc: true });
    sec.innerHTML = `
      ${headTpl('Digest editor', 'Write the next issue. Save drafts. Publish when ready. Live preview on the right.')}
      <div class="tip">
        <strong>Plain English →</strong>
        <span>Select text and use the toolbar to format. The "Preview" pane shows exactly what the public will see. Nothing is publishable until you flip the status to <strong>Published</strong>.</span>
      </div>

      <div style="display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start">
        <aside class="card flat" style="border:1px solid var(--rule);padding:0;overflow:hidden">
          <div style="padding:12px 16px;border-bottom:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center">
            <h4 style="font-family:var(--f-mono);font-size:10px;letter-spacing:0.14em;color:var(--ink-mute);text-transform:uppercase">Issues</h4>
            <button class="btn sm primary" id="new-issue">+ New</button>
          </div>
          <div id="issue-list-cms"></div>
        </aside>
        <div>
          <div class="form-grid">
            <div class="field"><label>Issue number</label><input class="input" id="d-num" type="number"></div>
            <div class="field"><label>Status</label>
              <select class="select" id="d-status">
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (public)</option>
              </select>
            </div>
            <div class="field col-2"><label>Title</label><input class="input" id="d-title"></div>
            <div class="field col-2"><label>Dek (one-line subtitle)</label><input class="input" id="d-dek"></div>
            <div class="field"><label>Author</label><input class="input" id="d-author"></div>
            <div class="field"><label>Publish date</label><input class="input" type="datetime-local" id="d-date"></div>
          </div>

          <label style="margin-top:16px;display:block"><strong>Body</strong></label>
          <div id="toolbar" class="toolbar">
            <button class="ql-bold" title="Bold">B</button>
            <button class="ql-italic" title="Italic"><i>I</i></button>
            <button class="ql-underline" title="Underline"><u>U</u></button>
            <button class="ql-header" value="3" title="Heading">H</button>
            <button class="ql-blockquote" title="Quote">"</button>
            <button class="ql-list" value="bullet" title="Bullet list">•</button>
            <button class="ql-list" value="ordered" title="Numbered list">1.</button>
            <button class="ql-link" title="Link">link</button>
            <button class="ql-clean" title="Clear formatting">×</button>
          </div>
          <div id="editor"></div>

          <div class="preview-box">
            <div class="label">Live preview · this is what the public will see</div>
            <article id="preview-article" style="max-width:none">
              <h1 id="prev-h" class="display" style="font-size:36px;line-height:1;margin-bottom:8px"></h1>
              <p id="prev-d" class="muted" style="font-size:16px;margin-bottom:16px"></p>
              <div id="prev-b" style="font-size:16px;line-height:1.6"></div>
            </article>
          </div>

          <div class="action-bar">
            <button class="btn ghost" id="del-issue">Delete issue</button>
            <button class="btn ghost" id="save-draft">Save draft</button>
            <button class="btn primary" id="publish">${'Save & publish →'}</button>
          </div>
        </div>
      </div>
    `;

    paintIssueList(issues);
    if (issues.length && !activeId) activeId = issues[0].id;
    if (!activeId) {
      await createNew();
      return;
    }

    initEditor();
    load(activeId);

    document.querySelector('#new-issue').addEventListener('click', createNew);
    document.querySelector('#save-draft').addEventListener('click', () => save('draft'));
    document.querySelector('#publish').addEventListener('click', () => save('published'));
    document.querySelector('#del-issue').addEventListener('click', async () => {
      if (!confirm('Delete this issue?')) return;
      await db.remove('digest_issues', activeId);
      activeId = null;
      toast('Deleted');
      render(sec, headTpl);
    });

    ['d-title','d-dek'].forEach(id =>
      document.querySelector('#'+id).addEventListener('input', updatePreview)
    );
  }

  function paintIssueList(issues) {
    document.querySelector('#issue-list-cms').innerHTML = issues.map(i => `
      <button class="issue ${i.id === activeId ? 'on' : ''}" data-id="${i.id}" style="text-align:left;width:100%;padding:12px 16px;border-top:1px solid var(--rule-soft);background:${i.id===activeId?'var(--accent-soft)':'transparent'};cursor:pointer">
        <div style="font-family:var(--f-mono);font-size:10px;color:var(--ink-mute);letter-spacing:0.1em">№${String(i.number).padStart(2,'0')} · ${i.status==='published'?'LIVE':'DRAFT'}</div>
        <div class="display" style="font-size:15px;margin-top:4px;line-height:1.15">${escapeHtml(i.title)}</div>
      </button>
    `).join('');
    document.querySelectorAll('#issue-list-cms [data-id]').forEach(b =>
      b.addEventListener('click', () => { activeId = b.dataset.id; render(document.querySelector('section[data-id="digest"]'), (t,s)=>`<div class="pane-head"><div><h2>${t}</h2><div class="sub">${s||''}</div></div></div>`); })
    );
  }

  function initEditor() {
    if (!window.Quill) return;
    quill = new Quill('#editor', {
      theme: 'bubble',
      modules: { toolbar: '#toolbar' },
      placeholder: 'Write the issue…'
    });
    quill.on('text-change', updatePreview);
  }

  async function load(id) {
    const issues = await db.list('digest_issues');
    const i = issues.find(x => x.id === id);
    if (!i) return;
    document.querySelector('#d-num').value = i.number || '';
    document.querySelector('#d-title').value = i.title || '';
    document.querySelector('#d-dek').value = i.dek || '';
    document.querySelector('#d-author').value = i.author || '';
    document.querySelector('#d-status').value = i.status || 'draft';
    document.querySelector('#d-date').value = dtLocal(i.published_at || Date.now());
    if (quill) quill.root.innerHTML = i.body_html || '';
    updatePreview();
  }

  function updatePreview() {
    document.querySelector('#prev-h').textContent = document.querySelector('#d-title').value || 'Untitled';
    document.querySelector('#prev-d').textContent = document.querySelector('#d-dek').value || '';
    document.querySelector('#prev-b').innerHTML = quill ? quill.root.innerHTML : '';
  }

  async function save(status) {
    const v = (s) => document.querySelector(s).value;
    const dt = v('#d-date');
    const patch = {
      number: parseInt(v('#d-num'),10) || 1,
      title: v('#d-title'),
      dek: v('#d-dek'),
      author: v('#d-author'),
      status: status,
      published_at: dt ? new Date(dt).getTime() : Date.now(),
      body_html: quill ? quill.root.innerHTML : ''
    };
    await db.update('digest_issues', activeId, patch);
    toast(status === 'published' ? 'Published →' : 'Draft saved');
  }

  async function createNew() {
    const issues = await db.list('digest_issues', { sortBy: 'number', desc: true });
    const nextNum = (issues[0] ? issues[0].number : 0) + 1;
    const r = await db.insert('digest_issues', {
      number: nextNum, title: 'Untitled', dek: '', author: 'The Editors',
      published_at: Date.now(), status: 'draft', body_html: '<p>Start typing…</p>'
    });
    activeId = r.id;
    toast('Draft created');
    render(document.querySelector('section[data-id="digest"]'),
      (t,s) => `<div class="pane-head"><div><h2>${t}</h2><div class="sub">${s||''}</div></div></div>`);
  }

  function dtLocal(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  window.renderDigestEditor = render;
})();
