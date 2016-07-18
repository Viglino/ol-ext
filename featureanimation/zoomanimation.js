/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Fade animation: feature zoom in
* @param {ol.featureAnimationZoomOptions} options
*/
ol.featureAnimation.Zoom = function(options)
{	ol.featureAnimation.call(this, options);
}
ol.inherits(ol.featureAnimation.Zoom, ol.featureAnimation);

/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Zoom.prototype.animate = function (e)
{	var sc = this.easing_(e.elapsed);
	if (sc)
	{	e.context.save()
			//e.context.globalAlpha = this.easing_(e.elapsed);
			e.context.scale(sc,sc);
			var m = e.frameState.coordinateToPixelTransform;
			var dx = (1/sc-1) * (m[0]*e.coord[0] + m[1]*e.coord[1] +m[4]);
			var dy = (1/sc-1) * (m[2]*e.coord[0] + m[3]*e.coord[1] +m[5]);
			e.context.translate(dx,dy);
			this.drawGeom_(e, e.geom);
		e.context.restore()
	}

	return (e.time <= this.duration_);
}
