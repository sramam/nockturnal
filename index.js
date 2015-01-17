var path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    nock = require('nock');

module.exports = function (name, options) {
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
  _.assign(options, [defaults, options]);
  var fix_file = path.join(options.folders.fixtures, name + '.js'),
      has_fixtures = !!process.env.NOCK_RECORD;
  return {
    // starts recording, or ensure the fixtures exist
    before: function (callback) {
      if (!has_fixtures) try {
        // read json as string
        var str_contents = fs.readFileSync(fix_file, 'utf-8'),
            place_holders = options.place_holders;
        // process contents for replacement
        for (var key in Object.keys(place_holders)) {
            var re = new RegExp(place_holders[key], 'g');
            str_contents = str_contents.replace(re, key);
        }
        // parse the JSON string
        var nocksDefs = JSON.parse(str_contents);
        if (callback) {
            callback(nockDefs);
        }
        // define the nocks we'll use for the tests
        nock.define(nocksDefs);
        has_fixtures = true;
      } catch (e) {
        nock.recorder.rec({
          dont_print: true,
          output_objects: true
        });
      } else {
        has_fixtures = false;
        nock.recorder.rec({
          dont_print: true,
          output_objects: true
        });
      }
    },
    // saves our recording if fixtures didn't already exist
    after: function (done, callback) {
      if (!has_fixtures) {
        var fixtures = nock.recorder.play(),
            place_holders = options.place_holders;
        if (callback) {
            callback(fixture);
        }
        var str_fixtures = JSON.stringify(fixture);
        for (var key in Object.keys(place_holders)) {
            var re = new RegExp(key, 'g');
            str_contents = str_contents.replace(re, place_holders[key]);
        }
        fs.writeFileSync(fix_file, str_contents, 'utf-8');
      }
      done();
    }
  };
};
