import OBR from '@owlbear-rodeo/sdk';
import './style.css';

/**
 * Theme manager - Apply OWL Bear theme colors to the extension
 */
function applyTheme(theme) {
  const isDark = theme.mode === 'DARK';
  const root = document.documentElement;
  
  if (isDark) {
    // Dark theme (use OWL Bear colors)
    root.style.setProperty('--primary', theme.primary.main);
    root.style.setProperty('--primary-dark', theme.primary.dark);
    root.style.setProperty('--secondary', theme.secondary.main);
    root.style.setProperty('--bg', theme.background.default);
    root.style.setProperty('--surface', theme.background.paper);
    root.style.setProperty('--surface-light', theme.background.paper);
    root.style.setProperty('--text', theme.text.primary);
    root.style.setProperty('--text-muted', theme.text.secondary);
    root.style.setProperty('--border', theme.secondary.dark);
  } else {
    // Light theme (adjusted for readability)
    root.style.setProperty('--primary', theme.primary.main);
    root.style.setProperty('--primary-dark', theme.primary.dark);
    root.style.setProperty('--secondary', theme.secondary.main);
    root.style.setProperty('--bg', theme.background.default);
    root.style.setProperty('--surface', theme.background.paper);
    // For light theme, use paper for input backgrounds (typically white/very light)
    root.style.setProperty('--surface-light', theme.background.paper);
    root.style.setProperty('--text', theme.text.primary);
    root.style.setProperty('--text-muted', theme.text.secondary);
    root.style.setProperty('--border', theme.secondary.light);
  }
  
  // console.log('[Fanfare] Theme applied:', theme.mode);
}

/**
 * Popover manager - used by both GM and Players to display rewards
 */
class FanfareManager {
  constructor() {
    this.popovers = new Map();
    this.lastPopoverId = null;
    // console.log('[Fanfare] FanfareManager initialized');
  }

