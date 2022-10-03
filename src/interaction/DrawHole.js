/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_geom_Polygon from 'ol/geom/Polygon.js'
import ol_geom_MultiPolygon from 'ol/geom/MultiPolygon.js'
import ol_geom_LinearRing from 'ol/geom/LinearRing.js'
import ol_interaction_Draw from 'ol/interaction/Draw.js'
import ol_interaction_Select from 'ol/interaction/Select.js'

/** Interaction to draw holes in a polygon.
 * It fires a drawstart, drawend event when drawing the hole
 * and a modifystart, modifyend event before and after inserting the hole in the feature geometry.
 * @constructor
 * @extends {ol_interaction_Interaction}
 * @fires drawstart
 * @fires drawend
 * @fires modifystart
 * @fires modifyend
 * @param {olx.interaction.DrawHoleOptions} options extend olx.interaction.DrawOptions
 * 	@param {Array<ol.layer.Vector> | function | undefined} options.layers A list of layers from which polygons should be selected. Alternatively, a filter function can be provided. default: all visible layers
 * 	@param {Array<ol.Feature> | ol.Collection<ol.Feature> | function | undefined} options.featureFilter An array or a collection of features the interaction applies on or a function that takes a feature and a layer and returns true if the feature is a candidate
 * 	@param { ol.style.Style | Array<ol.style.Style> | StyleFunction | undefined }	Style for the selected features, default: default edit style
 */
