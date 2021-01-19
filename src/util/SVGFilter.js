import ol_ext_inherits from './ext'
import ol_Object from 'ol/Object'
import ol_ext_SVGOperation from './SVGOperation'

/** SVG filter 
 * @param {ol_ext_SVGOperation} operation
 */
var ol_ext_SVGFilter = function(operation) {

  ol_Object.call(this);

  if (!ol_ext_SVGFilter.prototype.svg) {
    ol_ext_SVGFilter.prototype.svg = document.createElementNS( this.NS, 'svg' );
    ol_ext_SVGFilter.prototype.svg.setAttribute('version','1.1');
    ol_ext_SVGFilter.prototype.svg.setAttribute('width',0);
    ol_ext_SVGFilter.prototype.svg.setAttribute('height',0);
    ol_ext_SVGFilter.prototype.svg.style.position = 'absolute';
    document.body.appendChild( ol_ext_SVGFilter.prototype.svg );
  }

  this.element = document.createElementNS( this.NS, 'filter' );
  this._id = '_ol_SVGFilter_' + (ol_ext_SVGFilter.prototype._id++);
  this.element.setAttribute( 'id', this._id );

  if (operation) this.addOperation(operation);

  ol_ext_SVGFilter.prototype.svg.appendChild( this.element );
};
ol_ext_inherits(ol_ext_SVGFilter, ol_Object);

ol_ext_SVGFilter.prototype.NS = "http://www.w3.org/2000/svg";
ol_ext_SVGFilter.prototype.svg = null;
ol_ext_SVGFilter.prototype._id = 0;

/** Get filter ID
 * @return {string}
 */
ol_ext_SVGFilter.prototype.getId = function() {
  return this._id;
};

/** Remove from DOM
 */
ol_ext_SVGFilter.prototype.remove = function() {
  this.element.remove();
};

/** Add a new operation
 * @param {ol_ext_SVGOperation} operation
 */
ol_ext_SVGFilter.prototype.addOperation = function(operation) {
  if (operation instanceof Array) {
    operation.forEach(function(o) { this.addOperation(o) }.bind(this));
  } else {
    if (!(operation instanceof ol_ext_SVGOperation)) operation = new ol_ext_SVGOperation(operation);
    this.element.appendChild( operation.geElement() );
  }
};

export default ol_ext_SVGFilter
