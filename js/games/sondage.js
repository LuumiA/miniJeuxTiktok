import { sample } from '../util.js';

const POLLS = [
  ['Ta saison préférée ?', 'Printemps 🌸', 'Été ☀️', 'Automne 🍂', 'Hiver ❄️'],
  ['Team chat ou team chien ?', 'Chat 🐱', 'Chien 🐶'],
  ['Le meilleur repas ?', 'Pizza 🍕', 'Burger 🍔', 'Sushi 🍣', 'Tacos 🌮'],
  ['Tu es plutôt…', 'Du matin ☀️', 'Du soir 🌙'],
  ['Ta boisson préférée ?', 'Café ☕', 'Thé 🍵', 'Soda 🥤', 'Eau 💧'],
  ['On dit…', 'Pain au chocolat', 'Chocolatine'],
  ['Vacances idéales ?', 'Plage 🏖️', 'Montagne 🏔️', 'Ville 🏙️', 'Campagne 🌾'],
  ['Tu préfères…', 'Les films 🎬', 'Les séries 📺'],
  ['Ton super-pouvoir rêvé ?', 'Voler 🕊️', 'Invisibilité 👻', 'Téléportation ✨', 'Lire les pensées 🧠'],
  ['Le réseau que tu utilises le plus ?', 'TikTok', 'Instagram', 'YouTube', 'Snapchat'],
  ['Sucré ou salé ?', 'Sucré 🍰', 'Salé 🧀'],
  ['Tu ranges ta chambre…', 'Tous les jours', 'Une fois par semaine', 'Quand j’ai plus le choix', 'Jamais 😅'],
  ['Ton dessert préféré ?', 'Glace 🍦', 'Crêpes 🥞', 'Tiramisu', 'Fondant au chocolat 🍫'],
  ['Ta musique préférée ?', 'Pop', 'Rap', 'Rock', 'Électro'],
  ['Le pire ?', 'Le lundi matin', 'Le réveil pendant un beau rêve', 'Plus de batterie', 'Plus de wifi'],
  ['Mieux vaut avoir…', 'Trop chaud 🥵', 'Trop froid 🥶'],
  ['Ton passe-temps ?', 'Jeux vidéo 🎮', 'Jeux de société 🎲', 'Sport ⚽', 'Lecture 📚'],
  ['Combien d’heures tu dors ?', 'Moins de 6 h', '6 à 7 h', '7 à 8 h', 'Plus de 8 h'],
  ['De l’ananas sur la pizza ?', 'Oui 🍍', 'Jamais ❌'],
  ['Tu regardes le live depuis…', 'Ton lit 🛏️', 'Le canapé 🛋️', 'Les transports 🚌', 'Le travail ou l’école 🤫'],
  ['Frites ou purée ?', 'Frites 🍟', 'Purée 🥔'],
  ['Le meilleur moment de la journée ?', 'Le matin', 'Le midi', 'Le soir', 'La nuit'],
];

export default {
  id: 'sondage',
  name: 'Sondage',
  emoji: '📊',
  description: 'Le chat vote, sans bonne réponse.',
  answersCount: 4,
  scored: false,
  options: [
    { id: 'source', label: 'Questions', type: 'select', default: 'builtin', choices: [
      { value: 'builtin', label: '🎲 Questions toutes prêtes' },
      { value: 'custom', label: '✍️ Mes questions (ci-dessous)' },
    ] },
    { id: 'custom', label: 'Mes questions : une par ligne, réponses séparées par |', type: 'textarea',
      placeholder: 'Je fais quoi au prochain live ? | Blindtest | Quiz | Drapeaux\nJe teins mes cheveux ? | Oui | Non' },
  ],
  async build({ count, options }) {
    let polls = POLLS;
    if (options.source === 'custom') {
      polls = String(options.custom || '').split('\n')
        .map((line) => line.split('|').map((s) => s.trim()).filter(Boolean))
        .filter((p) => p.length >= 3)
        .map((p) => p.slice(0, 5));
      if (!polls.length) throw new Error('Écris au moins une question, par exemple : Pizza ou burger ? | Pizza | Burger');
      polls = polls.slice(0, count);
    } else {
      polls = sample(POLLS, Math.min(count, POLLS.length));
    }
    return polls.map(([prompt, ...answers]) => ({ prompt, answers, correct: null }));
  },
};
