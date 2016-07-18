/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Do nothing for a given duration
*	@param {ol.featureAnimationShowOptions} options
*/
ol.featureAnimation.None = function(options)
{	ol.featureAnimation.call(this, options);
}
ol.inherits(ol.featureAnimation.None, ol.featureAnimation);

/** Animate: do nothing during the laps time
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.None.prototype.animate = function (e)
{	
	return (e.time <= this.duration_);
}
