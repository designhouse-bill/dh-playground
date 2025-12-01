/**
 * Version Navigation Component
 * Dynamically creates the version navigation bar.
 *
 * REMOVABLE: This entire file can be removed without breaking any version.
 * Simply remove the script tag from HTML files to disable version navigation.
 */

(function() {
  'use strict';

  const VERSIONS = [
    { id: 'v1', name: 'Command Center', path: '../v1-command-center/index.html' },
    { id: 'v2', name: 'Card Modern', path: '../v2-card-modern/index.html' },
    { id: 'v3', name: 'Sidebar Nav', path: '../v3-sidebar-nav/index.html' },
    { id: 'v4', name: 'Minimal Focus', path: '../v4-minimal-focus/index.html' },
    { id: 'v5', name: 'Dashboard Tiles', path: '../v5-dashboard-tiles/index.html' }
  ];

  function getCurrentVersion() {
    const path = window.location.pathname;
    for (const version of VERSIONS) {
      if (path.includes(version.id)) {
        return version.id;
      }
    }
    return null;
  }

  function createVersionNav() {
    const currentVersion = getCurrentVersion();

    const nav = document.createElement('nav');
    nav.id = 'version-nav';
    nav.className = 'version-nav';
    nav.setAttribute('aria-label', 'Version Navigation');

    const title = document.createElement('span');
    title.className = 'version-nav__title';
    title.textContent = 'Analytics Dashboard UI Variations';

    const list = document.createElement('ul');
    list.className = 'version-nav__list';

    VERSIONS.forEach(version => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = version.path;
      link.className = 'version-nav__link';
      link.textContent = version.name;

      if (version.id === currentVersion) {
        link.classList.add('version-nav__link--active');
        link.setAttribute('aria-current', 'page');
      }

      item.appendChild(link);
      list.appendChild(item);
    });

    nav.appendChild(title);
    nav.appendChild(list);

    return nav;
  }

  function init() {
    // Only create if not already present
    if (document.getElementById('version-nav')) {
      return;
    }

    const nav = createVersionNav();
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.classList.add('has-version-nav');
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
