var vows = require('vows'),
    assert = require('assert'),
    flipper = require('../lib/flipper');

function hasProperty(property, value) {
    return function(item) {
        return value ? item[property] === value : item.hasOwnProperty(property);
    };
}

vows.describe('Flipper Javascript API').addBatch({
    'adding a feature': {
        topic: function() {
            flipper.add("testFeature");
            return flipper;
        },
        'should appear in the list of features': function(lib) {
            assert.deepInclude(lib.features(), { name: "testFeature", status: "disabled" });
        },
        'should default to disabled': function(lib) {
            assert.isFalse(lib.testFeature);
            assert.isFalse(lib.isEnabled('testFeature'));
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
            assert.deepInclude(lib.features(), { name: 'featureToEnable', status: 'enabled' });
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
                    assert.deepInclude(lib.features(), { name: 'featureToEnable', status: 'disabled' });
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
                    assert.deepInclude(lib.features(), { name: 'featureToDisable', status: 'disabled' });
                }
            }
        }

    },
    'adding a feature twice': {
        topic: function() {
            flipper.add("testFeature");
            flipper.add("testFeature");
            return flipper;
        },
        'should only add it to the list once': function(lib) {
            assert.lengthOf(lib.features().filter(hasProperty("name", "testFeature")), 1);
        }
    }
}).exportTo(module);