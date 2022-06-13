/*
  Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL license (http://www.cecill.info/).

*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Blink a feature
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 *  @param {Number} options.nb number of blink, default 10
 */
class ol_featureAnimation_Blink {
  constructor(options) {
    ol_featureAnimation.call(this, options);
    this.set('nb', options.nb || 10);
  }
  /** Animate: Show or hide feature depending on the laptimes
  * @param {ol_featureAnimationEvent} e
  */
  animate(e) {
    if (!(Math.round(this.easing_(e.elapsed) * this.get('nb')) % 2)) {
      this.drawGeom_(e, e.geom);
    }
    return (e.time <= this.duration_);
  }
}
ol_ext_inherits(ol_featureAnimation_Blink, ol_featureAnimation);


export default ol_featureAnimation_Blink
