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
var ol_particule_Snow = class olparticuleSnow extends ol_particule_Base {
  constructor(options) {
    options = options || {};

    super(options);

    this.z = (Math.floor(Math.random() * 5) + 1) / 5;
    this.angle = Math.random() * Math.PI;

    // Snow fakes
    var canvas = document.createElement('CANVAS');
    canvas.width = 20;
    canvas.height = 20;
    var ctx = canvas.getContext('2d');
    var grd = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
    grd.addColorStop(0, "rgba(255, 255, 255,1)"); // white
    grd.addColorStop(.8, "rgba(210, 236, 242,.8)"); // bluish
    grd.addColorStop(1, "rgba(237, 247, 249,0)"); // lighter bluish

    this.image = canvas;
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  /** Draw the particule
   * @param {CanvasRenderingContext2D } ctx
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.coordinate[0], this.coordinate[1]);
    ctx.globalAlpha = .4 + this.z / 2;
    ctx.scale(this.z, this.z);
    ctx.drawImage(this.image, -10, -10);
    ctx.restore();
  }
  /** Update the particule
   * @param {number} dt timelapes since last call
   */
  update(dt) {
    var speed = this.getOverlay().get('speed') * dt / this.getOverlay()._fps * this.z * 5;
    var angle = this.getOverlay().get('angle');
    this.angle = this.angle + dt / this.getOverlay()._fps / 100;
    this.coordinate[0] += Math.sin(this.angle + this.z) * 2 + speed * Math.cos(angle);
    this.coordinate[1] += Math.cos(this.angle) + speed * Math.sin(angle);
  }
}

export default ol_particule_Snow
