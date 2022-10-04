/*
  Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_particule_Base from './Base.js'

/** A cloud particule to display clouds over the map
 * @constructor
 * @extends {ol_particule_Base}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} options.coordinate the position of the particule
 */
var ol_particule_Cloud = class olparticuleCloud extends ol_particule_Base {
  constructor(options) {
    options = options || {};

    super(options);

    this.set('size', [100, 100]);
    var canvas = document.createElement('CANVAS');
    canvas.width = 200;
    canvas.height = 200;
    var ctx = canvas.getContext('2d');
    var grd = this.gradient = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
    grd.addColorStop(0, 'rgba(255,255,255,.2');
    grd.addColorStop(1, 'rgba(255,255,255,0');

    // Create cloud image
    this.image = canvas;
    for (var k = 0; k < 7; k++) {
      ctx.save();
      var x = Math.random() * 100;
      var y = Math.random() * 100;
      ctx.translate(x, y);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }
  /** Draw the particule
   * @param {CanvasRenderingContext2D } ctx
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.coordinate[0], this.coordinate[1]);
    ctx.drawImage(this.image, -this.image.width / 2, -this.image.width / 2);
    ctx.restore();
  }
  /** Update the particule
   * @param {number} dt timelapes since last call
   */
  update(dt) {
    var speed = this.getOverlay().get('speed') * dt / this.getOverlay()._fps;
    var angle = this.getOverlay().get('angle');
    this.coordinate[0] += speed * Math.cos(angle);
    this.coordinate[1] += speed * Math.sin(angle);
  }
}

export default ol_particule_Cloud
