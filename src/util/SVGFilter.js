import ol_ext_inherits from './ext'
import ol_Object from 'ol/Object'

/** SVG filter 
 * @param {string} filter filter name
 * @param {*} options
 *  @param {string} options.auth Authorisation as btoa("username:password");
 *  @param {string} options.dataType The type of data that you're expecting back from the server, default JSON
 */
var ol_ext_SVGFilter = function(name, options) {

  ol_Object.call(this);

  if (!ol_ext_SVGFilter.prototype.svg) {
    ol_ext_SVGFilter.prototype.svg = document.createElementNS( this.NS, 'svg' );
    document.body.appendChild( ol_ext_SVGFilter.prototype.svg );
  }

  this._name = name;
  this._filter = document.createElementNS( this.NS, 'filter' );
  this._id = '_ol_SVGFilter_' + (ol_ext_SVGFilter.prototype._id++);
  this._filter.setAttribute( 'id', this._id );

  this._data = document.createElementNS( this.NS, name );
  this.setAttributes(options);

  this._filter.appendChild( this._data );
  ol_ext_SVGFilter.prototype.svg.appendChild( this._filter );
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

/** Get filter name
 * @return {string}
 */
ol_ext_SVGFilter.prototype.getName = function() {
  return this._name;
};

/** Set Filter attributes
 * @param {*} options
 */
ol_ext_SVGFilter.prototype.setAttributes = function(options) {
  options = options || {};
  for (var i in options) {
    if (i!=='id') this._data.setAttribute( i, options[i] );
  }
};

/** Remove from DOM
 */
ol_ext_SVGFilter.prototype.remove = function() {
  this._filter.remove();
};

export default ol_ext_SVGFilter
