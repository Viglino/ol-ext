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
var ol_filter_Crop = function(options) {
  options = options || {};
  ol_filter_Mask.call(this, options);
}
ol_ext_inherits(ol_filter_Crop, ol_filter_Mask);

ol_filter_Crop.prototype.precompose = function(e) {
  if (this.feature_) {
    var ctx = e.context;
    ctx.save();
      this.drawFeaturePath_(e, this.get("inner"));
      ctx.clip("evenodd");
  }
}

ol_filter_Crop.prototype.postcompose = function(e) {
  if (this.feature_) e.context.restore();
}

export default ol_filter_Crop
