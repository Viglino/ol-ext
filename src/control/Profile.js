/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

import { getDistance as ol_sphere_getDistance } from 'ol/sphere.js'
import { transform as ol_proj_transform } from 'ol/proj.js'
import ol_control_Control from 'ol/control/Control.js'
import ol_Feature from 'ol/Feature.js'
import ol_style_Fill from 'ol/style/Fill.js'
import { asString as ol_color_asString } from 'ol/color.js'

import ol_style_Style from 'ol/style/Style.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_style_Text from 'ol/style/Text.js'
import ol_geom_LineString from 'ol/geom/LineString.js'

import { ol_coordinate_dist2d } from "../geom/GeomUtils.js"
import ol_ext_element from '../util/element.js'

/**
 * @classdesc OpenLayers 3 Profile Control.
 * Draw a profile of a feature (with a 3D geometry)
 * @author Gastón Zalba https://github.com/GastonZalba
 * @author Jean-Marc Viglino https://github.com/viglino
 *
 * @constructor
 * @extends {ol_control_Control}
 * @fires over
 * @fires out
 * @fires show
 * @fires dragstart
 * @fires dragging
 * @fires dragend
 * @fires dragcancel
 * @param {Object=} options
 *  @param {string} options.className
 *	@param {String} options.title button title
 *  @param {ol.style.Style} [options.style] style to draw the profile, default darkblue
 *  @param {ol.style.Style} [options.selectStyle] style for selection, default darkblue fill
 *  @param {*} options.info keys/values for i19n
 *  @param {number} [options.width=300]
 *  @param {number} [options.height=150]
 *  @param {'metric'|'imperial'} [options.units='metric'] output system of measurement Note that input z coords are expected to be in meters in either mode (as determined by GPX, DEM, DSM, etc. standards).
 *  @param {ol.Feature} [options.feature] the feature to draw profile
 *  @param {boolean} [options.selectable=false] enable selection on the profil, default false
 *  @param {boolean} [options.zoomable=false] can zoom in the profile
 *  @param {string} [options.numberFormat] Convert numbers to a custom locale format, default is not used
 */
