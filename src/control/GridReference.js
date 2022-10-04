/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_style_Style from 'ol/style/Style.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_style_Fill from 'ol/style/Fill.js'
import ol_style_Text from 'ol/style/Text.js'
import {boundingExtent as ol_extent_boundingExtent} from 'ol/extent.js'
import ol_control_CanvasBase from './CanvasBase.js'

/**
 * Draw a grid reference on the map and add an index.
 *
 * @constructor
 * @extends {ol_control_CanvasBase}
 * @fires select
 * @param {Object=} Control options.
 *  @param {ol_style_Style} options.style Style to use for drawing the grid (stroke and text), default black.
 *  @param {number} options.maxResolution max resolution to display the graticule
 *  @param {ol.extent} options.extent extent of the grid, required
 *  @param {ol.size} options.size number of lines and cols, required
 *  @param {number} options.margin margin to display text (in px), default 0px
 *  @param {ol.source.Vector} options.source source to use for the index, default none (use setIndex to reset the index)
 *  @param {string | function} options.property a property to display in the index or a function that takes a feature and return the name to display in the index, default 'name'.
 *  @param {function|undefined} options.sortFeatures sort function to sort 2 features in the index, default sort on property option
 *  @param {function|undefined} options.indexTitle a function that takes a feature and return the title to display in the index, default the first letter of property option
 *  @param {string} options.filterLabel label to display in the search bar, default 'filter'
 */
