// Petites fonctions utilitaires partagées par tous les jeux.

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sample = (list, n) => shuffle(list).slice(0, n);

/**
 * Construit une question à choix multiples : mélange la bonne réponse
 * avec les mauvaises et retient sa position.
 */
export function mcq(prompt, correct, wrongs, extra = {}) {
  const answers = shuffle([correct, ...wrongs]);
  return { prompt, answers, correct: answers.indexOf(correct), ...extra };
}

/** Appel JSONP (l'API Deezer n'autorise pas les appels fetch depuis un autre site). */
export function jsonp(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const cb = `__jsonp_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const script = document.createElement('script');
    const timer = setTimeout(() => finish(new Error('Délai dépassé')), timeout);
    function finish(err, data) {
      clearTimeout(timer);
      delete window[cb];
      script.remove();
      err ? reject(err) : resolve(data);
    }
    window[cb] = (data) => finish(null, data);
    script.onerror = () => finish(new Error('Erreur réseau'));
    script.src = `${url}${url.includes('?') ? '&' : '?'}output=jsonp&callback=${cb}`;
    document.head.appendChild(script);
  });
}

export function preloadImage(src, timeout = 6000) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), timeout);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = src;
  });
}

export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(`mjt:${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(`mjt:${key}`, JSON.stringify(value)); } catch { /* stockage indisponible */ }
  },
};

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Normalise un texte pour comparer des mots-clés (« Vrai », « vrai ! » → « vrai »). */
export function normalize(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim();
}
