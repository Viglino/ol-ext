/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Slice animation: feature enter from left
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationThrowOptions} options
 *  @param {left|right} options.side side of the animation, default left
 */
var ol_featureAnimation_Throw = function(options)
{	options = options || {};
	ol_featureAnimation.call(this, options);
	this.speed_ = options.speed || 0;
	this.side_ = options.side || 'left';
}
ol_ext_inherits(ol_featureAnimation_Throw, ol_featureAnimation);

/** Animate
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_Throw.prototype.animate = function (e)
{	// First time > calculate duration / speed
	if (!e.time && this.speed_) 
	{	var dx, dy;
		if (this.side_=='left')
		{	dx = this.dx = e.extent[0]-e.bbox[2];
			dy = this.dy = e.extent[3]-e.bbox[1];
		}
		else
		{	dx = this.dx = e.extent[2]-e.bbox[0];
			dy = this.dy = e.extent[3]-e.bbox[1];
		}
		this.duration_ = Math.sqrt(dx*dx+dy*dy)/this.speed_/e.frameState.viewState.resolution;
	}
	// Animate
	var flashGeom = e.geom.clone();
	var shadow = e.geom.clone();

	flashGeom.translate(this.dx*(1-this.easing_(e.elapsed)), 
		this.dy*Math.cos(Math.PI/2*this.easing_(e.elapsed)));
	shadow.translate(this.dx*(1-this.easing_(e.elapsed)), 0);
	this.drawGeom_(e, flashGeom, shadow);
	
	return (e.time <= this.duration_);
}

export default ol_featureAnimation_Throw
