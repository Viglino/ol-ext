/*global ol*/
if (window.ol) {
  /** @namespace  ol.ext */
  if (!ol.ext) ol.ext = {};
  /** @namespace  ol.legend */
  if (!ol.legend) ol.legend = {};
  /** @namespace  ol.particule */
  if (!ol.particule) ol.particule = {};
  /** @namespace ol.ext.imageLoader */
  if (!ol.ext.imageLoader) ol.ext.imageLoader = {};
  /** @namespace  ol.ext.input */
  if (!ol.ext.input) ol.ext.input = {};

  /* Version */
  if (!ol.util) {
    ol.util = {
      VERSION: ol.VERSION || '5.3.0'
    };
  } else if (!ol.util.VERSION) {
    ol.util.VERSION = ol.VERSION || '6.1.0'
  }
}


/** Inherit the prototype methods from one constructor into another.
 * replace deprecated ol method
 *
 * @param {!Function} childCtor Child constructor.
 * @param {!Function} parentCtor Parent constructor.
 * @function module:ol.inherits
 * @api
 */
var ol_ext_inherits = function(child,parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
};

// Compatibilty with ol > 5 to be removed when v6 is out
if (window.ol) {
  if (!ol.inherits) ol.inherits = ol_ext_inherits;
}

/* IE Polyfill */
// NodeList.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
// Element.remove
if (window.Element && !Element.prototype.remove) {
  Element.prototype.remove = function() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
}
/* End Polyfill */

export { ol_ext_inherits }
export default ol_ext_inherits
