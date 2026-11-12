import { jsonp, shuffle, sample } from '../util.js';
import { initYouTube } from '../youtube.js';

// Listes toutes prêtes : extraits de 30 s fournis gratuitement par l'API publique Deezer.
const PRESETS = {
  top: { label: '🔥 Top du moment', chart: true },
  '80': { label: '🕺 Années 80', search: 'années 80' },
  '90': { label: '📼 Années 90', search: 'années 90' },
  '2000': { label: '💿 Années 2000', search: 'années 2000' },
  '2010': { label: '📱 Années 2010', search: 'hits 2010' },
  rapfr: { label: '🎤 Rap français', search: 'rap français' },
  variete: { label: '🇫🇷 Variété française', search: 'variété française' },
  disney: { label: '🏰 Disney', search: 'disney chansons' },
};

/** Reconnaît un lien de playlist (ou d'album) Deezer, Spotify ou YouTube. */
export function parseLink(link) {
  const s = String(link || '').trim();
  let m;
  if ((m = s.match(/deezer\.com\/(?:[a-z]{2}\/)?(playlist|album)\/(\d+)/))) return { platform: 'deezer', type: m[1], id: m[2] };
  if ((m = s.match(/spotify\.com\/(?:intl-[a-z]+\/)?(?:embed\/)?(playlist|album)\/([A-Za-z0-9]+)/) || s.match(/spotify:(playlist|album):([A-Za-z0-9]+)/))) {
    return { platform: 'spotify', type: m[1], id: m[2] };
  }
  if ((m = s.match(/(?:youtube\.com|youtu\.be)\/.*[?&]list=([\w-]+)/))) return { platform: 'youtube', id: m[1] };
  if (/link\.deezer\.com|deezer\.page\.link|spotify\.link|spoti\.fi/.test(s)) {
    throw new Error('C’est un lien raccourci : ouvre-le dans le navigateur, puis copie l’adresse complète de la page.');
  }
  throw new Error('Lien non reconnu. Colle le lien d’une playlist Deezer, Spotify ou YouTube.');
}

/* ---------- Deezer ---------- */

const fromDeezer = (t, album) => ({
  title: t.title_short || t.title,
  artist: t.artist?.name || '',
  cover: (t.album || album)?.cover_big || (t.album || album)?.cover_medium || '',
  media: { type: 'audio', src: t.preview },
  ok: !!t.preview,
});

async function deezerPreset(key) {
  if (key === 'top') {
    const res = await jsonp('https://api.deezer.com/chart/0/tracks?limit=100');
    return (res.data || []).map((t) => fromDeezer(t));
  }
  const res = await jsonp(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(PRESETS[key].search)}&limit=5`);
  const list = (res.data || []).find((p) => p.nb_tracks >= 20);
  if (!list) throw new Error('Aucune playlist trouvée sur Deezer.');
  return deezerLink({ type: 'playlist', id: list.id });
}

async function deezerLink({ type, id }) {
  if (type === 'album') {
    const album = await jsonp(`https://api.deezer.com/album/${id}`);
    if (album.error) throw new Error('Album Deezer introuvable.');
    return (album.tracks?.data || []).map((t) => fromDeezer(t, album));
  }
  const res = await jsonp(`https://api.deezer.com/playlist/${id}/tracks?limit=300`);
  if (res.error) throw new Error('Playlist Deezer introuvable ou privée.');
  return (res.data || []).map((t) => fromDeezer(t));
}

/* ---------- Spotify et YouTube (via la fonction serveur /api/playlist) ---------- */

async function api(params) {
  let res;
  try {
    res = await fetch(`/api/playlist?${new URLSearchParams(params)}`);
  } catch {
    throw new Error('Serveur injoignable.');
  }
  const data = await res.json().catch(() => null);
  if (!data) throw new Error('Les playlists Spotify et YouTube ne marchent qu’une fois le site en ligne sur Vercel.');
  if (data.error) throw new Error(data.error);
  return data;
}

async function spotifyLink({ type, id }) {
  const data = await api({ source: 'spotify', type, id });
  if (!data.tracks.length) throw new Error('Spotify ne fournit pas d’extraits pour cette playlist.');
  return data.tracks.map((t) => ({ title: t.title, artist: t.artist, cover: t.cover, spotifyId: t.id, media: { type: 'audio', src: t.preview }, ok: true }));
}

