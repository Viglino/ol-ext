/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
import ol_format_GeoJSON from 'ol/format/GeoJSON'
import ol_ext_inherits from '../util/ext'

/** Feature format for reading and writing data in the GeoJSONX format.
 * @constructor 
 * @extends {ol_format_GeoJSON}
 * @param {*} options options.
 *  @param {number} options.decimals number of decimals to save, default 7 for EPSG:4326, 2 for other projections
 *  @param {boolean|Array<*>} options.deleteNullProperties An array of property values to remove, if false, keep all properties, default [null,undefined,""]
 *  @param {boolean|Array<*>} options.extended Decode/encode extended GeoJSON with foreign members (id, bbox, title, etc.), default false
 *  @param {Array<string>|function} options.whiteList A list of properties to keep on features when encoding or a function that takes a property name and retrun true if the property is whitelisted
 *  @param {Array<string>|function} options.blackList A list of properties to remove from features when encoding or a function that takes a property name and retrun true if the property is blacklisted
 *  @param {string} [options.layout='XY'] layout layout (XY or XYZ or XYZM)
 *  @param {ol.ProjectionLike} options.dataProjection Projection of the data we are reading. If not provided `EPSG:4326`
 *  @param {ol.ProjectionLike} options.featureProjection Projection of the feature geometries created by the format reader. If not provided, features will be returned in the dataProjection.
 */
var ol_format_GeoJSONX = function(options) {
  options = options || {};
  ol_format_GeoJSON.call (this, options);
  
  this._hash = {};
  this._count = 0;
  this._extended = options.extended;
  if (typeof(options.whiteList)==='function') {
    this._whiteList = options.whiteList;
  } else if (options.whiteList && options.whiteList.indexOf) {
    this._whiteList = function (k) { return options.whiteList.indexOf(k) > -1 };
  } else {
    this._whiteList = function() { return true };
  } 
  if (typeof(options.blackList)==='function') {
    this._blackList = options.blackList;
  } else if (options.blackList && options.blackList.indexOf) {
    this._blackList = function (k) { return options.blackList.indexOf(k) > -1 };
  } else {
    this._blackList = function() { return false };
  } 
  this._deleteNull = options.deleteNullProperties===false ? false : [null,undefined,""];
  var decimals = 2;
  if (!options.dataProjection || options.dataProjection === 'EPSG:4326') decimals = 7;
  if (!isNaN(parseInt(options.decimals))) decimals = parseInt(options.decimals);
  this._decimals = decimals;
  this.setLayout(options.layout || 'XY');
};
ol_ext_inherits(ol_format_GeoJSONX, ol_format_GeoJSON);

/** Radix */
ol_format_GeoJSONX.prototype._radix = 
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/ !#$%&\'()*-.:<=>?@[]^_`{|}~';

/** Radix size */
ol_format_GeoJSONX.prototype._size = ol_format_GeoJSONX.prototype._radix.length;

/** GeoSJON types */
ol_format_GeoJSONX.prototype._type = {
  "Point": 0,
  "LineString": 1,
  "Polygon": 2,
  "MultiPoint": 3,
  "MultiLineString": 4,
  "MultiPolygon": 5,
  "GeometryCollection": null // Not supported
};

/** GeoSJONX types */
ol_format_GeoJSONX.prototype._toType = [
  "Point",
  "LineString",
  "Polygon",
  "MultiPoint",
  "MultiLineString",
  "MultiPolygon"
];

/** Set geometry layout
 * @param {string} layout the geometry layout (XY or XYZ or XYZM)
 */
ol_format_GeoJSONX.prototype.setLayout = function(layout) {
  switch(layout) {
    case 'XYZ': 
    case 'XYZM': {
      this._layout = layout;
      break;
    }
    default:  {
      this._layout = 'XY';
      break;
    }
  }
};


/** Get geometry layout
 * @return {string} layout 
 */
ol_format_GeoJSONX.prototype.getLayout = function() {
  return this._layout;
};

/** Encode a number
 * @param {number} number Number to encode
 * @param {number} decimals Number of decimals
 * @param {string}
 */
