import { EulerChat, DemoChat } from './chat.js';
import { store, escapeHtml, normalize } from './util.js';
import { ytPlay, ytPause, ytResume, ytStop, onYouTubeError } from './youtube.js';
import blindtest from './games/blindtest.js';
import quiz from './games/quiz.js';
import drapeaux from './games/drapeaux.js';
import emojis from './games/emojis.js';
import vraifaux from './games/vraifaux.js';
import sondage from './games/sondage.js';

// Pour ajouter un jeu : créer un fichier dans js/games/ sur le même modèle, puis l'ajouter ici.
const GAMES = [blindtest, quiz, drapeaux, emojis, vraifaux, sondage];

const $ = (s) => document.querySelector(s);
const audio = $('#audio');
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
const REVEAL_MS = 5500;
const BOARD_MS = 4500;

function show(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
  window.scrollTo(0, 0);
}
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) show(go.dataset.go);
});

/* ---------------- Avatars ---------------- */

function hue(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
function initialHtml(p, cls) {
  const letter = escapeHtml((p.nickname || '?').trim().charAt(0).toUpperCase() || '?');
  return `<span class="av ${cls}" style="--h:${hue(p.uniqueId)}">${letter}</span>`;
}
function avatarHtml(p, cls = '') {
  if (p.avatar && /^https:\/\//.test(p.avatar)) {
    return `<img class="av ${cls}" src="${escapeHtml(p.avatar)}" alt="" referrerpolicy="no-referrer" loading="lazy"
      data-nick="${escapeHtml(p.nickname)}" data-uid="${escapeHtml(p.uniqueId)}">`;
  }
  return initialHtml(p, cls);
}
// Photo de profil qui ne charge pas → initiale colorée.
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.classList.contains('av')) {
    const cls = [...img.classList].filter((c) => c !== 'av').join(' ');
    img.outerHTML = initialHtml({ nickname: img.dataset.nick, uniqueId: img.dataset.uid }, cls);
  }
}, true);

/* ---------------- Chat ---------------- */

let chatStatus = 'off';
let chatUser = '';
const chat = new EulerChat({ onMessage: handleChat, onStatus: setChatStatus });
const demo = new DemoChat(handleChat);

function setChatStatus(status, text) {
  chatStatus = status;
  $('#chat-panel summary .dot').dataset.status = status;
  $('#chat-status').textContent = text;
  $('#chat-summary').textContent = status === 'connected' ? `Chat connecté : @${chatUser}` : 'Connexion au chat TikTok';
  updateGameDot();
}

function updateGameDot() {
  $('#g-dot').dataset.status = chatStatus === 'off' && G.demo ? 'demo' : chatStatus;
}

function handleChat(msg) {
  if (!msg.uniqueId.startsWith('demo_')) {
    const log = $('#chat-log');
    const line = document.createElement('div');
    line.textContent = `${msg.nickname} : ${msg.text}`;
    log.prepend(line);
    while (log.children.length > 8) log.lastChild.remove();
  }
  if (G.phase === 'question') processVote(msg);
}

$('#tiktok-user').value = store.get('user', '');
$('#euler-key').value = store.get('key', '');
$('#btn-connect').addEventListener('click', () => {
  const user = $('#tiktok-user').value.trim().replace(/^@/, '');
  const key = $('#euler-key').value.trim();
  if (!user || !key) { setChatStatus('error', 'Remplis ton pseudo et ta clé API.'); return; }
  store.set('user', user);
  store.set('key', key);
  chatUser = user;
  chat.connect(user, key);
});
$('#btn-disconnect').addEventListener('click', () => chat.disconnect());

/* ---------------- Accueil et réglages ---------------- */

$('#game-list').innerHTML = GAMES.map((g) => `
  <button class="game-card" data-game="${g.id}">
    <span class="e">${g.emoji}</span><b>${escapeHtml(g.name)}</b><small>${escapeHtml(g.description)}</small>
  </button>`).join('');
