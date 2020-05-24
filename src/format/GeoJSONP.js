import ol_format_GeoJSONX from './GeoJSONX'
import ol_format_Polyline from 'ol/format/Polyline'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_ext_inherits from '../util/ext'

/** Feature format for reading and writing data in the GeoJSONP format,
 * using Polyline Algorithm to encode geometry.
 * @constructor 
 * @extends {ol_format_GeoJSON}
 * @param {*} options options.
 *  @param {number} options.decimals number of decimals to save, default 6
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
var ol_format_GeoJSONP = function(options) {
  options = options || {};
  ol_format_GeoJSONX.call (this, options);
  
  this._lineFormat = new ol_format_Polyline({ factor: Math.pow(10, options.decimals || 6) });
};
ol_ext_inherits(ol_format_GeoJSONP, ol_format_GeoJSONX);

/** Encode coordinates
 * @param {ol.coordinate|Array<ol.coordinate>} v
 * @return {string|Array<string>}
 * @api
 */
ol_format_GeoJSONP.prototype.encodeCoordinates = function(v) {
  var g;
  if (typeof(v[0]) === 'number') {
    g = new ol_geom_Point(v);
    return this._lineFormat.writeGeometry(g);
  } else if (v.length && v[0]) {
    var tab = (typeof(v[0][0]) === 'number');
    if (tab) {
      g = new ol_geom_LineString(v);
      return this._lineFormat.writeGeometry(g);
    } else {
      var r = [];
      for (var i=0; i<v.length; i++) {
        r[i] = this.encodeCoordinates(v[i]);
      }
      return r;
    }
  } else {
    return this.encodeCoordinates([0,0]);
  }
};

/** Decode coordinates
 * @param {string|Array<string>}
 * @return {ol.coordinate|Array<ol.coordinate>} v
 * @api
 */
ol_format_GeoJSONP.prototype.decodeCoordinates = function(v) {
  var i, g;
  if (typeof(v) === 'string') {
    g = this._lineFormat.readGeometry(v);
    return g.getCoordinates()[0];
  } else if (v.length) {
    var tab = (typeof(v[0]) === 'string');
    var r = [];
    if (tab) {
      for (i=0; i<v.length; i++) {
        g = this._lineFormat.readGeometry(v[i]);
        r[i] = g.getCoordinates();
      }
    } else {
      for (i=0; i<v.length; i++) {
        r[i] = this.decodeCoordinates(v[i]);
      }
    }
    return r;
  } else {
    return null;
  }
};

export default ol_format_GeoJSONP
