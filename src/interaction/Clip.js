import ol_interaction_Pointer from 'ol/interaction/Pointer.js'

/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol_interaction_Clip.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100
 *	@param {ol.layer|Array<ol.layer>} options.layers layers to clip
 */
var ol_interaction_Clip = class olinteractionClip extends ol_interaction_Pointer {
  constructor(options) {
    super({
      handleDownEvent: function(e) { return this._setPosition(e) },
      handleMoveEvent: function(e) { return this._setPosition(e) },
    });
    
    this.layers_ = [];
    this.precomposeBind_ = this.precompose_.bind(this);
    this.postcomposeBind_ = this.postcompose_.bind(this);

    // Default options
    options = options || {};

    this.pos = false;
    this.radius = (options.radius || 100);
    if (options.layers) this.addLayer(options.layers);
    this.setActive(true);
  }
  /** Set the map > start postcompose
  */
  setMap(map) {
    var i;

    if (this.getMap()) {
      for (i = 0; i < this.layers_.length; i++) {
        this.layers_[i].un(['precompose', 'prerender'], this.precomposeBind_);
        this.layers_[i].un(['postcompose', 'postrender'], this.postcomposeBind_);
      }
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }

    super.setMap(map);

    if (map) {
      for (i = 0; i < this.layers_.length; i++) {
        this.layers_[i].on(['precompose', 'prerender'], this.precomposeBind_);
        this.layers_[i].on(['postcompose', 'postrender'], this.postcomposeBind_);
      }
      try { map.renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** Set clip radius
   *	@param {integer} radius
   */
  setRadius(radius) {
    this.radius = radius;
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** Get clip radius
   *	@returns {integer} radius
   */
  getRadius() {
    return this.radius;
  }
  /** Add a layer to clip
   *	@param {ol.layer|Array<ol.layer>} layer to clip
  */
  addLayer(layers) {
    if (!(layers instanceof Array))
      layers = [layers];
    for (var i = 0; i < layers.length; i++) {
      if (this.getMap()) {
        layers[i].on(['precompose', 'prerender'], this.precomposeBind_);
        layers[i].on(['postcompose', 'postrender'], this.postcomposeBind_);

        try { this.getMap().renderSync(); } catch (e) { /* ok */ }
      }
      this.layers_.push(layers[i]);
    }
  }
  /** Remove all layers
   */
  removeLayers() {
    this.removeLayer(this.layers_);
  }
  /** Remove a layer to clip
   *	@param {ol.layer|Array<ol.layer>} layer to clip
  */
  removeLayer(layers) {
    if (!(layers instanceof Array))
      layers = [layers];
    for (var i = 0; i < layers.length; i++) {
      var k;
      for (k = 0; k < this.layers_.length; k++) {
        if (this.layers_[k] === layers[i]) {
          break;
        }
      }
      if (k != this.layers_.length && this.getMap()) {
        this.layers_[k].un(['precompose', 'prerender'], this.precomposeBind_);
        this.layers_[k].un(['postcompose', 'postrender'], this.postcomposeBind_);
        this.layers_.splice(k, 1);
      }
    }
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** Set position of the clip
   * @param {ol.coordinate} coord
   */
  setPosition(coord) {
    if (this.getMap()) {
      this.pos = this.getMap().getPixelFromCoordinate(coord);
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** Get position of the clip
   * @returns {ol.coordinate}
   */
  getPosition() {
    if (this.pos)
      return this.getMap().getCoordinateFromPixel(this.pos);
    return null;
  }
  /** Set position of the clip
   * @param {ol.Pixel} pixel
   */
  setPixelPosition(pixel) {
    this.pos = pixel;
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** Get position of the clip
   * @returns {ol.Pixel} pixel
   */
  getPixelPosition() {
    return this.pos;
  }
  /** Set position of the clip
   * @param {ol.MapBrowserEvent} e
   * @privata
   */
  _setPosition(e) {
    if (e.type === 'pointermove' && this.get('action') === 'onclick'){
      return;
    }
    if (e.pixel) {
      this.pos = e.pixel;
    }
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /* @private
  */
  precompose_(e) {
    if (!this.getActive())
      return;
    var ctx = e.context;
    var ratio = e.frameState.pixelRatio;

    ctx.save();
    ctx.beginPath();
    var pt = [this.pos[0], this.pos[1]];
    var radius = this.radius;
    var tr = e.inversePixelTransform;
    if (tr) {
      // Transform pt
      pt = [
        (pt[0] * tr[0] - pt[1] * tr[1] + tr[4]),
        (-pt[0] * tr[2] + pt[1] * tr[3] + tr[5])
      ];
      // Get radius / transform
      radius = pt[0] - ((this.pos[0] - radius) * tr[0] - this.pos[1] * tr[1] + tr[4]);
    } else {
      pt[0] *= ratio;
      pt[1] *= ratio;
      radius *= ratio;
    }
    ctx.arc(pt[0], pt[1], radius, 0, 2 * Math.PI);
    ctx.clip();
  }
  /* @private
  */
  postcompose_(e) {
    if (!this.getActive())
      return;
    e.context.restore();
  }
  /**
   * Activate or deactivate the interaction.
   * @param {boolean} active Active.
   * @observable
   * @api
   */
  setActive(b) {
    if (b === this.getActive()) {
      return;
    }
    super.setActive(b);
    if (!this.layers_) return;
    var i;
    if (b) {
      for (i = 0; i < this.layers_.length; i++) {
        this.layers_[i].on(['precompose', 'prerender'], this.precomposeBind_);
        this.layers_[i].on(['postcompose', 'postrender'], this.postcomposeBind_);
      }
    } else {
      for (i = 0; i < this.layers_.length; i++) {
        this.layers_[i].un(['precompose', 'prerender'], this.precomposeBind_);
        this.layers_[i].un(['postcompose', 'postrender'], this.postcomposeBind_);
      }
    }
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
}

export default ol_interaction_Clip
