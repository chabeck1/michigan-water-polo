/* Join page: practice info, FAQ and the athlete form. */

import { findAsset } from '../assets.js';
import { MONTHS, SITE } from '../config.js';
import { TODAY } from '../dates.js';
import { practiceShort } from '../shared.js';
import { DATA, state } from '../store.js';
import { esc, pad2 } from '../util.js';

export function pageJoin() {
  var a = DATA.about;
  var b = DATA.latest && DATA.latest.multi ? DATA.latest : null;
  var faqs = [
    ['When and where is practice?', 'During the regular season we practice ' + a.practiceTime + ', ' + a.practiceDays + ', at ' + a.practicePlace + '.'],
    ['When is the season?', 'The CWPA season runs from September to mid-November. In the off-season we can play any team in the country, in any division.'],
    ['Who runs the team?', 'The players. Elected officers handle budgeting, scheduling, recruiting, fundraising and travel.'],
    ['Who is eligible?', 'Enrolled University of Michigan students, undergraduate and graduate.'],
    ['Do I need experience?', 'No. We welcome all experience levels, so don\'t be discouraged if you have zero years of experience or no water polo awards. The only requirement to join is being able to swim 500 yards unassisted.']
  ];
  if (b) faqs.push(['Is there a B team?', 'Yes. In ' + b.year + ' Michigan entered ' + b.squads.map(function (q) { return (/^[AEFHILMNORSX]/.test(q) ? 'an ' : 'a ') + q + ' team'; }).join(' and ') + ' in Big Ten play.']);
  var yearNow = TODAY.getFullYear();
  var gradYears = [];
  for (var gy = yearNow; gy <= yearNow + 6; gy++) gradYears.push(gy);
  var photo = findAsset('img', 'willnchase.jpg');

  var html = '<section class="pagehead-maize join-hero"><div class="wrap">' +
    '<div><div class="eyebrow">Join the team</div>' +
    '<h1 class="display">Play for<br>Michigan.</h1>' +
    '<p>Come to practice, meet the team, and compete for a Big Ten title.</p></div>' +
    (photo ? '<figure class="join-photo" data-hide-on-error><img src="' + photo + '" alt="Two Michigan players in the pool" decoding="async" data-fallback="hide"></figure>' : '') +
    '</div></section>';
  html += '<section class="wrap steps">' +
    step('1', 'Reach out', 'Fill out the form below or message us on Instagram so an officer can add you to the list.') +
    step('2', 'Come to practice', practiceShort(a) + '. Bring a suit and goggles.') +
    step('3', 'Register & travel', 'Complete Club Sports registration, then compete with the team at Big Ten tournaments.') +
    '</section>';
  html += '<section class="wrap join-grid"><div><h2 class="h2-sec">Questions</h2><div class="faq-list">' + faqs.map(function (q, i) {
    var open = state.faqOpen === i;
    return '<div class="faq"><button type="button" data-act="faq" data-val="' + i + '" aria-expanded="' + open + '" aria-controls="faq-' + i + '"><span>' + esc(q[0]) + '</span><span class="sign" aria-hidden="true">' + (open ? '–' : '+') + '</span></button>' +
      '<p class="a" id="faq-' + i + '"' + (open ? '' : ' hidden') + '>' + esc(q[1]) + '</p></div>';
  }).join('') + '</div></div>';

  html += '<div class="panel-navy on-navy" id="join-panel"><div class="form-wrap">' +
    '<h3>Interested?</h3><p class="sub">Leave your info and an officer will reach out about the next practice. Fields marked <span class="req">*</span> are required.</p>' +
    '<form class="form" id="athlete-form" novalidate>' +
    field('a-name', 'Full name', true, '<input class="input" id="a-name" name="name" autocomplete="name" placeholder="Name">', 'full') +
    field('a-email', 'Email', true, '<input class="input" id="a-email" name="email" type="email" autocomplete="email" placeholder="uniqname@umich.edu">') +
    field('a-phone', 'Phone', true, '<input class="input" id="a-phone" name="phone" type="tel" autocomplete="tel" placeholder="(734) 555-0123">') +
    '<div class="field" data-f="grad"><span class="flabel" id="l-grad">Expected graduation<span class="req">*</span></span><div class="pair">' +
    '<select class="input" name="gradMonth" aria-labelledby="l-grad" aria-label="Graduation month"><option value="">Month</option>' + MONTHS.map(function (m, i) { return '<option value="' + pad2(i + 1) + '">' + m + '</option>'; }).join('') + '</select>' +
    '<select class="input" name="gradYear" aria-label="Graduation year"><option value="">Year</option>' + gradYears.map(function (yv) { return '<option>' + yv + '</option>'; }).join('') + '</select>' +
    '</div><span class="err" aria-live="polite"></span></div>' +
    field('a-degree', 'Expected degree', true, '<input class="input" id="a-degree" name="degree" placeholder="BS in Economics">') +
    field('a-free', '100 yard free time', true, '<input class="input" id="a-free" name="free" inputmode="decimal" placeholder="58.40">') +
    field('a-exp', 'Years of water polo', true, '<input class="input" id="a-exp" name="experience" inputmode="numeric" placeholder="0 is fine">') +
    field('a-hand', 'Dominant hand', true, '<select class="input" id="a-hand" name="hand"><option value="">Choose</option><option value="right">Right</option><option value="left">Left</option><option value="ambidextrous">Ambidextrous</option></select>') +
    '<div class="field full" data-f="positions"><span class="flabel" id="l-pos">Position<span class="req">*</span></span><div class="pos-chips" role="group" aria-labelledby="l-pos">' +
    SITE.positions.map(function (p) { return '<button type="button" data-act="pos" data-val="' + p[0] + '" aria-pressed="false">' + p[0] + (p[1] ? '<small>' + p[1] + '</small>' : '') + '</button>'; }).join('') +
    '</div><span class="err" aria-live="polite"></span></div>' +
    '<details><summary>More about you (optional)</summary><div class="inner">' +
    field('a-city', 'Hometown city', false, '<input class="input" id="a-city" name="city" autocomplete="address-level2">') +
    field('a-state', 'Hometown state', false, '<input class="input" id="a-state" name="state" autocomplete="address-level1">') +
    field('a-teams', 'Teams you\'ve played for', false, '<textarea class="input" id="a-teams" name="teams" rows="3" placeholder="Pioneer High School"></textarea>', 'full') +
    field('a-awards', 'Water polo awards', false, '<textarea class="input" id="a-awards" name="awards" rows="3" placeholder="First Team All-State"></textarea>', 'full') +
    field('a-info', 'Anything else', false, '<textarea class="input" id="a-info" name="info" rows="3" placeholder="Questions, scheduling notes"></textarea>', 'full') +
    '</div></details>' +
    '<p class="form-msg" role="alert" hidden></p>' +
    '<button class="btn btn-maize submit" type="submit">Count me in</button>' +
    '</form></div></div></section>';
  return html;
}
function step(n, t, b) {
  return '<div class="step"><div class="n">' + n + '</div><h3>' + esc(t) + '</h3><p>' + esc(b) + '</p></div>';
}
export function field(id, label, req, control, cls) {
  return '<div class="field' + (cls ? ' ' + cls : '') + '" data-f="' + id + '"><label for="' + id + '">' + esc(label) + (req ? '<span class="req" aria-hidden="true">*</span>' : '') + '</label>' + control +
    '<span class="err" aria-live="polite"></span></div>';
}
