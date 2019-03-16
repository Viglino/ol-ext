/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Bounce animation: 
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationBounceOptions} options
 *	@param {Integer} options.bounce number of bounce, default 3
 *	@param {Integer} options.amplitude bounce amplitude,default 40
 *	@param {ol.easing} options.easing easing used for decaying amplitude, use function(){return 0} for no decay, default ol.easing.linear
 *	@param {Integer} options.duration duration in ms, default 1000
 */
var ol_featureAnimation_Bounce = function(options)
{	options = options || {};
	ol_featureAnimation.call(this, options);
	this.amplitude_ = options.amplitude || 40;
	this.bounce_ = -Math.PI*(options.bounce || 3);
}
ol_ext_inherits(ol_featureAnimation_Bounce, ol_featureAnimation);

/** Animate
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_Bounce.prototype.animate = function (e)
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

export default ol_featureAnimation_Bounce
