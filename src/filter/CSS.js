import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'

/** Add a mix-blend-mode CSS filter (not working with IE or ol<6).
 * Add a className to the layer to apply the filter to a specific layer.    
 * With ol<6 use {@link ol_filter_Composite} instead.    
 * Use {@link ol_layer_Base#addFilter}, {@link ol_layer_Base#removeFilter} or {@link ol_layer_Base#getFilters}
 * @constructor
 * @extends {ol.Object}
 * @param {Object} options
 *  @param {string} options.blend a list of mix-blend-mode to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode CSS property})
 */
var ol_filter_CSS = function(options) {
  ol_filter_Base.call(this, options);
};
ol_ext_inherits(ol_filter_CSS, ol_filter_Base);

/** Add CSS filter to the layer
 * @param {ol_layer_Base} layer 
 */
ol_filter_CSS.prototype.addToLayer = function(layer) {
  layer.once('postrender', function(e) {
    e.context.canvas.parentNode.style['mix-blend-mode'] = this.get('blend') || '';
  }.bind(this));
  layer.changed();
  // layer.getRenderer().getImage().parentNode.style['mix-blend-mode'] = 'multiply';
};

/** Remove CSS filter from the layer
 * @param {ol_layer_Base} layer 
 */
ol_filter_CSS.prototype.removeFromLayer = function(layer) {
  layer.once('postrender', function(e) {
    e.context.canvas.parentNode.style['mix-blend-mode'] = '';
  }.bind(this));
  layer.changed();
};

export default ol_filter_CSS
