/* Today's date, reading the dates written in the data files, and formatting dates and times. */

import { CFG, MON } from './config.js';
import { pad2, parseISODate, startOfDay } from './util.js';

export var NOW = CFG.today ? parseISODate(CFG.today) : new Date();
export var TODAY = startOfDay(NOW);

var MONTH_RE = /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i;
// "2026-10-24" -> local midnight, or null. Like game times, an August-December date typed with the wrong year
// is put in the season's year.
export function parseDay(s, seasonYear) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
  if (!m) return null;
  var y = +m[1];
  if (seasonYear && Math.abs(y - seasonYear) >= 1 && +m[2] >= 8) y = seasonYear;
  return new Date(y, +m[2] - 1, +m[3]);
}
function monthIndex(s) {
  var k = s.slice(0, 3).toLowerCase();
  return ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(k);
}
// "January 26th, 2023" -> Date
export function parseLongDate(str) {
  var m = new RegExp(MONTH_RE.source + '\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})', 'i').exec(str || '');
  return m ? new Date(+m[3], monthIndex(m[1]), +m[2]) : null;
}
// "2026-09-26T11:20" (wall clock, no zone). Year typos are corrected to the season year.
export function parseGameTime(s, seasonYear) {
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T(\d{1,2}):(\d{2}))?/.exec(s || '');
  if (!m) return null;
  var y = +m[1];
  if (seasonYear && Math.abs(y - seasonYear) >= 1 && +m[2] >= 8) y = seasonYear;
  return { y: y, mo: +m[2] - 1, d: +m[3], h: m[4] != null ? +m[4] : null, mi: m[5] != null ? +m[5] : null };
}
export function gameDate(t) { return new Date(t.y, t.mo, t.d); }
export function gameStart(t) { return new Date(t.y, t.mo, t.d, t.h == null ? 23 : t.h, t.mi == null ? 59 : t.mi); }
export function fmtClock(t) {
  if (t.h == null) return '';
  var h = t.h % 12 || 12;
  return h + ':' + pad2(t.mi) + ' ' + (t.h < 12 ? 'AM' : 'PM');
}
export function fmtRange(start, end) {
  if (!start) return '';
  if (!end || +end === +start) return MON[start.getMonth()] + ' ' + start.getDate();
  if (start.getMonth() === end.getMonth()) return MON[start.getMonth()] + ' ' + start.getDate() + '–' + end.getDate();
  return MON[start.getMonth()] + ' ' + start.getDate() + '–' + MON[end.getMonth()] + ' ' + end.getDate();
}
