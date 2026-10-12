/* Image and logo paths, plus what to show when an image file is missing. */

import { esc, initials } from './util.js';

function encodePath(p) { return p.split('/').map(encodeURIComponent).join('/'); }
// File names in the data must match the real files exactly: the web server is case-sensitive.
// Pages CMS saves picked images as "/file.jpg"; older data has "file.jpg". Both mean folder/file.jpg.
export function findAsset(folder, name) {
  name = String(name || '').replace(/^\/+/, '');
  return name ? encodePath(folder + '/' + name) : null;
}
function logoUrl(name) { return findAsset('schools', name); }
export function logoHtml(file, opponent) {
  var url = logoUrl(file);
  var mono = '<span class="mono-logo" aria-hidden="true">' + esc(initials(opponent)) + '</span>';
  if (!url) return mono;
  return '<img class="logo" src="' + url + '" alt="" loading="lazy" decoding="async" data-fallback="logo" data-mono="' + esc(initials(opponent)) + '">';
}
// Swap in a fallback when an image file is missing.
document.addEventListener('error', function (e) {
  var img = e.target;
  if (!img || img.tagName !== 'IMG' || !img.dataset.fallback) return;
  var kind = img.dataset.fallback;
  img.removeAttribute('data-fallback');
  if (kind === 'logo') {
    var span = document.createElement('span');
    span.className = 'mono-logo'; span.setAttribute('aria-hidden', 'true'); span.textContent = img.dataset.mono || '?';
    img.replaceWith(span);
  } else if (kind === 'nopic' && img.dataset.nopic) {
    img.src = img.dataset.nopic; img.alt = ''; img.setAttribute('data-fallback', 'initials');
  } else if (kind === 'hide') {
    var fig = img.closest('[data-hide-on-error]') || img;
    fig.remove();
  } else {
    img.remove(); // the initials behind it show through
  }
}, true);
