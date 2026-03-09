import OBR from '@owlbear-rodeo/sdk';
import './style.css';

/**
 * Popover manager - used by both GM and Players to display rewards
 */
class FanfareManager {
  constructor() {
    this.popovers = new Map();
    this.lastPopoverId = null;
    console.log('[Fanfare] FanfareManager initialized');
  }

  async showPopover(payload) {
    try {
      console.log('[Fanfare] showPopover called with payload:', payload);
      
      // Close previous popover if it exists
      if (this.lastPopoverId) {
        console.log('[Fanfare] Closing previous popover:', this.lastPopoverId);
        try {
          await OBR.popover.close(this.lastPopoverId);
          console.log('[Fanfare] Previous popover closed successfully');
        } catch (err) {
          console.warn('[Fanfare] Error closing previous popover:', err);
        }
      }
      
      const popoverId = 'fanfare-rewards';
      console.log('[Fanfare] Using popover ID:', popoverId);
      
      const dataParam = encodeURIComponent(JSON.stringify(payload));
      const url = `/popover-content.html?data=${dataParam}`;
      console.log('[Fanfare] Popover URL:', url);

      const width = await OBR.viewport.getWidth();

      await OBR.popover.open({
        id: popoverId,
        url: url,
        width: 700,
        height: 300,
        anchorPosition: { left: width / 2, top: 20 },
        anchorOrigin: { horizontal: 'CENTER', vertical: 'TOP' },
        transformOrigin: { horizontal: 'CENTER', vertical: 'TOP' },
        anchorReference: 'POSITION',
        disableClickAway: true,
        marginThreshold: 10,
        hidePaper: true
      });

      console.log('[Fanfare] Popover opened successfully!');
      this.lastPopoverId = popoverId;

      this.popovers.set(popoverId, payload);
      console.log('[Fanfare] Popover stored. Total popovers:', this.popovers.size);
    } catch (error) {
      console.error('[Fanfare] Failed to open popover:', error);
    }
  }
}

// State
let context = null;
let userRole = null;
let lootItems = [];
let fanfare = null;

// DOM Elements
const currentXpInput = document.querySelector('#currentXp');
const newXpInput = document.querySelector('#newXp');
const maxXpInput = document.querySelector('#maxXp');
const previewBar = document.querySelector('#previewBar');
const previewText = document.querySelector('#previewText');
const itemNameInput = document.querySelector('#itemName');
const itemQuantityInput = document.querySelector('#itemQuantity');
const itemRaritySelect = document.querySelector('#itemRarity');
const addItemBtn = document.querySelector('#addItemBtn');
const lootListContainer = document.querySelector('#lootList');
const broadcastBtn = document.querySelector('#broadcastBtn');
const previewBtn = document.querySelector('#previewBtn');
const resetBtn = document.querySelector('#resetBtn');
const exampleBtn = document.querySelector('#exampleBtn');
const statusEl = document.querySelector('#status');
const includeXpCheckbox = document.querySelector('#includeXp');
const includeLootCheckbox = document.querySelector('#includeLoot');
const popoverTitleInput = document.querySelector('#popoverTitle');
const popoverSubtitleInput = document.querySelector('#popoverSubtitle');
const saveTargetSelect = document.querySelector('#saveTarget');
const autoSaveCheckbox = document.querySelector('#autoSave');
const saveBtn = document.querySelector('#saveBtn');

// Utility: Show status message
function showStatus(message, type = 'info') {
  if (!statusEl) return; // Safely handle missing element
  statusEl.textContent = message;
  statusEl.className = `status show ${type}`;
  setTimeout(() => statusEl.classList.remove('show'), 3000);
}

// Utility: Update XP bar preview
function updateXpPreview() {
  if (!newXpInput || !previewBar || !previewText || !maxXpInput) return; // Safely handle missing elements
  const maxXp = Math.max(1, parseInt(maxXpInput.value) || 100);
  const newValue = Math.max(0, parseInt(newXpInput.value) || 0);
  const percentage = Math.min(100, Math.round((newValue / maxXp) * 100));
  console.log(`[Fanfare MJ] XP preview updated: ${newValue}/${maxXp} = ${percentage}%`);
  previewBar.style.width = percentage + '%';
  previewText.textContent = percentage + '%';
}

