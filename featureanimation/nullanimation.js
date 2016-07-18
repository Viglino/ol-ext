/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Do nothing 
*	@param {ol.featureAnimationShowOptions} options
*/
ol.featureAnimation.Null = function(options)
{	ol.featureAnimation.call(this, { duration:0 });
}
ol.inherits(ol.featureAnimation.Null, ol.featureAnimation);
