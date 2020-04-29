import ol_format_GeoJSON from 'ol/format/GeoJSON'
import ol_format_Polyline from 'ol/format/Polyline'
import ol_ext_inherits from '../util/ext'

/** Feature format for reading and writing data in the GeoJSONX format.
 * @constructor 
 * @extends {ol_format_GeoJSON}
 * @param {*} options options.
 *  @param {number} options.decimals number of decimals to save, default 7 for EPSG:4326, 2 for other projections
 *  @param {boolean|Array<*>} options.deleteNullProperties An array of property values to remove, if false, keep all properties, default [null,undefined,""]
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
var ol_format_GeoJSONX = function(options) {
  options = options || {};
  ol_format_GeoJSON.call (this, options);
  
  this._lineFormat = new ol_format_Polyline({ factor: options.factor || 1e6 });
  this._hash = {};
  this._count = 0;
  this._deleteNull = options.deleteNullProperties===false ? false : [null,undefined,""];
  var decimals = 2;
  if (!options.dataProjection || options.dataProjection === 'EPSG:4326') decimals = 7;
  if (options.decimals) decimals = options.decimals;
  this._decimals = decimals;
};
ol_ext_inherits(ol_format_GeoJSONX, ol_format_GeoJSON);

/** Radix */
ol_format_GeoJSONX.prototype._radix = 
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/ !#$%&\'()*.:<=>?@[]^_`{|}~';

/** Radix size */
ol_format_GeoJSONX.prototype._size = ol_format_GeoJSONX.prototype._radix.length;

/** Encode a number
 * @param {number} number Number to encode
 * @param {string}
 */
ol_format_GeoJSONX.prototype.encodeNumber = function(number, decimals) {
  if (!decimals && decimals!==0) decimals = this._decimals;
  if (isNaN(Number(number)) || number === null || !isFinite(number)) {
    number = 0;
  }
  if (number < 0) {
    return '-' + this.encodeNumber(-number, decimals);
  }
  // Round number
  number = Math.round(number * Math.pow(10, decimals));
  // Encode
  var result = '';
  var modulo, residual = Math.floor(number);
  while (true) {
    modulo = residual % this._size
    result = this._radix.charAt(modulo) + result;
    residual = Math.floor(residual / this._size);
    if (residual == 0) break;
  }
  return result;
};

/** Decode a number
 * @param {string} s 
 * @return {number}
 */
ol_format_GeoJSONX.prototype.decodeNumber = function(s, decimals) {
  if (!decimals && decimals!==0) decimals = this._decimals;
  var result = 0;
  var sign = 1;
  s.split('').forEach(function (c) {
    if (c === '-') {
      sign = -1;
    } else {
      result = (result * this._size) + this._radix.indexOf(c);
    }
  }.bind(this));
  return sign * result / Math.pow(10, decimals);
};

/** Encode coordinates
 * @param {ol.coordinate|Array<ol.coordinate>} v
 * @return {string|Array<string>}
 * @api
 */
ol_format_GeoJSONX.prototype.encodeCoordinates = function(v) {
  if (typeof(v[0]) === 'number') {
    return this.encodeNumber(v[0]) +','+ this.encodeNumber(v[1]);
  } else if (v.length && v[0]) {
    var line = (typeof(v[0][0]) === 'number');
    if (line) {
      var xmin = Infinity, ymin = Infinity;
      v.forEach(function(vi) {
        xmin = Math.min(xmin, vi[0]);
        ymin = Math.min(ymin, vi[1]);
      });
      xmin = Math.floor(xmin);
      ymin = Math.floor(ymin);
      v.forEach(function(vi) {
        vi[0] -= xmin;
        vi[1] -= ymin;
      });
      this.encodeNumber(xmin);
      this.encodeNumber(ymin);
    }
    for (var i=0; i<v.length; i++) {
      v[i] = this.encodeCoordinates(v[i]);
    }
    if (line) {
      v = this._decimals + ';' + this.encodeNumber(xmin,0)+','+this.encodeNumber(ymin,0)+ ';' + v.join(';');
    }
    return v;
  } else {
    return this.encodeCoordinates([0,0]);
  }
};

