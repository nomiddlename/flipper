var vows = require('vows'),
    assert = require('assert'),
    sandbox = require('sandboxed-module'),
    mockConsole = {
        messages: [],
        error: function() {
            this.messages.push(Array.prototype.slice.call(arguments));
        }
    };

function mockFS(existingFileContents, writeError) {
    return {
        readFileSync: function(filename, encoding) {
            this.readFilename = filename;
            this.readEncoding = encoding;
            if (existingFileContents) {
                return JSON.stringify(existingFileContents);
            } else {
                throw new Error('no such file or directory');
            }
        },
        writeFile: function(filename, data, encoding, callback) {
            this.filename = filename;
            this.data = data;
            this.encoding = encoding;
            callback(writeError);
        }
    };
}

vows.describe('Flipper file persistence').addBatch({
    'with no existing file and no features': {
        topic: function() {
            var fs = mockFS(),
                flipper = sandbox.require('../lib/flipper', { requires: { fs: fs}, globals: { console: mockConsole } });

            flipper.persist('path/to/cheese.json');
            return fs;
        },
        'should try to read existing file': function(fs) {
            assert.equal(fs.readFilename, 'path/to/cheese.json');
            assert.equal(fs.readEncoding, 'utf8');
        },
        'should not write to the file': function(fs) {
            assert.isUndefined(fs.filename);
        },
        'when a feature is added': {
            topic: function() {
                var fs = mockFS(), flipper = sandbox.require('../lib/flipper', { requires: { fs: fs }, globals: { console: mockConsole } });
                flipper.persist('path/to/cheese.json');
                flipper.add("cheeseballs");
                return fs;
            },
            'should write the new feature to the file': function(fs) {
                assert.equal(fs.filename, 'path/to/cheese.json');
                assert.equal(fs.encoding, 'utf8');
                assert.equal(fs.data, JSON.stringify({ cheeseballs: false }));
            }
        },
        'when a feature is enabled': {
            topic: function() {
                var fs = mockFS(), flipper = sandbox.require('../lib/flipper', { requires: { fs: fs }, globals: { console: mockConsole } });
                flipper.persist('path/to/cheese.json');
                flipper.add("cheeseballs");
                flipper.enable("cheeseballs");
                return fs;
            },
            'should write the updated feature to the file': function(fs) {
                assert.equal(fs.filename, 'path/to/cheese.json');
                assert.equal(fs.encoding, 'utf8');
                assert.equal(fs.data, JSON.stringify({ cheeseballs: true }));
            }
        },
        'when a feature is disabled': {
            topic: function() {
                var fs = mockFS(), flipper = sandbox.require('../lib/flipper', { requires: { fs: fs }, globals: { console: mockConsole } });
                flipper.persist('path/to/cheese.json');
                flipper.add("cheeseballs");
                flipper.enable("cheeseballs");
                flipper.disable("cheeseballs");
                return fs;
            },
            'should write the updated feature to the file': function(fs) {
                assert.equal(fs.filename, 'path/to/cheese.json');
                assert.equal(fs.encoding, 'utf8');
                assert.equal(fs.data, JSON.stringify({ cheeseballs: false }));
            }
        },
        'when there is a write error': {
            topic: function() {
                var fs = mockFS(null, new Error("File is read-only")), flipper = sandbox.require('../lib/flipper', { requires: { fs: fs }, globals: { console: mockConsole }});
                flipper.persist('path/to/cheese.json');
                return fs;
            },
            'should throw an exception': function(fs) {
                //note that this will be thrown when the callback is fired in a real programme, not in the main loop
                assert.throws(function() { flipper.add('cheeseballs'); }, Error);
            }
        }
    },
    'with an existing file': {
        topic: function() {
            var fs = mockFS({ cheeseballs: true }), flipper = sandbox.require('../lib/flipper', { requires: { fs: fs }, globals: { console: mockConsole } });
            flipper.persist('path/to/cheese.json');
            return flipper;
        },
        'should get features from file': function(flipper) {
            assert.isTrue(flipper.exists('cheeseballs'));
            assert.isTrue(flipper.cheeseballs);
        }
    },
    'with an existing file and existing features': {
        topic: function() {
            var fs = mockFS({ cheeseballs: true }), flipper = sandbox.require('../lib/flipper', { requires: { fs: fs }, globals: { console: mockConsole } });
            flipper.add("baconballs");
            flipper.add("cheeseballs");
            flipper.persist('path/to/cheese.json');
            return flipper;
        },
        'should override existing feature status from file': function(flipper) {
            assert.isTrue(flipper.cheeseballs);
        },
        'should preserve existing features not in file': function(flipper) {
            assert.isTrue(flipper.exists('baconballs'));
            assert.isFalse(flipper.baconballs);
        }
    }
}).exportTo(module);