var ol_control_GridReference = class olcontrolGridReference extends ol_control_CanvasBase {
  constructor(options) {
    options = options || {}

    // Initialize parent
    var elt = document.createElement("div")
    elt.className = (!options.target ? "ol-control " : "") + "ol-gridreference ol-unselectable " + (options.className || "")

    options.style = options.style || new ol_style_Style({
      stroke: new ol_style_Stroke({ color: "#000", width: 1 }),
      text: new ol_style_Text({
        font: "bold 14px Arial",
        stroke: new ol_style_Stroke({ color: "#fff", width: 2 }),
        fill: new ol_style_Fill({ color: "#000" }),
      })
    })

    super({
      element: elt,
      target: options.target,
      style: options.style
    })

    if (typeof (options.property) == 'function'){
      this.getFeatureName = options.property
    }
    if (typeof (options.sortFeatures) == 'function') {
      this.sortFeatures = options.sortFeatures
    }
    if (typeof (options.indexTitle) == 'function') {
      this.indexTitle = options.indexTitle
    }

    // Set index using the source
    this.source_ = options.source
    if (options.source) {
      this.setIndex(options.source.getFeatures(), options)
      // reload on ready
      options.source.once('change', function () {
        if (options.source.getState() === 'ready') {
          this.setIndex(options.source.getFeatures(), options)
        }
      }.bind(this))
    }

    // Options
    this.set('maxResolution', options.maxResolution || Infinity)
    this.set('extent', options.extent)
    this.set('size', options.size)
    this.set('margin', options.margin || 0)
    this.set('property', options.property || 'name')
    this.set('filterLabel', options.filterLabel || 'filter')
  }
  /**
   * Set the map instance the control is associated with.
   * @param {ol_Map} map The map instance.
   */
  setMap(map) {
    super.setMap(map)
    this.setIndex(this.source_.getFeatures())
  }
  /** Returns the text to be displayed in the index
   * @param {ol.Feature} f the feature
   * @return {string} the text to be displayed in the index
   * @api
   */
  getFeatureName(f) {
    return f.get(this.get('property') || 'name')
  }
  /** Sort function
   * @param {ol.Feature} a first feature
   * @param {ol.Feature} b second feature
   * @return {Number} 0 if a==b, -1 if a<b, 1 if a>b
   * @api
   */
  sortFeatures(a, b) {
    return (this.getFeatureName(a) == this.getFeatureName(b)) ? 0 : (this.getFeatureName(a) < this.getFeatureName(b)) ? -1 : 1
  }
  /** Get the feature title
   * @param {ol.Feature} f
   * @return the first letter of the eature name (getFeatureName)
   * @api
   */
  indexTitle(f) {
    return this.getFeatureName(f).charAt(0)
  }
  /** Display features in the index
   * @param { Array<ol.Feature> | ol.Collection<ol.Feature> } features
   */
  setIndex(features) {
    if (!this.getMap())
      return
    var self = this
    if (features.getArray)
      features = features.getArray()
    features.sort(function (a, b) { return self.sortFeatures(a, b) })
    this.element.innerHTML = ""
    var elt = this.element

    var search = document.createElement("input")
    search.setAttribute('type', 'search')
    search.setAttribute('placeholder', this.get('filterLabel') || 'filter')
    var searchKeyupFunction = function () {
      var v = this.value.replace(/^\*/, '')
      // console.log(v)
      var r = new RegExp(v, 'i')
      var list = ul.querySelectorAll('li')
      Array.prototype.forEach.call(list, function (li) {
        if (li.classList.contains('ol-title')) {
          li.style.display = ''
        } else {
          if (r.test(li.querySelector('.ol-name').textContent))
            li.style.display = ''
          else
            li.style.display = 'none'
        }
      })
      Array.prototype.forEach.call(ul.querySelectorAll("li.ol-title"), function (li) {
        var nextVisible
        var start = false
        for (var i = 0; i < list.length; i++) {
          if (start) {
            if (list[i].classList.contains('ol-title'))
              break
            if (!list[i].style.display) {
              nextVisible = list[i]
              break
            }
          }
          if (list[i] === li)
            start = true
        }
        if (nextVisible)
          li.style.display = ''
        else
          li.style.display = 'none'
      })
    }
    search.addEventListener('search', searchKeyupFunction)
    search.addEventListener('keyup', searchKeyupFunction)
    elt.appendChild(search)

    var ul = document.createElement("ul")
    elt.appendChild(ul)
    var r, title
    features.forEach(function (feat) {
      r = this.getReference(feat.getGeometry().getFirstCoordinate())
      if (r) {
        var name = this.getFeatureName(feat)
        var c = this.indexTitle(feat)
        if (c != title) {
          var li_title = document.createElement("li")
          li_title.classList.add('ol-title')
          li_title.textContent = c
          ul.appendChild(li_title)
        }
        title = c
        var li_ref_name = document.createElement("li")
        var span_name = document.createElement("span")
        span_name.classList.add("ol-name")
        span_name.textContent = name
        li_ref_name.appendChild(span_name)
        var span_ref = document.createElement("span")
        span_ref.classList.add("ol-ref")
        span_ref.textContent = r
        li_ref_name.appendChild(span_ref)
        var feature = feat
        li_ref_name.addEventListener("click", function () {
          this.dispatchEvent({ type: "select", feature: feature })
        }.bind(this))

        ul.appendChild(li_ref_name)
      }
    }.bind(this))
  }
  /** Get reference for a coord
  *	@param {ol.coordinate} coords
  *	@return {string} the reference
  */
  getReference(coords) {
    if (!this.getMap())
      return
    var extent = this.get('extent')
    var size = this.get('size')

    var dx = Math.floor((coords[0] - extent[0]) / (extent[2] - extent[0]) * size[0])
    if (dx < 0 || dx >= size[0])
      return ""
    var dy = Math.floor((extent[3] - coords[1]) / (extent[3] - extent[1]) * size[1])
    if (dy < 0 || dy >= size[1])
      return ""
    return this.getHIndex(dx) + this.getVIndex(dy)
  }
  /** Get vertical index (0,1,2,3...)
   * @param {number} index
   * @returns {string}
   * @api
   */
  getVIndex(index) {
    return index
  }
  /** Get horizontal index (A,B,C...)
   * @param {number} index
   * @returns {string}
   * @api
   */
  getHIndex(index) {
    return String.fromCharCode(65 + index)
  }
  /** Draw the grid
  * @param {ol.event} e postcompose event
  * @private
  */
  _draw(e) {
    if (this.get('maxResolution') < e.frameState.viewState.resolution)
      return

    var ctx = this.getContext(e)
    var canvas = ctx.canvas
    var ratio = e.frameState.pixelRatio

    var w = canvas.width / ratio
    var h = canvas.height / ratio

    var extent = this.get('extent')
    var size = this.get('size')

    var map = this.getMap()
    var ex = ol_extent_boundingExtent([map.getPixelFromCoordinate([extent[0], extent[1]]), map.getPixelFromCoordinate([extent[2], extent[3]])])
    var p0 = [ex[0], ex[1]]
    var p1 = [ex[2], ex[3]]
    var dx = (p1[0] - p0[0]) / size[0]
    var dy = (p1[1] - p0[1]) / size[1]

    ctx.save()
    var margin = this.get('margin')
    ctx.scale(ratio, ratio)

    ctx.strokeStyle = this.getStroke().getColor()
    ctx.lineWidth = this.getStroke().getWidth()

    // Draw grid
    ctx.beginPath()
    var i
    for (i = 0; i <= size[0]; i++) {
      ctx.moveTo(p0[0] + i * dx, p0[1])
      ctx.lineTo(p0[0] + i * dx, p1[1])
    }
    for (i = 0; i <= size[1]; i++) {
      ctx.moveTo(p0[0], p0[1] + i * dy)
      ctx.lineTo(p1[0], p0[1] + i * dy)
    }
    ctx.stroke()

    // Draw text
    ctx.font = this.getTextFont()
    ctx.fillStyle = this.getTextFill().getColor()
    ctx.strokeStyle = this.getTextStroke().getColor()
    var lw = ctx.lineWidth = this.getTextStroke().getWidth()
    var spacing = margin + lw
    ctx.textAlign = 'center'
    var letter, x, y
    for (i = 0; i < size[0]; i++) {
      letter = this.getHIndex(i)
      x = p0[0] + i * dx + dx / 2
      y = p0[1] - spacing
      if (y < 0) {
        y = spacing
        ctx.textBaseline = 'hanging'
      }
      else
        ctx.textBaseline = 'alphabetic'
      ctx.strokeText(letter, x, y)
      ctx.fillText(letter, x, y)
      y = p1[1] + spacing
      if (y > h) {
        y = h - spacing
        ctx.textBaseline = 'alphabetic'
      }
      else
        ctx.textBaseline = 'hanging'
      ctx.strokeText(letter, x, y)
      ctx.fillText(letter, x, y)
    }
    ctx.textBaseline = 'middle'
    for (i = 0; i < size[1]; i++) {
      letter = this.getVIndex(i)
      y = p0[1] + i * dy + dy / 2
      ctx.textAlign = 'right'
      x = p0[0] - spacing
      if (x < 0) {
        x = spacing
        ctx.textAlign = 'left'
      }
      else
        ctx.textAlign = 'right'
      ctx.strokeText(letter, x, y)
      ctx.fillText(letter, x, y)
      x = p1[0] + spacing
      if (x > w) {
        x = w - spacing
        ctx.textAlign = 'right'
      }
      else
        ctx.textAlign = 'left'
      ctx.strokeText(letter, x, y)
      ctx.fillText(letter, x, y)
    }

    ctx.restore()
  }
}

export default ol_control_GridReference
