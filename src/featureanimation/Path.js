/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol from 'ol'
import ol_featureAnimation from './FeatureAnimation'

/** Path animation: feature follow a path
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationPathOptions} options
 *  @param {Number} options.speed speed of the feature, if 0 the duration parameter will be used instead, default 0
 *  @param {ol.geom.LineString|ol.Feature} options.path the path to follow
 */
var ol_featureAnimation_Path = function(options)
{	options = options || {};
	ol_featureAnimation.call(this, options);
	this.speed_ = options.speed || 0;
	this.path_ = options.path;
	if (this.path_ && this.path_.getGeometry) this.path_ = this.path_.getGeometry();
	if (this.path_ && this.path_.getLineString) this.path_ = this.path_.getLineString();
	if (this.path_.getLength)
	{	this.dist_ = this.path_.getLength()
		if (this.path_ && this.path_.getCoordinates) this.path_ = this.path_.getCoordinates();
	}
	else this.dist_ = 0;
	if (this.speed_>0) this.duration_ = this.dist_/this.speed_;
}
ol.inherits(ol_featureAnimation_Path, ol_featureAnimation);

/** Animate
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_Path.prototype.animate = function (e)
{	// First time 
	if (!e.time) 
	{	if (!this.dist_) return false;
	}
	var dmax = this.dist_*this.easing_(e.elapsed);
	var p0, p, dx,dy, dl, d = 0;
	p = this.path_[0];
	// Linear interpol
	for (var i = 1; i<this.path_.length; i++)
	{	p0 = p;
		p = this.path_[i];
		dx = p[0]-p0[0];
		dy = p[1]-p0[1];
		dl = Math.sqrt(dx*dx+dy*dy);
		if (dl && d+dl>=dmax) 
		{	var s = (dmax-d)/dl;
			p = [ p0[0] + (p[0]-p0[0])*s, p0[1] + (p[1]-p0[1])*s];
			break;
		}
		d += dl;
	}
	e.geom.setCoordinates(p);
	// Animate
	this.drawGeom_(e, e.geom);
	
	return (e.time <= this.duration_);
}

export default ol_featureAnimation_Path
