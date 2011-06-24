var should = require('should'),
  LogParser = require('../lib/tf2logparser'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = {
  'can get log': function() {
    var parser = LogParser.create(),
      log = parser.getLog();
    log.should.be.ok;
  },
  
  'can get file from disk': function() {
    var parser = LogParser.create();
    parser.readFile(FP+'/blah.log', function(line) {
      line.should.eql('blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah');
    });
  },
  
  'is only getting one line at a time from file, and callbackWhenDone is called when done': function() {
    var parser = LogParser.create(),
      i = 0;
    parser.readFile(FP+'/mini.log', function(line) {
      //if the first two lines are OK, we will assume this is working as intended.
      if(i == 0) line.should.eql('L 09/29/2010 - 19:05:47: Log file started (file "logs/L0929002.log") (game "/home/barncow/74.122.197.144-27015/srcds_l/orangebox/tf") (version "4317")');
      else if(i == 1) line.should.eql('L 09/29/2010 - 19:05:47: server_cvar: "mp_falldamage" "0"');
      
      ++i;
    }, function() {i.should.eql(77)});
  },
  
  'sets mapName correctly': function() {
    var parser = LogParser.create();
    parser.parseLogFile(FP+'/full_udplog_granary.log', function(err, log){
      log.mapName.should.eql('cp_granary');
    });
  },
  
  'gets playableSeconds correctly': function() {
    var parser = LogParser.create();
    parser._getPlayableSeconds([
      {start: new Date(2010, 8, 29, 19, 8, 56, 0)},
      {start: new Date(2010, 8, 29, 19, 8, 57, 0)},
      {end: new Date(2010, 8, 29, 19, 8, 58, 0)},
      {end: new Date(2010, 8, 29, 19, 8, 59, 0)}
    ]).should.equal(3);
  },
  
  'config variables work as expected': function() {
    var parser = LogParser.create();
    parser.parseLine('L 01/01/1970 - 00:00:00: World triggered "Round_Start"'); // Needed to allow error checking (FIXME?)

    parser.parseLine('L 04/01/2011 - 13:37:42: Saxton Hale joined the server!'); // Should not error, even though it's an invalid log line
    parser.config.ignoreUnrecognizedLines = false;
    var error = null;
    try {
      parser.parseLine('L 04/01/2011 - 13:37:42: Saxton Hale joined the server!');
    } catch(ex) {
      error = ex;
    }
    should.exist( error );

    parser.parseLine('L 10/27/2010 - 21:19:47: "Numnutz<17><BOT><Red>" changed role to "medic"');
    parser.getLog().players.should.eql([]);
    parser.config.ignoreBots = false;
    parser.parseLine('L 10/27/2010 - 21:19:47: "Numnutz<17><BOT><Red>" changed role to "medic"');
    parser.getLog().players.should.eql([{
      name: 'Numnutz',
      userid: 17,
      steamid: 'BOT:Numnutz',
      team: 'Red',
      roles: [{
        key: 'medic',
        name: 'Medic'
      }],
      damage: 0,
      online: true,
      kills: 0,
      deaths: 0,
      assists: 0,
      longest_kill_streak: 0,
      headshots: 0,
      backstabs: 0,
      pointCaptures: 0,
      pointCaptureBlocks: 0,
      flagDefends: 0,
      flagCaptures: 0,
      dominations: 0,
      timesDominated: 0,
      revenges: 0,
      extinguishes: 0,
      ubers: 0,
      droppedUbers: 0,
      healing: 0,
      medPicksTotal: 0,
      medPicksDroppedUber: 0,
      items: {},
      healSpread: [],
      position: {}
    }]);
  }
}
