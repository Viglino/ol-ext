/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_filter_Base from './Base.js'

/** @typedef {Object} CanvasFilterOptions
 * @property {url} url Takes an IRI pointing to an SVG filter element
 * @property {number} blur Gaussian blur value in px
 * @property {number} brightness linear multiplier to the drawing, under 100: darkens the image, over 100 brightens it
 * @property {number} contrast Adjusts the contrast, under 0: black, 100 no change
 * @property {ol.pixel} shadow Applies a drop shadow effect, pixel offset
 * @property {number} shadowBlur Blur radius
 * @property {number} shadowColor 
 * @property {number} grayscale 0: unchanged, 100: completely grayscale
 * @property {number} hueRotate Hue rotation angle in deg
 * @property {number} invert Inverts the drawing, 0: unchanged, 100: invert
 * @property {number} saturate Saturates the drawing, 0: unsaturated, 100: unchanged
 * @property {number} sepia Converts the drawing to sepia, 0: sepia, 100: unchanged
 */

/** Add a canvas Context2D filter to a layer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {CanvasFilterOptions} options
 */
var ol_filter_CanvasFilter = class olfilterCanvasFilter extends ol_filter_Base {
  constructor(options) {
    super(options);

    this._svg = {};
  }
  /** Add a new svg filter
   * @param {string|ol.ext.SVGFilter} url IRI pointing to an SVG filter element
   */
  addSVGFilter(url) {
    if (url.getId) url = '#' + url.getId();
    this._svg[url] = 1;
    this.dispatchEvent({ type: 'propertychange', key: 'svg', oldValue: this._svg });
  }
  /** Remove a svg filter
   * @param {string|ol.ext.SVGFilter} url IRI pointing to an SVG filter element
   */
  removeSVGFilter(url) {
    if (url.getId) url = '#' + url.getId();
    delete this._svg[url];
    this.dispatchEvent({ type: 'propertychange', key: 'svg', oldValue: this._svg });
  }
  /**
   * @private
   */
  precompose() {
  }
  /**
   * @private
   */
  postcompose(e) {
    var filter = [];
    // Set filters
    if (this.get('url') !== undefined) filter.push('url(' + this.get('url') + ')');
    for (var f in this._svg) {
      filter.push('url(' + f + ')');
    }
    if (this.get('blur') !== undefined)
      filter.push('blur(' + this.get('blur') + 'px)');
    if (this.get('brightness') !== undefined)
      filter.push('brightness(' + this.get('brightness') + '%)');
    if (this.get('contrast') !== undefined)
      filter.push('contrast(' + this.get('contrast') + '%)');
    if (this.get('shadow') !== undefined) {
      filter.push('drop-shadow('
        + this.get('shadow')[0] + 'px '
        + this.get('shadow')[1] + 'px '
        + (this.get('shadowBlur') || 0) + 'px '
        + this.get('shadowColor') + ')');
    }
    if (this.get('grayscale') !== undefined)
      filter.push('grayscale(' + this.get('grayscale') + '%)');
    if (this.get('sepia') !== undefined)
      filter.push('sepia(' + this.get('sepia') + '%)');
    if (this.get('hueRotate') !== undefined)
      filter.push('hue-rotate(' + this.get('hueRotate') + 'deg)');
    if (this.get('invert') !== undefined)
      filter.push('invert(' + this.get('invert') + '%)');
    if (this.get('saturate') !== undefined)
      filter.push('saturate(' + this.get('saturate') + '%)');
    filter = filter.join(' ');
    // Apply filter
    if (filter) {
      e.context.save();
      e.context.filter = filter;
      e.context.drawImage(e.context.canvas, 0, 0);
      e.context.restore();
    }
  }
}

export default ol_filter_CanvasFilter
