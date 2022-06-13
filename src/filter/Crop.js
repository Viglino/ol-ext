/*	Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import ol_filter_Mask from './Mask'

/** Crop drawing using an ol.Feature
* @constructor
* @requires ol.filter
* @requires ol_filter_Mask
* @extends {ol_filter_Mask}
* @param {Object} [options]
*  @param {ol.Feature} [options.feature] feature to crop with
*  @param {boolean} [options.inner=false] mask inner, default false
*/
class ol_filter_Crop {
  constructor(options) {
    options = options || {};
    ol_filter_Mask.call(this, options);
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
ol_ext_inherits(ol_filter_Crop, ol_filter_Mask);



export default ol_filter_Crop
