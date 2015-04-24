jshint:
	@./node_modules/.bin/jshint lib/ test/

test:
	./node_modules/.bin/mocha -u bdd -t 5000 test/*.js

test-all: jshint test

coverage:
	@./node_modules/.bin/istanbul cover node_modules/.bin/_mocha -- -u bdd -t 5000 test/*.js

.PHONY: test coverage
