# Developing

## Setting up development environment

You will obviously start by [forking](https://github.com/viglino/ol-ext/fork) the ol-ext repository.

### Install the dependencies

Go in the project directory and run the `npm install` that will install the dependencies in the local node_modules folder.

### Creating the distribution

Since v.2 the extensions are provided as ES6 modules. 
To be used in a web page you have to create the distribution.

Use the gulp command to create a distribution of the project into the `/dist` directory:
````
gulp
````

### Create individual files

If you don't want to use the whole distribution in a web page, you can create individual js compatible with your browser.
Use the `gulp lib` command to create individual files into the `/lib` directory then link tpo this files:
````
gulp lib
````

## Watch files and live reload

To help creating and testing the examples when developping you can use the `watch` or `serve` task. 

To recreate the distribution on the fly when `js` files change, use the `watch` task:
````
gulp watch
````

You can use the `serve` task to start a live server:
````
gulp serve
````
See the result in your browser at `http://localhost:8181`.
The `dist` will be recreated on each changes and the page will reload on the browser. 

## Adding new extensions

To ensure the correct translation beetween the modules and the distribution on ol classes:
- Export one class per file as default
- Use the naming convention

### Naming convention

To ensure the correct translation beetween the modules and the distribution on ol classes, we use the following naming convention.

In Openlayers classes just replace the `point` by a `underscore`.
- Thus the `ol.layer.Vector` class must be imported as `ol_layer_Vector`.
- A new control `ol.control.MyControl` must be declared as `ol_control_MyControl`

The file name must reflect the name of the extension and should be placed in the src directory corresponding to its namespace.
Thus `ol_control_MyControl`must be created in the `./src/control/MyControl.js` file and can be used in a webpack as:
````javascript
import ol_control_MyControl from 'ol-ext/control/MyControl.js';
````

Example:
````javascript
// Import ol classes
import ol_ext_inherits from '../util/ext.js'
import ol_control_Control from 'ol/control/Control.js'

// Create my control
var ol_control_MyControl = function(options) {
  ol_control_Control.call(this,options);
}
ol_ext_inherits(ol_control_MyControl, ol_control_Control);

// Export my control
export default ol_control_MyControl

````

## Linting 
The project use eslint to lint the code, just type in a console:

````
npm run lint
````

## Building the documentation:

The documentation use [gulp-jsdoc3](https://www.npmjs.com/package/gulp-jsdoc3) to create the doc.

1. install the gulp-jsdoc3 project at the root directory:
````
npm install gulp-jsdoc3
````
2. then run the gulp command to create the doc in the [doc/doc-pages](http://viglino.github.io/ol-ext/doc/doc-pages/) directory:
````
gulp doc
````

