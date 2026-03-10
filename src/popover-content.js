import OBR from '@owlbear-rodeo/sdk';
import './player-styles.css';

/**
 * Theme manager - Apply OWL Bear theme colors to the popover
 */
function applyTheme(theme) {
  const isDark = theme.mode === 'DARK';
  const root = document.documentElement;
  
  if (isDark) {
    // Dark theme (use OWL Bear colors)
    root.style.setProperty('--popover-bg', theme.background.default);
    root.style.setProperty('--popover-surface', theme.background.paper);
    root.style.setProperty('--popover-text', theme.text.primary);
    root.style.setProperty('--popover-text-muted', theme.text.secondary);
    root.style.setProperty('--popover-primary', theme.primary.main);
    root.style.setProperty('--popover-border', theme.secondary.dark);
  } else {
    // Light theme (adjusted for readability on light backgrounds)
    root.style.setProperty('--popover-bg', theme.background.default);
    root.style.setProperty('--popover-surface', theme.background.paper);
    root.style.setProperty('--popover-text', theme.text.primary);
    root.style.setProperty('--popover-text-muted', theme.text.secondary);
    root.style.setProperty('--popover-primary', theme.primary.main);
    root.style.setProperty('--popover-border', theme.secondary.light);
  }
  
  console.log('[Fanfare Popover] Theme applied:', theme.mode);
}

/**
 * Popover content script
 * Receives reward data from the broadcast and displays it
 */

class PopoverContent {
  constructor() {
    this.container = document.querySelector('#popover-content');
    console.log('[Fanfare Popover] PopoverContent initialized');
    console.log('[Fanfare Popover] Container element found:', !!this.container);
  }

  buildHeader(title, subtitle) {
    console.log('[Fanfare Popover] Building header with title:', title, 'subtitle:', subtitle);
    const subtitleHtml = subtitle ? `<div class="fanfare-subtitle">${subtitle}</div>` : '';
    return `
      <div class="fanfare-header">
        <div style="flex: 1;"></div>
        <div style="text-align: center; flex: 1;">
          <h2>${title || '🎉 Rewards'}</h2>
          ${subtitleHtml}
        </div>
        <div style="flex: 1; display: flex; justify-content: flex-end;">
          <button class="fanfare-close-btn" id="fanfare-close-btn">✕</button>
        </div>
      </div>
    `;
  }

