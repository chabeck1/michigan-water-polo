/* Support page (opened by the Give button). */

import { findAsset } from '../assets.js';
import { singularRole } from './roster.js';
import { DATA } from '../store.js';
import { esc } from '../util.js';

function fundraisingChair() {
  var g = (DATA.about.eboard || []).filter(function (x) { return /fundrais/i.test(x.role || ''); })[0];
  if (!g || !(g.people || []).length) return null;
  return { name: g.people[0].name, role: singularRole(g.role, g.people.length) };
}
export function pageSupport() {
  var photo = findAsset('img', 'team.jpg');
  var chair = fundraisingChair();
  var html = '<section class="pagehead-navy support-hero on-navy"><div class="wrap">' +
    '<div><div class="eyebrow">Fundraising</div>' +
    '<h1 class="display">Get us to<br>the pool.</h1>' +
    '<p>We\'re a largely student-funded team. Donations make travel and lodging at tournaments possible and keep us competing in Big Ten and CWPA play.</p>' +
    '<div class="actions"><a class="btn btn-maize" href="' + esc(DATA.fund.give) + '" target="_blank" rel="noopener noreferrer">Give online ↗</a>' +
    '<a class="btn btn-ghost-light" href="#contact" data-reason="Fundraising">Non-monetary gift</a></div></div>' +
    '<div class="support-photo stripes-navy" data-hide-on-error>' + (photo ? '<img src="' + photo + '" alt="Michigan bench cheering" loading="lazy" decoding="async" data-fallback="hide">' : '') + '</div>' +
    '</div></section>';
  html += '<section class="wrap uses"><h2 class="h2-sec">What your gift supports</h2><div class="rule-grid use-grid">' +
    use('Travel & lodging', 'Getting the team to Big Ten tournaments and CWPA Nationals.') +
    use('Hosting', 'Organizing invitational and Big Ten tournaments that bring teams from around the country.') +
    use('Community', 'Volunteering with local charities and working with local high school teams.') +
    '</div>' +
    // the fundraising letter below is signed by the chair, so the short thank-you only shows without it
    (DATA.fund.html ? '' : '<p class="thanks">Monetary and non-monetary contributions are tax-deductible. Thank you!' + (chair ? ' — ' + esc(chair.name) + ', ' + esc(chair.role) : '') + '</p>') +
    '</section>';
  if (DATA.fund.html) {
    html += '<section class="wrap letter"><div><div class="label">A note from the team</div><h2 class="h2-sec" style="margin-top:10px">Why it matters</h2></div><div class="body">' + DATA.fund.html + '</div></section>';
  }
  html += '<section class="band-maize"><div class="wrap band-row"><h2>Alumni — stay connected</h2>' +
    '<a class="btn btn-navy btn-sm" href="#alumni">Alumni network →</a></div></section>';
  return html;
}
function use(t, b) { return '<div class="use"><h3>' + esc(t) + '</h3><p>' + esc(b) + '</p></div>'; }
