import ol_ext_inherits from '../util/ext'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable'
import ol_interaction_Pointer from 'ol/interaction/Pointer'
import {asString as ol_color_asString} from 'ol/color'
import {asArray as ol_color_asArray} from 'ol/color'
import ol_ext_getMapCanvas from '../util/getMapCanvas'

/**
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @param {ol.flashlight.options} flashlight options param
 *	@param {ol.Color} options.color light color, default transparent
 *  @param {ol.Color} options.fill fill color, default rgba(0,0,0,0.8)
 *  @param {number} options.radius radius of the flash
 */
class ol_interaction_Flashlight {
  constructor(options) {

    ol_interaction_Pointer.call(this, {
      handleDownEvent: this.setPosition,
      handleMoveEvent: this.setPosition
    })

    // Default options
    options = options || {}

    this.pos = false

    this.radius = (options.radius || 100)

    this.setColor(options)

  }
  /** Set the map > start postcompose
  */
  setMap(map) {
    if (this.getMap()) {
      this.getMap().render()
    }
    if (this._listener)
      ol_Observable_unByKey(this._listener)
    this._listener = null

    ol_interaction_Pointer.prototype.setMap.call(this, map)

    if (map) {
      this._listener = map.on('postcompose', this.postcompose_.bind(this))
    }
  }
  /** Set flashlight radius
   *	@param {integer} radius
  */
  setRadius(radius) {
    this.radius = radius
    if (this.getMap()) {
      try { this.getMap().renderSync()}  catch (e) { /* ok */ }
    }
  }
  /** Set flashlight color
   *	@param {ol.flashlight.options} flashlight options param
  *		- color {ol.Color} light color, default transparent
  *		- fill {ol.Color} fill color, default rgba(0,0,0,0.8)
  */
  setColor(options) {
    // Backcolor
    var color = (options.fill ? options.fill : [0, 0, 0, 0.8])
    var c = ol_color_asArray(color)
    this.startColor = ol_color_asString(c)
    // Halo color
    if (options.color) {
      c = this.endColor = ol_color_asString(ol_color_asArray(options.color) || options.color)
    } else {
      c[3] = 0
      this.endColor = ol_color_asString(c)
    }
    c[3] = 0.1
    this.midColor = ol_color_asString(c)
    if (this.getMap()) {
      try { this.getMap().renderSync()}  catch (e) { /* ok */ }
    }
  }
  /** Set position of the flashlight
  *	@param {ol.Pixel|ol.MapBrowserEvent}
  */
  setPosition(e) {
    if (e.pixel)
      this.pos = e.pixel
    else
      this.pos = e
    if (this.getMap()) {
      try { this.getMap().renderSync()}  catch (e) { /* ok */ }
    }
  }
  /** Postcompose function
  */
  postcompose_(e) {
    var ctx = ol_ext_getMapCanvas(this.getMap()).getContext('2d')
    var ratio = e.frameState.pixelRatio
    var w = ctx.canvas.width
    var h = ctx.canvas.height
    ctx.save()
    ctx.scale(ratio, ratio)

    if (!this.pos) {
      ctx.fillStyle = this.startColor
      ctx.fillRect(0, 0, w, h)
    } else {
      var d = Math.max(w, h)
      // reveal wherever we drag
      var radGrd = ctx.createRadialGradient(this.pos[0], this.pos[1], w * this.radius / d, this.pos[0], this.pos[1], h * this.radius / d)
      radGrd.addColorStop(0, this.startColor)
      radGrd.addColorStop(0.8, this.midColor)
      radGrd.addColorStop(1, this.endColor)
      ctx.fillStyle = radGrd
      ctx.fillRect(this.pos[0] - d, this.pos[1] - d, 2 * d, 2 * d)
    }
    ctx.restore()
  }
}
ol_ext_inherits(ol_interaction_Flashlight, ol_interaction_Pointer);






export default ol_interaction_Flashlight