  async showPopover(payload) {
    try {
      // console.log('[Fanfare] showPopover called with payload:', payload);
      
      // Close previous popover if it exists
      if (this.lastPopoverId) {
        // console.log('[Fanfare] Closing previous popover:', this.lastPopoverId);
        try {
          await OBR.popover.close(this.lastPopoverId);
          // console.log('[Fanfare] Previous popover closed successfully');
        } catch (err) {
          console.warn('[Fanfare] Error closing previous popover:', err);
        }
      }
      
      const popoverId = 'fanfare-rewards';
      // console.log('[Fanfare] Using popover ID:', popoverId);
      
      const dataParam = encodeURIComponent(JSON.stringify(payload));
      const url = `/popover-content.html?data=${dataParam}`;
      // console.log('[Fanfare] Popover URL:', url);

      const width = await OBR.viewport.getWidth();

      await OBR.popover.open({
        id: popoverId,
        url: url,
        width: 700,
        height: 320,
        anchorPosition: { left: width / 2, top: 20 },
        anchorOrigin: { horizontal: 'CENTER', vertical: 'TOP' },
        transformOrigin: { horizontal: 'CENTER', vertical: 'TOP' },
        anchorReference: 'POSITION',
        disableClickAway: true,
        marginThreshold: 10,
        hidePaper: true
      });

      // console.log('[Fanfare] Popover opened successfully!');
      this.lastPopoverId = popoverId;

      this.popovers.set(popoverId, payload);
      // console.log('[Fanfare] Popover stored. Total popovers:', this.popovers.size);
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

// Export/Import JSON elements
const exportJsonBtn = document.querySelector('#exportJsonBtn');
const importJsonBtn = document.querySelector('#importJsonBtn');
const exportJsonModal = document.querySelector('#exportJsonModal');
const importJsonModal = document.querySelector('#importJsonModal');
const exportJsonText = document.querySelector('#exportJsonText');
const importJsonText = document.querySelector('#importJsonText');
const copyExportBtn = document.querySelector('#copyExportBtn');
const pasteImportBtn = document.querySelector('#pasteImportBtn');
const confirmImportBtn = document.querySelector('#confirmImportBtn');
const exportJsonClose = document.querySelector('#exportJsonClose');
const importJsonClose = document.querySelector('#importJsonClose');
const closeExportBtn = document.querySelector('#closeExportBtn');
const closeImportBtn = document.querySelector('#closeImportBtn');

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
  // console.log(`[Fanfare DM] XP preview updated: ${newValue}/${maxXp} = ${percentage}%`);
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
    console.warn('[Fanfare DM] Item name is empty');
    showStatus('Enter item name', 'error');
    itemNameInput.focus();
    return;
  }

  const newItem = { name, quantity, rarity };
  // console.log('[Fanfare DM] Adding item:', newItem);
  lootItems.push(newItem);
  // console.log('[Fanfare DM] Total items in loot:', lootItems.length);
  itemNameInput.value = '';
  itemQuantityInput.value = '1';
  itemRaritySelect.value = 'common';
  
  renderLootList();
  showStatus('Item added!', 'success');
  itemNameInput.focus();
}

// Remove loot item
window.removeItem = function(index) {
  // console.log('[Fanfare DM] Removing item at index:', index);
  lootItems.splice(index, 1);
  // console.log('[Fanfare DM] Items remaining:', lootItems.length);
  renderLootList();
  showStatus('Item removed', 'info');
};

// Load example items
function loadExampleItems() {
  // console.log('[Fanfare DM] Loading example items');
  lootItems = [
    { name: 'Bouteille d\'huile', quantity: 1, rarity: 'uncommon' },
    { name: 'Papier Toilette', quantity: 1, rarity: 'rare' },
    { name: 'Éponges', quantity: 2, rarity: 'common' },
    { name: 'Raviolis', quantity: 5, rarity: 'very-rare' },
    { name: 'Sandwich au poulet', quantity: 1, rarity: 'legendary' }
  ];
  // console.log('[Fanfare DM] Example items loaded:', lootItems.length);
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
  // console.log('[Fanfare DM] Payload built:', payload);
  return payload;
}

// Broadcast to players
async function broadcastToPlayers() {
  // console.log('[Fanfare DM] Broadcast button clicked');

  if (!context) {
    console.warn('[Fanfare DM] Context is not available (but continuing...)');
  }

  try {
    broadcastBtn.disabled = true;
    const payload = buildPayload();
    // console.log('[Fanfare DM] Sending broadcast with payload:', payload);
    
    await OBR.broadcast.sendMessage('com.sewef.fanfare', {
      fanfare_endofencounter: payload
    }, { destination: "ALL" });
    // console.log('[Fanfare DM] Broadcast sent successfully!');
    showStatus('✓ Sent to players!', 'success');
    
    // Show popover to GM (non-blocking)
    // console.log('[Fanfare DM] Showing popover to GM');
    if (fanfare) {
      fanfare.showPopover(payload).catch((err) => {
        console.warn('[Fanfare DM] Error showing popover:', err);
      });
    }

    // Auto save if enabled
    if (autoSaveCheckbox && autoSaveCheckbox.checked) {
      // console.log('[Fanfare DM] Auto saving config');
      await saveConfig();
    }
  } catch (error) {
    console.error('[Fanfare DM] Broadcast error:', error);
    showStatus('Broadcast error', 'error');
  } finally {
    broadcastBtn.disabled = false;
  }
}

// Modal management functions
function openModal(modal) {
  if (modal) modal.classList.add('show');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('show');
}

// Export loot as JSON
function exportLootJson() {
  const json = JSON.stringify(lootItems, null, 2);
  exportJsonText.value = json;
  openModal(exportJsonModal);
  // console.log('[Fanfare DM] Loot exported as JSON:', json);
}

// Import loot from JSON
function importLootJson() {
  try {
    const json = importJsonText.value.trim();
    if (!json) {
      showStatus('Please paste JSON content', 'error');
      return;
    }

    const importedItems = JSON.parse(json);
    
    if (!Array.isArray(importedItems)) {
      showStatus('JSON must be an array of items', 'error');
      return;
    }

    // Validate items
    const validItems = importedItems.every(item => 
      item.name && item.quantity && item.rarity
    );

    if (!validItems) {
      showStatus('Invalid item format. Each item needs: name, quantity, rarity', 'error');
      return;
    }

    lootItems = importedItems;
    renderLootList();
    closeModal(importJsonModal);
    importJsonText.value = '';
    showStatus(`✓ Imported ${lootItems.length} items!`, 'success');
    // console.log('[Fanfare DM] Loot imported from JSON:', lootItems);
  } catch (error) {
    console.error('[Fanfare DM] JSON import error:', error);
    showStatus('Invalid JSON format', 'error');
  }
}

// Copy to clipboard
// Copy to clipboard (with fallback for restricted environments)
function copyToClipboard(text) {
  if (!text) return;
  
  // Try using the modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showStatus('✓ Copied to clipboard!', 'success');
      })
      .catch(() => {
        // Fallback if Clipboard API fails
        copyToClipboardFallback(text);
      });
  } else {
    // Fallback for restricted environments (like OWL Bear iframes)
    copyToClipboardFallback(text);
  }
}

