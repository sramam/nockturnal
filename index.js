module.exports = function (name, options) {
  var path = require('path'),
      fs = require('fs'),
      _ = require('lodash'),
      nock = require('nock');
  // options tell us where to store our fixtures
  var defaults = {
      folders: {
          test: 'test',
          fixtures: 'test/fixtures'
      },
      place_holders: {
          // 'orig': 'place_holder'
      }
  };
  options = _.merge({}, defaults, options);
  var fix_file = path.join('.', options.folders.fixtures, name + '.json'),
      has_fixtures = !!process.env.NOCK_RECORD, 
      make_fix_dir = function(fix_file) {
          var fix_dir = path.dirname(fix_file);
          if (!fs.existsSync(fix_dir)) {
              console.log('creating fixtures directory:' + fix_dir);
              fs.mkdirSync(fix_dir);
          }
      }(fix_file);
  return {
    // starts recording, or ensure the fixtures exist
    before: function (callback) {
      if (!has_fixtures) {
        try {
          // read json as string
          var str_contents = fs.readFileSync(fix_file, 'utf-8'),
              place_holders = options.place_holders;
          // process contents for replacement
          Object.keys(place_holders).forEach(function(key) {
              var re = new RegExp(place_holders[key], 'g');
              str_contents = str_contents.replace(re, key);
          });
          // parse the JSON string
          var nocksDefs = JSON.parse(str_contents);
          if (callback) {
              callback(nockDefs);
          }
          // define the nocks we'll use for the tests
          nock.define(nocksDefs);
          has_fixtures = true;
        } catch (err) {
            // ignore file not exist error, we'll record and create it.
            // log all other errors, but continue on.
            if (-1 === err.message.indexOf('no such file or directory')) {
                console.error('Failed to load fixtures: ' + err + '. continuing by recording');
            }
        }
        if (!has_fixtures) {
            nock.recorder.rec({
                dont_print: true,
                output_objects: true
            });
        }
      }
    },
    // saves our recording if fixtures didn't already exist
    after: function (done, callback) {
      if (!has_fixtures) {
        var fixtures = nock.recorder.play(),
            place_holders = options.place_holders;
        if (callback) {
            callback(fixtures);
        }
        var str_fixtures = JSON.stringify(fixtures, null, 2);
        Object.keys(place_holders).forEach(function(key) {
            var re = new RegExp(key, 'g');
            str_fixtures = str_fixtures.replace(re, place_holders[key]);
        });
        fs.writeFileSync(fix_file, str_fixtures, 'utf-8');
      }
      done();
    }
  };
};
