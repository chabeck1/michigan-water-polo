/* Loads data/*.json and reshapes each file for the pages. */

import { CFG, SITE } from './config.js';
import { richText, sanitize } from './content.js';
import { TODAY, gameDate, parseDay, parseGameTime, parseLongDate } from './dates.js';
import { slug } from './util.js';

// Links typed in the CMS: keep http(s) links, add https:// to a bare domain ("youtube.com/x"), drop anything else.
function webUrl(v) {
  var s = String(v || '').trim();
  if (/^https?:\/\//i.test(s)) return s;
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+([\/?#]\S*)?$/i.test(s) ? 'https://' + s : '';
}
// Directions: a link, or plain text such as an address, which becomes a Google Maps search.
function mapsUrl(v) {
  var s = String(v || '').trim();
  return webUrl(s) || (s ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s) : '');
}

// roster.json: { seasons: [{ year, photo, people: [{ name, class, major, hometown, headshot, captain }] }] }
// Two entries for the same year are combined; a player already listed for that year isn't added again.
function normRoster(raw) {
  var byYear = {};
  ((raw && raw.seasons) || []).forEach(function (s) {
    var year = +s.year;
    if (!year) return;
    var season = byYear[year], earlier = {};
    if (season) season.people.forEach(function (p) { earlier[p.name.toLowerCase()] = true; });
    else season = byYear[year] = { year: year, photo: '', people: [] };
    if (!season.photo && s.photo) season.photo = s.photo;
    (s.people || []).forEach(function (p) {
      var name = String((p && p.name) || '').trim();
      if (!name || earlier[name.toLowerCase()]) return;
      season.people.push({
        name: name,
        cls: String(p.class || '').trim().toUpperCase(),
        major: String(p.major || '').trim(),
        hometown: String(p.hometown || '').trim(),
        headshot: p.headshot || '',
        captain: p.captain === true
      });
    });
  });
  return Object.keys(byYear).map(function (y) { return byYear[y]; }).sort(function (a, b) { return b.year - a.year; });
}

// Games in time order; games without a time go last, otherwise list order is kept.
export function byGameTime(a, b) {
  if (!a.t !== !b.t) return a.t ? -1 : 1;
  if (!a.t) return 0;
  return (gameDate(a.t) - gameDate(b.t)) || ((a.t.h || 0) * 60 + (a.t.mi || 0)) - ((b.t.h || 0) * 60 + (b.t.mi || 0));
}

function normGames(list, year) {
  return (list || []).filter(Boolean).map(function (g) {
    var res = String(g.result || '').toLowerCase().trim();
    if (res === 'cancelled') res = 'canceled';
    return {
      opp: String(g.opponent || 'TBA').trim(),
      logo: g.logo || '',
      t: parseGameTime(g.time, year),
      result: res,
      score: g.score && g.score !== 'N/A' ? String(g.score) : '',
      watch: webUrl(g.watch)
    };
  }).sort(byGameTime);
}

function isHome(host) { return /university of michigan|^michigan$|^u-?m$/i.test(String(host || '').trim()) && !/state/i.test(host); }

// schedule.json: { seasons: [{ year, team, tournaments: [{ name, start, end, location, host, directions, games }] }] }
// A year listed for two teams (A and B) is one season. A tournament with the same name in the A and B lists is one
// event; a second tournament with that name in one team's list is a separate event.
function normSchedule(raw) {
  var byYear = {};
  ((raw && raw.seasons) || []).forEach(function (entry) {
    var year = +entry.year;
    if (!year) return;
    var squad = String(entry.team || '').trim();
    var s = byYear[year] || (byYear[year] = { year: year, squadKeys: [], map: {}, order: 0 });
    if (s.squadKeys.indexOf(squad) < 0) s.squadKeys.push(squad);
    (entry.tournaments || []).forEach(function (t) {
      var name = String((t && t.name) || '').trim();
      if (!name) return;
      var first = parseDay(t.start, year), last = parseDay(t.end, year);
      // Join an event with this name that this team isn't in yet, preferring one that starts the same day.
      var key = null, k = name, n = 1;
      for (; s.map[k]; k = name + '\u0000' + (++n)) {
        if (s.map[k].squads[squad]) continue;
        if (key === null || (first && s.map[k].first && +s.map[k].first === +first)) key = k;
      }
      var ev = key === null ? null : s.map[key];
      if (!ev) {
        ev = s.map[k] = {
          id: slug(year + '-' + name) + (n > 1 ? '--' + n : ''), name: name, year: year, order: s.order++,
          location: '', host: '', directions: '', first: null, last: null, squads: {}
        };
      }
      ev.squads[squad] = { games: normGames(t.games, year) };
      if (!ev.location && t.location) ev.location = t.location;
      if (!ev.host && t.host) ev.host = t.host;
      if (!ev.directions && t.directions) ev.directions = mapsUrl(t.directions);
      if (first && (!ev.first || first < ev.first)) ev.first = first;
      if (last && (!ev.last || last > ev.last)) ev.last = last;
    });
  });
  var seasons = {};
  Object.keys(byYear).forEach(function (y) {
    var s = byYear[y];
    var multi = s.squadKeys.length > 1;
    var squads = multi ? s.squadKeys.slice().sort() : [''];
    var events = Object.keys(s.map).map(function (k) {
      var ev = s.map[k];
      if (!multi) {
        var only = ev.squads[Object.keys(ev.squads)[0]];
        ev.squads = { '': only };
      }
      var first = ev.first || ev.last, last = ev.last && ev.last >= first ? ev.last : first;
      var range = first ? { start: first, end: last } : null;
      delete ev.first; delete ev.last;
      var all = [];
      Object.keys(ev.squads).forEach(function (q) { all = all.concat(ev.squads[q].games); });
      var gd = all.filter(function (g) { return g.t; }).map(function (g) { return gameDate(g.t); }).sort(function (a, b) { return a - b; });
      ev.start = range ? range.start : (gd[0] || null);
      ev.end = range ? range.end : (gd[gd.length - 1] || ev.start);
      if (gd.length && range && (gd[gd.length - 1] > ev.end || gd[0] < ev.start)) {
        if (gd[0] < ev.start) ev.start = gd[0];
        if (gd[gd.length - 1] > ev.end) ev.end = gd[gd.length - 1];
      }
      ev.home = isHome(ev.host);
      // With no dates yet, an event counts as played only once it has a result.
      ev.status = !ev.start ? (record(all).n ? 'past' : 'upcoming') : (ev.end < TODAY ? 'past' : (ev.start > TODAY ? 'upcoming' : 'live'));
      ev.allGames = all;
      return ev;
    });
    events.sort(function (a, b) {
      if (!a.start !== !b.start) return a.start ? -1 : 1; // events with no dates yet go last
      if (a.start && b.start && +a.start !== +b.start) return a.start - b.start;
      return a.order - b.order;
    });
    seasons[y] = { year: +y, squads: squads, multi: multi, events: events };
  });
  return seasons;
}

// Wins, losses and ties; canceled and forfeit games don't count toward a record.
export function record(games) {
  var r = { w: 0, l: 0, t: 0, n: 0 };
  games.forEach(function (g) {
    if (g.result === 'win') r.w++;
    else if (g.result === 'loss') r.l++;
    else if (g.result === 'tie') r.t++;
    else return;
    r.n++;
  });
  return r;
}
export function recStr(r) { return r.w + '–' + r.l + (r.t ? '–' + r.t : ''); }
export function seasonRecord(season, squad) {
  var games = [];
  season.events.forEach(function (ev) {
    var s = ev.squads[squad];
    if (s) games = games.concat(s.games);
  });
  return record(games);
}

// "Monday-Thursday", "Mon – Thu", "Monday to Thursday" are read as a range; anything else is shown as typed.
var DAY = '((?:mon|tue|wed|thu|fri|sat|sun)[a-z]*\\.?)';
export var DAY_RANGE = new RegExp('^' + DAY + '(?:\\s*[-–—]\\s*|\\s+(?:to|thru|through|until)\\s+)' + DAY + '$', 'i');
function practiceDays(s) {
  s = String(s || 'Monday through Thursday').trim();
  var m = DAY_RANGE.exec(s);
  return m ? m[1] + ' through ' + m[2] : s;
}
// Coach and exec board groups: people without a name, and groups left completely empty, are skipped.
function roleGroups(list) {
  return (list || []).map(function (g) {
    g = g || {};
    return { role: String(g.role || '').trim(), people: (g.people || []).filter(function (p) { return p && String(p.name || '').trim(); }) };
  }).filter(function (g) { return g.role || g.people.length; });
}

// about.json: { practice: { days, time, place }, honors: { national, bigTen, bigTenRunnerUp }, links, coaches, eboard }
var HONORS = [['national', 'National Champions'], ['bigTen', 'Big Ten Champions'], ['bigTenRunnerUp', 'Big Ten Runner-Up']];
function normAbout(raw) {
  raw = raw || {};
  var practice = raw.practice || {}, honors = raw.honors || {};
  return {
    honors: HONORS.map(function (h) {
      var years = (honors[h[0]] || []).map(Number).filter(Boolean).sort(function (a, b) { return b - a; });
      return { label: h[1], years: years };
    }).filter(function (h) { return h.years.length; }),
    links: (raw.links || []).map(function (l) { return { label: String((l && l.label) || '').trim(), href: webUrl(l && l.url) }; })
      .filter(function (l) { return l.label && l.href; }),
    coaches: roleGroups(raw.coaches),
    eboard: roleGroups(raw.eboard),
    practiceTime: String(practice.time || '9:30–11:30 PM').trim().replace(/\s*-\s*/, '–'),
    practiceDays: practiceDays(practice.days),
    practicePlace: String(practice.place || 'Canham Natatorium').trim()
  };
}
export function honor(about, re) {
  for (var i = 0; i < about.honors.length; i++) if (re.test(about.honors[i].label)) return about.honors[i];
  return null;
}

// News, newest first; posts without a date go last, in list order.
function normNews(raw) {
  var list = (raw && raw.news) || (Array.isArray(raw) ? raw : []);
  return list.filter(Boolean).map(function (p, i) {
    var d = parseLongDate(p.date);
    return { title: p.title || '', date: p.date || '', d: d, year: d ? d.getFullYear() : null, html: richText(p.content || p.body || ''), i: i };
  }).sort(function (a, b) {
    if (!a.d !== !b.d) return a.d ? -1 : 1;
    if (a.d && b.d && +a.d !== +b.d) return b.d - a.d;
    return a.i - b.i;
  });
}

export function normAll(raw) {
  var d = {};
  function attempt(name, fn, fallback) {
    try { return fn(); } catch (e) { if (window.console) console.error('Could not read ' + name, e); return fallback; }
  }
  d.roster = attempt('roster.json', function () { return normRoster(raw.roster); }, []);
  d.seasons = attempt('schedule.json', function () { return normSchedule(raw.schedule); }, {});
  // awards.json: { seasons: [{ year, awards: [{ name, recipients }] }] }; two entries for one year are combined.
  d.awards = attempt('awards.json', function () {
    var o = {};
    ((raw.awards && raw.awards.seasons) || []).forEach(function (s) {
      if (!+s.year) return;
      var list = (s.awards || []).filter(function (a) { return a && String(a.name || '').trim(); })
        .map(function (a) { return { name: String(a.name).trim(), who: [].concat(a.recipients || []) }; });
      o[String(+s.year)] = (o[String(+s.year)] || []).concat(list);
    });
    return o;
  }, {});
  d.about = attempt('about.json', function () { return normAbout(raw.about); }, normAbout({}));
  d.news = attempt('news.json', function () { return normNews(raw.news); }, []);
  d.fund = attempt('fundraising.json', function () {
    var f = raw.fundraising || {};
    return { html: sanitize(f.message || ''), give: webUrl(f.giveUrl) || SITE.give };
  }, { html: '', give: SITE.give });
  d.slides = attempt('slideshow.json', function () {
    var s = raw.slideshow || {};
    return { landscape: (s.landscape || []).slice(), portrait: (s.portrait || []).slice() };
  }, { landscape: [], portrait: [] });
  d.banner = raw.banner || null;
  d.alumni = attempt('alumni.json', function () {
    var a = raw.alumni || {}, seen = {};
    var list = (a.companies || []).map(function (c) {
      if (typeof c === 'string') c = { name: c };
      c = c || {};
      return { name: String(c.name || '').trim(), logo: String(c.logo || '').trim() };
    }).filter(function (c) { var k = c.name.toLowerCase(); if (!c.name || seen[k]) return false; seen[k] = true; return true; });
    // "count" can be bigger than the list (e.g. "60+") when the ticker only shows a selection.
    return { companies: list, count: String(a.count == null ? '' : a.count).trim() || String(list.length) };
  }, { companies: [], count: '' });
  var years = Object.keys(d.seasons).map(Number);
  Object.keys(d.awards).forEach(function (y) { if (years.indexOf(+y) < 0) years.push(+y); });
  d.seasonYears = years.sort(function (a, b) { return b - a; });
  d.latest = d.seasons[Object.keys(d.seasons).map(Number).sort(function (a, b) { return b - a; })[0]] || null;
  return d;
}

// Reads every data/*.json file. A file that's missing, empty or broken just leaves its part of the site empty.
export function loadData() {
  var names = ['roster', 'schedule', 'about', 'news', 'awards', 'fundraising', 'slideshow', 'banner', 'alumni'];
  return Promise.all(names.map(function (n) {
    return fetch(CFG.dataPath + n + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return undefined; });
  })).then(function (res) {
    var out = {};
    names.forEach(function (n, i) { out[n] = res[i]; });
    return out;
  });
}
