# Flipper - feature flipping for node.js #

[Feature flipping](http://code.flickr.com/blog/2009/12/02/flipping-out/) (also called [feature toggling](http://martinfowler.com/bliki/FeatureToggle.html)) is a technique used in Continuous Deployment to allow developers to work on new features without blocking releases to production. [99 Designs explain it well](http://99designs.com/tech-blog/blog/2012/03/01/feature-flipping/).

## API ##
### Defining a feature ###
    var flipper = require('flipper');
    flipper.add('mutatedDolphins');
  
### Testing for a feature ###
    var flipper = require('flipper');
    if (flipper.mutatedDolphins) {
      /* dolphins are now mutated */
    } else {
      /* normal dolphins */
    }
    /* alternatively */
    flipper.isEnabled('mutatedDolphins')
    flipper.mutatedDolphins.isEnabled()
  
### Enabling a feature ###
    flipper.mutatedDolphins = true;
    flipper.mutatedDolphins.enable();
    flipper.enable('mutatedDolphins');

### Disabling a feature ###
    flipper.mutatedDolphins = false;
    flipper.mutatedDolphins.disable();
    flipper.disable('mutatedDolphins');
  
### Finding out all current features ###
    flipper.features() /* returns array of { name: "feature name", status: "enabled|disabled" } */

## Connect middleware ##
If you make use of the [connect](http://www.senchalabs.org/connect/) middleware:

    var app = connect().use(flipper.http({base: '/flipper'})).listen(3000);
You can flip and inspect features via HTTP:

    curl http://localhost:3000/flipper/ # return list of all features with status (enabled/disabled)
    curl http://localhost:3000/flipper/mutatedDolphins # returns status (enabled/disabled)
    curl -X PUT http://localhost:3000/flipper/mutatedDolphins --data-binary enable #enables the feature
    curl -X PUT http://localhost:3000/flipper/mutatedDolphins --data-binary disable

## Persistence ##
To survive application restarts, flipper can write a configuration file whenever a feature is added, enabled, or disabled. To enable this, call the persist function:

    var flipper = require('flipper');
    flipper.persist(__dirname  + '/features.json');

