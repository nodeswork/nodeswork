PATH := ./node_modules/.bin:${PATH}

.PHONY : init clean-docs clean build test dist publish

init:
	npm install

docs:
	codo

clean-docs:
	rm -rf docs/

clean: clean-docs
	rm -rf lib/ test/*.js

build:
	coffee -o lib/ -c src/

dist: clean init docs build test

publish: dist
	npm publish
