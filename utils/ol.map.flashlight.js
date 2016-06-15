/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Show a light on postcompose
*	@param {ol.flashlight.options} flashlight options param
*		- color {ol.Color} light color, default transparent
*		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
*		- radius {number} radius of the flash
*/
(function(){

// prevent multiple add
var onmouse, oncompose = null;
var pos = false;

ol.Map.prototype.flashlight = function(options)
{	// Remove previous effect
	if (oncompose)
	{	var map = oncompose.target;
		ol.Observable.unByKey(oncompose); 
		ol.Observable.unByKey(onmouse);
		oncompose = null;
		map.render(); 
	}
	// Stop animation
	if (options===false) return;
	
	// Default options
	options = options||{};
	
	var r = (options.radius||100);

	// Backcolor
	var color = (options.fill ? options.fill : [0,0,0,0.8]);
	var c = ol.color.asArray(color);
	var startColor = ol.color.asString(c);
	// Halo color
	var endColor;
	if (options.color)
	{	c = endColor = ol.color.asString(ol.color.asArray(options.color)||options.color);
	}
	else 
	{	c[3] = 0
		endColor = ol.color.asString(c);
	}
	c[3] = 0.1;
	var midColor = ol.color.asString(c);

	// For render on move
	onmouse = this.on(['pointermove', 'click'], function(e) 
	{	pos = e.pixel;
		this.renderSync();
	}, this);
	
	// Show flash on postcompose
	oncompose = this.on('postcompose', function(e)
	{	var ctx = e.context;
		var ratio = e.frameState.pixelRatio;
		var w = ctx.canvas.width;
		var h = ctx.canvas.height;
		ctx.save();
		ctx.scale(ratio,ratio);
		
		if (!pos) 
		{	ctx.fillStyle = startColor;
			ctx.fillRect( 0,0,w,h );
		}
		else
		{	var d = Math.max(w, h);
			// reveal wherever we drag
			var radGrd = ctx.createRadialGradient( pos[0], pos[1], w*r/d, pos[0], pos[1], h*r/d );
			radGrd.addColorStop(   0, startColor );
			radGrd.addColorStop( 0.8, midColor );
			radGrd.addColorStop(   1, endColor );
			ctx.fillStyle = radGrd;
			ctx.fillRect( pos[0] - d, pos[1] - d, 2*d, 2*d );
		}
		ctx.restore();
	}, this);
	// Force refresh
	this.renderSync();

	return;
};

})();