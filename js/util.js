/* Small helpers used everywhere. */

export function $(sel, root) { return (root || document).querySelector(sel); }
export function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
export function pad2(n) { return (n < 10 ? '0' : '') + n; }
export function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
export function parseISODate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s)); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(); }
export function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function dash(s) { return String(s || '').replace(/(\d)\s*-\s*(\d)/, '$1–$2'); }
export function initials(name) {
  var words = String(name || '').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}
export function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
