/* Home page: photo slideshow, season summary and honors. */

import { findAsset } from '../assets.js';
import { SITE } from '../config.js';
import { honor, recStr, seasonRecord } from '../data.js';
import { TODAY, fmtRange } from '../dates.js';
import {
  eventPending, eventResultSummary, fmtRangeLong, listYears, placeLine, practiceDaysDash, resultLine,
  titlesBlurb
} from '../shared.js';
import { DATA } from '../store.js';
import { $, esc, pad2 } from '../util.js';

var heroTimer = null;

export function pageHome() {
  var season = DATA.latest;
  var evs = season ? season.events : [];
  var upcoming = evs.filter(function (e) { return e.status !== 'past'; });
  var past = evs.filter(function (e) { return e.status === 'past'; }).slice().reverse();
  var next = upcoming[0];
  var about = DATA.about;
  var nat = honor(about, /national/i), b10 = honor(about, /big ten champ/i), ru = honor(about, /runner/i);
  var lastTitle = b10 && b10.years.length ? b10.years[0] : null;
  var eyebrow = lastTitle && lastTitle >= TODAY.getFullYear() - 1 ? lastTitle + ' Big Ten champions' : 'CWPA · Big Ten Division · Ann Arbor, MI';

  var html = '';
  html += '<section class="hero on-navy" aria-label="Michigan Men\'s Water Polo">' +
    '<div class="hero-media stripes-navy" aria-hidden="true"></div>' +
    '<div class="slide-ctl" hidden><button type="button" data-act="slide-prev" aria-label="Previous photo">‹</button><output aria-live="off">01 / 01</output><button type="button" data-act="slide-next" aria-label="Next photo">›</button><button type="button" data-act="slide-pause" aria-label="Pause slideshow">❚❚</button></div>' +
    '<div class="wrap hero-inner">' +
    '<div class="eyebrow">' + esc(eyebrow) + '</div>' +
    '<h1 class="display">Michigan</h1>' +
    '<h2>Men\'s Water Polo</h2>' +
    '<p class="lede">A tight-knit, player-run club team competing in the CWPA Big Ten Division.</p>' +
    '<div class="actions"><a class="btn btn-maize" href="#join">Join the team</a><a class="btn btn-ghost-light" href="#schedule">Results</a></div>' +
    '</div></section>';

  // Season bar: the latest season's record (design) plus what's next or what just happened (live data).
  if (season && (next || past[0])) {
    var recParts = season.squads.map(function (q) {
      var r = seasonRecord(season, q);
      return r.n ? (season.multi && q ? q + ' ' : '') + recStr(r) : '';
    }).filter(Boolean);
    var bar = '<span class="label">' + season.year + ' season</span>';
    if (recParts.length) bar += '<span class="ev tnum">' + esc(recParts.join(' · ')) + (season.multi ? '' : ' overall') + '</span>';
    if (next) {
      bar += '<span class="when">' + (next.status === 'live' ? 'This weekend: ' : 'Next up: ') + esc(next.name) + (next.start ? ' · ' + esc(fmtRange(next.start, next.end)) : '') + (next.location ? ' · ' + esc(next.location) : '') + '</span>';
    } else {
      var lastParts = eventResultSummary(past[0], season.squads);
      bar += '<span class="when">Latest: ' + esc(past[0].name) + (lastParts.length ? ', went ' + esc(lastParts.map(function (p) { return (season.multi && p.q ? p.q + ' ' : '') + p.txt; }).join(', ')) : '') + '</span>';
    }
    bar += '<a class="textlink" href="#schedule"' + (next ? ' data-open="' + esc(next.id) + '" data-year="' + next.year + '"' : '') + '>All results →</a>';
    html += '<section class="nextbar"><div class="wrap">' + bar + '</div></section>';
  }

  html += '<section class="wrap pillars"><div class="rule-grid pillar-grid">' +
    pillar('01', 'Player-run', 'Elected officers handle budgeting, scheduling, recruiting, fundraising and road-trip logistics.') +
    (nat ? pillar('02', nat.years.length + '× National Champions', 'CWPA club national titles in ' + listYears(nat.years) + '.')
      : pillar('02', 'All skill levels', 'From former high-school starters to swimmers picking up a ball for the first time.')) +
    (b10 ? pillar('03', b10.years.length + ' Big Ten titles', titlesBlurb(b10.years))
      : pillar('03', 'CWPA Big Ten', 'We compete in the Big Ten division of the Collegiate Water Polo Association.')) +
    '</div></section>';

  var cells = [];
  if (nat) cells.push({ n: nat.years.length, suffix: '×', label: 'National champions' });
  if (b10) cells.push({ n: b10.years.length, suffix: '×', label: 'Big Ten champions' });
  SITE.stats.forEach(function (s) { cells.push(s); });
  var firstYear = Math.min.apply(null, [].concat(nat ? nat.years : [], b10 ? b10.years : [], ru ? ru.years : []).concat([9999]));
  html += '<section class="wrap honors" aria-labelledby="h-honors">' +
    '<div class="honors-head"><h2 id="h-honors" class="h2-sec">Banner years</h2>' + (firstYear < 9999 ? '<span class="label">Program honors since ' + firstYear + '</span>' : '') + '</div>' +
    '<div class="rule-grid board">' + cells.map(function (c) {
      return '<div class="board-cell"><div class="board-num">' + esc(c.n) + '<small>' + esc(c.suffix) + '</small></div><div class="label">' + esc(c.label) + '</div></div>';
    }).join('') + '</div>' +
    '<dl class="title-years">' + about.honors.map(function (h) {
      return '<div><dt>' + esc(h.label) + '</dt><dd class="tnum">' + h.years.join(' · ') + '</dd></div>';
    }).join('') + '</dl></section>';

  if (season) {
    html += '<section class="upcoming on-navy"><div class="wrap">' +
      '<div class="sec-head"><h2 class="display">' + season.year + ' season</h2><a class="textlink" href="#schedule">Every game →</a></div>';
    html += evs.length ? evs.map(function (ev) { return upRow(ev, season); }).join('')
      : '<div class="up-empty">No events on the calendar yet. The season runs September to mid-November.</div>';
    html += '</div></section>';
  }

  html += '<section class="wrap cta-pair">' +
    '<div class="cta cta-maize"><h3>Want to play?</h3><p>Practice runs ' + esc(practiceDaysDash(about)) + ', ' + esc(about.practiceTime) + ' at ' + esc(about.practicePlace) + '. Come try it.</p><a class="btn btn-navy btn-sm" href="#join">How to join</a></div>' +
    '<div class="cta cta-line"><h3>Largely student-funded</h3><p>Donations make travel and lodging at tournaments possible. Gifts are tax-deductible.</p><a class="btn btn-navy btn-sm" href="#support">Support the team</a></div>' +
    '</section>';
  return html;
}
function pillar(n, t, b) {
  return '<div class="pillar"><div class="n">' + n + '</div><h3>' + esc(t) + '</h3><p>' + esc(b) + '</p></div>';
}
function upRow(ev, season) {
  var side;
  if (ev.status === 'past') {
    var parts = eventResultSummary(ev, season.squads);
    side = parts.length ? '<span class="up-rec">' + resultLine(parts, season.multi) + '</span>'
      : '<span class="up-tag">' + (eventPending(ev) ? 'RESULTS PENDING' : 'FINAL') + '</span>';
  } else {
    side = '<span class="up-tag' + (ev.status === 'live' ? ' live' : '') + '">' + (ev.status === 'live' ? 'NOW · ' : '') + (ev.home ? 'HOME' : 'AWAY') + '</span>';
  }
  var teams = season.multi ? Object.keys(ev.squads).filter(Boolean).sort() : [];
  var loc = placeLine(ev) + (teams.length > 1 ? ' · ' + teams.join(' & ') + ' teams' : (teams.length === 1 ? ' · ' + teams[0] + ' team' : ''));
  return '<a class="up-row" href="#schedule" data-open="' + esc(ev.id) + '" data-year="' + ev.year + '">' +
    '<div class="up-date tnum">' + esc(fmtRangeLong(ev.start, ev.end) || 'TBA') + '</div>' +
    '<div><div class="up-ev">' + esc(ev.name) + '</div><div class="up-loc">' + esc(loc) + '</div></div>' + side + '</a>';
}

