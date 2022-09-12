# ![Openlayers](https://openlayers.org/theme/img/logo-light.svg) ol-ext
*Cool extensions for [OpenLayers](https://github.com/openlayers/openlayers) (ol > 5.3)*.

[ol-ext](https://github.com/Viglino/ol-ext) is a set of extensions, controls, interactions to use with Openlayers.    

### Check out [online examples](http://viglino.github.io/ol-ext/).
The [example page](http://viglino.github.io/ol-ext/) is the best way to have a quick look at all the library.

## ol extension
* [all extensions](./classes.list.html): list of all classes
* [base](./ol.html): base extensions
* [Map](./ol.Map.html): adds methods to the map
* [layer](./ol.layer.Base.html): usefull methods attached to layers
* [source](./ol.source.html): new sources ([DBPedia](./ol.source.DBPedia.html), [hexagonal binning](./ol.source.HexBin.html), [georeferenced images](./ol.source.GeoImage.html), [...](./ol.source.html))
* [controls](./ol.control.html): adds new controls ([tool bars](./ol.control.Bar.html), [Graticule](./ol.control.Graticule.html), [LayerSwitcher](./ol.control.LayerSwitcher.html), [Search](./ol.control.Search.html), [Profil](./ol.control.Profil.html), [...](./ol.control.html))
* [style](./ol.style.html): a set of style functions to style features on the maps ([charts symbols](./ol.style.Chart.html), [FillPattern](./ol.style.FillPattern.html), [FontSymbol](./ol.style.FontSymbol.html), [Photo](./ol.style.Photo.html), [TextPath](./ol.style.TextPath.html), [...](./ol.style.html))
* [filter](./ol.filter.html): filters to apply on layers ([Colorize](./ol.filter.Colorize.html), [Crop](./ol.filter.Crop.html), [Mask](./ol.filter.Mask.html), [...](./ol.filter.html))  
* [featureAnimation](./ol.featureAnimation.html): animates features on the map.   

### Bugs

Please use the [GitHub issue tracker](https://github.com/Viglino/ol-ext/issues) for all bugs and feature requests. Before creating a new issue, do a quick search to see if the problem has been reported already.

### Building the documentation:
The documentation use [gulp-jsdoc3](https://www.npmjs.com/package/gulp-jsdoc3) to create the doc.
1. install the gulp-jsdoc3 project at the root directory:
````
npm install gulp-jsdoc3
````
2. then run the gulp command to create the doc in the [doc/doc-pages](http://viglino.github.io/ol-ext/doc/doc-pages/) directory:
````
gulp doc
````

## Licence

ol-ext is licenced under the French Opensource **BSD** compatible CeCILL-B FREE SOFTWARE LICENSE.  
(c) 2016-2019 - Jean-Marc Viglino

[Full text license in English](https://cecill.info/licences/Licence_CeCILL-B_V1-en.txt)    
[Full text license in French](https://cecill.info/licences/Licence_CeCILL-B_V1-fr.txt)
