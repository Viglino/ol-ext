/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Pulse a point on postcompose
*	@param {ol.coordinates} point to pulse
*	@param {ol.pulse.options} pulse options param
*		- projection {ol.projection||String} projection of coords
*		- duration {Number} animation duration in ms, default 3000
*		- radius {Number} radius of the circle (in px), default 30
*		- amplitude {Number} movement amplitude (in px), default 0
*		- easing {ol.easing} easing function, default ol.easing.easeOut
*		- width {Number} line width, default 2
*		- color {ol.color} line color, default red
*/
ol.Map.prototype.pulse = function(coords, options)
{	var listenerKey;
	options = options || {};

	// Change to map's projection
	if (options.projection)
	{	coords = ol.proj.transform(coords, options.projection, this.getView().getProjection());
	}
	
	// options
	var start = new Date().getTime();
	var duration = options.duration || 3000;
	var maxRadius = options.radius || 30;
	if (maxRadius<0) maxRadius = 5;
	var minRadius = maxRadius - (options.amplitude || maxRadius); //options.minRadius || 0;
	var easing = options.easing || ol.easing.easeOut;
	var width = options.lineWidth || 2;
	var color = options.color || 'red';

	// Animate function
	function animate(event) 
	{	var frameState = event.frameState;
		var ratio = frameState.pixelRatio;
		var elapsed = frameState.time - start;
		if (elapsed > duration) ol.Observable.unByKey(listenerKey);
		else
		{	var elapsedRatio = elapsed / duration;
			var p = this.getPixelFromCoordinate(coords);
			var context = event.context;
			context.save();
			context.scale(ratio,ratio);
			context.beginPath();
			var e = easing(elapsedRatio)
			var r =  (1-e) * minRadius + e * maxRadius;
			context.arc(p[0], p[1], (r>0?r:0), 0, 2 * Math.PI, false);
			context.globalAlpha = easing(1 - elapsedRatio);
			context.lineWidth = width;
			context.strokeStyle = color;
			context.stroke();
			context.restore();
			// tell OL3 to continue postcompose animation
			frameState.animate = true;
		}
	}

	// Launch animation
	listenerKey = this.on('postcompose', animate, this);
	this.renderSync();
}

