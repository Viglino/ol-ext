#!/bin/bash

#
# Destination directory for builds.
#
BUILDS=../build

#
# URL for canonical repo.
#
REMOTE=https://github.com/Viglino/ol-ext.git


run_gulp_task() {
  #../node_modules/..
  cp ../dist/ol-ext.css ${BUILDS}
}

#
# Check out the provided tag.  This ensures that the tag has been pushed to
# the canonical remote.
#
checkout_tag() {
  git fetch ${REMOTE} refs/tags/v${1}:refs/tags/v${1}
  git checkout refs/tags/v${1}
}

#
# Copy all files needed for npm and publish to npm.
#

main() {

    test -d "$BUILDS" || mkdir -p "$BUILDS" &&
    cp -r ../src/* "$BUILDS" &&
    cp -r ../package.json "$BUILDS" &&
    cp -r ../README.md "$BUILDS" &&
    cp -r ../CHANGELOG.md "$BUILDS" &&
    cp -r ../composer.json "$BUILDS" &&
    cp -r ../.npmignore "$BUILDS"
    cp -r ../dist/ol-ext.css "$BUILDS"

    #TODO: Build dist ol-ext.js and css
    #run_gulp_task
    #TODO: Check out the provided tag
    #checkout_tag

    cd ${BUILDS}
    npm publish

    #rm -rf ${BUILDS}
}

main


