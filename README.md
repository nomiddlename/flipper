# Flipper - feature flipping for node.js #
[![Build Status](https://secure.travis-ci.org/nomiddlename/flipper.png?branch=master)](http://travis-ci.org/nomiddlename/flipper)

[Feature flipping](http://code.flickr.com/blog/2009/12/02/flipping-out/) (also called [feature toggling](http://martinfowler.com/bliki/FeatureToggle.html)) is a technique used in Continuous Deployment to allow developers to work on new features without blocking releases to production. [99 Designs explain it well](http://99designs.com/tech-blog/blog/2012/03/01/feature-flipping/).

There's also another implementation of [feature flipping for node.js](https://github.com/bigodines/feature-flipper-js). 

## Installation ##
~~npm install flipper~~
Sorry, flipper is no longer available on NPM. I've handed over the NPM package to [Facebook](https://fbflipper.com) for their project, on the grounds that the 7 people who download this library per week are probably doing so by accident. You can still use it in your projects if you want to by replacing the package name with the github url. Check the npm package.json docs for details on how.

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
  
### Enabling a feature ###
    flipper.mutatedDolphins = true;
    flipper.enable('mutatedDolphins');

### Disabling a feature ###
    flipper.mutatedDolphins = false;
    flipper.disable('mutatedDolphins');
  
### Finding out all current features ###
    flipper.allFeatures() /* returns array of { "feature name": status } */

## Connect middleware ##
If you make use of the [connect](http://www.senchalabs.org/connect/) middleware:

    var app = connect().use(flipper.http('/flipper')).listen(3000);
You can flip and inspect features via HTTP:

    curl http://localhost:3000/flipper/ # returns all features with status (true/false)
    curl http://localhost:3000/flipper/mutatedDolphins # returns status (true/false)
    curl -X PUT http://localhost:3000/flipper/mutatedDolphins --data-binary true #enables the feature
    curl -X PUT http://localhost:3000/flipper/mutatedDolphins --data-binary false

## Persistence ##
To survive application restarts, flipper can write a configuration file whenever a feature is added, enabled, or disabled. To enable this, call the persist function:

    var flipper = require('flipper');
    flipper.persist(__dirname  + '/features.json');