// Fallback copy: select the text and ask user to copy
function copyToClipboardFallback(text) {
  exportJsonText.select();
  exportJsonText.focus();
  
  try {
    const success = document.execCommand('copy');
    if (success) {
      showStatus('✓ Copied to clipboard!', 'success');
    } else {
      showStatus('Press Ctrl+C to copy the selected text', 'info');
    }
  } catch (error) {
    console.warn('[Fanfare DM] Fallback copy failed:', error);
    showStatus('Press Ctrl+C to copy the selected text', 'info');
  }
}

// Paste from clipboard (with fallback for restricted environments)
function pasteFromClipboard() {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.readText()
      .then(text => {
        importJsonText.value = text;
        importJsonText.focus();
        showStatus('✓ Pasted from clipboard!', 'success');
      })
      .catch(() => {
        // Fallback: tell user to paste manually
        importJsonText.focus();
        showStatus('Press Ctrl+V to paste your JSON', 'info');
      });
  } else {
    // Fallback for restricted environments
    importJsonText.focus();
    showStatus('Press Ctrl+V to paste your JSON', 'info');
  }
}

// Preview popover (for testing)
function previewPopover() {
  const payload = buildPayload();
  // console.log('Preview payload:', payload);
  if (fanfare) {
    fanfare.showPopover(payload);
    showStatus('Previewing...', 'info');
  } else {
    showStatus('Popover manager not ready', 'error');
  }
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
    console.warn('[Fanfare DM] Save target is disabled');
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
      // console.log('[Fanfare DM] Config saved to scene:', configData);
      showStatus('✓ Config saved to scene!', 'success');
    } else if (saveTargetSelect.value === 'room') {
      // Room metadata saving
      await OBR.room.setMetadata({
        'com.sewef.fanfare': configData
      });
      // console.log('[Fanfare DM] Config saved to room:', configData);
      showStatus('✓ Config saved to room!', 'success');
    }

    // Broadcast config update notification to all GMs
    await OBR.broadcast.sendMessage('com.sewef.fanfare', {
      config_updated: {
        updatedAt: Date.now()
      }
    }, { destination: "REMOTE" });
    // console.log('[Fanfare DM] Config update notification broadcast');
  } catch (error) {
    console.error('[Fanfare DM] Error saving config:', error);
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
      // console.log('[Fanfare DM] Config loaded:', configData);
      if (popoverTitleInput && configData.title) popoverTitleInput.value = configData.title;
      if (popoverSubtitleInput && configData.subtitle) popoverSubtitleInput.value = configData.subtitle;
      if (maxXpInput && configData.maxXp) maxXpInput.value = configData.maxXp;
      if (currentXpInput && configData.current) currentXpInput.value = configData.current;
      if (newXpInput && configData.new) newXpInput.value = configData.new;
      if (autoSaveCheckbox && configData.autoSave) autoSaveCheckbox.checked = configData.autoSave;
      updateXpPreview();
      // console.log('[Fanfare DM] Config restored');
    }
  } catch (error) {
    console.warn('[Fanfare DM] Could not load config:', error);
  }
}

