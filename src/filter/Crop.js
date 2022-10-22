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
 *  @param {number} [options.shadowWidth=0] shadow width, default no shadow
 *  @param {boolean} [options.shadowMapUnits=false] true if the shadow width is in mapUnits
 *  @param {ol.colorLike} [options.shadowColor='rgba(0,0,0,.5)'] shadow color, default 
 *  @param {boolean} [options.inner=false] mask inner, default false
 *  @param {boolean} [options.wrapX=false] wrap around the world, default false
 */
var ol_filter_Crop = class olfilterCrop extends ol_filter_Mask {
  constructor(options) {
    options = options || {};
    super(options);
  }
  /**
   * @param {ol/Event} e 
   * @private
   */
  precompose(e) {
    if (this.feature_) {
      var ctx = e.context;
      ctx.save();
      this.drawFeaturePath_(e, this.get('inner'));
      ctx.clip('evenodd');
    }
  }
  /**
   * @param {ol/Event} e 
   * @private
   */
  postcompose(e) {
    if (this.feature_) {
      var ctx = e.context;
      ctx.restore();
      // Draw shadow
      if (this.get('shadowWidth')) {
        ctx.save()
        var width = this.get('shadowWidth') * e.frameState.pixelRatio
        if (this.get('shadowMapUnits')) width /= e.frameState.viewState.resolution;
        this.drawFeaturePath_(e, !this.get('inner'));
        ctx.clip('evenodd');
        ctx.filter = 'blur(' + width + 'px)';
        ctx.strokeStyle = this._shadowColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.restore()
      }
    }
  }
}

export default ol_filter_Crop