// Utility: Render loot list
function renderLootList() {
  if (!lootListContainer) return; // Safely handle missing element
  if (lootItems.length === 0) {
    lootListContainer.innerHTML = '<div class="empty-state">No items added</div>';
    return;
  }

  lootListContainer.innerHTML = lootItems.map((item, index) => `
    <div class="loot-item ${item.rarity}">
      <div class="loot-item-info">
        <div class="loot-item-name">${item.name}</div>
        <div class="loot-item-meta">
          Qty: <strong>${item.quantity}</strong>
          <span class="loot-item-rarity">${getRarityLabel(item.rarity)}</span>
        </div>
      </div>
      <button class="btn-remove" onclick="removeItem(${index})">Remove</button>
    </div>
  `).join('');
}

// Utility: Get rarity display label
function getRarityLabel(rarity) {
  const labels = {
    'common': 'Common',
    'uncommon': 'Uncommon',
    'rare': 'Rare',
    'very-rare': 'Very Rare',
    'legendary': 'Legendary'
  };
  return labels[rarity] || rarity;
}

// Add loot item
function addItem() {
  const name = itemNameInput.value.trim();
  const quantity = Math.max(1, parseInt(itemQuantityInput.value) || 1);
  const rarity = itemRaritySelect.value;

  if (!name) {
    console.warn('[Fanfare MJ] Item name is empty');
    showStatus('Enter item name', 'error');
    itemNameInput.focus();
    return;
  }

  const newItem = { name, quantity, rarity };
  console.log('[Fanfare MJ] Adding item:', newItem);
  lootItems.push(newItem);
  console.log('[Fanfare MJ] Total items in loot:', lootItems.length);
  itemNameInput.value = '';
  itemQuantityInput.value = '1';
  itemRaritySelect.value = 'common';
  
  renderLootList();
  showStatus('Item added!', 'success');
  itemNameInput.focus();
}

// Remove loot item
window.removeItem = function(index) {
  console.log('[Fanfare MJ] Removing item at index:', index);
  lootItems.splice(index, 1);
  console.log('[Fanfare MJ] Items remaining:', lootItems.length);
  renderLootList();
  showStatus('Item removed', 'info');
};

// Load example items
function loadExampleItems() {
  console.log('[Fanfare MJ] Loading example items');
  lootItems = [
    { name: 'Bouteille d\'huile', quantity: 1, rarity: 'uncommon' },
    { name: 'Papier Toilette', quantity: 1, rarity: 'rare' },
    { name: 'Éponges', quantity: 2, rarity: 'common' },
    { name: 'Raviolis', quantity: 5, rarity: 'very-rare' },
    { name: 'Sandwich au poulet', quantity: 1, rarity: 'legendary' }
  ];
  console.log('[Fanfare MJ] Example items loaded:', lootItems.length);
  renderLootList();
  showStatus('Example items loaded!', 'success');
}

// Build payload for broadcast
function buildPayload() {
  const maxXp = Math.max(1, parseInt(maxXpInput.value) || 100);
  const currentXp = Math.max(0, parseInt(currentXpInput.value) || 0);
  const newXp = Math.max(0, parseInt(newXpInput.value) || 50);
  
  // Calculate percentages from arbitrary values
  const currentPercent = Math.min(100, Math.round((currentXp / maxXp) * 100));
  const newPercent = Math.min(100, Math.round((newXp / maxXp) * 100));

  const includeXp = !includeXpCheckbox || includeXpCheckbox.checked;
  const includeLoot = !includeLootCheckbox || includeLootCheckbox.checked;
  const title = (popoverTitleInput && popoverTitleInput.value.trim()) || '🎉 Rewards';
  const subtitle = (popoverSubtitleInput && popoverSubtitleInput.value.trim()) || '';

  const payload = {
    type: 'fanfare_endofencounter',
    title: title,
    subtitle: subtitle,
    xp: includeXp ? {
      current: currentPercent,
      new: newPercent
    } : null,
    loot: includeLoot ? [...lootItems] : [],
    timestamp: Date.now()
  };
  console.log('[Fanfare MJ] Payload built:', payload);
  return payload;
}

