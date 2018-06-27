/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_Observable from 'ol/Observable'
import ol_control_Control from 'ol/control/control'
import ol_proj_Projection from 'ol/proj/projection'
import ol_style_Style from 'ol/style/style'
import ol_style_Stroke from 'ol/style/stroke'
import ol_style_Fill from 'ol/style/fill'
import ol_style_Text from 'ol/style/text'
import ol_proj from 'ol/proj'

/**
 * Draw a graticule on the map.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} _ol_control_ options.
 *	- projection {ol.projectionLike} projection to use for the graticule, default EPSG:4326 
 *	- maxResolution {number} max resolution to display the graticule
 *	- style {ol_style_Style} Style to use for drawing the graticule, default black.
 *	- step {number} step beetween lines (in proj units), default 1
 *	- stepCoord {number} show a coord every stepCoord, default 1
 *	- spacing {number} spacing beetween lines (in px), default 40px 
 *	- borderWidth {number} width of the border (in px), default 5px 
 *	- margin {number} margin of the border (in px), default 0px 
 */
var ol_control_Graticule = function(options)
{	var self = this;
	if (!options) options = {};
	
	// Initialize parent
	var elt = document.createElement("div");
	elt.className = "ol-graticule ol-unselectable ol-hidden";
	
	ol_control_Control.call(this, { element: elt });

	this.set('projection', options.projection || 'EPSG:4326');

	// Use to limit calculation 
	var p = new ol_proj_Projection({code:this.get('projection')});
	var m = p.getMetersPerUnit();
	this.fac = 1;
	while (m/this.fac>10)
	{	this.fac *= 10;
	}
	this.fac = 10000/this.fac;

	this.set('maxResolution', options.maxResolution || Infinity);
	this.set('step', options.step || 0.1);
	this.set('stepCoord', options.stepCoord || 1);
	this.set('spacing', options.spacing || 40);
	this.set('margin', options.margin || 0);
	this.set('borderWidth', options.borderWidth || 5);
	this.set('stroke', options.stroke!==false);
	this.formatCoord = options.formatCoord || function(c){return c;};

	if (options.style instanceof ol_style_Style) this.style = options.style;
	else this.style = new ol_style_Style(
		{	stroke: new ol_style_Stroke({ color:"#000", width:1 }),
			fill: new ol_style_Fill({ color: "#fff" }),
			text: new ol_style_Text(
			{	stroke: new ol_style_Stroke({ color:"#fff", width:2 }),
				fill: new ol_style_Fill({ color:"#000" }),
			}) 
		});
};
ol.inherits(ol_control_Graticule, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_control_Graticule.prototype.setMap = function (map) {
	var oldmap = this.getMap();
	if (this._listener) ol_Observable.unByKey(this._listener);
	this._listener = null;
	
	ol_control_Control.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Get change (new layer added or removed)
	if (map) {
		this._listener = map.on('postcompose', this.drawGraticule_.bind(this));
	}
};

ol_control_Graticule.prototype.setStyle = function (style)
{	this.style = style;
};

ol_control_Graticule.prototype.getStyle = function (style)
{	return style;
};

ol_control_Graticule.prototype.drawGraticule_ = function (e)
{	if (this.get('maxResolution')<e.frameState.viewState.resolution) return;
	
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
	{	bbox[i] = ol_proj.transform (c, map.getView().getProjection(), proj);
		xmax = Math.max (xmax, bbox[i][0]);
		xmin = Math.min (xmin, bbox[i][0]);
		ymax = Math.max (ymax, bbox[i][1]);
		ymin = Math.min (ymin, bbox[i][1]);
	}

	var spacing = this.get('spacing');
	var step = this.get('step');
	var step2 = this.get('stepCoord');
	var borderWidth = this.get('borderWidth');
	var margin = this.get('margin');

	// Limit max line draw
	var ds = (xmax-xmin)/step*spacing;
	if (ds>w) 
	{	var dt = Math.round((xmax-xmin)/w*spacing /step);
		step *= dt;
		if (step>this.fac) step = Math.round(step/this.fac)*this.fac;
	}

	xmin = (Math.floor(xmin/step))*step -step;
	ymin = (Math.floor(ymin/step))*step -step;
	xmax = (Math.floor(xmax/step))*step +2*step;
	ymax = (Math.floor(ymax/step))*step +2*step;

	var extent = ol_proj.get(proj).getExtent();
	if (extent)
	{	if (xmin < extent[0]) xmin = extent[0];
		if (ymin < extent[1]) ymin = extent[1];
		if (xmax > extent[2]) xmax = extent[2]+step;
		if (ymax > extent[3]) ymax = extent[3]+step;
	}

	var hasLines = this.style.getStroke() && this.get("stroke");
	var hasText = this.style.getText();
	var hasBorder = this.style.getFill();

	ctx.save();
		ctx.scale(ratio,ratio);

		ctx.beginPath();
		ctx.rect(margin, margin, w-2*margin, h-2*margin);
		ctx.clip();

		ctx.beginPath();

		var txt = {top:[],left:[],bottom:[], right:[]};

		for (var x=xmin; x<xmax; x += step)
		{	var p0 = ol_proj.transform ([x, ymin], proj, map.getView().getProjection());
			p0 = map.getPixelFromCoordinate(p0);
			if (hasLines) ctx.moveTo(p0[0], p0[1]);
			var p = p0;
			for (var y=ymin+step; y<=ymax; y+=step)
			{	var p1 = ol_proj.transform ([x, y], proj, map.getView().getProjection());
				p1 = map.getPixelFromCoordinate(p1);
				if (hasLines) ctx.lineTo(p1[0], p1[1]);
				if (p[1]>0 && p1[1]<0) txt.top.push([x, p]);
				if (p[1]>h && p1[1]<h) txt.bottom.push([x,p]);
				p = p1;
			}
		}
		for (var y=ymin; y<ymax; y += step)
		{	var p0 = ol_proj.transform ([xmin, y], proj, map.getView().getProjection());
			p0 = map.getPixelFromCoordinate(p0);
			if (hasLines) ctx.moveTo(p0[0], p0[1]);
			var p = p0;
			for (var x=xmin+step; x<=xmax; x+=step)
			{	var p1 = ol_proj.transform ([x, y], proj, map.getView().getProjection());
				p1 = map.getPixelFromCoordinate(p1);
				if (hasLines) ctx.lineTo(p1[0], p1[1]);
				if (p[0]<0 && p1[0]>0) txt.left.push([y,p]);
				if (p[0]<w && p1[0]>w) txt.right.push([y,p]);
				p = p1;
			}
		}

		if (hasLines)
		{	ctx.strokeStyle = this.style.getStroke().getColor();
			ctx.lineWidth = this.style.getStroke().getWidth();
			ctx.stroke();
		}

		// Draw text
		if (hasText)
		{
			ctx.fillStyle = this.style.getText().getFill().getColor();
			ctx.strokeStyle = this.style.getText().getStroke().getColor();
			ctx.lineWidth = this.style.getText().getStroke().getWidth();
			ctx.textAlign = 'center';
			ctx.textBaseline = 'hanging';
			var tf;
			var offset = (hasBorder ? borderWidth : 0) + margin + 2;
			for (var i=0, t; t = txt.top[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
			{	tf = this.formatCoord(t[0]);
				ctx.strokeText(tf, t[1][0], offset);
				ctx.fillText(tf, t[1][0], offset);
			}
			ctx.textBaseline = 'alphabetic';
			for (var i=0, t; t = txt.bottom[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
			{	tf = this.formatCoord(t[0]);
				ctx.strokeText(tf, t[1][0], h-offset);
				ctx.fillText(tf, t[1][0], h-offset);
			}
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'left';
			for (var i=0, t; t = txt.left[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
			{	tf = this.formatCoord(t[0]);
				ctx.strokeText(tf, offset, t[1][1]);
				ctx.fillText(tf, offset, t[1][1]);
			}
			ctx.textAlign = 'right';
			for (var i=0, t; t = txt.right[i]; i++) if (!(Math.round(t[0]/this.get('step'))%step2))
			{	tf = this.formatCoord(t[0]);
				ctx.strokeText(tf, w-offset, t[1][1]);
				ctx.fillText(tf, w-offset, t[1][1]);
			}
		}

		// Draw border
		if (hasBorder)
		{	var fillColor = this.style.getFill().getColor();
			var color, stroke;
			if (stroke = this.style.getStroke())
			{	color = this.style.getStroke().getColor();
			}
			else
			{	color = fillColor;
				fillColor = "#fff";
			}
			
			ctx.strokeStyle = color;
			ctx.lineWidth = stroke ? stroke.getWidth() : 1;
			// 
			for (var i=1; i<txt.top.length; i++)
			{	ctx.beginPath();
				ctx.rect(txt.top[i-1][1][0], margin, txt.top[i][1][0]-txt.top[i-1][1][0], borderWidth);
				ctx.fillStyle = Math.round(txt.top[i][0]/step)%2 ? color: fillColor;
				ctx.fill(); 
				ctx.stroke(); 
			}
			for (var i=1; i<txt.bottom.length; i++)
			{	ctx.beginPath();
				ctx.rect(txt.bottom[i-1][1][0], h-borderWidth-margin, txt.bottom[i][1][0]-txt.bottom[i-1][1][0], borderWidth);
				ctx.fillStyle = Math.round(txt.bottom[i][0]/step)%2 ? color: fillColor;
				ctx.fill(); 
				ctx.stroke(); 
			}
			for (var i=1; i<txt.left.length; i++)
			{	ctx.beginPath();
				ctx.rect(margin, txt.left[i-1][1][1], borderWidth, txt.left[i][1][1]-txt.left[i-1][1][1]);
				ctx.fillStyle = Math.round(txt.left[i][0]/step)%2 ? color: fillColor;
				ctx.fill(); 
				ctx.stroke(); 
			}
			for (var i=1; i<txt.right.length; i++)
			{	ctx.beginPath();
				ctx.rect(w-borderWidth-margin, txt.right[i-1][1][1], borderWidth, txt.right[i][1][1]-txt.right[i-1][1][1]);
				ctx.fillStyle = Math.round(txt.right[i][0]/step)%2 ? color: fillColor;
				ctx.fill(); 
				ctx.stroke(); 
			}
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.rect(margin,margin, borderWidth, borderWidth);
			ctx.rect(margin,h-borderWidth-margin, borderWidth,borderWidth);
			ctx.rect(w-borderWidth-margin,margin, borderWidth, borderWidth);
			ctx.rect(w-borderWidth-margin,h-borderWidth-margin, borderWidth,borderWidth);
			ctx.fill(); 
		}

	ctx.restore();
};

export default ol_control_Graticule