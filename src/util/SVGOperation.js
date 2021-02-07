import ol_ext_inherits from './ext'
import ol_Object from 'ol/Object'

/** SVG filter 
 * @param {string | *} attributes a list of attributes or fe operation
 *  @param {string} attributes.feoperation filter primitive tag name
 */
var ol_ext_SVGOperation = function(attributes) {
  if (typeof(attributes)==='string') attributes = { feoperation: attributes };
  if (!attributes || !attributes.feoperation) {
    console.error('[SVGOperation]: no operation defined.')
    return;
  }

  ol_Object.call(this);

  this._name = attributes.feoperation;
  this.element = document.createElementNS( this.NS, this._name );
  this.setProperties(attributes);
  if (attributes.operations instanceof Array) this.appendChild(attributes.operations);
};
ol_ext_inherits(ol_ext_SVGOperation, ol_Object);

ol_ext_SVGOperation.prototype.NS = "http://www.w3.org/2000/svg";

/** Get filter name
 * @return {string}
 */
ol_ext_SVGOperation.prototype.getName = function() {
  return this._name;
};

/** Set Filter attribute
 * @param {*} attributes
 */
ol_ext_SVGOperation.prototype.set = function(k, val) {
  if (!/^feoperation$|^operations$/.test(k)) {
    ol_Object.prototype.set.call(this, k, val);
    this.element.setAttribute( k, val );
  }
};

/** Set Filter attributes
 * @param {*} attributes
 */
ol_ext_SVGOperation.prototype.setProperties = function(attributes) {
  attributes = attributes || {};
  for (var k in attributes) {
    this.set(k, attributes[k])
  }
};

/** Get SVG  element
 * @return {Element}
 */
ol_ext_SVGOperation.prototype.geElement = function() {
  return this.element;
};

/** Append a new operation
 * @param {ol_ext_SVGOperation} operation
 */
ol_ext_SVGOperation.prototype.appendChild = function(operation) {
  if (operation instanceof Array) {
    operation.forEach(function(o) { this.appendChild(o) }.bind(this));
  } else {
    if (!(operation instanceof ol_ext_SVGOperation)) operation = new ol_ext_SVGOperation(operation);
    this.element.appendChild( operation.geElement() );
  }
};

export default ol_ext_SVGOperation
