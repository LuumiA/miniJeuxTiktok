import { mcq, sample, shuffle, preloadImage } from '../util.js';

// [code ISO, nom, continent, capitale (null si ambiguë), pays « connu » (mode facile)]
const C = [
  ['fr', 'France', 'eu', 'Paris', 1], ['de', 'Allemagne', 'eu', 'Berlin', 1], ['es', 'Espagne', 'eu', 'Madrid', 1],
  ['it', 'Italie', 'eu', 'Rome', 1], ['pt', 'Portugal', 'eu', 'Lisbonne', 1], ['gb', 'Royaume-Uni', 'eu', 'Londres', 1],
  ['ie', 'Irlande', 'eu', 'Dublin', 1], ['be', 'Belgique', 'eu', 'Bruxelles', 1], ['nl', 'Pays-Bas', 'eu', 'Amsterdam', 1],
  ['lu', 'Luxembourg', 'eu', 'Luxembourg', 0], ['ch', 'Suisse', 'eu', 'Berne', 1], ['at', 'Autriche', 'eu', 'Vienne', 1],
  ['pl', 'Pologne', 'eu', 'Varsovie', 1], ['cz', 'Tchéquie', 'eu', 'Prague', 0], ['sk', 'Slovaquie', 'eu', 'Bratislava', 0],
  ['hu', 'Hongrie', 'eu', 'Budapest', 0], ['ro', 'Roumanie', 'eu', 'Bucarest', 0], ['bg', 'Bulgarie', 'eu', 'Sofia', 0],
  ['gr', 'Grèce', 'eu', 'Athènes', 1], ['hr', 'Croatie', 'eu', 'Zagreb', 0], ['si', 'Slovénie', 'eu', 'Ljubljana', 0],
  ['rs', 'Serbie', 'eu', 'Belgrade', 0], ['ba', 'Bosnie-Herzégovine', 'eu', 'Sarajevo', 0], ['al', 'Albanie', 'eu', 'Tirana', 0],
  ['mk', 'Macédoine du Nord', 'eu', 'Skopje', 0], ['me', 'Monténégro', 'eu', 'Podgorica', 0], ['ua', 'Ukraine', 'eu', 'Kyiv', 1],
  ['by', 'Biélorussie', 'eu', 'Minsk', 0], ['ru', 'Russie', 'eu', 'Moscou', 1], ['lt', 'Lituanie', 'eu', 'Vilnius', 0],
  ['lv', 'Lettonie', 'eu', 'Riga', 0], ['ee', 'Estonie', 'eu', 'Tallinn', 0], ['fi', 'Finlande', 'eu', 'Helsinki', 0],
  ['se', 'Suède', 'eu', 'Stockholm', 1], ['no', 'Norvège', 'eu', 'Oslo', 1], ['dk', 'Danemark', 'eu', 'Copenhague', 1],
  ['is', 'Islande', 'eu', 'Reykjavik', 0], ['mt', 'Malte', 'eu', 'La Valette', 0], ['cy', 'Chypre', 'eu', 'Nicosie', 0],
  ['md', 'Moldavie', 'eu', 'Chișinău', 0], ['mc', 'Monaco', 'eu', 'Monaco', 0], ['ad', 'Andorre', 'eu', 'Andorre-la-Vieille', 0],

  ['cn', 'Chine', 'as', 'Pékin', 1], ['jp', 'Japon', 'as', 'Tokyo', 1], ['kr', 'Corée du Sud', 'as', 'Séoul', 1],
  ['kp', 'Corée du Nord', 'as', 'Pyongyang', 0], ['in', 'Inde', 'as', 'New Delhi', 1], ['pk', 'Pakistan', 'as', 'Islamabad', 0],
  ['bd', 'Bangladesh', 'as', 'Dacca', 0], ['th', 'Thaïlande', 'as', 'Bangkok', 1], ['vn', 'Viêt Nam', 'as', 'Hanoï', 1],
  ['kh', 'Cambodge', 'as', 'Phnom Penh', 0], ['la', 'Laos', 'as', 'Vientiane', 0], ['my', 'Malaisie', 'as', 'Kuala Lumpur', 0],
  ['sg', 'Singapour', 'as', 'Singapour', 0], ['id', 'Indonésie', 'as', 'Jakarta', 0], ['ph', 'Philippines', 'as', 'Manille', 0],
  ['mn', 'Mongolie', 'as', 'Oulan-Bator', 0], ['np', 'Népal', 'as', 'Katmandou', 0], ['lk', 'Sri Lanka', 'as', null, 0],
  ['tr', 'Turquie', 'as', 'Ankara', 1], ['sa', 'Arabie saoudite', 'as', 'Riyad', 1], ['ae', 'Émirats arabes unis', 'as', 'Abou Dabi', 0],
  ['qa', 'Qatar', 'as', 'Doha', 0], ['lb', 'Liban', 'as', 'Beyrouth', 1], ['jo', 'Jordanie', 'as', 'Amman', 0],
  ['sy', 'Syrie', 'as', 'Damas', 0], ['iq', 'Irak', 'as', 'Bagdad', 0], ['ir', 'Iran', 'as', 'Téhéran', 0],
  ['af', 'Afghanistan', 'as', 'Kaboul', 0], ['kz', 'Kazakhstan', 'as', 'Astana', 0], ['uz', 'Ouzbékistan', 'as', 'Tachkent', 0],
  ['ge', 'Géorgie', 'as', 'Tbilissi', 0], ['am', 'Arménie', 'as', 'Erevan', 0], ['az', 'Azerbaïdjan', 'as', 'Bakou', 0],

  ['ma', 'Maroc', 'af', 'Rabat', 1], ['dz', 'Algérie', 'af', 'Alger', 1], ['tn', 'Tunisie', 'af', 'Tunis', 1],
  ['eg', 'Égypte', 'af', 'Le Caire', 1], ['ly', 'Libye', 'af', 'Tripoli', 0], ['sn', 'Sénégal', 'af', 'Dakar', 1],
  ['ml', 'Mali', 'af', 'Bamako', 0], ['ci', "Côte d'Ivoire", 'af', 'Yamoussoukro', 1], ['cm', 'Cameroun', 'af', 'Yaoundé', 1],
  ['ng', 'Nigeria', 'af', 'Abuja', 0], ['gh', 'Ghana', 'af', 'Accra', 0], ['et', 'Éthiopie', 'af', 'Addis-Abeba', 0],
  ['ke', 'Kenya', 'af', 'Nairobi', 0], ['tz', 'Tanzanie', 'af', 'Dodoma', 0], ['za', 'Afrique du Sud', 'af', null, 1],
  ['cd', 'RD Congo', 'af', 'Kinshasa', 0], ['cg', 'Congo', 'af', 'Brazzaville', 0], ['ga', 'Gabon', 'af', 'Libreville', 0],
  ['mg', 'Madagascar', 'af', 'Antananarivo', 0], ['gn', 'Guinée', 'af', 'Conakry', 0], ['bf', 'Burkina Faso', 'af', 'Ouagadougou', 0],
  ['ne', 'Niger', 'af', 'Niamey', 0], ['td', 'Tchad', 'af', "N'Djaména", 0], ['ao', 'Angola', 'af', 'Luanda', 0],
  ['rw', 'Rwanda', 'af', 'Kigali', 0], ['ug', 'Ouganda', 'af', 'Kampala', 0], ['zw', 'Zimbabwe', 'af', 'Harare', 0],
  ['mr', 'Mauritanie', 'af', 'Nouakchott', 0], ['bj', 'Bénin', 'af', 'Porto-Novo', 0], ['tg', 'Togo', 'af', 'Lomé', 0],
  ['mu', 'Maurice', 'af', 'Port-Louis', 0], ['cv', 'Cap-Vert', 'af', 'Praia', 0], ['sd', 'Soudan', 'af', 'Khartoum', 0],

  ['us', 'États-Unis', 'am', 'Washington', 1], ['ca', 'Canada', 'am', 'Ottawa', 1], ['mx', 'Mexique', 'am', 'Mexico', 1],
  ['br', 'Brésil', 'am', 'Brasília', 1], ['ar', 'Argentine', 'am', 'Buenos Aires', 1], ['cl', 'Chili', 'am', 'Santiago', 0],
  ['pe', 'Pérou', 'am', 'Lima', 0], ['co', 'Colombie', 'am', 'Bogota', 0], ['ve', 'Venezuela', 'am', 'Caracas', 0],
  ['ec', 'Équateur', 'am', 'Quito', 0], ['bo', 'Bolivie', 'am', null, 0], ['uy', 'Uruguay', 'am', 'Montevideo', 0],
  ['py', 'Paraguay', 'am', 'Asunción', 0], ['cu', 'Cuba', 'am', 'La Havane', 1], ['jm', 'Jamaïque', 'am', 'Kingston', 1],
  ['ht', 'Haïti', 'am', 'Port-au-Prince', 0], ['do', 'République dominicaine', 'am', 'Saint-Domingue', 0],
  ['pa', 'Panama', 'am', 'Panama', 0], ['cr', 'Costa Rica', 'am', 'San José', 0], ['gt', 'Guatemala', 'am', 'Guatemala', 0],

  ['au', 'Australie', 'oc', 'Canberra', 1], ['nz', 'Nouvelle-Zélande', 'oc', 'Wellington', 1], ['fj', 'Fidji', 'oc', 'Suva', 0],
  ['pg', 'Papouasie-Nouvelle-Guinée', 'oc', 'Port Moresby', 0],
].map(([code, name, cont, capital, easy]) => ({ code, name, cont, capital, easy: !!easy }));

