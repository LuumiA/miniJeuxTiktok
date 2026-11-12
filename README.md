# 🎮 Mini-jeux Live

Mini-jeux pour les lives TikTok. On ouvre le site sur son téléphone, on partage l'écran en live, et les viewers jouent en écrivant **1**, **2**, **3** ou **4** dans le chat.

| Jeu | Principe |
|---|---|
| 🎵 Blindtest | Extrait de 30 s (Deezer) : top du moment, années 80/90/2000/2010, rap FR, variété, Disney, ou ta propre playlist Deezer |
| 🧠 Quiz culture G | 7 catégories : sport, ciné, histoire, géo, sciences, musique, divers |
| 🚩 Devine le pays | Drapeau → pays, ou pays → capitale. Facile ou difficile |
| 🎬 Film en emojis | Les emojis racontent un film |
| ✅ Vrai ou faux | 1 = vrai, 2 = faux (« vrai » et « faux » marchent aussi) |
| 📊 Sondage | Pas de bonne réponse. Questions toutes prêtes, ou les tiennes |

Règles : un seul vote par personne et par question (le premier compte). Une bonne réponse rapporte 100 points, plus un bonus de rapidité jusqu'à 100 points, et 20 points de plus pour la première personne qui trouve.

## Le site, techniquement

Le site est fait en HTML, CSS et JavaScript, sans étape de compilation et sans serveur. Le chat arrive directement dans le navigateur grâce à [Euler Stream](https://www.eulerstream.com) (WebSocket).

```
index.html           page unique (accueil, réglages, partie, classement)
css/style.css
js/main.js           déroulé d'une partie, votes, points, classement
js/chat.js           connexion Euler Stream + mode démo (faux viewers)
js/util.js
js/games/*.js        un fichier par jeu (questions + règles)
```

### Ajouter un jeu
Copie un fichier de `js/games/` (par exemple `emojis.js`), change `id`, `name`, `emoji` et les questions, puis ajoute-le dans la liste `GAMES` en haut de `js/main.js`.
Chaque question a la forme `{ prompt, answers: [...], correct: index ou null, media?, reveal? }`.

### Tester sur l'ordinateur
```bash
npx serve .
```
Ouvre ensuite http://localhost:3000. Coche **Mode démo** dans les réglages d'un jeu : de faux viewers votent.

## Mise en ligne (gratuit)

### 1. Euler Stream (lecture du chat)
1. Crée un compte sur https://www.eulerstream.com. Le plan gratuit « Community » suffit.
2. Dans le tableau de bord, copie ta **clé API**.

### 2. Vercel (le site)
1. Mets ce dossier sur GitHub (nouveau dépôt, puis envoie les fichiers).
2. Sur https://vercel.com : *Add New → Project*, choisis le dépôt, puis *Deploy*. Il n'y a rien à configurer.
3. Tu obtiens une adresse du type `https://mini-jeux-xxx.vercel.app`.

(Ça marche aussi en glissant-déposant le dossier sur https://app.netlify.com/drop.)

## En live

1. Lance ton live TikTok.
2. Sur le téléphone, ouvre le site, puis **Connexion au chat TikTok**. Entre ton pseudo et ta clé API, puis **Se connecter**. Le point devient vert, et les derniers messages du chat s'affichent sous le bouton.
3. Choisis un jeu, règle-le, puis **Lancer la partie**.
4. Partage l'écran du téléphone dans le live.

Pendant la partie, les petits boutons en bas permettent de mettre en pause, de passer et d'arrêter.

⚠️ La clé API est enregistrée uniquement dans le navigateur du téléphone. Ne la mets jamais dans le code.

### Si le chat ne marche pas
- « Ce compte n'est pas en live » : la connexion ne marche que pendant un live.
- Le point est vert mais les votes ne comptent pas : regarde la liste des messages sous le bouton **Se connecter**. Si elle reste vide alors que le chat bouge, Euler Stream a peut-être changé son format de messages. Le décodage se trouve dans `parseChatMessage` (`js/chat.js`).
