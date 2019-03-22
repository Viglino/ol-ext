import ol_ext_inherits from '../util/ext'
import ol_interaction_Pointer from 'ol/interaction/Pointer'

/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol_interaction_Clip.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100
 *	@param {ol.layer|Array<ol.layer>} options.layers layers to clip
 */
var ol_interaction_Clip = function(options) {

  this.layers_ = [];
  
  ol_interaction_Pointer.call(this, {
    handleDownEvent: this.setPosition,
    handleMoveEvent: this.setPosition
  });

  this.precomposeBind_ = this.precompose_.bind(this);
  this.postcomposeBind_ = this.postcompose_.bind(this);

  // Default options
  options = options || {};

  this.pos = false;
  this.radius = (options.radius||100);
  if (options.layers) this.addLayer(options.layers);
};
ol_ext_inherits(ol_interaction_Clip, ol_interaction_Pointer);

/** Set the map > start postcompose
*/
ol_interaction_Clip.prototype.setMap = function(map) {
  var i;

  if (this.getMap()) {
    for (i=0; i<this.layers_.length; i++) {
      this.layers_[i].un(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].un(['postcompose','postrender'], this.postcomposeBind_);
    }
    this.getMap().renderSync();
  }

  ol_interaction_Pointer.prototype.setMap.call(this, map);

  if (map) {
    for (i=0; i<this.layers_.length; i++) {
      this.layers_[i].on(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].on(['postcompose','postrender'], this.postcomposeBind_);
    }
    map.renderSync();
  }
}

/** Set clip radius
 *	@param {integer} radius
*/
ol_interaction_Clip.prototype.setRadius = function(radius) {
  this.radius = radius;
  if (this.getMap()) this.getMap().renderSync();
}

/** Add a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
*/
ol_interaction_Clip.prototype.addLayer = function(layers)  {
  if (!(layers instanceof Array)) layers = [layers];
  for (var i=0; i<layers.length; i++) {
    if (this.getMap()) {
      layers[i].on(['precompose','prerender'], this.precomposeBind_);
      layers[i].on(['postcompose','postrender'], this.postcomposeBind_);

      this.getMap().renderSync();
    }
    this.layers_.push(layers[i]);
  }
};

/** Remove a layer to clip
 *	@param {ol.layer|Array<ol.layer>} layer to clip
*/
ol_interaction_Clip.prototype.removeLayer = function(layers) {
  if (!(layers instanceof Array)) layers = [layers];
  for (var i=0; i<layers.length; i++) {
    var k;
    for (k=0; k<this.layers_.length; k++) {
      if (this.layers_[k]===layers[i]) {
        break;
      }
    }
    if (k!=this.layers_.length && this.getMap()) {
      this.layers_[k].un(['precompose','prerender'], this.precomposeBind_);
      this.layers_[k].un(['postcompose','postrender'], this.postcomposeBind_);
      this.layers_.splice(k,1);
      this.getMap().renderSync();
    }
  }
};

/** Set position of the clip
*	@param {ol.Pixel|ol.MapBrowserEvent}
*/
ol_interaction_Clip.prototype.setPosition = function(e) {
  if (e.pixel) this.pos = e.pixel;
  else {
    if (e && e instanceof Array) this.pos = e;
    else e = [-10000000,-10000000];
  }
  if (this.getMap()) this.getMap().renderSync();
};

/* @private
*/
ol_interaction_Clip.prototype.precompose_ = function(e) {
  var ctx = e.context;
  var ratio = e.frameState.pixelRatio;

  ctx.save();
  ctx.beginPath();
  ctx.arc (this.pos[0]*ratio, this.pos[1]*ratio, this.radius*ratio, 0, 2*Math.PI);
  ctx.clip();
};

/* @private
*/
ol_interaction_Clip.prototype.postcompose_ = function(e) {
  e.context.restore();
};

/**
 * Activate or deactivate the interaction.
 * @param {boolean} active Active.
 * @observable
 * @api
 */
ol_interaction_Clip.prototype.setActive = function(b) {
  if (b===this.getActive()) return;
  ol_interaction_Pointer.prototype.setActive.call (this, b);
  var i;
  if (b) {
    for(i=0; i<this.layers_.length; i++) {
      this.layers_[i].on(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].on(['postcompose','postrender'], this.postcomposeBind_);
    }
  } else {
    for(i=0; i<this.layers_.length; i++) {
      this.layers_[i].un(['precompose','prerender'], this.precomposeBind_);
      this.layers_[i].un(['postcompose','postrender'], this.postcomposeBind_);
    }
  }
  if (this.getMap()) this.getMap().renderSync();
};

export default ol_interaction_Clip
