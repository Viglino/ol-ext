import ol_style_Style from 'ol/style/Style.js'
import ol_style_Stroke from 'ol/style/Stroke.js'
import ol_source_Vector from 'ol/source/Vector.js'
import ol_style_Fill from 'ol/style/Fill.js'
import ol_layer_Vector from 'ol/layer/Vector.js'
import ol_geom_Point from 'ol/geom/Point.js'
import ol_Feature from 'ol/Feature.js'
import ol_Collection from 'ol/Collection.js'
import ol_interaction_Pointer from 'ol/interaction/Pointer.js'
import ol_style_RegularShape from 'ol/style/RegularShape.js'
import {fromExtent as ol_geom_Polygon_fromExtent} from 'ol/geom/Polygon.js'
import {boundingExtent as ol_extent_boundingExtent, buffer as ol_extent_buffer, createEmpty as ol_extent_createEmpty, extend as ol_extent_extend, getCenter as ol_extent_getCenter} from 'ol/extent.js'
import {unByKey as ol_Observable_unByKey} from 'ol/Observable.js'
import ol_geom_Polygon from 'ol/geom/Polygon.js'

/** Interaction rotate
 * @constructor
 * @extends {ol_interaction_Pointer}
 * @fires select | rotatestart | rotating | rotateend | translatestart | translating | translateend | scalestart | scaling | scaleend
 * @param {any} options
 *  @param {function} options.filter A function that takes a Feature and a Layer and returns true if the feature may be transformed or false otherwise.
 *  @param {Array<ol.Layer>} options.layers array of layers to transform,
 *  @param {ol.Collection<ol.Feature>} options.features collection of feature to transform,
 *	@param {ol.EventsConditionType|undefined} options.condition A function that takes an ol.MapBrowserEvent and a feature collection and returns a boolean to indicate whether that event should be handled. default: ol.events.condition.always.
 *	@param {ol.EventsConditionType|undefined} options.addCondition A function that takes an ol.MapBrowserEvent and returns a boolean to indicate whether that event should be handled ie. the feature will be added to the transforms features. default: ol.events.condition.never.
 *	@param {number | undefined} options.hitTolerance Tolerance to select feature in pixel, default 0
 *	@param {bool} options.translateFeature Translate when click on feature
 *	@param {bool} options.translate Can translate the feature
 *  @param {bool} options.translateBBox Enable translate when the user drags inside the bounding box
 *	@param {bool} options.stretch can stretch the feature
 *	@param {bool} options.scale can scale the feature
 *	@param {bool} options.rotate can rotate the feature
 *	@param {bool} options.noFlip prevent the feature geometry to flip, default false
 *	@param {bool} options.selection the intraction handle selection/deselection, if not use the select prototype to add features to transform, default true
 *	@param {ol.events.ConditionType | undefined} options.keepAspectRatio A function that takes an ol.MapBrowserEvent and returns a boolean to keep aspect ratio, default ol.events.condition.shiftKeyOnly.
 *	@param {ol.events.ConditionType | undefined} options.modifyCenter A function that takes an ol.MapBrowserEvent and returns a boolean to apply scale & strech from the center, default ol.events.condition.metaKey or ol.events.condition.ctrlKey.
 *	@param {boolean} options.enableRotatedTransform Enable transform when map is rotated
 *	@param {boolean} [options.keepRectangle=false] keep rectangle when possible
 *  @param {number} [options.buffer] Increase the extent used as bounding box, default 0
 *	@param {*} options.style list of ol.style for handles
 *  @param {number|Array<number>|function} [options.pointRadius=0] radius for points or a function that takes a feature and returns the radius (or [radiusX, radiusY]). If not null show handles to transform the points
 */
