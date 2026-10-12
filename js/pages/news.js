/* News page. */

import { pageHead } from './contact.js';
import { DATA } from '../store.js';
import { esc } from '../util.js';

export function pageNews() {
  var html = pageHead('paper', 'News', 'From the deck');
  if (!DATA.news.length) return html + '<section class="wrap news"><div class="empty-note">No posts yet.</div></section>';
  var groups = [], cur = null;
  DATA.news.forEach(function (p) {
    var y = p.year || 'Earlier';
    if (!cur || cur.y !== y) { cur = { y: y, posts: [] }; groups.push(cur); }
    cur.posts.push(p);
  });
  html += '<section class="wrap news">' + groups.map(function (g) {
    return '<div class="news-year"><h2>' + esc(g.y) + '</h2><div>' + g.posts.map(function (p) {
      return '<article class="post"><div class="label">' + esc(p.date) + '</div><h3>' + esc(p.title) + '</h3><div class="body">' + p.html + '</div></article>';
    }).join('') + '</div></div>';
  }).join('') + '</section>';
  return html;
}
