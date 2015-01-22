'use strict';

var path   = require('path');
var fs     = require('fs');
var _      = require('lodash');
var nock   = require('nock');
var debug  = require('debug')('debug');
var mkdirp = require('mkdirp');

module.exports = Nockturnal;

/**
 * @constructor
 * @param {string} name Name
 * @param {object} options Configuration
 */
function Nockturnal(name, options) {
  this.name = name;
  this.options = _.merge({}, this.defaults, options);
  this.fixtureFile = path.join('.', this.options.folders.fixtures, name + '.json');
  this.hasFixtures = !!process.env.NOCK_RECORD;
  this.before = this.before.bind(this);
  this.after = this.after.bind(this);

  mkdirp.sync(path.dirname(this.fixtureFile));
}

/**
 * @property {object} defaults Default configuration
 */
Nockturnal.prototype.defaults = {
  folders: {
    fixtures: 'test/fixtures'
  },
  placeHolders: {
    // 'orig': 'place_holder'
  }
};


/**
 * starts recording, or ensure the fixtures exist
 */
Nockturnal.prototype.before = function (callback) {
  /*eslint camelcase:0 */
  var fixture, placeHolders, nockDefs;

  if (this.hasFixtures) {
    return;
  }

  try {

    // read json as string
    fixture = fs.readFileSync(this.fixtureFile, 'utf-8');
    placeHolders = this.options.placeHolders;

    // process contents for replacement
    Object.keys(placeHolders).forEach(function(key) {
      var re = new RegExp(placeHolders[key], 'g');
      fixture = fixture.replace(re, key);
    });

    // parse the JSON string
    this.nocksDefs = JSON.parse(fixture);

    if (typeof callback === 'function') {
      callback(nockDefs);
    }

    // define the nocks we'll use for the tests
    nock.define(nockDefs);
    this.hasFixtures = true;

  } catch (err) {

    // ignore file not exist error, we'll record and create it.
    // log all other errors, but continue on.
    if (-1 === err.message.indexOf('no such file or directory')) {
      console.error('Failed to load fixtures: ' + err + '. continuing by recording');
      nock.recorder.rec({
        dont_print: true,
        output_objects: true
      });
    }
  }
};

/**
 * saves our recording if fixtures didn't already exist
 */
Nockturnal.prototype.after = function (done, callback) {
  var fixtures, strFixtures, placeHolders;

  if (this.hasFixtures) {
    done();
    return;
  }

  fixtures = nock.recorder.play();
  placeHolders = this.options.placeHolders;

  if (typeof callback === 'function') {
    callback(fixtures);
  }

  strFixtures = JSON.stringify(fixtures, null, 2);

  Object.keys(placeHolders).forEach(function(key) {
    var re = new RegExp(key, 'g');
    strFixtures = strFixtures.replace(re, placeHolders[key]);
  });

  fs.writeFileSync(this.fixtureFile, strFixtures, 'utf-8');
  done();
};
