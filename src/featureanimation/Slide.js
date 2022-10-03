/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_featureAnimation from './FeatureAnimation.js'

/** Slice animation: feature enter from left
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationSlideOptions} options
 *  @param {Number} options.speed speed of the animation, if 0 the duration parameter will be used instead, default 0
 */
var ol_featureAnimation_Slide = class olfeatureAnimationSlide extends ol_featureAnimation {
	constructor(options) {
		options = options || {};
		super(options);
		this.speed_ = options.speed || 0;
		this.side_ = options.side || 'left';
	}
	/** Animate
	* @param {ol_featureAnimationEvent} e
	*/
	animate(e) {
		if (!e.time) {
			if (this.side_ == 'left')
				this.dx = (e.extent[0] - e.bbox[2]);
			else
				this.dx = (e.extent[2] - e.bbox[0]);
			if (this.speed_)
				this.duration_ = Math.abs(this.dx) / this.speed_ / e.frameState.viewState.resolution;
		}
		// Animate
		var flashGeom = e.geom.clone();
		flashGeom.translate(this.dx * (1 - this.easing_(e.elapsed)), 0);
		this.drawGeom_(e, flashGeom);

		return (e.time <= this.duration_);
	}
}

export default ol_featureAnimation_Slide
