import ol_ext_inherits from '../util/ext'

/** Add a mix-blend-mode CSS filter (not working with IE or ol<6)
 * With ol < 6 use ol/filter/Composite instead.
 * @constructor
 * @extends {ol.Object}
 * @param {Object} options 
 *  @params {string} options.filters a list of filter to apply (as in CSS)
 */
var ol_filter_MixBlendCSS = function(options) {
  ol_filter_Base.call(this, options);
};
ol_ext_inherits(ol_filter_MixBlendCSS, ol_filter_Base);

/** Add CSS filter to the layer
 * @param {ol/layer/Base} layer 
 */
 ol_filter_MixBlendCSS.prototype.addToLayer = function(layer) {
  layer.once('postrender', function(e) {
    e.context.canvas.parentNode.style['mix-blend-mode'] = this.get('filters') || '';
  }.bind(this));
  layer.changed();
  // layer.getRenderer().getImage().parentNode.style['mix-blend-mode'] = 'multiply';
};

/** Remove CSS filter from the layer
 * @param {ol/layer/Base} layer 
 */
ol_filter_MixBlendCSS.prototype.removeFromLayer = function(layer) {
  layer.once('postrender', function(e) {
    e.context.canvas.parentNode.style['mix-blend-mode'] = '';
  }.bind(this));
  layer.changed();
};

export default ol_filter_MixBlendCSS
