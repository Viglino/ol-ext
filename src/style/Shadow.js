/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*
*  Shadow image style for point vector features
*/

import ol_style_Fill from 'ol/style/Fill.js'
import ol_style_RegularShape from 'ol/style/RegularShape.js'

/**
 * @classdesc
 * Set Shadow style for point vector features.
 *
 * @constructor
 * @param {} options Options.
 *  @param {ol.style.Fill | undefined} options.fill fill style, default rgba(0,0,0,0.5)
 *  @param {number} options.radius point radius
 * 	@param {number} options.blur lur radius, default radius/3
 *  @param {Array<number>} [options.displacement] to use with ol > 6
 * 	@param {number} [options.offsetX=0] Horizontal offset in pixels, deprecated use displacement with ol>6
 * 	@param {number} [options.offsetY=0] Vertical offset in pixels, deprecated use displacement with ol>6
 * @extends {ol_style_RegularShape}
 * @api
 */
var ol_style_Shadow = class olstyleShadow extends ol_style_RegularShape {
  constructor(options) {
    options = options || {};
    super({
      radius: options.radius,
      fill: options.fill,
      displacement: options.displacement
    });

    this._fill = options.fill || new ol_style_Fill({ color: "rgba(0,0,0,0.5)" });
    this._radius = options.radius;
    this._blur = options.blur === 0 ? 0 : options.blur || options.radius / 3;
    this._offset = [options.offsetX ? options.offsetX : 0, options.offsetY ? options.offsetY : 0];
    if (!options.displacement) options.displacement = [options.offsetX || 0, -options.offsetY || 0];

    // ol < 6
    if (!this.setDisplacement)
      this.getImage();
  }
  /**
   * Clones the style.
   * @return {ol_style_Shadow}
   */
  clone() {
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
  }
  /**
   * Get the image icon.
   * @param {number} pixelRatio Pixel ratio.
   * @return {HTMLCanvasElement} Image or Canvas element.
   * @api
   */
  getImage(pixelratio) {
    pixelratio = pixelratio || 1;

    var radius = this._radius;

    var canvas = super.getImage(pixelratio);

    // Remove the circle on the canvas
    var context = (canvas.getContext('2d'));

    context.save();
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.setTransform(pixelratio, 0, 0, pixelratio, 0, 0);

    context.scale(1, 0.5);
    context.arc(radius, -radius, radius - this._blur, 0, 2 * Math.PI, false);
    context.fillStyle = '#000';

    context.shadowColor = this._fill.getColor();
    context.shadowBlur = 0.7 * this._blur * pixelratio;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 1.5 * radius * pixelratio;

    context.closePath();
    context.fill();

    context.shadowColor = 'transparent';
    context.restore();

    // Set anchor
    if (!this.getDisplacement) {
      var a = this.getAnchor();
      a[0] = canvas.width / 2 - this._offset[0];
      a[1] = canvas.height / 2 - this._offset[1];
    }

    return canvas;
  }
}

export default ol_style_Shadow
