import ol_Object from 'ol/Object.js'
import ol_ext_element from '../util/element.js'

/** ol/legend/Item options
 * @typedef {Object} olLegendItemOptions
 *  @property {string} title row title
 *  @property {className} className
 *  @property {ol_Feature} feature a feature to draw on the legend
 *  @property {string} typeGeom type geom to draw with the style or the properties if no feature is provided
 *  @property {Object} properties a set of properties to use with a style function
 *  @property {ol_style_Style.styleLike} style a style or a style function to use to draw the legend symbol
 *  @property {ol_style_Text} textStyle a text style to draw the item title in the legend
 *  @property {number|undefined} width the symbol width, default use the default width
 *  @property {number|undefined} height ths symbol height, default use the default height
 *  @property {number|undefined} margin
 */

/** A class for legend items
 * @constructor
 * @fires select
 * @param {olLegendItemOptions} options
 */
var ol_legend_Item = class ollegendItem extends ol_Object {
  constructor(options) {
    options = options || {};
    super(options);
    
    if (options.feature) this.set('feature', options.feature.clone());
    this.setWidth(options.width)
    this.setHeight(options.height)
  }
  /** Set the legend title
   * @param {string} title
   */
  setTitle(title) {
    this.set('title', title || '');
    this.changed();
  }
  /** Set the item width
   * @param {number} [width]
   */
  setWidth(width) {
    this.set('width', width || null);
    this.changed();
  }
  /** Set the item heigth
   * @param {number} [heigth]
   */
  setHeight(heigth) {
    this.set('heigth', heigth || null);
    this.changed();
  }
  /** Get element
   * @param {ol.size} size symbol size
   * @param {function} onclick
   */
  getElement(size, onclick) {
    if (this.get('width')) size[0] = this.get('width');
    if (this.get('height')) size[1] = this.get('height');
    var element = ol_ext_element.create('LI', {
      className: this.get('className'),
      click: function (e) {
        onclick(false);
        e.stopPropagation();
      },
      style: { height: size[1] + 'px' },
      'aria-label': this.get('title')
    });
    ol_ext_element.create('DIV', {
      click: function (e) {
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
  }
}

export default ol_legend_Item
