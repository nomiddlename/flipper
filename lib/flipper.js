var featureList = [];

function hasName(name) {
    return function (item) {
        return item.name === name;
    }
}

function find(featureName) {
    return featureList.filter(hasName(featureName))[0];
}

function add(featureName) {
    if (!featureList.some(hasName(featureName))) {
        featureList.push({ name: featureName, status: "disabled" });
        Object.defineProperty(exports, featureName, {
            get: function() { return isEnabled(featureName); },
            set: function(value) { value ? enable(featureName) : disable(featureName); },
            configurable: true,
            enumerable: true
        });
    }
}

function features() {
    return featureList;
}

function enable(featureName) {
    find(featureName).status = 'enabled';
}

function disable(featureName) {
    find(featureName).status = 'disabled';
}

function isEnabled(featureName) {
    return find(featureName).status === 'enabled';
}

exports.add = add;
exports.features = features;
exports.enable = enable;
exports.isEnabled = isEnabled;
exports.disable = disable;