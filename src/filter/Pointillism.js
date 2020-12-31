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
 * Original idea: https://www.freecodecamp.org/news/sketchify-turn-any-image-into-a-pencil-sketch-with-10-lines-of-code-cf67fa4f68ce/
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @param {FilterPencilSketchOptions} options
 */
var ol_filter_Pointillism = function(options) {
  options = options || {};
  ol_filter_Base.call(this, options);

  this.set('blur', options.blur || 8);
  this.set('intensity', options.intensity || .8);

  this.pixels = [];
  for (var i=0; i<1000000; i++) {
    this.pixels.push([Math.random(), Math.random(), Math.random()*4+2]);
  }
};
ol_ext_inherits(ol_filter_Pointillism, ol_filter_Base);

/** @private 
 */
ol_filter_Pointillism.prototype.precompose = function(/* e */) {
};

/** @private 
 */
ol_filter_Pointillism.prototype.postcompose = function(e) {
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
  ictx.filter = 'saturate(400%)';
  ictx.drawImage(canvas, 0,0, w, h);

  ctx.save();
    ctx.filter = 'blur(3px) saturate(200%)';
    ctx.drawImage(canvas, 0,0);
    //ctx.clearRect(0,0,w,h)
    ctx.filter = 'none';
    for (var i=0; i<w*h/50 && i<1000000; i++) {
      var x = Math.floor(this.pixels[i][0]*w);
      var y = Math.floor(this.pixels[i][1]*h);
      var px = ictx.getImageData(x, y, 1, 1).data;
      ctx.fillStyle = ol.color.asString(px);
      ctx.opacity = .5;
      ctx.beginPath();
      ctx.arc(x,y,this.pixels[i][2],0, 2*Math.PI);
      ctx.fill();
    }
  ctx.restore();
};

export default ol_filter_Pointillism
