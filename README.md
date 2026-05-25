# club5to7 / public prototype

A working hi-fi prototype of **club5to7.xyz** — a film club site for Addis Ababa.

Vanilla HTML + CSS + JavaScript, no build step, no framework. Storage today is
`localStorage`; when the codebase is wired to Supabase, swap the body of each
`db.*` method in `js/db.js` for the equivalent supabase-js call and the rest
of the site keeps working.

## Run it

```
# any static server — examples:
npx serve .
# or
python3 -m http.server
```

Open `index.html`. To enter the CMS go to `/admin.html`. The demo password
is `cinema` (editable in Site Settings).

## Pages

| Page                | File              | What it does                                   |
| ------------------- | ----------------- | ---------------------------------------------- |
| Now Showing         | `index.html`      | Hero + theme + next-theme countdown            |
| Hot Takes           | `hot-takes.html`  | Opinion cards, voting, member submission       |
| Theme Requests      | `theme-request.html` | Nominate + vote on next month's theme       |
| The Digest          | `digest.html`     | Biweekly editorial, archive sidebar            |
| Movie Picker        | `picker.html`     | Radial wheel · admin manages the pool          |
| RSVP                | `rsvp.html`       | Live capacity bar, attendee list               |
| Challenges          | `challenges.html` | 160 / 10 / 30 scoring, leaderboard             |
| Ping Pong           | `ping-pong.html`  | Playable mini-game vs AI                       |
| About               | `about.html`      | Club ethos                                     |
| Admin / CMS         | `admin.html`      | Manages everything above                       |

## Architecture

```
index.html               ← page shells (1 per route)
…
css/
  tokens.css             ← design tokens · single source of truth
  base.css               ← reset, type, buttons, cards, inputs
  sidebar.css            ← filmstrip sidebar (vertical)
  home.css …             ← per-page CSS
js/
  db.js                  ← Supabase-shaped storage seam
  auth.js                ← session helper (sessionStorage)
  theme.js               ← light/dark toggle
  seed.js                ← first-run sample data (idempotent)
  shell.js               ← injects sidebar, runs toast/modals
  utils.js               ← escapeHtml / timeAgo / formatDate
  home.js …              ← per-page logic
  admin.js               ← CMS router + section renderers
  admin-digest.js        ← Quill WYSIWYG editor for The Digest
```

## Swapping in Supabase

Every database read/write goes through `db.list / .insert / .update / .remove / .get / .set`.
A developer can replace each method body with the equivalent supabase-js call.
Table names stay the same.

```js
async list(table, opts) {
  let q = supabase.from(table).select('*');
  if (opts.where) Object.entries(opts.where).forEach(([k,v]) => q = q.eq(k,v));
  if (opts.sortBy) q = q.order(opts.sortBy, { ascending: !opts.desc });
  const { data } = await q;
  return data || [];
}
```

For realtime (chatroom, RSVPs, etc.), `db.subscribe(table, cb)` is the seam —
swap the body for `supabase.channel('...').on('postgres_changes', ...)`.

`auth.js` becomes `supabase.auth` — the public API (`current`, `isAdmin`,
`signOut`) maps 1-to-1.

## Chapa payments

The feature flag is in **Site Settings → Feature flags → Chapa payments**.
RSVP code checks `event.require_payment && settings.chapa_enabled` before
rendering a checkout button. The checkout call site is `js/rsvp.js`. Today
it's a comment block — a developer drops Chapa's hosted checkout redirect
in there and the rest of the flow works.

## .env

Stub values live in `.env.example`. The prototype reads nothing from `.env`
(no build step), but the file is here so the eventual developer doesn't
have to invent the variable names.

## What this prototype is *not*

- Not deployed (your sandbox · take the code to GitHub yourself)
- Not real auth (sessionStorage handle picker · swap for Supabase)
- Not real payments (Chapa is wired UI-side only)
- Not real realtime (event-based updates · swap for Supabase channels)
- Illustrations are typeset placeholders; commission real art later

## Reset

In the admin Dashboard → **Reset demo data** wipes localStorage and re-seeds.
