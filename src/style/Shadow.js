/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Shadow image style for point vector features
*/

import ol_ext_inherits from '../util/ext'
import ol_style_Fill from 'ol/style/Fill'
import ol_style_RegularShape from 'ol/style/RegularShape'

/**
 * @classdesc
 * Set Shadow style for point vector features.
 *
 * @constructor
 * @param {} options Options.
 *  @param {ol.style.Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
 *  @param {number} options.radius point radius
 * 	@param {number} options.blur lur radius, default radius/3
 * 	@param {number} options.offsetX x offset, default 0
 * 	@param {number} options.offsetY y offset, default 0
 * @extends {ol_style_RegularShape}
 * @api
 */
var ol_style_Shadow = function(options) {
  options = options || {};
  if (!options.fill) options.fill = new ol_style_Fill({ color: "rgba(0,0,0,0.5)" });
  ol_style_RegularShape.call (this,{ radius: options.radius, fill: options.fill });

  this._fill = options.fill;
  this._radius = options.radius;
  this._blur = options.blur===0 ? 0 : options.blur || options.radius/3;
  this._offset = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];

  this.renderShadow_();
};
ol_ext_inherits(ol_style_Shadow, ol_style_RegularShape);

/**
 * Clones the style. 
 * @return {ol_style_Shadow}
 */
ol_style_Shadow.prototype.clone = function() {
  var s = new ol_style_Shadow({
    fill: this._fill,
    radius: this._radius,
    blur: this._blur,
    offsetX: this._offset[0],
    offsetY: this._offset[1]
  });
  s.setScale(this.getScale());
  s.setOpacity(this.getOpacity());
  return s;
};

/**
 * @private
 */
ol_style_Shadow.prototype.renderShadow_ = function(pixelratio) {	
  if (!pixelratio) {
    if (this.getPixelRatio) {
      pixelratio = window.devicePixelRatio;
      this.renderShadow_(pixelratio);
      if (this.getPixelRatio && pixelratio!==1) this.renderShadow_(1); 
    } else {
      this.renderShadow_(1);
    }
    return;
  }

  var radius = this._radius;
  
  var canvas = this.getImage(pixelratio);
  // Remove the circle on the canvas
  var context = (canvas.getContext('2d'));

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.beginPath();
    context.setTransform(pixelratio, 0, 0, pixelratio, 0, 0);

    context.scale(1,0.5);
    context.arc(radius, -radius, radius-this._blur, 0, 2 * Math.PI, false);
    context.fillStyle = '#000';

    context.shadowColor = this._fill.getColor();
    context.shadowBlur = 0.7*this._blur*pixelratio;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 1.5*radius*pixelratio;

  context.closePath();
  context.fill();

  context.shadowColor = 'transparent';
  context.restore();
    
  // Set anchor
  var a = this.getAnchor();
  a[0] = canvas.width /2 - this._offset[0];
  a[1] = canvas.height /2 - this._offset[1];
}

export default ol_style_Shadow
