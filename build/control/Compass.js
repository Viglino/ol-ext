/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol from 'ol'
import ol_control_Control from 'ol/control/control'

/**
 * Draw a compass on the map. The position/size of the control is defined in the css.
 *
 * @constructor
 * @extends {ol_control_Control}
 * @param {Object=} options Control options. The style {_ol_style_Stroke_} option is usesd to draw the text.
 *	@param {string} options.className class name for the control
 *	@param {Image} options.image an image, default use the src option or a default image
 *	@param {string} options.src image src, default use the image option or a default image
 *	@param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
 *	@param {_ol_style_Stroke_} options.style style to draw the lines, default draw no lines
 */
var ol_control_Compass = function(options)
{	var self = this;
	if (!options) options = {};
	
	// Initialize parent
	var elt = document.createElement("div");
	elt.className = "ol-compassctrl ol-unselectable ol-hidden" + (options.className ? " "+options.className : "");
	elt.style.position = "absolute";
	elt.style.visibility = "hidden";
	
	ol_control_Control.call(this, { element: elt });

	this.set('rotateVithView', options.rotateWithView!==false);
	// Style to draw the lines
	this.style = options.style;

	// The image
	if (options.image)
	{	this.img_ = options.image;
	}
	else if (options.src)
	{	this.img_ = new Image();
		this.img_.onload = function(){ if (self.getMap()) self.getMap().renderSync(); }
		this.img_.src =  options.src;
	}
	else this.img_ = this.defaultCompass_($(this.element).width(), this.style ? this.style.getColor():"");

	// 8 angles
	this.da_ = [];
	for (var i=0; i<8; i++) this.da_[i] = [ Math.cos(Math.PI*i/8), Math.sin(Math.PI*i/8) ];
};
ol.inherits(ol_control_Compass, ol_control_Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * @param {_ol_Map_} map Map.
 * @api stable
 */
ol_control_Compass.prototype.setMap = function (map)
{	var oldmap = this.getMap();
	if (oldmap) oldmap.un('postcompose', this.drawCompass_, this);
	
	ol_control_Control.prototype.setMap.call(this, map);
	if (oldmap) oldmap.renderSync();

	// Get change (new layer added or removed)
	if (map) map.on('postcompose', this.drawCompass_, this);
};

/**
 * Create a default image.
 * @param {number} s the size of the compass
 * @private
 */
ol_control_Compass.prototype.defaultCompass_ = function (s, color)
{	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext("2d");
	var s = canvas.width = canvas.height;
	var r = s/2;
	var r2 = 0.22*r;

	function draw (r, r2)
	{	ctx.fillStyle = color ||"#963";
		ctx.beginPath();
		ctx.moveTo (0,0); 
		ctx.lineTo (r,0); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (-r,0); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
		ctx.lineTo (0,r); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,-r); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
		ctx.fill();
		ctx.stroke();
	};
		
	function draw2 (r, r2)
	{	ctx.globalCompositeOperation = "destination-out";
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.moveTo (0,0); 
		ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
		ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
		ctx.fill();
		ctx.globalCompositeOperation="source-over";
		ctx.beginPath();
		ctx.moveTo (0,0); 
		ctx.lineTo (r,0); ctx.lineTo (r2,-r2); ctx.moveTo (0,0);
		ctx.lineTo (-r,0); ctx.lineTo (-r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,r); ctx.lineTo (r2,r2); ctx.moveTo (0,0);
		ctx.lineTo (0,-r); ctx.lineTo (-r2,-r2); ctx.moveTo (0,0);
		ctx.stroke();
	};

	ctx.translate(r,r);
	ctx.strokeStyle = color || "#963";
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.arc (0,0, s*0.41, 0, 2*Math.PI);
	ctx.arc (0,0, s*0.44, 0, 2*Math.PI);
	ctx.stroke();

	ctx.rotate(Math.PI/4)
	draw (r*0.9, r2*0.8);
	draw2 (r*0.9, r2*0.8);

	ctx.rotate(-Math.PI/4)
	draw (r, r2);
	draw2 (r, r2);
	
	return canvas;
};

/** Draw compass
* @param {ol.event} e postcompose event
* @private
*/
ol_control_Compass.prototype.drawCompass_ = function(e)
{	var ctx = e.context;
	var canvas = ctx.canvas;

	// Retina device
	var ratio = e.frameState.pixelRatio;
	ctx.save();
	ctx.scale(ratio,ratio);

	var w = $(this.element).width();
	var h = $(this.element).height();
	var pos = $(this.element).position();
	
	var compass = this.img_;
	var rot = e.frameState.viewState.rotation;
	
	ctx.beginPath();
		ctx.translate(pos.left+w/2, pos.top+h/2);
		if (this.get('rotateVithView')) ctx.rotate(rot);
		/*
		ctx.globalCompositeOperation = "multiply";
		ctx.globalAlpha = this.opacity || 1;
		*/
		if (this.style)
		{	ctx.beginPath();
				ctx.strokeStyle = this.style.getColor();
				ctx.lineWidth = this.style.getWidth();
				var m = Math.max(canvas.width, canvas.height);
				for (var i=0; i<8; i++)
				{	ctx.moveTo (-this.da_[i][0]*m, -this.da_[i][1]*m);
					ctx.lineTo (this.da_[i][0]*m, this.da_[i][1]*m);
				}
			ctx.stroke();
		}
		
		if (compass.width)
		{	ctx.drawImage (compass, -w/2, -h/2, w, h);
		}

	ctx.closePath();

	ctx.restore();
};

export default ol_control_Compass