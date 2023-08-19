import ol_Object from 'ol/Object.js'
import ol_ext_element from '../util/element.js'

/** A class for legend image
 * @constructor
 * @fires changed
 * @param {Object} options
 *  @param {string} url
 *  @param {string} [title]
 *  @param {HTMLImageElement|HTMLCanvasElement} [img] an image to display
 *  @param {string} [src] legend image url (if no img option)
 *  @param {string} [className] 'center' to center the title
 *  @param {number} [width] legend width, default use the image width
 */
var ol_legend_Image = class ollegendImage extends ol_Object {
  constructor(options) {
    options = options || {};
    super(options);

    this.set('width', options.width);
    // The image
    this._img = options.img || new Image()
    this._img.onload = function () {
      this.changed()
    }.bind(this);
    // Get source
    if (!options.img) {
      this._img.src = options.src;
    }
  }
  /** Set the legend title
   * @param {string} title
   */
  setTitle(title) {
    this.set('title', title || '');
    this.changed();
  }
  /** Set the item width
   * @param {number} [width] legend width, default use the image width
   */
  setWidth(width) {
    this.set('width', width || null);
    this.changed();
  }
  /** Get image width
   * @return {number}
   */
  getWidth() {
    if (!this._img.naturalWidth) return 0;
    return this.get('width') || this._img.naturalWidth
  }
  /** Get image height
   * @return {number}
   */
  getHeight() {
    if (!this._img.naturalWidth) return 0;
    if (this.get('width')) {
      return this.get('width') * this._img.naturalHeight / this._img.naturalWidth
    }
    return this._img.naturalHeight || 0
  }
  /** Get Image
   * @returns {Image}
   */
  getImage() {
    return this._img
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
      style: { height: this.getHeight() + 'px' },
      'aria-label': this.get('title')
    });
    ol_ext_element.create('DIV', {
      click: function (e) {
        onclick(true);
        e.stopPropagation();
      },
      style: {
        width: this.getWidth() + 'px',
        height: this.getHeight() + 'px'
      },
      parent: element
    });
    return element;
  }
}

export default ol_legend_Image
