# Node.js' Fastly Purging API implementation

Implements Fastly Purging API, see https://docs.fastly.com/api/purge

[![NPM](https://nodei.co/npm/fastly-purge.png?downloads=true&downloadRank=true)](https://nodei.co/npm/fastly-purge)

[![Build Status](https://travis-ci.org/CartoDB/node-fastly-purge.png?branch=master)](https://travis-ci.org/CartoDB/node-fastly-purge)
[![Code Climate](https://codeclimate.com/github/CartoDB/node-fastly-purge/badges/gpa.png)](https://codeclimate.com/github/CartoDB/node-fastly-purge)



## Dependencies

 * Node >=0.10
 * npm >=1.2.1

## Install

```shell
npm install [fastly-purge]
```

## API

```javascript
var FAKE_API_KEY = 'wadus';

var FAKE_PURGE_URL = 'http://example.com/image.jpg';
var FAKE_SERVICE_ID = 'wadus_service_id';
var FAKE_SURROGATE_KEY = 'wadus_key';

var fastlyPurge = new FastlyPurge(FAKE_API_KEY);
var fastlySoftPurge = new FastlyPurge(FAKE_API_KEY, { softPurge: true });

function callback(err, result) {
    console.log(err, result);
}
```

### Instant Purge an individual URL

```javascript
fastlyPurge.url(FAKE_PURGE_URL, callback);
// or
fastlySoftPurge.url(FAKE_PURGE_URL, { softPurge: false }, callback);
```

### Instant Purge everything from a service

```javascript
fastlyPurge.service(FAKE_SERVICE_ID, callback);
```

Note: service purging does not support soft purge


### Instant Purge a particular service of items tagged with a Surrogate Key

```javascript
fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, callback);
// or
fastlySoftPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, { softPurge: false }, callback);
```

### Soft Purge an individual URL

```javascript
fastlyPurge.url(FAKE_PURGE_URL, { softPurge: true }, callback);
// or
fastlySoftPurge.url(FAKE_PURGE_URL, callback);
```

### Soft Purge a particular service of items tagged with a key

```javascript
fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, { softPurge: true }, callback);
// or
fastlySoftPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, callback);
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
