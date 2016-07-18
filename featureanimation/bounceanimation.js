/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Bounce animation: 
*	@param {ol.featureAnimationBounceOptions} options
*	- bounce {Integer} default 3
*	- amplitude {Integer} default 40
*	- easing {ol.easing} easing used for decaying amplitude, use function(){return 0} for no decay, default ol.easing.linear
*	- duration {Integer} duration in ms, default 1000
*/
ol.featureAnimation.Bounce = function(options)
{	options = options || {};
	ol.featureAnimation.call(this, options);
	this.amplitude_ = options.amplitude || 40;
	this.bounce_ = -Math.PI*(options.bounce || 3);
}
ol.inherits(ol.featureAnimation.Bounce, ol.featureAnimation);

/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Bounce.prototype.animate = function (e)
{	// Animate
	var flashGeom = e.geom.clone();
	
	/*
	var t = this.easing_(e.elapsed)
	t = Math.abs(Math.sin(this.bounce_*t)) * this.amplitude_ * (1-t) * e.frameState.viewState.resolution;
	*/
	var t = Math.abs(Math.sin(this.bounce_*e.elapsed)) * this.amplitude_ * (1-this.easing_(e.elapsed)) * e.frameState.viewState.resolution;
	flashGeom.translate(0, t);
	this.drawGeom_(e, flashGeom, e.geom);
	
	return (e.time <= this.duration_);
}
