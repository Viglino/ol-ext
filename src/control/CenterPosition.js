/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {asString as ol_color_asString} from 'ol/color.js'
import {toStringXY as ol_coordinate_toStringXY} from 'ol/coordinate.js'
import {transform as ol_proj_transform} from 'ol/proj.js'

import ol_control_CanvasBase from './CanvasBase.js'
import ol_ext_element from '../util/element.js'

/**
 * A Control to display map center coordinates on the canvas.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @param {Object=} options extend the ol.control options. 
 *  @param {string} options.className CSS class name
 *  @param {ol.style.Style} options.style style used to draw in the canvas
 *  @param {ol.proj.ProjectionLike} options.projection	Projection. Default is the view projection.
 *  @param {ol.coordinate.CoordinateFormat} options.coordinateFormat A function that takes a ol.Coordinate and transforms it into a string.
 *  @param {boolean} options.canvas true to draw in the canvas
 */
var ol_control_CenterPosition = class olcontrolCenterPosition extends ol_control_CanvasBase {
  constructor(options) {
    options = options || {}

    var elt = ol_ext_element.create('DIV', {
      className: (options.className || '') + ' ol-center-position ol-unselectable',
      style: {
        display: 'block',
        visibility: 'hidden'
      }
    })

    super({
      element: elt,
      style: options.style
    })

    this.element.style.font = this.getTextFont()
    this.set('projection', options.projection)
    this.setCanvas(options.canvas)
    this._format = (typeof options.coordinateFormat === 'function') ? options.coordinateFormat : ol_coordinate_toStringXY
  }
  /**
   * Change the control style
   * @param {ol_style_Style} style
   */
  setStyle(style) {
    super.setStyle(style)
    // Element style
    if (this.element) {
      this.element.style.font = this.getTextFont()
    }
    // refresh
    if (this.getMap()) this.getMap().render()
  }
  /**
   * Draw on canvas
   * @param {boolean} b draw the attribution on canvas.
   */
  setCanvas(b) {
    this.set('canvas', b)
    this.element.style.visibility = b ? "hidden" : "visible"
    if (this.getMap()) {
      try { this.getMap().renderSync()}  catch (e) { /* ok */ }
    }
  }
  /**
   * Set control visibility
   * @param {bool} b
   * @api stable
   */
  setVisible(b) {
    this.element.style.display = (b ? '' : 'none')
    if (this.getMap()) {
      try { this.getMap().renderSync()}  catch (e) { /* ok */ }
    }
  }
  /**
   * Get control visibility
   * @return {bool}
   * @api stable
   */
  getVisible() {
    return this.element.style.display !== 'none'
  }
  /** Draw position in the final canvas
   * @private
  */
  _draw(e) {
    if (!this.getVisible() || !this.getMap())
      return

    // Coordinate
    var coord = this.getMap().getView().getCenter()
    if (this.get('projection'))
      coord = ol_proj_transform(coord, this.getMap().getView().getProjection(), this.get('projection'))
    coord = this._format(coord)
    this.element.textContent = coord
    if (!this.get('canvas'))
      return

    var ctx = this.getContext(e)
    if (!ctx)
      return

    // Retina device
    var ratio = e.frameState.pixelRatio
    ctx.save()
    ctx.scale(ratio, ratio)
    // Position
    var eltRect = this.element.getBoundingClientRect()
    var mapRect = this.getMap().getViewport().getBoundingClientRect()
    var sc = this.getMap().getSize()[0] / mapRect.width
    ctx.translate((eltRect.left - mapRect.left) * sc, (eltRect.top - mapRect.top) * sc)

    var h = this.element.clientHeight
    var w = this.element.clientWidth

    ctx.beginPath()
    ctx.fillStyle = ol_color_asString(this.getTextFill().getColor())
    ctx.strokeStyle = ol_color_asString(this.getTextStroke().getColor())
    ctx.lineWidth = this.getTextStroke().getWidth()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = this.getTextFont()
    ctx.lineJoin = 'round';
    if (ctx.lineWidth) ctx.strokeText(coord, w / 2, h / 2)
    ctx.fillText(coord, w / 2, h / 2)
    ctx.closePath()

    ctx.restore()
  }
}

export default ol_control_CenterPosition
