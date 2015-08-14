var ical = require('ical-generator')({ domain: 'aereal.org', name: 'YAPC::Asia Tokyo 2015 Talks' });

var talks = JSON.parse(require('fs').readFileSync(__dirname + '/talks.json'));

talks.forEach(function (talk) {
  var startDateEpoch = Date.parse(talk.doorTime);
  var startDate = new Date(startDateEpoch);
  var endDate = new Date( startDateEpoch + (talk.duration * 60 * 1000) );
  ical.createEvent({
    start: startDate,
    end: endDate,
    location: talk.venue,
    organizer: talk.performer.name + '<...>',
    summary: talk.title,
  });
});

console.log(ical.toString());