ol_format_GeoJSONX.prototype.encodeNumber = function(number, decimals) {
  if (isNaN(Number(number)) || number === null || !isFinite(number)) {
    number = 0;
  }
  if (!decimals && decimals!==0) decimals = this._decimals;
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
 * @param {number} decimals Number of decimals
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
  var i, p, tp;
  if (typeof(v[0]) === 'number') {
    p = this.encodeNumber(v[0], decimal) +','+ this.encodeNumber(v[1], decimal);
    if (this._layout[2]=='Z' && v.length > 2) p += ',' + this.encodeNumber(v[i][2], 2);
    if (this._layout[3]=='M' && v.length > 3) p += ',' + this.encodeNumber(v[i][3], 0);
    return p;
  } else if (v.length && v[0]) {
    if (typeof(v[0][0]) === 'number') {
      var dxy = [0,0,0,0];
      var xy = [];
      var hasZ = (this._layout[2]=='Z' && v[0].length > 2);
      var hasM = (this._layout[3]=='M' && v[0].length > 3);
      for (i=0; i<v.length; i++) {
        tp = [
          Math.round( v[i][0] * Math.pow(10, decimal)),
          Math.round( v[i][1] * Math.pow(10, decimal))
        ];
        if (hasZ) tp[2] = v[i][2];
        if (hasM) tp[3] = v[i][3];
        v[i] = tp;
        var dx = v[i][0] - dxy[0];
        var dy = v[i][1] - dxy[1];
        if (i==0 || (dx!==0 || dy!==0)) {
          p = this.encodeNumber(dx, 0) +','
            + this.encodeNumber(dy, 0)
            + (hasZ ? ',' + this.encodeNumber(v[i][2] - dxy[2], 2) : '')
            + (hasM ? ',' + this.encodeNumber(v[i][3] - dxy[3], 0) : '');
          xy.push(p);
          dxy = v[i];
        }
      }
      // Almost 2 points...
      // if (xy.length<2) xy.push('A,A');
      return xy.join(';');
    } else {
      for (i=0; i<v.length; i++) {
        v[i] = this.encodeCoordinates(v[i], decimal);
      }
      return v;
    }
  } else {
    return this.encodeCoordinates([0,0], decimal);
  }
};

/** Decode coordinates
 * @param {string|Array<string>}
 * @param {number} decimal Number of decimals
 * @return {ol.coordinate|Array<ol.coordinate>} v
 * @api
 */
