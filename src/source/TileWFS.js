/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_Vector from 'ol/source/Vector.js'
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy.js'
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid.js'
import ol_format_GeoJSON from 'ol/format/GeoJSON.js'
import ol_ext_Ajax from '../util/Ajax.js'

/** A vector source to load WFS at a tile zoom level
 * @constructor
 * @fires tileloadstart
 * @fires tileloadend
 * @fires tileloaderror
 * @fires overload
 * @extends {ol.source.Vector}
 * @param {Object} options
 *  @param {string} [options.version=1.1.0] WFS version to use. Can be either 1.0.0, 1.1.0 or 2.0.0.
 *  @param {string} options.typeName WFS type name parameter
 *  @param {number} options.tileZoom zoom to load the tiles
 *  @param {number} options.maxFeatures maximum features returned in the WFS
 *  @param {number} options.featureLimit maximum features in the source before refresh, default Infinity
 *  @param {boolean} [options.pagination] experimental enable pagination, default no pagination
 */
var ol_source_TileWFS = class olsourceTileWFS extends ol_source_Vector {
  constructor(options) {
    options = options || {}
    if (!options.featureLimit) options.featureLimit = Infinity

    // Tile loading strategy
    var zoom = options.tileZoom || 14
    var sourceOpt = {
      strategy: ol_loadingstrategy_tile(ol_tilegrid_createXYZ({ minZoom: zoom, maxZoom: zoom, tileSize: 512 }))
    }

    // Loading params
    var format = new ol_format_GeoJSON()
    var url = options.url
      + '?service=WFS'
      + '&request=GetFeature'
      + '&version=' + (options.version || '1.1.0')
      + '&typename=' + (options.typeName || '')
      + '&outputFormat=application/json'
    if (options.maxFeatures) {
      url += '&maxFeatures=' + options.maxFeatures + '&count=' + options.maxFeatures
    }

    var loader = { loading: 0, loaded: 0 }

    // Loading fn
    sourceOpt.loader = function (extent, resolution, projection) {
      if (loader.loading === loader.loaded) {
        loader.loading = loader.loaded = 0
        if (this.getFeatures().length > options.maxFeatures) {
          this.clear()
          this.refresh()
        }
      }
      loader.loading++
      this.dispatchEvent({
        type: 'tileloadstart',
        loading: loader.loading,
        loaded: loader.loaded
      })
      this._loadTile(url, extent, projection, format, loader)
    }

    super(sourceOpt)

    this.set('pagination', options.pagination)
  }
  /**
   *
   */
  _loadTile(url, extent, projection, format, loader) {
    var req = url
      + '&srsname=' + projection.getCode()
      + '&bbox=' + extent.join(',') + ',' + projection.getCode()
    if (this.get('pagination') && !/&startIndex/.test(url)) {
      req += '&startIndex=0'
    }
    ol_ext_Ajax.get({
      url: req,
      success: function (response) {
        loader.loaded++
        if (response.error) {
          this.dispatchEvent({
            type: 'tileloaderror',
            error: response,
            loading: loader.loading,
            loaded: loader.loaded
          })
        } else {
          // Load features
          var features = format.readFeatures(response, {
            featureProjection: projection
          })
          if (features.length > 0) {
            this.addFeatures(features)
          }
          // Next page?
          let pos = response.numberReturned || 0
          if (/&startIndex/.test(url)) {
            pos += parseInt(url.replace(/.*&startIndex=(\d*).*/, '$1'))
            url = url.replace(/&startIndex=(\d*)/, '')
          }
          // Still something to load ?
          if (pos < response.totalFeatures) {
            if (!this.get('pagination')) {
              this.dispatchEvent({ type: 'overload', total: response.totalFeatures, returned: response.numberReturned })
              this.dispatchEvent({
                type: 'tileloadend',
                loading: loader.loading,
                loaded: loader.loaded
              })
            } else {
              url += '&startIndex=' + pos
              loader.loaded--
              this._loadTile(url, extent, projection, format, loader)
            }
          } else {
            this.dispatchEvent({
              type: 'tileloadend',
              loading: loader.loading,
              loaded: loader.loaded
            })
          }
        }
      }.bind(this),
      error: function (e) {
        loader.loaded++
        this.dispatchEvent({
          type: 'tileloaderror',
          error: e,
          loading: loader.loading,
          loaded: loader.loaded
        })
      }.bind(this)
    })
  }
}

export default ol_source_TileWFS
