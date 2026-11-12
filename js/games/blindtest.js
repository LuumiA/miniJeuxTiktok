import { jsonp, shuffle, sample } from '../util.js';

// Extraits de 30 s fournis gratuitement par l'API publique Deezer.
const SOURCES = {
  top: { label: '🔥 Top du moment', chart: true },
  '80': { label: '🕺 Années 80', search: 'années 80' },
  '90': { label: '📼 Années 90', search: 'années 90' },
  '2000': { label: '💿 Années 2000', search: 'années 2000' },
  '2010': { label: '📱 Années 2010', search: 'hits 2010' },
  rapfr: { label: '🎤 Rap français', search: 'rap français' },
  variete: { label: '🇫🇷 Variété française', search: 'variété française' },
  disney: { label: '🏰 Disney', search: 'disney chansons' },
  custom: { label: '🔗 Ma playlist Deezer (lien ci-dessous)' },
};

async function fetchTracks(source, playlistLink) {
  let tracks = [];
  if (source === 'top') {
    const res = await jsonp('https://api.deezer.com/chart/0/tracks?limit=100');
    tracks = res.data || [];
  } else {
    let playlistId;
    if (source === 'custom') {
      const m = String(playlistLink || '').match(/playlist\/(\d+)/) || String(playlistLink || '').match(/^\s*(\d+)\s*$/);
      if (!m) throw new Error('Colle le lien d’une playlist Deezer (ex. https://www.deezer.com/fr/playlist/123456).');
      playlistId = m[1];
    } else {
      const res = await jsonp(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(SOURCES[source].search)}&limit=5`);
      const lists = (res.data || []).filter((p) => p.nb_tracks >= 20);
      if (!lists.length) throw new Error('Aucune playlist trouvée sur Deezer.');
      playlistId = lists[0].id;
    }
    const res = await jsonp(`https://api.deezer.com/playlist/${playlistId}/tracks?limit=300`);
    if (res.error) throw new Error('Playlist Deezer introuvable ou privée.');
    tracks = res.data || [];
  }
  // On garde les titres avec un extrait audio, sans doublons.
  const seen = new Set();
  return tracks.filter((t) => {
    const key = (t.title_short || t.title || '').toLowerCase();
    if (!t.preview || !key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const label = (t) => `${t.title_short || t.title} — ${t.artist?.name ?? ''}`;

export default {
  id: 'blindtest',
  name: 'Blindtest',
  emoji: '🎵',
  description: 'Un extrait de musique : le chat devine le titre.',
  answersCount: 4,
  scored: true,
  options: [
    { id: 'source', label: 'Musiques', type: 'select', default: 'top', choices: Object.entries(SOURCES).map(([value, s]) => ({ value, label: s.label })) },
    { id: 'playlist', label: 'Lien de playlist Deezer (si « Ma playlist »)', type: 'text', placeholder: 'https://www.deezer.com/fr/playlist/…' },
  ],
  async build({ count, options }) {
    const tracks = await fetchTracks(options.source || 'top', options.playlist);
    if (tracks.length < 4) throw new Error('Pas assez de titres avec extrait dans cette playlist.');
    const picked = sample(tracks, Math.min(count, tracks.length));
    return picked.map((t) => {
      // Mauvaises réponses : d'autres titres, si possible d'autres artistes.
      const others = shuffle(tracks.filter((o) => o !== t));
      const wrongs = [...others.filter((o) => o.artist?.name !== t.artist?.name), ...others].filter((o, i, a) => a.indexOf(o) === i).slice(0, 3);
      const answers = shuffle([t, ...wrongs]);
      return {
        prompt: 'Quel est ce titre ? 🎧',
        media: { type: 'audio', src: t.preview },
        answers: answers.map(label),
        correct: answers.indexOf(t),
        reveal: { image: t.album?.cover_big || t.album?.cover_medium, title: t.title_short || t.title, subtitle: t.artist?.name },
      };
    });
  },
};
