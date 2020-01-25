/*
  Copyright (c) 2020 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_ext_inherits from '../util/ext'
import ol_particule_Base from './Base'

/** Raindrop particules to display clouds over the map
 * @constructor
 * @extends {ol_particule_Base}
 * @param {*} options
 *  @param {ol.Overlay} options.overlay
 *  @param {ol.pixel} coordinate the position of the particule
 */
var ol_particule_RainDrop = function(options) {
  if (!options) options = {};
  
  ol_particule_Base.call(this, options);

  this.size = 0;

  // Drops
  var canvas = document.createElement('CANVAS');
  canvas.width = 100;
  canvas.height = 100;
  var ctx = canvas.getContext('2d');
  var grd = ctx.createRadialGradient(50,50, 0, 50,50, 50);
  grd.addColorStop(0, 'rgba(128,128,192,.8');
  grd.addColorStop(1, 'rgba(128,128,192,0');

  this.image = canvas;
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,canvas.width,canvas.height);
};
ol_ext_inherits(ol_particule_RainDrop, ol_particule_Base);

/** Draw the particule
 * @param {CanvasRenderingContext2D } ctx
 */
ol_particule_RainDrop.prototype.draw = function(ctx) {
  if (this.size>0) {
    ctx.save();
      ctx.translate (this.coordinate[0], this.coordinate[1]);
      ctx.globalAlpha = this.size/50;
      ctx.scale(1-this.size/50,1-this.size/50);
      ctx.drawImage(this.image, -50,-50);
    ctx.restore();
  }
};

/** Update the particule
 * @param {number} dt timelapes since last call
 */
ol_particule_RainDrop.prototype.update = function(dt) {
  if (this.size>0 || Math.random() < .01) {
    if (this.size<=0) {
      this.size = 50;
      this.coordinates = this.getRandomCoord();
    }
    this.size = this.size - Math.round(dt/20);
  }
};

export default ol_particule_RainDrop
