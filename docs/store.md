---
title: Fanfare
description: A stunning rewards broadcaster for OWL Bear Rodeo that brings excitement to your gaming sessions. Display XP progression and loot drops to your players with beautiful animations, theme-aware styling, and seamless integration. Features animated XP bars, rarity-based loot items, dark/light theme support, export/import configurations, and customizable headers.
author: Sewef
image: https://fanfare.onrender.com/image.png
icon: 
tags:
  - other
manifest: https://fanfare.onrender.com/manifest.json
learn-more: https://github.com/Sewef/Fanfare
---

# Fanfare

## Overview

Fanfare is a stunning rewards broadcaster extension for OWL Bear Rodeo that brings excitement to your gaming sessions. Display XP progression and loot drops to your players with style!

## Key Features

- **Animated XP Progress Bars** - Smooth 2-second fill animations with visual difference indicators, toggleable
- **Rarity-Based Loot Distribution** - Color-coded items (Common, Uncommon, Rare, Very Rare, Legendary)
- **Beautiful Animations** - Smooth popover animations with staggered item reveals
- **Export/Import Configurations** - Save and load your reward setups as JSON
- **Auto-Save** - Automatically save configurations to Scene or Room metadata
- **Customizable Headers** - Add custom titles and subtitles to your broadcasts
- **Local Preview** - Test popover appearance before broadcasting to players
- **Responsive Design** - Works seamlessly on all screen sizes
- **SWAG**

## Example Configuration

You can manage your reward configurations in JSON format. Click the **Demo** button to load example items and immediately export the configuration to see the exact syntax:

```json
[
  {
    "name": "Bouteille d'huile",
    "quantity": 1,
    "rarity": "uncommon"
  },
  {
    "name": "Papier Toilette",
    "quantity": 1,
    "rarity": "rare"
  },
  {
    "name": "Éponges",
    "quantity": 2,
    "rarity": "common"
  },
  {
    "name": "Raviolis",
    "quantity": 5,
    "rarity": "very-rare"
  },
  {
    "name": "Sandwich au poulet",
    "quantity": 1,
    "rarity": "legendary"
  }
]
```

**Tip:** Use the **Demo Mode** button to instantly load example items, then click **Export JSON** to copy the configuration format directly!
