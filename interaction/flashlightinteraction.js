/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 *	@param {ol.flashlight.options} flashlight options param
 *		- color {ol.Color} light color, default transparent
 *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
 *		- radius {number} radius of the flash
 */
ol.interaction.Flashlight = function(options) {

	ol.interaction.Pointer.call(this, 
	{	handleDownEvent: this.setPosition,
		handleMoveEvent: this.setPosition
	});

	// Default options
	options = options||{};

	this.pos = false;
	
	this.radius = (options.radius||100);
	
	this.setColor(options);

};
ol.inherits(ol.interaction.Flashlight, ol.interaction.Pointer);

/** Set the map > start postcompose
*/
ol.interaction.Flashlight.prototype.setMap = function(map)
{	if (this.getMap()) 
	{	this.getMap().un('postcompose', this.postcompose_, this);
		this.getMap().render();
	}
	
	ol.interaction.Pointer.prototype.setMap.call(this, map);

	if (map)
	{	map.on('postcompose', this.postcompose_, this);
	}
}

/** Set flashlight radius
 *	@param {integer} radius
 */
ol.interaction.Flashlight.prototype.setRadius = function(radius)
{	this.radius = radius
	if (this.getMap()) this.getMap().renderSync();
}

/** Set flashlight color
 *	@param {ol.flashlight.options} flashlight options param
 *		- color {ol.Color} light color, default transparent
 *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
 */
ol.interaction.Flashlight.prototype.setColor = function(options)
{	// Backcolor
	var color = (options.fill ? options.fill : [0,0,0,0.8]);
	var c = ol.color.asArray(color);
	this.startColor = ol.color.asString(c);
	// Halo color
	var endColor;
	if (options.color)
	{	c = this.endColor = ol.color.asString(ol.color.asArray(options.color)||options.color);
	}
	else 
	{	c[3] = 0
		this.endColor = ol.color.asString(c);
	}
	c[3] = 0.1;
	this.midColor = ol.color.asString(c);
	if (this.getMap()) this.getMap().renderSync();
}

/** Set position of the flashlight
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol.interaction.Flashlight.prototype.setPosition = function(e)
{	if (e.pixel) this.pos = e.pixel;
	else this.pos = e;
	if (this.getMap()) 
	{	this.getMap().renderSync();
	}
}

/** Postcompose function
*/
ol.interaction.Flashlight.prototype.postcompose_ = function(e)
{	var ctx = e.context;
	var ratio = e.frameState.pixelRatio;
	var w = ctx.canvas.width;
	var h = ctx.canvas.height;
	ctx.save();
	ctx.scale(ratio,ratio);
	
	if (!this.pos) 
	{	ctx.fillStyle = this.startColor;
		ctx.fillRect( 0,0,w,h );
	}
	else
	{	var d = Math.max(w, h);
		// reveal wherever we drag
		var radGrd = ctx.createRadialGradient( this.pos[0], this.pos[1], w*this.radius/d, this.pos[0], this.pos[1], h*this.radius/d );
		radGrd.addColorStop(   0, this.startColor );
		radGrd.addColorStop( 0.8, this.midColor );
		radGrd.addColorStop(   1, this.endColor );
		ctx.fillStyle = radGrd;
		ctx.fillRect( this.pos[0] - d, this.pos[1] - d, 2*d, 2*d );
	}
	ctx.restore();
};