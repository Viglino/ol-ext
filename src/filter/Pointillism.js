/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {asString as ol_color_asString} from 'ol/color.js'
import ol_filter_Base from './Base.js'

/** @typedef {Object} FilterPointillismOptions
 * @property {number} saturate saturation, default 2
 */

/** A pointillism filter to turn maps into pointillism paintings
 * @constructor
 * @extends {ol_filter_Base}
 * @param {FilterPointillismOptions} options
 */
var ol_filter_Pointillism = class olfilterPointillism extends ol_filter_Base {
  constructor(options) {
    options = options || {};
    super(options);

    this.set('saturate', Number(options.saturate) || 2);

    this.pixels = [];
  }
  /** Create points to place on the map
   * @private
   */
  _getPixels(nb) {
    if (nb > this.pixels.length) {
      while (this.pixels.length < nb) {
        this.pixels.push([Math.random(), Math.random(), Math.random() * 4 + 2]);
      }
    }
    return nb;
  }
  /** @private
   */
  precompose( /* e */) {
  }
  /** @private
   */
  postcompose(e) {
    // var ratio = e.frameState.pixelRatio;
    // Set back color hue
    var ctx = e.context;
    var canvas = ctx.canvas;
    var w = canvas.width;
    var h = canvas.height;

    // Grayscale image
    var img = document.createElement('canvas');
    img.width = w;
    img.height = h;
    var ictx = img.getContext('2d');
    ictx.filter = 'saturate(' + Math.round(2 * this.get('saturate') * 100) + '%)';
    ictx.drawImage(canvas, 0, 0);

    ctx.save();
    // Saturate and blur
    ctx.filter = 'blur(3px) saturate(' + (this.get('saturate') * 100) + '%)';
    ctx.drawImage(canvas, 0, 0);
    // ctx.clearRect(0,0,w,h); // debug
    // Draw points
    ctx.filter = 'none';
    ctx.opacity = .5;
    var max = this._getPixels(w * h / 50);
    for (var i = 0; i < max; i++) {
      var x = Math.floor(this.pixels[i][0] * w);
      var y = Math.floor(this.pixels[i][1] * h);
      ctx.fillStyle = ol_color_asString(ictx.getImageData(x, y, 1, 1).data);
      ctx.beginPath();
      ctx.arc(x, y, this.pixels[i][2], 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }
}

export default ol_filter_Pointillism
