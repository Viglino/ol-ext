/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_filter_Base from './Base'

/** @typedef {Object} FilterPencilSketchOptions
 * @property {number} blur blur value in pixel, default 8
 * @property {number} value intensity value [0,1], default .8
 */

/** Colorize map or layer
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {FilterPencilSketchOptions} options
 */
var ol_filter_PencilSketch = function(options) {
  options = options || {};
  ol_filter_Base.call(this, options);

  this.set('blur', options.blur || 8);
  this.set('intensity', options.intensity || .8);
};
ol_ext_inherits(ol_filter_PencilSketch, ol_filter_Base);

/** @private 
 */
ol_filter_PencilSketch.prototype.precompose = function(/* e */) {
};

/** @private 
 */
ol_filter_PencilSketch.prototype.postcompose = function(e) {
  // Set back color hue
  var ctx = e.context;
  var canvas = ctx.canvas;
  var w = canvas.width;
  var h = canvas.height;
  
  // Grayscale image
  var bwimg = document.createElement('canvas');
  bwimg.width = w;
  bwimg.height = h;
  var bwctx = bwimg.getContext('2d');
  bwctx.filter = 'invert(1) blur('+this.get('blur')+'px)';
  bwctx.drawImage(canvas, 0,0, w, h);

  ctx.save();
    ctx.filter = 'grayscale(1)';
    ctx.drawImage(canvas, 0,0, w, h);
    ctx.filter = '';
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.globalAlpha = this.get('intensity');
    ctx.drawImage(bwimg, 0,0);
  ctx.restore();
};

export default ol_filter_PencilSketch
