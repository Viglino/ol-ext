import ol_ext_Ajax from '../util/Ajax.js'
import { ol_geom_createFromType } from './GeomUtils.js'
import ol_geom_Point from 'ol/geom/Point.js'
import ol_geom_LineString from 'ol/geom/LineString.js'

/** French Geoportail alti coding
 * @param {ol.geom.Geometry} geom
 * @param {Object} options
 *  @param {ol/proj~ProjectionLike} [options.projection='EPSG:3857'] geometry projection, default 'EPSG:3857'
 *  @param {string} [options.apiKey='essentiels'] Geoportail API key
 *  @param {number} [options.sampling=0] number of resulting point, max 5000, if none keep input points or use samplingDist
 *  @param {number} [options.samplingDist=0] distance for sampling the line or use sampling if lesser
 *  @param {string} options.success a function that takes the resulting XYZ geometry
 *  @param {string} options.error
 */
var ol_geom_GPAltiCode = function(geom, options) {
  options = options || {};
  var typeGeom = geom.getType();
  if (typeGeom !== 'Point' && typeGeom !== 'LineString') {
    console.warn('[GPAltiCode] '+typeGeom+' not supported...')
    return;
  }
  var proj = options.projection || 'EPSG:3857';
  var sampling = options.sampling || 0;
  if (options.samplingDist) {
    var d = geom.getLength();
    sampling = Math.max(sampling, Math.round(d / options.samplingDist));
  }
  if (sampling > 5000) sampling = 5000;
  if (sampling < 2) sampling = 0;
  geom = geom.clone().transform(proj, 'EPSG:4326');
  var g, lon = [], lat = [];
  switch (typeGeom) {
    case 'Point': {
      g = [geom.getCoordinates()];
      break;
    }
    case 'LineString': {
      g = geom.getCoordinates();
      break;
    }
    default: return;
  }
  if (sampling <= g.length) sampling = 0;
  g.forEach(function(p) {
    lon.push(Math.round(p[0]*1000000)/1000000);
    lat.push(Math.round(p[1]*1000000)/1000000);
  });
  // Get elevation
  var param = 'lon='+lon.join('|')+'&lat='+lat.join('|');
  if (sampling) param += '&sampling='+sampling;
  ol_ext_Ajax.get({
    url: 'https://wxs.ign.fr/'+(options.apiKey || 'essentiels')+'/alti/rest/'+(lon.length>1 ? 'elevationLine' : 'elevation')+'.json?'+param,
    success: function(res) {
      var pts = [];
      res.elevations.forEach(function(e, i) {
        if (sampling) {
          pts.push([e.lon, e.lat, e.z]);
        } else {
          pts.push([g[i][0], g[i][1], e.z]);
        }
      });
      if (typeGeom==='Point') pts = pts[0];
      var result = ol_geom_createFromType(typeGeom, pts);
      result.transform('EPSG:4326', proj);
      if (typeof(options.success) === 'function') options.success(result);
    },
    error: function(e) {
      if (typeof(options.error) === 'function') options.error(e);
    }
  });
}

export { ol_geom_GPAltiCode }

/** Calculate elevation on coordinates or on a set of coordinates
 * @param {ol.coordinate|Array<ol.coordinate>} coord coordinate or an array of coordinates
 * @param {Object} options
 *  @param {ol/proj~ProjectionLike} [options.projection='EPSG:3857'] geometry projection, default 'EPSG:3857'
 *  @param {string} [options.apiKey='essentiels'] Geoportail API key
 *  @param {number} [options.sampling=0] number of resulting point, max 5000, if none keep input points or use samplingDist
 *  @param {number} [options.samplingDist=0] distance for sampling the line or use sampling if lesser
 *  @param {string} options.success a function that takes the resulting XYZ coordinates
 *  @param {string} options.error
 */
var ol_coordinate_GPAltiCode = function(coord, options) {
  options = options || {};
  var unique = !coord[0].length;
  var g = unique ? new ol_geom_Point(coord) : new ol_geom_LineString(coord);
  ol_geom_GPAltiCode(g, {
    projection: options.projection,
    apiKey: options.apiKey,
    sampling: options.sampling,
    samplingDist: options.samplingDist,
    success: function(g) {
      if (typeof(options.success) === 'function') {
        options.success(g.getCoordinates())
      }
    },
    error: options.error
  })
}

export { ol_coordinate_GPAltiCode }
