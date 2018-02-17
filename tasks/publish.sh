#!/bin/bash
# TODO: Improve the script to manage git checks before publish
#
# Destination directory for builds.
#
BUILDS=../build

#
# URL for canonical repo.
#
REMOTE=https://github.com/Viglino/ol-ext.git

#
# Copy all files needed for npm and publish to npm.
#

main() {

    test -d "$BUILDS" || mkdir -p "$BUILDS" &&
    cp -r ../src/* "$BUILDS" &&
    cp -r ../.npmignore "$BUILDS" &&
    cp -r ../CHANGELOG.md "$BUILDS" &&
    cp -r ../composer.json "$BUILDS" &&
    cp -r ../CONTRIBUTING.md "$BUILDS" &&
    cp -r ../DEVELOPING.md "$BUILDS" &&
    cp -r ../LICENCE.md "$BUILDS" &&
    cp -r ../package.json "$BUILDS" &&
    cp -r ../README.md "$BUILDS" &&
    cp -r ../dist/ol-ext.css "$BUILDS"

    cd ${BUILDS}
    npm publish

    #rm -rf ${BUILDS}
}

main


