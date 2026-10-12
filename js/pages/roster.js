/* Roster page: any season back to 2009, filter by class. */

import { findAsset } from '../assets.js';
import { CLASS_NAMES, CLASS_ORDER } from '../config.js';
import { pageHead } from './contact.js';
import { photoImg } from '../shared.js';
import { DATA, state } from '../store.js';
import { esc, plural } from '../util.js';

export function pageRoster() {
  var seasons = DATA.roster;
  if (!seasons.length) return pageHead('navy', 'Roster', 'Roster') + '<section class="wrap roster-body"><div class="empty-note">No roster on file.</div></section>';
  var s = seasons.filter(function (x) { return x.year === state.rosterYear; })[0] || seasons[0];
  state.rosterYear = s.year;
  var classes = [];
  s.people.forEach(function (p) { if (p.cls && classes.indexOf(p.cls) < 0) classes.push(p.cls); });
  classes.sort(function (a, b) {
    var ia = CLASS_ORDER.indexOf(a), ib = CLASS_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  if (state.rosterClass !== 'All' && classes.indexOf(state.rosterClass) < 0) state.rosterClass = 'All';
  var shown = s.people.filter(function (p) { return state.rosterClass === 'All' || p.cls === state.rosterClass; });
  var capsOnly = s.people.length > 0 && s.people.every(function (p) { return p.captain; });
  var isLatest = s.year === seasons[0].year;

  var html = '<section class="pagehead-navy on-navy"><div class="wrap">' +
    '<div class="eyebrow">' + s.year + ' season</div>' +
    '<h1 class="display h1-page">Roster</h1>' +
    '<div class="ychips" role="group" aria-label="Season">' + seasons.map(function (x) {
      return '<button type="button" class="ychip" data-act="roster-year" data-val="' + x.year + '" aria-pressed="' + (x.year === s.year) + '">' + x.year + '</button>';
    }).join('') + '</div></div></section>';

  var photo = s.photo ? findAsset('rosterPhotos', s.photo) : null;
  if (photo) html += '<section class="wrap teamphoto-wrap" data-hide-on-error><figure class="teamphoto"><img src="' + photo + '" alt="' + s.year + ' Michigan men\'s water polo team photo" data-fallback="hide" decoding="async"></figure></section>';
  html += '<section class="wrap roster-body">' +
    '<div class="toolbar"><div class="label">' + esc(plural(shown.length, 'player') +
      (state.rosterClass !== 'All' ? ' · ' + (CLASS_NAMES[state.rosterClass] || state.rosterClass) : '') +
      (capsOnly ? ' · captains only on record' : '')) + '</div>' +
    (classes.length > 1 ? '<div class="pchips" role="group" aria-label="Filter by class">' +
      ['All'].concat(classes).map(chip).join('') + '</div>' : '') +
    '</div>';
  html += '<div class="player-grid">' + shown.map(function (p) {
    var meta = [p.cls, p.hometown].filter(Boolean).join(' · ');
    return '<article class="player"><div class="shot">' + photoImg(p.headshot, p.name, 'rosterPhotos') + '</div>' +
      '<div class="info"><div class="nm">' + esc(p.name) + '</div>' +
      (meta ? '<div class="meta">' + esc(meta) + '</div>' : '') +
      (p.major ? '<div class="major">' + esc(p.major) + '</div>' : '') +
      (p.captain ? '<div class="cap-tag">Captain</div>' : '') + '</div></article>';
  }).join('') + '</div></section>';

  if (isLatest) {
    var coaches = flattenPeople(DATA.about.coaches);
    var board = DATA.about.eboard || [];
    if (coaches.length || board.length) {
      html += '<section class="staff-band"><div class="wrap">' +
        (coaches.length ? '<div><h2 class="h2-sec h2-40">Coaches</h2>' + coaches.map(coachRow).join('') + '</div>' : '') +
        (board.length ? '<div><h2 class="h2-sec h2-40">Executive board</h2>' + board.map(boardRow).join('') + '</div>' : '') +
        '</div></section>';
    }
  }
  return html;
}
function chip(c) {
  return '<button type="button" class="pchip" data-act="roster-class" data-val="' + esc(c) + '" aria-pressed="' + (state.rosterClass === c) + '"' +
    (CLASS_NAMES[c] ? ' title="' + CLASS_NAMES[c] + '"' : '') + '>' + esc(c === 'GS' ? 'Grad' : c) + '</button>';
}
// Merge people who hold several roles: [{name, headshot, roles:[]}]
function flattenPeople(groups) {
  var out = [], idx = {};
  (groups || []).forEach(function (g) {
    (g.people || []).forEach(function (p) {
      var k = String(p.name || '').trim().toLowerCase();
      if (!k) return;
      var role = singularRole(g.role, (g.people || []).length);
      if (idx[k] == null) { idx[k] = out.length; out.push({ name: p.name, headshot: p.headshot, roles: [role] }); }
      else if (out[idx[k]].roles.indexOf(role) < 0) out[idx[k]].roles.push(role);
    });
  });
  return out;
}
// "Captains" -> "Captain" when listed under one person
export function singularRole(role, count) {
  role = String(role || '').trim();
  if (count < 2 || !/s$/i.test(role)) return role;
  return /ches$/i.test(role) ? role.slice(0, -2) : role.slice(0, -1);
}
function coachRow(p) {
  return '<div class="coach"><div class="ph">' + photoImg(p.headshot, p.name, 'executiveHeadshots') + '</div>' +
    '<div><div class="nm">' + esc(p.name) + '</div><div class="rl">' + p.roles.map(esc).join(' · ') + '</div></div></div>';
}
export function boardRow(g) {
  return '<div class="board-row"><span class="rl">' + esc(g.role) + '</span><span class="nm">' +
    (g.people || []).map(function (p) { return esc(p.name); }).join(', ') + '</span></div>';
}