export function startHero() {
  stopHero();
  var root = $('.hero');
  if (!root) return;
  var media = $('.hero-media', root);
  var ctl = $('.slide-ctl', root);
  var mode = heroMode();
  var files = (mode === 'portrait' && DATA.slides.portrait.length ? DATA.slides.portrait : DATA.slides.landscape).slice();
  files = files.map(function (f) { return findAsset('bannerPhotos', f); }).filter(Boolean);
  media.innerHTML = '';
  media.dataset.mode = mode;
  if (!files.length) { ctl.hidden = true; return; }
  var imgs = [], idx = -1, bad = 0, paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var out = $('output', ctl);
  function el(k) {
    if (!imgs[k]) {
      var im = new Image();
      im.alt = ''; im.decoding = 'async';
      if (k === 0) im.setAttribute('fetchpriority', 'high');
      im.addEventListener('error', function () {
        if (im.dataset.bad) return;
        im.dataset.bad = '1';
        bad++;
        if (bad >= files.length) { stopHero(); ctl.hidden = true; return; }
        if (idx === -1 || idx === k || im.dataset.pending) showSlide(k + 1);
      });
      im.src = files[k];
      media.appendChild(im);
      imgs[k] = im;
    }
    return imgs[k];
  }
  function showSlide(k) {
    k = ((k % files.length) + files.length) % files.length;
    var tries = 0;
    while (imgs[k] && imgs[k].dataset.bad && tries++ < files.length) k = (k + 1) % files.length;
    var im = el(k);
    var show = function () {
      im.removeAttribute('data-pending');
      imgs.forEach(function (x, j) { if (x) x.classList.toggle('on', j === k); });
      idx = k;
      out.textContent = pad2(k + 1) + ' / ' + pad2(files.length);
      if (files.length > 1) el((k + 1) % files.length); // warm the next one
    };
    if (im.complete && im.naturalWidth) show();
    else { im.dataset.pending = '1'; im.addEventListener('load', show, { once: true }); }
  }
  ctl.hidden = files.length < 2;
  showSlide(0);
  if (files.length > 1) {
    heroTimer = window.setInterval(function () {
      if (!document.hidden && !paused) showSlide(idx + 1);
    }, 6500);
  }
  root._slides = {
    next: function () { showSlide(idx + 1); },
    prev: function () { showSlide(idx - 1); },
    pause: function (btn) {
      paused = !paused;
      btn.textContent = paused ? '▶' : '❚❚';
      btn.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    }
  };
  if (paused) { var pb = $('[data-act="slide-pause"]', ctl); pb.textContent = '▶'; pb.setAttribute('aria-label', 'Play slideshow'); }
}
export function heroMode() {
  return window.matchMedia('(max-aspect-ratio: 1/1)').matches && window.innerWidth < 900 ? 'portrait' : 'landscape';
}
export function stopHero() { if (heroTimer) { window.clearInterval(heroTimer); heroTimer = null; } }
