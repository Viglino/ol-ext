import ol_ext_inherits from './ext'
import ol_Object from 'ol/Object'

/** SVG filter
 * @param {string | *} attributes a list of attributes or fe operation
 *  @param {string} attributes.feoperation filter primitive tag name
 */
class ol_ext_SVGOperation {
  constructor(attributes) {
    if (typeof (attributes) === 'string')
      attributes = { feoperation: attributes };
    if (!attributes || !attributes.feoperation) {
      console.error('[SVGOperation]: no operation defined.');
      return;
    }

    ol_Object.call(this);

    this._name = attributes.feoperation;
    this.element = document.createElementNS(this.NS, this._name);
    this.setProperties(attributes);
    if (attributes.operations instanceof Array)
      this.appendChild(attributes.operations);
  }
  /** Get filter name
   * @return {string}
   */
  getName() {
    return this._name;
  }
  /** Set Filter attribute
   * @param {*} attributes
   */
  set(k, val) {
    if (!/^feoperation$|^operations$/.test(k)) {
      ol_Object.prototype.set.call(this, k, val);
      this.element.setAttribute(k, val);
    }
  }
  /** Set Filter attributes
   * @param {*} attributes
   */
  setProperties(attributes) {
    attributes = attributes || {};
    for (var k in attributes) {
      this.set(k, attributes[k]);
    }
  }
  /** Get SVG  element
   * @return {Element}
   */
  geElement() {
    return this.element;
  }
  /** Append a new operation
   * @param {ol_ext_SVGOperation} operation
   */
  appendChild(operation) {
    if (operation instanceof Array) {
      operation.forEach(function (o) { this.appendChild(o); }.bind(this));
    } else {
      if (!(operation instanceof ol_ext_SVGOperation))
        operation = new ol_ext_SVGOperation(operation);
      this.element.appendChild(operation.geElement());
    }
  }
}
ol_ext_inherits(ol_ext_SVGOperation, ol_Object);

ol_ext_SVGOperation.prototype.NS = "http://www.w3.org/2000/svg";






export default ol_ext_SVGOperation