var ol_control_Profile = class olcontrolProfile extends ol_control_Control {
  constructor(options) {
    options = options || {}

    var element = document.createElement('div')

    super({
      element: element,
      target: options.target
    })

    var self = this
    this.info = options.info || ol_control_Profile.prototype.info
    if (options.target) {
      element.classList.add(options.className || 'ol-profile')
    } else {
      element.className = ((options.className || 'ol-profile') + ' ol-unselectable ol-control ol-collapsed').trim()
      this.button = document.createElement('button')
      this.button.title = options.title || 'Profile'
      this.button.setAttribute('type', 'button')
      var click_touchstart_function = function (e) {
        self.toggle()
        e.preventDefault()
      }
      this.button.addEventListener('click', click_touchstart_function)
      this.button.addEventListener('touchstart', click_touchstart_function)
      element.appendChild(this.button)
      ol_ext_element.create('I', { parent: this.button })
    }

    // Drawing style
    if (options.style instanceof ol_style_Style) {
      this._style = options.style
    } else {
      this._style = new ol_style_Style({
        text: new ol_style_Text(),
        stroke: new ol_style_Stroke({
          width: 1.5,
          color: '#369'
        })
      })
    }
    if (!this._style.getText()) this._style.setText(new ol_style_Text())

    // Selection style
    if (options.selectStyle instanceof ol_style_Style) {
      this._selectStyle = options.selectStyle
    } else {
      this._selectStyle = new ol_style_Style({
        fill: new ol_style_Fill({ color: '#369' })
      })
    }

    var div_inner = document.createElement("div")
    div_inner.classList.add("ol-inner")
    element.appendChild(div_inner)
    var div = document.createElement("div")
    div.style.position = "relative"
    div_inner.appendChild(div)

    var ratio = this.ratio = 2
    this.canvas_ = document.createElement('canvas')
    this.canvas_.width = (options.width || 300) * ratio
    this.canvas_.height = (options.height || 150) * ratio

    var styles = {
      "msTransform": "scale(0.5,0.5)", "msTransformOrigin": "0 0",
      "webkitTransform": "scale(0.5,0.5)", "webkitTransformOrigin": "0 0",
      "mozTransform": "scale(0.5,0.5)", "mozTransformOrigin": "0 0",
      "transform": "scale(0.5,0.5)", "transformOrigin": "0 0"
    }

    Object.keys(styles).forEach(function (style) {
      if (style in self.canvas_.style) {
        self.canvas_.style[style] = styles[style]
      }
    })

    this.div_to_canvas_ = document.createElement("div")
    div.appendChild(this.div_to_canvas_)
    this.div_to_canvas_.style.width = this.canvas_.width / ratio + "px"
    this.div_to_canvas_.style.height = this.canvas_.height / ratio + "px"
    this.div_to_canvas_.appendChild(this.canvas_)

    this.setProperties({
      'units': options.units || 'metric',
      'numberFormat': options.numberFormat,
      'selectable': options.selectable
    })

    this._isMetric = this.get('units') === 'metric'

    // Offset in px
    this.margin_ = { top: 10 * ratio, left: 45 * ratio, bottom: 30 * ratio, right: 10 * ratio }
    if (!this.info.ytitle)
      this.margin_.left -= 20 * ratio
    if (!this.info.xtitle)
      this.margin_.bottom -= 20 * ratio

    // Cursor
    this.bar_ = document.createElement("div")
    this.bar_.classList.add("ol-profilebar")
    this.bar_.style.top = (this.margin_.top / ratio) + "px"
    this.bar_.style.height = (this.canvas_.height - this.margin_.top - this.margin_.bottom) / ratio + "px"
    div.appendChild(this.bar_)

    this.cursor_ = document.createElement("div")
    this.cursor_.classList.add("ol-profilecursor")
    div.appendChild(this.cursor_)

    this.popup_ = document.createElement("div")
    this.popup_.classList.add("ol-profilepopup")
    this.cursor_.appendChild(this.popup_)

    // Track information
    var t = document.createElement("table")
    t.cellPadding = '0'
    t.cellSpacing = '0'
    t.style.clientWidth = this.canvas_.width / ratio + "px"
    div.appendChild(t)

    var firstTr = document.createElement("tr")
    firstTr.classList.add("track-info")
    t.appendChild(firstTr)
    var div_zmin = document.createElement("td")
    div_zmin.innerHTML = (this.info.zmin || "Zmin") + ': <span class="zmin">'
    firstTr.appendChild(div_zmin)
    var div_zmax = document.createElement("td")
    div_zmax.innerHTML = (this.info.zmax || "Zmax") + ': <span class="zmax">'
    firstTr.appendChild(div_zmax)
    var div_distance = document.createElement("td")
    div_distance.innerHTML = (this.info.distance || "Distance") + ': <span class="dist">'
    firstTr.appendChild(div_distance)
    var div_time = document.createElement("td")
    div_time.innerHTML = (this.info.time || "Time") + ': <span class="time">'
    firstTr.appendChild(div_time)
    var secondTr = document.createElement("tr")
    secondTr.classList.add("point-info")
    t.appendChild(secondTr)
    var div_altitude = document.createElement("td")
    div_altitude.innerHTML = (this.info.altitude || "Altitude") + ': <span class="z">'
    secondTr.appendChild(div_altitude)
    var div_distance2 = document.createElement("td")
    div_distance2.innerHTML = (this.info.distance || "Distance") + ': <span class="dist">'
    secondTr.appendChild(div_distance2)
    var div_time2 = document.createElement("td")
    div_time2.innerHTML = (this.info.time || "Time") + ': <span class="time">'
    secondTr.appendChild(div_time2)

    // Array of data
    this.tab_ = []

    // Show feature
    if (options.feature) {
      this.setGeometry(options.feature)
    }

    // Zoom on profile
    if (options.zoomable) {
      this.set('selectable', true)
      var start, geom
      this.on('change:geometry', function () {
        geom = null
      })
      this.on('dragstart', function (e) {
        start = e.index
      })
      this.on('dragend', function (e) {
        if (Math.abs(start - e.index) > 10) {
          if (!geom) {
            var bt = ol_ext_element.create('BUTTON', {
              parent: element,
              className: 'ol-zoom-out',
              click: function (e) {
                e.stopPropagation()
                e.preventDefault()
                if (geom) {
                  this.dispatchEvent({ type: 'zoom' })
                  this.setGeometry(geom, this._geometry[1])
                }
                element.removeChild(bt)
              }.bind(this)
            })
          }
          var saved = geom || this._geometry[0]
          var g = new ol_geom_LineString(this.getSelection(start, e.index))
          this.setGeometry(g, this._geometry[1])
          geom = saved
          this.dispatchEvent({ type: 'zoom', geometry: g, start: start, end: e.index })
        }
      }.bind(this))
    }

    // Add listener on target elements
    if (options.target) {
      this._addListeners()
    }
  }

  /** Add canvas listeners
   * @private
   */
  _addListeners() {
    // prevent multi listeners
    if (!this.onMoveBinded) {
      this.onMoveBinded = this.onMove.bind(this)
      this.div_to_canvas_.addEventListener('pointerdown', this.onMoveBinded)
      this.div_to_canvas_.addEventListener('mousemove', this.onMoveBinded)
      this.div_to_canvas_.addEventListener('touchmove', this.onMoveBinded)
      document.addEventListener('pointerup', this.onMoveBinded)
    }
  }

  /** Remove canvas listeners
   * @private
   */
  _removeListeners() {
    if (this.onMoveBinded) {
      this.div_to_canvas_.removeEventListener('pointerdown', this.onMoveBinded)
      this.div_to_canvas_.removeEventListener('mousemove', this.onMoveBinded)
      this.div_to_canvas_.removeEventListener('touchmove', this.onMoveBinded)
      document.removeEventListener('pointerup', this.onMoveBinded)
      this.onMoveBinded = null
    }
  }

  /** Show popup info
  * @param {string} info to display as a popup
  * @api stable
  */
  popup(info) {
    this.popup_.innerHTML = info
  }
  /** Show point on profile
   * @param {*} p
   * @param {number} dx
   * @private
   */
  _drawAt(p, dx) {
    if (p) {
      this.cursor_.style.left = dx + "px"
      this.cursor_.style.top = (this.canvas_.height - this.margin_.bottom + p[1] * this.scale_[1] + this.dy_) / this.ratio + "px"
      this.cursor_.style.display = "block"
      this.bar_.parentElement.classList.add("over")
      this.bar_.style.left = dx + "px"
      this.bar_.style.display = "block"

      var zunit = this._isMetric ? ol_control_Profile.prototype.Unit.Meter : ol_control_Profile.prototype.Unit.Foot
      var zvalue = this._unitsConversion(p[1], zunit)
      this.element.querySelector(".point-info .z").textContent = typeof zvalue === 'number' ? this._numberFormat(zvalue, this.get('zDigitsHover')) + zunit : '-'

      var xunit
      if (this._isMetric) xunit = (xvalue > ol_control_Profile.prototype.KILOMETER_VALUE) ? ol_control_Profile.prototype.Unit.Kilometer : ol_control_Profile.prototype.Unit.Meter
      else xunit = (xvalue > ol_control_Profile.prototype.MILE_VALUE) ? ol_control_Profile.prototype.Unit.Mile : ol_control_Profile.prototype.Unit.Foot

      var xvalue = this._unitsConversion(p[0], xunit)
      this.element.querySelector(".point-info .dist").textContent = typeof xvalue === 'number' ? this._numberFormat(xvalue, this.get('xDigitsHover')) + xunit : '-'

      this.element.querySelector(".point-info .time").textContent = p[2]
      if (dx > this.canvas_.width / this.ratio / 2)
        this.popup_.classList.add('ol-left')
      else
        this.popup_.classList.remove('ol-left')
    } else {
      this.cursor_.style.display = "none"
      this.bar_.style.display = 'none'
      this.cursor_.style.display = 'none'
      this.bar_.parentElement.classList.remove("over")
    }
  }
  /** Show point at coordinate or a distance on the profile
   * @param { ol.coordinates|number } where a coordinate or a distance from begining, if none it will hide the point
   * @return { ol.coordinates } current point
   */
  showAt(where) {
    var i, p, p0, d0 = Infinity
    if (typeof (where) === 'undefined') {
      if (this.bar_.parentElement.classList.contains("over")) {
        // Remove it
        this._drawAt()
      }
    } else if (where.length) {
      // Look for closest the point
      for (i = 1; p = this.tab_[i]; i++) {
        var d = ol_coordinate_dist2d(p[3], where)
        if (d < d0) {
          p0 = p
          d0 = d
        }
      }
    } else {
      for (i = 0; p = this.tab_[i]; i++) {
        p0 = p
        if (p[0] >= where) {
          break
        }
      }
    }
    if (p0) {
      var dx = (p0[0] * this.scale_[0] + this.margin_.left) / this.ratio
      this._drawAt(p0, dx)
      return p0[3]
    }
    return null
  }
  /** Show point at a time on the profile
   * @param { Date|number } time a Date or a DateTime (in s) to show the profile on, if none it will hide the point
   * @param { booelan } delta true if time is a delta from the start, default false
   * @return { ol.coordinates } current point
   */
  showAtTime(time, delta) {
    var i, p, p0
    if (time instanceof Date) {
      time = time.getTime() / 1000
    } else if (delta) {
      time += this.tab_[0][3][3]
    }
    if (typeof (time) === 'undefined') {
      if (this.bar_.parentElement.classList.contains("over")) {
        // Remove it
        this._drawAt()
      }
    } else {
      for (i = 0; p = this.tab_[i]; i++) {
        p0 = p
        if (p[3][3] >= time) {
          break
        }
      }
    }
    if (p0) {
      var dx = (p0[0] * this.scale_[0] + this.margin_.left) / this.ratio
      this._drawAt(p0, dx)
      return p0[3]
    }
    return null
  }
  /** Get the point at a given time on the profile
   * @param { number } time time at which to show the point
   * @return { ol.coordinates } current point
   */
  pointAtTime(time) {
    var i, p
    // Look for closest the point
    for (i = 1; p = this.tab_[i]; i++) {
      var t = p[3][3]
      if (t >= time) {
        // Previous one ?
        var pt = this.tab_[i - 1][3]
        if ((pt[3] + t) / 2 < time)
          return pt
        else
          return p
      }
    }
    return this.tab_[this.tab_.length - 1][3]
  }
  /** Mouse move over canvas
   */
  onMove(e) {
    if (!this.tab_.length)
      return
    var box_canvas = this.canvas_.getBoundingClientRect()
    var pos = {
      top: box_canvas.top + window.pageYOffset - document.documentElement.clientTop,
      left: box_canvas.left + window.pageXOffset - document.documentElement.clientLeft
    }

    var pageX = e.pageX
      || (e.touches && e.touches.length && e.touches[0].pageX)
      || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageX)
    var pageY = e.pageY
      || (e.touches && e.touches.length && e.touches[0].pageY)
      || (e.changedTouches && e.changedTouches.length && e.changedTouches[0].pageY)

    var dx = pageX - pos.left
    var dy = pageY - pos.top
    var ratio = this.ratio
    if (dx > this.margin_.left / ratio - 20 && dx < (this.canvas_.width - this.margin_.right) / ratio + 8
      && dy > this.margin_.top / ratio && dy < (this.canvas_.height - this.margin_.bottom) / ratio) {
      var d = (dx * ratio - this.margin_.left) / this.scale_[0]
      var p0 = this.tab_[0]
      var index, p
      for (index = 1; p = this.tab_[index]; index++) {
        if (p[0] >= d) {
          if (d < (p[0] + p0[0]) / 2) {
            index = 0
            p = p0
          }
          break
        }
      }
      if (!p)
        p = this.tab_[this.tab_.length - 1]
      dx = Math.max(this.margin_.left / ratio, Math.min(dx, (this.canvas_.width - this.margin_.right) / ratio))
      
      // invalid y value
      if (typeof p[1] === 'undefined') return;

      this._drawAt(p, dx)
      this.dispatchEvent({ type: 'over', click: e.type === 'click', index: index, coord: p[3], time: p[2], distance: p[0] })
      // Handle drag / click
      switch (e.type) {
        case 'pointerdown': {
          this._dragging = {
            event: { type: 'dragstart', index: index, coord: p[3], time: p[2], distance: p[0] },
            pageX: pageX,
            pageY: pageY
          }
          break
        }
        case 'pointerup': {
          if (this._dragging && this._dragging.pageX) {
            if (Math.abs(this._dragging.pageX - pageX) < 3 && Math.abs(this._dragging.pageY - pageY) < 3) {
              this.dispatchEvent({ type: 'click', index: index, coord: p[3], time: p[2], distance: p[0] })
              this.refresh()
            }
          } else {
            this.dispatchEvent({ type: 'dragend', index: index, coord: p[3], time: p[2], distance: p[0] })
          }
          this._dragging = false
          break
        }
        default: {
          if (this._dragging) {
            if (this._dragging.pageX) {
              if (Math.abs(this._dragging.pageX - pageX) > 3 || Math.abs(this._dragging.pageY - pageY) > 3) {
                this._dragging.pageX = this._dragging.pageY = false
                this.dispatchEvent(this._dragging.event)
              }
            } else {
              this.dispatchEvent({ type: 'dragging', index: index, coord: p[3], time: p[2], distance: p[0] })
              var min = Math.min(this._dragging.event.index, index)
              var max = Math.max(this._dragging.event.index, index)
              this.refresh()
              if (this.get('selectable'))
                this._drawGraph(this.tab_.slice(min, max), this._selectStyle)
            }
          }
          break
        }
      }
    } else {
      if (this.bar_.parentElement.classList.contains('over')) {
        this._drawAt()
        this.dispatchEvent({ type: 'out' })
      }
      if (e.type === 'pointerup' && this._dragging) {
        this.dispatchEvent({ type: 'dragcancel' })
        this._dragging = false
      }
    }
  }
  /** Show panel
  * @api stable
  */
  show() {
    this.element.classList.remove("ol-collapsed")
    this._addListeners()
    this.dispatchEvent({ type: 'show', show: true })
  }
  /** Hide panel
  * @api stable
  */
  hide() {
    this.element.classList.add("ol-collapsed")
    this._removeListeners()
    this.dispatchEvent({ type: 'show', show: false })
  }
  /** Toggle panel
  * @api stable
  */
  toggle() {
    if (this.isShown()) this.hide()
    else this.show()
  }
  /** Is panel visible
  */
  isShown() {
    return (!this.element.classList.contains("ol-collapsed"))
  }
  /** Get selection
   * @param {number} starting point
   * @param {number} ending point
   * @return {Array<ol.coordinate>}
   */
  getSelection(start, end) {
    var sel = []
    var min = Math.max(Math.min(start, end), 0)
    var max = Math.min(Math.max(start, end), this.tab_.length - 1)
    for (var i = min; i <= max; i++) {
      sel.push(this.tab_[i][3])
    }
    return sel
  }
  /** Draw the graph
   * @private
   */
  _drawGraph(t, style) {
    if (!t.length)
      return

    function closeSegment(inX, outX) {
        if (style.getStroke()) {
            var stringColor = style.getStroke().getColor()
            ctx.strokeStyle = stringColor ? ol_color_asString(stringColor) : '#000'
            ctx.lineWidth = style.getStroke().getWidth() * ratio
            ctx.setLineDash([])
            ctx.stroke()
          }

        if (style.getFill()) {
            var fillColor = style.getFill().getColor()
            ctx.fillStyle = fillColor ? ol_color_asString(fillColor) : '#000'
            ctx.Style = fillColor ? ol_color_asString(fillColor) : '#000'
            ctx.lineTo(outX * scx, 0)
            ctx.lineTo(inX * scx, 0)  
            ctx.fill()
          }
    }

    var ctx = this.canvas_.getContext('2d')
    var scx = this.scale_[0]
    var scy = this.scale_[1]
    var dy = this.dy_
    var ratio = this.ratio
    var i, p, inX, outX, hasToCloseSegment = false

    // Draw Path
    ctx.beginPath()
    for (i = 0; p = t[i]; i++) {
      if (i == 0)
        ctx.moveTo(p[0] * scx, p[1] * scy + dy)
      else {
        if (p[1]) {
            hasToCloseSegment = true;
            if (!inX) inX = p[0];
            outX = p[0];
            ctx.lineTo(p[0] * scx, p[1] * scy + dy)
        } else {
          if (hasToCloseSegment) {
              closeSegment(inX, outX)
              hasToCloseSegment = false
              inX = null
              outX =  null
          }  
          if (t[i+1]) {
            ctx.beginPath()
            ctx.moveTo(t[i+1][0] * scx, t[i+1][1] * scy + dy)
          }
        }
      }    
    }

    if (hasToCloseSegment)
        closeSegment(inX, outX)
    

  }
  /**
   * Set the geometry to draw the profile.
   * @param {ol.Feature|ol.geom.Geometry} f the feature.
   * @param {Object=} options
   *  @param {ol.ProjectionLike} [options.projection] feature projection, default projection of the map
   *  @param {('m'|'km'|'ft'|'mi')} [options.zunit='m'] 'm', 'km', 'ft' or 'mi', default 'm' or 'ft' according to the System of measurement
   *  @param {('m'|'km'|'ft'|'mi')} [options.unit='km'] 'm', 'km', 'ft' or 'mi', default 'km' or 'mi' according to the System of measurement
   *  @param {Number|undefined} [options.zmin=0] default 0
   *  @param {Number|undefined} [options.zmax] default max Z of the feature
   *  @param {integer|undefined} [options.zDigits=0] number of digits for z graduation, default is calculated according to the value range
   *  @param {integer|undefined} [options.xDigits=1] number of digits for x-axis (distance), default 1
   *  @param {number} [options.zDigitsHover=2] Decimals number while hovering the profile graph, default 2 
   *  @param {number} [options.xDigitsHover=1] Decimals number while hovering the profile graph, default 1
   *  @param {integer|undefined} [options.zMaxChars] maximum number of chars to be used for z graduation before switching to scientific notation
   *  @param {Number|undefined} [options.graduation=100] length of each z graduation step, default 100. If `zSteps` is provided, this is not used
   *  @param {integer|undefined} [options.amplitude] amplitude of the altitude, default zmax-zmin
   *  @param {integer|undefined} [options.xSteps] number of steps at the x-axis (distance), default 10. If not provided, default is calculated from the distance
   *  @param {integer|undefined} [options.zSteps] number of steps at the amplitude scale. If not provided, default is calculated from graduation
   * @api stable
   */
  setGeometry(g, options) {
    if (!options)
      options = {}
    if (g instanceof ol_Feature)
      g = g.getGeometry()
    this._geometry = [g, options]

    // No Z
    if (!/Z/.test(g.getLayout()))
      return
    // No time
    if (/M/.test(g.getLayout()))
      this.element.querySelector(".time").parentElement.style.display = 'block'
    else
      this.element.querySelector(".time").parentElement.style.display = 'none'

    // Coords
    var c = g.getCoordinates()
    switch (g.getType()) {
      case "LineString": break
      case "MultiLineString": c = c[0]; break
      default: return
    }

    // Distance beetween 2 coords
    var proj = options.projection || this.getMap().getView().getProjection()
    function dist2d(p1, p2) {
      return ol_sphere_getDistance(
        ol_proj_transform(p1, proj, 'EPSG:4326'),
        ol_proj_transform(p2, proj, 'EPSG:4326')
      )
    }

    function getTime(t0, t1) {
      if (!t0 || !t1)
        return "-"
      var dt = (t1 - t0) / 60 // mn
      var ti = Math.trunc(dt / 60)
      var mn = Math.trunc(dt - ti * 60)
      return ti + "h" + (mn < 10 ? "0" : "") + mn + "mn"
    }

    // Calculate [distance, altitude, time, point] for each points
    var zmin = Infinity, zmax = -Infinity
    var i, p, d, z, ti, t = this.tab_ = []
    for (i = 0, p; p = c[i]; i++) {
      z = p[2]
      if (z < zmin)
        zmin = z
      if (z > zmax)
        zmax = z
      if (i == 0)
        d = 0
      else
        d += dist2d(c[i - 1], p)
      ti = getTime(c[0][3], p[3])
      t.push([d, z, ti, p])
    }

    this._z = [zmin, zmax]

    this.setProperties({
      'graduation': options.graduation || 100,
      'zmin': options.zmin,
      'zmax': options.zmax,
      'amplitude': options.amplitude,
      'unit': options.unit,
      'zunit': options.zunit,
      'zDigits': typeof options.zDigits === 'number' ? options.zDigits : 0,
      'xDigits': typeof options.xDigits === 'number' ? options.xDigits : 1,
      'zDigitsHover': typeof options.zDigitsHover === 'number' ? options.zDigitsHover : 2,
      'xDigitsHover': typeof options.xDigitsHover === 'number' ? options.xDigitsHover : 1,
      'zMaxChars': options.zMaxChars,
      'xSteps': options.xSteps,
      'zSteps': options.zSteps,
    })

    this.dispatchEvent({ type: 'change:geometry', geometry: g })

    this.refresh()
  }
  /** Refresh the profile
   */
  refresh() {
    var canvas = this.canvas_
    var ctx = canvas.getContext('2d')
    var w = canvas.width
    var h = canvas.height
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, w, h)

    var zmin = this._z[0]
    var zmax = this._z[1]
    var t = this.tab_

    var d = t[t.length - 1][0]
    var ti = t[t.length - 1][2]
    var i

    if (!d) {
      console.error('[ol/control/Profile] no data...', t)
      return
    }

    // Margin
    ctx.setTransform(1, 0, 0, 1, this.margin_.left, h - this.margin_.bottom)
    var ratio = this.ratio

    w -= this.margin_.right + this.margin_.left
    h -= this.margin_.top + this.margin_.bottom
    // Draw axes
    var textFillColor = this._style.getText().getFill().getColor()
    ctx.strokeStyle = textFillColor ? ol_color_asString(textFillColor) : '#000'
    ctx.lineWidth = 0.5 * ratio
    ctx.beginPath()
    ctx.moveTo(0, 0); ctx.lineTo(0, -h)
    ctx.moveTo(0, 0); ctx.lineTo(w, 0)
    ctx.stroke()

    // Info
    this.element.querySelector(".track-info .zmin").textContent = zmin.toFixed(2) + this.info.altitudeUnits
    this.element.querySelector(".track-info .zmax").textContent = zmax.toFixed(2) + this.info.altitudeUnits

    var zminunit = (this._isMetric) ? ol_control_Profile.prototype.Unit.Meter : ol_control_Profile.prototype.Unit.Foot
    var zminConverted = this._unitsConversion(zmin, zminunit)
    this.element.querySelector(".track-info .zmin").textContent = this._numberFormat(zminConverted, this.get('zDigitsHover')) + zminunit

    var zmaxnunit = (this._isMetric) ? ol_control_Profile.prototype.Unit.Meter : ol_control_Profile.prototype.Unit.Foot
    var zmaxConverted = this._unitsConversion(zmax, zmaxnunit)
    this.element.querySelector(".track-info .zmax").textContent = this._numberFormat(zmaxConverted, this.get('zDigitsHover')) + zmaxnunit

    var dunit;
    if (this._isMetric) {
      dunit = (d > 1000) ? ol_control_Profile.prototype.Unit.Kilometer : ol_control_Profile.prototype.Unit.Meter
    } else {
      dunit = (d > ol_control_Profile.prototype.MILE_VALUE) ? ol_control_Profile.prototype.Unit.Mile : ol_control_Profile.prototype.Unit.Foot
    }
    var dConverted = this._unitsConversion(d, dunit)
    this.element.querySelector(".track-info .dist").textContent = this._numberFormat(dConverted, this.get('xDigitsHover')) + dunit

    this.element.querySelector(".track-info .time").textContent = ti

    var zSteps = this.get('zSteps')
    var grad

    if (zSteps) {
      zmax = Math.ceil(zmax)
      zmin = Math.floor(zmin * 10) / 10
      var amp = this.get('amplitude') || (zmax - zmin)
      grad = amp / (zSteps - 1)
    } else {
      // Set graduation
      grad = this.get('graduation')
      while (true) {
        zmax = Math.ceil(zmax / grad) * grad
        zmin = Math.floor(zmin / grad) * grad
        var nbgrad = (zmax - zmin) / grad
        if (h / nbgrad < 15 * ratio) {
          grad *= 2
        }
        else
          break
      }
    }

    // Set amplitude
    if (typeof (this.get('zmin')) == 'number' && zmin > this.get('zmin'))
      zmin = this.get('zmin')
    if (typeof (this.get('zmax')) == 'number' && zmax < this.get('zmax'))
      zmax = this.get('zmax')
    var amplitude = this.get('amplitude')
    if (amplitude) {
      zmax = Math.max(zmin + amplitude, zmax)
    }

    // Scales lines
    var scx = w / d
    var scy = -h / (zmax - zmin)
    var dy = this.dy_ = -zmin * scy
    this.scale_ = [scx, scy]

    this._drawGraph(t, this._style)

    // Draw 
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    var textStrokeColor = this._style.getText().getFill().getColor()
    ctx.fillStyle = textStrokeColor ? ol_color_asString(textStrokeColor) : '#000'

    // Scale Z
    ctx.beginPath()
    var zDigits = this.get('zDigits')
    var zunit = this.get('zunit') || this._isMetric ? ol_control_Profile.prototype.Unit.Meter : ol_control_Profile.prototype.Unit.Foot

    var exp = null
    if (typeof (this.get('zMaxChars')) == 'number') {
      var usedChars
      var zminCon = this._unitsConversion(zmin, zunit)
      var zmaxCon = this._unitsConversion(zmax, zunit)

      usedChars = Math.max(zminCon.toFixed(1).length, zmaxCon.toFixed(1).length)

      if (this.get('zMaxChars') < usedChars) {
        exp = Math.floor(Math.log10(Math.max(Math.abs(zmin), Math.abs(zmax), Number.MIN_VALUE)))
        ctx.font = 'bold ' + (9 * ratio) + 'px arial'
        ctx.fillText(exp.toString(), -8 * ratio, 8 * ratio)
        var expMetrics = ctx.measureText(exp.toString())
        var expWidth = expMetrics.width
        var expHeight = expMetrics.actualBoundingBoxAscent + expMetrics.actualBoundingBoxDescent
        ctx.font = 'bold ' + (12 * ratio) + 'px arial'
        ctx.fillText("10", -8 * ratio - expWidth, 8 * ratio + 0.5 * expHeight)
      }
    }
    ctx.font = (10 * ratio) + 'px arial'
    ctx.textBaseline = 'middle'
    for (i = zmin; i <= zmax; i += grad) {
      var zunitNumber = this._unitsConversion(i, zunit)
      if (exp !== null) {
        var baseNumber = zunitNumber / Math.pow(10, exp)
        var nbDigits = this.get('zMaxChars') - Math.floor(Math.log10(Math.max(Math.abs(baseNumber), 1)) + 1) - 1
        if (baseNumber < 0)
          nbDigits -= 1

        ctx.fillText(baseNumber.toFixed(Math.max(nbDigits, 0)), -4 * ratio, i * scy + dy)
      } else {

        if (typeof zDigits == 'number') {
          zunitNumber = this._numberFormat(zunitNumber, zDigits);
        } else {
          // If `zDigits` is not provided, it's calculated according to the range of values (after the unit conversion)
          // If the diferrece between zmax and zmin is less than `zdif`, use decimals
          var zdif = 10;
          zunitNumber = ((this._unitsConversion(zmax, zunit) - this._unitsConversion(zmin, zunit)) > zdif)
            ? this._numberFormat(zunitNumber, 0)
            : this._numberFormat(zunitNumber, 2);
        }
        ctx.fillText(zunitNumber, -4 * ratio, i * scy + dy)
      }
      ctx.moveTo(-2 * ratio, i * scy + dy)
      if (i != 0)
        ctx.lineTo(d * scx, i * scy + dy)
      else
        ctx.lineTo(0, i * scy + dy)
    }
    // Scale X
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.setLineDash([ratio, 3 * ratio])
    var unit = this.get('unit') || ((this._isMetric) ? ol_control_Profile.prototype.Unit.Kilometer : ol_control_Profile.prototype.Unit.Mile)
    var stepsX = this.get('xSteps')
    var xDigits = this.get('xDigits')
    var maxLimit = unit === ol_control_Profile.prototype.Unit.Mile ? ol_control_Profile.prototype.MILE_VALUE : 1000
    var step

    if (d < maxLimit) {
      // For small distances use the smallers units
      unit = this._isMetric ? ol_control_Profile.prototype.Unit.Meter : ol_control_Profile.prototype.Unit.Foot
    }

    if (typeof stepsX === 'number') {
      step = (d / (stepsX - 1))
    } else {
      if (d > maxLimit) {
        step = Math.round(d / 1000) * 100
        if (step > 1000)
          step = Math.ceil(step / 1000) * 1000
      } else {
        if (d > 100)
          step = Math.round(d / 100) * 10
        else if (d > 10)
          step = Math.round(d / 10)
        else if (d > 1)
          step = Math.round(d) / 10
        else
          step = d
      }
    }

    // Distances / X
    for (i = 0; i <= d; i += step) {
      var num = Number(this._unitsConversion(i, unit).toFixed(xDigits))
      var txt = this._numberFormat(num, xDigits)
      //if (i+step>d) txt += " "+ (options.zunits || "km");
      ctx.fillText(txt, i * scx, 4 * ratio)
      ctx.moveTo(i * scx, 3 * ratio); ctx.lineTo(i * scx, 0)
    }
    ctx.font = (12 * ratio) + "px arial"
    var xOldMethod = this.info.xtitle.search('(km)') // Support for old naming convention and replace unit method
    var xtext = (xOldMethod !== -1) ? this.info.xtitle.replace('(km)', "(" + unit + ")") : this.info.xtitle + " (" + unit + ")"
    ctx.fillText(xtext, w / 2, 18 * ratio)
    ctx.save()
    ctx.rotate(-Math.PI / 2)
    var yOldMethod = this.info.xtitle.search('(m)') // Support for old naming convention and replace unit method
    var ytext = (yOldMethod !== -1) ? this.info.ytitle.replace('(m)', "(" + zunit + ")") : this.info.ytitle + " (" + zunit + ")"
    ctx.fillText(ytext, h / 2, -this.margin_.left)
    ctx.restore()

    ctx.stroke()
  }
  /** Get profile image
  * @param {string|undefined} type image format or 'canvas' to get the canvas image, default image/png.
  * @param {Number|undefined} encoderOptions between 0 and 1 indicating image quality image/jpeg or image/webp, default 0.92.
  * @return {string} requested data uri
  * @api stable
  */
  getImage(type, encoderOptions) {
    if (type === "canvas")
      return this.canvas_
    return this.canvas_.toDataURL(type, encoderOptions)
  }

  /**
   * Convert meters to another system of measurement or unit 
   * @param {number} nMeters 
   * @param {('m'|'km'|'ft'|'mi')} targetUnit default is m
   * @return {number}
   * @api stable
   */
  _unitsConversion(nMeters, targetUnit) {
    targetUnit = targetUnit || ol_control_Profile.prototype.Unit.Meter
    switch (targetUnit) {
      case ol_control_Profile.prototype.Unit.Kilometer:
        return nMeters / ol_control_Profile.prototype.KILOMETER_VALUE;
      case ol_control_Profile.prototype.Unit.Foot:
        return nMeters / ol_control_Profile.prototype.FOOT_VALUE
      case ol_control_Profile.prototype.Unit.Mile:
        return nMeters / ol_control_Profile.prototype.MILE_VALUE
      case ol_control_Profile.prototype.Unit.Meter:
      default:
        return nMeters
    }
  }

  /**
   * Convert numbers to a custom locale format.
   * Enables language-sensitive number formatting using locales with browser native method toLocaleString.
   * This is useful to change the decimal separator as well as to add/change the thousands separator.
   * @param {number|string} number 
   * @param {number} decimals, default is 2
   * @returns {string}
   * @api stable
   */
  _numberFormat(number, decimals = 2) {
    var locale = this.get('numberFormat')
    if (!locale) 
      return Number(number).toFixed(decimals)
    return Number(number).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
  }
}

/** Custom infos list
* @api stable
*/
ol_control_Profile.prototype.info = {
  "zmin": "Zmin",
  "zmax": "Zmax",
  "ytitle": "Altitude", // Unit of measurement is autogenerated
  "xtitle": "Distance", // Unit of measurement is autogenerated
  "time": "Time",
  "altitude": "Altitude",
  "distance": "Distance"
};

// Accepted units
ol_control_Profile.prototype.Unit = {
  Meter: 'm',
  Kilometer: 'km',
  Foot: 'ft',
  Mile: 'mi'
}
// Meter divided by...
ol_control_Profile.prototype.FOOT_VALUE = 0.3048
ol_control_Profile.prototype.MILE_VALUE = 1609.344
ol_control_Profile.prototype.KILOMETER_VALUE = 1000


// For backward compatibility
// eslint-disable-next-line no-unused-vars
var ol_control_Profil = ol_control_Profile;

export default ol_control_Profile