import {getDistance as ol_sphere_getDistance} from 'ol/sphere'

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
