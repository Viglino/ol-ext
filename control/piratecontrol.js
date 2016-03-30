/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** ol.control.PirateMap adds an old map effect on a canvas renderer. 
* It colors the map, adds a parchment texture and compass onto the map. 
* @param {Object}
*	- hue {ol.Color} color to set hue of the map, default #963
*	- saturation {Number} saturation of the hue color, default 0.6
*	- opacity {Number} opacity of the overimpose image, default 0.7
*/
ol.control.PirateMap = function(options) 
{	options = options || {};
	var self = this;

	this.asset = {};
	this.hue = (options.hue ? ol.color.asString(options.hue) : "#963");
	this.saturation = options.saturation || 0.6;
	this.opacity = options.opacity || 0.7;

	// Get image in css
	this.asset.back = new Image();
	this.asset.back.onload = function(){ if (self.map_) self.map_.renderSync(); }
	var i = $("<img>").addClass("pirate_back").appendTo("body");
	this.asset.back.src = i.css("background-image").replace(/^url\(\"(.*)\"\)$/,"$1");
	i.remove();

	this.asset.compass = new Image();
	this.asset.compass.onload = function(){ if (self.map_) self.map_.renderSync(); }
	var i = $("<img>").addClass("pirate_compass").appendTo("body");
	this.asset.compass.src =  i.css("background-image").replace(/^url\(\"(.*)\"\)$/,"$1");
	i.remove();

	var div = document.createElement('div');
	div.className = "ol-pirate ol-unselectable ol-control";
	ol.control.Control.call(this, 
	{	element: div,
		target: options.target
	});
};

ol.inherits(ol.control.PirateMap, ol.control.Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.PirateMap.prototype.setMap = function (map)
{	ol.control.Control.prototype.setMap.call(this, map);

	if (this.map_) 
	{	this.map_.un('precompose', this.drawMask_, this);
		this.map_.un('postcompose', this.drawPirate_, this);
	}

	if (map) 
	{	map.on('precompose', this.drawMask_, this);
		map.on('postcompose', this.drawPirate_, this);
	}
	this.map_ = map;
};

(function() {

var crop = [[0.023, 0.957], [0, 0.463], [0.007, 0.42], [0.004, 0.397], [0.029, 0.383], [0.013, 0.383], [0.046, 0.367], [0.011, 0.371], [0.004, 0.349], [0.006, 0.297], [0.012, 0.265], [0.007, 0.246], [0.016, 0.191], [0.031, 0.191], [0.019, 0.171], [0.012, 0.1], [0.046, 0.001], [0.071, 0.012], [0.1, 0], [0.186, 0.01], [0.228, 0.008], [0.239, 0.022], [0.25, 0.009], [0.304, 0.002], [0.311, 0.027], [0.313, 0.007], [0.322, 0.064], [0.311, 0.101], [0.329, 0.055], [0.321, 0.018], [0.334, 0.01], [0.496, 0.009], [0.53, 0.019], [0.553, 0.01], [0.615, 0.014], [0.683, 0.03], [0.697, 0.019], [0.728, 0.027], [0.732, 0.066], [0.735, 0.012], [0.752, 0.006], [0.795, 0.014], [0.85, 0.007], [0.929, 0.013], [1, 0.204], [0.994, 0.324], [0.999, 0.393], [0.988, 0.464], [0.947, 0.46], [0.977, 0.47], [0.978, 0.479], [0.99, 0.489], [0.994, 0.572], [0.992, 0.669], [0.982, 0.673], [0.994, 0.689], [1, 0.716], [0.999, 0.81], [0.987, 0.816], [0.996, 0.83], [0.99, 0.894], [0.944, 1], [0.848, 0.993], [0.841, 0.97], [0.837, 0.993], [0.798, 0.981], [0.697, 0.98], [0.653, 0.986], [0.606, 0.981], [0.598, 0.968], [0.598, 0.941], [0.592, 0.982], [0.558, 0.988], [0.507, 0.983], [0.485, 0.988], [0.418, 0.978], [0.4, 0.969], [0.393, 0.98], [0.338, 0.984], [0.304, 0.977], [0.251, 0.984], [0.238, 0.979], [0.252, 0.915], [0.239, 0.969], [0.233, 0.953], [0.23, 0.984], [0.155, 0.971], [0.147, 0.957], [0.142, 0.974], [0.095, 0.976], [0.066, 0.98], [0.023, 0.957]];

ol.control.PirateMap.prototype.drawMask_ = function (event)
{
	var ctx = event.context;
	var canvas = ctx.canvas;
	var w = canvas.width;
	var h = canvas.height;
		
	ctx.save();
/*
		ctx.lineWidth = 5;
		ctx.strokeStyle = "rgba(0,0,0,0.3)";

		ctx.beginPath();
		ctx.moveTo(w*crop[0][0]+2, h*crop[0][1]+2);
		for (var i=1; i<crop.length; i++)
			ctx.lineTo(w*crop[i][0]+2, h*crop[i][1]+2);
		ctx.closePath();
		ctx.stroke();
*/

		ctx.beginPath();
		ctx.moveTo(w*crop[0][0], h*crop[0][1]);
		for (var i=1; i<crop.length; i++)
			ctx.lineTo(w*crop[i][0], h*crop[i][1]);

	ctx.clip();
};

/** Draw on the final canvas
* @private
*/
function drawlines(ctx, cx, cy, m)
{
	ctx.moveTo (cx+m, cy);
	ctx.lineTo(cx-m, cy);
		
	ctx.moveTo (cx, cy+m);
	ctx.lineTo(cx, cy-m);

	ctx.moveTo (cx+m, cy+m);
	ctx.lineTo(cx-m, cy-m);
	ctx.moveTo (cx+m, cy-m);
	ctx.lineTo(cx-m, cy+m);

	ctx.moveTo (cx+m/2, cy-3*m/2);
	ctx.lineTo(cx-m/2, cy+3*m/2);
	ctx.moveTo (cx+m/2, cy+3*m/2);
	ctx.lineTo(cx-m/2, cy-3*m/2);

	ctx.moveTo (cx+3*m/2, cy+m/2);
	ctx.lineTo(cx-3*m/2, cy-m/2);
	ctx.moveTo (cx+3*m/2, cy-m/2);
	ctx.lineTo(cx-3*m/2, cy+m/2);
}

function drawCompass(ctx, compass, cx, cy, rot, sc, m)
{	ctx.save();

		ctx.translate(cx, cy);
		ctx.rotate(rot);
		
		ctx.beginPath();
			drawlines(ctx, 0, 0, m*1.5)
		ctx.stroke();
		
		if (sc)
		{	ctx.globalAlpha = 1;
			ctx.drawImage (compass, -compass.width/2*sc, -compass.height/2*sc, compass.width*sc, compass.height*sc);
		}

	ctx.restore();
}

ol.control.PirateMap.prototype.drawPirate_ = function (event)
{	if (!this.map_) return;
	var ctx = event.context;
	var canvas = ctx.canvas;
	var ratio = event.frameState.pixelRatio;
	var view = this.map_.getView();
	var img = this.asset.back;
	var compass = this.asset.compass;
	
	var m = Math.max(canvas.width, canvas.height);
	var res = view.getResolution()/ratio;
	var rot = view.getRotation();

	// Set back color hue
	ctx.save();
	
		//ctx.scale(ratio, ratio);

		ctx.globalCompositeOperation = "color";
		ctx.fillStyle = this.hue;
		ctx.globalAlpha = this.saturation;
		ctx.fillRect(0,0,canvas.width,canvas.height);  

	ctx.restore();

	// Draw back image
	ctx.save();

		var ext = event.frameState.extent;
		var dx = ext[0]/res;
		var dy = ext[1]/res;
		dx = dx % img.width ;
		dy = img.height - dy % img.height;
		if (dx<0) dx += img.width;
		if (dy<0) dy += img.height;

		ctx.globalCompositeOperation = "multiply";
		ctx.globalAlpha = this.opacity;

		ctx.rotate(rot);

		for (var i=-dx-m; i<m; i+=img.width)
		for (var j=-dy-m; j<m; j+=img.height)
		{	ctx.drawImage(img, i,j);
		}

	ctx.restore();

	// Draw compass
	ctx.save();

		ctx.lineWidth = 1;
		ctx.strokeStyle = this.hue;
		ctx.globalCompositeOperation = "multiply";
		ctx.globalAlpha = this.opacity;

		drawCompass (ctx, compass, canvas.width*0.9, canvas.height*0.9, rot, ratio, m*1.5);
		drawCompass (ctx, compass, compass.width/2 + canvas.width*0.05, canvas.height*0.5, rot, 0.5*ratio, m*1.5);
	
	ctx.restore();

	// Restore clip
	ctx.restore();

/** /
	ctx.save();
	ctx.strokeStyle = "rgba(0,0,0,0.3)";
	ctx.globalCompositeOperation = "multiply";
	ctx.globalAlpha = 0.3;

	var w=canvas.width;
	var h=canvas.height;
	
	for (var lw=3; lw>0; lw--)
	{	
		ctx.beginPath();
		ctx.lineWidth = 4*lw;
		ctx.moveTo(w*crop[0][0]+2, h*crop[0][1]+2);
		for (var i=1; i<crop.length; i++)
			ctx.lineTo(w*crop[i][0]+2, h*crop[i][1]+2);
		ctx.closePath();
		ctx.stroke();
	}
	ctx.restore();
/**/

}
})();
