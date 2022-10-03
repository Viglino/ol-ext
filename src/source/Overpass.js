/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import {bbox as ol_loadingstrategy_bbox} from 'ol/loadingstrategy.js'
import ol_source_Vector from 'ol/source/Vector.js'
import ol_source_OSM from 'ol/source/OSM.js'
import {transformExtent as ol_proj_transformExtent} from 'ol/proj.js'
import ol_format_OSMXML from 'ol/format/OSMXML.js'

/**
 * OSM layer using the Ovepass API
 * @constructor ol_source_Overpass
 * @extends {ol.source.Vector}
 * @param {any} options
 *  @param {string} options.url service url, default: https://overpass-api.de/api/interpreter
 *  @param {Array<string>} options.filter an array of tag filters, ie. ["key", "key=value", "key~value", ...]
 *  @param {boolean} options.node get nodes, default: true
 *  @param {boolean} options.way get ways, default: true
 *  @param {boolean} options.rel get relations, default: false
 *  @param {number} options.maxResolution maximum resolution to load features
 *  @param {string|ol.Attribution|Array<string>} options.attributions source attribution, default OSM attribution
 *  @param {ol.loadingstrategy} options.strategy loading strategy, default ol.loadingstrategy.bbox
 */
var ol_source_Overpass = class olsourceOverpass extends ol_source_Vector {
  constructor(options) {
    options = options || {}

    options.loader = function(extent, resolution, projection) {
      return this._loaderFn(extent, resolution, projection)
    }

    /** Default attribution */
    if (!options.attributions) {
      options.attributions = ol_source_OSM.ATTRIBUTION
    }
    // Bbox strategy : reload at each move
    if (!options.strategy)
      options.strategy = ol_loadingstrategy_bbox

    super(options)

    /** Ovepass API Url */
    this._url = options.url || 'https://overpass-api.de/api/interpreter'

    /** Max resolution to load features  */
    this._maxResolution = options.maxResolution || 100

    this._types = {
      node: options.node !== false,
      way: options.way !== false,
      rel: options.rel === true
    }
    this._filter = options.filter
  }
  /** Loader function used to load features.
  * @private
  */
  _loaderFn(extent, resolution, projection) {
    if (resolution > this._maxResolution) return
    var self = this
    var bbox = ol_proj_transformExtent(extent, projection, "EPSG:4326")
    bbox = bbox[1] + ',' + bbox[0] + ',' + bbox[3] + ',' + bbox[2]

    // Overpass QL
    var query = '[bbox:' + bbox + '][out:xml][timeout:25];'
    query += '('
    // Search attributes
    for (var t in this._types) {
      if (this._types[t]) {
        query += t
        for (var n = 0, filter; filter = this._filter[n]; n++) {
          query += '[' + filter + ']'
        }
        query += ';'
      }
    }
    query += ');out;>;out skel qt;'

    var ajax = new XMLHttpRequest()
    ajax.open('POST', this._url, true)
    ajax.onload = function () {
      var features = new ol_format_OSMXML().readFeatures(this.responseText, { featureProjection: projection })
      var result = []
      // Remove duplicated features
      for (var i = 0, f; f = features[i]; i++) {
        if (!self.hasFeature(f))
          result.push(f)
      }
      self.addFeatures(result)
    }
    ajax.onerror = function () {
      console.log(arguments)
    }
    ajax.send('data=' + query)
  }
  /**
   * Search if feature is allready loaded
   * @param {ol.Feature} feature
   * @return {boolean}
   * @private
   */
  hasFeature(feature) {
    var p = feature.getGeometry().getFirstCoordinate()
    var id = feature.getId()
    var existing = this.getFeaturesInExtent([p[0] - 0.1, p[1] - 0.1, p[0] + 0.1, p[1] + 0.1])
    for (var i = 0, f; f = existing[i]; i++) {
      if (id === f.getId()) {
        return true
      }
    }
    return false
  }
}

export default ol_source_Overpass
