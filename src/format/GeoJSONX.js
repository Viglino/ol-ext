import ol_format_GeoJSON from 'ol/format/GeoJSON'
import ol_format_Polyline from 'ol/format/Polyline'
import ol_geom_Point from 'ol/geom/Point'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_ext_inherits from '../util/ext'

/** Feature format for reading and writing data in the GeoJSONX format.
 * @constructor 
 * @extends {ol_format_GeoJSON}
 * @param {*} options options.
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
var ol_format_GeoJSONX = function(options) {
  options = options || {};
  ol_format_GeoJSON.call (this, options);
  
  this._lineFormat = new ol_format_Polyline({ factor: options.factor || 1e6 });
  this._hash = {};
  this._count = 0;
};
ol_ext_inherits(ol_format_GeoJSONX, ol_format_GeoJSON);

/** Encode coordinates
 */
ol_format_GeoJSONX.prototype.encodeCoordinates = function(v) {
  var g;
  if (typeof(v[0]) === 'number') {
    g = new ol_geom_Point(v);
    return this._lineFormat.writeGeometry(g);
  } else if (v.length && v[0]) {
    var tab = (typeof(v[0][0]) === 'number');
    if (tab) {
      g = new ol_geom_LineString(v);
      v = this._lineFormat.writeGeometry(g);
    } else {
      for (var i=0; i<v.length; i++) {
        v[i] = this.encodeCoordinates(v[i]);
      }
    }
    return v;
  } else {
    return null;
  }
};

/** Decode coordinates
 */
ol_format_GeoJSONX.prototype.decodeCoordinates = function(v) {
  var i, g;
  if (typeof(v) === 'string') {
    g = this._lineFormat.readGeometry(v);
    return g.getCoordinates()[0];
  } else if (v.length) {
    var tab = (typeof(v[0]) === 'string');
    if (tab) {
      for (i=0; i<v.length; i++) {
        g = this._lineFormat.readGeometry(v[i]);
        v[i] = g.getCoordinates();
      }
    } else {
      for (i=0; i<v.length; i++) {
        v[i] = this.decodeCoordinates(v[i]);
      }
    }
    return v;
  } else {
    return null;
  }
};

/** Encode an array of features as a GeoJSONX object.
 * @param {Array<ol.Feature>} features Features.
 * @param {*} options Write options.
 * @return {*} GeoJSONX Object.
 * @override
 * @api
 */
ol_format_GeoJSONX.prototype.writeFeaturesObject = function (features, options) {
  this._count = 0;
  this._hash = {};
  var geojson = ol_format_GeoJSON.prototype.writeFeaturesObject.call(this, features, options);
  geojson.hashProperties = {};
  Object.keys(this._hash).forEach(function(k) {
    geojson.hashProperties[this._hash[k]] = k;
  }.bind(this));
  return geojson;
};

/** Encode a of features as a GeoJSONX object.
 * @param {ol.Feature} feature Feature
 * @param {*} options Write options.
 * @return {*} GeoJSONX Object.
 * @override
 * @api
 */
ol_format_GeoJSONX.prototype.writeFeatureObject = function(source, options) {
  var f = ol_format_GeoJSON.prototype.writeFeatureObject.call(this, source, options);
  // Encode geometry
  f.geo = [
    f.geometry.type,
    this.encodeCoordinates(f.geometry.coordinates)
  ];
  delete f.geometry;
  // Encode properties
  var prop = {};
  for (var k in f.properties) {
    if (!this._hash[k]) {
      this._hash[k] = this._count.toString(32);
      this._count++;
    }
    prop[this._hash[k]] = f.properties[k];
  }
  f.prop = prop;
  delete f.properties
  return f;
};

/** Encode a geometry as a GeoJSONX object.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {*} opt_options Write options.
 * @return {*} Object.
 * @override
 * @api
 */
ol_format_GeoJSONX.prototype.writeGeometryObject = function(source, options) {
  var g = ol_format_GeoJSON.prototype.writeGeometryObject.call(this, source, options);
  return [
    g.type,
    this.encodeCoordinates(g.coordinates)
  ]
};

ol_format_GeoJSONX.prototype.readFeaturesFromObject = function (object, options) {
  this._hashProperties = object.hashProperties || {};
  return ol_format_GeoJSON.prototype.readFeaturesFromObject.call(this, object, options)
}

/** */
ol_format_GeoJSONX.prototype.readFeatureFromObject = function (f, options) {
  f.geometry = {
    type: f.geo[0],
    coordinates: this.decodeCoordinates(f.geo[1])
  }
  if (this._hashProperties) {
    f.properties = {};
    for (var k in this._hashProperties) {
      f.properties[this._hashProperties[k]] = f.prop[k]
    }
  } else {
    f.properties = f.prop;
  }
  return ol_format_GeoJSON.prototype.readFeatureFromObject.call(this, f, options);
};

export default ol_format_GeoJSONX
