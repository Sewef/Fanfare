import OBR from '@owlbear-rodeo/sdk';

/**
 * Player-side broadcast listener for fanfare rewards
 * Uses OBR.popover API to display rewards at top center
 */

class FanfareManager {
  constructor() {
    this.popovers = new Map();
    console.log('[Fanfare Player] FanfareManager initialized');
  }

  /**
   * Open popover using OBR API at top center
   */
  async showPopover(payload) {
    try {
      console.log('[Fanfare Player] showPopover called with payload:', payload);
      const popoverId = `fanfare-${Date.now()}`;
      console.log('[Fanfare Player] Generated popover ID:', popoverId);
      
      const dataParam = encodeURIComponent(JSON.stringify(payload));
      const url = `/popover-content.html?data=${dataParam}`;
      console.log('[Fanfare Player] Popover URL:', url);

      console.log('[Fanfare Player] Opening popover with config', {
        id: popoverId,
        url: url,
        width: 380,
        height: 320,
        position: 'top center'
      });

      await OBR.popover.open({
        id: popoverId,
        url: url,
        width: 380,
        height: 320,
        anchorPosition: { left: window.innerWidth / 2, top: 20 },
        anchorOrigin: { horizontal: 'CENTER', vertical: 'TOP' },
        transformOrigin: { horizontal: 'CENTER', vertical: 'TOP' },
        anchorReference: 'POSITION',
        disableClickAway: false,
        marginThreshold: 10
      });

      console.log('[Fanfare Player] Popover opened successfully!');

      // Auto-close after 10 seconds
      setTimeout(() => {
        console.log('[Fanfare Player] Auto-closing popover:', popoverId);
        OBR.popover.close(popoverId).catch((err) => {
          console.warn('[Fanfare Player] Error closing popover:', err);
        });
      }, 10000);

      this.popovers.set(popoverId, payload);
      console.log('[Fanfare Player] Popover stored in map. Total popovers:', this.popovers.size);
    } catch (error) {
      console.error('[Fanfare Player] Failed to open popover:', error);
    }
  }
}

let fanfare;

OBR.onReady(async () => {
  console.log('[Fanfare Player] OBR.onReady fired!');
  fanfare = new FanfareManager();
  console.log('[Fanfare Player] Fanfare player extension ready!');
});

console.log('[Fanfare Player] Registering broadcast listener on channel: com.sewef.fanfare');
OBR.broadcast.onMessage('com.sewef.fanfare', (message) => {
  console.log('[Fanfare Player] Received broadcast message:', message);
  
  if (message.data?.fanfare_endofencounter) {
    console.log('[Fanfare Player] Message type matches! Calling showPopover');
    if (fanfare) {
      fanfare.showPopover(message.data.fanfare_endofencounter);
    } else {
      console.warn('[Fanfare Player] Fanfare manager not yet initialized!');
    }
  }
});

console.log('[Fanfare Player] Script loaded and listener registered');

export default FanfareManager;
