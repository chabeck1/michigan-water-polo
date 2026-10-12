/* Join and Contact forms: checking the fields and sending them to Google Forms. */

import { SITE } from './config.js';
import { practiceShort } from './shared.js';
import { DATA } from './store.js';
import { $, $$, esc, plural } from './util.js';

function setErr(form, key, msg) {
  var f = $('[data-f="' + key + '"]', form);
  if (!f) return;
  f.classList.toggle('bad', !!msg);
  var e = $('.err', f);
  if (e) e.textContent = msg || '';
  $$('input, select, textarea', f).forEach(function (el) {
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  });
}
function val(form, name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; }
function validEmail(s) { return /^\S+@\S+\.\S+$/.test(s); }
function phoneOut(s) {
  var d = s.replace(/\D/g, '');
  if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
  if (d.length === 10 && s.trim().charAt(0) !== '+') return '+1 (' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  return s.trim();
}
function validPhone(s) { return s.replace(/\D/g, '').length >= 10; }

function submitTo(url, params) {
  var body = new URLSearchParams();
  Object.keys(params).forEach(function (k) { body.append(k, params[k]); });
  return fetch(url, { method: 'POST', mode: 'no-cors', body: body });
}
function showDone(panel, heading, text, tag) {
  var wrap = $('.form-wrap', panel);
  wrap.innerHTML = '<div class="done" tabindex="-1">' + (tag === 'h2' ? '<h2 class="h2-sec">' : '<h3>') + esc(heading) + (tag === 'h2' ? '</h2>' : '</h3>') +
    '<p>' + esc(text) + '</p>' +
    '<a class="btn ' + (tag === 'h2' ? 'btn-navy' : 'btn-maize') + '" href="#home">Back to home</a></div>';
  var d = $('.done', wrap); if (d) d.focus();
}

export function bindAthleteForm() {
  var form = $('#athlete-form');
  if (!form) return;
  var positions = [];
  form.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act="pos"]');
    if (!b) return;
    var v = b.dataset.val;
    if (v === 'Unsure') positions = positions.indexOf('Unsure') >= 0 ? [] : ['Unsure'];
    else {
      positions = positions.filter(function (p) { return p !== 'Unsure'; });
      var i = positions.indexOf(v);
      if (i >= 0) positions.splice(i, 1); else positions.push(v);
    }
    $$('[data-act="pos"]', form).forEach(function (x) { x.setAttribute('aria-pressed', positions.indexOf(x.dataset.val) >= 0 ? 'true' : 'false'); });
    if (form.dataset.tried) setErr(form, 'positions', positions.length ? '' : 'Pick at least one, or Unsure.');
  });
  function check() {
    var errs = {};
    if (!val(form, 'name')) errs['a-name'] = 'Name is required.';
    var em = val(form, 'email');
    if (!em) errs['a-email'] = 'Email is required.'; else if (!validEmail(em)) errs['a-email'] = 'That email doesn\'t look right.';
    var ph = val(form, 'phone');
    if (!ph) errs['a-phone'] = 'Phone is required.'; else if (!validPhone(ph)) errs['a-phone'] = 'Enter a 10-digit phone number.';
    if (!val(form, 'gradMonth') || !val(form, 'gradYear')) errs.grad = 'Pick a month and year.';
    if (!val(form, 'degree')) errs['a-degree'] = 'Expected degree is required.';
    if (!val(form, 'free')) errs['a-free'] = '100 free time is required.';
    if (!val(form, 'experience')) errs['a-exp'] = 'Years of experience is required.';
    if (!val(form, 'hand')) errs['a-hand'] = 'Dominant hand is required.';
    if (!positions.length) errs.positions = 'Pick at least one, or Unsure.';
    ['a-name', 'a-email', 'a-phone', 'grad', 'a-degree', 'a-free', 'a-exp', 'a-hand', 'positions'].forEach(function (k) { setErr(form, k, errs[k]); });
    return errs;
  }
  form.addEventListener('input', function () { if (form.dataset.tried) check(); });
  form.addEventListener('change', function () { if (form.dataset.tried) check(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.dataset.tried = '1';
    var errs = check();
    var msg = $('.form-msg', form);
    var keys = Object.keys(errs);
    if (keys.length) {
      msg.hidden = false; msg.textContent = 'Check the ' + plural(keys.length, 'field') + ' marked above.';
      var first = $('.field.bad input, .field.bad select, .field.bad textarea, .field.bad button', form);
      if (first) first.focus();
      return;
    }
    msg.hidden = true;
    var F = SITE.forms.athlete.entry, p = {};
    p[F.name] = val(form, 'name'); p[F.email] = val(form, 'email'); p[F.phone] = phoneOut(val(form, 'phone'));
    p[F.city] = val(form, 'city'); p[F.state] = val(form, 'state'); p[F.grad] = val(form, 'gradMonth') + '/' + val(form, 'gradYear');
    p[F.degree] = val(form, 'degree'); p[F.free] = val(form, 'free'); p[F.experience] = val(form, 'experience');
    p[F.hand] = val(form, 'hand'); p[F.position] = positions.join(','); p[F.teams] = val(form, 'teams');
    p[F.awards] = val(form, 'awards'); p[F.info] = val(form, 'info');
    var btn = $('.submit', form); btn.disabled = true; btn.textContent = 'Sending…';
    submitTo(SITE.forms.athlete.url, p).then(function () {
      showDone($('#join-panel'), 'Got it.', 'Thanks, ' + val(form, 'name').split(' ')[0] + '. We\'ll be in touch. Practice is ' + practiceShort(DATA.about) + ', so bring a suit.');
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Try again';
      msg.hidden = false; msg.textContent = 'That didn\'t go through. Check your connection and try again.';
    });
  });
}

