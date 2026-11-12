import { mcq, sample, shuffle } from '../util.js';

// [emojis, titre du film]
const FILMS = [
  ['🦁👑🌅', 'Le Roi Lion'],
  ['❄️👸⛄', 'La Reine des neiges'],
  ['🚢🧊💔', 'Titanic'],
  ['🦖🏝️🧬', 'Jurassic Park'],
  ['🧙‍♂️⚡👓', 'Harry Potter'],
  ['🕷️🧑🏙️', 'Spider-Man'],
  ['🐀👨‍🍳🍲', 'Ratatouille'],
  ['🐠🔍🌊', 'Le Monde de Nemo'],
  ['🏠🎈👴', 'Là-haut'],
  ['🦈🏖️😱', 'Les Dents de la mer'],
  ['👽📞🏠', 'E.T. l’extra-terrestre'],
  ['🤠🧸🚀', 'Toy Story'],
  ['🐼🥋🥟', 'Kung Fu Panda'],
  ['🟢👹🏰🫏', 'Shrek'],
  ['🦇🃏🌃', 'The Dark Knight'],
  ['🍫🏭🎩', 'Charlie et la chocolaterie'],
  ['💍🌋🧝', 'Le Seigneur des anneaux'],
  ['🏴‍☠️🦜⚓', 'Pirates des Caraïbes'],
  ['👻🚫🔫', 'SOS Fantômes'],
  ['🤖❤️🌱', 'WALL-E'],
  ['🚗⚡🏁', 'Cars'],
  ['🌹👸👹', 'La Belle et la Bête'],
  ['🧞‍♂️🪔🐒', 'Aladdin'],
  ['🧜‍♀️🦀🔱', 'La Petite Sirène'],
  ['👧⚔️🐉', 'Mulan'],
  ['🍎👸🪞', 'Blanche-Neige'],
  ['👠🎃🕛', 'Cendrillon'],
  ['🦍🏙️✈️', 'King Kong'],
  ['🦸💎🧤', 'Avengers: Endgame'],
  ['🍝🐶🐶', 'La Belle et le Clochard'],
  ['🐶⚫⚪💯', 'Les 101 Dalmatiens'],
  ['🚀🌽🕳️⏳', 'Interstellar'],
  ['🦊🐰🚓', 'Zootopie'],
  ['💀🎸🌼', 'Coco'],
  ['😀😢😡🧠', 'Vice-Versa'],
  ['💛👓🍌', 'Les Minions'],
  ['🌪️🏠👠', 'Le Magicien d’Oz'],
  ['🏃‍♂️🍫🦐', 'Forrest Gump'],
  ['🕶️💊🐇', 'Matrix'],
  ['🏹👧🔥', 'Hunger Games'],
  ['🐻🍯🎈', 'Winnie l’ourson'],
  ['⚔️🌌🤖', 'Star Wars'],
  ['🦁🦓🦒🦛🗽', 'Madagascar'],
  ['🌊🛶🐔🏝️', 'Vaiana'],
  ['👨‍👩‍👧‍👦🦸⚡', 'Les Indestructibles'],
  ['👹👾🚪😱', 'Monstres et Cie'],
];

export default {
  id: 'emojis',
  name: 'Film en emojis',
  emoji: '🎬',
  description: 'Des emojis racontent un film : lequel ?',
  answersCount: 4,
  scored: true,
  options: [],
  async build({ count }) {
    return sample(FILMS, Math.min(count, FILMS.length)).map(([emojis, title]) => {
      const wrongs = shuffle(FILMS.filter((f) => f[1] !== title)).slice(0, 3).map((f) => f[1]);
      return mcq('Quel est ce film ?', title, wrongs, { media: { type: 'emoji', text: emojis }, reveal: { title, subtitle: emojis } });
    });
  },
};