$('#game-list').addEventListener('click', (e) => {
  const card = e.target.closest('[data-game]');
  if (card) openSetup(GAMES.find((g) => g.id === card.dataset.game));
});

let setupGame = null;

function openSetup(game) {
  setupGame = game;
  const saved = store.get(`opt:${game.id}`, {});
  $('#setup-title').textContent = `${game.emoji} ${game.name}`;
  $('#setup-desc').textContent = game.description;
  $('#setup-options').innerHTML = game.options.map((o) => {
    const val = saved[o.id] ?? o.default ?? '';
    if (o.type === 'select') {
      return `<label>${escapeHtml(o.label)}<select data-opt="${o.id}">${o.choices.map((c) =>
        `<option value="${escapeHtml(c.value)}" ${c.value === val ? 'selected' : ''}>${escapeHtml(c.label)}</option>`).join('')}</select></label>`;
    }
    if (o.type === 'textarea') {
      return `<label>${escapeHtml(o.label)}<textarea data-opt="${o.id}" placeholder="${escapeHtml(o.placeholder || '')}">${escapeHtml(val)}</textarea></label>`;
    }
    return `<label>${escapeHtml(o.label)}<input type="text" data-opt="${o.id}" value="${escapeHtml(val)}" placeholder="${escapeHtml(o.placeholder || '')}"></label>`;
  }).join('');
  $('#opt-count').value = String(store.get('count', 10));
  $('#opt-time').value = String(store.get('time', 20));
  $('#opt-demo').checked = store.get('demo', false);
  $('#setup-chat').innerHTML = chatStatus === 'connected'
    ? `✅ Chat connecté (@${escapeHtml(chatUser)})`
    : '⚠️ Chat non connecté : connecte-le depuis l’accueil, ou coche le mode démo pour tester.';
  $('#setup-error').hidden = true;
  show('setup');
}

$('#setup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const options = {};
  document.querySelectorAll('#setup-options [data-opt]').forEach((el) => { options[el.dataset.opt] = el.value; });
  const settings = {
    count: Number($('#opt-count').value),
    time: Number($('#opt-time').value),
    demo: $('#opt-demo').checked,
    options,
  };
  store.set(`opt:${setupGame.id}`, options);
  store.set('count', settings.count);
  store.set('time', settings.time);
  store.set('demo', settings.demo);
  launch(setupGame, settings);
});

/** À appeler directement dans un clic : débloque le son sur mobile avant le chargement. */
async function launch(game, settings) {
  audio.src = SILENT_WAV;
  audio.play().catch(() => {});
  const btn = $('#btn-start');
  const err = $('#setup-error');
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = '⏳ Préparation…';
  try {
    const questions = await game.build({ count: settings.count, options: settings.options });
    if (!questions.length) throw new Error('Aucune question disponible.');
    runGame(game, questions, settings);
  } catch (ex) {
    show('setup');
    err.textContent = `Oups : ${ex.message}`;
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = '▶ Lancer la partie';
  }
}

/* ---------------- Partie ---------------- */

const G = {
  game: null, questions: [], idx: 0, settings: null, demo: false,
  phase: 'idle', paused: false, aborted: false, skip: null,
  votes: new Map(), counts: [], voters: [], elapsed: 0,
  scores: new Map(), players: new Map(), history: [],
};

/** Attente avec pause / passer / arrêter. onTick(restant, total) est appelé ~10 fois par seconde. */
function wait(ms, onTick) {
  return new Promise((resolve) => {
    let remaining = ms;
    let last = performance.now();
    const done = (why) => { clearInterval(timer); G.skip = null; resolve(why); };
    G.skip = () => done('skip');
    const timer = setInterval(() => {
      const now = performance.now();
      if (G.aborted) return done('abort');
      if (!G.paused) remaining -= now - last;
      last = now;
      onTick?.(Math.max(0, remaining), ms);
      if (remaining <= 0) done('done');
    }, 100);
    onTick?.(remaining, ms);
  });
}