ol_format_GeoJSONX.prototype.decodeCoordinates = function(v, decimals) {
  var i, p;
  if (typeof(v) === 'string') {
    v = v.split(';');
    if (v.length>1) {
      var pow = Math.pow(10,decimals);
      var dxy = [0,0,0,0];
      v.forEach(function(vi, i) {
        v[i] = vi.split(',');
        v[i][0] = Math.round((this.decodeNumber(v[i][0], decimals) + dxy[0]) * pow) / pow;
        v[i][1] = Math.round((this.decodeNumber(v[i][1], decimals) + dxy[1]) * pow) / pow;
        if (v[i].length > 2) v[i][2] = Math.round((this.decodeNumber(v[i][2], 2) + dxy[2]) * pow) / pow;
        if (v[i].length > 3) v[i][3] = Math.round((this.decodeNumber(v[i][3], 0) + dxy[3]) * pow) / pow;
        dxy = v[i];
      }.bind(this));
      return v;
    } else {
      v = v[0].split(',');
      p = [ this.decodeNumber(v[0], decimals), this.decodeNumber(v[1], decimals) ];
      if (v.length > 2) p[2] = this.decodeNumber(v[2], 2);
      if (v.length > 3) p[3] = this.decodeNumber(v[3], 0);
      return p;
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
  options = options || {};
  this._count = 0;
  this._hash = {};
  var geojson = ol_format_GeoJSON.prototype.writeFeaturesObject.call(this, features, options);
  geojson.decimals = this._decimals;
  geojson.hashProperties = [];
  Object.keys(this._hash).forEach(function(k) {
    geojson.hashProperties.push(k);
  }.bind(this));
  this._count = 0;
  this._hash = {};
  // Push features at the end of the object
  var temp = geojson.features;
  delete geojson.features;
  geojson.features = temp;
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
  var f0 = ol_format_GeoJSON.prototype.writeFeatureObject.call(this, source, options);
  // Only features supported yet
  if (f0.type !== 'Feature') throw 'GeoJSONX doesn\'t support '+f0.type+'.';
  var f = [];
  // Encode geometry
  if (f0.geometry.type==='Point') {
    f.push(this.encodeCoordinates(f0.geometry.coordinates, this._decimals));
  } else if (f0.geometry.type==='MultiPoint') {
    var pts = [];
    f0.geometry.coordinates.forEach(function(p) {
      pts.push(this.encodeCoordinates(p, this._decimals));
    }.bind(this));
    f.push ([
      this._type[f0.geometry.type],
      pts.join(';')
    ]);
  } else {
    if (!this._type[f0.geometry.type]) {
      throw 'GeoJSONX doesn\'t support '+f0.geometry.type+'.';
    }
    f.push ([
      this._type[f0.geometry.type],
      this.encodeCoordinates(f0.geometry.coordinates, this._decimals)
    ]);
  }
  // Encode properties
  var k;
  var prop = [];
  for (k in f0.properties) {
    if (!this._whiteList(k) || this._blackList(k)) continue;
    if (!this._hash.hasOwnProperty(k)) {
      this._hash[k] = this._count;
      this._count++;
    }
    if (!this._deleteNull || this._deleteNull.indexOf(f0.properties[k])<0) {
      prop.push (this._hash[k], f0.properties[k]);
    }
  }
  // Create prop table
  if (prop.length || this._extended) {
    f.push(prop);
  }
  // Other properties (id, title, bbox, centerline...
  if (this._extended) {
    var found = false;
    prop = {};
    for (k in f0) {
      if (!/^type$|^geometry$|^properties$/.test(k)) {
        prop[k] = f0[k];
        found = true;
      }
    }
    if (found) f.push(prop);
  }
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
    return this.encodeCoordinates(g.coordinates, this._decimals)
  } else {
    return [
      this._type[g.type],
      this.encodeCoordinates(g.coordinates, this._decimals)
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
  this._hashProperties = object.hashProperties || [];
  options = options || {};
  options.decimals = parseInt(object.decimals);
  if (!options.decimals && options.decimals!==0) throw 'Bad file format...';
  var features = ol_format_GeoJSON.prototype.readFeaturesFromObject.call(this, object, options);
  return features;
};

/** Decode GeoJSONX Feature object.
 * @param {*} object GeoJSONX
 * @param {*} options Read options.
 * @return {ol.Feature}
 */
ol_format_GeoJSONX.prototype.readFeatureFromObject = function (f0, options) {
  var f = {
    type: 'Feature'
  }
  if (typeof(f0[0]) === 'string') {
    f.geometry = {
      type: 'Point',
      coordinates: this.decodeCoordinates(f0[0], typeof(options.decimals) === 'number' ? options.decimals : this.decimals)
    }  
  } else {
    f.geometry = {
      type: this._toType[f0[0][0]]
    }
    if (f.geometry.type === 'MultiPoint') {
      var g = f.geometry.coordinates = [];
      var coords = f0[0][1].split(';');
      coords.forEach(function(c) {
        c = c.split(',');
        g.push([this.decodeNumber(c[0], options.decimals), this.decodeNumber(c[1], options.decimals)])
      }.bind(this));
    } else {
      f.geometry.coordinates = this.decodeCoordinates(f0[0][1], typeof(options.decimals) === 'number' ? options.decimals : this.decimals);
    }
  }
  if (this._hashProperties && f0[1]) {
    f.properties = {};
    var t = f0[1];
    for (var i=0; i<t.length; i+=2) {
      f.properties[this._hashProperties[t[i]]] = t[i+1];
    }
  } else {
    f.properties = f0[1];
  }
  // Extended properties
  if (f0[2]) {
    for (var k in f0[2]) {
      f[k] = f0[2][k];
    }
  }
  var feature = ol_format_GeoJSON.prototype.readFeatureFromObject.call(this, f, options);
  return feature;
};

export default ol_format_GeoJSONX