  displayRewards(payload) {
    console.log('[Fanfare Popover] displayRewards called with payload:', payload);
    if (!this.container) {
      console.error('[Fanfare Popover] Container element not found!');
      return;
    }
    
    const headerHtml = this.buildHeader(payload.title, payload.subtitle);
    console.log('[Fanfare Popover] Header built');
    
    const xpSection = this.buildXpSection(payload.xp);
    console.log('[Fanfare Popover] XP section built');
    
    const lootSection = this.buildLootSection(payload.loot);
    console.log('[Fanfare Popover] Loot section built');

    this.container.innerHTML = `
      <div class="fanfare-popover-inner">
        ${headerHtml}
        
        <div class="fanfare-body">
          ${xpSection}
          ${lootSection}
        </div>
      </div>
    `;

    console.log('[Fanfare Popover] HTML content rendered');
    // Attach close button event listener
    const closeBtn = this.container.querySelector('#fanfare-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log('[Fanfare Popover] Close button clicked');
        OBR.popover.close('fanfare-rewards').catch((err) => {
          console.warn('[Fanfare Popover] Error closing popover:', err);
        });
      });
    }
    // Start animations
    this.animateXpBar();
    if (payload.xp) {
      this.animateXpPercent(payload.xp.current, payload.xp.new);
    }
  }

  animateXpPercent(current, newValue) {
    console.log('[Fanfare Popover] Animating XP percent from', current, 'to', newValue);
    const percentElement = this.container.querySelector('.fanfare-xp-percent');
    if (!percentElement) {
      console.warn('[Fanfare Popover] XP percent element not found!');
      return;
    }

    const duration = 2000; // 2 seconds to match bar animation
    const startTime = performance.now();

    const animatePercent = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentPercent = current + (newValue - current) * easeProgress;
      percentElement.textContent = Math.round(currentPercent) + '%';

      if (progress < 1) {
        requestAnimationFrame(animatePercent);
      }
    };

    requestAnimationFrame(animatePercent);
  }

  buildXpSection(xpData) {
    console.log('[Fanfare Popover] buildXpSection called with:', xpData);
    if (!xpData) {
      console.log('[Fanfare Popover] XP data is empty, skipping XP section');
      return '';
    }
    
    const { current, new: newValue } = xpData;
    const difference = newValue - current;
    const diffText = difference > 0 ? `+${difference}%` : `${difference}%`;

    return `
      <div class="fanfare-xp-section">
        <div class="fanfare-xp-bar-container">
          <div class="fanfare-xp-bar-bg">
            <div 
              class="fanfare-xp-bar-fill" 
              style="--start: ${current}%; --target-width: ${newValue}%"
            ></div>
          </div>
          <span class="fanfare-xp-percent">${current}%</span>
        </div>
      </div>
    `;
  }

  buildLootSection(lootItems) {
    console.log('[Fanfare Popover] buildLootSection called with items:', lootItems);
    if (!lootItems || lootItems.length === 0) {
      console.log('[Fanfare Popover] No loot items - displaying empty state');
      return '<div class="fanfare-loot-empty"></div>';
    }

    console.log('[Fanfare Popover] Building HTML for', lootItems.length, 'loot items');
    const lootHtml = lootItems.map((item, index) => `
      <div class="fanfare-loot-item fanfare-rarity-${item.rarity}" style="--delay: ${index * 0.1}s">
        <div class="fanfare-loot-inner">
          <div class="fanfare-loot-icon">💰</div>
          <div class="fanfare-loot-info">
            <div class="fanfare-loot-name">${item.name}</div>
            <div class="fanfare-loot-qty">x${item.quantity}</div>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="fanfare-loot-section">
        <div class="fanfare-loot-list">
          ${lootHtml}
        </div>
      </div>
    `;
  }

  getRarityLabel(rarity) {
    const labels = {
      'common': 'Common',
      'uncommon': 'Uncommon',
      'rare': 'Rare',
      'very-rare': 'Very Rare',
      'legendary': 'Legendary'
    };
    return labels[rarity] || rarity;
  }

  animateXpBar() {
    console.log('[Fanfare Popover] animateXpBar called');
    if (!this.container) {
      console.warn('[Fanfare Popover] Container not available for animation!');
      return;
    }
    const bar = this.container.querySelector('.fanfare-xp-bar-fill');
    if (bar) {
      console.log('[Fanfare Popover] XP bar element found, starting animation');
      requestAnimationFrame(() => {
        bar.classList.add('animate');
        console.log('[Fanfare Popover] Animation class added to XP bar');
      });
    } else {
      console.warn('[Fanfare Popover] XP bar element not found!');
    }
  }
}

// Look for reward data in the URL or parent context
console.log('[Fanfare Popover] Script loaded, looking for reward data');
const popover = new PopoverContent();

// Initialize theme
OBR.onReady(async () => {
  try {
    const theme = await OBR.theme.getTheme();
    applyTheme(theme);
    
    // Listen for theme changes
    OBR.theme.onChange((newTheme) => {
      console.log('[Fanfare Popover] Theme changed');
      applyTheme(newTheme);
    });
  } catch (e) {
    console.warn('[Fanfare Popover] Failed to initialize theme:', e);
  }
});

// Try to extract data from URL params or window context
const urlParams = new URLSearchParams(window.location.search);
console.log('[Fanfare Popover] URL search params:', window.location.search);

const dataParam = urlParams.get('data');
console.log('[Fanfare Popover] Data parameter found:', !!dataParam);

if (dataParam) {
  try {
    console.log('[Fanfare Popover] Attempting to parse data parameter');
    const payload = JSON.parse(decodeURIComponent(dataParam));
    console.log('[Fanfare Popover] Successfully parsed payload:', payload);
    popover.displayRewards(payload);
  } catch (e) {
    console.error('[Fanfare Popover] Failed to parse reward data:', e);
  }
} else if (window.fanfarePayload) {
  console.log('[Fanfare Popover] Using fallback window.fanfarePayload');
  popover.displayRewards(window.fanfarePayload);
} else {
  console.warn('[Fanfare Popover] No reward data found in URL or window context!');
}

export default PopoverContent;
