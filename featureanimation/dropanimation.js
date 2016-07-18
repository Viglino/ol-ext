/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Drop animation: drop a feature on the map
* @param {ol.featureAnimationDropOptions} options
*/
ol.featureAnimation.Drop = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol.featureAnimation.call(this, options);
	this.side_ = options.side || 'top';
}
ol.inherits(ol.featureAnimation.Drop, ol.featureAnimation);

/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Drop.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time) 
	{	if (this.side_=='top') this.dy = e.extent[3]-e.bbox[1];
		else this.dy = e.extent[1]-e.bbox[3];
		if (this.speed_) this.duration_ = Math.abs(this.dy)/this.speed_/e.frameState.viewState.resolution;
	}
	// Animate
	var flashGeom = e.geom.clone();
	flashGeom.translate(0,  this.dy*(1-this.easing_(e.elapsed)));
	this.drawGeom_(e, flashGeom, e.geom);
	
	return (e.time <= this.duration_);
}
