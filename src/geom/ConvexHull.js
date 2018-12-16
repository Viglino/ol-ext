/*
	Copyright (c) 2017 Jean-Marc VIGLINO,
	released under the CeCILL-B license (http://www.cecill.info/).

	ol.coordinate.convexHull compute a convex hull using Andrew's Monotone Chain Algorithm.

	@see https://en.wikipedia.org/wiki/Convex_hull_algorithms
*/

import ol_geom_Geometry from 'ol/geom/Geometry';

var ol_coordinate_convexHull;

(function(){

/** Tests if a point is left or right of line (a,b).
* @param {ol.coordinate} a point on the line
* @param {ol.coordinate} b point on the line
* @param {ol.coordinate} o
* @return {bool} true if (a,b,o) turns clockwise
*/
var clockwise = function (a, b, o) {
  return ((a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]) <= 0);
};

/** Compute a convex hull using Andrew's Monotone Chain Algorithm
 * @param {Array<ol.geom.Point>} points an array of 2D points
 * @return {Array<ol.geom.Point>} the convex hull vertices
 */
ol_coordinate_convexHull = function (points) {	// Sort by increasing x and then y coordinate
  var i;
  points.sort(function(a, b) {
    return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
  });

  // Compute the lower hull
  var lower = [];
  for (i = 0; i < points.length; i++) {
    while (lower.length >= 2 && clockwise(lower[lower.length - 2], lower[lower.length - 1], points[i])) {
      lower.pop();
    }
    lower.push(points[i]);
  }

  // Compute the upper hull
  var upper = [];
  for (i = points.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && clockwise(upper[upper.length - 2], upper[upper.length - 1], points[i])) {
      upper.pop();
    }
    upper.push(points[i]);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
};

/* Get coordinates of a geometry */
var getCoordinates = function (geom) {
  var i, p
  var h = [];
  switch (geom.getType()) {
    case "Point":h.push(geom.getCoordinates());
      break;
    case "LineString":
    case "LinearRing":
    case "MultiPoint":h = geom.getCoordinates();
      break;
    case "MultiLineString":
      p = geom.getLineStrings();
      for (i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]));
      break;
    case "Polygon":
      h = getCoordinates(geom.getLinearRing(0));
      break;
    case "MultiPolygon":
      p = geom.getPolygons();
      for (i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]));
      break;
    case "GeometryCollection":
      p = geom.getGeometries();
      for (i = 0; i < p.length; i++) h.concat(getCoordinates(p[i]));
      break;
    default:break;
  }
  return h;
};

/** Compute a convex hull on a geometry using Andrew's Monotone Chain Algorithm
 * @return {Array<ol.geom.Point>} the convex hull vertices
 */
ol_geom_Geometry.prototype.convexHull = function() {
  return ol_coordinate_convexHull(getCoordinates(this));
};

})();

export default ol_coordinate_convexHull;
