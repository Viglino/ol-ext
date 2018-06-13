/*	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL-B license (French BSD license)
	(http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).

	Usefull function to handle geometric operations
*/

import ol_coordinate from 'ol/coordinate'
import ol_geom_Geometry from 'ol/geom/geometry'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_MultiLineString from 'ol/geom/MultiLineString'
import ol_geom_Polygon from 'ol/geom/polygon'
import ol_geom_MultiPolygon from 'ol/geom/multipolygon'
import ol_geom_GeometryCollection from 'ol/geom/geometrycollection'
import '../render/Cspline'

/**
 * Split a Polygon geom with horizontal lines
 * @param {Array<ol.coordinate>} geom 
 * @param {Number} y the y to split
 * @param {Number} n contour index
 * @return {Array<Array<ol.coordinate>>}
 */
ol_coordinate.splitH = function (geom, y, n) {
  var x, abs;
  var list = [];
  for (var i=0; i<geom.length-1; i++) {
    // Hole separator?
    if (!geom[i].length || !geom[i+1].length) continue;
    // Intersect
    if (geom[i][1]<=y && geom[i+1][1]>y || geom[i][1]>=y && geom[i+1][1]<y) {
      abs = (y-geom[i][1]) / (geom[i+1][1]-geom[i][1]);
      x = abs * (geom[i+1][0]-geom[i][0]) + geom[i][0];
      list.push ({ contour: n, index: i, pt: [x,y], abs: abs });
    }
  }
  // Sort x
  list.sort(function(a,b) { return a.pt[0] - b.pt[0] });
  // Horizontal segement
  var result = [];
  for (var j=0; j<list.length-1; j += 2) {
    result.push([list[j], list[j+1]])
  }
  return result;
};

/**
 * Calculate a MultiPolyline to fill a Polygon with a scribble effect that appears hand-made
 * @param {} options
 *  @param {Number} options.interval interval beetween lines
 *  @param {Number} options.angle hatch angle in radian, default PI/2
 * @return {ol_geom_MultiLineString|null} the resulting MultiLineString geometry or null if none
 */
ol_geom_MultiPolygon.prototype.scribbleFill = function (options) {
  var scribbles = [];
  var poly = this.getPolygons();
  for (var i=0, p; p=poly[i]; i++) {
    var mls = p.scribbleFill(options);
    if (mls) scribbles.push(mls);
  } 
  if (!scribbles.length) return null;
  // Merge scribbles
  var scribble = scribbles[0];
  for (var i=0, s; s=scribbles[i]; i++) {
    ls = s.getLineStrings();
    for (k=0; k<ls.length; k++) {
      scribble.appendLineString(ls[k]);
    }
  }
  return scribble;
};

/**
 * Calculate a MultiPolyline to fill a Polygon with a scribble effect that appears hand-made
 * @param {} options
 *  @param {Number} options.interval interval beetween lines
 *  @param {Number} options.angle hatch angle in radian, default PI/2
 * @return {ol_geom_MultiLineString|null} the resulting MultiLineString geometry or null if none
 */
ol_geom_Polygon.prototype.scribbleFill = function (options) {
	var step = options.interval;
  var angle = options.angle || Math.PI/2;
  
  // Geometry + rotate
	var geom = this.clone();
	geom.rotate(angle, [0,0]);
  var coords = geom.getCoordinates();
  // Merge holes
  var coord = coords[0];
  for (var i=1; i<coords.length; i++) {
    // Add a separator
    coord.push([]);
    // Add the hole
    coord = coord.concat(coords[i]);
  }
  // Extent 
	var ext = geom.getExtent();
  
	// Split polygon with horizontal lines
  var lines = [];
	for (var y = (Math.floor(ext[1]/step)+1)*step; y<ext[3]; y += step) {
    var l = ol_coordinate.splitH(coord, y, i);
    lines = lines.concat(l);
  }
  
  if (!lines.length) return null;
  // Order lines on segment index
  var mod = coord.length-1;
	var first = lines[0][0].index;
	for (var k=0, l; l=lines[k]; k++) {
		lines[k][0].index = (lines[k][0].index-first+mod) % mod;
		lines[k][1].index = (lines[k][1].index-first+mod) % mod;
	}

  var scribble = [];

  while(true) {
    for (var k=0, l; l=lines[k]; k++) {
      if (!l[0].done) break;
    }
    if (!l) break;
    var scrib = [];
    while (l) {
      l[0].done = true;
      scrib.push(l[0].pt);
      scrib.push(l[1].pt);
      var nexty = l[0].pt[1] + step;
      var d0 = Infinity;
      var l2 = null;
      while (lines[k]) {
        if (lines[k][0].pt[1] > nexty) break;
        if (lines[k][0].pt[1] === nexty) {
          var d = Math.min(
            (lines[k][0].index - l[0].index + mod) % mod,
            (l[0].index - lines[k][0].index + mod) % mod
          );
          var d2 = Math.min(
            (l[1].index - l[0].index + mod) % mod,
            (l[0].index - l[1].index + mod) % mod
          );
          if (d<d0 && d<d2) {
            d0 = d;
            if (!lines[k][0].done) l2 = lines[k];
            else l2 = null;
          }
        }
        k++;
      }
      l = l2;
    }
    if (scrib.length) {
      scribble.push(scrib);
    }
  }

  // Return the scribble as MultiLineString
  if (!scribble.length) return null;
  var mline = new ol_geom_MultiLineString(scribble);
  mline.rotate(-angle,[0,0]);
	return mline.cspline({ pointsPerSeg:8, tension:.9 });
};

// import('ol-ext/geom/Scribble')