# 🎉 Fanfare

A stunning rewards broadcaster extension for **OWL Bear Rodeo** that brings excitement to your gaming sessions!

Display XP progression and loot drops to your players with beautiful animations, theme-aware styling, and seamless integration.

## ✨ Features

- **XP Progress Bars** - Animated XP progression with smooth transitions
- **Loot Distribution** - Display item drops with rarity-based styling (Common, Uncommon, Rare, Very Rare, Legendary)
- **Theme Awareness** - Automatically adapts to OWL Bear's light and dark themes
- **Responsive Design** - Works beautifully on all screen sizes
- **Export/Import** - Save and load loot configurations as JSON
- **Auto-Save** - Optional automatic config saving to Scene or Room metadata
- **Beautiful Animations** - Smooth popover animations, XP bar fills, and loot item reveals
- **Customizable Headers** - Add custom titles and subtitles to your reward broadcasts
- **Local Preview** - Test popover appearance before broadcasting to players

## 🚀 Quick Start

### Installation

1. Clone or download this repository
2. Get the manifest URL from `public/manifest.json`
3. Add the extension to OWL Bear Rodeo via the extension menu

### Basic Usage

1. **Open the extension** - GMs see the control panel, players see a joke message
2. **Set up rewards:**
   - Configure XP current/new values and max XP
   - Add loot items with names, quantities, and rarity levels
3. **Customize:**
   - Edit popover title and subtitle
   - Toggle XP bar and loot display
4. **Send:**
   - Click "🎯 Send" to broadcast to all players
   - Click "👁️ Preview" to see the popover yourself first

## 🎮 GM Features

### XP Bar Configuration
- **Max XP**: Total XP for the level
- **Current XP**: Starting percentage (0% to 100%)
- **New XP**: Ending percentage (0% to 100%)
- Includes difference indicator (+50%, -25%, etc.)

### Loot Management
- **Quick Add**: Enter item name, select quantity and rarity
- **Demo Mode**: Load example items instantly
- **Export JSON**: Save your loot configuration for later
- **Import JSON**: Load previously saved configurations

### Configuration Save
- **Save Targets**: Store config to Scene or Room metadata
- **Auto-Save**: Automatically save when broadcasting
- **Persistent**: Configs persist across sessions

## 📊 Loot Rarity Levels

- 🟩 **Common** - Gray, basic items
- 🟦 **Uncommon** - Green, more valuable
- 🟪 **Rare** - Blue, powerful items
- 🟨 **Very Rare** - Purple, legendary quality
- 🟧 **Legendary** - Orange, mythic items

Each rarity has unique colors and glowing auras in the popover.

## 🎨 Popover Features

### Header
- Customizable title and subtitle
- Smooth shimmer animation
- Close button for players

### XP Section
- Animated progress bar (2 second fill)
- Current/New percentage display
- XP difference indicator
- Gradient fill with glow effects

### Loot Section
- Grid layout (auto-fitting items)
- Rarity-based color coding
- Staggered reveal animations
- Item name and quantity display
- Quantity badges with theme colors

### Theme Support
- Dark theme: Deep grays and vibrant purples
- Light theme: Adapts to OWL Bear's light palette
- Automatic theme switching
- Custom CSS variables for easy customization

## ⌨️ Keyboard Shortcuts

- **Enter** in item name field: Add item to loot table
- **Ctrl+C**: Copy exported JSON (in export modal)
- **Ctrl+V**: Paste JSON (in import modal)

## 📱 JSON Format

### Export Format
```json
[
  {
    "name": "Sword of Power",
    "quantity": 1,
    "rarity": "legendary"
  },
  {
    "name": "Gold Coins",
    "quantity": 100,
    "rarity": "common"
  }
]
```

Copy the exported JSON to share configurations with other GMs.

## 🔧 Configuration

### GM Settings
- **Popover Title**: Customize the rewards header (default: "🎉 Rewards")
- **Popover Subtitle**: Add context to rewards (optional)
- **Include XP Bar**: Toggle XP progression display
- **Include Loot**: Toggle loot drops display
- **Auto-Save on Send**: Automatically save config when broadcasting

### Save Targets
- **Disabled** (default): Don't save automatically
- **Scene**: Save config to current scene (all players see it)
- **Room**: Save config to room metadata (persists across scenes)

## 🎯 Broadcasting

### Local Preview
- Click "👁️ Preview" to see the popover on **your screen only**
- Does NOT send to other players
- Useful for testing before broadcasting

### Broadcast to All Players
- Click "🎯 Send" to display rewards to **all players**
- Popover appears as a modal overlay
- Players can close the popover

## 🎨 Customization

### Colors
Edit `src/style.css` root variables:
```css
:root {
  --primary: #6f42c1;
  --bg: #1a1a1a;
  --text: #ffffff;
  /* ... */
}
```

The extension automatically applies OWL Bear's theme colors.

### Animations
- XP bar fills over 2 seconds
- Loot items stagger reveal at 100ms intervals
- Smooth popover open/close transitions
- Glow and pulse effects on interactive elements

## 🛠️ Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Project Structure
```
Fanfare/
├── index.html              # GM control panel
├── popover-content.html    # Player popover view
├── src/
│   ├── main.js            # GM logic & theme manager
│   ├── popover-content.js # Popover logic & renderer
│   ├── style.css          # GM styles
│   └── player-styles.css  # Popover styles
├── public/
│   ├── manifest.json      # Extension manifest
│   └── store.md          # OWL Bear store listing
└── vite.config.js         # Build configuration
```

## 📋 API Integration

Built with the **OWL Bear Rodeo SDK**:
- `OBR.broadcast` - Send messages to players
- `OBR.popover` - Display reward popovers
- `OBR.theme` - Detect and adapt to theme changes
- `OBR.scene` / `OBR.room` - Store configurations
- `OBR.viewport` - Position popovers dynamically

## 🐛 Known Limitations

- Clipboard API is restricted in OWL Bear's iframe; fallback to Ctrl+C/Ctrl+V
- Popover position is fixed at broadcast time (reloading page may shift it)
- Configuration save requires GM permissions

## 📖 Tips & Tricks

1. **Reusable Configs**: Export loot templates and import them for future sessions
2. **Batch Rewards**: Set up all rewards before broadcasting for consistency
3. **Theme Testing**: Change OWL Bear's theme in settings to see real-time adaptation
4. **Demo Items**: Use "Demo" button to populate example rewards for testing

## 🤝 Contributing

Pull requests welcome! Feel free to:
- Report bugs
- Suggest features
- Improve animations
- Add new rarity types

## 📄 License

MIT License - Feel free to use and modify for your own games!

---

**Made with 🎉 for OWL Bear Rodeo gamers everywhere!**

For issues or feature requests, please check the GitHub repository.
