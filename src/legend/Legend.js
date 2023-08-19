import ol_Object from 'ol/Object.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_Collection from 'ol/Collection.js'
import {DEVICE_PIXEL_RATIO as ol_has_DEVICE_PIXEL_RATIO} from 'ol/has.js'
import {toContext as ol_render_toContext} from 'ol/render.js'
import {asString as ol_color_asString} from 'ol/color.js'
import ol_Feature from 'ol/Feature.js'
import ol_geom_Point from 'ol/geom/Point.js'
import ol_geom_LineString from 'ol/geom/LineString.js';
import ol_geom_Polygon from 'ol/geom/Polygon.js'
import {extend as ol_extent_extend} from 'ol/extent.js'
import ol_ext_element from '../util/element.js'
import ol_style_Text from 'ol/style/Text.js'
import ol_style_Fill from 'ol/style/Fill.js'
import ol_legend_Item from './Item.js'
import ol_legend_Image from './Image.js'

/** Legend class to draw features in a legend element
 * @constructor
 * @fires select
 * @fires refresh
 * @param {*} options
 *  @param {String} options.title Legend title
 *  @param {number} [options.maxWidth] maximum legend width
 *  @param {ol.size} [options.size] Size of the symboles in the legend, default [40, 25]
 *  @param {number} [options.margin=10] Size of the symbole's margin, default 10
 *  @param { ol.layer.Base } [layer] layer associated with the legend
 *  @param { ol.style.Text} [options.textStyle='16px sans-serif'] a text style for the legend, default 16px sans-serif
 *  @param { ol.style.Text} [options.titleStyle='bold 16px sans-serif'] a text style for the legend title, default textStyle + bold
 *  @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} options.style a style or a style function to use with features
 */
