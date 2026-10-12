/* Schedule page: results, A/B team records and the calendar download. */

import { logoHtml } from '../assets.js';
import { CFG, DOW } from '../config.js';
import { byGameTime, recStr, seasonRecord } from '../data.js';
import { NOW, TODAY, fmtClock, gameDate, gameStart } from '../dates.js';
import { pageHead } from './contact.js';
import { eventPending, eventResultSummary, fmtRangeLong, placeLine, resultLine, stat } from '../shared.js';
import { DATA, state } from '../store.js';
import { dash, esc, pad2, slug } from '../util.js';

export function pageSchedule() {
  var years = DATA.seasonYears;
  if (!years.length) return pageHead('navy', 'CWPA · Big Ten Division', 'Schedule') + '<section class="wrap sched-body"><div class="empty-note">No schedule on file.</div></section>';
  var y = years.indexOf(state.schedYear) >= 0 ? state.schedYear : years[0];
  state.schedYear = y;
  var season = DATA.seasons[y] || null;
  var awards = DATA.awards[y] || [];
  var hasEvents = !!(season && season.events.length);

  var stats = '';
  if (hasEvents) {
    if (season.multi) {
      stats = season.squads.map(function (q, i) {
        var r = seasonRecord(season, q);
        return stat(r.n ? recStr(r) : '0–0', q + ' team', i === 0);
      }).join('');
    } else {
      var r = seasonRecord(season, season.squads[0]);
      stats = stat(r.w, 'Wins', true) + stat(r.l, 'Losses') + stat(r.t, 'Ties');
    }
  }
  var html = '<section class="pagehead-navy on-navy"><div class="wrap">' +
    '<div class="head-row"><div><div class="eyebrow">CWPA · Big Ten Division · ' + y + '</div><h1 class="display h1-page">Schedule</h1></div>' +
    (stats ? '<div class="stats tnum">' + stats + '</div>' : '') + '</div>' +
    '<div class="ychips" role="group" aria-label="Season">' + years.map(function (yr) {
      return '<button type="button" class="ychip" data-act="sched-year" data-val="' + yr + '" aria-pressed="' + (yr === y) + '">' + yr + '</button>';
    }).join('') + '</div></div></section>';

  html += '<section class="wrap sched-body">';
  if (hasEvents) {
    var squads = season.squads;
    var filter = season.multi && squads.indexOf(state.schedSquad) >= 0 ? state.schedSquad : 'All';
    var visibleSquads = filter === 'All' ? squads : [filter];
    var seg = season.multi ? '<div class="pchips" role="group" aria-label="Show team">' + ['All'].concat(squads).map(function (q) {
      return '<button type="button" class="pchip" data-act="sched-squad" data-val="' + esc(q) + '" aria-pressed="' + (filter === q) + '">' + (q === 'All' ? 'Both' : esc(q) + ' team') + '</button>';
    }).join('') + '</div>' : '';
    var ics = '<button type="button" class="btn btn-ghost-navy btn-xs" data-act="ics">Add to calendar</button>';
    if (seg || ics) html += '<div class="sched-tools">' + (seg || '<span></span>') + ics + '</div>';
    var events = season.events.filter(function (ev) {
      return visibleSquads.some(function (q) { return ev.squads[q]; });
    });
    html += '<div class="events">' + events.map(function (ev) { return eventCard(ev, season, visibleSquads); }).join('') + '</div>';
  } else {
    html += '<div class="empty-note">No game schedule on file for ' + y + '.</div>';
  }
  html += '</section>';

  if (awards.length) {
    html += '<section class="wrap awards" aria-labelledby="h-awards"><h2 id="h-awards" class="h2-sec">' + y + ' season awards</h2>' +
      '<dl class="award-grid">' + awards.map(function (a) {
        return '<div><dt>' + esc(a.name) + '</dt><dd>' + a.who.map(esc).join('<br>') + '</dd></div>';
      }).join('') + '</dl></section>';
  }
  return html;
}

function eventCard(ev, season, squads) {
  var parts = eventResultSummary(ev, squads);
  var multiShown = season.multi && squads.length > 1;
  var side = '';
  if (ev.status !== 'past') side += '<span class="tags">' + (ev.status === 'live' ? '<span class="tag live">NOW</span>' : '') + '<span class="tag">' + (ev.home ? 'HOME' : 'AWAY') + '</span></span>';
  if (parts.length) side += '<span class="ev-box">' + resultLine(parts, multiShown) + '</span>';
  else if (eventPending(ev)) side += '<span class="ev-pending">Results pending</span>';
  var games = [];
  squads.forEach(function (q) {
    var s = ev.squads[q];
    if (s) s.games.forEach(function (g) { games.push({ g: g, q: q }); });
  });
  games.sort(function (a, b) { return byGameTime(a.g, b.g); });
  var loc = esc(placeLine(ev));
  if (ev.directions) loc += (loc ? ' · ' : '') + '<a href="' + esc(ev.directions) + '" target="_blank" rel="noopener noreferrer">Directions ↗</a>';
  var body = games.length
    ? '<ul class="games">' + games.map(function (x) { return gameRow(x.g, x.q, multiShown); }).join('') + '</ul>'
    : '<p class="ev-note">' + (ev.status === 'past' ? 'No game results on file.' : 'Game times are posted closer to the tournament.') + '</p>';
  return '<article class="event is-' + ev.status + '" id="ev-' + esc(ev.id) + '" tabindex="-1">' +
    '<div class="ev-head"><div class="ev-main"><div class="ev-dates tnum">' + esc(fmtRangeLong(ev.start, ev.end) || 'Dates TBA') + '</div>' +
    '<h2 class="ev-name">' + esc(ev.name) + '</h2>' + (loc ? '<div class="ev-loc">' + loc + '</div>' : '') + '</div>' +
    (side ? '<div class="ev-side">' + side + '</div>' : '') + '</div>' + body + '</article>';
}

