/**
 * DOM HELPERS - DOM Manipulation Utilities
 * Analytics Dashboard - Stand-alone Version
 */

const DOM = (() => {
  'use strict';

  /**
   * Query selector shorthand
   * @param {string} selector
   * @param {Element} context
   * @returns {Element|null}
   */
  function $(selector, context = document) {
    return context.querySelector(selector);
  }

  /**
   * Query selector all shorthand
   * @param {string} selector
   * @param {Element} context
   * @returns {NodeList}
   */
  function $$(selector, context = document) {
    return context.querySelectorAll(selector);
  }

  /**
   * Create element with attributes and children
   * @param {string} tag
   * @param {Object} attrs
   * @param {Array|string} children
   * @returns {Element}
   */
  function create(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          el.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
      } else {
        el.setAttribute(key, value);
      }
    });

    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          el.appendChild(child);
        }
      });
    }

    return el;
  }

  /**
   * Set inner HTML safely
   * @param {Element} el
   * @param {string} html
   */
  function html(el, content) {
    if (el) el.innerHTML = content;
  }

  /**
   * Add event listener with delegation
   * @param {Element} parent
   * @param {string} event
   * @param {string} selector
   * @param {Function} callback
   */
  function delegate(parent, event, selector, callback) {
    parent.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target && parent.contains(target)) {
        callback(e, target);
      }
    });
  }

  /**
   * Toggle class on element
   * @param {Element} el
   * @param {string} className
   * @param {boolean} force
   */
  function toggle(el, className, force) {
    if (el) el.classList.toggle(className, force);
  }

  /**
   * Add class to element
   * @param {Element} el
   * @param {string} className
   */
  function addClass(el, className) {
    if (el) el.classList.add(className);
  }

  /**
   * Remove class from element
   * @param {Element} el
   * @param {string} className
   */
  function removeClass(el, className) {
    if (el) el.classList.remove(className);
  }

  /**
   * Check if element has class
   * @param {Element} el
   * @param {string} className
   * @returns {boolean}
   */
  function hasClass(el, className) {
    return el ? el.classList.contains(className) : false;
  }

  /**
   * Show element
   * @param {Element} el
   */
  function show(el) {
    if (el) el.style.display = '';
  }

  /**
   * Hide element
   * @param {Element} el
   */
  function hide(el) {
    if (el) el.style.display = 'none';
  }

  /**
   * Empty element content
   * @param {Element} el
   */
  function empty(el) {
    if (el) el.innerHTML = '';
  }

  /**
   * Debounce function
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  return {
    $,
    $$,
    create,
    html,
    delegate,
    toggle,
    addClass,
    removeClass,
    hasClass,
    show,
    hide,
    empty,
    debounce
  };
})();
