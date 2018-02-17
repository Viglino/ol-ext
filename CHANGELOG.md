# Change log

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

