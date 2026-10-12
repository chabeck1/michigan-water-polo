/* Site settings and fixed lists: social links, Google Form addresses, page names. */

export var CFG = Object.assign({
  dataPath: 'data/',
  today: null  // 'YYYY-MM-DD' to preview the site as if it were another day
}, window.UMWP_CONFIG || {});

export var SITE = {
  name: "Michigan Men's Water Polo",
  give: 'https://leadersandbest.umich.edu/find/#!/give/basket/fund/311008',
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/umichmenspolo/' },
    { label: 'Facebook', href: 'https://www.facebook.com/MichiganMensWaterPolo/' },
    { label: 'X', href: 'https://twitter.com/michiganmanpolo' }
  ],
  // Counts shown on the old homepage that aren't stored in the data files.
  stats: [
    { n: '100', suffix: '+', label: 'First Team All-Americans' },
    { n: '100', suffix: '+', label: 'Academic All-Americans' }
  ],
  forms: {
    athlete: {
      url: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScO_89MKr0Exb16QoM-zSoJa28MdF5G-LZBH7NvyrCNnhK0Bg/formResponse',
      entry: {
        name: 'entry.824923744', email: 'entry.1946615411', phone: 'entry.1048864697',
        city: 'entry.1429166208', state: 'entry.722722302', grad: 'entry.1743803299',
        degree: 'entry.68182095', free: 'entry.2035085070', experience: 'entry.74751114',
        hand: 'entry.1054216554', position: 'entry.470668351', teams: 'entry.1726469196',
        awards: 'entry.277926910', info: 'entry.1567373700'
      }
    },
    contact: {
      url: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSchr6uVy-1cGKMdueSmyfe7tMtd9PaPFkqIK5CSh6vdjWaphw/formResponse',
      entry: { name: 'entry.238190827', email: 'entry.913578307', phone: 'entry.1832837971', reason: 'entry.188853843', message: 'entry.2055079195' }
    }
  },
  contactReasons: ['Fundraising', 'Potential Coach', 'Alumni Visit', 'Volunteering', 'Sporting Event Tickets', 'Tournament Hosting', 'Other'],
  positions: [['2M', 'center'], ['2MD', 'center defender'], ['UT', 'utility'], ['AK', 'attacker'], ['GK', 'goalie'], ['Unsure', '']]
};

export var ROUTES = ['home', 'roster', 'schedule', 'news', 'alumni', 'join', 'support', 'contact'];
export var TITLES = { home: '', roster: 'Roster', schedule: 'Schedule', news: 'News', alumni: 'Alumni', join: 'Join', support: 'Support', contact: 'Contact' };
export var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export var CLASS_ORDER = ['FR', 'SO', 'JR', 'SR', 'GS'];
export var CLASS_NAMES = { FR: 'Freshman', SO: 'Sophomore', JR: 'Junior', SR: 'Senior', GS: 'Grad student' };