function gameRow(g, q, showSquad) {
  var letter = '–', cls = '', word = 'No result', score, scoreCls = 'g-score';
  if (g.result === 'win' || g.result === 'loss' || g.result === 'tie') {
    letter = g.result.charAt(0).toUpperCase(); cls = ' ' + g.result; word = g.result.charAt(0).toUpperCase() + g.result.slice(1);
    score = esc(dash(g.score));
  } else {
    scoreCls += ' other';
    if (g.result) score = esc(g.result === 'canceled' ? 'Canceled' : g.result.charAt(0).toUpperCase() + g.result.slice(1));
    else if (g.t && (CFG.today ? gameDate(g.t) >= TODAY : gameStart(g.t) > NOW)) score = 'Upcoming';
    else score = 'Result pending';
  }
  var sq = showSquad && q ? '<span class="g-sq g-sq-' + esc(q.toLowerCase()) + '">' + esc(q) + '<span class="g-sq-word"> team</span></span>' : '';
  var vs = '<span class="g-vs">vs</span>';
  var when = g.t ? DOW[gameDate(g.t).getDay()] + ' ' + (g.t.mo + 1) + '/' + g.t.d + (g.t.h != null ? ' · ' + fmtClock(g.t) : '') : 'TBA';
  return '<li class="game"><span class="g-when tnum">' + esc(when) + '</span>' +
    '<span class="g-opp">' + sq + vs + logoHtml(g.logo, g.opp) + '<span class="t">' + esc(g.opp) +
    (g.watch ? '<a href="' + esc(g.watch) + '" target="_blank" rel="noopener noreferrer">Watch ↗</a>' : '') + '</span></span>' +
    '<span class="g-letter' + cls + '"><span aria-hidden="true">' + letter + '</span><span class="sr-only">' + word + '</span></span>' +
    '<span class="' + scoreCls + ' tnum">' + score + '</span></li>';
}

/* calendar file */
function icsEscape(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
function icsFold(line) {
  var out = [], s = line;
  while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); }
  out.push(s);
  return out.join('\r\n');
}
function icsDate(d) { return d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()); }
function buildICS(season) {
  var stamp = new Date();
  var dtstamp = stamp.getUTCFullYear() + pad2(stamp.getUTCMonth() + 1) + pad2(stamp.getUTCDate()) + 'T' + pad2(stamp.getUTCHours()) + pad2(stamp.getUTCMinutes()) + '00Z';
  var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Michigan Mens Club Water Polo//Schedule//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:Michigan Water Polo ' + season.year, 'X-WR-TIMEZONE:America/Detroit',
    'BEGIN:VTIMEZONE', 'TZID:America/Detroit',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
    'END:VTIMEZONE'];
  var n = 0;
  season.events.forEach(function (ev) {
    var where = [ev.location, ev.host].filter(Boolean).join(', ');
    var timed = [];
    Object.keys(ev.squads).forEach(function (q) {
      ev.squads[q].games.forEach(function (g) { if (g.t && g.t.h != null) timed.push({ g: g, q: q }); });
    });
    if (timed.length) {
      timed.forEach(function (x) {
        var t = x.g.t;
        var start = t.y + pad2(t.mo + 1) + pad2(t.d) + 'T' + pad2(t.h) + pad2(t.mi) + '00';
        var sum = 'Michigan' + (season.multi && x.q ? ' ' + x.q : '') + ' vs. ' + x.g.opp;
        var desc = ev.name + (x.g.result && x.g.score ? ' · ' + x.g.result.toUpperCase() + ' ' + x.g.score : '');
        L.push('BEGIN:VEVENT', 'UID:umwp-' + season.year + '-' + (n++) + '-' + slug(ev.name + x.g.opp) + '@websites.umich.edu', 'DTSTAMP:' + dtstamp,
          'DTSTART;TZID=America/Detroit:' + start, 'DURATION:PT1H', icsFold('SUMMARY:' + icsEscape(sum)),
          icsFold('LOCATION:' + icsEscape(where)), icsFold('DESCRIPTION:' + icsEscape(desc)), 'END:VEVENT');
      });
    } else if (ev.start) {
      var end = new Date(ev.end || ev.start); end.setDate(end.getDate() + 1);
      L.push('BEGIN:VEVENT', 'UID:umwp-' + season.year + '-' + (n++) + '-' + slug(ev.name) + '@websites.umich.edu', 'DTSTAMP:' + dtstamp,
        'DTSTART;VALUE=DATE:' + icsDate(ev.start), 'DTEND;VALUE=DATE:' + icsDate(end), icsFold('SUMMARY:' + icsEscape('Michigan Water Polo: ' + ev.name)),
        icsFold('LOCATION:' + icsEscape(where)), 'END:VEVENT');
    }
  });
  L.push('END:VCALENDAR');
  return L.join('\r\n') + '\r\n';
}
export function downloadICS() {
  var season = DATA.seasons[state.schedYear];
  if (!season) return;
  var blob = new Blob([buildICS(season)], { type: 'text/calendar;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'michigan-water-polo-' + season.year + '.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
