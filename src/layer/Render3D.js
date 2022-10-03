import ol_layer_Vector from 'ol/layer/Vector.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import {easeOut as ol_easing_easeOut} from 'ol/easing.js'
import ol_Object from 'ol/Object.js'
import ol_style_Style from 'ol/style/Style.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_style_Fill from 'ol/style/Fill.js'
import {asString as ol_color_asString} from 'ol/color.js'

import {ol_coordinate_getIntersectionPoint} from '../geom/GeomUtils.js'

/** ol.layer.Vector.prototype.setRender3D
 * @extends {ol.layer.Vector}
 * @param {ol_render3D}
 */
ol_layer_Vector.prototype.setRender3D = function (r) {
  r.setLayer(this);
}

/** 
 * @classdesc
 *  3D vector layer rendering
 * @constructor
 * @param {Object} param
 *  @param {ol.layer.Vector} param.layer the layer to display in 3D
 *  @param {ol.style.Style} options.style drawing style
 *  @param {function|boolean} param.active a function that returns a boolean or a boolean ,default true
 *  @param {boolean} param.ghost use ghost style
 *  @param {number} param.maxResolution  max resolution to render 3D
 *  @param {number} param.defaultHeight default height if none is return by a propertie
 *  @param {function|string|Number} param.height a height function (returns height giving a feature) or a popertie name for the height or a fixed value
 */
