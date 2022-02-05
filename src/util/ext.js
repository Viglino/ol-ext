/** @namespace  ol.ext
 */
/*global ol*/
if (window.ol && !ol.ext) {
  ol.ext = {};
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
