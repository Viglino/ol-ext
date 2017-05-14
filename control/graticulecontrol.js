/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/**
 * Draw a graticule on the map.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} Control options. 
 *	- maxResolution {number} max resolution to display the graticule
 *	- strokeStyle {ol.style.Stroke} The stroke style to use for drawing the graticule, default black.
 *	- step {number} 
 *	- delta {number} , default 40px 
 *	- projection {ol.projectionLike} projection to use for the graticule, default EPSG:4326 
 */
ol.control.Graticule = function(options) 
{	var self = this;
	if (!options) options = {};
	
	// Initialize parent
	var elt = document.createElement("div");
	elt.className = "ol-graticule ol-unselectable ol-hidden";
	
	ol.control.Control.call(this, { element: elt });

	this.set('projection', options.projection || 'EPSG:4326');
	this.set('projection', options.projection || 'EPSG:2154');
//	this.set('projection', options.projection || 'EPSG:27700');

	var p = new ol.proj.Projection({code:this.get('projection')});

	this.set('maxResolution', options.maxResolution);
	this.set('step', options.step || 1);
	this.set('delta', options.delta || 40);

};
ol.inherits(ol.control.Graticule, ol.control.Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.Graticule.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (oldmap) oldmap.un('postcompose', this.drawGraticule_, this);
	
	ol.control.Control.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Get change (new layer added or removed)
	if (map) map.on('postcompose', this.drawGraticule_, this);
};

ol.control.Graticule.prototype.drawGraticule_ = function (e)
{
	var ctx = e.context;
	var canvas = ctx.canvas;
	var ratio = e.frameState.pixelRatio;
	var w = canvas.width/ratio;
	var h = canvas.height/ratio;

	var proj = this.get('projection');

	var map = this.getMap();
	var bbox = 
	[	map.getCoordinateFromPixel([0,0]),
		map.getCoordinateFromPixel([w,0]),
		map.getCoordinateFromPixel([w,h]),
		map.getCoordinateFromPixel([0,h])
	];
	var xmax = -Infinity;
	var xmin = Infinity;
	var ymax = -Infinity;
	var ymin = Infinity;
	for (var i=0, c; c=bbox[i]; i++)
	{	bbox[i] = ol.proj.transform (c, map.getView().getProjection(), proj);
		xmax = Math.max (xmax, bbox[i][0]);
		xmin = Math.min (xmin, bbox[i][0]);
		ymax = Math.max (ymax, bbox[i][1]);
		ymin = Math.min (ymin, bbox[i][1]);
	}

	var delta = this.get('delta');
	var step = this.get('step');

	// Limit max line draw
	var ds = (xmax-xmin)/step*delta;
	if (ds>w) 
	{	var dt = Math.round((xmax-xmin)/w*delta /step);
		step *= dt;
	}

	xmin = (Math.floor(xmin/step)-1)*step;
	ymin = (Math.floor(ymin/step)-1)*step;
	xmax = (Math.floor(xmax/step)+2)*step;
	ymax = (Math.floor(ymax/step)+2)*step;

	ctx.save();
		ctx.scale(ratio,ratio);
		ctx.beginPath();

		for (var x=xmin; x<xmax; x += step)
		{	var p0 = ol.proj.transform ([x, ymin], proj, map.getView().getProjection());
			p0 = map.getPixelFromCoordinate(p0);
			ctx.moveTo(p0[0], p0[1]);
			for (var y=ymin+step; y<=ymax; y+=step)
			{	var p1 = ol.proj.transform ([x, y], proj, map.getView().getProjection());
				p1 = map.getPixelFromCoordinate(p1);
				ctx.lineTo(p1[0], p1[1]);
			}
		}
		for (var y=ymin; y<ymax; y += step)
		{	var p0 = ol.proj.transform ([xmin, y], proj, map.getView().getProjection());
			p0 = map.getPixelFromCoordinate(p0);
			ctx.moveTo(p0[0], p0[1]);
			for (var x=xmin+step; x<=xmax; x+=step)
			{	var p1 = ol.proj.transform ([x, y], proj, map.getView().getProjection());
				p1 = map.getPixelFromCoordinate(p1);
				ctx.lineTo(p1[0], p1[1]);
			}
		}
		ctx.stroke();
	ctx.restore();
};
