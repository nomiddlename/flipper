var flipper,
    allFeatures = {
        test: function(method, feature) { return method === 'GET' && feature === ''; },
        action: function(feature, req, res) {
            res.statusCode = 200;
            res.end(JSON.stringify(flipper.allFeatures()));
        }
    },
    singleFeature = {
        test: function(method, feature) { return method === 'GET' && flipper.exists(feature); },
        action: function(feature, req, res) {
            res.statusCode = 200;
            res.end(JSON.stringify(flipper[feature]));
        }
    },
    createOrUpdateFeature = {
        test: function(method, feature) { return method === 'PUT' && feature !== ''; },
        action: function(feature, req, res) {
            var data = '';
            if (req.body) {
                data = req.body;
                parseRequestBody(feature, data, res);
            } else {
                req.setEncoding('utf8');
                req.on('data', function(chunk){ data += chunk; });
                req.on('end', function() { parseRequestBody(feature, data, res); });
            }
        }
    },
    notFound = {
        test: function(method, feature) { return true; },
        action: function(feature, req, res) {
            res.statusCode = 404;
            res.end();
        }
    },
    handlers = [
        allFeatures,
        singleFeature,
        createOrUpdateFeature,
        notFound
    ];

function setup(lib) {
    flipper = lib;
    return http;
}

/* this seems silly, perhaps being overly cautious here */
function convert(data) {
    if (data === 'true') {
        return true;
    } else if (data === 'false') {
        return false;
    } else {
        return undefined;
    }
}

function validStatus(data) {
    return (data === 'true' || data === 'false');
}

function parseRequestBody(feature, data, res) {
    if (validStatus(data)) {
        res.statusCode = flipper.exists(feature) ? 200 : 201;
        //it's safe to always add a feature
        flipper.add(feature);
        flipper[feature] = convert(data);
        res.end(JSON.stringify(flipper[feature]));
    } else {
        res.statusCode = 400;
        res.end();
    }
}


function http(baseurl) {
    if (!baseurl) throw new Error("Flipper HTTP interface needs a base URL");

    return function (req, res, next) {
        var feature, notHandled = true;
        if (req.url.indexOf(baseurl) !== 0) {
            next();
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        feature = req.url.substring(baseurl.length + 1);
        handlers.forEach(function (handler) {
            if (notHandled && handler.test(req.method, feature)) {
                handler.action(feature, req, res);
                notHandled = false;
            }
        });
    };
}

exports.setup = setup;
