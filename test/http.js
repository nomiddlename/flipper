var vows = require('vows'),
    assert = require('assert'),
    flipper = require('../lib/flipper');

function request(method, url, body) {
    return {
        method: method,
        url: url,
        setEncoding: function(encoding) {
            assert.equal(encoding, 'utf8');
        },
        on: function(type, cb) {
            if (type === 'data') {
                cb(body);
            } else {
                cb();
            }
        }
    };
}

function mockResponse() {
    return {
        headers: [],
        setHeader: function(key, value) {
            this.headers.push({key: key, value: value});
        },
        end: function(data) {
            this.data = data;
        }
    };
}

function responseOf(contentType, status, body) {
    return function(response) {
        assert.deepInclude(response.headers, { key: 'Content-Type', value: contentType });
        assert.equal(response.statusCode, status);
        if (body) {
            assert.equal(response.data, body);
        }
    };
}

vows.describe('Flipper HTTP (connect) interface').addBatch({
    'http function': {
        topic: flipper,
        'should require a base url': function(flipper) {
            assert.throws(function() { flipper.http(); }, Error);
        },
        'should return a function that takes req res next arguments': function(flipper) {
            assert.lengthOf(flipper.http('/baseurl'), 3);
        },
        'with a baseurl': {
            topic: function() {
                return flipper.http('/baseurl');
            },
            'when a request is made outside the baseurl': {
                topic: function(http) {
                    var nextCalled = false;
                    http(request('GET', '/cheese'), null, function() { nextCalled = true; });
                    return nextCalled;
                },
                'it should not respond': function(nextCalled) {
                    assert.isTrue(nextCalled);
                }
            },
            'when a GET request for the baseurl is made': {
                topic: function(http) {
                    var response = mockResponse();
                    flipper.add('testFeature');
                    flipper.add('mutatedDolphins');
                    flipper.enable('testFeature');
                    http(request('GET','/baseurl'), response);
                    return response;
                },
                'response should be application/json': function(response) {
                    assert.deepInclude(response.headers, { key: 'Content-Type', value: 'application/json' });
                },
                'response should have a status of 200 OK': function(response) {
                    assert.equal(response.statusCode, 200);
                },
                'response should include status of the features': function(response) {
                    assert.equal(JSON.parse(response.data)['testFeature'], flipper.testFeature);
                    assert.equal(JSON.parse(response.data)['mutatedDolphins'], flipper.mutatedDolphins);
                }
            },
            'when a GET request for a feature is made': {
                topic: function(http) {
                    var response = mockResponse();
                    flipper.add('mutatedDolphins');
                    http(request('GET', '/baseurl/mutatedDolphins'), response);
                    return response;
                },
                'response should be': responseOf('application/json', 200, 'false')
            },
            'when a GET request for a feature that does not exist is made': {
                topic: function(http) {
                    var response = mockResponse();
                    http(request('GET', '/baseurl/this-feature-does-not-exist'), response);
                    return response;
                },
                'response should have a status code of 404 Not Found': function(response) {
                    assert.equal(response.statusCode, 404);
                }
            },
            'when a PUT request for a feature is made': {
                topic: function(http) {
                    var response = mockResponse();
                    flipper.add('disturbedChickens');
                    flipper.disable('disturbedChickens');
                    http(request('PUT', '/baseurl/disturbedChickens', 'true'), response);
                    return response;
                },
                'response should be': responseOf('application/json', 200, 'true'),
                'feature status should have changed': function() {
                    assert.isTrue(flipper.disturbedChickens);
                }
            },
            'when a PUT request with an unrecognised status is made': {
                topic: function(http) {
                    var response = mockResponse();
                    flipper.add('weasels');
                    flipper.disable('weasels');
                    http(request('PUT', '/baseurl/weasels', 'engage'), response);
                    return response;
                },
                'response should be': responseOf('application/json', 400),
                'feature status should not have changed': function() {
                    assert.isFalse(flipper.weasels);
                }
            },
            'when a PUT request for an unrecognised feature is made': {
                topic: function(http) {
                    var response = mockResponse();
                    assert.isFalse(flipper.exists('cheeseballs'));
                    http(request('PUT', '/baseurl/cheeseballs', 'true'), response);
                    return response;
                },
                'response should be': responseOf('application/json', 201, 'true'),
                'feature should have been added with correct status': function() {
                    assert.isTrue(flipper.cheeseballs);
                }
            },
            'when a PUT request for an unrecognised feature with an invalid status is made': {
                topic: function(http) {
                    var response = mockResponse();
                    assert.isFalse(flipper.exists('baconballs'));
                    http(request('PUT', '/baseurl/baconballs', 'engage'), response);
                    return response;
                },
                'response should be': responseOf('application/json', 400),
                'feature should not have been added': function() {
                    assert.isFalse(flipper.exists('baconballs'));
                }
            }
        }

    }
}).exportTo(module);