/* Shared state: the site data once it's loaded, and the visitor's current choices (season, filters...). */

export var DATA = null;
export function setData(d) { DATA = d; }
export var state = {
  route: 'home', rosterYear: null, rosterClass: 'All', schedYear: null, schedSquad: 'All',
  faqOpen: 0, pendingReason: null, pendingOpen: null, announceClosed: false
};
