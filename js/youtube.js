// Lecteur YouTube invisible pour le blindtest (la vidéo est cachée derrière le site, seul le son compte).

let player = null;
let readyPromise = null;
let errorHandler = null;

export function onYouTubeError(fn) { errorHandler = fn; }

export function initYouTube() {
  if (readyPromise) return readyPromise;
  readyPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Le lecteur YouTube ne se charge pas.')), 15000);
    window.onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player('yt-player', {
        width: 200,
        height: 200,
        playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, fs: 0, iv_load_policy: 3 },
        events: {
          onReady: () => { clearTimeout(timer); resolve(); },
          // 100 : vidéo supprimée, 101/150 : lecture interdite hors de YouTube.
          onError: (e) => errorHandler?.(e.data),
        },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { clearTimeout(timer); reject(new Error('YouTube est inaccessible.')); };
    document.head.appendChild(s);
  });
  readyPromise.catch(() => { readyPromise = null; });
  return readyPromise;
}

export async function ytPlay(videoId, start = 40) {
  await initYouTube();
  player.unMute();
  player.setVolume(100);
  player.loadVideoById({ videoId, startSeconds: start });
}
export const ytPause = () => player?.pauseVideo?.();
export const ytResume = () => player?.playVideo?.();
export const ytStop = () => player?.stopVideo?.();
