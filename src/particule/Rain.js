/*
  Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_particule_Base from './Base.js'

/** Rain particules to display clouds over the map
 * @constructor
 * @extends {ol_particule_Base}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} options.coordinate the position of the particule
 */
var ol_particule_Rain = class olparticuleRain extends ol_particule_Base {
  constructor(options) {
    options = options || {};

    super(options);

    this.z = Math.floor(Math.random() * 5) + 1;

    var canvas = document.createElement('CANVAS');
    canvas.width = 50;
    canvas.height = 50;
    var ctx = canvas.getContext('2d');
    this.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    this.gradient.addColorStop(0, 'rgba(0,0,80,0)');
    this.gradient.addColorStop(1, 'rgba(0,0,80,.3)');

  }
  /** Draw the particule
   * @param {CanvasRenderingContext2D } ctx
   */
  draw(ctx) {
    ctx.save();
    var angle = this.getOverlay().get('angle');
    ctx.beginPath();
    var x1 = Math.cos(angle) * 10 * (1 + this.z / 2);
    var y1 = Math.sin(angle) * 10 * (1 + this.z / 2);
    ctx.lineWidth = Math.round(this.z / 2);
    ctx.strokeStyle = this.gradient;
    ctx.translate(this.coordinate[0], this.coordinate[1]);
    ctx.moveTo(0, 0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  }
  /** Update the particule
   * @param {number} dt timelapes since last call
   */
  update(dt) {
    var dl = this.getOverlay().get('speed') * dt / this.getOverlay()._fps * this.z;
    var angle = this.getOverlay().get('angle');
    this.coordinate[0] += dl * Math.cos(angle);
    this.coordinate[1] += dl * Math.sin(angle);
  }
}

export default ol_particule_Rain
