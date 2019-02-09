/** @namespace  ol.ext
 */
/*global ol*/
if (window.ol && !ol.ext)  ol.ext = {};

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

export default ol_ext_inherits
