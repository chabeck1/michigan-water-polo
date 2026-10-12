/* Alumni page: alumni count and the "Where alumni work" ticker. */

import { findAsset } from '../assets.js';
import { honor } from '../data.js';
import { stat } from '../shared.js';
import { DATA } from '../store.js';
import { esc, initials } from '../util.js';

// Employers from data/alumni.json as a two-row scrolling ticker. The moving rows are decorative
// (aria-hidden); screen readers get the plain list.
function tickerHtml(list) {
  var half = list.length > 12 ? Math.ceil(list.length / 2) : list.length;
  var rows = [list.slice(0, half), list.slice(half)].filter(function (r) { return r.length; });
  function item(c) {
    var mono = esc(initials(c.name));
    var tile = c.logo
      ? '<img src="' + findAsset('companyLogos', c.logo) + '" alt="" decoding="async" data-fallback="logo" data-mono="' + mono + '">'
      : '<span class="mono-logo">' + mono + '</span>';
    return '<li><span class="tk-tile">' + tile + '</span><span class="tk-nm">' + esc(c.name) + '</span></li>';
  }
  return '<ul class="sr-only">' + list.map(function (c) { return '<li>' + esc(c.name) + '</li>'; }).join('') + '</ul>' +
    '<div class="ticker" aria-hidden="true">' + rows.map(function (row, i) {
      var fill = row.slice();
      while (fill.length < 8) fill = fill.concat(row);
      var items = fill.map(item).join('');
      return '<div class="tk-row' + (i ? ' rev' : '') + '" style="--tk-dur:' + fill.length * 6 + 's"><ul>' + items + '</ul><ul>' + items + '</ul></div>';
    }).join('') + '</div>';
}

// Alumni = everyone on a past roster who isn't on the latest one, grouped by their final season.
function alumniGroups() {
  var seasons = DATA.roster, latest = seasons[0];
  var lastSeen = {}, current = {}, groups = {};
  seasons.slice().reverse().forEach(function (s) { s.people.forEach(function (p) { lastSeen[p.name] = s.year; }); });
  if (latest) latest.people.forEach(function (p) { current[p.name] = true; });
  Object.keys(lastSeen).forEach(function (n) {
    var y = lastSeen[n];
    if (current[n] || (latest && y === latest.year)) return;
    (groups[y] = groups[y] || []).push(n);
  });
  return Object.keys(groups).map(Number).sort(function (a, b) { return b - a; }).map(function (y) {
    return { year: y, names: groups[y].sort() };
  });
}

export function pageAlumni() {
  var count = alumniGroups().reduce(function (s, g) { return s + g.names.length; }, 0);
  var companies = DATA.alumni.companies;
  var b10 = honor(DATA.about, /big ten champ/i);
  var heroImg = findAsset('img', 'hooray1.jpg');
  var weekendImg = findAsset('img', 'rossen.jpg');

  var html = '<section class="alumni-hero on-navy">' +
    (heroImg ? '<img class="bg" src="' + heroImg + '" alt="" decoding="async" data-fallback="hide-self">' : '') +
    '<div class="wrap"><div class="eyebrow">Alumni network</div><h1 class="display">Once a<br>Wolverine.</h1>' +
    '<div class="stats tnum">' + stat(count, 'Alumni on file', true) + (companies.length ? stat(DATA.alumni.count, 'Companies', true) : '') +
    (b10 ? stat(b10.years.length, 'Big Ten titles', true) : '') + '</div></div></section>';

  if (companies.length) html += '<section class="sec"><div class="wrap"><div class="sec-head"><h2 class="h2-sec h2-big">Where alumni work</h2></div></div>' +
    tickerHtml(companies) + '</section>';

  html += '<section class="band-navy on-navy"><div class="wrap split"><div><div class="label">Every January</div>' +
    '<h2 class="display h2-big">Alumni Weekend</h2>' +
    '<p>Current players take on a team of alumni at the Wolverine Classic. In 2023 the alumni won — come defend the title.</p></div>' +
    (weekendImg ? '<figure class="photo-32" data-hide-on-error><img src="' + weekendImg + '" alt="Michigan player shooting in the pool" loading="lazy" decoding="async" data-fallback="hide"></figure>' : '') +
    '</div></section>';

  html += '<section class="band-maize"><div class="wrap band-split"><div><h2>Stay connected</h2>' +
    '<p>Get season updates and Alumni Weekend details, and tell us where you work so we can add you to the list.</p></div>' +
    '<div class="actions"><a class="btn btn-navy btn-sm" href="#contact" data-reason="Alumni Visit">Get in touch</a>' +
    '<a class="btn btn-ghost-navy btn-sm" href="' + esc(DATA.fund.give) + '" target="_blank" rel="noopener noreferrer">Give ↗</a></div></div></section>';
  return html;
}
