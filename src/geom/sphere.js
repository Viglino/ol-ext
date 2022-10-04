import {getDistance as ol_sphere_getDistance} from 'ol/sphere.js'
import {transform as ol_proj_transform} from 'ol/proj.js'

/** Compute great circle bearing of two points.
 * @See http://www.movable-type.co.uk/scripts/latlong.html for the original code
 * @param {ol.coordinate} origin origin in lonlat
 * @param {ol.coordinate} destination destination in lonlat
 * @return {number} bearing angle in radian
 */
var ol_sphere_greatCircleBearing = function(origin, destination) {
  var toRad = Math.PI/180;
  var ori = [ origin[0]*toRad, origin[1]*toRad ];
  var dest = [ destination[0]*toRad, destination[1]*toRad ];

  var bearing = Math.atan2(
    Math.sin(dest[0] - ori[0]) * Math.cos(dest[1]),
    Math.cos(ori[1]) * Math.sin(dest[1]) - Math.sin(ori[1]) * Math.cos(dest[1]) * Math.cos(dest[0] - ori[0])
  );
  return bearing;
};

export {ol_sphere_greatCircleBearing as greatCircleBearing}

/** 
 * Computes the destination point given an initial point, a distance and a bearing
 * @See http://www.movable-type.co.uk/scripts/latlong.html for the original code
 * @param {ol.coordinate} origin stating point in lonlat coords
 * @param {number} distance
 * @param {number} bearing bearing angle in radian
 * @param {*} options
 *  @param {booelan} normalize normalize longitude beetween -180/180, deafulet true
 *  @param {number|undefined} options.radius sphere radius, default 6371008.8
 */
var ol_sphere_computeDestinationPoint = function(origin, distance, bearing, options) {
  options = options || {};
  var toRad = Math.PI/180;
  var radius = options.radius || 6371008.8;

  var phi1 = origin[1] * toRad;
  var lambda1 = origin[0] * toRad;
  var delta = distance / radius;

  var phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(bearing)
  );

  var lambda2 = lambda1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
    );

  var lon = lambda2 / toRad;
  // normalise to >=-180 and <=180° 
  if (options.normalize!==false && (lon < -180 || lon > 180)) {
    lon = ((lon * 540) % 360) - 180;
  }

  return [ lon, phi2 / toRad ];
};

export {ol_sphere_computeDestinationPoint as computeDestinationPoint}

/** Calculate a track along the great circle given an origin and a destination
 * @param {ol.coordinate} origin origin in lonlat
 * @param {ol.coordinate} destination destination in lonlat
 * @param {number} distance distance between point along the track in meter, default 1km (1000)
 * @param {number|undefined} radius sphere radius, default 6371008.8
 * @return {Array<ol.coordinate>}
 */
var ol_sphere_greatCircleTrack = function(origin, destination, options) {
  options = options || {};
  var bearing = ol_sphere_greatCircleBearing(origin, destination);
  var dist = ol_sphere_getDistance(origin, destination, options.radius);
  var distance = options.distance || 1000;
  var d = distance;
  var geom = [origin];
  while (d < dist) {
    geom.push(ol_sphere_computeDestinationPoint(origin, d, bearing, { radius: options.radius, normalize: false }));
    d += distance;
  }
  var pt = ol_sphere_computeDestinationPoint(origin, dist, bearing, { radius: options.radius, normalize: false });
  if (Math.abs(pt[0]-destination[0]) > 1) {
    if (pt[0] > destination[0]) destination[0] += 360;
    else destination[0] -= 360;
  } 
  geom.push(destination);
  return geom;
};

export {ol_sphere_greatCircleTrack as greatCircleTrack}

/** Get map scale factor
 * @param {ol_Map} map
 * @param {number} [dpi=96] dpi, default 96
 * @return {number}
 */
var ol_sphere_getMapScale = function (map, dpi) {
  var view = map.getView();
  var proj = view.getProjection();
  var center = view.getCenter();
  var px = map.getPixelFromCoordinate(center);
  px[1] += 1;
  var coord = map.getCoordinateFromPixel(px);
  var d = ol_sphere_getDistance(
    ol_proj_transform(center, proj, 'EPSG:4326'),
    ol_proj_transform(coord, proj, 'EPSG:4326'));
  d *= (dpi||96) /.0254
  return d;
};
export {ol_sphere_getMapScale as getMapScale}

/** Set map scale factor
 * @param {ol_Map} map
 * @param {number|string} scale the scale factor or a scale string as 1/xxx
 * @param {number} [dpi=96] dpi, default 96
 * @return {number} scale factor
 */
var ol_sphere_setMapScale = function (map, scale, dpi) {
  if (map && scale) {
    var fac = scale;
    if (typeof(scale)==='string') {
      fac = scale.split('/')[1];
      if (!fac) fac = scale;
      fac = fac.replace(/[^\d]/g,'');
      fac = parseInt(fac);
    }
    if (!fac) return;
    // Calculate new resolution
    var view = map.getView();
    var proj = view.getProjection();
    var center = view.getCenter();
    var px = map.getPixelFromCoordinate(center);
    px[1] += 1;
    var coord = map.getCoordinateFromPixel(px);
    var d = ol_sphere_getDistance(
      ol_proj_transform(center, proj, 'EPSG:4326'),
      ol_proj_transform(coord, proj, 'EPSG:4326'));
    d *= (dpi || 96) /.0254
    view.setResolution(view.getResolution()*fac/d);
    return fac;
  }
};
export {ol_sphere_setMapScale as setMapScale}