// Broadcast to players
async function broadcastToPlayers() {
  console.log('[Fanfare MJ] Broadcast button clicked');

  if (!context) {
    console.warn('[Fanfare MJ] Context is not available (but continuing...)');
  }

  try {
    broadcastBtn.disabled = true;
    const payload = buildPayload();
    console.log('[Fanfare MJ] Sending broadcast with payload:', payload);
    
    await OBR.broadcast.sendMessage('com.sewef.fanfare', {
      fanfare_endofencounter: payload
    }, { destination: "ALL" });
    console.log('[Fanfare MJ] Broadcast sent successfully!');
    showStatus('✓ Sent to players!', 'success');
    
    // Show popover to GM (non-blocking)
    console.log('[Fanfare MJ] Showing popover to GM');
    if (fanfare) {
      fanfare.showPopover(payload).catch((err) => {
        console.warn('[Fanfare MJ] Error showing popover:', err);
      });
    }

    // Auto save if enabled
    if (autoSaveCheckbox && autoSaveCheckbox.checked) {
      console.log('[Fanfare MJ] Auto saving config');
      await saveConfig();
    }
  } catch (error) {
    console.error('[Fanfare MJ] Broadcast error:', error);
    showStatus('Broadcast error', 'error');
  } finally {
    broadcastBtn.disabled = false;
  }
}

// Preview popover (for testing)
function previewPopover() {
  const payload = buildPayload();
  console.log('Preview payload:', payload);
  showStatus('Preview payload (see console)', 'info');
}

// Reset form
function resetForm() {
  currentXpInput.value = '0';
  newXpInput.value = '50';
  maxXpInput.value = '100';
  itemNameInput.value = '';
  itemQuantityInput.value = '1';
  itemRaritySelect.value = 'common';
  if (popoverTitleInput) popoverTitleInput.value = '🎉 Rewards';
  if (popoverSubtitleInput) popoverSubtitleInput.value = '';
  lootItems = [];
  renderLootList();
  updateXpPreview();
  showStatus('Reset', 'info');
}

// Save config to OBR metadata
async function saveConfig() {
  if (!saveTargetSelect || saveTargetSelect.value === 'none') {
    console.warn('[Fanfare MJ] Save target is disabled');
    showStatus('Save target disabled', 'info');
    return;
  }

  try {
    const configData = {
      title: (popoverTitleInput?.value || '🎉 Rewards').trim(),
      subtitle: (popoverSubtitleInput?.value || '').trim(),
      maxXp: Math.max(1, parseInt(maxXpInput?.value || 100)),
      current: Math.max(0, parseInt(currentXpInput?.value || 0)),
      new: Math.max(0, parseInt(newXpInput?.value || 50)),
      saveTarget: saveTargetSelect.value,
      autoSave: autoSaveCheckbox?.checked || false
    };

    if (saveTargetSelect.value === 'scene') {
      await OBR.scene.setMetadata({
        'com.sewef.fanfare': configData
      });
      console.log('[Fanfare MJ] Config saved to scene:', configData);
      showStatus('✓ Config saved to scene!', 'success');
    } else if (saveTargetSelect.value === 'room') {
      // Room metadata saving
      await OBR.room.setMetadata({
        'com.sewef.fanfare': configData
      });
      console.log('[Fanfare MJ] Config saved to room:', configData);
      showStatus('✓ Config saved to room!', 'success');
    }

    // Broadcast config update notification to all GMs
    await OBR.broadcast.sendMessage('com.sewef.fanfare', {
      config_updated: {
        updatedAt: Date.now()
      }
    }, { destination: "REMOTE" });
    console.log('[Fanfare MJ] Config update notification broadcast');
  } catch (error) {
    console.error('[Fanfare MJ] Error saving config:', error);
    showStatus('Save error', 'error');
  }
}

// Load config from OBR metadata
async function loadConfig() {
  try {
    let configData = null;

    // Try to load from saved target preference
    const savedTarget = localStorage.getItem('fanfare-save-target') || 'none';
    saveTargetSelect.value = savedTarget;

    if (savedTarget === 'scene') {
      const metadata = await OBR.scene.getMetadata();
      configData = metadata['com.sewef.fanfare'];
    } else if (savedTarget === 'room') {
      const metadata = await OBR.room.getMetadata();
      configData = metadata['com.sewef.fanfare'];
    }

    if (configData) {
      console.log('[Fanfare MJ] Config loaded:', configData);
      if (popoverTitleInput && configData.title) popoverTitleInput.value = configData.title;
      if (popoverSubtitleInput && configData.subtitle) popoverSubtitleInput.value = configData.subtitle;
      if (maxXpInput && configData.maxXp) maxXpInput.value = configData.maxXp;
      if (currentXpInput && configData.current) currentXpInput.value = configData.current;
      if (newXpInput && configData.new) newXpInput.value = configData.new;
      if (autoSaveCheckbox && configData.autoSave) autoSaveCheckbox.checked = configData.autoSave;
      updateXpPreview();
      console.log('[Fanfare MJ] Config restored');
    }
  } catch (error) {
    console.warn('[Fanfare MJ] Could not load config:', error);
  }
}

