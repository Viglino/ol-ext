/*
  Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_particule_Base from './Base'

/** A cloud particule to display clouds over the map
 * @constructor
 * @extends {ol_particule_Base}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} coordinate the position of the particule
 */
var ol_particule_Cloud = function(options) {
  if (!options) options = {};
  
  ol_particule_Base.call(this, options);

  this.fog = [];
  for (var k=0; k<7; k++) {
    this.fog.push([ (Math.random()*15 +15) * (Math.random()>.5 ? 1:-1), (Math.random()*15 +15) * (Math.random()>.5 ? 1:-1) ]);
  }

  var canvas = document.createElement('CANVAS');
  canvas.width = 100;
  canvas.height = 100;
  var ctx = canvas.getContext('2d');
  var grd = this.gradient = ctx.createRadialGradient(50,50, 0, 50,50, 50);
  grd.addColorStop(0, 'rgba(255,255,255,.2');
  grd.addColorStop(1, 'rgba(255,255,255,0');

  this.image = canvas;
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,canvas.width,canvas.height);

};
ol_ext_inherits(ol_particule_Cloud, ol_particule_Base);

/** Set the particule overlay
 * @param {ol.Overlay} overl
 * /
ol_particule_Base.prototype.setOverlay = function(overlay) {

};

/** Draw the particule
 * @param {CanvasRenderingContext2D } ctx
 */
ol_particule_Cloud.prototype.draw = function(ctx) {
  this.fog.forEach(function(f) {
    ctx.save();
      ctx.translate (this.coordinate[0]+f[0], this.coordinate[1]+f[1]);
      ctx.drawImage(this.image, -50, -50);
    ctx.restore();
  }.bind(this))
};

/** Update the particule
 * @param {number} dt timelapes since last call
 */
ol_particule_Cloud.prototype.update = function(dt) {
  var speed = this.getOverlay().get('speed') * dt / this.getOverlay()._fps;
  var angle = this.getOverlay().get('angle');
  this.coordinate[0] += speed * Math.cos(angle);
  this.coordinate[1] += speed * Math.sin(angle);
};

export default ol_particule_Cloud