var ol_interaction_DrawHole = class olinteractionDrawHole extends ol_interaction_Draw {
  constructor(options) {
    options = options || {}
    // Geometry function that test points inside the current selection
    var _geometryFn = function(coordinates, geometry) {
      var coord = coordinates[0].pop()
      if (!this.getPolygon() || this.getPolygon().intersectsCoordinate(coord)) {
        this.lastOKCoord = [coord[0], coord[1]]
      }
      coordinates[0].push([this.lastOKCoord[0], this.lastOKCoord[1]])
  
      if (geometry) {
        geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])])
      } else {
        geometry = new ol_geom_Polygon(coordinates)
      }
      return geometry
    }
    var geomFn = options.geometryFunction
    if (geomFn) {
      options.geometryFunction = function (c, g) {
        g = _geometryFn(c, g)
        return geomFn(c, g)
      }
    } else {
      options.geometryFunction = _geometryFn
    }

    // Create draw interaction
    options.type = 'Polygon';
    super(options)
    
    // Select interaction for the current feature
    this._select = new ol_interaction_Select({ style: options.style })
    this._select.setActive(false)

    // Layer filter function
    if (options.layers) {
      if (typeof (options.layers) === 'function') {
        this.layers_ = options.layers
      } else if (options.layers.indexOf) {
        this.layers_ = function (l) {
          return (options.layers.indexOf(l) >= 0)
        }
      }
    }

    // Features to apply on 
    if (typeof (options.featureFilter) === 'function') {
      this._features = options.featureFilter
    } else if (options.featureFilter) {
      var features = options.featureFilter
      this._features = function (f) {
        if (features.indexOf) {
          return !!features[features.indexOf(f)]
        } else {
          return !!features.item(features.getArray().indexOf(f))
        }
      }
    } else {
      this._features = function () { return true }
    }

    // Start drawing if inside a feature
    this.on('drawstart', this._startDrawing.bind(this))
    // End drawing add the hole to the current Polygon
    this.on('drawend', this._finishDrawing.bind(this))
  }

  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {ol.Map} map Map.
   * @api stable
   */
  setMap(map) {
    // Remove previous selection
    if (this.getMap()) this.getMap().removeInteraction(this._select)
    // Add new one
    if (map) map.addInteraction(this._select)
    super.setMap.call(this, map)
  }
  /**
   * Activate/deactivate the interaction
   * @param {boolean}
   * @api stable
   */
  setActive(b) {
    if (this._select) this._select.getFeatures().clear()
    super.setActive.call(this, b)
  }
  /**
   * Remove last point of the feature currently being drawn
   * (test if points to remove before).
   */
  removeLastPoint() {
    if (this._feature && this._feature.getGeometry().getCoordinates()[0].length > 2) {
      super.removeLastPoint.call(this)
    }
  }
  /**
   * Get the current polygon to hole
   * @return {ol.Feature}
   */
  getPolygon() {
    return this._polygon
    // return this._select.getFeatures().item(0).getGeometry();
  }
  /**
   * Get current feature to add a hole and start drawing
   * @param {ol_interaction_Draw.Event} e
   * @private
   */
  _startDrawing(e) {
    var map = this.getMap()
    this._feature = e.feature
    var coord = e.feature.getGeometry().getCoordinates()[0][0]
    this._current = null
    // Check object under the pointer
    map.forEachFeatureAtPixel(
      map.getPixelFromCoordinate(coord),
      function (feature, layer) {
        // Not yet found?
        if (!this._current && this._features(feature, layer)) {
          var poly = feature.getGeometry()
          if (poly.getType() === "Polygon"
            && poly.intersectsCoordinate(coord)) {
            this._polygonIndex = false
            this._polygon = poly
            this._current = feature
          } else if (poly.getType() === "MultiPolygon"
            && poly.intersectsCoordinate(coord)) {
            for (var i = 0, p; p = poly.getPolygon(i); i++) {
              if (p.intersectsCoordinate(coord)) {
                this._polygonIndex = i
                this._polygon = p
                this._current = feature
                break
              }
            }
          }
        }
      }.bind(this), {
      layerFilter: this.layers_
    }
    )
    this._select.getFeatures().clear()
    if (!this._current) {
      this.setActive(false)
      this.setActive(true)
    } else {
      this._select.getFeatures().push(this._current)
    }
  }
  /**
   * Stop drawing and add the sketch feature to the target feature.
   * @param {ol_interaction_Draw.Event} e
   * @private
   */
  _finishDrawing(e) {
    // The feature is the hole
    e.hole = e.feature
    // Get the current feature
    e.feature = this._select.getFeatures().item(0)
    this.dispatchEvent({ type: 'modifystart', features: [this._current] })
    // Create the hole
    var c = e.hole.getGeometry().getCoordinates()[0]
    if (c.length > 3) {
      if (this._polygonIndex !== false) {
        var geom = e.feature.getGeometry()
        var newGeom = new ol_geom_MultiPolygon([])
        for (var i = 0, pi; pi = geom.getPolygon(i); i++) {
          if (i === this._polygonIndex) {
            pi.appendLinearRing(new ol_geom_LinearRing(c))
            newGeom.appendPolygon(pi)
          } else {
            newGeom.appendPolygon(pi)
          }
        }
        e.feature.setGeometry(newGeom)
      } else {
        this.getPolygon().appendLinearRing(new ol_geom_LinearRing(c))
      }
    }
    this.dispatchEvent({ type: 'modifyend', features: [this._current] })
    // reset
    this._feature = null
    this._select.getFeatures().clear()
  }
  /**
   * Function that is called when a geometry's coordinates are updated.
   * @param {Array<ol.coordinate>} coordinates
   * @param {ol_geom_Polygon} geometry
   * @return {ol_geom_Polygon}
   * @private
   */
  _geometryFn(coordinates, geometry) {
    var coord = coordinates[0].pop()
    if (!this.getPolygon() || this.getPolygon().intersectsCoordinate(coord)) {
      this.lastOKCoord = [coord[0], coord[1]]
    }
    coordinates[0].push([this.lastOKCoord[0], this.lastOKCoord[1]])

    if (geometry) {
      geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])])
    } else {
      geometry = new ol_geom_Polygon(coordinates)
    }
    return geometry
  }
}

export default ol_interaction_DrawHole
