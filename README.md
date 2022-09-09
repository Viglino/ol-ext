# ol-ext
*Cool extensions for [OpenLayers](https://github.com/openlayers/openlayers) (ol)*.

[![](https://img.shields.io/npm/v/ol-ext.svg)](https://www.npmjs.com/package/ol-ext)
![](https://img.shields.io/github/stars/viglino/ol-ext)
![](https://img.shields.io/github/commit-activity/m/viglino/ol-ext)
![](https://img.shields.io/github/issues/viglino/ol-ext)
![](https://img.shields.io/github/issues-closed/viglino/ol-ext)
![](https://img.shields.io/github/v/release/viglino/ol-ext)    
![](https://img.shields.io/github/contributors/viglino/ol-ext)
![](https://img.shields.io/npm/dt/ol-ext)
![](https://img.shields.io/npm/dw/ol-ext)
![](https://img.shields.io/npm/l/ol-ext?color=orange)
![](https://img.shields.io/twitter/follow/jmviglino?style=social)

[ol-ext](https://github.com/Viglino/ol-ext) is a set of extensions, controls, interactions, popup to use with Openlayers.    
[View live examples online](http://viglino.github.io/ol-ext/) or the [API documentation](http://viglino.github.io/ol-ext/doc/doc-pages/).

**Keywords:** 
Storymap,
Timeline control,
CSS popup, 
Font Awesome symbols, 
charts for statistical map (pie/bar), 
layer switcher,
control bar,
wikipedia layer, 
legend control,
search,
animations,
undo/redo mechanisms

![](http://viglino.github.io/ol-ext/img/ol-ext.jpg)

## Getting Started

### NPM packages

ol-ext exists as ES6 modules ([ol-ext](https://www.npmjs.com/package/ol-ext)) and as pure js (deprecated! [openlayers-ext](https://www.npmjs.com/package/openlayers-ext)).

### using ol-ext in a webpack

* For use with webpack, Rollup, Browserify, or other module bundlers, install the npm [ol-ext package](https://www.npmjs.com/package/ol-ext) and link to the node_modules directory:
````
npm install ol-ext
````

See the following examples for more detail on bundling ol-ext with your application:

* Using [webpack](https://github.com/darkscript/ol-ol-ext-webpack-example)
* Using [parcel](https://github.com/Viglino/ol-ext-parcel-bundler)
* Using [angular](https://github.com/Viglino/ol-ext-angular)

**Typescript declarations** are avaliable at [Siedlerchr/types-ol-ext](https://github.com/Siedlerchr/types-ol-ext).
```
npm i -D @types/ol-ext@npm:@siedlerchr/types-ol-ext
```

### using ol-ext in a web page

* For use in a web page install the npm [openlayers-ext package](https://www.npmjs.com/package/openlayers-ext) (deprecated):
````
npm install openlayers-ext
````
The library will be available in the `node_modules/openlayers-ext/dist` directory. You can find individual files in the `node_modules/openlayers-ext/lib` directory.
* You can download the [scripts](dist) of the ./dist directory of the repository in your project and insert the .js and .css in your page.
* If you just want to add a `<script>` tag to test things out, you can link directly to the builds from the github rawgit (not recommended in production).
* For compatibility with older browsers and platforms (like Internet Explorer down to version 9 and Android 4.x), the OpenLayers needs to be transpiled (e.g. using Babel) and bundled with polyfills for `requestAnimationFrame`, `Element.prototype.classList`, `Object.assign`and `URL`.

````html
<!-- Openlayers -->
<link rel="stylesheet" href="https://openlayers.org/en/latest/css/ol.css" />
<script type="text/javascript" src="https://openlayers.org/en/latest/build/ol.js"></script>
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=requestAnimationFrame,Element.prototype.classList,URL,Object.assign"></script>

<!-- ol-ext -->
<link rel="stylesheet" href="https://cdn.rawgit.com/Viglino/ol-ext/master/dist/ol-ext.min.css" />
<script type="text/javascript" src="https://cdn.rawgit.com/Viglino/ol-ext/master/dist/ol-ext.min.js"></script>
````

### supported Browsers

ol-ext runs on all modern browsers that support HTML5 and ECMAScript 5. This includes Chrome, Firefox, Safari and Edge. For older browsers and platforms like Internet Explorer (down to version 9) and Android 4.x, polyfills for for `requestAnimationFrame`, `Element.prototype.classList`, `Object.assign`and `URL`.


## Documentation

Check out the [hosted examples](http://viglino.github.io/ol-ext/) or the [API documentation](http://viglino.github.io/ol-ext/doc/doc-pages/).

## Contributing

Please see our [contributing guidelines](https://github.com/Viglino/ol-ext/blob/master/CONTRIBUTING.md) if you're interested in getting involved.

* see all [contributors](https://github.com/Viglino/ol-ext/graphs/contributors)

## Bugs

Please use the [GitHub issue tracker](https://github.com/Viglino/ol-ext/issues) for all bugs and feature requests. Before creating a new issue, do a quick search to see if the problem has been reported already.

## License

ol-ext is licensed under the French Opensource **BSD** compatible CeCILL-B FREE SOFTWARE LICENSE.  
 (c) 2016-20 - Jean-Marc Viglino

Some resources (mapping services and API) used in this sofware may have a specific license.  
You must check before use.

> [Full text license in English](https://cecill.info/licences/Licence_CeCILL-B_V1-en.txt)    
> [Full text license in French](https://cecill.info/licences/Licence_CeCILL-B_V1-fr.txt)

For convenience you can use the BSD licence instead when publish content to webpack.
