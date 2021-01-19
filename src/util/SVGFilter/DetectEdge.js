/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_ext_SVGFilter from '../../util/SVGFilter'

/** A filter to detecte edge on images
 * @constructor
 * @requires ol.filter
 * @extends {ol_ext_SVGFilter}
 * @param {*} options
 *  @param {boolean} options.grayscale get grayscale image, default false,
 *  @param {boolean} options.alpha get alpha channel, default false
 */
var ol_ext_SVGFilter_DetectEdge = function(options) {
  options = options || {};

  ol_ext_SVGFilter.call(this);
  
  this.addOperation({
    feoperation: 'feConvolveMatrix',
    preserveAlpha: true,
    kernelMatrix: [
      -1, -1, -1, 
      -1,  8, -1, 
      -1, -1, -1
    ]
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
  /* enhance * /
    {
      feoperation: 'feComponentTransfer',
      operations: [{
        feoperation: 'feFuncA',
        type: 'gamma', 
        amplitude: 4,
        exponent: 1,
        offset: 0
      }]
    },
  /**/
};
ol_ext_inherits(ol_ext_SVGFilter_DetectEdge, ol_ext_SVGFilter);

export default ol_ext_SVGFilter_DetectEdge
