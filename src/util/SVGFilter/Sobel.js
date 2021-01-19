/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_ext_SVGFilter from '../../util/SVGFilter'
import ol_ext_SVGOperation from '../../util/SVGOperation';

/** Apply a sobel filter on an image
 * @constructor
 * @requires ol.filter
 * @extends {ol_ext_SVGFilter}
 * @param {*} options
 *  @param {boolean} options.grayscale get grayscale image, default false,
 *  @param {boolean} options.alpha get alpha channel, default false
 */
var ol_ext_SVGFilter_Sobel = function(options) {
  options = options || {};

  ol_ext_SVGFilter.call(this);

  // Red channel
  this._addColorSobel('red');
  // Green channel
  this._addColorSobel('green');
  // Blue channel
  this._addColorSobel('blue');
  // Combine
  this.addOperation({
    feoperation: 'feComposite',
    operator: 'arithmetic',
    in: 'rededge',
    in2: 'greenedge',
    k2: 1,
    k3: 1
  });
  this.addOperation({
    feoperation: 'feComposite',
    operator: 'arithmetic',
    in2: 'blueedge',
    k2: 1,
    k3: 1,
    result: 'finaledges'
  });
  if (options.grayscale) {
    this.addOperation({
      feoperation: 'feColorMatrix',
      type: 'saturate',
      values: 0
    });
  } else if (options.alpha) {
    this.addOperation({
      feoperation: 'feColorMatrix',
      type: 'luminanceToAlpha'
    });
  }
};
ol_ext_inherits(ol_ext_SVGFilter_Sobel, ol_ext_SVGFilter);

/** Sobel filter on a color
 * @param {ol_ext_SVGFilter} filter
 * @param {string} color color name : red/green/blue
 * @private
 */
ol_ext_SVGFilter_Sobel.prototype._addColorSobel = function(color) {
  var r = (color==='red' ? 1:0);
  var g = (color==='green' ? 1:0);
  var b = (color==='blue' ? 1:0);
  // Color channel
  this.addOperation(new ol_ext_SVGOperation({
    feoperation: 'feColorMatrix',
    in: 'SourceGraphic',
    type: 'matrix',
    values:[
      0, 0, 0, 0, 1,
      0, 0, 0, 0, 1,
      0, 0, 0, 0, 1,
      r, g, b, 0, 0
    ],
    result: color+'Chan'
  }));
  // Horizontal 
  this.addOperation(new ol_ext_SVGOperation({
    feoperation: 'feConvolveMatrix',
    in: color+'Chan',
    order: 3,
    kernelMatrix: [
      -1, -2, -1,
       0,  0,  0,
       1,  2,  1],
    result: color+'Hor'
  }));
  // Vertical
  this.addOperation(new ol_ext_SVGOperation({
    feoperation: 'feConvolveMatrix',
    in: color+'Chan',
    order: 3,
    kernelMatrix: [
      -1,  0,  1,
      -2,  0,  2,
      -1,  0,  1],
    result: color+'Ver'
  }));
  // Combine
  this.addOperation(new ol_ext_SVGOperation({
    feoperation: 'feComposite',
    operator: 'arithmetic',
    k2: 1,
    k3: 1,
    in: color+'Hor',
    in2: color+'Ver'
  }));
  // Edges
  this.addOperation(new ol_ext_SVGOperation({
    feoperation: 'feColorMatrix',
    type: 'matrix',
    values: [
      0, 0, 0, r, 0,
      0, 0, 0, g, 0,
      0, 0, 0, b, 0,
      0, 0, 0, 0, 1
    ],
    result: color+'edge'
  }));
};


export default ol_ext_SVGFilter_Sobel
