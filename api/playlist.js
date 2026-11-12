// Fonction Vercel : lit une playlist Spotify ou YouTube publique et renvoie la liste des titres.
// Elle tourne sur le serveur parce que le navigateur n'a pas le droit de lire ces pages directement.
// Aucune clé n'est nécessaire.
//
//   GET /api/playlist?source=spotify&type=playlist&id=37i9dQZF1DXcBWIGoYBM5M
//   GET /api/playlist?source=youtube&id=PLxxxxxxxx

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

async function spotify(type, id) {
  const res = await fetch(`https://open.spotify.com/embed/${type}/${id}`, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error('Playlist Spotify introuvable.');
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Spotify a changé sa page : impossible de lire la playlist.');
  const entity = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity;
  if (!entity?.trackList) throw new Error('Playlist Spotify vide ou privée.');
  const cover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || '';
  return {
    name: entity.name || entity.title || '',
    tracks: entity.trackList
      .filter((t) => t.audioPreview?.url)
      .map((t) => ({
        id: String(t.uri || '').split(':').pop(),
        title: t.title,
        artist: t.subtitle,
        preview: t.audioPreview.url,
        cover,
      })),
  };
}

async function youtube(id) {
  const res = await fetch(`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}&hl=fr`, {
    // Les cookies évitent la page de consentement européenne.
    headers: { 'user-agent': UA, 'accept-language': 'fr-FR,fr;q=0.9', cookie: 'CONSENT=YES+1; SOCS=CAI' },
  });
  if (!res.ok) throw new Error('Playlist YouTube introuvable.');
  const html = await res.text();
  const m = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
  if (!m) throw new Error('Playlist YouTube introuvable ou privée.');
  const videos = [];
  let name = '';
  JSON.parse(m[1], (key, v) => {
    if (key === 'lockupViewModel' && v?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
      const md = v.metadata?.lockupMetadataViewModel;
      videos.push({
        id: v.contentId,
        rawTitle: md?.title?.content || '',
        channel: md?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || '',
      });
    } else if (key === 'playlistVideoRenderer' && v?.videoId) {
      // Ancien format de page, gardé au cas où.
      videos.push({ id: v.videoId, rawTitle: v.title?.runs?.[0]?.text || '', channel: v.shortBylineText?.runs?.[0]?.text || '' });
    } else if (key === 'playlistMetadataRenderer' && v?.title) {
      name = v.title;
    }
    return v;
  });
  const seen = new Set();
  return { name, videos: videos.filter((v) => v.id && !seen.has(v.id) && seen.add(v.id)) };
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const source = url.searchParams.get('source');
  const id = url.searchParams.get('id') || '';
  const type = url.searchParams.get('type') === 'album' ? 'album' : 'playlist';
  res.setHeader('content-type', 'application/json; charset=utf-8');
  try {
    if (!/^[\w-]{5,80}$/.test(id)) throw new Error('Lien de playlist invalide.');
    let data;
    if (source === 'spotify') data = await spotify(type, id);
    else if (source === 'youtube') data = await youtube(id);
    else throw new Error('Source inconnue.');
    res.setHeader('cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (e) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: e.message || 'Erreur' }));
  }
}
