# 🎉 Fanfare - Extension Owlbear Rodeo

Une extension pour **Owlbear Rodeo** qui permet à un Maître de Jeu d'envoyer des récompenses de fin de rencontre aux joueurs avec des animations spectaculaires !

## ✨ Fonctionnalités

### Pour le MJ (interface d'administration)
- **Barre d'XP animée** : Configurez la progression du niveau avec une animation fluide
  - Valeur actuelle en pourcentage
  - Nouvelle valeur en pourcentage
  - Aperçu en temps réel
  
- **Système de loot** : Ajoutez des objets avec leurs propriétés
  - Nom de l'objet
  - Quantité
  - Rareté (Commune, Peu commune, Rare, Très rare, Légendaire)
  
- **Broadcast** : Envoyez les récompenses aux joueurs directement via OBR.broadcast

### Pour les Joueurs
- **Popover animé** qui apparaît au centre de l'écran
- Animation d'entrée dynamique et fluide
- Barre XP avec animation de remplissage
- Liste de butin avec animations décalées
- Codes couleur par rareté
- Gestion des fermetures (manuel ou automatique après 10 secondes)

## 🛠️ Installation

### Prérequis
- Node.js 18+
- npm

### Setup
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Builder pour la production
npm run build
```

## 📋 Structure du Projet

```
fanfare/
├── index.html           # Interface du MJ (admin)
├── player.html          # Vue joueurs (popover)
├── vite.config.js       # Configuration Vite
├── package.json         # Dépendances
└── src/
    ├── main.js          # Logique de l'interface MJ
    ├── player.js        # Logique du popover joueurs
    ├── style.css        # Styles de l'interface MJ
    └── player-styles.css # Styles du popover joueurs
```

## 🚀 Configuration Owlbear

Pour enregistrer l'extension dans Owlbear Rodeo, vous devez créer un manifest file ou configurer l'URL de votre extension.

### Option 1 : Mode développement
1. Ouvrez Owlbear Rodeo
2. Allez dans les paramètres de l'extension
3. Ajoutez une extension personnalisée avec :
   - **URL Admin** : `http://localhost:5173` (ou votre URL de dev)
   - **URL Player** : `http://localhost:5173/player.html`

### Option 2 : Installation en production
Déployez sur un serveur (Vercel, Netlify, etc.) et utilisez les URLs de production.

## 📡 Utilisation

### Du côté du MJ

1. **Configurer la barre XP**
   - Entrez la valeur actuelle (0-100%)
   - Entrez la nouvelle valeur (0-100%)
   - Voir l'aperçu en temps réel

2. **Ajouter du loot**
   - Entrez le nom de l'objet
   - Choisissez la quantité
   - Sélectionnez la rareté
   - Cliquez "Ajouter objet"

3. **Envoyer aux joueurs**
   - Cliquez le bouton "🎯 Envoyer aux joueurs"
   - Le popover animé s'affichera chez tous les joueurs

### Du côté des Joueurs
- Le popover s'affiche automatiquement quand le MJ envoie
- La barre XP s'anime de l'ancienne vers la nouvelle valeur
- Les objets de loot apparaissent en cascade
- Fermeture manuelle ou automatique après 10 secondes

## 🎨 Système de Rareté

Chaque rareté a sa propre couleur :
- **Commune** : Gris (#9a9a9a)
- **Peu commune** : Vert (#1eff00)
- **Rare** : Bleu (#0070dd)
- **Très rare** : Violet (#a335ee)
- **Légendaire** : Orange (#ff8000)

## 🔧 Customisation

### Modifier les couleurs
Éditez les variables CSS dans `src/style.css` et `src/player-styles.css` :
```css
:root {
  --primary: #6f42c1;    /* Violet primaire */
  --color-legendary: #ff8000;  /* Orange légendaire */
  /* ... */
}
```

### Modifier les durées d'animation
Dans `src/player-styles.css`, cherchez les `@keyframes` et ajustez les durées.

### Ajouter des rarités
1. Ajoutez la nouvelle option dans `index.html` (select #itemRarity)
2. Ajoutez la couleur dans les variables CSS
3. Mettez à jour `getRarityLabel()` dans `main.js` et `player.js`

## 🐛 Dépannage

### Le popover n'apparaît pas
- Vérifiez que vous avez bien configuré l'URL Player correctement
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que OBR.broadcast fonctionne

### Les animations sont lentes
- Vérifiez votre connexion réseau
- Réduisez les durées des animations dans le CSS
- Vérifiez les performances du navigateur

### L'interface MJ ne s'affiche pas
- Redémarrez le serveur dev (`npm run dev`)
- Vérifiez que le port 5173 est disponible
- Videz le cache du navigateur

## 📝 Format du Payload

Quand vous envoyez les récompenses, voici le format du message :

```javascript
{
  type: 'fanfare_endofencounter',
  xp: {
    current: 30,    // Pourcentage actuel
    new: 75         // Nouveau pourcentage
  },
  loot: [
    {
      name: 'Épée de Flamme',
      quantity: 1,
      rarity: 'legendary'
    },
    {
      name: 'Potion de Soin',
      quantity: 5,
      rarity: 'common'
    }
  ],
  timestamp: 1710000000000
}
```

## 🎯 Fonctionnalités Futures

- [ ] Son et effets sonores
- [ ] Animations de confettis
- [ ] Système de messages personnalisés
- [ ] Sauvegarde des présets de loot courants
- [ ] Intégration avec les feuilles de personnages
- [ ] Historique des récompenses
- [ ] Animations au choix (discrete, fancy, epic, etc.)

## 📄 Licence

MIT

## 👤 Auteur

Créé pour les amoureux de jeux de rôle sur Owlbear Rodeo !

---

**Besoin d'aide ?** Consultez la [documentation Owlbear SDK](https://sdk.owlbear.rodeo/)
