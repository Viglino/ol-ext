/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'
import ol_ext_SVGFilter_Paper from '../util/SVGFilter/Paper'

/** @typedef {Object} FilterPointillismOptions
 * @property {number} saturate saturation, default 2
 */

/** A pointillism filter to turn maps into pointillism paintings
 * @constructor
 * @extends {ol_filter_Base}
 * @param {object} options
 *  @param {boolean} [options.active]
 *  @param {number} [options.scale=1]
 */
class ol_filter_Paper {
  constructor(options) {
    options = options || {};
    ol_filter_Base.call(this, options);
    this._svgfilter = new ol_ext_SVGFilter_Paper(options);
  }
  /** @private
   */
  precompose( /* e */) {
  }
  /** @private
   */
  postcompose(e) {
    // var ratio = e.frameState.pixelRatio;
    var ctx = e.context;
    var canvas = ctx.canvas;

    ctx.save();
    ctx.filter = 'url(#' + this._svgfilter.getId() + ')';
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  /** Set filter light
   * @param {number} light light option. 0: darker, 100: lighter
   */
  setLight(light) {
    this._svgfilter.setLight(light);
  }
}
ol_ext_inherits(ol_filter_Paper, ol_filter_Base);




export default ol_filter_Paper
