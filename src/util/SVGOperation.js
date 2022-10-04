import ol_Object from 'ol/Object.js'

/** 
 * @typedef {Object} svgOperation
 * @property {string} attributes.feoperation filter primitive tag name
 * @property {Array<ol_ext_SVGOperation>} attributes.operations a list of operations
 */

/** SVG filter 
 * @param {string | svgOperation} attributes the fe operation or a list of operations
 */
var ol_ext_SVGOperation = class olextSVGOperation extends ol_Object {
  constructor(attributes) {
    if (typeof (attributes) === 'string') attributes = { feoperation: attributes };

    super();

    if (!attributes || !attributes.feoperation) {
      console.error('[SVGOperation]: no operation defined.');
      return;
    }

    this._name = attributes.feoperation;
    this.element = document.createElementNS(ol_ext_SVGOperation.NS || 'http://www.w3.org/2000/svg', this._name);
    this.setProperties(attributes);
    if (attributes.operations instanceof Array) {
      this.appendChild(attributes.operations);
    }
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
      super.set(k, val);
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
      if (!(operation instanceof ol_ext_SVGOperation)) {
        operation = new ol_ext_SVGOperation(operation);
      }
      this.element.appendChild(operation.geElement());
    }
  }
}

export default ol_ext_SVGOperation