async function runGame(game, questions, settings) {
  Object.assign(G, {
    game, questions, settings, demo: settings.demo, idx: 0,
    phase: 'idle', paused: false, aborted: false,
    scores: new Map(), players: new Map(), history: [],
  });
  $('#btn-pause').textContent = '⏸';
  $('#screen-game').classList.remove('paused', 'revealing', 'boarding');
  $('#g-players').textContent = '0';
  updateGameDot();
  show('game');

  for (G.idx = 0; G.idx < questions.length && !G.aborted; G.idx++) {
    const q = questions[G.idx];
    await askQuestion(q);
    if (G.aborted) break;
    if (q.unplayable) { await wait(2500); continue; }
    await revealQuestion(q);
    if (G.aborted) break;
    if (game.scored && G.scores.size && G.idx < questions.length - 1) await showBoard();
  }

  G.phase = 'idle';
  demo.stop();
  stopSound();
  $('#screen-game').classList.remove('revealing', 'boarding');
  showEnd();
}

function renderAnswers(q) {
  const list = $('#g-answers');
  list.classList.remove('revealed');
  list.innerHTML = q.answers.map((a, i) => `
    <li class="answer">
      <span class="fill"></span>
      <span class="num"><span>${i + 1}</span></span>
      <span class="txt">${escapeHtml(a)}</span>
      <span class="who"></span>
      <span class="count"></span>
    </li>`).join('');
}

function updateAnswers() {
  const total = G.counts.reduce((a, b) => a + b, 0);
  [...$('#g-answers').children].forEach((li, i) => {
    const n = G.counts[i] || 0;
    li.querySelector('.fill').style.width = total ? `${(n / total) * 100}%` : '0';
    li.querySelector('.count').textContent = n ? String(n) : '';
    li.querySelector('.who').innerHTML = G.voters[i].slice(-3).map((p) => avatarHtml(p)).join('');
  });
}

