/**
 * EVENT BUS - Component Communication
 * Analytics Dashboard - Stand-alone Version
 *
 * Simple pub/sub event system for decoupled component communication.
 */

const EventBus = (() => {
  'use strict';

  const events = new Map();

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  function on(event, callback) {
    if (!events.has(event)) {
      events.set(event, new Set());
    }
    events.get(event).add(callback);

    // Return unsubscribe function
    return () => off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler to remove
   */
  function off(event, callback) {
    if (events.has(event)) {
      events.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  function emit(event, data) {
    if (events.has(event)) {
      events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus: Error in handler for "${event}"`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  function once(event, callback) {
    const wrapper = (data) => {
      off(event, wrapper);
      callback(data);
    };
    on(event, wrapper);
  }

  /**
   * Clear all event subscriptions
   */
  function clear() {
    events.clear();
  }

  return {
    on,
    off,
    emit,
    once,
    clear
  };
})();

// Expose for debugging
if (window.location.hostname === 'localhost') {
  window.__eventBus = EventBus;
}
