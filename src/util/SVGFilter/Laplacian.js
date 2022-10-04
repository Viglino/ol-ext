/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_SVGFilter from '../../util/SVGFilter.js'

/** A simple filter to detect edges on images
 * @constructor
 * @requires ol.filter
 * @extends {ol_ext_SVGFilter}
 * @param {*} options
 *  @param {number} options.neighbours nb of neighbour (4 or 8), default 8
 *  @param {boolean} options.grayscale get grayscale image, default false,
 *  @param {boolean} options.alpha get alpha channel, default false
 */
var ol_ext_SVGFilter_Laplacian = class olextSVGFilterLaplacian extends ol_ext_SVGFilter {
  constructor(options) {
    options = options || {};
    super({ id: options.id });
    
    var operation = {
      feoperation: 'feConvolveMatrix',
      in: 'SourceGraphic',
      preserveAlpha: true,
      result: 'C1'
    };
    if (options.neighbours===4) {
      operation.kernelMatrix = [
        0, -1,  0, 
        -1,  4, -1, 
        0, -1,  0
      ];
    } else {
      operation.kernelMatrix = [
        -1, -1, -1, 
        -1,  8, -1, 
        -1, -1, -1
      ];
    }
    this.addOperation(operation);
    if (options.grayscale) this.grayscale();
    else if (options.alpha) this.luminanceToAlpha({ gamma: options.gamma });
  }
};

export default ol_ext_SVGFilter_Laplacian
