/*	Copyright (c) 2019 Jean-Marc VIGLINO,
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
import ol_source_Vector from 'ol/source/Vector'
import {tile as ol_loadingstrategy_tile} from 'ol/loadingstrategy'
import {createXYZ as ol_tilegrid_createXYZ} from 'ol/tilegrid'
import ol_format_GeoJSON from 'ol/format/GeoJSON'
import {ol_ext_inherits} from '../util/ext'
import ol_ext_Ajax from '../util/Ajax'

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
 */
var ol_source_TileWFS = function (options) {
  options = options || {};
  if (!options.featureLimit) options.featureLimit = Infinity;

  // Tile loading strategy
  var zoom = options.tileZoom || 14;
  var sourceOpt = {
    strategy: ol_loadingstrategy_tile(ol_tilegrid_createXYZ({ minZoom: zoom, maxZoom: zoom, tileSize:512  }))
  };

  // Loading params
  var format = new ol_format_GeoJSON();
  var url = options.url
    + '?service=WFS'
    + '&request=GetFeature'
    + '&version=' + (options.version || '1.1.0')
    + '&typename=' + (options.typeName || '')
    + '&outputFormat=application/json';
  if (options.maxFeatures) {
    url += '&maxFeatures=' + options.maxFeatures + '&count=' + options.maxFeatures;
  }

  var loading = 0;
  var loaded = 0;

  // Loading fn
  sourceOpt.loader = function(extent, resolution, projection) {
    if (loading===loaded) {
      loading = loaded = 0;
      if (this.getFeatures().length > options.maxFeatures) {
        this.clear();
        this.refresh();
      }
    }
    loading++;
    this.dispatchEvent({ 
      type: 'tileloadstart',
      loading: loading, 
      loaded: loaded
    });
    ol_ext_Ajax.get({
      url: url 
        + '&srsname=' + projection.getCode()
        + '&bbox=' + extent.join(',') + ',' + projection.getCode(),
      success: function(response) {
        loaded++;
        if (response.error) {
          this.dispatchEvent({ 
            type: 'tileloaderror', 
            error: response, 
            loading: loading, 
            loaded: loaded 
          });
        } else {
          this.dispatchEvent({ 
            type: 'tileloadend', 
            loading: loading, 
            loaded: loaded 
          });
          var features = format.readFeatures(response, {
            featureProjection: projection
          });
          if (response.totalFeatures && response.totalFeatures !== response.numberReturned) {
            this.dispatchEvent({ type: 'overload', total: response.totalFeatures, returned: response.numberReturned });
          }
          if (features.length > 0) {
            this.addFeatures(features);
          }
        }
      }.bind(this),
      error: function(e) {
        loaded++;
        this.dispatchEvent({
          type: 'tileloaderror',
          error: e,
          loading: loading, 
          loaded: loaded
        });
      }.bind(this)
    })
  }

  ol_source_Vector.call(this, sourceOpt);
};
ol_ext_inherits(ol_source_TileWFS, ol_source_Vector);

export default ol_source_TileWFS
