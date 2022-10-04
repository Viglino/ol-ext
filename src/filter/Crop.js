/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_filter_Mask from './Mask.js'

/** Crop drawing using an ol.Feature
 * @constructor
 * @requires ol.filter
 * @requires ol_filter_Mask
 * @extends {ol_filter_Mask}
 * @param {Object} [options]
 *  @param {ol.Feature} [options.feature] feature to crop with
 *  @param {boolean} [options.inner=false] mask inner, default false
 */
var ol_filter_Crop = class olfilterCrop extends ol_filter_Mask {
  constructor(options) {
    options = options || {};
    super(options);
  }
  precompose(e) {
    if (this.feature_) {
      var ctx = e.context;
      ctx.save();
      this.drawFeaturePath_(e, this.get("inner"));
      ctx.clip("evenodd");
    }
  }
  postcompose(e) {
    if (this.feature_)
      e.context.restore();
  }
}

export default ol_filter_Crop
