/*
  Copyright (c) 2016 Jean-Marc VIGLINO,
  released under the CeCILL license (http://www.cecill.info/).

*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Show an object for a given duration
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
class ol_featureAnimation_Show {
  constructor(options) {
    ol_featureAnimation.call(this, options);
  }
  /** Animate: just show the object during the laps time
  * @param {ol_featureAnimationEvent} e
  */
  animate(e) {
    this.drawGeom_(e, e.geom);
    return (e.time <= this.duration_);
  }
}
ol_ext_inherits(ol_featureAnimation_Show, ol_featureAnimation);


export default ol_featureAnimation_Show
