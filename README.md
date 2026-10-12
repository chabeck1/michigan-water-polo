# Michigan Men's Water Polo website

The club site, rebuilt from the new design. It's plain HTML, CSS and JavaScript: no frameworks, no npm,
no build step. Edit a file, refresh the browser.

## Updating content

Everything on the site comes from the files in `data/` and the photo folders. Officers edit them through
Pages CMS (forms, photo uploads, no code); you can also edit the JSON directly.

| File | What it controls |
|---|---|
| `data/schedule.json` | One entry per season and team (`year`, `team` A or B). Each has tournaments (name, first and last day, pool, host, Maps link) and games (opponent, start time, logo, result, score, video link). A tournament both teams play needs the same name in both. |
| `data/roster.json` | One entry per season: team photo and players (name, class, major, hometown, photo, captain). |
| `data/news.json` | News posts. The site sorts them by date. |
| `data/banner.json` | The announcement bar at the top of every page, with a time to hide it. |
| `data/slideshow.json` | Home page photos for computers (wide) and phones (tall), in order. |
| `data/awards.json` | Awards by season, shown on the schedule page. |
| `data/about.json` | Practice days, time and pool; championship years; club links; coaches; exec board. |
| `data/fundraising.json` | The Give link and the letter on the Support page. |
| `data/alumni.json` | Companies in the "Where alumni work" ticker, and the number shown above it. |

Photos live in `rosterPhotos/`, `executiveHeadshots/` (coaches), `bannerPhotos/` (home page slideshow),
`schools/` (opponent logos) and `companyLogos/`. In the data, a photo is written as `"/file.jpg"`; the site
looks in the right folder. File names must match exactly, including capital letters.

`img/` holds the photos the Join, Support and Alumni pages use by name. It isn't connected to the CMS, so
editors can't delete them by accident. `nopicture.svg` in `rosterPhotos/` and `executiveHeadshots/` is the
placeholder for anyone without a photo; don't delete it.

## Editing with Pages CMS

`.pages.yml` describes every data file as a form. To connect it (a personal GitHub account is fine):

1. Put this folder in a GitHub repository.
2. Go to https://app.pagescms.org, sign in with GitHub, and install the Pages CMS app on that repository.
3. Under Collaborators, invite officers by email. They sign in with a code sent to their email; they
   don't need a GitHub account.

Every save is a commit to the repository, and the site updates when the host republishes it.

Things to know:
- `.pages.yml` must list every key in the data files. A key that isn't listed is deleted the next time
  someone saves that file, so add new fields to both.
- Upload photos one at a time, and keep each under about 3 MB.
- If two people edit the same file at once, the second save fails. Reload the page and redo the change.

## Previewing on your computer

Browsers won't run the site's JavaScript straight from a file, so start a small local server:

```
cd michigan-water-polo-site
python3 -m http.server 8000
```

Then open http://localhost:8000.

## How the code is organised

```
index.html            page shell: header, footer and the links to the CSS and JS
.pages.yml            Pages CMS forms for the data files
css/base.css          colors, fonts, buttons and pieces every page uses
css/layout.css        header, menu, announcement banner, footer
css/forms.css         form fields
css/pages/*.css       one file per page
js/main.js            entry point: loads the data, then shows the page
js/router.js          which page is showing (#schedule-2024 and so on), the menu, button clicks
js/data.js            loads data/*.json and reshapes it for the pages
js/pages/*.js         one file per page
js/forms.js           Join and Contact forms, sent to the team's Google Forms
js/config.js          social links, Google Form addresses, page names
js/legacy-links.js    turns old links like /roster?year=2019 into #roster-2019
js/store.js, util.js, dates.js, assets.js, content.js, shared.js   shared helpers
```

To change one page, look in `js/pages/<page>.js` and `css/pages/<page>.css`.

## Pages

Home, Roster (any season back to 2009, filter by class), Schedule (A/B team records, results, awards,
calendar download), News, Alumni (alumni count and company ticker), Join (posts to the athlete Google
Form), Support (opened by the Give button) and Contact (posts to the contact Google Form).

## Hosting

Any static web host works: upload the whole folder. Old links such as `/~umpolo/roster?year=2019` need the
server to answer those paths with `index.html` (the `.htaccess` file on the U-M server does this);
`js/legacy-links.js` then opens the right page.
