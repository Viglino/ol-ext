import ol_ext_inherits from '../util/ext'
import ol_interaction_Pointer from 'ol/interaction/Pointer'

/** Clip interaction to clip layers in a circle
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol_interaction_ClipMap.options} options flashlight  param
 *  @param {number} options.radius radius of the clip, default 100 (px)
 */
var ol_interaction_ClipMap = function(options) {

  this.layers_ = [];
  
  ol_interaction_Pointer.call(this, {
    handleDownEvent: this._clip,
    handleMoveEvent: this._clip
  });

  // Default options
  options = options || {};

  this.pos = false;
  this.radius = (options.radius||100);
  this.pos = [-1000, -1000];
};
ol_ext_inherits(ol_interaction_ClipMap, ol_interaction_Pointer);

/** Set the map > start postcompose
*/
ol_interaction_ClipMap.prototype.setMap = function(map) {
  if (this.getMap()) {
    if (this._listener) ol_Observable_unByKey(this._listener);
    var layerDiv = this.getMap().getViewport().querySelector('.ol-layers');
    layerDiv.style.clipPath = ''; 
  }

  ol_interaction_Pointer.prototype.setMap.call(this, map);

  if (map) {
    this._listener = map.on('change:size', this._clip.bind(this));
  }
};

/** Set clip radius
 *	@param {integer} radius
 */
ol_interaction_ClipMap.prototype.setRadius = function(radius) {
  this.radius = radius;
  this._clip();
};

/** Get clip radius
 *	@returns {integer} radius
 */
ol_interaction_ClipMap.prototype.getRadius = function() {
  return this.radius;
};

/** Set position of the clip
 * @param {ol.coordinate} coord
 */
ol_interaction_ClipMap.prototype.setPosition = function(coord) {
  if (this.getMap()) {
    this.pos = this.getMap().getPixelFromCoordinate(coord);
    this._clip();
  }
};

/** Get position of the clip
 * @returns {ol.coordinate}
 */
ol_interaction_ClipMap.prototype.getPosition = function() {
  if (this.pos) return this.getMap().getCoordinateFromPixel(this.pos);
  return null;
};

/** Set position of the clip
 * @param {ol.Pixel} pixel
 */
 ol_interaction_ClipMap.prototype.setPixelPosition = function(pixel) {
  this.pos = pixel;
  this._clip();
};

/** Get position of the clip
 * @returns {ol.Pixel} pixel
 */
 ol_interaction_ClipMap.prototype.getPixelPosition = function() {
  return this.pos;
};

/** Set position of the clip
 * @param {ol.MapBrowserEvent} e
 * @privata
 */
ol_interaction_ClipMap.prototype._setPosition = function(e) {
  if (e.type==='pointermove' && this.get('action')==='onclick') return;
  if (e.pixel) {
    this.pos = e.pixel;
  }
  if (this.getMap()) {
    try { this.getMap().renderSync(); } catch(e) { /* ok */ }
  }
};

/** Clip
 * @private
 */
 ol_interaction_ClipMap.prototype._clip = function(e) {
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
};

export default ol_interaction_ClipMap
