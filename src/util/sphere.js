/* global ol */

/* Create ol.sphere for backward compatibility with ol < 5.0
 * To use with Openlayers package
 */
if (window.ol && !ol.sphere) {
  ol.sphere = {};

  ol.sphere.getDistance = function (c1, c2, radius) {
    var sphere = new ol.Sphere(radius || 6371008.8);
    return sphere.haversineDistance(c1, c2);
  }

  ol.sphere.getArea = ol.Sphere.getArea;

  ol.sphere.getLength = ol.Sphere.getLength;
}