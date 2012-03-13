var connect = require('connect'),
    flipper = require('../lib/flipper'),
    app = connect().use(flipper.http('/features')).listen(3000);

//flipper.persist(__dirname+'/features.json');
flipper.add('cheeseballs');
flipper.add('baconballs');



