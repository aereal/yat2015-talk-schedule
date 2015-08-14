#!casperjs

const YAPC_TALK_LIST_URL    = "http://yapcasia.org/2015/talk/list";
const REQUEST_INTERVAL_MSEC = 500;

var casper = require('casper').create();
var utils = require('utils');

// interface Speaker {
//   name: string;
//   iconURL: string;
// }
// interface Talk {
//   title: string;
//   venue: string;
//   doorTime: Date;
//   performer: Speaker;
//   duration: number;
// }
var talks = [];

casper.start();

casper.thenOpen(YAPC_TALK_LIST_URL, function () {
  var talkUrls = this.evaluate(function () {
    var anchors = Array.prototype.slice.call(
      document.querySelectorAll('.talk_box .title a')
    );
    var urls = anchors.filter(function (e) { return e.textContent.trim().search(/^\[LT\]/) === -1 }).map(function (e) { return e.href });
    return urls;
  });

  talkUrls.forEach(function (url) {
    casper.wait(REQUEST_INTERVAL_MSEC, function () {
      this.thenOpen(url, function () {
        this.echo('---> GET: ' + url);

        var talk = this.evaluate(function () {
          var talk = {};

          talk.title = document.title.replace(/ - YAPC::Asia Tokyo 2015$/, '');
          var detailRows = document.querySelectorAll('.detail-container table tr');
          talk.venue = detailRows[0].querySelector('td').textContent.trim();
          talk.doorTime = detailRows[1].querySelector('td').textContent.trim();
          var maybeDuration = detailRows[6].querySelector('td').textContent.match(/\d+/);
          if (maybeDuration) talk.duration = parseInt(maybeDuration[0]);

          var speaker = {};
          var speakerAnchors = document.querySelectorAll('.large-1.columns > a');
          speaker.name = speakerAnchors[1].textContent;
          speaker.iconURL = speakerAnchors[0].querySelector('img').src;
          talk.performer = speaker;

          return talk;
        });
        talks.push(talk);
      });
    });
  });

  this.then(function () {
    utils.dump(talks);
  });
});

casper.run();
