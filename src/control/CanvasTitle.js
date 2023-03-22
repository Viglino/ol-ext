/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {asString as ol_color_asString} from 'ol/color.js'

import ol_control_CanvasBase from './CanvasBase.js'
import ol_ext_element from '../util/element.js'

/**
 * A title Control integrated in the canvas (for jpeg/png export purposes).
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options extend the ol.control options. 
 *  @param {string} [options.title] the title, default 'Title'
 *  @param {boolean} [options.visible=true]
 *  @param {ol_style_Style} [options.style] style used to draw the title (with a text).
 */
var ol_control_CanvasTitle = class olcontrolCanvasTitle extends ol_control_CanvasBase {
  constructor(options) {
    options = options || {};

    var elt = ol_ext_element.create('DIV', {
      className: (options.className || '') + ' ol-control-title ol-unselectable',
      style: {
        display: 'block',
        visibility: 'hidden'
      }
    });

    super({
      element: elt,
      style: options.style
    });

    this.setTitle(options.title || '');
    this.setVisible(options.visible !== false);
    this.element.style.font = this.getTextFont();
  }
  /**
   * Change the control style
   * @param {ol_style_Style} style
   */
  setStyle(style) {
    super.setStyle(style);
    // Element style
    if (this.element) {
      this.element.style.font = this.getTextFont();
    }
    // refresh
    if (this.getMap()) this.getMap().render();
  }
  /**
   * Set the map title
   * @param {string} map title.
   * @api stable
   */
  setTitle(title) {
    this.element.textContent = title;
    this.set('title', title);
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /**
   * Get the map title
   * @param {string} map title.
   * @api stable
   */
  getTitle() {
    return this.get('title');
  }
  /**
   * Set control visibility
   * @param {bool} b
   * @api stable
   */
  setVisible(b) {
    this.element.style.display = (b ? 'block' : 'none');
    if (this.getMap()) {
      try { this.getMap().renderSync(); } catch (e) { /* ok */ }
    }
  }
  /**
   * Get control visibility
   * @return {bool}
   * @api stable
   */
  getVisible() {
    return this.element.style.display !== 'none';
  }
  /** Draw title in the final canvas
   * @private
  */
  _draw(e) {
    if (!this.getVisible())
      return;
    var ctx = this.getContext(e);
    if (!ctx)
      return;

    // Retina device
    var ratio = e.frameState.pixelRatio;
    ctx.save();
    ctx.scale(ratio, ratio);
    // Position
    var eltRect = this.element.getBoundingClientRect();
    var mapRect = this.getMap().getViewport().getBoundingClientRect();
    var sc = this.getMap().getSize()[0] / mapRect.width;
    ctx.translate(
      Math.round((eltRect.left - mapRect.left) * sc),
      Math.round((eltRect.top - mapRect.top) * sc)
    );

    var h = this.element.clientHeight;
    var w = this.element.clientWidth;
    var left = w / 2;

    ctx.beginPath();
    ctx.fillStyle = ol_color_asString(this.getFill().getColor());
    ctx.rect(0, 0, w, h);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = ol_color_asString(this.getTextFill().getColor());
    ctx.strokeStyle = ol_color_asString(this.getTextStroke().getColor());
    ctx.lineWidth = this.getTextStroke().getWidth();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = this.getTextFont();
    ctx.lineJoin = 'round';
    if (ctx.lineWidth) ctx.strokeText(this.getTitle(), left, h / 2);
    ctx.fillText(this.getTitle(), left, h / 2);
    ctx.closePath();

    ctx.restore();
  }
}

export default ol_control_CanvasTitle
