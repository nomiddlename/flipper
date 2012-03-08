var features = {};

function add(featureName) {
    if (!features.hasOwnProperty(featureName)) {
        features[featureName] = false;
        Object.defineProperty(exports, featureName, {
            get: function() { return isEnabled(featureName); },
            set: function(value) { value ? enable(featureName) : disable(featureName); },
            configurable: true,
            enumerable: true
        });
    }
}

function allFeatures() {
    return features;
}

function enable(featureName) {
    features[featureName] = true;
}

function disable(featureName) {
    features[featureName] = false;
}

function isEnabled(featureName) {
    return features[featureName];
}

function exists(featureName) {
    return features.hasOwnProperty(featureName);
}

exports.add = add;
exports.allFeatures = allFeatures;
exports.enable = enable;
exports.isEnabled = isEnabled;
exports.disable = disable;
exports.exists = exists;
exports.http = require(require('path').join(__dirname, 'http')).setup(exports);
