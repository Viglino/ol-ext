/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Shakee animation: 
* @param {ol.featureAnimationShakeOptions} options
*	- bounce {Integer} default 6
*	- amplitude {Integer} default 40
*	- duration {Integer} default 
*	- horizontal {bool} shake horizontally default false
*/
ol.featureAnimation.Shake = function(options)
{	options = options || {};
	ol.featureAnimation.call(this, options);
//	this.easing_ = options.easing_ || function(t){return (0.5+t)*t -0.5*t ;};
	this.amplitude_ = options.amplitude || 40;
	this.bounce_ = -Math.PI*(options.bounce || 6);
	this.horizontal_ = options.horizontal;
}
ol.inherits(ol.featureAnimation.Shake, ol.featureAnimation);

/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Shake.prototype.animate = function (e)
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
