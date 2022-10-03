/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_featureAnimation from './FeatureAnimation.js'

/** Do nothing for a given duration
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationShowOptions} options
 * 
 */
var ol_featureAnimation_None = class olfeatureAnimationNone extends ol_featureAnimation {
	constructor(options) {
		super(options);
	}
	/** Animate: do nothing during the laps time
	* @param {ol_featureAnimationEvent} e
	*/
	animate(e) {
		return (e.time <= this.duration_);
	}
}

export default ol_featureAnimation_None
