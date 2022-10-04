/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_control_CanvasBase from './CanvasBase.js'
import ol_style_Style from 'ol/style/Style.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_ext_element from '../util/element.js';

/**
 * Draw a compass on the map. The position/size of the control is defined in the css.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options Control options. The style {_ol_style_Stroke_} option is usesd to draw the text.
 *  @param {string} options.className class name for the control
 *  @param {boolean} [options.visible=true]
 *  @param {Image} options.image an image, default use the src option or a default image
 *  @param {string} options.src image src or 'default' or 'compact', default use the image option or a default image
 *  @param {boolean} options.rotateVithView rotate vith view (false to show watermark), default true
 *  @param {ol_style_Stroke} options.style style to draw the lines, default draw no lines
 */
var ol_control_Compass = class olcontrolCompass extends ol_control_CanvasBase {
  constructor(options) {
    options = options || {};

    // Initialize parent
    var elt = document.createElement("div");
    elt.className = "ol-control ol-compassctrl ol-unselectable ol-hidden" + (options.className ? " " + options.className : "");
    elt.style.position = "absolute";
    elt.style.visibility = "hidden";

    var style = (options.style instanceof ol_style_Stroke) ? new ol_style_Style({ stroke: options.style }) : options.style;
    if (!options.style) {
      style = new ol_style_Style({ stroke: new ol_style_Stroke({ width: 0 }) });
    }
    super({
      element: elt,
      style: style
    });

    this.set('rotateVithView', options.rotateWithView !== false);
    this.setVisible(options.visible !== false);

    this.setImage(options.image || options.src);
  }
  /** Set compass image
   * @param {Image|string} [img=default] the image or an url or 'compact' or 'default'
   */
  setImage(img) {
    // The image
    if (img instanceof Image) {
      this.img_ = img;
      this.img_.onload = function () {
        if (this.getMap()) {
          try { this.getMap().renderSync(); } catch (e) { /* ok */ }
        }
      }.bind(this);
    } else if (typeof (img) === 'string') {
      // Load source
      switch (img) {
        case 'compact': {
          this.img_ = this.compactCompass_(this.element.clientWidth, this.getStroke().getColor());
          break;
        }
        case 'default': {
          this.img_ = this.defaultCompass_(this.element.clientWidth, this.getStroke().getColor());
          break;
        }
        default: {
          this.img_ = new Image();
          this.img_.onload = function () {
            if (this.getMap()) {
              try { this.getMap().renderSync(); } catch (e) { /* ok */ }
            }
          }.bind(this);
          this.img_.src = img;
          break;
        }
      }
    } else {
      this.img_ = this.defaultCompass_(this.element.clientWidth, this.getStroke().getColor());
    }
  }
  /** Create a default image.
   * @param {number} s the size of the compass
   * @private
   */
  compactCompass_(s, color) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    s = canvas.width = canvas.height = s || 150;
    var r = s / 2;

    ctx.translate(r, r);
    ctx.fillStyle = color || '#963';
    ctx.lineWidth = 5;
    ctx.lineJoin = ctx.lineCap = 'round';

    ctx.font = 'bold ' + (r * 0.4) + 'px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#fff';
    ctx.globalAlpha = .75;
    ctx.strokeText('N', 0, -r / 2);
    ctx.globalAlpha = 1;
    ctx.fillText('N', 0, -r / 2);
    ctx.beginPath();
    ctx.moveTo(0, r / 4);
    ctx.lineTo(r / 3, r / 2);
    ctx.lineTo(0, -r / 2);
    ctx.lineTo(-r / 3, r / 2);
    ctx.lineTo(0, r / 4);
    ctx.lineWidth = 12;
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = .75;
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = ctx.strokeStyle = color || '#963';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, r / 4);
    ctx.lineTo(0, -r / 2);
    ctx.lineTo(r / 3, r / 2);
    ctx.lineTo(0, r / 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, r / 4);
    ctx.lineTo(0, -r / 2);
    ctx.lineTo(-r / 3, r / 2);
    ctx.lineTo(0, r / 4);
    ctx.stroke();

    return canvas;
  }
  /** Create a default image.
   * @param {number} s the size of the compass
   * @private
   */
  defaultCompass_(s, color) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    s = canvas.width = canvas.height = s || 150;
    var r = s / 2;
    var r2 = 0.22 * r;

    function draw(r, r2) {
      ctx.fillStyle = color || "#963";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0); ctx.lineTo(r2, r2); ctx.moveTo(0, 0);
      ctx.lineTo(-r, 0); ctx.lineTo(-r2, -r2); ctx.moveTo(0, 0);
      ctx.lineTo(0, r); ctx.lineTo(-r2, r2); ctx.moveTo(0, 0);
      ctx.lineTo(0, -r); ctx.lineTo(r2, -r2); ctx.moveTo(0, 0);
      ctx.fill();
      ctx.stroke();
    }

    function draw2(r, r2) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0); ctx.lineTo(r2, -r2); ctx.moveTo(0, 0);
      ctx.lineTo(-r, 0); ctx.lineTo(-r2, r2); ctx.moveTo(0, 0);
      ctx.lineTo(0, r); ctx.lineTo(r2, r2); ctx.moveTo(0, 0);
      ctx.lineTo(0, -r); ctx.lineTo(-r2, -r2); ctx.moveTo(0, 0);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0); ctx.lineTo(r2, -r2); ctx.moveTo(0, 0);
      ctx.lineTo(-r, 0); ctx.lineTo(-r2, r2); ctx.moveTo(0, 0);
      ctx.lineTo(0, r); ctx.lineTo(r2, r2); ctx.moveTo(0, 0);
      ctx.lineTo(0, -r); ctx.lineTo(-r2, -r2); ctx.moveTo(0, 0);
      ctx.stroke();
    }

    ctx.translate(r, r);
    ctx.strokeStyle = color || "#963";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.41, 0, 2 * Math.PI);
    ctx.arc(0, 0, s * 0.44, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.rotate(Math.PI / 4);
    draw(r * 0.9, r2 * 0.8);
    draw2(r * 0.9, r2 * 0.8);

    ctx.rotate(-Math.PI / 4);
    draw(r, r2);
    draw2(r, r2);

    return canvas;
  }
  /** Get control visibility
   * @return {boolean}
   */
  getVisible() {
    return ol_ext_element.getStyle(this.element, 'display') === 'block';
  }
  /** Set visibility
   * @param {boolean} b
   */
  setVisible(b) {
    if (b)
      this.element.classList.add('ol-visible');
    else
      this.element.classList.remove('ol-visible');
    if (this.getMap())
      this.getMap().render();
  }
  /** Draw compass
  * @param {ol.event} e postcompose event
  * @private
  */
  _draw(e) {
    var ctx = this.getContext(e);
    if (!ctx || !this.getVisible())
      return;
    var canvas = ctx.canvas;

    // 8 angles
    var i, da = [];
    for (i = 0; i < 8; i++)
      da[i] = [Math.cos(Math.PI * i / 8), Math.sin(Math.PI * i / 8)];

    // Retina device
    var ratio = e.frameState.pixelRatio;
    ctx.save();
    ctx.scale(ratio, ratio);

    var w = this.element.clientWidth;
    var h = this.element.clientHeight;
    var pos = { left: this.element.offsetLeft, top: this.element.offsetTop };

    var compass = this.img_;
    var rot = e.frameState.viewState.rotation;

    ctx.beginPath();
    ctx.translate(pos.left + w / 2, pos.top + h / 2);
    if (this.get('rotateVithView'))
      ctx.rotate(rot);
    if (this.getStroke().getWidth()) {
      ctx.beginPath();
      ctx.strokeStyle = this.getStroke().getColor();
      ctx.lineWidth = this.getStroke().getWidth();
      var m = Math.max(canvas.width, canvas.height);
      for (i = 0; i < 8; i++) {
        ctx.moveTo(-da[i][0] * m, -da[i][1] * m);
        ctx.lineTo(da[i][0] * m, da[i][1] * m);
      }
      ctx.stroke();
    }

    if (compass.width) {
      ctx.drawImage(compass, -w / 2, -h / 2, w, h);
    }

    ctx.closePath();

    ctx.restore();
  }
}

export default ol_control_Compass