var ol_interaction_Transform = class olinteractionTransform extends ol_interaction_Pointer {
  constructor(options) {
    options = options || {}
    // Extend pointer
    super({
      handleDownEvent: function(e) { return self.handleDownEvent_(e) },
      handleDragEvent: function(e) { return this.handleDragEvent_(e) },
      handleMoveEvent: function(e) { return this.handleMoveEvent_(e) },
      handleUpEvent: function(e) { return this.handleUpEvent_(e) },
    })
    
    var self = this
    this.selection_ = new ol_Collection()

    // Create a new overlay layer for the sketch
    this.handles_ = new ol_Collection()
    this.overlayLayer_ = new ol_layer_Vector({
      source: new ol_source_Vector({
        features: this.handles_,
        useSpatialIndex: false,
        wrapX: false // For vector editing across the -180° and 180° meridians to work properly, this should be set to false
      }),
      name: 'Transform overlay',
      displayInLayerSwitcher: false,
      // Return the style according to the handle type
      style: function (feature) {
        return (self.style[(feature.get('handle') || 'default') + (feature.get('constraint') || '') + (feature.get('option') || '')])
      },
    })

    // Collection of feature to transform
    this.features_ = options.features
    // Filter or list of layers to transform
    if (typeof (options.filter) === 'function')
      this._filter = options.filter
    this.layers_ = options.layers ? (options.layers instanceof Array) ? options.layers : [options.layers] : null

    this._handleEvent = options.condition || function () { return true }
    this.addFn_ = options.addCondition || function () { return false }
    this.setPointRadius(options.pointRadius)
    /* Translate when click on feature */
    this.set('translateFeature', (options.translateFeature !== false))
    /* Can translate the feature */
    this.set('translate', (options.translate !== false))
    /* Translate when click on the bounding box */
    this.set('translateBBox', (options.translateBBox === true))
    /* Can stretch the feature */
    this.set('stretch', (options.stretch !== false))
    /* Can scale the feature */
    this.set('scale', (options.scale !== false))
    /* Can rotate the feature */
    this.set('rotate', (options.rotate !== false))
    /* Keep aspect ratio */
    this.set('keepAspectRatio', (options.keepAspectRatio || function (e) { return e.originalEvent.shiftKey }))
    /* Modify center */
    this.set('modifyCenter', (options.modifyCenter || function (e) { return e.originalEvent.metaKey || e.originalEvent.ctrlKey }))
    /* Prevent flip */
    this.set('noFlip', (options.noFlip || false))
    /* Handle selection */
    this.set('selection', (options.selection !== false))
    /*  */
    this.set('hitTolerance', (options.hitTolerance || 0))
    /* Enable view rotated transforms */
    this.set('enableRotatedTransform', (options.enableRotatedTransform || false))
    /* Keep rectangle angles 90 degrees */
    this.set('keepRectangle', (options.keepRectangle || false))
    /* Add buffer to the feature's extent */
    this.set('buffer', (options.buffer || 0))

    // Force redraw when changed
    this.on('propertychange', function () {
      this.drawSketch_()
    })

    // setstyle
    this.setDefaultStyle()
  }
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol.Map} map Map.
   * @api stable
   */
  setMap(map) {
    var oldMap = this.getMap()
    if (oldMap) {
      var targetElement = oldMap.getTargetElement()
      oldMap.removeLayer(this.overlayLayer_)
      if (this.previousCursor_ && targetElement) {
        targetElement.style.cursor = this.previousCursor_
      }
      this.previousCursor_ = undefined
    }
    super.setMap(map)
    this.overlayLayer_.setMap(map)
    if (map === null) {
      this.select(null)
    }
    if (map !== null) {
      this.isTouch = /touch/.test(map.getViewport().className)
      this.setDefaultStyle()
    }
  }
  /**
   * Activate/deactivate interaction
   * @param {bool}
   * @api stable
   */
  setActive(b) {
    this.select(null)
    if (this.overlayLayer_) this.overlayLayer_.setVisible(b)
    super.setActive(b)
  }
  /** Set default sketch style
   * @param {Object|undefined} options
   *  @param {ol_style_Stroke} stroke stroke style for selection rectangle
   *  @param {ol_style_Fill} fill fill style for selection rectangle
   *  @param {ol_style_Stroke} pointStroke stroke style for handles
   *  @param {ol_style_Fill} pointFill fill style for handles
   */
  setDefaultStyle(options) {
    options = options || {}
    // Style
    var stroke = options.pointStroke || new ol_style_Stroke({ color: [255, 0, 0, 1], width: 1 })
    var strokedash = options.stroke || new ol_style_Stroke({ color: [255, 0, 0, 1], width: 1, lineDash: [4, 4] })
    var fill0 = options.fill || new ol_style_Fill({ color: [255, 0, 0, 0.01] })
    var fill = options.pointFill || new ol_style_Fill({ color: [255, 255, 255, 0.8] })
    var circle = new ol_style_RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 12 : 6,
      displacement: this.isTouch ? [24, -24] : [12, -12],
      points: 15
    })
    // Old version with no displacement
    if (!circle.setDisplacement)
      circle.getAnchor()[0] = this.isTouch ? -10 : -5
    var bigpt = new ol_style_RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 16 : 8,
      points: 4,
      angle: Math.PI / 4
    })
    var smallpt = new ol_style_RegularShape({
      fill: fill,
      stroke: stroke,
      radius: this.isTouch ? 12 : 6,
      points: 4,
      angle: Math.PI / 4
    })
    function createStyle(img, stroke, fill) {
      return [new ol_style_Style({ image: img, stroke: stroke, fill: fill })]
    }
    /** Style for handles */
    this.style = {
      'default': createStyle(bigpt, strokedash, fill0),
      'translate': createStyle(bigpt, stroke, fill),
      'rotate': createStyle(circle, stroke, fill),
      'rotate0': createStyle(bigpt, stroke, fill),
      'scale': createStyle(bigpt, stroke, fill),
      'scale1': createStyle(bigpt, stroke, fill),
      'scale2': createStyle(bigpt, stroke, fill),
      'scale3': createStyle(bigpt, stroke, fill),
      'scalev': createStyle(smallpt, stroke, fill),
      'scaleh1': createStyle(smallpt, stroke, fill),
      'scalev2': createStyle(smallpt, stroke, fill),
      'scaleh3': createStyle(smallpt, stroke, fill),
    }
    this.drawSketch_()
  }
  /**
   * Set sketch style.
   * @param {style} style Style name: 'default','translate','rotate','rotate0','scale','scale1','scale2','scale3','scalev','scaleh1','scalev2','scaleh3'
   * @param {ol.style.Style|Array<ol.style.Style>} olstyle
   * @api stable
   */
  setStyle(style, olstyle) {
    if (!olstyle)
      return
    if (olstyle instanceof Array)
      this.style[style] = olstyle
    else
      this.style[style] = [olstyle]
    for (var i = 0; i < this.style[style].length; i++) {
      var im = this.style[style][i].getImage()
      if (im) {
        if (style == 'rotate') {
          im.getAnchor()[0] = -5
        }
        if (this.isTouch)
          im.setScale(1.8)
      }
      var tx = this.style[style][i].getText()
      if (tx) {
        if (style == 'rotate')
          tx.setOffsetX(this.isTouch ? 14 : 7)
        if (this.isTouch)
          tx.setScale(1.8)
      }
    }
    this.drawSketch_()
  }
  /** Get Feature at pixel
   * @param {ol.Pixel}
   * @return {ol.feature}
   * @private
   */
  getFeatureAtPixel_(pixel) {
    var self = this
    return this.getMap().forEachFeatureAtPixel(pixel,
      function (feature, layer) {
        var found = false
        // Overlay ?
        if (!layer) {
          if (feature === self.bbox_) {
            if (self.get('translateBBox')) {
              return { feature: feature, handle: 'translate', constraint: '', option: '' }
            } else {
              return false
            }
          }
          self.handles_.forEach(function (f) {
            if (f === feature)
              found = true
          })
          if (found)
            return { feature: feature, handle: feature.get('handle'), constraint: feature.get('constraint'), option: feature.get('option') }
        }
        // No seletion
        if (!self.get('selection')) {
          // Return the currently selected feature the user is interacting with.
          if (self.selection_.getArray().some(function (f) { return feature === f })) {
            return { feature: feature }
          }
          return null
        }
        // filter condition
        if (self._filter) {
          if (self._filter(feature, layer))
            return { feature: feature }
          else
            return null
        }

        // feature belong to a layer
        else if (self.layers_) {
          for (var i = 0; i < self.layers_.length; i++) {
            if (self.layers_[i] === layer)
              return { feature: feature }
          }
          return null
        }

        // feature in the collection
        else if (self.features_) {
          self.features_.forEach(function (f) {
            if (f === feature)
              found = true
          })
          if (found)
            return { feature: feature }
          else
            return null
        }

        // Others
        else
          return { feature: feature }
      },
      { hitTolerance: this.get('hitTolerance') }
    ) || {}
  }
  /** Rotate feature from map view rotation
   * @param {ol.Feature} f the feature
   * @param {boolean} clone clone resulting geom
   * @param {ol.geom.Geometry} rotated geometry
   */
  getGeometryRotateToZero_(f, clone) {
    var origGeom = f.getGeometry()
    var viewRotation = this.getMap().getView().getRotation()
    if (viewRotation === 0 || !this.get('enableRotatedTransform')) {
      return (clone) ? origGeom.clone() : origGeom
    }
    var rotGeom = origGeom.clone()
    rotGeom.rotate(viewRotation * -1, this.getMap().getView().getCenter())
    return rotGeom
  }
  /** Test if rectangle
   * @param {ol.Geometry} geom
   * @returns {boolean}
   * @private
   */
  _isRectangle(geom) {
    if (this.get('keepRectangle') && geom.getType() === 'Polygon') {
      var coords = geom.getCoordinates()[0]
      return coords.length === 5
    }
    return false
  }
  /** Draw transform sketch
  * @param {boolean} draw only the center
  */
  drawSketch_(center) {
    var i, f, geom
    var keepRectangle = this.selection_.item(0) && this._isRectangle(this.selection_.item(0).getGeometry())
    this.overlayLayer_.getSource().clear()
    if (!this.selection_.getLength())
      return
    var viewRotation = this.getMap().getView().getRotation()
    var ext = this.getGeometryRotateToZero_(this.selection_.item(0)).getExtent()
    var coords
    if (keepRectangle) {
      coords = this.getGeometryRotateToZero_(this.selection_.item(0)).getCoordinates()[0].slice(0, 4)
      coords.unshift(coords[3])
    }
    // Clone and extend
    ext = ol_extent_buffer(ext, this.get('buffer'))
    this.selection_.forEach(function (f) {
      var extendExt = this.getGeometryRotateToZero_(f).getExtent()
      ol_extent_extend(ext, extendExt)
    }.bind(this))

    var ptRadius = (this.selection_.getLength() === 1 ? this._pointRadius(this.selection_.item(0)) : 0)
    if (ptRadius && !(ptRadius instanceof Array))
      ptRadius = [ptRadius, ptRadius]

    if (center === true) {
      if (!this.ispt_) {
        this.overlayLayer_.getSource().addFeature(new ol_Feature({ geometry: new ol_geom_Point(this.center_), handle: 'rotate0' }))
        geom = ol_geom_Polygon_fromExtent(ext)
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          geom.rotate(viewRotation, this.getMap().getView().getCenter())
        }
        f = this.bbox_ = new ol_Feature(geom)
        this.overlayLayer_.getSource().addFeature(f)
      }
    } else {
      if (this.ispt_) {
        // Calculate extent arround the point
        var p = this.getMap().getPixelFromCoordinate([ext[0], ext[1]])
        if (p) {
          var dx = ptRadius ? ptRadius[0] || 10 : 10
          var dy = ptRadius ? ptRadius[1] || 10 : 10
          ext = ol_extent_boundingExtent([
            this.getMap().getCoordinateFromPixel([p[0] - dx, p[1] - dy]),
            this.getMap().getCoordinateFromPixel([p[0] + dx, p[1] + dy])
          ])
        }
      }
      geom = keepRectangle ? new ol_geom_Polygon([coords]) : ol_geom_Polygon_fromExtent(ext)
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        geom.rotate(viewRotation, this.getMap().getView().getCenter())
      }
      f = this.bbox_ = new ol_Feature(geom)
      var features = []
      var g = geom.getCoordinates()[0]
      if (!this.ispt_ || ptRadius) {
        features.push(f)
        // Middle
        if (!this.iscircle_ && !this.ispt_ && this.get('stretch') && this.get('scale'))
          for (i = 0; i < g.length - 1; i++) {
            f = new ol_Feature({ geometry: new ol_geom_Point([(g[i][0] + g[i + 1][0]) / 2, (g[i][1] + g[i + 1][1]) / 2]), handle: 'scale', constraint: i % 2 ? "h" : "v", option: i })
            features.push(f)
          }
        // Handles
        if (this.get('scale'))
          for (i = 0; i < g.length - 1; i++) {
            f = new ol_Feature({ geometry: new ol_geom_Point(g[i]), handle: 'scale', option: i })
            features.push(f)
          }
        // Center
        if (this.get('translate') && !this.get('translateFeature')) {
          f = new ol_Feature({ geometry: new ol_geom_Point([(g[0][0] + g[2][0]) / 2, (g[0][1] + g[2][1]) / 2]), handle: 'translate' })
          features.push(f)
        }
      }
      // Rotate
      if (!this.iscircle_ && this.get('rotate')) {
        f = new ol_Feature({ geometry: new ol_geom_Point(g[3]), handle: 'rotate' })
        features.push(f)
      }
      // Add sketch
      this.overlayLayer_.getSource().addFeatures(features)
    }

  }
  /** Select a feature to transform
  * @param {ol.Feature} feature the feature to transform
  * @param {boolean} add true to add the feature to the selection, default false
  */
  select(feature, add) {
    if (!feature) {
      if (this.selection_) {
        this.selection_.clear()
        this.drawSketch_()
      }
      return
    }
    if (!feature.getGeometry || !feature.getGeometry()) return
    // Add to selection
    if (add) {
      this.selection_.push(feature)
    } else {
      var index = this.selection_.getArray().indexOf(feature)
      this.selection_.removeAt(index)
    }
    this.ispt_ = (this.selection_.getLength() === 1 ? (this.selection_.item(0).getGeometry().getType() == "Point") : false)
    this.iscircle_ = (this.selection_.getLength() === 1 ? (this.selection_.item(0).getGeometry().getType() == "Circle") : false)
    this.drawSketch_()
    this.watchFeatures_()
    // select event
    this.dispatchEvent({ type: 'select', feature: feature, features: this.selection_ })
  }
  /** Update the selection collection.
  * @param {ol.Collection<ol.Feature>} features the features to transform
  */
  setSelection(features) {
    this.selection_.clear()
    features.forEach(function (feature) {
      this.selection_.push(feature)
    }.bind(this))

    this.ispt_ = (this.selection_.getLength() === 1 ? (this.selection_.item(0).getGeometry().getType() == "Point") : false)
    this.iscircle_ = (this.selection_.getLength() === 1 ? (this.selection_.item(0).getGeometry().getType() == "Circle") : false)
    this.drawSketch_()
    this.watchFeatures_()
    // select event
    this.dispatchEvent({ type: 'select', features: this.selection_ })
  }
  /** Watch selected features
   * @private
   */
  watchFeatures_() {
    // Listen to feature modification
    if (this._featureListeners) {
      this._featureListeners.forEach(function (l) {
        ol_Observable_unByKey(l)
      })
    }
    this._featureListeners = []
    this.selection_.forEach(function (f) {
      this._featureListeners.push(
        f.on('change', function () {
          if (!this.isUpdating_) {
            this.drawSketch_()
          }
        }.bind(this))
      )
    }.bind(this))
  }
  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `true` to start the drag sequence.
   * @private
   */
  handleDownEvent_(evt) {
    if (!this._handleEvent(evt, this.selection_))
      return
    var sel = this.getFeatureAtPixel_(evt.pixel)
    var feature = sel.feature
    if (this.selection_.getLength()
      && this.selection_.getArray().indexOf(feature) >= 0
      && ((this.ispt_ && this.get('translate')) || this.get('translateFeature'))) {
      sel.handle = 'translate'
    }
    if (sel.handle) {
      this.mode_ = sel.handle
      this.opt_ = sel.option
      this.constraint_ = sel.constraint
      // Save info
      var viewRotation = this.getMap().getView().getRotation()
      this.coordinate_ = evt.coordinate
      this.pixel_ = evt.pixel
      this.geoms_ = []
      this.rotatedGeoms_ = []
      var extent = ol_extent_createEmpty()
      var rotExtent = ol_extent_createEmpty()
      for (var i = 0, f; f = this.selection_.item(i); i++) {
        this.geoms_.push(f.getGeometry().clone())
        extent = ol_extent_extend(extent, f.getGeometry().getExtent())
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          var rotGeom = this.getGeometryRotateToZero_(f, true)
          this.rotatedGeoms_.push(rotGeom)
          rotExtent = ol_extent_extend(rotExtent, rotGeom.getExtent())
        }
      }
      this.extent_ = (ol_geom_Polygon_fromExtent(extent)).getCoordinates()[0]
      if (this.get('enableRotatedTransform') && viewRotation !== 0) {
        this.rotatedExtent_ = (ol_geom_Polygon_fromExtent(rotExtent)).getCoordinates()[0]
      }
      if (this.mode_ === 'rotate') {
        this.center_ = this.getCenter() || ol_extent_getCenter(extent)
        // we are now rotating (cursor down on rotate mode), so apply the grabbing cursor
        var element = evt.map.getTargetElement()
        element.style.cursor = this.Cursors.rotate0
        this.previousCursor_ = element.style.cursor
      } else {
        this.center_ = ol_extent_getCenter(extent)
      }
      this.angle_ = Math.atan2(this.center_[1] - evt.coordinate[1], this.center_[0] - evt.coordinate[0])

      this.dispatchEvent({
        type: this.mode_ + 'start',
        feature: this.selection_.item(0),
        features: this.selection_,
        pixel: evt.pixel,
        coordinate: evt.coordinate
      })
      return true
    }
    else if (this.get('selection')) {
      if (feature) {
        if (!this.addFn_(evt))
          this.selection_.clear()
        var index = this.selection_.getArray().indexOf(feature)
        if (index < 0)
          this.selection_.push(feature)
        else
          this.selection_.removeAt(index)
      } else {
        this.selection_.clear()
      }
      this.ispt_ = this.selection_.getLength() === 1 ? (this.selection_.item(0).getGeometry().getType() == "Point") : false
      this.iscircle_ = (this.selection_.getLength() === 1 ? (this.selection_.item(0).getGeometry().getType() == "Circle") : false)
      this.drawSketch_()
      this.watchFeatures_()
      this.dispatchEvent({ type: 'select', feature: feature, features: this.selection_, pixel: evt.pixel, coordinate: evt.coordinate })
      return false
    }
  }
  /**
   * Get the rotation center
   * @return {ol.coordinate|undefined}
   */
  getCenter() {
    return this.get('center')
  }
  /**
   * Set the rotation center
   * @param {ol.coordinate|undefined} c the center point, default center on the objet
   */
  setCenter(c) {
    return this.set('center', c)
  }
  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @private
   */
  handleDragEvent_(evt) {
    if (!this._handleEvent(evt, this.features_))
      return
    var viewRotation = this.getMap().getView().getRotation()
    var i, j, f, geometry
    var pt0 = [this.coordinate_[0], this.coordinate_[1]]
    var pt = [evt.coordinate[0], evt.coordinate[1]]
    this.isUpdating_ = true
    switch (this.mode_) {
      case 'rotate': {
        var a = Math.atan2(this.center_[1] - pt[1], this.center_[0] - pt[0])
        if (!this.ispt) {
          // var geometry = this.geom_.clone();
          // geometry.rotate(a-this.angle_, this.center_);
          // this.feature_.setGeometry(geometry);
          for (i = 0, f; f = this.selection_.item(i); i++) {
            geometry = this.geoms_[i].clone()
            geometry.rotate(a - this.angle_, this.center_)
            // bug: ol, bad calculation circle geom extent
            if (geometry.getType() == 'Circle')
              geometry.setCenterAndRadius(geometry.getCenter(), geometry.getRadius())
            f.setGeometry(geometry)
          }
        }
        this.drawSketch_(true)
        this.dispatchEvent({
          type: 'rotating',
          feature: this.selection_.item(0),
          features: this.selection_,
          angle: a - this.angle_,
          pixel: evt.pixel,
          coordinate: evt.coordinate
        })
        break
      }
      case 'translate': {
        var deltaX = pt[0] - pt0[0]
        var deltaY = pt[1] - pt0[1]

        //this.feature_.getGeometry().translate(deltaX, deltaY);
        for (i = 0, f; f = this.selection_.item(i); i++) {
          f.getGeometry().translate(deltaX, deltaY)
        }
        this.handles_.forEach(function (f) {
          f.getGeometry().translate(deltaX, deltaY)
        })

        this.coordinate_ = evt.coordinate
        this.dispatchEvent({
          type: 'translating',
          feature: this.selection_.item(0),
          features: this.selection_,
          delta: [deltaX, deltaY],
          pixel: evt.pixel,
          coordinate: evt.coordinate
        })
        break
      }
      case 'scale': {
        var center = this.center_
        if (this.get('modifyCenter')(evt)) {
          var extentCoordinates = this.extent_
          if (this.get('enableRotatedTransform') && viewRotation !== 0) {
            extentCoordinates = this.rotatedExtent_
          }
          center = extentCoordinates[(Number(this.opt_) + 2) % 4]
        }
        var keepRectangle = (this.geoms_.length == 1 && this._isRectangle(this.geoms_[0]))
        var stretch = this.constraint_
        var opt = this.opt_

        var downCoordinate = this.coordinate_
        var dragCoordinate = evt.coordinate
        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          var downPoint = new ol_geom_Point(this.coordinate_)
          downPoint.rotate(viewRotation * -1, center)
          downCoordinate = downPoint.getCoordinates()

          var dragPoint = new ol_geom_Point(evt.coordinate)
          dragPoint.rotate(viewRotation * -1, center)
          dragCoordinate = dragPoint.getCoordinates()
        }

        var scx = ((dragCoordinate)[0] - (center)[0]) / (downCoordinate[0] - (center)[0])
        var scy = ((dragCoordinate)[1] - (center)[1]) / (downCoordinate[1] - (center)[1])
        var displacementVector = [dragCoordinate[0] - downCoordinate[0], (dragCoordinate)[1] - downCoordinate[1]]

        if (this.get('enableRotatedTransform') && viewRotation !== 0) {
          var centerPoint = new ol_geom_Point(center)
          centerPoint.rotate(viewRotation * -1, this.getMap().getView().getCenter())
          center = centerPoint.getCoordinates()
        }

        if (this.get('noFlip')) {
          if (scx < 0)
            scx = -scx
          if (scy < 0)
            scy = -scy
        }

        if (this.constraint_) {
          if (this.constraint_ == "h")
            scx = 1
          else
            scy = 1
        } else {
          if (this.get('keepAspectRatio')(evt)) {
            scx = scy = Math.min(scx, scy)
          }
        }

        for (i = 0, f; f = this.selection_.item(i); i++) {
          geometry = (viewRotation === 0 || !this.get('enableRotatedTransform')) ? this.geoms_[i].clone() : this.rotatedGeoms_[i].clone()
          geometry.applyTransform(function (g1, g2, dim) {
            if (dim < 2) return g2

            if (!keepRectangle) {
              for (j = 0; j < g1.length; j += dim) {
                if (scx != 1)
                  g2[j] = center[0] + (g1[j] - center[0]) * scx
                if (scy != 1)
                  g2[j + 1] = center[1] + (g1[j + 1] - center[1]) * scy
              }
            } else {
              var pointArray = [[6], [0, 8], [2], [4]]
              var pointA = [g1[0], g1[1]]
              var pointB = [g1[2], g1[3]]
              var pointC = [g1[4], g1[5]]
              var pointD = [g1[6], g1[7]]
              var pointA1 = [g1[8], g1[9]]

              if (stretch) {
                var base = (opt % 2 === 0) ? this._countVector(pointA, pointB) : this._countVector(pointD, pointA)
                var projectedVector = this._projectVectorOnVector(displacementVector, base)
                var nextIndex = opt + 1 < pointArray.length ? opt + 1 : 0
                var coordsToChange = [...pointArray[opt], ...pointArray[nextIndex]]

                for (j = 0; j < g1.length; j += dim) {
                  g2[j] = coordsToChange.includes(j) ? g1[j] + projectedVector[0] : g1[j]
                  g2[j + 1] = coordsToChange.includes(j) ? g1[j + 1] + projectedVector[1] : g1[j + 1]
                }
              } else {
                var projectedLeft, projectedRight
                switch (opt) {
                  case 0:
                    displacementVector = this._countVector(pointD, dragCoordinate)
                    projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointC, pointD))
                    projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointA, pointD));
                    [g2[0], g2[1]] = this._movePoint(pointA, projectedLeft);
                    [g2[4], g2[5]] = this._movePoint(pointC, projectedRight);
                    [g2[6], g2[7]] = this._movePoint(pointD, displacementVector);
                    [g2[8], g2[9]] = this._movePoint(pointA1, projectedLeft)
                    break
                  case 1:
                    displacementVector = this._countVector(pointA, dragCoordinate)
                    projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointD, pointA))
                    projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointB, pointA));
                    [g2[0], g2[1]] = this._movePoint(pointA, displacementVector);
                    [g2[2], g2[3]] = this._movePoint(pointB, projectedLeft);
                    [g2[6], g2[7]] = this._movePoint(pointD, projectedRight);
                    [g2[8], g2[9]] = this._movePoint(pointA1, displacementVector)
                    break
                  case 2:
                    displacementVector = this._countVector(pointB, dragCoordinate)
                    projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointA, pointB))
                    projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointC, pointB));
                    [g2[0], g2[1]] = this._movePoint(pointA, projectedRight);
                    [g2[2], g2[3]] = this._movePoint(pointB, displacementVector);
                    [g2[4], g2[5]] = this._movePoint(pointC, projectedLeft);
                    [g2[8], g2[9]] = this._movePoint(pointA1, projectedRight)
                    break
                  case 3:
                    displacementVector = this._countVector(pointC, dragCoordinate)
                    projectedLeft = this._projectVectorOnVector(displacementVector, this._countVector(pointB, pointC))
                    projectedRight = this._projectVectorOnVector(displacementVector, this._countVector(pointD, pointC));
                    [g2[2], g2[3]] = this._movePoint(pointB, projectedRight);
                    [g2[4], g2[5]] = this._movePoint(pointC, displacementVector);
                    [g2[6], g2[7]] = this._movePoint(pointD, projectedLeft)
                    break
                }
              }
            }

            // bug: ol, bad calculation circle geom extent
            if (geometry.getType() == 'Circle') geometry.setCenterAndRadius(geometry.getCenter(), geometry.getRadius())
            return g2
          }.bind(this))
          if (this.get('enableRotatedTransform') && viewRotation !== 0) {
            //geometry.rotate(viewRotation, rotationCenter);
            geometry.rotate(viewRotation, this.getMap().getView().getCenter())
          }
          f.setGeometry(geometry)
        }
        this.drawSketch_()
        this.dispatchEvent({
          type: 'scaling',
          feature: this.selection_.item(0),
          features: this.selection_,
          scale: [scx, scy],
          pixel: evt.pixel,
          coordinate: evt.coordinate
        })
        break
      }
      default: break
    }
    this.isUpdating_ = false
  }
  /**
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleMoveEvent_(evt) {
    if (!this._handleEvent(evt, this.features_))
      return
    // console.log("handleMoveEvent");
    if (!this.mode_) {
      var sel = this.getFeatureAtPixel_(evt.pixel)
      var element = evt.map.getTargetElement()
      if (sel.feature) {
        var c = sel.handle ? this.Cursors[(sel.handle || 'default') + (sel.constraint || '') + (sel.option || '')] : this.Cursors.select

        if (this.previousCursor_ === undefined) {
          this.previousCursor_ = element.style.cursor
        }
        element.style.cursor = c
      } else {
        if (this.previousCursor_ !== undefined)
          element.style.cursor = this.previousCursor_
        this.previousCursor_ = undefined
      }
    }
  }
  /**
   * @param {ol.MapBrowserEvent} evt Map browser event.
   * @return {boolean} `false` to stop the drag sequence.
   */
  handleUpEvent_(evt) {
    // remove rotate0 cursor on Up event, otherwise it's stuck on grab/grabbing
    if (this.mode_ === 'rotate') {
      var element = evt.map.getTargetElement()
      element.style.cursor = this.Cursors.default
      this.previousCursor_ = undefined
    }

    //dispatchEvent
    this.dispatchEvent({
      type: this.mode_ + 'end',
      feature: this.selection_.item(0),
      features: this.selection_,
      oldgeom: this.geoms_[0],
      oldgeoms: this.geoms_
    })

    this.drawSketch_()
    this.mode_ = null
    return false
  }
  /** Set the point radius to calculate handles on points
   *  @param {number|Array<number>|function} [pointRadius=0] radius for points or a function that takes a feature and returns the radius (or [radiusX, radiusY]). If not null show handles to transform the points
   */
  setPointRadius(pointRadius) {
    if (typeof (pointRadius) === 'function') {
      this._pointRadius = pointRadius
    } else {
      this._pointRadius = function () { return pointRadius }
    }
  }
  /** Get the features that are selected for transform
   * @return ol.Collection
   */
  getFeatures() {
    return this.selection_;
  }
  /**
   * @private
   */
  _projectVectorOnVector(displacement_vector, base) {
    var k = (displacement_vector[0] * base[0] + displacement_vector[1] * base[1]) / (base[0] * base[0] + base[1] * base[1]);
    return [base[0] * k, base[1] * k];
  }
  /**
   * @private
   */
  _countVector(start, end) {
    return [end[0] - start[0], end[1] - start[1]];
  }
  /**
   * @private
   */
  _movePoint(point, displacementVector) {
    return [point[0]+displacementVector[0], point[1]+displacementVector[1]];
  }
  
  
}

/** Cursors for transform
*/
ol_interaction_Transform.prototype.Cursors = {
  'default': 'auto',
  'select': 'pointer',
  'translate': 'move',
  'rotate': 'move',
  'rotate0': 'move',
  'scale': 'nesw-resize',
  'scale1': 'nwse-resize',
  'scale2': 'nesw-resize',
  'scale3': 'nwse-resize',
  'scalev': 'ew-resize',
  'scaleh1': 'ns-resize',
  'scalev2': 'ew-resize',
  'scaleh3': 'ns-resize'
};

export default ol_interaction_Transform