async function askQuestion(q) {
  G.phase = 'question';
  G.votes = new Map();
  G.counts = q.answers.map(() => 0);
  G.voters = q.answers.map(() => []);
  G.elapsed = 0;

  $('#g-reveal').hidden = true;
  $('#g-board').hidden = true;
  $('#g-progress').textContent = `${G.idx + 1} / ${G.questions.length}`;
  $('#g-tag').hidden = !q.tag;
  $('#g-tag').textContent = q.tag || '';
  $('#g-question').textContent = q.prompt;

  const media = $('#g-media');
  const m = q.media;
  if (!m) media.innerHTML = '';
  else if (m.type === 'image') media.innerHTML = `<img class="${m.flag ? 'flag' : ''}" src="${escapeHtml(m.src)}" alt="">`;
  else if (m.type === 'emoji') media.innerHTML = `<div class="emoji">${escapeHtml(m.text)}</div>`;
  else if (m.type === 'audio' || m.type === 'youtube') media.innerHTML = '<div class="vinyl"></div>';

  stopSound();
  if (m?.type === 'audio') {
    audio.src = m.src;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else if (m?.type === 'youtube') {
    ytPlay(m.videoId, m.start).catch(() => {});
  }

  renderAnswers(q);
  const nums = q.answers.map((_, i) => `<b>${i + 1}</b>`);
  $('#g-cta').innerHTML = `Écris ${nums.slice(0, -1).join(', ')} ou ${nums.at(-1)} dans le chat !<br><small>1 seul vote par personne</small>`;

  const duration = G.settings.time * 1000;
  if (G.demo) demo.startQuestion(q.answers.length, q.correct, duration);

  const bar = $('#g-timer-bar');
  const timerEl = bar.parentElement;
  await wait(duration, (rem, total) => {
    G.elapsed = total - rem;
    bar.style.transform = `scaleX(${rem / total})`;
    $('#g-timer-txt').textContent = `${Math.ceil(rem / 1000)} s`;
    timerEl.classList.toggle('low', rem < 5000);
  });
  G.phase = 'reveal';
  demo.stop();
}

function processVote(msg) {
  const q = G.questions[G.idx];
  if (!q || G.votes.has(msg.uniqueId)) return;
  let choice = -1;
  const m = msg.text.match(/^\s*([1-9])(?!\d)/);
  if (m) choice = Number(m[1]) - 1;
  else if (q.keywords) {
    const word = normalize(msg.text);
    choice = q.keywords.findIndex((list) => list.includes(word));
  }
  if (choice < 0 || choice >= q.answers.length) return;

  const player = { uniqueId: msg.uniqueId, nickname: msg.nickname, avatar: msg.avatar };
  G.votes.set(msg.uniqueId, { choice, t: G.elapsed });
  G.players.set(msg.uniqueId, player);
  G.counts[choice]++;
  G.voters[choice].push(player);
  $('#g-players').textContent = String(G.players.size);
  updateAnswers();
}

async function revealQuestion(q) {
  const list = $('#g-answers');
  list.classList.add('revealed');
  const total = G.counts.reduce((a, b) => a + b, 0);
  const max = Math.max(...G.counts);
  [...list.children].forEach((li, i) => {
    if (q.correct !== null) li.classList.add(i === q.correct ? 'right' : 'wrong');
    else if (total && G.counts[i] === max) li.classList.add('top');
    else li.classList.add('wrong');
    if (total) li.querySelector('.count').textContent = `${Math.round((G.counts[i] / total) * 100)}%`;
  });

  let html = '';
  const r = q.reveal || {};
  if (r.image) html += `<img class="cover" src="${escapeHtml(r.image)}" alt="">`;
  html += '<div>';

  if (q.correct !== null) {
    G.scores.forEach((s) => { s.delta = 0; });
    const duration = G.settings.time * 1000;
    const winners = [...G.votes.entries()]
      .filter(([, v]) => v.choice === q.correct)
      .sort((a, b) => a[1].t - b[1].t);
    winners.forEach(([id, v], rank) => {
      // 100 points + jusqu'à 100 de bonus de rapidité, + 20 pour le premier.
      const pts = 100 + Math.round(100 * Math.max(0, 1 - v.t / duration)) + (rank === 0 ? 20 : 0);
      const p = G.players.get(id);
      const s = G.scores.get(id) || { ...p, score: 0, good: 0 };
      Object.assign(s, { nickname: p.nickname, avatar: p.avatar || s.avatar });
      s.score += pts;
      s.good += 1;
      s.delta = pts;
      G.scores.set(id, s);
    });

    html += `<div class="r-title">${escapeHtml(r.title || q.answers[q.correct])}</div>`;
    if (r.subtitle) html += `<div class="r-sub">${escapeHtml(r.subtitle)}</div>`;
    if (r.text) html += `<div class="r-text">${escapeHtml(r.text)}</div>`;
    if (winners.length) {
      const first = G.players.get(winners[0][0]);
      html += `<div class="r-win">🥇 ${avatarHtml(first)} <b>${escapeHtml(first.nickname)}</b> en premier · ${winners.length} bonne${winners.length > 1 ? 's' : ''} réponse${winners.length > 1 ? 's' : ''}</div>`;
    } else {
      html += `<div class="r-win">${total ? '😅 Personne n’a trouvé…' : '🤷 Aucun vote'}</div>`;
    }
  } else {
    const tops = q.answers.filter((_, i) => total && G.counts[i] === max);
    html += total
      ? `<div class="r-title">${escapeHtml(tops.join(' / '))}</div><div class="r-sub">${Math.round((max / total) * 100)}% des ${total} votes</div>`
      : '<div class="r-title">🤷 Aucun vote</div>';
    G.history.push({ prompt: q.prompt, tops, pct: total ? Math.round((max / total) * 100) : 0, total });
  }
  html += '</div>';

  const box = $('#g-reveal');
  box.innerHTML = html;
  box.hidden = false;
  $('#screen-game').classList.add('revealing');
  await wait(REVEAL_MS);
  $('#screen-game').classList.remove('revealing');
  box.hidden = true;
}

function ranking() {
  return [...G.scores.values()].sort((a, b) => b.score - a.score || b.good - a.good);
}

async function showBoard() {
  const board = $('#g-board');
  board.innerHTML = `<h3>🏆 Classement</h3><ol>${ranking().slice(0, 5).map((s, i) => `
    <li><span class="rk">${i + 1}</span>${avatarHtml(s)}<span class="nm">${escapeHtml(s.nickname)}</span>
    ${s.delta ? `<span class="delta">+${s.delta}</span>` : ''}<span class="pt">${s.score}</span></li>`).join('')}</ol>`;
  board.hidden = false;
  $('#screen-game').classList.add('boarding');
  await wait(BOARD_MS);
  $('#screen-game').classList.remove('boarding');
  board.hidden = true;
}

function showEnd() {
  const podium = $('#end-podium');
  const list = $('#end-list');
  podium.innerHTML = '';
  list.innerHTML = '';
  list.className = 'end-list';

  if (!G.game.scored) {
    $('#end-title').textContent = '📊 Résultats du sondage';
    list.className = 'poll-recap';
    list.innerHTML = G.history.map((h) => `<li class="item"><b>${escapeHtml(h.prompt)}</b>${h.total
      ? `👉 ${escapeHtml(h.tops.join(' / '))} (${h.pct}% de ${h.total} votes)` : 'Aucun vote'}</li>`).join('');
  } else {
    const rk = ranking();
    $('#end-title').textContent = rk.length ? '🏆 Classement final' : '😢 Personne n’a joué cette fois';
    podium.innerHTML = rk.slice(0, 3).map((s, i) => `
      <div class="p p${i + 1}">${avatarHtml(s, i === 0 ? 'xl' : 'lg')}
        <span class="nm">${escapeHtml(s.nickname)}</span><span>${s.score} pts</span>
        <div class="step">${['🥇', '🥈', '🥉'][i]}</div></div>`).join('');
    list.innerHTML = rk.slice(3, 10).map((s, i) => `
      <li><span class="rk">${i + 4}</span>${avatarHtml(s)}<span class="nm">${escapeHtml(s.nickname)}</span><span class="pt">${s.score}</span></li>`).join('');
    if (rk.length) confetti();
  }
  show('end');
}

function confetti() {
  const colors = ['#ffd23f', '#ff4d6d', '#3a86ff', '#14c38e', '#b388ff'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = `${Math.random() * 100}vw`;
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
    c.style.animationDelay = `${Math.random() * 0.8}s`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }
}

function stopSound() {
  audio.pause();
  ytStop();
}

// Vidéo YouTube impossible à lire hors de YouTube : on passe à la question suivante.
onYouTubeError(() => {
  const q = G.questions[G.idx];
  if (G.phase !== 'question' || q?.media?.type !== 'youtube') return;
  q.unplayable = true;
  $('#g-cta').innerHTML = '⚠️ Cette vidéo ne peut pas être lue ici : on passe à la suivante.';
  G.skip?.();
});

/* ---------------- Boutons de l'animatrice ---------------- */

$('#btn-pause').addEventListener('click', () => {
  G.paused = !G.paused;
  $('#btn-pause').textContent = G.paused ? '▶' : '⏸';
  $('#screen-game').classList.toggle('paused', G.paused);
  const type = G.questions[G.idx]?.media?.type;
  if (type === 'audio') G.paused ? audio.pause() : audio.play().catch(() => {});
  if (type === 'youtube') G.paused ? ytPause() : ytResume();
});
$('#btn-skip').addEventListener('click', () => G.skip?.());
$('#btn-quit').addEventListener('click', () => {
  if (!confirm('Arrêter la partie et afficher le classement ?')) return;
  G.aborted = true;
  G.skip?.();
});
$('#btn-replay').addEventListener('click', () => {
  show('setup');
  launch(G.game, G.settings);
});
