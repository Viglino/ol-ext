import ol_ext_inherits from '../util/ext'
import ol_Object from 'ol/ol_Object'
import ol_ext_element from '../util/element'

/** ol/legend/Item options
 * @typedef {Object} olLegendItemOptions
 * @property {string} options.title row title
 * @property {className} options.className
 * @property {import(ol/Feature)} options.feature a feature to draw on the legend
 * @property {import('ol/style/Style').styleLike} options.style a style or a style function to use to draw the legend
 * @property {*} options.properties a set of properties to use with a style function
 * @property {string} options.typeGeom type geom to draw with the style or the properties
 */

/** A class for legend items
 * @constructor
 * @fires select
 * @param {olLegendItemOptions} options
 */
var ol_legend_Item = function(options) {
  options = options || {};
  ol_Object.call(this, options);
  if (options.feature) this.set('feature', options.feature.clone());
  this.element = ol_ext_element.create('LI', {
    className : this.get('className')
  });
  this._box = ol_ext_element.create ('DIV', {
    click: function() {
      this.dispatchEvent({
        type: 'select',
        symbol : true
      })
    }.bind(this),
    parent: this.element
  });
  this._title = ol_ext_element.create ('DIV', {
    html: this.get('title') || '',
    click: function() {
      this.dispatchEvent({
        type: 'select',
        symbol : true
      })
    }.bind(this),
    parent: this.element
  });
};
ol_ext_inherits(ol_legend_Item, ol_Object);

/** Set the legend title
 * @param {string} title
 */
ol_legend_Item.prototype.setTitle = function(title) {
  this.set('title', title || '')
  this._title.innerHTML = this.get('title') || '';
};

/** Get element
 * @param {ol.size} size symbol size
 */
ol_legend_Item.prototype.getElement = function(size) {
  this._title.innerHTML = this.get('title') || '';
  this.element.style.height = size[1] + 'px';
  this._box.style.width = size[0] + 'px';
  this._box.style.height = size[1] + 'px';
  return this.element;
};

export default ol_legend_Item
