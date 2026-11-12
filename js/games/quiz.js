import { mcq, sample } from '../util.js';

// Format : [question, bonne réponse, mauvaise 1, mauvaise 2, mauvaise 3]
const BANK = {
  sport: {
    label: '⚽ Sport',
    q: [
      ['Combien de joueurs une équipe de foot a-t-elle sur le terrain ?', '11', '10', '9', '12'],
      ['En quelle année la France a-t-elle gagné sa première Coupe du monde de foot ?', '1998', '2006', '1986', '2002'],
      ['Quel pays a gagné la Coupe du monde de foot 2022 ?', 'Argentine', 'France', 'Brésil', 'Croatie'],
      ['Quel tournoi de tennis se joue sur terre battue à Paris ?', 'Roland-Garros', 'Wimbledon', 'US Open', "Open d'Australie"],
      ['Dans quel sport utilise-t-on un volant ?', 'Badminton', 'Tennis de table', 'Squash', 'Padel'],
      ["Quelle ville a accueilli les JO d'été 2024 ?", 'Paris', 'Tokyo', 'Los Angeles', 'Londres'],
      ['Combien de points vaut un essai au rugby à XV ?', '5', '3', '4', '7'],
      ['Qui détient le record du monde du 100 m ?', 'Usain Bolt', 'Carl Lewis', 'Asafa Powell', 'Justin Gatlin'],
      ['Dans quel sport Teddy Riner est-il champion ?', 'Judo', 'Lutte', 'Boxe', 'Karaté'],
      ['Combien de joueurs par équipe sur un terrain de basket ?', '5', '6', '7', '4'],
      ['Quel club de foot est surnommé « les Gones » ?', 'Lyon', 'Marseille', 'Saint-Étienne', 'Lille'],
      ['Combien de sets faut-il gagner pour remporter un match masculin en Grand Chelem ?', '3', '2', '4', '5'],
      ['Quel est le maillot du leader du Tour de France ?', 'Jaune', 'Vert', 'À pois', 'Blanc'],
    ],
  },
  cinema: {
    label: '🎬 Ciné & séries',
    q: [
      ['Qui a réalisé « Titanic » (1997) ?', 'James Cameron', 'Steven Spielberg', 'Ridley Scott', 'Christopher Nolan'],
      ['Dans « Le Roi Lion », comment s’appelle le père de Simba ?', 'Mufasa', 'Scar', 'Rafiki', 'Zazu'],
      ['Quel acteur joue Jack Sparrow ?', 'Johnny Depp', 'Orlando Bloom', 'Brad Pitt', 'Leonardo DiCaprio'],
      ['Dans quelle maison de Poudlard est Harry Potter ?', 'Gryffondor', 'Serpentard', 'Poufsouffle', 'Serdaigle'],
      ['Quel film français de 2011 raconte l’amitié entre Philippe et Driss ?', 'Intouchables', 'Bienvenue chez les Ch’tis', 'Le Dîner de cons', 'Les Visiteurs'],
      ['Dans quelle série trouve-t-on le Professeur et Berlin ?', 'La Casa de Papel', 'Lupin', 'Narcos', 'Elite'],
      ['Comment s’appelle le bonhomme de neige de « La Reine des neiges » ?', 'Olaf', 'Sven', 'Kristoff', 'Hans'],
      ['Dans quelle saga apparaît Dark Vador ?', 'Star Wars', 'Star Trek', 'Dune', 'Avatar'],
      ['Quel super-héros est Peter Parker ?', 'Spider-Man', 'Batman', 'Iron Man', 'Superman'],
      ['Dans « Stranger Things », comment s’appelle la jeune fille aux pouvoirs ?', 'Onze', 'Max', 'Nancy', 'Robin'],
      ['Quel film Pixar a pour héros un rat cuisinier ?', 'Ratatouille', 'Là-haut', 'Coco', 'Cars'],
      ['Dans quelle ville se passe la série « Friends » ?', 'New York', 'Los Angeles', 'Chicago', 'Boston'],
      ['Combien de films compte la saga « Harry Potter » ?', '8', '7', '6', '9'],
    ],
  },
  histoire: {
    label: '🏛️ Histoire',
    q: [
      ['En quelle année a eu lieu la prise de la Bastille ?', '1789', '1792', '1776', '1815'],
      ['Qui a été le premier président de la Ve République ?', 'Charles de Gaulle', 'Georges Pompidou', 'Vincent Auriol', 'François Mitterrand'],
      ['En quelle année l’homme a-t-il marché sur la Lune pour la première fois ?', '1969', '1965', '1972', '1957'],
      ['Quel empereur a été exilé sur l’île de Sainte-Hélène ?', 'Napoléon Ier', 'Napoléon III', 'Charlemagne', 'Louis XIV'],
      ['En quelle année le mur de Berlin est-il tombé ?', '1989', '1991', '1985', '1961'],
      ['Quel roi était surnommé le Roi-Soleil ?', 'Louis XIV', 'Louis XVI', 'François Ier', 'Henri IV'],
      ['Qui a atteint l’Amérique en 1492 ?', 'Christophe Colomb', 'Vasco de Gama', 'Magellan', 'Amerigo Vespucci'],
      ['En quelle année la Seconde Guerre mondiale s’est-elle terminée ?', '1945', '1944', '1918', '1946'],
      ['Quel peuple a construit les pyramides de Gizeh ?', 'Les Égyptiens', 'Les Romains', 'Les Mayas', 'Les Grecs'],
      ['Dans quelle ville Jeanne d’Arc a-t-elle été brûlée ?', 'Rouen', 'Orléans', 'Reims', 'Paris'],
      ['Qui a été le premier homme à marcher sur la Lune ?', 'Neil Armstrong', 'Buzz Aldrin', 'Youri Gagarine', 'Michael Collins'],
      ['Quel paquebot a coulé en 1912 ?', 'Le Titanic', 'Le Lusitania', 'Le Normandie', 'Le Queen Mary'],
    ],
  },
  geo: {
    label: '🌍 Géographie',
    q: [
      ['Quelle est la capitale de l’Australie ?', 'Canberra', 'Sydney', 'Melbourne', 'Perth'],
      ['Quel est le plus long fleuve de France ?', 'La Loire', 'La Seine', 'Le Rhône', 'La Garonne'],
      ['Quel est le plus grand océan du monde ?', 'Pacifique', 'Atlantique', 'Indien', 'Arctique'],
      ['Quel est le plus haut sommet du monde ?', 'L’Everest', 'Le K2', 'Le mont Blanc', 'Le Kilimandjaro'],
      ['Quel pays a la forme d’une botte ?', 'Italie', 'Grèce', 'Portugal', 'Croatie'],
      ['Quelle est la capitale du Canada ?', 'Ottawa', 'Toronto', 'Montréal', 'Vancouver'],
      ['Dans quel pays se trouve le Machu Picchu ?', 'Pérou', 'Mexique', 'Bolivie', 'Chili'],
      ['Quel est le plus grand pays du monde ?', 'Russie', 'Canada', 'Chine', 'États-Unis'],
      ['Quel est le plus grand désert chaud du monde ?', 'Le Sahara', 'Le Gobi', 'Le Kalahari', "L'Atacama"],
      ['Quelle ville est surnommée « la Ville rose » ?', 'Toulouse', 'Marseille', 'Lyon', 'Bordeaux'],
      ['Combien de pays ont une frontière terrestre avec la France métropolitaine ?', '8', '6', '7', '5'],
      ['Quel est le plus grand pays d’Amérique du Sud ?', 'Brésil', 'Argentine', 'Pérou', 'Colombie'],
    ],
  },
  sciences: {
    label: '🔬 Sciences',
    q: [
      ['Quelle planète est surnommée la planète rouge ?', 'Mars', 'Jupiter', 'Vénus', 'Saturne'],
      ['Quelle est la formule chimique de l’eau ?', 'H2O', 'CO2', 'O2', 'NaCl'],
      ['Combien d’os compte le corps d’un adulte ?', '206', '186', '226', '250'],
      ['Quel organe pompe le sang dans le corps ?', 'Le cœur', 'Les poumons', 'Le foie', 'Les reins'],
      ['Quelle est la plus grande planète du système solaire ?', 'Jupiter', 'Saturne', 'Neptune', 'La Terre'],
      ['À quelle température l’eau bout-elle au niveau de la mer ?', '100 °C', '90 °C', '120 °C', '80 °C'],
      ['Quel gaz les plantes absorbent-elles pour la photosynthèse ?', 'Le dioxyde de carbone', 'L’oxygène', 'L’azote', 'L’hélium'],
      ['Qui a formulé la théorie de la relativité ?', 'Albert Einstein', 'Isaac Newton', 'Marie Curie', 'Galilée'],
      ['Combien de pattes a une araignée ?', '8', '6', '10', '12'],
      ['Quel est le symbole chimique de l’or ?', 'Au', 'Or', 'Ag', 'Fe'],
      ['Quel est le plus grand animal du monde ?', 'La baleine bleue', 'L’éléphant d’Afrique', 'Le cachalot', 'La girafe'],
      ['Combien de temps met la lumière du Soleil pour arriver sur Terre ?', 'Environ 8 minutes', 'Environ 8 secondes', 'Environ 1 heure', 'Environ 1 jour'],
      ['Quelle planète est la plus proche du Soleil ?', 'Mercure', 'Vénus', 'Mars', 'La Terre'],
    ],
  },
  musique: {
    label: '🎶 Musique',
    q: [
      ['Quel chanteur est surnommé « le King » ?', 'Elvis Presley', 'Michael Jackson', 'Johnny Hallyday', 'Prince'],
      ['Michael Jackson est surnommé le roi de la…', 'Pop', 'Rock', 'Soul', 'Funk'],
      ['Quel groupe a chanté « Bohemian Rhapsody » ?', 'Queen', 'The Beatles', 'The Rolling Stones', 'Oasis'],
      ['De quel pays vient le groupe BTS ?', 'Corée du Sud', 'Japon', 'Chine', 'Thaïlande'],
      ['Quelle chanteuse a sorti l’album « 21 » ?', 'Adele', 'Rihanna', 'Beyoncé', 'Lady Gaga'],
      ['Combien de cordes a une guitare classique ?', '6', '4', '5', '7'],
      ['Qui chante « Formidable » ?', 'Stromae', 'Gims', 'Angèle', 'Orelsan'],
      ['Quel grand compositeur est devenu sourd ?', 'Beethoven', 'Mozart', 'Bach', 'Chopin'],
      ['Quel duo français a fait « Get Lucky » ?', 'Daft Punk', 'Justice', 'Air', 'Cassius'],
      ['Quel rappeur a sorti l’album « Civilisation » en 2021 ?', 'Orelsan', 'Nekfeu', 'Booba', 'Damso'],
      ['Quelle chanson est d’Aya Nakamura ?', 'Djadja', 'Dernière danse', 'Tout oublier', 'Alors on danse'],
      ['Quel instrument a 88 touches ?', 'Le piano', 'L’accordéon', 'Le xylophone', 'La harpe'],
    ],
  },
  divers: {
    label: '🎲 Divers',
    q: [
      ['Combien de minutes y a-t-il dans une journée ?', '1 440', '1 240', '1 640', '1 340'],
      ['Quelle couleur obtient-on en mélangeant bleu et jaune ?', 'Vert', 'Violet', 'Orange', 'Marron'],
      ['Combien de côtés a un hexagone ?', '6', '5', '7', '8'],
      ['Combien de jours compte une année bissextile ?', '366', '365', '364', '367'],
      ['Quel animal est un symbole de la France ?', 'Le coq', 'L’aigle', 'Le lion', 'L’ours'],
      ['Quelle langue parle-t-on au Brésil ?', 'Portugais', 'Espagnol', 'Brésilien', 'Anglais'],
      ['Quelle est la monnaie du Japon ?', 'Le yen', 'Le yuan', 'Le won', 'Le baht'],
      ['Aux échecs, quelle pièce se déplace en L ?', 'Le cavalier', 'Le fou', 'La tour', 'Le roi'],
      ['Combien de cartes compte un jeu classique sans jokers ?', '52', '54', '32', '48'],
      ['Combien de zéros y a-t-il dans un million ?', '6', '5', '7', '9'],
      ['Que mesure un thermomètre ?', 'La température', 'La pression', 'Le vent', 'L’humidité'],
      ['Combien de couleurs a un arc-en-ciel ?', '7', '5', '6', '8'],
    ],
  },
};

export default {
  id: 'quiz',
  name: 'Quiz culture G',
  emoji: '🧠',
  description: 'Questions de culture générale par catégorie.',
  answersCount: 4,
  scored: true,
  options: [
    {
      id: 'category', label: 'Catégorie', type: 'select', default: 'all',
      choices: [{ value: 'all', label: '🌈 Toutes les catégories' }, ...Object.entries(BANK).map(([value, c]) => ({ value, label: c.label }))],
    },
  ],
  async build({ count, options }) {
    const cats = options.category && BANK[options.category] ? [options.category] : Object.keys(BANK);
    const pool = cats.flatMap((c) => BANK[c].q.map((q) => ({ q, cat: BANK[c].label })));
    return sample(pool, Math.min(count, pool.length)).map(({ q: [prompt, good, ...bad], cat }) =>
      mcq(prompt, good, bad, { tag: cat }));
  },
};
