var mkdirp = hmt.mock('mkdirp')();
var Nockturnal = hmt.proxy('Nockturnal')({
  mkdirp: mkdirp
});

describe('Nockturnal', function () {
  it('should create the fixture folder', function () {
    var n = new Nockturnal('foo', {
      folders: {
        fixtures: 'foo/bar'
      }
    });

    hmt.assert.deepEqual(mkdirp.calls[0], ['foo/bar']);
  });
});
