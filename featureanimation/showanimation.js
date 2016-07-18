/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Show an object for a given duration
*	@param {ol.featureAnimationShowOptions} options
*/
ol.featureAnimation.Show = function(options)
{	ol.featureAnimation.call(this, options);
}
ol.inherits(ol.featureAnimation.Show, ol.featureAnimation);

/** Animate: just show the object during the laps time
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Show.prototype.animate = function (e)
{	
	this.drawGeom_(e, e.geom);
	return (e.time <= this.duration_);
}
