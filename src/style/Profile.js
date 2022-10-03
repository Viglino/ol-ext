/*	Copyright (c) 2019 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_style_Style from 'ol/style/Style.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_style_Fill from 'ol/style/Fill.js'
import {asString as ol_color_asString} from 'ol/color.js'
import {ol_coordinate_dist2d} from '../geom/GeomUtils.js'

/** Profile style
 * Draw a profile on the map
 * @extends {ol_style_Style}
 * @constructor
 * @param {Object} options
 *  @param {ol.style.Stroke} options.stroke 
 *  @param {ol.style.Fill} options.fill 
 *  @param {number} options.scale z scale 
 *  @param {number} options.zIndex 
 *  @param {ol.geom.Geometry} options.geometry 
 */
var ol_style_Profile = class olstyleProfile extends ol_style_Style {
  constructor(options) {
    options = options || {}

    super({
      zIndex: options.zIndex,
      geometry: options.geometry
    })
    this.setRenderer(this._render.bind(this))
    
    this.setStroke(options.stroke)
    this.setFill(options.fill)
    this.setScale(options.scale)

  }
  /** Set style stroke
   * @param {ol.style.Stroke}
   */
  setStroke(stroke) {
    this._stroke = stroke || new ol_style_Stroke({ color: '#fff', width: 1 })
  }
  /** Get style stroke
   * @return {ol.style.Stroke}
   */
  getStroke() {
    return this._stroke
  }
  /** Set style stroke
   * @param {ol.style.Fill}
   */
  setFill(fill) {
    this._fill = fill || new ol_style_Fill({ color: 'rgba(255,255,255,.3' })
  }
  /** Get style stroke
   * @return {ol.style.Fill}
   */
  getFill() {
    return this._fill
  }
  /** Set z scale
   * @param {number}
   */
  setScale(sc) {
    this._scale = sc || .2
  }
  /** Get z scale
   * @return {number}
   */
  getScale() {
    return this._scale
  }
  /** Renderer function
   * @param {Array<ol.coordinate>} geom The pixel coordinates of the geometry in GeoJSON notation
   * @param {ol.render.State} e The olx.render.State of the layer renderer
   */
  _render(geom, e) {
    if (!/Z/.test(e.feature.getGeometry().getLayout()))
      return
    var g = e.geometry.getCoordinates()
    switch (e.geometry.getType()) {
      case 'LineString': {
        this._renderLine(geom, g, e.feature.getGeometry(), e)
        break
      }
      case 'MultiLineString': {
        e.feature.getGeometry().getLineStrings().forEach(function (l, i) {
          this._renderLine(geom[i], g[i], l, e)
        }.bind(this))
        break
      }
      case 'Point': {
        break
      }
    }
  }
  /** @private */
  _renderLine(geom, g, l, e) {
    var i, p, ctx = e.context

    var cos = Math.cos(e.rotation)
    var sin = Math.sin(e.rotation)
    // var a = e.pixelRatio / e.resolution;
    var a = ol_coordinate_dist2d(geom[0], geom[1]) / ol_coordinate_dist2d(g[0], g[1])
    var dx = geom[0][0] - g[0][0] * a * cos - g[0][1] * a * sin
    var dy = geom[0][1] - g[0][0] * a * sin + g[0][1] * a * cos
    geom = l.getCoordinates()
    var dz = Infinity
    for (i = 0; p = geom[i]; i++) {
      var x = dx + p[0] * a * cos + p[1] * a * sin
      var y = dy + p[0] * a * sin - p[1] * a * cos
      dz = Math.min(dz, p[2])
      geom[i] = [x, y, p[2]]
    }

    ctx.save()

    ctx.fillStyle = ol_color_asString(this.getFill().getColor())
    ctx.strokeStyle = ol_color_asString(this.getStroke().getColor())
    ctx.lineWidth = this.getStroke().getWidth()

    var p0 = geom[0]
    var ez = this.getScale() * e.pixelRatio

    for (i = 1; p = geom[i]; i++) {
      ctx.beginPath()
      ctx.moveTo(p0[0], p0[1])
      ctx.lineTo(p[0], p[1])
      ctx.lineTo(p[0], p[1] - (p[2] - dz) * ez)
      ctx.lineTo(p0[0], p0[1] - (p0[2] - dz) * ez)
      ctx.lineTo(p0[0], p0[1])
      ctx.fill()
      p0 = p
    }

    p0 = geom[0]
    ctx.beginPath()
    ctx.moveTo(p0[0], p0[1] - (p0[2] - dz) * ez)
    for (i = 1; p = geom[i]; i++) {
      ctx.lineTo(p[0], p[1] - (p[2] - dz) * ez)
    }
    ctx.stroke()

    ctx.restore()
  }
}

export default ol_style_Profile
