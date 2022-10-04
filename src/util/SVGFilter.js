import ol_Object from 'ol/Object.js'
import ol_ext_SVGOperation from './SVGOperation.js'

/** SVG filter 
 * @param {*} options
 *  @param {ol_ext_SVGOperation} option.operation
 *  @param {string} option.id filter id, only to use if you want to adress the filter directly or let the lib create one, if none create a unique id
 *  @param {string} option.color color interpolation filters, linear or sRGB
 */
var ol_ext_SVGFilter = class olextSVGFilter extends ol_Object {
  constructor(options) {
    options = options || {};

    super();

    if (!ol_ext_SVGFilter.prototype.svg) {
      ol_ext_SVGFilter.prototype.svg = document.createElementNS(this.NS, 'svg');
      ol_ext_SVGFilter.prototype.svg.setAttribute('version', '1.1');
      ol_ext_SVGFilter.prototype.svg.setAttribute('width', 0);
      ol_ext_SVGFilter.prototype.svg.setAttribute('height', 0);
      ol_ext_SVGFilter.prototype.svg.style.position = 'absolute';
      /* Firefox doesn't process hidden svg
      ol_ext_SVGFilter.prototype.svg.style.display = 'none';
      */
      document.body.appendChild(ol_ext_SVGFilter.prototype.svg);
    }

    this.element = document.createElementNS(this.NS, 'filter');
    this._id = options.id || '_ol_SVGFilter_' + (ol_ext_SVGFilter.prototype._id++);
    this.element.setAttribute('id', this._id);
    if (options.color)
      this.element.setAttribute('color-interpolation-filters', options.color);

    if (options.operation)
      this.addOperation(options.operation);

    ol_ext_SVGFilter.prototype.svg.appendChild(this.element);
  }
  /** Get filter ID
   * @return {string}
   */
  getId() {
    return this._id;
  }
  /** Remove from DOM
   */
  remove() {
    this.element.remove();
  }
  /** Add a new operation
   * @param {ol_ext_SVGOperation} operation
   */
  addOperation(operation) {
    if (operation instanceof Array) {
      operation.forEach(function (o) { this.addOperation(o); }.bind(this));
    } else {
      if (!(operation instanceof ol_ext_SVGOperation))
        operation = new ol_ext_SVGOperation(operation);
      this.element.appendChild(operation.geElement());
    }
  }
  /** Add a grayscale operation
   * @param {number} value
   */
  grayscale(value) {
    this.addOperation({
      feoperation: 'feColorMatrix',
      type: 'saturate',
      values: value || 0
    });
  }
  /** Add a luminanceToAlpha operation
   * @param {*} options
   *  @param {number} options.gamma enhance gamma, default 0
   */
  luminanceToAlpha(options) {
    options = options || {};
    this.addOperation({
      feoperation: 'feColorMatrix',
      type: 'luminanceToAlpha'
    });
    if (options.gamma) {
      this.addOperation({
        feoperation: 'feComponentTransfer',
        operations: [{
          feoperation: 'feFuncA',
          type: 'gamma',
          amplitude: options.gamma,
          exponent: 1,
          offset: 0
        }]
      });
    }
  }
  applyTo(img) {
    var canvas = document.createElement('CANVAS');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    canvas.getContext('2d').filter = 'url(#' + this.getId() + ')';
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas;
  }
}

ol_ext_SVGFilter.prototype.NS = 'http://www.w3.org/2000/svg';
ol_ext_SVGFilter.prototype.svg = null;
ol_ext_SVGFilter.prototype._id = 0;

export default ol_ext_SVGFilter
