/* Contact page: contact form and exec board. */

import { SITE } from '../config.js';
import { field } from './join.js';
import { boardRow } from './roster.js';
import { DATA, state } from '../store.js';
import { esc } from '../util.js';

export function pageContact() {
  var reason = state.pendingReason && SITE.contactReasons.indexOf(state.pendingReason) >= 0 ? state.pendingReason : '';
  state.pendingReason = null;
  var a = DATA.about;
  var html = pageHead('paper', 'Contact', 'Get in touch');
  html += '<section class="wrap contact-grid">';
  html += '<div class="panel-paper on-paper" id="contact-panel"><div class="form-wrap">' +
    '<form class="form" id="contact-form" novalidate aria-label="Send a message">' +
    '<div class="field full" data-f="c-reason"><span class="flabel sr-only" id="l-reason">Reason</span>' +
    '<div class="pchips" role="radiogroup" aria-labelledby="l-reason">' + SITE.contactReasons.map(function (r) {
      return '<label class="pchip pchip-lg' + (r === reason ? ' on' : '') + '"><input type="radio" name="reason" value="' + esc(r) + '"' + (r === reason ? ' checked' : '') + '>' + esc(r) + '</label>';
    }).join('') + '</div><span class="err" aria-live="polite"></span></div>' +
    '<p class="athlete-note">Want to play? Use the <a href="#join">join form</a> instead so we get your swim time and experience.</p>' +
    '<div class="field full" data-f="c-subject"' + (reason === 'Other' ? '' : ' hidden') + '><label for="c-subject">Subject<span class="req" aria-hidden="true">*</span></label><input class="input" id="c-subject" name="subject"><span class="err" aria-live="polite"></span></div>' +
    field('c-name', 'Name', true, '<input class="input" id="c-name" name="name" autocomplete="name" placeholder="Name">', 'full') +
    field('c-email', 'Email', true, '<input class="input" id="c-email" name="email" type="email" autocomplete="email" placeholder="Email">') +
    field('c-phone', 'Phone', true, '<input class="input" id="c-phone" name="phone" type="tel" autocomplete="tel" placeholder="Phone">') +
    field('c-msg', 'Message', true, '<textarea class="input" id="c-msg" name="message" rows="5" placeholder="Message"></textarea>', 'full') +
    '<p class="form-msg" role="alert" hidden></p>' +
    '<p class="form-note">Pick a reason above. Fields marked <span class="req">*</span> are required, and we\'ll reply by email.</p>' +
    '<button class="btn btn-navy submit inline" type="submit">Send</button>' +
    '</form></div></div>';

  var dir = canhamDirections();
  var isCanham = /canham/i.test(a.practicePlace);
  var mapHref = dir || (isCanham ? 'https://www.google.com/maps/dir//Canham+Natatorium,+East+Hoover+Avenue,+Ann+Arbor,+MI' : '');
  html += '<div class="c-list">';
  html += '<div class="c-item"><div class="label">Practice</div><div class="v">' + esc(a.practicePlace) + '</div>' +
    (mapHref ? '<a class="addr" href="' + esc(mapHref) + '" target="_blank" rel="noopener noreferrer">' + (isCanham ? '500 E Hoover Ave, Ann Arbor' : 'Directions') + ' ↗</a>' : '') +
    '<div class="c-sub">' + esc(a.practiceTime) + ', ' + esc(a.practiceDays) + ', during the season.</div></div>';
  html += '<div class="c-item"><div class="label">Follow</div><div class="social">' + SITE.social.map(function (s) {
    return '<a href="' + esc(s.href) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + ' ↗</a>';
  }).join('') + '</div></div>';
  if (a.links.length) {
    html += '<div class="c-item"><div class="label">Links</div><div class="links-row">' + a.links.map(function (l) {
      return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + '</a>';
    }).join('') + '</div></div>';
  }
  var board = a.eboard || [];
  if (board.length) html += '<div class="c-item"><div class="label">Executive board</div>' + board.map(boardRow).join('') + '</div>';
  html += '</div></section>';
  return html;
}
function canhamDirections() {
  var place = DATA.about.practicePlace.toLowerCase();
  var found = '';
  DATA.seasonYears.some(function (y) {
    var s = DATA.seasons[y];
    return s && s.events.some(function (ev) {
      if (ev.directions && ev.location.toLowerCase() === place) { found = ev.directions; return true; }
      return false;
    });
  });
  return found;
}

export function pageHead(kind, eyebrow, title) {
  if (kind === 'navy') return '<section class="pagehead-navy on-navy"><div class="wrap"><div class="eyebrow">' + esc(eyebrow) + '</div><h1 class="display h1-page">' + esc(title) + '</h1></div></section>';
  return '<section class="pagehead-paper"><div class="wrap"><div class="eyebrow">' + esc(eyebrow) + '</div><h1 class="display h1-page">' + esc(title) + '</h1></div></section>';
}
