var flipper = require('../lib/flipper'),
    fs = require('fs'),
    filename = require('path').join(__dirname, 'features.json'),
    newFeature = randomFeatureName();

flipper.persist(filename);
console.log(filename, " loaded, features are: ", flipper.allFeatures());

flipper.add(newFeature);

fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
        console.error("it's all gone horribly wrong", err);
    } else {
        require('util').puts("I added a new feature: ", newFeature, "features.json now contains:", data);
    }
});

function randomFeatureName() {
    var name = '',
        letters = "abcdefghijklmnopqrstuvwxyz";
    for (var i=0; i < 10; i++) {
        name += letters[Math.floor(Math.random() * letters.length)];
    }
    return name;
}
