/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Fade animation: feature fade in
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
var ol_featureAnimation_Fade = function(options)
{	options = options || {};
	this.speed_ = options.speed || 0;
	ol_featureAnimation.call(this, options);
}
ol_ext_inherits(ol_featureAnimation_Fade, ol_featureAnimation);

/** Animate
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_Fade.prototype.animate = function (e)
{	e.context.globalAlpha = this.easing_(e.elapsed);
	this.drawGeom_(e, e.geom);
	
	return (e.time <= this.duration_);
}

export default ol_featureAnimation_Fade
