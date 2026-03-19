/**
 * Component Loader Service
 * Dynamically loads HTML, CSS, and JS components
 */

const ComponentLoader = (function() {
  'use strict';

  // Track loaded components to prevent duplicates
  const loadedComponents = new Set();
  const loadedStyles = new Set();

  /**
   * Load HTML content into a container
   * @param {string} url - Path to HTML file
   * @param {string|HTMLElement} container - Container selector or element
   * @returns {Promise<HTMLElement>}
   */
  async function loadHTML(url, container) {
    const targetEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!targetEl) {
      throw new Error(`Container not found: ${container}`);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }
      const html = await response.text();
      targetEl.innerHTML = html;
      return targetEl;
    } catch (error) {
      console.error(`Error loading HTML from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Load CSS stylesheet
   * @param {string} url - Path to CSS file
   * @returns {Promise<void>}
   */
  function loadCSS(url) {
    return new Promise((resolve, reject) => {
      if (loadedStyles.has(url)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => {
        loadedStyles.add(url);
        resolve();
      };
      link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
      document.head.appendChild(link);
    });
  }

  /**
   * Load JavaScript file
   * @param {string} url - Path to JS file
   * @returns {Promise<void>}
   */
  function loadJS(url) {
    return new Promise((resolve, reject) => {
      if (loadedComponents.has(url)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        loadedComponents.add(url);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load JS: ${url}`));
      document.body.appendChild(script);
    });
  }

  /**
   * Load a complete component (HTML + CSS + JS)
   * @param {object} config - Component configuration
   * @param {string} config.name - Component name
   * @param {string} config.basePath - Base path to component folder
   * @param {string|HTMLElement} config.container - Container for HTML
   * @param {boolean} config.hasCSS - Whether component has CSS file
   * @param {boolean} config.hasJS - Whether component has JS file
   * @returns {Promise<void>}
   */
  async function loadComponent(config) {
    const { name, basePath, container, hasCSS = true, hasJS = true } = config;

    const promises = [];

    // Load CSS first (non-blocking)
    if (hasCSS) {
      promises.push(loadCSS(`${basePath}/${name}.css`));
    }

    // Load HTML into container
    if (container) {
      promises.push(loadHTML(`${basePath}/${name}.html`, container));
    }

    // Wait for CSS and HTML
    await Promise.all(promises);

    // Load JS after HTML is in place
    if (hasJS) {
      await loadJS(`${basePath}/${name}.js`);
    }
  }

  /**
   * Load multiple components in parallel
   * @param {Array<object>} components - Array of component configs
   * @returns {Promise<void>}
   */
  async function loadComponents(components) {
    await Promise.all(components.map(loadComponent));
  }

  // Public API
  return {
    loadHTML,
    loadCSS,
    loadJS,
    loadComponent,
    loadComponents
  };
})();
