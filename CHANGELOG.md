# Change log
==============


## 2016-11-12
- Move subbar from ol.control.Bar to ol.control.Toggle
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
- add autoActive option to ol.control.Toggle to auto activate the control when inserted in a subbar
- add autoDeactivate option to ol.control.Bar to auto deactivate all control in a subbar when desactivating it