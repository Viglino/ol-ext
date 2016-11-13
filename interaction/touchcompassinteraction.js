/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** Interaction splitter: acts as a split feature agent while editing vector features (LineString).
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {olx.interaction.TouchCompass} 
 */
ol.interaction.TouchCompass = function(options) 
{	var options = options||{};
	var self = this;

	// Click on the compass
	options.handleDownEvent = function(e)
	{	var s = this.getCenter_();
		var dx = e.pixel[0]-s[0];
		var dy = e.pixel[1]-s[1];
		this.start = e;
		return (Math.sqrt(dx*dx+dy*dy) < this.size/2);
	};
	// Pn drag
	options.handleDragEvent = function(e)
	{	if (!this.pos) 
		{	this.pos = this.start;
			this.getMap().renderSync();
		}
		this.pos = e;
	};
	// Stop drag
	options.handleUpEvent = function(e)
	{	this.pos = false;
		return true;
	};

	ol.interaction.Pointer.call(this, options);
	this.image = new Image();
	this.image.src = this.compass;
	this.ondrag_ = options.onDrag;

	this.size = 80;

};
ol.inherits(ol.interaction.TouchCompass, ol.interaction.Pointer);

/** Compass Image
* https://commons.wikimedia.org/wiki/File:Blue_compass_rose.svg
* @licence public domain
* @api
*/
ol.interaction.TouchCompass.prototype.compass = "data:image/png;base64,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";

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.TouchCompass.prototype.setMap = function(map) 
{	if (this.getMap())
	{	this.getMap().un('postcompose', this.drawCompass_, this);
	}

	ol.interaction.Pointer.prototype.setMap.call (this, map);

	if (map)
	{	map.on('postcompose', this.drawCompass_, this);
	}
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol.interaction.TouchCompass.prototype.setActive = function(b) 
{	ol.interaction.Pointer.prototype.setActive.call (this, b);
	if (this.getMap()) this.getMap().renderSync();
}

/**
 * Get the center of the compass
 * @param {ol.coordinate} 
 * @private
 */
ol.interaction.TouchCompass.prototype.getCenter_ = function() 
{	var margin = 10;
	var s = this.size;
	var c = this.getMap().getSize(); 
	return [c[0]/2, c[1]-margin-s/2];
}

/**
 * Draw the compass on post compose
 * @private
 */
ol.interaction.TouchCompass.prototype.drawCompass_ = function(e) 
{	if (!this.getActive()) return;

	var ctx = e.context;
	var ratio = e.frameState.pixelRatio;

	ctx.save();
	ctx.scale(ratio,ratio);

	ctx.globalAlpha = 0.5;
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 5;

	var s = this.size;
	var c = this.getCenter_();

	ctx.drawImage(this.image, 0,0,this.image.width,this.image.height, c[0]-s/2, c[1]-s/2, s,s);

	if (this.pos)
	{	var dx = this.pos.pixel[0]-this.start.pixel[0];
		var dy = this.pos.pixel[1]-this.start.pixel[1];
		for (var i=1; i<=4; i++)
		{	ctx.beginPath();
			ctx.arc (c[0] +dx/4*i, c[1] +dy/4*i, s/2*(0.6+0.4*i/4), 0, 2*Math.PI);
			ctx.stroke();
		}
	}

	ctx.restore();

	if (this.pos)
	{	// Get delta
		if (this.ondrag_) 
		{	var r = this.getMap().getView().getResolution();
			var delta = 
				{	dpixel: [ this.pos.pixel[0] - this.start.pixel[0], this.pos.pixel[1] - this.start.pixel[1] ]
				}
			delta.traction = [ delta.dpixel[0]*r, -delta.dpixel[1]*r];

			this.ondrag_(delta, this.pos);
		}
		// Continue animation
		e.frameState.animate = true;
	}
};