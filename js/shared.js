/* Pieces several pages use: records, results and stats. */

import { findAsset } from './assets.js';
import { MONTHS } from './config.js';
import { DAY_RANGE, recStr, record } from './data.js';
import { esc, initials } from './util.js';

export function eventResultSummary(ev, squads) {
  var parts = [];
  squads.forEach(function (q) {
    var s = ev.squads[q];
    if (!s || !s.games.length) return;
    var r = record(s.games);
    var cancelled = s.games.every(function (g) { return g.result === 'canceled'; });
    var txt = cancelled ? 'Canceled' : (r.n ? recStr(r) : '');
    if (txt) parts.push({ q: q, txt: txt });
  });
  return parts;
}
export function resultLine(parts, multi) {
  return parts.map(function (p) {
    return (multi && p.q ? '<span class="sq sq-' + esc(p.q.toLowerCase()) + '">' + esc(p.q) + '</span>' : '') + esc(p.txt);
  }).join('<span class="sep">/</span>');
}
export function placeLine(ev) {
  var a = [];
  if (ev.location) a.push(ev.location);
  if (ev.host && ev.host !== ev.location) a.push('hosted by ' + ev.host);
  return a.join(' · ');
}
// Played, but no win, loss or tie entered yet (canceled or forfeit games alone don't make a result).
export function eventPending(ev) {
  return ev.status === 'past' && ev.allGames.some(function (g) { return !g.result; }) && !record(ev.allGames).n;
}
// "September 20–21", "September 30–October 1"
export function fmtRangeLong(start, end) {
  if (!start) return '';
  var a = MONTHS[start.getMonth()] + ' ' + start.getDate();
  if (!end || +end === +start) return a;
  if (start.getMonth() === end.getMonth()) return a + '–' + end.getDate();
  return a + '–' + MONTHS[end.getMonth()] + ' ' + end.getDate();
}
// practice copy from about.json: "Monday–Thursday" and "Mon–Thu, 9:30–11:30 PM at Canham Natatorium"
export function practiceDaysDash(a) { return String(a.practiceDays || '').replace(/\s+through\s+/i, '–'); }
export function practiceShort(a) {
  var days = String(a.practiceDays || ''), m = DAY_RANGE.exec(days);
  if (m) days = m[1].slice(0, 3) + '–' + m[2].slice(0, 3); // only a two-day range is shortened
  return (days ? days + ', ' : '') + a.practiceTime + ' at ' + a.practicePlace;
}
export function listYears(ys) {
  ys = ys.slice().sort(function (x, y) { return x - y; });
  return ys.length < 2 ? ys.join('') : ys.slice(0, -1).join(', ') + ' and ' + ys[ys.length - 1];
}
var NUM_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
export function titlesBlurb(ys) {
  if (!ys.length) return '';
  if (ys.length > 1 && ys[0] - ys[1] === 1) {
    var rest = ys.slice(2).filter(function (y) { return y >= 2011; }).length;
    return 'Back-to-back in ' + ys[1] + ' and ' + ys[0] + (rest ? ', and ' + (NUM_WORDS[rest] || rest) + ' since 2011' : '') + '.';
  }
  return 'Most recently in ' + ys[0] + '.';
}
export function stat(n, label, hi) {
  return '<div class="stat' + (hi ? ' hi' : '') + '"><div class="num">' + esc(n) + '</div><div class="lbl">' + esc(label) + '</div></div>';
}

// Photos fall back to the grey silhouette (nopicture.svg) that already lives in each photo folder.
export function photoImg(file, name, folder) {
  var nopic = findAsset(folder, 'nopicture.svg');
  var real = file && !/nopicture/i.test(file) ? findAsset(folder, file) : null;
  if (!real && !nopic) return '<span class="initials" aria-hidden="true">' + esc(initials(name)) + '</span>';
  if (!real) return '<img src="' + nopic + '" alt="" loading="lazy" decoding="async" data-fallback="initials">';
  return '<span class="initials" aria-hidden="true">' + esc(initials(name)) + '</span>' +
    '<img src="' + real + '" alt="' + esc(name) + '" loading="lazy" decoding="async" data-fallback="' + (nopic ? 'nopic' : 'initials') + '"' + (nopic ? ' data-nopic="' + nopic + '"' : '') + '>';
}
