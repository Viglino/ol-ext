import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'

/** Add a mix-blend-mode CSS filter (not working with IE or ol<6).
 * Add a className to the layer to apply the filter to a specific layer.    
 * With ol<6 use {@link ol_filter_Composite} instead.    
 * Use {@link ol_layer_Base#addFilter}, {@link ol_layer_Base#removeFilter} or {@link ol_layer_Base#getFilters}
 * @constructor
 * @extends {ol.Object}
 * @param {Object} options
 *  @param {string} options.blend mix-blend-mode to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode CSS property})
 *  @param {string} options.filter filter to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter CSS property})
 *  @param {boolan} options.display show/hide layer from CSS (but keep it in layer list)
 */
var ol_filter_CSS = function(options) {
  ol_filter_Base.call(this, options);
  this._layers = [];
};
ol_ext_inherits(ol_filter_CSS, ol_filter_Base);

/** Modify blend mode
 * @param {string} blend mix-blend-mode to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode CSS property})
 */
ol_filter_CSS.prototype.setBlend = function(blend) {
  this.set('blend', blend);
  this._layers.forEach(function(layer) {
    layer.once('postrender', function(e) {
      e.context.canvas.parentNode.style['mix-blend-mode'] = blend || '';
    }.bind(this));
    layer.changed();
  });
};

/** Modify filter mode
 * @param {string} filter filter to apply (as {@link https://developer.mozilla.org/en-US/docs/Web/CSS/filter CSS property})
 */
ol_filter_CSS.prototype.setFilter = function(filter) {
  this.set('filter', filter);
  this._layers.forEach(function(layer) {
    layer.once('postrender', function(e) {
      e.context.canvas.parentNode.style['filter'] = filter || '';
    }.bind(this));
    layer.changed();
  });
};

/** Modify layer visibility (but keep it in the layer list)
 * @param {bolean} display
 */
 ol_filter_CSS.prototype.setDisplay = function(display) {
  this.set('display', display);
  this._layers.forEach(function(layer) {
    layer.once('postrender', function(e) {
      e.context.canvas.parentNode.style['display'] = display ? '' : 'none';
    }.bind(this));
    layer.changed();
  });
};

/** Add CSS filter to the layer
 * @param {ol_layer_Base} layer 
 */
ol_filter_CSS.prototype.addToLayer = function(layer) {
  layer.once('postrender', function(e) {
    e.context.canvas.parentNode.style['mix-blend-mode'] = this.get('blend') || '';
    e.context.canvas.parentNode.style['filter'] = this.get('filter') || '';
    e.context.canvas.parentNode.style['display'] = this.get('display')!==false ?  '' : 'none';
  }.bind(this));
  layer.changed();
  this._layers.push(layer);
  // layer.getRenderer().getImage().parentNode.style['mix-blend-mode'] = 'multiply';
};

/** Remove CSS filter from the layer
 * @param {ol_layer_Base} layer 
 */
ol_filter_CSS.prototype.removeFromLayer = function(layer) {
  var pos = this._layers.indexOf(layer);
  if (pos>=0) {
    layer.once('postrender', function(e) {
      e.context.canvas.parentNode.style['mix-blend-mode'] = '';
      e.context.canvas.parentNode.style['filter'] = '';
      e.context.canvas.parentNode.style['display'] = '';
    }.bind(this));
    layer.changed();
    this._layers.splice(pos, 1);
  }
};

export default ol_filter_CSS
