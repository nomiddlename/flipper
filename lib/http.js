function setup(flipper) {
    function validStatus(data) {
        return (data === 'true' || data === 'false');
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

    function notFound(response) {
        response.statusCode = 404;
        response.end();
    }

    return function http(baseurl) {

        if (!baseurl) throw new Error("Flipper HTTP interface needs a base URL");

        return function (req, res, next) {
            if (req.url.indexOf(baseurl) !== 0) {
                next();
                return;
            }

            res.setHeader('Content-Type', 'application/json');

            if (req.url === baseurl && req.method === 'GET') {
                res.statusCode = 200;
                res.end(JSON.stringify(flipper.allFeatures()));
                return;
            }

            var feature = req.url.substring(baseurl.length + 1);
            if (req.method === 'GET') {
                if (flipper.exists(feature)) {
                    res.statusCode = 200;
                    res.end(JSON.stringify(flipper[feature]));
                    return;
                }
            }

            if (req.method === 'PUT' && feature) {
                var data = '';
                function parseRequestBody() {
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

                if (req.body) {
                    data = req.body;
                    parseRequestBody();
                    return;
                } else {
                    req.setEncoding('utf8');
                    req.on('data', function(chunk){ data += chunk; });
                    req.on('end', parseRequestBody);
                    return;
                }
            }
            notFound(res);
        };
    };
}

exports.setup = setup;
