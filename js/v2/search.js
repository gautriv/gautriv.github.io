// search.js — wraps SimpleJekyllSearch against the v2 palette markup.
(function () {
  'use strict';
  if (typeof SimpleJekyllSearch === 'undefined') return;
  const input = document.getElementById('search-input');
  const results = document.getElementById('results-container');
  if (!input || !results) return;
  SimpleJekyllSearch({
    searchInput: input,
    resultsContainer: results,
    searchResultTemplate: '<li><a href="{url}" tabindex="0">{title}</a></li>',
    noResultsText: '<li class="no-results">No results.</li>',
    json: '/search.json',
    fuzzy: true,
  });
})();