// Event listeners - only attach if elements exist (GM mode)
if (currentXpInput) currentXpInput.addEventListener('change', updateXpPreview);
if (newXpInput) newXpInput.addEventListener('input', updateXpPreview);
if (maxXpInput) maxXpInput.addEventListener('input', updateXpPreview);
if (addItemBtn) addItemBtn.addEventListener('click', addItem);
if (exampleBtn) exampleBtn.addEventListener('click', loadExampleItems);
if (broadcastBtn) broadcastBtn.addEventListener('click', broadcastToPlayers);
if (previewBtn) previewBtn.addEventListener('click', previewPopover);
if (resetBtn) resetBtn.addEventListener('click', resetForm);
if (saveBtn) saveBtn.addEventListener('click', saveConfig);
if (saveTargetSelect) saveTargetSelect.addEventListener('change', () => {
  localStorage.setItem('fanfare-save-target', saveTargetSelect.value);
});

// Enter key to add item
if (itemNameInput) {
  itemNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
}

// Get the control panel element
const appContainer = document.querySelector('.container');

// Initialize with OBR
OBR.onReady(async () => {
  try {
    console.log('[Fanfare] Extension ready! OBR context initialized');
    
    // Get user role - try different methods for compatibility
    try {
      userRole = (await OBR.player.getRole?.()) || 'GM'; // Default to GM if getRole fails
      console.log('[Fanfare] User role (via OBR.getRole):', userRole);
    } catch (roleError) {
      console.warn('[Fanfare] Could not determine role, defaulting to GM:', roleError);
      userRole = 'GM';
    }
    
    // Initialize popover manager for all users
    fanfare = new FanfareManager();
    
    context = true;
    
    if (userRole === 'GM') {
      console.log('[Fanfare] GM mode - showing control panel');      // Load saved config
      await loadConfig();      updateXpPreview();
      renderLootList();
      showStatus('GM Mode: Rewards Broadcaster Ready', 'success');
    } else {
      console.log('[Fanfare] Player mode - hiding control panel and showing joke');
      // Hide the entire interface for players and show a joke
      if (appContainer) {
        appContainer.innerHTML = `
          <div style="text-align: center; padding: 3em 2em; color: #999;">
            <div style="font-size: 3em; margin-bottom: 1em;">❌</div>
            <h2 style="color: #ccc; font-size: 1.5em; margin-bottom: 0.5em;">Access Denied</h2>
            <p style="font-size: 1em; color: #888; margin-bottom: 2em;">Only the Game Master can distribute rewards...</p>
            <p style="font-size: 0.9em; color: #666; font-style: italic;">But hey, you can still hope! 🤞</p>
          </div>
        `;
      }
      showStatus('Player Mode: No Access (Nice Try!)', 'info');
    }
    
    console.log('[Fanfare] UI initialized successfully');
    
    // Register broadcast listener AFTER OBR is ready
    OBR.broadcast.onMessage('com.sewef.fanfare', (message) => {
      console.log('[Fanfare] Received broadcast message:', message);
      
      // Handle fan fare end of encounter broadcasts
      if (message.data?.fanfare_endofencounter) {
        console.log('[Fanfare] Valid fanfare_endofencounter message, showing popover');
        if (fanfare) {
          fanfare.showPopover(message.data.fanfare_endofencounter);
        } else {
          console.warn('[Fanfare] FanfareManager not yet initialized!');
        }
      }
      
      // Handle config updates (notify other GMs)
      if (message.data?.config_updated && userRole === 'GM') {
        console.log('[Fanfare] Config updated notification received, reloading config');
        loadConfig();
        showStatus('Config updated by another GM', 'info');
      }
    });
    console.log('[Fanfare] Broadcast listener registered');
  } catch (error) {
    console.error('[Fanfare] Failed to initialize OBR context:', error);
    showStatus('Initialization error', 'error');
  }
});
