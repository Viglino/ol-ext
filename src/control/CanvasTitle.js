/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_ext_inherits from '../util/ext'
import {asString as ol_color_asString} from 'ol/color'

import ol_control_CanvasBase from './CanvasBase'
import ol_ext_element from '../util/element'

/**
 * A title Control integrated in the canvas (for jpeg/png export purposes).
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options extend the ol.control options. 
 *  @param {string} options.title the title, default 'Title'
 *  @param {ol_style_Style} options.style style used to draw the title.
 */
var ol_control_CanvasTitle = function(options) {
  if (!options) options = {};
  
  var elt = ol_ext_element.create('DIV', {
    className: (options.className || '') + ' ol-control-title ol-unselectable',
    style: {
      display: 'block',
      visibility: 'hidden'
    }
  });

  ol_control_CanvasBase.call(this, {
    element: elt,
    style: options.style
  });

  this.setTitle(options.title || '');
  this.setVisible(options.visible);
  this.element.style.font = this.getTextFont();
};
ol_ext_inherits(ol_control_CanvasTitle, ol_control_CanvasBase);

/**
 * Change the control style
 * @param {ol_style_Style} style
 */
ol_control_CanvasTitle.prototype.setStyle = function (style) {
  ol_control_CanvasBase.prototype.setStyle.call(this, style);
  // Element style
  if (this.element) {
    this.element.style.font = this.getTextFont();
  }
  // refresh
  if (this.getMap()) this.getMap().render();
};

/**
 * Set the map title 
 * @param {string} map title.
 * @api stable
 */
ol_control_CanvasTitle.prototype.setTitle = function (title) {
  this.element.textContent = title;
  this.set('title', title);
  if (this.getMap()) {
    try { this.getMap().renderSync(); } catch(e) { /* ok */ }
  }
};

/**
 * Get the map title 
 * @param {string} map title.
 * @api stable
 */
ol_control_CanvasTitle.prototype.getTitle = function () {
  return this.get('title');
};

/**
 * Set control visibility
 * @param {bool} b
 * @api stable
 */
ol_control_CanvasTitle.prototype.setVisible = function (b) {
  this.element.style.display = (b ? 'block' : 'none');
  if (this.getMap()) {
    try { this.getMap().renderSync(); } catch(e) { /* ok */ }
  }
};

/**
 * Get control visibility
 * @return {bool} 
 * @api stable
 */
ol_control_CanvasTitle.prototype.getVisible = function () {
  return this.element.style.display !== 'none';
};

/** Draw title in the final canvas
 * @private
*/
ol_control_CanvasTitle.prototype._draw = function(e) {
  if (!this.getVisible()) return;
  var ctx = this.getContext(e);
	if (!ctx) return;
  
  // Retina device
  var ratio = e.frameState.pixelRatio;
  ctx.save();
  ctx.scale(ratio,ratio);
  // Position
  var eltRect = this.element.getBoundingClientRect();
  var mapRect = this.getMap().getViewport().getBoundingClientRect();
  var sc = this.getMap().getSize()[0] / mapRect.width;
  ctx.translate(
    Math.round((eltRect.left-mapRect.left)*sc), 
    Math.round((eltRect.top-mapRect.top)*sc)
  );

  var h = this.element.clientHeight;
  var w = this.element.clientWidth;
  var left = w/2;

  ctx.beginPath();
  ctx.fillStyle = ol_color_asString(this.getFill().getColor());
  ctx.rect(0,0, w, h);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = ol_color_asString(this.getTextFill().getColor());
  ctx.strokeStyle = ol_color_asString(this.getTextStroke().getColor());
  ctx.lineWidth = this.getTextStroke().getWidth();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = this.getTextFont();
  if (ctx.lineWidth) ctx.strokeText(this.getTitle(), left, h/2);
  ctx.fillText(this.getTitle(), left, h/2);
  ctx.closePath();

  ctx.restore();
};

export default ol_control_CanvasTitle
