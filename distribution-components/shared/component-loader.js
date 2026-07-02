/* component-loader — fetch-inject a fragment's markup in place of its
   placeholder (nav-a1 data-shell pattern). The fragment's root element
   inherits the placeholder's data-component / data-section attributes
   (the manifest anchor stamped on both proto + Angular sides). */
(function () {
  function load(host, url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('fragment fetch failed: ' + url + ' (' + r.status + ')');
      return r.text();
    }).then(function (html) {
      host.insertAdjacentHTML('beforebegin', html);
      var node = host.previousElementSibling;
      node.setAttribute('data-component', host.dataset.component);
      if (host.dataset.section) node.setAttribute('data-section', host.dataset.section);
      host.remove();
      return node;
    });
  }
  window.DistComponents = { load: load };
})();
