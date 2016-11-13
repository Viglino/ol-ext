/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** ol.control.Target draw a target at the center of the map. 
* @param {Object}
*  - style {ol.style|Array<ol.style>} ol.style.Stroke: draw a cross on the map, ol.style.Image: draw the image on the map
*  - composite {string} composite operation : difference|multiply|xor|screen|overlay|darken|lighter|lighten|...
*/
ol.control.Target = function(options) 
{	options = options || {};

	this.style = options.style || [{ stroke: new ol.style.Stroke({ color:"#000", width:2 }), radius: 10 }];
	if (!(this.style instanceof Array)) this.style = [this.style];
	this.composite = options.composite || '';

	var div = document.createElement('div');
	div.className = "ol-target ol-unselectable ol-control";
	ol.control.Control.call(this, 
	{	element: div,
		target: options.target
	});

	this.setVisible(options.visible!==false);
};
ol.inherits(ol.control.Target, ol.control.Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Subclasses may set up event handlers to get notified about changes to
 * the map here.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.control.Target.prototype.setMap = function (map)
{	if (this.getMap()) 
	{	this.getMap().un('postcompose', this.drawTarget_, this);
		if (this.getVisible()) this.getMap().renderSync();
	}

	ol.control.Control.prototype.setMap.call(this, map);

	if (map) 
	{	map.on('postcompose', this.drawTarget_, this);
	}
};

/** Set the control visibility
* @paraam {boolean} b 
*/
ol.control.Target.prototype.setVisible = function (b)
{	this.set("visible",b);
	if (this.getMap()) this.getMap().renderSync();
};

/** Get the control visibility
* @return {boolean} b 
*/
ol.control.Target.prototype.getVisible = function ()
{	return this.get("visible");
};

/** Draw the target
* @private
*/
ol.control.Target.prototype.drawTarget_ = function (event)
{	if (!this.getMap() || !this.getVisible()) return;
	var ctx = event.context;
	var ratio = event.frameState.pixelRatio;

	ctx.save();
	
		ctx.scale(ratio,ratio);

		var cx = ctx.canvas.width/(2*ratio);
		var cy = ctx.canvas.height/(2*ratio);

		if (this.composite) ctx.globalCompositeOperation = this.composite;

		for (var i=0; i<this.style.length; i++)
		{	var style = this.style[i];
			if (style.stroke instanceof ol.style.Stroke)
			{	ctx.lineWidth = style.stroke.getWidth();
				ctx.strokeStyle = ol.color.asString(style.stroke.getColor());
				var m = style.radius || 10;
				
				var dx = cx + ctx.lineWidth/2;
				var dy = cy + ctx.lineWidth/2;

				ctx.beginPath();
				ctx.moveTo (dx-m, dy);
				ctx.lineTo (dx+m, dy);
				ctx.moveTo (dx, dy-m);
				ctx.lineTo( dx, dy+m);
				ctx.stroke();
			}
			else if (style instanceof ol.style.Image)
			{	var img = style.getImage();
				ctx.drawImage(img, cx-img.width/2, cy-img.height/2);
			}
			else if (style instanceof ol.style.Text)
			{	ctx.font = style.getFont();
				ctx.textBaseline = "middle";
				ctx.textAlign = "center";
				var fill = style.getFill();
				if (fill)
				{	ctx.fillStyle = ol.color.asString(fill.getColor());
					ctx.fillText(style.getText(), cx, cy);
				}
				var stroke = style.getStroke();
				if (stroke) 
				{	ctx.lineWidth = stroke.getWidth();
					ctx.strokeStyle = ol.color.asString(stroke.getColor());
					ctx.strokeText(style.getText(), cx, cy);
				}
			}
		}

	ctx.restore();
};