const flag = (code) => `https://flagcdn.com/w640/${code}.png`;

/** 3 mauvaises réponses, de préférence du même continent (plus dur, plus fun). */
function distractors(country, pool, key) {
  const same = shuffle(pool.filter((c) => c !== country && c.cont === country.cont && c[key]));
  const other = shuffle(pool.filter((c) => c !== country && c.cont !== country.cont && c[key]));
  return [...same, ...other].map((c) => c[key]).filter((v, i, a) => v !== country[key] && a.indexOf(v) === i).slice(0, 3);
}

export default {
  id: 'drapeaux',
  name: 'Devine le pays',
  emoji: '🚩',
  description: 'Un drapeau s’affiche : à quel pays est-il ?',
  answersCount: 4,
  scored: true,
  options: [
    { id: 'mode', label: 'Mode', type: 'select', default: 'flag', choices: [
      { value: 'flag', label: '🚩 Drapeau → pays' },
      { value: 'capital', label: '🏙️ Pays → capitale' },
    ] },
    { id: 'level', label: 'Difficulté', type: 'select', default: 'easy', choices: [
      { value: 'easy', label: '😊 Pays connus' },
      { value: 'all', label: '🤯 Tous les pays' },
    ] },
  ],
  async build({ count, options }) {
    const capitalMode = options.mode === 'capital';
    let pool = options.level === 'all' ? C : C.filter((c) => c.easy);
    if (capitalMode) pool = pool.filter((c) => c.capital);
    const all = capitalMode ? C.filter((c) => c.capital) : C;
    const picked = sample(pool, Math.min(count, pool.length));
    // Précharge les drapeaux pour un affichage instantané.
    await Promise.all(picked.slice(0, 3).map((c) => preloadImage(flag(c.code))));
    picked.slice(3).forEach((c) => preloadImage(flag(c.code)));
    return picked.map((c) => capitalMode
      ? mcq(`Quelle est la capitale du pays suivant : ${c.name} ?`, c.capital, distractors(c, all, 'capital'),
        { media: { type: 'image', src: flag(c.code), flag: true }, reveal: { title: c.capital, subtitle: c.name } })
      : mcq('À quel pays appartient ce drapeau ?', c.name, distractors(c, all, 'name'),
        { media: { type: 'image', src: flag(c.code), flag: true }, reveal: { title: c.name, subtitle: c.capital ? `Capitale : ${c.capital}` : '' } }));
  },
};
