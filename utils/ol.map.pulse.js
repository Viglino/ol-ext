/*
	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Pulse a point on postcompose
*	@param {ol.coordinates} point to pulse
*	@param {ol.pulse.options} pulse options param
*		- duration {Number} animation duration in ms, default 3000
*		- maxRadius {Number} radius of the circle, default 30
*		- easing {ol.easing} easing function, default ol.easing.easeOut
*		- width {Number} line width, default 2
*		- color {ol.color} line color, default red
*/
ol.Map.prototype.pulse = function(coords, options)
{	var listenerKey;
	options = options || {};
	var start = new Date().getTime();
	var flashGeom = new ol.geom.Point(coords);
	
	var duration = options.duration || 3000;
	var maxRadius = (options.radius || 30) -5;
	var easing = options.easing || ol.easing.easeOut;
	var width = options.lineWidth || 2;
	var color = options.color || 'red';
			
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
			context.arc(p[0], p[1], easing(elapsedRatio) * maxRadius + 5, 0, 2 * Math.PI, false);
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

