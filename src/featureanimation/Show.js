/*
  Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL license (http://www.cecill.info/).
  
*/

import ol_featureAnimation from './FeatureAnimation.js'

/** Show an object for a given duration
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
var ol_featureAnimation_Show = class olfeatureAnimationShow extends ol_featureAnimation {
  constructor(options) {
    super(options);
  }
  /** Animate: just show the object during the laps time
  * @param {ol_featureAnimationEvent} e
  */
  animate(e) {
    this.drawGeom_(e, e.geom);
    return (e.time <= this.duration_);
  }
}

export default ol_featureAnimation_Show
