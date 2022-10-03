/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_featureAnimation from './FeatureAnimation.js'

/** Fade animation: feature fade in
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
var ol_featureAnimation_Fade = class olfeatureAnimationFade extends ol_featureAnimation {
	constructor(options) {
		options = options || {};
		super(options);
		this.speed_ = options.speed || 0;
	}
	/** Animate
	* @param {ol_featureAnimationEvent} e
	*/
	animate(e) {
		e.context.globalAlpha = this.easing_(e.elapsed);
		this.drawGeom_(e, e.geom);

		return (e.time <= this.duration_);
	}
}

export default ol_featureAnimation_Fade
