import ol_ext_inherits from '../util/ext'
import ol_Object from 'ol/Object'
import ol_ext_element from '../util/element'

/** ol/legend/Item options
 * @typedef {Object} olLegendItemOptions
 *  @property {string} title row title
 *  @property {className} className
 *  @property {ol_Feature} feature a feature to draw on the legend
 *  @property {string} typeGeom type geom to draw with the style or the properties if no feature is provided
 *  @property {Object} properties a set of properties to use with a style function
 *  @property {ol_style_Style.styleLike} style a style or a style function to use to draw the legend symbol
 *  @property {ol_style_Text} textStyle a text style to draw the item title in the legend
 *  @property {ol.size|undefined} size
 *  @property {number|undefined} margin
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
};
ol_ext_inherits(ol_legend_Item, ol_Object);

/** Set the legend title
 * @param {string} title
 */
ol_legend_Item.prototype.setTitle = function(title) {
  this.set('title', title || '');
  this.changed();
};

/** Get element
 * @param {ol.size} size symbol size
 */
ol_legend_Item.prototype.getElement = function(size, onclick) {
  var element = ol_ext_element.create('LI', {
    className : this.get('className'),
    click: function(e) {
      onclick(false);
      e.stopPropagation();
    },
    style: { height: size[1] + 'px' },
    'aria-label': this.get('title')
  });
  ol_ext_element.create ('DIV', {
    click: function(e) {
      onclick(true);
      e.stopPropagation();
    },
    style: {
      width: size[0] + 'px',
      height: size[1] + 'px'
    },
    parent: element
  });
  return element;
};

export default ol_legend_Item
