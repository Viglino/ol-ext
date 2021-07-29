/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'

/** Add a composite filter on a layer.    
 * With ol6+ you'd better use {@link ol_filter_CSS} instead.    
 * Use {@link ol_layer_Base#addFilter}, {@link ol_layer_Base#removeFilter} or {@link ol_layer_Base#getFilters}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {Object} options
 *  @param {string} options.operation composite operation
 */
var ol_filter_Composite = function(options) {
  ol_filter_Base.call(this, options);

  this.set("operation", options.operation || "source-over");
}
ol_ext_inherits(ol_filter_Composite, ol_filter_Base);

/** Change the current operation
*	@param {string} operation composite function
*/
ol_filter_Composite.prototype.setOperation = function(operation) {
  this.set('operation', operation || "source-over");
}

ol_filter_Composite.prototype.precompose = function(e) {
  var ctx = e.context;
  ctx.save();
  ctx.globalCompositeOperation = this.get('operation');
}

ol_filter_Composite.prototype.postcompose = function(e) {
  e.context.restore();
}

export default ol_filter_Composite
