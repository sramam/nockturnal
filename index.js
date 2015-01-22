'use strict';

var Nockturnal = require('./lib/Nockturnal');

module.exports = function (name, options) {
  return new Nockturnal(name, options);
};
