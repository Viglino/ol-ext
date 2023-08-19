/*
  Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_Object from 'ol/Object.js'
  
/** Abstract base class; normally only used for creating subclasses. 
 * An object with coordinates, draw and update
 * @constructor
 * @extends {ol_Object}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} options.coordinate the position of the particule
 */
var ol_particule_Base = class olparticuleBase extends ol_Object {
  constructor(options) {
    options = options || {};

    super(options);

    this.setOverlay(options.overlay);
    this.coordinate = options.coordinate || [0, 0];
  }
  /** Set the particule overlay
   * @param {ol.Overlay} overl
   */
  setOverlay(overlay) {
    this._overlay = overlay;
  }
  /** Get the particule overlay
   * @return {ol.Overlay}
   */
  getOverlay() {
    return this._overlay;
  }
  /** Draw the particule
   * @param { CanvasRenderingContext2D } ctx
   */
  draw( /* ctx */) {
  }
  /** Update the particule
   * @param {number} dt timelapes since last call
   */
  update( /* dt */) {
  }
  /** Update the particule
   * @param {number} dt timelapes since last call
   */
  getRandomCoord(dt) {
    if (this.getOverlay().randomCoord)
      return this.getOverlay().randomCoord();
    else
      return [dt, 0];
  }
}

export default ol_particule_Base
