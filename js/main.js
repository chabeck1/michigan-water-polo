/* Entry point: loads the data, then shows the page in the address bar. */

import { loadData, normAll } from './data.js';
import { go, parseHash, renderAnnouncement, renderFooterLinks } from './router.js';
import { setData, state } from './store.js';
import { $ } from './util.js';

function boot() {
  var menuBtn = $('.menu-btn');
  if (menuBtn) menuBtn.setAttribute('data-act', 'menu');
  loadData().then(function (raw) {
    setData(normAll(raw || {}));
    renderAnnouncement();
    renderFooterLinks();
    var p = parseHash() || { route: 'home' };
    if (p.year) { if (p.route === 'roster') state.rosterYear = p.year; else state.schedYear = p.year; }
    var qs = /[?&]year=(\d{4})/.exec(location.search);
    if (qs) { state.rosterYear = state.rosterYear || +qs[1]; state.schedYear = state.schedYear || +qs[1]; }
    go(p.route, { initial: true });
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
