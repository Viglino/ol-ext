/*
  Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_Object from 'ol/Object'

/*global ol*/
if (window.ol && !ol.particule) {
  ol.particule = {};
}
  
/** Abstract base class; normally only used for creating subclasses. 
 * An object with coordinates, draw and update
 * @constructor
 * @extends {ol_Object}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} coordinate the position of the particule
 */
var ol_particule_Base = function(options) {
  if (!options) options = {};
  
  ol_Object.call(this);
  this.setOverlay(options.overlay) ;
  this.coordinate = options.coordinate || [0,0];
};
ol_ext_inherits(ol_particule_Base, ol_Object);

/** Set the particule overlay
 * @param {ol.Overlay} overl
 */
ol_particule_Base.prototype.setOverlay = function(overlay) {
  this._overlay = overlay;
};

/** Get the particule overlay
 * @return {ol.Overlay}
 */
ol_particule_Base.prototype.getOverlay = function() {
  return this._overlay;
};

/** Draw the particule
 * @param { CanvasRenderingContext2D } ctx
 */
ol_particule_Base.prototype.draw = function(/* ctx */) {
};

/** Update the particule
 * @param {number} dt timelapes since last call
 */
ol_particule_Base.prototype.update = function(/* dt */) {
};

/** Update the particule
 * @param {number} dt timelapes since last call
 */
ol_particule_Base.prototype.getRandomCoord = function(dt) {
  if (this.getOverlay().randomCoord) return this.getOverlay().randomCoord();
  else return [dt,0];
};

export default ol_particule_Base