/** Decode coordinates
 * @param {string|Array<string>}
 * @return {ol.coordinate|Array<ol.coordinate>} v
 * @api
 */
ol_format_GeoJSONX.prototype.decodeCoordinates = function(v, decimals) {
  var i;
  if (typeof(v) === 'string') {
    if (/;/.test(v)) {
      v = v.split(';');
      var decimals = parseInt(v.shift());
      var min = this.decodeCoordinates(v.shift(), 0);
      v = this.decodeCoordinates(v, decimals);
      v.forEach(function(vi) {
        vi[0] += min[0];
        vi[1] += min[1];
      })
      return v;
    } else {
      v = v.split(',');
      return [ this.decodeNumber(v[0], decimals), this.decodeNumber(v[1], decimals) ];
    }
  } else if (v.length) {
    var r = [];
    for (i=0; i<v.length; i++) {
      r[i] = this.decodeCoordinates(v[i], decimals);
    }
    return r;
  } else {
    return [0,0];
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

/** Encode a set of features as a GeoJSONX object.
 * @param {ol.Feature} feature Feature
 * @param {*} options Write options.
 * @return {*} GeoJSONX Object.
 * @override
 * @api
 */
ol_format_GeoJSONX.prototype.writeFeatureObject = function(source, options) {
  var f = ol_format_GeoJSON.prototype.writeFeatureObject.call(this, source, options);
  delete f.type;
  // Encode geometry
  f.geo = [
    this.encodeCoordinates(f.geometry.coordinates)
  ];
  if (f.geometry.type!=='Point') f.geo.push(f.geometry.type);
  delete f.geometry;
  // Encode properties
  var prop = [];
  var keys = [];
  for (var k in f.properties) {
    if (!this._hash[k]) {
      this._hash[k] = this._count.toString(32);
      this._count++;
    }
    if (!this._deleteNull || this._deleteNull.indexOf(f.properties[k])<0) {
      prop.push (f.properties[k]);
      keys.push(this._hash[k]);
    }
  }
  prop.unshift(keys.join(','));
  f.prop = prop;
  delete f.properties
  return f;
};

/** Encode a geometry as a GeoJSONX object.
 * @param {ol.geom.Geometry} geometry Geometry.
 * @param {*} options Write options.
 * @return {*} Object.
 * @override
 * @api
 */
ol_format_GeoJSONX.prototype.writeGeometryObject = function(source, options) {
  var g = ol_format_GeoJSON.prototype.writeGeometryObject.call(this, source, options);
  var geo = [
    this.encodeCoordinates(g.coordinates)
  ];
  if (g.type!=='Point') geo.push(g.type);
  return geo;
};

/** Decode a GeoJSONX object.
 * @param {*} object GeoJSONX
 * @param {*} options Read options.
 * @return {Array<ol.Feature>}
 * @override
 * @api
 */
ol_format_GeoJSONX.prototype.readFeaturesFromObject = function (object, options) {
  this._hashProperties = object.hashProperties || {};
  var features = ol_format_GeoJSON.prototype.readFeaturesFromObject.call(this, object, options);
  return features;
}

/** Decode GeoJSONX Feature object.
 * @param {*} object GeoJSONX
 * @param {*} options Read options.
 * @return {ol.Feature}
 */
ol_format_GeoJSONX.prototype.readFeatureFromObject = function (f, options) {
  f.type = 'Feature';
  f.geometry = {
    type: f.geo[1] || 'Point',
    coordinates: this.decodeCoordinates(f.geo[0])
  }
  if (this._hashProperties) {
    f.properties = {};
    var keys;
    f.prop.forEach(function(p, i) {
      if (i===0) keys = p.split(',');
      else f.properties[this._hashProperties[keys[i-1]]] = p;
    }.bind(this));
  } else {
    f.properties = f.prop;
  }
  var feature = ol_format_GeoJSON.prototype.readFeatureFromObject.call(this, f, options);
  delete f.type;
  delete f.geometry;
  delete f.properties;
  return feature;
};

export default ol_format_GeoJSONX