var ol_render3D = class olrender3D extends ol_Object {
  constructor(options) {
    options = options || {}

    options.maxResolution = options.maxResolution || 100
    options.defaultHeight = options.defaultHeight || 0
    super(options)

    this.setStyle(options.style)
    this.set('ghost', options.ghost)
    this.setActive(options.active || options.active !== false)

    this.height_ = options.height = this.getHfn(options.height)
    if (options.layer)
      this.setLayer(options.layer)
  }
  /**
   * Set style associated with the renderer
   * @param {ol.style.Style} s
   */
  setStyle(s) {
    if (s instanceof ol_style_Style)
      this._style = s
    else
      this._style = new ol_style_Style()
    if (!this._style.getStroke()) {
      this._style.setStroke(new ol_style_Stroke({
        width: 1,
        color: 'red'
      }))
    }
    if (!this._style.getFill()) {
      this._style.setFill(new ol_style_Fill({ color: 'rgba(0,0,255,0.5)' }))
    }
    // Get the geometry
    if (s && s.getGeometry()) {
      var geom = s.getGeometry()
      if (typeof (geom) === 'function') {
        this.set('geometry', geom)
      } else {
        this.set('geometry', function () { return geom })
      }
    } else {
      this.set('geometry', function (f) { return f.getGeometry() })
    }
  }
  /**
   * Get style associated with the renderer
   * @return {ol.style.Style}
   */
  getStyle() {
    return this._style
  }
  /** Set active
   * @param {function|boolean} active
   */
  setActive(active) {
    if (typeof (active) === 'function') {
      this._active = active
    }
    else {
      this._active = function () { return active }
    }
    if (this.layer_)
      this.layer_.changed()
  }
  /** Get active
   * @return {boolean}
   */
  getActive() {
    return this._active()
  }
  /** Calculate 3D at potcompose
   * @private
   */
  onPostcompose_(e) {
    if (!this.getActive())
      return
    var res = e.frameState.viewState.resolution
    if (res > this.get('maxResolution'))
      return
    this.res_ = res * 400

    if (this.animate_) {
      var elapsed = e.frameState.time - this.animate_
      if (elapsed < this.animateDuration_) {
        this.elapsedRatio_ = this.easing_(elapsed / this.animateDuration_)
        // tell OL3 to continue postcompose animation
        e.frameState.animate = true
      } else {
        this.animate_ = false
        this.height_ = this.toHeight_
      }
    }

    var ratio = e.frameState.pixelRatio
    var ctx = e.context
    var m = this.matrix_ = e.frameState.coordinateToPixelTransform
    // Old version (matrix)
    if (!m) {
      m = e.frameState.coordinateToPixelMatrix,
        m[2] = m[4]
      m[3] = m[5]
      m[4] = m[12]
      m[5] = m[13]
    }
    this.center_ = [ctx.canvas.width / 2 / ratio, ctx.canvas.height / ratio]

    var f = this.layer_.getSource().getFeaturesInExtent(e.frameState.extent)

    ctx.save()
    ctx.scale(ratio, ratio)
    var s = this.getStyle()
    ctx.lineWidth = s.getStroke().getWidth()
    ctx.strokeStyle = ol_color_asString(s.getStroke().getColor())
    ctx.fillStyle = ol_color_asString(s.getFill().getColor())
    var builds = []
    for (var i = 0; i < f.length; i++) {
      var h = this.getFeatureHeight(f[i])
      if (h)
        builds.push(this.getFeature3D_(f[i], h))
    }
    if (this.get('ghost'))
      this.drawGhost3D_(ctx, builds)
    else
      this.drawFeature3D_(ctx, builds)
    ctx.restore()
  }
  /** Set layer to render 3D
   */
  setLayer(l) {
    if (this._listener) {
      this._listener.forEach(function (l) {
        ol_Observable_unByKey(l)
      })
    }
    this.layer_ = l
    this._listener = l.on(['postcompose', 'postrender'], this.onPostcompose_.bind(this))
  }
  /** Create a function that return height of a feature
   *	@param {function|string|number} h a height function or a popertie name or a fixed value
   *	@return {function} function(f) return height of the feature f
   */
  getHfn(h) {
    switch (typeof (h)) {
      case 'function': return h
      case 'string': {
        var dh = this.get('defaultHeight')
        return (function (f) {
          return (Number(f.get(h)) || dh)
        })
      }
      case 'number': return (function ( /*f*/) { return h })
      default: return (function ( /*f*/) { return 10 })
    }
  }
  /** Animate rendering
   * @param {olx.render3D.animateOptions}
   *  @param {string|function|number} param.height an attribute name or a function returning height of a feature or a fixed value
   *  @param {number} param.duration the duration of the animatioin ms, default 1000
   *  @param {ol.easing} param.easing an ol easing function
   *	@api
   */
  animate(options) {
    options = options || {}
    this.toHeight_ = this.getHfn(options.height)
    this.animate_ = new Date().getTime()
    this.animateDuration_ = options.duration || 1000
    this.easing_ = options.easing || ol_easing_easeOut
    // Force redraw
    this.layer_.changed()
  }
  /** Check if animation is on
   *	@return {bool}
   */
  animating() {
    if (this.animate_ && new Date().getTime() - this.animate_ > this.animateDuration_) {
      this.animate_ = false
    }
    return !!this.animate_
  }
  /** Get feature height
   * @param {ol.Feature} f
   */
  getFeatureHeight(f) {
    if (this.animate_) {
      var h1 = this.height_(f)
      var h2 = this.toHeight_(f)
      return (h1 * (1 - this.elapsedRatio_) + this.elapsedRatio_ * h2)
    }
    else
      return this.height_(f)
  }
  /** Get elevation line
   * @private
   */
  hvector_(pt, h) {
    var p0 = [
      pt[0] * this.matrix_[0] + pt[1] * this.matrix_[1] + this.matrix_[4],
      pt[0] * this.matrix_[2] + pt[1] * this.matrix_[3] + this.matrix_[5]
    ]
    return {
      p0: p0,
      p1: [
        p0[0] + h / this.res_ * (p0[0] - this.center_[0]),
        p0[1] + h / this.res_ * (p0[1] - this.center_[1])
      ]
    }
  }
  /** Get drawing
   * @private
   */
  getFeature3D_(f, h) {
    var geom = this.get('geometry')(f)
    var c = geom.getCoordinates()
    switch (geom.getType()) {
      case "Polygon":
        c = [c]
      // fallthrough
      case "MultiPolygon":
        var build = []
        for (var i = 0; i < c.length; i++) {
          for (var j = 0; j < c[i].length; j++) {
            var b = []
            for (var k = 0; k < c[i][j].length; k++) {
              b.push(this.hvector_(c[i][j][k], h))
            }
            build.push(b)
          }
        }
        return { type: "MultiPolygon", feature: f, geom: build, height: h }
      case "Point":
        return { type: "Point", feature: f, geom: this.hvector_(c, h), height: h }
      default: return {}
    }
  }
  /** Draw a feature
   * @param {CanvasRenderingContext2D} ctx
   * @param {ol.Feature} build
   * @private
   */
  drawFeature3D_(ctx, build) {
    var i, j, b, k
    // Construct
    for (i = 0; i < build.length; i++) {
      switch (build[i].type) {
        case "MultiPolygon": {
          for (j = 0; j < build[i].geom.length; j++) {
            b = build[i].geom[j]
            for (k = 0; k < b.length; k++) {
              ctx.beginPath()
              ctx.moveTo(b[k].p0[0], b[k].p0[1])
              ctx.lineTo(b[k].p1[0], b[k].p1[1])
              ctx.stroke()
            }
          }
          break
        }
        case "Point": {
          var g = build[i].geom
          ctx.beginPath()
          ctx.moveTo(g.p0[0], g.p0[1])
          ctx.lineTo(g.p1[0], g.p1[1])
          ctx.stroke()
          break
        }
        default: break
      }
    }
    // Roof
    for (i = 0; i < build.length; i++) {
      switch (build[i].type) {
        case "MultiPolygon": {
          ctx.beginPath()
          for (j = 0; j < build[i].geom.length; j++) {
            b = build[i].geom[j]
            if (j == 0) {
              ctx.moveTo(b[0].p1[0], b[0].p1[1])
              for (k = 1; k < b.length; k++) {
                ctx.lineTo(b[k].p1[0], b[k].p1[1])
              }
            } else {
              ctx.moveTo(b[0].p1[0], b[0].p1[1])
              for (k = b.length - 2; k >= 0; k--) {
                ctx.lineTo(b[k].p1[0], b[k].p1[1])
              }
            }
            ctx.closePath()
          }
          ctx.fill("evenodd")
          ctx.stroke()
          break
        }
        case "Point": {
          b = build[i]
          var t = b.feature.get('label')
          if (t) {
            var p = b.geom.p1
            var f = ctx.fillStyle
            ctx.fillStyle = ctx.strokeStyle
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillText(t, p[0], p[1])
            var m = ctx.measureText(t)
            var h = Number(ctx.font.match(/\d+(\.\d+)?/g).join([]))
            ctx.fillStyle = "rgba(255,255,255,0.5)"
            ctx.fillRect(p[0] - m.width / 2 - 5, p[1] - h - 5, m.width + 10, h + 10)
            ctx.strokeRect(p[0] - m.width / 2 - 5, p[1] - h - 5, m.width + 10, h + 10)
            ctx.fillStyle = f
            //console.log(build[i].feature.getProperties())
          }
          break
        }
        default: break
      }
    }
  }
  /**
   * @private
   */
  drawGhost3D_(ctx, build) {
    var i, j, b, k
    // Construct
    for (i = 0; i < build.length; i++) {
      switch (build[i].type) {
        case "MultiPolygon": {
          for (j = 0; j < build[i].geom.length; j++) {
            b = build[i].geom[j]
            for (k = 0; k < b.length - 1; k++) {
              ctx.beginPath()
              ctx.moveTo(b[k].p0[0], b[k].p0[1])
              ctx.lineTo(b[k].p1[0], b[k].p1[1])
              ctx.lineTo(b[k + 1].p1[0], b[k + 1].p1[1])
              ctx.lineTo(b[k + 1].p0[0], b[k + 1].p0[1])
              ctx.lineTo(b[k].p0[0], b[k].p0[1])

              var m = [(b[k].p0[0] + b[k + 1].p0[0]) / 2, (b[k].p0[1] + b[k + 1].p0[1]) / 2]
              var h = [b[k].p0[1] - b[k + 1].p0[1], -b[k].p0[0] + b[k + 1].p0[0]]
              var c = ol_coordinate_getIntersectionPoint(
                [m, [m[0] + h[0], m[1] + h[1]]],
                [b[k].p1, b[k + 1].p1]
              )
              var gradient = ctx.createLinearGradient(
                m[0], m[1],
                c[0], c[1]
              )
              gradient.addColorStop(0, 'rgba(255,255,255,.2)')
              gradient.addColorStop(1, 'rgba(255,255,255,0)')
              ctx.fillStyle = gradient
              ctx.fill()
            }
          }
          break
        }
        case "Point": {
          var g = build[i].geom
          ctx.beginPath()
          ctx.moveTo(g.p0[0], g.p0[1])
          ctx.lineTo(g.p1[0], g.p1[1])
          ctx.stroke()
          break
        }
        default: break
      }
    }
  }
}

export default ol_render3D
