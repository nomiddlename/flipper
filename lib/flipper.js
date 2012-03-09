var fs = require('fs'),
    features = {},
    storage;

function add(featureName) {
    if (!features.hasOwnProperty(featureName)) {
        features[featureName] = false;
        Object.defineProperty(exports, featureName, {
            get: function() { return isEnabled(featureName); },
            set: function(value) {
                if (value) {
                    enable(featureName);
                } else {
                    disable(featureName);
                }
            },
            configurable: true,
            enumerable: true
        });
        if (storage) {
            storage.save(featureName);
        }
    }
}

function allFeatures() {
    return features;
}

function enable(featureName) {
    features[featureName] = true;
    if (storage) {
        storage.save(featureName);
    }
}

function disable(featureName) {
    features[featureName] = false;
    if (storage) {
        storage.save(featureName);
    }
}

function isEnabled(featureName) {
    return features[featureName];
}

function exists(featureName) {
    return features.hasOwnProperty(featureName);
}

function updateFeatures(data) {
    if (data) {
        var fileFeatures = JSON.parse(data);
        for (var feature in fileFeatures) {
            add(feature);
            features[feature] = fileFeatures[feature];
        }
    }
}

function persist(filename) {
    try {
        updateFeatures(fs.readFileSync(filename, 'utf8'));
    } catch (err) {
        console.error("Problems reading features from %s, ignoring and moving on. Error was ", filename, err);
    }

    storage = {
        save: function(featureName) {
            fs.writeFile(filename, JSON.stringify(features), 'utf8', writeError);
        }
    };

    function writeError(err) {
        if (err) throw new Error("Problems writing Flipper features to " + filename + ". Error was " + err);
    }
}

exports.add = add;
exports.allFeatures = allFeatures;
exports.enable = enable;
exports.isEnabled = isEnabled;
exports.disable = disable;
exports.exists = exists;
exports.persist = persist;
exports.http = require(require('path').join(__dirname, 'http')).setup(exports);