// Event listeners - only attach if elements exist (GM mode)
if (currentXpInput) currentXpInput.addEventListener('change', updateXpPreview);
if (newXpInput) newXpInput.addEventListener('input', updateXpPreview);
if (maxXpInput) maxXpInput.addEventListener('input', updateXpPreview);
if (addItemBtn) addItemBtn.addEventListener('click', addItem);
if (exampleBtn) exampleBtn.addEventListener('click', loadExampleItems);
if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportLootJson);
if (importJsonBtn) importJsonBtn.addEventListener('click', () => openModal(importJsonModal));
if (broadcastBtn) broadcastBtn.addEventListener('click', broadcastToPlayers);
if (previewBtn) previewBtn.addEventListener('click', previewPopover);
if (resetBtn) resetBtn.addEventListener('click', resetForm);
if (saveBtn) saveBtn.addEventListener('click', saveConfig);

// Export/Import modal listeners
if (copyExportBtn) copyExportBtn.addEventListener('click', () => copyToClipboard(exportJsonText.value));
if (pasteImportBtn) pasteImportBtn.addEventListener('click', pasteFromClipboard);
if (confirmImportBtn) confirmImportBtn.addEventListener('click', importLootJson);
if (exportJsonClose) exportJsonClose.addEventListener('click', () => closeModal(exportJsonModal));
if (importJsonClose) importJsonClose.addEventListener('click', () => closeModal(importJsonModal));
if (closeExportBtn) closeExportBtn.addEventListener('click', () => closeModal(exportJsonModal));
if (closeImportBtn) closeImportBtn.addEventListener('click', () => closeModal(importJsonModal));

// Close modals when clicking outside
if (exportJsonModal) {
  exportJsonModal.addEventListener('click', (e) => {
    if (e.target === exportJsonModal) closeModal(exportJsonModal);
  });
}
if (importJsonModal) {
  importJsonModal.addEventListener('click', (e) => {
    if (e.target === importJsonModal) closeModal(importJsonModal);
  });
}

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
    // console.log('[Fanfare] Extension ready! OBR context initialized');
    
    // Initialize theme
    const theme = await OBR.theme.getTheme();
    applyTheme(theme);
    
    // Listen for theme changes
    OBR.theme.onChange((newTheme) => {
      // console.log('[Fanfare] Theme changed');
      applyTheme(newTheme);
    });
    
    // Get user role - try different methods for compatibility
    try {
      userRole = (await OBR.player.getRole?.()) || 'GM'; // Default to GM if getRole fails
      // console.log('[Fanfare] User role (via OBR.getRole):', userRole);
    } catch (roleError) {
      console.warn('[Fanfare] Could not determine role, defaulting to GM:', roleError);
      userRole = 'GM';
    }
    
    // Initialize popover manager for all users
    fanfare = new FanfareManager();
    
    context = true;
    
    if (userRole === 'GM') {
      // console.log('[Fanfare] GM mode - showing control panel');      // Load saved config
      await loadConfig();      updateXpPreview();
      renderLootList();
      showStatus('GM Mode: Rewards Broadcaster Ready', 'success');
    } else {
      // console.log('[Fanfare] Player mode - hiding control panel and showing joke');
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
    
    // console.log('[Fanfare] UI initialized successfully');
    
    // Register broadcast listener AFTER OBR is ready
    OBR.broadcast.onMessage('com.sewef.fanfare', (message) => {
      // console.log('[Fanfare] Received broadcast message:', message);
      
      // Handle fan fare end of encounter broadcasts
      if (message.data?.fanfare_endofencounter) {
        // console.log('[Fanfare] Valid fanfare_endofencounter message, showing popover');
        if (fanfare) {
          fanfare.showPopover(message.data.fanfare_endofencounter);
        } else {
          console.warn('[Fanfare] FanfareManager not yet initialized!');
        }
      }
      
      // Handle config updates (notify other GMs)
      if (message.data?.config_updated && userRole === 'GM') {
        // console.log('[Fanfare] Config updated notification received, reloading config');
        loadConfig();
        showStatus('Config updated by another GM', 'info');
      }
    });
    // console.log('[Fanfare] Broadcast listener registered');
  } catch (error) {
    console.error('[Fanfare] Failed to initialize OBR context:', error);
    showStatus('Initialization error', 'error');
  }
});
