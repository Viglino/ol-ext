# ol-ext
*Cool extensions for [OpenLayers](https://github.com/openlayers/openlayers) (ol)*.

[ol-ext](https://github.com/Viglino/ol-ext) is a set of extensions, controls, interactions to use with Openlayers.    
[View live examples online](http://viglino.github.io/ol-ext/) or the [API documentation](http://viglino.github.io/ol-ext/doc/doc-pages/).

### ! ol3-ext is now [ol-ext](https://github.com/Viglino/ol-ext) !
ol3-ext has been renamed to ol-ext and is [now available on NPM](https://www.npmjs.com/package/ol-ext): **update your bookmark and your code**.

**Keywords:** CSS popup, 
Font Awesome symbol renderer, 
charts for statistical map (pie/bar), 
layer switcher,
wikipedia layer, 
animations

> [
![Font style](img/map.style.font.jpg?raw=true)
![Charts](img/map.style.chart.jpg?raw=true)
![](img/map.style.pattern.jpg?raw=true)
![](img/map.style.photo.jpg?raw=true)
![](img/map.style.textpath.jpg?raw=true)
![](img/map.filter.colorize.jpg?raw=true)
![](img/map.control.compass.jpg?raw=true)
![](img/map.control.graticule.jpg?raw=true)
![](img/map.interaction.transform.jpg?raw=true)
![](img/map.control.editbar.jpg?raw=true)
![](img/map.switcher.image.jpg?raw=true)
![](img/map.control.profil.jpg?raw=true)
![](img/map.control.swipe.jpg?raw=true)
![](img/map.popup.anim.jpg?raw=true)
![](img/map.layer.hexbin.jpg?raw=true)
![](img/map.geom.cspline.jpg?raw=true)
![](img/map.cluster.convexhull.jpg?raw=true)
![](img/map.overlay.magnify.jpg?raw=true)
![](img/map.filter.lego.jpg?raw=true)
![](img/map.interaction.synchronize.jpg?raw=true)
](http://viglino.github.io/ol-ext/)

## Getting Started

## using ol-ext in a web page

* For use in a web page install the npm [openlayers-ext package](https://www.npmjs.com/package/openlayers-ext):
````
npm install openlayers-ext
````
* Just download the [scripts](dist) in the dist directory of the project and insert the .js and .css in your page.
* If you just want to add a `<script>` tag to test things out, you can link directly to the builds from the github rawgit (not recommended in production).

````html
<!-- jQuery -->
<script type="text/javascript" src="https://code.jquery.com/jquery-1.11.0.min.js"></script>

<!-- Openlayers -->
<link rel="stylesheet" href="https://openlayers.org/en/master/css/ol.css" />
<script type="text/javascript" src="https://openlayers.org/en/latest/build/ol.js"></script>

<!-- OL-ext -->
<link rel="stylesheet" href="https://cdn.rawgit.com/Viglino/ol-ext/master/dist/ol-ext.min.css" />
<script type="text/javascript" src="https://cdn.rawgit.com/Viglino/ol-ext/master/dist/ol-ext.min.js"></script>
````

## using ol-ext in a webpack

* Use npm [ol-ext package](https://www.npmjs.com/package/ol-ext) and link to the node_modules directory:
````
npm install ol-ext
````

Visit the [this repository](https://github.com/darkscript/ol-ol-ext-webpack-example) for a good example of working with ol-ext npm version and bundler (webpack)
 
## Documentation

Check out the [hosted examples](http://viglino.github.io/ol-ext/) or the [API documentation](http://viglino.github.io/ol-ext/doc/doc-pages/).

## Contributing

Please see our [contributing guidelines](https://github.com/Viglino/ol-ext/blob/master/CONTRIBUTING.md) if you're interested in getting involved.

## Bugs

Please use the [GitHub issue tracker](https://github.com/Viglino/ol-ext/issues) for all bugs and feature requests. Before creating a new issue, do a quick search to see if the problem has been reported already.

## License

ol-ext is licensed under the French Opensource **BSD** compatible CeCILL-B FREE SOFTWARE LICENSE.  
 (c) 2016-2017 - Jean-Marc Viglino

Some resources (mapping services and API) used in this sofware may have a specific license.  
You must check before use.

> [Full text license in English](http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt)  
> [Full text license in French](http://www.cecill.info/licences/Licence_CeCILL-B_V1-fr.txt)

For convenience you can use the BSD licence instead when publish content to webpack.
