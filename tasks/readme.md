# Configuration Files

This directory includes configuration files for the build scripts in and documentation templates.

## publish.sh  (test purpose for publishing to npm, to be improved)

A script to automate publishing to npm: 
* Run Gulp build tasks in terminal to create dist files
* Tag version and push to remote
* Login to npm ```npm login``` 
* ``cd`` into ``task`` directory
* Run ``publish.sh``
* Test if it was successful by ``npm install xxx`` in a different project