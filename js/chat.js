// Connexion au chat TikTok via Euler Stream (WebSocket), et mode démo avec des faux viewers.
//
// Format attendu (JSON) : { messages: [ { type: 'WebcastChatMessage', data: { comment, user: {...} } } ] }
// Le décodage est volontairement tolérant : plusieurs variantes de noms de champs sont acceptées.

const CLOSE_REASONS = {
  4005: 'Le live est terminé.',
  4006: 'Aucun message reçu depuis un moment.',
  4400: 'Pseudo ou clé invalide.',
  4401: 'Clé API refusée.',
  4403: "Ta clé n'a pas accès à ce compte.",
  4404: "Ce compte n'est pas en live.",
  4429: 'Trop de connexions : attends une minute.',
  4500: 'TikTok a coupé la connexion.',
  4555: 'Durée maximale de connexion atteinte (8 h).',
};
const FATAL = new Set([4400, 4401, 4403, 4404]);

function firstUrl(pic) {
  if (!pic) return '';
  if (typeof pic === 'string') return pic;
  const list = pic.url || pic.urls || pic.urlList || pic.url_list;
  if (Array.isArray(list)) return list[0] || '';
  if (typeof list === 'string') return list;
  return '';
}

export function parseChatMessage(m) {
  if (!m || typeof m !== 'object') return null;
  const type = String(m.type || m.event || m.method || '');
  if (type && !/chat/i.test(type)) return null;
  const d = m.data || m;
  const text = d.comment ?? d.content ?? d.text;
  if (typeof text !== 'string') return null;
  const u = d.user || d.author || {};
  const uniqueId = u.uniqueId || u.unique_id || u.displayId || u.username || d.uniqueId || u.userId || u.id || '';
  if (!uniqueId) return null;
  return {
    uniqueId: String(uniqueId),
    nickname: u.nickname || u.nickName || d.nickname || String(uniqueId),
    avatar: firstUrl(u.profilePicture) || firstUrl(u.avatarThumb) || firstUrl(u.avatar_thumb) || u.profilePictureUrl || d.profilePictureUrl || '',
    text,
  };
}

export class EulerChat {
  constructor({ onMessage, onStatus, onRaw }) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    this.onRaw = onRaw;
    this.ws = null;
    this.stopped = true;
    this.retries = 0;
  }

  connect(uniqueId, key) {
    this.disconnect();
    this.stopped = false;
    const user = uniqueId.trim().replace(/^@/, '');
    // Une clé qui ressemble à un JWT (eyJ…x.y.z) est envoyée en jwtKey, sinon en apiKey.
    const isJwt = /^eyJ[\w-]*\.[\w-]+\.[\w-]+$/.test(key.trim());
    this.url = `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(user)}&${isJwt ? 'jwtKey' : 'apiKey'}=${encodeURIComponent(key.trim())}`;
    this._open();
  }

  _open() {
    this.onStatus('connecting', 'Connexion au chat…');
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => {
      this.retries = 0;
      this.onStatus('connected', 'Connecté au chat');
    };
    ws.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }
      const list = Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : [data];
      for (const m of list) {
        this.onRaw?.(m);
        const chat = parseChatMessage(m);
        if (chat) this.onMessage(chat);
      }
    };
    ws.onclose = (e) => {
      if (this.ws !== ws || this.stopped) return;
      const reason = CLOSE_REASONS[e.code] || `Connexion fermée (code ${e.code}).`;
      if (FATAL.has(e.code) || this.retries >= 5) {
        this.stopped = true;
        this.onStatus('error', reason);
        return;
      }
      this.retries++;
      const delay = Math.min(30000, 2000 * 2 ** (this.retries - 1));
      this.onStatus('connecting', `${reason} Nouvelle tentative dans ${Math.round(delay / 1000)} s…`);
      this.retryTimer = setTimeout(() => this._open(), delay);
    };
  }

  disconnect() {
    this.stopped = true;
    clearTimeout(this.retryTimer);
    if (this.ws) {
      const ws = this.ws;
      this.ws = null;
      try { ws.close(1000); } catch { /* déjà fermé */ }
    }
    this.onStatus('off', 'Chat non connecté');
  }
}

const BOT_NAMES = ['Lina', 'Yanis', 'Chloé', 'Mehdi', 'Inès', 'Lucas', 'Sarah', 'Noah', 'Jade', 'Adam', 'Léa', 'Rayan',
  'Manon', 'Hugo', 'Camille', 'Nathan', 'Emma', 'Théo', 'Zoé', 'Sofiane', 'Louise', 'Enzo', 'Maëlys', 'Ilyes', 'Anaïs',
  'Tom', 'Nour', 'Mathis', 'Clara', 'Amine'];

/** Faux viewers pour tester un jeu sans être en live. */
export class DemoChat {
  constructor(onMessage) {
    this.onMessage = onMessage;
    this.bots = BOT_NAMES.map((n, i) => ({ uniqueId: `demo_${i}`, nickname: n, avatar: '', skill: 0.25 + Math.random() * 0.6 }));
  }

  /** Lance une vague de votes pour une question (answersCount réponses, bonne réponse = correct). */
  startQuestion(answersCount, correct, durationMs) {
    this.stop();
    const voters = this.bots.filter(() => Math.random() < 0.75);
    this.timers = voters.map((bot) => setTimeout(() => {
      let choice;
      if (correct !== null && Math.random() < bot.skill) choice = correct;
      else choice = Math.floor(Math.random() * answersCount);
      this.onMessage({ ...bot, text: String(choice + 1) });
    }, 600 + Math.random() * durationMs * 0.85));
  }

  stop() {
    (this.timers || []).forEach(clearTimeout);
    this.timers = [];
  }
}
