/* seed.js · first-run data so the site isn't empty on a fresh Supabase project.
   Only seeds when tables are empty — safe to run on every page load.          */

(function () {
  const SINGLETONS = ['site_settings', 'current_pick', 'current_pick_2', 'current_theme', 'next_theme'];
  async function need(key) {
    if (SINGLETONS.includes(key)) {
      const val = await db.get(key, null);
      return val === null;
    }
    const rows = await db.list(key);
    return rows.length === 0;
  }

  async function seed() {
    if (!window.db) return;

    // Site settings (singleton)
    if (await need('site_settings')) {
      await db.set('site_settings', {
        club_name: 'Club5to7',
        tagline: 'A film club based in Addis. We watch between five and seven.',
        accent: '#2E46C7',
        admin_password: 'cinema',
        socials: {
          instagram: '@club5to7',
          telegram: 't.me/club5to7',
          email: 'projection@club5to7.xyz'
        },
        about_video_url: '',
        about_body:
          "Club5to7 began in a cramped flat off Bole Road in late 2023, with three "
          + "friends, a borrowed projector, and a print of *Sembène*'s *Black Girl*. "
          + "We watch one film a month, together, between five and seven in the "
          + "evening — a softer hour, when the city is loud but distracted.\n\n"
          + "We are unfussy and unaffiliated. There are no critics here, only "
          + "people who like the dark."
      });
    }

    // Current pick (singleton)
    if (await need('current_pick')) {
      await db.set('current_pick', {
        title: 'Teza',
        director: 'Haile Gerima',
        year: 1985,
        country: 'Ethiopia / Germany',
        runtime: 140,
        note:
          "A homecoming that isn't. We're starting our 'Films of Return' theme "
          + "with Gerima because nobody has filmed the long walk back like he has — "
          + "to a country, a body, an unfinished sentence.",
        screening_date: 'Saturday 31 May · 17:00',
        venue: 'The flat, Kazanchis (DM for address)',
        poster_caption: 'TEZA · 1985 · poster placeholder'
      });
    }

    // Second film pick (singleton)
    if (await need('current_pick_2')) {
      await db.set('current_pick_2', {
        title: 'Yeelen',
        director: 'Souleymane Cissé',
        year: 1987,
        country: 'Mali',
        runtime: 105,
        note:
          "A son returns home to confront his sorcerer father — and everything "
          + "the land has held in silence. Cissé turns the Bambara landscape into "
          + "a living archive. One of the great films of the continent.",
        screening_date: 'Saturday 31 May · 17:00',
        venue: 'The flat, Kazanchis (DM for address)',
        poster_caption: 'YEELEN · 1987 · poster placeholder'
      });
    }

    // Current theme (singleton)
    if (await need('current_theme')) {
      await db.set('current_theme', {
        name: 'Films of Return',
        month: 'May 2026',
        blurb:
          "What happens when you go back. Not just to a place — to a person, an "
          + "era, a self you put away. Four weeks, four films, one slow argument "
          + "about whether anything can ever really be revisited.",
        accent_word: 'Return'
      });
    }

    // Next theme (singleton)
    if (await need('next_theme')) {
      await db.set('next_theme', {
        name: 'Loud Cities, Quiet Rooms',
        month: 'June 2026',
        reveal_at: Date.now() + 1000 * 60 * 60 * 24 * 6,
        teaser: 'Six films about being alone with the windows open.'
      });
    }

    // Hot takes
    if (await need('hot_takes')) {
      const seeds = [
        { author: 'rahel.k', title: 'Letterboxd ruined how we talk about films',
          body: "Five-word reviews are a vibe but they've also flattened criticism into stand-up. I miss when people just liked things in long sentences.",
          pinned: true, approved: true, votes: 42 },
        { author: 'mikael.t', title: 'Teza is the best Ethiopian film, full stop',
          body: "Fight me in the projection room. The dream sequence at 1:12:30 alone is a master class in how to film a man losing the thread.",
          pinned: false, approved: true, votes: 31 },
        { author: 'sara.b', title: 'A film should not be longer than 110 minutes',
          body: "There. I said it. If you can't make your point in under two hours you don't have one. (Yes I know about Tarr. No I haven't watched it.)",
          pinned: false, approved: true, votes: 18 },
        { author: 'dawit.g', title: 'The Cinema Empire popcorn is overpriced and I will keep buying it',
          body: "It tastes like a 1996 Saturday afternoon and 1996 was a great year. Worth every birr.",
          pinned: false, approved: true, votes: 12 },
        { author: 'newcomer', title: 'Is Wes Anderson a director or a Pinterest board',
          body: "Asking for a friend who fell asleep during Asteroid City.",
          pinned: false, approved: false, votes: 7 }
      ];
      for (const s of seeds) await db.insert('hot_takes', s);
    }

    // Theme requests
    if (await need('theme_requests')) {
      const seeds = [
        { theme: 'Films set in trains', why: 'Trains do the editing for you — every cut justified by a window.', by: 'mikael.t', status: 'pending', votes: 14 },
        { theme: 'East African new wave: 2010-now', why: 'We keep watching 70s/80s. Time to honour the people working now.', by: 'sara.b', status: 'pending', votes: 22 },
        { theme: 'One-room movies', why: 'Single location = pure cinema. Rope, Locke, Buried, 12 Angry Men.', by: 'rahel.k', status: 'queued', votes: 31 },
        { theme: 'Movies your mom would hate', why: 'Self-explanatory.', by: 'dawit.g', status: 'pending', votes: 9 }
      ];
      for (const s of seeds) await db.insert('theme_requests', s);
    }

    // Digest issues
    if (await need('digest_issues')) {
      await db.insert('digest_issues', {
        number: 7,
        title: 'On Returning, And Whether You Can',
        dek: "Notes from the May screening of Teza, plus three short films you can watch tonight on the unstable internet.",
        author: 'The Editors',
        published_at: Date.now() - 1000 * 60 * 60 * 24 * 3,
        status: 'published',
        body_html:
          `<p class="lede">There is a moment, near the end of Haile Gerima's <em>Teza</em>, when Anberber stares at the ceiling of his mother's house and you realise the film has been about ceilings the entire time. Ceilings as the lid you can't lift. Ceilings as the sky in a room.</p>
          <p>We watched it on Saturday in a flat in Kazanchis that had, providentially, a low ceiling. Twelve of us, three folding chairs, the rest on cushions. We started at 17:04. We finished at 19:24. Nobody got up.</p>
          <h3>What we talked about, after</h3>
          <p>The conversation, as conversations do, started with the literal — the violence, the Derg, the German interlude, the brother — and slowly drifted into the personal. Three people present have lived abroad. One had just come back. Two had never left. The film was a different film for each of them, and we said so out loud, and the room got quieter.</p>
          <blockquote>"He doesn't return. He's just there again." — Mikael, on the third coffee.</blockquote>
          <h3>Three films to watch this fortnight</h3>
          <p><strong>1. Difret</strong> (2014, Mehari) — A courtroom film about telef, the marriage-by-abduction tradition, that refuses to be a courtroom film. Streams free on certain VPNs.</p>
          <p><strong>2. Le franc</strong> (1994, Mambéty) — Forty-five minutes. The story of a man, a lottery ticket, and a door he cannot remove from his back.</p>
          <p><strong>3. Drifting Flowers</strong> (2008, Zero Chou) — Has nothing to do with our theme. Watch it anyway.</p>
          <h3>Housekeeping</h3>
          <p>June's theme is being voted on now. The vote closes Friday. The poll is in the Theme Requests page. We will see you on the 14th for an unannounced film. The reveal is the point.</p>`
      });
      await db.insert('digest_issues', {
        number: 6,
        title: 'The Long Take Is Not A Personality',
        dek: "A polite argument with Lav Diaz, and a list of films under 80 minutes.",
        author: 'The Editors',
        published_at: Date.now() - 1000 * 60 * 60 * 24 * 17,
        status: 'published',
        body_html: `<p>Issue six was about brevity. It was, intentionally, very short. Read it in the archive.</p>`
      });
      await db.insert('digest_issues', {
        number: 8,
        title: 'Untitled (Draft)',
        dek: '',
        author: 'The Editors',
        published_at: 0,
        status: 'draft',
        body_html: '<p>Working notes for issue 8…</p>'
      });
    }

    // Movie picker pool
    if (await need('film_pool')) {
      const films = [
        'Teza (1985)','Daughters of the Dust (1991)','Yeelen (1987)','Touki Bouki (1973)',
        'Hyenas (1992)','Soleil Ô (1970)','Sambizanga (1972)','Black Girl (1966)',
        'Difret (2014)','Mooladé (2004)','Faat Kiné (2001)','Lamb (2015)'
      ];
      for (const t of films) await db.insert('film_pool', { title: t, in_rotation: true });
    }

    // Events / RSVP
    if (await need('events')) {
      await db.insert('events', {
        title: 'Teza · May screening',
        date_iso: '2026-05-31T17:00',
        date_label: 'Saturday 31 May · 17:00–19:30',
        venue: 'The flat, Kazanchis',
        capacity: 18,
        description:
          "Haile Gerima's Teza, 35mm digital. Coffee from the round pot, popcorn from the square pan. Discussion follows. Doors at quarter to five. No latecomers, the door creaks and ruins the opening.",
        cover_caption: 'TEZA · screening cover · placeholder',
        require_payment: false,
        price_birr: 150
      });
    }
    if (await need('rsvps')) {
      const evs = await db.list('events');
      if (evs[0]) {
        const handles = ['rahel.k','mikael.t','sara.b','dawit.g','liya.a',
                         'henok.b','meron.f','tigist.w','amanuel.k','naomi.r',
                         'yonas.t','beza.s'];
        for (const h of handles) {
          await db.insert('rsvps', { event_id: evs[0].id, handle: h, status: 'going' });
        }
      }
    }

    // Challenges
    if (await need('challenges')) {
      const c1 = await db.insert('challenges', {
        title: 'May Sembène',
        description: "Watch five films directed by Ousmane Sembène. Log them as you go. Bonus points for Mandabi.",
        target: 5,
        base_points: 160,
        per_film: 10,
        bonus: 30,
        bonus_film: 'Mandabi (1968)',
        active: true,
        ends_label: 'Closes 31 May'
      });
      await db.insert('challenges', {
        title: '70-Minute Marathon',
        description: "Watch four films that are 80 minutes or shorter. The shorter the braver.",
        target: 4,
        base_points: 160,
        per_film: 10,
        bonus: 30,
        bonus_film: "L'Atalante (1934) under 90min cut",
        active: true,
        ends_label: 'Closes 14 June'
      });
      if (c1) {
        const entries = [
          { challenge_id: c1.id, member: 'rahel.k',  films_watched: 5, bonus_hit: true },
          { challenge_id: c1.id, member: 'mikael.t', films_watched: 4, bonus_hit: false },
          { challenge_id: c1.id, member: 'sara.b',   films_watched: 3, bonus_hit: true },
          { challenge_id: c1.id, member: 'dawit.g',  films_watched: 2, bonus_hit: false }
        ];
        for (const e of entries) await db.insert('challenge_log', e);
      }
    }

    // Ping pong scores
    if (await need('pong_scores')) {
      const seeds = [
        { handle: 'mikael.t', score: 11, opponent_score: 7 },
        { handle: 'rahel.k',  score: 11, opponent_score: 9 },
        { handle: 'sara.b',   score: 11, opponent_score: 4 },
        { handle: 'dawit.g',  score: 11, opponent_score: 10 }
      ];
      for (const s of seeds) await db.insert('pong_scores', s);
    }

    // Members
    if (await need('members')) {
      const seeds = [
        { handle: 'rahel.k',  name: 'Rahel K.',     joined: '2024-02', status: 'active',  role: 'member' },
        { handle: 'mikael.t', name: 'Mikael T.',     joined: '2024-02', status: 'active',  role: 'curator' },
        { handle: 'sara.b',   name: 'Sara B.',       joined: '2024-04', status: 'active',  role: 'member' },
        { handle: 'dawit.g',  name: 'Dawit G.',      joined: '2024-07', status: 'active',  role: 'member' },
        { handle: 'liya.a',   name: 'Liya A.',       joined: '2025-01', status: 'active',  role: 'member' },
        { handle: 'newcomer', name: 'Pending Tola',  joined: '2026-05', status: 'pending', role: 'member' }
      ];
      for (const s of seeds) await db.insert('members', s);
    }
  }

  if (window.db) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', seed);
    } else {
      seed();
    }
  }

  window.seed = { run: seed };
})();
