/* Which page is showing: links like #schedule-2024, page titles, the menu and button clicks. */

import { ROUTES, SITE, TITLES } from './config.js';
import { internalRoute } from './content.js';
import { bindAthleteForm, bindContactForm } from './forms.js';
import { pageAlumni } from './pages/alumni.js';
import { pageContact } from './pages/contact.js';
import { heroMode, pageHome, startHero, stopHero } from './pages/home.js';
import { pageJoin } from './pages/join.js';
import { pageNews } from './pages/news.js';
import { pageRoster } from './pages/roster.js';
import { downloadICS, pageSchedule } from './pages/schedule.js';
import { pageSupport } from './pages/support.js';
import { DATA, state } from './store.js';
import { $, $$, esc } from './util.js';

var PAGES = { home: pageHome, roster: pageRoster, schedule: pageSchedule, news: pageNews, alumni: pageAlumni, join: pageJoin, support: pageSupport, contact: pageContact };

export function parseHash() {
  var h = decodeURIComponent(location.hash.replace(/^#/, '')).toLowerCase();
  var m = /^(roster|schedule)-(\d{4})$/.exec(h);
  if (m) return { route: m[1], year: +m[2] };
  if (h === '' || ROUTES.indexOf(h) >= 0) return { route: h || 'home' };
  var alias = internalRoute(h);
  if (alias) return { route: alias };
  return null;
}

function render(opts) {
  opts = opts || {};
  var main = $('#main');
  stopHero();
  var html;
  try { html = PAGES[state.route](); }
  catch (e) {
    if (window.console) console.error(e);
    html = '<section class="wrap" style="padding-block:80px"><div class="inline-error">Something went wrong showing this page. Try reloading.</div></section>';
  }
  main.innerHTML = html;
  $$('.nav a, .mobile-nav a').forEach(function (a) {
    var r = a.getAttribute('data-route');
    if (r === state.route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.title = (TITLES[state.route] ? TITLES[state.route] + ' · ' : '') + SITE.name;
  if (state.route === 'home') startHero();
  if (state.route === 'join') bindAthleteForm();
  if (state.route === 'contact') bindContactForm();
  if (opts.focus) {
    var el = $(opts.focus, main);
    if (el) el.focus();
  }
}

export function go(route, opts) {
  opts = opts || {};
  state.route = route;
  closeMenu();
  render(opts);
  if (state.pendingOpen) {
    var target = document.getElementById('ev-' + state.pendingOpen);
    state.pendingOpen = null;
    if (target) {
      var head = $('.site-header');
      var y = target.getBoundingClientRect().top + window.pageYOffset - (head ? head.offsetHeight : 0) - 12;
      window.scrollTo(0, Math.max(0, y));
      target.focus({ preventScroll: true });
      return;
    }
  }
  if (!opts.keepScroll) window.scrollTo(0, 0);
  if (!opts.initial) { var m = $('#main'); m.focus({ preventScroll: true }); }
}

function onHash() {
  var p = parseHash();
  if (!p) return; // in-page anchor
  if (p.year) { if (p.route === 'roster') state.rosterYear = p.year; else state.schedYear = p.year; }
  go(p.route);
}

function rerender(focusSel) {
  render({ focus: focusSel });
}

/* menu */
function closeMenu() {
  var btn = $('.menu-btn'), nav = $('#mobile-nav');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  if (nav) nav.hidden = true;
}

document.addEventListener('click', function (e) {
  var t = e.target;
  var link = t.closest('a[href^="#"]');
  if (link) {
    if (link.dataset.reason) state.pendingReason = link.dataset.reason;
    if (link.dataset.open) {
      state.pendingOpen = link.dataset.open;
      state.schedYear = +link.dataset.year || state.schedYear;
      state.schedSquad = 'All';
    }
    if (link.classList.contains('skip')) { e.preventDefault(); $('#main').focus(); return; }
    var href = link.getAttribute('href');
    var wanted = href.replace(/^#/, '').toLowerCase() || 'home';
    if (('#' + wanted) === location.hash.toLowerCase() || (wanted === 'home' && !location.hash)) {
      // same hash: hashchange won't fire, so route manually
      e.preventDefault();
      var p = (wanted === 'home') ? { route: 'home' } : (ROUTES.indexOf(wanted) >= 0 ? { route: wanted } : null);
      if (p) go(p.route);
    }
    return;
  }
  var act = t.closest('[data-act]');
  if (!act) return;
  var a = act.dataset.act, v = act.dataset.val;
  if (a === 'roster-class') { state.rosterClass = v; rerender('[data-act="roster-class"][data-val="' + v + '"]'); }
  else if (a === 'roster-year') { state.rosterYear = +v; state.rosterClass = 'All'; rerender('[data-act="roster-year"][data-val="' + v + '"]'); }
  else if (a === 'sched-year') { state.schedYear = +v; state.schedSquad = 'All'; rerender('[data-act="sched-year"][data-val="' + v + '"]'); }
  else if (a === 'sched-squad') { state.schedSquad = v; rerender('[data-act="sched-squad"][data-val="' + v + '"]'); }
  else if (a === 'faq') {
    var i = +v;
    state.faqOpen = state.faqOpen === i ? -1 : i;
    $$('.faq button[data-act="faq"]').forEach(function (b) {
      var j = +b.dataset.val, o = state.faqOpen === j;
      b.setAttribute('aria-expanded', String(o));
      $('.sign', b).textContent = o ? '–' : '+';
      var p = document.getElementById('faq-' + j); if (p) p.hidden = !o;
    });
  }
  else if (a === 'ics') downloadICS();
  else if (a === 'slide-next' || a === 'slide-prev' || a === 'slide-pause') {
    var hero = $('.hero');
    if (hero && hero._slides) {
      if (a === 'slide-next') hero._slides.next(); else if (a === 'slide-prev') hero._slides.prev(); else hero._slides.pause(act);
    }
  }
  else if (a === 'menu') {
    var nav = $('#mobile-nav');
    var expanded = act.getAttribute('aria-expanded') === 'true';
    act.setAttribute('aria-expanded', String(!expanded));
    nav.hidden = expanded;
  }
  else if (a === 'announce-close') { state.announceClosed = true; var an = $('#announce'); if (an) an.innerHTML = ''; }
});

document.addEventListener('change', function (e) {
  var t = e.target;
  if (!t.dataset || !t.dataset.act) return;
  if (t.dataset.act === 'roster-year') { state.rosterYear = +t.value; state.rosterClass = 'All'; rerender('[data-act="roster-year"]'); }
  else if (t.dataset.act === 'sched-year-select' && t.value) { state.schedYear = +t.value; state.schedSquad = 'All'; rerender('[data-act="sched-year-select"][data-val="' + t.dataset.val + '"]'); }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    var btn = $('.menu-btn');
    if (btn && btn.getAttribute('aria-expanded') === 'true') { closeMenu(); btn.focus(); }
  }
});

var resizeT = null;
window.addEventListener('resize', function () {
  clearTimeout(resizeT);
  resizeT = setTimeout(function () {
    if (state.route !== 'home') return;
    var media = $('.hero-media');
    if (media && media.dataset.mode && media.dataset.mode !== heroMode()) startHero();
  }, 200);
});
window.addEventListener('hashchange', onHash);

export function renderAnnouncement() {
  var b = DATA.banner, host = $('#announce');
  if (!host) return;
  host.innerHTML = '';
  if (!b || !b.display || state.announceClosed) return;
  if (b.expire && new Date(b.expire) - new Date() <= 0) return;
  var href = b.link || '';
  var r = internalRoute(href);
  href = r ? '#' + r : (/^https?:\/\//i.test(href) ? href : '#schedule');
  host.innerHTML = '<div class="announce" role="region" aria-label="Announcement"><div class="wrap">' +
    '<a href="' + esc(href) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(b.header) + (b.subheader ? '<span>' + esc(b.subheader) + '</span>' : '') + '</a>' +
    '<button type="button" data-act="announce-close" aria-label="Dismiss announcement">Close ✕</button></div></div>';
}

export function renderFooterLinks() {
  var ul = $('#f-links');
  if (!ul) return;
  ul.innerHTML = DATA.about.links.map(function (l) {
    return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + '</a>';
  }).join('');
  ul.hidden = !DATA.about.links.length;
  var soc = $('#f-social');
  if (soc) soc.innerHTML = SITE.social.map(function (s) {
    return '<a href="' + esc(s.href) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + '</a>';
  }).join('');
  var yr = $('#yr'); if (yr) yr.textContent = String(new Date().getFullYear());
}
