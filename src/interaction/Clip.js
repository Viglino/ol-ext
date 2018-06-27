
import ol from 'ol'
import ol_interaction_Pointer from 'ol/interaction/pointer'

/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol_interaction_Pointer}
 *	@param {ol_interaction_Clip.options} options flashlight  param
 *		- radius {number} radius of the clip, default 100
 *		- layers {ol.layer|Array<ol.layer>} layers to clip
 */
var ol_interaction_Clip = function(options) {

	this.layers_ = [];
	
	ol_interaction_Pointer.call(this,
	{	handleDownEvent: this.setPosition,
		handleMoveEvent: this.setPosition
	});

	// Default options
	options = options || {};

	this.pos = false;
	this.radius = (options.radius||100);
	if (options.layers) this.addLayer(options.layers);
};
ol.inherits(ol_interaction_Clip, ol_interaction_Pointer);

/** Set the map > start postcompose
*/
ol_interaction_Clip.prototype.setMap = function(map) {
	if (this.getMap()) {
		for (var i=0; i<this.layers_.length; i++) {
			if (this.layers_[i].precompose) ol_Observable.unByKey(this.layers_[i].precompose);
			if (this.layers_[i].postcompose) ol_Observable.unByKey(this.layers_[i].postcompose);
			this.layers_[i].precompose = this.layers_[i].postcompose = null;
		}
		this.getMap().renderSync();
	}

	ol_interaction_Pointer.prototype.setMap.call(this, map);

	if (map) {
		for (var i=0; i<this.layers_.length; i++) {
			this.layers_[i].precompose = this.layers_[i].layer.on('precompose', this.precompose_.bind(this));
			this.layers_[i].postcompose = this.layers_[i].layer.on('postcompose', this.postcompose_.bind(this));
		}
		map.renderSync();
	}
}

/** Set clip radius
 *	@param {integer} radius
 */
ol_interaction_Clip.prototype.setRadius = function(radius)
{	this.radius = radius;
	if (this.getMap()) this.getMap().renderSync();
}

/** Add a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
 */
ol_interaction_Clip.prototype.addLayer = function(layers)
{	if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++) {
		var l = { layer: layers[i] }
		if (this.getMap()) {
			l.precompose = layers[i].on('precompose', this.precompose_.bind(this));
			l.postcompose = layers[i].on('postcompose', this.postcompose_.bind(this));
			this.getMap().renderSync();
		}
		this.layers_.push(l);
	}
}

/** Remove a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
 */
ol_interaction_Clip.prototype.removeLayer = function(layers)
{	if (!(layers instanceof Array)) layers = [layers];
	for (var i=0; i<layers.length; i++)
	{	var k;
		for (k=0; k<this.layers_.length; k++)
		{	if (this.layers_[k].layer===layers[i]) 
			{	break;
			}
		}
		if (k!=this.layers_.length && this.getMap())
		{	if (this.layers_[k].precompose) ol_Observable.unByKey(this.layers_[k].precompose);
			if (this.layers_[k].postcompose) ol_Observable.unByKey(this.layers_[k].postcompose);
			this.layers_.splice(k,1);
			this.getMap().renderSync();
		}
	}
}

/** Set position of the clip
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol_interaction_Clip.prototype.setPosition = function(e)
{	if (e.pixel) this.pos = e.pixel;
	else 
	{	if (e && e instanceof Array) this.pos = e;
		else e = [-10000000,-10000000];
	}
	if (this.getMap()) this.getMap().renderSync();
}

/* @private
*/
ol_interaction_Clip.prototype.precompose_ = function(e)
{	var ctx = e.context;
	var ratio = e.frameState.pixelRatio;

	ctx.save();
	ctx.beginPath();
	ctx.arc (this.pos[0]*ratio, this.pos[1]*ratio, this.radius*ratio, 0, 2*Math.PI);
	ctx.clip();
}

/* @private
*/
ol_interaction_Clip.prototype.postcompose_ = function(e)
{	e.context.restore();
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol_interaction_Clip.prototype.setActive = function(b)
{	ol_interaction_Pointer.prototype.setActive.call (this, b);
	if(b) {
		for(var i=0; i<this.layers_.length; i++) {
			this.layers_[i].precompose = this.layers_[i].layer.on('precompose', this.precompose_.bind(this));
			this.layers_[i].postcompose = this.layers_[i].layer.on('postcompose', this.postcompose_.bind(this));
		}
	} else {
		for(var i=0; i<this.layers_.length; i++) {
			if (this.layers_[i].precompose) ol_Observable.unByKey(this.layers_[i].precompose);
			if (this.layers_[i].postcompose) ol_Observable.unByKey(this.layers_[i].postcompose);
			this.layers_[i].precompose = this.layers_[i].postcompose = null;
		}
	}
	if (this.getMap()) this.getMap().renderSync();
}

export default ol_interaction_Clip