'use strict';

var request = require('request');
var util = require('util');

function FastlyPurge(apiKey, options) {
    this._apiKey = apiKey;

    this._options = defaults(options || {}, {
        softPurge: false,
        shieldingWait: false,
        shieldingDelay: 4000
    });
}

module.exports = FastlyPurge;

var FASTLY_API_ENDPOINT = 'https://api.fastly.com';
module.exports.FASTLY_API_ENDPOINT = FASTLY_API_ENDPOINT;

/*
 * Instant Purge an individual URL
 *
 */

FastlyPurge.prototype.url = function(url, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }

    options = defaults(options, {
        softPurge: this._options.softPurge
    });

    request(
        {
            method: 'PURGE',
            url: url,
            headers: requestHeaders(options)
        },
        responseHandler(callback)
    );
};

FastlyPurge.prototype.service = function(serviceId, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }

    options = extend(options, {
        apiKey: this._apiKey,
        accept: 'application/json'
    });

    request(
        {
            method: 'POST',
            url: fastlyUrl(util.format('/service/%s/purge_all', serviceId)),
            headers: requestHeaders(options)
        },
        responseHandler(callback)
    );
};

FastlyPurge.prototype.key = function(serviceId, key, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }

    options = extend(
        defaults(options, {
            softPurge: this._options.softPurge
        }),
        {
            apiKey: this._apiKey,
            accept: 'application/json'
        }
    );

    request(
        {
            method: 'POST',
            url: fastlyUrl(util.format('/service/%s/purge/%s', serviceId, key)),
            headers: requestHeaders(options)
        },
        responseHandler(callback)
    );
};

FastlyPurge.prototype.shieldingKey = function(serviceId, key, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }

    var delay = options.shieldingDelay || this._options.shieldingDelay;
    var shieldingWait = options.shieldingWait || this._options.shieldingWait;

    this.key(serviceId, key, options, () => {
        if (!shieldingWait) {
            callback();
        }

        setTimeout(() => {
            callback = shieldingWait ? callback : function () {};
            this.key(serviceId, key, options, callback);
        }, delay);
    });
};

function requestHeaders(options) {
    var headers = {};

    if (!!options.apiKey) {
        headers['Fastly-Key'] = options.apiKey;
    }

    if (!!options.softPurge) {
        headers['Fastly-Soft-Purge'] = 1;
    }

    if (!!options.accept) {
        headers.Accept = options.accept;
    }

    return headers;
}

function responseHandler(callback) {
    return function handler(err, response, body) {
        if (response && response.statusCode !== 200) {
            err = new Error(body || 'Empty response body');
            err.statusCode = response.statusCode;
        }
        if (err) {
            return callback(err);
        }

        if (response.headers['content-type'] === 'application/json') {
            try {
                body = JSON.parse(body);
            } catch (parseErr) {
                // ignore and return plain body
            }
        }

        return callback(null, body);
    };
}

function defaults(obj, def) {
    Object.keys(def).forEach(function(k) {
        if (!obj.hasOwnProperty(k)) {
            obj[k] = def[k];
        }
    });

    return obj;
}

function extend(obj, ext) {
    Object.keys(ext).forEach(function(k) {
        obj[k] = ext[k];
    });
    return obj;
}

function fastlyUrl(path) {
    return FASTLY_API_ENDPOINT + path;
}
