/* rsvp.js */

(async function () {
  await new Promise(r => setTimeout(r, 50));

  async function render() {
    const events = await db.list('events', { sortBy: 'created_at', desc: true });
    const evt = events[0];
    if (!evt) return;

    document.querySelector('#ev-title').textContent = evt.title;
    document.querySelector('#ev-date').textContent = evt.date_label;
    document.querySelector('#ev-venue').textContent = evt.venue;
    document.querySelector('#ev-cap-label').textContent = evt.capacity;
    document.querySelector('#ev-desc').textContent = evt.description;
    document.querySelector('#cover-title').textContent = (evt.title.split('·')[0] || evt.title).trim().toUpperCase();
    document.querySelector('#cover-date').textContent = evt.date_label;

    const all = await db.list('rsvps', { where: { event_id: evt.id } });
    const session = auth.current();
    const youGoing = session ? all.find(r => r.handle === session.handle && r.status === 'going') : null;
    const going = all.filter(r => r.status === 'going');

    // Seat bar
    const bar = document.querySelector('#cap-bar');
    bar.innerHTML = '';
    for (let i = 0; i < evt.capacity; i++) {
      const cls = i < going.length ? (youGoing && i === going.findIndex(r => r.handle === session.handle) ? 'taken you' : 'taken') : '';
      bar.innerHTML += `<div class="seat ${cls}"></div>`;
    }

    document.querySelector('#cap-taken').textContent = going.length;
    document.querySelector('#cap-total').textContent = evt.capacity;
    document.querySelector('#cap-remaining').textContent = Math.max(0, evt.capacity - going.length);

    // Attendees
    document.querySelector('#attendees').innerHTML = going.map(r => `
      <span class="attendee ${session && r.handle === session.handle ? 'you' : ''}">@${escapeHtml(r.handle)}</span>
    `).join('');

    // CTA
    const cta = document.querySelector('#rsvp-cta');
    if (!session) {
      cta.innerHTML = `<button class="btn primary" onclick="window.openSignIn()">Sign in to RSVP</button>
                      <span class="muted" style="font-size:13px;margin-left:auto">${going.length} of ${evt.capacity} seats taken</span>`;
    } else if (youGoing) {
      cta.innerHTML = `<button class="btn" id="cancel-rsvp">Cancel RSVP</button>
                      <span class="muted" style="font-size:13px;margin-left:auto">You're on the list, @${session.handle}</span>`;
      document.querySelector('#cancel-rsvp').addEventListener('click', async () => {
        await db.remove('rsvps', youGoing.id);
        toast('RSVP cancelled');
        render();
      });
    } else if (going.length >= evt.capacity) {
      cta.innerHTML = `<button class="btn" disabled>Full · join waitlist</button>
                      <button class="btn ghost" id="waitlist">Join waitlist</button>`;
      document.querySelector('#waitlist').addEventListener('click', async () => {
        await db.insert('rsvps', { event_id: evt.id, handle: session.handle, status: 'waitlist' });
        toast('On the waitlist');
        render();
      });
    } else {
      cta.innerHTML = `<button class="btn primary" id="do-rsvp">RSVP — hold my seat →</button>
                      <span class="muted" style="font-size:13px;margin-left:auto">${evt.capacity - going.length} seats left</span>`;
      document.querySelector('#do-rsvp').addEventListener('click', async () => {
        await db.insert('rsvps', { event_id: evt.id, handle: session.handle, status: 'going' });
        toast(`You're in. See you Saturday.`);
        render();
      });
    }

    // Payment note
    const pay = document.querySelector('#pay');
    if (evt.require_payment) {
      pay.innerHTML = `<strong>Payment required · ${evt.price_birr} birr.</strong> Chapa checkout would appear here. Toggle off in admin to hide.`;
      pay.style.display = '';
    } else {
      pay.innerHTML = `<strong>Payment is wired but disabled</strong> for this event. Admin can flip it on in Settings → Payments. We use Chapa for birr-denominated checkout.`;
    }
  }

  render();
  window.addEventListener('db:change', e => { if (['rsvps','events'].includes(e.detail.table)) render(); });
  window.addEventListener('auth:change', render);
})();
