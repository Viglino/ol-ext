/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/
/** Slice animation: feature enter from left
* @param {ol.featureAnimationSlideOptions} options
*/
ol.featureAnimation.Slide = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
	this.side_ = options.side || 'left';
}
ol.inherits(ol.featureAnimation.Slide, ol.featureAnimation);

/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Slide.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time) 
	{	if (this.side_=='left') this.dx = (e.extent[0]-e.bbox[2])
		else this.dx = (e.extent[2]-e.bbox[0])
		if (this.speed_) this.duration_ = Math.abs(this.dx)/this.speed_/e.frameState.viewState.resolution;
	}
	// Animate
	var flashGeom = e.geom.clone();
	flashGeom.translate(this.dx*(1-this.easing_(e.elapsed)), 0);
	this.drawGeom_(e, flashGeom);
	
	return (e.time <= this.duration_);
}
