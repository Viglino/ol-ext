/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Teleport a feature at a given place
* @param {ol.featureAnimationTeleportOptions} options
*/
ol.featureAnimation.Teleport = function(options)
{	ol.featureAnimation.call(this, options);
}
ol.inherits(ol.featureAnimation.Teleport, ol.featureAnimation);

/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Teleport.prototype.animate = function (e)
{	var sc = this.easing_(e.elapsed);
	if (sc)
	{	e.context.save()
			e.context.globalAlpha = sc;
			e.context.scale(sc,1/sc);
			var m = e.frameState.coordinateToPixelTransform;
			var dx = (1/sc-1) * (m[0]*e.coord[0] + m[1]*e.coord[1] +m[4]);
			var dy = (sc-1) * (m[2]*e.coord[0] + m[3]*e.coord[1] +m[5]);
			e.context.translate(dx,dy);
			this.drawGeom_(e, e.geom);
		e.context.restore()
	}

	return (e.time <= this.duration_);
}
