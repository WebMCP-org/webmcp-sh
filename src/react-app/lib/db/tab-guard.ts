/**
 * Tab Guard - Prevents multiple tabs from running the application simultaneously
 *
 * Uses BroadcastChannel API to detect and prevent multiple tabs.
 * This is important for PGlite since it has a single exclusive connection to the database.
 */

const CHANNEL_NAME = 'playground-webmcp-tab-guard';
const HEARTBEAT_INTERVAL = 2000; // 2 seconds
const HEARTBEAT_TIMEOUT = 5000; // 5 seconds

type TabMessage =
  | { type: 'hello'; id: string; timestamp: number }
  | { type: 'hello-response'; id: string; timestamp: number }
  | { type: 'heartbeat'; id: string; timestamp: number }
  | { type: 'goodbye'; id: string; timestamp: number }
  | { type: 'request-focus'; id: string; timestamp: number };

class TabGuard {
  private channel: BroadcastChannel | null = null;
  private tab_id: string;
  private is_primary = false;
  private heartbeat_interval: ReturnType<typeof setInterval> | null = null;
  private other_tab_last_seen: number = 0;
  private listeners: Set<(is_primary: boolean, has_other_tabs: boolean) => void> = new Set();

  constructor() {
    this.tab_id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.initialize();
  }

  private handle_duplicate_tab_detected() {
    // Request focus on the primary tab
    this.send_message({ type: 'request-focus', id: this.tab_id, timestamp: Date.now() });

    // Show overlay blocking this tab
    this.show_duplicate_tab_overlay();
  }

  private show_duplicate_tab_overlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="text-align: center; max-width: 500px; padding: 2rem;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Multiple Tabs Detected</h1>
        <p style="font-size: 1.125rem; line-height: 1.6; margin-bottom: 1.5rem; opacity: 0.9;">
          This application is already open in another tab. To avoid database conflicts,
          please close this tab and use the existing one.
        </p>
        <p style="font-size: 0.875rem; opacity: 0.6;">
          You can safely close this tab now.
        </p>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  private initialize() {
    if (typeof BroadcastChannel === 'undefined') {
      // BroadcastChannel not supported, assume we're the only tab
      console.warn('[TabGuard] BroadcastChannel not supported, assuming single tab');
      this.is_primary = true;
      this.notify_listeners();
      return;
    }

    this.channel = new BroadcastChannel(CHANNEL_NAME);

    this.channel.onmessage = (event: MessageEvent<TabMessage>) => {
      this.handle_message(event.data);
    };

    // Send hello to check if other tabs exist
    this.send_message({ type: 'hello', id: this.tab_id, timestamp: Date.now() });

    // Wait a bit to see if we get a response
    setTimeout(() => {
      if (this.other_tab_last_seen === 0) {
        // No other tabs responded, we're primary
        this.is_primary = true;
        this.start_heartbeat();
      } else {
        // Other tabs exist and we're not primary
        this.handle_duplicate_tab_detected();
      }
      this.notify_listeners();
    }, 500);

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is hidden, no action needed
      } else {
        // Tab is visible again, check if we should be primary
        this.send_message({ type: 'hello', id: this.tab_id, timestamp: Date.now() });
      }
    });
  }

  private send_message(message: TabMessage) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
  }

  private handle_message(message: TabMessage) {
    const now = Date.now();

    switch (message.type) {
      case 'hello':
        if (message.id !== this.tab_id) {
          // Another tab is saying hello
          this.other_tab_last_seen = now;

          if (this.is_primary) {
            // We're primary, respond to let them know
            this.send_message({
              type: 'hello-response',
              id: this.tab_id,
              timestamp: now,
            });
          } else {
            // We're not primary, check if we should become primary
            // (in case the primary tab died)
            this.check_if_should_become_primary();
          }
          this.notify_listeners();
        }
        break;

      case 'hello-response':
        if (message.id !== this.tab_id) {
          // Another tab (primary) responded
          this.other_tab_last_seen = now;
          const was_primary = this.is_primary;
          this.is_primary = false;
          this.stop_heartbeat();
          this.notify_listeners();

          // If we just became non-primary, offer to close this tab
          if (was_primary) {
            this.handle_duplicate_tab_detected();
          }
        }
        break;

      case 'heartbeat':
        if (message.id !== this.tab_id) {
          // Another tab sent heartbeat
          this.other_tab_last_seen = now;

          if (this.is_primary) {
            // Two primaries? The older one wins
            if (message.timestamp < now - 1000) {
              // Other tab has been primary longer
              this.is_primary = false;
              this.stop_heartbeat();
              this.notify_listeners();
            }
          }
        }
        break;

      case 'goodbye':
        if (message.id !== this.tab_id && this.other_tab_last_seen > 0) {
          // Another tab is closing, check if we should become primary
          setTimeout(() => {
            this.check_if_should_become_primary();
          }, 100);
        }
        break;

      case 'request-focus':
        if (message.id !== this.tab_id) {
          // Another tab is closing and asking us to focus
          window.focus();
        }
        break;
    }
  }

  private check_if_should_become_primary() {
    const now = Date.now();
    const time_since_last_seen = now - this.other_tab_last_seen;

    if (time_since_last_seen > HEARTBEAT_TIMEOUT) {
      // No other tab seen recently, become primary
      if (!this.is_primary) {
        this.is_primary = true;
        this.start_heartbeat();
        this.notify_listeners();
      }
    }
  }

  private start_heartbeat() {
    if (this.heartbeat_interval) return;

    this.heartbeat_interval = setInterval(() => {
      this.send_message({
        type: 'heartbeat',
        id: this.tab_id,
        timestamp: Date.now(),
      });
    }, HEARTBEAT_INTERVAL);
  }

  private stop_heartbeat() {
    if (this.heartbeat_interval) {
      clearInterval(this.heartbeat_interval);
      this.heartbeat_interval = null;
    }
  }

  private notify_listeners() {
    const has_other_tabs = this.other_tab_last_seen > 0;
    this.listeners.forEach((listener) => {
      listener(this.is_primary, has_other_tabs);
    });
  }

  /**
   * Check if this tab is the primary tab
   */
  get_is_primary(): boolean {
    return this.is_primary;
  }

  /**
   * Check if other tabs are detected
   */
  has_other_tabs(): boolean {
    if (this.other_tab_last_seen === 0) return false;
    const time_since_last_seen = Date.now() - this.other_tab_last_seen;
    return time_since_last_seen < HEARTBEAT_TIMEOUT;
  }

  /**
   * Register a listener for tab state changes
   */
  on_change(listener: (is_primary: boolean, has_other_tabs: boolean) => void) {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.is_primary, this.has_other_tabs());

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.send_message({ type: 'goodbye', id: this.tab_id, timestamp: Date.now() });
    this.stop_heartbeat();

    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    this.listeners.clear();
  }
}

/**
 * Singleton instance of the tab guard
 */
export const tab_guard = new TabGuard();

/**
 * React hook-friendly function to check if this is the primary tab
 */
export function use_is_primary_tab(
  on_change?: (is_primary: boolean, has_other_tabs: boolean) => void
) {
  if (on_change) {
    return tab_guard.on_change(on_change);
  }
  return tab_guard.get_is_primary();
}

/**
 * Get current tab guard status
 */
export function get_tab_status() {
  return {
    is_primary: tab_guard.get_is_primary(),
    has_other_tabs: tab_guard.has_other_tabs(),
  };
}