export function bindContactForm() {
  var form = $('#contact-form');
  if (!form) return;
  // reason chips are radio buttons styled as v3 topic chips; the value posts to the same Google Form field
  function syncReason() {
    $$('input[name="reason"]', form).forEach(function (r) { r.closest('.pchip').classList.toggle('on', r.checked); });
    var f = $('[data-f="c-subject"]', form);
    if (f) f.hidden = val(form, 'reason') !== 'Other';
  }
  form.addEventListener('change', function (e) { if (e.target && e.target.name === 'reason') syncReason(); });
  syncReason();
  function check() {
    var errs = {};
    if (!val(form, 'name')) errs['c-name'] = 'Name is required.';
    var em = val(form, 'email');
    if (!em) errs['c-email'] = 'Email is required.'; else if (!validEmail(em)) errs['c-email'] = 'That email doesn\'t look right.';
    var ph = val(form, 'phone');
    if (!ph) errs['c-phone'] = 'Phone is required.'; else if (!validPhone(ph)) errs['c-phone'] = 'Enter a 10-digit phone number.';
    if (!val(form, 'reason')) errs['c-reason'] = 'Pick a reason.';
    if (val(form, 'reason') === 'Other' && !val(form, 'subject')) errs['c-subject'] = 'Add a subject.';
    if (!val(form, 'message')) errs['c-msg'] = 'Message is required.';
    ['c-name', 'c-email', 'c-phone', 'c-reason', 'c-subject', 'c-msg'].forEach(function (k) { setErr(form, k, errs[k]); });
    return errs;
  }
  form.addEventListener('input', function () { if (form.dataset.tried) check(); });
  form.addEventListener('change', function () { if (form.dataset.tried) check(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.dataset.tried = '1';
    var errs = check();
    var msg = $('.form-msg', form);
    var keys = Object.keys(errs);
    if (keys.length) {
      msg.hidden = false; msg.textContent = 'Check the ' + plural(keys.length, 'field') + ' marked above.';
      var first = $('.field.bad input, .field.bad select, .field.bad textarea', form);
      if (first) first.focus();
      return;
    }
    msg.hidden = true;
    var F = SITE.forms.contact.entry, p = {};
    p[F.name] = val(form, 'name'); p[F.email] = val(form, 'email'); p[F.phone] = phoneOut(val(form, 'phone'));
    p[F.reason] = val(form, 'reason') === 'Other' ? val(form, 'subject') : val(form, 'reason');
    p[F.message] = val(form, 'message');
    var btn = $('.submit', form); btn.disabled = true; btn.textContent = 'Sending…';
    submitTo(SITE.forms.contact.url, p).then(function () {
      showDone($('#contact-panel'), 'Message sent', 'Thanks, ' + val(form, 'name').split(' ')[0] + '. An officer will get back to you soon. Go Blue!', 'h2');
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Try again';
      msg.hidden = false; msg.textContent = 'That didn\'t go through. Check your connection and try again.';
    });
  });
}
