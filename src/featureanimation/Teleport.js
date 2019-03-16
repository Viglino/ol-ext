/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

import ol_ext_inherits from '../util/ext'
import ol_featureAnimation from './FeatureAnimation'

/** Teleport a feature at a given place
 * @constructor
 * @extends {ol_featureAnimation}
 * @param {ol_featureAnimationOptions} options
 */
var ol_featureAnimation_Teleport = function(options)
{	ol_featureAnimation.call(this, options);
}
ol_ext_inherits(ol_featureAnimation_Teleport, ol_featureAnimation);

/** Animate
* @param {ol_featureAnimationEvent} e
*/
ol_featureAnimation_Teleport.prototype.animate = function (e)
{	var sc = this.easing_(e.elapsed);
	if (sc)
	{	e.context.save()
			var ratio = e.frameState.pixelRatio;
			e.context.globalAlpha = sc;
			e.context.scale(sc,1/sc);
			var m = e.frameState.coordinateToPixelTransform;
			var dx = (1/sc-1) * ratio * (m[0]*e.coord[0] + m[1]*e.coord[1] +m[4]);
			var dy = (sc-1) * ratio * (m[2]*e.coord[0] + m[3]*e.coord[1] +m[5]);
			e.context.translate(dx,dy);
			this.drawGeom_(e, e.geom);
		e.context.restore()
	}

	return (e.time <= this.duration_);
}

export default ol_featureAnimation_Teleport
