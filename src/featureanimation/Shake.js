/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Shakee animation: 
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationShakeOptions} options
 *	@param {Integer} options.bounce number o bounds, default 6
 *	@param {Integer} options.amplitude amplitude of the animation, default 40
 *	@param {bool} options.horizontal shake horizontally default false (vertical)
 */
var ol_featureAnimation_Shake = function(options)
{	options = options || {};
	ol_featureAnimation.call(this, options);
//	this.easing_ = options.easing_ || function(t){return (0.5+t)*t -0.5*t ;};
	this.amplitude_ = options.amplitude || 40;
	this.bounce_ = -Math.PI*(options.bounce || 6);
	this.horizontal_ = options.horizontal;
}
ol_ext_inherits(ol_featureAnimation_Shake, ol_featureAnimation);

/** Animate
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_Shake.prototype.animate = function (e)
{	// Animate
	var flashGeom = e.geom.clone();
	var shadow = e.geom.clone();

	var t = this.easing_(e.elapsed)
	t = Math.sin(this.bounce_*t) * this.amplitude_ * (1-t) * e.frameState.viewState.resolution;
	if (this.horizontal_) 
	{	flashGeom.translate(t, 0);
		shadow.translate(t, 0);
	}
	else flashGeom.translate(0, t);
	this.drawGeom_(e, flashGeom, shadow);
	
	return (e.time <= this.duration_);
}

export default ol_featureAnimation_Shake
