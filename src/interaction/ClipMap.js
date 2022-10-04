import ol_interaction_Pointer from 'ol/interaction/Pointer.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'

/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol_interaction_ClipMap.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100 (px)
 */
var ol_interaction_ClipMap = class olinteractionClipMap extends ol_interaction_Pointer {
  constructor(options) {
    super({
      handleDownEvent: function(e) { return this._clip(e) },
      handleMoveEvent: function(e) { return this._clip(e) },
    });

    // Default options
    options = options || {};
    this.layers_ = [];

    this.pos = false;
    this.radius = (options.radius || 100);
    this.pos = [-1000, -1000];
  }
  /** Set the map > start postcompose
  */
  setMap(map) {
    if (this.getMap()) {
      if (this._listener)
        ol_Observable_unByKey(this._listener);
      var layerDiv = this.getMap().getViewport().querySelector('.ol-layers');
      layerDiv.style.clipPath = '';
    }

    super.setMap(map);

    if (map) {
      this._listener = map.on('change:size', this._clip.bind(this));
    }
  }
  /** Set clip radius
   *	@param {integer} radius
   */
  setRadius(radius) {
    this.radius = radius;
    this._clip();
  }
  /** Get clip radius
   *	@returns {integer} radius
   */
  getRadius() {
    return this.radius;
  }
  /** Set position of the clip
   * @param {ol.coordinate} coord
   */
  setPosition(coord) {
    if (this.getMap()) {
      this.pos = this.getMap().getPixelFromCoordinate(coord);
      this._clip();
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
    this._clip();
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
    if (e.type === 'pointermove' && this.get('action') === 'onclick')
      return;
    if (e.pixel) {
      this.pos = e.pixel;
    }
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /** Clip
   * @private
   */
  _clip(e) {
    if (e && e.pixel) {
      this.pos = e.pixel;
    }

    if (this.pos && this.getMap()) {
      var layerDiv = this.getMap().getViewport().querySelector('.ol-layers');
      layerDiv.style.clipPath = 'circle('
        + this.getRadius() + 'px' // radius
        + ' at '
        + this.pos[0] + 'px '
        + this.pos[1] + 'px)';
    }
  }
}

export default ol_interaction_ClipMap