var ol_legend_Legend = class ollegendLegend extends ol_Object {
  constructor(options) {
    super()
    options = options || {}

    // Handle item collection
    this._items = new ol_Collection()
    var listeners = []
    var tout
    this._items.on('add', function (e) {
      listeners.push({
        item: e.element,
        on: e.element.on('change', function () {
          this.refresh()
        }.bind(this))
      })
      if (tout) {
        clearTimeout(tout)
        tout = null
      }
      tout = setTimeout(function () { this.refresh() }.bind(this), 0)
    }.bind(this))
    this._items.on('remove', function (e) {
      for (var i = 0; i < listeners; i++) {
        if (e.element === listeners[i].item) {
          ol_Observable_unByKey(listeners[i].on)
          listeners.splice(i, 1)
          break
        }
      }
      if (tout) {
        clearTimeout(tout)
        tout = null
      }
      tout = setTimeout(function () { this.refresh() }.bind(this), 0)
    }.bind(this))

    // List item element
    this._listElement = ol_ext_element.create('UL', {
      className: 'ol-legend'
    })
    // Legend canvas
    this._canvas = document.createElement('canvas')
    // Set layer
    this.setLayer(options.layer)

    // Properties
    this.set('maxWidth', options.maxWidth, true)
    this.set('size', options.size || [40, 25], true)
    this.set('margin', options.margin === 0 ? 0 : options.margin || 10, true)
    this._textStyle = options.textStyle || new ol_style_Text({
      font: '16px sans-serif',
      fill: new ol_style_Fill({
        color: '#333'
      }),
      backgroundFill: new ol_style_Fill({
        color: 'rgba(255,255,255,.8)'
      })
    })
    this._title = new ol_legend_Item({ title: options.title || '', className: 'ol-title' })

    if (options.titleStyle) {
      this._titleStyle = options.titleStyle
    } else {
      this._titleStyle = this._textStyle.clone()
      this._titleStyle.setFont('bold ' + this._titleStyle.getFont())
    }

    this.setStyle(options.style)

    if (options.items instanceof Array) {
      options.items.forEach(function (item) {
        this.addItem(item)
      }.bind(this))
    }

    this.refresh()
  }
  /** Get a symbol image for a given legend item
   * @param {olLegendItemOptions} item
   * @param {Canvas|undefined} canvas a canvas to draw in, if none creat one
   * @param {int|undefined} offsetY Y offset to draw in canvas, default 0
   */
  static getLegendImage(item, canvas, offsetY) {
    item = item || {}
    if (typeof (item.margin) === 'undefined'){
      item.margin = 10
    }
    var size = item.size || [40, 25]
    if (item.width) size[0] = item.width
    if (item.heigth) size[1] = item.heigth
    item.onload = item.onload || function () {
      setTimeout(function () {
        ol_legend_Legend.getLegendImage(item, canvas, offsetY)
      }, 100)
    }
    var width = size[0] + 2 * item.margin
    var height = item.lineHeight || (size[1] + 2 * item.margin)
    var ratio = item.pixelratio || ol_has_DEVICE_PIXEL_RATIO
    if (!canvas) {
      offsetY = 0
      canvas = document.createElement('canvas')
      canvas.width = width * ratio
      canvas.height = height * ratio
    }

    var ctx = canvas.getContext('2d')
    ctx.save()
    var vectorContext = ol_render_toContext(ctx, { pixelRatio: ratio })

    var typeGeom = item.typeGeom
    var style
    var feature = item.feature
    if (!feature && typeGeom) {
      if (/Point/.test(typeGeom)){
        feature = new ol_Feature(new ol_geom_Point([0, 0]))
      } else if (/LineString/.test(typeGeom)) {
        feature = new ol_Feature(new ol_geom_LineString([0, 0]))
      } else {
        feature = new ol_Feature(new ol_geom_Polygon([[0, 0]]))
      }
      if (item.properties) {
        feature.setProperties(item.properties)
      }
    }
    if (feature) {
      style = feature.getStyle()
      if (typeof (style) === 'function')
        style = style(feature)
      if (!style) {
        style = typeof (item.style) === 'function' ? item.style(feature) : item.style || []
      }
      typeGeom = feature.getGeometry().getType()
    } else {
      style = []
    }
    if (!(style instanceof Array)) style = [style]

    var cx = width / 2
    var cy = height / 2
    var sx = size[0] / 2
    var sy = size[1] / 2

    var i, s
    // Get point offset
    if (typeGeom === 'Point') {
      var extent = null
      for (i = 0; s = style[i]; i++) {
        var img = s.getImage()
        // Refresh legend on image load
        if (img) {
          var imgElt = img.getPhoto ? img.getPhoto() : img.getImage()
          // Check image is loaded
          if (imgElt && imgElt instanceof HTMLImageElement && !imgElt.naturalWidth) {
            if (typeof (item.onload) === 'function') {
              imgElt.addEventListener('load', function () {
                setTimeout(function () {
                  item.onload()
                }, 100)
              })
            }
            img.load()
          }
          // Check anchor to center the image
          if (img.getAnchor) {
            var anchor = img.getAnchor()
            if (anchor) {
              var si = img.getSize()
              var dx = anchor[0] - si[0]
              var dy = anchor[1] - si[1]
              if (!extent) {
                extent = [dx, dy, dx + si[0], dy + si[1]]
              } else {
                ol_extent_extend(extent, [dx, dy, dx + si[0], dy + si[1]])
              }
            }
          }
        }
      }
      if (extent) {
        cx = cx + (extent[2] + extent[0]) / 2
        cy = cy + (extent[3] + extent[1]) / 2
      }
    }

    // Draw image
    cy += offsetY || 0
    for (i = 0; s = style[i]; i++) {
      vectorContext.setStyle(s)
      ctx.save()
      var geom
      switch (typeGeom) {
        case ol_geom_Point:
        case 'Point':
        case 'MultiPoint': {
          geom = new ol_geom_Point([cx, cy])
          break
        }
        case ol_geom_LineString:
        case 'LineString':
        case 'MultiLineString': {
          // Clip lines
          ctx.rect(item.margin * ratio, 0, size[0] * ratio, canvas.height)
          ctx.clip()
          geom = new ol_geom_LineString([[cx - sx, cy], [cx + sx, cy]])
          break
        }
        case ol_geom_Polygon:
        case 'Polygon':
        case 'MultiPolygon': {
          geom = new ol_geom_Polygon([[[cx - sx, cy - sy], [cx + sx, cy - sy], [cx + sx, cy + sy], [cx - sx, cy + sy], [cx - sx, cy - sy]]])
          break
        }
      }
      // Geometry function?
      if (s.getGeometryFunction()) {
        geom = s.getGeometryFunction()(new ol_Feature(geom))
      }
      vectorContext.drawGeometry(geom)
      ctx.restore()
    }

    ctx.restore()

    return canvas
  }
  /** Set legend title
   * @param {string} title
   */
  setTitle(title) {
    this._title.setTitle(title)
    this.refresh()
  }
  /** Get legend title
   * @returns {string}
   */
  getTitle() {
    return this._title.get('title')
  }
  /** Set the layer associated with the legend
   * @param {ol.layer.Layer} [layer]
   */
  setLayer(layer) {
    if (this._layerListener) ol_Observable_unByKey(this._layerListener)
    this._layer = layer;
    if (layer) {
      this._layerListener = layer.on('change:visible', function() {
        this.refresh();
      }.bind(this))
    } else {
      this._layerListener = null;
    }
  }
  /** Get text Style
   * @returns {ol_style_Text}
   */
  getTextStyle() {
    return this._textStyle
  }
  /** Set legend size
   * @param {ol.size} size
   */
  set(key, value, opt_silent) {
    super.set(key, value, opt_silent)
    if (!opt_silent) this.refresh()
  }
  /** Get legend list element
   * @returns {Element}
   */
  getListElement() {
    return this._listElement
  }
  /** Get legend canvas
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    return this._canvas
  }
  /** Set the style
   * @param { ol.style.Style | Array<ol.style.Style> | ol.StyleFunction | undefined	} style a style or a style function to use with features
   */
  setStyle(style) {
    this._style = style
    this.refresh()
  }
  /** Add a new item to the legend
   * @param {olLegendItemOptions|ol_legend_Item} item
   */
  addItem(item) {
    if (item instanceof ol_legend_Legend) {
      this._items.push(item)
      item.on('refresh', function() { this.refresh(true) }.bind(this))
    } else if (item instanceof ol_legend_Item || item instanceof ol_legend_Image) {
      this._items.push(item)
    } else {
      this._items.push(new ol_legend_Item(item))
    }
  }
  /** Remove an item at index
   * @param {ol_legend_Item} item
   */
  removeItem(item) {
    this._items.remove(item)
  }
  /** Remove an item at index
   * @param {number} index
   */
  removeItemAt(index) {
    this._items.removeAt(index)
  }
  /** Get item collection
   * @param {ol_Collection}
   */
  getItems() {
    return this._items
  }
  /** Draw legend text
   * @private
   */
  _drawText(ctx, text, x, y) {
    ctx.save()
    ctx.scale(ol_has_DEVICE_PIXEL_RATIO, ol_has_DEVICE_PIXEL_RATIO)
    text = text || ''
    var txt = text.split('\n')
    if (txt.length === 1) {
      ctx.fillText(text, x, y)
    } else {
      ctx.textBaseline = 'bottom'
      ctx.fillText(txt[0], x, y)
      ctx.textBaseline = 'top'
      ctx.fillText(txt[1], x, y)
    }
    ctx.restore()
  }
  /** Draw legend text
   * @private
   */
  _measureText(ctx, text) {
    var txt = (text || '').split('\n')
    if (txt.length === 1) {
      return ctx.measureText(text)
    } else {
      var m1 = ctx.measureText(txt[0])
      var m2 = ctx.measureText(txt[1])
      return { width: Math.max(m1.width, m2.width), height: m1.height + m2.height }
    }
  }
  /** Refresh the legend
   */
  refresh(opt_silent) {
    var table = this._listElement
    if (!table) return;
    table.innerHTML = ''
    var margin = this.get('margin')
    var width = this.get('size')[0] + 2 * margin
    var height = this.get('lineHeight') || this.get('size')[1] + 2 * margin

    var canvas = this.getCanvas()
    var ctx = canvas.getContext('2d')
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    var ratio = ol_has_DEVICE_PIXEL_RATIO

    // Canvas size
    var w = Math.min(this.getWidth(), this.get('maxWidth') || Infinity);
    var h = this.getHeight()
    canvas.width = w * ratio
    canvas.height = h * ratio
    canvas.style.height = h + 'px'

    ctx.textBaseline = 'middle'
    ctx.fillStyle = ol_color_asString(this._textStyle.getFill().getColor())

    // Add Title
    if (this.getTitle()) {
      table.appendChild(this._title.getElement([width, height], function (b) {
        this.dispatchEvent({
          type: 'select',
          index: -1,
          symbol: b,
          item: this._title
        })
      }.bind(this)))
      ctx.font = this._titleStyle.getFont()
      ctx.textAlign = 'center'
      this._drawText(ctx, this.getTitle(), canvas.width / ratio / 2, height / 2)
    }
    // Add items
    var offsetY = 0;
    if (this.getTitle()) offsetY = height;
    var nb = 0;
    this._items.forEach(function (r, i) {
      if (r instanceof ol_legend_Legend) {
        if ((!r._layer || r._layer.getVisible()) && r.getCanvas().height) {
          ctx.drawImage(r.getCanvas(), 0, offsetY * ratio)
          var list = r._listElement.querySelectorAll('li')
          for (var l=0; l<list.length; l++) {
            var li = list[l].cloneNode();
            li.innerHTML = list[l].innerHTML;
            table.appendChild(li);
            nb++;
          }
          offsetY += r.getHeight();
        }
      } else {
        if (r instanceof ol_legend_Image) {
          // Title
          if (r.get('title')) {
            table.appendChild(this._title.getElement([width, height], function (b) {
              this.dispatchEvent({
                type: 'select',
                index: -1,
                symbol: b,
                item: this._title
              })
            }.bind(this)))
            ctx.font = r.get('textStyle') ? r.get('textStyle').getFont() : this._titleStyle.getFont()
            if (/\bcenter\b/.test(r.get('className'))) {
              ctx.textAlign = 'center'
              this._drawText(ctx, r.get('title'), canvas.width / ratio / 2, offsetY + height / 2)
            } else {
              this._drawText(ctx, r.get('title'), margin, offsetY + height / 2)
            }
            offsetY += height;
          }
          // Image
          var img = r.getImage()
          try {
            ctx.drawImage(img, 0,0,img.naturalWidth, img.naturalHeight, 0, offsetY * ratio, r.getWidth() * ratio, r.getHeight() * ratio)
          } catch(e) { /* ok */ }
          offsetY += r.getHeight();
        } else {
          var item = r.getProperties()
          var h = item.height || height;
          ctx.textAlign = 'left'
          if (item.feature || item.typeGeom) {
            canvas = this.getLegendImage(item, canvas, offsetY)
            ctx.font = r.get('textStyle') ? r.get('textStyle').getFont() : this._textStyle.getFont()
            this._drawText(ctx, r.get('title'), width + margin, offsetY + h / 2)
          } else {
            ctx.font = r.get('textStyle') ? r.get('textStyle').getFont() : this._titleStyle.getFont()
            if (/\bcenter\b/.test(item.className)) {
              ctx.textAlign = 'center'
              this._drawText(ctx, r.get('title'), canvas.width / ratio / 2, offsetY + h / 2)
            } else {
              this._drawText(ctx, r.get('title'), margin, offsetY + h / 2)
            }
          }
          offsetY += h;
        }
        table.appendChild(r.getElement([width, height], function (b) {
          this.dispatchEvent({
            type: 'select',
            index: i,
            symbol: b,
            item: r
          })
        }.bind(this)))
        nb++;
      }
    }.bind(this))

    this.set('items', nb, true)
    this.dispatchEvent({
      type: 'items',
      nb: nb
    })

    // Done
    if (!opt_silent) {
      this.dispatchEvent({
        type: 'refresh',
        width: width,
        height: (this._items.length + 1) * height
      })
    }
  }
  /** Calculate the legend height
   * @return {number}
   */
  getHeight() {
    // default item height
    var margin = this.get('margin')
    var hitem = this.get('lineHeight') || this.get('size')[1] + 2 * margin
    var height = this.getTitle() ? hitem : 0;
    this._items.forEach(function (r) {
      if (r instanceof ol_legend_Legend) {
        if (!r._layer || r._layer.getVisible()) {
          height += r.getHeight()
        }
      } else if (r instanceof ol_legend_Image) {
        if (r.get('title')) height += hitem; 
        height += r.getHeight()
      } else {
        if (r.get('height')) height += r.get('height') + 2 * margin; 
        else height += hitem
      }
    })
    return height
  }
  /** Calculate the legend height
   * @return {number}
   */
  getWidth() {
    var canvas = this.getCanvas()
    var ctx = canvas.getContext('2d')
    var margin = this.get('margin');
    var width = this.get('size')[0] + 2 * margin

    ctx.font = this._titleStyle.getFont()
    var textWidth = this._measureText(ctx, this.getTitle('title')).width
    this._items.forEach(function (r) {
      if (r instanceof ol_legend_Legend) {
        if (!r._layer || r._layer.getVisible()) {
          textWidth = Math.max(textWidth, r.getWidth())
        }
      } else if (r instanceof ol_legend_Image) {
        textWidth = Math.max(textWidth, r.getWidth())
        if (r.get('title')) {
          ctx.font = r.get('textStyle') ? r.get('textStyle').getFont() : this._titleStyle.getFont()
          textWidth = Math.max(textWidth, this._measureText(ctx, r.get('title')).width)
        }
      } else {
        if (r.get('feature') || r.get('typeGeom')) {
          ctx.font = r.get('textStyle') ? r.get('textStyle').getFont() : this._textStyle.getFont()
          textWidth = Math.max(textWidth, this._measureText(ctx, r.get('title')).width + width)
        } else {
          ctx.font = r.get('textStyle') ? r.get('textStyle').getFont() : this._titleStyle.getFont()
          textWidth = Math.max(textWidth, this._measureText(ctx, r.get('title')).width)
        }
      }
    }.bind(this))
    return textWidth + 2 * margin
  }
  /** Get the image for a style 
   * @param {olLegendItemOptions} item 
   * @param {Canvas|undefined} canvas a canvas to draw in, if none create one
   * @param {int|undefined} offsetY Y offset to draw in canvas, default 0
   * @return {CanvasElement}
   */
  getLegendImage(options, canvas, offsetY) {
    options = options || {};
    var size = this.get('size');
    return ol_legend_Legend.getLegendImage({
      className: options.className,
      feature: options.feature,
      typeGeom: options.typeGeom,
      style: options.style || this._style,
      properties: options.properties,
      margin: options.margin || this.get('margin'),
      size: [ options.width || size[0], options.height || size[1]],
      lineHeight: options.lineHeight || this.get('lineHeight'),
      onload: function() {
        // Force refresh
        this.refresh();
      }.bind(this)
    }, canvas, offsetY);
  }
}
export default ol_legend_Legend
