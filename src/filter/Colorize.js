/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_filter_Base from './Base.js'
import {asString as ol_color_asString} from 'ol/color.js'
import {asArray as ol_color_asArray} from 'ol/color.js'

/** @typedef {Object} FilterColorizeOptions
 * @property {ol.Color} color style to fill with
 * @property {string} operation 'enhance' or a CanvasRenderingContext2D.globalCompositeOperation
 * @property {number} value a value to modify the effect value [0-1]
 * @property {boolean} inner mask inner, default false
 * @property {boolean} preserveAlpha preserve alpha channel, default false
 */

/** Colorize map or layer
 * @constructor
 * @requires ol.filter
 * @extends {ol_filter_Base}
 * @author Thomas Tilak https://github.com/thhomas
 * @author Jean-Marc Viglino https://github.com/viglino
 * @param {FilterColorizeOptions} options
 */
var ol_filter_Colorize = class olfilterColorize extends ol_filter_Base {
  constructor(options) {
    super(options)

    this.setFilter(options)
  }
  /** Set options to the filter
   * @param {FilterColorizeOptions} [options]
   */
  setFilter(options) {
    options = options || {}
    switch (options) {
      case "grayscale": options = { operation: 'hue', color: [0, 0, 0], value: 1 }; break
      case "invert": options = { operation: 'difference', color: [255, 255, 255], value: 1 }; break
      case "sepia": options = { operation: 'color', color: [153, 102, 51], value: 0.6 }; break
      default: break
    }
    var color = options.color ? ol_color_asArray(options.color) : [options.red, options.green, options.blue, options.value]
    this.set('color', ol_color_asString(color))
    this.set('value', options.value || 1)
    this.set('preserveAlpha', options.preserveAlpha)
    var v
    switch (options.operation) {
      case 'hue':
      case 'difference':
      case 'color-dodge':
      case 'enhance': {
        this.set('operation', options.operation)
        break
      }
      case 'saturation': {
        v = 255 * (options.value || 0)
        this.set('color', ol_color_asString([0, 0, v, v || 1]))
        this.set('operation', options.operation)
        break
      }
      case 'luminosity': {
        v = 255 * (options.value || 0)
        this.set('color', ol_color_asString([v, v, v, 255]))
        //this.set ('operation', 'luminosity')
        this.set('operation', 'hard-light')
        break
      }
      case 'contrast': {
        v = 255 * (options.value || 0)
        this.set('color', ol_color_asString([v, v, v, 255]))
        this.set('operation', 'soft-light')
        break
      }
      default: {
        this.set('operation', 'color')
        this.setValue(options.value || 1)
        break
      }
    }
  }
  /** Set the filter value
   * @param {ol.Color} options.color style to fill with
   */
  setValue(v) {
    this.set('value', v)
    var c = ol_color_asArray(this.get("color"))
    c[3] = v
    this.set("color", ol_color_asString(c))
  }
  /** Set the color value
   * @param {number} options.value a [0-1] value to modify the effect value
   */
  setColor(c) {
    c = ol_color_asArray(c)
    if (c) {
      c[3] = this.get("value")
      this.set("color", ol_color_asString(c))
    }
  }
  /** @private
   */
  precompose( /* e */) {
  }
  /** @private
   */
  postcompose(e) {
    // Set back color hue
    var c2, ctx2
    var ctx = e.context
    var canvas = ctx.canvas
    ctx.save()
    if (this.get('operation') == 'enhance') {
      var v = this.get('value')
      if (v) {
        var w = canvas.width
        var h = canvas.height
        if (this.get('preserveAlpha')) {
          c2 = document.createElement('CANVAS')
          c2.width = canvas.width
          c2.height = canvas.height
          ctx2 = c2.getContext('2d')
          ctx2.drawImage(canvas, 0, 0, w, h)
          ctx2.globalCompositeOperation = 'color-burn'
          // console.log(v)
          ctx2.globalAlpha = v
          ctx2.drawImage(c2, 0, 0, w, h)
          ctx2.drawImage(c2, 0, 0, w, h)
          ctx2.drawImage(c2, 0, 0, w, h)
          ctx.globalCompositeOperation = 'source-in'
          ctx.drawImage(c2, 0, 0)
        } else {
          ctx.globalCompositeOperation = 'color-burn'
          ctx.globalAlpha = v
          ctx.drawImage(canvas, 0, 0, w, h)
          ctx.drawImage(canvas, 0, 0, w, h)
          ctx.drawImage(canvas, 0, 0, w, h)
        }
      }
    } else {
      if (this.get('preserveAlpha')) {
        c2 = document.createElement('CANVAS')
        c2.width = canvas.width
        c2.height = canvas.height
        ctx2 = c2.getContext('2d')
        ctx2.drawImage(canvas, 0, 0)
        ctx2.globalCompositeOperation = this.get('operation')
        ctx2.fillStyle = this.get('color')
        ctx2.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'source-in'
        ctx.drawImage(c2, 0, 0)
      } else {
        ctx.globalCompositeOperation = this.get('operation')
        ctx.fillStyle = this.get('color')
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
    ctx.restore()
  }
}

export default ol_filter_Colorize
