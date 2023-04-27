/*	Copyright (c) 2015 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_control_ScaleLine from 'ol/control/ScaleLine.js'
import ol_style_Style from 'ol/style/Style.js'
import {asString as ol_color_asString} from 'ol/color.js'
import ol_control_CanvasBase from './CanvasBase.js'
import ol_ext_element from '../util/element.js'
/**
 * @classdesc 
 *    OpenLayers Scale Line Control integrated in the canvas (for jpeg/png export purposes).
 * @see http://www.kreidefossilien.de/webgis/dokumentation/beispiele/export-map-to-png-with-scale
 *
 * @constructor
 * @extends {ol_control_ScaleLine}
 * @param {Object=} options extend the ol_control_ScaleLine options.
 * 	@param {ol_style_Style} options.style used to draw the scale line (default is black/white, 10px Arial).
 */
var ol_control_CanvasScaleLine = class olcontrolCanvasScaleLine extends ol_control_ScaleLine {
  constructor(options) {
    super(options)
    this.element.classList.add('ol-canvas-control')

    this.scaleHeight_ = 6

    // Get style options
    if (!options)
      options = {}
    if (!options.style)
      options.style = new ol_style_Style()
    this.setStyle(options.style)
  }
  /**
   * Remove the control from its current map and attach it to the new map.
   * Subclasses may set up event handlers to get notified about changes to
   * the map here.
   * @param {ol_Map} map Map.
   * @api stable
   */
  setMap(map) {
    ol_control_CanvasBase.prototype.getCanvas.call(this, map)

    var oldmap = this.getMap()
    if (this._listener)
      ol_Observable_unByKey(this._listener)
    this._listener = null

    super.setMap(map)
    if (oldmap) {
      try { oldmap.renderSync()}  catch (e) { /* ok */ }
    }

    // Add postcompose on the map
    if (map) {
      this._listener = map.on('postcompose', this.drawScale_.bind(this))
    }

    // Hide the default DOM element
    this.element.style.visibility = 'hidden'
    this.olscale = this.element.querySelector(".ol-scale-line-inner")
  }
  /**
   * Change the control style
   * @param {ol_style_Style} style
   */
  setStyle(style) {
    var stroke = style.getStroke()
    this.strokeStyle_ = stroke ? ol_color_asString(stroke.getColor()) : "#000"
    this.strokeWidth_ = stroke ? stroke.getWidth() : 2

    var fill = style.getFill()
    this.fillStyle_ = fill ? ol_color_asString(fill.getColor()) : "#fff"

    var text = style.getText()
    this.font_ = text ? text.getFont() : "10px Arial"
    stroke = text ? text.getStroke() : null
    fill = text ? text.getFill() : null
    this.fontStrokeStyle_ = stroke ? ol_color_asString(stroke.getColor()) : this.fillStyle_
    this.fontStrokeWidth_ = stroke ? stroke.getWidth() : 3
    this.fontFillStyle_ = fill ? ol_color_asString(fill.getColor()) : this.strokeStyle_
    // refresh
    if (this.getMap())
      this.getMap().render()
  }
  /**
   * Draw attribution in the final canvas
   * @param {ol_render_Event} e
   * @private
   */
  drawScale_(e) {
    if (this.element.style.visibility !== 'hidden' || ol_ext_element.getStyle(this.element, 'display') === 'none')
      return
    var ctx = this.getContext(e)
    if (!ctx)
      return

    // Get size of the scale div
    var scalewidth = parseInt(this.olscale.style.width)
    if (!scalewidth)
      return
    var text = this.olscale.textContent
    var position = { left: this.element.offsetLeft, top: this.element.offsetTop }
    // Retina device
    var ratio = e.frameState.pixelRatio
    ctx.save()
    ctx.scale(ratio, ratio)

    // On top
    position.top += this.element.clientHeight - this.scaleHeight_

    // Draw scale text
    ctx.beginPath()
    ctx.strokeStyle = this.fontStrokeStyle_
    ctx.fillStyle = this.fontFillStyle_
    ctx.lineWidth = this.fontStrokeWidth_
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.font = this.font_
    ctx.lineJoin = 'round';
    ctx.strokeText(text, position.left + scalewidth / 2, position.top)
    ctx.fillText(text, position.left + scalewidth / 2, position.top)
    ctx.closePath()

    // Draw scale bar
    position.top += 2
    ctx.lineWidth = this.strokeWidth_
    ctx.strokeStyle = this.strokeStyle_
    var max = 4
    var n = parseInt(text)
    while (n % 10 === 0) n /= 10
    if (n % 5 === 0) max = 5
    for (var i = 0; i < max; i++) {
      ctx.beginPath()
      ctx.fillStyle = i % 2 ? this.fillStyle_ : this.strokeStyle_
      ctx.rect(position.left + i * scalewidth / max, position.top, scalewidth / max, this.scaleHeight_)
      ctx.stroke()
      ctx.fill()
      ctx.closePath()
    }
    ctx.restore()
  }

  /** Get map Canvas
   * @private
   */
  getContext(e) {
    return ol_control_CanvasBase.prototype.getContext.call(this, e);
  }
}

export default ol_control_CanvasScaleLine
