/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol.interaction.Pointer}
 *	@param {ol.interaction.clip.options} flashlight options param
 *		- radius {number} radius of the clip, default 100
 *		- layers {ol.layer|Array<ol.layer>} layers to clip
 */
ol.interaction.Clip = function(options) {

	ol.interaction.Pointer.call(this, 
	{	handleDownEvent: this.setPosition,
		handleMoveEvent: this.setPosition
	});

	// Default options
	options = options || {};

	this.pos = false;
	this.radius = (options.radius||100);
	this.layers_ = [];
	if (options.layers) this.addLayer(options.layers);
};
ol.inherits(ol.interaction.Clip, ol.interaction.Pointer);

/** Set the map > start postcompose
*/
ol.interaction.Clip.prototype.setMap = function(map)
{	if (this.getMap()) 
	{	for (var i=0; i<this.layers_.length; i++)
		{	this.layers_[i].un('precompose', this.precompose_, this);
			this.layers_[i].un('postcompose', this.postcompose_, this);
		}
		this.getMap().renderSync();
	}
	
	ol.interaction.Pointer.prototype.setMap.call(this, map);

	if (map)
	{	for (var i=0; i<this.layers_.length; i++)
		{	this.layers_[i].on('precompose', this.precompose_, this);
			this.layers_[i].on('postcompose', this.postcompose_, this);
		}
		map.renderSync();
	}
}

/** Set clip radius
 *	@param {integer} radius
 */
ol.interaction.Clip.prototype.setRadius = function(radius)
{	this.radius = radius;
	if (this.getMap()) this.getMap().renderSync();
}

/** Add a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
 */
ol.interaction.Clip.prototype.addLayer = function(layers)
{	if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++)
	{	if (this.getMap())
		{	layers[i].on('precompose', this.precompose_, this);
			layers[i].on('postcompose', this.postcompose_, this);
			this.getMap().renderSync();
		}
		this.layers_.push(layers[i]);
	}
}

/** Remove a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
 */
ol.interaction.Clip.prototype.removeLayer = function(layers)
{	if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++)
	{	var k;
		for (k=0; k<this.layers_.length; k++)
		{	if (this.layers_[k]===layers[i]) 
			{	break;
			}
		}
		if (k!=this.layers_.length && this.getMap())
		{	this.layers_.splice(k,1);
			layers[i].un('precompose', this.precompose_, this);
			layers[i].un('postcompose', this.postcompose_, this);
			this.getMap().renderSync();
		}
	}
}

/** Set position of the clip
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol.interaction.Clip.prototype.setPosition = function(e)
{	if (e.pixel) this.pos = e.pixel;
	else 
	{	if (e && e instanceof Array) this.pos = e;
		else e = [-10000000,-10000000];
	}
	if (this.getMap()) this.getMap().renderSync();
}

/* @private
*/
ol.interaction.Clip.prototype.precompose_ = function(e)
{	var ctx = e.context;
	var ratio = e.frameState.pixelRatio;

	ctx.save();
	ctx.beginPath();
	ctx.arc (this.pos[0]*ratio, this.pos[1]*ratio, this.radius*ratio, 0, 2*Math.PI);
	ctx.clip();
}

/* @private
*/
ol.interaction.Clip.prototype.postcompose_ = function(e)
{	e.context.restore();
};