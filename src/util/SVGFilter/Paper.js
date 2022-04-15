/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_ext_SVGFilter from '../SVGFilter'

/** Apply a sobel filter on an image
 * @constructor
 * @requires ol.filter
 * @extends {ol_ext_SVGFilter}
 * @param {object} options
 *  @param {string} [options.id]
 *  @param {number} [options.scale=1]
 *  @param {number} [options.ligth=50] light option. 0: darker, 100: lighter
 */
var ol_ext_SVGFilter_Paper = function(options) {
  options = options || {};
  ol_ext_SVGFilter.call(this, { 
    id: options.id
  });

  this.addOperation({
    feoperation: 'feTurbulence',
    numOctaves: 4,
    seed: 0,
    type: 'fractalNoise',
    baseFrequency: 0.2 / (options.scale || 1)
  });
  this.addOperation({
    feoperation: 'feDiffuseLighting',
    'lighting-color': 'rgb(255,255,255)',
    surfaceScale: 1.5,
    kernelUnitLength: 0.01,
    diffuseConstant: 1.1000000000000001,
    result: 'paper',
    operations: [{
      feoperation: 'feDistantLight',
      elevation: options.light || 50, 
      azimuth: 75
    }]
  });
  this.addOperation({
    feoperation: 'feBlend',
    in: 'SourceGraphic',
    in2: 'paper',
    mode: 'multiply'
  })
};
ol_ext_inherits(ol_ext_SVGFilter_Paper, ol_ext_SVGFilter);

/** Set filter light
 * @param {number} light light option. 0: darker, 100: lighter
 */
ol_ext_SVGFilter_Paper.prototype.setLight = function(light) {
  this.element.querySelector('feDistantLight').setAttribute('elevation', light);
}

export default ol_ext_SVGFilter_Paper
