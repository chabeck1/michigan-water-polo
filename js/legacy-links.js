/* Old links like /~umpolo/roster?year=2019 land here through .htaccess; turn them into #roster-2019. */
(function () {
  var m = location.pathname.match(/^(.*\/)(roster|schedule|news|contact|about|fundraising|join|support|bracket|index\.html)\/?$/i);
  if (!m) return;
  var map = { about: '', fundraising: 'support', bracket: 'schedule', 'index.html': '' };
  var r = m[2].toLowerCase(); r = (r in map) ? map[r] : r;
  var y = location.search.match(/year=(\d{4})/);
  var hash = r ? '#' + r + (y && (r === 'roster' || r === 'schedule') ? '-' + y[1] : '') : location.hash;
  // keep an existing #route (index.html#roster-2019); file:// previews can't rewrite the path, which is fine
  try { history.replaceState(null, '', m[1] + hash); } catch (e) { /* keep the URL as is */ }
})();
