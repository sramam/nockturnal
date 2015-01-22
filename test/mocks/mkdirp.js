'use strict';

module.exports = function () {
  return {
    calls: [],
    sync: function () {
      this.calls.push(Array.prototype.slice.call(arguments, 0));
    }
  };
};
