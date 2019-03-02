# Change log

## Next version 
Move to ol v6

## v3.1.1 2019-03-22
* bug ol/ext/inherits

## v3.1.1 2019-02-24
Bug correction, ES6 fix

## v3.1.0 2019-01-19
Remove Jquery dependencies: the library has now removed jQuery from its dependencies.    
If you use jQuery in your project you may have to pass options using the `$obj.get(0)` function instead of passing the jQuery object.    
- Add new story map controls

## v3.0.3 2018-12
Start removing jQuery dependencies.

## v3.0.0 2018-07-18
Migrate to ol5 modules [#123](https://github.com/Viglino/ol-ext/issues/123)

## v2.0.6 2018-07-14
Last version using ol<5    
Remove deprecated methods

## v2.0.5 2018-06-27
Search controls, GeolocationBar...

## v2.0.1 2018-03-24
Remove dist from npm and create openlayers-ext package to use with browser.

## v2.0.0 2018-02-21
Use ES6 module syntax #33
Use ./dist in a web page

## v1.1.3 2018-02-07
This is the last v1 release.
- Next release (v2) will use ES6 module syntax [#33](https://github.com/Viglino/ol3-ext/issues/33).
- Switch to the `./dist/ol-ext.js` to keep on running on next version.

## v1.1.2 2017-12
**change project name ol-ext is now ol-ext**
- add doc-pages [#53](https://github.com/Viglino/ol3-ext/issues/53)
- see [#65](https://github.com/Viglino/ol3-ext/issues/65)

## v1.0.0 2016-11-12
see [#8](https://github.com/Viglino/ol3-ext/issues/8) and [#10](https://github.com/Viglino/ol3-ext/issues/10)
-  `ol.control.Toggle` inherits from `ol.control.Button` (this means you have to add the ol.control.Button.js to your pages).
- Move subbar from `ol.control.Bar` to `ol.control.Toggle`.    
Instead of:
```javascript
var c = new ol.control.Toggle ();
bar.addControl (c, subbar);
```
use:
```javascript
var c = new ol.control.Toggle ({ bar: subbar });
bar.addControl (c);
```
- add `autoActive` option to `ol.control.Toggle` to auto activate the control when inserted in a subbar
- add `autoDeactivate` option to `ol.control.Bar` to auto deactivate all controls in a subbar when desactivating it 

