/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import ol_format_GeoJSON from 'ol/format/GeoJSON'
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
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/ !#$%&\'()*-.:<=>?@[]^_`{|}~';

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
  // Round number
  number = Math.round(number * Math.pow(10, decimals));
  // Zigzag encoding (get positive number)
  if (number<0) number = -2*number - 1;
  else number = 2*number;
  // Encode
  var result = '';
  var modulo, residual = number;
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
  var decode = 0;
  s.split('').forEach(function (c) {
    decode = (decode * this._size) + this._radix.indexOf(c);
  }.bind(this));
  // Zigzag encoding
  var result = Math.floor(decode/2)
  if (result !== decode/2) result = -1-result;
  return result / Math.pow(10, decimals);
};

/** Encode coordinates
 * @param {ol.coordinate|Array<ol.coordinate>} v
 * @param {number} decimal
 * @return {string|Array<string>}
 * @api
 */
ol_format_GeoJSONX.prototype.encodeCoordinates = function(v, decimal) {
  var i;
  if (typeof(v[0]) === 'number') {
    return this._decimals + ';' + this.encodeNumber(v[0], decimal) +','+ this.encodeNumber(v[1], decimal);
  } else if (v.length && v[0]) {
    if (typeof(v[0][0]) === 'number') {
      var dxy=[0,0];
      var xy = [];
      for (i=0; i<v.length; i++) {
        v[i] = [
          Math.round( v[i][0] * Math.pow(10, this._decimals)),
          Math.round( v[i][1] * Math.pow(10, this._decimals))
        ];
        xy[i] = this.encodeNumber(v[i][0]-dxy[0], 0) +','+ this.encodeNumber(v[i][1]-dxy[1], 0);
        dxy = v[i];
      }
      return this._decimals + ';' + xy.join(';');
    } else {
      for (i=0; i<v.length; i++) {
        v[i] = this.encodeCoordinates(v[i]);
      }
      return v;
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
ol_format_GeoJSONX.prototype.decodeCoordinates = function(v, decimals) {
  var i;
  if (typeof(v) === 'string') {
    v = v.split(';');
    decimals = parseInt(v.shift());
    if (v.length>1) {
      var dxy=[0,0];
      v.forEach(function(vi, i) {
        v[i] = vi.split(',');
        v[i][0] = this.decodeNumber(v[i][0], decimals) + dxy[0];
        v[i][1] = this.decodeNumber(v[i][1], decimals) + dxy[1];
        dxy = v[i];
      }.bind(this));
      return v;
    } else {
      v = v[0].split(',');
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
  if (f.geometry.type==='Point') {
    f.geo = this.encodeCoordinates(f.geometry.coordinates)
  } else {
    f.geo = [
      f.geometry.type,
      this.encodeCoordinates(f.geometry.coordinates)
    ];
  }
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
  // Encode geometry
  if (g.type==='Point') {
    return this.encodeCoordinates(g.coordinates)
  } else {
    return [
      g.type,
      this.encodeCoordinates(g.coordinates)
    ];
  }
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
  if (typeof(f.geo) === 'string') {
    f.geometry = {
      type: 'Point',
      coordinates: this.decodeCoordinates(f.geo)
    }  
  } else {
    f.geometry = {
      type: f.geo[0],
      coordinates: this.decodeCoordinates(f.geo[1])
    }
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