/** « Artiste - Titre (Clip officiel) ft. X » → { title, artist } propres. */
function cleanYouTube(raw, channel) {
  const t = raw
    .replace(/[([][^)\]]*(official|officiel|oficial|clip|video|vidéo|lyrics?|paroles|audio|visuali[sz]er|hd|4k|remaster|music|live)[^)\]]*[)\]]/gi, '')
    .replace(/\s(ft\.?|feat\.?|featuring)\s.*$/i, '')
    .replace(/\s*[|｜].*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  // On retire les morceaux qui ne sont que du remplissage (« VIDEO OFICIAL », « Clip officiel »…).
  const filler = /^(official|officiel|oficial|music|musique|video|vidéo|clip|lyrics?|paroles|audio|hd|4k|\s)+$/i;
  const parts = t.split(/\s[-–—]\s/).map((p) => p.trim()).filter((p) => p && !filler.test(p));
  if (!parts.length) return { artist: channel, title: raw.trim() };
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  const artist = channel.replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').replace(/\s+(officiel|official|oficial)$/i, '').trim();
  return { artist, title: parts[0] };
}

async function youtubeLink({ id }) {
  const [data] = await Promise.all([api({ source: 'youtube', id }), initYouTube()]);
  return data.videos.map((v) => ({
    ...cleanYouTube(v.rawTitle, v.channel),
    cover: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    media: { type: 'youtube', videoId: v.id, start: 40 },
    ok: true,
  }));
}

/** Pochette Spotify (l'embed de playlist ne la donne pas titre par titre). */
async function spotifyCover(track) {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${track.spotifyId}`);
    const data = await res.json();
    if (data.thumbnail_url) track.cover = data.thumbnail_url;
  } catch { /* on garde la pochette de la playlist */ }
}

/* ---------- Jeu ---------- */

const label = (t) => (t.artist ? `${t.title} — ${t.artist}` : t.title);

export default {
  id: 'blindtest',
  name: 'Blindtest',
  emoji: '🎵',
  description: 'Un extrait de musique : le chat devine le titre. Deezer, Spotify ou YouTube.',
  answersCount: 4,
  scored: true,
  options: [
    {
      id: 'source', label: 'Musiques', type: 'select', default: 'top',
      choices: [
        ...Object.entries(PRESETS).map(([value, s]) => ({ value, label: s.label })),
        { value: 'custom', label: '🔗 Ma playlist (Deezer, Spotify ou YouTube)' },
      ],
    },
    { id: 'playlist', label: 'Lien de ta playlist (si « Ma playlist »)', type: 'text', placeholder: 'Lien Deezer, Spotify ou YouTube' },
  ],
  async build({ count, options }) {
    let tracks;
    if (options.source === 'custom') {
      const link = parseLink(options.playlist);
      tracks = await ({ deezer: deezerLink, spotify: spotifyLink, youtube: youtubeLink })[link.platform](link);
    } else {
      tracks = await deezerPreset(PRESETS[options.source] ? options.source : 'top');
    }

    // Titres jouables, sans doublons.
    const seen = new Set();
    tracks = tracks.filter((t) => {
      const key = label(t).toLowerCase();
      if (!t.ok || !t.title || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (tracks.length < 4) throw new Error('Il faut au moins 4 titres jouables dans la playlist.');

    const picked = sample(tracks, Math.min(count, tracks.length));
    await Promise.all(picked.filter((t) => t.spotifyId).map(spotifyCover));

    return picked.map((t) => {
      // Mauvaises réponses : d'autres titres, si possible d'autres artistes.
      const others = shuffle(tracks.filter((o) => o !== t));
      const wrongs = [...others.filter((o) => o.artist !== t.artist), ...others]
        .filter((o, i, a) => a.indexOf(o) === i).slice(0, 3);
      const answers = shuffle([t, ...wrongs]);
      return {
        prompt: 'Quel est ce titre ? 🎧',
        media: t.media,
        answers: answers.map(label),
        correct: answers.indexOf(t),
        reveal: { image: t.cover, title: t.title, subtitle: t.artist },
      };
    });
  },
};
