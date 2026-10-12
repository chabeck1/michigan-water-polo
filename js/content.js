/* Makes text and HTML from the data files safe to put on the page. */

import { ROUTES } from './config.js';
import { esc } from './util.js';

var ROUTE_ALIASES = { '': 'home', index: 'home', 'index.html': 'home', about: 'home', fundraising: 'support', bracket: 'schedule' };
export function internalRoute(href) {
  var h = String(href || '').trim();
  if (/^[a-z]+:/i.test(h) || h.indexOf('//') === 0) return null;
  h = h.replace(/^#/, '').replace(/^\/?~umpolo/i, '').replace(/^\/+|\/+$/g, '').toLowerCase();
  if (ROUTES.indexOf(h) >= 0) return h;
  if (Object.prototype.hasOwnProperty.call(ROUTE_ALIASES, h)) return ROUTE_ALIASES[h];
  return null;
}
var ALLOWED = { P: 1, BR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, A: 1, UL: 1, OL: 1, LI: 1, SPAN: 1, H3: 1, H4: 1, BLOCKQUOTE: 1 };
var DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, IMG: 1, SVG: 1, FORM: 1, INPUT: 1, BUTTON: 1, TEMPLATE: 1, LINK: 1, META: 1 };
export function sanitize(html) {
  var doc = new DOMParser().parseFromString('<div id="x">' + String(html || '') + '</div>', 'text/html');
  var root = doc.getElementById('x');
  (function walk(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 1) {
        if (DROP[child.tagName]) { child.remove(); return; }
        walk(child);
        if (!ALLOWED[child.tagName]) {
          while (child.firstChild) child.parentNode.insertBefore(child.firstChild, child);
          child.remove();
          return;
        }
        Array.prototype.slice.call(child.attributes).forEach(function (a) {
          if (!(child.tagName === 'A' && a.name === 'href')) child.removeAttribute(a.name);
        });
        if (child.tagName === 'A') {
          var href = child.getAttribute('href') || '';
          var r = internalRoute(href);
          if (r) child.setAttribute('href', '#' + r);
          else if (/^https?:\/\//i.test(href)) { child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener noreferrer'); }
          else if (!/^mailto:/i.test(href)) child.removeAttribute('href');
        }
      } else if (child.nodeType !== 3) {
        child.remove();
      }
    });
  })(root);
  return root.innerHTML;
}
export function richText(s) {
  s = String(s || '').trim();
  if (/<\s*[a-z][^>]*>/i.test(s)) {
    var clean = sanitize(s);
    return /<p[\s>]/i.test(clean) ? clean : '<p>' + clean + '</p>';
  }
  return s.split(/\n\s*\n/).map(function (para) {
    return '<p>' + esc(para.trim()).replace(/\n/g, '<br>') + '</p>';
  }).join('');
}
