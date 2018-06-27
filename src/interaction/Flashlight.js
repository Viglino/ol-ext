
import ol from 'ol'
import ol_interaction_Pointer from 'ol/interaction/pointer'
import ol_color from 'ol/color'

/**
 * @constructor
 * @extends {ol_interaction_Pointer}
 *	@param {ol.flashlight.options} flashlight options param
 *		- color {ol.Color} light color, default transparent
 *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
 *		- radius {number} radius of the flash
 */
var ol_interaction_Flashlight = function(options) {

	ol_interaction_Pointer.call(this,
	{	handleDownEvent: this.setPosition,
		handleMoveEvent: this.setPosition
	});

	// Default options
	options = options||{};

	this.pos = false;
	
	this.radius = (options.radius||100);
	
	this.setColor(options);

};
ol.inherits(ol_interaction_Flashlight, ol_interaction_Pointer);

/** Set the map > start postcompose
*/
ol_interaction_Flashlight.prototype.setMap = function(map) {
	if (this.getMap()) {
		this.getMap().render();
	}
	if (this._listener) ol_Observable.unByKey(this._listener);
	this._listener = null;
	
	ol_interaction_Pointer.prototype.setMap.call(this, map);

	if (map) {
		this._listener = map.on('postcompose', this.postcompose_.bind(this));
	}
}

/** Set flashlight radius
 *	@param {integer} radius
 */
ol_interaction_Flashlight.prototype.setRadius = function(radius)
{	this.radius = radius
	if (this.getMap()) this.getMap().renderSync();
}

/** Set flashlight color
 *	@param {ol.flashlight.options} flashlight options param
 *		- color {ol.Color} light color, default transparent
 *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
 */
ol_interaction_Flashlight.prototype.setColor = function(options)
{	// Backcolor
	var color = (options.fill ? options.fill : [0,0,0,0.8]);
	var c = ol_color.asArray(color);
	this.startColor = ol_color.asString(c);
	// Halo color
	var endColor;
	if (options.color)
	{	c = this.endColor = ol_color.asString(ol_color.asArray(options.color)||options.color);
	}
	else 
	{	c[3] = 0
		this.endColor = ol_color.asString(c);
	}
	c[3] = 0.1;
	this.midColor = ol_color.asString(c);
	if (this.getMap()) this.getMap().renderSync();
}

/** Set position of the flashlight
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol_interaction_Flashlight.prototype.setPosition = function(e)
{	if (e.pixel) this.pos = e.pixel;
	else this.pos = e;
	if (this.getMap()) 
	{	this.getMap().renderSync();
	}
}

/** Postcompose function
*/
ol_interaction_Flashlight.prototype.postcompose_ = function(e)
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

export default ol_interaction_Flashlight