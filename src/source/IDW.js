/*	Copyright (c) 2021 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
*/
import ol_ext_inherits from '../util/ext'
import ol_source_ImageCanvas from 'ol/source/ImageCanvas'

/** Inverse distance weighting interpolated source - Shepard's method
 * @see https://en.wikipedia.org/wiki/Inverse_distance_weighting
 * @constructor 
 * @extends {ol_source_ImageCanvas}
 * @param {*} [options]
 *  @param {ol.source.vector} options.source a source to interpolate
 *  @param {number} [options.scale=4] scale factor, use large factor to enhance performances (but minor accuracy)
 *  @param {string|function} options.weight The feature attribute to use for the weight or a function that returns a weight from a feature. Weight values should range from 0 to 100. Default use the weight attribute of the feature.
 */
var ol_source_IDW = function(options) {
  options = options || {};

  // Draw image on canvas
  options.canvasFunction = this.calculateImage;

  this._source = options.source;
  this._canvas = document.createElement('CANVAS');
  this._source.on(['addfeature','removefeature','clear','removefeature'], function() {
    this.changed();
  }.bind(this));

  ol_source_ImageCanvas.call (this, options);

  this.set('scale', options.scale || 4);
  this._weight = typeof(options.weight) === 'function' ? options.weight : function(f) { return f.get(options.weight||'weight'); }
};
ol_ext_inherits(ol_source_IDW, ol_source_ImageCanvas);

/** Get the source
 */
ol_source_IDW.prototype.getSource = function() {
  return this._source;
};

/** Convert hue to rgb factor
 * @param {number} h
 * @return {number}
 * @private
 */
ol_source_IDW.prototype.hue2rgb = function(h) {
  h = (h + 6) % 6;
  if (h < 1) return Math.round(h * 255);
  if (h < 3) return 255;
  if (h < 4) return Math.round((4 - h) * 255);
  return 0;
};

/** Get color for a value. Return an array of RGBA values.
 * @param {number} v value
 * @returns {Array<number>} 
 * @api
 */
ol_source_IDW.prototype.getColor = function(v) {
  // Get hue
  var h = 4 - (0.04 * v);
  // Convert to RGB
  return [
    this.hue2rgb(h + 2), 
    this.hue2rgb(h),
    this.hue2rgb(h - 2),
    255
  ]
};

/** Apply the value to the map RGB. Overwrite this function to set your own colors.
 * @param {number} v value
 * @param {Uint8ClampedArray} data RGBA array
 * @param {number} i index in the RGBA array
 * @api
 */
ol_source_IDW.prototype.setData = function(v, data, i) {
  // Get color
  var color = this.getColor(v)
  // Convert to RGB
  data[i] = color[0];
  data[i+1] = color[1];
  data[i+2] = color[2];
  data[i+3] = color[3];
};

/** Get image value at coord (RGBA)
 * @param {l.coordinate} coord
 * @return {Uint8ClampedArray}
 */
ol_source_IDW.prototype.getValue = function(coord) {
  if (!this._canvas) return null
  var pt = this.transform(coord);
  var v = this._canvas.getContext('2d').getImageData(Math.round(pt[0]), Math.round(pt[1]), 1, 1).data;
  return (v);
};

/** Calculate IDW at extent / resolution
 * @param {ol/extent/Extent} extent
 * @param {number} resolution
 * @param {number} pixelRatio
 * @param {ol/size/Size} size
 * @return {HTMLCanvasElement}
 * @private
 */
ol_source_IDW.prototype.calculateImage = function(extent, resolution, pixelRatio, size) {
  if (!this._source) return this._canvas;

  // Calculation canvas at small resolution
  var canvas = document.createElement('CANVAS');
  var width = canvas.width = Math.round(size[0] / (this.get('scale')*pixelRatio));
  var height = canvas.height = Math.round(size[1] / (this.get('scale')*pixelRatio));
  var ctx = canvas.getContext('2d');
  var imageData = ctx.getImageData(0, 0, width, height);

  // Transform coords to pixel / value
  var pts = [];
  var dw = width / (extent[2]-extent[0]);
  var dh = height / (extent[1]-extent[3]);
  var tr = this.transform = function(xy, v) {
    return [
      (xy[0]-extent[0]) * dw,
      (xy[1]-extent[3]) * dh,
      v
    ];
  }
  // Get features / weight
  this._source.getFeatures().forEach(function(f) {
    pts.push(tr(f.getGeometry().getFirstCoordinate(), this._weight(f)));
  }.bind(this));

  // Compute image
  var x, y;
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      var t = 0, b = 0;
      for(var i = 0; i < pts.length; ++i) {
        var dx = x -  pts[i][0];
        var dy = y -  pts[i][1];
        var d = dx*dx + dy*dy;

        // Inverse distance weighting - Shepard's method
        if (d === 0) {
          b = 1; 
          t = pts[i][2];
          break;
        }
        var inv = 1 / (d*d);
        t += inv * pts[i][2];
        b += inv;
      }
      this.setData(t/b, imageData.data, (y*width + x)*4);
    }
  }
  ctx.putImageData(imageData, 0, 0);

  /* DEBUG : Draw points * /
  pts.forEach(function(p) {
    ctx.fillRect(p[0], p[1], 1, 1);
  });
  /**/

  // Draw full resolution canvas
  this._canvas.width = Math.round(size[0]);
  this._canvas.height = Math.round(size[1]);
  this._canvas.getContext('2d').drawImage(canvas, 0, 0, size[0], size[1]);

  return this._canvas;
}

export default ol_source_IDW
