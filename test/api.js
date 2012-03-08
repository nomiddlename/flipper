var vows = require('vows'),
    assert = require('assert'),
    flipper = require('../lib/flipper');

vows.describe('Flipper Javascript API').addBatch({
    'adding a feature': {
        topic: function() {
            flipper.add("testFeature");
            return flipper;
        },
        'should appear in the list of features': function(lib) {
            assert.isTrue(lib.allFeatures().hasOwnProperty("testFeature"));
        },
        'should default to disabled': function(lib) {
            assert.isFalse(lib.testFeature);
            assert.isFalse(lib.isEnabled('testFeature'));
        }
    },
    'testing if a feature exists': {
        topic: function() {
            flipper.add('itDoesExist');
            return flipper;
        },
        'should return true for an existing feature': function(lib) {
            assert.isTrue(lib.exists('itDoesExist'));
        },
        'should return false for a non-existent feature': function(lib) {
            assert.isFalse(lib.exists('itDoesNotExist'));
        }
    },
    'enabling a feature': {
        topic: function() {
            flipper.add("featureToEnable");
            flipper.enable("featureToEnable");
            return flipper;
        },
        'should change the status': function(lib) {
            assert.isTrue(lib.featureToEnable);
            assert.isTrue(lib.isEnabled('featureToEnable'));
            assert.isTrue(lib.allFeatures()['featureToEnable']);
        },
        'then disabling the feature': {
            'by setting the property to false': {
                topic: function(lib) {
                    lib.featureToEnable = false;
                    return lib;
                },
                'should change the status': function(lib) {
                    assert.isFalse(lib.featureToEnable);
                    assert.isFalse(lib.isEnabled('featureToEnable'));
                    assert.isFalse(lib.allFeatures()['featureToEnable']);
                }
            },
            'by calling disable': {
                topic: function(lib) {
                    lib.add("featureToDisable");
                    lib.enable("featureToDisable");
                    assert.isTrue(lib.featureToDisable);
                    lib.disable("featureToDisable")
                    return lib;
                },
                'should change the status': function(lib) {
                    assert.isFalse(lib.featureToDisable);
                    assert.isFalse(lib.isEnabled('featureToDisable'));
                    assert.isFalse(lib.allFeatures()['featureToDisable']);
                }
            }
        }

    },
    'adding a feature twice': {
        topic: function() {
            flipper.add("featureAddedTwice");
            flipper.enable('featureAddedTwice');
            flipper.add("featureAddedTwice");
            return flipper;
        },
        'should not change the status': function(lib) {
            assert.isTrue(flipper.featureAddedTwice);
        }
    }
}).exportTo(module);